// Manny: swipe-to-help demo. Everything lives in localStorage; no money moves.
(function () {
  'use strict';

  const KEY = 'manny.v1';
  const COUNTRIES = window.MANNY_COUNTRIES;
  const TYPES = window.MANNY_BILL_TYPES;
  // every requester, tagged with their country; the deck shows only the chosen country
  const ALL = Object.keys(COUNTRIES).flatMap(cc => COUNTRIES[cc].profiles.map(p => Object.assign(p, { cc })));
  const REVIEW_MS = 4000;

  // launching in the Philippines first; other countries stay switchable in Menu → Country
  const DEFAULTS = {
    lang: 'en', country: 'PH', introDone: false, tab: 'discover', filter: 'all',
    wallets: {}, donorName: '', showName: false,
    donations: [], seen: [], passed: [], lastPass: null, thanks: [],
    myReq: null
  };
  let S;
  try { S = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch (e) { S = Object.assign({}, DEFAULTS); }
  // older saves had one peso wallet and no country on gifts
  if (typeof S.wallet === 'number') { S.wallets = { PH: S.wallet }; delete S.wallet; }
  if (!COUNTRIES[S.country]) S.country = 'PH';
  S.donations.forEach(d => { if (!d.cc) d.cc = 'PH'; });
  if (S.myReq && !S.myReq.cc) S.myReq.cc = 'PH';
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  const C = cc => COUNTRIES[cc || S.country];
  function wallet() { if (S.wallets[S.country] == null) S.wallets[S.country] = C().wallet; return S.wallets[S.country]; }
  function addToWallet(n) { S.wallets[S.country] = wallet() + n; }
  const here = () => ALL.filter(p => p.cc === S.country);
  const dateLocale = cc => S.lang === 'fil' ? 'fil-PH' : C(cc).locale;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (n, cc) => C(cc).symbol + Math.round(n).toLocaleString(C(cc).locale);
  const sym = cc => C(cc).symbol;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function t(k, vars) {
    let s = (I18N[S.lang] && I18N[S.lang][k]) || I18N.en[k] || k;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, v) => (vars[v] != null ? vars[v] : ''));
    return s;
  }

  // ---------- money maths ----------
  const givenTo = billId => S.donations.filter(d => d.billId === billId).reduce((a, d) => a + d.amount, 0);
  const billRaised = b => Math.min(b.amount, (b.funded || 0) + givenTo(b.id));
  const billLeft = b => Math.max(0, b.amount - billRaised(b));
  const needOf = p => p.bills.reduce((a, b) => a + b.amount, 0);
  const raisedOf = p => p.bills.reduce((a, b) => a + billRaised(b), 0);
  const leftOf = p => needOf(p) - raisedOf(p);
  const profileById = id => ALL.find(p => p.id === id);
  const billById = id => { for (const p of ALL) { const b = p.bills.find(x => x.id === id); if (b) return { p, b }; } return null; };
  const thanksHere = () => S.thanks.filter(x => { const p = profileById(x.pid); return p && p.cc === S.country; });
  const passedHere = () =>S.passed.filter(id => { const p = profileById(id); return p && p.cc === S.country; });

  function dueLabel(days) {
    if (days < 0) return t('overdue');
    if (days === 0) return t('dueToday');
    if (days === 1) return t('dueTomorrow');
    return t('dueIn', { n: days });
  }
  const initials = name => name.replace(/^Lola |^Lolo /, '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const serial = p => (p.cc || S.country) + ' ' + String(p.id).replace(/\D/g, '').padStart(4, '0') + ' ' + 'ABCDEFGHJK'[(p.tone || 0) % 10];

  // ---------- shared pieces ----------
  function portrait(p, size) {
    return `<div class="portrait ${size || ''}" style="--tone:${(p.tone || 0) * 9}deg"><span>${esc(initials(p.name))}</span></div>`;
  }
  function progress(raised, need, cc) {
    const pct = need ? Math.round(raised / need * 100) : 0;
    return `<div class="bar"><i style="width:${pct}%"></i></div>
      <div class="bar-label"><b>${money(raised, cc)}</b> ${t('raisedOf', { need: money(need, cc) })}<span>${pct}%</span></div>`;
  }
  function verifiedRow() {
    return `<div class="verified"><span>✓ ${t('idChecked')}</span><span>✓ ${t('billsChecked')}</span></div>`;
  }

  function cardHTML(p, extraClass) {
    const shown = p.bills.slice(0, 2);
    const more = p.bills.length - shown.length;
    const soonest = Math.min(...p.bills.filter(b => billLeft(b) > 0).map(b => b.dueIn));
    return `<article class="card ${extraClass || ''}" data-id="${esc(p.id)}">
      <div class="card-frame">
        <div class="corner tl">${money(needOf(p), p.cc)}</div>
        <div class="corner tr">${serial(p)}</div>
        <div class="stamp give">${t('stampGive')}</div>
        <div class="stamp pass">${t('stampPass')}</div>
        ${soonest <= 3 ? `<div class="urgent">⏰ ${dueLabel(soonest)}</div>` : ''}
        ${portrait(p)}
        <h2 class="who">${esc(p.name)}, ${esc(p.age)}</h2>
        <div class="where">📍 ${esc(p.city)}</div>
        <p class="headline">“${esc(p.headline)}”</p>
        <ul class="mini-bills">
          ${shown.map(b => `<li><span class="ic">${TYPES[b.type].icon}</span><span class="nm">${esc(b.biller)}</span><span class="lf">${money(billLeft(b), p.cc)} ${t('left')}</span></li>`).join('')}
          ${more > 0 ? `<li class="more">+${more} ${t('moreBills')}</li>` : ''}
        </ul>
        ${progress(raisedOf(p), needOf(p), p.cc)}
        ${verifiedRow()}
        <div class="tap-hint">${t('tapForStory')}</div>
      </div>
    </article>`;
  }

  // ---------- sheet / toast / overlay ----------
  let sheetOnClose = null, sheetTimer = null;
  function openSheet(html, onClose) {
    const sh = $('#sheet');
    clearTimeout(sheetTimer);
    sh.innerHTML = `<div class="sheet-back" data-close></div><div class="sheet-panel" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
    sh.hidden = false;
    void sh.offsetWidth; sh.classList.add('open');
    sheetOnClose = onClose || null;
    $$('[data-close]', sh).forEach(el => el.addEventListener('click', () => closeSheet()));
    return $('.sheet-panel', sh);
  }
  function closeSheet(silent) {
    const sh = $('#sheet');
    if (sh.hidden) return;
    sh.classList.remove('open');
    const cb = sheetOnClose; sheetOnClose = null;
    sheetTimer = setTimeout(() => { sh.hidden = true; sh.innerHTML = ''; }, 220);
    if (cb && !silent) cb();
  }
  let toastTimer;
  function toast(msg, onTap) {
    const el = $('#toast');
    el.innerHTML = msg;
    el.classList.add('show');
    el.onclick = () => { el.classList.remove('show'); if (onTap) onTap(); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
  }

  // ---------- header / tabs ----------
  function renderChrome() {
    $('#walletAmt').textContent = money(wallet());
    $('#walletSym').textContent = sym();
    $('#demoPill').textContent = t('demoPill');
    $$('.tabs button').forEach(b => {
      b.classList.toggle('on', b.dataset.tab === S.tab);
      $('.lbl', b).textContent = t('tab_' + b.dataset.tab);
    });
    const unread = thanksHere().filter(x => !x.read).length;
    const dot = $('.tabs [data-tab=giving] .dot');
    dot.hidden = !unread;
    dot.textContent = unread;
    document.documentElement.lang = S.lang === 'fil' ? 'fil' : 'en';
  }
  function go(tab) {
    S.tab = tab; save();
    render();
    $('#view').scrollTop = 0;
  }
  function render() {
    renderChrome();
    const v = $('#view');
    v.className = 'view view-' + S.tab;
    if (S.tab === 'discover') renderDiscover(v);
    else if (S.tab === 'giving') renderGiving(v);
    else renderAsk(v);
  }

  // ---------- Discover (the deck) ----------
  const FILTERS = ['all', 'bills', 'health', 'school', 'home'];
  function deck() {
    return here().filter(p => !S.seen.includes(p.id) && leftOf(p) > 0 &&
      (S.filter === 'all' || p.bills.some(b => TYPES[b.type].group === S.filter)));
  }
  function renderDiscover(v) {
    const list = deck();
    const stack = list.slice(0, 3);
    const passedN = passedHere().length;
    v.innerHTML = `
      <div class="filters">${FILTERS.map(f => `<button class="chip ${S.filter === f ? 'on' : ''}" data-f="${f}">${t('f_' + f)}</button>`).join('')}</div>
      <div class="deck" id="deck">
        ${stack.length ? stack.slice().reverse().map((p, i) => cardHTML(p, i === stack.length - 1 ? 'top' : 'under u' + (stack.length - 1 - i))).join('') : `
          <div class="empty">
            <div class="empty-seal">${sym()}</div>
            <h3>${t('emptyTitle')}</h3>
            <p>${t('emptyBody')}</p>
            ${passedN ? `<button class="btn ghost" id="reshow">${t('showPassedAgain', { n: passedN })}</button>` : ''}
            ${S.filter !== 'all' ? `<button class="btn ghost" id="allCats">${t('seeAllCats')}</button>` : ''}
          </div>`}
      </div>
      <div class="actions" ${stack.length ? '' : 'hidden'}>
        <button class="act pass" id="btnPass" aria-label="${t('stampPass')}">✕</button>
        <button class="act small" id="btnUndo" aria-label="${t('undo')}" ${S.lastPass ? '' : 'disabled'}>↺</button>
        <button class="act small" id="btnInfo" aria-label="${t('seeStory')}">i</button>
        <button class="act give" id="btnGive" aria-label="${t('stampGive')}">${sym()}</button>
      </div>
      <div class="swipe-help">${t('swipeHelp')}</div>`;

    $$('.filters .chip', v).forEach(b => b.onclick = () => { S.filter = b.dataset.f; save(); render(); });
    const reshow = $('#reshow', v);
    if (reshow) reshow.onclick = showPassedAgain;
    const allCats = $('#allCats', v);
    if (allCats) allCats.onclick = () => { S.filter = 'all'; save(); render(); };
    if (!stack.length) return;

    const top = $('.card.top', v);
    const p = stack[0];
    attachDrag(top, p);
    $('#btnPass').onclick = () => flyOut(top, 'left', () => pass(p));
    $('#btnGive').onclick = () => flyOut(top, 'right', () => startGive(p, true));
    $('#btnInfo').onclick = () => openDetail(p, true);
    $('#btnUndo').onclick = undoPass;
  }

  function attachDrag(card, p) {
    let sx = 0, sy = 0, dx = 0, dy = 0, down = false, id = null;
    const give = $('.stamp.give', card), pass_ = $('.stamp.pass', card);
    card.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      down = true; id = e.pointerId; sx = e.clientX; sy = e.clientY; dx = dy = 0;
      card.setPointerCapture(id);
      card.style.transition = 'none';
    });
    card.addEventListener('pointermove', e => {
      if (!down || e.pointerId !== id) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      card.style.transform = `translate(${dx}px, ${dy * 0.4}px) rotate(${dx / 16}deg)`;
      give.style.opacity = Math.max(0, Math.min(1, dx / 90));
      pass_.style.opacity = Math.max(0, Math.min(1, -dx / 90));
    });
    const end = e => {
      if (!down || e.pointerId !== id) return;
      down = false;
      card.style.transition = '';
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) { card.style.transform = ''; openDetail(p, true); return; }
      const limit = Math.min(110, card.offsetWidth * 0.28);
      if (dx > limit) flyOut(card, 'right', () => startGive(p, true));
      else if (dx < -limit) flyOut(card, 'left', () => pass(p));
      else { card.style.transform = ''; give.style.opacity = 0; pass_.style.opacity = 0; }
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }

  function flyOut(card, dir, then) {
    if (!card || card.classList.contains('gone')) return;
    card.classList.add('gone');
    $('.stamp.' + (dir === 'right' ? 'give' : 'pass'), card).style.opacity = 1;
    card.style.transition = 'transform .35s ease-in, opacity .35s ease-in';
    card.style.transform = `translate(${dir === 'right' ? 140 : -140}vw, 40px) rotate(${dir === 'right' ? 28 : -28}deg)`;
    card.style.opacity = 0;
    const under = $('.card.u1');
    if (under) under.classList.add('rise');
    setTimeout(then, 280);
  }

  function pass(p) {
    if (!S.seen.includes(p.id)) S.seen.push(p.id);
    if (!S.passed.includes(p.id)) S.passed.push(p.id);
    S.lastPass = p.id;
    save(); render();
  }
  function undoPass() {
    const id = S.lastPass;
    if (!id) return;
    S.seen = S.seen.filter(x => x !== id);
    S.passed = S.passed.filter(x => x !== id);
    S.lastPass = null;
    // put them back on top
    const i = ALL.findIndex(p => p.id === id);
    if (i > 0) ALL.unshift(ALL.splice(i, 1)[0]);
    save(); render();
  }
  function showPassedAgain() {
    const back = passedHere();
    S.seen = S.seen.filter(id => !back.includes(id));
    S.passed = S.passed.filter(id => !back.includes(id)); S.lastPass = null;
    save(); S.tab = 'discover'; render();
  }

  // ---------- Detail sheet ----------
  function openDetail(p, fromDeck) {
    const need = needOf(p), raised = raisedOf(p);
    const panel = openSheet(`
      <div class="detail">
        <div class="detail-head">
          ${portrait(p, 'lg')}
          <div>
            <h2>${esc(p.name)}, ${esc(p.age)}</h2>
            <div class="where">📍 ${esc(p.city)}</div>
            <div class="meta">${esc(p.job)} · ${t('household', { n: p.household })}</div>
          </div>
        </div>
        <p class="headline big">“${esc(p.headline)}”</p>
        ${progress(raised, need, p.cc)}
        <h4>${t('theirStory')}</h4>
        <p class="story">${esc(p.story)}</p>
        <h4>${t('theirBills')}</h4>
        <ul class="bill-list">${p.bills.map(b => billRowHTML(b, p.cc)).join('')}</ul>
        <div class="direct-note">🔒 ${t('directNote')}</div>
        <h4>${t('checks')}</h4>
        <ul class="checks">
          <li>✓ ${t('checkId')}</li><li>✓ ${t('checkSelfie')}</li><li>✓ ${t('checkBills')}</li>
        </ul>
        ${p.updates && p.updates.length ? `<h4>${t('updates')}</h4>${p.updates.map(u => `<div class="update"><span>${t('daysAgo', { n: u.daysAgo })}</span>${esc(u.text)}</div>`).join('')}` : ''}
      </div>
      <div class="sheet-actions">
        ${fromDeck ? `<button class="btn ghost" id="dPass">✕ ${t('pass')}</button>` : `<button class="btn ghost" data-close>${t('close')}</button>`}
        ${leftOf(p) > 0 ? `<button class="btn primary" id="dGive">${sym(p.cc)} ${t('helpName', { name: esc(p.name) })}</button>` : `<button class="btn primary" disabled>${t('fullyFunded')}</button>`}
      </div>`);
    const dp = $('#dPass', panel);
    if (dp) dp.onclick = () => { closeSheet(true); const top = $('.card.top'); top ? flyOut(top, 'left', () => pass(p)) : pass(p); };
    const dg = $('#dGive', panel);
    if (dg) dg.onclick = () => { closeSheet(true); startGive(p, false); };
  }
  function billRowHTML(b, cc) {
    const left = billLeft(b);
    return `<li class="bill ${left ? '' : 'paid'}">
      <div class="bill-top">
        <span class="ic">${TYPES[b.type].icon}</span>
        <div class="bill-nm"><b>${esc(b.biller)}</b><small>${t('type_' + b.type)}${b.acct && b.acct !== '—' ? ' · ' + t('acct') + ' ••••' + esc(b.acct) : ''}${b.note ? ' · ' + esc(b.note) : ''}</small></div>
        <div class="bill-amt">${money(b.amount, cc)}<small>${left ? dueLabel(b.dueIn) : t('paidInFull')}</small></div>
      </div>
      <div class="bar thin"><i style="width:${Math.round(billRaised(b) / b.amount * 100)}%"></i></div>
      <div class="bill-foot"><span class="photo-ok">📄 ${t('billPhotoChecked')}</span><span>${left ? money(left, cc) + ' ' + t('left') : '✓'}</span></div>
    </li>`;
  }

  // ---------- Give flow ----------
  function startGive(p, fromSwipe) {
    const open = p.bills.filter(b => billLeft(b) > 0).sort((a, b) => a.dueIn - b.dueIn);
    if (!open.length) { if (fromSwipe) render(); return; }
    let bill = open[0];
    const K = C(p.cc);
    let amount = Math.min(K.firstAmount, billLeft(bill));
    let done = false;

    const panel = openSheet(`
      <div class="give">
        <div class="give-head">${portrait(p, 'sm')}<div><h3>${t('helpName', { name: esc(p.name) })}</h3><div class="where">${t('pickBill')}</div></div></div>
        <div class="bill-pick">${open.map((b, i) => `
          <label class="pick ${i === 0 ? 'on' : ''}">
            <input type="radio" name="bill" value="${b.id}" ${i === 0 ? 'checked' : ''}>
            <span class="ic">${TYPES[b.type].icon}</span>
            <span class="nm"><b>${esc(b.biller)}</b><small>${dueLabel(b.dueIn)}</small></span>
            <span class="lf">${money(billLeft(b), p.cc)}<small>${t('left')}</small></span>
          </label>`).join('')}</div>
        <div class="amounts" id="amounts"></div>
        <div class="custom-row"><span>${K.symbol}</span><input id="customAmt" type="number" inputmode="numeric" min="1" placeholder="${t('otherAmount')}"></div>
        <label class="switch-row">
          <span><b>${t('showMyName')}</b><small id="nameHint"></small></span>
          <input type="checkbox" id="showName" ${S.showName ? 'checked' : ''}><i class="switch"></i>
        </label>
        <div class="name-row" id="nameRow" ${S.showName ? '' : 'hidden'}><input id="donorName" maxlength="30" placeholder="${t('yourName')}" value="${esc(S.donorName)}"></div>
        <div class="direct-note" id="goesTo"></div>
        <div class="wallet-note" id="walletNote"></div>
      </div>
      <div class="sheet-actions">
        <button class="btn ghost" data-close>${t('cancel')}</button>
        <button class="btn primary" id="giveBtn"></button>
      </div>`, () => { if (!done && fromSwipe) render(); });

    function paint() {
      const left = billLeft(bill);
      const presets = K.presets.filter(n => n < left);
      $('#amounts', panel).innerHTML = presets.map(n => `<button class="amt ${amount === n ? 'on' : ''}" data-n="${n}">${money(n, p.cc)}</button>`).join('') +
        `<button class="amt whole ${amount === left ? 'on' : ''}" data-n="${left}">${t('wholeBill')}<small>${money(left, p.cc)}</small></button>`;
      $$('#amounts .amt', panel).forEach(b => b.onclick = () => { amount = +b.dataset.n; $('#customAmt', panel).value = ''; paint(); });
      $('#goesTo', panel).innerHTML = '🔒 ' + t('goesTo', { biller: esc(bill.biller), name: esc(p.name) });
      const short = amount > wallet();
      $('#walletNote', panel).innerHTML = short
        ? `${t('notEnough', { bal: money(wallet()) })} <button class="link" id="topUp">${t('addDemo')}</button>`
        : t('walletAfter', { bal: money(wallet() - amount) });
      const tu = $('#topUp', panel);
      if (tu) tu.onclick = () => { addToWallet(K.wallet); save(); renderChrome(); paint(); };
      const gb = $('#giveBtn', panel);
      gb.textContent = amount > 0 ? t('giveAmt', { amt: money(amount, p.cc) }) : t('chooseAmount');
      gb.disabled = !(amount > 0) || short;
      $('#nameHint', panel).textContent = $('#showName', panel).checked ? t('nameShown') : t('anonShown');
    }
    $$('input[name=bill]', panel).forEach(r => r.onchange = () => {
      $$('.pick', panel).forEach(l => l.classList.toggle('on', $('input', l).checked));
      bill = open.find(b => b.id === r.value);
      amount = Math.min(amount, billLeft(bill));
      paint();
    });
    $('#customAmt', panel).oninput = e => {
      const n = Math.floor(+e.target.value || 0);
      amount = Math.min(n, billLeft(bill));
      if (n > billLeft(bill)) e.target.value = amount;
      paint();
    };
    $('#showName', panel).onchange = e => { $('#nameRow', panel).hidden = !e.target.checked; paint(); };
    $('#giveBtn', panel).onclick = () => {
      if (!(amount > 0) || amount > wallet()) return;
      S.showName = $('#showName', panel).checked;
      S.donorName = ($('#donorName', panel).value || '').trim();
      done = true;
      closeSheet(true);
      donate(p, bill, amount);
    };
    paint();
  }

  function donate(p, bill, amount) {
    const wasLeft = billLeft(bill);
    addToWallet(-amount);
    S.donations.unshift({
      id: 'd' + Date.now(), pid: p.id, billId: bill.id, amount, at: Date.now(), cc: p.cc,
      as: S.showName && S.donorName ? S.donorName : null
    });
    if (!S.seen.includes(p.id)) S.seen.push(p.id);
    S.passed = S.passed.filter(x => x !== p.id);
    if (S.lastPass === p.id) S.lastPass = null;
    save();
    celebrate(p, bill, amount, amount >= wasLeft);
    render();
    if (!S.thanks.some(x => x.pid === p.id)) {
      setTimeout(() => {
        S.thanks.unshift({ pid: p.id, at: Date.now(), text: p.thanks, read: false });
        save();
        if (S.tab === 'giving') render();
        toast(`💌 <b>${esc(p.name)}</b> ${t('sentThanks')}`, () => go('giving'));
      }, 4500);
    }
  }

  function celebrate(p, bill, amount, paidOff) {
    const o = $('#overlay');
    const bills = Array.from({ length: 18 }, (_, i) =>
      `<i class="bill-fly" style="left:${(i * 37) % 100}%;animation-delay:${(i % 6) * 0.12}s;--r:${(i % 2 ? 1 : -1) * (20 + i * 7)}deg">${sym(p.cc)}</i>`).join('');
    o.innerHTML = `<div class="confetti">${bills}</div>
      <div class="celebrate">
        <div class="seal">✓</div>
        <h2>${t('salamat')}</h2>
        <p>${t('sentLine', { amt: money(amount, p.cc), biller: esc(bill.biller), name: esc(p.name) })}</p>
        ${paidOff ? `<div class="paid-off">🎉 ${t('billPaidOff', { biller: esc(bill.biller) })}</div>` : ''}
        <small>${t('demoNoMoney')}</small>
        <button class="btn primary" id="keepSwiping">${t('keepSwiping')}</button>
      </div>`;
    o.hidden = false;
    void o.offsetWidth; o.classList.add('open');
    const close = () => { o.classList.remove('open'); setTimeout(() => { o.hidden = true; o.innerHTML = ''; }, 250); };
    $('#keepSwiping', o).onclick = close;
    setTimeout(() => { if (!o.hidden) close(); }, 6000);
  }

  // ---------- My giving ----------
  function renderGiving(v) {
    const gifts = S.donations.filter(d => d.cc === S.country);
    const thanks = thanksHere();
    const passedN = passedHere().length;
    const total = gifts.reduce((a, d) => a + d.amount, 0);
    const people = new Set(gifts.map(d => d.pid)).size;
    const paidBills = new Set(gifts.filter(d => { const x = billById(d.billId); return x && billLeft(x.b) === 0; }).map(d => d.billId)).size;
    thanks.forEach(x => x.read = true); save(); renderChrome();

    v.innerHTML = `
      <section class="note-card">
        <div class="note-inner">
          <div class="corner tl">${t('demoWallet')}</div>
          <div class="corner tr">${t('country_' + S.country)} · ${t('demoPill')}</div>
          <div class="note-amt">${money(wallet())}</div>
          <button class="btn small light" id="addFunds">+ ${t('addDemo')}</button>
        </div>
      </section>
      <div class="stats">
        <div><b>${money(total)}</b><span>${t('given')}</span></div>
        <div><b>${people}</b><span>${t('peopleHelped')}</span></div>
        <div><b>${paidBills}</b><span>${t('billsPaidOff')}</span></div>
      </div>
      ${thanks.length ? `<h3 class="sec">💌 ${t('thankYous')}</h3>${thanks.map(x => {
        const p = profileById(x.pid); if (!p) return '';
        return `<div class="thanks">${portrait(p, 'sm')}<div><b>${esc(p.name)}</b><p>${esc(x.text)}</p></div></div>`;
      }).join('')}` : ''}
      <h3 class="sec">${t('yourGifts')}</h3>
      ${gifts.length ? `<ul class="gifts">${gifts.map(d => {
        const x = billById(d.billId); if (!x) return '';
        return `<li data-pid="${x.p.id}">${portrait(x.p, 'sm')}
          <div class="g-mid"><b>${esc(x.p.name)}</b><small>${TYPES[x.b.type].icon} ${esc(x.b.biller)} · ${new Date(d.at).toLocaleDateString(dateLocale(d.cc), { month: 'short', day: 'numeric' })}</small>
          <span class="status">✓ ${t('paidTo', { biller: esc(x.b.biller) })} · ${d.as ? t('asName', { name: esc(d.as) }) : t('anonymous')}</span></div>
          <div class="g-amt">${money(d.amount, d.cc)}</div></li>`;
      }).join('')}</ul>` : `<div class="empty small"><p>${t('noGifts')}</p><button class="btn primary" id="goSwipe">${t('startSwiping')}</button></div>`}
      ${passedN ? `<div class="passed-row"><span>${t('passedN', { n: passedN })}</span><button class="link" id="reshow2">${t('showAgain')}</button></div>` : ''}
      ${S.donations.length > gifts.length ? `<p class="muted center">${t('otherCountryGifts')}</p>` : ''}`;

    $('#addFunds', v).onclick = () => { addToWallet(C().topUp); save(); render(); toast(t('addedDemo')); };
    const gs = $('#goSwipe', v); if (gs) gs.onclick = () => go('discover');
    const rs = $('#reshow2', v); if (rs) rs.onclick = showPassedAgain;
    $$('.gifts li', v).forEach(li => li.onclick = () => openDetail(profileById(li.dataset.pid), false));
  }

  // ---------- Ask for help ----------
  let draft = null; // in-memory form state (photos are never saved)

  function reqAsProfile(r) {
    return {
      id: 'me', cc: r.cc, name: r.name, age: r.age, city: r.city, job: r.job, household: r.household, tone: 4,
      headline: r.headline, story: r.story, updates: r.updates || [],
      bills: r.bills.map(b => ({ id: b.id, type: b.type, biller: b.biller, acct: '', amount: b.amount, dueIn: daysUntil(b.due), funded: (r.received || []).filter(x => x.billId === b.id).reduce((a, x) => a + x.amount, 0) }))
    };
  }
  function daysUntil(iso) {
    if (!iso) return 30;
    const d = new Date(iso + 'T00:00:00'), now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((d - now) / 864e5);
  }

  function renderAsk(v) {
    const r = S.myReq;
    if (r && r.status === 'review' && Date.now() - r.submittedAt > REVIEW_MS) { r.status = 'live'; save(); }
    if (!r || draft) return renderAskForm(v);
    const p = reqAsProfile(r);
    const live = r.status === 'live';
    const received = r.received || [];
    v.innerHTML = `
      <h2 class="page-title">${t('yourRequest')}</h2>
      <ol class="steps">
        <li class="done">${t('stepSubmitted')}</li>
        <li class="${live ? 'done' : 'doing'}">${live ? t('stepChecked') : t('stepChecking')}</li>
        <li class="${live ? 'done' : ''}">${t('stepLive')}</li>
      </ol>
      <p class="muted">${live ? t('liveNote', { country: t('country_' + r.cc) }) : t('reviewNote')}</p>
      <div class="preview-wrap">${cardHTML(p, 'static')}</div>
      ${live ? `
        <h3 class="sec">${t('donationsReceived')} · ${money(received.reduce((a, x) => a + x.amount, 0), r.cc)}</h3>
        ${received.length ? `<ul class="gifts">${received.map(x => {
          const b = r.bills.find(bb => bb.id === x.billId) || r.bills[0];
          return `<li><div class="portrait sm anon"><span>${sym(r.cc)}</span></div><div class="g-mid"><b>${esc(x.from || t('anonymousDonor'))}</b><small>${TYPES[b.type].icon} ${esc(b.biller)}</small><span class="status">✓ ${t('paidTo', { biller: esc(b.biller) })}</span></div><div class="g-amt">${money(x.amount, r.cc)}</div></li>`;
        }).join('')}</ul>` : `<p class="muted">${t('noneYet')}</p>`}
        <button class="btn ghost wide" id="simGift">🎲 ${t('simulateGift')}</button>
        <h3 class="sec">${t('postUpdate')}</h3>
        <p class="muted">${t('postUpdateHint')}</p>
        <textarea id="updText" rows="3" maxlength="280" placeholder="${t('updatePh')}"></textarea>
        <button class="btn primary wide" id="postUpd">${t('post')}</button>
        ${(r.updates || []).map(u => `<div class="update"><span>${new Date(u.at).toLocaleDateString(dateLocale(r.cc), { month: 'short', day: 'numeric' })}</span>${esc(u.text)}</div>`).join('')}
      ` : ''}
      <div class="row-btns">
        <button class="btn ghost" id="editReq">✎ ${t('edit')}</button>
        <button class="btn ghost danger" id="delReq">${t('deleteReq')}</button>
      </div>`;

    if (!live) setTimeout(() => { if (S.tab === 'ask' && S.myReq && S.myReq.status === 'review') render(); }, REVIEW_MS - (Date.now() - r.submittedAt) + 50);
    $('#editReq', v).onclick = () => { draft = JSON.parse(JSON.stringify(r)); render(); };
    $('#delReq', v).onclick = () => { if (confirm(t('deleteConfirm'))) { S.myReq = null; draft = null; save(); render(); } };
    if (!live) return;
    $('#simGift', v).onclick = () => {
      const openBills = p.bills.filter(b => billLeftMine(b) > 0);
      if (!openBills.length) { toast(t('allFunded')); return; }
      const b = openBills[Math.floor(Math.random() * openBills.length)];
      const K = C(r.cc), pick = a => a[Math.floor(Math.random() * a.length)];
      const amt = Math.min(billLeftMine(b), pick(K.presets.concat(K.firstAmount)));
      r.received = received.concat([{ billId: b.id, amount: amt, from: pick(K.donorNames), at: Date.now() }]);
      save(); render();
      toast(`🎉 ${t('youGot', { amt: money(amt, r.cc), biller: esc(b.biller) })}`);
    };
    $('#postUpd', v).onclick = () => {
      const txt = $('#updText', v).value.trim();
      if (!txt) return;
      r.updates = [{ at: Date.now(), text: txt }].concat(r.updates || []);
      save(); render(); toast(t('updatePosted'));
    };
  }
  const billLeftMine = b => Math.max(0, b.amount - b.funded);

  function blankBill() { return { id: 'mb' + Math.random().toString(36).slice(2, 8), type: 'electricity', biller: '', amount: '', due: '', photo: false }; }

  function renderAskForm(v) {
    if (!draft) draft = { cc: S.country, name: '', age: '', city: '', job: '', household: '', headline: '', story: '', bills: [blankBill()], idType: '', idPhoto: false, selfie: false, consent: false };
    const d = draft;
    // a new request uses the chosen country; an edit keeps the country it was made in
    if (!S.myReq) d.cc = S.country;
    const K = C(d.cc);
    v.innerHTML = `
      <h2 class="page-title">${t('askTitle')}</h2>
      <p class="muted">${t('askIntro')}</p>
      <div class="country-note">${t('askCountry', { country: t('country_' + d.cc) })}</div>
      <div class="how">
        <div><b>1</b>${t('how1')}</div><div><b>2</b>${t('how2')}</div><div><b>3</b>${t('how3')}</div><div><b>4</b>${t('how4')}</div>
      </div>
      <form id="askForm" novalidate>
        <fieldset><legend>${t('aboutYou')}</legend>
          <label>${t('firstName')}<input name="name" maxlength="20" required value="${esc(d.name)}" placeholder="${K.namePh}"></label>
          <div class="two">
            <label>${t('age')}<input name="age" type="number" inputmode="numeric" min="18" max="110" required value="${esc(d.age)}"></label>
            <label>${t('householdSize')}<input name="household" type="number" inputmode="numeric" min="1" max="30" value="${esc(d.household)}"></label>
          </div>
          <label>${t('cityProvince')}<input name="city" list="places" maxlength="40" required value="${esc(d.city)}" placeholder="${K.places[0]}"></label>
          <label>${t('whatYouDo')}<input name="job" maxlength="50" value="${esc(d.job)}" placeholder="${t('jobPh')}"></label>
        </fieldset>
        <fieldset><legend>${t('yourStory')}</legend>
          <label>${t('headline')}<input name="headline" maxlength="60" required value="${esc(d.headline)}" placeholder="${t('headlinePh')}"></label>
          <label>${t('story')}<textarea name="story" rows="5" maxlength="600" required placeholder="${t('storyPh')}">${esc(d.story)}</textarea></label>
          <small class="muted">${t('storyTip')}</small>
        </fieldset>
        <fieldset><legend>${t('yourBills')}</legend>
          <small class="muted">${t('billsTip')}</small>
          <div id="billRows"></div>
          <button type="button" class="btn ghost wide" id="addBill">+ ${t('addBill')}</button>
        </fieldset>
        <fieldset><legend>${t('verifyYou')}</legend>
          <small class="muted">${t('verifyTip')}</small>
          <label>${t('idType')}<select name="idType" required><option value="">${t('choose')}</option>${K.idTypes.map(x => `<option ${d.idType === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
          <div class="two">
            <label class="upload ${d.idPhoto ? 'ok' : ''}" data-flag="idPhoto"><input type="file" accept="image/*" capture="environment"><span class="up-ic">🪪</span><span class="up-t">${d.idPhoto ? '✓ ' + t('added') : t('photoOfId')}</span></label>
            <label class="upload ${d.selfie ? 'ok' : ''}" data-flag="selfie"><input type="file" accept="image/*" capture="user"><span class="up-ic">🤳</span><span class="up-t">${d.selfie ? '✓ ' + t('added') : t('selfieWithId')}</span></label>
          </div>
          <div class="privacy-note">🔒 ${t('photosStay')}</div>
        </fieldset>
        <label class="consent"><input type="checkbox" name="consent" ${d.consent ? 'checked' : ''}> <span>${t('consent')}</span></label>
        <div class="form-error" id="formErr" hidden></div>
        <div class="row-btns">
          ${S.myReq ? `<button type="button" class="btn ghost" id="cancelEdit">${t('cancel')}</button>` : ''}
          <button type="submit" class="btn primary">${S.myReq ? t('saveChanges') : t('submitReq')}</button>
        </div>
      </form>
      <datalist id="places">${K.places.map(x => `<option value="${x}">`).join('')}</datalist>`;

    const form = $('#askForm', v);
    const keep = () => {
      const fd = new FormData(form);
      ['name', 'age', 'household', 'city', 'job', 'headline', 'story', 'idType'].forEach(k => d[k] = (fd.get(k) || '').toString());
      d.consent = form.consent.checked;
      $$('.bill-row', form).forEach((row, i) => {
        const b = d.bills[i];
        b.type = $('[data-k=type]', row).value;
        b.biller = $('[data-k=biller]', row).value.trim();
        b.amount = $('[data-k=amount]', row).value;
        b.due = $('[data-k=due]', row).value;
      });
    };
    function paintBills() {
      $('#billRows', v).innerHTML = d.bills.map((b, i) => `
        <div class="bill-row">
          <div class="bill-row-head"><b>${t('billN', { n: i + 1 })}</b>${d.bills.length > 1 ? `<button type="button" class="link danger" data-rm="${i}">${t('remove')}</button>` : ''}</div>
          <div class="two">
            <label>${t('billType')}<select data-k="type">${Object.keys(TYPES).map(k => `<option value="${k}" ${b.type === k ? 'selected' : ''}>${TYPES[k].icon} ${t('type_' + k)}</option>`).join('')}</select></label>
            <label>${t('payTo')}<input data-k="biller" list="billers${i}" maxlength="40" value="${esc(b.biller)}" placeholder="${(K.billers[b.type] || [])[0] || ''}"><datalist id="billers${i}">${(K.billers[b.type] || []).map(x => `<option value="${x}">`).join('')}</datalist></label>
          </div>
          <div class="two">
            <label>${t('amount', { sym: K.symbol })}<input data-k="amount" type="number" inputmode="numeric" min="1" value="${esc(b.amount)}" placeholder="${K.amountPh}"></label>
            <label>${t('dueDate')}<input data-k="due" type="date" value="${esc(b.due)}"></label>
          </div>
          <label class="upload wide ${b.photo ? 'ok' : ''}" data-bill="${i}"><input type="file" accept="image/*" capture="environment"><span class="up-ic">📄</span><span class="up-t">${b.photo ? '✓ ' + t('billPhotoAdded') : t('billPhoto')}</span></label>
        </div>`).join('');
      $$('[data-rm]', v).forEach(btn => btn.onclick = () => { keep(); d.bills.splice(+btn.dataset.rm, 1); paintBills(); });
      $$('[data-k=type]', v).forEach((sel, i) => sel.onchange = () => { keep(); paintBills(); });
      $$('.upload[data-bill]', v).forEach(lab => $('input', lab).onchange = e => {
        if (!e.target.files.length) return;
        d.bills[+lab.dataset.bill].photo = true;
        markUploaded(lab, e.target.files[0], t('billPhotoAdded'));
      });
      $('#addBill', v).hidden = d.bills.length >= 5;
    }
    function markUploaded(lab, file, label) {
      lab.classList.add('ok');
      $('.up-t', lab).textContent = '✓ ' + label;
      // thumbnail only while this screen is open; never stored
      const url = URL.createObjectURL(file);
      const ic = $('.up-ic', lab);
      ic.innerHTML = `<img src="${url}" alt="">`;
    }
    paintBills();
    $('#addBill', v).onclick = () => { keep(); d.bills.push(blankBill()); paintBills(); };
    $$('.upload[data-flag]', v).forEach(lab => $('input', lab).onchange = e => {
      if (!e.target.files.length) return;
      d[lab.dataset.flag] = true;
      markUploaded(lab, e.target.files[0], t('added'));
    });
    const ce = $('#cancelEdit', v); if (ce) ce.onclick = () => { draft = null; render(); };

    form.onsubmit = e => {
      e.preventDefault();
      keep();
      const err = [];
      if (!d.name.trim()) err.push(t('errName'));
      if (!(+d.age >= 18)) err.push(t('errAge'));
      if (!d.city.trim()) err.push(t('errCity'));
      if (!d.headline.trim() || d.story.trim().length < 40) err.push(t('errStory'));
      d.bills.forEach((b, i) => {
        if (!b.biller || !(+b.amount > 0)) err.push(t('errBill', { n: i + 1 }));
        else if (!b.photo) err.push(t('errBillPhoto', { n: i + 1 }));
      });
      if (!d.idType || !d.idPhoto || !d.selfie) err.push(t('errId'));
      if (!d.consent) err.push(t('errConsent'));
      const box = $('#formErr', v);
      if (err.length) {
        box.hidden = false;
        box.innerHTML = `<b>${t('almostThere')}</b><ul>${err.map(x => `<li>${x}</li>`).join('')}</ul>`;
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const prev = S.myReq;
      S.myReq = {
        cc: d.cc, name: d.name.trim(), age: +d.age, city: d.city.trim(), job: d.job.trim(), household: +d.household || 1,
        headline: d.headline.trim(), story: d.story.trim(),
        bills: d.bills.map(b => ({ id: b.id, type: b.type, biller: b.biller, amount: Math.round(+b.amount), due: b.due, photo: true })),
        idType: d.idType, idPhoto: true, selfie: true, consent: true,
        status: prev && prev.status === 'live' ? 'live' : 'review',
        submittedAt: prev && prev.status === 'live' ? prev.submittedAt : Date.now(),
        updates: prev ? prev.updates || [] : [], received: prev ? prev.received || [] : []
      };
      draft = null;
      save(); render();
      $('#view').scrollTop = 0;
      toast(prev ? t('saved') : t('submitted'));
    };
  }

  // ---------- Country + language pickers ----------
  function countryButtons() {
    return `<div class="country-pick">${Object.keys(COUNTRIES).map(cc => `
      <button data-cc="${cc}" class="${S.country === cc ? 'on' : ''}"><span class="cc">${cc}</span><span class="cn">${t('country_' + cc)}<small>${C(cc).symbol} · ${t('money_' + cc)}</small></span></button>`).join('')}</div>`;
  }
  const langButtons = cls => `<div class="seg ${cls || ''}"><button data-lang="en" class="${S.lang === 'en' ? 'on' : ''}">English</button><button data-lang="fil" class="${S.lang === 'fil' ? 'on' : ''}">Filipino</button></div>`;
  function setCountry(cc) {
    if (S.country === cc) return false;
    S.country = cc; S.filter = 'all'; S.lastPass = null;
    save();
    return true;
  }

  // ---------- Menu ----------
  function openMenu() {
    const panel = openSheet(`
      <div class="menu">
        <h3>${t('menu')}</h3>
        <div class="menu-block"><span>${t('country')}</span><small>${t('countryHint')}</small>${countryButtons()}</div>
        <div class="menu-row"><span>${t('language')}<small>${t('languageHint')}</small></span>${langButtons()}</div>
        <div class="menu-row"><span>${t('demoWallet')}<small>${money(wallet())}</small></span><button class="btn small ghost" id="mAdd">+ ${money(C().topUp)}</button></div>
        <details><summary>${t('howItWorks')}</summary>
          <ul class="plain"><li>${t('hiw1')}</li><li>${t('hiw2')}</li><li>${t('hiw3')}</li><li>${t('hiw4')}</li></ul></details>
        <details><summary>${t('aboutDemo')}</summary><p>${t('aboutDemoBody')}</p></details>
        <button class="btn ghost wide" id="mIntro">${t('showIntro')}</button>
        <button class="btn ghost wide danger" id="mReset">${t('resetDemo')}</button>
      </div>`);
    $$('[data-lang]', panel).forEach(b => b.onclick = () => { S.lang = b.dataset.lang; save(); closeSheet(true); render(); openMenu(); });
    $$('[data-cc]', panel).forEach(b => b.onclick = () => {
      if (!setCountry(b.dataset.cc)) return;
      closeSheet(true); render();
      toast(t('nowShowing', { country: t('country_' + S.country) }));
    });
    $('#mAdd', panel).onclick = () => { addToWallet(C().topUp); save(); closeSheet(true); render(); toast(t('addedDemo')); };
    $('#mIntro', panel).onclick = () => { closeSheet(true); showIntro(); };
    $('#mReset', panel).onclick = () => {
      if (!confirm(t('resetConfirm'))) return;
      const { lang, country } = S;
      S = Object.assign({}, DEFAULTS, { lang, country, introDone: true, wallets: {}, donations: [], seen: [], passed: [], thanks: [] });
      draft = null; save(); closeSheet(true); render();
    };
  }

  // ---------- Intro ----------
  function showIntro() {
    const o = $('#intro');
    const paint = () => {
      o.innerHTML = `<div class="intro-card">
        ${langButtons('intro-lang')}
        <div class="intro-seal">M</div>
        <h1>Manny</h1>
        <p class="tag">${t('tagline')}</p>
        <div class="intro-where">${t('whereAreYou')}</div>
        ${countryButtons()}
        <ul class="intro-list">
          <li><span class="i-ic give">${sym()}</span><span>${t('intro1')}</span></li>
          <li><span class="i-ic pass">✕</span><span>${t('intro2')}</span></li>
          <li><span class="i-ic">🔒</span><span>${t('intro3')}</span></li>
          <li><span class="i-ic">🪪</span><span>${t('intro4')}</span></li>
        </ul>
        <div class="demo-banner">${t('introDemo')}</div>
        <button class="btn primary wide" id="introGo">${t('startSwiping')}</button>
      </div>`;
      $$('[data-lang]', o).forEach(b => b.onclick = () => { S.lang = b.dataset.lang; save(); paint(); render(); });
      $$('[data-cc]', o).forEach(b => b.onclick = () => { setCountry(b.dataset.cc); paint(); render(); });
      $('#introGo', o).onclick = () => { S.introDone = true; save(); o.classList.remove('open'); setTimeout(() => { o.hidden = true; }, 250); go('discover'); };
    };
    paint();
    o.hidden = false;
    void o.offsetWidth; o.classList.add('open');
  }

  // ---------- boot ----------
  $$('.tabs button').forEach(b => b.onclick = () => go(b.dataset.tab));
  $('#menuBtn').onclick = openMenu;
  $('#walletBtn').onclick = () => go('giving');
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSheet(); return; }
    if (S.tab !== 'discover' || !$('#sheet').hidden || !$('#intro').hidden || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') { const b = $('#btnGive'); if (b) b.click(); }
    if (e.key === 'ArrowLeft') { const b = $('#btnPass'); if (b) b.click(); }
  });
  render();
  if (!S.introDone) showIntro();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
