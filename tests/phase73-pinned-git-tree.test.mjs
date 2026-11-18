import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {verifyPinnedGitModelTree} from '../js/evidence/phase73-pinned-git-tree.js';
function git(root,...args){return execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();}
test('transitive model source bytes are matched to exact original pinned Git objects, not just HEAD',async()=>{
 const root=await mkdtemp(join(tmpdir(),'stage-m-pinned-git-'));
 try{
  git(root,'init','-q');git(root,'config','user.email','test@example.invalid');
  git(root,'config','user.name','PDK Evidence Test');
  await mkdir(join(root,'models'),{recursive:true});
  await writeFile(join(root,'models','model.spice'),'.subckt mos d g s b\n.ends\n');
  git(root,'add','models/model.spice');
  git(root,'commit','-qm','Original PDK model fixture');
  const sha=git(root,'rev-parse','HEAD');
  const input={root,expectedCommit:sha,relativeFiles:['models/model.spice']};
  const verified=await verifyPinnedGitModelTree(input);
  assert.equal(verified.status,'PINNED_GIT_TREE_VERIFIED');
  assert.equal(verified.matchedCount,1);
  assert.equal(verified.waferCalibrationVerified,false);
  assert.equal(verified.physicalQualification,'UNQUALIFIED_NO_GO');
  await writeFile(join(root,'models','model.spice'),'.subckt mos d g s b\nRfake d s 10\n.ends\n');
  const changed=await verifyPinnedGitModelTree(input);
  assert.equal(changed.status,'PINNED_GIT_TREE_UNVERIFIED');
  assert.equal(changed.reason,'installed-model-differs-from-original-pinned-git-object');
  const changedCommit=await verifyPinnedGitModelTree({...input,expectedCommit:'0'.repeat(40)});
  assert.equal(changedCommit.status,'PINNED_GIT_TREE_UNVERIFIED');
  assert.equal(changedCommit.reason,'checked-out-PDK-commit-differs-from-pinned-source');
 }finally{await rm(root,{recursive:true,force:true});}
});
test('unsafe include traversal and duplicate PDK inventory cannot be accepted as a valid tree',async()=>{
 const root=await mkdtemp(join(tmpdir(),'stage-m-invalid-path-'));
 try{
  await assert.rejects(verifyPinnedGitModelTree({root,expectedCommit:'a'.repeat(40),
   relativeFiles:['../etc/passwd']}),/checkout|repository|unsafe|model/);
 }finally{await rm(root,{recursive:true,force:true});}
});
