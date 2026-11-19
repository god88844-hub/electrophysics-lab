"""Phase 0: expected absence of models is software PASS, never virtual yield PASS."""
import importlib.util
import pathlib
import tempfile
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('stage_m_phase0',ROOT/'scripts'/'stage-m-phase0-acceptance.py')
phase=importlib.util.module_from_spec(spec)
spec.loader.exec_module(phase)

def pinned_zero():
    return {
      'physicalLevel2':'UNQUALIFIED_NO_GO',
      'topLibrarySha256':phase.EXPECTED_PDK,
      'topLevelSections':list(phase.PINNED_SECTIONS),
      'auditedSection':'tt',
      'completeInstalledSpiceInventorySha256':{f'm/{x}':'0'*64 for x in range(783)},
      'includedFilesSha256':{f'm/{x}':{'sha256':'0'*64} for x in range(150)},
      'unresolvedIncludes':[],
      'authenticStatisticalModelCandidate':False,
      'activeMcMmReferencesInSelectedClosure':0,
      'activeMcPrReferencesInSelectedClosure':0,
      'activeRandomExpressionsInSelectedClosure':0,
      'bothStatisticalSwitchesEnabledInSelectedClosure':False,
      'nativeMcSectionPresent':False
    }

class StageMPhase0Test(unittest.TestCase):
    def test_exact_hash_and_zero_models_is_expected_no_go(self):
        self.assertEqual(phase.classify(pinned_zero()),'absent-authenticated')

    def test_never_pass_unknown_hash_or_incomplete_audit(self):
        for changed in ({'topLibrarySha256':'0'*64},
                        {'topLevelSections':['tt']},
                        {'unresolvedIncludes':['missing']},
                        {'physicalLevel2':'PHYSICALLY_QUALIFIED'}):
            audit=pinned_zero();audit.update(changed)
            with self.assertRaises(ValueError):
                phase.classify(audit)

    def test_active_statistical_models_must_not_claim_absence(self):
        for changed in (
          {'activeMcMmReferencesInSelectedClosure':1},
          {'activeMcPrReferencesInSelectedClosure':1},
          {'activeRandomExpressionsInSelectedClosure':1},
          {'bothStatisticalSwitchesEnabledInSelectedClosure':True},
          {'authenticStatisticalModelCandidate':True},
          {'nativeMcSectionPresent':True}):
            audit=pinned_zero();audit.update(changed)
            with self.assertRaises(ValueError):
                phase.classify(audit)

    def test_fabricated_alu_or_monte_carlo_pass_is_rejected(self):
        manifest={'aluNetlists':{
          f'r{radix}_w{width}':{'nativeLvsMatch':False,
             'aluInterconnectPexVerified':False}
          for radix in (2,3,4) for width in (4,8)}}
        with tempfile.TemporaryDirectory() as d:
            base=pathlib.Path(d)
            phase.reject_fabricated_results(base,manifest)
            (base/'native-monte-carlo').mkdir()
            (base/'native-monte-carlo'/'passport.json').write_text(
                '{"level1":"VIRTUALLY_QUALIFIED","completedNativeTrials":6400}')
            with self.assertRaises(ValueError):
                phase.reject_fabricated_results(base,manifest)
            (base/'native-monte-carlo'/'passport.json').unlink()
            manifest['aluNetlists']['r4_w8']['nativeLvsMatch']=True
            with self.assertRaises(ValueError):
                phase.reject_fabricated_results(base,manifest)

if __name__=='__main__':
    unittest.main()
