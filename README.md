# Bitforge

Interactive zero-to-hero courses in one static website:

| Course | What's inside |
| --- | --- |
| Sorting | 7 sorting algorithms with step-through traces, labs and code in 4 languages |
| Algorithms | Big-O, recursion, searching, strings (KMP, Rabin–Karp), segment and Fenwick trees, graphs (Dijkstra, Bellman–Ford, Floyd–Warshall, SCC), DP and greedy |
| Problems | NeetCode 150 with hints, brute-force baselines, solutions in 4 languages, an in-browser JavaScript/Python test runner, notes, a timer and a spaced-review queue |
| System Design | Requirements to 14 case studies (incl. payments, Google Docs, Dropbox, Ticketmaster, rate limiter), with step-through diagrams and simulators |
| Cryptography | Classical ciphers to post-quantum, TLS 1.3, certificates and PKI, and an attacks lab |
| Data Analytics | Statistics, probability and regression, Excel, SQL (live playground), Power BI, Tableau, Python |
| Interview Prep | Frontend, backend, full-stack, SWE and data analyst tracks: TypeScript, OS, networking, low-level design, résumés and offers, cheat sheets and flashcards |
| X vs Y | Side-by-side comparisons with when to pick each and model interview answers |
| Cheat Sheets | Printable one-pagers: Big-O, patterns → problems, SQL, Excel/DAX, Git, Linux, regex, HTTP, Docker/K8s, crypto, SD numbers, syntax |

Every topic ends with work uses, follow-up questions with model answers, a “Go deeper” section and one authoritative source.

Every topic ends with work uses, follow-up questions with model answers, a “Go deeper” section and one authoritative source.

Every topic ends with work uses, follow-up questions with model answers, a “Go deeper” section and one authoritative source.

Every topic ends with work uses, follow-up questions with model answers, a “Go deeper” section and one authoritative source.

Every topic ends with work uses, follow-up questions with model answers, a “Go deeper” section and one authoritative source.

Every topic ends with work uses, follow-up questions with model answers, a “Go deeper” section and one authoritative source.

It is plain HTML, CSS and JavaScript: no build step, no framework, no server code.

## Folder structure

```
bitforge/
├── index.html                  # page shell; loads the CSS and scripts in order
├── favicon.svg
├── vercel.json                 # Vercel settings (clean URLs, caching, security headers)
├── manifest.webmanifest        # app name, icons and colors for installing on phones
├── sw.js                       # service worker: offline cache
├── icons/                      # app icons (192, 512, maskable, Apple touch)
├── tools/
│   └── check-content.js        # content schema check: node tools/check-content.js
├── css/
│   ├── base.css                # design tokens (light/dark), layout, header, lesson styles
│   ├── components.css          # problem pages, code runner, cards, search, course pages
│   ├── courses.css             # diagrams, labs, course switcher, comparisons, cheat sheets
│   └── mobile.css              # roadmap drawer, mobile layout, touch targets
└── js/
    ├── content/
    │   ├── algorithms/         # algorithm topics: complexity, pseudocode, code in 4 languages
    │   ├── crypto/             # cryptography & hashing topics, TLS/PKI, attacks lab
    │   ├── explanations/       # detailed "how it works" text for library topics
    │   ├── system-design/      # system design topics, case studies, code samples, labs
    │   ├── data-analytics/     # analytics topics (Excel, SQL, Power BI, Tableau, Python, stats), labs
    │   ├── interview-prep/     # interview topics, cheat sheets, flashcards, quiz
    │   ├── reference/          # X vs Y comparisons and printable cheat sheets
    │   ├── depth/              # follow-ups with answers, go-deeper notes and sources for every topic
    │   └── problems/           # NeetCode 150 data, brute-force baselines, test cases
    └── core/
        ├── topic-engine.js     # diagram renderer + topic pages
        ├── runner.js           # test harness for the JavaScript worker and Pyodide (Python)
        ├── lessons.js          # shared helpers, sorting/graph/crypto interactive lessons
        ├── problems-ui.js      # problem pages, tables, quizzes
        ├── practice.js         # code runner UI, notes, timer, spaced review queue
        ├── app-shell.js        # courses & units, course switcher, search, routing, theme
        └── mobile-pwa.js       # roadmap drawer / collapsible sidebar, mobile search, app install (load last)
```

Scripts are classic (non-module) scripts that share one global scope, so **their order in `index.html` matters**: content files first, `app-shell.js` last.

## Run locally

Any static server works:

```bash
cd bitforge
npx serve .            # or: python3 -m http.server 8000
```

Then open http://localhost:3000 (or :8000). Opening `index.html` directly also works.

## Deploy to Vercel

**Option A: from GitHub (recommended)**

1. Create a new GitHub repository and push this folder to it:
   ```bash
   cd bitforge
   git init && git add . && git commit -m "Bitforge"
   git branch -M main
   git remote add origin https://github.com/<you>/bitforge.git
   git push -u origin main
   ```
2. In Vercel: **Add New… → Project → Import** your repository.
3. Framework preset: **Other**. Leave Build Command and Output Directory empty. (If this folder sits inside a larger repo, set **Root Directory** to `bitforge`.)
4. Click **Deploy**. Every push to `main` redeploys automatically.

**Option B: from your terminal**

```bash
npm i -g vercel
cd bitforge
vercel          # preview deployment
vercel --prod   # production deployment
```

## Install it as an app

Bitforge is a Progressive Web App: once deployed on HTTPS (Vercel does this for you) it can be installed and works offline.

- **Android (Chrome):** open the site, then tap **Install app** in the course menu, or the browser menu → **Install app / Add to Home screen**.
- **iPhone / iPad (Safari):** tap **Share** → **Add to Home Screen**.
- **Desktop (Chrome, Edge):** click the install icon in the address bar.

The installed app opens full screen without browser bars. `sw.js` caches every file of the site, so lessons open instantly and work offline after the first visit; fonts and CDN libraries are cached the first time they load. Each deploy produces a new cache version automatically (run `python3 tools/package.py` from the source project, or bump `VERSION` in `sw.js` if you edit files by hand).

## External resources

Loaded from public CDNs at runtime (the site works without them, with reduced styling):

- Google Fonts (Bricolage Grotesque, IBM Plex Sans/Mono)
- highlight.js 11.9.0 from cdnjs (code syntax colors)
- sql.js 1.10.3 from cdnjs (only when the SQL playground opens)
- Pyodide 0.26.4 from jsDelivr (only when you run Python code on a problem page, about 10 MB once)
- Pyodide 0.26.4 from jsDelivr (only when you run Python code on a problem page, about 10 MB once)
- Pyodide 0.26.4 from jsDelivr (only when you run Python code on a problem page, about 10 MB once)
- Pyodide 0.26.4 from jsDelivr (only when you run Python code on a problem page, about 10 MB once)
- Pyodide 0.26.4 from jsDelivr (only when you run Python code on a problem page, about 10 MB once)
- Pyodide 0.26.4 from jsDelivr (only when you run Python code on a problem page, about 10 MB once)

## Saving progress

Progress (completed units, solved problems, chosen language, your code, notes and review schedule) is stored in the visitor's browser with `localStorage`. Nothing is sent to a server. Use **Export progress** / **Import progress** in the course menu to move it between browsers. Links are shareable: every unit, step, topic and problem has its own URL (e.g. `/#/problems/146`).

## Checking content

```bash
node tools/check-content.js      # validates topics, units, quizzes, problem links and sources
```

## Checking content

```bash
node tools/check-content.js      # validates topics, units, quizzes, problem links and sources
```

## Checking content

```bash
node tools/check-content.js      # validates topics, units, quizzes, problem links and sources
```

## Checking content

```bash
node tools/check-content.js      # validates topics, units, quizzes, problem links and sources
```

## Checking content

```bash
node tools/check-content.js      # validates topics, units, quizzes, problem links and sources
```

## Checking content

```bash
node tools/check-content.js      # validates topics, units, quizzes, problem links and sources
```

## Adding a course

1. Add the topic files under `js/content/<course>/` and include them in `index.html` before `js/core/app-shell.js`.
2. In `app-shell.js`, add the course to `COURSES` (switcher), `TRACK_INFO` (levels and pitch), `UNITS` (units), and `TRACKS`.
3. Add a color token (e.g. `--career`) in `css/base.css` for light and dark themes.
