// Source-locked open PDK FEOL DRC audit + real post-GDS SAT proof.
// A COMPLETE analysis may still have rule violations; never fabricate closure.
import {classifyYosysProof} from './phase17-gate-equivalence.js';
export {classifyYosysProof};
export const FORMAT='invention-lab/phase22-feol-sky130-postgds-formal/1';
export const DRC_BLOB='e1a1bbb4721bd02bac42c2cb92ec2d24b25db8b6';
export const LIB_BLOB='1f086a1ae9064d48d36ff66a605491a18f6b5ed6';
export const IMAGE_DIGEST='openroad/orfs@sha256:7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71';
export const ROOT='benchmarks/evidence/phase22/';
export const FILES=Object.freeze({
 sourceRtl:'benchmarks/phase13/rtl/alu8.v',
 positiveSpec:'benchmarks/phase13/rtl/alu8_spec.v',
 negativeSpec:'benchmarks/phase13/rtl/alu8_bad_spec.v',
 baselineReport:'benchmarks/evidence/phase21/phase21.json',
 baselineGds:'benchmarks/evidence/phase21/orfs/results/sky130hd/alu8/base/6_final.gds',
 baselineNetlist:'benchmarks/evidence/phase21/orfs/results/sky130hd/alu8/base/6_final.v',
 finalGds:ROOT+'orfs/results/sky130hd/alu8/base/6_final.gds',
 finalNetlist:ROOT+'orfs/results/sky130hd/alu8/base/6_final.v',
 finalDef:ROOT+'orfs/results/sky130hd/alu8/base/6_final.def',
 finalCdl:ROOT+'orfs/results/sky130hd/alu8/base/6_final.cdl',
 originalDeck:ROOT+'source-sky130hd.lydrc',
 feolDeck:ROOT+'feol-enabled-sky130hd.lydrc',
 feolReport:ROOT+'feol-enabled-drc.lyrdb',
 feolLog:ROOT+'tool-logs/feol-drc.log',
 positiveLog:ROOT+'tool-logs/positive.log',
 mutantLog:ROOT+'tool-logs/mutant.log',
 positiveScript:ROOT+'tool-logs/positive.ys',
 mutantScript:ROOT+'tool-logs/mutant.ys',
 liberty:ROOT+'lib/sky130_fd_sc_hd__tt_025C_1v80.lib',
 digest:ROOT+'image-digest.txt',
 runner:'scripts/phase22-run.sh',
 deckPatcher:'scripts/phase22-enable-feol.mjs',
 proofScript:'scripts/phase22-proof.ys',
 capture:'scripts/phase22-capture.mjs',
 strict:'scripts/phase22-strict.mjs'
});
const sha=(s,n)=>typeof s==='string'&&new RegExp('^[0-9a-f]{'+n+'}$').test(s);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function exactFeolPatch(original,modified){
 const from='FEOL    = false # front-end-of-line checks';
 const to='FEOL    = true # front-end-of-line checks';
 if(typeof original!=='string'||typeof modified!=='string'||
    original.split(from).length!==2||original.includes(to)||
    !original.includes('BEOL    = true # back-end-of-line checks')||
    !original.includes('OFFGRID = true # manufacturing grid/angle checks')||
    modified!==original.replace(from,to))
  throw Error('Not an exact single-toggle expansion of the source-pinned experimental deck');
 return true;
}
export function inspectDrc(xml,log){
 if(typeof xml!=='string'||xml.length<200||!/^<\?xml\s/.test(xml.trimStart())||
    !xml.includes('<report-database>')||!xml.includes('<top-cell>alu8</top-cell>')||
    !xml.includes('<items>')||!xml.includes('</items>')||!xml.includes('</report-database>'))
  throw Error('Authentic complete KLayout DRC XML missing');
 if(typeof log!=='string'||log.length<120||
   !/KLayout|klayout|DRC|SKY130/i.test(log)||/^\s*(?:Fatal:|Error:)/mi.test(log))
  throw Error('KLayout FEOL evaluation not executed cleanly');
 // This category comes only from active FEOL block in the pinned original deck.
 if(!xml.includes('<name>nwell.1</name>'))
  throw Error('FEOL nwell width check was not enabled');
 const section=xml.split('<items>')[1].split('</items>')[0];
 const markers=(section.match(/<item(?:\s|>)/g)||[]).length;
 const values=(section.match(/<value>/g)||[]).length;
 if(markers!==values||!Number.isSafeInteger(markers))
  throw Error('KLayout marker structure ambiguous or inconsistent');
 return {executed:true,feolEnabled:true,beolEnabled:true,offgridEnabled:true,
  feolCategoryObserved:true,markerCount:markers,
  openDeckDrcClean:markers===0};
}
export function evaluatePhase22(record,actual){
 const errors=[];
 if(record?.format!==FORMAT||record?.method!=='single-toggle-feol-open-deck-and-final-gds-netlist-sat'||
    record?.imageDigest!==IMAGE_DIGEST||record?.imageDigest!==actual?.imageDigest||
    record?.originalDeckBlob!==DRC_BLOB||record?.libertyBlob!==LIB_BLOB||
    record?.commitSha!==actual?.commitSha||!sha(record?.commitSha,40)||
    record?.physicalValidation!=='none'||record?.physicalVerdict!=='unknown'||
    record?.realWorldBuildSuccessPercent!==null||record?.foundrySignoff!==false||
    record?.measuredSilicon!==false||record?.qualifiedFoundryDrc!==false)
  errors.push('Incorrect provenance or invented silicon qualification');
 if(!record?.hashes||!actual?.hashes||
    Object.keys(FILES).some(k=>!sha(record.hashes?.[k],64)||record.hashes[k]!==actual.hashes?.[k]))
  errors.push('Missing or tampered original GDS, FEOL deck, Liberty, SAT or source data');
 if(!eq(record?.drc,actual?.drc)||record?.drc?.executed!==true||
    record?.drc?.feolEnabled!==true||record?.drc?.beolEnabled!==true||
    record?.drc?.offgridEnabled!==true||record?.drc?.feolCategoryObserved!==true||
    !Number.isSafeInteger(record?.drc?.markerCount)||record.drc.markerCount<0||
    record.drc.openDeckDrcClean!==(record.drc.markerCount===0))
  errors.push('Actual FEOL DRC markers/coverage missing or altered');
 if(record?.positiveVerdict!=='proven'||record?.mutantVerdict!=='rejected-unproven'||
    record.positiveVerdict!==actual?.positiveVerdict||
    record.mutantVerdict!==actual?.mutantVerdict||
    actual?.sameFinalLayoutAsPhase21!==true||
    actual?.sameFinalNetlistAsPhase21!==true)
  errors.push('Post-GDS final gate-level SAT proof or deliberate mutant rejection missing');
 return {ok:errors.length===0,errors,verdict:errors.length?'fail':'real-open-feol-analysis-and-final-gate-boolean-proof-only',
  openDeckDrcClean:errors.length?null:record.drc.markerCount===0,
  drcMarkers:errors.length?null:record.drc.markerCount,
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
