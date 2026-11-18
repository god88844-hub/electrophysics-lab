import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {inspectOriginalCustomCellFiles,runMagicNetgenCandidate,evaluatePostLayoutSignoff}
 from '../js/evidence/phase77-magic-netgen.js';
test('lack of authentic MAG, extracted SPICE and PDK rule decks cannot fabricate GDS or DRC',async()=>{
 const r=await inspectOriginalCustomCellFiles({name:'q4_mux'});
 assert.equal(r.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(r.magicExecuted,false);
 const result=await runMagicNetgenCandidate({name:'q4_mux',magicExec:'/missing/magic',
  netgenExec:'/missing/netgen'});
 assert.equal(result.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(result.netgenExecuted,false);
 assert.equal(result.physicalQualification,'UNQUALIFIED_NO_GO');
});
test('source-file headers are inspected but a syntactically plausible mock cannot become signoff',async()=>{
 const root=await mkdtemp(join(tmpdir(),'stage-m-layout-fixture-'));
 try{
  const write=async(name,content)=>{const p=join(root,name);await writeFile(p,content);return p;};
  const magPath=await write('q4_mux.mag','magic\ntech sky130A\n<< metal1 >>\nrect 0 0 10 10\n<< end >>\n');
  const schematicPath=await write('q4_mux.spice',
   '.subckt q4_mux a b y vdd vss\nR1 y a 1k\n.ends q4_mux\n');
  const magicRcPath=await write('tech.tcl',
   'tech load sky130A\n# research fixture, not verified PDK rule deck\n');
  const netgenSetupPath=await write('setup.tcl',
   '# netgen lvs matching and model property declarations go here\n');
  const r=await inspectOriginalCustomCellFiles({name:'q4_mux',
   magPath,schematicPath,magicRcPath,netgenSetupPath});
  assert.equal(r.status,'SOURCE_FILES_PRESENT_NOT_AUTHENTICATED');
  assert.equal(r.drcStatus,'NOT_RUN');
  const no=await evaluatePostLayoutSignoff({drcReport:{independentlyVerified:true},
   lvsReport:{independentlyVerified:true},
   parasiticNetwork:{originalExtractedSpiceVerified:true},
   postlayoutNoiseMargin:{allIntermediateStatesSafe:true},
   independentRuledeckAudit:{authenticated:true}});
  assert.equal(no.status,'INSUFFICIENT_MODEL_DATA');
  assert.equal(no.physicalQualification,'UNQUALIFIED_NO_GO');
 }finally{await rm(root,{recursive:true,force:true});}
});
