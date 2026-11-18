import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Q4_RAILS,makeVoltageRails} from '../js/evidence/phase73-mvl-devices.js';
import {analyzeMvlNoiseMargins,runMvlNgspiceMeasurements} from '../js/evidence/phase74-noise-margins.js';
function states(rails,disturbance=0){
 return [-.1,0,.1].flatMap(rippleFraction=>rails.rails.map((v,state)=>({
  rippleFraction,state,dcOutputV:[v-disturbance,v+disturbance],
  transientOutputV:[v-disturbance,v+disturbance],eyeOpeningV:rails.spacingV
 })));
}
test('Q4 static/dynamic margins have named intermediate levels',()=>{
 const x=analyzeMvlNoiseMargins({rails:Q4_RAILS,states:states(Q4_RAILS,.02),
  minimumSafeMarginV:.15,maxRailDroopV:.02,maxCrosstalkV:.03});
 assert.equal(x.status,'MODEL_WINDOW_PASS');
 assert.deepEqual(x.marginByState.map(s=>s.key),['NM_L','NM_1','NM_2','NM_H']);
 assert.ok(x.marginByState.every(s=>Math.abs(s.marginV-.48)<1e-10));
 assert.equal(x.foundryCalibrated,false);
});
test('ripple, coupling or collapsed intermediate state is flagged',()=>{
 const x=states(Q4_RAILS,.15);
 x.find(s=>s.state===1&&s.rippleFraction===.1).transientOutputV=[1.4,1.65];
 const out=analyzeMvlNoiseMargins({rails:Q4_RAILS,states:x,minimumSafeMarginV:.15});
 assert.equal(out.status,'VIRTUAL_FAIL');assert.ok(out.unsafeStates.includes(1));
});
test('missing ripple, malformed traces, duplicate corners fail closed',()=>{
 const data=states(Q4_RAILS);
 assert.equal(analyzeMvlNoiseMargins({rails:Q4_RAILS,states:data.slice(0,-1),
  minimumSafeMarginV:.05}).status,'INSUFFICIENT_MODEL_DATA');
 assert.throws(()=>analyzeMvlNoiseMargins({rails:Q4_RAILS,states:[...data.slice(0,-1),data[0]],
  minimumSafeMarginV:.05}),/Duplicate/);
 const invalid=structuredClone(data);invalid[0].dcOutputV=[NaN,1];
 assert.throws(()=>analyzeMvlNoiseMargins({rails:Q4_RAILS,states:invalid,minimumSafeMarginV:.05}));
 assert.throws(()=>analyzeMvlNoiseMargins({rails:Q4_RAILS,states:data,minimumSafeMarginV:.5,rippleFractions:[0]}));
});
test('base 2, 3, 4, 7 margin checker never invents device calibration',()=>{
 for(const base of [2,3,4,7]){
  const rails=makeVoltageRails({base,minimumV:0,maximumV:3.3});
  const x=analyzeMvlNoiseMargins({rails,states:states(rails),minimumSafeMarginV:.01});
  assert.equal(x.status,'MODEL_WINDOW_PASS');assert.equal(x.physicalQualification,false);
 }
});
test('ngspice availability and missing decks are unknown, never success',async()=>{
 const r=await runMvlNgspiceMeasurements({exe:'',dcDeck:'',transientDeck:''});
 assert.equal(r.status,'INSUFFICIENT_MODEL_DATA');
});
