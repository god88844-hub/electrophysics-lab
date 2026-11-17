# Phase 70 — Security, integrity and scientific release-blocker audit

Introduces a narrow static app allowlist and rejects requests for Git internals, scripts, tests, hidden configuration files and local server source. Prevents symlink escape through realpath checks, serves only GET/HEAD, and emits defensive HTTP response headers. Browser smoke remains supported through a single explicitly allowed test HTML fixture.

Source-bounded automated adversarial tests cover traversal, encoded segments and missing internal assets, with strict source-policy replay and full inherited repository CI. The static report must not be mistaken for an independent penetration test, dependency supply-chain audit, comprehensive secure web hosting certification or independent scientific peer review. The CSP retains an inline-script exception needed by the legacy browser smoke, so CSP hardening is incomplete.

Physical performance/qualification is not established by passing source security checks. All prior real-world fan, fabricated ALU, quantum-hardware and accelerator gaps remain open.
