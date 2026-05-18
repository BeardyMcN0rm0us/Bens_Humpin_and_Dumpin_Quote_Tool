// r426

window.BHD = Object.assign({
  version: "r426",
  whatsappNumber: "447717463496",

  homeAddress: "15 Primrose Hill, Doddington, Cambs, PE15 0SU",
  waterbeachAddress: "Waterbeach Waste Management Park, CB25 9PG",

  mileagePerMile: 0.90,
  twoManSurcharge: 20,
  stairsPerFloor: 5,
  labourPerHour: 20,
  loadingMins: 30,

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

  minByType:{ tip:"", move:"", fb:"", shop:"", student:"", business:"", other:"", ikea:"", flatpack:"", hay:"", bags:"", garden:"", bike:"" },
  rangePct:{ tip:0.15, move:0.15, fb:0.15, shop:0.15, student:0.15, business:0.15, other:0.15, ikea:0.15, flatpack:0.15, hay:0.15, bags:0.00, garden:0.10, bike:0.10 },

  disposalMinPct:0.25,
  disposalVat:0.20,
  disposal:{
    general:{label:"General Waste",ratePerTonne:196.73},
    sofas:{label:"Sofas, Mattresses & Upholstered Furniture",ratePerTonne:365.00},
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
    wuds:{label:"Other WUDs/POPs (treated wood, chemicals etc)",ratePerTonne:365.00}
  },

  bagPriceEach: 4,
  hayRentalPerBalePerDay: 5,
  haySalePerBale: 5,
  hayMinBales: 10,
  hayFullLoad: 16,
  hayDamagedFee: 2.50,

  gardenSoloPerHour: 17.50,
  gardenTwoPerHour: 25.00,
  gardenThreePerHour: 40,
  gardenMinHours: 2,
  gardenWasteRemovalFee: 0,

  gardenPensionerDiscountPct: 10,
  gardenNeighbourDiscountTwoMan: 10,
  gardenNeighbourDiscountSolo: 5,
  gardenOngoingDiscountPct: { weekly: 15, fortnightly: 10, monthly: 5 },
  gardenWeedKillingCost: { small: 10, medium: 20, large: 35, xl: 50 },

  gardenOffer: {
    soloType:  'none',
    soloValue: 0,
    soloLabel: '',
    twoType:   'none',
    twoValue:  0,
    twoLabel:  '',
  },

  bikePricingMode: 'job',
  bikeLabourPerHour: 22.50,
  bikePackages: {
    basic:    { label: 'Basic Tune-Up',    price: 30,  hours: 1.0 },
    standard: { label: 'Standard Service', price: 55,  hours: 2.0 },
    overhaul: { label: 'Full Overhaul',    price: 95,  hours: 3.5 },
  },
  bikeLabour: {
    punctureRepair:12, brakeAdjust:6,  gearAdjust:12, chainLube:6,   safetyCheck:12,
    tubeReplace:12,    tyreReplace:12, brakeCable:12, brakePads:6,   gearCable:12,
    chainReplace:12,   cassetteReplace:22, wheelTrue:12, barTape:12, grips:6,
    pedalReplace:6,    bottomBracket:22, headset:17,
  },
  bikeParts: {
    innerTubeStandard:5, innerTubeSpecialist:7,
    tyreBasicRoad:14, tyreBasicMtb:16, tyreMidRange:26,
    brakePadsRim:8, brakePadsDiscCable:12, brakePadsHydraulic:14,
    brakeCable:6, gearCable:6,
    chain8spd:12, chain10spd:18, chain11spd:26, chain12spd:35,
    cassette8spd:13, cassette10spd:22, cassette12spd:42,
    barTape:11, grips:9, pedalsFlat:16, pedalsClipless:36, bottomBracket:22,
  },
  bikeCollectionMode:      'flat',
  bikeCollectionFlatFee:    5,
  bikeCollectionPerMile:    0.50,
  bikeCollectionWaivedAbove:60,

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

  const BD_ICONS=[
    [/service/i,'🔧'],[/mileage|miles? @/i,'🚗'],[/charged:/i,'🚗'],
    [/base fee/i,'📋'],[/labour|labor|\bhrs?\b/i,'⏱'],[/luton/i,'🚐'],
    [/disposal|waste remov/i,'♻️'],[/two.person|helper/i,'👥'],
    [/assembly/i,'🔩'],[/package/i,'📦'],[/discount/i,'✂️'],
    [/stairs/i,'🏠'],[/minimum/i,'⚡'],[/ongoing/i,'🔄'],
    [/parts/i,'🔩'],[/collection/i,'🚲'],[/rental|bale/i,'🌾'],
    [/run time/i,'🕐'],[/items?:/i,'📦'],
  ];
  function bdIcon(text){
    for(var i=0;i<BD_ICONS.length;i++) if(BD_ICONS[i][0].test(text)) return BD_ICONS[i][1];
    return '·';
  }

  const setBreakdownLines=(el,entries)=>{
    if(!el) return;
    el.innerHTML='';
    (entries||[]).forEach((entry,idx)=>{
      const row=document.createElement('div');
      row.className='bd-line br-line';
      row.style.setProperty('--i',idx);
      const icon=document.createElement('span');
      icon.className='bd-icon';
      icon.setAttribute('aria-hidden','true');
      icon.textContent=bdIcon(entry);
      const text=document.createElement('span');
      text.className='bd-text';
      text.textContent=entry;
      row.appendChild(icon);
      row.appendChild(text);
      el.appendChild(row);
    });
  };

  const JOB_LABELS={
    tip:'Tip Run',
    move:'House Move',
    fb:'Facebook Marketplace Pickup/Drop-off',
    shop:'Emergency Shop Run',
    student:'Student Relocation',
    ikea:'IKEA Collect / Build',
    flatpack:'Flat Pack Build',
    hay:'Hay Bale Rental',
    bags:'Black Bag Collection',
    garden:'Gardening',
    bike:'Bicycle Servicing',
    business:'Business Enquiry',
    other:'Other'
  };
  const jobLabel=jt=>JOB_LABELS[jt]||jt||'';

  function getNeighbourStreet(input){
    if(!input) return '';
    if(input.dataset && input.dataset.street) return input.dataset.street;
    return '';
  }
  function updateNeighbourStreetWarning(){
    const w=document.getElementById('gardenNeighbourStreetWarn');
    if(!w) return;
    const s1=getNeighbourStreet(document.getElementById('gardenNeighbour1'));
    const s2=getNeighbourStreet(document.getElementById('gardenNeighbour2'));
    const both=s1&&s2;
    const differ=both && s1!==s2;
    w.style.display = differ ? '' : 'none';
  }
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
    buildTag:$('buildTag'),
    // Garden
    gardenWrap:$('gardenWrap'),
    gardenHours:$('gardenHours'), gardenRateHint:$('gardenRateHint'),
    gardenTeam:$('gardenTeam'), gardenSoloBtn:$('gardenSoloBtn'), gardenTwoBtn:$('gardenTwoBtn'), gardenThreeBtn:$('gardenThreeBtn'),
    gardenSchedule:$('gardenSchedule'), gardenFrequencyWrap:$('gardenFrequencyWrap'), gardenFrequency:$('gardenFrequency'),
    gardenDayOfWeek:$('gardenDayOfWeek'), gardenTimeOfDay:$('gardenTimeOfDay'),
    gardenStartingWeekWrap:$('gardenStartingWeekWrap'), gardenStartingWeek:$('gardenStartingWeek'),
    gardenWeekOfMonthWrap:$('gardenWeekOfMonthWrap'), gardenWeekOfMonth:$('gardenWeekOfMonth'),
    gardenSize:$('gardenSize'),
    gardenDiscountType:$('gardenDiscountType'), gardenDiscountWarning:$('gardenDiscountWarning'),
    gardenNeighbourWrap:$('gardenNeighbourWrap'),
    gardenNeighbour1:$('gardenNeighbour1'), gardenNeighbour2:$('gardenNeighbour2'),
    gardenNeighbourHint:$('gardenNeighbourHint'),
    gardenNeighbourStreetWarn:$('gardenNeighbourStreetWarn'),
    gardenOngoingDiscountNote:$('gardenOngoingDiscountNote'),
    gardenOngoingDiscountPct:$('gardenOngoingDiscountPct'),
    gardenWeedKillingHint:$('gardenWeedKillingHint'),
    // Bike
    bikeWrap:$('bikeWrap'),
    bikeMode:$('bikeMode'), bikePackage:$('bikePackage'),
    bikePkgBasicBtn:$('bikePkgBasicBtn'), bikePkgStandardBtn:$('bikePkgStandardBtn'), bikePkgOverhaulBtn:$('bikePkgOverhaulBtn'),
    bikePackageHint:$('bikePackageHint'), bikePackageWrap:$('bikePackageWrap'), bikeItemsWrap:$('bikeItemsWrap'),
    bikeTyreSizeWrap:$('bikeTyreSizeWrap'), bikeTyreQtyWrap:$('bikeTyreQtyWrap'),
    bikeTyreQtyLabel:$('bikeTyreQtyLabel'), bikeTyreQty:$('bikeTyreQty'),
    bikeWheelSize:$('bikeWheelSize'),
    bikeBrakeTypeWrap:$('bikeBrakeTypeWrap'), bikeBrakeQtyWrap:$('bikeBrakeQtyWrap'),
    bikeBrakeQtyLabel:$('bikeBrakeQtyLabel'), bikeBrakeType:$('bikeBrakeType'), bikeBrakeQty:$('bikeBrakeQty'),
    bikeWheelQtyWrap:$('bikeWheelQtyWrap'), bikeWheelQty:$('bikeWheelQty'),
    bikeSpeedsWrap:$('bikeSpeedsWrap'), bikeSpeeds:$('bikeSpeeds'),
    bikeBarTypeWrap:$('bikeBarTypeWrap'), bikeBarType:$('bikeBarType'),
    bikePedalTypeWrap:$('bikePedalTypeWrap'), bikePedalType:$('bikePedalType'),
    bikeType:$('bikeType'), bikeCustomerParts:$('bikeCustomerParts'), bikeCustomerPartsWrap:$('bikeCustomerPartsWrap'),
    bikeDropoff:$('bikeDropoff'), bikeCollectionWrap:$('bikeCollectionWrap'),
    bikeAddr:$('bikeAddr'), bikeCollectionHint:$('bikeCollectionHint'),
    bikeNotes:$('bikeNotes'),
  };

  if(els.buildTag) els.buildTag.textContent='Build '+(CFG.version||'');
  if(els.lutonCost) els.lutonCost.value=Number(CFG.LUTON_HIRE_COST||0);

  if(els.gardenSoloBtn) els.gardenSoloBtn.textContent='Solo — £'+(CFG.gardenSoloPerHour||17.50)+'/hr';
  if(els.gardenTwoBtn)  els.gardenTwoBtn.innerHTML='2-Person — £'+(CFG.gardenTwoPerHour||25)+'/hr<span class="best-value-badge">Best Value</span>';
  if(els.gardenThreeBtn)  els.gardenThreeBtn.textContent='ON REQUEST: 3-Person - £'+(CFG.gardenThreePerHour||40)+'/hr';
  // gardenOngoingDiscountPct span is kept current by updateGardenUI()

  // Set bike package button labels from config
  (function(){
    const pkgs=CFG.bikePackages||{};
    const mode=CFG.bikePricingMode||'job';
    const rate=Number(CFG.bikeLabourPerHour||22.50);
    function pkgPrice(k){ const p=pkgs[k]||{}; return mode==='hourly'?'£'+(p.hours*rate).toFixed(0)+' ('+p.hours+'hr)':'£'+(p.price||0); }
    if(els.bikePkgBasicBtn)    els.bikePkgBasicBtn.textContent    = 'Basic Tune-Up — '+pkgPrice('basic');
    if(els.bikePkgStandardBtn) els.bikePkgStandardBtn.textContent = 'Standard Service — '+pkgPrice('standard');
    if(els.bikePkgOverhaulBtn) els.bikePkgOverhaulBtn.textContent = 'Full Overhaul — '+pkgPrice('overhaul');
  })();

  const bagsHintEl=$('bagsHint');
  if(bagsHintEl) bagsHintEl.textContent='£'+(CFG.bagPriceEach||4)+'/bag — all bags disposed at Waterbeach Waste Management Park. Fully licensed.';

  const hayHintEl=$('hayHint');
  if(hayHintEl) hayHintEl.textContent='Rental: min '+(CFG.hayMinBales||10)+' bales · Full load = '+(CFG.hayFullLoad||16)+' · £'+(CFG.hayDamagedFee||2.50)+'/bale if damaged or wet · If wet, you keep them';

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
    const bikeWrap=$('bikeWrap'); if(bikeWrap) hide(bikeWrap);
  }

  function updateGardenUI(){
    const team=(els.gardenTeam&&els.gardenTeam.value)||'solo';
    const hours=parseFloat((els.gardenHours&&els.gardenHours.value)||2)||2;
    const schedule=(els.gardenSchedule&&els.gardenSchedule.value)||'oneoff';
    const discountType=(els.gardenDiscountType&&els.gardenDiscountType.value)||'none';

    if(els.gardenRateHint){
      const rate = team==='three' ? (CFG.gardenThreePerHour||40) : team==='two' ? (CFG.gardenTwoPerHour||25) : (CFG.gardenSoloPerHour||17.50);
      const raw = rate * hours;
      els.gardenRateHint.textContent = '£'+rate+'/hr × '+hours+' hr'+(hours!==1?'s':'')+' = £'+raw.toFixed(2)+' before any discounts';
    }

    if(els.gardenFrequencyWrap){
      if(schedule==='ongoing'){ show(els.gardenFrequencyWrap); } else { hide(els.gardenFrequencyWrap); }
    }

    {
      const freq=(els.gardenFrequency&&els.gardenFrequency.value)||'fortnightly';
      if(els.gardenStartingWeekWrap){
        if(schedule==='ongoing' && freq==='fortnightly'){ show(els.gardenStartingWeekWrap); } else { hide(els.gardenStartingWeekWrap); }
      }
      if(els.gardenWeekOfMonthWrap){
        if(schedule==='ongoing' && freq==='monthly'){ show(els.gardenWeekOfMonthWrap); } else { hide(els.gardenWeekOfMonthWrap); }
      }
    }

    if(els.gardenOngoingDiscountNote){
      els.gardenOngoingDiscountNote.style.display = schedule==='ongoing' ? '' : 'none';
    }

    if(els.gardenOngoingDiscountPct){
      const freq=(els.gardenFrequency&&els.gardenFrequency.value)||'fortnightly';
      const pctCfg=CFG.gardenOngoingDiscountPct;
      const pct=typeof pctCfg==='object'&&pctCfg!==null ? Number(pctCfg[freq]||pctCfg.fortnightly||10) : Number(pctCfg||10);
      els.gardenOngoingDiscountPct.textContent=pct;
    }

    if(els.gardenNeighbourWrap){
      if(discountType==='neighbour'){ show(els.gardenNeighbourWrap); } else { hide(els.gardenNeighbourWrap); }
    }

    if(els.gardenNeighbourHint){
      const flat = Number(CFG.gardenNeighbourDiscountSolo||5);
      const stackPct = Number(CFG.gardenNeighbourStackPct!=null?CFG.gardenNeighbourStackPct:50);
      const stacked = Math.round(flat*(stackPct/100)*100)/100;
      els.gardenNeighbourHint.textContent = '£'+flat+' off your booking when a neighbour also books — flat rate, not per address. Each property gets £'+flat+' off their own quote. Requires at least 2 hours booked. Neighbours must be on the same street or an adjacent street. On weekly bookings: stacks at '+stackPct+'% (£'+stacked.toFixed(2)+' on top of weekly loyalty); on other frequencies, only the bigger discount applies.';
    }

    if(els.gardenDiscountWarning){
      els.gardenDiscountWarning.style.display = discountType!=='none' ? '' : 'none';
    }

    if(els.gardenWeedKillingHint){
      const weedCb=document.querySelector('input[name="gardenTask"][value="Weed killing"]');
      const weedChecked=weedCb&&weedCb.checked;
      if(weedChecked){
        const gardenSize=((els.gardenSize&&els.gardenSize.value)||'').trim();
        const wkCfg=CFG.gardenWeedKillingCost||{small:10,medium:20,large:35,xl:50};
        if(gardenSize&&wkCfg[gardenSize]!=null){
          els.gardenWeedKillingHint.textContent='ⓘ Weed killer surcharge for a '+gardenSize+' garden: £'+Number(wkCfg[gardenSize]).toFixed(2)+' (added on top of labour)';
        } else {
          els.gardenWeedKillingHint.textContent='ⓘ Weed killer surcharge: select a garden size to see the price';
        }
        els.gardenWeedKillingHint.style.display='';
      } else {
        els.gardenWeedKillingHint.style.display='none';
      }
    }
  }

  function updateBikePackageHint(){
    if(!els.bikePackageHint) return;
    const pkg=(els.bikePackage&&els.bikePackage.value)||'basic';
    const pkgCfg=(CFG.bikePackages||{})[pkg]||{label:'Basic Tune-Up',price:30,hours:1};
    const mode=CFG.bikePricingMode||'job';
    const rate=Number(CFG.bikeLabourPerHour||22.50);
    let priceStr;
    if(mode==='hourly'){
      const p=Number(pkgCfg.hours||1)*rate;
      priceStr=pkgCfg.hours+'hr @ £'+rate+'/hr = £'+p.toFixed(2);
    }else{
      priceStr='£'+Number(pkgCfg.price||0).toFixed(2);
    }
    const descs={
      basic:'Safety check · brake &amp; gear adjustment · chain lube',
      standard:'Tune-up + degrease · cables checked · wheels trued',
      overhaul:'Full strip-down · all cables replaced · bearings re-greased',
    };
    els.bikePackageHint.innerHTML=priceStr+' &mdash; '+(descs[pkg]||'');
  }

  function updateBikeCollectionHint(){
    if(!els.bikeCollectionHint) return;
    const mode=CFG.bikeCollectionMode||'flat';
    const waive=Number(CFG.bikeCollectionWaivedAbove||60);
    if(mode==='flat'){
      const fee=Number(CFG.bikeCollectionFlatFee||5);
      els.bikeCollectionHint.textContent='£'+fee.toFixed(2)+' collect & return fee — waived on jobs over £'+waive;
    }else{
      els.bikeCollectionHint.textContent='£'+Number(CFG.bikeCollectionPerMile||0.50)+'/mile — calculated when you get your quote';
    }
  }

  function updateBikeItemsUI(){
    const checked=Array.from(document.querySelectorAll('input[name="bikeService"]:checked')).map(cb=>cb.value);
    const needsTyre=checked.includes('tubeReplace')||checked.includes('tyreReplace');
    const needsBrake=checked.includes('brakePads')||checked.includes('brakeCable')||checked.includes('brakeAdjust');
    const needsSpeeds=checked.includes('chainReplace')||checked.includes('cassetteReplace');
    const needsBar=checked.includes('barTape');
    const needsPedal=checked.includes('pedalReplace');
    const needsWheelQty=checked.includes('wheelTrue');

    if(needsTyre){show(els.bikeTyreSizeWrap);show(els.bikeTyreQtyWrap);}else{hide(els.bikeTyreSizeWrap);hide(els.bikeTyreQtyWrap);}
    if(needsBrake){show(els.bikeBrakeTypeWrap);show(els.bikeBrakeQtyWrap);}else{hide(els.bikeBrakeTypeWrap);hide(els.bikeBrakeQtyWrap);}
    if(needsSpeeds){show(els.bikeSpeedsWrap);}else{hide(els.bikeSpeedsWrap);}
    if(needsBar){show(els.bikeBarTypeWrap);}else{hide(els.bikeBarTypeWrap);}
    if(needsPedal){show(els.bikePedalTypeWrap);}else{hide(els.bikePedalTypeWrap);}
    if(needsWheelQty){show(els.bikeWheelQtyWrap);}else{hide(els.bikeWheelQtyWrap);}

    if(els.bikeTyreQtyLabel){
      const t=checked.includes('tyreReplace'), u=checked.includes('tubeReplace');
      els.bikeTyreQtyLabel.textContent=t&&u?'Which tyres & tubes?':t?'Which tyres?':'Which tubes?';
    }
    if(els.bikeBrakeQtyLabel){
      const multi=checked.filter(k=>['brakePads','brakeCable','brakeAdjust'].includes(k)).length>1;
      els.bikeBrakeQtyLabel.textContent=multi?'Front, rear, or both?':checked.includes('brakePads')?'Which brake pads?':checked.includes('brakeCable')?'Which brake cables?':'Which brakes?';
    }
  }

  function updateBikeUI(){
    const mode=(els.bikeMode&&els.bikeMode.value)||'package';
    if(mode==='package'){show(els.bikePackageWrap);hide(els.bikeItemsWrap);hide(els.bikeCustomerPartsWrap);if(els.bikeCustomerParts)els.bikeCustomerParts.checked=false;}
    else{hide(els.bikePackageWrap);show(els.bikeItemsWrap);show(els.bikeCustomerPartsWrap);updateBikeItemsUI();}

    const dropoff=(els.bikeDropoff&&els.bikeDropoff.value)||'dropoff';
    if(dropoff==='collection'){show(els.bikeCollectionWrap);updateBikeCollectionHint();}
    else{hide(els.bikeCollectionWrap);}

    updateBikePackageHint();
  }

  function calcBikeQuote(milesObj){
    const mode=(els.bikeMode&&els.bikeMode.value)||'package';
    const customerParts=!!(els.bikeCustomerParts&&els.bikeCustomerParts.checked);
    const dropoff=(els.bikeDropoff&&els.bikeDropoff.value)||'dropoff';
    const BP=CFG.bikeParts||{};
    const pricingMode=CFG.bikePricingMode||'job';
    const hourlyRate=Number(CFG.bikeLabourPerHour||22.50);
    const HOURS={punctureRepair:0.5,brakeAdjust:0.25,gearAdjust:0.5,chainLube:0.25,safetyCheck:0.5,tubeReplace:0.5,tyreReplace:0.5,brakeCable:0.5,brakePads:0.25,gearCable:0.5,chainReplace:0.5,cassetteReplace:1,wheelTrue:0.5,barTape:0.5,grips:0.25,pedalReplace:0.25,bottomBracket:1,headset:0.75};
    function labourPrice(key){
      if(pricingMode==='hourly') return (HOURS[key]||0.5)*hourlyRate;
      return Number((CFG.bikeLabour||{})[key]||0);
    }

    const lines=[];
    let labourTotal=0, partsTotal=0;

    if(mode==='package'){
      const pkg=(els.bikePackage&&els.bikePackage.value)||'basic';
      const pkgCfg=(CFG.bikePackages||{})[pkg]||{label:'Basic Tune-Up',price:30,hours:1};
      if(pricingMode==='hourly'){
        labourTotal=Number(pkgCfg.hours||1)*hourlyRate;
        lines.push(pkgCfg.label+': '+pkgCfg.hours+'hr @ £'+hourlyRate+'/hr = £'+labourTotal.toFixed(2));
      }else{
        labourTotal=Number(pkgCfg.price||0);
        lines.push(pkgCfg.label+': £'+labourTotal.toFixed(2));
      }
      if(pkg==='overhaul'&&!customerParts){
        const cablesCost=(Number(BP.brakeCable||6)*2)+(Number(BP.gearCable||6)*2);
        partsTotal+=cablesCost;
        lines.push('Cables (2× brake + 2× gear): £'+cablesCost.toFixed(2));
      }
    }else{
      const checked=Array.from(document.querySelectorAll('input[name="bikeService"]:checked')).map(cb=>cb.value);
      const brakeType=(els.bikeBrakeType&&els.bikeBrakeType.value)||'rim';
      const brakeQty=parseInt((els.bikeBrakeQty&&els.bikeBrakeQty.value)||'1',10)||1;
      const tyreQty=parseInt((els.bikeTyreQty&&els.bikeTyreQty.value)||'1',10)||1;
      const wheelQty=parseInt((els.bikeWheelQty&&els.bikeWheelQty.value)||'1',10)||1;
      const speeds=parseInt((els.bikeSpeeds&&els.bikeSpeeds.value)||'8',10)||8;
      const barType=(els.bikeBarType&&els.bikeBarType.value)||'tape';
      const pedalType=(els.bikePedalType&&els.bikePedalType.value)||'flat';
      const wheelSize=(els.bikeWheelSize&&els.bikeWheelSize.value)||'';
      const isMtbWheel=['26"','27.5"','29"'].includes(wheelSize);

      if(checked.length===0){
        lines.push('No services selected — tick the items needed above');
      }
      checked.forEach(key=>{
        let labour=0, partsCost=0, partDesc='', itemLabel='';
        switch(key){
          case 'punctureRepair':  itemLabel='Puncture repair';       labour=labourPrice(key); break;
          case 'safetyCheck':     itemLabel='Safety check';          labour=labourPrice(key); break;
          case 'chainLube':       itemLabel='Chain clean & lube';    labour=labourPrice(key); break;
          case 'gearAdjust':      itemLabel='Gear indexing';         labour=labourPrice(key); break;
          case 'headset':         itemLabel='Headset service';       labour=labourPrice(key); break;
          case 'brakeAdjust':
            itemLabel='Brake adjustment ×'+brakeQty;
            labour=labourPrice('brakeAdjust')*brakeQty;
            break;
          case 'brakePads':
            itemLabel='Brake pads ×'+brakeQty+' set'+(brakeQty>1?'s':'');
            labour=labourPrice('brakePads')*brakeQty;
            if(!customerParts){
              const p=brakeType==='hydraulic'?Number(BP.brakePadsHydraulic||14):brakeType==='discCable'?Number(BP.brakePadsDiscCable||12):Number(BP.brakePadsRim||8);
              partsCost=p*brakeQty; partDesc=' + parts £'+partsCost.toFixed(2);
            }
            break;
          case 'brakeCable':
            itemLabel='Brake cable ×'+brakeQty;
            labour=labourPrice('brakeCable')*brakeQty;
            if(!customerParts){partsCost=Number(BP.brakeCable||6)*brakeQty; partDesc=' + parts £'+partsCost.toFixed(2);}
            break;
          case 'gearCable':
            itemLabel='Gear cable';
            labour=labourPrice('gearCable');
            if(!customerParts){partsCost=Number(BP.gearCable||6); partDesc=' + parts £'+partsCost.toFixed(2);}
            break;
          case 'tubeReplace':
            itemLabel='Inner tube ×'+tyreQty;
            labour=labourPrice('tubeReplace')*tyreQty;
            if(!customerParts){
              const p=(['27.5"','29"'].includes(wheelSize))?Number(BP.innerTubeSpecialist||7):Number(BP.innerTubeStandard||5);
              partsCost=p*tyreQty; partDesc=' + parts £'+partsCost.toFixed(2);
            }
            break;
          case 'tyreReplace':
            itemLabel='Tyre ×'+tyreQty;
            labour=labourPrice('tyreReplace')*tyreQty;
            if(!customerParts){
              const p=isMtbWheel?Number(BP.tyreBasicMtb||16):Number(BP.tyreBasicRoad||14);
              partsCost=p*tyreQty; partDesc=' + parts est. £'+partsCost.toFixed(2);
            }
            break;
          case 'chainReplace':
            itemLabel='Chain replacement';
            labour=labourPrice('chainReplace');
            if(!customerParts){
              const k=speeds>=12?'chain12spd':speeds>=11?'chain11spd':speeds>=9?'chain10spd':'chain8spd';
              partsCost=Number(BP[k]||12); partDesc=' + parts £'+partsCost.toFixed(2);
            }
            break;
          case 'cassetteReplace':
            itemLabel='Cassette / freewheel replacement';
            labour=labourPrice('cassetteReplace');
            if(!customerParts){
              const k=speeds>=11?'cassette12spd':speeds>=9?'cassette10spd':'cassette8spd';
              partsCost=Number(BP[k]||13); partDesc=' + parts £'+partsCost.toFixed(2);
            }
            break;
          case 'wheelTrue':
            itemLabel='Wheel truing ×'+wheelQty;
            labour=labourPrice('wheelTrue')*wheelQty;
            break;
          case 'barTape':
            if(barType==='grips'){
              itemLabel='Grip replacement'; labour=labourPrice('grips');
              if(!customerParts){partsCost=Number(BP.grips||9); partDesc=' + parts £'+partsCost.toFixed(2);}
            }else{
              itemLabel='Bar tape rewrap'; labour=labourPrice('barTape');
              if(!customerParts){partsCost=Number(BP.barTape||11); partDesc=' + parts £'+partsCost.toFixed(2);}
            }
            break;
          case 'pedalReplace':
            itemLabel='Pedal replacement';
            labour=labourPrice('pedalReplace');
            if(!customerParts){
              partsCost=pedalType==='clipless'?Number(BP.pedalsClipless||36):Number(BP.pedalsFlat||16);
              partDesc=' + parts £'+partsCost.toFixed(2);
            }
            break;
          case 'bottomBracket':
            itemLabel='Bottom bracket service';
            labour=labourPrice('bottomBracket');
            if(!customerParts){partsCost=Number(BP.bottomBracket||22); partDesc=' + parts £'+partsCost.toFixed(2);}
            break;
        }
        labourTotal+=labour; partsTotal+=partsCost;
        if(itemLabel) lines.push(itemLabel+': £'+labour.toFixed(2)+' labour'+partDesc);
      });
    }

    if(customerParts&&partsTotal===0) lines.push('Parts: customer supplying own');

    let collectionFee=0;
    if(dropoff==='collection'){
      const waive=Number(CFG.bikeCollectionWaivedAbove||60);
      const jobSoFar=labourTotal+partsTotal;
      if(jobSoFar>=waive){
        lines.push('Collection & return: waived (job over £'+waive+')');
      }else{
        const collMode=CFG.bikeCollectionMode||'flat';
        if(collMode==='mileage'&&milesObj&&milesObj.charged>0){
          collectionFee=milesObj.charged*Number(CFG.bikeCollectionPerMile||0.50);
          lines.push('Collection & return: '+milesObj.charged.toFixed(1)+' miles × £'+Number(CFG.bikeCollectionPerMile||0.50)+'/mile = £'+collectionFee.toFixed(2));
        }else{
          collectionFee=Number(CFG.bikeCollectionFlatFee||5);
          lines.push('Collection & return: £'+collectionFee.toFixed(2));
        }
      }
    }

    const subtotal=labourTotal+partsTotal+collectionFee;
    return{subtotal,labourTotal,partsTotal,collectionFee,lines};
  }

  function setUI(){
    const v=els.jobType?els.jobType.value:'';
    if(lastJobType!=='ikea'&&v==='ikea'){clearAddresses();}
    lastJobType=v;
    hideAll();
    if(!v){if(els.routeHint) els.routeHint.textContent="Choose a job type to start."; return;}
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
      }else{show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);}
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
      if(els.routeHint) els.routeHint.textContent="Mileage: Home to Garden and back.";
      updateGardenUI();
    }else if(v==='bike'){
      if(els.bikeWrap) show(els.bikeWrap);
      if(els.routeHint) els.routeHint.textContent="Fill in the details below to get an instant estimate.";
      updateBikeUI();
    }else{
      show(els.pickupField); show(els.addrDropWrap); show(els.descWrap);
      if(els.routeHint) els.routeHint.textContent="Mileage: Home to Pickup to Delivery.";
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
    let txt='Auto suggests: '+(auto?"Luton needed":"no Luton")+'.';
    if(mode==='yes') txt+=' Forced ON.';
    if(mode==='no')  txt+=' Forced OFF.';
    els.lutonHint.textContent=txt+' Hire: £'+Number((els.lutonCost&&els.lutonCost.value)||CFG.LUTON_HIRE_COST).toFixed(0)+'/day.';
  }

  if(els.ikeaStore){
    els.ikeaStore.addEventListener('change',()=>{
      const v=els.ikeaStore.value||''; if(els.addrPickup) els.addrPickup.value=v;
    });
  }

  let directions=null,autoPickup=null,autoDrop=null,autoBikeAddr=null,autoNeighbour1=null,autoNeighbour2=null,tryCount=0;
  let mapsFailed=false;
  function attachNeighbourAutocomplete(input,opt){
    if(!input) return null;
    const ac=new google.maps.places.Autocomplete(input,Object.assign({},opt,{fields:["formatted_address","geometry","address_components"]}));
    ac.addListener('place_changed',()=>{
      const place=ac.getPlace()||{};
      const route=(place.address_components||[]).find(c=>(c.types||[]).indexOf('route')>=0);
      input.dataset.street=route?(route.long_name||'').toLowerCase():'';
      updateNeighbourStreetWarning();
    });
    input.addEventListener('input',()=>{
      input.dataset.street='';
      updateNeighbourStreetWarning();
    });
    return ac;
  }
  function initMaps(){
    try{
      if(!window.google||!google.maps) return false;
      if(!directions) directions=new google.maps.DirectionsService();
      const opt={fields:["formatted_address","geometry"],componentRestrictions:{country:["gb"]},types:["geocode"]};
      if(!autoPickup&&els.addrPickup)   autoPickup=new google.maps.places.Autocomplete(els.addrPickup,opt);
      if(!autoDrop&&els.addrDrop)       autoDrop=new google.maps.places.Autocomplete(els.addrDrop,opt);
      if(!autoBikeAddr&&els.bikeAddr)   autoBikeAddr=new google.maps.places.Autocomplete(els.bikeAddr,opt);
      if(!autoNeighbour1&&els.gardenNeighbour1) autoNeighbour1=attachNeighbourAutocomplete(els.gardenNeighbour1,opt);
      if(!autoNeighbour2&&els.gardenNeighbour2) autoNeighbour2=attachNeighbourAutocomplete(els.gardenNeighbour2,opt);
      if(els.routeHint&&tryCount>0) els.routeHint.textContent="Maps ready — enter addresses.";
      return true;
    }catch(e){return false;}
  }
  const poll=setInterval(()=>{if(initMaps()) clearInterval(poll); else{tryCount++; if(tryCount%5===0&&els.routeHint) els.routeHint.textContent='Loading Google Maps...';}},300);

  // Resolves once the Directions service is ready, or after timeoutMs if Maps
  // never loads. Without this, clicking Calculate before the async Maps script
  // has loaded leaves `directions` null and every route silently returns 0.
  function whenMapsReady(timeoutMs){
    return new Promise(resolve=>{
      initMaps();
      if(directions){resolve(true);return;}
      const start=Date.now();
      const t=setInterval(()=>{
        initMaps();
        if(directions){clearInterval(t);resolve(true);}
        else if(Date.now()-start>=timeoutMs){clearInterval(t);resolve(false);}
      },200);
    });
  }

  function routeP(req){
    return new Promise(res=>{
      if(!directions){mapsFailed=true;try{console.warn('[BHD] Google Maps not loaded — cannot calculate route');}catch(e){}res({miles:0,legs:[],durationMins:0});return;}
      // Bias geocoding to the UK so vague input (a town or area with no street
      // or postcode) resolves to the right place instead of failing as
      // ambiguous worldwide.
      if(req&&!req.region) req.region='uk';
      directions.route(req,(r,s)=>{
        if(s!=="OK"||!r||!r.routes||!r.routes.length){mapsFailed=true;try{console.warn('[BHD] Directions request failed:',s);}catch(e){}res({miles:0,legs:[],durationMins:0});return;}
        const legs=r.routes[0].legs;
        const miles=metersToMiles(legsMeters(legs));
        const durationMins=legs.reduce((s,l)=>s+((l.duration&&l.duration.value)||0),0)/60;
        res({miles,legs,durationMins});
      });
    });
  }

  async function getMilesBoth(cb){
    mapsFailed=false;
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
    if(jt==='garden'){
      if(!pickup){if(els.routeHint) els.routeHint.textContent="Enter the garden address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''}); return;}
      const loop=await routeP({origin:home,destination:home,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'});
      const loopMiles=round1(loop.miles);
      if(els.routeHint) els.routeHint.textContent="Garden job: "+loopMiles+" miles return (Home to Garden and back).";
      cb({charged:loopMiles,loop:loopMiles,noteCharged:'Home to Garden and back',noteLoop:'Home to Garden and back'});
      return;
    }
    if(jt==='hay'){
      if(!drop){if(els.routeHint) els.routeHint.textContent="Enter delivery address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}
      const hayTypeEl=$('hayType');
      const hayType=(hayTypeEl&&hayTypeEl.value)||'rental';
      if(hayType==='rental'){
        const loop=await routeP({origin:home,destination:home,waypoints:[{location:drop,stopover:true}],travelMode:'DRIVING'});
        const loopMiles=round1(loop.miles);
        if(els.routeHint) els.routeHint.textContent="Hay rental: "+loopMiles+" miles return (delivery + collection).";
        cb({charged:loopMiles,loop:loopMiles,noteCharged:'Home to Delivery and back (delivery + collection)',noteLoop:'Home to Delivery and back'});
      }else{
        const oneWay=await routeP({origin:home,destination:drop,travelMode:'DRIVING'});
        const oneMiles=round1(oneWay.miles);
        if(els.routeHint) els.routeHint.textContent="Hay sale: "+oneMiles+" miles one-way delivery.";
        cb({charged:oneMiles,loop:oneMiles,noteCharged:'Home to Delivery (one-way)',noteLoop:'Home to Delivery'});
      }
      return;
    }
    if(jt==='flatpack'){
      if(!drop){if(els.routeHint) els.routeHint.textContent="Enter destination address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}
      const oneWay=await routeP({origin:home,destination:drop,travelMode:'DRIVING'});
      const loop=await routeP({origin:home,destination:home,waypoints:[{location:drop,stopover:true}],travelMode:'DRIVING'});
      const charged=(oneWay.miles>15)?ceil0(oneWay.miles):0;
      if(els.routeHint) els.routeHint.textContent="Flatpack: "+(charged>0?"Charging one-way":"No mileage")+" — "+charged+" mi.";
      cb({charged,loop:round1(loop.miles),noteCharged:charged>0?'Home to Destination (over 15mi)':'No mileage billed (under 15mi)',noteLoop:'Home to Destination and back'});
      return;
    }
    if(jt==='bike'){
      const dropoff=(els.bikeDropoff&&els.bikeDropoff.value)||'dropoff';
      if(dropoff!=='collection'||(CFG.bikeCollectionMode||'flat')==='flat'){
        cb({charged:0,loop:0,noteCharged:'',noteLoop:''}); return;
      }
      const bikeAddr=(els.bikeAddr&&els.bikeAddr.value||'').trim();
      if(!bikeAddr){if(els.routeHint) els.routeHint.textContent="Enter your address for collection."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}
      const loop=await routeP({origin:home,destination:home,waypoints:[{location:bikeAddr,stopover:true}],travelMode:'DRIVING'});
      const loopMiles=round1(loop.miles);
      if(els.routeHint) els.routeHint.textContent="Collection: "+loopMiles+" miles return.";
      cb({charged:loopMiles,loop:loopMiles,noteCharged:'Home to your address and back',noteLoop:'Home to your address and back'});
      return;
    }
    if(!pickup){if(els.routeHint) els.routeHint.textContent="Enter collection address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}
    if(jt!=="tip"&&!drop){if(els.routeHint) els.routeHint.textContent="Enter delivery address."; cb({charged:0,loop:0,noteCharged:'',noteLoop:''});return;}
    let charged=0,loop=0,noteC='',noteL='',drivingMins=0;
    if(jt==='tip'){
      const toPickup=await routeP({origin:home,destination:pickup,travelMode:'DRIVING'});
      if(toPickup.miles<=50){
        const toTip=await routeP({origin:home,destination:tip,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'});
        charged=toTip.miles; noteC='Home to Collection to Waterbeach';
      }else{
        const thru=await routeP({origin:home,destination:tip,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'});
        charged=thru.miles; noteC='Home to Collection to Waterbeach';
      }
      const loopRes=await routeP({origin:home,destination:home,waypoints:[{location:pickup,stopover:true},{location:tip,stopover:true}],travelMode:'DRIVING'});
      loop=loopRes.miles; noteL='Home to Collection to Waterbeach and back';
      drivingMins=loopRes.durationMins;
    }else{
      const ch=await routeP({origin:home,destination:drop,waypoints:[{location:pickup,stopover:true}],travelMode:'DRIVING'});
      charged=ch.miles; noteC='Home to Pickup to Delivery';
      const lp=await routeP({origin:home,destination:home,waypoints:[{location:pickup,stopover:true},{location:drop,stopover:true}],travelMode:'DRIVING'});
      loop=lp.miles; noteL='Home to Pickup to Delivery and back';
      drivingMins=lp.durationMins;
    }
    if(els.routeHint) els.routeHint.textContent=(jt==='tip')?"Charged route: "+round1(charged)+" mi — "+noteC+".":"Charged: "+round1(loop)+" mi (full return journey) — "+noteL+".";
    cb({charged,loop,noteCharged:noteC,noteLoop:noteL,drivingMins});
  }

  ['gardenHours','gardenTeam','gardenSchedule','gardenDiscountType','gardenSize','gardenFrequency','gardenDayOfWeek','gardenTimeOfDay','gardenStartingWeek','gardenWeekOfMonth'].forEach(id=>{
    const el=$(id);
    if(el) el.addEventListener('change', updateGardenUI);
  });

  document.querySelectorAll('input[name="gardenTask"]').forEach(cb=>{
    cb.addEventListener('change', updateGardenUI);
  });

  ['bikeMode','bikePackage','bikeDropoff'].forEach(id=>{
    const el=$(id); if(el) el.addEventListener('change', updateBikeUI);
  });
  document.querySelectorAll('input[name="bikeService"]').forEach(cb=>{
    cb.addEventListener('change', updateBikeItemsUI);
  });

  const pctFor=jt=>(CFG.rangePct&&CFG.rangePct[jt]!=null)?Number(CFG.rangePct[jt]):0.15;
  const minFor=jt=>{const v=(CFG.minByType||{})[jt];return(v===""||v==null)?0:Math.max(0,Number(v));};

  function baseFeeFor(jt){
    if(jt==="move") return Number(CFG.baseFees.move||CFG.baseFees.default||0);
    if(jt==="shop") return(els.shopTime&&els.shopTime.value==="after22")?Number(CFG.baseFees.shopAfter22||CFG.baseFees.default||0):Number(CFG.baseFees.shopBefore22||CFG.baseFees.default||0);
    if(jt==="ikea") return(els.ikeaMode&&els.ikeaMode.value==="collectBuild")?Number(CFG.baseFees.ikeaCollectBuild||CFG.baseFees.default||0):Number(CFG.baseFees.ikeaCollect||CFG.baseFees.default||0);
    if(jt==="flatpack") return Number(CFG.baseFees.flatpack||CFG.baseFees.default||0);
    if(jt==="hay") return Number(CFG.baseFees.hay||0);
    if(jt==="bags"||jt==="business"||jt==="garden") return 0;
    return Number(CFG.baseFees.default||0);
  }

  function calcDisposal(){
    if(!els.wasteType||!CFG.disposal) return{fee:0,detail:""};
    const key=els.wasteType.value||'general',item=CFG.disposal[key]||CFG.disposal['general']||{};
    const rate=Number(item.ratePerTonne||0);
    const vatRate=Number(CFG.disposalVat||0.20);
    const wa=window._wasteAnalysis;
    const aiWeightMid=wa&&wa.totalWeightKgMax&&wa.totalWeightKgMax>10?(((wa.totalWeightKgMin+wa.totalWeightKgMax)/2)*1.10):null;
    const aiWeightMin=wa&&wa.totalWeightKgMin?wa.totalWeightKgMin*1.10:null;
    const aiWeightMax=wa&&wa.totalWeightKgMax?wa.totalWeightKgMax*1.10:null;
    if(aiWeightMid){
      const tonnes=aiWeightMid/1000;
      const tonnesMin=(aiWeightMin||aiWeightMid)/1000;
      const tonnesMax=(aiWeightMax||aiWeightMid)/1000;
      const exVat=tonnes*rate;
      const exVatMin=tonnesMin*rate;
      const exVatMax=tonnesMax*rate;
      const fee=exVat*(1+vatRate);
      const feeMin=exVatMin*(1+vatRate);
      const feeMax=exVatMax*(1+vatRate);
      const minCharge=rate*0.25*(1+vatRate);
      window.BHD._aiDisposalFee=Math.round(fee);
      window.BHD._aiDisposalFeeMin=Math.round(feeMin);
      window.BHD._aiDisposalFeeMax=Math.round(feeMax);
      var rateIncVat=(rate*1.20).toFixed(2);
      return{fee:Math.max(fee,minCharge),detail:"Disposal: "+(item.label||key)+" — "+Math.round(aiWeightMid)+"kg @ £"+rateIncVat+"/t = £"+Math.max(fee,minCharge).toFixed(2)+" (range £"+Math.min(Math.max(feeMin,minCharge),feeMax).toFixed(0)+"–£"+Math.max(feeMax,minCharge).toFixed(0)+")"};
    }
    const minFee=rate*0.25*(1+vatRate);
    return{fee:minFee,detail:"Disposal: "+(item.label||key)+" — minimum quarter tonne @ £"+rate.toFixed(2)+"/t inc VAT = £"+minFee.toFixed(2)};
  }

  function calcBags(){
    const bagsEl=$('bagsCount');
    const count=Math.max(1,parseInt(bagsEl&&bagsEl.value||'1',10)||1);
    const priceEach=Number(CFG.bagPriceEach||4);
    const bagCost=count*priceEach;
    return{fee:bagCost,lines:[
      count+" bag"+(count!==1?'s':'')+" @ £"+priceEach+"/bag = £"+bagCost.toFixed(2),
      "Disposed at Waterbeach Waste Management Park — fully licensed",
    ]};
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
      return{fee:saleCost,lines:[
        bales+" bales for sale @ £"+salePerBale+"/bale = £"+saleCost.toFixed(2),
        "Mileage charged separately (one-way delivery)",
      ]};
    }else{
      const bales=Math.max(minBales,rawBales);
      const isFullLoad=bales>=fullLoad;
      const rentalCost=bales*rentalPerBalePerDay;
      return{fee:rentalCost,lines:[
        bales+" bales"+(isFullLoad?' (full load)':' (min '+minBales+')')+" rental @ £"+rentalPerBalePerDay+"/bale/day = £"+rentalCost.toFixed(2),
        "Mileage charged for return trip (delivery + collection)",
        "Damaged/wet bales: £"+damagedFee+"/bale — if wet, you keep them",
      ]};
    }
  }

  function calcAssembly(basket){
    let totalMinutes=0,totalItems=0,lines=[];
    if(basket.length>0){
      basket.forEach(i=>{totalMinutes+=i.minutes*i.qty; totalItems+=i.qty; lines.push(i.qty+" x "+i.name+" ("+fmtMins(i.minutes)+" each)");});
    }
    let cost=0,txt='';
    if(CFG.useTimePricing&&totalMinutes>0){
      const perHour=Number(CFG.ikeaLaborPerHour||0)||Math.round(laborPerMinuteEffective()*60);
      const perMin=laborPerMinuteEffective();
      cost=totalMinutes*perMin; txt=' (~'+fmtMins(totalMinutes)+' @ £'+perHour+'/hour)';
    }else if(totalItems>0){
      const perItem=Number(CFG.ikeaAssemblyPerItem||15);
      cost=totalItems*perItem; txt=' ('+totalItems+' x £'+perItem.toFixed(2)+'/item)';
    }
    return{cost,txt,itemLines:lines};
  }

  function calcGardenQuote(){
    const team=(els.gardenTeam&&els.gardenTeam.value)||'solo';
    const hours=parseFloat((els.gardenHours&&els.gardenHours.value)||2)||2;
    const schedule=(els.gardenSchedule&&els.gardenSchedule.value)||'oneoff';
    const frequency=(els.gardenFrequency&&els.gardenFrequency.value)||'fortnightly';
    const discountType=(els.gardenDiscountType&&els.gardenDiscountType.value)||'none';
    const neighbour1=((els.gardenNeighbour1&&els.gardenNeighbour1.value)||'').trim();
    const neighbour2=((els.gardenNeighbour2&&els.gardenNeighbour2.value)||'').trim();
    const gardenSize=((els.gardenSize&&els.gardenSize.value)||'').trim();

    const rate = team==='three' ? Number(CFG.gardenThreePerHour||40) : team==='two' ? Number(CFG.gardenTwoPerHour||25) : Number(CFG.gardenSoloPerHour||17.50);
    const baseAmount = rate * hours;

    const lines=[];
    lines.push('Labour: £'+rate+'/hr × '+hours+' hr'+(hours!==1?'s':'')+' = £'+baseAmount.toFixed(2));

    if(schedule==='ongoing'){
      const dayOfWeek=(els.gardenDayOfWeek&&els.gardenDayOfWeek.value)||'';
      const timeOfDay=(els.gardenTimeOfDay&&els.gardenTimeOfDay.value)||'';
      const startingWeek=(els.gardenStartingWeek&&els.gardenStartingWeek.value)||'';
      const weekOfMonth=(els.gardenWeekOfMonth&&els.gardenWeekOfMonth.value)||'';
      const dayLabels={Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday'};
      const weekOrdinals={'1':'1st','2':'2nd','3':'3rd','4':'4th','last':'last'};
      const dayLabel=dayLabels[dayOfWeek]||dayOfWeek;
      let slot='';
      if(frequency==='monthly' && weekOfMonth && dayLabel){
        slot='Monthly — '+(weekOrdinals[weekOfMonth]||weekOfMonth)+' '+dayLabel+(timeOfDay?' '+timeOfDay:'');
      } else if(frequency==='fortnightly' && dayLabel){
        slot='Fortnightly — '+dayLabel+(timeOfDay?' '+timeOfDay:'')+(startingWeek?' (starting '+(startingWeek==='next'?'next':'this')+' week)':'');
      } else if(frequency==='weekly' && dayLabel){
        slot='Weekly — every '+dayLabel+(timeOfDay?' '+timeOfDay:'');
      }
      if(slot) lines.push('Slot: '+slot);
    }

    // Weed killing surcharge — added when task is selected, priced by garden size
    let weedKillingCost=0;
    const weedCheckboxes=document.querySelectorAll('input[name="gardenTask"]');
    let weedKillingSelected=false;
    weedCheckboxes.forEach(cb=>{ if(cb.value==='Weed killing'&&cb.checked) weedKillingSelected=true; });
    if(weedKillingSelected){
      const wkCfg=CFG.gardenWeedKillingCost||{small:10,medium:20,large:35,xl:50};
      if(gardenSize&&wkCfg[gardenSize]!=null){
        weedKillingCost=Number(wkCfg[gardenSize]);
        lines.push('Weed killer ('+gardenSize+' garden): £'+weedKillingCost.toFixed(2));
      } else {
        lines.push('Weed killer: select a garden size to price this item');
      }
    }

    let discountAmount=0;
    let discountLabel='';

    const pensionerPct = Number(CFG.gardenPensionerDiscountPct||10);
    const neighbourFlat = Number(CFG.gardenNeighbourDiscountSolo||5);
    const pctCfg=CFG.gardenOngoingDiscountPct;
    const ongoingPct = typeof pctCfg==='object'&&pctCfg!==null ? Number(pctCfg[frequency]||pctCfg.fortnightly||10) : Number(pctCfg||10);

    const neighbourCount = (neighbour1?1:0) + (neighbour2?1:0);
    const neighbourEligible = neighbourCount>0 && hours>=2;
    const neighbourActive = discountType==='neighbour' && neighbourEligible;

    if(discountType==='pensioner'){
      discountAmount = baseAmount * (pensionerPct/100);
      discountLabel = 'Pensioner discount ('+pensionerPct+'% off)';
    } else if(discountType==='neighbour'){
      if(neighbourEligible){
        discountAmount = neighbourFlat;
        discountLabel = 'Neighbour discount (£'+neighbourFlat+' off — neighbour also booking)';
      } else if(neighbourCount>0 && hours<2){
        lines.push('ℹ️ Neighbour discount needs at least 2 hours booked');
      }
    }

    let ongoingDiscountAmount=0;
    if(schedule==='ongoing'){
      ongoingDiscountAmount = baseAmount * (ongoingPct/100);
    }

    const stackNeighbourPct = Number(CFG.gardenNeighbourStackPct!=null?CFG.gardenNeighbourStackPct:50);
    const stackNeighbourWithWeekly = neighbourActive && schedule==='ongoing' && frequency==='weekly';

    let appliedDiscount=0;
    let appliedLabel='';
    let stackNote='';
    if(stackNeighbourWithWeekly && ongoingDiscountAmount>0){
      const stackedNeighbour = Math.round(neighbourFlat * (stackNeighbourPct/100) * 100)/100;
      appliedDiscount = ongoingDiscountAmount + stackedNeighbour;
      lines.push('Weekly loyalty discount ('+ongoingPct+'% off): −£'+ongoingDiscountAmount.toFixed(2));
      lines.push('Neighbour discount ('+stackNeighbourPct+'% — stacked with weekly): −£'+stackedNeighbour.toFixed(2));
    } else if(discountAmount>0 && ongoingDiscountAmount>0){
      if(discountAmount >= ongoingDiscountAmount){
        appliedDiscount=discountAmount;
        appliedLabel=discountLabel;
        stackNote='(Ongoing loyalty discount not stacked — '+discountLabel+' gives the greater saving)';
      } else {
        appliedDiscount=ongoingDiscountAmount;
        appliedLabel='Ongoing loyalty discount ('+ongoingPct+'% off)';
        stackNote='('+discountLabel+' not stacked — ongoing loyalty gives the greater saving)';
      }
      lines.push(appliedLabel+': −£'+appliedDiscount.toFixed(2));
      if(stackNote) lines.push('ℹ️ '+stackNote);
    } else if(discountAmount>0){
      appliedDiscount=discountAmount;
      appliedLabel=discountLabel;
      lines.push(appliedLabel+': −£'+appliedDiscount.toFixed(2));
    } else if(ongoingDiscountAmount>0){
      appliedDiscount=ongoingDiscountAmount;
      appliedLabel='Ongoing loyalty discount ('+ongoingPct+'% off)';
      lines.push(appliedLabel+': −£'+appliedDiscount.toFixed(2));
    }

    let subtotal=baseAmount + weedKillingCost - appliedDiscount;
    if(subtotal<0) subtotal=0;

    const rangePct=Number((CFG.rangePct&&CFG.rangePct.garden)||0.10);
    const lo=Math.round(subtotal*(1-rangePct));
    const hi=Math.round(subtotal*(1+rangePct));

    return { lo, hi, subtotal, lines, appliedLabel, appliedDiscount, team, hours, rate, schedule, frequency, gardenSize, weedKillingCost, neighbour1, neighbour2 };
  }

  function postcode(addr){
    const m=(addr||'').match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
    return m?m[0].toUpperCase():'';
  }

  function calculate(milesObj){
    const jt=(els.jobType&&els.jobType.value)||"";
    if(!jt){if(els.routeHint) els.routeHint.textContent="Pick a job type first."; return;}

    if(jt==='business'){
      if(els.breakdown) setBreakdownLines(els.breakdown, ['Service: '+jobLabel(jt), 'Ben will review your proposal and get back to you with a price.']);
      if(els.total){els.total.textContent="Price on request"; els.total.classList.add('show');}
      if(els.quoteId) els.quoteId.textContent="Quote ID — "+quoteId();
      if(els.btnWA){els.btnWA.removeAttribute('hidden'); els.btnWA.classList.remove('hidden');}
      if(window.goTo) window.goTo(3);
      return;
    }

    // A route was attempted but Maps gave us nothing. Without this guard the
    // quote proceeds with 0 miles / 0 minutes and shows a nonsense low total
    // (e.g. £10 for a 150-mile job). Garden pricing is unaffected when the
    // garden mileage rate is 0, so let that case through.
    if(mapsFailed){
      const gRate=Number(CFG.gardenMileagePerMile!=null?CFG.gardenMileagePerMile:(CFG.mileagePerMile||0));
      if(!(jt==='garden'&&gRate===0)){
        if(els.routeHint) els.routeHint.textContent=directions
          ?"⚠ Couldn't calculate the route — please check the collection and delivery addresses are valid and try again."
          :"⚠ Google Maps didn't load — check your internet connection, refresh the page, then try again.";
        return;
      }
    }

    if(jt==='garden'){
      const chargedMiles=round1(milesObj&&milesObj.charged||0);
      const loopMiles=round1(milesObj&&milesObj.loop||0);
      const gardenMileRate=Number(CFG.gardenMileagePerMile!=null?CFG.gardenMileagePerMile:(CFG.mileagePerMile||0));
      const mileageCost=chargedMiles*gardenMileRate;
      const q=calcGardenQuote();
      const total=q.subtotal+mileageCost;
      const exact=Math.round(total);
      const lines=['Service: '+jobLabel(jt)];
      if(loopMiles>0){
        lines.push("Mileage: "+chargedMiles.toFixed(1)+" miles return @ £"+gardenMileRate.toFixed(2)+"/mile = £"+mileageCost.toFixed(2));
      }
      q.lines.forEach(l=>lines.push(l));
      if(els.breakdown) setBreakdownLines(els.breakdown, lines);
      if(els.total){els.total.textContent="£"+exact; els.total.classList.add('show');}
      if(els.quoteId) els.quoteId.textContent="Quote ID — "+quoteId();
      if(els.btnWA){els.btnWA.removeAttribute('hidden'); els.btnWA.classList.remove('hidden');}
      if(window.goTo) window.goTo(3);
      return;
    }

    if(jt==='bike'){
      const q=calcBikeQuote(milesObj);
      const pct=pctFor('bike');
      const lo=round5(q.subtotal*(1-pct));
      const hi=round5(q.subtotal*(1+pct));
      if(els.breakdown) setBreakdownLines(els.breakdown, ['Service: '+jobLabel(jt)].concat(q.lines));
      if(els.total){els.total.textContent='£'+lo+'–£'+hi; els.total.classList.add('show');}
      if(els.quoteId) els.quoteId.textContent='Quote ID — '+quoteId();
      if(els.btnWA){els.btnWA.removeAttribute('hidden');els.btnWA.classList.remove('hidden');}
      if(window.goTo) window.goTo(3);
      return;
    }

    const chargedMiles=round1(milesObj&&milesObj.charged||0);
    const loopMiles=round1(milesObj&&milesObj.loop||0);
    const noteC=milesObj&&milesObj.noteCharged||'';
    const noteL=milesObj&&milesObj.noteLoop||'';
    const pcTip=postcode(CFG.waterbeachAddress);
    const pcPickup=postcode((els.addrPickup&&els.addrPickup.value)||'');
    const pcDrop=postcode((els.addrDrop&&els.addrDrop.value)||'');
    // Jobs billed by the hour — no base call-out fee
    const HOURLY_JOBS=['tip','fb','student','shop','other'];
    const isHourly=HOURLY_JOBS.includes(jt);
    const labourRate=Number(CFG.labourPerHour||20);
    const drivingMins=milesObj&&milesObj.drivingMins||0;
    const loadingMins=Number(CFG.loadingMins||30);
    const labourHrs=isHourly?round1((drivingMins+loadingMins)/60):0;
    const generalLabourCost=isHourly?labourHrs*labourRate:0;
    const base=isHourly?0:baseFeeFor(jt);
    const vanLoads=(window._wasteAnalysis&&window._wasteAnalysis.van&&window._wasteAnalysis.van.loadsNeeded>1)?window._wasteAnalysis.van.loadsNeeded:1;
    const effectiveMiles=(jt==='tip')?chargedMiles*vanLoads:loopMiles;
    const mileageCost=effectiveMiles*Number(CFG.mileagePerMile||0);
    let twoMan=0;
    if(jt!=="tip"&&jt!=="shop"&&jt!=="business"&&jt!=="other"&&jt!=="flatpack"&&jt!=="hay"&&jt!=="bags"&&jt!=="garden"){
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
    const stairs=(jt==="tip"||jt==="shop"||jt==="business"||jt==="other"||jt==="flatpack"||jt==="hay"||jt==="bags"||jt==="garden")?0:(((+(els.stairsPickup&&els.stairsPickup.value)||0)+(+(els.stairsDrop&&els.stairsDrop.value)||0))*Number(CFG.stairsPerFloor||0));
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
        labourLine=map.hours+" hrs labour @ £"+Number(CFG.HOURLY_RATE_MOVE||0).toFixed(2)+"/hr = £"+labourCost.toFixed(2);
      }
      const mode=(els.lutonNeeded&&els.lutonNeeded.value)||'auto';
      const autoNeed=map?!!map.luton:false;
      const include=(mode==='yes')||(mode==='auto'&&autoNeed);
      if(include){
        lutonCost=Number((els.lutonCost&&els.lutonCost.value)||CFG.LUTON_HIRE_COST||0);
        lutonLine="Luton van hire: £"+lutonCost.toFixed(2)+" ("+(mode==='auto'?'auto':mode==='yes'?'forced':'overridden OFF')+")";
      }else if(mode==='no'){
        lutonLine="Luton hire not included (overridden)";
      }else{
        lutonLine="Luton not required (auto)";
      }
    }
    let total=base+generalLabourCost+mileageCost+stairs+twoMan+disp.fee+asm.cost+labourCost+lutonCost+bags.fee+hay.fee;
    const lines=[];
    if(jt==='bags'){
      bags.lines.forEach(l=>lines.push(l));
    }else if(jt==='tip'){
      const tipRoute=["H&D HQ",pcPickup,pcTip+" (Waterbeach)","H&D HQ"].filter(Boolean).join(' → ');
      lines.push("Total journey: "+loopMiles.toFixed(1)+" miles"+(tipRoute?" ("+tipRoute+")":""));
      const tipChRoute=["H&D HQ",pcPickup,pcTip+" (Waterbeach)"].filter(Boolean).join(' → ');
      lines.push("Charged: "+chargedMiles.toFixed(1)+" miles x "+vanLoads+" load"+(vanLoads>1?"s":"")+" @ £"+Number(CFG.mileagePerMile).toFixed(2)+"/mile"+(tipChRoute?" ("+tipChRoute+")":""));
      lines.push("Labour: "+labourHrs+" hr"+(labourHrs!==1?"s":"")+" ("+Math.round(drivingMins)+" min drive + "+loadingMins+" min loading) @ £"+labourRate.toFixed(2)+"/hr = £"+generalLabourCost.toFixed(2));
      lines.push("Mileage: £"+mileageCost.toFixed(2));
    }else{
      const genRoute=(jt==='move'||jt==='fb'||jt==='student'||jt==='shop'||jt==='other'||jt==='ikea')
        ?["H&D HQ",pcPickup,pcDrop,"H&D HQ"].filter(Boolean).join(' → ')
        :'';
      lines.push("Charged: "+loopMiles.toFixed(1)+" miles"+(genRoute?" ("+genRoute+")":"")+" @ £"+Number(CFG.mileagePerMile).toFixed(2)+"/mile");
      if(isHourly){
        lines.push("Labour: "+labourHrs+" hr"+(labourHrs!==1?"s":"")+" ("+Math.round(drivingMins)+" min drive + "+loadingMins+" min loading) @ £"+labourRate.toFixed(2)+"/hr = £"+generalLabourCost.toFixed(2));
      }else{
        lines.push("Base fee: £"+base.toFixed(2));
      }
      lines.push("Mileage: £"+mileageCost.toFixed(2));
    }
    if(stairs) lines.push("Stairs: £"+stairs.toFixed(2));
    if(twoMan){
      const beds=parseInt(els.houseMoveBedrooms&&els.houseMoveBedrooms.value||'0',10);
      const map=CFG.BEDROOM_LOAD_MULTIPLIERS[beds];
      lines.push("Two-person helper: £"+twoMan.toFixed(2)+(jt==='move'&&map?" ("+map.hours+" hrs @ £"+Number(CFG.twoManSurcharge||0)+"/hr)":' (flat fee)'));
    }
    if(jt==="tip"&&disp.fee) lines.push(disp.detail);
    if(jt==="hay") hay.lines.forEach(l=>lines.push(l));
    if(asm.cost){
      if(asm.itemLines.length) lines.push("Items: "+asm.itemLines.join(', '));
      lines.push("Assembly: £"+asm.cost.toFixed(2)+asm.txt);
    }
    if(jt==='move'){
      if(labourLine) lines.push(labourLine);
      if(lutonLine)  lines.push(lutonLine);
    }
    if(jt==="shop"&&els.shopTime) lines.push("Run time: "+(els.shopTime.value==="after22"?"After 10pm":"Before 10pm"));
    const MIN=minFor(jt); if(MIN>0&&total<MIN){lines.push("Minimum charge applied"); total=MIN;}
    const pct=pctFor(jt);
    const low=round5(total);
    const high=round5(total*(1+pct));
    if(els.breakdown) setBreakdownLines(els.breakdown, ['Service: '+jobLabel(jt)].concat(lines));
    if(els.total){els.total.textContent="£"+low+"–£"+high; els.total.classList.add('show');}
    if(els.quoteId) els.quoteId.textContent="Quote ID — "+quoteId();
    if(els.btnWA){els.btnWA.removeAttribute('hidden'); els.btnWA.classList.remove('hidden');}
    if(window.goTo) window.goTo(3);
  }

  function sendWhatsApp(){
    const id=(els.quoteId&&els.quoteId.textContent||"").replace("Quote ID — ","").trim();
    const jt=(els.jobType&&els.jobType.value)||"";
    const lines=(els.breakdown&&els.breakdown.innerText||'').split('• ').filter(Boolean);
    const hayTypeEl=$('hayType');
    const hayType=(hayTypeEl&&hayTypeEl.value)||'rental';
    const dest=(jt==="tip")?"Destination: Waterbeach Waste Management Park"
               :jt==="flatpack"?"Location: "+((els.addrDrop&&els.addrDrop.value)||"N/A")
               :jt==="hay"?("Delivery: "+((els.addrDrop&&els.addrDrop.value)||"N/A")+" ("+(hayType==='rental'?'rental - collection required':'sale - no collection needed')+")")
               :jt==="bags"?"Destination: Waterbeach Waste Management Park"
               :jt==="business"?"Location: "+($('businessLocation')&&$('businessLocation').value||"N/A")
               :jt==="garden"?"Garden address: "+((els.addrPickup&&els.addrPickup.value)||"N/A")
               :jt==="bike"?((els.bikeDropoff&&els.bikeDropoff.value)==='collection'?"Collection from: "+((els.bikeAddr&&els.bikeAddr.value)||"N/A"):"Drop-off service — Ben's address to be confirmed")
               :"Delivery: "+((els.addrDrop&&els.addrDrop.value)||"N/A");
    let businessDetails='';
    if(jt==='business'){
      const loc=$('businessLocation')&&$('businessLocation').value||'';
      const proposal=$('businessProposal')&&$('businessProposal').value||'';
      const freq=$('businessFrequency')&&$('businessFrequency').value||'once';
      businessDetails=[
        loc?"Location: "+loc:'',
        proposal?"Proposal: "+proposal:'',
        freq&&freq!=='once'?"Frequency: "+freq:'One-off job',
      ].filter(Boolean).join('\n');
    }
    let gardenDetails='';
    if(jt==='garden'){
      const team=(els.gardenTeam&&els.gardenTeam.value)||'solo';
      const hrs=(els.gardenHours&&els.gardenHours.value)||'';
      const schedule=(els.gardenSchedule&&els.gardenSchedule.value)||'oneoff';
      const frequency=(els.gardenFrequency&&els.gardenFrequency.value)||'';
      const discountType=(els.gardenDiscountType&&els.gardenDiscountType.value)||'none';
      const gardenSize=(els.gardenSize&&els.gardenSize.value)||'';
      const dayOfWeek=(els.gardenDayOfWeek&&els.gardenDayOfWeek.value)||'';
      const timeOfDay=(els.gardenTimeOfDay&&els.gardenTimeOfDay.value)||'';
      const startingWeek=(els.gardenStartingWeek&&els.gardenStartingWeek.value)||'';
      const weekOfMonth=(els.gardenWeekOfMonth&&els.gardenWeekOfMonth.value)||'';
      const dayLabels={Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday'};
      const weekOrdinals={'1':'1st','2':'2nd','3':'3rd','4':'4th','last':'last'};
      let scheduleLine='Booking type: One-off';
      if(schedule==='ongoing'){
        const freqLabel=frequency?frequency.charAt(0).toUpperCase()+frequency.slice(1):'Ongoing';
        const dayLabel=dayLabels[dayOfWeek]||dayOfWeek;
        if(frequency==='monthly' && weekOfMonth && dayLabel){
          scheduleLine='Booking type: Monthly — '+(weekOrdinals[weekOfMonth]||weekOfMonth)+' '+dayLabel+(timeOfDay?' '+timeOfDay:'');
        } else if(frequency==='fortnightly' && dayLabel){
          scheduleLine='Booking type: Fortnightly — '+dayLabel+(timeOfDay?' '+timeOfDay:'')+(startingWeek?' (starting '+(startingWeek==='next'?'next':'this')+' week)':'');
        } else if(frequency==='weekly' && dayLabel){
          scheduleLine='Booking type: Weekly — every '+dayLabel+(timeOfDay?' '+timeOfDay:'');
        } else {
          scheduleLine='Booking type: Ongoing'+(freqLabel?' ('+freqLabel.toLowerCase()+')':'');
        }
      }
      gardenDetails=[
        hrs?"Estimated hours: "+hrs:'',
        gardenSize?"Garden size: "+gardenSize.charAt(0).toUpperCase()+gardenSize.slice(1):'',
        "Team: "+(team==='three'?'Ben + 2 helpers':team==='two'?'Ben + helper':'Just Ben'),
        scheduleLine,
        discountType!=='none'?'Discount: '+discountType:'',
      ].filter(Boolean).join('\n');
    }
    let bikeDetails='';
    if(jt==='bike'){
      const bikeMode=(els.bikeMode&&els.bikeMode.value)||'package';
      const bikePkg=(els.bikePackage&&els.bikePackage.value)||'basic';
      const bikePkgLabel=((CFG.bikePackages||{})[bikePkg]||{label:'Basic Tune-Up'}).label;
      const bikeTypeVal=(els.bikeType&&els.bikeType.value)||'Not specified';
      const customerParts=!!(els.bikeCustomerParts&&els.bikeCustomerParts.checked);
      const bikeDropoffVal=(els.bikeDropoff&&els.bikeDropoff.value)||'dropoff';
      const bikeAddrVal=(els.bikeAddr&&els.bikeAddr.value)||'';
      const bikeNotesVal=(els.bikeNotes&&els.bikeNotes.value)||'';
      const checkedServices=Array.from(document.querySelectorAll('input[name="bikeService"]:checked')).map(cb=>cb.value);
      const serviceLabels={punctureRepair:'Puncture repair',safetyCheck:'Safety check',chainLube:'Chain lube',brakeAdjust:'Brake adjustment',gearAdjust:'Gear indexing',brakePads:'Brake pads',brakeCable:'Brake cable',gearCable:'Gear cable',tubeReplace:'Inner tube',tyreReplace:'Tyre replacement',chainReplace:'Chain replacement',cassetteReplace:'Cassette replacement',wheelTrue:'Wheel truing',barTape:'Bar tape/grips',pedalReplace:'Pedal replacement',bottomBracket:'Bottom bracket',headset:'Headset'};
      bikeDetails=[
        'Bike type: '+bikeTypeVal,
        bikeMode==='package'?'Package: '+bikePkgLabel:'Services: '+checkedServices.map(k=>serviceLabels[k]||k).join(', '),
        customerParts?'Parts: I\'ll supply my own':'Parts: please source (Amazon next-day)',
        bikeDropoffVal==='collection'?'Collection & return'+(bikeAddrVal?' from: '+bikeAddrVal:''):'Drop-off / I\'ll bring it to you',
        bikeNotesVal?'Notes: '+bikeNotesVal:'',
      ].filter(Boolean).join('\n');
    }

    const msg=[
      "Hey Ben! I need something Humpin' & Dumpin'",
      "Quote ID: "+id,
      "Service: "+(jobLabel(jt)||"N/A"),
      jt==='business'?businessDetails:'',
      jt==='garden'?gardenDetails:'',
      jt==='bike'?bikeDetails:'',
      (jt!=='hay'&&jt!=='flatpack'&&jt!=='business'&&jt!=='bags'&&jt!=='garden'&&jt!=='bike'?"Collection: "+((els.addrPickup&&els.addrPickup.value)||"N/A"):""),
      (jt!=='business'?dest:''),
      (lines.length?"\nBreakdown:\n- "+lines.join("\n- "):"")
      ,(els.total&&els.total.textContent||"")
    ].filter(Boolean).join("\n");
    window.open("https://wa.me/"+CFG.whatsappNumber+"?text="+encodeURIComponent(msg),'_blank');
  }

  if(els.jobType) ['change','input','click','keyup','blur','focus'].forEach(ev=>els.jobType.addEventListener(ev,setUI));
  if(els.ikeaMode) els.ikeaMode.addEventListener('change',setUI);
  if(els.ikeaItemSel){els.ikeaItemSel.addEventListener('change',toggleIkeaOther); toggleIkeaOther();}
  if(els.flatAddBtn) els.flatAddBtn.addEventListener('click',addFlatItem);
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
    els.btnCalc.textContent='Calculating…';
    els.btnCalc.disabled=true;
    if(els.routeHint) els.routeHint.textContent="Calculating...";
    await whenMapsReady(8000);
    const miles=await new Promise(resolve=>getMilesBoth(resolve));
    calculate(miles);
    els.btnCalc.innerHTML='&#129518;&nbsp;&nbsp;Calculate My Quote';
    els.btnCalc.disabled=false;
  });
  if(els.btnWA) els.btnWA.addEventListener('click',sendWhatsApp);
  hideAll(); setUI();
  renderList($('ikeaList'),$('ikeaTimeHint'),[]);
  renderList($('flatList'),$('flatTimeHint'),[]);
})();