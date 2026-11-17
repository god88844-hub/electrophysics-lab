import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyStudy,analyzeBLDCHealthy,independentMotorHoldout}
 from '../js/measure/phase35-independent-holdout.js';
const root='benchmarks/evidence/phase35/';
const sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const raw=await readFile('benchmarks/phase35/acceptance.json');
const policy=JSON.parse(raw);verifyStudy(policy);
const samples=[],physicalFileSources=[];
for(const r of policy.readings){
 const bytes=await readFile(root+r.path.split('/').at(-1));
 const sourceSha1=git('hash-object',root+r.path.split('/').at(-1));
 if(bytes.length!==r.bytes||sourceSha1!==r.gitBlobSHA1)
  throw Error('Public publisher source data SHA1 or byte count mismatch '+r.id);
 const read=analyzeBLDCHealthy(bytes.toString('utf8'),policy,r.id,{sourceGitBlobVerified:true});
 physicalFileSources.push({id:r.id,rawBytes:bytes.length,sourceGitObject:sourceSha1,sha256:sha(bytes)});
 samples.push(read);
 console.log('PH35 '+r.id+' : '+read.rawSampleCount+' original rows; measured tach '+
   (read.measuredSpeedRpm===null?'UNUSABLE':read.measuredSpeedRpm.toFixed(3)+' RPM')+
   '; actual measured upstream current '+read.meanUpstreamCurrentA.toFixed(4)+' A'+
   '; time/PG sample quality '+JSON.stringify(read.acquisitionQuality));
}
const independent=independentMotorHoldout(policy,samples);
const record={
 format:'invention-lab/phase35-verified-motor-unit-original-holdout-replay/1',
 sourceCommit:git('rev-parse','HEAD'),
 publisherCommit:policy.sourceCommit,
 publisherOriginalMotorPart:policy.motorType,
 publisherLicense:policy.license,
 policySHA256:sha(raw),
 analyzerSourceSHA256:sha(await readFile('js/measure/phase35-independent-holdout.js')),
 originalPublisherFiles:physicalFileSources,
 evidence:independent,
 independentlyCalibratedPhysicalPredictionErrorForCurrent3VFan:null,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
};
await mkdir(root,{recursive:true});
await writeFile(root+'phase35.json',JSON.stringify(record,null,2)+'\n');
console.log('PH35 independent DIFFERENT BLDC motor holdout speed difference '+independent.heldOutAbsoluteSpeedDifferenceRpm.toFixed(2)+' RPM, '+independent.heldOutRelativeSpeedDifferencePercent.toFixed(3)+'% of motor2 reference. This is NOT 3V fan error or yield.');
