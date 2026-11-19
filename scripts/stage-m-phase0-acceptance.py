#!/usr/bin/env python3
"""Phase-0 software acceptance of an *expected, independently checked* NO-GO.

This script is NOT foundry qualification. It enforces the real four-cell
Magic/Netgen/PEX hard gates, original SHA-bound PDK transitive audit,
INSUFFICIENT_MODEL_DATA, and UNQUALIFIED_NO_GO. No model, trial, or waiver
is synthesized here. If statistical models become available, CI must use
the existing real ngspice qualification path instead.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys

CELLS={"q4_thresh_det":6,"q4_inv":6,"q4_mux4":8,"q4_half_adder":8}
EXPECTED_PDK="4fcb2a538312de6f71c718c6be325fe865d5c4248a76dd5f7d2e8512df0d54ef"
PINNED_SECTIONS=["tt","sf","ff","ss","fs","ll","hh","hl","lh"]
NO_GO="UNQUALIFIED_NO_GO"
INSUFFICIENT="INSUFFICIENT_MODEL_DATA"

def require(condition,reason):
    if not condition:
        raise ValueError("STAGE_M_PHASE0_FAIL_CLOSED: "+reason)

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def classify(audit):
    """Only the *exact pinned, hash-verified zero-statistics* case is expected."""
    require(audit.get("physicalLevel2")==NO_GO,"model-audit-level2")
    require(audit.get("topLibrarySha256")==EXPECTED_PDK,"processed-PDK-hash-mismatch")
    require(audit.get("topLevelSections")==PINNED_SECTIONS,"processed-PDK-sections-changed")
    require(audit.get("auditedSection")=="tt","non-nominal-audited-section")
    require(len(audit.get("completeInstalledSpiceInventorySha256",{}))==783,
            "transitive-inventory-not-783")
    require(len(audit.get("includedFilesSha256",{}))==150,
            "tt-transitive-closure-not-150")
    require(not audit.get("unresolvedIncludes"),"unresolved-PDK-dependency")
    require(not audit.get("authenticStatisticalModelCandidate"),"unexpected-statistical-candidate")
    for name in ("activeMcMmReferencesInSelectedClosure",
                 "activeMcPrReferencesInSelectedClosure",
                 "activeRandomExpressionsInSelectedClosure"):
        require(audit.get(name)==0,"statistical-source-has-active-token:"+name)
    require(audit.get("bothStatisticalSwitchesEnabledInSelectedClosure") is False,
            "statistical-switches-are-actually-enabled")
    require(audit.get("nativeMcSectionPresent") is False,"native-mc-corner-present")
    return "absent-authenticated"

def check_inventory(audit):
    root=Path(audit["pdkRoot"]).resolve()
    lib=Path(audit["topLibrary"]).resolve()
    require(lib.is_file() and root in lib.parents,"top-library-outside-pdk")
    require(sha(lib)==EXPECTED_PDK,"top-PDK-binary-SHA-invalid")
    inventory=audit["completeInstalledSpiceInventorySha256"]
    require(all(isinstance(v,str) and re.fullmatch(r"[0-9a-f]{64}",v)
                for v in inventory.values()),"malformed-per-file-SHA")
    for rel,expected in inventory.items():
        p=(root/rel).resolve()
        require(p.is_file() and root in p.parents,"missing-or-outside-PDK:"+rel)
        require(sha(p)==expected,"transitive-PDK-byte-drift:"+rel)
    for rel,info in audit["includedFilesSha256"].items():
        require(rel in inventory and info["sha256"]==inventory[rel],
                "transitive-closure-SHA-drift:"+rel)

def strict_lvs_verifier():
    spec=importlib.util.spec_from_file_location(
        "stage_m_validate_lvs",Path(__file__).with_name("stage-m-validate-lvs.py"))
    require(spec is not None and spec.loader is not None,"strict-LVS-verifier-missing")
    m=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m

def validate_geometry(evidence,manifest):
    require(manifest.get("drcLvsAllFourVerified") is True,
            "four-cell-acceptance-not-verified")
    require(manifest.get("soaLimitV")==1.95,"1.95V-core-SOA-changed")
    require(manifest.get("level2")==NO_GO,"level2-gate-relaxed")
    require(manifest.get("qualification")==INSUFFICIENT,
            "unverified-model-promoted-to-qualification")
    require(manifest.get("allCoreTerminalSOAChecksPassed") is False,
            "SOA-completion-without-waveforms")
    actual=manifest.get("pexSha256",{})
    require(set(actual)==set(CELLS),"four-cell-PEX-inventory-mismatch")
    verifier=strict_lvs_verifier()
    hashes={}
    for cell,count in CELLS.items():
        root=evidence/cell
        mag=root/"mag"
        schem=root/"spice"/(cell+".spice")
        lvs=mag/(cell+"-lvs.spice")
        pex=mag/(cell+"-pex.spice")
        report=mag/(cell+"-netgen-lvs.txt")
        drc=mag/(cell+"-magic-drc.txt")
        geometry=[mag/(cell+".mag"),mag/(cell+".gds"),schem,lvs,pex,report,drc]
        for p in geometry:
            require(p.is_file() and p.stat().st_size>0,"missing-native-evidence:"+str(p))
        require("STAGE_M_DRC_COUNT "+cell+" 0" in drc.read_text(),
                "nonzero-Magic-DRC:"+cell)
        proof=verifier.verify(cell,schem,lvs,pex,report)
        require(proof["count"]==count,"cell-top-level-pin-count:"+cell)
        require(sha(pex)==actual[cell],"source-manifest-PEX-digest-mismatch:"+cell)
        require("Circuits match uniquely." in report.read_text(),
                "top-level-Netgen-not-unique:"+cell)
        hashes[cell]={p.name:sha(p) for p in geometry}
    return hashes

def reject_fabricated_results(evidence,manifest):
    alu=manifest.get("aluNetlists")
    require(isinstance(alu,dict) and len(alu)==6,
            "six-ALU-candidate-status-missing")
    for name,value in alu.items():
        require(value.get("nativeLvsMatch") is False,
                "unverified-ALU-LVS-promoted:"+name)
        require(value.get("aluInterconnectPexVerified") is False,
                "unverified-ALU-interconnect-promoted:"+name)
    # A future source-backed campaign has its own gate. Phase 0 explicitly
    # rejects ANY existing purported yield, even if stored under another key.
    for rel in ("native-monte-carlo/passport.json",
                "four-terminal-soa-evidence.json"):
        p=evidence/rel
        require(not p.exists(),"unverified-native-passport-or-SOA-present:"+rel)
    for p in evidence.glob("native-monte-carlo/*.json"):
        content=p.read_text(errors="replace")
        require("VIRTUALLY_QUALIFIED" not in content and
                '"completedNativeTrials"' not in content,
                "native-trials-misrepresented:"+str(p))
    for p in evidence.glob("alu-candidates/*manifest.json"):
        c=p.read_text(errors="replace")
        require('"nativeLvsMatch": true' not in c,
                "candidate-ALU-falsely-certified:"+str(p))

def certify(audit,manifest,evidence):
    mode=classify(audit)
    check_inventory(audit)
    require(manifest.get("pdkLibrarySha256")==EXPECTED_PDK,
            "source-manifest-PDK-hash-drift")
    geometry=validate_geometry(evidence,manifest)
    reject_fabricated_results(evidence,manifest)
    return {
        "format":"invention-lab/phase0/fail-closed-native-acceptance/1",
        "softwareAcceptance":"PASS_EXPECTED_FAIL_CLOSED",
        "modelAvailability":mode,
        "level1":INSUFFICIENT,"level2":NO_GO,
        "pdkLibrarySha256":EXPECTED_PDK,
        "sourceBoundSky130SOALimitV":1.95,
        "verifiedQ4Primitives":geometry,
        "verifiedNativeALUs":0,
        "plannedNativeTrials":6400,"completedNativeTrials":0,
        "yieldPercentage":None,"wilson95":None,
        "physicalFabricationAuthorized":False,
        "statisticalModelEvidence":{
            "mismatchSwitchReferences":0,
            "processSwitchReferences":0,
            "activeRandomFunctions":0,
            "installedSpiceFilesVerified":783,
            "transitiveIncludedFilesVerified":150},
        "notClaimed":["physical-silicon-validation","native-ALU-LVS",
                      "statistical-yield","four-terminal-waveform-SOA"]
    }

def main():
    ap=argparse.ArgumentParser()
    for key in ("audit","manifest","evidence","output"):
        ap.add_argument("--"+key,required=True)
    ap.add_argument("--github-output")
    a=ap.parse_args()
    evidence=Path(a.evidence).resolve()
    audit=json.loads(Path(a.audit).read_text())
    manifest=json.loads(Path(a.manifest).read_text())
    result=certify(audit,manifest,evidence)
    out=Path(a.output)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,sort_keys=True,indent=2)+"\n")
    if a.github_output:
        with Path(a.github_output).open("a") as f:
            f.write("model_mode=absent-authenticated\n")
    print("STAGE_M_PHASE0_NATIVE_EXPECTED_FAIL_CLOSED_VERIFIED")
    print("Level-1:",result["level1"],"Level-2:",result["level2"])
if __name__=="__main__":
    try:
        main()
    except Exception as e:
        print(str(e),file=sys.stderr)
        sys.exit(1)
