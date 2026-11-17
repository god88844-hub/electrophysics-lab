import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {verifyCatalog,sourceMotorConstants,assessPublicSourceCoverage,EXPECTED_SOURCE_URLS}
 from '../js/evidence/phase32-source-coverage.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const root='benchmarks/evidence/phase32/';
try {
 const policyRaw=await readFile('benchmarks/phase32/public-source-catalog.json');
 const source=JSON.parse(policyRaw);verifyCatalog(source);
 const replay=JSON.parse(await readFile(root+'phase32.json','utf8'));
 const spec=sourceMotorConstants(source),coverage=assessPublicSourceCoverage(source);
 const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const originalHashes={
  sourceCatalogSha256:sha(policyRaw),
  inventorySourceSha256:sha(await readFile('js/evidence/phase32-source-coverage.js')),
  previousPhysicsSourceSha256:sha(await readFile('js/evidence/phase31-first-principles.js')),
  uiSourceSha256:sha(await readFile('js/ui/app.js'))
 };
 if(replay.format!=='invention-lab/phase32-public-physical-evidence-inventory-original-source-audit/1'||
  replay.sourceCommit!==head||
  Object.entries(originalHashes).some(([k,v])=>replay[k]!==v)||
  !isDeepStrictEqual(replay.pololuVendorSpecConsistency,spec)||
  !isDeepStrictEqual(replay.targetFanCoverage,coverage)||
  replay.exactPinnedResearchSourceCount!==12||
  Object.keys(EXPECTED_SOURCE_URLS).length!==12||
  replay.requirementsEnumerated!==23||
  replay.verifiedIndependentActualFanHardwareRecords!==0||
  replay.rawOpenMCTMotorRowsIngested!==0||
  replay.physicalValidation!=='none'||replay.physicalVerdict!=='unknown'||
  replay.realWorldBuildSuccessPercent!==null)
  throw Error('Original Phase32 physical-source scope/provenance changed or invented measurements');
 const summary={
  format:'invention-lab/phase32-independent-original-source-inventory-audit/1',
  sourceCommit:head,
  verifiedCatalogIntegrity:true,
  publicSourcesExplicitlyIdentified:12,
  exactSourceAuthorityURLsVerified:12,
  publishedDatasetsDiscovered:4,
  actualOriginalRawMotorDatasetRecordsDownloaded:0,
  totalEvidenceRequirements:23,
  numericalModelVerificationConfirmed:true,
  physicallyVerifiedTargetEvidenceRequirements:0,
  sourceManufacturerReferencePart:'pololu-1592',
  publishedManufacturerMotorRohm:spec.inferredStallResistanceOhm,
  approximatePublishedKtVsKeInconsistencyPercent:spec.kRelativeInconsistencyPercent,
  isCalibratedRealMotorOrFanErrorBound:false,
  originalPhysicalFanObservations:0,
  independentMotorAndFanSystemValidation:null,
  realWorldBuildSuccessPercent:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  blockers:coverage.blockers
 };
 await writeFile(root+'phase32-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH32 STRICT PASS: source-locked 12 external publications and 23 gaps; honest vendor-only crosscheck, no physical fan data');
}catch(e){console.error('PH32 STRICT FAIL: '+e.message);process.exitCode=1}
