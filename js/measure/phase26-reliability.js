// Honest prospective failure/variation analysis: two genuine test-tile
// resistors are NOT a process distribution and NOT an ALU reliability test.
import {isDeepStrictEqual} from 'node:util';
import {DATASETS,UPSTREAM_COMMIT} from './sky130-mdm.js';
import {computeDiagnostics} from './phase25-bounded-calibration.js';
export const FORMAT='invention-lab/phase26-real-two-device-variation-diagnostics/1';
export const PLAN_FORMAT='invention-lab/phase26-prospective-reliability-and-manufacturing-variation/1';
export const REQUIRED_MODES=Object.freeze([
 ['fab-identity','Fabricated die, mask and provenance not independently established','authenticated die/wafer/lot/package and mask-to-RTL chain'],
 ['defect-opens-shorts','Physical conductor opens, shorts and latent defects','qualified production DRC, wafer tests and fault-injection measurements'],
 ['process-drift','Between-die and between-lot process variations unknown','independent lot-wafer-die groups with PVT sweeps'],
 ['setup-hold','On-silicon propagation, setup and hold not measured','timing traces on a fabricated matching DUT and characterized IO loads'],
 ['supply-integrity','Droop, IR drop and power integrity unverified','calibrated power/voltage/temperature instrumentation'],
 ['thermal','Thermal coefficients and hot/cold operating limits unknown','environmental chamber controlled temperature sweeps'],
 ['aging-bti-hci','Bias-temperature and hot-carrier aging untested','stress experiments with controlled duration and repeat measurements'],
 ['metal-em-esd','Electromigration, ESD and latch-up untested','qualified accelerated stress/latch-up tests'],
 ['packaging','Bonding, package parasitics and mechanical integrity unknown','packaged silicon tests and failure inspection'],
 ['metrology','Traceable uncertainty and calibration certificates absent','raw instrument files, uncertainty budgets and independent certification'],
 ['functional-fault','Fault rates and failure mechanisms of physical ALU unknown','blinded 1024-vector physical test and repeated sample groups'],
 ['model-form','Resistor I-V fit does not transfer to ALU timing or yield','measured target ALU timing and independently held-out design groups']
]);
const expected={
 format:PLAN_FORMAT,sourceMeasurementCommit:UPSTREAM_COMMIT,
 measuredDomain:'two-source-verified-sky130-poly-resistor-test-tile-specimens',
 targetDomain:'unfabricated-source-locked-sky130-alu8',
 resistorSpecimenIds:DATASETS.map(x=>x.id),
 voltageEnvelopeV:[-0.25,0.25],
 diagnosticProbeVoltagesV:[-0.25,-0.10,0,0.10,0.25],
 measuredResistorReadings:102,resistorSpecimens:2,actualALUSpecimens:0,
 actualIndependentWaferGroups:0,actualIndependentLotGroups:0,
 reliabilityStressedDUTs:0,targetCaptureVectors:1024,
 instrumentCalibrationVerified:false,sourceManufacturingMetadataVerified:false,
 failureMechanismEvidenceVerified:false,allowBetweenLotVariationFit:false,
 allowResistorToALUGeneralization:false,allowStatisticalYieldEstimate:false,
 allowAcceleratedLifetimeEstimate:false,allowSpecimenBootstrapConfidence:false,
 failureModes:REQUIRED_MODES.map(([id,description,requirement])=>({id,description,requirement})),
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
};
export function verifyPlan(plan){
 if(!isDeepStrictEqual(plan,expected))
  throw Error('Frozen prospective reliability/variation acceptance plan changed');
 return true;
}
const num=x=>typeof x==='number'&&Number.isFinite(x);
function conductance(s){
 if(s?.rows?.length!==51||s?.sweep?.samples!==51||
   s.sweep.startV!==-0.25||s.sweep.stopV!==0.25||
   Math.abs(s.sweep.stepV-0.01)>1e-10)
  throw Error('Not an original complete in-envelope measured device sweep');
 let numer=0,denom=0;
 for(let i=0;i<51;i++){
  const r=s.rows[i],v=-0.25+i*0.01;
  if(!r||!num(r.voltageV)||!num(r.currentA)||!num(r.returnCurrentA)||
     Math.abs(r.voltageV-v)>1e-8)
   throw Error('Invalid or reordered measured resistor sweep');
  numer+=r.voltageV*r.currentA;
  denom+=r.voltageV*r.voltageV;
 }
 const g=numer/denom;
 if(!(g>0)||!num(g))throw Error('No physically positive observed I-V slope');
 return g;
}
/** Diagnostic only. No process capability, manufacturing yield, or stress data. */
export function analyzeVariation(training,holdout,plan){
 verifyPlan(plan);
 if(training===holdout||training?.rows===holdout?.rows)
  throw Error('Same physical specimen cannot count twice');
 const previous=computeDiagnostics(training,holdout);
 const gs=[conductance(training),conductance(holdout)];
 if(Math.abs(gs[0]-previous.fit.conductanceS)>1e-15)
  throw Error('Phase25 frozen calibration predictor changed');
 const low=Math.min(...gs),high=Math.max(...gs),mean=(low+high)/2;
 if(!num(mean)||!(low>0))throw Error('Invalid two observed conductance readings');
 const probes=plan.diagnosticProbeVoltagesV.map(voltageV=>({
  voltageV,firstSpecimenOhmicCurrentA:gs[0]*voltageV,
  secondSpecimenOhmicCurrentA:gs[1]*voltageV,
  absoluteDifferenceA:Math.abs((gs[0]-gs[1])*voltageV),
  kind:'deterministic-model-comparison-not-experimental-prediction-interval'
 }));
 const amp=previous.holdout.signedError;
 const observedVariation={
  kind:'retrospective-two-specimen-descriptive-fit-not-process-distribution',
  numberOfMeasuredSpecimens:2,
  measurementsWithinEachSpecimen:51,
  independentLotCount:null,independentWaferCount:null,
  specimens:DATASETS.map((s,i)=>({
   id:s.id,originalMeasuredFileSha256:s.sha256,
   conductanceS:gs[i],resistanceOhm:1/gs[i]
  })),
  observedMinConductanceS:low,observedMaxConductanceS:high,
  differenceS:high-low,
  normalizedDifferenceOfTwoPointMean:(high-low)/mean,
  observedSpanIsConfidenceInterval:false,
  usableAsProcessSigma:false,
  usableAsYieldEstimate:false,
  modelHoldoutResidualRMSEA:amp.rms,
  modelHoldoutMaxAbsErrorA:amp.maxAbs,
  hypotheticalProbes:probes
 };
 return {
  format:FORMAT,measurementSource:UPSTREAM_COMMIT,
  domains:{observed:'sky130-test-tile-poly-resistor-I-V',target:'unfabricated-sky130-alu8'},
  observedVariation,
  failureAudit:plan.failureModes.map(x=>({
   id:x.id,description:x.description,
   actualHardwareTested:false,verifiedFailureRate:null,
   verifiedStressTestHours:null,evidenceLevel:'not-tested-on-target-alu',
   requirement:x.requirement
  })),
  qualification:{
   physicalALUSpecimens:0,independentLotGroups:0,independentWaferGroups:0,
   recordedTargetCaptureVectors:0,requiredTargetCaptureVectors:1024,
   acceleratedLifetimeSamples:0,
   voltageTemperatureStressTraces:0,
   signedMetrologyCertificates:0,
   estimatedLifetimeHours:null,estimatedFIT:null,
   estimatedPhysicalYield:null,reliabilityPassProbability:null,
   uncertaintyCoverage:null,confidenceInterval:null,
   targetReliabilityVerdict:'unknown'
  },
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  note:'Only two public measured resistor curves: no distribution, failure probability, population UQ, actual chip timing, qualified reliability or manufacturing success.'
 };
}
export function replayVariation(record,computed,metadata){
 const errors=[];
 if(!isDeepStrictEqual(record,computed))
  errors.push('Original resistance, failure modes, probe and provenance results changed');
 if(!/^[0-9a-f]{40}$/.test(metadata?.commit??'')||
   metadata?.recordCommit!==metadata?.commit)
  errors.push('Original physical-evidence source Git commit differs');
 if(!/^[0-9a-f]{64}$/.test(metadata?.policySha256??'')||
   metadata?.policySha256!==metadata?.recordPolicySha256)
  errors.push('Source-locked process variation acceptance policy altered');
 const q=record?.qualification,obs=record?.observedVariation;
 if(record?.physicalValidation!=='none'||record?.physicalVerdict!=='unknown'||
    record?.realWorldBuildSuccessPercent!==null||
    q?.physicalALUSpecimens!==0||q?.recordedTargetCaptureVectors!==0||
    q?.independentLotGroups!==0||q?.independentWaferGroups!==0||
    q?.estimatedPhysicalYield!==null||q?.estimatedFIT!==null||
    q?.estimatedLifetimeHours!==null||q?.reliabilityPassProbability!==null||
    q?.uncertaintyCoverage!==null||q?.confidenceInterval!==null||
    q?.targetReliabilityVerdict!=='unknown'||
    obs?.numberOfMeasuredSpecimens!==2||
    obs?.independentLotCount!==null||obs?.independentWaferCount!==null||
    obs?.observedSpanIsConfidenceInterval!==false||
    obs?.usableAsProcessSigma!==false||obs?.usableAsYieldEstimate!==false||
    !Array.isArray(record?.failureAudit)||record.failureAudit.length!==REQUIRED_MODES.length||
    record.failureAudit.some(x=>x.actualHardwareTested!==false||
      x.verifiedFailureRate!==null||x.verifiedStressTestHours!==null||
      x.evidenceLevel!=='not-tested-on-target-alu'))
  errors.push('Unsupported target silicon reliability, UQ, process variation or yield inference');
 return {ok:errors.length===0,errors,modelScope:'two-measured-resistors-only',
   physicalVerdict:'unknown',manufacturingSuccessPercent:null};
}
