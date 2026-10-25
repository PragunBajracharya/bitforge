/* ===== Bug bounty B: reconnaissance ===== */

BBT('bb-recon-passive', { name: 'Passive recon: mapping the target without touching it', cat: 'bbrecon',
  blurb: `Passive recon gathers information from third parties — certificate logs, DNS records, search engines, code repos, Shodan — without sending traffic to the target. It is low-risk, often allowed even before you engage, and it builds the map that active recon fills in. The goal: enumerate the organization's real attack surface.`,
  facts: [['Risk', 'low — you query third parties, not the target'], ['Finds', 'domains, subdomains, IP ranges, leaked secrets'], ['Key sources', 'crt.sh, subfinder sources, GitHub, Shodan'], ['Output', 'a list of candidate assets to verify']],
  cheat: [['ASN lookup', 'Find the org’s IP ranges (bgp.he.net, asnmap)'], ['crt.sh', 'Certificate transparency logs → subdomains'], ['subfinder', 'Aggregates 30+ passive sources for subdomains'], ['amass intel', 'Org → domains/ASNs; passive subdomain enum'], ['GitHub dorking', 'Search code for secrets, internal URLs, API keys'], ['Shodan / Censys', 'Internet-wide scan data: open ports, banners, certs'], ['Wayback / gau', 'Historical URLs and parameters'], ['Google dorks', 'site:, inurl:, filetype: to find exposed pages/files'], ['chaos', 'ProjectDiscovery’s public DNS dataset'], ['DNS history', 'SecurityTrails, DNSdumpster for old records']],
  sections: [
    ['Start from the organization, not just the domain', OL([`Find the org’s <b>ASN(s)</b> and IP ranges (what they own on the internet) with asnmap or bgp.he.net — but only test IPs the <b>scope</b> actually lists.`, `Find <b>root domains</b> the org owns (amass intel, crt.sh org search, reverse-whois) — many programs scope several apex domains.`, `For each in-scope root domain, pull <b>subdomains</b> from passive sources (subfinder, crt.sh, chaos).`, `Harvest <b>historical URLs</b> and parameters (gau, waybackurls) to see endpoints that may still exist.`, `Search <b>code and the web</b> (GitHub, Google dorks) for leaked secrets, internal hostnames and forgotten assets.`])],
    ['Certificate transparency — the richest free source', PP(`Every TLS certificate is logged publicly. Querying those logs reveals subdomains, including internal-looking ones, that nothing links to. crt.sh is the usual front end; subfinder also uses CT logs among its sources.`)],
    ['GitHub dorking for leaks', PP(`Developers accidentally commit API keys, internal URLs, and config. Search the org’s GitHub (and employees’) for strings like the domain name next to <code>api_key</code>, <code>password</code>, <code>secret</code>, <code>.env</code>, or internal subdomains. Finding a live key is often a high-severity report on its own — but validate exposure, do not use the key unless the scope allows it.`)],
    ['Shodan & Censys', UL([`They continuously scan the internet and index open ports, service banners, certificates and products.`, `Search by org, domain, certificate, or favicon hash to find hosts you would otherwise miss — old servers, forgotten panels, databases exposed to the internet.`, `A single Shodan query (e.g. an exposed admin panel or an unauthenticated database on an in-scope IP) can surface a serious finding.`])]
  ],
  snipTitle: 'Passive recon commands', snipNote: 'Only query third parties here; you are not yet sending traffic to the target.',
  snips: [['Subdomains (passive)', 'bash', `# aggregate 30+ passive sources (configure API keys in ~/.config/subfinder for best results)
subfinder -d example.com -all -silent -o subs_passive.txt

# certificate transparency directly from crt.sh
curl -s 'https://crt.sh/?q=%25.example.com&output=json' \\
  | jq -r '.[].name_value' | sed 's/\\*\\.//g' | sort -u >> subs_passive.txt

# ProjectDiscovery's public DNS dataset
chaos -d example.com -silent >> subs_passive.txt
sort -u subs_passive.txt -o subs_passive.txt`],
    ['Org, ASN & history', 'bash', `# IP ranges the org owns (test only in-scope IPs!)
asnmap -d example.com -silent

# root domains / ASNs tied to the org
amass intel -org "Example Inc" -timeout 5

# historical URLs & parameters from web archives
gau example.com | sort -u > urls_historical.txt
waybackurls example.com | sort -u >> urls_historical.txt`],
    ['GitHub & Google dorks', 'bash', `# GitHub (web UI or gh CLI) — look for leaks tied to the target:
#   "example.com" api_key        "example.com" password
#   org:ExampleInc filename:.env  "internal.example.com"

# Google dorks (run in the browser):
#   site:example.com -www            (find subdomains/paths)
#   site:example.com filetype:pdf    (exposed documents)
#   inurl:admin site:example.com     (admin panels)
#   intitle:"index of" site:example.com   (open directories)`]],
  edge: [`Passive is low-risk but GitHub secrets, Shodan hits and leaked data can tempt you out of scope — report exposure; do not log in or exfiltrate unless the policy allows.`, `crt.sh and passive sources return dead and wildcard entries; you must resolve them (next unit) before treating them as real.`, `ASN/IP enumeration finds ranges the org owns, but testing an IP still requires it to be in scope.`, `Old archived URLs may point to endpoints that were deliberately removed — confirm they are live and in scope before testing.`, `Employee personal repos are not the target’s assets; reporting a leak may still be valid, but tread carefully and do not pivot.`],
  faq: [['Why start with passive recon at all?', PP(`Because it is safe and comprehensive. Third-party datasets (CT logs, Shodan, archives, code search) reveal assets the org forgot it had — exactly where bugs hide with little competition — and you learn the surface before sending a single packet to the target.`)],
    ['How do I make subfinder find more?', PP(`Add API keys for its sources (SecurityTrails, Censys, Shodan, GitHub, VirusTotal, etc.) in its config file. Free-tier keys dramatically increase coverage. Run with <code>-all</code> to use every configured source.`)],
    ['Is GitHub dorking really that productive?', PP(`Yes — leaked credentials and internal hostnames are common and often high severity. Tools like trufflehog (next unit) automate scanning a repo’s history; manual dorking on the org and its employees catches the rest. Always validate the exposure and report rather than abuse the secret.`)]],
  qs: [SQ('Which source reveals subdomains by reading publicly logged TLS certificates?', ['Shodan', 'Certificate transparency (crt.sh)', 'nmap', 'ffuf'], 1, 'CT logs record every issued certificate, exposing the hostnames in them.'),
    SQ('You find a live AWS key in a public GitHub repo belonging to the target. Best action?', ['Use it to access their S3 to prove impact beyond doubt', 'Report the exposed key; do not use it unless the scope explicitly allows credential testing', 'Ignore it — keys are not bugs', 'Post it so they rotate it faster'], 1, 'Exposed secrets are valid findings; using them may be unauthorized access. Report responsibly.')]
});
DP('bb-recon-passive', {
  fu: [['What is an ASN and why look it up?', 'An Autonomous System Number identifies the IP ranges an organization announces on the internet. Mapping an org’s ASNs reveals netblocks (and hosts) that DNS alone would not — useful when IP ranges are in scope.'],
    ['How do you validate a crt.sh result?', 'Resolve it with dnsx/puredns; many CT entries are expired, internal-only or wildcards. Only hosts that resolve and respond are real attack surface.'],
    ['favicon hashing — what is it?', 'Many hosts share a favicon; its hash (e.g. via Shodan’s http.favicon.hash) can cluster an org’s infrastructure or find all instances of a particular product, including forgotten ones.']],
  deep: [['Technique', 'Reverse-whois and favicon/certificate pivoting find assets with no DNS link to the main domain — classic low-competition surface.'],
    ['Failure mode', 'Treating passive output as ground truth. CT logs and archives are full of dead, wildcard and third-party entries; resolve and verify before testing.'],
    ['In real workflows', 'subfinder (passive) → dnsx (resolve) → httpx (probe) is the standard funnel from "names someone saw once" to "live hosts I can test".']],
  src: ['OWASP WSTG: Information Gathering', 'https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/01-Information_Gathering/'] });

BBT('bb-subdomains', { name: 'Subdomain enumeration & resolution', cat: 'bbrecon',
  blurb: `On a wildcard scope, your attack surface is the set of live subdomains — and most hunters stop at the obvious ones. Combining passive sources, DNS brute force and permutation, then resolving and probing, consistently surfaces hosts others miss. This is where recon skill directly becomes bugs.`,
  facts: [['Passive', 'subfinder, amass, crt.sh, chaos'], ['Brute force', 'puredns + massdns + wordlist'], ['Permutations', 'alterx, dnsgen'], ['Resolve & probe', 'dnsx → httpx']],
  cheat: [['subfinder', 'Fast passive aggregation from many sources'], ['amass enum', 'Deeper passive + optional active; slower, thorough'], ['puredns', 'Mass DNS brute force + resolution with wildcard filtering'], ['dnsx', 'Resolve names, get A/CNAME, filter live ones'], ['alterx / dnsgen', 'Generate permutations (dev-, -staging, api2-) to brute'], ['httpx', 'Probe which resolved names serve HTTP(S) and how'], ['Wildcard DNS', '*.example.com resolves everything — must filter'], ['Trusted resolvers', 'Use a vetted resolver list to avoid poisoned results'], ['Recursive', 'Enumerate sub-subdomains of interesting hosts'], ['Diff over time', 'New subdomains = fresh surface for monitoring']],
  sections: [
    ['The enumeration funnel', OL([`<b>Collect names</b> from all passive sources (subfinder -all, amass, crt.sh, chaos).`, `<b>Brute force</b> more with a DNS wordlist via puredns/massdns against trusted resolvers.`, `<b>Permute</b> known names (api → api-dev, api2, staging-api) with alterx/dnsgen and brute those too.`, `<b>Resolve</b> the combined list with dnsx, filtering out wildcard noise, to keep only names that really exist.`, `<b>Probe</b> the survivors with httpx to see which serve web apps, on which ports, with which titles and technologies.`])],
    ['Handling wildcard DNS', PP(`Many domains return an answer for <i>any</i> subdomain (<code>anything.example.com</code> resolves). Naive brute force then reports thousands of fake hosts. puredns and dnsx detect the wildcard pattern and filter it, so you keep only genuinely distinct hosts. Always filter wildcards before trusting a brute-force list.`)],
    ['Why permutations find the good stuff', PP(`Internal and pre-production hosts follow naming patterns: <code>dev-</code>, <code>staging-</code>, <code>uat-</code>, <code>-internal</code>, <code>admin-</code>, numeric suffixes. Generating these from the names you already found, then resolving them, surfaces non-production environments that are often weakly protected — a rich, low-competition source of bugs (always confirm they are in scope).`)],
    ['From list to live targets', UL([`httpx tells you status code, title, technology, content length and redirects for each host.`, `Cluster by technology and title to spot the interesting ones (admin panels, dashboards, old frameworks).`, `Feed live hosts into content discovery, crawling and nuclei (next units).`, `Save the list; re-running enumeration later and diffing reveals <b>new</b> subdomains to test first.`])]
  ],
  snipTitle: 'Enumeration & resolution commands', snipNote: 'The funnel from names to live, probed hosts.',
  snips: [['Collect', 'bash', `# passive first
subfinder -d example.com -all -silent -o subs.txt
amass enum -passive -d example.com -silent >> subs.txt
# merge anything from crt.sh/chaos you gathered earlier
sort -u subs.txt -o subs.txt`],
    ['Brute force & permute', 'bash', `# DNS brute force with trusted resolvers + a subdomain wordlist
puredns bruteforce ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt example.com \\
  -r resolvers.txt -w subs_brute.txt

# permutations of names you already found, then resolve them
alterx -l subs.txt | puredns resolve -r resolvers.txt -w subs_perm.txt
cat subs.txt subs_brute.txt subs_perm.txt | sort -u > subs_all.txt`],
    ['Resolve & probe', 'bash', `# keep only names that really resolve (wildcards filtered)
dnsx -l subs_all.txt -silent -wd example.com -o subs_live.txt

# probe which serve web, with details
httpx -l subs_live.txt -silent -sc -title -td -cl -fr \\
  -o hosts_http.txt      # status, title, tech-detect, content-length, follow-redirects`]],
  edge: [`Skipping wildcard filtering fills your list with thousands of fake hosts and wastes every later step.`, `Brute forcing with public/poisoned resolvers gives false positives — use a vetted resolver list.`, `Permuted hosts (staging, dev) may be out of scope or shared infrastructure; confirm scope before testing them.`, `Aggressive DNS brute force is still traffic to resolvers and can be rate-limited; tune threads.`, `A host that resolves is not necessarily alive on HTTP — always probe with httpx before testing.`],
  faq: [['subfinder vs amass — which should I use?', PP(`Both. subfinder is fast and great for a quick, broad passive sweep. amass goes deeper (more sources, optional active enumeration, graph of relationships) but is slower. Run subfinder always; add amass when you want maximum coverage on a target you are committing to.`)],
    ['Do I really need DNS brute force if passive finds a lot?', PP(`Yes for thorough recon. Passive sources miss hosts that never appeared in a certificate, archive or dataset. Brute force with a good wordlist plus permutations of known names routinely finds dev/staging/internal hosts that passive enumeration never saw — and those are where competition is low.`)],
    ['What are "trusted resolvers"?', PP(`A curated list of DNS resolvers known to answer correctly and not inject/poison results. Mass DNS tools (puredns/massdns) query thousands of names per second across many resolvers; using a vetted list avoids false positives from misbehaving public resolvers.`)]],
  qs: [SQ('Why must you filter wildcard DNS before trusting brute-force results?', ['It speeds up httpx', 'Because *.example.com resolves every name, producing thousands of fake "hosts"', 'Wildcards are always out of scope', 'It hides your IP'], 1, 'Wildcard DNS answers any subdomain, so unfiltered brute force reports nonexistent hosts.'),
    SQ('What is the correct order of the enumeration funnel?', ['Probe → resolve → collect → brute', 'Collect → brute/permute → resolve → probe', 'Brute → probe → collect', 'Resolve → collect → probe'], 1, 'Gather names, expand them, resolve to real hosts, then probe which serve web apps.')]
});
DP('bb-subdomains', {
  fu: [['What does httpx tech-detect use?', 'It fingerprints responses (headers, body patterns, favicon hashes, known paths) against a Wappalyzer-style dataset to name the server, framework, CMS and libraries — telling you which hosts run old or interesting software.'],
    ['How do you monitor for new subdomains over time?', 'Re-run the funnel on a schedule, diff against the previous subs_live.txt, and alert (e.g. via notify to Slack/Discord) on anything new. New hosts are the least-tested and best to hit first.'],
    ['Active vs passive amass?', 'Passive only queries third-party sources. Active (amass enum -active, or with brute) sends DNS queries and can do zone walking and brute forcing — more coverage, more traffic, so mind scope and rate.']],
  deep: [['Technique', 'Recursive enumeration: once you find an interesting subdomain (e.g. an internal API gateway), enumerate its sub-subdomains too — layered infrastructure hides more surface.'],
    ['Failure mode', 'Trusting resolved-but-unprobed names, or testing permuted staging hosts without checking scope. Resolve, probe, then confirm scope.'],
    ['In real workflows', 'Continuous subdomain monitoring with notify is one of the highest-ROI automations: you are often first to a newly deployed, untested host.']],
  src: ['ProjectDiscovery: subfinder & dnsx docs', 'https://docs.projectdiscovery.io/tools/subfinder/overview'] });

BBT('bb-probe', { name: 'Probing hosts: ports, services & screenshots', cat: 'bbrecon',
  blurb: `Once you have live hosts, you need to know what runs on them and spot the interesting ones fast. httpx profiles web services; naabu/nmap find open ports and non-web services; screenshotting lets you eyeball hundreds of hosts in minutes to find login panels, dashboards and oddities.`,
  facts: [['Web profile', 'httpx (status, title, tech, length)'], ['Ports', 'naabu (fast) → nmap (detailed)'], ['Eyeball at scale', 'gowitness / aquatone screenshots'], ['Goal', 'find the few hosts worth deep testing']],
  cheat: [['httpx', 'Which hosts serve HTTP(S), on what ports, with what tech'], ['naabu', 'Fast SYN/CONNECT port scan to find open ports'], ['nmap -sV', 'Service/version detection on the ports naabu found'], ['masscan', 'Very fast internet-scale port scanning (use carefully)'], ['gowitness', 'Headless-Chrome screenshots of many URLs'], ['aquatone', 'Screenshots + HTML report clustering by similarity'], ['Favicon hash', 'Cluster hosts / identify products'], ['Status codes', '200 live, 401/403 protected (interesting!), 5xx broken'], ['Non-standard ports', '8080, 8443, 3000, 9000 often host dev/admin apps'], ['Virtual hosts', 'Same IP, many sites via Host header']],
  sections: [
    ['Profile web hosts with httpx', PP(`Run httpx over your live host list to capture, for each: status code, page title, detected technologies, content length, response time, final URL after redirects, and the ports it answers on (including 8080/8443 and friends). This single pass tells you which hosts to open first — a 200 with the title "Admin" or an old framework version is a lead.`)],
    ['Port scanning (when non-web is in scope)', OL([`Use <b>naabu</b> to quickly find open ports across in-scope hosts/IPs (it is fast and feeds nmap).`, `Pipe the open ports into <b>nmap -sV</b> for service and version detection on just those ports (far faster than scanning all 65k with nmap).`, `Investigate anything unusual: databases, message queues, admin services, old daemons — exposed non-web services are frequently serious findings.`, `Mind the rules: aggressive scanning may be rate-limited or disallowed; scan only in-scope targets at a sane rate.`])],
    ['Eyeball hundreds of hosts fast', PP(`Reading a list of 500 hosts tells you little; <i>seeing</i> them tells you a lot. gowitness or aquatone render each URL in headless Chrome and produce a gallery (aquatone clusters visually similar pages). In a few minutes you spot login portals, default install pages, dashboards, error pages leaking stack traces, and forgotten apps — your shortlist for manual testing.`)],
    ['Turning the profile into a plan', UL([`<b>401/403</b> hosts: protected — test for auth bypass, default creds, or an unprotected sibling endpoint.`, `<b>Old tech versions</b>: check for known CVEs (nuclei) and public exploits.`, `<b>Dev/staging/admin</b> titles: often weaker controls; high-value if in scope.`, `<b>Odd ports</b>: dev servers (3000), proxies (8080/8443), metrics (9090) — frequently overlooked.`])]
  ],
  snipTitle: 'Probing commands', snipNote: 'Profile, port-scan and screenshot your live hosts. Scan only in-scope targets, at a reasonable rate.',
  snips: [['httpx profile', 'bash', `httpx -l subs_live.txt -silent \\
  -sc -title -td -cl -location -rt \\
  -p 80,443,8080,8443,3000,8000,9000 \\
  -json -o httpx.json
# human-readable shortlist of protected/interesting hosts:
jq -r 'select(.status_code==401 or .status_code==403) | .url' httpx.json`],
    ['Ports (naabu → nmap)', 'bash', `# fast port discovery
naabu -l subs_live.txt -top-ports 1000 -silent -o ports.txt
# detailed service/version detection on just the open ports per host
nmap -sV -Pn -iL <(cut -d: -f1 ports.txt | sort -u) --top-ports 100 -oN nmap.txt`],
    ['Screenshots', 'bash', `# gowitness: screenshot every live URL into a gallery
gowitness scan file -f <(awk '{print $1}' hosts_http.txt) --screenshot-path shots/
# or aquatone (clusters visually similar pages, builds an HTML report)
cat hosts_http.txt | aquatone -out aquatone_report/`]],
  edge: [`Port scanning can breach a program’s rules or a VPS provider’s AUP, and high rates look like an attack — check both and throttle.`, `masscan at full speed can take down small services; use conservative rates and only in scope.`, `Headless-Chrome screenshotting sends real requests to every host — it is active recon, so stay in scope.`, `A 403 may be a WAF, not a real block; it is a lead, not a conclusion.`, `Version banners can be spoofed or stripped; confirm a suspected CVE carefully before reporting.`],
  faq: [['naabu or nmap — do I need both?', PP(`Use them together: naabu is a fast port <i>discoverer</i> (which ports are open across many hosts), nmap is a detailed <i>profiler</i> (what service and version runs on a port). Discover with naabu, then run nmap -sV only on the ports naabu found — far faster than nmap alone on all 65,535 ports.`)],
    ['Why screenshot instead of just reading httpx output?', PP(`Visual triage is dramatically faster for spotting the human-interesting hosts: login panels, admin dashboards, default/landing pages, stack-trace error pages. httpx gives you the data; screenshots give you the gestalt. Most hunters use both.`)],
    ['Is port scanning always allowed?', PP(`Not always. Some programs restrict or forbid port scanning, or limit the rate. Read the rules, scan only in-scope hosts/IPs, and keep rates modest. When web is the only thing in scope, focus httpx on web ports and skip broad port scans.`)]],
  qs: [SQ('What is the efficient way to combine naabu and nmap?', ['Run nmap on all ports, then naabu', 'naabu to find open ports fast, then nmap -sV only on those ports', 'They do the same thing; pick one', 'Use masscan instead of both always'], 1, 'Discover ports quickly with naabu, then deep-profile just those with nmap.'),
    SQ('Why take screenshots of hundreds of hosts?', ['To prove you visited them', 'To visually triage and quickly spot login panels, dashboards and odd pages worth testing', 'It is required by HackerOne', 'To bypass authentication'], 1, 'Visual triage surfaces the few interesting hosts far faster than reading raw data.')]
});
DP('bb-probe', {
  fu: [['How does httpx detect technology?', 'It matches response headers, cookies, body signatures, specific paths and favicon hashes against a fingerprint database (Wappalyzer-style), naming servers, frameworks, CMSs and libraries so you can target version-specific issues.'],
    ['What does -Pn do in nmap?', 'It skips host discovery (the ping) and treats the host as up, so nmap still scans hosts that drop ICMP — common on cloud/WAF-fronted targets.'],
    ['Why are non-standard ports interesting?', 'Dev servers (3000), alternate HTTP (8080/8443), metrics/admin (9090, 15672, 9000) often run less-hardened apps with weaker auth than the main site — and fewer hunters look there.']],
  deep: [['Technique', 'Pipe everything: subfinder | dnsx | httpx -json | jq … keeps a single, filterable record of the whole surface; screenshots turn it into a visual shortlist.'],
    ['Failure mode', 'Aggressive scanning that trips rate limits/WAFs or violates an AUP — turning recon into a ban. Throttle and stay in scope.'],
    ['In real workflows', 'The "interesting host" shortlist (401/403, old tech, dev/admin titles, odd ports) is where manual testing and nuclei get pointed next.']],
  src: ['Nmap reference guide', 'https://nmap.org/book/man.html'] });

BBT('bb-content', { name: 'Content discovery: endpoints, files & parameters', cat: 'bbrecon',
  blurb: `A host’s visible links are a fraction of its real surface. Content discovery finds the hidden parts — admin paths, backup files, old API endpoints, debug routes — by crawling, harvesting historical URLs, brute-forcing paths, and discovering unlinked parameters. This is where you find the endpoints that actually have the bugs.`,
  facts: [['Crawl live app', 'katana, hakrawler'], ['Historical URLs', 'gau, waybackurls'], ['Brute paths/files', 'ffuf, feroxbuster'], ['Hidden params', 'arjun, x8, Param Miner']],
  cheat: [['katana', 'Crawl the live app, including JS-rendered links and forms'], ['gau / waybackurls', 'Pull historical URLs & params from web archives'], ['ffuf', 'Fast fuzzer: brute paths, files, vhosts, params'], ['feroxbuster', 'Recursive content discovery, fast and ergonomic'], ['Wordlists', 'SecLists raft-*, api-endpoints, common backups'], ['Extensions', 'Fuzz with .bak, .old, .zip, .json, .config, ~'], ['arjun / x8', 'Discover parameters an endpoint secretly accepts'], ['Param Miner', 'Burp: find hidden params & headers (cache poisoning)'], ['Recursion', 'Re-fuzz discovered directories for deeper paths'], ['Filter', 'By status, size, words, lines to cut noise']],
  sections: [
    ['Four complementary techniques', TBL(['Technique', 'Tool', 'Finds'], [['Crawl the live app', 'katana, hakrawler', 'Linked pages, forms, JS endpoints that exist now'], ['Harvest history', 'gau, waybackurls', 'Old/forgotten endpoints and parameters that may still work'], ['Brute force paths/files', 'ffuf, feroxbuster', 'Unlinked admin panels, debug routes, backups, configs'], ['Discover parameters', 'arjun, x8, Param Miner', 'Hidden inputs that expand an endpoint’s attack surface']]) + PP(`Use all four: each finds surface the others miss.`)],
    ['Directory & file brute forcing with ffuf', OL([`Pick a wordlist (start with SecLists <code>raft-large-directories.txt</code>; add <code>api-endpoints.txt</code> for APIs).`, `Point <code>FUZZ</code> at the path: <code>https://target/FUZZ</code>.`, `<b>Filter noise</b> by response size/words/status — a host that returns 200 for everything needs <code>-fs</code>/<code>-fc</code> filters or a calibration (<code>-ac</code>).`, `Add <b>extensions</b> (<code>-e .bak,.old,.zip,.json,.config</code>) to catch backups and configs.`, `<b>Recurse</b> into directories you find (feroxbuster does this natively) to reach deeper paths.`])],
    ['Historical URLs are gold', PP(`gau and waybackurls pull every URL third-party archives ever recorded for a host — including endpoints the developers removed from the UI but left running, and URLs with juicy parameters (<code>?redirect=</code>, <code>?file=</code>, <code>?id=</code>, <code>?url=</code>). Filtering these for interesting parameters is one of the fastest routes to SSRF, open redirect, IDOR and LFI leads.`)],
    ['Finding hidden parameters', PP(`Endpoints often accept parameters that appear nowhere in the UI or docs — <code>debug=true</code>, <code>admin=1</code>, <code>?id=</code> on a page that normally uses the session. arjun and x8 send candidate parameter names and detect which change the response; Burp’s Param Miner does the same, including hidden <i>headers</i>. New parameters mean new attack surface for injection, access-control and logic bugs.`)]
  ],
  snipTitle: 'Content discovery commands', snipNote: 'Crawl, harvest, brute-force and parameter-mine. Keep rates reasonable and in scope.',
  snips: [['Crawl & harvest', 'bash', `# crawl the live app (follows JS, forms); keep in-scope only
katana -u https://app.example.com -jc -kf all -d 3 -silent -o katana_urls.txt
# historical URLs from archives
gau app.example.com | sort -u > gau_urls.txt
waybackurls app.example.com | sort -u >> gau_urls.txt
# interesting parameters only
cat gau_urls.txt | grep -Ei '(\\?|&)(url|redirect|next|file|path|id|user|cmd)=' | sort -u`],
    ['Brute force (ffuf)', 'bash', `WL=~/tools/SecLists/Discovery/Web-Content/raft-large-directories.txt
ffuf -u https://app.example.com/FUZZ -w $WL \\
  -e .bak,.old,.zip,.json,.config,.txt \\
  -ac -mc 200,204,301,302,401,403 -o ffuf.json -of json
# -ac auto-calibrates to filter soft-404 noise; -mc = match these codes`],
    ['Recursive & parameters', 'bash', `# feroxbuster: recursive content discovery
feroxbuster -u https://app.example.com \\
  -w ~/tools/SecLists/Discovery/Web-Content/raft-large-directories.txt \\
  -x bak,old,zip,json -d 2 -o ferox.txt
# discover hidden parameters an endpoint accepts
arjun -u https://app.example.com/api/user -m GET
x8 -u https://app.example.com/profile -w ~/tools/SecLists/Discovery/Web-Content/burp-parameter-names.txt`]],
  edge: [`Many apps return 200 for every path (soft 404s); without size/word filtering or calibration, ffuf reports everything. Always calibrate (<code>-ac</code>) or filter.`, `Brute forcing is noisy, high-volume traffic — respect rate limits and the program’s automation rules.`, `Historical URLs may point to removed or out-of-scope endpoints; confirm they are live and in scope.`, `A discovered admin path still needs authorization to test; finding it is not a bug by itself unless it is accessible.`, `Fuzzing for backups (<code>.zip</code>, <code>.sql</code>) can download large files; be considerate and don’t exfiltrate real data.`],
  faq: [['ffuf or feroxbuster?', PP(`Both do content discovery well. ffuf is a flexible general fuzzer (paths, params, vhosts, data) with powerful filtering; feroxbuster is ergonomic and recurses automatically. Many use feroxbuster for quick recursive sweeps and ffuf when they need fine-grained control or to fuzz parameters/vhosts. Learn ffuf deeply — it does the most.`)],
    ['Why harvest historical URLs if I can crawl the live site?', PP(`Crawling finds what exists and is linked now; archives reveal endpoints that were removed from the UI but may still be live, plus old parameters. Forgotten endpoints are weakly maintained and a prime source of bugs — the two techniques are complementary.`)],
    ['How do hidden parameters lead to bugs?', PP(`They expand attack surface invisibly. A <code>debug</code> or <code>admin</code> parameter can unlock functionality; an undocumented <code>id</code> or <code>url</code> parameter can enable IDOR, SSRF or injection. Tools like arjun/x8/Param Miner reveal inputs the UI never shows, which is exactly where developers forgot to add checks.`)]],
  qs: [SQ('An ffuf run reports that almost every path returns 200. What is wrong and the fix?', ['The target is fully vulnerable; report all', 'Soft 404s — calibrate with -ac or filter by size/words (-fs/-fw)', 'ffuf is broken; reinstall', 'Use a smaller wordlist only'], 1, 'Apps that return 200 for unknown paths need calibration/filtering to separate real hits from noise.'),
    SQ('Which technique most directly surfaces old, forgotten endpoints that still work?', ['Port scanning', 'Harvesting historical URLs with gau/waybackurls', 'Screenshotting', 'Subdomain brute force'], 1, 'Web archives record endpoints that were removed from the UI but may still be live.')]
});
DP('bb-content', {
  fu: [['How do you pick the right wordlist?', 'Match it to the target: raft-* for general web, api-endpoints/common-api for APIs, technology-specific lists (e.g. for a detected CMS), and backup/extension lists for files. Bigger is not always better — a focused list finds more with less noise.'],
    ['What is a “soft 404”?', 'An app returning HTTP 200 with a "not found" page instead of a real 404. It defeats status-code filtering, so you filter by response size/words/lines or let ffuf auto-calibrate (-ac) against a known-bad path.'],
    ['Why fuzz for hidden headers, not just parameters?', 'Apps and caches trust certain headers (X-Forwarded-For, X-Original-URL, X-Rewrite-URL). Hidden-header discovery (Param Miner) finds these, enabling cache poisoning, access-control bypass and host-header attacks.']],
  deep: [['Technique', 'Chain it: katana + gau → extract parameters → feed to arjun/x8 and to your injection tests. Endpoints with interesting params are where you spend manual time.'],
    ['Failure mode', 'Blind brute forcing without filtering or scope control — huge noise, wasted time, and possible out-of-scope hits.'],
    ['In real workflows', 'Parameter discovery on a crawled endpoint list is a repeatable edge: the unlinked debug/admin/url params you surface are exactly where access-control and injection bugs live.']],
  src: ['OWASP WSTG: Review Webpage Content & Enumerate Resources', 'https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/01-Information_Gathering/'] });

BBT('bb-js', { name: 'JavaScript analysis & secret hunting', cat: 'bbrecon',
  blurb: `Modern apps ship their front-end logic to you as JavaScript — and that JS leaks API endpoints, parameter names, hidden features, and sometimes credentials. Mining JS files is one of the most productive and least-crowded recon skills. This page covers extracting endpoints and secrets from JS and from code repos.`,
  facts: [['Endpoints in JS', 'LinkFinder, jsluice, katana -jc'], ['Secrets in JS/code', 'trufflehog, SecretFinder'], ['Why', 'JS reveals the API the UI hides'], ['Watch for', 'keys, internal URLs, feature flags']],
  cheat: [['katana -jc', 'Crawl and parse JS to extract endpoints'], ['LinkFinder', 'Regex endpoints out of JS files'], ['jsluice', 'Parse JS (AST) for URLs, paths, secrets — low false positives'], ['SecretFinder', 'Regex for API keys/tokens in JS'], ['trufflehog', 'Scan repos/files/JS for verified secrets'], ['Source maps', '.js.map can reconstruct original source'], ['Beautify', 'Prettify minified JS to read it'], ['API base URLs', 'Often hardcoded — your API attack surface'], ['Feature flags', 'Hidden/admin features toggled in JS'], ['Hardcoded keys', 'Sometimes live third-party API keys (high severity)']],
  sections: [
    ['Why JavaScript is a goldmine', PP(`Single-page apps and mobile backends expose their API through JS that is served to every visitor. That JS routinely contains the full list of API endpoints (including admin/internal ones not in the UI), the parameter names they expect, base URLs for other services, feature flags, and — too often — hardcoded secrets. Reading it is like getting a partial API spec for free.`)],
    ['Extract endpoints from JS', OL([`Collect the app’s JS files (katana with <code>-jc</code>, or grep the crawl for <code>.js</code>).`, `Run <b>jsluice</b> (AST-based, accurate) and/or <b>LinkFinder</b> (regex) to pull URLs, paths and endpoints.`, `De-duplicate and look for <b>interesting</b> ones: <code>/api/admin</code>, <code>/internal</code>, <code>/debug</code>, versioned APIs, upload and export endpoints.`, `Feed discovered endpoints back into manual testing and parameter discovery.`])],
    ['Hunt secrets in JS and repos', PP(`Hardcoded secrets — third-party API keys (maps, payments, email), cloud credentials, JWT signing keys, internal tokens — show up in JS bundles and in public repos. <b>trufflehog</b> scans files, JS and entire git histories and can <i>verify</i> whether a found key is live. A verified live key is frequently a high- or critical-severity report. Report the exposure; do not use the key unless the scope explicitly permits credential testing.`)],
    ['Source maps: reading the original code', PP(`If a <code>.js.map</code> file is published (sometimes left on in production), tools can reconstruct the original, un-minified source — components, comments, even developer TODOs and endpoint lists. Always check for source maps next to minified bundles; they turn opaque JS into readable code and often reveal far more surface.`)]
  ],
  snipTitle: 'JS & secret-hunting commands', snipNote: 'Extract endpoints and scan for secrets. Report leaks; do not abuse any key you find.',
  snips: [['Collect & parse JS', 'bash', `# crawl and pull JS endpoints in one go
katana -u https://app.example.com -jc -silent | grep -Ei '\\.js(\\?|$)' | sort -u > js_files.txt

# AST-based endpoint/secret extraction (accurate)
cat js_files.txt | while read u; do curl -s "$u" | jsluice urls; done | sort -u > js_endpoints.txt

# regex-based endpoint extraction
python3 LinkFinder.py -i https://app.example.com/main.js -o cli`],
    ['Scan for secrets', 'bash', `# scan a downloaded JS file / directory for verified secrets
trufflehog filesystem ./js_files/ --only-verified

# scan a public git repo history end to end
trufflehog git https://github.com/ExampleInc/some-repo --only-verified

# regex key finder in JS
python3 SecretFinder.py -i https://app.example.com/main.js -o cli`],
    ['Source maps', 'bash', `# if a source map exists, reconstruct the original source
curl -s https://app.example.com/main.js.map -o main.js.map
npx source-map-explorer main.js main.js.map   # or a dedicated unpacker
# then read components, comments and endpoint lists in the restored source`]],
  edge: [`A found key is a finding to report, not a tool to use — logging in or calling an API with it may be unauthorized access.`, `Some "secrets" in client JS are meant to be public (e.g. a Google Maps browser key restricted by referrer); verify it is actually sensitive and exploitable before reporting.`, `Scanning a company’s or employee’s private repos you are not authorized to access is itself a violation — stick to public repos and in-scope assets.`, `Minified JS changes with every deploy; re-pull when monitoring, and diff for new endpoints.`, `trufflehog --only-verified reduces noise but still confirm the key’s scope and impact before reporting severity.`],
  faq: [['jsluice vs LinkFinder vs katana — which for endpoints?', PP(`katana <code>-jc</code> is great for a first broad pass (crawl + JS). jsluice parses JS with an AST, so it is accurate with few false positives and also surfaces secrets. LinkFinder is a classic regex extractor — fast and simple but noisier. Run katana + jsluice together for the best coverage-to-noise ratio.`)],
    ['How do I know if a leaked key is actually exploitable?', PP(`trufflehog’s <code>--only-verified</code> actively checks many key types against their service to confirm they are live. Even then, assess <i>what</i> the key can do (scope/permissions) to judge severity — a live key to a sensitive service is critical; a restricted, low-privilege one may be low. Report the exposure and let the program confirm impact; do not exercise the key yourself unless allowed.`)],
    ['What makes JS analysis "low competition"?', PP(`Many hunters run scanners and move on; fewer read the JS carefully. The endpoints, parameters and feature flags hidden in bundles — especially admin/internal routes — are often untested, so patient JS reading repeatedly finds original bugs.`)]],
  qs: [SQ('You find a hardcoded, verified live cloud credential in a production JS bundle. What is the right move?', ['Use it to enumerate their cloud to maximize the bounty', 'Report the exposed credential; do not use it unless credential testing is explicitly in scope', 'Ignore it — client-side keys are always public', 'Commit it to your notes repo'], 1, 'Exposed live credentials are valid, often high-severity findings; using them can be unauthorized access.'),
    SQ('Why mine JavaScript during recon?', ['To steal the site’s design', 'Because JS leaks API endpoints, parameters, feature flags and sometimes secrets the UI never shows', 'It is the only way to find subdomains', 'To improve page load speed'], 1, 'Front-end JS exposes much of the hidden API and configuration.')]
});
DP('bb-js', {
  fu: [['What is a JavaScript source map and why does it matter?', 'A .js.map maps minified code back to the original source. If left accessible in production, it lets you reconstruct readable components, comments and endpoint lists — a big recon win and sometimes a finding itself (information disclosure).'],
    ['How do you monitor JS for changes?', 'Periodically fetch key bundles, hash or diff them, and alert on changes; new code often means new endpoints or features to test first. Tools and simple scripts (plus notify) automate this.'],
    ['Are all keys in client JS reportable?', 'No. Some are designed to be public and are restricted server-side or by referrer (e.g. certain Maps/analytics keys). Confirm the key grants real, sensitive access before claiming severity.']],
  deep: [['Technique', 'AST-based parsing (jsluice) beats regex for both endpoints and secrets: it understands string concatenation and templates that regex misses, with fewer false positives.'],
    ['Failure mode', 'Treating every matched string as a secret, or using a found key to "prove" impact and crossing into unauthorized access.'],
    ['In real workflows', 'JS diffing on a monitored target routinely reveals new admin/internal endpoints hours after deploy — a repeatable first-mover advantage.']],
  src: ['jsluice (BishopFox) — extract URLs & secrets from JavaScript', 'https://github.com/BishopFox/jsluice'] });

BBT('bb-takeover', { name: 'Subdomain takeover & fingerprinting with nuclei', cat: 'bbrecon',
  blurb: `Two high-ROI recon finishers: detecting subdomain takeovers (a dangling DNS record pointing at an unclaimed service you can claim) and running nuclei to sweep your whole surface for known CVEs, misconfigurations and exposures. Both turn a host list into concrete, often-serious findings.`,
  facts: [['Takeover', 'dangling CNAME → claim the service'], ['Detect', 'nuclei takeover templates, subzy, dnsx CNAMEs'], ['Sweep', 'nuclei (CVEs, misconfig, exposures, default creds)'], ['Templates', 'community + your own']],
  cheat: [['Subdomain takeover', 'DNS points to a deprovisioned service you can register'], ['Dangling CNAME', 'sub.example.com → CNAME to a deleted cloud bucket/app'], ['Fingerprint', 'Error page says "no such app/bucket" → claimable'], ['nuclei', 'YAML-templated scanner for known issues'], ['-t templates', 'Choose categories: cves, misconfiguration, takeovers, exposures'], ['Severity filter', '-severity critical,high to triage output'], ['Rate limit', '-rl / -c to respect program limits'], ['False positives', 'Always manually confirm before reporting'], ['Custom templates', 'Write YAML for a specific target quirk'], ['Update', 'nuclei -update-templates regularly']],
  sections: [
    ['How subdomain takeover works', OL([`A company creates <code>shop.example.com</code> as a CNAME to a third-party service (e.g. a cloud app, CDN, or hosting platform).`, `Later they stop using the service and delete the app/bucket — <b>but forget to remove the DNS record</b>.`, `The DNS record now "dangles": it points at a service name nobody owns.`, `If you can <b>register that service name</b> on the provider, you now control what <code>shop.example.com</code> serves — a takeover. Impact ranges from defacement to cookie/credential theft on the parent domain.`, `<b>Proof of concept</b>: claim it and host a harmless file proving control (e.g. a page with your handle), then report. Do not serve anything malicious.`])],
    ['Detecting takeovers', PP(`Resolve your subdomains and look at their CNAMEs; a CNAME to a third-party service whose page returns a "not found / unclaimed" fingerprint is a candidate. nuclei’s takeover templates and tools like subzy automate the fingerprint match against dozens of providers. Always manually verify the service is truly claimable before attempting — some fingerprints are false positives.`)],
    ['Sweeping with nuclei', OL([`Feed your live, probed hosts (httpx output) into nuclei.`, `Run focused template sets: <code>takeovers</code>, <code>misconfiguration</code>, <code>exposures</code> (exposed .env/.git/configs), <code>default-logins</code>, and <code>cves</code> matching the technologies httpx detected.`, `<b>Filter by severity</b> (<code>-severity critical,high</code>) to triage the flood, and <b>respect rate limits</b> (<code>-rl</code>, <code>-c</code>).`, `<b>Manually confirm</b> every hit — nuclei finds candidates; you prove them before reporting.`])],
    ['Writing a custom template', PP(`nuclei templates are simple YAML: a request, and matchers (status, words, regex) that define a hit. When you find a quirk specific to your target — a particular error string, an endpoint that leaks a header — write a small template so your monitoring catches it everywhere and on every new host. This scales a one-off finding into continuous coverage.`)]
  ],
  snipTitle: 'Takeover & nuclei commands', snipNote: 'Detect dangling records and sweep for known issues. Confirm every hit before reporting.',
  snips: [['Detect takeover', 'bash', `# list CNAMEs to eyeball for third-party services
dnsx -l subs_live.txt -cname -resp -silent

# automated takeover fingerprinting
nuclei -l hosts_http.txt -t http/takeovers/ -silent
subzy run --targets subs_live.txt            # alternative fingerprinter`],
    ['nuclei sweep', 'bash', `# focused, severity-filtered, rate-limited sweep of live hosts
nuclei -l hosts_http.txt -silent \\
  -t http/exposures/ -t http/misconfiguration/ -t http/default-logins/ -t http/cves/ \\
  -severity critical,high,medium \\
  -rl 50 -c 25 \\
  -o nuclei_hits.txt
nuclei -update-templates    # keep detections current`],
    ['Custom template', 'yaml', `id: example-debug-endpoint
info:
  name: Example debug endpoint exposed
  author: yourhandle
  severity: high
http:
  - method: GET
    path:
      - "{{BaseURL}}/internal/debug"
    matchers-condition: and
    matchers:
      - type: word
        words: ["debug_token", "stacktrace"]
      - type: status
        status: [200]`]],
  edge: [`A takeover PoC must be harmless: claim the resource and host a plain proof page (your handle), never malicious content, and release it after reporting.`, `Some takeover fingerprints are false positives (the provider shows a generic error but the name is not actually claimable) — verify before attempting.`, `nuclei can be loud; use <code>-rl</code>/<code>-c</code> to respect rate limits and avoid DoS-like traffic.`, `Community templates are third-party code; review unfamiliar ones before running against a live target.`, `Every nuclei hit is a candidate — a reported false positive hurts your signal. Confirm manually.`],
  faq: [['How do I prove a subdomain takeover without doing harm?', PP(`Claim the dangling resource on the provider and host a minimal, clearly-benign proof — a plain page containing your bug-bounty handle and the report reference. Screenshot it resolving on the target subdomain. Do not serve phishing, collect cookies, or keep the resource longer than needed. Then report and relinquish it.`)],
    ['Is nuclei going to find the big bugs for me?', PP(`It finds <i>known</i> issues: CVEs, exposed files (.env, .git), default logins, misconfigurations, takeover candidates. Those can absolutely be high severity and are worth sweeping for. But the lucrative logic and access-control bugs are manual. Use nuclei to clear and prioritize; test the interesting hosts by hand.`)],
    ['Should I write my own templates?', PP(`Once you spot a target-specific pattern, yes. A custom template turns a single observation into continuous, automated coverage across every current and future host — a core part of effective monitoring. Templates are easy YAML; start by copying a similar community one.`)]],
  qs: [SQ('What causes a subdomain takeover?', ['A weak password on the subdomain', 'A DNS record still pointing to a third-party service that has been deprovisioned and can be re-registered', 'An expired TLS certificate', 'Too many subdomains'], 1, 'A dangling DNS record to an unclaimed service lets an attacker claim it and control the subdomain.'),
    SQ('What should you always do with a nuclei hit before reporting it?', ['Report it immediately to be first', 'Manually confirm it is real and assess impact', 'Run it again with more threads', 'Disclose it publicly'], 1, 'nuclei produces candidates; manual confirmation protects your signal and the report’s validity.')]
});
DP('bb-takeover', {
  fu: [['Which services are commonly vulnerable to takeover?', 'Historically various cloud/hosting/CDN and SaaS platforms where a CNAME can point to a resource name that, once deleted, anyone can re-register. The exact list shifts as providers add claim protections; nuclei/subzy fingerprints track current ones.'],
    ['Why is a takeover high impact?', 'Controlling a subdomain of the target lets you serve content from their trusted origin: steal cookies/sessions scoped to the parent domain, run convincing phishing, or bypass CSP/CORS trust — hence often high or critical severity.'],
    ['How does nuclei avoid being just noise?', 'Good templates use precise matchers (specific strings + status + conditions). You further filter by severity and confirm manually. Writing target-specific templates keeps signal high.']],
  deep: [['Technique', 'Pair takeover detection and a severity-filtered nuclei sweep with continuous monitoring: run them on every newly discovered host automatically and notify on hits.'],
    ['Failure mode', 'Reporting unconfirmed nuclei output or a false-positive takeover — both damage signal. Always verify.'],
    ['In real workflows', 'nuclei + httpx + subfinder on a schedule, piping hits to notify, is the backbone of many hunters’ "always-on" recon that catches issues the moment they appear.']],
  src: ['ProjectDiscovery: Nuclei documentation', 'https://docs.projectdiscovery.io/tools/nuclei/overview'] });
