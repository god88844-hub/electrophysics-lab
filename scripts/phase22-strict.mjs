import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {ROOT,DRC_BLOB,LIB_BLOB,FILES,exactFeolPatch,inspectDrc,classifyYosysProof,evaluatePhase22} from '../js/evidence/phase22-feol-final-gates.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
try{
 const record=JSON.parse(await readFile(ROOT+'phase22.json','utf8'));
 const hashes={};
 for(const [k,path] of Object.entries(FILES))hashes[k]=sha(await readFile(path));
 exactFeolPatch(await readFile(FILES.originalDeck,'utf8'),await readFile(FILES.feolDeck,'utf8'));
 if(git('hash-object',FILES.originalDeck)!==DRC_BLOB||
    git('hash-object',FILES.liberty)!==LIB_BLOB)
  throw Error('Original rule deck or authentic SkyWater Liberty model changed');
 const baseline=JSON.parse(await readFile(FILES.baselineReport,'utf8'));
 if(baseline.drc?.cleanOpenSubset!==true||baseline.lvs?.netlistsMatch!==true||
    baseline.sha256?.gds!==hashes.baselineGds||baseline.sha256?.verilog!==hashes.baselineNetlist)
  throw Error('Baseline KLayout GDS-vs-CDL or original design evidence altered');
 const actual={
  commitSha:git('rev-parse','HEAD'),imageDigest:(await readFile(FILES.digest,'utf8')).trim(),
  hashes,
  drc:inspectDrc(await readFile(FILES.feolReport,'utf8'),await readFile(FILES.feolLog,'utf8')),
  positiveVerdict:classifyYosysProof(await readFile(FILES.positiveLog,'utf8')),
  mutantVerdict:classifyYosysProof(await readFile(FILES.mutantLog,'utf8')),
  sameFinalLayoutAsPhase21:hashes.finalGds===hashes.baselineGds,
  sameFinalNetlistAsPhase21:hashes.finalNetlist===hashes.baselineNetlist
 };
 const result=evaluatePhase22(record,actual);
 const summary={format:'invention-lab/phase22-strict-feol-and-finalgate/1',
  accepted:result.ok,sourceCommit:actual.commitSha,
  positiveSat:actual.positiveVerdict,mutantSat:actual.mutantVerdict,
  openRuleSet:'experimental FEOL+BEOL+OFFGRID, not qualified',
  observedDrcMarkers:result.drcMarkers,openDrcClean:result.openDeckDrcClean,
  foundrySignoff:false,physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null,errors:result.errors
 };
 await writeFile(ROOT+'phase22-summary.json',JSON.stringify(summary,null,2)+'\n');
 if(!result.ok)throw Error(result.errors.join('; '));
 console.log('PH22 strict evidence replay PASS; open DRC marker count '+result.drcMarkers+'; physical UNKNOWN');
}catch(e){console.error('PH22 strict replay FAILED: '+e.message);process.exitCode=1}
