// r350 — Adds "Flat Pack Build Only" job type (no mileage), shows desc, uses assembly basket.
// Keeps: IKEA basket, £/hour display, Hh Mm formatting, two mileage lines for other jobs, WA export.

window.BHD = Object.assign({
  version: "r350",
  whatsappNumber: "447717463496",

  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",

  mileagePerMile: 0.75,
  twoManSurcharge: 20,
  stairsPerFloor: 5,

  baseFees:{
    default:35,
    move:50,
    shopBefore22:25,
    shopAfter22:40,
    ikeaCollect:45,
    ikeaCollectBuild:55,
    flatpack:35           // tweak if you want a different call‑out for build‑only
  },
  minByType:{ tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:"", flatpack:"" },
  rangePct:{ tip:0.15, move:0.12, fb:0.12, shop:0.10, student:0.12, business:0.15, other:0.15, ikea:0.12, flatpack:0.12 },

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

  // Assembly pricing controls
  useTimePricing: true,      // true = time-based (shown as £/hour), false = per-item
  ikeaLaborPerHour: 36,      // £/hour
  ikeaLaborPerMinute: null,  // null => derive from per-hour
  ikeaAssemblyPerItem: 15    // fallback if not using time
}, window.BHD||{});

(function(){
  const $=id=>document.getElementById(id);
  const show=el=>{if(!el)return; el.hidden=false; el.classList.remove('hidden'); el.style.display='';};
  const hide=el=>{if(!el)return; el.hidden=true; el.classList.add('hidden'); el.style.display='none';};
  const round1=v=>Math.round(v*10)/10;
  const round5=v=>Math.round(v/5)*5;
  const metersToMiles=m=>m/1609.344;
  const legsMeters=legs=>legs.reduce((s,l)=>s+((l.distance&&l.distance.value)||0),0);
  const quoteId=()=>{const n=new Date(),p=v=>String(v).padStart(2,"0");return `ID${n.getFullYear()}${p(n.getMonth()+1)}${p(n.getDate())}-${p(n.getHours())}${p(n.getMinutes())}${p(n.getSeconds())}`;};
  const fmtMins = (mins)=>{const m=Math.max(0,Math.round(mins)); if(m<60)return `${m} min`; const h=Math.floor(m/60),r=m%60; return r?`${h}h ${r}m`:`${h}h`;};

  const CFG=window.BHD;

  const els = {
    jobType:$('jobType'),
    ikeaModeWrap:$('ikeaModeWrap'), ikeaMode:$('ikeaMode'),
    ikeaStoreWrap:$('ikeaStoreWrap'), ikeaStore:$('ikeaStore'),
    ikeaItemsWrap:$('ikeaItemsWrap'), ikeaItemSel:$('ikeaItemSel'),
    ikeaQtyAdd:$('ikeaQtyAdd'), ikeaAddBtn:$('ikeaAddBtn'),
    ikeaList:$('ikeaList'), ikeaTimeHint:$('ikeaTimeHint'),
    ikeaQty:$('ikeaQty'),

    pickupField:$('pickupField'), addrPickup:$('addrPickup'),
    addrDropWrap:$('addrDropWrap'), addrDrop:$('addrDrop'),
    shopTimeWrap:$('shopTimeWrap'), shopTime:$('shopTime'),
    twoManWrap:$('twoManWrap'), twoMan:$('twoMan'),
    stairsWrap:$('stairsWrap'), stairsPickup:$('stairsPickup'), stairsDrop:$('stairsDrop'),
    wasteWrap:$('wasteWrap'), wasteType:$('wasteType'),
    descWrap:$('descWrap'), jobDesc:$('jobDesc'),
    btnCalc:$('btnCalc'), routeHint:$('routeHint'),
    breakdown:$('breakdown'), total:$('total'),
    quoteId:$('quoteId'), btnWA:$('btnWhatsApp'),
    buildTag:$('buildTag')
  };
  if (els.buildTag) els.buildTag.textContent = 'Build ' + (CFG.version||'');

  // seed waste
  if (els.wasteType && els.wasteType.options.length===0){
    Object.keys(CFG.disposal||{}).forEach(k=>{
      const it=CFG.disposal[k], o=document.createElement('option');
      o.value=k; o.textContent=`${it.label} (£${Number(it.ratePerTonne||0).toFixed(2)}/t)`; els.wasteType.appendChild(o);
    });
  }

  // IKEA/Flatpack basket
  const ikeaBasket=[];
  function laborPerMinute(){
    if (typeof CFG.ikeaLaborPerMinute === 'number' && !isNaN(CFG.ikeaLaborPerMinute)) return Number(CFG.ikeaLaborPerMinute);
    const perHour = Number(CFG.ikeaLaborPerHour||0);
    return perHour>0 ? (perHour/60) : 0.6;
  }
  function renderIkeaList(){
    if (!els.ikeaList) return;
    els.ikeaList.innerHTML = '';
    if (ikeaBasket.length===0){
      els.ikeaList.innerHTML = `<div class="hint">No items added yet.</div>`;
      els.ikeaTimeHint.textContent = '';
      return;
    }
    let totalMin=0;
    ikeaBasket.forEach((it,idx)=>{
      totalMin += it.minutes*it.qty;
      const row=document.createElement('div');
      row.className='row';
      row.innerHTML=`
        <div class="meta"><strong>${it.name}</strong><br><span class="hint">${fmtMins(it.minutes)} each</span></div>
        <div class="qty">
          <input type="number" min="1" step="1" value="${it.qty}" data-idx="${idx}" class="qtyInput">
          <button class="btn small" data-remove="${idx}" type="button">Remove</button>
        </div>`;
      els.ikeaList.appendChild(row);
    });
    els.ikeaTimeHint.textContent = `Est. total build time: ~${fmtMins(totalMin)}`;
    els.ikeaList.querySelectorAll('.qtyInput').forEach(inp=>{
      inp.addEventListener('input',e=>{
        const i=parseInt(e.target.getAttribute('data-idx'),10);
        const v=Math.max(1,parseInt(e.target.value||'1',10)||1);
        ikeaBasket[i].qty=v; renderIkeaList();
      });
    });
    els.ikeaList.querySelectorAll('button[data-remove]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const i=parseInt(e.target.getAttribute('data-remove'),10);
        ikeaBasket.splice(i,1); renderIkeaList();
      });
    });
  }
  function addIkeaItem(){
    const val=(els.ikeaItemSel&&els.ikeaItemSel.value)||'';
    if(!val) return;
    const qty=Math.max(1,parseInt(els.ikeaQtyAdd&&els.ikeaQtyAdd.value||'1',10)||1);
    const [minsStr,name]=val.split('|');
    const minutes=Math.max(0,parseInt(minsStr||'0',10)||0);
    if(!name||minutes<=0) return;
    const existing=ikeaBasket.find(i=>i.name===name&&i.minutes===minutes);
    if(existing) existing.qty+=qty; else ikeaBasket.push({name,minutes,qty});
    renderIkeaList();
  }
  if (els.ikeaAddBtn) els.ikeaAddBtn.addEventListener('click', addIkeaItem);

  // UI toggle
  let lastJobType='';
  function clearAddresses(){ if(els.addrPickup) els.addrPickup.value=''; if(els.addrDrop) els.addrDrop.value=''; }
  function hideAll(){
    [els.pickupField,els.addrDropWrap,els.wasteWrap,els.twoManWrap,els.stairsWrap,els.shopTimeWrap,els.ikeaModeWrap,els.ikeaStoreWrap,els.ikeaItemsWrap,els.descWrap].forEach(hide);
  }
  function setUI(){
    const v=els.jobType?els.jobType.value:'';
    if (lastJobType!=='ikea' && v==='ikea'){ clearAddresses(); }
    lastJobType=v;

    hideAll();
    if(!v){ if(els.routeHint) els.routeHint.textContent="Choose a job type to start."; return; }

    // default pickup field shown for most jobs
    show(els.pickupField);

    if(v==='tip'){
      show(els.wasteWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Collection → Waterbeach (with >50mi rule).";
    } else if (v==='move'||v==='fb'||v==='student'){
      show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    } else if (v==='shop'){
      show(els.addrDropWrap); show(els.shopTimeWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Shop → Delivery.";
    } else if (v==='ikea'){
      show(els.ikeaModeWrap); show(els.ikeaStoreWrap); show(els.addrDropWrap);
      if (els.ikeaMode && els.ikeaMode.value==='collectBuild'){
        show(els.ikeaItemsWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
      } else {
        show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
      }
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → IKEA → Delivery.";
    } else if (v==='flatpack'){
      // Build only: no travel inputs, no IKEA store/mode. Just items + description.
      hide(els.pickupField); hide(els.addrDropWrap);
      hide(els.ikeaModeWrap); hide(els.ikeaStoreWrap);
      show(els.ikeaItemsWrap); show(els.descWrap);
      // You might still want two‑man/stairs on heavy builds — keep hidden for now; easy to enable if needed.
      if(els.routeHint) els.routeHint.textContent="Build only (no travel billed).";
    } else {
      show(els.addrDropWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    }
  }

  // IKEA store -> overwrite pickup
  if (els.ikeaStore){
    els.ikeaStore.addEventListener('change', ()=>{
      const v=els.ikeaStore.value||'';
      if (els.addrPickup) els.addrPickup.value=v;
    });
  }

  // Maps
  let directions=null;
  function initMaps(){
    try{
      if(window.google&&google.maps&&!directions){
        directions=new google.maps.DirectionsService();
        const opt={fields:["formatted_address"],componentRestrictions:{country:["gb"]}};
        if(els.addrPickup) new google.maps.places.Autocomplete(els.addrPickup,opt);
        if(els.addrDrop)   new google.maps.places.Autocomplete(els.addrDrop,opt);
      }
    }catch(e){}
  }
  function routeP(req){
    return new Promise(res=>{
      if(!directions){ res({miles:0,legs:[]}); return; }
      directions.route(req,(r,s)=>{
        if(s!=="OK"){ res({miles:0,legs:[]}); return; }
        const miles=metersToMiles(legsMeters(r.routes[0].legs));
        res({miles,legs:r.routes[0].legs});
      });
    });
  }

  // Compute charged + loop miles for all job types (flatpack returns 0s)
  async function getMilesBoth(cb){
    const jt=(els.jobType&&els.jobType.value)||"";
    const home=CFG.homeAddress, tip=CFG.waterbeachAddress;
    const pickup=(els.addrPickup&&els.addrPickup.value||"").trim();
    const drop=(els.addrDrop&&els.addrDrop.value||"").trim();

    if (jt==='flatpack'){
      if(els.routeHint) els.routeHint.textContent="No travel — build only.";
      cb({charged:0, loop:0, noteCharged:'No travel billed', noteLoop:'No travel'});
      return;
    }

    if(!pickup){ if(els.routeHint) els.routeHint.textContent="Enter collection address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''}); return; }
    if(jt!=="tip" && !drop){ if(els.routeHint) els.routeHint.textContent="Enter delivery address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''}); return; }

    let charged=0, loop=0, noteC='', noteL='';

    if (jt==='tip'){
      const toPickup=await routeP({origin:home,destination:pickup,travelMode:'DRIVING'});
      if(toPickup.miles<=50){
        const toTip=await routeP({origin:pickup,destination:tip,travelMode:'DRIVING'});
        charged=toTip.miles; noteC='Collection → Waterbeach';
      }else{
        const thru=await routeP({origin:home,destination:tip,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'});
        charged=thru.miles; noteC='Home → Collection → Waterbeach';
      }
      const loopRes=await routeP({origin:home,destination:home,waypoints:[{location:pickup,stopover:true},{location:tip,stopover:true}],travelMode:'DRIVING'});
      loop=loopRes.miles; noteL='Home → Collection → Waterbeach → Home';
    } else {
      const ch=await routeP({origin:home,destination:drop,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'});
      charged=ch.miles; noteC='Home → Pickup → Delivery';
      const lp=await routeP({origin:home,destination:home,waypoints:[{location:pickup,stopover:true},{location:drop,stopover:true}],travelMode:'DRIVING'});
      loop=lp.miles; noteL='Home → Pickup → Delivery → Home';
    }

    if(els.routeHint) els.routeHint.textContent=`Charged route: ${noteC} — ${round1(charged)} mi.`;
    cb({charged,loop,noteCharged:noteC,noteLoop:noteL});
  }

  // Pricing helpers
  const pctFor=jt=>(CFG.rangePct&&CFG.rangePct[jt]!=null)?Number(CFG.rangePct[jt]):0.12;
  const minFor=jt=>{const v=(CFG.minByType||{})[jt];return (v===""||v==null)?0:Math.max(0,Number(v));};
  function baseFeeFor(jt){
    if(jt==="move") return Number(CFG.baseFees.move||CFG.baseFees.default||0);
    if(jt==="shop") return (els.shopTime&&els.shopTime.value==="after22")?Number(CFG.baseFees.shopAfter22||CFG.baseFees.default||0):Number(CFG.baseFees.shopBefore22||CFG.baseFees.default||0);
    if(jt==="ikea") return (els.ikeaMode&&els.ikeaMode.value==="collectBuild")?Number(CFG.baseFees.ikeaCollectBuild||CFG.baseFees.default||0):Number(CFG.baseFees.ikeaCollect||CFG.baseFees.default||0);
    if(jt==="flatpack") return Number(CFG.baseFees.flatpack||CFG.baseFees.default||0);
    return Number(CFG.baseFees.default||0);
  }
  function calcDisposal(){
    if(!els.wasteType||!CFG.disposal) return {fee:0,detail:""};
    const key=els.wasteType.value, item=CFG.disposal[key]||{};
    const minFee=Number(item.ratePerTonne||0)*Number(CFG.disposalMinPct||0.25);
    return {fee:minFee, detail:`Minimum disposal for ${item.label||key} — ${Math.round((Number(CFG.disposalMinPct||0.25))*100)}% of £${Number(item.ratePerTonne||0).toFixed(2)}/t`};
  }

  // Assembly calculation (IKEA/flatpack)
  function laborPerMinuteEffective(){
    if (typeof CFG.ikeaLaborPerMinute === 'number' && !isNaN(CFG.ikeaLaborPerMinute)) return Number(CFG.ikeaLaborPerMinute);
    const perHour=Number(CFG.ikeaLaborPerHour||0);
    return perHour>0?(perHour/60):0.6;
  }
  function calcAssemblyFor(jt){
    const isBuild = (jt==='ikea' && els.ikeaMode && els.ikeaMode.value==='collectBuild') || jt==='flatpack';
    if (!isBuild) return {cost:0,txt:'',itemLines:[]};

    let totalMinutes=0,totalItems=0,lines=[];
    if(ikeaBasket.length>0){
      ikeaBasket.forEach(i=>{ totalMinutes+=i.minutes*i.qty; totalItems+=i.qty; lines.push(`${i.qty} × ${i.name} (${fmtMins(i.minutes)} each)`); });
    }else{
      // fallback if user didn't add items
      const sel=els.ikeaItemSel&&els.ikeaItemSel.value;
      const minutesPer=sel?parseInt(sel.split('|')[0],10)||0:0;
      const name=sel?sel.split('|')[1]:'Flat pack item';
      const qty=1;
      if(minutesPer){ totalMinutes=minutesPer*qty; totalItems=qty; lines.push(`${qty} × ${name} (${fmtMins(minutesPer)} each)`); }
    }

    let cost=0, txt='';
    if (CFG.useTimePricing && totalMinutes>0){
      const perHour=Number(CFG.ikeaLaborPerHour||0)||Math.round(laborPerMinuteEffective()*60);
      const perMin=laborPerMinuteEffective();
      cost=totalMinutes*perMin;
      txt=` (~${fmtMins(totalMinutes)} @ £${perHour}/hour)`;
    }else{
      const perItem=Number(CFG.ikeaAssemblyPerItem||15);
      cost=totalItems*perItem;
      txt=` (${totalItems} × £${perItem.toFixed(2)}/item)`;
    }
    return {cost,txt,itemLines:lines};
  }

  function calculate(milesObj){
    const jt=(els.jobType&&els.jobType.value)||"";
    if(!jt) return;

    const chargedMiles=round1(milesObj.charged||0);
    const loopMiles=round1(milesObj.loop||0);
    const noteC=milesObj.noteCharged||'';
    const noteL=milesObj.noteLoop||'';

    const base=baseFeeFor(jt);
    const mileageCost = (jt==='flatpack') ? 0 : (chargedMiles * Number(CFG.mileagePerMile||0));
    const twoMan = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other") ? 0 : ((els.twoMan && els.twoMan.value==="yes") ? Number(CFG.twoManSurcharge||0):0);
    const stairs = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other"||jt==="flatpack") ? 0 : (((+(els.stairsPickup&&els.stairsPickup.value)||0)+(+(els.stairsDrop&&els.stairsDrop.value)||0))*Number(CFG.stairsPerFloor||0));
    const disp = (jt==="tip") ? calcDisposal() : {fee:0,detail:""};
    const asm = (jt==="ikea"||jt==="flatpack") ? calcAssemblyFor(jt) : {cost:0,txt:'',itemLines:[]};

    let total=base + mileageCost + stairs + twoMan + disp.fee + asm.cost;

    const lines=[];
    if (jt!=='flatpack'){
      lines.push(`Total journey: ${loopMiles.toFixed(1)} miles (${noteL})`);
      lines.push(`Charged mileage: ${chargedMiles.toFixed(1)} miles @ £${Number(CFG.mileagePerMile).toFixed(2)}/mile (${noteC})`);
    } else {
      lines.push(`Charged mileage: 0.0 miles @ £${Number(CFG.mileagePerMile).toFixed(2)}/mile (Build only)`);
    }
    lines.push(`Base: £${base.toFixed(2)}`);
    if (jt!=='flatpack') lines.push(`Mileage: £${mileageCost.toFixed(2)}`);
    if(stairs) lines.push(`Stairs: £${stairs.toFixed(2)}`);
    if(twoMan) lines.push(`Two-person: £${twoMan.toFixed(2)}`);
    if(jt==="tip" && disp.fee) lines.push(`Disposal: £${disp.fee.toFixed(2)} — ${disp.detail}`);
    if((jt==="ikea"||jt==="flatpack") && asm.cost){
      if (asm.itemLines.length) lines.push(`Items:\n- ${asm.itemLines.join('\n- ')}`);
      lines.push(`Assembly: £${asm.cost.toFixed(2)}${asm.txt}`);
    }
    if(jt==="shop" && els.shopTime) lines.push(`Run time: ${els.shopTime.value==="after22"?"After 10pm":"Before 10pm"}`);

    const MIN=minFor(jt); if(MIN>0 && total<MIN){ lines.push("Minimum charge applied"); total=MIN; }
    const pct=pctFor(jt), low=round5(total*(1-pct)), high=round5(total*(1+pct));

    if(els.breakdown) els.breakdown.innerHTML='• '+lines.join('<br>• ');
    if(els.total){ els.total.textContent=`Estimated: £${low.toFixed(0)}–£${high.toFixed(0)}`; els.total.classList.add('show'); }
    if(els.quoteId) els.quoteId.textContent="Quote ID — "+quoteId();
    if(els.btnWA){ els.btnWA.hidden=false; els.btnWA.classList.remove('hidden'); }
  }

  // WhatsApp
  function sendWhatsApp(){
    const id=(els.quoteId&&els.quoteId.textContent||"").replace("Quote ID — ","").trim();
    const jt=(els.jobType&&els.jobType.value)||"";
    const lines=(els.breakdown&&els.breakdown.innerText||'').split('• ').filter(Boolean);
    const dest = (jt==="tip" ? "Destination: Waterbeach Waste Management Park"
                  : (jt==="flatpack" ? "Location: Customer’s address (build only)"
                  : "Delivery: "+((els.addrDrop&&els.addrDrop.value)||"N/A")));
    const msg=[
      "Hey Ben! I need something Humpin' & Dumpin'",
      "Quote ID: "+id,
      "Job Type: "+(jt || "N/A"),
      (jt==='flatpack' ? `Description: ${(els.jobDesc&&els.jobDesc.value)||"N/A"}` : ""),
      "Collection: "+(jt==='flatpack' ? "N/A" : ((els.addrPickup&&els.addrPickup.value)||"N/A")),
      dest,
      (lines.length ? "\nBreakdown:\n- "+lines.join("\n- ") : ""),
      (els.total&&els.total.textContent||"")
    ].filter(Boolean).join("\n");
    window.open("https://wa.me/"+CFG.whatsappNumber+"?text="+encodeURIComponent(msg),'_blank');
  }

  // Bindings
  if(els.jobType) ['change','input','click','keyup','blur','focus'].forEach(ev=>els.jobType.addEventListener(ev,setUI));
  if(els.ikeaMode) ['change','input','click'].forEach(ev=>els.ikeaMode.addEventListener(ev, ()=>{ setUI(); renderIkeaList(); }));
  if(els.ikeaItemSel) els.ikeaItemSel.addEventListener('change', ()=>{});
  if(els.ikeaQtyAdd)  els.ikeaQtyAdd.addEventListener('keypress', e=>{ if(e.key==='Enter'){ e.preventDefault(); addIkeaItem(); } });
  if(els.btnCalc) els.btnCalc.addEventListener('click', async ()=>{
    initMaps();
    const jt=(els.jobType&&els.jobType.value)||"";
    if (jt==='flatpack'){ calculate({charged:0,loop:0,noteCharged:'No travel billed',noteLoop:'No travel'}); return; }
    const miles=await new Promise(resolve=>getMilesBoth(resolve));
    calculate(miles);
  });
  if(els.btnWA) els.btnWA.addEventListener('click', sendWhatsApp);

  // First paint
  hideAll(); setUI(); renderIkeaList();
  const mv=setInterval(()=>{ initMaps(); if(window.google&&google.maps) clearInterval(mv); },300);

  // keep UI reactive
  let last = els.jobType ? els.jobType.value : '';
  setInterval(()=>{ if(els.jobType && els.jobType.value!==last){ last=els.jobType.value; setUI(); } },150);
})();