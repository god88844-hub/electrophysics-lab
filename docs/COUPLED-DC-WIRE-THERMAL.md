# Opt-in cloned-circuit DC electrothermal coupling (next engineering increment)

## What is implemented
The Engineering CAD panel now provides **Run coupled DC current + heat**, available for supported Chip Lab circuits only. Unlike the independent hypothetical-current heater, this operation:

1. Requires saved PR #81 physical material/length/diameter/initial temperature data for **every** canonical electrical wire.
2. Preserves the original design and constructs a temporary **cloned analog circuit** where each canonical wire becomes a dedicated actual `chip.RES` element at resistance `R(T)` plus explicitly specified contact resistance. The clone is solved with the existing Chip Lab **modified nodal analysis (MNA) DC solver**, not an invented approximate current.
3. Iteratively re-solves this augmented electrical network and advances each wire's lumped thermal node under Joule heating and user-defined uniform convection. Hence current, resistance, and temperature interact, including source loading.
4. Keeps an explicit mapping `canonical wire ID → inserted resistor block ID`, a bounded time series, final voltage/current/power, a heat balance check, and a model-only verdict.
5. Uses entered CAD mm component-body bounding boxes to compute the strict **minimum possible body-to-body gap**. If a declared wire length is shorter than this lower bound, the model refuses to run; without entered boxes, it explicitly notes that no geometric plausibility check occurred.

## To run
Launch `npm start`, open **Chip Lab**, build a DC-only analog circuit with source, resistor, ground and optional ideal meters. Use **3D View → Wire physics** to configure every canonical connection and **Engineering CAD** to enter physical component-body envelopes if known. In the same panel enter ambient temperature, heat-transfer coefficient, simulation duration, time step and contact resistance, then select **Run coupled DC current + heat**.

## Actual engineering scope
Only basic linear DC circuits are accepted for now: resistors, DC voltage/current sources, ground, ideal ammeters/voltmeters. Every physical connection is modeled as a uniform round copper or aluminum conductor. The thermal model assigns one lumped node per wire using `C=m c_p`, convection `h π d L`, and explicit Euler with `dt ≤ τ/5`. At each step, the original electrical solver calculates the current, so `C ΔT/Δt=I²[R(T)+R_contact]-h π d L(T-T_ambient)`. The contact heat is **assumed** to enter the conductor. Hard limits on wiring, steps, temperature, material inputs and solver errors fail closed. All calculations are simulation-only.

## Key nonclaims
- This is an **augmented cloned solver**, not a modification of the saved canonical schematic. The original editor and engine are unchanged by the operation.
- CAD body-gap limits are not a conductor route, pin coordinate or verified footprint. Missing geometry is explicitly reported.
- The model omits varying convection, contact geometry, radiation, insulation, thermal coupling between components, component body heating, AC/skin effect, fault arcs, nonlinear devices, Joule heat from unknown return paths, and manufacturing details.
- **Neither calibration nor real physical validation has occurred in this feature.** The measured-data fit added earlier is not automatically applied; there is no source-authenticated physical model coefficient, validated error envelope or manufacturing success percentage.
- Passing CI proves scoped software behavior, **not** measurement agreement or hardware safety.

## Planned next validations
Connect authentic dated raw four-wire resistance / thermocouple measurements, source-hash and instrument calibration records, blind held-out operating points, and an independent circuit reference such as Ngspice with matched wire topology. Use discrepancies and uncertainty to define a **bounded validated operating envelope**; unknown remains unknown outside it.
