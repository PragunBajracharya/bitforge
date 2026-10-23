/* Bitforge service worker: precaches the app so it opens instantly and works offline. */
const VERSION = 'bitforge-3f1dd97bc8de';
const ASSETS = [
  "./",
  "manifest.webmanifest",
  "favicon.svg",
  "css/base.css",
  "css/components.css",
  "css/courses.css",
  "css/mobile.css",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "js/content/algorithms/algorithms-1.js",
  "js/content/algorithms/algorithms-2.js",
  "js/content/algorithms/algorithms-3.js",
  "js/content/algorithms/algorithms-4-strings-advanced.js",
  "js/content/algorithms/algorithms-core.js",
  "js/content/algorithms/algorithms-meta.js",
  "js/content/crypto/crypto-1.js",
  "js/content/crypto/crypto-2.js",
  "js/content/crypto/crypto-3.js",
  "js/content/crypto/protocols-attacks.js",
  "js/content/data-analytics/foundations-excel.js",
  "js/content/data-analytics/labs.js",
  "js/content/data-analytics/powerbi-tableau.js",
  "js/content/data-analytics/probability-regression.js",
  "js/content/data-analytics/python-stats-cases.js",
  "js/content/data-analytics/sql.js",
  "js/content/depth/algorithms-1.js",
  "js/content/depth/algorithms-2.js",
  "js/content/depth/crypto.js",
  "js/content/depth/data-analytics.js",
  "js/content/depth/depth-core.js",
  "js/content/depth/interview-prep.js",
  "js/content/depth/system-design-1.js",
  "js/content/depth/system-design-2.js",
  "js/content/explanations/algorithms-explained-2.js",
  "js/content/explanations/algorithms-explained.js",
  "js/content/explanations/crypto-explained.js",
  "js/content/interview-prep/backend-fullstack.js",
  "js/content/interview-prep/behavioral-cheatsheets.js",
  "js/content/interview-prep/cs-fundamentals-career.js",
  "js/content/interview-prep/frontend.js",
  "js/content/interview-prep/software-engineering.js",
  "js/content/problems/brute-force.js",
  "js/content/problems/problems-1.js",
  "js/content/problems/problems-2.js",
  "js/content/problems/problems-3.js",
  "js/content/problems/problems-4.js",
  "js/content/problems/problems-5.js",
  "js/content/problems/problems-6.js",
  "js/content/problems/problems-core.js",
  "js/content/problems/tests.js",
  "js/content/reference/cheat-sheets.js",
  "js/content/reference/comparisons.js",
  "js/content/system-design/case-studies-2.js",
  "js/content/system-design/case-studies.js",
  "js/content/system-design/code-samples.js",
  "js/content/system-design/consistency-transactions.js",
  "js/content/system-design/data-messaging.js",
  "js/content/system-design/foundations-caching.js",
  "js/content/system-design/labs.js",
  "js/content/system-design/reliability-architecture.js",
  "js/core/app-shell.js",
  "js/core/lessons.js",
  "js/core/mobile-pwa.js",
  "js/core/practice.js",
  "js/core/problems-ui.js",
  "js/core/runner.js",
  "js/core/topic-engine.js",
  "sw.js"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k.startsWith('bitforge-')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // app files: cache first (a new deploy ships a new service worker version)
    if (req.mode === 'navigate') { e.respondWith(fetch(req).catch(() => caches.match('./'))); return; }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
    return;
  }
  // fonts and CDN libraries (highlight.js, sql.js, Pyodide): stale-while-revalidate
  if (/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(url.host)) {
    e.respondWith(caches.open('bitforge-cdn').then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
