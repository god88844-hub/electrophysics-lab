// Capture published measured device residuals with domain-limited uncertainty.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {DATASETS,README,assemblePhase23,parseMdm} from '../js/measure/sky130-mdm.js';
import {verifyPolicy,computeDiagnostics,replayPhase25}
 from '../js/measure/phase25-bounded-calibration.js';
const R='benchmarks/evidence/phase23/',OUT='benchmarks/evidence/phase25/';
const sha=x=>createHash('sha256').update(x).digest('hex');
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const manifestRaw=await readFile('benchmarks/phase25/acceptance.json');
const policy=JSON.parse(manifestRaw);verifyPolicy(policy);
const original={};original[README.path]=await readFile(R+'raw/README.rst');
for(const d of DATASETS)original[d.path]=await readFile(R+'raw/'+d.id+'.mdm');
const previous=assemblePhase23(JSON.parse(await readFile('benchmarks/phase23/acceptance.json','utf8')),original);
if(previous.intendedALU?.calibrationPerformed===true||previous.physicalValidation!=='none')
 throw Error('An external resistor dataset cannot be claimed as an ALU prototype');
const parsed=DATASETS.map(d=>parseMdm(original[d.path].toString('utf8'),{expectedSamples:d.samples}));
const comparison=computeDiagnostics(parsed[0],parsed[1],policy);
const prerequisite=JSON.parse(await readFile('benchmarks/evidence/phase24/phase24-summary.json','utf8'));
if(prerequisite.actualPhysicalObservations!==0||
   prerequisite.physicalValidation!=='none'||prerequisite.realWorldBuildSuccessPercent!==null)
 throw Error('Real ALU hardware evidence was invented in previous phase');
const inputs={
 phase23README:sha(original[README.path]),
 trainingMDM:sha(original[DATASETS[0].path]),
 holdoutMDM:sha(original[DATASETS[1].path]),
 phase23Evidence:sha(await readFile(R+'phase23.json')),
 phase23Summary:sha(await readFile(R+'phase23-summary.json')),
 phase24Readiness:sha(await readFile('benchmarks/evidence/phase24/phase24-summary.json')),
 phase24EmptyCapture:sha(await readFile('benchmarks/evidence/phase24/capture-template.json'))
};
const record={
 format:'invention-lab/phase25-recorded-original-source-calibration/1',
 sourceCommit,manifestSha256:sha(manifestRaw),inputs,comparison,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
};
const result=replayPhase25(comparison,comparison,{
 commitSha:sourceCommit,sourceCommit:record.sourceCommit,
 manifestSha256:sha(manifestRaw),sourceManifestSha256:record.manifestSha256
});
if(!result.ok)throw Error('Physical calibration boundary failed: '+result.errors.join('; '));
await writeFile(OUT+'phase25.json',JSON.stringify(record,null,2)+'\n');
console.log('PH25 authentic independent resistor holdout RMSE '+comparison.holdout.signedError.rms+' A');
console.log('PH25 only TWO resistor specimens; no statistical confidence interval, NO ALU chip measurements');
