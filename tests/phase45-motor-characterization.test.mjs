import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyMotorAssumptions,interpolateManufacturer3VPoint,
 evaluateCoupledStoppedRotorHypothesis,inspectMotorCapture}
 from '../js/evidence/phase45-motor-characterization.js';
import {sha256,COLUMNS} from '../js/measure/phase42-capture-gate.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const m=read('../benchmarks/phase45/pololu1592-endpoint-model.json');
const c=read('../benchmarks/phase41/reference-hardware-candidate.json');
const b=read('../benchmarks/phase43/e91-assumptions.json');
const w=read('../benchmarks/phase44/copper-harness-assumptions.json');
const protocol=read('../benchmarks/phase42/physical-capture-protocol.json');
const near=(a,v,t=1e-10)=>assert.ok(Math.abs(a-v)<t,a+' != '+v);
const caseAt=speed=>interpolateManufacturer3VPoint(m,c,{shaftRpm:speed});
const circuit=()=>evaluateCoupledStoppedRotorHypothesis(m,c,b,w,{
 eachConductorLengthM:0.25,wireTemperatureC:20,contactResistancePerContactOhm:0.01});
test('Pololu two approximate manufacturer endpoints never become a measured motor',()=>{
 assert.equal(verifyMotorAssumptions(m,c),true);
 assert.equal(m.independentPhysicalMotorSpecimensRecorded,0);
 assert.equal(m.manufacturerListingStatus,'discontinued');
 assert.equal(m.actualFanLoadTorqueCurve,null);
 assert.equal(m.physicalValidation,'none');
});
test('3V published stationary and no-load endpoint interpolation exact',()=>{
 const start=caseAt(0),free=caseAt(20000);
 near(start.externallyLoadedShaftTorqueNm,55*9.80665e-5);
 near(start.nominalManufacturerCurrentA,4);
 near(start.hypotheticalShaftMechanicalPowerW,0);
 near(free.externallyLoadedShaftTorqueNm,0);
 near(free.nominalManufacturerCurrentA,0.35);
 near(free.hypotheticalShaftMechanicalPowerW,0);
 near(free.hypotheticalMotorElectricalInputPowerW,1.05);
 assert.equal(free.physicalValidation,'none');
});
test('Half speed mechanical and electric power obey approximate source endpoint lines',()=>{
 const p=caseAt(10000);
 near(p.externallyLoadedShaftTorqueNm,55*9.80665e-5*0.5);
 near(p.nominalManufacturerCurrentA,(4+.35)/2);
 near(p.hypotheticalShaftMechanicalPowerW,
   55*9.80665e-5*.5 *10000*(2*Math.PI/60));
 near(p.hypotheticalMotorElectricalInputPowerW,6.525);
 assert.ok(p.hypotheticalUnmodeledLossesW>0);
 assert.equal(p.cannotInfer3VFanOperatingSpeed,true);
 assert.equal(p.realWorldBuildSuccessPercent,null);
});
test('Numerical sample grid is internally nonnegative but not physically calibrated',()=>{
 for(let speed=0;speed<=20000;speed+=1250){
  const p=caseAt(speed);
  assert.ok(p.nominalManufacturerCurrentA>=.35-1e-12);
  assert.ok(p.hypotheticalShaftMechanicalPowerW>=0);
  assert.ok(p.hypotheticalUnmodeledLossesW>=-1e-12);
  assert.equal(p.motorSafetyOrLifeCertification,false);
 }
});
test('Coupled fixed nominal battery, harness and stopped motor conserve voltage',()=>{
 const r=circuit();
 const diameter=0.127e-3*Math.pow(92,12/39);
 const area=Math.PI*diameter**2/4;
 const wireR=(1/58000000)*0.5/area+0.02;
 near(r.assumedMotorStoppedRotorResistanceOhm,0.75);
 near(r.assumedHarnessResistanceOhm,wireR);
 assert.equal(r.cases.length,2);
 for(const [i,x] of r.cases.entries()){
  const batteryR=[.3,.6][i],independentCurrent=3/(.75+batteryR+wireR);
  near(x.hypotheticalStoppedRotorCurrentA,independentCurrent);
  near(x.hypotheticalMotorTerminalVoltageV,independentCurrent*.75);
  near(x.hypotheticalWireAndContactDropV,independentCurrent*wireR);
  near(x.hypotheticalPackSagV,independentCurrent*batteryR);
  near(x.hypotheticalBatteryInternalDissipationW,independentCurrent**2*batteryR);
  near(x.voltageBalanceResidualV,0);
 }
 assert.ok(r.cases[0].hypotheticalStoppedRotorCurrentA>r.cases[1].hypotheticalStoppedRotorCurrentA);
 assert.equal(r.fanLoadedOperatingSpeedRpm,null);
 assert.equal(r.actualStallTorqueAtSagVoltageNm,null);
 assert.equal(r.simulatedCurrentCannotBeEquatedWithMeasuredStartupA,true);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Missing fan identity, source OCV, real wiring and current protection cannot be overcome by a DC equation',()=>{
 const r=circuit();
 assert.equal(r.sourceNominalVoltageIsNotVerifiedBatteryOCV,true);
 assert.equal(r.safeContinuousCurrentA,null);
 assert.equal(r.shaftFanMechanicalSafetyApproved,false);
 assert.equal(r.physicalSpecimensMeasured,0);
 assert.equal(r.physicalVerdict,'unknown');
});
test('Out of envelope, false zero/negative speed, nonfinite and guessed motor parts refuse interpolation',()=>{
 for(const speed of [-1,20000.1,NaN,Infinity,'3000',null,undefined])
  assert.throws(()=>caseAt(speed));
 assert.throws(()=>evaluateCoupledStoppedRotorHypothesis(m,c,b,w,{
  eachConductorLengthM:100,wireTemperatureC:20,contactResistancePerContactOhm:0.01}));
});
test('Forged physical calibration, altered manufacturer data and fake impeller certification rejected',()=>{
 const changes=[
  x=>x.motorManufacturerPart='another',
  x=>x.nominalCharacterizationVoltageV=24,
  x=>x.publishedApproximateNoLoadSpeedRpm=17000,
  x=>x.publishedApproximateNoLoadCurrentA=0,
  x=>x.publishedApproximateStallCurrentA=.35,
  x=>x.publishedApproximateStallTorqueGfCm=0,
  x=>x.publishedValuesAreApproximateNotPerSpecimenCalibration=false,
  x=>x.curveNotMeasuredContinuousTorqueSpeedData=false,
  x=>x.noLoadRpmCorrected2019=false,
  x=>x.torqueConversionGFcmToNm=.01,
  x=>x.hypotheticalMotorWindingResistanceOhmFromStall=.1,
  x=>x.effectiveArmatureResistanceIsNotMeasured=false,
  x=>x.physicalMotorI_V_RpmCurve=[{torque:999}],
  x=>x.motorLifetimeDistribution={averageHours:999},
  x=>x.independentPhysicalMotorSpecimensRecorded=100,
  x=>x.actualFanLoadTorqueCurve=[1,2,3],
  x=>x.mechanicalSafeAttachmentVerified=true,
  x=>x.electricalHighCurrentSafetyVerified=true,
  x=>x.physicalVerdict='pass',
  x=>x.realWorldBuildSuccessPercent=99
 ];
 for(const f of changes){const x=structuredClone(m);f(x);assert.throws(()=>verifyMotorAssumptions(x,c));}
});
test('Even consistent supplied motor sensor file remains unqualified',()=>{
 const raw=COLUMNS.join(',')+'\n'+[
  '0,3,2.6,0.4,500,21,21',
  '0.1,2.9,2.4,0.7,600,22,21',
  '0.2,2.8,2.3,0.8,650,23,21'
 ].join('\n')+'\n';
 const meta=Object.fromEntries(protocol.requiredSourceMetadata.map(k=>[k,'self-reported']));
 meta.rawFileSHA256=sha256(raw);meta.instrumentList=[{id:'self-reported'}];
 meta.instrumentCalibrationReviewRefs=['self-reported'];meta.designId=protocol.referenceDesignId;
 const a=inspectMotorCapture(m,c,protocol,raw,meta);
 assert.equal(a.intake.sourceHashInternallyConsistent,true);
 assert.equal(a.manufacturerCurveRecalibrated,false);
 assert.equal(a.independentPhysicalSpecimensAccepted,0);
 assert.equal(a.motorTorqueCurrentCurveCalibrated,false);
 assert.equal(a.mechanicalSafetyVerified,false);
 assert.equal(a.realWorldBuildSuccessPercent,null);
});
