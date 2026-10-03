# Shapur (شاپور) - demo shop for Call of Duty Mobile CP

A static, Persian (RTL) demo e-commerce site. It is a learning / portfolio project: no backend, no real payments, never meant to sell anything. Live preview: https://aydin1388.github.io/shop/ (GitHub Pages, repo aydin1388/shop, branch main).
Visual model: khodesadi.com (COD products only), blue + dark glass look.

## Tech
Plain HTML + CSS + vanilla JS. No build step, no framework. Open index.html (VS Code Live Server works). Language: Persian, `dir="rtl"`. Fonts are local files (fonts/Estedad.woff2, fonts/Lalezar.woff2) so the site works offline.

## Pages
- index.html - home: hero, category tiles, special-offer countdown, featured products, partners, reviews, top users, recent orders, news, FAQ, about + stats, why-Shapur, footer
- cp.html - 32 CP packages (80 ... 12000 CP)
- offers.html - 51 offers (battle pass, supply pass, bundles, boxes ...)
- double.html - 12 double-CP packs (all marked sold-out, like the reference site)
- product.html (+product.js) - product detail, reads name/price/img from the URL
- cart.html (+cart.js) - cart page; cart is stored in localStorage key `shapur_cart`
- auth.html (+auth.js), contact.html (+contact.js), dashboard.html (+dashboard.js), admin.html - demo pages with sample data
- terms.html, privacy.html

## Shared code
- style.css - ALL styling (about 100 KB). It is layered: the base styles first, then override blocks added later at the end of the file (glass look, header/footer tweaks, modern animation block). Later rules win, so edit the LAST matching block.
- script.js - FAQ toggle, category slider, cart buttons on cards
- ui.js - scroll progress bar, page-leave loading bar, back-to-top, cursor glow, scroll-reveal, magnetic buttons, header shrink
- support.js - floating support chat widget + greeting bubble

## Colors (CSS variables at the top of style.css)
bg #0a0b14 (later overridden to #06070f), blue accent #394ff0, light blue #9e9eff, hover #566aff, text #e2e8f0. No gold anywhere.

## Images
- images/k/*.jpg - the product / tile / banner images actually used (104 files). See IMAGE-BRIEF.md for every slot, size and the exact job.
- images/hero-coin.svg, subject-offer.svg, subject-double.svg - the three original hero/banner coin & gift illustrations (used by index, cp, offers, double, auth).
- Cards read their image from an inline style: `style="--img: url('images/k/cp-80.jpg')"`.

## Performance notes (target: a weak 4 GB-RAM laptop)
Animate only transform / opacity. No backdrop-filter except in a few small places. Do not add infinite animations on large elements (it made the home page janky). Respect prefers-reduced-motion.

## Unused leftovers (safe to delete)
- images/p/ (old abstract SVG art, 104 files)
- images/battlepass.jpg, bundle.jpg, cp-10800.jpg, cp-2400.jpg, cp-420.jpg, cp-5000.jpg, cp-80.jpg, cp-880.jpg, supply.jpg (old banners; the site now uses images/k/)
- shot.js (old screenshot helper, not part of the site)

## Do not
Do not use official Call of Duty / Activision logos or art. Do not add fake customer reviews or fake orders (the review / top-user / order sections are intentionally placeholders).
