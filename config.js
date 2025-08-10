// Ben’s Humpin’ & Dumpin’ — Pricing Config
// Edit this file to update base fees, rates, disposal fees, etc.

window.BHD_CONFIG = {
  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, Ely Road, Waterbeach, Cambridge CB25 9PG",

  minTotal: 55,

  rates: {
    baseFeeDefault: 25,
    baseFeeMove: 50,
    mileagePerMile: 0.35,
    twoMan: 20,
    stairsPerFloor: 5,
    disposal: {
      mixed:    { ratePerTonne: 150, minFee: 40 },
      inert:    { ratePerTonne: 25,  minFee: 20 },
      wood:     { ratePerTonne: 75,  minFee: 20 },
      green:    { ratePerTonne: 30,  minFee: 20 },
      plaster:  { ratePerTonne: 130, minFee: 40 },
      mattress: { each: 20 },
      tyre:     { each: 6 }
    }
  },

  // Price range % for each job type
  rangePct: {
    tip: 0.15,
    business: 0.15,
    other: 0.15,
    move: 0.12,
    fb: 0.12,
    student: 0.12,
    shop: 0.10
  },

  // WhatsApp target number (no +, spaces or leading zero)
  whatsappNumber: "447717463496"
};