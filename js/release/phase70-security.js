// Phase 70: narrow local research web server file surface.
// Route authorization happens before realpath resolution, which also blocks symlink escapes.
import path from 'node:path';
import {realpath,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
export const ROOT=path.dirname(fileURLToPath(new URL('../../serve.mjs',import.meta.url)));
export const FORMAT='invention-lab/phase70-server-allowlist/1';
const allowed=new Set(['index.html','LICENSE','README.md','tests/browser-3d.html']);
const dirs=new Set(['js','css','docs','benchmarks']);
const err=(status,message)=>Object.assign(Error(message),{status});
export function normalizeRequestPath(urlString){
 if(typeof urlString!=='string'||urlString.length>2048)throw err(400,'Invalid request target');
 let parsed;try{parsed=new URL(urlString,'http://localhost')}catch{throw err(400,'Malformed URL')}
 let pathname;
 try{pathname=decodeURIComponent(parsed.pathname)}catch{throw err(400,'Bad URI encoding')}
 if(pathname==='/')pathname='/index.html';
 if(!pathname.startsWith('/')||pathname.includes('\\')||pathname.includes('%')||pathname.includes('\0'))throw err(403,'Forbidden path');
 const segments=pathname.slice(1).split('/');
 if(segments.some(s=>!s||s==='.'||s==='..'||s.startsWith('.')))throw err(403,'Hidden or traversal segment forbidden');
 const relative=segments.join('/');
 if(!allowed.has(relative)&&!(dirs.has(segments[0])&&segments.length>=2))throw err(403,'Resource is outside the public application surface');
 if(!/\.(html|js|mjs|css|json|svg|png|ico|md|txt)$/i.test(relative))throw err(403,'Resource type not served');
 return relative;
}
export async function resolveServablePath(urlString,root=ROOT){
 const relative=normalizeRequestPath(urlString);
 const candidate=path.resolve(root,relative);
 const realRoot=await realpath(root),realCandidate=await realpath(candidate);
 if(!realCandidate.startsWith(realRoot+path.sep))throw err(403,'Symbolic link escapes application directory');
 const details=await stat(realCandidate);
 if(!details.isFile())throw err(404,'Not a regular file');
 return {path:realCandidate,relative};
}
export const securityHeaders=Object.freeze({
 'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
 'Cross-Origin-Resource-Policy':'same-origin','X-Frame-Options':'DENY',
 'Cache-Control':'no-store',
 // Regular application pages prohibit inline scripts. Inline CSS is retained
 // for the existing UI styles; independent CSP and penetration audits remain open.
 'Content-Security-Policy':"default-src 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
});

// The legacy browser smoke fixture contains a single inline ESM module.
// Admit only that exact module's SHA-256, never unsafe-inline for the whole app.
export function securityHeadersFor(relative, data){
 if(relative!=='tests/browser-3d.html')return securityHeaders;
 if(!Buffer.isBuffer(data))throw Error('Browser fixture must be read as original bytes');
 const html=data.toString('utf8');
 const tags=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)];
 if(tags.length!==1||!/^<script\s+type="module"\s*>/i.test(tags[0][0]))
  throw Error('Unexpected inline script structure in legacy browser smoke fixture');
 const digest=createHash('sha256').update(tags[0][1],'utf8').digest('base64');
 const policy=securityHeaders['Content-Security-Policy'].replace(
  "script-src 'self';","script-src 'self' 'sha256-"+digest+"';");
 return {...securityHeaders,'Content-Security-Policy':policy};
}

export function sourceSecurityScreen(source){
 if(typeof source!=='string'||source.length>100000)throw Error('Invalid server source');
 const required=['resolveServablePath','securityHeaders',"'GET'","'HEAD'"];
 const missing=required.filter(s=>!source.includes(s));
 return {format:'invention-lab/phase70-server-security-screen/1',missing,
  sourceOnlyPolicyComplete:missing.length===0,
  independentPenetrationTest:'NOT_PERFORMED',publicHostDeploymentQualified:false,
  physicalValidation:'none',realWorldBuildSuccessPercent:null};
}
