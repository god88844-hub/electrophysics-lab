// Experiment trace: a bounded, reversible VIEW of existing solver outputs.
// It is not a second solver, calibration dataset, or physical experiment.
export const TRACE_FORMAT='invention-lab/3d-experiment-trace/1';
const MAX_SAMPLES=512,MAX_TRACKS=80,MAX_DESIGN=2_000_000;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const exact=diagram=>JSON.stringify(diagram.toJSON());
const boundedText=x=>String(x).slice(0,100);
const sampleIndices=n=>{
 if(!Number.isSafeInteger(n)||n<1)return [];
 if(n<=MAX_SAMPLES)return Array.from({length:n},(_,i)=>i);
 const indices=new Set([0,n-1]);
 for(let i=1;i<MAX_SAMPLES-1;i++)indices.add(Math.round(i*(n-1)/(MAX_SAMPLES-1)));
 return [...indices].sort((a,b)=>a-b);
};
function traceRoot(diagram,result){
 if(!diagram||!['chip','logic','quantum'].includes(diagram.lab)||typeof diagram.toJSON!=='function')
  throw Error('Trace requires a supported original design');
 const source=exact(diagram);
 if(source.length>MAX_DESIGN)throw Error('Design exceeds bounded experiment snapshot');
 if(!result||result.ok!==true)return {
  format:TRACE_FORMAT,status:'unavailable',reason:boundedText(result?.problems?.join('; ')||'Solver has not produced a successful run'),
  source,lab:diagram.lab,tracks:[],axis:[],axisUnit:'',evidence:unqualified()
 };
 return {format:TRACE_FORMAT,status:'ready',source,lab:diagram.lab,
  tracks:[],axis:[],axisUnit:'',analysis:'',evidence:unqualified(),
  warnings:(Array.isArray(result.warnings)?result.warnings:[]).slice(0,30).map(boundedText)};
}
const unqualified=()=>({
 simulation:'SOLVER_OUTPUT_ONLY',physicalValidation:'none',
 realWorldBuildSuccessPercent:null,
 validatedPhysicalEnvelope:false,independentPhysicalMeasurements:'NOT_ESTABLISHED'
});
function recordTrack(out,blockId,label,unit,values,indices,kind='instrument'){
 if(out.tracks.length>=MAX_TRACKS)return;
 if(!Array.isArray(values)||values.length<=Math.max(...indices))throw Error('Incomplete solver signal series');
 const reduced=indices.map(i=>values[i]);
 if(reduced.some(v=>!finite(v)&&v!=='Z'))throw Error('Non-finite or unsupported solver reading');
 out.tracks.push({blockId,label:boundedText(label),unit,kind,values:reduced});
}
export function captureExperimentTrace(diagram,result){
 const out=traceRoot(diagram,result);
 if(out.status!=='ready')return out;
 const existing=new Map(diagram.blocks.map(b=>[b.id,b]));
 if(diagram.lab==='chip'){
  const mode=result.analysis;
  if(!['dc','tran','ac'].includes(mode))throw Error('Unsupported Chip Lab analysis');
  out.analysis=mode;
  const full=mode==='tran'?result.t:mode==='ac'?result.f:[0];
  if(!Array.isArray(full)||!full.length||full.some(x=>!finite(x)))throw Error('Invalid solver independent variable');
  for(let i=1;i<full.length;i++)if(full[i]<full[i-1])throw Error('Non-monotone solver axis');
  const ids=sampleIndices(full.length);
  out.axis=ids.map(i=>full[i]);out.axisUnit=mode==='tran'?'s':mode==='ac'?'Hz':'DC';
  out.sourceSamples=full.length;
  const meters=result.meters||{};
  for(const [id,meter] of Object.entries(meters)){
   const block=existing.get(id);if(!block)continue;
   const unit=block.type==='chip.AMMETER'?'A':'V';
   const values=mode==='ac'?meter?.mag:mode==='dc'?[meter]:meter;
   recordTrack(out,id,block.params?.name||block.type,unit,values,ids,'instrument');
  }
  if(mode==='dc'&&Array.isArray(result.elements)){
   for(const el of result.elements){
    if(!existing.has(el.blockId))continue;
    if(finite(el.power))recordTrack(out,el.blockId,el.label||el.blockId,'W',[el.power],[0],'dissipation');
   }
  }
  if(mode==='tran'&&result.elements&&typeof result.elements==='object'){
   for(const [id,entry] of Object.entries(result.elements)){
    if(!existing.has(id)||!Array.isArray(entry?.power))continue;
    recordTrack(out,id,id,'W',entry.power,ids,'dissipation');
   }
  }
 }else if(diagram.lab==='logic'){
  out.analysis='event-simulation';
  const p=result.probes||{},records=Object.entries(p).filter(([id])=>existing.has(id));
  const all=new Set([0]);
  for(const [,v] of records){
   if(!Array.isArray(v.times)||!Array.isArray(v.values)||v.times.length!==v.values.length)
    throw Error('Invalid logic probe data');
   for(const t of v.times){if(!finite(t)||t<0)throw Error('Invalid logic event time');all.add(t);}
  }
  const full=[...all].sort((a,b)=>a-b),indices=sampleIndices(full.length);
  out.axis=indices.map(i=>full[i]);out.axisUnit='simulated ticks';out.sourceSamples=full.length;
  for(const [id,pb] of records){
   const values=out.axis.map(time=>{
    let index=-1;
    for(let i=0;i<pb.times.length;i++)if(pb.times[i]<=time)index=i;
    const v=index<0?'Z':pb.values[index];
    if(v==='Z')return v;
    if(!Number.isSafeInteger(v)||v<0||v>255)throw Error('Logic reading outside supported radix');
    return v;
   });
   // recordTrack expects original series indexed by the sampled axis.
   recordTrack(out,id,existing.get(id).params?.name||id,'radix digit',values,
    Array.from({length:values.length},(_,i)=>i));
  }
 }else{
  out.analysis='ideal-quantum-state-and-shot-sampling';
  const probs=result.probs||{},counts=result.counts||{};
  const outcomes=Object.entries(probs);
  if(!outcomes.length||outcomes.length>4096)throw Error('Quantum outcome distribution unavailable or oversized');
  if(!Number.isSafeInteger(result.shots)||result.shots<1)throw Error('Invalid quantum shot count');
  let total=0;
  for(const [state,p] of outcomes){
   if(!finite(p)||p<0||p>1||!Number.isSafeInteger(counts[state]??0)||
    (counts[state]??0)<0||String(state).length>30)throw Error('Invalid quantum probability/shot data');
   total+=p;
  }
  if(Math.abs(total-1)>1e-6)throw Error('Unnormalized quantum probability distribution');
  out.axis=[0];out.axisUnit='single simulated run';out.sourceSamples=1;
  for(const [state,p] of outcomes.sort((a,b)=>b[1]-a[1]).slice(0,MAX_TRACKS))
   recordTrack(out,null,'|'+state+'> theoretical probability','%',
    [100*p],[0],'quantum-theory');
  out.quantumShotCount=result.shots;
  out.quantumReportedOutcomes=outcomes.length;
  out.note='Theoretical simulated state probabilities, not physical qubit measurements.';
 }
 if(!out.tracks.length){out.status='no-readings';out.reason='Solver completed without mapped instrument outputs';}
 return out;
}
export function isExperimentCurrent(trace,diagram){
 return !!trace&&trace.status==='ready'&&!!diagram&&trace.lab===diagram.lab&&trace.source===exact(diagram);
}
export function experimentReadingsAt(trace,index,{selectedBlockId=null,limit=6}={}){
 if(!trace||trace.status!=='ready')return [];
 if(!Number.isInteger(index)||index<0||index>=trace.axis.length)throw Error('Trace time index outside solver samples');
 const relevant=trace.tracks.filter(t=>selectedBlockId&&t.blockId===selectedBlockId);
 const tracks=relevant.length?relevant:trace.tracks;
 return tracks.slice(0,Math.max(1,Math.min(limit,12))).map(t=>({
  blockId:t.blockId,label:t.label,unit:t.unit,kind:t.kind,value:t.values[index]
 }));
}
export function exportExperimentRecord(trace,diagram){
 if(!isExperimentCurrent(trace,diagram))throw Error('Design changed or no successful experiment; rerun before exporting');
 return {format:'invention-lab/3d-experiment-record/1',
  sourceDesign:JSON.parse(trace.source),trace:JSON.parse(JSON.stringify(trace)),
  evidence:unqualified(),note:'Uncalibrated simulated outputs. Not independent physical measurements or a predicted build success percentage.'};
}
