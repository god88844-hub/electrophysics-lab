// Phase 75: deterministic, bounded, parallel SPICE Monte Carlo *execution*.
// Statistical distributions MUST be furnished from independent characterized
// PDK evidence; a manually supplied sigma is not foundry calibration.
import {runNgspice,detectNgspiceFailure} from '../bench/ngspice-adapter.js';
export const PHASE75_FORMAT='invention-lab/phase75-parallel-monte-carlo-spice/1';
export const TEMPERATURE_CORNERS=Object.freeze([-40,25,85,125]);
function assertFinite(x,name,min=-Infinity,max=Infinity){
 if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)
  throw Error('Invalid '+name);
 return x;
}
export function seededUniformGenerator(seed){
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Seed must be uint32');
 let x=seed>>>0;
 return ()=>{x=(x+0x6d2b79f5)>>>0;let t=Math.imul(x^(x>>>15),1|x);
  t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};
}
function standardNormal(next){
 const u=Math.max(next(),Number.EPSILON),v=next();
 return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}
export function drawProcessTrial({seed,index,variation}){
 if(!Number.isInteger(index)||index<0||index>1_000_000)throw Error('Invalid die-trial index');
 if(!variation||typeof variation!=='object')throw Error('Explicit process variation required');
 const keys=['vthSigmaV','oxideSigmaFraction','lengthSigmaFraction','widthSigmaFraction'];
 for(const key of keys)assertFinite(variation[key],key,0,1);
 const rng=seededUniformGenerator((seed^Math.imul((index+1),0x9e3779b9))>>>0);
 const tempC=TEMPERATURE_CORNERS[index%TEMPERATURE_CORNERS.length];
 return {index,tempC,seed,
  deltaVthV:standardNormal(rng)*variation.vthSigmaV,
  oxideScale:1+standardNormal(rng)*variation.oxideSigmaFraction,
  lengthScale:1+standardNormal(rng)*variation.lengthSigmaFraction,
  widthScale:1+standardNormal(rng)*variation.widthSigmaFraction};
}
function readMeasurement(output,name){
 const re=new RegExp('(?:^|\\n)\\s*'+name+'\\s*=\\s*([-+]?\\d+(?:\\.\\d+)?(?:[eE][-+]?\\d+)?)','i');
 const m=re.exec(output);
 return m?Number(m[1]):null;
}
export async function runFoundryMonteCarlo({
 seed,trials=1000,concurrency=4,variation,exe,makeDeck,
 maximumDelayS,maximumStaticPowerW,maximumDynamicPowerW,
 // A test runner can exercise scheduling but is never accepted as real SPICE.
 _syntheticTrialRunner=null
}={}){
 if(!Number.isInteger(trials)||trials<1000||trials>100000)
  throw Error('Manufacturing Monte Carlo requires N>=1000 bounded trials');
 if(!Number.isInteger(concurrency)||concurrency<1||concurrency>16)throw Error('Invalid concurrency');
 for(const [key,value] of Object.entries({maximumDelayS,maximumStaticPowerW,maximumDynamicPowerW}))
  assertFinite(value,key,0,1e9);
 // Verify every required process variation explicitly; no default, guessed sigmas.
 if(!variation||['vthSigmaV','oxideSigmaFraction','lengthSigmaFraction','widthSigmaFraction']
   .some(k=>typeof variation[k]!=='number'||!Number.isFinite(variation[k])||variation[k]<0||variation[k]>1))
  return {format:PHASE75_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'missing-foundry-statistical-variation-parameters',trialCount:0,
   physicallyQualified:false};
 if(typeof makeDeck!=='function'||!exe&&!_syntheticTrialRunner)
  return {format:PHASE75_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'missing-ngspice-binary-or-deck-generator',trialCount:0,
   physicallyQualified:false};
 seededUniformGenerator(seed);
 const outcomes=Array(trials);
 let cursor=0;
 const runOne=async(i)=>{
  const process=drawProcessTrial({seed,index:i,variation});
  if(process.oxideScale<=0||process.lengthScale<=0||process.widthScale<=0)
   return {index:i,tempC:process.tempC,verdict:'INVALID_MODEL_DRAW',reason:'negative-drawn-geometry',delayS:null,staticPowerW:null,dynamicPowerW:null};
  const deck=makeDeck(process);
  if(typeof deck!=='string'||deck.length<10||deck.length>2_000_000)
   throw Error('Invalid ngspice trial netlist');
  let raw;
  if(_syntheticTrialRunner)raw=await _syntheticTrialRunner({process,deck});
  else raw=await runNgspice({exe,deck,timeoutMs:30_000});
  const fault=detectNgspiceFailure(raw);
  if(fault)return {index:i,tempC:process.tempC,verdict:'INVALID_SPICE_RESULT',reason:fault,delayS:null,staticPowerW:null,dynamicPowerW:null};
  const log=raw.fullText??(raw.stdout||'')+'\n'+(raw.log||'');
  const delayS=readMeasurement(log,'mvl_delay_s');
  const staticPowerW=readMeasurement(log,'mvl_static_power_w');
  const dynamicPowerW=readMeasurement(log,'mvl_dynamic_power_w');
  if([delayS,staticPowerW,dynamicPowerW].some(x=>x===null||!Number.isFinite(x)||x<0))
   return {index:i,tempC:process.tempC,verdict:'INVALID_SPICE_RESULT',reason:'required-measurements-missing',delayS:null,staticPowerW:null,dynamicPowerW:null};
  const pass=delayS<=maximumDelayS&&staticPowerW<=maximumStaticPowerW&&dynamicPowerW<=maximumDynamicPowerW;
  return {index:i,tempC:process.tempC,verdict:pass?'PASS':'FAIL',delayS,staticPowerW,dynamicPowerW};
 };
 async function worker(){
  while(cursor<trials){const i=cursor++;outcomes[i]=await runOne(i);}
 }
 await Promise.all(Array.from({length:Math.min(concurrency,trials)},worker));
 const valid=outcomes.filter(x=>x.verdict==='PASS'||x.verdict==='FAIL');
 const invalid=trials-valid.length;
 const passed=valid.filter(x=>x.verdict==='PASS').length;
 return {format:PHASE75_FORMAT,status:invalid?'INSUFFICIENT_MODEL_DATA':
    _syntheticTrialRunner?'SYNTHETIC_TEST_ONLY':'UNVERIFIED_STATISTICS',
  seed,trials,trialCount:outcomes.length,passed,failed:valid.length-passed,invalid,
  temperaturesC:TEMPERATURE_CORNERS.slice(),
  source:'real-ngspice-runner-not-foundry-statistical-certification',
  variationProvenance:variation.sourceRecord??null,
  variationIndependentlyCalibrated:false,
  physicallyQualified:false,realWorldBuildSuccessPercent:null,
  outcomes};
}
