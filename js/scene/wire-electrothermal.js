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
