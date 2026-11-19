#!/usr/bin/env python3
"""Resolve every SPICE transistor/pin endpoint to authentic placed .mag labels.
Outputs Tcl for the deterministic 2-layer Magic router. Fail closed on ambiguity.
No DRC/LVS qualification is asserted by this preparatory mapping.
"""
import argparse
import hashlib
from collections import defaultdict
from pathlib import Path
import re

LAYERS={'met1','m1','metal1','li1','locali','met3','metal3'}
# Pinned SKY130 Magic compound contacts ndc/pdc/pc/nsc/psc connect
# existing diffusion/poly to local interconnect: never allow bare diffusion.
CONTACT_TO_LI1={
    'ndiffc':'li1', 'ndc':'li1',
    'pdiffc':'li1', 'pdc':'li1',
    'polycont':'li1', 'pc':'li1',
    'psubdiffcont':'li1', 'nsubdiffcont':'li1',
}

def circuits(file):
    result={};active=None
    for line in Path(file).read_text().splitlines():
        line=line.strip()
        if not line or line.startswith('*'):continue
        parts=line.split()
        if parts[0].lower()=='.subckt':
            if active or len(parts)<3:raise ValueError('bad .subckt')
            active=(parts[1],parts[2:],[])
        elif parts[0].lower()=='.ends':
            if not active or active[0]!=parts[1]:raise ValueError('unbalanced .ends')
            result[active[0]]={'ports':active[1],'instances':active[2]}
            active=None
        elif active and parts[0][0].lower()=='x':
            first=next((i for i,x in enumerate(parts) if '=' in x),len(parts))
            if first<3:raise ValueError('malformed MOS/subckt instance')
            active[2].append((parts[0],parts[1:first-1],parts[first-1]))
    if active or not result:raise ValueError('unclosed or empty schematic')
    for name,sub in result.items():
        for inst,nets,master in sub['instances']:
            if master.startswith('sky130_fd_pr__'):num=4
            else:
                if master not in result:raise ValueError('unresolved subcircuit '+master)
                num=len(result[master]['ports'])
            if len(nets)!=num:raise ValueError('SPICE instance pin mismatch '+name+'/'+inst)
    return result

def mag(path):
    raw=Path(path).read_text()
    if not raw.startswith('magic\n') or '<< labels >>' not in raw or '<< end >>' not in raw:
        raise ValueError('unknown Magic geometry format: '+str(path))
    uses={};labels=defaultdict(list);current=None;box=None
    for line in raw.splitlines():
        if line.startswith('use '):
            _,master,current=line.split()
            if current in uses:raise ValueError('duplicate instance '+current)
            uses[current]=[master,None]
        elif line.startswith('transform ') and current:
            nums=list(map(int,line.split()[1:]))
            if len(nums)!=6:raise ValueError('unrecognized Magic orientation')
            uses[current][1]=nums
        elif line.startswith(('rlabel ', 'flabel ')):
            # Magic font labels are stored as "flabel"; native device ports
            # may use either flavor and may include an optional "s" flag.
            # Never synthesize a missing pin or silently accept bad coordinates.
            parts=line.split()
            kind,lay=parts[:2]
            offset=3 if len(parts)>2 and parts[2]=='s' else 2
            count=offset+(11 if kind=='flabel' else 6)
            if len(parts)!=count:
                raise ValueError('unparseable native Magic '+kind+' label')
            coords=parts[offset:offset+4]
            if any(not re.fullmatch(r'-?\d+',x) for x in coords):
                raise ValueError('noninteger native Magic label coordinate')
            x1,y1,x2,y2=map(int,coords)
            name=parts[-1]
            labels[name].append((lay,(x1+x2)//2,(y1+y2)//2))
        elif line.startswith('box '):
            b=list(map(int,line.split()[1:]))
            if len(b)==4:
                # Per-child Magic "box" coordinates are LOCAL to that
                # instance; the route envelope must use their transforms.
                # Otherwise supply rails and channels can cross actual FETs.
                if current and uses.get(current,[None,None])[1] is not None:
                    b=list(transformed_box(b,uses[current][1]))
                if box is None:box=b
                else:box=[min(box[0],b[0]),min(box[1],b[1]),max(box[2],b[2]),max(box[3],b[3])]
    if any(x[1] is None for x in uses.values()):raise ValueError('missing instance transform')
    return uses,labels,box

def routed_export(path,pad,entries):
    """Select only a SHA-bound post-route port, never an arbitrary duplicate."""
    if len(entries)==1:
        return entries[0]
    if len(entries)!=2 or entries[0]==entries[1]:
        raise ValueError('missing/ambiguous routed port '+str(path)+'/'+pad)
    marker=Path(path).with_suffix('.stage-m-routed')
    if not marker.is_file():
        raise ValueError('ambiguous port without verified routed child '+str(path)+'/'+pad)
    pairs=[line.split() for line in marker.read_text().splitlines()]
    matching=[item for item in pairs if len(item)==2 and item[1]==Path(path).name]
    if len(matching)!=1 or hashlib.sha256(Path(path).read_bytes()).hexdigest()!=matching[0][0]:
        raise ValueError('routed child Magic SHA-256 mismatch '+str(path))
    # The first record was left by the imported device placer; the last
    # record is explicitly written by stage_m_finish_cell after Metal1/3
    # routing, native DRC and PEX extraction.
    return entries[-1]

def label_box(path,pad):
    """Read the authentic Magic label rectangle; refuse synthetic dimensions."""
    result=[]
    for row in Path(path).read_text().splitlines():
        if not row.startswith(('rlabel ','flabel ')):
            continue
        parts=row.split()
        off=3 if len(parts)>2 and parts[2]=='s' else 2
        if parts[-1]!=pad:
            continue
        try:
            x1,y1,x2,y2=[int(v) for v in parts[off:off+4]]
        except (ValueError,IndexError):
            raise ValueError('malformed contact label rectangle '+pad)
        if x2<x1 or y2<y1:
            raise ValueError('inverted contact label rectangle '+pad)
        result.append((x1,y1,x2,y2))
    return routed_export(path,pad,result)

def transformed_box(rect,trans):
    x1,y1,x2,y2=rect
    a,b,c,d,e,f=trans
    pts=((a*x+b*y+c,d*x+e*y+f)
         for x,y in ((x1,y1),(x1,y2),(x2,y1),(x2,y2)))
    points=list(pts)
    return (min(x for x,_ in points),min(y for _,y in points),
            max(x for x,_ in points),max(y for _,y in points))

def pin(root,uses,inst,pad):
    if inst not in uses:raise ValueError('missing placed cell '+inst)
    child,trans=uses[inst]
    path=root/(child+'.mag')
    if not path.exists():raise ValueError('missing child geometry '+str(path))
    _,labels,_=mag(path)
    hits=labels.get(pad,[])
    if not hits:raise ValueError('missing real terminal '+inst+'/'+pad)
    layer,x,y=routed_export(path,pad,hits)
    # A compound Magic PDK contact IS already local interconnect, unlike
    # uncontacted ndiff/pdiff/poly. Require the original .mag label, always.
    native_layer=layer
    if layer in CONTACT_TO_LI1:
        layer=CONTACT_TO_LI1[layer]
    elif layer=='poly':
        # Bare poly is NOT an already-present poly contact: Magic must
        # explicitly paint an authentic pc composite before Li1 landing.
        layer='li1'
    if layer not in LAYERS:raise ValueError('uncontactable geometry '+inst+'/'+pad+' '+native_layer)
    a,b,c,d,e,f=trans
    return (layer,a*x+b*y+c,d*x+e*y+f,
            *transformed_box(label_box(path,pad),trans),native_layer)

def hierarchical_escape_ranks(netmap):
    """Allocate short, distinct Metal2 trunks for native Metal1 child pins.

    Native hierarchical pins share source X coordinates but have different
    Y offsets. Reusing their X as vertical MET2 trunks shorts their nets.
    Assign short MET1 escapes; never route shared-Y long MET3 buses.
    """
    columns=defaultdict(list)
    for points in netmap.values():
        for ident,layer,x,y,*_ in points:
            if ident.startswith('X') and '/' in ident and layer in {'m1','met1','metal1'}:
                columns[x].append((ident,y))
    ranks={}
    for x,points in columns.items():
        ys=sorted(y for _,y in points)
        if len(ys)!=len(set(ys)):
            raise ValueError('unseparable source Metal1 hierarchical pins at X='+str(x))
        for ident,y in points:
            rank=ys.index(y)-(len(ys)-1)//2
            if abs(rank)>8 or ident in ranks:
                raise ValueError('out-of-bounds or duplicate hierarchy escape '+ident)
            ranks[ident]=rank
    return ranks

def token(x):
    if not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_.$!:/-]*',x):
        raise ValueError('unsafe SPICE/Tcl identifier '+x)
    return '{'+x+'}'

def dependency_order(subs,top):
    order=[]
    def walk(cell,seen):
        if cell in seen:raise ValueError('recursive SPICE graph')
        if cell in order:return
        for _,_,master in subs[cell]['instances']:
            if master in subs:walk(master,seen+(cell,))
        order.append(cell)
    walk(top,())
    return order

def parent_tracks(subs,uses,netmap,root,scale_um):
    """Route real child top-level terminals into the post-route halo."""
    import math,runpy
    if not scale_um or scale_um<=0:
        raise ValueError('no authenticated Magic PDK micron scale')
    step=max(1,math.ceil(0.70/scale_um))
    actual=runpy.run_path(str(Path(__file__).parent/'stage-m-postroute-placement.py'))['actual_bbox']
    tracks={}
    library=subs['library']
    for inst,nets,master in subs['instances']:
        if master not in library:
            continue
        if inst not in uses:
            raise ValueError('missing actual hierarchical placement '+inst)
        bound=transformed_box(actual(root/(master+'.mag')),uses[inst][1])
        ports=library[master]['ports']
        for index,port in enumerate(ports):
            ident=inst+'/'+port
            points=[p for group in netmap.values() for p in group if p[0]==ident]
            if len(points)!=1:
                raise ValueError('missing/duplicate actual child port '+ident)
            x=points[0][2]
            if abs(x-bound[0])<=abs(bound[2]-x):
                rx=bound[0]-(index+1)*step
            else:
                rx=bound[2]+(index+1)*step
            if rx==x or ident in tracks:
                raise ValueError('no separate child halo track '+ident)
            tracks[ident]=rx
    return tracks

def render(subs,root,top,only_cell=None,scale_um=None):
    order=dependency_order(subs,top)
    if only_cell is not None:
        if only_cell not in order:
            raise ValueError('non-DAG selected stage')
        order=[only_cell]
    output=['# GENERATED from pinned SPICE and native Magic geometry, not synthetic nets.']
    for name in order:
        uses,labels,bbox=mag(root/(name+'.mag'))
        if bbox is None:raise ValueError('missing placed geometry bbox '+name)
        netmap=defaultdict(list)
        sub=subs[name]
        for port in sub['ports']:
            hits=labels.get(port,[])
            if len(hits)!=1 or hits[0][0] not in LAYERS:raise ValueError('missing authentic port '+name+'/'+port)
            lay,x,y=hits[0]
            box=label_box(root/(name+'.mag'),port)
            netmap[port].append(('port:'+port,lay,x,y,*box,lay))
        for inst,nets,master in sub['instances']:
            ports=('D','G','S','B') if master.startswith('sky130_fd_pr__') else subs[master]['ports']
            for net,port in zip(nets,ports):
                netmap[net].append((inst+'/'+port,*pin(root,uses,inst,port)))
        if any(len(points)<2 for points in netmap.values()):
            raise ValueError('unconnected SPICE terminal in '+name)
        # Power rail must clear every authentic source port pad, not merely
        # the transistor-array bbox. In the native detector, t3 was at
        # Y=-1100 while the old ground rail Y=-1126 shorted them in Metal1.
        port_ymin=min(labels[p][0][2] for p in sub['ports'])
        is_parent=any(master in subs for _,_,master in sub['instances'])
        output+=['load '+token(name),
                 'set ::stage_m_is_parent '+('1' if is_parent else '0'),
                 'stage_m_begin_cell '+token(name)+' [list '+
                 ' '.join(map(str,bbox))+'] '+str(port_ymin)]
        if is_parent:
            if scale_um is None:
                raise ValueError('source-bound PDK micron scale required')
            context=dict(sub,library=subs)
            tracks=parent_tracks(context,uses,netmap,root,scale_um)
            for ident,track in sorted(tracks.items()):
                output.append('stage_m_hier_track '+token(ident)+' '+str(track))
            # Native MOS pads also need distinct escape ranks in parents.
            for ident,rank in sorted(hierarchical_escape_ranks(netmap).items()):
                if ident not in tracks:
                    output.append('stage_m_hier_escape '+token(ident)+' '+str(rank))
        else:
            for ident,offset in sorted(hierarchical_escape_ranks(netmap).items()):
                output.append('stage_m_hier_escape '+token(ident)+' '+str(offset))
        for net,points in sorted(netmap.items()):
            coords=' '.join('[list '+' '.join(
                (token(id),token(layer),str(x),str(y),
                 str(x1),str(y1),str(x2),str(y2),token(original)))
                +']' for id,layer,x,y,x1,y1,x2,y2,original in points)
            output.append('stage_m_route_net '+token(net)+' [list '+coords+']')
        output.append('stage_m_finish_cell '+token(name)+' [list '+' '.join(map(token,sub['ports']))+']')
    output.append('load '+token(top))
    return '\n'.join(output)+'\n'

def main():
    p=argparse.ArgumentParser()
    for arg in ('spice','mag-dir','cell'):
        p.add_argument('--'+arg,required=True)
    p.add_argument('--output')
    p.add_argument('--emit-order',action='store_true')
    p.add_argument('--only-cell')
    p.add_argument('--scale-um',type=float)
    a=p.parse_args();subs=circuits(a.spice)
    if a.cell not in subs:raise ValueError('missing selected top-level cell')
    if a.emit_order:
        print('\n'.join(dependency_order(subs,a.cell)))
        return
    if not a.output:raise ValueError('--output required for route plan')
    Path(a.output).write_text(render(subs,Path(a.mag_dir),a.cell,
                                     a.only_cell,a.scale_um))
    print('STAGE_M_GEOMETRY_ANCHORS_RESOLVED',a.only_cell or a.cell)

if __name__=='__main__':
    main()
