# FripCash — Backend contract (source of truth)

These docs define **product rules** shared by:

- Flutter app (`/home/justice/frip_cash`)
- Next.js site + admin (`fripcash` web)

Clients are **UI-complete against these rules**. The backend must enforce them; the UI only reflects them.

| Doc | Purpose |
|-----|---------|
| [authentication.md](./authentication.md) | **Auth surfaces:** app vs web dashboard vs admin vs courier |
| [disputes-refunds.md](./disputes-refunds.md) | **Litige → admin refund/partial/release** (+ offers/chat pointer) |
| [roles-and-capabilities.md](./roles-and-capabilities.md) | Canonical roles, shop kinds, permission matrix |
| [account-upgrade.md](./account-upgrade.md) | Upgrade (not role-switch), KYC, history |
| [listing-destinations.md](./listing-destinations.md) | Where listings appear + condition rules |
| [api-contract.md](./api-contract.md) | Endpoint sketch clients will call |

**Rule:** one account, additive capabilities. Never let users freely “swap role” like a theme toggle.
