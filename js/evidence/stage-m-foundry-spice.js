// Phase 73/74 PDK closure + genuine ngspice stage. Unavailable models or
// incomplete transistor SOA terminate BEFORE native simulation. Real SPICE
// traces still do not establish foundry wafer yield or Level-1 calibration.
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadSourceManifest,verifyPinnedGitBlob} from './phase73-pdk-provenance.js';
import {runNgspice,detectNgspiceFailure} from '../bench/ngspice-adapter.js';
import {requireSafeNetlistSOA} from './phase73-soa.js';
export const PDK_CLOSURE_FORMAT='invention-lab/phase73-pdk-dependency-closure/1';
const SPICE_ALU_STATUS='UNVERIFIED_SPICE_NOT_CALIBRATED';
const hex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const inside=(root,file)=>file===root||file.startsWith(root+path.sep);
const safeRoot=x=>typeof x==='string'&&path.isAbsolute(x)&&x.length<1000;

export function inspectDeclaredModelCorners({sourceText,foundry='SKY130',
 required=['tt','ss','ff','tt_mm']}={}){
 if(typeof sourceText!=='string'||sourceText.length<1||sourceText.length>10000000||
    !['SKY130','GF180MCU'].includes(foundry)||!Array.isArray(required)||
    required.some(x=>typeof x!=='string'||!/^[A-Za-z0-9_-]+$/.test(x)))
  throw Error('Original bounded model-card source and exact corner requests required');
 const corners=[...new Set([...sourceText.matchAll(/^\s*\.lib\s+([A-Za-z0-9_]+)\s*$/gim)]
  .map(m=>m[1].toLowerCase()))].sort();
 const missing=required.filter(x=>!corners.includes(x.toLowerCase()));
 return {format:PDK_CLOSURE_FORMAT,foundry,corners,missing,
  status:missing.length?'INSUFFICIENT_MODEL_DATA':'DECLARED_CORNER_SECTIONS_PRESENT',
  mismatchDistributionIndependentlyCalibrated:false,
  sourceModelVersionVerifiedHere:false,
  physicalQualification:'UNQUALIFIED_NO_GO'};
}

export async function inspectPinnedPdkClosure({
 pdkRoot,pdk='SKY130',maxFiles=5000,maxBytes=200000000
}={}){
 if(!safeRoot(pdkRoot)||!['SKY130','GF180MCU'].includes(pdk)||
    !Number.isInteger(maxFiles)||maxFiles<1||maxFiles>10000||
    !Number.isInteger(maxBytes)||maxBytes<100||maxBytes>1000000000)
  throw Error('Explicit bounded full PDK root and foundry required');
 const manifest=await loadSourceManifest();
 const source=manifest.sources.find(x=>x.pdk===pdk);
 const entry=source.entries.find(x=>x.path===(
  pdk==='SKY130'?'models/sky130.lib.spice':'models/ngspice/design.ngspice'));
 if(!entry)throw Error('No pinned original main PDK model reference');
 let root;try{root=await realpath(pdkRoot);}
 catch{return {format:PDK_CLOSURE_FORMAT,pdk,status:'INSUFFICIENT_MODEL_DATA',
  reason:'complete-model-root-not-installed',sourceCommit:source.commit,
  calibrationVerified:false};}
 const queued=[entry.path],checked=new Map(),missing=[],unresolved=[];
 let totalBytes=0;
 while(queued.length){
  const relative=queued.shift();
  if(checked.has(relative))continue;
  if(checked.size>=maxFiles)
   return {format:PDK_CLOSURE_FORMAT,pdk,status:'INSUFFICIENT_MODEL_DATA',
    reason:'complete-closure-exceeds-file-limit',filesChecked:checked.size,
    calibrationVerified:false};
  const target=path.resolve(root,relative);
  if(!inside(root,target))throw Error('Model include path escaped approved PDK root');
  let actual,bytes;
  try{actual=await realpath(target);if(!inside(root,actual))
   throw Error('Model include symlink escaped approved PDK root');
   bytes=await readFile(actual);
  }catch(e){
   if(e.message?.includes('escaped'))throw e;
   missing.push(relative);continue;
  }
  if(bytes.length>20000000||totalBytes+bytes.length>maxBytes)
   return {format:PDK_CLOSURE_FORMAT,pdk,status:'INSUFFICIENT_MODEL_DATA',
    reason:'PDK-include-byte-budget-exceeded',filesChecked:checked.size,
    calibrationVerified:false};
  totalBytes+=bytes.length;
  const pinned=source.entries.find(x=>x.path===relative);
  if(pinned)verifyPinnedGitBlob(bytes,pinned); // throws on mismatch; never downgrade
  const digest=createHash('sha256').update(bytes).digest('hex');
  checked.set(relative,{path:relative,sha256:digest,pinnedToUpstreamCommit:!!pinned,
   bytes:bytes.length});
  const text=bytes.toString('utf8');
  // Resolve .include "relative" and .lib "relative" <corner> only.
  // Multiple corners are included to make closure deterministic rather
  // than selecting a convenient subset without model dependencies.
  for(const line of text.split(/\r?\n/)){
   const m=/^\s*\.(?:include|lib)\s+["']([^"']+)["'](?:\s+[\w-]+)?\s*$/i.exec(line);
   if(m){
    if(m[1].includes('$')||m[1].includes('%')||path.isAbsolute(m[1]))
     unresolved.push(relative+':'+m[1]);
    else{
     const next=path.normalize(path.join(path.dirname(relative),m[1]));
     if(next.startsWith('..'+path.sep)||next==='..')
      throw Error('Original PDK include escapes PDK root');
     queued.push(next);
    }
   }else if(/^\s*\.(?:include|lib)\s+["']?(\.\.?[\\/])/.test(line)){
    unresolved.push(relative+':unparsed-include');
   }
  }
 }
 const all=[...checked.values()].sort((a,b)=>a.path.localeCompare(b.path));
 const complete=missing.length===0&&unresolved.length===0;
 const independentlyPinned=all.every(x=>x.pinnedToUpstreamCommit);
 return {format:PDK_CLOSURE_FORMAT,pdk,sourceCommit:source.commit,
  status:complete?'MODEL_FILES_PRESENT_NOT_CALIBRATED':'INSUFFICIENT_MODEL_DATA',
  filesChecked:all.length,pinnedFiles:all.filter(x=>x.pinnedToUpstreamCommit).length,
  allTransitiveFilesPinnedToOriginalCommit:independentlyPinned,
  missing:missing.sort(),unresolved:unresolved.sort(),
  files:all,totalBytes,calibrationVerified:false,
  independentlyCharacterizedWaferStatisticsAvailable:false,
  physicalReleaseAuthorized:false};
}
export async function runSOAGuardedFoundryDeck({
 profile,devices,corner='tt',temperatureC=25,
 exe,deck,pdkRoot
}={}){
 if(profile?.format!=='invention-lab/phase73-transistor-soa/1'||
    !['tt','ss','ff'].includes(corner)||!Number.isFinite(temperatureC)||
    temperatureC< -40||temperatureC>125)
  throw Error('Invalid foundry SOA/corner request');
 const soa=requireSafeNetlistSOA({profile,devices,corner});
 if(soa.status!=='SOA_MODEL_RANGE_SCREEN_PASS')
  return {status:soa.status,soa,ngspiceExecuted:false,
   modelCalibrationVerified:false,level1Status:'INSUFFICIENT_MODEL_DATA',
   physicalQualification:'UNQUALIFIED_NO_GO'};
 if(typeof exe!=='string'||!exe||typeof deck!=='string'||deck.length<10||
    deck.length>2000000||!safeRoot(pdkRoot))
  return {status:'INSUFFICIENT_MODEL_DATA',
   reason:'missing-native-ngspice-library-root-or-circuit-deck',
   ngspiceExecuted:false,modelCalibrationVerified:false,
   level1Status:'INSUFFICIENT_MODEL_DATA',
   physicalQualification:'UNQUALIFIED_NO_GO'};
 const closure=await inspectPinnedPdkClosure({pdkRoot,pdk:profile.pdk});
 if(closure.status!=='MODEL_FILES_PRESENT_NOT_CALIBRATED'||
    !closure.allTransitiveFilesPinnedToOriginalCommit)
  return {status:'INSUFFICIENT_MODEL_DATA',
   reason:'full-source-pinned-dependency-closure-not-authenticated',
   closure,soa,ngspiceExecuted:false,
   level1Status:'INSUFFICIENT_MODEL_DATA',
   physicalQualification:'UNQUALIFIED_NO_GO'};
 // This only admits an explicitly trusted model tree and fully checked SOA
 // envelope. The circuit itself must be separately validated; never issue
 // a yield or Level1 virtual qualification from a raw deck.
 if(/^\s*\.control\b/mi.test(deck)||/^\s*\.shell\b/mi.test(deck))
  throw Error('Caller-supplied ngspice control or shell script prohibited');
 const res=await runNgspice({exe,deck,timeoutMs:120000});
 const fault=detectNgspiceFailure(res);
 return {status:fault?'INSUFFICIENT_MODEL_DATA':SPICE_ALU_STATUS,
  reason:fault??'real-ngspice-output-is-not-independent-wafer-calibration',
  soa,closure,
  ngspiceExecuted:true,engineExitCode:res.code??null,
  outputText:fault?null:(res.fullText??'').slice(0,100000),
  modelCalibrationVerified:false,level1Status:'INSUFFICIENT_MODEL_DATA',
  simulatedPhysicalBuildSuccessPercent:'UNKNOWN',
  physicalQualification:'UNQUALIFIED_NO_GO'};
}
export function planRealMultiCornerSPICE({foundry='SKY130',radices=[2,3,4],
 widths=[4,8]}={}){
 if(!['SKY130','GF180MCU'].includes(foundry)||
    !Array.isArray(radices)||radices.some(x=>![2,3,4].includes(x))||
    !Array.isArray(widths)||widths.some(x=>![4,8].includes(x)))
  throw Error('Unsupported multi-radix silicon corner matrix');
 const corners=foundry==='SKY130'?['tt','ss','ff']:['typical','ss','ff'];
 const temperatureC=[-40,25,85,125];
 const matrix=[];
 for(const radix of radices)for(const width of widths)
  for(const corner of corners)for(const tempC of temperatureC)
   matrix.push({foundry,radix,width,corner,tempC,
    status:'NOT_RUN_NEEDS_PINNED_PDK_AND_TRANSISTOR_NETLIST'});
 return {format:PDK_CLOSURE_FORMAT,
  cornerMatrix:matrix,cornerCases:matrix.length,
  fullAluMonteCarloPerConfiguration:100,
  requiredPrimitiveMonteCarloTrials:1000,
  requiredPrimitives:['q4-inverter','threshold-quantizer','q4-mux-carry'],
  status:'INSUFFICIENT_MODEL_DATA',
  realNgspiceRunsCompleted:0,level1Yield:'UNKNOWN',
  physicalQualification:'UNQUALIFIED_NO_GO'};
}
