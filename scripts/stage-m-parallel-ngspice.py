#!/usr/bin/env python3
"""Fail-closed, CPU-parallel native ngspice post-layout campaign runner."""
import argparse, concurrent.futures, hashlib, json, math, os, pathlib, re, subprocess, sys

def digest(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()

def wilson(passed,total):
    if not isinstance(passed,int) or total<=0 or not 0<=passed<=total:
        raise ValueError('Invalid native survival counts')
    z=1.959963984540054; p=passed/total; d=1+z*z/total
    c=(p+z*z/(2*total))/d
    r=z*math.sqrt(p*(1-p)/total+z*z/(4*total*total))/d
    return [max(0,c-r),min(1,c+r)]

def validate_plan(plan):
    prim=plan['q4PrimitiveTrials']; alu=plan['aluTrials']
    if len(prim)!=4000 or len(alu)!=2400: raise ValueError('Missing 6400 required trial rows')
    seeds=set(); pcount={c:0 for c in ('q4_thresh_det','q4_inv','q4_mux4','q4_half_adder')}; acount={}
    for row in prim+alu:
        seed=row['seed']
        if not isinstance(seed,int) or seed<=0 or seed in seeds or row['status']!='NOT_RUN':
            raise ValueError('Nonunique, unseeded or premarked trial')
        seeds.add(seed)
        if row['temperatureC'] not in (-40,25,85,125): raise ValueError('Missing PVT temperature')
        if row['kind']=='pex-q4-primitive':
            if row['cell'] not in pcount or row['corner']!='tt_mm':raise ValueError('Wrong Q4 cell/corner')
            if set(row['requiredMeasurements'])!=set(('NM_L','NM_1','NM_2','NM_H','delay_s','power_w')):
                raise ValueError('Required Q4 measurement not planned')
            pcount[row['cell']]+=1
        elif row['kind']=='pex-assembled-alu':
            k=(row['radix'],row['width'],row['corner'])
            if k[0] not in (2,3,4) or k[1] not in (4,8) or k[2] not in ('tt','ss','ff','tt_mm'):
                raise ValueError('Wrong ALU PVT/radix')
            if set(row['requiredMeasurements'])!=set(('functional_match','delay_s','power_w')):
                raise ValueError('Missing ALU measurement')
            acount[k]=acount.get(k,0)+1
        else: raise ValueError('Unknown trial kind')
    if set(pcount.values())!={1000} or len(acount)!=24 or set(acount.values())!={100}:
        raise ValueError('Incomplete native coverage by cell and radix')
    return prim+alu

def parse_measurements(text,keys):
    if re.search(r'(?im)^\s*(?:fatal|error)\b',text):
        raise ValueError('ngspice reported error')
    output={}
    for key in keys:
        pattern=r'(?im)^\s*'+re.escape(key)+r'\s*=\s*([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)\b'
        found=re.findall(pattern,text)
        if len(found)!=1: raise ValueError('Missing/ambiguous real ngspice .meas '+key)
        val=float(found[0])
        if not math.isfinite(val): raise ValueError('Nonfinite native measurement')
        output[key]=val
    return output

def run_one(row,decks,out,ngspice,expected_hashes,limit):
    root=decks/str(row['seed']); deck=root/'trial.spice'; manifest=root/'provenance.json'
    m=json.loads(manifest.read_text())
    if m.get('seed')!=row['seed'] or m.get('corner')!=row['corner'] or m.get('temperatureC')!=row['temperatureC']:
        raise ValueError('Trial metadata mismatch')
    if m.get('pdkLibrarySha256')!=expected_hashes['pdkLibrarySha256'] or m.get('pexSha256')!=expected_hashes['pexSha256']:
        raise ValueError('PDK/PEX provenance mismatch')
    if m.get('deckSha256')!=digest(deck): raise ValueError('SPICE deck SHA-256 mismatch')
    d=deck.read_text()
    if not re.search(r'(?im)^\s*\.temp\s+'+str(row['temperatureC'])+r'\s*$',d) or not re.search(r'(?im)^\s*\.option\s+seed\s*=\s*'+str(row['seed'])+r'\s*$',d):
        raise ValueError('Native seed/temperature not bound')
    if not re.search(r'(?im)^\s*\.lib\s+\S+\s+'+row['corner']+r'\s*$',d):
        raise ValueError('Native PDK corner not bound')
    if '.include' not in d or '-pex.spice' not in d:raise ValueError('Not post-layout RC deck')
    if row['corner']=='tt_mm' and len(re.findall(r'(?im)^\s*\.param\s+mc_mm_switch\s*=\s*1(?:\.0*)?\s*$',d))!=1:
        raise ValueError('Mismatch switch not enabled')
    output=out/str(row['seed']);output.mkdir(parents=True,exist_ok=True)
    log=output/'ngspice.log'
    proc=subprocess.run([ngspice,'-b','-o',str(log),str(deck)],cwd=root,capture_output=True,text=True,timeout=limit)
    if proc.returncode or not log.is_file():raise RuntimeError('Native ngspice failed '+str(row['seed'])+' '+proc.stderr[-300:])
    return {'seed':row['seed'],'kind':row['kind'],'corner':row['corner'],
            'measurements':parse_measurements(log.read_text(),row['requiredMeasurements']),
            'logSha256':digest(log),'deckSha256':digest(deck)}

def main():
    parser=argparse.ArgumentParser()
    for arg in ('plan','sources','decks','acceptance','out'):parser.add_argument('--'+arg,required=True)
    parser.add_argument('--ngspice',default='ngspice')
    parser.add_argument('--timeout',type=int,default=300)
    args=parser.parse_args();out=pathlib.Path(args.out).resolve();out.mkdir(parents=True,exist_ok=True)
    passport={'format':'invention-lab/stage-m/real-postlayout-campaign/1',
      'level1':'INSUFFICIENT_MODEL_DATA','yieldPercentage':None,'wilson95':None,
      'completedNativeTrials':0,'requiredNativeTrials':6400,'physicalLevel2':'UNQUALIFIED_NO_GO'}
    dest=out/'passport.json';dest.write_text(json.dumps(passport,indent=2)+'\n')
    try:
        jobs=validate_plan(json.loads(pathlib.Path(args.plan).read_text()))
        sources=json.loads(pathlib.Path(args.sources).read_text())
        if sources.get('drcLvsAllFourVerified') is not True or sources.get('soaLimitV')!=1.95 or sources.get('allCoreTerminalSOAChecksPassed') is not True or sources.get('level2')!='UNQUALIFIED_NO_GO':
            raise ValueError('Native physical/SOA acceptance prerequisites absent')
        if digest(sources['pdkLibrary'])!=sources['pdkLibrarySha256']:
            raise ValueError('Pinned SKY130 PDK hash mismatch')
        if set(sources['pexSha256'])!={'q4_thresh_det','q4_inv','q4_mux4','q4_half_adder'}:
            raise ValueError('Missing four PEX hashes')
        for cell,value in sources['pexSha256'].items():
            if digest(pathlib.Path(sources['pexRoot'])/(cell+'-pex.spice'))!=value:
                raise ValueError('Extracted parasitic SHA mismatch')
        limits=json.loads(pathlib.Path(args.acceptance).read_text())
        required={'NM_L','NM_1','NM_2','NM_H','delay_s','power_w'}
        if set(limits)!=required or any(not isinstance(v,(int,float)) or v<=0 or not math.isfinite(v) for v in limits.values()):
            raise ValueError('Missing approved physical acceptance limits')
        min_lower=sources.get('minimumWilsonLower95')
        if not isinstance(min_lower,(int,float)) or not 0<min_lower<=1:
            raise ValueError('Missing qualified yield threshold')
        decks=pathlib.Path(args.decks).resolve()
        # Reject missing/unauthenticated inputs BEFORE queuing 6400 jobs.
        if any(not (decks/str(j['seed'])/'trial.spice').is_file() or not (decks/str(j['seed'])/'provenance.json').is_file() for j in jobs):
            raise ValueError('Missing post-layout ALU/primitive trial decks')
        workers=max(1,os.cpu_count() or 1)
        results=[]
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            jobs_future=[pool.submit(run_one,j,decks,out/'logs',args.ngspice,sources,args.timeout) for j in jobs]
            for f in concurrent.futures.as_completed(jobs_future):
                results.append(f.result())
        if len(results)!=6400 or len({r['seed'] for r in results})!=6400:
            raise ValueError('Native SPICE trial count incomplete')
        n=0
        for row in results:
            m=row['measurements']
            ok=all(m[k]>=limits[k] for k in ('NM_L','NM_1','NM_2','NM_H') if k in m)
            ok=ok and m['delay_s']<=limits['delay_s'] and m['power_w']<=limits['power_w']
            if 'functional_match' in m: ok=ok and m['functional_match']==1
            n+=int(ok)
        bounds=wilson(n,len(results))
        passport.update(level1='VIRTUALLY_QUALIFIED' if bounds[0]>=min_lower and n==6400 else 'VIRTUAL_FAIL',
          yieldPercentage=n/6400*100,wilson95=bounds,completedNativeTrials=6400,
          passedNativeTrials=n,sourceManifestSha256=digest(args.sources))
    except Exception as exc:
        passport['blocker']=str(exc)
        dest.write_text(json.dumps(passport,indent=2)+'\n')
        raise
    dest.write_text(json.dumps(passport,indent=2)+'\n')
    if passport['level1']!='VIRTUALLY_QUALIFIED':raise RuntimeError('Native Stage M failed acceptance')
    print(json.dumps(passport,indent=2))

if __name__=='__main__':
    try:main()
    except Exception as exc:
        print('STAGE_M_FAIL_CLOSED:',exc,file=sys.stderr)
        sys.exit(1)
