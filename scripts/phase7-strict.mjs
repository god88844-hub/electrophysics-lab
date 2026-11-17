// Mandatory external Phase 7 evidence gate. Run after real QEMU and NumPy jobs.
// Never infer PASS from an absent artifact or a subset of benchmark cases.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
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
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
  const [rv32Source,tensorFixture]=await Promise.all([
    readFile(path.join(root,'benchmarks/phase7/rv32i-sum.S')),
    readFile(path.join(root,'benchmarks/phase7/tensor-cases.json')),
  ]);
  if(hash(rv32Source)!==qemu?.source?.sha256)status.errors.push('QEMU source artifact checksum drift');
  if(hash(tensorFixture)!==numpy?.fixtureSha256)status.errors.push('NumPy fixture artifact checksum drift');
  if(!qemu?.toolVersions?.assembler||!qemu?.toolVersions?.linker||!qemu?.toolVersions?.emulator)
    status.errors.push('QEMU tool versions not recorded');
  if(!numpy?.version)status.errors.push('NumPy version not recorded');
  status.ok=status.ok&&status.errors.length===0;
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
