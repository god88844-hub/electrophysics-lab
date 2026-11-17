import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createStore,commit,fork,fastForward,verifyStore,exportBundle,SAMPLE} from '../js/evidence/phase65-project-history.js';
const path='benchmarks/phase65/versioning-policy.json',raw=await readFile(path),p=JSON.parse(raw);
if(p.durableRemoteBackup!==false||p.cryptographicAuthorAttestation!==false)throw Error('Unsupported durability or authorship claim');
const store=createStore(),base=commit(store,SAMPLE);fork(store,'main','candidate');
const head=commit(store,{...SAMPLE,notes:'modified offline engineering snapshot'},{branch:'candidate',expectedHead:base});
fastForward(store,{source:'candidate',target:'main',expectedTargetHead:base});
const result={format:'invention-lab/phase65-versioning-audit/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 policySHA256:createHash('sha256').update(raw).digest('hex'),
 baseHead:base,finalHead:head,store:JSON.parse(exportBundle(store)),validation:verifyStore(store),
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase65',{recursive:true});
await writeFile('benchmarks/evidence/phase65/phase65.json',JSON.stringify(result,null,2)+'\n');
console.log('PH65 PASS: integrity-checked content-addressed snapshots and optimistic fast-forward history');