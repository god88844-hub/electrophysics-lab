#!/usr/bin/env python3
"""Fail-closed top-level Netgen LVS and extracted PEX port-set verifier.

Netgen can report nested "Netlists match uniquely" while the TOP netlist
ends "Netlists do not match". Never qualify a design by substring grep.
"""
import argparse
from pathlib import Path
import re
import sys

CELLS={'q4_thresh_det','q4_inv','q4_mux4','q4_half_adder'}
GOOD={'Circuits match uniquely.','Netlists match uniquely.'}
BAD=re.compile(r'(?im)\b(?:netlists|circuits)\s+do\s+not\s+match\b|\bcell\s+pin\s+lists\s+are\s+not\s+equivalent\b')

def top_pins(path,cell):
    lines=Path(path).read_text(encoding='utf-8').splitlines()
    found=[]
    for i,line in enumerate(lines):
        match=re.match(r'^\s*\.subckt\s+(\S+)(.*)$',line,re.I)
        if not match or match.group(1).lower()!=cell.lower():continue
        values=match.group(2).split()
        j=i+1
        while j<len(lines) and re.match(r'^\s*\+',lines[j]):
            values.extend(lines[j].lstrip().lstrip('+').strip().split())
            j+=1
        pins=[]
        for term in values:
            if term.lower() in {'params:','param:'} or '=' in term or term.startswith(('*','$')):
                break
            pins.append(term.lower())
        found.append(tuple(pins))
    if len(found)!=1:raise ValueError(f'{path}: expected exactly one .subckt {cell}, got {len(found)}')
    pins=found[0]
    if len(pins)<2 or len(pins)!=len(set(pins)):
        raise ValueError(f'{path}: collapsed/repeated top-level terminals {pins!r}')
    return pins

def verify(cell,schematic,layout,pex,report):
    if cell not in CELLS:raise ValueError('Unapproved Stage M Q4 cell')
    expected=top_pins(schematic,cell)
    for path in (layout,pex):
        actual=top_pins(path,cell)
        if len(actual)!=len(expected) or set(actual)!=set(expected):
            raise ValueError(f'{cell}: top-level port mismatch expected={expected!r}, extracted={actual!r} in {path}')
    text=Path(report).read_text(encoding='utf-8')
    if BAD.search(text):raise ValueError(f'{cell}: Netgen reports mismatched circuits (even if a subcell matches)')
    final=[line.strip() for line in text.splitlines() if line.strip()]
    if not final or final[-1] not in GOOD:
        raise ValueError(f'{cell}: final top-level LVS verdict is not unique match')
    if 'Cell pin lists are equivalent.' not in text:
        raise ValueError(f'{cell}: no top-level pin-list equivalence proof')
    return {'cell':cell,'pins':sorted(expected),'count':len(expected),'verdict':final[-1]}

def main():
    p=argparse.ArgumentParser()
    for opt in ('cell','schematic','lvs-netlist','pex','report'):
        p.add_argument('--'+opt,required=True)
    a=p.parse_args()
    import json
    print('STAGE_M_TOP_LVS_CONFIRMED '+json.dumps(verify(a.cell,a.schematic,a.lvs_netlist,a.pex,a.report),sort_keys=True))

if __name__=='__main__':
    try:main()
    except Exception as e:
        print('STAGE_M_FAIL_CLOSED: '+str(e),file=sys.stderr)
        sys.exit(1)
