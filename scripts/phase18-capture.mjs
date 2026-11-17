import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {SOURCES,OUTPUTS,IMAGE,FORMAT,parseGeometry,evaluatePhase18} from '../js/evidence/phase18-physical-route.js';
const hash=x=>createHash('sha256').update(x).digest('hex');
const sha256={};
for(const [k,p] of Object.entries({...SOURCES,...OUTPUTS}))sha256[k]=hash(await readFile(p));
const log=await readFile(OUTPUTS.physicalFlowLog,'utf8');
const geometry=parseGeometry(await readFile(OUTPUTS.geometryLog,'utf8'));
const imageDigest=(await readFile(OUTPUTS.imageDigest,'utf8')).trim();
const record={format:FORMAT,imageTag:IMAGE,imageDigest,
 commitSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 kind:'placed-open-db-and-global-route-guide',sha256,geometry,
 routeGuideBytes:(await stat(OUTPUTS.guide)).size,
 flowLogStageEvidence:/(global_route|global route|FastRoute)/i.test(log)?'globalroute-executed':'missing',
 detailedRoute:false,drcPassed:false,lvsPassed:false,siliconMeasurements:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
 note:'Real ORFS-generated placed OpenDB and global-route guides; no detailed wires, signoff, or measured hardware.'};
const verdict=evaluatePhase18(record,{...record});
if(!verdict.ok)throw Error('Physical flow capture failed: '+verdict.errors.join('; '));
await writeFile('benchmarks/evidence/phase18/phase18.json',JSON.stringify(record,null,2)+'\n');
process.stdout.write('PH18 real OpenDB placed '+geometry.placed+' cells; global routing guide '+record.routeGuideBytes+' bytes; physical UNKNOWN\n');
