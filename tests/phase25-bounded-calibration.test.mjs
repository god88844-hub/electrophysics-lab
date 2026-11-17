import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ACCEPTANCE,verifyPolicy,computeDiagnostics,replayPhase25,FORMAT}
 from '../js/measure/phase25-bounded-calibration.js';
const policy=JSON.parse(readFileSync(new URL('../benchmarks/phase25/acceptance.json',import.meta.url)));
function specimen(g=0.002,offset=0,returnBalance=1e-8){
 const rows=Array.from({length:51},(_,i)=>{
  const v=Number((-0.25+i*0.01).toFixed(8));
  const currentA=g*v+offset;
  return {voltageV:v,currentA,returnCurrentA:-currentA+returnBalance};
 });
 return {sweep:{startV:-0.25,stopV:0.25,stepV:0.01,samples:51},rows};
}
const t=()=>specimen(0.0020786462,0);
const h=()=>specimen(0.0019,1e-6);
const meta={commitSha:'a'.repeat(40),sourceCommit:'a'.repeat(40),
 manifestSha256:'b'.repeat(64),sourceManifestSha256:'b'.repeat(64)};
test('Source frozen: exactly one real specimen for fit and one for holdout',()=>{
 assert.deepEqual(policy,ACCEPTANCE);
 assert.equal(verifyPolicy(policy),true);
 assert.equal(policy.sourceDatasetIds.length,2);
 assert.equal(policy.allowedHoldoutModelFitting,false);
 assert.equal(policy.allowedStatisticalPopulationCoverageClaim,false);
 assert.equal(policy.allowedRowWiseUncertaintyBootstrap,false);
});
test('Synthetic numerical unit test shows source-train-only slope and heldout residual',()=>{
 const a=computeDiagnostics(t(),h());
 assert.equal(a.format,FORMAT);
 assert.equal(a.fit.trainingReadings,51);
 assert.ok(Math.abs(a.fit.conductanceS-0.0020786462)<1e-14);
 assert.equal(a.holdout.readings,51);
 assert.ok(a.holdout.signedError.rms>0);
 assert.ok(a.holdout.signedError.maxAbs>0);
 assert.equal(a.holdout.statisticallyIndependentErrorSamples,1);
 assert.equal(a.uncertainty.populationPredictiveInterval,null);
 assert.equal(a.uncertainty.expandedMeasurementUncertaintyA,null);
 assert.equal(a.uncertainty.statisticalConfidenceLevel,null);
 assert.equal(a.intendedALU.hardwareMeasurements,0);
 assert.equal(a.intendedALU.physicalVerdict,'unknown');
});
test('Changing heldout specimen does not refit or tune the training conductance',()=>{
 const x=computeDiagnostics(t(),h()),y=computeDiagnostics(t(),specimen(0.0018,8e-7));
 assert.equal(x.fit.conductanceS,y.fit.conductanceS);
 assert.notEqual(x.holdout.signedError.rms,y.holdout.signedError.rms);
});
test('Two instrument terminal currents are a diagnostic, NOT a calibration certificate',()=>{
 const x=computeDiagnostics(t(),h()),y=computeDiagnostics(t(),specimen(0.0019,1e-6,9e-7));
 assert.ok(Math.abs(x.currentBalance.holdout.mean-1e-8)<1e-15);
 assert.ok(Math.abs(y.currentBalance.holdout.mean-9e-7)<1e-15);
 assert.equal(x.uncertainty.instrumentCalibrationChainVerified,false);
 assert.equal(y.uncertainty.populationPredictiveInterval,null);
});
test('Wrong device count, duplicate sweeps, shifted voltage and NaNs rejected',()=>{
 for(const mutate of [
  (a,b)=>b.rows.pop(),
  (a,b)=>b.rows[15].voltageV=123,
  (a,b)=>b.rows[15].currentA=NaN,
  (a,b)=>b.rows[15].returnCurrentA=Infinity,
  (a,b)=>a.sweep.samples=0,
  (a,b)=>b.sweep.startV=-0.30,
  (a,b)=>b.sweep.stopV=0.33,
  (a,b)=>{b.rows=structuredClone(a.rows);}
 ]){
  const a=t(),b=h();mutate(a,b);
  assert.throws(()=>computeDiagnostics(a,b));
 }
});
test('Policy weakening, waiving provenance, or inventing statistical confidence fails',()=>{
 for(const f of [
  p=>p.allowedHoldoutModelFitting=true,
  p=>p.allowedRowWiseUncertaintyBootstrap=true,
  p=>p.allowedStatisticalPopulationCoverageClaim=true,
  p=>p.independentInstrumentCertificatesAvailable=true,
  p=>p.calibrationErrorThresholdPrespecified=true,
  p=>p.holdoutLotIndependenceVerified=true,
  p=>p.estimatedPhysicalYield=1,
  p=>p.targetDut='verified-alu-chip',
  p=>p.realWorldBuildSuccessPercent=100,
  p=>p.onlyUseInEnvelope=[-10,10]
 ]){
  const p=structuredClone(policy);f(p);
  assert.throws(()=>verifyPolicy(p),/frozen/);
 }
});
test('Independent replay rejects altered model results, SHA, claimed ALU chip timing or yield',()=>{
 const basis=computeDiagnostics(t(),h());
 assert.equal(replayPhase25(basis,structuredClone(basis),meta).ok,true);
 for(const mutate of [
  r=>r.holdout.signedError.rms=0,
  r=>r.holdout.independentDeviceIds=51,
  r=>r.holdout.statisticallyIndependentErrorSamples=51,
  r=>r.uncertainty.populationPredictiveInterval=[0,1],
  r=>r.uncertainty.expandedMeasurementUncertaintyA=0,
  r=>r.uncertainty.statisticalConfidenceLevel=0.95,
  r=>r.uncertainty.estimatedProcessVariation=0.01,
  r=>r.intendedALU.calibrationPerformed=true,
  r=>r.intendedALU.uncertaintyQuantified=true,
  r=>r.intendedALU.hardwareMeasurements=1024,
  r=>r.intendedALU.physicalValidation='validated',
  r=>r.intendedALU.realWorldBuildSuccessPercent=99
 ]){
  const r=structuredClone(basis);mutate(r);
  assert.equal(replayPhase25(r,basis,meta).ok,false);
 }
 for(const mutate of [
  x=>x.commitSha='old',
  x=>x.sourceCommit='x'.repeat(40),
  x=>x.manifestSha256='0'.repeat(64)
 ]){
  const bad={...meta};mutate(bad);
  assert.equal(replayPhase25(basis,basis,bad).ok,false);
 }
});
