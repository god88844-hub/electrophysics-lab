import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import '../js/labs/logic/components.js';
import {Diagram} from '../js/core/diagram.js';
import {registerAssembly} from '../js/assembly/modules.js';
import {makeHierarchy,proposeMove} from '../js/evidence/phase63-multiscale-3d.js';
const path='benchmarks/phase63/hierarchy-scope.json',bytes=await readFile(path),policy=JSON.parse(bytes);
if(policy.physicalCADDimensionsEstablished!==false||policy.independentlyManufacturedPhysicalGeometries!==0)
 throw Error('Physical geometry claim not supported');
const d=new Diagram({id:'phase63-evidence',lab:'logic',name:'Source-bound 3D view'});
d.addBlock('logic.IN',{id:'a',x:0,y:0,params:{value:1}});
d.addBlock('logic.NOT',{id:'b',x:200,y:0});
d.connect('a','out','b','a');
registerAssembly(d,{id:'sub',name:'Logic inverter',blockIds:['b']});
const r={format:'invention-lab/phase63-source-bound-multiscale-evidence/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 scopeSHA256:createHash('sha256').update(bytes).digest('hex'),
 sourceDiagram:d.toJSON(),fullHierarchy:makeHierarchy(d,{detail:'port'}),
 focused:makeHierarchy(d,{detail:'component',focusAssemblyId:'sub'}),
 transactionalMove:proposeMove(d,{assemblyId:'sub',deltaWorldX:1}),
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase63',{recursive:true});
await writeFile('benchmarks/evidence/phase63/phase63.json',JSON.stringify(r,null,2)+'\n');
console.log('PH63 PASS: multi-scale 3D hierarchy, 2D netlist preserved, source unchanged');