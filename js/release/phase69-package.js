// Phase 69: reproducible *tracked-file-only* GNU/USTAR local web-source bundle.
// A checksum establishes bytes, not trusted publisher identity or physical approval.
import {readFile,writeFile,lstat,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
export const FORMAT='invention-lab/phase69-reproducible-web-package/1';
const sha=data=>createHash('sha256').update(data).digest('hex');
const rootItems=['index.html','css','js','serve.mjs','LICENSE','README.md','package.json'];
const required=['index.html','serve.mjs','LICENSE','README.md','package.json','js/main.js','js/release/phase70-security.js','css/style.css'];
const trackedFiles=()=>execFileSync('git',['ls-files','-z','--',...rootItems]).toString('utf8').split('\0').filter(Boolean).sort();
function check(name){
 if(typeof name!=='string'||name.length>240||!/^[A-Za-z0-9._/-]+$/.test(name)||
  name.startsWith('/')||name.split('/').some(s=>!s||s==='.'||s==='..'||s.startsWith('.')))
  throw Error('Unsafe source archive path '+String(name));
}
function octal(buffer,label){
 const raw=buffer.toString('ascii').split('\0')[0].trim();
 if(!/^[0-7]+$/.test(raw))throw Error('Invalid tar '+label);
 const v=parseInt(raw,8);
 if(!Number.isSafeInteger(v))throw Error('Oversized tar '+label);
 return v;
}
function tarMembers(archive,expected){
 const result=new Map();let offset=0;
 while(offset<archive.length){
  if(offset+512>archive.length)throw Error('Truncated tar header');
  const header=archive.subarray(offset,offset+512);
  if(header.every(v=>v===0)){
   if(!archive.subarray(offset).every(v=>v===0))throw Error('Nonzero data after tar end marker');
   break;
  }
  if(header.subarray(257,262).toString('ascii')!=='ustar')throw Error('Unsupported non-USTAR archive');
  const copy=Buffer.from(header);copy.fill(32,148,156);
  const checksum=copy.reduce((a,b)=>a+b,0);
  if(checksum!==octal(header.subarray(148,156),'header checksum'))throw Error('Tar header checksum mismatch');
  const field=(i,n)=>header.subarray(i,i+n).toString('utf8').split('\0')[0];
  const prefix=field(345,155),short=field(0,100),name=prefix?prefix+'/'+short:short;
  check(name);
  const type=header[156];
  if(type!==0&&type!==48)throw Error('Non-regular tar entry rejected: '+name);
  if(!expected.has(name)||result.has(name))throw Error('Unexpected or duplicate tar member '+name);
  const size=octal(header.subarray(124,136),'member size');
  const target=expected.get(name);
  if(size!==target.bytes)throw Error('Tar member length differs from manifest '+name);
  const start=offset+512,end=start+size;
  if(end>archive.length)throw Error('Truncated tar member '+name);
  const payload=archive.subarray(start,end);
  if(sha(payload)!==target.sha256)throw Error('Tar payload hash mismatch '+name);
  result.set(name,payload);
  offset=start+Math.ceil(size/512)*512;
 }
 if(result.size!==expected.size)throw Error('Tar inventory differs from tracked source manifest');
 return result;
}
export async function makePackage(output='benchmarks/evidence/phase69'){
 const files=trackedFiles();
 if(files.length<20||required.some(p=>!files.includes(p)))throw Error('Missing required tracked web application files');
 // Reject unpublished changes to tracked app files; emitted source SHA values must
 // describe a clean Git checkout, not a silently modified local working tree.
 execFileSync('git',['diff','--quiet','--',...rootItems]);
 execFileSync('git',['diff','--cached','--quiet','--',...rootItems]);
 const inventory=await Promise.all(files.map(async source=>{
  check(source);
  const s=await lstat(source);
  if(!s.isFile()||s.isSymbolicLink())throw Error('Non-regular/symlink source rejected '+source);
  const bytes=await readFile(source);
  return {path:source,bytes:bytes.length,sha256:sha(bytes)};
 }));
 await mkdir(output,{recursive:true});
 const archive=path.join(output,'invention-lab-web.tar');
 // Enumerate exactly tracked regular files, not their containing directories:
 // an untracked private file under js/ must never be silently bundled.
 execFileSync('tar',['--format=ustar','--sort=name','--mtime=@0',
  '--owner=0','--group=0','--numeric-owner','--no-recursion',
  '--null','--verbatim-files-from','-cf',archive,'-T','-'],
  {input:Buffer.from(files.join('\0')+'\0','utf8'),timeout:20000});
 const data=await readFile(archive);
 const expected=new Map(inventory.map(row=>[row.path,row]));
 tarMembers(data,expected); // Verify the actual package before publishing the digest.
 const manifest={format:FORMAT,archiveSHA256:sha(data),files:inventory,
  tooling:'GNU USTAR, tracked regular files only; normalized owner, group and modification time',
  includesNodeModuleMetadata:true,untrackedFilesBundled:false,
  physicalValidation:'none',productionQualified:false,externalInstallerSignoff:false};
 await writeFile(path.join(output,'phase69.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
export async function verifyPackage(output='benchmarks/evidence/phase69'){
 const archive=await readFile(path.join(output,'invention-lab-web.tar'));
 const m=JSON.parse(await readFile(path.join(output,'phase69.json'),'utf8'));
 if(m.format!==FORMAT||!(/^[0-9a-f]{64}$/).test(m.archiveSHA256)||
  sha(archive)!==m.archiveSHA256)throw Error('Archive digest mismatch');
 if(!Array.isArray(m.files)||m.files.length<20||m.files.length>10000||
  m.includesNodeModuleMetadata!==true||m.untrackedFilesBundled!==false)
  throw Error('Incomplete/unsupported package manifest');
 const expected=new Map();
 for(const f of m.files){
  if(!f||typeof f!=='object')throw Error('Invalid file inventory');
  check(f.path);
  if(expected.has(f.path)||!Number.isSafeInteger(f.bytes)||f.bytes<0||
   !(/^[0-9a-f]{64}$/).test(f.sha256))throw Error('Duplicate or corrupt manifest entry');
  expected.set(f.path,f);
 }
 if(required.some(f=>!expected.has(f)))throw Error('Missing application runtime/source metadata');
 const files=tarMembers(archive,expected);
 const dir=await mkdtemp(path.join(tmpdir(),'invention-lab-pkg-'));
 try{
  // Extract only the already-validated regular-file payloads; tar never gets
  // to create symlinks/hardlinks, parent escapes, or unexpected members.
  for(const [name,payload] of files){
   const target=path.join(dir,...name.split('/'));
   await mkdir(path.dirname(target),{recursive:true});
   await writeFile(target,payload,{flag:'wx',mode:0o644});
   if(sha(await readFile(target))!==expected.get(name).sha256)
    throw Error('Extracted file digest mismatch '+name);
  }
  const app=await readFile(path.join(dir,'index.html'),'utf8');
  const main=await readFile(path.join(dir,'js/main.js'),'utf8');
  const pkg=JSON.parse(await readFile(path.join(dir,'package.json'),'utf8'));
  if(!app.includes('js/main.js')||!app.includes('css/style.css')||
   !main.includes('import')||pkg.type!=='module')throw Error('Clean ESM application entrypoints incomplete');
  // Syntax/import smoke runs in the extracted directory, not the developer repo.
  execFileSync(process.execPath,['--input-type=module','-e',
   "await import('./js/release/phase70-security.js')"],{cwd:dir,timeout:10000});
  return {archiveSHA256:m.archiveSHA256,verifiedFiles:files.size,
   appEntrypointsPresent:true,extractedNodeESMImportVerified:true,
   sourcePackageReproducibleWithinGNUtar:true,
   installedExecutableSmoke:'EXTRACTED_NODE_MODULE_IMPORT_ONLY',
   physicalValidation:'none',productionQualified:false};
 }finally{await rm(dir,{recursive:true,force:true});}
}
