import {H,X,Y,Z,CNOT} from '../labs/quantum/gates.js';
export const FORMAT='invention-lab/phase61-density-matrix-noise/1';
const C=(re=0,im=0)=>({re,im}), add=(a,b)=>C(a.re+b.re,a.im+b.im);
const mul=(a,b)=>C(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
const conj=a=>C(a.re,-a.im),abs=a=>Math.hypot(a.re,a.im);
const guard=(ok,msg)=>{if(!ok)throw Error(msg)};
const shape=(A,n)=>Array.isArray(A)&&A.length===n&&A.every(r=>Array.isArray(r)&&r.length===n&&r.every(z=>z&&Number.isFinite(z.re)&&Number.isFinite(z.im)));
const zero=n=>Array.from({length:n},()=>Array.from({length:n},()=>C()));
function product(A,B){const n=A.length,R=zero(n);
 for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++)R[i][j]=add(R[i][j],mul(A[i][k],B[k][j]));
 return R;}
const dagger=A=>A.map((_,i)=>A.map(row=>conj(row[i])));
function trace(A){let z=C();for(let i=0;i<A.length;i++)z=add(z,A[i][i]);return z;}
function embed(U,n,qubits){
 const N=2**n,k=qubits.length,dim=2**k;
 guard(shape(U,dim),'Invalid channel matrix');
 guard(new Set(qubits).size===k&&qubits.every(q=>Number.isInteger(q)&&q>=0&&q<n),'Invalid qubit targets');
 const bit=(i,q)=>(i>>(n-1-q))&1,E=zero(N);
 for(let col=0;col<N;col++){
  let local=0;for(const q of qubits)local=(local<<1)|bit(col,q);
  for(let out=0;out<dim;out++){
   let row=col;
   for(let t=0;t<k;t++){const mask=1<<(n-1-qubits[t]);row=(out>>(k-1-t))&1?row|mask:row&~mask;}
   E[row][col]=U[out][local];
  }
 }
 return E;
}
function cptp(K){
 guard(Array.isArray(K)&&K.length>0&&K.length<=4,'Invalid Kraus operator set');
 const dim=K[0]?.length;
 guard([2,4].includes(dim)&&K.every(M=>shape(M,dim)),'Invalid Kraus operator matrix');
 const sum=zero(dim);
 for(const M of K){const p=product(dagger(M),M);
  for(let i=0;i<dim;i++)for(let j=0;j<dim;j++)sum[i][j]=add(sum[i][j],p[i][j]);}
 for(let i=0;i<dim;i++)for(let j=0;j<dim;j++)
  guard(abs(add(sum[i][j],C(i===j?-1:0)))<1e-10,'Kraus completeness violation');
}
function validate(s){
 guard(s&&s.format===FORMAT&&Number.isInteger(s.n)&&s.n>=1&&s.n<=3&&shape(s.rho,2**s.n),'Bad bounded state');
 const t=trace(s.rho);
 guard(Math.abs(t.re-1)<1e-9&&Math.abs(t.im)<1e-9,'Density trace invalid');
 for(let i=0;i<s.rho.length;i++)for(let j=0;j<s.rho.length;j++){
  guard(abs(add(s.rho[i][j],mul(C(-1),conj(s.rho[j][i]))))<1e-9,'Non-Hermitian state');
  if(i===j)guard(s.rho[i][i].re>=-1e-10,'Negative diagonal probability');
 }
 return true;
}
export function basis(n=1,index=0){
 guard(Number.isInteger(n)&&n>=1&&n<=3&&Number.isInteger(index)&&index>=0&&index<2**n,'Only 1 to 3 basis qubits supported');
 const rho=zero(2**n);rho[index][index]=C(1);
 return {format:FORMAT,n,rho,history:[],evidenceScope:'MATHEMATICAL'};
}
export function applyGate(s,U,targets){
 validate(s);
 const E=embed(U,s.n,targets),rho=product(product(E,s.rho),dagger(E));
 const out={...s,rho,history:[...s.history,'unitary']};validate(out);return out;
}
export function applyChannel(s,K,targets){
 validate(s);cptp(K);
 guard(Array.isArray(targets)&&targets.length===(K[0].length===2?1:2),'Channel target arity mismatch');
 const N=2**s.n,rho=zero(N);
 for(const A of K){const E=embed(A,s.n,targets),piece=product(product(E,s.rho),dagger(E));
  for(let i=0;i<N;i++)for(let j=0;j<N;j++)rho[i][j]=add(rho[i][j],piece[i][j]);}
 const out={...s,rho,history:[...s.history,'kraus']};validate(out);return out;
}
const scale=(A,f)=>A.map(r=>r.map(z=>C(z.re*f,z.im*f)));
const I=[[C(1),C()],[C(),C(1)]];
export function channel(type,p){
 guard(typeof p==='number'&&Number.isFinite(p)&&p>=0&&p<=1,'Invalid probability');
 if(type==='amplitude-damping')return [
  [[C(1),C()],[C(),C(Math.sqrt(1-p))]],
  [[C(),C(Math.sqrt(p))],[C(),C()]]];
 if(type==='dephasing')return [scale(I,Math.sqrt(1-p)),scale(Z,Math.sqrt(p))];
 if(type==='depolarizing')return [scale(I,Math.sqrt(1-3*p/4)),scale(X,Math.sqrt(p/4)),scale(Y,Math.sqrt(p/4)),scale(Z,Math.sqrt(p/4))];
 throw Error('Unsupported noise channel');
}
export function probabilities(s){validate(s);return s.rho.map((r,i)=>r[i].re);}
export function purity(s){validate(s);const t=trace(product(s.rho,s.rho));guard(Math.abs(t.im)<1e-9,'Invalid purity');return t.re;}
export function bell(type=null,p=0){
 let s=applyGate(applyGate(basis(2),H,[0]),CNOT(),[0,1]);
 if(type!==null)s=applyChannel(s,channel(type,p),[0]);
 return s;
}
export function auditNoise(){
 const ideal=bell(),mixed=bell('dephasing',0.5),decay=applyChannel(basis(1,1),channel('amplitude-damping',0.25),[0]);
 return {format:'invention-lab/phase61-math-audit/1',
  idealBell:probabilities(ideal),idealPurity:purity(ideal),
  dephasedBell:probabilities(mixed),dephasedPurity:purity(mixed),
  dampedExcitation:probabilities(decay),dampedPurity:purity(decay),
  independentHardwareExperiments:0,hardwareCalibratedNoise:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}