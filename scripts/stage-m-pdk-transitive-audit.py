#!/usr/bin/env python3
"""Read-only, SHA-256-anchored SKY130 statistical PDK dependency audit.

This diagnostic NEVER invents a model/corner or changes qualification gates.
Inspect all installed PDK SPICE files, selected library include transitivity,
active switch references and active random expressions (comments excluded).
Only direct, source-backed statistical evidence may be admitted.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

LIB_OPEN = re.compile(r"^\s*\.lib\s+(\S+)\s*$", re.I)
LIB_FILE = re.compile(r'^\s*\.lib\s+["\']([^"\']+)["\']\s+(\S+)', re.I)
LIB_END = re.compile(r"^\s*\.end(?:l|lib)\b", re.I)
INCLUDE = re.compile(r'^\s*\.include\s+(?:"([^"]+)"|\'([^\']+)\'|(\S+))', re.I)
SWITCH_MM = re.compile(r"\bmc_mm_switch\b", re.I)
SWITCH_PR = re.compile(r"\bmc_pr_switch\b", re.I)
RANDOM = re.compile(r"(?<![A-Za-z_])(?:agauss|gauss)\s*\(", re.I)
SWITCH_ASSIGN = re.compile(r"^\s*\.param\s+(mc_mm_switch|mc_pr_switch)\s*=\s*(\S+)", re.I)
SUPPORTED = {'.spice', '.spi', '.lib'}
LIMIT = 30000

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def active_lines(text):
    # SPICE comments beginning "*" do not contain active randomness.
    # Ignore inline '$' or ';' comments; retain '+' continuations.
    for line in text.splitlines():
        stripped=line.lstrip()
        if not stripped or stripped.startswith(('*', '$', ';', '#')):
            continue
        cleaned=re.split(r'(?<!\\)[$;]', line, maxsplit=1)[0].rstrip()
        if cleaned.strip():
            yield cleaned

def select_section(text, name):
    """Choose exactly the named .lib section; no silent tt -> mc promotion."""
    lines=list(active_lines(text))
    start=None
    sections=[]
    for i,line in enumerate(lines):
        m=LIB_OPEN.fullmatch(line)
        if m:
            sections.append(m.group(1).lower())
            if m.group(1).lower()==name.lower():
                if start is not None:
                    raise ValueError('duplicate PDK library section '+name)
                start=i+1
                continue
        if start is not None and LIB_END.match(line):
            return lines[start:i], sections
    if start is not None:
        raise ValueError('unterminated library section '+name)
    return [], sections

def is_within(root, candidate):
    try:
        candidate.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False

def audit(pdk_root, top, root_section='tt'):
    pdk_root=Path(pdk_root).resolve()
    top=Path(top).resolve()
    if not top.is_file() or not is_within(pdk_root,top):
        raise ValueError('Processed top-level PDK missing/outside authenticated root')
    paths=[]
    for sub in ('libs.tech/ngspice','libs.ref/sky130_fd_pr'):
        base=pdk_root/'sky130A'/sub
        if base.exists():
            paths.extend(p for p in base.rglob('*') if p.is_file()
                         and p.suffix.lower() in SUPPORTED
                         and is_within(pdk_root,p))
    paths=sorted(set(paths)|{top},key=lambda p:str(p))
    if not paths or len(paths)>LIMIT:
        raise ValueError('Empty/unbounded processed PDK tree')
    inventory={}
    for path in paths:
        rel=str(path.relative_to(pdk_root))
        src=path.read_text(encoding='utf-8',errors='replace')
        active='\n'.join(active_lines(src))
        inventory[rel]={
            'sha256':digest(path),'bytes':path.stat().st_size,
            'activeMcMmReferences':len(SWITCH_MM.findall(active)),
            'activeMcPrReferences':len(SWITCH_PR.findall(active)),
            'activeRandomExpressions':len(RANDOM.findall(active)),
            'statisticalFile':bool(re.search(r'mismatch|montecarlo|statistic',rel,re.I))
        }
    top_text=top.read_text(encoding='utf-8',errors='replace')
    mc_lines,sections=select_section(top_text,'mc')
    tt_lines,_=select_section(top_text,root_section)
    selected='mc' if mc_lines else root_section.lower()
    if not tt_lines and not mc_lines:
        raise ValueError('No readable named real PDK corner for transitive audit')
    starts=mc_lines if mc_lines else tt_lines
    reachable={}
    unresolved=[]
    pending=[(top,starts,selected)]
    seen=set()
    # Included .lib paths must be resolved from their actual source file.
    while pending:
        path,lines,section=pending.pop()
        key=(str(path.resolve()),section)
        if key in seen:continue
        seen.add(key)
        if len(seen)>LIMIT:
            raise ValueError('Unbounded PDK include recursion')
        if not is_within(pdk_root,path):
            unresolved.append({'source':str(path),'reason':'outside-pinned-pdk'})
            continue
        rel=str(path.relative_to(pdk_root))
        active='\n'.join(lines)
        reachable[rel]={
            'sha256':digest(path),
            'activeMcMmReferences':len(SWITCH_MM.findall(active)),
            'activeMcPrReferences':len(SWITCH_PR.findall(active)),
            'activeRandomExpressions':len(RANDOM.findall(active)),
            'selectedSection':section
        }
        for line in lines:
            m=INCLUDE.match(line)
            external=LIB_FILE.match(line) if not m else None
            if not (m or external):continue
            name=next((s for s in m.groups() if s),None) if m else external.group(1)
            selected_part='all' if m else external.group(2)
            target=(path.parent/name).resolve()
            if not target.is_file() or not is_within(pdk_root,target):
                unresolved.append({'source':rel,'include':name,'section':selected_part})
                continue
            content=target.read_text(encoding='utf-8',errors='replace')
            if m:
                content_lines=list(active_lines(content))
            else:
                content_lines,_=select_section(content,selected_part)
                if not content_lines:
                    unresolved.append({'source':rel,'include':name,'missingLib':selected_part})
                    continue
            pending.append((target,content_lines,selected_part))
    related={k:v for k,v in inventory.items() if v['statisticalFile'] or
             v['activeMcMmReferences'] or v['activeMcPrReferences'] or
             v['activeRandomExpressions']}
    total_mm=sum(x['activeMcMmReferences'] for x in reachable.values())
    total_pr=sum(x['activeMcPrReferences'] for x in reachable.values())
    total_rand=sum(x['activeRandomExpressions'] for x in reachable.values())
    assignments={}
    for rel in reachable:
        path=pdk_root/rel
        for line in active_lines(path.read_text(encoding='utf-8',errors='replace')):
            hit=SWITCH_ASSIGN.match(line)
            if hit:
                assignments.setdefault(hit.group(1).lower(),set()).add(hit.group(2))
    assignments={k:sorted(v) for k,v in assignments.items()}
    # The actual active selected PDK closure must DECLARE both switches ON,
    # not merely mention them in a device expression or comment. An external
    # SPICE deck's .param assignment is not proof of an upstream MC model.
    def switch_enabled(name):
        values=assignments.get(name,[])
        if len(values)!=1:
            return False
        try:
            return float(values[0].strip('{}()')) == 1.0
        except ValueError:
            return False
    switches_enabled=(switch_enabled('mc_mm_switch') and
                      switch_enabled('mc_pr_switch'))
    # Purely diagnostic. Even an authentic source-backed statistical model
    # candidate needs a real ngspice statistical-variation execution check.
    enabled=(total_mm>0 and total_pr>0 and total_rand>0 and
             switches_enabled and not unresolved)
    return {
        'format':'invention-lab/stage-m/transitive-statistical-pdk-audit/1',
        'pdkRoot':str(pdk_root),'topLibrary':str(top),
        'topLibrarySha256':digest(top),
        'topLevelSections':sections,'auditedSection':selected,
        'authenticStatisticalModelCandidate':enabled,
        'nativeMcSectionPresent':bool(mc_lines),
        'activeMcMmReferencesInSelectedClosure':total_mm,
        'activeMcPrReferencesInSelectedClosure':total_pr,
        'activeRandomExpressionsInSelectedClosure':total_rand,
        'activeSwitchAssignments':assignments,
        'bothStatisticalSwitchesEnabledInSelectedClosure':switches_enabled,
        'unresolvedIncludes':unresolved,
        'includedFilesSha256':reachable,
        'statisticalAndRandomFileInventorySha256':related,
        'completeInstalledSpiceInventorySha256':{
            key:data['sha256'] for key,data in inventory.items()},
        'physicalLevel2':'UNQUALIFIED_NO_GO',
        'qualificationStatus':'SOURCE_CANDIDATE_REQUIRES_NATIVE_SPICE_VALIDATION'
            if enabled else 'UNQUALIFIED_NO_GO'
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--pdk-root',required=True)
    p.add_argument('--library',required=True)
    p.add_argument('--output',required=True)
    args=p.parse_args()
    result=audit(args.pdk_root,args.library)
    out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2,sort_keys=True)+'\n')
    print(json.dumps({
        'auditedSection':result['auditedSection'],
        'nativeMcSectionPresent':result['nativeMcSectionPresent'],
        'mm':result['activeMcMmReferencesInSelectedClosure'],
        'pr':result['activeMcPrReferencesInSelectedClosure'],
        'random':result['activeRandomExpressionsInSelectedClosure'],
        'includes':len(result['includedFilesSha256']),
        'unresolved':len(result['unresolvedIncludes']),
        'statisticalModelCandidate':result['authenticStatisticalModelCandidate'],
        'bothStatisticalSwitchesEnabled':result['bothStatisticalSwitchesEnabledInSelectedClosure'],
        'qualification':'UNQUALIFIED_NO_GO'
    },sort_keys=True))
if __name__=='__main__':
    try:main()
    except Exception as exc:
        print('STAGE_M_PDK_TRANSITIVE_AUDIT_FAIL_CLOSED:',str(exc),file=sys.stderr)
        sys.exit(1)
