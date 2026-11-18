// Inspect installed processed SKY130 mismatch section against exact source IDs.
// A generated .lib is not evidence of wafer-calibrated statistical variation.
import {readFile,writeFile,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const ORIGINAL='f62031a1be9aefe902d6d54cddd6f59b57627436';
const OPEN_PDKS='0c1f82326278a0871f0a1fc4bdacf94c88e78e4d';
const sha256=x=>createHash('sha256').update(x).digest('hex');
const fail=(reason)=>{console.error(JSON.stringify({
  status:'INSUFFICIENT_MODEL_DATA',reason,statisticalCalibrationVerified:false,
  level1Yield:'UNKNOWN',physicalQualification:'UNQUALIFIED_NO_GO'},null,2));
  process.exitCode=1;};
const libArg=process.env.STAGE_M_PROCESSED_SKY130_LIB;
const orig=process.env.STAGE_M_ORIGINAL_SKY130_MODELS;
const pdks=process.env.STAGE_M_OPEN_PDKS_SOURCE;
const report=process.env.STAGE_M_MISMATCH_AUDIT_REPORT;
try{
  if(!path.isAbsolute(libArg??'')||!path.isAbsolute(orig??'')||
     !path.isAbsolute(pdks??''))throw Error('absolute sources required');
  const git=(p)=>execFileSync('git',['-C',p,'rev-parse','HEAD'],
     {encoding:'utf8',timeout:20000}).trim();
  if(git(orig)!==ORIGINAL||git(pdks)!==OPEN_PDKS)
    throw Error('original-model-or-processed-tech-source-commit-mismatch');
  const file=await realpath(libArg);
  const raw=await readFile(file);
  const contents=raw.toString('utf8');
  const original=(await readFile(path.join(orig,'models/sky130.lib.spice'))).toString('utf8');
  if(/^\s*\.lib\s+tt_mm\s*$/im.test(original))
    throw Error('original library provenance unexpectedly differs from pinned inventory');
  const start=/^\s*\.lib\s+tt_mm(?:\s|$)/gmi.exec(contents);
  if(!start)throw Error('processed-PDK-missing-named-tt_mm-section');
  const after=contents.slice(start.index+start[0].length);
  const stop=/^\s*\.endl\s+tt_mm(?:\s|$)/gmi.exec(after);
  if(!stop)throw Error('processed-PDK-missing-tt_mm-terminator');
  const section=after.slice(0,stop.index);
  if(!/\b(?:mismatch|mc_mm_switch|agauss)\b/i.test(section))
    throw Error('tt_mm-model-section-missing-mismatch-configuration-evidence');
  // Upstream open_pdks accepts .param mc_mm_switch=1 in the TESTBENCH.
  // The .lib tt_mm label alone does not enable statistical mismatch.
  // Trial-deck admission must independently demand the explicit parameter.
  const result={
    format:'invention-lab/stage-m-processed-mismatch-intake/1',
    status:'PINNED_PROCESSED_TT_MM_CORNER_PRESENT_REQUIRES_DECK_SWITCH',
    originalSky130Commit:ORIGINAL,openPdksCommit:OPEN_PDKS,
    processedModelRealPath:file,processedLibrarySha256:sha256(raw),
    originalLibrarySha256:sha256(Buffer.from(original)),
    requestedCorner:'tt_mm',mc_mm_switchRequiredInEachDeck:1,
    mismatchSwitchVerifiedInActualDeck:false,
    originalModelContainsNamedTtMm:false,
    transitiveModelClosureVerified:false,
    statisticallyCalibratedWaferDistributionVerified:false,
    seededNgspiceMonteCarloExecuted:false,
    level1Status:'INSUFFICIENT_MODEL_DATA',
    level1Yield:'UNKNOWN',level2:'UNQUALIFIED_NO_GO'};
  if(report)await writeFile(report,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}catch(e){fail(String(e.message??e));}
