import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const paths=['benchmarks/phase51/fault-model-scope.json',
 'benchmarks/phase41/reference-hardware-candidate.json',
 'benchmarks/phase43/e91-assumptions.json',
 'benchmarks/phase44/copper-harness-assumptions.json',
 'benchmarks/phase45/pololu1592-endpoint-model.json',
 'benchmarks/phase50/uncertainty-envelope.json',
 'benchmarks/phase49/synthetic-identifiability.json'];
const report=JSON.parse(await readFile('benchmarks/evidence/phase51/phase51.json'));
assert.equal(report.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
assert.equal(report.format,'invention-lab/phase51-symbolic-fault-mode-source-replay/1');
for(const path of paths)assert.equal(report.sourceSHA256[path],
 createHash('sha256').update(await readFile(path)).digest('hex'));
const source=JSON.parse(await readFile(paths[0]));
assert.deepEqual(report.cases.map(x=>x.faultName),source.modeledFaultCases.map(x=>x.case));
assert.equal(report.cases.length,8);
assert.deepEqual(report.cases[0].faultedHypotheticalStoppedRotorCurrentRangeA,{lower:0,upper:0});
assert.deepEqual(report.cases[1].faultedHypotheticalStoppedRotorCurrentRangeA,{lower:0,upper:0});
assert.equal(report.cases[4].syntheticFaultIndicator.noIndependentTachMeasurement,true);
assert.equal(report.cases[5].syntheticFaultIndicator.noIndependentThermalMeasurement,true);
assert.equal(report.cases[6].syntheticFaultIndicator.correlatedElectricalAssumptions,true);
assert.equal(report.cases[7].syntheticFaultIndicator.mechanicalContainmentNotQualified,true);
for(const c of report.cases){
 assert.equal(c.actualHardwareSensorFailureDetected,false);
 assert.equal(c.physicalFailureProbability,null);
 assert.equal(c.physicalSafeOperatingLimitsKnown,false);
 assert.equal(c.hardwareTestingAuthorized,false);
 assert.equal(c.realWorldBuildSuccessPercent,null);
}
assert.equal(report.faultTree.independenceAssumptionsValidated,false);
assert.equal(report.faultTree.physicalSystemReliability,null);
assert.equal(report.faultTree.physicalSafetyAcceptance,'NO_GO_UNQUALIFIED_HARDWARE_AND_MISSING_EXPERIMENT');
assert.equal(report.physicalFaultExperiments,0);
assert.equal(report.independentRealFailureRates,null);
assert.equal(report.calibratedDetectionCoverage,null);
assert.equal(report.correlatedManufacturingProbability,null);
assert.equal(report.physicalValidation,'none');
assert.equal(report.physicalVerdict,'unknown');
assert.equal(report.realWorldBuildSuccessPercent,null);
console.log('PH51 STRICT PASS: independent source SHA and eight fail-closed fault cases; physical failure distribution unknown');