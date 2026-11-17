// Independent Phase 7 reference: GNU assembler/linker + QEMU's RISC-V user
// emulator versus the JavaScript RV32I architectural state. No fake fallback.
// Requires binaries installed by .github/workflows/phase7-oracles.yml.
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { RV32I } from '../js/labs/rv32i/rv32i.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const input = path.join(root,'benchmarks/phase7/rv32i-sum.S');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const invoke = (cmd,args,opts={}) => execFileSync(cmd,args,{
  cwd:root,encoding:'utf8',timeout:20000,maxBuffer:1_000_000,...opts,
});
const tmp = await mkdtemp(path.join(tmpdir(),'invention-lab-rv32i-'));
try {
  const object=path.join(tmp,'rv32i-sum.o');
  const elf=path.join(tmp,'rv32i-sum.elf');
  const bin=path.join(tmp,'rv32i-sum.bin');
  invoke('riscv64-unknown-elf-as',['-march=rv32i','-mabi=ilp32',input,'-o',object]);
  invoke('riscv64-unknown-elf-ld',[
    '-m','elf32lriscv','-Ttext=0x10000','-e','_start',
    '--no-relax',object,'-o',elf,
  ]);
  invoke('riscv64-unknown-elf-objcopy',['-O','binary',elf,bin]);
  const qemu=invoke('qemu-riscv32',[elf]);
  assert.equal(qemu,'g','independent QEMU RV32I program must emit exactly ASCII g (sum 1..10 + 48)');
  const binary = await readFile(bin);
  assert.ok(binary.length>0 && binary.length<65536,'bounded standalone RV32I binary');
  const cpu=new RV32I({program:binary,base:0x10000,startPc:0x10000,memoryBytes:65536,maxTrace:96});
  const state=cpu.run({maxSteps:300});
  assert.equal(state.stopReason,'ecall','JS model must stop at the Linux write environment call, not invent syscall behavior');
  assert.equal(state.regs[17],64,'RISC-V Linux ABI write syscall number');
  assert.equal(state.regs[10],1,'stdout file descriptor');
  assert.equal(state.regs[12],1,'one byte to write');
  const pointer=state.regs[11];
  assert.ok(pointer>=0x10000 && pointer<0x20000,'stdout buffer within flat simulated program RAM');
  const actual=String.fromCharCode(cpu.mem[pointer-0x10000]);
  assert.equal(actual,qemu,'JS simulation of the same GNU-assembled program disagrees with QEMU output');
  assert.equal(state.regs[6],103,'sum-of-1-to-10 arithmetic state must equal g ASCII 103');
  const record={
    format:'invention-lab/phase7-cross-engine/1',
    commitSha:process.env.GITHUB_SHA||null,
    result:'pass',independentReference:'QEMU RISC-V user-mode',
    toolVersions:{
      assembler:invoke('riscv64-unknown-elf-as',['--version']).split('\n')[0],
      linker:invoke('riscv64-unknown-elf-ld',['--version']).split('\n')[0],
      emulator:invoke('qemu-riscv32',['--version']).split('\n')[0],
    },
    source:{path:'benchmarks/phase7/rv32i-sum.S',sha256:digest(await readFile(input))},
    compiled:{sha256:digest(binary),baseAddress:'0x10000',bytes:binary.length},
    assertions:['QEMU stdout exactly g','JS ECALL state reflects write(1,buf,1)',
      'JS RAM buffer byte equals independently emulated QEMU stdout','JS x6 equals 103'],
    compare:{stdout:qemu,jsBuffer:actual,jsRegisterX6:state.regs[6],retired:state.retired},
    scope:'one bounded RV32I bare user program; not ISA certification',
    physicalValidation:'none',
    realWorldBuildSuccessPercent:null,
  };
  const dest=path.join(root,'benchmarks/evidence/phase7-rv32i.json');
  await mkdir(path.dirname(dest),{recursive:true});
  await writeFile(dest,JSON.stringify(record,null,2)+'\n');
  process.stdout.write('PHASE7 INDEPENDENT RV32I ORACLE PASS: QEMU stdout='+
    JSON.stringify(qemu)+', JS register x6='+state.regs[6]+
    ', compiled SHA256='+record.compiled.sha256+'\n');
}finally{
  await rm(tmp,{recursive:true,force:true});
}
