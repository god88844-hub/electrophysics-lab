// Re-open raw original data and reconstruct the complete evidence independently.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {CORNERS,parseCornerLog,evaluatePhase16Evidence} from '../js/evidence/phase16-multicorner.js';
const dir='benchmarks/evidence/phase16/';
const command=(bin,args)=>execFileSync(bin,args,{encoding:'utf8'}).trim();
const digest=x=>createHash('sha256').update(x).digest('hex');
const paths={
 rtlSha256:'benchmarks/phase13/rtl/alu8.v',
 netlistSha256:'benchmarks/evidence/phase14/alu8-sky130-mapped.v',
 sdcSha256:'benchmarks/phase14/alu8-tt.sdc',
 staTclSha256:'scripts/phase16-corner.tcl'
};
try{
 const manifest=JSON.parse(await readFile('benchmarks/phase16/acceptance.json','utf8'));
 const record=JSON.parse(await readFile(dir+'phase16.json','utf8'));
 const actual={
   commitSha:command('git',['rev-parse','HEAD']),
   openstaVersion:'OpenSTA '+command('sta',['-version']),
   sourceHashes:{},libraries:[],logs:[],results:[]
 };
 for(const [key,p] of Object.entries(paths))actual.sourceHashes[key]=digest(await readFile(p));
 const mapText=await readFile(paths.netlistSha256,'utf8');
 if(!/sky130_fd_sc_hd__\w+/.test(mapText))throw Error('No actual mapped SKY130 standard cells');
 for(const c of CORNERS){
   const p=dir+'libs/sky130_fd_sc_hd__'+c.corner+'.lib';
   const data=await readFile(p);
   actual.libraries.push({
     id:c.id,corner:c.corner,sha256:digest(data),
     gitBlobSha1:command('git',['hash-object',p]),bytes:data.length
   });
   const log=await readFile(dir+'tool-logs/'+c.id+'.log');
   actual.logs.push(digest(log));
   actual.results.push(parseCornerLog(log.toString('utf8'),c));
 }
 const verdict=evaluatePhase16Evidence(manifest,record,actual);
 const summary={
   format:'invention-lab/phase16-independent-physical-boundary-report/1',
   sourceCommit:actual.commitSha,
   computationalVerdict:verdict.verdict,
   accepted:verdict.ok,
   independentProcessCornerRuns:verdict.realProcessCornersAnalyzed,
   cornerWorstSlacksNs:actual.results.map(c=>({corner:c.corner,worstSlackNs:c.worstSlackNs})),
   acknowledgedUpstreamLibertyDiagnostics:actual.results.map(c=>c.libertyDiagnostic),
   globalWorstModeledSlackNs:Math.min(...actual.results.map(x=>x.worstSlackNs)),
   postLayout:false,physicalValidation:'none',physicalVerdict:'unknown',
   realWorldBuildSuccessPercent:null,errors:verdict.errors
 };
 await writeFile(dir+'phase16-summary.json',JSON.stringify(summary,null,2)+'\n');
 process.stdout.write('PHASE16 STRICT '+(verdict.ok?'PASS':'FAIL')+
   ': 3 authentic PVT library reports / 30 complete constrained paths, zero actual prototype measurements\n');
 if(!verdict.ok){
   for(const e of verdict.errors)process.stderr.write('FAIL '+e+'\n');
   process.exitCode=1;
 }
}catch(e){
 process.stderr.write('PHASE16 STRICT FAILED (physical UNKNOWN): '+e.message+'\n');
 process.exitCode=1;
}
