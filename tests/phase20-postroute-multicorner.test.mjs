import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CORNERS,LIB_REPO,LIB_COMMIT,FORMAT,IMAGE_DIGEST,SOURCE_FILES,OUTPUT_PORTS,parseCorner,evaluatePhase20} from '../js/evidence/phase20-postroute-multicorner.js';
const H='a'.repeat(64),COMMIT='b'.repeat(40);
function fakeLog(c){
 return ['OpenROAD synthetic UNIT TEST ONLY; no genuine external model',
  'PH20_CORNER_BEGIN '+c.id+' '+c.corner,
  'PH20_OPENDB_INSTANCES 390','PH20_OPENDB_NETS 144','PH20_SPEF_RELOADED',
  ...OUTPUT_PORTS.flatMap(x=>['PH20_PATH_BEGIN '+x,'Startpoint: a[0] (input port)',
   'Endpoint: '+x+' (output port)','Path Group: vclk','Path Type: max',
   '  14.50 slack (MET)','PH20_PATH_END '+x]),
  'PH20_CORNER_END '+c.id].join('\n')+'\n';
}
function fixture(){
 const sha256={};for(const k of Object.keys(SOURCE_FILES))sha256[k]=H;
 return {format:FORMAT,method:'three-real-liberty-corners-one-routed-odb-one-extracted-spef',
 analysis:'postroute-pvt-single-fixed-rc-model',source:{repo:LIB_REPO,commit:LIB_COMMIT},
 imageDigest:IMAGE_DIGEST,commitSha:COMMIT,sha256,
 libraries:CORNERS.map(c=>({...c})),logs:CORNERS.map(()=>H),
 results:CORNERS.map(c=>parseCorner(fakeLog(c),c)),worstModelSlackNs:14.5,
 qualifiedSignoff:false,multipleRcCorners:false,foundryDrcPassed:false,lvsPassed:false,
 siliconMeasurements:false,physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
test('Synthetic policy test accepts bounded computational evidence only',()=>{
 const r=fixture(),v=evaluatePhase20(r,structuredClone(r));
 assert.equal(v.ok,true,v.errors.join('; '));assert.equal(v.realWorldBuildSuccessPercent,null);
});
test('Fail missing/forged SPEF, timing, endpoints and missing routed OpenDB',()=>{
 for(const mutate of [
  x=>x.replace('PH20_SPEF_RELOADED','NO_SPEF'),
  x=>x.replace('PH20_PATH_END zero','PH20_BAD_END zero'),
  x=>x.replace('Endpoint: carry','Endpoint: bogus'),
  x=>x.replace('Path Type: max','Path Type: min'),
  x=>x.replace('Path Group: vclk','Path Group: unknown'),
  x=>x.replace('14.50 slack (MET)','NaN slack (MET)'),
  x=>x.replace('14.50 slack (MET)','-5.00 slack (MET)'),
  x=>x.replace('PH20_OPENDB_NETS 144','PH20_OPENDB_NETS 0')
 ])assert.throws(()=>parseCorner(mutate(fakeLog(CORNERS[0])),CORNERS[0]));
});
test('Prevent tampering and invented validation of fabricated chip',()=>{
 const base=fixture();
 for(const mutate of [
  x=>x.sha256.extractedSpef='f'.repeat(64),
  x=>x.sha256.routedDb='0',
  x=>x.logs[0]='bad',
  x=>x.libraries[1].sha256='0'.repeat(64),
  x=>x.results[0].paths[0].slackNs=-1,
  x=>x.results[2].withinBudget=false,
  x=>x.worstModelSlackNs=99,
  x=>x.commitSha='old',
  x=>x.imageDigest='openroad/orfs:latest',
  x=>x.multipleRcCorners=true,
  x=>x.foundryDrcPassed=true,x=>x.lvsPassed=true,
  x=>x.qualifiedSignoff=true,x=>x.siliconMeasurements=true,
  x=>x.physicalVerdict='pass',x=>x.realWorldBuildSuccessPercent=100
 ]){
  const r=structuredClone(base);mutate(r);assert.equal(evaluatePhase20(r,base).ok,false);
 }
});
