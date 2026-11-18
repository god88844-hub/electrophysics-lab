import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadSourceManifest,verifyPinnedGitBlob} from '../js/evidence/phase73-pdk-provenance.js';
test('Two PDK source commits with eight pinned original Git blobs and no silicon calibration',async()=>{
 const m=await loadSourceManifest();
 assert.deepEqual(m.sources.map(x=>x.pdk),['SKY130','GF180MCU']);
 assert.equal(m.sources.reduce((n,s)=>n+s.entries.length,0),8);
 for(const source of m.sources){
  assert.match(source.commit,/^[a-f0-9]{40}$/);
  for(const e of source.entries){assert.match(e.gitBlobSha1,/^[a-f0-9]{40}$/);}
 }
 assert.equal(m.calibrationStatus,'NOT_VALIDATED');
 assert.equal(m.chipMeasurementsAvailable,false);
});
test('Original git object SHA and file length must match byte-for-byte',()=>{
 const data=Buffer.from('test upstream model bytes\n');
 const blob=createHash('sha1').update(Buffer.from('blob '+data.length+'\0')).update(data).digest('hex');
 const e={bytes:data.length,gitBlobSha1:blob};
 const r=verifyPinnedGitBlob(data,e);
 assert.equal(r.gitBlobSha1,blob);
 assert.match(r.sha256,/^[0-9a-f]{64}$/);
 assert.equal(r.siliconCalibrationVerified,false);
 assert.throws(()=>verifyPinnedGitBlob(Buffer.from('different'),e));
 assert.throws(()=>verifyPinnedGitBlob(Buffer.from('TEST upstream model bytes\n'),e));
});
