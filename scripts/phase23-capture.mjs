// Derive descriptive, honest device-level comparison from real frozen raw files.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256,README,DATASETS,assemblePhase23,verifyPhase23}
 from '../js/measure/sky130-mdm.js';
const ROOT='benchmarks/evidence/phase23/';
const paths={[README.path]:ROOT+'raw/README.rst'};
for(const d of DATASETS)paths[d.path]=ROOT+'raw/'+d.id+'.mdm';
const rawFiles={};
for(const [source,local] of Object.entries(paths))rawFiles[source]=await readFile(local);
const manifestText=await readFile('benchmarks/phase23/acceptance.json','utf8');
const manifest=JSON.parse(manifestText);
const evidence=assemblePhase23(manifest,rawFiles);
const record={
 format:'invention-lab/phase23-original-measured-sky130-evidence-capture/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 acceptanceManifestSha256:sha256(manifestText),
 evidence
};
const result=verifyPhase23(record.evidence,evidence,{
 commitSha:record.sourceCommit,reportCommitSha:record.sourceCommit,
 manifestSha256:record.acceptanceManifestSha256,
 recordedManifestSha256:record.acceptanceManifestSha256
});
if(!result.ok)throw Error('Phase23 source-locked experiment failed: '+result.errors.join('; '));
await writeFile(ROOT+'phase23.json',JSON.stringify(record,null,2)+'\n');
console.log('PH23 genuine public SKY130 resistor device I-V sweeps ingested '+evidence.files.map(x=>x.sweep.samples).join('+')+' measurements');
console.log('PH23 heldout DEVICE current RMSE '+evidence.comparison.heldOutRMSEA+' A; ALU physical UNKNOWN');
