// r100 — external config only
window.BHD_CONFIG = {
  version: "r100",
  whatsappNumber: "447717463496",

  // Pricing knobs
  mileagePerMile: 0.90,
  twoManSurcharge: 20,
  stairsPerFloor: 5,

  // Per‑type price range width (±%)
  rangePct: {
    tip: 0.15, move: 0.12, fb: 0.12, shop: 0.10, student: 0.12, business: 0.15, other: 0.15, ikea: 0.12
  },

  // Optional minimums (blank or 0 disables)
  minByType: { tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:"" },

  // Base fees
  baseFees: {
    default: 40,
    move: 50,
    shopBefore22: 25,
    shopAfter22: 40,
    ikeaCollect: 45,
    ikeaCollectBuild: 55
  },

  // Waterbeach published rates (you can expand)
  disposalMinPct: 0.25,
  disposal: {
    general: { label: "General Waste", ratePerTonne: 192.50 },
    wood:    { label: "Wood",          ratePerTonne: 124.00 },
    green:   { label: "Green Waste",   ratePerTonne: 69.00  },
    soil:    { label: "Soil/Hardcore", ratePerTonne: 31.00  },
    metal:   { label: "Metal",         ratePerTonne: 0.00   }
  },

  // IKEA helpers
  ikeaAssemblyPerItem: 35,
  ikeaStores: [
    { name: "IKEA Milton Keynes", address: "Geldered Close, Bletchley, Milton Keynes" },
    { name: "IKEA Peterborough Click & Collect", address: "Boongate, Peterborough" }
  ],
  ikeaItems: [
    { name: "Billy bookcase", qty: 1 },
    { name: "Malm drawers",  qty: 1 }
  ]
};
