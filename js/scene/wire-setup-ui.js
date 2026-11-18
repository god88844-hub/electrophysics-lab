// Accessible material setup keyed by canonical wire IDs, not visual pixels.
import {evaluatePhysicalWire,setPhysicalWireAssumption,physicalWireAssumptions} from './physical-wire.js';
const field=(d,caption,type,value,attributes={})=>{
 const wrapper=d.createElement('label');wrapper.className='scene3d-wire-field';
 const title=d.createElement('span');title.textContent=caption;
 const input=d.createElement(type==='select'?'select':'input');
 if(type==='select'){
  for(const choice of value){const opt=d.createElement('option');opt.value=choice;opt.textContent=choice;input.append(opt);}
 }else{input.type='number';input.step='any';input.value=String(value);
  for(const [key,v] of Object.entries(attributes))input.setAttribute(key,String(v));}
 wrapper.append(title,input);return {wrapper,input};
};
export function attachPhysicalWireEditor(parent,controls,diagramAccessor,onChange,onError){
 const d=parent.ownerDocument,panel=d.createElement('section');
 panel.className='scene3d-wire-editor';panel.hidden=true;
 panel.setAttribute('aria-label','Physical wire material assumptions');
 const toggle=d.createElement('button');toggle.type='button';
 toggle.dataset.action='wire-physics';toggle.textContent='Wire physics';
 toggle.setAttribute('aria-expanded','false');
 const title=d.createElement('strong');title.textContent='Wire materials & dimensions';
 const description=d.createElement('p');
 description.textContent='User-entered physical units only. 3D canvas dimensions are NOT millimeters.';
 const select=d.createElement('select');select.setAttribute('aria-label','Canonical design wire');
 const mat=field(d,'Conductor','select',['copper','aluminum']);
 const length=field(d,'Actual conductor length (mm)','number',100,{min:.1,max:100000});
 const diameter=field(d,'Metal diameter (mm)','number',.5,{min:.05,max:20});
 const temperature=field(d,'Conductor temperature (°C)','number',20,{min:-40,max:150});
 const current=field(d,'Assumed wire current (A)','number',0,{min:0,max:100});
 const apply=d.createElement('button');apply.type='button';apply.dataset.action='apply-wire-physics';
 apply.textContent='Save wire assumptions';
 const out=d.createElement('output');out.className='scene3d-wire-result';
 out.setAttribute('aria-live','polite');
 const note=d.createElement('small');
 note.textContent='Nominal material equation rho(T)L/A. Contacts, skin effect, coupled heating and circuit solver integration are NOT included. Physical qualification: NONE.';
 panel.append(title,description,select,mat.wrapper,length.wrapper,diameter.wrapper,
  temperature.wrapper,current.wrapper,apply,out,note);
 parent.appendChild(panel);controls.append(toggle);
 function sync({keepSelection=true}={}){
  const diagram=diagramAccessor(),previous=keepSelection?select.value:null;
  select.replaceChildren();
  for(const wire of diagram?.wires||[]){
   const opt=d.createElement('option');opt.value=wire.id;
   opt.textContent=wire.from.block+'.'+wire.from.port+' → '+wire.to.block+'.'+wire.to.port;
   select.appendChild(opt);
  }
  if(previous&&[...select.options].some(o=>o.value===previous))select.value=previous;
  apply.disabled=!select.options.length;
  load();
 }
 function load(){
  const diagram=diagramAccessor(),id=select.value;
  const existing=diagram?.meta?.physicalLayout?.wires?.[id];
  if(existing){
   mat.input.value=existing.material;length.input.value=String(existing.lengthMm);
   diameter.input.value=String(existing.diameterMm);
   temperature.input.value=String(existing.temperatureC);
   current.input.value=String(existing.assumedCurrentA??0);
  }else{
   mat.input.value='copper';length.input.value='100';diameter.input.value='.5';
   temperature.input.value='20';current.input.value='0';
  }
  try{
   const result=physicalWireAssumptions(diagram);
   const found=result.wires.find(w=>w.id===id);
   out.textContent=found?'Saved nominal R = '+found.resistanceOhm.toPrecision(5)+' ohm; physical validation NONE'
    :'Not configured; no physical wire geometry inferred.';
  }catch(e){out.textContent='Invalid saved metadata: '+e.message;}
 }
 toggle.addEventListener('click',()=>{
  panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));
  if(!panel.hidden)sync();
 });
 select.addEventListener('change',load);
 apply.addEventListener('click',()=>{
  const diagram=diagramAccessor(),id=select.value;
  try{
   if(!diagram?.wires?.some(w=>w.id===id))throw Error('Select a valid circuit wire');
   const raw=[length.input.value,diameter.input.value,temperature.input.value,current.input.value];
   if(raw.some(v=>!v.trim()))throw Error('All physical assumptions must be entered explicitly');
   const spec={material:mat.input.value,lengthMm:Number(raw[0]),
    diameterMm:Number(raw[1]),temperatureC:Number(raw[2]),assumedCurrentA:Number(raw[3])};
   const value=evaluatePhysicalWire(spec); // preflight
   setPhysicalWireAssumption(diagram,id,spec);
   onChange();
   out.textContent='Nominal R = '+value.resistanceOhm.toPrecision(5)+' ohm; assumed drop = '+
    value.voltageDropV.toPrecision(5)+' V; assumed heating = '+
    value.dissipatedPowerW.toPrecision(5)+' W. MODEL ONLY.';
  }catch(e){out.textContent='Cannot save: '+String(e.message);onError(String(e.message));}
 });
 sync({keepSelection:false});
 return {panel,toggle,select,apply,result:out,sync};
}
