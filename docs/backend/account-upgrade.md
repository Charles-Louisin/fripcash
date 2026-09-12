# Account upgrade (not role switching)

## Product rule

Users **upgrade** or **add** seller capabilities. They do **not** freely switch roles in Settings.

| Allowed | Not allowed |
|---------|-------------|
| Buyer → particulier | Toggle acheteur ↔ enseigne daily |
| Buyer → boutique / proximité / enseigne (application) | Silent auto-role on first publish without consent |
| Particulier → create boutique (application) | Downgrade boutique → buyer from a casual Settings switch |
| Separate courier onboarding | Mixing livreur into marketplace “role picker” |

Downgrade / close shop = support or dedicated “close shop” flow later — not v1 Settings.

---

## UX (app + site)

### Buyer (no seller_profile)

- Settings / Compte: **Devenir vendeur**
- Opens chooser: Particulier | Boutique | Commerce local | Grande surface
- Sell `+` does **not** create a listing; it starts this upgrade (or Sell hub)

### Particulier

- Can publish to **Seconde main**
- Settings: **Créer une boutique** (upgrade path only — shop roles)
- Purchase history unchanged; sales history starts when they sell

### Boutique / proximité / enseigne

- No “switch back to buyer” control
- If `verification_status = pending`: show status banner; **no public listings** until approved
- If rejected: show reason + re-apply

### Web vs app

| Surface | Scope |
|---------|--------|
| **Web** | Light: become particulier (or CTA to app for shop / proximité / enseigne) |
| **App** | Full upgrade chooser + shop KYC fields |

Same API; different UI depth is OK.

---

## History & data retention

| Data | After upgrade |
|------|----------------|
| Purchases (as buyer) | **Always kept** — same `user_id` |
| Favorites, messages | Kept |
| Sales / listings | Appear under seller_profile; empty until first sale/listing |
| Wallet | One wallet; label movements as buyer vs seller vs courier |
| User id | **Stable** — never rewrite id on upgrade |

---

## KYC / verification by path

| Upgrade target | Required before full sell |
|----------------|---------------------------|
| Particulier | Phone verified; zone + address; payout KYC can be later |
| Boutique standard | Shop name, logo, address, zone, SLA; business checks optional |
| Commerce local | Shop details + category + **admin approval** |
| Grande surface / enseigne | Partner docs + **admin approval** |
| Livreur | Separate courier docs + approval |

### Pending behaviour (proximité / enseigne)

While `pending`:

- Account may show seller dashboard shell  
- Shop **hidden** from public directories  
- **Cannot publish live listings** (drafts optional later)  
- Admin approves → `approved` → directory + publish unlocked  

---

## Anti-patterns (do not implement)

1. Settings toggle “Mode vendeur (demo)” that fakes another seller’s data  
2. Auto `becomeIndividualSeller()` on listing submit without the upgrade form  
3. Admin disputes screen reachable by every consumer  
4. Changing `user.id` when upgrading (breaks order history)  
