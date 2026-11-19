import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fpgaLogicSpec,emitFPGAVerilog,planOpenFPGAFlow,
 encodeFPGAFrame,decodeFPGAFrame,FPGATelemetryDecoder,makeFPGACaptureSession}
 from '../js/hardware/phase93-fpga.js';
import {attachFPGAWebSerial} from '../js/hardware/phase93-webserial.js';
test('Q4 HDL emits fully enumerated 2-bit-per-quat synthesizable case logic',()=>{
 const s=fpgaLogicSpec({radix:4});
 assert.equal(s.truthTable.length,16);
 assert.deepEqual(s.truthTable.find(x=>x.a===3&&x.b===3),{a:3,b:3,sum:2,carry:1});
 const out=emitFPGAVerilog(s);
 assert.match(out.content,/module invented_q4_half_adder/);
 assert.match(out.content,/input wire \[1:0\]/);
 assert.match(out.content,/case \(\{a,b\}\)/);
 assert.match(out.content,/\{2'd3,2'd3\}: begin sum=2'd2; carry=2'd1;/);
 assert.equal(out.synthesized,false);
 assert.equal(out.physicalValidation,'none');
});
test('board mapping and real FPGA flashing remain explicit opt-in',()=>{
 const s=fpgaLogicSpec();
 assert.throws(()=>planOpenFPGAFlow({spec:s,board:'myboard'}),/constraints/);
 const plan=planOpenFPGAFlow({spec:s,board:'icebreaker',
  pinConstraintsFile:'icebreaker.pcf',device:'hx8k',packageName:'ct256'});
 assert.equal(plan.status,'NOT_APPROVED');
 assert.equal(plan.commands.map(x=>x.bin).join(','),
  'yosys,nextpnr-ice40,icepack,openFPGALoader');
 assert.equal(plan.executed,false);
 assert.equal(plan.bitstreamMeasured,false);
});
test('framed Q4 UART bytes reject parity errors, invalid digits and reordered sequence',()=>{
 const f=encodeFPGAFrame({sequence:12,a:3,b:3,sum:2,carry:1});
 const r=decodeFPGAFrame(f);
 assert.equal(r.sequence,12);
 assert.equal(r.hardwareMeasurementAuthenticated,false);
 assert.throws(()=>decodeFPGAFrame(Uint8Array.from([...f.slice(0,7),0])),/parity/);
 const samples=[],errs=[];
 const d=new FPGATelemetryDecoder({onFrame:x=>samples.push(x),onError:x=>errs.push(x)});
 d.push(Uint8Array.from([9,8,...f.slice(0,3)]));
 d.push(f.slice(3));
 d.push(encodeFPGAFrame({sequence:14,a:0,b:0,sum:0,carry:0}));
 assert.equal(samples.length,1);assert.equal(errs.length,1);
 assert.match(errs[0],/sequence/);
});
test('mock secure WebSerial port streams framed data but never authenticates hardware',async()=>{
 const f=encodeFPGAFrame({sequence:0,a:1,b:3,sum:0,carry:1});
 const events=[];let readCount=0,opened=false,closed=false;
 const port={async open(){opened=true;},readable:{getReader(){return{
  async read(){readCount++;return readCount===1?{value:f,done:false}:{done:true};},
  releaseLock(){},async cancel(){}};
 }},async close(){closed=true;}};
 const serial={requestPort:async()=>port};
 assert.rejects(()=>attachFPGAWebSerial({serial,requestPermission:false}),/permission/);
 const link=await attachFPGAWebSerial({serial,requestPermission:true,
  onFrame:sample=>events.push(sample)});
 await link.closed;
 assert.equal(opened,true);assert.equal(closed,true);
 assert.equal(events.length,1);assert.equal(events[0].sum,0);
 assert.equal(link.hardwareOriginVerified,false);
});
test('named FPGA session remains a claimed metadata envelope, not signoff',()=>{
 const x=makeFPGACaptureSession({designId:'design-q4',
  boardId:'dev-board',deviceSerial:'unknown-serial',operatorId:'operator-a',
  utc:'2026-11-18T12:00:00Z'});
 assert.equal(x.physicalQualification,'NO_GO');
 assert.equal(x.signed,false);
});
