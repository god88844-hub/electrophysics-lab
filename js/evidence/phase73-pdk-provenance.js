// Phase 73: verify exact immutable Git blobs for authentic public PDK sources.
// This checks byte identity only. It does not claim calibrated simulator models.
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const file=fileURLToPath(new URL('../../benchmarks/phase73/pdk-sources.json',import.meta.url));
export const SOURCE_FORMAT='invention-lab/phase73-pinned-pdk-sources/1';
const sha=x=>typeof x==='string'&&/^[0-9a-f]{40}$/.test(x);
export async function loadSourceManifest(){
 const manifest=JSON.parse(await readFile(file,'utf8'));
 if(manifest?.format!==SOURCE_FORMAT||!Array.isArray(manifest.sources)||
   manifest.sources.length!==2||manifest.waferDistributionValidity!=='UNKNOWN'||
   manifest.calibrationStatus!=='NOT_VALIDATED'||manifest.chipMeasurementsAvailable!==false)
  throw Error('Unknown or asserted-calibrated PDK source manifest');
 for(const source of manifest.sources){
  if(!/^google\/[a-zA-Z0-9_-]+$/.test(source.repository)||!sha(source.commit)||
     !Array.isArray(source.entries)||source.entries.length<2)throw Error('Invalid pinned PDK source');
  for(const x of source.entries){
   if(typeof x.path!=='string'||!/^((models|cells)\/[a-zA-Z0-9_./-]+)$/.test(x.path)||
      x.path.includes('..')||!sha(x.gitBlobSha1)||
      !Number.isSafeInteger(x.bytes)||x.bytes<50||x.bytes>2000000)
    throw Error('Invalid pinned PDK source file');
  }
 }
 return manifest;
}
export function verifyPinnedGitBlob(bytes,entry){
 if(!(bytes instanceof Uint8Array)||!entry||
    !Number.isSafeInteger(entry.bytes)||entry.bytes!==bytes.length||
    !sha(entry.gitBlobSha1))throw Error('PDK model byte count/hash metadata missing');
 const prefix=Buffer.from('blob '+bytes.length+'\0','utf8');
 const hash=createHash('sha1').update(prefix).update(bytes).digest('hex');
 if(hash!==entry.gitBlobSha1)throw Error('Original upstream Git blob SHA-1 mismatch');
 return {gitBlobSha1:hash,sha256:createHash('sha256').update(bytes).digest('hex'),
  bytes:bytes.length,authenticatedBy:'pinned-upstream-git-object-identity',
  siliconCalibrationVerified:false};
}
export async function fetchPinnedPdkSources({timeoutMs=45000}={}){
 const manifest=await loadSourceManifest();
 const reports=[];
 for(const source of manifest.sources)for(const entry of source.entries){
  const url='https://raw.githubusercontent.com/'+source.repository+'/'+source.commit+'/'+entry.path;
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(timeoutMs)});
  if(!response.ok)throw Error('PDK fetch failed '+response.status+': '+entry.path);
  const advertised=Number(response.headers.get('content-length'));
  if(Number.isFinite(advertised)&&advertised>entry.bytes)throw Error('Upstream PDK size changed');
  const raw=new Uint8Array(await response.arrayBuffer());
  if(raw.length!==entry.bytes)throw Error('Fetched PDK bytes changed: '+entry.path);
  reports.push({pdk:source.pdk,repository:source.repository,commit:source.commit,
   path:entry.path,...verifyPinnedGitBlob(raw,entry)});
 }
 return {format:SOURCE_FORMAT,checked:reports.length,files:reports,
  foundryCalibrationVerified:false,processVariationDistributionVerified:false,
  physicalQualification:'UNKNOWN / NO-GO'};
}
