// Immutable replay gate for real Phase 13 SKY130 mapping evidence.
// Verifies actual archived source/library/log/netlist bytes, NOT just JSON.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluatePhase13Evidence} from '../js/evidence/physical-readiness.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const f=x=>path.join(root,x),h=x=>createHash('sha256').update(x).digest('hex');
const base='benchmarks/evidence/phase13/';
try{
 const manifest=JSON.parse(await readFile(f('benchmarks/phase13/acceptance.json'),'utf8'));
 const record=JSON.parse(await readFile(f(base+'phase13.json'),'utf8'));
 const paths={
  libertySha256:base+'source/sky130_fd_sc_hd__tt_025C_1v80.lib',
  rtlSha256:'benchmarks/phase13/rtl/alu8.v',
  specSha256:'benchmarks/phase13/rtl/alu8_spec.v',
  testbenchSha256:'benchmarks/phase13/rtl/alu8_tb.v',
  badSpecSha256:'benchmarks/phase13/rtl/alu8_bad_spec.v',
  exhaustiveLogSha256:base+'tool-logs/exhaustive.log',
  formalLogSha256:base+'tool-logs/formal.log',
  negativeControlLogSha256:base+'tool-logs/negative-control.log',
  mappingLogSha256:base+'tool-logs/mapping.log',
  netlistSha256:base+'alu8-sky130-mapped.v',
 };
 const actual={commitSha:process.env.GITHUB_SHA||null};
 for(const [key,filename] of Object.entries(paths)){
   const bytes=await readFile(f(filename));
   actual[key]=h(bytes);
 }
 const state=evaluatePhase13Evidence(manifest,record,actual);
 const lib=f(paths.libertySha256);
 const upstreamBlob=execFileSync('git',['hash-object',lib],{encoding:'utf8'}).trim();
 if(upstreamBlob!==record.libertyGitBlobSha1)
   state.errors.push('Archived actual Liberty Git blob mismatch');
 const netlist=(await readFile(f(paths.netlistSha256))).toString('utf8');
 const actualCells=[...netlist.matchAll(/\b(sky130_fd_sc_hd__[A-Za-z0-9_]+)\s+\\?[A-Za-z0-9_$]+\s*\(/g)].map(m=>m[1]);
 const names=[...new Set(actualCells)].sort();
 if(actualCells.length!==record.mapping?.mappedCells||
    JSON.stringify(names)!==JSON.stringify(record.mapping?.cellTypes))
   state.errors.push('Real mapped netlist cell counts/types are not the recorded standard cells');
 if(!(await readFile(f(paths.exhaustiveLogSha256),'utf8')).includes('PHASE13 EXHAUSTIVE RTL PASS 262144/262144'))
   state.errors.push('No genuine exhaustive vector evidence');
 const formal=await readFile(f(paths.formalLogSha256),'utf8');
 if(!formal.includes('equiv_status')&&!formal.includes('Equivalence'))
   state.errors.push('Missing formal equivalence log');
 const negative=await readFile(f(paths.negativeControlLogSha256),'utf8');
 if(!/unproven|unmatched|not proven/i.test(negative))
   state.errors.push('Negative-control formal rejection not documented');
 state.ok=state.ok&&state.errors.length===0;
 const summary={
  format:'invention-lab/phase13-summary/1',
  sourceCommit:process.env.GITHUB_SHA||null,
  computationalVerdict:state.ok?'pass':'fail',
  proofStagesPassed:state.ok?3:0,
  physicalVerdict:'unknown',physicalQualified:false,
  physicalValidation:'none',realWorldBuildSuccessPercent:null,
  mappedCells:record.mapping?.mappedCells??null,
  libertyGitBlobSha1:upstreamBlob,errors:state.errors,
  limits:'Technology-mapped 8-bit ALU, TT-only Liberty. No PVT/STA/DRC/LVS/placement/extraction/actual silicon.',
 };
 await mkdir(f(base),{recursive:true});
 await writeFile(f(base+'phase13-summary.json'),JSON.stringify(summary,null,2)+'\n');
 process.stdout.write('Phase 13 strict real SKY130 RTL-to-mapped ALU evidence: '+
   summary.computationalVerdict+' (3/3 computational stages, 0 physical signoffs)\n');
 for(const e of state.errors)process.stderr.write('FAIL '+e+'\n');
 if(!state.ok)process.exitCode=1;
}catch(error){
 process.stderr.write('Phase 13 independent hardware proof missing or invalid: '+error.message+'\n');
 process.exitCode=1;
}
