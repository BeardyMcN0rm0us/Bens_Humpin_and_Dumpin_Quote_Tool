// =============== SETTINGS ===============
window.BHD = Object.assign({
  version: "r304",
  whatsappNumber: "447717463496",
  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",
  mileagePerMile: 0.40, twoManSurcharge: 20, stairsPerFloor: 5,
  baseFees:{default:35,move:50,shopBefore22:25,shopAfter22:40,ikeaCollect:45,ikeaCollectBuild:55},
  minByType:{tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:""},
  rangePct:{tip:0.15, move:0.12, fb:0.12, shop:0.10, student:0.12, business:0.15, other:0.15, ikea:0.12},
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
// =======================================

(function(){
  const dbg = document.getElementById('dbg');
  const say = t => { if(dbg) dbg.textContent = t; console.log('[r304]', t); };

  // helpers
  const $ = id => document.getElementById(id);
  const show = el => { if(!el) return; el.hidden=false; el.classList.remove('hidden'); el.style.display=''; };
  const hide = el => { if(!el) return; el.hidden=true; el.classList.add('hidden'); el.style.display='none'; };

  // try-hard selector for the job type dropdown
  const findJobType = () =>
    document.querySelector(
      '#jobType, select[name="jobType"], select#jobtype, select[name="jobtype"], select[id*="job"][id*="type"], select[data-role="jobType"]'
    );

  // cache other elements (by expected IDs; safe if missing)
  const E = {
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
  if (E.buildTag) E.buildTag.textContent = 'Build ' + (window.BHD.version||'');

  // seed optional selects
  if (E.ikeaStore) {
    E.ikeaStore.innerHTML='';
    const ph=document.createElement('option'); ph.value=''; ph.textContent='Select IKEA store…'; ph.disabled=true; ph.selected=true;
    E.ikeaStore.appendChild(ph);
    (window.BHD.ikeaStores||[]).forEach(st=>{ const o=document.createElement('option'); o.value=st.address; o.textContent=st.name; E.ikeaStore.appendChild(o); });
    E.ikeaStore.addEventListener('change', ()=>{ if(E.addrPickup) E.addrPickup.value = E.ikeaStore.value; });
  }
  if (E.wasteType && window.BHD.disposal) {
    E.wasteType.innerHTML='';
    Object.keys(window.BHD.disposal).forEach(k=>{
      const it=window.BHD.disposal[k], o=document.createElement('option');
      o.value=k; o.textContent=`${it.label} (£${Number(it.ratePerTonne||0).toFixed(2)}/t)`;
      E.wasteType.appendChild(o);
    });
  }

  // UI toggle
  function setJobTypeUI(){
    const jtSel = findJobType();
    const val = jtSel ? jtSel.value : '';
    [E.pickupField,E.addrDropWrap,E.wasteWrap,E.twoManWrap,E.stairsWrap,E.descWrap,E.shopTimeWrap,E.ikeaModeWrap,E.ikeaStoreWrap,E.ikeaQtyWrap].forEach(hide);
    if(!val){ if(E.routeHint) E.routeHint.textContent="Choose a job type to start."; say('Waiting for selection…'); return; }

    show(E.pickupField);
    if(val==='tip'){
      show(E.wasteWrap);
      if(E.routeHint) E.routeHint.textContent="Mileage: Home → Collection → Waterbeach (with >50mi rule).";
    } else if (val==='move'||val==='fb'||val==='student'){
      show(E.addrDropWrap); show(E.twoManWrap); show(E.stairsWrap);
      if(E.routeHint) E.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    } else if (val==='shop'){
      show(E.addrDropWrap); show(E.shopTimeWrap);
      if(E.routeHint) E.routeHint.textContent="Mileage: Home → Shop → Delivery.";
    } else if (val==='ikea'){
      show(E.ikeaModeWrap); show(E.ikeaStoreWrap); show(E.addrDropWrap); show(E.twoManWrap); show(E.stairsWrap); show(E.descWrap);
      if(E.ikeaMode && E.ikeaMode.value==='collectBuild') show(E.ikeaQtyWrap);
      if(E.routeHint) E.routeHint.textContent="Mileage: Home → IKEA → Delivery.";
    } else { // business/other
      show(E.addrDropWrap); show(E.descWrap);
      if(E.routeHint) E.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    }
    say('UI: '+val);
  }
  window.BHD_forceUI = setJobTypeUI;

  // calc helpers
  const pctFor = jt => (window.BHD.rangePct && window.BHD.rangePct[jt] != null) ? Number(window.BHD.rangePct[jt]) : 0.12;
  const minFor = jt => { const v=(window.BHD.minByType||{})[jt]; return (v===""||v==null)?0:Math.max(0,Number(v)); };
  function baseFeeFor(jt){
    if(jt==="move") return Number(window.BHD.baseFees.move||window.BHD.baseFees.default||0);
    if(jt==="shop") return (E.shopTime && E.shopTime.value==="after22") ? Number(window.BHD.baseFees.shopAfter22||window.BHD.baseFees.default||0) : Number(window.BHD.baseFees.shopBefore22||window.BHD.baseFees.default||0);
    if(jt==="ikea") return (E.ikeaMode && E.ikeaMode.value==="collectBuild") ? Number(window.BHD.baseFees.ikeaCollectBuild||window.BHD.baseFees.default||0) : Number(window.BHD.baseFees.ikeaCollect||window.BHD.baseFees.default||0);
    return Number(window.BHD.baseFees.default||0);
  }
  function calcDisposal(){
    if(!E.wasteType || !window.BHD.disposal) return {fee:0, detail:""};
    const key=E.wasteType.value, item=window.BHD.disposal[key]||{};
    const minFee = Number(item.ratePerTonne||0) * Number(window.BHD.disposalMinPct||0.25);
    return {fee:minFee, detail:`Minimum disposal for ${item.label||key} — ${Math.round((Number(window.BHD.disposalMinPct||0.25))*100)}% of £${Number(item.ratePerTonne||0).toFixed(2)}/t`};
  }

  // Maps
  let directions=null;
  function initMaps(){
    try{
      // only if google is present
      if (window.google && google.maps && !directions){
        directions = new google.maps.DirectionsService();
        const opt={fields:["formatted_address"], componentRestrictions:{country:["gb"]}};
        if (E.addrPickup) new google.maps.places.Autocomplete(E.addrPickup,opt);
        if (E.addrDrop)   new google.maps.places.Autocomplete(E.addrDrop,opt);
        say('Maps ready');
      }
    }catch(e){/*ignore*/}
  }
  function route(req, note, cb){
    if(!directions){ cb(0); return; }
    directions.route(req,(r,s)=>{
      if(s!=="OK"){ cb(0); return; }
      const miles = metersToMiles(legsMeters(r.routes[0].legs));
      if(E.routeHint) E.routeHint.textContent = `${note}: ${miles.toFixed(1)} mi.`;
      cb(miles);
    });
  }
  function getMiles(cb){
    const jtSel = findJobType(); const jt = jtSel ? jtSel.value : "";
    const home = window.BHD.homeAddress, tip = window.BHD.waterbeachAddress;
    const pickup = (E.addrPickup && E.addrPickup.value || "").trim();
    const drop   = (E.addrDrop && E.addrDrop.value || "").trim();
    if(!pickup){ if(E.routeHint) E.routeHint.textContent="Enter collection address."; cb(0); return; }
    if(jt!=="tip" && !drop){ if(E.routeHint) E.routeHint.textContent="Enter delivery address."; cb(0); return; }
    if(jt==="tip"){
      route({origin:home,destination:pickup,travelMode:'DRIVING'}, "Home→Collection", m1=>{
        if(m1<=50){ route({origin:pickup,destination:tip,travelMode:'DRIVING'}, "Collection→Waterbeach", cb); }
        else{ route({origin:home,destination:tip,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'}, ">50mi (Home + Collection→Waterbeach)", cb); }
      }); return;
    }
    route({origin:home,destination:drop,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'}, "One‑way", cb);
  }

  function calculate(miles){
    const jtSel = findJobType(); const jt = jtSel ? jtSel.value : "";
    if(!jt) return;
    const mileageCost = (miles||0) * Number(window.BHD.mileagePerMile||0);
    const base = baseFeeFor(jt);
    const twoMan = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other") ? 0 : ((E.twoMan && E.twoMan.value==="yes") ? Number(window.BHD.twoManSurcharge||0):0);
    const stairs = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other") ? 0 : (((+(E.stairsPickup&&E.stairsPickup.value)||0)+(+(E.stairsDrop&&E.stairsDrop.value)||0))*Number(window.BHD.stairsPerFloor||0));
    const disp = (jt==="tip") ? calcDisposal() : {fee:0,detail:""};
    let ikeaAsm=0; if(jt==="ikea" && E.ikeaMode && E.ikeaMode.value==="collectBuild"){ const qty=Math.max(1,parseInt(E.ikeaQty&&E.ikeaQty.value)||1); ikeaAsm = qty * Number(window.BHD.ikeaAssemblyPerItem||0); }
    let total = base + mileageCost + stairs + twoMan + disp.fee + ikeaAsm;

    const lines=[`Base: £${base.toFixed(2)}`,`Mileage: £${mileageCost.toFixed(2)}`];
    if(stairs) lines.push(`Stairs: £${stairs.toFixed(2)}`);
    if(twoMan) lines.push(`Two-person: £${twoMan.toFixed(2)}`);
    if(jt==="tip" && disp.fee) lines.push(`Disposal: £${disp.fee.toFixed(2)} — ${disp.detail}`);
    if(jt==="shop" && E.shopTime) lines.push(`Run time: ${E.shopTime.value==="after22"?"After 10pm":"Before 10pm"}`);
    if(jt==="ikea" && ikeaAsm) lines.push(`Assembly: £${ikeaAsm.toFixed(2)} (${(E.ikeaQty&&E.ikeaQty.value)||1} item${(((+((E.ikeaQty&&E.ikeaQty.value)||1))>1)?"s":"")})`);

    const MIN = minFor(jt); if(MIN>0 && total<MIN){ lines.push("Minimum charge applied"); total=MIN; }
    const pct = pctFor(jt); const low=Math.round(total*(1-pct)/5)*5; const high=Math.round(total*(1+pct)/5)*5;
    if(E.breakdown) E.breakdown.innerHTML='• '+lines.join('<br>• '); if(E.total){ E.total.textContent=`Estimated: £${low}–£${high}`; E.total.classList.add('show'); }
    if(E.quoteId) E.quoteId.textContent="Quote ID — "+(new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14));
    if(E.btnWA){ E.btnWA.hidden=false; E.btnWA.classList.remove('hidden'); }
  }

  function sendWhatsApp(){
    const jtSel = findJobType(); const jt = jtSel ? jtSel.value : "";
    const lines = (E.breakdown && E.breakdown.innerText || '').split('• ').filter(Boolean);
    const id = (E.quoteId && E.quoteId.textContent || "").replace("Quote ID — ","").trim();
    const msg = [
      "Hey Ben! I need something Humpin' & Dumpin'",
      "Quote ID: "+id,
      "Job Type: "+(jt||"N/A"),
      "Collection: "+((E.addrPickup && E.addrPickup.value)||"N/A"),
      (jt==="tip" ? "Destination: Waterbeach Waste Management Park" : "Delivery: "+((E.addrDrop && E.addrDrop.value)||"N/A")),
      (lines.length ? "\nBreakdown:\n- "+lines.join("\n- ") : ""),
      (E.total && E.total.textContent || "")
    ].join("\n");
    window.open("https://wa.me/"+(window.BHD.whatsappNumber||"") +"?text="+encodeURIComponent(msg),'_blank');
  }

  // Bind once the dropdown exists
  let tried=0, found=null;
  const wait = setInterval(()=>{
    initMaps();
    if(!found){
      found = findJobType();
      if(found){
        ['change','input','click','keyup','blur','focus'].forEach(ev=>found.addEventListener(ev,setJobTypeUI));
        if (E.ikeaMode) ['change','input','click'].forEach(ev=>E.ikeaMode.addEventListener(ev,setJobTypeUI));
        if (E.btnCalc) E.btnCalc.addEventListener('click', ()=>getMiles(calculate));
        if (E.btnWA)   E.btnWA.addEventListener('click', sendWhatsApp);
        setJobTypeUI();
        say('Dropdown wired');
      }
    }
    if(++tried>200){ clearInterval(wait); say('Gave up finding dropdown'); }
  }, 100);

  window.onerror = function(msg){ say('JS error: '+msg); return true; };
})();