/* ===== French course: helpers, speech, exercises, vocabulary decks with spaced repetition, conjugation engine ===== */
SD_CATS.push(['frbase', 'Start here'], ['fra1', 'A1 grammar'], ['fra2', 'A2 grammar'], ['frb1', 'B1 grammar'], ['frb2', 'B2 grammar'], ['frc1', 'C1 grammar & style'], ['frvoc', 'Vocabulary'], ['frexam', 'TEF & TCF Canada'], ['frskill', 'Skills']);
const FR_ATTR = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const FR_STRIP = s => String(s).replace(/<[^>]+>/g, '');
/* a French phrase you can click to hear */
const FR = (s, say) => `<span class="fr" role="button" tabindex="0" data-say="${FR_ATTR(say || FR_STRIP(s))}">${s}</span>`;
/* example line: French (audio) + English */
const FX = (fr, en) => `<div class="fx">${FR(fr)}<span class="fxen">${en}</span></div>`;
const FXS = list => `<div class="fxs">${list.map(([f, e]) => FX(f, e)).join('')}</div>`;
const FRT = (k, o) => { o.domain = 'French'; o.edgeTitle = o.edgeTitle || 'Common mistakes'; o.mount = o.mount || ((o.ex || o.vocab) ? 'fr' : null); SDX(k, o); };
const FR_DECKS = [];
/* vocabulary deck: words = [[french, english, exampleFr, exampleEn], ...] */
const FRV = (k, o) => {
  o.domain = 'French · vocabulary'; o.cat = 'frvoc'; o.mount = 'fr'; o.vocab = o.words;
  o.facts = o.facts || [['Words', String(o.words.length)], ['Level', o.level], ['Practice', 'cards · quiz · listening']];
  o.blurb = o.blurb || `${o.words.length} words and expressions for ${o.theme}, each with an example sentence and audio.`;
  o.sections = o.sections || [];
  o.qs = o.qs || frVocabQs(o.words);
  FR_DECKS.push(k); SDX(k, o);
};
function frVocabQs(words) {      // three deterministic multiple-choice checks generated from the deck
  const pick = i => words[i % words.length];
  return [0, 7, 14].map(i => {
    const w = pick(i), wrong = [pick(i + 3), pick(i + 5), pick(i + 9)].map(x => x[1]).filter(x => x !== w[1]).slice(0, 3);
    const o = [w[1], ...wrong], order = [1, 3, 0, 2].filter(j => j < o.length).map(j => o[j]);
    return SQ(`What does “${FR_STRIP(w[0])}” mean?`, order, order.indexOf(w[1]), FR_STRIP(w[2]) + ' — ' + w[3]);
  });
}

/* ---------- speech ---------- */
const frSpeech = (() => {
  let voices = [];
  const load = () => { try { voices = speechSynthesis.getVoices().filter(v => /^fr/i.test(v.lang)); } catch (e) {} };
  if (window.speechSynthesis) { load(); speechSynthesis.onvoiceschanged = load; }
  const pick = () => {
    const pref = store.get('bf-frvoice', 'fr-CA');
    return voices.find(v => v.lang.replace('_', '-') === pref) || voices.find(v => /^fr-(FR|CA)/i.test(v.lang)) || voices[0] || null;
  };
  return {
    ok: () => !!window.speechSynthesis,
    say(text, rate) {
      if (!window.speechSynthesis) return false;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); const v = pick();
        u.lang = v ? v.lang : store.get('bf-frvoice', 'fr-CA'); if (v) u.voice = v; u.rate = rate || store.get('bf-frrate', 0.9);
        speechSynthesis.speak(u); return true;
      } catch (e) { return false; }
    },
    voices: () => voices
  };
})();
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.fr[data-say]'); if (t) { frSpeech.say(t.dataset.say); t.classList.add('saying'); setTimeout(() => t.classList.remove('saying'), 600); } });
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('fr') && e.target.dataset.say) { e.preventDefault(); frSpeech.say(e.target.dataset.say); } });
function frVoiceBar() {
  const pref = store.get('bf-frvoice', 'fr-CA'), rate = store.get('bf-frrate', 0.9);
  return `<div class="frvoice noprint"><span class="section-sub" style="margin:0">Click any <span class="fr" data-say="phrase en français">blue French text</span> to hear it.</span>
    <div class="chipbar" data-frvoice>${[['fr-CA', 'Canadian'], ['fr-FR', 'France']].map(([k, l]) => `<button data-v="${k}" aria-pressed="${k === pref}">${l}</button>`).join('')}</div>
    <div class="chipbar" data-frrate>${[[0.75, 'Slow'], [0.9, 'Normal'], [1.05, 'Fast']].map(([k, l]) => `<button data-r="${k}" aria-pressed="${k === rate}">${l}</button>`).join('')}</div></div>`;
}
function frWireVoice(root) {
  $$('[data-frvoice] button', root).forEach(b => b.onclick = () => { store.set('bf-frvoice', b.dataset.v); $$('[data-frvoice] button', root).forEach(x => x.setAttribute('aria-pressed', x === b)); frSpeech.say(b.dataset.v === 'fr-CA' ? 'Bonjour, ça va bien?' : 'Bonjour, comment allez-vous ?'); });
  $$('[data-frrate] button', root).forEach(b => b.onclick = () => { store.set('bf-frrate', +b.dataset.r); $$('[data-frrate] button', root).forEach(x => x.setAttribute('aria-pressed', x === b)); frSpeech.say('Je parle un peu plus lentement.'); });
}

/* ---------- answer checking ---------- */
const frNorm = s => String(s).toLowerCase().replace(/[’`´]/g, "'").replace(/\s+/g, ' ').replace(/\s*([',-])\s*/g, '$1').replace(/[.!?;:«»"]/g, '').trim();
const frBare = s => frNorm(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae');
/* returns 'ok' | 'accent' (right except accents) | 'article' (missing article) | 'no' */
function frCheck(input, answers) {
  const opts = String(answers).split('|'), n = frNorm(input), b = frBare(input);
  if (!n) return 'no';
  if (opts.some(a => frNorm(a) === n)) return 'ok';
  if (opts.some(a => frBare(a) === b)) return 'accent';
  const noArt = a => frNorm(a).replace(/^(le |la |les |l'|un |une |des |du |de la |de l')/, '');
  if (opts.some(a => noArt(a) === n && noArt(a) !== frNorm(a))) return 'article';
  return 'no';
}

/* ---------- exercises: [prompt with ___, answers (a|b), hint, explanation] ---------- */
function frExercises(el, key, items) {
  const best = store.get('bf-frex', {})[key];
  el.innerHTML = `<div class="card frex"><div class="lvlhead"><h3 style="margin:0">Practice: fill in the blanks</h3><span class="section-sub" style="margin:0">${best !== undefined ? `Best: ${best}/${items.length}` : `${items.length} items`}</span></div>
    <p class="section-sub" style="margin:6px 0 12px">Type the missing word(s). Accents count, but you get a hint if only the accents are wrong. Press Enter to jump to the next blank.</p>
    <ol class="frexlist">${items.map(([p, , hint], i) => {
      const parts = p.split('___');
      return `<li data-i="${i}"><div class="frq">${parts[0]}<input class="frin" aria-label="Answer ${i + 1}" autocapitalize="off" autocomplete="off" spellcheck="false" size="${Math.max(6, Math.min(22, (items[i][1].split('|')[0].length + 3)))}">${parts.slice(1).join('___')}</div>${hint ? `<div class="frhint">${hint}</div>` : ''}<div class="frfb" aria-live="polite"></div></li>`;
    }).join('')}</ol>
    <div class="row frkeys" aria-label="Accented letters">${['é', 'è', 'ê', 'à', 'â', 'ç', 'ô', 'î', 'ï', 'ù', 'û', 'œ', '’'].map(c => `<button type="button" class="btn sm" data-c="${c}">${c}</button>`).join('')}</div>
    <div class="row" style="margin-top:10px"><button class="btn primary" type="button" data-check>Check answers</button><button class="btn sm" type="button" data-show>Show answers</button><button class="btn sm" type="button" data-reset>Try again</button><span class="frscore"></span></div></div>`;
  let last = null;
  const inputs = $$('.frin', el);
  inputs.forEach((inp, i) => {
    inp.onfocus = () => { last = inp; };
    inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); (inputs[i + 1] || $('[data-check]', el)).focus(); } };
  });
  $$('.frkeys button', el).forEach(b => b.onmousedown = e => e.preventDefault());
  $$('.frkeys button', el).forEach(b => b.onclick = () => { const t = last || inputs[0]; const s = t.selectionStart ?? t.value.length; t.setRangeText(b.dataset.c, s, t.selectionEnd ?? s, 'end'); t.focus(); });
  const check = reveal => {
    let ok = 0;
    items.forEach(([p, ans, , why], i) => {
      const li = $(`li[data-i="${i}"]`, el), inp = $('.frin', li), fb = $('.frfb', li), r = reveal ? 'show' : frCheck(inp.value, ans);
      const correct = ans.split('|')[0];
      li.className = r === 'ok' ? 'good' : r === 'show' ? '' : 'bad';
      if (r === 'ok') ok++;
      fb.innerHTML = r === 'ok' ? `<b class="ok">✓</b> ${why ? why : ''}` : r === 'accent' ? `<b class="no">Almost:</b> check the accents → ${FR(correct)}${why ? '. ' + why : ''}` : r === 'article' ? `<b class="no">Almost:</b> include the article → ${FR(correct)}` : r === 'show' ? `Answer: ${FR(correct)}${why ? '. ' + why : ''}` : `<b class="no">✗</b> Answer: ${FR(correct)}${why ? '. ' + why : ''}`;
      if (reveal) inp.value = correct;
    });
    if (!reveal) {
      $('.frscore', el).innerHTML = `<b>${ok} / ${items.length}</b> correct`;
      const all = store.get('bf-frex', {}); if (all[key] === undefined || ok > all[key]) { all[key] = ok; store.set('bf-frex', all); }
    }
  };
  $('[data-check]', el).onclick = () => check(false);
  $('[data-show]', el).onclick = () => check(true);
  $('[data-reset]', el).onclick = () => frExercises(el, key, items);
}

/* ---------- vocabulary: table, flashcards (spaced repetition), typing quiz, listening ---------- */
const FR_BOX = [0, 1, 3, 7, 16, 35];          // days until the next review for each Leitner box
const frDay = (d = 0) => { const t = new Date(); t.setHours(0, 0, 0, 0); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const frSrs = () => store.get('bf-frsrs', {});
const frId = w => FR_STRIP(w[0]);
function frDue(words) { const s = frSrs(), t = frDay(); return words.filter(w => s[frId(w)] && s[frId(w)].due <= t); }
function frNew(words) { const s = frSrs(); return words.filter(w => !s[frId(w)]); }
function frGrade(w, good) {
  const s = frSrs(), id = frId(w), cur = s[id] || { box: 0 };
  const box = good ? Math.min(FR_BOX.length - 1, (cur.box || 0) + 1) : 0;
  s[id] = { box, due: frDay(good ? FR_BOX[box] : 0) }; store.set('bf-frsrs', s);
}
function frVocab(el, key, words, title) {
  let mode = 'list';
  const draw = () => {
    const due = frDue(words).length, fresh = frNew(words).length, known = words.length - fresh;
    el.innerHTML = `<div class="card frvocab"><div class="lvlhead"><h3 style="margin:0">${title || 'Vocabulary'}</h3><span class="section-sub" style="margin:0">${known}/${words.length} started · ${due} due today</span></div>
      <div class="chipbar" style="margin:10px 0 12px">${[['list', 'Word list'], ['cards', 'Flashcards'], ['quiz', 'Type it'], ['listen', 'Listening']].map(([k, l]) => `<button data-m="${k}" aria-pressed="${k === mode}">${l}</button>`).join('')}</div><div class="frvbody"></div></div>`;
    $$('[data-m]', el).forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); });
    const body = $('.frvbody', el);
    if (mode === 'list') body.innerHTML = `<div class="tblwrap"><table class="frtbl"><thead><tr><th>Français</th><th>English</th><th>Example</th></tr></thead><tbody>${words.map(w => `<tr><td>${FR(w[0])}</td><td>${w[1]}</td><td>${FR(w[2])}<div class="fxen">${w[3]}</div></td></tr>`).join('')}</tbody></table></div>`;
    else if (mode === 'cards') frCards(body, words, draw);
    else if (mode === 'quiz') frTypeQuiz(body, words);
    else frListen(body, words);
  };
  draw();
}
function frCards(body, words, done) {
  const queue = [...frDue(words), ...frNew(words).slice(0, 12)];
  if (!queue.length) { body.innerHTML = `<p style="margin:0">Nothing due in this deck today. Come back tomorrow, or practise with <b>Type it</b> and <b>Listening</b>.</p>`; return; }
  let i = 0, flipped = false;
  const show = () => {
    if (i >= queue.length) { body.innerHTML = `<p style="margin:0"><b class="ok">Session done.</b> Reviewed ${queue.length} card${queue.length > 1 ? 's' : ''}. Cards you knew come back later (1, 3, 7, 16, 35 days); the rest come back today.</p><button class="btn" style="margin-top:10px" data-again>Back to the deck</button>`; $('[data-again]', body).onclick = done; return; }
    const w = queue[i];
    body.innerHTML = `<div class="frcard${flipped ? ' flipped' : ''}" tabindex="0" role="button" aria-label="Flip card"><div class="frcf">${FR(w[0])}</div>${flipped ? `<div class="frcb"><b>${w[1]}</b><div>${FR(w[2])}</div><div class="fxen">${w[3]}</div></div>` : '<div class="frcb section-sub">Say the meaning, then tap to flip</div>'}</div>
      <div class="row" style="justify-content:space-between;margin-top:10px"><span class="section-sub" style="margin:0">Card ${i + 1} of ${queue.length}</span>
      <span class="row" style="gap:8px">${flipped ? '<button class="btn" data-g="0">Again</button><button class="btn primary" data-g="1">I knew it</button>' : '<button class="btn primary" data-flip>Flip</button>'}</span></div>`;
    if (!flipped) frSpeech.say(FR_STRIP(w[0]));
    const flip = () => { flipped = true; show(); };
    const c = $('.frcard', body); c.onclick = e => { if (!e.target.closest('.fr') && !flipped) flip(); };
    c.onkeydown = e => { if ((e.key === 'Enter' || e.key === ' ') && !flipped) { e.preventDefault(); flip(); } };
    if ($('[data-flip]', body)) $('[data-flip]', body).onclick = flip;
    $$('[data-g]', body).forEach(b => b.onclick = () => { frGrade(w, b.dataset.g === '1'); if (b.dataset.g !== '1') queue.push(w); i++; flipped = false; show(); });
  };
  show();
}
function frTypeQuiz(body, words) {
  const order = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
  let i = 0, score = 0;
  const ask = () => {
    if (i >= order.length) { body.innerHTML = `<p style="margin:0"><b>${score} / ${order.length}</b> correct.</p><button class="btn" style="margin-top:10px" data-more>Another round</button>`; $('[data-more]', body).onclick = () => frTypeQuiz(body, words); return; }
    const w = order[i];
    body.innerHTML = `<p style="margin:0 0 8px">How do you say <b>“${w[1]}”</b> in French? <span class="section-sub">(include le/la/un/une for nouns)</span></p>
      <div class="row"><input class="frin wide" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="French answer"><button class="btn primary" data-go>Check</button></div><div class="frfb" style="margin-top:8px"></div>`;
    const inp = $('.frin', body), fb = $('.frfb', body); inp.focus();
    let answered = false;
    const go = () => {
      if (answered) { i++; ask(); return; }
      const r = frCheck(inp.value, FR_STRIP(w[0]).replace(/\s*\(.*?\)\s*/g, ' ').trim().replace(/\s*\/\s*/g, '|'));
      answered = true; if (r === 'ok') score++;
      fb.innerHTML = (r === 'ok' ? '<b class="ok">✓ Correct.</b> ' : r === 'accent' ? '<b class="no">Almost, check the accents:</b> ' : r === 'article' ? '<b class="no">Almost, include the article:</b> ' : '<b class="no">✗</b> ') + FR(w[0]) + ` <span class="fxen">${FR(w[2])} — ${w[3]}</span>`;
      frSpeech.say(FR_STRIP(w[0])); $('[data-go]', body).textContent = 'Next';
    };
    inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    $('[data-go]', body).onclick = go;
  };
  ask();
}
function frListen(body, words) {
  if (!frSpeech.ok()) { body.innerHTML = '<p style="margin:0">Your browser has no speech synthesis, so listening practice is unavailable here.</p>'; return; }
  const order = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
  let i = 0, score = 0;
  const ask = () => {
    if (i >= order.length) { body.innerHTML = `<p style="margin:0"><b>${score} / ${order.length}</b> correct.</p><button class="btn" style="margin-top:10px" data-more>Another round</button>`; $('[data-more]', body).onclick = () => frListen(body, words); return; }
    const w = order[i], others = words.filter(x => x !== w).sort(() => Math.random() - 0.5).slice(0, 3), opts = [w, ...others].sort(() => Math.random() - 0.5);
    body.innerHTML = `<p style="margin:0 0 8px">Listen and choose the meaning. <button class="btn sm" data-play>▶ Play again</button> <button class="btn sm" data-slow>Slow</button></p><div class="qopts">${opts.map((o, j) => `<button data-j="${j}">${o[1]}</button>`).join('')}</div><div class="frfb" style="margin-top:8px"></div>`;
    const play = r => frSpeech.say(FR_STRIP(w[0]), r);
    play(); $('[data-play]', body).onclick = () => play(); $('[data-slow]', body).onclick = () => play(0.6);
    $$('.qopts button', body).forEach(b => b.onclick = () => {
      const ok = opts[+b.dataset.j] === w; if (ok) score++;
      $$('.qopts button', body).forEach(x => { x.disabled = true; if (opts[+x.dataset.j] === w) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      $('.frfb', body).innerHTML = `${FR(w[0])} — ${w[1]}. <button class="btn sm" data-next>Next</button>`;
      $('[data-next]', body).onclick = () => { i++; ask(); };
    });
  };
  ask();
}
/* mount hook used by sdTopicDetail for French topics */
function frMount(el, T) {
  el.innerHTML = frVoiceBar() + '<div data-frv></div><div data-fre></div>';
  frWireVoice(el);
  if (T.vocab) frVocab($('[data-frv]', el), T.key, T.vocab, T.name);
  if (T.ex) { const box = $('[data-fre]', el); box.style.marginTop = '14px'; frExercises(box, T.key, T.ex); }
}

/* ---------- conjugation engine ---------- */
const FR_P = ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'];
const FR_V = {
  // regular and spelling-change verbs: [english, group, aux, special présent (optional)]
  parler: ['to speak'], aimer: ['to like, to love'], habiter: ['to live (somewhere)'], travailler: ['to work'], étudier: ['to study'], regarder: ['to watch'], écouter: ['to listen'], chercher: ['to look for'], trouver: ['to find'], donner: ['to give'], demander: ['to ask'], penser: ['to think'],
  arriver: ['to arrive', 'être'], rester: ['to stay', 'être'], entrer: ['to enter', 'être'], tomber: ['to fall', 'être'], rentrer: ['to come home', 'être'],
  manger: ['to eat', null, ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent']],
  commencer: ['to begin', null, ['commence', 'commences', 'commence', 'commençons', 'commencez', 'commencent']],
  acheter: ['to buy', null, ['achète', 'achètes', 'achète', 'achetons', 'achetez', 'achètent'], 'achèter'],
  appeler: ['to call', null, ['appelle', 'appelles', 'appelle', 'appelons', 'appelez', 'appellent'], 'appeller'],
  préférer: ['to prefer', null, ['préfère', 'préfères', 'préfère', 'préférons', 'préférez', 'préfèrent']],
  envoyer: ['to send', null, ['envoie', 'envoies', 'envoie', 'envoyons', 'envoyez', 'envoient'], 'enverr'],
  finir: ['to finish'], choisir: ['to choose'], réussir: ['to succeed'], réfléchir: ['to think, to reflect'], remplir: ['to fill (in)'],
  vendre: ['to sell'], attendre: ['to wait (for)'], entendre: ['to hear'], répondre: ['to answer'], perdre: ['to lose'], descendre: ['to go down', 'être'],
  'se lever': ['to get up', 'être', ['lève', 'lèves', 'lève', 'levons', 'levez', 'lèvent'], 'lèver'], 'se laver': ['to wash (oneself)', 'être'], 'se coucher': ['to go to bed', 'être'], "s'habiller": ['to get dressed', 'être'], 'se souvenir': ['to remember', 'être']
};
/* irregular verbs: présent, past participle, aux, future stem, imparfait stem, subjonctif (full or null = rule), impératif */
const FR_IRR = {
  'être': { en: 'to be', pr: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], pp: 'été', fut: 'ser', imp: 'ét', subj: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'], imper: ['sois', 'soyons', 'soyez'] },
  avoir: { en: 'to have', pr: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], pp: 'eu', fut: 'aur', subj: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'], imper: ['aie', 'ayons', 'ayez'] },
  aller: { en: 'to go', pr: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], pp: 'allé', aux: 'être', fut: 'ir', subj: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'], imper: ['va', 'allons', 'allez'] },
  faire: { en: 'to do, to make', pr: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], pp: 'fait', fut: 'fer', subj: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'], imper: ['fais', 'faisons', 'faites'] },
  pouvoir: { en: 'to be able to, can', pr: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'], pp: 'pu', fut: 'pourr', subj: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'], imper: null },
  vouloir: { en: 'to want', pr: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'], pp: 'voulu', fut: 'voudr', subj: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'], imper: ['veuille', 'veuillons', 'veuillez'] },
  devoir: { en: 'to have to, must', pr: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'], pp: 'dû', fut: 'devr', imper: null },
  savoir: { en: 'to know (a fact)', pr: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'], pp: 'su', fut: 'saur', subj: ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent'], imper: ['sache', 'sachons', 'sachez'] },
  connaître: { en: 'to know (a person, a place)', pr: ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'], pp: 'connu', fut: 'connaîtr' },
  venir: { en: 'to come', pr: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], pp: 'venu', aux: 'être', fut: 'viendr' },
  tenir: { en: 'to hold', pr: ['tiens', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent'], pp: 'tenu', fut: 'tiendr' },
  prendre: { en: 'to take', pr: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], pp: 'pris', fut: 'prendr' },
  mettre: { en: 'to put', pr: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'], pp: 'mis', fut: 'mettr' },
  dire: { en: 'to say', pr: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], pp: 'dit', fut: 'dir', imper: ['dis', 'disons', 'dites'] },
  voir: { en: 'to see', pr: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'], pp: 'vu', fut: 'verr' },
  lire: { en: 'to read', pr: ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'], pp: 'lu', fut: 'lir' },
  écrire: { en: 'to write', pr: ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'], pp: 'écrit', fut: 'écrir' },
  boire: { en: 'to drink', pr: ['bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'], pp: 'bu', fut: 'boir' },
  croire: { en: 'to believe', pr: ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'], pp: 'cru', fut: 'croir' },
  recevoir: { en: 'to receive', pr: ['reçois', 'reçois', 'reçoit', 'recevons', 'recevez', 'reçoivent'], pp: 'reçu', fut: 'recevr' },
  partir: { en: 'to leave', pr: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'], pp: 'parti', aux: 'être', fut: 'partir' },
  sortir: { en: 'to go out', pr: ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'], pp: 'sorti', aux: 'être', fut: 'sortir' },
  dormir: { en: 'to sleep', pr: ['dors', 'dors', 'dort', 'dormons', 'dormez', 'dorment'], pp: 'dormi', fut: 'dormir' },
  ouvrir: { en: 'to open', pr: ['ouvre', 'ouvres', 'ouvre', 'ouvrons', 'ouvrez', 'ouvrent'], pp: 'ouvert', fut: 'ouvrir', imper: ['ouvre', 'ouvrons', 'ouvrez'] },
  vivre: { en: 'to live', pr: ['vis', 'vis', 'vit', 'vivons', 'vivez', 'vivent'], pp: 'vécu', fut: 'vivr' },
  courir: { en: 'to run', pr: ['cours', 'cours', 'court', 'courons', 'courez', 'courent'], pp: 'couru', fut: 'courr' },
  mourir: { en: 'to die', pr: ['meurs', 'meurs', 'meurt', 'mourons', 'mourez', 'meurent'], pp: 'mort', aux: 'être', fut: 'mourr' },
  suivre: { en: 'to follow', pr: ['suis', 'suis', 'suit', 'suivons', 'suivez', 'suivent'], pp: 'suivi', fut: 'suivr' },
  conduire: { en: 'to drive', pr: ['conduis', 'conduis', 'conduit', 'conduisons', 'conduisez', 'conduisent'], pp: 'conduit', fut: 'conduir' },
  plaire: { en: 'to please', pr: ['plais', 'plais', 'plaît', 'plaisons', 'plaisez', 'plaisent'], pp: 'plu', fut: 'plair' }
};
const FR_TENSES = [['present', 'Présent'], ['pc', 'Passé composé'], ['imparfait', 'Imparfait'], ['pqp', 'Plus-que-parfait'], ['futur', 'Futur simple'], ['futant', 'Futur antérieur'], ['cond', 'Conditionnel présent'], ['condpasse', 'Conditionnel passé'], ['subj', 'Subjonctif présent'], ['subjpasse', 'Subjonctif passé'], ['imper', 'Impératif']];
const FR_ALL_VERBS = () => [...Object.keys(FR_IRR), ...Object.keys(FR_V)];
function frVerb(inf) {
  if (FR_IRR[inf]) { const v = FR_IRR[inf]; return { inf, en: v.en, refl: false, pr: v.pr, pp: v.pp, aux: v.aux || 'avoir', fut: v.fut, imp: v.imp, subj: v.subj, imper: v.imper === undefined ? 'rule' : v.imper }; }
  const [en, aux, pr, fut] = FR_V[inf]; const refl = /^(se |s')/.test(inf); const base = inf.replace(/^(se |s')/, '');
  const g = base.endsWith('er') ? 'er' : base.endsWith('ir') ? 'ir' : 're', st = base.slice(0, -2);
  const present = pr || (g === 'er' ? ['e', 'es', 'e', 'ons', 'ez', 'ent'] : g === 'ir' ? ['is', 'is', 'it', 'issons', 'issez', 'issent'] : ['s', 's', '', 'ons', 'ez', 'ent']).map(e => st + e);
  if (base === 'souvenir') { present.splice(0, 6, 'souviens', 'souviens', 'souvient', 'souvenons', 'souvenez', 'souviennent'); }
  const pp = base === 'souvenir' ? 'souvenu' : st + (g === 'er' ? 'é' : g === 'ir' ? 'i' : 'u');
  const futStem = base === 'souvenir' ? 'souviendr' : fut || (g === 're' ? base.slice(0, -1) : base);
  return { inf, en, refl, pr: present, pp, aux: refl ? 'être' : (aux || 'avoir'), fut: futStem, imp: null, subj: null, imper: 'rule' };
}
const FR_AUX = { avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], 'être': ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'] };
const FR_AUX_IMP = { avoir: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'], 'être': ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'] };
const FR_AUX_FUT = { avoir: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'], 'être': ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'] };
const FR_AUX_COND = { avoir: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'], 'être': ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'] };
const FR_AUX_SUBJ = { avoir: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'], 'être': ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'] };
const frJoin = (stem, end) => { // spelling fixes: mange+ions → mangions, commenç+ions → commencions
  if (/^[ie]/.test(end) && stem.endsWith('ge')) return stem.slice(0, -1) + end;
  if (/^[ie]/.test(end) && stem.endsWith('ç')) return stem.slice(0, -1) + 'c' + end;
  return stem + end;
};
function frForms(inf, tense) {
  const v = frVerb(inf);
  const impStem = v.imp || v.pr[3].replace(/ons$/, '').replace(/ç$/, 'ç');
  const imparfait = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'].map(e => frJoin(impStem, e));
  const ppx = i => v.aux === 'être' ? v.pp + ['(e)', '(e)', '(e)', '(e)s', '(e)(s)', 's'][i] : v.pp;
  const comp = auxT => auxT[v.aux].map((a, i) => a + ' ' + ppx(i));
  switch (tense) {
    case 'present': return v.pr;
    case 'imparfait': return imparfait;
    case 'futur': return ['ai', 'as', 'a', 'ons', 'ez', 'ont'].map(e => v.fut + e);
    case 'cond': return ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'].map(e => v.fut + e);
    case 'subj': {
      if (v.subj) return v.subj;
      const s3 = v.pr[5].replace(/ent$/, '');
      return [s3 + 'e', s3 + 'es', s3 + 'e', imparfait[3], imparfait[4], s3 + 'ent'];
    }
    case 'pc': return comp(FR_AUX);
    case 'pqp': return comp(FR_AUX_IMP);
    case 'futant': return comp(FR_AUX_FUT);
    case 'condpasse': return comp(FR_AUX_COND);
    case 'subjpasse': return comp(FR_AUX_SUBJ);
    case 'imper': {
      if (v.imper === null) return null;
      if (Array.isArray(v.imper)) return [null, v.imper[0], null, v.imper[1], v.imper[2], null];
      let tu = v.pr[1]; if (/er$/.test(v.inf) && tu.endsWith('es')) tu = tu.slice(0, -1);
      return [null, tu, null, v.pr[3], v.pr[4], null];
    }
  }
}
const FR_VOWEL = /^[aeiouyhâàéèêëîïôœù]/i;
/* full conjugated phrase with the pronoun, elision and reflexive pronoun */
function frPhrase(inf, tense, i) {
  const v = frVerb(inf), f = frForms(inf, tense); if (!f || !f[i]) return null;
  const word = f[i];
  if (tense === 'imper') {
    if (!v.refl) return word + ' !';
    return word + '-' + ['', 'toi', '', 'nous', 'vous', ''][i] + ' !';
  }
  let pron = ['je', 'tu', 'il', 'nous', 'vous', 'ils'][i];
  if (v.refl) {
    const rp = ['me', 'te', 'se', 'nous', 'vous', 'se'][i];
    const r = FR_VOWEL.test(word) && i !== 3 && i !== 4 ? rp[0] + '’' + word : rp + ' ' + word;
    return (tense.startsWith('subj') ? (i === 2 || i === 5 ? 'qu’' : 'que ') : '') + pron + ' ' + r;
  }
  const out = (pron === 'je' && FR_VOWEL.test(word)) ? 'j’' + word : pron + ' ' + word;
  if (tense.startsWith('subj')) return (i === 2 || i === 5 ? 'qu’' : 'que ') + out;
  return out;
}

/* ---------- conjugation lab (a "learn" lesson) ---------- */
const frLessons = [
{ id: 'fr-conj', title: 'Conjugation lab', lede: 'Pick any of 65+ common verbs and any tense to see the full table with audio, then drill yourself: you get a verb, a tense and a person, and type the form.',
  render(root) {
    let verb = store.get('bf-frverb', 'être'), tense = store.get('bf-frtense', 'present');
    root.innerHTML = `${frVoiceBar()}<div class="bench"><div class="lab-grid">
      <label><span>Verb</span><select id="cvv">${FR_ALL_VERBS().map(x => `<option value="${x}" ${x === verb ? 'selected' : ''}>${x} — ${frVerb(x).en}</option>`).join('')}</select></label>
      <label><span>Tense</span><select id="cvt">${FR_TENSES.map(([k, l]) => `<option value="${k}" ${k === tense ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <div id="cvtab" style="margin-top:12px"></div><p class="section-sub" id="cvnote" style="margin:8px 0 0"></p></div>
      <h2 class="section-title">Drill</h2><div class="card"><div class="chipbar" id="cvlvl">${[['a1', 'A1: présent'], ['a2', 'A2: + passé composé, imparfait, futur'], ['b1', 'B1: + conditionnel, subjonctif'], ['b2', 'B2+: all tenses']].map(([k, l], j) => `<button data-l="${k}" aria-pressed="${j === 0}">${l}</button>`).join('')}</div>
      <div id="cvq" style="margin-top:12px"></div></div>`;
    frWireVoice(root);
    const tab = () => {
      const f = frForms(verb, tense), v = frVerb(verb);
      if (!f) { $('#cvtab', root).innerHTML = '<p style="margin:0">This verb has no imperative.</p>'; $('#cvnote', root).textContent = ''; return; }
      $('#cvtab', root).innerHTML = `<div class="tblwrap"><table class="frtbl conj"><tbody>${f.map((x, i) => x ? `<tr><th>${tense === 'imper' ? ['', 'tu', '', 'nous', 'vous', ''][i] : FR_P[i]}</th><td>${FR(frPhrase(verb, tense, i))}</td></tr>` : '').join('')}</tbody></table></div>`;
      $('#cvnote', root).textContent = `${verb} (${v.en}) · auxiliary: ${v.aux} · past participle: ${v.pp}${v.aux === 'être' ? ' (agrees with the subject)' : ''} · future stem: ${v.fut}-`;
    };
    $('#cvv', root).onchange = e => { verb = e.target.value; store.set('bf-frverb', verb); tab(); };
    $('#cvt', root).onchange = e => { tense = e.target.value; store.set('bf-frtense', tense); tab(); };
    tab();
    const LV = { a1: ['present'], a2: ['present', 'pc', 'imparfait', 'futur'], b1: ['present', 'pc', 'imparfait', 'futur', 'cond', 'subj', 'pqp'], b2: FR_TENSES.map(t => t[0]).filter(t => t !== 'imper') };
    let lvl = 'a1', score = 0, n = 0;
    const q = () => {
      const tenses = LV[lvl], vs = FR_ALL_VERBS();
      const vb = vs[Math.floor(Math.random() * vs.length)], t = tenses[Math.floor(Math.random() * tenses.length)], i = Math.floor(Math.random() * 6);
      const full = frPhrase(vb, t, i), form = frForms(vb, t)[i];
      const accept = [full, full.replace(/\(e\)|\(s\)/g, ''), full.replace(/\((e|s)\)/g, '$1').replace(/\(/g, '').replace(/\)/g, '')].join('|');
      $('#cvq', root).innerHTML = `<p style="margin:0 0 8px"><b>${vb}</b> (${frVerb(vb).en}) · <b>${FR_TENSES.find(x => x[0] === t)[1]}</b> · <b>${FR_P[i].split('/')[0]}</b></p>
        <div class="row"><input class="frin wide" id="cvin" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="Conjugated form" placeholder="${t.startsWith('subj') ? 'que je …' : 'je …'}"><button class="btn primary" id="cvgo">Check</button></div>
        <div class="frfb" id="cvfb" style="margin-top:8px"></div><p class="section-sub" style="margin:8px 0 0">Score: ${score} / ${n}. Type the whole phrase with the pronoun (or just the verb form).</p>`;
      const inp = $('#cvin', root); inp.focus(); let done = false;
      const go = () => {
        if (done) { q(); return; }
        const val = inp.value, r = frCheck(val, accept + '|' + form.replace(/\(.*?\)/g, ''));
        done = true; n++; if (r === 'ok') score++;
        $('#cvfb', root).innerHTML = (r === 'ok' ? '<b class="ok">✓</b> ' : r === 'accent' ? '<b class="no">Almost, accents:</b> ' : '<b class="no">✗</b> ') + FR(full);
        frSpeech.say(full.replace(/\(.*?\)/g, '')); $('#cvgo', root).textContent = 'Next';
      };
      inp.onkeydown = e => { if (e.key === 'Enter') go(); };
      $('#cvgo', root).onclick = go;
    };
    $$('#cvlvl button', root).forEach(b => b.onclick = () => { lvl = b.dataset.l; $$('#cvlvl button', root).forEach(x => x.setAttribute('aria-pressed', x === b)); q(); });
    q();
  } }
];
