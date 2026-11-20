// Phase 84–88 interactive panel, explicitly controlled by a human.
// Tool calls are structured JSON only: there is no remote AI provider.
import {attachPanelClose} from '../ui/panel-close.mjs';
import {COINVENTOR_TOOLS,inspectCanonicalScene,planGoal,generateIdealAdderReference,
 proposeCoInventorEdits} from './stage-o-agent-tools.js';
import {generateTopologyCandidates,exploreTopologies}
 from './stage-o-topology-search.js';
import {makeStressSuite} from './stage-o-stress-diagnosis.js';
import {optimizeCandidatePopulation,syntheticOptimizationFixture}
 from './stage-o-yield-optimizer.js';
import {createInventionLedger,createInventionBranch,
 commitInventionRevision,compareInventionRevisions} from './stage-o-invention-ledger.js';
const make=(d,tag,label)=>{const e=d.createElement(tag);
 if(label)e.textContent=label;return e;};
export function attachStageOCoInventor(viewer,onDesignChange=()=>{}){
 const d=viewer.root.ownerDocument;
 const toggle=make(d,'button','AI Co-Inventor (Stage O)');toggle.type='button';
 toggle.dataset.action='stage-o-coinventor';toggle.setAttribute('aria-expanded','false');
 const panel=make(d,'section');panel.hidden=true;panel.className='scene3d-wire-editor';
 panel.setAttribute('aria-label','Structured Stage O AI co-inventor');
 const notice=make(d,'p','LOCAL STRUCTURED TOOLS ONLY — no cloud AI or authenticated silicon data. Any physical build-success percentage remains UNKNOWN.');
 const goal=make(d,'textarea');goal.rows=2;goal.placeholder='Design a low-power Q4 half-adder with >300 mV noise margin on SKY130';
 goal.setAttribute('aria-label','Co-inventor objective');
 const goalButton=make(d,'button','Analyze design objective');goalButton.type='button';
 const generate=make(d,'button','Generate ideal adder reference');generate.type='button';
 const inspect=make(d,'button','Inspect canonical scene');inspect.type='button';
 const json=make(d,'textarea');json.rows=5;
 json.placeholder='[{"name":"design.move_component","args":{"blockId":"example","x":1,"y":2}}]';
 json.setAttribute('aria-label','Structured co-inventor JSON tool actions');
 const propose=make(d,'button','Preview tool changes');propose.type='button';
 const approve=make(d,'button','Approve and apply preview');approve.type='button';approve.disabled=true;
 const search=make(d,'button','Generate topology candidates');search.type='button';
 const stress=make(d,'button','Plan adversarial stress suite');stress.type='button';
 const optimize=make(d,'button','Run synthetic-only optimizer');optimize.type='button';
 const ledgerSave=make(d,'button','Commit invention version');ledgerSave.type='button';
 const ledgerBranch=make(d,'button','Branch invention ledger');ledgerBranch.type='button';
 const output=make(d,'pre');output.setAttribute('role','status');output.style.whiteSpace='pre-wrap';
 output.style.maxHeight='18rem';output.style.overflow='auto';
 panel.append(make(d,'strong','Stage O — Co-invention research tools'),notice,
  goal,goalButton,generate,inspect,json,propose,approve,search,stress,optimize,
  ledgerSave,ledgerBranch,output);
 viewer.controls.append(toggle);viewer.root.append(panel);
 let proposal=null,ledger=createInventionLedger({name:'Local invention session'});
 let ledgerSnapshot=null,branch='main',branchCounter=0;
 function show(value){output.textContent=typeof value==='string'?value:
   JSON.stringify(value,null,2).slice(0,15000);}
 function diagram(){if(!viewer.diagram)throw Error('Load a canonical design first');
  return viewer.diagram;}
 function clearProposal(){proposal=null;approve.disabled=true;}
 toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;
  toggle.setAttribute('aria-expanded',String(!panel.hidden));});
 attachPanelClose({panel,toggle,label:'Close co-inventor panel'});
 goalButton.addEventListener('click',()=>{try{show(planGoal(goal.value));}
  catch(e){show('Objective refused: '+e.message);}});
 generate.addEventListener('click',()=>{try{show(generateIdealAdderReference(goal.value));}
  catch(e){show('Reference generation refused: '+e.message);}});
 inspect.addEventListener('click',()=>{try{show(inspectCanonicalScene(diagram(),
  {maxBlocks:100,maxWires:250}));}catch(e){show('Inspection refused: '+e.message);}});
 propose.addEventListener('click',()=>{
  try{
   const actions=JSON.parse(json.value);const initial=diagram();
   proposal={initial,initialJSON:JSON.stringify(initial.toJSON()),actions,
    result:proposeCoInventorEdits(initial,actions)};
   approve.disabled=false;show({status:proposal.result.status,changes:proposal.result.changes,
    note:'Apply requires this separate human approval click.'});
  }catch(e){clearProposal();show('Tool proposal refused: '+e.message);}
 });
 approve.addEventListener('click',()=>{
  try{
   if(!proposal||diagram()!==proposal.initial)throw Error('No current approved proposal');
   // Reject any unseen change since preview; do not rerun edits against a
   // diverged design. Diagram instances are kept to preserve app ownership.
   if(JSON.stringify(proposal.initial.toJSON())!==proposal.initialJSON &&
      proposal.initialJSON!==undefined)throw Error('Design changed since preview');
   const old=proposal.initial,next=proposal.result.diagram;
   old.blocks=next.blocks;old.wires=next.wires;old.meta=next.meta;
   clearProposal();onDesignChange();viewer.sync();viewer.requestRender();
   show({status:'CANONICAL_EDIT_APPLIED',physicalQualification:'UNKNOWN / NO-GO'});
  }catch(e){clearProposal();show('Commit refused: '+e.message);}
 });
 search.addEventListener('click',async()=>{
  try{
   const pool=generateTopologyCandidates({seed:85,count:8,radix:4,width:4});
   const result=await exploreTopologies({candidates:pool.candidates});
   show({status:result.status??'REFERENCE_ONLY',candidates:pool.candidates.length,
    functionalPruned:result.pruned,spiceEvaluated:result.spiceEvaluated,
    simulatedPhysicalBuildSuccessPercent:'UNKNOWN'});
  }catch(e){show('Topology exploration refused: '+e.message);}
 });
 stress.addEventListener('click',()=>{try{show(makeStressSuite({seed:86}));}
  catch(e){show('Stress planning refused: '+e.message);}});
 optimize.addEventListener('click',async()=>{
  try{
   const result=await optimizeCandidatePopulation({seed:87,generations:2,
    populationSize:6,evaluateCandidate:c=>syntheticOptimizationFixture(c)});
   show({status:'SYNTHETIC_ONLY',evaluated:result.evaluated,best:result.best,
    simulatedPhysicalBuildSuccessPercent:'UNKNOWN'});
  }catch(e){show('Optimizer refused: '+e.message);}
 });
 ledgerSave.addEventListener('click',async()=>{
  try{
   const commit=await commitInventionRevision(ledger,{
    branch,diagram:diagram(),actor:'human',
    message:'Local workbench model checkpoint'});
   const comparison=ledgerSnapshot?compareInventionRevisions(ledger,ledgerSnapshot,commit.id):null;
   ledgerSnapshot=commit.id;show({revision:commit.id,branch,comparison});
  }catch(e){show('Ledger commit refused: '+e.message);}
 });
 ledgerBranch.addEventListener('click',()=>{try{
  branch='idea-'+(++branchCounter);createInventionBranch(ledger,branch);
  show({status:'INVENTION_BRANCH_CREATED',branch,from:ledger.branches[branch]});
 }catch(e){show('Ledger branch refused: '+e.message);}});
 function update(){clearProposal();output.textContent='Ready. '+COINVENTOR_TOOLS.length+
  ' permitted tools; user-controlled edits only; physical evidence UNKNOWN.';}
 return {toggle,panel,goal,goalButton,generate,inspect,json,propose,approve,search,
  stress,optimize,ledgerSave,ledgerBranch,output,update,
  dispose(){panel.remove();toggle.remove();}};
}
