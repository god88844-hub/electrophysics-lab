// Phase48: separate numerical/model consistency from real system validation.
// A clean source and cross-language mathematical replay does NOT qualify hardware.
import {verifyReferenceCandidate} from './phase41-hardware-readiness.js';
import {verifyCaptureProtocol} from '../measure/phase42-capture-gate.js';
import {verifyFanReference} from './phase46-fan-affinity.js';
export const FORMAT='invention-lab/phase48-whole-system-validation-readiness/1';
const fail=(x,m)=>{if(!x)throw Error(m);};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
const ids=['identified-purchased-bom-and-specimens',
 'instrument-calibration-and-time-synchronization',
 'mechanical-containment-and-shaft-retention-review',
 'battery-and-wiring-current-thermal-protection-review',
 'measured-motor-and-battery-parameter-maps',
 'actual-fan-pressure-flow-and-load-torque-curves',
 'source-matched-whole-system-thermal-traces',
 'unseen-device-and-regime-holdout-samples',
 'measurement-uncertainty-and-repeatability-budget',
 'pre-registered-prediction-error-and-safety-acceptance'];
const cases=[{label:'no-fan-load',fanTorqueCoefficient:0,batteryResistanceOhm:.45},
 {label:'mid-fan-load',fanTorqueCoefficient:5e-10,batteryResistanceOhm:.45},
 {label:'heavy-fan-load',fanTorqueCoefficient:1e-9,batteryResistanceOhm:.45},
 {label:'low-battery-resistance',fanTorqueCoefficient:1e-9,batteryResistanceOhm:.3},
 {label:'high-battery-resistance',fanTorqueCoefficient:1e-9,batteryResistanceOhm:.6}];
export function verifyWholeSystemReadiness(r,{candidate,protocol,fan}){
 verifyReferenceCandidate(candidate);verifyCaptureProtocol(protocol);verifyFanReference(fan,candidate);
 fail(r?.format===FORMAT&&r.referenceDesignId===candidate.designId&&
  r.scope==='independent-mathematical-replay-not-physical-assembly-validation',
  'Whole-system validation purpose or target changed');
 fail(equal(r.requiredIndependentRealWorldGates,
  ids.map(id=>({id,physicalStatus:'missing'})))&&
  equal(r.comparisonCases,cases)&&
  r.independentNumericalComparator==='python3-stdlib-fourth-order-runge-kutta-vs-node-implicit-midpoint'&&
  r.numericalComparisonToleranceRpm===1&&
  r.numericalComparisonToleranceMotorTempC===.02&&
  r.numericalEnergyResidualToleranceJ===1e-7,
  'True physical gates or numerical acceptance tolerances weakened');
 fail(r.originalPhysicalSamples===0&&
  r.independentPhysicalAssembledDeviceSpecimens===0&&
  r.physicalOperatingEnvelopesQualified===0&&
  r.physicalPredictionInterval===null&&r.physicalBuildProbability===null&&
  r.hardwareFanMechanicalSafetyQualified===false&&
  r.independentSourceHardwareHoldoutComplete===false&&
  r.preregisteredCriteriaPhysicallyTested===false&&
  r.modelCompanionUncertaintyBounds===null&&
  r.predictionModelValidatedAgainstRealHardware===false&&
  r.phase48SoftwareEvidenceAuditReady===true&&
  r.actualPhysicalWholeSystemValidationComplete===false&&
  r.physicalValidation==='none'&&r.physicalVerdict==='unknown'&&
  r.realWorldBuildSuccessPercent===null,
  'No measured physical fan, calibration or manufacturing success can be invented');
 return true;
}
export function evaluateWholeSystemNumericalReadiness(r,models,report){
 verifyWholeSystemReadiness(r,models);
 fail(report?.format==='invention-lab/phase48-multi-regime-conditional-source-replay/1'&&
  report.referenceDesignId===r.referenceDesignId&&
  Array.isArray(report.runs)&&report.runs.length===cases.length,
  'Missing numerical replay or wrong source');
 const check=report.runs.map((run,i)=>{
  const point=cases[i];
  fail(run.label===point.label&&
   run.output?.format==='invention-lab/phase47-coupled-midpoint-conditional-evaluation/1'&&
   run.output.assumedFanTorqueCoefficientNmPerRadPerS_Squared===point.fanTorqueCoefficient&&
   run.output.assumedBatteryInternalResistanceOhm===point.batteryResistanceOhm,
   'Out-of-scope or substituted replay scenario');
  fail(Number.isFinite(run.output.fullEnergyBalanceResidualJ)&&
   Math.abs(run.output.fullEnergyBalanceResidualJ)<r.numericalEnergyResidualToleranceJ&&
   Number.isFinite(run.output.finalShaftRpm)&&run.output.finalShaftRpm>=0&&
   Number.isFinite(run.output.finalMotorTemperatureC)&&
   run.output.calibratedAgainstSourceMatchedPhysicalSystem===false&&
   run.output.physicalValidation==='none'&&
   run.output.physicalVerdict==='unknown'&&
   run.output.realWorldBuildSuccessPercent===null,
   'Invalid numerical energy or false physical validation');
  return {label:point.label,finalHypotheticalRpm:run.output.finalShaftRpm,
    finalHypotheticalMotorTemperatureC:run.output.finalMotorTemperatureC};
 });
 fail(check[0].finalHypotheticalRpm>check[1].finalHypotheticalRpm&&
  check[1].finalHypotheticalRpm>check[2].finalHypotheticalRpm&&
  check[3].finalHypotheticalRpm>check[4].finalHypotheticalRpm,
  'Conditional coupled model violates qualitative load/impedance trend');
 return freeze({
  format:'invention-lab/phase48-numerical-mathematical-acceptance/1',
  numericalEvidenceChecked:true,
  hypotheticalScenarioCount:check.length,
  results:check,independentlyObservedRealFanTests:0,
  physicalValidationPassed:false,
  physicalValidationOutcome:'BLOCKED_UNMEASURED_SOURCE_MATCHED_HARDWARE',
  actualSystemSuccessProbability:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 });
}
