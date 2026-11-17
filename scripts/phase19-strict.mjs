// Strict independent replay from actual tool-produced files, no self-report trust.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {INPUTS,OUTPUTS,parseRouteInspect,inspectSpef,evaluatePhase19} from '../js/evidence/phase19-route-rc.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
try{
 const record=JSON.parse(await readFile('benchmarks/evidence/phase19/phase19.json','utf8'));
 const hashes={};
 for(const [k,f] of Object.entries({...INPUTS,...OUTPUTS}))hashes[k]=sha(await readFile(f));
 const actual={commitSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
   imageDigest:(await readFile(OUTPUTS.digest,'utf8')).trim(),sha256:hashes,
   model:parseRouteInspect(await readFile(OUTPUTS.inspectLog,'utf8')),
   spefStats:inspectSpef(await readFile(OUTPUTS.spef,'utf8'))};
 const verdict=evaluatePhase19(record,actual);
 const summary={format:'invention-lab/phase19-strict-extracted-rc-boundary/1',
  accepted:verdict.ok,sourceCommit:actual.commitSha,
  physicalModel:verdict.verdict,worstPostRouteSlackNs:actual.model.worstSlackNs,
  actualNetsInSpef:actual.spefStats.nets,actualPlacedCells:actual.model.geometry.placed,
  actualWiredSignalNets:actual.model.geometry.wiredSignalNets,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  next:['independent-signoff-DRC','independent-LVS','multi-corner-postroute-STA','silicon-measurements'],
  errors:verdict.errors};
 await writeFile('benchmarks/evidence/phase19/phase19-summary.json',JSON.stringify(summary,null,2)+'\n');
 if(!verdict.ok)throw Error(verdict.errors.join('; '));
 console.log('PH19 independent OpenDB, OpenRCX SPEF and constrained post-route timing replay PASS; physical UNKNOWN');
}catch(e){console.error('PH19 STRICT FAIL: '+e.message);process.exitCode=1;}
