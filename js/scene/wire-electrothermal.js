// Standalone uniform-wire transient electrothermal engineering estimate.
// All boundary conditions and heat-transfer constants are explicit assumptions.
// No substitution into the canonical circuit solver; no physical measurements implied.
import {evaluatePhysicalWire} from './physical-wire.js';
export const THERMAL_FORMAT='invention-lab/wire-electrothermal-lumped/1';
const limits=(v,min,max,name)=>{
 if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)
  throw Error(name+' must be finite in ['+min+', '+max+']');
 return v;
};
const PROPERTIES=Object.freeze({
 copper:Object.freeze({densityKgM3:8960,specificHeatJKgK:385}),
 aluminum:Object.freeze({densityKgM3:2700,specificHeatJKgK:897})
});
export function simulateWireThermal(spec,environment){
 const base=evaluatePhysicalWire(spec);
 if(!spec||spec.assumedCurrentA===undefined||spec.assumedCurrentA===null)
  throw Error('Thermal simulation requires explicitly assumed wire current');
 if(!environment||typeof environment!=='object'||Array.isArray(environment))
  throw Error('Explicit thermal environment required');
 const ambientC=limits(environment.ambientC,-40,120,'Ambient temperature');
 const coefficient=limits(environment.heatTransferWm2K,0.01,1000,'Heat transfer coefficient');
 const durationS=limits(environment.durationS,0.01,3600,'Duration');
 const stepS=limits(environment.stepS,0.001,60,'Integration step');
 const contactResistanceOhm=limits(environment.contactResistanceOhm??0,0,10,'Contact resistance');
 const limitsC=limits(environment.maxTemperatureC??150,-40,200,'Temperature threshold');
 if(durationS/stepS>10000)throw Error('Thermal step count exceeds 10000');
 const diameter=spec.diameterMm/1000,L=spec.lengthMm/1000;
 const A=Math.PI*diameter*diameter/4,side=Math.PI*diameter*L;
 const mass=A*L*PROPERTIES[spec.material].densityKgM3;
 const thermalCapacity=mass*PROPERTIES[spec.material].specificHeatJKgK;
 if(thermalCapacity<=0)throw Error('Invalid conductor thermal capacity');
 const I=spec.assumedCurrentA,thermalConductance=coefficient*side;
 const thermalTauS=thermalCapacity/thermalConductance;
 // Explicit Euler has no stability guarantee for steps >= 2*tau; fail closed.
 if(stepS>thermalTauS/5)throw Error('Step too large for lumped thermal time constant');
 let temperatureC=spec.temperatureC,peakTemperatureC=temperatureC;
 const records=[{timeS:0,temperatureC,powerW:I*I*(base.resistanceOhm+contactResistanceOhm)}];
 const steps=Math.ceil(durationS/stepS);
 for(let n=0;n<steps;n++){
  const dt=Math.min(stepS,durationS-n*stepS);
  if(dt<=0)break;
  const wire=evaluatePhysicalWire({...spec,temperatureC});
  const powerW=I*I*(wire.resistanceOhm+contactResistanceOhm);
  // Assumed contact dissipation is deposited in the same lumped thermal node.
  const dT=(powerW-thermalConductance*(temperatureC-ambientC))*dt/thermalCapacity;
  temperatureC+=dT;
  if(!Number.isFinite(temperatureC)||temperatureC>250||temperatureC< -100)
   throw Error('Thermal model left bounded, applicable regime');
  peakTemperatureC=Math.max(peakTemperatureC,temperatureC);
  if(steps<=512||n===steps-1||n%(Math.ceil(steps/510))===0)
   records.push({timeS:Number(Math.min(durationS,(n+1)*stepS).toPrecision(12)),
    temperatureC,powerW});
 }
 const finalWire=evaluatePhysicalWire({...spec,temperatureC});
 return {format:THERMAL_FORMAT,model:'single-thermal-node/uniform-metal/constant-convection',
  temperatureC,peakTemperatureC,exceedsAssumedLimit:peakTemperatureC>limitsC,
  thermalTimeConstantS:thermalTauS,massKg:mass,thermalCapacityJK:thermalCapacity,
  surfaceAreaM2:side,convectionWPerK:thermalConductance,
  finalResistanceOhm:finalWire.resistanceOhm,finalVoltageDropV:I*(finalWire.resistanceOhm+contactResistanceOhm),
  finalPowerW:I*I*(finalWire.resistanceOhm+contactResistanceOhm),
  records,assumptions:{...environment,ambientC,heatTransferWm2K:coefficient,
   contactResistanceOhm,maximumTemperatureC:limitsC,
   contactHeatAssignedToConductor:true,insulationExcluded:true,radiationExcluded:true,
   axialConductionExcluded:true,convectionConstant:true,uniformTemperature:true},
  source:'user-supplied geometry, current, initial temperature and boundary conditions',
  physicalValidation:'none',calibrated:false,solverLinked:false,
  realWorldBuildSuccessPercent:null};
}


// Optional 1D finite-volume wire model. Each node has its own resistance and
// heat capacity. Longitudinal conduction exchanges energy between adjacent
// nodes; no heat is manufactured by the axial links. External boundaries and
// the contact heat deposition model are explicit assumptions, not measurements.
export const SEGMENTED_THERMAL_FORMAT='invention-lab/wire-thermal-1d/1';
const SEGMENT_MATERIALS=Object.freeze({
 copper:Object.freeze({densityKgM3:8960,specificHeatJKgK:385,
  thermalConductivityWmK:401,alphaPerK:0.00393}),
 aluminum:Object.freeze({densityKgM3:2700,specificHeatJKgK:897,
  thermalConductivityWmK:237,alphaPerK:0.00403})
});
export function simulateSegmentedWireThermal(spec,environment){
 const base=evaluatePhysicalWire(spec);
 if(spec.assumedCurrentA===undefined||spec.assumedCurrentA===null)
  throw Error('Segmented thermal simulation requires explicitly assumed wire current');
 if(!environment||typeof environment!=='object'||Array.isArray(environment))
  throw Error('Explicit segmented thermal environment required');
 const segments=limits(environment.segments??6,2,32,'Segment count');
 if(!Number.isInteger(segments))throw Error('Segment count must be an integer');
 const ambientC=limits(environment.ambientC,-40,120,'Ambient temperature');
 const h=limits(environment.heatTransferWm2K,.01,1000,'Heat transfer coefficient');
 const durationS=limits(environment.durationS,.01,3600,'Duration');
 const stepS=limits(environment.stepS,.0001,60,'Integration step');
 const contactResistanceOhm=limits(environment.contactResistanceOhm??0,0,10,'Contact resistance');
 const endAConductanceWPerK=limits(environment.endAConductanceWPerK??0,0,10,'First-end heat sink');
 const endBConductanceWPerK=limits(environment.endBConductanceWPerK??0,0,10,'Second-end heat sink');
 const jacketThicknessMm=limits(environment.jacketThicknessMm??0,0,5,'Insulation thickness');
 const jacketThermalConductivityWmK=limits(
  environment.jacketThermalConductivityWmK??0.2,0.02,20,'Insulation conductivity');
 const maxTemperatureC=limits(environment.maxTemperatureC??150,-40,150,'Temperature threshold');
 const steps=Math.ceil(durationS/stepS);
 if(steps>10000)throw Error('Segmented thermal step count exceeds 10000');
 if(spec.temperatureC>maxTemperatureC)
  throw Error('Initial conductor temperature exceeds the selected threshold');
 const material=SEGMENT_MATERIALS[spec.material],I=spec.assumedCurrentA;
 const dxM=base.lengthM/segments,metalAreaM2=base.crossSectionM2;
 const radiusM=spec.diameterMm/2000,outerRadiusM=radiusM+jacketThicknessMm/1000;
 const capacityJK=material.densityKgM3*material.specificHeatJKgK*metalAreaM2*dxM;
 const axialWPerK=material.thermalConductivityWmK*metalAreaM2/dxM;
 const outerSurfaceAreaM2=2*Math.PI*outerRadiusM*dxM;
 const externalResistanceKW=1/(h*outerSurfaceAreaM2);
 // Radial, quasi-steady jacket thermal resistance in series with external
 // convection; jacket heat capacity and axial jacket conduction are excluded.
 const jacketResistanceKW=jacketThicknessMm===0?0:
  Math.log(outerRadiusM/radiusM)/(2*Math.PI*jacketThermalConductivityWmK*dxM);
 const surfaceWPerK=1/(externalResistanceKW+jacketResistanceKW);
 const worstSink=surfaceWPerK+2*axialWPerK+
  Math.max(endAConductanceWPerK,endBConductanceWPerK);
 if(stepS>capacityJK/(5*worstSink))
  throw Error('Step too large for stable 1D axial conduction and boundary cooling');
 const r20=base.resistanceOhm/(1+material.alphaPerK*(spec.temperatureC-20));
 const resistanceAt=t=>r20/segments*(1+material.alphaPerK*(t-20));
 let temperatures=Array(segments).fill(spec.temperatureC),peakTemperatureC=spec.temperatureC;
 let jouleEnergyJ=0,convectionEnergyJ=0,endSinkEnergyJ=0;
 const capture=t=>{
  const resistanceOhm=temperatures.reduce((s,T)=>s+resistanceAt(T),0);
  return {timeS:Number(t.toPrecision(12)),
   minTemperatureC:Math.min(...temperatures),
   meanTemperatureC:temperatures.reduce((a,b)=>a+b,0)/segments,
   maxTemperatureC:Math.max(...temperatures),
   resistanceOhm,
   electricalPowerW:I*I*(resistanceOhm+contactResistanceOhm)};
 };
 const records=[capture(0)];
 for(let n=0;n<steps;n++){
  const dt=Math.min(stepS,durationS-n*stepS);
  if(dt<=0)break;
  let heatW=0,convectionW=0,endW=0;
  const next=temperatures.map((T,i)=>{
   const pin=I*I*(resistanceAt(T)+
    ((i===0||i===segments-1)?contactResistanceOhm/2:0));
   const exchangeW=(i?axialWPerK*(temperatures[i-1]-T):0)+
    (i<segments-1?axialWPerK*(temperatures[i+1]-T):0);
   const coolingW=surfaceWPerK*(T-ambientC);
   const sinkW=(i===0?endAConductanceWPerK*(T-ambientC):0)+
    (i===segments-1?endBConductanceWPerK*(T-ambientC):0);
   heatW+=pin;convectionW+=coolingW;endW+=sinkW;
   const updated=T+dt*(pin+exchangeW-coolingW-sinkW)/capacityJK;
   if(!Number.isFinite(updated)||updated< -40||updated>150)
    throw Error('Segmented wire temperature outside supported material range');
   return updated;
  });
  temperatures=next;
  peakTemperatureC=Math.max(peakTemperatureC,...temperatures);
  jouleEnergyJ+=heatW*dt;
  convectionEnergyJ+=convectionW*dt;
  endSinkEnergyJ+=endW*dt;
  if(steps<=510||n===steps-1||n%Math.ceil(steps/510)===0)
   records.push(capture(Math.min(durationS,(n+1)*stepS)));
 }
 const storedThermalEnergyJ=capacityJK*temperatures.reduce(
  (total,T)=>total+(T-spec.temperatureC),0);
 const energyBalanceResidualJ=jouleEnergyJ-convectionEnergyJ-endSinkEnergyJ-storedThermalEnergyJ;
 if(Math.abs(energyBalanceResidualJ)>1e-8*Math.max(
  1,Math.abs(jouleEnergyJ),Math.abs(convectionEnergyJ),Math.abs(storedThermalEnergyJ)))
  throw Error('Segmented thermal energy conservation failed');
 const finalMetalResistanceOhm=temperatures.reduce((sum,T)=>sum+resistanceAt(T),0);
 return {format:SEGMENTED_THERMAL_FORMAT,
  model:'explicit-1d-metal-axial-conduction/radial-jacket-resistance/end-sinks',
  status:'model-only',segments,durationS,
  temperatureBySegmentC:temperatures,temperatureC:Math.max(...temperatures),
  meanTemperatureC:temperatures.reduce((s,T)=>s+T,0)/segments,
  peakTemperatureC,exceedsAssumedLimit:peakTemperatureC>maxTemperatureC,
  initialResistanceOhm:base.resistanceOhm,finalMetalResistanceOhm,
  finalResistanceOhm:finalMetalResistanceOhm+contactResistanceOhm,
  finalPowerW:I*I*(finalMetalResistanceOhm+contactResistanceOhm),
  massKg:capacityJK*segments/material.specificHeatJKgK,
  thermalCapacityJK:capacityJK*segments,
  axialConductanceWPerK:axialWPerK,
  surfaceConductanceWPerKPerSegment:surfaceWPerK,
  jacketResistanceKWPerSegment:jacketResistanceKW,
  storedThermalEnergyJ,jouleEnergyJ,convectionEnergyJ,endSinkEnergyJ,
  energyBalanceResidualJ,records,
  assumptions:{...environment,ambientC,heatTransferWm2K:h,
   segments,contactResistanceOhm,jacketThicknessMm,jacketThermalConductivityWmK,
   endAConductanceWPerK,endBConductanceWPerK,maxTemperatureC,
   constantCurrentNotCircuitLinked:true,contactHeatSplitEquallyAtEnds:true,
   jacketHeatCapacityExcluded:true,jacketAxialConductionExcluded:true,
   ambientAndEndSinkTemperatureIdentical:true,radiationExcluded:true,
   nominalMaterialPropertiesOnly:true},
  source:'User-entered geometry, constant assumed current and thermal boundary conditions; nominal metal properties',
  solverLinked:false,calibrated:false,physicalValidation:'none',
  independentPhysicalEvidence:'none',realWorldBuildSuccessPercent:null};
}
