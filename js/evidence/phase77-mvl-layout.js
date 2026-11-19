// Phase 77: functional standard-cell specifications and honest postlayout gates.
// Rectangles are candidate placement guides, NOT foundry GDS/DEF, LVS, or DRC.
import {makeVoltageRails} from './phase73-mvl-devices.js';
export const PHASE77_FORMAT='invention-lab/phase77-mvl-cell-layout-candidate/1';
function finite(x,label,min=0){
 if(typeof x!=='number'||!Number.isFinite(x)||x<min)
  throw Error('Invalid '+label);
 return x;
}
export function generateMvlStandardCellCandidates({
 base=4,width=4,pitchUm=2.4,cellHeightUm=8,corner='tt'
}={}){
 if(![4,8].includes(width))throw Error('Only 4/8-digit reference layouts supported');
 if(!Number.isInteger(base)||base<2||base>16)throw Error('Invalid radix');
 if(!['tt','ss','ff','sf','fs'].includes(corner))throw Error('Unknown PDK corner');
 finite(pitchUm,'pitchUm',.5);finite(cellHeightUm,'cellHeightUm',1);
 const rails=makeVoltageRails({base,minimumV:0,maximumV:base===4?3.3:1.8});
 const kinds=['mv_detector','mv_half_adder','mv_mux','mv_level_shifter'];
 const cells=kinds.map((kind,i)=>{
  const tracks=base+2+i;
  return {name:'MVL_'+base+'_'+kind.toUpperCase(),kind,base,tracks,
   widthUm:Math.round(tracks*pitchUm*1000)/1000,heightUm:cellHeightUm,
   pins:[...Array.from({length:kind==='mv_half_adder'?2:1},(_,j)=>'A'+j),
    'Y','VDD','VSS'],
   implementation:'unplaced-functional-candidate-no-transistor-map',
   spiceNetlist:null,layoutGds:null,layoutDef:null,
   verifiedDeviceModels:false,foundryDrcPassed:false,lvsMatched:false};
 });
 const instances=Array.from({length:width},(_,i)=>({
  name:'digit_'+i,cell:cells[1].name,
  xUm:Math.round(i*cells[1].widthUm*1000)/1000,yUm:0,orientation:'N'
 }));
 const result={format:PHASE77_FORMAT,radix:base,width,corner,rails:rails.rails,
  technologyStage:'abstract-logical-cell-floorplan-not-a-foundry-layout',
  cells,instances,globalRoute:null,extractedSPEF:null,drcReport:null,lvsReport:null,
  phase18To22ReusedAsQualifiedCustomCells:false,foundryQualified:false};
 return result;
}
export function inspectPostLayoutMvlCandidate({candidate,noise,extraction,
  minimumMarginV=.1}={}){
 if(candidate?.format!==PHASE77_FORMAT||!Number.isInteger(candidate.radix))
  throw Error('Phase77 candidate required');
 finite(minimumMarginV,'minimumMarginV');
 if(!noise?.marginByState?.length)
  return {format:PHASE77_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'missing-state-specific-post-layout-noise-data',drcClean:null,lvsMatched:null};
 if(!extraction||typeof extraction!=='object'||extraction.sourceAuthenticated!==true||
   extraction.openrcxPerformed!==true||extraction.parasiticUnits!=='SI'||
   extraction.drcClean!==true||extraction.lvsMatched!==true)
  return {format:PHASE77_FORMAT,status:'INSUFFICIENT_MODEL_DATA',
   reason:'unverified-custom-cell-drc-lvs-and-postroute-openrcx',
   drcClean:null,lvsMatched:null,foundrySignoff:false};
 const required=['couplingCapacitanceF','loadCapacitanceF','aggressorSwingV','supplyCurrentA','railResistanceOhm'];
 for(const x of required)finite(extraction[x],x);
 if(extraction.loadCapacitanceF<=0)throw Error('Post-layout load capacitance cannot be zero');
 const crosstalkV=extraction.aggressorSwingV*
  extraction.couplingCapacitanceF/(extraction.loadCapacitanceF+extraction.couplingCapacitanceF);
 const droopV=extraction.supplyCurrentA*extraction.railResistanceOhm;
 const perState=noise.marginByState.map(s=>{
  finite(s.marginV,'pre-layout margin',-1e6);
  return {state:s.state,marginV:s.marginV-crosstalkV-droopV};
 });
 const collapsed=perState.filter(x=>x.marginV<minimumMarginV).map(x=>x.state);
 // An externally asserted authentication flag is NOT a physical signoff.
 return {format:PHASE77_FORMAT,status:collapsed.length?'VIRTUAL_FAIL':'CUSTOM_CELL_EXTRACTION_REVIEW_REQUIRED',
  crosstalkV,droopV,perState,collapsed,
  drcClean:true,lvsMatched:true,foundrySignoff:false,physicalValidation:'none',
  reason:'extraction-provenance-requires-independent-hash-and-ruledeck-review'};
}
