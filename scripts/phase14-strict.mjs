// Independent file-hash replay and timing-log reparse. JSON cannot self-prove.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {evaluatePhase14Timing,parsePhase14TimingLog} from '../js/evidence/phase14-timing.js';
const dir='benchmarks/evidence/phase14/';
const paths={
 libertySha256:dir+'source/sky130_fd_sc_hd__tt_025C_1v80.lib',
 netlistSha256:dir+'alu8-sky130-mapped.v',
 sdcSha256:'benchmarks/phase14/alu8-tt.sdc',
 staScriptSha256:'scripts/phase14-sta.tcl',
 staLogSha256:dir+'tool-logs/sta.log'
};
try{
 const record=JSON.parse(await readFile(dir+'phase14.json','utf8'));
 const actual={commitSha:process.env.GITHUB_SHA||null};
 for(const [k,p] of Object.entries(paths))
   actual[k]=createHash('sha256').update(await readFile(p)).digest('hex');
 const libBlob=execFileSync('git',['hash-object',paths.libertySha256],{encoding:'utf8'}).trim();
 if(libBlob!=='5773657fe730d984ac06726d0addfdad80395b9b'||libBlob!==record.libraryGitBlobSha1)
   throw Error('Liberty Git blob provenance not verified');
 const lib=(await readFile(paths.libertySha256));
 if(lib.length!==12800135)throw Error('Actual Liberty source size changed');
 const netlist=await readFile(paths.netlistSha256,'utf8');
 if(!/sky130_fd_sc_hd__\w+/.test(netlist))throw Error('No mapped cells in input netlist');
 actual.timing=parsePhase14TimingLog(await readFile(paths.staLogSha256,'utf8'));
 const state=evaluatePhase14Timing(record,actual);
 const summary={
  format:'invention-lab/phase14-strict-summary/1',
  sourceCommit:actual.commitSha,verdict:state.status,checksPassed:state.ok,
  timing:actual.timing,
  physicalVerdict:'unknown',physicalValidation:'none',
  realWorldBuildSuccessPercent:null,errors:state.errors
 };
 await writeFile(dir+'phase14-summary.json',JSON.stringify(summary,null,2)+'\n');
 process.stdout.write('Phase 14 external OpenSTA strict '+summary.verdict+'; physical verdict UNKNOWN\n');
 if(!state.ok){for(const s of state.errors)process.stderr.write('FAIL: '+s+'\n');process.exitCode=1;}
}catch(e){
 process.stderr.write('FAIL: missing, inconsistent or unsupported OpenSTA evidence: '+e.message+'\n');
 process.exitCode=1;
}
