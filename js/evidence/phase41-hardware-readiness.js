// Phase 41 — published-part candidate assessment, not a real assembled or qualified device.
// All original manufacturer ratings are TYPICAL and not physical sample observations.
export const FORMAT='invention-lab/phase41-reference-hardware-readiness/1';
const clone=x=>structuredClone(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};

export function verifyReferenceCandidate(input){
 const c=clone(input);
 assert(c?.format===FORMAT&&
  c.designId==='reference-3v-battery-2-wire-brushed-fan-candidate-001'&&
  c.status==='CANDIDATE_NOT_FROZEN_NOT_PURCHASED_NOT_BUILT'&&
  c.referencePartSelectionNotConfirmed===true,'Source candidate was silently promoted to physical assembly');
 const m=c.motor,b=c.battery,w=c.conductors,f=c.fan;
 assert(m?.id==='pololu-1592'&&m.partNumber==='1592'&&
  m.type==='brushed-DC-motor'&&m.listingStatus==='discontinued'&&
  m.manufacturerSpecsUrl==='https://www.pololu.com/product/1592/specs'&&
  m.publishedApproximateAt3V?.noLoadRpm===20000&&
  m.publishedApproximateAt3V?.noLoadCurrentA===0.35&&
  m.publishedApproximateAt3V?.stallCurrentA===4&&
  m.publishedApproximateAt3V?.stallTorqueGfCm===55&&
  m.publishedApproximateAt3V?.shaftDiameterMm===2&&
  m.recommendedSupplyVoltageV?.min===1.5&&
  m.recommendedSupplyVoltageV?.max===3&&
  m.actualSpecimenId===null&&m.actualLot===null&&
  m.originalIndependentlyMeasuredDataCount===0&&
  m.publishedValuesAreTypicalNotDeviceCalibration===true,
  'Altered motor part/rating, discontinued status or unverified original motor measurements');
 assert(b?.id==='energizer-e91'&&b.manufacturer==='Energizer'&&
  b.partNumber==='E91'&&b.chemistry==='alkaline-Zn-MnO2'&&
  b.nominalCellVoltageV===1.5&&b.seriesCount===2&&
  b.nominalPackVoltageV===3&&
  b.freshCellInternalResistanceOhm?.min===0.15&&
  b.freshCellInternalResistanceOhm?.max===0.30&&
  b.publishedOperatingTemperatureC?.min===-18&&
  b.publishedOperatingTemperatureC?.max===55&&
  b.dataSheetUrl==='https://energizer.com/apac/australia/wp-content/uploads/sites/3/2024/05/e91_max_na_AA.pdf'&&
  Array.isArray(b.actualSpecimenIds)&&b.actualSpecimenIds.length===0&&
  b.actualLot===null&&b.measuredPackOpenCircuitVoltageV===null&&
  b.measuredPackDynamicImpedanceOhm===null,
  'Battery source-part identity or physical pack readings falsely changed');
 assert(w?.count===2&&w.proposedCopperAWG===24&&w.conductorLengthM===null&&
  w.wireManufacturerPartNumber===null&&w.connectorPartNumber===null&&
  w.contactResistanceOhm===null&&w.measuredHarnessResistanceOhm===null,
  'Wire geometry, contact resistance or manufacturer falsely marked physically fixed');
 assert(f&&f.partNumber===null&&f.manufacturer===null&&
  f.impellerDiameterMm===null&&f.maximumCertifiedMechanicalRpm===null&&
  f.maximumQualifiedSpeedRpm===null&&f.actualFanSpecimenId===null&&
  f.shaftFitVerified===false&&f.bladeRetentionVerified===false&&
  f.guardOrEnclosureQualified===false&&f.dynamicBalanceVerified===false&&
  f.pressureFlowCurveMeasured===false&&f.torqueSpeedCurveMeasured===false,
  'Unverified impeller or rotating-mechanics safety gate falsely claimed');
 assert(c.supplyAndProtection?.faultCurrentLimitingQualified===false&&
  c.supplyAndProtection?.continuousAndTransientCurrentCapacityIndependentlyVerified===false&&
  c.supplyAndProtection?.shaftContainmentOrSafetyAssessmentApproved===false,
  'Current and high-speed mechanical safety is not qualified');
 assert(c.operatingEnvelope?.qualifiedPhysicalEnvelope===null&&
  c.actualPhysicalFanMeasurements===0&&c.modelTransferredFrom24VBLDC===false&&
  c.physicalValidation==='none'&&c.physicalVerdict==='unknown'&&
  c.realWorldBuildSuccessPercent===null,
  'Missing target physical experiments were fabricated');
 return true;
}

export function assessReferenceCandidate(input){
 verifyReferenceCandidate(input);
 const c=clone(input), motor=c.motor.publishedApproximateAt3V;
 const ri=c.battery.freshCellInternalResistanceOhm;
 const hypotheticalDrop={
  lowV:c.battery.seriesCount*ri.min*motor.stallCurrentA,
  highV:c.battery.seriesCount*ri.max*motor.stallCurrentA
 };
 const terminal={
  lowerV:c.battery.nominalPackVoltageV-hypotheticalDrop.highV,
  upperV:c.battery.nominalPackVoltageV-hypotheticalDrop.lowV
 };
 const blocks=[
 'Selected Pololu 1592 motor is discontinued and actual specimen/lot unconfirmed',
 'Fan manufacturer/part, maximum certified speed, shaft fitting and containment not verified',
 'Battery pack impedance, dynamic current capacity and fault protection not validated for possible inrush or stall',
 'Real wire length, exact wire/connector part, contact resistance and insulation rating not recorded',
 'Physical assembly temperature, current, RPM, exposure and calibration conditions not specified',
 'Zero source-matched physical assembly measurements; all fan/impeller aerodynamic curves unknown'
 ];
 return freeze({
  format:'invention-lab/phase41-source-qualified-hardware-readiness/1',
  designId:c.designId,selectedResearchParts:['Energizer E91 two series cells','Pololu 1592 discontinued brushed DC motor'],
  actualAssembledDeviceExistsInEvidence:false,originalHardwareBOMFrozen:false,
  safeToBuildOrSpin:false,requiresMechanicalContainmentReview:true,
  blockers:blocks,readiness:'BLOCKED_HARDWARE_AND_MEASUREMENT_EVIDENCE',
  publishedMotorNoLoadRpmAt3V:motor.noLoadRpm,
  publishedMotorStallCurrentAAt3V:motor.stallCurrentA,
  packNominalVoltageV:c.battery.nominalPackVoltageV,
  assumedFreshCellsConstantInternalResistanceOhm:{
    min:c.battery.seriesCount*ri.min,max:c.battery.seriesCount*ri.max
  },
  mathematicalSensitivityOnly:{
    hypotheticalAtPublishedMotorStallCurrentA:motor.stallCurrentA,
    uncorrectedOhmicVoltageDropV:hypotheticalDrop,
    naivePackTerminalVoltageV:terminal,
    actualAtStallPredictionPermitted:false,
    note:'Simplified constant internal resistance with published 4A motor stall current is a counterfactual voltage-drop sensitivity calculation, not a feasible 4A current prediction with two real cells. Cell voltage sag, electrochemistry and motor current interact.'
  },
  physicallyMeasuredSpecimenCount:0,
  physicallyMeasuredFanAssemblySampleCount:0,
  realWorldBuildSuccessPercent:null,physicalValidation:'none',physicalVerdict:'unknown'
 });
}
export function inspectFutureAssemblyMetadata(proposal){
 assert(proposal&&typeof proposal==='object','Assembly information is missing');
 const required=['batteryCell1SpecimenId','batteryCell2SpecimenId','batteryLot',
  'motorActualPartNumber','motorSpecimenId','motorLot',
  'wirePartNumber','wireLengthM','connectorPartNumber',
  'impellerPartNumber','impellerSpecimenId','manufacturerRatedMaxRpm',
  'shaftFitReviewRecord','enclosureReviewRecord','currentProtectionReviewRecord',
  'instrumentCalibrationReviewRecord'];
 const missing=[];
 for(const key of required){
  const v=proposal[key];
  if(v===undefined||v===null||v===''||
    (typeof v==='number'&&(!finite(v)||v<=0)))missing.push(key);
 }
 const problems=[];
 if(proposal.motorActualPartNumber==='1592')problems.push('Discontinued motor availability and purchased unit provenance must be confirmed');
 if(proposal.motorActualPartNumber&&proposal.motorActualPartNumber!=='1592')
  problems.push('Different motor requires a NEW model passport and manufacturer values');
 if(finite(proposal.manufacturerRatedMaxRpm)&&proposal.manufacturerRatedMaxRpm<=0)
  problems.push('Nonpositive impeller speed limit');
 return freeze({
  format:'invention-lab/phase41-actual-assembly-documentation-check/1',
  requiredFields:required.length,missingFields:missing,issues:problems,
  readyForIndependentSafetyReview:missing.length===0&&problems.length===0,
  physicalTestingAuthorized:false,physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 });
}
