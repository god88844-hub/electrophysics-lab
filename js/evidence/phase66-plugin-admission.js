// Phase 66 - no executable third-party plugins are imported. This is an
// allowlisted data-only manifest + built-in computation admission boundary.
// Integrity pinning by SHA256 is not proof of the publisher's identity.
import {createHash} from 'node:crypto';
export const FORMAT='invention-lab/phase66-data-only-engine/1';
const hash=x=>createHash('sha256').update(x).digest('hex');
const validHash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const validId=x=>typeof x==='string'&&/^[a-z][a-z0-9-]{2,63}$/.test(x);
const fail=m=>{throw Error(m)};
const sameKeys=(x,keys)=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
const DENY_KEYS=new Set(['__proto__','constructor','prototype','script','eval','code','source','module','import','require','url','fetch','network','fs','shell','permissions']);
const verifiedNoExecutionKeys=(v,depth=0)=>{
 if(depth>12)fail('Manifest too deeply nested');
 if(Array.isArray(v)){if(v.length>128)fail('Manifest array oversized');for(const x of v)verifiedNoExecutionKeys(x,depth+1);return}
 if(v&&typeof v==='object'){
  if(Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)fail('Manifest must contain plain JSON only');
  for(const [key,x] of Object.entries(v)){
   if(DENY_KEYS.has(key)||key.length>128)fail('Executable/host capability or unsafe key forbidden');
   verifiedNoExecutionKeys(x,depth+1);
  }
 }else if(v!==null&&typeof v!=='string'&&typeof v!=='boolean'&&!(typeof v==='number'&&Number.isFinite(v)))
  fail('Unsupported data-only manifest value');
};
export function validateManifest(m){
 verifiedNoExecutionKeys(m);
 if(!sameKeys(m,['format','pluginId','apiVersion','version','engine','description','parameters']))fail('Unknown data-only manifest property');
 if(m.format!==FORMAT||!validId(m.pluginId)||m.apiVersion!==1||
   typeof m.version!=='string'||!/^[1-9]\d*\.\d+\.\d+$/.test(m.version)||
   m.engine!=='built-in-ohms-law-v1'||typeof m.description!=='string'||
   m.description.length>300)fail('Unsupported plugin identity, engine or API');
 if(!Array.isArray(m.parameters)||m.parameters.length!==2)fail('Expected exact two-parameter model');
 const expected=[{id:'voltageV',unit:'V',minimum:-1000,maximum:1000},
  {id:'resistanceOhm',unit:'ohm',minimum:0.000001,maximum:1000000000}];
 if(JSON.stringify(m.parameters)!==JSON.stringify(expected))fail('Untrusted parameters or units');
 return true;
}
export const SAMPLE={format:FORMAT,pluginId:'resistor-study',apiVersion:1,version:'1.0.0',
 engine:'built-in-ohms-law-v1',description:'Source-declared ideal resistor current and power study',
 parameters:[{id:'voltageV',unit:'V',minimum:-1000,maximum:1000},
  {id:'resistanceOhm',unit:'ohm',minimum:0.000001,maximum:1000000000}]};
export function serializeManifest(m){
 validateManifest(m);return JSON.stringify(m);
}
export function createRegistry(){return new Map()}
export function admitManifest(registry,raw,{expectedSHA256}={}){
 if(!(registry instanceof Map))fail('Invalid plugin registry');
 if(typeof raw!=='string'||Buffer.byteLength(raw)>32768||Buffer.byteLength(raw)<10)
  fail('Manifest exceeds byte budget');
 if(!validHash(expectedSHA256)||hash(raw)!==expectedSHA256)
  fail('Manifest fails externally provided integrity pin');
 let manifest;
 try{manifest=JSON.parse(raw)}catch{fail('Invalid JSON manifest')}
 validateManifest(manifest);
 if(registry.has(manifest.pluginId))fail('Cannot shadow or replace installed engine identity');
 const record={pluginId:manifest.pluginId,apiVersion:1,version:manifest.version,
  engine:manifest.engine,sourceSHA256:hash(raw),manifest:structuredClone(manifest),
  capabilityMode:'data-only-builtin-operation',executedExternalCode:false,
  publisherIndependentlyAuthenticated:false};
 registry.set(manifest.pluginId,record);
 return {pluginId:record.pluginId,sourceSHA256:record.sourceSHA256,
  capabilityMode:record.capabilityMode,publisherIndependentlyAuthenticated:false};
}
export function runAdmitted(registry,pluginId,inputs){
 const r=registry?.get(pluginId);
 if(!r||r.engine!=='built-in-ohms-law-v1')fail('No admitted built-in engine');
 if(!sameKeys(inputs,['voltageV','resistanceOhm']))fail('Unrecognized input fields');
 const V=inputs.voltageV,R=inputs.resistanceOhm;
 if(typeof V!=='number'||!Number.isFinite(V)||Math.abs(V)>1000||
  typeof R!=='number'||!Number.isFinite(R)||R<0.000001||R>1e9)
  fail('Invalid or unsafe Ohm model input');
 const currentA=V/R,powerW=V*currentA;
 if(!Number.isFinite(currentA)||!Number.isFinite(powerW))fail('Non-finite modeled result');
 return {format:'invention-lab/phase66-conditional-engine-result/1',
  pluginId,sourceSHA256:r.sourceSHA256,engine:r.engine,
  calculation:{voltageV:V,resistanceOhm:R,currentA,powerW},
  assumptions:['ideal-ohmic-resistor','constant-resistance','no-temperature-drift','no-source-impedance'],
  externalCodeExecuted:false,hostNetworkOrFilePermission:false,
  independentPublisherIdentityAuthenticated:false,
  actualPhysicalInstrumentReadings:0,physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
export function auditPlugin(){
 const registry=createRegistry(),raw=serializeManifest(SAMPLE);
 const admitted=admitManifest(registry,raw,{expectedSHA256:hash(raw)});
 return {format:'invention-lab/phase66-data-only-plugin-review/1',
  admitted,result:runAdmitted(registry,SAMPLE.pluginId,{voltageV:3,resistanceOhm:6}),
  sourceSHA256:hash(raw),untrustedCodeExecutionSupported:false,
  trueRuntimeSandboxAvailable:false,physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
