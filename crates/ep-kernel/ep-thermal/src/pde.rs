//! Implicit Fourier heat PDE solvers (WP-2.3, 03 §1.4).
//!
//! Governing equation (per cell, 2D plate of thickness `t`):
//!
//! `ρ·c_p·∂T/∂t = k·∇²T + q(x,y,t) − (h·A_cell/V_cell)·(T − T_amb)`
//!
//! Discretized in **positive-decay operator form** `∂T/∂t = −A·T + f` with
//! `A = −(k/(ρ·c_p))·∇² + conv·I` (`conv = h·A_cell/V_cell`) and drive
//! `f = q/(ρ·c_p·V) + conv·T_amb`. Both documented schemes solve the
//! implicit system and are **unconditionally stable** (03 §1.4):
//! - **Backward Euler** — `(I + Δt·A)·T_new = T_old + Δt·f` via a cached
//!   **banded LU triangular factorization** (no pivoting needed: the matrix
//!   is strictly diagonally dominant). 2D and 3D; the factorization is
//!   reused across steps while `(dt, k, h, …)` are unchanged.
//! - **Crank–Nicolson** — Peaceman–Rachford ADI for ≤ 64² 2D grids (§1.4:
//!   "CN for ≤ 64×64 grids where the tridiagonal solve is cheap"): one
//!   tridiagonal (Thomas) solve per direction per half-step, second-order in
//!   time, unconditionally stable.
//!
//! The Laplacian is discretized in **conservative flux form** (each face flux
//! computed once, symmetric operator, zero row/column sums for insulated
//! boundaries), so with `h = 0`, insulated edges and no sources the schemes
//! conserve ΣT **exactly** (floating-point rounding only, < 1e-9 asserted).
//!
//! Boundary modes: `DirichletAmbient` (edge cells pinned at `T_amb` — bulk
//! spreading reservoir, ESM `heat.mjs` behavior; pinned conductances enter
//! the cell diagonal once and their `c·T_amb` drive enters the RHS once) and
//! `Insulated` (zero-flux mirrored Neumann edges).
//!
//! Admission: every grid is gated through the **ep-core** thermal budget
//! (`≤ 128×128` cells, fail-closed) before allocation — 2D via the exact
//! `AdmissionRequest::ThermalGrid{cols, rows}`, 3D against the same ep-core
//! budget constants (`THERMAL_MAX_COLS·THERMAL_MAX_ROWS` total cells).

use ep_core::admission::{
    AdmissionController, AdmissionDecision, AdmissionRequest, THERMAL_MAX_COLS, THERMAL_MAX_ROWS,
};

/// Total-cell ceiling derived from the ep-core 2D budget (128×128 = 16384).
pub const MAX_THERMAL_CELLS: usize = THERMAL_MAX_COLS * THERMAL_MAX_ROWS;

/// Edge boundary treatment.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BoundaryMode {
    /// Edge cells pinned at `T_amb` (bulk spreading reservoir).
    DirichletAmbient,
    /// Zero-flux mirrored Neumann edges (exact energy-conservation oracle).
    Insulated,
}

/// Time-integration scheme.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Scheme {
    BackwardEuler,
    CrankNicolson,
}

fn refused(reason: impl Into<String>) -> AdmissionDecision {
    AdmissionDecision {
        admitted: false,
        reason: reason.into(),
    }
}

/// Admission for a 2D grid: exact ep-core thermal request.
pub fn admit_grid_2d(controller: &AdmissionController, nx: usize, ny: usize) -> AdmissionDecision {
    controller.admit(&AdmissionRequest::ThermalGrid { cols: nx, rows: ny })
}

/// Admission for a 3D grid: the same ep-core total-cell budget
/// (`THERMAL_MAX_COLS·THERMAL_MAX_ROWS`), fail-closed with an honest reason.
pub fn admit_grid_3d(
    _controller: &AdmissionController,
    nx: usize,
    ny: usize,
    nz: usize,
) -> AdmissionDecision {
    let Some(cells) = nx.checked_mul(ny).and_then(|v| v.checked_mul(nz)) else {
        return refused("thermal 3D grid: shape overflows usize");
    };
    if cells == 0 {
        return refused("thermal grid: grid extents must be ≥ 1");
    }
    if cells > MAX_THERMAL_CELLS {
        return refused(format!(
            "thermal 3D grid cap: {nx}×{ny}×{nz} = {cells} cells > {MAX_THERMAL_CELLS} (ep-core 128×128 budget; coarsen the mesh or run the offline batch path)"
        ));
    }
    AdmissionDecision {
        admitted: true,
        reason: format!("within budget: {cells} of {MAX_THERMAL_CELLS} cells (ep-core 128×128)"),
    }
}

// ---------------------------------------------------------------------------
// Banded LU (Backward Euler triangular factorization)
// ---------------------------------------------------------------------------

/// Banded square matrix in diagonal-centered row storage, factored in place
/// (Doolittle LU, no pivoting — `(I + Δt·A)` is strictly diagonally dominant
/// so the factorization is stable and stays within the band).
#[derive(Debug, Clone)]
pub struct BandedLu {
    n: usize,
    p: usize,
    /// Row-major band: `data[i * stride + (j - i + p)]` for `|i - j| ≤ p`.
    data: Vec<f64>,
}

impl BandedLu {
    fn stride(p: usize) -> usize {
        2 * p + 1
    }

    /// Build from `(i, j, value)` triples; `|i - j| > p` is a build error.
    pub fn from_entries(n: usize, p: usize, entries: &[(usize, usize, f64)]) -> Self {
        let stride = Self::stride(p);
        let mut data = vec![0.0; n * stride];
        for &(i, j, v) in entries {
            let diff = i as isize - j as isize;
            assert!(
                diff.abs() <= p as isize,
                "band overflow: ({i},{j}) beyond half-bandwidth {p}"
            );
            assert!(i < n && j < n, "index out of range: ({i},{j}) in {n}");
            data[i * stride + (diff + p as isize) as usize] = v;
        }
        Self { n, p, data }
    }

    fn at(&self, i: usize, j: usize) -> f64 {
        let diff = i as isize - j as isize;
        if diff.abs() > self.p as isize {
            0.0
        } else {
            self.data[i * Self::stride(self.p) + (diff + self.p as isize) as usize]
        }
    }

    fn set(&mut self, i: usize, j: usize, v: f64) {
        let diff = i as isize - j as isize;
        debug_assert!(diff.abs() <= self.p as isize);
        self.data[i * Self::stride(self.p) + (diff + self.p as isize) as usize] = v;
    }

    /// In-place Doolittle factorization (unit lower × upper), no pivoting.
    pub fn factorize(&mut self) {
        let n = self.n;
        let p = self.p;
        for k in 0..n {
            let pivot = self.at(k, k);
            assert!(
                pivot > 0.0,
                "zero pivot at {k} — matrix not positive definite"
            );
            let i_max = (k + p).min(n - 1);
            for i in (k + 1)..=i_max {
                let l = self.at(i, k) / pivot;
                self.set(i, k, l);
                let j_max = (i + p).min(n - 1);
                for j in (k + 1)..=j_max {
                    let v = self.at(i, j) - l * self.at(k, j);
                    self.set(i, j, v);
                }
            }
        }
    }

    /// Solve `A·x = b` using the stored LU (forward + back substitution).
    pub fn solve(&self, b: &[f64]) -> Vec<f64> {
        let n = self.n;
        let mut y = vec![0.0; n];
        for i in 0..n {
            let mut s = b[i];
            for (j, yj) in y
                .iter_mut()
                .enumerate()
                .take(i)
                .skip(i.saturating_sub(self.p))
            {
                s -= self.at(i, j) * *yj;
            }
            y[i] = s;
        }
        let mut x = vec![0.0; n];
        for i in (0..n).rev() {
            let mut s = y[i];
            let j_max = (i + self.p).min(n - 1);
            for (j, xj) in x.iter_mut().enumerate().skip(i + 1).take(j_max - i) {
                s -= self.at(i, j) * *xj;
            }
            x[i] = s / self.at(i, i);
        }
        x
    }
}

/// Thomas algorithm — tridiagonal solve (Crank–Nicolson ADI half-steps).
/// `a` sub-diagonal, `b` diagonal, `c` super-diagonal (length n; `a[0]` and
/// `c[n-1]` ignored), `d` right-hand side. O(n).
pub fn thomas_solve(a: &[f64], b: &[f64], c: &[f64], d: &[f64]) -> Vec<f64> {
    let n = b.len();
    debug_assert!(n > 0 && b[0] != 0.0);
    let mut cp = vec![0.0; n];
    let mut dp = vec![0.0; n];
    cp[0] = if n > 1 { c[0] / b[0] } else { 0.0 };
    dp[0] = d[0] / b[0];
    for i in 1..n {
        let m = b[i] - a[i] * cp[i - 1];
        cp[i] = if i + 1 < n { c[i] / m } else { 0.0 };
        dp[i] = (d[i] - a[i] * dp[i - 1]) / m;
    }
    let mut x = vec![0.0; n];
    x[n - 1] = dp[n - 1];
    for i in (0..n - 1).rev() {
        x[i] = dp[i] - cp[i] * x[i + 1];
    }
    x
}

// ---------------------------------------------------------------------------
// Joule source (R(T) TCR loop over WP-2.1 branch currents)
// ---------------------------------------------------------------------------

/// Per-cell Joule source: branch current through a trace segment of the given
/// cross-section/length — `P = I²·ρ_e(T)·length/area` with the temperature
/// loop `ρ_e(T) = ρ₀·(1 + α(T − T₀))` recomputed every step (TCR loop).
#[derive(Debug, Clone)]
pub struct JouleSource {
    pub currents_a: Vec<f64>,
    pub area_m2: f64,
    pub length_m: f64,
    pub rho0_ohm_m: f64,
    pub tcr_per_k: f64,
    pub ref_k: f64,
}

impl JouleSource {
    /// Cell power in W at the given cell temperature.
    pub fn power_w(&self, index: usize, temp_k: f64) -> f64 {
        let i = self.currents_a[index];
        let bracket = (1.0 + self.tcr_per_k * (temp_k - self.ref_k)).max(0.01);
        let rho = self.rho0_ohm_m * bracket;
        i * i * rho * self.length_m / self.area_m2
    }
}

// ---------------------------------------------------------------------------
// 2D grid
// ---------------------------------------------------------------------------

/// Uniform-material 2D plate grid (square cells, thickness `t`).
#[derive(Debug)]
pub struct ThermalGrid2D {
    pub nx: usize,
    pub ny: usize,
    pub dx_m: f64,
    pub thickness_m: f64,
    /// Volumetric heat capacity ρ·c_p (J/(m³·K)).
    pub rho_c: f64,
    pub k: f64,
    pub ambient_k: f64,
    /// Convection coefficient W/(m²·K) — 0 disables.
    pub h_conv: f64,
    pub boundary: BoundaryMode,
    pub scheme: Scheme,
    /// Temperature field (K), row-major `y·nx + x`.
    pub temp: Vec<f64>,
    /// Per-cell dissipated power (W) — direct source (optional).
    pub power_w: Option<Vec<f64>>,
    /// Joule R(T) source (optional; takes precedence over `power_w`).
    pub joule: Option<JouleSource>,
    /// Cached BE factorization (reused while parameters are unchanged).
    be_cache: Option<(BandedLu, BeKey2D)>,
}

#[derive(Debug, Clone, Copy, PartialEq)]
struct BeKey2D {
    dt: f64,
    k: f64,
    rho_c: f64,
    dx_m: f64,
    h_conv: f64,
    thickness_m: f64,
    boundary: BoundaryMode,
    nx: usize,
    ny: usize,
}

/// Interior-cell count for Dirichlet mode (edges pinned).
fn interior_extents(n: usize) -> usize {
    n.saturating_sub(2)
}

/// Neighbor/pinned counts along one axis for an interior cell of a Dirichlet
/// grid: `index` is the interior coordinate `0..len`.
fn dirichlet_axis_counts(index: usize, len: usize) -> (usize, usize) {
    let interior = (index > 0) as usize + (index + 1 < len) as usize;
    let pinned = 2 - interior;
    (interior, pinned)
}

/// Neighbor count along one axis for the mirrored-Neumann (insulated) flux
/// form: each EXISTING in-axis neighbor pair couples with the full `c` — an
/// edge cell's ghost collapses into its single face flux (zero-flux mirror).
fn insulated_axis_counts(index: usize, len: usize) -> usize {
    (index > 0) as usize + (index + 1 < len) as usize
}

impl ThermalGrid2D {
    /// Admission-gated constructor (ep-core thermal budget, fail-closed
    /// before any allocation).
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        nx: usize,
        ny: usize,
        dx_m: f64,
        thickness_m: f64,
        rho_c: f64,
        k: f64,
        ambient_k: f64,
        h_conv: f64,
        boundary: BoundaryMode,
        scheme: Scheme,
        controller: &AdmissionController,
    ) -> Result<Self, AdmissionDecision> {
        let decision = admit_grid_2d(controller, nx, ny);
        if !decision.admitted {
            return Err(decision);
        }
        Ok(Self {
            nx,
            ny,
            dx_m,
            thickness_m,
            rho_c,
            k,
            ambient_k,
            h_conv,
            boundary,
            scheme,
            temp: vec![ambient_k; nx * ny],
            power_w: None,
            joule: None,
            be_cache: None,
        })
    }

    /// Attach a Joule R(T) TCR source (WP-2.1 branch currents).
    pub fn set_joule_currents(
        &mut self,
        currents_a: Vec<f64>,
        area_m2: f64,
        length_m: f64,
        copper: &crate::reference::CopperElectro,
    ) {
        assert_eq!(currents_a.len(), self.temp.len(), "one current per cell");
        self.joule = Some(JouleSource {
            currents_a,
            area_m2,
            length_m,
            rho0_ohm_m: copper.resistivity_ohm_m_300k,
            tcr_per_k: copper.tcr_per_k,
            ref_k: copper.ref_k,
        });
    }

    /// Total stored heat energy (J): `Σ ρ·c_p·V_cell·T`.
    pub fn total_energy_j(&self) -> f64 {
        let v = self.dx_m * self.dx_m * self.thickness_m;
        self.rho_c * v * self.temp.iter().sum::<f64>()
    }

    pub fn max_temp(&self) -> f64 {
        self.temp.iter().cloned().fold(f64::MIN, f64::max)
    }

    pub fn temp_at(&self, x: usize, y: usize) -> f64 {
        self.temp[y * self.nx + x]
    }

    fn cell_volume(&self) -> f64 {
        self.dx_m * self.dx_m * self.thickness_m
    }

    fn conv_per_s(&self) -> f64 {
        if self.h_conv == 0.0 {
            0.0
        } else {
            let a_cell = self.dx_m * self.dx_m;
            self.h_conv * a_cell / (self.rho_c * self.cell_volume())
        }
    }

    /// Effective cell power at `index` (Joule R(T) loop wins over the direct
    /// power array; evaluated at the current cell temperature).
    fn cell_power(&self, index: usize, temp_k: f64) -> f64 {
        if let Some(j) = &self.joule {
            j.power_w(index, temp_k)
        } else if let Some(p) = &self.power_w {
            p[index]
        } else {
            0.0
        }
    }

    /// Source vector `f` (K/s) at the current state: `q/(ρc·V) + conv·T_amb`.
    fn source_f(&self) -> Vec<f64> {
        let conv = self.conv_per_s();
        let inv_cap = 1.0 / (self.rho_c * self.cell_volume());
        (0..self.nx * self.ny)
            .map(|i| {
                let src = self.cell_power(i, self.temp[i]) * inv_cap;
                src + conv * self.ambient_k
            })
            .collect()
    }

    /// One implicit step of `dt` seconds with the configured scheme.
    /// Returns the max temperature after the step.
    pub fn step(&mut self, dt: f64) -> f64 {
        match self.scheme {
            Scheme::BackwardEuler => self.step_be(dt),
            Scheme::CrankNicolson => self.step_cn(dt),
        }
    }

    /// Backward Euler: `(I + Δt·A)·T_new = T_old + Δt·f` via cached banded LU.
    pub fn step_be(&mut self, dt: f64) -> f64 {
        let key = BeKey2D {
            dt,
            k: self.k,
            rho_c: self.rho_c,
            dx_m: self.dx_m,
            h_conv: self.h_conv,
            thickness_m: self.thickness_m,
            boundary: self.boundary,
            nx: self.nx,
            ny: self.ny,
        };
        if self
            .be_cache
            .as_ref()
            .map(|(_, k)| *k != key)
            .unwrap_or(true)
        {
            let mut lu = self.build_be_matrix(dt);
            lu.factorize();
            self.be_cache = Some((lu, key));
        }
        let lu = &self.be_cache.as_ref().expect("just built").0;
        let f = self.source_f();
        let c = (self.k / self.rho_c) / (self.dx_m * self.dx_m);
        match self.boundary {
            BoundaryMode::Insulated => {
                let rhs: Vec<f64> = (0..self.nx * self.ny)
                    .map(|i| self.temp[i] + dt * f[i])
                    .collect();
                self.temp = lu.solve(&rhs);
            }
            BoundaryMode::DirichletAmbient => {
                let ix = interior_extents(self.nx);
                let iy = interior_extents(self.ny);
                let mut rhs = vec![0.0; (ix * iy).max(1)];
                for y in 0..iy {
                    for x in 0..ix {
                        let k = y * ix + x;
                        let gi = (y + 1) * self.nx + (x + 1);
                        let (_int_x, pin_x) = dirichlet_axis_counts(x, ix);
                        let (_int_y, pin_y) = dirichlet_axis_counts(y, iy);
                        let pinned = pin_x + pin_y;
                        rhs[k] =
                            self.temp[gi] + dt * f[gi] + dt * c * (pinned as f64) * self.ambient_k;
                    }
                }
                let out = lu.solve(&rhs);
                for y in 0..iy {
                    for x in 0..ix {
                        self.temp[(y + 1) * self.nx + (x + 1)] = out[y * ix + x];
                    }
                }
                self.pin_dirichlet_edges();
            }
        }
        self.max_temp()
    }

    /// Build the banded BE matrix `(I + Δt·A)` over the unknown set.
    fn build_be_matrix(&self, dt: f64) -> BandedLu {
        let c = (self.k / self.rho_c) / (self.dx_m * self.dx_m);
        let conv = self.conv_per_s();
        match self.boundary {
            BoundaryMode::Insulated => {
                let n = self.nx * self.ny;
                let p = self.nx; // y-neighbors dominate |i-j|
                let mut e = Vec::with_capacity(n * 5);
                for y in 0..self.ny {
                    for x in 0..self.nx {
                        let i = y * self.nx + x;
                        let mut diag = 1.0 + dt * conv;
                        for (j, _) in self.insulated_neighbors(x, y) {
                            diag += dt * c;
                            e.push((i, j, -dt * c));
                        }
                        e.push((i, i, diag));
                    }
                }
                BandedLu::from_entries(n, p, &e)
            }
            BoundaryMode::DirichletAmbient => {
                let ix = interior_extents(self.nx).max(1);
                let iy = interior_extents(self.ny).max(1);
                let n = ix * iy;
                let p = ix;
                let mut e = Vec::with_capacity(n * 5);
                for y in 0..iy {
                    for x in 0..ix {
                        let i = y * ix + x;
                        let (int_x, pin_x) = dirichlet_axis_counts(x, ix);
                        let (int_y, pin_y) = dirichlet_axis_counts(y, iy);
                        // Conductances: interior neighbors (coupled) + pinned
                        // neighbors (diagonal only; their c·T_amb is the RHS
                        // drive — added once in step_be).
                        let diag =
                            1.0 + dt * conv + dt * c * ((int_x + pin_x + int_y + pin_y) as f64);
                        if x > 0 {
                            e.push((i, i - 1, -dt * c));
                        }
                        if x + 1 < ix {
                            e.push((i, i + 1, -dt * c));
                        }
                        if y > 0 {
                            e.push((i, i - ix, -dt * c));
                        }
                        if y + 1 < iy {
                            e.push((i, i + ix, -dt * c));
                        }
                        e.push((i, i, diag));
                    }
                }
                BandedLu::from_entries(n, p, &e)
            }
        }
    }

    /// Insulated-mode neighbor list (grid indices + per-pair coupling count).
    fn insulated_neighbors(&self, x: usize, y: usize) -> Vec<(usize, f64)> {
        let mut v = Vec::with_capacity(4);
        if x > 0 {
            v.push((y * self.nx + (x - 1), 1.0));
        }
        if x + 1 < self.nx {
            v.push((y * self.nx + (x + 1), 1.0));
        }
        if y > 0 {
            v.push(((y - 1) * self.nx + x, 1.0));
        }
        if y + 1 < self.ny {
            v.push(((y + 1) * self.nx + x, 1.0));
        }
        v
    }

    fn pin_dirichlet_edges(&mut self) {
        for x in 0..self.nx {
            self.temp[x] = self.ambient_k;
            self.temp[(self.ny - 1) * self.nx + x] = self.ambient_k;
        }
        for y in 0..self.ny {
            self.temp[y * self.nx] = self.ambient_k;
            self.temp[y * self.nx + self.nx - 1] = self.ambient_k;
        }
    }

    /// Crank–Nicolson: Peaceman–Rachford ADI (tridiagonal per direction).
    /// Per §1.4 this path targets ≤ 64² grids.
    pub fn step_cn(&mut self, dt: f64) -> f64 {
        debug_assert!(
            self.nx * self.ny <= 64 * 64,
            "CN targets ≤ 64² grids per 03 §1.4 (use BackwardEuler for larger)"
        );
        let c = (self.k / self.rho_c) / (self.dx_m * self.dx_m);
        let conv = self.conv_per_s();
        let f = self.source_f();
        match self.boundary {
            BoundaryMode::Insulated => self.step_cn_insulated(dt, c, conv, &f),
            BoundaryMode::DirichletAmbient => self.step_cn_dirichlet(dt, c, conv, &f),
        }
    }

    /// PR-ADI, insulated edges (every cell unknown; mirrored line ends).
    ///
    /// Each half-step is a Crank–Nicolson step of `dt/2` in one direction
    /// (alternating-direction CN — unconditionally stable, 2nd-order):
    ///   Stage 1 (implicit Lx): `(I + Δt/2·Lx)u*  = (I − Δt/2·Ly)uⁿ + Δt/2·f`
    ///   Stage 2 (implicit Ly): `(I + Δt/2·Ly)uⁿ⁺¹ = (I − Δt/2·Lx)u* + Δt/2·f`
    /// Steady states are exact: at `u* = uⁿ` both stages reduce to `L·T = f`.
    fn step_cn_insulated(&mut self, dt: f64, c: f64, conv: f64, f: &[f64]) -> f64 {
        let (nx, ny) = (self.nx, self.ny);
        let n = nx * ny;
        let mut star = vec![0.0; n];
        for y in 0..ny {
            let mut a = vec![0.0; nx];
            let mut b = vec![0.0; nx];
            let mut cc = vec![0.0; nx];
            let mut d = vec![0.0; nx];
            for x in 0..nx {
                let i = y * nx + x;
                let nx_count = insulated_axis_counts(x, nx) as f64;
                // Implicit Lx (carries convection): Lx·u = −nx_count·c·u + conv·u.
                b[x] = 1.0 + (dt / 2.0) * (nx_count * c + conv);
                if x > 0 {
                    a[x] = -(dt / 2.0) * c;
                }
                if x + 1 < nx {
                    cc[x] = -(dt / 2.0) * c;
                }
                // RHS: (I − Δt/2·Ly)uⁿ + Δt/2·f — explicit y half.
                // Ly·u = +c·ny_count·u − c·(y-neighbors) ⇒ (I − Δt/2·Ly)u
                //        = u − Δt/2·c·ny_count·u + Δt/2·c·(y-neighbors).
                let ny_count = insulated_axis_counts(y, ny) as f64;
                let mut rhs = self.temp[i] + (dt / 2.0) * f[i];
                rhs -= (dt / 2.0) * (ny_count * c) * self.temp[i];
                if y > 0 {
                    rhs += (dt / 2.0) * c * self.temp[i - nx];
                }
                if y + 1 < ny {
                    rhs += (dt / 2.0) * c * self.temp[i + nx];
                }
                d[x] = rhs;
            }
            let row = thomas_solve(&a, &b, &cc, &d);
            for x in 0..nx {
                star[y * nx + x] = row[x];
            }
        }
        let mut out = vec![0.0; n];
        for x in 0..nx {
            let mut a = vec![0.0; ny];
            let mut b = vec![0.0; ny];
            let mut cc = vec![0.0; ny];
            let mut d = vec![0.0; ny];
            for y in 0..ny {
                let i = y * nx + x;
                let ny_count = insulated_axis_counts(y, ny) as f64;
                // Implicit Ly (pure y-laplacian; convection rode stage 1).
                b[y] = 1.0 + (dt / 2.0) * (ny_count * c);
                if y > 0 {
                    a[y] = -(dt / 2.0) * c;
                }
                if y + 1 < ny {
                    cc[y] = -(dt / 2.0) * c;
                }
                // RHS: (I − Δt/2·Lx)u* + Δt/2·f — explicit x half.
                // Lx·u = +c·nx_count·u + conv·u − c·(x-neighbors).
                let nx_count = insulated_axis_counts(x, nx) as f64;
                let mut rhs = star[i] + (dt / 2.0) * f[i];
                rhs -= (dt / 2.0) * (nx_count * c + conv) * star[i];
                if x > 0 {
                    rhs += (dt / 2.0) * c * star[i - 1];
                }
                if x + 1 < nx {
                    rhs += (dt / 2.0) * c * star[i + 1];
                }
                d[y] = rhs;
            }
            let col = thomas_solve(&a, &b, &cc, &d);
            for y in 0..ny {
                out[y * nx + x] = col[y];
            }
        }
        self.temp = out;
        self.max_temp()
    }

    /// PR-ADI with Dirichlet-ambient pinned edges.
    ///
    /// Each axis diagonal counts BOTH interior and pinned conductances of
    /// that axis; pinned cells are constant `T_amb`, so their drive
    /// `p = c·n_pin·T_amb` enters each half-step at `dt/2` (split like `f`).
    ///   Stage 1 (implicit Lx): `(I + Δt/2·Lx)u*  = (I − Δt/2·Ly)uⁿ + Δt/2·(f+p)`
    ///   Stage 2 (implicit Ly): `(I + Δt/2·Ly)uⁿ⁺¹ = (I − Δt/2·Lx)u* + Δt/2·(f+p)`
    /// Steady states are exact: at `u* = uⁿ` both stages reduce to
    /// `L·T = f + p` (conduction into the ambient reservoir balanced).
    fn step_cn_dirichlet(&mut self, dt: f64, c: f64, conv: f64, f: &[f64]) -> f64 {
        let (nx, ny) = (self.nx, self.ny);
        let ix = interior_extents(nx);
        let iy = interior_extents(ny);
        if ix == 0 || iy == 0 {
            self.pin_dirichlet_edges();
            return self.max_temp();
        }
        let mut interior = vec![0.0; ix * iy];
        for y in 0..iy {
            for x in 0..ix {
                interior[y * ix + x] = self.temp[(y + 1) * nx + (x + 1)];
            }
        }
        // Stage 1 (implicit Lx).
        let mut star = vec![0.0; ix * iy];
        for y in 0..iy {
            let mut a = vec![0.0; ix];
            let mut b = vec![0.0; ix];
            let mut cc = vec![0.0; ix];
            let mut d = vec![0.0; ix];
            for x in 0..ix {
                let k = y * ix + x;
                let gi = (y + 1) * nx + (x + 1);
                let (int_x, pin_x) = dirichlet_axis_counts(x, ix);
                let (int_y, pin_y) = dirichlet_axis_counts(y, iy);
                // Implicit Lx (carries convection).
                b[x] = 1.0 + (dt / 2.0) * (((int_x + pin_x) as f64) * c + conv);
                if x > 0 {
                    a[x] = -(dt / 2.0) * c;
                }
                if x + 1 < ix {
                    cc[x] = -(dt / 2.0) * c;
                }
                // RHS: (I − Δt/2·Ly)uⁿ + Δt/2·(f + p)
                // Ly·u = +c·(int_y+pin_y)·u − c·(interior y-neighbors).
                let mut rhs =
                    interior[k] - (dt / 2.0) * (((int_y + pin_y) as f64) * c) * interior[k];
                if y > 0 {
                    rhs += (dt / 2.0) * c * interior[k - ix];
                }
                if y + 1 < iy {
                    rhs += (dt / 2.0) * c * interior[k + ix];
                }
                let drive = c * ((pin_x + pin_y) as f64) * self.ambient_k;
                d[x] = rhs + (dt / 2.0) * (f[gi] + drive);
            }
            let row = thomas_solve(&a, &b, &cc, &d);
            for x in 0..ix {
                star[y * ix + x] = row[x];
            }
        }
        // Stage 2 (implicit Ly).
        let mut out = vec![0.0; ix * iy];
        for x in 0..ix {
            let mut a = vec![0.0; iy];
            let mut b = vec![0.0; iy];
            let mut cc = vec![0.0; iy];
            let mut d = vec![0.0; iy];
            for y in 0..iy {
                let k = y * ix + x;
                let (int_y, pin_y) = dirichlet_axis_counts(y, iy);
                b[y] = 1.0 + (dt / 2.0) * (((int_y + pin_y) as f64) * c);
                if y > 0 {
                    a[y] = -(dt / 2.0) * c;
                }
                if y + 1 < iy {
                    cc[y] = -(dt / 2.0) * c;
                }
                // RHS: (I − Δt/2·Lx)u* + Δt/2·(f + p)
                // Lx·u = +c·(int_x+pin_x)·u + conv·u − c·(interior x-neighbors).
                let (int_x, pin_x) = dirichlet_axis_counts(x, ix);
                let mut rhs =
                    star[k] - (dt / 2.0) * (((int_x + pin_x) as f64) * c + conv) * star[k];
                if x > 0 {
                    rhs += (dt / 2.0) * c * star[k - 1];
                }
                if x + 1 < ix {
                    rhs += (dt / 2.0) * c * star[k + 1];
                }
                let drive = c * ((pin_x + pin_y) as f64) * self.ambient_k;
                let gi = (y + 1) * nx + (x + 1);
                d[y] = rhs + (dt / 2.0) * (f[gi] + drive);
            }
            let col = thomas_solve(&a, &b, &cc, &d);
            for y in 0..iy {
                out[y * ix + x] = col[y];
            }
        }
        for y in 0..iy {
            for x in 0..ix {
                self.temp[(y + 1) * nx + (x + 1)] = out[y * ix + x];
            }
        }
        self.pin_dirichlet_edges();
        self.max_temp()
    }
}

// ---------------------------------------------------------------------------
// 3D grid (banded BE; CN is specified for ≤ 64² 2D grids)
// ---------------------------------------------------------------------------

/// Uniform-material 3D box grid (cubic cells).
#[derive(Debug)]
pub struct ThermalGrid3D {
    pub nx: usize,
    pub ny: usize,
    pub nz: usize,
    pub dx_m: f64,
    pub rho_c: f64,
    pub k: f64,
    pub ambient_k: f64,
    pub h_conv: f64,
    pub boundary: BoundaryMode,
    pub scheme: Scheme,
    /// Temperature field (K), row-major `((z·ny) + y)·nx + x`.
    pub temp: Vec<f64>,
    pub power_w: Option<Vec<f64>>,
    joule: Option<JouleSource>,
    be_cache: Option<(BandedLu, BeKey3D)>,
}

#[derive(Debug, Clone, Copy, PartialEq)]
struct BeKey3D {
    dt: f64,
    k: f64,
    rho_c: f64,
    dx_m: f64,
    h_conv: f64,
    boundary: BoundaryMode,
    nx: usize,
    ny: usize,
    nz: usize,
}

impl ThermalGrid3D {
    /// Admission-gated constructor (total cells vs the ep-core 128×128 budget).
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        nx: usize,
        ny: usize,
        nz: usize,
        dx_m: f64,
        rho_c: f64,
        k: f64,
        ambient_k: f64,
        h_conv: f64,
        boundary: BoundaryMode,
        scheme: Scheme,
        controller: &AdmissionController,
    ) -> Result<Self, AdmissionDecision> {
        let decision = admit_grid_3d(controller, nx, ny, nz);
        if !decision.admitted {
            return Err(decision);
        }
        Ok(Self {
            nx,
            ny,
            nz,
            dx_m,
            rho_c,
            k,
            ambient_k,
            h_conv,
            boundary,
            scheme,
            temp: vec![ambient_k; nx * ny * nz],
            power_w: None,
            joule: None,
            be_cache: None,
        })
    }

    /// Attach a Joule R(T) TCR source (WP-2.1 branch currents).
    pub fn set_joule_currents(
        &mut self,
        currents_a: Vec<f64>,
        area_m2: f64,
        length_m: f64,
        copper: &crate::reference::CopperElectro,
    ) {
        assert_eq!(currents_a.len(), self.temp.len(), "one current per cell");
        self.joule = Some(JouleSource {
            currents_a,
            area_m2,
            length_m,
            rho0_ohm_m: copper.resistivity_ohm_m_300k,
            tcr_per_k: copper.tcr_per_k,
            ref_k: copper.ref_k,
        });
    }

    fn cell_volume(&self) -> f64 {
        self.dx_m * self.dx_m * self.dx_m
    }

    /// Total stored heat energy (J).
    pub fn total_energy_j(&self) -> f64 {
        self.rho_c * self.cell_volume() * self.temp.iter().sum::<f64>()
    }

    pub fn max_temp(&self) -> f64 {
        self.temp.iter().cloned().fold(f64::MIN, f64::max)
    }

    fn conv_per_s(&self) -> f64 {
        if self.h_conv == 0.0 {
            0.0
        } else {
            self.h_conv / (self.rho_c * self.dx_m) // h·A/V = h·dx²/dx³
        }
    }

    fn cell_power(&self, index: usize, temp_k: f64) -> f64 {
        if let Some(j) = &self.joule {
            j.power_w(index, temp_k)
        } else if let Some(p) = &self.power_w {
            p[index]
        } else {
            0.0
        }
    }

    /// Backward Euler via banded LU (3D CN is out of the §1.4 CN scope).
    pub fn step(&mut self, dt: f64) -> f64 {
        debug_assert!(
            self.scheme == Scheme::BackwardEuler,
            "3D supports BackwardEuler (CN is specified for ≤ 64² 2D grids)"
        );
        self.step_be(dt)
    }

    pub fn step_be(&mut self, dt: f64) -> f64 {
        let key = BeKey3D {
            dt,
            k: self.k,
            rho_c: self.rho_c,
            dx_m: self.dx_m,
            h_conv: self.h_conv,
            boundary: self.boundary,
            nx: self.nx,
            ny: self.ny,
            nz: self.nz,
        };
        if self
            .be_cache
            .as_ref()
            .map(|(_, k)| *k != key)
            .unwrap_or(true)
        {
            let mut lu = self.build_be_matrix(dt);
            lu.factorize();
            self.be_cache = Some((lu, key));
        }
        let lu = &self.be_cache.as_ref().expect("just built").0;
        let conv = self.conv_per_s();
        let vol = self.cell_volume();
        let n = self.nx * self.ny * self.nz;
        let f: Vec<f64> = (0..n)
            .map(|i| {
                let p = self.cell_power(i, self.temp[i]) / (self.rho_c * vol);
                p + conv * self.ambient_k
            })
            .collect();
        match self.boundary {
            BoundaryMode::Insulated => {
                let rhs: Vec<f64> = (0..n).map(|i| self.temp[i] + dt * f[i]).collect();
                self.temp = lu.solve(&rhs);
            }
            BoundaryMode::DirichletAmbient => {
                let ix = self.nx.saturating_sub(2);
                let iy = self.ny.saturating_sub(2);
                let iz = self.nz.saturating_sub(2);
                if ix == 0 || iy == 0 || iz == 0 {
                    self.pin_dirichlet_edges();
                    return self.max_temp();
                }
                let c = (self.k / self.rho_c) / (self.dx_m * self.dx_m);
                let mut rhs = vec![0.0; ix * iy * iz];
                for z in 0..iz {
                    for y in 0..iy {
                        for x in 0..ix {
                            let k = (z * iy + y) * ix + x;
                            let gi = ((z + 1) * self.ny + (y + 1)) * self.nx + (x + 1);
                            let pinned = 6usize
                                - ((x > 0) as usize
                                    + (x + 1 < ix) as usize
                                    + (y > 0) as usize
                                    + (y + 1 < iy) as usize
                                    + (z > 0) as usize
                                    + (z + 1 < iz) as usize);
                            rhs[k] = self.temp[gi]
                                + dt * f[gi]
                                + dt * c * (pinned as f64) * self.ambient_k;
                        }
                    }
                }
                let out = lu.solve(&rhs);
                for z in 0..iz {
                    for y in 0..iy {
                        for x in 0..ix {
                            self.temp[((z + 1) * self.ny + (y + 1)) * self.nx + (x + 1)] =
                                out[(z * iy + y) * ix + x];
                        }
                    }
                }
                self.pin_dirichlet_edges();
            }
        }
        self.max_temp()
    }

    fn build_be_matrix(&self, dt: f64) -> BandedLu {
        let c = (self.k / self.rho_c) / (self.dx_m * self.dx_m);
        let conv = self.conv_per_s();
        match self.boundary {
            BoundaryMode::Insulated => {
                let (nx, ny, nz) = (self.nx, self.ny, self.nz);
                let n = nx * ny * nz;
                let p = nx * ny; // z-neighbors dominate the half-bandwidth
                let mut e = Vec::with_capacity(n * 7);
                for z in 0..nz {
                    for y in 0..ny {
                        for x in 0..nx {
                            let i = (z * ny + y) * nx + x;
                            let mut diag = 1.0 + dt * conv;
                            let mut link = |j: usize, diag: &mut f64| {
                                *diag += dt * c;
                                e.push((i, j, -dt * c));
                            };
                            if x > 0 {
                                link(i - 1, &mut diag);
                            }
                            if x + 1 < nx {
                                link(i + 1, &mut diag);
                            }
                            if y > 0 {
                                link(i - nx, &mut diag);
                            }
                            if y + 1 < ny {
                                link(i + nx, &mut diag);
                            }
                            if z > 0 {
                                link(i - nx * ny, &mut diag);
                            }
                            if z + 1 < nz {
                                link(i + nx * ny, &mut diag);
                            }
                            e.push((i, i, diag));
                        }
                    }
                }
                BandedLu::from_entries(n, p, &e)
            }
            BoundaryMode::DirichletAmbient => {
                let ix = self.nx.saturating_sub(2).max(1);
                let iy = self.ny.saturating_sub(2).max(1);
                let iz = self.nz.saturating_sub(2).max(1);
                let n = ix * iy * iz;
                let p = ix * iy; // z-neighbors dominate the half-bandwidth
                let mut e = Vec::with_capacity(n * 7);
                for z in 0..iz {
                    for y in 0..iy {
                        for x in 0..ix {
                            let i = (z * iy + y) * ix + x;
                            let (cx_i, pin_x) = dirichlet_axis_counts(x, ix);
                            let (cy_i, pin_y) = dirichlet_axis_counts(y, iy);
                            let (cz_i, pin_z) = dirichlet_axis_counts(z, iz);
                            let diag = 1.0
                                + dt * conv
                                + dt * c * ((cx_i + pin_x + cy_i + pin_y + cz_i + pin_z) as f64);
                            if x > 0 {
                                e.push((i, i - 1, -dt * c));
                            }
                            if x + 1 < ix {
                                e.push((i, i + 1, -dt * c));
                            }
                            if y > 0 {
                                e.push((i, i - ix, -dt * c));
                            }
                            if y + 1 < iy {
                                e.push((i, i + ix, -dt * c));
                            }
                            if z > 0 {
                                e.push((i, i - ix * iy, -dt * c));
                            }
                            if z + 1 < iz {
                                e.push((i, i + ix * iy, -dt * c));
                            }
                            e.push((i, i, diag));
                        }
                    }
                }
                BandedLu::from_entries(n, p, &e)
            }
        }
    }

    fn pin_dirichlet_edges(&mut self) {
        let (nx, ny, nz) = (self.nx, self.ny, self.nz);
        for z in 0..nz {
            for y in 0..ny {
                for x in 0..nx {
                    if x == 0 || y == 0 || z == 0 || x + 1 == nx || y + 1 == ny || z + 1 == nz {
                        self.temp[(z * ny + y) * nx + x] = self.ambient_k;
                    }
                }
            }
        }
    }
}
