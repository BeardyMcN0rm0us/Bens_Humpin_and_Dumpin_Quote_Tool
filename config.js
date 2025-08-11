// Ben’s Humpin’ & Dumpin’ — Pricing Config (r22)
window.BHD_CONFIG = {
  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, Ely Road, Waterbeach, Cambridge CB25 9PG",

  minTotal: 55,

  rates: {
    baseFeeDefault: 25,
    baseFeeMove: 50,
    // Shop-run base fees by time
    baseFeeShopBefore22: 20,
    baseFeeShopAfter22: 30,

    mileagePerMile: 0.30,
    twoMan: 20,
    stairsPerFloor: 5,

    disposal: {
      mixed:    { ratePerTonne: 195, minFee: 50 },
      inert:    { ratePerTonne: 70,  minFee: 25 },
      wood:     { ratePerTonne: 175,  minFee: 45 },
      green:    { ratePerTonne: 90,  minFee: 25 },
      plaster:  { ratePerTonne: 110, minFee: 40 },
      mattress: { each: 20 },
      tyre:     { each: 6 }
    }
  },

  rangePct: {
    tip: 0.15,
    business: 0.15,
    other: 0.15,
    move: 0.12,
    fb: 0.12,
    student: 0.12,
    shop: 0.10
  },

  whatsappNumber: "447717463496"
};