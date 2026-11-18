// Stage M physical preflight of *literal* SPICE voltage sources and four MOS
// terminal nets. Positive reports screen only the declared source envelopes.
// Unknown/dynamically driven/internal nets fail closed, not "safe by default".
import {MOS_SOA_LIMITS,verifyMosTerminalSOA,SOA_FORMAT} from './phase73-soa.js';
export const NETLIST_NODE_SOA_FORMAT='invention-lab/phase73-deck-node-soa/1';
const number='[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:[eE][-+]?\\d+)?';
const parseV=x=>new RegExp('^'+number+'$').test(x)?Number(x):null;
const result=(status,reason,details={})=>({
 format:NETLIST_NODE_SOA_FORMAT,status,reason,...details,
 dynamicTransistorWaveformsVerified:false,
 physicallyQualified:false,physicalQualification:'UNQUALIFIED_NO_GO'
});
function sourceBounds(line){
 const m=/^\s*v[a-z0-9_]+\s+([a-z0-9_.]+)\s+0\s+(.+?)\s*$/i.exec(line);
 if(!m)return null;
 const node=m[1].toLowerCase(),body=m[2].trim();
 // Units such as 1.8V, parameter expressions, pulse generators and offsets
 // are not assumed to have safe bounds.
 const dc=/^(?:dc\s+)?(\S+)$/i.exec(body);
 if(dc&&parseV(dc[1])!==null)return {node,min:Number(dc[1]),max:Number(dc[1])};
 const wave=/^pwl\s*\((.*)\)\s*$/i.exec(body);
 if(!wave)return {node,unbounded:true};
 const parts=wave[1].trim().split(/[\s,]+/);
 if(parts.length<4||parts.length%2!==0||parts.length>20000)
  return {node,unbounded:true};
 let last=-Infinity,vals=[];
 for(let i=0;i<parts.length;i+=2){
  const time=parseV(parts[i]),voltage=parseV(parts[i+1]);
  if(time===null||voltage===null||time<=last)
   return {node,unbounded:true};
  last=time;vals.push(voltage);
 }
 return {node,min:Math.min(...vals),max:Math.max(...vals)};
}
export function verifyDeckTerminalSOA({deck,devices,profile}={}){
 if(typeof deck!=='string'||deck.length<10||deck.length>2_000_000||
    !Array.isArray(devices)||devices.length<1||devices.length>100000||
    !Array.isArray(profile?.deviceModels))
  return result('SOA_INSUFFICIENT_NODE_BOUNDS','complete-SPICE-deck-and-device-inventory-required');
 const sources=new Map([['0',{min:0,max:0}]]),unbounded=new Set();
 const lines=deck.split(/\r?\n/);
 for(const raw of lines){
  const line=raw.trim();
  if(!line||line.startsWith('*'))continue;
  // No .param/.func substitution or model behavioral source can silently
  // substitute for independently known node voltages.
  if(/^v[a-z0-9_]+\s/i.test(line)){
   const source=sourceBounds(line);
   if(!source)
    return result('SOA_INSUFFICIENT_NODE_BOUNDS','voltage-source-not-ground-referenced-or-parseable');
   if(sources.has(source.node)||unbounded.has(source.node))
    return result('SOA_INSUFFICIENT_NODE_BOUNDS','duplicate-node-voltage-driver');
   if(source.unbounded)unbounded.add(source.node);
   else sources.set(source.node,{min:source.min,max:source.max});
  }
 }
 const allowed=new Set(profile.deviceModels);
 let checked=0,models=new Set(),missing=[],issues=[];
 const claims=new Map();
 for(const d of devices){
  if(typeof d?.instance!=='string'||claims.has(d.instance.toLowerCase()))
   return result('SOA_INSUFFICIENT_NODE_BOUNDS','duplicate-or-missing-transistor-claim');
  claims.set(d.instance.toLowerCase(),d);
 }
 for(const raw of lines){
  if(!/^\s*x[a-z0-9_]+\s/i.test(raw))continue;
  const tokens=raw.trim().split(/\s+/);
  const deviceName=tokens[0].toLowerCase();
  const modelIndex=tokens.findIndex((x,i)=>i>0&&Object.hasOwn(MOS_SOA_LIMITS,x));
  if(modelIndex<0){
   // No nested transistor can be certified from top-level node claims.
   return result('SOA_INSUFFICIENT_NODE_BOUNDS','unexpanded-subcircuit-in-deck',
    {instance:deviceName});
  }
  const model=tokens[modelIndex],claim=claims.get(deviceName);
  if(!allowed.has(model)||!claim||claim.model!==model||modelIndex!==5)
   return result('SOA_INSUFFICIENT_NODE_BOUNDS','four-terminal-model-binding-not-proven',
    {instance:deviceName});
  const nodes=tokens.slice(1,5).map(x=>x.toLowerCase());
  if(nodes.some(n=>unbounded.has(n)||!sources.has(n))){
   missing.push({instance:deviceName,nodes:nodes.filter(n=>!sources.has(n))});
   continue;
  }
  // Independent worst-case upper/lower voltage bounds, rather than caller-
  // supplied favorable samples, must pass each MOS profile's full screen.
  const [d,g,s,b]=nodes.map(n=>sources.get(n));
  const boundSamples=[];
  for(const gateV of [g.min,g.max])
   for(const drainV of [d.min,d.max])
    for(const sourceV of [s.min,s.max])
     for(const bodyV of [b.min,b.max])
      boundSamples.push({gateV,drainV,sourceV,bodyV});
  const evaluated=verifyMosTerminalSOA({model,samples:boundSamples});
  if(evaluated.status==='SOA_OXIDE_OVERSTRESS')
   issues.push({instance:deviceName,model,
    worstCase: evaluated.peakAbsoluteTerminalVoltagesV,
    violations:evaluated.violations.slice(0,12)});
  if(evaluated.status!=='SOA_MODEL_RANGE_SCREEN_PASS'&&
     evaluated.status!=='SOA_OXIDE_OVERSTRESS')
   missing.push({instance:deviceName,reason:evaluated.status});
  models.add(model);checked++;
 }
 if(issues.length)
  return result('SOA_OXIDE_OVERSTRESS',
   'voltage-source-derived-terminal-bounds-exceed-device-model-operating-limits',
   {transistorsChecked:checked,issues});
 if(missing.length||checked===0||checked!==claims.size)
  return result('SOA_INSUFFICIENT_NODE_BOUNDS',
   'transistor-nodes-not-provably-bounded-from-original-deck',
   {transistorsChecked:checked,missing,declaredDevices:claims.size});
 return result('SOA_MODEL_RANGE_SCREEN_PASS',
  'only-literal-independent-source-bounds-screened',
  {transistorsChecked:checked,sourceNodes:[...sources.keys()].sort(),
   deviceModels:[...models].sort(),dynamicTransistorWaveformsVerified:false});
}
