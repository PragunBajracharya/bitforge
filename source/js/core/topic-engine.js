/* ===== System design: data model & diagram engine ===== */
const SD = {};
const SDX = (k, o) => { o.key = k; SD[k] = o; };
const SD_CATS = [
  ['sdfound', 'Foundations'], ['sdnet', 'Networking & APIs'], ['sdscale', 'Scaling & traffic'], ['sdcache', 'Caching'],
  ['sddata', 'Databases & storage'], ['sddist', 'Replication & partitioning'], ['sdasync', 'Messaging & streams'],
  ['sdcons', 'Consistency & consensus'], ['sdtxn', 'Transactions & probabilistic structures'], ['sdrel', 'Reliability & operations'],
  ['sdarch', 'Architecture & security'], ['sdcase', 'Case studies']
];
const sdCatName = id => (SD_CATS.find(c => c[0] === id) || [id, id])[1];

/* small HTML helpers for topic text */
const OL = a => `<ol class="xsteps">${a.map(x => `<li>${x}</li>`).join('')}</ol>`;
const UL = a => `<ul class="pts">${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
const TBL = (head, rows) => `<div class="tblwrap"><table class="cx sdt"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th>${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const PP = s => `<p>${s}</p>`;
const SQ = (q, o, a, why) => ({ q, o, a, why });
const CO = (t, s) => `<div class="callout"><b>${t}</b> ${s}</div>`;

/* ---------- diagram engine ----------
   spec = { w, h, n: [[id, label, cx, cy, kind, sub, width]], e: [[from, to, label, flags]], z: [[label, x, y, w, h]], t: [[text, x, y, anchor]] }
   kinds: client user svc lb db cache queue cdn store dns gw worker ext box
   edge flags: d = dashed, b = arrows both ends, u/n = bend up/down (by 26px), U/N = big bend (52px), s = no arrow */
let DG_SEQ = 0;
const DG_ICON = {
  client: '<rect x="0" y="1" width="16" height="11" rx="1.5"/><path d="M5 15h6M8 12v3"/>',
  user: '<circle cx="8" cy="4.5" r="3.2"/><path d="M1.5 15.5c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/>',
  svc: '<rect x="1" y="1" width="14" height="4" rx="1"/><rect x="1" y="6" width="14" height="4" rx="1"/><rect x="1" y="11" width="14" height="4" rx="1"/>',
  lb: '<path d="M1 8h5M6 8l8-6M6 8h8M6 8l8 6"/><path d="M11.5 1.2l2.6.8-.6 2.6M11.8 6.2l2.4 1.8-2.4 1.8M13.5 11.4l.6 2.6-2.6.8"/>',
  cache: '<path d="M9.5 0.8L3 9h4.5l-1 6.2L13 7H8.5z"/>',
  queue: '<rect x="0.8" y="3" width="3" height="10" rx=".8"/><rect x="4.8" y="3" width="3" height="10" rx=".8"/><rect x="8.8" y="3" width="3" height="10" rx=".8"/><path d="M13 8h3M14.5 6.5L16 8l-1.5 1.5"/>',
  cdn: '<circle cx="8" cy="8" r="7"/><ellipse cx="8" cy="8" rx="3" ry="7"/><path d="M1 8h14"/>',
  store: '<path d="M1.5 3h13l-1.6 12H3.1z"/><ellipse cx="8" cy="3" rx="6.5" ry="1.8"/>',
  dns: '<rect x="1.5" y="1" width="13" height="14" rx="1.5"/><path d="M4.5 5h7M4.5 8h7M4.5 11h4"/>',
  gw: '<path d="M2 15V4l6-3 6 3v11"/><path d="M5 9h6M9 7l2 2-2 2"/>',
  worker: '<circle cx="8" cy="8" r="3"/><path d="M8 0.8v3M8 12.2v3M0.8 8h3M12.2 8h3M2.9 2.9l2.1 2.1M11 11l2.1 2.1M2.9 13.1L5 11M11 5l2.1-2.1"/>'
};
function dgNodeSize(n) {
  const [, label, , , kind, sub, wOver] = n;
  const icon = DG_ICON[kind] ? 26 : 0;
  const w = wOver || Math.max(78, Math.round(Math.max(label.length * 7.1, (sub || '').length * 6.4) + icon + 22));
  const h = kind === 'db' ? (sub ? 58 : 52) : (sub ? 46 : 38);
  return [w, h];
}
function renderDiagram(spec, aria) {
  const id = 'dg' + (++DG_SEQ);
  const N = {};
  spec.n.forEach(n => { const [w, h] = dgNodeSize(n); N[n[0]] = { n, x: n[2], y: n[3], w, h }; });
  const clip = (A, tx, ty) => {
    const dx = tx - A.x, dy = ty - A.y;
    if (!dx && !dy) return [A.x, A.y];
    const pad = 3, hw = A.w / 2 + pad, hh = A.h / 2 + pad;
    const t = Math.min(dx ? hw / Math.abs(dx) : 1e9, dy ? hh / Math.abs(dy) : 1e9);
    return [A.x + dx * t, A.y + dy * t];
  };
  let out = `<svg class="dg" id="${id}" viewBox="0 0 ${spec.w} ${spec.h}" role="img" aria-label="${esc(aria || '')}" style="min-width:${Math.min(spec.w, 600)}px">`;
  out += `<defs><marker id="${id}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="dg-ah"/></marker>` +
    `<marker id="${id}h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="dg-ahh"/></marker></defs>`;
  (spec.c || []).forEach(([cx, cy, r]) => { out += `<circle class="dc" cx="${cx}" cy="${cy}" r="${r}"/>`; });
  (spec.z || []).forEach(([label, x, y, w, h]) => {
    out += `<g class="dz"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text x="${x + 12}" y="${y + 17}">${esc(label)}</text></g>`;
  });
  (spec.e || []).forEach(e => {
    const [a, b, label, fl = '', eid] = e, A = N[a], B = N[b];
    if (!A || !B) return;
    const bend = fl.includes('U') ? -52 : fl.includes('N') ? 52 : fl.includes('u') ? -26 : fl.includes('n') ? 26 : 0;
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, len = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    const nx = -(B.y - A.y) / len, ny = (B.x - A.x) / len;
    const cx = mx + nx * bend * 2, cy = my + ny * bend * 2;
    const [x1, y1] = bend ? clip(A, cx, cy) : clip(A, B.x, B.y);
    const [x2, y2] = bend ? clip(B, cx, cy) : clip(B, A.x, A.y);
    const d = bend ? `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}` : `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    const lx = bend ? (x1 + 2 * cx + x2) / 4 : (x1 + x2) / 2, ly = bend ? (y1 + 2 * cy + y2) / 4 : (y1 + y2) / 2;
    const mk = fl.includes('s') ? '' : ` marker-end="url(#${id}a)"${fl.includes('b') ? ` marker-start="url(#${id}a)"` : ''}`;
    out += `<g class="de${fl.includes('d') ? ' dash' : ''}" data-n="${eid || a + '>' + b}"><path d="${d}"${mk} data-m="${id}"/>${label ? `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}">${esc(label)}</text>` : ''}</g>`;
  });
  spec.n.forEach(n => {
    const [nid, label, , , kind, sub] = n, A = N[nid], x0 = A.x - A.w / 2, y0 = A.y - A.h / 2;
    const icon = DG_ICON[kind];
    let shape;
    if (kind === 'db') shape = `<path class="ds" d="M${x0} ${y0 + 7}v${A.h - 14}a${A.w / 2} 7 0 0 0 ${A.w} 0v-${A.h - 14}a${A.w / 2} 7 0 0 0 -${A.w} 0a${A.w / 2} 7 0 0 0 ${A.w} 0"/>`;
    else shape = `<rect class="ds${kind === 'ext' ? ' ext' : ''}" x="${x0}" y="${y0}" width="${A.w}" height="${A.h}" rx="${kind === 'user' || kind === 'client' ? 19 : 8}"/>`;
    const tx = icon ? x0 + 30 : A.x, anchor = icon ? 'start' : 'middle';
    const ty = kind === 'db' ? A.y + (sub ? 0 : 7) : A.y + (sub ? -2 : 4.5);
    out += `<g class="dn k-${kind}" data-n="${nid}">${shape}${icon ? `<g class="di" transform="translate(${x0 + 9} ${A.y - 8 + (kind === 'db' ? 3 : 0)})">${icon}</g>` : ''}` +
      `<text class="dl" x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(label)}</text>${sub ? `<text class="dsub" x="${tx}" y="${ty + 14}" text-anchor="${anchor}">${esc(sub)}</text>` : ''}</g>`;
  });
  (spec.t || []).forEach(([text, x, y, anchor]) => { out += `<text class="dt" x="${x}" y="${y}" text-anchor="${anchor || 'middle'}">${esc(text)}</text>`; });
  return out + '</svg>';
}
function figure(spec, cap) {
  return `<figure class="dgfig"><div class="dgwrap">${renderDiagram(spec, cap)}</div><figcaption>${cap}</figcaption></figure>`;
}
/* highlight a set of node/edge ids in a rendered diagram */
function dgHighlight(svg, ids) {
  if (!svg) return;
  svg.classList.toggle('stepping', !!ids);
  $$('[data-n]', svg).forEach(g => {
    const on = !!ids && ids.includes(g.dataset.n);
    g.classList.toggle('hl', on);
    const pth = g.classList.contains('de') && $('path', g);
    if (pth && pth.getAttribute('marker-end')) {
      const m = pth.dataset.m; pth.setAttribute('marker-end', `url(#${m}${on ? 'h' : 'a'})`);
      if (pth.getAttribute('marker-start')) pth.setAttribute('marker-start', `url(#${m}${on ? 'h' : 'a'})`);
    }
  });
}

/* ---------- topic page ---------- */
function sdTopicDetail(root, k, nav) {
  const T = SD[k];
  seenAlgos['sd:' + k] = true; store.set('bf-libseen', seenAlgos);
  const isCase = /case$/.test(T.cat);
  const qs = T.qs || (T.q ? [T.q] : []);
  const prac = (T.prac || []).map(n => PROBS.find(x => x.n === n)).filter(Boolean);
  root.innerHTML = `${nav.onBack ? `<button class="backlink" id="tback">← ${nav.backLabel}</button>` : ''}
    ${nav.noEyebrow ? '' : `<div class="eyebrow">${nav.eyebrow || (T.domain || 'System design') + ' · ' + sdCatName(T.cat)}</div>`}
    <h2 class="topic-h">${esc(T.name)}</h2>${printBtn()}
    <p class="lede" style="margin-bottom:12px">${T.blurb}</p>
    ${T.facts ? `<div class="cxstrip">${T.facts.map(r => `<span><small>${r[0]}</small><b>${r[1]}</b></span>`).join('')}</div>` : ''}
    ${T.cheat ? `<h2 class="section-title">Cheat sheet</h2>${cheatHTML(T.cheat)}` : ''}
    ${T.dg ? `    <h2 class="section-title">${isCase ? 'Architecture' : 'The picture'}</h2>
    <div class="bench sdbench">${figure(T.dg, T.cap)}
      ${T.walk ? `<div class="sdwalk"><div class="narr" id="wnarr"></div><div class="row"><button class="btn sm" id="wprev">◀ Back</button><button class="btn primary" id="wnext">Next step ▶</button><button class="btn sm" id="wreset">Restart</button><span class="stats"><span>Step <b id="wstep">0</b> / ${T.walk.length}</span></span></div></div>` : ''}
    </div>` : ''}
    ${T.vs ? vsHTML(T.vs) : ''}
    ${T.sheets ? `<div class="sheetgrid">${T.sheets.map(([h, rows]) => `<div class="card sheet"><h3>${h}</h3><dl>${rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div>`).join('')}</div>` : ''}
    ${(T.sections || []).length ? `<h2 class="section-title">${isCase ? 'The design, step by step' : T.vs ? 'Going deeper' : 'In detail'}</h2>
    <div class="card explain">${T.sections.map(([h, body], i) => `<section class="xsec"><h3><span class="xn">${i + 1}</span>${h}</h3>${body}</section>`).join('')}</div>` : ''}
    ${T.dg2 ? `<h2 class="section-title">${T.dg2t || 'Compare'}</h2><div class="bench">${figure(T.dg2, T.cap2)}</div>` : ''}
    ${T.snips ? `<h2 class="section-title">${T.snipTitle || 'Syntax & examples'}</h2>${T.snipNote ? `<p class="section-sub">${T.snipNote}</p>` : ''}<div id="snips"></div>` : ''}
    ${T.code ? `<h2 class="section-title">${T.codeTitle || 'Build it'}</h2>${T.codeNote ? `<p class="section-sub">${T.codeNote}</p>` : ''}<div id="sdcode"></div>${T.codeOut ? `<div class="card outcard"><div class="panel-title">Output (identical in all four languages)</div><pre class="out">${esc(T.codeOut)}</pre></div>` : ''}` : ''}
    ${T.edge ? `<h2 class="section-title">Edge cases & gotchas</h2><div class="card edgecard">${UL(T.edge)}</div>` : ''}
    ${T.faq ? `<h2 class="section-title">Interview questions</h2><p class="section-sub">Try answering out loud before opening each model answer.</p>${faqHTML(T.faq)}` : ''}
    ${deepHTML(k, T)}
    ${qs.length ? `<h2 class="section-title">Check yourself</h2><div class="stack" style="gap:12px">${qs.map((_, i) => `<div class="card" id="sq${i}"></div>`).join('')}</div>` : ''}
    ${prac.length ? `<h2 class="section-title">Practice it</h2><p class="section-sub">NeetCode 150 problems built on this idea.</p><div class="linkchips" id="tprac">${prac.map(p => `<button data-n="${p.n}"><small>#${p.n}</small>${esc(p.t)}</button>`).join('')}</div>` : ''}
    ${nav.noFoot ? '' : ''}`;
  const svg = $('.dgfig svg', root);
  if (T.walk) {
    let step = -1;
    const draw = () => {
      $('#wstep', root).textContent = step + 1;
      if (step < 0) { $('#wnarr', root).innerHTML = isCase ? 'Press <b>Next step</b> to follow a request through this design. The parts involved light up.' : 'Press <b>Next step</b> to walk through how this works. The parts involved light up in the diagram.'; dgHighlight(svg, null); }
      else { const [ids, text] = T.walk[step]; $('#wnarr', root).innerHTML = `<span class="tag">Step ${step + 1}</span>${text}`; dgHighlight(svg, ids); }
      $('#wprev', root).disabled = step < 0; $('#wnext', root).disabled = step >= T.walk.length - 1;
    };
    $('#wnext', root).onclick = () => { step++; draw(); };
    $('#wprev', root).onclick = () => { step--; draw(); };
    $('#wreset', root).onclick = () => { step = -1; draw(); };
    draw();
  }
  if (T.snips) snipCard($('#snips', root), T.snips);
  $$('[data-prob]', root).forEach(b => b.onclick = () => openProblem(+b.dataset.prob));
  $$('[data-topic]', root).forEach(b => b.onclick = () => { const k = b.dataset.topic; (SD[k] ? openSdTopic : openTopic)(k); });
  wirePrint(root);
  if (T.code) codeCard($('#sdcode', root), T.code, T.codeTitle ? 'Implementation' : 'Implementation');
  qs.forEach((q, i) => mcq($('#sq' + i, root), q));
  $$('#tprac button', root).forEach(b => b.onclick = () => openProblem(+b.dataset.n));
  if (nav.onBack) $('#tback', root).onclick = nav.onBack;
}

/* tabbed syntax examples: snips = [[label, hljsLang, code, output?], ...] */
let snipPref = null;
function snipCard(el, snips) {
  if (snipPref === null) snipPref = store.get('bf-snip', '');
  let i = Math.max(0, snips.findIndex(x => x[0] === snipPref));
  el.innerHTML = `<div class="card snip"><div class="code-head"><div class="langs" role="group" aria-label="Example">${snips.map((x, j) => `<button data-j="${j}">${x[0]}</button>`).join('')}</div><button class="btn sm copy">Copy</button></div><pre class="code"><code></code></pre><div class="snout"></div></div>`;
  const code = $('code', el);
  const show = () => {
    const [label, lg, src, out] = snips[i];
    code.className = lg ? 'language-' + lg : 'nohighlight'; code.textContent = src; delete code.dataset.highlighted;
    if (window.hljs && lg && hljs.getLanguage(lg)) { try { hljs.highlightElement(code); } catch (e) {} }
    $$('.langs button', el).forEach(b => b.setAttribute('aria-pressed', +b.dataset.j === i));
    $('.snout', el).innerHTML = out ? `<div class="panel-title" style="margin-top:12px">Result</div><div class="tblwrap">${out}</div>` : '';
  };
  $$('.langs button', el).forEach(b => b.onclick = () => { i = +b.dataset.j; snipPref = snips[i][0]; store.set('bf-snip', snipPref); show(); });
  const cp = $('.copy', el);
  cp.onclick = () => { try { navigator.clipboard.writeText(snips[i][2]); cp.textContent = 'Copied'; setTimeout(() => cp.textContent = 'Copy', 1200); } catch (e) {} };
  show();
}
/* result table helper: rt(['col', ...], [[...], ...]) */
const RT = (head, rows) => `<table class="sampletbl"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const DAT = (k, o) => { o.domain = 'Data analytics'; SDX(k, o); };

/* interview-prep helpers */
const cheatHTML = rows => `<div class="card cheat"><dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`;
const faqHTML = list => `<div class="faq">${list.map(([q, a]) => `<details class="card"><summary>${q}</summary><div class="faqa">${a}</div></details>`).join('')}</div>`;
/* depth layer shared by every topic format */
function deepHTML(k, T) {
  const D = DEEP[k] || {}, work = D.work || T.work, fu = D.fu || null, follow = !fu && T.follow, deep = D.deep, src = D.src;
  let h = '';
  if (work) h += `<h2 class="section-title">Where you use this at work</h2><div class="card">${Array.isArray(work) ? UL(work) : `<p style="margin:0;max-width:75ch">${work}</p>`}</div>`;
  if (fu) h += `<h2 class="section-title">Follow-ups</h2><p class="section-sub">The deeper questions interviewers ask once your first answer lands. Answer out loud, then open the model answer.</p>${faqHTML(fu)}`;
  else if (follow) h += `<h2 class="section-title">Common interview follow-ups</h2><div class="card">${UL(follow)}</div>`;
  if (deep) h += `<h2 class="section-title">Go deeper</h2><p class="section-sub">Edge cases, failure modes and how real systems implement it.</p><div class="card deepcard">${deep.map(([l, t]) => `<p><b>${l}.</b> ${t}</p>`).join('')}</div>`;
  if (src) h += `<div class="srcline"><span>Authoritative source</span>${src[1] ? `<a href="${src[1]}" target="_blank" rel="noopener">${src[0]} ↗</a>` : `<b>${src[0]}</b>`}${src[2] ? ` <small>${src[2]}</small>` : ''}</div>`;
  return h;
}
/* X vs Y comparison pages */
function vsHTML(V) {
  return `<h2 class="section-title">Side by side</h2>${TBL(['', ...V.cols], V.rows)}
    <h2 class="section-title">When to pick each</h2><div class="vsgrid">${V.pick.map(([name, pts]) => `<div class="card vspick"><h3>Pick ${name} when…</h3>${UL(pts)}</div>`).join('')}</div>
    ${V.verdict ? CO('Rule of thumb:', V.verdict) : ''}
    <h2 class="section-title">Model interview answer</h2><div class="card modelans"><p class="section-sub" style="margin:0 0 8px">“${V.ask}”</p>${V.answer}</div>`;
}
const CMP = (k, o) => { o.domain = o.domain || 'Comparison'; o.cat = o.cat || 'cmp'; SDX(k, o); };
const SHEET = (k, o) => { o.domain = 'Cheat sheet'; o.cat = o.cat || 'cs'; SDX(k, o); };
const IPT = (k, o) => { o.domain = 'Interview prep'; SDX(k, o); };

/* print-this-page button for every topic */
const printBtn = () => `<button class="btn sm noprint printbtn" type="button">Print / save as PDF</button>`;
function wirePrint(root) { $$('.printbtn', root).forEach(b => b.onclick = () => window.print()); }
const PL = (n, label) => `<button class="inline-link" data-prob="${n}">${label || '#' + n}</button>`;
const TL = (k, label) => `<button class="inline-link" data-topic="${k}">${label}</button>`;
