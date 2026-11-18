// Stage M Phase 77: real Magic, Netgen and extraction command admission.
// IMPORTANT: an illustrative rectangle is not a MAG/GDS custom-cell layout.
// Do not create fake geometry or treat a tool's exit 0 as foundry signoff.
import {readFile,realpath,mkdtemp,writeFile,stat,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {join,resolve,isAbsolute,basename} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
export const POSTLAYOUT_FORMAT='invention-lab/phase77-real-magic-netgen-gate/1';
const id=x=>typeof x==='string'&&/^[A-Za-z_][A-Za-z0-9_]{0,80}$/.test(x);
async function checkedFile(file,ext,maxBytes){
 if(typeof file!=='string'||!isAbsolute(file)||!file.endsWith(ext))
  throw Error('An original absolute '+ext+' layout/model file is required');
 const actual=await realpath(file);
 const st=await stat(actual);
 if(st.size<32||st.size>maxBytes||!st.isFile())
  throw Error('Original file empty, malformed or outside bounded size');
 const data=await readFile(actual);
 return {path:actual,sha256:createHash('sha256').update(data).digest('hex'),
  bytes:data.length,content:ext==='.mag'||ext==='.spice'||ext==='.tcl'?
   data.toString('utf8'):null};
}
export async function inspectOriginalCustomCellFiles({
 name,magPath,schematicPath,magicRcPath,netgenSetupPath,gdsPath=null
}={}){
 if(!id(name))
  throw Error('Qualified custom-cell identity must be explicit');
 let mag,sch,rc,setup,gds;
 try{
  [mag,sch,rc,setup]=await Promise.all([
   checkedFile(magPath,'.mag',10000000),
   checkedFile(schematicPath,'.spice',10000000),
   checkedFile(magicRcPath,'.tcl',1000000),
   checkedFile(netgenSetupPath,'.tcl',1000000)
  ]);
  if(gdsPath)gds=await checkedFile(gdsPath,'.gds',100000000);
 }catch(e){
  return {format:POSTLAYOUT_FORMAT,name,status:'INSUFFICIENT_MODEL_DATA',
   reason:'required-original-MAG-SPICE-verified-tech-and-netgen-files-missing',
   detail:e.message,magicExecuted:false,netgenExecuted:false,
   foundryDrcLvsVerified:false,postlayoutNoiseVerified:false,
   physicalQualification:'UNQUALIFIED_NO_GO'};
 }
 if(!/^magic\s*$/im.test(mag.content)||!
   /^\s*\.subckt\s+/im.test(sch.content)||!
   (rc.content.includes('tech')||rc.content.includes('magic'))||
   !/\b(lvs|netgen|model|property)\b/i.test(setup.content))
  return {format:POSTLAYOUT_FORMAT,name,
   status:'INSUFFICIENT_MODEL_DATA',reason:'original-layout-source-header-inconsistent',
   magicExecuted:false,netgenExecuted:false,
   physicalQualification:'UNQUALIFIED_NO_GO'};
 return {format:POSTLAYOUT_FORMAT,name,status:'SOURCE_FILES_PRESENT_NOT_AUTHENTICATED',
  inputFiles:[mag,sch,rc,setup,gds].filter(Boolean).map(
   x=>({path:x.path,sha256:x.sha256,bytes:x.bytes})),
  magicExecuted:false,netgenExecuted:false,
  drcStatus:'NOT_RUN',lvsStatus:'NOT_RUN',extractStatus:'NOT_RUN',
  sourceFoundryRightsVerified:false,physicalQualification:'UNQUALIFIED_NO_GO'};
}
async function runProcess({executable,args,cwd,stdin='',timeoutMs=120000}){
 if(typeof executable!=='string'||!executable||!/^[A-Za-z0-9_./:\\-]+$/.test(executable)||
    !Array.isArray(args)||args.some(x=>typeof x!=='string'||x.length>1000))
  throw Error('Explicit bounded native layout tooling required');
 return await new Promise(resolve=>{
  const child=spawn(executable,args,{cwd,windowsHide:true,
   stdio:['pipe','pipe','pipe'],shell:false});
  let stdout='',stderr='',finished=false,timedOut=false;
  const end=result=>{
   if(finished)return;finished=true;clearTimeout(timer);
   resolve({status:'FINISHED',...result,stdout,stderr,timedOut});
  };
  const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},timeoutMs);
  child.stdout.on('data',buf=>{stdout=(stdout+buf).slice(-200000);});
  child.stderr.on('data',buf=>{stderr=(stderr+buf).slice(-200000);});
  child.once('error',e=>end({exitCode:null,error:e.message}));
  child.once('close',code=>end({exitCode:code}));
  child.stdin.end(stdin);
 });
}
export async function runMagicNetgenCandidate({
 name,magPath,schematicPath,magicRcPath,netgenSetupPath,
 magicExec='magic',netgenExec='netgen'
}={}){
 const audit=await inspectOriginalCustomCellFiles({
  name,magPath,schematicPath,magicRcPath,netgenSetupPath});
 if(audit.status!=='SOURCE_FILES_PRESENT_NOT_AUTHENTICATED')
  return audit;
 const dirname=resolve(magPath,'..');
 const script=[
  'drc on','drc check','drc count total',
  'extract all','ext2spice lvs','ext2spice',
  'gds write '+name,'quit -noprompt',''
 ].join('\n');
 const magic=await runProcess({executable:magicExec,
  args:['-dnull','-noconsole','-rcfile',magicRcPath,name],cwd:dirname,
  stdin:script});
 if(magic.exitCode!==0||magic.timedOut)
  return {format:POSTLAYOUT_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'native-Magic-DRC-or-extraction-failed',magic,
   magicExecuted:true,netgenExecuted:false,
   physicalQualification:'UNQUALIFIED_NO_GO'};
 const extracted=join(dirname,name+'.spice');
 let extractedFile;
 try{extractedFile=await checkedFile(extracted,'.spice',10000000);}
 catch{
  return {format:POSTLAYOUT_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'Magic-produced-extracted-SPICE-missing',
   magicExecuted:true,netgenExecuted:false,magic,
   physicalQualification:'UNQUALIFIED_NO_GO'};
 }
 const generatedGDS=join(dirname,name+'.gds');
 let originalGDS=null;
 try{originalGDS=await checkedFile(generatedGDS,'.gds',100000000);}
 catch{/* a Magic exit=0 alone does not guarantee a complete GDSII */ }
 const drcReportPath=join(dirname,name+'-magic-drc-report.txt');
 await writeFile(drcReportPath,magic.stdout+'\n'+magic.stderr,'utf8');
 const drcReport=await checkedFile(drcReportPath,'.txt',2000000);
 const resultPath=join(dirname,name+'-netgen-lvs.txt');
 const netgen=await runProcess({executable:netgenExec,
  args:['-batch','lvs',extracted+' '+name,
   schematicPath+' '+name,netgenSetupPath,resultPath],cwd:dirname});
 let lvsReport=null;
 try{lvsReport=await checkedFile(resultPath,'.txt',2000000);}
 catch{/* absent report remains NO-GO */}
 // Never parse a naked exit code as a foundry-reviewed signoff. Actual
 // device mappings, rule deck identity, DRC count and report contents must
 // be verified separately and independently.
 return {format:POSTLAYOUT_FORMAT,
  status:'TOOL_OUTPUT_REQUIRES_INDEPENDENT_DRC_LVS_REVIEW',
  magicExecuted:true,netgenExecuted:true,
  magicExitCode:magic.exitCode,netgenExitCode:netgen.exitCode,
  magicLog:magic.stdout.slice(-10000),
  netgenLog:netgen.stdout.slice(-10000),
  originalMagSha256:audit.inputFiles.find(x=>x.path===resolve(magPath))?.sha256??null,
  originalSchematicSha256:audit.inputFiles.find(x=>x.path===resolve(schematicPath))?.sha256??null,
  generatedGdsSha256:originalGDS?.sha256??null,
  generatedGdsPath:originalGDS?.path??null,
  drcReportSha256:drcReport.sha256,
  drcReportPath,
  lvsReportSha256:lvsReport?.sha256??null,
  lvsReportPath:lvsReport?.path??null,
  extractedNetlistSha256:extractedFile.sha256,
  extractedNetlistPath:extracted,
  rawReportPath:resultPath,
  foundryRuleDeckSourcePinned:false,
  extractedParasiticsCorrelated:false,
  postlayoutNoiseVerified:false,
  independentDRCLVSReviewVerified:false,
  physicalQualification:'UNQUALIFIED_NO_GO'};
}
export function evaluatePostLayoutSignoff({drcReport,lvsReport,
 parasiticNetwork,postlayoutNoiseMargin,independentRuledeckAudit}={}){
 const reasons=[];
 if(drcReport?.independentlyVerified!==true)
  reasons.push('no-verified-Magic-DRC-count-and-original-ruledeck');
 if(lvsReport?.independentlyVerified!==true)
  reasons.push('no-independent-Netgen-device-and-connectivity-LVS');
 if(parasiticNetwork?.originalExtractedSpiceVerified!==true)
  reasons.push('no-authenticated-ext2spice-postroute-RC-network');
 if(postlayoutNoiseMargin?.allIntermediateStatesSafe!==true)
  reasons.push('post-layout-Q4-intermediate-voltage-margins-unverified');
 if(independentRuledeckAudit?.authenticated!==true)
  reasons.push('missing-foundry-licensed-tech-and-ruledeck-signature');
 return {format:POSTLAYOUT_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
  reasons,foundryDrcLvsVerified:false,postlayoutNoiseVerified:false,
  level1Authorization:'UNKNOWN',physicalQualification:'UNQUALIFIED_NO_GO'};
}
