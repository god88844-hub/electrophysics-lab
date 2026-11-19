// Stage P — in-app virtual systems panel and visual 3D proxy placement.
// Users supply explicit ISA/ONNX data; outputs are model/reference only.
import {attachPanelClose} from '../ui/panel-close.mjs';
import {createCustomISA,assembleCustom,compileStructuredWorkload,
 compileTinyCLike,runCustomCPU} from './stage-p-custom-isa.js';
import {createCustomAccelerator,executeOnnxAccelerator}
 from './stage-p-accelerator.js';
import {createVirtualComputer,bootVirtualComputer,createForthMonitor}
 from './stage-p-virtual-computer.js';
import {createHybridArchitecture,runHybridBellFeedback,
 runVariationalHybridReference} from './stage-p-hybrid-qpu.js';
const make=(d,tag,label)=>{const x=d.createElement(tag);
 if(label)x.textContent=label;return x;};
const createSelect=(d,options,label)=>{
 const el=make(d,'select');el.setAttribute('aria-label',label);
 for(const [id,text] of options){const o=make(d,'option',text);o.value=id;el.append(o);}
 return el;
};
export function attachStagePSystems(viewer){
 const d=viewer.root.ownerDocument;
 const toggle=make(d,'button','Virtual Computing Systems (Stage P)');
 toggle.type='button';toggle.dataset.action='stage-p-virtual-computers';
 toggle.setAttribute('aria-expanded','false');
 const panel=make(d,'section');panel.hidden=true;panel.className='scene3d-wire-editor';
 panel.setAttribute('aria-label','Stage P multi-radix CPU TPU classical quantum lab');
 const note=make(d,'p','Local architecture/logic simulations only. No silicon qualification, real HBM energy, live QPU or Linux kernel boot.');
 const mode=createSelect(d,[['q4','16-quat / 32-bit hybrid CPU'],['binary','32-bit binary CPU'],
  ['ternary','16-trit CPU']],'Custom CPU register architecture');
 const isaJson=make(d,'textarea');isaJson.rows=3;
 isaJson.setAttribute('aria-label','Optional declarative custom CPU ISA JSON');
 isaJson.placeholder='{"name":"MyCPU","banks":[{"name":"Q","radix":4,"digits":16,"count":8}],"memoryWords":256,"clockHz":1000000}';
 const code=make(d,'textarea');code.rows=4;
 code.setAttribute('aria-label','Custom CPU assembly or restricted C-like source');
 code.value='LDI Q0, 8\nLDI Q1, 5\nADD Q0, Q1\nOUT Q0\nHALT';
 const language=createSelect(d,[['assembly','Assembly'],['tiny-c','Restricted C-like']],
  'Virtual CPU compiler input language');
 const compile=make(d,'button','Assemble and execute custom CPU');compile.type='button';
 compile.dataset.action='stage-p-run-custom-cpu';
 const sort=make(d,'button','Compile and run Q4 sorting workload');sort.type='button';
 sort.dataset.action='stage-p-sort';
 const onnx=make(d,'textarea');onnx.rows=4;
 onnx.setAttribute('aria-label','Phase 9 bounded ONNX JSON intermediate representation');
 onnx.placeholder='Paste a Phase 9 ONNX subset graph (opset 13, 2D float32 IR)';
 const acceleratorRows=make(d,'input');acceleratorRows.type='number';acceleratorRows.value='4';
 acceleratorRows.min='1';acceleratorRows.max='32';
 acceleratorRows.setAttribute('aria-label','TPU PE rows');
 const acceleratorCols=make(d,'input');acceleratorCols.type='number';acceleratorCols.value='4';
 acceleratorCols.min='1';acceleratorCols.max='32';
 acceleratorCols.setAttribute('aria-label','TPU PE columns');
 const energyPJ=make(d,'input');energyPJ.type='number';energyPJ.step='any';
 energyPJ.placeholder='Optional estimated pJ per MAC';
 energyPJ.setAttribute('aria-label','Assumed MAC energy in picojoules');
 const accelerator=make(d,'button','Run ONNX model on modeled TPU');accelerator.type='button';
 accelerator.dataset.action='stage-p-run-onnx';
 const boot=make(d,'button','Boot virtual Q4 computer ROM');boot.type='button';
 boot.dataset.action='stage-p-boot';
 const forth=make(d,'input');forth.value='7 8 * .';
 forth.setAttribute('aria-label','Interactive sandbox Forth command');
 const forthRun=make(d,'button','Execute Forth command');forthRun.type='button';
 const quantum=make(d,'button','Run classical / quantum syndrome feedback');
 quantum.type='button';quantum.dataset.action='stage-p-quantum-feedback';
 const result=make(d,'pre');result.setAttribute('role','status');result.style.whiteSpace='pre-wrap';
 result.style.maxHeight='18rem';result.style.overflow='auto';
 panel.append(make(d,'strong','Stage P — Custom computers and accelerators'),note,
  mode,isaJson,language,code,compile,sort,onnx,acceleratorRows,acceleratorCols,
  energyPJ,accelerator,boot,forth,forthRun,quantum,result);
 viewer.root.append(panel);viewer.controls.append(toggle);
 let viewBlocks=[],forthShell=null;
 function show(x){result.textContent=typeof x==='string'?x:JSON.stringify(x,null,2).slice(0,18000);}
 function activeISA(){
  if(isaJson.value.trim())return createCustomISA(JSON.parse(isaJson.value));
  if(mode.value==='binary')return createCustomISA({name:'BinaryCPU',
   banks:[{name:'B',radix:2,digits:32,count:8}]});
  if(mode.value==='ternary')return createCustomISA({name:'TernaryCPU',
   banks:[{name:'T',radix:3,digits:16,count:8}]});
  return createCustomISA();
 }
 function setBlocks(items){
  viewBlocks=items.map(x=>{
   const p=x.poseMm??x;
   const size=x.sizeMm??{width:3,height:2,depth:2};
   return {id:x.id,kind:x.kind,
    x:p.x??p.xMm??0,y:p.y??p.yMm??0,z:p.z??p.zMm??0,
    w:size.width??3,h:size.height??2,d:size.depth??2,
    color:x.kind==='mac-pe'?[.2,.55,.88]:
     x.kind?.includes('qubit')?[.72,.35,.85]:[.45,.73,.56]};
  });
  viewer.requestRender();
 }
 toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;
  toggle.setAttribute('aria-expanded',String(!panel.hidden));viewer.requestRender();});
 attachPanelClose({panel,toggle,label:'Close virtual systems panel'});
 mode.addEventListener('change',()=>{
  isaJson.value='';
  const r=activeISA().registers;
  const x=r[0].id,y=r[1].id;
  code.value='LDI '+x+', 8\nLDI '+y+', 5\nADD '+x+', '+y+'\nOUT '+x+'\nHALT';
 });
 compile.addEventListener('click',()=>{
  try{
   const isa=activeISA(),compiled=language.value==='assembly'?
    assembleCustom(isa,code.value):compileTinyCLike(isa,code.value);
   const cpu=runCustomCPU(isa,compiled);
   if(!cpu.halted)throw Error('CPU did not halt in bounded virtual time');
   show({architecture:isa.name,bytecodeBytes:compiled.bytes.length,output:cpu.outputs,
    cycles:cpu.cycles,registers:cpu.registers,physicalValidation:'none'});
   setBlocks(createVirtualComputer({isa}).nodes);
  }catch(e){show('Custom CPU refused: '+e.message);}
 });
 sort.addEventListener('click',()=>{
  try{
   const isa=activeISA(),compiled=compileStructuredWorkload(isa,
    {kind:'sort',values:[9,3,7,1,4]});
   const cpu=runCustomCPU(isa,compiled.bytecode);
   show({kind:'compiled-sort',halted:cpu.halted,output:cpu.outputs,
    cycles:cpu.cycles,physicalValidation:'none'});
   setBlocks(createVirtualComputer({isa}).nodes);
  }catch(e){show('Sort refused: '+e.message);}
 });
 accelerator.addEventListener('click',()=>{
  try{
   const graph=JSON.parse(onnx.value);
   const config=createCustomAccelerator({
    rows:Number(acceleratorRows.value),cols:Number(acceleratorCols.value),
    macEnergyPJ:energyPJ.value.trim()?Number(energyPJ.value):null});
   const run=executeOnnxAccelerator(config,graph);
   show({referenceOutputs:run.reference.outputs,cycles:run.totalCycles,
    assumedEnergyJ:run.assumedEnergyJ,
    acceleratorExecutionVerified:run.acceleratorExecutionVerified,
    realWorldTOPS:run.realWorldTOPS,physicalValidation:'none'});
   setBlocks(config.blocks);
  }catch(e){show('ONNX reference refused: '+e.message);}
 });
 boot.addEventListener('click',()=>{
  try{
   const isa=activeISA(),first=isa.registers[0].id;
   const board=createVirtualComputer({isa,
    romSource:'LDI '+first+', 65\nOUT '+first+'\nHALT'});
   const booted=bootVirtualComputer(board);
   show({status:booted.status,uart:booted.uart,
    displayText:booted.displayText,linuxBooted:false});
   forthShell=createForthMonitor(board);
   setBlocks(board.nodes);
  }catch(e){show('Virtual boot refused: '+e.message);}
 });
 forthRun.addEventListener('click',()=>{
  try{
   if(!forthShell)forthShell=createForthMonitor(createVirtualComputer({isa:activeISA()}));
   show(forthShell.run(forth.value));
  }catch(e){show('Forth command refused: '+e.message);}
 });
 quantum.addEventListener('click',()=>{
  try{
   const config=createHybridArchitecture({isa:activeISA()});
   const replay=runHybridBellFeedback(config,{seed:92,injectBitFlip:true});
   const variational=runVariationalHybridReference(config);
   show({feedback:replay.status,syndrome:replay.syndrome,
    correction:replay.action,cycles:replay.latencyCycles,
    variationalMinimumZ:variational.best.zExpectation,
    hardwareFidelityVerified:false,physicalValidation:'none'});
   setBlocks(config.blocks);
  }catch(e){show('Hybrid feedback refused: '+e.message);}
 });
 function draw3D(){
  if(panel.hidden||!viewBlocks.length||!viewer.instancedProxy?.supported)return;
  try{viewer.instancedProxy.draw(viewBlocks,viewer.camera().matrix);}
  catch(e){result.textContent='3D model unavailable: '+e.message;}
 }
 function update(){result.textContent='Ready: select a bounded workload to simulate.';}
 return {toggle,panel,mode,isaJson,code,language,compile,sort,onnx,
  acceleratorRows,acceleratorCols,energyPJ,accelerator,
  boot,forth,forthRun,quantum,result,draw3D,update,
  dispose(){panel.remove();toggle.remove();}};
}
