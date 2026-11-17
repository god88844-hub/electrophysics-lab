// Conservative, *reversible* one-toggle overlay of an immutable upstream DRC deck.
// FEOL=true does not make a rule deck foundry-qualified.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const src='benchmarks/evidence/phase22/source-sky130hd.lydrc';
const dst='benchmarks/evidence/phase22/feol-enabled-sky130hd.lydrc';
const raw=await readFile(src,'utf8');
const blob=execFileSync('git',['hash-object',src],{encoding:'utf8'}).trim();
if(blob!=='e1a1bbb4721bd02bac42c2cb92ec2d24b25db8b6')
 throw Error('Refuse to change DRC: upstream SKY130 macro source differs');
const old='FEOL    = false # front-end-of-line checks';
const newer='FEOL    = true # front-end-of-line checks';
if(raw.split(old).length!==2||raw.includes(newer)||
  !raw.includes('BEOL    = true # back-end-of-line checks')||
  !raw.includes('OFFGRID = true # manufacturing grid/angle checks'))
 throw Error('FEOL patch is not a single controlled toggle');
await writeFile(dst,raw.replace(old,newer));
console.log('PH22 exact upstream DRC deck, exactly one controlled FEOL toggle');
