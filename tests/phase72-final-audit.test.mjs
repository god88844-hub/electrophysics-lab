import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFinalPolicy,reviewResearchCandidate} from '../js/evidence/phase72-final-audit.js';
const policy=JSON.parse(readFileSync(new URL('../benchmarks/phase72/final-policy.json',import.meta.url),'utf8'));
test('Final policy fail-closed on forged silicon, fan, UAT or signed product approval',()=>{
 assert.equal(verifyFinalPolicy(policy),true);
 for(const [key,value] of [
 ['qualifiedFanSpecimens',1],['authenticatedALUDies',2],
 ['allDevelopmentPRsMergedIntoMain',true],['signedReleaseTagCreated',true],
 ['realRepresentativeUserUATComplete',true],['independentSecurityPenTestComplete',true],
 ['foundryTapeoutApproved',true],['realWorldBuildSuccessPercent',99.9]
 ]){const forged=structuredClone(policy);forged[key]=value;assert.throws(()=>verifyFinalPolicy(forged));}
});
test('Actual package + six engine paths yield source-candidate-only, NO product/silicon release',async()=>{
 const r=await reviewResearchCandidate(policy);
 assert.equal(r.researchSourceCandidate.status,'SOURCE_CHECKS_PASS');
 assert.equal(r.researchSourceCandidate.acceptanceCaseCount,6);
 assert.equal(r.decision,'DRAFT_RESEARCH_SOURCE_CANDIDATE_ONLY');
 assert.equal(r.integratedMainSoftwareRelease,false);
 assert.equal(r.manufacturingReleaseAuthorized,false);
 assert.equal(r.publicSignedProductReleaseAuthorized,false);
 assert.equal(r.physicalQualification.productionBuildSuccessProbability,null);
 assert.ok(r.blockers.length>=6);
});
