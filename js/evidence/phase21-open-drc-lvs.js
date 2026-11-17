// Real layout GDS + KLayout partial BEOL/OFFGRID DRC and GDS-vs-CDL LVS.
// No production foundry deck, qualification, measurements, yield or guarantees.
export const FORMAT='invention-lab/phase21-actual-open-klayout-drc-lvs/1';
export const IMAGE_DIGEST='openroad/orfs@sha256:7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71';
export const DRC_BLOB='e1a1bbb4721bd02bac42c2cb92ec2d24b25db8b6';
export const LVS_BLOB='12eb8bf51a404b7a7cc149b00e93c302d39f7108';
export const DECK_COMMIT='2272e787c';
const ROOT='benchmarks/evidence/phase21/';
const RES=ROOT+'orfs/results/sky130hd/alu8/base/';
const REP=ROOT+'orfs/reports/sky130hd/alu8/base/';
const LOG=ROOT+'orfs/logs/sky130hd/alu8/base/';
export const FILES=Object.freeze({
 rtl:'benchmarks/phase13/rtl/alu8.v',
 config:'benchmarks/phase18/config.mk',
 sdc:'benchmarks/phase14/alu8-tt.sdc',
 runner:'scripts/phase21-run.sh',
 checker:'scripts/phase21-capture.mjs',
 replay:'scripts/phase21-strict.mjs',
 gate:'js/evidence/phase21-open-drc-lvs.js',
 drcDeck:ROOT+'decks/sky130hd.lydrc',
 lvsDeck:ROOT+'decks/sky130hd.lylvs',
 gds:RES+'6_final.gds',
 cdl:RES+'6_final.cdl',
 verilog:RES+'6_final.v',
 def:RES+'6_final.def',
 lvsDb:RES+'6_lvs.lvsdb',
 drcDb:REP+'6_drc.lyrdb',
 drcCount:REP+'6_drc_count.rpt',
 lvsLog:LOG+'6_lvs.log',
 drcLog:LOG+'6_drc.log',
 flowLog:ROOT+'tool-logs/layout-drc-lvs.log',
 imageDigestFile:ROOT+'image-digest.txt'
});
const hash=(s,n)=>typeof s==='string'&&new RegExp('^[0-9a-f]{'+n+'}$').test(s);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function parseDrcReport(xml,countFile,log){
 if(typeof xml!=='string'||xml.length<120||
    !/^<\?xml\b/i.test(xml.trimStart())||!/<report-database[\s>]/.test(xml))
   throw Error('Not an actual complete KLayout report-database XML');
 if(typeof log!=='string'||log.length<100||
    !/klayout|KLayout|DRC runset|SKY130|drc/i.test(log)||
    /^\s*(?:Error:|Fatal:)/im.test(log))throw Error('External DRC tool did not run cleanly');
 if(typeof countFile!=='string'||!/^\s*\d+\s*$/.test(countFile))
   throw Error('KLayout marker count file absent/invalid');
 const markers=Number(countFile.trim());
 // ORFS make emits grep -c '<value>' by physical line; do not substitute
 // imaginary 0 or use the number of rule categories as the marker count.
 const independently=xml.split(/\r?\n/).filter(x=>x.includes('<value>')).length;
 if(!Number.isSafeInteger(markers)||independently!==markers)
   throw Error('KLayout DRC marker count does not replay from original XML');
 return {enabledRules:['BEOL','OFFGRID'],excludedRules:['FEOL'],reportedMarkerLines:markers,
  cleanOpenSubset:markers===0};
}
export function parseLvsLog(log,reportDb){
 if(typeof log!=='string'||log.length<250||typeof reportDb!=='string'||reportDb.length<80)
   throw Error('KLayout LVS evidence missing');
 if(/LVS not supported on this platform/i.test(reportDb)||/LVS not supported on this platform/i.test(log))
   throw Error('No actual layout-vs-schematic executed');
 const match=log.includes('INFO : Congratulations! Netlists match.');
 const mismatch=log.includes("ERROR : Netlists don't match");
 if(match===mismatch)throw Error('No unique real KLayout LVS comparison verdict');
 if(/(?:^|\n)\s*(?:Fatal:|Exception:)/.test(log))
   throw Error('External LVS tool fatal error');
 return {compared:true,netlistsMatch:match,netlistsMismatch:mismatch};
}
export function evaluatePhase21(record,actual){
 const errors=[];
 if(record?.format!==FORMAT||record?.method!=='klayout-gds-open-beol-offgrid-drc-and-cdl-lvs'||
    record?.sourceCommit!==actual?.sourceCommit||!hash(record?.sourceCommit,40)||
    record?.imageDigest!==IMAGE_DIGEST||record?.imageDigest!==actual?.imageDigest||
    record?.drcDeckGitBlob!==DRC_BLOB||record?.lvsDeckGitBlob!==LVS_BLOB||
    record?.ruleDeckCommit!==DECK_COMMIT||
    record?.physicalValidation!=='none'||record?.physicalVerdict!=='unknown'||
    record?.realWorldBuildSuccessPercent!==null||
    record?.fullFoundryDrc!==false||record?.foundryQualifiedLvs!==false||
    record?.measuredSilicon!==false||record?.foundrySignoff!==false)
  errors.push('Missing exact provenance or fabricated foundry/silicon qualification');
 if(!record?.sha256||!actual?.sha256||
    Object.keys(FILES).some(k=>!hash(record.sha256?.[k],64)||record.sha256[k]!==actual.sha256?.[k]))
  errors.push('Original GDS, netlist, decks, scripts or reports cannot be replayed');
 if(!eq(record?.drc,actual?.drc)||record?.drc?.cleanOpenSubset!==true||
    record?.drc?.reportedMarkerLines!==0||
    !eq(record?.drc?.enabledRules,['BEOL','OFFGRID'])||
    !eq(record?.drc?.excludedRules,['FEOL']))
  errors.push('Experimental open partial DRC reported markers or was altered');
 if(!eq(record?.lvs,actual?.lvs)||record?.lvs?.compared!==true||
    record?.lvs?.netlistsMatch!==true||record?.lvs?.netlistsMismatch!==false)
  errors.push('Actual GDS-vs-CDL LVS mismatch/inconclusive');
 if(!record?.fileSizes||!actual?.fileSizes||
    ['gds','cdl','verilog','def','lvsDb','drcDb','drcDeck','lvsDeck'].some(k=>
     !Number.isInteger(record.fileSizes?.[k])||record.fileSizes[k]<80||
     record.fileSizes[k]!==actual.fileSizes?.[k]))
  errors.push('Empty/incomplete original geometry, netlist or rule-deck file');
 return {ok:errors.length===0,errors,
   verdict:errors.length?'fail':'experimental-sky130-open-drc-subset-and-lvs-model-only',
   physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
