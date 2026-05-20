/* ════════════════════════════════════════════════════════════════
   quotes-bookings.js — Save / retrieve quotes + booking system.
   Loaded after main.js + enhance.js. Pure client-side (localStorage).
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var QUOTES_KEY         = 'bhd:quotes';
  var BOOKINGS_KEY       = 'bhd:bookings';
  var ADMIN_BOOKINGS_KEY = 'bhd:adminBookings';
  var CONTACT_KEY        = 'bhd:contact';
  var MAX_QUOTES         = 50;
  var MAX_BOOKINGS       = 50;

  var JOB_LABELS = {
    tip: 'Tip Run', fb: 'Marketplace Pickup', move: 'House Move',
    flatpack: 'Flat Pack Build', ikea: 'IKEA Run', student: 'Student Move',
    shop: 'Shop Run', hay: 'Hay Bales', bags: 'Black Bags',
    garden: 'Gardening', bike: 'Bicycle Servicing',
    business: 'Business / Barter', other: 'Something Else'
  };

  /* ── tiny utils ──────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function readJSON(key, fb) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }
    catch (e) { return fb; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function newBookingId() {
    var n = new Date(), p = function (v) { return String(v).padStart(2, '0'); };
    return 'BK' + n.getFullYear() + p(n.getMonth() + 1) + p(n.getDate())
      + '-' + p(n.getHours()) + p(n.getMinutes()) + p(n.getSeconds());
  }
  function toast(opts) {
    try {
      if (typeof window.bhdToast === 'function') return window.bhdToast(opts);
    } catch (e) { console.error('[BHD] toast error:', e); }
    // fallback if enhance.js didn't expose it
    alert((opts.body || '') + (opts.sub ? '\n' + opts.sub : ''));
  }

  /* ── store ───────────────────────────────────────────────────── */
  var Store = {
    quotes:   function () { return readJSON(QUOTES_KEY, []) || []; },
    bookings: function () { return readJSON(BOOKINGS_KEY, []) || []; },
    contact:  function () { return readJSON(CONTACT_KEY, {}) || {}; },
    saveQuote: function (q) {
      var list = Store.quotes();
      // de-dup by quote id (overwrite)
      list = list.filter(function (x) { return x.id !== q.id; });
      list.unshift(q);
      if (list.length > MAX_QUOTES) list = list.slice(0, MAX_QUOTES);
      writeJSON(QUOTES_KEY, list);
      if (window.BHDdb) window.BHDdb.saveQuote(q);
    },
    deleteQuote: function (id) {
      writeJSON(QUOTES_KEY, Store.quotes().filter(function (x) { return x.id !== id; }));
      if (window.BHDdb) window.BHDdb.deleteQuote(id);
    },
    saveBooking: function (b) {
      var list = Store.bookings();
      list = list.filter(function (x) { return x.id !== b.id; });
      list.unshift(b);
      if (list.length > MAX_BOOKINGS) list = list.slice(0, MAX_BOOKINGS);
      writeJSON(BOOKINGS_KEY, list);
      if (window.BHDdb) window.BHDdb.saveBooking(b);
    },
    updateBooking: function (id, patch) {
      var list = Store.bookings();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { Object.assign(list[i], patch); break; }
      }
      writeJSON(BOOKINGS_KEY, list);
      if (window.BHDdb) window.BHDdb.updateBooking(id, patch);
    },
    deleteBooking: function (id) {
      writeJSON(BOOKINGS_KEY, Store.bookings().filter(function (x) { return x.id !== id; }));
      if (window.BHDdb) window.BHDdb.deleteBooking(id);
    },
    saveContact: function (c) { writeJSON(CONTACT_KEY, c); },
    adminBookings: function () { return readJSON(ADMIN_BOOKINGS_KEY, []) || []; },
    saveAdminBooking: function (b) {
      var list = Store.adminBookings();
      list = list.filter(function (x) { return x.id !== b.id; });
      list.unshift(b);
      if (list.length > MAX_BOOKINGS) list = list.slice(0, MAX_BOOKINGS);
      writeJSON(ADMIN_BOOKINGS_KEY, list);
      if (window.BHDdb) window.BHDdb.saveBooking(b);
    },
    updateAdminBooking: function (id, patch) {
      var list = Store.adminBookings();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { Object.assign(list[i], patch); break; }
      }
      writeJSON(ADMIN_BOOKINGS_KEY, list);
      if (window.BHDdb) window.BHDdb.updateBooking(id, patch);
    }
  };
  window.BHDStore = Store;

  /* ── deeplink helpers ────────────────────────────────────────── */
  // Payload format v2: positional JSON array. Field names cost bytes,
  // and these links travel through WhatsApp so every character matters.
  //   ['b', id, dt, svc, est, n, ph, a, qid]      ← customer → Ben
  //   ['c', id, act, dt?, nt?]                    ← Ben → customer
  //   ['r', id, act, dt?]                         ← customer → Ben (reply)
  // Date is compact ISO without ms or Z, e.g. "2026-05-11T07:08".
  function compactDate(iso) {
    if (!iso) return '';
    return String(iso).replace(/:\d\d(\.\d+)?Z?$/, '').replace(/Z$/, '');
  }
  function expandDate(s) {
    if (!s) return '';
    return /Z$/.test(s) ? s : s + ':00Z';
  }
  function encodeArr(arr) {
    try {
      var s = btoa(unescape(encodeURIComponent(JSON.stringify(arr))));
      return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) { return ''; }
  }
  function decodePayload(s) {
    if (!s) return null;
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var arr;
    try { arr = JSON.parse(decodeURIComponent(escape(atob(s)))); }
    catch (e) { return null; }
    if (!Array.isArray(arr) || arr.length < 2) return null;
    var ROLE = { b: 'ben', c: 'cust', r: 'ben2' };
    var role = ROLE[arr[0]];
    if (!role) return null;
    if (role === 'ben') {
      return {
        k: 'ben', id: arr[1], dt: expandDate(arr[2]),
        svc: arr[3] || '', est: arr[4] || '',
        n: arr[5] || '', ph: arr[6] || '',
        a: arr[7] || '', qid: arr[8] || ''
      };
    }
    if (role === 'cust') {
      return {
        k: 'cust', id: arr[1], act: arr[2],
        dt: expandDate(arr[3]), nt: arr[4] || '',
        svc: arr[5] || '', est: arr[6] || '',
        n: arr[7] || '', qid: arr[8] || '',
        jt: arr[9] || ''
      };
    }
    return { k: 'ben2', id: arr[1], act: arr[2], dt: expandDate(arr[3]) };
  }
  function appUrl() { return location.origin + location.pathname; }
  function buildBenLink(booking) {
    // Keep this payload small — the breakdown is already in the message
    // body, no need to duplicate it inside the deeplink.
    var arr = [
      'b', booking.id, compactDate(booking.whenISO),
      booking.jobLabel || booking.jobType || '',
      booking.total || '',
      booking.name || '', booking.phone || '',
      booking.address || '', booking.quoteId || ''
    ];
    return appUrl() + '?bhd=' + encodeArr(arr);
  }
  function buildCustLink(action, id, opts, snap) {
    // Self-contained so the link still works if it lands in a different
    // browsing context (e.g. Safari rather than the installed PWA — iOS
    // sandboxes the two; their localStorage doesn't share).
    var arr = ['c', id, action];
    if (opts && opts.dt)   arr[3] = compactDate(opts.dt);
    if (opts && opts.note) arr[4] = opts.note;
    if (snap) {
      arr[5] = snap.jobLabel || snap.jobType || '';
      arr[6] = snap.total || '';
      arr[7] = snap.name || '';
      arr[8] = snap.quoteId || '';
    }
    // Revise carries the *new* service & price in arr[5/6/9] so the
    // customer's app can show the revision even when the original
    // booking record isn't on that device.
    if (opts && opts.newLabel != null)   arr[5] = opts.newLabel;
    if (opts && opts.newTotal != null)   arr[6] = opts.newTotal;
    if (opts && opts.newJobType != null) arr[9] = opts.newJobType;
    return appUrl() + '?bhd=' + encodeArr(arr);
  }
  function buildBenReplyLink(action, id, opts) {
    var arr = ['r', id, action];
    if (opts && opts.dt) arr[3] = compactDate(opts.dt);
    return appUrl() + '?bhd=' + encodeArr(arr);
  }
  function normalizePhone(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    var plus = s.charAt(0) === '+';
    var digits = s.replace(/\D/g, '');
    if (!digits) return '';
    if (!plus && digits.charAt(0) === '0') digits = '44' + digits.slice(1);
    return digits;
  }
  function displayPhone(raw) {
    var d = normalizePhone(raw);
    return d ? '+' + d : (raw || '');
  }
  function waOpen(phone, msg) {
    var num = normalizePhone(phone);
    var url = num
      ? 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg)
      : 'https://wa.me/?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }

  /* ── snapshot the current quote on panel 3 ───────────────────── */
  function currentQuoteSnapshot() {
    var totalEl = $('total');
    if (!totalEl || !totalEl.classList.contains('show')) return null;
    var qidRaw = ($('quoteId') && $('quoteId').textContent) || '';
    var id = qidRaw.replace(/^Quote ID\s*[—-]\s*/, '').trim();
    if (!id) return null;
    var bdEl = $('breakdown');
    var lines = [];
    if (bdEl) {
      var raw = (bdEl.innerText || bdEl.textContent || '').trim();
      lines = raw.split(/\n+/).map(function (l) {
        return l.replace(/^\s*•\s*/, '').trim();
      }).filter(Boolean);
    }
    var jobType = ($('jobType') && $('jobType').value) || '';
    var addrPickup = ($('addrPickup') && $('addrPickup').value) || '';
    var addrDrop = ($('addrDrop') && $('addrDrop').value) || '';
    var bikeAddr = ($('bikeAddr') && $('bikeAddr').value) || '';
    // Each job type has its own notes box; read the one that belongs to this
    // job so hidden fields from a previously-selected type don't leak through.
    var notesId = jobType === 'garden' ? 'gardenOther'
                : jobType === 'bike'   ? 'bikeNotes'
                :                        'jobDesc';
    var notes = ($(notesId) && $(notesId).value) || '';
    return {
      id: id,
      savedAt: new Date().toISOString(),
      jobType: jobType,
      jobLabel: JOB_LABELS[jobType] || jobType,
      total: totalEl.textContent.trim(),
      breakdown: lines,
      address: addrPickup || addrDrop || bikeAddr || '',
      addrPickup: addrPickup,
      addrDrop: addrDrop,
      bikeAddr: bikeAddr,
      notes: notes
    };
  }

  /* ── modal helpers ───────────────────────────────────────────── */
  var modal = {
    open: function (title, html) {
      var m = $('bhdModal');
      if (!m) return;
      $('bhdModalTitle').textContent = title;
      $('bhdModalBody').innerHTML = html;
      m.removeAttribute('hidden');
      m.classList.remove('hidden');
      m.classList.add('is-open');
      document.body.classList.add('bhd-modal-open');
    },
    close: function () {
      var m = $('bhdModal');
      if (!m) return;
      m.classList.remove('is-open');
      m.classList.add('hidden');
      m.setAttribute('hidden', '');
      document.body.classList.remove('bhd-modal-open');
    }
  };
  function wireModalClose() {
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-bhd-close]')) modal.close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('bhdModal') && $('bhdModal').classList.contains('is-open')) modal.close();
    });
  }

  /* ── chip counts on panel 1 ──────────────────────────────────── */
  function refreshCounts() {
    var qc = Store.quotes().length;
    var bc = Store.bookings().length;
    var qEl = $('myQuotesCount');
    var bEl = $('myBookingsCount');
    if (qEl) {
      qEl.textContent = qc;
      qEl.toggleAttribute('hidden', qc === 0);
    }
    if (bEl) {
      bEl.textContent = bc;
      bEl.toggleAttribute('hidden', bc === 0);
    }
  }

  /* ── admin PIN + dashboard ───────────────────────────────────── */
  var adminUnlocked = false;

  function openAdminPinModal() {
    var html =
      '<div style="text-align:center;padding:20px 0 8px">' +
        '<div style="font-size:2.5rem;margin-bottom:10px">&#128274;</div>' +
        '<p style="font-weight:600;margin:0 0 18px">Enter admin PIN</p>' +
        '<input type="password" id="adminPinInput" inputmode="numeric" pattern="[0-9]*" ' +
               'maxlength="6" autocomplete="off" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;" ' +
               'style="font-size:1.8rem;letter-spacing:0.4em;text-align:center;width:180px;' +
                      'border:2px solid var(--clr-border,#e0e0e0);border-radius:10px;padding:10px 8px;' +
                      'background:var(--clr-surface,#f8f8f8)">' +
        '<div id="adminPinErr" style="color:#e53e3e;font-size:0.85rem;margin-top:10px;min-height:18px"></div>' +
      '</div>';
    modal.open('Admin Access', html);
    var inp = $('adminPinInput');
    if (!inp) return;
    // Small delay so the modal animation finishes before keyboard pops
    setTimeout(function () { inp.focus(); }, 120);
    inp.addEventListener('input', function () {
      $('adminPinErr').textContent = '';
      if (inp.value.length === 6) {
        var correct = String((window.BHD && window.BHD.adminPin) || '010203');
        if (inp.value === correct) {
          adminUnlocked = true;
          if (window.BHDdb) {
            modal.close();
            window.BHDdb.checkAdmin().then(function (isAdmin) {
              if (isAdmin) { openAdminDashboard(); }
              else { openAdminSignIn(); }
            });
          } else {
            openAdminDashboard();
          }
        } else {
          inp.value = '';
          $('adminPinErr').textContent = 'Incorrect PIN — try again';
          inp.focus();
        }
      }
    });
  }

  var _adminAll = [];

  /* ── admin schedule helpers ──────────────────────────────────── */
  function admPad(n) { return String(n).padStart(2, '0'); }
  function admLocalKey(d) { return d.getFullYear() + '-' + admPad(d.getMonth() + 1) + '-' + admPad(d.getDate()); }
  function admStartOfToday() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function admDayKey(iso) { var d = new Date(iso); return isNaN(d.getTime()) ? String(iso || '') : admLocalKey(d); }
  function admTime(iso) { var d = new Date(iso); return isNaN(d.getTime()) ? '' : admPad(d.getHours()) + ':' + admPad(d.getMinutes()); }
  function admDayHeading(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso || '');
    var label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    var today = new Date(), tom = new Date(); tom.setDate(tom.getDate() + 1);
    if (admLocalKey(d) === admLocalKey(today)) return 'Today · ' + label;
    if (admLocalKey(d) === admLocalKey(tom))   return 'Tomorrow · ' + label;
    return label;
  }
  // Apple Maps takes a single destination (no multi-stop via URL); Google
  // Maps is used for the whole-day route link because it supports waypoints.
  function appleMapsUrl(addr) { return 'https://maps.apple.com/?daddr=' + encodeURIComponent(addr); }
  function googleRouteUrl(stops) {
    return 'https://www.google.com/maps/dir/' + stops.map(function (s) { return encodeURIComponent(s); }).join('/');
  }

  function renderAdminJobCard(b) {
    var statusClass = 'bhd-status bhd-status-' + (b.status || 'pending');
    var canReview = b.status === 'pending' || b.status === 'suggested' || b.status === 'revised';
    var addr = (b.address || '').trim();
    var tel = normalizePhone(b.phone);
    return '<li class="bhd-card adm-job" data-adm-id="' + esc(b.id) + '">' +
      '<div class="bhd-card-head">' +
        '<strong>' + esc(admTime(b.whenISO) || '—') + ' &middot; ' + esc(b.name || 'Customer') + '</strong>' +
        '<span class="' + esc(statusClass) + '">' + esc(b.status || 'pending') + '</span>' +
      '</div>' +
      '<div class="bhd-meta">' + esc(b.jobLabel || b.jobType || '') +
        (b.total ? ' &middot; <strong>' + esc(b.total) + '</strong>' : '') + '</div>' +
      (tel ? '<div class="bhd-meta">&#128222; <a href="tel:+' + esc(tel) + '">' + esc(displayPhone(b.phone)) + '</a></div>' : '') +
      (b.email ? '<div class="bhd-meta">&#9993; <a href="mailto:' + esc(b.email) + '">' + esc(b.email) + '</a></div>' : '') +
      (addr ? '<div class="bhd-meta">&#128205; ' + esc(addr) +
        ' <a class="adm-nav" target="_blank" rel="noopener" href="' + esc(appleMapsUrl(addr)) + '">Navigate &#9656;</a></div>' : '') +
      (b.notes ? '<div class="bhd-meta adm-notes">&#128221; ' + esc(b.notes) + '</div>' : '') +
      '<div class="bhd-meta adm-id">' + esc(b.id) + '</div>' +
      '<div class="bhd-card-actions">' +
        (canReview ? '<button class="btn btn-primary btn-sm" type="button" data-adm-act="review">Review &rarr;</button>' : '') +
        '<button class="btn btn-ghost btn-sm" type="button" data-adm-act="del">Remove</button>' +
      '</div>' +
    '</li>';
  }

  function admMapFail(el, msg) {
    el.classList.add('adm-map-fail');
    el.textContent = msg;
  }

  function renderDayMap(mapId, stops) {
    var el = document.getElementById(mapId);
    if (!el) return;
    if (!window.google || !window.google.maps) {
      admMapFail(el, 'Map needs Google Maps — reopen the schedule once it loads.');
      return;
    }
    var homeAddr = (window.BHD && window.BHD.homeAddress) || '';
    try {
      var map = new google.maps.Map(el, {
        zoom: 9, center: { lat: 52.4, lng: 0.1 },
        mapTypeControl: false, streetViewControl: false, fullscreenControl: false
      });
      var ds = new google.maps.DirectionsService();
      // The app's Maps key has the Directions API but not the Geocoding API,
      // so a lone stop is located by routing home → stop and dropping a pin
      // at the leg's end point rather than calling the Geocoder directly.
      if (stops.length < 2) {
        ds.route({
          origin: homeAddr || stops[0],
          destination: stops[0],
          travelMode: 'DRIVING', region: 'uk'
        }, function (res, status) {
          if (status === 'OK' && res && res.routes[0]) {
            var dest = res.routes[0].legs[0].end_location;
            map.setCenter(dest);
            map.setZoom(13);
            new google.maps.Marker({ map: map, position: dest });
          } else {
            admMapFail(el, 'Map preview unavailable for this address.');
          }
        });
        return;
      }
      var dr = new google.maps.DirectionsRenderer({ map: map });
      var wp = stops.map(function (s) { return { location: s, stopover: true }; });
      ds.route({
        origin: homeAddr || stops[0],
        destination: homeAddr || stops[stops.length - 1],
        waypoints: homeAddr ? wp : wp.slice(1, -1),
        travelMode: 'DRIVING', region: 'uk'
      }, function (res, status) {
        if (status === 'OK' && res) { dr.setDirections(res); }
        else { admMapFail(el, 'Route preview unavailable — use the link below.'); }
      });
    } catch (e) {
      admMapFail(el, 'Map preview unavailable.');
    }
  }

  function renderAdminDashboard(all) {
    _adminAll = all || [];
    var homeAddr = (window.BHD && window.BHD.homeAddress) || '';
    var today = admStartOfToday();
    var upcoming = _adminAll.filter(function (b) {
      if (!b || b.status === 'removed' || !b.whenISO) return false;
      var d = new Date(b.whenISO);
      return !isNaN(d.getTime()) && d >= today;
    }).sort(function (a, b) { return new Date(a.whenISO) - new Date(b.whenISO); });

    var html, mapJobs = [];
    if (!upcoming.length) {
      html =
        '<div class="bhd-empty-state">' +
          '<span class="bhd-empty-icon">&#128197;</span>' +
          '<div class="bhd-empty-title">No upcoming jobs</div>' +
          '<div class="bhd-empty-sub">Confirmed and pending bookings from today onwards appear here, grouped by day.</div>' +
        '</div>';
    } else {
      var pending = upcoming.filter(function (b) { return b.status === 'pending'; }).length;
      var days = [], byKey = {};
      upcoming.forEach(function (b) {
        var k = admDayKey(b.whenISO);
        if (!byKey[k]) { byKey[k] = { key: k, iso: b.whenISO, jobs: [] }; days.push(byKey[k]); }
        byKey[k].jobs.push(b);
      });
      html = '<div class="adm-summary">' +
        upcoming.length + ' upcoming job' + (upcoming.length > 1 ? 's' : '') +
        ' &middot; ' + days.length + ' day' + (days.length > 1 ? 's' : '') +
        (pending ? ' &middot; <strong style="color:#c0392b">' + pending + ' pending</strong>' : '') +
        '</div>';
      days.forEach(function (day) {
        html += '<section class="adm-day">' +
          '<div class="adm-day-head">' + esc(admDayHeading(day.iso)) +
            '<span class="adm-day-count">' + day.jobs.length + ' job' + (day.jobs.length > 1 ? 's' : '') + '</span>' +
          '</div>';
        var stops = day.jobs.map(function (j) { return (j.address || '').trim(); }).filter(Boolean);
        if (stops.length) {
          var mapId = 'admMap-' + day.key;
          html += '<div class="adm-route">' +
            '<div class="adm-map" id="' + esc(mapId) + '"></div>';
          if (stops.length >= 2) {
            var linkStops = homeAddr ? [homeAddr].concat(stops).concat([homeAddr]) : stops;
            html += '<a class="btn btn-ghost btn-sm adm-route-link" target="_blank" rel="noopener" href="' +
              esc(googleRouteUrl(linkStops)) + '">&#128506; Open full route in Google Maps</a>';
          }
          html += '</div>';
          mapJobs.push({ mapId: mapId, stops: stops });
        }
        html += '<ul class="bhd-list">';
        day.jobs.forEach(function (b) { html += renderAdminJobCard(b); });
        html += '</ul></section>';
      });
    }
    modal.open('&#128197; Schedule', html);
    var body = $('bhdModalBody');
    if (!body) return;
    body.querySelectorAll('.bhd-card').forEach(function (card) {
      var id = card.getAttribute('data-adm-id');
      card.querySelectorAll('[data-adm-act]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var act = btn.getAttribute('data-adm-act');
          var b = _adminAll.filter(function (x) { return x.id === id; })[0] ||
                  Store.adminBookings().filter(function (x) { return x.id === id; })[0];
          if (!b) return;
          if (act === 'review') {
            renderBenReview(b);
          } else if (act === 'del') {
            if (!confirm('Remove this booking from your list?')) return;
            Store.updateAdminBooking(id, { status: 'removed' });
            refreshCounts();
            openAdminDashboard();
          }
        });
      });
    });
    if (mapJobs.length) {
      setTimeout(function () {
        mapJobs.forEach(function (m) { renderDayMap(m.mapId, m.stops); });
      }, 180);
    }
  }

  function openAdminDashboard() {
    if (window.BHDdb) {
      modal.open('&#128203; All Bookings', '<div style="padding:24px;text-align:center;color:var(--clr-muted,#666)">Loading&#8230;</div>');
      window.BHDdb.loadAllBookings().then(function (bookings) {
        renderAdminDashboard(bookings);
      }).catch(function () {
        renderAdminDashboard(Store.adminBookings().filter(function (b) { return b.status !== 'removed'; }));
      });
      return;
    }
    renderAdminDashboard(Store.adminBookings().filter(function (b) { return b.status !== 'removed'; }).slice().sort(function (a, b) {
      return new Date(b.receivedAt || b.createdAt || 0) - new Date(a.receivedAt || a.createdAt || 0);
    }));
  }

  function openAdminSignIn() {
    var html =
      '<div style="text-align:center;padding:12px 0 4px">' +
        '<div style="font-size:2rem;margin-bottom:8px">&#128101;</div>' +
        '<p style="font-weight:600;margin:0 0 16px">Sign in as Ben</p>' +
      '</div>' +
      '<form id="bhdAdminSignInForm" class="bhd-form" novalidate>' +
        '<label class="field-label">Email' +
          '<input type="email" id="asiEmail" autocomplete="email" required>' +
        '</label>' +
        '<label class="field-label">Password' +
          '<input type="password" id="asiPass" autocomplete="current-password" required>' +
        '</label>' +
        '<div class="bhd-form-msg" id="asiErr" hidden></div>' +
        '<div class="bhd-form-actions">' +
          '<button type="submit" class="btn btn-primary">Sign in</button>' +
          '<button type="button" class="btn btn-ghost" data-bhd-close>Cancel</button>' +
        '</div>' +
      '</form>';
    modal.open('Admin Sign In', html);
    var form = $('bhdAdminSignInForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = ($('asiEmail') && $('asiEmail').value.trim()) || '';
      var pass  = ($('asiPass')  && $('asiPass').value)         || '';
      var errEl = $('asiErr');
      if (!email || !pass) {
        errEl.textContent = 'Please enter email and password.';
        errEl.removeAttribute('hidden');
        return;
      }
      var submitBtn = form.querySelector('[type=submit]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in…';
      window.BHDdb.adminSignIn(email, pass).then(function (ok) {
        if (ok) {
          openAdminDashboard();
        } else {
          errEl.textContent = 'Not authorised as admin.';
          errEl.removeAttribute('hidden');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign in';
        }
      }).catch(function (err) {
        errEl.textContent = (err && err.message) || 'Sign-in failed — check email and password.';
        errEl.removeAttribute('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
      });
    });
  }

  /* ── save current quote ──────────────────────────────────────── */
  function saveCurrentQuote() {
    var snap = currentQuoteSnapshot();
    if (!snap) {
      toast({ icon: '⚠', body: 'No quote to save', sub: 'Calculate a quote first.', timeout: 3000 });
      return;
    }
    Store.saveQuote(snap);
    refreshCounts();
    toast({
      icon: '💾', body: 'Quote saved', sub: snap.jobLabel + ' — ' + snap.total,
      actions: [{ label: 'View', onClick: openQuotesModal }],
      timeout: 4000
    });
  }

  /* ── quotes list modal ───────────────────────────────────────── */
  function openQuotesModal() {
    var list = Store.quotes();
    var html;
    if (!list.length) {
      html = '<div class="bhd-empty-state">' +
        '<span class="bhd-empty-icon">💾</span>' +
        '<div class="bhd-empty-title">No saved quotes yet</div>' +
        '<div class="bhd-empty-sub">Tap a job type, fill in the details,<br>then hit <strong>Save</strong> to store it here.</div>' +
        '<button class="bhd-empty-cta" type="button" data-bhd-close>Get a quote →</button>' +
        '</div>';
    } else {
      html =
        '<div class="bhd-list-actions">' +
          '<button class="btn btn-whatsapp btn-sm" type="button" id="sendAllQuotesBtn">' +
            '💬 Send all to Ben' +
          '</button>' +
          '<button class="btn btn-ghost btn-sm" type="button" id="clearAllQuotesBtn">Clear all</button>' +
        '</div>' +
        '<ul class="bhd-list">' +
        list.map(function (q) {
          return '<li class="bhd-card" data-id="' + esc(q.id) + '">' +
            '<div class="bhd-card-head">' +
              '<strong>' + esc(q.jobLabel || q.jobType || 'Quote') + '</strong>' +
              '<span class="bhd-amount">' + esc(q.total || '') + '</span>' +
            '</div>' +
            '<div class="bhd-meta">' +
              esc(q.id) + ' · saved ' + esc(fmtDate(q.savedAt)) +
              (q.address ? ' · ' + esc(q.address) : '') +
            '</div>' +
            (q.breakdown && q.breakdown.length
              ? '<details class="bhd-card-details"><summary>Breakdown</summary><ul>' +
                q.breakdown.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') +
                '</ul></details>'
              : '') +
            '<div class="bhd-card-actions">' +
              '<button class="btn btn-primary btn-sm" type="button" data-act="book">📅 Book</button>' +
              '<button class="btn btn-whatsapp btn-sm" type="button" data-act="wa">💬 WhatsApp</button>' +
              '<button class="btn btn-ghost btn-sm" type="button" data-act="del">Delete</button>' +
            '</div>' +
          '</li>';
        }).join('') +
        '</ul>';
    }
    modal.open('Saved quotes', html);
    var body = $('bhdModalBody');
    if (!body) return;
    var sendAll = body.querySelector('#sendAllQuotesBtn');
    if (sendAll) sendAll.addEventListener('click', function () { sendQuotesToBen(Store.quotes()); });
    var clearAll = body.querySelector('#clearAllQuotesBtn');
    if (clearAll) clearAll.addEventListener('click', function () {
      if (!confirm('Delete all saved quotes? This cannot be undone.')) return;
      writeJSON(QUOTES_KEY, []);
      refreshCounts();
      openQuotesModal();
    });
    body.querySelectorAll('.bhd-card').forEach(function (card) {
      var id = card.getAttribute('data-id');
      card.querySelectorAll('[data-act]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var act = btn.getAttribute('data-act');
          var q = Store.quotes().filter(function (x) { return x.id === id; })[0];
          if (!q) return;
          if (act === 'del') {
            if (!confirm('Delete this saved quote?')) return;
            Store.deleteQuote(id);
            refreshCounts();
            openQuotesModal();
          } else if (act === 'wa') {
            sendQuotesToBen([q]);
          } else if (act === 'book') {
            openBookingModal(q);
          }
        });
      });
    });
  }

  /* ── send saved quotes to Ben on WhatsApp ────────────────────── */
  function sendQuotesToBen(quotes) {
    if (!quotes || !quotes.length) return;
    var CFG = window.BHD || {};
    var num = CFG.whatsappNumber || '';
    var headerOne = "Hey Ben — here's a quote I'd like to follow up on:";
    var headerMany = "Hey Ben — here are " + quotes.length + " quotes I'd like to follow up on:";
    var parts = [quotes.length === 1 ? headerOne : headerMany, ''];
    quotes.forEach(function (q, i) {
      parts.push('— Quote ' + (i + 1) + ' —');
      parts.push('Service: ' + (q.jobLabel || q.jobType || 'N/A'));
      parts.push('Quote ID: ' + q.id);
      if (q.address) parts.push('Address: ' + q.address);
      if (q.total)   parts.push('Estimate: ' + q.total);
      if (q.breakdown && q.breakdown.length) {
        parts.push('Breakdown:');
        q.breakdown.forEach(function (l) { parts.push('- ' + l); });
      }
      parts.push('');
    });
    var msg = parts.join('\n').trim();
    if (num) {
      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank');
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(function () {
        toast({ icon: '📋', body: 'Quotes copied to clipboard', timeout: 2500 });
      });
    }
  }

  /* ── booking modal ───────────────────────────────────────────── */
  function openBookingModal(quoteOrSnap) {
    var snap = quoteOrSnap || currentQuoteSnapshot();
    if (!snap) {
      toast({ icon: '⚠', body: 'No quote to book', sub: 'Calculate or pick a saved quote first.', timeout: 3000 });
      return;
    }
    var contact = Store.contact();
    var today = new Date();
    var minDate = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');

    var html =
      '<div class="bhd-booking-summary">' +
        '<div><span class="bhd-label">Service</span><strong>' + esc(snap.jobLabel) + '</strong></div>' +
        '<div><span class="bhd-label">Estimate</span><strong>' + esc(snap.total) + '</strong></div>' +
        '<div class="bhd-meta">' + esc(snap.id) +
          (snap.address ? ' · ' + esc(snap.address) : '') + '</div>' +
      '</div>' +
      '<form id="bhdBookingForm" class="bhd-form" novalidate>' +
        '<div class="bhd-grid2">' +
          '<label class="field-label">Preferred date' +
            '<input type="date" id="bkDate" min="' + minDate + '" required>' +
          '</label>' +
          '<label class="field-label">Preferred time' +
            '<input type="time" id="bkTime" required>' +
          '</label>' +
        '</div>' +
        '<label class="field-label">Your name' +
          '<input type="text" id="bkName" autocomplete="name" required value="' + esc(contact.name || '') + '">' +
        '</label>' +
        '<label class="field-label">Mobile' +
          '<input type="tel" id="bkPhone" autocomplete="tel" inputmode="tel" required value="' + esc(contact.phone || '') + '">' +
        '</label>' +
        '<label class="field-label">Email <span class="bhd-optional">(optional)</span>' +
          '<input type="email" id="bkEmail" autocomplete="email" value="' + esc(contact.email || '') + '">' +
        '</label>' +
        '<label class="field-label">Address / access notes' +
          '<textarea id="bkAddress" rows="2" placeholder="Address, parking, gate codes…">' + esc(snap.address || '') + '</textarea>' +
        '</label>' +
        '<label class="field-label">Anything else?' +
          '<textarea id="bkNotes" rows="2" placeholder="Special requirements, contact preferences…">' + esc(snap.notes || '') + '</textarea>' +
        '</label>' +
        '<div class="bhd-form-msg" id="bkErr" hidden></div>' +
        '<div class="bhd-form-actions">' +
          '<button type="submit" class="btn btn-primary">📅 Confirm booking request</button>' +
          '<button type="button" class="btn btn-ghost" data-bhd-close>Cancel</button>' +
        '</div>' +
        '<p class="hint" style="margin-top:10px">Ben will confirm the slot on WhatsApp. You\'ll also be offered a calendar (.ics) download.</p>' +
      '</form>';

    modal.open('Book this job', html);
    var form = $('bhdBookingForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitBooking(snap);
    });
  }

  function submitBooking(snap) {
    var date  = ($('bkDate')  && $('bkDate').value)  || '';
    var time  = ($('bkTime')  && $('bkTime').value)  || '';
    var name  = ($('bkName')  && $('bkName').value.trim())  || '';
    var phone = ($('bkPhone') && $('bkPhone').value.trim()) || '';
    var email = ($('bkEmail') && $('bkEmail').value.trim()) || '';
    var address = ($('bkAddress') && $('bkAddress').value.trim()) || '';
    var notes = ($('bkNotes') && $('bkNotes').value.trim()) || '';
    var err = $('bkErr');

    function fail(msg) { if (err) { err.textContent = msg; err.removeAttribute('hidden'); } }

    if (!date || !time)  return fail('Please pick a date and time.');
    if (!name)           return fail('Please enter your name.');
    if (!phone)          return fail('Please enter a mobile number Ben can reach you on.');
    var when = new Date(date + 'T' + time);
    if (isNaN(when.getTime())) return fail('That date/time looks off.');
    if (when.getTime() < Date.now() - 60 * 1000) return fail('Please pick a time in the future.');

    Store.saveContact({ name: name, phone: phone, email: email });

    // Make sure the underlying quote is also saved so the booking has a record to link to.
    Store.saveQuote(snap);

    var booking = {
      id: newBookingId(),
      createdAt: new Date().toISOString(),
      quoteId: snap.id,
      jobType: snap.jobType,
      jobLabel: snap.jobLabel,
      total: snap.total,
      whenISO: when.toISOString(),
      date: date,
      time: time,
      name: name,
      phone: phone,
      email: email,
      address: address,
      notes: notes,
      status: 'pending'
    };
    Store.saveBooking(booking);
    refreshCounts();

    var msg = buildBookingMessage(booking, snap);
    var num = (window.BHD && window.BHD.whatsappNumber) || '';
    if (num) {
      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank');
    }

    modal.close();
    toast({
      icon: '✅', body: 'Booking request sent',
      sub: snap.jobLabel + ' · ' + date + ' ' + time,
      actions: [
        { label: 'Add to calendar', onClick: function () { downloadIcs(booking, snap); } },
        { label: 'My bookings', ghost: true, onClick: openBookingsModal }
      ],
      timeout: 8000
    });
  }

  function buildBookingMessage(b, snap) {
    var benLink = buildBenLink(Object.assign({}, b, {
      breakdown: (snap && snap.breakdown) || b.breakdown || []
    }));
    var lines = [
      "Hey Ben — booking request via the app",
      "Booking ref: " + b.id,
      "Quote ref: " + b.quoteId,
      "Service: " + (b.jobLabel || b.jobType || 'N/A'),
      "When: " + b.date + " at " + b.time,
      "Name: " + b.name,
      "Mobile: " + displayPhone(b.phone),
      b.email ? "Email: " + b.email : '',
      b.address ? "Address / access: " + b.address : '',
      b.notes ? "Notes: " + b.notes : '',
      "",
      "Estimate: " + (b.total || ''),
      (snap && snap.breakdown && snap.breakdown.length
        ? "Breakdown:\n- " + snap.breakdown.join("\n- ")
        : ''),
      "",
      "👉 Tap to review & respond in the app:",
      benLink
    ];
    return lines.filter(function (l) { return l !== ''; }).join('\n');
  }

  /* ── .ics calendar file ──────────────────────────────────────── */
  function pad(n) { return String(n).padStart(2, '0'); }
  function icsStamp(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate())
      + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function icsEscape(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }
  function downloadIcs(b, snap) {
    var start = new Date(b.whenISO);
    var end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2hr default
    var summary = "Ben's Humpin' & Dumpin' — " + (b.jobLabel || 'Booking');
    var description = [
      'Booking ref: ' + b.id,
      'Quote ref: ' + b.quoteId,
      'Estimate: ' + (b.total || ''),
      b.notes ? 'Notes: ' + b.notes : '',
      '',
      'Ben will confirm on WhatsApp.'
    ].filter(Boolean).join('\n');
    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bens Humpin and Dumpin//Booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + b.id + '@humpinanddumpin',
      'DTSTAMP:' + icsStamp(new Date()),
      'DTSTART:' + icsStamp(start),
      'DTEND:' + icsStamp(end),
      'SUMMARY:' + icsEscape(summary),
      'DESCRIPTION:' + icsEscape(description),
      b.address ? 'LOCATION:' + icsEscape(b.address) : '',
      'STATUS:TENTATIVE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'humpin-dumpin-' + b.id + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ── Ben-side: review an inbound booking deeplink ────────────── */
  function openBenReview(p) {
    // Persist the inbound booking on Ben's device.
    var existing = Store.adminBookings().filter(function (x) { return x.id === p.id; })[0] || {};
    var rec = Object.assign({
      receivedAt: new Date().toISOString(),
      status: 'pending'
    }, existing, {
      id: p.id,
      whenISO: p.dt,
      jobLabel: p.svc,
      total: p.est,
      name: p.n,
      phone: p.ph,
      email: p.em,
      address: p.a,
      notes: p.nt,
      quoteId: p.qid,
      breakdown: p.bd || []
    });
    Store.saveAdminBooking(rec);
    refreshCounts();
    renderBenReview(rec);
  }
  function renderBenReview(b) {
    var when = new Date(b.whenISO);
    var whenStr = isNaN(when.getTime()) ? '(unknown)' : fmtDate(b.whenISO);
    var html =
      '<div class="bhd-booking-summary">' +
        '<div><span class="bhd-label">Service</span><strong>' + esc(b.jobLabel || '') + '</strong></div>' +
        '<div><span class="bhd-label">Estimate</span><strong>' + esc(b.total || '') + '</strong></div>' +
        '<div><span class="bhd-label">Requested</span><strong>' + esc(whenStr) + '</strong></div>' +
        '<div class="bhd-meta">' + esc(b.id) + ' · quote ' + esc(b.quoteId || '') + '</div>' +
      '</div>' +
      '<div class="bhd-card" style="margin-bottom:14px">' +
        '<div class="bhd-card-head"><strong>' + esc(b.name || '') + '</strong>' +
          '<span class="bhd-meta">' + esc(displayPhone(b.phone)) + '</span></div>' +
        (b.email   ? '<div class="bhd-meta">' + esc(b.email) + '</div>' : '') +
        (b.address ? '<div class="bhd-meta">📍 ' + esc(b.address) + '</div>' : '') +
        (b.notes   ? '<div class="bhd-meta">📝 ' + esc(b.notes) + '</div>' : '') +
        (b.breakdown && b.breakdown.length
          ? '<details class="bhd-card-details"><summary>Breakdown</summary><ul>' +
            b.breakdown.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') +
            '</ul></details>'
          : '') +
      '</div>' +
      '<p class="hint" style="margin-bottom:8px">Pick one — the customer\'s app will update when they tap the link you send back.</p>' +
      '<div class="bhd-form-actions">' +
        '<button class="btn btn-whatsapp" type="button" id="benAccept">✅ Accept</button>' +
        '<button class="btn btn-ghost"    type="button" id="benDecline">❌ Decline</button>' +
        '<button class="btn btn-primary"  type="button" id="benSuggest">🕐 Suggest new time</button>' +
        '<button class="btn btn-primary"  type="button" id="benRevise">✏️ Revise job &amp; price</button>' +
      '</div>';
    modal.open('Booking request from ' + (b.name || 'customer'), html);
    var body = $('bhdModalBody');
    if (!body) return;
    body.querySelector('#benAccept').addEventListener('click', function () { benAccept(b); });
    body.querySelector('#benDecline').addEventListener('click', function () { benDecline(b); });
    body.querySelector('#benSuggest').addEventListener('click', function () { benSuggest(b); });
    body.querySelector('#benRevise').addEventListener('click', function () { benRevise(b); });
  }
  function benAccept(b) {
    Store.updateAdminBooking(b.id, { status: 'confirmed', decidedAt: new Date().toISOString() });
    var link = buildCustLink('confirm', b.id, { dt: b.whenISO }, b);
    var msg = "✅ Confirmed! " + (b.name ? 'Hi ' + b.name + ', ' : '') +
      "see you " + fmtDate(b.whenISO) + " for " + (b.jobLabel || 'the job') + "." +
      "\nBooking ref: " + b.id +
      "\n\n👉 Tap to confirm in your app:\n" + link;
    waOpen(b.phone, msg);
    downloadIcs({
      id: b.id, whenISO: b.whenISO, jobLabel: b.jobLabel,
      address: b.address, notes: b.notes, total: b.total, quoteId: b.quoteId
    }, { breakdown: b.breakdown });
    modal.close();
    toast({ icon: '✅', body: 'Accepted', sub: 'Reply opened in WhatsApp · calendar saved', timeout: 4000 });
  }
  function benDecline(b) {
    Store.updateAdminBooking(b.id, { status: 'declined', decidedAt: new Date().toISOString() });
    var link = buildCustLink('decline', b.id, null, b);
    var msg = "❌ Sorry " + (b.name || '') + ", I can't make " + fmtDate(b.whenISO) +
      ". Happy to discuss alternatives." +
      "\nBooking ref: " + b.id +
      "\n\n👉 Tap to update your app:\n" + link;
    waOpen(b.phone, msg);
    modal.close();
    toast({ icon: '❌', body: 'Declined', sub: 'Reply opened in WhatsApp', timeout: 4000 });
  }
  function benSuggest(b) {
    var when = new Date(b.whenISO);
    var defDate = isNaN(when.getTime()) ? '' :
      when.getFullYear() + '-' + pad(when.getMonth() + 1) + '-' + pad(when.getDate());
    var defTime = isNaN(when.getTime()) ? '' : pad(when.getHours()) + ':' + pad(when.getMinutes());
    var html =
      '<p class="hint" style="margin-bottom:10px">Customer asked for ' +
        esc(fmtDate(b.whenISO)) + '. Propose an alternative:</p>' +
      '<form id="bhdSuggestForm" class="bhd-form" novalidate>' +
        '<div class="bhd-grid2">' +
          '<label class="field-label">New date<input type="date" id="sgDate" required value="' + esc(defDate) + '"></label>' +
          '<label class="field-label">New time<input type="time" id="sgTime" required value="' + esc(defTime) + '"></label>' +
        '</div>' +
        '<label class="field-label">Note for customer <span class="bhd-optional">(optional)</span>' +
          '<textarea id="sgNote" rows="2" placeholder="e.g. Already booked that morning — could we do later?"></textarea>' +
        '</label>' +
        '<div class="bhd-form-msg" id="sgErr" hidden></div>' +
        '<div class="bhd-form-actions">' +
          '<button type="submit" class="btn btn-primary">Send suggestion</button>' +
          '<button type="button" class="btn btn-ghost" id="sgBack">Back</button>' +
        '</div>' +
      '</form>';
    modal.open('Suggest a different time', html);
    var body = $('bhdModalBody');
    body.querySelector('#sgBack').addEventListener('click', function () { renderBenReview(b); });
    body.querySelector('#bhdSuggestForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var d = $('sgDate').value, t = $('sgTime').value, note = $('sgNote').value.trim();
      var err = $('sgErr');
      if (!d || !t) { err.textContent = 'Pick a date and time.'; err.removeAttribute('hidden'); return; }
      var newWhen = new Date(d + 'T' + t);
      if (isNaN(newWhen.getTime())) { err.textContent = 'That date/time looks off.'; err.removeAttribute('hidden'); return; }
      Store.updateAdminBooking(b.id, {
        status: 'suggested',
        suggestedISO: newWhen.toISOString(),
        suggestedNote: note,
        decidedAt: new Date().toISOString()
      });
      var link = buildCustLink('suggest', b.id, { dt: newWhen.toISOString(), note: note }, b);
      var msg = "🕐 " + (b.name ? 'Hi ' + b.name + ', ' : '') +
        "could we do " + fmtDate(newWhen.toISOString()) + " instead of " + fmtDate(b.whenISO) + "?" +
        (note ? "\n" + note : '') +
        "\nBooking ref: " + b.id +
        "\n\n👉 Accept or decline in your app:\n" + link;
      waOpen(b.phone, msg);
      modal.close();
      toast({ icon: '🕐', body: 'Suggestion sent', sub: 'Awaiting customer response', timeout: 4000 });
    });
  }

  function benRevise(b) {
    var currentType = b.jobType || '';
    var currentTotal = ((b.total || '').match(/[\d.]+/) || [''])[0];
    var typeOptions = Object.keys(JOB_LABELS).map(function (k) {
      return '<option value="' + esc(k) + '"' + (k === currentType ? ' selected' : '') + '>' + esc(JOB_LABELS[k]) + '</option>';
    }).join('');
    var html =
      '<p class="hint" style="margin-bottom:10px">Customer booked: <strong>' +
        esc(b.jobLabel || b.jobType || '') + '</strong>' +
        (b.total ? ' at <strong>' + esc(b.total) + '</strong>' : '') +
        '. Correct the service or price below — the customer accepts or declines on WhatsApp.</p>' +
      '<form id="bhdReviseForm" class="bhd-form" novalidate>' +
        '<label class="field-label">New service' +
          '<select id="rvType" required>' + typeOptions + '</select>' +
        '</label>' +
        '<label class="field-label">New total (&pound;)' +
          '<input type="number" id="rvTotal" min="0" step="1" required value="' + esc(currentTotal) + '">' +
        '</label>' +
        '<label class="field-label">Note for customer <span class="bhd-optional">(optional)</span>' +
          '<textarea id="rvNote" rows="2" placeholder="e.g. This looks like a full house move, not a tip run — price reflects the bigger van and time on the job."></textarea>' +
        '</label>' +
        '<div class="bhd-form-msg" id="rvErr" hidden></div>' +
        '<div class="bhd-form-actions">' +
          '<button type="submit" class="btn btn-primary">Send revision</button>' +
          '<button type="button" class="btn btn-ghost" id="rvBack">Back</button>' +
        '</div>' +
      '</form>';
    modal.open('Revise job & price', html);
    var body = $('bhdModalBody');
    if (!body) return;
    body.querySelector('#rvBack').addEventListener('click', function () { renderBenReview(b); });
    body.querySelector('#bhdReviseForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var jt = $('rvType').value;
      var totalN = parseInt($('rvTotal').value, 10);
      var note = $('rvNote').value.trim();
      var err = $('rvErr');
      function fail(m) { err.textContent = m; err.removeAttribute('hidden'); }
      if (!jt || !JOB_LABELS[jt]) return fail('Pick a service.');
      if (!(totalN > 0)) return fail('Enter a price greater than zero.');
      var newLabel = JOB_LABELS[jt];
      var newTotal = '£' + totalN;
      Store.updateAdminBooking(b.id, {
        status: 'revised',
        revisedJobLabel: newLabel,
        revisedJobType: jt,
        revisedTotal: newTotal,
        revisedNote: note,
        decidedAt: new Date().toISOString()
      });
      var link = buildCustLink('revise', b.id, {
        note: note, newLabel: newLabel, newJobType: jt, newTotal: newTotal
      }, b);
      var msg = "✏️ " + (b.name ? 'Hi ' + b.name + ', ' : '') +
        "I've revised booking " + b.id + ":" +
        "\n• Service: " + newLabel +
        "\n• Price: " + newTotal +
        (note ? "\n• Note: " + note : '') +
        "\n\n👉 Accept or decline in your app:\n" + link;
      waOpen(b.phone, msg);
      modal.close();
      toast({ icon: '✏️', body: 'Revision sent', sub: 'Awaiting customer response', timeout: 4500 });
    });
  }

  /* ── Customer-side: apply Ben's response ─────────────────────── */
  function isStandalone() {
    try {
      return !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches)
        || !!window.navigator.standalone;
    } catch (e) { return false; }
  }
  function reconstructBookingFrom(p) {
    // Build a minimal booking from a self-contained Ben→customer link
    // when this device's localStorage doesn't have the original record
    // (iOS sandboxes Safari vs. installed-PWA storage).
    if (!p.svc) return null;
    var when = p.dt || '';
    return {
      id: p.id,
      createdAt: new Date().toISOString(),
      reconstructed: true,
      jobType: '',
      jobLabel: p.svc,
      total: p.est || '',
      name: p.n || '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      quoteId: p.qid || '',
      whenISO: when,
      date: when ? when.slice(0, 10) : '',
      time: when ? when.slice(11, 16) : '',
      status: 'pending'
    };
  }

  // Shown when a customer deeplink opens in the browser rather than the
  // installed PWA (iOS always sandboxes the two; their localStorage is
  // separate). We show a full-panel UI with an "Open in the App" button
  // that carries the same ?bhd= token — on Android this re-opens inside
  // the installed PWA; on iOS it at least shows a clear status and points
  // the customer to the home screen icon.
  function showCrossContextPanel(statusIcon, statusTitle, statusSub, openUrl, extraBtns) {
    var extraHtml = (extraBtns || []).map(function (b) {
      return '<button type="button" class="btn ' + (b.ghost ? 'btn-ghost' : 'btn-whatsapp') +
             ' btn-sm" style="display:block;width:100%;box-sizing:border-box;margin-top:8px" data-xid="' +
             esc(b.id) + '">' + b.label + '</button>';
    }).join('');
    var html =
      '<div style="text-align:center;padding:16px 0">' +
        '<div style="font-size:3rem;line-height:1;margin-bottom:12px">' + statusIcon + '</div>' +
        '<div style="font-size:1.2rem;font-weight:700;margin-bottom:6px">' + esc(statusTitle) + '</div>' +
        '<div style="color:var(--clr-muted,#666);font-size:0.95rem;margin-bottom:20px">' + esc(statusSub) + '</div>' +
        '<div style="background:var(--clr-surface,#f5f5f5);border-radius:10px;padding:12px 14px;' +
             'margin-bottom:16px;font-size:0.85rem;color:var(--clr-text-mute,#555);text-align:left">' +
          '⚠️ This link opened in your browser, not the app — so the update ' +
          'won\'t show in the installed app automatically.<br><br>' +
          'Tap <strong>Open in App</strong> below, or open <strong>Ben\'s H&D</strong> from ' +
          'your home screen and tap <strong>My Bookings</strong>.' +
        '</div>' +
        '<a href="' + esc(openUrl) + '" class="btn btn-primary" ' +
           'style="display:block;text-align:center;text-decoration:none;margin-bottom:8px">' +
          '📱 Open in the App &rarr;' +
        '</a>' +
        extraHtml +
      '</div>';
    modal.open('Booking Update', html);
    var body = $('bhdModalBody');
    if (!body) return;
    body.querySelectorAll('[data-xid]').forEach(function (btn) {
      var xid = btn.getAttribute('data-xid');
      var match = (extraBtns || []).filter(function (b) { return b.id === xid; })[0];
      if (match && match.onClick) btn.addEventListener('click', match.onClick);
    });
  }

  // raw = the original base64 token from the URL, kept so we can rebuild
  // the ?bhd= link for the "Open in App" button without double-decoding.
  function applyCustomerAction(p, raw) {
    var booking = Store.bookings().filter(function (x) { return x.id === p.id; })[0];
    if (!booking) {
      booking = reconstructBookingFrom(p);
      if (!booking) {
        toast({
          icon: '⚠', body: 'Unknown booking',
          sub: 'This link is for a booking that isn\'t on this device. Open the original device, or message Ben.',
          timeout: 6000
        });
        return;
      }
      Store.saveBooking(booking);
    }

    // Apply the status update to this browsing context's localStorage first,
    // regardless of whether we're in the PWA or the browser. That way "My
    // Bookings" shows the right state wherever this page is open.
    if (p.act === 'confirm') {
      Store.updateBooking(p.id, { status: 'confirmed', confirmedAt: new Date().toISOString() });
    } else if (p.act === 'decline') {
      Store.updateBooking(p.id, { status: 'declined', decidedAt: new Date().toISOString() });
    } else if (p.act === 'suggest') {
      Store.updateBooking(p.id, {
        status: 'suggested',
        suggestedISO: p.dt,
        suggestedNote: p.nt || '',
        decidedAt: new Date().toISOString()
      });
    } else if (p.act === 'revise') {
      Store.updateBooking(p.id, {
        status: 'revised',
        revisedJobLabel: p.svc || '',
        revisedJobType: p.jt || '',
        revisedTotal: p.est || '',
        revisedNote: p.nt || '',
        decidedAt: new Date().toISOString()
      });
    }
    refreshCounts();

    var b1 = Store.bookings().filter(function (x) { return x.id === p.id; })[0] || booking;

    // Cross-context: link opened in browser, not the installed PWA.
    // Show a prominent panel instead of a toast, and offer an "Open in App"
    // button that carries the original ?bhd= token so the PWA can process it.
    if (!isStandalone() && raw) {
      var openUrl = appUrl() + '?bhd=' + raw;
      if (p.act === 'confirm') {
        showCrossContextPanel(
          '✅', 'Booking Confirmed!',
          (b1.jobLabel || '') + (b1.date ? ' · ' + b1.date + ' at ' + b1.time : ''),
          openUrl,
          [{ id: 'ics', label: '📅 Add to Calendar', ghost: true,
             onClick: function () { downloadIcs(b1, null); } }]
        );
      } else if (p.act === 'decline') {
        var benNum = (window.BHD && window.BHD.whatsappNumber) || '';
        showCrossContextPanel(
          '❌', 'Booking Declined by Ben',
          'Ben can\'t make the original time. Message him to find an alternative.',
          openUrl,
          [{ id: 'msg', label: '💬 Message Ben', ghost: false,
             onClick: function () {
               waOpen(benNum, 'Hi Ben, about booking ' + p.id + ' — when could you fit it in?');
             }}]
        );
      } else if (p.act === 'suggest') {
        showCrossContextPanel(
          '🕐', 'Ben Suggested a New Time',
          fmtDate(p.dt) + (p.nt ? ' — ' + p.nt : ''),
          openUrl,
          []
        );
      } else if (p.act === 'revise') {
        showCrossContextPanel(
          '✏️', 'Ben Revised Your Booking',
          (p.svc || '') + (p.est ? ' · ' + p.est : '') + (p.nt ? ' — ' + p.nt : ''),
          openUrl,
          []
        );
      }
      return;
    }

    // Standalone PWA — normal toast flow.
    if (p.act === 'confirm') {
      toast({
        icon: '✅', body: 'Booking confirmed',
        sub: b1.jobLabel + ' · ' + b1.date + ' ' + b1.time,
        actions: [
          { label: 'Add to calendar', onClick: function () { downloadIcs(b1, null); } },
          { label: 'My bookings', ghost: true, onClick: openBookingsModal }
        ],
        timeout: 9000
      });
    } else if (p.act === 'decline') {
      toast({
        icon: '❌', body: 'Booking declined by Ben',
        sub: 'Tap to message him about an alternative',
        actions: [
          { label: 'Message Ben', onClick: function () {
              var num = (window.BHD && window.BHD.whatsappNumber) || '';
              waOpen(num, "Hi Ben, about booking " + p.id + " — when could you fit it in?");
            } },
          { label: 'My bookings', ghost: true, onClick: openBookingsModal }
        ],
        timeout: 9000
      });
    } else if (p.act === 'revise') {
      toast({
        icon: '✏️', body: 'Ben revised your booking',
        sub: (p.svc || '') + (p.est ? ' · ' + p.est : '') + (p.nt ? ' — ' + p.nt : ''),
        actions: [
          { label: 'Respond', onClick: openBookingsModal }
        ],
        timeout: 9000
      });
    } else if (p.act === 'suggest') {
      toast({
        icon: '🕐', body: 'Ben suggested a different time',
        sub: fmtDate(p.dt) + (p.nt ? ' — ' + p.nt : ''),
        actions: [
          { label: 'Respond', onClick: openBookingsModal }
        ],
        timeout: 0
      });
    }
  }
  function applyBenSecondAction(p) {
    var b = Store.adminBookings().filter(function (x) { return x.id === p.id; })[0];
    if (!b) {
      toast({ icon: '⚠', body: 'Unknown booking', sub: 'Not in your admin list on this device.', timeout: 5000 });
      return;
    }
    if (p.act === 'accept-suggest') {
      Store.updateAdminBooking(p.id, {
        status: 'confirmed',
        whenISO: p.dt || b.suggestedISO || b.whenISO,
        decidedAt: new Date().toISOString()
      });
      var b2 = Store.adminBookings().filter(function (x) { return x.id === p.id; })[0];
      toast({
        icon: '✅', body: (b.name || 'Customer') + ' accepted the new time',
        sub: fmtDate(b2.whenISO),
        actions: [{ label: 'Add to calendar', onClick: function () {
          downloadIcs({
            id: b2.id, whenISO: b2.whenISO, jobLabel: b2.jobLabel,
            address: b2.address, notes: b2.notes, total: b2.total, quoteId: b2.quoteId
          }, { breakdown: b2.breakdown });
        } }],
        timeout: 9000
      });
    } else if (p.act === 'reject-suggest') {
      Store.updateAdminBooking(p.id, { status: 'declined', decidedAt: new Date().toISOString() });
      toast({ icon: '❌', body: (b.name || 'Customer') + ' declined the new time', timeout: 6000 });
    } else if (p.act === 'accept-revise') {
      Store.updateAdminBooking(p.id, {
        status: 'confirmed',
        jobLabel: b.revisedJobLabel || b.jobLabel,
        jobType:  b.revisedJobType  || b.jobType,
        total:    b.revisedTotal    || b.total,
        decidedAt: new Date().toISOString()
      });
      var b3 = Store.adminBookings().filter(function (x) { return x.id === p.id; })[0];
      toast({
        icon: '✅', body: (b.name || 'Customer') + ' accepted the revision',
        sub: (b3.jobLabel || '') + (b3.total ? ' · ' + b3.total : ''),
        timeout: 7000
      });
    } else if (p.act === 'reject-revise') {
      Store.updateAdminBooking(p.id, { status: 'declined', decidedAt: new Date().toISOString() });
      toast({ icon: '❌', body: (b.name || 'Customer') + ' declined the revision', timeout: 6000 });
    }
  }
  function handleDeeplink() {
    var sp;
    try { sp = new URLSearchParams(location.search); } catch (e) { return; }
    var raw = sp.get('bhd');
    if (!raw) return;
    var p = decodePayload(raw);
    // Strip the param so refreshes don't re-fire.
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    if (!p || !p.k) return;
    if (p.k === 'ben')  setTimeout(function () { openBenReview(p); }, 200);
    else if (p.k === 'cust') setTimeout(function () { applyCustomerAction(p, raw); }, 200);
    else if (p.k === 'ben2') setTimeout(function () { applyBenSecondAction(p); }, 200);
  }

  /* ── customer responds to a 'suggested' booking ──────────────── */
  function customerAcceptSuggestion(b) {
    if (!b.suggestedISO) return;
    Store.updateBooking(b.id, {
      status: 'confirmed',
      whenISO: b.suggestedISO,
      date: b.suggestedISO.slice(0, 10),
      time: b.suggestedISO.slice(11, 16),
      confirmedAt: new Date().toISOString()
    });
    refreshCounts();
    var link = buildBenReplyLink('accept-suggest', b.id, { dt: b.suggestedISO });
    var num = (window.BHD && window.BHD.whatsappNumber) || '';
    var msg = "✅ Accepting your new time for booking " + b.id + ": " +
      fmtDate(b.suggestedISO) + ".\n\n👉 Update your app:\n" + link;
    waOpen(num, msg);
    var refreshed = Store.bookings().filter(function (x) { return x.id === b.id; })[0];
    downloadIcs(refreshed, null);
    modal.close();
    toast({ icon: '✅', body: 'New time accepted', sub: 'Reply opened in WhatsApp · calendar saved', timeout: 5000 });
  }
  function customerRejectSuggestion(b) {
    Store.updateBooking(b.id, { status: 'declined', decidedAt: new Date().toISOString() });
    refreshCounts();
    var link = buildBenReplyLink('reject-suggest', b.id);
    var num = (window.BHD && window.BHD.whatsappNumber) || '';
    var msg = "❌ Sorry, that time doesn't work for booking " + b.id + ".\n\n👉 Update your app:\n" + link;
    waOpen(num, msg);
    modal.close();
    toast({ icon: '❌', body: 'Suggestion declined', sub: 'Reply opened in WhatsApp', timeout: 5000 });
  }
  function customerAcceptRevision(b) {
    Store.updateBooking(b.id, {
      status: 'confirmed',
      jobLabel: b.revisedJobLabel || b.jobLabel,
      jobType:  b.revisedJobType  || b.jobType,
      total:    b.revisedTotal    || b.total,
      confirmedAt: new Date().toISOString()
    });
    refreshCounts();
    var link = buildBenReplyLink('accept-revise', b.id);
    var num = (window.BHD && window.BHD.whatsappNumber) || '';
    var msg = "✅ Accepting your revision for booking " + b.id + ": " +
      (b.revisedJobLabel || '') + (b.revisedTotal ? ' at ' + b.revisedTotal : '') +
      ".\n\n👉 Update your app:\n" + link;
    waOpen(num, msg);
    modal.close();
    toast({ icon: '✅', body: 'Revision accepted', sub: 'Reply opened in WhatsApp', timeout: 5000 });
  }
  function customerRejectRevision(b) {
    Store.updateBooking(b.id, { status: 'declined', decidedAt: new Date().toISOString() });
    refreshCounts();
    var link = buildBenReplyLink('reject-revise', b.id);
    var num = (window.BHD && window.BHD.whatsappNumber) || '';
    var msg = "❌ Sorry, the revised job/price for booking " + b.id + " doesn't work for me.\n\n👉 Update your app:\n" + link;
    waOpen(num, msg);
    modal.close();
    toast({ icon: '❌', body: 'Revision declined', sub: 'Reply opened in WhatsApp', timeout: 5000 });
  }

  /* ── bookings list modal ─────────────────────────────────────── */
  function openBookingsModal() {
    var list = Store.bookings();
    var html;
    if (!list.length) {
      html = '<div class="bhd-empty-state">' +
        '<span class="bhd-empty-icon">📅</span>' +
        '<div class="bhd-empty-title">No bookings yet</div>' +
        '<div class="bhd-empty-sub">Get a quote, then tap <strong>Book</strong><br>to request a slot with Ben.</div>' +
        '<button class="bhd-empty-cta" type="button" data-bhd-close>Get a quote →</button>' +
        '</div>';
    } else {
      html =
        '<ul class="bhd-list">' +
        list.map(function (b) {
          var statusClass = 'bhd-status bhd-status-' + (b.status || 'pending');
          var suggestedBanner = (b.status === 'suggested' && b.suggestedISO)
            ? '<div class="bhd-suggest-banner">' +
                '<div class="bhd-meta"><strong>Ben suggested:</strong> ' + esc(fmtDate(b.suggestedISO)) +
                  (b.suggestedNote ? ' — ' + esc(b.suggestedNote) : '') + '</div>' +
                '<div class="bhd-card-actions">' +
                  '<button class="btn btn-whatsapp btn-sm" type="button" data-act="acceptSuggest">✅ Accept new time</button>' +
                  '<button class="btn btn-ghost btn-sm" type="button" data-act="rejectSuggest">❌ Decline</button>' +
                '</div>' +
              '</div>'
            : '';
          var revisedBanner = (b.status === 'revised')
            ? '<div class="bhd-suggest-banner">' +
                '<div class="bhd-meta"><strong>Ben revised this:</strong> ' +
                  esc(b.revisedJobLabel || '') +
                  (b.revisedTotal ? ' · ' + esc(b.revisedTotal) : '') +
                  (b.revisedNote ? ' — ' + esc(b.revisedNote) : '') +
                '</div>' +
                '<div class="bhd-card-actions">' +
                  '<button class="btn btn-whatsapp btn-sm" type="button" data-act="acceptRevise">✅ Accept</button>' +
                  '<button class="btn btn-ghost btn-sm" type="button" data-act="rejectRevise">❌ Decline</button>' +
                '</div>' +
              '</div>'
            : '';
          var canIcs = b.status === 'confirmed' || b.status === 'pending';
          return '<li class="bhd-card" data-id="' + esc(b.id) + '">' +
            '<div class="bhd-card-head">' +
              '<strong>' + esc(b.jobLabel || b.jobType || 'Booking') + '</strong>' +
              '<span class="' + statusClass + '">' + esc(b.status || 'pending') + '</span>' +
            '</div>' +
            '<div class="bhd-meta">' +
              '📅 ' + esc(b.date) + ' at ' + esc(b.time) +
            '</div>' +
            '<div class="bhd-meta">' +
              esc(b.id) + ' · ' + esc(b.name) + ' · ' + esc(displayPhone(b.phone)) +
              (b.address ? ' · ' + esc(b.address) : '') +
            '</div>' +
            (b.total ? '<div class="bhd-meta"><strong>' + esc(b.total) + '</strong></div>' : '') +
            suggestedBanner +
            revisedBanner +
            '<div class="bhd-card-actions">' +
              '<button class="btn btn-whatsapp btn-sm" type="button" data-act="wa">💬 Resend to Ben</button>' +
              (canIcs ? '<button class="btn btn-ghost btn-sm" type="button" data-act="ics">📅 Calendar</button>' : '') +
              '<button class="btn btn-ghost btn-sm" type="button" data-act="del">Cancel</button>' +
            '</div>' +
          '</li>';
        }).join('') +
        '</ul>';
    }
    modal.open('My bookings', html);
    var body = $('bhdModalBody');
    if (!body) return;
    body.querySelectorAll('.bhd-card').forEach(function (card) {
      var id = card.getAttribute('data-id');
      card.querySelectorAll('[data-act]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var act = btn.getAttribute('data-act');
          var b = Store.bookings().filter(function (x) { return x.id === id; })[0];
          if (!b) return;
          if (act === 'del') {
            if (!confirm('Cancel this booking? It only removes it from your device — message Ben if he\'s already confirmed.')) return;
            Store.deleteBooking(id);
            refreshCounts();
            openBookingsModal();
          } else if (act === 'wa') {
            var snap = Store.quotes().filter(function (x) { return x.id === b.quoteId; })[0];
            var num = (window.BHD && window.BHD.whatsappNumber) || '';
            var msg = buildBookingMessage(b, snap);
            waOpen(num, msg);
          } else if (act === 'ics') {
            var snap2 = Store.quotes().filter(function (x) { return x.id === b.quoteId; })[0];
            downloadIcs(b, snap2);
          } else if (act === 'acceptSuggest') {
            customerAcceptSuggestion(b);
          } else if (act === 'rejectSuggest') {
            if (!confirm('Decline Ben\'s suggested time? He\'ll be notified.')) return;
            customerRejectSuggestion(b);
          } else if (act === 'acceptRevise') {
            customerAcceptRevision(b);
          } else if (act === 'rejectRevise') {
            if (!confirm('Decline Ben\'s revised job/price? He\'ll be notified.')) return;
            customerRejectRevision(b);
          }
        });
      });
    });
  }

  /* ── wire panel buttons ──────────────────────────────────────── */
  function safeWire(el, label, fn) {
    if (!el) { console.warn('[BHD] missing element:', label); return; }
    el.addEventListener('click', function (e) {
      try {
        console.info('[BHD] click:', label);
        fn(e);
      } catch (err) {
        console.error('[BHD] handler error for', label, err);
        alert('Sorry — something went wrong opening "' + label + '".\n\n' +
          (err && err.message ? err.message : err) +
          '\n\nPlease screenshot this and send to Ben.');
      }
    });
  }
  function wireButtons() {
    safeWire($('btnSaveQuote'),  'Save quote',  saveCurrentQuote);
    safeWire($('btnBookNow'),    'Book this job', function () {
      var snap = currentQuoteSnapshot();
      if (!snap) {
        var saved = Store.quotes();
        if (saved.length) {
          toast({
            icon: '📅', body: 'Pick a quote to book',
            sub: 'No live quote on screen — opening your saved quotes.',
            timeout: 4000
          });
          openQuotesModal();
        } else {
          toast({
            icon: '⚠', body: 'Calculate a quote first',
            sub: 'Pick a job, fill the details, then tap Calculate.',
            timeout: 5000
          });
        }
        return;
      }
      openBookingModal(snap);
    });
    safeWire($('btnMyQuotes'),   'Saved quotes',  openQuotesModal);
    safeWire($('btnMyBookings'), 'My bookings',   openBookingsModal);
    safeWire($('adminTrigger'),  'Admin', function () {
      if (adminUnlocked) openAdminDashboard();
      else openAdminPinModal();
    });
  }

  /* ── init ────────────────────────────────────────────────────── */
  function isEnabled() {
    var f = (window.BHD && window.BHD.features) || {};
    return f.quotesBookings !== false;
  }

  function hideFeatureUI() {
    ['btnSaveQuote', 'btnBookNow'].forEach(function (id) {
      var el = $(id); if (el) { el.setAttribute('hidden', ''); el.classList.add('hidden'); }
    });
    var row = document.querySelector('.my-stuff-row');
    if (row) { row.setAttribute('hidden', ''); row.classList.add('hidden'); }
  }

  function init() {
    try {
      console.info('[BHD] quotes-bookings init, enabled =', isEnabled(),
        'btnBookNow =', !!$('btnBookNow'),
        'btnSaveQuote =', !!$('btnSaveQuote'),
        'bhdModal =', !!$('bhdModal'));
      if (!isEnabled()) { hideFeatureUI(); return; }
      wireModalClose();
      wireButtons();
      refreshCounts();
      handleDeeplink();
    } catch (err) {
      console.error('[BHD] init failed:', err);
      alert('Booking module init error: ' + (err && err.message || err));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API for debugging / future hooks
  window.BHDBooking = { open: openBookingModal, list: openBookingsModal, _refreshCounts: refreshCounts };
  window.BHDQuotes = { save: saveCurrentQuote, list: openQuotesModal, send: sendQuotesToBen };
})();
