# 18 — Disputes, refunds & reports

**Status:** Product UI exists (app order/chat dispute + admin Litiges). This file is the **full end-to-end SRS** so BE does not guess.

Related: [08-offers-and-messaging.md](./08-offers-and-messaging.md), [09-wallet-escrow-commissions.md](./09-wallet-escrow-commissions.md), [12-admin.md](./12-admin.md).

---

## 1. Two different “talk to admin” concepts

| Concept | Who starts | Where | Goal |
|---------|------------|-------|------|
| **Offer / “bid”** (“Faire une offre”) | Buyer | Product detail | Negotiate price with **seller** (not admin) |
| **Chat seller** | Buyer / seller | Inbox / product | Message the other party |
| **Listing report** (signalement) | Any user | Product / profile | Flag scam, fake, inappropriate → **admin Signalements** queue |
| **Order dispute / litige** | Buyer (or seller) | Order detail / chat system card | Escrow locked → **admin Litiges** → refund / release / partial |

Do **not** mix signalement (moderation) with litige (money / escrow).

---

## 2. Offers (“bids”) — already in product, short recap

1. Buyer opens listing → **Faire une offre** (hidden on enseigne).  
2. Amount must be **below** display price.  
3. Offer → seller inbox: **accept** | **refuse**.  
4. States: `pending` | `accepted` | `refused`.  
5. On accept: BE locks negotiated price into checkout (exact mechanism BE chooses).  
6. Notifications to both parties.

Full rules: [08-offers-and-messaging.md](./08-offers-and-messaging.md).

---

## 3. Chat with seller

1. Buyer (or seller) opens thread.  
2. Text / image messages.  
3. System cards can appear: order summary, escrow held, out for delivery, **confirm receipt**, **dispute locked**.  
4. From confirm-receipt / order context, buyer can open a **dispute** (see §4).  
5. Enseigne: messaging / “demander” may be disabled.

---

## 4. Order dispute → admin inspects → refund / release (REQUIRED FLOW)

### 4.1 When buyer can open a dispute
Typical triggers (app copy):
- Item never arrived  
- Damaged / not as described  
- Other post-purchase problem  

Suggested gate (confirm with ops):
- Order is paid / in delivery / delivered (escrow still held or recently delivered).  
- Not already `disputed` or `refunded`.  
- Optional time window after delivery (open question in file 16).

### 4.2 Buyer (or seller) opens dispute
1. User opens **order detail** (or chat system card).  
2. Taps **Ouvrir un litige** / send message to admin.  
3. Writes **reason** (free text; optional photos later).  
4. API creates dispute + sets order status → **`disputed`**.  
5. **Escrow stays locked** (no auto payout to seller).  
6. Parties see “dispute open / payment locked” in app + chat card.  
7. **Admin** gets notification / item in **Litiges**.

### 4.3 Admin review (web `/admin/litiges`)
Statuses:
| Status | Meaning |
|--------|---------|
| `open` | Just filed |
| `under_review` | Admin inspecting (chat, delivery proof, payment history) |
| `resolved` | Outcome applied |

Admin may inspect:
- Order + escrow amount  
- Buyer / seller identities  
- Dispute reason + evidence  
- Related chat thread (read-only for staff)  
- Delivery / courier events if any  

### 4.4 Admin resolution actions (exactly three)
| Outcome code | What happens to money | Order / wallet effect |
|--------------|----------------------|------------------------|
| `refund_buyer` | **Full refund** to buyer | Escrow → buyer; order → `refunded` (or equivalent) |
| `partial_refund` | Part to buyer, remainder policy (usually rest to seller or held per rule) | Ledger: `partial_refund` + optional release of remainder |
| `release_seller` | Claim rejected → **release escrow to seller** | Seller credited; dispute closed in seller’s favour |

All three are **admin-only** APIs. Consumer tokens → 403.

### 4.5 After resolve — back to users
1. Dispute → `resolved` + `outcome` + `resolvedAt` + optional admin notes.  
2. Wallet movements created (refund / partial / escrow_release).  
3. Push / in-app notification to **buyer and seller**.  
4. Chat may append a system card (“Refund issued” / “Payment released to seller”).  
5. Order history shows final status; UI reflects escrow no longer locked.

```text
Buyer/Seller opens litige + reason
        ↓
Order = disputed · escrow LOCKED
        ↓
Admin Litiges queue (open → under_review)
        ↓
Admin chooses: refund_buyer | partial_refund | release_seller
        ↓
Ledger updated · notifications · chat/order UI updated
        ↓
Dispute = resolved
```

---

## 5. Listing / user signalements (reports) — separate queue

1. User taps **Signaler** on a listing (or user).  
2. Picks reason + optional comment.  
3. Goes to admin **Signalements** (not Litiges).  
4. Admin may unpublish listing, warn/suspend user — **no automatic escrow refund** (unless they also open/link a dispute on an order).

---

## 6. Suggested API sketch

### Offers
| Method | Path |
|--------|------|
| POST | `/listings/:id/offers` |
| GET | `/me/offers` (buyer) |
| GET | `/me/seller/offers` |
| POST | `/offers/:id/accept` |
| POST | `/offers/:id/refuse` |

### Chat
| Method | Path |
|--------|------|
| GET | `/conversations` |
| GET | `/conversations/:id/messages` |
| POST | `/conversations/:id/messages` |

### Disputes
| Method | Path | Who |
|--------|------|-----|
| POST | `/orders/:id/disputes` | Buyer/seller (body: reason, evidence[]) |
| GET | `/me/disputes` | Parties |
| GET | `/admin/disputes` | Admin |
| GET | `/admin/disputes/:id` | Admin (+ related chat snapshot) |
| POST | `/admin/disputes/:id/review` | Admin → `under_review` |
| POST | `/admin/disputes/:id/resolve` | Admin body: `{ outcome, amount?, notes? }` |

`outcome`: `refund_buyer` | `partial_refund` | `release_seller`

### Signalements
| Method | Path |
|--------|------|
| POST | `/reports` |
| GET | `/admin/reports` |
| POST | `/admin/reports/:id/resolve` |

---

## 7. Acceptance checks
- [ ] Opening a dispute locks escrow and sets order `disputed`.  
- [ ] Admin can full refund, partial refund, or release to seller.  
- [ ] Buyer/seller are notified after resolve; order + wallet match outcome.  
- [ ] Consumer cannot call resolve endpoints.  
- [ ] Signalement does not by itself move escrow money.  
- [ ] Offers/chat work independently of disputes; enseigne blocks offers.
