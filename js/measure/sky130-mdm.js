// Phase23: real third-party SKY130 test-tile measurement REPLAY, not chip validation.
// Numeric data are sourced from a fixed Git blob, never synthetic stand-ins.
// No calibration certificate, sample uncertainty or wafer/lot metadata is assumed.
import {createHash} from 'node:crypto';
export const FORMAT='invention-lab/phase23-third-party-sky130-device-measurement/1';
export const ACCEPTANCE='invention-lab/phase23-sky130-public-measurement-acceptance/1';
export const UPSTREAM='google/skywater-pdk-sky130-raw-data';
export const UPSTREAM_COMMIT='1f7214f2f81a0629303947a07e1ec00a28ae8a33';
export const README={path:'README.rst',gitBlobSha1:'92c6648d707251f1fb62fb662257aef2a85a33a3',bytes:3889,sha256:'e29c7fa8961b9638872ecb60be63bcb1c0ed4a23db44b025152eff83ec619efd'};
export const DATASETS=[
 {id:'specimen-6208-1-2',path:'sky130_fd_pr/cells/unsorted/res/pplus_poly_res_w0p69_l0p345_sq0p5(6208_1_2).mdm',gitBlobSha1:'e82a49007f61006913a8d9cd5bee50288a836d87',bytes:3100,sha256:'8661a7a54edf089eee9c976963abd97e3fa95aa9ff4ec7155061a0e3693bfe82',samples:51,purpose:'training-only'},
 {id:'specimen-6208-1-3',path:'sky130_fd_pr/cells/unsorted/res/pplus_poly_res_w0p69_l0p345_sq0p5(6208_1_3).mdm',gitBlobSha1:'f0b9986ccdceaa3f01b12dacff58125c32cb6a73',bytes:3100,sha256:'aef6ae6ebf8202bf93e8a33458c81e2c56b0697a52d6aae4fc8a178a87172e8e',samples:51,purpose:'held-out-validation-only'}
];
const equal=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
export const sha256=x=>createHash('sha256').update(x).digest('hex');
export const gitBlob=x=>{
 const b=Buffer.isBuffer(x)?x:Buffer.from(x,'utf8');
 return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
};
export function verifySourceFile(bytes,source){
 if(typeof source?.path!=='string'||!/^([0-9a-f]{40})$/.test(source.gitBlobSha1))
  throw Error('Unpinned upstream measurement source');
 const b=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes,'utf8');
 if(source.bytes!==b.length||gitBlob(b)!==source.gitBlobSha1||
    !/^[0-9a-f]{64}$/.test(source.sha256)||sha256(b)!==source.sha256)
  throw Error('Real upstream measurement raw bytes mismatch frozen source Git blob');
 return {path:source.path,bytes:b.length,gitBlobSha1:source.gitBlobSha1,sha256:sha256(b)};
}
export function parseMdm(text,{expectedSamples=null}={}){
 if(typeof text!=='string'||!text.startsWith('! VERSION = 6.00\n')||
    !text.includes(' ICCAP_INPUTS\n')||!text.includes(' ICCAP_OUTPUTS\n')||
    text.split('BEGIN_HEADER').length!==2||text.split('END_HEADER').length!==2||
    text.split('BEGIN_DB').length!==2||text.split('END_DB').length!==2)
  throw Error('Missing one genuine ICCAP MDM measurement header and sweep block');
 const header=text.slice(text.indexOf('BEGIN_HEADER'),text.indexOf('END_HEADER'));
 const sweep=/^\s*V1\s+V\s+C\s+GROUND\s+SMU\d+\s+\S+\s+LIN\s+1\s+(\S+)\s+(\S+)\s+(\d+)\s+(\S+)\s*$/m.exec(header);
 if(!sweep||!/^\s*I1\s+I\s+C\s+GROUND\s+SMU\d+\s+B\s*$/m.test(header)||
    !/^\s*I2\s+I\s+B\s+GROUND\s+SMU\d+\s+B\s*$/m.test(header))
  throw Error('Missing documented voltage/current SMU channels');
 const start=Number(sweep[1]),stop=Number(sweep[2]),count=Number(sweep[3]),step=Number(sweep[4]);
 if(!Number.isFinite(start)||!Number.isFinite(stop)||!Number.isFinite(step)||
   !Number.isSafeInteger(count)||count<5||count>20000||step<=0||
   Math.abs(stop-start-step*(count-1))>1e-7)
  throw Error('Invalid MDM linear sweep definition');
 if(expectedSamples!==null&&count!==expectedSamples)throw Error('MDM expected sample-count changed');
 const block=text.slice(text.indexOf('BEGIN_DB')+8,text.indexOf('END_DB'));
 if(!/^\s*#V1\s+I1\s+I2\s*$/m.test(block))throw Error('MDM channel names unexpected');
 const lines=block.split(/\r?\n/);
 const data=[];
 for(const line of lines){
  const s=line.trim();
  if(!s||s.startsWith('#')||s.startsWith('ICCAP_VAR '))continue;
  if(s==='BEGIN_DB'||s==='END_DB')throw Error('Unexpected MDM block nesting');
  const parts=s.split(/\s+/);
  if(parts.length!==3||parts.some(x=>!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(x)))
   throw Error('Malformed/nonfinite MDM raw observation: '+s.slice(0,70));
  const [voltageV,currentA,returnCurrentA]=parts.map(Number);
  if(!Number.isFinite(voltageV)||!Number.isFinite(currentA)||!Number.isFinite(returnCurrentA)||
    Math.abs(voltageV)>20||Math.abs(currentA)>10||Math.abs(returnCurrentA)>10)
   throw Error('Physically implausible/nonfinite MDM reading');
  data.push({voltageV,currentA,returnCurrentA});
 }
 if(data.length!==count)throw Error('Truncated MDM sweep observations');
 if(data.some((r,i)=>Math.abs(r.voltageV-(start+i*step))>1e-6||
      (i>0&&r.voltageV<=data[i-1].voltageV)))
  throw Error('Duplicate, displaced or re-ordered sweep voltage');
 if(!(start<0&&stop>0)||Math.max(...data.map(x=>x.currentA))<=0||
    Math.min(...data.map(x=>x.currentA))>=0)
  throw Error('Expected bipolar physical resistor I-V sweep absent');
 return {columns:['V1','I1','I2'],units:{voltageV:'V',currentA:'A',returnCurrentA:'A'},
  sweep:{startV:start,stopV:stop,stepV:step,samples:count},rows:data};
}
export function fitAndHoldout(train,heldout){
 if(!train?.rows?.length||!heldout?.rows?.length)throw Error('No source-verified physical sweeps');
 if(train===heldout||JSON.stringify(train.rows)===JSON.stringify(heldout.rows))
  throw Error('Same specimen cannot be passed as its own blind holdout');
 const xs=train.rows.map(x=>x.voltageV),ys=train.rows.map(x=>x.currentA);
 const denom=xs.reduce((s,x)=>s+x*x,0);
 const conductanceS=xs.reduce((s,x,i)=>s+x*ys[i],0)/denom;
 if(!Number.isFinite(conductanceS)||conductanceS<=0)throw Error('Nonphysical measured conductance');
 const lo=train.sweep.startV,hi=train.sweep.stopV;
 const evalRows=heldout.rows.filter(x=>x.voltageV>=lo-1e-8&&x.voltageV<=hi+1e-8);
 if(evalRows.length<10||evalRows.length>heldout.rows.length)
  throw Error('Missing held-out overlap envelope or independent out-of-envelope checks');
 const errors=evalRows.map(x=>conductanceS*x.voltageV-x.currentA);
 const rmseA=Math.sqrt(errors.reduce((s,e)=>s+e*e,0)/errors.length);
 const maeA=errors.reduce((s,e)=>s+Math.abs(e),0)/errors.length;
 const maxObservedA=Math.max(...evalRows.map(x=>Math.abs(x.currentA)));
 if(!Number.isFinite(rmseA)||!Number.isFinite(maeA)||maxObservedA<=0)
  throw Error('Nonfinite measured holdout error');
 return {trainSpecimen:DATASETS[0].id,holdoutSpecimen:DATASETS[1].id,
  fittedConductanceS:conductanceS,fittedResistanceOhm:1/conductanceS,
  trainObservations:train.rows.length,holdoutObservationsTotal:heldout.rows.length,
  holdoutObservationsInsideTrainingEnvelope:evalRows.length,
  heldOutVoltageEnvelopeV:[lo,hi],heldOutMAEA:maeA,heldOutRMSEA:rmseA,
  heldOutRMSEOfPeakFraction:rmseA/maxObservedA,
  calibrationMethod:'one-parameter-fit-through-zero',uncertaintyInterval:null,
  calibratedChipTiming:false,physicalAluMeasured:false,claim:'device-level-descriptive-only'};
}
export function assemblePhase23(manifest,rawFiles){
 if(!manifest||manifest.format!==ACCEPTANCE||manifest.project!=='invention-lab'||
    manifest.upstreamRepository!==UPSTREAM||manifest.upstreamCommit!==UPSTREAM_COMMIT||
    manifest.upstreamLicense!=='Apache-2.0'||!equal(manifest.documentation,README)||
    !equal(manifest.datasets,DATASETS)||
    !equal(manifest.expectedColumns,['V1','I1','I2'])||
    !equal(manifest.units,{V1:'V',I1:'A',I2:'A'})||
    manifest.evaluation!=='fit-one-parameter-ohmic-conductance-on-first-specimen-compare-unseen-second-specimen'||
    !equal(manifest.qualifications,{
      instrumentCalibrationChainVerified:false,uncertaintyBudgetKnown:false,
      lotAndWaferKnown:false,ambientConditionsKnown:false,sameDeviceAsPhase22Alu:false,
      realWorldBuildSuccessPercent:null
    }))
  throw Error('Frozen Phase23 physical evidence acceptance policy weakened');
 const readme=rawFiles[README.path];
 const sourceReadme=verifySourceFile(readme,README);
 const doc=Buffer.isBuffer(readme)?readme.toString('utf8'):readme;
 if(!doc.includes('CoolCAD Electronics LLC')||!doc.includes('.mdm')||
    !doc.includes('under contract'))
  throw Error('Upstream physical measurement origin is not documented by this source');
 const files=DATASETS.map(entry=>{
  const raw=rawFiles[entry.path];
  const provenance=verifySourceFile(raw,entry);
  const parsed=parseMdm(Buffer.isBuffer(raw)?raw.toString('utf8'):raw,
    {expectedSamples:entry.samples});
  return {id:entry.id,purpose:entry.purpose,source:provenance,
    sweep:parsed.sweep,columns:parsed.columns,units:parsed.units,parsed};
 });
 // Calibration reads only the first specimen; no fitting or tuning on holdout.
 const comparison=fitAndHoldout(files[0].parsed,files[1].parsed);
 return {
  format:FORMAT,source:{repository:UPSTREAM,commit:UPSTREAM_COMMIT,license:'Apache-2.0',
    readme:sourceReadme,documentedOrigin:'CoolCAD Electronics LLC test-tile measurements (upstream attribution)',
    instrumentCalibrationChainVerified:false,independentMeasurementAttestationVerified:false,
    specimenLotAndWaferKnown:false},
  files:files.map(({parsed,...rest})=>rest),comparison,
  physicalDomain:'separate-resistor-test-tile-devices-not-alu',
  physicalValidation:'none',physicalVerdict:'unknown',
  aluSiliconMeasurements:false,realWorldBuildSuccessPercent:null,
  supportedConclusion:'source-locked third-party measured device I-V data are readable and describable',
  missing:['original instrument calibration certificates','traceable uncertainty budget',
   'wafer and process provenance','sufficient independent holdout specimens',
   'ALU silicon timing or measured physical behavior','predeclared accuracy acceptance threshold'],
 };
}
export function verifyPhase23(record,computed,metadata){
 const errors=[];
 if(!equal(record,computed))errors.push('Recorded report differs from independently recomputed raw third-party measurements');
 if(!/^[0-9a-f]{40}$/.test(metadata?.commitSha??'')||
    metadata.commitSha!==metadata.reportCommitSha)
  errors.push('Evidence source Git commit mismatch');
 if(!/^[0-9a-f]{64}$/.test(metadata?.manifestSha256??'')||
    metadata.manifestSha256!==metadata.recordedManifestSha256)
  errors.push('Frozen acceptance manifest changed since evidence capture');
 if(record?.physicalValidation!=='none'||record?.physicalVerdict!=='unknown'||
    record?.realWorldBuildSuccessPercent!==null||
    record?.aluSiliconMeasurements!==false)
  errors.push('Third-party resistor measurement was incorrectly promoted into ALU hardware validation');
 return {ok:errors.length===0,errors,
  sourceArchiveReplayed:errors.length===0,
  measuredDataAreRealExternalPublishedReadings:errors.length===0,
  thisAluPhysicallyValidated:false,
  realWorldBuildSuccessPercent:null};
}
