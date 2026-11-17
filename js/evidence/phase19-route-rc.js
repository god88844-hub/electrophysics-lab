// Phase 19: real third-party detailed route + OpenRCX wire extraction
// for one small 8-bit ALU, NOT foundry DRC, LVS, qualified PDK or silicon.
import {IMAGE,IMAGE_DIGEST} from './phase18-physical-route.js';
export {IMAGE,IMAGE_DIGEST};
export const FORMAT='invention-lab/phase19-real-sky130-detailroute-rcx-sta/1';
export const INPUTS=Object.freeze({
 rtl:'benchmarks/phase13/rtl/alu8.v',
 constraints:'benchmarks/phase14/alu8-tt.sdc',
 config:'benchmarks/phase18/config.mk',
 run:'scripts/phase19-run.sh',
 inspect:'scripts/phase19-inspect.tcl'
});
const dir='benchmarks/evidence/phase19/';
const res=dir+'orfs/results/sky130hd/alu8/base/';
export const OUTPUTS=Object.freeze({
 grtDb:res+'5_1_grt.odb',
 detailDb:res+'5_2_route.odb',
 routeDb:res+'5_route.odb',
 routeSdc:res+'5_route.sdc',
 detailRouteToolLog:dir+'orfs/logs/sky130hd/alu8/base/5_2_route.log',
 spef:dir+'post-route.spef',
 routeLog:dir+'tool-logs/detailed-route.log',
 inspectLog:dir+'tool-logs/extraction-timing.log',
 digest:dir+'image-digest.txt'
});
const hex=(s,n)=>typeof s==='string' && new RegExp('^[0-9a-f]{'+n+'}$').test(s);
const outputs=['carry','zero',...Array.from({length:8},(_,i)=>'y['+i+']')];
export function parseRouteInspect(log){
 if(typeof log!=='string'||log.length<500)throw Error('Missing real post-route inspector log');
 const geo=/PH19_GEOMETRY_BEGIN\s*PH19_DIE_DBUNITS (\d+) (\d+)\s*PH19_INSTANCES (\d+)\s*PH19_PLACED (\d+)\s*PH19_SIGNAL_NETS (\d+)\s*PH19_WIRED_SIGNAL_NETS (\d+)\s*PH19_BTERMS (\d+)\s*PH19_GEOMETRY_END/;
 const m=geo.exec(log);
 if(!m||log.split('PH19_GEOMETRY_BEGIN').length!==2||
    log.split('PH19_GEOMETRY_END').length!==2)throw Error('Missing/duplicate OpenDB geometry');
 const n=m.slice(1).map(Number);
 if(n.some(x=>!Number.isSafeInteger(x))||n[0]<=0||n[1]<=0||n[2]<=0||
    n[2]!==n[3]||n[4]<10||n[5]<10||n[5]>n[4]||n[6]!==30)
    throw Error('Invalid detailed-route geometry and wire coverage');
 if(log.split('PH19_SPEF_RELOADED').length!==2||log.split('PH19_TIMING_BEGIN').length!==2||
    log.split('PH19_TIMING_END').length!==2)throw Error('No uniquely reloaded extracted parasitics and actual timing');
 const timing=log.slice(log.indexOf('PH19_TIMING_BEGIN'),log.indexOf('PH19_TIMING_END'));
 const seen=[];
 for(const end of outputs){
   const open='PH19_PATH_BEGIN '+end,close='PH19_PATH_END '+end;
   if(timing.split(open).length!==2||timing.split(close).length!==2)throw Error('Missing or duplicate output '+end);
   const start=timing.indexOf(open)+open.length,stop=timing.indexOf(close);
   const block=timing.slice(start,stop);
   if(stop<=start||/unconstrained|no paths found|not linked|unmapped/i.test(block))
      throw Error('Missing constrained maximum timing path for '+end);
   const ep=/^Endpoint:\s*(\S+)/m.exec(block),path=/^\s*Path Type:\s*(max|min)\s*$/m.exec(block);
   const slack=/^\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)\s+slack\s+\((MET|VIOLATED)\)\s*$/m.exec(block);
   if(ep?.[1]!==end||path?.[1]!=='max'||!slack)throw Error('Wrong path endpoint/type/slack '+end);
   const ns=Number(slack[1]),met=slack[2]==='MET';
   if(!Number.isFinite(ns)||met!==(ns>=0))throw Error('Contradictory slack '+end);
   seen.push({endpoint:end,slackNs:ns,met});
 }
 if(log.match(/^Error:/gm)?.length)throw Error('External physical inspector recorded error');
 return {geometry:{dieDbUnits:n.slice(0,2),instances:n[2],placed:n[3],
  signalNets:n[4],wiredSignalNets:n[5],bterms:n[6]},
  paths:seen,worstSlackNs:Math.min(...seen.map(x=>x.slackNs))};
}
export function inspectSpef(s){
 if(typeof s!=='string'||s.length<500||!/^\*SPEF\s+"ieee 1481-[0-9]{4}"/im.test(s)||
   !/^\*DESIGN\s+/m.test(s)||!/^\*D_NET\s+/m.test(s)||!/^\*CAP\s*$/m.test(s)||
   !/^\*RES\s*$/m.test(s))throw Error('No complete external OpenRCX SPEF network');
 const count=(s.match(/^\*D_NET\s+/gm)||[]).length;
 const cap=(s.match(/^\*CAP\s*$/gm)||[]).length;
 const res=(s.match(/^\*RES\s*$/gm)||[]).length;
 const end=(s.match(/^\*END\s*$/gm)||[]).length;
 if(count<10||cap!==count||res!==count||end!==count)throw Error('Incomplete physical extracted networks');
 return {nets:count,bytes:Buffer.byteLength(s,'utf8')};
}
export function evaluatePhase19(record,actual){
 const errors=[];
 if(record?.format!==FORMAT||record?.imageTag!==IMAGE||record?.imageDigest!==IMAGE_DIGEST||
    record.imageDigest!==actual?.imageDigest||!hex(record?.commitSha,40)||
    record.commitSha!==actual?.commitSha||record.kind!=='detailed-routed-open-db-openrcx-spef-postroute-sta'||
    record?.physicalValidation!=='none'||record?.physicalVerdict!=='unknown'||
    record?.realWorldBuildSuccessPercent!==null||record?.foundryDrcPassed!==false||
    record?.lvsPassed!==false||record?.siliconMeasurements!==false||record?.signoffQualified!==false)
    errors.push('Invalid provenance/scope or fabricated physical qualification');
 for(const key of [...Object.keys(INPUTS),...Object.keys(OUTPUTS)]){
   if(!hex(record?.sha256?.[key],64)||record.sha256[key]!==actual?.sha256?.[key])
      errors.push('Tampered or missing original input/output '+key);
 }
 if(JSON.stringify(record?.model)!==JSON.stringify(actual?.model)||
    !actual?.model||actual.model.paths?.length!==10||
    actual.model.geometry?.wiredSignalNets<10||
    actual.model.paths.some(p=>!p.met))
    errors.push('Unverified, incomplete or violated actual 20 ns post-route model');
 if(JSON.stringify(record?.spefStats)!==JSON.stringify(actual?.spefStats)||
    actual.spefStats?.nets<10||actual.spefStats?.bytes<500)
    errors.push('SPEF source/data incomplete or mutated');
 return {ok:errors.length===0,errors,
   verdict:errors.length?'fail':'real-detailed-route-rcx-postroute-sta-model-only',
   physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
