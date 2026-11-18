# Interactive 3D experiment workbench — visualization upgrade

## Using 3D View

The same canonical Logic, Chip, CPU and Quantum schematic can now be inspected in an illustrative laboratory workspace with a raised anti-static table, engraved grid, modular housings, sockets, 3D cable harnesses, terminal pins and component-specific models. Procedural parts include battery cells, banded resistors, capacitors, diodes, fans, ICs, processors and quantum boards. No proprietary 3D asset files are needed.

The 3D canvas provides Isometric, Overhead, Front and Fit scene camera presets; drag to orbit, mouse wheel to zoom, click components to select, Shift+drag to move the underlying canonical design block and click output then input terminals to wire. Keyboard: arrows orbit, +/- zoom, Escape cancels wiring. Toggle back to 2D Wiring without losing data.

## Engineering evidence boundaries

This is a procedurally illustrated interactive 3D experiment workbench, not photorealistic manufacturer CAD, scale-accurate physical geometry, or an authenticated mechanical/fluid/thermal model. Source of truth remains the original diagram. Its physics/evidence verdicts do not change because of the visual representation. Canvas units are not millimeters. Above 180 blocks the rendering uses simpler components.

Future work for a genuinely realistic virtual experiment laboratory includes manufacturer CAD/glTF import, a physical scale and material system, wiring constraints, measured solver-driven animated instruments, GPU performance budgets, and representative user testing.

## Windows verification

After merging the update, use git pull, then npm test. Packaging now uses pure Node USTAR rather than GNU-only tar commands. Run npm start and open http://127.0.0.1:8080. Select an example, then click 3D View. A Windows symlink security regression is explicitly skipped only if the operating system refuses the creation of symlinks.
