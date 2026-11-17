import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyCoupledHypotheses,deriveMotorSIFromPublishedPoints,simulateCoupledHypothesis} from '../js/evidence/phase47-coupled-solver.js';
const data=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const p=data('../benchmarks/phase47/coupled-hypotheses.json');
const models={candidate:data('../benchmarks/phase41/reference-hardware-candidate.json'),
 battery:data('../benchmarks/phase43/e91-assumptions.json'),
 wire:data('../benchmarks/phase44/copper-harness-assumptions.json'),
 motor:data('../benchmarks/phase45/pololu1592-endpoint-model.json'),
 fan:data('../benchmarks/phase46/fan-affinity-assumptions.json')};
const run=(options={})=>simulateCoupledHypothesis(p,models,options);
test('The five-domain model chain has exact original identities and no hardware calibration',()=>{
 assert.equal(verifyCoupledHypotheses(p,models),true);
 assert.equal(p.measuredFanTorqueCoefficient,null);
 assert.equal(p.measuredRotorFanInertiaKgM2,null);
 assert.equal(p.independentlyCalibratedWholeSystemSpecimens,0);
});
test('Manufacturer source endpoints disagree with one idealized SI k equality',()=>{
 const x=deriveMotorSIFromPublishedPoints(p);
 assert.equal(x.assumedKeVoltsPerRadPerSecond,x.assumedKtNmPerA);
 assert.ok(x.assumedKeVoltsPerRadPerSecond>0);
 assert.ok(Math.abs(x.mismatchAgainstManufacturerNetStallTorquePercent)>5);
 assert.equal(x.manufacturerEndpointMismatchIsUncalibrated,true);
});
test('All coupled energy terms are conservative for no fan, light and heavy hypothetical loads',()=>{
 const cases=[0,5e-10,1e-9].map(fanTorqueCoefficientNmPerRadPerS_Squared=>
  run({fanTorqueCoefficientNmPerRadPerS_Squared}));
 for(const result of cases){
  assert.equal(result.steps,400);
  assert.ok(result.finalShaftRpm>0);
  assert.ok(result.peakCurrentHypothesisA>0);
  assert.ok(result.fullEnergyBalanceResidualJ<1e-7);
  assert.ok(Math.abs(result.fullEnergyBalanceResidualJ)<1e-7);
  assert.ok(result.maximumPerStepEnergyResidualJ<1e-8);
  assert.ok(result.finalKineticEnergyGainJ>=0);
  assert.ok(result.allEnergyTermsJ.batteryDissipationJ>=0);
  assert.ok(result.allEnergyTermsJ.motorOhmicDissipationJ>=0);
  assert.ok(result.allEnergyTermsJ.fanShaftAerodynamicWorkJ>=0);
  assert.ok(result.finalMotorTemperatureC>=21);
  assert.equal(result.predictedActualFanAirflowM3s,null);
  assert.equal(result.actualImpellerMaximumPermittedRpm,null);
  assert.equal(result.realWorldBuildSuccessPercent,null);
  assert.equal(result.calibratedAgainstSourceMatchedPhysicalSystem,false);
 }
 assert.ok(cases[0].finalShaftRpm>cases[1].finalShaftRpm);
 assert.ok(cases[1].finalShaftRpm>cases[2].finalShaftRpm);
 assert.equal(cases[0].allEnergyTermsJ.fanShaftAerodynamicWorkJ,0);
 assert.ok(cases[2].allEnergyTermsJ.fanShaftAerodynamicWorkJ>0);
});
test('Increasing source series resistance reduces simulated speed and source current',()=>{
 const a=run({batteryInternalResistanceOhm:.3});
 const b=run({batteryInternalResistanceOhm:.6});
 assert.ok(a.finalShaftRpm>b.finalShaftRpm);
 assert.ok(a.peakCurrentHypothesisA>b.peakCurrentHypothesisA);
 assert.ok(Math.abs(a.fullEnergyBalanceResidualJ)<1e-7);
 assert.ok(Math.abs(b.fullEnergyBalanceResidualJ)<1e-7);
});
test('The output is an immutable software result, not an authorized physical run',()=>{
 const r=run();
 assert.equal(r.actualBatteryDynamicDischargeCalibration,false);
 assert.equal(r.motorSourceEndpointMismatchMeansNotCalibrated,true);
 assert.equal(r.thermalPropertiesAreIllustrative,true);
 assert.equal(r.physicalVerdict,'unknown');
 assert.ok(Object.isFrozen(r.allEnergyTermsJ));
});
test('Reject out-of-domain load and pack resistance, nonfinite and fake dynamics',()=>{
 for(const f of [-1,1.1e-9,NaN,Infinity,'1e-9',null])
  assert.throws(()=>run({fanTorqueCoefficientNmPerRadPerS_Squared:f}));
 for(const r of [-1,.29,.61,NaN,Infinity,'0.45'])
  assert.throws(()=>run({batteryInternalResistanceOhm:r}));
});
test('Any fictional calibrated inertia, torque coefficient, thermal parameters or source widening fail',()=>{
 const edits=[
  x=>x.assumedPackIdealOpenCircuitV=4,
  x=>x.assumedBatterySeriesResistanceOhm=1,
  x=>x.assumedMotorEffectiveResistanceOhm=.1,
  x=>x.rotorAndFanCombinedInertiaKgM2=1,
  x=>x.motorThermalCapacitanceJPerK=10000,
  x=>x.motorThermalResistanceKPerW=.01,
  x=>x.fanTorqueCoefficientRangeHypothesis=[0,1],
  x=>x.timeStepS=.5,
  x=>x.sourceModelIds.pop(),
  x=>x.measuredFanTorqueCoefficient=1e-9,
  x=>x.measuredRotorFanInertiaKgM2=.000002,
  x=>x.verifiedMotorKE_VsPerRad=.001,
  x=>x.measuredThermalResistanceKPerW=10,
  x=>x.independentlyCalibratedWholeSystemSpecimens=100,
  x=>x.physicalFanBuildSafeToRun=true,
  x=>x.physicalValidation='complete',
  x=>x.realWorldBuildSuccessPercent=100
 ];
 for(const edit of edits){const copy=structuredClone(p);edit(copy);
  assert.throws(()=>verifyCoupledHypotheses(copy,models));}
});
