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
  // The published original library uses TT and mismatch files. The installed
  // library may not expose a separately named tt_mm section. Do not create one.
  const nativeMm=section(processed,'tt_mm');
  const result={
    format:'invention-lab/stage-m-processed-mismatch-intake/2',
    status:'PINNED_TT_WITH_ORIGINAL_MISMATCH_MODELS;DECK_SWITCH_REQUIRED',
    originalSky130Commit:ORIGINAL,openPdksCommit:OPEN_PDKS,
    processedModelRealPath:file,processedLibrarySha256:sha256(raw),
    originalLibrarySha256:sha256(originalRaw),
    originalTtContainsRequiredFourMismatchModels:true,
    processedTtAvailable:true,processedNamedTtMmAvailable:!!nativeMm,
    actualPdkCornerToSelect:nativeMm?'tt_mm':'tt',
    requestedStatisticalMode:'tt_with_explicit_mc_mm_switch=1',
    perTrialMismatchSwitchRequired:1,
    perTrialPdkHashRequired:true,
    mismatchSwitchVerifiedInActualDeck:false,
    transitiveModelClosureVerified:false,
    statisticallyCalibratedWaferDistributionVerified:false,
    seededNgspiceMonteCarloExecuted:false,
    level1Status:'INSUFFICIENT_MODEL_DATA',level1Yield:'UNKNOWN',
    level2:'UNQUALIFIED_NO_GO'
  };
  if(report)await writeFile(report,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}catch(e){exitFail(String(e.message??e));}
