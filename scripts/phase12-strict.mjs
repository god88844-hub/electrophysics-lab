// Phase 12 mandatory independent evidence verifier. Missing dataset, wrong
// UCI attribution, copied training labels, model bytes or reference signals
// must fail rather than being reported as a successful physical experiment.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluatePhase12} from '../js/phase12/acceptance.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=x=>path.join(root,x);
const sha=x=>createHash('sha256').update(x).digest('hex');
try{
  const [datasetBytes,fixtureBytes,acceptanceBytes,oracleSource,record,modelBytes,modelFiles]=await Promise.all([
    readFile(file('benchmarks/phase12/iris.csv')),
    readFile(file('benchmarks/phase12/iris-mlp.json')),
    readFile(file('benchmarks/phase12/acceptance.json')),
    readFile(file('scripts/phase12-iris-reference.py')),
    readFile(file('benchmarks/evidence/phase12-iris.json'),'utf8').then(JSON.parse),
    readFile(file('benchmarks/evidence/phase12-models/iris-mlp.onnx')),
    readdir(file('benchmarks/evidence/phase12-models')),
  ]);
  const fixture=JSON.parse(fixtureBytes);
  const verdict=evaluatePhase12(JSON.parse(acceptanceBytes),fixture,record,{
    commitSha:process.env.GITHUB_SHA||null,
    sourceCsvSha256:sha(datasetBytes),
    fixtureSha256:sha(fixtureBytes),
    oracleSha256:sha(oracleSource),
    modelSha256:sha(modelBytes),
  });
  if(modelFiles.length!==1||modelFiles[0]!=='iris-mlp.onnx')
    verdict.errors.push('Missing or extra ONNX protobuf reference file');
  // Check all held-out raw samples, class counts, split completeness,
  // and independent train-only sample mean and population standard dev.
  const lines=datasetBytes.toString('utf8').trim().split('\n');
  if(lines.length!==151||lines[0]!=='150,4,setosa,versicolor,virginica')
    verdict.errors.push('Altered UCI dataset source line count/header');
  else{
    const data=lines.slice(1).map(line=>line.split(',').map(Number));
    if(data.some(row=>row.length!==5||row.some(v=>!Number.isFinite(v))))
      verdict.errors.push('Invalid source Iris numerical measurements');
    else{
      const train=fixture.split.trainIndices,test=fixture.split.testIndices;
      if(JSON.stringify(test.map(i=>data[i].slice(0,4)))!==
           JSON.stringify(fixture.split.holdoutRawFeatures))
        verdict.errors.push('Held-out raw measurements do not match authentic committed source CSV');
      if(JSON.stringify(test.map(i=>data[i][4]))!==
           JSON.stringify(fixture.split.holdoutLabels))
        verdict.errors.push('Held-out labels do not match committed source CSV');
      const hist=[0,0,0],trainHist=[0,0,0];
      for(const row of data)if(Number.isInteger(row[4])&&row[4]>=0&&row[4]<=2)hist[row[4]]++;
      for(const i of train)if(Number.isInteger(data[i]?.[4])&&data[i][4]>=0&&data[i][4]<=2)trainHist[data[i][4]]++;
      if(JSON.stringify(hist)!=='[50,50,50]'||JSON.stringify(trainHist)!=='[40,40,40]')
        verdict.errors.push('Entire 150-row source class distribution or training-only stratification changed');
      for(let feature=0;feature<4;feature++){
        const vals=train.map(i=>data[i][feature]);
        const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
        const scale=Math.sqrt(vals.reduce((a,x)=>a+(x-mean)**2,0)/vals.length);
        if(Math.abs(mean-fixture.training.mean[feature])>1e-8||
           Math.abs(scale-fixture.training.scale[feature])>1e-8)
          verdict.errors.push('Preprocessing is not reproducibly fit on training rows only, feature '+feature);
      }
    }
  }
  verdict.ok=verdict.ok&&verdict.errors.length===0;
  const summary={
    format:'invention-lab/phase12-model-summary/1',
    commitSha:process.env.GITHUB_SHA||null,
    status:verdict.ok?'pass':'fail',passed:verdict.passed,required:verdict.required,
    correct:record.correct,holdout:30,accuracy:record.accuracy,
    errors:verdict.errors,
    physicalValidation:'none',realWorldBuildSuccessPercent:null,
    scope:'UCI Iris 30 unseen labeled test samples, scikit-learn + actual ONNX Runtime; not any physical chip evidence',
  };
  await mkdir(file('benchmarks/evidence'),{recursive:true});
  await writeFile(file('benchmarks/evidence/phase12-summary.json'),JSON.stringify(summary,null,2)+'\n');
  process.stdout.write('Phase 12 strict real-dataset holdout verification: '+summary.status+
    ' ('+summary.passed+'/'+summary.required+' paired samples; '+record.correct+'/30 correct)\n');
  for(const e of verdict.errors)process.stderr.write('FAIL '+e+'\n');
  if(!verdict.ok)process.exitCode=1;
}catch(e){
  process.stderr.write('Phase 12 required licensed dataset / model evidence missing: '+e.message+'\n');
  process.exitCode=1;
}
