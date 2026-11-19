// Stage M authentic-native-trial preflight. This module does NOT run SPICE,
// establish post-layout DRC/LVS or issue build-success probabilities.
export const Q4_CELL_NAMES=Object.freeze([
  'q4_thresh_det','q4_inv','q4_mux4','q4_half_adder'
]);
export const REQUIRED_TEMPERATURES_C=Object.freeze([-40,25,85,125]);
export const REQUIRED_PDK_CORNERS=Object.freeze(['tt','ss','ff','mc']);
const FAIL='INSUFFICIENT_MODEL_DATA';
export function makeRequiredNativeStageMCampaign(){
  const q4PrimitiveTrials=[];
  // 1,000 actual ngspice trials for EACH primitive: 250 per temperature.
  for(let c=0;c<Q4_CELL_NAMES.length;c++)
    for(let i=0;i<1000;i++){
      q4PrimitiveTrials.push(Object.freeze({
        kind:'pex-q4-primitive',cell:Q4_CELL_NAMES[c],trial:i+1,
        seed:1000000+c*1000+i+1,
        temperatureC:REQUIRED_TEMPERATURES_C[i%4],corner:'mc',
        requiredMeasurements:['NM_L','NM_1','NM_2','NM_H','delay_s','power_w','peak_power_w'],
        status:'NOT_RUN'
      }));
    }
  const aluTrials=[];
  for(const radix of [2,3,4])for(const width of [4,8])
    for(const corner of REQUIRED_PDK_CORNERS)for(let i=0;i<100;i++)
      aluTrials.push(Object.freeze({
        kind:'pex-assembled-alu',radix,width,corner,trial:i+1,
        seed:2000000+radix*100000+width*10000+
          REQUIRED_PDK_CORNERS.indexOf(corner)*100+i+1,
        temperatureC:REQUIRED_TEMPERATURES_C[i%4],
        requiredMeasurements:['functional_match','NM_L','NM_1','NM_2','NM_H','delay_s','power_w','peak_power_w'],
        status:'NOT_RUN'
      }));
  return {format:'invention-lab/stage-m-native-campaign-plan/1',
    status:FAIL,level1Yield:'UNKNOWN',physicalQualification:'UNQUALIFIED_NO_GO',
    perPrimitiveTrials:1000,perTemperatureTrialsPerPrimitive:250,
    perALUConfigurationCornerTrials:100,
    primitiveTrialCount:q4PrimitiveTrials.length,aluTrialCount:aluTrials.length,
    totalRequiredNgspiceTrials:q4PrimitiveTrials.length+aluTrials.length,
    q4PrimitiveTrials,aluTrials,
    allAuthenticatedNativeTrialsCompleted:false,
    sourceBoundPexVerified:false,
    independentDrcLvsVerified:false,
    modelSourceIntegrityVerified:false};
}
const regex1=(source,regex)=>[...source.matchAll(regex)];
const safePath=s=>typeof s==='string'&&
  /^\/[A-Za-z0-9_./-]+$/.test(s)&&
  !s.split('/').includes('..');
export function inspectDeclaredMismatchTrialDeck({
  deck,expectedLibraryPath,expectedPexPath,seed,temperatureC,corner='mc'
}={}){
  const no=(reason)=>({status:FAIL,reason,nativeSpiceAuthorized:false,
    sourceAuthenticated:false,physicalQualification:'UNQUALIFIED_NO_GO'});
  if(typeof deck!=='string'||deck.length>2000000||
     !safePath(expectedLibraryPath)||!safePath(expectedPexPath)||
     !Number.isSafeInteger(seed)||seed<=0||seed>2147483647||
     !REQUIRED_TEMPERATURES_C.includes(temperatureC)||
     !REQUIRED_PDK_CORNERS.includes(corner))
    return no('invalid-source-root-or-trial-specification');
  if(!expectedLibraryPath.endsWith('/sky130A/libs.tech/ngspice/sky130.lib.spice')||
     !expectedPexPath.endsWith('-pex.spice'))
    return no('unrecognized-pinned-processed-library-or-PEX-path');
  if(/^\s*\.(?:control|shell|alter|func)\b/im.test(deck))
    return no('unadmitted-executable-SPICE-directive');
  const lines=deck.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const get=(re)=>lines.filter(x=>re.test(x));
  const libs=get(/^\.lib\b/i);
  // Model corners must come from the exact pinned processed PDK. Never
  // substitute nominal TT for statistical MC. A tt_mm alias is admissible
  // only if the audited original library actually provides that section.
  const physicalCorner=corner;
  if(libs.length!==1||
     libs[0]!=='.lib "'+expectedLibraryPath+'" '+physicalCorner)
    return no('wrong-or-multiple-PDK-corner-binding');
  const includes=get(/^\.include\b/i);
  if(includes.length!==1||
     includes[0]!=='.include "'+expectedPexPath+'"')
    return no('PEX-include-missing-or-untrusted-includes');
  const mm=get(/^\.param\s+mc_mm_switch\s*=/i);
  if(mm.length!==1||!/^\.param\s+mc_mm_switch\s*=\s*1(?:\.0*)?$/i.test(mm[0]))
    return no('explicit-unambiguous-mc_mm_switch-1-required');
  const option=get(/^\.option\s+seed\s*=/i);
  if(option.length!==1||option[0]!=='.option seed='+seed)
    return no('one-replayable-native-rng-seed-required');
  const temps=get(/^\.temp\b/i);
  if(temps.length!==1||temps[0]!=='.temp '+temperatureC)
    return no('temperature-corner-mismatch');
  if(get(/^\.end$/i).length!==1)
    return no('bounded-SPICE-deck-terminator-required');
  if(!get(/^\.tran\b/i).length&&!get(/^\.dc\b/i).length)
    return no('no-analysis-request');
  if(corner!=='mc')
    return no('this-mismatch-trial-preflight-requires-pinned-mc');
  if(get(/^\.param\s+mc_pr_switch\s*=/i).length!==1 ||
     !/^\.param\s+mc_pr_switch\s*=\s*1(?:\.0*)?$/i.test(get(/^\.param\s+mc_pr_switch\s*=/i)[0]))
    return no('explicit-unambiguous-mc_pr_switch-1-required');
  return {status:'DECLARED_MISMATCH_DECK_NOT_PHYSICALLY_ADMITTED',
    requestedCorner:corner,seed,temperatureC,
    explicitMismatchEnabled:true,actualModelCorner:physicalCorner,
    postlayoutPathDeclared:true,
    ngspiceExecuted:false,nativeSpiceAuthorized:false,
    sourceAuthenticated:false,fullTransistorSOAProven:false,
    extractedRCCalibrated:false,
    level1Yield:'UNKNOWN',physicalQualification:'UNQUALIFIED_NO_GO'};
}
