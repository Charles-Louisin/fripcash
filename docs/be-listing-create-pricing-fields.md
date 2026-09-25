# BE request: listing create — pricing, quantity, negotiable, discount, admin commissions

**From:** Web lead (FripCash) — **decisions locked**  
**To:** Backend / Nest API  
**Date:** 2026-09-25  
**Status:** Ready to implement (no open product questions)  
**Related:** mobile `~/frip_cash`, `docs/srs/05-listings.md`, `docs/srs/09-wallet-escrow-commissions.md`

---

## Lead decisions (locked)

| # | Topic | Decision |
|---|--------|----------|
| 1 | Commission model | **Net + rate on top.** Seller enters what they receive; buyers see net × (1 + rate). UI must explain what customers will see. |
| 2 | Seller form input | **Net only** (“Votre prix — ce que vous recevez”) + live preview of buyer price. |
| 3 | Quantity | Required on create/edit, integer **≥ 1**. |
| 4 | Negotiable | **Ship on API + web.** Field `negotiable: boolean`. Offers only when `true`. |
| 5 | Discount | **Ship.** Toggle “Appliquer une remise”; when on, extra price input. Product page: **new price** + **old price strikethrough**. |
| 6 | Taxes | **Out of scope** — do not add tax fields. |
| 7 | Commission rates | **Admin-configurable** via admin platform-settings API (not hardcoded forever in clients). |

---

## 1. Pricing model (authoritative)

```
displayPriceGnf = round(netPriceGnf * (1 + commissionRate))
commissionAmountGnf = displayPriceGnf - netPriceGnf
```

| Seller path | Default rate (seed / until admin changes) | Example net **45 000** |
|-------------|-------------------------------------------|-------------------------|
| Particulier / boutique standard / enseigne | **8%** (`0.08`) | Fee **3 600** → buyers see **48 600** |
| Proximité | **5%** (`0.05`) | Fee **2 250** → buyers see **47 250** |

Rules:

- Seller **keeps the net**; commission is **added for the buyer**, not deducted from seller.  
- Catalogue, cart, checkout charge **`displayPriceGnf`**.  
- Escrow / seller release use **`netPriceGnf`**.  
- Clients may preview; **server wins** on create/update/read.

**`priceGnf` on public responses = buyer display price** (backward compatible name). Always also return `netPriceGnf` (and rate/amount when useful).

---

## 2. Listing create / update body

```http
POST /api/v1/listings
PATCH /api/v1/listings/:id
```

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
| `netPriceGnf` | Yes | What seller receives. Integer GNF &gt; 0. |
| `quantity` | Yes | Integer ≥ 1. Enforce at checkout. |
| `negotiable` | Yes (default `false`) | If `false` → reject `POST /listings/:id/offers` with clear code. |
| `discountEnabled` | No (default `false`) | When `true`, `compareAtPriceGnf` is required. |
| `compareAtPriceGnf` | If discount on | **Buyer-facing “ancien prix”** (strikethrough). Must be **&gt; `displayPriceGnf`**. When discount off → `null`. |

If you prefer a single legacy `priceGnf` on write, treat write `priceGnf` as **net** and document that rename path — prefer explicit `netPriceGnf` to avoid ambiguity.

---

## 3. Listing read shape (public + mine + admin)

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

**Buyer product page UI contract:**

- Always show **`priceGnf`** (current / “new” price).  
- If `discountEnabled && compareAtPriceGnf` → show **`compareAtPriceGnf`** with **strikethrough** next to / above current price.  
- Do not show tax lines.

**Seller create UI contract (web + app):**

- Input: net + helper text.  
- Read-only preview: “Prix que les acheteurs verront: **48 600 GNF** (dont commission X %)”.  
- Toggle négociable.  
- Toggle remise → when on, input for ancien prix (`compareAtPriceGnf`).

---

## 4. Negotiable rules

- Default: `false`.  
- `negotiable === false` → `POST /listings/:id/offers` returns **403/422** (e.g. `LISTING_NOT_NEGOTIABLE`).  
- `negotiable === true` → existing offers flow unchanged.  
- Return flag on every listing GET so FE can hide “Faire une offre”.

---

## 5. Discount rules

| State | Seller inputs | Stored | Buyer sees |
|-------|---------------|--------|------------|
| Remise **off** | `netPriceGnf` only | `compareAtPriceGnf = null`, `discountEnabled = false` | Current `priceGnf` only |
| Remise **on** | `netPriceGnf` (sale net) + `compareAtPriceGnf` (old buyer price) | both set, `discountEnabled = true` | **New** `priceGnf` + **old** `compareAtPriceGnf` strikethrough |

Validation:

- `compareAtPriceGnf > displayPriceGnf` (display computed from net + rate).  
- Reject if discount on and compare-at missing / ≤ display.

---

## 6. Taxes

**Do not implement.** No TVA / tax fields on listings or checkout for this pass.

---

## 7. Admin: configure commission rates

Today: `GET /admin/platform-settings` exists on web but returns empty / no usable commission row (see `docs/seed-vs-admin-ui.md`).

### Required

```http
GET  /api/v1/admin/platform-settings
PATCH /api/v1/admin/platform-settings
```

**Example GET/PATCH body:**

```json
{
  "commissionRateStandard": 0.08,
  "commissionRateProximite": 0.05
}
```

Rules:

- Admin audience only.  
- Rates as decimals `0..1` (or document % integers — pick one and stick to it).  
- Seed defaults: `0.08` / `0.05`.  
- Listing create/price preview **reads current settings** (or snapshot rate onto listing at publish — **prefer snapshot on listing** so old ads don’t silently change when admin edits rates; document which).  
  - **Lead preference for BE:** snapshot `commissionRate` on the listing at create/update so historical prices stay stable; admin change applies to **new/edited** listings.

Optional later: minimum commission amount, Orange Money fee split — not required for this ticket if totals still equal `commissionRate*`.

---

## Acceptance criteria

- [ ] `POST/PATCH /listings` accept `netPriceGnf`, `quantity`, `negotiable`, `discountEnabled`, `compareAtPriceGnf`  
- [ ] Responses expose `netPriceGnf`, `priceGnf` (display), `commissionRate`, `commissionAmountGnf`, discount fields  
- [ ] Buyer price = `round(net * (1 + rate))` with rate from settings (snapshotted on listing)  
- [ ] Offers blocked when `negotiable === false`  
- [ ] Discount validation: compare-at &gt; display when enabled  
- [ ] No tax fields  
- [ ] `GET` + `PATCH /admin/platform-settings` for standard + proximité rates  
- [ ] Seed defaults 8% / 5%  
- [ ] Web can build: net + preview copy, quantity, negotiable toggle, discount toggle + compare-at, admin commission editor

---

## FE follow-up (after BE)

Web will implement:

- Quantité  
- Prix net + explanatory preview (“tes clients verront …”)  
- Toggle accepter les offres  
- Toggle remise + ancien prix  
- Product page strikethrough when discount on  
- Admin UI to edit commission rates via platform-settings  

---

## References

| Source | Path |
|--------|------|
| Mobile commission math | `~/frip_cash/lib/utils/commission_calculator.dart` |
| Mobile create wizard | `~/frip_cash/lib/screens/create_listing_screen.dart` |
| Web create (current gap) | `app/(dashboard)/dashboard/articles/page.tsx` |
| Admin settings hook | `lib/api/admin.ts` → `fetchPlatformSettings` |
