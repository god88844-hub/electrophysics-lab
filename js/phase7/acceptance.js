// Phase 7 evidence policy. Independent of which external engine produced
// reports: missing, stale, duplicate and unsupported cases ALWAYS fail closed.
// This does not validate actual data authenticity or turn models into silicon.
export const PHASE7_MANIFEST_FORMAT='invention-lab/phase7-acceptance/1';
export const PHASE7_REPORT_FORMAT='invention-lab/phase7-cross-engine/1';
export function evaluatePhase7(manifest,{qemu,numpy},sha=null){
  const errors=[];
  const required=manifest?.requiredIds;
  if(manifest?.format!==PHASE7_MANIFEST_FORMAT||
     !Array.isArray(required)||required.length!==3||
     new Set(required).size!==required.length||
     required.some(id=>typeof id!=='string'||!id.trim()))
    return {ok:false,errors:['Malformed or changed independent Phase 7 acceptance manifest'],passed:0,required:3};
  const expected=['rv32i-qemu-gnu','matmul-2x3x2-signed','matmul-3x2x3-mixed'];
  if(required.some(id=>!expected.includes(id))||expected.some(id=>!required.includes(id)))
    errors.push('Frozen required case IDs were modified');
  for(const [label,report] of [['QEMU',qemu],['NumPy',numpy]]){
    if(!report || report.format!==PHASE7_REPORT_FORMAT||report.result!=='pass')
      errors.push(label+' reference missing or nonpassing');
    if(report?.physicalValidation!=='none'||report?.realWorldBuildSuccessPercent!==null)
      errors.push(label+' report falsely claims physical validation or a build probability');
    if(sha && report?.commitSha!==sha)
      errors.push(label+' provenance commit does not match the source under review');
  }
  const actual=[];
  if(qemu?.result==='pass'&&qemu?.independentReference==='QEMU RISC-V user-mode'&&
    qemu?.compare?.stdout===qemu?.compare?.jsBuffer &&
    qemu?.compare?.stdout==='g' &&
    qemu?.compare?.jsRegisterX6===103 &&
    /^[a-f0-9]{64}$/.test(qemu?.source?.sha256??'') &&
    /^[a-f0-9]{64}$/.test(qemu?.compiled?.sha256??'')){
    actual.push({id:'rv32i-qemu-gnu',verdict:'pass'});
  }else errors.push('QEMU reference evidence incomplete, malformed or failed');
  if(numpy?.result==='pass'&&numpy?.independentReference==='NumPy'&&
    /^[a-f0-9]{64}$/.test(numpy?.fixtureSha256??'')&&
    Array.isArray(numpy?.cases)){
    for(const entry of numpy.cases){
      if(!entry||typeof entry.id!=='string'||entry.verdict!=='pass'||entry.maxAbsError!==0){
        errors.push('Invalid NumPy reference case or nonzero exact-integer error');
      }
      actual.push({id:entry?.id,verdict:entry?.verdict});
    }
  }else errors.push('NumPy reference evidence missing or failed');
  const counts=new Map();
  for(const item of actual)counts.set(item.id,(counts.get(item.id)||0)+1);
  for(const id of required){
    if(!counts.has(id))errors.push('Missing mandatory reference case '+id);
    else if(counts.get(id)!==1)errors.push('Duplicate mandatory reference case '+id);
  }
  for(const id of counts.keys())if(!required.includes(id))errors.push('Unrecognized extra reference case '+id);
  return {ok:errors.length===0,errors,passed:required.filter(id=>counts.get(id)===1).length,required:required.length};
}
