//! Electrophysics Lab — Tauri v2 desktop shell (WP-1.1).
//!
//! Real buildable shell wrapping the Vite production build (`frontendDist:
//! ../dist`) with the typed IPC skeleton in `ipc.rs`:
//! `ping` / `version` / `admission_status` / `kernel_solve` /
//! `native_file_dialog`. The web app itself is unchanged and remains the
//! primary product; the browser path degrades cleanly because none of these
//! commands exist there (`src/desktop/bridge.ts` detects the runtime).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ipc;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      ipc::ping,
      ipc::version,
      ipc::admission_status,
      ipc::kernel_solve,
      ipc::native_file_dialog,
    ])
    .run(tauri::generate_context!())
    .expect("error while running Electrophysics Lab desktop shell");
}
