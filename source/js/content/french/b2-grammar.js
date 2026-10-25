/* ===== French B2 (NCLC 7–8): subjunctive after doubt & conjunctions, conditionnel passé, futur antérieur, concordance des temps, concession, nominalisation, formal letters, argumentation, Canadian French ===== */
FRT('fr-subj2', { name: 'Subjonctif: doubt, opinion & conjunctions', cat: 'frb2',
  blurb: `At B2 the subjunctive appears after expressions of doubt and possibility, after negative or interrogative opinions, and after a set of conjunctions (bien que, pour que, avant que, à moins que, sans que). Knowing when not to use it matters just as much.`,
  facts: [['Doubt', 'douter que, il est possible que'], ['Negative opinion', 'je ne pense pas que'], ['Conjunctions', 'bien que, pour que, avant que…'], ['Indicative', 'après que, parce que, pendant que']],
  cheat: [['Je doute qu’il vienne.', 'doubt'], ['Il est possible / Il se peut que…', 'possibility'], ['Je ne crois pas qu’il ait raison.', 'negative opinion'], ['Pensez-vous qu’il soit prêt ? (formal)', 'inverted question'], ['bien que / quoique', 'although'], ['pour que / afin que', 'so that'], ['avant que (ne)', 'before'], ['jusqu’à ce que', 'until'], ['à moins que (ne)', 'unless'], ['sans que', 'without'], ['à condition que / pourvu que', 'provided that'], ['de peur que / de crainte que', 'for fear that'], ['Indicative: après que, pendant que, parce que, depuis que, dès que', 'facts / time']],
  sections: [
    ['Certainty vs doubt', TBL(['Indicative (certain or likely)', 'Subjunctive (doubtful or possible)'], [[FR('Je pense que c’est une bonne idée.'), FR('Je ne pense pas que ce soit une bonne idée.')], [FR('Il est certain qu’il viendra.'), FR('Il n’est pas certain qu’il vienne.')], [FR('Il est probable qu’elle a réussi.'), FR('Il est possible qu’elle ait réussi.')], [FR('Je suis sûr que tu peux le faire.'), FR('Je doute que tu puisses le faire.')]])],
    ['Conjunctions with the subjunctive', FXS([['Bien qu’il fasse froid, les gens sortent.', 'Although it is cold, people go out.'], ['Je vous envoie le plan pour que vous trouviez facilement.', 'I’m sending you the map so you find it easily.'], ['Partons avant qu’il (ne) pleuve.', 'Let’s leave before it rains.'], ['Je resterai jusqu’à ce que tu reviennes.', 'I’ll stay until you come back.'], ['Nous accepterons à condition que le salaire soit négocié.', 'We’ll accept provided the salary is negotiated.']]) +
      PP(`The “ne explétif” after avant que, à moins que, de peur que is optional and formal; it does not make the sentence negative.`)],
    ['Same subject → preposition + infinitive', PP(`${FR('pour que')} → ${FR('pour')}, ${FR('avant que')} → ${FR('avant de')}, ${FR('sans que')} → ${FR('sans')}, ${FR('à condition que')} → ${FR('à condition de')}: ${FR('Je relis mon texte avant de l’envoyer.')} (not “avant que je l’envoie”). Bien que keeps the subjunctive even with the same subject: ${FR('Bien qu’il soit fatigué, il continue.')}`)],
    ['Subjunctive past', PP(`For a completed action: ${FR('que j’aie fini')}, ${FR('qu’elle soit partie')}. ${FR('Je suis content que vous ayez obtenu votre résidence.')} ${FR('Bien qu’il soit arrivé en retard, il a été embauché.')}`)]
  ],
  edge: [`“Après qu’il soit parti” is common but considered incorrect: ${FR('après qu’il est parti')} (indicative).`, `“Bien que + indicative” ✗.`, `“Avant que je parte, je…” with the same subject ✗ → ${FR('Avant de partir, je…')}`, `Overusing the subjunctive after espérer ✗.`],
  ex: [[`Je ne pense pas qu’il ___ raison. (avoir)`, `ait`, `I don’t think he’s right.`, ''],
    [`Bien qu’elle ___ malade, elle travaille. (être)`, `soit`, `Although she’s sick, she works.`, ''],
    [`Il est possible que nous ___ en retard. (arriver)`, `arrivions`, `We may arrive late.`, ''],
    [`Je t’attends jusqu’à ce que tu ___ . (revenir)`, `reviennes`, `I’ll wait until you come back.`, ''],
    [`Partons avant qu’il ne ___ nuit. (faire)`, `fasse`, `Let’s go before it gets dark.`, ''],
    [`Je vérifie avant ___ signer.`, `de`, `I check before signing.`, 'same subject → avant de'],
    [`Je suis sûr qu’il ___ . (venir, futur)`, `viendra`, `I’m sure he’ll come.`, 'certainty → indicative'],
    [`Je suis ravi que vous ___ venus. (être, subj. passé)`, `soyez`, `I’m delighted you came.`, 'subjonctif passé']],
  qs: [SQ('“Although it is expensive, I’ll buy it.”', ['Bien que c’est cher, je l’achèterai.', 'Bien que ce soit cher, je l’achèterai.', 'Malgré que c’est cher…', 'Bien que ce sera cher…'], 1, 'bien que + subjonctif.'),
    SQ('Which takes the indicative?', ['Je doute que', 'Il est possible que', 'Il est probable que', 'Je ne crois pas que'], 2, 'probable = likely → indicative.')]
});

FRT('fr-condpasse', { name: 'Conditionnel passé & si + plus-que-parfait', cat: 'frb2',
  blurb: `Talk about what would have happened, express regret and reproach, and report unconfirmed past events. Si + plus-que-parfait + conditionnel passé is the third type of “if” sentence.`,
  facts: [['Form', 'conditionnel of avoir/être + participle'], ['Si clause (type 3)', 'si + plus-que-parfait'], ['Regret', 'j’aurais dû'], ['Reproach', 'tu aurais pu']],
  cheat: [['j’aurais aimé', 'I would have liked'], ['tu aurais dû', 'you should have'], ['il aurait pu', 'he could have'], ['nous serions venus', 'we would have come'], ['Si j’avais su, je serais venu.', 'If I had known, I would have come.'], ['Si tu étais parti plus tôt, tu n’aurais pas raté le bus.', 'past hypothesis'], ['Si j’avais étudié, je serais médecin aujourd’hui.', 'mixed: past cause, present result'], ['L’incendie aurait été causé par…', 'unconfirmed (news)']],
  sections: [
    ['The three si structures', TBL(['Type', 'Si clause', 'Main clause', 'Example'], [['1 real', 'présent', 'futur / présent / impératif', FR('Si tu viens, on ira au cinéma.')], ['2 imaginary now', 'imparfait', 'conditionnel présent', FR('Si tu venais, on irait au cinéma.')], ['3 imaginary past', 'plus-que-parfait', 'conditionnel passé', FR('Si tu étais venu, on serait allés au cinéma.')], ['mixed', 'plus-que-parfait', 'conditionnel présent', FR('Si j’avais accepté ce poste, je vivrais à Calgary.')]])],
    ['Regret, reproach, advice about the past', FXS([['J’aurais dû apprendre le français plus tôt.', 'I should have learned French earlier.'], ['Tu aurais pu me prévenir !', 'You could have warned me!'], ['À ta place, j’aurais refusé.', 'If I were you, I would have refused.'], ['Nous aurions aimé avoir plus d’informations.', 'We would have liked more information.']])],
    ['Unconfirmed past events', PP(`Journalists use the conditionnel passé for facts not yet confirmed: ${FR('Le suspect aurait quitté le pays.')} (The suspect reportedly left the country.) Recognizing this is useful for TEF and TCF reading questions about the author’s certainty.`)]
  ],
  edge: [`“Si j’aurais su” ✗ → ${FR('Si j’avais su')}.`, `“J’aurais dû de venir” ✗ → ${FR('J’aurais dû venir')}.`, `Être verbs: ${FR('elle serait partie')}, not “aurait parti”.`],
  ex: [[`Si j’avais su, je ___ venu. (être)`, `serais`, `If I had known, I would have come.`, ''],
    [`Tu ___ dû me le dire ! (avoir)`, `aurais`, `You should have told me!`, ''],
    [`Si nous ___ parti plus tôt, nous serions arrivés à l’heure. (être)`, `étions`, `If we had left earlier, we would have arrived on time.`, 'plus-que-parfait'],
    [`Elle aurait ___ ce poste, mais elle a refusé. (avoir)`, `eu`, `She would have had this job, but she refused.`, ''],
    [`Si tu avais écouté, tu ___ compris. (avoir)`, `aurais`, `If you had listened, you would have understood.`, ''],
    [`Selon les médias, le ministre ___ démissionné. (avoir)`, `aurait`, `According to the media, the minister reportedly resigned.`, ''],
    [`J’aurais ___ vous rencontrer. (aimer)`, `aimé`, `I would have liked to meet you.`, ''],
    [`Si j’avais accepté, je ___ à Paris maintenant. (vivre, cond. présent)`, `vivrais`, `If I had accepted, I would live in Paris now.`, 'mixed type']],
  qs: [SQ('“If I had known, I would not have bought it.”', ['Si je savais, je ne l’aurais pas acheté.', 'Si j’avais su, je ne l’aurais pas acheté.', 'Si j’aurais su, je ne l’avais pas acheté.', 'Si j’ai su, je ne l’achèterais pas.'], 1, 'si + plus-que-parfait → conditionnel passé.'),
    SQ('“You should have called.”', ['Tu devrais appeler.', 'Tu aurais dû appeler.', 'Tu avais dû appeler.', 'Tu aurais appelé.'], 1, 'Conditionnel passé of devoir.')]
});

FRT('fr-futant', { name: 'Futur antérieur & time expressions', cat: 'frb2',
  blurb: `The futur antérieur (will have done) marks an action completed before another future moment, often after quand, dès que, lorsque, après que. It also expresses a guess about the past.`,
  facts: [['Form', 'future of avoir/être + participle'], ['Meaning', 'will have done'], ['After', 'quand, dès que, une fois que'], ['Guess', 'Il aura oublié.']],
  cheat: [['j’aurai fini', 'I will have finished'], ['elle sera partie', 'she will have left'], ['Dès que j’aurai reçu ma RP, je chercherai un emploi.', 'completed before'], ['Une fois que vous aurez rempli le formulaire, envoyez-le.', 'once'], ['Il n’est pas là ? Il aura oublié.', 'He must have forgotten.'], ['d’ici (à) + date', 'by (a date)'], ['D’ici 2030, j’aurai obtenu ma citoyenneté.', 'by 2030']],
  sections: [
    ['Use', FXS([['Quand tu arriveras, j’aurai déjà préparé le repas.', 'When you arrive, I’ll have already made the meal.'], ['Je t’appellerai dès que j’aurai fini la réunion.', 'I’ll call you as soon as I’ve finished the meeting.'], ['D’ici la fin de l’année, nous aurons déménagé.', 'By the end of the year, we’ll have moved.'], ['Elle n’a pas répondu ; elle aura oublié son téléphone.', 'She didn’t answer; she must have forgotten her phone.']])],
    ['Tense sequence after time conjunctions', TBL(['Order of actions', 'Structure'], [['simultaneous', FR('Quand je serai à Montréal, je visiterai le Vieux-Port.') + ' (futur + futur)'], ['first completed, then', FR('Quand j’aurai trouvé un appartement, je ferai venir ma famille.') + ' (futur antérieur + futur)']])]
  ],
  edge: [`Using the passé composé after quand for the future: “Quand j’ai fini, je partirai” → ${FR('Quand j’aurai fini, je partirai')}.`, `Using the present after dès que for the future ✗ in writing.`],
  ex: [[`Quand tu rentreras, j’___ fini. (avoir)`, `aurai`, `When you get home, I’ll have finished.`, ''],
    [`Dès qu’il ___ arrivé, nous commencerons. (être)`, `sera`, `As soon as he has arrived, we’ll start.`, ''],
    [`Une fois que vous aurez ___ le contrat, envoyez-le. (signer)`, `signé`, `Once you have signed the contract, send it.`, ''],
    [`D’ici juin, nous aurons ___ notre diplôme. (obtenir)`, `obtenu`, `By June, we’ll have obtained our diploma.`, ''],
    [`Il est en retard ; il ___ raté son train. (avoir)`, `aura`, `He’s late; he must have missed his train.`, 'guess'],
    [`Lorsque les enfants ___ couchés, on regardera un film. (être, futur antérieur)`, `seront`, `When the children have gone to bed, we’ll watch a film.`, ''],
    [`Je te prêterai le livre quand je l’___ lu. (avoir)`, `aurai`, `I’ll lend you the book when I’ve read it.`, ''],
    [`Elles seront ___ avant midi. (partir)`, `parties`, `They will have left before noon.`, '']],
  qs: [SQ('“As soon as I have finished, I’ll leave.”', ['Dès que je finis, je pars.', 'Dès que j’aurai fini, je partirai.', 'Dès que j’ai fini, je partirai.', 'Dès que je finirais, je partirai.'], 1, 'futur antérieur + futur.'),
    SQ('“He must have forgotten.” (guess)', ['Il oubliera.', 'Il aura oublié.', 'Il aurait oublié.', 'Il avait oublié.'], 1, 'Futur antérieur expresses a probable past.')]
});

FRT('fr-concordance', { name: 'Reported speech in the past (concordance des temps)', cat: 'frb2',
  blurb: `When the reporting verb is in the past (il a dit que, elle m’a demandé si), the tenses in the reported clause shift back, and time words change. This is tested in reading and is essential for summarising documents.`,
  facts: [['présent →', 'imparfait'], ['passé composé →', 'plus-que-parfait'], ['futur →', 'conditionnel présent'], ['aujourd’hui →', 'ce jour-là']],
  cheat: [['« Je suis prêt. » → Il a dit qu’il était prêt.', 'présent → imparfait'], ['« J’ai fini. » → Il a dit qu’il avait fini.', 'PC → PQP'], ['« Je viendrai. » → Il a dit qu’il viendrait.', 'futur → conditionnel'], ['« Je vais partir. » → Il a dit qu’il allait partir.', 'futur proche → aller (imparfait)'], ['imparfait, PQP, conditionnel', 'do not change'], ['aujourd’hui → ce jour-là', ''], ['hier → la veille', ''], ['demain → le lendemain', ''], ['la semaine prochaine → la semaine suivante', ''], ['ici → là', '']],
  sections: [
    ['The shift', TBL(['Direct speech', 'Reported (verb in the past)'], [['« ' + FR('Je travaille à Laval.') + ' »', FR('Elle a dit qu’elle travaillait à Laval.')], ['« ' + FR('J’ai reçu la lettre hier.') + ' »', FR('Il a expliqué qu’il avait reçu la lettre la veille.')], ['« ' + FR('Nous déménagerons demain.') + ' »', FR('Ils ont annoncé qu’ils déménageraient le lendemain.')], ['« ' + FR('Est-ce que vous viendrez ?') + ' »', FR('Elle m’a demandé si je viendrais.')], ['« ' + FR('Où avez-vous travaillé ?') + ' »', FR('Il m’a demandé où j’avais travaillé.')]])],
    ['When not to shift', PP(`If the statement is still true or the reporting verb is in the present or future, you may keep the original tense: ${FR('Il m’a dit que le bureau ferme à 17 h.')} (still true). In formal writing, shifting is the safe choice.`)]
  ],
  edge: [`Keeping the future: “Il a dit qu’il viendra” is common in speech; in writing use ${FR('viendrait')}.`, `Forgetting time words: “Il a dit qu’il partait demain” → ${FR('le lendemain')} when reporting from a later day.`, `Shifting imparfait again ✗: it stays imparfait.`],
  ex: [[`« Je suis fatigué. » → Il a dit qu’il ___ fatigué.`, `était`, '', 'présent → imparfait'],
    [`« J’ai perdu mes clés. » → Elle a dit qu’elle ___ perdu ses clés.`, `avait`, '', 'PC → PQP'],
    [`« Je t’appellerai. » → Il a promis qu’il m’___ .`, `appellerait`, '', 'futur → conditionnel'],
    [`« Je vais démissionner. » → Elle a annoncé qu’elle ___ démissionner.`, `allait`, '', ''],
    [`« Vous êtes libre demain ? » → Il m’a demandé si j’étais libre le ___ .`, `lendemain`, '', ''],
    [`« Je suis arrivé hier. » → Il a dit qu’il était arrivé la ___ .`, `veille`, '', ''],
    [`« Où habites-tu ? » → Elle m’a demandé où j’___ .`, `habitais`, '', ''],
    [`« Je travaillais à Ottawa. » → Il a dit qu’il ___ à Ottawa.`, `travaillait`, '', 'imparfait does not change']],
  qs: [SQ('« Je finirai ce soir. » → Il a dit qu’il…', ['finira ce soir.', 'finirait ce soir-là.', 'finissait ce soir.', 'avait fini ce soir.'], 1, 'futur → conditionnel; ce soir → ce soir-là.'),
    SQ('« J’ai vu le film. » → Elle a dit qu’elle…', ['a vu le film.', 'avait vu le film.', 'verrait le film.', 'voyait le film.'], 1, 'PC → PQP.')]
});

FRT('fr-concession', { name: 'Concession & opposition', cat: 'frb2',
  blurb: `Nuanced argument requires conceding a point before opposing it: “although”, “despite”, “even if”, “however”. These structures are what separate B1 from B2+ in TEF section B and TCF task 3.`,
  facts: [['+ subjunctive', 'bien que, quoique, sans que'], ['+ noun', 'malgré, en dépit de'], ['+ indicative', 'même si, alors que, tandis que'], ['Adverbs', 'pourtant, cependant, toutefois, néanmoins']],
  cheat: [['bien que / quoique + subj.', 'although'], ['malgré / en dépit de + noun', 'despite'], ['même si + indicative', 'even if'], ['alors que / tandis que', 'whereas, while'], ['pourtant / cependant / toutefois / néanmoins', 'yet / however / nevertheless'], ['en revanche / par contre', 'on the other hand'], ['certes …, mais', 'admittedly …, but'], ['il n’en reste pas moins que', 'the fact remains that'], ['quand bien même + conditionnel', 'even if (formal)'], ['avoir beau + infinitive', 'however much (j’ai beau essayer…)']],
  sections: [
    ['Structures', TBL(['Structure', 'Example'], [['bien que + subjonctif', FR('Bien que le loyer soit élevé, l’appartement vaut le coup.')], ['malgré + nom', FR('Malgré le froid, nous adorons l’hiver québécois.')], ['même si + indicatif', FR('Même si c’est difficile, je continue.')], ['alors que (contrast)', FR('Je préfère la ville alors que mon conjoint préfère la campagne.')], ['certes…, mais', FR('Certes, le télétravail est pratique, mais il isole les employés.')], ['avoir beau', FR('J’ai beau réviser, j’oublie le vocabulaire.')]])],
    ['Building a nuanced paragraph', PP(`A strong argument paragraph: <b>concede → oppose → justify → example</b>. ${FR('Certes, les grandes villes offrent plus d’emplois. Cependant, le coût de la vie y est beaucoup plus élevé. En effet, à Toronto, un loyer moyen dépasse souvent 2 500 dollars. C’est pourquoi de nombreuses familles choisissent des villes moyennes comme Sherbrooke ou Moncton.')}`)]
  ],
  edge: [`“Malgré que” + subjunctive is common but criticized: prefer ${FR('bien que')}.`, `“Même si” + subjunctive or conditional ✗ → indicative: ${FR('même si tu as raison')}.`, `“Malgré de” ✗ → ${FR('malgré')} + noun.`],
  ex: [[`___ qu’il pleuve, nous sortons.`, `bien`, `Although it’s raining, we’re going out.`, ''],
    [`___ la neige, le bus est arrivé à l’heure.`, `malgré`, `Despite the snow, the bus arrived on time.`, '+ noun'],
    [`Même si tu ___ fatigué, tu dois finir. (être)`, `es`, `Even if you’re tired, you must finish.`, 'même si + indicative'],
    [`Bien que nous ___ peu de temps, nous visiterons Québec. (avoir)`, `ayons`, `Although we have little time, we’ll visit Quebec City.`, ''],
    [`Il travaille beaucoup, ___ il ne gagne pas assez.`, `pourtant|cependant|mais`, `He works a lot, yet he doesn’t earn enough.`, ''],
    [`J’ai ___ chercher, je ne trouve pas mes clés.`, `beau`, `However hard I look, I can’t find my keys.`, 'avoir beau'],
    [`Ma sœur aime l’été, ___ moi, je préfère l’hiver.`, `alors que|tandis que`, `My sister likes summer, whereas I prefer winter.`, ''],
    [`___, la solution est coûteuse, mais elle est efficace.`, `certes`, `Admittedly, the solution is costly, but it’s effective.`, '']],
  qs: [SQ('“Despite the cost…”', ['Bien que le coût…', 'Malgré le coût…', 'Même si le coût…', 'Malgré que le coût…'], 1, 'malgré + noun.'),
    SQ('“Even if he refuses, I’ll insist.”', ['Même s’il refuse, j’insisterai.', 'Même s’il refuse, j’insisterais.', 'Bien qu’il refuse, j’insisterai.', 'Même s’il refuserait, j’insisterai.'], 0, 'même si + indicative.')]
});

FRT('fr-nominal', { name: 'Nominalisation & formal style', cat: 'frb2',
  blurb: `Formal French turns verbs and adjectives into nouns: “the government decided” becomes “la décision du gouvernement”. Nominalisation makes titles, summaries and arguments concise and is typical of NCLC 8+ writing.`,
  facts: [['-tion / -sion', 'organiser → l’organisation'], ['-ment', 'développer → le développement'], ['-age', 'nettoyer → le nettoyage'], ['-ure / -ance / -ité', 'ouvrir → l’ouverture']],
  cheat: [['augmenter → l’augmentation', 'increase'], ['diminuer → la diminution', 'decrease'], ['améliorer → l’amélioration', 'improvement'], ['changer → le changement', 'change'], ['construire → la construction', 'construction'], ['découvrir → la découverte', 'discovery'], ['réussir → la réussite', 'success'], ['choisir → le choix', 'choice'], ['difficile → la difficulté', 'difficulty'], ['responsable → la responsabilité', 'responsibility'], ['fermer → la fermeture', 'closure'], ['arriver → l’arrivée', 'arrival']],
  sections: [
    ['From sentence to noun phrase', TBL(['Verbal style', 'Nominal style'], [[FR('Le prix des loyers a beaucoup augmenté.'), FR('La forte augmentation du prix des loyers')], [FR('On va construire un nouvel hôpital.'), FR('La construction d’un nouvel hôpital')], [FR('Les immigrants s’intègrent rapidement.'), FR('L’intégration rapide des immigrants')], [FR('Les services publics sont accessibles.'), FR('L’accessibilité des services publics')]]) +
      PP(`Adverbs become adjectives: ${FR('augmenter fortement')} → ${FR('une forte augmentation')}.`)],
    ['Where to use it', PP(`Titles and headlines (${FR('Fermeture temporaire du pont Jacques-Cartier')}), introductions (${FR('L’essor du télétravail soulève de nombreuses questions.')}), and summaries in TCF task 3. Don’t overuse it in letters to friends or speaking tasks, where verbs are more natural.`)]
  ],
  edge: [`Wrong suffix: “l’améliorement” ✗ → ${FR('l’amélioration')}.`, `Gender of nouns in -age (m.) and -tion (f.): ${FR('le chômage')}, ${FR('la création')}.`, `Long chains of “de”: rephrase if you have more than three in a row.`],
  ex: [[`développer → le ___`, `développement`, '', ''],
    [`réduire → la ___`, `réduction`, '', ''],
    [`ouvrir → l’___`, `ouverture`, '', ''],
    [`partir → le ___`, `départ`, '', ''],
    [`choisir → le ___`, `choix`, '', ''],
    [`créer → la ___`, `création`, '', ''],
    [`pauvre → la ___`, `pauvreté`, '', ''],
    [`« Les prix augmentent fortement » → une forte ___ des prix`, `augmentation|hausse`, '', '']],
  qs: [SQ('Nominalisation of “Le gouvernement a décidé…”', ['Le décidement du gouvernement', 'La décision du gouvernement', 'Le décidage du gouvernement', 'La décidation du gouvernement'], 1, 'décider → la décision.'),
    SQ('“arriver” →', ['l’arrivement', 'l’arrivée', 'l’arrivation', 'l’arrivage (of people)'], 1, 'l’arrivée (l’arrivage is for goods).')]
});

FRT('fr-letters', { name: 'Formal letters & emails', cat: 'frb2',
  blurb: `TCF task 1 and many real situations (landlords, employers, government) require a correct formal message. Learn the structure, the fixed opening and closing formulas, and phrases for requesting, complaining and thanking.`,
  facts: [['Opening', 'Madame, Monsieur,'], ['Register', 'vous, conditionnel'], ['Closing', 'formule de politesse'], ['Length (TCF 1)', '60–120 words']],
  cheat: [['Madame, Monsieur, / Madame la Directrice,', 'formal opening'], ['Je me permets de vous écrire afin de…', 'I am writing to…'], ['Je vous écris au sujet de / concernant…', 'regarding…'], ['Suite à notre conversation téléphonique…', 'Following our call…'], ['Je souhaiterais obtenir des renseignements sur…', 'request'], ['Je vous serais reconnaissant(e) de bien vouloir…', 'I would be grateful if you would…'], ['Je tiens à vous signaler que…', 'complaint'], ['Vous trouverez ci-joint…', 'Please find attached…'], ['Dans l’attente de votre réponse,', 'Looking forward to your reply,'], ['Veuillez agréer, Madame, Monsieur, l’expression de mes salutations distinguées.', 'Yours faithfully'], ['Cordialement, / Bien cordialement,', 'Kind regards (emails)']],
  sections: [
    ['Structure', OL([`Opening: ${FR('Madame, Monsieur,')}`, `Purpose in the first sentence: ${FR('Je vous écris afin de signaler un problème de chauffage dans mon logement.')}`, `Details (what, when, consequences)`, `Request or action: ${FR('Je vous saurais gré d’intervenir dans les meilleurs délais.')}`, `Closing formula and signature`])],
    ['Model: complaint to a landlord', PP(FR('Madame, Monsieur,') + '<br>' + FR('Je suis locataire de l’appartement 4B depuis le 1er juillet. Je me permets de vous écrire, car le chauffage ne fonctionne plus depuis lundi, alors que les températures descendent à -15 °C. Mes enfants et moi avons froid, et j’ai dû acheter un chauffage d’appoint.') + '<br>' + FR('Je vous serais reconnaissant de bien vouloir envoyer un technicien d’ici vendredi. Je reste disponible tous les jours après 17 h.') + '<br>' + FR('Dans l’attente de votre réponse, je vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.') + '<br>Karim Benali')],
    ['Model: short email to a colleague (semi-formal)', PP(FR('Bonjour Julie,') + '<br>' + FR('Merci pour ta présentation d’hier. Est-ce que tu pourrais m’envoyer le fichier avant jeudi ? Je voudrais l’adapter pour l’équipe de Québec.') + '<br>' + FR('Bonne journée,') + '<br>Ana')]
  ],
  edge: [`Mixing tu and vous in one message.`, `Opening with “Cher Monsieur” to a stranger: prefer ${FR('Madame, Monsieur,')}.`, `Forgetting to state the purpose in the first two lines.`, `Using “Salutations” alone as a closing: write a full formula or ${FR('Cordialement')}.`],
  ex: [[`Je me permets de vous écrire ___ de vous demander des informations.`, `afin`, '', ''],
    [`Vous trouverez ci-___ mon curriculum vitae.`, `joint`, '', ''],
    [`Je vous serais ___ de bien vouloir me répondre. (grateful, m.)`, `reconnaissant`, '', ''],
    [`Dans l’___ de votre réponse, …`, `attente`, '', ''],
    [`Veuillez ___ , Madame, l’expression de mes salutations distinguées.`, `agréer`, '', ''],
    [`Je vous écris au ___ de l’annonce publiée sur votre site.`, `sujet`, '', ''],
    [`___ à notre conversation, je vous confirme ma présence.`, `suite`, '', ''],
    [`Je tiens à vous ___ que la livraison est arrivée endommagée. (inform)`, `signaler|informer`, '', '']],
  qs: [SQ('Best opening for a letter to an unknown company:', ['Salut,', 'Cher ami,', 'Madame, Monsieur,', 'Coucou,'], 2, 'Neutral formal opening.'),
    SQ('“Please find attached my CV.”', ['Vous trouvez attaché mon CV.', 'Vous trouverez ci-joint mon CV.', 'Voici attachement mon CV.', 'Trouvez dedans mon CV.'], 1, 'Fixed formula: ci-joint.')]
});

FRT('fr-argue', { name: 'Argumentation: giving and defending an opinion', cat: 'frb2',
  blurb: `TEF writing section B (200+ words), TEF speaking section B and TCF writing task 3 all ask you to take a position and convince. Learn a reusable structure and the phrases examiners expect at NCLC 7 to 9.`,
  facts: [['Structure', 'intro → 2–3 arguments → conclusion'], ['Each argument', 'idea + explanation + example'], ['Register', 'neutral to formal'], ['Key skill', 'nuance and counter-argument']],
  cheat: [['À mon avis / Selon moi / D’après moi', 'In my opinion'], ['Je suis convaincu(e) que / Je suis persuadé(e) que', 'I am convinced that'], ['Il me semble que', 'It seems to me that'], ['Je ne partage pas cet avis', 'I don’t share this view'], ['D’une part …, d’autre part …', 'On the one hand … on the other'], ['Non seulement …, mais aussi …', 'Not only … but also'], ['Prenons l’exemple de…', 'Take the example of…'], ['On pourrait objecter que…', 'One could object that…'], ['Il est vrai que…, mais…', 'It’s true that…, but…'], ['En somme / En définitive / Pour conclure', 'In conclusion']],
  sections: [
    ['A reusable plan', OL([`<b>Introduction:</b> rephrase the topic, state your position. ${FR('Le télétravail s’est largement répandu depuis 2020. Faut-il le généraliser ? Je pense que oui, à certaines conditions.')}`, `<b>Argument 1</b> + example: ${FR('Tout d’abord, le télétravail améliore la qualité de vie : on évite les embouteillages et on gagne du temps. Par exemple, à Toronto, certains employés gagnent deux heures par jour.')}`, `<b>Argument 2</b> + example: ${FR('De plus, il réduit les émissions de gaz à effet de serre.')}`, `<b>Counter-argument and answer:</b> ${FR('On pourrait objecter que le télétravail isole les employés. Cependant, un modèle hybride permet de garder le contact avec l’équipe.')}`, `<b>Conclusion:</b> ${FR('En somme, le télétravail présente plus d’avantages que d’inconvénients, à condition d’être bien organisé.')}`])],
    ['Speaking: convincing someone (TEF section B)', FXS([['Écoute, je comprends tes doutes, mais laisse-moi t’expliquer.', 'Listen, I understand your doubts, but let me explain.'], ['Imagine un peu : tu pourrais rencontrer des gens tous les week-ends.', 'Just imagine: you could meet people every weekend.'], ['Ce qui est intéressant, c’est que ça ne coûte presque rien.', 'What’s interesting is that it costs almost nothing.'], ['Tu ne penses pas que ça vaut la peine d’essayer ?', 'Don’t you think it’s worth trying?']])],
    ['What raises your score', UL([`A clear position from the first lines.`, `Logical connectors (see B1 and the concession lesson).`, `Concrete examples, ideally Canadian (cities, services, numbers).`, `Varied grammar: subjunctive after il faut que / bien que, conditionnel for suggestions, relative pronouns dont / lequel.`, `Precise vocabulary instead of “chose”, “bon”, “faire”.`, `Proofreading: agreements, accents, verb endings.`])]
  ],
  edge: [`Listing arguments without examples.`, `Changing your position in the conclusion.`, `Writing “je pense que” five times: vary with ${FR('il me semble que')}, ${FR('je suis convaincu que')}, ${FR('à mon sens')}.`, `Going under the minimum word count (TEF B: 200 words).`],
  ex: [[`___ mon avis, les transports publics devraient être gratuits.`, `à`, `In my opinion, public transit should be free.`, ''],
    [`D’une part, c’est écologique ; d’___ part, c’est économique.`, `autre`, '', ''],
    [`Non seulement c’est pratique, ___ aussi c’est rapide.`, `mais`, '', ''],
    [`On ___ objecter que cela coûte cher. (pouvoir, conditionnel)`, `pourrait`, '', ''],
    [`Il est ___ que la ville est chère, mais elle offre beaucoup d’emplois.`, `vrai`, '', ''],
    [`Prenons l’___ de Montréal.`, `exemple`, '', ''],
    [`En ___ , je reste convaincu que c’est la meilleure solution.`, `somme|conclusion|définitive`, '', ''],
    [`Je ne ___ pas cet avis.`, `partage`, `I don’t share this opinion.`, '']],
  qs: [SQ('Which is the best way to introduce a counter-argument?', ['Je ne sais pas.', 'On pourrait objecter que…', 'C’est tout.', 'Bref, voilà.'], 1, 'Acknowledge the opposing view before answering it.'),
    SQ('A strong argument contains…', ['only your opinion', 'an idea, an explanation and an example', 'a question to the reader', 'a list of words'], 1, 'Idea + explanation + example.')]
});

FRT('fr-quebec', { name: 'Canadian & Québec French', cat: 'frb2',
  blurb: `The TEF Canada and TCF Canada listening sections include Canadian voices, and daily life in Quebec, Ontario, New Brunswick and Manitoba uses Canadian vocabulary. Learn the main differences in words, expressions and pronunciation, and which ones are informal.`,
  facts: [['French mother tongue (2021)', '≈ 7.7 million Canadians'], ['Shopping', 'magasiner'], ['Weekend', 'la fin de semaine'], ['Breakfast/lunch/dinner', 'déjeuner / dîner / souper']],
  cheat: [['la fin de semaine', 'the weekend (France: le week-end)'], ['le déjeuner / le dîner / le souper', 'breakfast / lunch / dinner'], ['magasiner / le magasinage', 'to shop / shopping'], ['un char (informal) / une auto', 'a car (France: une voiture)'], ['un chum / une blonde', 'boyfriend / girlfriend (informal)'], ['un courriel', 'an email (France: un e-mail)'], ['un dépanneur', 'a convenience store'], ['un cellulaire', 'a mobile phone (France: un portable)'], ['l’épicerie', 'groceries / grocery store'], ['présentement', 'currently'], ['C’est correct.', 'It’s OK.'], ['Bienvenue !', 'You’re welcome!'], ['Il fait frette (informal).', 'It’s freezing.'], ['Ça a pas d’allure ! (informal)', 'That makes no sense!'], ['tantôt', 'earlier / later today']],
  sections: [
    ['Everyday vocabulary', TBL(['Canada / Québec', 'France', 'English'], [[FR('la fin de semaine'), FR('le week-end'), 'weekend'], [FR('magasiner'), FR('faire du shopping'), 'to shop'], [FR('un stationnement'), FR('un parking'), 'parking lot'], [FR('une garderie'), FR('une crèche'), 'daycare'], [FR('le cégep'), '—', 'Quebec pre-university/technical college'], [FR('une tuque'), FR('un bonnet'), 'winter hat'], [FR('le traversier'), FR('le ferry'), 'ferry'], [FR('une facture / l’addition'), FR('l’addition'), 'restaurant bill'], [FR('payer comptant'), FR('payer en espèces'), 'pay cash'], [FR('une job (informal)'), FR('un boulot (informal)'), 'a job']])],
    ['Pronunciation you will hear', UL([`<b>t, d before i/u</b> → “ts, dz”: ${FR('tu dis')} sounds like “tsu dzi”.`, `<b>Long vowels and diphthongs</b> in stressed syllables: ${FR('père')}, ${FR('fête')}.`, `<b>Reduced forms in speech:</b> “chu” for je suis, “y’a” for il y a, “pis” for puis (and then), and dropping ne: ${FR('Je sais pas')}.`, `Questions with <b>-tu</b> (informal): “Tu viens-tu ?” = Are you coming?`])],
    ['Register: what to use in the tests', PP(`Understand informal Québec French, but write and speak in <b>standard French</b> in the exams. Neutral Canadian words like ${FR('courriel')}, ${FR('fin de semaine')}, ${FR('magasiner')}, ${FR('cellulaire')} are perfectly acceptable; avoid slang like char, chum, frette, and anglicisms (“c’est le fun” is very common but informal).`)]
  ],
  edge: [`Confusing meals: in Quebec ${FR('le dîner')} is lunch.`, `Using informal Québécois in the written exam.`, `Calquing English: “appliquer pour un emploi” ✗ → ${FR('postuler à un emploi')}; “prendre une marche” → ${FR('faire une promenade')} (both forms heard in Quebec).`],
  ex: [[`En France on dit « le week-end », au Québec « la fin de ___ ».`, `semaine`, '', ''],
    [`Au Québec, le repas de midi s’appelle le ___ .`, `dîner`, '', ''],
    [`Je vais ___ au centre commercial. (to shop, Québec)`, `magasiner`, '', ''],
    [`Je t’envoie un ___ ce soir. (email)`, `courriel`, '', ''],
    [`Il fait froid : mets ta ___ ! (winter hat)`, `tuque`, '', ''],
    [`Merci ! — ___ ! (Québec: you’re welcome)`, `bienvenue`, '', ''],
    [`Je postule ___ un emploi d’infirmière. (apply for)`, `à|pour`, '', 'postuler à / pour, not appliquer'],
    [`Le ___ part toutes les heures pour l’île. (ferry, Québec)`, `traversier`, '', '']],
  qs: [SQ('In Quebec, “le souper” is…', ['breakfast', 'lunch', 'dinner (evening meal)', 'a snack'], 2, 'déjeuner, dîner, souper.'),
    SQ('In the TEF written test you should write…', ['informal Québécois', 'standard French', 'English loanwords', 'text-message style'], 1, 'Understand Canadian French; write standard French.')]
});
