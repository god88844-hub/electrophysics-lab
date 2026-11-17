// Phase 71: end-to-end automated acceptance paths, not human UAT.
// Source-frozen public API is checked from committed Git blob identifiers.
import {execFileSync} from 'node:child_process';
import {Diagram} from '../core/diagram.js';
import {getExample,getLab} from '../core/registry.js';
import {guideState} from '../ui/phase67-guided-workflow.js';
import '../labs/logic/components.js';import '../labs/logic/lab.js';
import '../labs/chip/components.js';import '../labs/chip/lab.js';
import '../labs/cpu/lab.js';import '../labs/ai/lab.js';
import '../labs/quantum/components.js';import '../labs/quantum/lab.js';
import '../examples/index.js';import '../plugins/optics/index.js';
export const FORMAT='invention-lab/phase71-source-acceptance/1';
export const WORKFLOWS=Object.freeze([
 {lab:'logic',example:'logic-half-adder'},
 {lab:'chip',example:'chip-divider'},
 {lab:'cpu',example:'cpu-fibonacci'},
 {lab:'ai',example:'ai-matmul'},
 {lab:'quantum',example:'quantum-bell'},
 {lab:'optics',example:'optics-lens-demo'}
]);
const err=x=>{throw Error(x)};
export function verifyApiFreeze(policy){
 if(!policy||policy.format!==FORMAT||!policy.frozenGitBlobs||
  policy.independentlyAcceptedByUsers!==false||
  policy.physicalValidation!=='none')err('API policy missing or improperly promotes acceptance');
 const required=['js/core/registry.js','js/core/diagram.js','js/core/validation.js','docs/PLUGIN_API.md'];
 if(JSON.stringify(Object.keys(policy.frozenGitBlobs).sort())!==JSON.stringify([...required].sort()))err('API source coverage changed');
 for(const path of required){
  const expected=policy.frozenGitBlobs[path];
  if(typeof expected!=='string'||!/^[0-9a-f]{40}$/.test(expected))err('Invalid Git blob id');
  const line=execFileSync('git',['ls-tree','HEAD','--',path],{encoding:'utf8'}).trim();
  const actual=line.split(/\s+/)[2];
  if(actual!==expected)err('Public API source changed without approval: '+path);
 }
 return true;
}
function cloneJson(x){
 const raw=JSON.stringify(x);
 if(typeof raw!=='string'||raw.length>2_000_000)err('Example exceeds portability limit');
 return JSON.parse(raw);
}
export function evaluateExample({lab,example}){
 if(typeof lab!=='string'||typeof example!=='string')err('Invalid requested acceptance case');
 const ex=getExample(example),engine=getLab(lab);
 if(!ex||!engine||ex.lab!==lab||typeof ex.getJSON!=='function')err('Unknown or mismatched built-in example');
 const raw=ex.getJSON(),restored=Diagram.fromJSON(cloneJson(raw));
 if(JSON.stringify(restored.toJSON())!==JSON.stringify(raw))err('Example import/export changed canonical design');
 const issues=restored.issues();if(issues.length)err('Example has dangling ports: '+issues.join('; '));
 const sim=engine.run(restored,{});
 if(!sim||sim.ok===false||!Array.isArray(restored.blocks)||!Array.isArray(restored.wires))err('Example solver returned failure');
 const checks=engine.validate(restored);
 if(!Array.isArray(checks)||!checks.length||checks.some(c=>c.verdict==='fail'))err('Reference example has failing scientific checks');
 const report=engine.report(restored);
 if(!report||!Array.isArray(report.checks))err('Example report missing expected checks');
 const guide=guideState(lab,'beginner');
 return {lab,example,
  importedAndExportedWithoutDataLoss:true,simulationReturned:true,
  sourceCheckCount:checks.length,failedChecks:0,assumptionCount:Array.isArray(report.assumptions)?report.assumptions.length:null,
  guideAvailable:guide.total>=3,
  realHardwareMeasuredInThisAcceptance:false,
  independentHumanAcceptance:'NOT_CONDUCTED',
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
export function runAcceptance(policy){
 verifyApiFreeze(policy);
 const cases=WORKFLOWS.map(evaluateExample);
 return {format:'invention-lab/phase71-developer-acceptance/1',sourceAPIContract:'FROZEN_BY_GIT_BLOB_IDS',
  cases,examplesPassing:cases.length,automatedSourceRegression:true,
  representativeHumanUserAcceptance:'NOT_CONDUCTED',
  independentlyVerifiedWCAG:'NOT_CONDUCTED',physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
