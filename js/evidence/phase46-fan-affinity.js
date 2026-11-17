// Phase46: theoretical same-impeller fan affinity ratios, NEVER a measured
// impeller, qualified speed, flow, pressure, or drive torque coefficient.
import {verifyReferenceCandidate} from './phase41-hardware-readiness.js';
const FORM='invention-lab/phase46-symbolic-fan-affinity-reference/1';
const ok=(v,msg)=>{if(!v)throw Error(msg);};
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>{if(v&&typeof v==='object'){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;};
export function verifyFanReference(manifest,candidate){
 verifyReferenceCandidate(candidate);
 const a=structuredClone(manifest);
 ok(a?.format===FORM&&a.referenceDesignId===candidate.designId&&
  a.theory==='same-impeller-same-flow-regime-constant-air-density-affinity-ratios'&&
  a.theorySourceUrl==='https://handbook.ashrae.org/Handbooks/S24/SI/s24_ch21/S24_Ch21_si.aspx'&&
  a.crossReferenceUrl==='https://www.amca.org/educate/articles-and-technical-papers/amca-inmotion-articles/straightening-out-fan-curves.html',
  'Fan reference identity or source altered');
 ok(a.declaredDemonstrationReferenceRpm===1000&&
  eq(a.hypotheticalScenarioSpeedsRpm,[500,1000,1500])&&
  a.airflowExponent===1&&a.pressureExponent===2&&
  a.powerExponent===3&&a.torqueExponent===2,
  'Affinity exponents or illustration point falsified');
 ok(a.manufacturerImpellerPartNumber===null&&a.manufacturerImpellerMaxRatedRpm===null&&
  a.physicalImpellerDiameterM===null&&
  a.measuredReferenceAirflowM3s===null&&a.measuredReferencePressurePa===null&&
  a.measuredReferenceInputShaftPowerW===null&&
  a.measuredShaftTorqueCoefficient===null&&
  a.calibratedSystemCurve===null&&a.actualMeasuredFanDataPoints===0&&
  a.physicalImpellerSpinningApproved===false&&
  a.physicalExperimentPerformed===false&&
  a.mechanicalContainmentReviewApproved===false&&
  a.declaredReferenceSpeedNotAnAllowedPhysicalFanSpeed===true&&
  a.affinityIsNotAbsoluteFanCurve===true&&
  a.physicalValidation==='none'&&a.physicalVerdict==='unknown'&&
  a.realWorldBuildSuccessPercent===null,
  'Unmeasured impeller flow, safety or manufacturing evidence fabricated');
 return true;
}
export function evaluateFanAffinity(a,candidate,{hypotheticalRpm}){
 verifyFanReference(a,candidate);
 ok(finite(hypotheticalRpm)&&hypotheticalRpm>=0&&hypotheticalRpm<=2000,
   'Explicit mathematical demonstration only in [0,2000] RPM');
 const ratio=hypotheticalRpm/a.declaredDemonstrationReferenceRpm;
 return freeze({
  format:'invention-lab/phase46-dimensionless-fan-laws/1',
  hypotheticalRpm,
  sameImpellerAndAerodynamicSimilarityAssumed:true,
  ratioToArbitraryReferenceSpeed:ratio,
  normalizedAirflowRatio:ratio,
  normalizedPressureRatio:ratio*ratio,
  normalizedShaftPowerRatio:ratio**3,
  normalizedTorqueRatio:ratio*ratio,
  actualAirflowM3s:null,actualPressurePa:null,
  actualShaftPowerW:null,actualLoadTorqueNm:null,
  shaftSpeedSafetyLimitRpm:null,
  physicalFanSpecimensMeasured:0,
  qualification:'ONLY_DIMENSIONLESS_SCALING_NOT_ABSOLUTE_FAN_PREDICTION',
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 });
}
export function inspectFanCalibrationCandidate(a,candidate,metadata){
 verifyFanReference(a,candidate);
 const required=['impellerManufacturer','impellerPartNumber','impellerSpecimenId',
   'measuredImpellerDiameterM','manufacturerRatedMaxRpm','shaftRetentionReview',
   'guardEnclosureReview','flowStationCalibrationId','pressureCalibrationId',
   'torqueCalibrationId','originalRawFlowCurveSha256','originalRawPressureCurveSha256',
   'separateDeviceHoldoutSet','uncertaintyBudgetReview'];
 const fields=metadata&&typeof metadata==='object'?metadata:{};
 const missing=required.filter(k=>fields[k]===undefined||fields[k]===null||fields[k]==='');
 return freeze({
  format:'invention-lab/phase46-fan-acquisition-readiness/1',
  missingIdentificationAndReviewFields:missing,
  paperworkPresent:missing.length===0,
  sourceMatchToReferenceFan:false,
  actualPhysicalImpellerReviewed:false,
  physicalTestingAuthorized:false,
  acceptedIndependentPhysicalFlowMeasurements:0,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 });
}
