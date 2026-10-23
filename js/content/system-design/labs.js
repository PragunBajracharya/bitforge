/* ===== System design interactive labs ===== */
const mulberry = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hnum = n => { const a = Math.abs(n); if (a >= 1e12) return (n / 1e12).toFixed(a >= 1e13 ? 0 : 1) + 'T'; if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 0 : 1) + 'B'; if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M'; if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'K'; return (Math.round(n * 10) / 10).toString(); };
const hbytes = kb => { const u = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB']; let v = kb, i = 0; while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; } return (v >= 100 ? v.toFixed(0) : v.toFixed(1)) + ' ' + u[i]; };
function sparkline(vals, w, h, max, cls) {
  const m = max || Math.max(1, ...vals);
  if (vals.length < 2) return `<svg class="chart" viewBox="0 0 ${w} ${h}"></svg>`;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - 4 - (v / m) * (h - 8)).toFixed(1)}`).join(' ');
  return `<svg class="chart ${cls || ''}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line class="ax" x1="0" y1="${h - 4}" x2="${w}" y2="${h - 4}"/><polyline points="${pts}" fill="none" stroke="var(--track)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}
function labHash32(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16;
  return h >>> 0;
}
const SRV_COLORS = ['#2E86AB', '#E4572E', '#5FA83A', '#9C51B6', '#E0A100', '#14A3A0', '#D7263D', '#7A7A7A'];

const sdLessons = [

/* ---------- 1. Estimation calculator ---------- */
{ id: 'sd-estimate', title: 'Estimation calculator', lede: 'Change the assumptions and watch QPS, storage, bandwidth and server counts update, with the arithmetic shown. Then compare how long common operations take.',
  render(root) {
    const PRE = {
      'Social feed': { dau: 100e6, act: 20, wp: 5, peak: 3, wkb: 1, rkb: 20, yrs: 5, rep: 3, srv: 2000 },
      'URL shortener': { dau: 20e6, act: 5, wp: 1, peak: 2, wkb: 0.5, rkb: 0.5, yrs: 5, rep: 3, srv: 5000 },
      'Chat app': { dau: 500e6, act: 80, wp: 50, peak: 2, wkb: 0.1, rkb: 0.1, yrs: 1, rep: 3, srv: 5000 },
      'Photo sharing': { dau: 10e6, act: 50, wp: 0.2, peak: 3, wkb: 1000, rkb: 200, yrs: 10, rep: 3, srv: 1000 }
    };
    const F = [['dau', 'Daily active users'], ['act', 'Requests per user per day'], ['wp', 'Writes (% of requests)'], ['peak', 'Peak ÷ average'], ['wkb', 'Bytes stored per write (KB)'], ['rkb', 'Response size (KB)'], ['yrs', 'Retention (years)'], ['rep', 'Replication factor'], ['srv', 'Requests/s per server']];
    root.innerHTML = `<div class="bench">
      <div class="chipbar" id="epre">${Object.keys(PRE).map((k, i) => `<button data-p="${k}" aria-pressed="${!i}">${k}</button>`).join('')}</div>
      <div class="lab-grid">${F.map(([k, l]) => `<label><span>${l}</span><input type="number" min="0" step="any" id="e_${k}"></label>`).join('')}</div>
      <div class="stat3" id="eres"></div>
      <div class="card"><div class="panel-title">The arithmetic</div><ol class="xsteps" id="ecalc" style="margin:0"></ol></div>
    </div>
    <h2 class="section-title">Latency, to scale</h2><p class="section-sub">Bars are on a logarithmic scale: each step right is 10× slower.</p>
    <div class="card lat" id="elat"></div>`;
    const set = p => F.forEach(([k]) => { $('#e_' + k, root).value = PRE[p][k]; });
    const calc = () => {
      const v = {}; F.forEach(([k]) => v[k] = Math.max(0, +$('#e_' + k, root).value || 0));
      const rpd = v.dau * v.act, avg = rpd / 86400, peak = avg * v.peak, wps = avg * v.wp / 100;
      const sday = rpd * v.wp / 100 * v.wkb, syr = sday * 365, stot = syr * v.yrs * v.rep;
      const egress = peak * (1 - v.wp / 100) * v.rkb, gbps = egress * 8 / 1e6;
      const servers = v.srv ? Math.ceil(peak / v.srv) : 0, withHead = Math.ceil(servers / 0.6);
      $('#eres', root).innerHTML = [['Average QPS', hnum(avg)], ['Peak QPS', hnum(peak)], ['Writes/s (avg)', hnum(wps)], ['Storage per year', hbytes(syr)], [`Total stored (${v.yrs} y × ${v.rep})`, hbytes(stot)], ['Peak egress', `${hbytes(egress)}/s`], ['Peak egress (bits)', `${gbps >= 1 ? gbps.toFixed(1) + ' Gbps' : (gbps * 1000).toFixed(0) + ' Mbps'}`], ['Servers at peak', `${servers} (run ≈ ${withHead})`]]
        .map(([l, b]) => `<div class="card"><div class="big">${b}</div><div class="lbl">${l}</div></div>`).join('');
      $('#ecalc', root).innerHTML = [`Requests/day = ${hnum(v.dau)} users × ${v.act} = <b>${hnum(rpd)}</b>`, `Average QPS = ${hnum(rpd)} ÷ 86,400 s = <b>${hnum(avg)}</b>`, `Peak QPS = ${hnum(avg)} × ${v.peak} = <b>${hnum(peak)}</b>`, `Storage/day = ${hnum(rpd)} × ${v.wp}% writes × ${v.wkb} KB = <b>${hbytes(sday)}</b>; × 365 = <b>${hbytes(syr)}</b> per year`, `Egress = ${hnum(peak)} × ${100 - v.wp}% reads × ${v.rkb} KB = <b>${hbytes(egress)}/s</b> ≈ ${gbps.toFixed(2)} Gbps`, `Servers = ${hnum(peak)} ÷ ${hnum(v.srv)} per server = <b>${servers}</b>; at 60% target utilization ≈ <b>${withHead}</b>`,
        egress > 1e6 ? `<b>Design hint:</b> over ~1 GB/s of egress means content must be served by a CDN, not your app servers.` : `<b>Design hint:</b> egress is modest; app servers plus a cache can serve it.`,
        wps > 10000 ? `<b>Design hint:</b> more than ~10K writes/s needs a write-scalable store (sharding, LSM-based databases).` : `<b>Design hint:</b> ${hnum(wps)} writes/s fits a single well-tuned primary database with replicas.`].map(x => `<li>${x}</li>`).join('');
    };
    $$('#epre button', root).forEach(b => b.onclick = () => { $$('#epre button', root).forEach(x => x.setAttribute('aria-pressed', x === b)); set(b.dataset.p); calc(); });
    F.forEach(([k]) => $('#e_' + k, root).oninput = calc);
    set('Social feed'); calc();
    const LAT = [['L1 cache reference', 1], ['Main memory reference', 100], ['Compress 1 KB', 2000], ['Read 1 MB from RAM', 3000], ['SSD random read (4 KB)', 16000], ['Read 1 MB from SSD', 49000], ['Datacenter round trip', 500000], ['Read 1 MB from disk', 825000], ['Disk seek', 2000000], ['US ↔ Europe round trip', 150000000]];
    const fmtNs = n => n >= 1e6 ? (n / 1e6) + ' ms' : n >= 1e3 ? (n / 1e3) + ' µs' : n + ' ns';
    $('#elat', root).innerHTML = LAT.map(([l, ns]) => `<div class="r"><span>${l}</span><b>${fmtNs(ns)}</b><span class="bar" style="width:${Math.max(2, Math.log10(ns) / Math.log10(2e8) * 100).toFixed(1)}%"></span></div>`).join('');
  } },

/* ---------- 2. Load balancer simulator ---------- */
{ id: 'sd-lb', title: 'Load balancer simulator', lede: 'Four servers, each able to work on four requests at once. Pick an algorithm, change the traffic, kill a server, and watch queues, latency and errors.',
  render(root) {
    root.innerHTML = `<div class="bench">
      <div class="lab-grid">
        <label><span>Algorithm</span><select id="lalg"><option value="rr">Round robin</option><option value="lc">Least connections</option><option value="p2">Power of two choices</option><option value="rand">Random</option><option value="hash">Hash (client ID)</option></select></label>
        <label><span>Traffic: <b id="lratev">60</b> req/s</span><input type="range" id="lrate" min="10" max="150" value="60"></label>
        <label><span>Request mix</span><select id="lmix"><option value="u">Uniform ≈ 100 ms</option><option value="h">Mixed: 15% take 1.5 s</option></select></label>
      </div>
      <div class="srvrow" id="lsrv"></div>
      <div class="stat3" id="lstat"></div>
      <div class="card"><div class="panel-title">p95 latency, last 30 s</div><div id="lspark"></div></div>
    </div>`;
    const rnd = mulberry(7);
    const S = [0, 1, 2, 3].map(i => ({ name: 'Server ' + 'ABCD'[i], up: true, healthy: true, active: [], queue: [], handled: 0 }));
    let rr = 0, tick = 0, acc = 0, errors = 0, done1s = 0, doneRate = 0;
    const lats = [], p95s = [];
    const pick = cid => {
      const H = S.filter(s => s.healthy); if (!H.length) return null;
      const load = s => s.active.length + s.queue.length;
      const alg = $('#lalg', root).value;
      if (alg === 'rr') return H[(rr++) % H.length];
      if (alg === 'lc') return H.reduce((a, b) => load(b) < load(a) ? b : a);
      if (alg === 'rand') return H[Math.floor(rnd() * H.length)];
      if (alg === 'p2') { const a = H[Math.floor(rnd() * H.length)], b = H[Math.floor(rnd() * H.length)]; return load(b) < load(a) ? b : a; }
      return H[cid % H.length];
    };
    const step = () => {
      tick++;
      const rate = +$('#lrate', root).value; $('#lratev', root).textContent = rate;
      acc += rate / 10;
      while (acc >= 1) {
        acc--;
        const heavy = $('#lmix', root).value === 'h' && rnd() < 0.15;
        const dur = heavy ? 1500 : 70 + Math.floor(rnd() * 60);
        const cid = Math.floor(Math.pow(rnd(), 2) * 40);   // skewed clients
        const s = pick(cid);
        if (!s) { errors++; continue; }
        if (!s.up) { errors++; continue; }                  // LB hasn't noticed yet
        s.queue.push({ t0: tick * 100, dur });
      }
      S.forEach(s => {
        if (!s.up) return;
        s.active = s.active.map(r => ({ ...r, left: r.left - 100 })).filter(r => { if (r.left <= 0) { lats.push(tick * 100 - r.t0); s.handled++; done1s++; return false; } return true; });
        while (s.active.length < 4 && s.queue.length) { const r = s.queue.shift(); s.active.push({ ...r, left: r.dur }); }
      });
      if (lats.length > 400) lats.splice(0, lats.length - 400);
      if (tick % 20 === 0) S.forEach(s => s.healthy = s.up);   // health check every 2 s
      if (tick % 10 === 0) {
        doneRate = done1s; done1s = 0;
        const sorted = [...lats].sort((a, b) => a - b);
        p95s.push(sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0); if (p95s.length > 30) p95s.shift();
      }
      draw();
    };
    const draw = () => {
      $('#lsrv', root).innerHTML = S.map((s, i) => { const load = s.active.length + s.queue.length; return `<div class="srv ${s.up ? '' : 'down'}"><b>${s.name}</b><span>${s.up ? (s.healthy ? 'healthy' : 'recovering') : (s.healthy ? 'DOWN · LB unaware' : 'down · removed')}</span><div class="meter"><span style="width:${Math.min(100, load / 16 * 100)}%"></span></div><span>${s.active.length} busy · ${s.queue.length} queued</span><span>${fmt(s.handled)} handled</span><button class="btn sm" data-i="${i}">${s.up ? 'Kill' : 'Revive'}</button></div>`; }).join('');
      $$('#lsrv button', root).forEach(b => b.onclick = () => { const s = S[+b.dataset.i]; s.up = !s.up; if (!s.up) { errors += s.active.length + s.queue.length; s.active = []; s.queue = []; } draw(); });
      const sorted = [...lats].sort((a, b) => a - b), q = p => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0;
      $('#lstat', root).innerHTML = [['Completed / s', doneRate], ['p50 latency', q(0.5) + ' ms'], ['p95 latency', q(0.95) + ' ms'], ['Errors', errors]].map(([l, b]) => `<div class="card"><div class="big">${b}</div><div class="lbl">${l}</div></div>`).join('');
      $('#lspark', root).innerHTML = sparkline(p95s, 600, 70);
    };
    draw();
    const iv = setInterval(step, 100);
    cleanup = () => clearInterval(iv);
  } },

/* ---------- 3. Cache simulator ---------- */
{ id: 'sd-cache', title: 'Cache eviction lab', lede: 'Replay 20,000 requests with a realistic skew (a few keys are very popular) through four eviction policies, and see how cache size and skew change the hit rate.',
  render(root) {
    root.innerHTML = `<div class="bench">
      <div class="lab-grid">
        <label><span>Cache size: <b id="csv">100</b> of 1,000 keys</span><input type="range" id="cs" min="10" max="500" step="10" value="100"></label>
        <label><span>Popularity skew (Zipf s): <b id="czv">1.0</b></span><input type="range" id="cz" min="0" max="1.6" step="0.1" value="1"></label>
        <label><span>Workload</span><select id="cw"><option value="n">Normal traffic</option><option value="s">+ periodic full scans</option></select></label>
      </div>
      <div id="cbars" class="stack" style="gap:8px"></div>
      <div class="stat3" id="cstat"></div>
      <div class="card"><div class="panel-title">LRU hit rate as the cache grows (10 → 500 keys)</div><div id="ccurve"></div></div>
    </div>`;
    const N = 1000, REQ = 20000;
    const stream = (s, scans) => {
      const w = Array.from({ length: N }, (_, i) => 1 / Math.pow(i + 1, s)), tot = w.reduce((a, b) => a + b, 0);
      const cdf = []; let c = 0; for (const x of w) { c += x / tot; cdf.push(c); }
      const r = mulberry(42), out = [];
      for (let i = 0; i < REQ; i++) {
        if (scans && i % 4000 === 3000) { for (let k = 0; k < 600; k++) out.push(N - 1 - k); }
        const u = r(); let lo = 0, hi = N - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < u) lo = m + 1; else hi = m; } out.push(lo);
      }
      return out;
    };
    const sim = (reqs, size, pol) => {
      const r = mulberry(9); let hits = 0;
      if (pol === 'LRU') { const m = new Map(); for (const k of reqs) { if (m.has(k)) { hits++; m.delete(k); m.set(k, 1); } else { if (m.size >= size) m.delete(m.keys().next().value); m.set(k, 1); } } }
      else if (pol === 'FIFO') { const m = new Set(), q = []; let h = 0; for (const k of reqs) { if (m.has(k)) hits++; else { if (m.size >= size) m.delete(q[h++]); m.add(k); q.push(k); } } }
      else if (pol === 'Random') { const arr = [], pos = new Map(); for (const k of reqs) { if (pos.has(k)) { hits++; continue; } if (arr.length >= size) { const i = Math.floor(r() * arr.length), v = arr[i]; pos.delete(v); arr[i] = k; pos.set(k, i); } else { pos.set(k, arr.length); arr.push(k); } } }
      else { const cnt = new Map(); for (const k of reqs) { if (cnt.has(k)) { hits++; cnt.set(k, cnt.get(k) + 1); } else { if (cnt.size >= size) { let mk, mv = Infinity; for (const [kk, vv] of cnt) if (vv < mv) { mv = vv; mk = kk; } cnt.delete(mk); } cnt.set(k, 1); } } }
      return hits / reqs.length;
    };
    let timer;
    const run = () => {
      const size = +$('#cs', root).value, s = +$('#cz', root).value, scans = $('#cw', root).value === 's';
      $('#csv', root).textContent = size; $('#czv', root).textContent = s.toFixed(1);
      clearTimeout(timer);
      timer = setTimeout(() => {
        const reqs = stream(s, scans);
        const res = ['LRU', 'LFU', 'FIFO', 'Random'].map(p => [p, sim(reqs, size, p)]);
        const best = Math.max(...res.map(x => x[1]));
        $('#cbars', root).innerHTML = res.map(([p, h]) => `<div class="lat"><div class="r"><span><b style="font-family:var(--f-body);font-weight:600">${p}</b></span><b>${(h * 100).toFixed(1)}%</b><span class="bar" style="width:${(h * 100).toFixed(1)}%;${h === best ? '' : 'opacity:.55'}"></span></div></div>`).join('');
        const lru = res[0][1];
        $('#cstat', root).innerHTML = [['LRU hit rate', (lru * 100).toFixed(1) + '%'], ['Avg read latency', (lru * 0.5 + (1 - lru) * 5.5).toFixed(2) + ' ms'], ['DB reads at 10K QPS', hnum(10000 * (1 - lru)) + '/s'], ['Cache holds', (size / N * 100).toFixed(0) + '% of keys']].map(([l, b]) => `<div class="card"><div class="big">${b}</div><div class="lbl">${l}</div></div>`).join('');
        const curve = []; for (let z = 10; z <= 500; z += 35) curve.push(sim(reqs, z, 'LRU') * 100);
        $('#ccurve', root).innerHTML = sparkline(curve, 600, 80, 100);
      }, 30);
    };
    ['#cs', '#cz', '#cw'].forEach(id => $(id, root).oninput = run);
    run();
  } },

/* ---------- 4. Consistent hashing ring ---------- */
{ id: 'sd-ring', title: 'Consistent hashing lab', lede: 'Add and remove servers and watch how many of 2,000 keys move, compared with hash mod N. Raise the virtual-node count to see the load even out.',
  render(root) {
    root.innerHTML = `<div class="bench">
      <div class="row"><button class="btn primary" id="radd">+ Add server</button><button class="btn" id="rrem">− Remove last server</button>
        <label style="display:flex;gap:8px;align-items:center;font-size:14px"><span>Virtual nodes per server <b id="rvv">3</b></span><input type="range" id="rv" min="1" max="200" value="3"></label></div>
      <div class="two" style="align-items:start"><div id="rring"></div><div class="stack" style="gap:10px"><div id="rbars" class="stack" style="gap:6px"></div><div class="card" id="rmove"></div></div></div>
    </div>`;
    const KEYS = Array.from({ length: 2000 }, (_, i) => 'user:' + i).map(k => [k, labHash32(k)]);
    let servers = ['A', 'B', 'C'], prev = null, msg = 'Add or remove a server to see how many keys move.';
    const build = () => { const v = +$('#rv', root).value, pts = []; servers.forEach(s => { for (let i = 0; i < v; i++) pts.push([labHash32(s + '#' + i), s]); }); return pts.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1)); };
    const assign = pts => KEYS.map(([, h]) => { let lo = 0, hi = pts.length; while (lo < hi) { const m = (lo + hi) >> 1; if (pts[m][0] < h) lo = m + 1; else hi = m; } return pts[lo % pts.length][1]; });
    const draw = () => {
      $('#rvv', root).textContent = $('#rv', root).value;
      const pts = build(), own = assign(pts);
      const R = 130, C = 160, ang = h => h / 4294967296 * Math.PI * 2 - Math.PI / 2;
      const col = s => SRV_COLORS['ABCDEFGH'.indexOf(s)];
      let svg = `<svg class="ring" viewBox="0 0 320 320" role="img" aria-label="Hash ring with ${servers.length} servers"><circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="var(--line)" stroke-width="10"/>`;
      KEYS.slice(0, 240).forEach(([, h], i) => { const a = ang(h); svg += `<line x1="${C + Math.cos(a) * (R - 5)}" y1="${C + Math.sin(a) * (R - 5)}" x2="${C + Math.cos(a) * (R + 5)}" y2="${C + Math.sin(a) * (R + 5)}" stroke="${col(own[i])}" stroke-width="1.4" opacity=".75"/>`; });
      pts.forEach(([h, s]) => { const a = ang(h); svg += `<circle cx="${C + Math.cos(a) * R}" cy="${C + Math.sin(a) * R}" r="${pts.length > 120 ? 2.5 : 6}" fill="${col(s)}" stroke="var(--surface)" stroke-width="1.5"/>`; });
      svg += `<text x="${C}" y="${C - 4}" text-anchor="middle" style="font:600 14px var(--f-body);fill:var(--ink)">${servers.length} servers</text><text x="${C}" y="${C + 14}" text-anchor="middle" style="font:11px var(--f-mono);fill:var(--muted)">${pts.length} ring points</text></svg>`;
      $('#rring', root).innerHTML = svg;
      const cnt = {}; own.forEach(s => cnt[s] = (cnt[s] || 0) + 1);
      const ideal = KEYS.length / servers.length;
      $('#rbars', root).innerHTML = servers.map(s => `<div class="lat"><div class="r"><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${col(s)};margin-right:6px"></i>Server ${s}</span><b>${cnt[s] || 0}</b><span class="bar" style="width:${Math.min(100, (cnt[s] || 0) / ideal * 50)}%;background:${col(s)}"></span></div></div>`).join('') + `<p class="section-sub" style="margin:0">Ideal share: ${Math.round(ideal)} keys each (bar midpoint).</p>`;
      $('#rmove', root).innerHTML = `<div class="panel-title">Last change</div><p style="margin:0">${msg}</p>`;
      return own;
    };
    const change = fn => {
      const before = draw(), nBefore = servers.length; fn();
      const after = draw(), moved = after.filter((s, i) => s !== before[i]).length;
      const modMoved = KEYS.filter(([, h]) => h % nBefore !== h % servers.length).length;
      msg = `<b>${moved}</b> of 2,000 keys moved (${(moved / 20).toFixed(1)}%) with consistent hashing. With hash mod N going from ${nBefore} to ${servers.length} servers, <b>${modMoved}</b> would move (${(modMoved / 20).toFixed(1)}%).`;
      draw();
    };
    $('#radd', root).onclick = () => { if (servers.length < 8) change(() => servers.push('ABCDEFGH'[servers.length])); };
    $('#rrem', root).onclick = () => { if (servers.length > 1) change(() => servers.pop()); };
    $('#rv', root).oninput = () => { msg = 'Virtual nodes changed: more points per server even out the arcs, and the bars move toward the ideal.'; draw(); };
    draw();
  } },

/* ---------- 5. Quorum lab ---------- */
{ id: 'sd-quorum', title: 'Quorum replication lab', lede: 'Set N, W and R, take replicas down, write and read. See when reads return stale data and when writes or reads become unavailable.',
  render(root) {
    root.innerHTML = `<div class="bench">
      <div class="lab-grid">
        <label><span>Replicas N</span><select id="qn"><option>3</option><option>5</option></select></label>
        <label><span>Write quorum W: <b id="qwv">2</b></span><input type="range" id="qw" min="1" max="3" value="2"></label>
        <label><span>Read quorum R: <b id="qrv">2</b></span><input type="range" id="qr" min="1" max="3" value="2"></label>
        <label><span>Read repair</span><select id="qrr"><option value="1">On</option><option value="0">Off</option></select></label>
      </div>
      <div class="card" id="qguar"></div>
      <div class="srvrow" id="qrep"></div>
      <div class="row"><button class="btn primary" id="qwrite">Write next version</button><button class="btn" id="qread">Read</button><button class="btn sm" id="qreset">Reset</button></div>
      <div class="card"><div class="panel-title">Log</div><ul class="pts" id="qlog" style="margin:0"></ul></div>
    </div>`;
    const rnd = mulberry(5);
    let reps = [], ver = 0, acked = 0, log = [];
    const reset = () => { const n = +$('#qn', root).value; reps = Array.from({ length: n }, () => ({ up: true, v: 0 })); ver = 0; acked = 0; log = ['Cluster reset. All replicas hold version 0.']; ['#qw', '#qr'].forEach(id => { const el = $(id, root); el.max = n; if (+el.value > n) el.value = n; }); draw(); };
    const draw = () => {
      const n = reps.length, w = +$('#qw', root).value, r = +$('#qr', root).value;
      $('#qwv', root).textContent = w; $('#qrv', root).textContent = r;
      const strong = r + w > n;
      $('#qguar', root).innerHTML = `<b class="${strong ? 'ok' : 'no'}">${strong ? `R + W = ${r + w} > N = ${n}: every read overlaps the latest successful write.` : `R + W = ${r + w} ≤ N = ${n}: reads can miss the latest write (eventual consistency).`}</b><br><span style="color:var(--muted);font-size:14px">Writes survive ${n - w} replica${n - w === 1 ? '' : 's'} down; reads survive ${n - r} down. Latest acknowledged version: <b>v${acked}</b>.</span>`;
      $('#qrep', root).innerHTML = reps.map((x, i) => `<div class="srv ${x.up ? '' : 'down'}"><b>Replica ${'ABCDE'[i]}</b><span>holds <b>v${x.v}</b></span><span>${x.up ? 'up' : 'down'}</span><button class="btn sm" data-i="${i}">${x.up ? 'Take down' : 'Bring up'}</button></div>`).join('');
      $$('#qrep button', root).forEach(b => b.onclick = () => { const x = reps[+b.dataset.i]; x.up = !x.up; log.unshift(`Replica ${'ABCDE'[+b.dataset.i]} is now ${x.up ? 'up (it still has old data until a write or repair reaches it)' : 'down'}.`); draw(); });
      $('#qlog', root).innerHTML = log.slice(0, 7).map(l => `<li>${l}</li>`).join('');
    };
    $('#qwrite', root).onclick = () => {
      const w = +$('#qw', root).value, up = reps.filter(x => x.up); ver++;
      up.forEach(x => x.v = Math.max(x.v, ver));
      if (up.length >= w) { acked = ver; log.unshift(`<span class="ok">Write v${ver} succeeded</span>: ${up.length} acks ≥ W = ${w}.`); }
      else log.unshift(`<span class="no">Write v${ver} failed</span>: only ${up.length} replica(s) up, W = ${w}. (The ${up.length} that received it keep it: a partial write.)`);
      draw();
    };
    $('#qread', root).onclick = () => {
      const r = +$('#qr', root).value, up = reps.map((x, i) => [x, i]).filter(([x]) => x.up);
      if (up.length < r) { log.unshift(`<span class="no">Read failed</span>: only ${up.length} replica(s) up, R = ${r}.`); draw(); return; }
      for (let i = up.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [up[i], up[j]] = [up[j], up[i]]; }
      const ask = up.slice(0, r), got = Math.max(...ask.map(([x]) => x.v));
      const who = ask.map(([x, i]) => `${'ABCDE'[i]}:v${x.v}`).join(', ');
      if ($('#qrr', root).value === '1') ask.forEach(([x]) => x.v = got);
      log.unshift(got >= acked ? `<span class="ok">Read returned v${got}</span> from {${who}}.` : `<span class="no">Stale read: v${got}</span> from {${who}}, but v${acked} was acknowledged.`);
      draw();
    };
    $('#qreset', root).onclick = reset;
    $('#qn', root).onchange = reset;
    ['#qw', '#qr'].forEach(id => $(id, root).oninput = draw);
    reset();
  } },

/* ---------- 6. Rate limiter lab ---------- */
{ id: 'sd-ratelimit', title: 'Rate limiter lab', lede: 'Three limiters with the same limit (5 requests per 2 seconds) see identical traffic. Send bursts, turn on steady traffic, and try the window-boundary trick on the fixed window.',
  render(root) {
    root.innerHTML = `<div class="bench">
      <div class="row"><button class="btn primary" id="tl1">Send 1</button><button class="btn" id="tl10">Burst of 10</button><button class="btn" id="tlb">Boundary burst</button>
        <label style="display:flex;gap:8px;align-items:center;font-size:14px"><span>Steady traffic <b id="tlav">0</b>/s</span><input type="range" id="tla" min="0" max="8" value="0"></label></div>
      <div class="stack" id="tlrows" style="gap:12px"></div>
      <div class="legend"><span><i style="background:var(--good)"></i>allowed</span><span><i style="background:var(--bad)"></i>rejected (429)</span></div>
    </div>`;
    const LIMIT = 5, WIN = 2000;
    let offset = 0;
    const now = () => performance.now() + offset;
    const mk = () => {
      const tb = { tokens: LIMIT, last: now() }, fw = { start: Math.floor(now() / WIN) * WIN, count: 0 }, sl = { log: [] };
      return [
        ['Token bucket', 'capacity 5, refills 2.5 tokens/s', t => { tb.tokens = Math.min(LIMIT, tb.tokens + (t - tb.last) / 1000 * (LIMIT / (WIN / 1000))); tb.last = t; if (tb.tokens >= 1) { tb.tokens--; return true; } return false; }, () => `${tb.tokens.toFixed(1)} tokens`],
        ['Fixed window', '5 per calendar 2-second window', t => { const s = Math.floor(t / WIN) * WIN; if (s !== fw.start) { fw.start = s; fw.count = 0; } if (fw.count < LIMIT) { fw.count++; return true; } return false; }, () => `${fw.count}/5 in window, resets in ${((fw.start + WIN - now()) / 1000).toFixed(1)} s`],
        ['Sliding window log', '5 in any 2-second span', t => { while (sl.log.length && sl.log[0] <= t - WIN) sl.log.shift(); if (sl.log.length < LIMIT) { sl.log.push(t); return true; } return false; }, () => `${sl.log.filter(x => x > now() - WIN).length}/5 in last 2 s`]
      ].map(([name, desc, fn, st]) => ({ name, desc, fn, st, hist: [], ok: 0, no: 0 }));
    };
    const L = mk();
    const send = () => { const t = now(); L.forEach(l => { const ok = l.fn(t); l.hist.push(ok); if (l.hist.length > 44) l.hist.shift(); ok ? l.ok++ : l.no++; }); };
    const draw = () => {
      $('#tlrows', root).innerHTML = L.map(l => `<div class="card"><div class="lvlhead"><b>${l.name}</b><span class="stats"><span>allowed <b>${l.ok}</b></span><span>rejected <b>${l.no}</b></span></span></div><div class="section-sub" style="margin:2px 0 8px">${l.desc} · ${l.st()}</div><div class="tl">${l.hist.map(ok => `<i class="${ok ? '' : 'x'}"></i>`).join('')}</div></div>`).join('');
      $('#tlav', root).textContent = $('#tla', root).value;
    };
    $('#tl1', root).onclick = () => { send(); draw(); };
    $('#tl10', root).onclick = () => { for (let i = 0; i < 10; i++) send(); draw(); };
    $('#tlb', root).onclick = () => {
      const t = now(), toEdge = Math.floor(t / WIN) * WIN + WIN - t;
      offset += toEdge - 40; for (let i = 0; i < 5; i++) send();
      offset += 80; for (let i = 0; i < 5; i++) send();
      draw();
    };
    let acc = 0;
    const iv = setInterval(() => { acc += +$('#tla', root).value / 10; while (acc >= 1) { acc--; send(); } draw(); }, 100);
    cleanup = () => clearInterval(iv);
    draw();
  } },

/* ---------- 7. Queue lab ---------- */
{ id: 'sd-queue', title: 'Message queue lab', lede: 'Producers enqueue, consumers process. Find the consumer count that keeps up, fire a traffic spike, crash a consumer, and add poison messages that end up in the dead-letter queue.',
  render(root) {
    root.innerHTML = `<div class="bench">
      <div class="lab-grid">
        <label><span>Incoming: <b id="qiv">40</b> msg/s</span><input type="range" id="qi" min="0" max="200" value="40"></label>
        <label><span>Consumers: <b id="qcv">3</b></span><input type="range" id="qc" min="1" max="20" value="3"></label>
        <label><span>Processing time: <b id="qpv">100</b> ms</span><input type="range" id="qp" min="20" max="1000" step="10" value="100"></label>
        <label><span>Poison messages: <b id="qxv">0</b>%</span><input type="range" id="qx" min="0" max="10" value="0"></label>
      </div>
      <div class="row"><button class="btn" id="qspike">Traffic spike ×4 for 5 s</button><button class="btn" id="qcrash">Crash a busy consumer</button></div>
      <div class="stat3" id="qst"></div>
      <div class="card"><div class="panel-title">Queue depth, last 60 s</div><div id="qsp"></div></div>
      <div class="card"><div class="panel-title">Consumers</div><div class="tl" id="qcons"></div><div class="legend" style="margin-top:8px"><span><i style="background:var(--good)"></i>busy</span><span><i style="background:var(--line)"></i>idle</span><span><i style="background:var(--bad)"></i>crashed (restarting)</span></div></div>
    </div>`;
    const rnd = mulberry(11);
    let tick = 0, acc = 0, spikeUntil = 0, done = 0, done1 = 0, rate1 = 0, dlq = 0, id = 0;
    const q = [], inflight = [], depth = []; let cons = [];
    const ensure = n => { while (cons.length < n) cons.push({ busy: null, left: 0, down: 0 }); cons.length = n; };
    $('#qspike', root).onclick = () => { spikeUntil = tick + 50; };
    $('#qcrash', root).onclick = () => { const c = cons.find(c => c.busy && !c.down) || cons.find(c => !c.down); if (!c) return; if (c.busy) inflight.push({ m: c.busy, back: tick + 30 }); c.busy = null; c.down = 40; };
    const step = () => {
      tick++;
      const inRate = +$('#qi', root).value * (tick < spikeUntil ? 4 : 1), nC = +$('#qc', root).value, proc = +$('#qp', root).value, pois = +$('#qx', root).value / 100;
      ensure(nC);
      acc += inRate / 10; while (acc >= 1) { acc--; q.push({ id: ++id, t0: tick, tries: 0, poison: rnd() < pois }); }
      for (let i = inflight.length - 1; i >= 0; i--) if (inflight[i].back <= tick) { q.unshift(inflight[i].m); inflight.splice(i, 1); }   // visibility timeout expired
      cons.forEach(c => {
        if (c.down) { c.down--; return; }
        let budget = 100;
        while (budget > 0) {
          if (!c.busy) { if (!q.length) break; c.busy = q.shift(); c.left = proc; }
          const use = Math.min(budget, c.left); c.left -= use; budget -= use;
          if (c.left <= 0) {
            const m = c.busy; c.busy = null;
            if (m.poison) { m.tries++; if (m.tries >= 3) dlq++; else q.push(m); }
            else { done++; done1++; }
          }
        }
      });
      if (tick % 10 === 0) { rate1 = done1; done1 = 0; depth.push(q.length); if (depth.length > 60) depth.shift(); }
      const cap = nC * 1000 / proc;
      $('#qiv', root).textContent = $('#qi', root).value; $('#qcv', root).textContent = nC; $('#qpv', root).textContent = proc; $('#qxv', root).textContent = $('#qx', root).value;
      const oldest = q.length ? ((tick - q[0].t0) / 10).toFixed(1) + ' s' : '0 s';
      $('#qst', root).innerHTML = [['Queue depth', fmt(q.length)], ['Oldest message age', oldest], ['Processed / s', rate1], ['Capacity / incoming', `${Math.round(cap)} / ${Math.round(inRate)}`], ['Dead-letter queue', dlq], ['Processed total', fmt(done)]].map(([l, b]) => `<div class="card"><div class="big">${b}</div><div class="lbl">${l}</div></div>`).join('');
      $('#qsp', root).innerHTML = sparkline(depth, 600, 80);
      $('#qcons', root).innerHTML = cons.map(c => `<i style="width:18px;height:22px;background:${c.down ? 'var(--bad)' : c.busy ? 'var(--good)' : 'var(--line)'}"></i>`).join('');
    };
    const iv = setInterval(step, 100);
    cleanup = () => clearInterval(iv);
    step();
  } },

/* ---------- 8. Circuit breaker lab ---------- */
{ id: 'sd-breaker', title: 'Timeouts & circuit breaker lab', lede: 'A service handles 20 requests per second with a pool of 30 worker threads and calls a dependency. Break the dependency and compare what happens with and without a circuit breaker.',
  render(root) {
    root.innerHTML = `<div class="bench">
      <div class="lab-grid">
        <label><span>Dependency failure rate: <b id="cfv">0</b>%</span><input type="range" id="cf" min="0" max="100" step="10" value="0"></label>
        <label><span>Failures look like</span><select id="cm"><option value="t">Hangs until a 2 s timeout</option><option value="e">Fast error (50 ms)</option></select></label>
        <label><span>Circuit breaker</span><select id="cb"><option value="1">On</option><option value="0">Off</option></select></label>
      </div>
      <div class="row"><span class="pill prem" id="cstate">CLOSED</span><span class="stats" id="cpool"></span></div>
      <div class="stat3" id="cst"></div>
      <div class="card"><div class="panel-title">Threads busy (pool of 30), last 30 s</div><div id="csp"></div></div>
    </div>`;
    const rnd = mulberry(3);
    let tick = 0, acc = 0, state = 'CLOSED', openedAt = 0, trials = 0, win = [];
    const inflight = [], busyHist = [];
    let sec = { ok: 0, fail: 0, fast: 0, pool: 0 }, last = { ok: 0, fail: 0, fast: 0, pool: 0 };
    const record = ok => { win.push(ok); if (win.length > 20) win.shift(); };
    const step = () => {
      tick++;
      const fr = +$('#cf', root).value / 100, hang = $('#cm', root).value === 't', useCb = $('#cb', root).value === '1';
      $('#cfv', root).textContent = Math.round(fr * 100);
      if (!useCb) state = 'CLOSED';
      if (state === 'OPEN' && tick - openedAt >= 50) { state = 'HALF_OPEN'; trials = 0; }
      for (let i = inflight.length - 1; i >= 0; i--) {
        const r = inflight[i]; r.left -= 100;
        if (r.left <= 0) {
          inflight.splice(i, 1);
          if (r.fail) sec.fail++; else sec.ok++;
          if (useCb) {
            record(!r.fail);
            if (state === 'HALF_OPEN') { if (r.fail) { state = 'OPEN'; openedAt = tick; } else if (++trials >= 3) { state = 'CLOSED'; win = []; } }
            else if (state === 'CLOSED' && win.length >= 10 && win.filter(x => !x).length / win.length >= 0.5) { state = 'OPEN'; openedAt = tick; }
          }
        }
      }
      acc += 2;
      while (acc >= 1) {
        acc--;
        if (inflight.length >= 30) { sec.pool++; continue; }
        if (useCb && (state === 'OPEN' || (state === 'HALF_OPEN' && inflight.length >= 3))) { sec.fast++; continue; }
        const fail = rnd() < fr;
        inflight.push({ fail, left: fail ? (hang ? 2000 : 50) : 50 });
      }
      if (tick % 10 === 0) { last = sec; sec = { ok: 0, fail: 0, fast: 0, pool: 0 }; busyHist.push(inflight.length); if (busyHist.length > 30) busyHist.shift(); }
      $('#cstate', root).textContent = useCb ? state.replace('_', '-') : 'NO BREAKER';
      $('#cstate', root).className = 'pill ' + (state === 'OPEN' ? 'Hard' : state === 'HALF_OPEN' ? 'Medium' : 'Easy');
      $('#cpool', root).innerHTML = `<span>threads busy <b>${inflight.length}/30</b></span>`;
      $('#cst', root).innerHTML = [['Succeeded / s', last.ok], ['Failed or timed out / s', last.fail], ['Failed fast → fallback / s', last.fast], ['Rejected: pool exhausted / s', last.pool]].map(([l, b]) => `<div class="card"><div class="big">${b}</div><div class="lbl">${l}</div></div>`).join('');
      $('#csp', root).innerHTML = sparkline(busyHist, 600, 80, 30);
    };
    const iv = setInterval(step, 100);
    cleanup = () => clearInterval(iv);
    step();
  } },

/* ---------- Final quiz ---------- */
{ id: 'sd-quiz', n: 10, title: 'System design final quiz', lede: 'Ten questions across the whole track.',
  render(root) { quiz(root, [
    SQ('A service gets 2 billion requests a day. Roughly what average QPS is that?', ['≈ 2,300', '≈ 23,000', '≈ 230,000', '≈ 2.3 million'], 1, '2 × 10⁹ ÷ 86,400 ≈ 23,000.'),
    SQ('Which change lets you add app servers freely behind a load balancer?', ['Bigger servers', 'Moving session state to a shared store', 'Sticky sessions', 'Longer timeouts'], 1, 'Stateless servers can handle any request.'),
    SQ('A hot cache key expires and the database is flooded. What helps most?', ['Shorter TTLs', 'Request coalescing / one reloader per key', 'More indexes', 'Disabling the cache'], 1, 'Only one request should rebuild the key while others wait or get stale data.'),
    SQ('N = 3. Which (W, R) guarantees reads overlap the latest write?', ['(1, 1)', '(1, 2)', '(2, 2)', '(2, 1)'], 2, 'R + W must exceed N.'),
    SQ('Adding one node to a 9-node consistent-hash cluster moves about…', ['10% of keys', '50% of keys', '90% of keys', 'no keys'], 0, 'About 1/(N + 1).'),
    SQ('You need all events for each order processed in order, at high throughput. Kafka design?', ['One partition', 'Partition by order ID', 'Random partitioning', 'One consumer per message'], 1, 'Same key → same partition → ordered; different orders spread out.'),
    SQ('Why add jitter to exponential backoff?', ['To retry sooner', 'To desynchronize clients and avoid retry waves', 'To encrypt', 'To reduce payload size'], 1, 'Synchronized retries hammer a recovering service.'),
    SQ('Which pattern replaces cross-service transactions with local steps and compensations?', ['Two-phase commit', 'Saga', 'Sharding', 'CQRS'], 1, 'Sagas trade isolation for availability and loose coupling.'),
    SQ('A celebrity posts to 100M followers. A feed design should…', ['Fan out to all 100M timelines immediately', 'Pull the celebrity’s posts at read time and merge', 'Block posting', 'Email everyone'], 1, 'Hybrid fan-out avoids enormous write amplification.'),
    SQ('Which pair best gives exactly-once effects on top of at-least-once delivery?', ['Longer retention + bigger queues', 'Transactional outbox + idempotent consumers', 'UDP + compression', 'Read replicas + caching'], 1, 'Never lose events when producing; make duplicates harmless when consuming.')
  ]); } }
];

/* ---------- pages for the design track ---------- */
function walkFigure(el, spec, cap, walk) {
  el.innerHTML = `<div class="bench sdbench">${figure(spec, cap)}<div class="sdwalk"><div class="narr" id="wnarr"></div><div class="row"><button class="btn sm" id="wprev">◀ Back</button><button class="btn primary" id="wnext">Next step ▶</button><button class="btn sm" id="wreset">Restart</button><span class="stats"><span>Step <b id="wstep">0</b> / ${walk.length}</span></span></div></div></div>`;
  const svg = $('svg', el); let step = -1;
  const draw = () => {
    $('#wstep', el).textContent = step + 1;
    if (step < 0) { $('#wnarr', el).innerHTML = 'Press <b>Next step</b> to follow a request through the whole system.'; dgHighlight(svg, null); }
    else { $('#wnarr', el).innerHTML = `<span class="tag">Step ${step + 1}</span>${walk[step][1]}`; dgHighlight(svg, walk[step][0]); }
    $('#wprev', el).disabled = step < 0; $('#wnext', el).disabled = step >= walk.length - 1;
  };
  $('#wnext', el).onclick = () => { step++; draw(); }; $('#wprev', el).onclick = () => { step--; draw(); }; $('#wreset', el).onclick = () => { step = -1; draw(); };
  draw();
}
const SD_PAGES = {
  sdIntro(el) {
    el.innerHTML = `<div class="card"><h3>What you are learning</h3><p style="margin:6px 0 0;max-width:70ch">Almost every large web system is built from the same dozen building blocks. This diagram shows them all, wired together as they are in a typical product. Step through it once now; by the end of the track you will be able to explain, size and choose between alternatives for every box and arrow.</p></div>
      <h2 class="section-title">Anatomy of a large web system</h2><div id="anat"></div>
      <h2 class="section-title">How this track is organized</h2>
      ${TBL(['Level', 'You learn', 'You can then'], [['1 · Foundations', 'Requirements, latency numbers, estimation, DNS, HTTP, real-time protocols, API design', 'Turn a vague product idea into numbers and an API'], ['2 · Building blocks', 'Scaling, load balancing, gateways, caching, CDNs, databases, indexes, transactions, blob storage, search', 'Draw a solid single-region architecture'], ['3 · Distributed data', 'Replication, sharding, consistent hashing, queues, logs, CAP, consistency, quorums, consensus, clocks, IDs, sagas, sketches', 'Scale data across many machines and reason about correctness'], ['4 · Reliability & operations', 'Rate limiting, availability, retries, circuit breakers, observability, deploys, microservices, auth', 'Keep systems up and safe as they change'], ['5 · Case studies', 'Nine full designs and an interview framework', 'Design real systems end to end and defend the trade-offs']])}`;
    walkFigure($('#anat', el), {
      w: 950, h: 400,
      n: [['u', 'Users', 70, 200, 'user'], ['dns', 'DNS', 250, 60, 'dns'], ['cdn', 'CDN', 250, 200, 'cdn', 'static + media'], ['lb', 'Load balancer', 460, 200, 'lb'], ['app', 'App servers', 670, 200, 'svc', 'stateless ×N'], ['ca', 'Cache', 870, 80, 'cache'], ['db', 'Database', 870, 200, 'db', 'primary + replicas'], ['q', 'Queue', 670, 330, 'queue'], ['w', 'Workers', 870, 330, 'worker', 'async jobs'], ['s3', 'Object storage', 460, 330, 'store']],
      e: [['u', 'dns', 'resolve'], ['u', 'cdn', 'HTTPS'], ['cdn', 'lb', 'API calls'], ['lb', 'app'], ['app', 'ca', 'read'], ['app', 'db', 'SQL'], ['app', 'q', 'enqueue'], ['q', 'w'], ['w', 'db', '', 'd'], ['cdn', 's3', 'files', 'd']]
    }, 'A typical large web system: DNS and a CDN at the edge, a load balancer in front of stateless app servers, a cache and a replicated database for data, object storage for files, and a queue with workers for slow jobs.', [
      [['u', 'dns', 'u>dns'], `The user’s device resolves the domain with <b>DNS</b>, which can route it to the nearest region.`],
      [['u', 'cdn', 'u>cdn'], `Requests go to a <b>CDN</b> edge nearby. Images, video, scripts and other static files are served right there.`],
      [['cdn', 's3', 'cdn>s3'], `When the CDN doesn’t have a file, it fetches it from <b>object storage</b>, which holds every uploaded file durably.`],
      [['cdn', 'lb', 'lb', 'cdn>lb'], `Dynamic requests (API calls) are forwarded to a <b>load balancer</b>, which spreads them across healthy servers.`],
      [['lb', 'app', 'lb>app'], `<b>Stateless app servers</b> run the business logic. Any server can handle any request, so you scale by adding servers.`],
      [['app', 'ca', 'app>ca'], `Most reads are answered from an in-memory <b>cache</b> in under a millisecond.`],
      [['app', 'db', 'app>db'], `Cache misses and all writes go to the <b>database</b>: a primary for writes, replicas for reads, and eventually shards when one machine is not enough.`],
      [['app', 'q', 'w', 'app>q', 'q>w'], `Slow work (emails, video processing, notifications) goes on a <b>queue</b> and is done by <b>workers</b> in the background, so users get fast responses.`]]);
  },
  sdFramework(el) {
    el.innerHTML = `<div class="card"><h3>A repeatable way to design anything</h3><p style="margin:6px 0 0;max-width:70ch">Whether in an interview (45–60 minutes) or a design review, the same structure keeps you from jumping into details too early or running out of time before the interesting parts.</p></div>
      <h2 class="section-title">The five steps</h2>
      <div class="card explain">${[
        ['Clarify requirements (≈ 5 min)', UL([`Ask who the users are, the core features (3–5), and what is out of scope.`, `Pin down non-functional requirements: scale, latency, availability, consistency, durability.`, `Write them down where the interviewer can see them.`])],
        ['Estimate (≈ 5 min)', UL([`DAU → requests/day → average and peak QPS, split reads and writes.`, `Storage per year and bandwidth.`, `State the design implications: “35K read QPS means a cache; 2 GB/s egress means a CDN.”`])],
        ['API and data model (≈ 5–10 min)', UL([`List the endpoints with inputs and outputs.`, `Sketch the main entities and their keys, and say which store fits and why.`, `Note the access patterns that will drive partitioning.`])],
        ['High-level design (≈ 10–15 min)', UL([`Draw the simplest design that works end to end: clients, load balancer, services, data stores, async parts.`, `Walk one write and one read through it.`, `Don’t optimize yet; make sure it is complete.`])],
        ['Deep dives and trade-offs (≈ 15–20 min)', UL([`Pick the hardest parts (usually where the estimates hurt): the hot path, the biggest table, the fan-out, the consistency question.`, `For each, present two or three options and choose one with a reason tied to the requirements.`, `Cover failures: what happens when a node, a zone or a dependency fails? How is it monitored?`, `Finish with how the design evolves at 10× scale.`])]
      ].map(([h, b], i) => `<section class="xsec"><h3><span class="xn">${i + 1}</span>${h}</h3>${b}</section>`).join('')}</div>
      <h2 class="section-title">What interviewers look for</h2>
      ${UL([`<b>Structure:</b> you drive the conversation through clear phases.`, `<b>Trade-offs:</b> every choice is justified against requirements, with alternatives named.`, `<b>Numbers:</b> estimates inform decisions instead of being a ritual.`, `<b>Depth:</b> you can go deep on at least one component (sharding scheme, cache strategy, consistency).`, `<b>Practicality:</b> failure handling, monitoring, operations and cost.`, `<b>Communication:</b> you check in, take hints, and adapt.`])}
      <h2 class="section-title">Common mistakes</h2>
      ${UL([`Starting with microservices and Kafka before knowing the requirements.`, `Designing for the average instead of the peak, or skipping estimates altogether.`, `Name-dropping technologies without explaining what problem they solve.`, `Spending the whole time on one box while the end-to-end flow is never finished.`, `Ignoring the write path, deletes, or failure scenarios.`])}
      ${CO('Practice:', `do each case study in the next units twice: first by reading it, then a few days later on paper in 45 minutes, comparing your design with the walkthrough.`)}`;
  },
  sdCapstone(el) {
    el.innerHTML = `<div class="card"><h3>You have the whole toolkit</h3><p style="margin:6px 0 0;max-width:70ch">Take the final quiz in the Check step. Then design one of these systems on your own using the five-step framework, and compare your result with the patterns in this track.</p></div>
      <h2 class="section-title">Design challenges</h2><div class="steps4">
      <div class="card"><h3>Distributed cache</h3><p>Memcached/Redis cluster: partitioning, replication, eviction, hot keys, client-side routing.</p></div>
      <div class="card"><h3>Instagram</h3><p>Photo upload pipeline, feed generation, follower graph, likes and comments counters at scale.</p></div>
      <div class="card"><h3>Distributed job scheduler</h3><p>Cron at scale: exactly-once triggering, leases, retries, priorities and backfills.</p></div>
      <div class="card"><h3>Metrics & monitoring</h3><p>Ingest millions of points per second, time-series storage, downsampling, alerting.</p></div>
      <div class="card"><h3>Stock exchange</h3><p>Order matching engine, sequencing, low latency, market data fan-out and auditability.</p></div>
      <div class="card"><h3>Web search</h3><p>Crawling to inverted indexes, ranking, sharded query serving and freshness.</p></div></div>
      <h2 class="section-title">Where to go next</h2>
      ${UL([`<b>Designing Data-Intensive Applications</b> (Martin Kleppmann): the best deep reference for levels 2–3 of this track.`, `<b>The Google SRE books</b> (free online): reliability, SLOs, monitoring and incident response.`, `<b>Engineering blogs</b> from companies that run these systems at scale: Netflix, Uber, Discord, Cloudflare, Meta, Stripe.`, `<b>Papers:</b> Dynamo, Bigtable, Spanner, Raft, Kafka, MapReduce. Each is readable and short.`, `Build something: a URL shortener with a cache and rate limiter, deployed behind a load balancer, with metrics and a load test.`])}`;
  }
};
