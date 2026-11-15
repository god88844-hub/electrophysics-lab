# Benchmark report — ngspice (external circuit simulator)

Generated: 2026-11-15T17:55:19.667Z  ·  commit: `6c714e3290976edc7c88f4d962c7965d0f2d2a42`  ·  node: v25.9.0  ·  win32 x64

**Engines:** ngspice: 47 · qiskit: 2.6.2 · numpy: independent reference (see per-case engine strings)

**Summary:** 10 cases — 10 pass · 0 fail · 0 skipped · 0 unsupported · 0 model-mismatch · 0 inconclusive

> A skipped case is missing evidence, not a pass — skipped cases are never counted as a pass. Agreement with an independent numerical solver is cross-solver evidence, not physical validation.

| Case | Status | Classification | Detail |
|---|---|---|---|
| ngspice-divider | **pass** | pass | IL vs analytical (midpoint 5 V; documented gmin deviation): pass; Ngspice vs analytical (midpoint 5 V; same gmin model): |
| ngspice-isource-polarity | **pass** | pass | IL vs analytical (+1 V): pass; Ngspice vs analytical (+1 V): pass; IL vs Ngspice: pass; Exported source injects positive |
| ngspice-rc-transient | **pass** | pass | IL vs analytical @ t=50us: pass; Ngspice vs analytical @ t=50us: pass; IL vs Ngspice @ t=50us: pass; IL vs analytical @  |
| ngspice-rc-ac | **pass** | pass | gain IL vs analytical @ 100.0 Hz: pass; gain IL vs Ngspice @ 100.0 Hz: pass; phase IL vs Ngspice @ 100.0 Hz: pass; phase |
| ngspice-ac-phase | **pass** | pass | magnitude IL vs analytical (1.4142 V = 3.0103 dB): pass; magnitude Ngspice vs analytical: pass; magnitude IL vs Ngspice: |
| ngspice-rl | **pass** | pass | DC current IL vs analytical (50 mA): pass; DC current IL vs Ngspice: pass; IL vs analytical @ t=5us: pass; IL vs Ngspice |
| ngspice-diode | **pass** | pass | diode voltage IL vs bisection @ Vs=3V: pass; diode voltage Ngspice vs bisection @ Vs=3V: pass; diode voltage IL vs Ngspi |
| ngspice-nmos | **pass** | pass | NMOS Id sweep IL vs Ngspice (11 points, saturation): pass; sweep point count matches: pass; linear-region Id IL vs Ngspi |
| ngspice-pmos | **pass** | pass | exported M line maps d/g/s 1:1 with bulk on source: pass; PMOS |Id| sweep IL vs Ngspice (11 points): pass; conducting PM |
| ngspice-combined | **pass** | pass | combined waveform IL vs Ngspice (19 points, t > 0): pass; diode clamp engaged (peak held below unclamped divider level): |

## Case details

### ngspice-divider — Resistive voltage divider (DC)

10 V across two 1 kOhm resistors. All three evidence sources must agree at 5.000 V: Invention Lab DC solver, Ngspice .op on the EXPORTED deck, and the analytical result.

*Tolerance rationale:* abs 1e-6 V: the network is linear and both solvers are direct eliminations; remaining differences are double-precision roundoff only.
*Model note:* Ideal resistors and sources. Both engines include gmin = 1e-12 ground leakage (SPICE default); it loads the midpoint by ~2.5e-9 V, so the analytical comparison uses abs 1e-7 V to cover the documented model choice rather than pretending both solvers are ideal-free.
- **PASS** IL vs analytical (midpoint 5 V; documented gmin deviation) — {"absErr":2.5000002068509275e-9,"relErr":5.000000413701855e-10}
- **PASS** Ngspice vs analytical (midpoint 5 V; same gmin model) — {"absErr":0,"relErr":0}
- **PASS** IL vs Ngspice — {"absErr":2.5000002068509275e-9,"relErr":5.000000413701855e-10}

### ngspice-isource-polarity — Current source polarity and exported orientation

1 mA source delivering current out of terminal p into a 1 kOhm resistor must give +1 V in the internal solver, in the exported SPICE deck, and analytically. Verifies terminal convention end-to-end.

*Tolerance rationale:* abs 1e-6 V: linear network, direct elimination.
*Model note:* Internal convention: the source delivers i out of terminal p. SPICE draws current from n+ through the source; the exporter swaps node order to preserve the physical behavior. This benchmark proves the swap is correct.
- **PASS** IL vs analytical (+1 V) — {"absErr":9.999999717180685e-10,"relErr":9.999999717180685e-10}
- **PASS** Ngspice vs analytical (+1 V) — {"absErr":0,"relErr":0}
- **PASS** IL vs Ngspice — {"absErr":9.999999717180685e-10,"relErr":9.999999717180685e-10}
- **PASS** Exported source injects positive current into terminal p (SPICE semantics) — IchipISOURCE1 0 n1 DC 0.001

### ngspice-rc-transient — RC step response (transient, backward Euler vs Ngspice vs analytical)

R=1 kOhm, C=100 nF, 0-to-5 V step (pulse train with first half-cycle high). Analytical tau = 100 microseconds. Compare the capacitor voltage at t = 0.5, 1, 2, 3 tau against Ngspice and the closed-form solution.

*Tolerance rationale:* abs 0.005 V IL-vs-Ngspice (both integrators converged well below signal scale); abs 0.01 V IL-vs-analytical covers the documented O(dt) error of backward Euler at dt = tau/500. Rise-time caveat: Ngspice uses a 1 ns PWL rise (analytical assumes an ideal step); both are settled long before the first sample at 50 microseconds.
*Model note:* No UIC on either side: both start from the operating point with the source at 0 V, so vC(0) = 0 matches the declared initial condition.
- **PASS** IL vs analytical @ t=50us — {"absErr":0.004541537023263764,"relErr":0.0023084578940493284}
- **PASS** Ngspice vs analytical @ t=50us — {"absErr":0.000016676422242900557,"relErr":0.000008476605689643361}
- **PASS** IL vs Ngspice @ t=50us — {"absErr":0.004558213445506665,"relErr":0.0023169541396456145}
- **PASS** IL vs analytical @ t=100us — {"absErr":0.0018372526729018013,"relErr":0.0005812981866328119}
- **PASS** Ngspice vs analytical @ t=100us — {"absErr":0.000002453969534244038,"relErr":7.764245285082077e-7}
- **PASS** IL vs Ngspice @ t=100us — {"absErr":0.0018397066424360453,"relErr":0.0005820750630986765}
- **PASS** IL vs analytical @ t=200us — {"absErr":4.4724558723174823e-7,"relErr":1.0344948245509029e-7}
- **PASS** Ngspice vs analytical @ t=200us — {"absErr":0.000004733876183493635,"relErr":0.0000010949622649605684}
- **PASS** IL vs Ngspice @ t=200us — {"absErr":0.000004286630596261887,"relErr":9.91511696837585e-7}
- **PASS** IL vs analytical @ t=300us — {"absErr":0.00024856631612735214,"relErr":0.000052318024277022093}
- **PASS** Ngspice vs analytical @ t=300us — {"absErr":0.00000382125406073186,"relErr":8.042942657427893e-7}
- **PASS** IL vs Ngspice @ t=300us — {"absErr":0.000252387570188084,"relErr":0.00005312227581682306}

### ngspice-rc-ac — RC low-pass AC frequency response (gain and phase across the sweep)

R=1 kOhm, C=100 nF, 1 V AC drive. Compare gain (dB) and phase (degrees) at twelve explicit frequencies spanning 100 Hz to 1 MHz against Ngspice and the analytical H(f) = 1/(1 + jf/fc), fc = 1591.55 Hz.

*Tolerance rationale:* gain abs 0.05 dB and phase max 0.5 degrees: both AC solvers are linear complex eliminations; residual differences come from interpolation of the dense Ngspice sweep (200 pts/decade) and double-precision roundoff.
*Model note:* wrdata writes vp() in RADIANS (verified against ngspice-47) — the adapter converts to degrees. Internal AC phase uses atan2 in degrees.
- **PASS** gain IL vs analytical @ 100.0 Hz — {"absErr":9.679756995950584e-16,"relErr":5.656870840239704e-14}
- **PASS** gain IL vs Ngspice @ 100.0 Hz — {"absErr":4.4581900671136765e-11,"relErr":2.605375885692105e-9}
- **PASS** phase IL vs Ngspice @ 100.0 Hz — {"phaseErrDeg":1.7577495015075328e-9}
- **PASS** phase IL vs analytical @ 100.0 Hz — {"phaseErrDeg":8.881784197001252e-16}
- **PASS** gain IL vs analytical @ 300.0 Hz — {"absErr":0.0000178178638216564,"relErr":0.00011750939743296085}
- **PASS** gain IL vs Ngspice @ 300.0 Hz — {"absErr":0.000013321333902110988,"relErr":0.00008785202961789136}
- **PASS** phase IL vs Ngspice @ 300.0 Hz — {"phaseErrDeg":0.00003427968260005798}
- **PASS** phase IL vs analytical @ 300.0 Hz — {"phaseErrDeg":0.00004587333315164699}
- **PASS** gain IL vs analytical @ 700.0 Hz — {"absErr":0.0000531436945319097,"relErr":0.00006919559529723764}
- **PASS** gain IL vs Ngspice @ 700.0 Hz — {"absErr":0.000051929946839446295,"relErr":0.00006761513173360117}
- **PASS** phase IL vs Ngspice @ 700.0 Hz — {"phaseErrDeg":0.0003753286841678971}
- **PASS** phase IL vs analytical @ 700.0 Hz — {"phaseErrDeg":0.00038410614552120137}
- **PASS** gain IL vs analytical @ 1591.5 Hz — {"absErr":7.056361148727319e-7,"relErr":2.3440724347628938e-7}
- **PASS** gain IL vs Ngspice @ 1591.5 Hz — {"absErr":7.721352135448001e-7,"relErr":2.5649777155880216e-7}
- **PASS** phase IL vs Ngspice @ 1591.5 Hz — {"phaseErrDeg":0.0003548138197544404}
- **PASS** phase IL vs analytical @ 1591.5 Hz — {"phaseErrDeg":0.0007945460743385979}
- **PASS** gain IL vs analytical @ 3000.0 Hz — {"absErr":0.00022877638459384286,"relErr":0.0000347524369298951}
- **PASS** gain IL vs Ngspice @ 3000.0 Hz — {"absErr":0.00016720720453289317,"relErr":0.00002539996507000873}
- **PASS** phase IL vs Ngspice @ 3000.0 Hz — {"phaseErrDeg":0.0016199269691554719}
- **PASS** phase IL vs analytical @ 3000.0 Hz — {"phaseErrDeg":0.0022188389002195663}
- **PASS** gain IL vs analytical @ 7000.0 Hz — {"absErr":0.00009148688523907822,"relErr":0.0000069920291984732}
- **PASS** gain IL vs Ngspice @ 7000.0 Hz — {"absErr":0.0000819876731341651,"relErr":0.0000062660415113449865}
- **PASS** phase IL vs Ngspice @ 7000.0 Hz — {"phaseErrDeg":0.00025704478969146294}
- **PASS** phase IL vs analytical @ 7000.0 Hz — {"phaseErrDeg":0.0002871697371915616}
- **PASS** gain IL vs analytical @ 15915.5 Hz — {"absErr":0.0005230602374695081,"relErr":0.000026096628269112125}
- **PASS** gain IL vs Ngspice @ 15915.5 Hz — {"absErr":0.0003937906743338715,"relErr":0.000019647211521017193}
- **PASS** phase IL vs Ngspice @ 15915.5 Hz — {"phaseErrDeg":0.0005264020852138174}
- **PASS** phase IL vs analytical @ 15915.5 Hz — {"phaseErrDeg":0.0006984924084463273}
- **PASS** gain IL vs analytical @ 30000.0 Hz — {"absErr":0.00019268430252239455,"relErr":0.000007550849510660542}
- **PASS** gain IL vs Ngspice @ 30000.0 Hz — {"absErr":0.00005331621206039472,"relErr":0.0000020893497145239278}
- **PASS** phase IL vs Ngspice @ 30000.0 Hz — {"phaseErrDeg":0.00003654220888904547}
- **PASS** phase IL vs analytical @ 30000.0 Hz — {"phaseErrDeg":0.00013439492560962663}
- **PASS** gain IL vs analytical @ 70000.0 Hz — {"absErr":0.0003725683301993854,"relErr":0.000011335358623297612}
- **PASS** gain IL vs Ngspice @ 70000.0 Hz — {"absErr":0.0003615766964273348,"relErr":0.000011000942813068173}
- **PASS** phase IL vs Ngspice @ 70000.0 Hz — {"phaseErrDeg":0.00010889902821986652}
- **PASS** phase IL vs analytical @ 70000.0 Hz — {"phaseErrDeg":0.00011233082715023102}
- **PASS** gain IL vs analytical @ 159155.0 Hz — {"absErr":0.0005454135656322023,"relErr":0.00001363519004742611}
- **PASS** gain IL vs Ngspice @ 159155.0 Hz — {"absErr":0.00041225307170833503,"relErr":0.000010306248409121885}
- **PASS** phase IL vs Ngspice @ 159155.0 Hz — {"phaseErrDeg":0.000054320965915621855}
- **PASS** phase IL vs analytical @ 159155.0 Hz — {"phaseErrDeg":0.00007183328156656898}
- **PASS** gain IL vs analytical @ 400000.0 Hz — {"absErr":0.0004902138986579985,"relErr":0.000010211754349792481}
- **PASS** gain IL vs Ngspice @ 400000.0 Hz — {"absErr":0.00035082633694116794,"relErr":0.000007308162384756549}
- **PASS** phase IL vs Ngspice @ 400000.0 Hz — {"phaseErrDeg":0.00001849660947073062}
- **PASS** phase IL vs analytical @ 400000.0 Hz — {"phaseErrDeg":0.000025656713205535198}
- **PASS** gain IL vs analytical @ 1000000.0 Hz — {"absErr":0,"relErr":0}
- **PASS** gain IL vs Ngspice @ 1000000.0 Hz — {"absErr":3.2043892872479773e-8,"relErr":5.725844667385632e-10}
- **PASS** phase IL vs Ngspice @ 1000000.0 Hz — {"phaseErrDeg":7.403819779483456e-8}
- **PASS** phase IL vs analytical @ 1000000.0 Hz — {"phaseErrDeg":0}

### ngspice-ac-phase — AC source with 90-degree phase (magnitude and phase at the cutoff frequency)

2 V AC source at +90 degrees drives the RC network; the capacitor voltage at fc = 1591.55 Hz must be |Vc| = 1.4142 V at +45 degrees. Verifies that the internal phase convention, the exported "DC 0 AC 2 90" syntax, and both complex solvers agree after unit normalization.

*Tolerance rationale:* magnitude abs 0.01 dB, phase max 0.5 degrees: linear complex analysis in both engines.
*Model note:* SPICE AC phase is specified in DEGREES on the V line; the internal solver stores radians — the exporter converts. wrdata returns vp in radians; the adapter converts back.
- **PASS** magnitude IL vs analytical (1.4142 V = 3.0103 dB) — {"absErr":0,"relErr":0}
- **PASS** magnitude Ngspice vs analytical — {"absErr":8.336018852972416e-8,"relErr":2.7691655227199793e-8}
- **PASS** magnitude IL vs Ngspice — {"absErr":8.336018852972416e-8,"relErr":2.7691654460372048e-8}
- **PASS** phase IL vs analytical (+45 deg) — {"phaseErrDeg":7.105427357601002e-15}
- **PASS** phase Ngspice vs analytical (+45 deg) — {"phaseErrDeg":5.501856890077761e-7}
- **PASS** phase IL vs Ngspice (wrapped) — {"phaseErrDeg":5.501856961132034e-7}
- **PASS** phase comparison uses wrapped angles (report phaseErrDeg, not raw difference) — IL 45.000 deg, Ngspice 45.000 deg

### ngspice-rl — RL step response (DC and transient)

R=100 Ohm in series with L=1 mH driven by a 0-to-5 V step. tau = L/R = 10 microseconds. Compare the inductor current at DC and at t = 0.5, 1, 2, 3 tau against Ngspice and the analytical (V/R)(1 - e^(-t/tau)).

*Tolerance rationale:* abs 5e-4 A (1% of the 50 mA final value) covers backward-Euler O(dt) error at dt = tau/200 and the 1 ns source rise time in Ngspice; the DC comparison uses abs 1e-6 A.
*Model note:* Series ammeter is exported as a 0 V source; its branch current is read from wrdata as i(v<ammeter>).
- **PASS** DC current IL vs analytical (50 mA) — {"absErr":0,"relErr":0}
- **PASS** DC current IL vs Ngspice — {"absErr":0,"relErr":0}
- **PASS** IL vs analytical @ t=5us — {"absErr":0.00011326053778958761,"relErr":0.005757019731543447}
- **PASS** IL vs Ngspice @ t=5us — {"absErr":0.0001246472934260008,"relErr":0.006339476382243177}
- **PASS** IL vs analytical @ t=10us — {"absErr":0.00004585123522984208,"relErr":0.0014507117222959285}
- **PASS** IL vs Ngspice @ t=10us — {"absErr":0.000045080736656759324,"relErr":0.001426298735771542}
- **PASS** IL vs analytical @ t=20us — {"absErr":2.80530998569839e-8,"relErr":6.488780983683999e-7}
- **PASS** IL vs Ngspice @ t=20us — {"absErr":0.0000059002490710932665,"relErr":0.0001364561315742129}
- **PASS** IL vs analytical @ t=30us — {"absErr":0.000006200104829136299,"relErr":0.0001304992727995539}
- **PASS** IL vs Ngspice @ t=30us — {"absErr":0.000010455890918033284,"relErr":0.00022005498058524909}

### ngspice-diode — Diode operating points at three bias levels (temperature-matched)

Shockley diode (Is=1e-12, n=1) fed from 5 V through 1 kOhm, repeated at Vs = 3, 5, 10 V. Compare diode voltage against Ngspice and a bisection reference of the same equation. Temperature matched at T = 300.0 K via .options temp/tnom = 26.85 C so both engines use Vt = k*300/q exactly.

*Tolerance rationale:* abs 1e-4 V: Newton tolerance in both engines is far tighter (1e-9); gmin-style leakage conductance contributes < 1e-11 A here; the residual budget covers SPICE reltol=1e-3 propagating through the node voltage.
*Model note:* Both engines: Shockley equation I = Is*(exp(V/nVt) - 1), n=1, Is=1e-12, no series resistance, no breakdown. Temperature: 300.0 K on both sides (documented .options). The bisection reference is an independent numerical root-finder, not the same Newton implementation.
- **PASS** diode voltage IL vs bisection @ Vs=3V — {"absErr":6.441325250960972e-11,"relErr":1.1526852890025699e-10}
- **PASS** diode voltage Ngspice vs bisection @ Vs=3V — {"absErr":2.017501721240933e-9,"relErr":3.6103510752928405e-9}
- **PASS** diode voltage IL vs Ngspice @ Vs=3V — {"absErr":2.0819149737505427e-9,"relErr":3.725619590742303e-9}
- **PASS** diode voltage IL vs bisection @ Vs=5V — {"absErr":3.667943726526346e-11,"relErr":6.388014694615164e-11}
- **PASS** diode voltage Ngspice vs bisection @ Vs=5V — {"absErr":0.000002502034556539634,"relErr":0.000004357491473498296}
- **PASS** diode voltage IL vs Ngspice @ Vs=5V — {"absErr":0.0000025020712359768993,"relErr":0.000004357536365717683}
- **PASS** diode voltage IL vs bisection @ Vs=10V — {"absErr":1.789890458070431e-11,"relErr":3.014897329615166e-11}
- **PASS** diode voltage Ngspice vs bisection @ Vs=10V — {"absErr":0.0000027397558787223275,"relErr":0.000004614853744436447}
- **PASS** diode voltage IL vs Ngspice @ Vs=10V — {"absErr":0.0000027397737776269082,"relErr":0.00000461486259649381}
- **PASS** diode voltage series RMS (all biases) — {"maxAbsErr":0.0000027397737776269082,"rmsErr":0.0000021421737524334904}
- note: Deck temperature matched to the internal 300.0 K model temperature via .options temp=26.85 tnom=26.85 (SPICE options are in Celsius).

### ngspice-nmos — NMOS transfer curve (saturation sweep) and linear-region point

Sweep Vgs 0..5 V at Vds=5 V (all points saturated): drain current via a series ammeter, Invention Lab dcSweep vs Ngspice .dc on the exported deck. Plus a linear-region point (Vgs=3, Vds=1, LAMBDA=0).

*Tolerance rationale:* series maxAbs 5e-4 A (0.5% of the 95 mA full-scale current): both engines implement the same Level-1 square law with W/L=1; the residual covers Newton/reltol differences. The linear-region point uses abs 1e-6 A because with LAMBDA=0 the two models reduce to identical equations.
*Model note:* Model equivalence (documented): KP*(W/L) with W=L=1u equals the internal k; VTO maps to vth; LAMBDA maps to lambda. W and L are declared as 1u/1u on the M line.
*Model note:* The internal engine applies (1+lambda*Vds) in saturation only; Ngspice Level-1 applies it in the linear region too. Benchmarks touching the linear region therefore use LAMBDA=0, where both reduce to the same law — a documented model nuance, not a hidden tolerance change.
*Model note:* Both sides: no body effect (bulk tied to source), no capacitances (DC analysis).
- **PASS** NMOS Id sweep IL vs Ngspice (11 points, saturation) — {"maxAbsErr":5.000007352595759e-12,"rmsErr":3.692751509785565e-12}
- **PASS** sweep point count matches
- **PASS** linear-region Id IL vs Ngspice (LAMBDA=0) — {"absErr":0,"relErr":0}

### ngspice-pmos — PMOS conducting point and gate sweep (terminal mapping + model equivalence)

PMOS (k=0.02, Vth=-2, lambda=0.01) with source at 5 V, drain via 1 kOhm to ground, gate swept 0..5 V. Verifies exported drain/gate/source/bulk mapping, the negative threshold sign, current direction, and dissipation agreement.

*Tolerance rationale:* series maxAbs 5e-4 A (0.5% of full scale): same Level-1 law with mapped parameters; dissipation abs 2e-5 W on ~4e-4 W (5%) reflects the drain-voltage difference between the engines at the swept gate bias.
*Model note:* Exported M line: drain gate source bulk = internal d g s s. SPICE PMOS with VTO=-2 conducts when Vgs < VTO — the same sign convention as the internal square-law model.
*Model note:* Current direction: we compare |Id| (direction is separately verified by the polarity benchmark and the internal out-of-node convention tests).
- **PASS** exported M line maps d/g/s 1:1 with bulk on source — MchipPMOS1 n3 n2 n1 n1 PMOD_chipPMOS1 W=1u L=1u
- **PASS** PMOS |Id| sweep IL vs Ngspice (11 points) — {"maxAbsErr":8.290910696743051e-7,"rmsErr":2.78720125567432e-7}
- **PASS** conducting PMOS dissipation IL > 0 (Vds*Id) — {"absErr":0.000008590815430557764,"relErr":0.02147703857639441}

### ngspice-combined — Combined nonlinear circuit: sine source, R-C divider, diode clamp

Sine 2 V amplitude + 3 V offset at 1 kHz drives R1=1 kOhm into a node carrying C=100 nF to ground, R2=500 Ohm to ground, and a diode (Is=1e-12, n=1) clamping to ground. The diode conducts near the sine peaks, exercising nonlinear interaction. Compare the node voltage at 20 sample points over two periods.

*Tolerance rationale:* maxAbs 0.02 V and RMS 0.01 V (1-2% of signal): backward Euler (internal, dt=20us) vs Ngspice trapezoidal integration differ at O(dt) on a smooth waveform; temperature matched at 300 K for the diode; residual differences are documented discretization effects, not model mismatches.
*Model note:* All elements supported on both sides. The diode enters forward conduction near waveform peaks (both engines must show the same clamped shape).
- **PASS** combined waveform IL vs Ngspice (19 points, t > 0) — {"maxAbsErr":0.006321424001484943,"rmsErr":0.002124987861755571}
- **PASS** diode clamp engaged (peak held below unclamped divider level) — peak node voltage 0.566 V (unclamped would reach ~1.0 V)
- note: Initialization-convention difference (documented, t=0 excluded from comparison): IL v(A,0)=0.375 V (declared vInit=0, companion model active) vs Ngspice DC-operating-point t=0 0.544 V (capacitor open). Difference 0.169 V is a convention difference, not a solver defect; waveforms converge after the first tau.