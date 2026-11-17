// Phase40: cross-domain model passport and fail-closed evidence applicability.
// Scope agreement is NOT a certificate of independent physical calibration.
export const REGISTRY_FORMAT='invention-lab/phase40-model-passport-registry/1';
export const DECISION_FORMAT='invention-lab/phase40-model-applicability-decision/1';
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const deepFreeze=v=>{
 if(v&&typeof v==='object'){for(const x of Object.values(v))deepFreeze(x);Object.freeze(v);}
 return v;
};
const clone=v=>structuredClone(v);
const require=(ok,message)=>{if(!ok)throw Error(message);};
const SHA=/^[0-9a-f]{40}$/;
const KINDS=new Set(['illustrative-physics','published-experimental-empirical']);
const allowedOutcomes=new Set(['illustrative-only','matching-reference-conditions','incompatible','insufficient-evidence']);
export function verifyModelRegistry(registry){
 require(registry?.format===REGISTRY_FORMAT,'Unknown model registry version');
 require(registry?.repository==='god88844-hub/invention-lab','Unrecognized source repository');
 require(Array.isArray(registry.models)&&registry.models.length===3,'Exact three-model pilot registry required');
 const ids=new Set();
 for(const m of registry.models){
  require(typeof m.id==='string'&&/^[a-z0-9-]{6,80}$/.test(m.id)&&!ids.has(m.id),
   'Duplicate or invalid model identity');ids.add(m.id);
  require(KINDS.has(m.kind)&&Array.isArray(m.purpose)&&m.purpose.length>0&&
   m.purpose.every(x=>typeof x==='string'&&x.length>8),'Missing model applicability purposes');
  require(m.source?.repository==='god88844-hub/invention-lab'&&typeof m.source.path==='string'&&
   m.source.path.startsWith('js/')&&typeof m.source.version==='string','Missing versioned implementation identity');
  require(m.device&&typeof m.device.topology==='string'&&typeof m.device.type==='string'&&
   typeof m.device.identifier==='string'&&m.device.identifier.length>3,'Missing physical-device model identity');
  require(Array.isArray(m.conditions)&&m.conditions.every(c=>
   typeof c.name==='string'&&typeof c.unit==='string'&&finite(c.min)&&
   finite(c.max)&&c.min<=c.max&&typeof c.basis==='string'),'Invalid condition envelope');
  require(m.provenance&&m.provenance.publisherSourceCommit===null||
   m.provenance&&SHA.test(m.provenance.publisherSourceCommit),'Invalid original publisher source pin');
  require(m.evidence?.independentPhysicalMotorUnits===0||
   m.evidence?.independentPhysicalMotorUnits===2,'Invented motor population');
  require(m.evidence?.matchedTarget3VFanPhysicalSamples===0&&
   m.evidence?.targetALUSiliconSamples===0&&
   m.evidence?.physicallyQualifiedPopulationPredictionInterval===null&&
   m.evidence?.independentInstrumentTraceabilityCertified===false&&
   m.evidence?.physicalValidation==='none'&&m.evidence?.physicalVerdict==='unknown'&&
   m.evidence?.realWorldBuildSuccessPercent===null,
   'A source cross-check was promoted into target physical validation');
  require(m.cautions.every(x=>typeof x==='string'&&x.length>15)&&m.cautions.length>=2,
   'Missing scientifically material model warnings');
 }
 require(ids.has('phase31-illustrative-brushed-fan')&&ids.has('phase35-published-bldc')&&
 ids.has('phase36-two-regime-bldc'),'Required independent research models missing');
 const a=registry.models.find(m=>m.id==='phase31-illustrative-brushed-fan');
 const b=registry.models.find(m=>m.id==='phase35-published-bldc');
 const c=registry.models.find(m=>m.id==='phase36-two-regime-bldc');
 require(a.kind==='illustrative-physics'&&a.provenance.publisherSourceCommit===null&&
 a.evidence.independentPhysicalMotorUnits===0,'Unmeasured illustration mislabeled');
 for(const item of [b,c]){
  require(item.kind==='published-experimental-empirical'&&
   item.provenance.publisherSourceCommit==='1ce35456f83be8f36aec183ab19d6e6e46603023'&&
   item.device.topology==='BLDC-driver'&&item.device.identifier==='STEPPEROLINE 57BYA54-24-01'&&
   item.evidence.independentPhysicalMotorUnits===2,
   '24V BLDC original-source identity swapped');
 }
 require(c.conditions.some(x=>x.name==='controllerSpeedSetpointRpm'&&x.min===2000&&x.max===2500)&&
 c.conditions.some(x=>x.name==='brakeControllerSettingMilliamp'&&x.min===96&&x.max===96),
 'Published motor speed and brake envelope incorrectly widened');
 return true;
}
function normalizeTarget(target){
 require(target&&typeof target==='object'&&!Array.isArray(target),'Target must be a structured object');
 require(typeof target.designId==='string'&&target.designId.length>2&&target.designId.length<=128,
  'Design identity required');
 require(typeof target.intendedUse==='string'&&target.intendedUse.length>8,
  'Requested engineering decision and intended use required');
 require(typeof target.device?.topology==='string'&&typeof target.device?.type==='string'&&
  typeof target.device?.identifier==='string','Target motor/part identities required');
 require(target.conditions&&typeof target.conditions==='object'&&!Array.isArray(target.conditions),
  'Operating conditions must be keyed by quantity');
 for(const [key,item] of Object.entries(target.conditions)){
  require(/^[a-zA-Z][a-zA-Z0-9]{0,70}$/.test(key)&&item&&typeof item==='object'&&
   finite(item.value)&&typeof item.unit==='string','Nonfinite operating condition or missing unit');
 }
 return clone(target);
}
export function assessModelApplicability(registry,modelId,target){
 verifyModelRegistry(registry);
 const t=normalizeTarget(target);
 const m=registry.models.find(x=>x.id===modelId);
 require(m,'Unknown model identity; cannot guess compatible physics');
 const issues=[],matches=[],missing=[],outside=[];
 const identityFields=['topology','type','identifier'];
 for(const field of identityFields)if(t.device[field]!==m.device[field])
  issues.push('Device '+field+' mismatch: model '+m.device[field]+' vs design '+t.device[field]);
 for(const condition of m.conditions){
  const observed=t.conditions[condition.name];
  if(!observed){missing.push(condition.name);continue;}
  if(observed.unit!==condition.unit){issues.push('Unit mismatch '+condition.name);continue;}
  if(observed.value<condition.min||observed.value>condition.max)
   outside.push({parameter:condition.name,value:observed.value,unit:observed.unit,
    supportedMin:condition.min,supportedMax:condition.max});
  else matches.push(condition.name);
 }
 const sameDevice=issues.length===0;
 let verdict;
 if(m.kind==='illustrative-physics')verdict='illustrative-only';
 else if(!sameDevice||outside.length)verdict='incompatible';
 else if(missing.length)verdict='insufficient-evidence';
 else verdict='matching-reference-conditions';
 require(allowedOutcomes.has(verdict),'Unrecognized applicability verdict');
 // No user-supplied claim can become physical validation by editing a model passport.
 const physicallyQualified=false;
 return deepFreeze({
  format:DECISION_FORMAT,modelId,designId:t.designId,intendedUse:t.intendedUse,
  evaluatedModelKind:m.kind,referencePublisherCommit:m.provenance.publisherSourceCommit,
  scopeVerdict:verdict,matchedConditionNames:matches,missingConditionNames:missing,
  incompatibleIdentityOrUnits:issues,outsideReferenceConditions:outside,
  referenceConditionMatchDoesNotProvePopulationGeneralization:true,
  meetsIndependentPhysicalValidationGate:physicallyQualified,
  effectivePhysicalValidation:'none',effectivePhysicalVerdict:'unknown',
  physicalManufacturingSuccessRatePercent:null,calibratedTargetPredictionInterval:null,
  notes:verdict==='matching-reference-conditions'?
   'Only identity and published setting match; unverified physical instrument traceability and one held-out device prevent general hardware qualification.':
   'Model mismatch, unknown information or illustrative assumptions prevent physically qualified claims.'
 });
}
export function auditRegistryCoverage(registry,designs){
 verifyModelRegistry(registry);
 require(Array.isArray(designs)&&designs.length>0,'Design audit list required');
 const comparisons=designs.map(d=>assessModelApplicability(registry,d.modelId,d.target));
 return deepFreeze({format:'invention-lab/phase40-applicability-batch-audit/1',
  examinedDesigns:comparisons.length,comparisons,
  qualifiedForUnseenPhysicalBuilds:0,physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null});
}
