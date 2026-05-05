// ═══════════════════════════════════════════════════════════════
//  Ben's Humpin' & Dumpin' — Pricing Config
//  Edit values here. This file loads before main.js so anything
//  you set below will override the defaults in main.js.
// ═══════════════════════════════════════════════════════════════

window.BHD = {

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
gardenNeighbourDiscountSolo:    5,   // £ off per address — solo (Ben only)
gardenNeighbourDiscountTwoMan: 5,   // £ off per address — 2-man team

// Ongoing loyalty discount: % off, applied automatically when "Ongoing" is selected.
// Set a different % for each booking frequency.
gardenOngoingDiscountPct: {
  weekly:      15,   // % off — weekly bookings
  fortnightly: 10,   // % off — fortnightly bookings
  monthly:      5,   // % off — monthly bookings
},

// ── Bicycle Servicing ─────────────────────────────────────────
// Pricing mode: 'job' = fixed price per job/package | 'hourly' = hours × bikeLabourPerHour
bikePricingMode: 'job',
bikeLabourPerHour: 22.50,   // £/hr — used when bikePricingMode is 'hourly'

// Service packages — price (job mode) & hours (hourly mode)
bikePackages: {
  basic:    { label: 'Basic Tune-Up',    price: 30,  hours: 1.0 },  // safety check, brakes, gears, lube
  standard: { label: 'Standard Service', price: 55,  hours: 2.0 },  // tune-up + degrease, cables checked, wheels trued
  overhaul: { label: 'Full Overhaul',    price: 95,  hours: 3.5 },  // strip-down, all cables replaced, bearings re-greased
},

// Individual service labour — flat per-job prices (or set bikePricingMode to 'hourly')
bikeLabour: {
  punctureRepair:  5,   // patch or prep on the bike
  brakeAdjust:      10,   // per brake (front or rear)
  gearAdjust:      15,   // front + rear indexing
  chainLube:        5,   // clean & lube
  safetyCheck:     10,   // full pre-ride safety check
  tubeReplace:     7.50,   // remove tyre, fit tube, refit — per tube
  tyreReplace:     7.50,   // per tyre (tube extra if also replaced)
  brakeCable:      7.50,   // per cable — parts extra
  brakePads:        10,   // per set — parts extra
  gearCable:       7.50,   // rear derailleur cable — parts extra
  chainReplace:    10,   // remove & fit chain — parts extra
  cassetteReplace: 22,   // remove wheel, swap cassette, refit — parts extra
  wheelTrue:       15,   // per wheel
  barTape:         7.50,   // full rewrap, drop bars — parts extra
  grips:            7.50,   // swap grips, flat bars — parts extra
  pedalReplace:     10,   // per pair — parts extra
  bottomBracket:   22,   // remove, service or replace, refit — parts extra
  headset:         17,   // clean & re-grease headset bearings
},

// Parts prices — Amazon cost + 15% handling
// Adjust these as prices change; they are added to labour unless customer supplies own parts
bikeParts: {
  innerTubeStandard:     15,   // 700c / 26" / 27.5" / standard sizes
  innerTubeSpecialist:   17,   // 29" MTB / unusual sizes
  tyreBasicRoad:        14,   // budget 700c road or hybrid
  tyreBasicMtb:         16,   // budget 26" / 27.5" / 29" MTB
  tyreMidRange:         26,   // mid-range road / hybrid / MTB
  brakePadsRim:          10,   // V-brake / caliper rim pads (per pair)
  brakePadsDiscCable:   12,   // mechanical disc pads (per pair)
  brakePadsHydraulic:   14,   // hydraulic disc pads (per pair)
  brakeCable:            8,   // brake inner cable (each)
  gearCable:             8,   // gear inner cable (each)
  chain8spd:            16,   // single speed – 8 speed chain
  chain10spd:           18,   // 9–10 speed chain
  chain11spd:           26,   // 11 speed chain
  chain12spd:           35,   // 12 speed chain
  cassette8spd:         17,   // 6–8 speed cassette or freewheel
  cassette10spd:        25,   // 9–10 speed cassette
  cassette12spd:        45,   // 11–12 speed cassette
  barTape:              12,   // handlebar tape (road / drop bars)
  grips:                 12,   // handlebar grips (MTB / hybrid)
  pedalsFlat:           20,   // flat / platform pedals (pair)
  pedalsClipless:       36,   // clipless pedals (pair)
  bottomBracket:        25,   // threaded bottom bracket (most common)
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
