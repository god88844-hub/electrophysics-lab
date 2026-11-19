# Stage Q — Optional real-hardware bridge (Phases 93–96)

**Research branch only.** Stage Q is stacked on unmerged Stage P; Stages M, N and O are also unmerged. `main` remains at the verified Phase 72 `09848a03` baseline. Do not merge or tag any physical release until all required evidence, dependencies, workflow checks and independent reviews actually pass.

## Phase 93: optional FPGA bridge

`js/hardware/phase93-fpga.js` builds exact binary-encoded functional half-adder reference RTL for binary, ternary and Q4; Q4 uses 2 FPGA bits for each quat, **not** analog 0, 1.1, 2.2, 3.3 V on binary CMOS FPGA pins. Generated HDL is a toolchain input only. `planOpenFPGAFlow` creates a bounded argv plan for Yosys, nextpnr-ice40, icepack and openFPGALoader, requiring a user-selected iCE40 board/package and explicit real PCF constraints. No tool is executed or FPGA flashed automatically. Syntax/logic equivalence checks are not bitstream validation.

`phase93-webserial.js` provides real browser Web Serial streaming *only after a user action and secure-context permission*. The 8-byte framing includes a start byte, sequence, four quat values and XOR parity; corrupt, out-of-order or invalid frames are rejected. A board serial label or WebSerial permission **does not establish independent device identity, firmware attestation or measurement calibration**.

## Phase 94: oscilloscopes, sigrok, sensors

`phase94-instrument-ingest.js` validates bounded SCPI ASCII waveform samples, Tektronix five-column captured CSV, sigrok time/digital CSV and time-series sensor CSV. A read-only SCPI adapter accepts an explicit injected VISA/SCPI transport; a production serial-VISA backend must be configured separately with actual installed drivers and permissions. Comparison results include RMSE, maximum absolute residual, and declared tolerance violations. The Stage Q panel plots captured and simulation curves, always labeled unqualified. USB permissions never grant release authority.

Recorded public oscilloscope evidence is checked against the **original immutable upstream bytes**, via `node scripts/phase94-recorded-trace.mjs`. Source: `admk/Tektronix-Waveform-Converter`, revision `3813bcfd719b17c1be3ffb757bf51d6aabdd3aef`, `Test Samples/TEK0001.CSV`, Git blob `df7f279887877e7405dbb91267f42e5315e0f213`. It contains 2,500 time/voltage samples and claims Tektronix TDS2012C, serial C011240. **The Git hash verifies public file identity, not instrument calibration, chip source matching or chain of custody.** No oscilloscope was physically attached to CI.

## Phase 95: original layout file intake, not tape-out

`phase95-tapeout-package.js` validates binary GDSII record framing and records original hashes for supplied GDSII, LEF, DEF, SPICE and test-vector files. It generates exhaustive reference test vectors. **It cannot manufacture authentic transistor-mapped GDSII from a high-level schematic**, or certify full GDS correctness, foundry DRC/LVS, PDK license rights, cell dimensions, signoff or Tiny Tapeout compatibility. Bundles remain `EVIDENCE_INTAKE_ONLY_NOT_FOUNDRY_READY` and `foundrySubmissionAuthorized:false`. A caller's `VIRTUALLY_QUALIFIED` JSON flag cannot substitute for a verified Level-1 passport.

## Phase 96: provisional calibration and physical qualification

`phase96-physical-qualification.js` checks claimed source IDs, capture digests, sensor/instrument metadata and sample-wise residuals. It computes a **provisional** bias, RMSE and uncertainty estimate that is not automatically inserted into a solver. The physically qualifying reviewer registry is empty in this research release. No arbitrary uploaded data, self-signed key or mock flag can promote a design to `PHYSICALLY_QUALIFIED`. `evaluatePhysicalQualification` returns `UNQUALIFIED_NO_GO`, preserves the original Level-1 status, and `requirePhysicalReleasePassport` refuses every release, including crafted fields. Future qualification requires an independently reviewed trust-root registry, signed verified original measurements, design/lot matching, blind holdouts, independently reviewed wafer/FPGA correlation, and explicit release authority. Physical instrument identity alone does not prove physical correctness.

## Tests and release gate

`npm test` runs Phase 93–96 protocol mocks, original-layout validation, residual/forged-attestation adversarial tests and the previous phases. `node scripts/phase94-recorded-trace.mjs` verifies and parses an original third-party public scope CSV (network required). Browser smoke checks the in-app panel without USB access. Linux/macOS/Windows Node checks plus Chromium are required.

**No release tag** `v1.0.0-invention-lab` is created while M–P remain unmerged, Stage Q tests are incomplete, and independent physical qualification data is missing. Source CI is not hardware certification. Existing Phase 30/52/54/72 fail-closed physical gates are unchanged.

## Optional live lab operation (manual, never CI)

To build a binary-emulated Q4 reference for a **user-owned, verified iCE40 board**, install the board-compatible Yosys, nextpnr-ice40, icepack and openFPGALoader tools, then run:

```bash
node scripts/phase93-local-fpga.mjs --board YOUR_SUPPORTED_BOARD --pcf YOUR_VALIDATED_PIN_MAP.pcf --device hx8k --package ct256 --output ./out/q4_half_adder.bin
```

This compiles but **does not flash**. Flashing is an independent operator action that requires both `--flash` and `--understand-physical-risk`. Never use example device or package values without confirming the board's actual voltage, clock, physical pins and flash mode. The generated design is a functional half-adder reference, not the user's synthesized transistor chip.

The optional native VISA read-only path requires separately installed PyVISA and a compatible VISA backend:

```bash
python scripts/phase94-visa-capture.py --resource YOUR_VERIFIED_VISA_RESOURCE --query CURV? --output scope.csv
```

The resulting raw file and SHA-256 report are **operator claims**, not independently authenticated foundry evidence. A recorded sample CSV can be imported in **3D View → Optional Real Hardware Bridge (Stage Q)**. Clicking **Connect FPGA UART** prompts for an actual browser Web Serial permission; a mock/connected port still cannot upgrade the physical passport.

The separate `python -m unittest discover -s tests -p phase94_visa_mock_test.py -v` regression uses only a fake VISA resource manager, not a live instrument.
