// Generate only frozen predictions, blocked lab packet and immutable plan evidence.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {SHA,verifyPlan,predictionBundle,blankCapture,auditCandidate,strictReplay}
 from '../js/measure/phase27-blind.js';
import {RTL_PATH,RTL_GIT_BLOB,SUITE_SHA256} from '../js/measure/phase24-prototype.js';
const root='benchmarks/evidence/phase27/';
const policyRaw=await readFile('benchmarks/phase27/acceptance.json');
const policy=JSON.parse(policyRaw);verifyPlan(policy);
const blob=execFileSync('git',['hash-object',RTL_PATH],{encoding:'utf8'}).trim();
if(blob!==RTL_GIT_BLOB)throw Error('Actual ALU design changed from Phase27 sealed target');
const earlier24=JSON.parse(await readFile('benchmarks/evidence/phase24/phase24-summary.json','utf8'));
if(earlier24.actualPhysicalObservations!==0||earlier24.reportedStatus!=='awaiting-real-hardware'||
   earlier24.vectorSuiteSha256!==SUITE_SHA256)throw Error('Missing Phase24 verified zero-ALU capture');
const earlier26=JSON.parse(await readFile('benchmarks/phase26/acceptance.json','utf8'));
if(earlier26.actualALUSpecimens!==0||earlier26.realWorldBuildSuccessPercent!==null)
 throw Error('Source reliability prerequisites invented physical validation');
await mkdir(root,{recursive:true});
const model=predictionBundle(),blank=blankCapture(),audit=auditCandidate(blank);
const replay=strictReplay(policy,blank,model,audit);
if(!replay.ok||audit.status!=='awaiting-real-hardware')throw Error('Cannot seal an unmeasured design validation packet');
const [predictionsRaw,blankRaw,auditRaw]=[model,blank,audit].map(x=>JSON.stringify(x,null,2)+'\n');
await writeFile(root+'premeasurement-model.json',predictionsRaw);
await writeFile(root+'blank-lab-packet.json',blankRaw);
await writeFile(root+'phase27-preflight.json',auditRaw);
const summary={
 format:'invention-lab/phase27-blind-study-no-hardware-preflight/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 policySha256:SHA(policyRaw),
 phase24SummarySha256:SHA(await readFile('benchmarks/evidence/phase24/phase24-summary.json')),
 phase26PolicySha256:SHA(await readFile('benchmarks/phase26/acceptance.json')),
 predictionFileSha256:SHA(predictionsRaw),
 blankCaptureSha256:SHA(blankRaw),
 auditSha256:SHA(auditRaw),
 targetRTLBlob:blob,
 studyGroupHoldout:'whole-physical-lot',
 futureDeviceSlots:8,futureSessions:48,futureMeasurements:49152,
 originalHardwareReadings:0,actualFabricatedALUCount:0,
 measurementOriginAudit:'not-performed',
 independentPreregistrationAttested:false,
 noMeasuredSiliconConclusions:true,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
};
await writeFile(root+'phase27-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log('PH27 8 planned future die slots, 48 blind sessions and 49,152 future readings; ZERO original hardware measurements');
console.log('PH27 frozen 1024 ALU logic predictions only; chip validation and statistical success remain UNKNOWN');
