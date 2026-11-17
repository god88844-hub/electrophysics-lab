// Phase 15 capture: ONLY actual OpenSTA outputs, never predicted synthetic data.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {GRID,FORMAT,parsePhase15ToolLog} from '../js/evidence/phase15-sensitivity.js';
const root='benchmarks/evidence/phase15/';
const sources={
 rtl:'benchmarks/phase13/rtl/alu8.v',
 liberty:'benchmarks/evidence/phase14/source/sky130_fd_sc_hd__tt_025C_1v80.lib',
 netlist:'benchmarks/evidence/phase14/alu8-sky130-mapped.v',
 sdc:'benchmarks/phase14/alu8-tt.sdc',
 staTcl:'scripts/phase15-case.tcl'
};
const digest=x=>createHash('sha256').update(x).digest('hex');
const sourceHashes={};
for(const [id,path] of Object.entries(sources))
  sourceHashes[id]=digest(await readFile(path));
const libBlob=execFileSync('git',['hash-object',sources.liberty],{encoding:'utf8'}).trim();
if(libBlob!=='5773657fe730d984ac06726d0addfdad80395b9b')
  throw Error('Pinned real SKY130 TT Liberty Git blob mismatch');
const cases=[],logHashes=[];
for(const setting of GRID){
  const log=await readFile(root+'logs/case-'+setting.id+'.log');
  cases.push(parsePhase15ToolLog(log.toString('utf8'),setting));
  logHashes.push(digest(log));
}
const version=execFileSync('sta',['-version'],{encoding:'utf8'}).trim();
if(!/^\d+\.\d+(?:\.\d+)?$/.test(version))
  throw Error('Invalid executed OpenSTA version');
const commitSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/.test(commitSha))throw Error('Invalid actual checkout SHA');
const manifest=JSON.parse(await readFile('benchmarks/phase15/acceptance.json','utf8'));
if(JSON.stringify(manifest.grid)!==JSON.stringify(GRID))throw Error('Acceptance grid changed');
const record={
 format:FORMAT,design:'alu8',analysis:'pre-layout-TT-load-and-slew-model-sweep',
 corner:'tt_025C_1v80',toolVersion:'OpenSTA '+version,commitSha,
 libertyGitBlobSha1:libBlob,sourceHashes,logHashes,cases,
 observedModelWorstSlackNs:Math.min(...cases.map(c=>c.worstSlackNs)),
 physicalValidation:'none',physicalVerdict:'unknown',
 physicalQualified:false,realWorldBuildSuccessPercent:null,
 postLayout:false,processCornersTested:1,actualHardwareMeasurements:false,
 note:'All nine paths-only TT Liberty models are no extracted RC/DRC/LVS or physical experimental evidence. Input transition and pin load are user-prescribed bounded assumptions.'
};
await writeFile(root+'phase15.json',JSON.stringify(record,null,2)+'\n');
process.stdout.write('PHASE15 REAL OPENSTA: 9/9 TT sensitivity cases; worst reported modeled slack '+record.observedModelWorstSlackNs+' ns. REAL-WORLD BUILD PERCENT UNKNOWN.\n');
