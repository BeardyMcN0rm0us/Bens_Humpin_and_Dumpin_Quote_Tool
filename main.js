// ========= EDITABLE SETTINGS =========
window.BHD = {
  version: "r303",
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
};
// ====================================

(function(){
  // ---- debug ----
  const dbg = document.getElementById('dbg');
  const say = (t)=>{ if(dbg) dbg.textContent = t; console.log('[r303]', t); };
  say('JS running r303');

  // ---- quick DOM helpers (hard show/hide to beat CSS) ----
  const $ = id => document.getElementById(id);
  const show = el => { if(!el) return; el.hidden=false; el.classList.remove('hidden'); el.style.display=''; };
  const hide = el => { if(!el) return; el.hidden=true; el.classList.add('hidden'); el.style.display='none'; };

  // ---- cache elements ----
  const els = {
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

  if (!els.jobType) { say('jobType not found'); return; }
  if (els.buildTag) els.buildTag.textContent = 'Build ' + (window.BHD.version||'');

  // ---- seed selects (safe if missing) ----
  if (els.ikeaStore) {
    els.ikeaStore.innerHTML='';
    const ph=document.createElement('option'); ph.value=''; ph.textContent='Select IKEA store…'; ph.disabled=true; ph.selected=true;
    els.ikeaStore.appendChild(ph);
    (window.BHD.ikeaStores||[]).forEach(st=>{ const o=document.createElement('option'); o.value=st.address; o.textContent=st.name; els.ikeaStore.appendChild(o); });
    els.ikeaStore.addEventListener('change', ()=>{ if(els.addrPickup) els.addrPickup.value = els.ikeaStore.value; });
  }
  if (els.wasteType && window.BHD.disposal) {
    els.wasteType.innerHTML='';
    Object.keys(window.BHD.disposal).forEach(k=>{
      const it=window.BHD.disposal[k]; const o=document.createElement('option');
      o.value=k; o.textContent=`${it.label} (£${Number(it.ratePerTonne||0).toFixed(2)}/t)`; els.wasteType.appendChild(o);
    });
  }

  // ---- UI toggle (this is the bit you care about) ----
  function setJobTypeUI(){
    const jt = els.jobType.value || '';
    [els.pickupField,els.addrDropWrap,els.wasteWrap,els.twoManWrap,els.stairsWrap,els.descWrap,els.shopTimeWrap,els.ikeaModeWrap,els.ikeaStoreWrap,els.ikeaQtyWrap].forEach(hide);
    if(!jt){ if(els.routeHint) els.routeHint.textContent='Choose a job type to start.'; say('UI: none'); return; }

    show(els.pickupField);
    if(jt==='tip'){
      show(els.wasteWrap);
      if(els.routeHint) els.routeHint.textContent='Mileage: Home → Collection → Waterbeach (with >50mi rule).';
    } else if (jt==='move'||jt==='fb'||jt==='student'){
      show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap);
      if(els.routeHint) els.routeHint.textContent='Mileage: Home → Pickup → Delivery.';
    } else if (jt==='shop'){
      show(els.addrDropWrap); show(els.shopTimeWrap);
      if(els.routeHint) els.routeHint.textContent='Mileage: Home → Shop → Delivery.';
    } else if (jt==='ikea'){
      show(els.ikeaModeWrap); show(els.ikeaStoreWrap); show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
      if(els.ikeaMode && els.ikeaMode.value==='collectBuild') show(els.ikeaQtyWrap);
      if(els.routeHint) els.routeHint.textContent='Mileage: Home → IKEA → Delivery.';
    } else { // business / other
      show(els.addrDropWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent='Mileage: Home → Pickup → Delivery.';
    }
    say('UI: ' + jt);
  }
  window.BHD_forceUI = setJobTypeUI;

  // bind aggressively
  ['change','input','click','keyup','blur','focus'].forEach(ev=>els.jobType.addEventListener(ev,setJobTypeUI));
  if (els.ikeaMode) ['change','input','click'].forEach(ev=>els.ikeaMode.addEventListener(ev,setJobTypeUI));

  // fire once now
  setJobTypeUI();

  // fallback watcher (if events are swallowed by the browser)
  let lastVal = els.jobType.value;
  setInterval(()=>{
    if (els.jobType.value !== lastVal){
      lastVal = els.jobType.value;
      say('Watcher: '+lastVal);
      setJobTypeUI();
    }
  }, 150);

  // keep UI alive even if something throws
  window.onerror = function(msg,src,line){ say('JS error: '+msg); return true; };
})();