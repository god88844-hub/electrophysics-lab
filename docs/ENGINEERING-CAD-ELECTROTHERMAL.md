# Engineering CAD, electrothermal and measured-data evaluation (3D workbench)

This feature extends PR #81 with a **separate dimensioned engineering mode**. It is not a full constraint-based CAD kernel, manufacturing assembly, FEA/FEM solver, independent metrology system or validated hardware digital twin.

## How to use
1. Run `npm start`, open Logic or Chip Lab and turn on **3D View**.
2. Connect canonical ports and click **Wire physics** to enter actual conductor length, metal diameter, material, temperature and assumed current. Save those explicit wire assumptions.
3. Click **Engineering CAD**. Choose a canonical component; enter its real dimensions (X/Y/Z placement and width/height/depth, all **mm**), click **Save mm component envelope**, then toggle **Show true-scale mm envelopes**.
4. The envelope view uses **20 mm per world unit**, consistent in all axes. Only explicitly entered components render as dimensioned geometry. The separate schematic 3D view remains an illustration: switching modes does not physically measure the original schematic.
5. Within the engineering panel, select the previously configured wire. Enter **ambient °C**, assumed constant convection **W/m²/K**, duration, time step and optional **contact resistance in Ω**; click **Simulate wire temperature**. The output reports predicted temperature and power, clearly **MODEL ONLY**.
6. Optionally paste a JSON array of **genuinely collected** resistance observations and supply source, instrument, uncertainty, and a comma-separated holdout ID list. **Evaluate held-out measurements** computes errors without fitting parameters. The app does not authenticate uploaded evidence and will not declare calibration or physical qualification.

## Physics & assumptions
The metal equation stays `R(T)=rho20(1+alpha*(T-20))L/A`. A uniform cylindrical conductor uses `m=rho_mass*A*L`, `C=m*c_p`, `G=h*pi*d*L`, and the explicit-Euler lumped equation `C*dT/dt=I²(R(T)+R_contact)-G(T-T_ambient)`. A conservative `dt<=tau/5` guard and finite-input bounds reject numerically inappropriate inputs. Contact dissipation is assumed deposited entirely into the same lump. The wire is assumed to be at one uniform temperature; axial conduction, insulation, radiation, thermal interfaces, physical mounting, electrical-source feedback and varying convection are not modeled. The solver is **not coupled to the canonical circuit engine** and current is always explicit, never inferred from a schematic trace.

## Model provenance and physical accuracy
The 3D CAD view is a geometric **envelope** (uniform physical scale, explicit numeric coordinates, collision and missing-part diagnostics). It has no STEP/IGES import, PCB footprints, pad alignment, physical wire routing, tolerance stacks, real material meshes or manufacturing DRC. The original 3D visualization and canonical port picking remain schematic. The component shapes are blocks, not manufacturer-derived meshes.

The holdout report requires at least two separate observations, one or more development rows and one or more reserved holdout rows. It reports MAE/RMSE and counts inside the caller's stated instrument uncertainty. **Fit candidate model** estimates one resistance multiplier by least squares on development observations **only** and reports a separate corrected MAE/RMSE on untouched holdout rows. This is a candidate empirical correction, not an independently validated physical component model: merely typing a source name and numbers does not authenticate instruments, collection conditions or independence. The report flags these as unverified. No authenticated real physical validation evidence was added by this PR.

## Evidence gates for next increments
- Source-pinned component and CAD footprint catalog, schematic-to-physical pin correspondence and an actual physical routing engine, not just boxes.
- Circuit solver coupling with stable netlist mapping, independent circuit-oracle comparisons, uncertainty propagation and thermal/electrical iterative convergence tests.
- Traceable real hardware tests with instrument calibration records, raw timestamped files, locked calibration and untouched independent holdout. Include error budgets across a stated operating envelope and independent review.
- Safety/reliability gate: do not predict real-world build-success probabilities or claim physical equivalence without externally verified evidence.
