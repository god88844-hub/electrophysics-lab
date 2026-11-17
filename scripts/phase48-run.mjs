import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {verifyWholeSystemReadiness,evaluateWholeSystemNumericalReadiness}
 from '../js/evidence/phase48-whole-system-gate.js';
import {verifyCoupledHypotheses,simulateCoupledHypothesis}
 from '../js/evidence/phase47-coupled-solver.js';
const paths={
 gate:'benchmarks/phase48/whole-system-readiness.json',
 coupled:'benchmarks/phase47/coupled-hypotheses.json',
 candidate:'benchmarks/phase41/reference-hardware-candidate.json',
 protocol:'benchmarks/phase42/physical-capture-protocol.json',
 battery:'benchmarks/phase43/e91-assumptions.json',
 wire:'benchmarks/phase44/copper-harness-assumptions.json',
 motor:'benchmarks/phase45/pololu1592-endpoint-model.json',
 fan:'benchmarks/phase46/fan-affinity-assumptions.json'
};
const blobs=Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([k,v])=>[k,await readFile(v)])));
const models=Object.fromEntries(Object.entries(blobs).map(([k,v])=>[k,JSON.parse(v)]));
verifyWholeSystemReadiness(models.gate,models);
verifyCoupledHypotheses(models.coupled,models);
const runs=models.gate.comparisonCases.map(({label,fanTorqueCoefficient,batteryResistanceOhm})=>({
 label,output:simulateCoupledHypothesis(models.coupled,models,{
  fanTorqueCoefficientNmPerRadPerS_Squared:fanTorqueCoefficient,
  batteryInternalResistanceOhm:batteryResistanceOhm})
}));
const report={
 format:'invention-lab/phase48-multi-regime-conditional-source-replay/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceSHA256:Object.fromEntries(Object.entries(paths).map(([key,path])=>[
  path,createHash('sha256').update(blobs[key]).digest('hex')])),
 referenceDesignId:models.gate.referenceDesignId,
 numericalModelOnly:true,
 independentModelPhysicallyCalibrated:false,
 runs,
 originalPhysicalFanSessions:0,
 originalPhysicalFanSamples:0,
 physicalUnseenDeviceHoldouts:0,
 physicallyVerifiedOperatingRegimes:0,
 actualPhysicalWholeSystemValidationComplete:false,
 realWorldBuildSuccessPercent:null,physicalValidation:'none',physicalVerdict:'unknown'
};
const decision=evaluateWholeSystemNumericalReadiness(models.gate,models,report);
await mkdir('benchmarks/evidence/phase48',{recursive:true});
await writeFile('benchmarks/evidence/phase48/phase48.json',JSON.stringify({...report,decision},null,2)+'\n');
console.log('PH48 SOURCE REPLAY PASS: five hypothetical scenarios, source manifests bound, real physical fan data 0, verdict UNKNOWN');
