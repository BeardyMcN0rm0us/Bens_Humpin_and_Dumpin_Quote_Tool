// ═══════════════════════════════════════════════════════════════
//  Ben’s Humpin’ & Dumpin’ — Pricing Config
//  Edit values here. This file loads before main.js so anything
//  you set below will override the defaults in main.js.
// ═══════════════════════════════════════════════════════════════

window.BHD = {

// ── Mileage & surcharges ──────────────────────────────────────
mileagePerMile:   0.50,   // £ per charged mile
twoManSurcharge:  20,     // £ added if two-person team requested
stairsPerFloor:   5,      // £ per floor at pickup + drop-off

// ── Base call-out fees by job type ────────────────────────────
baseFees: {
default:          20,   // fallback for most job types
move:             0,   // house moves
shopBefore22:     10,   // emergency shop run before 10pm
shopAfter22:      20,   // emergency shop run after 10pm
ikeaCollect:      0,   // IKEA collect only
ikeaCollectBuild: 0,   // IKEA collect + build
flatpack:         0,   // flat pack build only
},

// ── Quote range (±% either side of calculated total) ─────────
// e.g. 0.15 = quote shown as £85–£115 on a £100 job
rangePct:{ 
    tip:0.15, 
    move:0.15, 
    fb:0.15, 
    shop:0.15, 
    student:0.15, 
    business:0.15, 
    other:0.15, 
    ikea:0.15, 
    flatpack:0.15, 
    hay:0.15, 
    bags:0.00 },

// ── Minimum charges per job type (leave blank or 0 to disable) ─
minByType: {
tip: “”, move: “”, fb: “”, shop: “”,
student: “”, business: “”, other: “”, ikea: “”, flatpack: “”
},

// ── House move labour ─────────────────────────────────────────
HOURLY_RATE_MOVE: 25,     // £/hr for move labour
LUTON_HIRE_COST:  225,    // £/day default Luton van hire

// Hours & Luton needed by bedroom count
BEDROOM_LOAD_MULTIPLIERS: {
1: { hours: 3,  luton: false },
2: { hours: 5,  luton: true  },
3: { hours: 6,  luton: true  },
4: { hours: 8,  luton: true  },
5: { hours: 10, luton: true  },
},

// ── Tip run disposal — Waterbeach published rates ─────────────
// Fee charged = disposalMinPct × ratePerTonne
disposalMinPct: 0.26,
disposalVat: 0.20,     // 25% of published rate (minimum load)
disposal: {
general:   { label: “General Waste”,              ratePerTonne: 192.50 },
soil:      { label: “Soil / Inert”,               ratePerTonne:  69.75 },
hardcore:  { label: “Hardcore”,                   ratePerTonne:  25.75 },
plaster:   { label: “Plasterboard”,               ratePerTonne: 105.00 },
wood:      { label: “Mixed Wood”,                 ratePerTonne:  91.00 },
mdf:       { label: “MDF”,                        ratePerTonne: 175.00 },
metal:     { label: “Metals”,                     ratePerTonne:  27.00 },
plastics:  { label: “Rigid / Agricultural Plastics”, ratePerTonne: 186.23 },
green:     { label: “Green Material”,             ratePerTonne:  90.00 },
cardboard: { label: “Cardboard (clean)”,          ratePerTonne:  25.00 },
dmr:       { label: “Dry Mixed Recycling”,        ratePerTonne: 145.00 },
wuds:      { label: “WUDs & POPs”,                ratePerTonne: 345.00 },
},

// ── IKEA / flat pack assembly ─────────────────────────────────
useTimePricing:      true, // true = price by time, false = price per item
ikeaLaborPerHour:    25,   // £/hr when useTimePricing is true
ikeaAssemblyPerItem: 40,   // £/item when useTimePricing is false

// ── Gardening ─────────────────────────────────────────────────
gardenSoloPerHour:    15.00,  // £/hr — Ben solo
gardenTwoPerBlock:    50.00,  // £ per 2-hour block — Ben + Helper
gardenBlockHours:     2,      // hours per block (two-person pricing)

// ── Special offers & discounts ────────────────────────────────
// Set type to 'percent' or 'fixed' to activate an offer.
// 'percent' = value is % off  (e.g. 10 = 10% off)
// 'fixed'   = value is GBP off  (e.g. 20 = 20 GBP off)
// label is shown in the quote breakdown and WhatsApp message.
// Set type back to 'none' (or value to 0) to deactivate.
discount: {
  type:  'none',   // 'none' | 'percent' | 'fixed'
  value: 0,        // e.g. 10 for 10% off, or 20 for 20 GBP off
  label: '',       // e.g. 'Spring special 10% off' or '20 off this week only'
},

// ── Gardening special offers ──────────────────────────────────
// Apply a discounted rate or % off independently for solo and two-person.
// soloType / twoType:
//   'none'    = no offer (use normal rate above)
//   'rate'    = override the hourly rate entirely (e.g. 15.00 = GBP 15/hr)
//   'percent' = % off the normal rate (e.g. 20 = 20% off)
// label is shown in the quote breakdown.
gardenOffer: {
  soloType:  'none',  // 'none' | 'rate' | 'percent'
  soloValue: 0,       // new GBP/hr OR % off
  soloLabel: '',      // e.g. 'Spring solo offer'

  twoType:   'none',  // 'none' | 'rate' | 'percent'
  twoValue:  20,       // new GBP/hr OR % off
  twoLabel:  '',      // e.g. 'Two-person spring offer'
},

};
