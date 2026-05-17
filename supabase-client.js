/* ═══════════════════════════════════════════════════════════════
   supabase-client.js — Supabase persistence layer for BHD app.
   Loaded before quotes-bookings.js. Exposes window.BHDdb.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://mkxtjrulkfbhqruhnbhj.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reHRqcnVsa2ZiaHFydWhuYmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjQxNjIsImV4cCI6MjA5NDYwMDE2Mn0.BWfg7tiNZROa47OEYaj4L0um7CXbgeMT7yegX_Bxsno';

  var QUOTES_KEY   = 'bhd:quotes';
  var BOOKINGS_KEY = 'bhd:bookings';

  if (!window.supabase || !window.supabase.createClient) {
    console.warn('[BHDdb] Supabase SDK not loaded — running localStorage-only');
    window.BHDdb = null;
    return;
  }

  var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false   // BHD handles its own ?bhd= params
    }
  });

  /* ── session readiness ────────────────────────────────────── */
  var _ready = false;
  var _readyCbs = [];
  function onReady(fn) {
    if (_ready) { setTimeout(fn, 0); } else { _readyCbs.push(fn); }
  }
  function _fireReady() {
    _ready = true;
    _readyCbs.forEach(function (f) { try { f(); } catch (e) { console.error('[BHDdb] onReady cb:', e); } });
    _readyCbs = [];
  }

  function initSession() {
    client.auth.getSession().then(function (res) {
      if (res.data && res.data.session) { _fireReady(); return; }
      return client.auth.signInAnonymously().then(function () { _fireReady(); });
    }).catch(function (e) {
      console.error('[BHDdb] session init error:', e);
      _fireReady();  // don't block the app
    });
  }

  /* ── row mappers ──────────────────────────────────────────── */
  function rowToQuote(r) {
    return {
      id:        r.id,
      savedAt:   r.created_at,
      jobType:   r.job_type,
      jobLabel:  r.job_label,
      total:     r.total,
      breakdown: r.breakdown || [],
      address:   r.address,
      addrPickup: r.addr_pickup,
      addrDrop:   r.addr_drop,
      notes:     r.notes,
      status:    r.status
    };
  }
  function rowToBooking(r) {
    var w = r.when_iso;
    return {
      id:           r.id,
      createdAt:    r.created_at,
      jobType:      r.job_type,
      jobLabel:     r.job_label,
      total:        r.total,
      breakdown:    r.breakdown || [],
      status:       r.status,
      address:      r.address,
      notes:        r.notes,
      quoteId:      r.quote_id,
      name:         r.name,
      phone:        r.phone,
      email:        r.email,
      whenISO:      w,
      date:         w ? w.slice(0, 10)  : '',
      time:         w ? w.slice(11, 16) : '',
      suggestedISO:  r.suggested_iso,
      suggestedNote: r.suggested_note,
      decidedAt:    r.decided_at,
      receivedAt:   r.received_at,
      benNotes:     r.ben_notes
    };
  }
  function quoteToRow(q, uid) {
    return {
      id:          q.id,
      user_id:     uid,
      record_type: 'quote',
      job_type:    q.jobType,
      job_label:   q.jobLabel,
      total:       q.total,
      breakdown:   Array.isArray(q.breakdown) ? q.breakdown : [],
      status:      q.status || 'saved',
      address:     q.address || '',
      addr_pickup: q.addrPickup || '',
      addr_drop:   q.addrDrop || '',
      notes:       q.notes || ''
    };
  }
  function bookingToRow(b, uid) {
    return {
      id:          b.id,
      user_id:     uid,
      record_type: 'booking',
      job_type:    b.jobType,
      job_label:   b.jobLabel,
      total:       b.total,
      breakdown:   Array.isArray(b.breakdown) ? b.breakdown : [],
      status:      b.status || 'pending',
      address:     b.address || '',
      notes:       b.notes || '',
      quote_id:    b.quoteId || '',
      name:        b.name || '',
      phone:       b.phone || '',
      email:       b.email || '',
      when_iso:    b.whenISO || null,
      received_at: b.receivedAt || null
    };
  }
  function patchToRow(patch) {
    var r = {};
    if (patch.status        !== undefined) r.status         = patch.status;
    if (patch.decidedAt     !== undefined) r.decided_at     = patch.decidedAt;
    if (patch.confirmedAt   !== undefined) r.decided_at     = patch.confirmedAt;
    if (patch.whenISO       !== undefined) r.when_iso       = patch.whenISO;
    if (patch.suggestedISO  !== undefined) r.suggested_iso  = patch.suggestedISO;
    if (patch.suggestedNote !== undefined) r.suggested_note = patch.suggestedNote;
    if (patch.benNotes      !== undefined) r.ben_notes      = patch.benNotes;
    if (patch.receivedAt    !== undefined) r.received_at    = patch.receivedAt;
    return r;
  }

  /* ── uid helper ───────────────────────────────────────────── */
  function getUid() {
    return client.auth.getUser().then(function (r) {
      return r.data && r.data.user && r.data.user.id;
    });
  }

  /* ── admin auth ───────────────────────────────────────────── */
  var _adminStatus = null;  // null=unknown, true/false

  function checkAdmin() {
    return client.auth.getUser().then(function (res) {
      var user = res.data && res.data.user;
      if (!user || user.is_anonymous) { _adminStatus = false; return false; }
      return client.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
        .then(function (r) { _adminStatus = !!(r.data); return _adminStatus; });
    }).catch(function () { _adminStatus = false; return false; });
  }

  function adminSignIn(email, password) {
    return client.auth.signInWithPassword({ email: email, password: password })
      .then(function (r) {
        if (r.error) throw r.error;
        _adminStatus = null;
        return client.auth.getUser().then(function (u) {
          var uid = u.data && u.data.user && u.data.user.id;
          if (!uid) return false;
          // Try to claim first-admin slot (succeeds only if admins table is empty)
          return client.from('admins').insert({ user_id: uid })
            .then(function () { _adminStatus = true; return true; })
            .catch(function () {
              // Insert failed — either already admin or not authorised; check which
              return checkAdmin();
            });
        });
      });
  }

  function adminSignUp(email, password) {
    return client.auth.signUp({ email: email, password: password })
      .then(function (r) {
        if (r.error) throw r.error;
        return adminSignIn(email, password);
      });
  }

  function adminSignOut() {
    _adminStatus = null;
    return client.auth.signOut()
      .then(function () { return client.auth.signInAnonymously(); });
  }

  function getAdminStatus() { return _adminStatus; }

  /* ── quotes ───────────────────────────────────────────────── */
  function saveQuote(q) {
    return getUid().then(function (uid) {
      if (!uid) return;
      return client.from('records').upsert(quoteToRow(q, uid), { onConflict: 'id' });
    }).catch(function (e) { console.error('[BHDdb] saveQuote:', e); });
  }

  function deleteQuote(id) {
    return client.from('records').delete().eq('id', id).eq('record_type', 'quote')
      .catch(function (e) { console.error('[BHDdb] deleteQuote:', e); });
  }

  function loadQuotes() {
    return client.from('records').select('*').eq('record_type', 'quote')
      .order('created_at', { ascending: false })
      .then(function (r) { return (r.data || []).map(rowToQuote); })
      .catch(function (e) { console.error('[BHDdb] loadQuotes:', e); return []; });
  }

  /* ── bookings ─────────────────────────────────────────────── */
  function saveBooking(b) {
    return getUid().then(function (uid) {
      if (!uid) return;
      return client.from('records').upsert(bookingToRow(b, uid), { onConflict: 'id' });
    }).catch(function (e) { console.error('[BHDdb] saveBooking:', e); });
  }

  function updateBooking(id, patch) {
    var row = patchToRow(patch);
    if (!Object.keys(row).length) return Promise.resolve();
    return client.from('records').update(row).eq('id', id)
      .catch(function (e) { console.error('[BHDdb] updateBooking:', e); });
  }

  function deleteBooking(id) {
    return client.from('records').delete().eq('id', id).eq('record_type', 'booking')
      .catch(function (e) { console.error('[BHDdb] deleteBooking:', e); });
  }

  function loadBookings() {
    return client.from('records').select('*').eq('record_type', 'booking')
      .neq('status', 'removed')
      .order('created_at', { ascending: false })
      .then(function (r) { return (r.data || []).map(rowToBooking); })
      .catch(function (e) { console.error('[BHDdb] loadBookings:', e); return []; });
  }

  /* ── admin queries ────────────────────────────────────────── */
  function loadAllBookings() {
    return client.from('records').select('*').eq('record_type', 'booking')
      .neq('status', 'removed')
      .order('created_at', { ascending: false })
      .then(function (r) { return (r.data || []).map(rowToBooking); })
      .catch(function (e) { console.error('[BHDdb] loadAllBookings:', e); return []; });
  }

  /* ── real-time: watch a booking's status ──────────────────── */
  function subscribeBookingStatus(bookingId, onChange) {
    return client.channel('bk-' + bookingId)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'records',
        filter: 'id=eq.' + bookingId
      }, function (payload) {
        if (payload.new) onChange(rowToBooking(payload.new));
      })
      .subscribe();
  }

  /* ── sync Supabase → localStorage on load ─────────────────── */
  function mergeToLocal(key, remote, dateField) {
    var local;
    try { local = JSON.parse(localStorage.getItem(key) || '[]') || []; } catch (e) { local = []; }
    var byId = {};
    local.forEach(function (x) { byId[x.id] = x; });
    // Remote wins for existing IDs (it has the freshest status)
    remote.forEach(function (x) { byId[x.id] = x; });
    var merged = Object.values(byId).sort(function (a, b) {
      var da = new Date(a[dateField] || a.createdAt || a.savedAt || 0);
      var db = new Date(b[dateField] || b.createdAt || b.savedAt || 0);
      return db - da;
    });
    try { localStorage.setItem(key, JSON.stringify(merged)); } catch (e) {}
    return merged;
  }

  function notifyStatusChanges(remoteBookings) {
    var local;
    try { local = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]') || []; } catch (e) { return; }
    var localById = {};
    local.forEach(function (b) { localById[b.id] = b; });
    remoteBookings.forEach(function (rb) {
      var lb = localById[rb.id];
      if (!lb || lb.status === rb.status) return;
      if (lb.status === 'pending' && rb.status === 'confirmed') {
        if (window.bhdToast) window.bhdToast({
          icon: '✅', body: 'Booking confirmed by Ben!',
          sub: (rb.jobLabel || '') + (rb.date ? ' · ' + rb.date + ' at ' + rb.time : ''),
          timeout: 9000
        });
      } else if (lb.status === 'pending' && rb.status === 'declined') {
        if (window.bhdToast) window.bhdToast({
          icon: '❌', body: 'Booking declined by Ben',
          sub: 'Message him to find another time.',
          timeout: 9000
        });
      } else if (lb.status === 'pending' && rb.status === 'suggested') {
        if (window.bhdToast) window.bhdToast({
          icon: '🕐', body: 'Ben suggested a different time',
          sub: rb.suggestedISO ? rb.suggestedISO.slice(0, 16).replace('T', ' ') : '',
          timeout: 0
        });
      }
    });
  }

  function syncToLocal() {
    Promise.all([loadQuotes(), loadBookings()]).then(function (results) {
      var remoteQuotes   = results[0];
      var remoteBookings = results[1];

      notifyStatusChanges(remoteBookings);

      mergeToLocal(QUOTES_KEY,   remoteQuotes.map(function (q) {
        return Object.assign({}, q, { savedAt: q.savedAt || new Date().toISOString() });
      }), 'savedAt');
      mergeToLocal(BOOKINGS_KEY, remoteBookings, 'createdAt');

      if (window.BHDBooking && typeof window.BHDBooking._refreshCounts === 'function') {
        window.BHDBooking._refreshCounts();
      }
    }).catch(function (e) { console.error('[BHDdb] syncToLocal:', e); });
  }

  /* ── init ─────────────────────────────────────────────────── */
  initSession();
  onReady(syncToLocal);

  window.BHDdb = {
    onReady:                onReady,
    checkAdmin:             checkAdmin,
    getAdminStatus:         getAdminStatus,
    adminSignIn:            adminSignIn,
    adminSignUp:            adminSignUp,
    adminSignOut:           adminSignOut,
    saveQuote:              saveQuote,
    deleteQuote:            deleteQuote,
    loadQuotes:             loadQuotes,
    saveBooking:            saveBooking,
    updateBooking:          updateBooking,
    deleteBooking:          deleteBooking,
    loadBookings:           loadBookings,
    loadAllBookings:        loadAllBookings,
    subscribeBookingStatus: subscribeBookingStatus,
    syncToLocal:            syncToLocal
  };
})();
