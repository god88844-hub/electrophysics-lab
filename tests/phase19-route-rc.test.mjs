import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FORMAT,IMAGE,IMAGE_DIGEST,INPUTS,OUTPUTS,parseRouteInspect,inspectSpef,evaluatePhase19} from '../js/evidence/phase19-route-rc.js';
const H='a'.repeat(64),COMMIT='b'.repeat(40);
const endpoints=['carry','zero',...Array.from({length:8},(_,i)=>'y['+i+']')];
function fakeLog(){
 return ['OpenROAD TEST DATA - synthetic, not actual hardware/tool results',
 'PH19_GEOMETRY_BEGIN','PH19_DIE_DBUNITS 51455 51455','PH19_INSTANCES 141',
 'PH19_PLACED 141','PH19_SIGNAL_NETS 130','PH19_WIRED_SIGNAL_NETS 115',
 'PH19_BTERMS 30','PH19_GEOMETRY_END','PH19_SPEF_RELOADED',
 'PH19_TIMING_BEGIN',
 ...endpoints.flatMap(x=>['PH19_PATH_BEGIN '+x,'Startpoint: a[0] (input port)',
  'Endpoint: '+x+' (output port)','Path Group: vclk','Path Type: max',
  '  4.00 slack (MET)','PH19_PATH_END '+x]),
 'PH19_TIMING_END'].join('\n')+'\n';
}
const fakeSpef=()=>['*SPEF "IEEE 1481-1998"','*DESIGN "alu8"','*DATE "synthetic test"',
 ...Array.from({length:10},(_,i)=>['*D_NET '+i+' 0.001','*CONN','*CAP','1 net 0.01','*RES','1 n1 n2 1','*END'].join('\n'))].join('\n')+'\n';
function fixture(){
 const sha256={};for(const k of Object.keys({...INPUTS,...OUTPUTS}))sha256[k]=H;
 return {format:FORMAT,imageTag:IMAGE,imageDigest:IMAGE_DIGEST,commitSha:COMMIT,
  kind:'detailed-routed-open-db-openrcx-spef-postroute-sta',sha256,
  model:parseRouteInspect(fakeLog()),spefStats:inspectSpef(fakeSpef()),
  foundryDrcPassed:false,lvsPassed:false,siliconMeasurements:false,signoffQualified:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
test('Bounded real-tool evidence contract never claims physical silicon',()=>{
 const r=fixture(),v=evaluatePhase19(r,structuredClone(r));
 assert.equal(v.ok,true,v.errors.join('; '));
 assert.equal(v.realWorldBuildSuccessPercent,null);
});
test('Fake route geometry and missing/contradictory max paths fail closed',()=>{
 for(const f of [
  s=>s.replace('PH19_INSTANCES 141','PH19_INSTANCES 142'),
  s=>s.replace('PH19_WIRED_SIGNAL_NETS 115','PH19_WIRED_SIGNAL_NETS 0'),
  s=>s.replace('PH19_BTERMS 30','PH19_BTERMS 28'),
  s=>s.replace('PH19_SPEF_RELOADED','PH19_SPEF_NOT_LOADED'),
  s=>s.replace('PH19_PATH_END zero',''),
  s=>s.replace('Path Type: max','Path Type: min'),
  s=>s.replace('4.00 slack (MET)','NaN slack (MET)'),
  s=>s.replace('4.00 slack (MET)','-3.00 slack (MET)'),
  s=>s.replace('Endpoint: carry','Endpoint: zero'),
 ])assert.throws(()=>parseRouteInspect(f(fakeLog())));
});
test('Fake/incomplete SPEF rejected',()=>{
 for(const f of [
  s=>s.replace('*SPEF','*NOTSPEF'),
  s=>s.replaceAll('*D_NET','*NOT_D_NET'),
  s=>s.replaceAll('*RES','*NOT_RES'),
  s=>s.slice(0,50)
 ])assert.throws(()=>inspectSpef(f(fakeSpef())));
});
test('Tampered native layout, missing RC, or made-up physical success rejected',()=>{
 const baseline=fixture();
 for(const mutate of [
  r=>r.sha256.routeDb='f'.repeat(64),
  r=>r.sha256.spef='f'.repeat(64),
  r=>r.sha256.inspectLog='bad',
  r=>r.commitSha='old',
  r=>r.imageDigest='openroad/orfs:latest',
  r=>r.model.geometry.wiredSignalNets=0,
  r=>r.model.paths[0].slackNs=-1,
  r=>r.spefStats.nets=0,
  r=>r.foundryDrcPassed=true,r=>r.lvsPassed=true,
  r=>r.signoffQualified=true,r=>r.siliconMeasurements=true,
  r=>r.physicalVerdict='pass',r=>r.physicalValidation='verified',
  r=>r.realWorldBuildSuccessPercent=99
 ]){
  const r=structuredClone(baseline);mutate(r);
  assert.equal(evaluatePhase19(r,baseline).ok,false);
 }
});
