// Strict Phase 8 CI gate: all 12 frozen RV32M reference outcomes must exist.
// An absent QEMU tool, a missing report, a short output or a hash drift FAILS.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {evaluatePhase8} from '../js/phase8/acceptance.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=rel=>path.join(root,rel);
const json=async rel=>JSON.parse(await readFile(file(rel),'utf8'));
const sha=buf=>createHash('sha256').update(buf).digest('hex');
try{
  const [manifest,report,assembly]=await Promise.all([
    json('benchmarks/phase8/acceptance.json'),
    json('benchmarks/evidence/phase8-rv32m.json'),
    readFile(file('benchmarks/phase8/rv32m-operations.S')),
  ]);
  const state=evaluatePhase8(manifest,report,{
    sourceSha256:sha(assembly),commitSha:process.env.GITHUB_SHA||null,
  });
  const summary={
    format:'invention-lab/phase8-rv32m-summary/1',
    commitSha:process.env.GITHUB_SHA||null,
    outcome:state.ok?'pass':'fail',passed:state.passed,required:state.required,
    errors:state.errors,physicalValidation:'none',
    realWorldBuildSuccessPercent:null,
    note:'Software-only RV32M arithmetic differential against independent QEMU; no full ACT4 suite or physical validation.',
  };
  await mkdir(file('benchmarks/evidence'),{recursive:true});
  await writeFile(file('benchmarks/evidence/phase8-summary.json'),JSON.stringify(summary,null,2)+'\n');
  process.stdout.write('Phase 8 strict RV32M: '+summary.outcome+' ('+state.passed+'/'+state.required+')\n');
  if(!state.ok){
    for(const e of state.errors)process.stderr.write('FAIL '+e+'\n');
    process.exitCode=1;
  }
}catch(err){
  process.stderr.write('Phase 8 strict: unavailable or invalid required evidence — '+err.message+'\n');
  process.exitCode=1;
}
