// Original published 24V test-bench recording with source-Git-blob binding.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyPublicPin,inspectPublishedBLDC} from '../js/measure/phase33-original-bldc.js';
const root='benchmarks/evidence/phase33/';
const sha=b=>createHash('sha256').update(b).digest('hex');
const policyRaw=await readFile('benchmarks/phase33/acceptance.json');
const policy=JSON.parse(policyRaw);verifyPublicPin(policy);
const csv=await readFile(root+'source-bldc-original.csv');
const actualBlob=execFileSync('git',['hash-object',root+'source-bldc-original.csv'],{encoding:'utf8'}).trim();
if(actualBlob!==policy.expectedGitBlobSHA1||csv.length!==policy.expectedRawBytes)
 throw Error('Original independently sourced BLDC raw measurement source Git object changed');
const observed=inspectPublishedBLDC(csv.toString('utf8'),policy,{strictPinnedFile:true});
if(observed.parsedOriginalPublishedRows!==5073||
   observed.tachHighSamples!==5073||
   observed.tachLowSamples!==0||
   observed.tachPulseRisingEdges!==0||
   observed.physicallyUsableTachometerEstimate!==false||
   observed.inferredRpmFromPulseEdges!==null||
   observed.realWorldBuildSuccessPercent!==null)
 throw Error('Real original sensor data no longer shows the documented unmeasurable tachometer fault');
await mkdir(root,{recursive:true});
const record={
 format:'invention-lab/phase33-original-pinned-real-bldc-sensor-data/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 publisherCommit:policy.sourceCommit,
 exactPublisherGitBlob:actualBlob,
 rawSourceSHA256:sha(csv),
 originalPublisherLicense:policy.licensedAs,
 attribution:policy.acknowledgement,
 policySHA256:sha(policyRaw),
 analysisSourceSHA256:sha(await readFile('js/measure/phase33-original-bldc.js')),
 downloadedOriginalRawBytes:csv.length,
 sourceIsOther24VBLDC:true,
 sourcePublisherHardwareExperimentIndependentlyAuthenticated:false,
 rawRecording:observed,
 target3VFanPhysicalReadings:0,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
};
await writeFile(root+'phase33.json',JSON.stringify(record,null,2)+'\n');
console.log('PH33 original source validated: '+observed.parsedOriginalPublishedRows+' PUBLISHED RAW samples; '+observed.elapsedRecordSeconds+'s, mean bus '+observed.measuredBusVoltageMeanV.toFixed(4)+'V');
console.log('PH33 source has stuck PG tachometer high '+observed.tachHighSamples+' / '+observed.parsedOriginalPublishedRows+' frames; motor RPM NOT recoverable');
console.log('PH33 target battery/fan measurements=0; physical build probability UNKNOWN');
