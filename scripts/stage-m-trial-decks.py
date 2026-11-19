#!/usr/bin/env python3
"""Materialize 6400 SHA-bound real PEX trial decks, never synthesize testbenches."""
import argparse,hashlib,json,re
from pathlib import Path

CELLS=('q4_thresh_det','q4_inv','q4_mux4','q4_half_adder')
MC={'mc','tt_mm'}
MEAS_RE=re.compile(r'(?im)^\s*\.meas(?:ure)?\s+\w+\s+([A-Za-z_]\w*)\b')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def safe_read(p):
    q=Path(p)
    if not q.is_file() or not q.stat().st_size:raise ValueError('Missing source-backed deck component '+str(q))
    return q.read_text()
def main():
    p=argparse.ArgumentParser()
    for name in ('plan','sources','templates','decks'):p.add_argument('--'+name,required=True)
    args=p.parse_args();plan=json.loads(safe_read(args.plan));m=json.loads(safe_read(args.sources))
    jobs=plan['q4PrimitiveTrials']+plan['aluTrials']
    if len(plan['q4PrimitiveTrials'])!=4000 or len(plan['aluTrials'])!=2400 or len(jobs)!=6400:
        raise ValueError('Incomplete required 6400-real-trial plan')
    if not all(row.get('status')=='NOT_RUN' for row in jobs):
        raise ValueError('Predeclared/fabricated native simulation output')
    if (m.get('drcLvsAllFourVerified') is not True or
        m.get('allCoreTerminalSOAChecksPassed') is not True or
        m.get('fourTerminalTransientSOAEvidenceVerified') is not True or
        m.get('soaLimitV')!=1.95 or m.get('level2')!='UNQUALIFIED_NO_GO'):
        raise ValueError('Missing real physical/4-terminal SOA acceptance')
    lib=Path(m['pdkLibrary'])
    if sha(lib)!=m['pdkLibrarySha256']:raise ValueError('PDK source SHA mismatch')
    if (m.get('pdkCorner') not in MC or
        m.get('statisticalSwitchesVerified')!={'mc_mm_switch':1,'mc_pr_switch':1} or
        not re.fullmatch('[0-9a-f]{64}',m.get('selectedLibrarySectionSha256',''))):
        raise ValueError('No source-bound real Monte Carlo section')
    pex={}
    for name in CELLS:
        path=Path(m['pexRoot'])/(name+'-pex.spice')
        if sha(path)!=m.get('pexSha256',{}).get(name):
            raise ValueError('Missing genuine PEX hash '+name)
        pex[name]=path
    # Require six separately verified assembled-ALU netlists; four Q4
    # primitive PEX cells alone cannot establish binary/ternary ALUs.
    alus={}
    for radix in (2,3,4):
        for width in (4,8):
            key=f'{radix}:{width}'
            record=m.get('aluNetlists',{}).get(key)
            if not isinstance(record,dict):raise ValueError('Missing real PEX ALU '+key)
            path=Path(record.get('path',''))
            if sha(path)!=record.get('sha256') or not record.get('nativeLvsMatch'):
                raise ValueError('Unverified source-bound ALU '+key)
            alus[key]=path
    # All bench templates must be real design-validated .meas sources,
    # never mathematical truth-table placeholders or ideal behavioral gates.
    bench={}
    for name in [*CELLS,*(f'alu-{r}-{w}' for r in (2,3,4) for w in (4,8))]:
        body=safe_read(Path(args.templates)/(name+'.spice'))
        if re.search(r'(?im)^\s*\.(?:lib|include|end)\b',body):
            raise ValueError('Injected or nested PDK library in source bench '+name)
        required={'NM_L','NM_1','NM_2','NM_H','delay_s','power_w'} if name in CELLS else {'functional_match','delay_s','power_w'}
        if not required.issubset(set(MEAS_RE.findall(body))):
            raise ValueError('Missing true SPICE noise/delay/power measurement '+name)
        if not re.search(r'(?im)^\s*\.(?:tran|dc)\b',body):
            raise ValueError('Missing physical analysis sweep '+name)
        bench[name]=body
    # No artifacts are emitted until all physical sources and templates pass.
    root=Path(args.decks);root.mkdir(parents=True,exist_ok=True)
    seeds=set()
    for row in jobs:
        seed=row['seed']
        if not isinstance(seed,int) or seed<=0 or seed in seeds:
            raise ValueError('Missing/duplicate deterministic native seed')
        seeds.add(seed)
        if row['temperatureC'] not in (-40,25,85,125):
            raise ValueError('Unapproved temperature corner')
        stat=row['corner']=='mc'
        physical=m['pdkCorner'] if stat else row['corner']
        if physical not in (*MC,'tt','ss','ff'):raise ValueError('Nonexistent verified PDK corner')
        if row['kind']=='pex-q4-primitive':
            name=row['cell'];model=pex[name];key=name
        elif row['kind']=='pex-assembled-alu':
            name=f"alu-{row['radix']}-{row['width']}";model=alus[f"{row['radix']}:{row['width']}"];key=name
        else:raise ValueError('Unexpected native trial')
        rootrow=root/str(seed);rootrow.mkdir(exist_ok=True)
        parts=['* Source-verified SKY130 native trial',f'.lib "{lib.resolve()}" {physical}',
               f'.include "{model.resolve()}"',f'.option seed={seed}',
               f'.temp {row["temperatureC"]}']
        if stat:parts+=['.param mc_mm_switch=1','.param mc_pr_switch=1']
        deck='\n'.join([*parts,bench[key],'.end',''])
        file=rootrow/'trial.spice';file.write_text(deck)
        provenance={'seed':seed,'temperatureC':row['temperatureC'],'corner':row['corner'],
                    'pdkCorner':physical,'selectedLibrarySectionSha256':m['selectedLibrarySectionSha256'],
                    'pdkLibrarySha256':m['pdkLibrarySha256'],'pexSha256':m['pexSha256'],
                    'designSha256':sha(model),'benchSha256':hashlib.sha256(bench[key].encode()).hexdigest(),
                    'deckSha256':sha(file),'level2':'UNQUALIFIED_NO_GO'}
        (rootrow/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
    if len(seeds)!=6400:raise ValueError('Native trial count incomplete')
    print(json.dumps({'status':'AUTHENTICATED_DECKS_NOT_EXECUTED','count':len(seeds),'level2':'UNQUALIFIED_NO_GO'}))
if __name__=='__main__':
    try:main()
    except Exception as exc:
        p=argparse.ArgumentParser();p.exit(1,'STAGE_M_FAIL_CLOSED: '+str(exc)+'\n')
