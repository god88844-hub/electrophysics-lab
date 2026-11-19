import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createVirtualComputer,validateVirtualComputer,bootVirtualComputer,
 createForthMonitor,bootLinuxImage} from '../js/scene/stage-p-virtual-computer.js';
import {createCustomISA} from '../js/scene/stage-p-custom-isa.js';
test('3D virtual computer wiring requires CPU RAM ROM IRQ UART and display',()=>{
 const board=createVirtualComputer();
 assert.equal(validateVirtualComputer(board).connected,true);
 assert.equal(board.nodes.length,6);
 assert.ok(board.buses.some(x=>x.protocol==='instruction'));
 const invalid=structuredClone(board);invalid.buses.pop();
 assert.throws(()=>validateVirtualComputer(invalid),/Disconnected bus/);
});
test('custom Q4 CPU boots ROM and writes deterministic data to UART/display',()=>{
 const board=createVirtualComputer({isa:createCustomISA(),
  romSource:'LDI Q0, 65\nOUT Q0\nLDI Q0, 66\nOUT Q0\nHALT'});
 const r=bootVirtualComputer(board);
 assert.equal(r.status,'ROM_HALTED');
 assert.deepEqual(r.uart.map(x=>x.text),['65','66']);
 assert.ok(r.displayText.includes('65'));
 assert.equal(r.linuxBooted,false);
});
test('interactive restricted Forth shell supports stack, arithmetic and RAM',()=>{
 const shell=createForthMonitor(createVirtualComputer());
 assert.equal(shell.run('12 30 + .').stdout,'42');
 assert.equal(shell.run('99 3 ! 3 @ .').stdout,'99');
 assert.equal(shell.run('65 EMIT').stdout,'A');
 assert.throws(()=>shell.run('require("fs")'),/Unsupported/);
 assert.throws(()=>shell.run('+'),/underflow/);
});
test('Linux boot is rejected instead of inventing a kernel boot result',()=>{
 const result=bootLinuxImage();
 assert.equal(result.linuxBooted,false);
 assert.equal(result.status,'UNSUPPORTED_CPU_ISA_OR_MACHINE_ABI');
});
