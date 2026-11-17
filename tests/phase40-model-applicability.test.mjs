import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyModelRegistry,assessModelApplicability,auditRegistryCoverage} from '../js/evidence/phase40-model-applicability.js';
const registry=JSON.parse(readFileSync(new URL('../benchmarks/phase40/model-registry.json',import.meta.url)));
const matching=()=>({designId:'source-lab-motor3',intendedUse:'Test independent PG speed at original publisher setpoints',
 device:{topology:'BLDC-driver',type:'brake-bench-motor',identifier:'STEPPEROLINE 57BYA54-24-01'},
 conditions:{motorRatedVoltageV:{value:24,unit:'V'},
  brakeControllerSettingMilliamp:{value:96,unit:'mA'},
  controllerSpeedSetpointRpm:{value:2500,unit:'rpm'}}});
const evaluate=(id,target)=>assessModelApplicability(registry,id,target);
test('Frozen model passports register original source and unverified target scope',()=>{
 assert.equal(verifyModelRegistry(registry),true);
 assert.equal(registry.models.length,3);
 assert.equal(registry.models.every(m=>m.evidence.realWorldBuildSuccessPercent===null),true);
 assert.equal(registry.models.every(m=>m.evidence.independentInstrumentTraceabilityCertified===false),true);
});
test('Matching publisher model supports only reference-condition comparison, not physical qualification',()=>{
 const r=evaluate('phase36-two-regime-bldc',matching());
 assert.equal(r.scopeVerdict,'matching-reference-conditions');
 assert.equal(r.meetsIndependentPhysicalValidationGate,false);
 assert.equal(r.effectivePhysicalValidation,'none');
 assert.equal(r.physicalManufacturingSuccessRatePercent,null);
 assert.equal(r.calibratedTargetPredictionInterval,null);
 assert.ok(Object.isFrozen(r));
});
test('Reject cross-device transfer from 24 V BLDC into 3 V brushed battery and fan',()=>{
 const m=matching();
 m.device={topology:'brushed-DC-direct',type:'fan-motor',identifier:'invented-battery-fan'};
 m.conditions.motorRatedVoltageV.value=3;
 const r=evaluate('phase36-two-regime-bldc',m);
 assert.equal(r.scopeVerdict,'incompatible');
 assert.ok(r.incompatibleIdentityOrUnits.length>=2);
 assert.ok(r.outsideReferenceConditions.length>=1);
 assert.equal(r.physicalManufacturingSuccessRatePercent,null);
});
test('Operating point outside source range is incompatible and missing conditions fail closed',()=>{
 const m=matching();m.conditions.controllerSpeedSetpointRpm.value=2600;
 assert.equal(evaluate('phase36-two-regime-bldc',m).scopeVerdict,'incompatible');
 m.conditions.controllerSpeedSetpointRpm.value=2100;
 assert.equal(evaluate('phase35-published-bldc',m).scopeVerdict,'incompatible');
 delete m.conditions.brakeControllerSettingMilliamp;
 assert.equal(evaluate('phase36-two-regime-bldc',m).scopeVerdict,'insufficient-evidence');
});
test('Unit identity is not inferred, and interpolation point does not prove validation',()=>{
 const m=matching();m.conditions.motorRatedVoltageV.unit='mV';
 assert.equal(evaluate('phase36-two-regime-bldc',m).scopeVerdict,'incompatible');
 m.conditions.motorRatedVoltageV.unit='V';m.conditions.controllerSpeedSetpointRpm.value=2300;
 const r=evaluate('phase36-two-regime-bldc',m);
 assert.equal(r.scopeVerdict,'matching-reference-conditions');
 assert.equal(r.referenceConditionMatchDoesNotProvePopulationGeneralization,true);
 assert.equal(r.meetsIndependentPhysicalValidationGate,false);
});
test('Illustrative model can never be upgraded from mathematical assumptions',()=>{
 const r=evaluate('phase31-illustrative-brushed-fan',{
  designId:'illustration-3v',intendedUse:'Illustrate theoretical DC motor and quadratic load',
  device:{topology:'brushed-DC-direct',type:'fan-motor',identifier:'unidentified-illustration'},
  conditions:{nominalSupplyVoltageV:{value:3,unit:'V'}}});
 assert.equal(r.scopeVerdict,'illustrative-only');
 assert.equal(r.effectivePhysicalVerdict,'unknown');
});
test('No user-provided success-rate assertion can change the model passport gate',()=>{
 const m=matching();m.externalValidation=true;m.realWorldBuildSuccessPercent=100;
 assert.equal(evaluate('phase36-two-regime-bldc',m).physicalManufacturingSuccessRatePercent,null);
});
test('Altered original motor identities and fabricated sensor certifications are refused',()=>{
 for(const edit of [
  x=>x.models[2].device.identifier='new-3V-fan',
  x=>x.models[2].evidence.matchedTarget3VFanPhysicalSamples=1,
  x=>x.models[2].evidence.independentPhysicalMotorUnits=50000,
  x=>x.models[2].evidence.independentInstrumentTraceabilityCertified=true,
  x=>x.models[2].evidence.physicallyQualifiedPopulationPredictionInterval=[-1,1],
  x=>x.models[2].evidence.physicalValidation='full',
  x=>x.models[2].evidence.realWorldBuildSuccessPercent=99,
  x=>x.models[2].provenance.publisherSourceCommit='0'.repeat(40),
  x=>x.models[2].conditions[0].max=200,
  x=>x.models.push(x.models[0])
 ]){
  const copy=structuredClone(registry);edit(copy);
  assert.throws(()=>verifyModelRegistry(copy));
 }
});
test('Batch audit never sums source sensor readings into manufactured units',()=>{
 const r=auditRegistryCoverage(registry,[{modelId:'phase36-two-regime-bldc',target:matching()}]);
 assert.equal(r.examinedDesigns,1);
 assert.equal(r.qualifiedForUnseenPhysicalBuilds,0);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Missing target identity and nonfinite operating values are refused',()=>{
 for(const edit of [x=>x.designId='',x=>x.intendedUse='short',
  x=>x.conditions.controllerSpeedSetpointRpm.value=Infinity,
  x=>x.conditions.controllerSpeedSetpointRpm.unit=null,
  x=>x.device=null]){
  const m=matching();edit(m);
  assert.throws(()=>evaluate('phase36-two-regime-bldc',m));
 }
 assert.throws(()=>evaluate('unknown-model',matching()));
});
