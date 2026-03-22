// =================================================================
//  Humpin’ & Dumpin’ Shop – Item Listings
//
//  HOW TO ADD AN ITEM:
//  1. Go to the Amazon product page
//  2. Copy the URL from your browser
//  3. Add a new entry below with just url, price, condition and sold
//  4. Title and image are fetched automatically!
//  5. Comma after each } except the very last one
//
//  condition: “new”, “opened”, or “used”
//  sold:      false = show it,  true = hide it
//
//  You CAN manually add img and title if you want to override:
//  img:   “https://…”   (optional - auto-fetched if missing)
//  title: “My title”      (optional - auto-fetched if missing)
// =================================================================

window.SHOP_ITEMS = [
{
url: "https://www.amazon.co.uk/dp/B0F844VTC8",
price: 150,
condition: "new",
sold: false
},

{
url: "https://www.amazon.co.uk/dp/B0GH1Q73V2",
price: 40,
condition: "new",
sold: true
},
  
{
url: "https://www.amazon.co.uk/dp/B0GH1ZZ49F",
price: 30,
condition: "new",
sold: false
}

];
