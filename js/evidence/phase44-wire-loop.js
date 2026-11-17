// Phase44: conditional AWG24 annealed-copper loop with explicitly hypothetical
// contact resistances. No measured wire, safe ampacity, insulation, or connectors.
import {verifyReferenceCandidate} from './phase41-hardware-readiness.js';
export const WIRE_FORMAT='invention-lab/phase44-copper-harness-illustrative-resistance/1';
const fail=(v,m)=>{if(!v)throw Error(m)};
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const deepFreeze=x=>{if(x&&typeof x==='object'){for(const e of Object.values(x))deepFreeze(e);Object.freeze(x);}return x};
const inRange=(v,[min,max])=>finite(v)&&v>=min&&v<=max;
export function verifyWireAssumptions(a,candidate){
 verifyReferenceCandidate(candidate);
 fail(a?.format===WIRE_FORMAT&&a.referenceDesignId===candidate.designId,
  'Wire model is not bound to candidate source');
 fail(a.material==='standard-annealed-copper-100pct-IACS-reference'&&
  a.proposedWireGaugeAWG===24&&a.proposedWireGaugeAWG===candidate.conductors.proposedCopperAWG&&
  a.referenceResistivityAt20C_OhmM===1/58000000&&
  a.resistivityTemperatureCoefficientPerC===0.00393&&a.temperatureReferenceC===20&&
  a.sourceUrl==='https://nvlpubs.nist.gov/nistpubs/Legacy/circ/nbscircular31e4.pdf'&&
  a.sourceBasis.includes('58 meter/(ohm mm2)')&&
  a.topology==='two-conductor-series-loop-with-two-hypothetical-contact-resistances',
  'Engineering copper standard, gauge or assumed loop topology changed');
 const e=a.scenarioEnvelope;
 fail(e&&same(e.eachConductorLengthM,[0.01,2])&&
  same(e.currentA,[0,4])&&same(e.wireTemperatureC,[0,80])&&
  same(e.contactResistancePerContactOhm,[0,0.05])&&
  same(a.illustrativeExample,{eachConductorLengthM:0.25,currentA:1,
   wireTemperatureC:20,contactResistancePerContactOhm:0.01})&&
  a.scenarioEnvelopeIsMathematicalNotThermalSafetyLimit===true,
  'Mathematical scenario envelope broadened or safety implications changed');
 fail(a.measuredConductorLengthM===null&&a.measuredContactResistanceOhm===null&&
  a.measuredActualAlloyOrStranding===null&&
  a.actualWireManufacturerPartNumber===null&&
  a.actualConnectorPartNumber===null&&
  a.actualWireInsulationTemperatureRatingC===null&&
  same(a.actualHarnessSpecimenIds,[])&&
  a.actualSourceMatchedPhysicalReadings===0&&
  a.materialValueIsNotLotCertificate===true&&a.wireHeatingNotTemperatureRise===true&&
  a.electricalContactFaultRateUnknown===true&&
  a.physicalValidation==='none'&&a.physicalVerdict==='unknown'&&
  a.realWorldBuildSuccessPercent===null,
  'Invented source-matched wire, resistance measurement or thermal ampacity');
 return true;
}
export function gaugeCrossSectionSquareM(awg){
 fail(Number.isInteger(awg)&&awg>=0&&awg<=40,'Unsupported AWG');
 const diameterMM=0.127*Math.pow(92,(36-awg)/39);
 const areaM2=Math.PI*Math.pow(diameterMM*1e-3,2)/4;
 return areaM2;
}
export function evaluateWireLoop(a,candidate,{eachConductorLengthM,currentA,wireTemperatureC,
 contactResistancePerContactOhm}){
 verifyWireAssumptions(a,candidate);
 const input={eachConductorLengthM,currentA,wireTemperatureC,contactResistancePerContactOhm};
 for(const [name,value] of Object.entries(input))
  fail(inRange(value,a.scenarioEnvelope[name]),'Out-of-range '+name+' invalidates scenario');
 const area=gaugeCrossSectionSquareM(24);
 const loopLengthM=2*eachConductorLengthM;
 const rho=a.referenceResistivityAt20C_OhmM*
  (1+a.resistivityTemperatureCoefficientPerC*(wireTemperatureC-20));
 fail(finite(rho)&&rho>0,'Nonphysical copper resistivity');
 const copperResistanceOhm=rho*loopLengthM/area;
 const contactsOhm=2*contactResistancePerContactOhm;
 const totalOhm=copperResistanceOhm+contactsOhm;
 return deepFreeze({
  format:'invention-lab/phase44-conditional-two-wire-loop/1',
  referenceDesignId:a.referenceDesignId,
  assumedInputs:{...input},areaSquareM:area,
  loopConductorLengthM:loopLengthM,
  hypotheticalCopperResistivityOhmM:rho,
  copperResistanceOhm,contactsSeriesResistanceOhm:contactsOhm,
  totalSeriesResistanceOhm:totalOhm,
  hypotheticalCopperVoltageDropV:currentA*copperResistanceOhm,
  hypotheticalTotalVoltageDropV:currentA*totalOhm,
  hypotheticalCopperJouleLossW:currentA*currentA*copperResistanceOhm,
  hypotheticalContactJouleLossW:currentA*currentA*contactsOhm,
  hypotheticalTotalJouleLossW:currentA*currentA*totalOhm,
  wireTemperatureRisePredictedC:null,
  actualCurrentCarryingCapacityA:null,
  realHarnessAndConnectorMeasurements:0,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 });
}
