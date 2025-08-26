// r372 — Default Luton hire set to £175 and fully configurable via UI or here.

window.BHD = Object.assign({
  version: "r372",
  whatsappNumber: "447717463496",

  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",

  // ===== PRICING VARS — tweak here =====
  mileagePerMile: 0.90,
  twoManSurcharge: 20,   // add-on if two-person team (not for tip/shop/business/other/flatpack)
  stairsPerFloor: 5,     // per floor (pickup + drop)

  baseFees:{
    default:40,
    move:50,
    shopBefore22:25,
    shopAfter22:40,
    ikeaCollect:45,
    ikeaCollectBuild:55,
    flatpack:35
  },

  // House Move labour by bedrooms
  HOURLY_RATE_MOVE: 50,
  LUTON_HIRE_COST: 200, // <— default; also editable in UI on House Move
  BEDROOM_LOAD_MULTIPLIERS: {
    1: { hours: 3, luton: false },
    2: { hours: 5, luton: true },
    3: { hours: 6, luton: true  },
    4: { hours: 8, luton: true  },
    5: { hours:10, luton: true  } // 5+
  },

  // Min & range
  minByType:{ tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:"", flatpack:"" },
  rangePct:{ tip:0.15, move:0.12, fb:0.12, shop:0.10, student:0.12, business:0.15, other:0.15, ikea:0.12, flatpack:0.12 },

  // Tip run disposal (Waterbeach)
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

  // Assembly pricing (IKEA/Flatpack)
  useTimePricing: true,
  ikeaLaborPerHour: 36,
  ikeaLaborPerMinute: null,
  ikeaAssemblyPerItem: 25
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
  const ceil0=v=>Math.ceil(v);
  const fmtMins = (mins)=>{const m=Math.max(0,Math.round(mins)); if(m<60)return `${m} min`; const h=Math.floor(m/60),r=m%60; return r?`${h}h ${r}m`:`${h}h`;};

  const CFG=window.BHD;

  const els = {
    jobType:$('jobType'),
    houseMoveBedroomsWrap:$('houseMoveBedroomsWrap'), houseMoveBedrooms:$('houseMoveBedrooms'),

    lutonWrap:$('lutonWrap'), lutonNeeded:$('lutonNeeded'), lutonCost:$('lutonCost'), lutonHint:$('lutonHint'),

    ikeaModeWrap:$('ikeaModeWrap'), ikeaMode:$('ikeaMode'),
    ikeaStoreWrap:$('ikeaStoreWrap'), ikeaStore:$('ikeaStore'),
    ikeaItemsWrap:$('ikeaItemsWrap'), ikeaItemSel:$('ikeaItemSel'),
    ikeaQtyAdd:$('ikeaQtyAdd'), ikeaAddBtn:$('ikeaAddBtn'),
    ikeaList:$('ikeaList'), ikeaTimeHint:$('ikeaTimeHint'),
    ikeaOtherWrap:$('ikeaOtherWrap'), ikeaOtherName:$('ikeaOtherName'), ikeaOtherMinutes:$('ikeaOtherMinutes'),

    flatpackItemsWrap:$('flatpackItemsWrap'),
    flatItemSel:$('flatItemSel'), flatQtyAdd:$('flatQtyAdd'), flatAddBtn:$('flatAddBtn'),
    flatList:$('flatList'), flatTimeHint:$('flatTimeHint'),
    flatOtherWrap:$('flatOtherWrap'), flatOtherName:$('flatOtherName'), flatOtherMinutes:$('flatOtherMinutes'),

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

  if (els.lutonCost) els.lutonCost.value = Number(CFG.LUTON_HIRE_COST||0);

  // Seed waste select
  if (els.wasteType && els.wasteType.options.length===0){
    Object.keys(CFG.disposal||{}).forEach(k=>{
      const it=CFG.disposal[k], o=document.createElement('option');
      o.value=k; o.textContent=`${it.label} (£${Number(it.ratePerTonne||0).toFixed(2)}/t)`; els.wasteType.appendChild(o);
    });
  }

  function toggleIkeaOther(){
    if (!els.ikeaItemSel) return;
    const isOther = (els.ikeaItemSel.value||'').startsWith('other');
    if (isOther){ show(els.ikeaOtherWrap); } else { hide(els.ikeaOtherWrap); }
  }

  const ikeaBasket=[]; const flatBasket=[];
  function laborPerMinuteEffective(){
    if (typeof CFG.ikeaLaborPerMinute === 'number' && !isNaN(CFG.ikeaLaborPerMinute)) return Number(CFG.ikeaLaborPerMinute);
    const perHour=Number(CFG.ikeaLaborPerHour||0);
    return perHour>0 ? (perHour/60) : 0.6;
  }
  function renderList(targetEl, timeHintEl, basket){
    targetEl.innerHTML='';
    if (basket.length===0){
      targetEl.innerHTML = `<div class="hint">No items added yet.</div>`;
      timeHintEl.textContent='';
      return;
    }
    let totalMin=0;
    basket.forEach((it,idx)=>{
      totalMin += it.minutes*it.qty;
      const row=document.createElement('div');
      row.className='row';
      row.innerHTML=`
        <div class="meta"><strong>${it.name}</strong><br><span class="hint">${fmtMins(it.minutes)} each</span></div>
        <div class="qty">
          <input type="number" min="1" step="1" value="${it.qty}" data-idx="${idx}" class="qtyInput">
          <button class="btn small" data-remove="${idx}" type="button">Remove</button>
        </div>`;
      targetEl.appendChild(row);
    });
    timeHintEl.textContent=`Est. total build time: ~${fmtMins(totalMin)}`;
    targetEl.querySelectorAll('.qtyInput').forEach(inp=>{
      inp.addEventListener('input',e=>{
        const i=+e.target.getAttribute('data-idx'); const v=Math.max(1,parseInt(e.target.value||'1',10)||1);
        basket[i].qty=v; renderList(targetEl, timeHintEl, basket);
      });
    });
    targetEl.querySelectorAll('button[data-remove]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const i=+e.target.getAttribute('data-remove'); basket.splice(i,1); renderList(targetEl, timeHintEl, basket);
      });
    });
  }
  function addIkeaItem(){
    const sel=(els.ikeaItemSel&&els.ikeaItemSel.value)||'';
    let minutes=0, name='', qty=Math.max(1,parseInt(els.ikeaQtyAdd&&els.ikeaQtyAdd.value||'1',10)||1);
    if (sel.startsWith('other')){
      name=(els.ikeaOtherName&&els.ikeaOtherName.value||'Custom item').trim();
      minutes=Math.max(5,parseInt(els.ikeaOtherMinutes&&els.ikeaOtherMinutes.value||'60',10)||60);
      if(!name) name='Custom item';
    } else if(sel){
      const [m,n]=sel.split('|'); minutes=Math.max(0,parseInt(m||'0',10)||0); name=n||'Item';
    } else { return; }
    const ex=ikeaBasket.find(i=>i.name===name&&i.minutes===minutes);
    if(ex) ex.qty+=qty; else ikeaBasket.push({name,minutes,qty});
    renderList(els.ikeaList, els.ikeaTimeHint, ikeaBasket);
  }
  function addFlatItem(){
    const sel=(els.flatItemSel&&els.flatItemSel.value)||'';
    let minutes=0, name='', qty=Math.max(1,parseInt(els.flatQtyAdd&&els.flatQtyAdd.value||'1',10)||1);
    if (sel.startsWith('other')){
      name=(els.flatOtherName&&els.flatOtherName.value||'Custom item').trim();
      minutes=Math.max(5,parseInt(els.flatOtherMinutes&&els.flatOtherMinutes.value||'60',10)||60);
      if(!name) name='Custom item';
    } else if(sel){
      const [m,n]=sel.split('|'); minutes=Math.max(0,parseInt(m||'0',10)||0); name=n||'Item';
    } else { return; }
    const ex=flatBasket.find(i=>i.name===name&&i.minutes===minutes);
    if(ex) ex.qty+=qty; else flatBasket.push({name,minutes,qty});
    renderList(els.flatList, els.flatTimeHint, flatBasket);
  }

  // UI toggle
  let lastJobType='';
  function clearAddresses(){ if(els.addrPickup) els.addrPickup.value=''; if(els.addrDrop) els.addrDrop.value=''; }
  function hideAll(){
    [els.pickupField,els.addrDropWrap,els.wasteWrap,els.twoManWrap,els.stairsWrap,els.shopTimeWrap,
     els.ikeaModeWrap,els.ikeaStoreWrap,els.ikeaItemsWrap,els.descWrap,els.flatpackItemsWrap,
     els.houseMoveBedroomsWrap,els.lutonWrap].forEach(hide);
  }
  function setUI(){
    const v=els.jobType?els.jobType.value:'';
    if (lastJobType!=='ikea' && v==='ikea'){ clearAddresses(); }
    lastJobType=v;

    hideAll();
    if(!v){ if(els.routeHint) els.routeHint.textContent="Choose a job type to start."; return; }
    show(els.pickupField);

    if(v==='tip'){
      show(els.wasteWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Collection → Waterbeach (with >50mi rule).";
    } else if (v==='move'){
      show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.houseMoveBedroomsWrap); show(els.lutonWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery. Labour & Luton based on bedrooms.";
      if (els.lutonCost && !els.lutonCost.value) els.lutonCost.value = Number(CFG.LUTON_HIRE_COST||0);
      updateLutonHint();
    } else if (v==='fb'||v==='student'){
      show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    } else if (v==='shop'){
      show(els.addrDropWrap); show(els.shopTimeWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Shop → Delivery.";
    } else if (v==='ikea'){
      show(els.ikeaModeWrap); show(els.ikeaStoreWrap); show(els.addrDropWrap);
      if (els.ikeaMode && els.ikeaMode.value==='collectBuild'){
        show(els.ikeaItemsWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
      } else { show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap); }
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → IKEA → Delivery.";
    } else if (v==='flatpack'){
      hide(els.pickupField); hide(els.ikeaModeWrap); hide(els.ikeaStoreWrap); hide(els.ikeaItemsWrap);
      show(els.addrDropWrap); show(els.flatpackItemsWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Build only. Mileage billed only if >15 miles from home (one-way).";
    } else {
      show(els.addrDropWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    }
  }

  function autoLutonFromBedrooms(){
    const beds = parseInt(els.houseMoveBedrooms && els.houseMoveBedrooms.value || '0', 10);
    const map = CFG.BEDROOM_LOAD_MULTIPLIERS[beds];
    return !!(map && map.luton);
  }
  function updateLutonHint(){
    if (!els.lutonHint || !els.lutonNeeded) return;
    const mode = (els.lutonNeeded.value||'auto');
    const auto = autoLutonFromBedrooms();
    let txt = `Auto suggests: ${auto ? "Luton needed" : "no Luton"}.`;
    if (mode==='yes') txt += ` Forced ON.`;
    if (mode==='no')  txt += ` Forced OFF.`;
    els.lutonHint.textContent = txt + ` Hire used: £${Number((els.lutonCost&&els.lutonCost.value)||CFG.LUTON_HIRE_COST).toFixed(0)}/day.`;
  }

  // IKEA store sets pickup
  if (els.ikeaStore){
    els.ikeaStore.addEventListener('change', ()=>{
      const v=els.ikeaStore.value||''; if (els.addrPickup) els.addrPickup.value=v;
    });
  }

  // Google Maps bootstrap
  let directions=null, autoPickup=null, autoDrop=null, tryCount=0;
  function initMaps(){
    try{
      if (!window.google || !google.maps) return false;
      if (!directions) directions = new google.maps.DirectionsService();
      const opt={fields:["formatted_address","geometry"], componentRestrictions:{country:["gb"]}, types:["geocode"]};
      if (!autoPickup && els.addrPickup) autoPickup = new google.maps.places.Autocomplete(els.addrPickup,opt);
      if (!autoDrop   && els.addrDrop)   autoDrop   = new google.maps.places.Autocomplete(els.addrDrop,opt);
      if (els.routeHint && tryCount>0) els.routeHint.textContent="Maps OK — enter addresses.";
      return true;
    }catch(e){ return false; }
  }
  const poll = setInterval(()=>{ if(initMaps()) clearInterval(poll); else { tryCount++; if(tryCount%5===0 && els.routeHint) els.routeHint.textContent='Loading Google Maps…'; } },300);

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

  // charged + loop miles
  async function getMilesBoth(cb){
    const jt=(els.jobType&&els.jobType.value)||"";
    const home=CFG.homeAddress, tip=CFG.waterbeachAddress;
    const pickup=(els.addrPickup&&els.addrPickup.value||"").trim();
    const drop=(els.addrDrop&&els.addrDrop.value||"").trim();

    if (jt==='flatpack'){
      if(!drop){ if(els.routeHint) els.routeHint.textContent="Enter destination address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''}); return; }
      const oneWay = await routeP({origin:home, destination:drop, travelMode:'DRIVING'});
      const loop   = await routeP({origin:home, destination:home, waypoints:[{location:drop,stopover:true}], travelMode:'DRIVING'});
      const charged = (oneWay.miles>15) ? ceil0(oneWay.miles) : 0;
      if(els.routeHint) els.routeHint.textContent = `Flatpack: ${charged>0? "Charging one-way (home→dest)":"No mileage charged"} — ${charged} mi.`;
      cb({charged, loop:round1(loop.miles), noteCharged: charged>0 ? 'Home → Destination — >15mi rule' : 'No mileage billed (≤15mi)', noteLoop: 'Home → Destination → Home'});
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
    if(els.routeHint) els.routeHint.textContent=`Charged route: ${round1(charged)} mi — ${noteC}.`;
    cb({charged,loop,noteCharged:noteC,noteLoop:noteL});
  }

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
  function calcAssembly(basket){
    let totalMinutes=0,totalItems=0,lines=[];
    if(basket.length>0){
      basket.forEach(i=>{ totalMinutes+=i.minutes*i.qty; totalItems+=i.qty; lines.push(`${i.qty} × ${i.name} (${fmtMins(i.minutes)} each)`); });
    }
    let cost=0, txt='';
    if (CFG.useTimePricing && totalMinutes>0){
      const perHour=Number(CFG.ikeaLaborPerHour||0)||Math.round(laborPerMinuteEffective()*60);
      const perMin=laborPerMinuteEffective();
      cost=totalMinutes*perMin; txt=` (~${fmtMins(totalMinutes)} @ £${perHour}/hour)`;
    }else if(totalItems>0){
      const perItem=Number(CFG.ikeaAssemblyPerItem||15);
      cost=totalItems*perItem; txt=` (${totalItems} × £${perItem.toFixed(2)}/item)`;
    }
    return {cost,txt,itemLines:lines};
  }

  function calculate(milesObj){
    const jt=(els.jobType&&els.jobType.value)||"";
    if(!jt){ if(els.routeHint) els.routeHint.textContent="Pick a job type first."; return; }

    const chargedMiles = (jt==='flatpack') ? milesObj.charged : round1(milesObj.charged||0);
    const loopMiles    = round1(milesObj.loop||0);
    const noteC=milesObj.noteCharged||'';
    const noteL=milesObj.noteLoop||'';

    const base=baseFeeFor(jt);
    const mileageCost = chargedMiles * Number(CFG.mileagePerMile||0);
    const twoMan = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other"||jt==="flatpack") ? 0 : ((els.twoMan && els.twoMan.value==="yes") ? Number(CFG.twoManSurcharge||0):0);
    const stairs = (jt==="tip"||jt==="shop"||jt==="business"||jt==="other"||jt==="flatpack") ? 0 : (((+(els.stairsPickup&&els.stairsPickup.value)||0)+(+(els.stairsDrop&&els.stairsDrop.value)||0))*Number(CFG.stairsPerFloor||0));
    const disp = (jt==="tip") ? calcDisposal() : {fee:0,detail:""};
    const asm = (jt==="ikea") ? calcAssembly(ikeaBasket) : (jt==="flatpack" ? calcAssembly(flatBasket) : {cost:0,txt:'',itemLines:[]});

    let labourCost = 0, labourLine = '', lutonLine = '', lutonCost = 0;
    if (jt==='move'){
      const beds = parseInt(els.houseMoveBedrooms && els.houseMoveBedrooms.value || '0', 10);
      const map = CFG.BEDROOM_LOAD_MULTIPLIERS[beds];
      if (map){
        labourCost = Number(map.hours||0) * Number(CFG.HOURLY_RATE_MOVE||0);
        labourLine = `${map.hours} hrs labour @ £${Number(CFG.HOURLY_RATE_MOVE||0).toFixed(2)}/hr = £${labourCost.toFixed(2)}`;
      }
      const mode = (els.lutonNeeded && els.lutonNeeded.value) || 'auto';
      const autoNeed = map ? !!map.luton : false;
      const include = (mode==='yes') || (mode==='auto' && autoNeed);
      if (include){
        lutonCost = Number((els.lutonCost&&els.lutonCost.value)||CFG.LUTON_HIRE_COST||0);
        lutonLine = `Luton van hire: £${lutonCost.toFixed(2)} (${mode==='auto'?'auto':''}${mode==='yes'?'forced':''}${mode==='no'?'(overridden OFF)':''})`;
      } else if (mode==='no') {
        lutonLine = `Luton hire not included (overridden)`;
      } else {
        lutonLine = `Luton not required (auto)`;
      }
    }

    let total=base + mileageCost + stairs + twoMan + disp.fee + asm.cost + labourCost + lutonCost;

    const lines=[];
    lines.push(`Total journey: ${loopMiles.toFixed(1)} miles (${noteL|| (jt==='flatpack'?'Home → Destination → Home':'') })`);
    lines.push(`Charged mileage: ${Number(chargedMiles).toFixed(1)} miles @ £${Number(CFG.mileagePerMile).toFixed(2)}/mile (${noteC || (jt==='flatpack' ? '>15mi rule' : '')})`);
    lines.push(`Base: £${base.toFixed(2)}`);
    lines.push(`Mileage: £${mileageCost.toFixed(2)}`);
    if(stairs) lines.push(`Stairs: £${stairs.toFixed(2)}`);
    if(twoMan) lines.push(`Two-person: £${twoMan.toFixed(2)}`);
    if(jt==="tip" && disp.fee) lines.push(`Disposal: £${disp.fee.toFixed(2)} — ${disp.detail}`);
    if(asm.cost){
      if (asm.itemLines.length) lines.push(`Items:\n- ${asm.itemLines.join('\n- ')}`);
      lines.push(`Assembly: £${asm.cost.toFixed(2)}${asm.txt}`);
    }
    if (jt==='move'){
      if(labourLine) lines.push(labourLine);
      if(lutonLine)  lines.push(lutonLine);
    }
    if(jt==="shop" && els.shopTime) lines.push(`Run time: ${els.shopTime.value==="after22"?"After 10pm":"Before 10pm"}`);

    const MIN=minFor(jt); if(MIN>0 && total<MIN){ lines.push("Minimum charge applied"); total=MIN; }
    const pct=pctFor(jt), low=round5(total*(1-pct)), high=round5(total*(1+pct));

    if(els.breakdown) els.breakdown.innerHTML='• '+lines.join('<br>• ');
    if(els.total){ els.total.textContent=`Estimated: £${low.toFixed(0)}–£${high.toFixed(0)}`; els.total.classList.add('show'); }
    if(els.quoteId) els.quoteId.textContent="Quote ID — "+quoteId();
    if(els.btnWA){ els.btnWA.hidden=false; els.btnWA.classList.remove('hidden'); }
  }

  function sendWhatsApp(){
    const id=(els.quoteId&&els.quoteId.textContent||"").replace("Quote ID — ","").trim();
    const jt=(els.jobType&&els.jobType.value)||"";
    const lines=(els.breakdown&&els.breakdown.innerText||'').split('• ').filter(Boolean);
    const dest = (jt==="tip" ? "Destination: Waterbeach Waste Management Park"
                  : (jt==="flatpack" ? "Location: "+((els.addrDrop&&els.addrDrop.value)||"N/A")
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

  if(els.jobType) ['change','input','click','keyup','blur','focus'].forEach(ev=>els.jobType.addEventListener(ev,setUI));
  if(els.ikeaMode) els.ikeaMode.addEventListener('change', setUI);
  if(els.ikeaItemSel){ els.ikeaItemSel.addEventListener('change', toggleIkeaOther); toggleIkeaOther(); }
  if(els.ikeaAddBtn) els.ikeaAddBtn.addEventListener('click', addIkeaItem);
  if(els.flatItemSel){
    els.flatItemSel.addEventListener('change', ()=>{
      const isOther=(els.flatItemSel.value||'').startsWith('other');
      if(isOther) show(els.flatOtherWrap); else hide(els.flatOtherWrap);
    });
  }
  if(els.flatAddBtn) els.flatAddBtn.addEventListener('click', addFlatItem);

  if (els.houseMoveBedrooms) els.houseMoveBedrooms.addEventListener('change', ()=>{
    if (els.lutonNeeded && els.lutonNeeded.value==='auto') updateLutonHint();
  });
  if (els.lutonNeeded) els.lutonNeeded.addEventListener('change', updateLutonHint);
  if (els.lutonCost) els.lutonCost.addEventListener('input', updateLutonHint);

  if(els.btnCalc) els.btnCalc.addEventListener('click', async ()=>{
    if(els.routeHint) els.routeHint.textContent = "Calculating…";
    initMaps();
    const miles=await new Promise(resolve=>getMilesBoth(resolve));
    calculate(miles);
  });
  if(els.btnWA) els.btnWA.addEventListener('click', sendWhatsApp);

  hideAll(); setUI();
  renderList($('ikeaList'), $('ikeaTimeHint'), []);
  renderList($('flatList'), $('flatTimeHint'), []);
})();