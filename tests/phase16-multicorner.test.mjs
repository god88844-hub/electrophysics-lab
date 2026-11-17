// Synthetic negative controls ONLY; not fabricated hardware or STA records.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 FORMAT,LIB_COMMIT,LIB_REPO,CORNERS,OUTPUT_PORTS,parseCornerLog,
 evaluatePhase16Evidence
} from '../js/evidence/phase16-multicorner.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase16/acceptance.json',import.meta.url),'utf8'));
const SHA='a'.repeat(64),COMMIT='b'.repeat(40);
function fakeLog(c){
 return [
  'OpenSTA synthetic TEST DATA - no actual third party proof',
  'PHASE16_CORNER_BEGIN '+c.id+' '+c.corner,
  ...OUTPUT_PORTS.flatMap((port,i)=>[
    'Startpoint: b[1] (input port clocked by vclk)',
    'Endpoint: '+port+' (output port clocked by vclk)',
    'Path Group: vclk',
    'Path Type: max',
    '    5.24 data arrival time',
    '         12.80 slack (MET)'
  ]),
  'PHASE16_CORNER_END '+c.id
 ].join('\n')+'\n';
}
function fixture(){
 const results=CORNERS.map(c=>parseCornerLog(fakeLog(c),c));
 return {
  format:FORMAT,design:'alu8',
  analysis:'pre-layout-combinational-three-corner-opensta-model',
  source:{repo:LIB_REPO,commit:LIB_COMMIT},commitSha:COMMIT,
  openstaVersion:'OpenSTA 2.0.17',
  sourceHashes:{rtlSha256:SHA,netlistSha256:SHA,sdcSha256:SHA,staTclSha256:SHA},
  libraries:CORNERS.map(c=>({
    id:c.id,corner:c.corner,sha256:c.sha256,gitBlobSha1:c.gitBlobSha1,bytes:c.bytes
  })),
  logs:[SHA,SHA,SHA],results,worstModelSlackNs:12.8,
  processCornersTested:3,postLayout:false,extractedParasitics:false,
  siliconMeasurements:false,physicalValidation:'none',physicalVerdict:'unknown',
  physicalQualified:false,realWorldBuildSuccessPercent:null
 };
}
test('3 actual-frozen lib identities: TT 25C, SS 100C, FF -40C and valid hashes',()=>{
 assert.deepEqual(CORNERS.map(c=>[c.corner,c.temperatureC,c.voltageV]),[
  ['tt_025C_1v80',25,1.8],['ss_100C_1v60',100,1.6],['ff_n40C_1v95',-40,1.95]
 ]);
 assert.equal(manifest.source.license,'Apache-2.0');
 assert.deepEqual(manifest.corners,CORNERS);
});
test('Synthetic report shape is accepted only as three PVT computational models',()=>{
 const r=fixture();
 const state=evaluatePhase16Evidence(manifest,r,structuredClone(r));
 assert.equal(state.ok,true,state.errors.join('; '));
 assert.equal(state.realProcessCornersAnalyzed,3);
 assert.equal(state.physicalValidation,'none');
 assert.equal(state.physicalVerdict,'unknown');
 assert.equal(state.realWorldBuildSuccessPercent,null);
});
test('Parser fails closed on missing, duplicated, renamed, switched or unbounded paths',()=>{
 for(const c of CORNERS){
  const base=fakeLog(c);
  assert.equal(parseCornerLog(base,c).paths.length,10);
  for(const change of [
   x=>x.replace('PHASE16_CORNER_BEGIN','NO_CORNER_BEGIN'),
   x=>x.replace('PHASE16_CORNER_END','NO_CORNER_END'),
   x=>x+'\nPHASE16_CORNER_BEGIN '+c.id+' '+c.corner,
   x=>x.replace('Endpoint: carry','Endpoint: zero'),
   x=>x.replace('Endpoint: carry','Endpoint: mystery'),
   x=>x.replace('Startpoint: b[1]','Startpoint: actual_silicon'),
   x=>x.replace('Path Group: vclk','Path Group: unclocked'),
   x=>x.replace('Path Type: max','Path Type: min'),
   x=>x.replace('12.80 slack (MET)','-1.0 slack (MET)'),
   x=>x.replace('12.80 slack (MET)','NaN slack (MET)'),
   x=>x.replace('12.80 slack (MET)','slack UNCONSTRAINED'),
   x=>x.replace('Path Group: vclk','Warning: fake'),
   x=>x.replace('Path Group: vclk','no paths found')
  ]){
   assert.throws(()=>parseCornerLog(change(base),c));
  }
 }
});
test('Negative slack does not pass a prespecified 20 ns budget, never silicon failure',()=>{
 const c=CORNERS[1];
 const neg=fakeLog(c).replace('12.80 slack (MET)','-1.20 slack (VIOLATED)');
 const parsed=parseCornerLog(neg,c);
 assert.equal(parsed.withinBudget,false);
 const record=structuredClone(fixture()),actual=structuredClone(record);
 record.results[1]=parsed;actual.results[1]=structuredClone(parsed);
 record.worstModelSlackNs=-1.20;
 const state=evaluatePhase16Evidence(manifest,record,actual);
 assert.equal(state.ok,false);
 assert.equal(state.physicalVerdict,'unknown');
});
test('Mutating hashes, source commit, corner or manufacturing claims never passes',()=>{
 const corrupt=[
  r=>r.libraries[0].sha256='b'.repeat(64),
  r=>r.libraries[1].bytes=200,
  r=>r.libraries[2].gitBlobSha1='a'.repeat(40),
  r=>r.libraries[0].corner='fake',
  r=>r.libraries.reverse(),
  r=>r.sourceHashes.netlistSha256='c'.repeat(64),
  r=>r.logs[1]='d'.repeat(64),
  r=>r.logs.pop(),
  r=>r.results[2].paths.pop(),
  r=>r.results[0].worstSlackNs=999,
  r=>r.results.reverse(),
  r=>r.worstModelSlackNs=100,
  r=>r.source.commit='old',
  r=>r.openstaVersion='imaginary tool',
  r=>r.commitSha='old',
  r=>r.processCornersTested=9,
  r=>r.physicalQualified=true,
  r=>r.physicalValidation='verified',
  r=>r.physicalVerdict='pass',
  r=>r.realWorldBuildSuccessPercent=100,
  r=>r.postLayout=true,
  r=>r.extractedParasitics=true,
  r=>r.siliconMeasurements=true
 ];
 for(const change of corrupt){
  const record=structuredClone(fixture()), actual=structuredClone(record);
  change(record);
  assert.equal(evaluatePhase16Evidence(manifest,record,actual).ok,false);
 }
});
test('Changing the originally frozen library or timing policy cannot certify a model',()=>{
 for(const change of [
  m=>m.timingBudgetNs=10000,
  m=>m.expectedPathsPerCorner=1,
  m=>m.corners[1].voltageV=1.8,
  m=>m.corners[2].sha256='a'.repeat(64),
  m=>m.source.repo='malicious',
  m=>m.source.commit='new',
  m=>m.physicalValidation='verified',
  m=>m.realWorldBuildSuccessPercent=99
 ]){
  const modified=structuredClone(manifest);
  change(modified);
  assert.equal(evaluatePhase16Evidence(modified,fixture(),fixture()).ok,false);
 }
});
