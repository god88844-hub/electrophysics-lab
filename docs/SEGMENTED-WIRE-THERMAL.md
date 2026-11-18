# Segmented 1D heat-transfer workbench

## Scope and model boundaries

The existing single-node transient wire and opt-in canonical Chip DC MNA model remain unchanged. This optional 1D thermal calculation runs only on an explicitly configured conductor and **uses user-entered constant current**, not the solver's inferred DC current. It is not a coupled distributed circuit solve, FEM/CFD model, source-certified CAD, or measured hardware validation.

Open **3D View → Engineering CAD**, save a wire length, diameter, material, temperature and assumed current using **Wire physics**, then select a canonical wire and click **Simulate 1D wire heat transfer**. Enter 2–32 axial metal segments, ambient, convection coefficient, duration, timestep, contact resistance, optional jacket thickness/conductivity, and heat-sink conductances at both terminals. All inputs are modeling assumptions and do not represent calibrated values.

Each finite-volume segment has mass × heat capacity, temperature-dependent electrical resistance, a convection conductance in series with optional steady-state cylindrical jacket thermal resistance, and conductive links to adjacent segments using nominal metal thermal conductivity. Contact resistance heat is split between the first and last metal nodes. Terminal heat sinks use the specified ambient temperature. Explicit Euler advances the heat equation under a bounded conservative timestep check. A cumulative conservation ledger verifies **Joule energy − convection energy − end-sink energy − stored metal energy ≈ 0**.

The output exposes the final temperature for every segment, maximum temperature, mean temperature, electrical resistance, initial and final power, thermal conductances, energy components, numerical energy residual and sampled history. The maximum temperature is a modeled hotspot, not a tested device operating limit.

## Explicit omissions

- No manufacturer-sourced part meshes, datasheet tolerances, conductor strand layout, bend radius, electrical terminal geometry, insulation heat capacity, radiative cooling, variable current or heat transfer coefficient, thermal interfaces or neighboring-component coupling
- Jacket thickness and conductivity are **user assumptions**, not part specifications
- Material constants are nominal engineering estimates and **not authenticated manufacturer or hardware calibration**
- Existing coupled DC solver still uses one thermal node **per conductor**; 1D results do not silently overwrite its results
- Independent experimental evidence and real-world build-success probability remain **unknown**

## Software acceptance gates

`node --test tests/segmented-wire-thermal.test.mjs` checks no-current equilibrium, reduction to the original lumped model under uniform boundary conditions, nonuniform end cooling, radial jacket resistance, two-end contact dissipation, energy conservation, input denial and nonmutation. Linux and Windows GitHub Actions run the new tests plus existing thermal and coupled DC regressions. Software checks do not establish empirical prediction accuracy.

Next: obtain licensed manufacturer STEP/footprint source files with immutable source URLs, versioned datasheet dimensions, geometry-to-terminal mapping and source hashes; independently calibrate thermal contact and convection constants with authenticated physical measurements and held-out operating points.
