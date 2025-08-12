// r310 — adds IKEA item presets + more stores + build-time hint

window.BHD = Object.assign({
  version: "r310",
  whatsappNumber: "447717463496",
  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",
  mileagePerMile: 0.40, twoManSurcharge: 20, stairsPerFloor: 5,

  baseFees:{ default:35, move:50, shopBefore22:25, shopAfter22:40, ikeaCollect:45, ikeaCollectBuild:55 },
  minByType:{ tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:"" },
  rangePct:{ tip:0.15, move:0.12, fb:0.12, shop:0.10, student:0.12, business:0.15, other:0.15, ikea:0.12 },

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

  // Assembly pricing
  ikeaAssemblyPerItem: 15,

  // Common items (approx build minutes per item)
  ikeaItems: [
    {name:"MALM Chest (6‑drawer)", minutes:90},
    {name:"PAX Wardrobe (2‑door basic)", minutes:120},
    {name:"HEMNES Chest (8‑drawer)", minutes:110},
    {name:"KALLAX Shelf Unit (5x5)", minutes:75},
    {name:"BILLY Bookcase (with doors)", minutes:60},
    {name:"BRIMNES Wardrobe (3‑door)", minutes:95},
    {name:"SONGESAND Bed Frame (double)", minutes:80},
    {name:"LACK TV Bench", minutes:35},
    {name:"PLATSA Wardrobe (simple)", minutes:85},
    {name:"LIATORP TV Unit", minutes:100}
  ],

  // Stores: your 2 + 5 nearest big options
  ikeaStores:[
    { name:"IKEA Milton Keynes", address:"Geldered Close, Bletchley, Milton Keynes" },
    { name:"IKEA Peterborough Click & Collect", address:"Boongate, Peterborough" },
    { name:"IKEA Tottenham", address:"Glover Dr, London N18 3HF" },
    { name:"IKEA Lakeside", address:"Lakeside Retail Park, Thurrock RM20 3WJ" },
    { name:"IKEA Wembley", address:"2 Drury Way, London NW10 0TH" },
    { name:"IKEA Norwich Order & Collection Point", address:"Sweet Briar Retail Park, Norwich" },
    { name:"IKEA Greenwich", address:"55-57 Bugsby’s Way, London SE10 0QJ" }
  ]
}, window.BHD||{});

(function(){
  const $=id=>document.getElementById(id);
  const show=el=>{if(!el)return; el.hidden=false; el.classList.remove('hidden'); el.style.display='';};
  const hide=el=>{if(!el)return; el.hidden=true; el.classList.add('hidden'); el.style.display='none';};
  const round5=v=>Math.round(v/5)*5;
  const metersToMiles=m=>m/1609.344;
  const legsMeters=legs=>legs.reduce((s,l)=>s+((l.distance&&l.distance.value)||0),0);
  const quoteId=()=>{const n=new Date(),p=v=>String(v).padStart(2,"0");return `ID${n.getFullYear()}${p(n.getMonth()+1)}${p(n.getDate())}-${p(n.getHours())}${p(n.getMinutes())}${p(n.getSeconds())}`;};
  const CFG=window.BHD;

  // scaffold any missing blocks (from r309)
  function ensure(id, htmlAfter){
    let el=$(id); if(el) return el;
    const anchor=$('jobType');
    const wrap=document.createElement('div'); wrap.id=id; wrap.className='card'; wrap.hidden=true; wrap.style.display='none';
    wrap.innerHTML=htmlAfter;
    const card=anchor?.closest('.card')||anchor?.parentElement||document.body;
    card.parentElement.insertBefore(wrap, card.nextSibling);
    return wrap;
  }
  function scaffold(){
    const jt=$('jobType'); if(!jt) return;
    // Existing sections (from previous build)...
    if(!$('pickupField'))  ensure('pickupField',  `<label for="addrPickup">Collection address</label><input id="addrPickup" type="text" placeholder="Start typing…">`);
    if(!$('addrDropWrap')) ensure('addrDropWrap', `<label for="addrDrop">Delivery address</label><input id="addrDrop" type="text" placeholder="Start typing…">`);
    if(!$('wasteWrap'))    ensure('wasteWrap',    `<label for="wasteType">Waste type (Tip runs)</label><select id="wasteType"></select><div class="hint">We use the minimum disposal fee (25% of £/t).</div>`);
    if(!$('twoManWrap'))   ensure('twoManWrap',   `<label for="twoMan">Two‑person team?</label><select id="twoMan"><option value="no">No</option><option value="yes">Yes</option></select>`);
    if(!$('stairsWrap'))   ensure('stairsWrap',   `<div class="grid2"><div><label for="stairsPickup">Stairs at pickup</label><input id="stairsPickup" type="number" value="0"></div><div><label for="stairsDrop">Stairs at drop‑off</label><input id="stairsDrop" type="number" value="0"></div></div>`);
    if(!$('shopTimeWrap')) ensure('shopTimeWrap', `<label for="shopTime">Run time</label><select id="shopTime"><option value="before22">Before 10pm</option><option value="after22">After 10pm</option></select>`);
    if(!$('ikeaModeWrap')) ensure('ikeaModeWrap', `<label for="ikeaMode">IKEA service</label><select id="ikeaMode"><option value="collect">Collect Only</option><option value="collectBuild">Collect & Build</option></select>`);
    if(!$('ikeaStoreWrap'))ensure('ikeaStoreWrap',`<label for="ikeaStore">IKEA store</label><select id="ikeaStore"></select>`);
    if(!$('ikeaQtyWrap'))  ensure('ikeaQtyWrap',  `<label for="ikeaQty">Items to build</label><input id="ikeaQty" type="number" value="1" min="1">`);
    if(!$('descWrap'))     ensure('descWrap',     `<label for="jobDesc">What is it?</label><textarea id="jobDesc" placeholder="Describe the job…"></textarea>`);
    if(!$('btnCalc'))      ensure('btnCalc',      `<button id="btnCalc" class="btn secondary" type="button">Calculate Quote</button>`);
    if(!$('routeHint'))    ensure('routeHint',    `<div id="routeHint" class="hint">Choose a job type to start.</div>`);
    if(!$('breakdown'))    ensure('breakdown',    `<div id="breakdown" class="hint" style="margin-top:6px"></div>`);
    if(!$('total'))        ensure('total',        `<div id="total" class="total">Estimated: £0–£0</div>`);
    if(!$('quoteId'))      ensure('quoteId',      `<div id="quoteId" class="hint">Quote ID — (after send)</div>`);
    if(!$('btnWhatsApp'))  ensure('btnWhatsApp',  `<button id="btnWhatsApp" class="btn primary" type="button" style="display:none">Send to WhatsApp</button>`);
    // NEW: ikea preset UI
    if(!$('ikeaItemWrap')) ensure('ikeaItemWrap', `<label for="ikeaItem">Common IKEA item (optional)</label><select id="ikeaItem"></select><div class="hint" id="ikeaTimeHint"></div>`);
  }
  scaffold();

  const els = {
    jobType:$('jobType'),
    ikeaModeWrap:$('ikeaModeWrap'), ikeaMode:$('ikeaMode'),
    ikeaStoreWrap:$('ikeaStoreWrap'), ikeaStore:$('ikeaStore'),
    ikeaItemWrap:$('ikeaItemWrap'), ikeaItem:$('ikeaItem'), ikeaTimeHint:$('ikeaTimeHint'),
    pickupField:$('pickupField'), addrPickup:$('addrPickup'),
    addrDropWrap:$('addrDropWrap'), addrDrop:$('addrDrop'),
    shopTimeWrap:$('shopTimeWrap'), shopTime:$('shopTime'),
    ikeaQtyWrap:$('ikeaQtyWrap'), ikeaQty:$('ikeaQty'),
    twoManWrap:$('twoManWrap'), twoMan:$('twoMan'),
    stairsWrap:$('stairsWrap'), stairsPickup:$('stairsPickup'), stairsDrop:$('stairsDrop'),
    wasteWrap:$('wasteWrap'), wasteType:$('wasteType'),
    descWrap:$('descWrap'), jobDesc:$('jobDesc'),
    btnCalc:$('btnCalc'), routeHint:$('routeHint'),
    breakdown:$('breakdown'), total:$('total'),
    quoteId:$('quoteId'), btnWA:$('btnWhatsApp'),
    buildTag:$('buildTag')
  };
  if (els.buildTag) els.buildTag.textContent = 'Build '+(window.BHD.version||'');

  // seed ikea stores (7 total)
  if (els.ikeaStore && els.ikeaStore.options.length===0){
    const ph=document.createElement('option'); ph.value=""; ph.textContent="Select IKEA store…"; ph.disabled=true; ph.selected=true; els.ikeaStore.appendChild(ph);
    (CFG.ikeaStores||[]).forEach(st=>{ const o=document.createElement('option'); o.value=st.address; o.textContent=st.name; els.ikeaStore.appendChild(o); });
    els.ikeaStore.addEventListener('change', ()=>{ if(els.addrPickup) els.addrPickup.value=els.ikeaStore.value; });
  }

  // seed ikea items
  if (els.ikeaItem && els.ikeaItem.options.length===0){
    const ph=document.createElement('option'); ph.value=""; ph.textContent="(optional) pick a common item…"; ph.selected=true; els.ikeaItem.appendChild(ph);
    (CFG.ikeaItems||[]).forEach(it=>{ const o=document.createElement('option'); o.value=String(it.minutes); o.textContent=`${it.name} — ~${it.minutes} min`; els.ikeaItem.appendChild(o); });
    const refreshHint = ()=>{
      const mins = parseInt(els.ikeaItem.value||"0")||0;
      const qty  = Math.max(1, parseInt(els.ikeaQty && els.ikeaQty.value || "1")||1);
      const total = mins * qty;
      if (els.ikeaTimeHint) els.ikeaTimeHint.textContent = mins ? `Est. build: ~${total} min (${qty} × ${mins})` : "";
    };
    els.ikeaItem.addEventListener('change', refreshHint);
    if (els.ikeaQty) els.ikeaQty.addEventListener('input', refreshHint);
  }

  // seed waste types
  if (els.wasteType && els.wasteType.options.length===0){
    Object.keys(CFG.disposal||{}).forEach(k=>{
      const it=CFG.disposal[k], o=document.createElement('option');
      o.value=k; o.textContent=`${it.label} (£${Number(it.ratePerTonne||0).toFixed(2)}/t)`; els.wasteType.appendChild(o);
    });
  }

  // toggle
  function hideAll(){
    [els.pickupField,els.addrDropWrap,els.wasteWrap,els.twoManWrap,els.stairsWrap,els.shopTimeWrap,els.ikeaModeWrap,els.ikeaStoreWrap,els.ikeaQtyWrap,els.ikeaItemWrap,els.descWrap]
      .forEach(hide);
  }
  function setUI(){
    const v = els.jobType ? els.jobType.value : '';
    hideAll();
    if(!v){ if(els.routeHint) els.routeHint.textContent="Choose a job type to start."; return; }
    show(els.pickupField);
    if(v==='tip'){ show(els.wasteWrap); if(els.routeHint) els.routeHint.textContent="Mileage: Home → Collection → Waterbeach (with >50mi rule)."; }
    else if (v==='move'||v==='fb'||v==='student'){ show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap); if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery."; }
    else if (v==='shop'){ show(els.addrDropWrap); show(els.shopTimeWrap); if(els.routeHint) els.routeHint.textContent="Mileage: Home → Shop → Delivery."; }
    else if (v==='ikea'){ show(els.addrDropWrap); show(els.ikeaModeWrap); show(els.ikeaStoreWrap); show(els.ikeaItemWrap); show(els.ikeaQtyWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap); if(els.routeHint) els.routeHint.textContent="Mileage: Home → IKEA → Delivery."; }
    else { show(els.addrDropWrap); show(els.descWrap); if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery."; }
  }

  // calc helpers
  const pctFor = jt => (CFG.rangePct && CFG.rangePct[jt]!=null) ? Number(CFG.rangePct[jt]) : 0.12;
  const minFor = jt => { const v=(CFG.minByType||{})[jt]; return (v===""||v==null)?0:Math.max(0,Number(v)); };
  function baseFeeFor(jt){
    if(jt==="move") return Number(CFG.baseFees.move||CFG.baseFees.default||0);
    if(jt==="shop") return (els.shopTime && els.shopTime.value==="after22") ? Number(CFG.baseFees.shopAfter22||CFG.baseFees.default||0) : Number(CFG.baseFees.shopBefore22||CFG.baseFees.default||0);
    if(jt==="ikea") return (els.ikeaMode && els.ikeaMode.value==="collectBuild") ? Number(CFG.baseFees.ikeaCollectBuild||CFG.baseFees.default||0) : Number(CFG.baseFees.ikeaCollect||CFG.baseFees.default||0);
    return Number(CFG.baseFees.default||0);
  }
  function calcDisposal(){
    if(!els.wasteType || !CFG.disposal) return {fee:0, detail:""};
    const key=els.wasteType.value, item=CFG.disposal[key]||{};
    const minFee = Number(item.ratePerTonne||0) * Number(CFG.disposalMinPct||0.25);
    return {fee:minFee, detail:`Minimum disposal for ${item.label||key} — ${Math.round((Number(CFG.disposalMinPct||0.25))*100)}% of £${Number(item.ratePerTonne||0).toFixed(2)}/t`};
  }

  // Maps
  let directions=null;
  function initMaps(){
    try{
      if (window.google && google.maps && !directions){
        directions = new google.maps.DirectionsService();
        const opt={fields:["formatted_address"], componentRestrictions:{country:["gb"]}};
        if (els.addrPickup) new google.maps.places.Autocomplete(els.addrPickup,opt);
        if (els.addrDrop)   new google.maps.places.Autocomplete(els.addrDrop,opt);
      }
    }catch(e){}
  }
  function route(req, note, cb){
    if(!directions){ cb(0); return; }
    directions.route(req,(r,s)=>{
      if(s!=="OK"){ cb(0); return; }
      const miles = metersToMiles(legsMeters(r.routes[0].legs));
      if(els.routeHint) els.routeHint.textContent = `${note}: ${miles.toFixed(1)} mi.`;
      cb(miles);
    });
  }
  function getMiles(cb){
    const jt = (els.jobType && els.jobType.value) || "";
    const home = CFG.homeAddress, tip = CFG.waterbeachAddress;
    const pickup = (els.addrPickup && els.addrPickup.value || "").trim();
    const drop   = (els.addrDrop && els.addrDrop.value || "").trim();
    if(!pickup){ if(els.routeHint) els.routeHint.textContent="Enter collection address."; cb(0); return; }
    if(jt!=="tip" && !drop){ if(els.routeHint) els.routeHint.textContent="Enter delivery address."; cb(0); return; }

    if(jt==="tip"){
      route({origin:home,destination:pickup,travelMode:'DRIVING'}, "Home→Collection", m1=>{
        if(m1<=50){
          route({origin:pickup,destination:tip,travelMode:'DRIVING'}, "Collection→Waterbeach", cb);
        }else{
          route({origin:home,destination:tip,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'}, ">50mi (Home + Collection→Waterbeach)", cb);
        }
      });
      return;
    }
    route({origin:home,destination:drop,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'}, "One‑way", cb);
  }

  function calculate(miles){
    const jt = (els.jobType && els.jobType.value) || "";
    if(!jt) return;
    const base = baseFeeFor(jt);
    const mileageCost = (miles||0) * Number(CFG.mileagePerMile||0);
    const twoMan = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other") ? 0 : ((els.twoMan && els.twoMan.value==="yes") ? Number(CFG.twoManSurcharge||0):0);
    const stairs = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other") ? 0 : (((+(els.stairsPickup&&els.stairsPickup.value)||0)+ (+(els.stairsDrop&&els.stairsDrop.value)||0))*Number(CFG.stairsPerFloor||0));
    const disp = (jt==="tip") ? calcDisposal() : {fee:0,detail:""};

    // IKEA assembly by item count (still £/item), plus show time hint in breakdown
    let ikeaAsm=0, ikeaTimeTxt="";
    if(jt==="ikea"){
      const qty=Math.max(1,parseInt(els.ikeaQty&&els.ikeaQty.value||"1")||1);
      ikeaAsm = qty * Number(CFG.ikeaAssemblyPerItem||0);
      const per= parseInt(els.ikeaItem && els.ikeaItem.value || "0") || 0;
      const mins = per * qty;
      if (mins) ikeaTimeTxt = ` (~${mins} min build)`;
    }

    let total = base + mileageCost + stairs + twoMan + disp.fee + ikeaAsm;

    const lines=[`Base: £${base.toFixed(2)}`, `Mileage: £${mileageCost.toFixed(2)}`];
    if(stairs) lines.push(`Stairs: £${stairs.toFixed(2)}`);
    if(twoMan) lines.push(`Two-person: £${twoMan.toFixed(2)}`);
    if(jt==="tip" && disp.fee) lines.push(`Disposal: £${disp.fee.toFixed(2)} — ${disp.detail}`);
    if(jt==="shop" && els.shopTime) lines.push(`Run time: ${els.shopTime.value==="after22"?"After 10pm":"Before 10pm"}`);
    if(jt==="ikea" && ikeaAsm) lines.push(`Assembly: £${ikeaAsm.toFixed(2)} (${(els.ikeaQty&&els.ikeaQty.value)||1} item${(((+((els.ikeaQty&&els.ikeaQty.value)||1))>1)?"s":"")})${ikeaTimeTxt}`);

    const MIN = minFor(jt); if (MIN>0 && total<MIN){ lines.push("Minimum charge applied"); total=MIN; }
    const pct = pctFor(jt), low=round5(total*(1-pct)), high=round5(total*(1+pct));

    if(els.breakdown) els.breakdown.innerHTML = '• ' + lines.join('<br>• ');
    if(els.total){ els.total.textContent = `Estimated: £${low.toFixed(0)}–£${high.toFixed(0)}`; els.total.classList.add('show'); }
    if(els.quoteId) els.quoteId.textContent = "Quote ID — " + quoteId();
    if(els.btnWA){ els.btnWA.style.display=''; els.btnWA.hidden=false; }
  }

  function sendWhatsApp(){
    const id = (els.quoteId && els.quoteId.textContent || "").replace("Quote ID — ","").trim();
    const jt = (els.jobType && els.jobType.value) || "";
    const lines = (els.breakdown && els.breakdown.innerText || '').split('• ').filter(Boolean);
    const msg = [
      "Hey Ben! I need something Humpin' & Dumpin'",
      "Quote ID: "+id,
      "Job Type: "+(jt || "N/A"),
      "Collection: "+((els.addrPickup && els.addrPickup.value) || "N/A"),
      (jt==="tip" ? "Destination: Waterbeach Waste Management Park" : "Delivery: "+((els.addrDrop && els.addrDrop.value)||"N/A")),
      (lines.length ? "\nBreakdown:\n- "+lines.join("\n- ") : ""),
      (els.total && els.total.textContent || "")
    ].filter(Boolean).join("\n");
    window.open("https://wa.me/"+CFG.whatsappNumber+"?text="+encodeURIComponent(msg),'_blank');
  }

  // bind
  if (els.jobType) ['change','input','click','keyup','blur','focus'].forEach(ev=>els.jobType.addEventListener(ev,setUI));
  if (els.ikeaMode) ['change','input','click'].forEach(ev=>els.ikeaMode.addEventListener(ev,setUI));
  if (els.btnCalc) els.btnCalc.addEventListener('click', ()=>{ initMaps(); getMiles(calculate); });
  if (els.btnWA) els.btnWA.addEventListener('click', sendWhatsApp);

  // fallback watcher
  let last = els.jobType ? els.jobType.value : '';
  setInterval(()=>{ if (els.jobType && els.jobType.value !== last){ last = els.jobType.value; setUI(); }}, 150);

  // first paint and maps poll
  hideAll(); setUI();
  const mv=setInterval(()=>{ initMaps(); if (window.google && google.maps) clearInterval(mv); }, 300);
})();