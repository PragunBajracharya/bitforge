/* ===== Printable cheat sheets (loaded after algorithms and problems so two sheets can be generated) ===== */
const CC = s => `<code>${s}</code>`;

/* ---- generated: Big-O ---- */
SHEET('cs-bigo', { name: 'Big-O cheat sheet', blurb: `Time and space complexity for every algorithm in the library, generated from the topic pages so it always matches them, plus the data-structure operations interviewers ask about.`,
  sheets: [['Data structure operations', [['Array', 'index O(1) · search O(n) · append O(1)* · insert/delete middle O(n)'], ['Linked list', 'access O(n) · insert/delete at known node O(1)'], ['Hash map / set', 'get, put, delete O(1) average · O(n) worst'], ['Balanced BST / TreeMap', 'get, put, delete, min, floor O(log n)'], ['Binary heap', 'push, pop O(log n) · peek O(1) · heapify O(n)'], ['Stack / queue / deque', 'push, pop at ends O(1)'], ['Trie', 'insert, search O(word length)'], ['Union–find', 'find, union O(α(n)) ≈ O(1)'], ['Segment / Fenwick tree', 'range query, point update O(log n)']]],
    ['Growth rates (n = 10⁶)', [['O(1)', '1'], ['O(log n)', '≈ 20'], ['O(n)', '10⁶'], ['O(n log n)', '≈ 2 × 10⁷'], ['O(n²)', '10¹² (too slow)'], ['O(2ⁿ)', 'only for n ≤ ~25']]],
    ...CATS.map(([id, nm]) => [nm, Object.keys(ALGOS).filter(k => ALGOS[k].cat === id).map(k => [ALGOS[k].name, ALGOS[k].cx.slice(0, 3).map(r => `${r[0]}: <b>${r[1]}</b>`).join(' · ')])]).filter(g => g[1].length)],
  sections: [] });
DP('cs-bigo', { src: ['Big-O Cheat Sheet (bigocheatsheet.com)', 'https://www.bigocheatsheet.com/'] });

/* ---- generated: patterns → problems ---- */
const PATTERN_SIGNALS = {
  hashing: ['“Have I seen this before?”, counting, grouping, pairs summing to a target', 'Hash map of value → index or count; O(n)'],
  twoptr: ['Sorted array, pairs or triplets, palindromes, in-place partitioning', 'l = 0, r = n − 1; move the side that can improve'],
  window: ['Longest/shortest contiguous subarray or substring satisfying a condition', 'Expand right; while invalid, shrink left; track best'],
  stack: ['Matching brackets, “next greater/smaller”, nested structures, expression evaluation', 'Monotonic stack of indices'],
  bsearch: ['Sorted input, or “minimum X such that feasible(X)” with a monotonic check', 'lo/hi invariant; binary search on the answer'],
  linked: ['Reverse, merge, find middle or cycle, reorder in place', 'Dummy head; fast/slow pointers'],
  trees: ['Depth, paths, subtree properties, BST order, level order', 'Recursive DFS returning a value; BFS with a queue'],
  heap: ['Top k, k-th largest, merge k sorted, running median, scheduling', 'Size-k heap; two heaps for medians'],
  backtrack: ['All subsets, permutations, combinations, boards (N-Queens, word search)', 'Choose → explore → undo; prune early'],
  tries: ['Prefix queries, word dictionaries, many words searched in a grid', 'Node map of children + end flag'],
  graphs: ['Grids, islands, dependencies, connectivity, shortest steps', 'BFS/DFS with visited; topological sort; union–find'],
  advgraphs: ['Weighted shortest paths, MST, itineraries, K-stop constraints', 'Dijkstra, Bellman–Ford, Prim/Kruskal'],
  dp1: ['Count ways, min/max over choices along a sequence, “can you reach”', 'dp[i] from dp[i − 1], dp[i − 2]…; roll variables'],
  dp2: ['Two strings or a grid; subsequences; knapsack with capacity', 'dp[i][j] table; reduce to one row'],
  greedy: ['Locally best choice provably optimal: jumps, gas stations, partitions', 'Sort or scan once; argue with an exchange proof'],
  intervals: ['Overlaps, merging, meeting rooms, inserting ranges', 'Sort by start (or end); sweep'],
  math: ['Matrices, digits, powers, geometry', 'Simulate carefully; fast power; modular arithmetic'],
  bits: ['XOR tricks, counting bits, subsets as masks, single number', 'x & (x − 1), x ^ x = 0, masks']
};
SHEET('cs-patterns', { name: 'Patterns → problems', blurb: `How to recognize each NeetCode pattern from the problem statement, the template to reach for, and every problem in the course that uses it. Click a problem to open it.`,
  sheets: PCATS.map(([id, nm]) => [nm, [['Signals', (PATTERN_SIGNALS[id] || ['', ''])[0]], ['Template', (PATTERN_SIGNALS[id] || ['', ''])[1]], ['Problems', PROBS.filter(p => p.c === id).map(p => PL(p.n, `${p.n} ${p.t.replace(/&/g, "&amp;").replace(/</g, "&lt;")}`)).join('<br>')]]]),
  sections: [] });
DP('cs-patterns', { src: ['NeetCode roadmap', 'https://neetcode.io/roadmap'] });

/* ---- SQL ---- */
SHEET('cs-sql', { name: 'SQL cheat sheet', blurb: `The SQL analysts and engineers use daily, from SELECT to window functions, in PostgreSQL syntax with notes where MySQL or SQL Server differ.`,
  sheets: [['Querying', [[CC('SELECT a, b FROM t WHERE x &gt; 5'), 'Filter rows'], [CC('ORDER BY a DESC NULLS LAST'), 'Sort'], [CC('LIMIT 10 OFFSET 20'), 'Page (SQL Server: OFFSET … FETCH)'], [CC('DISTINCT'), 'Remove duplicate rows'], [CC('WHERE x IN (1, 2) / BETWEEN / LIKE \'a%\''), 'Common filters'], [CC('WHERE x IS NULL'), 'Never = NULL'], [CC('COALESCE(x, 0)'), 'First non-null']]],
    ['Aggregation', [[CC('COUNT(*) / COUNT(x) / COUNT(DISTINCT x)'), 'Rows / non-null / unique'], [CC('SUM, AVG, MIN, MAX'), 'Ignore NULLs'], [CC('GROUP BY a HAVING COUNT(*) &gt; 1'), 'Filter groups'], [CC('SUM(CASE WHEN c THEN 1 ELSE 0 END)'), 'Conditional count'], [CC('COUNT(*) FILTER (WHERE c)'), 'Postgres shorthand']]],
    ['Joins', [[CC('INNER JOIN b ON a.id = b.a_id'), 'Matching rows only'], [CC('LEFT JOIN … WHERE b.id IS NULL'), 'Rows with no match (anti-join)'], [CC('FULL OUTER JOIN'), 'All rows from both'], [CC('CROSS JOIN'), 'Every combination'], [CC('WHERE EXISTS (SELECT 1 …)'), 'Semi-join; NULL-safe vs NOT IN']]],
    ['CTEs & subqueries', [[CC('WITH x AS (…) SELECT … FROM x'), 'Name a step'], [CC('WITH RECURSIVE'), 'Trees, sequences'], [CC('UNION ALL / UNION'), 'Stack results (UNION dedupes)'], [CC('INTERSECT / EXCEPT'), 'Set operations']]],
    ['Window functions', [[CC('ROW_NUMBER() OVER (PARTITION BY g ORDER BY t)'), 'Number rows per group'], [CC('RANK() / DENSE_RANK()'), 'Ties: gaps / no gaps'], [CC('LAG(x) / LEAD(x) OVER (ORDER BY t)'), 'Previous / next row'], [CC('SUM(x) OVER (ORDER BY t ROWS UNBOUNDED PRECEDING)'), 'Running total'], [CC('AVG(x) OVER (… ROWS 6 PRECEDING)'), '7-row moving average'], [CC('NTILE(4)'), 'Quartiles']]],
    ['Dates', [[CC("DATE_TRUNC('month', ts)"), 'Start of month (MySQL: DATE_FORMAT)'], [CC("ts + INTERVAL '7 days'"), 'Date arithmetic'], [CC('EXTRACT(DOW FROM ts)'), 'Day of week'], [CC('generate_series(d1, d2, \'1 day\')'), 'Date spine']]],
    ['Changing data', [[CC('INSERT INTO t (a, b) VALUES (1, 2)'), 'Insert'], [CC('UPDATE t SET a = 1 WHERE id = 5'), 'Always with WHERE'], [CC('DELETE FROM t WHERE …'), 'Delete'], [CC('INSERT … ON CONFLICT (id) DO UPDATE'), 'Upsert (MySQL: ON DUPLICATE KEY)'], [CC('BEGIN; … COMMIT;'), 'Transaction']]],
    ['Schema & performance', [[CC('CREATE INDEX ON t (a, b)'), 'Composite: leftmost prefix rule'], [CC('EXPLAIN ANALYZE SELECT …'), 'Read the plan'], [CC('PRIMARY KEY / UNIQUE / FOREIGN KEY / CHECK'), 'Constraints']]]],
  sections: [] });
DP('cs-sql', { src: ['PostgreSQL documentation: SQL commands', 'https://www.postgresql.org/docs/current/sql-commands.html'] });

/* ---- Excel & DAX ---- */
SHEET('cs-excel-dax', { name: 'Excel & DAX cheat sheet', blurb: `The formulas, shortcuts and DAX measures used in most analyst work.`,
  sheets: [['Lookups', [[CC('=XLOOKUP(key, keys, results, "Not found")'), 'Exact match, any direction'], [CC('=INDEX(col, MATCH(key, keys, 0))'), 'Classic two-way lookup'], [CC('=XLOOKUP(1, (A=x)*(B=y), R)'), 'Two criteria'], [CC('=FILTER(range, cond)'), 'All matches (spills)']]],
    ['Conditional math', [[CC('=SUMIFS(sum, crit_range, crit, …)'), 'Sum with AND conditions'], [CC('=COUNTIFS(range, ">="&amp;start)'), 'Count with criteria'], [CC('=AVERAGEIFS(…)'), 'Average with criteria'], [CC('=SUMPRODUCT((A="West")*(B&gt;100)*C)'), 'Any logic, arrays']]],
    ['Text & dates', [[CC('=TEXT(d, "yyyy-mm")'), 'Format'], [CC('=TRIM(CLEAN(x))'), 'Remove spaces and junk'], [CC('=TEXTSPLIT(x, ",")'), 'Split to columns'], [CC('=EOMONTH(d, 0)'), 'Month end'], [CC('=NETWORKDAYS(a, b)'), 'Workdays between']]],
    ['Dynamic arrays & logic', [[CC('=UNIQUE(range)'), 'Distinct values'], [CC('=SORT(range, 2, -1)'), 'Sort by column 2 desc'], [CC('=LET(x, …, y, …, x+y)'), 'Name intermediate steps'], [CC('=IFERROR(x, 0)'), 'Default on error'], [CC('=IFS(c1, v1, c2, v2, TRUE, v3)'), 'Multiple conditions']]],
    ['Shortcuts (Windows)', [['Ctrl + T', 'Make a table'], ['F4', 'Toggle $ references'], ['Ctrl + Shift + L', 'Filters'], ['Alt + N, V', 'PivotTable'], ['Ctrl + ;', 'Today’s date'], ['Ctrl + Arrow', 'Jump to edge']]],
    ['DAX measures', [[CC('Sales = SUM(Fact[Amount])'), 'Base measure'], [CC('CALCULATE([Sales], Dim[Region] = "West")'), 'Change filter context'], [CC('CALCULATE([Sales], ALL(Dim[Region]))'), 'Ignore a filter'], [CC('DIVIDE([Sales], [Target])'), 'Safe division'], [CC('TOTALYTD([Sales], Date[Date])'), 'Year to date'], [CC('CALCULATE([Sales], SAMEPERIODLASTYEAR(Date[Date]))'), 'Prior year'], [CC('SUMX(Fact, Fact[Qty] * Fact[Price])'), 'Row-by-row then sum'], [CC('RANKX(ALL(Dim[Product]), [Sales])'), 'Rank']]]],
  sections: [] });
DP('cs-excel-dax', { src: ['Microsoft Support: Excel functions (by category)', 'https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb'] });

/* ---- Git ---- */
SHEET('cs-git', { name: 'Git cheat sheet', blurb: `Everyday Git commands and how to get out of trouble.`,
  sheets: [['Start & inspect', [[CC('git clone url'), 'Copy a repository'], [CC('git status'), 'What changed'], [CC('git diff / git diff --staged'), 'Unstaged / staged changes'], [CC('git log --oneline --graph --all'), 'History graph'], [CC('git blame file'), 'Who changed each line'], [CC('git show sha'), 'One commit']]],
    ['Commit', [[CC('git add -p'), 'Stage hunks interactively'], [CC('git commit -m "msg"'), 'Commit'], [CC('git commit --amend'), 'Fix the last commit (unpushed)'], [CC('git stash / git stash pop'), 'Shelve work in progress']]],
    ['Branches', [[CC('git switch -c feature'), 'Create and switch'], [CC('git merge main'), 'Merge main into current'], [CC('git rebase main'), 'Replay your commits on main'], [CC('git rebase -i HEAD~3'), 'Squash, reorder, edit'], [CC('git cherry-pick sha'), 'Copy one commit']]],
    ['Remote', [[CC('git fetch'), 'Download without changing your branch'], [CC('git pull --rebase'), 'Fetch + rebase'], [CC('git push -u origin feature'), 'Publish a branch'], [CC('git push --force-with-lease'), 'Safe force push (your branch only)']]],
    ['Undo', [[CC('git restore file'), 'Discard working changes'], [CC('git restore --staged file'), 'Unstage'], [CC('git revert sha'), 'Undo a pushed commit safely'], [CC('git reset --soft HEAD~1'), 'Uncommit, keep changes staged'], [CC('git reset --hard sha'), 'Discard everything after sha (local only)'], [CC('git reflog'), 'Find “lost” commits']]],
    ['Debug', [[CC('git bisect start / bad / good v1.0'), 'Binary search for the breaking commit'], [CC('git bisect run npm test'), 'Automate it'], [CC('git log -S "text"'), 'Commits that added/removed text']]]],
  sections: [] });
DP('cs-git', { src: ['Pro Git book (Chacon & Straub)', 'https://git-scm.com/book/en/v2'] });

/* ---- Linux ---- */
SHEET('cs-linux', { name: 'Linux command line cheat sheet', blurb: `The shell commands you need on servers, in containers and during incidents.`,
  sheets: [['Files', [[CC('ls -lah'), 'List with sizes and hidden files'], [CC('find . -name "*.log" -mtime -1'), 'Find recent log files'], [CC('du -sh * | sort -h'), 'What uses disk space'], [CC('df -h'), 'Free space per filesystem'], [CC('tar -czf out.tgz dir/'), 'Archive and compress'], [CC('chmod 640 f; chown app:app f'), 'Permissions and owner']]],
    ['Text', [[CC('grep -rn "error" .'), 'Search recursively with line numbers'], [CC('tail -f app.log'), 'Follow a log'], [CC('less +F file'), 'Page, then follow'], [CC('awk \'{print $1}\' f | sort | uniq -c | sort -rn'), 'Top values in a column'], [CC('sed -i \'s/old/new/g\' f'), 'Replace in place'], [CC('jq \'.items[].name\' f.json'), 'Query JSON'], [CC('wc -l f'), 'Count lines']]],
    ['Processes', [[CC('ps aux | grep name'), 'Find a process'], [CC('top / htop'), 'Live CPU and memory'], [CC('kill -TERM pid; kill -9 pid'), 'Stop gracefully; force'], [CC('lsof -i :8080'), 'Who uses a port'], [CC('nohup cmd &amp;'), 'Keep running after logout'], [CC('systemctl status app; journalctl -u app -f'), 'Services and their logs']]],
    ['Network', [[CC('curl -sv https://host/health'), 'HTTP request with details'], [CC('ss -ltnp'), 'Listening TCP ports'], [CC('dig +short host'), 'DNS lookup'], [CC('nc -vz host 5432'), 'Is a port reachable?'], [CC('ip addr; ip route'), 'Interfaces and routes'], [CC('scp f user@host:/tmp; rsync -avz'), 'Copy files']]],
    ['Pipes & redirection', [[CC('cmd &gt; out.txt 2&gt;&amp;1'), 'Stdout and stderr to file'], [CC('cmd1 | cmd2'), 'Pipe'], [CC('cmd1 &amp;&amp; cmd2'), 'Run cmd2 if cmd1 succeeds'], [CC('xargs -P 4'), 'Run in parallel'], [CC('$?'), 'Last exit code']]],
    ['System', [[CC('free -h'), 'Memory'], [CC('uptime'), 'Load averages'], [CC('vmstat 1; iostat -x 1'), 'CPU, memory, disk activity'], [CC('dmesg -T | tail'), 'Kernel messages (OOM kills)'], [CC('ulimit -n'), 'Open file limit']]]],
  sections: [] });
DP('cs-linux', { src: ['The Linux Command Line (William Shotts), free online', 'https://linuxcommand.org/tlcl.php'] });

/* ---- Regex ---- */
SHEET('cs-regex', { name: 'Regular expressions cheat sheet', blurb: `Regex syntax shared by JavaScript, Python, Java and most tools, with patterns you will actually use.`,
  sheets: [['Characters', [[CC('.'), 'Any character except newline'], [CC('\\d \\w \\s'), 'Digit, word char [A-Za-z0-9_], whitespace'], [CC('\\D \\W \\S'), 'Negations'], [CC('[abc] [^abc] [a-z]'), 'Set, negated set, range'], [CC('\\.'), 'Literal dot (escape . * + ? ( ) [ ] { } ^ $ | \\)']]],
    ['Quantifiers', [[CC('* + ?'), '0+, 1+, 0 or 1'], [CC('{3} {2,5} {2,}'), 'Exact, range, at least'], [CC('*? +?'), 'Lazy (as few as possible)']]],
    ['Anchors & groups', [[CC('^ $'), 'Start, end of string (or line with m flag)'], [CC('\\b'), 'Word boundary'], [CC('(abc)'), 'Capturing group'], [CC('(?:abc)'), 'Non-capturing'], [CC('(?&lt;year&gt;\\d{4})'), 'Named group (Python: (?P&lt;year&gt;…))'], [CC('a|b'), 'Alternation'], [CC('\\1'), 'Backreference']]],
    ['Lookaround', [[CC('x(?=y)'), 'x followed by y'], [CC('x(?!y)'), 'x not followed by y'], [CC('(?&lt;=y)x'), 'x preceded by y'], [CC('(?&lt;!y)x'), 'x not preceded by y']]],
    ['Flags', [[CC('i'), 'Case-insensitive'], [CC('g'), 'All matches (JS)'], [CC('m'), '^ and $ match at line breaks'], [CC('s'), '. matches newline'], [CC('u'), 'Unicode (JS)']]],
    ['Useful patterns', [[CC('^\\d{5}(-\\d{4})?$'), 'US ZIP code'], [CC('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'), 'Rough email check (validate by sending mail)'], [CC('\\b\\d{1,3}(\\.\\d{1,3}){3}\\b'), 'IPv4-looking text'], [CC('^\\s+|\\s+$'), 'Leading/trailing whitespace'], [CC('(\\d{4})-(\\d{2})-(\\d{2})'), 'ISO date parts']]],
    ['In code', [[CC('re.findall(r"\\d+", s)'), 'Python: all matches (use raw strings)'], [CC('re.sub(r"\\s+", " ", s)'), 'Python: replace'], [CC('s.match(/(\\d+)/)?.[1]'), 'JS: first group'], [CC('s.replaceAll(/\\s+/g, " ")'), 'JS: replace all'], [CC('Pattern.compile("\\\\d+")'), 'Java: double escapes in strings']]]],
  sections: [] });
DP('cs-regex', { src: ['MDN: Regular expressions guide', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions'] });

/* ---- HTTP ---- */
SHEET('cs-http', { name: 'HTTP cheat sheet', blurb: `Methods, status codes, headers and caching rules for designing and debugging web APIs.`,
  sheets: [['Methods', [['GET', 'Read; safe, idempotent, cacheable'], ['POST', 'Create or action; not idempotent (use Idempotency-Key)'], ['PUT', 'Replace; idempotent'], ['PATCH', 'Partial update'], ['DELETE', 'Remove; idempotent'], ['HEAD / OPTIONS', 'Headers only / CORS preflight']]],
    ['Status codes', [['200 / 201 / 204', 'OK / Created (+ Location) / No Content'], ['301 / 302 / 304 / 307 / 308', 'Moved / Found / Not Modified / temp & perm redirect keeping method'], ['400 / 422', 'Malformed / validation failed'], ['401 / 403', 'Not authenticated / not allowed'], ['404 / 405 / 409', 'Not found / wrong method / conflict'], ['412 / 429', 'Precondition failed (ETag) / rate limited'], ['500 / 502 / 503 / 504', 'Server error / bad gateway / unavailable / gateway timeout']]],
    ['Request headers', [['Authorization: Bearer …', 'Credentials'], ['Content-Type / Accept', 'Body format sent / wanted'], ['If-None-Match / If-Match', 'Conditional GET / safe update with ETags'], ['Idempotency-Key', 'Safe retries of POST'], ['Origin', 'Sent on cross-origin requests (CORS)']]],
    ['Response headers', [['Cache-Control: max-age=60, s-maxage=600', 'Browser / CDN lifetimes'], ['Cache-Control: no-store / private', 'Never cache / browser only'], ['ETag / Last-Modified', 'Validators for revalidation'], ['Vary: Accept-Encoding', 'Cache key includes these headers'], ['Retry-After', 'With 429 and 503'], ['Strict-Transport-Security', 'HTTPS only (HSTS)'], ['Content-Security-Policy', 'Allowed script and resource sources'], ['Set-Cookie: …; HttpOnly; Secure; SameSite=Lax', 'Safe session cookie']]],
    ['CORS', [['Access-Control-Allow-Origin', 'Which origins may read responses'], ['Access-Control-Allow-Credentials', 'Needed for cookies; origin can’t be *'], ['Preflight', 'OPTIONS for non-simple requests (custom headers, PUT, JSON)']]],
    ['Versions', [['HTTP/1.1', 'One request at a time per connection; keep-alive'], ['HTTP/2', 'Multiplexed streams over one TCP connection, header compression'], ['HTTP/3', 'QUIC over UDP; no TCP head-of-line blocking']]]],
  sections: [] });
DP('cs-http', { src: ['MDN: HTTP reference', 'https://developer.mozilla.org/en-US/docs/Web/HTTP'] });

/* ---- Docker & Kubernetes ---- */
SHEET('cs-docker', { name: 'Docker & Kubernetes cheat sheet', blurb: `Build, run and debug containers, and the kubectl commands for deployments.`,
  sheets: [['Docker images', [[CC('docker build -t app:1.2 .'), 'Build from Dockerfile'], [CC('docker images; docker rmi img'), 'List / remove'], [CC('docker tag app:1.2 reg/app:1.2; docker push'), 'Publish'], [CC('docker history app:1.2'), 'Layer sizes']]],
    ['Docker containers', [[CC('docker run -d -p 8080:80 --name web app'), 'Run detached, map a port'], [CC('docker run --rm -it app sh'), 'Throwaway shell'], [CC('docker ps -a; docker logs -f web'), 'List / follow logs'], [CC('docker exec -it web sh'), 'Shell into running container'], [CC('docker stop web; docker rm web'), 'Stop / remove'], [CC('docker compose up -d; down'), 'Multi-container apps']]],
    ['Dockerfile best practices', [['Multi-stage builds', 'Build in one stage, copy artifacts to a slim runtime image'], ['Order layers', 'Copy dependency manifests and install before copying source'], ['USER app', 'Don’t run as root'], ['Pin versions', 'node:20.11-alpine, not latest'], ['.dockerignore', 'Exclude node_modules, .git, secrets'], ['HEALTHCHECK / one process', 'One concern per container']]],
    ['kubectl', [[CC('kubectl get pods -n ns -o wide'), 'List pods'], [CC('kubectl describe pod p'), 'Events: why it’s not running'], [CC('kubectl logs -f p -c container --previous'), 'Logs (incl. crashed run)'], [CC('kubectl exec -it p -- sh'), 'Shell'], [CC('kubectl apply -f k8s/'), 'Apply manifests'], [CC('kubectl rollout status/undo deploy/app'), 'Watch / roll back'], [CC('kubectl scale deploy/app --replicas=5'), 'Scale'], [CC('kubectl port-forward svc/app 8080:80'), 'Local access'], [CC('kubectl top pods'), 'CPU / memory use']]],
    ['Kubernetes objects', [['Pod', 'One or more containers scheduled together'], ['Deployment', 'Desired replicas + rolling updates'], ['Service', 'Stable virtual IP / DNS for pods'], ['Ingress / Gateway', 'HTTP routing into the cluster'], ['ConfigMap / Secret', 'Configuration / sensitive values'], ['HPA', 'Autoscale on metrics'], ['Probes', 'liveness (restart), readiness (receive traffic)']]],
    ['Common failures', [['CrashLoopBackOff', 'App exits; check logs --previous'], ['ImagePullBackOff', 'Wrong image name/tag or registry auth'], ['OOMKilled (137)', 'Raise memory limit or fix leak'], ['Pending', 'No node fits requests; check events']]]],
  sections: [] });
DP('cs-docker', { src: ['Kubernetes documentation: kubectl quick reference', 'https://kubernetes.io/docs/reference/kubectl/quick-reference/'] });

/* ---- Crypto chooser ---- */
SHEET('cs-crypto-chooser', { name: 'Which crypto should I use?', blurb: `A decision table for the most common needs, using algorithms from the Cryptography course. When in doubt, use a high-level library (libsodium, Tink, Web Crypto) that makes these choices for you.`,
  sheets: [['Need → use', [['Store passwords', 'Argon2id (or scrypt, bcrypt); never a plain hash'], ['Encrypt data at rest', 'AES-256-GCM with envelope encryption (KMS data keys)'], ['Encrypt with random nonces at scale', 'XChaCha20-Poly1305'], ['Encrypt a message to someone’s public key', 'Hybrid: X25519 + HKDF + AEAD (libsodium sealed box, HPKE)'], ['Sign data / releases', 'Ed25519 (or ECDSA P-256 for compliance)'], ['Authenticate API requests / webhooks', 'HMAC-SHA256 with constant-time compare'], ['Derive keys from a shared secret', 'HKDF-SHA256'], ['Derive a key from a password', 'Argon2id / scrypt with a random salt'], ['File integrity (non-adversarial)', 'SHA-256 or BLAKE3'], ['Random tokens and IDs', 'CSPRNG, ≥ 128 bits (secrets, crypto.getRandomValues)'], ['Transport security', 'TLS 1.3; mTLS between services'], ['Split a master key', 'Shamir secret sharing']]],
    ['Avoid', [['MD5, SHA-1', 'Broken collision resistance'], ['ECB mode', 'Leaks patterns'], ['CBC without a MAC', 'Padding oracles, malleability'], ['RSA PKCS#1 v1.5 encryption', 'Bleichenbacher attacks; use OAEP or hybrid'], ['Math.random / random.random', 'Predictable'], ['Reusing nonces', 'Breaks GCM and ChaCha20'], ['Home-made protocols', 'Use TLS, Noise, Signal, HPKE']]],
    ['Key sizes today', [['Symmetric', '128-bit minimum; 256-bit for long-term data'], ['RSA', '≥ 2048 (3072 for long-term)'], ['Elliptic curve', '256-bit (P-256, Curve25519)'], ['Hash', 'SHA-256 or larger'], ['Post-quantum', 'ML-KEM-768 hybrid with X25519 for key exchange']]]],
  sections: [] });
DP('cs-crypto-chooser', { src: ['OWASP Cryptographic Storage Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html'] });

/* ---- System design numbers ---- */
SHEET('cs-sd-numbers', { name: 'System design numbers', blurb: `The numbers to have in your head for estimation and design interviews. Orders of magnitude matter, not exact values.`,
  sheets: [['Latency', [['L1 cache reference', '~1 ns'], ['Main memory reference', '~100 ns'], ['Compress 1 KB (fast codec)', '~2 µs'], ['SSD random read', '~100 µs'], ['Round trip in one datacenter', '~0.5 ms'], ['Read 1 MB sequentially from SSD', '~0.5–1 ms'], ['HDD seek', '~5–10 ms'], ['Round trip US ↔ Europe', '~70–100 ms']]],
    ['Throughput (one machine, rough)', [['Redis / Memcached', '100K+ ops/s per node'], ['Postgres / MySQL', '1K–20K writes/s; more reads with cache'], ['Kafka broker', '~100 MB/s+ per broker'], ['Web server (simple handler)', '1K–10K req/s per core'], ['1 Gbps network', '~125 MB/s'], ['NVMe SSD', '1–7 GB/s sequential']]],
    ['Time & scale', [['Seconds per day', '86,400 ≈ 10⁵'], ['1M requests/day', '≈ 12 req/s average'], ['100M requests/day', '≈ 1,200 req/s average, ×2–5 at peak'], ['Seconds per year', '≈ 3 × 10⁷']]],
    ['Storage', [['ASCII char', '1 byte'], ['UUID', '16 bytes (36 as text)'], ['Tweet-sized row', '~300 bytes–1 KB'], ['Photo', '~200 KB–2 MB'], ['1 minute HD video', '~50–100 MB'], ['1 TB', '10¹² bytes']]],
    ['Availability', [['99%', '3.65 days/year down'], ['99.9%', '8.8 hours/year'], ['99.99%', '52.6 minutes/year'], ['99.999%', '5.3 minutes/year']]],
    ['Powers of two', [['2¹⁰', '≈ 1 thousand (KB)'], ['2²⁰', '≈ 1 million (MB)'], ['2³⁰', '≈ 1 billion (GB)'], ['2⁴⁰', '≈ 1 trillion (TB)'], ['2³²', '≈ 4.3 billion (32-bit IDs run out)']]]],
  sections: [] });
DP('cs-sd-numbers', { src: ['Dean & Barroso, The Tail at Scale; Google SRE book', 'https://sre.google/sre-book/table-of-contents/'] });

/* ---- Language syntax ---- */
SHEET('cs-lang-syntax', { name: 'Python · JavaScript · Java · C++ syntax', blurb: `The same everyday operations in the four languages used across this site, for switching languages in interviews.`,
  sections: [['Basics', TBL(['Task', 'Python', 'JavaScript', 'Java', 'C++'], [
      ['Variable', CC('x = 5'), CC('let x = 5'), CC('int x = 5; var y = 5;'), CC('int x = 5; auto y = 5;')],
      ['Print', CC('print(x)'), CC('console.log(x)'), CC('System.out.println(x)'), CC('std::cout &lt;&lt; x &lt;&lt; "\\n"')],
      ['If / else', CC('if a: … elif b: … else: …'), CC('if (a) {…} else if (b) {…}'), CC('if (a) {…} else {…}'), CC('if (a) {…} else {…}')],
      ['For range', CC('for i in range(n):'), CC('for (let i = 0; i &lt; n; i++)'), CC('for (int i = 0; i &lt; n; i++)'), CC('for (int i = 0; i &lt; n; i++)')],
      ['For each', CC('for x in xs:'), CC('for (const x of xs)'), CC('for (int x : xs)'), CC('for (auto&amp; x : xs)')],
      ['Function', CC('def f(a, b): return a + b'), CC('const f = (a, b) =&gt; a + b'), CC('static int f(int a, int b) { return a + b; }'), CC('int f(int a, int b) { return a + b; }')],
      ['Integer division', CC('7 // 2'), CC('Math.floor(7 / 2)'), CC('7 / 2'), CC('7 / 2')],
      ['Max int', CC('float("inf")'), CC('Infinity / Number.MAX_SAFE_INTEGER'), CC('Integer.MAX_VALUE'), CC('INT_MAX / LLONG_MAX')]])],
    ['Collections', TBL(['Task', 'Python', 'JavaScript', 'Java', 'C++'], [
      ['Dynamic array', CC('xs = []; xs.append(1)'), CC('xs = []; xs.push(1)'), CC('List&lt;Integer&gt; xs = new ArrayList&lt;&gt;(); xs.add(1)'), CC('std::vector&lt;int&gt; xs; xs.push_back(1)')],
      ['Hash map', CC('d = {}; d[k] = v; d.get(k, 0)'), CC('m = new Map(); m.set(k, v); m.get(k) ?? 0'), CC('Map&lt;K,V&gt; m = new HashMap&lt;&gt;(); m.getOrDefault(k, 0)'), CC('std::unordered_map&lt;K,V&gt; m; m[k]')],
      ['Hash set', CC('s = set(); s.add(x); x in s'), CC('s = new Set(); s.add(x); s.has(x)'), CC('Set&lt;Integer&gt; s = new HashSet&lt;&gt;(); s.contains(x)'), CC('std::unordered_set&lt;int&gt; s; s.count(x)')],
      ['Deque / queue', CC('from collections import deque; q.append(x); q.popleft()'), CC('array push/shift (O(n) shift) or a ring buffer'), CC('ArrayDeque&lt;Integer&gt; q; q.offer(x); q.poll()'), CC('std::deque&lt;int&gt; q; q.push_back(x); q.pop_front()')],
      ['Min-heap', CC('heapq.heappush(h, x); heapq.heappop(h)'), CC('no built-in: write a small heap'), CC('PriorityQueue&lt;Integer&gt; pq = new PriorityQueue&lt;&gt;()'), CC('std::priority_queue&lt;int, vector&lt;int&gt;, greater&lt;int&gt;&gt;')],
      ['Sort', CC('xs.sort(key=lambda p: p[1])'), CC('xs.sort((a, b) =&gt; a - b)'), CC('xs.sort(Comparator.comparingInt(p -&gt; p[1]))'), CC('std::sort(xs.begin(), xs.end())')],
      ['Length', CC('len(xs)'), CC('xs.length / m.size'), CC('xs.size() / arr.length'), CC('xs.size()')]])],
    ['Strings', TBL(['Task', 'Python', 'JavaScript', 'Java', 'C++'], [
      ['Char at', CC('s[i]'), CC('s[i]'), CC('s.charAt(i)'), CC('s[i]')],
      ['Substring', CC('s[a:b]'), CC('s.slice(a, b)'), CC('s.substring(a, b)'), CC('s.substr(a, b - a)')],
      ['Split / join', CC('s.split(","); ",".join(xs)'), CC('s.split(","); xs.join(",")'), CC('s.split(","); String.join(",", xs)'), CC('std::getline with stringstream')],
      ['Build string', CC('"".join(parts)'), CC('parts.join("")'), CC('new StringBuilder().append(x)'), CC('std::string s; s += x;')],
      ['Char code', CC('ord(c); chr(n)'), CC('s.charCodeAt(i); String.fromCharCode(n)'), CC('(int) c; (char) n'), CC('(int) c; (char) n')]])]] });
DP('cs-lang-syntax', { src: ['Official docs: Python, MDN JavaScript, Java SE, cppreference', 'https://en.cppreference.com/w/'] });
