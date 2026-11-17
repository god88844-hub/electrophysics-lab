// Independent Phase 9 evidence can pass only when real ORT outputs were
// produced and checked against frozen source bytes and a reviewed manifest.
// Missing files, QEMU/ORT prerequisites or a single failing case are FAIL.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {evaluatePhase9Evidence} from '../js/phase9/acceptance.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=p=>path.join(root,p);
const h=v=>createHash('sha256').update(v).digest('hex');
try{
  const [manifest,fixtureBytes,oracleBytes,report]=await Promise.all([
    readFile(file('benchmarks/phase9/acceptance.json'),'utf8').then(JSON.parse),
    readFile(file('benchmarks/phase9/graphs.json')),
    readFile(file('scripts/phase9-onnxruntime-oracle.py')),
    readFile(file('benchmarks/evidence/phase9-onnx.json'),'utf8').then(JSON.parse)
  ]);
  const verdict=evaluatePhase9Evidence(manifest,report,JSON.parse(fixtureBytes),{
    commitSha:process.env.GITHUB_SHA||null,
    fixtureSha256:h(fixtureBytes),oracleSourceSha256:h(oracleBytes),
  });
  // Every real ONNX protobuf is preserved as a CI artifact, and its raw
  // SHA-256 is independently checked against the model actually executed.
  const modelDirectory=file('benchmarks/evidence/phase9-models');
  const modelNames=(await readdir(modelDirectory)).sort();
  const requiredModels=manifest.requiredCases.map(c=>c.id+'.onnx').sort();
  if(JSON.stringify(modelNames)!==JSON.stringify(requiredModels))
    verdict.errors.push('Generated ONNX model files are missing, duplicated or unexpected');
  for(const expected of manifest.requiredCases){
    const id=expected.id;
    if(!/^[a-z][a-z0-9-]{0,39}$/.test(id)){
      verdict.errors.push('Unsafe generated model filename');continue;
    }
    const row=report.cases?.find(c=>c.id===id);
    const modelBytes=await readFile(path.join(modelDirectory,id+'.onnx'));
    if(h(modelBytes)!==row?.modelSha256)
      verdict.errors.push('Actual ONNX binary SHA-256 mismatch for '+id);
  }
  verdict.ok=verdict.ok&&verdict.errors.length===0;
  const summary={
    format:'invention-lab/phase9-onnx-summary/1',
    sourceCommit:process.env.GITHUB_SHA||null,
    status:verdict.ok?'pass':'fail',
    passed:verdict.passed,required:verdict.required,errors:verdict.errors,
    physicalValidation:'none',realWorldBuildSuccessPercent:null,
    scope:'Five small 2D float32 ONNX opset-13 graphs; no MLPerf, complete ONNX certification or real hardware.',
  };
  await mkdir(file('benchmarks/evidence'),{recursive:true});
  await writeFile(file('benchmarks/evidence/phase9-summary.json'),JSON.stringify(summary,null,2)+'\n');
  process.stdout.write('Phase 9 strict ONNX CPU reference: '+summary.status+' ('+summary.passed+'/'+summary.required+')\n');
  for(const error of verdict.errors)process.stderr.write('FAIL '+error+'\n');
  if(!verdict.ok)process.exitCode=1;
}catch(error){
  process.stderr.write('Phase 9 strict ONNX reference missing or malformed: '+error.message+'\n');
  process.exitCode=1;
}
