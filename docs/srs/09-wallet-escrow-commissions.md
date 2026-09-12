# 09 — Wallet, escrow, commissions

## 9.1 Commission (server-priced)
| Profile | Platform commission |
|---------|---------------------|
| Proximité (`shop_kind=proximite`) | **5%** |
| Particulier / boutique standard / enseigne | **8%** |

Clients may preview; **backend wins**.

## 9.2 Pricing model
- Seller sets **net** amount they want.  
- Buyer pays **gross** (net + commission and any fee components).  
- Document formula in API so app/web match.

## 9.3 Escrow
1. On successful payment → funds **held**.  
2. On buyer confirm receipt / delivery confirmation rules → **release** to seller wallet.  
3. On dispute → hold until admin resolution.  
4. Resolutions: release to seller, partial refund, full refund to buyer.

## 9.4 Wallet transaction types
Examples to support: `saleCredit`, `withdrawal`, `deliveryFee`, `escrowHold`, `escrowRelease`, `refund`, `partialRefund`.

## 9.5 Withdrawals
- Seller (and courier earnings) withdraw to **Orange Money**.  
- Require verified phone / payout KYC as BE policy.

## 9.6 Admin finance
- View wallets, adjust commission settings (standard vs proximité), audit movements.
