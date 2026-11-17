import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyBatteryAssumptions,evaluateBatteryScenario,inspectBatteryCapture}
 from '../js/evidence/phase43-battery-model.js';
import {sha256,COLUMNS} from '../js/measure/phase42-capture-gate.js';
const a=JSON.parse(readFileSync(new URL('../benchmarks/phase43/e91-assumptions.json',import.meta.url)));
const b=JSON.parse(readFileSync(new URL('../benchmarks/phase41/reference-hardware-candidate.json',import.meta.url)));
const p=JSON.parse(readFileSync(new URL('../benchmarks/phase42/physical-capture-protocol.json',import.meta.url)));
const run=(current,temp)=>evaluateBatteryScenario(a,b,{assumedCurrentA:current,ambientTemperatureC:temp});
const near=(v,exp)=>assert.ok(Math.abs(v-exp)<=1e-10,v+' not '+exp);
test('E91 manufacturer reference is frozen as typical, not OCV/discharge curve',()=>{
 assert.equal(verifyBatteryAssumptions(a,b),true);
 assert.equal(a.publishedNominalCellVoltageV,1.5);
 assert.deepEqual(a.publishedFreshCellInternalResistanceRangeOhm,[0.15,0.3]);
 assert.equal(a.experimentalCalibrationInputs.calibratedOpenCircuitV,null);
 assert.equal(a.physicalSampleCount,0);
});
test('Independent algebraic oracle: open-circuit hypothetical 0A, 0.5A and 4A',()=>{
 const zero=run(0,21),half=run(0.5,21),stall=run(4,21);
 near(zero.counterfactualTerminalVoltageV.min,3);
 near(zero.counterfactualVoltageDropV.max,0);
 near(half.counterfactualTerminalVoltageV.min,2.7);
 near(half.counterfactualTerminalVoltageV.max,2.85);
 near(half.counterfactualBatteryInternalLossW.min,0.075);
 near(half.counterfactualBatteryInternalLossW.max,0.15);
 near(stall.counterfactualTerminalVoltageV.min,0.6);
 near(stall.counterfactualTerminalVoltageV.max,1.8);
 near(stall.counterfactualBatteryInternalLossW.max,9.6);
 assert.equal(stall.canInferFeasibleBatteryPackCurrent,false);
 assert.equal(stall.canInferRuntimeOrAging,false);
 assert.equal(stall.physicalValidation,'none');
 assert.equal(stall.realWorldBuildSuccessPercent,null);
});
test('Loss and voltage bounds monotone over hypothetical source-current sweep',()=>{
 let last=Infinity,lastLoss=0;
 for(let i=0;i<=80;i++){
  const x=run(i/20,21);
  assert.ok(x.counterfactualTerminalVoltageV.min<=last+1e-12);
  assert.ok(x.counterfactualBatteryInternalLossW.max>=lastLoss-1e-12);
  last=x.counterfactualTerminalVoltageV.min;
  lastLoss=x.counterfactualBatteryInternalLossW.max;
  assert.ok(Object.isFrozen(x.counterfactualVoltageDropV));
 }
});
test('Temperature range does NOT imply an independently measured temperature-resistance surface',()=>{
 const cold=run(0.5,-18),hot=run(0.5,55);
 near(cold.counterfactualTerminalVoltageV.min,hot.counterfactualTerminalVoltageV.min);
 assert.equal(cold.referenceTemperatureNotBatteryTemperatureMeasurement,true);
 assert.equal(hot.physicalModelCalibrated,false);
});
test('Bad scenario types, negative current or outside source temperatures fail closed',()=>{
 for(const [current,temp] of [[-1,21],[4.1,21],[NaN,21],[Infinity,21],['4',21],
 [0,-19],[0,56],[0,NaN],[undefined,21]]){
  assert.throws(()=>run(current,temp));
 }
});
test('All source and missing-measurement assertions remain immutable',()=>{
 const mutators=[
  x=>x.cellCountInSeries=3,
  x=>x.manufacturerPart='AA-GENERIC',
  x=>x.publishedNominalCellVoltageV=1.6,
  x=>x.publishedFreshCellInternalResistanceRangeOhm=[0.01,0.4],
  x=>x.manufacturerDatasourceUrl='https://example.org/battery',
  x=>x.scenarioCurrentRangeA=[0,100],
  x=>x.simulationReferenceTemperatureC=30,
  x=>x.nominalCellVoltageIsNotMeasuredOpenCircuitVoltage=false,
  x=>x.freshCellResistanceNotGuaranteedAcrossCurrentTemperatureAge=false,
  x=>x.experimentalCalibrationInputs.calibratedDynamicResistanceOhm=.3,
  x=>x.experimentalCalibrationInputs.actualBatteryPackSerials=['fabricated'],
  x=>x.experimentalCalibrationInputs.SOC_OCV_curve=[3,2],
  x=>x.experimentalCalibrationInputs.independentCalibrationReport='certified',
  x=>x.physicalSampleCount=1000,
  x=>x.physicalValidation='complete',
  x=>x.realWorldBuildSuccessPercent=99
 ];
 for(const mutate of mutators){
  const x=structuredClone(a);mutate(x);assert.throws(()=>verifyBatteryAssumptions(x,b));
 }
});
test('Even self-hashed CSV with all metadata stays quarantined, never calibrates battery',()=>{
 const raw=COLUMNS.join(',')+'\n'+[
  '0,3,2.5,0.2,0,21,21',
  '0.1,2.96,2.45,0.3,100,22,21',
  '0.2,2.93,2.41,0.4,200,23,21'
 ].join('\n')+'\n';
 const md=Object.fromEntries(p.requiredSourceMetadata.map(k=>[k,'unverified-test-record']));
 md.instrumentList=[{model:'unverified'}];
 md.instrumentCalibrationReviewRefs=['unverified'];
 md.rawFileSHA256=sha256(raw);md.designId=p.referenceDesignId;
 const result=inspectBatteryCapture(a,b,p,raw,md);
 assert.equal(result.submission.sourceHashInternallyConsistent,true);
 assert.equal(result.batteryModelUpdated,false);
 assert.equal(result.independentlyQualifiedBatterySpecimens,0);
 assert.equal(result.certifiedBatteryDataPointsAccepted,0);
 assert.equal(result.estimatedSOC,null);
 assert.equal(result.physicalValidation,'none');
 assert.equal(result.realWorldBuildSuccessPercent,null);
});
