// Phase 8 evidence-policy negative tests use synthetic records ONLY to
// test rejection behavior. No fake records are ever published as benchmarks.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REQUIRED_M_CASES,evaluatePhase8} from '../js/phase8/acceptance.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase8/acceptance.json',import.meta.url),'utf8'));
const fp='a'.repeat(64);
const make=()=>({
  format:'invention-lab/phase8-rv32m-reference/1',commitSha:'fixture-commit',
  outcome:'pass',isa:'rv32im',model:'single-hart-architectural',
  source:{path:manifest.source,sha256:fp},
  machineCode:{sha256:fp,bytes:500,base:0x10000},
  qemu:{actualOutputSha256:fp,bytes:48},
  js:{actualOutputSha256:fp,bytes:48,stopReason:'ecall',retired:40},
  versions:{assembler:'fixture',linker:'fixture',qemu:'fixture'},
  cases:REQUIRED_M_CASES.map(([id,operation,expectedUnsigned])=>
    ({id,operation,expectedUnsigned,actualQemu:expectedUnsigned,actualJs:expectedUnsigned,verdict:'pass'})),
  physicalValidation:'none',realWorldBuildSuccessPercent:null,
});
const check=r=>evaluatePhase8(manifest,r,{sourceSha256:fp,commitSha:'fixture-commit'});
test('Phase 8 policy: manifest is pinned to exactly 12 named M operation cases',()=>{
  assert.equal(REQUIRED_M_CASES.length,12);
  assert.deepEqual(manifest.requiredCases.map(x=>[x.id,x.operation,x.expectedUnsigned]),REQUIRED_M_CASES);
  assert.equal(check(make()).ok,true,'acceptance logic recognizes a complete structurally valid record');
});
test('Phase 8 policy: missing, duplicate, unknown or skipped case cannot produce success',()=>{
  for(const kind of ['missing','duplicate','unknown','skipped','mismatch','changed-expected']){
    const record=make();
    switch(kind){
      case 'missing':record.cases.pop();break;
      case 'duplicate':record.cases.push({...record.cases[0]});break;
      case 'unknown':record.cases[0].id='M-EXTENSION-NOT-VERIFIED';break;
      case 'skipped':record.cases[2].verdict='skip';break;
      case 'mismatch':record.cases[3].actualQemu=0;break;
      case 'changed-expected':record.cases[4].expectedUnsigned=0;break;
    }
    assert.equal(check(record).ok,false,kind);
  }
});
test('Phase 8 policy: shuffled word positions cannot be relabeled as passing',()=>{
  const report=make();
  const first=report.cases[0];
  report.cases[0]=report.cases[1];
  report.cases[1]=first;
  assert.equal(check(report).ok,false,'word-position mismatch must fail even when all case IDs are present');
});
test('Phase 8 policy: frozen manifest cannot shrink/change an expected result',()=>{
  const smaller=structuredClone(manifest);smaller.requiredCases.pop();
  assert.equal(evaluatePhase8(smaller,make()).ok,false);
  const mutated=structuredClone(manifest);
  mutated.requiredCases[2].expectedUnsigned=0;
  assert.equal(evaluatePhase8(mutated,make()).ok,false);
  const renamed=structuredClone(manifest);renamed.source='unsafe/elsewhere.S';
  assert.equal(evaluatePhase8(renamed,make()).ok,false);
});
test('Phase 8 policy: metadata, hash, commit and real-silicon claim guards fail closed',()=>{
  for(const kind of ['stale','source','binary','qemu-output','version','unavailable','physical','yield','bad-isa']){
    const record=make();
    switch(kind){
      case 'stale':record.commitSha='stale-commit';break;
      case 'source':record.source.sha256='b'.repeat(64);break;
      case 'binary':record.machineCode.sha256='not-hash';break;
      case 'qemu-output':record.qemu.actualOutputSha256='b'.repeat(64);break;
      case 'version':delete record.versions.qemu;break;
      case 'unavailable':delete record.qemu;break;
      case 'physical':record.physicalValidation='demonstrated';break;
      case 'yield':record.realWorldBuildSuccessPercent=99.9;break;
      case 'bad-isa':record.isa='rv32i';break;
    }
    assert.equal(check(record).ok,false,kind);
  }
  assert.equal(evaluatePhase8(manifest,null).ok,false);
});
