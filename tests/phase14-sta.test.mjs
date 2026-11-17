// Synthetic negative controls only: NO fabricated EDA or silicon measurements.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parsePhase14TimingLog,evaluatePhase14Timing,FORMAT} from '../js/evidence/phase14-timing.js';
const H='a'.repeat(64);
const exampleLog=()=>[
  'OpenSTA experimental fixture - not real evidence',
  'PHASE14_TIMING_PATHS_BEGIN',
  ...['carry','zero',...Array.from({length:8},(_,i)=>'y['+i+']')].flatMap((port,i)=>[
    'Startpoint: a[0] (input port clocked by vclk)',
    'Endpoint: '+port+' (output port clocked by vclk)',
    'Path Group: vclk',
    'Path Type: max',
    '   4.40 data arrival time',
    '          14.60 slack (MET)'
  ]),
  'PHASE14_TIMING_PATHS_END'
].join('\n')+'\n';
function fixture(){
 const timing=parsePhase14TimingLog(exampleLog());
 return {format:FORMAT,example:'alu8',libraryCorner:'tt_025C_1v80',
  analysis:'pre-layout-combinational-single-typical-corner',
  constraints:{periodNs:20,inputMaxNs:1,outputMaxNs:1,inputSlewNs:0.1,outputLoadPf:0.01},
  libertySha256:H,netlistSha256:H,sdcSha256:H,staScriptSha256:H,staLogSha256:H,
  commitSha:'unit-synthetic',tool:{version:'OpenSTA synthetic TEST-ONLY'},
  timing,physicalValidation:'none',physicalQualified:false,physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null,postLayout:false,multiCorner:false,prototypeMeasurements:false};
}
const check=x=>evaluatePhase14Timing(x,{commitSha:'unit-synthetic',netlistSha256:H,timing:parsePhase14TimingLog(exampleLog())});
test('Phase 14 genuine single-corner report shape remains MODEL ONLY',()=>{
 const x=check(fixture());assert.equal(x.ok,true,x.errors.join('; '));
 assert.equal(x.status,'pre-layout-model-only');
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Prespecified SDC retains full virtual-clock and external delay envelope',()=>{
 const sdc=readFileSync(new URL('../benchmarks/phase14/alu8-tt.sdc',import.meta.url),'utf8');
 for(const x of ['create_clock -name vclk -period 20.0',
  'set_input_delay -clock vclk -max 1.0 [all_inputs]',
  'set_input_delay -clock vclk -min 0.0 [all_inputs]',
  'set_output_delay -clock vclk -max 1.0 [all_outputs]',
  'set_output_delay -clock vclk -min 0.0 [all_outputs]',
  'set_input_transition 0.10 [all_inputs]',
  'set_load 0.01 [all_outputs]'])assert.ok(sdc.includes(x));
});
test('Missing, unlinked, unconstrained, malformed or forged STA logs rejected',()=>{
 for(const edit of [
  x=>x.replace('PHASE14_TIMING_PATHS_END',''),
  x=>x.replace('Startpoint:', 'Starting:'),
  x=>x.replace('Endpoint:', 'Ending:'),
  x=>x.replace('14.60 slack (MET)','slack INF'),
  x=>x.replace('14.60 slack (MET)','NaN slack (MET)'),
  x=>x.replace('Endpoint: carry','Endpoint: bogus'),
  x=>x.replace('Path Type: max','Warning: missing cell'),
  x=>x.replace('Path Group: vclk','no paths found'),
  x=>x+'PHASE14_TIMING_PATHS_BEGIN',
 ]){
  assert.throws(()=>parsePhase14TimingLog(edit(exampleLog())));
 }
});
test('No prior computational PASS can silently promote physical STA to fabrication or yield',()=>{
 const mods=[
  x=>x.physicalValidation='verified',
  x=>x.physicalQualified=true,
  x=>x.physicalVerdict='pass',
  x=>x.realWorldBuildSuccessPercent=99,
  x=>x.postLayout=true,
  x=>x.multiCorner=true,
  x=>x.prototypeMeasurements=true,
  x=>x.libraryCorner='ff',
  x=>x.constraints.periodNs=100,
  x=>x.constraints.outputMaxNs=0,
  x=>x.netlistSha256='b'.repeat(64),
  x=>x.tool.version='fake',
  x=>x.timing.pathCount=0,
  x=>x.timing.worstSlackNs=50,
  x=>x.timing.result='violated',
  x=>x.commitSha='old'
 ];
 for(const mutate of mods){
  const x=structuredClone(fixture());mutate(x);
  assert.equal(check(x).ok,false);
 }
});
test('A timing violation must fail without being mistaken for silicon measurement',()=>{
 const log=exampleLog().replace('14.60 slack (MET)','-2.25 slack (VIOLATED)');
 const measured=parsePhase14TimingLog(log);
 assert.equal(measured.result,'violated');
 const x=fixture();x.timing=measured;
 const verdict=evaluatePhase14Timing(x);
 assert.equal(verdict.ok,false);
 assert.equal(verdict.physicalValidation,'none');
});
