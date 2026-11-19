// Phase 81: quantum *visuals* from existing modeled density/state data.
// No transmon fabrication, measured coherence, or live hardware connection.
export const QUANTUM_3D_FORMAT='invention-lab/phase81-quantum-hardware-view/1';
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const complex=z=>z&&finite(z.re)&&finite(z.im);
export function blochFromDensity(rho){
 if(!Array.isArray(rho)||rho.length!==2||
    rho.some(row=>!Array.isArray(row)||row.length!==2||row.some(z=>!complex(z))))
  throw Error('Two-dimensional complex density matrix required');
 const [a,b]=rho;
 if(Math.abs(a[0].im)>1e-9||Math.abs(b[1].im)>1e-9||
    Math.abs(a[0].re+b[1].re-1)>1e-7||
    Math.abs(a[1].re-b[0].re)>1e-7||
    Math.abs(a[1].im+b[0].im)>1e-7)
  throw Error('Invalid density matrix Hermiticity or trace');
 const x=2*a[1].re,y=-2*a[1].im||0,z=a[0].re-b[1].re;
 const radius=Math.hypot(x,y,z);
 if(radius>1+1e-7)throw Error('Unphysical Bloch vector');
 return {format:QUANTUM_3D_FORMAT,x,y,z,radius,
  purity:(1+radius*radius)/2,source:'modeled-density-state',
  measuredHardware:false,physicalValidation:'none'};
}
export function quditVisual(probabilities,{dimension=3}={}){
 if(!Number.isInteger(dimension)||dimension<2||dimension>16||
    !Array.isArray(probabilities)||probabilities.length!==dimension||
    probabilities.some(x=>!finite(x)||x<0||x>1)||
    Math.abs(probabilities.reduce((a,b)=>a+b,0)-1)>1e-7)
  throw Error('Normalized qudit probabilities required');
 return {format:QUANTUM_3D_FORMAT,dimension,
  bars:probabilities.map((probability,level)=>({level,probability})),
  entanglementKnown:false,hardwareCouplingVerified:false,physicalValidation:'none'};
}
export function coherenceDecay({timeUs,T1Us,T2Us}={}){
 if(![timeUs,T1Us,T2Us].every(finite)||timeUs<0||T1Us<=0||T2Us<=0)
  return {status:'UNKNOWN',reason:'missing-authentic-coherence-parameters',physicalValidation:'none'};
 if(T2Us>2*T1Us+1e-9)throw Error('Unphysical T2 > 2*T1 for simple Markovian model');
 return {status:'IDEALIZED_EXPONENTIAL_MODEL',
  excitationRetention:Math.exp(-timeUs/T1Us),
  coherenceRetention:Math.exp(-timeUs/T2Us),
  physicalValidation:'none',measuredHardware:false};
}
export function hardwareQuantumLayout({technology='transmon',qubits=2,pitchMm=8}={}){
 if(!['transmon','trapped-ion'].includes(technology)||!Number.isInteger(qubits)||qubits<1||qubits>64||
  !finite(pitchMm)||pitchMm<.1||pitchMm>100)throw Error('Invalid quantum proxy layout');
 const nodes=Array.from({length:qubits},(_,i)=>({
  id:'q'+i,technology,xMm:i*pitchMm,yMm:0,zMm:0,
  kind:technology==='transmon'?'resonator-proxy':'ion-site-proxy'
 }));
 const couplers=nodes.slice(1).map((x,i)=>({a:nodes[i].id,b:x.id,
  couplingMeasured:false,physicalValidation:'none'}));
 return {format:QUANTUM_3D_FORMAT,technology,nodes,couplers,
  fieldSimulationAvailable:false,materialPropertiesVerified:false,
  actualDeviceLayout:false,physicalValidation:'none'};
}
