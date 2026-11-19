"""Bottom-up physical placement static regression; never claims DRC/LVS signoff."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location(
    'stage_m_postroute',ROOT/'scripts'/'stage-m-postroute-placement.py')
placer=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(placer)

class PostRoutePlacementTests(unittest.TestCase):
    def _fixture(self,root):
        source=root/'design.spice'
        source.write_text(
            '.subckt child a b\n.ends child\n'
            '.subckt parent a b\n'
            'Xleft a b child\nXright a b child\n'
            '.ends parent\n')
        (root/'child.mag').write_text(
            'magic\ntech sky130A\n<< metal1 >>\n'
            'rect -500 -200 600 300\n<< labels >>\n<< end >>\n')
        (root/'child.stage-m-routed').write_text(
            'native DRC checks completed; LVS still required\n')
        (root/'parent.mag').write_text(
            'magic\ntech sky130A\n<< metal1 >>\nrect 0 0 100 100\n'
            'use child  Xleft\ntransform 1 0 0 0 1 0\n'
            'box -500 -200 600 300\n'
            'use child  Xright\ntransform 1 0 50 0 1 0\n'
            'box -500 -200 600 300\n'
            '<< labels >>\n<< end >>\n')
        return source

    def test_negative_origin_halo_and_independent_axes(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source=self._fixture(root)
            data=placer.place_parent(root,source,'parent',2.0,0.01,
                root/'bbox-report.json')
            self.assertEqual(len(data['children']),2)
            self.assertEqual(data['haloDbu'],200)
            rects=[(v['instance'],tuple(v['translatedBBox']))
                   for v in data['children']]
            self.assertTrue(placer.check_halo(rects,200))
            self.assertTrue(all(rect[0]>=300 and rect[1]>=300
                                for _,rect in rects))
            self.assertEqual(placer.actual_bbox(root/'child.mag'),
                             (-500,-200,600,300))
            lines=(root/'parent.mag').read_text()
            self.assertNotIn('transform 1 0 50 0 1 0',lines)
            updated=placer.inspect_mag(root/'parent.mag')[2]
            self.assertEqual(len(updated),2)

    def test_uninstanced_mos_rows_are_spaced_after_native_reflow(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source=self._fixture(root)
            mos=root/'sky130_fd_pr__nfet_01v8_X.mag'
            mos.write_text('magic\ntech sky130A\n'
                           '<< metal1 >>\nrect -200 -300 200 300\n'
                           '<< labels >>\n<< end >>\n')
            original=(root/'parent.mag').read_text()
            # The importer first placed two un-routed MOS instances atop
            # each other; the genuine MOS local bbox includes negative Y.
            original=original.replace('<< labels >>',
                'use sky130_fd_pr__nfet_01v8_X Xn1\n'
                'transform 1 0 0 0 1 0\nbox -200 -300 200 300\n'
                'use sky130_fd_pr__nfet_01v8_X Xn2\n'
                'transform 1 0 15 0 1 10\nbox -200 -300 200 300\n'
                '<< labels >>')
            (root/'parent.mag').write_text(original)
            data=placer.place_parent(root,source,'parent',2.0,0.01,
                root/'bbox-report.json')
            rows=data['parentMosRows']
            self.assertEqual(len(rows),2)
            self.assertGreaterEqual(data['parentMosRowGapDbu'],272)
            self.assertGreaterEqual(rows[1]['translatedBBox'][1]-
                rows[0]['translatedBBox'][3],data['parentMosRowGapDbu'])
            self.assertEqual(rows[0]['translatedBBox'][0],
                             rows[1]['translatedBBox'][0])
            self.assertTrue(all(c['translatedBBox'][1]>
                                rows[-1]['translatedBBox'][3] for c in data['children']))

    def test_halo_includes_routed_port_track_banks(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source=self._fixture(root)
            data=placer.place_parent(root,source,'parent',2.0,0.01,
                root/'bbox-report.json')
            # Two child pins, each may escape by 0.70 um per index.
            # 2.0 um base halo plus two two-pin track banks.
            self.assertEqual(data['haloDbu'],200)
            self.assertGreaterEqual(data['routingChannelDbu'],200+2*2*70)
            children=[(c['instance'],tuple(c['translatedBBox']))
                      for c in data['children']]
            self.assertTrue(placer.check_halo(children,data['routingChannelDbu']))
            for child in data['children']:
                self.assertEqual(len(child['childPostRouteSha256']),64)

    def test_reject_overlap_and_halo_violation(self):
        with self.assertRaisesRegex(ValueError,'STAGE_M_CHILD_BBOX_COLLISION'):
            placer.check_halo([('Xleft',(0,0,100,100)),
                ('Xright',(250,250,350,350))],200)
        self.assertTrue(placer.check_halo([('Xleft',(0,0,100,100)),
            ('Xright',(300,300,400,400))],200))

    def test_fail_closed_missing_post_route_marker_and_bad_scale(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source=self._fixture(root)
            (root/'child.stage-m-routed').unlink()
            with self.assertRaisesRegex(ValueError,'missing routed native child'):
                placer.place_parent(root,source,'parent',2.0,0.01,
                    root/'bbox-report.json')
            with self.assertRaises(ValueError):
                placer.place_parent(root,source,'parent',1.9,0.01,
                    root/'bbox-report.json')

    def test_half_adder_child_pin_transform_from_real_native_artifact(self):
        import importlib.util
        route_spec=importlib.util.spec_from_file_location(
            'stage_m_half_adder_grid',
            ROOT/'scripts'/'stage-m-routing-plan.py')
        route=importlib.util.module_from_spec(route_spec)
        route_spec.loader.exec_module(route)
        # CI #44522615670: Xsum_a transformation is (501081,536910)
        # in the source placement plan, and (1002162,1073820) in the
        # saved parent .mag. Child q4_mux4 M3 'sel' label centre is
        # (100,97281) in its saved master. The physical parent endpoint
        # is (1002262,1171101), whose i-grid is half those coordinates.
        trans=[1,0,501081,0,1,536910]
        source=('met3',501181,634191,501148,634158,
                501214,634224,'met3')
        mapped=route.half_adder_child_m3_grid(source,trans)
        self.assertEqual(mapped[1],1002362)
        self.assertEqual(mapped[2],1268382)
        self.assertEqual(mapped[3],1002296)
        self.assertEqual(mapped[4],1268316)
        self.assertNotEqual(mapped[2],1171101)
        self.assertNotEqual(mapped[2],634191)
        self.assertLess(mapped[3],mapped[1])
        self.assertLess(mapped[1],mapped[5])
        with self.assertRaisesRegex(ValueError,'unauthenticated'):
            route.half_adder_child_m3_grid(
                ('metal1',*source[1:7],'metal1'),trans)

    def test_duplicate_importer_label_resolves_only_sha_bound_routed_port(self):
        import hashlib
        route_spec=importlib.util.spec_from_file_location(
            'stage_m_routed_port_source',
            ROOT/'scripts'/'stage-m-routing-plan.py')
        route=importlib.util.module_from_spec(route_spec)
        route_spec.loader.exec_module(route)
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            cell=root/'child.mag'
            cell.write_text('magic\ntech sky130A\n<< labels >>\n'
                            'rlabel metal1 0 0 20 20 0 vin\n'
                            'rlabel met3 400 500 420 520 0 vin\n'
                            '<< end >>\n')
            uses={'Xdet':['child',[1,0,100,0,1,200]]}
            with self.assertRaisesRegex(ValueError,'ambiguous port'):
                route.pin(root,uses,'Xdet','vin')
            marker=root/'child.stage-m-routed'
            marker.write_text(hashlib.sha256(cell.read_bytes()).hexdigest()+
                              '  child.mag\n')
            label=route.pin(root,uses,'Xdet','vin')
            self.assertEqual(label,('met3',510,710,500,700,520,720,'met3'))
            cell.write_text(cell.read_text()+'* changed after DRC\n')
            with self.assertRaisesRegex(ValueError,'SHA-256 mismatch'):
                route.pin(root,uses,'Xdet','vin')

    def test_source_and_magic_route_preserve_native_gates(self):
        text=(ROOT/'scripts'/'stage-m-native-eda.sh').read_text()
        layout=(ROOT/'scripts'/'stage-m-magic-layout.tcl').read_text()
        planner=(ROOT/'scripts'/'stage-m-routing-plan.py').read_text()
        for token in ('--emit-order','--only-cell','--halo-um 2.0',
                      '--scale-um "$scale"','--cell "$sub"','stage-m-routed',
                      'NETGEN_TOP_LEVEL_LVS_FAILED'):
            self.assertIn(token,text)
        for token in ('stage_m_segment met3','stage_m_contact via2',
                      'stage_m_segment met2','stage_m_finish_cell',
                      'drc list count total','ext2spice cthresh 0',
                      'ext2spice rthresh 0'):
            self.assertIn(token,layout)
        self.assertIn("met3','metal3",planner)
        self.assertIn('STAGE_M_CHILD_BBOX_COLLISION',
                      (ROOT/'scripts'/'stage-m-postroute-placement.py').read_text())
        self.assertNotIn('UNQUALIFIED_NO_GO' ,'VIRTUALLY_QUALIFIED')

if __name__=='__main__':
    unittest.main()
