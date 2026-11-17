// Generate a physically UNMEASURED test plan and a defensible blockers report.
// This command does NOT synthesize or invent a single hardware observation.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {RTL_PATH,RTL_GIT_BLOB,SUITE_SHA256,template,preflight,stimulus}
 from '../js/measure/phase24-prototype.js';
const out='benchmarks/evidence/phase24/';
const policy=JSON.parse(await readFile('benchmarks/phase24/acceptance.json','utf8'));
if(policy.format!=='invention-lab/phase24-physical-alu-protocol/1'||
   policy.protocolId!=='sky130-alu8-physical-experiment-v1'||
   policy.design?.rtlPath!==RTL_PATH||policy.design?.rtlGitBlob!==RTL_GIT_BLOB||
   policy.design?.manufacturedEquivalentProven!==false||
   policy.stimulus?.count!==1024||policy.stimulus.sha256!==SUITE_SHA256||
   policy.acquisition?.minIndependentSpecimens!==6||
   policy.acquisition?.minManufacturingLots!==2||
   policy.acquisition?.minWafersPerLot!==2||
   policy.acquisition?.repeatRunsPerSpecimen!==2||
   policy.acquisition?.minDistinctPVTCorners!==3||
   policy.acquisition?.instrumentCalibrationRequired!==true||
   policy.acquisition?.independentReviewerRequired!==true||
   policy.acquisition?.sourceRawFileSha256Required!==true||
   policy.acquisition?.independentPackageAndMaskTraceRequired!==true||
   policy.fieldPolicy?.physicalValidation!=='none'||
   policy.fieldPolicy?.physicalVerdict!=='unknown'||
   policy.fieldPolicy?.realWorldBuildSuccessPercent!==null)
 throw Error('Frozen physical acquisition protocol tampered/relaxed');
const gitBlob=execFileSync('git',['hash-object',RTL_PATH],{encoding:'utf8'}).trim();
if(gitBlob!==RTL_GIT_BLOB)throw Error('Actual synthesizable ALU RTL differs from frozen physical capture design');
const empty=template(),assessment=preflight(empty,{expectedSourceBlob:gitBlob});
if(assessment.status!=='awaiting-real-hardware'||assessment.observationsComplete!==0||
   assessment.physicalValidation!=='none'||assessment.realWorldBuildSuccessPercent!==null)
 throw Error('Invalid real-hardware evidence preflight result');
await mkdir(out,{recursive:true});
await writeFile(out+'capture-template.json',JSON.stringify(empty,null,2)+'\n');
const sha=x=>createHash('sha256').update(x).digest('hex');
const summary={
 format:'invention-lab/phase24-independent-physical-capture-readiness/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 actualRTLBlob:gitBlob,
 expectedRTLBlob:RTL_GIT_BLOB,
 vectorSuiteSha256:SUITE_SHA256,
 policySha256:sha(await readFile('benchmarks/phase24/acceptance.json')),
 captureTemplateSha256:sha(await readFile(out+'capture-template.json')),
 stimulusPlanned:stimulus().length,
 actualPhysicalObservations:assessment.observationsComplete,
 reportedStatus:assessment.status,
 blockerCount:assessment.blockers.length,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
 evidenceLimit:'No physical ALU chip, independent lab or real instrument raw trace was provided in the repository',
 requiredBeforePhysicalEvaluation:[
  'traceable original ALU die/package/mask build chain',
  'independent immutable instrument exports and calibrated measurement chain',
  'independent lab acquisition review and finite measurement uncertainty',
  'independent specimen, wafer, lot and PVT holdouts',
  'matched observed timing and digital behavior under prespecified limits'
 ]
};
await writeFile(out+'phase24-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log('PH24 genuine physical acquisition protocol created: 1024 locked vectors, ZERO hardware readings');
console.log('PH24 status awaiting real DUT, calibration and independent review; fabrication success UNKNOWN');
