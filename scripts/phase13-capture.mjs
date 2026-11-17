// Captures only artifacts produced by the real Phase 13 shell workflow.
// Does NOT manufacture DRC, LVS, setup/hold, PVT or silicon measurements.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=x=>path.join(root,x),sha=x=>createHash('sha256').update(x).digest('hex');
const dir='benchmarks/evidence/phase13/';
const paths={
 rtl:'benchmarks/phase13/rtl/alu8.v',
 spec:'benchmarks/phase13/rtl/alu8_spec.v',
 testbench:'benchmarks/phase13/rtl/alu8_tb.v',
 badSpec:'benchmarks/phase13/rtl/alu8_bad_spec.v',
 lib:dir+'source/sky130_fd_sc_hd__tt_025C_1v80.lib',
 exhaustive:dir+'tool-logs/exhaustive.log',
 formal:dir+'tool-logs/formal.log',
 negative:dir+'tool-logs/negative-control.log',
 mapping:dir+'tool-logs/mapping.log',
 netlist:dir+'alu8-sky130-mapped.v',
};
const files={};
for(const [key,name] of Object.entries(paths))files[key]=await readFile(file(name));
const manifest=JSON.parse(await readFile(file('benchmarks/phase13/acceptance.json'),'utf8'));
assert.equal(files.lib.length,12800135,'Wrong Sky130 real Liberty source size');
const gitBlob=execFileSync('git',['hash-object',file(paths.lib)],{encoding:'utf8'}).trim();
assert.equal(gitBlob,manifest.library.gitBlobSha1,'Wrong upstream Git blob');
assert.match(files.exhaustive.toString('utf8'),/^PHASE13 EXHAUSTIVE RTL PASS 262144\/262144$/m);
assert.match(files.negative.toString('utf8'),/unproven|unmatched|not proven/i);
assert.match(files.formal.toString('utf8'),/equiv_status|Equivalence|unproven/i);
const netlist=files.netlist.toString('utf8');
const expressions=[...netlist.matchAll(/\b(sky130_fd_sc_hd__[A-Za-z0-9_]+)\s+\\?[A-Za-z0-9_$]+\s*\(/g)];
const cells=expressions.map(x=>x[1]);
assert.ok(cells.length>=manifest.minMappedCells&&cells.length<=manifest.maxMappedCells,
  'No authentic mapped SKY130 standard cell instantiations found in gate-level Verilog');
const types=[...new Set(cells)].sort();
const yosys=execFileSync('yosys',['-V'],{encoding:'utf8'}).trim();
const iverilog=execFileSync('iverilog',['-V'],{encoding:'utf8'}).split('\n')[0].trim();
assert.ok(yosys.includes('Yosys')&&iverilog.length>=3,'Missing external EDA provenance');
const physical=[
  'sta','pvt-corners','place-route-parasitics','drc','lvs',
  'prototype-measurements','measured-calibration'
];
const stages=[
  {id:'rtl-exhaustive',status:'pass',basis:'exhaustive-simulation',
    evidenceSha256:sha(files.exhaustive),physicalEvidence:false},
  {id:'rtl-formal-equivalence',status:'pass',basis:'formal-rtl-equivalence',
    evidenceSha256:sha(files.formal),physicalEvidence:false},
  {id:'sky130-stdcell-mapping',status:'pass',basis:'open-standard-cell-liberty',
    evidenceSha256:sha(files.netlist),physicalEvidence:false},
  ...physical.map(id=>({id,status:'unknown',basis:'not-run',
    evidenceSha256:null,physicalEvidence:false})),
];
const report={
 format:'invention-lab/phase13-sky130-evidence/1',
 verdict:'pass',commitSha:process.env.GITHUB_SHA||null,
 libertyGitBlobSha1:gitBlob,
 libertySizeBytes:files.lib.length,libertyCorner:'tt_025C_1v80',
 libertySha256:sha(files.lib),rtlSha256:sha(files.rtl),
 specSha256:sha(files.spec),testbenchSha256:sha(files.testbench),
 badSpecSha256:sha(files.badSpec),
 exhaustiveLogSha256:sha(files.exhaustive),
 formalLogSha256:sha(files.formal),
 negativeControlLogSha256:sha(files.negative),
 mappingLogSha256:sha(files.mapping),netlistSha256:sha(files.netlist),
 versions:{yosys,iverilog,os:'ubuntu-24.04'},
 exhaustive:{expectedVectors:262144,testedVectors:262144,failed:0},
 formal:{checked:true,assertion:'equiv_status -assert',negativeControlRejected:true},
 mapping:{technique:'Yosys ABC Liberty technology mapping',
  library:'sky130_fd_sc_hd__tt_025C_1v80.lib',corner:'tt_025C_1v80',
  mappedCells:cells.length,cellTypes:types},
 stages,physicalValidation:'none',physicalVerdict:'unknown',physicalQualified:false,
 realWorldBuildSuccessPercent:null,
 note:'Real RTL and real typical-corner cell library were used. No STA/PVT/route/extraction/DRC/LVS/fabrication or real device measurements were executed.',
};
await mkdir(file(dir),{recursive:true});
await writeFile(file(dir+'phase13.json'),JSON.stringify(report,null,2)+'\n');
process.stdout.write('PHASE13 REAL SKY130 CAPTURE: '+cells.length+' mapped cells; '+types.length+
 ' distinct types. Physical qualification UNKNOWN; manufacturing success UNESTIMATED.\n');
