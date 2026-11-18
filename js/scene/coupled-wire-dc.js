// Conservative, opt-in electrical/thermal DC coupling for simple linear Chip Lab circuits.
// Every configured canonical wire is replaced by a real modeled SERIES RESISTOR in a
// temporary cloned diagram; the original netlist, metadata and geometry stay unchanged.
// Source: local ideal MNA solver + nominal uniform copper/aluminium wire equations.
// NOT a full thermal FEM, PCB routing analysis or physically calibrated model.
import {solveDC} from '../labs/chip/engine.js';
import {physicalWireAssumptions,evaluatePhysicalWire} from './physical-wire.js';
import {inspectConductorClearances} from './cad-wire-clearance.js';
export const COUPLED_DC_FORMAT='invention-lab/coupled-wire-dc-thermal/1';
const MATERIAL_PROPS=Object.freeze({
 copper:{densityKgM3:8960,heatCapacityJKgK:385},
 aluminum:{densityKgM3:2700,heatCapacityJKgK:897}
});
function bounded(v,min,max,label){
 if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)
  throw Error(label+' must be finite and within ['+min+','+max+']');
 return v;
}
function inputs(diagram,environment){
 if(!diagram||diagram.lab!=='chip'||typeof diagram.clone!=='function'||
   typeof diagram.toJSON!=='function')
  throw Error('Coupling requires a real Chip Lab canonical design');
 if(!Array.isArray(diagram.blocks)||!Array.isArray(diagram.wires)||
   !diagram.wires.length||diagram.wires.length>60||diagram.blocks.length>100)
  throw Error('DC coupling supports 1–60 physical wires and at most 100 components');
 if(diagram.blocks.some(b=>!['chip.RES','chip.VSOURCE','chip.ISOURCE','chip.GND',
   'chip.AMMETER','chip.VOLTMETER'].includes(b.type)))
  throw Error('Coupled DC model supports only resistors, DC sources, ground and ideal meters');
 if(diagram.blocks.some(b=>b.type==='chip.VSOURCE'&&b.params.mode!=='dc'))
  throw Error('Coupled DC requires every voltage source to be in DC mode');
 if(!environment||typeof environment!=='object'||Array.isArray(environment))
  throw Error('Explicit external thermal environment is required');
 const ambientC=bounded(environment.ambientC,-40,120,'Ambient °C');
 const heatTransferWm2K=bounded(environment.heatTransferWm2K,.01,1000,'Convection W/m²/K');
 const contactResistanceOhm=bounded(environment.contactResistanceOhm,0,10,'Contact resistance Ω');
 const durationS=bounded(environment.durationS,.001,3600,'Duration s');
 const stepS=bounded(environment.stepS,.0001,10,'Time step s');
 const maxTemperatureC=bounded(environment.maxTemperatureC??150,-40,150,'Limit temperature °C');
 const count=Math.ceil(durationS/stepS);
 if(count>500)throw Error('DC thermal coupling restricted to 500 time steps');
 const physical=physicalWireAssumptions(diagram);
 if(physical.wires.length!==diagram.wires.length||physical.status!=='model-only')
  throw Error('Every canonical wire needs a saved physical conductor specification');
 const configured=new Map(Object.entries(diagram.meta.physicalLayout.wires));
 const wireIds=diagram.wires.map(w=>w.id);
 if(new Set(wireIds).size!==wireIds.length)
  throw Error('Duplicate canonical wire IDs disallowed in physical coupling');
 const parts=diagram.wires.map((w,index)=>{
  const raw=configured.get(w.id);
  const spec={...raw}; // must not rely on user-entered assumedCurrentA
  const base=evaluatePhysicalWire(spec);
  const diameterM=spec.diameterMm/1000,lengthM=spec.lengthMm/1000;
  const areaM2=Math.PI*diameterM**2/4;
  const material=MATERIAL_PROPS[spec.material];
  const massKg=areaM2*lengthM*material.densityKgM3;
  const capacityJK=massKg*material.heatCapacityJKgK;
  const convectionWPerK=heatTransferWm2K*Math.PI*diameterM*lengthM;
  const tauS=capacityJK/convectionWPerK;
  if(stepS>tauS/5)throw Error('Unstable thermal time step for canonical wire '+w.id);
  if(spec.temperatureC>maxTemperatureC)
   throw Error('Initial conductor exceeds stated temperature threshold: '+w.id);
  return {wireId:w.id,wireIndex:index,wire:w,spec,
   initialTemperatureC:spec.temperatureC,temperatureC:spec.temperatureC,
   massKg,capacityJK,convectionWPerK,tauS,initialResistanceOhm:base.resistanceOhm};
 });
 return {parts,ambientC,heatTransferWm2K,contactResistanceOhm,
  durationS,stepS,maxTemperatureC,count};
}
function physicalDC(diagram,parts,contactResistanceOhm){
 const altered=diagram.clone();
 const usedBlocks=new Set(altered.blocks.map(b=>b.id));
 const usedWires=new Set(altered.wires.map(w=>w.id));
 const mapping=[];
 for(const p of parts){
  const original=p.wire;
  const id='__physical_r_'+p.wireIndex;
  if(usedBlocks.has(id))throw Error('Reserved physical resistor component ID collision');
  const e1='__physical_w_'+p.wireIndex+'_a',e2='__physical_w_'+p.wireIndex+'_b';
  if(usedWires.has(e1)||usedWires.has(e2))
   throw Error('Reserved physical wire ID collision');
  if(!altered.disconnect(original.id))throw Error('Stale canonical wire during coupling');
  const resistanceOhm=evaluatePhysicalWire({...p.spec,
   temperatureC:p.temperatureC}).resistanceOhm+contactResistanceOhm;
  altered.addBlock('chip.RES',{id,params:{r:resistanceOhm}});
  // Let Diagram.connect independently validate typed source/target ports.
  const a=altered.connect(original.from.block,original.from.port,id,'p');
  const b=altered.connect(id,'n',original.to.block,original.to.port);
  if(!a||!b)throw Error('Could not map canonical wire into a real series resistor');
  a.id=e1;b.id=e2;usedBlocks.add(id);usedWires.add(e1);usedWires.add(e2);
  mapping.push({wireId:original.id,resistorBlockId:id,resistanceOhm,
   source:original.from,target:original.to});
 }
 const solved=solveDC(altered);
 if(!solved.ok)throw Error('Augmented electrical DC solver failed: '+(solved.problems||[]).join('; '));
 const elements=new Map(solved.elements.map(r=>[r.blockId,r]));
 const states=mapping.map((m,i)=>{
  const row=elements.get(m.resistorBlockId);
  if(!row||typeof row.i!=='number'||!Number.isFinite(row.i))
   throw Error('Missing actual augmented-solver current for '+m.wireId);
  if(!Number.isFinite(row.power))throw Error('Nonfinite series-wire solver power');
  return {wireId:m.wireId,currentA:row.i,resistanceOhm:m.resistanceOhm,
   voltageDropV:row.i*m.resistanceOhm,powerW:row.i*row.i*m.resistanceOhm,
   temperatureC:parts[i].temperatureC};
 });
 return {mapping,states,solve:solved};
}
export function solveCoupledWireDC(diagram,environment){
 // Must not modify the original netlist, no matter where an error occurs.
 const cfg=inputs(diagram,environment);
 const source=JSON.stringify(diagram.toJSON());
 if(source.length>2_000_000)throw Error('Source-bound DC simulation size exceeded');
 const geometry=inspectConductorClearances(diagram);
 if(geometry.impossible.length)
  throw Error('Entered wire length shorter than minimum CAD body separation: '+geometry.impossible.join(', '));
 const baseline=solveDC(diagram);
 if(!baseline.ok)throw Error('Original electrical DC design failed: '+(baseline.problems||[]).join('; '));
 const temperatures=cfg.parts.map(p=>p.temperatureC);
 const totals=cfg.parts.map(()=>({jouleEnergyJ:0,convectionEnergyJ:0,peakTemperatureC:-Infinity}));
 const records=[],warnings=['One lumped thermal node per conductor',
  'No radiation, insulation, mutual heating, or measured contact geometry',
  'CAD envelope body-gap check is only a lower bound; physical pins and wire routes are not mapped'];
 if(geometry.wiresNotChecked.length)
  warnings.push('No dimensional clearance check for '+geometry.wiresNotChecked.length+' physical wires');
 let elapsed=0,latest;
 for(let n=0;n<=cfg.count;n++){
  for(let i=0;i<cfg.parts.length;i++)cfg.parts[i].temperatureC=temperatures[i];
  latest=physicalDC(diagram,cfg.parts,cfg.contactResistanceOhm);
  const sample={timeS:Number(elapsed.toPrecision(12)),
   wires:latest.states.map((state,i)=>({...state,temperatureC:temperatures[i]}))};
  if(n===0||n===cfg.count||n%Math.max(1,Math.ceil(cfg.count/100))===0)records.push(sample);
  if(n===cfg.count)break;
  const dt=Math.min(cfg.stepS,cfg.durationS-elapsed);
  if(dt<=0)throw Error('Unexpected non-positive coupling time step');
  for(let i=0;i<cfg.parts.length;i++){
   const p=cfg.parts[i],wire=latest.states[i],heat=wire.powerW;
   const cooled=p.convectionWPerK*(temperatures[i]-cfg.ambientC);
   const next=temperatures[i]+dt*(heat-cooled)/p.capacityJK;
   if(!Number.isFinite(next)||next< -40||next>150)
    throw Error('Temperature outside conductor material applicability range: '+p.wireId);
   temperatures[i]=next;
   totals[i].jouleEnergyJ+=heat*dt;
   totals[i].convectionEnergyJ+=cooled*dt;
   totals[i].peakTemperatureC=Math.max(totals[i].peakTemperatureC,next,p.initialTemperatureC);
  }
  elapsed=Math.min(cfg.durationS,elapsed+dt);
 }
 const wires=cfg.parts.map((p,i)=>{
  const e=totals[i],stored=p.capacityJK*(temperatures[i]-p.initialTemperatureC);
  const balance=e.jouleEnergyJ-e.convectionEnergyJ-stored;
  if(Math.abs(balance)>1e-7*Math.max(1,Math.abs(e.jouleEnergyJ),Math.abs(stored)))
   throw Error('DC thermal coupling failed energy-balance consistency');
  return {wireId:p.wireId,initialTemperatureC:p.initialTemperatureC,
   finalTemperatureC:temperatures[i],peakTemperatureC:e.peakTemperatureC,
   maxAllowedTemperatureC:cfg.maxTemperatureC,
   crossesTemperatureLimit:e.peakTemperatureC>cfg.maxTemperatureC,
   initialResistanceOhm:p.initialResistanceOhm,
   finalResistanceOhm:latest.states[i].resistanceOhm,
   finalCurrentA:latest.states[i].currentA,finalPowerW:latest.states[i].powerW,
   thermalTimeConstantS:p.tauS,heatCapacityJK:p.capacityJK,
   storedThermalEnergyJ:stored,jouleEnergyJ:e.jouleEnergyJ,
   convectionEnergyJ:e.convectionEnergyJ,energyBalanceResidualJ:balance};
 });
 if(JSON.stringify(diagram.toJSON())!==source)
  throw Error('Coupled calculation unexpectedly mutated the canonical design');
 return {format:COUPLED_DC_FORMAT,sourceDesign:JSON.parse(source),
  sourceLab:'chip',mode:'OPT_IN_AUGMENTED_CHIP_DC',
  status:'model-only',baseCircuit:baseline,augmentedCircuit:latest.solve,
  canonicalWireMapping:latest.mapping,geometryClearance:geometry,records,wires,
  modelAssumptions:{...environment,ambientC:cfg.ambientC,
   heatTransferWm2K:cfg.heatTransferWm2K,
   contactResistanceOhm:cfg.contactResistanceOhm,
   durationS:cfg.durationS,stepS:cfg.stepS,maxTemperatureC:cfg.maxTemperatureC,
   conductionOneThermalNodePerWire:true,
   assumedContactHeatDepositedInWire:true,
   sourceCurrentFromActualAugmentedMNA:true,
   originalSchematicElectricallyUnchanged:true},
  warnings,independentPhysicalEvidence:'none',physicalValidation:'none',
  calibrated:false,realWorldBuildSuccessPercent:null};
}
