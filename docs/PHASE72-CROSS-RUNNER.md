# Phase 72 — Cross-runner research-source bundle acceptance

The Linux, macOS and Windows GitHub-hosted runners all recheck one artifact built in an Ubuntu job. The archive is built from exact clean Git-tracked files, rehashed and inspected for regular-file-only members. A separate Node process launches the extracted research web app on a loopback ephemeral port; the verifier checks the supported HTTP responses, headers and private-route rejection. Each runner independently recomputes the archive manifest and checks its extracted ESM module loading.

These are **GitHub CI runner smoke tests**. They are not independent end-user acceptance, signed native installers, independent penetration testing, a comprehensive dependency license audit or hardware qualification. Physical-device success probabilities remain unknown.
