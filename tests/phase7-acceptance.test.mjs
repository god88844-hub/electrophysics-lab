import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluatePhase7 } from '../js/phase7/acceptance.js';

const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase7/acceptance.json',import.meta.url),'utf8'));
const hash='a'.repeat(64);
const good=()=>({
  qemu:{format:'invention-lab/phase7-cross-engine/1',result:'pass',
    independentReference:'QEMU RISC-V user-mode',
    compare:{stdout:'g',jsBuffer:'g',jsRegisterX6:103},source:{sha256:hash},compiled:{sha256:hash},
    physicalValidation:'none',realWorldBuildSuccessPercent:null,commitSha:'test-commit'},
  numpy:{format:'invention-lab/phase7-cross-engine/1',result:'pass',
    independentReference:'NumPy',fixtureSha256:hash,
    cases:manifest.requiredIds.slice(1).map(id=>({id,verdict:'pass',maxAbsError:0})),
    physicalValidation:'none',realWorldBuildSuccessPercent:null,commitSha:'test-commit'},
});
test('Phase 7 acceptance: complete manifest is required, not derived from observed reports',()=>{
  const status=evaluatePhase7(manifest,good(),'test-commit');
  assert.equal(status.ok,true);
  assert.equal(status.passed,3);
  assert.equal(status.required,3);
});
test('Phase 7 acceptance: missing QEMU report fails despite two good NumPy cases',()=>{
  const reports=good(); delete reports.qemu;
  const status=evaluatePhase7(manifest,reports,'test-commit');
  assert.equal(status.ok,false);
  assert.match(status.errors.join(' '),/QEMU|Missing/);
});
test('Phase 7 acceptance: missing, duplicate and renamed NumPy cases fail',()=>{
  for(const changed of ['missing','duplicate','renamed']){
    const reports=good();
    if(changed==='missing')reports.numpy.cases.pop();
    if(changed==='duplicate')reports.numpy.cases.push({...reports.numpy.cases[0]});
    if(changed==='renamed')reports.numpy.cases[0].id='unexpected';
    const status=evaluatePhase7(manifest,reports,'test-commit');
    assert.equal(status.ok,false,changed+' cannot pass strict manifest');
  }
});
test('Phase 7 acceptance: wrong source commit and unverified physical stage fail closed',()=>{
  const a=good();a.qemu.commitSha='foreign';
  assert.equal(evaluatePhase7(manifest,a,'test-commit').ok,false);
  const b=good();b.numpy.physicalValidation='complete';
  assert.equal(evaluatePhase7(manifest,b,'test-commit').ok,false);
  const c=good();c.qemu.realWorldBuildSuccessPercent=88;
  assert.equal(evaluatePhase7(manifest,c,'test-commit').ok,false);
});
test('Phase 7 acceptance: a report cannot override a failed or missing case',()=>{
  const a=good();a.numpy.cases[0].verdict='skip';
  assert.equal(evaluatePhase7(manifest,a,'test-commit').ok,false);
  const b=good();b.numpy.cases[0].maxAbsError=1;
  assert.equal(evaluatePhase7(manifest,b,'test-commit').ok,false);
  const c=good();c.qemu.compare.jsBuffer='x';
  assert.equal(evaluatePhase7(manifest,c,'test-commit').ok,false);
});
test('Phase 7 acceptance: the independent manifest itself cannot silently shrink',()=>{
  const edited={...manifest,requiredIds:manifest.requiredIds.slice(1)};
  assert.equal(evaluatePhase7(edited,good(),'test-commit').ok,false);
  const duplicated={...manifest,requiredIds:[manifest.requiredIds[0],manifest.requiredIds[0],manifest.requiredIds[2]]};
  assert.equal(evaluatePhase7(duplicated,good(),'test-commit').ok,false);
});
