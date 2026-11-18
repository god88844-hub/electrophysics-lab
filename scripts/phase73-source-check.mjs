// Authenticated upstream file-byte retrieval, no local PDK byte invention.
import {fetchPinnedPdkSources} from '../js/evidence/phase73-pdk-provenance.js';
try{
 const report=await fetchPinnedPdkSources();
 process.stdout.write(JSON.stringify(report,null,2)+'\n');
 if(report.checked!==28||report.foundryCalibrationVerified!==false)
  throw Error('Upstream PDK source inventory incomplete');
}catch(e){
 process.stderr.write('Phase73 PDK source integrity NOT VERIFIED: '+e.message+'\n');
 process.exitCode=1;
}
