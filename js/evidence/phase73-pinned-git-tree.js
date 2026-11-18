// Original complete model tree attestation: checks all dependency files
// byte-for-byte against a fixed upstream Git commit, not just a working tree
// name or self-declared source hash. A successful result is model integrity,
// NEVER statistical wafer calibration or manufacturing qualification.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {realpath,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const exec=promisify(execFile);
const SHA=/^[0-9a-f]{40}$/;
const inside=(root,target)=>target===root||target.startsWith(root+path.sep);
const sameBytes=(x,y)=>x.length===y.length&&
 createHash('sha256').update(x).digest('hex')===
 createHash('sha256').update(y).digest('hex');
const fail=(reason,details={})=>({status:'PINNED_GIT_TREE_UNVERIFIED',reason,
 ...details,waferCalibrationVerified:false,physicalQualification:'UNQUALIFIED_NO_GO'});
async function git(root,...args){
 return exec('git',['-C',root,...args],{
  maxBuffer:25_000_000,encoding:null,timeout:15000,windowsHide:true});
}
export async function verifyPinnedGitModelTree({
 root,expectedCommit,relativeFiles,maxFiles=5000
}={}){
 if(typeof root!=='string'||!path.isAbsolute(root)||
    !SHA.test(expectedCommit)||!Array.isArray(relativeFiles)||
    relativeFiles.length<1||relativeFiles.length>maxFiles||
    !Number.isInteger(maxFiles)||maxFiles<1||maxFiles>10000)
  throw Error('Explicit pinned model repo and bounded dependency list required');
 let repoRoot;
 try{repoRoot=await realpath(root);}
 catch{return fail('complete-PDK-checkout-missing');}
 let top,head;
 try{
  top=(await git(repoRoot,'rev-parse','--show-toplevel')).stdout.toString().trim();
  head=(await git(repoRoot,'rev-parse','HEAD')).stdout.toString().trim();
 }catch{return fail('git-history-not-available-or-not-checkout');}
 if(await realpath(top)!==repoRoot)
  return fail('model-root-not-exact-git-repository-top');
 if(head!==expectedCommit)
  return fail('checked-out-PDK-commit-differs-from-pinned-source',
   {actualCommit:head,expectedCommit});
 const files=[],seen=new Set();
 for(const relative of relativeFiles){
  if(typeof relative!=='string'||relative.length<1||relative.length>500||
    path.isAbsolute(relative)||relative.includes('\\')||
    relative.split('/').some(x=>x==='..'||x==='.')||
    !/^[A-Za-z0-9_./-]+$/.test(relative)||seen.has(relative))
   throw Error('Duplicate or unsafe PDK model-relative path');
  seen.add(relative);
  const file=path.resolve(repoRoot,relative);
  if(!inside(repoRoot,file))throw Error('PDK file escaped model repository');
  let committed,current,actual;
  try{
   actual=await realpath(file);
   if(!inside(repoRoot,actual))throw Error('Model symlink escaped pinned PDK root');
   current=await readFile(actual);
   if(current.length>20_000_000)throw Error('PDK individual model file too large');
   committed=(await git(repoRoot,'cat-file','blob',expectedCommit+':'+relative)).stdout;
  }catch(e){return fail('missing-or-inaccessible-model-blob',
   {file:relative,detail:e.message.slice(0,180)});}
  if(!sameBytes(current,committed))
   return fail('installed-model-differs-from-original-pinned-git-object',
    {file:relative});
  files.push({path:relative,
   sha256:createHash('sha256').update(current).digest('hex')});
 }
 return {status:'PINNED_GIT_TREE_VERIFIED',repositoryCommit:expectedCommit,
  matchedCount:files.length,files:files.sort((a,b)=>a.path.localeCompare(b.path)),
  waferCalibrationVerified:false,
  modelValidityRangeIndependentlyCertified:false,
  physicalQualification:'UNQUALIFIED_NO_GO'};
}
