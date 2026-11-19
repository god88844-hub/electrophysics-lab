"""Static/transitive PDK provenance tests. No native EDA binary is used."""
import importlib.util
import pathlib
import tempfile
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
SCRIPT=ROOT/'scripts'/'stage-m-pdk-transitive-audit.py'
spec=importlib.util.spec_from_file_location('stage_m_transitive_pdk',SCRIPT)
audit_module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_module)

class StageMTransitivePdkTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=pathlib.Path(self.tmp.name)
        self.library=self.root/'sky130A'/'libs.tech'/'ngspice'/'sky130.lib.spice'
        self.library.parent.mkdir(parents=True)
        self.child=self.library.parent/'corner.spice'

    def check(self,content,corner):
        self.library.write_text(content)
        self.child.write_text(corner)
        return audit_module.audit(self.root,self.library)

    def test_nominal_corner_with_commented_randomness_is_not_statistical(self):
        result=self.check(
            '.lib tt\n.include "corner.spice"\n.endl tt\n',
            '* .param MC_MM_SWITCH=1\n* .param MC_PR_SWITCH=1\n'
            '* .param sigma=agauss(0,1,1)\n.param nominal=0\n')
        self.assertFalse(result['authenticStatisticalModelCandidate'])
        self.assertEqual(result['activeRandomExpressionsInSelectedClosure'],0)
        self.assertEqual(result['activeMcMmReferencesInSelectedClosure'],0)
        self.assertEqual(result['qualificationStatus'],'UNQUALIFIED_NO_GO')
        self.assertIn('sky130A/libs.tech/ngspice/corner.spice',
                      result['includedFilesSha256'])

    def test_switch_mentions_alone_do_not_authenticate_statistical_corner(self):
        result=self.check('.lib mc\n.include "corner.spice"\n.endl mc\n',
            '.param MC_MM_SWITCH=0\n.param MC_PR_SWITCH=0\n'
            '.param sigma={MC_MM_SWITCH*agauss(0,1,1)}\n')
        self.assertFalse(result['authenticStatisticalModelCandidate'])
        self.assertFalse(result['bothStatisticalSwitchesEnabledInSelectedClosure'])
        self.assertGreater(result['activeRandomExpressionsInSelectedClosure'],0)

    def test_authenticated_source_candidate_still_not_qualified(self):
        result=self.check('.lib mc\n.include "corner.spice"\n.endl mc\n',
            '.param MC_MM_SWITCH=1\n.param MC_PR_SWITCH=1\n'
            '.param sigma={MC_MM_SWITCH*agauss(0,1,1)}\n')
        self.assertTrue(result['authenticStatisticalModelCandidate'])
        self.assertTrue(result['bothStatisticalSwitchesEnabledInSelectedClosure'])
        self.assertEqual(result['auditedSection'],'mc')
        self.assertEqual(result['qualificationStatus'],
                         'SOURCE_CANDIDATE_REQUIRES_NATIVE_SPICE_VALIDATION')
        self.assertEqual(result['physicalLevel2'],'UNQUALIFIED_NO_GO')
        self.assertEqual(len(result['unresolvedIncludes']),0)
        self.assertEqual(len(result['topLibrarySha256']),64)

    def test_missing_transitive_include_is_fail_closed(self):
        self.library.write_text('.lib tt\n.include "absent.spice"\n.endl tt\n')
        result=audit_module.audit(self.root,self.library)
        self.assertFalse(result['authenticStatisticalModelCandidate'])
        self.assertEqual(len(result['unresolvedIncludes']),1)

if __name__=='__main__':
    unittest.main()
