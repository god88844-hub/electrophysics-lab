#!/usr/bin/env python3
"""Run real SKY130 PEX SOA probes and write per-device D/G/S/B CSVs.

Refuses hierarchical/unprobed PEX rather than inventing voltages. These
testbenches are for SOA only, NOT noise-margin or ALU qualification.
"""
import argparse,csv,hashlib,json,math,re,subprocess
from pathlib import Path

CELLS=('q4_thresh_det','q4_inv','q4_mux4','q4_half_adder')
TEMP=(-40,25,85,125)
PROFILES={'sky130-core-1v8':(1.8,.05),
          'sky130-core-1v65-unregulated':(1.65,.10)}
DEVICES={'sky130_fd_pr__nfet_01v8','sky130_fd_pr__nfet_01v8_lvt',
         'sky130_fd_pr__pfet_01v8','sky130_fd_pr__pfet_01v8_hvt'}
OUT={'q4_thresh_det':{'t1','t2','t3'},'q4_inv':{'y'},
     'q4_mux4':{'out'},'q4_half_adder':{'sum','carry'}}
PINS={'q4_thresh_det':('vin','t1','t2','t3','vdd','vss'),
      'q4_inv':('vin','y','v0','v1','v2','v3'),
      'q4_mux4':('sel','d0','d1','d2','d3','out','vdd','vss'),
      'q4_half_adder':('a','b','sum','carry','v0','v1','v2','v3')}
SAFE=re.compile(r'^[A-Za-z0-9_.$!#/+-]+$')
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def parse_native_pex(path,cell):
    raw=Path(path).read_text()
    active=None;ports=None;devices={};top=0
    for line in raw.splitlines():
        line=line.strip()
        if not line or line.startswith('*') or line.startswith('+'):continue
        w=line.split();t=w[0].lower()
        if t=='.subckt':
            if active is not None:raise ValueError('Nested/unknown PEX subckt format')
            active=w[1].lower()
            if active==cell:
                top+=1;ports=tuple(p.lower() for p in w[2:])
        elif t=='.ends':
            if active is None:raise ValueError('Unbalanced PEX .ends')
            active=None
        elif active==cell and t[0] in ('m','x'):
            model=next((m for m in w if m.startswith('sky130_fd_pr__')),None)
            if model is None:
                raise ValueError('Hierarchical/unknown device in PEX requires flattened native extraction')
            if model not in DEVICES or w.index(model)!=5:
                raise ValueError('Unapproved/faulty four-terminal MOS')
            if w[0] in devices:raise ValueError('Duplicate extracted MOS')
            for node in w[1:5]:
                if not SAFE.fullmatch(node):raise ValueError('Unsafe extracted node')
            devices[w[0]]=(model,*w[1:5])
    if active or top!=1 or ports!=PINS[cell] or not devices:
        raise ValueError('Incomplete or port-mismatched flattened postlayout cell '+cell)
    return devices
def stimuli(cell,nominal,ripple):
    pins=PINS[cell]
    supply='v3' if 'v3' in pins else 'vdd'
    low='v0' if 'v0' in pins else 'vss'
    high=nominal*(1+ripple);minimum=nominal*(1-ripple)
    if high>1.95:raise ValueError('SOA_OXIDE_OVERSTRESS static source')
    v=[f'V_{supply} {supply} 0 PWL(0 {nominal:.9f} 10n {high:.9f} 40n {minimum:.9f} 80n {high:.9f} 120n {minimum:.9f} 160n {high:.9f} 200n {nominal:.9f})',
       f'V_{low} {low} 0 0']
    if 'v1' in pins:v.append('EV1 v1 0 v3 0 0.333333333333')
    if 'v2' in pins:v.append('EV2 v2 0 v3 0 0.666666666667')
    if cell=='q4_mux4':
        for i in range(4):
            v.append(f'Ed{i} d{i} 0 {supply} 0 {i/3:.12f}')
    for port in pins:
        if port in OUT[cell]:v.append(f'C_{port} {port} 0 10f')
    def drive(port,sequence):
        pts=['0ns 0']
        last=0.0
        for i,level in enumerate(sequence):
            vnom=nominal*level/3.0
            t=i*10
            pts.extend((f'{t+0.05:.3f}ns {last:.9f}',
                        f'{t+0.10:.3f}ns {vnom:.9f}'))
            last=vnom
        pts.append(f'200ns {last:.9f}')
        v.append(f'V_{port} {port} 0 PWL('+' '.join(pts)+')')
    if cell in ('q4_thresh_det','q4_inv'):drive('vin',[i%4 for i in range(16)])
    if cell=='q4_mux4':drive('sel',[i%4 for i in range(16)])
    if cell=='q4_half_adder':
        drive('a',[i//4 for i in range(16)])
        drive('b',[i%4 for i in range(16)])
    return v
def vector(node,ports):
    if node=='0':return 'v(0)'
    if node.lower() in ports:return f'v({node.lower()})'
    return 'v(xuut.'+node.lower()+')'
def collect(raw_file,devices,ports,outfile):
    nodes=[];used=set()
    for _inst,(_model,*nets) in devices.items():
        for n in nets:
            vec=vector(n,ports['ports'])
            if vec not in used:used.add(vec);nodes.append(vec)
    data=Path(raw_file).read_text().splitlines()
    samples=[]
    for line in data:
        parts=line.strip().split()
        if not parts:continue
        try:cols=list(map(float,parts))
        except ValueError:continue  # wr_vecnames header
        if len(cols)!=len(nodes)+1 or not all(math.isfinite(x) for x in cols):
            raise ValueError('ngspice wrdata columns absent/misaligned')
        samples.append(cols)
    if len(samples)<3 or not all(samples[i][0]<samples[i+1][0] for i in range(len(samples)-1)):
        raise ValueError('Incomplete/unsorted native ngspice transient')
    indexes={n:i+1 for i,n in enumerate(nodes)}
    with Path(outfile).open('w',newline='') as handle:
        writer=csv.writer(handle)
        writer.writerow(('device','time_s','drain_v','gate_v','source_v','bulk_v'))
        for row in samples:
            for inst,(_model,*pins) in devices.items():
                writer.writerow((ports['cell']+'/'+inst,row[0],
                    *(row[indexes[vector(pin,ports['ports'])]] for pin in pins)))
    return len(samples)*len(devices)
def main():
    ap=argparse.ArgumentParser()
    for arg in ('manifest','pex','out'):ap.add_argument('--'+arg,required=True)
    ap.add_argument('--ngspice',default='ngspice')
    args=ap.parse_args();m=json.loads(Path(args.manifest).read_text())
    if m.get('soaLimitV')!=1.95 or m.get('level2')!='UNQUALIFIED_NO_GO' or m.get('drcLvsAllFourVerified') is not True:
        raise ValueError('Verified DRC/LVS and physical SOA prerequisites missing')
    lib=Path(m['pdkLibrary'])
    if digest(lib)!=m.get('pdkLibrarySha256') or m.get('pdkCorner') not in ('mc','tt_mm'):
        raise ValueError('Pinned processed MC PDK not authenticated')
    if m.get('statisticalSwitchesVerified')!={'mc_mm_switch':1,'mc_pr_switch':1}:
        raise ValueError('Native statistical switches unverified')
    destination=Path(args.out);destination.mkdir(parents=True,exist_ok=True)
    count=0
    for cell in CELLS:
        pex=Path(args.pex)/(cell+'-pex.spice')
        if digest(pex)!=m.get('pexSha256',{}).get(cell):
            raise ValueError('SHA-256 PEX mismatch '+cell)
        devices=parse_native_pex(pex,cell)
        for name,(nominal,ripple) in PROFILES.items():
            for temp in TEMP:
                prefix=destination/(cell+'__'+name+'__'+str(temp))
                raw=Path(str(prefix)+'.wrdata')
                log=Path(str(prefix)+'.log')
                csv_file=Path(str(prefix)+'.csv')
                deck=Path(str(prefix)+'.spice')
                nodes={vector(net,PINS[cell]) for _model,*nets in devices.values() for net in nets}
                text=['* Original post-layout SOA transient',
                    f'.lib "{lib.resolve()}" {m["pdkCorner"]}',
                    f'.include "{pex.resolve()}"',
                    '.param mc_mm_switch=1','.param mc_pr_switch=1',
                    f'.temp {temp}',*stimuli(cell,nominal,ripple),
                    'Xuut '+' '.join(PINS[cell])+' '+cell,
                    '.control','set wr_singlescale','set wr_vecnames',
                    'tran 0.1n 200n',
                    'wrdata "'+str(raw.resolve())+'" '+' '.join(sorted(nodes)),
                    'quit','.endc','.end','']
                deck.write_text('\n'.join(text))
                p=subprocess.run([args.ngspice,'-b','-o',str(log),str(deck)],
                    cwd=destination,capture_output=True,text=True,timeout=300)
                if p.returncode or not raw.is_file() or not log.is_file():
                    raise ValueError('Native ngspice 4-terminal capture FAILED '+cell+'/'+name+'/'+str(temp))
                count+=collect(raw,devices,{'cell':cell,'ports':PINS[cell]},csv_file)
                proof={'command':'ngspice -b','cell':cell,'profile':name,'temperatureC':temp,
                    'deckSha256':digest(deck),'ngspiceLogSha256':digest(log),
                    'rawWaveformSha256':digest(raw),'csvSha256':digest(csv_file),
                    'pexSha256':digest(pex),'pdkLibrarySha256':digest(lib),
                    'level2':'UNQUALIFIED_NO_GO'}
                Path(str(prefix)+'.proof.json').write_text(json.dumps(proof,indent=2)+'\n')
    print(json.dumps({'status':'REAL_NGSPICE_TERMINAL_WAVEFORMS_CAPTURED_NOT_SIGNOFF',
        'samples':count,'cases':32,'level2':'UNQUALIFIED_NO_GO'}))
if __name__=='__main__':
    try:main()
    except Exception as exc:
        ap=argparse.ArgumentParser()
        ap.exit(1,'STAGE_M_FAIL_CLOSED: '+str(exc)+'\n')
