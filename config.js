// Ben’s Humpin’ & Dumpin’ — Pricing Config (r33)

window.BHD_CONFIG = {
  version: "r33",

  // Addresses
  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, Ely Road, Waterbeach, Cambridge CB25 9PG",

  // WhatsApp number (no +, no leading 0)
  whatsappNumber: "447717463496",

  // Per-job-type minimums (blank = no minimum)
  minByType: {
    tip: "", move: "", fb: "", shop: "",
    student: "", business: "", other: "", ikea: ""
  },

  // Price ranges (±%)
  rangePct: {
    tip: 0.15, business: 0.15, other: 0.15,
    move: 0.12, fb: 0.12, student: 0.12,
    shop: 0.10, ikea: 0.12
  },

  // Base fees
  baseFees: {
    default: 35,
    move: 50,
    shopBefore22: 25,
    shopAfter22: 40,
    ikeaCollect: 45,
    ikeaCollectBuild: 55
  },

  // Mileage & surcharges
  mileagePerMile: 0.40,
  twoManSurcharge: 20,
  stairsPerFloor: 5,

  // Disposal (tip runs)
  disposal: {
    mixed:    { ratePerTonne: 150, minFee: 40 },
    inert:    { ratePerTonne: 25,  minFee: 20 },
    wood:     { ratePerTonne: 75,  minFee: 20 },
    green:    { ratePerTonne: 30,  minFee: 20 },
    plaster:  { ratePerTonne: 130, minFee: 40 },
    mattress: { each: 20 },
    tyre:     { each: 6 }
  },

  // IKEA build pricing
  ikeaAssemblyPerItem: 15,

  // IKEA stores
  ikeaStores: [
    { name: "IKEA Milton Keynes", address: "IKEA, 2 Grafton Gate, Milton Keynes MK9 1DL" },
    { name: "IKEA Lakeside (Thurrock)", address: "IKEA, Lakeside Retail Park, RM20 3WJ" },
    { name: "IKEA Wembley", address: "IKEA, 2 Drury Way, London NW10 0TH" },
    { name: "IKEA Tottenham", address: "IKEA, Glover Dr, London N18 3HF" },
    { name: "IKEA Greenwich", address: "IKEA, Bugsby’s Way, London SE10 0QJ" }
  ],

  // Quick-pick IKEA items
  ikeaItems: [
    { name: "Billy bookcase", qty: 1 },
    { name: "Kallax shelving unit", qty: 1 },
    { name: "Malm chest of drawers", qty: 1 },
    { name: "Pax wardrobe", qty: 1 },
    { name: "Hemnes bedside table", qty: 2 },
    { name: "Poäng armchair", qty: 1 },
    { name: "Lack coffee table", qty: 1 }
  ],

  // UI
  ui: {
    showShopNoMinNote: true,
    splashMs: 4000
  }
};