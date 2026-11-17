// Phase 55: evidence transport integrity and external origin remain separate.
import {createHash,createPublicKey,verify as edVerify} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {makeLabHandoff} from './phase54-alu-handoff.js';
export const FORMAT='invention-lab/phase55-independent-provenance/1';
export const sha256=b=>createHash('sha256').update(b).digest('hex');
const hash=v=>typeof v==='string'&&/^[0-9a-f]{64}$/.test(v);
const name=v=>typeof v==='string'&&v.trim().length>0&&v.length<=512;
const frozen=v=>{if(v&&typeof v==='object'){for(const y of Object.values(v))frozen(y);Object.freeze(v)}return v};
export function verifyPolicy(policy,old,signoff){
 const handoff=makeLabHandoff(old,signoff);
 const expected={format:FORMAT,target:'sky130-alu8',
   rtlGitBlobSHA1:handoff.sourceRtlGitBlobSHA1,vectorSuiteSHA256:handoff.vectorSuiteSHA256,
   requiredAttestorRoles:['fabrication','metrology'],
   publicKeysBundledWithCandidateAreUntrusted:true,
   requireIndependentOutOfBandAuthorityTrust:true,
   requireRoleSeparation:true,requireRawByteIntegrity:true,
   expectedDieSlots:8,expectedSessions:48,expectedVectorsPerSession:1024,
   externallyAuthenticatedDies:0,externallyAuthenticatedSessions:0,
   physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 if(!isDeepStrictEqual(policy,expected))throw Error('Phase55 qualification boundaries modified');
 return handoff;
}
export function blankIntake(p,old,signoff){
 const lab=verifyPolicy(p,old,signoff);
 return frozen({format:'invention-lab/phase55-untrusted-physical-intake/1',
   target:p.target,rtlGitBlobSHA1:p.rtlGitBlobSHA1,vectorSuiteSHA256:p.vectorSuiteSHA256,
   dies:lab.plannedDies.map(d=>({slotId:d.slotId,role:d.role,group:d.group,
     waferGroup:d.waferGroup,lotId:null,waferId:null,dieId:null,maskSha256:null,foundryRecordSha256:null})),
   sessions:lab.plannedSessions.map(s=>({sessionId:s.sessionId,slotId:s.slotId,
     rawInstrumentSHA256:null,instrumentSerial:null,calibrationCertificateSHA256:null})),
   attestations:{fabrication:null,metrology:null},
   physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
export function signedPayload(role,c){
 if(!['fabrication','metrology'].includes(role))throw Error('Unknown authority role');
 return Buffer.from(JSON.stringify({domain:FORMAT,role,target:c.target,
  rtl:c.rtlGitBlobSHA1,stimulus:c.vectorSuiteSHA256,
  payloadSHA256:sha256(JSON.stringify(role==='fabrication'?c.dies:c.sessions))}));
}
function verifyAttestation(role,c,registry){
 const a=c?.attestations?.[role],trusted=registry?.[role];
 if(!a||!trusted||!name(a.keyId)||a.keyId!==trusted.keyId||
  trusted.verifiedOutOfBand!==true||typeof trusted.publicKeyPem!=='string'||
  typeof a.signatureBase64!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(a.signatureBase64))
  return false;
 try{
  const key=createPublicKey(trusted.publicKeyPem),signature=Buffer.from(a.signatureBase64,'base64');
  return key.asymmetricKeyType==='ed25519'&&signature.length===64&&
    edVerify(null,signedPayload(role,c),key,signature);
 }catch{return false}
}
export function screenProvenance(p,old,signoff,candidate=null,rawFiles={},registry=null){
 const expected=blankIntake(p,old,signoff),c=candidate===null?expected:candidate;
 const errors=[];const fail=(ok,reason)=>{if(!ok&&errors.length<100)errors.push(reason)};
 if(!c||typeof c!=='object'||Array.isArray(c))return frozen({
  format:'invention-lab/phase55-provenance-review/1',status:'REJECTED',
  errors:['Malformed candidate'],originalRawFilesMatched:0,verifiedAuthoritySignatures:0,
  physicalProvenanceAccepted:false,physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null});
 fail(c.format===expected.format&&c.target===expected.target&&
  c.rtlGitBlobSHA1===expected.rtlGitBlobSHA1&&
  c.vectorSuiteSHA256===expected.vectorSuiteSHA256,'Original source mismatch');
 fail(c.physicalValidation==='none'&&c.physicalVerdict==='unknown'&&
  c.realWorldBuildSuccessPercent===null,'Self-reported physical approval forbidden');
 const compare=(rows,known,keys,label)=>{
  if(!Array.isArray(rows)||rows.length!==known.length){fail(false,label+' count mismatch');return false}
  for(let i=0;i<known.length;i++)fail(!!rows[i]&&keys.every(k=>rows[i][k]===known[i][k]),
   label+' schedule changed '+i);
  return true;
 };
 if(compare(c.dies,expected.dies,['slotId','role','group','waferGroup'],'Die')){
  const observed=[];
  for(const d of c.dies){
   if(d.lotId!==null||d.waferId!==null||d.dieId!==null){
    for(const key of ['lotId','waferId','dieId'])fail(name(d[key]),'Die ID missing '+d.slotId);
    for(const key of ['maskSha256','foundryRecordSha256'])fail(hash(d[key]),'Foundry fingerprint missing '+d.slotId);
    observed.push([d.lotId,d.waferId,d.dieId].join('/'));
   }
  }
  fail(new Set(observed).size===observed.length,'Duplicate physical die identity');
 }
 let matched=0;
 if(compare(c.sessions,expected.sessions,['sessionId','slotId'],'Session'))
  for(const s of c.sessions){
   if(s.rawInstrumentSHA256===null)continue;
   fail(hash(s.rawInstrumentSHA256),'Bad raw SHA '+s.sessionId);
   fail(name(s.instrumentSerial)&&hash(s.calibrationCertificateSHA256),
    'Instrument/certificate metadata absent '+s.sessionId);
   const raw=Object.hasOwn(rawFiles,s.sessionId)?rawFiles[s.sessionId]:null;
   if((typeof raw==='string'||raw instanceof Uint8Array)&&hash(s.rawInstrumentSHA256)&&
      sha256(raw)===s.rawInstrumentSHA256)matched++;
   else fail(false,'Raw original bytes do not match '+s.sessionId);
  }
 const fab=verifyAttestation('fabrication',c,registry),met=verifyAttestation('metrology',c,registry);
 if(c.attestations?.fabrication)fail(fab,'Foundry signature not independently trusted');
 if(c.attestations?.metrology)fail(met,'Metrology signature not independently trusted');
 if(registry)fail(!!registry.fabrication&&!!registry.metrology&&
  registry.fabrication.keyId!==registry.metrology.keyId,'Authorities must have distinct keys');
 const fileCount=Array.isArray(c.sessions)?c.sessions.filter(s=>s?.rawInstrumentSHA256!==null).length:0;
 // This module never accepts external-origin evidence on its own: the signature
 // registry and physical identity must be independently audited outside GitHub.
 return frozen({format:'invention-lab/phase55-provenance-review/1',
  status:errors.length?'REJECTED_OR_QUARANTINED':'QUARANTINED_PENDING_EXTERNAL_REVIEW',
  errors,plannedDieSlots:8,plannedSessions:48,claimedRawFiles:fileCount,
  originalRawFilesMatched:matched,verifiedAuthoritySignatures:Number(fab)+Number(met),
  cryptographicClaimConsistent:errors.length===0&&fab&&met&&matched===48,
  outOfBandAuthorityIdentityPhysicallyConfirmed:false,
  authenticatedPhysicalDiesAdmitted:0,physicalProvenanceAccepted:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
