#!/usr/bin/env python3
"""Require real per-MOS D/G/S/B ngspice transients; never synthesize SOA evidence."""
import argparse,csv,hashlib,json,math,re
from pathlib import Path

CELLS=('q4_thresh_det','q4_inv','q4_mux4','q4_half_adder')
TEMPS=(-40,25,85,125)
PROFILES={'sky130-core-1v8':1.8*1.05,'sky130-core-1v65-unregulated':1.65*1.10}
SOA=1.95
MODELS={'sky130_fd_pr__nfet_01v8','sky130_fd_pr__nfet_01v8_lvt',
        'sky130_fd_pr__pfet_01v8','sky130_fd_pr__pfet_01v8_hvt'}
PAIRS={'Vgs':('gate_v','source_v'),'Vds':('drain_v','source_v'),
       'Vgb':('gate_v','bulk_v'),'Vgd':('gate_v','drain_v'),
       'Vbs':('bulk_v','source_v')}
COLS={'device','time_s','drain_v','gate_v','source_v','bulk_v'}
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def mos(p):
    out={};active=None
    for line in Path(p).read_text().splitlines():
        s=line.strip()
        if not s or s.startswith('*'):continue
        fields=s.split();op=fields[0].lower()
        if op=='.subckt':
            if active is not None or len(fields)<3:raise ValueError('malformed subckt')
            active=fields[1]
        elif op=='.ends':
            if active is None or len(fields)<2 or fields[1]!=active:
                raise ValueError('malformed .ends')
            active=None
        elif active and op[0] in {'x','m'}:
            models=[(i,x) for i,x in enumerate(fields) if x.startswith('sky130_fd_pr__')]
            if not models:continue
            if len(models)!=1 or models[0][0]!=5 or models[0][1] not in MODELS:
                raise ValueError('unauthenticated 4-terminal D/G/S/B device')
            key=active+'/'+fields[0]
            if key in out:raise ValueError('duplicate MOS instance')
            out[key]=models[0][1]
    if active or not out:raise ValueError('no closed MOS subcircuits in '+str(p))
    return out
def trace(p,expected):
    last={};count={};peaks={k:0.0 for k in PAIRS}
    with Path(p).open(newline='') as h:
        reader=csv.DictReader(h)
        if not reader.fieldnames or not COLS.issubset(reader.fieldnames):
            raise ValueError('missing four-terminal waveform columns')
        for row in reader:
            device=row['device']
            if device not in expected:raise ValueError('unmatched MOS waveform '+device)
            time=float(row['time_s'])
            if not math.isfinite(time) or time<0 or time<=last.get(device,-1):
                raise ValueError('nonmonotonic waveform')
            last[device]=time
            volts={k:float(row[k]) for k in ('drain_v','gate_v','source_v','bulk_v')}
            if not all(map(math.isfinite,volts.values())):
                raise ValueError('nonfinite transistor terminal')
            for k,(a,b) in PAIRS.items():
                stress=abs(volts[a]-volts[b]);peaks[k]=max(peaks[k],stress)
                if stress>SOA+1e-12:raise ValueError('SOA_OXIDE_OVERSTRESS '+device+'/'+k)
            count[device]=count.get(device,0)+1
    if set(count)!=set(expected) or min(count.values(),default=0)<2:
        raise ValueError('incomplete real waveform per-MOS coverage')
    return {'sourceSha256':sha(p),'sampleCount':sum(count.values()),
            'mosInstanceCount':len(expected),'maxAbsTerminalStressV':peaks}
def audit(manifest_path,schematics,pex,waveforms,output):
    m=json.loads(Path(manifest_path).read_text())
    if m.get('soaLimitV')!=SOA or m.get('level2')!='UNQUALIFIED_NO_GO' or m.get('drcLvsAllFourVerified') is not True:
        raise ValueError('physical/SOA gate not established')
    if sha(m['pdkLibrary'])!=m.get('pdkLibrarySha256'):
        raise ValueError('pinned PDK SHA256 mismatch')
    report={'format':'invention-lab/stage-m-real-four-terminal-soa/1',
            'status':'INSUFFICIENT_MODEL_DATA','limitV':SOA,
            'physicalQualification':'UNQUALIFIED_NO_GO','staticRailBounds':{},
            'transientCornerMeasurements':{}}
    for profile,high in PROFILES.items():
        if high>SOA:raise ValueError('SOA_OXIDE_OVERSTRESS static profile')
        report['staticRailBounds'][profile]={'maxRailV':high,
            'worstCasePairwiseV':{k:high for k in PAIRS}}
    for cell in CELLS:
        schematic=Path(schematics)/(cell+'.spice')
        extracted=Path(pex)/(cell+'-pex.spice')
        if sha(extracted)!=m.get('pexSha256',{}).get(cell):
            raise ValueError('PEX SHA256 mismatch '+cell)
        source_devs=mos(schematic);pex_devs=mos(extracted)
        if len(source_devs)!=len(pex_devs):
            raise ValueError('schematic-to-PEX transistor inventory mismatch '+cell)
        for profile in PROFILES:
            for temp in TEMPS:
                f=Path(waveforms)/(cell+'__'+profile+'__'+str(temp)+'.csv')
                if not f.is_file():raise ValueError('real ngspice SOA waveform missing '+str(f))
                report['transientCornerMeasurements'][cell+'/'+profile+'/'+str(temp)]=trace(f,pex_devs)
    if len(report['transientCornerMeasurements'])!=32:
        raise ValueError('incomplete 4-cell 2-profile 4-temperature SOA coverage')
    report['status']='SOA_FOUR_TERMINAL_TRANSIENT_SCREEN_PASS'
    Path(output).write_text(json.dumps(report,indent=2)+'\n')
    m.update(allCoreTerminalSOAChecksPassed=True,
        fourTerminalTransientSOAEvidenceVerified=True,
        fourTerminalSOAEvidenceSha256=sha(output))
    Path(manifest_path).write_text(json.dumps(m,indent=2)+'\n')
    return report
if __name__=='__main__':
    p=argparse.ArgumentParser()
    for field in ('manifest','schematics','pex','waveforms','output'):
        p.add_argument('--'+field,required=True)
    a=p.parse_args()
    try:print(json.dumps(audit(a.manifest,a.schematics,a.pex,a.waveforms,a.output)))
    except Exception as e:
        p.exit(1,'STAGE_M_FAIL_CLOSED: '+str(e)+'\n')
