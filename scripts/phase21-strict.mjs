import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {DRC_BLOB,LVS_BLOB,FILES,parseDrcReport,parseLvsLog,evaluatePhase21} from '../js/evidence/phase21-open-drc-lvs.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const root='benchmarks/evidence/phase21/';
try{
 const r=JSON.parse(await readFile(root+'phase21.json','utf8'));
 const sha256={},fileSizes={};
 for(const [k,p] of Object.entries(FILES)){
  const bytes=await readFile(p);sha256[k]=sha(bytes);
  if(['gds','cdl','verilog','def','lvsDb','drcDb','drcDeck','lvsDeck'].includes(k))
   fileSizes[k]=bytes.length;
 }
 if(git('hash-object',FILES.drcDeck)!==DRC_BLOB||
    git('hash-object',FILES.lvsDeck)!==LVS_BLOB)
   throw Error('Experimental rule decks differ from pinned upstream commit');
 const actual={sourceCommit:git('rev-parse','HEAD'),
  imageDigest:(await readFile(FILES.imageDigestFile,'utf8')).trim(),
  sha256,fileSizes,
  drc:parseDrcReport(await readFile(FILES.drcDb,'utf8'),
    await readFile(FILES.drcCount,'utf8'),await readFile(FILES.drcLog,'utf8')),
  lvs:parseLvsLog(await readFile(FILES.lvsLog,'utf8'),
    await readFile(FILES.lvsDb,'utf8'))};
 const v=evaluatePhase21(r,actual);
 const summary={format:'invention-lab/phase21-independent-open-physical-audit/1',
   accepted:v.ok,sourceCommit:actual.sourceCommit,
   drc:actual.drc,lvs:actual.lvs,physicalModelVerdict:v.verdict,
   foundrySignoff:false,physicalValidation:'none',physicalVerdict:'unknown',
   realWorldBuildSuccessPercent:null,
   missing:['FEOL-DRC','foundry-qualified-deck','package','silicon-measurements','holdout-calibration'],
   errors:v.errors};
 await writeFile(root+'phase21-summary.json',JSON.stringify(summary,null,2)+'\n');
 if(!v.ok)throw Error(v.errors.join('; '));
 console.log('PH21 independent source-pinned native GDS KLayout DRC/LVS evidence PASS; physical UNKNOWN');
}catch(e){console.error('PH21 strict replay FAIL: '+e.message);process.exitCode=1;}
