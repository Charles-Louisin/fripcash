# Nest API coverage (web)

Checklist against Swagger + Better Auth. Status: **wired** = `lib/api` + hooks/UI, **N/A** = not for browser, **stub** = client exists, no dedicated UI.

## Auth (outside Swagger)

| Route | Status |
|-------|--------|
| POST `/auth/phone-number/send-otp` | wired — connexion / inscription (Guinée) |
| POST `/auth/phone-number/verify` | wired |
| GET `/auth/get-session` | wired — `getSession` |
| POST `/auth/sign-out` | wired — logout |
| POST `/auth/sign-in/email` | wired — admin + connexion France |
| POST `/auth/sign-up/email` | wired — inscription France |
| POST `/auth/send-verification-email` | wired — needs BE email provider + trusted callback `/verifier-email` |
| GET `/auth/verify-email` | wired — `/verifier-email?token=` |
| POST `/auth/request-password-reset` | wired — mot-de-passe-oublie (France) |
| POST `/auth/reset-password` | wired — token from email link |

## Health

| Route | Status |
|-------|--------|
| GET `/health` | wired — `fetchHealth` |
| GET `/health/ready` | wired — `fetchReady` |

## Users / sellers / KYC

| Route | Status |
|-------|--------|
| GET/PATCH `/me` | wired |
| POST `/me/seller/*` | wired — `lib/api/sellers` + `hooks/use-seller` |
| GET/POST `/me/kyc*` | wired — `lib/api/kyc` + hooks |
| Org KYC | wired — client + hooks |
| Admin seller-verifications | wired — validations page |
| Admin KYC | wired — hooks |

## Catalog / listings / media / social

| Route | Status |
|-------|--------|
| Catalog categories/zones/best-sellers + admin CRUD | wired |
| Listings CRUD | wired — `use-articles` |
| Media Cloudinary (catalogue) | wired — `uploadCatalogueImage` + listing media attach; category `imageUrl`/`imagePublicId` |
| Media MinIO presign | wired — KYC / excel / PDFs only (`presignMedia`) |
| Favorites | wired |
| Reviews / comments | wired |
| Admin hide review/comment | wired — hooks |

## Commerce

| Route | Status |
|-------|--------|
| Cart + checkout | wired — `use-cart`, checkout page |
| Orders purchases/sales/status | wired |
| Disputes open + admin resolve | wired |
| Invoices receipt | wired — hook |
| Wallet balance/ledger/withdraw | wired |
| OM webhook | N/A — backend only |

## Offers / messaging / notifications / pusher

| Route | Status |
|-------|--------|
| Offers | wired |
| Conversations / messages | wired |
| Notifications list/read/preferences | wired |
| Device register | stub — mobile primary |
| Pusher auth / beams | wired client — beams N/A on web by default |

## Courier

| Route | Status |
|-------|--------|
| All `/courier/*` | stub — `lib/api/courier.ts` (app primary) |

## Admin

| Route | Status |
|-------|--------|
| `/admin/me`, platform-settings, audit-logs | wired hooks |
| provision-audience | wired hook |
| Users/articles/orders list APIs | **partial** — articles `GET /admin/listings`; users full Better Auth admin (`list/create/update/set-role/password/sessions/ban/remove`); orders/disputes list still 404 |
| Seed vs UI counts | see [seed-vs-admin-ui.md](./seed-vs-admin-ui.md) |

## Remaining gaps (no matching Swagger list endpoint)

- Admin listings with all statuses (DRAFT/SOLD/…) — public list is ACTIVE-only → undercount vs seed
- Admin users / orders / disputes **list** (resolve-only for disputes)
- Admin rapports / sessions / signalements / partenaires / wallets list
- `useTopReviews` (no global endpoint)
