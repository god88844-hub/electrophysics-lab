import {test} from 'node:test';
import assert from 'node:assert/strict';
import {candidateSignature,generateTopologyCandidates,fastFunctionalPrune,
 exploreTopologies,verifyIdealAdderWithLogicEngine} from '../js/scene/stage-o-topology-search.js';
test('seeded topology batches and 4/8 binary/ternary/Q4 reference checks reproduce',()=>{
 for(const radix of [2,3,4])for(const width of [4,8]){
  const a=generateTopologyCandidates({seed:151,count:12,radix,width});
  assert.equal(JSON.stringify(a),JSON.stringify(generateTopologyCandidates({seed:151,count:12,radix,width})));
  assert.equal(a.candidates.length,12);
  assert.equal(new Set(a.candidates.map(candidateSignature)).size,12);
  for(const candidate of a.candidates)assert.equal(fastFunctionalPrune(candidate).status,'REFERENCE_ONLY');
 }
});
test('logic-invalid candidates are pruned before expensive SPICE; no fake qualification',async()=>{
 const pool=generateTopologyCandidates({seed:8,count:10});
 let calls=0;
 const result=await exploreTopologies({candidates:pool.candidates,maxSpiceCandidates:2,
  verifyFunctional:async c=>({status:c.iteration<4?'FAIL':'PASS'}),
  verifySpice:async()=>{calls++;return {status:'INSUFFICIENT_MODEL_DATA'};}});
 assert.equal(result.pruned,4);assert.equal(result.spiceEvaluated,2);assert.equal(calls,2);
 assert.equal(result.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.equal(result.virtualQualified,false);
});
test('without netlist verifier, reference ALU is never called a verified topology',async()=>{
 const pool=generateTopologyCandidates({seed:12,count:5});
 const r=await exploreTopologies({candidates:pool.candidates});
 assert.equal(r.spiceEvaluated,0);
 assert.ok(r.results.every(x=>x.status==='FUNCTIONAL_REFERENCE_ONLY'));
});

test('generated binary/ternary/Q4 ADDN topology matches exhaustive canonical logic simulation',()=>{
 for(const radix of [2,3,4]){
  const result=verifyIdealAdderWithLogicEngine({radix});
  assert.equal(result.status,'PASS',JSON.stringify(result.failures));
  assert.equal(result.examined,radix*radix);
  assert.equal(result.verifiedTransistorSpice,false);
  assert.equal(result.verifiedPhysicalImplementation,false);
 }
 assert.throws(()=>verifyIdealAdderWithLogicEngine({radix:7}),/supports declared/);
});
