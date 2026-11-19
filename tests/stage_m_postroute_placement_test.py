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
