// Stage M Phase 77 explicit native source-layout intake.
// This runner CANNOT synthesize a novel quaternary transistor layout from a
// filename, logic truth table, or ideal-function screenshot.
import {resolve,join} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {runQ4CellLayoutBatch,REQUIRED_Q4_CUSTOM_CELLS}
 from '../js/evidence/phase77-magic-netgen.js';
const root=process.env.STAGE_M_ORIGINAL_Q4_LAYOUT_ROOT;
const magicRcPath=process.env.STAGE_M_MAGIC_RC_PATH;
const netgenSetupPath=process.env.STAGE_M_NETGEN_SETUP_PATH;
const reportPath=process.env.STAGE_M_LAYOUT_REPORT_PATH;
const no=(reason)=>({format:'invention-lab/phase77-real-magic-netgen-gate/1',
 status:'INSUFFICIENT_MODEL_DATA',
 required:REQUIRED_Q4_CUSTOM_CELLS,
 reason,originalCustomCellSourcesAvailable:false,
 nativeToolVerificationCompleted:false,
 sourceHashRecords:[],postlayoutNoiseVerified:false,
 physicalQualification:'UNQUALIFIED_NO_GO'});
let result;
if(!root||!magicRcPath||!netgenSetupPath){
 result=no('missing-original-q4-mag-spice-and-pinned-PDK-ruledeck-environment');
}else{
 if(![root,magicRcPath,netgenSetupPath].every(x=>x.startsWith('/')||
   /^[A-Za-z]:[\\/]/.test(x)))
  throw Error('Use explicit absolute paths for real physical design evidence');
 const cells=REQUIRED_Q4_CUSTOM_CELLS.map(name=>({
  name,magPath:join(resolve(root),name+'.mag'),
  schematicPath:join(resolve(root),name+'.spice')
 }));
 result=await runQ4CellLayoutBatch({cells,magicRcPath,netgenSetupPath});
}
const serialized=JSON.stringify(result,null,2)+'\n';
if(reportPath){
 if(!reportPath.startsWith('/')&&!/^[A-Za-z]:[\\/]/.test(reportPath))
  throw Error('Stage M layout report output path must be absolute');
 await writeFile(reportPath,serialized);
}
process.stdout.write(serialized);
// A missing original source is not a CI software failure, but an explicit
// foundry physical acceptance NO-GO. Never permit software CI success to
// imply physical cell DRC/LVS or postlayout SPICE qualification.
if(result.physicalQualification!=='UNQUALIFIED_NO_GO'||result.status!=='INSUFFICIENT_MODEL_DATA')
 throw Error('Stage M fail-closed physical qualification changed');
