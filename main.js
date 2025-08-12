// r308 — bulletproof UI toggling for #jobType

(function(){
  const VER = "r308";

  // hard show/hide that beats any CSS weirdness
  const show = el => { if(!el) return; el.hidden=false; el.classList.remove('hidden'); el.style.display=''; };
  const hide = el => { if(!el) return; el.hidden=true; el.classList.add('hidden'); el.style.display='none'; };

  // insert a simple block if it's missing so UI still works
  function ensureBlockAfter(anchorEl, id, inner){
    let el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    el.className = 'card';
    el.style.display = 'none';
    el.hidden = true;
    el.innerHTML = inner || `<div class="hint">${id}</div>`;
    const wrapCard = anchorEl.closest('.card') || anchorEl.parentElement || document.body;
    wrapCard.parentElement.insertBefore(el, wrapCard.nextSibling);
    return el;
  }

  function cacheAll(){
    const jobType = document.getElementById('jobType');
    if(!jobType) return { jobType:null };

    // Ensure essential blocks exist (creates tidy placeholders if missing)
    const pickupField  = ensureBlockAfter(jobType, 'pickupField',  `<label>Collection address</label><input id="addrPickup" type="text" placeholder="Start typing…">`);
    const addrDropWrap = ensureBlockAfter(jobType, 'addrDropWrap', `<label>Delivery address</label><input id="addrDrop" type="text" placeholder="Start typing…">`);
    const wasteWrap    = ensureBlockAfter(jobType, 'wasteWrap',    `<label>Waste type (Tip runs)</label><select id="wasteType"><option>General Waste</option></select>`);
    const twoManWrap   = ensureBlockAfter(jobType, 'twoManWrap',   `<label>Two‑person team?</label><select id="twoMan"><option value="no">No</option><option value="yes">Yes</option></select>`);
    const stairsWrap   = ensureBlockAfter(jobType, 'stairsWrap',   `<div class="grid2"><div><label>Stairs at pickup</label><input id="stairsPickup" type="number" value="0"></div><div><label>Stairs at drop‑off</label><input id="stairsDrop" type="number" value="0"></div></div>`);
    const shopTimeWrap = ensureBlockAfter(jobType, 'shopTimeWrap', `<label>Run time</label><select id="shopTime"><option value="before22">Before 10pm</option><option value="after22">After 10pm</option></select>`);
    const ikeaModeWrap = ensureBlockAfter(jobType, 'ikeaModeWrap', `<label>IKEA service</label><select id="ikeaMode"><option value="collect">Collect Only</option><option value="collectBuild">Collect & Build</option></select>`);
    const ikeaStoreWrap= ensureBlockAfter(jobType, 'ikeaStoreWrap',`<label>IKEA store</label><select id="ikeaStore"><option>Select store…</option></select>`);
    const ikeaQtyWrap  = ensureBlockAfter(jobType, 'ikeaQtyWrap',  `<label>Items to build</label><input id="ikeaQty" type="number" value="1" min="1">`);
    const descWrap     = ensureBlockAfter(jobType, 'descWrap',     `<label>What is it?</label><textarea id="jobDesc" placeholder="Describe the job…"></textarea>`);
    const routeHint    = document.getElementById('routeHint') || ensureBlockAfter(jobType, 'routeHint', `<div class="hint">Choose a job type to start.</div>`);

    return { jobType, pickupField, addrDropWrap, wasteWrap, twoManWrap, stairsWrap, shopTimeWrap, ikeaModeWrap, ikeaStoreWrap, ikeaQtyWrap, descWrap, routeHint };
  }

  function hideAll(els){
    [els.pickupField,els.addrDropWrap,els.wasteWrap,els.twoManWrap,els.stairsWrap,els.shopTimeWrap,els.ikeaModeWrap,els.ikeaStoreWrap,els.ikeaQtyWrap,els.descWrap]
      .forEach(hide);
  }

  function applyUI(els){
    if (!els || !els.jobType) return;
    const v = els.jobType.value || '';
    hideAll(els);
    if (!v){ if(els.routeHint) els.routeHint.textContent = "Choose a job type to start."; return; }

    // Always collect address
    show(els.pickupField);

    switch(v){
      case 'tip':
        show(els.wasteWrap);
        if(els.routeHint) els.routeHint.textContent = "Tip Run: Collection → Waterbeach (min-fee logic applies).";
        break;
      case 'move':
      case 'fb':
      case 'student':
        show(els.addrDropWrap); show(els.twoManWrap); show(els.stairsWrap);
        if(els.routeHint) els.routeHint.textContent = "Home → Pickup → Delivery.";
        break;
      case 'shop':
        show(els.addrDropWrap); show(els.shopTimeWrap);
        if(els.routeHint) els.routeHint.textContent = "Home → Shop → Delivery.";
        break;
      case 'ikea':
        show(els.addrDropWrap); show(els.ikeaModeWrap); show(els.ikeaStoreWrap); show(els.twoManWrap); show(els.stairsWrap); show(els.descWrap);
        // reveal qty only when Collect & Build selected
        const ikeaMode = document.getElementById('ikeaMode');
        if (ikeaMode && ikeaMode.value === 'collectBuild') show(els.ikeaQtyWrap);
        if(els.routeHint) els.routeHint.textContent = "Home → IKEA → Delivery.";
        break;
      case 'business':
      case 'other':
        show(els.addrDropWrap); show(els.descWrap);
        if(els.routeHint) els.routeHint.textContent = "Home → Pickup → Delivery.";
        break;
      default:
        if(els.routeHint) els.routeHint.textContent = "Choose a job type to start.";
    }
  }

  function bind(els){
    if (!els || !els.jobType) return;

    const fire = ()=>applyUI(els);
    ['change','input','click','keyup','blur','focus'].forEach(ev=>els.jobType.addEventListener(ev, fire));
    const ikeaMode = document.getElementById('ikeaMode');
    if (ikeaMode) ['change','input','click'].forEach(ev=>ikeaMode.addEventListener(ev, fire));

    // Fallback watcher in case browser swallows events
    let last = els.jobType.value;
    setInterval(()=>{
      const now = els.jobType.value;
      if (now !== last){ last = now; fire(); }
    }, 150);

    // First paint
    fire();
  }

  function start(){
    // Wait until jobType exists, then wire up and FORCE UI to respond
    let tries = 0, iv = setInterval(()=>{
      const els = cacheAll();
      if (els.jobType){
        clearInterval(iv);
        // Hide everything initially
        hideAll(els);
        // Now bind listeners + paint
        bind(els);
      }
      if (++tries > 200){ clearInterval(iv); }
    }, 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();