// ========= SETTINGS =========
window.BHD = Object.assign({
  version: "r305",
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
// ===========================

(function(){
  const CFG = window.BHD;
  const dbg = document.getElementById('dbg');
  const say = t => { if(dbg) dbg.textContent = t; console.log('[r305]', t); };

  const $ = id => document.getElementById(id);
  const show = el => { if(!el) return; el.hidden=false; el.classList.remove('hidden'); el.style.display=''; };
  const hide = el => { if(!el) return; el.hidden=true; el.classList.add('hidden'); el.style.display='none'; };
  const round5 = v => Math.round(v/5)*5;
  const metersToMiles = m => m/1609.344;
  const legsMeters = legs => legs.reduce((s,l)=>s+((l.distance&&l.distance.value)||0),0);
  const nextQuoteId = () => { const n=new Date(),p=v=>String(v).padStart(2,"0"); return `ID${n.getFullYear()}${p(n.getMonth()+1)}${p(n.getDate())}-${p(n.getHours())}${p(n.getMinutes())}${p(n.getSeconds())}`; };

  let els={}, directions=null;

  function cacheEls(){
    els = {
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
    if (els.buildTag) els.buildTag.textContent = 'Build ' + (CFG.version||'');
  }

  function seedSelects(){
    if (els.ikeaStore) {
      els.ikeaStore.innerHTML='';
      const ph=document.createElement('option'); ph.value=''; ph.textContent='Select IKEA store…'; ph.disabled=true; ph.selected=true;
      els.ikeaStore.appendChild(ph);
      (CFG.ikeaStores||[]).forEach(st=>{ const o=document.createElement('option'); o.value=st.address; o.textContent=st.name; els.ikeaStore.appendChild(o); });
      els.ikeaStore.addEventListener('change', ()=>{ if(els.addrPickup) els.addrPickup.value = els.ikeaStore.value; });
    }
    if (els.wasteType && CFG.disposal) {
      els.wasteType.innerHTML='';
      Object.keys(CFG.disposal).forEach(k=>{
        const it=CFG.disposal[k], o=document.createElement('option');
        o.value=k; o.textContent=`${it.label} (£${Number(it.ratePerTonne||0).toFixed(2)}/t)`;
        els.wasteType.appendChild(o);
      });
    }
  }

  function setJobTypeUI(){
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
    } else { // business/other
      show(els.addrDropWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    }
    say('jobType → '+jt);
  }
  window.BHD_forceUI = setJobTypeUI;

  const pctFor = jt => (CFG.rangePct && CFG.rangePct[jt] != null) ? Number(CFG.rangePct[jt]) : 0.12;
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
  function initMaps(){
    try{
      if (window.google && google.maps && !directions){
        directions = new google.maps.DirectionsService();
        const opt={fields:["formatted_address"], componentRestrictions:{country:["gb"]}};
        if (els.addrPickup) new google.maps.places.Autocomplete(els.addrPickup,opt);
        if (els.addrDrop)   new google.maps.places.Autocomplete(els.addrDrop,opt);
        say('maps ok');
      }
    }catch(e){/*ignore*/}
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
    let ikeaAsm=0; if(jt==="ikea" && els.ikeaMode && els.ikeaMode.value==="collectBuild"){ const qty=Math.max(1,parseInt(els.ikeaQty&&els.ikeaQty.value)||1); ikeaAsm = qty * Number(CFG.ikeaAssemblyPerItem||0); }
    let total = base + mileageCost + stairs + twoMan + disp.fee + ikeaAsm;

    const lines=[`Base: £${base.toFixed(2)}`, `Mileage: £${mileageCost.toFixed(2)}`];
    if(stairs) lines.push(`Stairs: £${stairs.toFixed(2)}`);
    if(twoMan) lines.push(`Two-person: £${twoMan.toFixed(2)}`);
    if(jt==="tip" && disp.fee) lines.push(`Disposal: £${disp.fee.toFixed(2)} — ${disp.detail}`);
    if(jt==="shop" && els.shopTime) lines.push(`Run time: ${els.shopTime.value==="after22"?"After 10pm":"Before 10pm"}`);
    if(jt==="ikea" && ikeaAsm) lines.push(`Assembly: £${ikeaAsm.toFixed(2)} (${(els.ikeaQty&&els.ikeaQty.value)||1} item${(((+((els.ikeaQty&&els.ikeaQty.value)||1))>1)?"s":"")})`);

    const MIN = minFor(jt); if (MIN>0 && total<MIN){ lines.push("Minimum charge applied"); total=MIN; }
    const pct = pctFor(jt), low=round5(total*(1-pct)), high=round5(total*(1+pct));
    if(els.breakdown) els.breakdown.innerHTML = '• ' + lines.join('<br>• ');
    if(els.total){ els.total.textContent = `Estimated: £${low.toFixed(0)}–£${high.toFixed(0)}`; els.total.classList.add('show'); }
    if(els.quoteId) els.quoteId.textContent = "Quote ID — " + nextQuoteId();
    if(els.btnWA){ els.btnWA.hidden=false; els.btnWA.classList.remove('hidden'); }
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

  function bind(){
    if (!els.jobType || !els.btnCalc) return false;
    ['change','input','click'].forEach(ev=>els.jobType.addEventListener(ev,setJobTypeUI));
    if (els.ikeaMode) ['change','input','click'].forEach(ev=>els.ikeaMode.addEventListener(ev,setJobTypeUI));
    els.btnCalc.addEventListener('click', ()=>{ initMaps(); getMiles(calculate); });
    if (els.btnWA) els.btnWA.addEventListener('click', sendWhatsApp);
    setJobTypeUI();
    return true;
  }

  function start(){
    cacheEls();
    seedSelects();
    let tries=0;
    if (!bind()){
      const iv=setInterval(()=>{
        tries++; cacheEls();
        if (bind() || tries>40){ clearInterval(iv); }
      }, 100);
    }
    // poll maps just in case callback isn't used
    const mv=setInterval(()=>{ initMaps(); if (window.google && directions) clearInterval(mv); }, 300);
    say('ready');
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();

  window.onerror = function(msg){ say('JS error: '+msg); return true; };
})();