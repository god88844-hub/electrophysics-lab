import {test} from 'node:test';
import assert from 'node:assert/strict';
import {simulateWireThermal,simulateSegmentedWireThermal,SEGMENTED_THERMAL_FORMAT}
 from '../js/scene/wire-electrothermal.js';
const spec={material:'copper',lengthMm:100,diameterMm:0.5,temperatureC:20,assumedCurrentA:1};
const env={ambientC:20,heatTransferWm2K:10,durationS:1,stepS:0.001,segments:6};
const approx=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('No current and isothermal wire: no invented heat, exact energy accounting',()=>{
 const s=simulateSegmentedWireThermal({...spec,assumedCurrentA:0},env);
 assert.equal(s.format,SEGMENTED_THERMAL_FORMAT);
 for(const t of s.temperatureBySegmentC)approx(t,20);
 approx(s.jouleEnergyJ,0);approx(s.storedThermalEnergyJ,0);
 assert.equal(s.physicalValidation,'none');assert.equal(s.realWorldBuildSuccessPercent,null);
});
test('Uniform boundary 1D converges to lumped energy and temperature in symmetry case',()=>{
 const a=simulateSegmentedWireThermal(spec,env);
 const b=simulateWireThermal(spec,env);
 approx(a.meanTemperatureC,b.temperatureC,1e-7);
 approx(a.finalMetalResistanceOhm,b.finalResistanceOhm,1e-9);
 approx(a.energyBalanceResidualJ,0,1e-8);
 assert.ok(a.jouleEnergyJ>0);
});
test('End heatsinks create a nonuniform longitudinal temperature and remove energy',()=>{
 const base=simulateSegmentedWireThermal({...spec,assumedCurrentA:2},env);
 const cooled=simulateSegmentedWireThermal({...spec,assumedCurrentA:2},{
  ...env,endAConductanceWPerK:0.01,endBConductanceWPerK:0});
 assert.ok(cooled.temperatureBySegmentC[0]<cooled.temperatureBySegmentC.at(-1));
 assert.ok(cooled.endSinkEnergyJ>0);
 assert.ok(cooled.peakTemperatureC<=base.peakTemperatureC);
 approx(cooled.energyBalanceResidualJ,0,1e-8);
});
test('Insulating jacket reduces exposed cooling and increases temperature',()=>{
 const bare=simulateSegmentedWireThermal({...spec,assumedCurrentA:2},env);
 const jacket=simulateSegmentedWireThermal({...spec,assumedCurrentA:2},{
  ...env,jacketThicknessMm:1,jacketThermalConductivityWmK:0.02});
 assert.ok(jacket.meanTemperatureC>bare.meanTemperatureC);
 assert.ok(jacket.jacketResistanceKWPerSegment>0);
});
test('Contact heat is deposited only at the two conductor ends and accounted for',()=>{
 const base=simulateSegmentedWireThermal(spec,env);
 const contact=simulateSegmentedWireThermal(spec,{...env,contactResistanceOhm:0.01});
 assert.ok(contact.temperatureBySegmentC[0]>contact.temperatureBySegmentC[1]);
 assert.ok(contact.temperatureBySegmentC.at(-1)>contact.temperatureBySegmentC.at(-2));
 assert.ok(contact.finalResistanceOhm>base.finalResistanceOhm);
 approx(contact.energyBalanceResidualJ,0,1e-8);
});
test('Rejects malformed, unstable, expensive and nonphysical input before results',()=>{
 const bad=[
  {...env,segments:1},{...env,segments:33},{...env,segments:2.5},
  {...env,stepS:1},{...env,ambientC:NaN},
  {...env,jacketThicknessMm:-1},{...env,jacketThermalConductivityWmK:0},
  {...env,endAConductanceWPerK:-0.1},{...env,contactResistanceOhm:-1},
  {...env,durationS:3600,stepS:0.001}
 ];
 for(const e of bad)assert.throws(()=>simulateSegmentedWireThermal(spec,e));
 assert.throws(()=>simulateSegmentedWireThermal({...spec,assumedCurrentA:undefined},env),/current/);
});
test('Simulation does not mutate supplied conductor specification or boundaries',()=>{
 const input=structuredClone(spec),conditions=structuredClone(env);
 simulateSegmentedWireThermal(input,conditions);
 assert.deepEqual(input,spec);assert.deepEqual(conditions,env);
});
