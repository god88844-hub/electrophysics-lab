// Evaluate an actual external capture file, if supplied in a future lab run.
// Do not accept its self-reported origin/certificates as independent proof.
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {preflight,RTL_PATH} from '../js/measure/phase24-prototype.js';
if(process.argv.length!==3){
 console.error('Usage: node scripts/phase24-assess.mjs /path/to/original-capture.json');
 process.exitCode=2;
}else try{
 const input=JSON.parse(await readFile(process.argv[2],'utf8'));
 const blob=execFileSync('git',['hash-object',RTL_PATH],{encoding:'utf8'}).trim();
 const assessment=preflight(input,{expectedSourceBlob:blob});
 console.log(JSON.stringify(assessment,null,2));
 if(assessment.status==='invalid-capture')process.exitCode=1;
}catch(e){console.error('Physical capture preflight ERROR: '+e.message);process.exitCode=1}
