// Record real source-anchored historical references and unmeasured UI lab scopes.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {Diagram} from '../js/core/diagram.js';
import {ATLAS_FORMAT,REFERENCE_SOURCE_COMMIT,REFERENCE_CATALOG,KNOWN_LABS,buildEvidencePassport} from '../js/evidence/phase29-atlas.js';
const root='benchmarks/evidence/phase29/';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const sha=b=>createHash('sha256').update(b).digest('hex');
execFileSync('git',['merge-base','--is-ancestor',REFERENCE_SOURCE_COMMIT,'HEAD']);
const sourceFiles={};
for(const ref of REFERENCE_CATALOG){
 const url='https://github.com/god88844-hub/invention-lab/blob/'+REFERENCE_SOURCE_COMMIT+'/'+ref.source;
 if(ref.url!==url||ref.appliesToActiveDiagram!==false||ref.hardwareValidation!=='none')
  throw Error('Historical source reference misbound: '+ref.id);
 const id=git('rev-parse',REFERENCE_SOURCE_COMMIT+':'+ref.source);
 if(!/^[a-f0-9]{40}$/.test(id))throw Error('Missing exact source Git object');
 sourceFiles[ref.id]={source:ref.source,sourceGitObjectId:id,pinnedCommit:REFERENCE_SOURCE_COMMIT};
}
const domains=KNOWN_LABS.map(labId=>{
 const diagram=labId==='crosslab'?null:
  new Diagram({id:'phase29-unmeasured-example-'+labId,lab:labId,name:'Empty '+labId+' UI evidence example'});
 const p=buildEvidencePassport({labId,diagram});
 if(p.physicalVerdict!=='unknown'||p.realWorldBuildSuccessPercent!==null||
   p.atlas.historicalReferences.some(r=>r.appliesToActiveDiagram!==false))
  throw Error('Historical proof was promoted to an untested diagram');
 return {labId,referenceIds:p.atlas.historicalReferences.map(r=>r.id),
  referenceCount:p.atlas.historicalReferences.length,status:p.currentDesignEvidenceStatus,
  physicalVerdict:p.physicalVerdict};
});
const originalHashes={
 sourceModuleSha256:sha(await readFile('js/evidence/phase29-atlas.js')),
 appModuleSha256:sha(await readFile('js/ui/app.js')),
 browserSmokeSha256:sha(await readFile('tests/browser-3d.html'))
};
const record={format:'invention-lab/phase29-source-scoped-atlas/1',
 sourceCommit:git('rev-parse','HEAD'),referenceSourceCommit:REFERENCE_SOURCE_COMMIT,
 catalogFormat:ATLAS_FORMAT,referenceCount:REFERENCE_CATALOG.length,
 domains,sourceFiles,...originalHashes,
 activeDiagramOriginalPhysicalMeasurements:0,referenceCasesLinkedToActiveDesigns:0,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir(root,{recursive:true});
await writeFile(root+'phase29.json',JSON.stringify(record,null,2)+'\n');
console.log('PH29 source-anchored '+domains.length+' lab contexts / '+REFERENCE_CATALOG.length+' archived references; 0 physically validated current designs');
