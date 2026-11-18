// Physical anchors and harness editor. Every saved coordinate is explicitly
// user-entered in millimetres, never taken from the schematic 3D canvas.
import {portsOf} from '../core/block.js';
import {setPhysicalTerminal,setPhysicalHarness,inspectPhysicalHarnesses} from './physical-routing.js';
const field=(doc,title,value)=>{
 const label=doc.createElement('label');label.className='scene3d-wire-field';
 const caption=doc.createElement('span');caption.textContent=title;
 const input=doc.createElement('input');input.type='number';input.step='any';
 input.value=String(value);label.append(caption,input);return {label,input};
};
function selector(doc,label){
 const s=doc.createElement('select');s.setAttribute('aria-label',label);return s;
}
function option(doc,select,id,description){
 const o=doc.createElement('option');o.value=id;o.textContent=description;select.append(o);
}
export function attachPhysicalRoutingEditor(root,controls,diagramAccessor,onChange,onError){
 const doc=root.ownerDocument;
 const toggle=doc.createElement('button');toggle.type='button';
 toggle.textContent='Terminals & 3D harnesses';toggle.dataset.action='physical-routes';
 toggle.setAttribute('aria-expanded','false');
 const panel=doc.createElement('section');panel.className='scene3d-wire-editor';panel.hidden=true;
 panel.setAttribute('aria-label','Explicit millimetre terminal and conductor routing editor');
 const heading=doc.createElement('strong');heading.textContent='Real-size 3D terminals and wires';
 const note=doc.createElement('p');
 note.textContent='Enter terminal points on a component envelope face. Local X/Z are relative to its center; local Y starts at its bottom. Coordinates are examples until saved, not real-world measurements.';
 const blocks=selector(doc,'Physical terminal component');
 const ports=selector(doc,'Physical terminal canonical port');
 const coordinates=[field(doc,'Terminal local X (mm)',0),
  field(doc,'Terminal local Y (mm)',4),field(doc,'Terminal local Z (mm)',0)];
 const saveTerminal=doc.createElement('button');saveTerminal.type='button';
 saveTerminal.textContent='Save 3D terminal';saveTerminal.dataset.action='save-physical-terminal';
 const pinMessage=doc.createElement('output');pinMessage.setAttribute('aria-live','polite');
 const line=doc.createElement('strong');line.textContent='Explicit terminal-to-terminal conductor path';
 const caption=doc.createElement('p');
 caption.textContent='Wire physics must contain actual metal length and diameter, and both terminal points must be saved. Waypoints are GLOBAL mm positions between endpoints; [] means a straight physical segment. This is not an autorouter.';
 const wires=selector(doc,'Canonical wire for physical harness');
 const waypoints=doc.createElement('textarea');waypoints.rows=3;waypoints.value='[]';
 waypoints.setAttribute('aria-label','Global physical wire waypoint JSON (millimetres)');
 const saveHarness=doc.createElement('button');saveHarness.type='button';
 saveHarness.textContent='Save 3D harness';saveHarness.dataset.action='save-physical-harness';
 const routeMessage=doc.createElement('output');routeMessage.setAttribute('aria-live','polite');
 const status=doc.createElement('output');status.setAttribute('aria-live','polite');
 panel.append(heading,note,blocks,ports,...coordinates.map(x=>x.label),saveTerminal,
  pinMessage,line,caption,wires,waypoints,saveHarness,routeMessage,status);
 controls.append(toggle);root.append(panel);
 function showPort(){
  const diagram=diagramAccessor(),block=diagram?.blocks?.find(b=>b.id===blocks.value);
  const port=block?portsOf(block).find(p=>p.id===ports.value):null;
  const k=JSON.stringify([blocks.value,ports.value]);
  const saved=diagram?.meta?.physicalRouting?.terminals?.[k];
  const envelope=diagram?.meta?.dimensionedCAD?.parts?.[blocks.value];
  const suggested=saved||{
   xMm:(port?.dir==='in'?-1:1)*(envelope?.widthMm??20)/2,
   yMm:(envelope?.heightMm??8)/2,zMm:0};
  for(const [i,key] of ['xMm','yMm','zMm'].entries())
   coordinates[i].input.value=String(suggested[key]);
  pinMessage.textContent=saved?'Existing terminal; physical authenticity NOT verified.':
   'Example outer-face point only. Enter actual intended terminal position.';
 }
 function showRoute(){
  const saved=diagramAccessor()?.meta?.physicalRouting?.routes?.[wires.value];
  waypoints.value=JSON.stringify(saved?.waypointsMm??[],null,2);
  routeMessage.textContent=saved?'Existing user-defined route; check against current part positions.':
   'No physical 3D path stored for this wire.';
 }
 function showStatus(){
  try{
   const r=inspectPhysicalHarnesses(diagramAccessor());
   status.textContent=r.routes.length+' user-entered 3D routes; '+
    r.missingRoutes.length+' unrouted canonical wires; '+r.invalidIds.length+
    ' inconsistent routes. Geometry MODEL ONLY; physical validation NONE.';
  }catch(e){status.textContent='Invalid saved routing metadata: '+e.message;}
 }
 function syncPorts(){
  const diagram=diagramAccessor(),p=ports.value;ports.replaceChildren();
  const b=diagram?.blocks?.find(x=>x.id===blocks.value);
  for(const port of b?portsOf(b):[])option(doc,ports,port.id,port.id+' · '+port.dir);
  if([...ports.options].some(o=>o.value===p))ports.value=p;
  saveTerminal.disabled=!ports.options.length;
  showPort();
 }
 function sync(){
  const diagram=diagramAccessor();
  const prevBlock=blocks.value,prevWire=wires.value;
  blocks.replaceChildren();wires.replaceChildren();
  for(const b of diagram?.blocks||[])option(doc,blocks,b.id,b.id+' · '+b.type);
  for(const w of diagram?.wires||[])
   option(doc,wires,w.id,w.from.block+'.'+w.from.port+' → '+w.to.block+'.'+w.to.port);
  if([...blocks.options].some(o=>o.value===prevBlock))blocks.value=prevBlock;
  if([...wires.options].some(o=>o.value===prevWire))wires.value=prevWire;
  saveHarness.disabled=!wires.options.length;
  syncPorts();showRoute();showStatus();
 }
 toggle.addEventListener('click',()=>{
  panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));
  if(!panel.hidden)sync();
 });
 blocks.addEventListener('change',syncPorts);
 ports.addEventListener('change',showPort);
 wires.addEventListener('change',showRoute);
 saveTerminal.addEventListener('click',()=>{
  try{
   const raw=coordinates.map(x=>x.input.value);
   if(raw.some(x=>!x.trim()))throw Error('Enter three explicit physical coordinates');
   const coords={xMm:Number(raw[0]),yMm:Number(raw[1]),zMm:Number(raw[2])};
   setPhysicalTerminal(diagramAccessor(),blocks.value,ports.value,coords);
   onChange();
   pinMessage.textContent='Saved user-entered terminal coordinates. MODEL ONLY.';
   showStatus();
  }catch(e){pinMessage.textContent='Cannot save terminal: '+e.message;onError(e.message);}
 });
 saveHarness.addEventListener('click',()=>{
  try{
   const result=setPhysicalHarness(diagramAccessor(),wires.value,JSON.parse(waypoints.value));
   onChange();
   routeMessage.textContent='Route '+result.routedLengthMm.toPrecision(6)+
    ' mm, conductor '+result.enteredConductorLengthMm.toPrecision(6)+
    ' mm, unplaced slack '+result.excessLengthMm.toPrecision(6)+
    ' mm. Not a manufacturing-verified path.';
   showStatus();
  }catch(e){routeMessage.textContent='Cannot save route: '+e.message;onError(e.message);}
 });
 sync();
 return {panel,toggle,blocks,ports,coordinates,saveTerminal,pinMessage,
  wires,waypoints,saveHarness,routeMessage,status,sync};
}
