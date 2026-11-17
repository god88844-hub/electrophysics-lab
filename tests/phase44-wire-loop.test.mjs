import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyWireAssumptions,gaugeCrossSectionSquareM,evaluateWireLoop} from '../js/evidence/phase44-wire-loop.js';
const a=JSON.parse(readFileSync(new URL('../benchmarks/phase44/copper-harness-assumptions.json',import.meta.url)));
const b=JSON.parse(readFileSync(new URL('../benchmarks/phase41/reference-hardware-candidate.json',import.meta.url)));
const run=(changes={})=>evaluateWireLoop(a,b,{...a.illustrativeExample,...changes});
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<=1e-10,actual+' != '+expected);
test('Copper source at 20C, AWG24 and unknown harness contacts are frozen',()=>{
 assert.equal(verifyWireAssumptions(a,b),true);
 assert.equal(a.measuredConductorLengthM,null);
 assert.equal(a.measuredContactResistanceOhm,null);
 assert.equal(a.actualSourceMatchedPhysicalReadings,0);
});
test('Independent AWG oracle geometry and 20C two-conductor voltage drop',()=>{
 const diameterMM=0.127*Math.pow(92,(36-24)/39);
 const area=Math.PI*(diameterMM/1000)**2/4;
 near(gaugeCrossSectionSquareM(24),area);
 const c=run();
 const copper=(1/58000000)*0.5/area;
 near(c.areaSquareM,area);
 near(c.copperResistanceOhm,copper);
 near(c.contactsSeriesResistanceOhm,0.02);
 near(c.totalSeriesResistanceOhm,copper+0.02);
 near(c.hypotheticalTotalVoltageDropV,copper+0.02);
 near(c.hypotheticalTotalJouleLossW,copper+0.02);
 assert.equal(c.wireTemperatureRisePredictedC,null);
 assert.equal(c.actualCurrentCarryingCapacityA,null);
 assert.equal(c.realWorldBuildSuccessPercent,null);
});
test('Copper resistance rises monotonically with temperature, not a qualified ampacity',()=>{
 const cold=run({wireTemperatureC:0}),base=run(),warm=run({wireTemperatureC:80});
 assert.ok(cold.copperResistanceOhm<base.copperResistanceOhm);
 assert.ok(base.copperResistanceOhm<warm.copperResistanceOhm);
 near(warm.hypotheticalCopperResistivityOhmM,
  (1/58000000)*(1+0.00393*(80-20)));
 assert.equal(warm.actualCurrentCarryingCapacityA,null);
});
test('At zero current resistance can be nonzero but Joule loss must be exactly zero',()=>{
 const c=run({currentA:0});
 near(c.hypotheticalTotalJouleLossW,0);
 near(c.hypotheticalTotalVoltageDropV,0);
 assert.ok(c.totalSeriesResistanceOhm>0);
});
test('At doubled current drop doubles while ohmic dissipation quadruples',()=>{
 const a1=run({currentA:1}),a2=run({currentA:2});
 near(a2.hypotheticalTotalVoltageDropV,2*a1.hypotheticalTotalVoltageDropV);
 near(a2.hypotheticalTotalJouleLossW,4*a1.hypotheticalTotalJouleLossW);
 assert.ok(Object.isFrozen(a2.assumedInputs));
});
test('Reject invalid wire geometry, impossible contacts and outside assumed conditions',()=>{
 for(const x of [
  {eachConductorLengthM:0},{eachConductorLengthM:3},
  {currentA:-1},{currentA:4.1},{currentA:Infinity},
  {wireTemperatureC:-1},{wireTemperatureC:90},
  {contactResistancePerContactOhm:-0.1},
  {contactResistancePerContactOhm:0.051},
  {contactResistancePerContactOhm:NaN}
 ])assert.throws(()=>run(x));
 for(const gauge of [-1,41,24.5,NaN])assert.throws(()=>gaugeCrossSectionSquareM(gauge));
});
test('Changed nominal copper standard, actual wire measurements and invented ampacity refuse verification',()=>{
 const mutators=[
  x=>x.material='superconductor',
  x=>x.proposedWireGaugeAWG=16,
  x=>x.referenceResistivityAt20C_OhmM=1e-10,
  x=>x.resistivityTemperatureCoefficientPerC=0,
  x=>x.temperatureReferenceC=25,
  x=>x.sourceUrl='https://malicious.example/data',
  x=>x.topology='zero-contact-wire',
  x=>x.scenarioEnvelope.currentA=[0,100],
  x=>x.illustrativeExample.eachConductorLengthM=100,
  x=>x.actualWireManufacturerPartNumber='falsified',
  x=>x.actualConnectorPartNumber='falsified',
  x=>x.measuredConductorLengthM=0.25,
  x=>x.measuredContactResistanceOhm=0.001,
  x=>x.actualSourceMatchedPhysicalReadings=10000,
  x=>x.materialValueIsNotLotCertificate=false,
  x=>x.wireHeatingNotTemperatureRise=false,
  x=>x.physicalValidation='qualified',
  x=>x.realWorldBuildSuccessPercent=99
 ];
 for(const mutate of mutators){const x=structuredClone(a);mutate(x);assert.throws(()=>verifyWireAssumptions(x,b));}
});
