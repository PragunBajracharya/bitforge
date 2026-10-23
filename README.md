# Bitforge

Interactive zero-to-hero courses in one static website:

| Course | What's inside |
| --- | --- |
| Sorting | 7 sorting algorithms with step-through traces, labs and code in 4 languages |
| Algorithms | Big-O through dynamic programming, graphs and greedy algorithms |
| Problems | NeetCode 150 with hints, pattern quizzes and solutions in Python, JavaScript, Java and C++ |
| System Design | Requirements to case studies, with step-through diagrams and simulators |
| Cryptography | Classical ciphers to post-quantum, hashing, AES, RSA, signatures |
| Data Analytics | Statistics, Excel, SQL (live playground), Power BI, Tableau, Python |
| Interview Prep | Cheat sheets and detailed prep for frontend, backend, full-stack and SWE roles |

It is plain HTML, CSS and JavaScript: no build step, no framework, no server code.

## Folder structure

```
bitforge/
├── index.html                  # page shell; loads the CSS and scripts in order
├── favicon.svg
├── vercel.json                 # Vercel settings (clean URLs, caching, security headers)
├── css/
│   ├── base.css                # design tokens (light/dark), layout, header, lesson styles
│   ├── components.css          # problem pages, cards, search, course pages
│   └── courses.css             # diagrams, labs, course switcher, analytics, interview prep
└── js/
    ├── content/
    │   ├── algorithms/         # algorithm topics: complexity, pseudocode, code in 4 languages
    │   ├── crypto/             # cryptography & hashing topics
    │   ├── explanations/       # detailed "how it works" text for algorithms and crypto
    │   ├── system-design/      # system design topics, case studies, code samples, labs
    │   ├── data-analytics/     # analytics topics (Excel, SQL, Power BI, Tableau, Python), labs
    │   ├── interview-prep/     # interview topics, cheat sheets, flashcards, quiz
    │   └── problems/           # NeetCode 150 problem data
    └── core/
        ├── topic-engine.js     # diagram renderer + topic pages (system design, analytics, interview)
        ├── lessons.js          # shared helpers, sorting/graph/crypto interactive lessons
        ├── problems-ui.js      # problem pages, tables, quizzes
        └── app-shell.js        # courses & units, course switcher, search, routing (load last)
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

## External resources

Loaded from public CDNs at runtime (the site works without them, with reduced styling):

- Google Fonts (Bricolage Grotesque, IBM Plex Sans/Mono)
- highlight.js 11.9.0 from cdnjs (code syntax colors)
- sql.js 1.10.3 from cdnjs (only when the SQL playground opens)

## Saving progress

Progress (completed units, solved problems, chosen language) is stored in the visitor's browser with `localStorage`. Nothing is sent to a server.

## Adding a course

1. Add the topic files under `js/content/<course>/` and include them in `index.html` before `js/core/app-shell.js`.
2. In `app-shell.js`, add the course to `COURSES` (switcher), `TRACK_INFO` (levels and pitch), `UNITS` (units), and `TRACKS`.
3. Add a color token (e.g. `--career`) in `css/base.css` for light and dark themes.
