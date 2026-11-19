// Deterministic per-foundry Stage M gate; missing genuine silicon data is a
// software-test PASS with an unambiguous engineering NO-GO disposition.
import {loadSourceManifest} from '../js/evidence/phase73-pdk-provenance.js';
import {assessStageMMatrix} from '../js/evidence/stage-m-signoff-readiness.js';
const manifest=await loadSourceManifest();
const report=assessStageMMatrix(manifest);
process.stdout.write(JSON.stringify(report,null,2)+'\n');
if(report.cases.length!==12||
   report.cases.some(x=>x.releaseAuthorized!==false)||
   report.cases.some(x=>x.passport.physicallyQualified!==false)||
   report.physicalReleaseAllowed!==false)
 throw Error('Stage M physical fail-closed acceptance rule changed');
