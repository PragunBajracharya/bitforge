/* ===== Beginner-first wraps — Bug Bounty batch 3 (methodology + web vulnerability classes). ===== */

SDWRAP('bb-methodology',
  [['Start here (in plain words)',
    PLAIN(`Recon hands you a pile of hosts and endpoints; <b>methodology</b> is the repeatable loop that turns them into bugs. Good hunters don’t fire random payloads at everything — they <b>understand the app first</b> (its user roles, its objects, how data and money flow), then test each feature against a mental checklist of vulnerability classes. You run this same non-destructive loop on every app.`) +
    ANALOGY(`It’s the difference between a detective and someone yelling accusations. A detective maps the scene, works out who’s who and what’s valuable, picks one thread, and asks “what if this person lied here?” — methodically. Firing random exploit payloads is the yelling; working the app feature by feature, asking “what if I change this?”, is the detective work that actually solves the case.`) +
    KEYTERMS([
      ['Methodology', 'A repeatable testing loop: map → understand → pick a feature → ask “what if” → test the class → confirm.'],
      ['Roles & objects', 'Who can do what (roles) and the things with IDs they act on (objects) — the heart of understanding an app.'],
      ['Trust boundary', 'Where data crosses from “attacker-controlled” to “trusted” — where bugs live.'],
      ['OWASP Top 10', 'The industry’s list of the most common web vulnerability classes — your checklist.'],
      ['Business logic', 'Flaws in the app’s intended workflow that scanners can’t find — you think like an abuser.'],
      ['Non-destructive', 'Testing in a way that proves the bug without harming the app or real users.']])]],
  [['Recap', RECAP([
    `Methodology is the loop that converts recon output into bugs — not random payloads.`,
    `The loop: <b>map</b> the app (use every feature) → <b>understand</b> roles/objects/flows → <b>pick one feature</b> → ask <b>“what if”</b> → <b>test the vulnerability class</b> → <b>confirm with a minimal PoC</b>.`,
    `Map each feature to the <b>OWASP Top 10</b> classes, especially broken access control (A01), injection (A03), and auth failures (A07).`,
    `<b>Business logic</b> flaws need an abuser’s mindset — scanners miss them.`,
    `Always test <b>non-destructively</b>, using your own accounts and the smallest possible proof.`])]]);

SDWRAP('bb-access',
  [['Start here (in plain words)',
    PLAIN(`<b>Broken access control</b> is the #1 web vulnerability and the most productive one for hunters: the server simply fails to check that the person making a request is actually <i>allowed</i> to do it or see it. Its most common form is <b>IDOR</b> (also called BOLA): you change an identifier in a request and get back <i>someone else’s</i> data. You find it by hand with two accounts.`) +
    ANALOGY(`Picture a coat-check where your ticket says “42”. You hand back ticket “43” instead — and the attendant, never checking it’s really yours, hands you a stranger’s coat. That’s IDOR: the app trusts the ID you present without verifying the object belongs to you. Swap 42 for 43, 100 for 101, your UUID for someone else’s, and see whose stuff comes back.`) +
    KEYTERMS([
      ['Broken access control', 'The server doesn’t verify you’re allowed to do/see something.'],
      ['IDOR / BOLA', 'Insecure Direct Object Reference / Broken Object-Level Authorization — accessing another user’s object by changing its ID.'],
      ['Function-level (BFLA)', 'Calling a privileged/admin action as a low-privileged user.'],
      ['Two accounts (A and B)', 'The core technique: act as user A on user B’s objects and see if it works.'],
      ['Mass assignment', 'Adding fields the UI omits (like role or isAdmin) to a request to escalate.'],
      ['Autorize', 'A Burp extension that auto-replays your requests as a low-priv user to flag access gaps.']])]],
  [['Recap', RECAP([
    `Broken access control (the server not checking “are you allowed?”) is the most common and most productive bug class.`,
    `<b>IDOR/BOLA</b>: change an identifier (numeric, UUID, slug — in URL, body, header, or cookie) to reach another user’s object.`,
    `Also test <b>function-level</b> gaps (calling admin endpoints as a low-priv user) and <b>mass assignment</b> (adding role/isAdmin fields).`,
    `Find it by hand with <b>two accounts</b>; the <b>Autorize</b> Burp extension scales the check.`,
    `Confirm safely with your own accounts and the minimum data — never collect real users’ information.`])]]);

SDWRAP('bb-auth',
  [['Start here (in plain words)',
    PLAIN(`<b>Authentication</b> decides who you are; <b>sessions</b> keep you logged in afterwards; <b>password reset</b> and <b>2FA</b> guard the edges. Each has well-known failure modes that lead straight to <b>account takeover</b> — taking control of someone else’s account — which is a bug class programs pay well for.`) +
    ANALOGY(`Think of a members’ club. The door check is <b>authentication</b> (are you who you say?). The wristband they give you is your <b>session</b> (it keeps letting you in without re-checking). The “lost your wristband?” desk is <b>password reset</b>, and the second ID they ask for is <b>2FA</b>. Account takeover is finding a flaw in <i>any</i> of these — a wristband you can forge, a reset desk that hands out anyone’s replacement — and walking in as someone else.`) +
    KEYTERMS([
      ['Authentication', 'Proving who you are (login).'],
      ['Session', 'What keeps you logged in after login — usually a cookie/token; must rotate on login and die on logout.'],
      ['Account takeover (ATO)', 'Gaining control of another user’s account — the high-value outcome of auth bugs.'],
      ['Password reset flaws', 'Weak/guessable tokens, no expiry, reuse, or host-header poisoning in the reset link.'],
      ['2FA bypass', 'Skipping the second-factor step, reusing/brute-forcing the code, or tampering the response.'],
      ['JWT', 'A signed token; classic flaws include alg=none, a weak secret, or no expiry.']])]],
  [['Recap', RECAP([
    `Auth = who you are; sessions = staying logged in; reset & 2FA = the edges — flaws in any lead to <b>account takeover</b>.`,
    `Test login for <b>rate limiting, lockout, and user enumeration</b>; test sessions for <b>rotation on login</b> and <b>invalidation on logout/reset</b>.`,
    `<b>Password reset</b>: check token entropy, expiry, reuse, and host-header poisoning; <b>2FA</b>: try skipping, reusing, brute-forcing, response tampering.`,
    `<b>JWTs</b>: look for alg=none, weak secrets, and missing expiry; <b>OAuth</b>: check redirect_uri validation and the state parameter.`,
    `Account takeover is paid well — argue the impact clearly.`])]]);

SDWRAP('bb-xss',
  [['Start here (in plain words)',
    PLAIN(`<b>Cross-site scripting (XSS)</b> is getting your own JavaScript to run in <i>another user’s</i> browser, inside the target app’s origin. Because it runs as them, in the app, it can steal their session, act as them, or exfiltrate their data. It comes in three forms — reflected, stored, and DOM-based — and you prove it safely with a harmless payload.`) +
    ANALOGY(`Imagine a community notice board where you pin a note. With XSS, you craft a note that, the moment someone reads it, makes <i>their</i> hand sign a cheque — because the board never checked your note was just text, not instructions. <b>Stored</b> XSS is the worst kind: your note stays pinned and hijacks the hand of <i>everyone</i> who walks past and reads it.`) +
    KEYTERMS([
      ['XSS', 'Running attacker-controlled JavaScript in a victim’s browser, in the app’s origin.'],
      ['Reflected', 'Your input is echoed straight back into the response unsanitized (needs a crafted link).'],
      ['Stored', 'Your input is saved and shown to others — the worst, because it hits every viewer.'],
      ['DOM-based', 'Client-side JS writes your input into a dangerous sink (like innerHTML) in the browser.'],
      ['Sink / source', 'A sink is where input becomes code (innerHTML, eval); a source is where it enters (location.hash).'],
      ['Benign PoC', 'A harmless proof like alert(document.domain) — never a real malicious payload.']])]],
  [['Recap', RECAP([
    `XSS runs your JavaScript in another user’s browser, in the app’s origin — enabling session theft and actions as the victim.`,
    `Three forms: <b>reflected</b> (echoed from the request), <b>stored</b> (saved and shown to others — worst), <b>DOM-based</b> (client-side JS writes input into a sink).`,
    `The payload depends on <b>context</b> (HTML body vs attribute vs JS string); it fires when input reaches a <b>sink</b> like innerHTML or eval.`,
    `Prove it with a <b>benign PoC</b> (alert(document.domain)); for blind/stored cases, use an out-of-band callback.`,
    `Note mitigations like <b>CSP</b> that may limit impact when you report.`])]]);

SDWRAP('bb-ssrf',
  [['Start here (in plain words)',
    PLAIN(`<b>Server-side request forgery (SSRF)</b> tricks the <i>server</i> into making a request to a destination <i>you</i> choose. That’s powerful because the server can often reach places you can’t — internal-only services, and cloud “metadata” endpoints that hand out credentials. It’s a high-severity favourite, and you confirm the invisible (“blind”) cases with an out-of-band callback.`) +
    ANALOGY(`The server is like a hotel concierge who has keys to all the back offices you’re barred from. You can’t walk into the manager’s office — but you can <i>ask the concierge</i> to “go fetch the document from that room for me”, and they will, because they’re trusted inside. SSRF is persuading the trusted server to fetch something from an address only it can reach, then (sometimes) handing you the result.`) +
    KEYTERMS([
      ['SSRF', 'Making the server send a request to a URL/address you control.'],
      ['Sources', 'Features that fetch a URL: avatar-by-URL, webhooks, imports, link previews, PDF/HTML renderers.'],
      ['Full vs blind SSRF', 'Full = the response comes back to you; blind = it doesn’t, so you prove it with a callback.'],
      ['Out-of-band (interactsh/Collaborator)', 'A server you control that records the target reaching out — proof for blind cases.'],
      ['Cloud metadata (169.254.169.254)', 'An internal endpoint on cloud VMs that can leak credentials — a top SSRF target.'],
      ['Filter bypass', 'Alternate IP encodings, redirects, or DNS rebinding to defeat blocklists.']])]],
  [['Recap', RECAP([
    `SSRF makes the server fetch a destination you choose — often internal services and cloud metadata you can’t reach directly.`,
    `Look for it in features that take a URL: avatar-by-URL, webhooks, imports, link previews, document renderers.`,
    `<b>Full</b> SSRF returns the response to you; <b>blind</b> SSRF is proven with an <b>out-of-band callback</b> (interactsh/Collaborator).`,
    `The cloud <b>metadata endpoint (169.254.169.254)</b> can leak credentials — a high-impact target.`,
    `Confirm safely by hitting your <i>own</i> callback host; argue impact (internal recon, metadata creds, pivot).`])]]);

SDWRAP('bb-injection',
  [['Start here (in plain words)',
    PLAIN(`<b>Injection</b> happens when your input is dropped into a query, command, or template <i>without being kept separate from the code</i> — so your input changes the instructions the server actually runs. <b>SQL injection</b> is the classic (tampering with database queries); NoSQL, OS-command, and server-side template injection follow the same idea. You detect each safely, and use sqlmap responsibly.`) +
    ANALOGY(`Think of a fill-in-the-blanks form a clerk reads aloud as a command: “Give the customer one ______.” You write in the blank: “coffee — and also hand over the cash drawer.” If the clerk reads the whole thing as one instruction, your injected words became part of the command. Injection is sneaking extra <i>code</i> into a slot meant only for <i>data</i>.`) +
    KEYTERMS([
      ['Injection', 'Input placed into code (a query/command/template) so it changes what runs.'],
      ['SQL injection (SQLi)', 'Tampering with a database query via input; types: error-based, UNION, boolean-blind, time-blind.'],
      ['NoSQL injection', 'Operator injection into document queries, e.g. {"$ne": null}.'],
      ['Command injection', 'Input reaches an OS command (; | && $(...)); often confirmed out-of-band.'],
      ['SSTI (template injection)', 'Input evaluated by a template engine — {{7*7}} returning 49 is the tell.'],
      ['sqlmap', 'A tool that automates SQLi detection and exploitation (use within scope and rules).']])]],
  [['Recap', RECAP([
    `Injection = your input becomes part of the code the server runs, because data and code weren’t kept separate.`,
    `<b>SQLi</b> is the classic; detect by breaking the query (<code>'</code>, <code>--</code>) and watching errors/differences.`,
    `The same idea powers <b>NoSQL</b> (operator injection), <b>command</b> injection, and <b>SSTI</b> (<code>{{7*7}}</code> → 49).`,
    `<b>Blind</b> cases are proven with time delays or out-of-band callbacks; <b>sqlmap</b> automates SQLi.`,
    `Confirm minimally — never dump real data — and argue impact (data read/modify, sometimes RCE).`])]]);

SDWRAP('bb-files',
  [['Start here (in plain words)',
    PLAIN(`Features that <b>accept files</b>, or that <b>build a file path from your input</b>, are a rich source of high-severity bugs. A crafty upload can become stored XSS or even code execution; and <b>path traversal</b> / <b>local file inclusion</b> can trick the app into reading sensitive files off its own server. You test both safely, proving the issue with a harmless example.`) +
    ANALOGY(`Picture a mailroom. An <b>upload bug</b> is sneaking in a package that looks like a document but is really a device that goes off when opened (a file that runs as code on the server). <b>Path traversal</b> is addressing a package with “go down the hall, then <code>../</code> back and into the restricted records room” — using <code>../</code> steps to escape the folder you were meant to stay in and read files you shouldn’t.`) +
    KEYTERMS([
      ['File upload bypass', 'Getting a dangerous file past checks via a fake extension, spoofed content-type, or polyglot.'],
      ['Stored XSS via upload', 'Uploading an SVG/HTML file that runs script when viewed.'],
      ['Server execution', 'If an upload lands in a web-executable folder, a script file may run — high severity.'],
      ['Path traversal', 'Using ../ sequences to reach files outside the intended directory.'],
      ['LFI (local file inclusion)', 'The app includes a file chosen by your input, letting you read (or run) it.'],
      ['Benign proof', 'Read a known-safe file and show one line — never exfiltrate sensitive data.']])]],
  [['Recap', RECAP([
    `File-upload and path-building features are high-severity territory.`,
    `<b>Upload</b> attacks bypass checks via extension/content-type tricks, turn SVG/HTML into stored XSS, or (if stored in a web-exec dir) achieve code execution.`,
    `<b>Path traversal</b> uses <code>../</code> (and encodings like <code>..%2f</code>) to read files outside the intended folder; <b>LFI</b> makes the app include a file you choose.`,
    `Prove it <b>benignly</b> — read a known-safe file and show a single line.`,
    `Defences to note: extension allowlists, random names, non-executable storage, and path canonicalization.`])]]);

SDWRAP('bb-logic',
  [['Start here (in plain words)',
    PLAIN(`Not every bug is an injection. <b>Business-logic</b> flaws abuse the app’s intended workflow (coupons, limits, prices, roles); <b>CSRF</b> makes a victim’s browser perform an action without their knowledge; misconfigured <b>CORS</b> leaks data across origins; and <b>open redirects</b> enable phishing and chain into bigger bugs. These are high-value precisely because automated scanners can’t find them — they require thinking like an abuser.`) +
    ANALOGY(`Business-logic abuse is like exploiting a board game’s rules exactly as written: buy a property, refund it, buy it again to farm points — you never “cheated”, you just used the rules in a way the designer didn’t intend. The game runs fine; the <i>logic</i> is broken. Scanners only catch rule-breaking (malformed input); they can’t spot a legal-but-abusive sequence of moves.`) +
    KEYTERMS([
      ['Business logic flaw', 'Abusing the intended workflow: coupon reuse, negative quantities, limit/role bypass, step skipping.'],
      ['Race condition', 'Firing parallel requests to beat a check (double-spend, reuse a one-time code).'],
      ['CSRF', 'Making a victim’s browser send a state-changing request using their logged-in cookies.'],
      ['CORS misconfig', 'Reflecting any origin with credentials allowed → cross-origin data theft.'],
      ['Open redirect', 'A ?next=/?url= parameter that sends users to an external site — enables phishing/chains.'],
      ['Clickjacking', 'Framing a sensitive action so a victim clicks it unknowingly.']])]],
  [['Recap', RECAP([
    `Logic bugs abuse the app’s <b>intended</b> workflow — scanners miss them, so they’re high-value.`,
    `<b>Business logic</b>: coupon reuse, negative price/quantity, limit/role bypass, step skipping; <b>race conditions</b> exploit parallel requests.`,
    `<b>CSRF</b>: a state-changing request with no anti-CSRF token and cookie-only auth; check tokens and SameSite.`,
    `<b>CORS</b> that reflects the origin with credentials allows cross-origin reads; <b>open redirects</b> enable phishing and chain into OAuth theft/SSRF bypass.`,
    `Prove with a minimal PoC on your own accounts, and argue the concrete impact (money, privilege, data).`])]]);
