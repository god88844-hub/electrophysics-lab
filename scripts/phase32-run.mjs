import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyCatalog,sourceMotorConstants,assessPublicSourceCoverage}
 from '../js/evidence/phase32-source-coverage.js';
const root='benchmarks/evidence/phase32/';
const source=await readFile('benchmarks/phase32/public-source-catalog.json');
const data=JSON.parse(source);verifyCatalog(data);
const spec=sourceMotorConstants(data),coverage=assessPublicSourceCoverage(data);
if(coverage.totalExplicitEvidenceRequirements!==23||
   coverage.fullyPhysicallySatisfiedRequirements!==0||
   coverage.publishedExperimentalDatasetsIdentified!==4||
   coverage.publishedDataOriginalMeasurementsIngested!==0||
   coverage.realWorldBuildSuccessPercent!==null||
   spec.manufacturerPartMatchedToCurrentFan!==false)
 throw Error('Public source data was promoted into non-existent fan measurements');
const sha=b=>createHash('sha256').update(b).digest('hex');
const record={
 format:'invention-lab/phase32-public-physical-evidence-inventory-original-source-audit/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceCatalogSha256:sha(source),
 inventorySourceSha256:sha(await readFile('js/evidence/phase32-source-coverage.js')),
 previousPhysicsSourceSha256:sha(await readFile('js/evidence/phase31-first-principles.js')),
 uiSourceSha256:sha(await readFile('js/ui/app.js')),
 exactPinnedResearchSourceCount:data.sources.length,
 requirementsEnumerated:data.requirements.length,
 verifiedIndependentActualFanHardwareRecords:0,
 rawOpenMCTMotorRowsIngested:0,
 sourceStatus:'metadata-discovery-and-manufacturer-approximate-figures-only',
 pololuVendorSpecConsistency:spec,
 targetFanCoverage:coverage,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
};
await mkdir(root,{recursive:true});
await writeFile(root+'phase32.json',JSON.stringify(record,null,2)+'\n');
console.log('PH32 catalog PASS: '+data.sources.length+' researched public sources, '+data.requirements.length+' explicit target evidence prerequisites');
console.log('PH32 source Pololu nominal stall R='+spec.inferredStallResistanceOhm+'Ω, Kt/Ke mismatch='+spec.kRelativeInconsistencyPercent.toFixed(3)+'% (NOT actual model error)');
console.log('PH32 real target fan measurements 0; external public raw OpenMCT rows downloaded 0; physical outcome UNKNOWN');
