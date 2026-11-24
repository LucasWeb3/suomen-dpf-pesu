# Suomen DPF-Pesu: website redesign

A new design for https://suomendpfpesu.fi: one fast, responsive page in plain HTML,
CSS and JavaScript, with no build step. The copy is in Finnish and comes from the
current site (home, pricing and process, contacts, join the chain), proofread and
tightened.

Serve the folder and open http://localhost:8000:

    python3 -m http.server 8000

(Opening `index.html` straight from disk works too, but the browser then blocks the
self-hosted font and falls back to the system font.)

To publish, deploy this repository to a static host such as Vercel (no build
command; the site is the repository root), or upload `index.html`, `styles.css`,
`main.js`, `favicon.svg`, `og.jpg`, `fonts/` and `media/` to any web host.

## What's in it

- Hero: "Suomen edistyksellisin DPF-pesuketju", the 100 % guarantee, and the
  key figures (299 €, 600 °C, 100 %) next to a photo from their own wash machine.
- What we clean: parts and vehicle types as tags.
- Pricing: 299 € (cars and vans) and from 399 € (heavy vehicles, work machines, boats),
  both including VAT, with what the price covers and a courier note.
- Guarantee: an animated DPF face that washes clean while the back-pressure counts down
  from 188 to 11 mbar. Those numbers come from a real work order shown on the old site
  (`dokumentointi.webp`). Shows the end state at once for people who turn off motion.
- The eight-step wash process with the old site's photos (swipeable on phones).
- Locations: a map of Finland drawn as filter cells (Natural Earth outline via
  `world-atlas`), linked both ways with the five location cards (phone, email, route).
- Shop teaser: four real products linking to their pages in the Shopify store.
- Join the chain, FAQ (answers taken only from what the old site says), and a quote form.

The quote form needs no server: it opens the visitor's email app with a message
addressed to the location they picked, with the vehicle type, registration or VIN
number and contact details filled in. The pricing buttons preselect the vehicle type.

## Fonts and media

`fonts/archivo.woff2` is Archivo (SIL Open Font License, `fonts/OFL.txt`), a variable
font with weight and width axes: headings use the expanded width. It is self-hosted,
so the page makes no requests to Google.

Every photo in `media/` comes from the current site, resized and converted to WebP
(about 500 KB for the whole page). `og.jpg` is the link preview image.

## Before going live

- The shop (gasket kits, wash liquids, the DPF 1800 machine) stays on Shopify. If this
  page replaces the Shopify storefront on suomendpfpesu.fi, either move the store to
  its own address (for example kauppa.suomendpfpesu.fi) and update the shop links, or
  build this design as a Shopify theme instead.
- `og:image` points at https://suomendpfpesu.fi/og.jpg, so link previews work once the
  page is live on that domain.
- The old site had a newsletter sign-up; it is left out because it needs Shopify.
- The logo is a typographic wordmark with a filter-cell mark, in the same spirit as
  the current chrome logo. Swap in a vector logo if they want to keep the old one.
- Ask whether the shop prices (heavy-vehicle wash 449 € and 599 € with freight) or the
  price list (from 399 €) is current; the page shows the price list.
