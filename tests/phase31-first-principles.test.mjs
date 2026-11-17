import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SUBSYSTEMS,predictFan,evaluateFirstPrinciples,fanIllustrativeScenario,MOTOR_MODEL}
 from '../js/evidence/phase31-first-principles.js';
const p={
 voltageV:3,sourceResistanceOhm:0.25,wireResistanceOhm:0.15,
 motorResistanceOhm:5,motorConstantSI:0.012,
 staticFrictionTorqueNm:0.0006,runningFrictionTorqueNm:0.0004,
 dragCoefficientNmPerRad2:2e-7
};
const parameters=Object.entries(p).map(([name,mean])=>({name,mean,sd:0}));
const assumptions=['Illustrative model only; parameters and faults are not empirical hardware observations'];
const criteria=[{metric:'started',min:1},{metric:'speedRpm',min:800},{metric:'motorCurrentA',max:1}];
const cfg={
 designId:'synthetic-unit-test-DC-fan',intendedUse:'Battery + two wires + DC motor fan',
 parameters,independenceAsserted:true,
 model:predictFan,constraints:criteria,assumptions,seed:31,samples:120
};
test('First-principles decomposition lists battery, wires, motor, fan, integration and qualification',()=>{
 assert.deepEqual(SUBSYSTEMS.map(x=>x.id),['battery','wires','motor','fan','integration','qualification']);
 assert.ok(SUBSYSTEMS.every(x=>x.law&&x.missing));
});
test('Ideal motor energy conservation uses Kt=Ke in SI: source = losses + mechanical',()=>{
 const x=predictFan(p),I=x.motorCurrentA,w=x.speedRadPerS;
 assert.equal(x.motorModel,MOTOR_MODEL);
 assert.equal(x.started,1);
 assert.ok(x.speedRpm>850&&x.speedRpm<1400);
 assert.ok(x.motorCurrentA>0&&x.motorCurrentA<x.stallCurrentA);
 assert.ok(Math.abs(x.electricalSourcePowerW-x.totalCopperLossW-x.electromechanicalOutputW)<1e-9);
 assert.ok(Math.abs(x.electromechanicalOutputW-
   (p.runningFrictionTorqueNm+p.dragCoefficientNmPerRad2*w*w)*w)<1e-9);
 assert.ok(Math.abs(x.motorVoltageV-(p.motorConstantSI*w+p.motorResistanceOhm*I))<1e-9);
});
test('Higher source resistance or mechanical drag predicts slower fan, with physical constraints',()=>{
 const base=predictFan(p);
 const hardWires=predictFan({...p,wireResistanceOhm:2});
 const drag=predictFan({...p,dragCoefficientNmPerRad2:1e-6});
 assert.ok(hardWires.speedRpm<base.speedRpm);
 assert.ok(drag.speedRpm<base.speedRpm);
 assert.equal(hardWires.designValidatedByPhysicalTest,false);
});
test('Static friction can stall fan even if ideal wires and battery are connected',()=>{
 const x=predictFan({...p,staticFrictionTorqueNm:1});
 assert.equal(x.started,0);
 assert.equal(x.speedRpm,0);
 assert.ok(x.stallCurrentA>0);
 assert.equal(x.electromechanicalOutputW,0);
});
test('Running torque can independently prevent motion despite positive static torque',()=>{
 const x=predictFan({...p,runningFrictionTorqueNm:1});
 assert.equal(x.started,0);
 assert.equal(x.speedRadPerS,0);
});
test('Negative or incomplete electrical/motor parameters fail closed, do not silently pass',()=>{
 for(const [key,val] of [
  ['voltageV',0],['voltageV',-1],['motorResistanceOhm',0],
  ['motorConstantSI',0],['wireResistanceOhm',-1],
  ['staticFrictionTorqueNm',NaN],['dragCoefficientNmPerRad2',Infinity]
 ]){
  assert.throws(()=>predictFan({...p,[key]:val}),/Nonphysical/);
 }
 const q={...p};delete q.motorConstantSI;assert.throws(()=>predictFan(q),/Nonphysical/);
});
test('No-variation conditional model pass may be exactly 100%, but physical success remains unknown',()=>{
 const x=evaluateFirstPrinciples(cfg);
 assert.equal(x.status,'model-only');
 assert.equal(x.conditionalModeledSuccessPercent,100);
 assert.ok(x.conditionalMonteCarloInterval95Percent[0]<100);
 assert.equal(x.conditionalWorstCaseModeledSuccessPercent,null);
 assert.equal(x.empiricalManufacturingYieldEstimate,null);
 assert.equal(x.realWorldBuildSuccessPercent,null);
 assert.equal(x.physicalVerdict,'unknown');
 assert.equal(x.theseArePhysicalSuccessProbabilities,false);
});
test('Parameter variation creates a deterministic seeded conditional success fraction',()=>{
 const params=parameters.map(x=>x.name==='voltageV'?{...x,sd:0.65}:x);
 const a=evaluateFirstPrinciples({...cfg,parameters:params,samples:2000});
 const b=evaluateFirstPrinciples({...cfg,parameters:params,samples:2000});
 assert.deepEqual(a,b);
 assert.equal(a.status,'model-only');
 assert.ok(a.conditionalModeledSuccessPercent>0&&a.conditionalModeledSuccessPercent<100);
 assert.equal(a.realWorldBuildSuccessPercent,null);
});
test('An assumed model discrepancy gives pessimistic and optimistic model percentages only',()=>{
 const x=evaluateFirstPrinciples({
  ...cfg,parameters:parameters.map(z=>z.name==='voltageV'?{...z,sd:0.2}:z),
  samples:1400,
  discrepancyBounds:{started:0,speedRpm:175,motorCurrentA:0.1},
  discrepancyBasis:'explicit-hypothesis'
 });
 assert.equal(x.status,'model-only');
 assert.ok(x.conditionalWorstCaseModeledSuccessPercent<=x.conditionalModeledSuccessPercent);
 assert.ok(x.conditionalBestCaseModeledSuccessPercent>=x.conditionalModeledSuccessPercent);
 assert.ok(x.disagreementFractionFromUncertainModelPercent>=0);
 assert.equal(x.measuredDeviceSpecificErrorBound,null);
 assert.equal(x.externalValidationEnvelope,null);
 assert.equal(x.physicalValidation,'none');
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Conservative bounded output checks both sides of a two-sided acceptance interval',()=>{
 const x=evaluateFirstPrinciples({...cfg,
  constraints:[{metric:'speedRpm',min:500,max:1800}],
  discrepancyBounds:{speedRpm:400},discrepancyBasis:'explicit-hypothesis'
 });
 assert.equal(x.conditionalModeledSuccessPercent,100);
 assert.equal(x.conditionalWorstCaseModeledSuccessPercent,100);
 assert.equal(x.conditionalBestCaseModeledSuccessPercent,100);
});
test('False calibrated model discrepancy declaration cannot become physical validation',()=>{
 const x=evaluateFirstPrinciples({...cfg,
  discrepancyBounds:{started:0,speedRpm:0,motorCurrentA:0},
  discrepancyBasis:'source-referenced-but-not-independently-audited'
 });
 assert.equal(x.physicalVerdict,'unknown');
 assert.equal(x.conditionalModeledSuccessPercent,100);
 assert.equal(x.conditionalWorstCaseModeledSuccessPercent,100);
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Missing or fraudulent discrepancy bases and negative allowances are rejected',()=>{
 for(const extras of [
  {discrepancyBounds:{started:0,speedRpm:0,motorCurrentA:0}},
  {discrepancyBasis:'physically-proven'},
  {discrepancyBasis:'physically-proven',discrepancyBounds:{started:0,speedRpm:0,motorCurrentA:0}},
  {discrepancyBounds:{started:0,speedRpm:-10,motorCurrentA:0},discrepancyBasis:'explicit-hypothesis'},
  {discrepancyBounds:{started:0,speedRpm:0},discrepancyBasis:'explicit-hypothesis'}
 ]){
  assert.throws(()=>evaluateFirstPrinciples({...cfg,...extras}),/basis|allowance|requires|discrepancy/i);
 }
});
test('Model errors and invalid samples are inconclusive, not evidence of failed hardware',()=>{
 const a=evaluateFirstPrinciples({...cfg,parameters:parameters.map(z=>z.name==='motorResistanceOhm'?{...z,mean:0,sd:0.1}:z)});
 assert.equal(a.status,'inconclusive');
 assert.ok(a.modelEvaluationErrors>0);
 assert.equal(a.conditionalModeledSuccessPercent,null);
 assert.equal(a.realWorldBuildSuccessPercent,null);
});
test('Gaussian covariance/independence must be explicit and realistic: missing distribution fails',()=>{
 assert.throws(()=>evaluateFirstPrinciples({...cfg,independenceAsserted:false}),/independence/);
 assert.throws(()=>evaluateFirstPrinciples({...cfg,parameters:parameters.slice(0,1)}),/Nonphysical|missing/);
 assert.throws(()=>evaluateFirstPrinciples({...cfg,constraints:[]}),/criteria/);
});
test('Educational fan example is clearly separated from the active diagram, not an empirical rate',()=>{
 const x=fanIllustrativeScenario({samples:750,voltageStdPercent:5,minRpm:900});
 assert.equal(x.status,'model-only');
 assert.ok(x.illustrativeNominal.started===1);
 assert.ok(x.conditionalModeledSuccessPercent>=0&&x.conditionalModeledSuccessPercent<=100);
 assert.equal(x.exemplar,'user-requested-battery-two-wires-fan');
 assert.equal(x.fanSubtype,'ideal brushed-DC analog only, not BLDC');
 assert.equal(x.realWorldBuildSuccessPercent,null);
 assert.equal(x.physicalVerdict,'unknown');
 assert.equal(x.hypotheticalRPMDiscrepancyNotMeasured,false);
});
test('Optional hypothetical RPM discrepancy is not a certified hardware accuracy budget',()=>{
 const x=fanIllustrativeScenario({samples:450,rpmDiscrepancyAllowance:120});
 assert.equal(x.hypotheticalRPMDiscrepancyNotMeasured,true);
 assert.equal(x.discrepancyBoundBasis,'explicit-hypothesis');
 assert.ok(x.conditionalWorstCaseModeledSuccessPercent<=x.conditionalModeledSuccessPercent);
 assert.equal(x.realWorldBuildSuccessPercent,null);
 for(const bad of [-1,NaN])assert.throws(()=>fanIllustrativeScenario({rpmDiscrepancyAllowance:bad}),/Invalid/);
});
