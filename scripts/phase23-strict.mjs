// Strict replay from independently reopened raw experimental measurements.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256,README,DATASETS,assemblePhase23,verifyPhase23}
 from '../js/measure/sky130-mdm.js';
const ROOT='benchmarks/evidence/phase23/';
try{
 const files={[README.path]:ROOT+'raw/README.rst'};
 for(const d of DATASETS)files[d.path]=ROOT+'raw/'+d.id+'.mdm';
 const bytes={};
 for(const [path,local] of Object.entries(files))bytes[path]=await readFile(local);
 const manifestText=await readFile('benchmarks/phase23/acceptance.json','utf8');
 const record=JSON.parse(await readFile(ROOT+'phase23.json','utf8'));
 const derived=assemblePhase23(JSON.parse(manifestText),bytes);
 const verdict=verifyPhase23(record.evidence,derived,{
  commitSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  reportCommitSha:record.sourceCommit,
  manifestSha256:sha256(manifestText),
  recordedManifestSha256:record.acceptanceManifestSha256
 });
 const summary={
  format:'invention-lab/phase23-independent-third-party-measurement-replay/1',
  sourceCommit:record.sourceCommit,accepted:verdict.ok,reasonErrors:verdict.errors,
  publishedSiliconDataOrigin:derived.source.documentedOrigin,
  externalRawGitRevision:derived.source.commit,
  testedDeviceDomain:derived.physicalDomain,
  sourceFileCount:derived.files.length,
  originalMeasuredIVPoints:derived.files.reduce((s,x)=>s+x.sweep.samples,0),
  trainingPoints:derived.comparison.trainObservations,
  withheldSpecimenPointsInsideEnvelope:derived.comparison.holdoutObservationsInsideTrainingEnvelope,
  heldOutCurrentRMSEA:derived.comparison.heldOutRMSEA,
  modelUncertaintyInterval:derived.comparison.uncertaintyInterval,
  instrumentCalibrationChainVerified:false,
  validatedOriginalAluAgainstSilicon:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  missing:derived.missing
 };
 await writeFile(ROOT+'phase23-summary.json',JSON.stringify(summary,null,2)+'\n');
 if(!verdict.ok)throw Error(verdict.errors.join('; '));
 console.log('PH23 independent source replay PASS — published real device measurements, not ALU validation');
}catch(e){console.error('PH23 FAIL: '+e.message);process.exitCode=1}
