# Manny (demo)

Swipe-to-help. People who need help post their bills and story, and donors swipe through them: **right = help** (pick an amount, a custom amount or the whole bill), **left = pass**. There's no chat. Money goes **straight to the biller** (the power company, the school, the hospital), never as cash to the person.

**Countries:** Philippines (₱) and United States ($) for now, picked on the welcome screen or in Menu → Country. The country decides who you see, the money, the preset amounts, billers, cities and ID types. Each country has its own demo wallet and its own gift history. **Language** (English / Filipino) is a separate setting and works with any country. To add a country, add an entry to `MANNY_COUNTRIES` in `data.js` and two text lines (`country_XX`, `money_XX`) in `i18n.js`.

**This is a clickable prototype.** Everyone in it is made up, all money is pretend, and everything is saved only in the phone's browser (localStorage). Nothing is uploaded.

## What's in it
- **Discover:** banknote-style swipe cards (drag, or use the ✕ / ₱ buttons, or ← / → keys), category filters, undo pass, tap a card for the full story, bills, checks and updates.
- **Give sheet:** pick which bill, pick an amount, and choose "Show my name" or anonymous. Then a celebration, and a thank-you note arrives a few seconds later.
- **My giving:** demo wallet, totals, thank-you notes, every gift with "Paid to Meralco ✓", and "show passed people again".
- **Ask for help:** the requester form (story, up to 5 bills each with a bill photo, valid ID + selfie, consent) → "checking" → live. It includes a preview of their card, a "pretend someone helped" button and thank-you updates. Photos never leave the phone and aren't saved.
- Country switch (Philippines / United States) and English / Filipino switch, both in the Menu. Stories stay in the language they were written in.

## Run it
Plain HTML/CSS/JS, no build step:

```bash
python -m http.server 8770 --directory C:/Users/Cyrus/manny
```

Then open http://localhost:8770 (use your phone size in DevTools).

Live demo: https://extexodus-sketch.github.io/manny/ (GitHub Pages from `main`). To update it, commit and push `main`. Bump `CACHE` in `sw.js` when you add or rename files.

| File | Role |
|---|---|
| `index.html`, `style.css` | Page and the dollar-bill look |
| `app.js` | All screens and the demo logic |
| `i18n.js` | English + Filipino UI text |
| `sw.js`, `manifest.webmanifest`, `icon*.png` | Add to Home Screen + offline |
| `data.js` | Countries (money, amounts, billers, cities, ID types) and made-up requesters: 10 in the PH, 8 in the US |

## Before real money: what a launch would need
This is not legal advice. Every country has its own rules, so talk to a lawyer in each country before taking a single real peso or dollar. Launching one country first is much easier than two.

### Philippines

1. **Don't hold the money yourself.** If Manny collects donors' money and passes it on, that likely makes it an e-money / remittance business that needs a BSP licence. The usual route is a licensed payment partner (e.g. PayMongo, Xendit, Maya Business) to take GCash, Maya and card payments. Bills would be paid through a **bills-payment aggregator** so the money goes straight to Meralco, the school and so on. "Pay the biller directly" also helps a lot against scams.
2. **Public solicitation permit.** Asking the public for donations for others in the PH generally needs a **DSWD solicitation permit**, and it's usually easier as a registered **non-stock, non-profit** (SEC). Check this early; it may shape the whole business.
3. **Anti-money laundering (AMLA).** The payment partner does KYC on donors, but you'll still want limits per donor and per request, and you'll need to watch for odd patterns (the same people giving to each other, money going round in circles).
4. **Data Privacy Act of 2012.** Money troubles and especially **health info are sensitive personal information**. You'd need clear consent, a privacy notice, a Data Protection Officer, possibly NPC registration, minimal data (first names only, hidden account numbers) and real deletion.
5. **Real verification.** Use an eKYC provider or PhilSys check for ID + liveness selfie. Check each bill with the biller/aggregator (does the account and amount exist?). Have a person review the first few weeks, detect duplicates (same bill or ID used twice), and set caps for new requesters.
6. **Safety and dignity.** 18+ only, no children's photos, a report button on every card, and a way for requesters to pause or delete.
7. **Accounts + backend** (Firebase like maCros works). It needs server-side code for payment webhooks, because the app must never trust the phone about money.

### United States
1. **Money transmission.** Holding and passing on other people's money is regulated state by state (money transmitter licences) and federally (FinCEN). Use a payment platform built for this, such as Stripe Connect, and pay billers through a bill-pay partner instead of holding funds.
2. **Charitable solicitation.** Many states require registration before asking the public for donations. Gifts to individuals are **not tax-deductible**, so the app must not suggest they are. Running it through a registered 501(c)(3) changes this, but that's a big decision.
3. **KYC and fraud.** The same ID + liveness checks, bill checks and caps apply, plus the payment partner's own identity checks.
4. **Privacy.** Health and money details are sensitive. Some states (e.g. California's CCPA/CPRA, Washington's My Health My Data Act) have strict rules for this kind of data.

Sensible order: test this demo with real people → pick ONE country to launch first → register the business/non-profit and check the permits → sign a payment partner (sandbox first) → build accounts + verification → small closed pilot with a few verified requesters → open up.
