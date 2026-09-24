# Seed DB vs Admin / Catalogue UI

Reference for reconciling Prisma seed counts (BE terminal) with what the Next admin and public catalogue show. **Not a bug in the FE card math** for categories; **listings undercount is an API filter**.

Last checked against remote API `GET /api/v1/*` with admin token (same host as `NEXT_PUBLIC_API_URL`).

---

## Seed snapshot (from BE `prisma seed`)

| Entity | Seed log | Notes |
|--------|----------|--------|
| Zones | **5** | Matches `GET /catalog/zones` → 5 |
| Categories | **11** | See breakdown below |
| Listings | **51** | Mixed statuses in DB |
| Known users | 4 | admin / buyer / seller / courier |
| Consumers | 13 | |
| Sellers (profiles) | 10 | |
| Couriers | 4 | |
| Favorites | 29 | |
| Comments / reviews | 0 / 0 | |
| Offers | 15 | |
| Orders | 20 | |
| Disputes | 7 | No `GET /admin/disputes` yet → UI empty |
| Carts | 13 | items often 0 |

Test passwords: `Password123!` (`admin@` / `buyer@` / `seller@` / `courier@fripcash.test`).

---

## Categories: 11 in DB = 4 parents + 7 children

Seed builds a **tree**, not 11 top-level rows.

| Type | Count | Names (FR) |
|------|-------|------------|
| **Root categories** (`parentId = null`) | **4** | Mode, Électronique, Maison, Enseignes |
| **Sub-categories** (`parentId` set) | **7** | Hommes, Femmes, Enfants · Téléphones, Accessoires · Décoration, Cuisine |
| **Total rows** | **11** | What the seed log prints |

How the UI presents this:

| Surface | What you see | Why |
|---------|----------------|-----|
| Admin → **Catégories** | 4 expandable parents, children nested | Correct tree UI over the same 11 rows |
| `GET /catalog/categories` | Flat array of **11** | Parents + children; FE groups by `parentId` |
| Admin dashboard pie (“par catégorie”) | Slices by **listing.categoryId** | Seed attaches listings to **leaf** categories → pie labels the 7 subs (not the 4 roots) |

**Clean mental model:** seed `categories: 11` ⇒ **4 cats + 7 sub-cats**. If someone says “we only have 4 categories,” they mean **roots**; the other 7 are children.

---

## Listings: 51 in DB ≠ 33 on admin dashboard

### Root cause (API, not FE)

```ts
// FripCash-API listings.service.ts — list()
where: { status: ListingStatus.ACTIVE, ... }
```

`GET /api/v1/listings` is the **public catalogue**: **ACTIVE only**.

Seed statuses (weighted): mostly `ACTIVE`, some `DRAFT`, some `SOLD`.

| Source | Count | Meaning |
|--------|-------|---------|
| Prisma seed | **51** | All listing rows in DB |
| `GET /listings` (admin token or anon) | **33** | `status === ACTIVE` only |
| Difference | **~18** | DRAFT + SOLD (+ any other non-ACTIVE) **hidden from this endpoint** |

Admin dashboard / Articles currently call the **same** `fetchListings()` → they correctly mirror the public API → **33**, not 51.

Query params like `?status=DRAFT` are **ignored** by Nest today (still returns ACTIVE-only).

### What FE needs from BE (ops)

For admin “all listings” / pending moderation:

- `GET /admin/listings` (or `GET /listings` with admin audience) supporting `status=DRAFT|ACTIVE|SOLD|…|ALL`
- Until then, admin KPIs should be labeled **“Annonces actives (catalogue)”**, not “all listings in DB”

---

## Other gaps vs seed (same class of issue)

| Seed | API / UI today | Why |
|------|----------------|-----|
| Orders **20** | Admin commandes **empty** | No `GET /admin/orders`; consumer only has purchases/sales for **that** user |
| Disputes **7** | Admin litiges **empty** | Resolve exists; **no list** endpoint |
| Users 13+ sellers… | Admin utilisateurs **empty** | No `GET /admin/users` |
| Seller verifications / KYC queues | Often **[]** | Seed may not enqueue pending verification/KYC the way the admin queues expect |
| Platform settings | Empty body / `—` commission | No `platform_settings` row (`id=default`) on this DB |

---

## Issues noticed so far (tracked)

1. **Listings 51 vs 33** — **Fixed on FE**: admin uses `GET /admin/listings?status=ALL` (all statuses). Public catalogue stays ACTIVE-only (`GET /listings` → ~33).
2. **Categories “4 vs 11”** — Not a data loss: **4 roots + 7 subs = 11**. Admin tree is correct; seed log is row count.
3. **Users / orders / disputes empty in admin** — Users: **wired** to Better Auth `GET /auth/admin/list-users` (not Nest `/admin/users`). Orders/disputes list routes still 404; resolve-only for disputes.

---

## Quick verify commands

```bash
BASE=http://HOST:3010/api/v1
# after admin sign-in → TOKEN

curl -s -H "Authorization: Bearer $TOKEN" "$BASE/listings" | jq 'length'
# → ACTIVE only

curl -s -H "Authorization: Bearer $TOKEN" "$BASE/catalog/categories" | jq '
  (map(select(.parentId==null)) | length) as $roots |
  (map(select(.parentId!=null)) | length) as $subs |
  {total: length, roots: $roots, subs: $subs}'
# → { total: 11, roots: 4, subs: 7 }
```

---

## FE follow-ups (optional)

- [x] Label admin dashboard articles KPI as **actives (catalogue public)** until admin list exists  
- [ ] Category pie: prefer leaf names + footnote “sous-catégories”  
- [ ] Ask BE for admin listings / orders / disputes / users list routes matching seed ops needs  
- [x] Catalogue images: one-shot `npm run seed:catalogue-images` uploads `scripts/catalogue-seed-assets/` → Cloudinary → category `imageUrl`/`imagePublicId`; FE reads `GET /catalog/categories` only (no local cat image fallbacks)
