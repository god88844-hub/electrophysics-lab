// Re-read original fetched 24V BLDC publisher bytes and independently
// replay timing/sensor-health; do not confuse source quality with fan proof.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {verifyPublicPin,inspectPublishedBLDC} from '../js/measure/phase33-original-bldc.js';
const root='benchmarks/evidence/phase33/',sha=b=>createHash('sha256').update(b).digest('hex');
try{
 const policyRaw=await readFile('benchmarks/phase33/acceptance.json');
 const policy=JSON.parse(policyRaw);verifyPublicPin(policy);
 const bytes=await readFile(root+'source-bldc-original.csv');
 const record=JSON.parse(await readFile(root+'phase33.json','utf8'));
 const blob=execFileSync('git',['hash-object',root+'source-bldc-original.csv'],{encoding:'utf8'}).trim();
 const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const observed=inspectPublishedBLDC(bytes.toString('utf8'),policy,{strictPinnedFile:true});
 if(blob!==policy.expectedGitBlobSHA1||record.sourceCommit!==head||
  record.format!=='invention-lab/phase33-original-pinned-real-bldc-sensor-data/1'||
  record.publisherCommit!==policy.sourceCommit||
  record.exactPublisherGitBlob!==blob||
  record.rawSourceSHA256!==sha(bytes)||
  record.originalPublisherLicense!=='CC BY 4.0'||
  record.policySHA256!==sha(policyRaw)||
  record.analysisSourceSHA256!==sha(await readFile('js/measure/phase33-original-bldc.js'))||
  record.downloadedOriginalRawBytes!==421672||
  record.sourceIsOther24VBLDC!==true||
  record.sourcePublisherHardwareExperimentIndependentlyAuthenticated!==false||
  !isDeepStrictEqual(record.rawRecording,observed)||
  record.target3VFanPhysicalReadings!==0||
  record.realWorldBuildSuccessPercent!==null||
  record.physicalVerdict!=='unknown'||record.physicalValidation!=='none'||
  observed.physicallyUsableTachometerEstimate!==false||
  observed.inferredRpmFromPulseEdges!==null)
  throw Error('Original publisher Git raw file source changed or nonmatching physical evidence promoted to 3V fan');
 const summary={
  format:'invention-lab/phase33-independent-real-experiment-source-sensor-gate/1',
  accepted:true,publisherGitCommit:policy.sourceCommit,
  exactRawPublisherGitBlob:blob,
  originalPublisherRawSHA256:sha(bytes),
  originalOtherBLDCRawRows:observed.parsedOriginalPublishedRows,
  sourceMeasuredBusVoltageMeanV:observed.measuredBusVoltageMeanV,
  sourceMeasuredElectricalCurrentMeanA:observed.measuredElectricalCurrentMeanA,
  sourceMeasuredDurationSeconds:observed.elapsedRecordSeconds,
  tachometerStuckHighOriginalSamples:observed.tachHighSamples,
  sourcePublisherDeclaredSensorFailure:true,
  reconstructedOriginalRpm:null,
  independentOriginalLabTraceabilityConfirmed:false,
  independentTarget3VBatteryFanPhysicalMeasurements:0,
  sourceToCurrentDesignPhysicalModelTransfer:'BLOCKED_NONMATCHING_DEVICE_AND_SENSOR_FAILURE',
  modelPhysicalErrorBoundForTarget:null,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 };
 await writeFile(root+'phase33-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH33 STRICT PASS: '+observed.parsedOriginalPublishedRows+' independently rehashed published 24V BLDC RAW records; PG failed, fan model NOT physically validated');
}catch(e){console.error('PH33 STRICT FAIL: '+e.message);process.exitCode=1}
