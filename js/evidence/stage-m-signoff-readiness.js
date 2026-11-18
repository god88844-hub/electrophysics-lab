// Stage M integration/readiness assessment. No source-only PDK inventory,
// self-declared numeric Monte Carlo rate, or mock layout may qualify silicon.
import {PDK_DEVICE_CATALOG,makeVoltageRails,validateDeviceOperatingEnvelope}
 from './phase73-mvl-devices.js';
import {makeLevel1Passport} from './phase76-virtual-passport.js';
import {generateMvlStandardCellCandidates} from './phase77-mvl-layout.js';
import {PHASE75_FORMAT} from './phase75-monte-carlo.js';
import {makeFoundryRailProfile,verifyProfileSOA} from './phase73-soa.js';
export const STAGE_M_READINESS_FORMAT='invention-lab/stage-m-calibrated-readiness/1';

const roles=Object.freeze({
 binary:['sky130_nfet_standard','sky130_pfet_standard'],
 ternary:['sky130_nfet_lvt','sky130_pfet_hvt'],
 q4:['sky130_nfet_lvt','sky130_pfet_hvt']
});
const distinct=a=>[...new Set(a)].sort();

export function inspectStageMReadiness({
 manifest,foundry='SKY130',width=8,radix=4,
 monteCarlo=null,noiseMargin=null,layout=null,
 statisticalCalibration=null,independentReview=null
}={}){
 if(!['SKY130','GF180MCU'].includes(foundry)||
    ![4,8].includes(width)||![2,3,4].includes(radix))
  throw Error('Known foundry, 4/8 digit width and binary/ternary/Q4 radix required');
 const designId='stage-m-'+foundry.toLowerCase()+'-r'+radix+'-alu'+width;
 const reasons=[];
 if(manifest?.format!=='invention-lab/phase73-pinned-pdk-sources/1'||
    manifest.calibrationStatus!=='VALIDATED'||
    manifest.waferDistributionValidity!=='INDEPENDENTLY_VERIFIED'||
    manifest.chipMeasurementsAvailable!==true)
  reasons.push('original-pdk-files-do-not-prove-calibrated-wafer-distributions');
 const source=manifest?.sources?.find(x=>x.pdk===foundry);
 if(!source||!Array.isArray(source.entries)||source.entries.length<2||
    source.entries.some(x=>!/^[a-f0-9]{40}$/.test(x.gitBlobSha1||'')))
  reasons.push('missing-immutable-foundry-model-manifest');
 // Explicit Q4 0..3.3 V and ±10% supply ripple. Never imply 1.8 V
 // SKY130 threshold devices are safe at these absolute voltages.
 const profile=makeFoundryRailProfile({id:foundry==='SKY130'?
   'sky130-core-1v8':'gf180-core-3v3',radix,rippleFraction:.1,
  temperatureC:125});
 const rails=makeVoltageRails({base:radix,maximumV:profile.railsV.at(-1)});
 const soa=verifyProfileSOA(profile);
 if(soa.status==='SOA_OXIDE_OVERSTRESS')
  reasons.push('SOA_OXIDE_OVERSTRESS');
 if(soa.status!=='SOA_PROFILE_SCREEN_PASS')
  reasons.push('device-terminal-stress-envelope-requires-design-rework');
 const deviceIdentifiers=foundry==='SKY130'?
  roles[radix===2?'binary':radix===3?'ternary':'q4']:
  ['gf180_nfet_03v3','gf180_pfet_03v3'];
 const deviceEnvelopes=deviceIdentifiers.map(deviceId=>
  validateDeviceOperatingEnvelope(deviceId,{rails,temperatureC:125,
   supplyRippleFraction:.1}));
 if(deviceEnvelopes.some(x=>x.nominalExceeded))
  reasons.push('10-percent-supply-ripple-exceeds-declared-nominal-device-voltage');
 if(deviceEnvelopes.some(x=>x.usableForTransistorSimulation!==true))
  reasons.push('device-voltage-temperature-and-absolute-rating-unverified');
 const catalog=deviceIdentifiers.map(id=>PDK_DEVICE_CATALOG.find(x=>x.id===id));
 if(catalog.some(d=>!d||d.hasVerifiedCellImplementation!==true||
    d.validatedStatisticalDistribution!==true||
    d.localModelSha256===null))
  reasons.push('no-pinned-validated-transistor-cell-and-process-statistics');
 const abstractLayout=generateMvlStandardCellCandidates({base:radix,width});
 if(!layout||layout.sourceAuthenticated!==true||layout.drcClean!==true||
    layout.lvsMatched!==true||layout.postLayoutNoiseVerified!==true)
  reasons.push('no-authenticated-parasitic-extraction-and-custom-cell-drc-lvs');
 if(monteCarlo?.format!==PHASE75_FORMAT||
    monteCarlo.status==='SYNTHETIC_TEST_ONLY'||
    monteCarlo?.trialCount<1000||monteCarlo?.invalid!==0)
  reasons.push('no-1000-trial-authenticated-ngspice-monte-carlo');
 const passport=makeLevel1Passport({designId,modelIdentifiers:deviceIdentifiers,
  monteCarlo,noiseMargin,layout,statisticalCalibration,independentReview});
 return {
  format:STAGE_M_READINESS_FORMAT,designId,foundry,radix,width,
  railsV:profile.nominalRailsV,soAMaximumRippleRailsV:rails.rails,
  profileId:profile.id,soa, rippleFractions:[-.1,0,.1],
  temperatureCornersC:[-40,25,85,125],
  modelIdentifiers:deviceIdentifiers,
  deviceEnvelopes,
  abstractLayoutStatus:abstractLayout.technologyStage,
  passport,
  status:passport.status==='VIRTUALLY_QUALIFIED'&&reasons.length===0?
   'CALIBRATED_LEVEL1_EVIDENCE_REVIEW_REQUIRED':
   'INSUFFICIENT_MODEL_DATA',
  blockers:distinct([...reasons,...passport.reasons]),
  simulatedPhysicalBuildSuccessPercent:
   passport.status==='VIRTUALLY_QUALIFIED'&&reasons.length===0?
    passport.simulatedPhysicalBuildSuccessPercent:'UNKNOWN',
  releaseAuthorized:false,level2Status:'UNQUALIFIED_NO_GO',
  notes:'Real calibrated PDK/wafer stats and signed custom-cell DRC/LVS are mandatory; CI fixtures are not evidence'
 };
}
export function assessStageMMatrix(manifest){
 const cases=[];
 for(const foundry of ['SKY130','GF180MCU'])
  for(const radix of [2,3,4])
   for(const width of [4,8])
    cases.push(inspectStageMReadiness({manifest,foundry,radix,width}));
 return {format:STAGE_M_READINESS_FORMAT,
  cases,
  qualified:cases.filter(x=>x.passport.status==='VIRTUALLY_QUALIFIED').length,
  allLevel1Calibrated:cases.every(x=>x.passport.status==='VIRTUALLY_QUALIFIED'&&
    x.status==='CALIBRATED_LEVEL1_EVIDENCE_REVIEW_REQUIRED'),
  physicalReleaseAllowed:false,
  stageMergeAcceptance:'NO_GO_MISSING_CALIBRATED_EVIDENCE'};
}
