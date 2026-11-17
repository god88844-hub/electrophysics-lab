// True placed OpenDB + global-route guide evidence, explicitly not detail routing/DRC/LVS.
export const FORMAT='invention-lab/phase18-real-openroad-global-route/1';
export const IMAGE='openroad/orfs:26Q4-430-g2272e787c';
export const IMAGE_DIGEST='openroad/orfs@sha256:7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71';
export const SOURCES=Object.freeze({
 rtl:'benchmarks/phase13/rtl/alu8.v',
 sdc:'benchmarks/phase14/alu8-tt.sdc',
 config:'benchmarks/phase18/config.mk',
 geometryTcl:'scripts/phase18-geometry.tcl',
 runner:'scripts/phase18-run.sh'
});
export const OUTPUTS=Object.freeze({
 place:'benchmarks/evidence/phase18/orfs/results/sky130hd/alu8/base/3_place.odb',
 globalRoute:'benchmarks/evidence/phase18/orfs/results/sky130hd/alu8/base/5_1_grt.odb',
 guide:'benchmarks/evidence/phase18/orfs/results/sky130hd/alu8/base/route.guide',
 physicalFlowLog:'benchmarks/evidence/phase18/tool-logs/physical-flow.log',
 geometryLog:'benchmarks/evidence/phase18/tool-logs/geometry.log',
 imageDigest:'benchmarks/evidence/phase18/image-digest.txt'
});
const hash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const git=x=>typeof x==='string'&&/^[0-9a-f]{40}$/.test(x);
export function parseGeometry(log){
 if(typeof log!=='string'||log.length<100)throw Error('Missing genuine OpenROAD inspector transcript');
 const a='PH18_GEOMETRY_BEGIN',z='PH18_GEOMETRY_END';
 if(log.split(a).length!==2||log.split(z).length!==2)throw Error('Malformed geometry report delimiters');
 const lines=log.slice(log.indexOf(a)+a.length,log.indexOf(z)).trim().split(/\r?\n/);
 const match=/^(PH18_DIE_DBUNITS|PH18_INSTANCES|PH18_PLACED|PH18_NETS|PH18_BTERMS)\s+([0-9]+)(?:\s+([0-9]+))?$/;
 if(lines.length!==5)throw Error('Incomplete OpenDB geometry counters');
 const o={};
 for(const line of lines){
  const m=match.exec(line.trim());
  if(!m||o[m[1]])throw Error('Unrecognized OpenDB geometry counter');
  o[m[1]]=m.slice(2).filter(x=>x!==undefined).map(Number);
 }
 if(o.PH18_DIE_DBUNITS?.length!==2||o.PH18_DIE_DBUNITS.some(x=>!Number.isSafeInteger(x)||x<=0)||
    o.PH18_INSTANCES?.length!==1||o.PH18_INSTANCES[0]<1||
    o.PH18_PLACED?.[0]!==o.PH18_INSTANCES[0]||
    o.PH18_NETS?.[0]<1||o.PH18_BTERMS?.[0]!==28)
   throw Error('Not fully placed or invalid die, net, or 18-input/10-output geometry');
 return {dieDbUnits:o.PH18_DIE_DBUNITS,instances:o.PH18_INSTANCES[0],
  placed:o.PH18_PLACED[0],nets:o.PH18_NETS[0],bterms:o.PH18_BTERMS[0]};
}
export function evaluatePhase18(report,actual){
 const errors=[];
 if(report?.format!==FORMAT||report?.imageTag!==IMAGE||report?.commitSha!==actual?.commitSha||
   !git(report?.commitSha)||report?.physicalValidation!=='none'||
   report?.physicalVerdict!=='unknown'||report?.realWorldBuildSuccessPercent!==null||
   report?.detailedRoute!==false||report?.drcPassed!==false||
   report?.lvsPassed!==false||report?.siliconMeasurements!==false||
   report?.kind!=='placed-open-db-and-global-route-guide')
   errors.push('Incorrect scope or fabricated manufacturing claim');
 if(!/^openroad\/orfs@sha256:[0-9a-f]{64}$/.test(report?.imageDigest)||report.imageDigest!==actual?.imageDigest||report.imageDigest!==IMAGE_DIGEST)
   errors.push('Unverified OpenROAD container image digest');
 const keys=[...Object.keys(SOURCES),...Object.keys(OUTPUTS)];
 for(const k of keys){
   if(!hash(report?.sha256?.[k])||report.sha256[k]!==actual?.sha256?.[k])
     errors.push('Missing/mutated original physical artifact '+k);
 }
 if(JSON.stringify(report?.geometry)!==JSON.stringify(actual?.geometry)||!actual?.geometry||
   actual.geometry.placed<1||actual.geometry.placed!==actual.geometry.instances)
   errors.push('Placed OpenDB geometry was not independently re-inspected');
 if(!Number.isInteger(report?.routeGuideBytes)||report.routeGuideBytes<=0||
   report.routeGuideBytes!==actual?.routeGuideBytes)
   errors.push('No externally generated routing guide');
 if(typeof report?.flowLogStageEvidence!=='string'||report.flowLogStageEvidence!=='globalroute-executed'||
    actual?.flowLogStageEvidence!=='globalroute-executed')
   errors.push('Missing genuine OpenROAD global-route stage');
 return {ok:errors.length===0,errors,verdict:errors.length?'fail':'openroad-placement-and-global-route-model-only',
   physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
