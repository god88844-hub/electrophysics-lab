import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/chip/components.js';
import '../js/labs/logic/components.js';
import '../js/labs/quantum/components.js';
import {Diagram} from '../js/core/diagram.js';
import {solveDC,runTransient} from '../js/labs/chip/engine.js';
import {runLogic} from '../js/labs/logic/engine.js';
import {quantumLab} from '../js/labs/quantum/lab.js';
import {captureExperimentTrace,isExperimentCurrent,experimentReadingsAt,
 exportExperimentRecord} from '../js/scene/experiment-trace.js';
function divider(){
 const d=new Diagram({lab:'chip',name:'DC physical-model demonstration'});
 const src=d.addBlock('chip.VSOURCE',{params:{mode:'dc',dc:10}});
 const r1=d.addBlock('chip.RES',{params:{r:1000},x:120});
 const r2=d.addBlock('chip.RES',{params:{r:2000},x:240});
 const g=d.addBlock('chip.GND',{x:360});
 const m=d.addBlock('chip.VOLTMETER',{params:{name:'vout'},x:480});
 d.connect(src.id,'p',r1.id,'p');d.connect(r1.id,'n',r2.id,'p');
 d.connect(r2.id,'n',g.id,'g');d.connect(r1.id,'n',m.id,'p');
 d.connect(src.id,'n',g.id,'g');return {d,m};
}
function transient(){
 const d=new Diagram({lab:'chip',meta:{analysis:'tran'}});
 const src=d.addBlock('chip.VSOURCE',{params:{mode:'dc',dc:5}});
 const r=d.addBlock('chip.RES',{params:{r:1000}});
 const c=d.addBlock('chip.CAP',{params:{c:1e-7,vInit:0}});
 const g=d.addBlock('chip.GND');
 const m=d.addBlock('chip.VOLTMETER');
 d.connect(src.id,'p',r.id,'p');d.connect(r.id,'n',c.id,'p');
 d.connect(c.id,'n',g.id,'g');d.connect(src.id,'n',g.id,'g');
 d.connect(r.id,'n',m.id,'p');
 return {d,m};
}
test('Chip DC view displays actual meter output and measured-style units without claiming physical measurement',()=>{
 const {d,m}=divider(),r=solveDC(d);assert.equal(r.ok,true);
 const t=captureExperimentTrace(d,r);
 assert.equal(t.status,'ready');assert.deepEqual(t.axis,[0]);
 assert.equal(t.analysis,'dc');assert.equal(t.evidence.realWorldBuildSuccessPercent,null);
 assert.equal(t.evidence.physicalValidation,'none');
 const reading=experimentReadingsAt(t,0,{selectedBlockId:m.id})[0];
 assert.equal(reading.unit,'V');assert.ok(Math.abs(reading.value-20/3)<1e-7);
 assert.equal(isExperimentCurrent(t,d),true);
 const saved=exportExperimentRecord(t,d);
 assert.equal(saved.sourceDesign.lab,'chip');assert.equal(saved.trace.source,t.source);
 assert.equal(saved.evidence.realWorldBuildSuccessPercent,null);
});
test('Transient trace contains bounded time axis, source current readings and design-specific validity',()=>{
 const {d,m}=transient(),r=runTransient(d,{tstop:5e-4,dt:1e-6});
 assert.equal(r.ok,true,r.problems?.join('; '));
 const t=captureExperimentTrace(d,r);
 assert.equal(t.status,'ready');assert.equal(t.axisUnit,'s');
 assert.equal(t.axis.length,Math.min(r.t.length,512));
 const v=t.tracks.find(x=>x.blockId===m.id);
 assert.ok(v&&v.values.length===t.axis.length);
 assert.ok(v.values.at(-1)>4.8);
 d.block(m.id).params.name='changed';
 assert.equal(isExperimentCurrent(t,d),false);
 assert.throws(()=>exportExperimentRecord(t,d),/Design changed/);
});
test('Logic trace replays recorded event transitions rather than invented voltage',()=>{
 const d=new Diagram({lab:'logic',meta:{radix:4}});
 const input=d.addBlock('logic.IN',{params:{value:3}});
 const probe=d.addBlock('logic.PROBE');
 d.connect(input.id,'out',probe.id,'in');
 const result=runLogic(d);assert.equal(result.ok,true);
 const t=captureExperimentTrace(d,result);
 assert.equal(t.status,'ready');assert.equal(t.axisUnit,'simulated ticks');
 assert.equal(t.analysis,'event-simulation');
 assert.equal(t.tracks.find(x=>x.blockId===probe.id).values.at(-1),3);
 assert.equal(t.evidence.realWorldBuildSuccessPercent,null);
});
test('Quantum trace shows theoretical state probabilities, not physical qubit fidelity',()=>{
 const d=new Diagram({lab:'quantum',meta:{d:2,shots:1000,seed:42}});
 d.addBlock('quantum.WIRE');
 const result=quantumLab.run(d);
 assert.equal(result.ok,true,result.problems?.join('; '));
 const t=captureExperimentTrace(d,result);
 assert.equal(t.status,'ready');
 assert.equal(t.quantumShotCount,1000);
 assert.equal(t.tracks[0].kind,'quantum-theory');
 assert.equal(t.tracks[0].value,undefined);
 assert.equal(t.evidence.independentPhysicalMeasurements,'NOT_ESTABLISHED');
});
test('Never turns unsuccessful runs or malformed numeric values into successful replay',()=>{
 const {d,m}=divider();
 const failed=captureExperimentTrace(d,{ok:false,problems:['No ground']});
 assert.equal(failed.status,'unavailable');
 assert.equal(failed.tracks.length,0);
 assert.throws(()=>exportExperimentRecord(failed,d),/no successful experiment/);
 const valid=solveDC(d);
 valid.meters[m.id]=NaN;
 assert.throws(()=>captureExperimentTrace(d,valid),/Non-finite/);
});
test('Missing instruments mean no readings, not an invented success percentage',()=>{
 const d=new Diagram({lab:'logic'});
 const input=d.addBlock('logic.IN');
 const trace=captureExperimentTrace(d,runLogic(d));
 assert.equal(trace.status,'no-readings');
 assert.equal(trace.evidence.physicalValidation,'none');
 assert.equal(trace.evidence.realWorldBuildSuccessPercent,null);
});
