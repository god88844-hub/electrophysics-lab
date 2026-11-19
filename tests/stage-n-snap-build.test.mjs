import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/chip/components.js';
import {Diagram} from '../js/core/diagram.js';
import {setCADEnvelope,dimensionedAssembly} from '../js/scene/dimensioned-cad.js';
import {setPhysicalWireAssumption} from '../js/scene/physical-wire.js';
import {setPhysicalTerminal,inspectPhysicalHarnesses} from '../js/scene/physical-routing.js';
import {snapMillimetres,planSnapPart,commitSnapPart,manhattanCandidates,
 commitAutoManhattanHarness} from '../js/scene/stage-n-snap-build.js';
function design(){
 const d=new Diagram({lab:'chip',name:'Stage N physical-mm test'});
 const source=d.addBlock('chip.VSOURCE',{params:{mode:'dc',dc:5}});
 const resistor=d.addBlock('chip.RES',{params:{r:10}});
 const wire=d.connect(source.id,'p',resistor.id,'p');
 setCADEnvelope(d,source.id,{xMm:0,yMm:0,zMm:0,widthMm:20,heightMm:10,depthMm:16});
 setCADEnvelope(d,resistor.id,{xMm:60,yMm:0,zMm:0,widthMm:20,heightMm:10,depthMm:16});
 return {d,source,resistor,wire};
}
test('Snap planning does not mutate original canonical circuit',()=>{
 const {d,source}=design(),before=JSON.stringify(d.toJSON());
 assert.equal(snapMillimetres(3.1,2),4);
 const proposal=planSnapPart(d,source.id,{xMm:12.3,zMm:10,rotationQuarterTurns:1});
 assert.deepEqual([proposal.proposal.xMm,proposal.proposal.widthMm,proposal.proposal.depthMm],[12,16,20]);
 assert.equal(JSON.stringify(d.toJSON()),before);
});
test('Snapped moves/rotation are transactional and collision-safe',()=>{
 const {d,source,resistor}=design();
 assert.throws(()=>commitSnapPart(d,source.id,{xMm:60,zMm:0}),/Collision/);
 assert.equal(d.meta.dimensionedCAD.parts[source.id].xMm,0);
 const before=JSON.stringify(d.toJSON());
 assert.throws(()=>commitSnapPart(d,source.id,{xMm:2000}),/outside/);
 assert.equal(JSON.stringify(d.toJSON()),before);
 const moved=commitSnapPart(d,source.id,{xMm:-22,zMm:0,rotationQuarterTurns:1});
 assert.equal(moved.status,'COMMITTED_MODEL_ONLY');
 assert.equal(d.meta.dimensionedCAD.parts[source.id].widthMm,16);
 assert.equal(dimensionedAssembly(d).overlaps.length,0);
});
test('Physical terminal-based Manhattan auto-route is validated by canonical harness gates',()=>{
 const {d,source,resistor,wire}=design();
 setPhysicalWireAssumption(d,wire.id,{material:'copper',lengthMm:200,diameterMm:.6,temperatureC:20});
 setPhysicalTerminal(d,source.id,'p',{xMm:10,yMm:5,zMm:0});
 setPhysicalTerminal(d,resistor.id,'p',{xMm:-10,yMm:5,zMm:0});
 const result=commitAutoManhattanHarness(d,wire.id);
 assert.equal(result.status,'GEOMETRIC_ROUTE_MODEL_ONLY');
 assert.equal(result.physicalValidation,'none');
 assert.equal(inspectPhysicalHarnesses(d).invalidIds.length,0);
 assert.throws(()=>commitSnapPart(d,source.id,{xMm:12}),/routed physical terminal/);
});
test('Invalid route endpoints, coordinate bounds and unsupported direct models fail closed',()=>{
 const {d,wire}=design();
 assert.throws(()=>commitAutoManhattanHarness(d,wire.id),/pin coordinates/);
 assert.throws(()=>snapMillimetres(NaN));
 assert.throws(()=>manhattanCandidates({xMm:0,yMm:1,zMm:0},
  {xMm:1,yMm:2,zMm:1},{liftMm:-2}));
});
