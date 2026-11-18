import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/chip/components.js';
import {Diagram} from '../js/core/diagram.js';
import {setCADEnvelope,dimensionedAssembly,dimensionedCADMesh,CAD_MM_PER_WORLD}
 from '../js/scene/dimensioned-cad.js';
import {simulateWireThermal} from '../js/scene/wire-electrothermal.js';
import {compareWireMeasurements} from '../js/scene/wire-measurement-check.js';
import {evaluatePhysicalWire} from '../js/scene/physical-wire.js';
const near=(a,b,err=1e-9)=>assert.ok(Math.abs(a-b)<=err,String(a)+' != '+String(b));
const conductor={material:'copper',lengthMm:100,diameterMm:.5,temperatureC:20,assumedCurrentA:2};
const env={ambientC:20,heatTransferWm2K:30,durationS:3,stepS:.005};
function diagram(){
 const d=new Diagram({lab:'chip'});
 const a=d.addBlock('chip.RES'),b=d.addBlock('chip.GND');
 return {d,a,b};
}
test('Explicit mm assembly envelopes and geometry scale are versioned and JSON-stable',()=>{
 const {d,a,b}=diagram();
 assert.equal(dimensionedAssembly(d).status,'no-input');
 setCADEnvelope(d,a.id,{xMm:40,yMm:0,zMm:20,widthMm:20,heightMm:10,depthMm:12});
 setCADEnvelope(d,b.id,{xMm:80,yMm:0,zMm:20,widthMm:20,heightMm:10,depthMm:12});
 const r=dimensionedAssembly(d),mesh=dimensionedCADMesh(r);
 assert.equal(r.missing.length,0);
 assert.equal(r.overlaps.length,0);
 assert.equal(r.parts[0].xMm,40);
 assert.equal(mesh.scaleMmPerWorld,CAD_MM_PER_WORLD);
 assert.equal(mesh.physicalValidation,'none');
 assert.equal(mesh.cadEnvelopeOnly,true);
 assert.equal(mesh.triangles.length,216*2);
 assert.ok(mesh.triangles.every(Number.isFinite));
 assert.deepEqual(Diagram.fromJSON(d.toJSON()).toJSON(),d.toJSON());
 assert.equal(dimensionedAssembly(Diagram.fromJSON(d.toJSON())).parts.length,2);
});
test('Collision is reported, not converted to build success',()=>{
 const {d,a,b}=diagram();
 setCADEnvelope(d,a.id,{xMm:0,yMm:0,zMm:0,widthMm:20,heightMm:10,depthMm:10});
 setCADEnvelope(d,b.id,{xMm:5,yMm:3,zMm:0,widthMm:20,heightMm:10,depthMm:10});
 assert.equal(dimensionedAssembly(d).overlaps.length,1);
 assert.equal(dimensionedAssembly(d).qualification,'unverified');
});
test('CAD spoofing invalid bounds, stale blocks, and wrong metadata are rejected',()=>{
 const {d,a}=diagram();
 const spec={xMm:0,yMm:0,zMm:0,widthMm:20,heightMm:10,depthMm:10};
 const before=JSON.stringify(d.toJSON());
 for(const v of [{...spec,widthMm:0},{...spec,xMm:NaN},
  {...spec,heightMm:301},{...spec,yMm:-1},{...spec,zMm:Infinity}]){
  assert.throws(()=>setCADEnvelope(d,a.id,v));
  assert.equal(JSON.stringify(d.toJSON()),before);
 }
 assert.throws(()=>setCADEnvelope(d,'forged',spec));
 setCADEnvelope(d,a.id,spec);d.removeBlock(a.id);
 assert.throws(()=>dimensionedAssembly(d),/Stale CAD/);
});
test('Current-free conductor cannot silently heat and solver is not coupled',()=>{
 assert.throws(()=>simulateWireThermal({...conductor,assumedCurrentA:undefined},env),/current/);
 const zero=simulateWireThermal({...conductor,assumedCurrentA:0},env);
 near(zero.temperatureC,20,1e-8);
 assert.equal(zero.solverLinked,false);
 assert.equal(zero.calibrated,false);
 assert.equal(zero.physicalValidation,'none');
 assert.equal(zero.realWorldBuildSuccessPercent,null);
});
test('Electrothermal solution obeys zero-heat convection and expected thermal mass',()=>{
 const result=simulateWireThermal(conductor,env);
 assert.ok(result.temperatureC>20);
 assert.ok(result.peakTemperatureC>=result.temperatureC);
 assert.ok(result.thermalCapacityJK>0);
 assert.equal(result.records[0].timeS,0);
 near(result.records.at(-1).timeS,3,1e-9);
 assert.ok(result.finalResistanceOhm>evaluatePhysicalWire(conductor).resistanceOhm);
 const low=simulateWireThermal({...conductor,assumedCurrentA:1},env);
 assert.ok(result.temperatureC>low.temperatureC);
 const cooled=simulateWireThermal({...conductor,temperatureC:60,assumedCurrentA:0},env);
 assert.ok(cooled.temperatureC<60&&cooled.temperatureC>20);
});
test('Thermal adversarial stability and nonphysical parameters fail closed',()=>{
 for(const v of [{...env,stepS:60},{...env,ambientC:Infinity},
  {...env,heatTransferWm2K:0},{...env,durationS:-1},
  {...env,contactResistanceOhm:-1}]){
  assert.throws(()=>simulateWireThermal(conductor,v));
 }
 const unstable={...env,heatTransferWm2K:1000,stepS:60};
 assert.throws(()=>simulateWireThermal(conductor,unstable));
});
test('Real measured observations are compared without fitting on a holdout',()=>{
 const measurement=evaluatePhysicalWire(conductor).resistanceOhm;
 const rows=[
  {id:'cal-1',spec:conductor,observedOhm:measurement+.001},
  {id:'blind-2',spec:conductor,observedOhm:measurement-.002}
 ];
 const report=compareWireMeasurements(rows,{
  source:'dated raw independent bench record #42',
  instrument:'four-wire ohmmeter serial 55',
  uncertaintyOhm:.001,holdoutIds:['blind-2']});
 near(report.development.meanAbsoluteErrorOhm,.001,1e-12);
 near(report.holdout.rootMeanSquareErrorOhm,.002,1e-12);
 assert.equal(report.calibrationPerformed,false);
 assert.equal(report.modelParametersFitted,false);
 assert.equal(report.independentProvenanceAuthenticated,false);
 assert.equal(report.physicalValidation,'unverified-user-supplied-data');
 assert.equal(report.realWorldBuildSuccessPercent,null);
 assert.equal(report.rows[1].role,'holdout');
});
test('No source, no holdout, duplicate rows or fake measurement number is rejected',()=>{
 const spec=conductor,row={id:'a',spec,observedOhm:.1},row2={...row,id:'b'};
 const meta={source:'dated raw independent bench record #42',instrument:'meter 1',
  uncertaintyOhm:.001,holdoutIds:['b']};
 assert.throws(()=>compareWireMeasurements([row,row2],{...meta,holdoutIds:[]}));
 assert.throws(()=>compareWireMeasurements([row,row],meta));
 assert.throws(()=>compareWireMeasurements([row,row2],{...meta,source:'fake'}));
 assert.throws(()=>compareWireMeasurements([row,row2],{...meta,holdoutIds:['z']}));
 assert.throws(()=>compareWireMeasurements([row,{...row2,observedOhm:NaN}],meta));
});
