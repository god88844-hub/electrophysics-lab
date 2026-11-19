"""Recorded acquisition only: mock PyVISA transport without physical devices."""
import importlib.util
import pathlib
import tempfile
import unittest

SOURCE = pathlib.Path(__file__).resolve().parents[1] / "scripts" / "phase94-visa-capture.py"
spec = importlib.util.spec_from_file_location("phase94visa", SOURCE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class MockInstrument:
    def __init__(self):
        self.timeout = None
        self.closed = False
    def query(self, query):
        if query not in mod.READ_ONLY:
            raise AssertionError("Disallowed VISA query")
        return "0,1.1,2.2,3.3\n"
    def close(self):
        self.closed = True


class MockManager:
    def __init__(self):
        self.instrument = MockInstrument()
        self.resource = None
        self.closed = False
    def open_resource(self, resource):
        self.resource = resource
        return self.instrument
    def close(self):
        self.closed = True


class TestVISA(unittest.TestCase):
    def test_mock_read_only_waveform_capture_and_digest(self):
        manager = MockManager()
        with tempfile.TemporaryDirectory() as directory:
            file = pathlib.Path(directory) / "scope.csv"
            report = mod.acquire(
                "USB0::0x0699::0x0363::C011240::INSTR",
                "CURV?", str(file), 3000, lambda: manager
            )
            self.assertEqual(file.read_text(), "0,1.1,2.2,3.3\n")
            self.assertEqual(report["bytes"], len(file.read_bytes()))
            self.assertEqual(len(report["rawSHA256"]), 64)
            self.assertEqual(report["physicalQualification"], "NO_GO")
            self.assertFalse(report["physicalSourceAuthenticated"])
            self.assertEqual(manager.instrument.timeout, 3000)
            self.assertTrue(manager.instrument.closed)
            self.assertTrue(manager.closed)

    def test_rejects_unsafe_queries_and_unbounded_output(self):
        with tempfile.TemporaryDirectory() as directory:
            p = str(pathlib.Path(directory) / "capture.csv")
            with self.assertRaises(ValueError):
                mod.acquire("USB0::INSTR", "*RST", p, 3000, MockManager)
            with self.assertRaises(ValueError):
                mod.acquire("USB0::INSTR", "CURV?", p, 60000, MockManager)


if __name__ == "__main__":
    unittest.main()
