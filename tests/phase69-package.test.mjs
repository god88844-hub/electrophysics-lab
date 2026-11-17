import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readFile,writeFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {makePackage,verifyPackage} from '../js/release/phase69-package.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const standard='benchmarks/evidence/phase69-test';
test('GNU USTAR contains exactly tracked regular sources and a runnable ESM module context',async()=>{
 const manifest=await makePackage(standard),r=await verifyPackage(standard);
 assert.equal(r.archiveSHA256,manifest.archiveSHA256);
 assert.ok(r.verifiedFiles>=20);
 assert.ok(manifest.files.some(x=>x.path==='package.json'));
 assert.ok(manifest.files.some(x=>x.path==='README.md'));
 assert.equal(r.extractedNodeESMImportVerified,true);
 assert.equal(r.installedExecutableSmoke,'EXTRACTED_NODE_MODULE_IMPORT_ONLY');
 assert.equal(r.productionQualified,false);
});
test('Reproducible archive digest is stable across identical tracked source',async()=>{
 const a=await makePackage(standard),b=await makePackage(standard);
 assert.equal(a.archiveSHA256,b.archiveSHA256);
});
test('Untracked file planted inside js/ must NEVER enter a research release archive',async()=>{
 const rogue='js/phase69-untracked-private-'+process.pid+'.txt';
 const a=await makePackage(standard);
 try{
  await writeFile(rogue,'FAKE_SECRET_FOR_REGRESSION_TEST_DO_NOT_SHIP');
  const b=await makePackage(standard);
  assert.equal(a.archiveSHA256,b.archiveSHA256);
  assert.equal(b.files.some(f=>f.path===rogue),false);
  const names=execFileSync('tar',['-tf',standard+'/invention-lab-web.tar'],{encoding:'utf8'});
  assert.equal(names.includes(rogue),false);
  assert.equal((await verifyPackage(standard)).verifiedFiles,b.files.length);
 }finally{await rm(rogue,{force:true});}
});
test('Spoofed updated overall SHA cannot conceal an extra archived file',async()=>{
 const output='benchmarks/evidence/phase69-rogue-test';
 const rogue='js/phase69-extra-member-'+process.pid+'.txt';
 await makePackage(output);
 try{
  await writeFile(rogue,'untracked tampered payload');
  execFileSync('tar',['-rf',output+'/invention-lab-web.tar',rogue]);
  const record=JSON.parse(await readFile(output+'/phase69.json','utf8'));
  record.archiveSHA256=sha(await readFile(output+'/invention-lab-web.tar'));
  await writeFile(output+'/phase69.json',JSON.stringify(record,null,2)+'\n');
  await assert.rejects(()=>verifyPackage(output),/Unexpected or duplicate tar member/);
 }finally{await rm(rogue,{force:true});}
});
test('Policy refuses native installer, hardware and production claims',()=>{
 const p=JSON.parse(readFileSync(new URL('../benchmarks/phase69/packaging-policy.json',import.meta.url)));
 assert.equal(p.windowsInstallerAvailable,false);
 assert.equal(p.independentCleanMachineTests,0);
 assert.equal(p.realWorldBuildSuccessPercent,null);
});
