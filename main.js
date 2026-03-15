// r414

window.BHD = Object.assign({
  version: "r414",
  whatsappNumber: "447717463496",

  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",

  mileagePerMile: 0.90,
  twoManSurcharge: 20,
  stairsPerFloor: 5,

  baseFees:{
    default:25,
    move:50,
    shopBefore22:15,
    shopAfter22:25,
    ikeaCollect:25,
    ikeaCollectBuild:25,
    flatpack:25,
    hay:10,
    bags:0,
    business:0
  },

  HOURLY_RATE_MOVE: 50,
  LUTON_HIRE_COST: 200,
  BEDROOM_LOAD_MULTIPLIERS: {
    1: { hours: 3, luton: false },
    2: { hours: 5, luton: true },
    3: { hours: 6, luton: true  },
    4: { hours: 8, luton: true  },
    5: { hours:10, luton: true  }
  },

  minByType:{ tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:"", flatpack:"", hay:"", bags:"" },
  rangePct:{ tip:0.15, move:0.12, fb:0.12, shop:0.10, student:0.12, business:0.15, other:0.15, ikea:0.12, flatpack:0.12, hay:0.10, bags:0.00 },

  disposalMinPct:0.25,
  disposalVat:0.20,
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

  bagPriceEach: 4,

  hayRentalPerBalePerDay: 5,
  haySalePerBale: 5,
  hayMinBales: 10,
  hayFullLoad: 16,
  hayDamagedFee: 2.50,

  useTimePricing: true,
  ikeaLaborPerHour: 35,
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
  const fmtMins=(mins)=>{const m=Math.max(0,Math.round(mins)); if(m<60)return `${m} min`; const h=Math.floor(m/60),r=m%60; return r?`${h}h ${r}m`:`${h}h`;};

  const CFG=window.BHD;

  const els={
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
  if(els.buildTag) els.buildTag.textContent='Build '+(CFG.version||'');
  if(els.lutonCost) els.lutonCost.value=Number(CFG.LUTON_HIRE_COST||0);

  if(els.wasteType&&els.wasteType.options.length===0){
    Object.keys(CFG.disposal||{}).forEach(k=>{
      const it=CFG.disposal[k],o=document.createElement('option');
      o.value=k; o.textContent=`${it.label} (£${Number(it.ratePerTonne||0).toFixed(2)}/t + VAT)`; els.wasteType.appendChild(o);
    });
  }

  function toggleIkeaOther(){
    if(!els.ikeaItemSel) return;
    const isOther=(els.ikeaItemSel.value||'').startsWith('other');
    if(isOther){show(els.ikeaOtherWrap);}else{hide(els.ikeaOtherWrap);}
  }

  const ikeaBasket=[]; const flatBasket=[];
  function laborPerMinuteEffective(){
    if(typeof CFG.ikeaLaborPerMinute==='number'&&!isNaN(CFG.ikeaLaborPerMinute)) return Number(CFG.ikeaLaborPerMinute);
    const perHour=Number(CFG.ikeaLaborPerHour||0);
    return perHour>0?(perHour/60):0.6;
  }
  function renderList(targetEl,timeHintEl,basket){
    targetEl.innerHTML='';
    if(basket.length===0){
      targetEl.innerHTML=`<div class="hint">No items added yet.</div>`;
      timeHintEl.textContent='';
      return;
    }
    let totalMin=0;
    basket.forEach((it,idx)=>{
      totalMin+=it.minutes*it.qty;
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
        basket[i].qty=v; renderList(targetEl,timeHintEl,basket);
      });
    });
    targetEl.querySelectorAll('button[data-remove]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const i=+e.target.getAttribute('data-remove'); basket.splice(i,1); renderList(targetEl,timeHintEl,basket);
      });
    });
  }
  function addIkeaItem(){
    const sel=(els.ikeaItemSel&&els.ikeaItemSel.value)||'';
    let minutes=0,name='',qty=Math.max(1,parseInt(els.ikeaQtyAdd&&els.ikeaQtyAdd.value||'1',10)||1);
    if(sel.startsWith('other')){
      name=(els.ikeaOtherName&&els.ikeaOtherName.value||'Custom item').trim();
      minutes=Math.max(5,parseInt(els.ikeaOtherMinutes&&els.ikeaOtherMinutes.value||'60',10)||60);
      if(!name) name='Custom item';
    }else if(sel){
      const [m,n]=sel.split('|'); minutes=Math.max(0,parseInt(m||'0',10)||0); name=n||'Item';
    }else{return;}
    const ex=ikeaBasket.find(i=>i.name===name&&i.minutes===minutes);
    if(ex) ex.qty+=qty; else ikeaBasket.push({name,minutes,qty});
    renderList(els.ikeaList,els.ikeaTimeHint,ikeaBasket);
  }
  function addFlatItem(){
    const sel=(els.flatItemSel&&els.flatItemSel.value)||'';
    let minutes=0,name='',qty=Math.max(1,parseInt(els.flatQtyAdd&&els.flatQtyAdd.value||'1',10)||1);
    if(sel.startsWith('other')){
      name=(els.flatOtherName&&els.flatOtherName.value||'Custom item').trim();
      minutes=Math.max(5,parseInt(els.flatOtherMinutes&&els.flatOtherMinutes.value||'60',10)||60);
      if(!name) name='Custom item';
    }else if(sel){
      const [m,n]=sel.split('|'); minutes=Math.max(0,parseInt(m||'0',10)||0); name=n||'Item';
    }else{return;}
    const ex=flatBasket.find(i=>i.name===name&&i.minutes===minutes);
    if(ex) ex.qty+=qty; else flatBasket.push({name,minutes,qty});
    renderList(els.flatList,els.flatTimeHint,flatBasket);
  }

  let lastJobType='';
  function clearAddresses(){if(els.addrPickup) els.addrPickup.value=''; if(els.addrDrop) els.addrDrop.value='';}
  function hideAll(){
    [els.pickupField,els.addrDropWrap,els.wasteWrap,els.twoManWrap,els.stairsWrap,els.shopTimeWrap,
     els.ikeaModeWrap,els.ikeaStoreWrap,els.ikeaItemsWrap,els.descWrap,els.flatpackItemsWrap,
     els.houseMoveBedroomsWrap,els.lutonWrap].forEach(hide);
    const hayWrap=$('hayWrap'); if(hayWrap) hide(hayWrap);
    const bagsWrap=$('bagsWrap'); if(bagsWrap) hide(bagsWrap);
    const businessWrap=$('businessWrap'); if(businessWrap) hide(businessWrap);
  }

  function setUI(){
    const v=els.jobType?els.jobType.value:'';
    if(lastJobType!=='ikea'&&v==='ikea'){clearAddresses();}
    lastJobType=v;
    hideAll();
    if(!v){if(els.routeHint) els.routeHint.textContent="Choose a job type to start."; return;}

    if(v==='tip'){
      show(els.pickupField); show(els.wasteWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Collection → Waterbeach (with >50mi rule).";
    }else if(v==='move'){
      show(els.pickupField); show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.houseMoveBedroomsWrap); show(els.lutonWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery. Labour & Luton based on bedrooms.";
      if(els.lutonCost&&!els.lutonCost.value) els.lutonCost.value=Number(CFG.LUTON_HIRE_COST||0);
      updateLutonHint();
    }else if(v==='fb'||v==='student'){
      show(els.pickupField); show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    }else if(v==='shop'){
      show(els.pickupField); show(els.addrDropWrap); show(els.shopTimeWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Shop → Delivery.";
    }else if(v==='ikea'){
      show(els.pickupField); show(els.ikeaModeWrap); show(els.ikeaStoreWrap); show(els.addrDropWrap);
      if(els.ikeaMode&&els.ikeaMode.value==='collectBuild'){
        show(els.ikeaItemsWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
      }else{show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);}
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → IKEA → Delivery.";
    }else if(v==='flatpack'){
      hide(els.pickupField); show(els.addrDropWrap); show(els.flatpackItemsWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Build only. Mileage billed only if >15 miles from home (one-way).";
    }else if(v==='hay'){
      hide(els.pickupField); show(els.addrDropWrap);
      const hayWrap=$('hayWrap'); if(hayWrap) show(hayWrap);
      if(els.routeHint) els.routeHint.textContent="Enter delivery address — mileage charged Home → Delivery → Home (return for rental collection).";
    }else if(v==='bags'){
      hide(els.pickupField); hide(els.addrDropWrap);
      const bagsWrap=$('bagsWrap'); if(bagsWrap) show(bagsWrap);
      if(els.routeHint) els.routeHint.textContent="Price is per bag — no mileage or base fee.";
    }else if(v==='business'){
      hide(els.pickupField); hide(els.addrDropWrap);
      const businessWrap=$('businessWrap'); if(businessWrap) show(businessWrap);
      if(els.routeHint) els.routeHint.textContent="No mileage calculated — Ben will confirm details via WhatsApp.";
    }else{
      show(els.pickupField); show(els.addrDropWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home → Pickup → Delivery.";
    }
  }

  function autoLutonFromBedrooms(){
    const beds=parseInt(els.houseMoveBedrooms&&els.houseMoveBedrooms.value||'0',10);
    const map=CFG.BEDROOM_LOAD_MULTIPLIERS[beds];
    return !!(map&&map.luton);
  }
  function updateLutonHint(){
    if(!els.lutonHint||!els.lutonNeeded) return;
    const mode=(els.lutonNeeded.value||'auto');
    const auto=autoLutonFromBedrooms();
    let txt=`Auto suggests: ${auto?"Luton needed":"no Luton"}.`;
    if(mode==='yes') txt+=` Forced ON.`;
    if(mode==='no')  txt+=` Forced OFF.`;
    els.lutonHint.textContent=txt+` Hire used: £${Number((els.lutonCost&&els.lutonCost.value)||CFG.LUTON_HIRE_COST).toFixed(0)}/day.`;
  }

  if(els.ikeaStore){
    els.ikeaStore.addEventListener('change',()=>{
      const v=els.ikeaStore.value||''; if(els.addrPickup) els.addrPickup.value=v;
    });
  }

  let directions=null,autoPickup=null,autoDrop=null,tryCount=0;
  function initMaps(){
    try{
      if(!window.google||!google.maps) return false;
      if(!directions) directions=new google.maps.DirectionsService();
      const opt={fields:["formatted_address","geometry"],componentRestrictions:{country:["gb"]},types:["geocode"]};
      if(!autoPickup&&els.addrPickup) autoPickup=new google.maps.places.Autocomplete(els.addrPickup,opt);
      if(!autoDrop&&els.addrDrop)     autoDrop=new google.maps.places.Autocomplete(els.addrDrop,opt);
      if(els.routeHint&&tryCount>0) els.routeHint.textContent="Maps OK — enter addresses.";
      return true;
    }catch(e){return false;}
  }
  const poll=setInterval(()=>{if(initMaps()) clearInterval(poll); else{tryCount++; if(tryCount%5===0&&els.routeHint) els.routeHint.textContent='Loading Google Maps…';}},300);

  function routeP(req){
    return new Promise(res=>{
      if(!directions){res({miles:0,legs:[]});return;}
      directions.route(req,(r,s)=>{
        if(s!=="OK"){res({miles:0,legs:[]});return;}
        const miles=metersToMiles(legsMeters(r.routes[0].legs));
        res({miles,legs:r.routes[0].legs});
      });
    });
  }

  async function getMilesBoth(cb){
    const jt=(els.jobType&&els.jobType.value)||"";
    const home=CFG.homeAddress, tip=CFG.waterbeachAddress;
    const pickup=(els.addrPickup&&els.addrPickup.value||"").trim();
    const drop=(els.addrDrop&&els.addrDrop.value||"").trim();

    if(jt==='business'){
      cb({charged:0,loop:0,noteCharged:'To be confirmed',noteLoop:''}); return;
    }

    if(jt==='bags'){
      if(els.routeHint) els.routeHint.textContent="Price is per bag — no mileage charge.";
      cb({charged:0,loop:0,noteCharged:'',noteLoop:''}); return;
    }

    if(jt==='hay'){
      if(!drop){if(els.routeHint) els.routeHint.textContent="Enter delivery address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}
      const hayTypeEl=$('hayType');
      const hayType=(hayTypeEl&&hayTypeEl.value)||'rental';
      if(hayType==='rental'){
        const loop=await routeP({origin:home,destination:home,waypoints:[{location:drop,stopover:true}],travelMode:'DRIVING'});
        const loopMiles=round1(loop.miles);
        if(els.routeHint) els.routeHint.textContent=`Hay rental: ${loopMiles} miles return (delivery + collection).`;
        cb({charged:loopMiles,loop:loopMiles,noteCharged:'Home → Delivery → Home (delivery + collection)',noteLoop:'Home → Delivery → Home'});
      }else{
        const oneWay=await routeP({origin:home,destination:drop,travelMode:'DRIVING'});
        const oneMiles=round1(oneWay.miles);
        if(els.routeHint) els.routeHint.textContent=`Hay sale: ${oneMiles} miles one-way delivery.`;
        cb({charged:oneMiles,loop:oneMiles,noteCharged:'Home → Delivery (one-way)',noteLoop:'Home → Delivery'});
      }
      return;
    }

    if(jt==='flatpack'){
      if(!drop){if(els.routeHint) els.routeHint.textContent="Enter destination address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}
      const oneWay=await routeP({origin:home,destination:drop,travelMode:'DRIVING'});
      const loop=await routeP({origin:home,destination:home,waypoints:[{location:drop,stopover:true}],travelMode:'DRIVING'});
      const charged=(oneWay.miles>15)?ceil0(oneWay.miles):0;
      if(els.routeHint) els.routeHint.textContent=`Flatpack: ${charged>0?"Charging one-way (home→dest)":"No mileage charged"} — ${charged} mi.`;
      cb({charged,loop:round1(loop.miles),noteCharged:charged>0?'Home → Destination — >15mi rule':'No mileage billed (≤15mi)',noteLoop:'Home → Destination → Home'});
      return;
    }

    if(!pickup){if(els.routeHint) els.routeHint.textContent="Enter collection address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}
    if(jt!=="tip"&&!drop){if(els.routeHint) els.routeHint.textContent="Enter delivery address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}

    let charged=0,loop=0,noteC='',noteL='';
    if(jt==='tip'){
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
    }else{
      const ch=await routeP({origin:home,destination:drop,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'});
      charged=ch.miles; noteC='Home → Pickup → Delivery';
      const lp=await routeP({origin:home,destination:home,waypoints:[{location:pickup,stopover:true},{location:drop,stopover:true}],travelMode:'DRIVING'});
      loop=lp.miles; noteL='Home → Pickup → Delivery → Home';
    }
    if(els.routeHint) els.routeHint.textContent=`Charged route: ${round1(charged)} mi — ${noteC}.`;
    cb({charged,loop,noteCharged:noteC,noteLoop:noteL});
  }

  const pctFor=jt=>(CFG.rangePct&&CFG.rangePct[jt]!=null)?Number(CFG.rangePct[jt]):0.12;
  const minFor=jt=>{const v=(CFG.minByType||{})[jt];return(v===""||v==null)?0:Math.max(0,Number(v));};
  function baseFeeFor(jt){
    if(jt==="move") return Number(CFG.baseFees.move||CFG.baseFees.default||0);
    if(jt==="shop") return(els.shopTime&&els.shopTime.value==="after22")?Number(CFG.baseFees.shopAfter22||CFG.baseFees.default||0):Number(CFG.baseFees.shopBefore22||CFG.baseFees.default||0);
    if(jt==="ikea") return(els.ikeaMode&&els.ikeaMode.value==="collectBuild")?Number(CFG.baseFees.ikeaCollectBuild||CFG.baseFees.default||0):Number(CFG.baseFees.ikeaCollect||CFG.baseFees.default||0);
    if(jt==="flatpack") return Number(CFG.baseFees.flatpack||CFG.baseFees.default||0);
    if(jt==="hay") return Number(CFG.baseFees.hay||0);
    if(jt==="bags") return 0;
    if(jt==="business") return 0;
    return Number(CFG.baseFees.default||0);
  }

  function calcDisposal(){
    if(!els.wasteType||!CFG.disposal) return{fee:0,detail:""};
    const key=els.wasteType.value,item=CFG.disposal[key]||{};
    const exVat=Number(item.ratePerTonne||0)*Number(CFG.disposalMinPct||0.25);
    const vat=exVat*Number(CFG.disposalVat||0);
    const minFee=exVat+vat;
    return{fee:minFee,detail:`Disposal: ${item.label||key} — 25% of £${Number(item.ratePerTonne||0).toFixed(2)}/t = £${exVat.toFixed(2)} + VAT £${vat.toFixed(2)}`};
  }

  function calcBags(){
    const bagsEl=$('bagsCount');
    const count=Math.max(1,parseInt(bagsEl&&bagsEl.value||'1',10)||1);
    const priceEach=Number(CFG.bagPriceEach||4);
    const bagCost=count*priceEach;
    const lines=[
      `${count} bag${count!==1?'s':''} @ £${priceEach}/bag = £${bagCost.toFixed(2)}`,
      `Disposed at Waterbeach Waste Management Park — fully licensed`,
    ];
    return{fee:bagCost,lines};
  }

  function calcHay(){
    const balesEl=$('hayBales');
    const hayTypeEl=$('hayType');
    const rawBales=parseInt(balesEl&&balesEl.value||'10',10)||10;
    const hayType=(hayTypeEl&&hayTypeEl.value)||'rental';
    const rentalPerBalePerDay=Number(CFG.hayRentalPerBalePerDay||5);
    const salePerBale=Number(CFG.haySalePerBale||5);
    const damagedFee=Number(CFG.hayDamagedFee||2.50);
    const fullLoad=Number(CFG.hayFullLoad||16);
    const minBales=Number(CFG.hayMinBales||10);

    if(hayType==='sale'){
      const bales=Math.max(1,rawBales);
      const saleCost=bales*salePerBale;
      const lines=[
        `${bales} bales for sale @ £${salePerBale}/bale = £${saleCost.toFixed(2)}`,
        `Mileage charged separately (one-way delivery)`,
      ];
      return{fee:saleCost,lines};
    }else{
      const bales=Math.max(minBales,rawBales);
      const isFullLoad=bales>=fullLoad;
      const rentalCost=bales*rentalPerBalePerDay;
      const lines=[
        `${bales} bales${isFullLoad?' (full load)':` (min ${minBales})`} rental @ £${rentalPerBalePerDay}/bale/day = £${rentalCost.toFixed(2)}`,
        `Mileage charged for return trip (delivery + collection)`,
        `⚠️ Damaged/wet bales: £${damagedFee.toFixed(2)}/bale — if wet, you keep them`,
      ];
      return{fee:rentalCost,lines};
    }
  }

  function calcAssembly(basket){
    let totalMinutes=0,totalItems=0,lines=[];
    if(basket.length>0){
      basket.forEach(i=>{totalMinutes+=i.minutes*i.qty; totalItems+=i.qty; lines.push(`${i.qty} × ${i.name} (${fmtMins(i.minutes)} each)`);});
    }
    let cost=0,txt='';
    if(CFG.useTimePricing&&totalMinutes>0){
      const perHour=Number(CFG.ikeaLaborPerHour||0)||Math.round(laborPerMinuteEffective()*60);
      const perMin=laborPerMinuteEffective();
      cost=totalMinutes*perMin; txt=` (~${fmtMins(totalMinutes)} @ £${perHour}/hour)`;
    }else if(totalItems>0){
      const perItem=Number(CFG.ikeaAssemblyPerItem||15);
      cost=totalItems*perItem; txt=` (${totalItems} × £${perItem.toFixed(2)}/item)`;
    }
    return{cost,txt,itemLines:lines};
  }

  function calculate(milesObj){
    const jt=(els.jobType&&els.jobType.value)||"";
    if(!jt){if(els.routeHint) els.routeHint.textContent="Pick a job type first."; return;}

    if(jt==='business'){
      if(els.breakdown) els.breakdown.innerHTML='• Ben will review your proposal and get back to you with a price.';
      if(els.total){els.total.textContent="Price on request"; els.total.classList.add('show');}
      if(els.quoteId) els.quoteId.textContent="Quote ID — "+quoteId();
      if(els.btnWA){els.btnWA.hidden=false; els.btnWA.classList.remove('hidden');}
      return;
    }

    const chargedMiles=round1(milesObj.charged||0);
    const loopMiles=round1(milesObj.loop||0);
    const noteC=milesObj.noteCharged||'';
    const noteL=milesObj.noteLoop||'';
    const base=baseFeeFor(jt);
    const mileageCost=chargedMiles*Number(CFG.mileagePerMile||0);

    let twoMan=0;
    if(jt!=="tip"&&jt!=="shop"&&jt!=="business"&&jt!=="other"&&jt!=="flatpack"&&jt!=="hay"&&jt!=="bags"){
      if(els.twoMan&&els.twoMan.value==="yes"){
        if(jt==='move'){
          const beds=parseInt(els.houseMoveBedrooms&&els.houseMoveBedrooms.value||'0',10);
          const map=CFG.BEDROOM_LOAD_MULTIPLIERS[beds];
          const hours=map?Number(map.hours||0):0;
          twoMan=hours*Number(CFG.twoManSurcharge||0);
        }else{
          twoMan=Number(CFG.twoManSurcharge||0);
        }
      }
    }

    const stairs=(jt==="tip"||jt==="shop"||jt==="business"||jt==="other"||jt==="flatpack"||jt==="hay"||jt==="bags")?0:(((+(els.stairsPickup&&els.stairsPickup.value)||0)+(+(els.stairsDrop&&els.stairsDrop.value)||0))*Number(CFG.stairsPerFloor||0));
    const disp=(jt==="tip")?calcDisposal():{fee:0,detail:""};
    const bags=(jt==="bags")?calcBags():{fee:0,lines:[]};
    const hay=(jt==="hay")?calcHay():{fee:0,lines:[]};
    const asm=(jt==="ikea")?calcAssembly(ikeaBasket):(jt==="flatpack"?calcAssembly(flatBasket):{cost:0,txt:'',itemLines:[]});

    let labourCost=0,labourLine='',lutonLine='',lutonCost=0;
    if(jt==='move'){
      const beds=parseInt(els.houseMoveBedrooms&&els.houseMoveBedrooms.value||'0',10);
      const map=CFG.BEDROOM_LOAD_MULTIPLIERS[beds];
      if(map){
        labourCost=Number(map.hours||0)*Number(CFG.HOURLY_RATE_MOVE||0);
        labourLine=`${map.hours} hrs labour @ £${Number(CFG.HOURLY_RATE_MOVE||0).toFixed(2)}/hr = £${labourCost.toFixed(2)}`;
      }
      const mode=(els.lutonNeeded&&els.lutonNeeded.value)||'auto';
      const autoNeed=map?!!map.luton:false;
      const include=(mode==='yes')||(mode==='auto'&&autoNeed);
      if(include){
        lutonCost=Number((els.lutonCost&&els.lutonCost.value)||CFG.LUTON_HIRE_COST||0);
        lutonLine=`Luton van hire: £${lutonCost.toFixed(2)} (${mode==='auto'?'auto':''}${mode==='yes'?'forced':''}${mode==='no'?'(overridden OFF)':''})`;
      }else if(mode==='no'){
        lutonLine=`Luton hire not included (overridden)`;
      }else{
        lutonLine=`Luton not required (auto)`;
      }
    }

    let total=base+mileageCost+stairs+twoMan+disp.fee+asm.cost+labourCost+lutonCost+bags.fee+hay.fee;
    const lines=[];

    if(jt==='bags'){
      // Bags — no mileage, no base fee, just bag cost
      bags.lines.forEach(l=>lines.push(l));
    }else{
      lines.push(`Total journey: ${loopMiles.toFixed(1)} miles (${noteL||(jt==='flatpack'?'Home → Destination → Home':'')})`);
      lines.push(`Charged mileage: ${Number(chargedMiles).toFixed(1)} miles @ £${Number(CFG.mileagePerMile).toFixed(2)}/mile (${noteC||(jt==='flatpack'?'>15mi rule':'')})`);
      lines.push(`Base: £${base.toFixed(2)}`);
      lines.push(`Mileage: £${mileageCost.toFixed(2)}`);
    }

    if(stairs) lines.push(`Stairs: £${stairs.toFixed(2)}`);
    if(twoMan){
      const beds=parseInt(els.houseMoveBedrooms&&els.houseMoveBedrooms.value||'0',10);
      const map=CFG.BEDROOM_LOAD_MULTIPLIERS[beds];
      lines.push(`Two-person helper: £${twoMan.toFixed(2)}${jt==='move'&&map?` (${map.hours} hrs @ £${Number(CFG.twoManSurcharge||0)}/hr)`:' (flat fee)'}`);
    }
    if(jt==="tip"&&disp.fee) lines.push(disp.detail);
    if(jt==="hay") hay.lines.forEach(l=>lines.push(l));
    if(asm.cost){
      if(asm.itemLines.length) lines.push(`Items:\n- ${asm.itemLines.join('\n- ')}`);
      lines.push(`Assembly: £${asm.cost.toFixed(2)}${asm.txt}`);
    }
    if(jt==='move'){
      if(labourLine) lines.push(labourLine);
      if(lutonLine)  lines.push(lutonLine);
    }
    if(jt==="shop"&&els.shopTime) lines.push(`Run time: ${els.shopTime.value==="after22"?"After 10pm":"Before 10pm"}`);

    const MIN=minFor(jt); if(MIN>0&&total<MIN){lines.push("Minimum charge applied"); total=MIN;}
    const pct=pctFor(jt),low=round5(total*(1-pct)),high=round5(total*(1+pct));
    if(els.breakdown) els.breakdown.innerHTML='• '+lines.join('<br>• ');
    if(els.total){els.total.textContent=`Estimated: £${low.toFixed(0)}–£${high.toFixed(0)}`; els.total.classList.add('show');}
    if(els.quoteId) els.quoteId.textContent="Quote ID — "+quoteId();
    if(els.btnWA){els.btnWA.hidden=false; els.btnWA.classList.remove('hidden');}
  }

  function sendWhatsApp(){
    const id=(els.quoteId&&els.quoteId.textContent||"").replace("Quote ID — ","").trim();
    const jt=(els.jobType&&els.jobType.value)||"";
    const lines=(els.breakdown&&els.breakdown.innerText||'').split('• ').filter(Boolean);
    const hayTypeEl=$('hayType');
    const hayType=(hayTypeEl&&hayTypeEl.value)||'rental';
    const dest=(jt==="tip")?"Destination: Waterbeach Waste Management Park"
               :jt==="flatpack"?"Location: "+((els.addrDrop&&els.addrDrop.value)||"N/A")
               :jt==="hay"?`Delivery address: ${(els.addrDrop&&els.addrDrop.value)||"N/A"} (${hayType==='rental'?'rental — collection required':'sale — no collection needed'})`
               :jt==="bags"?"Destination: Waterbeach Waste Management Park (via collection)"
               :jt==="business"?"Location: "+($('businessLocation')&&$('businessLocation').value||"N/A")
               :"Delivery: "+((els.addrDrop&&els.addrDrop.value)||"N/A");

    let businessDetails='';
    if(jt==='business'){
      const loc=$('businessLocation')&&$('businessLocation').value||'';
      const proposal=$('businessProposal')&&$('businessProposal').value||'';
      const freq=$('businessFrequency')&&$('businessFrequency').value||'once';
      businessDetails=[
        loc?`Location: ${loc}`:'',
        proposal?`Proposal: ${proposal}`:'',
        freq&&freq!=='once'?`Frequency: ${freq}`:'One-off job',
      ].filter(Boolean).join('\n');
    }

    const msg=[
      "Hey Ben! I need something Humpin' & Dumpin'",
      "Quote ID: "+id,
      "Job Type: "+(jt||"N/A"),
      jt==='business'?businessDetails:'',
      (jt!=='hay'&&jt!=='flatpack'&&jt!=='business'&&jt!=='bags'?"Collection: "+((els.addrPickup&&els.addrPickup.value)||"N/A"):""),
      (jt!=='business'?dest:''),
      (lines.length?"\nBreakdown:\n- "+lines.join("\n- "):""),
      (els.total&&els.total.textContent||"")
    ].filter(Boolean).join("\n");
    window.open("https://wa.me/"+CFG.whatsappNumber+"?text="+encodeURIComponent(msg),'_blank');
  }

  if(els.jobType) ['change','input','click','keyup','blur','focus'].forEach(ev=>els.jobType.addEventListener(ev,setUI));
  if(els.ikeaMode) els.ikeaMode.addEventListener('change',setUI);
  if(els.ikeaItemSel){els.ikeaItemSel.addEventListener('change',toggleIkeaOther); toggleIkeaOther();}
  if(els.ikeaAddBtn) els.ikeaAddBtn.addEventListener('click',addIkeaItem);
  if(els.flatItemSel){
    els.flatItemSel.addEventListener('change',()=>{
      const isOther=(els.flatItemSel.value||'').startsWith('other');
      if(isOther) show(els.flatOtherWrap); else hide(els.flatOtherWrap);
    });
  }
  if(els.flatAddBtn) els.flatAddBtn.addEventListener('click',addFlatItem);
  if(els.houseMoveBedrooms) els.houseMoveBedrooms.addEventListener('change',()=>{
    if(els.lutonNeeded&&els.lutonNeeded.value==='auto') updateLutonHint();
  });
  if(els.lutonNeeded) els.lutonNeeded.addEventListener('change',updateLutonHint);
  if(els.lutonCost) els.lutonCost.addEventListener('input',updateLutonHint);
  if(els.btnCalc) els.btnCalc.addEventListener('click',async()=>{
    if(els.routeHint) els.routeHint.textContent="Calculating…";
    initMaps();
    const miles=await new Promise(resolve=>getMilesBoth(resolve));
    calculate(miles);
  });
  if(els.btnWA) els.btnWA.addEventListener('click',sendWhatsApp);
  hideAll(); setUI();
  renderList($('ikeaList'),$('ikeaTimeHint'),[]);
  renderList($('flatList'),$('flatTimeHint'),[]);
})();
