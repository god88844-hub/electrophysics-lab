// Phase 76: Level-1 virtual passport is NOT Phase 72 physical release.
// No foundry/model combination has yet been independently admitted by the
// present Stage-M evidence validator. Never infer silicon yield from fixture.
import {PHASE75_FORMAT} from './phase75-monte-carlo.js';
import {PHASE74_FORMAT} from './phase74-noise-margins.js';
export const PHASE76_FORMAT='invention-lab/phase76-level1-virtual-passport/1';
const Z95=1.959963984540054;
export function wilson95(successes,attempts){
 if(!Number.isSafeInteger(successes)||!Number.isSafeInteger(attempts)||
    attempts<=0||successes<0||successes>attempts)
  throw Error('Wilson interval requires integer successes and trials');
 const p=successes/attempts,z2=Z95**2,denom=1+z2/attempts;
 const center=(p+z2/(2*attempts))/denom;
 const radius=Z95*Math.sqrt(p*(1-p)/attempts+z2/(4*attempts*attempts))/denom;
 return {confidence:0.95,method:'Wilson-score',
  lower:Math.max(0,center-radius),upper:Math.min(1,center+radius)};
}
export function makeLevel1Passport({
 designId,modelIdentifiers=[],monteCarlo,noiseMargin,layout,
 statisticalCalibration=null,independentReview=null
}={}){
 if(typeof designId!=='string'||!/^[a-z0-9_-]{1,100}$/i.test(designId))
  throw Error('Stable design ID required');
 if(!Array.isArray(modelIdentifiers)||modelIdentifiers.some(x=>typeof x!=='string'||x.length>160))
  throw Error('Invalid device identifiers');
 const issues=[];
 if(modelIdentifiers.length===0)issues.push('missing-device-identifiers');
 if(monteCarlo?.format!==PHASE75_FORMAT||monteCarlo.trials<1000||
    monteCarlo.trialCount!==monteCarlo.trials||
    monteCarlo.invalid!==0||monteCarlo.passed+monteCarlo.failed!==monteCarlo.trials)
  issues.push('missing-complete-1000-plus-ngspice-monte-carlo');
 if(monteCarlo?.status==='SYNTHETIC_TEST_ONLY'||monteCarlo?.source?.startsWith('synthetic'))
  issues.push('synthetic-trials-are-not-physical-yield-data');
 if(noiseMargin?.format!==PHASE74_FORMAT||!Array.isArray(noiseMargin.marginByState))
  issues.push('missing-physical-device-noise-margin-sweeps');
 if(noiseMargin?.foundryCalibrated!==true)issues.push('uncalibrated-noise-margins');
 if(layout?.drcClean!==true||layout?.lvsMatched!==true||layout?.postLayoutNoiseVerified!==true||
    layout?.sourceAuthenticated!==true)
  issues.push('missing-verified-custom-cell-layout-drc-lvs-postrc');
 // Supply of an arbitrary "calibrated": true cannot authenticate foundry
 // statistics. No independent foundry-silicon calibrations are in this repo.
 // A future verifier must pin original evidence digests in trusted code.
 if(statisticalCalibration?.independentlyVerified!==true||
    !Array.isArray(statisticalCalibration?.modelSha256s)||
    statisticalCalibration.modelSha256s.length!==modelIdentifiers.length||
    statisticalCalibration.modelSha256s.some(s=>typeof s!=='string'||!/^[a-f0-9]{64}$/.test(s)))
  issues.push('missing-independent-statistical-foundry-calibration');
 if(independentReview?.authenticated!==true||independentReview?.siliconHoldoutAuthenticated!==true)
  issues.push('no-authenticated-independent-holdout-review');
 // This trust anchor is intentionally empty. Authentic review/evidence can
 // only be admitted through a future audited trust-root change, NOT a flag.
 const AUTHENTICATED_CALIBRATION_TRUST_ROOTS=Object.freeze([]);
 if(!AUTHENTICATED_CALIBRATION_TRUST_ROOTS.includes(statisticalCalibration?.approvalId))
  issues.push('no-trusted-statistical-calibration-approval');
 const rejected=noiseMargin?.status==='VIRTUAL_FAIL'||layout?.drcClean===false||
   layout?.lvsMatched===false;
 const status=rejected?'VIRTUAL_FAIL':issues.length?'INSUFFICIENT_MODEL_DATA':'VIRTUALLY_QUALIFIED';
 const complete=monteCarlo?.format===PHASE75_FORMAT&&
  Number.isSafeInteger(monteCarlo.passed)&&Number.isSafeInteger(monteCarlo.trials)&&
  monteCarlo.trials>=1000&&monteCarlo.passed>=0&&monteCarlo.passed<=monteCarlo.trials&&
  monteCarlo.invalid===0;
 const conditional=complete?wilson95(monteCarlo.passed,monteCarlo.trials):null;
 return {format:PHASE76_FORMAT,level:1,designId,status,
  modelIdentifiers:modelIdentifiers.slice().sort(),reasons:[...new Set(issues)].sort(),
  simulatedPhysicalBuildSuccessPercent:status==='VIRTUALLY_QUALIFIED'?
   100*monteCarlo.passed/monteCarlo.trials:'UNKNOWN',
  confidence95Percent:status==='VIRTUALLY_QUALIFIED'?
   [100*conditional.lower,100*conditional.upper]:null,
  unqualifiedTrialSurvivalDiagnostic:conditional?{
   passed:monteCarlo.passed,trials:monteCarlo.trials,
   interval:conditional,disposition:'NOT_A_PHYSICAL_YIELD_ESTIMATE'}:null,
  level2PhysicalSignoff:'NO_GO_MISSING_REAL_SILICON_EVIDENCE',
  physicallyQualified:false,productionReleaseAuthorized:false,
  phase30ReleaseGateUnchanged:true,phase52GateUnchanged:true,
  phase54GateUnchanged:true,phase72GateUnchanged:true};
}
