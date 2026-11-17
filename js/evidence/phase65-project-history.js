// Phase 65 — portable in-memory content-addressed engineering project history.
// Never a cloud backup, distributed transaction, or authenticated signed audit.
import {createHash} from 'node:crypto';
export const FORMAT='invention-lab/phase65-content-addressed-project/1';
export const SNAPSHOT_FORMAT='invention-lab/phase65-project-snapshot/1';
const digest=x=>createHash('sha256').update(x).digest('hex');
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&
 (Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);
const requireOk=(yes,msg)=>{if(!yes)throw Error(msg)};
const validName=x=>typeof x==='string'&&/^[A-Za-z][A-Za-z0-9._/-]{0,79}$/.test(x)&&
 !x.includes('..')&&!x.includes('//');
const validHash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
function normalize(x,depth=0){
 requireOk(depth<=24,'Maximum portable project JSON depth exceeded');
 if(x===null||typeof x==='string'||typeof x==='boolean')return x;
 if(typeof x==='number'){requireOk(Number.isFinite(x),'Non-finite JSON value');return x;}
 if(Array.isArray(x)){
  requireOk(x.length<=10000,'Project array exceeds limit');
  return x.map(v=>normalize(v,depth+1));
 }
 requireOk(plain(x),'Only plain JSON objects permitted');
 const keys=Object.keys(x).sort();
 requireOk(keys.length<=1000,'Object property budget exceeded');
 const out=Object.create(null);
 for(const key of keys){
  requireOk(!['__proto__','constructor','prototype'].includes(key)&&key.length<=128,
   'Unsafe/oversized object key');
  out[key]=normalize(x[key],depth+1);
 }
 return out;
}
const stringify=x=>JSON.stringify(normalize(x));
const detached=x=>JSON.parse(JSON.stringify(x));
function validateDesign(d){
 requireOk(plain(d)&&d.format==='invention-lab/1'&&
  typeof d.id==='string'&&d.id.length>0&&d.id.length<=128&&
  ['chip','logic','quantum','cpu','ai'].includes(d.lab)&&
  Array.isArray(d.blocks)&&d.blocks.length<=2000&&
  Array.isArray(d.wires)&&d.wires.length<=5000,
  'Invalid canonical design');
 const seen=new Set();
 for(const b of d.blocks){
  requireOk(plain(b)&&typeof b.id==='string'&&b.id.length>0&&b.id.length<=128&&!seen.has(b.id)&&
   typeof b.type==='string'&&b.type.length<=128&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&
   Math.abs(b.x)<=1e6&&Math.abs(b.y)<=1e6,'Invalid or duplicate canonical block');
  seen.add(b.id);
 }
 const wires=new Set();
 for(const w of d.wires){
  requireOk(plain(w)&&typeof w.id==='string'&&w.id.length>0&&!wires.has(w.id)&&
   plain(w.from)&&plain(w.to)&&seen.has(w.from.block)&&seen.has(w.to.block)&&
   typeof w.from.port==='string'&&typeof w.to.port==='string',
   'Invalid or dangling canonical connection');
  wires.add(w.id);
 }
}
export function validateSnapshot(s){
 requireOk(plain(s)&&s.format===SNAPSHOT_FORMAT&&
  Object.keys(s).sort().join(',')==='designs,evidence,format,notes'&&
  Array.isArray(s.designs)&&s.designs.length<=20&&
  Array.isArray(s.evidence)&&s.evidence.length<=100&&
  typeof s.notes==='string'&&s.notes.length<=10000,'Invalid engineering snapshot');
 const ids=new Set();for(const d of s.designs){
  validateDesign(d);requireOk(!ids.has(d.id),'Duplicate design');ids.add(d.id);
 }
 for(const e of s.evidence){
  requireOk(plain(e)&&Object.keys(e).sort().join(',')==='evidenceId,physicalValidation,sourceSHA256'&&
   validName(e.evidenceId)&&validHash(e.sourceSHA256)&&e.physicalValidation==='none',
   'Physical evidence must be externally qualified; this store cannot promote it');
 }
 const raw=stringify(s);requireOk(Buffer.byteLength(raw)<=2_000_000,'Snapshot size budget exceeded');
 return true;
}
export function createStore(){return {format:FORMAT,objects:Object.create(null),
 commits:Object.create(null),refs:Object.create(null)};}
export function addSnapshot(store,snapshot){
 validateSnapshot(snapshot);const raw=stringify(snapshot),sha=digest(raw);
 if(!Object.hasOwn(store.objects,sha))store.objects[sha]=JSON.parse(raw);
 return sha;
}
export function commit(store,snapshot,{branch='main',expectedHead=null,message='snapshot'}={}){
 requireOk(validName(branch)&&typeof message==='string'&&message.length>0&&message.length<=256,
  'Invalid branch or commit message');
 const old=store.refs[branch]??null;
 requireOk(old===expectedHead,'Optimistic branch-head conflict');
 const objectSha=addSnapshot(store,snapshot);
 const data={objectSha,parents:old?[old]:[],message};
 const sha=digest(stringify(data));
 store.commits[sha]=normalize(data);
 store.refs[branch]=sha;
 return sha;
}
export function fork(store,source,newBranch){
 requireOk(validName(source)&&validName(newBranch)&&
  Object.hasOwn(store.refs,source)&&!Object.hasOwn(store.refs,newBranch),
  'Cannot fork unknown or existing branch');
 store.refs[newBranch]=store.refs[source];return store.refs[newBranch];
}
export function checkout(store,ref){
 const sha=Object.hasOwn(store.refs,ref)?store.refs[ref]:ref;
 requireOk(validHash(sha)&&Object.hasOwn(store.commits,sha),'Unknown project commit');
 const obj=store.objects[store.commits[sha].objectSha];
 requireOk(obj,'Missing project object');
 return detached(obj);
}
function ancestor(store,a,b){
 let head=b,steps=0;
 while(head&&steps++<10000){
  if(head===a)return true;
  const c=store.commits[head];if(!c)return false;
  head=c.parents[0]??null;
 }
 return false;
}
export function fastForward(store,{source,target,expectedTargetHead}){
 requireOk(validName(source)&&validName(target)&&
  Object.hasOwn(store.refs,source)&&Object.hasOwn(store.refs,target),
  'Unknown source/target branch');
 requireOk(store.refs[target]===expectedTargetHead,'Target branch advanced');
 requireOk(ancestor(store,store.refs[target],store.refs[source]),
  'Diverged history cannot be silently merged');
 store.refs[target]=store.refs[source];return store.refs[target];
}
export function verifyStore(store){
 requireOk(plain(store)&&store.format===FORMAT&&
  plain(store.objects)&&plain(store.commits)&&plain(store.refs),'Invalid project store');
 const hashes=Object.keys(store.objects),commits=Object.keys(store.commits);
 requireOk(hashes.length<=1000&&commits.length<=1000,'Store limit exceeded');
 for(const [hash,ob] of Object.entries(store.objects)){
  requireOk(validHash(hash)&&hash===digest(stringify(ob)),'Snapshot object hash mismatch');
  validateSnapshot(ob);
 }
 for(const [hash,cm] of Object.entries(store.commits)){
  requireOk(validHash(hash)&&plain(cm)&&
   Object.keys(cm).sort().join(',')==='message,objectSha,parents'&&
   hash===digest(stringify(cm))&&Object.hasOwn(store.objects,cm.objectSha)&&
   Array.isArray(cm.parents)&&cm.parents.length<=1&&
   cm.parents.every(x=>validHash(x)&&Object.hasOwn(store.commits,x)),
   'Commit integrity or parent chain mismatch');
 }
 for(const [branch,head] of Object.entries(store.refs))
  requireOk(validName(branch)&&Object.hasOwn(store.commits,head),'Invalid branch head');
 for(const hash of commits){
  let cur=hash,n=0,seen=new Set();
  while(cur!==null){
   requireOk(n++<=commits.length&&!seen.has(cur),'Cyclic commit ancestry');
   seen.add(cur);cur=store.commits[cur].parents[0]??null;
  }
 }
 return {valid:true,objectCount:hashes.length,commitCount:commits.length,
  branchCount:Object.keys(store.refs).length,
  originAttestation:'NOT_ESTABLISHED',remoteDurability:'NOT_PROVIDED'};
}
export function exportBundle(store){
 verifyStore(store);return stringify(store);
}
export function importBundle(raw){
 requireOk(typeof raw==='string'&&Buffer.byteLength(raw)<=10_000_000,'Bundle too large');
 const parsed=JSON.parse(raw);verifyStore(parsed);
 return normalize(parsed);
}
export const SAMPLE={format:SNAPSHOT_FORMAT,designs:[],evidence:[],notes:'source-only engineering design history'};
