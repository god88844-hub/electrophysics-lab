// Phase 16: bounded real Liberty TT/SS/FF pre-layout OpenSTA evidence.
// A true three-library PVT check != physical post-route signoff or foundry yield.
export const FORMAT='invention-lab/phase16-external-3-corner-sta/1';
export const MANIFEST_FORMAT='invention-lab/phase16-actual-multi-corner-acceptance/1';
export const LIB_REPO='https://github.com/fossi-foundation/skywater-pdk-libs-sky130_fd_sc_hd';
export const LIB_COMMIT='9cb2d7cb8ed4619094263614039a61b6b2d22a88';
export const CORNERS=Object.freeze([
  {id:'tt',corner:'tt_025C_1v80',temperatureC:25,voltageV:1.8,
   sha256:'8e78e14442062dba34d414fca6490b2f6b96038d4510d1438ca44fee31487135',
   gitBlobSha1:'1f086a1ae9064d48d36ff66a605491a18f6b5ed6',bytes:12841637},
  {id:'ss',corner:'ss_100C_1v60',temperatureC:100,voltageV:1.6,
   sha256:'9b24f0db3967ac67b4cae1f74bb480fd47922d18d0ed577e3c121739b412c361',
   gitBlobSha1:'06e2c5b3274538a93be7d11464b0726ebc68dd54',bytes:12845260},
  {id:'ff',corner:'ff_n40C_1v95',temperatureC:-40,voltageV:1.95,
   sha256:'fb61d91c55a7f85b1989e8149d040b13ba5e7f5478f5bf0c3c16c5da30720139',
   gitBlobSha1:'31b614db0eecc7dce80d1849e4596ee337e72dc8',bytes:12918504}
].map(x=>Object.freeze(x)));
export const OUTPUT_PORTS=Object.freeze(['carry','zero',...Array.from({length:8},(_,i)=>'y['+i+']')]);
const sha256=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const sha1=x=>typeof x==='string'&&/^[0-9a-f]{40}$/.test(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const input=x=>/^(?:(?:a|b)\[[0-7]\]|op\[[0-1]\])$/.test(x);
const err=x=>{throw Error(x)};
export function parseCornerLog(log,c){
  if(!CORNERS.some(x=>eq(c,x)))err('Not an accepted frozen process corner');
  if(typeof log!=='string'||log.length<150||/^\s*(?:Error|Warning):/mi.test(log))
    err('OpenSTA process output missing, truncated or has diagnostics');
  const startMark='PHASE16_CORNER_BEGIN '+c.id+' '+c.corner;
  const endMark='PHASE16_CORNER_END '+c.id;
  if(log.split(startMark).length!==2||log.split(endMark).length!==2)
    err('Missing, repeated, or false OpenSTA corner identity');
  const a=log.indexOf(startMark)+startMark.length,b=log.indexOf(endMark);
  if(b<=a)err('No timing output bounded by corner');
  const report=log.slice(a,b);
  if(/unconstrained|no paths found|not linked|unknown cell|black.box/i.test(report))
    err('Unlinked, unconstrained or unsupported paths');
  const starts=[...report.matchAll(/^Startpoint:\s*(.+)$/gm)];
  const ends=[...report.matchAll(/^Endpoint:\s*(.+)$/gm)];
  const groups=[...report.matchAll(/^\s*Path Group:\s*(\S+)\s*$/gm)];
  const types=[...report.matchAll(/^\s*Path Type:\s*(max|min)\s*$/gm)];
  const slacks=[...report.matchAll(/^\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)\s+slack\s+\((MET|VIOLATED)\)\s*$/gm)];
  if([starts,ends,groups,types,slacks].some(x=>x.length!==10))
    err('Every corner requires ten complete independent maximum timing paths');
  if(groups.some(x=>x[1]!=='vclk')||types.some(x=>x[1]!=='max'))
    err('Unexpected unconstrained clock or min-path used as max-path');
  const paths=ends.map((x,i)=>{
    const start=starts[i][1].split(' ')[0];
    const end=x[1].split(' ')[0];
    const slack=Number(slacks[i][1]),met=slacks[i][2]==='MET';
    if(!input(start)||!OUTPUT_PORTS.includes(end)||!finite(slack)||
       met!==(slack>=0))
      err('Malformed timing endpoint or contradictory/nonfinite slack');
    return {start,end,slackNs:slack,met};
  });
  if(new Set(paths.map(p=>p.end)).size!==10)
    err('Duplicate path endpoints, missing ALU outputs');
  const worstSlackNs=Math.min(...paths.map(x=>x.slackNs));
  return {id:c.id,corner:c.corner,temperatureC:c.temperatureC,voltageV:c.voltageV,
    paths,worstSlackNs,withinBudget:paths.every(x=>x.met)};
}
export function evaluatePhase16Evidence(manifest,report,actual={}){
  const errors=[];
  if(manifest?.format!==MANIFEST_FORMAT||
    manifest?.source?.repo!==LIB_REPO||manifest?.source?.commit!==LIB_COMMIT||
    manifest?.source?.license!=='Apache-2.0'||
    manifest?.design!=='alu8'||manifest?.analysis!=='pre-layout-combinational-three-corner-opensta-model'||
    manifest?.timingBudgetNs!==20||manifest?.expectedPathsPerCorner!==10||
    manifest?.sdc!=='benchmarks/phase14/alu8-tt.sdc'||
    !eq(manifest?.corners,CORNERS)||
    manifest?.physicalValidation!=='none'||manifest?.physicalVerdict!=='unknown'||
    manifest?.realWorldBuildSuccessPercent!==null)
    errors.push('Independent multi-corner acceptance policy altered');
  if(report?.format!==FORMAT||
    report?.design!=='alu8'||
    report?.analysis!=='pre-layout-combinational-three-corner-opensta-model'||
    report?.source?.repo!==LIB_REPO||report?.source?.commit!==LIB_COMMIT||
    report?.physicalValidation!=='none'||report?.physicalVerdict!=='unknown'||
    report?.realWorldBuildSuccessPercent!==null||
    report?.physicalQualified!==false||report?.postLayout!==false||
    report?.extractedParasitics!==false||report?.siliconMeasurements!==false||
    report?.processCornersTested!==3)
    errors.push('Missing model metadata or fabricated physical validation');
  if(!sha1(report?.commitSha)||report?.commitSha!==actual?.commitSha)
    errors.push('Missing/stale real workflow source commit');
  if(typeof report?.openstaVersion!=='string'||!/^OpenSTA \d+\.\d+(?:\.\d+)?$/.test(report.openstaVersion)||
     report.openstaVersion!==actual?.openstaVersion)
    errors.push('Missing external OpenSTA identity');
  if(!Array.isArray(report?.libraries)||report.libraries.length!==3||
     !Array.isArray(actual?.libraries)||actual.libraries.length!==3)
    errors.push('Missing exact downloaded TT/SS/FF library evidence');
  else for(let i=0;i<3;i++){
    const pin=CORNERS[i],lib=report.libraries[i],independent=actual.libraries[i];
    if(lib?.id!==pin.id||lib?.corner!==pin.corner||
       lib?.gitBlobSha1!==pin.gitBlobSha1||lib?.sha256!==pin.sha256||
       lib?.bytes!==pin.bytes||!eq(lib,independent))
       errors.push('Library source, hash, corner or size mismatch '+pin.id);
  }
  const hashes=['rtlSha256','netlistSha256','sdcSha256','staTclSha256'];
  for(const key of hashes)
    if(!sha256(report?.sourceHashes?.[key])||
      report.sourceHashes[key]!==actual?.sourceHashes?.[key])
      errors.push('Missing/mutated source evidence '+key);
  if(!Array.isArray(report?.logs)||report.logs.length!==3||
     !Array.isArray(actual?.logs)||actual.logs.length!==3||
     !Array.isArray(report?.results)||report.results.length!==3||
     !Array.isArray(actual?.results)||actual.results.length!==3)
    errors.push('Incomplete three external OpenSTA processes or log evidence');
  else for(let i=0;i<3;i++){
    if(!sha256(report.logs[i])||report.logs[i]!==actual.logs[i]||
      !eq(report.results[i],actual.results[i])||
      report.results[i]?.id!==CORNERS[i].id||
      report.results[i]?.corner!==CORNERS[i].corner||
      report.results[i]?.withinBudget!==true)
      errors.push('Unverified or failed real PVT timing case '+CORNERS[i].id);
  }
  if(!finite(report?.worstModelSlackNs)||
     !Array.isArray(actual?.results)||actual.results.length!==3||
     report.worstModelSlackNs!==Math.min(...actual.results.map(x=>x.worstSlackNs)))
    errors.push('Global worst reported PVT slack is missing/modified');
  return {ok:errors.length===0,errors,verdict:errors.length?'fail':'3-corner-pre-layout-model-only',
    realProcessCornersAnalyzed:errors.length?0:3,
    physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
