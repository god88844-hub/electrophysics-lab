// Independent bytes-to-result replay; report JSON cannot self-verify itself.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {GRID,parsePhase15ToolLog,evaluatePhase15Evidence} from '../js/evidence/phase15-sensitivity.js';
const dir='benchmarks/evidence/phase15/';
const sources={
 rtl:'benchmarks/phase13/rtl/alu8.v',
 liberty:'benchmarks/evidence/phase14/source/sky130_fd_sc_hd__tt_025C_1v80.lib',
 netlist:'benchmarks/evidence/phase14/alu8-sky130-mapped.v',
 sdc:'benchmarks/phase14/alu8-tt.sdc',
 staTcl:'scripts/phase15-case.tcl'
};
const h=x=>createHash('sha256').update(x).digest('hex');
try{
 const manifest=JSON.parse(await readFile('benchmarks/phase15/acceptance.json','utf8'));
 const record=JSON.parse(await readFile(dir+'phase15.json','utf8'));
 const actual={sourceHashes:{},logHashes:[],cases:[],
   commitSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
   toolVersion:'OpenSTA '+execFileSync('sta',['-version'],{encoding:'utf8'}).trim(),
   libertyGitBlobSha1:execFileSync('git',['hash-object',sources.liberty],{encoding:'utf8'}).trim()};
 for(const [key,path] of Object.entries(sources))
   actual.sourceHashes[key]=h(await readFile(path));
 for(const setting of GRID){
   const original=await readFile(dir+'logs/case-'+setting.id+'.log');
   actual.cases.push(parsePhase15ToolLog(original.toString('utf8'),setting));
   actual.logHashes.push(h(original));
 }
 const state=evaluatePhase15Evidence(manifest,record,actual);
 const worst=Math.min(...actual.cases.map(c=>c.worstSlackNs));
 if(record.observedModelWorstSlackNs!==worst)state.errors.push('Falsified cross-case worst slack');
 if(actual.libertyGitBlobSha1!=='5773657fe730d984ac06726d0addfdad80395b9b')
   state.errors.push('Invalid pinned Liberty original source');
 const ok=state.ok&&state.errors.length===0;
 const summary={
  format:'invention-lab/phase15-tt-9x10-strict/1',commitSha:actual.commitSha,
  verifiedComputationalStatus:ok?'passed':'failed',
  exactTimingCases:ok?9:0,exactEndpointPaths:ok?90:0,
  worstModeledSlackNs:worst,realWorldBuildSuccessPercent:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  errors:state.errors
 };
 await writeFile(dir+'phase15-summary.json',JSON.stringify(summary,null,2)+'\n');
 process.stdout.write('PHASE15 STRICT: '+summary.verifiedComputationalStatus+
   '; 9 independently executed processes, 90 constrained paths, 1 PVT corner, 0 physical measurements\n');
 if(!ok)process.exitCode=1;
}catch(e){
 process.stderr.write('PHASE15 STRICT FAIL: '+e.message+'\n');
 process.exitCode=1;
}
