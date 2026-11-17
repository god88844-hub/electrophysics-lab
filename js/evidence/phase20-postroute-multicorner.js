// Actual TT SS FF Liberty timing against ONE routed SKY130 ALU and TT-extracted RC.
// Not independent DRC, LVS, multi-RC signoff, fabrication or silicon measurement.
import {CORNERS,LIB_REPO,LIB_COMMIT,OUTPUT_PORTS} from './phase16-multicorner.js';
import {IMAGE_DIGEST} from './phase18-physical-route.js';
export {CORNERS,LIB_REPO,LIB_COMMIT,OUTPUT_PORTS,IMAGE_DIGEST};
export const FORMAT='invention-lab/phase20-postroute-3-liberty-single-rc/1';
export const SOURCE_FILES=Object.freeze({
 rtl:'benchmarks/phase13/rtl/alu8.v',
 constraints:'benchmarks/phase14/alu8-tt.sdc',
 config:'benchmarks/phase18/config.mk',
 cornerPolicy:'benchmarks/phase16/acceptance.json',
 routedDb:'benchmarks/evidence/phase19/orfs/results/sky130hd/alu8/base/5_route.odb',
 routedSdc:'benchmarks/evidence/phase19/orfs/results/sky130hd/alu8/base/5_route.sdc',
 extractedSpef:'benchmarks/evidence/phase19/post-route.spef',
 phase19Report:'benchmarks/evidence/phase19/phase19.json',
 phase19Summary:'benchmarks/evidence/phase19/phase19-summary.json',
 phase19Runner:'scripts/phase19-run.sh',
 runner:'scripts/phase20-run.sh',
 tcl:'scripts/phase20-corner.tcl'
});
const hex=(s,n)=>typeof s==='string'&&new RegExp('^[0-9a-f]{'+n+'}$').test(s);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function parseCorner(log,c){
 if(!CORNERS.some(x=>eq(x,c)))throw Error('Invalid source-locked process corner');
 if(typeof log!=='string'||log.length<400)throw Error('Real external STA transcript missing');
 const begin='PH20_CORNER_BEGIN '+c.id+' '+c.corner, end='PH20_CORNER_END '+c.id;
 if(log.split(begin).length!==2||log.split(end).length!==2||log.indexOf(end)<log.indexOf(begin))
  throw Error('Missing, duplicated or out-of-order PVT identity');
 const text=log.slice(log.indexOf(begin)+begin.length,log.indexOf(end));
 if(text.split('PH20_SPEF_RELOADED').length!==2||/unconstrained|no paths found|not linked|blackbox/i.test(text))
  throw Error('Missing extracted RC or unconstrained timing');
 const insts=Number((/^PH20_OPENDB_INSTANCES (\d+)$/m.exec(text)||[])[1]);
 const nets=Number((/^PH20_OPENDB_NETS (\d+)$/m.exec(text)||[])[1]);
 if(!Number.isSafeInteger(insts)||insts<1||!Number.isSafeInteger(nets)||nets<10)
  throw Error('Invalid original physical database geometry');
 const paths=[];
 for(const endpoint of OUTPUT_PORTS){
  const open='PH20_PATH_BEGIN '+endpoint,close='PH20_PATH_END '+endpoint;
  if(text.split(open).length!==2||text.split(close).length!==2||text.indexOf(close)<text.indexOf(open))
   throw Error('Incomplete ten separately constrained timing paths');
  const block=text.slice(text.indexOf(open)+open.length,text.indexOf(close));
  const ep=/^Endpoint:\s*(\S+)/m.exec(block)?.[1];
  const sp=/^Startpoint:\s*(\S+)/m.exec(block)?.[1];
  const grp=/^\s*Path Group:\s*(\S+)/m.exec(block)?.[1];
  const typ=/^\s*Path Type:\s*(max|min)/m.exec(block)?.[1];
  const m=/^\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)\s+slack\s+\((MET|VIOLATED)\)/m.exec(block);
  if(ep!==endpoint||!/^(a\[[0-7]\]|b\[[0-7]\]|op\[[0-1]\])$/.test(sp||'')||
     grp!=='vclk'||typ!=='max'||!m||!Number.isFinite(Number(m[1]))||
     (Number(m[1])>=0)!==(m[2]==='MET'))
   throw Error('Unproven/malformed constrained output '+endpoint);
  paths.push({endpoint,startpoint:sp,slackNs:Number(m[1]),met:m[2]==='MET'});
 }
 const diagnostics=log.split('\n').filter(x=>/^\s*(?:Warning|Error):/.test(x)).map(x=>x.trim());
 if(diagnostics.some(x=>!x.includes('default_operating_condition')||!x.includes(c.corner)))
  throw Error('Unexpected actual external tool diagnostics: '+diagnostics.join('; '));
 return {id:c.id,corner:c.corner,temperatureC:c.temperatureC,voltageV:c.voltageV,
  instances:insts,nets,paths,worstSlackNs:Math.min(...paths.map(p=>p.slackNs)),
  withinBudget:paths.every(p=>p.met),sourceLibraryWarnings:diagnostics};
}
export function evaluatePhase20(report,actual){
 const errors=[];
 if(report?.format!==FORMAT||report?.method!=='three-real-liberty-corners-one-routed-odb-one-extracted-spef'||
    report?.analysis!=='postroute-pvt-single-fixed-rc-model'||
    report?.source?.repo!==LIB_REPO||report?.source?.commit!==LIB_COMMIT||
    report?.imageDigest!==IMAGE_DIGEST||report?.imageDigest!==actual?.imageDigest||
    !hex(report?.commitSha,40)||report.commitSha!==actual?.commitSha||
    report?.physicalValidation!=='none'||report?.physicalVerdict!=='unknown'||
    report?.realWorldBuildSuccessPercent!==null||report?.foundryDrcPassed!==false||
    report?.lvsPassed!==false||report?.siliconMeasurements!==false||
    report?.qualifiedSignoff!==false||report?.multipleRcCorners!==false)
  errors.push('Bad source identity or fabricated physical signoff');
 if(!report?.sha256||!actual?.sha256||
  Object.keys(SOURCE_FILES).some(k=>!hex(report.sha256?.[k],64)||report.sha256[k]!==actual.sha256?.[k]))
  errors.push('Original physical inputs, scripts or reports changed');
 if(!Array.isArray(report?.libraries)||report.libraries.length!==3||
    !Array.isArray(actual?.libraries)||actual.libraries.length!==3||
    !Array.isArray(report?.logs)||report.logs.length!==3||
    !Array.isArray(actual?.logs)||actual.logs.length!==3||
    !Array.isArray(report?.results)||report.results.length!==3||
    !Array.isArray(actual?.results)||actual.results.length!==3)errors.push('Incomplete PVT runs');
 else for(let i=0;i<3;i++){
  const c=CORNERS[i];
  if(!eq(report.libraries[i],c)||!eq(actual.libraries[i],c)||
   !hex(report.logs[i],64)||report.logs[i]!==actual.logs[i]||
   !eq(report.results[i],actual.results[i])||
   report.results[i]?.id!==c.id||report.results[i]?.paths?.length!==10||
   report.results[i]?.withinBudget!==true)errors.push('Tampered or failed actual corner '+c.id);
 }
 if(!Number.isFinite(report?.worstModelSlackNs)||report.worstModelSlackNs!==actual?.worstModelSlackNs||
   !Array.isArray(actual?.results)||actual.results.length!==3||
   report.worstModelSlackNs!==Math.min(...actual.results.map(x=>x.worstSlackNs)))
  errors.push('False aggregate worst post-route slack');
 return {ok:errors.length===0,errors,
  verdict:errors.length?'fail':'three-real-liberty-postroute-single-rc-model-only',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
