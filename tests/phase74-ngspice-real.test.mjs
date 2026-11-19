import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveNgspice} from '../js/bench/ngspice-adapter.js';
import {runMvlNgspiceMeasurements} from '../js/evidence/phase74-noise-margins.js';
test('Actual ngspice DC and transient wrdata parsers run without synthetic substitution',{
 skip:process.env.PHASE74_SPICE_REQUIRED!=='1'
},async()=>{
 const solver=await resolveNgspice(process.env.NGSPICE_EXEC||'/usr/bin/ngspice');
 assert.ok(solver?.exe,'ngspice must be installed for the required test');
 const dcDeck=String.raw`* Original reference-only ohmic DC sweep, not an authentic PDK inverter
V1 n 0 0
R1 n 0 1k
.control
dc V1 0 3.3 1.1
wrdata dc.txt v(n)
quit
.endc
.end`;
 const transientDeck=String.raw`* Original reference-only ohmic transient sweep, not an authentic PDK inverter
V1 n 0 PULSE(0 3.3 0 1n 1n 5n 10n)
R1 n 0 1k
.control
tran 1n 12n
wrdata transient.txt v(n)
quit
.endc
.end`;
 const out=await runMvlNgspiceMeasurements({
  exe:solver.exe,dcDeck,transientDeck});
 assert.equal(out.status,'MEASURED_SPICE_TRACES',JSON.stringify(out));
 assert.equal(out.verifiedPdk,false);
 assert.equal(out.results.length,2);
 assert.ok(out.results[0].rows[0].length>=3);
 assert.ok(out.results[1].rows[0].length>=3);
 const values=out.results[0].rows[0].map(x=>x.y);
 assert.ok(values.some(v=>Math.abs(v-3.3)<1e-6));
});
