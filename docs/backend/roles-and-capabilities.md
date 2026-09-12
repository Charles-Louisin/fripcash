# Roles & capabilities

## Canonical model (one user)

Do **not** store a single mutable “current role” that overwrites identity.

```text
User
├── can_buy: always true (except livreur-only / admin-only accounts if split)
├── seller_profile: none | particulier | boutique
│     └── shop_kind (if boutique): standard | proximite | enseigne
├── verification_status (shop paths that need it): none | pending | approved | rejected
├── courier_profile: optional (usually separate onboarding)
└── admin: optional staff flag
```

### Signup / upgrade paths (`SignUpRole`)

| Path | Runtime seller | `shop_kind` | Listing destination | Manual validation |
|------|----------------|-------------|---------------------|-------------------|
| `acheteur` | none | — | — | — |
| `particulier` | `vendeurParticulier` | — | `secondeMain` | No (light profile OK) |
| `boutique` | `boutique` | `standard` | `articlesNeufs` | Optional business checks |
| `commerceLocal` | `boutique` | `proximite` | `quartierBoutiques` | **Yes** |
| `grandeSurface` | `boutique` | `enseigne` | `enseignes` | **Yes** |

### Runtime account roles (`UserRole`)

| Role | Meaning |
|------|---------|
| `acheteur` | Buyer only (no seller_profile) |
| `vendeurParticulier` | Individual second-hand seller |
| `boutique` | Shop; subtype via `shop_kind` |
| `livreur` | Courier (own app shell) |
| `admin` | Staff (admin web / ops) |

---

## Permission matrix

| Capability | Acheteur | Particulier | Boutique standard | Proximité | Enseigne | Livreur |
|------------|----------|-------------|-------------------|-----------|----------|---------|
| Browse / buy / favorites | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (courier shell) |
| Messages (buyer/seller) | ✅ | ✅ | ✅ | ✅ | ⚠️ threads may disable “demander” | Support only |
| Make offer on listing | ✅* | ✅* | ✅* | ✅* | ❌ on enseigne products | — |
| Create listing | ❌ → upgrade | ✅ → seconde main | ✅ → articles neufs | ✅ if **approved** | ✅ if **approved** | ❌ |
| Seller dashboard / ventes | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Excel import | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Product library | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Wallet buyer + seller | ✅ (buyer) | ✅ | ✅ | ✅ | ✅ | Courier earnings |
| Vacation mode / bundles | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Directory visibility | — | always | always | only if **approved** | only if **approved** | — |
| Courier missions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

\*Except listings where seller type is enseigne (no negotiation / demander).

---

## Commission (server-priced)

| Shop kind | Platform commission |
|-----------|---------------------|
| `proximite` | 5% |
| `standard` / `enseigne` / particulier | 8% |

Clients may preview; **backend is authoritative**.

---

## Fulfillment defaults

| Shop kind | Default fulfillment |
|-----------|---------------------|
| `proximite` | Pickup / shop local delivery (no FripCash courier by default) |
| others | FripCash courier |

---

## Client must never decide alone

- Role upgrade / shop_kind change  
- Commission & payout amounts  
- Verification approve/reject  
- Directory visibility  
- Dispute refund / release escrow  
- Whether a listing may go public while pending  
