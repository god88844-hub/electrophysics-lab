import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const [raw,src,reportRaw]=await Promise.all([
 readFile('benchmarks/phase44/copper-harness-assumptions.json'),
 readFile('benchmarks/phase41/reference-hardware-candidate.json'),
 readFile('benchmarks/evidence/phase44/phase44.json')
]);
const sha=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(reportRaw),a=JSON.parse(raw);
assert.equal(r.format,'invention-lab/phase44-conditional-wire-source-replay/1');
assert.equal(r.assumptionsSha256,sha(raw));
assert.equal(r.sourceHardwareSha256,sha(src));
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
assert.equal(r.scenarios.length,3);
const area=Math.PI*(0.127e-3*Math.pow(92,12/39))**2/4;
for(const [i,s] of r.scenarios.entries()){
 const current=i===1?2:1,temperature=i===2?80:20;
 const resistance=(1/58000000)*(1+0.00393*(temperature-20))*0.5/area;
 const expectedTotal=resistance+0.02;
 assert.ok(Math.abs(s.copperResistanceOhm-resistance)<1e-11);
 assert.ok(Math.abs(s.totalSeriesResistanceOhm-expectedTotal)<1e-11);
 assert.ok(Math.abs(s.hypotheticalTotalVoltageDropV-current*expectedTotal)<1e-11);
 assert.ok(Math.abs(s.hypotheticalTotalJouleLossW-current*current*expectedTotal)<1e-11);
 assert.equal(s.realHarnessAndConnectorMeasurements,0);
 assert.equal(s.actualCurrentCarryingCapacityA,null);
 assert.equal(s.physicalValidation,'none');
 assert.equal(s.realWorldBuildSuccessPercent,null);
}
assert.equal(a.actualSourceMatchedPhysicalReadings,0);
assert.equal(r.measuredWireHarnesses,0);
assert.equal(r.measuredConnectorContactPairs,0);
assert.equal(r.verifiedWireTemperatureRiseC,null);
assert.equal(r.qualifiedCurrentCarryingCapacityA,null);
assert.equal(r.physicalVerdict,'unknown');
assert.equal(r.realWorldBuildSuccessPercent,null);
console.log('PH44 STRICT PASS: independent AWG24 copper loop oracle and no real harness calibration');