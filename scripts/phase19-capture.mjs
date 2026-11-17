// Capture real external native routing and extracted wire evidence.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {FORMAT,IMAGE,INPUTS,OUTPUTS,parseRouteInspect,inspectSpef,evaluatePhase19} from '../js/evidence/phase19-route-rc.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const hashes={};
for(const [k,f] of Object.entries({...INPUTS,...OUTPUTS}))hashes[k]=sha(await readFile(f));
const model=parseRouteInspect(await readFile(OUTPUTS.inspectLog,'utf8'));
const spefStats=inspectSpef(await readFile(OUTPUTS.spef,'utf8'));
const record={format:FORMAT,imageTag:IMAGE,
 imageDigest:(await readFile(OUTPUTS.digest,'utf8')).trim(),
 commitSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 kind:'detailed-routed-open-db-openrcx-spef-postroute-sta',
 sha256:hashes,model,spefStats,
 foundryDrcPassed:false,lvsPassed:false,siliconMeasurements:false,signoffQualified:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
 note:'OpenROAD DRT and OpenRCX model, extracted RC and STA in the same PDK model. No foundry-qualified signoff or measured silicon.'};
const verdict=evaluatePhase19(record,record);
if(!verdict.ok)throw Error('Real phase19 evidence failed gate: '+verdict.errors.join('; '));
await writeFile('benchmarks/evidence/phase19/phase19.json',JSON.stringify(record,null,2)+'\n');
console.log('PH19 native detailed routing and extracted SPEF accepted for strict replay; not physical signoff');
