// Real headless Chromium/WebGL check using Chrome DevTools Protocol.
// Waits for an actual browser result; no virtual-time budget and no bypass
// of the canonical page's assertions or physical qualification controls.
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const PORT=8089;
const ROOT=new URL('../serve.mjs',import.meta.url);
const TEST_URL='http://127.0.0.1:'+PORT+'/tests/browser-3d.html';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function executable(){
 for(const name of ['google-chrome','chromium','chromium-browser','google-chrome-stable']){
  try{return execFileSync('which',[name],{encoding:'utf8'}).trim();}
  catch{/* next executable */}
 }
 throw Error('No Chromium/Chrome binary: real browser smoke cannot be skipped');
}
async function awaitServer(){
 for(let i=0;i<100;i++){
  try{const r=await fetch(TEST_URL,{signal:AbortSignal.timeout(900)});
   if(r.ok)return;
  }catch{/* server starting */}
  await pause(120);
 }
 throw Error('Local application server unavailable for real browser smoke');
}
async function awaitChromeEndpoint(getLog){
 for(let i=0;i<250;i++){
  const match=/DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/[^\s]+)/.exec(getLog());
  if(match)return Number(match[2]);
  await pause(80);
 }
 throw Error('Chromium DevTools endpoint unavailable: '+getLog().slice(-1600));
}
function cdpConnect(url){
 return new Promise((resolve,reject)=>{
  const socket=new WebSocket(url);
  const pending=new Map();let counter=0,closed=false;
  let openTimer=setTimeout(()=>reject(Error('DevTools WebSocket connection timeout')),10000);
  const events=[];
  socket.addEventListener('open',()=>{
   clearTimeout(openTimer);
   resolve({
    async command(method,params={}){
     if(closed)throw Error('DevTools disconnected');
     const id=++counter;
     return await new Promise((yes,no)=>{
      const timer=setTimeout(()=>{pending.delete(id);no(Error('DevTools '+method+' timed out'));},10000);
      pending.set(id,{yes,no,timer});
      socket.send(JSON.stringify({id,method,params}));
     });
    },
    events,close(){closed=true;socket.close();}
   });
  });
  socket.addEventListener('message',event=>{
   let packet;try{packet=JSON.parse(event.data);}catch{return;}
   if(packet.id){
    const req=pending.get(packet.id);if(!req)return;
    pending.delete(packet.id);clearTimeout(req.timer);
    if(packet.error)req.no(Error('DevTools: '+packet.error.message));
    else req.yes(packet.result);
   }else if(packet.method==='Runtime.exceptionThrown'){
    const exception=packet.params?.exceptionDetails;
    events.push('JS_EXCEPTION '+(exception?.text||'')+' '+
     (exception?.exception?.description||''));
   }else if(packet.method==='Log.entryAdded'&&packet.params?.entry?.level==='error'){
    events.push('BROWSER_LOG '+packet.params.entry.text);
   }else if(packet.method==='Runtime.consoleAPICalled'&&packet.params?.type==='error'){
    events.push('CONSOLE_ERROR '+packet.params.args?.map(a=>a.value??a.description).join(' '));
   }
   if(events.length>40)events.shift();
  });
  socket.addEventListener('close',()=>{closed=true;
   for(const req of pending.values()){clearTimeout(req.timer);req.no(Error('DevTools closed'));}
   pending.clear();
  });
  socket.addEventListener('error',event=>{
   if(!closed)events.push('DevTools transport error: '+String(event.message||event.type));
  });
 });
}
async function runChrome(chrome){
 const dir=await mkdtemp(join(tmpdir(),'invention-lab-cdp-'));
 let child,ws;
 try{
  const flags=['--headless=new','--no-sandbox','--disable-dev-shm-usage',
   '--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader',
   '--hide-scrollbars','--window-size=1360,960','--remote-debugging-port=0',
   '--no-first-run','--no-default-browser-check','--user-data-dir='+dir,'about:blank'];
  child=spawn(chrome,flags,{stdio:['ignore','ignore','pipe']});
  let stderr='';
  child.stderr.on('data',b=>{stderr=(stderr+b.toString()).slice(-10000);});
  const port=await awaitChromeEndpoint(()=>stderr);
  const targets=await fetch('http://127.0.0.1:'+port+'/json/list',
   {signal:AbortSignal.timeout(5000)}).then(r=>r.json());
  const target=targets.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  if(!target)throw Error('Chromium missing page debugging target');
  ws=await cdpConnect(target.webSocketDebuggerUrl);
  await ws.command('Page.enable');
  await ws.command('Runtime.enable');
  await ws.command('Log.enable');
  const nav=await ws.command('Page.navigate',{url:TEST_URL});
  if(nav.errorText)throw Error('Page navigation failed: '+nav.errorText);
  const deadline=Date.now()+60000;
  while(Date.now()<deadline){
   const state=await ws.command('Runtime.evaluate',{
    expression:"(()=>{const el=document.querySelector('[data-smoke-result]');return el?{status:el.dataset.smokeResult,text:el.textContent}:null})()",
    returnByValue:true,awaitPromise:false
   });
   const value=state?.result?.value;
   if(value?.status==='pass')return value.text;
   if(value?.status==='fail')throw Error('Browser smoke failed: '+value.text+
    '\n'+ws.events.slice(-10).join('\n'));
   await pause(120);
  }
  throw Error('Browser smoke did not complete within 60 real seconds. '+
   ws.events.slice(-20).join('\n')+'\nChrome: '+stderr.slice(-1300));
 }finally{
  ws?.close();
  if(child){
   child.kill('SIGTERM');
   if(child.exitCode===null&&child.signalCode===null)
    await Promise.race([once(child,'exit').catch(()=>{}),pause(1500)]);
   if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');
  }
  await rm(dir,{recursive:true,force:true}).catch(()=>{});
 }
}
const server=spawn(process.execPath,[ROOT.pathname,String(PORT)],
 {stdio:['ignore','ignore','pipe']});
let serverErrors='';server.stderr.on('data',b=>{serverErrors=(serverErrors+b.toString()).slice(-2000);});
try{
 await awaitServer();
 if(typeof WebSocket!=='function')throw Error('Node WebSocket required for real DevTools browser automation');
 const result=await runChrome(executable());
 process.stdout.write('WebGL browser smoke: '+result+'\n');
}catch(e){
 process.stderr.write('Browser smoke FAILED: '+(e.stack||e.message)+
  '\nServer: '+serverErrors+'\n');
 process.exitCode=1;
}finally{
 server.kill('SIGTERM');
 if(server.exitCode===null&&server.signalCode===null)
  await Promise.race([once(server,'exit').catch(()=>{}),pause(1000)]);
}
