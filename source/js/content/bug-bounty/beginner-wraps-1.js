/* ===== Beginner-first wraps — Bug Bounty batch 1 (foundations + lab). Keeps each topic's detail; adds a plain-English lead + recap. ===== */

SDWRAP('bb-what',
  [['Start here (in plain words)',
    PLAIN(`Bug bounty is a deal: a company publicly <b>invites</b> you to look for security holes in systems they own, and pays you for the valid ones you report. The magic word is <b>permission</b> — the exact same action (poking at a login page, say) is honest research inside the program’s rules and a crime outside them. Everything else in this course builds on that one idea.`) +
    ANALOGY(`Imagine a shop that hires people to try to pick its locks and pays a reward for each weakness they find and report — but only on the doors the shop has listed. Pick one of those doors and you’re a paid security tester. Pick the neighbour’s door, and you’re just a burglar. The list of allowed doors is everything.`) +
    KEYTERMS([
      ['Program / policy', 'The company’s published rules: what you may test, how, and the rewards.'],
      ['Scope', 'The exact systems you’re allowed to test. Out of scope = off limits.'],
      ['VDP vs BBP', 'A Vulnerability Disclosure Program takes reports (usually no pay, legal safe harbour); a Bug Bounty Program pays for valid bugs.'],
      ['Triage', 'The program checking that your report is real, in scope, and new.'],
      ['Bounty', 'The reward, scaled to how serious the bug is.'],
      ['Duplicate', 'Someone reported the same bug first — usually no reward.'],
      ['Safe harbour', 'A promise not to sue/prosecute good-faith testing that follows the rules.'],
      ['PoC (proof of concept)', 'The minimum demonstration that a bug is real.']])]],
  [['Recap', RECAP([
    `Bug bounty = companies legally invite you to find security bugs in their systems and pay for valid ones.`,
    `<b>Permission is the whole game</b>: in-scope testing is legal; the same act out of scope is a crime.`,
    `The flow is: read the <b>policy</b> → <b>recon</b> and test in scope → write a clear <b>report</b> → <b>triage</b> validates it → you get a <b>bounty</b>.`,
    `Beginners earn little at first; <b>reputation</b> from clear, valid, in-scope reports is what unlocks the lucrative private invites.`,
    `Start on wide-scope VDPs to learn safely, then move to paid programs once you can reliably find real bugs.`])]]);

SDWRAP('bb-legal',
  [['Start here (in plain words)',
    PLAIN(`The single document that separates a researcher from a criminal is the program’s <b>scope</b> — the written list of what you may test and how. Read it every single time, before you send one request, and re-read it when it changes. The <b>safe-harbour</b> clause protects you, but <i>only</i> while you stay inside the rules.`) +
    ANALOGY(`Think of the scope as a backstage pass that names exactly which rooms you’re allowed into. Show it in a listed room and you’re authorised crew. Wander into a room that isn’t on the pass and you’re trespassing — the pass offers you no cover there, no matter how good your intentions.`) +
    KEYTERMS([
      ['In-scope asset', 'A system explicitly listed as testable — the only places you may touch.'],
      ['Out-of-scope asset', 'Anything not listed; sending it even one request is unauthorised.'],
      ['Out-of-scope issue', 'A bug class the program won’t accept (e.g. self-XSS, missing headers).'],
      ['Safe harbour', 'The promise not to pursue good-faith, in-scope, rule-following testing.'],
      ['Rules of engagement', 'Allowed automation, rate limits, which test accounts to use, required headers.'],
      ['CFAA / Computer Misuse Act', 'US / UK laws that make unauthorised access a crime — scope is your authorisation.'],
      ['Wildcard (*.example.com)', 'Usually all subdomains of that domain — but always check the exclusions.'],
      ['PII rule', 'Stop at proof; never collect or keep other users’ data.']])]],
  [['Recap', RECAP([
    `The written <b>scope</b> is the boundary between authorised research and a crime — read it every time.`,
    `<b>Safe harbour</b> protects only good-faith testing that stays in scope and follows the rules; step outside and you lose it.`,
    `Nearly every program bans denial of service, high-rate scanning without permission, social engineering, and touching real users’ data.`,
    `A <b>wildcard</b> covers that domain’s subdomains only — not third-party services on other domains, and not anything in the exclusions.`,
    `If you stumble onto real user data or realise you’re out of scope: <b>stop, keep minimal proof, delete what you grabbed, and report it immediately</b>.`])]]);

SDWRAP('bb-platforms',
  [['Start here (in plain words)',
    PLAIN(`Platforms like HackerOne, Bugcrowd, Intigriti and YesWeHack are marketplaces that list companies’ programs in one place (and some big companies run their own). As a beginner, <b>which target you pick matters more than raw skill</b> — a well-chosen, uncrowded target is where you’ll actually land bugs.`) +
    ANALOGY(`It’s like choosing a fishing spot. The famous lake everyone crowds around has been fished out — cast there and someone already caught your fish (a “duplicate”). A big, quieter, less-known lake (a wide-scope, lower-competition program) still has fish waiting, which is exactly where a newcomer should start.`) +
    KEYTERMS([
      ['Platform', 'A site hosting many programs (HackerOne, Bugcrowd, Intigriti, YesWeHack).'],
      ['Self-hosted VRP', 'A company running its own program directly (Google, Microsoft, Apple…), often highest payouts.'],
      ['Scope size', 'Wide (many assets — good for recon and beginners) vs narrow (one app — rewards deep knowledge).'],
      ['Signal', 'Your ratio of valid to invalid reports — platforms track it.'],
      ['Reputation', 'Points from valid reports; high reputation + signal → private invites.'],
      ['Private invite', 'Invitation-only programs with far less competition and often better pay.'],
      ['Bounty table', 'The program’s published reward ranges by severity.']])]],
  [['Recap', RECAP([
    `Platforms list companies’ programs; some big firms run their own <b>self-hosted VRPs</b>.`,
    `Pick a <b>wide-scope, lower-competition</b> program and go <b>deep</b> — depth on one target beats a day each on ten.`,
    `Check the program’s <b>response metrics</b> and read recent public reports (e.g. HackerOne Hacktivity) to learn what it accepts.`,
    `<b>Signal</b> (valid-to-invalid ratio) and <b>reputation</b> are your real assets — they unlock low-competition <b>private invites</b>.`,
    `Avoid the biggest, most famous programs at first — they’re picked over, so expect heavy duplicates.`])]]);

SDWRAP('bb-os',
  [['Start here (in plain words)',
    PLAIN(`You do <b>not</b> need a special “hacker” operating system. Any computer that can run a browser, an intercepting proxy, and some command-line tools can do bug bounty. The right setup just saves you hours — it doesn’t grant powers.`) +
    ANALOGY(`It’s like a mechanic’s toolbox. A fancy branded box (Kali/Parrot) arrives pre-filled with tools, which is convenient; a plain box you stock yourself (a clean Ubuntu, macOS, or Windows) works just as well. What fixes the car is the tools inside and knowing how to use them — not the box they came in.`) +
    KEYTERMS([
      ['Kali / Parrot', 'Linux distros with security tools preinstalled — convenient but heavy.'],
      ['Plain Linux / macOS / WSL2', 'A normal OS where you install only what you need; all are fine for hunting.'],
      ['VM & snapshot', 'A virtual machine isolates testing and lets you reset to a clean state.'],
      ['VPS', 'A cheap cloud server to run long recon/monitoring 24/7 off your laptop.'],
      ['Go & Python', 'The two runtimes most modern tools need installed.'],
      ['Hunting profile', 'A separate browser profile/VM so testing never mixes with your personal accounts.']])]],
  [['Recap', RECAP([
    `No special OS is required — <b>the tools matter more than the distro</b>; Kali, plain Linux, macOS, or Windows+WSL2 all work.`,
    `Kali/Parrot are convenient (preinstalled tools); many pros prefer a clean base and install current versions themselves.`,
    `Install the runtimes first (<b>Go</b> and <b>Python</b>), then your proxy, CLI tools, and SecLists wordlists.`,
    `A cheap <b>VPS</b> is worth it for 24/7 recon/monitoring and a stable, allowlistable IP (not for anonymity).`,
    `Hunt from a <b>separate browser profile or VM</b>, take snapshots, and treat downloaded scripts as untrusted.`])]]);

SDWRAP('bb-toolkit',
  [['Start here (in plain words)',
    PLAIN(`This topic is a <b>menu</b> of the tools a web hunter uses, grouped by the job each one does. You won’t use them all at once, and you shouldn’t try to — the goal is to learn a handful deeply, adding more only when a real need appears.`) +
    ANALOGY(`Think of a professional kitchen with stations: one knife for chopping, a different set for prep, another for plating. A cook who truly knows three tools turns out great food; one who owns thirty gadgets and fumbles each of them does not. Your <b>proxy</b> is the chef’s knife here — the one you’ll reach for constantly.`) +
    KEYTERMS([
      ['Intercepting proxy', 'Burp Suite or Caido — the core tool for reading and editing requests.'],
      ['ProjectDiscovery suite', 'A set of fast Go tools: subfinder, httpx, nuclei, katana, dnsx, naabu.'],
      ['Content discovery / fuzzing', 'ffuf, feroxbuster — brute-force hidden paths and files.'],
      ['nuclei', 'Templated scanner for known issues (CVEs, misconfigs, exposures) — a fast first pass.'],
      ['SecLists', 'The standard collection of wordlists the other tools reference.'],
      ['Pipeline', 'Chaining tools so each one’s output feeds the next (subfinder → httpx → katana → nuclei).']])]],
  [['Recap', RECAP([
    `The toolkit is a <b>menu by job</b>; learn a few tools deeply rather than collecting all of them.`,
    `Your <b>intercepting proxy</b> (Burp or Caido) is the core tool used in nearly every manual test.`,
    `The <b>ProjectDiscovery suite</b> covers recon (subdomains, probing, crawling, templated scanning); <b>ffuf/feroxbuster</b> do content discovery.`,
    `Install <b>runtimes first</b> (Go, Python), script your installs, and clone <b>SecLists</b> once.`,
    `Treat install scripts and community templates as untrusted code — <b>review before running</b> them with your privileges.`])]]);

SDWRAP('bb-burp',
  [['Start here (in plain words)',
    PLAIN(`An <b>intercepting proxy</b> (Burp Suite or Caido) sits between your browser and the target website, so you can see — and rewrite — every request your browser sends. Mastering it is the single highest-leverage skill in web hunting, because it’s how you actually probe an application by hand.`) +
    ANALOGY(`Picture an old telephone switchboard operator who can listen to and edit every message passing through before it continues on. That’s your proxy: your browser’s requests pass through it, you can pause one, change a value (an ID, a price, a parameter), and send it on to see how the server reacts. Most bugs are found exactly this way.`) +
    KEYTERMS([
      ['Proxy / intercept', 'Viewing and optionally pausing/modifying live requests; history logs them all.'],
      ['Repeater', 'Resend and tweak one request by hand — the main manual-testing tab.'],
      ['Intruder', 'Automate sending many payloads/values to a request (fuzzing, ID enumeration).'],
      ['Target & scope', 'A map of what you’ve touched; set scope so tools never hit out-of-scope hosts.'],
      ['CA certificate', 'Installed in the browser so Burp can read HTTPS traffic without errors.'],
      ['Collaborator', 'A server that catches out-of-band callbacks, proving blind bugs (blind SSRF/XSS).'],
      ['Match & Replace', 'Auto-rewrite requests, e.g. to inject your identifying bounty header.']])]],
  [['Recap', RECAP([
    `An intercepting proxy lets you read and rewrite every request between your browser and the target — the core manual skill.`,
    `<b>Set scope first</b> and restrict tools to in-scope items, so you never accidentally test out of scope.`,
    `The everyday loop: browse the whole app → spot an interesting request in history → <b>Repeater</b> to tweak and resend → confirm the bug.`,
    `<b>Intruder</b> scales a request across many values; <b>Collaborator</b> catches blind/out-of-band bugs; extensions like <b>Autorize</b> find IDOR.`,
    `Caido works the same way with different names (Replay/Automate); learn the concepts and either tool transfers.`])]]);
