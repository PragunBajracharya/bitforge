#!/usr/bin/env node
/* Content schema check for Bitforge. Usage: node tools/check-content.js [projectDir]  (works on the source tree or the deployed site folder)
   Loads every content file in build order, then validates topics, units, problems and links. Exit code 1 on errors. */
const fs = require('fs'), path = require('path'), vm = require('vm');
let root = process.argv[2] || path.join(__dirname, '..');
if (!fs.existsSync(path.join(root, 'build.sh')) && fs.existsSync(path.join(root, 'source', 'index.html'))) root = path.join(root, 'source');
let files, tracksFile, appFile;
if (fs.existsSync(path.join(root, 'build.sh'))) {            // source tree: order comes from build.sh
  files = fs.readFileSync(path.join(root, 'build.sh'), 'utf8').match(/JS="([^"]+)"/)[1].split(/\s+/).map(f => path.join(root, f));
  tracksFile = path.join(root, 'src/tracks.js'); appFile = path.join(root, 'src/app.js');
} else {                                                       // deployed site: order comes from index.html
  const skip = /core\/(lessons|problems-ui|practice|app-shell|mobile-pwa)\.js$/;
  files = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]).filter(f => !skip.test(f)).map(f => path.join(root, f));
  tracksFile = path.join(root, 'js/core/app-shell.js'); appFile = path.join(root, 'js/core/lessons.js');
}
const ctx = { console, window: {}, document: { addEventListener() {}, querySelector() { return null; } }, localStorage: { getItem() { return null; }, setItem() {} } };
ctx.window = ctx; vm.createContext(ctx);
let code = files.map(f => fs.readFileSync(f, 'utf8')).join('\n;\n');
const tracks = fs.readFileSync(tracksFile, 'utf8');
const u0 = tracks.indexOf('const UNITS = ['), u1 = tracks.indexOf('\n];', u0);
code += "\nconst Q = (q, o, a, why) => ({ q, o, a, why });\nconst SORT_KEYS = ['bubble', 'insertion', 'selection', 'merge', 'quick', 'heapsort', 'counting'];\n" + tracks.slice(u0, u1 + 3).replace('const UNITS', 'var UNITS');
const ti = tracks.indexOf('const TRACK_INFO = {'), te = tracks.indexOf('\n};', ti);
code += '\n' + tracks.slice(ti, te + 3).replace('const TRACK_INFO', 'var TRACK_INFO');
code += '\nthis.__ = { ALGOS, SD, DEEP, EXPLAIN, PROBS, PCATS, UNITS, TRACK_INFO, lessons: [...algoLessonsSafe()] };';
code = code.replace("this.__ =", "function algoLessonsSafe(){ const L=[]; for (const n of ['algoLessons','cryptoLessons','crLabs','sdLessons','daLessons','ipLessons']) { try { L.push(...eval(n)); } catch (e) {} } return L; }\nthis.__ =");
try { vm.runInContext(code, ctx, { filename: 'content.js' }); } catch (e) { console.error('Content failed to load:', e.message); process.exit(1); }
const { ALGOS, SD, DEEP, EXPLAIN, PROBS, PCATS, UNITS, TRACK_INFO, lessons } = ctx.__;
const errors = [], warns = [];
const E = m => errors.push(m), W = m => warns.push(m);
const LANGS = ['python', 'javascript', 'java', 'cpp'];
const checkQ = (q, where) => { if (!q || !Array.isArray(q.o) || q.o.length < 2 || !(q.a >= 0 && q.a < q.o.length) || !q.q) E(`${where}: malformed question`); };
for (const [k, A] of Object.entries(ALGOS)) {
  for (const f of ['name', 'cat', 'blurb', 'cx', 'pts', 'pseudo', 'trace', 'q']) if (!A[f]) E(`ALGOS.${k}: missing ${f}`);
  if (A.code) for (const l of LANGS) if (!A.code[l]) E(`ALGOS.${k}: missing ${l} code`);
  (A.trace || []).forEach(([line], i) => { if (!(line >= 0 && line < (A.pseudo || []).length)) E(`ALGOS.${k}: trace step ${i + 1} points at pseudo line ${line}`); });
  if (A.q) checkQ(A.q, `ALGOS.${k}.q`);
  if (!EXPLAIN[k]) W(`ALGOS.${k}: no detailed explanation`);
}
for (const [k, T] of Object.entries(SD)) {
  for (const f of ['name', 'cat', 'blurb']) if (!T[f]) E(`SD.${k}: missing ${f}`);
  if (!T.sections && !T.vs && !T.sheets) E(`SD.${k}: needs sections, vs or sheets`);
  if (T.vs) for (const f of ['cols', 'rows', 'pick', 'ask', 'answer']) if (!T.vs[f]) E(`SD.${k}.vs: missing ${f}`);
  if (T.vs) T.vs.rows.forEach((r, i) => { if (r.length !== T.vs.cols.length + 1) E(`SD.${k}.vs.rows[${i}]: expected ${T.vs.cols.length + 1} cells`); });
  (T.qs || []).forEach((q, i) => checkQ(q, `SD.${k}.qs[${i}]`));
  (T.walk || []).forEach(([ids], i) => { if (!T.dg) return; const known = new Set([...T.dg.n.map(n => n[0]), ...(T.dg.e || []).map(e => e[4] || e[0] + '>' + e[1])]); ids.forEach(id => { if (!known.has(id)) E(`SD.${k}: walk step ${i + 1} highlights unknown id "${id}"`); }); });
  if (T.dg) { const ids = new Set(T.dg.n.map(n => n[0])); (T.dg.e || []).forEach(e => { if (!ids.has(e[0]) || !ids.has(e[1])) E(`SD.${k}: edge ${e[0]}>${e[1]} references a missing node`); }); }
  (T.prac || []).forEach(n => { if (!PROBS.find(p => p.n === n)) E(`SD.${k}: practice problem #${n} does not exist`); });
}
const all = new Set([...Object.keys(ALGOS), ...Object.keys(SD)]);
for (const [k, D] of Object.entries(DEEP)) {
  if (!all.has(k)) E(`DEEP.${k}: no such topic`);
  (D.fu || []).forEach((p, i) => { if (!Array.isArray(p) || p.length !== 2) E(`DEEP.${k}.fu[${i}]: must be [question, answer]`); });
  if (D.src && (!Array.isArray(D.src) || !D.src[0])) E(`DEEP.${k}.src malformed`);
  if (D.src && D.src[1] && !/^https:\/\//.test(D.src[1])) E(`DEEP.${k}.src URL must be https`);
}
for (const k of all) { const D = DEEP[k] || {}; if (!D.fu && !(SD[k] && SD[k].sheets !== undefined || k.startsWith('cs-'))) W(`${k}: no follow-ups`); if (!D.src) W(`${k}: no source`); }
const appIds = [...fs.readFileSync(appFile, 'utf8').matchAll(/\{\s*id\s*:\s*'([a-z0-9-]+)'/g)].map(m => m[1]);
const pcats = new Set(PCATS.map(c => c[0])), lessonIds = new Set([...lessons.map(l => l.id), ...appIds]), unitIds = new Set();
for (const u of UNITS) {
  if (unitIds.has(u.id)) E(`unit ${u.id}: duplicate id`); unitIds.add(u.id);
  if (!TRACK_INFO[u.track] && u.track !== 'problems') E(`unit ${u.id}: unknown track ${u.track}`);
  (u.study || []).forEach(k => { if (!all.has(k)) E(`unit ${u.id}: study key "${k}" does not exist`); });
  if (u.topic && !all.has(u.topic)) E(`unit ${u.id}: topic "${u.topic}" does not exist`);
  (u.practice || []).forEach(c => { if (!pcats.has(c)) E(`unit ${u.id}: practice category "${c}" does not exist`); });
  if (u.quiz && !lessonIds.has(u.quiz)) E(`unit ${u.id}: quiz "${u.quiz}" does not exist`);
  if (u.learn && !lessonIds.has(u.learn)) E(`unit ${u.id}: lesson "${u.learn}" does not exist`);
  (u.extra || []).forEach((q, i) => checkQ(q, `unit ${u.id}.extra[${i}]`));
}
const seen = new Set();
for (const p of PROBS) {
  if (seen.has(p.n)) E(`problem #${p.n}: duplicate`); seen.add(p.n);
  if (!pcats.has(p.c)) E(`problem #${p.n}: unknown category ${p.c}`);
  for (const f of ['t', 'sum', 'app', 'tc', 'sc', 'py']) if (!p[f]) E(`problem #${p.n}: missing ${f}`);
  (p.rel || []).forEach(k => { if (!all.has(k)) E(`problem #${p.n}: related topic "${k}" does not exist`); });
}
const used = new Set(UNITS.flatMap(u => [...(u.study || []), u.topic].filter(Boolean)));
for (const k of Object.keys(SD)) if (!used.has(k) && !k.startsWith('cmp-') && !k.startsWith('cs-')) W(`SD.${k}: not used by any unit`);
console.log(`Checked ${Object.keys(ALGOS).length} library topics, ${Object.keys(SD).length} lesson topics, ${Object.keys(DEEP).length} depth entries, ${UNITS.length} units, ${PROBS.length} problems.`);
if (warns.length) console.log(`${warns.length} warning(s):\n  ` + warns.join('\n  '));
if (errors.length) { console.error(`${errors.length} error(s):\n  ` + errors.join('\n  ')); process.exit(1); }
console.log('No errors.');
