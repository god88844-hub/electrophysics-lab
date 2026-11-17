// Future self-declared candidate readiness only; never signs off on a chip.
import {readFile} from 'node:fs/promises';
import {assessDecisions} from '../js/measure/phase28-decisions.js';
if(process.argv.length!==3){
 console.error('Usage: node scripts/phase28-assess.mjs /path/to/candidate-report.json');
 process.exitCode=2;
}else try{
 const report=JSON.parse(await readFile(process.argv[2],'utf8'));
 const [p24,p26,p27]=await Promise.all([
  'benchmarks/evidence/phase24/phase24-summary.json',
  'benchmarks/evidence/phase26/phase26-summary.json',
  'benchmarks/evidence/phase27/phase27-summary.json'
 ].map(async path=>JSON.parse(await readFile(path,'utf8'))));
 console.log(JSON.stringify(assessDecisions(p24,p26,p27,report),null,2));
}catch(e){console.error('PH28 candidate audit failed: '+e.message);process.exitCode=1}
