import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ZOOM_LEVELS,semanticLevel,semanticDistance,semanticZoomState,
 smoothZoom,zoomRoundTrip} from '../js/scene/stage-n-semantic-zoom.js';
test('All five semantic drill-down levels are reachable and round-trip',()=>{
 assert.equal(ZOOM_LEVELS.length,5);
 for(const level of ZOOM_LEVELS){
  const d=semanticDistance(level.id);
  assert.equal(semanticLevel(d),level.id);
  assert.equal(zoomRoundTrip(d,'device').restored,level.id);
  assert.equal(zoomRoundTrip(d,'system').stable,true);
 }
 assert.deepEqual([2,7,18,42,100].map(semanticLevel),
  ['device','cell','chip','board','system']);
});
test('Semantic zoom always shows solver availability accurately',()=>{
 assert.equal(semanticZoomState(2,{lab:'chip',hasSimulation:true}).appliedSolver,null);
 assert.equal(semanticZoomState(2,{lab:'quantum',hasSimulation:true}).appliedSolver,
  'existing-canonical-lab-solver');
 assert.equal(semanticZoomState(18,{lab:'logic',hasSimulation:true}).reason,
  'solver-snapshot-not-continuous-co-simulation');
 assert.equal(semanticZoomState(42,{lab:'chip',hasSimulation:false}).appliedSolver,null);
});
test('Smooth camera transition converges without numerical corruption',()=>{
 let d=100;for(let i=0;i<100;i++)d=smoothZoom(d,2,.2);
 assert.ok(Math.abs(d-2)<1e-4);
 assert.throws(()=>semanticLevel(0));
 assert.throws(()=>smoothZoom(12,2,2));
});
