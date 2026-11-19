#!/usr/bin/env python3
"""Place SKY130 hierarchy from ACTUAL saved post-route Magic child bounds.

This script is a fail-closed placement preflight, NOT DRC, LVS, or qualification.
It only moves nested SPICE subcircuit instances, leaving genuine MOS geometry
and existing parent pins unchanged. Magic/Netgen must verify the result.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import re

ROOT_LAYER_SKIP = {'checkpaint', 'labels', 'properties', 'end'}
USE_RE = re.compile(r'^use\s+(\S+)\s+(\S+)\s*$')
TRANS_RE = re.compile(r'^transform\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s*$')
BOX_RE = re.compile(r'^box\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s*$')
RECT_RE = re.compile(r'^rect\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s*$')

def merge_bbox(a, b):
    if b[2] <= b[0] or b[3] <= b[1]:
        raise ValueError('invalid nonpositive Magic bounding box')
    if a is None:
        return tuple(b)
    return (min(a[0], b[0]), min(a[1], b[1]),
            max(a[2], b[2]), max(a[3], b[3]))

def transform_bbox(box, transform):
    a,b,c,d,e,f = transform
    points = [(a*x+b*y+c,d*x+e*y+f)
              for x in (box[0],box[2]) for y in (box[1],box[3])]
    return (min(p[0] for p in points), min(p[1] for p in points),
            max(p[0] for p in points), max(p[1] for p in points))

def inspect_mag(path):
    lines = Path(path).read_text(encoding='utf-8').splitlines(keepends=True)
    if not lines or lines[0].strip() != 'magic':
        raise ValueError('not authentic Magic source: '+str(path))
    section=None
    root_box=None
    uses=[]
    current=None
    for index, raw in enumerate(lines):
        line = raw.strip()
        if line.startswith('<<') and line.endswith('>>'):
            section = line.strip('<> ')
            current = None
            continue
        mat = RECT_RE.fullmatch(line)
        if mat and section not in ROOT_LAYER_SKIP:
            root_box=merge_bbox(root_box, tuple(map(int,mat.groups())))
            continue
        mat = USE_RE.fullmatch(line)
        if mat:
            current={'master':mat.group(1),'instance':mat.group(2),
                     'transform_idx':None,'box_idx':None,'transform':None,'box':None}
            uses.append(current)
            continue
        if current is not None:
            mat=TRANS_RE.fullmatch(line)
            if mat:
                if current['transform'] is not None:
                    raise ValueError('duplicate Magic instance transform')
                current['transform_idx']=index
                current['transform']=tuple(map(int,mat.groups()))
                continue
            mat=BOX_RE.fullmatch(line)
            if mat:
                if current['box'] is not None:
                    raise ValueError('duplicate Magic instance bbox')
                current['box_idx']=index
                current['box']=tuple(map(int,mat.groups()))
                continue
    if any(v['transform'] is None or v['box'] is None for v in uses):
        raise ValueError('instance missing real Magic transform/bbox')
    return lines,root_box,uses

def actual_bbox(path):
    _,bbox,uses=inspect_mag(path)
    for use in uses:
        bbox=merge_bbox(bbox,transform_bbox(use['box'],use['transform']))
    if bbox is None:
        raise ValueError('empty post-route cell '+str(path))
    return bbox

def check_halo(boxes, halo):
    """Require halo on BOTH X and Y axes between every pair of child boxes."""
    for i, (name1, a) in enumerate(boxes):
        for name2,b in boxes[i+1:]:
            separated_x = a[2]+halo <= b[0] or b[2]+halo <= a[0]
            separated_y = a[3]+halo <= b[1] or b[3]+halo <= a[1]
            if not (separated_x and separated_y):
                raise ValueError('STAGE_M_CHILD_BBOX_COLLISION '+name1+'/'+name2+
                                 ' actual='+str(a)+'/'+str(b)+
                                 ' halo='+str(halo))
    return True

def subcircuits(path):
    names=set()
    for line in Path(path).read_text().splitlines():
        mat=re.match(r'^\s*\.subckt\s+(\S+)',line,re.I)
        if mat:
            if mat.group(1) in names:
                raise ValueError('duplicate schematic subcircuit')
            names.add(mat.group(1))
    if not names:
        raise ValueError('empty source circuit inventory')
    return names

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def place_parent(mag_dir, source, cell, halo_um, scale_um, report):
    if halo_um < 2.0 or not math.isfinite(halo_um) or scale_um <= 0 or not math.isfinite(scale_um):
        raise ValueError('unqualified halo/Pdk metric; require >=2.0 um')
    halo=math.ceil(halo_um/scale_um)
    if halo < 1:
        raise ValueError('unusable Magic halo grid')
    root=Path(mag_dir)
    path=root/(cell+'.mag')
    lines,static,uses=inspect_mag(path)
    masters=subcircuits(source)
    children=[x for x in uses if x['master'] in masters]
    if not children:
        data={'cell':cell,'haloUm':halo_um,'haloDbu':halo,
              'stage':'LEAF_NO_HIERARCHICAL_INSTANCE','children':[]}
        Path(report).write_text(json.dumps(data,indent=2)+'\n')
        return data
    # The original importer packed UNROUTED parent MOS devices into a dense
    # bank; their distinct D/S nets share the same Y, and neighbouring G/B
    # contacts can be separated by less than a MET3 routing width.
    # Spread parent-owned MOS devices into individual rows using their REAL
    # native device master footprints before routing child/parent signals.
    # A row is at least 2.72 um beyond the last complete device envelope.
    if static is None:
        raise ValueError('parent lacks authentic fixed port-bank geometry')
    static_root=tuple(static)
    row_gap=max(math.ceil(2.72/scale_um),halo)
    fixed_mos=[u for u in uses if u not in children]
    if any(not u['master'].startswith('sky130_fd_pr__') for u in fixed_mos):
        raise ValueError('unrecognized parent-owned instance in source geometry')
    mos_cursor_y=static[3]+row_gap
    # Reserve eight external port escapes at 1.20 um pitch to the
    # RIGHT of the original pin bank before positioning native MOS rows.
    # Parent terminals must never reuse the port MET2 x-coordinates.
    mos_column_x=static[2]+8*row_gap
    fixed_records=[]
    prior=None
    for use in sorted(fixed_mos,key=lambda item:item['instance']):
        masterpath=root/(use['master']+'.mag')
        if not masterpath.is_file():
            raise ValueError('native MOS cell absent for row reflow '+use['master'])
        bbox=actual_bbox(masterpath)
        a,b,_,d,e,_=use['transform']
        if abs(a*e-b*d)!=1:
            raise ValueError('invalid MOS native orientation '+use['instance'])
        transformed=transform_bbox(bbox,(a,b,0,d,e,0))
        dx=mos_column_x-transformed[0]
        dy=mos_cursor_y-transformed[1]
        transform=(a,b,dx,d,e,dy)
        translated=transform_bbox(bbox,transform)
        if translated[0]!=mos_column_x or translated[1]!=mos_cursor_y:
            raise ValueError('MOS negative-origin compensation failed')
        if prior is not None and translated[1]-prior[3]<row_gap:
            raise ValueError('parent MOS rows violate route clearance')
        use['transform']=transform
        use['box']=bbox
        lines[use['transform_idx']]='transform '+' '.join(map(str,transform))+'\n'
        lines[use['box_idx']]='box '+' '.join(map(str,bbox))+'\n'
        static=merge_bbox(static,translated)
        fixed_records.append({'instance':use['instance'],'master':use['master'],
                              'sourceSha256':sha256(masterpath),'translatedBBox':translated})
        prior=translated
        mos_cursor_y=translated[3]+row_gap
    # Horizontal parent MET2 escapes can occupy multiple 0.70 um tracks
    # on BOTH sides of an inter-child channel. A 2 um bbox halo alone
    # leaves these imported wires inside the previous routed child's
    # bounding box. Reserve track width for *both* neighbours plus 2 um.
    pin_counts={}
    for line in Path(source).read_text().splitlines():
        mat=re.match(r'^\s*\.subckt\s+(\S+)\s+(.+)$',line,re.I)
        if mat:
            if mat.group(1) in pin_counts:
                raise ValueError('duplicate source subcircuit for halo allocation')
            pin_counts[mat.group(1)]=len(mat.group(2).split())
    if not all(u['master'] in pin_counts and pin_counts[u['master']]>0 for u in children):
        raise ValueError('child source pin count required for routed channel')
    max_pins=max(pin_counts[u['master']] for u in children)
    track_step=math.ceil(0.70/scale_um)
    routing_gap=halo+2*max_pins*track_step
    cursor_x = static[2]+2*routing_gap
    cursor_y = static[3]+2*routing_gap
    placed=[]
    records=[]
    for use in sorted(children,key=lambda u:u['instance']):
        master=use['master']
        childpath=root/(master+'.mag')
        done=root/(master+'.stage-m-routed')
        if not childpath.is_file() or not done.is_file():
            raise ValueError('missing routed native child '+master)
        bbox=actual_bbox(childpath)
        a,b,_,d,e,_=use['transform']
        if abs(a*e-b*d)!=1:
            raise ValueError('non-Manhattan/native orientation '+use['instance'])
        transformed=transform_bbox(bbox,(a,b,0,d,e,0))
        dx=cursor_x-transformed[0]
        dy=cursor_y-transformed[1]
        transform=(a,b,dx,d,e,dy)
        translated=transform_bbox(bbox,transform)
        if translated[0] != cursor_x or translated[1] != cursor_y:
            raise ValueError('negative-origin compensation failed')
        use['transform']=transform
        use['box']=bbox
        lines[use['transform_idx']]='transform '+' '.join(map(str,transform))+'\n'
        lines[use['box_idx']]='box '+' '.join(map(str,bbox))+'\n'
        placed.append((use['instance'],translated))
        records.append({'instance':use['instance'],'master':master,
                        'childPostRouteSha256':sha256(childpath),
                        'childLocalBBox':bbox,'transform':transform,
                        'translatedBBox':translated})
        cursor_x=translated[2]+routing_gap
        cursor_y=translated[3]+routing_gap
    check_halo(placed,halo)
    # Two independently routed adjacent child port banks must not consume
    # one another's physical footprint or leave less than 2 um spacing.
    check_halo(placed,routing_gap)
    if any(box[0] < static[2]+halo or box[1] < static[3]+halo for _,box in placed):
        raise ValueError('child intersects fixed native transistor/port envelope')
    path.write_text(''.join(lines))
    # Validate that the reserialized Magic source exactly reflects the plan.
    _,_,verify=inspect_mag(path)
    actual=[(u['instance'],transform_bbox(u['box'],u['transform']))
            for u in verify if u['master'] in masters]
    check_halo(actual,halo)
    if {x[0]:x[1] for x in actual}!={x[0]:x[1] for x in placed}:
        raise ValueError('post-write child transform mismatch')
    data={'cell':cell,'stage':'BOTTOM_UP_RELOCATED_NOT_DRC_VERIFIED',
          'haloUm':halo_um,'scaleUmPerDbu':scale_um,'haloDbu':halo,
          'routingChannelDbu':routing_gap,'maxChildPorts':max_pins,
          'fixedGeometryBBox':static,'sourcePortBankBBox':static_root,
          'parentMosRows':fixed_records,'parentMosRowGapDbu':row_gap,
          'children':records,
          'parentMagSha256':sha256(path)}
    Path(report).write_text(json.dumps(data,indent=2)+'\n')
    return data

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--mag-dir',required=True)
    parser.add_argument('--spice',required=True)
    parser.add_argument('--cell',required=True)
    parser.add_argument('--halo-um',type=float,default=2.0)
    parser.add_argument('--scale-um',type=float,required=True)
    parser.add_argument('--report',required=True)
    args=parser.parse_args()
    data=place_parent(args.mag_dir,args.spice,args.cell,args.halo_um,
                      args.scale_um,args.report)
    print('STAGE_M_BOTTOM_UP_BBOX_HALO_PRECHECK '+json.dumps({
        'cell':data['cell'],'count':len(data['children']),'haloDbu':data['haloDbu']}))

if __name__=='__main__':
    main()
