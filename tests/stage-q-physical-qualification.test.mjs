import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSCPIAsciiWaveform,makeInstrumentSession}
 from '../js/hardware/phase94-instrument-ingest.js';
import {PHASE76_FORMAT} from '../js/evidence/phase76-virtual-passport.js';
import {buildMeasurementEvidence,calculateProvisionalUncertainty,
 evaluatePhysicalQualification,requirePhysicalReleasePassport,
 APPROVED_PHYSICAL_REVIEWERS,PHYSICAL_PASSPORT_FORMAT,
 canonicalPhysicalReviewClaim,verifyDetachedReviewerSignature,verifyPinnedPhysicalReview}
 from '../js/hardware/phase96-physical-qualification.js';
const hash='a'.repeat(64);
const level1={format:PHASE76_FORMAT,designId:'q4-demo',
 status:'INSUFFICIENT_MODEL_DATA',physicallyQualified:false,
 productionReleaseAuthorized:false};
function evidence(){
 const measurements=parseSCPIAsciiWaveform('0,1,2,3',{timeIncrementS:1e-6});
 const session=makeInstrumentSession({designId:'q4-demo',
  instrumentModel:'TDS2012C',instrumentSerial:'C011240',operatorId:'tester'});
 return buildMeasurementEvidence({designId:'q4-demo',sourceCommitSha256:hash,
 originalCaptureSHA256:hash,simulationSHA256:hash,physicalSpecimenId:'die-1',
 lotId:'lot-01',instrumentSession:session,
 measurements,simulation:[0,1.02,2.02,2.95],absoluteTolerance:.1});
}
test('instrument-derived residual and uncertainty are provisional, never calibrated in place',()=>{
 const x=evidence();
 assert.equal(x.metrics.outsideDeclaredTolerance,0);
 assert.equal(x.provenanceStatus,'CLAIMED_NOT_INDEPENDENTLY_AUTHENTICATED');
 const u=calculateProvisionalUncertainty({residuals:[.1,-.1,.2,-.2],
  modelUncertainty:.05,measurementUncertainty:.01});
 assert.ok(u.estimatedCombinedStandardUncertainty>.05);
 assert.equal(u.originalFoundryModelUpdated,false);
 assert.equal(u.physicalQualification,'NO_GO');
});
test('a forged physical review and virtual passport never yield PHYSICALLY_QUALIFIED',()=>{
 assert.equal(APPROVED_PHYSICAL_REVIEWERS.length,0);
 const forged={...evidence(),provenanceStatus:'INDEPENDENTLY_AUTHENTICATED',
  originalCaptureInTrustedArchive:true,
  independentSiliconLotReviewAuthenticated:true,
  reviewerId:'fake-reviewer',signature:'fake'};
 const fakeVirtual={...level1,status:'VIRTUALLY_QUALIFIED'};
 const review={reviewerId:'fake-reviewer',independentReviewerApproved:true,
  blindHoldoutPassed:true,drcLvsPhysicalCorrelationPassed:true};
 const r=evaluatePhysicalQualification({level1Passport:fakeVirtual,
  measurementEvidence:forged,postSiliconReview:review});
 assert.equal(r.status,'UNQUALIFIED_NO_GO');
 assert.ok(r.reasons.includes('no-pinned-authenticated-physical-reviewer-trust-root'));
 assert.equal(r.physicallyQualified,false);
 assert.throws(()=>requirePhysicalReleasePassport({...r,
  status:'PHYSICALLY_QUALIFIED',physicallyQualified:true,
  productionReleaseAuthorized:true}),/trust authority/);
});
test('without physical source or original Level1 qualification the original stays unchanged',()=>{
 const before=JSON.stringify(level1);
 const r=evaluatePhysicalQualification({level1Passport:level1});
 assert.equal(r.retainedLevel1Status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(r.measuredPhysicalBuildSuccessPercent,null);
 assert.equal(JSON.stringify(level1),before);
});

test('real Ed25519 signatures can be checked but unsigned/self-keyed reviews are NOT trusted',async()=>{
 const e=evidence(),claim=canonicalPhysicalReviewClaim(e);
 const pair=await crypto.subtle.generateKey({name:'Ed25519'},true,['sign','verify']);
 const key=new Uint8Array(await crypto.subtle.exportKey('raw',pair.publicKey));
 const signed=new Uint8Array(await crypto.subtle.sign('Ed25519',pair.privateKey,
  new TextEncoder().encode(claim)));
 const asBase64=bytes=>btoa(String.fromCharCode(...bytes));
 const verify=await verifyDetachedReviewerSignature({claim,
  signatureBase64:asBase64(signed),publicKeyBase64:asBase64(key)});
 assert.equal(verify.cryptographicSignatureValid,true);
 assert.equal(verify.productionTrustRootPinned,false);
 assert.equal(verify.physicallyQualified,false);
 const altered=await verifyDetachedReviewerSignature({claim:claim+'x',
  signatureBase64:asBase64(signed),publicKeyBase64:asBase64(key)});
 assert.equal(altered.cryptographicSignatureValid,false);
 const pinned=await verifyPinnedPhysicalReview({evidence:e,
  approval:{reviewerId:'fake-reviewer'},signatureBase64:asBase64(signed)});
 assert.equal(pinned.reviewAuthenticated,false);
 assert.equal(pinned.physicalQualification,'NO_GO');
});
