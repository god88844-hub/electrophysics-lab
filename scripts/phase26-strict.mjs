// Independent source replay, 12 failure modes, and no fabricated yield.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {DATASETS,README,assemblePhase23,parseMdm} from '../js/measure/sky130-mdm.js';
import {verifyPlan,analyzeVariation,replayVariation} from '../js/measure/phase26-reliability.js';
const ROOT='benchmarks/evidence/phase26/',SOURCE='benchmarks/evidence/phase23/';
const sha=b=>createHash('sha256').update(b).digest('hex');
try{
 const record=JSON.parse(await readFile(ROOT+'phase26.json','utf8'));
 const policyRaw=await readFile('benchmarks/phase26/acceptance.json');
 const policy=JSON.parse(policyRaw);verifyPlan(policy);
 const originals={[README.path]:await readFile(SOURCE+'raw/README.rst')};
 for(const d of DATASETS)originals[d.path]=await readFile(SOURCE+'raw/'+d.id+'.mdm');
 const phase23=assemblePhase23(JSON.parse(await readFile('benchmarks/phase23/acceptance.json','utf8')),originals);
 const parsed=DATASETS.map(d=>parseMdm(originals[d.path].toString('utf8'),{expectedSamples:d.samples}));
 const computed=analyzeVariation(parsed[0],parsed[1],policy);
 const phase25=JSON.parse(await readFile('benchmarks/evidence/phase25/phase25-summary.json','utf8'));
 const phase24=JSON.parse(await readFile('benchmarks/evidence/phase24/phase24-summary.json','utf8'));
 if(!phase25.accepted||phase25.independentALUMeasurements!==0||
    phase24.actualPhysicalObservations!==0||phase24.reportedStatus!=='awaiting-real-hardware'||
    Math.abs(computed.observedVariation.modelHoldoutResidualRMSEA-phase25.heldoutCurrentRMSEA)>1e-14||
    Math.abs(computed.observedVariation.modelHoldoutResidualRMSEA-phase23.comparison.heldOutRMSEA)>1e-14)
  throw Error('Actual Phase24/25 evidence inconsistent with original measured resistors');
 const inputs={
  originalREADME:sha(originals[README.path]),
  originalFirstMDM:sha(originals[DATASETS[0].path]),
  originalSecondMDM:sha(originals[DATASETS[1].path]),
  phase25Report:sha(await readFile('benchmarks/evidence/phase25/phase25.json')),
  phase25Summary:sha(await readFile('benchmarks/evidence/phase25/phase25-summary.json')),
  phase24EmptyCapture:sha(await readFile('benchmarks/evidence/phase24/capture-template.json')),
  phase24Summary:sha(await readFile('benchmarks/evidence/phase24/phase24-summary.json'))
 };
 const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const verdict=replayVariation(record.analysis,computed,{
  commit,recordCommit:record.sourceCommit,
  policySha256:sha(policyRaw),recordPolicySha256:record.policySha256
 });
 if(!verdict.ok||record.format!=='invention-lab/phase26-source-verified-original-reliability-audit/1'||
   !isDeepStrictEqual(record.inputs,inputs)||
   record.physicalValidation!=='none'||record.physicalVerdict!=='unknown'||
   record.realWorldBuildSuccessPercent!==null)
  throw Error('Actual source bytes/evidence changed or invented physical claim: '+verdict.errors.join('; '));
 const observed=computed.observedVariation,q=computed.qualification;
 const summary={
  format:'invention-lab/phase26-replayed-two-device-variation-and-reliability-gaps/1',
  accepted:true,sourceCommit:commit,originalResistorDevices:2,
  observedTotalResistorSweepReadings:102,
  observedConductanceS:observed.specimens.map(s=>({id:s.id,conductanceS:s.conductanceS})),
  observedDescriptiveConductanceDifferenceS:observed.differenceS,
  observedDescriptiveFractionalConductanceDifference:observed.normalizedDifferenceOfTwoPointMean,
  heldoutCurrentRMSEA:observed.modelHoldoutResidualRMSEA,
  targetFailureModesUnverified:computed.failureAudit.length,
  actualALUHardwareSpecimens:q.physicalALUSpecimens,
  actualALUHardwareMeasurements:q.recordedTargetCaptureVectors,
  realLifetimeEstimates:null,realYieldEstimate:null,validProcessVariationSigma:null,
  siliconUncertaintyInterval:null,instrumentCalibrationVerified:false,
  foundryQualification:false,physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  nextRequiredEvidence:[
   'fabricated design/mask-matched ALU and authenticated wafer/lot/package provenance',
   'independent calibrated instrument exports and signed measurement provenance',
   'predeclared stress, wearout, power and thermal conditions',
   'independent die/wafer/lot and temporal holdout groups',
   'out-of-sample failure-time, timing and functional measurements'
  ]
 };
 await writeFile(ROOT+'phase26-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH26 STRICT PASS: real 2-resistor variation, 12 ALU failure modes unmeasured, physical yield UNKNOWN');
}catch(e){console.error('PH26 STRICT FAIL: '+e.message);process.exitCode=1}
