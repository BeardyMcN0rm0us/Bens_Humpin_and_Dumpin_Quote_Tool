// ═══════════════════════════════════════════════════════════════
//  Ben’s Humpin’ & Dumpin’ — Pricing Config
//  Edit values here. This file loads before main.js so anything
//  you set below will override the defaults in main.js.
// ═══════════════════════════════════════════════════════════════

window.BHD = {

// ── Mileage & surcharges ──────────────────────────────────────
mileagePerMile:   0.90,   // £ per charged mile
twoManSurcharge:  20,     // £ added if two-person team requested
stairsPerFloor:   5,      // £ per floor at pickup + drop-off

// ── Base call-out fees by job type ────────────────────────────
baseFees: {
default:          40,   // fallback for most job types
move:             50,   // house moves
shopBefore22:     25,   // emergency shop run before 10pm
shopAfter22:      40,   // emergency shop run after 10pm
ikeaCollect:      45,   // IKEA collect only
ikeaCollectBuild: 55,   // IKEA collect + build
flatpack:         40,   // flat pack build only
},

// ── Quote range (±% either side of calculated total) ─────────
// e.g. 0.15 = quote shown as £85–£115 on a £100 job
rangePct: {
tip:      0.15,
move:     0.12,
fb:       0.12,
shop:     0.10,
student:  0.12,
business: 0.15,
other:    0.15,
ikea:     0.12,
flatpack: 0.12,
},

// ── Minimum charges per job type (leave blank or 0 to disable) ─
minByType: {
tip: “”, move: “”, fb: “”, shop: “”,
student: “”, business: “”, other: “”, ikea: “”, flatpack: “”
},

// ── House move labour ─────────────────────────────────────────
HOURLY_RATE_MOVE: 50,     // £/hr for move labour
LUTON_HIRE_COST:  175,    // £/day default Luton van hire

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
disposalMinPct: 0.25,     // 25% of published rate (minimum load)
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
ikeaLaborPerHour:    35,   // £/hr when useTimePricing is true
ikeaAssemblyPerItem: 25,   // £/item when useTimePricing is false

};