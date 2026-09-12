# Listing destinations

Home discovery “universes” where a seller’s products appear.

| Destination | Who publishes there | Condition rule |
|-------------|---------------------|----------------|
| `secondeMain` | `vendeurParticulier` | Second-hand conditions OK |
| `articlesNeufs` | Boutique `standard` | Label as **Neuf** (normalize if needed) |
| `quartierBoutiques` | Boutique `proximite` | **Neuf**; shop must be **approved** |
| `enseignes` | Boutique `enseigne` | **Neuf**; shop must be **approved**; no offers / “demander” |

Destination is derived from **seller_profile + shop_kind**, not chosen ad hoc per listing (except future explicit multi-profile accounts — out of scope).

Clients: Flutter `listing_routing.dart` / web `lib/seller-domain.ts`.
