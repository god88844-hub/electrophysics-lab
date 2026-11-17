// Independent re-open and replay original published raw readings, frozen model
// policy, original Phase23 evidence, Phase24 blank hardware capture and report.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {DATASETS,README,assemblePhase23,parseMdm} from '../js/measure/sky130-mdm.js';
import {verifyPolicy,computeDiagnostics,replayPhase25} from '../js/measure/phase25-bounded-calibration.js';
const R='benchmarks/evidence/phase23/',OUT='benchmarks/evidence/phase25/';
const sha=x=>createHash('sha256').update(x).digest('hex');
try{
 const record=JSON.parse(await readFile(OUT+'phase25.json','utf8'));
 const manifestRaw=await readFile('benchmarks/phase25/acceptance.json');
 const policy=JSON.parse(manifestRaw);verifyPolicy(policy);
 const original={[README.path]:await readFile(R+'raw/README.rst')};
 for(const d of DATASETS)original[d.path]=await readFile(R+'raw/'+d.id+'.mdm');
 const previous=assemblePhase23(JSON.parse(await readFile('benchmarks/phase23/acceptance.json','utf8')),original);
 const parsed=DATASETS.map(d=>parseMdm(original[d.path].toString('utf8'),{expectedSamples:d.samples}));
 const derived=computeDiagnostics(parsed[0],parsed[1],policy);
 if(Math.abs(derived.holdout.signedError.rms-previous.comparison.heldOutRMSEA)>1e-14)
  throw Error('Source-locked Phase23 heldout RMSE disagrees with Phase25 replay');
 const inputs={
  phase23README:sha(original[README.path]),
  trainingMDM:sha(original[DATASETS[0].path]),
  holdoutMDM:sha(original[DATASETS[1].path]),
  phase23Evidence:sha(await readFile(R+'phase23.json')),
  phase23Summary:sha(await readFile(R+'phase23-summary.json')),
  phase24Readiness:sha(await readFile('benchmarks/evidence/phase24/phase24-summary.json')),
  phase24EmptyCapture:sha(await readFile('benchmarks/evidence/phase24/capture-template.json'))
 };
 const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const verdict=replayPhase25(record.comparison,derived,{
  commitSha:sourceCommit,sourceCommit:record.sourceCommit,
  manifestSha256:sha(manifestRaw),sourceManifestSha256:record.manifestSha256
 });
 if(!verdict.ok||record.format!=='invention-lab/phase25-recorded-original-source-calibration/1'||
    JSON.stringify(record.inputs)!==JSON.stringify(inputs)||
    record.physicalValidation!=='none'||record.physicalVerdict!=='unknown'||
    record.realWorldBuildSuccessPercent!==null)
  throw Error('Original raw file/manifest/evidence hash or physical claim was altered: '+verdict.errors.join('; '));
 const read24=JSON.parse(await readFile('benchmarks/evidence/phase24/phase24-summary.json','utf8'));
 if(read24.actualPhysicalObservations!==0||read24.reportedStatus!=='awaiting-real-hardware'||
    read24.physicalVerdict!=='unknown')
  throw Error('ALU hardware capture not empty; external measurement not authenticated');
 const summary={
  format:'invention-lab/phase25-strict-real-resistor-discrepancy-no-alu-calibration/1',
  accepted:true,sourceCommit,sourceRepository:'google/skywater-pdk-sky130-raw-data',
  originalMeasuredResistorDevices:2,measuredResistorReadings:102,
  trainingDevices:1,unseenHoldoutDevices:1,
  heldoutCurrentRMSEA:derived.holdout.signedError.rms,
  heldoutCurrentBiasA:derived.holdout.signedError.mean,
  heldoutMaxAbsErrorA:derived.holdout.signedError.maxAbs,
  currentBalanceHoldoutMaxAbsA:derived.currentBalance.holdout.maxAbs,
  hypotheticalStatisticalInterval:null,
  crediblePopulationCoverage:null,
  calibratedALUTiming:false,
  independentALUMeasurements:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  blockers:[
   'No independent fabricated ALU measurements or source instrument files',
   'Only one unseen resistor specimen; sweep points share one physical device and are correlated',
   'No instrument uncertainty budgets, traceable calibration or signed review',
   'Unverified lot/wafer independence and no prospective chip timing acceptance threshold'
  ]
 };
 await writeFile(OUT+'phase25-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH25 STRICT PASS: original measured resistor holdout replay, uncertainty claims blocked, ALU silicon UNKNOWN');
}catch(e){console.error('PH25 STRICT FAIL: '+e.message);process.exitCode=1;}
