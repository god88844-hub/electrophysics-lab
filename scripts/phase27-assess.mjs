// Future lab file, source checks are hash consistency ONLY, never origin proof.
// Usage: node scripts/phase27-assess.mjs data.json [original-raw-directory]
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {auditCandidate,sessions} from '../js/measure/phase27-blind.js';
if(process.argv.length<3||process.argv.length>4){
 console.error('Usage: node scripts/phase27-assess.mjs capture.json [original-raw-directory]');
 process.exitCode=2;
}else try{
 const packet=JSON.parse(await readFile(process.argv[2],'utf8'));
 const rawFiles={};
 if(process.argv[3])for(const s of sessions()){
  try{rawFiles[s.sessionId]=await readFile(join(process.argv[3],s.sessionId+'.bin'))}
  catch(e){if(e.code!=='ENOENT')throw e}
 }
 const report=auditCandidate(packet,{rawFiles});
 console.log(JSON.stringify(report,null,2));
 if(report.errors.length)process.exitCode=1;
}catch(e){console.error('PH27 candidate assessment failed: '+e.message);process.exitCode=1}
