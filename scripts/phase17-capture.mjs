// Captures only executed external Yosys SAT proof transcripts + source digests.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {FILES,FORMAT,LIB_BLOB,classifyYosysProof,evaluatePhase17} from '../js/evidence/phase17-gate-equivalence.js';
const ROOT='benchmarks/evidence/phase17/',sha=x=>createHash('sha256').update(x).digest('hex');
const cmd=(p,args)=>execFileSync(p,args,{encoding:'utf8'}).trim();
const hashes={};
for(const [k,p] of Object.entries(FILES))hashes[k]=sha(await readFile(p));
for(const kind of ['positive','mutant'])hashes[kind+'Log']=sha(await readFile(ROOT+'tool-logs/'+kind+'.log'));
const log1=await readFile(ROOT+'tool-logs/positive.log','utf8');
const log2=await readFile(ROOT+'tool-logs/mutant.log','utf8');
const record={
 format:FORMAT,design:'alu8',
 method:'sat-gate-netlist-vs-independent-spec-with-liberty-function-import',
 libertyGitBlobSha1:cmd('git',['hash-object',FILES.cellLiberty]),
 commitSha:cmd('git',['rev-parse','HEAD']),yosysVersion:cmd('yosys',['-V']),
 hashes,positiveVerdict:classifyYosysProof(log1),mutantVerdict:classifyYosysProof(log2),
 physicalValidation:'none',physicalVerdict:'unknown',physicalQualified:false,
 postLayout:false,siliconMeasurements:false,realWorldBuildSuccessPercent:null,
 note:'Yosys SAT proof for mapped SKY130 standard-cell Boolean functions only. No physical timing/fabrication inference.'
};
const manifest=JSON.parse(await readFile('benchmarks/phase17/acceptance.json','utf8'));
const result=evaluatePhase17(manifest,record,{...record,
 mappedCellTypesPresent:(await readFile(FILES.mappedNetlist,'utf8')).includes('sky130_fd_sc_hd__')
});
if(!result.ok)throw Error('Real formal proof not accepted: '+result.errors.join('; '));
await writeFile(ROOT+'phase17.json',JSON.stringify(record,null,2)+'\n');
process.stdout.write('PHASE17 genuine mapped-gate Yosys SAT pass; mutant rejected; physical UNKNOWN\n');
