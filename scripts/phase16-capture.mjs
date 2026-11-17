// Capture output only from genuine external OpenSTA processes and real PDK files.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {CORNERS,FORMAT,LIB_REPO,LIB_COMMIT,parseCornerLog,evaluatePhase16Evidence} from '../js/evidence/phase16-multicorner.js';
const dir='benchmarks/evidence/phase16/';
const sources={
 rtlSha256:'benchmarks/phase13/rtl/alu8.v',
 netlistSha256:'benchmarks/evidence/phase14/alu8-sky130-mapped.v',
 sdcSha256:'benchmarks/phase14/alu8-tt.sdc',
 staTclSha256:'scripts/phase16-corner.tcl'
};
const hash=x=>createHash('sha256').update(x).digest('hex');
const command=(bin,args)=>execFileSync(bin,args,{encoding:'utf8'}).trim();
const sourceHashes={};
for(const [key,file] of Object.entries(sources))sourceHashes[key]=hash(await readFile(file));
const libraries=[],results=[],logs=[];
for(const corner of CORNERS){
 const libPath=dir+'libs/sky130_fd_sc_hd__'+corner.corner+'.lib';
 const bytes=await readFile(libPath);
 const digest=hash(bytes),blob=command('git',['hash-object',libPath]);
 if(bytes.length!==corner.bytes||digest!==corner.sha256||blob!==corner.gitBlobSha1)
   throw Error('Wrong authentic source-locked SkyWater Liberty '+corner.id);
 libraries.push({id:corner.id,corner:corner.corner,sha256:digest,gitBlobSha1:blob,bytes:bytes.length});
 const log=await readFile(dir+'tool-logs/'+corner.id+'.log');
 logs.push(hash(log));
 results.push(parseCornerLog(log.toString('utf8'),corner));
}
const version=command('sta',['-version']);
if(!/^\d+\.\d+(?:\.\d+)?$/.test(version))throw Error('External STA version missing');
const record={
 format:FORMAT,design:'alu8',analysis:'pre-layout-combinational-three-corner-opensta-model',
 source:{repo:LIB_REPO,commit:LIB_COMMIT},commitSha:command('git',['rev-parse','HEAD']),
 openstaVersion:'OpenSTA '+version,sourceHashes,libraries,logs,results,
 worstModelSlackNs:Math.min(...results.map(x=>x.worstSlackNs)),
 processCornersTested:3,postLayout:false,extractedParasitics:false,
 siliconMeasurements:false,physicalValidation:'none',physicalVerdict:'unknown',
 physicalQualified:false,realWorldBuildSuccessPercent:null,
 note:'Genuine three PVT cell-Liberty model analyses, PRE-LAYOUT only. No physical DRC/LVS, extracted wires, placed chip, silicon measurement, production signoff or build success probability.'
};
const manifest=JSON.parse(await readFile('benchmarks/phase16/acceptance.json','utf8'));
const result=evaluatePhase16Evidence(manifest,record,{
 ...record,libraries,sourceHashes,logs,results
});
if(!result.ok)throw Error('Actual model capture does not meet frozen contract: '+result.errors.join('; '));
await writeFile(dir+'phase16.json',JSON.stringify(record,null,2)+'\n');
process.stdout.write('PHASE16 REAL OPENSTA: 3 authentic independent TT/SS/FF PVT libraries, 30 real constrained output timing paths, worst '+record.worstModelSlackNs+' ns. Physical verdict UNKNOWN.\n');
