// Original publisher physical measurement: healthy 24V BLDC, NOT the 3V fan.
import {readFile,mkdir,writeFile,createReadStream} from 'node:fs';
import {readFile as readBytes,writeFile as writeBytes,mkdir as makeDir} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyHealthyPin,inspectHealthyPublishedRecording,comparePublishedHealthyWithFault}
 from '../js/measure/phase34-healthy-bldc.js';
import {verifyPublicPin,inspectPublishedBLDC} from '../js/measure/phase33-original-bldc.js';
const root='benchmarks/evidence/phase34/';
const hash=x=>createHash('sha256').update(x).digest('hex');
const policyRaw=await readBytes('benchmarks/phase34/acceptance.json');
const policy=JSON.parse(policyRaw);verifyHealthyPin(policy);
const raw=await readBytes(root+'original-healthy.csv');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const blob=git('hash-object',root+'original-healthy.csv');
if(blob!==policy.expectedGitBlobSHA1||raw.length!==policy.expectedBytes)
 throw Error('Original healthy published physical acquisition bytes were modified');
const lines=createInterface({input:createReadStream(root+'original-healthy.csv'),crlfDelay:Infinity});
const healthy=await inspectHealthyPublishedRecording(lines,policy);
if(healthy.rawRecordedSamples<10000||healthy.recordDurationSeconds<=0||
   healthy.sourceHardwareMeasurementsBelongToOther24VBLDC!==true||
   healthy.realWorldBuildSuccessPercent!==null)
 throw Error('Original healthy acquisition invalid or falsely promoted to the target fan');
const faultyPolicy=JSON.parse(await readBytes('benchmarks/phase33/acceptance.json'));
verifyPublicPin(faultyPolicy);
const faultBytes=await readBytes('benchmarks/evidence/phase33/source-bldc-original.csv');
const faultBlob=git('hash-object','benchmarks/evidence/phase33/source-bldc-original.csv');
if(faultBlob!==faultyPolicy.expectedGitBlobSHA1)
 throw Error('Comparison fault reference original Git blob changed');
const fault=inspectPublishedBLDC(faultBytes.toString('utf8'),faultyPolicy,{strictPinnedFile:true});
const comparison=comparePublishedHealthyWithFault(healthy,fault);
if(comparison.originalTargetFanPhysicalObservations!==0||
   comparison.faultyPulseReconstructedRPM!==null||
   comparison.realWorldBuildSuccessPercent!==null)
 throw Error('Other BLDC physical recording was promoted to our 3V fan evidence');
const record={
 format:'invention-lab/phase34-real-original-healthy-source-measured-pulse-audit/1',
 sourceCommit:git('rev-parse','HEAD'),
 publisherGitCommit:policy.sourceCommit,
 exactHealthyGitBlob:blob,
 healthyPublisherRawSha256:hash(raw),
 originalHealthyRawBytes:raw.length,
 faultComparisonGitBlob:faultBlob,
 sourceCodeSha256:hash(await readBytes('js/measure/phase34-healthy-bldc.js')),
 policySha256:hash(policyRaw),
 source:policy.sourceRepository,license:policy.sourceLicense,
 attribution:policy.attribution,
 healthyRecording:healthy,faultComparison:comparison,
 independentOriginalLabCalibrationConfirmed:false,
 actualTarget3VFanPhysicalMeasurements:0,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
};
await makeDir(root,{recursive:true});
await writeBytes(root+'phase34.json',JSON.stringify(record,null,2)+'\n');
console.log('PH34 original healthy publisher source: '+healthy.rawRecordedSamples+' raw rows, '+healthy.recordDurationSeconds.toFixed(6)+' s, PG rising edges '+healthy.pgRisingEdges);
console.log('PH34 source speed reconstructed: '+String(healthy.reconstructedPublisherPGSpeedRpm)+' RPM; setpoint '+policy.namedRpmSetpoint+' RPM; source identity NOT 3V fan');
console.log('PH34 original faulty comparator speed=null; actual target physical data=0');
