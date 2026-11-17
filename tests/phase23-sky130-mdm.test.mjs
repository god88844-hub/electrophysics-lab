import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ACCEPTANCE,DATASETS,README,parseMdm,fitAndHoldout,
  verifySourceFile,gitBlob,sha256,assemblePhase23,verifyPhase23}
  from '../js/measure/sky130-mdm.js';
import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase23/acceptance.json',import.meta.url)));
function syntheticMdm({start=-0.1,stop=0.1,step=0.01,conductance=0.001}={}){
 const n=Math.round((stop-start)/step)+1;
 const lines=[];
 for(let i=0;i<n;i++){
  const v=Number((start+i*step).toFixed(9));
  const current=Number((v*conductance).toPrecision(9));
  lines.push('  '+v+'    '+current+'    '+(-current)+'    ');
 }
 return ['! VERSION = 6.00','BEGIN_HEADER',' ICCAP_INPUTS',
   '  VU1        V  E GROUND SMU2 0.1 CON        0',
   '  VU2        V  S GROUND SMU3 0.1 CON        0',
   '  V2         V  B GROUND SMU1 0.015 CON        0',
   '  V1         V  C GROUND SMU4 0.015 LIN        1    '+start+'       '+stop+'        '+n+'   '+step,
   ' ICCAP_OUTPUTS','  I1         I  C GROUND SMU4 B',
   '  I2         I  B GROUND SMU1 B','END_HEADER','','BEGIN_DB',
   ' ICCAP_VAR VU1        0',' ICCAP_VAR VU2        0',
   ' ICCAP_VAR V2         0','',' #V1              I1              I2',
   ...lines,'END_DB',''].join('\n');
}
test('Phase23 exact public measured-data manifest is frozen and domain-scoped',()=>{
 assert.equal(manifest.format,ACCEPTANCE);
 assert.equal(manifest.upstreamCommit,'1f7214f2f81a0629303947a07e1ec00a28ae8a33');
 assert.equal(manifest.datasets[0].gitBlobSha1,DATASETS[0].gitBlobSha1);
 assert.equal(manifest.datasets[1].gitBlobSha1,DATASETS[1].gitBlobSha1);
 assert.equal(manifest.documentation.gitBlobSha1,README.gitBlobSha1);
 assert.equal(manifest.qualifications.sameDeviceAsPhase22Alu,false);
 assert.equal(manifest.qualifications.realWorldBuildSuccessPercent,null);
});
test('ICCAP sweep parser preserves original units and every increasing point',()=>{
 const a=parseMdm(syntheticMdm(),{expectedSamples:21});
 assert.equal(a.rows.length,21);
 assert.equal(a.units.currentA,'A');assert.equal(a.units.voltageV,'V');
 assert.equal(a.sweep.startV,-0.1);assert.equal(a.sweep.stopV,0.1);
 assert.ok(Math.abs(a.rows[20].currentA-0.0001)<1e-15);
 assert.equal(a.rows[10].voltageV,0);
});
test('Synthetic rows, poisoned headers, lost samples, duplicates, and nonfinite are rejected',()=>{
 const raw=syntheticMdm();
 const changes=[
  x=>x.replace('! VERSION = 6.00','! VERSION = UNKNOWN'),
  x=>x.replace('END_DB',''),
  x=>x.replace('ICCAP_OUTPUTS','ICCAP_OUTPUTS_OFF'),
  x=>x.replace(' #V1              I1              I2',' #V1              ID              I2'),
  x=>x.replace('  0.03    0.00003','  0.04    0.00003'),
  x=>x.replace('  0.03    0.00003    -0.00003    \n',''),
  x=>x.replace('  0.03    0.00003','  0.03    NaN'),
  x=>x.replace('        21   0.01','        22   0.01'),
  x=>x.replace('        21   0.01','        21   0.02')
 ];
 for(const f of changes){
  const corrupted=f(raw);
  assert.notEqual(corrupted,raw,'fixture corruption must actually modify source');
  assert.throws(()=>parseMdm(corrupted),/MDM|Missing|Truncated|Duplicate|Invalid|Malformed/);
 }
});
test('Real-source byte integrity requires immutable original Git blob, not a provenance boolean',()=>{
 const raw=Buffer.from(syntheticMdm());
 assert.equal(sha256(raw).length,64);assert.equal(gitBlob(raw).length,40);
 assert.throws(()=>verifySourceFile(raw,DATASETS[0]),/mismatch/);
 assert.throws(()=>verifySourceFile(raw,{...DATASETS[0],gitBlobSha1:'malformed'}),/Unpinned/);
});
test('Blind separate-specimen comparison fits training only, records heldout discrepancy',()=>{
 const train=parseMdm(syntheticMdm(),{expectedSamples:21});
 const testSample=parseMdm(syntheticMdm({start:-0.15,stop:0.15,conductance:0.0012}),{expectedSamples:31});
 const m=fitAndHoldout(train,testSample);
 assert.ok(Math.abs(m.fittedConductanceS-0.001)<1e-12);
 assert.equal(m.holdoutObservationsInsideTrainingEnvelope,21);
 assert.equal(m.holdoutObservationsTotal,31);
 assert.ok(m.heldOutRMSEA>0);
 assert.ok(m.heldOutMAEA>0);
 assert.equal(m.uncertaintyInterval,null);
 assert.equal(m.calibratedChipTiming,false);
 assert.equal(m.physicalAluMeasured,false);
});
test('Whole-sample holdout refuses identical envelope or too few heldout readings',()=>{
 const train=parseMdm(syntheticMdm());
 assert.throws(()=>fitAndHoldout(train,train),/Missing held-out/);
 assert.throws(()=>fitAndHoldout(train,parseMdm(syntheticMdm({start:-2,stop:2,step:0.5}))),/Missing held-out/);
});
test('Policy edits cannot silently re-label external resistor readings as validated ALU silicon',()=>{
 for(const change of [
  m=>m.datasets[1].purpose='training-only',
  m=>m.upstreamCommit='main',
  m=>m.qualifications.sameDeviceAsPhase22Alu=true,
  m=>m.qualifications.realWorldBuildSuccessPercent=100,
  m=>m.qualifications.instrumentCalibrationChainVerified=true,
  m=>m.datasets[0].gitBlobSha1='f'.repeat(40),
  m=>m.expectedColumns=['I1','I2','V1']
 ]){
  const changed=structuredClone(manifest);change(changed);
  assert.throws(()=>assemblePhase23(changed,{}),/frozen|policy|weakened/i);
 }
});
test('Independent replay rejects altered measured records, source commits and invented success',()=>{
 const recorded={
  physicalValidation:'none',physicalVerdict:'unknown',
  aluSiliconMeasurements:false,realWorldBuildSuccessPercent:null,
  physicalDomain:'separate-resistor-test-tile-devices-not-alu'
 };
 const meta={commitSha:'a'.repeat(40),reportCommitSha:'a'.repeat(40),
  manifestSha256:'b'.repeat(64),recordedManifestSha256:'b'.repeat(64)};
 assert.equal(verifyPhase23(recorded,structuredClone(recorded),meta).ok,true);
 for(const modify of [
  m=>m.commitSha='c'.repeat(40),
  m=>m.reportCommitSha='d'.repeat(40),
  m=>m.recordedManifestSha256='d'.repeat(64)
 ]){let x={...meta};modify(x);
  assert.equal(verifyPhase23(recorded,recorded,x).ok,false);
 }
 for(const modify of [
  e=>e.aluSiliconMeasurements=true,e=>e.realWorldBuildSuccessPercent=100,
  e=>e.physicalValidation='fully-calibrated',e=>e.physicalVerdict='pass',
  e=>e.physicalDomain='measured ALU'
 ]){let x=structuredClone(recorded);modify(x);
   assert.equal(verifyPhase23(x,recorded,meta).ok,false);
 }
});
