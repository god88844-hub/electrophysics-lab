import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyMotorAssumptions,interpolateManufacturer3VPoint,
 evaluateCoupledStoppedRotorHypothesis}
 from '../js/evidence/phase45-motor-characterization.js';
const sources=[
 'benchmarks/phase45/pololu1592-endpoint-model.json',
 'benchmarks/phase41/reference-hardware-candidate.json',
 'benchmarks/phase43/e91-assumptions.json',
 'benchmarks/phase44/copper-harness-assumptions.json'];
const buffers=await Promise.all(sources.map(file=>readFile(file)));
const [motor,candidate,battery,wire]=buffers.map(b=>JSON.parse(b));
verifyMotorAssumptions(motor,candidate);
const measuredManufacturerEndpointsOnly=[0,10000,20000].map(shaftRpm=>
 interpolateManufacturer3VPoint(motor,candidate,{shaftRpm}));
const coupled=evaluateCoupledStoppedRotorHypothesis(motor,candidate,battery,wire,
 {eachConductorLengthM:0.25,wireTemperatureC:20,contactResistancePerContactOhm:0.01});
const report={
 format:'invention-lab/phase45-published-motor-and-hypothetical-coupled-source-replay/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceHashes:Object.fromEntries(sources.map((path,i)=>[path,createHash('sha256').update(buffers[i]).digest('hex')])),
 points:measuredManufacturerEndpointsOnly,coupledStoppedRotor:coupled,
 physicalMotorSpecimensCalibrated:0,
 actualTargetFanAssembliesMeasured:0,
 actualMotorTorqueCurrentCurvesMeasured:0,
 motorCalibrationUncertaintyDistribution:null,
 fanTorqueCurve:null,
 realWorldBuildSuccessPercent:null,physicalValidation:'none',
 physicalVerdict:'unknown'
};
await mkdir('benchmarks/evidence/phase45',{recursive:true});
await writeFile('benchmarks/evidence/phase45/phase45.json',JSON.stringify(report,null,2)+'\n');
console.log('PH45 REPORT PASS: 3 approximate fixed-3V model points and coupled nominal stopped-rotor source load; real motor/fan calibration UNKNOWN');