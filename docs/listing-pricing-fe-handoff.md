# FE handoff — Listing pricing, quantity, negotiable, discount, admin commissions

**From:** Backend (Nest API)  
**To:** Web / mobile FE  
**Date:** 2026-09-26  
**Status:** Shipped on API — ready for FE  
**Related guides:** [05-listings.md](./05-listings.md) · [11-offers-messaging.md](./11-offers-messaging.md) · [15-admin.md](./15-admin.md)

---

## What changed (one paragraph)

Listings are now **net + commission on top**. Sellers enter what they **receive** (`netPriceGnf`). Buyers always see / pay `priceGnf` (= display). Commission rate is **admin-configurable** and **snapshotted** on the listing at create / price update. Also shipped: required `quantity`, `negotiable` (gates offers), and discount / compare-at for strikethrough UI. **No tax fields.**

---

## Pricing formula (authoritative — server wins)

```
displayPriceGnf      = round(netPriceGnf * (1 + commissionRate))
commissionAmountGnf  = displayPriceGnf - netPriceGnf
```

| Seller path | Default rate | Example net **45 000** |
|-------------|--------------|-------------------------|
| Particulier / boutique standard / enseigne | **0.08** (8%) | Fee **3 600** → buyers see **48 600** |
| Proximité | **0.05** (5%) | Fee **2 250** → buyers see **47 250** |

- Seller **keeps the net**; commission is **added for the buyer**, not deducted.  
- Catalogue, cart, checkout charge **`priceGnf`**.  
- Clients may preview with the formula above; **always trust the API response** after create/update/read.  
- Admin rate changes apply to **new / price-edited** listings only (snapshot).

**`priceGnf` on all public responses = buyer display price** (name unchanged for backward compat). Always also use `netPriceGnf`, `commissionRate`, `commissionAmountGnf`.

---

## Create / update listing

```http
POST  /api/v1/listings
PATCH /api/v1/listings/:id
```

### Request body

```json
{
  "title": "Baskets Numeris",
  "description": "…",
  "netPriceGnf": 45000,
  "quantity": 2,
  "categoryId": "…",
  "destination": "SECONDE_MAIN",
  "conditionNote": "Neuf avec étiquette",
  "negotiable": true,
  "discountEnabled": true,
  "compareAtPriceGnf": 60000
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `netPriceGnf` | **Yes** on create | What seller receives. Integer GNF ≥ 1. |
| `priceGnf` (write) | Legacy only | If sent **without** `netPriceGnf`, treated as **net**. Prefer `netPriceGnf`. |
| `quantity` | **Yes** on create | Integer ≥ 1. Enforced on cart + checkout. |
| `negotiable` | No (default `false`) | Offers only when `true`. |
| `discountEnabled` | No (default `false`) | When `true`, `compareAtPriceGnf` is required. |
| `compareAtPriceGnf` | If discount on | Buyer-facing “ancien prix”. Must be **>** computed `priceGnf`. When discount off → stored as `null`. |

### Response shape (create / update / GET list / PDP / admin)

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
  "destination": "SECONDE_MAIN"
}
```

---

## UI contracts

### Seller create / edit (web + app)

1. Input: **net only** — label like “Votre prix — ce que vous recevez”.  
2. Live preview (client-side OK):  
   `Prix que les acheteurs verront: **{display} GNF** (dont commission {rate × 100} %)`.  
3. Required **quantity** (≥ 1).  
4. Toggle **accepter les offres** → `negotiable`.  
5. Toggle **Appliquer une remise** → when on, input **ancien prix** (`compareAtPriceGnf`).  
6. After submit, re-bind from API (`priceGnf`, `commissionRate`, etc.) — server is source of truth.

**Preview rate source for FE:**

- Prefer rates from `GET /api/v1/admin/platform-settings` for admin UI.  
- For seller create preview: use **0.08** for particulier / standard / enseigne and **0.05** for proximité until you have a dedicated seller “my commission rate” endpoint (not in this ticket). After save, show the snapshotted values from the listing response.

### Buyer product page (PDP)

- Always show **`priceGnf`** (current / “new” price).  
- If `discountEnabled && compareAtPriceGnf` → show **`compareAtPriceGnf`** with **strikethrough** next to / above current price.  
- **Do not** show tax lines.  
- **Faire une offre:** show only when `negotiable === true` (and not `ENSEIGNES`).

---

## Offers

```http
POST /api/v1/offers/listings/:listingId
```

| Condition | API |
|-----------|-----|
| `negotiable === false` | **422** `LISTING_NOT_NEGOTIABLE` |
| `destination === ENSEIGNES` | **403** `LISTING_NOT_ALLOWED` (unchanged) |

Hide the CTA from the listing flag; don’t rely only on error handling.

---

## Admin — commission rates

```http
GET   /api/v1/admin/platform-settings
PATCH /api/v1/admin/platform-settings
```

Rates are **decimals `0..1`** (not percent integers, not BPS).

```json
{
  "id": "default",
  "commissionRateStandard": 0.08,
  "commissionRateProximite": 0.05,
  "disputeWindowHours": 72,
  "minWithdrawalGnf": 10000,
  "maxListingPhotos": 10,
  "maintenanceMode": false,
  "updatedAt": "…"
}
```

**PATCH** (partial OK; at least one rate field):

```json
{
  "commissionRateStandard": 0.08,
  "commissionRateProximite": 0.05
}
```

Admin-only audience. Wire the settings screen that was empty / read-only before.

---

## Breaking / migration notes for FE

| Before | After |
|--------|--------|
| Write `priceGnf` as “the” price | Prefer write **`netPriceGnf`**; response `priceGnf` is **buyer** price |
| Offers gated mainly by `ENSEIGNES` | Also gate on **`negotiable`** |
| Quantity often optional / default 1 | **Required** on create (≥ 1) |
| No discount fields | `discountEnabled` + `compareAtPriceGnf` |
| Admin settings empty / no PATCH | Real rates + **PATCH** |

Types to update (example):

```ts
type Listing = {
  // …
  netPriceGnf: number;
  priceGnf: number;              // buyer display
  commissionRate: number;        // 0..1, snapshotted
  commissionAmountGnf: number;
  quantity: number;
  negotiable: boolean;
  discountEnabled: boolean;
  compareAtPriceGnf: number | null;
  // …
};
```

Preview helper (mirror BE):

```ts
function previewBuyerPrice(netPriceGnf: number, commissionRate: number) {
  return Math.round(netPriceGnf * (1 + commissionRate));
}
```

---

## FE checklist

### Seller create / edit
- [ ] Net price input + helper copy  
- [ ] Live buyer-price preview (formula above)  
- [ ] Quantity required ≥ 1  
- [ ] Negotiable toggle  
- [ ] Discount toggle + compare-at input when on  
- [ ] POST/PATCH send `netPriceGnf` (not legacy-only `priceGnf`)  
- [ ] After save, display server `priceGnf` / rate / amount  

### PDP / catalogue
- [ ] Show `priceGnf` as current price  
- [ ] Strikethrough `compareAtPriceGnf` when discount on  
- [ ] Hide “Faire une offre” unless `negotiable === true`  
- [ ] No tax UI  

### Admin
- [ ] Load `GET /admin/platform-settings`  
- [ ] Edit + `PATCH` standard / proximité rates (decimals 0..1)  
- [ ] Copy that changes apply to new/edited listings only  

### Client API layer
- [ ] Update listing types / Zod schemas  
- [ ] Handle `LISTING_NOT_NEGOTIABLE` on offer create  
- [ ] Cart quantity errors if over stock (`VALIDATION_ERROR`)  

---

## Out of scope (this pass)

- Tax / TVA fields  
- Minimum commission amount  
- Orange Money fee split  
- Seller endpoint dedicated to “my current rate” (use defaults for preview; trust listing after save)

---

## Quick Axios examples

```ts
// Create
await api.post('/api/v1/listings', {
  title: 'Baskets Numeris',
  netPriceGnf: 45_000,
  quantity: 2,
  destination: 'SECONDE_MAIN',
  categoryId,
  negotiable: true,
  discountEnabled: true,
  compareAtPriceGnf: 60_000,
});

// Admin rates
const { data: settings } = await api.get('/api/v1/admin/platform-settings');
await api.patch('/api/v1/admin/platform-settings', {
  commissionRateStandard: 0.08,
  commissionRateProximite: 0.05,
});
```

Questions / gaps → Backend. Product decisions for this ticket are locked.
