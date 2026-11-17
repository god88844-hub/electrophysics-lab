import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {SOURCES,OUTPUTS,parseGeometry,evaluatePhase18} from '../js/evidence/phase18-physical-route.js';
const hash=x=>createHash('sha256').update(x).digest('hex');
try{
 const record=JSON.parse(await readFile('benchmarks/evidence/phase18/phase18.json','utf8'));
 const sha256={};
 for(const [k,p] of Object.entries({...SOURCES,...OUTPUTS}))sha256[k]=hash(await readFile(p));
 const log=await readFile(OUTPUTS.physicalFlowLog,'utf8');
 const actual={commitSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  sha256,geometry:parseGeometry(await readFile(OUTPUTS.geometryLog,'utf8')),
  imageDigest:(await readFile(OUTPUTS.imageDigest,'utf8')).trim(),
  routeGuideBytes:(await stat(OUTPUTS.guide)).size,
  flowLogStageEvidence:/(global_route|global route|FastRoute)/i.test(log)?'globalroute-executed':'missing'};
 const verdict=evaluatePhase18(record,actual);
 const summary={format:'invention-lab/phase18-independent-physical-boundary/1',
  accepted:verdict.ok,sourceCommit:actual.commitSha,modeledEvidence:verdict.verdict,
  actualGeometry:actual.geometry,globalRoutingGuideBytes:actual.routeGuideBytes,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  missing:['detail-route','signoff-drc','lvs','extracted-rc-signoff','fabricated-silicon','measured-calibration'],
  errors:verdict.errors};
 await writeFile('benchmarks/evidence/phase18/phase18-summary.json',JSON.stringify(summary,null,2)+'\n');
 if(!verdict.ok)throw Error(verdict.errors.join('; '));
 console.log('PH18 independent actual OpenDB/global-route replay PASS; physical UNKNOWN');
}catch(e){console.error('PH18 strict replay FAIL: '+e.message);process.exitCode=1;}
