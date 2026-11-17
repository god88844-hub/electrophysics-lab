import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const hash=x=>createHash('sha256').update(x).digest('hex');
const [aRaw,bRaw,reportRaw]=await Promise.all([
 readFile('benchmarks/phase43/e91-assumptions.json'),
 readFile('benchmarks/phase41/reference-hardware-candidate.json'),
 readFile('benchmarks/evidence/phase43/phase43.json')]);
const a=JSON.parse(aRaw),b=JSON.parse(bRaw),r=JSON.parse(reportRaw);
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
assert.equal(r.batterySourceSHA256,hash(aRaw));assert.equal(r.originalHardwareCandidateSHA256,hash(bRaw));
assert.equal(r.format,'invention-lab/phase43-e91-source-conditional-replay/1');
assert.equal(a.cellCountInSeries,2);assert.equal(b.battery.partNumber,'E91');
assert.equal(r.scenarios.length,3);
for(let i=0;i<3;i++){
 const current=[0,0.5,4][i],s=r.scenarios[i];
 assert.equal(s.assumedCurrentA,current);
 const lo=3-0.6*current,hi=3-0.3*current;
 assert.ok(Math.abs(s.counterfactualTerminalVoltageV.min-lo)<1e-12);
 assert.ok(Math.abs(s.counterfactualTerminalVoltageV.max-hi)<1e-12);
 assert.ok(Math.abs(s.counterfactualBatteryInternalLossW.min-current**2*0.3)<1e-12);
 assert.ok(Math.abs(s.counterfactualBatteryInternalLossW.max-current**2*0.6)<1e-12);
 assert.equal(s.physicalModelCalibrated,false);
 assert.equal(s.realWorldBuildSuccessPercent,null);
}
assert.equal(r.originalSourceMatchedBatterySpecimens,0);
assert.equal(r.actualFullDischargeCurvesMeasured,0);
assert.equal(r.measuredRuntimeDistribution,null);
assert.equal(r.batteryExperimentComplete,false);
assert.equal(r.physicalValidation,'none');
assert.equal(r.physicalVerdict,'unknown');
assert.equal(r.realWorldBuildSuccessPercent,null);
console.log('PH43 STRICT PASS: source SHA, three independent DC arithmetic checks, null physical calibration');