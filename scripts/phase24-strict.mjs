// Independent strict replay of frozen RTL/stimulus and unmeasured template files.
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {RTL_PATH,RTL_GIT_BLOB,SUITE_SHA256,template,stimulus,
 replayTemplate,preflight} from '../js/measure/phase24-prototype.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const out='benchmarks/evidence/phase24/';
try{
 const source=execFileSync('git',['hash-object',RTL_PATH],{encoding:'utf8'}).trim();
 if(source!==RTL_GIT_BLOB)throw Error('Source RTL changed since protocol was frozen');
 const [policyText,raw,summaryText]=await Promise.all([
  readFile('benchmarks/phase24/acceptance.json','utf8'),
  readFile(out+'capture-template.json','utf8'),
  readFile(out+'phase24-summary.json','utf8')
 ]);
 const p=JSON.parse(policyText),summary=JSON.parse(summaryText),sourceCommit=
  execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const data=JSON.parse(raw),replay=replayTemplate(data,template());
 if(!replay.ok||p.stimulus?.sha256!==SUITE_SHA256||
    p.design?.rtlGitBlob!==RTL_GIT_BLOB||
    p.acquisition?.minIndependentSpecimens!==6||
    p.acquisition?.minManufacturingLots!==2||
    p.acquisition?.minWafersPerLot!==2||
    p.acquisition?.repeatRunsPerSpecimen!==2||
    p.acquisition?.minDistinctPVTCorners!==3||
    p.acquisition?.sourceRawFileSha256Required!==true||
    p.acquisition?.independentReviewerRequired!==true||
    p.acquisition?.instrumentCalibrationRequired!==true||
    p.acquisition?.independentPackageAndMaskTraceRequired!==true||
    p.fieldPolicy?.physicalValidation!=='none'||p.fieldPolicy?.physicalVerdict!=='unknown'||
    p.fieldPolicy?.realWorldBuildSuccessPercent!==null||
    summary.sourceCommit!==sourceCommit||summary.actualRTLBlob!==source||
    summary.expectedRTLBlob!==RTL_GIT_BLOB||
    summary.vectorSuiteSha256!==SUITE_SHA256||
    summary.policySha256!==sha(policyText)||
    summary.captureTemplateSha256!==sha(raw)||
    summary.stimulusPlanned!==stimulus().length||
    summary.actualPhysicalObservations!==0||
    summary.reportedStatus!=='awaiting-real-hardware'||
    summary.physicalValidation!=='none'||summary.physicalVerdict!=='unknown'||
    summary.realWorldBuildSuccessPercent!==null)
  throw Error('Phase24 physical-readiness report is not reproducible from original bytes');
 console.log('PH24 STRICT PASS: source-locked 1024-vector plan, no fake acquisition and zero real ALU measurements');
}catch(e){console.error('PH24 STRICT FAIL: '+e.message);process.exitCode=1;}
