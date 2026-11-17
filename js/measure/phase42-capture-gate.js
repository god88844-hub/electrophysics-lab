// Phase42: physically unqualified instrument-file ingestion, safety/provenance gates.
// A user-supplied CSV or metadata is never independent attestation of an experiment.
import {createHash} from 'node:crypto';
export const FORMAT='invention-lab/phase42-target-fan-capture-protocol/1';
export const COLUMNS=Object.freeze(['t_s','pack_v','motor_v','motor_current_a',
 'shaft_rpm','motor_temp_c','ambient_temp_c']);
const META=Object.freeze(['experimentId','designId','acquisitionUTC','acquisitionDeviceSerial',
 'responsibleOperatorId','batteryCell1SpecimenId','batteryCell2SpecimenId',
 'motorSpecimenId','impellerSpecimenId','wireHarnessSpecimenId','instrumentList',
 'rawFileSHA256','originalRawFileName','safetyPlanReviewRef',
 'mechanicalContainmentReviewRef','currentProtectionReviewRef',
 'instrumentCalibrationReviewRefs','independentProvenanceReviewRef',
 'uncertaintyBudgetRef','acceptanceProtocolRef','validationPartitionGroup']);
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const freeze=v=>{if(v&&typeof v==='object'){for(const p of Object.values(v))freeze(p);Object.freeze(v);}return v};
const assert=(x,msg)=>{if(!x)throw Error(msg)};
export const sha256=s=>createHash('sha256').update(s,'utf8').digest('hex');

export function verifyCaptureProtocol(protocol){
 const p=structuredClone(protocol);
 assert(p?.format===FORMAT&&
  p.referenceDesignId==='reference-3v-battery-2-wire-brushed-fan-candidate-001'&&
  p.captureState==='PLANNED_NO_HARDWARE_OR_REAL_MEASUREMENTS'&&
  p.protocolVersion==='1.0.0','Wrong source-matched capture protocol');
 assert(JSON.stringify(p.requiredCSVColumns)===JSON.stringify(COLUMNS),
  'Original seven measured channels must be present in exact order');
 assert(Object.keys(p.units||{}).sort().join(',')===COLUMNS.slice().sort().join(',')&&
  p.units.t_s==='s'&&p.units.pack_v==='V'&&p.units.motor_v==='V'&&
  p.units.motor_current_a==='A'&&p.units.shaft_rpm==='rpm'&&
  p.units.motor_temp_c==='degC'&&p.units.ambient_temp_c==='degC',
  'Instrument unit definitions altered');
 assert(JSON.stringify(p.requiredSourceMetadata)===JSON.stringify(META),
  'Physical source traceability requirements removed');
 assert(Array.isArray(p.requiredInstrumentChannels)&&
  p.requiredInstrumentChannels.length===6&&
  p.requiredInstrumentChannels.every(c=>c.mandatoryCalibration===true&&
   typeof c.method==='string'&&c.method.length>15),
  'Safety-relevant instrument channel or calibration duty missing');
 assert(Array.isArray(p.prerequisites)&&p.prerequisites.length===6&&
  p.prerequisites.every(x=>typeof x==='string'&&x.length>20),
  'Experimental safety or preregistration requirement removed');
 assert(Array.isArray(p.measurementsPlanned)&&p.measurementsPlanned.length===5,
  'Required measured operating regimes or failure studies omitted');
 assert(p.unqualifiedFromSoftwareAlone===true&&
  p.samplingFrequencyHz===null&&p.safeCurrentLimitA===null&&
  p.qualifiedImpellerMaxRpm===null&&
  p.measuredPhysicalSessionCount===0&&p.measuredPhysicalSpecimenCount===0&&
  p.actualSourceMatchedFanMeasurements===0&&
  p.independentHardwareEvidenceReviewed===false&&
  p.independentInstrumentCalibrationAccepted===false&&
  p.physicalValidation==='none'&&p.physicalVerdict==='unknown'&&
  p.realWorldBuildSuccessPercent===null,
  'Planned experiment falsely recorded as conducted or qualified');
 return true;
}

export function parseCaptureCSV(text){
 assert(typeof text==='string'&&text.length<5e7&&text.length>40,
  'Original text CSV required, no oversized or blank source');
 assert(!text.includes('\0'),'Binary or null raw capture file');
 const lines=text.replace(/\r\n/g,'\n').trimEnd().split('\n');
 assert(lines.shift()===COLUMNS.join(','),'Unsafe or modified sensor CSV schema');
 let n=0,first=null,last=null,totalV=0,totalI=0,maxI=0,maxRpm=0;
 for(const row of lines){
  const fields=row.split(',');
  assert(fields.length===7,'Sensor row has malformed dimension or delimiter');
  assert(fields.every(x=>x.trim()!==''),'Blank sensor field cannot be interpreted as zero');
  const [t,pack,motor,current,rpm,tm,ambient]=fields.map(x=>Number(x));
  assert([t,pack,motor,current,rpm,tm,ambient].every(finite),
   'Nonfinite numerical sensor observation');
  assert(t>=0&&t<=1e9&&pack>=0&&pack<=6&&motor>=0&&
   motor<=6&&current>=0&&current<=50&&rpm>=0&&rpm<=100000&&
   tm>=-50&&tm<=200&&ambient>=-50&&ambient<=100,
   'Out-of-range sensor value requires review; no physically plausible reading inferred');
  if(last!==null)assert(t>last,'Timebase not strictly increasing');
  if(first===null)first=t;
  last=t;n++;totalV+=pack;totalI+=current;
  maxI=Math.max(maxI,current);maxRpm=Math.max(maxRpm,rpm);
 }
 assert(n>=3&&last>first,'Three or more time-ordered samples required for descriptive statistics');
 return freeze({format:'invention-lab/phase42-untrusted-raw-capture-summary/1',
  rawSampleCount:n,firstSampleTimeS:first,lastSampleTimeS:last,
  durationS:last-first,meanPackVoltageV:totalV/n,
  meanCurrentA:totalI/n,maximumObservedCurrentA:maxI,
  maximumReportedTachSpeedRpm:maxRpm,sourceIsIndependentlyVerified:false,
  numberOfIndependentPhysicalSpecimens:null,
  manufacturerYieldEstimate:null,physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
function present(x){
 return x!==undefined&&x!==null&&(
  typeof x==='string'?x.trim().length>0:
  Array.isArray(x)?x.length>0:true);
}
export function inspectCaptureImport(protocol,rawText,metadata){
 verifyCaptureProtocol(protocol);
 const raw=parseCaptureCSV(rawText);
 const m=metadata&&typeof metadata==='object'?metadata:{};
 const missing=META.filter(k=>!present(m[k]));
 const suppliedHash=typeof m.rawFileSHA256==='string'?m.rawFileSHA256:null;
 const actualHash=sha256(rawText);
 const discrepancies=[];
 if(suppliedHash!==actualHash)
  discrepancies.push('Declared original file hash does not match submitted source bytes');
 if(m.designId!==protocol.referenceDesignId)
  discrepancies.push('Physical hardware assembly design identity not pinned to protocol');
 if(m.validationPartitionGroup==='')discrepancies.push('Missing group-based calibration/holdout assignment');
 if(raw.maximumReportedTachSpeedRpm>0){
  discrepancies.push('Nonzero tach values are only user-supplied readings; no independent calibration or mechanical containment review is authenticated');
 }
 // Even perfect synthetically crafted source + plausible metadata is not
 // independently authenticated physical hardware evidence.
 return freeze({format:'invention-lab/phase42-quarantined-instrument-import/1',
  referenceDesignId:protocol.referenceDesignId,
  claimedExperimentId:present(m.experimentId)?String(m.experimentId):null,
  originalSubmittedFileSHA256:actualHash,
  rawSummary:raw,missingSourceMetadataFields:missing,
  sourceMetadataDiscrepancies:discrepancies,
  sourceHashInternallyConsistent:suppliedHash===actualHash,
  canBeUsedAsUnreviewedDescriptiveData:suppliedHash===actualHash&&missing.length===0,
  originalPhysicalSourceIndependentlyAuthenticated:false,
  certifiedInstrumentCalibrationExternallyReviewed:false,
  mechanicalAndElectricalSafetyIndependentlyApproved:false,
  physicalHardwareValidationAuthorized:false,
  importedRowsAreNotIndependentManufacturingSamples:true,
  admission:'QUARANTINED_AWAITING_EXTERNAL_INSTRUMENT_AND_HARDWARE_REVIEW',
  realWorldBuildSuccessPercent:null,physicalValidation:'none',physicalVerdict:'unknown'});
}
export function blankCaptureEvidence(protocol){
 verifyCaptureProtocol(protocol);
 return freeze({format:'invention-lab/phase42-capture-planning-evidence/1',
  referenceDesignId:protocol.referenceDesignId,protocolVersion:protocol.protocolVersion,
  sourceMatchedSessionsRecorded:0,sourceMatchedIndependentSpecimens:0,
  originalPhysicalFanSensorReadings:0,importedPhysicalSourceSHA256:[],
  acquiredOriginalInstrumentFiles:0,instrumentCalibrationsIndependentlyVerified:0,
  mechanicalContainmentReviewed:false,electricalProtectionReviewed:false,
  formalDataAcquisitionReady:false,hardwareBuildAuthorized:false,
  nextAction:'Obtain actual identified BOM, independent safety signoff and calibrated source recordings; do not run a spinning unverified impeller',
  realWorldBuildSuccessPercent:null,physicalValidation:'none',physicalVerdict:'unknown'});
}
