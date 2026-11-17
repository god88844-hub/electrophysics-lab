// Original publisher bytes, chronological sensor acquisition and causal
// qualification scope replay independent of generated source summary.
import {readFile as readBytes,writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {verifyHealthyPin,inspectHealthyPublishedRecording,comparePublishedHealthyWithFault}
 from '../js/measure/phase34-healthy-bldc.js';
import {verifyPublicPin,inspectPublishedBLDC} from '../js/measure/phase33-original-bldc.js';
const path='benchmarks/evidence/phase34/';
const hash=x=>createHash('sha256').update(x).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
try{
 const rawPolicy=await readBytes('benchmarks/phase34/acceptance.json');
 const policy=JSON.parse(rawPolicy);verifyHealthyPin(policy);
 const bytes=await readBytes(path+'original-healthy.csv');
 const summary=JSON.parse(await readBytes(path+'phase34.json','utf8'));
 const sha1=git('hash-object',path+'original-healthy.csv');
 const lines=createInterface({input:createReadStream(path+'original-healthy.csv'),crlfDelay:Infinity});
 const measured=await inspectHealthyPublishedRecording(lines,policy);
 const oldPolicy=JSON.parse(await readBytes('benchmarks/phase33/acceptance.json','utf8'));
 verifyPublicPin(oldPolicy);
 const oldBytes=await readBytes('benchmarks/evidence/phase33/source-bldc-original.csv');
 const oldSHA1=git('hash-object','benchmarks/evidence/phase33/source-bldc-original.csv');
 const fault=inspectPublishedBLDC(oldBytes.toString('utf8'),oldPolicy,{strictPinnedFile:true});
 const compare=comparePublishedHealthyWithFault(measured,fault);
 if(sha1!==policy.expectedGitBlobSHA1||
    summary.format!=='invention-lab/phase34-real-original-healthy-source-measured-pulse-audit/1'||
    summary.sourceCommit!==git('rev-parse','HEAD')||
    summary.exactHealthyGitBlob!==sha1||
    summary.healthyPublisherRawSha256!==hash(bytes)||
    summary.originalHealthyRawBytes!==policy.expectedBytes||
    summary.faultComparisonGitBlob!==oldSHA1||
    oldSHA1!==policy.pairedFaultCaseSourceBlob||
    summary.sourceCodeSha256!==hash(await readBytes('js/measure/phase34-healthy-bldc.js'))||
    summary.policySha256!==hash(rawPolicy)||
    summary.publisherGitCommit!==policy.sourceCommit||
    summary.license!=='CC BY 4.0'||
    !isDeepStrictEqual(summary.healthyRecording,measured)||
    !isDeepStrictEqual(summary.faultComparison,compare)||
    summary.independentOriginalLabCalibrationConfirmed!==false||
    summary.actualTarget3VFanPhysicalMeasurements!==0||
    summary.physicalValidation!=='none'||summary.physicalVerdict!=='unknown'||
    summary.realWorldBuildSuccessPercent!==null||
    !measured.sourceHardwareMeasurementsBelongToOther24VBLDC||
    compare.deviceMatchesHypothetical3VBrushedFan!==false)
  throw Error('Source-pinned 24V real recordings or physical target-scope provenance changed');
 const report={
  format:'invention-lab/phase34-independent-real-healthy-motor-replay/1',
  originalPublisherSHA1:sha1,publisherSourceCommit:policy.sourceCommit,
  originalHealthySourceRows:measured.rawRecordedSamples,
  originalSourceDurationSeconds:measured.recordDurationSeconds,
  originalHealthyBusVoltageV:measured.upstreamBusVoltageMeanV,
  originalHealthyCurrentA:measured.upstreamElectricalCurrentMeanA,
  usableOriginalTachometerSignal:measured.originalPublisherPGSignalSpeedUsable,
  inferredOtherBLDCMotorSpeedRPM:measured.reconstructedPublisherPGSpeedRpm,
  measuredSpeedDifferenceToOtherMotorSetpointRPM:measured.differenceToSetpointRpm,
  faultyOriginalTachometerSignal:compare.faultyPulseReconstructedRPM,
  originalRawRowsFromBothPublisherFiles:
   measured.rawRecordedSamples+fault.parsedOriginalPublishedRows,
  uniqueMechanicalMotorUnitHoldoutsEstablished:0,
  independentlyCertifiedInstrumentChain:false,
  measuredTarget3VFanPhysicalAccuracy:null,
  realWorldBuildSuccessPercent:null,
  physicalValidationForTarget:'none',physicalVerdictForTarget:'unknown'
 };
 await writeFile(path+'phase34-summary.json',JSON.stringify(report,null,2)+'\n');
 console.log('PH34 STRICT PASS: '+measured.rawRecordedSamples+' healthy original published motor sensor rows, PG speed '+measured.reconstructedPublisherPGSpeedRpm+' RPM; faulty PG RPM null; 3V fan evidence UNKNOWN');
}catch(error){console.error('PH34 STRICT FAIL: '+error.message);process.exitCode=1}
