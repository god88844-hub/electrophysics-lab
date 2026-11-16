// Phase 8 independent reference: GNU RV32IM assembly binary, QEMU's actual
// RISC-V Linux write(), and the JS interpreter's memory at the first ECALL.
// Strictly no mocked oracle, estimated outputs, or physical-validation claim.
import {execFileSync} from 'node:child_process';
import {mkdtemp,rm,readFile,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import {RV32I} from '../js/labs/rv32i/rv32i.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const digest=data=>createHash('sha256').update(data).digest('hex');
const call=(cmd,args,opts={})=>execFileSync(cmd,args,{
  cwd:root,timeout:25000,maxBuffer:2_000_000,...opts,
});
const source=path.join(root,'benchmarks/phase8/rv32m-operations.S');
const manifest=JSON.parse(await readFile(path.join(root,'benchmarks/phase8/acceptance.json'),'utf8'));
const temp=await mkdtemp(path.join(tmpdir(),'invention-lab-rv32m-'));
try{
  assert.equal(manifest.format,'invention-lab/phase8-rv32m-acceptance/1');
  assert.equal(manifest.requiredCases.length,12);
  const object=path.join(temp,'test.o'),elf=path.join(temp,'test.elf'),binaryPath=path.join(temp,'test.bin');
  call('riscv64-unknown-elf-as',['-march=rv32im','-mabi=ilp32',source,'-o',object]);
  call('riscv64-unknown-elf-ld',[
    '-m','elf32lriscv','-Ttext=0x10000','-e','_start','--no-relax',object,'-o',elf,
  ]);
  call('riscv64-unknown-elf-objcopy',['-O','binary',elf,binaryPath]);
  const qemuBytes=call('qemu-riscv32',[elf]);
  const machineBytes=await readFile(binaryPath);
  assert.ok(machineBytes.length>0&&machineBytes.length<65536,'bounded compiled RV32IM program');
  const cpu=new RV32I({program:machineBytes,isa:'rv32im',base:0x10000,startPc:0x10000,memoryBytes:65536,maxTrace:128});
  const js=cpu.run({maxSteps:300});
  assert.equal(js.stopReason,'ecall','JS must stop at real Linux environment-call boundary');
  assert.equal(js.regs[17],64,'expected Linux syscall write, not an emulator-synthesized call');
  assert.equal(js.regs[10],1,'stdout descriptor');
  assert.equal(js.regs[12],48,'12 * 4 bytes');
  const ptr=js.regs[11];
  const offset=ptr-0x10000;
  assert.ok(offset>=0&&offset+48<=cpu.mem.length,'write pointer and 48-byte span within bounded RAM');
  const jsBytes=Buffer.from(cpu.mem.slice(offset,offset+48));
  assert.equal(qemuBytes.length,48,'QEMU must emit exactly 12 raw result words');
  assert.deepEqual(jsBytes,qemuBytes,'full 48-byte architectural differential must match QEMU');
  const cases=manifest.requiredCases.map((entry,index)=>{
    const actualQemu=qemuBytes.readUInt32LE(index*4),actualJs=jsBytes.readUInt32LE(index*4);
    assert.equal(actualQemu,entry.expectedUnsigned,'QEMU differs from frozen expected '+entry.id);
    assert.equal(actualJs,entry.expectedUnsigned,'JS differs from frozen expected '+entry.id);
    return {id:entry.id,operation:entry.operation,
      expectedUnsigned:entry.expectedUnsigned,actualQemu,actualJs,verdict:'pass'};
  });
  const versions={assembler:call('riscv64-unknown-elf-as',['--version'],{encoding:'utf8'}).split('\n')[0],
    linker:call('riscv64-unknown-elf-ld',['--version'],{encoding:'utf8'}).split('\n')[0],
    qemu:call('qemu-riscv32',['--version'],{encoding:'utf8'}).split('\n')[0]};
  const result={
    format:'invention-lab/phase8-rv32m-reference/1',
    commitSha:process.env.GITHUB_SHA||null,
    outcome:'pass',isa:'rv32im',model:'single-hart-architectural',
    source:{path:manifest.source,sha256:digest(await readFile(source))},
    machineCode:{sha256:digest(machineBytes),bytes:machineBytes.length,base:0x10000},
    qemu:{actualOutputSha256:digest(qemuBytes),bytes:qemuBytes.length},
    js:{actualOutputSha256:digest(jsBytes),bytes:jsBytes.length,stopReason:js.stopReason,retired:js.retired},
    versions,cases,
    physicalValidation:'none',realWorldBuildSuccessPercent:null,
    limits:'One bounded 12-word RV32M functional comparison, not an ACT certification, RTL execution, timing model, or silicon validation.',
  };
  const dest=path.join(root,'benchmarks/evidence/phase8-rv32m.json');
  await mkdir(path.dirname(dest),{recursive:true});
  await writeFile(dest,JSON.stringify(result,null,2)+'\n');
  process.stdout.write('PHASE8 QEMU RV32M INDEPENDENT PASS: 12/12 exact 32-bit words, bytes=48, QEMU SHA256='+digest(qemuBytes)+'\n');
}finally{await rm(temp,{recursive:true,force:true});}
