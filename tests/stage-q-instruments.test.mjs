import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSCPIAsciiWaveform,parseSigrokCSV,parseSensorCSV,
 parseTektronixCSV,makeInstrumentSession,querySCPIInstrument,
 pollInstrumentTrace,compareCapturedWaveform,capturedTraceToSceneOverlay}
 from '../js/hardware/phase94-instrument-ingest.js';
test('SCPI ASCII pulse capture and alignment check compare physical vs simulated data',()=>{
 const t=parseSCPIAsciiWaveform('0,1.1,2.2,3.3',{timeIncrementS:1e-6});
 assert.deepEqual(t.values,[0,1.1,2.2,3.3]);
 assert.equal(t.times.length,4);
 const c=compareCapturedWaveform({trace:t,simulation:[0,1.15,2.15,3.25],
  absoluteTolerance:.1});
 assert.equal(c.samples,4);
 assert.equal(c.outsideDeclaredTolerance,0);
 assert.equal(c.physicalQualification,'NO_GO');
 assert.equal(capturedTraceToSceneOverlay(t).samples.length,4);
 assert.throws(()=>parseSCPIAsciiWaveform('#81000101010',{timeIncrementS:1e-6}),/binary/);
});
test('sigrok CSV requires real monotonically timestamped binary values',()=>{
 const t=parseSigrokCSV('Time,D0\n0,0\n0.00001,1\n0.00002,0');
 assert.deepEqual(t.values,[0,1,0]);
 assert.throws(()=>parseSigrokCSV('Time,D0\n0,0\n0,1'),/monotonic/);
 assert.throws(()=>parseSigrokCSV('Time,D0\n0,4'),/sample/);
});
test('physical sensor CSV recognizes temperature units and monotonic acquisition',()=>{
 const x=parseSensorCSV('t_s,temperature_c\n0,25\n1,27.3');
 assert.equal(x.unit,'degC');assert.deepEqual(x.values,[25,27.3]);
 assert.equal(x.originalCaptureAuthenticated,false);
});
test('mock read-only injected SCPI transport cannot execute arbitrary instrument commands',async()=>{
 let calls=0;
 const transport={async query(c){calls++;return c==='*IDN?'?
  'TEKTRONIX,TDS2012C,UNVERIFIED,1.0':'0,1,2,3';}};
 const id=await querySCPIInstrument({transport,command:'*IDN?'});
 assert.match(id.response,/TEKTRONIX/);
 await assert.rejects(querySCPIInstrument({transport,command:'SYST:EXEC dangerous'}),
  /allowed read-only/);
 const session=makeInstrumentSession({designId:'q4-board',
  instrumentModel:'TDS2012C',instrumentSerial:'C011240',operatorId:'operator-1'});
 const capture=await pollInstrumentTrace({transport,session,
  parameters:{timeIncrementS:1e-6}});
 assert.equal(capture.trace.values.length,4);
 assert.equal(capture.physicalQualification,'NO_GO');
 assert.equal(calls,2);
});
test('Tektronix original-record format claims are parsed, not authenticated',()=>{
 const input=['Record Length,3,,0,0.08,',
  'Vertical Units,V,,0.0000004,0.10,',
  'Model Number,TDS2012C,,-0.0000004,-0.2,',
  'Serial Number,C011240,,0.0000008,0.12,',
  'Horizontal Units,s,,0.0000012,0.15,'].join('\n');
 assert.throws(()=>parseTektronixCSV(input),/monotonic|record/);
 const ok=['Record Length,3,,0,0.08,',
  'Vertical Units,V,,0.0000004,0.10,',
  'Model Number,TDS2012C,,0.0000008,-0.2,',
  'Serial Number,C011240,,0.0000012,0.12,',
  'Horizontal Units,s,,0.0000016,0.15,'].join('\n')
  .replace('Record Length,3','Record Length,5');
 const result=parseTektronixCSV(ok);
 assert.equal(result.values.length,5);
 assert.equal(result.originalCaptureAuthenticated,false);
});
