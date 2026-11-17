import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFaultModel,injectHypotheticalFault,buildConditionalFaultTree} from '../js/evidence/phase51-fault-analysis.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const d=read('../benchmarks/phase51/fault-model-scope.json');
const inputs={candidate:read('../benchmarks/phase41/reference-hardware-candidate.json'),
 battery:read('../benchmarks/phase43/e91-assumptions.json'),
 wire:read('../benchmarks/phase44/copper-harness-assumptions.json'),
 motor:read('../benchmarks/phase45/pololu1592-endpoint-model.json'),
 uncertainty:read('../benchmarks/phase50/uncertainty-envelope.json'),
 identifiability:read('../benchmarks/phase49/synthetic-identifiability.json')};
test('Fault source registry explicitly has zero observed component failures and physical rates',()=>{
 assert.equal(verifyFaultModel(d,inputs),true);
 assert.equal(d.modeledFaultCases.length,8);
 assert.equal(d.actualObservedFailureRates,null);
 assert.equal(d.independentFailureModeDetectionCoverage,null);
});
test('Ideal disconnected battery and open wire have zero DC conduction in mathematical model',()=>{
 for(const fault of ['battery-disconnected','wire-open']){
  const r=injectHypotheticalFault(d,inputs,fault);
  assert.deepEqual(r.faultedHypotheticalStoppedRotorCurrentRangeA,{lower:0,upper:0});
  assert.equal(r.actualHardwareSensorFailureDetected,false);
  assert.equal(r.physicalFailureProbability,null);
 }
});
test('Stopped motor and degraded contacts remain hypothetical bounded electrical examples',()=>{
 const stop=injectHypotheticalFault(d,inputs,'locked-rotor');
 const corrode=injectHypotheticalFault(d,inputs,'contact-corrosion');
 const correlated=injectHypotheticalFault(d,inputs,'correlated-pack-and-contacts');
 assert.ok(stop.faultedHypotheticalStoppedRotorCurrentRangeA.upper>
  stop.faultedHypotheticalStoppedRotorCurrentRangeA.lower);
 assert.ok(corrode.faultedHypotheticalStoppedRotorCurrentRangeA.upper>
  corrode.faultedHypotheticalStoppedRotorCurrentRangeA.lower);
 assert.ok(Math.abs(corrode.faultedHypotheticalStoppedRotorCurrentRangeA.lower-
  correlated.faultedHypotheticalStoppedRotorCurrentRangeA.lower)<1e-12);
 assert.equal(correlated.syntheticFaultIndicator.correlatedElectricalAssumptions,true);
 assert.equal(correlated.independentPhysicalFaultCoverage,null);
});
test('Stuck tach and invalid temperature sensor cannot claim detection or safe operation',()=>{
 const tach=injectHypotheticalFault(d,inputs,'tach-stuck');
 const thermal=injectHypotheticalFault(d,inputs,'temperature-sensor-invalid');
 assert.equal(tach.syntheticFaultIndicator.noIndependentTachMeasurement,true);
 assert.equal(thermal.syntheticFaultIndicator.noIndependentThermalMeasurement,true);
 assert.equal(tach.independentFaultDetectionConfirmed,false);
 assert.equal(thermal.physicalSafeOperatingLimitsKnown,false);
});
test('Impeller attachment fault is a software hazard, never approval to spin',()=>{
 const x=injectHypotheticalFault(d,inputs,'impeller-detachment');
 assert.equal(x.syntheticFaultIndicator.mechanicalContainmentNotQualified,true);
 assert.equal(x.hardwareTestingAuthorized,false);
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Symbolic OR, AND and joint dependency do not assert independent failure frequencies',()=>{
 const x=buildConditionalFaultTree(d,inputs);
 assert.equal(x.noMotionPossibleCauses.operator,'OR');
 assert.equal(x.hiddenHazardExample.operator,'AND');
 assert.equal(x.correlatedSourceExample.operator,'JOINT_INPUT');
 assert.equal(x.independenceAssumptionsValidated,false);
 assert.equal(x.physicalSystemReliability,null);
 assert.equal(x.physicalSafetyAcceptance,'NO_GO_UNQUALIFIED_HARDWARE_AND_MISSING_EXPERIMENT');
 assert.ok(Object.isFrozen(x));
});
test('No invented source reliability, safety threshold or success rate is accepted',()=>{
 const edits=[
  x=>x.realUnitFailureCounts=1,
  x=>x.realUnitExposureOperatingHours=200,
  x=>x.independentFaultInjectionExperiments=4,
  x=>x.actualObservedFailureRates={failureRate:0},
  x=>x.independentFailureModeDetectionCoverage=.99,
  x=>x.sourceQualifiedFaultFrequencyDistributions=[{rate:0}],
  x=>x.correlatedFailureProbabilityModel={p:.1},
  x=>x.validatedComponentSafetyThresholds={A:4},
  x=>x.actualManufacturerEnvironmentalAgingDataForAssembly=[],
  x=>x.physicalAssemblyFaultTestApproved=true,
  x=>x.safeImpellerOperationApproved=true,
  x=>x.manufacturingReliabilityOrYieldEstimate=.99,
  x=>x.modeledFaultCases.pop(),
  x=>x.modeledFaultCases[0].type='safe',
  x=>x.physicalVerdict='pass',
  x=>x.realWorldBuildSuccessPercent=99
 ];
 for(const change of edits){const copy=structuredClone(d);change(copy);
  assert.throws(()=>verifyFaultModel(copy,inputs));}
 assert.throws(()=>injectHypotheticalFault(d,inputs,'unsafe-new-fault'));
});
