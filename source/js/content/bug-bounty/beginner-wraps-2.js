/* ===== Beginner-first wraps — Bug Bounty batch 2 (reconnaissance). ===== */

SDWRAP('bb-recon-passive',
  [['Start here (in plain words)',
    PLAIN(`<b>Recon</b> (reconnaissance) is mapping out everything a target owns before you test it. <b>Passive</b> recon gathers that map from <i>third parties</i> — certificate logs, DNS records, search engines, code repositories, internet-scan databases — <b>without sending a single request to the target itself</b>. It’s low-risk, often fine to do even before you formally engage, and it reveals the real attack surface.`) +
    ANALOGY(`It’s like researching a building from public records before ever walking over: you check the property registry, old photos, the phone book, planning filings. You learn the layout, the owners, and the side entrances — all from information other people already published, never once touching the building or tipping anyone off.`) +
    KEYTERMS([
      ['Attack surface', 'Everything an organisation exposes that you could test — all its domains, subdomains, IPs, and services.'],
      ['Certificate transparency (crt.sh)', 'Public logs of every TLS certificate issued — a goldmine of subdomain names.'],
      ['Shodan / Censys', 'Search engines of internet-wide scans: what ports/services/banners a host exposes.'],
      ['GitHub dorking', 'Searching public code for leaked secrets, internal URLs, and API keys.'],
      ['Google dorks', 'Advanced search operators (site:, inurl:, filetype:) to surface exposed pages/files.'],
      ['ASN', 'An organisation’s registered block of IP addresses — maps its owned ranges.']])]],
  [['Recap', RECAP([
    `Passive recon builds the target’s map from <b>third-party sources</b>, sending no traffic to the target.`,
    `Key sources: <b>certificate logs</b> (crt.sh), DNS history, <b>Shodan/Censys</b>, <b>GitHub</b> code search, and <b>Google dorks</b>.`,
    `The goal is to enumerate the org’s true <b>attack surface</b> — all its domains, subdomains, and IP ranges.`,
    `It’s low-risk and often allowed even before engaging, because you never touch the target.`,
    `Passive recon builds the map that active recon then fills in.`])]]);

SDWRAP('bb-subdomains',
  [['Start here (in plain words)',
    PLAIN(`On a wildcard scope (<code>*.example.com</code>), your real attack surface is the set of <b>live subdomains</b> — and most hunters only ever look at the obvious ones (www, app). Combining passive sources, DNS brute-forcing, and name permutations, then resolving and probing what you find, consistently surfaces hosts others miss. This is where recon skill turns directly into bugs.`) +
    ANALOGY(`A big company isn’t one front door — it’s a sprawling complex with loading docks, side entrances, an old annex, and a forgotten staff door round the back (<code>dev-</code>, <code>staging-</code>, <code>api2-</code>). Everyone tries the main entrance; the bugs are often behind the neglected side doors nobody else bothered to find.`) +
    KEYTERMS([
      ['Subdomain enumeration', 'Discovering all the subdomains under a domain (app.example.com, dev.example.com…).'],
      ['Passive vs brute force', 'Pull known names from sources (subfinder) vs guess names against DNS (puredns + a wordlist).'],
      ['Permutation (alterx/dnsgen)', 'Generating likely variants (api → api2, dev-api) to brute-force.'],
      ['Resolve (dnsx)', 'Checking which guessed names actually exist in DNS.'],
      ['Probe (httpx)', 'Of the ones that exist, which serve a website — and what it looks like.'],
      ['Wildcard DNS', 'When *.example.com resolves everything, so you must filter out the noise.']])]],
  [['Recap', RECAP([
    `On a wildcard scope, your surface is the set of <b>live subdomains</b> — most hunters stop at the obvious ones.`,
    `Combine <b>passive aggregation</b> (subfinder), <b>DNS brute force + permutations</b> (puredns, alterx), then <b>resolve</b> (dnsx) and <b>probe</b> (httpx).`,
    `Filter out <b>wildcard DNS</b> noise and use trusted resolvers so results are real.`,
    `Recursively enumerate sub-subdomains of interesting hosts.`,
    `Diffing subdomains over time reveals <b>fresh surface</b> — the basis of continuous monitoring.`])]]);

SDWRAP('bb-probe',
  [['Start here (in plain words)',
    PLAIN(`Once you have a list of live hosts, you need to quickly learn <b>what runs on each</b> and spot the interesting ones. Probing profiles the web services (what server, what technology, what status), finds open <b>ports</b> and non-web services, and takes <b>screenshots</b> so you can eyeball hundreds of hosts in minutes to find login panels, dashboards, and oddities.`) +
    ANALOGY(`You’ve got a list of addresses; now you walk down the street knocking. Some doors answer (200 OK), some are locked with a “staff only” sign (401/403 — often the <i>interesting</i> ones), some are boarded up (5xx). And instead of standing at each door, you snap a quick photo of every one, then flip through the photos to spot the unlocked back office everyone forgot about.`) +
    KEYTERMS([
      ['Probing', 'Checking which hosts are alive and profiling what they run.'],
      ['httpx', 'Reports which hosts serve HTTP(S), on which ports, with what technology and status.'],
      ['Port scan (naabu/nmap)', 'Finding open ports and the services behind them (non-web services may be in scope).'],
      ['Screenshotting (gowitness)', 'Capturing images of many hosts so you can scan them visually.'],
      ['Status codes', '200 = live, 401/403 = protected (interesting!), 5xx = broken.'],
      ['Non-standard ports', '8080, 8443, 3000, 9000 often host dev/admin apps worth a look.']])]],
  [['Recap', RECAP([
    `Probing turns a host list into “what runs where, and which hosts are interesting”.`,
    `<b>httpx</b> profiles web services (ports, tech, status); <b>naabu/nmap</b> find open ports and non-web services.`,
    `<b>Screenshot</b> everything (gowitness) to eyeball hundreds of hosts fast for panels and dashboards.`,
    `Pay attention to <b>401/403</b> (protected = interesting) and <b>non-standard ports</b> (dev/admin apps).`,
    `This narrows a big host list down to the few worth testing by hand.`])]]);

SDWRAP('bb-content',
  [['Start here (in plain words)',
    PLAIN(`A website’s visible links are only a fraction of its real surface. <b>Content discovery</b> finds the hidden parts — admin paths, forgotten backup files, old API endpoints, debug routes, and unlinked parameters — by crawling the app, harvesting historical URLs, brute-forcing paths from wordlists, and discovering parameters an endpoint secretly accepts. This is where the endpoints that actually <i>have</i> the bugs tend to live.`) +
    ANALOGY(`The public map of a building shows the lobby and meeting rooms. Content discovery is walking every corridor trying every door — including the unmarked ones — and checking the archives for rooms that used to exist. The unlocked server room or the old file cabinet left in a back hallway (a <code>backup.zip</code>, a <code>/admin</code> route) is exactly what the public map never showed.`) +
    KEYTERMS([
      ['Content discovery', 'Finding paths, files, and endpoints that aren’t linked from the visible site.'],
      ['Crawling (katana)', 'Following every link and form in the live app, including JS-rendered ones.'],
      ['Historical URLs (gau/waybackurls)', 'Pulling old URLs and parameters from web archives.'],
      ['Fuzzing (ffuf/feroxbuster)', 'Brute-forcing paths/files from a wordlist to find hidden ones.'],
      ['Wordlist (SecLists)', 'Lists of common paths/filenames the fuzzer tries (raft-*, api-endpoints, backups).'],
      ['Parameter discovery (arjun)', 'Finding query/body parameters an endpoint accepts but doesn’t advertise.']])]],
  [['Recap', RECAP([
    `Visible links are a fraction of the surface; content discovery finds the <b>hidden</b> paths, files, and parameters.`,
    `Four techniques: <b>crawl</b> (katana), <b>harvest historical URLs</b> (gau/waybackurls), <b>fuzz paths/files</b> (ffuf/feroxbuster), and <b>discover parameters</b> (arjun/Param Miner).`,
    `Use good <b>wordlists</b> (SecLists) and fuzz interesting <b>extensions</b> (.bak, .old, .zip, .config).`,
    `<b>Recurse</b> into discovered directories and <b>filter</b> results by status/size to cut noise.`,
    `Hidden endpoints (old APIs, debug routes, backups) are where many real bugs are found.`])]]);

SDWRAP('bb-js',
  [['Start here (in plain words)',
    PLAIN(`Modern web apps ship their front-end logic to your browser as <b>JavaScript</b> — and that JavaScript routinely leaks a map of API endpoints, parameter names, hidden features, and sometimes even credentials. Mining JS files is one of the most productive and <i>least crowded</i> recon skills, because most hunters never bother to read it.`) +
    ANALOGY(`It’s as if, to use the building, you were handed a copy of its <b>blueprints</b> — every room, every service corridor, the locations of the safes. The app <i>has</i> to send you its JavaScript to run the site, and in doing so it often reveals internal endpoints and occasionally the keys to them. You just have to actually read the blueprint everyone else throws away.`) +
    KEYTERMS([
      ['JavaScript analysis', 'Reading an app’s shipped JS to extract its hidden endpoints and secrets.'],
      ['Endpoint extraction (jsluice/LinkFinder)', 'Pulling URLs, API paths, and parameter names out of JS.'],
      ['Secret hunting (trufflehog/SecretFinder)', 'Scanning JS and repos for API keys and tokens.'],
      ['Source maps (.js.map)', 'Files that can reconstruct the original, readable source code.'],
      ['Beautify', 'Reformatting minified (compressed) JS so a human can read it.'],
      ['Hardcoded keys', 'Live third-party API keys left in JS — often high severity.']])]],
  [['Recap', RECAP([
    `Apps send their front-end logic as <b>JavaScript</b>, which leaks API endpoints, parameters, hidden features, and sometimes secrets.`,
    `<b>Extract endpoints</b> with jsluice/LinkFinder/katana, and <b>hunt secrets</b> with trufflehog/SecretFinder.`,
    `<b>Beautify</b> minified JS and look for <b>source maps</b> (.js.map) to read the original code.`,
    `Hardcoded <b>API base URLs</b> map your API attack surface; hardcoded <b>live keys</b> can be high-severity findings on their own.`,
    `It’s productive and uncrowded because most hunters skip reading JS.`])]]);

SDWRAP('bb-takeover',
  [['Start here (in plain words)',
    PLAIN(`Two high-return ways to finish recon. A <b>subdomain takeover</b> is when a subdomain’s DNS still points at a cloud service that’s been deleted — so <i>you</i> can register that service and control the subdomain. And running <b>nuclei</b> sweeps your whole list of hosts against thousands of templates for known CVEs, misconfigurations, and exposures. Both turn a plain host list into concrete, often serious findings.`) +
    ANALOGY(`A subdomain takeover is like finding a mailbox with the company’s name still on it, forwarding to an apartment they moved out of and never cancelled — so you rent that apartment and start receiving their mail. <b>nuclei</b> is the building inspector’s clipboard: a long checklist of known faults (bad wiring, missing smoke alarms) run quickly against every room, flagging the ones that need a closer look.`) +
    KEYTERMS([
      ['Subdomain takeover', 'Claiming a subdomain because its DNS points at an unclaimed/deleted service.'],
      ['Dangling CNAME', 'A DNS record still pointing to a deprovisioned cloud bucket/app you can register.'],
      ['Fingerprint', 'The tell-tale error page (“no such app/bucket”) that marks a host as claimable.'],
      ['nuclei', 'A YAML-template scanner that checks hosts for thousands of known issues.'],
      ['Templates', 'The checks nuclei runs, grouped as cves, misconfiguration, takeovers, exposures.'],
      ['Confirm manually', 'Always verify a nuclei hit by hand before reporting (false positives happen).']])]],
  [['Recap', RECAP([
    `Two high-ROI recon finishers: <b>subdomain takeover</b> detection and a <b>nuclei</b> sweep.`,
    `A takeover exploits a <b>dangling DNS record</b> pointing at a deleted service you can re-register (fingerprinted by its error page).`,
    `<b>nuclei</b> checks your whole surface against templated known issues — pick categories (cves, misconfiguration, takeovers, exposures) and filter by severity.`,
    `Respect program <b>rate limits</b> when scanning, and keep templates updated.`,
    `Always <b>manually confirm</b> a finding before reporting — scanners produce false positives.`])]]);
