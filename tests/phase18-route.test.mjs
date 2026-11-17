import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FORMAT,IMAGE,IMAGE_DIGEST,SOURCES,OUTPUTS,parseGeometry,evaluatePhase18} from '../js/evidence/phase18-physical-route.js';
const H='a'.repeat(64),C='b'.repeat(40);
function geo(){return 'OpenROAD synthetic TEST ONLY\nPH18_GEOMETRY_BEGIN\nPH18_DIE_DBUNITS 100 120\nPH18_INSTANCES 12\nPH18_PLACED 12\nPH18_NETS 8\nPH18_BTERMS 30\nPH18_GEOMETRY_END\n';}
function fixture(){
 const sha256={};for(const k of Object.keys({...SOURCES,...OUTPUTS}))sha256[k]=H;
 return {format:FORMAT,imageTag:IMAGE,imageDigest:IMAGE_DIGEST,commitSha:C,
 kind:'placed-open-db-and-global-route-guide',sha256,geometry:parseGeometry(geo()),
 routeGuideBytes:123,flowLogStageEvidence:'globalroute-executed',
 detailedRoute:false,drcPassed:false,lvsPassed:false,siliconMeasurements:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
const verify=r=>evaluatePhase18(r,fixture());
test('Place/global-route JSON is only a computational physical-design model',()=>{
 const a=fixture(),v=verify(a);
 assert.equal(v.ok,true,v.errors.join('; '));
 assert.equal(v.physicalVerdict,'unknown');
 assert.equal(v.realWorldBuildSuccessPercent,null);
});
test('OpenDB geometry parser rejects missing die, instance count and output ports',()=>{
 for(const fn of [
  x=>x.replace('PH18_PLACED 12','PH18_PLACED 11'),
  x=>x.replace('PH18_DIE_DBUNITS 100 120','PH18_DIE_DBUNITS 0 120'),
  x=>x.replace('PH18_BTERMS 30','PH18_BTERMS 29'),
  x=>x.replace('PH18_NETS 8','PH18_NETS 0'),
  x=>x.replace('PH18_GEOMETRY_END','END'),
  x=>x.replace('PH18_INSTANCES 12','PH18_INSTANCES 0')
 ])assert.throws(()=>parseGeometry(fn(geo())));
});
test('Absent route, tampered evidence, or false physical qualification rejected',()=>{
 const edits=[
  r=>r.sha256.place='c'.repeat(64),
  r=>r.sha256.geometryLog='bad',
  r=>r.imageDigest='openroad/orfs:latest',
  r=>r.geometry.placed=0,
  r=>r.routeGuideBytes=0,
  r=>r.flowLogStageEvidence='missing',
  r=>r.detailedRoute=true,
  r=>r.drcPassed=true,r=>r.lvsPassed=true,
  r=>r.siliconMeasurements=true,r=>r.physicalValidation='verified',
  r=>r.physicalVerdict='pass',r=>r.realWorldBuildSuccessPercent=99
 ];
 for(const f of edits){const r=fixture();f(r);assert.equal(verify(r).ok,false);}
});
