// Phase 73/74 PDK closure + genuine ngspice stage. Unavailable models or
// incomplete transistor SOA terminate BEFORE native simulation. Real SPICE
// traces still do not establish foundry wafer yield or Level-1 calibration.
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadSourceManifest,verifyPinnedGitBlob} from './phase73-pdk-provenance.js';
import {runNgspice,detectNgspiceFailure} from '../bench/ngspice-adapter.js';
import {requireSafeNetlistSOA} from './phase73-soa.js';
import {verifyPinnedGitModelTree} from './phase73-pinned-git-tree.js';
import {verifyDeckTerminalSOA} from './phase73-deck-node-soa.js';
export const PDK_CLOSURE_FORMAT='invention-lab/phase73-pdk-dependency-closure/1';
const SPICE_ALU_STATUS='UNVERIFIED_SPICE_NOT_CALIBRATED';
const hex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const inside=(root,file)=>file===root||file.startsWith(root+path.sep);
const safeRoot=x=>typeof x==='string'&&path.isAbsolute(x)&&x.length<1000;

export function inspectDeclaredModelCorners({sourceText,foundry='SKY130',
 required=null}={}){
 if(required===null)required=foundry==='GF180MCU'?
  ['typical','ss','ff']:['tt','tt_mm','ss','ff'];
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
 const individuallyPinned=all.every(x=>x.pinnedToUpstreamCommit);
 const gitModelTree=complete&&!individuallyPinned?
  await verifyPinnedGitModelTree({root,expectedCommit:source.commit,
   relativeFiles:all.map(x=>x.path)}):
  {status:individuallyPinned?'EVERY_MODEL_BLOB_MANIFEST_PINNED':'CLOSURE_INCOMPLETE'};
 const independentlyPinned=individuallyPinned||
  gitModelTree.status==='PINNED_GIT_TREE_VERIFIED';
 return {format:PDK_CLOSURE_FORMAT,pdk,sourceCommit:source.commit,
  status:complete?'MODEL_FILES_PRESENT_NOT_CALIBRATED':'INSUFFICIENT_MODEL_DATA',
  filesChecked:all.length,pinnedFiles:all.filter(x=>x.pinnedToUpstreamCommit).length,
  allTransitiveFilesPinnedToOriginalCommit:independentlyPinned,
  completeGitTreeIdentityVerified:gitModelTree.status==='PINNED_GIT_TREE_VERIFIED',
  gitModelTreeEvidence:gitModelTree,
  missing:missing.sort(),unresolved:unresolved.sort(),
  files:all,totalBytes,calibrationVerified:false,
  independentlyCharacterizedWaferStatisticsAvailable:false,
  physicalReleaseAuthorized:false};
}
export function bindSPICEDeviceInstances({deck,devices=[]}={}){
 if(typeof deck!=='string'||deck.length<10||deck.length>2000000||
    !Array.isArray(devices)||devices.length<1||devices.length>100000)
  return {status:'SOA_INSUFFICIENT_NODE_BOUNDS',
   reason:'native-deck-and-MOS-instance-inventory-required'};
 const subcircuits=new Set([...deck.matchAll(/^\s*\.subckt\s+([A-Za-z0-9_]+)/gmi)]
  .map(x=>x[1].toLowerCase()));
 const mos=new Map(),unknown=[];
 for(const line of deck.split(/\r?\n/)){
  if(!/^\s*x[A-Za-z0-9_]+\s/i.test(line))continue;
  const tokens=line.trim().split(/\s+/);
  const instance=tokens[0].toLowerCase();
  const model=tokens.slice(1).find(x=>/^(?:sky130_fd_pr__|gf180mcu_fd_pr__)/.test(x));
  if(!model){
   // A declared local subcircuit is allowed as hierarchy, not independent
   // evidence of the terminal bias of internal transistors.
   if(!tokens.some(x=>subcircuits.has(x.toLowerCase())))unknown.push(instance);
   continue;
  }
  if(mos.has(instance)&&mos.get(instance)!==model)
   return {status:'SOA_INSUFFICIENT_NODE_BOUNDS',
    reason:'duplicate-transistor-instance-with-inconsistent-model'};
  mos.set(instance,model);
 }
 const claims=new Map();
 for(const d of devices){
  if(typeof d?.instance!=='string'||!/^x[a-z0-9_]+$/i.test(d.instance)||
     claims.has(d.instance.toLowerCase()))
   return {status:'SOA_INSUFFICIENT_NODE_BOUNDS',
    reason:'duplicate-or-unnamed-terminal-voltage-claim'};
  claims.set(d.instance.toLowerCase(),d.model);
 }
 if(unknown.length||mos.size!==claims.size||
    [...mos].some(([instance,model])=>claims.get(instance)!==model))
  return {status:'SOA_INSUFFICIENT_NODE_BOUNDS',
   reason:'declared-four-terminal-MOS-samples-do-not-match-actual-SPICE-deck',
   unknown,declaredMOS:claims.size,deckMOS:mos.size};
 return {status:'SOA_DECK_INSTANCE_INVENTORY_MATCHED',
  instances:mos.size,dynamicWaveformSOAVerified:false,
  physicalQualification:'UNQUALIFIED_NO_GO'};
}

// A valid PDK checkout is meaningless if the submitted deck can point its
// .lib directive to another file. Bind the exact file and corner BEFORE spawn.
export async function inspectStageMDeckLibraryBinding({
 deck,pdkRoot,pdk,corner
}={}){
 const no=(reason,details={})=>({status:'INSUFFICIENT_MODEL_DATA',
  reason,...details,modelLibraryBound:false,physicalQualification:'UNQUALIFIED_NO_GO'});
 if(typeof deck!=='string'||deck.length<10||deck.length>2000000||
    !safeRoot(pdkRoot)||!['SKY130','GF180MCU'].includes(pdk)||
    !(pdk==='GF180MCU'?
      ['typical','ss','ff'].includes(corner):
      ['tt','tt_mm','ss','ff'].includes(corner)))
  return no('invalid-expected-PDK-library-root-or-corner');
 const lines=deck.split(/\r?\n/),libraries=[];
 for(const raw of lines){
  if(/^\s*\.include\b/i.test(raw))
   return no('caller-deck-include-not-admitted-exact-PDK-library-only');
  if(!/^\s*\.lib\b/i.test(raw))continue;
  const m=/^\s*\.lib\s+["']?([^"'\s]+)["']?\s+([A-Za-z0-9_]+)\s*$/i.exec(raw);
  if(!m)return no('unrecognized-or-incomplete-PDK-lib-statement');
  libraries.push({file:m[1],corner:m[2].toLowerCase()});
 }
 if(libraries.length!==1||libraries[0].corner!==corner)
  return no('exactly-one-correct-pinned-PDK-library-corner-required',
   {librariesFound:libraries.length});
 const selected=libraries[0].file;
 if(!path.isAbsolute(selected))
  return no('PDK-lib-path-must-be-absolute-and-root-bound');
 const relative=pdk==='SKY130'?'models/sky130.lib.spice':
  'models/ngspice/design.ngspice';
 let expected,actual,root;
 try{
  root=await realpath(pdkRoot);
  expected=await realpath(path.join(root,relative));
  actual=await realpath(selected);
 }catch{return no('complete-pinned-PDK-library-file-unavailable');}
 if(!inside(root,expected)||!inside(root,actual)||actual!==expected)
  return no('deck-model-library-not-from-original-verified-PDK-root',
   {expectedRelativeFile:relative});
 return {status:'PDK_DECK_LIB_PATH_MATCHED_NOT_CALIBRATED',pdk,corner,
  expectedRelativeFile:relative,modelLibraryBound:true,
  authenticPdkClosureRequired:true,foundryCalibrationVerified:false,
  physicalQualification:'UNQUALIFIED_NO_GO'};
}

export async function runSOAGuardedFoundryDeck({
 profile,devices,corner='tt',temperatureC=25,
 exe,deck,pdkRoot
}={}){
 if(profile?.format!=='invention-lab/phase73-transistor-soa/1'||
    !(profile?.pdk==='GF180MCU'?
      ['typical','ss','ff'].includes(corner):
      ['tt','tt_mm','ss','ff'].includes(corner))||
    !Number.isFinite(temperatureC)||
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
 const binding=bindSPICEDeviceInstances({deck,devices});
 if(binding.status!=='SOA_DECK_INSTANCE_INVENTORY_MATCHED')
  return {status:'SOA_INSUFFICIENT_NODE_BOUNDS',
   reason:'missing-MOS-to-SPICE-instance-source-binding',
   soa,binding,ngspiceExecuted:false,
   level1Status:'INSUFFICIENT_MODEL_DATA',
   physicalQualification:'UNQUALIFIED_NO_GO'};
 const deckSOA=verifyDeckTerminalSOA({deck,devices,profile});
 if(deckSOA.status!=='SOA_MODEL_RANGE_SCREEN_PASS')
  return {status:deckSOA.status,
   reason:'source-derived-transistor-voltage-bounds-failed-before-ngspice',
   soa,deckSOA,ngspiceExecuted:false,
   level1Status:'INSUFFICIENT_MODEL_DATA',
   simulatedPhysicalBuildSuccessPercent:'UNKNOWN',
   physicalQualification:'UNQUALIFIED_NO_GO'};
 const closure=await inspectPinnedPdkClosure({pdkRoot,pdk:profile.pdk});
 if(closure.status!=='MODEL_FILES_PRESENT_NOT_CALIBRATED'||
    !closure.allTransitiveFilesPinnedToOriginalCommit)
  return {status:'INSUFFICIENT_MODEL_DATA',
   reason:'full-source-pinned-dependency-closure-not-authenticated',
   closure,soa,ngspiceExecuted:false,
   level1Status:'INSUFFICIENT_MODEL_DATA',
   physicalQualification:'UNQUALIFIED_NO_GO'};
 const deckLibrary=await inspectStageMDeckLibraryBinding({
  deck,pdkRoot,pdk:profile.pdk,corner});
 if(deckLibrary.status!=='PDK_DECK_LIB_PATH_MATCHED_NOT_CALIBRATED')
  return {status:'INSUFFICIENT_MODEL_DATA',
   reason:'actual-deck-model-library-does-not-match-pinned-source',
   deckLibrary,ngspiceExecuted:false,
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
