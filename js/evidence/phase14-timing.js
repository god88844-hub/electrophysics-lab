// Phase 14: fail-closed parser/validator for independently executed
// pre-layout, SINGLE CORNER, COMBINATIONAL OpenSTA path analysis.
// This NEVER qualifies fabricated hardware or process/yield reliability.
export const FORMAT='invention-lab/phase14-prelayout-sta/1';
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const required=['libertySha256','netlistSha256','sdcSha256','staScriptSha256','staLogSha256'];
const number=x=>typeof x==='number'&&Number.isFinite(x);
export function parsePhase14TimingLog(log){
 if(typeof log!=='string'||log.length<100||/^\s*(?:Error|Warning):/mi.test(log))
   throw Error('STA log missing, truncated, or contains unresolved warnings/errors');
 const marker='PHASE14_TIMING_PATHS_BEGIN', end='PHASE14_TIMING_PATHS_END';
 if(log.split(marker).length!==2||log.split(end).length!==2)
   throw Error('Missing or repeated real STA report delimiters');
 const between=log.split(marker)[1].split(end);
 if(between.length!==2||!between[0].trim()||between[1]===undefined)
   throw Error('No complete timing report');
 const report=between[0];
 const start=[...report.matchAll(/^Startpoint:\s*(.+)$/gm)];
 const finish=[...report.matchAll(/^Endpoint:\s*(.+)$/gm)];
 const slack=[...report.matchAll(/^\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)\s+slack\s+\((?:MET|VIOLATED)\)\s*$/gm)];
 if(start.length===0||start.length!==finish.length||start.length!==slack.length)
   throw Error('No complete constrained input-to-output path with finite slack');
 if(start.length>1000)throw Error('Implausible STA report count');
 const expected=new Set(['carry','zero',...Array.from({length:8},(_,i)=>'y['+i+']')]);
 if(finish.length!==10||new Set(finish.map(x=>x[1].split(' ')[0])).size!==10||
    finish.some(x=>!expected.has(x[1].split(' ')[0])))
   throw Error('Not every required ALU output endpoint was timed');
 const values=slack.map(x=>Number(x[1]??x[2]));
 if(values.some(x=>!Number.isFinite(x)))throw Error('Unusable nonfinite timing slack');
 if(/unconstrained|no paths found|not linked|unknown cell|black.box/i.test(report))
   throw Error('Unconstrained, unlinked or unsupported timing data');
 return Object.freeze({
   pathCount:start.length,inputPorts:18,outputPorts:10,
   worstSlackNs:Math.min(...values),reportedWorstSlacksNs:Object.freeze([...values]),
   timingBudgetNs:20,
   result:Math.min(...values)>=0?'met':'violated'
 });
}
export function evaluatePhase14Timing(record,actual={}){
 const errors=[];
 if(record?.format!==FORMAT||record?.example!=='alu8'||record?.libraryCorner!=='tt_025C_1v80'||
    record?.analysis!=='pre-layout-combinational-single-typical-corner'||
    record?.constraints?.periodNs!==20||record?.constraints?.inputMaxNs!==1||
    record?.constraints?.outputMaxNs!==1||record?.constraints?.inputSlewNs!==0.1||
    record?.constraints?.outputLoadPf!==0.01)
   errors.push('Unapproved topology/library, analysis mode or prespecified timing constraints');
 for(const name of required){
   if(!sha(record?.[name])||(actual[name]&&actual[name]!==record[name]))
     errors.push('Missing/stale/tampered source or tool output: '+name);
 }
 if(actual.commitSha&&record?.commitSha!==actual.commitSha)
   errors.push('Recorded design commit is stale');
 if(typeof record?.tool?.version!=='string'||!/^OpenSTA|^STA /i.test(record.tool.version))
   errors.push('Missing real STA tool identity');
 const data=record?.timing;
 if(!data||!Number.isInteger(data.pathCount)||data.pathCount<1||
    data.pathCount>1000||data.inputPorts!==18||data.outputPorts!==10||
    data.timingBudgetNs!==20||!number(data.worstSlackNs)||
    !Array.isArray(data.reportedWorstSlacksNs)||
    data.reportedWorstSlacksNs.length!==data.pathCount||
    data.reportedWorstSlacksNs.some(x=>!number(x))||
    Math.min(...data.reportedWorstSlacksNs)!==data.worstSlackNs||
    data.result!==(data.worstSlackNs>=0?'met':'violated'))
   errors.push('Inconsistent, absent or mathematically impossible path/slack record');
 if(actual.timing&&JSON.stringify(data)!==JSON.stringify(actual.timing))
   errors.push('Summary does not equal the re-parsed original OpenSTA log');
 if(record?.physicalValidation!=='none'||record?.physicalQualified!==false||
    record?.physicalVerdict!=='unknown'||record?.realWorldBuildSuccessPercent!==null||
    record?.postLayout!==false||record?.multiCorner!==false||
    record?.prototypeMeasurements!==false)
   errors.push('Physical validation, extraction, multi-corner or manufacturing evidence invented');
 if(data?.result==='violated')errors.push('The fixed 20 ns single-corner external timing budget was violated');
 return Object.freeze({
   ok:errors.length===0,errors,
   status:errors.length?'fail':'pre-layout-model-only',
   physicalValidation:'none',physicalVerdict:'unknown',
   realWorldBuildSuccessPercent:null
 });
}
