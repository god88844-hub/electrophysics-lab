# Segmented wire thermal convection: candidate fitting and blind holdout

This **model-only** feature fits one constant heat-transfer coefficient (\`heatTransferWm2K\`) using user-supplied mean conductor-temperature observations. It reuses the segmented 1D wire solver with explicit geometry, current and boundary-condition assumptions.

\`fitWireThermalConvectionHoldout(rows, options)\` accepts 4–32 observations with unique IDs, wire geometry, operating current, ambient temperature, duration, numerical step, observed mean conductor temperature (°C), and stated thermometer uncertainty (°C). Development data tune a single convection parameter using a bounded log-grid/golden-section search. At least two **withheld holdout** observations never participate in fitting; they are evaluated only once the parameter is fixed. An endpoint sensitivity check rejects unidentifiable cases.

Inputs require source, instrument and operator claims, but these claims are not authenticated. Outputs report development and held-out RMSE, MAE, and uncertainty counts. They explicitly deny physical qualification. No fitted parameter automatically overwrites the canonical circuit, the existing solver's assumptions, or manufacturer data.

Limitations: a single space-uniform convection coefficient, no fitted emissivity, radiation, phase change, measured end-sink boundary conditions, independently calibrated instruments, confirmed sensor placement, or independent physical holdout. Synthetic tests confirm algorithm behavior only, **not** that any simulation matches real hardware.

Run \`node --test tests/wire-thermal-holdout.test.mjs\`.
