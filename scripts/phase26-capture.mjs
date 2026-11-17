// Genuine public measured resistor archive + prospective ALU failure gates.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {DATASETS,README,assemblePhase23,parseMdm} from '../js/measure/sky130-mdm.js';
import {verifyPlan,analyzeVariation,replayVariation} from '../js/measure/phase26-reliability.js';
const ROOT='benchmarks/evidence/phase26/',SOURCE='benchmarks/evidence/phase23/';
const sha=b=>createHash('sha256').update(b).digest('hex');
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const policyRaw=await readFile('benchmarks/phase26/acceptance.json');
const policy=JSON.parse(policyRaw);verifyPlan(policy);
const originals={[README.path]:await readFile(SOURCE+'raw/README.rst')};
for(const d of DATASETS)originals[d.path]=await readFile(SOURCE+'raw/'+d.id+'.mdm');
const phase23=assemblePhase23(JSON.parse(await readFile('benchmarks/phase23/acceptance.json','utf8')),originals);
const parsed=DATASETS.map(d=>parseMdm(originals[d.path].toString('utf8'),{expectedSamples:d.samples}));
const analysis=analyzeVariation(parsed[0],parsed[1],policy);
const phase25=JSON.parse(await readFile('benchmarks/evidence/phase25/phase25-summary.json','utf8'));
const phase24=JSON.parse(await readFile('benchmarks/evidence/phase24/phase24-summary.json','utf8'));
if(!phase25.accepted||phase25.independentALUMeasurements!==0||
   phase24.actualPhysicalObservations!==0||phase24.reportedStatus!=='awaiting-real-hardware'||
   Math.abs(analysis.observedVariation.modelHoldoutResidualRMSEA-phase25.heldoutCurrentRMSEA)>1e-14||
   Math.abs(analysis.observedVariation.modelHoldoutResidualRMSEA-phase23.comparison.heldOutRMSEA)>1e-14)
 throw Error('Prerequisite original resistor data or unmeasured ALU evidence inconsistent');
const inputs={
 originalREADME:sha(originals[README.path]),
 originalFirstMDM:sha(originals[DATASETS[0].path]),
 originalSecondMDM:sha(originals[DATASETS[1].path]),
 phase25Report:sha(await readFile('benchmarks/evidence/phase25/phase25.json')),
 phase25Summary:sha(await readFile('benchmarks/evidence/phase25/phase25-summary.json')),
 phase24EmptyCapture:sha(await readFile('benchmarks/evidence/phase24/capture-template.json')),
 phase24Summary:sha(await readFile('benchmarks/evidence/phase24/phase24-summary.json'))
};
const record={
 format:'invention-lab/phase26-source-verified-original-reliability-audit/1',
 sourceCommit:commit,policySha256:sha(policyRaw),inputs,analysis,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
};
const replay=replayVariation(record.analysis,analysis,{
 commit,recordCommit:record.sourceCommit,
 policySha256:sha(policyRaw),recordPolicySha256:record.policySha256
});
if(!replay.ok)throw Error('Phase26 source record rejected: '+replay.errors.join('; '));
await writeFile(ROOT+'phase26.json',JSON.stringify(record,null,2)+'\n');
console.log('PH26 genuine two-resistor specimen conductance difference: '+analysis.observedVariation.differenceS+' S');
console.log('PH26 12/12 ALU failure categories UNMEASURED; NO statistical process sigma / NO silicon yield');
