/* ================= Shared: code card ================= */
function codeCard(el, codeMap, title) {
  el.innerHTML = `<div class="card"><div class="code-head"><h3>${title || 'Implementation'}</h3>
    <div class="langs" role="group" aria-label="Programming language">${LANGS.map(([k, l]) => `<button data-l="${k}" aria-pressed="${k === lang}">${l}</button>`).join('')}</div>
    <button class="btn sm copy">Copy</button></div><pre class="code"><code></code></pre></div>`;
  const code = $('code', el);
  const show = () => {
    code.className = 'language-' + lang; code.textContent = codeMap[lang]; delete code.dataset.highlighted;
    if (window.hljs) { try { hljs.highlightElement(code); } catch (e) {} }
    $$('.langs button', el).forEach(b => b.setAttribute('aria-pressed', b.dataset.l === lang));
  };
  $$('.langs button', el).forEach(b => b.onclick = () => { lang = b.dataset.l; store.set('bf-lang', lang); show(); });
  const cp = $('.copy', el);
  cp.onclick = () => {
    const reset = () => setTimeout(() => cp.textContent = 'Copy', 1800);
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Selected · press Ctrl+C'; reset(); };
    try { navigator.clipboard.writeText(codeMap[lang]).then(() => { cp.textContent = 'Copied'; reset(); }, fallback); } catch (e) { fallback(); }
  };
  show();
}

/* single multiple-choice question with explanation */
function mcq(el, q) {
  el.innerHTML = `<p style="margin:0;font-weight:600">${q.q}</p><div class="qopts">${q.o.map((o, i) => `<button data-i="${i}">${o}</button>`).join('')}</div><p class="why" hidden style="margin:10px 0 0;color:var(--muted)"></p>`;
  $$('.qopts button', el).forEach(b => b.onclick = () => {
    const pick = +b.dataset.i;
    $$('.qopts button', el).forEach((x, i) => { x.disabled = true; if (i === q.a) x.classList.add('right'); else if (i === pick) x.classList.add('wrong'); });
    const w = $('.why', el); w.hidden = false;
    w.innerHTML = `<b class="${pick === q.a ? 'ok' : 'no'}">${pick === q.a ? 'Correct.' : 'Not quite.'}</b> ${q.why}`;
  });
}

const catName = id => (PCATS.find(c => c[0] === id) || [id, id])[1];
const algoCatName = id => (CATS.find(c => c[0] === id) || [id, id])[1];
let solved = store.get('bf-solved', {});
let seenAlgos = store.get('bf-libseen', {});

/* ================= Problems track ================= */
const CAT_LEDE = {
  hashing: 'Trade memory for speed: hash sets and maps answer “have I seen this?” or “how many?” in O(1). Reach for them when brute force compares every pair.',
  twoptr: 'Two indices walking toward each other (or together) through sorted or structured data, skipping whole groups of candidates per step.',
  window: 'A contiguous range that grows on the right and shrinks on the left. Signals: “longest/shortest substring or subarray such that…”.',
  stack: 'Last in, first out. Matching brackets, evaluating expressions, and monotonic stacks for “next greater/smaller” questions.',
  bsearch: 'Halve the search space each step, on a sorted array or on the answer itself when a yes/no condition flips exactly once.',
  linked: 'Pointer surgery: dummy heads, fast/slow pointers, reversing in place, and merging. Draw the pointers before you code.',
  trees: 'Recursion on left and right subtrees. Decide what each call returns, and whether you also need a global answer.',
  heap: 'Priority queues give the smallest or largest item in O(log n). Signals: top k, k-th largest, running median, merging sorted streams.',
  backtrack: 'Build candidates step by step and undo each choice after exploring it. Generates subsets, permutations, and constraint solutions.',
  tries: 'Prefix trees store many strings so that prefix lookups cost O(word length), and let one search check many words at once.',
  graphs: 'BFS for shortest steps, DFS for exploration and components, topological sort for prerequisites, union–find for connectivity.',
  advgraphs: 'Weighted shortest paths (Dijkstra, Bellman–Ford), minimum spanning trees (Prim, Kruskal), and Eulerian paths.',
  dp1: 'One-dimensional dynamic programming: the answer for position i depends on a few earlier positions. Define the state, then the recurrence.',
  dp2: 'Two-dimensional DP over pairs of indices: two strings, a grid, or an interval [l, r]. Often reducible to one row of memory.',
  greedy: 'Make the locally best choice and prove you never need to undo it. Usually involves a scan with a running maximum or reach.',
  intervals: 'Sort by start or end, then merge, count overlaps, or sweep. Most interval problems start with that one sort.',
  math: 'Matrix manipulation, digit arithmetic, and geometry. Watch for overflow and off-by-one boundaries.',
  bits: 'XOR cancellation, masks, and shifts. Constant-time tricks that replace extra memory or arithmetic.'
};

function openProblem(n) {
  const p = PROBS.find(x => x.n === n);
  cur.track = 'problems'; cur.problems = 1 + PCATS.findIndex(c => c[0] === p.c); cur.prob = n; go();
}
function openAlgo(k) { openTopic(k); }
const setSolved = (n, v) => { if (v) solved[n] = true; else delete solved[n]; store.set('bf-solved', solved); renderTrack(); };

function problemTable(rows, showCat) {
  return `<div class="card" style="padding:4px 6px"><div class="tblwrap"><table class="ptable"><thead><tr><th>Done</th><th>#</th><th>Problem</th><th>Difficulty</th></tr></thead><tbody>${rows.map(p => `
    <tr class="${solved[p.n] ? 'solved' : ''}" data-n="${p.n}"><td class="ck"><input type="checkbox" aria-label="Mark ${esc(p.t)} solved" ${solved[p.n] ? 'checked' : ''}></td>
    <td class="num">${p.n}</td><td><button class="title">${esc(p.t)}</button>${p.prem ? ' <span class="pill prem" style="font-size:10.5px;padding:0 6px">Premium</span>' : ''}${showCat ? `<div class="catname">${catName(p.c)}</div>` : ''}</td>
    <td><span class="pill ${p.d}">${p.d}</span></td></tr>`).join('')}</tbody></table></div></div>`;
}
function wireTable(root) {
  $$('.ptable tr[data-n]', root).forEach(tr => {
    const n = +tr.dataset.n;
    $('input', tr).onchange = e => { setSolved(n, e.target.checked); tr.classList.toggle('solved', e.target.checked); };
    $('.title', tr).onclick = () => openProblem(n);
  });
}

function problemPage(sec, p) {
  const list = PROBS.filter(x => x.c === p.c), i = list.indexOf(p);
  const others = PCATS.filter(c => c[0] !== p.c).sort(() => Math.random() - .5).slice(0, 3);
  const opts = [...others, PCATS.find(c => c[0] === p.c)].sort(() => Math.random() - .5);
  sec.innerHTML = `<button class="backlink" id="pback">← ${catName(p.c)}</button>
    <div class="eyebrow">#${p.n} · ${catName(p.c)}</div><h1>${esc(p.t)}</h1>
    <div class="meta"><span class="pill ${p.d}">${p.d}</span>${p.prem ? '<span class="pill prem">LeetCode Premium</span>' : ''}
      <a class="btn sm" href="https://leetcode.com/problems/${p.s}/" target="_blank" rel="noopener">Open on LeetCode ↗</a>
      <label class="chk"><input type="checkbox" id="psolved" ${solved[p.n] ? 'checked' : ''}> Solved</label></div>
    <p class="lede">${p.sum}</p>
    <div class="out"><span class="panel-title">Example</span><div style="margin-top:4px;color:var(--ink)">${esc(p.ex)}</div></div>
    ${p.prem ? '<p class="section-sub" style="margin-top:10px">This one needs LeetCode Premium; free versions exist on NeetCode.io and LintCode.</p>' : ''}
    <h2 class="section-title">Think it through</h2><p class="section-sub">Try these before looking at the solution.</p>
    <div class="two">
      <div class="card"><h3>1 · Which pattern fits?</h3><div id="pq" style="margin-top:8px"></div><div id="pqr"></div></div>
      <div class="card"><h3>2 · Hints</h3><ol class="hints" id="hl" style="margin-top:10px"></ol><button class="btn sm" id="hb"></button></div>
    </div>
    <h2 class="section-title">Solution</h2><div id="sol"></div>
    <div class="foot"><button class="btn" id="pprev" ${i === 0 ? 'disabled' : ''}>← ${i > 0 ? esc(list[i - 1].t) : 'Previous'}</button><button class="btn" id="pnext" ${i === list.length - 1 ? 'disabled' : ''}>${i < list.length - 1 ? esc(list[i + 1].t) : 'Next'} →</button></div>`;
  ask($('#pq', sec), 'Before reading the hints: which NeetCode pattern does this problem belong to?', opts.map(c => [c[1], c[0]]), p.c, ok => {
    $('#pqr', sec).innerHTML = `<p style="margin:0"><b class="${ok ? 'ok' : 'no'}">${ok ? 'Correct.' : 'Not quite.'}</b> It’s <b>${catName(p.c)}</b>. ${CAT_LEDE[p.c]}</p>`;
  });
  let shown = 0;
  const drawHints = () => {
    $('#hl', sec).innerHTML = p.h.slice(0, shown).map(h => `<li>${h}</li>`).join('');
    const b = $('#hb', sec);
    b.hidden = shown >= p.h.length;
    b.textContent = `Show hint ${shown + 1} of ${p.h.length}`;
    if (!shown) $('#hl', sec).innerHTML = '<li style="list-style:none;margin-left:-20px;color:var(--muted)">Hints get more specific as you go.</li>';
  };
  $('#hb', sec).onclick = () => { shown++; drawHints(); };
  drawHints();
  const sol = $('#sol', sec);
  const reveal = () => {
    sol.innerHTML = `<div class="ref-grid">
      <div class="card"><h3>Approach</h3><p style="margin:0">${p.app}</p></div>
      <div class="card"><h3>Complexity</h3><table class="cx"><tbody><tr><th>Time</th><td class="bo">${p.tc}</td></tr><tr><th>Space</th><td class="bo">${p.sc}</td></tr></tbody></table>
        ${(p.rel || []).filter(k => ALGOS[k]).length ? `<div class="panel-title" style="margin-top:14px">Related algorithms</div><div class="linkchips" id="prel">${p.rel.filter(k => ALGOS[k]).map(k => `<button data-k="${k}">${esc(ALGOS[k].name)}</button>`).join('')}</div>` : ''}</div>
    </div><div id="pcode"></div>`;
    codeCard($('#pcode', sec), { python: p.py, javascript: p.js, java: p.java, cpp: p.cpp }, 'Solution code');
    $$('#prel button', sec).forEach(b => b.onclick = () => openAlgo(b.dataset.k));
  };
  sol.innerHTML = `<div class="card spoiler"><p>Give it a real try on LeetCode first. When you’re ready, reveal the approach, its time and space complexity, and the solution in Python, JavaScript, Java and C++.</p><button class="btn primary" id="reveal">Reveal solution</button></div>`;
  $('#reveal', sec).onclick = reveal;
  $('#psolved', sec).onchange = e => setSolved(p.n, e.target.checked);
  $('#pback', sec).onclick = () => { cur.prob = null; go(); };
  $('#pprev', sec).onclick = () => openProblem(list[i - 1].n);
  $('#pnext', sec).onclick = () => openProblem(list[i + 1].n);
}

function categoryPage(sec, id, idx) {
  const list = PROBS.filter(p => p.c === id);
  const done = list.filter(p => solved[p.n]).length;
  const algos = [...new Set(list.flatMap(p => p.rel || []))].filter(k => ALGOS[k] && ALGOS[k].cat);
  sec.innerHTML = `<div class="eyebrow">Pattern ${idx} of ${PCATS.length}</div><h1>${catName(id)}</h1>
    <p class="lede">${CAT_LEDE[id]}</p>
    <div class="stats" style="margin-bottom:14px"><span>Solved <b>${done} / ${list.length}</b></span>${['Easy', 'Medium', 'Hard'].map(d => { const c = list.filter(p => p.d === d).length; return c ? `<span>${d} <b>${c}</b></span>` : ''; }).join('')}</div>
    ${problemTable(list, false)}
    ${algos.length ? `<h2 class="section-title">Algorithms behind this pattern</h2><p class="section-sub">Open one to step through a worked example.</p><div class="linkchips" id="calgos">${algos.map(k => `<button data-k="${k}">${esc(ALGOS[k].name)}</button>`).join('')}</div>` : ''}`;
  wireTable(sec);
  $$('#calgos button', sec).forEach(b => b.onclick = () => openAlgo(b.dataset.k));
}

function overviewPage(sec) {
  const total = PROBS.length, done = PROBS.filter(p => solved[p.n]).length;
  sec.innerHTML = `<div class="eyebrow">Problem sets</div><h1>NeetCode 150</h1>
    <p class="lede">The 150 most-practiced interview problems, grouped into 18 patterns. Each has an original summary, progressive hints, a pattern quiz, the approach with time and space complexity, and solutions in four languages. Full problem statements are on LeetCode.</p>
    <div class="stat3"><div class="card"><div class="big">${done}<span style="font-size:15px;color:var(--muted)"> / ${total}</span></div><div class="lbl">Solved</div></div>
    ${['Easy', 'Medium', 'Hard'].map(d => { const all = PROBS.filter(p => p.d === d); return `<div class="card"><div class="big">${all.filter(p => solved[p.n]).length}<span style="font-size:15px;color:var(--muted)"> / ${all.length}</span></div><div class="lbl"><span class="pill ${d}">${d}</span></div></div>`; }).join('')}</div>
    <div class="row" style="margin:16px 0 4px"><button class="btn primary" id="prand">Pick a random unsolved problem</button></div>
    <h2 class="section-title">Patterns</h2><p class="section-sub">A sensible order is top to bottom: later patterns build on earlier ones.</p>
    <div class="catgrid">${PCATS.map(([id, name], i) => { const l = PROBS.filter(p => p.c === id), d = l.filter(p => solved[p.n]).length; return `<button class="catcard" data-i="${i + 1}"><span class="top2">${name}<span>${d}/${l.length}</span></span><div class="prog"><span style="width:${d / l.length * 100}%"></span></div></button>`; }).join('')}</div>
    <h2 class="section-title">Search all problems</h2>
    <div class="row" style="margin-bottom:10px"><input type="search" id="psq" placeholder="Title or LeetCode number" aria-label="Search problems">
      <select id="psd" aria-label="Difficulty"><option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
      <select id="pss" aria-label="Status"><option value="">Any status</option><option value="todo">Not solved</option><option value="done">Solved</option></select></div>
    <div id="presults"></div>`;
  const draw = () => {
    const q = $('#psq', sec).value.trim().toLowerCase(), d = $('#psd', sec).value, s = $('#pss', sec).value;
    const rows = PROBS.filter(p => (!q || p.t.toLowerCase().includes(q) || String(p.n) === q) && (!d || p.d === d) && (!s || (s === 'done') === !!solved[p.n]));
    $('#presults', sec).innerHTML = rows.length ? problemTable(rows, true) : '<p class="empty">No problems match those filters.</p>';
    wireTable(sec);
  };
  ['#psq', '#psd', '#pss'].forEach(x => $(x, sec).oninput = draw);
  draw();
  $$('.catcard', sec).forEach(b => b.onclick = () => { cur.problems = +b.dataset.i; cur.prob = null; go(); });
  $('#prand', sec).onclick = () => {
    const todo = PROBS.filter(p => !solved[p.n]);
    if (!todo.length) { $('#prand', sec).textContent = 'All 150 solved!'; return; }
    openProblem(todo[rnd(0, todo.length - 1)].n);
  };
}

const PROB_LESSONS = [
  { id: 'p-overview', title: 'Overview', full: true, render: overviewPage, count: () => `${PROBS.filter(p => solved[p.n]).length}/${PROBS.length}` },
  ...PCATS.map(([id, name], i) => ({
    id: 'p-' + id, title: name, full: true, cat: id,
    count: () => { const l = PROBS.filter(p => p.c === id); return `${l.filter(p => solved[p.n]).length}/${l.length}`; },
    render: sec => {
      const p = cur.prob && PROBS.find(x => x.n === cur.prob && x.c === id);
      if (p) problemPage(sec, p); else categoryPage(sec, id, i + 1);
    }
  }))
];

