# Desktop Build (Tauri v2) — Non-Invasive Packaging Path

The web app (`npm run dev` / `npm run build` + `vite preview`) remains the
primary product and the only CI-verified path. The Tauri shell in
`apps/electrophysics-3d/src-tauri/` is an **optional, inert packaging target**:
its presence changes nothing about the web build, the test suite, or CI.

## Prerequisites (one-time, local machine only)

- Rust stable (`rustup default stable`)
- Tauri CLI: `cargo install tauri-cli --version ^2`
- Windows WebView2 runtime (preinstalled on Windows 11)

## Build a standalone Windows `.exe`

```powershell
cd apps/electrophysics-3d
npx tauri build
```

Outputs land in `apps/electrophysics-3d/src-tauri/target/release/bundle/`
(NSIS installer + MSI). The shell loads the exact Vite production build
(`frontendDist: ../dist`) — the same physics/quantum/chip Web Workers, the
same reference-library SHA-256 verification, no code fork.

## Why the config is safe for CI

- `src-tauri/**` is plain configuration + an inert `main.rs` — nothing imports
  it, no web build step touches it, no workflow invokes `tauri`.
- `npm run dev` / `npm run build` / `npm run test:e2e` are byte-identical to
  the web-only flow.
- The CSP in `tauri.conf.json` mirrors the platform's security posture
  (loopback-only connect-src; no remote origins).

## Not included (honest boundary)

- No code-signing certificate is configured (unsigned installer; SmartScreen
  will warn).
- No native IPC bridge: the CAD workbench is fully client-side and needs no
  Rust-side services today. If a future milestone adds local ngspice bridging
  through the desktop shell, it goes through the existing
  `services/physics-kernel` protocol first.
