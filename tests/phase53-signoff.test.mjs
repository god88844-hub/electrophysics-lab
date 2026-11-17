import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifySignoffPolicy,assessSiliconSignoff} from '../js/evidence/phase53-signoff.js';
const load=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const p=JSON.parse(load('benchmarks/phase53/signoff-boundary.json'));
const source=Object.fromEntries(p.sourceOpenFlowScripts.map(path=>[path,load(path)]));
test('Source-locked experimental EDA flow is distinguished from foundry signoff',()=>{
 assert.equal(verifySignoffPolicy(p,source),true);
 assert.equal(p.requiredIndependentFoundrySignoff.length,10);
 assert.equal(p.originalSignedGDSArtifact,null);
});
test('Missing independent foundry requirements produce explicit NO-GO with no fabricated yield',()=>{
 const r=assessSiliconSignoff(p,source);
 assert.equal(r.missingFoundryAcceptanceClasses.length,10);
 assert.equal(r.checkedSourceFlowDefinitions,5);
 assert.equal(r.maskTapeoutAuthorized,false);
 assert.equal(r.actualALUDiesQualified,0);
 assert.equal(r.manufacturingYieldEstimate,null);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Self-reported foundry certification or signed hashes do not authenticate chip results',()=>{
 const r=assessSiliconSignoff(p,source,{foundrySigned:true,signedSHA256:'a'.repeat(64),yield:1});
 assert.equal(r.candidateFoundryCertificateAuthenticated,false);
 assert.equal(r.originalSignedGDSExternallyAuthenticated,false);
 assert.equal(r.foundryCertified,false);
});
test('Physical signoff mutation and original tool-deck replacement are refused',()=>{
 const changes=[
 x=>x.requiredIndependentFoundrySignoff[0].foundryQualified=true,
 x=>x.requiredIndependentFoundrySignoff[0].independentApprovalRecord='invented',
 x=>x.requiredIndependentFoundrySignoff.pop(),
 x=>x.originalRuleDeckDRCGitBlobSHA1='0'.repeat(40),
 x=>x.originalRtlBlobSHA1='0'.repeat(40),
 x=>x.sourcePDKNotice='ready-for-production',
 x=>x.expectedDockerDigest='fake-docker',
 x=>x.signedReleaseCandidate=true,
 x=>x.originalSignedGDSArtifact={sha256:'a'.repeat(64)},
 x=>x.fabMaskAuthorized=true,
 x=>x.dieIdentitiesMeasured=100,
 x=>x.fullPhysicalYield=.99,
 x=>x.physicalValidation='full',
 x=>x.realWorldBuildSuccessPercent=100
 ];
 for(const edit of changes){const c=structuredClone(p);edit(c);assert.throws(()=>verifySignoffPolicy(c,source));}
 const src=structuredClone(source);src['scripts/phase21-run.sh']='fake';
 assert.throws(()=>verifySignoffPolicy(p,src));
});
