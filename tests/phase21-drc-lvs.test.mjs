import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FORMAT,IMAGE_DIGEST,DRC_BLOB,LVS_BLOB,DECK_COMMIT,FILES,parseDrcReport,parseLvsLog,evaluatePhase21} from '../js/evidence/phase21-open-drc-lvs.js';
const H='a'.repeat(64),C='b'.repeat(40);
const drcXml='<?xml version="1.0"?><report-database><categories><category><name>foo</name></category></categories><items></items></report-database>\n';
const lvsLog=('KLayout fake unit test only\n'+'INFO : Congratulations! Netlists match.\n'+'Info: netlist compare\n').repeat(6);
const lvsDb='<lvs-db>'+('fake test data only').repeat(10)+'</lvs-db>';
function fixture(){
 const sha256={},fileSizes={};
 for(const k of Object.keys(FILES))sha256[k]=H;
 for(const k of ['gds','cdl','verilog','def','lvsDb','drcDb','drcDeck','lvsDeck'])fileSizes[k]=10000;
 return {format:FORMAT,method:'klayout-gds-open-beol-offgrid-drc-and-cdl-lvs',
  sourceCommit:C,imageDigest:IMAGE_DIGEST,drcDeckGitBlob:DRC_BLOB,
  lvsDeckGitBlob:LVS_BLOB,ruleDeckCommit:DECK_COMMIT,
  sha256,fileSizes,drc:parseDrcReport(drcXml,'0\n','KLayout SKY130 actual mock DRC run '+'.'.repeat(150)),
  lvs:parseLvsLog(lvsLog,lvsDb),
  fullFoundryDrc:false,foundryQualifiedLvs:false,measuredSilicon:false,foundrySignoff:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
test('Strict gate accepts only bounded open PDK computational checking',()=>{
 const r=fixture(),v=evaluatePhase21(r,structuredClone(r));
 assert.equal(v.ok,true,v.errors.join('; '));assert.equal(v.physicalVerdict,'unknown');
});
test('DRC negative controls: added markers, malformed or missing KLayout XML',()=>{
 for(const [xml,count,log] of [
  [drcXml.replace('<items>','<items><value>x</value>'),'0','KLayout '+'.'.repeat(150)],
  ['fake','0','KLayout '+'.'.repeat(150)],
  [drcXml,'bad','KLayout '+'.'.repeat(150)],
  [drcXml,'0','Fatal: no actual check '.repeat(10)]
 ])assert.throws(()=>parseDrcReport(xml,count,log));
});
test('LVS negative controls: missing verdict, mismatch, or concurrent contradiction',()=>{
 for(const log of [
  lvsLog.replaceAll('Congratulations! Netlists match.','comparison incomplete'),
  lvsLog+"ERROR : Netlists don't match",
  "ERROR : Netlists don't match".repeat(12)
 ])assert.throws(()=>parseLvsLog(log,lvsDb),
    /Not an actual|No unique|Missing|External|no actual/i);
});
test('False zero DRC, LVS, foundry signoff or altered raw evidence fail closed',()=>{
 const actual=fixture();
 for(const mutate of [
  r=>r.drc.reportedMarkerLines=2,r=>r.drc.cleanOpenSubset=false,
  r=>r.drc.enabledRules=['FEOL','BEOL'],r=>r.lvs.netlistsMatch=false,
  r=>r.lvs.netlistsMismatch=true,r=>r.sha256.gds='c'.repeat(64),
  r=>r.sha256.drcDb='bad',r=>r.fileSizes.gds=0,
  r=>r.drcDeckGitBlob='wrong',r=>r.lvsDeckGitBlob='wrong',
  r=>r.imageDigest='openroad/orfs:latest',r=>r.sourceCommit='old',
  r=>r.foundrySignoff=true,r=>r.fullFoundryDrc=true,
  r=>r.foundryQualifiedLvs=true,r=>r.measuredSilicon=true,
  r=>r.physicalVerdict='pass',r=>r.realWorldBuildSuccessPercent=100
 ]){
  const x=structuredClone(actual);mutate(x);
  assert.equal(evaluatePhase21(x,actual).ok,false);
 }
});
