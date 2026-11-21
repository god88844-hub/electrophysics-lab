//! WP-1.1 typed IPC skeleton for the Electrophysics Lab desktop shell.
//!
//! Contract surface (typed, serde-camelCase on the wire, mirrored by
//! `apps/electrophysics-3d/src/desktop/contracts.ts`):
//!
//! | Command              | Request                      | Response                       |
//! | -------------------- | ---------------------------- | ------------------------------ |
//! | `ping`               | `{ echo?: string \| null }`  | `PingResponse`                 |
//! | `version`            | —                            | `VersionInfo`                  |
//! | `admission_status`   | —                            | `AdmissionStatus`              |
//! | `kernel_solve`       | `{ request: SolveRequest }`  | `SolveOutcome`                 |
//! | `native_file_dialog` | `{ options?: DialogOptions }`| `FileDialogResult`             |
//!
//! Admission budgets are the documented interactive budgets of
//! `docs/master-plan/02_SYSTEM_ARCHITECTURE.md` §2.3. In this WP-1.1 skeleton
//! they are enforced fail-closed here at the shell boundary; WP-1.2 replaces
//! this surface with the real `ep-core` admission controller inside
//! `crates/ep-kernel/` (same wire contract, same refusal shape
//! `{ "admitted": false, "reason": "..." }`).
//!
//! `kernel_solve` on the `idle` workload returns a schema-valid empty frame
//! conforming to `docs/master-plan/schemas/solver-frame.schema.json`
//! (`format: "invention-lab/solver-frame/1"`). It carries **no** measured or
//! derived physics: circuits are empty and the note field states explicitly
//! that no solver is attached yet (Builder Rule 1 — zero fake numbers).
//!
//! Frames > 1 MiB will be chunked once real frames flow through this channel
//! (`PHASE_01` failure-mode note); the idle frame is far below the limit.

use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, FilePath};

/// Documented interactive budgets (`02_SYSTEM_ARCHITECTURE.md` §2.3).
/// WP-1.2 (`ep-core`) owns the real enforcement; these constants are the
/// shell-boundary mirror used for fail-closed validation in this skeleton.
pub const QUANTUM_MAX_QUBITS: u32 = 6;
pub const MNA_MAX_NODES: u32 = 64;
pub const MNA_MAX_VOLTAGE_SOURCES: u32 = 32;
pub const THERMAL_MAX_COLS: u32 = 128;
pub const THERMAL_MAX_ROWS: u32 = 128;
pub const ARENA_MAX_BYTES: u64 = 512 * 1024 * 1024;
pub const BUDGET_SOURCE: &str = "docs/master-plan/02_SYSTEM_ARCHITECTURE.md §2.3 (interactive budgets)";

const SOLVER_FRAME_FORMAT: &str = "invention-lab/solver-frame/1";
const SHELL_MODE: &str = "tauri-shell-skeleton/1";

/// Monotonic frame counter per `solver-frame.schema.json` (`frameId`).
static FRAME_COUNTER: AtomicU64 = AtomicU64::new(0);

// ---------------------------------------------------------------------------
// ping
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingResponse {
  pong: bool,
  echo: Option<String>,
  ts_unix_ms: u64,
  /// `"tauri-desktop"` when answered by the native shell.
  runtime: &'static str,
}

#[tauri::command]
pub fn ping(echo: Option<String>) -> PingResponse {
  PingResponse {
    pong: true,
    echo,
    ts_unix_ms: SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .map(|d| d.as_millis() as u64)
      .unwrap_or(0),
    runtime: "tauri-desktop",
  }
}

// ---------------------------------------------------------------------------
// version
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VersionInfo {
  app_name: String,
  app_version: String,
  /// Tauri crate version the shell was built against.
  tauri_version: &'static str,
  os: &'static str,
  arch: &'static str,
  family: &'static str,
  /// Honest static statement of the WebView backend for this platform.
  webview_runtime: &'static str,
  /// `false` until `crates/ep-kernel` is linked into the shell (WP-1.2).
  kernel_attached: bool,
}

#[tauri::command]
pub fn version(app: AppHandle) -> VersionInfo {
  let webview_runtime: &'static str = if cfg!(target_os = "windows") {
    "WebView2 (Evergreen, Edge Chromium)"
  } else if cfg!(target_os = "macos") {
    "WKWebView"
  } else if cfg!(target_os = "linux") {
    "WebKitGTK"
  } else {
    "unknown"
  };
  VersionInfo {
    app_name: app.package_info().name.clone(),
    app_version: app.package_info().version.to_string(),
    tauri_version: tauri::VERSION,
    os: std::env::consts::OS,
    arch: std::env::consts::ARCH,
    family: std::env::consts::FAMILY,
    webview_runtime,
    kernel_attached: false,
  }
}

// ---------------------------------------------------------------------------
// admission status
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AdmissionBudgets {
  quantum_max_qubits: u32,
  mna_max_nodes: u32,
  mna_max_voltage_sources: u32,
  thermal_max_cols: u32,
  thermal_max_rows: u32,
  arena_max_bytes: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdmissionStatus {
  /// The shell itself is always admissible; workload admission happens in
  /// `kernel_solve` and, from WP-1.2, inside `ep-core`.
  admitted: bool,
  mode: &'static str,
  reason: Option<String>,
  budgets: AdmissionBudgets,
  budget_source: &'static str,
}

#[tauri::command]
pub fn admission_status() -> AdmissionStatus {
  AdmissionStatus {
    admitted: true,
    mode: SHELL_MODE,
    reason: None,
    budgets: AdmissionBudgets {
      quantum_max_qubits: QUANTUM_MAX_QUBITS,
      mna_max_nodes: MNA_MAX_NODES,
      mna_max_voltage_sources: MNA_MAX_VOLTAGE_SOURCES,
      thermal_max_cols: THERMAL_MAX_COLS,
      thermal_max_rows: THERMAL_MAX_ROWS,
      arena_max_bytes: ARENA_MAX_BYTES,
    },
    budget_source: BUDGET_SOURCE,
  }
}

// ---------------------------------------------------------------------------
// kernel_solve
// ---------------------------------------------------------------------------

/// Workload descriptor for the solve channel. `type` tags mirror
/// `src/desktop/contracts.ts` (`SolveWorkload`).
#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Workload {
  /// No-op contract-validation request.
  Idle,
  Quantum {
    qubits: u32,
  },
  Mna {
    nodes: u32,
    #[serde(rename = "voltageSources")]
    voltage_sources: u32,
  },
  Thermal {
    cols: u32,
    rows: u32,
  },
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolveRequest {
  workload: Workload,
}

/// Per-circuit telemetry arrays (serialized typed arrays on the wire).
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FrameCircuit {
  id: String,
  node_voltages: Vec<f64>,
  currents: Vec<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FrameThermal {
  grid_max_c: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FrameProvenance {
  badge: &'static str,
  solver: &'static str,
}

/// Wire shape conforming to `docs/master-plan/schemas/solver-frame.schema.json`.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SolverFrame {
  format: &'static str,
  frame_id: u64,
  t_sim_s: f64,
  live: bool,
  circuits: Vec<FrameCircuit>,
  thermal: FrameThermal,
  provenance: FrameProvenance,
  /// Extra (schema-permitted) honesty note for the WP-1.1 skeleton frame.
  note: &'static str,
}

/// `{ "admitted": false, "reason": "..." }` refusal contract of
/// `02_SYSTEM_ARCHITECTURE.md` §2.3 — refusals are honest payloads, never
/// silent clamps and never crashes (Builder Rule 1 / Law 4).
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SolveOutcome {
  admitted: bool,
  reason: Option<String>,
  frame: Option<SolverFrame>,
}

impl SolveOutcome {
  fn refused(reason: String) -> Self {
    SolveOutcome {
      admitted: false,
      reason: Some(reason),
      frame: None,
    }
  }

  fn admitted_frame(frame: SolverFrame) -> Self {
    SolveOutcome {
      admitted: true,
      reason: None,
      frame: Some(frame),
    }
  }
}

/// The valid, empty idle frame. No solver is attached in WP-1.1, so no field
/// carries a measured/derived physical value (see module docs).
fn idle_frame() -> SolverFrame {
  SolverFrame {
    format: SOLVER_FRAME_FORMAT,
    frame_id: FRAME_COUNTER.fetch_add(1, Ordering::Relaxed),
    t_sim_s: 0.0,
    live: false,
    circuits: Vec::new(),
    thermal: FrameThermal { grid_max_c: 0.0 },
    provenance: FrameProvenance {
      badge: "SIMULATED_ARCHITECTURAL_MODEL",
      solver: "tauri-shell-skeleton/1 (idle)",
    },
    note: "WP-1.1 shell skeleton idle frame — no kernel attached yet (ep-kernel lands in WP-1.2); circuits are empty and numeric fields carry no measured or derived physical value",
  }
}

#[tauri::command]
pub fn kernel_solve(request: SolveRequest) -> SolveOutcome {
  // Fail-closed admission check against the documented interactive budgets.
  // Budget refusals are exact and cite the limit; the "solver not attached"
  // refusal states the real reason (WP-1.1 has no kernel) — never a fake
  // solve of real workloads.
  match request.workload {
    Workload::Idle => SolveOutcome::admitted_frame(idle_frame()),
    Workload::Quantum { qubits } => {
      if qubits > QUANTUM_MAX_QUBITS {
        SolveOutcome::refused(format!(
          "admission refused: quantum workload requests {qubits} qubits, interactive budget is ≤ {QUANTUM_MAX_QUBITS} (density matrix d ≤ 64) — {}",
          BUDGET_SOURCE
        ))
      } else {
        SolveOutcome::refused(
          "admission deferred: workload is within budget but no solver is attached in the WP-1.1 shell skeleton (ep-kernel lands in WP-1.2)".to_string(),
        )
      }
    }
    Workload::Mna {
      nodes,
      voltage_sources,
    } => {
      if nodes > MNA_MAX_NODES {
        SolveOutcome::refused(format!(
          "admission refused: MNA workload requests {nodes} nodes, budget is ≤ {MNA_MAX_NODES} per frame — {}",
          BUDGET_SOURCE
        ))
      } else if voltage_sources > MNA_MAX_VOLTAGE_SOURCES {
        SolveOutcome::refused(format!(
          "admission refused: MNA workload requests {voltage_sources} voltage sources, budget is ≤ {MNA_MAX_VOLTAGE_SOURCES} per frame — {}",
          BUDGET_SOURCE
        ))
      } else {
        SolveOutcome::refused(
          "admission deferred: workload is within budget but no solver is attached in the WP-1.1 shell skeleton (ep-kernel lands in WP-1.2)".to_string(),
        )
      }
    }
    Workload::Thermal { cols, rows } => {
      if cols > THERMAL_MAX_COLS || rows > THERMAL_MAX_ROWS {
        SolveOutcome::refused(format!(
          "admission refused: thermal workload requests {cols}×{rows} cells, budget is ≤ {THERMAL_MAX_COLS}×{THERMAL_MAX_ROWS} per workspace — {}",
          BUDGET_SOURCE
        ))
      } else {
        SolveOutcome::refused(
          "admission deferred: workload is within budget but no solver is attached in the WP-1.1 shell skeleton (ep-kernel lands in WP-1.2)".to_string(),
        )
      }
    }
  }
}

// ---------------------------------------------------------------------------
// native file dialog
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DialogFilter {
  name: String,
  /// Extensions without the dot, e.g. `["eplab", "json"]`.
  extensions: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DialogOptions {
  title: Option<String>,
  filters: Option<Vec<DialogFilter>>,
  /// `open-file` (default) or `save-file`.
  kind: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileDialogResult {
  accepted: bool,
  path: Option<String>,
  cancelled: bool,
  /// Always `null` in desktop mode (the dialog itself never errors here);
  /// carries the browser-mode degradation reason on the frontend contract.
  reason: Option<String>,
}

/// Opens a native file dialog. Must run off the main thread for the blocking
/// dialog API — Tauri executes `async` commands on the async runtime, which
/// satisfies `blocking_pick_file`/`blocking_save_file`.
#[tauri::command]
pub async fn native_file_dialog(
  app: AppHandle,
  options: Option<DialogOptions>,
) -> FileDialogResult {
  let options = options.unwrap_or(DialogOptions {
    title: None,
    filters: None,
    kind: None,
  });
  let save = matches!(options.kind.as_deref(), Some("save-file"));
  let mut builder = app.dialog().file();
  if let Some(title) = options.title.as_deref() {
    builder = builder.set_title(title);
  }
  if let Some(filters) = options.filters.as_deref() {
    for filter in filters {
      let exts: Vec<&str> = filter.extensions.iter().map(|e| e.as_str()).collect();
      builder = builder.add_filter(&filter.name, &exts);
    }
  }
  let picked: Option<FilePath> = if save {
    builder.blocking_save_file()
  } else {
    builder.blocking_pick_file()
  };
  match picked {
    Some(path) => FileDialogResult {
      accepted: true,
      path: Some(path.to_string()),
      cancelled: false,
      reason: None,
    },
    None => FileDialogResult {
      accepted: false,
      path: None,
      cancelled: true,
      reason: None,
    },
  }
}
