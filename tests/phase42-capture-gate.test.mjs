import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyCaptureProtocol,parseCaptureCSV,inspectCaptureImport,
 blankCaptureEvidence,sha256,COLUMNS} from '../js/measure/phase42-capture-gate.js';
const protocol=JSON.parse(readFileSync(new URL('../benchmarks/phase42/physical-capture-protocol.json',import.meta.url)));
const header=COLUMNS.join(',');
function synthetic(n=10){
 const rows=[header];
 for(let i=0;i<n;i++)rows.push([i*0.005,3.05-i*0.001,2.85-i*0.0002,
  0.12+i*0.0005,2000+i*2,24.0+i*0.001,23].join(','));
 return rows.join('\n')+'\n';
}
function meta(){
 return Object.fromEntries(protocol.requiredSourceMetadata.map(k=>[k,k==='instrumentList'?
  [{id:'synthetic-test-only',calibration:'unverified'}]:
  k==='instrumentCalibrationReviewRefs'?['unverified-test-string']:
  k==='designId'?protocol.referenceDesignId:
  k==='rawFileSHA256'?sha256(synthetic()):'synthetic-test-only']));
}
test('Original instrument capture protocol is a blank plan, not fake physical results',()=>{
 assert.equal(verifyCaptureProtocol(protocol),true);
 assert.equal(protocol.actualSourceMatchedFanMeasurements,0);
 assert.equal(protocol.measuredPhysicalSessionCount,0);
 assert.equal(protocol.safeCurrentLimitA,null);
 assert.equal(protocol.qualifiedImpellerMaxRpm,null);
});
test('Actual published source sample counts are NEVER manufactured by planning-only reports',()=>{
 const r=blankCaptureEvidence(protocol);
 assert.equal(r.sourceMatchedSessionsRecorded,0);
 assert.equal(r.originalPhysicalFanSensorReadings,0);
 assert.equal(r.hardwareBuildAuthorized,false);
 assert.equal(r.realWorldBuildSuccessPercent,null);
 assert.ok(Object.isFrozen(r));
});
test('Synthetic example can be parsed for software math only',()=>{
 const csv=synthetic();
 const x=parseCaptureCSV(csv);
 assert.equal(x.rawSampleCount,10);
 assert.equal(x.maximumReportedTachSpeedRpm,2018);
 assert.equal(x.meanPackVoltageV>3,true);
 assert.equal(x.sourceIsIndependentlyVerified,false);
 assert.equal(x.numberOfIndependentPhysicalSpecimens,null);
 assert.equal(x.physicalValidation,'none');
});
test('Perfect-looking sensor sample and all self-reported certificates cannot obtain physical validation',()=>{
 const csv=synthetic(),m=meta();
 const out=inspectCaptureImport(protocol,csv,m);
 assert.equal(out.sourceHashInternallyConsistent,true);
 assert.equal(out.missingSourceMetadataFields.length,0);
 assert.equal(out.canBeUsedAsUnreviewedDescriptiveData,true);
 assert.equal(out.originalPhysicalSourceIndependentlyAuthenticated,false);
 assert.equal(out.physicalHardwareValidationAuthorized,false);
 assert.equal(out.realWorldBuildSuccessPercent,null);
 assert.equal(out.admission,'QUARANTINED_AWAITING_EXTERNAL_INSTRUMENT_AND_HARDWARE_REVIEW');
});
test('Missing instrument calibration, actual specimen and review references are exposed as gaps',()=>{
 const x=inspectCaptureImport(protocol,synthetic(),{});
 assert.ok(x.missingSourceMetadataFields.includes('impellerSpecimenId'));
 assert.ok(x.missingSourceMetadataFields.includes('instrumentCalibrationReviewRefs'));
 assert.equal(x.canBeUsedAsUnreviewedDescriptiveData,false);
});
test('Tampered or wrong original raw file SHA blocks descriptive source matching',()=>{
 const m=meta();m.rawFileSHA256='0'.repeat(64);
 const x=inspectCaptureImport(protocol,synthetic(),m);
 assert.equal(x.sourceHashInternallyConsistent,false);
 assert.equal(x.canBeUsedAsUnreviewedDescriptiveData,false);
 assert.equal(x.originalPhysicalSourceIndependentlyAuthenticated,false);
});
test('Malformed sensor data fail rather than quietly filling missing inputs',()=>{
 const original=synthetic();
 const failures=[
  original.replace('shaft_rpm','shaft_setpoint_rpm'),
  original.replace('0.12,2000','0.12,NaN'),
  original.replace('0.12,2000','0.12,-5'),
  original.replace('0.12,2000','0.12,999999'),
  original.replace('0.12,2000','0.12,'),
  original.replace('0,3.05','-1,3.05'),
  original.replace('0.005,3.049','0,3.049'),
  original.replace('2.85,0.12','80,0.12'),
  original.replace('0.12,2000','50.1,2000'),
  original.replace('0.12,2000','0.12,2000,9'),
  original.slice(0,original.indexOf('\n',original.indexOf('\n')+1)+1)
 ];
 for(const corrupted of failures){
  assert.notEqual(corrupted,original);
  assert.throws(()=>parseCaptureCSV(corrupted));
 }
});
test('Removed scientific and safety requirements can never be considered the same original protocol',()=>{
 const mutants=[
  x=>x.captureState='PHYSICAL_TESTED',
  x=>x.requiredCSVColumns.pop(),
  x=>x.units.motor_current_a='mA',
  x=>x.requiredSourceMetadata.pop(),
  x=>x.requiredInstrumentChannels.pop(),
  x=>x.requiredInstrumentChannels[0].mandatoryCalibration=false,
  x=>x.prerequisites.pop(),
  x=>x.safeCurrentLimitA=5,
  x=>x.qualifiedImpellerMaxRpm=20000,
  x=>x.actualSourceMatchedFanMeasurements=10000,
  x=>x.independentHardwareEvidenceReviewed=true,
  x=>x.measuredPhysicalSessionCount=1,
  x=>x.realWorldBuildSuccessPercent=99,
  x=>x.physicalVerdict='pass'
 ];
 for(const modify of mutants){const x=structuredClone(protocol);modify(x);
  assert.throws(()=>verifyCaptureProtocol(x));}
});
test('Wrong design identity or forged external metadata does not qualify fake data',()=>{
 const m=meta();m.designId='fake-design';m.externalReviewCertified=true;
 m.realWorldBuildSuccessPercent=100;
 const x=inspectCaptureImport(protocol,synthetic(),m);
 assert.ok(x.sourceMetadataDiscrepancies.some(s=>s.includes('design identity')));
 assert.equal(x.physicalValidation,'none');
 assert.equal(x.physicalVerdict,'unknown');
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Data rows never count as independent motors, batteries or fan specimens',()=>{
 const csv=synthetic(1500);
 const m=meta();m.rawFileSHA256=sha256(csv);
 const x=inspectCaptureImport(protocol,csv,m);
 assert.equal(x.rawSummary.rawSampleCount,1500);
 assert.equal(x.importedRowsAreNotIndependentManufacturingSamples,true);
 assert.equal(x.rawSummary.numberOfIndependentPhysicalSpecimens,null);
 assert.equal(x.originalPhysicalSourceIndependentlyAuthenticated,false);
});
