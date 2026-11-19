#!/usr/bin/env python3
"""Assemble radix-2/3/4 ripple ALU candidates ONLY from the SKY130 PEX Q4 mux.

These are electrically meaningful hierarchical SPICE netlist candidates;
a PEX primitive alone DOES NOT make the assembled ALU route DRC/LVS-clean.
No ALU may be marked nativeLvsMatch without independent physical verification.
"""
import argparse,hashlib,json
from pathlib import Path
RADICES=(2,3,4)
WIDTHS=(4,8)
MUX_PINS=('sel','d0','d1','d2','d3','out','vdd','vss')
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def mux_line(instance,select,choices,out):
    if len(choices)!=4:
        raise ValueError('Q4 mux requires four deterministic data rails')
    return 'X'+instance+' '+ ' '.join([select,*choices,out,'v3','v0','q4_mux4'])

def lut_value(a,b,carry,base,kind):
    if a not in range(base) or b not in range(base) or carry not in (0,1):
        raise ValueError('illegal arithmetic digit')
    total=a+b+carry
    return total%base if kind=='sum' else total//base

def assemble(radix,width):
    if radix not in RADICES or width not in WIDTHS:
        raise ValueError('unadmitted radix/width')
    name=f'stage_m_alu_r{radix}_w{width}'
    pins=[*(f'a{i}' for i in range(width)),
          *(f'b{i}' for i in range(width)),
          *(f's{i}' for i in range(width)),
          'carry','v0','v1','v2','v3']
    out=['* Hierarchical transistor PEX Q4-mux based arithmetic candidate.',
         '* This subcircuit is NOT a verified ALU layout or fabricated device.',
         '.subckt '+name+' '+' '.join(pins)]
    carry='v0'
    for digit in range(width):
        a=f'a{digit}';b=f'b{digit}'
        sums={}
        for kind in ('sum','carry'):
            for ai in range(radix):
                selected_b=[]
                for bi in range(radix):
                    target=f'n_{digit}_{kind}_a{ai}_b{bi}'
                    data=[f'v{lut_value(ai,bi,k,radix,kind)}' for k in (0,1)]
                    out.append(mux_line(f'{digit}_{kind}_a{ai}_b{bi}_cin',carry,
                       [data[0],data[1],data[0],data[0]],target))
                    selected_b.append(target)
                target_a=f'n_{digit}_{kind}_a{ai}'
                while len(selected_b)<4:
                    selected_b.append(selected_b[0])
                out.append(mux_line(f'{digit}_{kind}_a{ai}_bsel',b,selected_b,target_a))
                sums[(kind,ai)]=target_a
            values=[sums[(kind,ai)] for ai in range(radix)]
            while len(values)<4:
                values.append(values[0])
            target=f's{digit}' if kind=='sum' else f'carry{digit}'
            out.append(mux_line(f'{digit}_{kind}_asel',a,values,target))
        carry=f'carry{digit}'
    # A signal-buffer stage for the final carry-out avoids an ideal VCVS.
    out.append(mux_line('carry_out',carry,['v0','v1','v1','v1'],'carry'))
    out.append('.ends '+name)
    return name,'\n'.join(out)+'\n',len(out)-4

def validate_logic():
    # Complete three-input add-with-carry truth table for every admitted radix.
    for radix in RADICES:
        for a in range(radix):
            for b in range(radix):
                for cin in (0,1):
                    sm=lut_value(a,b,cin,radix,'sum')
                    co=lut_value(a,b,cin,radix,'carry')
                    if sm not in range(radix) or co not in (0,1) or sm+radix*co != a+b+cin:
                        raise ValueError('bad LUT decomposition')
def main():
    p=argparse.ArgumentParser()
    p.add_argument('--pex-mux',required=True)
    p.add_argument('--sources',required=True)
    p.add_argument('--out',required=True)
    a=p.parse_args()
    manifest=json.loads(Path(a.sources).read_text())
    mux=Path(a.pex_mux)
    if (manifest.get('level2')!='UNQUALIFIED_NO_GO' or
        manifest.get('soaLimitV')!=1.95 or
        manifest.get('drcLvsAllFourVerified') is not True or
        manifest.get('pexSha256',{}).get('q4_mux4')!=digest(mux)):
        raise ValueError('source-pinned, verified Q4 mux PEX missing')
    # Magic's ext2spice emits a valid bare ".ends" for subcircuits.
    # Require an exact eight-pin interface, not a named ".ends" token
    # and not a collapsed netlist that shorts all terminals together.
    import re
    raw=mux.read_text()
    match=re.findall(r'(?im)^\s*\.subckt\s+q4_mux4\s+([^\n]+)',raw)
    if len(match)!=1:
        raise ValueError('authentic extracted q4_mux4 subckt missing')
    extracted_pins=match[0].split()
    if tuple(x.lower() for x in extracted_pins)!=MUX_PINS:
        raise ValueError('q4_mux4 PEX terminal collapse or external-pin mismatch')
    tail=raw[raw.lower().find('.subckt q4_mux4 '):].splitlines()
    if not any(re.match(r'(?i)^\s*\.ends(?:\s+q4_mux4)?\s*$',line) for line in tail[1:]):
        raise ValueError('q4_mux4 PEX lacks a valid .ends closure')
    validate_logic()
    dest=Path(a.out);dest.mkdir(parents=True,exist_ok=True)
    records={}
    for radix in RADICES:
        for width in WIDTHS:
            name,body,count=assemble(radix,width)
            path=dest/(name+'.spice')
            # Absolute include ties the assembled hierarchy to the same
            # sha256-validated physical mux PEX that passed 4-cell LVS.
            text=('* SOURCE-PINNED PEX MUX, NOT ALU ROUTE/PARASITICS\n'
                  +f'.include "{mux.resolve()}"\n'+body)
            path.write_text(text)
            records[f'{radix}:{width}']={
                'path':str(path.resolve()),'sha256':digest(path),
                'pexMuxSha256':digest(mux),'q4MuxInstanceCount':count,
                'functionalTruthTableChecked':True,
                'nativeLvsMatch':False,
                'aluInterconnectPexVerified':False,
                'status':'HIERARCHICAL_PEX_PRIMITIVE_COMPOSITION_UNQUALIFIED'
            }
    (dest/'candidates-manifest.json').write_text(json.dumps({
        'format':'invention-lab/stage-m-alu-candidate/1',
        'aluNetlists':records,'level2':'UNQUALIFIED_NO_GO',
        'qualified':False},indent=2)+'\n')
    print(json.dumps({'sixCandidateNetlists':len(records),
          'nativeAluLvsMatched':0,'physicalQualification':'UNQUALIFIED_NO_GO'}))
if __name__=='__main__':
    try:main()
    except Exception as e:
        import sys
        print('STAGE_M_FAIL_CLOSED:',e,file=sys.stderr)
        raise SystemExit(1)
