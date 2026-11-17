// Phase45: Pololu 1592 manufacturer approximate 3V endpoints, not measured
// performance of an actual specimen or fan. Battery + harness coupled
// hypothetical *stopped-rotor* ohmic circuit ONLY. No spin-up safety approval.
import {verifyReferenceCandidate} from './phase41-hardware-readiness.js';
import {inspectCaptureImport} from '../measure/phase42-capture-gate.js';
import {verifyBatteryAssumptions} from './phase43-battery-model.js';
import {verifyWireAssumptions,evaluateWireLoop} from './phase44-wire-loop.js';
export const MOTOR_FORMAT='invention-lab/phase45-pololu1592-manufacturer-two-point-motor/1';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const fail=(x,message)=>{if(!x)throw Error(message)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x};
export function verifyMotorAssumptions(m,candidate){
 verifyReferenceCandidate(candidate);
 const p=candidate.motor.publishedApproximateAt3V;
 fail(m?.format===MOTOR_FORMAT&&
  m.referenceDesignId===candidate.designId&&
  m.motorManufacturerPart==='1592'&&
  m.motorTechnology==='brushed-DC-direct'&&
  m.manufacturerListingStatus==='discontinued'&&
  m.manufacturerListingUrl==='https://www.pololu.com/product/1592/specs'&&
  same(m.recommendedVoltageRangeV,[1.5,3])&&
  m.nominalCharacterizationVoltageV===3&&
  m.publishedApproximateNoLoadSpeedRpm===p.noLoadRpm&&
  m.publishedApproximateNoLoadCurrentA===p.noLoadCurrentA&&
  m.publishedApproximateStallCurrentA===p.stallCurrentA&&
  m.publishedApproximateStallTorqueGfCm===p.stallTorqueGfCm&&
  m.publishedShaftDiameterMm===p.shaftDiameterMm,
  'Manufacturer approximate endpoint values or physical motor identity changed');
 fail(m.publishedValuesAreApproximateNotPerSpecimenCalibration===true&&
  m.curveModel==='straight-line-interpolation-between-two-published-3V-endpoints'&&
  m.curveNotMeasuredContinuousTorqueSpeedData===true&&
  m.noLoadRpmCorrected2019===true&&
  m.torqueConversionGFcmToNm===9.80665e-5&&
  m.hypotheticalMotorWindingResistanceOhmFromStall===0.75&&
  m.effectiveArmatureResistanceIsNotMeasured===true&&
  m.inputBatteryModelId==='phase43-E91-two-cell-nominal-ohmic-sensitivity'&&
  m.inputWireModelId==='phase44-AWG24-copper-loop-with-assumed-contacts',
  'Published-point interpolation promoted to measured motor dynamics or wrong phase chain');
 fail(m.independentPhysicalMotorSpecimensRecorded===0&&
  m.physicalMotorI_V_RpmCurve===null&&
  m.motorWindingResistanceByTemperature===null&&
  m.mechanicalFrictionMap===null&&
  m.motorLifetimeDistribution===null&&
  m.authenticatedMotorPhaseOrBrushVoltage===null&&
  m.shaftTemperatureAndWindingTemperature===null&&
  m.spinUpInertia===null&&
  m.actualFanLoadTorqueCurve===null&&
  m.mechanicalSafeAttachmentVerified===false&&
  m.electricalHighCurrentSafetyVerified===false&&
  m.realWorldBuildSuccessPercent===null&&
  m.physicalValidation==='none'&&m.physicalVerdict==='unknown',
  'Unmeasured motor, safety or manufacturing success fabricated');
 return true;
}
export function interpolateManufacturer3VPoint(m,candidate,{shaftRpm}){
 verifyMotorAssumptions(m,candidate);
 fail(finite(shaftRpm)&&shaftRpm>=0&&shaftRpm<=20000,
  'Only fixed manufacturer 3V endpoint interpolation within [0,20000] rpm');
 const speedFraction=shaftRpm/20000;
 const torqueNm=55*9.80665e-5*(1-speedFraction);
 const sourceCurrentA=4+(0.35-4)*speedFraction;
 const omega=shaftRpm*2*Math.PI/60;
 const mechW=torqueNm*omega,electricalW=3*sourceCurrentA;
 fail(mechW<=electricalW+1e-10,'Nonphysical approximate endpoint interpolation');
 return freeze({
  format:'invention-lab/phase45-conditional-3V-motor-point/1',
  shaftRpm,externallyLoadedShaftTorqueNm:torqueNm,
  nominalManufacturerCurrentA:sourceCurrentA,
  shaftAngularSpeedRadS:omega,
  hypotheticalShaftMechanicalPowerW:mechW,
  hypotheticalMotorElectricalInputPowerW:electricalW,
  hypotheticalUnmodeledLossesW:electricalW-mechW,
  effectiveArmatureResistanceOhmMeasured:null,
  cannotInfer3VFanOperatingSpeed:true,
  motorSafetyOrLifeCertification:false,
  classification:'TWO_PUBLISHED_ENDPOINT_INTERPOLATION_NOT_MEASURED_CURVE',
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 });
}
export function evaluateCoupledStoppedRotorHypothesis(m,candidate,battery,wire,{
 eachConductorLengthM,wireTemperatureC,contactResistancePerContactOhm
}){
 verifyMotorAssumptions(m,candidate);
 verifyBatteryAssumptions(battery,candidate);
 verifyWireAssumptions(wire,candidate);
 const w=evaluateWireLoop(wire,candidate,{
  eachConductorLengthM,wireTemperatureC,contactResistancePerContactOhm,currentA:0});
 const Rmotor=3/4,packR=[0.30,0.60];
 const fixedNominalSourceV=3;
 const cases=packR.map(Rbattery=>{
  const I=fixedNominalSourceV/(Rbattery+w.totalSeriesResistanceOhm+Rmotor);
  const batteryDrop=I*Rbattery,wireDrop=I*w.totalSeriesResistanceOhm,motorV=I*Rmotor;
  fail(Math.abs(fixedNominalSourceV-(batteryDrop+wireDrop+motorV))<1e-11,
    'Loss of conservation in strictly ohmic stopped-rotor hypothesis');
  return {
   assumedBatterySeriesResistanceOhm:Rbattery,
   hypotheticalStoppedRotorCurrentA:I,
   hypotheticalMotorTerminalVoltageV:motorV,
   hypotheticalPackSagV:batteryDrop,
   hypotheticalWireAndContactDropV:wireDrop,
   hypotheticalBatteryInternalDissipationW:I*I*Rbattery,
   hypotheticalWireAndContactDissipationW:I*I*w.totalSeriesResistanceOhm,
   hypotheticalMotorElectricalDissipationW:I*I*Rmotor,
   voltageBalanceResidualV:fixedNominalSourceV-batteryDrop-wireDrop-motorV
  };
 });
 fail(cases[0].hypotheticalStoppedRotorCurrentA>=cases[1].hypotheticalStoppedRotorCurrentA,
  'Expected current order by series source resistance');
 return freeze({
  format:'invention-lab/phase45-conditional-stopped-rotor-battery-wire-motor/1',
  referenceDesignId:m.referenceDesignId,
  assumedFixedNominalSourceVoltageV:fixedNominalSourceV,
  assumedMotorStoppedRotorResistanceOhm:Rmotor,
  assumedHarnessResistanceOhm:w.totalSeriesResistanceOhm,
  assumedHarnessInputs:{eachConductorLengthM,wireTemperatureC,contactResistancePerContactOhm},
  cases,
  sourceNominalVoltageIsNotVerifiedBatteryOCV:true,
  simulatedCurrentCannotBeEquatedWithMeasuredStartupA:true,
  fanLoadedOperatingSpeedRpm:null,
  actualStallTorqueAtSagVoltageNm:null,
  safeContinuousCurrentA:null,
  transientModelValidated:false,
  shaftFanMechanicalSafetyApproved:false,
  physicalSpecimensMeasured:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 });
}
export function inspectMotorCapture(m,candidate,protocol,raw,metadata){
 verifyMotorAssumptions(m,candidate);
 fail(protocol.referenceDesignId===candidate.designId,'Mismatched capture source');
 const intake=inspectCaptureImport(protocol,raw,metadata);
 return freeze({
  format:'invention-lab/phase45-quarantined-brushed-motor-sensor-evidence/1',
  intake,manufacturerCurveRecalibrated:false,
  independentPhysicalSpecimensAccepted:0,
  sourceMatchedMeasurementsQualified:0,
  motorTorqueCurrentCurveCalibrated:false,
  mechanicalSafetyVerified:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 });
}
