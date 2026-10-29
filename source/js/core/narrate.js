/* ===== Listen to this topic: narrated, in-depth audio for algorithm topics (built-in TTS) ===== */

/* In-depth narration scripts for the algorithm topics that have no EXPLAIN entry.
   Same 5-part shape as EXPLAIN (idea, steps, why, cost, use) so narration is consistent. */
const NARR = {
  bellmanford: {
    idea: `Bellman–Ford finds the shortest path from one source vertex to every other vertex, and unlike Dijkstra it works even when some edges have negative weights. It does this by repeatedly relaxing — that is, trying to improve — every edge in the graph.`,
    steps: [`Set the distance to the source to zero and every other distance to infinity.`, `Relax every edge once: if reaching a vertex through an edge is shorter than its current best distance, lower it. That is one full pass over all the edges.`, `Repeat that full pass V minus one times, where V is the number of vertices.`, `Do one more pass. If any edge can still be relaxed, a negative-weight cycle is reachable from the source.`],
    why: `A shortest path that does not repeat a vertex uses at most V minus one edges. After the first pass every one-edge shortest path is correct, after the second every two-edge path is correct, and so on, so V minus one passes settle them all — unless a negative cycle lets distances fall forever, which the extra pass catches.`,
    cost: `Each pass relaxes all E edges and there are V passes, so the time is O(V·E). That is slower than Dijkstra's O(E log V); the extra cost buys the ability to handle negative edges.`,
    use: `Use Bellman–Ford when edges can be negative — currency arbitrage, costs with penalties — or when you must detect a negative cycle. With only non-negative weights, prefer Dijkstra. Capping the passes at K yields the cheapest path using at most K edges.`
  },
  fenwick: {
    idea: `A Fenwick tree, also called a binary indexed tree, is a compact array that keeps a running total you can both query and update quickly. It answers prefix-sum questions and applies point updates, each in logarithmic time, using the lowest set bit of each index.`,
    steps: [`Each position stores the sum of a block of the array whose length is the lowest set bit of that index.`, `For a prefix sum up to index i, add the value at i, then strip off the lowest set bit to jump to the next block, repeating until you reach zero.`, `To add a value at index i, update position i, then move to the next index that covers it by adding its lowest set bit, repeating up to the end.`, `Each walk touches only about log n positions, because changing the lowest bit moves you quickly across the index range.`],
    why: `The lowest set bit defines a hierarchy of ranges that together cover any prefix with only about log n blocks, so both the query and the update visit a logarithmic number of cells.`,
    cost: `Both the prefix sum and the point update run in O(log n), and the whole structure is a single array of size n, so it is very memory efficient.`,
    use: `Reach for a Fenwick tree when you need fast prefix sums with updates and an invertible operation such as addition or XOR — counting inversions, running totals. For range minimum or maximum, which are not invertible, use a segment tree instead.`
  },
  floydwarshall: {
    idea: `Floyd–Warshall computes the shortest distance between every pair of vertices with a remarkably short triple loop. Its idea is to consider, one vertex at a time, whether routing a path through that vertex makes any pair of vertices closer.`,
    steps: [`Start with a distance matrix: d from i to j is the direct edge weight, zero on the diagonal, and infinity where there is no edge.`, `Pick an intermediate vertex k. For every pair i and j, check whether going from i to k and then k to j beats the current best, and if so update it.`, `Repeat with every vertex as the intermediate. The k loop must be the outermost loop.`, `When every vertex has served as an intermediate, the matrix holds the shortest distance between all pairs.`],
    why: `After the first k vertices have been allowed as intermediates, the matrix holds the shortest paths that use only those vertices. Allowing one more vertex at a time eventually permits all of them, giving true shortest paths. A negative cycle reveals itself as a negative value on the diagonal.`,
    cost: `Three nested loops over all vertices give O(n³) time and O(n²) space, which is practical only for small, dense graphs of up to a few hundred vertices.`,
    use: `Use Floyd–Warshall for all-pairs shortest paths on a small graph, or to compute a graph's transitive closure. For a single source, or for a large graph, run Dijkstra or Bellman–Ford from each source instead.`
  },
  kmp: {
    idea: `KMP — the Knuth–Morris–Pratt algorithm — finds every occurrence of a pattern inside a text in linear time. It avoids the wasted work of naive matching by precomputing, for each position in the pattern, how far to fall back after a mismatch, so the text pointer never moves backwards.`,
    steps: [`First build the failure array, often called lps: for each prefix of the pattern, record the length of the longest proper prefix that is also a suffix of it.`, `To search, scan the text one character at a time, tracking how many pattern characters currently match.`, `On a mismatch, instead of restarting, fall back using the failure array to the next-longest matching prefix and try again — without re-reading any text character.`, `When the match count reaches the pattern length you have found an occurrence; fall back again to catch overlapping matches.`],
    why: `The failure array captures the pattern's internal repetition, so after a mismatch you already know which characters still match and resume from there. Since the text pointer only moves forward, and the match count falls at most as often as it rose, the total work is linear.`,
    cost: `Building the failure array is O(m) for a pattern of length m, and the search is O(n) for a text of length n, so the total is O(n + m) — far better than the O(n·m) of naive matching — using O(m) extra space.`,
    use: `Use KMP for guaranteed linear-time matching, especially against adversarial inputs that make naive search slow. The same failure function also answers the shortest-period and longest-border questions about a string.`
  },
  rabinkarp: {
    idea: `Rabin–Karp searches for a pattern by comparing hashes instead of characters. It hashes the pattern and each window of the text, and because it uses a rolling hash it can update the window's hash in constant time as the window slides.`,
    steps: [`Treat each string as a number in some base, taken modulo a large prime, and compute the hash of the pattern and of the first text window.`, `Compare the window's hash with the pattern's. If they are equal, verify character by character to rule out a collision.`, `Slide the window by one: remove the contribution of the character leaving on the left, shift, and add the new character on the right — all in constant time.`, `Continue until the window has passed over the whole text.`],
    why: `Equal strings always hash equal, so a hash mismatch proves the strings differ and is skipped instantly. Equal hashes usually mean equal strings but can collide, which is why matches are verified. The rolling update works because the hash is a positional polynomial, so one character's contribution can be removed and another added arithmetically.`,
    cost: `The average case is O(n + m), since most windows are rejected by a single hash comparison; a bad modulus or many collisions degrade the worst case to O(n·m). It uses constant extra space.`,
    use: `Rabin–Karp shines when searching for many patterns at once — compare all their hashes against each window — and it powers longest-duplicate-substring and plagiarism detection. For a single pattern with worst-case guarantees, KMP is safer.`
  },
  recursion: {
    idea: `Recursion is when a function solves a problem by calling itself on a smaller version of the same problem, stopping at a base case. It is the foundation beneath tree traversals, backtracking, and dynamic programming.`,
    steps: [`Identify the base case — the smallest input you can answer directly, with no further recursion.`, `Identify the recursive case — how to break the problem into one or more smaller subproblems of the same kind.`, `Make the recursive call on the smaller input, trusting that it returns the correct answer.`, `Combine the results of the subproblems into the answer for the current input.`],
    why: `Recursion is correct by induction: if the base case is right, and each step builds its answer correctly from correct smaller answers, every case is right. The mental shift is to trust the recursive call rather than trace every level — you only verify the base case and how you combine results.`,
    cost: `The total cost is the number of calls times the work per call; drawing the recursion tree is the easiest way to count the calls. Mind the depth: each pending call uses stack memory, so recursion millions of levels deep can overflow the stack and should be made iterative.`,
    use: `Reach for recursion whenever a problem is naturally self-similar — trees, graphs, divide and conquer, generating combinations, dynamic programming. When it recomputes the same subproblem repeatedly, add memoization; when it would go too deep, convert it to an explicit stack or a loop.`
  },
  scc: {
    idea: `A strongly connected component is a maximal group of vertices in a directed graph where every vertex can reach every other. Tarjan's algorithm finds all of them in a single depth-first search using two numbers per vertex: a discovery index and a low-link value.`,
    steps: [`Run a depth-first search, giving each vertex a discovery index in the order it is first visited, and pushing it onto a stack.`, `Track each vertex's low-link: the smallest discovery index reachable from its subtree using tree edges and at most one back edge to a vertex still on the stack.`, `After exploring a vertex's neighbors, update its low-link from its children and from any on-stack neighbors.`, `When a vertex's low-link equals its own discovery index, it is the root of a component: pop the stack down to it, and those vertices form one strongly connected component.`],
    why: `The low-link measures whether a vertex can reach back to an earlier vertex on the current search path. If it cannot — its low-link equals its own index — nothing above it on the stack belongs to its cycle, so it closes a component. The stack guarantees each component is popped together, exactly once.`,
    cost: `Tarjan's runs in O(V + E), visiting every vertex and edge a constant number of times, with linear extra space for the indices, low-links, and stack.`,
    use: `Use strongly connected components to find cycles in dependency graphs, to collapse each component into one node — giving a DAG called the condensation that can be topologically sorted — and inside two-satisfiability solvers. Kosaraju's algorithm is a simpler two-pass alternative using the reversed graph.`
  },
  segtree: {
    idea: `A segment tree is a binary tree built over an array where each node stores an aggregate — a sum, minimum, or maximum — of a contiguous range. It lets you both query a range and update a single element in logarithmic time.`,
    steps: [`The leaves are the array elements; each internal node stores the combined aggregate of its two children's ranges.`, `To query a range, descend from the root, combining the aggregates of the nodes that exactly cover parts of the query range.`, `To update an element, change its leaf, then walk back up to the root, recombining each parent from its children.`, `Both operations visit only about log n nodes, since at each level only a couple of nodes are relevant.`],
    why: `The tree has logarithmic height and any range decomposes into about log n canonical node ranges, so a query touches only that many nodes and a point update affects only the path from a leaf to the root. The operation just needs to be associative so partial results can be combined.`,
    cost: `Range query and point update each run in O(log n), and the tree uses O(n) space. With lazy propagation you can also apply an update across a whole range in O(log n).`,
    use: `Use a segment tree when you need range queries together with updates and the operation is not invertible — like range minimum or maximum, where a Fenwick tree cannot help. For pure prefix sums with point updates a Fenwick tree is simpler; for a static array a prefix-sum array answers queries in constant time.`
  }
};

/* ---------- text → speech-friendly text ---------- */
function ttsNorm(s) {
  s = String(s == null ? '' : s);
  s = s.replace(/<\/(td|th)>/gi, ', ').replace(/<\/(tr|li|p|h[1-6]|div|section|dt|dd)>/gi, '. '); // structure → pauses
  s = s.replace(/<[^>]+>/g, ' ');                                   // strip any HTML tags
  s = s.replace(/&amp;/g, ' and ').replace(/&lt;/g, ' less than ').replace(/&gt;/g, ' greater than ')
       .replace(/&times;/g, ' times ').replace(/&minus;/g, ' minus ').replace(/&rarr;/g, ' then ')
       .replace(/&ndash;/g, ' to ').replace(/&mdash;/g, ', ').replace(/&hellip;/g, ' ').replace(/&nbsp;/g, ' ')
       .replace(/&deg;/g, ' degrees ').replace(/&[a-z]+;/g, ' ');
  // Big-O notation → spoken
  s = s.replace(/O\(1\)/g, 'O of one')
       .replace(/O\(n\s*log\s*n\)/gi, 'O of n log n')
       .replace(/O\(log\s*n\)/gi, 'O of log n')
       .replace(/O\(α\(n\)\)/g, 'O of nearly constant')
       .replace(/O\(([^)]{1,24})\)/g, (m, g) => 'O of ' + g);        // generic O(...)
  s = s.replace(/\.\./g, ' to ');                                   // ranges a..b
  // array / subscript indexing: A[i], dist[v], d[i][j]
  s = s.replace(/\b([A-Za-z]\w*)\s*\[\s*([^\]]+?)\s*\]\s*\[\s*([^\]]+?)\s*\]/g, '$1 of $2 and $3');
  s = s.replace(/\b([A-Za-z]\w*)\s*\[\s*([^\]]+?)\s*\]/g, '$1 of $2');
  // math symbols
  s = s.replace(/²/g, ' squared ').replace(/³/g, ' cubed ')
       .replace(/−/g, ' minus ').replace(/–/g, ' to ').replace(/—/g, ', ')
       .replace(/×/g, ' times ').replace(/·/g, ' times ').replace(/÷/g, ' divided by ')
       .replace(/≤/g, ' less than or equal to ').replace(/≥/g, ' greater than or equal to ')
       .replace(/≠/g, ' not equal to ').replace(/≈/g, ' approximately ').replace(/≡/g, ' congruent to ')
       .replace(/→/g, ' gives ').replace(/←/g, ' becomes ').replace(/∞/g, ' infinity ')
       .replace(/Σ/g, ' the sum of ').replace(/√/g, ' the square root of ')
       .replace(/α/g, ' alpha ').replace(/β/g, ' beta ').replace(/δ/g, ' delta ').replace(/θ/g, ' theta ')
       .replace(/⌈|⌉|⌊|⌋/g, ' ');
  s = s.replace(/([A-Za-z])\/([A-Za-z])/g, '$1 or $2');             // min/max → min or max
  s = s.replace(/\s*&\s*/g, ' and ');                               // stray ampersands
  s = s.replace(/[“”]/g, '').replace(/[‘’]/g, "'");
  s = s.replace(/\s+([,.;:!?])/g, '$1').replace(/\s+/g, ' ').trim();
  return s;
}

const NARR_ORD = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
function splitSentences(s) {
  return (s.match(/[^.!?]+[.!?]+["')\]]*|\S[^.!?]*$/g) || [s]).map(x => x.trim()).filter(Boolean);
}
/* System-design topics (section-based) → ordered narration segments */
function narrSegmentsSD(k) {
  const T = SD[k]; if (!T) return [];
  const segs = [['Overview', (T.name || '') + '. ' + (T.blurb || '')]];
  (T.sections || []).forEach(sec => {
    if (!Array.isArray(sec) || !sec[1]) return;
    segs.push([String(sec[0]).replace(/<[^>]+>/g, '').trim() || 'More', sec[1]]);
  });
  if (T.edge && T.edge.length) segs.push([T.edgeTitle || 'Edge cases & gotchas', T.edge.join('. ')]);
  if (T.faq && T.faq.length) segs.push(['Common questions', T.faq.map(qa => qa[0] + '. ' + qa[1]).join('. ')]);
  return segs;
}
/* ordered narration segments for a topic: [[label, text], ...] */
function narrSegments(k) {
  if (typeof SD !== 'undefined' && SD[k]) return narrSegmentsSD(k);
  const A = ALGOS[k]; if (!A) return [];
  const dom = (typeof catInfo !== 'undefined') ? catInfo(A.cat).domain : 'algorithms';
  const soft = ['classical', 'nchash', 'basics'].includes(A.cat);
  const L = dom === 'algorithms'
    ? ['The idea', 'Step by step', 'Why it works', 'Complexity, explained', 'When to use it']
    : ['The idea', 'Step by step', soft ? 'Is it secure?' : 'Why it’s secure', 'Cost & parameters', 'Using it safely'];
  const E = (typeof EXPLAIN !== 'undefined' && EXPLAIN[k]) || NARR[k];
  const segs = [['Overview', (A.name || '') + '. ' + (A.blurb || '')]];
  if (E && E.steps) {
    if (E.idea) segs.push([L[0], E.idea]);
    segs.push([L[1], E.steps.map((s, i) => (NARR_ORD[i] ? NARR_ORD[i] + ', ' : 'Then, ') + s.charAt(0).toLowerCase() + s.slice(1)).join(' ')]);
    if (E.why) segs.push([L[2], E.why]);
    if (E.cost) segs.push([L[3], E.cost]);
    if (E.use) segs.push([L[4], E.use]);
  } else {
    if (A.pts && A.pts.length) segs.push(['Key ideas', A.pts.join(' ')]);
    if (A.cx) segs.push(['Complexity', A.cx.map(r => r[0] + ' is ' + r[1] + (r[2] ? ', ' + r[2] : '') + '.').join(' ')]);
  }
  return segs;
}

/* ---------- voice ---------- */
let NARR_VOICES = [];
function narrLoadVoices() { try { NARR_VOICES = speechSynthesis.getVoices() || []; } catch (e) {} }
if (typeof window !== 'undefined' && window.speechSynthesis) { narrLoadVoices(); try { speechSynthesis.onvoiceschanged = narrLoadVoices; } catch (e) {} }
function pickEnVoice() {
  if (!NARR_VOICES.length) narrLoadVoices();
  const en = NARR_VOICES.filter(v => /^en\b|^en-/i.test(v.lang));
  const pref = en.find(v => /en-US/i.test(v.lang) && v.localService) || en.find(v => v.localService) || en.find(v => /en-US|en-GB/i.test(v.lang)) || en[0];
  return pref || null;
}

/* ---------- player ---------- */
let NARR_CTRL = null;
function narrStopGlobal() { try { if (NARR_CTRL) NARR_CTRL.stop(); } catch (e) {} try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} }
if (typeof window !== 'undefined' && !window.__narrHook) { window.__narrHook = 1; try { window.addEventListener('hashchange', narrStopGlobal); window.addEventListener('beforeunload', narrStopGlobal); } catch (e) {} }

function narrTtsOk() { return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined'; }
function narrateBar(host, k) {
  if (!host) return;
  const segs = narrSegments(k);
  if (!segs.length) { host.innerHTML = ''; return; }
  const queue = [];
  segs.forEach(([label, text]) => splitSentences(ttsNorm(text)).forEach(sent => queue.push({ sent, label })));
  if (!queue.length) { host.innerHTML = ''; return; }
  let rate = +store.get('bf-narrate', 1) || 1;
  host.className = 'audiobar noprint';
  host.innerHTML = `<button class="btn primary audbtn" data-ab="play">▶ Listen to this topic</button>
    <button class="btn audbtn" data-ab="pause" hidden>⏸ Pause</button>
    <button class="btn audbtn" data-ab="resume" hidden>▶ Resume</button>
    <button class="btn audbtn" data-ab="stop" hidden>■ Stop</button>
    <span class="audiostat section-sub" style="margin:0">In-depth audio walkthrough · ~${Math.max(1, Math.round(queue.reduce((n, q) => n + q.sent.split(' ').length, 0) / 150))} min</span>
    <span class="chipbar audrate" aria-label="Speed">${[[0.85, '0.85×'], [1, '1×'], [1.15, '1.15×'], [1.3, '1.3×']].map(([v, l]) => `<button data-r="${v}" aria-pressed="${v === rate}">${l}</button>`).join('')}</span>`;
  const B = s => $(`[data-ab="${s}"]`, host), stat = $('.audiostat', host);
  let i = 0, playing = false;
  const ui = state => { B('play').hidden = state !== 'idle'; B('pause').hidden = state !== 'playing'; B('resume').hidden = state !== 'paused'; B('stop').hidden = state === 'idle'; };
  const speakNext = () => {
    if (!playing) return;
    if (i >= queue.length) { stat.textContent = 'Finished.'; playing = false; i = 0; ui('idle'); return; }
    const it = queue[i];
    stat.textContent = `▶ ${it.label} · ${Math.round(100 * i / queue.length)}%`;
    const u = new SpeechSynthesisUtterance(it.sent);
    const v = pickEnVoice(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
    u.rate = rate; u.pitch = 1;
    u.onend = () => { if (playing) { i++; speakNext(); } };
    u.onerror = () => { if (playing) { i++; speakNext(); } };
    try { speechSynthesis.speak(u); } catch (e) {}
  };
  const stop = () => { playing = false; i = 0; try { speechSynthesis.cancel(); } catch (e) {} stat.textContent = 'Stopped.'; ui('idle'); };
  const start = () => {
    if (!narrTtsOk()) { stat.textContent = 'Audio narration needs a browser with text-to-speech (try Chrome/Safari, or the installed app). It may be blocked in this preview.'; return; }
    narrStopGlobal(); NARR_CTRL = { stop }; playing = true; ui('playing'); try { speechSynthesis.cancel(); } catch (e) {} setTimeout(speakNext, 80);
  };
  B('play').onclick = start;
  B('pause').onclick = () => { try { speechSynthesis.pause(); } catch (e) {} ui('paused'); stat.textContent = stat.textContent.replace('▶', '⏸'); };
  B('resume').onclick = () => { try { speechSynthesis.resume(); } catch (e) {} ui('playing'); };
  B('stop').onclick = stop;
  $$('.audrate button', host).forEach(b => b.onclick = () => {
    rate = +b.dataset.r; store.set('bf-narrate', rate);
    $$('.audrate button', host).forEach(x => x.setAttribute('aria-pressed', x === b));
    if (playing) { try { speechSynthesis.cancel(); } catch (e) {} setTimeout(speakNext, 60); }  // apply new speed immediately
  });
}
