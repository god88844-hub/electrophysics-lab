// Physical assumptions overlay (v1). Engineering estimates use USER-ENTERED
// lengths/cross-sections, not schematic pixels or the illustrative WebGL mesh.
// No measurement data or calibrated reliability is asserted by this module.
export const PHYSICAL_WIRE_MODEL='invention-lab/physical-wire-assumptions/1';
const MATERIALS=Object.freeze({
 copper:Object.freeze({resistivity20OhmM:1.68e-8,alphaPerK:0.00393}),
 aluminum:Object.freeze({resistivity20OhmM:2.82e-8,alphaPerK:0.00403})
});
const finite=n=>typeof n==='number'&&Number.isFinite(n);
function bounded(n,min,max,name){
 if(!finite(n)||n<min||n>max)throw Error(name+' must be a finite value between '+min+' and '+max);
 return n;
}
export function wireMaterials(){
 return Object.fromEntries(Object.entries(MATERIALS).map(([id,params])=>[id,{...params}]));
}
export function evaluatePhysicalWire(spec){
 if(!spec||typeof spec!=='object'||Array.isArray(spec))throw Error('Physical wire specification is required');
 if(!Object.hasOwn(MATERIALS,spec.material))throw Error('Unknown conductor material');
 const L=bounded(spec.lengthMm,0.1,100000,'Wire length (mm)')/1000;
 const diameter=bounded(spec.diameterMm,0.05,20,'Wire diameter (mm)')/1000;
 const T=bounded(spec.temperatureC,-40,150,'Wire temperature (°C)');
 const assumptions=MATERIALS[spec.material],area=Math.PI*diameter**2/4;
 const resistivity=assumptions.resistivity20OhmM*(1+assumptions.alphaPerK*(T-20));
 const resistanceOhm=resistivity*L/area;
 const result={model:PHYSICAL_WIRE_MODEL,material:spec.material,
  lengthM:L,crossSectionM2:area,temperatureC:T,
  resistivityOhmM:resistivity,resistanceOhm,
  source:'Illustrative nominal engineering constants (not measured or device-calibrated)',
  physicalValidation:'none',contactResistanceIncluded:false,
  skinEffectIncluded:false,thermalCouplingIncluded:false,
  sourceDesignIsSchematic:false,realWorldBuildSuccessPercent:null
 };
 // There is no reliable wire current in this library. It must be explicit.
 if(spec.assumedCurrentA!==undefined&&spec.assumedCurrentA!==null){
  const I=bounded(spec.assumedCurrentA,0,100,'Assumed current (A)');
  result.assumedCurrentA=I;
  result.voltageDropV=I*resistanceOhm;
  result.dissipatedPowerW=I*I*resistanceOhm;
 }
 if(Object.values(result).some(x=>typeof x==='number'&&!Number.isFinite(x)))
  throw Error('Nonfinite physical wire estimate');
 return result;
}
export function physicalWireAssumptions(diagram){
 if(!diagram||!Array.isArray(diagram.wires))throw Error('Wire assumptions require a real design');
 const cfg=diagram.meta?.physicalLayout;
 if(cfg===undefined)return {model:PHYSICAL_WIRE_MODEL,wires:[],qualified:false,
  status:'no-input',message:'No physical lengths, gauges or material assumptions specified'};
 if(!cfg||cfg.format!==PHYSICAL_WIRE_MODEL||!cfg.wires||typeof cfg.wires!=='object'||
    Array.isArray(cfg.wires))throw Error('Invalid versioned physical layout assumptions');
 const actual=new Set(diagram.wires.map(x=>x.id));
 if(diagram.wires.length>500||Object.keys(cfg.wires).length>500)throw Error('Too many physical wire assumptions');
 const wires=[];
 for(const [id,spec] of Object.entries(cfg.wires)){
  if(!actual.has(id))throw Error('Stale physical wire ID: '+id);
  wires.push({id,...evaluatePhysicalWire(spec)});
 }
 return {model:PHYSICAL_WIRE_MODEL,wires,qualified:false,status:'model-only',
  measuredGeometry:false,simulationLinked:false,
  message:'Model-only copper/aluminum conductor estimate from entered dimensions; not included in circuit solver and not physically validated'};
}
export function setPhysicalWireAssumption(diagram,wireId,spec){
 if(!diagram?.wires?.some(w=>w.id===wireId))throw Error('Unknown canonical circuit wire');
 const estimated=evaluatePhysicalWire(spec); // validate before mutation
 const old=diagram.meta?.physicalLayout;
 if(old!==undefined&&(old?.format!==PHYSICAL_WIRE_MODEL||typeof old.wires!=='object'))
  throw Error('Invalid stored physical assumption metadata');
 if(!diagram.meta||typeof diagram.meta!=='object')throw Error('Missing design metadata');
 const next={format:PHYSICAL_WIRE_MODEL,wires:{...(old?.wires||{}),
  [wireId]:{material:spec.material,lengthMm:spec.lengthMm,
   diameterMm:spec.diameterMm,temperatureC:spec.temperatureC,
   ...(spec.assumedCurrentA===undefined?{}:{assumedCurrentA:spec.assumedCurrentA})}
 }};
 diagram.meta.physicalLayout=next;
 return estimated;
}
