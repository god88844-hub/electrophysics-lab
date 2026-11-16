// Mandatory external Phase 7 evidence gate. Run after real QEMU and NumPy jobs.
// Never infer PASS from an absent artifact or a subset of benchmark cases.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { evaluatePhase7 } from '../js/phase7/acceptance.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
try {
  const [manifest,qemu,numpy]=await Promise.all([
    read('benchmarks/phase7/acceptance.json'),
    read('benchmarks/evidence/phase7-rv32i.json'),
    read('benchmarks/evidence/phase7-numpy.json'),
  ]);
  const status=evaluatePhase7(manifest,{qemu,numpy},process.env.GITHUB_SHA||null);
  const summary={
    format:'invention-lab/phase7-evidence-summary/1',
    sourceCommit:process.env.GITHUB_SHA||null,
    status:status.ok?'pass':'fail',
    passed:status.passed,required:status.required,errors:status.errors,
    physicalValidation:'none',
    realWorldBuildSuccessPercent:null,
    scope:'bounded external computational cross-check only; not ISA certification or hardware verification',
  };
  await writeFile(path.join(root,'benchmarks/evidence/phase7-summary.json'),
    JSON.stringify(summary,null,2)+'\n');
  process.stdout.write('Phase 7 external reference: '+summary.status+
    ' ('+status.passed+'/'+status.required+'); physical=none\n');
  if(!status.ok){
    for(const error of status.errors)process.stderr.write('FAIL: '+error+'\n');
    process.exitCode=1;
  }
}catch(err){
  process.stderr.write('Phase 7 evidence could not be read/verified: '+err.message+'\n');
  process.exitCode=1;
}
