import {setCADEnvelope,dimensionedAssembly} from './dimensioned-cad.js';
import {parseMillimetreOBJ,objTrianglesForPart} from './imported-obj-geometry.js';
import {simulateWireThermal,simulateSegmentedWireThermal} from './wire-electrothermal.js';
import {solveCoupledWireDC} from './coupled-wire-dc.js';
import {compareWireMeasurements,fitWireResistanceScale} from './wire-measurement-check.js';
import {fitWireThermalConvectionHoldout} from './wire-thermal-holdout.js';
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
export function attachEngineeringWorkbench(root,controls,diagramAccessor,onChange,onError,onRenderMode,onImportedMesh=()=>{}){
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
 const objNote=d.createElement('p');
 objNote.textContent='Optional LOCAL OBJ geometry: millimetres, +Y up, matches saved envelope. Session preview only. Not verified manufacturer CAD.';
 const objFile=d.createElement('input');objFile.type='file';objFile.accept='.obj,text/plain';
 objFile.setAttribute('aria-label','Local millimetre OBJ component mesh');
 const objButton=d.createElement('button');objButton.type='button';
 objButton.dataset.action='preview-local-obj';objButton.textContent='Preview local OBJ in 3D';
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
  const segmentedHeading=d.createElement('strong');segmentedHeading.textContent='Segmented 1D heat transfer (model only)';
  const segments=numericField(d,'Thermal segments (2–32)',6);
  const jacket=numericField(d,'Jacket thickness (mm)',0);
  const jacketK=numericField(d,'Jacket conductivity (W/m/K)',0.2);
  const endA=numericField(d,'Terminal A heat sink (W/K)',0);
  const endB=numericField(d,'Terminal B heat sink (W/K)',0);
  const segmentedButton=d.createElement('button');segmentedButton.type='button';
  segmentedButton.dataset.action='run-segmented-wire-thermal';
  segmentedButton.textContent='Simulate 1D wire heat transfer';
  const segmentedResult=d.createElement('output');segmentedResult.setAttribute('aria-live','polite');
 const heatFitHeading=d.createElement('strong');heatFitHeading.textContent='Candidate thermal calibration (unverified measurements)';
 const heatFitNote=d.createElement('p');
 heatFitNote.textContent='Local JSON array of 4–32 observed mean-wire temperatures. Two or more separate holdout IDs required. Fitted convection is not applied automatically or physically certified.';
 const heatFitRows=d.createElement('textarea');heatFitRows.rows=3;
 heatFitRows.setAttribute('aria-label','Thermal measurement JSON array');
 heatFitRows.placeholder='[{"id":"run1","wireSpec":{},"environment":{},"observedMeanTemperatureC":20,"uncertaintyC":0.5}]';
 const heatFitSource=d.createElement('input');
 heatFitSource.placeholder='Raw source and collection provenance';heatFitSource.setAttribute('aria-label','Thermal data provenance');
 const heatFitInstrument=d.createElement('input');
 heatFitInstrument.placeholder='Instrument model and serial';heatFitInstrument.setAttribute('aria-label','Thermal thermometer instrument');
 const heatFitOperator=d.createElement('input');
 heatFitOperator.placeholder='Operator and lab record';heatFitOperator.setAttribute('aria-label','Thermal measurement operator');
 const heatFitHoldout=d.createElement('input');
 heatFitHoldout.placeholder='holdout IDs, comma separated';heatFitHoldout.setAttribute('aria-label','Thermal holdout observation IDs');
 const heatFitButton=d.createElement('button');heatFitButton.type='button';
 heatFitButton.dataset.action='fit-thermal-convection-holdout';heatFitButton.textContent='Fit convection with excluded holdout';
 const heatFitResult=d.createElement('output');heatFitResult.setAttribute('aria-live','polite');
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
  objNote,objFile,objButton,
  thermalHeading,wireSelect,ambient.wrapper,h.wrapper,duration.wrapper,step.wrapper,
  contact.wrapper,thermalButton,thermalResult,
   segmentedHeading,segments.wrapper,jacket.wrapper,jacketK.wrapper,endA.wrapper,endB.wrapper,
   segmentedButton,segmentedResult,
   heatFitHeading,heatFitNote,heatFitRows,heatFitSource,heatFitInstrument,
   heatFitOperator,heatFitHoldout,heatFitButton,heatFitResult,
   coupled,coupledReadout,
  compareHeading,compareNote,observations,source,instrument,uncertainty.wrapper,held,compare,fit,evidence);
 const update=()=>{
  const diagram=diagramAccessor();const prior=selector.value,oldWire=wireSelect.value;
  selector.replaceChildren();wireSelect.replaceChildren();
  for(const b of diagram?.blocks||[]){const opt=d.createElement('option');opt.value=b.id;opt.textContent=b.id+' — '+b.type;selector.append(opt);}
  for(const wire of diagram?.wires||[]){const opt=d.createElement('option');opt.value=wire.id;opt.textContent=wire.id;wireSelect.append(opt);}
  if([...selector.options].some(o=>o.value===prior))selector.value=prior;
  if([...wireSelect.options].some(o=>o.value===oldWire))wireSelect.value=oldWire;
  save.disabled=!selector.options.length;objButton.disabled=!selector.options.length;
  thermalButton.disabled=!wireSelect.options.length;
   segmentedButton.disabled=!wireSelect.options.length;
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
 objButton.addEventListener('click',async()=>{
  try{
   const diagram=diagramAccessor(),blockId=selector.value,file=objFile.files?.[0];
   if(!diagram?.blocks?.some(b=>b.id===blockId))throw Error('Select a canonical component');
   if(!file||file.size<=0||file.size>4_000_000)throw Error('Choose a local OBJ file at most 4 MB');
   const raw=await file.text();
   if(diagramAccessor()!==diagram)throw Error('Design changed while reading OBJ file');
   const model=parseMillimetreOBJ(raw);
   const part=dimensionedAssembly(diagram).parts.find(p=>p.id===blockId);
   if(!part)throw Error('Save explicit mm envelope first');
   objTrianglesForPart(model,part); // refuse dimension mismatch BEFORE changing viewer state
   onImportedMesh(blockId,model);
   report.textContent='OBJ '+model.faces.length+' triangles. Local geometry preview only. '+(mode?'Rendered in 3D.':'Enable true-scale mm envelopes to see it.')+' Manufacturer and physical validity UNKNOWN.';
  }catch(e){report.textContent='Cannot preview OBJ: '+e.message;onError(e.message);}
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
  segmentedButton.addEventListener('click',()=>{
   try{
    const diagram=diagramAccessor(),id=wireSelect.value;
    if(!diagram?.wires?.some(w=>w.id===id))throw Error('Choose a canonical wire');
    const spec=diagram.meta?.physicalLayout?.wires?.[id];
    if(!spec)throw Error('Save explicit wire dimensions and assumed current first');
    const f=[ambient,h,duration,step,contact,segments,jacket,jacketK,endA,endB]
     .map(x=>x.input.value);
    if(f.some(v=>!v.trim()))throw Error('All segmented thermal parameters required');
    const s=simulateSegmentedWireThermal(spec,{
     ambientC:Number(f[0]),heatTransferWm2K:Number(f[1]),durationS:Number(f[2]),
     stepS:Number(f[3]),contactResistanceOhm:Number(f[4]),
     segments:Number(f[5]),jacketThicknessMm:Number(f[6]),
     jacketThermalConductivityWmK:Number(f[7]),
     endAConductanceWPerK:Number(f[8]),endBConductanceWPerK:Number(f[9])});
    segmentedResult.textContent='1D axial + jacket and end sinks: '+s.segments+
     ' segments; maximum '+s.peakTemperatureC.toFixed(3)+' °C; mean '+
     s.meanTemperatureC.toFixed(3)+' °C; final resistance '+
     s.finalResistanceOhm.toPrecision(5)+' Ω; energy residual '+
     s.energyBalanceResidualJ.toExponential(2)+' J. MODEL ONLY; no physical validation.';
   }catch(e){segmentedResult.textContent='1D simulation unavailable: '+e.message;onError(e.message);}
  });
 heatFitButton.addEventListener('click',()=>{
  try{
   const rows=JSON.parse(heatFitRows.value);
   const result=fitWireThermalConvectionHoldout(rows,{
    source:heatFitSource.value,instrument:heatFitInstrument.value,
    operator:heatFitOperator.value,
    holdoutIds:heatFitHoldout.value.split(',').map(x=>x.trim()).filter(Boolean)});
   heatFitResult.textContent='Candidate convection h '+
    result.candidateParameters.heatTransferWm2K.toPrecision(5)+' W/m²/K; holdout RMSE '+
    result.holdout.rmseC.toPrecision(5)+' °C; holdout observations '+
    result.holdout.count+'. Development-only fitting. UNVERIFIED PHYSICAL DATA; no independent qualification.';
  }catch(e){heatFitResult.textContent='Thermal holdout refused: '+e.message;onError(e.message);}
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
  thermalResult,segmentedButton,segmentedResult,heatFitRows,heatFitHoldout,heatFitButton,heatFitResult,
  coupled,coupledReadout,objFile,objButton,compare,fit,evidence,sync:update,get mode(){return mode;}};
}
