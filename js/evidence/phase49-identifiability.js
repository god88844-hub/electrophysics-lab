// Structural identifiability, no claim of source-matched physical calibration.
export const FORMAT='invention-lab/phase49-synthetic-circuit-identifiability/1';
const requireOk=(v,s)=>{if(!v)throw Error(s)};
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const freeze=v=>{if(v&&typeof v==='object'){for(const x of Object.values(v))freeze(x);Object.freeze(v)}return v};
const near=(a,b)=>finite(a)&&Math.abs(a-b)<1e-12;
export function verifyIdentifiabilitySource(d){
 requireOk(d?.format===FORMAT&&d.referenceDesignId==='reference-3v-battery-2-wire-brushed-fan-candidate-001'&&
 d.sourceModel==='static-fixed-voltage-three-series-resistance-only-no-back-emf'&&
 JSON.stringify(d.sourceManifestIds)===JSON.stringify(['phase43-E91-two-cell-nominal-ohmic-sensitivity','phase44-AWG24-copper-loop-with-assumed-contacts','phase45-Pololu1592-manufacturer-3V-endpoints']),
 'Source or target identity changed');
 const r=d.referenceHypotheticalResistancesOhm;
 requireOk(r&&r.battery===.45&&r.harness===.04&&r.stoppedMotor===.75,
  'Hypothetical exact source resistance values altered');
 const expected=[['train-a','synthetic-training',1.8],['train-b','synthetic-training',2.2],
 ['train-c','synthetic-training',2.6],['holdout-a','synthetic-holdout',2],['holdout-b','synthetic-holdout',3]];
 requireOk(Array.isArray(d.syntheticRecords)&&d.syntheticRecords.length===5,
  'Cannot silently add fabricated measured observations');
 for(let i=0;i<expected.length;i++){
  const row=d.syntheticRecords[i],e=expected[i];
  requireOk(row.case===e[0]&&row.partition===e[1]&&row.voltageV===e[2]&&
  near(row.currentA,e[2]/1.24),'Original synthetic evidence partition or row changed');
 }
 requireOk(d.measurementOrigin==='DETERMINISTIC_SYNTHETIC_ALGEBRA_ONLY'&&
 d.sourceMatchedPhysicalMeasurements===0&&d.physicalHardwareSamples===0&&
 d.preRegisteredIndependentRealDeviceHoldout===false&&
 d.individualBatteryResistancePhysicallyIdentifiable===false&&
 d.individualHarnessResistancePhysicallyIdentifiable===false&&
 d.individualMotorResistancePhysicallyIdentifiable===false&&
 d.structuralJacobianExpectedRank===1&&d.physicalNoiseModelCalibrated===false&&
 d.physicalPredictionInterval===null&&d.physicalValidation==='none'&&
 d.physicalVerdict==='unknown'&&d.realWorldBuildSuccessPercent===null,
 'Synthetic algebra incorrectly promoted to physical identification');
 return true;
}
export function fitSyntheticTotalResistance(d){
 verifyIdentifiabilitySource(d);
 const train=d.syntheticRecords.filter(x=>x.partition==='synthetic-training');
 const holdout=d.syntheticRecords.filter(x=>x.partition==='synthetic-holdout');
 requireOk(train.length===3&&holdout.length===2,'Train/heldout synthetic partition contaminated');
 const sumVI=train.reduce((sum,r)=>sum+r.voltageV*r.currentA,0);
 const sumVV=train.reduce((sum,r)=>sum+r.voltageV*r.voltageV,0);
 const conductance=sumVI/sumVV;
 requireOk(finite(conductance)&&conductance>0,'Nonidentifiable even total series resistance');
 const R=1/conductance;
 const errors=holdout.map(x=>Math.abs(x.currentA-x.voltageV/R));
 const max=Math.max(...errors);
 // Each Jacobian column of dI/dR_b, dI/dR_h, dI/dR_m is -V/Rtot^2:
 // any vector (delta, -delta, 0) lives in its null space.
 const jacobian=train.map(row=>[-row.voltageV/R**2,-row.voltageV/R**2,-row.voltageV/R**2]);
 const first=jacobian[0][0];
 requireOk(first!==0&&jacobian.every(row=>row.every(v=>Math.abs(v-row[0])<1e-12)),
 'Unexpected rank of fixed-source circuit resistance Jacobian');
 return freeze({
 format:'invention-lab/phase49-structural-identifiability-audit/1',
 sourceOrigin:d.measurementOrigin,fitUsedTrainingOnly:true,
 trainingSyntheticCases:train.map(x=>x.case),
 withheldSyntheticCases:holdout.map(x=>x.case),
 identifiableTotalSeriesResistanceOhm:R,
 individualResistancesIdentifiable:false,
 structuralJacobian:jacobian,structuralJacobianRank:1,
 unidentifiableNullDirection:[1,-1,0],
 batteryResistanceEstimateOhm:null,harnessResistanceEstimateOhm:null,
 motorResistanceEstimateOhm:null,
 syntheticHoldoutMeanAbsoluteCurrentErrorA:errors.reduce((a,b)=>a+b,0)/errors.length,
 syntheticHoldoutMaximumAbsoluteCurrentErrorA:max,
 realPhysicalHoldoutDevices:0,sourceMatchedMotorMeasurements:0,
 physicalParameterCalibrationAccepted:false,manufacturingPredictionInterval:null,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
 });
}
export function rejectUnqualifiedPhysicalCalibration(d,submitted){
 verifyIdentifiabilitySource(d);
 requireOk(submitted&&typeof submitted==='object','Physical calibration proposal must be structured');
 return freeze({format:'invention-lab/phase49-external-calibration-quarantine/1',
 submittedLabel:typeof submitted.label==='string'?submitted.label:null,
 sourceSpecimenIDsAuthenticated:false,
 calibrationAndHoldoutSeparatedByRealDevice:false,
 independentInstrumentReview:false,
 parametersAdmittedIntoPhysicalModel:0,
 disposition:'QUARANTINED_AWAITING_ACTUAL_HARDWARE_AND_INDEPENDENT_REVIEW',
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
