import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/chip/components.js';
import {Diagram} from '../js/core/diagram.js';
import {solveDC} from '../js/labs/chip/engine.js';
import {setCADEnvelope,dimensionedAssembly} from '../js/scene/dimensioned-cad.js';
import {setPhysicalWireAssumption} from '../js/scene/physical-wire.js';
import {setPhysicalTerminal,setPhysicalHarness,inspectPhysicalHarnesses,
 PHYSICAL_ROUTING_FORMAT} from '../js/scene/physical-routing.js';
import {inspectConductorClearances} from '../js/scene/cad-wire-clearance.js';
import {detailedCADMesh,physicalComponentStyle} from '../js/scene/detailed-cad-mesh.js';
import {solveCoupledWireDC} from '../js/scene/coupled-wire-dc.js';
const spec={material:'copper',lengthMm:200,diameterMm:.6,temperatureC:20};
const env={ambientC:20,heatTransferWm2K:10,contactResistanceOhm:0,durationS:.05,stepS:.005};
const at=(xMm,yMm,zMm)=>({xMm,yMm,zMm});
function circuit(){
 const d=new Diagram({lab:'chip',name:'Physical terminal and 3D cable geometry'});
 const src=d.addBlock('chip.VSOURCE',{params:{mode:'dc',dc:5}});
 const res=d.addBlock('chip.RES',{params:{r:10}});
 const ground=d.addBlock('chip.GND');
 const a=d.connect(src.id,'p',res.id,'p');
 const b=d.connect(res.id,'n',ground.id,'g');
 const c=d.connect(src.id,'n',ground.id,'g');
 setCADEnvelope(d,src.id,{...at(0,0,0),widthMm:20,heightMm:10,depthMm:16});
 setCADEnvelope(d,res.id,{...at(60,0,0),widthMm:20,heightMm:10,depthMm:16});
 setCADEnvelope(d,ground.id,{...at(60,0,60),widthMm:20,heightMm:10,depthMm:16});
 for(const w of d.wires)setPhysicalWireAssumption(d,w.id,spec);
 return {d,src,res,ground,a,b,c};
}
function anchors(c){
 const {d,src,res,ground}=c;
 setPhysicalTerminal(d,src.id,'p',at(10,5,0));
 setPhysicalTerminal(d,res.id,'p',at(-10,5,0));
 setPhysicalTerminal(d,res.id,'n',at(0,5,8));
 setPhysicalTerminal(d,ground.id,'g',at(0,5,-8));
 setPhysicalTerminal(d,src.id,'n',at(0,5,8));
 return c;
}
test('Explicit terminal save validates canonical port, mm dimensional face and JSON round-trip',()=>{
 const c=circuit(),{d,src}=c,original=JSON.stringify(d.toJSON());
 for(const candidate of [at(0,5,0),at(11,5,0),at(10,11,0),
  at(Infinity,5,0),at(10,NaN,0),null]){
  assert.throws(()=>setPhysicalTerminal(d,src.id,'p',candidate));
  assert.equal(JSON.stringify(d.toJSON()),original);
 }
 assert.throws(()=>setPhysicalTerminal(d,src.id,'made-up',at(10,5,0)),/canonical/);
 assert.throws(()=>setPhysicalTerminal(d,'fake','p',at(10,5,0)),/canonical/);
 const p=setPhysicalTerminal(d,src.id,'p',at(10,5,0));
 assert.deepEqual(p,at(10,5,0));
 assert.equal(d.meta.physicalRouting.format,PHYSICAL_ROUTING_FORMAT);
 assert.deepEqual(Diagram.fromJSON(d.toJSON()).toJSON(),d.toJSON());
 const report=inspectPhysicalHarnesses(d);
 assert.equal(report.terminals.length,1);
 assert.deepEqual(report.terminals[0].globalMm,at(10,5,0));
 assert.equal(report.physicalValidation,'none');
 assert.equal(report.realWorldBuildSuccessPercent,null);
});
test('A routed 3D conductor records real mm path, excess slack and power-model exclusion',()=>{
 const c=anchors(circuit()),{d,a}=c;
 const baseline=solveDC(d),source=JSON.stringify(d.toJSON());
 const path=setPhysicalHarness(d,a.id,[]);
 assert.equal(path.routedLengthMm,40);
 assert.equal(path.enteredConductorLengthMm,200);
 assert.equal(path.excessLengthMm,160);
 assert.equal(path.pointsMm.length,2);
 assert.equal(path.violations.length,0);
 const report=inspectPhysicalHarnesses(d);
 assert.equal(report.routes.length,1);
 assert.equal(report.missingRoutes.length,2);
 assert.equal(report.status,'partial');
 assert.equal(report.physicallyManufactured,false);
 assert.deepEqual(solveDC(d),baseline);
 assert.notEqual(JSON.stringify(d.toJSON()),source);
 assert.deepEqual(inspectPhysicalHarnesses(Diagram.fromJSON(d.toJSON())),report);
 const clearance=inspectConductorClearances(d);
 assert.equal(clearance.explicitPolylineRoutes,1);
 assert.equal(clearance.checks.find(x=>x.wireId===a.id).minimumRequiredLengthMm,40);
 assert.equal(clearance.checks.find(x=>x.wireId===a.id).physicalPinsMapped,true);
 assert.equal(clearance.physicallyRouted,false);
 const cloneBefore=JSON.stringify(d.toJSON());
 const coupled=solveCoupledWireDC(d,env);
 assert.equal(coupled.geometryClearance.explicitPolylineRoutes,1);
 assert.equal(coupled.physicalValidation,'none');
 assert.equal(JSON.stringify(d.toJSON()),cloneBefore);
});
test('Polyline with user-authored waypoints has correct 3D Euclidean length',()=>{
 const c=anchors(circuit()),{d,a}=c;
 const path=setPhysicalHarness(d,a.id,[at(10,5,30),at(50,5,30)]);
 assert.ok(Math.abs(path.routedLengthMm-100)<1e-10);
 assert.equal(path.pointsMm.length,4);
 assert.equal(path.excessLengthMm,100);
 assert.equal(path.routingSource,'user-authored-mm-polyline');
 assert.equal(inspectPhysicalHarnesses(d).invalidIds.length,0);
});
test('Shorter-than-path conductor is rejected without mutation',()=>{
 const c=anchors(circuit()),{d,a}=c;
 setPhysicalWireAssumption(d,a.id,{...spec,lengthMm:35});
 const before=JSON.stringify(d.toJSON());
 assert.throws(()=>setPhysicalHarness(d,a.id,[]),/shorter-than-routed-path/);
 assert.equal(JSON.stringify(d.toJSON()),before);
 assert.equal(inspectPhysicalHarnesses(d).routes.length,0);
});
test('Routed cable cannot traverse a foreign component body',()=>{
 const c=anchors(circuit()),{d,a}=c;
 const obstacle=d.addBlock('chip.CAP');
 setCADEnvelope(d,obstacle.id,{...at(30,0,0),widthMm:10,heightMm:10,depthMm:10});
 const before=JSON.stringify(d.toJSON());
 assert.throws(()=>setPhysicalHarness(d,a.id,[]),/intersects-foreign-component-body/);
 assert.equal(JSON.stringify(d.toJSON()),before);
 const detour=setPhysicalHarness(d,a.id,[at(10,5,20),at(50,5,20)]);
 assert.equal(detour.obstacleIds.length,0);
 assert.ok(detour.routedLengthMm>40);
});
test('Moved envelope invalidates an existing physical route without silently qualifying it',()=>{
 const c=anchors(circuit()),{d,res,a}=c;
 setPhysicalHarness(d,a.id,[]);
 setCADEnvelope(d,res.id,{...at(260,0,0),widthMm:20,heightMm:10,depthMm:16});
 const r=inspectPhysicalHarnesses(d);
 assert.ok(r.invalidIds.includes(a.id));
 const before=JSON.stringify(d.toJSON());
 assert.throws(()=>solveCoupledWireDC(d,env),/shorter than minimum CAD body separation/);
 assert.equal(JSON.stringify(d.toJSON()),before);
});
test('Stale pin IDs, impossible envelope changes and stale canonical wire routes fail closed',()=>{
 const c=anchors(circuit()),{d,a,src}=c;
 setPhysicalHarness(d,a.id,[]);
 const malformed=d.clone();
 malformed.meta.physicalRouting.terminals['["ghost","x"]']=at(1,0,0);
 assert.throws(()=>inspectPhysicalHarnesses(malformed),/forged/);
 const stale=d.clone();stale.disconnect(a.id);
 assert.throws(()=>inspectPhysicalHarnesses(stale),/Stale physical route/);
 const moved=d.clone();
 setCADEnvelope(moved,src.id,{...at(0,0,0),widthMm:8,heightMm:6,depthMm:6});
 assert.throws(()=>inspectPhysicalHarnesses(moved),/outside the component envelope/);
 assert.equal(inspectPhysicalHarnesses(d).routes.length,1);
});
test('Stored route coordinate validation and safety budgets reject corrupt geometry',()=>{
 const c=anchors(circuit()),{d,a}=c,before=JSON.stringify(d.toJSON());
 const badRoutes=[[at(0,-1,0)],[at(NaN,1,1)],[at(1001,1,1)],
  Array.from({length:13},(_,i)=>at(i,4,i))];
 for(const route of badRoutes){
  assert.throws(()=>setPhysicalHarness(d,a.id,route));
  assert.equal(JSON.stringify(d.toJSON()),before);
 }
 assert.throws(()=>setPhysicalHarness(d,a.id,'not-array'));
 assert.equal(inspectPhysicalHarnesses(d).status,'partial');
});
test('Distinct true-scale hardware proxies and copper wires use user-entered 3D geometry',()=>{
 const c=anchors(circuit()),{d,a}=c;
 setPhysicalHarness(d,a.id,[]);
 const report=dimensionedAssembly(d),routing=inspectPhysicalHarnesses(d);
 const mesh=detailedCADMesh(report,{selectedId:c.src.id,routing});
 assert.equal(mesh.kinds['power-supply'],1);
 assert.equal(mesh.kinds['axial-resistor'],1);
 assert.equal(mesh.kinds['terminal-lug'],1);
 assert.equal(mesh.harnessCount,1);
 assert.equal(mesh.terminalCount,5);
 assert.ok(mesh.triangles.length>1000);
 assert.ok(mesh.triangles.every(Number.isFinite));
 assert.equal(mesh.cadEnvelopeOnly,true);
 assert.equal(mesh.scaleMmPerWorld,20);
 assert.equal(mesh.manufacturerCAD,false);
 assert.equal(mesh.physicalValidation,'none');
 assert.equal(physicalComponentStyle('chip.CAP'),'electrolytic-capacitor');
 assert.equal(physicalComponentStyle('chip.DIODE'),'axial-diode');
 assert.equal(physicalComponentStyle('chip.NMOS'),'transistor-package');
 assert.equal(physicalComponentStyle('chip.VOLTMETER'),'instrument');
 assert.equal(physicalComponentStyle('logic.NOT'),'circuit-board');
 assert.equal(physicalComponentStyle('chip.MOTOR'),'fan');
});
test('Wire diameter and entered 3D waypoints affect mesh, not source schematic',()=>{
 const c=anchors(circuit()),{d,a}=c,unchanged=solveDC(d);
 setPhysicalHarness(d,a.id,[]);
 const first=detailedCADMesh(dimensionedAssembly(d),{routing:inspectPhysicalHarnesses(d)});
 setPhysicalWireAssumption(d,a.id,{...spec,diameterMm:1.5});
 const second=detailedCADMesh(dimensionedAssembly(d),{routing:inspectPhysicalHarnesses(d)});
 assert.notDeepEqual(first.triangles,second.triangles);
 assert.deepEqual(solveDC(d),unchanged);
 assert.equal(second.physicalValidation,'none');
});
