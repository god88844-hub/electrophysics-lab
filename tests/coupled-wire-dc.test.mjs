import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/chip/components.js';
import {Diagram} from '../js/core/diagram.js';
import {solveDC} from '../js/labs/chip/engine.js';
import {setPhysicalWireAssumption,evaluatePhysicalWire} from '../js/scene/physical-wire.js';
import {setCADEnvelope} from '../js/scene/dimensioned-cad.js';
import {inspectConductorClearances} from '../js/scene/cad-wire-clearance.js';
import {solveCoupledWireDC} from '../js/scene/coupled-wire-dc.js';
const env={ambientC:20,heatTransferWm2K:10,contactResistanceOhm:0,durationS:.1,stepS:.01};
const wire={material:'copper',lengthMm:100,diameterMm:.5,temperatureC:20,assumedCurrentA:42};
const approx=(a,b,eps=1e-7)=>assert.ok(Math.abs(a-b)<=eps,String(a)+' != '+String(b));
function circuit({voltage=10,loadOhm=10}={}){
 const d=new Diagram({lab:'chip',name:'series loaded wire physical coupling'});
 const supply=d.addBlock('chip.VSOURCE',{params:{mode:'dc',dc:voltage}});
 const load=d.addBlock('chip.RES',{params:{r:loadOhm}});
 const ground=d.addBlock('chip.GND');
 d.connect(supply.id,'p',load.id,'p');
 d.connect(load.id,'n',ground.id,'g');
 d.connect(supply.id,'n',ground.id,'g');
 for(const w of d.wires)setPhysicalWireAssumption(d,w.id,wire);
 return {d,supply,load,ground};
}
test('Augmented Chip Lab MNA gives physically series-adjusted DC current, not assumed wire current',()=>{
 const {d}=circuit();
 const original=JSON.stringify(d.toJSON()),base=solveDC(d);
 assert.equal(base.ok,true);
 const result=solveCoupledWireDC(d,env);
 assert.equal(result.status,'model-only');
 assert.equal(result.canonicalWireMapping.length,3);
 assert.equal(result.wires.length,3);
 assert.equal(result.modelAssumptions.sourceCurrentFromActualAugmentedMNA,true);
 const r=evaluatePhysicalWire(wire).resistanceOhm,expected=10/(10+3*r);
 for(const w of result.records[0].wires)
  approx(Math.abs(w.currentA),expected,2e-6);
 assert.ok(Math.abs(result.records[0].wires[0].currentA)<1.01);
 assert.equal(result.physicalValidation,'none');
 assert.equal(result.calibrated,false);
 assert.equal(result.realWorldBuildSuccessPercent,null);
 assert.equal(JSON.stringify(d.toJSON()),original);
 assert.deepEqual(solveDC(d),base);
});
test('Electrothermal wire changes resistance and includes power/energy from recomputed MNA currents',()=>{
 const {d}=circuit({loadOhm:1});
 const result=solveCoupledWireDC(d,{...env,durationS:1,stepS:.01});
 assert.ok(result.records.length>3);
 for(const w of result.wires){
  assert.ok(w.finalTemperatureC>w.initialTemperatureC);
  assert.ok(w.finalResistanceOhm>w.initialResistanceOhm);
  assert.ok(w.jouleEnergyJ>0);
  assert.ok(Math.abs(w.energyBalanceResidualJ)<1e-7);
  assert.equal(w.crossesTemperatureLimit,false);
 }
 const start=Math.abs(result.records[0].wires[0].currentA);
 const end=Math.abs(result.records.at(-1).wires[0].currentA);
 assert.ok(end<start,'Electrical current must reflect hotter conductor resistance');
 approx(result.records.at(-1).timeS,1,1e-8);
 assert.equal(result.augmentedCircuit.analysis,'dc');
});
test('Conductor resistance and user-declared contact resistance affect electrical solution',()=>{
 const {d}=circuit({loadOhm:2});
 const pure=solveCoupledWireDC(d,env);
 const contacts=solveCoupledWireDC(d,{...env,contactResistanceOhm:.05});
 assert.ok(Math.abs(contacts.records[0].wires[0].currentA)<
  Math.abs(pure.records[0].wires[0].currentA));
 assert.ok(contacts.records[0].wires[0].resistanceOhm>
  pure.records[0].wires[0].resistanceOhm);
 assert.equal(contacts.modelAssumptions.assumedContactHeatDepositedInWire,true);
});
test('Geometric body-gap lower bound rejects impossible specified conductor length',()=>{
 const {d,supply,load}=circuit();
 setCADEnvelope(d,supply.id,{xMm:0,yMm:0,zMm:0,widthMm:10,heightMm:10,depthMm:10});
 setCADEnvelope(d,load.id,{xMm:100,yMm:0,zMm:0,widthMm:10,heightMm:10,depthMm:10});
 const wireId=d.wires[0].id;
 setPhysicalWireAssumption(d,wireId,{...wire,lengthMm:50});
 const report=inspectConductorClearances(d);
 assert.ok(report.impossible.includes(wireId));
 assert.equal(report.physicallyRouted,false);
 assert.throws(()=>solveCoupledWireDC(d,env),/shorter than minimum CAD body separation/);
 setPhysicalWireAssumption(d,wireId,{...wire,lengthMm:120});
 const valid=inspectConductorClearances(d);
 assert.equal(valid.impossible.length,0);
 assert.ok(valid.wiresNotChecked.length>0);
 assert.equal(solveCoupledWireDC(d,env).geometryClearance.physicalPinCoordinatesKnown,false);
});
test('Fail closed on incomplete dimensional wire assumptions and non-DC devices',()=>{
 const {d}=circuit();d.meta.physicalLayout.wires={};
 assert.throws(()=>solveCoupledWireDC(d,env),/Every canonical wire/);
 const a=circuit();a.supply.params.mode='sine';
 assert.throws(()=>solveCoupledWireDC(a.d,env),/DC mode/);
 const b=circuit();b.d.addBlock('chip.DIODE');
 assert.throws(()=>solveCoupledWireDC(b.d,env),/only resistors/);
 const c=new Diagram({lab:'logic'});
 assert.throws(()=>solveCoupledWireDC(c,env),/Chip Lab/);
});
test('Unstable integration, missing conditions and corrupt metadata leave the canonical design intact',()=>{
 const {d}=circuit(),original=JSON.stringify(d.toJSON());
 for(const bad of [null,{...env,stepS:10},{...env,durationS:100},
  {...env,ambientC:Infinity},{...env,heatTransferWm2K:0},
  {...env,contactResistanceOhm:-1}]){
  assert.throws(()=>solveCoupledWireDC(d,bad));
  assert.equal(JSON.stringify(d.toJSON()),original);
 }
});
test('Zero supply current produces no fictitious wire heat and preserves build-unknown',()=>{
 const {d}=circuit({voltage:0});
 const r=solveCoupledWireDC(d,env);
 for(const x of r.wires){
  approx(x.finalTemperatureC,20,1e-8);
  assert.ok(x.jouleEnergyJ<1e-12);
 }
 assert.equal(r.independentPhysicalEvidence,'none');
});
test('A reserved synthetic resistor ID collision fails without corrupting original design',()=>{
 const {d,load}=circuit();
 const old=load.id;load.id='__physical_r_0';
 for(const w of d.wires){if(w.from.block===old)w.from.block=load.id;
  if(w.to.block===old)w.to.block=load.id;}
 const before=JSON.stringify(d.toJSON());
 assert.throws(()=>solveCoupledWireDC(d,env),/reserved physical resistor component ID collision/i);
 assert.equal(JSON.stringify(d.toJSON()),before);
});
