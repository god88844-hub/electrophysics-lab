// Phase32 researched public evidence inventory for near-physical modeling.
// Sources of measurements for DIFFERENT hardware are NOT measurements of this fan.
export const CATALOG_FORMAT='invention-lab/phase32-public-source-coverage-catalog/1';
export const COVERAGE_FORMAT='invention-lab/phase32-actual-data-evidence-coverage/1';
const FINITE=x=>typeof x==='number'&&Number.isFinite(x);
const close=(x,y,tol)=>Math.abs(x-y)<=tol*Math.max(1,Math.abs(x),Math.abs(y));
const EXPECTED_SOURCE_IDS=Object.freeze([
'asme-vvuq','nasa-7009b','nist-tn1900','nist-uncertainty-machine',
'pololu-1592','mendeley-openmct-2026-v2','mendeley-pmdc-2021-v2',
'nasa-battery-aging','nasa-battery-randomwalk-2','nmb-fan-pressure-curve',
'nist-copper-resistivity','nist-cfd-vvuq'
]);
export const EXPECTED_SOURCE_URLS=Object.freeze({
  "asme-vvuq": "https://www.asme.org/codes-standards/publications-information/verification-validation-uncertainty",
  "nasa-7009b": "https://standards.nasa.gov/standard/nasa/nasa-std-7009",
  "nist-tn1900": "https://www.nist.gov/publications/simple-guide-evaluating-and-expressing-uncertainty-nist-measurement-results",
  "nist-uncertainty-machine": "https://uncertainty.nist.gov/",
  "pololu-1592": "https://www.pololu.com/product/1592/specs",
  "mendeley-openmct-2026-v2": "https://data.mendeley.com/datasets/5xvg43r9r8/2",
  "mendeley-pmdc-2021-v2": "https://data.mendeley.com/datasets/2rkpsss6fd/2",
  "nasa-battery-aging": "https://data.nasa.gov/dataset/li-ion-battery-aging-datasets",
  "nasa-battery-randomwalk-2": "https://data.nasa.gov/dataset/randomized-battery-usage-2-room-temperature-random-walk",
  "nmb-fan-pressure-curve": "https://nmbtc.com/white-papers/dc-brushless-cooling-fan-behavior/",
  "nist-copper-resistivity": "https://www.nist.gov/publications/improved-estimation-resistivity-pure-copper-electrical-determination-thin-copper-film",
  "nist-cfd-vvuq": "https://www.nist.gov/publications/summary-industrial-verification-validation-and-uncertainty-quantification-procedures"
});
export const EXPECTED_REQUIREMENTS=Object.freeze([
'target-identification','battery-ocv','battery-impedance','battery-capacity',
'wire-geometry','wire-thermal','motor-topology','motor-resistance',
'motor-constants','motor-startup','motor-thermal','fan-geometry',
'fan-curve','fan-environment','thermal-coupling','assembly-defects',
'distribution-parameters','sensor-calibration','solver-verification',
'model-discrepancy','qualification-envelope','safety-reliability','release-provenance'
]);
const frozen=(v)=>Object.freeze(JSON.parse(JSON.stringify(v)));
export function verifyCatalog(catalog){
 if(catalog?.format!==CATALOG_FORMAT||catalog.asOf!=='2026-11-17'||
    !Array.isArray(catalog.sources)||!Array.isArray(catalog.requirements)||
    catalog.sources.length!==EXPECTED_SOURCE_IDS.length||
    catalog.requirements.length!==EXPECTED_REQUIREMENTS.length)
  throw Error('Phase32 public source catalog malformed or incomplete');
 const ids=new Set(EXPECTED_SOURCE_IDS),requirements=new Set(EXPECTED_REQUIREMENTS);
 if(new Set(catalog.sources.map(s=>s.id)).size!==EXPECTED_SOURCE_IDS.length||
    new Set(catalog.requirements.map(r=>r.id)).size!==EXPECTED_REQUIREMENTS.length||
    catalog.sources.some(s=>!ids.has(s.id)||s.url!==EXPECTED_SOURCE_URLS[s.id]||!s.title||typeof s.title!=='string'||
       typeof s.url!=='string'||!/^https:\/\//.test(s.url)||!s.recordStatus||
       s.directOriginalMeasurementCount!==0||!s.subjectMatch||
       s.subjectMatch==='matching-target-assembly'||!s.license||
       !Array.isArray(s.units)||!Array.isArray(s.subjects))||
    catalog.requirements.some(x=>!requirements.has(x.id)||!x.quantity||!x.scope||
       !x.minimumEvidence||!Array.isArray(x.availableNonMatchingSources)||
       x.availableNonMatchingSources.some(k=>!ids.has(k))||
       x.presentForExample!==(x.id==='solver-verification'))||
    catalog.originalFanHardwareMeasurements!==0||
    catalog.independentTargetSpecificMotorValidationRecords!==0||
    catalog.manufacturingSuccessPercent!==null||
    catalog.physicalVerdict!=='unknown')
  throw Error('Metadata attempted to promote nonmatching physical evidence or changed original inventory');
 const motor=catalog.sources.find(x=>x.id==='pololu-1592');
 const s=motor?.specificationAt3V;
 if(motor?.partId!=='pololu-1592'||!s||
    s.ratedVoltageV!==3||s.noLoadSpeedRpm!==20000||
    s.noLoadCurrentA!==0.35||s.stallCurrentA!==4||
    s.stallTorqueGfCm!==55||
    catalog.sources.find(x=>x.id==='mendeley-openmct-2026-v2')?.reportedRawLogs!==14||
    catalog.sources.find(x=>x.id==='mendeley-openmct-2026-v2')?.publishedRowsLowerBoundExclusive!==60000||
    catalog.sources.find(x=>x.id==='mendeley-pmdc-2021-v2')?.reportedMotorSpecimens!==2||
    catalog.sources.find(x=>x.id==='mendeley-openmct-2026-v2')?.license!=='CC BY 4.0'||
    catalog.sources.find(x=>x.id==='mendeley-pmdc-2021-v2')?.license!=='CC BY 4.0')
  throw Error('Pinned manufacturer numbers or published dataset metadata changed');
 return true;
}
export function sourceMotorConstants(catalog){
 verifyCatalog(catalog);
 const m=catalog.sources.find(x=>x.id==='pololu-1592');
 const {ratedVoltageV,noLoadSpeedRpm,noLoadCurrentA,stallCurrentA,stallTorqueGfCm}=m.specificationAt3V;
 const R=ratedVoltageV/stallCurrentA;
 const speed=noLoadSpeedRpm*2*Math.PI/60;
 const torque=stallTorqueGfCm*9.80665e-5;
 const kt=torque/stallCurrentA;
 const ke=(ratedVoltageV-noLoadCurrentA*R)/speed;
 return frozen({
  partId:m.partId,sourceUrl:m.url,sourceValueType:'published-manufacturer-approximate-typical-specifications',
  motorRatedVoltageV:ratedVoltageV,
  sourceNoLoadSpeedRpm:noLoadSpeedRpm,sourceNoLoadCurrentA:noLoadCurrentA,
  sourceStallCurrentA:stallCurrentA,sourceStallTorqueGfCm:stallTorqueGfCm,
  derivedStallTorqueNm:torque,
  inferredStallResistanceOhm:R,
  derivedKtFromStallNmPerA:kt,
  derivedKeFromFreeRunVsPerRad:ke,
  kRelativeInconsistencyPercent:200*Math.abs(kt-ke)/(kt+ke),
  canApplyToPhase31GenericFan:false,
  individualRawSourceMeasurementCount:0,
  manufacturerPartMatchedToCurrentFan:false,
  estimatedPopulationDistribution:null,
  confirmedPerPartMeasurementErrorBound:null,
  physicalValidation:'none',realWorldBuildSuccessPercent:null,
  note:'Nominal manufacturer values are approximate and interdependent; Kt/Ke mismatch is NOT a calibrated model-error bound. The published motor is not the fan used in the illustrative Phase31 simulation.'
 });
}
export function assessPublicSourceCoverage(catalog,{
 targetId='illustrative-dc-battery-fan-not-current-circuit',targetPartId=null,
 intendedVoltageV=3,calibrationDataset=null
}={}){
 verifyCatalog(catalog);
 if(typeof targetId!=='string'||!targetId.trim()||
    (targetPartId!==null&&(typeof targetPartId!=='string'||!targetPartId.trim()))||
    !FINITE(intendedVoltageV)||intendedVoltageV<=0)
  throw Error('Explicit target identity and positive operating voltage required');
 // A matching MOTOR part would enable a vendor-bound reference comparison,
 // NEVER physical validation of the whole battery+wire+impeller assembly.
 const vendorMotorOnlyMatches=targetPartId==='pololu-1592'&&
   close(intendedVoltageV,3,0);
 const raw=calibrationDataset===null?null:auditMotorCsv(calibrationDataset,{
  declaredSourceId:'mendeley-openmct-2026-v2',targetPartId
 });
 const requirements=catalog.requirements.map(item=>({
  id:item.id,category:item.category,physicalTargetEvidenceEstablished:false,
  illustrativeSourceReadyForReuse:item.id==='motor-constants'&&vendorMotorOnlyMatches?
    'vendor-published-motor-spec-consistency-only':
    item.presentForExample?'numerically-model-verified-not-physical':'missing-target-applicable-measurements',
  knownSourceCandidates:[...item.availableNonMatchingSources],
  requirement:item.minimumEvidence
 }));
 return frozen({
  format:COVERAGE_FORMAT,
  targetId,targetPartId,intendedVoltageV,
  totalExplicitEvidenceRequirements:requirements.length,
  coreMathematicalModelVerifiedCount:requirements.filter(x=>x.id==='solver-verification').length,
  fullyPhysicallySatisfiedRequirements:0,
  physicallyUnverifiedRequirements:requirements.length,
  requirements,
  manufacturerMotorSpecMatched:vendorMotorOnlyMatches,
  supplierCharacteristics:sourceMotorConstants(catalog),
  calibrationDatasetAudit:raw,
  sourceReferenceCount:catalog.sources.length,
  publishedExperimentalDatasetsIdentified:catalog.sources.filter(s=>s.sourceClass==='published-experimental-dataset').length,
  publishedDataOriginalMeasurementsIngested:0,
  originalFanHardwareMeasurements:0,
  authenticatedActualTargetDeviceMeasurements:0,
  sourceToTargetTransferQualified:false,
  simulationPhysicalEquivalenceClaimAllowed:false,
  realWorldBuildSuccessPercent:null,physicalValidation:'none',
  physicalVerdict:'unknown',
  blockers:[
    'Acquire source-authenticated original raw data and check usage/license terms; discovered metadata is not ingested raw observations',
    'Match actual battery, two-wire harness, motor topology/part and fan impeller, not merely another 3 V motor',
    'Independently characterize fan-specific torque/pressure/flow, thermal/time behavior and component population covariance',
    'Validate model residuals on independent matching-hardware holdouts across the specified operating envelope',
    'Characterize original assembly/part manufacturing defects before assigning a physical build-success percentage'
  ]
 });
}
const MOTOR_COLS=Object.freeze([
 'REF','MEAS','DT_ms','CURRENT_RAW','CURRENT_AVG','PWM',
 'DMM_CURRENT_A','DMM_TIME_s','DMM_AGE_ms','DMM_SAMPLE_ID'
]);
/** Validate uploaded motor CSV bytes purely as a file-shape check.
 * No self-supplied CSV, even one with perfect synthetic numbers, authenticates
 * Mendeley data, a motor type or actual target-fan measurements.
 */
export function auditMotorCsv(csv,{
 declaredSourceId='mendeley-openmct-2026-v2',targetPartId=null
}={}){
 if(declaredSourceId!=='mendeley-openmct-2026-v2')
  throw Error('OpenMCT source parser cannot be silently relabeled to a different dataset');
 if(typeof csv!=='string'||csv.length>50000000||csv.length<40)
  throw Error('Missing or oversized original CSV input');
 const lines=csv.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());
 if(lines.length<4||lines.length>200005)
  throw Error('Dataset requires metadata, header and at least one valid physical-looking row');
 // OpenMCT original raw logs have first two metadata rows, then 10-column header.
 const header=lines[2].split(',').map(x=>x.trim());
 if(header.length!==MOTOR_COLS.length||
    header.some((x,i)=>x!==MOTOR_COLS[i]))
  throw Error('Unrecognized raw OpenMCT ten-column header; do not guess column semantics');
 let valid=0,withDmm=0,minSpeed=Infinity,maxSpeed=-Infinity;
 for(let i=3;i<lines.length;i++){
  const fields=lines[i].split(',').map(x=>x.trim());
  if(fields.length!==10)throw Error('Malformed motor CSV field count at row '+(i+1));
  const values=fields.map((v,j)=>v===''&&j>=6?null:Number(v));
  if(values.slice(0,6).some(v=>!FINITE(v))||
     values.slice(6).some(v=>v!==null&&!FINITE(v))||
     values[2]<=0||values[2]>60000||
     Math.abs(values[1])>1000000||
     values[5]<-100||values[5]>1000000)
   throw Error('Invalid/OpenMCT implausible numeric motor reading row '+(i+1));
  minSpeed=Math.min(minSpeed,values[1]);maxSpeed=Math.max(maxSpeed,values[1]);
  if(values[6]!==null)withDmm++;
  valid++;
 }
 return frozen({
  format:'invention-lab/phase32-untrusted-raw-motor-csv-inspection/1',
  declaredSourceId,declaredTargetPartId:targetPartId,
  parsedDataRows:valid,rowsWithDmmCurrentA:withDmm,
  observedSpeedMinRpm:minSpeed,observedSpeedMaxRpm:maxSpeed,
  originalRawBytesIndependentlyFetched:false,
  publishedDatasetDigestIndependentlyVerified:false,
  sourceInstrumentCalibrationIndependentlyVerified:false,
  deviceMatchedToPhase31Fan:false,
  calibrationHoldoutSeparationEstablished:false,
  canEstimateCurrentFanPhysicalAccuracy:false,
  canEstimateManufacturingSuccess:false,
  realWorldBuildSuccessPercent:null,physicalValidation:'none',physicalVerdict:'unknown',
  note:'Only CSV syntax and plausibility were checked. These bytes could be fabricated; origin and matching assembly have NOT been independently verified.'
 });
}
