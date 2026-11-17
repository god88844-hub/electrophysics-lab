import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyWholeSystemReadiness,evaluateWholeSystemNumericalReadiness}
 from '../js/evidence/phase48-whole-system-gate.js';
import {simulateCoupledHypothesis} from '../js/evidence/phase47-coupled-solver.js';
const get=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const gate=get('../benchmarks/phase48/whole-system-readiness.json');
const coupled=get('../benchmarks/phase47/coupled-hypotheses.json');
const models={candidate:get('../benchmarks/phase41/reference-hardware-candidate.json'),
 protocol:get('../benchmarks/phase42/physical-capture-protocol.json'),
 battery:get('../benchmarks/phase43/e91-assumptions.json'),
 wire:get('../benchmarks/phase44/copper-harness-assumptions.json'),
 motor:get('../benchmarks/phase45/pololu1592-endpoint-model.json'),
 fan:get('../benchmarks/phase46/fan-affinity-assumptions.json')};
function numericalReport(){
 return {format:'invention-lab/phase48-multi-regime-conditional-source-replay/1',
  referenceDesignId:gate.referenceDesignId,
  runs:gate.comparisonCases.map(c=>({label:c.label,
   output:simulateCoupledHypothesis(coupled,models,{
    fanTorqueCoefficientNmPerRadPerS_Squared:c.fanTorqueCoefficient,
    batteryInternalResistanceOhm:c.batteryResistanceOhm})}))};
}
test('Whole system physical gates are explicitly missing; software source readiness is separate',()=>{
 assert.equal(verifyWholeSystemReadiness(gate,models),true);
 assert.equal(gate.requiredIndependentRealWorldGates.length,10);
 assert.equal(gate.originalPhysicalSamples,0);
 assert.equal(gate.physicalPredictionInterval,null);
 assert.equal(gate.actualPhysicalWholeSystemValidationComplete,false);
});
test('Five source-bound hypothetical numerical conditions meet internal conservation only',()=>{
 const r=evaluateWholeSystemNumericalReadiness(gate,models,numericalReport());
 assert.equal(r.hypotheticalScenarioCount,5);
 assert.equal(r.numericalEvidenceChecked,true);
 assert.equal(r.independentlyObservedRealFanTests,0);
 assert.equal(r.physicalValidationPassed,false);
 assert.equal(r.physicalValidationOutcome,'BLOCKED_UNMEASURED_SOURCE_MATCHED_HARDWARE');
 assert.equal(r.actualSystemSuccessProbability,null);
 assert.ok(Object.isFrozen(r.results));
});
test('Unseen physical validation cannot be created by a numerical zero residual',()=>{
 const r=evaluateWholeSystemNumericalReadiness(gate,models,numericalReport());
 assert.ok(r.results.every(x=>Number.isFinite(x.finalHypotheticalRpm)));
 assert.equal(r.realWorldBuildSuccessPercent,null);
 assert.equal(r.physicalVerdict,'unknown');
});
test('Tampered manufacturer conditions or case labels cannot pass',()=>{
 const mutants=[
  r=>r.runs[0].label='really-measured-fan',
  r=>r.runs[0].output.assumedBatteryInternalResistanceOhm=0,
  r=>r.runs[0].output.fullEnergyBalanceResidualJ=2,
  r=>r.runs[0].output.finalShaftRpm=Infinity,
  r=>r.runs[1].output.physicalValidation='complete',
  r=>r.runs[2].output.calibratedAgainstSourceMatchedPhysicalSystem=true,
  r=>r.runs[2].output.realWorldBuildSuccessPercent=100,
  r=>r.runs.pop(),
  r=>r.referenceDesignId='unknown-fan'
 ];
 for(const change of mutants){
  const original=structuredClone(numericalReport());change(original);
  assert.throws(()=>evaluateWholeSystemNumericalReadiness(gate,models,original));
 }
});
test('Protect every actual physical evidence prerequisite from false acceptance',()=>{
 const mutants=[
  g=>g.originalPhysicalSamples=100,
  g=>g.independentPhysicalAssembledDeviceSpecimens=5,
  g=>g.physicalOperatingEnvelopesQualified=1,
  g=>g.physicalBuildProbability=.99,
  g=>g.physicalPredictionInterval=[-1,1],
  g=>g.hardwareFanMechanicalSafetyQualified=true,
  g=>g.independentSourceHardwareHoldoutComplete=true,
  g=>g.preregisteredCriteriaPhysicallyTested=true,
  g=>g.actualPhysicalWholeSystemValidationComplete=true,
  g=>g.modelCompanionUncertaintyBounds=[0,1],
  g=>g.predictionModelValidatedAgainstRealHardware=true,
  g=>g.requiredIndependentRealWorldGates[0].physicalStatus='pass',
  g=>g.requiredIndependentRealWorldGates.pop(),
  g=>g.comparisonCases[0].fanTorqueCoefficient=10,
  g=>g.numericalComparisonToleranceRpm=1e9,
  g=>g.numericalComparisonToleranceMotorTempC=1000,
  g=>g.numericalEnergyResidualToleranceJ=100,
  g=>g.realWorldBuildSuccessPercent=99,
  g=>g.physicalVerdict='pass'
 ];
 for(const change of mutants){
  const invalid=structuredClone(gate);change(invalid);
  assert.throws(()=>verifyWholeSystemReadiness(invalid,models));
 }
});
