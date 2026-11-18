import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {MANUFACTURER_CAD_INTAKE_FORMAT,validateManufacturerCADRecord,
 verifyManufacturerCADBytes} from '../js/scene/manufacturer-cad-intake.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const bytes=new TextEncoder().encode('untrusted STEP fixture only; no actual CAD geometry');
const record={format:MANUFACTURER_CAD_INTAKE_FORMAT,manufacturer:'FixtureCorp',
 manufacturerPartNumber:'PART-123',revision:'A',sourceUrl:'https://manufacturer.example.com/part.step',
 licenseId:'LicenseRef-1',mediaType:'model/step',
 sha256:createHash('sha256').update(bytes).digest('hex'),byteLength:bytes.length,
 boundingBoxMm:{widthMm:12,heightMm:8,depthMm:6}};
test('bounded versioned claim is not certified manufacturer geometry',async()=>{
 const r=validateManufacturerCADRecord(record);
 assert.equal(r.boundingBoxMm.widthMm,12);
 const result=await verifyManufacturerCADBytes(record,bytes);
 assert.equal(result.integrity,'sha256-matched');
 assert.equal(result.sourceAuthenticity,'unverified');
 assert.equal(result.geometryParsed,false);
 assert.equal(result.manufacturingQualified,false);
 assert.equal(result.physicalValidation,'none');
});
test('wrong digest or length is rejected',async()=>{
 await assert.rejects(verifyManufacturerCADBytes({...record,sha256:'0'.repeat(64)},bytes),/SHA256 mismatch/);
 await assert.rejects(verifyManufacturerCADBytes(record,bytes.subarray(1)),/length mismatch/);
});
test('malicious private or credential-bearing URLs are rejected',()=>{
 for(const sourceUrl of ['http://manufacturer.example.com/part.step','https://localhost/test.step',
  'https://127.0.0.1/cad','https://[::1]/cad','https://user:pass@manufacturer.example.com/cad',
  'https://manufacturer.example.com/cad#fragment','file:///etc/passwd','not a url'])
  assert.throws(()=>validateManufacturerCADRecord({...record,sourceUrl}));
});
test('bad dimensions, payload inflation, unknown fields and prototype tricks are rejected',()=>{
 for(const boundingBoxMm of [{...record.boundingBoxMm,widthMm:Infinity},
  {...record.boundingBoxMm,depthMm:0},{...record.boundingBoxMm,extra:1}])
  assert.throws(()=>validateManufacturerCADRecord({...record,boundingBoxMm}));
 for(const patch of [{byteLength:25_000_001},{sha256:'invalid'},
  {mediaType:'text/html'},{manufacturerPartNumber:'../../escape'},{unsafe:true}])
  assert.throws(()=>validateManufacturerCADRecord({...record,...patch}));
 assert.throws(()=>validateManufacturerCADRecord(JSON.parse('{"__proto__":{},"format":"x"}')));
});
