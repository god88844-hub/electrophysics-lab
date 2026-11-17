import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DATASETS} from '../js/measure/sky130-mdm.js';
import {FORMAT,REQUIRED_MODES,verifyPlan,analyzeVariation,replayVariation}
 from '../js/measure/phase26-reliability.js';
const plan=JSON.parse(readFileSync(new URL('../benchmarks/phase26/acceptance.json',import.meta.url)));
const metadata={commit:'a'.repeat(40),recordCommit:'a'.repeat(40),
 policySha256:'b'.repeat(64),recordPolicySha256:'b'.repeat(64)};
function measuredLike(g){
 return {sweep:{startV:-0.25,stopV:0.25,stepV:0.01,samples:51},
  rows:Array.from({length:51},(_,i)=>{
   const v=Number((-0.25+i*.01).toFixed(8)),currentA=g*v;
   return {voltageV:v,currentA,returnCurrentA:-currentA+1e-8};
  })};
}
const train=()=>measuredLike(.0020786462);
const hold=()=>measuredLike(.0019);
test('Frozen policy defines all independent failure mechanisms, not an estimated yield',()=>{
 assert.equal(verifyPlan(plan),true);
 assert.equal(plan.failureModes.length,12);
 assert.equal(new Set(plan.failureModes.map(x=>x.id)).size,12);
 assert.equal(REQUIRED_MODES.length,12);
 assert.equal(plan.actualALUSpecimens,0);
 assert.equal(plan.allowStatisticalYieldEstimate,false);
 assert.equal(plan.realWorldBuildSuccessPercent,null);
});
test('Observed two measured-specimen style samples produce descriptive conductance gap',()=>{
 const report=analyzeVariation(train(),hold(),plan);
 assert.equal(report.format,FORMAT);
 assert.equal(report.observedVariation.numberOfMeasuredSpecimens,2);
 assert.ok(Math.abs(report.observedVariation.specimens[0].conductanceS-.0020786462)<1e-12);
 assert.ok(Math.abs(report.observedVariation.specimens[1].conductanceS-.0019)<1e-12);
 assert.ok(report.observedVariation.differenceS>0);
 assert.equal(report.observedVariation.usableAsProcessSigma,false);
 assert.equal(report.observedVariation.usableAsYieldEstimate,false);
 assert.equal(report.observedVariation.observedSpanIsConfidenceInterval,false);
 assert.equal(report.observedVariation.hypotheticalProbes.length,5);
 assert.ok(report.observedVariation.hypotheticalProbes.every(p=>
  p.voltageV>=-.25&&p.voltageV<=.25));
 assert.equal(report.qualification.estimatedFIT,null);
 assert.equal(report.qualification.uncertaintyCoverage,null);
 assert.equal(report.physicalVerdict,'unknown');
});
test('Keep frozen original holdout residual; retrospective descriptive second slope never refits baseline',()=>{
 const a=analyzeVariation(train(),hold(),plan);
 assert.ok(Math.abs(a.observedVariation.modelHoldoutResidualRMSEA)>0);
 const b=analyzeVariation(train(),measuredLike(.0018),plan);
 assert.notEqual(a.observedVariation.modelHoldoutResidualRMSEA,b.observedVariation.modelHoldoutResidualRMSEA);
 assert.equal(a.observedVariation.specimens[0].conductanceS,b.observedVariation.specimens[0].conductanceS);
});
test('Malformed raw sweep or falsified physical specimen metadata fails',()=>{
 for(const change of [
  (a,b)=>b.rows.splice(2,1),
  (a,b)=>a.sweep.samples=50,
  (a,b)=>b.sweep.startV=-.5,
  (a,b)=>a.sweep.stopV=.3,
  (a,b)=>a.sweep.stepV=.02,
  (a,b)=>b.rows[20].voltageV=.99,
  (a,b)=>b.rows[20].currentA=Infinity,
  (a,b)=>b.rows[20].returnCurrentA=NaN,
  (a,b)=>b.rows=structuredClone(a.rows)
 ]){
  const a=train(),b=hold();change(a,b);
  assert.throws(()=>analyzeVariation(a,b,plan));
 }
 assert.throws(()=>analyzeVariation(train(),train(),plan),/Same|specimen/);
});
test('Weakened model-source plan, hidden modes, invented lot count and arbitrary sigma fail',()=>{
 for(const change of [
  p=>p.allowBetweenLotVariationFit=true,
  p=>p.allowResistorToALUGeneralization=true,
  p=>p.allowStatisticalYieldEstimate=true,
  p=>p.allowAcceleratedLifetimeEstimate=true,
  p=>p.allowSpecimenBootstrapConfidence=true,
  p=>p.actualIndependentLotGroups=10,
  p=>p.actualALUSpecimens=20,
  p=>p.instrumentCalibrationVerified=true,
  p=>p.failureMechanismEvidenceVerified=true,
  p=>p.failureModes.pop(),
  p=>p.failureModes[0].requirement='no physical evidence needed',
  p=>p.realWorldBuildSuccessPercent=100,
  p=>p.diagnosticProbeVoltagesV.push(2),
  p=>p.sourceMeasurementCommit='latest'
 ]){
  const x=structuredClone(plan);change(x);
  assert.throws(()=>verifyPlan(x),/changed/);
 }
});
test('All twelve failure mechanisms explicitly unverified on target ALU',()=>{
 const x=analyzeVariation(train(),hold(),plan);
 assert.equal(x.failureAudit.length,12);
 for(const mode of x.failureAudit){
  assert.equal(mode.actualHardwareTested,false);
  assert.equal(mode.verifiedFailureRate,null);
  assert.equal(mode.verifiedStressTestHours,null);
  assert.equal(mode.evidenceLevel,'not-tested-on-target-alu');
 }
 assert.equal(x.qualification.recordedTargetCaptureVectors,0);
 assert.equal(x.qualification.independentWaferGroups,0);
 assert.equal(x.qualification.physicalALUSpecimens,0);
});
test('Independent replay rejects altered rates, stress life, yield, or physical verdict',()=>{
 const good=analyzeVariation(train(),hold(),plan);
 assert.equal(replayVariation(good,structuredClone(good),metadata).ok,true);
 for(const change of [
  x=>x.observedVariation.differenceS=0,
  x=>x.observedVariation.usableAsProcessSigma=true,
  x=>x.observedVariation.observedSpanIsConfidenceInterval=true,
  x=>x.observedVariation.independentLotCount=3,
  x=>x.observedVariation.specimens[0].conductanceS=.99,
  x=>x.qualification.physicalALUSpecimens=1,
  x=>x.qualification.recordedTargetCaptureVectors=1024,
  x=>x.qualification.estimatedPhysicalYield=.98,
  x=>x.qualification.estimatedLifetimeHours=1e6,
  x=>x.qualification.estimatedFIT=1.5,
  x=>x.qualification.confidenceInterval=[0,1],
  x=>x.qualification.targetReliabilityVerdict='pass',
  x=>x.failureAudit[3].verifiedFailureRate=0,
  x=>x.failureAudit[4].actualHardwareTested=true,
  x=>x.failureAudit[5].verifiedStressTestHours=100,
  x=>x.failureAudit[6].evidenceLevel='silicon-validated',
  x=>x.realWorldBuildSuccessPercent=100,
  x=>x.physicalValidation='calibrated',x=>x.physicalVerdict='pass'
 ]){
  const changed=structuredClone(good);change(changed);
  assert.equal(replayVariation(changed,good,metadata).ok,false);
 }
});
test('Corrupted policy fingerprint and source revision cannot survive independent replay',()=>{
 const good=analyzeVariation(train(),hold(),plan);
 for(const patch of [
  x=>x.commit='bad',
  x=>x.recordCommit='c'.repeat(40),
  x=>x.policySha256='z'.repeat(64),
  x=>x.recordPolicySha256='d'.repeat(64)
 ]){
  const m={...metadata};patch(m);
  assert.equal(replayVariation(good,good,m).ok,false);
 }
});
