// ═══════════════════════════════════════════════════════════════
//  Humpin’ & Dumpin’ Shop — Item Listings
//  Edit this file to add, update or hide items.
//
//  HOW TO ADD AN ITEM:
//  1. Go to the Amazon product page
//  2. Copy the URL from your browser
//  3. Add a new entry below (copy an existing one as a template)
//  4. Set sold: true to hide it, sold: false to show it
//
//  FIELDS:
//  url       — full Amazon product URL
//  asin      — the bit after /dp/ in the URL e.g. B0CXK123AB
//              (used to pull the product image automatically)
//  title     — product name (you can shorten it)
//  desc      — optional short description
//  price     — your asking price in £
//  rrp       — Amazon price / RRP in £
//  condition — “new”, “opened” or “tested”
//  postage   — true = can post, false = collection only
//  sold      — true = hide from shop, false = show in shop
// ═══════════════════════════════════════════════════════════════

window.SHOP_ITEMS = [

{
asin: “B0CXK1EXAMPLE”,
url: “https://www.amazon.co.uk/dp/B0CXK1EXAMPLE”,
title: “Example Item — Replace Me”,
desc: “This is a sample listing. Edit shop-items.js to add your real items.”,
price: 15,
rrp: 35,
condition: “opened”,
postage: true,
sold: false
}

];