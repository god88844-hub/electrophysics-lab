// Phase 15: exact-evidence model sensitivity grid for Phase 14's ALU.
// A load/slew sweep under ONE TT library is not a process-corner sweep, routed
// timing closure, physical qualification, or a manufacturing yield estimator.
export const FORMAT='invention-lab/phase15-tt-load-slew-evidence/1';
export const GRID=Object.freeze([
  [0,0.05,0.005],[1,0.05,0.010],[2,0.05,0.020],
  [3,0.10,0.005],[4,0.10,0.010],[5,0.10,0.020],
  [6,0.20,0.005],[7,0.20,0.010],[8,0.20,0.020]
].map(([id,slewNs,loadPf])=>Object.freeze({id,slewNs,loadPf})));
export const ENDPOINTS=Object.freeze(['carry','zero',...Array.from({length:8},(_,i)=>'y['+i+']')]);
const SHA=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const SOURCE_KEYS=Object.freeze(['rtl','liberty','netlist','sdc','staTcl']);
const isNum=x=>typeof x==='number'&&Number.isFinite(x);
const fail=message=>{throw new Error(message);};
const deepFreeze=x=>{
  if(x&&typeof x==='object'&&!Object.isFrozen(x)){
    for(const y of Object.values(x))deepFreeze(y);
    Object.freeze(x);
  }
  return x;
};
export function parsePhase15ToolLog(log,expected){
  if(!expected||!GRID.some(x=>x.id===expected.id&&x.slewNs===expected.slewNs&&x.loadPf===expected.loadPf))
    fail('Unknown or modified acceptance-grid case');
  if(typeof log!=='string'||log.length<120)
    fail('Missing/truncated external OpenSTA transcript');
  if(/^\s*(?:Error|Warning):/mi.test(log))
    fail('OpenSTA execution contains unresolved error/warning');
  const begin='PHASE15_CASE_BEGIN '+expected.id+' '+expected.slewNs+' '+expected.loadPf;
  const end='PHASE15_CASE_END '+expected.id;
  if(log.split(begin).length!==2||log.split(end).length!==2)
    fail('Missing/duplicate exact case provenance markers');
  const first=log.indexOf(begin),last=log.indexOf(end);
  if(first<0||last<=first||log.slice(first+begin.length,last).trim().length<50)
    fail('Malformed case timing output');
  const body=log.slice(first+begin.length,last);
  if(/unconstrained|no paths found|not linked|unknown cell|black.box/i.test(body))
    fail('Unlinked or unconstrained timing cannot validate model');
  const starts=[...body.matchAll(/^Startpoint:\s*(.+)$/gm)];
  const ends=[...body.matchAll(/^Endpoint:\s*(.+)$/gm)];
  const types=[...body.matchAll(/^\s*Path Type:\s*(max|min)\s*$/gm)];
  const slacks=[...body.matchAll(/^\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)\s+slack\s+\((MET|VIOLATED)\)\s*$/gm)];
  if(starts.length!==10||ends.length!==10||types.length!==10||
     slacks.length!==10||types.some(x=>x[1]!=='max'))
    fail('Incomplete ten-output maximum-path STA coverage');
  const endpoints=ends.map(x=>x[1].split(' ')[0]);
  if(new Set(endpoints).size!==ENDPOINTS.length||
     endpoints.some(x=>!ENDPOINTS.includes(x)))
    fail('No distinct timing path to every expected ALU output');
  if(starts.some(x=>!/^(a|b|op)\[\d+\]/.test(x[1])))
    fail('Timing path does not originate at a known data input');
  const paths=ends.map((out,i)=>{
    const slack=Number(slacks[i][1]);
    if(!isNum(slack)||((slack>=0)!==(slacks[i][2]==='MET')))
      fail('Non-finite or inconsistent timing slack verdict');
    return {start:starts[i][1].split(' ')[0],end:out[1].split(' ')[0],
      worstSlackNs:slack,met:slack>=0};
  });
  return deepFreeze({id:expected.id,slewNs:expected.slewNs,loadPf:expected.loadPf,
    paths,allTenOutputsCovered:true,worstSlackNs:Math.min(...paths.map(x=>x.worstSlackNs)),
    met:paths.every(x=>x.met)});
}
export function evaluatePhase15Evidence(manifest,record,actual){
  const errors=[];
  if(manifest?.format!=='invention-lab/phase15-acceptance/1'||
     manifest?.corner!=='tt_025C_1v80'||
     manifest?.periodNs!==20||
     manifest?.analysis!=='pre-layout-TT-load-and-slew-model-sweep'||
     JSON.stringify(manifest?.grid)!==JSON.stringify(GRID)||
     manifest?.requiredPathsPerCase!==10||
     manifest?.physicalValidation!=='none'||
     manifest?.realWorldBuildSuccessPercent!==null)
    errors.push('Acceptance manifest or prespecified timing envelope altered');
  if(record?.format!==FORMAT||record?.corner!=='tt_025C_1v80'||
     record?.design!=='alu8'||
     record?.analysis!=='pre-layout-TT-load-and-slew-model-sweep'||
     record?.physicalValidation!=='none'||record?.physicalVerdict!=='unknown'||
     record?.physicalQualified!==false||
     record?.realWorldBuildSuccessPercent!==null||
     record?.postLayout!==false||record?.processCornersTested!==1||
     record?.actualHardwareMeasurements!==false)
    errors.push('Missing model evidence or fabricated physical/production claim');
  if(!actual||typeof actual!=='object'||!actual.commitSha||!actual.toolVersion)
    errors.push('Independent tool replay missing');
  if(typeof record?.toolVersion!=='string'||!/^OpenSTA \d+\.\d+/.test(record.toolVersion)||
     !actual||record.toolVersion!==actual.toolVersion)
    errors.push('External OpenSTA version not independently verified');
  if(typeof record?.commitSha!=='string'||!record.commitSha||
     record?.commitSha!==actual?.commitSha)
    errors.push('Evidence does not match actual workflow source commit');
  if(record?.libertyGitBlobSha1!=='5773657fe730d984ac06726d0addfdad80395b9b'||
     actual?.libertyGitBlobSha1!==record?.libertyGitBlobSha1)
    errors.push('Exact upstream TT library provenance mismatch');
  for(const k of SOURCE_KEYS)
    if(!SHA(record?.sourceHashes?.[k])||
       record.sourceHashes[k]!==actual?.sourceHashes?.[k])
      errors.push('Missing or modified source artifact '+k);
  if(!Array.isArray(record?.cases)||record.cases.length!==GRID.length||
     !Array.isArray(actual?.cases)||actual.cases.length!==GRID.length||
     !Array.isArray(record?.logHashes)||record.logHashes.length!==GRID.length||
     !Array.isArray(actual?.logHashes)||actual.logHashes.length!==GRID.length)
    errors.push('Incomplete experiment grid, replay or raw log digest manifest');
  else for(let i=0;i<GRID.length;i++){
    const check=GRID[i];
    if(!SHA(record.logHashes[i])||record.logHashes[i]!==actual.logHashes[i])
      errors.push('Missing or changed original OpenSTA log for case '+i);
    if(JSON.stringify(record.cases[i])!==JSON.stringify(actual.cases[i])||
       record.cases[i]?.id!==check.id||
       record.cases[i]?.slewNs!==check.slewNs||
       record.cases[i]?.loadPf!==check.loadPf||
       record.cases[i]?.met!==true)
      errors.push('Unverified or failed constrained model scenario '+i);
  }
  return deepFreeze({ok:errors.length===0,errors,
    verdict:errors.length?'fail':'TT-pre-layout-model-only',
    processCornersTested:errors.length?0:1,
    physicalValidation:'none',physicalVerdict:'unknown',
    realWorldBuildSuccessPercent:null});
}
