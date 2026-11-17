import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {releaseAudit} from '../js/evidence/phase57-unified-audit.js';
const paths=['benchmarks/phase57/release-policy.json','benchmarks/phase56/admission-policy.json',
 'benchmarks/phase55/provenance-policy.json','benchmarks/phase54/prototype-acquisition-policy.json',
 'benchmarks/phase53/signoff-boundary.json','benchmarks/phase52/reference-system-qualification.json',
 'benchmarks/phase41/reference-hardware-candidate.json',
 'benchmarks/phase42/physical-capture-protocol.json',
 'benchmarks/phase48/whole-system-readiness.json','benchmarks/phase51/fault-model-scope.json',
 'scripts/phase21-run.sh','scripts/phase22-run.sh','scripts/phase22-enable-feol.mjs',
 'scripts/phase22-proof.ys','benchmarks/phase13/rtl/alu8.v'];
const bytes=await Promise.all(paths.map(p=>readFile(p)));
const get=p=>JSON.parse(bytes[paths.indexOf(p)]),getText=p=>bytes[paths.indexOf(p)].toString();
const inputs={phase56:get(paths[1]),phase55:get(paths[2]),phase54:get(paths[3]),
 phase53:get(paths[4]),phase52:get(paths[5]),
 fanSources:{hardware:get(paths[6]),capture:get(paths[7]),whole:get(paths[8]),fault:get(paths[9])},
 flowScripts:Object.fromEntries(paths.slice(10).map(p=>[p,getText(p)]))};
const output={format:'invention-lab/phase57-cross-domain-source-release-audit/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 inputsSha256:Object.fromEntries(paths.map((p,i)=>[p,createHash('sha256').update(bytes[i]).digest('hex')])),
 decision:releaseAudit(get(paths[0]),inputs)};
await mkdir('benchmarks/evidence/phase57',{recursive:true});
await writeFile('benchmarks/evidence/phase57/phase57.json',JSON.stringify(output,null,2)+'\n');
console.log('PH57 PASS: independent cross-domain source audit; research-only, no hardware release');