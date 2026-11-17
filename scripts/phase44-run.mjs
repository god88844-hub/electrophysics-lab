import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyWireAssumptions,evaluateWireLoop} from '../js/evidence/phase44-wire-loop.js';
const [aRaw,bRaw]=await Promise.all([
 readFile('benchmarks/phase44/copper-harness-assumptions.json'),
 readFile('benchmarks/phase41/reference-hardware-candidate.json')]);
const a=JSON.parse(aRaw),b=JSON.parse(bRaw);verifyWireAssumptions(a,b);
const cases=[a.illustrativeExample,
 {...a.illustrativeExample,currentA:2},
 {...a.illustrativeExample,wireTemperatureC:80}];
const report={
 format:'invention-lab/phase44-conditional-wire-source-replay/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 assumptionsSha256:createHash('sha256').update(aRaw).digest('hex'),
 sourceHardwareSha256:createHash('sha256').update(bRaw).digest('hex'),
 scenarios:cases.map(x=>evaluateWireLoop(a,b,x)),
 measuredWireHarnesses:0,measuredConnectorContactPairs:0,
 verifiedWireTemperatureRiseC:null,qualifiedCurrentCarryingCapacityA:null,
 admissiblePhysicalValidation:false,physicalValidation:'none',
 physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
};
await mkdir('benchmarks/evidence/phase44',{recursive:true});
await writeFile('benchmarks/evidence/phase44/phase44.json',JSON.stringify(report,null,2)+'\n');
console.log('PH44 REPORT PASS: manufacturer copper IACS hypothetical electrical losses; NO measured harness or ampacity qualification');