import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FORMAT,FILES,DRC_BLOB,LIB_BLOB,IMAGE_DIGEST,exactFeolPatch,inspectDrc,evaluatePhase22} from '../js/evidence/phase22-feol-final-gates.js';
const SHA='a'.repeat(64),COMMIT='b'.repeat(40);
const source='FEOL    = false # front-end-of-line checks\nBEOL    = true # back-end-of-line checks\nOFFGRID = true # manufacturing grid/angle checks\n';
const xml='<?xml version="1.0"?><report-database><top-cell>alu8</top-cell><categories><category><name>nwell.1</name><description>'+'.'.repeat(140)+'</description></category></categories><items></items></report-database>\n';
const log='KLayout real physical tool UNIT TEST FAKE, no executed hardware validation; '.repeat(5);
function fixture(){
 const hashes={};for(const k of Object.keys(FILES))hashes[k]=SHA;
 return {format:FORMAT,method:'single-toggle-feol-open-deck-and-final-gds-netlist-sat',
  originalDeckBlob:DRC_BLOB,libertyBlob:LIB_BLOB,imageDigest:IMAGE_DIGEST,commitSha:COMMIT,
  hashes,drc:inspectDrc(xml,log),positiveVerdict:'proven',mutantVerdict:'rejected-unproven',
  foundrySignoff:false,measuredSilicon:false,qualifiedFoundryDrc:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
const check=(r,actual=fixture())=>evaluatePhase22(r,{
 sameFinalLayoutAsPhase21:true,sameFinalNetlistAsPhase21:true,...actual});
test('Strict model only: correct FEOL toggle and no physical fabrication inference',()=>{
 assert.equal(exactFeolPatch(source,source.replace('FEOL    = false','FEOL    = true')),true);
 const r=fixture(),v=check(r);
 assert.equal(v.ok,true,v.errors.join('; '));
 assert.equal(v.openDeckDrcClean,true);
 assert.equal(v.physicalVerdict,'unknown');
});
test('FEOL-deck weakening and missing geometry evidence fail closed',()=>{
 for(const edited of [
  source,source.replace('BEOL    = true','BEOL    = false'),
  source.replace('FEOL    = false','FEOL    = true')+'\nInjected bad rule',
  source.replace('FEOL    = false','FEOL = true'),
 ])assert.throws(()=>exactFeolPatch(source,edited));
 for(const bad of [
  xml.replace('<name>nwell.1</name>','<name>m1.1</name>'),
  xml.replace('<top-cell>alu8</top-cell>','<top-cell>other</top-cell>'),
  xml.replace('<items>','<items><item><value>x</value></item>'),
  '<report-database>bad</report-database>'
 ]){if(bad.includes('<item><value>'))assert.equal(inspectDrc(bad,log).markerCount,1);
   else assert.throws(()=>inspectDrc(bad,log));}
});
test('Open deck violations remain visible, never silently accepted as clean',()=>{
 const withMarker=xml.replace('<items></items>','<items><item><value>real geometry violation</value></item></items>');
 const d=inspectDrc(withMarker,log);
 assert.equal(d.markerCount,1);
 assert.equal(d.openDeckDrcClean,false);
 const r=fixture();r.drc=d;
 const v=check(r,{...fixture(),drc:d});
 assert.equal(v.ok,true,v.errors.join('; '));
 assert.equal(v.openDeckDrcClean,false);
});
test('Tampered real proof, missing mutant, fake silicon yields and digest rejected',()=>{
 const good=fixture();
 for(const f of [
  x=>x.hashes.sourceRtl='injected',x=>x.hashes.finalGds='invalid',
  x=>x.hashes.finalNetlist='c'.repeat(64),
  x=>x.hashes.liberty='0',
  x=>x.originalDeckBlob='modified',
  x=>x.libertyBlob='modified',
  x=>x.positiveVerdict='failed',
  x=>x.mutantVerdict='proven',
  x=>x.drc.openDeckDrcClean=false,
  x=>x.drc.feolEnabled=false,
  x=>x.foundrySignoff=true,
  x=>x.qualifiedFoundryDrc=true,
  x=>x.measuredSilicon=true,
  x=>x.realWorldBuildSuccessPercent=99,
  x=>x.physicalVerdict='pass'
 ]){
  const r=structuredClone(good);f(r);
  assert.equal(check(r,good).ok,false);
 }
 assert.equal(check(good,{...good,sameFinalLayoutAsPhase21:false,sameFinalNetlistAsPhase21:true}).ok,false);
});
