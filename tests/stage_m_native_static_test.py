"""Static Stage M pre-push/CI checks; no native EDA binary is required."""
import ast
import pathlib
import shutil
import subprocess
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class StageMStatic(unittest.TestCase):
    def test_python_syntax(self):
        for name in ('stage-m-routing-plan.py','stage-m-parallel-ngspice.py','stage-m-four-terminal-soa.py','stage-m-soa-waveform-capture.py','stage-m-trial-decks.py','stage-m-alu-assemble.py'):
            source=ROOT/'scripts'/name
            ast.parse(source.read_text(),filename=str(source))
    def test_tcl_syntax(self):
        if not shutil.which('tclsh'):
            self.skipTest('tclsh not on Python-only host')
        file=ROOT/'scripts'/'stage-m-magic-layout.tcl'
        code='set f [open {'+str(file)+'}]\nset data [read $f]\nclose $f\nputs [info complete $data]\n'
        value=subprocess.run(['tclsh'],input=code,text=True,capture_output=True,check=True)
        self.assertEqual(value.stdout.strip(),'1')
    def test_tcl_layers_pins_and_physical_checks(self):
        t=(ROOT/'scripts'/'stage-m-magic-layout.tcl').read_text()
        for token in ('nwell','nsc','psc','nsdm','psdm','licon1','li1','mcon','met1','met2','via',
                      'port make','label $p','2.72','0.17','0.15','drc list count total',
                      'ext2spice cthresh 0','ext2spice rthresh 0'):
            self.assertIn(token,t)
    def test_mask_labels_are_real_contact_compounds_not_fake_painted_layers(self):
        script=(ROOT/'scripts'/'stage-m-magic-layout.tcl').read_text()
        self.assertIn('stage_m_rect nsc',script)
        self.assertIn('stage_m_rect psc',script)
        self.assertNotIn('stage_m_contact licon1',script)
        self.assertNotIn('stage_m_rect nsdm',script)
        self.assertNotIn('stage_m_rect psdm',script)

    def test_real_spice_batch_and_fail_closed_passport(self):
        s=(ROOT/'scripts'/'stage-m-parallel-ngspice.py').read_text()
        for token in ('os.cpu_count()','ThreadPoolExecutor','-b','-o',
                      '6400','UNQUALIFIED_NO_GO','INSUFFICIENT_MODEL_DATA',
                      'sha256','mc_mm_switch'):
            self.assertIn(token,s)
    def test_real_mc_and_waveform_gates(self):
        mm=(ROOT/'scripts'/'stage-m-mm-corner-audit.mjs').read_text()
        runner=(ROOT/'scripts'/'stage-m-parallel-ngspice.py').read_text()
        soa=(ROOT/'scripts'/'stage-m-four-terminal-soa.py').read_text()
        decks=(ROOT/'scripts'/'stage-m-trial-decks.py').read_text()
        for token in ("section(processed,'mc')",'mc_mm_switch','mc_pr_switch',
                      'selectedLibrarySectionSha256'):
            self.assertIn(token,mm)
        for token in ('fourTerminalSOAEvidenceSha256','pdkCorner','mc_pr_switch',
                      'SOA_FOUR_TERMINAL_TRANSIENT_SCREEN_PASS'):
            self.assertIn(token,runner)
        for token in ('SOA=1.95','drain_v','gate_v','source_v','bulk_v',
                      'SOA_OXIDE_OVERSTRESS','fourTerminalTransientSOAEvidenceVerified'):
            self.assertIn(token,soa)
        for token in ('6400','Missing real PEX ALU','selectedLibrarySectionSha256',
                      'AUTHENTICATED_DECKS_NOT_EXECUTED'):
            self.assertIn(token,decks)
    def test_soadynamic_rejects_real_overvoltage_samples(self):
        import importlib.util,tempfile
        spec=importlib.util.spec_from_file_location(
            'stage_m_four_terminal',ROOT/'scripts'/'stage-m-four-terminal-soa.py')
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as tmp:
            file=pathlib.Path(tmp)/'trace.csv'
            file.write_text('device,time_s,drain_v,gate_v,source_v,bulk_v\n'
                            'a/Xa,0,0,1.89,0,0\n'
                            'a/Xa,1e-9,1.2,0,0,0\n')
            got=module.trace(file,{'a/Xa':'sky130_fd_pr__nfet_01v8'})
            self.assertLessEqual(got['maxAbsTerminalStressV']['Vgs'],1.95)
            file.write_text('device,time_s,drain_v,gate_v,source_v,bulk_v\n'
                            'a/Xa,0,0,2.1,0,0\n'
                            'a/Xa,1e-9,0,0,0,0\n')
            with self.assertRaisesRegex(ValueError,'SOA_OXIDE_OVERSTRESS'):
                module.trace(file,{'a/Xa':'sky130_fd_pr__nfet_01v8'})

    def test_contact_alias_rectangle_and_alu_truth_table(self):
        import importlib.util,tempfile
        from pathlib import Path
        def module(filename,modname):
            spec=importlib.util.spec_from_file_location(modname,ROOT/'scripts'/filename)
            result=importlib.util.module_from_spec(spec)
            spec.loader.exec_module(result)
            return result
        route=module('stage-m-routing-plan.py','stage_m_native_contact_rectangles')
        for name in ('ndc','pdc','pc','ndiffc','pdiffc','polycont'):
            self.assertEqual(route.CONTACT_TO_LI1.get(name),'li1')
        with tempfile.TemporaryDirectory() as d:
            master=Path(d)/'mos.mag'
            master.write_text('magic\ntech sky130A\n<< labels >>\n'
                              'rlabel ndc 2 4 6 8 0 D\n'
                              'rlabel pdc 2 14 6 18 0 S\n'
                              'rlabel pc 2 24 6 28 0 G\n'
                              '<< end >>\n')
            uses={'Xn':['mos',[1,0,10,0,1,20]]}
            drain=route.pin(Path(d),uses,'Xn','D')
            self.assertEqual(drain,('li1',14,26,12,24,16,28,'ndc'))
            self.assertEqual(route.pin(Path(d),uses,'Xn','S')[-1],'pdc')
            self.assertEqual(route.pin(Path(d),uses,'Xn','G')[-1],'pc')
        alu=module('stage-m-alu-assemble.py','stage_m_alu_pex_lut')
        alu.validate_logic()
        for radix in (2,3,4):
            for width in (4,8):
                name,spice,count=alu.assemble(radix,width)
                self.assertIn('.subckt '+name,spice)
                self.assertIn('.ends '+name,spice)
                self.assertEqual(count,2*width*(radix*radix+radix+1)+1)
                self.assertEqual(sum(line.startswith('X') for line in spice.splitlines()),count)
                self.assertNotIn('VCVS',spice.upper())

    def test_magic_instance_box_transforms_define_real_route_envelope(self):
        import importlib.util,tempfile
        from pathlib import Path
        spec=importlib.util.spec_from_file_location(
            'stage_m_transformed_magic_bbox',
            ROOT/'scripts'/'stage-m-routing-plan.py')
        mod=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        with tempfile.TemporaryDirectory() as d:
            source=Path(d)/'placed.mag'
            source.write_text('magic\ntech sky130A\n'
                'use mos A\ntransform 1 0 1000 0 1 2000\n'
                'box -50 -100 50 100\n'
                'use mos B\ntransform 1 0 -1000 0 1 -2000\n'
                'box -50 -100 50 100\n'
                '<< labels >>\n<< end >>\n')
            _,_,bbox=mod.mag(source)
            self.assertEqual(bbox,[-1050,-2100,1050,2100])

    def test_magic_numeric_drc_and_real_short_rejection(self):
        layout=(ROOT/'scripts'/'stage-m-magic-layout.tcl').read_text()
        native=(ROOT/'scripts'/'stage-m-native-eda.sh').read_text()
        self.assertIn('drc list count total',layout)
        self.assertIn('EXTRACTION_ELECTRICAL_SHORTS',native)
        self.assertIn('electrically shorted',native)

    def test_engineering_acceptance_never_waives_soa_or_level2(self):
        import json
        cfg=json.loads((ROOT/'benchmarks'/'stage-m-qualification-thresholds.json').read_text())
        self.assertEqual(cfg['schema'],'invention-lab/stage-m-level1-engineering-acceptance/1')
        gates=cfg['physicalGate']
        self.assertEqual(gates['maxCorePairwiseTerminalVoltageV'],1.95)
        self.assertEqual(gates['maxSOAViolations'],0)
        self.assertEqual(gates['magicDrcMaxErrors'],0)
        self.assertEqual(gates['netgenLvsMaxMismatches'],0)
        self.assertEqual(gates['level2'],'UNQUALIFIED_NO_GO')
        self.assertGreaterEqual(cfg['minimumWilsonLower95'],0.9)
        self.assertEqual(set(cfg['aluBudgets']),{f'{r}:{w}' for r in (2,3,4) for w in (4,8)})
        self.assertTrue(all(v>=0.12 for v in cfg['minimumNoiseMarginsV'].values()))

    def test_model_inventory_and_balanced_spice(self):
        models={'sky130_fd_pr__nfet_01v8_lvt','sky130_fd_pr__nfet_01v8',
                'sky130_fd_pr__pfet_01v8','sky130_fd_pr__pfet_01v8_hvt'}
        for name in ('q4_thresh_det','q4_inv','q4_mux4','q4_half_adder'):
            raw=(ROOT/'designs'/'stage-m'/'q4-candidates'/(name+'.spice')).read_text()
            a=[line.split()[1] for line in raw.splitlines() if line.lower().startswith('.subckt ')]
            b=[line.split()[1] for line in raw.splitlines() if line.lower().startswith('.ends ')]
            self.assertEqual(a,b)
            self.assertIn(name,a)
            self.assertNotIn('pfet_01v8_lvt',raw)
            for line in raw.splitlines():
                if line.lower().startswith('x') and 'sky130_fd_pr__' in line:
                    self.assertIn(next(x for x in line.split() if x.startswith('sky130_fd_pr__')),models)
    def test_native_magic_font_and_sticky_port_labels(self):
        import importlib.util
        import tempfile
        from pathlib import Path
        spec=importlib.util.spec_from_file_location(
            'stage_m_route_labels',ROOT/'scripts'/'stage-m-routing-plan.py')
        mod=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        with tempfile.TemporaryDirectory() as d:
            file=Path(d)/'q4_thresh_det.mag'
            file.write_text(
                'magic\ntech sky130A\n<< labels >>\n'
                'flabel metal1 s 20 30 60 70 0 FreeSans 200 0 0 0 vin\n'
                'rlabel met1 s 10 20 20 30 0 VDD\n'
                'flabel locali 10 20 20 30 0 FreeSans 200 0 0 0 G\n'
                '<< end >>\n')
            _,labels,_=mod.mag(file)
            self.assertEqual(labels['vin'],[('metal1',40,50)])
            self.assertEqual(labels['VDD'],[('met1',15,25)])
            self.assertEqual(labels['G'],[('locali',15,25)])
            file.write_text(
                'magic\n<< labels >>\n'
                'flabel metal1 s wrong 0 2 2 0 FreeSans 200 0 0 0 vin\n'
                '<< end >>\n')
            with self.assertRaisesRegex(ValueError,'noninteger'):
                mod.mag(file)

    def test_authentic_sky130_contact_to_li1_preserves_bare_diffusion_guard(self):
        import importlib.util
        import tempfile
        from pathlib import Path
        spec=importlib.util.spec_from_file_location(
            'stage_m_contacts',ROOT/'scripts'/'stage-m-routing-plan.py')
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            master=root/'mos.mag'
            labels=[
                ('ndiffc','D'),('pdiffc','S'),('polycont','G'),
                ('psubdiffcont','B'),('nsubdiffcont','T')]
            master.write_text(
                'magic\ntech sky130A\n<< labels >>\n'+
                ''.join(f'rlabel {layer} 0 {i*10} 2 {i*10+2} 0 {name}\n'
                        for i,(layer,name) in enumerate(labels))+
                '<< end >>\n')
            uses={'Xn':['mos',[1,0,10,0,1,20]]}
            for _,name in labels:
                self.assertEqual(module.pin(root,uses,'Xn',name)[0],'li1')
            master.write_text(
                'magic\ntech sky130A\n<< labels >>\n'
                'rlabel ndiff 0 0 2 2 0 D\n<< end >>\n')
            with self.assertRaisesRegex(ValueError,'uncontactable'):
                module.pin(root,uses,'Xn','D')

    def test_source_port_colon_is_tcl_brace_quoted_and_no_injection(self):
        import importlib.util
        spec=importlib.util.spec_from_file_location(
            'stage_m_safe_token',ROOT/'scripts'/'stage-m-routing-plan.py')
        mod=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        self.assertEqual(mod.token('port:t1'),'{port:t1}')
        for bad in ('port:t1;exec','port:t1\\nputs', 'port:{bad}'):
            with self.assertRaisesRegex(ValueError,'unsafe'):
                mod.token(bad)

    def test_schematic_instance_slash_quoted_without_tcl_injection(self):
        import importlib.util
        spec=importlib.util.spec_from_file_location(
            'stage_m_safe_slash',ROOT/'scripts'/'stage-m-routing-plan.py')
        mod=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        self.assertEqual(mod.token('Xn_buf_lo/D'),'{Xn_buf_lo/D}')
        for bad in ('Xn_buf_lo/D;exec','Xn_buf_lo/D\\nexec','Xn_buf_lo/[exec]'):
            with self.assertRaisesRegex(ValueError,'unsafe'):
                mod.token(bad)

if __name__=='__main__':
    unittest.main()
