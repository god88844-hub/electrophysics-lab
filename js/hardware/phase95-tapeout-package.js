// Phase 95 — fail-closed foundry artifact packager.
// This module cannot transform a schematic or Verilog into GDSII.
// It verifies supplied bytes and makes a deterministic manifest/proposal.
export const TAPEOUT_FORMAT='invention-lab/phase95-foundry-bundle/1';
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{2,120}$/.test(x);
const allowed=['SKY130','GF180MCU','TinyTapeout-SKY130'];
const fileTypes=Object.freeze({
 gds:'application/vnd.gdsii',lef:'text/plain',def:'text/plain',
 spice:'text/plain',testvectors:'application/json'});
const utf8=x=>new TextEncoder().encode(x);
export async function digestBytes(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length<1||bytes.length>25_000_000)
  throw Error('Nonempty bounded original artifact bytes required');
 if(!globalThis.crypto?.subtle)throw Error('SHA-256 WebCrypto required');
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function validateGDS(bytes){
 if(bytes.length<8)throw Error('Incomplete GDSII HEADER record');
 // GDSII first record is HEADER (0x0002) with record-type 0x00 and int16 payload.
 const size=(bytes[0]<<8)|bytes[1];
 if(size!==6||bytes[2]!==0||bytes[3]!==2)
  throw Error('Missing genuine GDSII binary HEADER: never encode JSON as GDS');
 let index=0,hasHeader=false,hasLib=false,hasStruct=false,hasEnd=false;
 while(index<bytes.length){
  if(index+4>bytes.length)throw Error('Truncated GDSII record');
  const n=(bytes[index]<<8)|bytes[index+1],kind=bytes[index+2];
  if(n<4||n%2!==0||index+n>bytes.length)throw Error('Malformed GDSII record length');
  if(index===0&&kind===0)hasHeader=true;
  if(kind===1)hasLib=true;
  if(kind===5)hasStruct=true;
  if(kind===4&&index+n===bytes.length)hasEnd=true;
  index+=n;
 }
 if(!hasHeader||!hasLib||!hasStruct||!hasEnd)
  throw Error('Missing mandatory GDSII library/structure/end records');
 return {headerPresent:true,libraryAndStructureRecordsPresent:true,
  layoutDRCVerified:false,foundryAcceptanceVerified:false};
}
export async function inspectFoundryArtifact({kind,filename,bytes}={}){
 if(!Object.hasOwn(fileTypes,kind)||typeof filename!=='string'||
    !/^[A-Za-z0-9_.-]{1,120}$/.test(filename)||
    !(bytes instanceof Uint8Array)||bytes.length<4||bytes.length>25_000_000)
  throw Error('Invalid original foundry artifact');
 if(kind==='gds')validateGDS(bytes);
 else{
  const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  if(text.includes('\u0000')||text.length<4)throw Error('Unsupported text artifact encoding');
  if(kind==='testvectors'){
   const j=JSON.parse(text);
   if(!j||!Array.isArray(j.vectors)||j.vectors.length<1||j.vectors.length>100000)
    throw Error('Invalid test vector artifact');
  }
  if(kind==='lef'&&!/\bMACRO\b/.test(text))throw Error('LEF macro not found');
  if(kind==='def'&&!/\bDESIGN\b/.test(text))throw Error('DEF design not found');
  if(kind==='spice'&&!/(\.subckt|\.SUBCKT)/.test(text))
   throw Error('SPICE subcircuit not found');
 }
 return {kind,filename,bytes:bytes.length,sha256:await digestBytes(bytes),
  mediaType:fileTypes[kind],structurallyInspected:true,
  signoffVerified:false};
}
export function planTapeout({designId,foundry,level1Passport=null,
 processCorner='tt',pdkRevision=null,proposedGeometrySha256=null}={}){
 if(!id(designId)||!allowed.includes(foundry)||
    !['tt','ss','ff','sf','fs'].includes(processCorner)||
    (pdkRevision!==null&&!id(pdkRevision))||
    (proposedGeometrySha256!==null&&!sha(proposedGeometrySha256)))
  throw Error('Invalid foundry design identity');
 const qualified=level1Passport?.status==='VIRTUALLY_QUALIFIED'&&
  level1Passport?.designId===designId&&
  level1Passport?.physicallyQualified===false&&
  level1Passport?.productionReleaseAuthorized===false;
 // The Level1 verifier currently has no admitted trusted calibration roots.
 // A JSON claim of VIRTUALLY_QUALIFIED is not equivalent to an authenticated
 // passport, and cannot authorize a foundry submission.
 return {format:TAPEOUT_FORMAT,designId,foundry,processCorner,pdkRevision,
  proposedGeometrySha256,
  virtualPassportClaim:qualified?'SELF_DECLARED_PENDING_VERIFICATION':'INSUFFICIENT_MODEL_DATA',
  status:'PACKAGE_CANDIDATE_NOT_FOUNDRY_READY',
  foundrySubmissionAuthorized:false,
  physicalQualification:'NO_GO',
  reasons:['no-approved-foundry-signoff','no-trusted-virtual-passport-attestation',
   'missing-independent-drc-lvs-and-rights-review']};
}
export async function createUnqualifiedFoundryBundle({plan,artifacts=[]}={}){
 if(plan?.format!==TAPEOUT_FORMAT||plan.status!=='PACKAGE_CANDIDATE_NOT_FOUNDRY_READY'||
    !Array.isArray(artifacts)||artifacts.length<1||artifacts.length>8)
  throw Error('Foundry package plan and original artifacts required');
 const unique=new Set(),entries=[];
 for(const artifact of artifacts){
  const data=await inspectFoundryArtifact(artifact);
  if(unique.has(data.kind))throw Error('Duplicate foundry artifact kind');
  unique.add(data.kind);entries.push(data);
 }
 entries.sort((a,b)=>a.kind.localeCompare(b.kind));
 const required=['gds','lef','def','spice','testvectors'];
 return {format:TAPEOUT_FORMAT,designId:plan.designId,foundry:plan.foundry,
  processCorner:plan.processCorner,pdkRevision:plan.pdkRevision,
  files:entries,missing:required.filter(x=>!unique.has(x)),
  status:'EVIDENCE_INTAKE_ONLY_NOT_FOUNDRY_READY',
  drcVerified:false,lvsVerified:false,
  physicalSiliconMeasured:false,licensedPdkVerified:false,
  foundrySubmissionAuthorized:false,virtualPassportAuthenticated:false,
  physicalQualification:'NO_GO'};
}
export function generatePostSiliconTestVectors({radix=4,kind='half-adder'}={}){
 if(![2,3,4].includes(radix)||kind!=='half-adder')
  throw Error('Only bounded functional half-adder reference vectors supported');
 const vectors=[];
 for(let a=0;a<radix;a++)for(let b=0;b<radix;b++)
  vectors.push({a,b,sum:(a+b)%radix,carry:Math.floor((a+b)/radix)});
 return {format:'invention-lab/phase95-test-vectors/1',kind,radix,vectors,
  voltageHardwareMeasured:false,physicalValidation:'none'};
}
export function exportCandidateBundleText(bundle){
 if(bundle?.format!==TAPEOUT_FORMAT||bundle.foundrySubmissionAuthorized!==false)
  throw Error('Only unqualified package manifest export supported');
 return JSON.stringify(bundle,null,2)+'\n';
}
