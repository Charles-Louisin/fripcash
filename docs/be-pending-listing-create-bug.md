# BE bug: `POST /listings` blocked for particulier sellers stuck in `verificationStatus: pending`

**From:** Web frontend (FripCash Next.js)  
**To:** Backend / Nest API  
**Date:** 2026-09-24  
**Severity:** Blocks sellers from publishing new products on web  
**Environment:** `API_UPSTREAM` / seed DB (`seller@fripcash.test`)

---

## Summary

When a **vendeur particulier** tries to create a listing from the dashboard (`POST /listings`), the API returns **403 `FORBIDDEN_AUDIENCE`** because `GET /me` reports:

```json
"seller": {
  "kind": "particulier",
  "verificationStatus": "pending",
  "capabilities": {
    "createListing": true,
    ...
  }
}
```

So the FE shows *“profil en attente de validation”* and cannot publish — even though:

1. `capabilities.createListing === true`
2. Product rules say **particulier does not need admin approval** to sell seconde main
3. The error code `FORBIDDEN_AUDIENCE` is misleading (this is not an admin/consumer audience mismatch)

**Ask:** Please fix seed + listing AuthZ so particuliers can publish while only shop paths that truly need KYC stay blocked on `pending`.

---

## How to reproduce

1. Sign in as seed seller:

   - Email: `seller@fripcash.test`
   - Password: `Password123!`
   - Audience: **consumer** (marketplace token)

2. Call `GET /api/v1/me` → note:

   - `seller.kind = "particulier"`
   - `seller.verificationStatus = "pending"`
   - `seller.capabilities.createListing = true`
   - `seller.allowedDestinations = ["SECONDE_MAIN"]`

3. Call `POST /api/v1/listings` with a valid body, e.g.:

```http
POST /api/v1/listings
Authorization: Bearer <consumer token>
Content-Type: application/json

{
  "title": "Test article",
  "description": "Test",
  "priceGnf": 1000,
  "quantity": 1,
  "categoryId": "<any leaf category id>",
  "destination": "SECONDE_MAIN",
  "conditionNote": "Bon état"
}
```

4. **Actual response:**

```json
{
  "statusCode": 403,
  "code": "FORBIDDEN_AUDIENCE",
  "message": "Vous n'avez pas accès à cette zone de l'application."
}
```

5. **Expected (per SRS / roles docs):**

   - For `seller.kind = particulier` → **201** listing created (ACTIVE or DRAFT as designed)
   - `verificationStatus` for particulier should be `none` or `approved` (not stuck on `pending`), **or**
   - Listing create must **not** be gated on `pending` for particuliers

---

## Expected product rules (already documented)

From `docs/backend/roles-and-capabilities.md` / `docs/backend/account-upgrade.md`:

| Seller path | Manual validation | Can publish while pending? |
|-------------|-------------------|----------------------------|
| **Particulier** (seconde main) | **No** (light profile OK) | **Yes** |
| Boutique standard | Optional | Usually yes |
| Proximité / enseigne | **Yes** (admin) | **No** until `approved` |

Pending should block **proximité / enseigne** (and similar KYC paths), not individual seconde-main sellers.

`POST /listings` contract note in `docs/backend/api-contract.md`:

> Reject if no seller or **pending-blocked**

“Pending-blocked” should apply only to seller kinds that require approval — not to `particulier`.

---

## Why the FE cannot work around this

- Web UI gates on `capabilities.createListing` **and** `verificationStatus === "pending"`.
- Even if the FE removed the toast, the API still returns **403**, so create fails.
- Seed listings already exist for this seller (visible publicly), which proves the account *can* own listings — only **new** `POST /listings` is blocked.

So this is a **backend seed + authorization** issue, not a wrong login or wrong audience on the web client.

---

## Likely root causes (for BE to check)

1. **Seed data:** `seller@fripcash.test` (and maybe other particuliers) are inserted with `verificationStatus = pending` by mistake.
2. **Become-particulier flow:** `POST /me/seller/particulier` sets `pending` instead of `none` / `approved`.
3. **Listing guard:** AuthZ treats *any* `verificationStatus === pending` as “cannot create listing”, ignoring `seller.kind`.
4. **Wrong error code:** Guard returns `FORBIDDEN_AUDIENCE` instead of something like `SELLER_VERIFICATION_PENDING` (when the block is intentional for shops).

---

## Requested BE fixes

1. **Seed / data**
   - Set particuliers to `verificationStatus: "none"` or `"approved"`.
   - Keep `pending` only for shop kinds that need admin review.

2. **AuthZ on `POST /listings` (and media attach if same guard)**
   - Allow create when:
     - `seller.kind === "particulier"` **and** destination is in `allowedDestinations`, **or**
     - boutique with `verificationStatus` in (`none`, `approved`) / capability flag.
   - Block create only when the seller path **requires** approval and status is `pending` or `rejected`.

3. **Align `capabilities.createListing` with reality**
   - If create is blocked, set `createListing: false` on `GET /me`.
   - If `createListing: true`, `POST /listings` must succeed (for that destination).

4. **Error code**
   - Prefer a clear code when intentionally blocked, e.g. `SELLER_VERIFICATION_PENDING`, not `FORBIDDEN_AUDIENCE`.

---

## Acceptance criteria

- [ ] `seller@fripcash.test` (particulier) can `POST /listings` → **201**
- [ ] `GET /me` for that user no longer shows misleading `pending` **or** pending no longer blocks particulier
- [ ] Proximité / enseigne still cannot publish while `pending`
- [ ] Web dashboard “Ajouter un article” works end-to-end (create + Cloudinary media attach)

---

## FE reference (current UX)

- Page: `/dashboard/articles`
- Banner copy when blocked: *Profil vendeur en attente de validation* + note that **403 `FORBIDDEN_AUDIENCE` comes from the BE**
- Toast on add click: *Ton profil vendeur est en attente de validation — tu ne peux pas encore publier.*

Once BE is fixed, FE banner/toast can stay as a soft gate only for real KYC-pending shop accounts.

---

# BE bug: admin credentials accepted on marketplace `/connexion` (shared Better Auth sign-in)

**From:** Web frontend (FripCash Next.js)  
**To:** Backend / Nest API + Better Auth  
**Date:** 2026-09-24  
**Severity:** Auth surface violation — staff can open a marketplace (consumer) session from `/connexion`  
**Environment:** Web France email login + seed/admin staff account

---

## Summary

Staff email + password that should only work on **`/admin-login`** also succeed on marketplace **`/connexion`**.

Observed: login with admin creds on `/connexion` → session accepted → lands on consumer `/dashboard`.

Per auth contract (`docs/backend/authentication.md` / `api-contract.md`):

| Surface | Entry UI | Endpoint (contract) | Audience |
|---------|----------|---------------------|----------|
| Marketplace | `/connexion` | consumer login | `aud: consumer` |
| Admin | `/admin-login` **only** | `POST /auth/admin/login` | `aud: admin` |

**Hard rule:** an admin session must **not** be enough to act as buyer/seller on marketplace endpoints.  
**Anti-pattern called out in docs:** sharing admin session with `/connexion` consumer login.

**Ask:** Separate admin login from consumer Better Auth email sign-in so staff credentials cannot mint a consumer marketplace session.

---

## How to reproduce

1. Open marketplace login: `http://localhost:3000/connexion`
2. Choose France (email) auth
3. Sign in with **admin** email + password (same creds used on `/admin-login`)
4. **Actual:** login succeeds → redirected to `/dashboard` (consumer shell)
5. **Expected:** reject with clear error (or require `POST /auth/admin/login` only), and never issue a consumer-audience token for staff-only accounts

Contrast: `/admin-login` already rejects non-admin accounts after `GET /me` (`isAdmin === false`). Marketplace login does the opposite gap — it never rejects `isAdmin === true`.

---

## What the web client does today

Both pages call the **same** Better Auth endpoint:

```http
POST /api/v1/auth/sign-in/email
```

- `lib/api/auth.ts` → `signInEmail`
- `adminSignInEmail` is an alias of `signInEmail` (no separate admin login call)
- Contract’s `POST /auth/admin/login` is **not** used by the web client (either missing on BE, or not exposed / not wired)

So the FE soft-checks admin-only on `/admin-login`, but **cannot** enforce audience separation if BE returns a usable marketplace session for staff on the shared email sign-in.

---

## Likely root causes (for BE to check)

1. **Missing / unused** `POST /auth/admin/login` that returns `aud: admin` only.
2. **Staff users share the same Better Auth user** as consumer email accounts; `/auth/sign-in/email` issues a generic session usable as consumer.
3. **Audience not bound at login** — token/session does not carry a hard `CONSUMER` vs `ADMIN` audience claim; `isAdmin` is only a soft flag on `GET /me`.
4. Seed admin may also be **provisioned with `CONSUMER` audience**, so marketplace APIs accept the session.

---

## Requested BE fixes

1. Implement (or expose) **`POST /auth/admin/login`** → session/token with **`aud: admin` only**.
2. On **`POST /auth/sign-in/email`** (consumer France path):
   - Reject accounts that are staff-only / admin-audience, **or**
   - Never attach consumer marketplace capabilities to admin-only users.
3. Enforce server-side: consumer token **must not** authorize `/admin/**`; admin token **must not** authorize buyer/seller marketplace mutations (unless explicitly designed — default: no).
4. Align seed: admin user should not look like a normal marketplace buyer after consumer login.

---

## Acceptance criteria

- [ ] Admin email+password on `/connexion` → **401/403** (or equivalent), no consumer session
- [ ] Same creds on `/admin-login` (via admin login endpoint) → admin session → `/admin/*` works
- [ ] Non-admin on `/admin-login` still rejected
- [ ] `GET /me` with admin token does not unlock buyer/seller flows; marketplace mutations stay forbidden for admin audience

---

## FE note (after BE)

Web can add a soft gate on `/connexion` (`if me.isAdmin → sign out + toast`), but that is **defense in depth only**. Real fix is separate admin login + audience-bound tokens on the BE.

---

# BE bug: admin cannot change listing status (no admin moderate API — `PATCH /listings/:id` returns 403)

**From:** Web frontend (FripCash Next.js)  
**To:** Backend / Nest API  
**Date:** 2026-09-24  
**Severity:** Blocks admin catalogue moderation on `/admin/articles`  
**Environment:** Admin session via `/admin-login`

---

## Summary

On **`/admin/articles`**, changing a listing status (e.g. “En attente” → Actif / Refusé / Signalé) fails with:

- HTTP **403**
- Message: *“You do not have access to this application area.”* (same family as **`FORBIDDEN_AUDIENCE`**)

Network:

```http
PATCH /api/v1/listings/{id}
→ 403 Forbidden
```

Admin **can** list products via `GET /admin/listings?status=ALL`, but **cannot** moderate them because there is no staff mutation endpoint. The web UI currently calls the **consumer owner** route `PATCH /listings/:id`, which correctly rejects admin audience — so moderation is dead.

Product / SRS (`docs/srs/12-admin.md`): admin must **flag / reject / unpublish** articles. Contract today only documents:

| Method | Path | Notes |
|--------|------|-------|
| PATCH | `/listings/:id` | **Owner only** |
| GET | `/admin/listings` | Admin catalogue (exists) |

**Missing:** admin status / moderate mutations under `/admin/listings/…`.

**Ask:** Add admin listing moderation APIs (status / flag / reject / unpublish) that accept **admin audience**, and keep owner `PATCH /listings/:id` consumer-only.

---

## How to reproduce

1. Sign in at `/admin-login` with staff credentials  
2. Open `/admin/articles`  
3. On a row (e.g. status “En attente”), use Approve / Reject / Flag (or any status action)  
4. **Actual:** toast *You do not have access to this application area.* + console `PATCH …/listings/{id} 403`  
5. **Expected:** listing status updates; row refreshes (ACTIVE / REJECTED / FLAGGED / etc.)

---

## What the web client does today

| Action | Endpoint used | Audience |
|--------|---------------|----------|
| List articles | `GET /admin/listings?status=ALL` | admin ✅ |
| Change status | `PATCH /listings/:id` `{ status }` | consumer/owner only → **403 for admin** ❌ |

Code path: `useUpdateArticleStatus` → `updateListing()` in `lib/api/listings.ts` (seller PATCH).  
There is **no** `PATCH /admin/listings/:id` (or equivalent) in `lib/api/admin.ts` — only `fetchAdminListings`.

So the 403 is **expected** with current AuthZ: admin must not use seller owner routes. The product gap is the **missing admin moderate API**.

---

## Likely root causes (for BE to check)

1. **No** `PATCH /admin/listings/:id` (or `…/status`, `…/moderate`) implemented.  
2. Admin UI was forced to reuse owner `PATCH /listings/:id`, which returns `FORBIDDEN_AUDIENCE`.  
3. Possible status enums for moderation not finalized server-side (`ACTIVE`, `DRAFT`, `REJECTED`, `FLAGGED`, `SOLD`, …).

---

## Requested BE fixes

1. Add staff endpoints, e.g.:
   - `PATCH /admin/listings/:id` with `{ status }` **or**
   - `POST /admin/listings/:id/approve|reject|flag|unpublish`
2. Accept **admin audience** only; audit who changed status.  
3. Keep `PATCH /listings/:id` **owner + consumer** only (do not open it to admin).  
4. Document allowed status transitions for moderation (esp. DRAFT/pending → ACTIVE, REJECTED, FLAGGED).

---

## Acceptance criteria

- [ ] From `/admin/articles`, approve/reject/flag updates listing without 403  
- [ ] `GET /admin/listings` reflects new status  
- [ ] Seller `PATCH /listings/:id` still owner-only (admin still 403 on that route — correct)  
- [ ] Public catalogue only shows ACTIVE (unchanged)

---

## FE note (after BE)

**FE updated (2026-09-25):** `useUpdateArticleStatus` now calls `PATCH /admin/listings/:id` via `updateAdminListing`. Owner `PATCH /listings/:id` remains seller-only.
