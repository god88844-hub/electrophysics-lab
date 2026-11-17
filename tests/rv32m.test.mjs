// Phase 8 regression tests: RV32M 2.0 is opt-in, RV32I default stays strict.
// These are mathematical checks, NOT ACT certification or QEMU verification.
// Actual independent QEMU comparison is in the Phase 8 external workflow.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RV32I,runRV32I} from '../js/labs/rv32i/rv32i.js';
import {rv32iLab} from '../js/labs/rv32i/lab.js';

const halt=0x00100073;
const opM=(funct3,rd=3,rs1=1,rs2=2)=>(
  (0x01<<25)|(rs2<<20)|(rs1<<15)|(funct3<<12)|(rd<<7)|0x33
)>>>0;
function execute(funct3,a,b,options={}) {
  const cpu=new RV32I({program:new Uint32Array([opM(funct3),halt]),isa:'rv32im',...options});
  cpu.regs[1]=a|0;cpu.regs[2]=b|0;
  const output=cpu.run({maxSteps:5});
  return {cpu,output,value:output.regs[3]};
}
const U=v=>v>>>0;
test('RV32M is opt-in: plain RV32I still rejects all eight M encodings',()=>{
  for(let funct3=0;funct3<8;funct3++){
    const result=runRV32I([opM(funct3),halt]);
    assert.equal(result.ok,false);
    assert.equal(result.stopReason,'illegal-instruction');
    assert.equal(result.retired,0);
    assert.equal(result.regs[3],0);
  }
  assert.throws(()=>new RV32I({program:[halt],isa:'rv32g'}),/isa|extension/i);
});
test('RV32M exact lower and upper multiplication for signed, mixed and unsigned 32-bit operands',()=>{
  const vectors=[
    [0,-1,2147483647,0x80000001,'MUL'],
    [1,-1,2147483647,0xffffffff,'MULH'],
    [2,-2147483648,-1,0x80000000,'MULHSU'],
    [3,-1,-1,0xfffffffe,'MULHU'],
    [1,-2147483648,-1,0x00000000,'MULH'],
    [2,-1,-1,0xffffffff,'MULHSU'],
    [3,-2147483648,2,1,'MULHU'],
  ];
  for(const [fn,a,b,expected,mnemonic] of vectors){
    const {output,value}=execute(fn,a,b);
    assert.equal(output.ok,true,fn+' must retire');
    assert.equal(value,U(expected),fn+' value mismatch');
    assert.equal(output.traces[0].mnemonic,mnemonic);
    assert.equal(output.isa,'rv32im');
    assert.equal(output.physicalValidation,'none');
    assert.equal(output.realWorldBuildSuccessPercent,null);
  }
});
test('RV32M signed/unsigned divide and remainder obey rounding and sign',()=>{
  for(const [fn,a,b,expected,mnemonic] of [
    [4,-7,3,-2,'DIV'],[4,7,-3,-2,'DIV'],[4,-7,-3,2,'DIV'],
    [5,-1,2,0x7fffffff,'DIVU'],
    [6,-7,3,-1,'REM'],[6,7,-3,1,'REM'],[6,-7,-3,-1,'REM'],
    [7,-1,2,1,'REMU']
  ]){
    const {output,value}=execute(fn,a,b);
    assert.equal(output.ok,true);
    assert.equal(value,U(expected));
    assert.equal(output.traces[0].mnemonic,mnemonic);
  }
});
test('RV32M division by zero is specified behavior (no JS exceptions or guesses)',()=>{
  for(const [fn,a,expected] of [
    [4,-123,-1],[5,-123,0xffffffff],[6,-123,-123],[7,-123,-123],
    [4,0,-1],[5,0,0xffffffff],[6,0,0],[7,0,0],
  ]){
    const {output,value}=execute(fn,a,0);
    assert.equal(output.ok,true,'division by zero is architecturally defined, not an ISA trap');
    assert.equal(value,U(expected));
  }
});
test('RV32M signed overflow MIN/-1 preserves wrap result, remainder zero',()=>{
  for(const [fn,expected] of [[4,0x80000000],[6,0]]){
    const {output,value}=execute(fn,-2147483648,-1);
    assert.equal(output.ok,true);
    assert.equal(value,U(expected));
  }
});
test('RV32M cannot modify x0 even when a multiply/divide has a result',()=>{
  for(let fn=0;fn<8;fn++){
    const cpu=new RV32I({program:[opM(fn,0),halt],isa:'rv32im'});
    cpu.regs[1]=3;cpu.regs[2]=0;
    const result=cpu.run();
    assert.equal(result.ok,true);
    assert.equal(result.regs[0],0);
  }
});
test('RV32M arbitrary edge operand combinations match independent BigInt arithmetic',()=>{
  const mask=(1n<<32n)-1n;
  const signed=x=>BigInt(x|0),unsigned=x=>BigInt(x>>>0);
  const values=[0,1,-1,2,-2,7,-7,1234567,-1234567,0x7fffffff,-2147483648,0x80000001];
  for(const a of values)for(const b of values){
    const av=signed(a),bv=signed(b),au=unsigned(a),bu=unsigned(b);
    const expected=[
      Number((av*bv)&mask), Number(((av*bv)>>32n)&mask),
      Number(((av*bu)>>32n)&mask),Number(((au*bu)>>32n)&mask),
      b===0?0xffffffff:Number((av/bv)&mask),
      b===0?0xffffffff:Number((au/bu)&mask),
      b===0?U(a):Number((av%bv)&mask),
      b===0?U(a):Number((au%bu)&mask),
    ];
    for(let fn=0;fn<8;fn++){
      const {value,output}=execute(fn,a,b);
      assert.equal(value,U(expected[fn]),'funct3 '+fn+' a='+a+' b='+b);
      assert.equal(output.ok,true);
    }
  }
});
test('RV32M learning lab selects ISA explicitly and preserves strict default',()=>{
  const program=[0x00600093,0x00700113,opM(0,3,1,2),halt]
    .map(w=>w.toString(16).padStart(8,'0')).join('\n');
  const base={lab:'rv32i',blocks:[],wires:[],meta:{source:program,expectedRegister:3,expectedValue:42,maxSteps:10}};
  assert.equal(rv32iLab.report(base).verdict,'fail','RV32I default must reject MUL');
  base.meta.isa='rv32im';
  const result=rv32iLab.run(base);
  assert.equal(result.cpu.regs[3],42);
  assert.equal(rv32iLab.report(base).verdict,'pass');
  base.meta.isa='unsupported';
  assert.equal(rv32iLab.report(base).verdict,'fail');
});
