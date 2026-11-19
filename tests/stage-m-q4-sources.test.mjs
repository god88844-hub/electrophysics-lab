import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const dir = new URL('../designs/stage-m/q4-candidates/', import.meta.url);
const cells = ['q4_thresh_det','q4_inv','q4_mux4','q4_half_adder'];
const actualModels = new Set([
  'sky130_fd_pr__nfet_01v8_lvt','sky130_fd_pr__nfet_01v8',
  'sky130_fd_pr__pfet_01v8','sky130_fd_pr__pfet_01v8_hvt'
]);
for (const cell of cells) test(cell+' has only the pinned SKY130 01v8 MOS model family and balanced subcircuits', async () => {
  const spice = await readFile(new URL(cell+'.spice', dir),'utf8');
  assert.doesNotMatch(spice,/pfet_01v8_lvt/i);
  assert.doesNotMatch(spice,/^\s*\.(?:include|lib|control|shell)\b/im);
  const start=[...spice.matchAll(/^\s*\.subckt\s+(\S+)/gmi)].map(m=>m[1]);
  const end=[...spice.matchAll(/^\s*\.ends\s+(\S+)/gmi)].map(m=>m[1]);
  assert.deepEqual(start,end);
  assert.ok(start.includes(cell));
  let count=0;
  for(const line of spice.split(/\r?\n/)){
    const m=/^\s*X\w+\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(sky130_fd_pr__\S+)\s+w=(\S+)\s+l=(\S+)/i.exec(line);
    if(!m || !m[5].startsWith('sky130_fd_pr__')) continue;
    assert.ok(actualModels.has(m[5]),'unapproved transistor: '+m[5]);
    assert.ok(Number(m[6])>0&&Number(m[7])>0,'invalid geometry');
    count++;
  }
  assert.ok(count>=12,'missing actual transistor instances');
});
test('half adder contains the ten 4:1 source-derived muxes',async()=>{
 const spice=await readFile(new URL('q4_half_adder.spice',dir),'utf8');
 const body=spice.split('.subckt q4_half_adder')[1].split('.ends q4_half_adder')[0];
 const mux=(body.match(/^\s*X(?:sum|carry)_[ab]\d?\s+.*\sq4_mux4\s*$/gmi)||[]);
 assert.equal(mux.length,10);
});
