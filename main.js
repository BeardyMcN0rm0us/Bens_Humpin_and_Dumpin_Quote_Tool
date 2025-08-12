// r312 — Assembly pricing method switchable, IKEA item visibility controlled

window.BHD = Object.assign({
  version: "r312",
  whatsappNumber: "447717463496",
  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",
  mileagePerMile: 0.40,
  twoManSurcharge: 20,
  stairsPerFloor: 5,
  baseFees:{ default:35, move:50, shopBefore22:25, shopAfter22:40, ikeaCollect:45, ikeaCollectBuild:55 },
  minByType:{ tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:"" },
  rangePct:{ tip:0.15, move:0.12, fb:0.12, shop:0.10, student:0.12, business:0.15, other:0.15, ikea:0.12 },
  disposalMinPct:0.25,
  disposal:{ /* ... same as before ... */ },
  ikeaAssemblyPerItem: 15,      // Default price if time-based disabled or no item chosen
  ikeaLaborPerMinute: 0.60,     // Default £/minute for time-based assembly
  useTimePricing: true          // Set to false to always use per-item charge
}, window.BHD||{});

(function(){
  const $=id=>document.getElementById(id);
  const show=el=>{ if(el){ el.hidden=false; el.classList.remove('hidden'); el.style.display=''; } };
  const hide=el=>{ if(el){ el.hidden=true; el.classList.add('hidden'); el.style.display='none'; } };
  const round5=v=>Math.round(v/5)*5;
  const quoteId = () =>{
    const n=new Date(), z=v=>String(v).padStart(2,"0");
    return `ID${n.getFullYear()}${z(n.getMonth()+1)}${z(n.getDate())}-${z(n.getHours())}${z(n.getMinutes())}${z(n.getSeconds())}`;
  };
  const CFG = window.BHD;

  // Cache DOM elements (same IDs as your index.html)
  const els = {
    jobType:$('jobType'),
    ikeaMode:$('ikeaMode'),
    ikeaItemWrap:$('ikeaItemWrap'),
    ikeaItem:$('ikeaItem'),
    ikeaTimeHint:$('ikeaTimeHint'),
    ikeaQty:$('ikeaQty'),
    // ... other fields as before ...
    btnCalc:$('btnCalc'),
    breakdown:$('breakdown'),
    total:$('total'),
    quoteId:$('quoteId'),
    btnWA:$('btnWhatsApp'),
    routeHint:$('routeHint'),
    addrPickup:$('addrPickup'),
    addrDrop:$('addrDrop'),
    wasteType:$('wasteType'),
    shopTime:$('shopTime'),
    twoMan:$('twoMan'),
    stairsPickup:$('stairsPickup'),
    stairsDrop:$('stairsDrop')
  };

  // Show/hide logic
  function updateUI() {
    const jt = els.jobType?.value || "";
    // Only show item dropdown when "ikea" and "collectBuild"
    if(jt === 'ikea' && els.ikeaMode?.value === 'collectBuild') {
      show(els.ikeaItemWrap);
    } else {
      hide(els.ikeaItemWrap);
    }
    // ... (keep rest of UI logic identical to r311's setUI)
  }

  // Update time hint if item or quantity changes
  function updateIkeaTimeHint() {
    const perMin = parseFloat(els.ikeaItem?.value || 0) || 0;
    const qty = Math.max(1, parseInt(els.ikeaQty?.value||"1")||1);
    const total = perMin * qty;
    els.ikeaTimeHint.textContent = perMin ? `Est. build: ~${total} min (${qty} × ${perMin})` : "";
  }

  // Pricing logic including time vs item flag
  function calculateQuote(base, mileageCost, stairsCost, twoManCost, disposalFee) {
    let assembly = 0, timeHint = "";
    if (els.jobType?.value === "ikea" && els.ikeaMode?.value === "collectBuild") {
      const qty = Math.max(1, parseInt(els.ikeaQty?.value||"1")||1);
      const perItem = CFG.ikeaAssemblyPerItem;
      if (CFG.useTimePricing && els.ikeaItem?.value) {
        const perMin = parseFloat(els.ikeaItem.value);
        const totalMin = perMin * qty;
        assembly = totalMin * CFG.ikeaLaborPerMinute;
        timeHint = ` (~${totalMin} min @ £${CFG.ikeaLaborPerMinute.toFixed(2)}/min)`;
      } else {
        assembly = perItem * qty;
        timeHint = ` (${qty} × £${perItem.toFixed(2)}/item)`;
      }
    }
    return { assembly, timeHint };
  }

  // Hook it up: Redraw UI & hint
  ['change','input'].forEach(ev=>{
    els.jobType?.addEventListener(ev, updateUI);
    els.ikeaMode?.addEventListener(ev, () => { updateUI(); updateIkeaTimeHint(); });
    els.ikeaItem?.addEventListener(ev, updateIkeaTimeHint);
    els.ikeaQty?.addEventListener(ev, updateIkeaTimeHint);
  });

  // On calculate: full quote logic with assembly pricing switch
  els.btnCalc?.addEventListener('click', ()=>{
    // placeholder getMiles equivalent: assume miles = 10 for example
    const miles = /* call your getMiles or stub here */ 10;
    const base = baseFeeFor(els.jobType.value);
    const mileageCost = miles * CFG.mileagePerMile;
    // assume twoMan, stairs, disposal computed already...
    const stairsCost = 0, twoManCost = 0, disposalFee = 0;
    const { assembly, timeHint } = calculateQuote(base, mileageCost, stairsCost, twoManCost, disposalFee);

    // Build lines
    const lines = [
      `Base: £${base.toFixed(2)}`,
      `Mileage: £${mileageCost.toFixed(2)}`
    ];
    if (assembly) lines.push(`Assembly: £${assembly.toFixed(2)}${timeHint}`);
    const total = base + mileageCost + assembly + stairsCost + twoManCost + disposalFee;
    const low = round5(total * (1 - CFG.rangePct.ikea)),
          high = round5(total * (1 + CFG.rangePct.ikea));

    els.breakdown.innerHTML = '• ' + lines.join('<br>• ');
    els.total.textContent = `Estimated: £${low}–£${high}`;
    els.total.classList.add('show');
    els.quoteId.textContent = "Quote ID — " + quoteId();
    els.btnWA?.removeAttribute('hidden');
  });

  // Initial load
  updateUI();
  updateIkeaTimeHint();
})();