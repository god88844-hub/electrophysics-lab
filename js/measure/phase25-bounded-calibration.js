// Phase25: real source-verified two-specimen resistor calibration comparison.
// This is descriptive residual analysis, NOT measurement uncertainty,
 // NOT ALU timing calibration, NOT statistically valid population coverage.
import {isDeepStrictEqual} from 'node:util';
import {DATASETS,UPSTREAM_COMMIT,fitAndHoldout} from './sky130-mdm.js';
export const FORMAT='invention-lab/phase25-real-resistor-holdout-diagnostics/1';
export const POLICY_FORMAT='invention-lab/phase25-bounded-measurement-calibration-plan/1';
export const ACCEPTANCE=Object.freeze({
 format:POLICY_FORMAT,
 sourceMeasurementCommit:UPSTREAM_COMMIT,
 sourceDatasetIds:DATASETS.map(x=>x.id),
 calibrationSpecimen:DATASETS[0].id,
 independentHoldoutSpecimen:DATASETS[1].id,
 measuredDomain:'sky130-test-tile-poly-resistor-I-V',
 targetDut:'unfabricated-sky130-alu8',
 model:'single-parameter-through-origin-ohmic-current',
 onlyUseInEnvelope:[-0.25,0.25],
 allowedHoldoutModelFitting:false,
 allowedRowWiseUncertaintyBootstrap:false,
 allowedStatisticalPopulationCoverageClaim:false,
 independentInstrumentCertificatesAvailable:false,
 sourceAttestationAvailable:false,
 holdoutLotIndependenceVerified:false,
 calibrationErrorThresholdPrespecified:false,
 estimatedPhysicalYield:null,
 physicalValidation:'none',
 physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
});
export function verifyPolicy(policy){
 if(!isDeepStrictEqual(policy,ACCEPTANCE))
  throw Error('Phase25 frozen prospective physical-calibration policy was weakened or changed');
 return true;
}
function statistics(xs){
 if(!Array.isArray(xs)||xs.length<10||xs.some(x=>typeof x!=='number'||!Number.isFinite(x)))
  throw Error('Insufficient nonfinite/invalid source-verified diagnostic readings');
 const abs=xs.map(Math.abs);
 return {
  count:xs.length,
  mean:xs.reduce((s,x)=>s+x,0)/xs.length,
  meanAbs:abs.reduce((s,x)=>s+x,0)/xs.length,
  rms:Math.sqrt(xs.reduce((s,x)=>s+x*x,0)/xs.length),
  maxAbs:Math.max(...abs)
 };
}
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function computeDiagnostics(training,holdout,policy=ACCEPTANCE){
 verifyPolicy(policy);
 if(!training||!holdout||training===holdout||
    !Array.isArray(training.rows)||!Array.isArray(holdout.rows)||
    training.rows===holdout.rows||
    training.rows.length!==51||holdout.rows.length!==51||
    training.sweep?.samples!==51||holdout.sweep?.samples!==51)
  throw Error('Actual two complete distinct SKY130 specimen source sweeps required');
 const original=fitAndHoldout(training,holdout);
 if(original.trainObservations!==51||original.holdoutObservationsInsideTrainingEnvelope!==51||
    original.holdoutObservationsTotal!==51||
    !isDeepStrictEqual(original.heldOutVoltageEnvelopeV,policy.onlyUseInEnvelope))
  throw Error('Independent holdout specimen not entirely inside prespecified training voltage domain');
 // Identical stimuli but DIFFERENT specimen IDs, never a row-wise random split.
 const prediction=[],residual=[],kclTraining=[],kclHoldout=[],rawCurrent=[];
 for(let i=0;i<51;i++){
  const t=training.rows[i],h=holdout.rows[i];
  if(!finite(t?.voltageV)||!finite(h?.voltageV)||
     !finite(t?.currentA)||!finite(t?.returnCurrentA)||
     !finite(h?.currentA)||!finite(h?.returnCurrentA)||
     Math.abs(t.voltageV-h.voltageV)>1e-8)
   throw Error('Specimen sweep positions/nonfinite current readings do not match');
  const p=original.fittedConductanceS*h.voltageV;
  prediction.push(p);
  residual.push(p-h.currentA);
  rawCurrent.push(h.currentA);
  kclTraining.push(t.currentA+t.returnCurrentA);
  kclHoldout.push(h.currentA+h.returnCurrentA);
 }
 const errors=statistics(residual);
 const trainCurrentBalance=statistics(kclTraining);
 const holdoutCurrentBalance=statistics(kclHoldout);
 if(Math.abs(errors.rms-original.heldOutRMSEA)>1e-14||
   Math.abs(errors.meanAbs-original.heldOutMAEA)>1e-14)
  throw Error('Measured heldout residuals do not agree with Phase23 independent computation');
 return {
  format:FORMAT,
  upstreamSourceCommit:UPSTREAM_COMMIT,
  specimenRoles:DATASETS.map(x=>({id:x.id,purpose:x.purpose,sha256:x.sha256})),
  fit:{
    trainingReadings:51,independentSpecimensUsedForFitting:1,
    conductanceS:original.fittedConductanceS,
    resistanceOhm:original.fittedResistanceOhm,
    model:'I1(SI-ampere)=G(SI-siemens)*V1(volt), intercept fixed to zero'
  },
  holdout:{
    independentDeviceIds:1,readings:51,
    voltageEnvelopeV:[-0.25,0.25],
    residualDefinition:'model_I1_minus_measured_I1',
    signedError:errors,
    fractionOfPeakCurrentRMSE:original.heldOutRMSEOfPeakFraction,
    withinSpecimenSweepReadingsCorrelated:true,
    statisticallyIndependentErrorSamples:1,
    sourceMeasurementCurrentAStats:statistics(rawCurrent)
  },
  currentBalance:{
    definition:'observed_I1_plus_observed_I2',
    training:trainCurrentBalance,
    holdout:holdoutCurrentBalance,
    interpretation:'diagnostic-only: two instrument channels should approximately cancel, not a calibration certificate'
  },
  uncertainty:{
    instrumentCalibrationChainVerified:false,
    waferLotMembershipKnown:false,
    independentInstrumentAttestationVerified:false,
    populationPredictiveInterval:null,
    expandedMeasurementUncertaintyA:null,
    statisticalConfidenceLevel:null,
    estimatedProcessVariation:null,
    reason:'Only two measured devices and unqualified raw instruments; 51 within-device sweep points cannot become 51 independent devices'
  },
  intendedALU:{
    hardwareMeasurements:0,
    calibrationPerformed:false,
    uncertaintyQuantified:false,
    physicalValidation:'none',
    physicalVerdict:'unknown',
    realWorldBuildSuccessPercent:null
  },
  conclusion:'real published resistor I-V model discrepancy characterized only; no general device uncertainty or ALU-silicon equivalence'
 };
}
export function replayPhase25(record,computed,metadata){
 const errors=[];
 if(!isDeepStrictEqual(record,computed))errors.push('Phase25 model residuals are not independently reproducible from source originals');
 if(!/^[a-f0-9]{40}$/.test(metadata?.commitSha??'')||
    metadata?.sourceCommit!==metadata?.commitSha)
  errors.push('Evidence record linked to different source revision');
 if(!/^[a-f0-9]{64}$/.test(metadata?.manifestSha256??'')||
   metadata?.manifestSha256!==metadata?.sourceManifestSha256)
  errors.push('Frozen acceptance protocol changed after evidence capture');
 const domain=record?.intendedALU,unc=record?.uncertainty,h=record?.holdout;
 if(domain?.hardwareMeasurements!==0||domain?.calibrationPerformed!==false||
    domain?.uncertaintyQuantified!==false||domain?.physicalValidation!=='none'||
    domain?.physicalVerdict!=='unknown'||domain?.realWorldBuildSuccessPercent!==null||
    unc?.populationPredictiveInterval!==null||unc?.expandedMeasurementUncertaintyA!==null||
    unc?.statisticalConfidenceLevel!==null||unc?.estimatedProcessVariation!==null||
    h?.independentDeviceIds!==1||h?.statisticallyIndependentErrorSamples!==1)
  errors.push('Unqualified two-specimen data or invented ALU physical evidence promoted to confidence/yield');
 return {ok:errors.length===0,errors,deviceModelCompared:errors.length===0,
   externalALUCalibrated:false,physicalValidation:'none',physicalVerdict:'unknown',
   realWorldBuildSuccessPercent:null};
}
