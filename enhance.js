/* ════════════════════════════════════════════════════════════════
   enhance.js — UX/UI enhancements layered on top of main.js.
   Loaded after main.js. Never modifies pricing, calc, or quote logic.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var RESUME_KEY = 'bhd:lastJobType';
  var INSTALL_DISMISSED_KEY = 'bhd:installDismissed';

  /* ── Haptics ──────────────────────────────────────────────────── */
  function buzz(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
  }

  /* ── Toast system ─────────────────────────────────────────────── */
  function ensureToastStack() {
    var stack = document.getElementById('toastStack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toastStack';
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function toast(opts) {
    var stack = ensureToastStack();
    var el = document.createElement('div');
    el.className = 'toast';

    var actionsHtml = '';
    if (opts.actions && opts.actions.length) {
      actionsHtml = '<div class="toast-actions">' +
        opts.actions.map(function (a, i) {
          return '<button class="toast-btn' + (a.ghost ? ' is-ghost' : '') + '" data-i="' + i + '">' + a.label + '</button>';
        }).join('') +
        '</div>';
    }

    el.innerHTML =
      (opts.icon ? '<div class="toast-icon">' + opts.icon + '</div>' : '') +
      '<div class="toast-body">' + opts.body +
        (opts.sub ? '<div class="toast-sub">' + opts.sub + '</div>' : '') +
      '</div>' +
      actionsHtml;

    stack.appendChild(el);

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      el.classList.add('is-leaving');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }

    el.querySelectorAll('.toast-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-i'), 10);
        var act = opts.actions && opts.actions[i];
        if (act && typeof act.onClick === 'function') act.onClick();
        dismiss();
      });
    });

    if (opts.timeout) setTimeout(dismiss, opts.timeout);
    return { dismiss: dismiss, el: el };
  }

  /* ── Tile ripple coords + haptics ─────────────────────────────── */
  function wireTiles() {
    document.querySelectorAll('.tile').forEach(function (tile) {
      tile.addEventListener('pointerdown', function (e) {
        var r = tile.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        tile.style.setProperty('--rx', x + '%');
        tile.style.setProperty('--ry', y + '%');
      });
      tile.addEventListener('click', function () {
        buzz(8);
        var job = tile.dataset.job;
        if (job) try { localStorage.setItem(RESUME_KEY, job); } catch (e) {}
      });
    });
  }

  /* ── Opt-button haptics ──────────────────────────────────────── */
  function wireOptButtons() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('.opt-btn, .analysis-tab, .check-label');
      if (t) buzz(6);
    });
  }

  /* ── Keyboard shortcuts ──────────────────────────────────────── */
  function wireKeyboard() {
    document.addEventListener('keydown', function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      var isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (isTyping) return;

      var p1 = document.getElementById('panel1');
      if (p1 && p1.classList.contains('is-visible')) {
        if (e.key >= '1' && e.key <= '9') {
          var idx = parseInt(e.key, 10) - 1;
          var tiles = document.querySelectorAll('.tile');
          if (tiles[idx]) { tiles[idx].click(); e.preventDefault(); }
        }
      }

      if (e.key === 'Enter') {
        var p2 = document.getElementById('panel2');
        if (p2 && p2.classList.contains('is-visible')) {
          var calc = document.getElementById('btnCalc');
          if (calc) { calc.click(); e.preventDefault(); }
        }
      }

      if (e.key === 'Escape') {
        var bk = document.getElementById('btnBack');
        var bk2 = document.getElementById('btnBackToDetails');
        var p2v = document.getElementById('panel2');
        var p3v = document.getElementById('panel3');
        if (p3v && p3v.classList.contains('is-visible') && bk2) bk2.click();
        else if (p2v && p2v.classList.contains('is-visible') && bk) bk.click();
      }
    });
  }

  /* ── Quote reveal: haptic burst + confetti ───────────────────── */
  function wireQuoteReveal() {
    var totalEl = document.getElementById('total');
    if (!totalEl) return;
    var revealed = false;
    var obs = new MutationObserver(function () {
      if (totalEl.classList.contains('is-visible') && !revealed) {
        revealed = true;
        buzz(30);
        confettiBurst();
        setTimeout(function () { revealed = false; }, 4000);
      }
    });
    obs.observe(totalEl, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── Confetti (canvas, ~30 lines) ─────────────────────────────── */
  function confettiBurst() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
    c.width = innerWidth;
    c.height = innerHeight;
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    var colors = ['#ffb26b', '#ff7a59', '#f15a4a', '#ffd1a8', '#25D366'];
    var pieces = [];
    var quoteEl = document.querySelector('.quote-amount');
    var ox = innerWidth / 2;
    var oy = innerHeight / 3;
    if (quoteEl) {
      var r = quoteEl.getBoundingClientRect();
      ox = r.left + r.width / 2;
      oy = r.top + r.height / 2;
    }
    for (var i = 0; i < 110; i++) {
      pieces.push({
        x: ox, y: oy,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 14 - 4,
        g: 0.32,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0
      });
    }
    var t0 = performance.now();
    function tick(now) {
      ctx.clearRect(0, 0, c.width, c.height);
      var alive = false;
      pieces.forEach(function (p) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life++;
        if (p.y < c.height + 40) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.life / 110);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        ctx.restore();
      });
      if (alive && now - t0 < 4000) requestAnimationFrame(tick);
      else if (c.parentNode) c.parentNode.removeChild(c);
    }
    requestAnimationFrame(tick);
  }

  /* ── Save & resume quote ─────────────────────────────────────── */
  function maybeOfferResume() {
    var lastJob;
    try { lastJob = localStorage.getItem(RESUME_KEY); } catch (e) {}
    if (!lastJob) return;
    var url = new URL(location.href);
    if (url.searchParams.get('reset') || url.searchParams.get('fresh')) {
      try { localStorage.removeItem(RESUME_KEY); } catch (e) {}
      return;
    }
    var jobLabels = {
      tip: 'Tip Run', fb: 'Marketplace Pickup', move: 'House Move',
      flatpack: 'Flat Pack Build', ikea: 'IKEA Run', student: 'Student Move',
      shop: 'Shop Run', hay: 'Hay Bales', bags: 'Black Bags',
      garden: 'Gardening', bike: 'Bicycle Servicing',
      business: 'Business / Barter', other: 'Something Else'
    };
    var name = jobLabels[lastJob] || 'your last quote';
    setTimeout(function () {
      toast({
        icon: '↻',
        body: 'Welcome back!',
        sub: 'Resume ' + name + '?',
        actions: [
          {
            label: 'Resume',
            onClick: function () {
              var tile = document.querySelector('.tile[data-job="' + lastJob + '"]');
              if (tile) tile.click();
            }
          },
          { label: 'Dismiss', ghost: true, onClick: function () {
              try { localStorage.removeItem(RESUME_KEY); } catch (e) {}
          } }
        ],
        timeout: 12000
      });
    }, 900);
  }

  /* ── PWA install prompt card ─────────────────────────────────── */
  var deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstall = e;
    var dismissed;
    try { dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY); } catch (err) {}
    if (dismissed) return;
    setTimeout(function () {
      toast({
        icon: '⬇',
        body: 'Install the app',
        sub: 'Faster, offline, one-tap quotes.',
        actions: [
          {
            label: 'Install',
            onClick: function () {
              if (deferredInstall) {
                deferredInstall.prompt();
                deferredInstall.userChoice.finally(function () { deferredInstall = null; });
              }
            }
          },
          { label: 'Not now', ghost: true, onClick: function () {
              try { localStorage.setItem(INSTALL_DISMISSED_KEY, '1'); } catch (err) {}
          } }
        ],
        timeout: 0
      });
    }, 2500);
  });

  /* ── Share quote ─────────────────────────────────────────────── */
  var shareLogo = new Image();
  shareLogo.crossOrigin = 'anonymous';
  shareLogo.src = 'icon-512.png';

  function getQuoteText() {
    var totalEl = document.getElementById('total');
    var bdEl = document.getElementById('breakdown');
    var qid = document.getElementById('quoteId');
    var lines = [];
    lines.push("Ben's Humpin' & Dumpin' — Quote");
    if (totalEl) lines.push('Estimate: ' + totalEl.textContent.trim());
    if (qid && qid.textContent.trim()) lines.push(qid.textContent.trim());
    if (bdEl && bdEl.textContent.trim()) {
      lines.push('');
      lines.push(bdEl.textContent.trim());
    }
    return lines.join('\n');
  }

  function dataUrlToBlob(dataUrl) {
    try {
      var parts = dataUrl.split(',');
      var meta = parts[0];
      var b64 = parts[1];
      var mime = (meta.match(/:(.*?);/) || [])[1] || 'image/png';
      var bin = atob(b64);
      var len = bin.length;
      var arr = new Uint8Array(len);
      for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch (e) { return null; }
  }

  function getBreakdownLines() {
    var bdEl = document.getElementById('breakdown');
    if (!bdEl) return [];
    var raw = (bdEl.innerText || bdEl.textContent || '').trim();
    if (!raw) return [];
    return raw.split(/\n+/).map(function (l) {
      return l.replace(/^\s*•\s*/, '').trim();
    }).filter(Boolean);
  }

  function wrapText(ctx, text, maxWidth) {
    var words = text.split(/\s+/);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function renderQuoteImageSync() {
    var totalEl = document.getElementById('total');
    if (!totalEl) return null;
    var amount = totalEl.textContent.trim();
    var qid = ((document.getElementById('quoteId') || {}).textContent || '').trim();
    var bdLines = getBreakdownLines();

    var W = 1080, H = 1350;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');

    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#11131a');
    bg.addColorStop(1, '#0b0c10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var glow = ctx.createRadialGradient(W * 0.2, H * 0.12, 50, W * 0.2, H * 0.12, 800);
    glow.addColorStop(0, 'rgba(255,122,89,0.35)');
    glow.addColorStop(1, 'rgba(255,122,89,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,178,107,0.7)';
    ctx.lineWidth = 6;
    var pad = 60, cardR = 60;
    roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, cardR);
    ctx.stroke();

    if (shareLogo && shareLogo.complete && shareLogo.naturalWidth > 0) {
      var logoSize = 140;
      var logoCx = W / 2;
      var logoCy = 100 + logoSize / 2;
      var halo = ctx.createRadialGradient(logoCx, logoCy, 10, logoCx, logoCy, logoSize);
      halo.addColorStop(0, 'rgba(11,12,16,0.95)');
      halo.addColorStop(0.6, 'rgba(11,12,16,0.7)');
      halo.addColorStop(1, 'rgba(11,12,16,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(logoCx, logoCy, logoSize, 0, Math.PI * 2);
      ctx.fill();
      try {
        ctx.drawImage(shareLogo, logoCx - logoSize / 2, 100, logoSize, logoSize);
      } catch (e) {}
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#b6b9c2';
    ctx.font = '900 32px Nunito, system-ui, sans-serif';
    ctx.fillText("BEN'S HUMPIN' & DUMPIN'", W / 2, 290);
    ctx.fillStyle = '#7c8090';
    ctx.font = '700 22px Nunito, system-ui, sans-serif';
    ctx.fillText('YOUR ESTIMATE', W / 2, 330);

    var grad = ctx.createLinearGradient(W * 0.2, 400, W * 0.8, 560);
    grad.addColorStop(0, '#ffb26b');
    grad.addColorStop(0.6, '#ff7a59');
    grad.addColorStop(1, '#f15a4a');
    ctx.fillStyle = grad;
    ctx.font = "900 200px 'Bebas Neue', Impact, sans-serif";
    ctx.fillText(amount, W / 2, 540);

    if (qid) {
      ctx.fillStyle = '#7c8090';
      ctx.font = '700 22px Nunito, system-ui, sans-serif';
      ctx.fillText(qid, W / 2, 590);
    }

    var divY = 630;
    ctx.strokeStyle = 'rgba(255,178,107,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, divY);
    ctx.lineTo(W * 0.8, divY);
    ctx.stroke();

    ctx.fillStyle = '#7c8090';
    ctx.font = '700 22px Nunito, system-ui, sans-serif';
    ctx.fillText('QUOTE DETAILS', W / 2, 680);

    if (bdLines.length) {
      ctx.textAlign = 'left';
      var maxLines = 14;
      var fontSize = 26;
      if (bdLines.length > 8) fontSize = 24;
      if (bdLines.length > 11) fontSize = 22;
      var lineH = Math.round(fontSize * 1.45);
      ctx.font = '700 ' + fontSize + 'px Nunito, system-ui, sans-serif';
      var bulletX = pad + 60;
      var textX = bulletX + 24;
      var maxTextW = W - pad - 60 - textX;
      var y = 730;
      var rendered = 0;
      for (var i = 0; i < bdLines.length && rendered < maxLines; i++) {
        var wrapped = wrapText(ctx, bdLines[i], maxTextW);
        ctx.fillStyle = '#ffb26b';
        ctx.fillText('•', bulletX, y);
        ctx.fillStyle = '#d6d8df';
        for (var j = 0; j < wrapped.length && rendered < maxLines; j++) {
          ctx.fillText(wrapped[j], textX, y);
          y += lineH;
          rendered++;
        }
      }
      ctx.textAlign = 'center';
    }

    ctx.fillStyle = '#b6b9c2';
    ctx.font = '700 26px Nunito, system-ui, sans-serif';
    ctx.fillText('Final price confirmed by Ben', W / 2, H - 170);

    ctx.fillStyle = '#ffb26b';
    ctx.font = '900 28px Nunito, system-ui, sans-serif';
    ctx.fillText('WhatsApp Ben to book', W / 2, H - 120);

    try {
      return dataUrlToBlob(c.toDataURL('image/png'));
    } catch (e) {
      return null;
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function shareQuote() {
    var btn = document.getElementById('btnShare');
    var orig = btn ? btn.innerHTML : null;
    if (btn) { btn.innerHTML = '⏳ Preparing…'; btn.disabled = true; }
    var restore = function () {
      if (btn && orig != null) { btn.innerHTML = orig; btn.disabled = false; }
    };

    var text, blob, file, data;
    try {
      text = getQuoteText();
      blob = renderQuoteImageSync();
      file = blob ? new File([blob], 'humpin-dumpin-quote.png', { type: 'image/png' }) : null;
      data = { title: "Ben's Humpin' & Dumpin' Quote", text: text };
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        data.files = [file];
      }
    } catch (e) {
      restore();
      toast({ icon: '⚠', body: 'Could not build share image', sub: String(e.message || e), timeout: 4000 });
      return;
    }

    if (navigator.share) {
      try {
        var p = navigator.share(data);
        if (p && p.then) {
          p.then(restore).catch(function (err) {
            restore();
            if (err && err.name === 'AbortError') return;
            downloadOrCopy(file, text);
          });
        } else {
          restore();
        }
        return;
      } catch (e) {
        restore();
        downloadOrCopy(file, text);
        return;
      }
    }
    restore();
    downloadOrCopy(file, text);
  }

  function downloadOrCopy(file, text) {
    if (file) {
      var url = URL.createObjectURL(file);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'humpin-dumpin-quote.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      toast({ icon: '⬇', body: 'Quote image saved', sub: 'Send it to Ben on WhatsApp.', timeout: 3500 });
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        toast({ icon: '✓', body: 'Quote copied to clipboard', timeout: 2500 });
      }).catch(function () {
        toast({ icon: '⚠', body: 'Could not share', timeout: 2500 });
      });
    }
  }

  function wireShare() {
    var btn = document.getElementById('btnShare');
    if (btn) btn.addEventListener('click', shareQuote);
  }

  /* ── Map preview (static OSM) ────────────────────────────────── */
  function wireMapPreview() {
    var addrInputs = document.querySelectorAll('#addrPickup, #addrDrop, #bikeAddr');
    addrInputs.forEach(function (inp) {
      var preview = document.createElement('div');
      preview.className = 'map-preview';
      inp.parentNode.insertBefore(preview, inp.nextSibling);

      var debounce;
      inp.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(function () {
          var q = inp.value.trim();
          if (q.length < 4) {
            preview.classList.remove('is-shown');
            preview.innerHTML = '';
            return;
          }
          var src = 'https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&query=' + encodeURIComponent(q);
          fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q))
            .then(function (r) { return r.json(); })
            .then(function (j) {
              if (!j || !j[0]) {
                preview.classList.remove('is-shown');
                preview.innerHTML = '';
                return;
              }
              var lat = parseFloat(j[0].lat);
              var lon = parseFloat(j[0].lon);
              var d = 0.01;
              var bbox = (lon - d) + ',' + (lat - d) + ',' + (lon + d) + ',' + (lat + d);
              preview.innerHTML = '<iframe loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik&marker=' + lat + ',' + lon + '"></iframe>';
              preview.classList.add('is-shown');
            })
            .catch(function () {
              preview.classList.remove('is-shown');
              preview.innerHTML = '';
            });
        }, 1000);
      });
    });
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    wireTiles();
    wireOptButtons();
    wireKeyboard();
    wireQuoteReveal();
    wireShare();
    wireMapPreview();
    maybeOfferResume();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
