/* ================= Domains & library ================= */
const DOMAINS = [
  ['algorithms', 'Algorithms', CATS],
  ['hashing', 'Hashing', [['hashes', 'Cryptographic hash functions'], ['nchash', 'Non-cryptographic hashing'], ['kdf', 'Password hashing & key derivation'], ['mac', 'Message authentication (MACs)']]],
  ['crypto', 'Cryptography', [['classical', 'Classical ciphers'], ['basics', 'Encoding & randomness'], ['symmetric', 'Symmetric encryption'], ['publickey', 'Public-key & key exchange'], ['signatures', 'Digital signatures'], ['advanced', 'Advanced & post-quantum']]]
];
const ALL_CATS = DOMAINS.flatMap(([d, , cats]) => cats.map(([id, name]) => ({ id, name, domain: d })));
const catInfo = id => ALL_CATS.find(c => c.id === id) || { id, name: id, domain: 'algorithms' };
const TOPICS = ALL_CATS.flatMap(c => Object.keys(ALGOS).filter(k => ALGOS[k].cat === c.id));
const domainName = d => (DOMAINS.find(x => x[0] === d) || [d, d])[1];

function topicCards(keys) {
  return `<div class="libgrid">${keys.map(k => {
    const A = ALGOS[k];
    return `<button class="libcard" data-k="${k}"><span class="k"><span>${catInfo(A.cat).name}</span>${seenAlgos[k] ? '<span class="seen">✓ studied</span>' : ''}</span><h3>${esc(A.name)}</h3><p>${A.blurb}</p><span class="cxl">${pickCx(A)}</span></button>`;
  }).join('')}</div>`;
}

function mixedCards(keys) {
  return keys.map(k => SD[k] ? sdTopicCards([k]) : topicCards([k])).join('').replace(/<\/div><div class="libgrid">/g, '');
}
function sdTopicCards(keys) {
  return `<div class="libgrid">${keys.map(k => {
    const T = SD[k];
    return `<button class="libcard" data-k="${k}"><span class="k"><span>${sdCatName(T.cat)}</span>${seenAlgos['sd:' + k] ? '<span class="seen">✓ studied</span>' : ''}</span><h3>${esc(T.name)}</h3><p>${T.blurb}</p><span class="cxl">${T.facts ? T.facts.slice(0, 2).map(f => f[1]).join(' · ') : ''}</span></button>`;
  }).join('')}</div>`;
}

function pickCx(A) {
  const t = A.cx.find(r => /worst/i.test(r[0])) || A.cx.find(r => /time/i.test(r[0])) || A.cx[0];
  const s = A.cx.find(r => /space|status/i.test(r[0]) && r !== t);
  return `${t[1]}${s ? ' · ' + s[1] : ''}`;
}

/* ---------- detailed explanation ---------- */
function explainHTML(k) {
  const E = EXPLAIN[k]; if (!E) return '';
  const A = ALGOS[k], dom = catInfo(A.cat).domain, isAlgo = dom === 'algorithms';
  const soft = ['classical', 'nchash', 'basics'].includes(A.cat);
  const H = isAlgo ? ['The idea', 'Step by step', 'Why it works', 'Complexity, explained', 'When to use it']
    : ['The idea', 'Step by step', soft ? 'Is it secure?' : 'Why it’s secure', 'Cost & parameters', 'Using it safely'];
  const sec = (i, body) => `<section class="xsec"><h3><span class="xn">${i + 1}</span>${H[i]}</h3>${body}</section>`;
  return `<h2 class="section-title">How it works</h2>
    <div class="card explain">
      ${sec(0, `<p>${E.idea}</p>`)}
      ${sec(1, `<ol class="xsteps">${E.steps.map(s => `<li>${s}</li>`).join('')}</ol>`)}
      ${sec(2, `<p>${E.why}</p>`)}
      ${sec(3, `<p>${E.cost}</p>`)}
      ${sec(4, `<p>${E.use}</p>`)}
    </div>`;
}

/* One topic page. nav = { keys, onBack, backLabel, onOpen, noFoot } */
function topicDetail(root, k, nav) {
  const A = ALGOS[k], keys = nav.keys, idx = keys.indexOf(k);
  seenAlgos[k] = true; store.set('bf-libseen', seenAlgos);
  const practice = PROBS.filter(p => (p.rel || []).includes(k));
  const dom = catInfo(A.cat).domain;
  root.innerHTML = `${nav.onBack ? `<button class="backlink" id="tback">← ${nav.backLabel}</button>` : ''}
    ${nav.noEyebrow ? '' : `<div class="eyebrow">${nav.eyebrow || domainName(dom) + ' · ' + catInfo(A.cat).name}</div>`}
    <h2 class="topic-h">${esc(A.name)}</h2>${printBtn()}
    <p class="lede" style="margin-bottom:12px">${A.blurb}</p>
    <div class="cxstrip">${A.cx.slice(0, 4).map(r => `<span><small>${r[0]}</small><b>${r[1]}</b></span>`).join('')}</div>
    ${explainHTML(k)}
    <h2 class="section-title">Worked example</h2>
    <div class="bench"><div class="split">
      <div class="trace"><div class="panel-title">Trace it</div><div class="narr" id="tnarr"></div>
        <div class="row"><button class="btn sm" id="tprev">◀ Back</button><button class="btn primary" id="tnext">Next step ▶</button><button class="btn sm" id="treset">Restart</button><span class="stats"><span>Step <b id="tstep">0</b> / ${A.trace.length}</span></span></div></div>
      <div class="stack"><div class="panel-title">Pseudocode</div>${pseudoHTML(k)}</div>
    </div></div>
    <h2 class="section-title">Check yourself</h2><div class="card" id="tq"></div>
    ${practice.length ? `<h2 class="section-title">Practice it</h2><p class="section-sub">NeetCode 150 problems that use this.</p><div class="linkchips" id="tprac">${practice.map(p => `<button data-n="${p.n}"><small>#${p.n}</small>${esc(p.t)}</button>`).join('')}</div>` : ''}
    <h2 class="section-title">${dom === 'algorithms' ? 'Complexity' : 'Cost & security'} · key points · code</h2><div id="ref"></div>
    ${deepHTML(k, A)}
    ${nav.noFoot ? '' : `<div class="foot"><button class="btn" id="tpa" ${idx <= 0 ? 'disabled' : ''}>← ${idx > 0 ? esc(ALGOS[keys[idx - 1]].name) : 'Previous'}</button><button class="btn" id="tna" ${idx < 0 || idx === keys.length - 1 ? 'disabled' : ''}>${idx >= 0 && idx < keys.length - 1 ? esc(ALGOS[keys[idx + 1]].name) : 'Next'} →</button></div>`}`;
  let step = -1;
  const draw = () => {
    $('#tstep', root).textContent = step + 1;
    if (step < 0) { $('#tnarr', root).innerHTML = 'Press <b>Next step</b> to walk through a small example. The matching pseudocode line lights up.'; setLine(root, -1); }
    else { const [line, text] = A.trace[step]; $('#tnarr', root).innerHTML = `<span class="tag">Step ${step + 1}</span>${text}`; setLine(root, line); }
    $('#tprev', root).disabled = step < 0;
    $('#tnext', root).disabled = step >= A.trace.length - 1;
  };
  $('#tnext', root).onclick = () => { step++; draw(); };
  $('#tprev', root).onclick = () => { step--; draw(); };
  $('#treset', root).onclick = () => { step = -1; draw(); };
  draw();
  mcq($('#tq', root), A.q);
  wirePrint(root);
  $$('#tprac button', root).forEach(b => b.onclick = () => openProblem(+b.dataset.n));
  reference($('#ref', root), k);
  if (nav.onBack) $('#tback', root).onclick = nav.onBack;
  if (!nav.noFoot) {
    if (idx > 0) $('#tpa', root).onclick = () => nav.onOpen(keys[idx - 1]);
    if (idx >= 0 && idx < keys.length - 1) $('#tna', root).onclick = () => nav.onOpen(keys[idx + 1]);
  }
}

/* ================= Tracks: units ================= */
const Q = (q, o, a, why) => ({ q, o, a, why });
const lessonById = id => [...algoLessons, ...cryptoLessons, ...crLabs, ...sdLessons, ...daLessons, ...ipLessons].find(l => l.id === id);
const SORT_KEYS = ['bubble', 'insertion', 'selection', 'merge', 'quick', 'heapsort', 'counting'];

const TRACK_INFO = {
  sorting: { title: 'Sorting', domain: 'sorting', color: 'sort',
    levels: ['Start here', 'Foundations', 'Simple sorts · O(n²)', 'Efficient sorts · O(n log n)', 'Beyond comparisons', 'Checkpoint'],
    pitch: 'Sorting is where most people first learn to think about algorithms. You will trace seven sorts by hand, see why some are O(n²) and others O(n log n), measure them on real inputs, and learn which one to choose and why.',
    outcome: 'By the end you can implement every major sort in four languages, explain its best, average and worst cases, and say whether it is stable and in place.' },
  algorithms: { title: 'Algorithms', domain: 'algorithms', color: 'algo',
    levels: ['Start here', 'Foundations', 'Core patterns', 'Data structures', 'Graphs', 'Algorithm design'],
    pitch: 'From Big-O to dynamic programming: the full interview syllabus of searching, array patterns, data structures, graphs, backtracking, DP and greedy algorithms, each linked to the NeetCode problems that use it.',
    outcome: 'By the end you can analyze an algorithm’s complexity, recognize which pattern a problem needs, and implement it from scratch.' },
  crypto: { title: 'Cryptography', domain: 'crypto', color: 'crypto',
    levels: ['Start here', 'Foundations', 'Hashing', 'Symmetric encryption', 'Public-key cryptography', 'Hero'],
    pitch: 'From Caesar ciphers to post-quantum lattices: hashing, password storage, MACs, AES and authenticated encryption, RSA, key exchange, signatures and secret sharing, with real code and standard test vectors.',
    outcome: 'By the end you can choose and correctly use the right primitive for passwords, files, messages and signatures, and explain why the broken ones are broken.' },
  interview: { title: 'Interview Prep', domain: 'interview', color: 'career', sd: true,
    levels: ['Start here', 'Software engineering core', 'Frontend', 'Backend', 'Full-stack', 'Cheat sheets & final prep'],
    pitch: 'Interview preparation for frontend, backend, full-stack and general software engineering roles: every major topic as a cheat sheet plus a detailed lesson with how and where to use it, implementations in several languages, edge cases, and interview questions with model answers.',
    outcome: 'By the end you can explain and implement the topics interviewers ask most, avoid the classic edge-case bugs, answer behavioral questions with strong stories, and walk into the interview with a printed cheat sheet for your role.' },
  analytics: { title: 'Data Analytics', domain: 'analytics', color: 'data', sd: true,
    levels: ['Start here', 'Foundations', 'Excel', 'SQL', 'Power BI & Tableau', 'Python, experiments & projects'],
    pitch: 'From your first spreadsheet formula to end-to-end analyst projects: statistics, Excel (formulas, lookups, PivotTables, Power Query), SQL (joins, CTEs, window functions, cohorts), Power BI (modeling and DAX), Tableau (LOD and table calculations), Python with pandas, A/B testing and data storytelling.',
    outcome: 'By the end you can take a business question, pull and clean the data with SQL or Power Query, analyze it in Excel, Python or DAX, build a dashboard in Power BI or Tableau, test whether a difference is real, and present a recommendation.' },
  compare: { title: 'X vs Y', domain: 'compare', color: 'cmp', sd: true,
    levels: ['Start here', 'Messaging', 'Databases', 'APIs', 'Frontend & architecture', 'Security'],
    pitch: 'Interviewers love “X or Y?” questions because the answer shows judgment, not memory. Each page puts two or three technologies side by side, says when to pick each, and gives a model interview answer you can adapt.',
    outcome: 'By the end you can compare the technologies interviewers ask about most, choose between them for a given workload, and defend the choice with trade-offs.' },
  cheats: { title: 'Cheat Sheets', domain: 'cheats', color: 'ref', sd: true,
    levels: ['Start here', 'Algorithms & languages', 'Data', 'Developer tools', 'Web & infrastructure', 'Security & design'],
    pitch: 'Dense, printable one-page references: Big-O, patterns-to-problems, SQL, Excel and DAX, Git, Linux, regex, HTTP, Docker and Kubernetes, choosing crypto, system design numbers and syntax across four languages.',
    outcome: 'Print the sheets you need (each page has a Print / save as PDF button) and use them for revision the week before an interview or as a desk reference.' },
  design: { title: 'System Design', domain: 'design', color: 'design', sd: true,
    levels: ['Start here', 'Foundations', 'Building blocks', 'Distributed data', 'Reliability & operations', 'Case studies'],
    pitch: 'From “what happens when you type a URL” to designing WhatsApp and YouTube: requirements and estimation, load balancing, caching, databases, replication and sharding, queues, consistency and consensus, reliability patterns, and fourteen complete case studies (including payments, Google Docs, Dropbox and Ticketmaster), each with step-through architecture diagrams.',
    outcome: 'By the end you can turn a vague product idea into numbers, an API and an architecture, choose between alternatives for every component, and explain the trade-offs like a senior engineer.' }
};

const UNITS = [
  /* ----- Sorting ----- */
  { id: 's-start', track: 'sorting', level: 0, title: 'Sorting roadmap', time: 5, page: 'overview',
    lede: 'What this track covers, how each unit works, and the order to study it in.', goals: ['See the whole path', 'Pick your programming language', 'Learn the unit format'] },
  { id: 's-basics', track: 'sorting', level: 1, title: 'Watch the sorts', time: 20, learn: 'sorting',
    lede: 'Before studying sorts one by one, watch four of them work on the same data and predict their comparisons.',
    goals: ['Know what “sorted”, “stable” and “in place” mean', 'Trace comparisons and swaps', 'See how input order changes the work'],
    extra: [Q('A sort is stable when…', ['it never uses extra memory', 'equal elements keep their original relative order', 'it always runs in O(n log n)', 'it never swaps elements'], 1, 'Stability matters when you sort records by one key after another, for example by name and then by department.'),
      Q('“In place” means the algorithm…', ['uses only O(1) or O(log n) extra memory', 'never moves elements', 'works only on arrays', 'is always stable'], 0, 'Quicksort and heap sort are in place; merge sort needs an O(n) buffer.'),
      Q('Which input order is hardest for insertion sort?', ['Already sorted', 'Reversed', 'All equal', 'Nearly sorted'], 1, 'Every new element has to move past all the elements before it: n(n − 1)/2 shifts.')] },
  { id: 's-bubble', track: 'sorting', level: 2, title: 'Bubble sort', time: 15, topic: 'bubble' },
  { id: 's-insertion', track: 'sorting', level: 2, title: 'Insertion sort', time: 15, topic: 'insertion' },
  { id: 's-selection', track: 'sorting', level: 2, title: 'Selection sort', time: 15, topic: 'selection' },
  { id: 's-merge', track: 'sorting', level: 3, title: 'Merge sort', time: 25, topic: 'merge' },
  { id: 's-quick', track: 'sorting', level: 3, title: 'Quicksort', time: 25, topic: 'quick' },
  { id: 's-heap', track: 'sorting', level: 3, title: 'Heap sort', time: 25, topic: 'heapsort' },
  { id: 's-counting', track: 'sorting', level: 4, title: 'Counting sort', time: 15, topic: 'counting' },
  { id: 's-measure', track: 'sorting', level: 4, title: 'Measure the sorts', time: 20, learn: 'complexity',
    lede: 'Run every sort on inputs up to 4,000 items and compare the measured comparisons with the O(n), O(n log n) and O(n²) curves.',
    goals: ['Read growth curves', 'Find best and worst cases by experiment', 'Connect measurements to Big-O'],
    extra: [Q('Doubling n for an O(n²) sort multiplies its comparisons by about…', ['2', '4', '8', 'log n'], 1, '(2n)² = 4n².'),
      Q('Doubling n for an O(n log n) sort multiplies its work by…', ['exactly 2', 'a bit more than 2', '4', 'n'], 1, '2n log(2n) = 2n log n + 2n, slightly more than double.')] },
  { id: 's-exam', track: 'sorting', level: 5, title: 'Sorting checkpoint', time: 15, page: 'sortCompare', checkKeys: SORT_KEYS,
    lede: 'Compare all seven sorts side by side, then answer one question on each.', goals: ['Choose the right sort for a situation', 'Recall each sort’s complexity and stability'],
    extra: [Q('You must sort 10 million 32-bit integers and only need O(1) extra memory with a guaranteed worst case. Which sort?', ['Merge sort', 'Quicksort', 'Heap sort', 'Counting sort'], 2, 'Heap sort is O(n log n) in every case and sorts in place.'),
      Q('Python’s sorted() and Java’s object sort use Timsort. Which two sorts does it combine?', ['Merge sort and insertion sort', 'Quicksort and heap sort', 'Bubble and selection sort', 'Counting and radix sort'], 0, 'Timsort finds sorted runs, extends short ones with insertion sort, and merges them.')] },

  /* ----- Algorithms ----- */
  { id: 'a-start', track: 'algorithms', level: 0, title: 'Algorithms roadmap', time: 5, page: 'overview',
    lede: 'What this track covers, how each unit works, and the order to study it in.', goals: ['See the whole path', 'Pick your programming language', 'Learn the unit format'] },
  { id: 'u-bigo', track: 'algorithms', level: 1, title: 'Thinking in Big-O', time: 25, page: 'bigo',
    lede: 'Before learning any algorithm, learn how to measure one. Big-O describes how the work grows as the input grows, and it’s the language every later unit uses.',
    goals: ['Read O(1), O(log n), O(n), O(n log n), O(n²)', 'Tell time complexity from space complexity', 'Know why the input order matters'],
    extra: [Q('An algorithm does 3n² + 100n + 7 steps. What is its Big-O?', ['O(3n²)', 'O(n²)', 'O(100n)', 'O(n³)'], 1, 'Keep the fastest-growing term and drop constants.'),
      Q('Doubling the input of an O(n²) algorithm multiplies its running time by about…', ['2', '4', '8', 'n'], 1, '(2n)² = 4n².'),
      Q('Which grows slowest?', ['O(n)', 'O(log n)', 'O(n log n)', 'O(√n)'], 1, 'log n grows slower than any positive power of n.'),
      Q('A loop runs i = 1, 2, 4, 8, … while i < n. How many iterations?', ['O(n)', 'O(log n)', 'O(√n)', 'O(1)'], 1, 'i doubles each time, so it reaches n after log₂ n steps.')] },
  { id: 'u-arrays', track: 'algorithms', level: 1, title: 'Arrays, hashing & hash tables', time: 45, study: ['hashtable', 'prefixsum', 'kadane'], practice: ['hashing'],
    lede: 'Arrays and hash tables are the two data structures you will use most. Learn how a hash table finds things in O(1), and two classic array tricks.',
    goals: ['Explain how a hash table works', 'Use prefix sums for range queries', 'Solve maximum-subarray in one pass'] },
  { id: 'u-search', track: 'algorithms', level: 1, title: 'Searching', time: 40, learn: 'binary', study: ['binary', 'lowerbound', 'quickselect'], practice: ['bsearch'],
    lede: 'Binary search turns a million-item search into 20 comparisons, and the same idea finds boundaries and optimal answers.',
    goals: ['Maintain the lo/hi invariant', 'Binary search on the answer', 'Find the k-th smallest in O(n)'] },
  { id: 'u-math', track: 'algorithms', level: 1, title: 'Math & bit tricks', time: 30, study: ['gcd', 'sieve', 'bits'], practice: ['math', 'bits'],
    lede: 'A few small algorithms that appear everywhere, including in cryptography: Euclid’s GCD, prime sieving and bitwise tricks.',
    goals: ['Compute GCD and LCM', 'List primes with a sieve', 'Use XOR and masks'] },
  { id: 'u-recursion', track: 'algorithms', level: 1, title: 'Recursion', time: 30, study: ['recursion'], practice: ['backtrack'],
    lede: 'Every tree, backtracking and DP solution is a recursive function. Learn to write the base case, trust the smaller call, and count the cost from the recursion tree.',
    goals: ['Write base and recursive cases', 'Count calls with a recursion tree', 'Know when recursion overflows the stack'] },
  { id: 'u-twoptr', track: 'algorithms', level: 2, title: 'Two pointers', time: 30, study: ['twopointers'], practice: ['twoptr'],
    lede: 'Walk two indices through sorted data so each step rules out many candidates. Turns many O(n²) problems into O(n).',
    goals: ['Spot when two pointers apply', 'Argue why a pointer can move', 'Solve pair and triplet sums'] },
  { id: 'u-window', track: 'algorithms', level: 2, title: 'Sliding window', time: 35, study: ['slidingwindow'], practice: ['window'],
    lede: 'For “longest or shortest substring or subarray such that…” problems, grow a window on the right and shrink it on the left.',
    goals: ['Fixed vs variable windows', 'Track window contents with counts', 'Prove O(n) despite a nested loop'] },
  { id: 'u-stack', track: 'algorithms', level: 2, title: 'Stacks & monotonic stacks', time: 30, study: ['monostack'], practice: ['stack'],
    lede: 'Last in, first out. Match brackets, evaluate expressions, and answer “next greater element” questions in linear time.',
    goals: ['Use a stack for nesting', 'Build a monotonic stack', 'Solve histogram-style problems'] },
  { id: 'u-strings', track: 'algorithms', level: 2, title: 'Strings & pattern matching', time: 40, study: ['kmp', 'rabinkarp'], practice: ['window'],
    lede: 'Find a pattern in a text in linear time: KMP’s failure function never re-reads the text, and Rabin–Karp’s rolling hash compares whole windows as numbers.',
    goals: ['Build the KMP prefix function', 'Roll a polynomial hash in O(1)', 'Choose between KMP, Rabin–Karp and built-in find'] },
  { id: 'u-linked', track: 'algorithms', level: 3, title: 'Linked lists', time: 35, study: ['floyd'], practice: ['linked'],
    lede: 'Pointer manipulation: dummy heads, reversing in place, fast and slow pointers, and Floyd’s cycle detection.',
    goals: ['Reverse and merge lists', 'Find cycles in O(1) memory', 'Use a dummy head node'] },
  { id: 'u-trees', track: 'algorithms', level: 3, title: 'Trees & binary search trees', time: 45, study: ['traversals', 'bst'], practice: ['trees'],
    lede: 'Recursion on left and right subtrees. Traversal orders, BST search and deletion, and what each recursive call should return.',
    goals: ['Write all four traversals', 'Insert, search and delete in a BST', 'Decide what a recursive call returns'] },
  { id: 'u-heaps', track: 'algorithms', level: 3, title: 'Heaps & tries', time: 40, study: ['binheap', 'trie'], practice: ['heap', 'tries'],
    lede: 'Priority queues for “top k” and streaming problems, and prefix trees for fast word lookups.',
    goals: ['Implement push and pop on a heap', 'Solve top-k problems', 'Build and search a trie'] },
  { id: 'u-advds', track: 'algorithms', level: 3, title: 'Advanced data structures', time: 45, study: ['segtree', 'fenwick'],
    lede: 'When an array changes and you still need fast range answers: segment trees for any associative operation, Fenwick trees for compact prefix sums.',
    goals: ['Query and update ranges in O(log n)', 'Use the lowest-set-bit trick', 'Pick a segment tree or a Fenwick tree'] },
  { id: 'u-graphs', track: 'algorithms', level: 4, title: 'Graph traversal', time: 50, learn: 'graphs', study: ['bfs', 'dfs', 'topo', 'unionfind'], practice: ['graphs'],
    lede: 'BFS for shortest steps, DFS for exploring, topological sort for dependencies, and union–find for connectivity.',
    goals: ['Choose BFS or DFS', 'Order tasks with prerequisites', 'Track connected components'] },
  { id: 'u-paths', track: 'algorithms', level: 4, title: 'Shortest paths & spanning trees', time: 45, study: ['dijkstra', 'prim', 'kruskal'], practice: ['advgraphs'],
    lede: 'Weighted graphs: Dijkstra’s shortest paths and the two classic minimum spanning tree algorithms.',
    goals: ['Run Dijkstra with a heap', 'Build an MST two ways', 'Know when greedy graph algorithms are correct'] },
  { id: 'u-advpaths', track: 'algorithms', level: 4, title: 'Negative weights, all pairs & SCCs', time: 45, study: ['bellmanford', 'floydwarshall', 'scc'], practice: ['advgraphs'],
    lede: 'Beyond Dijkstra: Bellman–Ford handles negative edges and detects negative cycles, Floyd–Warshall computes every pair at once, and Tarjan splits a directed graph into strongly connected components.',
    goals: ['Relax edges V − 1 times', 'Run all-pairs DP over intermediates', 'Find SCCs with low-links'] },
  { id: 'u-backtrack', track: 'algorithms', level: 5, title: 'Backtracking', time: 40, study: ['subsets', 'permutations', 'nqueens'], practice: ['backtrack'],
    lede: 'Generate subsets, permutations and puzzle solutions by choosing, exploring and undoing.',
    goals: ['Use the choose–explore–undo template', 'Avoid duplicate results', 'Prune impossible branches'] },
  { id: 'u-dp1', track: 'algorithms', level: 5, title: 'Dynamic programming I', time: 60, study: ['memo', 'knapsack', 'coinchange', 'lis'], practice: ['dp1'],
    lede: 'Overlapping subproblems, solved once each. Start from memoized recursion and move to bottom-up tables.',
    goals: ['Define a DP state and recurrence', 'Convert top-down to bottom-up', 'Recognize knapsack-style problems'] },
  { id: 'u-dp2', track: 'algorithms', level: 5, title: 'Dynamic programming II', time: 50, study: ['lcs', 'editdistance'], practice: ['dp2'],
    lede: 'Two-dimensional DP over pairs of strings and grids, and how to cut memory to a single row.',
    goals: ['Fill a 2D DP table', 'Reduce memory to O(n)', 'Solve string-matching DP'] },
  { id: 'u-greedy', track: 'algorithms', level: 5, title: 'Greedy & intervals', time: 35, study: ['intervals'], practice: ['greedy', 'intervals'],
    lede: 'Make the locally best choice and prove you never need to undo it. Most interval problems start with one sort.',
    goals: ['Prove a greedy choice with an exchange argument', 'Merge and schedule intervals', 'Know when greedy fails'] },
  { id: 'u-algo-exam', track: 'algorithms', level: 5, title: 'Algorithms checkpoint', time: 15, quiz: 'algo-quiz',
    lede: 'A final check across the whole Algorithms track.', goals: ['Review the track'] },

  /* ----- X vs Y ----- */
  { id: 'x-start', track: 'compare', level: 0, title: 'How to answer “X or Y?”', time: 5, page: 'overview',
    lede: 'What these comparison pages cover and how to structure any “which would you choose?” answer.', goals: ['See all comparisons', 'Learn the answer structure: context → criteria → choice → trade-offs'] },
  { id: 'x-kafka', track: 'compare', level: 1, title: 'Kafka vs RabbitMQ', time: 15, topic: 'cmp-kafka-rabbit' },
  { id: 'x-pg', track: 'compare', level: 2, title: 'PostgreSQL vs MySQL', time: 15, topic: 'cmp-postgres-mysql' },
  { id: 'x-sql', track: 'compare', level: 2, title: 'SQL vs NoSQL by workload', time: 20, topic: 'cmp-sql-nosql' },
  { id: 'x-api', track: 'compare', level: 3, title: 'REST vs gRPC vs GraphQL', time: 20, topic: 'cmp-rest-grpc-graphql' },
  { id: 'x-state', track: 'compare', level: 4, title: 'Redux vs Zustand vs Context', time: 15, topic: 'cmp-state-mgmt' },
  { id: 'x-mono', track: 'compare', level: 4, title: 'Monolith vs microservices', time: 15, topic: 'cmp-mono-micro' },
  { id: 'x-aead', track: 'compare', level: 5, title: 'AES-GCM vs ChaCha20-Poly1305', time: 15, topic: 'cmp-gcm-chacha' },
  /* ----- Cheat sheets ----- */
  { id: 'cs-start', track: 'cheats', level: 0, title: 'Using the cheat sheets', time: 3, page: 'overview',
    lede: 'Every sheet is one printable page. Open one and use Print / save as PDF.', goals: ['Find the sheet you need', 'Print a revision pack'] },
  { id: 'cs-u-bigo', track: 'cheats', level: 1, title: 'Big-O', time: 5, topic: 'cs-bigo' },
  { id: 'cs-u-patterns', track: 'cheats', level: 1, title: 'Patterns → problems', time: 5, topic: 'cs-patterns' },
  { id: 'cs-u-lang', track: 'cheats', level: 1, title: 'Four-language syntax', time: 5, topic: 'cs-lang-syntax' },
  { id: 'cs-u-sql', track: 'cheats', level: 2, title: 'SQL', time: 5, topic: 'cs-sql' },
  { id: 'cs-u-excel', track: 'cheats', level: 2, title: 'Excel & DAX', time: 5, topic: 'cs-excel-dax' },
  { id: 'cs-u-git', track: 'cheats', level: 3, title: 'Git', time: 5, topic: 'cs-git' },
  { id: 'cs-u-linux', track: 'cheats', level: 3, title: 'Linux command line', time: 5, topic: 'cs-linux' },
  { id: 'cs-u-regex', track: 'cheats', level: 3, title: 'Regular expressions', time: 5, topic: 'cs-regex' },
  { id: 'cs-u-http', track: 'cheats', level: 4, title: 'HTTP', time: 5, topic: 'cs-http' },
  { id: 'cs-u-docker', track: 'cheats', level: 4, title: 'Docker & Kubernetes', time: 5, topic: 'cs-docker' },
  { id: 'cs-u-crypto', track: 'cheats', level: 5, title: 'Choosing crypto', time: 5, topic: 'cs-crypto-chooser' },
  { id: 'cs-u-sdnum', track: 'cheats', level: 5, title: 'System design numbers', time: 5, topic: 'cs-sd-numbers' },
  /* ----- System design ----- */
  { id: 'd-start', track: 'design', level: 0, title: 'System design roadmap', time: 5, page: 'overview',
    lede: 'What this track covers, how each unit works, and the order to study it in.', goals: ['See the whole path', 'Pick your programming language', 'Learn the unit format'] },
  { id: 'd-basics', track: 'design', level: 1, title: 'How large systems are built', time: 35, page: 'sdIntro', study: ['requirements', 'latency'],
    lede: 'A tour of every building block in one request’s journey, then the two habits every design starts with: clear requirements and a feel for latency.',
    goals: ['Name the standard building blocks', 'Separate functional from non-functional requirements', 'Know the latency numbers that shape designs'] },
  { id: 'd-estimate', track: 'design', level: 1, title: 'Back-of-the-envelope estimation', time: 30, learn: 'sd-estimate', study: ['estimation'],
    lede: 'Turn users into QPS, storage, bandwidth and servers in a few lines of arithmetic, and let the numbers pick the architecture.',
    goals: ['Convert daily volume to QPS', 'Estimate storage and bandwidth', 'Size a server fleet'],
    extra: [SQ('Peak egress is estimated at 3 GB/s of mostly images. What does that imply?', ['Use bigger app servers', 'Serve media from object storage through a CDN', 'Add database indexes', 'Use UDP'], 1, 'That volume belongs on a CDN; app servers should not carry it.')] },
  { id: 'd-network', track: 'design', level: 1, title: 'Networking essentials', time: 40, study: ['dns', 'http', 'realtime'],
    lede: 'How a request finds a server and travels to it: DNS, TCP, TLS and HTTP versions, and the options for pushing data in real time.',
    goals: ['Explain DNS resolution and TTLs', 'Count round trips in an HTTPS request', 'Choose between polling, SSE and WebSockets'] },
  { id: 'd-api', track: 'design', level: 1, title: 'API design', time: 35, study: ['apidesign', 'rpc'],
    lede: 'Design contracts that scale and survive retries: REST resources, pagination, idempotency, versioning, and when to use gRPC or GraphQL.',
    goals: ['Design REST endpoints', 'Use cursor pagination and idempotency keys', 'Pick REST, gRPC or GraphQL'] },
  { id: 'd-scale', track: 'design', level: 2, title: 'Scaling & load balancing', time: 45, learn: 'sd-lb', study: ['scaling', 'loadbalancer', 'proxy'],
    lede: 'Grow from one server to a fleet: stateless servers, load-balancing algorithms and health checks, reverse proxies and API gateways.',
    goals: ['Make a tier horizontally scalable', 'Choose a load-balancing algorithm', 'Know what belongs in a gateway'] },
  { id: 'd-cache', track: 'design', level: 2, title: 'Caching', time: 45, learn: 'sd-cache', study: ['caching', 'lru', 'cdn'],
    lede: 'The single most effective scaling tool: cache patterns and invalidation, eviction policies with an LRU you build yourself, and CDNs.',
    goals: ['Apply cache-aside correctly', 'Prevent stampedes and penetration', 'Implement an O(1) LRU cache'] },
  { id: 'd-db', track: 'design', level: 2, title: 'Databases', time: 50, study: ['sqlnosql', 'indexes', 'transactions'],
    lede: 'Pick the right kind of database, understand how indexes make queries fast, and know what transactions and isolation levels guarantee.',
    goals: ['Choose SQL or a NoSQL family', 'Explain B-trees vs LSM trees', 'Avoid race conditions with the right isolation'] },
  { id: 'd-storage', track: 'design', level: 2, title: 'Files & search', time: 30, study: ['blob', 'searchindex'],
    lede: 'Where files and full-text search live: object storage with direct uploads, and inverted indexes fed by change streams.',
    goals: ['Design direct-to-storage uploads', 'Explain inverted indexes and ranking'] },
  { id: 'd-repl', track: 'design', level: 3, title: 'Replication & partitioning', time: 55, learn: 'sd-ring', study: ['replication', 'sharding', 'consistenthash'],
    lede: 'Copy data for availability and split it for scale: leaders and followers, shard keys and hot spots, and consistent hashing (with code).',
    goals: ['Handle replication lag', 'Choose a shard key', 'Build a consistent-hash ring'] },
  { id: 'd-async', track: 'design', level: 3, title: 'Queues & streams', time: 45, learn: 'sd-queue', study: ['mq', 'eventlog', 'batchstream'],
    lede: 'Decouple services and absorb spikes with queues, build event-driven systems on logs like Kafka, and process data in batches and streams.',
    goals: ['Use queues with retries and DLQs', 'Partition a Kafka topic', 'Choose batch or stream processing'] },
  { id: 'd-cons', track: 'design', level: 3, title: 'Consistency & consensus', time: 55, learn: 'sd-quorum', study: ['cap', 'consistency', 'quorum', 'raft'],
    lede: 'What “consistent” really means, the CAP and PACELC trade-offs, quorums in leaderless stores, and how Raft elects leaders and agrees on a log.',
    goals: ['Explain CAP with an example', 'Pick N, R and W', 'Describe Raft’s election and commit rules'] },
  { id: 'd-time', track: 'design', level: 3, title: 'Clocks & unique IDs', time: 30, study: ['clocks', 'idgen'],
    lede: 'Why wall clocks can’t order events, how vector clocks detect conflicts, and how to generate unique, sortable IDs without coordination.',
    goals: ['Compare vector clocks', 'Build a Snowflake ID generator'] },
  { id: 'd-txn', track: 'design', level: 3, title: 'Distributed transactions', time: 40, study: ['twopc', 'saga', 'idempotency'],
    lede: 'Keep data correct across services: two-phase commit, sagas with compensations, and exactly-once effects with outboxes and idempotency.',
    goals: ['Explain why 2PC blocks', 'Design a saga', 'Make consumers idempotent'] },
  { id: 'd-prob', track: 'design', level: 3, title: 'Probabilistic data structures', time: 30, study: ['bloom', 'sketches'],
    lede: 'Answer membership, frequency and cardinality questions about billions of items in kilobytes, with known error bounds.',
    goals: ['Size a Bloom filter', 'Use count-min and HyperLogLog'] },
  { id: 'd-rate', track: 'design', level: 4, title: 'Rate limiting', time: 30, learn: 'sd-ratelimit', study: ['ratelimit'],
    lede: 'Protect services and enforce fairness: token buckets, windows, and distributed limiting with a shared store.',
    goals: ['Compare limiter algorithms', 'Implement a token bucket', 'Design a distributed limiter'] },
  { id: 'd-resil', track: 'design', level: 4, title: 'Fault tolerance', time: 50, learn: 'sd-breaker', study: ['availability', 'retries', 'circuitbreaker'],
    lede: 'Design for failure: availability math and SLOs, redundancy across zones, timeouts, retries with backoff, circuit breakers and bulkheads.',
    goals: ['Compute availability of a call chain', 'Retry safely', 'Stop cascading failures'] },
  { id: 'd-ops', track: 'design', level: 4, title: 'Observability & deployment', time: 35, study: ['observability', 'deploys'],
    lede: 'See what production is doing with metrics, logs and traces, and ship changes safely with canaries and backward-compatible migrations.',
    goals: ['Choose the right signal', 'Alert on symptoms', 'Run a canary release'] },
  { id: 'd-arch', track: 'design', level: 4, title: 'Architecture & security', time: 40, study: ['microservices', 'auth'],
    lede: 'Monoliths versus microservices, drawing service boundaries, and authentication and authorization with OAuth, OIDC and JWTs.',
    goals: ['Decide when to split services', 'Explain the OAuth code flow', 'Choose an authorization model'] },
  { id: 'd-framework', track: 'design', level: 5, title: 'The interview framework', time: 20, page: 'sdFramework',
    lede: 'A five-step structure for any design problem, how to spend the time, and what interviewers actually evaluate.',
    goals: ['Run a design in five phases', 'Avoid the common mistakes'] },
  { id: 'd-cases1', track: 'design', level: 5, title: 'Case studies I: core services', time: 60, study: ['case-url', 'case-kv', 'case-notify'],
    lede: 'A URL shortener, a Dynamo-style key-value store and a notification system, each worked end to end.',
    goals: ['Apply the framework', 'Combine caching, IDs and queues', 'Build a store from first principles'] },
  { id: 'd-cases2', track: 'design', level: 5, title: 'Case studies II: social & real-time', time: 60, study: ['case-chat', 'case-feed', 'case-typeahead'],
    lede: 'Chat with persistent connections, a news feed with hybrid fan-out, and search autocomplete with an offline pipeline.',
    goals: ['Route messages to connections', 'Choose a fan-out strategy', 'Separate online and offline paths'] },
  { id: 'd-cases3', track: 'design', level: 5, title: 'Case studies III: media, geo & crawling', time: 60, study: ['case-video', 'case-rides', 'case-crawler'],
    lede: 'Video upload and streaming, ride matching with geospatial indexes, and a polite web crawler.',
    goals: ['Design a media pipeline', 'Index locations', 'Build a URL frontier'] },
  { id: 'd-cases4', track: 'design', level: 5, title: 'Case studies IV: money, files & spikes', time: 90, study: ['case-ratelimiter', 'case-payments', 'case-docs', 'case-dropbox', 'case-tickets'],
    lede: 'Five designs interviewers ask for often: a distributed rate limiter, a payment system with a ledger, collaborative editing, file sync, and flash-sale ticketing.',
    goals: ['Design for exactly-once money movement', 'Merge concurrent edits', 'Survive a 100× traffic spike without overselling'] },
  { id: 'd-final', track: 'design', level: 5, title: 'Final exam & capstone', time: 30, page: 'sdCapstone', quiz: 'sd-quiz',
    lede: 'Test yourself across the whole track, then take on a design challenge of your own.',
    goals: ['Pass the final quiz', 'Design a system end to end', 'Know where to go next'] },

  /* ----- Interview prep ----- */
  { id: 'ipu-start', track: 'interview', level: 0, title: 'Interview prep roadmap', time: 5, page: 'overview',
    lede: 'What this course covers, how each unit works, and the order to study it in.', goals: ['See the whole path', 'Pick your role’s plan'] },
  { id: 'ipu-plan', track: 'interview', level: 1, title: 'Study plans by role', time: 10, page: 'ipPlan',
    lede: 'Six-week plans for frontend, backend, full-stack and generalist roles, plus what to do the week before and during the interview.',
    goals: ['Choose a plan', 'Know how to prepare the final week'] },
  { id: 'ipu-coding', track: 'interview', level: 1, title: 'Coding interviews', time: 45, study: ['ip-coding', 'ip-ds-cheat'], practice: ['hashing', 'twoptr', 'window'],
    lede: 'A repeatable process for coding rounds, pattern recognition, complexity targets, and the data-structure cheat sheet.',
    goals: ['Follow the six-step process', 'Pick the right data structure', 'Check edge cases'] },
  { id: 'ipu-cs', track: 'interview', level: 1, title: 'OS & networking fundamentals', time: 60, study: ['ip-os', 'ip-networking'],
    lede: 'What runs underneath your code: processes, threads, memory, system calls, TCP, DNS and how to debug connectivity.',
    goals: ['Explain processes, threads and virtual memory', 'Trace a request through the network stack', 'Debug “can’t connect” and “it’s slow”'] },
  { id: 'ipu-oop', track: 'interview', level: 1, title: 'OOP, SOLID & design patterns', time: 50, study: ['ip-oop', 'ip-patterns'],
    lede: 'Model problems with classes that are easy to change, and recognize the patterns interviewers ask about.',
    goals: ['Explain SOLID with examples', 'Implement common patterns', 'Answer “design a parking lot”'] },
  { id: 'ipu-eng', track: 'interview', level: 1, title: 'Concurrency, testing & Git', time: 60, study: ['ip-concurrency', 'ip-testing', 'ip-git'],
    lede: 'Threads, async and race conditions; writing useful tests; and fluent Git with code review and CI.',
    goals: ['Spot and fix race conditions', 'Write good unit tests', 'Merge, rebase and recover in Git'] },
  { id: 'ipu-web', track: 'interview', level: 2, title: 'HTML, accessibility & CSS', time: 50, study: ['ip-html-a11y', 'ip-css'],
    lede: 'Semantic, accessible markup and CSS you can predict: specificity, box model, Flexbox, Grid and responsive design.',
    goals: ['Build accessible components', 'Explain specificity', 'Lay out with Flexbox and Grid'] },
  { id: 'ipu-js', track: 'interview', level: 2, title: 'JavaScript deep dive', time: 60, study: ['ip-js-core', 'ip-js-async'],
    lede: 'Closures, this, prototypes and coercion; the event loop, promises and the async utilities interviewers ask you to implement.',
    goals: ['Explain closures and this', 'Predict event-loop output', 'Implement debounce, throttle, Promise.all'] },
  { id: 'ipu-ts', track: 'interview', level: 2, title: 'TypeScript', time: 45, study: ['ip-typescript'],
    lede: 'Type real code with unions, narrowing and generics, and validate data at the boundary where types stop protecting you.',
    goals: ['Model data with discriminated unions', 'Write generic helpers', 'Validate untrusted input'] },
  { id: 'ipu-react', track: 'interview', level: 2, title: 'React & web performance', time: 60, study: ['ip-react', 'ip-browser-perf'],
    lede: 'How React renders, hooks and their pitfalls, state management choices, and how browsers render and how to make pages fast.',
    goals: ['Use effects correctly', 'Avoid stale state and key bugs', 'Improve Core Web Vitals'] },
  { id: 'ipu-fesys', track: 'interview', level: 2, title: 'Web security & frontend system design', time: 55, study: ['ip-web-security', 'ip-fe-design'],
    lede: 'XSS, CSRF and CORS explained, then designing frontend features with the RADIO framework.',
    goals: ['Prevent XSS and CSRF', 'Explain CORS', 'Design an autocomplete or feed'] },
  { id: 'ipu-api', track: 'interview', level: 3, title: 'APIs & backend architecture', time: 50, study: ['ip-rest-http', 'ip-be-arch'],
    lede: 'HTTP and REST conventions, status codes, idempotency, and a clean layered backend with validation, errors and graceful shutdown.',
    goals: ['Design REST endpoints', 'Choose correct status codes', 'Structure a backend in layers'] },
  { id: 'ipu-data', track: 'interview', level: 3, title: 'Databases & auth', time: 60, study: ['ip-db-interview', 'ip-auth'],
    lede: 'Schemas, indexes, transactions and the N+1 problem; then secure login, sessions vs JWT, and authorization.',
    goals: ['Fix slow queries', 'Avoid N+1', 'Implement login securely'] },
  { id: 'ipu-lld', track: 'interview', level: 3, title: 'Low-level design', time: 50, study: ['ip-lld'],
    lede: 'Object-oriented design rounds: a worked parking-lot design with a class diagram and code, plus the patterns and problems that come up most.',
    goals: ['Turn requirements into classes', 'Use strategy and state patterns', 'Discuss concurrency and extension'] },
  { id: 'ipu-scale', track: 'interview', level: 3, title: 'Performance & scalability', time: 35, study: ['ip-be-perf'],
    lede: 'A methodical answer to “the API is slow”, caching layers, background jobs and load testing.',
    goals: ['Diagnose bottlenecks', 'Choose the right fix', 'Load test'] },
  { id: 'ipu-fs', track: 'interview', level: 4, title: 'Across the stack', time: 50, study: ['ip-fs-flow', 'ip-fs-data'],
    lede: 'What happens when you type a URL, and how data is fetched, cached, mutated and validated between UI and server.',
    goals: ['Walk the full request path', 'Implement optimistic updates', 'Share validation'] },
  { id: 'ipu-ship', track: 'interview', level: 4, title: 'Shipping & full-stack design', time: 60, study: ['ip-devops', 'ip-fs-design'],
    lede: 'Docker, CI/CD and zero-downtime deploys, then a complete full-stack design exercise: a real-time task board.',
    goals: ['Containerize an app', 'Explain a CI/CD pipeline', 'Design a full-stack feature end to end'] },
  { id: 'ipu-cheats', track: 'interview', level: 5, title: 'Cheat sheets & flashcards', time: 20, page: 'ipCheats',
    lede: 'Every cheat sheet for your role on one page (printable), plus a random interview-question drill.',
    goals: ['Review quickly', 'Practice answering out loud'] },
  { id: 'ipu-behav', track: 'interview', level: 5, title: 'Behavioral interviews', time: 30, study: ['ip-behavioral'],
    lede: 'Build a story bank and answer with STAR: conflict, failure, ownership, ambiguity.',
    goals: ['Prepare 6–8 stories', 'Use STAR', 'Ask good questions'] },
  { id: 'ipu-analyst', track: 'interview', level: 5, title: 'Data analyst interviews', time: 45, study: ['ip-analyst'],
    lede: 'SQL live coding, metrics and root-cause cases, statistics and experiments: the analyst interview loop, with a question bank.',
    goals: ['Solve classic analyst SQL questions', 'Structure metric and root-cause cases', 'Explain p-values and A/B tests simply'] },
  { id: 'ipu-career', track: 'interview', level: 5, title: 'Résumés, take-homes & offers', time: 30, study: ['ip-career'],
    lede: 'Get the interview and the offer: impact-driven résumés, take-home assignments, running the search and negotiating.',
    goals: ['Write impact bullets', 'Deliver a strong take-home', 'Compare and negotiate offers'] },
  { id: 'ipu-final', track: 'interview', level: 5, title: 'Final quiz', time: 15, quiz: 'ip-quiz',
    lede: 'A last check across every role.', goals: ['Find your weak spots'] },

  /* ----- Data analytics ----- */
  { id: 'dau-start', track: 'analytics', level: 0, title: 'Data analytics roadmap', time: 5, page: 'overview',
    lede: 'What this track covers, how each unit works, and the order to study it in.', goals: ['See the whole path', 'Learn the unit format'] },
  { id: 'dau-intro', track: 'analytics', level: 1, title: 'What analysts do & how data is shaped', time: 30, study: ['da-what', 'da-data'],
    lede: 'The analytics cycle, the four kinds of analytics, the toolkit, and how to recognize tidy data, grain and keys.',
    goals: ['Turn a request into a measurable question', 'Know which tool fits which job', 'Identify grain and keys'] },
  { id: 'dau-stats', track: 'analytics', level: 1, title: 'Descriptive statistics', time: 35, learn: 'da-stats-lab', study: ['da-stats'],
    lede: 'Center, spread, distributions and correlation, with the same calculation in Excel, SQL, Python and DAX.',
    goals: ['Choose mean or median', 'Use percentiles and IQR', 'Avoid averaging averages'] },
  { id: 'dau-prob', track: 'analytics', level: 1, title: 'Probability & regression', time: 60, study: ['da-prob', 'da-regression'],
    lede: 'The statistics behind forecasting and experiments: probability rules, Bayes, distributions, linear and logistic regression, and simple forecasts.',
    goals: ['Apply conditional probability and Bayes', 'Fit and read a regression', 'Build and back-test a baseline forecast'] },
  { id: 'dau-xl1', track: 'analytics', level: 2, title: 'Excel formulas, conditions & lookups', time: 60, learn: 'da-excel-lab', study: ['da-excel-formulas', 'da-excel-cond', 'da-excel-lookup'],
    lede: 'References, essential functions, SUMIFS and COUNTIFS, and XLOOKUP / INDEX-MATCH: the formulas analysts use every day.',
    goals: ['Use $ references correctly', 'Write multi-condition SUMIFS', 'Look up values safely'] },
  { id: 'dau-xl2', track: 'analytics', level: 2, title: 'PivotTables & Power Query', time: 50, learn: 'da-pivot-lab', study: ['da-excel-pivot', 'da-excel-pq'],
    lede: 'Summarize thousands of rows in seconds, then automate cleaning so next month’s data refreshes with one click.',
    goals: ['Build and format PivotTables', 'Clean data with Power Query', 'Unpivot, merge and append'] },
  { id: 'dau-sql1', track: 'analytics', level: 3, title: 'SQL foundations', time: 70, learn: 'da-sql-play', study: ['da-sql-select', 'da-sql-agg', 'da-sql-joins'],
    lede: 'SELECT, WHERE, GROUP BY, HAVING and joins, practiced live in a real SQL database in your browser.',
    goals: ['Filter and sort', 'Aggregate with GROUP BY', 'Join without double counting'] },
  { id: 'dau-sql2', track: 'analytics', level: 3, title: 'Advanced SQL for analytics', time: 70, learn: 'da-sql-play', study: ['da-sql-cte', 'da-sql-window', 'da-sql-analytics'],
    lede: 'CTEs, window functions and the patterns behind most business questions: trends, funnels, cohorts and RFM.',
    goals: ['Structure queries with CTEs', 'Rank, lag and run totals', 'Build cohort retention'] },
  { id: 'dau-sql3', track: 'analytics', level: 3, title: 'Data modeling', time: 30, study: ['da-sql-model'],
    lede: 'Star schemas, fact and dimension tables, and slowly changing dimensions: the shape BI tools need.',
    goals: ['Design a star schema', 'Choose a grain', 'Handle changing attributes'] },
  { id: 'dau-pbi1', track: 'analytics', level: 4, title: 'Power BI: modeling & DAX', time: 75, learn: 'da-dax-lab', study: ['da-pbi-intro', 'da-pbi-model', 'da-dax'],
    lede: 'The Power BI workflow, relationships and date tables, and DAX measures built on CALCULATE and filter context.',
    goals: ['Model a star schema in Power BI', 'Write CALCULATE measures', 'Use time intelligence'] },
  { id: 'dau-pbi2', track: 'analytics', level: 4, title: 'Power BI reports & sharing', time: 30, study: ['da-pbi-viz'],
    lede: 'Interactive report design, drill-through and bookmarks, row-level security, publishing and refresh.',
    goals: ['Lay out a report', 'Set up RLS', 'Publish and schedule refresh'] },
  { id: 'dau-tab', track: 'analytics', level: 4, title: 'Tableau', time: 75, study: ['da-tab-basics', 'da-tab-calcs', 'da-tab-dash'],
    lede: 'Dimensions and measures, discrete and continuous fields, calculated fields, LOD expressions, table calculations and dashboards with actions.',
    goals: ['Build views from pills', 'Write FIXED / INCLUDE / EXCLUDE LODs', 'Create interactive dashboards'] },
  { id: 'dau-py', track: 'analytics', level: 5, title: 'Python for analysts', time: 60, study: ['da-pandas', 'da-pyviz'],
    lede: 'pandas for loading, cleaning, joining and pivoting, and charts that answer the question.',
    goals: ['Translate SQL/Excel steps to pandas', 'Clean data reproducibly', 'Choose the right chart'] },
  { id: 'dau-ab', track: 'analytics', level: 5, title: 'Experiments & A/B testing', time: 45, learn: 'da-stats-lab', study: ['da-abtest'],
    lede: 'Hypothesis tests, p-values, confidence intervals and sample sizes, and how to run an A/B test that people can trust.',
    goals: ['Interpret p-values and CIs', 'Plan sample size', 'Spot invalid experiments'] },
  { id: 'dau-story', track: 'analytics', level: 5, title: 'KPIs & storytelling', time: 25, study: ['da-story'],
    lede: 'Precise metric definitions, dashboards vs analyses, and presenting findings that lead to decisions.',
    goals: ['Define metrics precisely', 'Lead with the insight', 'Avoid common traps'] },
  { id: 'dau-cases', track: 'analytics', level: 5, title: 'End-to-end projects', time: 90, study: ['da-case-sales', 'da-case-ab', 'da-case-churn'],
    lede: 'Three complete projects: a sales dashboard, an A/B test analysis, and a retention and churn study.',
    goals: ['Combine every tool', 'Validate before presenting', 'Size the business impact'] },
  { id: 'dau-final', track: 'analytics', level: 5, title: 'Final exam & portfolio', time: 30, page: 'daCapstone', quiz: 'da-quiz',
    lede: 'Test yourself across the track, then build a portfolio that shows you can do the job.',
    goals: ['Pass the final quiz', 'Plan portfolio projects', 'Know the next steps'] },

  /* ----- Cryptography ----- */
  { id: 'c-start', track: 'crypto', level: 0, title: 'Cryptography roadmap', time: 5, page: 'overview',
    lede: 'What this track covers, how each unit works, and the order to study it in.', goals: ['See the whole path', 'Pick your programming language', 'Learn the unit format'] },
  { id: 'u-crypto-intro', track: 'crypto', level: 1, title: 'What cryptography is for', time: 25, page: 'cryptoIntro', study: ['encoding', 'csprng'],
    lede: 'The goals of cryptography, the rules professionals follow, and two foundations people often get wrong: encoding isn’t encryption, and randomness must be secure.',
    goals: ['Name the security goals', 'Know Kerckhoffs’s principle', 'Use secure randomness'] },
  { id: 'u-classical', track: 'crypto', level: 1, title: 'Classical ciphers', time: 40, learn: 'caesar', study: ['caesar', 'vigenere', 'railfence'],
    lede: 'Hand ciphers from history, and the frequency analysis that broke them. They show why modern ciphers must hide all statistical patterns.',
    goals: ['Encrypt with substitution and transposition', 'Break a Caesar cipher with χ²', 'Explain why repeating keys fail'] },
  { id: 'u-otp', track: 'crypto', level: 1, title: 'XOR & the one-time pad', time: 30, learn: 'xor', study: ['xor'],
    lede: 'The only provably unbreakable cipher, and how reusing its key destroys it. The same mistake still breaks real systems as nonce reuse.',
    goals: ['Compute XOR bit by bit', 'Explain perfect secrecy', 'Recover messages from a reused key'] },
  { id: 'u-hashfn', track: 'crypto', level: 2, title: 'Cryptographic hash functions', time: 45, learn: 'hash', study: ['md5', 'sha1', 'sha256', 'sha3', 'blake2'],
    lede: 'Fingerprints for data: collision-resistant, one-way and avalanche-prone. Learn which hashes are broken, which to use, and why.',
    goals: ['Explain preimage and collision resistance', 'Know MD5 and SHA-1 are broken', 'Choose between SHA-2, SHA-3 and BLAKE2'] },
  { id: 'u-integrity', track: 'crypto', level: 2, title: 'Checksums, Merkle trees & MACs', time: 35, study: ['crc32', 'merkle', 'hmac'],
    lede: 'Three kinds of integrity: CRC catches accidents, Merkle trees commit to large datasets, and MACs stop attackers.',
    goals: ['Pick the right integrity tool', 'Build and verify a Merkle proof', 'Compare MAC tags safely'] },
  { id: 'u-passwords', track: 'crypto', level: 2, title: 'Password hashing & key derivation', time: 40, study: ['pbkdf2', 'scrypt', 'argon2', 'hkdf'],
    lede: 'Passwords need slow, salted, memory-hard hashing. Strong secrets need a fast KDF. Mixing the two up is a classic security bug.',
    goals: ['Store passwords correctly', 'Explain salts and work factors', 'Derive several keys from one secret'] },
  { id: 'u-aes', track: 'crypto', level: 3, title: 'AES & block cipher modes', time: 45, study: ['aes', 'cbc', 'ctr'],
    lede: 'The block cipher behind nearly all encryption, and the modes that turn it into something usable for real messages.',
    goals: ['Explain what one AES block does', 'Avoid ECB', 'Use IVs and nonces correctly'] },
  { id: 'u-aead', track: 'crypto', level: 3, title: 'Authenticated encryption', time: 35, study: ['gcm', 'chacha20'],
    lede: 'Modern encryption always comes with integrity. AES-GCM and ChaCha20-Poly1305 are what you should actually use.',
    goals: ['Use an AEAD API', 'Authenticate associated data', 'Handle tag failures safely'] },
  { id: 'u-rsa', track: 'crypto', level: 4, title: 'RSA', time: 45, learn: 'rsa', study: ['rsa', 'rsaoaep'],
    lede: 'Public-key encryption from prime numbers: the textbook math, then the padding real systems need.',
    goals: ['Generate an RSA key by hand', 'Explain why padding is required', 'Use hybrid encryption'] },
  { id: 'u-kex', track: 'crypto', level: 4, title: 'Key exchange & elliptic curves', time: 50, learn: 'dh', study: ['dh', 'ecc', 'x25519'],
    lede: 'Agree on a secret over a public channel, first with modular arithmetic, then with elliptic curves.',
    goals: ['Run Diffie–Hellman', 'Add points on an elliptic curve', 'Use X25519 with a KDF'] },
  { id: 'u-sig', track: 'crypto', level: 4, title: 'Digital signatures', time: 35, study: ['ecdsa', 'ed25519'],
    lede: 'Prove who wrote a message and that it wasn’t changed. Signatures power certificates, software updates and blockchains.',
    goals: ['Sign and verify messages', 'Explain the ECDSA nonce danger', 'Prefer Ed25519 for new designs'] },
  { id: 'u-protocols', track: 'crypto', level: 5, title: 'Protocols: TLS 1.3 & PKI', time: 50, study: ['tls13', 'pki'],
    lede: 'Everything comes together: how TLS 1.3 combines key exchange, HKDF, AEAD and signatures into one round trip, and how certificates tell you whose key you are talking to.',
    goals: ['Walk through a TLS 1.3 handshake', 'Explain forward secrecy and 0-RTT trade-offs', 'Validate a certificate chain'] },
  { id: 'u-attacks', track: 'crypto', level: 5, title: 'Attacks lab', time: 40, learn: 'cr-attacks', study: ['crypto-attacks'],
    lede: 'Break things on purpose: ECB patterns, nonce reuse, birthday collisions and a timing attack, all running in your browser.',
    goals: ['Recognize the common misuse patterns', 'Explain why each fix works', 'Use a misuse checklist in code review'] },
  { id: 'u-advanced', track: 'crypto', level: 5, title: 'Post-quantum & secret sharing', time: 40, study: ['lwe', 'shamir'],
    lede: 'Where cryptography is heading: lattice-based encryption that survives quantum computers, and splitting secrets between people.',
    goals: ['Explain the LWE problem', 'Know why post-quantum matters now', 'Split and recover a secret'] },
  { id: 'u-final', track: 'crypto', level: 5, title: 'Final exam & capstone', time: 30, page: 'capstone', quiz: 'crypto-quiz',
    lede: 'Test your cryptography knowledge, then put everything together in a project of your own.',
    goals: ['Pass the final quiz', 'Choose a capstone project', 'Know where to go next'],
    extra: [Q('You need to store user passwords. Which is correct?', ['AES-encrypt them', 'SHA-256 them', 'Argon2id with a unique salt', 'Base64 them'], 2, 'Passwords need a slow, salted, memory-hard hash.'),
      Q('You need to encrypt files. Which is the best default?', ['AES-ECB', 'AES-GCM with a fresh nonce', 'RSA on each byte', 'XOR with a password'], 1, 'An AEAD mode gives confidentiality and integrity.'),
      Q('Which pair is quantum-safe?', ['RSA and ECDSA', 'X25519 and Ed25519', 'ML-KEM and ML-DSA', 'DH and DSA'], 2, 'The NIST post-quantum standards are lattice based.')] }
];
UNITS.forEach(u => {
  const T = TRACK_INFO[u.track];
  if (u.topic) { const A = ALGOS[u.topic] || SD[u.topic]; u.lede = u.lede || A.blurb; u.goals = u.goals || []; }
  u.list = UNITS.filter(x => x.track === u.track);
  u.index = u.list.indexOf(u);
  const inLevel = u.list.filter(x => x.level === u.level);
  u.code = u.level === 0 ? '··' : `${u.level}.${inLevel.indexOf(u) + 1}`;
  u.levelName = T.levels[u.level];
});
const unitsOf = t => UNITS.filter(u => u.track === t);
const unitById = id => UNITS.find(u => u.id === id);

const unitSteps = u => {
  if (u.topic) return [];
  const steps = [];
  if (u.page || u.learn) steps.push(['learn', u.page === 'overview' ? 'Overview' : 'Learn', u.learn ? 'Interactive lesson' : 'Read']);
  if (u.study && u.study.length) steps.push(['study', 'Study', `${u.study.length} topic${u.study.length > 1 ? 's' : ''}`]);
  if (u.practice) { const n = PROBS.filter(p => u.practice.includes(p.c)).length; steps.push(['practice', 'Practice', `${n} problems`]); }
  const nq = (u.study || u.checkKeys || []).length + (u.extra || []).length + (u.quiz ? ((lessonById(u.quiz) || {}).n || 6) : 0);
  if (nq) steps.push(['check', 'Check', `${nq} questions`]);
  return steps;
};

function openUnit(id, step, topic) {
  const u = unitById(id); if (!u) return;
  cur.track = u.track; cur[u.track] = u.index; cur.step = step || null; cur.unitTopic = topic || null; cur.prob = null; go();
}
function openSdTopic(k) {
  const u = UNITS.find(x => x.topic === k) || UNITS.find(x => (x.study || []).includes(k));
  if (!u) return;
  if (u.topic) openUnit(u.id); else openUnit(u.id, 'study', k);
}
function openTopic(k) {
  const u = UNITS.find(x => x.topic === k) || UNITS.find(x => !(TRACK_INFO[x.track] || {}).sd && (x.study || []).includes(k));
  if (!u) return;
  if (u.topic) openUnit(u.id); else openUnit(u.id, 'study', k);
}

/* ---- special pages ---- */
const PAGES = {
  overview(el, u) {
    const T = TRACK_INFO[u.track], list = unitsOf(u.track).filter(x => x.level > 0);
    const done_ = list.filter(x => done[x.id]).length;
    const next = list.find(x => !done[x.id]) || list[list.length - 1];
    const others = COURSES.filter(c => c.id !== u.track);
    el.innerHTML = `<div class="card"><h3>Where you’re going</h3>
      <p style="margin:6px 0 0;max-width:68ch">${T.pitch}</p><p style="margin:8px 0 0;max-width:68ch;color:var(--muted)">${T.outcome}</p></div>
      <div class="row" style="margin:16px 0"><button class="btn primary" id="wnext">${done_ ? 'Continue: ' : 'Start: '}Unit ${next.code} · ${esc(next.title)}</button><span class="stats"><span>Completed <b>${done_} / ${list.length}</b> units</span><span>About <b>${Math.max(1, Math.round(list.reduce((s, x) => s + x.time, 0) / 60))} hours</b></span></span></div>
      <h2 class="section-title">The roadmap</h2><p class="section-sub">Each level builds on the ones before it. Do them in order the first time.</p>
      <div class="roadmap">${T.levels.map((name, lv) => { if (!lv) return ''; const us = list.filter(x => x.level === lv); const d = us.filter(x => done[x.id]).length; return `<div class="card lvl"><div class="lvlhead"><span class="lvlnum">Level ${lv}</span><span class="stats"><span><b>${d}/${us.length}</b></span></span></div><h3>${name}</h3><ol>${us.map(x => `<li><button data-u="${x.id}" class="${done[x.id] ? 'done' : ''}">${done[x.id] ? '✓ ' : ''}${esc(x.title)}</button></li>`).join('')}</ol></div>`; }).join('')}</div>
      <h2 class="section-title">How every unit works</h2>
      <div class="steps4">
        <div class="card"><span class="stepnum">1</span><h3>Learn</h3><p>An interactive lesson or a short reading that introduces the idea.</p></div>
        <div class="card"><span class="stepnum">2</span><h3>Study</h3><p>Each topic has a detailed explanation, a worked example or diagram, and code or syntax you can copy.</p></div>
        <div class="card"><span class="stepnum">3</span><h3>Practice</h3><p>NeetCode problems for that pattern, with hints before solutions.</p></div>
        <div class="card"><span class="stepnum">4</span><h3>Check</h3><p>Quick questions with explanations. Then mark the unit complete.</p></div>
      </div>
      <h2 class="section-title">Pick your language</h2><p class="section-sub">Every code sample switches to it. You can change it anytime.</p>
      <div class="langs" id="wlang" style="display:inline-flex">${LANGS.map(([k, l]) => `<button data-l="${k}" aria-pressed="${k === lang}">${l}</button>`).join('')}</div>
      <h2 class="section-title">Other tracks</h2>
      <div class="steps4">${others.map(c => `<button class="card trackcard" data-t="${c.id}" style="border-top-color:var(${c.color})"><h3>${c.title}</h3><p>${c.tag}</p></button>`).join('')}</div>
      <p class="section-sub" style="margin-top:18px">Tip: press <kbd>/</kbd> anywhere to search every topic, unit and problem.</p>`;
    $('#wnext', el).onclick = () => openUnit(next.id);
    $$('.roadmap button', el).forEach(b => b.onclick = () => openUnit(b.dataset.u));
    $$('#wlang button', el).forEach(b => b.onclick = () => { lang = b.dataset.l; store.set('bf-lang', lang); $$('#wlang button', el).forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $$('.trackcard', el).forEach(b => b.onclick = () => { cur.track = b.dataset.t; cur.prob = null; cur.step = null; cur.unitTopic = null; go(); });
  },
  bigo(el) {
    el.innerHTML = `<div class="card explain">
      <section class="xsec"><h3><span class="xn">1</span>What Big-O measures</h3><p>Big-O describes how an algorithm’s work grows as its input size n grows. It ignores constant factors and small terms, because for large n the fastest-growing term dominates: 3n² + 100n + 7 behaves like n², so it is O(n²). It is a statement about growth, not about seconds.</p></section>
      <section class="xsec"><h3><span class="xn">2</span>The common classes</h3>
        <div class="tblwrap"><table class="cx"><thead><tr><th>Class</th><th>Name</th><th>n = 1,000 → about</th><th>Typical example</th></tr></thead><tbody>
        <tr><th>O(1)</th><td>Constant</td><td>1</td><td class="why">Array index, hash table lookup</td></tr>
        <tr><th>O(log n)</th><td>Logarithmic</td><td>10</td><td class="why">Binary search, heap push/pop</td></tr>
        <tr><th>O(n)</th><td>Linear</td><td>1,000</td><td class="why">One pass over the data</td></tr>
        <tr><th>O(n log n)</th><td>Linearithmic</td><td>10,000</td><td class="why">Merge sort, heap sort</td></tr>
        <tr><th>O(n²)</th><td>Quadratic</td><td>1,000,000</td><td class="why">Nested loops over all pairs</td></tr>
        <tr><th>O(2ⁿ)</th><td>Exponential</td><td>≈ 10³⁰¹</td><td class="why">All subsets</td></tr>
        </tbody></table></div></section>
      <section class="xsec"><h3><span class="xn">3</span>How to work it out</h3><ol class="xsteps">
        <li>Count how many times the innermost operation runs as a function of n.</li>
        <li>Sequential blocks add: O(n) followed by O(n²) is O(n²).</li>
        <li>Nested loops multiply: a loop of n inside a loop of n is O(n²).</li>
        <li>A loop that halves (or doubles) its variable runs O(log n) times.</li>
        <li>For recursion, multiply the number of calls by the work per call, or use a recurrence such as T(n) = 2T(n/2) + n → O(n log n).</li></ol></section>
      <section class="xsec"><h3><span class="xn">4</span>Best, average, worst, and space</h3><p>The same algorithm can do different amounts of work on different inputs of the same size: insertion sort is O(n) on sorted input and O(n²) on reversed input. Interviews usually ask for the worst case. Space complexity counts the extra memory used beyond the input, including the recursion stack.</p></section>
      <section class="xsec"><h3><span class="xn">5</span>Amortized cost</h3><p>Some operations are occasionally expensive but cheap on average over a sequence. Appending to a dynamic array sometimes copies everything (O(n)), but because capacity doubles, n appends cost O(n) in total, so each append is O(1) amortized.</p></section>
    </div>
    <p class="section-sub" style="margin-top:14px">Want to see these curves for real? The <button class="inline-link" id="bmeasure">Measure the sorts</button> lab in the Sorting track counts comparisons on inputs up to 4,000 items.</p>`;
    $('#bmeasure', el).onclick = () => openUnit('s-measure');
  },
  sortCompare(el) {
    const rows = [['Bubble sort', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', 'Yes', 'Teaching only'], ['Insertion sort', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', 'Yes', 'Small or nearly sorted data'],
      ['Selection sort', 'O(n²)', 'O(n²)', 'O(n²)', 'O(1)', 'No', 'When writes are expensive'], ['Merge sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Yes', 'Stable sorting, linked lists, external data'],
      ['Quicksort', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', 'No', 'Fastest general in-memory sort'], ['Heap sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'No', 'Guaranteed bound with no extra memory'],
      ['Counting sort', 'O(n + k)', 'O(n + k)', 'O(n + k)', 'O(k)', 'Yes', 'Small integer ranges']];
    el.innerHTML = `<div class="card"><div class="tblwrap"><table class="cx"><thead><tr><th>Sort</th><th>Best</th><th>Average</th><th>Worst</th><th>Extra space</th><th>Stable</th><th>Use it for</th></tr></thead><tbody>
      ${rows.map(r => `<tr><th><button class="inline-link" data-k="${SORT_KEYS[rows.indexOf(r)]}">${r[0]}</button></th><td>${r[1]}</td><td>${r[2]}</td><td class="${r[3] === 'O(n²)' ? 'bo' : ''}">${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td class="why">${r[6]}</td></tr>`).join('')}
      </tbody></table></div></div>
      <h2 class="section-title">Choosing a sort</h2>
      <ul class="pts" style="max-width:70ch"><li>In real code, call your language’s built-in sort. It is a tuned hybrid (Timsort or introsort).</li><li>Need stability? Merge sort or Timsort. Need O(1) memory with a guarantee? Heap sort.</li><li>Small integers in a known range? Counting or radix sort beat every comparison sort.</li><li>No comparison sort can beat Ω(n log n) in the worst case: there are n! possible orders, and each comparison at best halves them, so you need log₂(n!) ≈ n log₂ n comparisons.</li></ul>`;
    $$('[data-k]', el).forEach(b => b.onclick = () => openTopic(b.dataset.k));
  },
  cryptoIntro(el) {
    el.innerHTML = `<div class="two">
      <div class="card"><h3>The four goals</h3><ul class="pts" style="margin-top:8px">
        <li><b>Confidentiality</b>: only the intended people can read it (encryption).</li>
        <li><b>Integrity</b>: nobody changed it without being detected (hashes, MACs).</li>
        <li><b>Authenticity</b>: you know who it came from (MACs, signatures).</li>
        <li><b>Non-repudiation</b>: the sender can’t later deny it (signatures).</li></ul></div>
      <div class="card"><h3>Rules professionals follow</h3><ul class="pts" style="margin-top:8px">
        <li><b>Kerckhoffs’s principle</b>: a system must stay secure even if everything except the key is public.</li>
        <li><b>Don’t roll your own crypto.</b> Implement algorithms to learn them; use vetted libraries in production.</li>
        <li><b>Encoding ≠ encryption ≠ hashing.</b> Base64 hides nothing; hashes can’t be decrypted; encryption needs a key.</li>
        <li><b>Randomness is security-critical.</b> Keys, nonces and salts come from a CSPRNG.</li></ul></div></div>
      <h2 class="section-title">The map of this track</h2>
      <div class="card"><div class="tblwrap"><table class="cx"><thead><tr><th>Tool</th><th>Key?</th><th>Reversible?</th><th>Gives you</th><th>Examples</th></tr></thead><tbody>
        <tr><th>Encoding</th><td>No</td><td>Yes, by anyone</td><td class="why">Safe transport of bytes</td><td class="bo">Base64, hex</td></tr>
        <tr><th>Hash</th><td>No</td><td>No</td><td class="why">Integrity fingerprint</td><td class="bo">SHA-256, SHA-3</td></tr>
        <tr><th>MAC</th><td>Shared secret</td><td>No</td><td class="why">Integrity + authenticity</td><td class="bo">HMAC</td></tr>
        <tr><th>Symmetric cipher</th><td>Shared secret</td><td>Yes, with the key</td><td class="why">Confidentiality (+ integrity if AEAD)</td><td class="bo">AES-GCM, ChaCha20</td></tr>
        <tr><th>Public-key encryption / KEM</th><td>Key pair</td><td>Yes, with private key</td><td class="why">Share secrets with strangers</td><td class="bo">RSA-OAEP, X25519, ML-KEM</td></tr>
        <tr><th>Signature</th><td>Key pair</td><td>No</td><td class="why">Authenticity + non-repudiation</td><td class="bo">Ed25519, ECDSA</td></tr>
        <tr><th>Password hash</th><td>Salt (public)</td><td>No</td><td class="why">Slow guessing of stolen hashes</td><td class="bo">Argon2id, scrypt</td></tr>
      </tbody></table></div></div>`;
  },
  capstone(el) {
    el.innerHTML = `<div class="card"><h3>You made it to the end</h3><p style="margin:6px 0 0;max-width:68ch">Take the final quiz in the Check step. Then choose a project: building something real is how this knowledge sticks.</p></div>
      <h2 class="section-title">Capstone projects</h2><div class="steps4">
      <div class="card"><h3>Encrypted notes app</h3><p>Derive a key from a password with Argon2id, encrypt notes with AES-GCM, store salt and nonce alongside.</p></div>
      <div class="card"><h3>Signed file releases</h3><p>Hash files with SHA-256, sign the hash list with Ed25519, and write a verifier.</p></div>
      <div class="card"><h3>Mini secure chat</h3><p>X25519 key exchange, HKDF to derive keys, ChaCha20-Poly1305 for messages. Then add signatures to stop a man in the middle.</p></div>
      <div class="card"><h3>Cryptopals</h3><p>Work through cryptopals.com: break the mistakes you studied here (ECB, CBC padding oracles, nonce reuse).</p></div>
      <div class="card"><h3>NeetCode 150 sweep</h3><p>Finish every pattern in the Problems tab, then redo the Hard ones from memory a week later.</p></div>
      <div class="card"><h3>Algorithm visualizer</h3><p>Pick a topic without a visualizer (Dijkstra, LCS, Merkle trees) and build one.</p></div></div>`;
  }
};

Object.assign(PAGES, SD_PAGES, DA_PAGES, IP_PAGES);

function unitPage(sec, u) {
  const steps = unitSteps(u);
  if (!cur.step || !steps.some(s => s[0] === cur.step)) cur.step = steps[0] ? steps[0][0] : null;
  const prev = u.list[u.index - 1], next = u.list[u.index + 1];
  const T = TRACK_INFO[u.track];
  sec.innerHTML = `<div class="eyebrow">${T.title} · Level ${u.level} · ${u.levelName}${u.level ? ' · Unit ' + u.code : ''}</div>
    ${u.topic ? '' : `<h1>${esc(u.title)}</h1><p class="lede">${u.lede}</p>
    <div class="meta"><span class="pill prem">≈ ${u.time} min</span>${done[u.id] ? '<span class="pill Easy">Completed</span>' : ''}</div>
    <ul class="goals">${u.goals.map(g => `<li><b>✓</b>${g}</li>`).join('')}</ul>`}
    ${steps.length > 1 ? `<div class="steptabs" role="tablist">${steps.map(([id, label, sub], i) => `<button role="tab" data-s="${id}" aria-selected="${id === cur.step}"><span class="sn">${i + 1}</span><span><b>${label}</b><small>${sub}</small></span></button>`).join('')}</div>` : ''}
    <div id="stepbody"></div>
    <div class="foot"><button class="btn" id="uprev" ${prev ? '' : 'disabled'}>← ${prev ? esc(prev.title) : 'Previous'}</button>
      ${u.level ? `<button class="btn primary" id="udone">${done[u.id] ? 'Completed ✓' : 'Mark complete'}</button>` : ''}
      <button class="btn" id="unext" ${next ? '' : 'disabled'}>${next ? esc(next.title) : 'Next'} →</button></div>`;
  const body = $('#stepbody', sec);
  const isSD = !!(TRACK_INFO[u.track] || {}).sd;
  const renderStep = () => {
    cleanup(); cleanup = () => {};
    $$('.steptabs button', sec).forEach(b => b.setAttribute('aria-selected', b.dataset.s === cur.step));
    const s = cur.step;
    if (u.topic) {
      const keys = u.track === 'sorting' ? SORT_KEYS : [u.topic];
      (SD[u.topic] ? sdTopicDetail : topicDetail)(body, u.topic, { keys, noFoot: true, noEyebrow: true });
    } else if (s === 'learn') {
      if (u.page) { body.innerHTML = '<div id="pg"></div>'; PAGES[u.page]($('#pg', body), u); }
      else { const l = lessonById(u.learn); body.innerHTML = `<div class="lesson-intro"><span class="panel-title">Interactive lesson</span><h2 class="section-title" style="margin-top:4px">${l.title}</h2><p class="section-sub">${l.lede}</p></div><div id="lb"></div>`; l.render($('#lb', body)); }
    } else if (s === 'study') {
      const showList = () => {
        cur.unitTopic = null;
        body.innerHTML = `<p class="section-sub" style="margin-top:6px">${isSD ? 'Open each topic: step through its diagram, read the detailed explanation and answer its questions.' : 'Open each topic: read how it works, step through its worked example and answer its question.'} Studied topics get a ✓.</p>${mixedCards(u.study)}`;
        $$('.libcard', body).forEach(b => b.onclick = () => { openT(b.dataset.k); body.scrollIntoView(); });
      };
      const openT = k => {
        cur.unitTopic = k; store.set('bf-cur', cur); syncHash();
        (SD[k] ? sdTopicDetail : topicDetail)(body, k, { keys: u.study, eyebrow: `${TRACK_INFO[u.track].title} · ${u.title}`, backLabel: `All topics in ${u.title}`, onBack: () => { showList(); body.scrollIntoView(); }, onOpen: k2 => { openT(k2); body.scrollIntoView(); } });
      };
      if (cur.unitTopic && u.study.includes(cur.unitTopic)) openT(cur.unitTopic); else showList();
    } else if (s === 'practice') {
      body.innerHTML = u.practice.map(c => { const list = PROBS.filter(p => p.c === c); return `<h2 class="section-title">${catName(c)}</h2><p class="section-sub">${CAT_LEDE[c]} Solved ${list.filter(p => solved[p.n]).length} of ${list.length}.</p>${problemTable(list, false)}`; }).join('') +
        '<p class="section-sub" style="margin-top:14px">Problems open in the Problems tab, with hints, a pattern quiz and solutions in four languages.</p>';
      wireTable(body);
    } else if (s === 'check') {
      const qs = [...(u.study || u.checkKeys || []).map(k => SD[k] ? (SD[k].qs || [SD[k].q])[0] : ALGOS[k].q), ...(u.extra || [])];
      body.innerHTML = `${qs.length ? `<p class="section-sub" style="margin-top:6px">Answer each one; the explanation appears right after.</p><div class="stack" style="gap:12px">${qs.map((_, i) => `<div class="card" id="cq${i}"></div>`).join('')}</div>` : ''}${u.quiz ? `<h2 class="section-title">${lessonById(u.quiz).title}</h2><div id="cquiz"></div>` : ''}`;
      qs.forEach((q, i) => mcq($('#cq' + i, body), q));
      if (u.quiz) lessonById(u.quiz).render($('#cquiz', body));
    }
  };
  $$('.steptabs button', sec).forEach(b => b.onclick = () => { cur.step = b.dataset.s; cur.unitTopic = null; store.set('bf-cur', cur); renderStep(); syncHash(); });
  renderStep();
  const ud = $('#udone', sec);
  if (ud) ud.onclick = () => { done[u.id] = !done[u.id]; store.set('bf-done', done); renderTrack(); ud.textContent = done[u.id] ? 'Completed ✓' : 'Mark complete'; };
  if (prev) $('#uprev', sec).onclick = () => openUnit(prev.id);
  if (next) $('#unext', sec).onclick = () => { if (u.level && !done[u.id]) { done[u.id] = true; store.set('bf-done', done); } openUnit(next.id); };
}

const unitLessons = t => unitsOf(t).map(u => ({ id: u.id, title: u.title, unit: true, code: u.code,
  group: unitsOf(t).find(x => x.level === u.level) === u ? (u.level ? `Level ${u.level} · ${u.levelName}` : null) : null,
  render: sec => unitPage(sec, u) }));

/* ================= course registry & switcher =================
   To add a course: add a TRACK entry below and one line here. The switcher, overview pages and search pick it up. */
const CICON = {
  sort: '<path d="M4 20V13M9 20V8M14 20V11M19 20V4"/>',
  algo: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7 7l3.8 9M17 7l-3.8 9M7.2 6h9.6"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  chart: '<path d="M4 20h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/><path d="M5 10l5-4 4 3 5-5"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  scale: '<path d="M12 3v18M7 21h10M4 7h16"/><path d="M4 7l-2.5 6a3 3 0 0 0 5 0zM20 7l-2.5 6a3 3 0 0 0 5 0z"/>',
  sheet: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 11h7M9 15h7M9 19h4"/>'
};
const COURSES = [
  { id: 'sorting', title: 'Sorting', group: 'Computer science', icon: 'sort', color: '--sort', tag: 'Seven sorting algorithms, traced step by step and measured.' },
  { id: 'algorithms', title: 'Algorithms', group: 'Computer science', icon: 'algo', color: '--algo', tag: 'Big-O, searching, patterns, data structures, graphs, DP.' },
  { id: 'problems', title: 'Problems', group: 'Computer science', icon: 'code', color: '--fn', tag: 'NeetCode 150 with hints and solutions in four languages.' },
  { id: 'design', title: 'System Design', group: 'Engineering', icon: 'layers', color: '--design', tag: 'Scaling, caching, databases, consistency and fourteen case studies.' },
  { id: 'crypto', title: 'Cryptography', group: 'Security', icon: 'lock', color: '--crypto', tag: 'Ciphers, hashing, AES, RSA, signatures and post-quantum.' },
  { id: 'analytics', title: 'Data Analytics', group: 'Data', icon: 'chart', color: '--data', tag: 'Statistics, Excel, SQL, Power BI, Tableau and Python.' },
  { id: 'interview', title: 'Interview Prep', group: 'Careers', icon: 'brief', color: '--career', tag: 'Cheat sheets and detailed prep for frontend, backend, full-stack and SWE roles.' },
  { id: 'compare', title: 'X vs Y', group: 'Reference', icon: 'scale', color: '--cmp', tag: 'Kafka vs RabbitMQ, Postgres vs MySQL, REST vs gRPC vs GraphQL and more, with model answers.' },
  { id: 'cheats', title: 'Cheat Sheets', group: 'Reference', icon: 'sheet', color: '--ref', tag: 'Printable one-pagers: Big-O, patterns, SQL, Git, Linux, regex, HTTP, Docker, crypto.' },
];
const courseById = id => COURSES.find(c => c.id === id) || COURSES[0];
const cicon = c => `<span class="cico" style="--c:var(${c.color})" aria-hidden="true"><svg viewBox="0 0 24 24">${CICON[c.icon]}</svg></span>`;
function paintCourseBtn() {
  const c = courseById(cur.track);
  $('#courseIco').outerHTML = cicon(c).replace('class="cico"', 'class="cico" id="courseIco"');
  $('#courseName').textContent = c.title;
}
function initCourseSwitcher() {
  const btn = $('#courseBtn'), menu = $('#courseMenu');
  const items = () => $$('.citem', menu);
  const close = (refocus) => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); };
  const open = () => {
    const groups = [...new Set(COURSES.map(c => c.group))];
    const ordered = groups.flatMap(g => COURSES.filter(c => c.group === g));
    menu.innerHTML = `<div class="chd"><h3>Courses</h3><span>${COURSES.length} courses</span></div><div class="cgrid">${ordered.map(c => {
      const pr = TRACKS[c.id].progress(), pct = pr.of ? Math.round(pr.n / pr.of * 100) : 0;
      return `<button class="citem" style="--c:var(${c.color})" data-t="${c.id}" ${c.id === cur.track ? 'aria-current="true"' : ''}>${cicon(c)}<span><small class="cg">${c.group}</small><b>${c.title}</b><span class="ct">${c.tag}</span><span class="cp"><i><span style="width:${pct}%"></span></i>${pr.n}/${pr.of}</span></span></button>`;
    }).join('')}</div><div class="cfoot"><span>Tip: press <kbd>/</kbd> to search every course.</span><span class="row" style="gap:6px"><button class="btn sm" id="pexp" type="button">Export progress</button><button class="btn sm" id="pimp" type="button">Import progress</button><button class="btn sm primary" id="pinst" type="button" hidden>Install app</button>${window.bfLock ? '<button class="btn sm" id="plock" type="button">Lock</button>' : ''}</span></div>`;
    if (window.bfInstall) bfInstall.wire($('#pinst', menu));
    if (window.bfLock) $('#plock', menu).onclick = window.bfLock;
    $('#pexp', menu).onclick = exportProgress; $('#pimp', menu).onclick = importProgress;
    if (window.innerWidth <= 860) menu.style.top = ($('.top').getBoundingClientRect().bottom + 8) + 'px'; else menu.style.top = '';
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true');
    items().forEach(b => b.onclick = () => { close(); cur.track = b.dataset.t; cur.prob = null; cur.step = null; cur.unitTopic = null; go(); });
    (items().find(b => b.getAttribute('aria-current')) || items()[0]).focus();
  };
  btn.onclick = e => { e.stopPropagation(); menu.hidden ? open() : close(); };
  menu.addEventListener('keydown', e => {
    const list = items(), i = list.indexOf(document.activeElement);
    const cols = window.innerWidth <= 860 ? 1 : 3;
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); list[Math.min(list.length - 1, i + cols)].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[Math.max(0, i - cols)].focus(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); list[Math.min(list.length - 1, i + 1)].focus(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); list[Math.max(0, i - 1)].focus(); }
    else if (e.key === 'Tab' && !e.shiftKey && i === list.length - 1) close();
  });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close(); });
}

/* ================= shell ================= */
PROB_LESSONS.forEach((l, i) => { l.code = i === 0 ? '··' : String(i).padStart(2, '0'); });
const trackProgress = t => () => { const l = unitsOf(t).filter(u => u.level > 0); return { n: l.filter(u => done[u.id]).length, of: l.length, label: 'units complete' }; };
const TRACKS = {
  sorting: { title: 'Sorting', desc: `Seven sorting algorithms from bubble sort to counting sort: ${unitsOf('sorting').length - 1} units, beginner to advanced.`, lessons: unitLessons('sorting'), progress: trackProgress('sorting') },
  algorithms: { title: 'Algorithms', desc: `Big-O, searching, patterns, data structures, graphs, DP and greedy: ${unitsOf('algorithms').length - 1} units, beginner to advanced.`, lessons: unitLessons('algorithms'), progress: trackProgress('algorithms') },
  interview: { title: 'Interview Prep', desc: `Cheat sheets and detailed prep for frontend, backend, full-stack and software engineering roles: ${unitsOf('interview').length - 1} units.`, lessons: unitLessons('interview'), progress: trackProgress('interview') },
  analytics: { title: 'Data Analytics', desc: `Statistics, Excel, SQL, Power BI, Tableau, Python and A/B testing: ${unitsOf('analytics').length - 1} units, zero to hero.`, lessons: unitLessons('analytics'), progress: trackProgress('analytics') },
  design: { title: 'System Design', desc: `Requirements to case studies: networking, caching, databases, sharding, queues, consistency, reliability: ${unitsOf('design').length - 1} units.`, lessons: unitLessons('design'), progress: trackProgress('design') },
  compare: { title: 'X vs Y', desc: `Side-by-side comparisons with when to pick each and model interview answers: ${unitsOf('compare').length - 1} comparisons.`, lessons: unitLessons('compare'), progress: trackProgress('compare') },
  cheats: { title: 'Cheat Sheets', desc: `Printable one-page references: ${unitsOf('cheats').length - 1} sheets.`, lessons: unitLessons('cheats'), progress: trackProgress('cheats') },
  crypto: { title: 'Cryptography', desc: `Classical ciphers, hashing, passwords, AES, RSA, curves, signatures and post-quantum: ${unitsOf('crypto').length - 1} units.`, lessons: unitLessons('crypto'), progress: trackProgress('crypto') },
  problems: { title: 'Problems', desc: 'NeetCode 150: hints, pattern quizzes, approaches and solutions in four languages, with progress tracking.', lessons: PROB_LESSONS,
    progress: () => ({ n: PROBS.filter(p => solved[p.n]).length, of: PROBS.length, label: 'problems solved' }) }
};
if (!TRACKS[cur.track] || !cur.v5) { cur = { track: 'sorting', v5: 1 }; }
for (const k in TRACKS) if (typeof cur[k] !== 'number') cur[k] = 0;

function renderTrack() {
  const t = TRACKS[cur.track]; document.body.dataset.track = cur.track;
  if (cur[cur.track] >= t.lessons.length) cur[cur.track] = 0;
  paintCourseBtn();
  $('#trackTitle').textContent = t.title; $('#trackDesc').textContent = t.desc;
  const pr = t.progress();
  $('#progBar').style.width = (pr.n / pr.of * 100) + '%'; $('#progText').textContent = `${pr.n} of ${pr.of} ${pr.label}`;
  $('#lessonList').innerHTML = t.lessons.map((l, i) => {
    const isDone = l.unit && done[l.id];
    return `${l.group ? `<li class="grouphead">${l.group}</li>` : ''}<li><button data-i="${i}" ${i === cur[cur.track] ? 'aria-current="true"' : ''} class="${isDone ? 'done' : ''}"><span class="n">${isDone ? '✓' : l.code}</span><span class="t">${l.title}</span><span class="cnt">${l.count ? l.count() : ''}</span></button></li>`;
  }).join('');
  $$('#lessonList button').forEach(b => b.onclick = () => {
    cur[cur.track] = +b.dataset.i; cur.prob = null; cur.step = null; cur.unitTopic = null; go();
  });
}

function renderLesson() {
  cleanup(); cleanup = () => {};
  const t = TRACKS[cur.track], l = t.lessons[cur[cur.track]];
  l.render($('#lesson'));
}

function go(noPush) { store.set('bf-cur', cur); renderTrack(); renderLesson(); window.scrollTo({ top: 0 }); syncHash(noPush); }

/* ---------- deep links: #/track/unit[/step[/topic]] and #/problems/<n | pattern> ---------- */
function routeFor() {
  if (cur.track === 'problems') {
    if (cur.prob) return '#/problems/' + cur.prob;
    const pl = PROB_LESSONS[cur.problems || 0];
    return cur.problems && pl ? '#/problems/' + (pl.cat || pl.id) : '#/problems';
  }
  const l = TRACKS[cur.track].lessons[cur[cur.track]];
  return '#/' + [cur.track, l && l.id, cur.step, cur.unitTopic].filter(Boolean).join('/');
}
function syncHash(noPush) {
  const h = routeFor();
  if (location.hash === h) return;
  try { history[noPush ? 'replaceState' : 'pushState'](null, '', h); } catch (e) {}
}
function applyRoute(hash) {
  const parts = decodeURIComponent(hash.replace(/^#\/?/, '')).split('/').filter(Boolean);
  if (!parts.length || !TRACKS[parts[0]]) return false;
  const tr = parts[0];
  cur.track = tr; cur.prob = null; cur.step = null; cur.unitTopic = null;
  if (tr === 'problems') {
    cur.problems = 0;
    if (parts[1]) {
      const n = +parts[1];
      if (n && PROBS.some(p => p.n === n)) { const p = PROBS.find(x => x.n === n); cur.problems = 1 + PCATS.findIndex(c => c[0] === p.c); cur.prob = n; }
      else { const i = PROB_LESSONS.findIndex(l => l.cat === parts[1] || l.id === parts[1]); if (i >= 0) cur.problems = i; }
    }
    return true;
  }
  const i = parts[1] ? TRACKS[tr].lessons.findIndex(l => l.id === parts[1]) : 0;
  cur[tr] = i >= 0 ? i : 0;
  if (parts[2]) cur.step = parts[2];
  if (parts[3]) cur.unitTopic = parts[3];
  return true;
}
window.addEventListener('popstate', () => { if (applyRoute(location.hash)) go(true); });
initCourseSwitcher();
initTheme();
if (location.hash) { const legacy = location.hash.slice(1); if (TRACKS[legacy]) cur.track = legacy; else applyRoute(location.hash); }

/* ---------- theme toggle: system → light → dark ---------- */
function initTheme() {
  const btn = $('#themeBtn'); if (!btn) return;
  const ICON = {
    system: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>'
  };
  const apply = m => {
    if (m === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = m;
    btn.innerHTML = ICON[m]; btn.setAttribute('aria-label', 'Theme: ' + m + ' (click to change)'); btn.title = 'Theme: ' + m;
  };
  let mode = store.get('bf-theme', 'system');
  apply(mode);
  btn.onclick = () => { mode = { system: 'light', light: 'dark', dark: 'system' }[mode]; store.set('bf-theme', mode); apply(mode); };
}

/* ---------- progress export / import ---------- */
function exportProgress() {
  const data = { app: 'bitforge', version: 1, exported: new Date().toISOString(), keys: {} };
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('bf-')) data.keys[k] = localStorage.getItem(k); } } catch (e) {}
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'bitforge-progress-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  // where downloads are blocked (embedded previews), the clipboard copy still works
  try { navigator.clipboard.writeText(JSON.stringify(data)).then(() => alertBox('Progress downloaded and copied to the clipboard.'), () => alertBox('Progress file downloaded.')); } catch (e) { alertBox('Progress file downloaded.'); }
}
function importProgress() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    f.text().then(txt => {
      const data = JSON.parse(txt);
      if (!data || data.app !== 'bitforge' || typeof data.keys !== 'object') throw new Error('Not a Bitforge progress file');
      Object.entries(data.keys).forEach(([k, v]) => { if (k.startsWith('bf-')) localStorage.setItem(k, v); });
      location.reload();
    }).catch(e => alertBox('Import failed: ' + e.message));
  };
  inp.click();
}
function alertBox(msg) { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 4000); }

/* ================= global search ================= */
const TRACK_OF_TOPIC = k => { const u = UNITS.find(x => x.topic === k) || UNITS.find(x => !(TRACK_INFO[x.track] || {}).sd && (x.study || []).includes(k)); return u ? TRACK_INFO[u.track].title : ''; };
const SEARCH_INDEX = [
  ...TOPICS.map(k => ({ kind: 'Topics', title: ALGOS[k].name, sub: `${catInfo(ALGOS[k].cat).name} · ${TRACK_OF_TOPIC(k)}`, text: `${k} ${ALGOS[k].name} ${catInfo(ALGOS[k].cat).name} ${ALGOS[k].blurb}`, go: () => openTopic(k) })),
  ...Object.keys(SD).map(k => ({ kind: 'Topics', title: SD[k].name, sub: `${SD[k].domain || 'System design'} · ${sdCatName(SD[k].cat)}`, text: `${k} ${SD[k].name} ${sdCatName(SD[k].cat)} ${SD[k].domain || 'system design'} ${SD[k].blurb}`, go: () => openSdTopic(k) })),
  ...UNITS.filter(u => !u.topic).map(u => ({ kind: 'Units', title: u.title, sub: `${TRACK_INFO[u.track].title}${u.level ? ' · Unit ' + u.code : ''}`, text: `${u.title} ${u.lede} ${(u.goals || []).join(' ')} ${TRACK_INFO[u.track].title}`, go: () => openUnit(u.id) })),
  ...PCATS.map((c, i) => ({ kind: 'Problem patterns', title: c[1], sub: `${PROBS.filter(p => p.c === c[0]).length} problems`, text: `${c[1]} pattern`, go: () => { cur.track = 'problems'; cur.problems = i + 1; cur.prob = null; go(); } })),
  ...PROBS.map(p => ({ kind: 'Problems', title: `${p.n}. ${p.t}`, sub: `${catName(p.c)} · ${p.d}`, text: `${p.n} ${p.t} ${catName(p.c)} ${p.d}`, num: p.n, go: () => openProblem(p.n) }))
];
SEARCH_INDEX.forEach(e => { e.tl = e.title.toLowerCase(); e.xl = e.text.toLowerCase(); });
const SEARCH_ORDER = ['Topics', 'Units', 'Problem patterns', 'Problems'];

function searchFor(q) {
  q = q.trim().toLowerCase(); if (!q) return [];
  const toks = q.split(/\s+/);
  const scored = [];
  for (const e of SEARCH_INDEX) {
    if (/^\d+$/.test(q) && e.num !== undefined) { if (String(e.num) === q) scored.push([0, e]); continue; }
    if (!toks.every(t => e.xl.includes(t))) continue;
    const s = e.tl.startsWith(q) ? 0 : e.tl.includes(q) ? 1 : toks.every(t => e.tl.includes(t)) ? 2 : 3;
    scored.push([s, e]);
  }
  scored.sort((a, b) => a[0] - b[0]);
  const out = [], best = k => { const f = scored.find(x => x[1].kind === k); return f ? f[0] : 9; };
  const kinds = [...SEARCH_ORDER].sort((a, b) => best(a) - best(b) || SEARCH_ORDER.indexOf(a) - SEARCH_ORDER.indexOf(b));
  for (const kind of kinds) out.push(...scored.filter(x => x[1].kind === kind).slice(0, kind === 'Problems' ? 6 : 5).map(x => x[1]));
  return out;
}

(function initSearch() {
  const inp = $('#q'), box = $('#qres');
  let results = [], active = 0;
  const close = () => { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); };
  const paint = () => {
    $$('.qitem', box).forEach((b, i) => { b.setAttribute('aria-selected', i === active); if (i === active) b.scrollIntoView({ block: 'nearest' }); });
  };
  const render = () => {
    results = searchFor(inp.value); active = 0;
    if (!inp.value.trim()) { close(); return; }
    let html = '', i = 0, last = '';
    if (!results.length) html = `<p class="qempty">Nothing matches “${esc(inp.value.trim())}”. Try a topic (heap, AES), a pattern (sliding window) or a problem number.</p>`;
    for (const r of results) {
      if (r.kind !== last) { html += `<div class="qhead">${r.kind}</div>`; last = r.kind; }
      html += `<button class="qitem" role="option" data-i="${i++}"><span class="qt">${esc(r.title)}</span><span class="qs">${esc(r.sub)}</span></button>`;
    }
    box.innerHTML = html; box.hidden = false; inp.setAttribute('aria-expanded', 'true');
    $$('.qitem', box).forEach(b => {
      b.onmousedown = e => e.preventDefault();
      b.onclick = () => choose(+b.dataset.i);
    });
    paint();
  };
  const choose = i => { const r = results[i]; if (!r) return; inp.value = ''; close(); inp.blur(); r.go(); };
  inp.addEventListener('input', render);
  inp.addEventListener('focus', () => { if (inp.value.trim()) render(); });
  inp.addEventListener('blur', () => setTimeout(close, 120));
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (results.length) { active = (active + 1) % results.length; paint(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (results.length) { active = (active - 1 + results.length) % results.length; paint(); } }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape') { inp.value = ''; close(); inp.blur(); }
  });
  document.addEventListener('keydown', e => {
    const tg = e.target, typing = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.isContentEditable);
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); inp.focus(); inp.select(); }
  });
})();

renderTrack(); renderLesson(); syncHash(true);
