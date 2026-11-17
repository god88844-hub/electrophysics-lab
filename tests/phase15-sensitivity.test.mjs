// These unit fixtures are SYNTHETIC TEST DATA, not EDA/measurement evidence.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FORMAT,GRID,ENDPOINTS,parsePhase15ToolLog,evaluatePhase15Evidence} from '../js/evidence/phase15-sensitivity.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase15/acceptance.json',import.meta.url),'utf8'));
const sha='a'.repeat(64),commit='b'.repeat(40);
const dump=(setting,negative=false)=>[
 'OpenSTA synthetic fixture; NEVER claim actual execution',
 'PHASE15_CASE_BEGIN '+setting.id+' '+setting.slewNs+' '+setting.loadPf,
 ...ENDPOINTS.flatMap((end,i)=>[
  'Startpoint: b[1] (input port clocked by vclk)',
  'Endpoint: '+end+' (output port clocked by vclk)',
  'Path Group: vclk',
  'Path Type: max',
  '   3.54 data arrival time',
  (negative&&i===0?'-0.75 slack (VIOLATED)':'16.07 slack (MET)')
 ]),
 'PHASE15_CASE_END '+setting.id
].join('\n')+'\n';
const make=()=>{
 const cases=GRID.map(x=>parsePhase15ToolLog(dump(x),x));
 const sourceHashes={rtl:sha,liberty:sha,netlist:sha,sdc:sha,staTcl:sha};
 const logHashes=GRID.map(()=>sha);
 return {
  format:FORMAT,corner:'tt_025C_1v80',design:'alu8',
  analysis:'pre-layout-TT-load-and-slew-model-sweep',
  commitSha:commit,toolVersion:'OpenSTA 2.0.17',
  libertyGitBlobSha1:'5773657fe730d984ac06726d0addfdad80395b9b',
  sourceHashes,logHashes,cases,
  physicalValidation:'none',physicalVerdict:'unknown',
  physicalQualified:false,realWorldBuildSuccessPercent:null,
  postLayout:false,processCornersTested:1,actualHardwareMeasurements:false
 };
};
const independent=()=>{const record=make();return {
 commitSha:record.commitSha,toolVersion:record.toolVersion,
 libertyGitBlobSha1:record.libertyGitBlobSha1,
 sourceHashes:structuredClone(record.sourceHashes),
 logHashes:[...record.logHashes],cases:structuredClone(record.cases)}};
test('Phase 15 nine-case model acceptance is always nonphysical',()=>{
 assert.equal(GRID.length,9);
 const r=evaluatePhase15Evidence(manifest,make(),independent());
 assert.equal(r.ok,true,r.errors.join('; '));
 assert.equal(r.verdict,'TT-pre-layout-model-only');
 assert.equal(r.processCornersTested,1);
 assert.equal(r.physicalValidation,'none');
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Actual real-log parser requires all ten unique output endpoint paths in each case',()=>{
 for(const c of GRID){
  const r=parsePhase15ToolLog(dump(c),c);
  assert.equal(r.paths.length,10);
  assert.equal(r.met,true);
  assert.equal(r.worstSlackNs,16.07);
  assert.equal(Object.isFrozen(r.paths[0]),true);
 }
 for(const transform of [
  s=>s.replace('Endpoint: carry','Endpoint: invalid'),
  s=>s.replace('Endpoint: carry','Endpoint: zero'),
  s=>s.replace('Startpoint: b[1]','Startpoint: fabrication'),
  s=>s.replace('Path Type: max','Path Type: min'),
  s=>s.replace('16.07 slack (MET)','NaN slack (MET)'),
  s=>s.replace('16.07 slack (MET)','-3 slack (MET)'),
  s=>s.replace('PHASE15_CASE_END 0',''),
  s=>s+'PHASE15_CASE_BEGIN 0 0.05 0.005',
  s=>s.replace('Path Group: vclk','Error: no timing paths'),
  s=>s.replace('Path Group: vclk','no paths found')
 ]){
  assert.throws(()=>parsePhase15ToolLog(transform(dump(GRID[0])),GRID[0]));
 }
});
test('Negative slack never becomes a model pass, still not a measured silicon fail',()=>{
 const negative=parsePhase15ToolLog(dump(GRID[1],true),GRID[1]);
 assert.equal(negative.met,false);
 const record=make(),actual=independent();
 record.cases[1]=negative;actual.cases[1]=negative;
 const v=evaluatePhase15Evidence(manifest,record,actual);
 assert.equal(v.ok,false);
 assert.equal(v.physicalVerdict,'unknown');
});
test('No altered criteria, forged physical outcomes, or missing independent evidence passes',()=>{
 const edits=[
  x=>x.realWorldBuildSuccessPercent=99.5,
  x=>x.physicalValidation='validated',
  x=>x.physicalVerdict='pass',
  x=>x.physicalQualified=true,
  x=>x.postLayout=true,
  x=>x.processCornersTested=3,
  x=>x.actualHardwareMeasurements=true,
  x=>x.analysis='fabricated',
  x=>x.corner='ss_100C_1v60',
  x=>x.logHashes.pop(),
  x=>x.cases.pop(),
  x=>x.cases[5].worstSlackNs=100,
  x=>x.sourceHashes.netlist='c'.repeat(64),
  x=>x.commitSha='old',
  x=>x.toolVersion='fake'
 ];
 for(const edit of edits){
  const r=make();edit(r);
  assert.equal(evaluatePhase15Evidence(manifest,r,independent()).ok,false);
 }
 assert.equal(evaluatePhase15Evidence(manifest,make(),null).ok,false);
});
test('Original 3×3 acceptance grid and external replay cannot be reordered',()=>{
 const bad=structuredClone(manifest);
 bad.grid.reverse();
 assert.equal(evaluatePhase15Evidence(bad,make(),independent()).ok,false);
 const a=independent();a.cases.reverse();
 assert.equal(evaluatePhase15Evidence(manifest,make(),a).ok,false);
 const b=independent();b.logHashes[0]='c'.repeat(64);
 assert.equal(evaluatePhase15Evidence(manifest,make(),b).ok,false);
});
