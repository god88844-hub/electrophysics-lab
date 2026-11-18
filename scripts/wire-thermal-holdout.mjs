// Local-only candidate calibration. No network or qualification implied.
import {readFile,stat} from 'node:fs/promises';
import {fitWireThermalConvectionHoldout} from '../js/scene/wire-thermal-holdout.js';
const args=process.argv.slice(2);
if(args.length!==1){
 process.stderr.write('Usage: node scripts/wire-thermal-holdout.mjs observations.json\n');
 process.exitCode=2;
}else{
 try{
  const name=args[0];
  if(/^[a-z]+:\/\//i.test(name))throw Error('Network URLs are prohibited; use a local JSON file');
  const meta=await stat(name);
  if(!meta.isFile()||meta.size<=0||meta.size>256_000)
   throw Error('JSON file must be a nonempty regular file up to 256 KB');
  const raw=await readFile(name,'utf8');
  if(raw.length>256_000)throw Error('JSON file exceeds 256 KB');
  const payload=JSON.parse(raw);
  if(!payload||typeof payload!=='object'||Array.isArray(payload)||
     !Array.isArray(payload.rows)||!payload.options)
   throw Error('Input must contain rows and options');
  const report=fitWireThermalConvectionHoldout(payload.rows,payload.options);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
 }catch(e){process.stderr.write('Thermal holdout refused: '+e.message+'\n');process.exitCode=1;}
}
