// Post-integration laboratory/reviewer request generation. It gathers source
// plans ONLY. It never authenticates a returned measurement or endorses a build.
import {createHash} from 'node:crypto';
export const FORMAT='invention-lab/external-qualification-request/1';
export const INPUTS=Object.freeze([
 'benchmarks/phase42/physical-capture-protocol.json',
 'benchmarks/phase52/reference-system-qualification.json',
 'benchmarks/phase54/prototype-acquisition-policy.json',
 'benchmarks/phase55/provenance-policy.json',
 'benchmarks/phase57/release-policy.json'
]);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const requireTruth=(x,message)=>{if(!x)throw Error(message)};
const plainObject=x=>x&&typeof x==='object'&&!Array.isArray(x);
const isSha1=x=>typeof x==='string'&&/^[0-9a-f]{40}$/.test(x);
const isSha256=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
export function prepareExternalQualificationPacket(sourceCommit,inputs){
 requireTruth(isSha1(sourceCommit),'Expected checked-out exact Git source commit');
 requireTruth(plainObject(inputs)&&Object.keys(inputs).length===INPUTS.length &&
  INPUTS.every(path=>Buffer.isBuffer(inputs[path])&&inputs[path].length>50),
  'Missing original pinned qualification source bytes');
 const parsed=Object.fromEntries(INPUTS.map(path=>[path,JSON.parse(inputs[path].toString('utf8'))]));
 const [capture,fan,alu,provenance,release]=INPUTS.map(path=>parsed[path]);
 requireTruth(capture.format==='invention-lab/phase42-target-fan-capture-protocol/1' &&
  capture.referenceDesignId===fan.referenceDesignId &&
  capture.captureState==='PLANNED_NO_HARDWARE_OR_REAL_MEASUREMENTS' &&
  capture.actualSourceMatchedFanMeasurements===0 &&
  capture.independentHardwareEvidenceReviewed===false &&
  capture.physicalValidation==='none' &&
  capture.realWorldBuildSuccessPercent===null &&
  capture.requiredCSVColumns?.length===7 &&
  capture.requiredSourceMetadata?.length>=15 &&
  capture.requiredInstrumentChannels?.length===6,
  'Fan capture source no longer expresses zero independently qualified measurements');
 requireTruth(fan.format==='invention-lab/phase52-reference-system-qualification-plan/1' &&
  Array.isArray(fan.requiredPhysicalGates)&&fan.requiredPhysicalGates.length===12 &&
  fan.requiredPhysicalGates.every(x=>plainObject(x)&&typeof x.id==='string'&&
   x.verified===false&&x.evidence===null&&x.independentReview===null) &&
  fan.actualInstrumentSessions===0&&fan.actualSourceMatchedPhysicalSpecimens===0 &&
  fan.physicalBuildPermitted===false&&fan.impellerOperationPermitted===false &&
  fan.physicalValidation==='none'&&fan.realWorldBuildSuccessPercent===null,
  'Reference fan physical readiness incorrectly advanced');
 requireTruth(alu.format==='invention-lab/phase54-alu-laboratory-acquisition-handoff/1' &&
  alu.target==='sky130-alu8' &&
  isSha1(alu.originalRtlGitBlobSHA1)&&isSha256(alu.originalVectorSuiteSHA256) &&
  alu.sourceMeasurementState==='UNFABRICATED_UNMEASURED_NO_INSTRUMENT_EXPORTS' &&
  alu.labHandoffMustExcludeExpectedDigitalOutputs===true &&
  alu.plannedPhysicalDies===8&&alu.plannedStudySessions===48 &&
  alu.inputVectorsPerSession===1024&&
  alu.plannedTotalInstrumentVectorReads===49152 &&
  alu.originalRawInstrumentExports===0&&alu.authenticatedDieSpecimens===0 &&
  alu.productionTapeoutAuthorized===false &&
  alu.physicalValidation==='none'&&alu.realWorldBuildSuccessPercent===null,
  'ALU request contains impossible real hardware status');
 requireTruth(provenance.format==='invention-lab/phase55-independent-provenance/1' &&
  provenance.rtlGitBlobSHA1===alu.originalRtlGitBlobSHA1 &&
  provenance.vectorSuiteSHA256===alu.originalVectorSuiteSHA256 &&
  JSON.stringify(provenance.requiredAttestorRoles)==='["fabrication","metrology"]' &&
  provenance.requireIndependentOutOfBandAuthorityTrust===true &&
  provenance.requireRoleSeparation===true &&
  provenance.externallyAuthenticatedDies===0 &&
  provenance.externallyAuthenticatedSessions===0 &&
  provenance.physicalValidation==='none',
  'Untrusted fabrication attestation cannot be promoted');
 requireTruth(release.physicalValidation==='none'&&release.realWorldBuildSuccessPercent===null &&
  release.actualFanMeasurementCount===0&&release.actualALUMeasurementCount===0,
  'Historical release source wrongly claims physical success');
 const sourceSHA256=Object.fromEntries(INPUTS.map(path=>[path,digest(inputs[path])]));
 const fanGates=fan.requiredPhysicalGates.map(x=>x.id);
 const unique=items=>items.length===new Set(items).size;
 requireTruth(unique(fanGates),'Fan gates must be uniquely identified');
 return {
  format:FORMAT,
  sourceCommit,
  sourceSHA256,
  targetFan:{
   designId:fan.referenceDesignId,
   mandatoryPhysicalGates:fanGates,
   requiredCSVColumns:[...capture.requiredCSVColumns],
   requiredSourceMetadata:[...capture.requiredSourceMetadata],
   requiredInstrumentChannels:capture.requiredInstrumentChannels.map(x=>({quantity:x.quantity,unit:x.unit})),
   safetyPrerequisites:[...capture.prerequisites],
   physicalSpecimensIndependentlyQualified:0,
   safeToBuild:false,impellerOperationAuthorized:false
  },
  targetALU:{
   designId:'sky130-alu8',
   originalRtlGitBlobSHA1:alu.originalRtlGitBlobSHA1,
   originalVectorSuiteSHA256:alu.originalVectorSuiteSHA256,
   plannedDies:alu.plannedPhysicalDies,plannedSessions:alu.plannedStudySessions,
   vectorsPerSession:alu.inputVectorsPerSession,
   plannedInstrumentReads:alu.plannedTotalInstrumentVectorReads,
   independentAttestorRoles:[...provenance.requiredAttestorRoles],
   trustAnchorMustBeIndependentlyConfirmed:true,
   predictedOutputValuesProvidedToMeasurementOperator:false,
   fabricatedDiesAuthenticated:0,physicalTapeoutAuthorized:false
  },
  externalReviewRequests:[
   {role:'independent-security-and-supply-chain-reviewer',status:'NOT_OBTAINED',mustProvide:'signed scope, code/dependency/IP license findings, threat model, code-commit identity'},
   {role:'independent-scientific-model-reviewer',status:'NOT_OBTAINED',mustProvide:'design/operating envelope, calibration vs holdout independence, model error and uncertainty analysis'},
   {role:'independent-accessibility-and-user-study-reviewer',status:'NOT_OBTAINED',mustProvide:'recruited participants, consent/privacy controls, task completion, accessibility findings'},
   {role:'qualified-electrical-and-mechanical-safety-reviewers',status:'NOT_OBTAINED',mustProvide:'source-matched BOM, fuse/current limits, instrument calibrations, impeller retention/containment signoff'},
   {role:'foundry-fabrication-and-metrology-attestors',status:'NOT_OBTAINED',mustProvide:'out-of-band authenticated foundry/mask/die chain and calibrated original raw instruments'}
  ],
  originalEvidenceIntake:{
   requireOriginalByteSHA256:true,
   requireOutOfBandReviewerIdentity:true,
   requireSourceMatchedPartsAndLots:true,
   requireDeviceLotSeparatedHoldout:true,
   requirePreRegisteredAcceptanceThresholds:true,
   uploadPrivateSerialsOrUnredactedPersonalDataToPublicRepo:false,
   receivedExternalEvidenceFiles:0,
   approvedIndependentReviewers:0
  },
  evidenceDecision:'NO_GO_AWAITING_REAL_HARDWARE_AND_EXTERNAL_REVIEW',
  simulationPhysicalEquivalenceEstablished:false,
  signedProductReleaseAuthorized:false,
  manufacturingReleaseAuthorized:false,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 };
}
export function verifyExternalQualificationPacket(packet){
 if(!plainObject(packet)||packet.format!==FORMAT ||
  !isSha1(packet.sourceCommit)||!plainObject(packet.sourceSHA256)||
  Object.keys(packet.sourceSHA256).length!==INPUTS.length ||
  INPUTS.some(path=>!isSha256(packet.sourceSHA256[path])) ||
  packet.targetFan?.mandatoryPhysicalGates?.length!==12 ||
  packet.targetFan?.safeToBuild!==false ||
  packet.targetFan?.impellerOperationAuthorized!==false ||
  packet.targetFan?.physicalSpecimensIndependentlyQualified!==0 ||
  packet.targetALU?.fabricatedDiesAuthenticated!==0 ||
  packet.targetALU?.physicalTapeoutAuthorized!==false ||
  packet.targetALU?.plannedInstrumentReads!==49152 ||
  packet.externalReviewRequests?.length!==5 ||
  packet.externalReviewRequests.some(x=>x.status!=='NOT_OBTAINED') ||
  packet.originalEvidenceIntake?.approvedIndependentReviewers!==0 ||
  packet.originalEvidenceIntake?.receivedExternalEvidenceFiles!==0 ||
  packet.evidenceDecision!=='NO_GO_AWAITING_REAL_HARDWARE_AND_EXTERNAL_REVIEW' ||
  packet.signedProductReleaseAuthorized!==false ||
  packet.manufacturingReleaseAuthorized!==false ||
  packet.simulationPhysicalEquivalenceEstablished!==false ||
  packet.physicalValidation!=='none' ||
  packet.physicalVerdict!=='unknown'||packet.realWorldBuildSuccessPercent!==null)
  throw Error('External review packet incorrectly claims independent physical/product qualification');
 return true;
}
