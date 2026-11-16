// Phase 8 RV32M software evidence policy. This checks completeness and
// consistency of independently run engines, NOT silicon authenticity.
export const RV32M_MANIFEST_FORMAT='invention-lab/phase8-rv32m-acceptance/1';
export const RV32M_REPORT_FORMAT='invention-lab/phase8-rv32m-reference/1';
// Fixed internal expectation prevents silently shrinking the manifest or
// changing a signed/overflow result to make a failing run green.
export const REQUIRED_M_CASES=Object.freeze([
  ['mul-low','MUL',77],
  ['mulh-signed','MULH',0],
  ['mulhsu-mixed','MULHSU',2147483648],
  ['mulhu-unsigned','MULHU',2147483647],
  ['div-signed-overflow','DIV',2147483648],
  ['divu-unsigned','DIVU',0],
  ['rem-signed-overflow','REM',0],
  ['remu-unsigned','REMU',2147483648],
  ['div-zero','DIV',4294967295],
  ['divu-zero','DIVU',4294967295],
  ['rem-zero','REM',2147483648],
  ['remu-zero','REMU',2147483648],
]);
const sha256=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const validInt=v=>Number.isInteger(v)&&v>=0&&v<=0xffffffff;
export function evaluatePhase8(manifest,report,{sourceSha256=null,commitSha=null}={}){
  const errors=[];
  const required=manifest?.requiredCases;
  if(manifest?.format!==RV32M_MANIFEST_FORMAT||
    manifest?.source!=='benchmarks/phase8/rv32m-operations.S'||
    !Array.isArray(required)||required.length!==REQUIRED_M_CASES.length)
    errors.push('Missing or changed frozen Phase 8 manifest');
  else {
    for(let i=0;i<REQUIRED_M_CASES.length;i++){
      const [id,op,expected]=REQUIRED_M_CASES[i];
      const got=required[i];
      if(!got||got.id!==id||got.operation!==op||got.expectedUnsigned!==expected)
        errors.push('Frozen manifest differs at '+id);
    }
  }
  if(!report||report.format!==RV32M_REPORT_FORMAT||report.outcome!=='pass'||
    report.isa!=='rv32im'||report.model!=='single-hart-architectural')
    errors.push('Missing or failed real RV32IM reference report');
  if(report?.physicalValidation!=='none'||report?.realWorldBuildSuccessPercent!==null)
    errors.push('Forbidden physical-validation/manufacturing-yield claim');
  if(commitSha && report?.commitSha!==commitSha) errors.push('Stale or wrong commit in reference evidence');
  if(!sha256(report?.source?.sha256)||report?.source?.path!==manifest?.source)
    errors.push('Missing or malformed assembly source fingerprint');
  if(sourceSha256 && report?.source?.sha256!==sourceSha256)
    errors.push('Assembly source SHA-256 drift');
  if(!sha256(report?.machineCode?.sha256)||!Number.isInteger(report?.machineCode?.bytes)||
    report?.machineCode?.bytes<=0||report.machineCode.bytes>65536||
    report?.machineCode?.base!==0x10000)
    errors.push('Missing or malformed actual machine-code provenance');
  if(!sha256(report?.qemu?.actualOutputSha256)||!sha256(report?.js?.actualOutputSha256)||
    report?.qemu?.actualOutputSha256!==report?.js?.actualOutputSha256||
    report?.qemu?.bytes!==48||report?.js?.bytes!==48||
    report?.js?.stopReason!=='ecall'||!Number.isInteger(report?.js?.retired)||
    report.js.retired<1)
    errors.push('No complete 48-byte QEMU/JS differential trace');
  if(!report?.versions?.assembler||!report?.versions?.linker||!report?.versions?.qemu)
    errors.push('Missing independent tool versions');
  const rows=report?.cases;
  if(!Array.isArray(rows)||rows.length!==REQUIRED_M_CASES.length)
    errors.push('Missing or extra RV32M cases');
  const seen=new Set(),present=new Set();
  if(Array.isArray(rows))for(const item of rows){
    if(!item||typeof item.id!=='string'){errors.push('Malformed reference case');continue;}
    if(seen.has(item.id))errors.push('Duplicate reference case '+item.id);
    seen.add(item.id);
    const expected=REQUIRED_M_CASES.find(([id])=>id===item.id);
    if(!expected){errors.push('Unrecognized reference case '+item.id);continue;}
    present.add(item.id);
    if(item.operation!==expected[1]||item.expectedUnsigned!==expected[2]||
      !validInt(item.actualQemu)||!validInt(item.actualJs)||
      item.actualQemu!==expected[2]||item.actualJs!==expected[2]||item.verdict!=='pass')
      errors.push('Failed/malformed independent comparison '+item.id);
  }
  for(const [id] of REQUIRED_M_CASES)if(!present.has(id))errors.push('Missing mandatory RV32M case '+id);
  return {
    ok:errors.length===0,errors,
    passed:REQUIRED_M_CASES.filter(([id])=>present.has(id)&&!errors.some(e=>e.includes(id))).length,
    required:REQUIRED_M_CASES.length,
    physicalValidation:'none',realWorldBuildSuccessPercent:null,
  };
}
