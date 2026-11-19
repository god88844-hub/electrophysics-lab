import {test} from 'node:test';
import assert from 'node:assert/strict';
import {signalVisual,thermalVisual,currentDensityVisual,
 propagationPhase,overlayFromExperiment,inferSignalFromVoltageReadings} from '../js/scene/stage-n-live-overlay.js';
test('Binary, ternary, Q4 signals are distinct and ambiguous sources are UNKNOWN',()=>{
 for(const base of [2,3,4]){
  const colors=new Set(Array.from({length:base},(_,i)=>signalVisual({base,level:i}).rgb.join(',')));
  assert.equal(colors.size,base);
 }
 assert.equal(signalVisual({uncertain:true}).label,'UNKNOWN');
 assert.throws(()=>signalVisual({base:4,level:4}));
});
test('Thermal/current hazards are visualization-only and cannot fake sensor data',()=>{
 assert.equal(thermalVisual({temperatureC:90,limitC:80}).fault,true);
 assert.equal(thermalVisual({temperatureC:90,limitC:80}).physicalValidation,'none');
 assert.equal(thermalVisual({temperatureC:NaN,limitC:80}).status,'UNKNOWN');
 assert.equal(currentDensityVisual({currentA:2,areaMm2:1,maxExpectedAmm2:1}).status,
  'MODEL_LIMIT_EXCEEDED');
 assert.equal(currentDensityVisual({currentA:2,areaMm2:0,maxExpectedAmm2:1}).status,'UNKNOWN');
});
test('Overlay with no current canonical trace remains no-data',()=>{
 assert.equal(overlayFromExperiment(null,null,0).status,'NO_CURRENT_SOLVER_SAMPLES');
 assert.equal(propagationPhase(0,.5,20,0),0);
 assert.throws(()=>propagationPhase(0,1,0,0));
});

test('Only a real solver voltage value with explicit rails can select a signal color',()=>{
 const rails={base:4,minRailV:0,maxRailV:3.3,guardBandV:.02};
 const actual=inferSignalFromVoltageReadings([{label:'probe',unit:'V',value:2.2}],rails);
 assert.equal(actual.status,'RESOLVED_MODEL_ONLY');
 assert.equal(actual.level,2);
 assert.equal(actual.sourceVoltageV,2.2);
 assert.equal(inferSignalFromVoltageReadings([{label:'temp',unit:'°C',value:80}],rails).status,'UNKNOWN');
 assert.equal(inferSignalFromVoltageReadings([{label:'probe',unit:'V',value:1.65}],rails).status,'UNKNOWN');
 assert.equal(inferSignalFromVoltageReadings([{label:'probe',unit:'V',value:4.5}],rails).status,'UNKNOWN');
});
