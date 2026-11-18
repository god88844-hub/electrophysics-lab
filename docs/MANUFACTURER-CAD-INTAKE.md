# Manufacturer CAD intake: integrity-only first gate

This is a **data-only** STEP asset admission protocol. No manufacturer CAD files are bundled, imported, parsed, rendered or sourced by this change. Existing 3D models remain **proxies**, not authentic manufacturer geometry.

The intake accepts a versioned record containing manufacturer, exact part number, revision, public HTTPS source page, license reference, MIME type, SHA-256 digest, byte length (max 25 MB), and explicit millimetre bounding box (each dimension >0 and <=300 mm). It rejects unknown fields, unsupported types, non-finite dimensions and obvious local-address/credential-bearing URLs. SHA-256 comparison confirms **only that supplied bytes match the submitted digest**. An attacker can supply false bytes with a matching false digest. No manufacturer attribution, STEP geometry analysis, dimension verification, secure acquisition or licensing clearance follows.

## Next qualification stages (NOT implemented)

1. Retrieve the asset through an actual manufacturer's official channel, recording source page, version, licensing and independently documented checksum; inspect redirects and host resolution in a controlled acquisition pipeline.
2. Quarantine assets with invalid record fields, digest mismatches or byte-size mismatches.
3. Introduce sandboxed STEP parsing and geometry unit/bounding-box checks; review asset licenses.
4. Match mechanical drawings and pins to the existing canonical netlist and 3D terminal/harness model, then validate geometry against independent measurements.

This module does not mutate diagrams or alter canonical electrical solvers, thermal models or graphics. No physical equivalence, manufactured accuracy or fabrication signoff is asserted.

Regression: `node --test tests/manufacturer-cad-intake.test.mjs`.
