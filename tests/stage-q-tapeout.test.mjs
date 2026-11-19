import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planTapeout,inspectFoundryArtifact,createUnqualifiedFoundryBundle,
 generatePostSiliconTestVectors,exportCandidateBundleText}
 from '../js/hardware/phase95-tapeout-package.js';
const enc=x=>new TextEncoder().encode(x);
const gds=Uint8Array.from([
 0,6,0,2,0,7, // HEADER version 7
 0,4,1,0, // BGNLIB (record placeholder)
 0,4,5,0, // BGNSTR
 0,4,4,0 // ENDLIB
]);
test('real binary GDS record validation rejects fake JSON/text GDS',async()=>{
 const original=await inspectFoundryArtifact({kind:'gds',filename:'test.gds',bytes:gds});
 assert.equal(original.bytes,18);
 assert.match(original.sha256,/^[a-f0-9]{64}$/);
 assert.equal(original.signoffVerified,false);
 await assert.rejects(inspectFoundryArtifact({kind:'gds',filename:'fake.gds',
  bytes:enc('{"gds":true}')}),/HEADER/);
});
test('foundry bundle lists original LEF DEF SPICE vectors, cannot approve tapeout',async()=>{
 const plan=planTapeout({designId:'alu4',foundry:'SKY130',
  level1Passport:{status:'VIRTUALLY_QUALIFIED',designId:'alu4',
   physicallyQualified:false,productionReleaseAuthorized:false}});
 assert.equal(plan.virtualPassportClaim,'SELF_DECLARED_PENDING_VERIFICATION');
 assert.equal(plan.foundrySubmissionAuthorized,false);
 const entries=[
  {kind:'gds',filename:'chip.gds',bytes:gds},
  {kind:'lef',filename:'chip.lef',bytes:enc('MACRO chip\nEND chip')},
  {kind:'def',filename:'chip.def',bytes:enc('DESIGN chip ;\nEND DESIGN')},
  {kind:'spice',filename:'chip.spice',bytes:enc('.subckt chip a b\n.ends')},
  {kind:'testvectors',filename:'vectors.json',
   bytes:enc(JSON.stringify(generatePostSiliconTestVectors()))}
 ];
 const manifest=await createUnqualifiedFoundryBundle({plan,artifacts:entries});
 assert.equal(manifest.files.length,5);
 assert.deepEqual(manifest.missing,[]);
 assert.equal(manifest.foundrySubmissionAuthorized,false);
 assert.equal(manifest.virtualPassportAuthenticated,false);
 assert.match(exportCandidateBundleText(manifest),/NO_GO/);
});
test('source without valid virtual passport or original artifacts stays NO-GO',async()=>{
 const plan=planTapeout({designId:'tiny-mvl',foundry:'TinyTapeout-SKY130'});
 assert.equal(plan.virtualPassportClaim,'INSUFFICIENT_MODEL_DATA');
 await assert.rejects(createUnqualifiedFoundryBundle({plan,artifacts:[]}),/original artifacts/);
 assert.equal(generatePostSiliconTestVectors({radix:4}).vectors.length,16);
});
