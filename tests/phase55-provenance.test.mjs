import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyPolicy,blankIntake,screenProvenance,signedPayload,sha256} from '../js/evidence/phase55-provenance.js';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const p=load('../benchmarks/phase55/provenance-policy.json');
const old=load('../benchmarks/phase54/prototype-acquisition-policy.json');
const signoff=load('../benchmarks/phase53/signoff-boundary.json');
test('8 blank dies and 48 source-locked sessions are not measured hardware',()=>{
 assert.equal(verifyPolicy(p,old,signoff).vectorInputs.length,1024);
 const b=blankIntake(p,old,signoff);assert.equal(b.dies.length,8);
 assert.equal(b.sessions.length,48);assert.equal(b.attestations.fabrication,null);
 assert.equal(screenProvenance(p,old,signoff).physicalProvenanceAccepted,false);
});
test('Original hash matching never independently authenticates a measurement',()=>{
 const b=structuredClone(blankIntake(p,old,signoff));
 b.sessions[0].rawInstrumentSHA256=sha256('invented byte stream');
 b.sessions[0].instrumentSerial='test-only';b.sessions[0].calibrationCertificateSHA256=sha256('claimed cert');
 const r=screenProvenance(p,old,signoff,b,{[b.sessions[0].sessionId]:'invented byte stream'});
 assert.equal(r.originalRawFilesMatched,1);assert.equal(r.authenticatedPhysicalDiesAdmitted,0);
 assert.equal(r.physicalProvenanceAccepted,false);
});
test('Tampering source, schedule or approval is rejected',()=>{
 const b=blankIntake(p,old,signoff);
 for(const e of [x=>x.vectorSuiteSHA256='0'.repeat(64),x=>x.dies.reverse(),
  x=>x.sessions.pop(),x=>x.physicalValidation='pass',
  x=>x.realWorldBuildSuccessPercent=99]){
  const c=structuredClone(b);e(c);assert.ok(screenProvenance(p,old,signoff,c).errors.length>0);
 }
});
test('Self-issued signature is not a trusted foundry attestation',()=>{
 const b=structuredClone(blankIntake(p,old,signoff));
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');
 b.attestations.fabrication={keyId:'self',signatureBase64:sign(null,signedPayload('fabrication',b),privateKey).toString('base64'),
  publicKeyPem:publicKey.export({type:'spki',format:'pem'})};
 assert.equal(screenProvenance(p,old,signoff,b).verifiedAuthoritySignatures,0);
 const registry={fabrication:{keyId:'self',publicKeyPem:publicKey.export({type:'spki',format:'pem'}),verifiedOutOfBand:true},
  metrology:{keyId:'other',publicKeyPem:publicKey.export({type:'spki',format:'pem'}),verifiedOutOfBand:true}};
 const r=screenProvenance(p,old,signoff,b,{},registry);
 assert.equal(r.verifiedAuthoritySignatures,1);
 assert.equal(r.physicalProvenanceAccepted,false);
});
test('Strength of the provenance policy cannot be silently upgraded',()=>{
 for(const e of [x=>x.externallyAuthenticatedDies=8,x=>x.physicalValidation='pass',
 x=>x.requireIndependentOutOfBandAuthorityTrust=false]){
  const c=structuredClone(p);e(c);assert.throws(()=>verifyPolicy(c,old,signoff));
 }
});
