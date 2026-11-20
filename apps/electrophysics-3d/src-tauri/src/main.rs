// Optional Tauri v2 desktop shell — inert template. The web build remains the
// primary product; compiling this requires the Tauri CLI (see docs/planning/
// DESKTOP_BUILD.md). No platform behavior is changed by this file's presence.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // Single-window shell that loads the Vite build (frontendDist per
  // tauri.conf.json). No custom IPC surface yet — the CAD workbench is fully
  // client-side and needs no native bridge for its physics workers.
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running Electrophysics Lab desktop shell");
}
