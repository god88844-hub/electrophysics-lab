# Desktop build and release (Tauri v2)

The web entry points are unchanged. The Windows desktop shell embeds the Vite
production bundle and exposes the WP-1.1 IPC contract. Release packaging runs
on a Windows machine with WebView2, Rust stable, Git, Node.js, Python 3.11 and
PowerShell 7. CI uses MSVC. A local GNU toolchain works with a space-free
source directory and Cargo target. The artifacts are unsigned.

## Build from the Phase 39 archive

Use a clean checkout with original file bytes. On Windows create it with
Git's autocrlf conversion disabled. Generate the archive from the commit
being released, with its full Git history available.

```powershell
python scripts/phase39-source-baseline.py --build
python scripts/phase39-source-baseline.py --verify
python scripts/phase39-strict-audit.py
./scripts/v4-release/build-desktop-release.ps1 -Repo $PWD.Path -SourceDir C:/ep65-source -TargetDir C:/ep65-target -OutputDir C:/ep65-artifacts
```

For GNU add -Toolchain stable-x86_64-pc-windows-gnu. Source and output
directories must be new and outside the Git checkout. The script authenticates
the exact Phase 39 ZIP against HEAD, its Git tree and the archived source
manifest. It builds from those extracted bytes. Cargo must discover the
standalone Tauri manifest, so the extracted root kernel workspace manifest is
temporarily moved aside and restored byte-for-byte.

The script rebuilds Vite and the app twice with the lockfiles enforced. It
pins executable modification time for bundle inputs and checks every frontend
file and release artifact. The rebuild report records both hashes and any
verified WiX package and product identifiers, loader identifiers and 8.3
alias, compound-file root modification time, and cabinet member timestamps.
All remaining bytes must match after normalizing those fields. Comparison operates on
separate copies and refuses differences outside the documented metadata. It
runs the WP-1.1 desktop smoke and checks WebView2 console errors, reference
vault integrity and Academy availability.

The first build's release archive contains electrophysics-lab.exe,
the NSIS setup executable, the MSI, and the verified release receipt. The GNU
build includes WebView2Loader.dll beside the executable, which loads it at
startup. The release CSP admits the Tauri IPC origin used by WebView2.
[Tauri content security policy](https://v2.tauri.app/security/csp/).
The receipt also records the exact Vite manifest and bundle hashes, Phase 39
archive digest, source commit and tree, and all sealed vault manifest roots.
It records the pinned SKY130 1.95 V SOA, all four Q4 primitives and the physical
scope of the software release. Run the receipt verifier against the exact
source commit and the retained build inputs to check the hashes again.

```powershell
node scripts/v4-release/verify-desktop-release.mjs verify --repo . --baseline benchmarks/evidence/phase39 --artifacts C:/ep65-artifacts/first --frontend C:/ep65-artifacts/first/dist --receipt C:/ep65-artifacts/desktop-release-receipt.json
```

The Windows workflow runs on manual dispatch and v* tags, then uploads the
installers, executable, receipt and rebuild report as Actions artifacts.
The verification ledger may use a later commit to record hashes of an
earlier evidence commit. Putting the archive digest into its own source tree
would change that digest.
