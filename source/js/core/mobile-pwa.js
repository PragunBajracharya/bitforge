/* ===== Roadmap drawer (mobile) / collapsible sidebar (desktop), mobile search, and installable app ===== */
(function () {
  const body = document.body, mq = window.matchMedia('(max-width: 860px)');
  const navBtn = $('#navBtn'), aside = $('#sidebar'), scrim = $('#navScrim'), mobbar = $('#mobbar');
  const isMobile = () => mq.matches;
  let lastFocus = null;
  const setExpanded = () => navBtn.setAttribute('aria-expanded', String(isMobile() ? body.classList.contains('navopen') : !body.classList.contains('navcollapsed')));
  function openNav() {
    lastFocus = document.activeElement; body.classList.add('navopen'); scrim.hidden = false; setExpanded();
    const cur = $('#lessonList [aria-current="true"]');
    setTimeout(() => { if (cur) { cur.scrollIntoView({ block: 'center' }); cur.focus({ preventScroll: true }); } else $('#navClose').focus(); }, 30);
  }
  function closeNav(refocus) {
    if (!body.classList.contains('navopen')) return;
    body.classList.remove('navopen'); setExpanded();
    setTimeout(() => { if (!body.classList.contains('navopen')) scrim.hidden = true; }, 250);
    if (refocus && lastFocus) lastFocus.focus();
  }
  window.bfNav = { open: openNav, close: closeNav };
  navBtn.onclick = () => {
    if (isMobile()) { body.classList.contains('navopen') ? closeNav(true) : openNav(); return; }
    body.classList.toggle('navcollapsed'); store.set('bf-navcollapsed', body.classList.contains('navcollapsed')); setExpanded();
  };
  if (store.get('bf-navcollapsed', false)) body.classList.add('navcollapsed');
  setExpanded();
  $('#navClose').onclick = () => closeNav(true);
  scrim.onclick = () => closeNav(true);
  mobbar.onclick = openNav;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && body.classList.contains('navopen')) { e.preventDefault(); closeNav(true); } });
  mq.addEventListener ? mq.addEventListener('change', () => { closeNav(); setExpanded(); }) : mq.addListener(() => { closeNav(); setExpanded(); });
  /* keep focus inside the open drawer */
  aside.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !body.classList.contains('navopen')) return;
    const f = $$('button', aside).filter(b => b.offsetParent !== null); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  /* swipe: from the left edge to open, leftwards on the drawer to close */
  let sx = null, sy = null, from = null;
  document.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; from = body.classList.contains('navopen') ? 'open' : (t.clientX < 24 ? 'edge' : null); }, { passive: true });
  document.addEventListener('touchend', e => {
    if (sx === null || !isMobile()) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = Math.abs(t.clientY - sy);
    if (from === 'edge' && dx > 60 && dy < 50) openNav();
    if (from === 'open' && dx < -60 && dy < 50) closeNav();
    sx = null;
  }, { passive: true });

  /* mobile search toggle */
  const sBtn = $('#searchBtn');
  sBtn.onclick = () => {
    const on = body.classList.toggle('searchopen'); sBtn.setAttribute('aria-expanded', String(on));
    if (on) setTimeout(() => $('#q').focus(), 0); else $('#q').blur();
    measure();
  };
  $('#q').addEventListener('blur', () => setTimeout(() => { if (isMobile() && !$('#q').value && document.activeElement !== $('#q')) { body.classList.remove('searchopen'); sBtn.setAttribute('aria-expanded', 'false'); measure(); } }, 200));

  /* header height drives the sticky "where am I" bar */
  const top = $('.top');
  function measure() { document.documentElement.style.setProperty('--toph', top.offsetHeight + 'px'); }
  if (window.ResizeObserver) new ResizeObserver(measure).observe(top); else window.addEventListener('resize', measure);
  measure();

  /* the bar shows the current course and unit; navigating closes the drawer */
  function paintBar() {
    const t = TRACKS[cur.track], i = cur[cur.track] || 0, l = t.lessons[i], pr = t.progress();
    $('#mbCourse').textContent = t.title + (l && l.code ? ' · ' + l.code : '');
    let title = l ? l.title : '';
    if (cur.track === 'problems' && cur.prob) { const p = PROBS.find(x => x.n === cur.prob); if (p) title = '#' + p.n + ' ' + p.t; }
    $('#mbUnit').textContent = title;
    $('#mbProg').textContent = `${pr.n}/${pr.of}`;
  }
  const baseRender = renderTrack;
  renderTrack = function () { baseRender(); paintBar(); };
  const baseGo = go;
  go = function (noPush) { closeNav(); body.classList.remove('searchopen'); baseGo(noPush); };
  paintBar();
})();

/* ---------- installable app (PWA) ---------- */
window.bfInstall = (function () {
  let deferred = null;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const hasManifest = !!document.querySelector('link[rel="manifest"]');
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', () => { deferred = null; alertBox('Bitforge is installed. Open it from your home screen.'); });
  if (hasManifest && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    const reg = () => navigator.serviceWorker.register('sw.js').catch(() => {});
    if (document.readyState === 'complete') reg(); else window.addEventListener('load', reg);
  }
  return {
    wire(btn) {
      if (!btn || standalone() || !hasManifest) return;
      if (deferred) { btn.hidden = false; btn.onclick = async () => { deferred.prompt(); await deferred.userChoice; deferred = null; btn.hidden = true; }; }
      else if (ios) { btn.hidden = false; btn.onclick = () => alertBox('On iPhone or iPad: tap the Share button, then “Add to Home Screen”.'); }
    }
  };
})();
