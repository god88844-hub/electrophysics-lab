// Capture original executed external OpenROAD/OpenSTA PVT transcripts and source bytes.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {CORNERS,LIB_REPO,LIB_COMMIT,FORMAT,SOURCE_FILES,parseCorner,evaluatePhase20} from '../js/evidence/phase20-postroute-multicorner.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ROOT='benchmarks/evidence/phase20/';
const sha256={};
for(const [k,p] of Object.entries(SOURCE_FILES))sha256[k]=sha(await readFile(p));
const libraries=[],logs=[],results=[];
for(const c of CORNERS){
 const path=ROOT+'libs/sky130_fd_sc_hd__'+c.corner+'.lib',bytes=await readFile(path);
 const actual={...c,sha256:sha(bytes),gitBlobSha1:git('hash-object',path),bytes:bytes.length};
 if(actual.sha256!==c.sha256||actual.gitBlobSha1!==c.gitBlobSha1||actual.bytes!==c.bytes)
  throw Error('Wrong source-pinned actual SkyWater cell library '+c.id);
 libraries.push(actual);
 const raw=await readFile(ROOT+'tool-logs/'+c.id+'.log');
 logs.push(sha(raw));results.push(parseCorner(raw.toString('utf8'),c));
}
const phase19=JSON.parse(await readFile(SOURCE_FILES.phase19Summary,'utf8'));
if(phase19.accepted!==true||phase19.physicalVerdict!=='unknown')
 throw Error('Physical detailed-routing prerequisite was not strictly verified');
const record={
 format:FORMAT,method:'three-real-liberty-corners-one-routed-odb-one-extracted-spef',
 analysis:'postroute-pvt-single-fixed-rc-model',
 source:{repo:LIB_REPO,commit:LIB_COMMIT},
 commitSha:git('rev-parse','HEAD'),
 imageDigest:(await readFile('benchmarks/evidence/phase19/image-digest.txt','utf8')).trim(),
 sha256,libraries,logs,results,worstModelSlackNs:Math.min(...results.map(r=>r.worstSlackNs)),
 qualifiedSignoff:false,multipleRcCorners:false,foundryDrcPassed:false,lvsPassed:false,
 siliconMeasurements:false,physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null,
 note:'Actual post-route 3 SkyWater Liberty views, ONE TT extracted fixed wire SPEF. No independent DRC/LVS or measured silicon.'
};
const verdict=evaluatePhase20(record,record);
if(!verdict.ok)throw Error('Failed real extracted RC PVT evidence: '+verdict.errors.join('; '));
await writeFile(ROOT+'phase20.json',JSON.stringify(record,null,2)+'\n');
console.log('PH20 real postroute 30 modeled timing paths; worst '+record.worstModelSlackNs+' ns; silicon UNKNOWN');
