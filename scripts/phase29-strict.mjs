// Independently reopen the exact historical Git objects, active UI source
// and physical-unknown model output instead of trusting the generated report.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {Diagram} from '../js/core/diagram.js';
import {ATLAS_FORMAT,REFERENCE_SOURCE_COMMIT,REFERENCE_CATALOG,KNOWN_LABS,buildEvidencePassport} from '../js/evidence/phase29-atlas.js';
const root='benchmarks/evidence/phase29/';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const sha=b=>createHash('sha256').update(b).digest('hex');
try{
 const record=JSON.parse(await readFile(root+'phase29.json','utf8'));
 const sourceFiles={};
 for(const r of REFERENCE_CATALOG){
  const url='https://github.com/god88844-hub/invention-lab/blob/'+REFERENCE_SOURCE_COMMIT+'/'+r.source;
  if(r.url!==url||r.appliesToActiveDiagram!==false||r.hardwareValidation!=='none')
   throw Error('Unscoped external reference: '+r.id);
  sourceFiles[r.id]={source:r.source,sourceGitObjectId:git('rev-parse',REFERENCE_SOURCE_COMMIT+':'+r.source),pinnedCommit:REFERENCE_SOURCE_COMMIT};
 }
 const domains=KNOWN_LABS.map(labId=>{
  const diagram=labId==='crosslab'?null:
   new Diagram({id:'phase29-unmeasured-example-'+labId,lab:labId,name:'Empty '+labId+' UI evidence example'});
  const p=buildEvidencePassport({labId,diagram});
  return {labId,referenceIds:p.atlas.historicalReferences.map(r=>r.id),
   referenceCount:p.atlas.historicalReferences.length,status:p.currentDesignEvidenceStatus,
   physicalVerdict:p.physicalVerdict};
 });
 const hashes={
  sourceModuleSha256:sha(await readFile('js/evidence/phase29-atlas.js')),
  appModuleSha256:sha(await readFile('js/ui/app.js')),
  browserSmokeSha256:sha(await readFile('tests/browser-3d.html'))
 };
 if(record.format!=='invention-lab/phase29-source-scoped-atlas/1'||
    record.sourceCommit!==git('rev-parse','HEAD')||
    record.referenceSourceCommit!==REFERENCE_SOURCE_COMMIT||
    record.catalogFormat!==ATLAS_FORMAT||record.referenceCount!==12||
    !isDeepStrictEqual(record.domains,domains)||
    !isDeepStrictEqual(record.sourceFiles,sourceFiles)||
    Object.keys(hashes).some(k=>record[k]!==hashes[k])||
    record.activeDiagramOriginalPhysicalMeasurements!==0||
    record.referenceCasesLinkedToActiveDesigns!==0||
    record.physicalValidation!=='none'||record.physicalVerdict!=='unknown'||
    record.realWorldBuildSuccessPercent!==null)
  throw Error('Phase29 source-locked reference or UNKNOWN-physical evidence replay mismatch');
 const summary={format:'invention-lab/phase29-independent-atlas-audit/1',
  accepted:true,sourceCommit:record.sourceCommit,registeredLabContexts:domains.length,
  originalSourceVerifiedHistoricalReferences:REFERENCE_CATALOG.length,
  activePhysicalMeasurementCount:0,referenceCasesLinkedToCurrentDesign:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
  next:'Phase30 integration and release hardening, real hardware still required'};
 await writeFile(root+'phase29-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH29 STRICT PASS: 8 lab contexts, 12 source-verified separate references, 0 inferred silicon passes');
}catch(e){console.error('PH29 STRICT FAIL: '+e.message);process.exitCode=1}
