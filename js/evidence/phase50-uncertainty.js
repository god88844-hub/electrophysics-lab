// Phase50: strict interval arithmetic, NOT a confidence interval or physical rate.
import {verifyIdentifiabilitySource,fitSyntheticTotalResistance} from './phase49-identifiability.js';
import {verifyReferenceCandidate} from './phase41-hardware-readiness.js';
import {verifyWireAssumptions,gaugeCrossSectionSquareM} from './phase44-wire-loop.js';
import {verifyBatteryAssumptions} from './phase43-battery-model.js';
import {verifyMotorAssumptions} from './phase45-motor-characterization.js';
export const FORMAT='invention-lab/phase50-deterministic-conditional-uncertainty/1';
const fail=(x,m)=>{if(!x)throw Error(m)};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>{if(v&&typeof v==='object'){for(const x of Object.values(v))freeze(x);Object.freeze(v)}return v};
export function verifyUncertaintyInputs(input,{candidate,battery,wire,motor,identifiability}){
 verifyReferenceCandidate(candidate);verifyBatteryAssumptions(battery,candidate);
 verifyWireAssumptions(wire,candidate);verifyMotorAssumptions(motor,candidate);
 verifyIdentifiabilitySource(identifiability);
 const a=structuredClone(input);
 fail(a?.format===FORMAT&&a.referenceDesignId===candidate.designId&&
 eq(a.sourceVersionIds,['phase43-E91-two-cell-nominal-ohmic-sensitivity',
 'phase44-AWG24-copper-loop-with-assumed-contacts',
 'phase45-Pololu1592-manufacturer-3V-endpoints','phase49-synthetic-circuit-identifiability']),
 'Original model source list changed');
 fail(a.nominalPackVoltageHypothesisV===3&&
 eq(a.batterySeriesResistanceOhm,{lower:.3,upper:.6})&&
 eq(a.twoContactResistanceEachOhm,{lower:0,upper:.05})&&
 a.actualCopperGaugeAWGAssumed===24&&a.eachConductorLengthHypothesisM===.25&&
 a.wireTemperatureHypothesisC===20&&
 a.motorEffectiveStoppedResistanceHypothesisOhm===.75,
 'Uncertainty envelope widened or silently narrowed');
 fail(a.manufacturerDataTypicalNotCalibrated===true&&
 a.intervalRepresentsPhysicalProbability===false&&a.assumedDistribution===null&&
 a.confidenceLevel===null&&a.correlationsAndModelDiscrepancyQualified===false&&
 a.syntheticHoldoutSource==='benchmarks/phase49/synthetic-identifiability.json'&&
 a.sourceMatchedPhysicalHoldoutUnits===0&&a.physicalCalibrationUnits===0&&
 a.independentInstrumentCalibrationAccepted===false&&
 a.independentDeviceHeldoutAccuracy===null&&
 a.sourceMatchedPredictionInterval===null&&a.physicalValidation==='none'&&
 a.physicalVerdict==='unknown'&&a.realWorldBuildSuccessPercent===null,
 'Hypothetical resistance bounds mislabeled physical uncertainty or probability');
 return true;
}
export function calculateConditionalUncertainty(input,models){
 verifyUncertaintyInputs(input,models);
 const area=gaugeCrossSectionSquareM(24);
 const rCopper=(1/58e6)*2*input.eachConductorLengthHypothesisM/area;
 const rMin=rCopper+2*input.twoContactResistanceEachOhm.lower;
 const rMax=rCopper+2*input.twoContactResistanceEachOhm.upper;
 const motorR=.75,sourceV=3;
 const Imin=sourceV/(motorR+rMax+input.batterySeriesResistanceOhm.upper);
 const Imax=sourceV/(motorR+rMin+input.batterySeriesResistanceOhm.lower);
 const synthetic=fitSyntheticTotalResistance(models.identifiability);
 fail(Imin>0&&Imax>Imin&&synthetic.structuralJacobianRank===1,'Expected rank/sensitivity mismatch');
 return freeze({
 format:'invention-lab/phase50-nonstatistical-interval-propagation/1',
 sourceType:'ONLY_HYPOTHETICAL_MONOTONE_RESISTANCE_INTERVALS',
 motorEffectiveStoppedResistanceHypothesisOhm:motorR,
 assumedWireCopperResistanceOhm:rCopper,
 assumedHarnessResistanceRangeOhm:{lower:rMin,upper:rMax},
 assumedTotalSeriesResistanceRangeOhm:{
 lower:motorR+rMin+input.batterySeriesResistanceOhm.lower,
 upper:motorR+rMax+input.batterySeriesResistanceOhm.upper},
 hypotheticalStoppedRotorCurrentRangeA:{lower:Imin,upper:Imax},
 hypotheticalMotorTerminalVoltageRangeV:{lower:Imin*motorR,upper:Imax*motorR},
 syntheticHoldoutMaximumAbsoluteCurrentErrorA:synthetic.syntheticHoldoutMaximumAbsoluteCurrentErrorA,
 physicalIndependentHoldoutSpecimens:0,
 actualFanModelDiscrepancyDistribution:null,
 statisticallyCalibratedPredictionInterval:null,
 statisticalCoverageProbability:null,
 confidenceLevel:null,
 correlationEffectsUnmeasured:true,
 physicallyQualified:true===false,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
 });
}
export function evaluatePhysicalHoldoutPlan(input,models,{trainingSpecimenIDs=[],heldOutSpecimenIDs=[],reviews=[]}={}){
 verifyUncertaintyInputs(input,models);
 fail(Array.isArray(trainingSpecimenIDs)&&Array.isArray(heldOutSpecimenIDs)&&Array.isArray(reviews),
  'Holdout groups require structured arrays');
 const safe=list=>list.every(x=>typeof x==='string'&&x.trim().length>0)&&
  new Set(list).size===list.length;
 fail(safe(trainingSpecimenIDs)&&safe(heldOutSpecimenIDs),'Duplicate or invalid claimed specimen IDs');
 const overlap=trainingSpecimenIDs.filter(x=>heldOutSpecimenIDs.includes(x));
 return freeze({
 format:'invention-lab/phase50-unverified-independent-specimen-holdout/1',
 selfDeclaredTrainingUnits:trainingSpecimenIDs.length,
 selfDeclaredHoldoutUnits:heldOutSpecimenIDs.length,
 overlapSpecimenIDs:overlap,groupSeparationClaimInternallyConsistent:overlap.length===0,
 externallyVerifiedHardwareSpecimenIDs:0,
 authenticatedCalibratedInstrumentReports:0,
 acceptedSourceMatchedPhysicalHoldoutSamples:0,
 provenanceReviewClaimsReceived:reviews.length,
 physicallyValidated:false,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
 });
}
