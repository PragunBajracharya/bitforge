/* ===== Beginner-first wraps — Bug Bounty batch 4 (APIs + automation/triage/reporting/disclosure). Completes bug bounty. ===== */

SDWRAP('bb-api',
  [['Start here (in plain words)',
    PLAIN(`Most modern apps are <b>API-first</b>: the pretty web page is just a thin skin over an API that does the real work — and that API often has <b>more surface and weaker authorization</b> than the UI you can see. REST APIs expose objects directly by ID (a paradise for IDOR/BOLA); GraphQL exposes a flexible query language with its own pitfalls. Learning to test the API directly is where a lot of access-control bugs live.`) +
    ANALOGY(`The web UI is the building’s public lobby, with a receptionist who only lets you do certain things. The <b>API</b> is the staff service entrance round the back — it can reach far more rooms, and it’s often guarded far more loosely because the designers assumed only their own app would use it. Walk in the service entrance (call the API directly) and you frequently find doors the lobby would never have opened.`) +
    KEYTERMS([
      ['API', 'The machine interface behind the app; often broader and less-guarded than the UI.'],
      ['REST', 'An API style exposing objects at URLs by ID — change the ID to test BOLA/IDOR.'],
      ['BOLA / BFLA', 'Broken object-level / function-level authorization — the top API bug classes.'],
      ['GraphQL', 'A flexible query language where the client asks for exactly the data it wants.'],
      ['Introspection', 'A GraphQL feature that dumps the whole schema — every query and mutation available.'],
      ['Mass assignment', 'Sending extra fields (role, isAdmin) the UI never shows, to escalate.']])]],
  [['Recap', RECAP([
    `Apps are <b>API-first</b>; the API usually has more surface and weaker authorization than the UI — test it directly.`,
    `Find the API in JS, mobile traffic, or docs (swagger/openapi.json); try every HTTP method and old versions (/v1).`,
    `<b>REST</b> is IDOR/BOLA-prone (swap object IDs; call privileged endpoints as a low-priv user); also try <b>mass assignment</b>.`,
    `<b>GraphQL</b>: use <b>introspection</b> to dump the schema, then look for missing field-level auth, batching, and deep-nesting abuse.`,
    `Missing <b>rate limits</b> on an API enable enumeration and brute force.`])]]);

SDWRAP('bb-automation',
  [['Start here (in plain words)',
    PLAIN(`Manual testing finds the bugs, but <b>automation finds the attack surface</b> and keeps watch while you sleep. The highest-return automation isn’t a scanner spraying payloads — it’s <b>continuous monitoring</b> that alerts you the moment a new subdomain, endpoint, or exposure appears, so you’re the <i>first</i> to test it before the crowd arrives.`) +
    ANALOGY(`Think of it less as a robot that kicks every door (noisy and usually useless) and more as a <b>tripwire alarm</b> around your chosen target. The instant a new door gets built — a fresh subdomain, a changed JavaScript bundle — the alarm pings your phone, and you’re there to try the handle before anyone else even knows it exists. Being first is the edge.`) +
    KEYTERMS([
      ['Continuous monitoring', 'Re-running recon on a schedule and alerting on anything new.'],
      ['Diff', 'Comparing today’s results to last time to find what changed (new subdomains, new endpoints).'],
      ['notify', 'Piping tool output to Slack/Discord/Telegram so alerts reach you.'],
      ['Scheduling', 'cron, a VPS timer, or GitHub Actions running the pipeline automatically.'],
      ['Keep state', 'Storing the last results so you can diff against them.'],
      ['Scope still applies', 'Automation must respect scope and rate limits just like manual testing.']])]],
  [['Recap', RECAP([
    `Automation’s best use is finding and <b>watching</b> the attack surface, not spraying payloads.`,
    `<b>Continuous monitoring</b>: re-run subdomain/endpoint/JS/nuclei recon on a schedule, <b>diff</b> against last time, and alert on anything new.`,
    `Pipe alerts to chat with <b>notify</b>; schedule via cron, a VPS timer, or CI; keep stored state to diff against.`,
    `Being <b>first</b> to test fresh surface is the repeatable edge over the crowd.`,
    `Automation must still obey <b>scope and rate limits</b>.`])]]);

SDWRAP('bb-severity',
  [['Start here (in plain words)',
    PLAIN(`A report’s reward depends on its <b>severity</b>, and severity depends on <b>impact</b> — what an attacker can actually do, to whom, and how easily. Programs rate bugs with <b>CVSS</b> (a standard 0–10 score) and/or a taxonomy like Bugcrowd’s VRT. Rating honestly — neither inflating nor underselling — builds trust and gets you paid fairly.`) +
    ANALOGY(`It’s like an insurance adjuster pricing damage. A scratch and a structural crack are both “damage”, but the payout tracks the <b>real-world consequence</b>, not the label. Two bugs of the same <i>class</i> can be worlds apart: a reflected XSS on a logout page is a scratch; a stored XSS in every admin’s dashboard is a structural crack. You argue the consequence, not the category.`) +
    KEYTERMS([
      ['Severity', 'How serious a bug is — what drives the reward.'],
      ['Impact', 'What an attacker can actually do, to whom, and how easily — the real basis of severity.'],
      ['CVSS', 'A standard 0–10 score built from a vector of metrics (access, privileges, confidentiality/integrity/availability).'],
      ['Severity bands', 'Critical (9–10), High (7–8.9), Medium (4–6.9), Low (0.1–3.9), Info.'],
      ['VRT', 'Bugcrowd’s Vulnerability Rating Taxonomy — a baseline severity per bug type.'],
      ['Chaining', 'Combining several low-severity bugs into one high-impact attack.']])]],
  [['Recap', RECAP([
    `Reward tracks <b>severity</b>, and severity tracks <b>impact</b> — what an attacker can do, to whom, how easily.`,
    `Programs use <b>CVSS</b> (0–10 from a metric vector) and/or <b>VRT</b> to rate bugs into Critical/High/Medium/Low/Info bands.`,
    `The same bug <b>class</b> varies hugely by impact — argue the concrete consequence, not just the label.`,
    `Rate <b>honestly</b> (don’t inflate or undersell); it builds the trust that gets you paid fairly.`,
    `<b>Chain</b> low-severity bugs together when they combine into a bigger impact.`])]]);

SDWRAP('bb-report',
  [['Start here (in plain words)',
    PLAIN(`The <b>report</b> is what you actually deliver — the bug in your head is worth nothing until a triager can confirm it. A clear, reproducible report is the difference between a paid bug and a frustrated “could not reproduce” close. A good one lets a triager re-create the issue in <b>minutes</b>, from a clean state, following your exact steps.`) +
    ANALOGY(`A report is a <b>recipe</b>. If a stranger can follow your numbered steps and end up with the exact same dish (the bug reproducing), you get paid. If the recipe says “add some stuff and bake till done”, they’ll fail, blame the recipe, and close it as “couldn’t reproduce” — even though your cake was real. Precision in the steps is the whole job.`) +
    KEYTERMS([
      ['Title', 'One line: vulnerability type + location + impact.'],
      ['Steps to reproduce', 'Exact, numbered steps from a clean state — the most important part.'],
      ['PoC (proof of concept)', 'The request/response, screenshots, or a short video showing it’s real (benign payload).'],
      ['Impact statement', 'What an attacker can do, to whom, at what scale.'],
      ['Remediation', 'A concrete suggested fix.'],
      ['One bug per report', 'Separate issues go in separate reports (a genuine chain is the exception).']])]],
  [['Recap', RECAP([
    `The report is the deliverable; a clear, reproducible one is what gets paid.`,
    `Structure: a one-line <b>title</b>, a 2–3 sentence summary, honest <b>severity</b>, the exact <b>affected asset</b>, numbered <b>steps to reproduce</b>, a <b>PoC</b>, an <b>impact</b> statement, and a <b>remediation</b> suggestion.`,
    `Steps must work <b>from a clean state</b> so a triager reproduces it in minutes.`,
    `Use a <b>benign PoC</b> and include your test accounts, timestamps, and bounty header.`,
    `<b>One bug per report</b> (chains excepted).`])]]);

SDWRAP('bb-sla',
  [['Start here (in plain words)',
    PLAIN(`After you submit, your report moves through a set of defined <b>states</b>, and good programs commit to response-time targets (<b>SLAs</b>) for each stage. Knowing the lifecycle tells you what to expect, when it’s reasonable to follow up, and — by reading a program’s published response metrics <i>before</i> you start — whether it’s worth weeks of your effort at all.`) +
    ANALOGY(`It’s like tracking a parcel: “received → being processed → out for delivery → delivered”, each stage with a rough promised time. You wouldn’t phone the courier five minutes after posting it; you wait for the expected window. A report has the same stages, and the program’s “response efficiency” is the courier’s delivery-time reputation you check before trusting them with your parcel.`) +
    KEYTERMS([
      ['Triage states', 'New/Needs-triage → Triaged/Accepted → Resolved, or Duplicate / Informative / N/A.'],
      ['Triaged / Accepted', 'Validated and reproduced — you’ll likely be paid.'],
      ['Duplicate', 'Someone reported it first — usually unpaid.'],
      ['Informative / N/A', 'Valid-ish but low/known/no impact, or not a valid issue — unpaid.'],
      ['SLA', 'The program’s target time to first response, triage, bounty, and resolution.'],
      ['Response efficiency', 'A program’s published average response times — check before committing.']])]],
  [['Recap', RECAP([
    `A submitted report moves through defined <b>states</b>; good programs publish <b>SLAs</b> (response-time targets) for each.`,
    `Key states: <b>Triaged/Accepted</b> (validated, likely paid), <b>Duplicate</b> / <b>Informative</b> / <b>N/A</b> (usually unpaid), <b>Resolved</b> (fixed).`,
    `Bounties pay sometimes on triage, sometimes on fix — timing varies.`,
    `Follow up <b>politely, after the SLA window</b> passes, not before.`,
    `Check a program’s <b>response efficiency</b> before investing weeks in it.`])]]);

SDWRAP('bb-disclosure',
  [['Start here (in plain words)',
    PLAIN(`The final phase is about <b>conduct over time</b>: coordinated disclosure (going public only with permission, after a fix), handling duplicates and disputes gracefully, getting paid (identity checks and taxes), and building the reputation that unlocks private programs. How you behave matters as much as what you find — it’s a small community with long memories.`) +
    ANALOGY(`Bug bounty is a <b>small town</b>, not an anonymous crowd. Triagers and hunters remember who was gracious about a duplicate and who threw a public tantrum. Your reputation walks into every room ahead of you — it’s what earns the quiet, lucrative invitations to the members-only clubs (private programs). Burn a bridge loudly once and the whole town hears.`) +
    KEYTERMS([
      ['Coordinated disclosure', 'Report privately; publicize only with permission, after the fix.'],
      ['Duplicate / dispute', 'Accept duplicates gracefully; dispute via platform mediation with evidence, never public shaming.'],
      ['No extortion', 'Never trade silence or disclosure for money — that’s a crime, not research.'],
      ['KYC', 'Identity verification you must complete to get paid.'],
      ['Reputation / signal', 'Built from valid, clear, in-scope reports — your real long-term asset.'],
      ['Private invites', 'The payoff of good reputation: low-competition, often higher-paying programs.']])]],
  [['Recap', RECAP([
    `The last phase is <b>conduct</b>: it shapes your reputation as much as your findings do.`,
    `Practice <b>coordinated disclosure</b> — report privately, go public only with permission after a fix.`,
    `Handle <b>duplicates and disputes</b> gracefully (platform mediation, never public shaming); <b>never extort</b>.`,
    `Getting paid involves <b>KYC</b> and taxes — bounties are income you’re responsible for reporting.`,
    `<b>Reputation</b> from valid, clear, in-scope reports is the real asset — it unlocks low-competition <b>private invites</b>.`])]]);
