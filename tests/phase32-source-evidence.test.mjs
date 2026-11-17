import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyCatalog,sourceMotorConstants,assessPublicSourceCoverage,
 auditMotorCsv,EXPECTED_SOURCE_URLS,EXPECTED_REQUIREMENTS}
 from '../js/evidence/phase32-source-coverage.js';
const catalog=JSON.parse(readFileSync(new URL('../benchmarks/phase32/public-source-catalog.json',import.meta.url),'utf8'));
function csv(rows=3){
 const data=['Mode,Static','Date,2026-08-01',
 'REF,MEAS,DT_ms,CURRENT_RAW,CURRENT_AVG,PWM,DMM_CURRENT_A,DMM_TIME_s,DMM_AGE_ms,DMM_SAMPLE_ID'];
 for(let i=0;i<rows;i++)data.push(['1',String(900+i*15),'10','200','20','150','0.2',String(i*0.01),'0',''+i].join(','));
 return data.join('\n')+'\n';
}
test('Complete original 12-source catalog and 23 independent required source constraints',()=>{
 assert.equal(verifyCatalog(catalog),true);
 assert.equal(catalog.sources.length,12);
 assert.equal(catalog.requirements.length,23);
 assert.equal(Object.keys(EXPECTED_SOURCE_URLS).length,12);
 assert.equal(EXPECTED_REQUIREMENTS.length,23);
 assert.equal(catalog.originalFanHardwareMeasurements,0);
 assert.equal(catalog.manufacturingSuccessPercent,null);
 assert.equal(catalog.physicalVerdict,'unknown');
});
test('2026 OpenMCT licensed published dataset is DISCOVERED, >60000 rows NOT claimed downloaded',()=>{
 const s=catalog.sources.find(x=>x.id==='mendeley-openmct-2026-v2');
 assert.equal(s.doi,'10.17632/5xvg43r9r8.2');
 assert.equal(s.license,'CC BY 4.0');
 assert.equal(s.publishedRowsLowerBoundExclusive,60000);
 assert.equal(s.reportedRawLogs,14);
 assert.equal(s.directOriginalMeasurementCount,0);
 assert.ok(s.recordStatus.includes('not-downloaded'));
});
test('Separate two DC motor datasets, NASA battery and NMB BLDC are not the model fan',()=>{
 const pm=catalog.sources.find(x=>x.id==='mendeley-pmdc-2021-v2');
 assert.equal(pm.reportedMotorSpecimens,2);
 assert.equal(pm.reportedDatasets,11);
 for(const id of ['nasa-battery-aging','nasa-battery-randomwalk-2','nmb-fan-pressure-curve']){
  const s=catalog.sources.find(x=>x.id===id);
  assert.equal(s.directOriginalMeasurementCount,0);
  assert.ok(s.subjectMatch);
 }
});
test('Actual Pololu 1592 reference at 3V is correctly converted, not copied onto made-up fan',()=>{
 const r=sourceMotorConstants(catalog);
 assert.equal(r.sourceNoLoadSpeedRpm,20000);
 assert.equal(r.sourceNoLoadCurrentA,.35);
 assert.equal(r.sourceStallCurrentA,4);
 assert.equal(r.sourceStallTorqueGfCm,55);
 assert.ok(Math.abs(r.inferredStallResistanceOhm-.75)<1e-13);
 assert.ok(Math.abs(r.derivedStallTorqueNm-.0053936575)<1e-12);
 assert.ok(Math.abs(r.derivedKtFromStallNmPerA-.001348414375)<1e-13);
 assert.ok(Math.abs(r.derivedKeFromFreeRunVsPerRad-.00130705997014)<1e-9);
 assert.ok(r.kRelativeInconsistencyPercent>3&&r.kRelativeInconsistencyPercent<3.2);
 assert.equal(r.confirmedPerPartMeasurementErrorBound,null);
 assert.equal(r.estimatedPopulationDistribution,null);
 assert.equal(r.canApplyToPhase31GenericFan,false);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Even real manufacturer motor specs do not constitute an assembled fan physical test',()=>{
 const report=assessPublicSourceCoverage(catalog);
 assert.equal(report.totalExplicitEvidenceRequirements,23);
 assert.equal(report.coreMathematicalModelVerifiedCount,1);
 assert.equal(report.fullyPhysicallySatisfiedRequirements,0);
 assert.equal(report.physicallyUnverifiedRequirements,23);
 assert.equal(report.publishedExperimentalDatasetsIdentified,4);
 assert.equal(report.originalFanHardwareMeasurements,0);
 assert.equal(report.publishedDataOriginalMeasurementsIngested,0);
 assert.equal(report.realWorldBuildSuccessPercent,null);
 assert.equal(report.simulationPhysicalEquivalenceClaimAllowed,false);
});
test('Even EXACT motor part and 3V do not validate battery wires + fan, only supplier spec match',()=>{
 const r=assessPublicSourceCoverage(catalog,{targetId:'user-fan',targetPartId:'pololu-1592',intendedVoltageV:3});
 assert.equal(r.manufacturerMotorSpecMatched,true);
 assert.equal(r.sourceToTargetTransferQualified,false);
 assert.equal(r.fullyPhysicallySatisfiedRequirements,0);
 assert.equal(r.requirements.find(x=>x.id==='motor-constants').illustrativeSourceReadyForReuse,
  'vendor-published-motor-spec-consistency-only');
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Changing model or voltage rules out even nominal motor cross-application',()=>{
 assert.equal(assessPublicSourceCoverage(catalog,{targetPartId:'different-motor',intendedVoltageV:3}).manufacturerMotorSpecMatched,false);
 assert.equal(assessPublicSourceCoverage(catalog,{targetPartId:'pololu-1592',intendedVoltageV:6}).manufacturerMotorSpecMatched,false);
 assert.equal(assessPublicSourceCoverage(catalog,{targetPartId:'pololu-1592',intendedVoltageV:1.5}).manufacturerMotorSpecMatched,false);
});
test('Untrusted OpenMCT-formatted file parser extracts numeric readings but not origin',()=>{
 const r=auditMotorCsv(csv(3));
 assert.equal(r.parsedDataRows,3);
 assert.equal(r.rowsWithDmmCurrentA,3);
 assert.equal(r.observedSpeedMinRpm,900);
 assert.equal(r.observedSpeedMaxRpm,930);
 assert.equal(r.originalRawBytesIndependentlyFetched,false);
 assert.equal(r.publishedDatasetDigestIndependentlyVerified,false);
 assert.equal(r.deviceMatchedToPhase31Fan,false);
 assert.equal(r.calibrationHoldoutSeparationEstablished,false);
 assert.equal(r.canEstimateManufacturingSuccess,false);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Forged perfect CSV from user cannot be silently authenticated as actual test results',()=>{
 const r=assessPublicSourceCoverage(catalog,{targetPartId:'pololu-1592',calibrationDataset:csv(30)});
 assert.equal(r.manufacturerMotorSpecMatched,true);
 assert.equal(r.calibrationDatasetAudit.parsedDataRows,30);
 assert.equal(r.calibrationDatasetAudit.sourceInstrumentCalibrationIndependentlyVerified,false);
 assert.equal(r.authenticatedActualTargetDeviceMeasurements,0);
 assert.equal(r.sourceToTargetTransferQualified,false);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Tampered original source authority or injected real measurements are refused',()=>{
 const edits=[
  x=>x.sources[0].url='https://phishing.example.com',
  x=>x.sources[0].directOriginalMeasurementCount=1,
  x=>x.sources.find(s=>s.id==='pololu-1592').specificationAt3V.stallCurrentA=3,
  x=>x.sources.find(s=>s.id==='mendeley-openmct-2026-v2').reportedRawLogs=999,
  x=>x.sources.find(s=>s.id==='mendeley-openmct-2026-v2').license='unknown',
  x=>x.requirements.find(r=>r.id==='fan-curve').presentForExample=true,
  x=>x.requirements.pop(),
  x=>x.manufacturingSuccessPercent=100,
  x=>x.physicalVerdict='pass'
 ];
 for(const edit of edits){
  const c=structuredClone(catalog);edit(c);
  assert.throws(()=>verifyCatalog(c));
 }
});
test('CSV header missing source metadata, mutated columns and invalid numeric reading fail closed',()=>{
 for(const bad of [
  csv(2).split('\n').slice(2).join('\n'),
  csv(2).replace('DMM_CURRENT_A','MOTOR_INVENTED_CONFIDENCE'),
  csv(2).replace('900,10,200','NaN,10,200'),
  csv(2).replace('900,10,200','900,-1,200'),
  csv(2).replace('900,10,200','900,10,Oops'),
  csv(2).replace('150,0.2','150,Infinity')
 ])assert.throws(()=>auditMotorCsv(bad));
});
test('Malformatted invented foreign dataset and nonphysical target point are rejected',()=>{
 assert.throws(()=>auditMotorCsv(csv(2),{declaredSourceId:'nasa-battery-aging'}),/OpenMCT/);
 assert.throws(()=>assessPublicSourceCoverage(catalog,{intendedVoltageV:-3}),/positive/);
 assert.throws(()=>assessPublicSourceCoverage(catalog,{targetId:''}),/target identity/);
});
test('Model and measurement provenance are distinguishable and physically unverified tiers remain 0',()=>{
 for(const requirement of catalog.requirements){
  assert.ok(requirement.minimumEvidence.length>10);
  assert.equal(typeof requirement.presentForExample,'boolean');
 }
 const r=assessPublicSourceCoverage(catalog);
 assert.ok(r.blockers.length>=5);
 assert.equal(r.requirements.filter(x=>x.physicalTargetEvidenceEstablished===true).length,0);
 assert.equal(r.physicalValidation,'none');
 assert.equal(r.physicalVerdict,'unknown');
});
