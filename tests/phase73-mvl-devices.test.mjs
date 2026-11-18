import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PDK_SOURCES,PDK_DEVICE_CATALOG,Q4_RAILS,BALANCED_TERNARY_RAILS,
makeVoltageRails,decodeVoltage,buildMvlPrimitive,evaluateRadixAlu,
validateDeviceOperatingEnvelope,evaluateMvlPrimitive} from '../js/evidence/phase73-mvl-devices.js';
test('Phase73 PDKs are exact-source commit declarations, not fabricated calibrated cards',()=>{
 for(const x of Object.values(PDK_SOURCES))assert.match(x.commit,/^[0-9a-f]{40}$/);
 assert.ok(PDK_DEVICE_CATALOG.some(x=>x.thresholdClass==='lvt'));
 assert.ok(PDK_DEVICE_CATALOG.some(x=>x.thresholdClass==='hvt'));
 assert.ok(PDK_DEVICE_CATALOG.every(x=>x.validatedStatisticalDistribution===false));
 assert.ok(PDK_DEVICE_CATALOG.every(x=>x.localModelSha256===null));
});
test('Q4 0/1.1/2.2/3.3 V and balanced ternary rails are deterministic',()=>{
 assert.deepEqual(Q4_RAILS.rails,[0,1.1,2.2,3.3]);
 assert.deepEqual(BALANCED_TERNARY_RAILS.rails,[-1.1,0,1.1]);
 assert.deepEqual(makeVoltageRails({base:2,minimumV:0,maximumV:1.8}).rails,[0,1.8]);
 for(const [n,v] of Q4_RAILS.rails.entries())assert.equal(decodeVoltage(v,Q4_RAILS).level,n);
 assert.equal(decodeVoltage(.55,Q4_RAILS).status,'UNKNOWN');
 assert.equal(decodeVoltage(-1.1,BALANCED_TERNARY_RAILS).logicalValue,-1);
 assert.equal(buildMvlPrimitive({kind:'level-shifter',rails:Q4_RAILS}).transistorNetlist,null);
});
test('Honest device bounds prohibit treating 1.8V SKY130 as 3.3V Q4',()=>{
 const x=validateDeviceOperatingEnvelope('sky130_nfet_lvt',{rails:Q4_RAILS,supplyRippleFraction:.1});
 assert.equal(x.status,'INSUFFICIENT_MODEL_DATA');assert.equal(x.nominalExceeded,true);
 assert.equal(x.usableForTransistorSimulation,false);
 const y=validateDeviceOperatingEnvelope('gf180_nfet_03v3',{rails:Q4_RAILS,supplyRippleFraction:.1});
 assert.equal(y.nominalExceeded,true);assert.equal(y.usableForTransistorSimulation,false);
 assert.throws(()=>makeVoltageRails({base:17}));
 assert.throws(()=>makeVoltageRails({base:3,minimumV:0,maximumV:3,balancedTernary:true}));
});
test('Binary, balanced ternary, Q4 and base-N 4/8-digit arithmetic is functional only',()=>{
 for(const base of [2,3,4,9,16])for(const width of [4,8]){
  const a=Array(width).fill(base-1),b=Array(width).fill(0);b[width-1]=1;
  const add=evaluateRadixAlu({base,width,a,b,operation:'add'});
  assert.equal(add.overflow,true);assert.deepEqual(add.digits,Array(width).fill(0));
  assert.equal(add.powerWatts,null);assert.equal(add.delaySeconds,null);
  assert.equal(add.physicalValidation,'none');
  const sub=evaluateRadixAlu({base,width,a:Array(width).fill(0),b,operation:'sub'});
  assert.deepEqual(sub.digits,Array(width).fill(base-1));
 }
});

test('Functional MVL detector, complement and level shifter preserve ambiguous inputs',()=>{
 const input=makeVoltageRails({base:4,minimumV:0,maximumV:1.8});
 const output=Q4_RAILS;
 const a=evaluateMvlPrimitive({kind:'level-shifter',sourceRails:input,
  targetRails:output,inputVoltages:[1.2]});
 assert.equal(a.status,'RESOLVED_FUNCTIONAL_ONLY');
 assert.equal(a.logicLevel,2);assert.equal(a.outputVoltageV,2.2);
 assert.equal(a.foundryCalibrated,false);assert.equal(a.transistorNetlist,null);
 const ambiguous=evaluateMvlPrimitive({kind:'detector',sourceRails:input,
  inputVoltages:[.9],guardBandV:.01});
 assert.equal(ambiguous.status,'UNKNOWN');
 const complement=evaluateMvlPrimitive({kind:'complement',sourceRails:Q4_RAILS,
  inputVoltages:[1.1]});
 assert.equal(complement.outputVoltageV,2.2);
 assert.throws(()=>evaluateMvlPrimitive({kind:'level-shifter',sourceRails:Q4_RAILS,
  targetRails:makeVoltageRails({base:3,minimumV:0,maximumV:3.3}),
  inputVoltages:[1.1]}),/base must match/);
});
