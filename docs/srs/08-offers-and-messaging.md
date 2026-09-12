# 08 — Offers and messaging

## 8.1 Offers (negotiation)
- Buyer proposes amount below display price on eligible listings.  
- States: `pending` | `accepted` | `refused`.  
- Seller accepts/refuses from seller offers inbox.  
- **Disabled** for enseigne listings (and UI hides “demander”).  
- On accept: BE defines whether price locks into checkout or creates a reserved offer token.

## 8.2 Messaging
- Thread between buyer and seller (and support).  
- Message types: text, image.  
- System cards / events (examples from product UI): order summary, escrow held, waiting confirmation, payment released, dispute locked, out for delivery, confirm receipt.  
- Enseigne threads may set `messagingDisabled` / limited actions.

## 8.3 Requirements for BE
- AuthZ: only participants (or admin/support) read a thread.  
- Persist media for chat images.  
- Push / in-app notification on new message and offer events.
