import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import path from 'node:path';
import {normalizeRequestPath,resolveServablePath,securityHeaders,sourceSecurityScreen} from '../js/release/phase70-security.js';
test('Public source app path maps to well-known classes and hides internal paths',()=>{
 for(const pathName of ['/','/index.html','/js/main.js','/css/style.css','/tests/browser-3d.html','/benchmarks/phase57/release-policy.json'])
  assert.ok(normalizeRequestPath(pathName));
 for(const pathName of ['/.git/config','/.github/workflows/ci.yml','/package.json','/scripts/phase69-run.mjs','/serve.mjs',
  '/tests/phase65-project-history.test.mjs','/%252e%252e/.git/config','/js/%2eenv','/js/%252eenv','/js/exploit.exe'])
  assert.throws(()=>normalizeRequestPath(pathName),pathName);
});
test('Symlink escape blocked and real app entrypoint resolves',async()=>{
 const resolved=await resolveServablePath('/index.html');assert.equal(resolved.relative,'index.html');
 const root=await mkdtemp(path.join(tmpdir(),'ilab-hardening-'));
 try{await symlink('/etc/passwd',path.join(root,'leak'));
   await symlink('/etc/passwd',path.join(root,'index.html'));
   await assert.rejects(()=>resolveServablePath('/index.html',root),/Symbolic link/);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('Server source includes allowlist checks and required HTTP security headers',async()=>{
 const source=await readFile(new URL('../serve.mjs',import.meta.url),'utf8');
 const a=sourceSecurityScreen(source);assert.equal(a.sourceOnlyPolicyComplete,true);
 assert.equal(securityHeaders['X-Content-Type-Options'],'nosniff');
 assert.equal(securityHeaders['X-Frame-Options'],'DENY');
 assert.equal(a.independentPenetrationTest,'NOT_PERFORMED');
});
test('Adversarial malformed URLs and shadow paths are rejected',()=>{
 for(const bad of ['/js/../.git/config','/js/%00.js','/js/%255csecret.js','/bad/foo.js','/js/./.secret'])
  assert.throws(()=>normalizeRequestPath(bad));
});
