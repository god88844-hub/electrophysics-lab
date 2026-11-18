# Local CAD-derived OBJ mesh inspection in the 3D workbench

Open **3D View → Engineering CAD**. Save a canonical component's explicit millimetre envelope; then select the component and a **local** triangulated Wavefront OBJ file in millimetres, +Y-up. Choose **Preview local OBJ in 3D**. Its visible dimensions must match the saved envelope within 0.05 mm or 0.5% (whichever is larger), otherwise the upload is refused. The mesh is never silently enlarged or squeezed to fit.

The file stays **in memory for this 3D-view session**; it is not uploaded to a server, persisted in the diagram or treated as authoritative 2D circuit or simulation data. On a new diagram or when the envelope is edited, the viewer discards imported mesh previews and falls back to the existing generic proxy. Supported input: ASCII Wavefront OBJ with 3D decimal vertices and triangular/quad faces, 20,000 vertices, 40,000 triangles, 4 MB, ±1000 mm coordinate bounds. Additional normals, texture references, object and material names are ignored; no referenced file is fetched. The result is drawn with the viewer's existing no-texture WebGL renderer.

**Not yet supported:** STEP/IGES parser, license review, trustworthy manufacturer sourcing, CAD units/unit transforms, model assembly constraints, connector pin solids, mesh watertightness or self-intersection checks, real material properties, physical calibration. A locally supplied OBJ cannot prove its manufacturer's identity, that the upstream STEP was correct, or that any dimensions were independently measured. Physical accuracy and hardware equivalence remain **unverified**.

Regression: `node --test tests/imported-obj-geometry.test.mjs`. No automatic CAD file download or trust is permitted.
