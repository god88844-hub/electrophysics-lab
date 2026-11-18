import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/chip/components.js';
import {Diagram} from '../js/core/diagram.js';
import {solveDC} from '../js/labs/chip/engine.js';
import {evaluatePhysicalWire,physicalWireAssumptions,setPhysicalWireAssumption,
 wireMaterials,PHYSICAL_WIRE_MODEL} from '../js/scene/physical-wire.js';
const approx=(a,b)=>assert.ok(Math.abs(a-b)<Math.max(1,Math.abs(b))*1e-10);
function divider(){
 const d=new Diagram({lab:'chip',name:'Physical wire assumptions do not alter circuit solution'});
 const src=d.addBlock('chip.VSOURCE',{params:{mode:'dc',dc:10}});
 const r1=d.addBlock('chip.RES',{params:{r:1000}});
 const r2=d.addBlock('chip.RES',{params:{r:2000}});
 const g=d.addBlock('chip.GND');
 const m=d.addBlock('chip.VOLTMETER');
 d.connect(src.id,'p',r1.id,'p');
 d.connect(r1.id,'n',r2.id,'p');
 d.connect(r2.id,'n',g.id,'g');
 d.connect(r1.id,'n',m.id,'p');
 d.connect(src.id,'n',g.id,'g');
 return {d,m};
}
test('Physical conductor equation uses explicit SI dimensions, copper nominal material',()=>{
 const model=evaluatePhysicalWire({material:'copper',lengthMm:100,
  diameterMm:.5,temperatureC:20,assumedCurrentA:3});
 const R=1.68e-8*0.1/(Math.PI*(.0005**2)/4);
 approx(model.resistanceOhm,R);approx(model.voltageDropV,3*R);
 approx(model.dissipatedPowerW,9*R);
 assert.equal(model.physicalValidation,'none');
 assert.equal(model.contactResistanceIncluded,false);
 assert.equal(model.thermalCouplingIncluded,false);
 assert.equal(model.realWorldBuildSuccessPercent,null);
});
test('Temperature and material change the assumed wire estimate without fabricated calibration',()=>{
 const base={material:'copper',lengthMm:250,diameterMm:1,temperatureC:20};
 const hot=evaluatePhysicalWire({...base,temperatureC:100});
 approx(hot.resistanceOhm/evaluatePhysicalWire(base).resistanceOhm,1+.00393*80);
 const aluminum=evaluatePhysicalWire({...base,material:'aluminum'});
 assert.ok(aluminum.resistanceOhm>evaluatePhysicalWire(base).resistanceOhm);
 assert.ok(Object.keys(wireMaterials()).includes('copper'));
});
test('Explicit current can be absent; no voltage-drop or heating estimate is invented',()=>{
 const r=evaluatePhysicalWire({material:'aluminum',lengthMm:30,diameterMm:1,temperatureC:20});
 assert.equal('assumedCurrentA' in r,false);
 assert.equal('voltageDropV' in r,false);
 assert.equal('dissipatedPowerW' in r,false);
});
test('Input validation rejects invalid geometry/current/material without NaN',()=>{
 const valid={material:'copper',lengthMm:100,diameterMm:.5,temperatureC:20};
 for(const v of [{...valid,lengthMm:0},{...valid,diameterMm:-1},
   {...valid,material:'gold'},{...valid,assumedCurrentA:-1},
   {...valid,temperatureC:Infinity},{...valid,diameterMm:NaN}]){
  assert.throws(()=>evaluatePhysicalWire(v));
 }
 assert.throws(()=>evaluatePhysicalWire(null));
});
test('Stored physical assumptions bind to real canonical wire and survive design JSON save',()=>{
 const {d}=divider();const w=d.wires[0],before=solveDC(d);
 assert.equal(before.ok,true);
 assert.equal(physicalWireAssumptions(d).status,'no-input');
 setPhysicalWireAssumption(d,w.id,{material:'copper',lengthMm:100,
  diameterMm:.5,temperatureC:20,assumedCurrentA:1});
 const report=physicalWireAssumptions(d);
 assert.equal(report.qualified,false);assert.equal(report.simulationLinked,false);
 assert.equal(report.wires.length,1);
 assert.equal(report.wires[0].id,w.id);
 assert.equal(d.meta.physicalLayout.format,PHYSICAL_WIRE_MODEL);
 const cloned=Diagram.fromJSON(d.toJSON());
 assert.deepEqual(cloned.toJSON(),d.toJSON());
 approx(physicalWireAssumptions(cloned).wires[0].resistanceOhm,report.wires[0].resistanceOhm);
 const after=solveDC(d);
 assert.equal(after.ok,true);
 assert.deepEqual(after.meters,before.meters);
 assert.deepEqual(after.elements,before.elements);
});
test('Rejects spoofed wires, stale IDs and invalid measurements without mutating original design',()=>{
 const {d}=divider(),before=JSON.stringify(d.toJSON());
 assert.throws(()=>setPhysicalWireAssumption(d,'not-a-real-wire',{
  material:'copper',lengthMm:20,diameterMm:1,temperatureC:20}),/Unknown canonical/);
 assert.equal(JSON.stringify(d.toJSON()),before);
 assert.throws(()=>setPhysicalWireAssumption(d,d.wires[0].id,{
  material:'copper',lengthMm:0,diameterMm:1,temperatureC:20}));
 assert.equal(JSON.stringify(d.toJSON()),before);
 setPhysicalWireAssumption(d,d.wires[0].id,{
  material:'copper',lengthMm:20,diameterMm:1,temperatureC:20});
 d.disconnect(d.wires[0].id);
 assert.throws(()=>physicalWireAssumptions(d),/Stale physical wire ID/);
});
