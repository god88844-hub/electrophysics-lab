// Stage M: bind a *supplied* transistor-level per-digit add/carry cell to
// 4/8-digit binary, ternary or Q4 SPICE stimulus and immutable PDK model names.
// This never generates an invented analog transistor implementation, declares
// functional equivalence, or fabricates missing measurement results.
import {evaluateRadixAlu} from './phase73-mvl-devices.js';
import {makeFoundryRailProfile,verifyProfileSOA,MOS_SOA_LIMITS}
 from './phase73-soa.js';
export const ALU_NETLIST_FORMAT='invention-lab/phase73-source-bound-alu-spice/1';
const ID=/^[A-Za-z_][A-Za-z0-9_]{0,90}$/;
const declaredPins=['a','b','cin','s','cout','vdd','vss'];
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const modeMap=Object.freeze({
 SKY130:'sky130-core-1v8',
 GF180MCU:'gf180-core-3v3',
 SKY130_THICK:'sky130-thick-3v3'
});
export function buildFoundryALUInputVectors({radix,width,vectorCount=16}={}){
 if(![2,3,4].includes(radix)||![4,8].includes(width)||
    !Number.isInteger(vectorCount)||vectorCount<1||vectorCount>512)
  throw Error('Bounded 4/8-digit binary/ternary/Q4 ALU workload required');
 const mod=BigInt(radix)**BigInt(width);
 // Deterministic vectors independent of foundry: both ALU kinds must replay
 // identical digit-level arithmetic inputs at every process corner.
 const masks=[
  [0n,0n],[mod-1n,1n],[1n,mod-1n],
  [mod/2n,mod/3n],[mod-1n,mod-1n]
 ];
 const vectors=[];
 for(let i=0;i<vectorCount;i++){
  const [baseA,baseB]=masks[i%masks.length];
  const a=(baseA+BigInt(i/masks.length|0))%mod,
   b=(baseB+BigInt((i*13)%31))%mod;
  const toDigits=n=>{
   const digits=[];for(let j=0;j<width;j++){
    digits.push(Number(n%BigInt(radix)));n/=BigInt(radix);}
   return digits;
  };
  const left=toDigits(a),right=toDigits(b);
  const result=evaluateRadixAlu({base:radix,width,a:left,b:right,operation:'add'});
  vectors.push({index:i,a:left,b:right,expectedDigits:result.digits,
   overflow:result.overflow,source:'IDEAL_ARITHMETIC_REFERENCE_NOT_TRANSISTOR_SIMULATION'});
 }
 return {format:ALU_NETLIST_FORMAT,radix,width,vectors,
  physicallyQualified:false,physicalValidation:'none'};
}
export function inspectExternalALUDigitCell({cellName='alu_digit',source,
 allowedModels=[]}={}){
 if(!ID.test(cellName)||!Array.isArray(allowedModels)||
    allowedModels.length<2||!allowedModels.every(x=>Object.hasOwn(MOS_SOA_LIMITS,x)))
  throw Error('Explicit PDK device mapping and safe SPICE cell name required');
 if(typeof source!=='string'||source.length<100||source.length>1000000)
  return {format:ALU_NETLIST_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'full-transistor-level-custom-digit-subcircuit-not-provided'};
 const lines=source.split(/\r?\n/);
 const head=lines.find(x=>/^\s*\.subckt\b/i.test(x));
 const end=lines.some(x=>new RegExp('^\\s*\\.ends\\s+'+cellName+'\\s*$','i').test(x));
 if(!head||!end)
  return {format:ALU_NETLIST_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'named-digit-cell-subcircuit-header-or-end-is-missing'};
 const tokens=head.trim().split(/\s+/);
 if(tokens[1]!==cellName||tokens.length!==9||
    tokens.slice(2).some((x,i)=>x.toLowerCase()!==declaredPins[i]))
  return {format:ALU_NETLIST_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'digit-subcircuit-must-expose-seven-known-ports'};
 let devices=0;
 for(const line of lines){
  const clean=line.trim();
  if(!clean||clean.startsWith('*'))continue;
  if(/^\s*[bdefghiv]\w*\s/i.test(clean)||
     /^\s*\.(?:control|shell|include|lib|func|measure|param)\b/i.test(clean))
   return {format:ALU_NETLIST_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
    reason:'behavioral-or-untrusted-executable-SPICE-source-disallowed'};
  if(/^x\w+\s/i.test(clean)){
   const parts=clean.split(/\s+/);
   const model=parts.find(x=>Object.hasOwn(MOS_SOA_LIMITS,x));
   if(!model||!allowedModels.includes(model))
    return {format:ALU_NETLIST_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
     reason:'transistor-in-digit-cell-not-bound-to-chosen-PDK-model'};
   devices++;
  }else if(!/^(?:\.subckt\b|\.ends\b|r\w+\s|c\w+\s)/i.test(clean))
   return {format:ALU_NETLIST_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
    reason:'unrecognized-digital-cell-or-unsafe-physical-netlist-statement'};
 }
 return {format:ALU_NETLIST_FORMAT,
  status:devices>0?'SOURCE_BOUND_TO_DEVICE_NAMES_NOT_VERIFIED':'INSUFFICIENT_MODEL_DATA',
  transistorInstances:devices,foundryDRCVerified:false,
  inputOutputFunctionVerified:false,soAUnderDynamicWaveformsVerified:false,
  fabricationAuthorized:false};
}
export function assembleFoundryALUCandidate({
 foundry='SKY130',radix=4,width=4,
 cellSource=null,cellName='alu_digit',
 modelLibraryPath=null,corner='tt',rippleFraction=0,
 temperatureC=25,vectors=null
}={}){
 const profileName=modeMap[foundry];
 if(!profileName||![4,8].includes(width)||![2,3,4].includes(radix)||
    !(foundry==='GF180MCU'?
      ['typical','ss','ff'].includes(corner):
      ['tt','tt_mm','ss','ff'].includes(corner)))
  throw Error('Invalid foundry/corner/ALU configuration');
 const profile=makeFoundryRailProfile({id:profileName,radix,
  rippleFraction,temperatureC});
 const soa=verifyProfileSOA(profile);
 const workloads=vectors??buildFoundryALUInputVectors({radix,width,vectorCount:16});
 if(workloads?.format!==ALU_NETLIST_FORMAT||
    workloads.radix!==radix||workloads.width!==width||
    !Array.isArray(workloads.vectors)||workloads.vectors.length<1)
  throw Error('ALU input vector workload mismatch');
 if(soa.status!=='SOA_PROFILE_SCREEN_PASS')
  return {format:ALU_NETLIST_FORMAT,status:soa.status,profile,soa,
   deck:null,modelLibraryPinned:false,level1Status:'INSUFFICIENT_MODEL_DATA'};
 const cell=inspectExternalALUDigitCell({cellName,source:cellSource,
  allowedModels:profile.deviceModels});
 if(cell.status!=='SOURCE_BOUND_TO_DEVICE_NAMES_NOT_VERIFIED'||
    typeof modelLibraryPath!=='string'||
    !(/^(?:\/[A-Za-z0-9_./-]+|[A-Za-z]:\\[A-Za-z0-9_.\\-]+)\.spice$/i.test(modelLibraryPath)))
  return {format:ALU_NETLIST_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   profile,soa,cell,deck:null,reason:'missing-authentic-custom-digit-cell-and-local-verified-library',
   modelLibraryPinned:false,level1Status:'INSUFFICIENT_MODEL_DATA'};
 const rails=profile.railsV;
 const tStep=100e-9,total=workloads.vectors.length*tStep;
 const lines=[
  '* Unqualified source-bound multi-radix transistor-level ALU candidate',
  '.lib "'+modelLibraryPath+'" '+corner,
  '.temp '+temperatureC,
  'VDD vdd 0 '+rails.at(-1),
  'VIN_CIN cin0 0 0',
  cellSource.trim(),
  ...Array.from({length:width},(_,i)=>
   'Xdigit'+i+' a'+i+' b'+i+' '+(i?'cout'+(i-1):'cin0')+
   ' s'+i+' cout'+i+' vdd 0 '+cellName),
 ];
 for(let digit=0;digit<width;digit++)
  for(const key of ['a','b']){
   const pts=workloads.vectors.flatMap((v,j)=>[
    (j*tStep).toExponential(9),String(rails[v[key][digit]])
   ]);
   lines.push('V'+key+digit+' '+key+digit+' 0 PWL('+pts.join(' ')+')');
  }
 lines.push('.tran 1n '+total.toExponential(9),
  '.print tran '+Array.from({length:width},(_,i)=>'v(s'+i+')').join(' '),
  '.end');
 return {format:ALU_NETLIST_FORMAT,
  status:'TRANSISTOR_NETLIST_ASSEMBLED_NOT_PHYSICALLY_VALIDATED',
  profile,soa,cell,width,radix,corner,temperatureC,
  deck:lines.join('\n')+'\n',expected:workloads.vectors,
  modelLibraryPinned:false,soAUnderDynamicWaveformsVerified:false,
  ngspiceExecuted:false,postlayoutParasiticsVerified:false,
  level1Status:'INSUFFICIENT_MODEL_DATA',physicalQualification:'UNQUALIFIED_NO_GO'};
}
