// Stage O / Phase 84 — bounded, deterministic co-inventor tool API.
// The tool protocol proposes edits to a cloned canonical Diagram. It NEVER
// executes model-generated code, contacts a remote LLM, or changes release gates.
import {Diagram} from '../core/diagram.js';
import '../labs/logic/components.js';
import {getComponent} from '../core/registry.js';
import {sceneFromDiagram} from './layout.js';
import {setCADEnvelope,dimensionedAssembly} from './dimensioned-cad.js';
import {inspectPhysicalHarnesses} from './physical-routing.js';
export const COINVENTOR_FORMAT='invention-lab/phase84-structured-coinventor/1';
export const COINVENTOR_TOOLS=Object.freeze([
 Object.freeze({name:'scene.inspect',permission:'read',description:'Inspect the canonical active scene graph'}),
 Object.freeze({name:'design.add_component',permission:'edit',description:'Add a registered component on a cloned design'}),
 Object.freeze({name:'design.set_parameter',permission:'edit',description:'Edit a declared component parameter'}),
 Object.freeze({name:'design.move_component',permission:'edit',description:'Move a registered component in the schematic'}),
 Object.freeze({name:'design.set_mm_envelope',permission:'edit',description:'Edit explicit dimensioned CAD geometry'}),
 Object.freeze({name:'design.connect',permission:'edit',description:'Wire compatible declared ports'}),
 Object.freeze({name:'design.disconnect',permission:'edit',description:'Disconnect an existing canonical wire'}),
 Object.freeze({name:'simulation.run',permission:'simulate',description:'Run the existing canonical solver using an injected adapter'}),
 Object.freeze({name:'goal.plan',permission:'read',description:'Parse bounded goal intent and physical evidence requirements'}),
 Object.freeze({name:'goal.generate_reference',permission:'read',description:'Generate a deterministic ideal multi-radix adder reference circuit'})
]);
const ACTIONS=new Set(COINVENTOR_TOOLS.map(x=>x.name));
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.length>0&&x.length<=120;
const number=x=>typeof x==='number'&&Number.isFinite(x);
function field(args,name){const x=args?.[name];if(!text(x))throw Error('Invalid '+name);return x;}
function boundedParams(def,params){
 if(!object(params))throw Error('Component parameters must be a plain object');
 const allowed=new Set((def.params||[]).map(p=>p.key));
 if(Object.keys(params).length>32)throw Error('Too many component parameters');
 for(const [name,value] of Object.entries(params)){
  if(!allowed.has(name))throw Error('Undeclared component parameter '+name);
  if(!((number(value)&&Math.abs(value)<=1e12)||(typeof value==='boolean')||
    (typeof value==='string'&&value.length<=120)))
   throw Error('Unbounded or unsupported component parameter '+name);
 }
}
function validateDesign(diagram){
 if(!diagram||typeof diagram.toJSON!=='function')throw Error('Canonical Diagram required');
 if(diagram.blocks.length>10000||diagram.wires.length>30000)
  throw Error('AI tool budget exceeded');
 if(diagram.issues().length)throw Error('Canonical component/wiring validation failed: '+diagram.issues()[0]);
 return diagram;
}
function clone(diagram){return Diagram.fromJSON(structuredClone(validateDesign(diagram).toJSON()));}
function knownBlock(diagram,id){
 const b=diagram.block(id);if(!b)throw Error('Unknown canonical component '+id);return b;
}
function performEdit(diagram,name,args={}){
 if(!object(args))throw Error('Structured action arguments must be a JSON object');
 if(name==='design.add_component'){
  const type=field(args,'type'),def=getComponent(type);
  if(!def)throw Error('Unregistered component '+type);
  boundedParams(def,args.params||{});
  const x=args.x??0,y=args.y??0;
  if(!number(x)||!number(y)||Math.abs(x)>10000||Math.abs(y)>10000)
   throw Error('Component coordinates outside edit budget');
  const id=args.id??diagram.nextBlockId(type);
  if(!text(id)||!/^[a-zA-Z0-9_-]+$/.test(id)||diagram.block(id))
   throw Error('Invalid or duplicate component id');
  diagram.addBlock(type,{id,x,y,params:args.params||{}});
  return {componentId:id};
 }
 if(name==='design.set_parameter'){
  const b=knownBlock(diagram,field(args,'blockId')),param=field(args,'parameter');
  const def=getComponent(b.type);
  boundedParams(def,{[param]:args.value});
  b.params[param]=args.value;
  return {componentId:b.id,parameter:param};
 }
 if(name==='design.move_component'){
  const b=knownBlock(diagram,field(args,'blockId'));
  if(!number(args.x)||!number(args.y)||Math.abs(args.x)>10000||Math.abs(args.y)>10000)
   throw Error('Component move outside budget');
  b.x=args.x;b.y=args.y;return {componentId:b.id};
 }
 if(name==='design.set_mm_envelope'){
  const id=field(args,'blockId');knownBlock(diagram,id);
  if(!object(args.envelope))throw Error('Explicit CAD envelope required');
  const keys=['xMm','yMm','zMm','widthMm','heightMm','depthMm'];
  if(Object.keys(args.envelope).some(k=>!keys.includes(k))||keys.some(k=>!number(args.envelope[k])))
   throw Error('Invalid mm envelope fields');
  setCADEnvelope(diagram,id,args.envelope);
  const assembly=dimensionedAssembly(diagram);
  if(assembly.overlaps.some(pair=>Array.isArray(pair)&&pair.includes(id)))
   throw Error('Rejected mm component collision');
  const harness=inspectPhysicalHarnesses(diagram);
  if(harness.invalidIds?.length)
   throw Error('3D harness violated by proposed geometry');
  return {componentId:id,geometry:'user-entered-model-only'};
 }
 if(name==='design.connect'){
  const from=field(args,'fromBlock'),to=field(args,'toBlock');
  const fromPort=field(args,'fromPort'),toPort=field(args,'toPort');
  if(diagram.wires.length>=30000)throw Error('Canonical wire budget exceeded');
  const result=diagram.connect(from,fromPort,to,toPort);
  if(!result)throw Error('Duplicate canonical connection');
  // Diagram.connect() normally uses a clock-derived ID. Replace it immediately
  // with a stable per-plan ID to permit deterministic replay across machines.
  let i=diagram.wires.length;
  while(diagram.wires.some(w=>w!==result&&w.id==='aiwire-'+i))i++;
  result.id='aiwire-'+i;
  return {wireId:result.id};
 }
 if(name==='design.disconnect'){
  const id=field(args,'wireId');
  if(!diagram.disconnect(id))throw Error('Unknown wire '+id);
  return {wireId:id};
 }
 throw Error('Unrecognized or non-mutating tool: '+name);
}
export function inspectCanonicalScene(diagram,{maxBlocks=500,maxWires=1000}={}){
 validateDesign(diagram);
 if(!Number.isInteger(maxBlocks)||maxBlocks<0||maxBlocks>1000||
    !Number.isInteger(maxWires)||maxWires<0||maxWires>3000)
  throw Error('Scene inspection budget invalid');
 const scene=sceneFromDiagram(diagram);
 const data=structuredClone(diagram.toJSON());
 return {format:COINVENTOR_FORMAT,lab:diagram.lab,designId:diagram.id,
  blocks:data.blocks.slice(0,maxBlocks),wires:data.wires.slice(0,maxWires),
  sceneBounds:{visibleBlocks:Math.min(scene.blocks.length,maxBlocks),
    wireSegments:Math.min(scene.wires.length,maxWires)},
  truncated:diagram.blocks.length>maxBlocks||diagram.wires.length>maxWires,
  physicalQualification:'UNKNOWN / NO-GO'};
}
export function planGoal(prompt){
 if(typeof prompt!=='string'||prompt.length>500||!prompt.trim())
  throw Error('Non-empty bounded goal prompt required');
 const q4=/\b(quaternary|q4|base[- ]?4)\b/i.test(prompt);
 const sky130=/\bsky130\b/i.test(prompt),adder=/\b(half[- ]?adder|full[- ]?adder)\b/i.test(prompt);
 const threshold=/>\s*(\d+(?:\.\d+)?)\s*(mV|V)\b/i.exec(prompt);
 const minMarginV=threshold?Number(threshold[1])*(threshold[2].toLowerCase()==='mv'?.001:1):null;
 const target={radix:q4?4:/\bternary\b/i.test(prompt)?3:2,
  topology:adder?'adder':'unspecified',pdk:sky130?'SKY130':'unspecified',
  minimumNoiseMarginV:minMarginV};
 if(minMarginV!==null&&(!Number.isFinite(minMarginV)||minMarginV<0||minMarginV>10))
  throw Error('Out-of-range margin request');
 const blockers=[];
 if(target.radix===4&&sky130)
  blockers.push('SKY130 1.8V library devices do not verify 3.3V Q4 rails');
 blockers.push('no authenticated transistor-level model and statistical silicon calibration');
 return {format:COINVENTOR_FORMAT,kind:'GOAL_PLAN',target,
  proposedToolCalls:[],status:'EVIDENCE_REQUIRED',blockers,
  generatedCircuit:false,physicalQualification:'UNKNOWN / NO-GO'};
}
// Generate an honest *functional* half-adder diagram using the existing
// canonical multi-radix ADDN gate. This is NOT a transistor implementation.
export function generateIdealAdderReference(prompt){
 const goal=planGoal(prompt);
 if(goal.target.topology!=='adder')
  throw Error('Goal is not a supported half/full adder reference');
 const radix=goal.target.radix;
 const diagram=new Diagram({id:'ai-reference-r'+radix+'-adder',
  name:'Ideal radix-'+radix+' adder reference',
  lab:'logic',meta:{radix,generatedBy:'stage-o-ideal-reference',
   physicalImplementation:'NOT_VERIFIED'}});
 const positions=[
  ['inputA','logic.IN',{value:0,name:'A'},20,20],
  ['inputB','logic.IN',{value:0,name:'B'},20,100],
  ['carryIn','logic.CONST',{value:0},20,180],
  ['adder','logic.ADDN',{},240,100],
  ['sumProbe','logic.PROBE',{name:'SUM'},460,65],
  ['carryProbe','logic.PROBE',{name:'CARRY'},460,160]
 ];
 for(const [id,type,params,x,y] of positions){
  if(!getComponent(type))throw Error('Missing canonical logic lab component '+type);
  diagram.addBlock(type,{id,params,x,y});
 }
 const edges=[
  ['inputA','out','adder','a'],['inputB','out','adder','b'],
  ['carryIn','out','adder','cin'],['adder','sum','sumProbe','in'],
  ['adder','cout','carryProbe','in']
 ];
 for(let i=0;i<edges.length;i++){
  const w=diagram.connect(...edges[i]);if(!w)throw Error('Duplicate adder wiring');
  w.id='ai-ref-wire-'+i;
 }
 validateDesign(diagram);
 return {format:COINVENTOR_FORMAT,status:'IDEAL_LOGIC_REFERENCE_GENERATED',
  target:goal.target,diagram:diagram.toJSON(),
  geometry:'schematic-2d-only',transistorCount:'UNKNOWN',
  noiseMarginV:'UNKNOWN',spiceCalibrated:false,
  physicalQualification:'UNKNOWN / NO-GO',
  blockers:goal.blockers};
}
export function proposeCoInventorEdits(diagram,actions){
 if(!Array.isArray(actions)||actions.length===0||actions.length>60)
  throw Error('Expected 1–60 structured tool actions');
 const draft=clone(diagram),changes=[];
 for(const action of actions){
  if(!object(action)||!ACTIONS.has(action.name)||
    !action.name.startsWith('design.'))
   throw Error('Only approved design editing tools may appear in a candidate plan');
  const result=performEdit(draft,action.name,action.args);
  changes.push({name:action.name,...result});
  validateDesign(draft);
 }
 return {format:COINVENTOR_FORMAT,status:'PROPOSED_NOT_COMMITTED',
  changes,diagram:draft,preview:structuredClone(draft.toJSON()),
  requiresHumanApproval:true,productionReleaseAuthorized:false};
}
export function commitApprovedCoInventorPlan({getDiagram,setDiagram,actions,approved=false}={}){
 if(approved!==true)throw Error('Explicit human approval required');
 if(typeof getDiagram!=='function'||typeof setDiagram!=='function')
  throw Error('Canonical diagram read/write adapters required');
 const before=getDiagram(),proposal=proposeCoInventorEdits(before,actions);
 if(getDiagram()!==before)throw Error('Design changed during proposal');
 setDiagram(proposal.diagram);
 return {status:'COMMITTED_CANONICAL_EDIT',changes:proposal.changes,
  physicalQualification:'UNKNOWN / NO-GO'};
}
export async function invokeCoInventorTool({diagram,name,args={},simulate=null}={}){
 if(!ACTIONS.has(name))throw Error('Unrecognized AI tool');
 if(name==='scene.inspect')return inspectCanonicalScene(diagram,args);
 if(name==='goal.plan')return planGoal(args.prompt);
 if(name==='goal.generate_reference')return generateIdealAdderReference(args.prompt);
 if(name==='simulation.run'){
  if(typeof simulate!=='function')return {format:COINVENTOR_FORMAT,status:'SOLVER_UNAVAILABLE',physicalQualification:'UNKNOWN / NO-GO'};
  const result=await simulate(clone(diagram));
  if(!object(result))throw Error('Canonical solver returned malformed result');
  return {format:COINVENTOR_FORMAT,status:'SOLVER_SNAPSHOT',result,
   physicalQualification:'UNKNOWN / NO-GO'};
 }
 return proposeCoInventorEdits(diagram,[{name,args}]);
}
