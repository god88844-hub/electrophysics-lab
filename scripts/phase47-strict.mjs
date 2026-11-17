import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const paths=['benchmarks/phase47/coupled-hypotheses.json',
'benchmarks/phase41/reference-hardware-candidate.json',
'benchmarks/phase43/e91-assumptions.json',
'benchmarks/phase44/copper-harness-assumptions.json',
'benchmarks/phase45/pololu1592-endpoint-model.json',
'benchmarks/phase46/fan-affinity-assumptions.json'];
const bufs=await Promise.all(paths.map(x=>readFile(x)));
const r=JSON.parse(await readFile('benchmarks/evidence/phase47/phase47.json'));
assert.equal(r.format,'invention-lab/phase47-source-locked-conditional-coupled-simulator/1');
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
for(let i=0;i<paths.length;i++)assert.equal(r.sourceHashes[paths[i]],
 createHash('sha256').update(bufs[i]).digest('hex'));
assert.deepEqual(r.runs.map(x=>x.assumedFanTorqueCoefficientNmPerRadPerS_Squared),[0,5e-10,1e-9]);
for(const x of r.runs){
 const k=x.manufacturerMotorConsistency.assumedKtNmPerA;
 assert.equal(k,x.manufacturerMotorConsistency.assumedKeVoltsPerRadPerSecond);
 assert.ok(Math.abs(x.manufacturerMotorConsistency.mismatchAgainstManufacturerNetStallTorquePercent)>5);
 assert.equal(x.steps,400);
 assert.ok(Math.abs(x.fullEnergyBalanceResidualJ)<1e-7);
 assert.ok(x.maximumPerStepEnergyResidualJ<1e-8);
 const q=x.allEnergyTermsJ;
 const source=q.electricalSourceJ;
 const sink=q.batteryDissipationJ+q.wireAndContactDissipationJ+
 q.fanShaftAerodynamicWorkJ+q.ambientTransferredMotorHeatJ+
 x.finalKineticEnergyGainJ+x.finalMotorThermalEnergyGainJ;
 assert.ok(Math.abs(source-sink)<1e-7);
 assert.equal(x.calibratedAgainstSourceMatchedPhysicalSystem,false);
 assert.equal(x.actualImpellerMaximumPermittedRpm,null);
 assert.equal(x.physicalValidation,'none');
 assert.equal(x.realWorldBuildSuccessPercent,null);
}
assert.ok(r.runs[0].finalShaftRpm>r.runs[1].finalShaftRpm);
assert.ok(r.runs[1].finalShaftRpm>r.runs[2].finalShaftRpm);
assert.equal(r.physicalMatchedFanTests,0);
assert.equal(r.actualFanLoadTorqueCurve,null);
assert.equal(r.measuredThermalTimeConstants,null);
assert.equal(r.physicallyCalibratedMotorConstants,null);
assert.equal(r.systemModelPhysicallyValidated,false);
assert.equal(r.physicalValidation,'none');
assert.equal(r.physicalVerdict,'unknown');
assert.equal(r.realWorldBuildSuccessPercent,null);
console.log('PH47 STRICT PASS: source SHA and independently summed energy conservation; real whole-system validation UNKNOWN');