// Independently reopens frozen source, real mapped cell netlist and Yosys logs.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {FILES,LIB_BLOB,classifyYosysProof,evaluatePhase17} from '../js/evidence/phase17-gate-equivalence.js';
const ROOT='benchmarks/evidence/phase17/',sha=x=>createHash('sha256').update(x).digest('hex');
const cmd=(p,args)=>execFileSync(p,args,{encoding:'utf8'}).trim();
try{
 const manifest=JSON.parse(await readFile('benchmarks/phase17/acceptance.json','utf8'));
 const report=JSON.parse(await readFile(ROOT+'phase17.json','utf8'));
 const actual={hashes:{},commitSha:cmd('git',['rev-parse','HEAD']),
   yosysVersion:cmd('yosys',['-V']),
   libertyGitBlobSha1:cmd('git',['hash-object',FILES.cellLiberty])};
 for(const [k,p] of Object.entries(FILES))actual.hashes[k]=sha(await readFile(p));
 for(const k of ['positive','mutant']){
   const log=await readFile(ROOT+'tool-logs/'+k+'.log','utf8');
   actual.hashes[k+'Log']=sha(log);
   actual[k==='positive'?'positiveVerdict':'mutantVerdict']=classifyYosysProof(log);
 }
 actual.mappedCellTypesPresent=/sky130_fd_sc_hd__/.test(await readFile(FILES.mappedNetlist,'utf8'));
 if(actual.libertyGitBlobSha1!==LIB_BLOB)throw Error('Liberty source no longer source-locked');
 const verdict=evaluatePhase17(manifest,report,actual);
 const summary={
  format:'invention-lab/phase17-independent-formal-replay/1',
  sourceCommit:actual.commitSha,accepted:verdict.ok,
  computationalVerdict:verdict.verdict,
  correctReference:actual.positiveVerdict,mutantReference:actual.mutantVerdict,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  errors:verdict.errors
 };
 await writeFile(ROOT+'phase17-summary.json',JSON.stringify(summary,null,2)+'\n');
 process.stdout.write('PHASE17 independent replay '+(verdict.ok?'PASS':'FAIL')+'; physical UNKNOWN\n');
 if(!verdict.ok)process.exitCode=1;
}catch(e){
 process.stderr.write('PHASE17 independent replay FAILED: '+e.message+'\n');
 process.exitCode=1;
}
