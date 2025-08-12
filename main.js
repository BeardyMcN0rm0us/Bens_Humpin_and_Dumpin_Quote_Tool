// main.js — probe
(function(){
  const dbg = document.getElementById('dbg');
  const log = (t)=>{ dbg.textContent = t; console.log('[probe]', t); };

  log('✅ external JS loaded');

  const job = document.getElementById('jobType');
  const pickup = document.getElementById('pickup');
  const drop = document.getElementById('drop');

  if(!job){ log('❌ jobType select not found'); return; }

  function show(el){ el && el.classList.remove('hidden'); }
  function hide(el){ el && el.classList.add('hidden'); }

  function setUI(){
    const v = job.value || '';
    hide(pickup); hide(drop);
    if(!v){ log('🟡 change fired — empty'); return; }
    show(pickup);
    if(v==='move') show(drop);
    log('✅ change fired — '+v);
  }

  job.addEventListener('change', setUI);
  job.addEventListener('input', setUI);
  setUI();
  log('✅ listeners attached — change the dropdown');
})();
