import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {FORMAT,IMAGE_DIGEST,DRC_BLOB,LVS_BLOB,DECK_COMMIT,FILES,parseDrcReport,parseLvsLog,evaluatePhase21} from '../js/evidence/phase21-open-drc-lvs.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const root='benchmarks/evidence/phase21/';
const sha256={},fileSizes={};
for(const [k,p] of Object.entries(FILES)){
 const bytes=await readFile(p);
 sha256[k]=sha(bytes);
 if(['gds','cdl','verilog','def','lvsDb','drcDb','drcDeck','lvsDeck'].includes(k))
  fileSizes[k]=bytes.length;
}
const drc=parseDrcReport(await readFile(FILES.drcDb,'utf8'),
 await readFile(FILES.drcCount,'utf8'),await readFile(FILES.drcLog,'utf8'));
const lvs=parseLvsLog(await readFile(FILES.lvsLog,'utf8'),await readFile(FILES.lvsDb,'utf8'));
const record={
 format:FORMAT,method:'klayout-gds-open-beol-offgrid-drc-and-cdl-lvs',
 sourceCommit:git('rev-parse','HEAD'),
 imageDigest:(await readFile(FILES.imageDigestFile,'utf8')).trim(),
 drcDeckGitBlob:git('hash-object',FILES.drcDeck),
 lvsDeckGitBlob:git('hash-object',FILES.lvsDeck),
 ruleDeckCommit:DECK_COMMIT,sha256,fileSizes,drc,lvs,
 fullFoundryDrc:false,foundryQualifiedLvs:false,measuredSilicon:false,foundrySignoff:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
 note:'Actual experimental KLayout open BEOL+OFFGRID DRC subset and standard-cell CDL LVS; FEOL DRC DISABLED. Not signoff or fabricated silicon.'
};
const verdict=evaluatePhase21(record,record);
await writeFile(root+'phase21.json',JSON.stringify(record,null,2)+'\n');
if(!verdict.ok)throw Error('Actual KLayout open geometry check rejected: '+verdict.errors.join('; '));
console.log('PH21 actual GDS KLayout DRC subset zero markers and CDL LVS match; not foundry qualified.');
