// Phase47: audited *hypothetical* electrical/mechanical/thermal simulation.
// Midpoint electrical power and angular energy are balanced with no physical
// calibration of actual fan, battery pack, motor, shaft or thermal hardware.
import {verifyReferenceCandidate} from './phase41-hardware-readiness.js';
import {verifyBatteryAssumptions} from './phase43-battery-model.js';
import {verifyWireAssumptions,evaluateWireLoop} from './phase44-wire-loop.js';
import {verifyMotorAssumptions} from './phase45-motor-characterization.js';
import {verifyFanReference} from './phase46-fan-affinity.js';
export const FORMAT='invention-lab/phase47-conditional-coupled-electromechanical-thermal/1';
const ok=(c,msg)=>{if(!c)throw Error(msg);};
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>{if(v&&typeof v==='object'){for(const child of Object.values(v))freeze(child);Object.freeze(v);}return v;};
const EXPECTED_IDS=['phase43-E91-two-cell-nominal-ohmic-sensitivity','phase44-AWG24-copper-loop-with-assumed-contacts',
'phase45-Pololu1592-manufacturer-3V-endpoints','phase46-same-fan-affinity-ratios'];
export function verifyCoupledHypotheses(p,{candidate,battery,wire,motor,fan}){
 verifyReferenceCandidate(candidate);
 verifyBatteryAssumptions(battery,candidate);
 verifyWireAssumptions(wire,candidate);
 verifyMotorAssumptions(motor,candidate);
 verifyFanReference(fan,candidate);
 ok(p?.format===FORMAT&&p.referenceDesignId===candidate.designId&&
  eq(p.sourceModelIds,EXPECTED_IDS)&&
  p.sourceHypothesis==='ideal-linear-brushed-motor-and-static-Thevenin-plus-quadratic-aerodynamic-load',
  'Source model chain or physics was substituted');
 ok(p.assumedPackIdealOpenCircuitV===3&&p.assumedBatterySeriesResistanceOhm===.45&&
  p.assumedMotorEffectiveResistanceOhm===.75&&
  p.assumedWireLengthEachM===.25&&p.assumedWireTemperatureC===20&&
  p.assumedContactResistanceEachOhm===.01&&
  p.motorNoLoadRpmManufacturerApprox===20000&&
  p.motorNoLoadCurrentAManufacturerApprox===.35&&
  p.motorStallCurrentAManufacturerApprox===4&&
  p.motorStallTorqueGFcmManufacturerApprox===55,
  'Manufacturer illustrative source or assumed impedances changed');
 ok(p.electromechanicalSIKEqualityAssumed===true&&
  p.rotorAndFanCombinedInertiaKgM2===2e-6&&
  p.rotatingViscousFrictionTorqueModel==='assumed-constant-running-friction-equal-ke-times-350mA'&&
  p.fanTorqueCoefficientNmPerRadPerS_SquaredHypothesis===1e-9&&
  eq(p.fanTorqueCoefficientRangeHypothesis,[0,1e-9])&&
  p.motorThermalCapacitanceJPerK===10&&p.motorThermalResistanceKPerW===20&&
  p.ambientTemperatureC===21&&p.initialRotorSpeedRadS===0&&
  p.initialMotorTemperatureC===21&&p.timeStepS===.005&&p.totalSimulatedDurationS===2&&
  p.exactMechanicalPowerIdentityRequired===true&&
  p.numericalMethod==='implicit-midpoint-mechanical-and-thermal-stepping-with-positive-current-only-no-regeneration',
  'Arbitrary illustrative coefficients or numerical method changed');
 for(const key of [
 'measuredMotorArmatureInductanceH','verifiedMotorKT_NmPerA','verifiedMotorKE_VsPerRad',
 'measuredRotorFanInertiaKgM2','measuredFanTorqueCoefficient',
 'measuredThermalCapacitanceJPerK','measuredThermalResistanceKPerW'
 ])ok(p[key]===null,'Unmeasured physical parameter forged: '+key);
 ok(p.externalFanTorqueCalibrationExists===false&&
  p.independentlyCalibratedWholeSystemSpecimens===0&&
  p.physicalFanBuildSafeToRun===false&&p.physicalValidation==='none'&&
  p.physicalVerdict==='unknown'&&p.realWorldBuildSuccessPercent===null,
  'Source model results must not certify an unbuilt device');
 return true;
}
export function deriveMotorSIFromPublishedPoints(p){
 const omegaNoLoad=p.motorNoLoadRpmManufacturerApprox*Math.PI/30;
 const ke=(p.assumedPackIdealOpenCircuitV -
   p.assumedMotorEffectiveResistanceOhm*p.motorNoLoadCurrentAManufacturerApprox)/omegaNoLoad;
 const kt=ke; // ideal SI energy conversion hypothesis, not measured.
 const stallGrossTorque=kt*p.motorStallCurrentAManufacturerApprox;
 const constantFrictionTorque=kt*p.motorNoLoadCurrentAManufacturerApprox;
 const stallNetTorqueHypothesis=stallGrossTorque-constantFrictionTorque;
 const publishedStallNm=p.motorStallTorqueGFcmManufacturerApprox*9.80665e-5;
 return freeze({omegaNoLoadReferenceRadS:omegaNoLoad,
  assumedKeVoltsPerRadPerSecond:ke,assumedKtNmPerA:kt,
  assumedConstantRunningFrictionTorqueNm:constantFrictionTorque,
  approximatePublishedStallTorqueNm:publishedStallNm,
  hypotheticalNetStallTorqueNm:stallNetTorqueHypothesis,
  mismatchAgainstManufacturerNetStallTorquePercent:
   100*(stallNetTorqueHypothesis-publishedStallNm)/publishedStallNm,
  manufacturerEndpointMismatchIsUncalibrated:true});
}
export function simulateCoupledHypothesis(p,models,{
 fanTorqueCoefficientNmPerRadPerS_Squared=p.fanTorqueCoefficientNmPerRadPerS_SquaredHypothesis,
 batteryInternalResistanceOhm=p.assumedBatterySeriesResistanceOhm
}={}){
 verifyCoupledHypotheses(p,models);
 const fanC=fanTorqueCoefficientNmPerRadPerS_Squared,batteryR=batteryInternalResistanceOhm;
 ok(finite(fanC)&&fanC>=0&&fanC<=1e-9,
  'Fan torque coefficient is illustrative only and must remain within frozen range');
 ok(finite(batteryR)&&batteryR>=.3&&batteryR<=.6,
  'Battery resistance is illustrative only and must remain within published typical range');
 const motor=deriveMotorSIFromPublishedPoints(p);
 const wire=evaluateWireLoop(models.wire,models.candidate,{
  eachConductorLengthM:p.assumedWireLengthEachM,
  wireTemperatureC:p.assumedWireTemperatureC,
  contactResistancePerContactOhm:p.assumedContactResistanceEachOhm,currentA:0});
 const Rwire=wire.totalSeriesResistanceOhm,Rmotor=p.assumedMotorEffectiveResistanceOhm;
 const Rsum=Rmotor+Rwire+batteryR;
 const vs=p.assumedPackIdealOpenCircuitV,J=p.rotorAndFanCombinedInertiaKgM2;
 const k=motor.assumedKeVoltsPerRadPerSecond;
 const friction=motor.assumedConstantRunningFrictionTorqueNm;
 const dt=p.timeStepS,steps=Math.round(p.totalSimulatedDurationS/dt);
 ok(steps>0&&steps<=10000&&Math.abs(steps*dt-p.totalSimulatedDurationS)<1e-10,
  'Model cannot resolve exact numerical horizon');
 const cth=p.motorThermalCapacitanceJPerK,rth=p.motorThermalResistanceKPerW,Tamb=p.ambientTemperatureC;
 let omega=p.initialRotorSpeedRadS,T=p.initialMotorTemperatureC;
 const energy={electricalSourceJ:0,batteryDissipationJ:0,wireAndContactDissipationJ:0,
 motorOhmicDissipationJ:0,motorRunningFrictionHeatJ:0,
 fanShaftAerodynamicWorkJ:0,ambientTransferredMotorHeatJ:0};
 let peakI=0,maxMotorTemp=T,maxInstantResidual=0;
 const currentAt=x=>Math.max(0,(vs-k*x)/Rsum);
 for(let step=0;step<steps;step++){
  const residual=newOmega=>{
   const mid=(omega+newOmega)/2;
   const I=currentAt(mid),Tfan=fanC*mid**2;
   return newOmega-omega-(dt/J)*(k*I-friction-Tfan);
  };
  let newOmega;
  if(residual(0)>=0){newOmega=0;}
  else{
   let lo=0,hi=Math.max(omega+1,vs/k+1);
   ok(residual(hi)>=0,'Cannot bracket implicit mechanical solve');
   for(let it=0;it<62;it++){
    const mid=(lo+hi)/2;
    if(residual(mid)>0)hi=mid;else lo=mid;
   }
   newOmega=(lo+hi)/2;
  }
  const omegaMid=(omega+newOmega)/2;
  const I=currentAt(omegaMid);
  const batteryW=I*I*batteryR,wireW=I*I*Rwire,motorW=I*I*Rmotor;
  const frictionW=friction*omegaMid,fanW=fanC*omegaMid**3;
  const motorHeatW=motorW+frictionW;
  const heatRate=1/(cth*rth),g=dt/(2*cth*rth);
  const nextT=(T*(1-g)+(dt/cth)*(motorHeatW+Tamb/rth))/(1+g);
  const avgT=(T+nextT)/2;
  const transferredW=(avgT-Tamb)/rth;
  const ein=vs*I*dt;
  const eb=batteryW*dt,ew=wireW*dt,em=motorW*dt,ef=frictionW*dt,ea=fanW*dt;
  const dkin=.5*J*(newOmega**2-omega**2);
  const thermalDelta=cth*(nextT-T);
  const stepResidual=ein-eb-ew-em-ef-ea-dkin;
  const thermalResidual=thermalDelta-(motorHeatW-transferredW)*dt;
  ok(Number.isFinite(stepResidual)&&Number.isFinite(thermalResidual)&&
   Math.abs(stepResidual)<1e-8&&Math.abs(thermalResidual)<1e-8,
   'Implicit energy conservation error exceeds numerical tolerance');
  maxInstantResidual=Math.max(maxInstantResidual,Math.abs(stepResidual),Math.abs(thermalResidual));
  energy.electricalSourceJ+=ein;energy.batteryDissipationJ+=eb;
  energy.wireAndContactDissipationJ+=ew;energy.motorOhmicDissipationJ+=em;
  energy.motorRunningFrictionHeatJ+=ef;energy.fanShaftAerodynamicWorkJ+=ea;
  energy.ambientTransferredMotorHeatJ+=transferredW*dt;
  omega=newOmega;T=nextT;
  peakI=Math.max(peakI,I);maxMotorTemp=Math.max(maxMotorTemp,T);
 }
 const dkin=.5*J*(omega**2-p.initialRotorSpeedRadS**2);
 const dthermal=cth*(T-p.initialMotorTemperatureC);
 const energyFinalResidual=energy.electricalSourceJ-
  (energy.batteryDissipationJ+energy.wireAndContactDissipationJ+
  energy.fanShaftAerodynamicWorkJ+energy.ambientTransferredMotorHeatJ+dkin+dthermal);
 ok(Math.abs(energyFinalResidual)<1e-7,'Full electrical/mechanical/thermal energy did not balance');
 return freeze({
  format:'invention-lab/phase47-coupled-midpoint-conditional-evaluation/1',
  assumedFanTorqueCoefficientNmPerRadPerS_Squared:fanC,
  assumedBatteryInternalResistanceOhm:batteryR,
  nominalPackSourceVoltageHypothesisV:vs,assumedHarnessResistanceOhm:Rwire,
  manufacturerMotorConsistency:motor,
  finalShaftAngularSpeedRadS:omega,
  finalShaftRpm:omega*30/Math.PI,
  finalMotorTemperatureC:T,peakCurrentHypothesisA:peakI,
  maxMotorTemperatureHypothesisC:maxMotorTemp,steps,dt,
  allEnergyTermsJ:energy,finalKineticEnergyGainJ:dkin,
  finalMotorThermalEnergyGainJ:dthermal,maximumPerStepEnergyResidualJ:maxInstantResidual,
  fullEnergyBalanceResidualJ:energyFinalResidual,
  predictedActualFanAirflowM3s:null,
  actualImpellerMaximumPermittedRpm:null,
  actualBatteryDynamicDischargeCalibration:false,
  motorSourceEndpointMismatchMeansNotCalibrated:true,
  thermalPropertiesAreIllustrative:true,
  calibratedAgainstSourceMatchedPhysicalSystem:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 });
}
