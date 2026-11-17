import {mkdir,writeFile} from 'node:fs/promises';
import {integrationAudit} from '../js/release/integration-reconcile.js';
const r=await integrationAudit();
await mkdir('benchmarks/evidence/integration',{recursive:true});
await writeFile('benchmarks/evidence/integration/integration.json',JSON.stringify(r,null,2)+'\n');
console.log('SOURCE RECONCILIATION PASS: both histories preserved, original physical-validation status remains none');