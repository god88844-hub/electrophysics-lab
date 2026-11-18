// Genuine independent Ngspice DC comparison for the augmented physical-wire
// circuit. This is a software cross-solver oracle, NOT independent hardware data.
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {Diagram} from '../js/core/diagram.js';
import '../js/labs/chip/components.js';
import {setPhysicalWireAssumption,evaluatePhysicalWire} from '../js/scene/physical-wire.js';
import {solveCoupledWireDC} from '../js/scene/coupled-wire-dc.js';
const d=new Diagram({lab:'chip',name:'Cross-solver DC wire loop'});
const supply=d.addBlock('chip.VSOURCE',{params:{mode:'dc',dc:10}});
const load=d.addBlock('chip.RES',{params:{r:10}});
const gnd=d.addBlock('chip.GND');
const w=[
 d.connect(supply.id,'p',load.id,'p'),
 d.connect(load.id,'n',gnd.id,'g'),
 d.connect(supply.id,'n',gnd.id,'g')
];
if(w.some(x=>!x))throw Error('Failed to build canonical test circuit');
const specs=[
 {material:'copper',lengthMm:120,diameterMm:.45,temperatureC:20},
 {material:'aluminum',lengthMm:250,diameterMm:.70,temperatureC:20},
 {material:'copper',lengthMm:140,diameterMm:.50,temperatureC:20}
];
for(let i=0;i<3;i++)setPhysicalWireAssumption(d,w[i].id,specs[i]);
const snap=JSON.stringify(d.toJSON());
const cfg={ambientC:20,heatTransferWm2K:12,contactResistanceOhm:.002,
 durationS:.04,stepS:.004};
const report=solveCoupledWireDC(d,cfg);
if(JSON.stringify(d.toJSON())!==snap||report.physicalValidation!=='none')
 throw Error('Original circuit/source provenance unexpectedly modified');
const [r0,r1,r2]=specs.map(spec=>
 evaluatePhysicalWire(spec).resistanceOhm+cfg.contactResistanceOhm);
const deck=[
 '* Independent external Ngspice physical-wire series reference, not hardware measurement',
 'V1 src ret DC 10',
 'Rwire0 src load_p '+r0.toExponential(14),
 'Rload load_p load_n 10',
 'Rwire1 load_n 0 '+r1.toExponential(14),
 'Rwire2 ret 0 '+r2.toExponential(14),
 '.control','set noaskquit','op','print i(v1)','quit','.endc','.end'
].join('\n')+'\n';
const dir=mkdtempSync(join(tmpdir(),'invention-lab-coupled-'));
try{
 const deckPath=join(dir,'comparison.cir');
 writeFileSync(deckPath,deck,'utf8');
 const stdout=execFileSync('ngspice',['-b',deckPath],{encoding:'utf8',timeout:45000,
  maxBuffer:1_000_000,stdio:['ignore','pipe','pipe']});
 const match=stdout.match(/\bi\(v1\)\s*=\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)/i);
 if(!match)throw Error('Ngspice did not report independent source current: '+stdout.slice(-800));
 const referenceA=Math.abs(Number(match[1]));
 const predictedA=Math.abs(report.records[0].wires[0].currentA);
 const toleranceA=2e-5;
 if(!Number.isFinite(referenceA)||Math.abs(referenceA-predictedA)>toleranceA)
  throw Error('Ngspice independent DC current mismatch predicted='+predictedA+
   ', reference='+referenceA+', maxAbsoluteDifference='+toleranceA);
 if(!report.records.at(-1).wires.every(x=>Number.isFinite(x.currentA)))
  throw Error('Augmented time-domain DC solver produced a nonfinite final current');
 process.stdout.write(JSON.stringify({
  crossSolver:'Ngspice independent DC MNA',
  source:'different numerical engine and independent resistor network',
  predictedCurrentA:predictedA,referenceCurrentA:referenceA,
  absoluteDifferenceA:Math.abs(referenceA-predictedA),maxAllowedDifferenceA:toleranceA,
  comparedPhysicalWires:3,samples:report.records.length,
  physicalValidation:'none',physicalBuildSuccessPercent:null
 },null,2)+'\n');
}finally{rmSync(dir,{recursive:true,force:true});}
