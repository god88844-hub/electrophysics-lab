#!/usr/bin/env python3
"""Independent Python RK4 whole-system numeric check against JS midpoint.
This uses no JavaScript model internals or JavaScript integrator. Physics is an
unmeasured conditional toy model; source hardware physical evidence remains zero.
"""
import copy
import hashlib
import json
import math
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE_FILES = [
 "benchmarks/phase48/whole-system-readiness.json",
 "benchmarks/phase47/coupled-hypotheses.json",
 "benchmarks/phase41/reference-hardware-candidate.json",
 "benchmarks/phase42/physical-capture-protocol.json",
 "benchmarks/phase43/e91-assumptions.json",
 "benchmarks/phase44/copper-harness-assumptions.json",
 "benchmarks/phase45/pololu1592-endpoint-model.json",
 "benchmarks/phase46/fan-affinity-assumptions.json"
]
OUT = ROOT / "benchmarks/evidence/phase48/phase48-python-audit.json"

def require(ok, message):
    if not ok:
        raise ValueError(message)

def frozen_files():
    raw = {path:(ROOT/path).read_bytes() for path in SOURCE_FILES}
    return raw, {path:json.loads(b) for path,b in raw.items()}

def rk4_step(w,T,dt,derivative):
    a,b = derivative(w,T)
    c,d = derivative(w+a*dt/2,T+b*dt/2)
    e,f = derivative(w+c*dt/2,T+d*dt/2)
    g,h = derivative(w+e*dt,T+f*dt)
    return (w+dt*(a+2*c+2*e+g)/6,
            T+dt*(b+2*d+2*f+h)/6)

def independently_simulate(a,fan_coefficient,battery_R,wire_R,dt=0.0005):
    # Second, independently implemented numerical integrator and arithmetic.
    require(0 <= fan_coefficient <= 1e-9 and .3 <= battery_R <= .6,
            "Invalid physical-simulation hypothesis range")
    nominal_motor_R = 3/4
    omega_no_load = 20000*2*math.pi/60
    k = (3 - nominal_motor_R*.35)/omega_no_load
    friction_torque = .35*k
    inertia = 2e-6
    thermal_C,thermal_R = 10.,20.
    R = nominal_motor_R+wire_R+battery_R
    def derivative(w,t):
        current=max(0.,(3-k*w)/R)
        acceleration=(k*current-friction_torque-fan_coefficient*w*w)/inertia
        heat_in=current*current*nominal_motor_R+friction_torque*w
        heating=(heat_in-(t-21)/thermal_R)/thermal_C
        return acceleration,heating
    total_steps=round(a["totalSimulatedDurationS"]/dt)
    require(total_steps>0 and abs(total_steps*dt-a["totalSimulatedDurationS"])<1e-12,
            "Unstable source comparison horizon")
    w,T = 0.,21.
    for _ in range(total_steps):
        w,T=rk4_step(w,T,dt,derivative)
        require(math.isfinite(w) and math.isfinite(T) and w>=0,
                "Nonphysical independent numerical trajectory")
    return {"referenceRk4Rpm":w*30/math.pi,
            "referenceRk4MotorTempC":T,
            "independentTimeStepS":dt,
            "independentIntegrationSteps":total_steps}

def validate_report(report,raw,inputs):
    gate=inputs[SOURCE_FILES[0]]
    assumption=inputs[SOURCE_FILES[1]]
    require(gate["format"]=="invention-lab/phase48-whole-system-validation-readiness/1"
            and gate["scope"]=="independent-mathematical-replay-not-physical-assembly-validation",
            "Hardware validation gate scope changed")
    require(len(gate["requiredIndependentRealWorldGates"])==10 and
            all(x["physicalStatus"]=="missing" for x in gate["requiredIndependentRealWorldGates"]),
            "Genuine assembly evidence gap falsely cleared")
    require(gate["physicalPredictionInterval"] is None
            and gate["physicalBuildProbability"] is None
            and gate["originalPhysicalSamples"]==0
            and gate["independentPhysicalAssembledDeviceSpecimens"]==0
            and gate["actualPhysicalWholeSystemValidationComplete"] is False
            and gate["realWorldBuildSuccessPercent"] is None,
            "Unknown physical device falsely qualified")
    require(report["format"]=="invention-lab/phase48-multi-regime-conditional-source-replay/1",
            "Wrong numerical evidence format")
    head=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
    require(report["sourceCommit"]==head,"Replay source HEAD mismatched")
    require(sorted(report["sourceSHA256"])==sorted(raw),"Missing source manifest SHA")
    for path,bytes_ in raw.items():
        require(report["sourceSHA256"][path]==hashlib.sha256(bytes_).hexdigest(),
                "Original source bytes corrupted: "+path)
    require(report["referenceDesignId"]==gate["referenceDesignId"]
            and report["originalPhysicalFanSessions"]==0
            and report["originalPhysicalFanSamples"]==0
            and report["physicalUnseenDeviceHoldouts"]==0
            and report["physicallyVerifiedOperatingRegimes"]==0
            and report["actualPhysicalWholeSystemValidationComplete"] is False
            and report["independentModelPhysicallyCalibrated"] is False
            and report["numericalModelOnly"] is True
            and report["physicalValidation"]=="none"
            and report["physicalVerdict"]=="unknown"
            and report["realWorldBuildSuccessPercent"] is None,
            "Simulation improperly promoted to physical test evidence")
    expected=[
      ("no-fan-load",0,.45),
      ("mid-fan-load",5e-10,.45),
      ("heavy-fan-load",1e-9,.45),
      ("low-battery-resistance",1e-9,.3),
      ("high-battery-resistance",1e-9,.6)
    ]
    require(len(report["runs"])==len(expected)
            and len(gate["comparisonCases"])==len(expected),"Expected five independent comparisons")
    for (name,fan,battery),case in zip(expected,gate["comparisonCases"]):
        require(case["label"]==name and case["fanTorqueCoefficient"]==fan
                and case["batteryResistanceOhm"]==battery,
                "Scenarios changed under physical calibration guise")
    require(assumption["rotorAndFanCombinedInertiaKgM2"]==2e-6
            and assumption["motorThermalCapacitanceJPerK"]==10
            and assumption["motorThermalResistanceKPerW"]==20
            and assumption["timeStepS"]==.005
            and assumption["totalSimulatedDurationS"]==2,
            "Undisclosed integration physics changed")
    wire=inputs["benchmarks/phase44/copper-harness-assumptions.json"]
    require(wire["proposedWireGaugeAWG"]==24 and
            wire["referenceResistivityAt20C_OhmM"]==1/58000000,
            "Copper model source changed")
    d_mm=.127*92**(12/39)
    area=math.pi*(d_mm/1000)**2/4
    Rwire=(1/58000000)*(.25*2)/area+2*.01
    metrics=[]
    for i,(name,fan,battery) in enumerate(expected):
        case=report["runs"][i]
        computed=case["output"]
        require(case["label"]==name
                and computed["format"]=="invention-lab/phase47-coupled-midpoint-conditional-evaluation/1"
                and computed["assumedFanTorqueCoefficientNmPerRadPerS_Squared"]==fan
                and computed["assumedBatteryInternalResistanceOhm"]==battery
                and computed["calibratedAgainstSourceMatchedPhysicalSystem"] is False
                and computed["actualImpellerMaximumPermittedRpm"] is None
                and computed["predictedActualFanAirflowM3s"] is None
                and computed["physicalValidation"]=="none"
                and computed["realWorldBuildSuccessPercent"] is None,
                "Predicted physical hardware outcome or tampered test case")
        require(abs(computed["assumedHarnessResistanceOhm"]-Rwire)<1e-12,
                "Original source copper loop altered")
        q=computed["allEnergyTermsJ"]
        balance=q["electricalSourceJ"]-(
          q["batteryDissipationJ"]+q["wireAndContactDissipationJ"]
          +q["fanShaftAerodynamicWorkJ"]+q["ambientTransferredMotorHeatJ"]
          +computed["finalKineticEnergyGainJ"]+computed["finalMotorThermalEnergyGainJ"])
        require(abs(balance)<1e-7
                and abs(computed["fullEnergyBalanceResidualJ"]-balance)<1e-9,
                "Independent source-to-output full energy balance failed")
        reference=independently_simulate(assumption,fan,battery,Rwire)
        rpm_delta=abs(computed["finalShaftRpm"]-reference["referenceRk4Rpm"])
        temp_delta=abs(computed["finalMotorTemperatureC"]-reference["referenceRk4MotorTempC"])
        require(rpm_delta<gate["numericalComparisonToleranceRpm"]
                and temp_delta<gate["numericalComparisonToleranceMotorTempC"],
                "Independent RK4 vs implicit midpoint mismatch: "+name+
                " RPM discrepancy "+str(rpm_delta)+", temp "+str(temp_delta))
        metrics.append({"label":name,**reference,
           "javascriptMidpointRpm":computed["finalShaftRpm"],
           "javascriptMidpointMotorTempC":computed["finalMotorTemperatureC"],
           "rpmAbsoluteCrossSolverDiscrepancy":rpm_delta,
           "temperatureAbsoluteCrossSolverDiscrepancyC":temp_delta,
           "independentIntegratedEnergyResidualJ":balance})
    require(metrics[0]["javascriptMidpointRpm"]>metrics[1]["javascriptMidpointRpm"]>
            metrics[2]["javascriptMidpointRpm"] and
            metrics[3]["javascriptMidpointRpm"]>metrics[4]["javascriptMidpointRpm"],
            "Mathematical pressure/load trend lost")
    decision=report["decision"]
    require(decision["numericalEvidenceChecked"] is True
            and decision["hypotheticalScenarioCount"]==5
            and decision["physicalValidationPassed"] is False
            and decision["physicalValidationOutcome"]=="BLOCKED_UNMEASURED_SOURCE_MATCHED_HARDWARE"
            and decision["actualSystemSuccessProbability"] is None,
            "Numerical/software audit claimed real hardware success")
    return metrics

def self_test():
    x,y=rk4_step(1.,21.,0.01,lambda w,t:(0.,0.))
    require(x==1. and y==21.,"RK4 must exactly preserve stationary state")
    x,y=rk4_step(0.,0.,.1,lambda w,t:(2.,3.))
    require(abs(x-.2)<1e-12 and abs(y-.3)<1e-12,
            "Independent RK4 constant-acceleration analytic reference failed")
    print("PH48 PYTHON SELF-TEST PASS: independent fourth-order integrator constant ODE oracle")

def audit():
    raw,data=frozen_files()
    report=json.loads((ROOT/"benchmarks/evidence/phase48/phase48.json").read_bytes())
    metrics=validate_report(report,raw,data)
    body={
      "format":"invention-lab/phase48-independent-rk4-cross-language-replay/1",
      "sourceCommit":report["sourceCommit"],
      "comparedIndependentNumericalRegimes":len(metrics),
      "sourceSHA256":report["sourceSHA256"],
      "separateImplementationLanguage":"Python3-stdlib-RK4",
      "referenceIsIndependentMathematicalImplementation":True,
      "comparisonMetrics":metrics,
      "maxRpmDiscrepancy":max(p["rpmAbsoluteCrossSolverDiscrepancy"] for p in metrics),
      "maxMotorTemperatureDiscrepancyC":max(p["temperatureAbsoluteCrossSolverDiscrepancyC"] for p in metrics),
      "physicalSourceMatchedData":0,
      "independentRealHardwareSpecimens":0,
      "physicalValidation":"none","physicalVerdict":"unknown",
      "realWorldBuildSuccessPercent":None,
      "numericalReplayAccepted":True,
      "realPhysicalSystemQualificationAccepted":False
    }
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(body,indent=2)+"\n",encoding="utf-8")
    print("PH48 INDEPENDENT SOURCE REPLAY PASS: 5 separate Python RK4 vs JS implicit midpoint"
          " regimes; max RPM discrepancy",round(body["maxRpmDiscrepancy"],7),
          "motor temperature discrepancy C",round(body["maxMotorTemperatureDiscrepancyC"],8),
          "; physical fan success remains UNKNOWN")

if __name__=="__main__":
    try:
        if len(sys.argv)==2 and sys.argv[1]=="--self-test":
            self_test()
        elif len(sys.argv)==1:
            audit()
        else:
            raise ValueError("Usage: phase48-independent-rk4.py [--self-test]")
    except (ValueError,AssertionError,KeyError,TypeError,OSError,subprocess.CalledProcessError) as e:
        print("PH48 INDEPENDENT AUDIT FAIL:",str(e),file=sys.stderr)
        sys.exit(1)
