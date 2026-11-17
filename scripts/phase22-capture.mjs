import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {FORMAT,DRC_BLOB,LIB_BLOB,FILES,ROOT,exactFeolPatch,inspectDrc,classifyYosysProof,evaluatePhase22} from '../js/evidence/phase22-feol-final-gates.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const hashes={};
for(const [k,path] of Object.entries(FILES))hashes[k]=sha(await readFile(path));
exactFeolPatch(await readFile(FILES.originalDeck,'utf8'),await readFile(FILES.feolDeck,'utf8'));
if(git('hash-object',FILES.originalDeck)!==DRC_BLOB||git('hash-object',FILES.liberty)!==LIB_BLOB)
 throw Error('Upstream SKY130 PDK cell function or rule deck provenance changed');
const baseline=JSON.parse(await readFile(FILES.baselineReport,'utf8'));
if(baseline.physicalVerdict!=='unknown'||baseline.drc?.cleanOpenSubset!==true||
   baseline.lvs?.netlistsMatch!==true||baseline.sha256?.gds!==hashes.baselineGds||
   baseline.sha256?.verilog!==hashes.baselineNetlist)
 throw Error('Phase21 original GDS/Verilog did not pass audited baseline');
const actual={
 commitSha:git('rev-parse','HEAD'),imageDigest:(await readFile(FILES.digest,'utf8')).trim(),
 hashes,
 drc:inspectDrc(await readFile(FILES.feolReport,'utf8'),await readFile(FILES.feolLog,'utf8')),
 positiveVerdict:classifyYosysProof(await readFile(FILES.positiveLog,'utf8')),
 mutantVerdict:classifyYosysProof(await readFile(FILES.mutantLog,'utf8')),
 sameFinalLayoutAsPhase21:hashes.finalGds===hashes.baselineGds,
 sameFinalNetlistAsPhase21:hashes.finalNetlist===hashes.baselineNetlist
};
const record={
 format:FORMAT,method:'single-toggle-feol-open-deck-and-final-gds-netlist-sat',
 imageDigest:actual.imageDigest,commitSha:actual.commitSha,
 originalDeckBlob:DRC_BLOB,libertyBlob:LIB_BLOB,hashes,drc:actual.drc,
 positiveVerdict:actual.positiveVerdict,mutantVerdict:actual.mutantVerdict,
 foundrySignoff:false,measuredSilicon:false,qualifiedFoundryDrc:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
 note:'Open experimental FEOL+BEOL+OFFGRID source deck, not foundry rule signoff. Final GDS-flow gate Boolean equivalence only.'
};
const result=evaluatePhase22(record,actual);
if(!result.ok)throw Error('Phase22 evidence capture fail: '+result.errors.join('; '));
await writeFile(ROOT+'phase22.json',JSON.stringify(record,null,2)+'\n');
console.log('PH22 actual FEOL audit '+record.drc.markerCount+' DRC markers; GDS final gate Yosys SAT proof PASSED; mutant rejected; silicon UNKNOWN');
