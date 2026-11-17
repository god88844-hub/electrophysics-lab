import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyPolicy,releaseAudit} from '../js/evidence/phase57-unified-audit.js';
const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const txt=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const policy=json('../benchmarks/phase57/release-policy.json');
const inputs={phase56:json('../benchmarks/phase56/admission-policy.json'),
 phase55:json('../benchmarks/phase55/provenance-policy.json'),
 phase54:json('../benchmarks/phase54/prototype-acquisition-policy.json'),
 phase53:json('../benchmarks/phase53/signoff-boundary.json'),
 phase52:json('../benchmarks/phase52/reference-system-qualification.json'),
 fanSources:{hardware:json('../benchmarks/phase41/reference-hardware-candidate.json'),
  capture:json('../benchmarks/phase42/physical-capture-protocol.json'),
  whole:json('../benchmarks/phase48/whole-system-readiness.json'),
  fault:json('../benchmarks/phase51/fault-model-scope.json')},
 flowScripts:Object.fromEntries([
 'scripts/phase21-run.sh','scripts/phase22-run.sh','scripts/phase22-enable-feol.mjs',
 'scripts/phase22-proof.ys','benchmarks/phase13/rtl/alu8.v'].map(p=>[p,txt('../'+p)]))};
test('Frozen release policy cannot promote hardware or production claims',()=>{
 assert.equal(verifyPolicy(policy),true);
 for(const change of [x=>x.allDraftPRsMerged=true,x=>x.actualALUMeasurementCount=48,
  x=>x.noPhysicalGoWhenOriginalHardwareMissing=false,x=>x.realWorldBuildSuccessPercent=100]){
  const p=structuredClone(policy);change(p);assert.throws(()=>verifyPolicy(p));
 }
});
test('All five release dimensions remain distinct, with physical no-go',()=>{
 const r=releaseAudit(policy,inputs);
 assert.equal(r.domainStatus.length,5);
 assert.equal(r.researchSoftwareSourceGate,'CONSISTENT_SOURCES');
 assert.equal(r.fullRepositoryCIStatus,'NOT_MEASURED_BY_THIS_AUDIT');
 assert.equal(r.fanVerifiedPhysicalSamples,0);
 assert.equal(r.aluVerifiedPhysicalSamples,0);
 assert.equal(r.productionReleaseAuthorized,false);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Candidate self-approved physical release cannot modify independent verdict',()=>{
 const r=releaseAudit(policy,{...inputs,review:{physicallyQualified:true,productionApproved:true},
  sourceIntegratedIntoMain:true});
 assert.equal(r.mergedMainIntegration,false);
 assert.equal(r.independentExternalReviewerApproved,false);
 assert.equal(r.physicalProofSufficient,false);
 assert.equal(r.physicalVerdict,'unknown');
});