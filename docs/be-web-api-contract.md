# FripCash Web — Complete Backend API Contract

**Audience:** Backend / Nest API team  
**Client:** Next.js web (`fripcash` — public site + consumer dashboard + admin console)  
**Out of scope for this document:** Flutter mobile-only depth (full courier shell, full shop KYC UX, Excel/library tools). Those come in a **separate mobile endpoint pack**. Anything the web already calls or must call is included here.  
**Date:** 2026-09-26  
**Base URL:** `/api/v1`  
**Related locked product docs:**  
- `docs/be-listing-create-pricing-fields.md`  
- `docs/be-pending-listing-create-bug.md`  
- `docs/srs/*`, `docs/backend/*`

---

## Table of contents

1. [Conventions](#1-conventions)  
2. [Auth surfaces & audiences](#2-auth-surfaces--audiences)  
3. [Error model](#3-error-model)  
4. [Auth & session](#4-auth--session)  
5. [Me & seller upgrade](#5-me--seller-upgrade)  
6. [Catalog (categories & zones)](#6-catalog-categories--zones)  
7. [Listings (public + seller + media)](#7-listings-public--seller--media)  
8. [Pricing, commission, discount (locked)](#8-pricing-commission-discount-locked)  
9. [Cart & checkout](#9-cart--checkout)  
10. [Orders, escrow, fulfillment](#10-orders-escrow-fulfillment)  
11. [Disputes & refunds](#11-disputes--refunds)  
12. [Reviews & comments](#12-reviews--comments)  
13. [Offers](#13-offers)  
14. [Messaging](#14-messaging)  
15. [Favorites](#15-favorites)  
16. [Wallet](#16-wallet)  
17. [Notifications](#17-notifications)  
18. [Media / Cloudinary](#18-media--cloudinary)  
19. [Admin console](#19-admin-console)  
20. [Reports / signalements](#20-reports--signalements)  
21. [Health & realtime](#21-health--realtime)  
22. [Seed & acceptance matrix](#22-seed--acceptance-matrix)  
23. [Priority backlog for BE](#23-priority-backlog-for-be)  
24. [Explicitly deferred to mobile pack](#24-explicitly-deferred-to-mobile-pack)

---

## 1. Conventions

### 1.1 Transport

| Rule | Detail |
|------|--------|
| Protocol | HTTPS |
| Auth header | `Authorization: Bearer <token>` |
| Locale | `x-locale: FR \| EN` (error messages) |
| Content-Type | `application/json` unless multipart (not used on web today) |
| Money | Integer **GNF** (no decimals) |
| IDs | Opaque strings (cuid/uuid) |
| Timestamps | ISO-8601 UTC |

### 1.2 Status legend (per endpoint)

| Tag | Meaning |
|-----|---------|
| `EXISTS` | Web already calls it; keep stable or extend carefully |
| `FIX` | Exists but wrong/incomplete vs product (must change) |
| `MISSING` | Web needs it; not available or 404 today |
| `EXTEND` | Exists; add fields documented below |

### 1.3 Pagination (standard when list can be large)

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

Query: `?page=1&pageSize=20`. If BE returns a raw array today, keep supporting arrays **and** prefer `{ items, total }` going forward (web can unwrap either).

### 1.4 Idempotency

Mutating money / checkout / refund: accept optional `Idempotency-Key` header; document behavior.

---

## 2. Auth surfaces & audiences

Web has **three** surfaces. Do **not** collapse them.

| Surface | Entry UI | Audience claim | Lands on |
|---------|----------|----------------|----------|
| **A. Marketplace consumer** | `/connexion`, `/inscription` | `CONSUMER` | `/dashboard/*`, public buy/sell light |
| **B. Admin** | `/admin-login` **only** | `ADMIN` | `/admin/*` |
| **C. Courier** | **Not on web** (mobile Espace livreur) | `COURIER` | App only |

### Hard rules

1. Consumer token → **403** on `/admin/**`.  
2. Admin token → **403** on buyer/seller marketplace mutations by default (`POST /listings`, checkout, etc.).  
3. Courier token → **403** on `GET /me` (consumer) and on `/admin/**`.  
4. `POST /auth/sign-in/email` (consumer) must **reject** `userKind=ADMIN` and `userKind=COURIER` with a clear code (not a usable consumer session).  
5. Staff login **only** via `POST /auth/admin/login`.  
6. Courier login **only** via `POST /auth/courier/login` (mobile pack; web must keep rejecting courier on `/connexion`).

### Product note (web)

Livreur / boutique KYC / Excel / product library → **CTA to mobile app**. Web still needs the APIs listed here where admin or light particulier sell uses them.

---

## 3. Error model

Every Nest error:

```json
{
  "statusCode": 403,
  "code": "FORBIDDEN_AUDIENCE",
  "message": "Vous n'avez pas accès à cette zone de l'application.",
  "correlationId": "uuid",
  "locale": "FR"
}
```

### Required error codes (web-facing)

| Code | When |
|------|------|
| `UNAUTHORIZED` | Missing/invalid token |
| `FORBIDDEN_AUDIENCE` | Wrong audience for route |
| `FORBIDDEN` | Authenticated but not allowed |
| `NOT_FOUND` | Resource missing |
| `VALIDATION_ERROR` | Bad body/query |
| `CONFLICT` | State conflict (e.g. already reviewed) |
| `SELLER_VERIFICATION_PENDING` | Seller path blocked on pending (not `FORBIDDEN_AUDIENCE`) |
| `LISTING_NOT_NEGOTIABLE` | Offer on non-negotiable listing |
| `INSUFFICIENT_STOCK` | Checkout / cart |
| `INSUFFICIENT_WALLET_BALANCE` | Wallet pay |
| `ORDER_NOT_CONFIRMABLE` | Confirm reception wrong state |
| `DISPUTE_NOT_ALLOWED` | Dispute window / state |
| `RATE_LIMITED` / `TOO_MANY_ATTEMPTS` | OTP |

French messages for `locale=FR`; English for `EN`.

---

## 4. Auth & session

### 4.1 Phone OTP (Guinée — consumer)

#### `POST /auth/phone-number/send-otp` — `EXISTS`

```json
{ "phoneNumber": "+2246XXXXXXX" }
```

**200:** `{ "message": "…" }`  
**Errors:** invalid phone, rate limit.

#### `POST /auth/phone-number/verify` — `EXISTS`

```json
{ "phoneNumber": "+2246XXXXXXX", "code": "000000" }
```

**200:**

```json
{
  "status": true,
  "token": "<consumer_session_token>",
  "user": {
    "id": "…",
    "name": "…",
    "email": null,
    "phoneNumber": "+224…",
    "phoneNumberVerified": true,
    "preferredLocale": "FR",
    "userKind": "CONSUMER",
    "authAudience": "CONSUMER"
  }
}
```

Must mint **CONSUMER** audience only.

---

### 4.2 Email auth (France — consumer)

#### `POST /auth/sign-up/email` — `EXISTS`

```json
{ "email": "a@b.com", "password": "…", "name": "Jean Dupont" }
```

#### `POST /auth/sign-in/email` — `FIX`

Same body.  
**Must reject** staff/courier:

```json
{
  "statusCode": 403,
  "code": "FORBIDDEN_AUDIENCE",
  "message": "Ce compte n'est pas un compte acheteur/vendeur. …"
}
```

(Do not return the raw “use POST /auth/admin/login” string to consumers; keep that for logs. Web maps friendly copy.)

#### `POST /auth/send-verification-email` — `EXISTS`  
#### `GET /auth/verify-email?token=` — `EXISTS`  
#### `POST /auth/request-password-reset` — `EXISTS`  
#### `POST /auth/reset-password` — `EXISTS` `{ "token", "newPassword" }`  
#### `POST /auth/sign-out` — `EXISTS`  
#### `GET /auth/get-session` — `EXISTS`

---

### 4.3 Admin login

#### `POST /auth/admin/login` — `EXISTS` (web wired)

```json
{ "email": "admin@fripcash.test", "password": "Password123!" }
```

**200:**

```json
{
  "token": "<admin_session_token>",
  "user": {
    "id": "…",
    "email": "admin@fripcash.test",
    "name": "FripCash Admin",
    "userKind": "ADMIN",
    "authAudience": "ADMIN",
    "role": "admin"
  }
}
```

---

## 5. Me & seller upgrade

### 5.1 `GET /me` — `EXTEND` — audience: CONSUMER

```json
{
  "id": "usr_…",
  "phone": "+224…",
  "email": null,
  "displayName": "Aminata",
  "preferredLocale": "FR",
  "canBuy": true,
  "isAdmin": false,
  "seller": {
    "profileId": "sp_…",
    "kind": "particulier",
    "shopKind": null,
    "verificationStatus": "none",
    "listingDestination": "SECONDE_MAIN",
    "allowedDestinations": ["SECONDE_MAIN"],
    "capabilities": {
      "createListing": true,
      "excelImport": false,
      "productLibrary": false,
      "sellerDashboard": true
    }
  },
  "courier": null
}
```

#### Locked AuthZ for particulier

| Rule | Value |
|------|--------|
| Particulier needs admin KYC? | **No** |
| Seed `seller@fripcash.test` | Must not be stuck `pending` blocking create |
| If `capabilities.createListing === true` | `POST /listings` must succeed for allowed destinations |
| `pending` blocks | Only shop kinds that require approval (proximité / enseigne) |

If block is intentional: return `SELLER_VERIFICATION_PENDING`, **not** `FORBIDDEN_AUDIENCE`.

### 5.2 `PATCH /me` — `EXISTS`

```json
{ "name": "Nouveau nom", "preferredLocale": "FR" }
```

### 5.3 Seller paths (web uses particulier; shop APIs exist for completeness)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/me/seller/particulier` | `EXISTS` | Body `{ displayName?, bio? }` → seller kind particulier, verification `none`/`approved` |
| POST | `/me/seller/shop` | `EXISTS` | Web mostly CTA-to-app; still implement |
| GET | `/me/seller/verification` | `EXISTS` | |
| POST | `/me/seller/particulier/close` | `EXISTS` | |
| POST | `/me/seller/shop/close` | `EXISTS` | |
| POST | `/me/seller/downgrade-to-particulier` | `EXISTS` | |
| PATCH | `/me/seller/bundle-settings` | `EXISTS` | Mobile-primary |
| POST | `/me/seller/tools/vacation` | `EXISTS` | Mobile-primary |
| GET/POST | `/me/seller/tools/library` | `EXISTS` | Mobile-primary |
| POST | `/me/seller/tools/excel-import` | `EXISTS` | Mobile-primary |

### 5.4 KYC (web admin reviews; consumer submit mainly app)

| Method | Path | Status |
|--------|------|--------|
| GET/POST | `/me/kyc` | `EXISTS` |
| POST | `/me/kyc/documents` | `EXISTS` |
| GET/POST | `/organizations/:orgId/kyc` | `EXISTS` |
| POST | `/organizations/:orgId/kyc/documents` | `EXISTS` |

---

## 6. Catalog (categories & zones)

### 6.1 Categories

| Method | Path | Audience | Status |
|--------|------|----------|--------|
| GET | `/catalog/categories` | public + auth | `EXISTS` |
| POST | `/catalog/categories` | ADMIN | `EXISTS` |
| PATCH | `/catalog/categories/:id` | ADMIN | `EXISTS` |
| DELETE | `/catalog/categories/:id` | ADMIN | `EXISTS` |

**Category fields:**

```json
{
  "id": "…",
  "parentId": null,
  "nameFr": "Mode",
  "nameEn": "Fashion",
  "slug": "mode",
  "destination": "SECONDE_MAIN",
  "sortOrder": 0,
  "isActive": true,
  "imageUrl": "https://…",
  "imagePublicId": "fripcash/categories/…"
}
```

`destination`: `SECONDE_MAIN | ARTICLES_NEUFS | QUARTIER_BOUTIQUES | ENSEIGNES`

### 6.2 Zones

| Method | Path | Audience | Status |
|--------|------|----------|--------|
| GET | `/catalog/zones` | public + auth | `EXISTS` |
| POST/PATCH/DELETE | `/catalog/zones` / `:id` | ADMIN | `EXISTS` |

### 6.3 Best sellers

| GET | `/catalog/best-sellers` | `EXISTS` (optional rail) |

---

## 7. Listings (public + seller + media)

### 7.1 Public list

#### `GET /listings` — `EXTEND` — public / CONSUMER

Query: `destination?`, `categoryId?`, `q?`, `page?`, `pageSize?`  
**Only `ACTIVE`** by default.

**Each item must include:**

- Full pricing fields (§8)  
- `media[]` — **all images**, sorted by `sortOrder` (today list often returns **cover only** → web hydrates via detail; prefer full media on list OR document `mediaCount` + cover)  
- `sellerProfile` with at least `{ id, userId, sellerKind, displayName?, verificationStatus }`

### 7.2 Detail

#### `GET /listings/:id` — `EXTEND`

Must return **full** `media[]` (confirmed: detail has all images; list truncated).

### 7.3 Seller create / update / delete

#### `POST /listings` — `FIX` / `EXTEND` — CONSUMER + seller caps

See §8 body. Owner-only after create.

#### `PATCH /listings/:id` — `EXTEND` — **owner only** (CONSUMER)

Admin must **not** use this (use `/admin/listings/:id`).

#### `DELETE /listings/:id` — `EXISTS` — owner

### 7.4 Media

| Method | Path | Status |
|--------|------|--------|
| POST | `/listings/:id/media` | `EXISTS` `{ publicId, url, mimeType?, sortOrder? }` |
| PATCH | `/listings/:id/media/:mediaId` | `EXISTS` |
| DELETE | `/listings/:id/media/:mediaId` | `EXISTS` |

---

## 8. Pricing, commission, discount (locked)

**Source of truth:** `docs/be-listing-create-pricing-fields.md`

### 8.1 Formula

```
displayPriceGnf = round(netPriceGnf * (1 + commissionRate))
commissionAmountGnf = displayPriceGnf - netPriceGnf
```

| Path | Default rate |
|------|--------------|
| Particulier / boutique standard / enseigne | **0.08** |
| Proximité | **0.05** |

Rates admin-configurable (§19.3). **Snapshot `commissionRate` on listing** at create/update so old ads don’t jump when rates change.

### 8.2 Write body (`POST/PATCH /listings`)

```json
{
  "title": "string",
  "description": "string?",
  "netPriceGnf": 45000,
  "quantity": 2,
  "destination": "SECONDE_MAIN",
  "categoryId": "…",
  "zoneId": "…?",
  "conditionNote": "Neuf avec étiquette",
  "negotiable": true,
  "discountEnabled": true,
  "compareAtPriceGnf": 60000,
  "status": "DRAFT|ACTIVE|…"
}
```

| Field | Rules |
|-------|--------|
| `netPriceGnf` | Required, int > 0 — **seller net** |
| `quantity` | Required, int ≥ 1 |
| `negotiable` | Default `false` |
| `discountEnabled` | Default `false` |
| `compareAtPriceGnf` | Required if discount on; must be **> displayPriceGnf**; else `null` |
| Taxes | **None** (OOS) |

### 8.3 Read shape (all listing GETs)

```json
{
  "id": "…",
  "netPriceGnf": 45000,
  "priceGnf": 48600,
  "commissionRate": 0.08,
  "commissionAmountGnf": 3600,
  "quantity": 2,
  "negotiable": true,
  "discountEnabled": true,
  "compareAtPriceGnf": 60000,
  "status": "ACTIVE",
  "destination": "SECONDE_MAIN",
  "conditionNote": "…",
  "media": [
    {
      "id": "…",
      "storageKey": "…",
      "url": "https://res.cloudinary.com/…",
      "mimeType": "image/jpeg",
      "sortOrder": 0
    }
  ],
  "sellerProfile": {
    "id": "…",
    "userId": "…",
    "sellerKind": "PARTICULIER",
    "displayName": "Test Seller",
    "verificationStatus": "APPROVED"
  },
  "category": { "id": "…", "nameFr": "…", "nameEn": "…" },
  "publishedAt": "…",
  "createdAt": "…"
}
```

**Buyer UI:** show `priceGnf`; if discount → strikethrough `compareAtPriceGnf`.  
**Cart/checkout:** charge `priceGnf` (display).  
**Escrow release to seller:** `netPriceGnf`.

---

## 9. Cart & checkout

### 9.1 Cart — `EXISTS`

| Method | Path |
|--------|------|
| GET | `/cart` |
| DELETE | `/cart` |
| POST | `/cart/items` `{ listingId, quantity }` |
| PATCH | `/cart/items/:itemId` `{ quantity }` |
| DELETE | `/cart/items/:itemId` |

**Cart line must expose:** listing id, title, image, unit **display** price, quantity, stock check, seller id.

### 9.2 Checkout — `FIX` / `EXTEND`

#### `POST /checkout` — CONSUMER

Today web calls with **empty body** after syncing cart. BE must accept (and web will send):

```json
{
  "fulfillmentMode": "courier | pickup | shopLocalDelivery",
  "deliveryMode": "main-propre | buyer-delivery | seller-delivery",
  "paymentMethod": "mobile_money | card | wallet",
  "mobileMoney": {
    "operator": "mtn | orange | moov | other",
    "phoneNumber": "+224…"
  },
  "card": { "/* tokenized by PSP — never raw PAN in Nest if possible */": true },
  "shippingAddress": {
    "fullName": "…",
    "phone": "…",
    "email": "…?",
    "line1": "…",
    "city": "…",
    "country": "GN"
  },
  "idempotencyKey": "…"
}
```

**Payment product rules (locked for web UI):**

| Method | Label | Behavior |
|--------|-------|----------|
| `mobile_money` | Mobile Money | Debit now via aggregator → **escrow hold** |
| `card` | Carte | Same |
| `wallet` | Solde FripCash | Debit wallet → escrow hold |

**Removed:** “Payer à la livraison” / COD. All methods debit immediately into escrow.

**200 response:**

```json
{
  "paymentIntent": {
    "id": "pi_…",
    "status": "requires_action | succeeded | processing",
    "clientSecret": "…?"
  },
  "orders": [
    {
      "id": "ord_…",
      "status": "PAID",
      "escrowStatus": "HELD",
      "amountGnf": 48600,
      "netAmountGnf": 45000,
      "commissionGnf": 3600
    }
  ]
}
```

**Validations:** stock, listing ACTIVE, seller not on vacation, destination allowed, wallet balance if wallet.

---

## 10. Orders, escrow, fulfillment

### 10.1 Escrow model (locked)

1. Payment success → funds **HELD** (not withdrawable by seller).  
2. Buyer confirms reception (**button**, not 6-digit release code) → **RELEASE** to seller net.  
3. Dispute → stay **HELD**.  
4. Seller voluntary refund / admin resolve → refund or release per outcome.

**Proximité pickup code (4 digits)** is a **separate** handoff secret for shop pickup — not the escrow release mechanism. Document separately if still in scope for web (optional).

### 10.2 Consumer order APIs

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/orders/purchases` | `EXTEND` | Full order DTO below |
| GET | `/orders/sales` | `EXTEND` | Seller sales |
| GET | `/orders/:id` | `EXTEND` | Parties can only see own |
| PATCH | `/orders/:id/status` | `FIX` | Allowed transitions per role (table) |
| GET | `/invoices/:id/receipt` | `EXISTS` | |

**Web currently uses local mock orders** because live payloads lack escrow/timeline/actions. These endpoints must become enough to turn mock off.

### 10.3 Order DTO (required)

```json
{
  "id": "ord_…",
  "orderNumber": "FC-2026-00042",
  "status": "PAID",
  "escrowStatus": "HELD",
  "fulfillmentMode": "courier",
  "deliveryMode": "buyer-delivery",
  "paymentMethod": "mobile_money",
  "amountGnf": 48600,
  "shippingCostGnf": 5000,
  "commissionGnf": 3600,
  "netAmountGnf": 45000,
  "currency": "GNF",
  "listing": {
    "id": "…",
    "title": "…",
    "media": [{ "url": "…", "sortOrder": 0 }]
  },
  "buyer": { "id": "…", "displayName": "Moussa" },
  "seller": { "id": "…", "profileId": "…", "displayName": "Test Seller" },
  "courier": {
    "userId": "…?",
    "displayName": "Amadou Diallo?",
    "phone": "…?"
  },
  "shippingAddress": { },
  "pickupCode": null,
  "timeline": [
    { "at": "2026-09-25T09:00:00Z", "code": "PAID", "label": "Paiement reçu — fonds en séquestre" }
  ],
  "disputeId": null,
  "createdAt": "…",
  "updatedAt": "…"
}
```

`escrowStatus`: `HELD | RELEASED | REFUNDED`  
Never show `RELEASED` while status is still early (`PAID`, `PREPARING`, `IN_TRANSIT`) without buyer confirm / admin release.

### 10.4 Status machine

```
ORDERED → PAID → SELLER_NOTIFIED → PREPARING
  → READY_FOR_PICKUP (pickup)
  → COURIER_ASSIGNED → COLLECTED → IN_TRANSIT
  → DELIVERED → FUNDS_RELEASED → FEEDBACK_PENDING
  ↘ DISPUTED → REFUNDED | FUNDS_RELEASED (admin/seller)
```

### 10.5 Who may transition (`PATCH /orders/:id/status`)

| From → To | Buyer | Seller | System/Admin |
|-----------|-------|--------|--------------|
| → PREPARING | | ✅ | ✅ |
| → READY_FOR_PICKUP | | ✅ (pickup) | ✅ |
| → COURIER_ASSIGNED | | ✅ request / or system after courier accept | ✅ |
| → IN_TRANSIT / COLLECTED | | limited | ✅ / courier |
| → DELIVERED + release | ✅ **confirm reception** | | ✅ |
| → DISPUTED | ✅ open dispute | ✅ | ✅ |
| → REFUNDED | | ✅ voluntary refund | ✅ |

#### Confirm reception (preferred dedicated route) — `MISSING`

```http
POST /orders/:id/confirm-reception
```

Audience: buyer of order.  
Effects: `DELIVERED` + escrow `RELEASED` + timeline event + notify seller.

#### Assign / open mission (web seller demo → real) — `MISSING`

Product target (SRS): open mission for zone couriers; courier accepts on **mobile**.

For web seller tooling minimum:

```http
POST /orders/:id/request-courier
```

Creates/open mission; notifies available couriers (push — mobile).  
Optional later: seller-preferred courier id.

---

## 11. Disputes & refunds

| Method | Path | Status | Audience |
|--------|------|--------|----------|
| POST | `/orders/:id/disputes` | `EXISTS` | Buyer or seller `{ reason }` |
| GET | `/disputes/:id` | `MISSING` | Parties |
| POST | `/disputes/:id/messages` | `MISSING` | Parties + admin |
| POST | `/disputes/:id/evidence` | `MISSING` | Camera-capture policy |
| POST | `/orders/:id/seller-refund` | `MISSING` | Seller `{ amount: "full" \| number }` while escrow HELD |
| GET | `/admin/disputes` | `MISSING` | Admin queue |
| POST | `/admin/disputes/:id/ask-party` | `MISSING` | Admin |
| POST | `/admin/disputes/:id/resolve` | `FIX` | Align outcome enum |

### Resolve body (canonical)

```json
{
  "outcome": "refund_buyer | partial_refund | release_seller",
  "amountGnf": null,
  "note": "…"
}
```

(Web client currently sends legacy `resolution: resolved_buyer|resolved_seller` — BE should accept canonical outcomes; FE will update.)

While disputed: `escrowStatus` stays `HELD`.

---

## 12. Reviews & comments

### 12.1 Reviews — order-scoped (locked)

| Method | Path | Status |
|--------|------|--------|
| GET | `/listings/:id/reviews` | `EXISTS` |
| GET | `/sellers/:sellerProfileId/reviews` | `EXISTS` |
| POST | `/orders/:orderId/reviews` | `EXISTS` |

**Rules:**

- Buyer may review only after order delivered / funds released (document exact gate).  
- Body: `{ "rating": 1-5, "comment": "…?", "listingId": "…" }`  
- No anonymous web “publish review” without `orderId` (current FE correctly requires order).  
- Admin: `POST /admin/reviews/:id/hide` — `EXISTS`

### 12.2 Comments (Q&A on listing)

| GET/POST | `/listings/:id/comments` | `EXISTS` |
| POST | `/admin/comments/:id/hide` | `EXISTS` |

---

## 13. Offers

| Method | Path | Status |
|--------|------|--------|
| GET | `/offers/mine` | `EXISTS` |
| GET | `/offers/listings/:listingId` | `EXISTS` (align naming with `/listings/:id/offers` if preferred — pick one, don’t break web) |
| POST | `/offers/listings/:listingId` | `EXISTS` `{ amountGnf, message? }` |
| PATCH | `/offers/:id/accept` | `EXISTS` |
| PATCH | `/offers/:id/refuse` | `EXISTS` |

If `listing.negotiable === false` → `LISTING_NOT_NEGOTIABLE`.

---

## 14. Messaging

| Method | Path | Status |
|--------|------|--------|
| GET | `/conversations` | `EXISTS` |
| POST | `/conversations` | `EXISTS` `{ listingId?, orderId?, participantIds? }` |
| GET | `/conversations/:id/messages` | `EXISTS` |
| POST | `/conversations/:id/messages` | `EXISTS` `{ body }` |

Include listing title/image preview on conversation list items.

Realtime: Pusher auth §21.

---

## 15. Favorites

| GET | `/favorites` | `EXISTS` |
| POST | `/favorites/:listingId` | `EXISTS` |
| DELETE | `/favorites/:listingId` | `EXISTS` |

Return listing summary with **display** price + cover image.

---

## 16. Wallet

| Method | Path | Status |
|--------|------|--------|
| GET | `/wallet/balance` | `EXTEND` |
| GET | `/wallet/ledger` | `EXTEND` |
| POST | `/wallet/withdraw` | `EXISTS` `{ amountGnf }` |

**Balance shape:**

```json
{
  "balanceGnf": 100000,
  "availableBalanceGnf": 80000,
  "reservedBalanceGnf": 20000,
  "currency": "GNF"
}
```

Ledger entries: `saleCredit | withdrawal | escrowHold | escrowRelease | refund | deliveryFee | …` with amounts and labels.

Withdraw: Orange Money to verified phone (document KYC gates).

---

## 17. Notifications

| Method | Path | Status |
|--------|------|--------|
| GET | `/notifications` | `EXISTS` |
| PATCH | `/notifications/:id/read` | `EXISTS` |
| POST | `/notifications/devices` | `EXISTS` `{ token, platform, audience }` |
| GET | `/notifications/preferences` | `EXISTS` |
| PUT | `/notifications/preferences` | `EXISTS` |

Notify on: order paid, status change, offer, message, dispute, escrow release (buyer + seller + courier as relevant).

---

## 18. Media / Cloudinary

| Method | Path | Status |
|--------|------|--------|
| POST | `/media/cloudinary-sign` | `EXISTS` `{ folder: "listings" \| "categories" }` |
| POST | `/media/presign` | `EXISTS` (legacy MinIO; prefer Cloudinary for catalogue) |

After client upload → `POST /listings/:id/media` with `publicId` + `url`.

---

## 19. Admin console

Audience: **ADMIN** only.

### 19.1 Session

| GET | `/admin/me` | `EXISTS` |

### 19.2 Users (Better Auth admin plugin) — `EXISTS`

Web uses:

- `GET /auth/admin/list-users`  
- `GET /auth/admin/get-user?id=`  
- create/update/set-role/password/ban/unban/remove  
- sessions list/revoke  
- impersonate / stop  
- has-permission  

Keep stable.

Also: `POST /admin/users/:userId/provision-audience` — `EXISTS`.

### 19.3 Platform settings — `FIX`

| Method | Path | Status |
|--------|------|--------|
| GET | `/admin/platform-settings` | `EXISTS` (often empty — seed `id=default`) |
| PATCH | `/admin/platform-settings` | `MISSING` |

```json
{
  "commissionRateStandard": 0.08,
  "commissionRateProximite": 0.05
}
```

### 19.4 Listings moderation

| GET | `/admin/listings?status=ALL\|DRAFT\|ACTIVE\|…` | `EXISTS` |
| PATCH | `/admin/listings/:id` | `EXISTS` (web wired) `{ status, … }` |

Return **full media** + seller displayName on admin list/detail.

### 19.5 Validations (shops / KYC)

| GET/POST | `/admin/seller-verifications` (+ approve/reject) | `EXISTS` |
| GET | `/admin/kyc/organizations` / `individuals` | `EXISTS` |
| POST | approve / reject / request-resubmission | `EXISTS` |

Seed must enqueue pending rows when testing admin UI.

### 19.6 Catalog admin

Categories + zones CRUD — `EXISTS` (§6).

### 19.7 Orders admin — `MISSING`

```http
GET /admin/orders?status=&q=&page=
GET /admin/orders/:id
```

### 19.8 Disputes admin — `MISSING` list + ask-party; resolve `FIX` (§11)

### 19.9 Moderation hide

| POST | `/admin/reviews/:id/hide` | `EXISTS` |
| POST | `/admin/comments/:id/hide` | `EXISTS` |

### 19.10 Audit & dashboard metrics — `EXTEND` / `MISSING`

| GET | `/admin/audit-logs` | `EXISTS` |
| GET | `/admin/metrics/overview?from=&to=` | `MISSING` |

Suggested overview:

```json
{
  "gmvGnf": 0,
  "ordersCount": 0,
  "escrowHeldGnf": 0,
  "openDisputes": 0,
  "activeListings": 0,
  "usersCount": 0
}
```

### 19.11 Empty admin shells (need APIs)

| Admin page | Needed API |
|------------|------------|
| `/admin/livreurs` | `GET /admin/couriers` |
| `/admin/porte-monnaies` | `GET /admin/wallets` |
| `/admin/signalements` | §20 |
| `/admin/tarifs-livraison` | `GET/PUT /admin/shipping-rates` |
| `/admin/partenaires` | Partner/enseigne admin |
| `/admin/sessions` | Staff session audit (optional) |
| `/admin/rapports` | Time-series metrics |

---

## 20. Reports / signalements

| Method | Path | Status |
|--------|------|--------|
| POST | `/reports` | `MISSING` | Consumer `{ targetType, targetId, reason }` |
| GET | `/admin/reports` | `MISSING` |
| PATCH | `/admin/reports/:id` | `MISSING` | `{ status: open\|resolved\|dismissed, note? }` |

Does **not** move escrow by itself.

---

## 21. Health & realtime

| GET | `/health` | `EXISTS` |
| GET | `/health/ready` | `EXISTS` |
| POST | `/pusher/auth` | `EXISTS` `{ socket_id, channel_name }` |

---

## 22. Seed & acceptance matrix

### 22.1 Seed accounts (document passwords in private ops only)

| Email | Kind | Must |
|-------|------|------|
| `buyer@fripcash.test` | CONSUMER | Login `/connexion`, buy |
| `seller@fripcash.test` | CONSUMER + particulier | **Not** pending-blocked; can `POST /listings` |
| `admin@fripcash.test` | ADMIN | `/admin-login` only |
| `courier@fripcash.test` | COURIER | Rejected on `/connexion`; app courier login |

### 22.2 Web acceptance checklist

- [ ] Buyer/seller login works; admin/courier rejected on `/connexion` with clear codes  
- [ ] Admin login only via `/auth/admin/login`  
- [ ] Particulier can create listing; pricing returns net + display + rate  
- [ ] Quantity, negotiable, discount fields round-trip  
- [ ] Admin PATCH platform commission rates  
- [ ] Admin PATCH listing status via `/admin/listings/:id`  
- [ ] Listing list/detail media complete; seller displayName present  
- [ ] Checkout accepts paymentMethod + fulfillment; creates PAID + escrow HELD  
- [ ] Purchases/sales DTOs power dashboard without mock  
- [ ] Buyer confirm-reception releases escrow  
- [ ] Buyer/seller dispute; seller refund; admin resolve outcomes  
- [ ] Offers blocked when not negotiable  
- [ ] Reviews require completed order  
- [ ] Admin orders + disputes lists non-empty when seeded  

---

## 23. Priority backlog for BE

### P0 — unblock web production paths

1. Particulier listing AuthZ + seed (`FORBIDDEN_AUDIENCE` fix)  
2. Listing pricing contract (`netPriceGnf`, display, negotiable, discount)  
3. `PATCH /admin/platform-settings`  
4. Consumer order DTO + escrow + confirm-reception (retire web mock)  
5. Checkout body (payment + fulfillment)  
6. Admin `GET /admin/orders`, `GET /admin/disputes`  

### P1 — completeness

7. Seller refund + dispute evidence/messages  
8. Reports API  
9. Shipping rates matrix  
10. Admin metrics overview  
11. Full media + seller name on list endpoints  

### P2 — polish

12. Admin couriers / wallets lists  
13. Partners admin  
14. Idempotency keys everywhere money moves  

---

## 24. Explicitly deferred to mobile pack

Do **not** block web on these (separate BE doc later):

- `POST /auth/courier/login` + full `/courier/missions/**` UX  
- Rich shop onboarding / KYC document capture UX  
- Excel import parse pipeline details  
- Product library advanced flows  
- Bundle discount rules depth  
- Beams push device specifics beyond `/notifications/devices`  

Web will keep CTA-to-app for those.

---

## Appendix A — Endpoint index (quick)

```
Auth:     send-otp, verify, sign-in/email, sign-up/email, admin/login, sign-out,
          get-session, verify-email, send-verification-email, request/reset-password
Me:       GET/PATCH /me, /me/seller/*, /me/kyc*
Catalog:  /catalog/categories, /catalog/zones, /catalog/best-sellers
Listings: CRUD /listings, /listings/:id/media*, comments, reviews
Cart:     /cart*, POST /checkout
Orders:   /orders/purchases|sales|:id, status, confirm-reception, request-courier,
          disputes, seller-refund, invoices/:id/receipt
Offers:   /offers/*
Chat:     /conversations*
Favorites:/favorites*
Wallet:   /wallet/*
Notifs:   /notifications*
Media:    /media/cloudinary-sign, /media/presign
Admin:    /admin/me, platform-settings, listings, seller-verifications, kyc*,
          disputes*, orders*, reports*, metrics, audit-logs, users provision,
          reviews/comments hide, shipping-rates, couriers, wallets
AuthAdmin:/auth/admin/* (Better Auth plugin)
Health:   /health, /health/ready
Pusher:   /pusher/auth
```

---

## Appendix B — Document control

| Version | Date | Author |
|---------|------|--------|
| 1.0 | 2026-09-26 | Web lead — initial complete web contract |

**Change policy:** BE may rename DTOs if semantics stay; breaking path changes require web + this doc update in the same release.
