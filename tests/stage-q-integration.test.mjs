import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fpgaLogicSpec,emitFPGAVerilog,encodeFPGAFrame,decodeFPGAFrame}
 from '../js/hardware/phase93-fpga.js';
import {parseSCPIAsciiWaveform,compareCapturedWaveform}
 from '../js/hardware/phase94-instrument-ingest.js';
import {planTapeout} from '../js/hardware/phase95-tapeout-package.js';
import {evaluatePhysicalQualification} from '../js/hardware/phase96-physical-qualification.js';
import {PHASE76_FORMAT} from '../js/evidence/phase76-virtual-passport.js';
test('Stage Q FPGA mock -> real-like captured trace -> NO-GO survives full cross-stage chain',()=>{
 const q4=fpgaLogicSpec({radix:4});
 const rtl=emitFPGAVerilog(q4);
 assert.match(rtl.content,/case \(\{a,b\}\)/);
 const signal=decodeFPGAFrame(encodeFPGAFrame({sequence:1,a:3,b:2,sum:1,carry:1}));
 assert.equal(signal.sum,1);assert.equal(signal.hardwareMeasurementAuthenticated,false);
 const trace=parseSCPIAsciiWaveform('0,1.12,2.21,3.22',{timeIncrementS:1e-9});
 const comparison=compareCapturedWaveform({trace,simulation:[0,1.1,2.2,3.3],
  absoluteTolerance:.1});
 assert.equal(comparison.outsideDeclaredTolerance,0);
 const tapeout=planTapeout({designId:'q4-demo',foundry:'GF180MCU'});
 assert.equal(tapeout.foundrySubmissionAuthorized,false);
 const passport=evaluatePhysicalQualification({
  level1Passport:{format:PHASE76_FORMAT,designId:'q4-demo',
   status:'INSUFFICIENT_MODEL_DATA',physicallyQualified:false,
   productionReleaseAuthorized:false}});
 assert.equal(passport.status,'UNQUALIFIED_NO_GO');
 assert.equal(passport.productionReleaseAuthorized,false);
});
