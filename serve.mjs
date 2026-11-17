// Invention Lab local research server, access restricted to public app assets.
// Default binding is loopback only; do not deploy as a production internet server.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {resolveServablePath,securityHeaders} from './js/release/phase70-security.js';
const PORT=Number(process.argv[2] ?? 8080);
if(!Number.isInteger(PORT)||PORT<0||PORT>65535)throw Error('Invalid local server port');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
 '.json':'application/json; charset=utf-8','.svg':'image/svg+xml',
 '.png':'image/png','.ico':'image/x-icon','.md':'text/markdown; charset=utf-8',
 '.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 const headers={...securityHeaders};
 if(!['GET','HEAD'].includes(req.method)){
  res.writeHead(405,{...headers,'Allow':'GET, HEAD'});return res.end('Method Not Allowed');
 }
 try{
  const file=await resolveServablePath(req.url);
  const data=await readFile(file.path);
  const type=MIME[path.extname(file.path).toLowerCase()]||'application/octet-stream';
  res.writeHead(200,{...headers,'Content-Type':type,'Content-Length':data.length});
  res.end(req.method==='HEAD'?undefined:data);
 }catch(error){
  const status=[400,403,404].includes(error?.status)?error.status:404;
  res.writeHead(status,{...headers,'Content-Type':'text/plain'});
  res.end(status===403?'403 Forbidden':status===400?'400 Bad Request':'404 Not Found');
 }
});
server.listen(PORT,'127.0.0.1',()=>console.log('Invention Lab local research server http://127.0.0.1:'+server.address().port+'/'));
