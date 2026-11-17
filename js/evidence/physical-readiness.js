// Phase 13 — independent, fail-closed hardware validation ladder.
// Deliberately distinct from the separate, unmerged Phase 3 experimental
// measurement/calibration modules. This is an educational ALU validation gate,
// not a verified manufacturing/yield estimator.
//
// Every claim requires a stage-specific evidence artifact. "pass" at a lower
// rung cannot be silently promoted to a later physical proof.
export const PHASE13_REPORT_FORMAT='invention-lab/phase13-sky130-evidence/1';
export const PHASE13_MANIFEST_FORMAT='invention-lab/phase13-physical-evidence-acceptance/1';
export const PHYSICAL_STAGES=Object.freeze([
  'rtl-exhaustive','rtl-formal-equivalence','sky130-stdcell-mapping',
  'sta','pvt-corners','place-route-parasitics','drc','lvs',
  'prototype-measurements','measured-calibration'
]);
export const REQUIRED_STAGE_STATUS=Object.freeze({
  'rtl-exhaustive':'pass','rtl-formal-equivalence':'pass','sky130-stdcell-mapping':'pass',
  'sta':'unknown','pvt-corners':'unknown','place-route-parasitics':'unknown',
  'drc':'unknown','lvs':'unknown','prototype-measurements':'unknown',
  'measured-calibration':'unknown'
});
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const validSha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const blob=x=>typeof x==='string'&&/^[a-f0-9]{40}$/.test(x);
const exactLib='5773657fe730d984ac06726d0addfdad80395b9b';
const exactUpstream='7a57dddc8427845f75a14bd975328ee8717a1c8b';
function problem(errors,message){errors.push(message);}
export function evaluatePhase13Evidence(manifest,report,opts={}){
 const errors=[];
 if(manifest?.format!==PHASE13_MANIFEST_FORMAT||
    manifest?.example?.name!=='alu8'||manifest.example.width!==8||
    manifest.example.fullyEnumeratedInputs!==262144||
    !eq(manifest?.example?.operations,['ADD','XOR','AND','SHIFT_LEFT_INSERT'])||
    manifest?.minMappedCells!==1||manifest.maxMappedCells!==10000||
    !eq(manifest?.requiredStatus,REQUIRED_STAGE_STATUS)||
    manifest?.physicalValidation!=='none'||manifest?.realWorldBuildSuccessPercent!==null||
    manifest?.physicalVerdict!=='unknown')
     problem(errors,'Frozen ALU/PVT/physical evidence acceptance policy altered or missing');
 const lib=manifest?.library;
 if(lib?.node!=='SKY130'||lib?.corner!=='tt_025C_1v80'||
    lib?.license!=='Apache-2.0'||lib?.upstreamCommit!==exactUpstream||
    lib?.gitBlobSha1!==exactLib||lib?.bytes!==12800135||
    lib?.productionQualified!==false||lib?.acknowledgeExperimentalPreview!==true)
     problem(errors,'Real source-locked experimental SKY130 Liberty provenance altered');
 if(report?.format!==PHASE13_REPORT_FORMAT||report?.verdict!=='pass')
     problem(errors,'Missing or failed external hardware evidence');
 if(opts.commitSha&&report?.commitSha!==opts.commitSha)
     problem(errors,'Stale workflow source commit');
 if(!blob(report?.libertyGitBlobSha1)||report?.libertyGitBlobSha1!==exactLib)
     problem(errors,'Missing/unpinned Sky130 Liberty Git blob');
 if(report?.libertySizeBytes!==12800135||report?.libertyCorner!=='tt_025C_1v80')
     problem(errors,'Wrong standard-cell library size or PVT corner');
 const hashes=['libertySha256','rtlSha256','specSha256','testbenchSha256',
               'badSpecSha256','exhaustiveLogSha256','formalLogSha256',
               'negativeControlLogSha256','mappingLogSha256','netlistSha256'];
 for(const key of hashes){
   if(!validSha(report?.[key])||(opts[key]&&report[key]!==opts[key]))
     problem(errors,'Missing/altered exact source or generated artifact SHA-256 '+key);
 }
 if(typeof report?.versions?.yosys!=='string'||!report.versions.yosys.includes('Yosys')||
    typeof report?.versions?.iverilog!=='string'||report.versions.iverilog.length<3||
    report?.versions?.os!=='ubuntu-24.04')
     problem(errors,'Missing or unsupported actual open EDA tool provenance');
 if(report?.exhaustive?.expectedVectors!==262144||
    report.exhaustive.testedVectors!==262144||
    report.exhaustive.failed!==0||
    report?.formal?.checked!==true||
    report.formal.assertion!=='equiv_status -assert'||
    report.formal.negativeControlRejected!==true)
     problem(errors,'Behavioral exhaustive count, real formal equivalence or mutant rejection absent');
 const map=report?.mapping;
 if(map?.technique!=='Yosys ABC Liberty technology mapping'||
    map?.library!=='sky130_fd_sc_hd__tt_025C_1v80.lib'||
    map?.corner!=='tt_025C_1v80'||
    !Number.isInteger(map?.mappedCells)||map.mappedCells<1||
    map.mappedCells>10000||
    !Array.isArray(map?.cellTypes)||map.cellTypes.length<1||
    map.cellTypes.some(c=>typeof c!=='string'||!/^sky130_fd_sc_hd__[A-Za-z0-9_]+$/.test(c)))
     problem(errors,'Missing real SKY130 mapping cells or implausible synthesis metrics');
 if(!Array.isArray(report?.stages)||report.stages.length!==PHYSICAL_STAGES.length)
     problem(errors,'Missing/extra physical validation stages');
 else for(let i=0;i<PHYSICAL_STAGES.length;i++){
   const stage=report.stages[i],id=PHYSICAL_STAGES[i];
   if(stage?.id!==id||stage.status!==REQUIRED_STAGE_STATUS[id]||
      stage?.physicalEvidence!==false)
      problem(errors,'Unsupported stage status, order, or false physical proof '+id);
   if(i<3){
     if(!validSha(stage.evidenceSha256)||
       stage?.basis!==(i===0?'exhaustive-simulation':i===1?'formal-rtl-equivalence':'open-standard-cell-liberty'))
       problem(errors,'Missing stage-specific validated computational evidence '+id);
   }else if(stage?.evidenceSha256!==null||stage?.basis!=='not-run')
     problem(errors,'Unexecuted physical stage has invented evidence '+id);
 }
 if(report?.physicalValidation!=='none'||
    report?.realWorldBuildSuccessPercent!==null||
    report?.physicalVerdict!=='unknown'||
    report?.physicalQualified!==false)
     problem(errors,'Technology mapping falsely relabeled as physical qualification or manufacturing-success probability');
 return {ok:errors.length===0,errors,computationalStagesPassed:3,
  physicalStagesPassed:0,physicalVerdict:'unknown',
  physicalQualified:false,realWorldBuildSuccessPercent:null};
}
// Reporting an untrusted JSON file is NOT independent tool execution.
// Only scripts/phase13-strict.mjs reopens and re-hashes actual tool outputs.
// This summary intentionally cannot label self-reported stages "verified".
export function describePhysicalReadiness(evidence){
 const reported=Array.isArray(evidence?.stages)?
   evidence.stages.filter(s=>s.status==='pass'&&
     PHYSICAL_STAGES.slice(0,3).includes(s.id)).map(s=>s.id):[];
 return {
   verdict:'unknown',
   reportedComputationalStages:reported,
   verifiedComputationalStages:[],
   missingPhysicalStages:[...PHYSICAL_STAGES.slice(3)],
   claim:'Untrusted result metadata alone is not a tool proof. Real independent CI logs/model bytes are required; STA, PVT, post-layout, DRC/LVS and silicon measurement are still unverified.',
   physicalQualified:false,
   realWorldBuildSuccessPercent:null
 };
}
