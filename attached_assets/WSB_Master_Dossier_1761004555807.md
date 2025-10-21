# Wallet Spam Blocker — Master Dossier
Version: FINAL
## Table of Contents20. [Deep3 Labs Integration](#20-deep3-labs-integration)18. [Tier Feature Flags & Enforcement](#18-tier-feature-flags--enforcement)19. [Update Delivery Strategy](#19-update-delivery-strategy)

---

## 20) Deep3 Labs Integration

**Purpose:** Use Deep3 Labs’ API/models to reinforce threat detection (Pro tier AI) and optionally power recommendation/anomaly signals. This augments our local classifier; it does not replace CA‑first rules.

### Where we use it
- **Basic**: no Deep3 calls (local classifier only).
- **Pro**: AI reinforcement lookups (address/token risk, metadata hints).
- **Pro+**: same as Pro, plus arbitrage gating by Deep3 risk.

### Data flow (augmented)
ObservedToken → Local Classifier → (optional) Deep3 → Merge → Decision

**Merge rule:** Local BLOCK wins; Deep3 can only raise severity.