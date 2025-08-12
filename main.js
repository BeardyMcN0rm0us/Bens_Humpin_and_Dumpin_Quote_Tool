// ================== SETTINGS ==================
window.BHD = Object.assign({
  version: "r307",
  whatsappNumber: "447717463496",
  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",
  mileagePerMile: 0.40, twoManSurcharge: 20, stairsPerFloor: 5,
  baseFees:{default:35,move:50,shopBefore22:25,shopAfter22:40,ikeaCollect:45,ikeaCollectBuild:55},
  minByType:{tip:"",move:"",fb:"",shop:"",student:"",business:"",other:"",ikea:""},
  rangePct:{tip:0.15,move:0.12,fb:0.12,shop:0.10,student:0.12,business:0.15,other:0.15,ikea:0.12},
  disposalMinPct:0.25,
  disposal:{
    general:{label:"General Waste",ratePerTonne:192.50},
    soil:{label:"Soil/Inert",ratePerTonne:69.75},
    hardcore:{label:"Hardcore",ratePerTonne:25.75},
    plaster:{label:"Plasterboard",ratePerTonne:105.00},
    wood:{label:"Mixed Wood",ratePerTonne:91.00},
    mdf:{label:"MDF",ratePerTonne:175.00},
    metal:{label:"Metals",ratePerTonne:27.00},
    plastics:{label:"Rigid/Agricultural Plastics",ratePerTonne:186.23},
    green:{label:"Green material",ratePerTonne:90.00},
    cardboard:{label:"Cardboard (clean)",ratePerTonne:25.00},
    dmr:{label:"Dry Mixed Recycling",ratePerTonne:145.00},
    wuds:{label:"WUDs & POPs",ratePerTonne:345.00}
  },
  ikeaAssemblyPerItem:15,
  ikeaStores:[
    {name:"IKEA Milton Keynes",address:"Geldered Close, Bletchley, Milton Keynes"},
    {name:"IKEA Peterborough Click & Collect",address:"Boongate, Peterborough"}
  ]
}, window.BHD||{});
// ==============================================

(function(){
  const CFG = window.BHD;
  const dbg = document.getElementById('dbg');
  const say = t => { if(dbg) dbg.textContent = t; console.log('[r307]', t); };

  const $ = id => document.getElementById(id);
  const show = el => { if(!el) return; el.hidden=false; el.classList.remove('hidden'); el.style.display=''; };
  const hide = el => { if(!el) return; el.hidden=true; el.classList.add('hidden'); el.style.display='none'; };

  // Build simple field block if missing
  function ensureBlock(id, html){
    if ($(id)) return $(id);
    const anchor = $('#jobType');
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.id = id;
    wrap.style.display = 'none';
    wrap.hidden = true;
    wrap.innerHTML = html;
    if (anchor && anchor.parentElement) {
      // insert after the jobType's card container
      let card = anchor.closest('.card') || anchor.parentElement;
      card.parentElement.insertBefore(wrap, card.nextSibling);
    } else {
      document.body.appendChild(wrap);
    }
    return wrap;
  }

  // Create any missing core sections so UI can toggle
  function scaffoldMissing(){
    const blocks = [
      ['pickupField', `<label for="addrPickup">Collection address</label><input id="addrPickup" type="text" placeholder="Start typing…">`],
      ['addrDropWrap', `<label for="addrDrop">Delivery address / destination</label><input id="addrDrop" type="text" placeholder="Start typing…">`],
      ['wasteWrap', `<label for="wasteType">Waste type (Tip runs)</label><select id="wasteType"></select><div class="hint">We use the minimum disposal fee (25% of the published £/tonne).</div>`],
      ['twoManWrap', `<label for="twoMan">Two‑person team?</label><select id="twoMan"><option value="no">No</option><option value="yes">Yes</option></select>`],
      ['stairsWrap', `<div class="grid2"><div><label for="stairsPickup">Stairs at pickup (floors)</label><input id="stairsPickup" type="number" min="0" step="1" value="0"></div><div><label for="stairsDrop">Stairs at drop‑off (floors)</label><input id="stairsDrop" type="number" min="0" step="1" value="0"></div></div>`],
      ['shopTimeWrap', `<label for="shopTime">Run time (for shop runs)</label><select id="shopTime"><option value="before22" selected>Before 10pm</option><option value="after22">After 10pm</option></select>`],
      ['ikeaModeWrap', `<label for="ikeaMode">IKEA service</label><select id="ikeaMode"><option value="collect" selected>Collect Only</option><option value="collectBuild">Collect & Build</option></select>`],
      ['ikeaStoreWrap', `<label for="ikeaStore">IKEA store</label><select id="ikeaStore"></select>`],
      ['ikeaQtyWrap', `<label for="ikeaQty">How many items to build?</label><input id="ikeaQty" type="number" min="1" step="1" value="1">`],
      ['descWrap', `<label for="jobDesc">What is it? (Describe the job)</label><textarea id="jobDesc" placeholder="e.g., sofa + access notes…"></textarea>`],
      ['routeHint', `<div class="hint">Choose a job type to start.</div>`],
      ['btnCalc', `<button class="btn secondary" type="button" id="btnCalc">Calculate Quote</button>`],
      ['breakdown', `<div class="hint" id="breakdown" style="margin-top:6px"></div>`],
      ['total', `<div class="total" id="total">Estimated: £0–£0</div>`],
      ['quoteId', `<div class="hint" id="quoteId">Quote ID — (after send)</div>`],
      ['btnWhatsApp', `<button class="btn primary" type="button" id="btnWhatsApp" style="display:none">Send to WhatsApp</button>`]
    ];
    const missing = [];
    blocks.forEach(([id, html])=>{
      if (!$(id)) { ensureBlock(id, html); missing.push(id); }
    });
    // populate waste types if we just created the select
    const wasteSel = $('#wasteType');
    if (wasteSel && wasteSel.options.length===0 && CFG.disposal){
      Object.keys(CFG.disposal).forEach(k=>{
        const it=CFG.disposal[k]; const o=document.createElement('option');
        o.value=k; o.textContent=`${it.label} (£${Number(it.ratePerTonne||0).toFixed(2)}/t)`; wasteSel.appendChild(o);
      });
    }
    // ikea store list
    const ikeaSel = $('#ikeaStore');
    if (ikeaSel && ikeaSel.options.length===0){
      const ph=document.createElement('option'); ph.value=""; ph.textContent="Select IKEA store…"; ph.disabled=true; ph.selected=true;
      ikeaSel.appendChild(ph);
      (CFG.ikeaStores||[]).forEach(st=>{ const o=document.createElement('option'); o.value=st.address; o.textContent=st.name; ikeaSel.appendChild(o); });
    }
    return missing;
  }

  function cacheEls(){
    return {
      jobType:$('#jobType'),
      ikeaModeWrap:$('#ikeaModeWrap'), ikeaMode:$('#ikeaMode'),
      ikeaStoreWrap:$('#ikeaStoreWrap'), ikeaStore:$('#ikeaStore'),
      pickupField:$('#pickupField'), addrPickup:$('#addrPickup'),
      addrDropWrap:$('#addrDropWrap'), addrDrop:$('#addrDrop'),
      shopTimeWrap:$('#shopTimeWrap'), shopTime:$('#shopTime'),
      ikeaQtyWrap:$('#ikeaQtyWrap'), ikeaQty:$('#ikeaQty'),
      twoManWrap:$('#twoManWrap'), twoMan:$('#twoMan'),
      stairsWrap:$('#stairsWrap'), stairsPickup:$('#stairsPickup'), stairsDrop:$('#stairsDrop'),
      wasteWrap:$('#wasteWrap'), wasteType:$('#wasteType'),
      descWrap:$('#descWrap'), jobDesc:$('#jobDesc'),
      btnCalc:$('#btnCalc'), routeHint:$('#routeHint'),
      breakdown:$('#breakdown'), total:$('#total'),
      quoteId:$('#quoteId'), btnWA:$('#btnWhatsApp'),
      buildTag:$('#buildTag')
    };
  }

  // UI toggle
  function setJobTypeUI(els){
    const jt = (els.jobType && els.jobType.value) || "";
    [els.pickupField,els.addrDropWrap,els.wasteWrap,els.twoManWrap,els.stairsWrap,els.descWrap,els.shopTimeWrap,els.ikeaModeWrap,els.ikeaStoreWrap,els.ikeaQtyWrap].forEach(hide);
    if(!jt){ if(els.routeHint) els.routeHint.textContent="Choose a job type to start."; say('ready — choose'); return; }

    show(els.pickupField);
    if(jt==="tip"){
      show(els.wasteWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Collection → Waterbeach (with >50mi rule).";
    } else if (jt==="move"||jt==="fb"||jt==="student"){
      show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    } else if (jt==="shop"){
      show(els.addrDropWrap); show(els.shopTimeWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Shop → Delivery.";
    } else if (jt==="ikea"){
      show(els.ikeaModeWrap); show(els.ikeaStoreWrap); show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
      if(els.ikeaMode && els.ikeaMode.value==="collectBuild") show(els.ikeaQtyWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → IKEA → Delivery.";
    } else {
      show(els.addrDropWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    }
    say('jobType → '+jt);
  }

  // Start
  const missing = scaffoldMissing();
  let els = cacheEls();
  if (els.buildTag) els.buildTag.textContent = 'Build ' + CFG.version;
  if (missing.length){ say('ready — created: ' + missing.join(', ')); } else { say('ready'); }

  // bind
  if (els.ikeaStore && els.addrPickup) els.ikeaStore.addEventListener('change', ()=>{ els.addrPickup.value = els.ikeaStore.value; });
  if (els.jobType) ['change','input','click'].forEach(ev=>els.jobType.addEventListener(ev, ()=>setJobTypeUI(els)));
  if (els.ikeaMode) ['change','input','click'].forEach(ev=>els.ikeaMode.addEventListener(ev, ()=>setJobTypeUI(els)));

  // first paint
  setJobTypeUI(els);

  // minimal calculate & WhatsApp wired (kept from previous builds)
  const pctFor = jt => (CFG.rangePct && CFG.rangePct[jt] != null) ? Number(CFG.rangePct[jt]) : 0.12;
  const minFor = jt => { const v=(CFG.minByType||{})[jt]; return (v===""||v==null)?0:Math.max(0,Number(v)); };
  function baseFeeFor(jt){
    if(jt==="move") return Number(CFG.baseFees.move||CFG.baseFees.default||0);
    if(jt==="shop") return (els.shopTime && els.shopTime.value==="after22") ? Number(CFG.baseFees.shopAfter22||CFG.baseFees.default||0) : Number(CFG.baseFees.shopBefore22||CFG.baseFees.default||0);
    if(jt==="ikea") return (els.ikeaMode && els.ikeaMode.value==="collectBuild") ? Number(CFG.baseFees.ikeaCollectBuild||CFG.baseFees.default||0) : Number(CFG.baseFees.ikeaCollect||CFG.baseFees.default||0);
    return Number(CFG.baseFees.default||0);
  }
  function calculate(miles){
    const jt = (els.jobType && els.jobType.value) || "";
    if(!jt) return;
    const base = baseFeeFor(jt);
    const mileageCost = (miles||0) * Number(CFG.mileagePerMile||0);
    const twoMan = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other") ? 0 : ((els.twoMan && els.twoMan.value==="yes") ? Number(CFG.twoManSurcharge||0):0);
    const stairs = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other") ? 0 : (((+(els.stairsPickup&&els.stairsPickup.value)||0)+ (+(els.stairsDrop&&els.stairsDrop.value)||0))*Number(CFG.stairsPerFloor||0));
    const disp = (jt==="tip" && els.wasteType) ? (()=>{
      const key=els.wasteType.value, item=CFG.disposal[key]||{};
      const minFee = Number(item.ratePerTonne||0) * Number(CFG.disposalMinPct||0.25);
      return {fee:minFee, detail:`Minimum disposal for ${item.label||key}`};
    })() : {fee:0,detail:""};

    let total = base + mileageCost + stairs + twoMan + disp.fee;
    const MIN = minFor(jt); if (MIN>0 && total<MIN){ total=MIN; }
    const pct = pctFor(jt), low=Math.round(total*(1-pct)/5)*5, high=Math.round(total*(1+pct)/5)*5;

    const lines=[`Base: £${base.toFixed(2)}`, `Mileage: £${mileageCost.toFixed(2)}`];
    if(stairs) lines.push(`Stairs: £${stairs.toFixed(2)}`);
    if(twoMan) lines.push(`Two-person: £${twoMan.toFixed(2)}`);
    if(disp.fee) lines.push(`Disposal: £${disp.fee.toFixed(2)} — ${disp.detail}`);

    if(els.breakdown) els.breakdown.innerHTML = '• ' + lines.join('<br>• ');
    if(els.total){ els.total.textContent = `Estimated: £${low}–£${high}`; els.total.classList.add('show'); }
    if(els.quoteId) els.quoteId.textContent = "Quote ID — " + (new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14));
    if(els.btnWA){ els.btnWA.style.display=''; els.btnWA.hidden=false; }
  }

  function sendWhatsApp(){
    const jt = (els.jobType && els.jobType.value) || "";
    const id = (els.quoteId && els.quoteId.textContent || "").replace("Quote ID — ","").trim();
    const lines = (els.breakdown && els.breakdown.innerText || '').split('• ').filter(Boolean);
    const msg = [
      "Hey Ben! I need something Humpin' & Dumpin'",
      "Quote ID: "+id,
      "Job Type: "+(jt || "N/A"),
      "Collection: "+((els.addrPickup && els.addrPickup.value) || "N/A"),
      (jt==="tip" ? "Destination: Waterbeach Waste Management Park" : "Delivery: "+((els.addrDrop && els.addrDrop.value)||"N/A")),
      (lines.length ? "\nBreakdown:\n- "+lines.join("\n- ") : ""),
      (els.total && els.total.textContent || "")
    ].join("\n");
    window.open("https://wa.me/"+CFG.whatsappNumber+"?text="+encodeURIComponent(msg),'_blank');
  }

  if ($('#btnCalc')) $('#btnCalc').addEventListener('click', ()=>calculate(0)); // simple calc without maps for now
  if ($('#btnWhatsApp')) $('#btnWhatsApp').addEventListener('click', sendWhatsApp);

  // Done
})();