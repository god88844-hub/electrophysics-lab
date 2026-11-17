# Phase 69 — Reproducible and inventory-verified research web bundle

Build a deterministic GNU USTAR archive containing **only Git-tracked regular files** needed for the local web application. The application includes the Node `package.json` with `"type": "module"`, which is essential to execute the extracted `.js` modules as ES modules. Earlier builds omitted this metadata and therefore were not runtime-complete.

The builder uses a null-delimited exact file list, does not recursively package local directories, refuses tracked symlinks and rejects unsafe paths. File SHA-256 values and byte lengths are recorded; the verifier parses the USTAR headers, validates member type, checksum and exact inventory, rejects extra/missing/duplicate members and verifies every payload before safe in-memory extraction. An extracted Node ESM module import is exercised independently of the developer working tree.

Adversarial tests plant an untracked fake-private file beneath `js/`, confirm the archive hash stays identical, then attempt to append a rogue file and forge the overall archive SHA-256. Both leaks are prevented/detected. These checks prevent accidental inclusion of untracked files, **not** adversarial repository-owner tampering, unauthorized code-signing or malicious upstream source commits.

This remains a **research source archive**, not a signed Windows/macOS/Linux native installer, a fully tested browser deployment, a trusted signed publisher identity or an independently reviewed production release. GitHub Actions and archive integrity checks are software evidence; physical qualification remains unknown.
