import {test} from 'node:test';
import assert from 'node:assert/strict';
import {simulateSegmentedWireThermal} from '../js/scene/wire-electrothermal.js';
import {fitWireThermalConvectionHoldout as fit} from '../js/scene/wire-thermal-holdout.js';
const input={material:'copper',lengthMm:100,diameterMm:.5,temperatureC:20,assumedCurrentA:3};
const env={ambientC:20,durationS:7,stepS:.005,segments:6};
const trueH=12;
const rows=Array.from({length:6},(_,i)=>{
 const wireSpec={...input,assumedCurrentA:3+i*.25};
 const environment={...env,durationS:7+i*.5};
 const observedMeanTemperatureC=simulateSegmentedWireThermal(wireSpec,
  {...environment,heatTransferWm2K:trueH}).meanTemperatureC;
 return {id:'case-'+i,wireSpec,environment,observedMeanTemperatureC,uncertaintyC:.005};
});
const opts={source:'Laboratory user-provided files, NOT independently verified',
 instrument:'Thermocouple datalogger serial not checked',operator:'Unverified test operator',
 holdoutIds:['case-4','case-5'],minimumHeatTransferWm2K:3,maximumHeatTransferWm2K:30};
test('single parameter is recovered without physical qualification claims',()=>{
 const r=fit(rows,opts);
 assert.ok(Math.abs(r.candidateParameters.heatTransferWm2K-trueH)<.01);
 assert.ok(r.development.rmseC<.001);assert.ok(r.holdout.rmseC<.001);
 assert.equal(r.optimizationUsedHoldout,false);
 assert.equal(r.independentInstrumentProvenanceAuthenticated,false);
 assert.equal(r.physicalValidation,'unverified-user-supplied-data');
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('holdout observations never change fitted parameter',()=>{
 const before=fit(rows,opts),changed=structuredClone(rows);
 changed[4].observedMeanTemperatureC+=8;changed[5].observedMeanTemperatureC-=5;
 const after=fit(changed,opts);
 assert.equal(before.candidateParameters.heatTransferWm2K,after.candidateParameters.heatTransferWm2K);
 assert.ok(after.holdout.rmseC>4);
});
test('reject missing holdout, duplicate rows and invalid conditions',()=>{
 assert.throws(()=>fit(rows,{...opts,holdoutIds:[]}),/withheld/);
 assert.throws(()=>fit(rows,{...opts,holdoutIds:['case-0','missing']}),/absent/);
 assert.throws(()=>fit(rows,{...opts,holdoutIds:['case-4','case-4']}),/Duplicate/);
 assert.throws(()=>fit([rows[0],rows[0],...rows.slice(2)],opts),/Duplicate/);
 assert.throws(()=>fit(rows.map(r=>({...r,uncertaintyC:NaN})),opts),/uncertainty/);
 assert.throws(()=>fit(rows.map(r=>({...r,environment:{...r.environment,heatTransferWm2K:12}})),opts),/pre-filled/);
});
test('unobservable convection rejects zero-heating experiments',()=>{
 const flat=rows.map(r=>({...r,wireSpec:{...r.wireSpec,assumedCurrentA:0},
  observedMeanTemperatureC:20,uncertaintyC:.01}));
 assert.throws(()=>fit(flat,opts),/unidentifiable/);
});
test('source measurements and options are never modified',()=>{
 const original=structuredClone(rows),options=structuredClone(opts);
 fit(rows,opts);assert.deepEqual(rows,original);assert.deepEqual(opts,options);
});
