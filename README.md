# StellarTimeLock × Scopuly — Testnet SEP-7 request generator

Live page: https://stellartimelock.github.io/scopuly-testnet/

Active test page for the StellarTimeLock + Scopuly integration. It builds unsigned
SEP-7 `web+stellar:tx` requests for the StellarTimeLock vault contract so they can be
opened and signed in the Scopuly wallet:

- **Create vault**: `create_dead_man_switch_vault` (1 stroop of testnet XLM, 1-hour check-in window)
- **Ping (check in)**: `ping` on a vault you own

Each request is shown as a SEP-7 URI, a QR code, and the unsigned transaction XDR.

## Testnet only, no keys

- Network: Stellar Testnet (`Test SDF Network ; September 2015`). No real funds.
- Contract: `CAHAQAN6KYAQCJ34W6CVZJGMWRXKCZFHM32F37E4EFEIIC4636TD74BV` (testnet).
- The page holds no keys and signs nothing. Your wallet signs and submits.
- No `callback` is attached; the result is the transaction on the network.

## Usage

- Link parameters: `?account=G…&vault=N` prefill the source/owner account and the vault id,
  e.g. `https://stellartimelock.github.io/scopuly-testnet/?account=G...&vault=33`.
- Without parameters the page uses the sample account and vault 22.
- Requests expire 30 minutes after they are generated; press "Generate fresh request" for a new one.

## Files

- `index.html`: the page (steps, QR code, URI and XDR output).
- `build.js`: builds and simulates the transactions and the `web+stellar:tx` URIs (`buildCreate`, `buildPing`).
- `vendor/`: `stellar-sdk` and `qrcode` browser builds.
