// ═══════════════════════════════════════════════════════════════
//  Ben's Humpin' & Dumpin' — Pricing Config
//  Edit values here. This file loads before main.js so anything
//  you set below will override the defaults in main.js.
// ═══════════════════════════════════════════════════════════════

window.BHD = {

// ── Feature flags ─────────────────────────────────────────────
// Set quotesBookings to false to disable Save quote / Book this job
// and hide the Saved quotes / My bookings chips. Inbound deeplinks
// (?bhd=...) are also ignored. Use this as a kill switch if the
// feature misbehaves in production — no redeploy of code needed.
features: {
  quotesBookings: false,
},

// ── Mileage & surcharges ──────────────────────────────────────
mileagePerMile:   0.50,   // £ per charged mile
twoManSurcharge:  20,     // £ added if two-person team requested
stairsPerFloor:   5,      // £ per floor at pickup + drop-off
gardenMileagePerMile:   0.00,   // £ per charged mile for gardening work


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
    tip:0.05, 
    move:0.05, 
    fb:0.05, 
    shop:0.15, 
    student:0.15, 
    business:0.05, 
    other:0.00, 
    ikea:0.05, 
    flatpack:0.05, 
    hay:0.00, 
    bags:0.00 },

// ── Minimum charges per job type (leave blank or 0 to disable) ─
minByType: {
tip: "", move: "", fb: "", shop: "",
student: "", business: "", other: "", ikea: "", flatpack: ""
},

// ── House move labour ─────────────────────────────────────────
HOURLY_RATE_MOVE: 25,     // £/hr for move labour
LUTON_HIRE_COST:  450,    // £/day default Luton van hire

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
general:   { label: "General Waste",              ratePerTonne: 192.50 },
soil:      { label: "Soil / Inert",               ratePerTonne:  69.75 },
hardcore:  { label: "Hardcore",                   ratePerTonne:  25.75 },
plaster:   { label: "Plasterboard",               ratePerTonne: 105.00 },
wood:      { label: "Mixed Wood",                 ratePerTonne:  91.00 },
mdf:       { label: "MDF",                        ratePerTonne: 175.00 },
metal:     { label: "Metals",                     ratePerTonne:  27.00 },
plastics:  { label: "Rigid / Agricultural Plastics", ratePerTonne: 186.23 },
green:     { label: "Green Material",             ratePerTonne:  90.00 },
cardboard: { label: "Cardboard (clean)",          ratePerTonne:  25.00 },
dmr:       { label: "Dry Mixed Recycling",        ratePerTonne: 145.00 },
wuds:      { label: "WUDs & POPs",                ratePerTonne: 345.00 },
},

// ── IKEA / flat pack assembly ─────────────────────────────────
useTimePricing:      true, // true = price by time, false = price per item
ikeaLaborPerHour:    25,   // £/hr when useTimePricing is true
ikeaAssemblyPerItem: 40,   // £/item when useTimePricing is false

// ── Gardening ─────────────────────────────────────────────────
gardenSoloPerHour:    17.50,  // £/hr — Ben solo
gardenTwoPerBlock:    50.00,  // £ per 2-hour block — Ben + Helper
gardenThreePerHour:  40.00,
gardenBlockHours:     2,      // hours per block (two-person pricing)

// ── Gardening — weed killer surcharge ────────────────────────
// Added on top of labour when "Weed killing" is selected as a task.
// Set the cost per garden size below (£).
gardenWeedKillingCost: {
  small:  5,   // £ — small garden
  medium: 10,   // £ — medium garden
  large:  15,   // £ — large garden
  xl:     20,   // £ — XL garden
},

// ── Gardening discounts ───────────────────────────────────────
// Pensioner or Neighbour discount — only ONE may apply per booking.
// Ongoing loyalty discount is separate and automatic.
gardenPensionerDiscountPct:    10,   // % off for pensioner discount

// Neighbour discount: £ off per address — configurable per team size.
// Up to 2 neighbour addresses can be entered; the rate below applies to each.
gardenNeighbourDiscountSolo:    5,   // £ flat off when a neighbour also books (per property)
gardenNeighbourDiscountTwoMan:  5,   // (legacy — flat rate above is used regardless of team)
gardenNeighbourStackPct:       50,   // % of neighbour discount that stacks on top of the weekly loyalty discount (only weekly stacks)

// Ongoing loyalty discount: % off, applied automatically when "Ongoing" is selected.
// Set a different % for each booking frequency.
gardenOngoingDiscountPct: {
  weekly:      10,    // % off — weekly bookings
  fortnightly:  7.5,  // % off — fortnightly bookings
  monthly:      5,    // % off — monthly bookings
},

// ── Bicycle Servicing ─────────────────────────────────────────
// Pricing mode: 'job' = fixed price per job/package | 'hourly' = hours × bikeLabourPerHour
bikePricingMode: 'job',
bikeLabourPerHour: 25.00,   // £/hr — used when bikePricingMode is 'hourly'

// Service packages — price (job mode) & hours (hourly mode)
// Service packages — price (job mode) & hours (hourly mode)
bikePackages: {
  basic:    { label: 'Basic Tune-Up',    price: 20,  hours: 1.0 },  
  // brakes, gears, chain lube, bolt check

  standard: { label: 'Standard Service', price: 40,  hours: 2.0 },  
  // tune-up + drivetrain clean + minor wheel true

  overhaul: { label: 'Full Service',     price: 75,  hours: 3.5 },  
  // deep clean, cables checked/replaced if needed, bearings checked
},

// Individual service labour — simplified & more competitive
bikeLabour: {
  punctureRepair:   5,     // keep this cheap — gets people in
  brakeAdjust:      8,     // per brake
  gearAdjust:       10,    // full indexing
  chainLube:        5,
  safetyCheck:      8,

  tubeReplace:      5,     // this should feel like a no-brainer
  tyreReplace:      6,

  brakeCable:       10,    // include fitting complexity
  brakePads:        8,
  gearCable:        10,

  chainReplace:     8,
  cassetteReplace:  15,

  wheelTrue:        10,    // lower entry price = more uptake

  barTape:          10,
  grips:            5,
  pedalReplace:     8,

  bottomBracket:    20,
  headset:          15,
},

// Parts prices — FIXED to be believable (this was your biggest issue)
bikeParts: {
  innerTubeStandard:     8,    // was 15 — too high
  innerTubeSpecialist:   10,

  tyreBasicRoad:         15,
  tyreBasicMtb:          18,
  tyreMidRange:          28,

  brakePadsRim:          8,
  brakePadsDiscCable:    10,
  brakePadsHydraulic:    12,

  brakeCable:            6,
  gearCable:             6,

  chain8spd:             12,
  chain10spd:            15,
  chain11spd:            22,
  chain12spd:            30,

  cassette8spd:          15,
  cassette10spd:         22,
  cassette12spd:         40,

  barTape:               10,
  grips:                 10,

  pedalsFlat:            18,
  pedalsClipless:        30,

  bottomBracket:         20,
},

// Collection & return service
// Mode: 'flat' = fixed fee regardless of distance | 'mileage' = per mile (Google Maps)
bikeCollectionMode:     'flat',  // 'flat' | 'mileage'
bikeCollectionFlatFee:   5,      // £ flat collect & return fee
bikeCollectionPerMile:   0.50,   // £/mile if using mileage mode
bikeCollectionWaivedAbove: 60,   // waive collection fee if labour+parts total >= this

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
