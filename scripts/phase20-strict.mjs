// Independently reopen raw external tool logs, routed databases, wire SPEF and libs.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {CORNERS,SOURCE_FILES,parseCorner,evaluatePhase20} from '../js/evidence/phase20-postroute-multicorner.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ROOT='benchmarks/evidence/phase20/';
try{
 const record=JSON.parse(await readFile(ROOT+'phase20.json','utf8'));
 const sha256={};
 for(const [k,p] of Object.entries(SOURCE_FILES))sha256[k]=sha(await readFile(p));
 const libraries=[],logs=[],results=[];
 for(const c of CORNERS){
  const p=ROOT+'libs/sky130_fd_sc_hd__'+c.corner+'.lib';
  const raw=await readFile(p);
  libraries.push({...c,sha256:sha(raw),gitBlobSha1:git('hash-object',p),bytes:raw.length});
  const log=await readFile(ROOT+'tool-logs/'+c.id+'.log','utf8');
  logs.push(sha(log));results.push(parseCorner(log,c));
 }
 const actual={commitSha:git('rev-parse','HEAD'),
  imageDigest:(await readFile('benchmarks/evidence/phase19/image-digest.txt','utf8')).trim(),
  sha256,libraries,results,logs,worstModelSlackNs:Math.min(...results.map(r=>r.worstSlackNs))};
 const verdict=evaluatePhase20(record,actual);
 const summary={
  format:'invention-lab/phase20-independent-postroute-pvt-replay/1',
  accepted:verdict.ok,sourceCommit:actual.commitSha,verdict:verdict.verdict,
  paths:results.reduce((n,r)=>n+r.paths.length,0),
  corners:results.map(r=>({id:r.id,temperatureC:r.temperatureC,voltageV:r.voltageV,
    worstSlackNs:r.worstSlackNs,modelPass:r.withinBudget})),
  worstModelSlackNs:actual.worstModelSlackNs,extractedRcViews:1,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  missing:['foundry-drc','lvs','multi-rc-corner-extraction','prototype-measurements','independent-silicon-calibration'],
  errors:verdict.errors
 };
 await writeFile(ROOT+'phase20-summary.json',JSON.stringify(summary,null,2)+'\n');
 if(!verdict.ok)throw Error(verdict.errors.join('; '));
 console.log('PH20 STRICT REPLAY PASS: genuine postroute 3 cell-PVT corners / 30 paths; physical UNKNOWN');
}catch(e){console.error('PH20 strict failure: '+e.message);process.exitCode=1}
