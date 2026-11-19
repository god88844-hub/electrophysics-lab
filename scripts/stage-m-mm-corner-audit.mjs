// Source-pinned SKY130 TT mismatch admission. This audit does not execute SPICE.
// A native .lib tt with an explicitly enabled mismatch parameter is NOT a
// published, separately named .lib tt_mm section; do not fabricate one.
import {readFile, writeFile, realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const ORIGINAL='f62031a1be9aefe902d6d54cddd6f59b57627436';
const OPEN_PDKS='0c1f82326278a0871f0a1fc4bdacf94c88e78e4d';
const sha256=x=>createHash('sha256').update(x).digest('hex');
const section=(src,name)=>{
  const start=new RegExp('^\\s*\\.lib\\s+'+name+'\\s*$','mi').exec(src);
  if(!start)return null;
  const tail=src.slice(start.index+start[0].length);
  const end=/^\s*\.endl(?:\s+\S+)?\s*$/mi.exec(tail);
  return end?tail.slice(0,end.index):null;
};
const exitFail=(reason)=>{
  console.error(JSON.stringify({status:'INSUFFICIENT_MODEL_DATA',reason,
    level1Yield:'UNKNOWN',physicalQualification:'UNQUALIFIED_NO_GO'},null,2));
  process.exitCode=1;
};
try{
  const libArg=process.env.STAGE_M_PROCESSED_SKY130_LIB;
  const orig=process.env.STAGE_M_ORIGINAL_SKY130_MODELS;
  const pdks=process.env.STAGE_M_OPEN_PDKS_SOURCE;
  const report=process.env.STAGE_M_MISMATCH_AUDIT_REPORT;
  if(![libArg,orig,pdks].every(p=>typeof p==='string'&&path.isAbsolute(p)))
    throw Error('absolute model and pinned source paths required');
  const rev=p=>execFileSync('git',['-C',p,'rev-parse','HEAD'],
    {encoding:'utf8',timeout:20000}).trim();
  if(rev(orig)!==ORIGINAL||rev(pdks)!==OPEN_PDKS)
    throw Error('source-commit-mismatch');
  const file=await realpath(libArg);
  const raw=await readFile(file);
  const processed=raw.toString('utf8');
  const originalRaw=await readFile(path.join(orig,'models/sky130.lib.spice'));
  const original=originalRaw.toString('utf8');
  const originalTT=section(original,'tt');
  const processedTT=section(processed,'tt');
  if(!originalTT||!processedTT)throw Error('pinned-TT-process-corner-unavailable');
  const devices=['nfet_01v8','pfet_01v8','nfet_01v8_lvt','pfet_01v8_hvt'];
  for(const device of devices){
    const model='sky130_fd_pr__'+device+'__mismatch.corner.spice';
    if(!originalTT.includes(model))throw Error('pinned-source-mismatch-model-missing-'+device);
  }
  // Upstream processed open_pdks names its statistical section "mc".
  // Only accept the optional "tt_mm" alias if it is actually published by
  // the exact pinned processed PDK, never synthesize an alias from "tt".
  const candidates=[['mc',section(processed,'mc')],
                    ['tt_mm',section(processed,'tt_mm')]];
  const switchEnabled=(body,name)=>{
    if(typeof body!=='string')return false;
    const noncomment=body.split(/\r?\n/).filter(x=>!/^\s*[*#]/.test(x)).join('\n');
    const assignments=[...noncomment.matchAll(new RegExp('\\b'+name+'\\s*=\\s*([^\\s;]+)','gi'))]
      .map(x=>x[1]);
    return assignments.length===1 && /^1(?:\\.0*)?$/.test(assignments[0]);
  };
  const found=candidates.find(([,body])=>
    switchEnabled(body,'mc_mm_switch') &&
    switchEnabled(body,'mc_pr_switch'));
  if(!found)throw Error('processed-PDK-missing-authenticated-mc-with-both-statistical-switches');
  const [selectedCorner,selectedBlock]=found;
  const result={
    format:'invention-lab/stage-m-processed-mismatch-intake/2',
    status:'PINNED_PROCESSED_STATISTICAL_CORNER_AND_SWITCHES_VERIFIED',
    originalSky130Commit:ORIGINAL,openPdksCommit:OPEN_PDKS,
    processedModelRealPath:file,processedLibrarySha256:sha256(raw),
    originalLibrarySha256:sha256(originalRaw),
    originalTtContainsRequiredFourMismatchModels:true,
    processedTtAvailable:true,
    actualPdkCornerToSelect:selectedCorner,
    selectedLibrarySectionSha256:sha256(Buffer.from(selectedBlock)),
    verifiedStatisticalSwitches:{mc_mm_switch:1,mc_pr_switch:1},
    requestedStatisticalMode:'pinned_processed_'+selectedCorner,
    perTrialMismatchSwitchRequired:1,
    perTrialPdkHashRequired:true,
    mismatchSwitchVerifiedInActualDeck:false,
    transitiveModelClosureVerified:false,
    statisticallyCalibratedWaferDistributionVerified:false,
    seededNgspiceMonteCarloExecuted:false,
    level1Status:'INSUFFICIENT_MODEL_DATA',level1Yield:'UNKNOWN',
    level2:'UNQUALIFIED_NO_GO'
  };
  if(report){
    await writeFile(report,JSON.stringify(result,null,2)+'\n');
    // Do not grant SOA or Monte Carlo approval. Link only authenticated
    // model metadata into the existing physical source manifest when present.
    const manifestPath=path.join(path.dirname(report),'source-manifest.json');
    try{
      const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
      if(manifest.pdkLibrarySha256!==result.processedLibrarySha256)
        throw Error('source-manifest-library-SHA-mismatch');
      if(manifest.level2!=='UNQUALIFIED_NO_GO'||manifest.soaLimitV!==1.95)
        throw Error('physical-SOA-gate-mismatch');
      Object.assign(manifest,{
        pdkCorner:selectedCorner,
        selectedLibrarySectionSha256:result.selectedLibrarySectionSha256,
        statisticalSwitchesVerified:result.verifiedStatisticalSwitches,
        pdkAuditReportSha256:sha256(await readFile(report))
      });
      await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    }catch(error){
      if(error?.code!=='ENOENT')throw error;
    }
  }
  console.log(JSON.stringify(result,null,2));
}catch(e){exitFail(String(e.message??e));}
