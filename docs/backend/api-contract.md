# API contract sketch (shared app + web)

Shape for the Nest (or other) API. Exact paths/DTO names can move; **semantics must match**.

## Auth & me

> **Four auth surfaces** (do not collapse): marketplace consumer (app + web dashboard), admin, courier.  
> See [authentication.md](./authentication.md).

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/register` | Consumer; body includes signup path (`SignUpRole`) |
| POST | `/auth/login` | Consumer phone + password → `aud: consumer` |
| POST | `/auth/otp/request` | Consumer SMS |
| POST | `/auth/otp/verify` | Consumer |
| POST | `/auth/password/forgot` | Consumer |
| POST | `/auth/password/reset` | Consumer |
| POST | `/auth/admin/login` | Staff **email** + password → `aud: admin` |
| POST | `/auth/courier/login` | Livreur phone + password → `aud: courier` (or role claim) |
| GET | `/me` | Consumer capability snapshot |
| GET | `/admin/me` | Staff profile |
| GET | `/courier/me` | Courier profile |
| PATCH | `/me` | Profile fields only — **not** role |

### `GET /me` (minimal)

```json
{
  "id": "usr_…",
  "phone": "+224…",
  "displayName": "…",
  "canBuy": true,
  "seller": {
    "kind": "none | particulier | boutique",
    "shopKind": "standard | proximite | enseigne | null",
    "verificationStatus": "none | pending | approved | rejected",
    "listingDestination": "secondeMain | articlesNeufs | quartierBoutiques | enseignes | null",
    "capabilities": {
      "createListing": false,
      "excelImport": false,
      "productLibrary": false,
      "sellerDashboard": false
    }
  },
  "courier": null,
  "isAdmin": false
}
```

Clients gate UI from `capabilities` + `verificationStatus`, not from guessing enums alone.

---

## Seller upgrade

| Method | Path | Notes |
|--------|------|-------|
| POST | `/me/seller/particulier` | Buyer → particulier (light) |
| POST | `/me/seller/shop` | Buyer or particulier → boutique application (`shopKind` in body) |
| GET | `/me/seller/verification` | Pending status / rejection reason |

**No** `PUT /me/role` free switcher.

Shop applications that need review create `verificationStatus: pending`. Admin:

| Method | Path |
|--------|------|
| GET | `/admin/seller-verifications` |
| POST | `/admin/seller-verifications/:id/approve` |
| POST | `/admin/seller-verifications/:id/reject` |

---

## Listings

| Method | Path | Notes |
|--------|------|-------|
| POST | `/listings` | Reject if no seller or pending-blocked |
| PATCH | `/listings/:id` | Owner only |
| GET | `/listings` | Filters by destination / category |

Server sets `listingDestination` from seller profile.

---

## Orders / wallet / disputes

- List purchases by buyer id; sales by seller id — **same user can have both**.  
- Commission computed server-side.  
- Dispute resolve: **admin only**.

---

## Courier

Separate auth or role claim → courier routes under `/courier/*`. Do not reuse marketplace sell endpoints.

---

## Web vs app

Same endpoints. Web may only call:

- `POST /me/seller/particulier`
- deep-link / store CTA for shop upgrades

App calls full shop application endpoints.
