/* ===== Swing trading: domain helper, categories, risk note & SVG charting engine ===== */
SD_CATS.push(['stfound', 'Foundations'], ['stchart', 'Reading charts'], ['stcandle', 'Candlestick patterns'], ['stpattern', 'Chart patterns & TA'], ['stind', 'Indicators'], ['ststrat', 'Strategies & execution'], ['strisk', 'Risk & psychology']);
const STT = (k, o) => { o.domain = o.domain || 'Swing trading'; o.edgeTitle = o.edgeTitle || 'Risks & common mistakes'; SDX(k, o); };
/* a reusable, prominent education-not-advice note */
const RISK = CO('Not financial advice.', 'This course is education, not a recommendation to buy or sell anything. Trading carries a real risk of losing money; most beginners lose at first. Never risk money you cannot afford to lose, and consider a licensed professional for personal advice.');

/* ---------- SVG charting engine ----------
   chart(opt) returns an <svg> string. All colors come from CSS classes so charts adapt to light/dark.
   opt = {
     w,h, min,max, bars (count hint), title,
     candles: [[open,high,low,close], ...],
     lines: [{data:[price,...], cls, width, dash, label}],   // one value per bar index
     hlines: [{p, label, cls}],                              // horizontal price line (support/resistance)
     tlines: [{from:[i,p], to:[i,p], cls, dash, label}],     // diagonal trendline between two (bar,price)
     hzones: [{p1,p2, cls, label}],                          // shaded horizontal price band
     vzones: [{i1,i2, cls, label}],                          // shaded vertical bar band
     marks: [{i,p, type:'buy'|'sell'|'stop'|'target', label}],
     notes: [{i,p, text, anchor, dy}],
     yticks (n), yfmt(fn), axis(bool)
   } */
function chart(opt) {
  const w = opt.w || 560, h = opt.h || 240;
  const pad = Object.assign({ l: 10, r: 48, t: 14, b: 16 }, opt.pad || {});
  const C = opt.candles || [], L = opt.lines || [];
  const n = opt.bars || C.length || (L[0] && L[0].data.length) || 1;
  // price range
  let vals = [];
  C.forEach(d => { vals.push(d[1], d[2]); });
  L.forEach(l => l.data.forEach(v => { if (v != null) vals.push(v); }));
  (opt.hlines || []).forEach(l => vals.push(l.p));
  (opt.tlines || []).forEach(t => vals.push(t.from[1], t.to[1]));
  (opt.hzones || []).forEach(z => vals.push(z.p1, z.p2));
  (opt.marks || []).forEach(m => vals.push(m.p));
  let min = opt.min != null ? opt.min : Math.min(...vals);
  let max = opt.max != null ? opt.max : Math.max(...vals);
  if (!isFinite(min) || !isFinite(max)) { min = 0; max = 1; }
  if (min === max) { min -= 1; max += 1; }
  // only auto-pad the range when it was computed from data; explicit min+max is exact
  if (!(opt.min != null && opt.max != null)) { const padp = (max - min) * 0.08; if (opt.min == null) min -= padp; if (opt.max == null) max += padp; }
  const span = max - min;
  const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
  const step = plotW / n;
  const X = i => pad.l + (i + 0.5) * step;
  const Y = p => pad.t + (max - p) / span * plotH;
  const cw = Math.max(3, Math.min(step * 0.62, 18));
  const esc2 = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let out = `<svg class="stsvg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc2(opt.title || 'price chart')}" preserveAspectRatio="xMidYMid meet">`;
  // horizontal grid + right-axis price labels
  if (opt.axis !== false) {
    const nt = opt.yticks || 4;
    for (let t = 0; t <= nt; t++) {
      const p = min + (span * t) / nt, y = Y(p);
      out += `<line class="stc-grid" x1="${pad.l}" y1="${y.toFixed(1)}" x2="${w - pad.r}" y2="${y.toFixed(1)}"/>`;
      const lab = opt.yfmt ? opt.yfmt(p) : p.toFixed(p < 10 ? 2 : 0);
      out += `<text class="stc-ax" x="${w - pad.r + 4}" y="${(y + 3).toFixed(1)}">${lab}</text>`;
    }
  }
  // shaded zones
  (opt.hzones || []).forEach(z => {
    const y1 = Y(Math.max(z.p1, z.p2)), y2 = Y(Math.min(z.p1, z.p2));
    out += `<rect class="stc-zone ${z.cls || ''}" x="${pad.l}" y="${y1.toFixed(1)}" width="${plotW.toFixed(1)}" height="${(y2 - y1).toFixed(1)}"/>`;
    if (z.label) out += `<text class="stc-note" x="${pad.l + 6}" y="${(y1 + 13).toFixed(1)}">${esc2(z.label)}</text>`;
  });
  (opt.vzones || []).forEach(z => {
    const x1 = X(z.i1) - step / 2, x2 = X(z.i2) + step / 2;
    out += `<rect class="stc-zone ${z.cls || ''}" x="${x1.toFixed(1)}" y="${pad.t}" width="${(x2 - x1).toFixed(1)}" height="${plotH.toFixed(1)}"/>`;
    if (z.label) out += `<text class="stc-note" x="${(x1 + 5).toFixed(1)}" y="${(pad.t + 13).toFixed(1)}">${esc2(z.label)}</text>`;
  });
  // candles
  C.forEach((d, i) => {
    const [o, hi, lo, c] = d, x = X(i), up = c >= o;
    out += `<line class="stc-wick ${up ? 'stc-up' : 'stc-dn'}" x1="${x.toFixed(1)}" y1="${Y(hi).toFixed(1)}" x2="${x.toFixed(1)}" y2="${Y(lo).toFixed(1)}"/>`;
    const yb = Y(Math.max(o, c)), hb = Math.max(1.2, Math.abs(Y(o) - Y(c)));
    out += `<rect class="stc-body ${up ? 'stc-up' : 'stc-dn'}" x="${(x - cw / 2).toFixed(1)}" y="${yb.toFixed(1)}" width="${cw.toFixed(1)}" height="${hb.toFixed(1)}" rx="1"/>`;
  });
  // price lines
  L.forEach(l => {
    const pts = l.data.map((v, i) => v == null ? null : `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean).join(' ');
    out += `<polyline class="stc-line ${l.cls || ''}" points="${pts}" style="${l.width ? `stroke-width:${l.width}` : ''}${l.dash ? ';stroke-dasharray:4 3' : ''}"/>`;
    if (l.label) { const li = l.data.length - 1; out += `<text class="stc-note" x="${(X(li) + 3).toFixed(1)}" y="${(Y(l.data[li]) - 3).toFixed(1)}">${esc2(l.label)}</text>`; }
  });
  // horizontal S/R lines
  (opt.hlines || []).forEach(l => {
    const y = Y(l.p);
    out += `<line class="stc-sr ${l.cls || ''}" x1="${pad.l}" y1="${y.toFixed(1)}" x2="${(w - pad.r).toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    if (l.label) out += `<text class="stc-note ${l.cls || ''}" x="${(pad.l + 4).toFixed(1)}" y="${(y - 4).toFixed(1)}">${esc2(l.label)}</text>`;
  });
  // trendlines
  (opt.tlines || []).forEach(t => {
    out += `<line class="stc-tl ${t.cls || ''}" x1="${X(t.from[0]).toFixed(1)}" y1="${Y(t.from[1]).toFixed(1)}" x2="${X(t.to[0]).toFixed(1)}" y2="${Y(t.to[1]).toFixed(1)}"${t.dash ? ' style="stroke-dasharray:4 3"' : ''}/>`;
    if (t.label) out += `<text class="stc-note" x="${X(t.to[0]).toFixed(1)}" y="${(Y(t.to[1]) - 4).toFixed(1)}">${esc2(t.label)}</text>`;
  });
  // marks (entry/stop/target)
  (opt.marks || []).forEach(m => {
    const x = X(m.i), y = Y(m.p);
    if (m.type === 'buy' || m.type === 'sell') {
      const up = m.type === 'buy', c = up ? 'stc-mk-buy' : 'stc-mk-sell';
      const tri = up ? `${x},${y - 9} ${x - 6},${y + 3} ${x + 6},${y + 3}` : `${x},${y + 9} ${x - 6},${y - 3} ${x + 6},${y - 3}`;
      out += `<polygon class="${c}" points="${tri}"/>`;
      if (m.label) out += `<text class="stc-note ${c}" x="${(x + 9).toFixed(1)}" y="${(y + 3).toFixed(1)}">${esc2(m.label)}</text>`;
    } else {
      const c = m.type === 'target' ? 'stc-sup' : 'stc-res';
      out += `<line class="stc-sr ${c}" x1="${pad.l}" y1="${y.toFixed(1)}" x2="${(w - pad.r).toFixed(1)}" y2="${y.toFixed(1)}"/>`;
      if (m.label) out += `<text class="stc-note ${c}" x="${(w - pad.r - 4).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="end">${esc2(m.label)}</text>`;
    }
  });
  // free notes
  (opt.notes || []).forEach(nn => {
    out += `<text class="stc-note" x="${X(nn.i).toFixed(1)}" y="${(Y(nn.p) + (nn.dy || 0)).toFixed(1)}"${nn.anchor ? ` text-anchor="${nn.anchor}"` : ''}>${esc2(nn.text)}</text>`;
  });
  out += '</svg>';
  return out;
}
/* wrap a chart in a figure with a caption */
const FIG = (svg, cap) => `<figure class="stfig">${svg}${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
/* two charts side by side (e.g. bullish vs bearish) */
const FIG2 = (a, b) => `<div class="stfig2">${a}${b}</div>`;

/* small helper: build a gently trending OHLC series programmatically for backgrounds
   trend(n, start, driftPerBar, wobble, seed) -> [[o,h,l,c],...] (deterministic) */
function trend(n, start, drift, wob, seed) {
  let s = seed || 7, price = start; const out = [];
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < n; i++) {
    const o = price;
    const move = drift + (rnd() - 0.5) * wob;
    const c = o + move;
    const hi = Math.max(o, c) + rnd() * wob * 0.6;
    const lo = Math.min(o, c) - rnd() * wob * 0.6;
    out.push([+o.toFixed(2), +hi.toFixed(2), +lo.toFixed(2), +c.toFixed(2)]);
    price = c;
  }
  return out;
}
