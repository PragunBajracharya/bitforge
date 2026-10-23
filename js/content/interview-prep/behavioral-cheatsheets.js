/* ===== Interview prep D: behavioral, cheat-sheet hub, plan, quiz ===== */
IPT('ip-behavioral', { name: 'Behavioral interviews', cat: 'ipcareer', roles: ['swe', 'fe', 'be', 'fs'],
  blurb: `Behavioral rounds decide as many offers as coding rounds. Interviewers look for ownership, collaboration, handling conflict and failure, and impact. Prepare six to eight true stories and tell them with the STAR structure.`,
  facts: [['Structure', 'STAR'], ['Stories to prepare', '6–8'], ['Length', '2–3 minutes each'], ['Focus', '“I”, impact, learning']],
  cheat: [['S · Situation', 'One or two sentences of context'], ['T · Task', 'Your responsibility or goal'], ['A · Action', 'What you did (most of the answer), with reasoning'], ['R · Result', 'Measurable outcome + what you learned'], ['Conflict', 'Disagreed with a teammate; how you resolved it'], ['Failure', 'A real mistake, its impact, and what changed after'], ['Ownership', 'Went beyond your role to fix something'], ['Ambiguity', 'Made progress with unclear requirements'], ['Influence', 'Convinced others without authority'], ['Prioritization', 'Too much work; how you chose'], ['Tell me about yourself', '90 s: present role → past highlights → why this job'], ['Questions to ask', 'Team’s biggest challenge, how success is measured, on-call, growth']],
  sections: [
    ['Building your story bank', OL([`List projects from the last two or three years: launches, incidents, migrations, mentoring, disagreements.`, `For each, note the situation, your specific actions, numbers (latency −40%, conversions +8%, 3 teams aligned) and lessons.`, `Map stories to common themes (conflict, failure, leadership, ambiguity, customer focus); one story can cover several.`, `Practice aloud and time yourself: 2–3 minutes, mostly on Action and Result.`])],
    ['What good answers sound like', UL([`Specific: one real situation, not “I usually…”.`, `First person: what <i>you</i> did, while crediting the team.`, `Shows judgment: why you chose that action, what alternatives you considered.`, `Ends with impact and reflection: what you’d do differently.`, `Honest about failures: interviewers distrust stories where nothing went wrong.`])],
    ['Company-specific preparation', PP(`Many companies publish their values (Amazon’s Leadership Principles, for example) and ask questions mapped to them. Read them, and tag each story with the values it demonstrates. Research the product, recent launches and engineering blog posts so your questions are specific.`)],
    ['Example answer (conflict)', PP(`<b>S:</b> Our team was about to launch a feature, and a senior engineer wanted to ship without load testing to hit the date. <b>T:</b> I owned the checkout service it depended on. <b>A:</b> I asked for 30 minutes, ran a quick k6 test on staging that showed p99 latency tripling at expected peak, shared the graph, and proposed launching to 10% of users behind a flag while we added a cache. <b>R:</b> We hit the date for 10% of users, fixed the bottleneck in two days, and rolled out fully with no incidents; afterwards load tests became part of our launch checklist.`)]
  ],
  edge: [`Blaming others or speaking negatively about past employers.`, `Stories with no clear personal contribution (“we did…”).`, `No result or numbers; or results that aren’t yours.`, `Over-rehearsed answers that don’t answer the question asked.`, `Choosing a fake weakness (“I work too hard”).`],
  faq: [['“Tell me about a time you failed.”', PP(`Pick a real, moderate failure you caused (a bug in production, a missed estimate). Explain the impact honestly, what you did immediately to fix it, the root cause, and the lasting change you made (a test, a checklist, a design review), ideally with evidence it worked.`)],
    ['“Why do you want to work here?”', PP(`Connect three things: something specific about the company (product, mission, technical challenge), what you have done that prepares you for it, and what you want to learn or contribute next. Avoid generic praise.`)]],
  qs: [SQ('In a STAR answer, which part should take most of the time?', ['Situation', 'Task', 'Action', 'A summary of the company'], 2, 'Interviewers assess what you did and why.')]
});

const ROLE_NAMES = { swe: 'Software engineering', fe: 'Frontend', be: 'Backend', fs: 'Full-stack', da: 'Data analyst' };
const ipTopics = role => Object.keys(SD).filter(k => (k.startsWith('ip-') && (SD[k].roles || []).includes(role)) || (role === 'da' && k.startsWith('da-') && SD[k].faq && !/case/.test(SD[k].cat)));

const ipLessons = [
  { id: 'ip-quiz', n: 12, title: 'Interview prep final quiz', lede: 'Twelve questions across software engineering, frontend, backend and full-stack.',
    render(root) { quiz(root, [
      SQ('Input size n ≤ 10⁵. Target complexity?', ['O(n²)', 'O(n log n) or better', 'O(2ⁿ)', 'O(n³)'], 1, '10¹⁰ operations is too slow.'),
      SQ('Which SOLID principle says “depend on abstractions, inject implementations”?', ['SRP', 'OCP', 'LSP', 'DIP'], 3, 'Dependency inversion.'),
      SQ('Two threads lock A then B and B then A. Risk and fix?', ['Starvation; add threads', 'Deadlock; acquire locks in a global order', 'Race; remove locks', 'None'], 1, 'Circular wait is a deadlock condition.'),
      SQ('Safest way to undo a pushed commit on main?', ['reset --hard + force push', 'git revert', 'git stash', 'git rebase -i'], 1, 'Revert adds a new commit.'),
      SQ('Which selector wins: #a .b or .c .d .e?', ['.c .d .e', '#a .b', 'The later one', 'Both'], 1, 'One ID outweighs any number of classes.'),
      SQ('Output order: sync log, setTimeout, promise.then, sync log?', ['sync, sync, then, timeout', 'sync, timeout, then, sync', 'then, sync, sync, timeout', 'timeout first'], 0, 'Microtasks run before the next task.'),
      SQ('Why not use array index as React key for a sortable list?', ['It’s slower', 'Items’ state gets attached to the wrong rows when order changes', 'Keys must be strings', 'React forbids it'], 1, 'Keys are identity.'),
      SQ('Best defense against XSS in user comments?', ['Hide them', 'Escape output (JSX does), sanitize HTML, CSP, HttpOnly cookies', 'CORS', 'Rate limiting'], 1, 'Never render untrusted HTML unsanitized.'),
      SQ('Authenticated user lacks permission for a resource. Status code?', ['401', '403', '500', '302'], 1, '401 = not authenticated; 403 = not allowed.'),
      SQ('100 posts and their authors trigger 101 queries. Name & fix?', ['Deadlock; lock', 'N+1; eager load / join', 'Replication lag; read from primary', 'Hot key; cache'], 1, 'Batch the related lookups.'),
      SQ('Where should JWT access tokens be kept short-lived and why?', ['Long-lived for convenience', 'Short-lived because they’re hard to revoke before expiry', 'They never expire', 'Only in URLs'], 1, 'Pair with rotating refresh tokens.'),
      SQ('Zero-downtime deploys require…', ['One big server', 'Multiple instances, readiness checks, gradual rollout and backward-compatible migrations', 'Deploying at night only', 'Disabling health checks'], 1, 'Drain, roll gradually, keep schema compatible.')
    ]); } }
];

const IP_PAGES = {
  ipCheats(el) {
    let role = store.get('bf-iprole', 'fe'), src = 'role';
    const draw = () => {
      const keys = ipTopics(role);
      el.innerHTML = `<div class="row noprint" style="margin-bottom:12px"><div class="chipbar" id="iprole">${Object.entries(ROLE_NAMES).map(([k, n]) => `<button data-r="${k}" aria-pressed="${k === role}">${n}</button>`).join('')}</div>
          <button class="btn" id="ipprint">Print / save as PDF</button></div>
        <div class="card noprint"><h3>Flashcard drill</h3><p class="section-sub" style="margin:4px 0 10px">A random interview question. Answer out loud, then reveal.</p>
          <div class="chipbar" id="ipsrc" style="margin-bottom:10px">${[['role', ROLE_NAMES[role] + ' topics'], ['sd', 'System design'], ['prob', 'NeetCode problems']].map(([k, n]) => `<button data-s="${k}" aria-pressed="${k === src}">${n}</button>`).join('')}</div><div id="ipcard"></div><div class="row" style="margin-top:10px"><button class="btn primary" id="ipnext">Next question</button><button class="btn" id="ipshow">Reveal answer</button></div></div>
        <div class="cheatsheet">
          <h2 class="section-title">${ROLE_NAMES[role]} cheat sheet</h2><p class="section-sub">${keys.length} topics · click a title to open the full lesson.</p>
          ${keys.map(k => `<h3><button class="inline-link" data-k="${k}" style="font:inherit">${esc(SD[k].name)}</button></h3>${cheatHTML(SD[k].cheat || [])}`).join('')}
        </div>`;
      $$('#iprole button', el).forEach(b => b.onclick = () => { role = b.dataset.r; store.set('bf-iprole', role); draw(); });
      $('#ipprint', el).onclick = () => window.print();
      $$('.cheatsheet [data-k]', el).forEach(b => b.onclick = () => openSdTopic(b.dataset.k));
      $$('#ipsrc button', el).forEach(b => b.onclick = () => { src = b.dataset.s; $$('#ipsrc button', el).forEach(x => x.setAttribute('aria-pressed', x === b)); next(); });
      const qa = k => [...(SD[k].faq || []), ...((DEEP[k] || {}).fu || []).map(([q, a]) => [q, PP(a)])].map(f => [SD[k].name, ...f]);
      const pools = {
        role: keys.flatMap(qa),
        sd: Object.keys(SD).filter(k => !SD[k].domain).flatMap(qa),
        prob: PROBS.map(p => [`#${p.n} · ${esc(p.t)} (${p.d})`, `${p.sum} Which pattern, and what is the approach and complexity?`, `<p><b>Pattern:</b> ${(PCATS.find(c => c[0] === p.c) || [, p.c])[1]}</p><p>${p.app}</p><p><b>Time</b> ${p.tc} · <b>Space</b> ${p.sc}</p>`])
      };
      let cur = null;
      const next = () => {
        const pool = pools[src];
        cur = pool[Math.floor(Math.random() * pool.length)];
        if (!cur) { $('#ipcard', el).textContent = 'No questions for this role yet.'; return; }
        $('#ipcard', el).innerHTML = `<div class="panel-title">${cur[0]}</div><p style="margin:4px 0;font-weight:600;font-size:16px">${cur[1]}</p><div class="faqa" id="ipans" hidden style="padding:8px 0 0">${cur[2]}</div>`;
        $('#ipshow', el).disabled = false;
      };
      $('#ipnext', el).onclick = next;
      $('#ipshow', el).onclick = () => { const a = $('#ipans', el); if (a) { a.hidden = false; $('#ipshow', el).disabled = true; } };
      next();
    };
    draw();
  },
  ipPlan(el) {
    el.innerHTML = `<div class="card"><h3>How to use this course</h3><p style="margin:6px 0 0;max-width:72ch">Every topic is a cheat sheet first (scan it the night before), then a detailed lesson with implementations, edge cases and model answers. Pick the plan for your target role; all plans include the software engineering core and behavioral prep.</p></div>
      <h2 class="section-title">Study plans</h2>
      ${TBL(['Role', 'Weeks 1–2', 'Weeks 3–4', 'Weeks 5–6'], [
        ['Frontend', 'Coding playbook, data structures, NeetCode arrays/strings/hashing; HTML & a11y, CSS', 'JavaScript fundamentals, event loop, React, browser performance', 'Web security, frontend system design, testing, behavioral, mock interviews'],
        ['Backend', 'Coding playbook, data structures, NeetCode core patterns; OOP, design patterns', 'HTTP & REST, backend architecture, databases, auth, concurrency', 'Performance, System Design course (caching, queues, sharding), behavioral, mocks'],
        ['Full-stack', 'Coding playbook, data structures, NeetCode; JavaScript, React', 'HTTP & REST, databases, auth, data flow across the stack', 'URL journey, Docker/CI/CD, task-board design, security, behavioral, mocks'],
        ['Software engineer (generalist)', 'Coding playbook, data structures, NeetCode 150 first half; OS & networking', 'NeetCode second half, OOP & patterns, low-level design, concurrency, testing, Git', 'System Design course, behavioral, résumé & offers, mock interviews'],
        ['Data analyst', 'Data Analytics course: statistics, probability, Excel; SQL foundations', 'Advanced SQL (windows, cohorts), Power BI or Tableau, A/B testing', 'Data analyst interviews page, a portfolio project, behavioral, résumé & offers']])}
      <h2 class="section-title">The week before</h2>
      ${UL([`Re-read the cheat sheets for your role (use Print to make a PDF).`, `Do two or three timed mock interviews (a friend, Pramp, interviewing.io).`, `Revisit your NeetCode mistakes, not new problems.`, `Polish your story bank and “tell me about yourself”.`, `Prepare questions for each interviewer.`, `Sleep. Performance drops sharply when tired.`])}
      <h2 class="section-title">During the interview</h2>
      ${UL([`Clarify before solving; think aloud; check in with the interviewer.`, `Write a brute force if stuck, then improve.`, `Test your code with your own examples and edge cases.`, `In design rounds: requirements → estimates → API → high-level → deep dives → trade-offs.`, `It’s fine to say “I don’t know, but here’s how I’d find out”.`])}`;
  }
};
