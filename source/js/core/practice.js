/* ===== Problems: run your code against tests, brute-force baseline, notes, timer and spaced review ===== */
const PYODIDE_URL = 'https://cdn.jsdelivr.net/npm/pyodide@0.26.4/';
const pstore = {
  code: () => store.get('bf-code', {}), notes: () => store.get('bf-notes', {}), review: () => store.get('bf-review', {}), times: () => store.get('bf-ptime', {})
};
const todayStr = (d = 0) => { const t = new Date(); t.setHours(0, 0, 0, 0); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const reviewDue = () => { const r = pstore.review(), t = todayStr(); return PROBS.filter(p => r[p.n] && r[p.n].due <= t); };

/* starter code built from the reference solution's signatures */
function jsStarter(src) {
  const out = [], lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^(async )?function \w+\(.*\)\s*\{\s*$/.test(l)) out.push(l, '  // your code here', '}', '');
    else if (/^class \w+/.test(l)) {
      out.push(l.replace(/\{.*$/, '{'));
      for (let j = i + 1; j < lines.length && !/^\}/.test(lines[j]); j++) { const m = lines[j].match(/^  ((?:static )?\w+\(.*?\))\s*\{/); if (m) out.push('  ' + m[1] + ' {', '    // your code here', '  }'); }
      out.push('}', '');
    }
  }
  return out.join('\n').trim() + '\n' || '// write your solution\n';
}
function pyStarter(src) {
  const out = [];
  for (const l of src.split('\n')) {
    if (/^class \w+.*:\s*$/.test(l)) out.push((out.length ? '\n' : '') + l);
    else if (/^    def \w+\(.*\).*:\s*(#.*)?$/.test(l)) out.push(l.replace(/\s*#.*$/, ''), '        pass');
    else if (/^def \w+\(.*\).*:\s*$/.test(l)) out.push(l, '    pass');
  }
  return out.join('\n') + '\n';
}

/* ---------- execution ---------- */
let pyWorker = null, pyReady = false, pyMain = null;
function jsWorkerSource() { return `${RUNNER_CORE.toString()}\nRUNNER_CORE();\nonmessage = e => { let r; try { r = self.bfRunJS(e.data.code, e.data.spec); } catch (err) { r = { compile: String(err) }; } postMessage(r); };`; }
function runJS(code, spec) {
  return new Promise(resolve => {
    let w;
    try { w = new Worker(URL.createObjectURL(new Blob([jsWorkerSource()], { type: 'text/javascript' }))); }
    catch (e) { // no workers allowed: run on the page, then restore globals we touched
      const saved = { Node: window.Node, ListNode: window.ListNode, TreeNode: window.TreeNode };
      try { RUNNER_CORE(); resolve(self.bfRunJS(code, spec)); } catch (err) { resolve({ compile: String(err) }); }
      finally { Object.assign(window, saved); }
      return;
    }
    const t = setTimeout(() => { w.terminate(); resolve({ compile: 'Timed out after 4 s. Is there an infinite loop?' }); }, 4000);
    w.onmessage = e => { clearTimeout(t); w.terminate(); resolve(e.data); };
    w.onerror = e => { clearTimeout(t); w.terminate(); resolve({ compile: e.message || 'Worker error' }); e.preventDefault && e.preventDefault(); };
    w.postMessage({ code, spec });
  });
}
function pyWorkerSource() {
  return `importScripts(${JSON.stringify(PYODIDE_URL + 'pyodide.js')});
let py = null;
const ready = (async () => { py = await loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_URL)} }); py.runPython(${JSON.stringify(PY_PRELUDE)}); postMessage({ ready: true }); })().catch(e => postMessage({ loadError: String(e) }));
onmessage = async e => { await ready; try { postMessage(JSON.parse(py.globals.get('_bf_run')(e.data.code, JSON.stringify(e.data.spec)))); } catch (err) { postMessage({ compile: String(err) }); } };`;
}
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(s); }); }
async function runPy(code, spec, status) {
  if (pyMain) { try { return JSON.parse(pyMain.globals.get('_bf_run')(code, JSON.stringify(spec))); } catch (e) { return { compile: String(e) }; } }
  if (!pyWorker) {
    try { pyWorker = new Worker(URL.createObjectURL(new Blob([pyWorkerSource()], { type: 'text/javascript' }))); pyReady = false; }
    catch (e) { // fall back to running Pyodide on the page
      status('Loading Python (first run only, about 10 MB)…');
      try { await loadScript(PYODIDE_URL + 'pyodide.js'); pyMain = await loadPyodide({ indexURL: PYODIDE_URL }); pyMain.runPython(PY_PRELUDE); }
      catch (err) { return { compile: 'Python could not be loaded: ' + err.message }; }
      return runPy(code, spec, status);
    }
  }
  if (!pyReady) status('Loading Python (first run only, about 10 MB)…');
  return new Promise(resolve => {
    const w = pyWorker;
    const t = setTimeout(() => { w.terminate(); pyWorker = null; resolve({ compile: pyReady ? 'Timed out after 10 s. Is there an infinite loop?' : 'Python took too long to load. Check your connection and try again.' }); }, pyReady ? 10000 : 90000);
    w.onmessage = e => {
      if (e.data.ready) { pyReady = true; status('Running…'); clearTimeout(t); setTimeout(() => { if (!done) { w.terminate(); pyWorker = null; resolve({ compile: 'Timed out after 10 s. Is there an infinite loop?' }); } }, 10000); return; }
      if (e.data.loadError) { clearTimeout(t); w.terminate(); pyWorker = null; done = true; resolve({ compile: 'Python could not be loaded: ' + e.data.loadError }); return; }
      clearTimeout(t); done = true; resolve(e.data);
    };
    let done = false;
    w.onerror = e => { clearTimeout(t); w.terminate(); const was = pyReady; pyWorker = null; done = true; resolve({ compile: (was ? '' : 'Python could not be loaded (the first run needs an internet connection to download Pyodide). ') + (e.message || 'Python worker error') }); e.preventDefault && e.preventDefault(); };
    w.postMessage({ code, spec });
  });
}

/* ---------- problem page additions ---------- */
const _baseProblemPage = problemPage;
problemPage = function (sec, p) {
  _baseProblemPage(sec, p);
  const b = BRUTE[p.n];
  const two = $('.two', sec);
  if (two && b) two.insertAdjacentHTML('afterend', `<details class="card brute" style="margin-top:12px"><summary><b>3 · Brute force first</b> <span class="section-sub">State the simple solution and its cost before optimizing.</span></summary>
    <p style="margin:10px 0 6px">${b[0]}</p><div class="cxstrip" style="margin:0"><span><small>Time</small><b>${b[1]}</b></span><span><small>Space</small><b>${b[2]}</b></span><span><small>Optimal</small><b>${p.tc} · ${p.sc}</b></span></div></details>`);
  const solH = $('#sol', sec).previousElementSibling;
  const t = p.test, nCases = t ? (t.design ? t.seqs.length : t.cases.length) : 0;
  solH.insertAdjacentHTML('beforebegin', `${t ? `<h2 class="section-title">Run it</h2><p class="section-sub">Write your solution and run it against ${nCases} test case${nCases === 1 ? '' : 's'} right here. JavaScript runs instantly; Python downloads a Python runtime (about 10 MB) the first time.</p>
    <div class="card runcard">
      <div class="code-head"><div class="langs" role="group" aria-label="Language" id="rlang"><button data-l="javascript">JavaScript</button><button data-l="python">Python</button></div>
        <span class="timer" id="rtimer" aria-live="off">0:00</span><button class="btn sm" id="rtstart">Start timer</button></div>
      <textarea id="rcode" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Your solution"></textarea>
      <div class="row" style="margin-top:10px"><button class="btn primary" id="rrun">Run tests</button><button class="btn sm" id="rstub">Reset to starter</button><button class="btn sm" id="rref">Load reference solution</button><span id="rstat" class="section-sub" style="margin:0"></span></div>
      <div id="rout"></div></div>` : ''}
    <h2 class="section-title">Notes & review</h2>
    <div class="two"><div class="card"><h3>Your notes</h3><textarea id="pnotes" class="notes" placeholder="Key insight, mistakes you made, edge cases to remember…" aria-label="Notes"></textarea><p class="section-sub" style="margin:6px 0 0">Saved in this browser; included in Export progress.</p></div>
      <div class="card"><h3>Spaced review</h3><p id="prevst" style="margin:6px 0 10px"></p><div class="chipbar" id="prevb">${[[1, 'Tomorrow'], [3, 'In 3 days'], [7, 'In a week'], [14, 'In 2 weeks']].map(([d, l]) => `<button data-d="${d}">${l}</button>`).join('')}<button data-d="0">Remove</button></div>
        <p class="section-sub" id="pbest" style="margin:10px 0 0"></p></div></div>`);
  /* notes */
  const notes = $('#pnotes', sec); notes.value = pstore.notes()[p.n] || '';
  notes.oninput = () => { const all = pstore.notes(); if (notes.value.trim()) all[p.n] = notes.value; else delete all[p.n]; store.set('bf-notes', all); };
  /* review */
  const drawReview = () => {
    const r = pstore.review()[p.n], best = pstore.times()[p.n];
    $('#prevst', sec).innerHTML = r ? `Next review: <b>${r.due <= todayStr() ? 'due now' : r.due}</b> (interval ${r.iv} day${r.iv === 1 ? '' : 's'}).` : 'Not scheduled. Pick when to see this problem again; it will appear in the Review queue.';
    $('#pbest', sec).textContent = best ? `Your best time to a passing solution: ${Math.floor(best / 60)}:${String(best % 60).padStart(2, '0')}.` : '';
  };
  $$('#prevb button', sec).forEach(bt => bt.onclick = () => { const all = pstore.review(), d = +bt.dataset.d; if (d) all[p.n] = { due: todayStr(d), iv: d }; else delete all[p.n]; store.set('bf-review', all); drawReview(); renderTrack(); });
  drawReview();
  if (!t) return;
  /* editor */
  let rl = store.get('bf-runlang', 'javascript');
  const ed = $('#rcode', sec), key = () => p.n + ':' + rl;
  const starter = () => rl === 'python' ? pyStarter(p.py) : jsStarter(p.js);
  const load = () => { ed.value = pstore.code()[key()] || starter(); $$('#rlang button', sec).forEach(x => x.setAttribute('aria-pressed', x.dataset.l === rl)); };
  const save = () => { const all = pstore.code(); if (ed.value.trim() && ed.value !== starter()) all[key()] = ed.value; else delete all[key()]; store.set('bf-code', all); };
  ed.oninput = save;
  ed.onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText(rl === 'python' ? '    ' : '  ', s, ed.selectionEnd, 'end'); save(); } if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') $('#rrun', sec).click(); };
  $$('#rlang button', sec).forEach(x => x.onclick = () => { rl = x.dataset.l; store.set('bf-runlang', rl); load(); });
  $('#rstub', sec).onclick = () => { ed.value = starter(); save(); };
  $('#rref', sec).onclick = () => { ed.value = rl === 'python' ? p.py : p.js; save(); };
  load();
  /* timer */
  let t0 = null, tick = null;
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  $('#rtstart', sec).onclick = () => {
    if (tick) { clearInterval(tick); tick = null; $('#rtstart', sec).textContent = 'Start timer'; return; }
    t0 = Date.now(); $('#rtstart', sec).textContent = 'Stop';
    tick = setInterval(() => { if (!document.body.contains(ed)) { clearInterval(tick); return; } $('#rtimer', sec).textContent = fmt(Math.round((Date.now() - t0) / 1000)); }, 1000);
  };
  /* run */
  const status = m => { $('#rstat', sec).textContent = m; };
  $('#rrun', sec).onclick = async () => {
    const [spec, exp, labels] = bfSpec(t), btn = $('#rrun', sec);
    btn.disabled = true; status('Running…'); $('#rout', sec).innerHTML = '';
    const res = rl === 'python' ? await runPy(ed.value, spec, status) : await runJS(ed.value, spec);
    btn.disabled = false;
    if (res.compile) { status(''); $('#rout', sec).innerHTML = `<div class="runerr"><b>Couldn’t run your code.</b><pre>${esc(res.compile)}</pre></div>`; return; }
    const rows = res.results.map((r, i) => ({ ok: r.ok && bfSame(r.v, exp[i], t.cmp), label: labels[i], exp: JSON.stringify(exp[i]), got: r.ok ? JSON.stringify(r.v) : r.err }));
    const passed = rows.filter(r => r.ok).length, all = passed === rows.length;
    status('');
    let extra = '';
    if (all) {
      if (!solved[p.n]) { setSolved(p.n, true); $('#psolved', sec).checked = true; }
      if (tick) { const s = Math.round((Date.now() - t0) / 1000), times = pstore.times(); if (!times[p.n] || s < times[p.n]) { times[p.n] = s; store.set('bf-ptime', times); } clearInterval(tick); tick = null; $('#rtstart', sec).textContent = 'Start timer'; extra = ` Time: ${fmt(s)}.`; drawReview(); }
    }
    const cut = s => esc(s.length > 140 ? s.slice(0, 137) + '…' : s);
    $('#rout', sec).innerHTML = `<p class="runsum ${all ? 'ok' : 'no'}"><b>${passed} / ${rows.length} passed.</b>${all ? ' Marked as solved.' + extra : ''}</p>
      <div class="tblwrap"><table class="runtbl"><thead><tr><th></th><th>Call</th><th>Expected</th><th>Got</th></tr></thead><tbody>${rows.map(r => `<tr class="${r.ok ? 'pass' : 'fail'}"><td>${r.ok ? '✓' : '✗'}</td><td class="mono">${cut(r.label)}</td><td class="mono">${cut(r.exp)}</td><td class="mono">${cut(r.got)}</td></tr>`).join('')}</tbody></table></div>`;
  };
};

/* ---------- review queue ---------- */
function reviewPage(sec) {
  const r = pstore.review(), t = todayStr();
  const marked = PROBS.filter(p => r[p.n]).sort((a, b) => r[a.n].due < r[b.n].due ? -1 : 1);
  const due = marked.filter(p => r[p.n].due <= t), later = marked.filter(p => r[p.n].due > t);
  const row = p => `<tr><td class="mono">#${p.n}</td><td><button class="inline-link" data-open="${p.n}">${esc(p.t)}</button></td><td><span class="pill ${p.d}">${p.d}</span></td><td>${r[p.n].due <= t ? '<b>due</b>' : r[p.n].due}</td>
    <td><div class="chipbar"><button data-ok="${p.n}">Got it</button><button data-again="${p.n}">Again</button></div></td></tr>`;
  sec.innerHTML = `<div class="eyebrow">Problems · spaced review</div><h1>Review queue</h1>
    <p class="lede">Problems come back on a schedule: “Got it” doubles the interval (1 → 2 → 4 → 8… days), “Again” brings it back tomorrow. Schedule problems from the Notes & review card on any problem page.</p>
    <div class="stats" style="margin-bottom:14px"><span>Due today <b>${due.length}</b></span><span>Scheduled <b>${marked.length}</b></span><span>Solved <b>${PROBS.filter(p => solved[p.n]).length}</b></span></div>
    ${marked.length ? `<div class="card" style="padding:4px 6px"><div class="tblwrap"><table class="ptable"><thead><tr><th>#</th><th>Problem</th><th>Difficulty</th><th>Due</th><th>Review</th></tr></thead><tbody>${[...due, ...later].map(row).join('')}</tbody></table></div></div>`
      : `<div class="card"><p style="margin:0">Nothing scheduled yet. Open a problem, solve it, and choose when to review it.</p></div>`}
    <h2 class="section-title">Suggested next</h2><p class="section-sub">Unsolved problems from patterns you have started.</p>
    <div class="linkchips" id="rvnext">${PROBS.filter(p => !solved[p.n] && PROBS.some(q => q.c === p.c && solved[q.n])).slice(0, 8).map(p => `<button data-open="${p.n}"><small>#${p.n}</small>${esc(p.t)}</button>`).join('') || '<span class="section-sub">Solve a problem in any pattern to get suggestions.</span>'}</div>`;
  $$('[data-open]', sec).forEach(b => b.onclick = () => openProblem(+b.dataset.open));
  $$('[data-ok]', sec).forEach(b => b.onclick = () => { const all = pstore.review(), n = +b.dataset.ok, iv = Math.min(60, (all[n].iv || 1) * 2); all[n] = { due: todayStr(iv), iv }; store.set('bf-review', all); renderTrack(); reviewPage(sec); });
  $$('[data-again]', sec).forEach(b => b.onclick = () => { const all = pstore.review(), n = +b.dataset.again; all[n] = { due: todayStr(1), iv: 1 }; store.set('bf-review', all); renderTrack(); reviewPage(sec); });
}
PROB_LESSONS.push({ id: 'p-review', title: 'Review queue', full: true, render: reviewPage, count: () => { const d = reviewDue().length; return d ? d + ' due' : ''; } });
