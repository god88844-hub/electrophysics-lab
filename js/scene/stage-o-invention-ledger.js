// Stage O / Phase 88: content-addressed invention ledger.
// Tamper-evident snapshots, not a claim of tamper-proof remote authenticity.
import {Diagram} from '../core/diagram.js';
export const LEDGER_FORMAT='invention-lab/phase88-invention-ledger/1';
function plain(o){return o!==null&&typeof o==='object'&&!Array.isArray(o);}
export function stableSerialize(value){
 if(value===null||typeof value!=='object'){
  if(typeof value==='number'&&!Number.isFinite(value))throw Error('Nonfinite ledger data');
  if(typeof value==='undefined'||typeof value==='function'||typeof value==='symbol')
   throw Error('Unsupported ledger input');
  return JSON.stringify(value);
 }
 if(Array.isArray(value))return '['+value.map(stableSerialize).join(',')+']';
 if(Object.getPrototypeOf(value)!==Object.prototype)
  throw Error('Ledger stores plain JSON only');
 return '{'+Object.keys(value).sort().map(k=>
  JSON.stringify(k)+':'+stableSerialize(value[k])).join(',')+'}';
}
export async function contentSha256(data){
 const text=stableSerialize(data);
 const subtle=globalThis.crypto?.subtle;
 if(!subtle)throw Error('SHA-256 WebCrypto unavailable: ledger cannot claim immutable revision');
 const digest=await subtle.digest('SHA-256',new TextEncoder().encode(text));
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function admittedSnapshot(diagram){
 const json=typeof diagram?.toJSON==='function'?diagram.toJSON():diagram;
 if(!plain(json)||json.format!=='invention-lab/1'||
    !Array.isArray(json.blocks)||!Array.isArray(json.wires)||
    json.blocks.length>100000||json.wires.length>200000)
  throw Error('Bounded canonical Diagram snapshot required');
 const restored=Diagram.fromJSON(structuredClone(json));
 if(restored.issues().length)throw Error('Cannot record invalid canonical circuit');
 return structuredClone(restored.toJSON());
}
function metricsView(metrics){
 const keys=['transistorCount','areaUm2','powerW','latencyS','noiseMarginV',
  'simulatedPhysicalBuildSuccessPercent'];
 const result={};
 for(const k of keys){
  const x=metrics?.[k];
  result[k]=typeof x==='number'&&Number.isFinite(x)&&x>=0?x:'UNKNOWN';
 }
 // Claiming a calibrated percentage requires a trusted external verification
 // authority. This local ledger never infers it from user data.
 result.simulatedPhysicalBuildSuccessPercent='UNKNOWN';
 result.calibratedModelEvidenceAuthenticated=false;
 result.drcPassed=metrics?.drcPassed===true?'SELF_DECLARED':'UNKNOWN';
 result.thermalPassed=metrics?.thermalPassed===true?'SELF_DECLARED':'UNKNOWN';
 return result;
}
export function createInventionLedger({name='Invention'}={}){
 if(typeof name!=='string'||name.length<1||name.length>120)
  throw Error('Invalid invention ledger name');
 return {format:LEDGER_FORMAT,name,branches:{main:null},commits:{},head:'main',
  physicalValidation:'none'};
}
export function createInventionBranch(ledger,name,{from='main'}={}){
 if(ledger?.format!==LEDGER_FORMAT||typeof name!=='string'||
    !/^[a-zA-Z0-9][\w/-]{0,79}$/.test(name)||name.includes('..')||
    Object.hasOwn(ledger.branches,name)||!Object.hasOwn(ledger.branches,from))
  throw Error('Invalid or duplicate invention branch');
 ledger.branches[name]=ledger.branches[from];return name;
}
export async function commitInventionRevision(ledger,{branch='main',diagram,metrics={},
 actor='human',message='New model iteration'}={}){
 if(ledger?.format!==LEDGER_FORMAT||!Object.hasOwn(ledger.branches,branch))
  throw Error('Unknown invention ledger branch');
 if(!['human','agent'].includes(actor)||typeof message!=='string'||
    message.length<1||message.length>500)throw Error('Invalid revision author/message');
 if(Object.keys(ledger.commits).length>=1000)throw Error('Ledger entry limit exceeded');
 const snapshot=admittedSnapshot(diagram),parent=ledger.branches[branch];
 const payload={parent,actor,message,snapshot,metrics:metricsView(metrics)};
 const id=await contentSha256(payload);
 const commit={id,...payload,format:LEDGER_FORMAT};
 ledger.commits[id]=commit;ledger.branches[branch]=id;ledger.head=branch;
 return structuredClone(commit);
}
export async function verifyInventionLedger(ledger){
 if(ledger?.format!==LEDGER_FORMAT||!plain(ledger.branches)||!plain(ledger.commits))
  return {status:'INVALID_LEDGER',invalid:['format']};
 const invalid=[];
 for(const [id,commit] of Object.entries(ledger.commits)){
  const {parent,actor,message,snapshot,metrics}=commit;
  try{
   if(id!==commit.id||id!==await contentSha256({parent,actor,message,snapshot,metrics})||
      parent!==null&&!Object.hasOwn(ledger.commits,parent))
    invalid.push(id);
  }catch{invalid.push(id);}
 }
 for(const [name,id] of Object.entries(ledger.branches))
  if(id!==null&&!Object.hasOwn(ledger.commits,id))invalid.push('branch:'+name);
 return {format:LEDGER_FORMAT,status:invalid.length?'INVALID_LEDGER':'VERIFIED_LOCAL_HASH_CHAIN',
  invalid,physicalQualification:'UNKNOWN / NO-GO',externalSignatureVerified:false};
}
export function compareInventionRevisions(ledger,a,b){
 if(ledger?.format!==LEDGER_FORMAT)throw Error('Invalid ledger');
 const resolve=ref=>ledger.commits[ledger.branches[ref]??ref];
 const left=resolve(a),right=resolve(b);
 if(!left||!right)throw Error('Unknown revision to compare');
 const blocks=x=>new Map(x.snapshot.blocks.map(y=>[y.id,y]));
 const wires=x=>new Map(x.snapshot.wires.map(y=>[y.id,y]));
 const l=blocks(left),r=blocks(right),lw=wires(left),rw=wires(right);
 const added=[...r.keys()].filter(k=>!l.has(k)).sort();
 const removed=[...l.keys()].filter(k=>!r.has(k)).sort();
 const changed=[...r.keys()].filter(k=>l.has(k)&&stableSerialize(l.get(k))!==stableSerialize(r.get(k))).sort();
 const envelopes=x=>x.snapshot.meta?.dimensionedCAD?.parts||{};
 const oldEnvelopes=envelopes(left),newEnvelopes=envelopes(right);
 const dimensions=[...new Set([...Object.keys(oldEnvelopes),...Object.keys(newEnvelopes)])]
  .sort().filter(id=>stableSerialize(oldEnvelopes[id]??null)!==
    stableSerialize(newEnvelopes[id]??null))
  .map(id=>({blockId:id,before:oldEnvelopes[id]??null,after:newEnvelopes[id]??null}));
 const metricDiffs={};
 for(const k of Object.keys(right.metrics)){
  const v=left.metrics[k],w=right.metrics[k];
  metricDiffs[k]={before:v,after:w,delta:typeof v==='number'&&typeof w==='number'?w-v:'UNKNOWN'};
 }
 return {format:LEDGER_FORMAT,from:left.id,to:right.id,
  scene:{added,removed,changed,
   wiresAdded:[...rw.keys()].filter(k=>!lw.has(k)).sort(),
   wiresRemoved:[...lw.keys()].filter(k=>!rw.has(k)).sort(),
   mmLayoutChanged:dimensions},
  metrics:metricDiffs,
  physicalValidation:'none',simulatedPhysicalBuildSuccessPercent:'UNKNOWN'};
}
