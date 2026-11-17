import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {INPUTS,prepareExternalQualificationPacket,verifyExternalQualificationPacket} from '../js/release/external-qualification-kit.js';
const raw=Object.fromEntries(await Promise.all(INPUTS.map(async path=>[path,await readFile(path)])));
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const packet=prepareExternalQualificationPacket(sourceCommit,raw);
verifyExternalQualificationPacket(packet);
const header=['# External qualification laboratory and independent review request','',
 'Research source commit: '+sourceCommit,'','Status: **NOT QUALIFIED — no real physical evidence or independent approvals received**.',
 '','## Reference 3 V battery–wire–brushed motor–fan candidate',
 'Reference design: '+packet.targetFan.designId,'',
 '**Before any physical power-on or impeller spin, obtain independent mechanical and electrical safety signoff.**',
 'The software does not authorize experiments or certify hardware safety.','',
 '### Missing physical gates',
 ...packet.targetFan.mandatoryPhysicalGates.map((s,i)=>(i+1)+'. [ ] '+s),'',
 '### Required original CSV columns',
 packet.targetFan.requiredCSVColumns.map(x=>'\`'+x+'\`').join(', '),'',
 '### Required provenance metadata',
 packet.targetFan.requiredSourceMetadata.map(x=>'\`'+x+'\`').join(', '),'',
 '### Prerequisites from the existing project protocol',
 ...packet.targetFan.safetyPrerequisites.map(x=>'- '+x),'',
 '## SKY130 8-bit ALU original prototype study',
 'Original RTL Git blob: '+packet.targetALU.originalRtlGitBlobSHA1,
 'Frozen vector-suite SHA-256: '+packet.targetALU.originalVectorSuiteSHA256,
 'Plan (NOT completed): 8 die slots, 48 sessions, 1,024 stimulus vectors/session, 49,152 prospective instrument reads.',
 'The instrument operator must **not** receive expected digital outputs.',
 'Require independently verified fabrication and metrology attestor identities through an out-of-band trusted registry.',
 'Actual fabricated dies: **0**. Foundry/tapeout approval: **NONE**.','',
 '## Independent third-party review deliverables',
 ...packet.externalReviewRequests.map(x=>'- [ ] '+x.role+': '+x.mustProvide),'',
 '## Provenance and custody',
 'Preserve original raw acquisition files byte-for-byte and calculate SHA-256 before any normalization.',
 'Record source-matched part/lot identity, certified instrument calibration, independent operator/reviewer role separation,',
 'safety approvals, blind device/lot-separated holdouts and preregistered tolerances.',
 '**Do not publish unredacted serial numbers, personal identifiers, raw proprietary data, or private signing keys in a public GitHub issue.**',
 'A self-uploaded SHA-256 or a self-signed laboratory certificate is not independent authentication.',
 'Reviewers must verify fabrication/instrument origin against out-of-band records.','',
 '## Current disposition',
 '- Real source-matched fan specimens and readings: 0',
 '- Authenticated ALU dies and original instrument readings: 0',
 '- Independent reviewer approvals: 0',
 '- Physical validation: none; physical verdict: unknown',
 '- Manufacturing release: NO-GO; real-world success percentage: UNKNOWN',
 '',
 'The machine-readable \`qualification-request.json\` binds this request to all five original source policy files by SHA-256.',''];
const target='benchmarks/evidence/external-qualification';
await mkdir(target,{recursive:true});
await writeFile(target+'/qualification-request.json',JSON.stringify(packet,null,2)+'\n');
await writeFile(target+'/lab-and-reviewer-request.md',header.join('\n'));
console.log('EXTERNAL-QUALIFICATION HANDOFF PREPARED: source locked; 0 lab readings and 0 independent approvals; NO-GO');
