// Independently replayed SAT proof that *actual mapped gates*, not just RTL,
// preserve the frozen ALU specification. Never upgrades physical qualification.
export const FORMAT='invention-lab/phase17-mapped-gate-sat-evidence/1';
export const MANIFEST='invention-lab/phase17-mapped-gate-acceptance/1';
export const LIB_BLOB='5773657fe730d984ac06726d0addfdad80395b9b';
export const FILES=Object.freeze({
 sourceRtl:'benchmarks/phase13/rtl/alu8.v',
 independentReference:'benchmarks/phase13/rtl/alu8_spec.v',
 negativeControlReference:'benchmarks/phase13/rtl/alu8_bad_spec.v',
 mappedNetlist:'benchmarks/evidence/phase14/alu8-sky130-mapped.v',
 cellLiberty:'benchmarks/evidence/phase14/source/sky130_fd_sc_hd__tt_025C_1v80.lib',
 runner:'scripts/phase17-run.sh',
 proofScript:'scripts/phase17-proof.ys'
});
const hex=(x,n)=>typeof x==='string'&&new RegExp('^[0-9a-f]{'+n+'}$').test(x);
const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function classifyYosysProof(log){
 if(typeof log!=='string'||log.length<150)throw Error('Missing complete Yosys proof transcript');
 if(!/Executing EQUIV_MAKE pass/.test(log)||!/Executing EQUIV_SIMPLE pass/.test(log)||
    !/Executing EQUIV_STATUS pass/.test(log))
   throw Error('Actual SAT equivalence passes not shown');
 if(/ERROR:.*(?:unknown|command not found|blackbox|module not found|parser)/i.test(log))
   throw Error('Yosys failed to load functional cell proof correctly');
 if(/Equivalence successfully proven!/.test(log)&&!/ERROR:/.test(log))
   return 'proven';
 if(/unproven \$equiv cells|unproven\.|failed to prove|not proven/i.test(log) &&
    /ERROR:.*unproven \$equiv cells/i.test(log))
   return 'rejected-unproven';
 throw Error('Unrecognized, incomplete or inconclusive equivalence transcript');
}
export function evaluatePhase17(manifest,record,actual={}){
 const errors=[];
 if(manifest?.format!==MANIFEST||manifest.design!=='alu8'||
   Object.entries(FILES).some(([k,v])=>k!=='runner'&&k!=='proofScript'&&manifest?.[k]!==v)||
   manifest?.libertyGitBlobSha1!==LIB_BLOB||
   manifest?.modelCorner!=='tt_025C_1v80'||manifest.inputBits!==18||
   manifest.outputBits!==10||manifest.positiveMustProve!==true||
   manifest.mutantMustFail!==true||
   manifest.proofEngine!=='Yosys equiv_simple SAT using Liberty functional cell models'||
   manifest.physicalValidation!=='none'||manifest.physicalVerdict!=='unknown'||
   manifest.realWorldBuildSuccessPercent!==null)
   errors.push('Frozen gate-level acceptance policy changed');
 if(record?.format!==FORMAT||record.design!=='alu8'||
   record.libertyGitBlobSha1!==LIB_BLOB||
   record.method!=='sat-gate-netlist-vs-independent-spec-with-liberty-function-import'||
   record?.positiveVerdict!=='proven'||record?.mutantVerdict!=='rejected-unproven'||
   record?.physicalValidation!=='none'||record?.physicalVerdict!=='unknown'||
   record?.physicalQualified!==false||record?.postLayout!==false||
   record?.siliconMeasurements!==false||record?.realWorldBuildSuccessPercent!==null)
   errors.push('Missing SAT evidence or invented physical qualification');
 if(!hex(record?.commitSha,40)||record.commitSha!==actual.commitSha)
   errors.push('Git source commit did not match executed workflow');
 if(typeof record?.yosysVersion!=='string'||!/Yosys/i.test(record.yosysVersion)||
   record.yosysVersion!==actual.yosysVersion)
   errors.push('External Yosys identity missing or altered');
 if(!record?.hashes||!actual?.hashes||
   Object.keys({...FILES,positiveLog:'',mutantLog:''}).some(k=>
     !hex(record.hashes?.[k],64)||record.hashes[k]!==actual.hashes?.[k]))
   errors.push('Actual files/scripts/log checksums do not replay');
 if(record?.positiveVerdict!==actual?.positiveVerdict||
   record?.mutantVerdict!==actual?.mutantVerdict)
   errors.push('Proof classification does not match original tool output');
 if(actual?.mappedCellTypesPresent!==true||
   actual?.libertyGitBlobSha1!==LIB_BLOB)
   errors.push('Mapped SKY130 gates or authentic cell-model library missing');
 return {ok:errors.length===0,errors,
   verdict:errors.length?'fail':'gate-level-boolean-equivalence-only',
   physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
