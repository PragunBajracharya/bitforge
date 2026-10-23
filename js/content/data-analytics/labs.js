/* ===== Data analytics labs ===== */
/* Shared sample shop, generated deterministically so every lab shows the same data. */
const DA_DATA = (() => {
  const r = mulberry(2026);
  const pick = a => a[Math.floor(r() * a.length)];
  const regions = ['West', 'East', 'North', 'South'];
  const first = ['Ava', 'Ben', 'Chloe', 'Dev', 'Elena', 'Femi', 'Grace', 'Hiro', 'Isla', 'Jamal', 'Kai', 'Lena', 'Mateo', 'Nora', 'Omar', 'Priya', 'Quinn', 'Rosa', 'Sam', 'Tara'];
  const last = ['Kim', 'Patel', 'Garcia', 'Smith', 'Nguyen', 'Okafor', 'Rossi', 'Chen', 'Silva', 'Haddad'];
  const customers = [];
  for (let i = 1; i <= 160; i++) {
    const m = 1 + Math.floor(r() * 20), y = m > 12 ? 2026 : 2025, mm = m > 12 ? m - 12 : m;
    customers.push({ customer_id: i, name: `${pick(first)} ${pick(last)}`, region: r() < 0.35 ? 'West' : pick(regions), email: r() < 0.12 ? null : `user${i}@example.com`, signup_date: `${y}-${String(mm).padStart(2, '0')}-${String(1 + Math.floor(r() * 28)).padStart(2, '0')}` });
  }
  const products = [['Trail Shoes', 'Footwear', 89], ['Road Shoes', 'Footwear', 109], ['Sandals', 'Footwear', 39], ['Rain Jacket', 'Apparel', 129], ['Fleece', 'Apparel', 69], ['T-Shirt', 'Apparel', 25], ['Backpack', 'Gear', 79], ['Water Bottle', 'Gear', 18], ['Headlamp', 'Gear', 35], ['Tent', 'Gear', 249], ['Socks (3-pack)', 'Accessories', 15], ['Cap', 'Accessories', 22]]
    .map(([name, category, price], i) => ({ product_id: i + 1, name, category, price }));
  const orders = [], items = [];
  let oid = 1000;
  customers.forEach(c => {
    const n = Math.floor(r() * r() * 14) + (r() < 0.12 ? 0 : 1);
    let d = new Date(c.signup_date + 'T00:00:00Z');
    for (let k = 0; k < n; k++) {
      d = new Date(d.getTime() + (3 + Math.floor(r() * 75)) * 864e5);
      if (d > new Date('2026-09-30T00:00:00Z')) break;
      const id = ++oid, lines = 1 + Math.floor(r() * r() * 4);
      let amount = 0; const used = new Set();
      for (let l = 0; l < lines; l++) {
        const p = pick(products); if (used.has(p.product_id)) continue; used.add(p.product_id);
        const q = 1 + Math.floor(r() * r() * 3); items.push({ order_id: id, product_id: p.product_id, quantity: q }); amount += q * p.price;
      }
      const s = r();
      orders.push({ order_id: id, customer_id: c.customer_id, order_date: d.toISOString().slice(0, 10), amount, status: s < 0.84 ? 'completed' : s < 0.94 ? 'cancelled' : 'refunded' });
    }
  });
  orders.sort((a, b) => a.order_date < b.order_date ? -1 : 1);
  return { customers, products, orders, items };
})();
const daRows = () => { const cm = new Map(DA_DATA.customers.map(c => [c.customer_id, c])); return DA_DATA.orders.map(o => ({ ...o, region: cm.get(o.customer_id).region, year: o.order_date.slice(0, 4), month: o.order_date.slice(0, 7) })); };
const money = v => '$' + Math.round(v).toLocaleString('en-US');
const normCdf = x => { const t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989422804 * Math.exp(-x * x / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x >= 0 ? 1 - p : p; };
const tableHTML = (cols, rows, limit) => `<div class="tblwrap"><table class="sampletbl"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, limit || 200).map(r => `<tr>${r.map(v => `<td>${v === null || v === undefined ? '<span style="color:var(--muted)">NULL</span>' : esc(typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 100) / 100 : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length > (limit || 200) ? `<p class="section-sub">Showing ${limit || 200} of ${rows.length} rows.</p>` : ''}`;

let SQLJS = null;
function loadSqlJs() {
  if (SQLJS) return SQLJS;
  const V = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
  SQLJS = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = V + 'sql-wasm.js';
    s.onload = () => window.initSqlJs({ locateFile: f => V + f }).then(res, rej);
    s.onerror = () => rej(new Error('Could not load the SQL engine (offline?)'));
    document.head.appendChild(s);
  });
  SQLJS.catch(() => { SQLJS = null; });
  return SQLJS;
}

const daLessons = [

/* ---------- SQL playground ---------- */
{ id: 'da-sql-play', title: 'SQL playground', lede: 'A real SQLite database running in your browser with the shop’s four tables. Pick an example or write your own query, then press Run (or Ctrl+Enter).',
  render(root) {
    const EX = [
      ['First look', `SELECT * FROM orders LIMIT 10;`],
      ['Filter & sort', `SELECT order_id, customer_id, order_date, amount\nFROM orders\nWHERE status = 'completed' AND amount >= 150\nORDER BY amount DESC\nLIMIT 10;`],
      ['GROUP BY', `SELECT c.region,\n       COUNT(*) AS orders,\n       COUNT(DISTINCT o.customer_id) AS customers,\n       SUM(o.amount) AS revenue,\n       ROUND(AVG(o.amount), 2) AS aov\nFROM orders o\nJOIN customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.region\nORDER BY revenue DESC;`],
      ['LEFT JOIN', `-- Customers who never placed an order\nSELECT c.customer_id, c.name, c.region\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;`],
      ['Category revenue', `SELECT p.category, SUM(oi.quantity * p.price) AS revenue, SUM(oi.quantity) AS units\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nJOIN orders o ON o.order_id = oi.order_id\nWHERE o.status = 'completed'\nGROUP BY p.category\nORDER BY revenue DESC;`],
      ['CTE', `WITH totals AS (\n  SELECT customer_id, SUM(amount) AS spend, COUNT(*) AS orders\n  FROM orders WHERE status = 'completed'\n  GROUP BY customer_id\n)\nSELECT c.name, c.region, t.spend, t.orders\nFROM totals t JOIN customers c USING (customer_id)\nWHERE t.spend > (SELECT AVG(spend) FROM totals)\nORDER BY t.spend DESC;`],
      ['Window: MoM', `WITH monthly AS (\n  SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue\n  FROM orders WHERE status = 'completed'\n  GROUP BY month\n)\nSELECT month, revenue,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS change,\n       SUM(revenue) OVER (ORDER BY month) AS running_total,\n       ROUND(AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS moving_avg_3m\nFROM monthly ORDER BY month;`],
      ['Top N per group', `WITH ranked AS (\n  SELECT c.region, c.name, SUM(o.amount) AS spend,\n         ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.amount) DESC) AS rn\n  FROM orders o JOIN customers c USING (customer_id)\n  WHERE o.status = 'completed'\n  GROUP BY c.region, c.customer_id\n)\nSELECT region, rn AS rank, name, spend FROM ranked WHERE rn <= 2 ORDER BY region, rn;`],
      ['Cohorts', `WITH firsts AS (\n  SELECT customer_id, MIN(order_date) AS first_date\n  FROM orders WHERE status = 'completed' GROUP BY customer_id\n)\nSELECT strftime('%Y-%m', first_date) AS cohort,\n       COUNT(*) AS new_customers\nFROM firsts GROUP BY cohort ORDER BY cohort;`],
      ['CASE & rates', `SELECT strftime('%Y', order_date) AS year,\n       COUNT(*) AS orders,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN status <> 'completed' THEN 1 ELSE 0 END) / COUNT(*), 1) AS not_completed_pct\nFROM orders GROUP BY year;`]
    ];
    root.innerHTML = `<div class="bench">
      <div class="chipbar" id="sqex">${EX.map((e, i) => `<button data-i="${i}" aria-pressed="${!i}">${e[0]}</button>`).join('')}</div>
      <textarea class="sqlbox" id="sqtxt" spellcheck="false" aria-label="SQL query"></textarea>
      <div class="row"><button class="btn primary" id="sqrun">Run ▶</button><span class="stats" id="sqst">Loading SQL engine…</span></div>
      <div id="sqout"></div>
      <details class="card"><summary style="cursor:pointer;font-weight:600">Schema</summary><div style="margin-top:8px">${TBL(['Table', 'Columns', 'Rows'], [['customers', 'customer_id, name, region, email, signup_date', DA_DATA.customers.length], ['orders', 'order_id, customer_id, order_date, amount, status', DA_DATA.orders.length], ['products', 'product_id, name, category, price', DA_DATA.products.length], ['order_items', 'order_id, product_id, quantity', DA_DATA.items.length]])}</div></details>
    </div>`;
    const ta = $('#sqtxt', root); ta.value = EX[0][1];
    let db = null;
    const run = () => {
      if (!db) return;
      const t0 = performance.now();
      try {
        const res = db.exec(ta.value);
        const ms = (performance.now() - t0).toFixed(1);
        if (!res.length) { $('#sqout', root).innerHTML = '<p class="section-sub">Query ran; no rows returned.</p>'; $('#sqst', root).textContent = `${ms} ms`; return; }
        const last = res[res.length - 1];
        $('#sqout', root).innerHTML = tableHTML(last.columns, last.values);
        $('#sqst', root).textContent = `${last.values.length} row${last.values.length === 1 ? '' : 's'} · ${ms} ms`;
      } catch (e) { $('#sqout', root).innerHTML = `<p class="sqlerr">${esc(e.message)}</p>`; $('#sqst', root).textContent = 'Error'; }
    };
    $$('#sqex button', root).forEach(b => b.onclick = () => { $$('#sqex button', root).forEach(x => x.setAttribute('aria-pressed', x === b)); ta.value = EX[+b.dataset.i][1]; run(); });
    $('#sqrun', root).onclick = run;
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); } });
    loadSqlJs().then(SQL => {
      if (!root.isConnected) return;
      db = new SQL.Database();
      const D = DA_DATA, q = v => v === null ? 'NULL' : typeof v === 'number' ? v : `'${String(v).replace(/'/g, "''")}'`;
      db.run(`CREATE TABLE customers(customer_id INTEGER PRIMARY KEY, name TEXT, region TEXT, email TEXT, signup_date TEXT);
        CREATE TABLE products(product_id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL);
        CREATE TABLE orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, amount REAL, status TEXT);
        CREATE TABLE order_items(order_id INTEGER, product_id INTEGER, quantity INTEGER);
        ${D.customers.map(c => `INSERT INTO customers VALUES(${[c.customer_id, c.name, c.region, c.email, c.signup_date].map(q).join(',')});`).join('')}
        ${D.products.map(p => `INSERT INTO products VALUES(${[p.product_id, p.name, p.category, p.price].map(q).join(',')});`).join('')}
        ${D.orders.map(o => `INSERT INTO orders VALUES(${[o.order_id, o.customer_id, o.order_date, o.amount, o.status].map(q).join(',')});`).join('')}
        ${D.items.map(i => `INSERT INTO order_items VALUES(${[i.order_id, i.product_id, i.quantity].join(',')});`).join('')}`);
      $('#sqst', root).textContent = 'Ready';
      run();
    }).catch(e => { $('#sqst', root).textContent = ''; $('#sqout', root).innerHTML = `<p class="sqlerr">${esc(e.message)}. The examples above still show the syntax; try them in any SQLite tool (DB Browser for SQLite, sqliteonline.com).</p>`; });
  } },

/* ---------- Excel formula builder ---------- */
{ id: 'da-excel-lab', title: 'Excel formula builder', lede: 'Build SUMIFS, COUNTIFS, AVERAGEIFS and XLOOKUP formulas by choosing criteria. The formula, its result and the rows it matched update as you go.',
  render(root) {
    const rows = daRows().slice(0, 18).map((o, i) => ({ ...o, row: i + 2 }));
    root.innerHTML = `<div class="bench">
      <div class="lab-grid">
        <label><span>Function</span><select id="xf"><option>SUMIFS</option><option>COUNTIFS</option><option>AVERAGEIFS</option><option>XLOOKUP</option></select></label>
        <label class="xc"><span>Region</span><select id="xr"><option value="">(any)</option>${['West', 'East', 'North', 'South'].map(x => `<option>${x}</option>`).join('')}</select></label>
        <label class="xc"><span>Status</span><select id="xs"><option value="">(any)</option><option>completed</option><option>cancelled</option><option>refunded</option></select></label>
        <label class="xc"><span>Amount</span><select id="xo"><option value="">(any)</option><option value=">=">≥</option><option value="<">&lt;</option></select></label>
        <label class="xc"><span>Amount value</span><input type="number" id="xv" value="100"></label>
        <label class="xl" hidden><span>Look up order_id</span><select id="xk">${rows.map(r => `<option>${r.order_id}</option>`).join('')}</select></label>
        <label class="xl" hidden><span>Return column</span><select id="xret"><option value="amount">amount (E)</option><option value="region">region (C)</option><option value="order_date">order_date (B)</option><option value="status">status (D)</option></select></label>
      </div>
      <div class="card"><div class="panel-title">Formula</div><pre class="code" style="max-height:none"><code id="xform"></code></pre><div class="stat3" style="margin-top:10px"><div class="card"><div class="big" id="xres"></div><div class="lbl">Result</div></div></div></div>
      <div class="tblwrap" id="xtbl"></div>
    </div>`;
    const COLS = { A: 'order_id', B: 'order_date', C: 'region', D: 'status', E: 'amount' };
    const last = rows[rows.length - 1].row;
    const draw = () => {
      const f = $('#xf', root).value, isX = f === 'XLOOKUP';
      $$('.xc', root).forEach(e => e.hidden = isX); $$('.xl', root).forEach(e => e.hidden = !isX);
      let match = () => false, formula, result;
      if (isX) {
        const key = +$('#xk', root).value, col = $('#xret', root).value, letter = Object.keys(COLS).find(k => COLS[k] === col);
        const hit = rows.find(r => r.order_id === key);
        formula = `=XLOOKUP(${key}, A2:A${last}, ${letter}2:${letter}${last}, "Not found")`;
        result = hit ? (col === 'amount' ? money(hit[col]) : hit[col]) : 'Not found'; match = r => r === hit;
      } else {
        const reg = $('#xr', root).value, st = $('#xs', root).value, op = $('#xo', root).value, v = +$('#xv', root).value;
        const crit = [];
        if (reg) crit.push(`C2:C${last}, "${reg}"`);
        if (st) crit.push(`D2:D${last}, "${st}"`);
        if (op) crit.push(`E2:E${last}, "${op}${v}"`);
        match = r => (!reg || r.region === reg) && (!st || r.status === st) && (!op || (op === '>=' ? r.amount >= v : r.amount < v));
        const m = rows.filter(match);
        if (!crit.length) crit.push(`A2:A${last}, "<>"`);
        if (f === 'SUMIFS') { formula = `=SUMIFS(E2:E${last}, ${crit.join(', ')})`; result = money(m.reduce((a, r) => a + r.amount, 0)); }
        else if (f === 'COUNTIFS') { formula = `=COUNTIFS(${crit.join(', ')})`; result = m.length; }
        else { formula = `=AVERAGEIFS(E2:E${last}, ${crit.join(', ')})`; result = m.length ? money(m.reduce((a, r) => a + r.amount, 0) / m.length) : '#DIV/0!'; }
      }
      $('#xform', root).textContent = formula; $('#xres', root).textContent = result;
      $('#xtbl', root).innerHTML = `<table class="sampletbl"><thead><tr><th></th>${Object.entries(COLS).map(([k, c]) => `<th>${k} · ${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr style="${match(r) ? 'background:color-mix(in srgb,var(--track) 16%,transparent)' : ''}"><td style="color:var(--muted)">${r.row}</td>${Object.values(COLS).map(c => `<td>${c === 'amount' ? money(r[c]) : r[c]}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    };
    $$('select,input', root).forEach(e => e.oninput = draw);
    draw();
  } },

/* ---------- Pivot builder ---------- */
{ id: 'da-pivot-lab', title: 'Pivot table builder', lede: 'Drag-free PivotTable: choose rows, columns and a value. The same summary is shown as the equivalent SQL, DAX and pandas code.',
  render(root) {
    const data = daRows();
    const F = { region: 'Region', status: 'Status', year: 'Year', month: 'Month' };
    root.innerHTML = `<div class="bench">
      <div class="lab-grid">
        <label><span>Rows</span><select id="pr">${Object.entries(F).map(([k, l]) => `<option value="${k}" ${k === 'region' ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label><span>Columns</span><select id="pc"><option value="">(none)</option>${Object.entries(F).map(([k, l]) => `<option value="${k}" ${k === 'year' ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label><span>Values</span><select id="pv"><option value="sum">Sum of amount</option><option value="count">Count of orders</option><option value="avg">Average amount</option><option value="dc">Distinct customers</option></select></label>
        <label><span>Show values as</span><select id="ps"><option value="">No calculation</option><option value="gt">% of grand total</option><option value="row">% of row total</option></select></label>
        <label><span>Filter status</span><select id="pf"><option value="">(all)</option><option>completed</option><option>cancelled</option><option>refunded</option></select></label>
      </div>
      <div id="pout"></div>
      <div id="pcode"></div>
    </div>`;
    const draw = () => {
      const R = $('#pr', root).value, C = $('#pc', root).value === R ? '' : $('#pc', root).value, V = $('#pv', root).value, S = $('#ps', root).value, FS = $('#pf', root).value;
      const rows = data.filter(d => !FS || d.status === FS);
      const rk = [...new Set(rows.map(d => d[R]))].sort(), ck = C ? [...new Set(rows.map(d => d[C]))].sort() : ['Total'];
      const agg = list => V === 'sum' ? list.reduce((a, d) => a + d.amount, 0) : V === 'count' ? list.length : V === 'avg' ? (list.length ? list.reduce((a, d) => a + d.amount, 0) / list.length : null) : new Set(list.map(d => d.customer_id)).size;
      const cell = (r, c) => agg(rows.filter(d => (r === null || d[R] === r) && (c === null || !C || d[C] === c)));
      const grand = cell(null, null);
      const fmtv = (v, rowTot) => v === null ? '' : S === 'gt' ? (100 * v / grand).toFixed(1) + '%' : S === 'row' ? (100 * v / rowTot).toFixed(1) + '%' : (V === 'sum' || V === 'avg') ? money(v) : v;
      const heads = [F[R], ...(C ? ck : []), 'Grand total'];
      const body = rk.map(r => { const tot = cell(r, null); return [r, ...(C ? ck.map(c => fmtv(cell(r, c), tot)) : []), fmtv(tot, tot)]; });
      body.push(['Grand total', ...(C ? ck.map(c => fmtv(cell(null, c), grand)) : []), fmtv(grand, grand)]);
      $('#pout', root).innerHTML = tableHTML(heads, body);
      const sqlCol = { region: 'c.region', status: 'o.status', year: "strftime('%Y', o.order_date)", month: "strftime('%Y-%m', o.order_date)" };
      const sqlAgg = { sum: 'SUM(o.amount)', count: 'COUNT(*)', avg: 'AVG(o.amount)', dc: 'COUNT(DISTINCT o.customer_id)' }[V];
      const daxM = { sum: 'SUM ( orders[amount] )', count: 'COUNTROWS ( orders )', avg: 'AVERAGE ( orders[amount] )', dc: 'DISTINCTCOUNT ( orders[customer_id] )' }[V];
      const pdAgg = { sum: "'sum'", count: "'count'", avg: "'mean'", dc: "'nunique'" }[V], pdVal = V === 'dc' ? 'customer_id' : V === 'count' ? 'order_id' : 'amount';
      const sql = `SELECT ${sqlCol[R]} AS ${R}${C ? `, ${sqlCol[C]} AS ${C}` : ''}, ${sqlAgg} AS value\nFROM orders o JOIN customers c ON c.customer_id = o.customer_id${FS ? `\nWHERE o.status = '${FS}'` : ''}\nGROUP BY ${R}${C ? `, ${C}` : ''}\nORDER BY ${R};`;
      const dax = `Value = ${daxM}${S === 'gt' ? `\n% of Grand Total = DIVIDE ( [Value], CALCULATE ( [Value], ALLSELECTED () ) )` : S === 'row' ? `\n% of Row = DIVIDE ( [Value], CALCULATE ( [Value], ALLSELECTED ( ${C === 'year' || C === 'month' ? "'Date'" : C === 'region' ? 'customers[region]' : 'orders[status]'} ) ) )` : ''}\n-- Matrix visual: Rows = ${F[R]}${C ? `, Columns = ${F[C]}` : ''}, Values = [Value]${FS ? `; filter status = "${FS}"` : ''}`;
      const pd = `df${FS ? `[df.status == "${FS}"]` : ''}.pivot_table(index="${R}", ${C ? `columns="${C}", ` : ''}values="${pdVal}", aggfunc=${pdAgg}, margins=True)`;
      snipCard($('#pcode', root), [['SQL', 'sql', sql], ['DAX', '', dax], ['pandas', 'python', pd]]);
    };
    $$('select', root).forEach(e => e.oninput = draw);
    draw();
  } },

/* ---------- DAX filter context lab ---------- */
{ id: 'da-dax-lab', title: 'DAX filter-context explorer', lede: 'A matrix of region × year, like a Power BI visual. Pick a measure and click any cell to see the filter context the report creates and how the measure changes it.',
  render(root) {
    const data = daRows().filter(d => d.status === 'completed');
    const regions = ['East', 'North', 'South', 'West'], years = ['2025', '2026'];
    const M = {
      rev: ['Revenue', 'SUM ( orders[amount] )', (r, y) => sum(r, y), 'No CALCULATE: the measure simply sums the rows left after the cell’s filters.'],
      west: ['West Revenue', 'CALCULATE ( [Revenue], customers[region] = "West" )', (r, y) => sum('West', y), 'CALCULATE replaces the region filter with region = West, so every row shows West’s number (the year filter is kept).'],
      all: ['All Regions', 'CALCULATE ( [Revenue], REMOVEFILTERS ( customers[region] ) )', (r, y) => sum(null, y), 'REMOVEFILTERS removes the region filter but keeps the year: each cell shows the total for its year.'],
      pct: ['% of Total', 'DIVIDE ( [Revenue], [All Regions] )', (r, y) => { const a = sum(null, y); return a ? sum(r, y) / a : null; }, 'Revenue in the cell’s context divided by the same context with region filters removed.'],
      py: ['Revenue PY', "CALCULATE ( [Revenue], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )", (r, y) => y === null ? null : (+y - 1 + '' === '2024' ? null : sum(r, String(+y - 1))), 'SAMEPERIODLASTYEAR shifts the date filter back one year; 2025 has no prior year in this data, so it is blank.'],
      yoy: ['YoY %', 'DIVIDE ( [Revenue] - [Revenue PY], [Revenue PY] )', (r, y) => { if (y !== '2026') return null; const p = sum(r, '2025'); return p ? (sum(r, y) - p) / p : null; }, 'Builds on two other measures; DIVIDE returns blank instead of an error when the prior year is blank. (2026 here covers January–September only.)']
    };
    function sum(r, y) { return data.filter(d => (r === null || d.region === r) && (y === null || d.year === y)).reduce((a, d) => a + d.amount, 0); }
    root.innerHTML = `<div class="bench">
      <div class="chipbar" id="dm">${Object.entries(M).map(([k, m], i) => `<button data-k="${k}" aria-pressed="${!i}">${m[0]}</button>`).join('')}</div>
      <pre class="code" style="max-height:none"><code id="dformula"></code></pre>
      <div class="tblwrap" id="dmat"></div>
      <div class="card" id="dexp"></div>
    </div>`;
    let key = 'rev', sel = ['West', '2026'];
    const fmtv = (k, v) => v === null || v === undefined ? '' : (k === 'pct' || k === 'yoy') ? (v * 100).toFixed(1) + '%' : money(v);
    const draw = () => {
      const m = M[key];
      $('#dformula', root).textContent = `${m[0]} = ${m[1]}`;
      const rowsR = [...regions, null], colsY = [...years, null];
      $('#dmat', root).innerHTML = `<table class="sampletbl"><thead><tr><th>Region</th>${colsY.map(y => `<th>${y || 'Total'}</th>`).join('')}</tr></thead><tbody>${rowsR.map(r => `<tr><td><b>${r || 'Total'}</b></td>${colsY.map(y => `<td><button class="inline-link" data-r="${r || ''}" data-y="${y || ''}" style="font-family:var(--f-mono);${sel[0] === (r || '') && sel[1] === (y || '') ? 'text-decoration:underline;font-weight:700' : 'font-weight:400;color:var(--ink)'}">${fmtv(key, m[2](r, y)) || '(blank)'}</button></td>`).join('')}</tr>`).join('')}</tbody></table>`;
      $$('#dmat button', root).forEach(b => b.onclick = () => { sel = [b.dataset.r, b.dataset.y]; draw(); });
      const [r, y] = sel;
      const ctx = [r ? `customers[region] = "${r}"` : 'no region filter (total row)', y ? `'Date'[Year] = ${y}` : 'no year filter (total column)'];
      $('#dexp', root).innerHTML = `<div class="panel-title">Selected cell: ${r || 'Total'} × ${y || 'Total'}</div>
        <p style="margin:4px 0"><b>Filter context from the visual:</b> ${ctx.join(' AND ')}.</p>
        <p style="margin:4px 0"><b>What the measure does:</b> ${m[3]}</p>
        <p style="margin:4px 0"><b>Result:</b> ${fmtv(key, m[2](r || null, y || null)) || '(blank)'}</p>`;
    };
    $$('#dm button', root).forEach(b => b.onclick = () => { $$('#dm button', root).forEach(x => x.setAttribute('aria-pressed', x === b)); key = b.dataset.k; draw(); });
    draw();
  } },

/* ---------- Statistics & A/B lab ---------- */
{ id: 'da-stats-lab', title: 'Statistics & A/B test lab', lede: 'First, see how one outlier moves the mean but not the median. Then run an A/B test calculator: significance, confidence interval and the sample size you need.',
  render(root) {
    root.innerHTML = `<div class="bench">
      <h3 style="margin:0">Mean vs median</h3>
      <div class="lab-grid"><label><span>Largest order: <b id="sov">$60</b></span><input type="range" id="so" min="60" max="2000" step="10" value="60"></label></div>
      <div id="sbars"></div>
      <div class="stat3" id="sstat"></div>
    </div>
    <div class="bench" style="margin-top:16px">
      <h3 style="margin:0">A/B test calculator</h3>
      <div class="lab-grid">
        <label><span>A visitors</span><input type="number" id="an" value="10040"></label><label><span>A conversions</span><input type="number" id="ac" value="532"></label>
        <label><span>B visitors</span><input type="number" id="bn" value="9960"></label><label><span>B conversions</span><input type="number" id="bc" value="598"></label>
      </div>
      <div class="stat3" id="abres"></div>
      <div class="card" id="abverdict"></div>
      <h3 style="margin:8px 0 0">Sample size planner</h3>
      <div class="lab-grid">
        <label><span>Baseline conversion (%)</span><input type="number" id="ssb" value="5" step="0.1"></label>
        <label><span>Minimum detectable lift (relative %)</span><input type="number" id="ssl" value="10" step="1"></label>
        <label><span>Power</span><select id="ssp"><option value="0.8">80%</option><option value="0.9">90%</option></select></label>
      </div>
      <div class="card" id="ssres"></div>
    </div>`;
    const base = [22, 25, 28, 31, 33, 36, 38, 41, 45, 48, 52, 60];
    const stats = () => {
      const top = +$('#so', root).value, vals = [...base.slice(0, -1), top].sort((a, b) => a - b);
      $('#sov', root).textContent = money(top);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length, med = (vals[5] + vals[6]) / 2, max = Math.max(...vals);
      const sd = Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / (vals.length - 1));
      $('#sbars', root).innerHTML = `<div class="lat">${vals.map((v, i) => `<div class="r"><span>Order ${i + 1}</span><b>${money(v)}</b><span class="bar" style="width:${Math.max(2, v / max * 100)}%"></span></div>`).join('')}</div>`;
      $('#sstat', root).innerHTML = [['Mean', money(mean)], ['Median', money(med)], ['Std deviation', money(sd)], ['Mean ÷ median', (mean / med).toFixed(2) + '×']].map(([l, b]) => `<div class="card"><div class="big">${b}</div><div class="lbl">${l}</div></div>`).join('');
    };
    const ab = () => {
      const an = +$('#an', root).value, ac = +$('#ac', root).value, bn = +$('#bn', root).value, bc = +$('#bc', root).value;
      if (!(an > 0 && bn > 0) || ac > an || bc > bn) { $('#abres', root).innerHTML = ''; $('#abverdict', root).innerHTML = '<span class="no">Check the inputs: conversions can’t exceed visitors.</span>'; return; }
      const pa = ac / an, pb = bc / bn, pp = (ac + bc) / (an + bn);
      const se0 = Math.sqrt(pp * (1 - pp) * (1 / an + 1 / bn)), z = se0 ? (pb - pa) / se0 : 0, p = 2 * (1 - normCdf(Math.abs(z)));
      const se1 = Math.sqrt(pa * (1 - pa) / an + pb * (1 - pb) / bn), lo = (pb - pa) - 1.96 * se1, hi = (pb - pa) + 1.96 * se1;
      const srm = Math.abs(an - bn) / Math.sqrt(an + bn), srmP = 2 * (1 - normCdf(srm));
      $('#abres', root).innerHTML = [['A conversion', (pa * 100).toFixed(2) + '%'], ['B conversion', (pb * 100).toFixed(2) + '%'], ['Relative lift', (pa ? ((pb - pa) / pa * 100).toFixed(1) : '–') + '%'], ['z', z.toFixed(2)], ['p-value', p < 0.0001 ? '< 0.0001' : p.toFixed(4)], ['95% CI (B − A)', `${(lo * 100).toFixed(2)} to ${(hi * 100).toFixed(2)} pts`]].map(([l, b]) => `<div class="card"><div class="big" style="font-size:22px">${b}</div><div class="lbl">${l}</div></div>`).join('');
      $('#abverdict', root).innerHTML = (p < 0.05 ? `<b class="ok">Statistically significant at α = 0.05.</b> ${lo > 0 ? 'B is better: the whole interval is above zero.' : 'B is worse: the whole interval is below zero.'}` : `<b class="no">Not significant at α = 0.05.</b> The interval includes zero; the data can’t distinguish the variants. Collect more data or accept no detectable difference.`) +
        (srmP < 0.01 ? `<br><b class="no">Warning:</b> sample ratio mismatch (p = ${srmP.toFixed(4)}) for a 50/50 test. Check assignment before trusting results.` : '');
    };
    const ss = () => {
      const p1 = +$('#ssb', root).value / 100, p2 = p1 * (1 + +$('#ssl', root).value / 100), zb = +$('#ssp', root).value === 0.9 ? 1.2816 : 0.8416;
      if (!(p1 > 0 && p2 < 1 && p2 !== p1)) { $('#ssres', root).textContent = 'Enter a baseline between 0 and 100% and a non-zero lift.'; return; }
      const pbar = (p1 + p2) / 2, n = Math.ceil(((1.96 * Math.sqrt(2 * pbar * (1 - pbar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2) / (p2 - p1) ** 2);
      $('#ssres', root).innerHTML = `To detect ${(p1 * 100).toFixed(2)}% → ${(p2 * 100).toFixed(2)}% (α = 0.05, two-sided, ${Math.round((zb === 0.8416 ? 0.8 : 0.9) * 100)}% power) you need about <b>${n.toLocaleString('en-US')} users per variant</b> (${(2 * n).toLocaleString('en-US')} total). Smaller lifts need far more users: halving the lift roughly quadruples the sample.`;
    };
    $('#so', root).oninput = stats;
    ['#an', '#ac', '#bn', '#bc'].forEach(id => $(id, root).oninput = ab);
    ['#ssb', '#ssl', '#ssp'].forEach(id => $(id, root).oninput = ss);
    stats(); ab(); ss();
  } },

/* ---------- Final quiz ---------- */
{ id: 'da-quiz', n: 10, title: 'Data analytics final quiz', lede: 'Ten questions across statistics, Excel, SQL, Power BI, Tableau and Python.',
  render(root) { quiz(root, [
    SQ('Order values are right-skewed. Which summary describes a typical order?', ['Mean', 'Median', 'Max', 'Range'], 1, 'The median resists the long tail.'),
    SQ('You copy =C2*$H$1 down one row. Result?', ['=C3*$H$2', '=C3*$H$1', '=C2*$H$1', '=D2*$H$1'], 1, 'Relative refs shift; absolute refs stay.'),
    SQ('Which Excel function returns a value from another table by key, with a built-in “not found” value?', ['SUMIFS', 'XLOOKUP', 'COUNTIFS', 'TEXTJOIN'], 1, 'XLOOKUP(value, lookup_array, return_array, if_not_found).'),
    SQ('Where do conditions on aggregates go in SQL?', ['WHERE', 'HAVING', 'ORDER BY', 'FROM'], 1, 'WHERE runs before grouping; HAVING filters groups.'),
    SQ('LEFT JOIN customers to orders, then WHERE o.order_id IS NULL returns…', ['All orders', 'Customers who never ordered', 'Duplicate customers', 'Nothing'], 1, 'An anti-join.'),
    SQ('Top 3 products per category in SQL uses…', ['LIMIT 3', 'ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC)', 'GROUP BY 3', 'DISTINCT'], 1, 'Partitioned ranking, filtered in an outer query.'),
    SQ('In DAX, what does CALCULATE do?', ['Formats numbers', 'Evaluates an expression in a modified filter context', 'Creates relationships', 'Refreshes data'], 1, 'It is the core of almost every advanced measure.'),
    SQ('In Tableau, which expression computes each customer’s first order date regardless of the view?', ['RUNNING_SUM', '{FIXED [Customer ID] : MIN([Order Date])}', 'WINDOW_MIN', 'ATTR([Order Date])'], 1, 'FIXED LODs compute at the specified grain.'),
    SQ('An A/B test has p = 0.20. The right conclusion is…', ['B is worse', 'No difference exists', 'The data can’t distinguish the variants at this sample size', 'B is 20% better'], 2, 'Not significant ≠ no effect.'),
    SQ('A pandas merge increased the row count of orders. What should you suspect?', ['Nothing', 'Duplicate keys in the right table', 'Missing values', 'Wrong dtypes'], 1, 'Many-to-one merges should keep the row count; use validate="many_to_one".')
  ]); } }
];

const DA_PAGES = {
  daCapstone(el) {
    el.innerHTML = `<div class="card"><h3>From zero to analyst</h3><p style="margin:6px 0 0;max-width:70ch">Take the final quiz in the Check step, then build a portfolio. Hiring managers want to see real questions answered end to end, not certificates.</p></div>
      <h2 class="section-title">Portfolio projects</h2><div class="steps4">
      <div class="card"><h3>Sales dashboard</h3><p>A public dataset (e.g. a retail or superstore dataset) → SQL cleaning → Power BI or Tableau dashboard with YoY measures and drill-through.</p></div>
      <div class="card"><h3>SQL case study</h3><p>Answer 10 business questions with CTEs and window functions; publish the queries and findings in a README.</p></div>
      <div class="card"><h3>Excel model</h3><p>A budget or pricing model with input cells, SUMIFS/XLOOKUP, scenarios and a summary dashboard.</p></div>
      <div class="card"><h3>A/B test write-up</h3><p>Analyze a public experiment dataset in Python: validity checks, significance, confidence intervals, recommendation.</p></div>
      <div class="card"><h3>Cohort & churn analysis</h3><p>Retention heatmap, RFM segments and a sized recommendation.</p></div>
      <div class="card"><h3>Tableau Public profile</h3><p>Two or three polished, well-titled visualizations people can interact with.</p></div></div>
      <h2 class="section-title">Certifications & next steps</h2>
      ${UL([`<b>Microsoft PL-300</b> (Power BI Data Analyst) and <b>Tableau Certified Data Analyst</b> are widely recognized.`, `<b>Google Data Analytics Certificate</b> for a structured beginner path.`, `Practice SQL daily on interview-style problems (LeetCode database set, DataLemur, StrataScratch).`, `Learn <b>dbt</b> and a cloud warehouse (BigQuery, Snowflake) to move toward analytics engineering.`, `Learn regression and forecasting (statsmodels, scikit-learn) to move toward data science.`])}`;
  }
};
