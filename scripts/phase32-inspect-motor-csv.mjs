// Validation of candidate *file shape*, not origin, motor identity, or chip qualification.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {auditMotorCsv} from '../js/evidence/phase32-source-coverage.js';
if(process.argv.length!==3){
 console.error('Usage: node scripts/phase32-inspect-motor-csv.mjs <original-OpenMCT-raw-log.csv>');
 process.exitCode=2;
}else try{
 const bytes=await readFile(process.argv[2]);
 const sourceSha256=createHash('sha256').update(bytes).digest('hex');
 const report=auditMotorCsv(bytes.toString('utf8'));
 console.log(JSON.stringify({fileSha256:sourceSha256,
   hashIsIndependentOriginProof:false,report},null,2));
}catch(e){console.error('PH32 raw motor candidate rejected: '+e.message);process.exitCode=1}
