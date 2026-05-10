/* ════════════════════════════════════════════════════════════════
   quotes-bookings.js — Save / retrieve quotes + booking system.
   Loaded after main.js + enhance.js. Pure client-side (localStorage).
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var QUOTES_KEY   = 'bhd:quotes';
  var BOOKINGS_KEY = 'bhd:bookings';
  var CONTACT_KEY  = 'bhd:contact';
  var MAX_QUOTES   = 50;
  var MAX_BOOKINGS = 50;

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
    if (typeof window.bhdToast === 'function') return window.bhdToast(opts);
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
    },
    deleteQuote: function (id) {
      writeJSON(QUOTES_KEY, Store.quotes().filter(function (x) { return x.id !== id; }));
    },
    saveBooking: function (b) {
      var list = Store.bookings();
      list = list.filter(function (x) { return x.id !== b.id; });
      list.unshift(b);
      if (list.length > MAX_BOOKINGS) list = list.slice(0, MAX_BOOKINGS);
      writeJSON(BOOKINGS_KEY, list);
    },
    updateBooking: function (id, patch) {
      var list = Store.bookings();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { Object.assign(list[i], patch); break; }
      }
      writeJSON(BOOKINGS_KEY, list);
    },
    deleteBooking: function (id) {
      writeJSON(BOOKINGS_KEY, Store.bookings().filter(function (x) { return x.id !== id; }));
    },
    saveContact: function (c) { writeJSON(CONTACT_KEY, c); }
  };
  window.BHDStore = Store;

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
    var jobDesc = ($('jobDesc') && $('jobDesc').value) || '';
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
      notes: jobDesc
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
      html = '<p class="bhd-empty">No saved quotes yet. Calculate one and tap <strong>Save quote</strong>.</p>';
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
    var lines = [
      "Hey Ben — booking request via the app",
      "Booking ref: " + b.id,
      "Quote ref: " + b.quoteId,
      "Service: " + (b.jobLabel || b.jobType || 'N/A'),
      "When: " + b.date + " at " + b.time,
      "Name: " + b.name,
      "Mobile: " + b.phone,
      b.email ? "Email: " + b.email : '',
      b.address ? "Address / access: " + b.address : '',
      b.notes ? "Notes: " + b.notes : '',
      "",
      "Estimate: " + (b.total || ''),
      (snap && snap.breakdown && snap.breakdown.length
        ? "Breakdown:\n- " + snap.breakdown.join("\n- ")
        : ''),
      "",
      "Please confirm the slot when you can."
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

  /* ── bookings list modal ─────────────────────────────────────── */
  function openBookingsModal() {
    var list = Store.bookings();
    var html;
    if (!list.length) {
      html = '<p class="bhd-empty">No bookings yet. After calculating a quote, tap <strong>Book this job</strong>.</p>';
    } else {
      html =
        '<ul class="bhd-list">' +
        list.map(function (b) {
          var statusClass = 'bhd-status bhd-status-' + (b.status || 'pending');
          return '<li class="bhd-card" data-id="' + esc(b.id) + '">' +
            '<div class="bhd-card-head">' +
              '<strong>' + esc(b.jobLabel || b.jobType || 'Booking') + '</strong>' +
              '<span class="' + statusClass + '">' + esc(b.status || 'pending') + '</span>' +
            '</div>' +
            '<div class="bhd-meta">' +
              '📅 ' + esc(b.date) + ' at ' + esc(b.time) +
            '</div>' +
            '<div class="bhd-meta">' +
              esc(b.id) + ' · ' + esc(b.name) + ' · ' + esc(b.phone) +
              (b.address ? ' · ' + esc(b.address) : '') +
            '</div>' +
            (b.total ? '<div class="bhd-meta"><strong>' + esc(b.total) + '</strong></div>' : '') +
            '<div class="bhd-card-actions">' +
              '<button class="btn btn-whatsapp btn-sm" type="button" data-act="wa">💬 Resend to Ben</button>' +
              '<button class="btn btn-ghost btn-sm" type="button" data-act="ics">📅 Calendar</button>' +
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
            if (num) window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank');
          } else if (act === 'ics') {
            var snap2 = Store.quotes().filter(function (x) { return x.id === b.quoteId; })[0];
            downloadIcs(b, snap2);
          }
        });
      });
    });
  }

  /* ── wire panel buttons ──────────────────────────────────────── */
  function wireButtons() {
    var s = $('btnSaveQuote'); if (s) s.addEventListener('click', saveCurrentQuote);
    var b = $('btnBookNow');   if (b) b.addEventListener('click', function () { openBookingModal(null); });
    var q = $('btnMyQuotes');  if (q) q.addEventListener('click', openQuotesModal);
    var k = $('btnMyBookings'); if (k) k.addEventListener('click', openBookingsModal);
  }

  /* ── init ────────────────────────────────────────────────────── */
  function init() {
    wireModalClose();
    wireButtons();
    refreshCounts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API for debugging / future hooks
  window.BHDBooking = { open: openBookingModal, list: openBookingsModal };
  window.BHDQuotes = { save: saveCurrentQuote, list: openQuotesModal, send: sendQuotesToBen };
})();
