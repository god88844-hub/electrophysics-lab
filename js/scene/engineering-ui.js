import {setCADEnvelope,dimensionedAssembly} from './dimensioned-cad.js';
import {simulateWireThermal} from './wire-electrothermal.js';
import {solveCoupledWireDC} from './coupled-wire-dc.js';
import {compareWireMeasurements,fitWireResistanceScale} from './wire-measurement-check.js';
function numericField(d,name,value){
 const wrapper=d.createElement('label');wrapper.className='scene3d-wire-field';
 const caption=d.createElement('span');caption.textContent=name;
 const input=d.createElement('input');input.type='number';input.step='any';input.value=String(value);
 wrapper.append(caption,input);return {wrapper,input};
}
const header=(d,label)=>{
 const p=d.createElement('section');p.className='scene3d-wire-editor';p.hidden=true;
 p.setAttribute('aria-label',label);return p;
};
export function attachEngineeringWorkbench(root,controls,diagramAccessor,onChange,onError,onRenderMode){
 const d=root.ownerDocument;
 const panel=header(d,'Dimensioned CAD and thermal engineering workspace');
 const button=d.createElement('button');button.type='button';button.textContent='Engineering CAD';
 button.dataset.action='engineering-cad';button.setAttribute('aria-expanded','false');
 controls.append(button);root.append(panel);
 const title=d.createElement('strong');title.textContent='Dimensioned CAD + electrothermal experiment';
 const note=d.createElement('p');
 note.textContent='Explicit mm geometry only. Model-only envelopes, NOT manufacturing CAD. No physical qualification.';
 const selector=d.createElement('select');selector.setAttribute('aria-label','Physical CAD component');
 const fields=[
  ['X (mm)',0],['Y (mm)',0],['Z (mm)',0],
  ['Width (mm)',20],['Height (mm)',8],['Depth (mm)',12]
 ].map(([n,v])=>numericField(d,n,v));
 const save=d.createElement('button');save.type='button';save.dataset.action='save-dimensioned-cad';
 save.textContent='Save mm component envelope';
 const report=d.createElement('output');report.setAttribute('aria-live','polite');
 const toggle=d.createElement('button');toggle.type='button';
 toggle.dataset.action='dimensioned-cad-view';toggle.textContent='Show true-scale mm envelopes';
 let mode=false;
 toggle.addEventListener('click',()=>{
  if(!mode){
   const cad=dimensionedAssembly(diagramAccessor());
   if(!cad.parts.length){report.textContent='Enter at least one real component envelope first.';return;}
  }
  mode=!mode;toggle.setAttribute('aria-pressed',String(mode));onRenderMode(mode);
  report.textContent=mode?'Explicit 20 mm/world-unit CAD envelopes; unmapped parts are not rendered. MODEL ONLY.'
   :'Illustrative schematic 3D workbench.';
 });
 const thermalHeading=d.createElement('strong');thermalHeading.textContent='Wire Joule heating (lumped transient)';
 const wireSelect=d.createElement('select');wireSelect.setAttribute('aria-label','Thermal wire ID');
 const ambient=numericField(d,'Ambient (°C)',20);
 const h=numericField(d,'Convection h (W/m²/K)',10);
 const duration=numericField(d,'Duration (s)',5);
 const step=numericField(d,'Step (s)',0.01);
 const contact=numericField(d,'Contact resistance (Ω)',0);
 const thermalButton=d.createElement('button');thermalButton.type='button';
 thermalButton.dataset.action='run-wire-thermal';thermalButton.textContent='Simulate wire temperature';
 const thermalResult=d.createElement('output');thermalResult.setAttribute('aria-live','polite');
 const coupled=d.createElement('button');coupled.type='button';
 coupled.dataset.action='run-coupled-wire-dc';coupled.textContent='Run coupled DC current + heat';
 const coupledReadout=d.createElement('output');coupledReadout.setAttribute('aria-live','polite');
 const compareHeading=d.createElement('strong');compareHeading.textContent='Compare real measurements (optional)';
 const compareNote=d.createElement('p');
 compareNote.textContent='Paste JSON array of real resistance observations with id, spec, observedOhm. Development/holdout split is mandatory. The app cannot authenticate raw instrument provenance.';
 const observations=d.createElement('textarea');observations.rows=3;observations.placeholder='[{"id":"m1","spec":{"material":"copper","lengthMm":100,"diameterMm":0.5,"temperatureC":20},"observedOhm":0.009}]';
 observations.setAttribute('aria-label','Measured wire resistance JSON records');
 const source=d.createElement('input');source.placeholder='Physical source / dated dataset / operator';source.setAttribute('aria-label','Measurement provenance');
 const instrument=d.createElement('input');instrument.placeholder='Instrument model and ID';instrument.setAttribute('aria-label','Instrument identification');
 const uncertainty=numericField(d,'Instrument uncertainty (Ω)',0.001);
 const held=d.createElement('input');held.placeholder='holdout row IDs, comma separated';held.setAttribute('aria-label','Reserved holdout record IDs');
 const compare=d.createElement('button');compare.type='button';compare.textContent='Evaluate held-out measurements';
 compare.dataset.action='compare-wire-measurements';
 const evidence=d.createElement('output');evidence.setAttribute('aria-live','polite');
 const fit=d.createElement('button');fit.type='button';fit.dataset.action='fit-wire-candidate';
 fit.textContent='Fit candidate model (development only)';
 panel.append(title,note,selector,...fields.map(f=>f.wrapper),save,toggle,report,
  thermalHeading,wireSelect,ambient.wrapper,h.wrapper,duration.wrapper,step.wrapper,
  contact.wrapper,thermalButton,thermalResult,coupled,coupledReadout,
  compareHeading,compareNote,observations,source,instrument,uncertainty.wrapper,held,compare,fit,evidence);
 const update=()=>{
  const diagram=diagramAccessor();const prior=selector.value,oldWire=wireSelect.value;
  selector.replaceChildren();wireSelect.replaceChildren();
  for(const b of diagram?.blocks||[]){const opt=d.createElement('option');opt.value=b.id;opt.textContent=b.id+' — '+b.type;selector.append(opt);}
  for(const wire of diagram?.wires||[]){const opt=d.createElement('option');opt.value=wire.id;opt.textContent=wire.id;wireSelect.append(opt);}
  if([...selector.options].some(o=>o.value===prior))selector.value=prior;
  if([...wireSelect.options].some(o=>o.value===oldWire))wireSelect.value=oldWire;
  save.disabled=!selector.options.length;thermalButton.disabled=!wireSelect.options.length;
  coupled.disabled=diagram?.lab!=='chip'||!wireSelect.options.length;
  load();
 };
 const load=()=>{
  const spec=diagramAccessor()?.meta?.dimensionedCAD?.parts?.[selector.value];
  if(spec)for(const [i,k] of ['xMm','yMm','zMm','widthMm','heightMm','depthMm'].entries())
   fields[i].input.value=String(spec[k]);
 };
 button.addEventListener('click',()=>{panel.hidden=!panel.hidden;
  button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)update();});
 selector.addEventListener('change',load);
 save.addEventListener('click',()=>{
  try{
   const values=fields.map(f=>f.input.value);
   if(values.some(x=>!x.trim()))throw Error('All six explicit mm fields required');
   const spec=Object.fromEntries(['xMm','yMm','zMm','widthMm','heightMm','depthMm']
    .map((key,i)=>[key,Number(values[i])]));
   setCADEnvelope(diagramAccessor(),selector.value,spec);
   const cad=dimensionedAssembly(diagramAccessor());
   onChange();onRenderMode(mode);
   report.textContent='Saved '+cad.parts.length+' dimensions; overlaps: '+cad.overlaps.length+
    '; missing envelopes: '+cad.missing.length+'. MODEL ONLY; physical validity UNKNOWN.';
  }catch(e){report.textContent='Invalid CAD: '+e.message;onError(e.message);}
 });
 thermalButton.addEventListener('click',()=>{
  try{
   const diagram=diagramAccessor(),id=wireSelect.value;
   if(!diagram.wires.some(w=>w.id===id))throw Error('Choose a canonical wire');
   const spec=diagram.meta?.physicalLayout?.wires?.[id];
   if(!spec)throw Error('Save wire dimensions and assumed current using Wire physics first');
   const f=[ambient,h,duration,step,contact].map(x=>x.input.value);
   if(f.some(x=>!x.trim()))throw Error('All thermal parameters required');
   const simulation=simulateWireThermal(spec,{
    ambientC:Number(f[0]),heatTransferWm2K:Number(f[1]),durationS:Number(f[2]),
    stepS:Number(f[3]),contactResistanceOhm:Number(f[4])});
   thermalResult.textContent='Predicted final '+simulation.temperatureC.toFixed(3)+' °C; peak '+
    simulation.peakTemperatureC.toFixed(3)+' °C; final I²R '+
    simulation.finalPowerW.toPrecision(4)+' W; MODEL ONLY, no hardware measurements.';
  }catch(e){thermalResult.textContent='Cannot simulate: '+e.message;onError(e.message);}
 });
 coupled.addEventListener('click',()=>{
  try{
   const diagram=diagramAccessor();
   if(diagram?.lab!=='chip')throw Error('Only Chip Lab DC circuits can use coupled solver');
   const f=[ambient,h,duration,step,contact].map(x=>x.input.value);
   if(f.some(x=>!x.trim()))throw Error('Enter every thermal boundary condition');
   const result=solveCoupledWireDC(diagram,{
    ambientC:Number(f[0]),heatTransferWm2K:Number(f[1]),
    durationS:Number(f[2]),stepS:Number(f[3]),
    contactResistanceOhm:Number(f[4])});
   const hot=result.wires.reduce((a,w)=>a.peakTemperatureC>w.peakTemperatureC?a:w);
   const count=result.wires.filter(w=>w.crossesTemperatureLimit).length;
   coupledReadout.textContent='Augmented canonical DC solver: '+result.wires.length+
    ' physical wires; maximum predicted temperature '+hot.peakTemperatureC.toFixed(3)+
    ' °C; '+count+' threshold exceedances; minimum CAD body-gap contradictions '+
    result.geometryClearance.impossible.length+
    '. MODEL ONLY; real hardware unverified; original schematic unchanged.';
  }catch(e){coupledReadout.textContent='Coupled DC unavailable: '+e.message;onError(e.message);}
 });
 function readObservations(){
   return {rows:JSON.parse(observations.value),options:{source:source.value,
    instrument:instrument.value,uncertaintyOhm:Number(uncertainty.input.value),
    holdoutIds:held.value.split(',').map(x=>x.trim()).filter(Boolean)}};
 }
 compare.addEventListener('click',()=>{
  try{
   const {rows,options}=readObservations();
   const result=compareWireMeasurements(rows,options);
   evidence.textContent='Held-out MAE '+result.holdout.meanAbsoluteErrorOhm.toPrecision(5)+
    ' Ω; RMSE '+result.holdout.rootMeanSquareErrorOhm.toPrecision(5)+
    ' Ω. UNVERIFIED user-supplied observations; no calibration or independent qualification.';
  }catch(e){evidence.textContent='Cannot validate: '+e.message;onError(e.message);}
 });
 fit.addEventListener('click',()=>{
  try{
   const {rows,options}=readObservations();
   const result=fitWireResistanceScale(rows,options);
   evidence.textContent='CANDIDATE fitted resistance scale '+
    result.candidateParameters.resistanceScale.toPrecision(6)+
    '; held-out MAE '+result.independentHoldout.meanAbsoluteErrorOhm.toPrecision(5)+
    ' Ω, RMSE '+result.independentHoldout.rootMeanSquareErrorOhm.toPrecision(5)+
    ' Ω. Fitted only on development rows; unverified source, NOT PHYSICALLY QUALIFIED.';
  }catch(e){evidence.textContent='Cannot fit: '+e.message;onError(e.message);}
 });
 update();
 return {panel,button,selector,fields,save,toggle,report,wireSelect,thermalButton,
  thermalResult,coupled,coupledReadout,compare,fit,evidence,sync:update,get mode(){return mode;}};
}
