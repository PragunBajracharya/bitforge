#!/usr/bin/env node
/*
 * Bitforge password protection (no server, no middleware).
 *
 * Builds public/ from source/: every page, style and script is bundled, gzip-compressed and
 * encrypted with AES-256-GCM using a key derived from your password (PBKDF2-SHA256, 600,000
 * iterations, random salt). public/ contains only a login screen and the ciphertext, so the
 * content cannot be read from the deployed files without the password.
 *
 * Usage:   BITFORGE_PASSWORD='your passphrase' node tools/protect.mjs
 *    or:   node tools/protect.mjs 'your passphrase'
 * Needs Node 18+ and no packages.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'source'), OUT = path.join(ROOT, 'public');
const ITER = 600000;

const password = process.env.BITFORGE_PASSWORD || process.argv[2];
if (!password) {
  console.error('\n✗ No password set. Set the BITFORGE_PASSWORD environment variable (in Vercel: Project → Settings → Environment Variables),\n  or run: node tools/protect.mjs "your passphrase"\n');
  process.exit(1);
}
if (password.length < 10) { console.error('✗ Use a password of at least 10 characters (a few random words is ideal).'); process.exit(1); }

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const index = read('index.html');
const cssFiles = [...index.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">/g)].map(m => m[1]);
const jsFiles = [...index.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const bodyStart = index.indexOf('<body>') + 6, bodyEnd = index.indexOf('<!-- Scripts load in order');
if (!cssFiles.length || !jsFiles.length || bodyStart < 6 || bodyEnd < 0) { console.error('✗ source/index.html does not have the expected structure.'); process.exit(1); }

const payload = JSON.stringify({
  html: index.slice(bodyStart, bodyEnd).trim(),
  css: cssFiles.map(read).join('\n'),
  js: jsFiles.map(f => `/* ${f} */\n` + read(f)).join('\n;\n')
});
const gz = zlib.gzipSync(Buffer.from(payload, 'utf8'), { level: 9 });
const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(password, salt, ITER, 32, 'sha256');
const c = crypto.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([c.update(gz), c.final(), c.getAuthTag()]);   // Web Crypto expects the tag appended
const version = crypto.createHash('sha256').update(enc).digest('hex').slice(0, 12);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'app.enc'), enc);
for (const f of ['favicon.svg', 'manifest.webmanifest']) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));
for (const f of fs.readdirSync(path.join(SRC, 'icons'))) fs.copyFileSync(path.join(SRC, 'icons', f), path.join(OUT, 'icons', f));
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

const b64 = b => b.toString('base64');
const meta = JSON.stringify({ salt: b64(salt), iv: b64(iv), iter: ITER, v: version });
const head = index.slice(index.indexOf('<head>') + 6, index.indexOf('</head>'))
  .replace(/\s*<link rel="stylesheet" href="css\/[^"]+">/g, '');

fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html>
<html lang="en">
<head>${head}
  <meta name="robots" content="noindex, nofollow">
  <style>
    :root{--bg:#F1F4F7;--surface:#fff;--ink:#132030;--muted:#5A6878;--line:#D5DCE4;--accent:#1C6B74;--bad:#B23A3A}
    @media (prefers-color-scheme:dark){:root{--bg:#0E141B;--surface:#16202A;--ink:#E3E9F0;--muted:#95A3B3;--line:#283645;--accent:#4DB2BC;--bad:#EE7272}}
    html,body{margin:0;min-height:100%;background:var(--bg);color:var(--ink);font:16px/1.5 "IBM Plex Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
    .gate{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px 16px calc(24px + env(safe-area-inset-bottom,0px));box-sizing:border-box}
    .gate form{width:100%;max-width:380px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:28px 24px;box-shadow:0 12px 40px rgba(0,0,0,.08);box-sizing:border-box}
    .gate .logo{display:flex;align-items:center;gap:10px;font:800 24px/1 "Bricolage Grotesque",ui-sans-serif,system-ui,sans-serif;letter-spacing:-.02em;margin-bottom:18px}
    .gate .logo svg{width:30px;height:30px}
    .gate h1{font-size:18px;margin:0 0 4px}.gate p{margin:0 0 18px;color:var(--muted);font-size:14px}
    .gate label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}
    .gate input[type=password]{width:100%;box-sizing:border-box;font-size:16px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);outline:none}
    .gate input[type=password]:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent)}
    .gate .remember{display:flex;gap:8px;align-items:center;margin:14px 0 18px;font-size:14px;color:var(--ink)}
    .gate .remember input{width:18px;height:18px;accent-color:var(--accent)}
    .gate button{width:100%;min-height:46px;border:0;border-radius:10px;background:var(--accent);color:#fff;font-weight:600;font-size:16px;font-family:inherit;cursor:pointer}
    .gate button:disabled{opacity:.6;cursor:progress}
    .gate .err{color:var(--bad);font-size:14px;margin:12px 0 0;min-height:1.5em}
  </style>
</head>
<body>
<main class="gate" id="gate" hidden>
  <form id="gateForm" autocomplete="on">
    <div class="logo"><svg viewBox="0 0 26 26" aria-hidden="true"><rect x="1" y="1" width="24" height="24" rx="6" fill="#1C6B74"/><path d="M7 17V9m4 8v-5m4 5v-8m4 8v-3" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>Bitforge</div>
    <h1>This platform is private</h1>
    <p>Enter the password to continue.</p>
    <input type="text" name="username" value="bitforge" autocomplete="username" hidden>
    <label for="pw">Password</label>
    <input id="pw" type="password" autocomplete="current-password" required autofocus>
    <label class="remember"><input id="remember" type="checkbox" checked> Keep me signed in on this device</label>
    <button id="go" type="submit">Unlock</button>
    <p class="err" id="err" role="alert"></p>
  </form>
</main>
<noscript><p style="padding:24px">Bitforge needs JavaScript.</p></noscript>
<script>
(() => {
  const META = ${meta};
  const AUTH = 'bitforge-auth';                 // not a bf- key, so it is never included in progress exports
  const $ = id => document.getElementById(id);
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const tob64 = b => btoa(String.fromCharCode(...new Uint8Array(b)));
  const gate = $('gate'), form = $('gateForm'), err = $('err'), go = $('go');
  if (!window.crypto || !crypto.subtle) { gate.hidden = false; err.textContent = 'Open this site over HTTPS to unlock it.'; go.disabled = true; return; }
  let data = null;
  const fetchData = () => data || (data = fetch('app.enc?v=' + META.v).then(r => { if (!r.ok) throw new Error('Could not load the app (' + r.status + ').'); return r.arrayBuffer(); }));
  async function derive(pw) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(META.salt), iterations: META.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
  }
  async function open(key) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(META.iv) }, key, await fetchData());
    const text = await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    return JSON.parse(text);
  }
  function boot(app) {
    window.bfLock = () => { try { localStorage.removeItem(AUTH); } catch (e) {} location.reload(); };
    const style = document.createElement('style'); style.textContent = app.css; document.head.appendChild(style);
    gate.remove();
    document.body.insertAdjacentHTML('afterbegin', app.html);
    const s = document.createElement('script'); s.textContent = app.js; document.body.appendChild(s);
  }
  async function auto() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(AUTH) || 'null'); } catch (e) {}
    if (saved && saved.salt === META.salt) {
      try { const key = await crypto.subtle.importKey('raw', unb64(saved.k), 'AES-GCM', true, ['decrypt']); boot(await open(key)); return; }
      catch (e) { try { localStorage.removeItem(AUTH); } catch (_) {} }
    }
    gate.hidden = false; $('pw').focus(); fetchData().catch(() => {});
  }
  form.addEventListener('submit', async e => {
    e.preventDefault(); err.textContent = ''; go.disabled = true; go.textContent = 'Unlocking…';
    try {
      const key = await derive($('pw').value);
      let app;
      try { app = await open(key); } catch (x) { if (x && x.name === 'OperationError') throw new Error('Wrong password. Try again.'); throw x; }
      if ($('remember').checked) { try { localStorage.setItem(AUTH, JSON.stringify({ salt: META.salt, k: tob64(await crypto.subtle.exportKey('raw', key)) })); } catch (_) {} }
      boot(app);
    } catch (x) {
      err.textContent = x.message || 'Something went wrong.'; go.disabled = false; go.textContent = 'Unlock'; $('pw').select();
    }
  });
  auto();
})();
</script>
</body>
</html>
`);

const assets = ['./', 'app.enc', 'manifest.webmanifest', 'favicon.svg', ...fs.readdirSync(path.join(OUT, 'icons')).map(f => 'icons/' + f)];
fs.writeFileSync(path.join(OUT, 'sw.js'), `/* Bitforge service worker: caches the (encrypted) app so it opens instantly and works offline. */
const VERSION = 'bitforge-${version}';
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSION && n.startsWith('bitforge-') && n !== 'bitforge-cdn').map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') { e.respondWith(fetch(req).catch(() => caches.match('./'))); return; }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
    return;
  }
  if (/fonts\\.(googleapis|gstatic)\\.com|cdnjs\\.cloudflare\\.com|cdn\\.jsdelivr\\.net/.test(url.host)) {
    e.respondWith(caches.open('bitforge-cdn').then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
`);
console.log(`✓ public/ built: ${jsFiles.length} scripts and ${cssFiles.length} stylesheets encrypted into app.enc (${Math.round(enc.length / 1024)} KB), version ${version}.`);
