// browser-smoke.mjs — real headless Chromium/WebGL check, no npm dependencies.
// Run on a Linux runner with Chromium/Chrome installed:
//   node scripts/browser-smoke.mjs
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';

const PORT=8089;
const ROOT=new URL('../serve.mjs',import.meta.url);
const URL_TO_TEST=`http://127.0.0.1:${PORT}/tests/browser-3d.html`;
function executable(){
  for(const name of ['google-chrome','chromium','chromium-browser','google-chrome-stable']){
    try {return execFileSync('which',[name],{encoding:'utf8'}).trim();}catch{ /* next */ }
  }
  throw Error('No Chromium/Google Chrome executable present: browser smoke cannot be silently skipped');
}
async function awaitReady(){
  for(let i=0;i<80;i++){
    try {const r=await fetch(URL_TO_TEST,{signal:AbortSignal.timeout(750)});if(r.ok)return;}
    catch{ /* server still booting */ }
    await new Promise(r=>setTimeout(r,120));
  }
  throw Error('Invention Lab static server did not start');
}
function runChrome(path){
  return new Promise((resolve,reject)=>{
    const flags=[
      '--headless=new','--no-sandbox','--disable-dev-shm-usage',
      '--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader',
      '--hide-scrollbars','--window-size=1360,960','--virtual-time-budget=8000',
      '--dump-dom',URL_TO_TEST,
    ];
    const child=spawn(path,flags,{stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    const limit=8*1024*1024;
    child.stdout.on('data',b=>{stdout+=b.toString();if(stdout.length>limit)child.kill('SIGKILL');});
    child.stderr.on('data',b=>{stderr+=b.toString().slice(0,4000);});
    const watchdog=setTimeout(()=>{child.kill('SIGKILL');},45000);
    child.on('error',err=>{clearTimeout(watchdog);reject(err);});
    child.on('close',code=>{
      clearTimeout(watchdog);
      if(code!==0)return reject(Error(`Headless Chromium exit=${code}\n${stderr.slice(-2500)}`));
      const status=stdout.match(/<pre[^>]*data-smoke-result="([^"]+)"[^>]*>([\s\S]*?)<\/pre>/);
      if(!status)return reject(Error('Browser did not emit a smoke-test status. DOM tail: '+stdout.slice(-1500)));
      if(status[1]!=='pass')return reject(Error('Browser smoke result: '+status[1]+'\n'+status[2].slice(0,2000)+'\n'+stderr.slice(-1500)));
      resolve(status[2].replace(/&gt;/g,'>').replace(/&lt;/g,'<'));
    });
  });
}
const server=spawn(process.execPath,[ROOT.pathname,String(PORT)],{stdio:['ignore','pipe','pipe']});
try{
  await awaitReady();
  const browser=executable();
  const result=await runChrome(browser);
  process.stdout.write(`WebGL browser smoke: ${result}\n`);
}catch(e){
  process.stderr.write(`Browser smoke FAILED: ${e.stack||e.message}\n`);
  process.exitCode=1;
}finally{
  server.kill('SIGTERM');
  if(server.exitCode===null && server.signalCode===null)
    await Promise.race([once(server,'exit').catch(()=>{}),new Promise(r=>setTimeout(r,1000))]);
}
