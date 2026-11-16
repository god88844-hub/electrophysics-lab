// Capture actual tool output; never synthesize or invent a timing result.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {parsePhase14TimingLog,FORMAT} from '../js/evidence/phase14-timing.js';
const root='benchmarks/evidence/phase14/';
const files={
 libertySha256:root+'source/sky130_fd_sc_hd__tt_025C_1v80.lib',
 netlistSha256:root+'alu8-sky130-mapped.v',
 sdcSha256:'benchmarks/phase14/alu8-tt.sdc',
 staScriptSha256:'scripts/phase14-sta.tcl',
 staLogSha256:root+'tool-logs/sta.log'
};
const sha=x=>createHash('sha256').update(x).digest('hex');
const raw={};
for(const [k,p] of Object.entries(files))raw[k]=await readFile(p);
const blob=execFileSync('git',['hash-object',files.libertySha256],{encoding:'utf8'}).trim();
if(blob!=='5773657fe730d984ac06726d0addfdad80395b9b')throw Error('Wrong external Liberty source');
const log=raw.staLogSha256.toString('utf8');
const timing=parsePhase14TimingLog(log);
const version=spawnSync('sta',['-version'],{encoding:'utf8'});
const v=(version.stdout||version.stderr||'').trim();
if(!/OpenSTA|STA /i.test(v))throw Error('OpenSTA version not reported by external executable');
const record={
 format:FORMAT,example:'alu8',libraryCorner:'tt_025C_1v80',
 analysis:'pre-layout-combinational-single-typical-corner',
 constraints:{periodNs:20,inputMaxNs:1,outputMaxNs:1,inputSlewNs:0.1,outputLoadPf:0.01},
 commitSha:process.env.GITHUB_SHA||null,
 tool:{version:v},libraryGitBlobSha1:blob,
 timing,physicalValidation:'none',physicalQualified:false,
 physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
 postLayout:false,multiCorner:false,prototypeMeasurements:false,
 note:'External timing from TT Liberty with virtual-clock I/O constraints and estimated pin capacitances. No extracted wires, placement, setup/hold signoff, full PVT, DRC/LVS or measured silicon.'
};
for(const [key,bytes] of Object.entries(raw))record[key]=sha(bytes);
await writeFile(root+'phase14.json',JSON.stringify(record,null,2)+'\n');
process.stdout.write('PHASE14 ACTUAL OPENSTA '+timing.result+'; '+timing.pathCount+' paths; worst slack '+timing.worstSlackNs+' ns; physical evidence NONE\n');
