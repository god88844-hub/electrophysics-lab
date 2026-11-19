"""Static Stage M pre-push/CI checks; no native EDA binary is required."""
import ast
import pathlib
import shutil
import subprocess
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class StageMStatic(unittest.TestCase):
    def test_python_syntax(self):
        for name in ('stage-m-routing-plan.py','stage-m-parallel-ngspice.py'):
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
        for token in ('nwell','nsdm','psdm','licon1','li1','mcon','met1','met2','via',
                      'port make','label $p','2.72','0.17','0.15','drc count total',
                      'ext2spice cthresh 0','ext2spice rthresh 0'):
            self.assertIn(token,t)
    def test_real_spice_batch_and_fail_closed_passport(self):
        s=(ROOT/'scripts'/'stage-m-parallel-ngspice.py').read_text()
        for token in ('os.cpu_count()','ThreadPoolExecutor','-b','-o',
                      '6400','UNQUALIFIED_NO_GO','INSUFFICIENT_MODEL_DATA',
                      'sha256','mc_mm_switch'):
            self.assertIn(token,s)
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
if __name__=='__main__':
    unittest.main()
