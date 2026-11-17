// Phase43: nominal two-E91 cell DC source and conditional voltage-sag
// sensitivity. No measured SOC, chemistry dynamics or instrument calibration.
import {verifyReferenceCandidate} from './phase41-hardware-readiness.js';
import {inspectCaptureImport} from '../measure/phase42-capture-gate.js';
export const BATTERY_FORMAT='invention-lab/phase43-e91-conditional-battery-model/1';
const fail=(p,msg)=>{if(!p)throw Error(msg);};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function deepFreeze(value){
 if(value&&typeof value==='object'){
  for(const x of Object.values(value))deepFreeze(x);
  Object.freeze(value);
 }
 return value;
}
export function verifyBatteryAssumptions(raw,candidate){
 verifyReferenceCandidate(candidate);
 const a=structuredClone(raw),b=candidate.battery;
 fail(a?.format===BATTERY_FORMAT&&
  a.referenceDesignId===candidate.designId&&
  a.modelType==='nominal-voltage-series-ohmic-sensitivity-not-OCV-SOC-thermal-model',
  'Battery hypothesis scope changed');
 fail(a.manufacturerPart==='E91'&&a.manufacturer==='Energizer'&&
  a.cellChemistry==='alkaline-Zn-MnO2'&&a.cellCountInSeries===2&&
  a.publishedNominalCellVoltageV===1.5&&
  same(a.publishedFreshCellInternalResistanceRangeOhm,[0.15,0.30])&&
  a.manufacturerDatasourceUrl===b.dataSheetUrl&&
  same(a.publishedOperatingTemperatureRangeC,[-18,55])&&
  a.simulationReferenceTemperatureC===21&&
  same(a.scenarioCurrentRangeA,[0,4]),
  'Original published E91 typical battery parameters were widened or replaced');
 fail(a.referenceManufacturerDataNature==='typical-published-specification-not-digital-raw-discharge-curves'&&
  a.currentLimitIsHypothesisOnly===true&&
  a.nominalCellVoltageIsNotMeasuredOpenCircuitVoltage===true&&
  a.freshCellResistanceNotGuaranteedAcrossCurrentTemperatureAge===true,
  'Typical manufacturer ratings were falsely promoted to source-matched tests');
 const e=a.experimentalCalibrationInputs;
 fail(e&&same(e.actualBatteryPackSerials,[])&&e.calibratedOpenCircuitV===null&&
  e.calibratedDynamicResistanceOhm===null&&e.SOC_OCV_curve===null&&
  e.temperatureResistanceSurface===null&&e.capacityVsLoad===null&&
  e.measuredCurrentWaveforms===0&&e.independentCalibrationReport===null&&
  a.batteryAgingModelQualified===false&&a.runtimePredictionCertified===false&&
  a.modelPopulationCalibrationVerified===false&&a.physicalSampleCount===0&&
  a.physicalValidation==='none'&&a.physicalVerdict==='unknown'&&
  a.realWorldBuildSuccessPercent===null,
  'Unmeasured battery test, aging result or manufactured success was invented');
 return true;
}
export function evaluateBatteryScenario(assumptions,candidate,{assumedCurrentA,ambientTemperatureC=21}){
 verifyBatteryAssumptions(assumptions,candidate);
 fail(finite(assumedCurrentA)&&assumedCurrentA>=0&&assumedCurrentA<=4,
  'Scenario current must be finite and inside the explicit hypothetical [0,4] A range');
 fail(finite(ambientTemperatureC)&&ambientTemperatureC>=-18&&
  ambientTemperatureC<=55,
  'Temperature outside published manufacturer operating ratings');
 const low=2*0.15,high=2*0.30;
 const nominal=2*1.5;
 const minV=nominal-assumedCurrentA*high;
 const maxV=nominal-assumedCurrentA*low;
 const bounds={
  scenarioNominalPackVoltageV:nominal,
  assumedConstantFreshCellSeriesResistanceOhm:{min:low,max:high},
  counterfactualVoltageDropV:{min:assumedCurrentA*low,max:assumedCurrentA*high},
  counterfactualTerminalVoltageV:{min:minV,max:maxV},
  counterfactualBatteryInternalLossW:{
   min:assumedCurrentA**2*low,max:assumedCurrentA**2*high
  },
  counterfactualElectricalTerminalPowerW:{
   min:assumedCurrentA*minV,max:assumedCurrentA*maxV
  }
 };
 return deepFreeze({
  format:'invention-lab/phase43-e91-conditional-voltage-sag/1',
  referenceDesignId:assumptions.referenceDesignId,
  assumedCurrentA,assumedAmbientTemperatureC:ambientTemperatureC,
  scientificStatus:'CONDITIONAL_DC_OHMIC_SENSITIVITY_ONLY',
  predictionsAreConditionalOnActualCurrent:false,
  isActualBatteryCurrentPrediction:false,
  canInferFeasibleBatteryPackCurrent:false,
  canInferRuntimeOrAging:false,
  referenceTemperatureNotBatteryTemperatureMeasurement:true,
  ...bounds,
  physicalModelCalibrated:false,
  realWorldBuildSuccessPercent:null,physicalValidation:'none',physicalVerdict:'unknown'
 });
}
export function inspectBatteryCapture(assumptions,candidate,protocol,rawCSV,metadata){
 verifyBatteryAssumptions(assumptions,candidate);
 const check=inspectCaptureImport(protocol,rawCSV,metadata);
 fail(protocol.referenceDesignId===assumptions.referenceDesignId,
  'Battery experiment design does not match physical capture protocol');
 return deepFreeze({
  format:'invention-lab/phase43-quarantined-battery-curve-review/1',
  submission:check,
  batteryModelUpdated:false,
  certifiedBatteryDataPointsAccepted:0,
  estimatedSOC:null,learnedOCVSurface:null,learnedCurrentCapacity:null,
  independentlyQualifiedBatterySpecimens:0,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 });
}
