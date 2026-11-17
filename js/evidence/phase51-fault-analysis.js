// Phase51 software-only fault-injection taxonomy. No measured failure frequency
// or safety threshold exists for the unassembled fan and battery reference.
import {verifyUncertaintyInputs,calculateConditionalUncertainty} from './phase50-uncertainty.js';
export const FORMAT='invention-lab/phase51-source-scoped-fault-injection/1';
const fail=(x,m)=>{if(!x)throw Error(m)};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>{if(v&&typeof v==='object'){for(const x of Object.values(v))freeze(x);Object.freeze(v)}return v};
const FAULTS=[
 ['battery-disconnected','open-electric-loop'],
 ['wire-open','open-electric-loop'],
 ['locked-rotor','stopped-rotor-ohmic-only'],
 ['contact-corrosion','max-assumed-contact-resistance'],
 ['tach-stuck','sensor-failure-no-independent-observation'],
 ['temperature-sensor-invalid','sensor-failure-no-independent-observation'],
 ['correlated-pack-and-contacts','shared-high-resistance-assumptions'],
 ['impeller-detachment','unqualified-mechanical-hazard']
];
const PATHS=[
 'benchmarks/phase41/reference-hardware-candidate.json',
 'benchmarks/phase43/e91-assumptions.json',
 'benchmarks/phase44/copper-harness-assumptions.json',
 'benchmarks/phase45/pololu1592-endpoint-model.json',
 'benchmarks/phase50/uncertainty-envelope.json'
];
export function verifyFaultModel(d,inputs){
 verifyUncertaintyInputs(inputs.uncertainty,inputs);
 fail(d?.format===FORMAT&&d.referenceDesignId===inputs.candidate.designId&&
 d.modelScope==='logic-and-hypothetical-stopped-rotor-resistance-faults-only'&&
 equal(d.sourceManifests,PATHS)&&
 equal(d.modeledFaultCases,FAULTS.map(([a,b])=>({case:a,type:b}))),
 'Original source fault taxonomy or target changed');
 fail(d.sourceQualifiedFaultFrequencyDistributions===null&&
 d.realUnitFailureCounts===0&&d.realUnitExposureOperatingHours===0&&
 d.actualObservedFailureRates===null&&d.independentFailureModeDetectionCoverage===null&&
 d.independentFaultInjectionExperiments===0&&
 d.actualManufacturerEnvironmentalAgingDataForAssembly===null&&
 d.correlatedFailureProbabilityModel===null&&
 d.validatedComponentSafetyThresholds===null&&
 d.physicalAssemblyFaultTestApproved===false&&
 d.safeImpellerOperationApproved===false&&
 d.manufacturingReliabilityOrYieldEstimate===null&&
 d.physicalValidation==='none'&&d.physicalVerdict==='unknown'&&
 d.realWorldBuildSuccessPercent===null,
 'Unmeasured fault distribution, component safety limit, aging, or yield fabricated');
 return true;
}
export function injectHypotheticalFault(d,inputs,faultName){
 verifyFaultModel(d,inputs);
 fail(typeof faultName==='string'&&FAULTS.some(f=>f[0]===faultName),
  'Unknown failure scenario cannot silently become safe');
 const bounds=calculateConditionalUncertainty(inputs.uncertainty,inputs);
 const loop=bounds.assumedWireCopperResistanceOhm;
 const motor=.75;
 const nominalCurrent=3/(.45+loop+.02+motor);
 const highRCurrent=3/(.6+loop+.1+motor);
 let currentRange=null;
 let independentFaultDetectionConfirmed=false;
 let electricalStopReason=null;
 if(faultName==='battery-disconnected'||faultName==='wire-open'){
  currentRange={lower:0,upper:0};
  electricalStopReason='ideal_open_circuit_no_dc_conduction';
 }else if(faultName==='locked-rotor'){
  currentRange=bounds.hypotheticalStoppedRotorCurrentRangeA;
 }else if(faultName==='contact-corrosion'){
  currentRange={lower:highRCurrent,upper:3/(.3+loop+.1+motor)};
 }else if(faultName==='correlated-pack-and-contacts'){
  currentRange={lower:highRCurrent,upper:highRCurrent};
 }
 const pureLogicIndicators={
  untrustedFaultLabel:faultName,
  noIndependentTachMeasurement:faultName==='tach-stuck',
  noIndependentThermalMeasurement:faultName==='temperature-sensor-invalid',
  mechanicalContainmentNotQualified:faultName==='impeller-detachment',
  correlatedElectricalAssumptions:faultName==='correlated-pack-and-contacts'
 };
 return freeze({
  format:'invention-lab/phase51-unverified-fault-case-result/1',
  faultName,
  nominalHypotheticalStoppedRotorCurrentA:nominalCurrent,
  faultedHypotheticalStoppedRotorCurrentRangeA:currentRange,
  electricalStopReason,
  syntheticFaultIndicator:pureLogicIndicators,
  actualHardwareSensorFailureDetected:false,
  independentFaultDetectionConfirmed,
  physicalFailureProbability:null,
  independentPhysicalFaultCoverage:null,
  physicalSafeOperatingLimitsKnown:false,
  hardwareTestingAuthorized:false,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 });
}
export function buildConditionalFaultTree(d,inputs){
 verifyFaultModel(d,inputs);
 return freeze({
  format:'invention-lab/phase51-symbolic-dependency-fault-tree/1',
  topEvent:'reference-assembly-unable-to-prove-safe-operation',
  symbolicLogicOnly:true,
  basicEvents:FAULTS.map(([id])=>id),
  noMotionPossibleCauses:{operator:'OR',events:['battery-disconnected','wire-open','locked-rotor']},
  hiddenHazardExample:{operator:'AND',events:['tach-stuck','impeller-detachment']},
  correlatedSourceExample:{operator:'JOINT_INPUT',events:['contact-corrosion','correlated-pack-and-contacts']},
  independenceAssumptionsValidated:false,
  independentComponentFailureProbabilities:null,
  jointFailureProbabilities:null,
  physicalSystemReliability:null,
  physicalSafetyAcceptance:'NO_GO_UNQUALIFIED_HARDWARE_AND_MISSING_EXPERIMENT',
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 });
}
