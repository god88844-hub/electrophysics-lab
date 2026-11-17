import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {verifyStudy,analyzeBLDCHealthy} from '../js/measure/phase35-independent-holdout.js';
import {verifyPhase36,analyzeNewHoldoutOriginal,evaluateTwoRegimeHoldout} from '../js/measure/phase36-source-calibration.js';
const root='benchmarks/evidence/',git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const hash=b=>createHash('sha256').update(b).digest('hex');
const p35raw=await readFile('benchmarks/phase35/acceptance.json');
const p36raw=await readFile('benchmarks/phase36/acceptance.json');
const p35=JSON.parse(p35raw),p36=JSON.parse(p36raw);
verifyStudy(p35);verifyPhase36(p35,p36);
const original=[],records=[];
for(const pin of [...p35.readings,p36.additionalHeldOutPublisherRecording]){
 const isNew=pin.id==='holdout-motor3-2000';
 const file=root+(isNew?'phase36/':'phase35/')+pin.path.split('/').at(-1);
 const bytes=await readFile(file);
 const blob=git('hash-object',file);
 if(bytes.length!==pin.bytes||blob!==pin.gitBlobSHA1)
  throw Error('Original immutable Git publisher source corrupted: '+pin.id);
 const recording=isNew?
  analyzeNewHoldoutOriginal(bytes.toString('utf8'),p35,p36,{sourceGitBlobVerified:true}):
  analyzeBLDCHealthy(bytes.toString('utf8'),p35,pin.id,{sourceGitBlobVerified:true});
 original.push({id:pin.id,path:pin.path,bytes:bytes.length,gitBlobSHA1:blob,sha256:hash(bytes),unit:pin.unit,setpointRpm:pin.speedSetpointRpm});
 records.push(recording);
 console.log('PH36 original '+pin.id+' '+recording.rawSampleCount+' rows: '+recording.measuredSpeedRpm.toFixed(4)+' measured PG RPM; '+recording.meanUpstreamCurrentA.toFixed(5)+' A');
}
const evaluation=evaluateTwoRegimeHoldout(p35,p36,records);
const report={
 format:'invention-lab/phase36-original-source-locked-replay/1',
 sourceCommit:git('rev-parse','HEAD'),
 publisherCommit:p36.sourceCommit,policy35SHA256:hash(p35raw),policy36SHA256:hash(p36raw),
 source36SHA256:hash(await readFile('js/measure/phase36-source-calibration.js')),
 originalPublisherFiles:original,evaluation,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
};
await mkdir(root+'phase36/',{recursive:true});
await writeFile(root+'phase36/phase36.json',JSON.stringify(report,null,2)+'\n');
console.log('PH36 holdout MAE '+evaluation.heldOutMeanAbsoluteErrorRpm.toFixed(4)+' RPM; setpoint baseline MAE '+evaluation.heldOutBaselineSetpointMeanAbsoluteErrorRpm.toFixed(4)+' RPM. No fan hardware measured.');