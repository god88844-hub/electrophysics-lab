import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FORMAT,LIB_BLOB,FILES,classifyYosysProof,evaluatePhase17} from '../js/evidence/phase17-gate-equivalence.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase17/acceptance.json',import.meta.url)));
const HASH='a'.repeat(64),COMMIT='b'.repeat(40);
const log=(pass)=>[
 'Yosys synthetic UNIT FIXTURE; no actual gate-level proof',
 'Executing EQUIV_MAKE pass',
 'Executing EQUIV_SIMPLE pass',
 'Executing EQUIV_STATUS pass',
 'equiv_status -assert',
 pass?'Equivalence successfully proven!':'Found 1 unproven $equiv cells.',
 pass?'End of synthetic unit fixture':'ERROR: Found 1 unproven $equiv cells in equiv_status -assert.'
].join('\n')+'\n'.repeat(180);
function fixture(){
 const hashes={};for(const k of Object.keys(FILES))hashes[k]=HASH;
 hashes.positiveLog=HASH;hashes.mutantLog=HASH;
 return {format:FORMAT,design:'alu8',
  method:'sat-gate-netlist-vs-independent-spec-with-liberty-function-import',
  libertyGitBlobSha1:LIB_BLOB,commitSha:COMMIT,yosysVersion:'Yosys 0.33',
  hashes,positiveVerdict:'proven',mutantVerdict:'rejected-unproven',
  physicalValidation:'none',physicalVerdict:'unknown',physicalQualified:false,
  postLayout:false,siliconMeasurements:false,realWorldBuildSuccessPercent:null};
}
const check=(r,m=manifest,a=null)=>evaluatePhase17(m,r,a||{...structuredClone(r),mappedCellTypesPresent:true});
test('Positive SAT and negative XOR/OR control have disjoint classifications',()=>{
 assert.equal(classifyYosysProof(log(true)),'proven');
 assert.equal(classifyYosysProof(log(false)),'rejected-unproven');
 for(const bad of [
  'not Yosys','Equivalence successfully proven!'.repeat(50),
  log(true).replace('Executing EQUIV_SIMPLE pass','skipped'),
  log(false).replace('ERROR: Found 1 unproven','WARNING: Found 1 unproven'),
  log(true).replace('Equivalence successfully proven!','Not proven')
 ])assert.throws(()=>classifyYosysProof(bad));
});
test('Fixed policy accepts only gate-level Boolean proof, physical unknown',()=>{
 const v=check(fixture());
 assert.equal(v.ok,true,v.errors.join('; '));
 assert.equal(v.verdict,'gate-level-boolean-equivalence-only');
 assert.equal(v.realWorldBuildSuccessPercent,null);
});
test('Missing evidence, fake success, physical qualification, altered SHA all fail closed',()=>{
 const mutations=[
  x=>x.positiveVerdict='failed',
  x=>x.mutantVerdict='proven',
  x=>x.hashes.positiveLog='bad',
  x=>x.hashes.mappedNetlist='f'.repeat(64),
  x=>x.libertyGitBlobSha1='c'.repeat(40),
  x=>x.commitSha='stale',
  x=>x.yosysVersion='not installed',
  x=>x.physicalQualified=true,
  x=>x.postLayout=true,
  x=>x.siliconMeasurements=true,
  x=>x.physicalVerdict='pass',
  x=>x.realWorldBuildSuccessPercent=100
 ];
 for(const m of mutations){const r=fixture();m(r);assert.equal(check(r).ok,false)}
 assert.equal(check(fixture(),manifest,{...fixture(),mappedCellTypesPresent:false}).ok,false);
});
test('Acceptance edits cannot weaken process, functional or physical claims',()=>{
 for(const mutate of [
  m=>m.inputBits=4,m=>m.outputBits=1,
  m=>m.positiveMustProve=false,m=>m.mutantMustFail=false,
  m=>m.independentReference='benchmarks/phase13/rtl/alu8.v',
  m=>m.libertyGitBlobSha1='c'.repeat(40),
  m=>m.physicalValidation='verified',m=>m.realWorldBuildSuccessPercent=95
 ]){const a=structuredClone(manifest);mutate(a);assert.equal(check(fixture(),a).ok,false)}
});
