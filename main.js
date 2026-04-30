// r426

window.BHD = Object.assign({
  version: "r426",
  whatsappNumber: "447717463496",

  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",

  mileagePerMile: 0.90,
  twoManSurcharge: 20,
  stairsPerFloor: 5,

  baseFees:{
    default:15,
    move:50,
    shopBefore22:10,
    shopAfter22:15,
    ikeaCollect:20,
    ikeaCollectBuild:20,
    flatpack:15,
    hay:10,
    bags:0,
    business:0,
    garden:0
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

  minByType:{ tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:"", flatpack:"", hay:"", bags:"", garden:"" },
  rangePct:{ tip:0.15, move:0.15, fb:0.15, shop:0.15, student:0.15, business:0.15, other:0.15, ikea:0.15, flatpack:0.15, hay:0.15, bags:0.00, garden:0.10 },

  disposalMinPct:0.25,
  disposalVat:0.20,
  disposal:{
    general:{label:"General Waste",ratePerTonne:196.73},
    soil:{label:"Soil/Inert",ratePerTonne:80.25},
    hardcore:{label:"Hardcore",ratePerTonne:25.00},
    plaster:{label:"Plasterboard",ratePerTonne:117.50},
    wood:{label:"Mixed Wood",ratePerTonne:100.50},
    mdf:{label:"MDF",ratePerTonne:196.73},
    metal:{label:"Metals",ratePerTonne:27.00},
    plastics:{label:"Rigid/Agricultural Plastics",ratePerTonne:196.73},
    green:{label:"Green material",ratePerTonne:100.50},
    cardboard:{label:"Cardboard (clean)",ratePerTonne:25.00},
    dmr:{label:"Dry Mixed Recycling",ratePerTonne:188.22},
    wuds:{label:"WUDs & POPs",ratePerTonne:365.00}
  },

  bagPriceEach: 4,
  hayRentalPerBalePerDay: 5,
  haySalePerBale: 5,
  hayMinBales: 10,
  hayFullLoad: 16,
  hayDamagedFee: 2.50,

  gardenSoloPerHour: 17.50,
  gardenTwoPerHour: 25.00,
  gardenMinHours: 2,
  gardenWasteRemovalFee: 0,

  useTimePricing: true,
  ikeaLaborPerHour: 25,
  ikeaLaborPerMinute: null,
  ikeaAssemblyPerItem: 25
}, window.BHD||{});

(function(){
  const $=id=>document.getElementById(id);
  const show=el=>{if(!el)return; el.removeAttribute('hidden'); el.classList.remove('hidden'); el.style.display='';};
  const hide=el=>{if(!el)return; el.setAttribute('hidden',''); el.classList.add('hidden'); el.style.display='none';};
  const round1=v=>Math.round(v*10)/10;
  const round5=v=>Math.round(v/5)*5;
  const metersToMiles=m=>m/1609.344;
  const legsMeters=legs=>legs.reduce((s,l)=>s+((l.distance&&l.distance.value)||0),0);
  const quoteId=()=>{const n=new Date(),p=v=>String(v).padStart(2,"0");return "ID"+n.getFullYear()+p(n.getMonth()+1)+p(n.getDate())+"-"+p(n.getHours())+p(n.getMinutes())+p(n.getSeconds());};
  const ceil0=v=>Math.ceil(v);
  const fmtMins=(mins)=>{const m=Math.max(0,Math.round(mins)); if(m<60)return m+" min"; const h=Math.floor(m/60),r=m%60; return r?h+"h "+r+"m":h+"h";};

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
      o.value=k;
      o.textContent=it.label+" (£"+(Number(it.ratePerTonne||0)*1.20).toFixed(2)+"/t inc VAT)";
      els.wasteType.appendChild(o);
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
      targetEl.innerHTML='<div class="hint">No items added yet.</div>';
      timeHintEl.textContent='';
      return;
    }
    let totalMin=0;
    basket.forEach((it,idx)=>{
      totalMin+=it.minutes*it.qty;
      const row=document.createElement('div');
      row.className='row';
      row.innerHTML='<div class="meta"><strong>'+it.name+'</strong><br><span class="hint">'+fmtMins(it.minutes)+' each</span></div><div class="qty"><input type="number" min="1" step="1" value="'+it.qty+'" data-idx="'+idx+'" class="qtyInput"><button class="btn small" data-remove="'+idx+'" type="button">Remove</button></div>';
      targetEl.appendChild(row);
    });
    timeHintEl.textContent='Est. total build time: ~'+fmtMins(totalMin);

    targetEl.querySelectorAll('.qtyInput').forEach(inp=>{
      inp.addEventListener('input',e=>{
        const i=+e.target.getAttribute('data-idx');
        const v=Math.max(1,parseInt(e.target.value||'1',10)||1);
        basket[i].qty=v;
        renderList(targetEl,timeHintEl,basket);
      });
    });

    targetEl.querySelectorAll('button[data-remove]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const i=+e.target.getAttribute('data-remove');
        basket.splice(i,1);
        renderList(targetEl,timeHintEl,basket);
      });
    });
  }

  function addIkeaItem(){
    const sel=(els.ikeaItemSel&&els.ikeaItemSel.value)||'';
    let minutes=0,name='';
    let qty=Math.max(1,parseInt(els.ikeaQtyAdd&&els.ikeaQtyAdd.value||'1',10)||1);

    if(sel.startsWith('other')){
      name=(els.ikeaOtherName&&els.ikeaOtherName.value||'Custom item').trim();
      minutes=Math.max(5,parseInt(els.ikeaOtherMinutes&&els.ikeaOtherMinutes.value||'60',10)||60);
      if(!name) name='Custom item';
    }else if(sel){
      const [m,n]=sel.split('|');
      minutes=Math.max(0,parseInt(m||'0',10)||0);
      name=n||'Item';
    }else{return;}

    const ex=ikeaBasket.find(i=>i.name===name&&i.minutes===minutes);
    if(ex) ex.qty+=qty;
    else ikeaBasket.push({name,minutes,qty});

    renderList(els.ikeaList,els.ikeaTimeHint,ikeaBasket);
  }

  function addFlatItem(){
    const sel=(els.flatItemSel&&els.flatItemSel.value)||'';
    let minutes=0,name='';
    let qty=Math.max(1,parseInt(els.flatQtyAdd&&els.flatQtyAdd.value||'1',10)||1);

    if(sel.startsWith('other')){
      name=(els.flatOtherName&&els.flatOtherName.value||'Custom item').trim();
      minutes=Math.max(5,parseInt(els.flatOtherMinutes&&els.flatOtherMinutes.value||'60',10)||60);
      if(!name) name='Custom item';
    }else if(sel){
      const [m,n]=sel.split('|');
      minutes=Math.max(0,parseInt(m||'0',10)||0);
      name=n||'Item';
    }else{return;}

    const ex=flatBasket.find(i=>i.name===name&&i.minutes===minutes);
    if(ex) ex.qty+=qty;
    else flatBasket.push({name,minutes,qty});

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
    const gardenWrap=$('gardenWrap'); if(gardenWrap) hide(gardenWrap);
  }

  function setUI(){
    const v=els.jobType?els.jobType.value:'';

    if(lastJobType!=='ikea'&&v==='ikea'){clearAddresses();}
    lastJobType=v;

    hideAll();

    if(!v){
      if(els.routeHint) els.routeHint.textContent="Choose a job type to start.";
      return;
    }

    if(v==='tip'){
      show(els.pickupField); show(els.wasteWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home to Collection to Waterbeach.";
    }else if(v==='move'){
      show(els.pickupField); show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.houseMoveBedroomsWrap); show(els.lutonWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home to Pickup to Delivery.";
      if(els.lutonCost&&!els.lutonCost.value) els.lutonCost.value=Number(CFG.LUTON_HIRE_COST||0);
      updateLutonHint();
    }else if(v==='fb'||v==='student'){
      show(els.pickupField); show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home to Pickup to Delivery.";
    }else if(v==='shop'){
      show(els.pickupField); show(els.addrDropWrap); show(els.shopTimeWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home to Shop to Delivery.";
    }else if(v==='ikea'){
      show(els.pickupField); show(els.ikeaModeWrap); show(els.ikeaStoreWrap); show(els.addrDropWrap);
      if(els.ikeaMode&&els.ikeaMode.value==='collectBuild'){
        show(els.ikeaItemsWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
      }else{
        show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
      }
      if(els.routeHint) els.routeHint.textContent="Mileage: Home to IKEA to Delivery.";
    }else if(v==='flatpack'){
      hide(els.pickupField); show(els.addrDropWrap); show(els.flatpackItemsWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Build only. Mileage billed only if over 15 miles from home.";
    }else if(v==='hay'){
      hide(els.pickupField); show(els.addrDropWrap);
      const hayWrap=$('hayWrap'); if(hayWrap) show(hayWrap);
      if(els.routeHint) els.routeHint.textContent="Enter delivery address. Mileage charged return trip for rental.";
    }else if(v==='bags'){
      hide(els.pickupField); hide(els.addrDropWrap);
      const bagsWrap=$('bagsWrap'); if(bagsWrap) show(bagsWrap);
      if(els.routeHint) els.routeHint.textContent="Price is per bag — no mileage or base fee.";
    }else if(v==='business'){
      hide(els.pickupField); hide(els.addrDropWrap);
      const businessWrap=$('businessWrap'); if(businessWrap) show(businessWrap);
      if(els.routeHint) els.routeHint.textContent="Ben will confirm details and price via WhatsApp.";
    }else if(v==='garden'){
      show(els.pickupField);
      const gardenWrap=$('gardenWrap'); if(gardenWrap) show(gardenWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Included.";
    }else{
      show(els.pickupField); show(els.addrDropWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home to Pickup to Delivery.";
    }
  }

  function updateLutonHint(){
    if(!els.lutonHint||!els.lutonNeeded) return;
    const mode=(els.lutonNeeded.value||'auto');
    const auto=false;
    let txt='Auto suggests: '+(auto?"Luton needed":"no Luton")+'.';
    if(mode==='yes') txt+=' Forced ON.';
    if(mode==='no') txt+=' Forced OFF.';
    els.lutonHint.textContent=txt+' Hire: £'+Number((els.lutonCost&&els.lutonCost.value)||CFG.LUTON_HIRE_COST).toFixed(0)+'/day.';
  }

  async function calculate(milesObj){
    const jt=(els.jobType&&els.jobType.value)||"";
    const base=0;
    let total=base;

    if(els.total){
      els.total.textContent="£"+total;
    }
  }

})();
