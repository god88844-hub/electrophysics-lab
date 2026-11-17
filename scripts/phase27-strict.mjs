// Independent replay of original RTL, policy, locked predictions and ZERO capture.
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {SHA,verifyPlan,strictReplay} from '../js/measure/phase27-blind.js';
import {RTL_PATH,RTL_GIT_BLOB,SUITE_SHA256} from '../js/measure/phase24-prototype.js';
const root='benchmarks/evidence/phase27/';
try{
 const [policyRaw,predRaw,blankRaw,auditRaw,sumRaw,p24Raw,p26Raw]=await Promise.all([
  readFile('benchmarks/phase27/acceptance.json'),
  readFile(root+'premeasurement-model.json'),
  readFile(root+'blank-lab-packet.json'),
  readFile(root+'phase27-preflight.json'),
  readFile(root+'phase27-summary.json'),
  readFile('benchmarks/evidence/phase24/phase24-summary.json'),
  readFile('benchmarks/phase26/acceptance.json')
 ]);
 const policy=JSON.parse(policyRaw),pred=JSON.parse(predRaw),blank=JSON.parse(blankRaw);
 const audit=JSON.parse(auditRaw),summary=JSON.parse(sumRaw);
 verifyPlan(policy);
 const replay=strictReplay(policy,blank,pred,audit);
 const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
 if(!replay.ok||git('hash-object',RTL_PATH)!==RTL_GIT_BLOB||
  summary.format!=='invention-lab/phase27-blind-study-no-hardware-preflight/1'||
  summary.sourceCommit!==git('rev-parse','HEAD')||
  summary.policySha256!==SHA(policyRaw)||
  summary.phase24SummarySha256!==SHA(p24Raw)||
  summary.phase26PolicySha256!==SHA(p26Raw)||
  summary.predictionFileSha256!==SHA(predRaw)||
  summary.blankCaptureSha256!==SHA(blankRaw)||
  summary.auditSha256!==SHA(auditRaw)||
  summary.targetRTLBlob!==RTL_GIT_BLOB||
  summary.futureDeviceSlots!==8||summary.futureSessions!==48||
  summary.futureMeasurements!==49152||
  summary.originalHardwareReadings!==0||
  summary.actualFabricatedALUCount!==0||
  summary.independentPreregistrationAttested!==false||
  summary.noMeasuredSiliconConclusions!==true||
  summary.physicalValidation!=='none'||summary.physicalVerdict!=='unknown'||
  summary.realWorldBuildSuccessPercent!==null||
  pred.vectorsSha256!==SUITE_SHA256||
  JSON.parse(p24Raw).actualPhysicalObservations!==0||
  JSON.parse(p26Raw).actualALUSpecimens!==0)
  throw Error('Phase27 replay or no-real-ALU measurement qualification failed '+replay.blockers.join('; '));
 console.log('PH27 STRICT PASS: exact original design, frozen 1024 predictions, blind lot split, zero actual silicon measurements');
}catch(e){console.error('PH27 STRICT FAIL: '+e.message);process.exitCode=1}
