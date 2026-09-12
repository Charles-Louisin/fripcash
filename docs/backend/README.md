# FripCash — Backend contract (source of truth)

These docs define **product rules** shared by:

- Flutter app (`/home/justice/frip_cash`)
- Next.js site + admin (`fripcash` web)

Clients are **UI-complete against these rules**. The backend must enforce them; the UI only reflects them.

| Doc | Purpose |
|-----|---------|
| [roles-and-capabilities.md](./roles-and-capabilities.md) | Canonical roles, shop kinds, permission matrix |
| [account-upgrade.md](./account-upgrade.md) | Upgrade (not role-switch), KYC, history |
| [listing-destinations.md](./listing-destinations.md) | Where listings appear + condition rules |
| [api-contract.md](./api-contract.md) | Endpoint sketch clients will call |

**Rule:** one account, additive capabilities. Never let users freely “swap role” like a theme toggle.
