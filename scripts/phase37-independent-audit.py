#!/usr/bin/env python3
"""Phase37 independent Python audit of Phase36 source-locked BLDC motor evidence.

No imports from Invention Lab's JavaScript analyzers. Uses only Python stdlib.
Original raw publisher Git blobs must be acquired separately from the frozen source.
"""
import csv
import hashlib
import io
import json
import math
import pathlib
import subprocess
import sys

PH36_HEAD = "a532dd1b0cee3fc558b2b509659ccedd2b8dbfcc"
PUBLISHER_COMMIT = "1ce35456f83be8f36aec183ab19d6e6e46603023"
COLUMNS = "t_us,ax,ay,az,ax1,ay1,az1,shunt_raw,bus_raw,curr_raw,pg_rpm,seq,dt".split(",")
# Independently frozen data requirements. Do not derive the hashes or sizes
# from the potentially modified source manifests under test.
ORIGINALS = (
    ("training-motor2-2500", "motor2", 2500, 4737417,
     "329d53ec77d708cca07f6b3a37f6a3346063eb66",
     "analize_healthy11_2500rpm_96mA_mait.csv", "phase35"),
    ("holdout-motor3-2500", "motor3", 2500, 4982886,
     "2de45c123e65711bb33f28609889581826f10cb2",
     "analize_healthy20_2500rpm_96mA_mait.csv", "phase35"),
    ("training-motor2-2000", "motor2", 2000, 4707183,
     "7d02bca4073775be034ec00e906b4f7d28a49725",
     "analize_healthy11_2000rpm_96mA_mait.csv", "phase35"),
    ("holdout-motor3-2000", "motor3", 2000, 23964792,
     "195dea9f1b551e6ad209a511713895727af27c94",
     "analize_healthy20_2000rpm_96mA_mait.csv", "phase36"),
)


def require(ok, message):
    if not ok:
        raise ValueError(message)


def near(actual, expected, label, absolute=1e-6):
    require(isinstance(actual, (float, int)) and not isinstance(actual, bool)
            and math.isfinite(actual) and math.isclose(
                actual, expected, rel_tol=1e-9, abs_tol=absolute),
            f"{label}: publisher-original independent calculation mismatch: {actual!r} vs {expected!r}")


def git_blob_sha1(data):
    return hashlib.sha1(f"blob {len(data)}\0".encode("ascii") + data).hexdigest()


def parse_raw(data):
    """Independently parse original acquisition, not Phase35/36 JS output."""
    reader = csv.reader(io.StringIO(data.decode("utf-8"), newline=""), strict=True)
    require(next(reader, []) == COLUMNS, "Publisher CSV schema mismatch")
    first_t = last_t = last_seq = previous_pg = None
    first_edge = last_edge = None
    samples = edges = wraps = 0
    sum_current = sum_voltage = 0.0
    for row in reader:
        require(len(row) == len(COLUMNS), f"Bad column count at source row {samples}")
        require(all(value.strip() for value in row[:12]),
                f"Missing physical sensor field at row {samples}")
        try:
            t = int(row[0])
            seq = int(row[11])
            pg = int(row[10])
            bus = float(row[8])
            current = float(row[9])
            dt = None if not row[12].strip() else float(row[12])
            analog = [float(value) for value in row[1:8]]
        except (ValueError, OverflowError) as exc:
            raise ValueError(f"Invalid numeric source value row {samples}") from exc
        require(t >= 0 and 0 <= seq <= 65535 and pg in (0, 1)
                and math.isfinite(bus) and math.isfinite(current)
                and bus >= 0 and current >= 0
                and all(math.isfinite(v) for v in analog),
                f"Non-physical or nonfinite sensor value row {samples}")
        require(dt is None or (math.isfinite(dt) and dt >= 0),
                f"Nonfinite sensor interval row {samples}")
        if first_t is None:
            first_t = t
        else:
            require(t > last_t, f"Non-monotone original timestamp row {samples}")
            expected_seq = (last_seq + 1) % 65536
            require(seq == expected_seq, f"Unexpected acquisition sequence gap row {samples}")
            if last_seq == 65535 and seq == 0:
                wraps += 1
            require(dt is not None and abs(dt - (t - last_t) / 1e6) <= 1e-6,
                    f"Inconsistent acquisition dt row {samples}")
        if previous_pg == 0 and pg == 1:
            edges += 1
            if first_edge is None:
                first_edge = t
            last_edge = t
        previous_pg = pg
        last_t, last_seq = t, seq
        sum_current += current * 0.00030518
        sum_voltage += bus * 0.00125
        samples += 1
    require(samples >= 3000 and edges >= 12 and last_edge > first_edge,
            "Too few real samples or no usable shaft tach pulses")
    speed = (edges - 1) * 60e6 / (6 * (last_edge - first_edge))
    require(100 < speed < 6000, "Implausible original tach signal")
    return {
        "rawSampleCount": samples,
        "tachRisingEdges": edges,
        "measuredSpeedRpm": speed,
        "meanUpstreamCurrentA": sum_current / samples,
        "meanBusVoltageV": sum_voltage / samples,
        "durationS": (last_t - first_t) / 1e6,
        "sequenceWraps": wraps,
    }


def check_manifest_pins():
    p35 = json.loads(pathlib.Path("benchmarks/phase35/acceptance.json").read_text())
    p36 = json.loads(pathlib.Path("benchmarks/phase36/acceptance.json").read_text())
    require(p35["sourceCommit"] == p36["sourceCommit"] == PUBLISHER_COMMIT,
            "Publisher commit is not frozen")
    require(p36["trainingMotorUnit"] == "motor2"
            and p36["independentTestMotorUnit"] == "motor3"
            and p36["sourceOperatingSetpointsRpm"] == [2000, 2500]
            and p36["sourceLoadControllerSettingMilliamp"] == 96
            and p36["sourcePGPulsesPerMechanicalRevolution"] == 6,
            "Original measurement population or calibration scope changed")
    pins = [*p35["readings"], p36["additionalHeldOutPublisherRecording"]]
    require(len(pins) == len(ORIGINALS), "Original physical-source count changed")
    for original, pin in zip(ORIGINALS, pins):
        identity, unit, rpm, size, blob, filename, _ = original
        require(pin["id"] == identity and pin["unit"] == unit
                and pin["speedSetpointRpm"] == rpm
                and pin["bytes"] == size and pin["gitBlobSHA1"] == blob
                and pin["path"] == "data/" + filename
                and pin["loadCurrentSettingMilliamp"] == 96,
                f"Changed original publisher pin {identity}")
    require(p35["realWorldBuildSuccessPercent"] is None
            and p36["realWorldBuildSuccessPercent"] is None
            and p36["matchedPhysical3VBrushedBatteryFanMeasurements"] == 0
            and p36["physicalValidationForTarget3VFan"] == "none"
            and p36["physicalVerdictForTarget3VFan"] == "unknown",
            "Target fan has no qualifying physical observations")
    return p35, p36


def check_locked_ancestry():
    subprocess.run(["git", "merge-base", "--is-ancestor", PH36_HEAD, "HEAD"],
                   check=True)
    changed = subprocess.check_output(
        ["git", "diff", "--name-only", PH36_HEAD + "..HEAD"], text=True).splitlines()
    prefixes = ("scripts/phase37-", "tests/phase37-", "benchmarks/phase37/",
                "docs/PHASE37-", ".github/workflows/phase37-")
    exceptions = {"README.md", "scripts/phase30-capture.mjs",
                  "scripts/phase30-strict.mjs"}
    unexpected = [path for path in changed if not path.startswith(prefixes)
                  and path not in exceptions]
    require(not unexpected, "Original Phase36 evidence/scripts modified: " + str(unexpected))
    return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()


def audit():
    current = check_locked_ancestry()
    check_manifest_pins()
    report = json.loads(pathlib.Path(
        "benchmarks/evidence/phase36/phase36.json").read_text())
    summary = json.loads(pathlib.Path(
        "benchmarks/evidence/phase36/phase36-summary.json").read_text())
    require(report["format"] == "invention-lab/phase36-original-source-locked-replay/1"
            and report["sourceCommit"] == current
            and report["publisherCommit"] == PUBLISHER_COMMIT,
            "Phase36 regenerated evidence is not from the audited commit")
    physical_files = []
    measured = {}
    pins_in_report = {item["id"]: item for item in report["originalPublisherFiles"]}
    require(len(pins_in_report) == 4, "Duplicated original publisher file")
    for identity, unit, setpoint, expected_bytes, blob, filename, phase in ORIGINALS:
        path = pathlib.Path("benchmarks/evidence") / phase / filename
        data = path.read_bytes()
        require(len(data) == expected_bytes and git_blob_sha1(data) == blob,
                f"Failed original Git blob authentication: {identity}")
        sha256 = hashlib.sha256(data).hexdigest()
        js_pin = pins_in_report.get(identity)
        require(js_pin is not None and js_pin["bytes"] == expected_bytes
                and js_pin["gitBlobSHA1"] == blob
                and js_pin["sha256"] == sha256
                and js_pin["unit"] == unit
                and js_pin["setpointRpm"] == setpoint
                and js_pin["path"] == "data/" + filename,
                f"Source reference in Phase36 output disagrees: {identity}")
        reading = parse_raw(data)
        measured[identity] = reading
        physical_files.append({
            "id": identity, "motorUnit": unit, "setpointRpm": setpoint,
            "originalRows": reading["rawSampleCount"],
            "publisherGitBlobSHA1": blob, "sha256": sha256,
            **reading
        })
    train2k = measured["training-motor2-2000"]
    train25 = measured["training-motor2-2500"]
    slope = (train25["measuredSpeedRpm"] - train2k["measuredSpeedRpm"]) / 500
    intercept = train2k["measuredSpeedRpm"] - 2000 * slope
    current_slope = (
        train25["meanUpstreamCurrentA"] - train2k["meanUpstreamCurrentA"]) / 500
    current_intercept = train2k["meanUpstreamCurrentA"] - 2000 * current_slope
    evidence = report["evaluation"]
    fit = evidence["fit"]
    require(fit["trainedOnlyOnUnit"] == "motor2"
            and fit["pointsUsedToFit"] == 2
            and fit["trainingResidualDegreesOfFreedom"] == 0
            and fit["speedSetpointsRpm"] == [2000, 2500]
            and evidence["strictlyIndependentHeldOutMotorUnit"] == "motor3"
            and evidence["evaluationUsedHoldoutToFit"] is False
            and evidence["independentlyHeldOutMotorUnits"] == 1
            and evidence["heldOutOperatingRegimes"] == 2
            and evidence["actualDistinctMotorUnits"] == 2
            and evidence["wholeRecordings"] == 4,
            "Prediction fit contaminated by holdout or source sample counts")
    near(fit["slopeObservedRpmPerRpmSetpoint"], slope, "speed slope")
    near(fit["interceptObservedRpm"], intercept, "speed intercept")
    near(fit["upstreamCurrentSlopeAperRpmSetpoint"], current_slope, "current slope")
    near(fit["upstreamCurrentInterceptA"], current_intercept, "current intercept")
    absolute_errors = []
    baseline_errors = []
    independently_calculated = []
    by_setpoint = {v["rpmSetpoint"]: v for v in evidence["measuredIndependentDeviceTests"]}
    require(sorted(by_setpoint) == [2000, 2500]
            and len(evidence["measuredIndependentDeviceTests"]) == 2,
            "Missing or duplicate test condition")
    for setpoint in (2000, 2500):
        observation = measured[f"holdout-motor3-{setpoint}"]
        test = by_setpoint[setpoint]
        predicted = slope * setpoint + intercept
        predicted_current = current_slope * setpoint + current_intercept
        error = predicted - observation["measuredSpeedRpm"]
        baseline_error = abs(setpoint - observation["measuredSpeedRpm"])
        absolute_errors.append(abs(error))
        baseline_errors.append(baseline_error)
        require(test["heldOutPublisherSourceId"] == f"holdout-motor3-{setpoint}"
                and test["testMotorUnit"] == "motor3"
                and test["trainingMotorUnit"] == "motor2", "Leaked or relabeled heldout specimen")
        for name, expected in (
            ("predictedSourcePGSpeedRpm", predicted),
            ("observedSourcePGSpeedRpm", observation["measuredSpeedRpm"]),
            ("signedPredictionMinusMeasuredRpm", error),
            ("absolutePredictionErrorRpm", abs(error)),
            ("absoluteRelativePredictionErrorPercent",
             100 * abs(error) / observation["measuredSpeedRpm"]),
            ("uncalibratedSetpointBaselineAbsoluteErrorRpm", baseline_error),
            ("predictedUpstreamDriverInputCurrentA", predicted_current),
            ("observedUpstreamDriverInputCurrentA", observation["meanUpstreamCurrentA"]),
            ("upstreamCurrentAbsolutePredictionErrorA",
             abs(predicted_current - observation["meanUpstreamCurrentA"]))
        ):
            near(test[name], expected, f"{setpoint} RPM {name}", absolute=3e-6)
        independently_calculated.append({
            "rpmSetpoint": setpoint, "tachMeasuredRpm": observation["measuredSpeedRpm"],
            "predictedRpm": predicted, "absoluteErrorRpm": abs(error),
            "baselineAbsoluteErrorRpm": baseline_error
        })
    mae = sum(absolute_errors) / 2
    baseline_mae = sum(baseline_errors) / 2
    total_rows = sum(entry["originalRows"] for entry in physical_files)
    near(evidence["heldOutMeanAbsoluteErrorRpm"], mae, "heldout MAE")
    near(evidence["heldOutMaximumAbsoluteErrorRpm"], max(absolute_errors), "heldout max error")
    near(evidence["heldOutBaselineSetpointMeanAbsoluteErrorRpm"], baseline_mae, "setpoint baseline MAE")
    require(evidence["heldOutModelImprovesOnSetpointBaseline"] is (mae < baseline_mae),
            "False or missing baseline model comparison")
    require(total_rows == 425925 and evidence["originalPhysicalSourceRows"] == total_rows
            and summary["originalSourceSensorRows"] == total_rows
            and summary["accepted"] is True, "Independently counted sensor rows disagree")
    near(summary["heldOutMeanAbsoluteErrorRpm"], mae, "strict summary MAE")
    near(summary["baselineSetpointMeanAbsoluteErrorRpm"], baseline_mae,
         "strict summary baseline MAE")
    for value in (report, summary, evidence):
        require(value.get("realWorldBuildSuccessPercent") is None
                and value.get("physicalValidation") == "none"
                and value.get("physicalVerdict") == "unknown",
                "Publisher's BLDC error illegally declared fan physical qualification")
    require(evidence["credibleNewDevicePredictionIntervalRpm"] is None
            and evidence["calibratedPhysicalSpeedErrorFor3VFan"] is None
            and evidence["matchedPhysical3VFanMeasurements"] == 0
            and evidence["sensorCalibrationIndependentCertificate"] is None,
            "Invented source-device population interval or target-fan calibration")
    audited = {
        "format": "invention-lab/phase37-independent-python-physical-evidence-replay/1",
        "sourceCommit": current, "auditedPhase36BaseCommit": PH36_HEAD,
        "publisherCommit": PUBLISHER_COMMIT,
        "independentImplementation": "Python 3 standard-library CSV, hashes and tach edges",
        "originalPhysicalSourceRows": total_rows,
        "physicalMotorUnits": 2, "trainingMotorUnit": "motor2",
        "independentHoldoutMotorUnit": "motor3", "holdoutRegimes": 2,
        "publisherOriginalFiles": physical_files,
        "heldOutTests": independently_calculated,
        "independentlyRecalculatedMAERpm": mae,
        "independentlyRecalculatedBaselineMAERpm": baseline_mae,
        "source24VModelOnly": True, "sourceCalibrationIndependentlyCertified": False,
        "statisticallyQualifiedPopulationError": None,
        "qualifiedPhysical3VFanSamples": 0,
        "physicalValidation": "none", "physicalVerdict": "unknown",
        "realWorldBuildSuccessPercent": None,
        "accepted": True,
    }
    output = pathlib.Path("benchmarks/evidence/phase37")
    output.mkdir(parents=True, exist_ok=True)
    (output / "phase37-audit.json").write_text(
        json.dumps(audited, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"PH37 INDEPENDENT AUDIT PASS: {total_rows} original rows; "
          f"heldout motor3 MAE {mae:.6f} RPM; baseline {baseline_mae:.6f} RPM; "
          "one heldout motor unit; 3V target physical success UNKNOWN")
    return audited


def self_test():
    base = COLUMNS
    rows = [",".join(base)]
    for i in range(4000):
        rows.append(",".join([
            str(i * 1000), "2800", "3200", "127000", "3000", "3900", "126900",
            "19", "20000", "100", str(int(i % 4 < 2)), str(i % 65536),
            "" if i == 0 else "0.001"]))
    sample = ("\n".join(rows) + "\n").encode()
    good = parse_raw(sample)
    require(good["rawSampleCount"] == 4000 and abs(good["measuredSpeedRpm"]-2500) < 2,
            "Independent synthetic parser self-test baseline failed")
    mutations = [
        sample.replace(b"pg_rpm", b"lie_rpm", 1),
        sample.replace(b"1000,2800", b"-1000,2800", 1),
        sample.replace(b"20000,100,", b"20000,,", 1),
        sample.replace(b"20000,100,", b"20000,-100,", 1),
        sample.replace(b",1000,0.001", b",50000,0.001", 1),
        sample.replace(b",0.001\n", b",0.900\n", 1),
    ]
    rejected = 0
    for changed in mutations:
        require(changed != sample, "Mutation not applied")
        try:
            parse_raw(changed)
        except ValueError:
            rejected += 1
    require(rejected == len(mutations), "One corrupted synthetic physical recording escaped checks")
    require(git_blob_sha1(b"test\n") == "9daeafb9864cf43055ae93beb0afd6c7d144bfa4",
            "Git blob identity calculation is wrong")
    print(f"PH37 SELF-TEST PASS: synthetic tach and {rejected} independent source-forgery refusals")


if __name__ == "__main__":
    try:
        if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
            self_test()
        elif len(sys.argv) == 1:
            audit()
        else:
            raise ValueError("Usage: python3 scripts/phase37-independent-audit.py [--self-test]")
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as exc:
        print("PH37 AUDIT FAIL:", exc, file=sys.stderr)
        sys.exit(1)
