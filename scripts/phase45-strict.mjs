import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const paths=[
 'benchmarks/phase45/pololu1592-endpoint-model.json',
 'benchmarks/phase41/reference-hardware-candidate.json',
 'benchmarks/phase43/e91-assumptions.json',
 'benchmarks/phase44/copper-harness-assumptions.json'];
const b=await Promise.all(paths.map(p=>readFile(p)));
const report=JSON.parse(await readFile('benchmarks/evidence/phase45/phase45.json'));
const sha=x=>createHash('sha256').update(x).digest('hex');
assert.equal(report.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
assert.equal(report.format,'invention-lab/phase45-published-motor-and-hypothetical-coupled-source-replay/1');
for(let i=0;i<paths.length;i++)assert.equal(report.sourceHashes[paths[i]],sha(b[i]));
assert.deepEqual(report.points.map(x=>x.shaftRpm),[0,10000,20000]);
const torque=55*9.80665e-5;
for(let i=0;i<3;i++){
 const speed=[0,10000,20000][i],factor=speed/20000,x=report.points[i];
 assert.ok(Math.abs(x.externallyLoadedShaftTorqueNm-torque*(1-factor))<1e-11);
 assert.ok(Math.abs(x.nominalManufacturerCurrentA-(4-3.65*factor))<1e-11);
 assert.ok(Math.abs(x.hypotheticalShaftMechanicalPowerW-torque*(1-factor)*speed*Math.PI/30)<1e-11);
 assert.equal(x.motorSafetyOrLifeCertification,false);
 assert.equal(x.physicalValidation,'none');
}
const r=report.coupledStoppedRotor;
const radius=0.127e-3*Math.pow(92,12/39)/2;
const rWire=(1/58000000)*0.5/(Math.PI*radius**2)+0.02;
assert.ok(Math.abs(r.assumedHarnessResistanceOhm-rWire)<1e-11);
assert.equal(r.cases.length,2);
for(let i=0;i<2;i++){
 const batteryResistance=[0.3,0.6][i],item=r.cases[i];
 const current=3/(.75+rWire+batteryResistance);
 assert.ok(Math.abs(item.hypotheticalStoppedRotorCurrentA-current)<1e-11);
 assert.ok(Math.abs(item.hypotheticalMotorTerminalVoltageV-.75*current)<1e-11);
 assert.ok(Math.abs(item.hypotheticalPackSagV-batteryResistance*current)<1e-11);
 assert.ok(Math.abs(item.voltageBalanceResidualV)<1e-11);
}
assert.equal(r.fanLoadedOperatingSpeedRpm,null);
assert.equal(r.actualStallTorqueAtSagVoltageNm,null);
assert.equal(r.shaftFanMechanicalSafetyApproved,false);
assert.equal(r.physicalSpecimensMeasured,0);
assert.equal(report.physicalMotorSpecimensCalibrated,0);
assert.equal(report.actualTargetFanAssembliesMeasured,0);
assert.equal(report.actualMotorTorqueCurrentCurvesMeasured,0);
assert.equal(report.motorCalibrationUncertaintyDistribution,null);
assert.equal(report.fanTorqueCurve,null);
assert.equal(report.physicalValidation,'none');
assert.equal(report.physicalVerdict,'unknown');
assert.equal(report.realWorldBuildSuccessPercent,null);
console.log('PH45 STRICT PASS: 3 independent motor endpoint checks, 2 exact KVL coupled cases; ZERO qualified physical fan readings');