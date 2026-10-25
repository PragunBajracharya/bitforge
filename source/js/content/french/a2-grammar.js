/* ===== French A2: irregular present, reflexive verbs, passé composé, imparfait, object pronouns, y & en, partitive, comparisons, futur simple, relatives & imperative ===== */
FRT('fr-present-irr', { name: 'Present tense: -ir, -re & irregular verbs', cat: 'fra2',
  blurb: `Beyond -er verbs: the regular -ir (finir) and -re (vendre) patterns, and the irregular verbs you use every day: pouvoir, vouloir, devoir, prendre, venir, savoir, connaître, mettre, dire, voir. Plus venir de (just did) and the modal verbs for asking politely.`,
  facts: [['-ir (finir)', '-is -is -it -issons -issez -issent'], ['-re (vendre)', '-s -s – -ons -ez -ent'], ['Modals', 'pouvoir, vouloir, devoir + infinitive'], ['Recent past', 'venir de + infinitive']],
  cheat: [['je finis, nous finissons', 'finir, choisir, réussir, remplir'], ['je vends, il vend', 'vendre, attendre, répondre, entendre, perdre'], ['je peux / veux / dois', 'I can / want / must'], ['je prends, nous prenons, ils prennent', 'prendre, apprendre, comprendre'], ['je viens, ils viennent', 'venir, devenir, revenir, tenir'], ['je sais / je connais', 'know a fact / know a person or place'], ['je mets, je dis, je vois, je lis, j’écris', 'mettre, dire, voir, lire, écrire'], ['Je viens de manger.', 'I have just eaten.'], ['partir, sortir, dormir', 'je pars, nous partons (no -iss-)']],
  sections: [
    ['Regular -ir and -re', TBL(['', 'finir (to finish)', 'vendre (to sell)'], [['je', FR('je finis'), FR('je vends')], ['tu', FR('tu finis'), FR('tu vends')], ['il/elle', FR('il finit'), FR('il vend')], ['nous', FR('nous finissons'), FR('nous vendons')], ['vous', FR('vous finissez'), FR('vous vendez')], ['ils/elles', FR('ils finissent'), FR('ils vendent')]]) +
      PP(`Careful: partir, sortir, dormir, servir end in -ir but do not take -iss-: ${FR('je pars')}, ${FR('nous partons')}.`)],
    ['The modal verbs', FXS([['Je peux vous aider ?', 'Can I help you?'], ['Nous voulons ouvrir un compte bancaire.', 'We want to open a bank account.'], ['Vous devez remplir ce formulaire.', 'You have to fill in this form.'], ['Est-ce que je peux payer par carte ?', 'Can I pay by card?']]) +
      PP(`These are followed directly by an infinitive. ${FR('Je voudrais')} (conditional of vouloir) is the polite “I would like”.`)],
    ['Savoir or connaître?', PP(`<b>savoir</b> = to know a fact, how to do something, or before que/si/où/quand: ${FR('Je sais nager.')}, ${FR('Tu sais où est la banque ?')}. <b>connaître</b> = to be familiar with a person, a place or a thing: ${FR('Je connais bien Toronto.')}, ${FR('Vous connaissez mon collègue ?')}`)],
    ['Venir de and être en train de', PP(`Recent past: ${FR('Je viens d’arriver au Canada.')} (I have just arrived.) Ongoing action: ${FR('Je suis en train de préparer le dîner.')} Use the Conjugation lab to see every form of these verbs.`)]
  ],
  edge: [`“Je connais nager” ✗ → ${FR('Je sais nager')}.`, `“Nous partissons” ✗ → ${FR('nous partons')}.`, `“Ils prendent” ✗ → ${FR('ils prennent')}.`, `Adding “de” after modals: “Je peux de venir” ✗ → ${FR('Je peux venir')}.`],
  ex: [[`Nous ___ le travail à 17 h. (finir)`, `finissons`, `We finish work at 5 p.m.`, ''],
    [`J’___ le bus depuis 20 minutes. (attendre)`, `attends`, `I’ve been waiting for the bus for 20 minutes.`, ''],
    [`Ils ___ le métro tous les jours. (prendre)`, `prennent`, `They take the metro every day.`, ''],
    [`Vous ___ présenter vos documents. (devoir)`, `devez`, `You must present your documents.`, ''],
    [`Tu ___ où est la mairie ? (savoir)`, `sais`, `Do you know where city hall is?`, 'a fact → savoir'],
    [`Je ___ bien cette région. (connaître)`, `connais`, `I know this region well.`, 'a place → connaître'],
    [`Elle vient ___ trouver un emploi.`, `de`, `She has just found a job.`, 'venir de + infinitive'],
    [`Est-ce que je ___ entrer ? (pouvoir)`, `peux`, `May I come in?`, '']],
  qs: [SQ('“I know your sister.”', ['Je sais ta sœur.', 'Je connais ta sœur.', 'Je connaisse ta sœur.', 'Je sache ta sœur.'], 1, 'People → connaître.'),
    SQ('“They are leaving.” (partir)', ['Ils partissent.', 'Ils partent.', 'Ils parent.', 'Ils partirent.'], 1, 'partir has no -iss-: ils partent.')]
});

FRT('fr-reflexive', { name: 'Reflexive (pronominal) verbs', cat: 'fra2',
  blurb: `Daily-routine verbs like se lever, se laver, s’habiller and many common verbs like se souvenir, s’inscrire and s’occuper de use a reflexive pronoun that matches the subject. They take être in the passé composé.`,
  facts: [['Pronouns', 'me, te, se, nous, vous, se'], ['Before a vowel', 'm’, t’, s’'], ['Compound tenses', 'être'], ['Imperative', 'lève-toi / ne te lève pas']],
  cheat: [['je me lève', 'I get up'], ['tu te réveilles', 'you wake up'], ['il s’habille', 'he gets dressed'], ['nous nous dépêchons', 'we hurry'], ['vous vous inscrivez', 'you register'], ['ils se couchent', 'they go to bed'], ['se souvenir de / s’occuper de', 'to remember / to take care of'], ['s’appeler / s’entendre bien avec', 'to be called / to get along with'], ['Je me suis levé(e)', 'passé composé with être'], ['Lève-toi ! / Ne te lève pas !', 'imperative']],
  sections: [
    ['Forms and placement', PP(`The pronoun comes right before the verb: ${FR('Je me réveille à 6 h.')} Negative: ${FR('Je ne me réveille pas tôt.')} With an infinitive, the pronoun matches the subject: ${FR('Je vais me coucher.')}, ${FR('Nous devons nous inscrire.')}`)],
    ['A daily routine', FXS([['Je me réveille à six heures et je me lève tout de suite.', 'I wake up at six and get up right away.'], ['Je me douche, je m’habille et je me brosse les dents.', 'I shower, get dressed and brush my teeth.'], ['Les enfants se dépêchent pour ne pas rater le bus.', 'The children hurry so they don’t miss the bus.'], ['Le soir, on se repose et on se couche vers onze heures.', 'In the evening we rest and go to bed around eleven.']])],
    ['Reciprocal and idiomatic uses', PP(`Plural reflexives can mean “each other”: ${FR('Ils s’écrivent tous les jours.')} Many verbs change meaning: ${FR('s’ennuyer')} (to be bored), ${FR('se rendre compte')} (to realize), ${FR('se tromper')} (to be mistaken), ${FR('s’en aller')} (to leave), ${FR('se plaindre')} (to complain), ${FR('s’adapter')} (to adapt) ${FR('Je me suis vite adapté à la vie à Québec.')}`)],
    ['Past tense', PP(`Reflexive verbs always take être, and the participle usually agrees with the subject: ${FR('Elle s’est levée tôt.')} ${FR('Nous nous sommes inscrits au cours.')} No agreement when a direct object follows: ${FR('Elle s’est lavé les mains.')}`)]
  ],
  edge: [`Forgetting the pronoun: “Je lève à 7 h” means “I lift at 7” → ${FR('Je me lève à 7 h')}.`, `Using avoir: “Je m’ai levé” ✗ → ${FR('Je me suis levé')}.`, `Wrong pronoun with an infinitive: “Je vais se coucher” ✗ → ${FR('Je vais me coucher')}.`, `Body parts take le/la, not possessives: ${FR('Je me lave les mains')}, not “mes mains”.`],
  ex: [[`Je ___ lève à 6 h 30.`, `me`, `I get up at 6:30.`, ''],
    [`Tu ___ habilles vite.`, `t’|t'`, `You get dressed quickly.`, 'te → t’ before a vowel'],
    [`Nous ___ couchons tard le samedi.`, `nous`, `We go to bed late on Saturdays.`, ''],
    [`Ils ___ entendent bien avec leurs voisins.`, `s’|s'`, `They get along well with their neighbours.`, ''],
    [`Je vais ___ inscrire au cours de français.`, `m’|m'`, `I’m going to register for the French class.`, 'pronoun matches je'],
    [`Elle s’est ___ à 7 h. (lever)`, `levée`, `She got up at 7.`, 'être + agreement'],
    [`Vous vous ___ de son nom ? (souvenir)`, `souvenez`, `Do you remember his name?`, ''],
    [`Dépêche-___ ! (hurry up, tu)`, `toi`, `Hurry up!`, 'imperative: -toi']],
  qs: [SQ('“We got up early.” (women)', ['Nous avons levé tôt.', 'Nous nous sommes levées tôt.', 'Nous sommes levés tôt.', 'Nous nous avons levées tôt.'], 1, 'Reflexive + être + agreement.'),
    SQ('“I’m going to get dressed.”', ['Je vais m’habiller.', 'Je vais s’habiller.', 'Je m’vais habiller.', 'Je vais habiller.'], 0, 'The pronoun goes before the infinitive and matches je.')]
});

FRT('fr-pc', { name: 'Passé composé', cat: 'fra2',
  blurb: `The main past tense for completed actions: auxiliary (avoir or être) in the present + past participle. Learn regular and irregular participles, which verbs take être, and when the participle agrees.`,
  facts: [['Form', 'avoir/être + participle'], ['Most verbs', 'avoir'], ['être verbs', 'movement/change of state + reflexives'], ['Agreement', 'être: with subject']],
  cheat: [['-er → -é', 'parler → parlé'], ['-ir → -i', 'finir → fini, partir → parti'], ['-re → -u', 'vendre → vendu, attendre → attendu'], ['Irregular', 'être → été, avoir → eu, faire → fait, prendre → pris, mettre → mis, dire → dit, écrire → écrit, voir → vu, lire → lu, boire → bu, pouvoir → pu, vouloir → voulu, devoir → dû, savoir → su, venir → venu, ouvrir → ouvert, naître → né, mourir → mort'], ['être verbs', 'aller, venir, arriver, partir, entrer, sortir, monter, descendre, naître, mourir, rester, tomber, retourner, rentrer, devenir, revenir, passer (par)'], ['Agreement with être', 'Elle est partie. Ils sont arrivés.'], ['Negative', 'Je n’ai pas fini.']],
  sections: [
    ['Avoir + participle', FXS([['J’ai travaillé dans une usine pendant cinq ans.', 'I worked in a factory for five years.'], ['Nous avons visité Québec l’été dernier.', 'We visited Quebec City last summer.'], ['Tu as reçu ma lettre ?', 'Did you get my letter?'], ['Ils ont pris l’avion à Vancouver.', 'They took the plane in Vancouver.']])],
    ['Être + participle', PP(`About 17 verbs of movement or change of state, and all reflexive verbs, use <b>être</b>. Think of the house: you <i>arrive</i>, <i>enter</i>, go <i>up</i>, go <i>down</i>, <i>go out</i>, <i>leave</i>, <i>stay</i>, <i>fall</i>… and you are <i>born</i> and <i>die</i>. The participle agrees with the subject like an adjective: ${FR('Elle est arrivée en 2023.')} ${FR('Mes parents sont venus me voir.')} ${FR('Nous sommes restés deux semaines.')}`) +
      PP(`Monter, descendre, sortir, rentrer, passer, retourner take <b>avoir</b> when they have a direct object: ${FR('J’ai sorti la poubelle.')} vs ${FR('Je suis sorti avec des amis.')}`)],
    ['Agreement with avoir', PP(`With avoir, the participle agrees only with a <b>direct object placed before</b> the verb (often a pronoun): ${FR('Les lettres ? Je les ai envoyées.')} ${FR('La maison que nous avons achetée.')} No agreement otherwise: ${FR('J’ai envoyé les lettres.')} This shows in writing and in a few participles you can hear: ${FR('Je l’ai prise.')}`)],
    ['Word order', PP(`Short adverbs go between the auxiliary and the participle: ${FR('J’ai déjà mangé.')}, ${FR('Il a bien compris.')}, ${FR('Nous avons beaucoup travaillé.')}. Negation surrounds the auxiliary: ${FR('Je n’ai jamais vu la mer.')}`)]
  ],
  edge: [`“Je suis allé” for a woman → ${FR('je suis allée')} (written).`, `“J’ai allé” ✗ → ${FR('je suis allé')}.`, `“Il a venu” ✗ → ${FR('il est venu')}.`, `Mistaking participles: ${FR('pris')} (not “prendu”), ${FR('mis')}, ${FR('fait')}, ${FR('écrit')}.`],
  ex: [[`Hier, j’___ travaillé jusqu’à 20 h.`, `ai`, `Yesterday I worked until 8 p.m.`, ''],
    [`Elle ___ arrivée au Canada en 2022.`, `est`, `She arrived in Canada in 2022.`, 'arriver → être'],
    [`Nous avons ___ le train. (prendre)`, `pris`, `We took the train.`, ''],
    [`Ils sont ___ au restaurant. (aller)`, `allés`, `They went to the restaurant.`, 'agreement: masculine plural'],
    [`J’ai ___ un courriel au propriétaire. (écrire)`, `écrit`, `I wrote an email to the landlord.`, ''],
    [`Tu as ___ le film ? (voir)`, `vu`, `Did you see the film?`, ''],
    [`Je n’ai ___ compris la question. (not)`, `pas`, `I didn’t understand the question.`, ''],
    [`Les clés ? Je les ai ___ sur la table. (mettre)`, `mises`, `The keys? I put them on the table.`, 'agreement with les (clés, f. pl.) placed before']],
  qs: [SQ('Which verb takes être?', ['manger', 'partir', 'prendre', 'acheter'], 1, 'partir is a verb of movement.'),
    SQ('“She was born in Manila.”', ['Elle a né à Manille.', 'Elle est née à Manille.', 'Elle est né à Manille.', 'Elle naissait à Manille.'], 1, 'naître → être, agreement with elle.')]
});

FRT('fr-imparfait', { name: 'Imparfait & imparfait vs passé composé', cat: 'fra2',
  blurb: `The imparfait describes the background in the past: what things were like, what used to happen, and what was going on when something else happened. Choosing between imparfait and passé composé is the key skill for telling stories.`,
  facts: [['Stem', 'nous-form minus -ons'], ['Endings', '-ais -ais -ait -ions -iez -aient'], ['Only exception', 'être → ét-'], ['Use', 'description, habit, ongoing action']],
  cheat: [['nous parlons → je parlais', 'stem parl-'], ['nous finissons → je finissais', 'stem finiss-'], ['nous faisons → je faisais', 'stem fais-'], ['être → j’étais', 'the only irregular stem'], ['Description', 'Il faisait froid, j’étais fatigué.'], ['Habit (used to)', 'Quand j’étais petit, je jouais au soccer.'], ['Ongoing + interruption', 'Je dormais quand le téléphone a sonné.'], ['Signal words (imparfait)', 'souvent, tous les jours, d’habitude, autrefois, quand j’étais…'], ['Signal words (PC)', 'hier, soudain, un jour, tout à coup, en 2020, trois fois']],
  sections: [
    ['Formation', TBL(['', 'parler', 'avoir', 'être'], [['je', FR('je parlais'), FR('j’avais'), FR('j’étais')], ['tu', FR('tu parlais'), FR('tu avais'), FR('tu étais')], ['il/elle', FR('il parlait'), FR('il avait'), FR('il était')], ['nous', FR('nous parlions'), FR('nous avions'), FR('nous étions')], ['vous', FR('vous parliez'), FR('vous aviez'), FR('vous étiez')], ['ils/elles', FR('ils parlaient'), FR('ils avaient'), FR('ils étaient')]])],
    ['Imparfait or passé composé?', TBL(['Imparfait (background)', 'Passé composé (events)'], [['What was going on', 'What happened'], [FR('Il pleuvait.'), FR('Il a plu toute la journée.') + ' (a completed, defined period)'], [FR('Je travaillais dans un restaurant.'), FR('J’ai travaillé trois ans dans un restaurant.')], [FR('Nous étions contents.'), FR('Nous avons été très surpris.') + ' (a reaction at a moment)'], [FR('Je lisais quand…'), FR('… mon ami est arrivé.')]]) +
      PP(`A useful test: if you could say “was …-ing” or “used to” in English, use the imparfait. If it is a step in the story (“then”), use the passé composé.`)],
    ['A short story', FXS([['Quand je suis arrivé à Montréal, il faisait très froid.', 'When I arrived in Montreal, it was very cold.'], ['Je ne connaissais personne et je ne parlais pas bien français.', 'I didn’t know anyone and I didn’t speak French well.'], ['Un jour, ma voisine m’a invité à dîner.', 'One day, my neighbour invited me to dinner.'], ['Nous avons parlé pendant des heures et elle est devenue une amie.', 'We talked for hours and she became a friend.']])],
    ['Other uses', PP(`Polite requests and suggestions: ${FR('Je voulais vous demander un renseignement.')} ${FR('Si on allait au cinéma ?')} After si for unreal conditions (see B1): ${FR('Si j’avais le temps, je voyagerais.')}`)]
  ],
  edge: [`Using imparfait for a sequence of events: “Je me levais, je prenais une douche…” only if it describes a habit.`, `Using PC for descriptions: “Il a été beau” → ${FR('Il faisait beau')}.`, `Forgetting the i in nous/vous: ${FR('nous étudiions')} (two i’s).`, `Manger/commencer: ${FR('je mangeais')}, ${FR('je commençais')}.`],
  ex: [[`Quand j’étais jeune, j’___ à la campagne. (habiter)`, `habitais`, `When I was young, I lived in the countryside.`, 'habit/description'],
    [`Il ___ beau ce jour-là. (faire)`, `faisait`, `The weather was nice that day.`, ''],
    [`Nous ___ la télé quand tu as appelé. (regarder)`, `regardions`, `We were watching TV when you called.`, 'ongoing action'],
    [`Je dormais quand l’alarme ___ sonné.`, `a`, `I was sleeping when the alarm went off.`, 'interruption → passé composé'],
    [`Avant, ils ___ en Inde. (être)`, `étaient`, `Before, they were in India.`, ''],
    [`Tous les étés, nous ___ à la plage. (aller)`, `allions`, `Every summer we went to the beach.`, ''],
    [`Hier, j’___ un entretien d’embauche. (avoir, PC)`, `ai eu`, `Yesterday I had a job interview.`, 'a completed event'],
    [`Elle ___ fatiguée, alors elle est rentrée. (être)`, `était`, `She was tired, so she went home.`, 'description']],
  qs: [SQ('“I used to work at night.”', ['J’ai travaillé la nuit.', 'Je travaillais la nuit.', 'Je travaille la nuit.', 'J’avais travaillé la nuit.'], 1, 'Habit in the past → imparfait.'),
    SQ('“I was reading when the phone rang.”', ['Je lisais quand le téléphone a sonné.', 'J’ai lu quand le téléphone sonnait.', 'Je lisais quand le téléphone sonnait.', 'J’ai lu quand le téléphone a sonné.'], 0, 'Background (imparfait) + interrupting event (PC).')]
});

FRT('fr-pronouns-od', { name: 'Object pronouns: le, la, lui, leur', cat: 'fra2',
  blurb: `Replace nouns to avoid repetition: direct objects (le, la, les) answer “what/whom?”, indirect objects (lui, leur) replace “à + person”. They go before the verb, which is the opposite of English.`,
  facts: [['Direct', 'me, te, le/la, nous, vous, les'], ['Indirect', 'me, te, lui, nous, vous, leur'], ['Position', 'before the conjugated verb'], ['With infinitive', 'before the infinitive']],
  cheat: [['Je vois Marie → Je la vois.', 'direct object'], ['Je parle à Marie → Je lui parle.', 'indirect (à + person)'], ['Je les appelle.', 'I call them.'], ['Je leur téléphone.', 'I phone them.'], ['Je vais le faire.', 'pronoun before the infinitive'], ['Je ne l’ai pas vu.', 'negative compound tense'], ['Donne-le-moi ! / Ne me le donne pas.', 'imperative'], ['Verbs with à + person', 'parler, téléphoner, écrire, répondre, donner, demander, dire, envoyer, conseiller à qqn'], ['Verbs with a direct object', 'aider, attendre, écouter, regarder, chercher, appeler qqn']],
  sections: [
    ['Direct or indirect?', PP(`If the verb is followed directly by the noun, use a <b>direct</b> pronoun: ${FR('J’aide ma voisine.')} → ${FR('Je l’aide.')} If there is <b>à + person</b>, use an <b>indirect</b> pronoun: ${FR('Je téléphone à ma voisine.')} → ${FR('Je lui téléphone.')} English is a poor guide: ${FR('attendre quelqu’un')} (wait for someone) is direct; ${FR('répondre à quelqu’un')} (answer someone) is indirect.`)],
    ['Position', TBL(['Structure', 'Example'], [['Present', FR('Je le connais.')], ['Negative', FR('Je ne le connais pas.')], ['Passé composé', FR('Je l’ai rencontré hier.')], ['Verb + infinitive', FR('Je vais lui écrire.') + ' ' + FR('Je peux vous aider ?')], ['Imperative (affirmative)', FR('Appelle-moi !') + ' ' + FR('Écris-leur !')], ['Imperative (negative)', FR('Ne m’appelle pas.')]])],
    ['In use', FXS([['Le formulaire ? Je l’ai déjà rempli.', 'The form? I’ve already filled it in.'], ['Ma propriétaire ? Je lui ai envoyé un message.', 'My landlady? I sent her a message.'], ['Vos enfants ? Je les vois tous les matins.', 'Your children? I see them every morning.'], ['Nos clients ? Nous leur répondons sous 24 heures.', 'Our clients? We answer them within 24 hours.']])]
  ],
  edge: [`Placing the pronoun after the verb: “Je vois la” ✗ → ${FR('Je la vois')}.`, `“Je lui aide” ✗: aider is direct → ${FR('Je l’aide')}.`, `“Leurs” is a possessive; the pronoun is ${FR('leur')} (no s).`, `Agreement in compound tenses: ${FR('Je les ai vues')} (les = elles).`],
  ex: [[`Tu connais Sophie ? Oui, je ___ connais.`, `la`, `Yes, I know her.`, ''],
    [`Tu parles à ton patron ? Oui, je ___ parle.`, `lui`, `Yes, I speak to him.`, 'parler à → indirect'],
    [`Vous attendez vos amis ? Oui, nous ___ attendons.`, `les`, `Yes, we’re waiting for them.`, 'attendre is direct'],
    [`Tu as écrit à tes parents ? Oui, je ___ ai écrit.`, `leur`, `Yes, I wrote to them.`, ''],
    [`Le rapport ? Je vais ___ finir ce soir.`, `le`, `I’m going to finish it tonight.`, 'before the infinitive'],
    [`Appelle-___ demain ! (me)`, `moi`, `Call me tomorrow!`, 'affirmative imperative: moi'],
    [`Les photos ? Je ne ___ ai pas encore vues.`, `les`, `I haven’t seen them yet.`, ''],
    [`Tu peux ___ aider ? (me)`, `m’|m'`, `Can you help me?`, '']],
  qs: [SQ('“Je réponds à mes clients” → ', ['Je les réponds.', 'Je leur réponds.', 'Je leurs réponds.', 'Je lui réponds.'], 1, 'répondre à + plural person → leur.'),
    SQ('“I’m going to call her.”', ['Je vais l’appeler.', 'Je la vais appeler.', 'Je vais appeler la.', 'Je vais lui appeler.'], 0, 'appeler is direct; pronoun before the infinitive.')]
});

FRT('fr-y-en', { name: 'The pronouns y and en', cat: 'fra2',
  blurb: `Two small pronouns used constantly in speech. Y replaces a place or “à + thing”; en replaces “de + something” and quantities. Fluent speakers use them in nearly every answer.`,
  facts: [['y', 'there / à + thing'], ['en', 'some, of it, from there'], ['Position', 'before the verb'], ['Fixed', 'il y a, on y va, je m’en vais']],
  cheat: [['Tu vas à Ottawa ? — Oui, j’y vais.', 'y = there'], ['Tu penses à ton examen ? — Oui, j’y pense.', 'y = à + thing'], ['Tu as des enfants ? — Oui, j’en ai deux.', 'en + number'], ['Tu veux du café ? — Non merci, je n’en veux pas.', 'en = some'], ['Tu viens de Lyon ? — Oui, j’en viens.', 'en = from there'], ['Tu parles de ton projet ? — Oui, j’en parle.', 'en = de + thing'], ['On y va !', 'Let’s go!'], ['Je m’en occupe.', 'I’ll take care of it.']],
  sections: [
    ['Y', PP(`Replaces a place introduced by à, en, dans, chez, sur…: ${FR('Je travaille à Laval.')} → ${FR('J’y travaille.')} And “à + thing/idea” after verbs like penser à, réfléchir à, s’intéresser à, répondre à (a letter): ${FR('Il faut répondre à ce courriel.')} → ${FR('Il faut y répondre.')} For people, use lui/leur or à + stressed pronoun: ${FR('Je pense à ma mère.')} → ${FR('Je pense à elle.')}`)],
    ['En', PP(`Replaces “de + noun” and anything with a partitive or a number: ${FR('Il a acheté des pommes.')} → ${FR('Il en a acheté.')}; ${FR('J’ai trois frères.')} → ${FR('J’en ai trois.')} (keep the number); ${FR('Il y a beaucoup de neige.')} → ${FR('Il y en a beaucoup.')}; with verbs taking de: ${FR('avoir besoin de')}, ${FR('parler de')}, ${FR('s’occuper de')}: ${FR('J’ai besoin de ce document.')} → ${FR('J’en ai besoin.')}`)],
    ['Order and set phrases', PP(`When both appear: <b>y</b> before <b>en</b>: ${FR('Il y en a.')} (There are some.) Common expressions: ${FR('Ça y est !')} (That’s it! Done!), ${FR('J’en ai marre.')} (I’m fed up, informal), ${FR('Je n’en peux plus.')} (I can’t take it anymore), ${FR('Vas-y !')} (Go ahead!)`)]
  ],
  edge: [`Dropping the number after en: “J’en ai” for “I have two” → ${FR('J’en ai deux')}.`, `Using y for people: “J’y pense” for your mother → ${FR('Je pense à elle')}.`, `Imperative: ${FR('Vas-y')} and ${FR('Manges-en')} add an s for pronunciation.`, `Agreement never happens with en: ${FR('Des pommes ? J’en ai mangé.')}`],
  ex: [[`Tu vas au bureau demain ? Oui, j’___ vais.`, `y`, `Yes, I’m going (there).`, ''],
    [`Vous avez des questions ? Oui, j’___ ai une.`, `en`, `Yes, I have one.`, ''],
    [`Il pense à son avenir ? Oui, il ___ pense souvent.`, `y`, `Yes, he often thinks about it.`, 'penser à + thing'],
    [`Tu as besoin de la voiture ? Non, je n’___ ai pas besoin.`, `en`, `No, I don’t need it.`, 'avoir besoin de'],
    [`Il y a du lait ? Oui, il y ___ a.`, `en`, `Yes, there is some.`, ''],
    [`Combien de sœurs as-tu ? J’en ai ___ . (two)`, `deux`, `I have two.`, 'keep the number'],
    [`On ___ va ? (let’s go)`, `y`, `Shall we go?`, ''],
    [`Tu viens du travail ? Oui, j’___ viens.`, `en`, `Yes, I’m coming from there.`, 'venir de']],
  qs: [SQ('“J’ai acheté trois livres.” → ', ['J’y ai acheté trois.', 'J’en ai acheté trois.', 'Je les ai acheté trois.', 'J’en ai acheté.'], 1, 'en + keep the number.'),
    SQ('“Je m’intéresse à la politique.” → ', ['Je m’en intéresse.', 'Je m’y intéresse.', 'Je la m’intéresse.', 'Je lui intéresse.'], 1, 's’intéresser à + thing → y.')]
});

FRT('fr-partitive', { name: 'Partitive articles & quantities', cat: 'fra2',
  blurb: `French needs an article where English often has none: “I eat bread” is je mange du pain. Learn du, de la, de l’, des, when they become de, and expressions of quantity for shopping and recipes.`,
  facts: [['some (m.)', 'du'], ['some (f.)', 'de la'], ['before a vowel', 'de l’'], ['After negation / quantity', 'de']],
  cheat: [['du pain, du fromage', 'some bread, cheese'], ['de la viande, de la patience', 'some meat, patience'], ['de l’eau, de l’argent', 'some water, money'], ['des légumes', 'some vegetables'], ['pas de pain', 'no bread'], ['beaucoup de / peu de / trop de / assez de', 'a lot of / little / too much / enough'], ['un kilo de / un litre de / une bouteille de / une tranche de', 'a kilo of / a litre of / a bottle of / a slice of'], ['la plupart des', 'most (+ des)'], ['aimer le / manger du', 'general taste vs some quantity']],
  sections: [
    ['Partitive vs definite', PP(`Use the <b>partitive</b> for an unspecified amount of something uncountable: ${FR('Je bois du café le matin.')} Use the <b>definite</b> article for likes and general truths: ${FR('J’aime le café.')} (coffee in general) and for something specific: ${FR('Le café de ce restaurant est excellent.')}`)],
    ['When everything becomes de', PP(`After a negation: ${FR('Je ne mange pas de viande.')}; after expressions of quantity: ${FR('beaucoup de travail')}, ${FR('un peu de sucre')}, ${FR('un kilo de pommes')}, ${FR('une boîte de céréales')}. Exceptions: ${FR('la plupart des gens')}, ${FR('bien des fois')}, and after être in the negative: ${FR('Ce n’est pas du sucre, c’est du sel.')}`)],
    ['At the grocery store', FXS([['Je voudrais deux kilos de pommes de terre, s’il vous plaît.', 'I’d like two kilos of potatoes, please.'], ['Avez-vous du pain sans gluten ?', 'Do you have gluten-free bread?'], ['Il me faut une douzaine d’œufs et un litre de lait.', 'I need a dozen eggs and a litre of milk.'], ['Je n’ai plus d’argent comptant ; je peux payer par carte ?', 'I have no more cash; can I pay by card?']])]
  ],
  edge: [`“Beaucoup des gens” ✗ → ${FR('beaucoup de gens')}.`, `“Je n’ai pas du temps” ✗ → ${FR('Je n’ai pas de temps')}.`, `“J’aime du chocolat” ✗ → ${FR('J’aime le chocolat')}.`, `Forgetting the article: “Je mange pain” ✗.`],
  ex: [[`Je mange ___ riz tous les jours.`, `du`, `I eat rice every day.`, ''],
    [`Tu veux ___ eau ?`, `de l’|de l'`, `Do you want some water?`, ''],
    [`Il faut ___ patience.`, `de la`, `You need patience.`, ''],
    [`Nous n’avons pas ___ enfants.`, `d’|d'`, `We don’t have children.`, 'negation → de'],
    [`Elle a beaucoup ___ amis.`, `d’|d'`, `She has a lot of friends.`, 'quantity → de'],
    [`J’adore ___ fromage québécois.`, `le`, `I love Quebec cheese.`, 'likes → definite article'],
    [`Achète un litre ___ lait.`, `de`, `Buy a litre of milk.`, ''],
    [`___ plupart des employés travaillent à distance.`, `la`, `Most employees work remotely.`, 'la plupart des']],
  qs: [SQ('“I don’t drink coffee.”', ['Je ne bois pas du café.', 'Je ne bois pas de café.', 'Je ne bois pas le café.', 'Je ne bois café.'], 1, 'Negation → de.'),
    SQ('“a lot of work”', ['beaucoup du travail', 'beaucoup de travail', 'beaucoup travail', 'beaucoup le travail'], 1, 'Quantity + de.')]
});

FRT('fr-compare', { name: 'Comparatives & superlatives', cat: 'fra2',
  blurb: `Compare jobs, cities and options: plus/moins/aussi … que, the irregular meilleur and mieux, and superlatives like le plus grand. Comparing is a core skill in TEF and TCF speaking tasks.`,
  facts: [['more … than', 'plus … que'], ['less … than', 'moins … que'], ['as … as', 'aussi … que'], ['better', 'meilleur (adj.) / mieux (adv.)']],
  cheat: [['plus / moins / aussi + adj. + que', 'Toronto est plus grand que Québec.'], ['plus / moins / autant de + noun + que', 'Il y a plus d’emplois à Toronto.'], ['verb + plus / moins / autant que', 'Je travaille autant que toi.'], ['bon → meilleur', 'Ce café est meilleur.'], ['bien → mieux', 'Elle parle mieux français.'], ['le / la / les plus + adj.', 'la ville la plus froide'], ['le meilleur / le mieux', 'the best'], ['de after a superlative', 'le plus grand pays du monde'], ['de plus en plus / de moins en moins', 'more and more / less and less']],
  sections: [
    ['Comparisons', FXS([['Le loyer est moins cher à Moncton qu’à Vancouver.', 'Rent is cheaper in Moncton than in Vancouver.'], ['Le métro est aussi rapide que la voiture.', 'The metro is as fast as the car.'], ['J’ai autant d’expérience que l’autre candidat.', 'I have as much experience as the other candidate.'], ['Les hivers sont plus longs ici.', 'Winters are longer here.']])],
    ['Meilleur or mieux?', PP(`<b>meilleur</b> is an adjective (describes a noun, agrees): ${FR('une meilleure solution')}, ${FR('les meilleurs restaurants')}. <b>mieux</b> is an adverb (describes a verb): ${FR('Je dors mieux maintenant.')}, ${FR('C’est mieux comme ça.')} Also: ${FR('pire')} (worse) and ${FR('moins bien')}.`)],
    ['Superlatives', PP(`${FR('C’est la ville la plus multiculturelle du pays.')} With adjectives that go before the noun: ${FR('le plus grand parc de la ville')}. Use <b>de</b> (not dans) for “in”: ${FR('le meilleur employé de l’entreprise')}. Expressing change: ${FR('La vie devient de plus en plus chère.')}`)]
  ],
  edge: [`“Plus bon” ✗ → ${FR('meilleur')}.`, `“Plus bien” ✗ → ${FR('mieux')}.`, `“Le plus grand dans le monde” ✗ → ${FR('du monde')}.`, `“Plus de que” ✗: ${FR('plus de temps que moi')}.`],
  ex: [[`Montréal est ___ grande que Québec. (more)`, `plus`, `Montreal is bigger than Quebec City.`, ''],
    [`Ce restaurant est ___ que l’autre. (better, adj.)`, `meilleur`, `This restaurant is better than the other.`, ''],
    [`Elle chante ___ que moi. (better, adv.)`, `mieux`, `She sings better than me.`, ''],
    [`Il a ___ de patience que son frère. (as much)`, `autant`, `He has as much patience as his brother.`, 'autant de + noun'],
    [`C’est la ville la plus froide ___ Canada.`, `du`, `It’s the coldest city in Canada.`, 'superlative + de'],
    [`Le train est ___ cher que l’avion. (less)`, `moins`, `The train is less expensive than the plane.`, ''],
    [`C’est la ___ solution. (best)`, `meilleure`, `It’s the best solution.`, 'agrees with solution'],
    [`Les prix augmentent de plus en ___ .`, `plus`, `Prices are increasing more and more.`, '']],
  qs: [SQ('“I speak French better now.”', ['Je parle meilleur français maintenant.', 'Je parle mieux français maintenant.', 'Je parle plus bien français.', 'Je parle le mieux français.'], 1, 'Adverb → mieux.'),
    SQ('“the best city in the world”', ['la meilleure ville dans le monde', 'la meilleure ville du monde', 'la mieux ville du monde', 'la plus bonne ville du monde'], 1, 'meilleure (adj.) + de.')]
});

FRT('fr-futur', { name: 'Futur simple', cat: 'fra2',
  blurb: `The simple future for plans, predictions and promises, and the rule that French uses the future after quand, lorsque, dès que and aussitôt que when the action is in the future.`,
  facts: [['Stem', 'infinitive (-re drops e)'], ['Endings', '-ai -as -a -ons -ez -ont'], ['Irregular stems', 'ser-, aur-, ir-, fer-, pourr-…'], ['After quand', 'future, not present']],
  cheat: [['parler → je parlerai', 'regular'], ['finir → je finirai', 'regular'], ['vendre → je vendrai', 'drop the e'], ['être → je serai, avoir → j’aurai', 'irregular'], ['aller → j’irai, faire → je ferai', 'irregular'], ['pouvoir → je pourrai, vouloir → je voudrai', 'irregular'], ['devoir → je devrai, savoir → je saurai', 'irregular'], ['venir → je viendrai, voir → je verrai', 'irregular'], ['envoyer → j’enverrai, falloir → il faudra', 'irregular'], ['Quand j’aurai mon diplôme, je chercherai un emploi.', 'future after quand']],
  sections: [
    ['Formation', PP(`Infinitive (without the final e for -re verbs) + endings that look like avoir: ${FR('je travaillerai')}, ${FR('tu travailleras')}, ${FR('il travaillera')}, ${FR('nous travaillerons')}, ${FR('vous travaillerez')}, ${FR('ils travailleront')}. Every future form contains an <b>r</b> before the ending.`)],
    ['Near future or simple future?', TBL(['Futur proche (aller + inf.)', 'Futur simple'], [['Close, certain, connected to now', 'Further away, plans, predictions, formal'], [FR('Je vais déménager la semaine prochaine.'), FR('Un jour, j’habiterai au bord de la mer.')], [FR('Attention, tu vas tomber !'), FR('Le gouvernement annoncera les résultats en mars.')]])],
    ['Future after time conjunctions', PP(`Unlike English, French uses the future after <b>quand, lorsque, dès que, aussitôt que, tant que</b> for future actions: ${FR('Quand j’arriverai à Ottawa, je t’appellerai.')} (When I arrive…) ${FR('Dès que je recevrai ma résidence permanente, je chercherai une maison.')} But <b>si</b> + present: ${FR('Si j’ai le temps, je viendrai.')}`)],
    ['Talking about your plans (speaking test)', FXS([['Dans cinq ans, j’espère que je travaillerai comme infirmière au Canada.', 'In five years, I hope I’ll be working as a nurse in Canada.'], ['Mes enfants iront à l’école en français.', 'My children will go to school in French.'], ['Nous achèterons une maison quand nous aurons assez d’économies.', 'We’ll buy a house when we have enough savings.']])]
  ],
  edge: [`Present after quand for the future: “Quand j’arrive, je t’appelle” is fine in speech for habits, but for a future event write ${FR('Quand j’arriverai, je t’appellerai')}.`, `Future after si ✗: “Si j’aurai le temps” → ${FR('Si j’ai le temps')}.`, `Wrong stems: “je allerai” ✗ → ${FR('j’irai')}; “je faisrai” ✗ → ${FR('je ferai')}.`],
  ex: [[`Demain, nous ___ tôt. (partir)`, `partirons`, `Tomorrow we’ll leave early.`, ''],
    [`Tu ___ à la réunion ? (être)`, `seras`, `Will you be at the meeting?`, ''],
    [`J’___ 40 ans en mai. (avoir)`, `aurai`, `I’ll be 40 in May.`, ''],
    [`Ils ___ en vacances en août. (aller)`, `iront`, `They’ll go on vacation in August.`, ''],
    [`Quand je ___ mon permis, j’achèterai une voiture. (avoir)`, `aurai`, `When I get my licence, I’ll buy a car.`, 'future after quand'],
    [`Si tu veux, je te ___ le document. (envoyer)`, `enverrai`, `If you want, I’ll send you the document.`, ''],
    [`Il ___ mettre un manteau. (falloir)`, `faudra`, `You’ll need to wear a coat.`, ''],
    [`Nous ___ le résultat la semaine prochaine. (savoir)`, `saurons`, `We’ll know the result next week.`, '']],
  qs: [SQ('“When I have time, I will call you.”', ['Quand j’ai le temps, je t’appellerai.', 'Quand j’aurai le temps, je t’appellerai.', 'Si j’aurai le temps, je t’appellerai.', 'Quand j’aurais le temps, je t’appelle.'], 1, 'Future after quand for a future action.'),
    SQ('Future of “faire” (je):', ['je fairai', 'je ferai', 'je fais', 'je ferrai'], 1, 'Irregular stem fer-.')]
});

FRT('fr-relatives1', { name: 'Relative pronouns qui, que, où & the imperative', cat: 'fra2',
  blurb: `Join sentences with qui (subject), que (object) and où (place or time), and give instructions with the imperative, which you will need for directions, recipes and workplace instructions.`,
  facts: [['qui', 'subject (who, which, that)'], ['que / qu’', 'object (whom, which, that)'], ['où', 'where; also when'], ['Imperative', 'tu, nous, vous; no subject']],
  cheat: [['L’homme qui parle est mon voisin.', 'qui + verb'], ['Le livre que je lis est intéressant.', 'que + subject + verb'], ['La ville où j’habite est calme.', 'où = place'], ['Le jour où je suis arrivé…', 'où = time'], ['Parle ! Parlons ! Parlez !', 'imperative -er (no s with tu)'], ['Finis ! Attends !', '-ir / -re'], ['Sois / Aie / Va / Fais / Sache', 'irregular imperatives'], ['Ne tourne pas à gauche.', 'negative imperative']],
  sections: [
    ['qui or que?', PP(`If the relative is the <b>subject</b> of the next verb, use <b>qui</b>: ${FR('C’est le collègue qui m’a aidé.')} If there is another subject after it, use <b>que</b>: ${FR('C’est le collègue que j’ai aidé.')} Que becomes qu’ before a vowel, qui never changes: ${FR('l’ami qu’il a invité')}, ${FR('l’ami qui arrive')}.`)],
    ['où', PP(`${FR('C’est le quartier où nous voulons habiter.')} For time: ${FR('Je me souviens du jour où j’ai reçu ma résidence permanente.')} (English “when”).`)],
    ['The imperative', PP(`Use the tu, nous, vous forms of the present without the pronoun: ${FR('Prends le bus 24.')}, ${FR('Allons-y !')}, ${FR('Remplissez ce formulaire.')} -er verbs drop the s in the tu form: ${FR('Regarde !')}, ${FR('Va !')} Pronouns follow with a hyphen in the affirmative and precede in the negative: ${FR('Dites-moi.')} / ${FR('Ne me dites pas.')}`) +
      FXS([['Tournez à droite au feu, puis continuez tout droit.', 'Turn right at the light, then go straight on.'], ['N’oubliez pas d’apporter une pièce d’identité.', 'Don’t forget to bring ID.'], ['Soyez à l’heure, s’il vous plaît.', 'Please be on time.']])]
  ],
  edge: [`“Qui” before a subject ✗: “le livre qui je lis” → ${FR('le livre que je lis')}.`, `“Qu’” for qui ✗: qui never elides.`, `“Manges !” ✗ → ${FR('Mange !')}`, `Using “quand” for “the day when”: ${FR('le jour où')}.`],
  ex: [[`La femme ___ travaille ici est infirmière.`, `qui`, `The woman who works here is a nurse.`, 'subject'],
    [`Le film ___ nous avons vu était drôle.`, `que`, `The film (that) we saw was funny.`, 'object'],
    [`La ville ___ je suis né est en Syrie.`, `où`, `The city where I was born is in Syria.`, ''],
    [`C’est le cours ___ elle préfère.`, `qu’|qu'`, `It’s the class she prefers.`, 'que → qu’ before elle'],
    [`___ à gauche ! (tourner, vous)`, `tournez`, `Turn left!`, ''],
    [`___ ce document, s’il te plaît. (lire, tu)`, `lis`, `Read this document, please.`, ''],
    [`___ ! (aller, tu)`, `va`, `Go!`, 'no s'],
    [`___ patient ! (être, vous)`, `soyez`, `Be patient!`, '']],
  qs: [SQ('“The apartment that we visited…”', ['L’appartement qui nous avons visité…', 'L’appartement que nous avons visité…', 'L’appartement où nous avons visité…', 'L’appartement dont nous avons visité…'], 1, 'Object → que.'),
    SQ('Imperative of “regarder” (tu):', ['Regardes !', 'Regarde !', 'Tu regardes !', 'Regardez-tu !'], 1, '-er verbs drop the s.')]
});
