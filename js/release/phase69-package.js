// Phase69 deterministic GNU-tar web research application archive.
import {readFile,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {execFileSync,spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';import path from 'node:path';
export const FORMAT='invention-lab/phase69-reproducible-web-package/1';
const sha=b=>createHash('sha256').update(b).digest('hex');
const rootItems=['index.html','css','js','serve.mjs','LICENSE'];
const files=()=>execFileSync('git',['ls-files','-z','--',...rootItems]).toString().split('\0').filter(Boolean).sort();
function check(p){if(!/^[a-zA-Z0-9._/-]+$/.test(p)||p.startsWith('/')||p.split('/').includes('..'))throw Error('Unsafe package path '+p);}
export async function makePackage(output='benchmarks/evidence/phase69'){
 const tracked=files();if(!tracked.includes('index.html')||!tracked.includes('serve.mjs'))throw Error('Missing app entrypoints');
 tracked.forEach(check);await mkdir(output,{recursive:true});
 const archive=path.join(output,'invention-lab-web.tar'),manifestPath=path.join(output,'phase69.json');
 execFileSync('tar',['--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','-cf',archive,...rootItems]);
 const bytes=await readFile(archive),entries=await Promise.all(tracked.map(async p=>({path:p,sha256:sha(await readFile(p))})));
 const manifest={format:FORMAT,archiveSHA256:sha(bytes),files:entries,tooling:'GNU tar normalized uid/gid/mtime and lexicographic paths',physicalValidation:'none',productionQualified:false,externalInstallerSignoff:false};
 await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
export async function verifyPackage(output='benchmarks/evidence/phase69'){
 const archive=path.join(output,'invention-lab-web.tar');
 const m=JSON.parse(await readFile(path.join(output,'phase69.json')));
 if(m.format!==FORMAT||sha(await readFile(archive))!==m.archiveSHA256)throw Error('Archive digest mismatch');
 const listed=execFileSync('tar',['-tf',archive],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 listed.forEach(check);
 const dir=await mkdtemp(path.join(tmpdir(),'invention-lab-pkg-'));
 try{
  execFileSync('tar',['-xf',archive,'-C',dir]);
  for(const record of m.files){
   check(record.path);if(sha(await readFile(path.join(dir,record.path)))!==record.sha256)throw Error('Extracted file digest mismatch '+record.path);
  }
  const app=await readFile(path.join(dir,'index.html'),'utf8'),code=await readFile(path.join(dir,'js/main.js'),'utf8');
  if(!app.includes('js/main.js')||!app.includes('css/style.css')||!code.includes('import'))throw Error('App entrypoints incomplete');
  return {archiveSHA256:m.archiveSHA256,verifiedFiles:m.files.length,appEntrypointsPresent:true,sourcePackageReproducibleWithinGNUtar:true,installedExecutableSmoke:'STATIC_EXTRACT_VERIFIED_ONLY',physicalValidation:'none',productionQualified:false};
 }finally{await rm(dir,{recursive:true,force:true});}
}
