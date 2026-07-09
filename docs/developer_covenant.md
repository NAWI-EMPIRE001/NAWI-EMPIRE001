# 🤝 Developer Covenant

## Purpose
This covenant defines the strict professional boundaries, ethical coding rules, and technical obligations required from every engineer contributing to the NAWI-EMPIRE001 codebase.

---

## Engineering Commitments
By initializing or refactoring code within this repository, you agree to protect and implement:
* **Decoupled Microservice Enclaves:** Ensure that each pillar operates as an isolated node. Changes to `sonic-service` must never cascade errors into `market-service`.
* **Deterministic Logging Protocols:** Ensure that all transactional workflows emit precise status outputs containing payload hashes and precise execution times.
* **Cryptographic Attributions:** Enforce the presence of forensic stamping fields on all assets built inside the Diamondback Forge engine.
* **Fault-Tolerant Memory State Fallbacks:** Always construct alternative transaction blocks to trap and gracefully resolve interrupted execution loops if a cluster connection drops.

---

## Required Practices
Engineers must adhere to the following implementation standards:
* Document all adjustments to backend schema structures in `docs/ARCHITECTURE_DECISIONS.md`.
* Run thorough unit testing on the `escrowController` prior to any code staging.
* Ensure all wallet transaction metrics strictly respect the $1.00 platform base coin mechanics.
* Integrate explicit validation layers (`express-validator` or equivalent schemas) on all public API endpoints to prevent code injections or buffer overflows.

---

## Restricted Practices
The following technical decisions are strictly forbidden:
* **Escrow Bypassing:** Building direct user-to-user checkout routines that circumvent the Diamondback 231 Escrow Shield.
* **Log Scrubbing:** Writing routines that allow standard admins or system events to wipe or adjust transaction logs.
* **Anonymity Vulnerabilities:** Disabling or creating alternative authentication paths around the `induction.js` signature requirement.
* **Passive Layout Injections:** Adding automated playback loops, passive videostreams, or unvetted content-discovery blocks inside `index.html` or `dashboard.html`.

---

## Engineering Ethics Priority Hierarchy
When resolving architectural conflicts, developers must score their solutions against this strict index:
1. **System Integrity:** Secure state mutation of accounts and financial data.
2. **Operational Security:** Flawless verification, token security, and system auditing.
3. **Provenance Traceability:** Reliable, authentic mapping of digital assets to their original creators.
4. **Maintainability:** Clear, readable code architectures leveraging explicit asynchronous patterns.
5. **Scalability:** Clean handling of multi-user execution vectors.
