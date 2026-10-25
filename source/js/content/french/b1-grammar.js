/* ===== French B1: plus-que-parfait, conditionnel & si, subjonctif, dont/lequel, pronoun order, gérondif, reported speech, passive, connectors ===== */
FRT('fr-pqp', { name: 'Plus-que-parfait & telling a story', cat: 'frb1',
  blurb: `The plus-que-parfait (had done) places an action before another past action. With the passé composé and the imparfait, it gives you the full toolkit to narrate past events clearly, which TEF writing task A and many speaking questions require.`,
  facts: [['Form', 'imparfait of avoir/être + participle'], ['Meaning', 'had done'], ['Agreement', 'same rules as passé composé'], ['Typical words', 'déjà, avant, parce que']],
  cheat: [['j’avais fini', 'I had finished'], ['tu étais parti(e)', 'you had left'], ['il avait vu', 'he had seen'], ['nous étions arrivé(e)s', 'we had arrived'], ['vous aviez compris', 'you had understood'], ['ils s’étaient rencontrés', 'they had met'], ['Quand je suis arrivé, le film avait déjà commencé.', 'earlier action'], ['Si j’avais su… (B2)', 'If I had known…'], ['Time words', 'la veille (the day before), auparavant (before), deux jours plus tôt']],
  sections: [
    ['Formation and use', PP(`Imparfait of the auxiliary + past participle: ${FR('J’avais déjà rempli le formulaire quand ils m’ont appelé.')} The plus-que-parfait answers “what had happened before that moment?” ${FR('Elle était fatiguée parce qu’elle avait travaillé toute la nuit.')}`)],
    ['The three past tenses together', TBL(['Tense', 'Role in a story', 'Example'], [['Imparfait', 'setting, description, ongoing actions', FR('Il était 8 h et il neigeait.')], ['Passé composé', 'events that move the story forward', FR('Mon téléphone a sonné.')], ['Plus-que-parfait', 'what had happened earlier', FR('J’avais oublié de le charger.')]])],
    ['Narrating an incident', FXS([['La semaine dernière, je suis allé à mon entrevue en métro.', 'Last week I went to my interview by metro.'], ['Il y avait beaucoup de monde parce qu’une panne avait bloqué la ligne verte.', 'It was crowded because a breakdown had blocked the green line.'], ['Heureusement, j’étais parti tôt, donc je suis arrivé à l’heure.', 'Luckily I had left early, so I arrived on time.']]) +
      PP(`Useful sequencing words: ${FR('d’abord')}, ${FR('ensuite')}, ${FR('puis')}, ${FR('à ce moment-là')}, ${FR('soudain')}, ${FR('finalement')}, ${FR('enfin')}.`)]
  ],
  edge: [`Using passé composé for an earlier action: “Je n’ai pas pu entrer parce que j’ai perdu ma clé” → better ${FR('parce que j’avais perdu ma clé')}.`, `Wrong auxiliary: être verbs stay with être: ${FR('elle était partie')}.`, `Forgetting agreement: ${FR('nous étions arrivés')}.`],
  ex: [[`Quand je suis arrivé, ils ___ déjà mangé. (avoir)`, `avaient`, `When I arrived, they had already eaten.`, ''],
    [`Elle ___ partie avant la fin. (être)`, `était`, `She had left before the end.`, 'partir → être'],
    [`Je n’ai pas reconnu Paul : il avait ___ . (changer)`, `changé`, `I didn’t recognize Paul: he had changed.`, ''],
    [`Nous étions ___ trop tard. (arriver)`, `arrivés|arrivées`, `We had arrived too late.`, 'agreement'],
    [`Il était content parce qu’il avait ___ son examen. (réussir)`, `réussi`, `He was happy because he had passed his exam.`, ''],
    [`Ils s’étaient ___ à Paris. (rencontrer)`, `rencontrés`, `They had met in Paris.`, ''],
    [`Tu avais ___ la porte ? (fermer)`, `fermé`, `Had you closed the door?`, ''],
    [`J’avais ___ cette lettre la veille. (écrire)`, `écrit`, `I had written that letter the day before.`, '']],
  qs: [SQ('“I had already sent the email.”', ['J’ai déjà envoyé le courriel.', 'J’avais déjà envoyé le courriel.', 'J’envoyais déjà le courriel.', 'J’aurais déjà envoyé le courriel.'], 1, 'Imparfait of avoir + participle.'),
    SQ('Which tense describes the setting of a story?', ['Passé composé', 'Imparfait', 'Plus-que-parfait', 'Futur'], 1, 'Imparfait for background and description.')]
});

FRT('fr-cond', { name: 'Conditionnel présent & si clauses', cat: 'frb1',
  blurb: `The conditional expresses politeness (je voudrais), advice (tu devrais), hypotheses and unconfirmed information. With si, it builds “if” sentences. Both appear constantly in TEF speaking (requests) and TCF writing (suggestions).`,
  facts: [['Form', 'future stem + imparfait endings'], ['Polite request', 'Pourriez-vous… ?'], ['Si + imparfait', '→ conditionnel'], ['Si + présent', '→ présent / futur / impératif']],
  cheat: [['je voudrais', 'I would like'], ['pourriez-vous… ?', 'could you…?'], ['tu devrais', 'you should'], ['il faudrait', 'it would be necessary'], ['ce serait bien de…', 'it would be good to…'], ['à ta place, je…', 'if I were you, I would…'], ['Si j’ai le temps, je viendrai.', 'real condition'], ['Si j’avais le temps, je viendrais.', 'hypothesis (unlikely)'], ['Selon la police, il y aurait trois blessés.', 'unconfirmed news (conditionnel journalistique)']],
  sections: [
    ['Formation', PP(`Future stem + imparfait endings (-ais, -ais, -ait, -ions, -iez, -aient): ${FR('je parlerais')}, ${FR('nous finirions')}, ${FR('ils prendraient')}, ${FR('je serais')}, ${FR('j’aurais')}, ${FR('j’irais')}, ${FR('je ferais')}, ${FR('je pourrais')}, ${FR('je voudrais')}, ${FR('je devrais')}.`)],
    ['Uses', TBL(['Use', 'Example'], [['Politeness', FR('Pourriez-vous m’envoyer les détails par courriel ?')], ['Wishes', FR('J’aimerais travailler dans le domaine de la santé.')], ['Advice', FR('Vous devriez vous inscrire tôt.') + ' ' + FR('À votre place, je prendrais le forfait annuel.')], ['Suggestions', FR('On pourrait se retrouver samedi.')], ['Hypothesis', FR('Avec un meilleur salaire, je resterais.')], ['Unconfirmed facts (news)', FR('Le projet coûterait 2 millions de dollars.')], ['Future in the past', FR('Il a dit qu’il viendrait.')]])],
    ['Si clauses (types 1 and 2)', TBL(['Si + …', 'Main clause', 'Meaning', 'Example'], [['présent', 'présent / futur / impératif', 'real, possible', FR('Si tu veux, je t’aiderai.')], ['imparfait', 'conditionnel présent', 'imaginary, unlikely', FR('Si je parlais mieux français, j’aurais plus de points.')]]) +
      PP(`Never put the conditional or the future right after <b>si</b> (“if”). The order can be reversed: ${FR('Je serais content si tu venais.')}`)],
    ['Speaking test phrases (asking for information)', FXS([['Je voudrais savoir si le prix comprend l’assurance.', 'I’d like to know whether the price includes insurance.'], ['Serait-il possible de payer en plusieurs fois ?', 'Would it be possible to pay in instalments?'], ['Est-ce que vous pourriez me dire quels documents il faut fournir ?', 'Could you tell me which documents I need to provide?']])]
  ],
  edge: [`“Si j’aurais…” ✗ → ${FR('Si j’avais…')}.`, `“Je voudrai” (future) vs ${FR('je voudrais')} (conditional): different spelling and sound (é vs è) in careful speech.`, `Using the conditional for certain facts in formal writing: be careful, it signals doubt.`],
  ex: [[`Je ___ un café, s’il vous plaît. (vouloir)`, `voudrais`, `I would like a coffee, please.`, ''],
    [`___-vous répéter la question ? (pouvoir)`, `pourriez`, `Could you repeat the question?`, ''],
    [`Tu ___ consulter un médecin. (devoir)`, `devrais`, `You should see a doctor.`, 'advice'],
    [`Si j’avais plus d’argent, j’___ une maison. (acheter)`, `achèterais`, `If I had more money, I would buy a house.`, ''],
    [`Si tu ___ le temps, viens nous voir ! (avoir, présent)`, `as`, `If you have time, come see us!`, 'si + présent'],
    [`Si nous ___ au Québec, nous parlerions français tous les jours. (habiter)`, `habitions`, `If we lived in Quebec, we would speak French every day.`, 'si + imparfait'],
    [`Il ___ préférable d’arriver tôt. (être)`, `serait`, `It would be better to arrive early.`, ''],
    [`Elle m’a dit qu’elle ___ en retard. (être)`, `serait`, `She told me she would be late.`, 'future in the past']],
  qs: [SQ('Complete: “Si je gagnais à la loterie, je …”', ['voyagerai', 'voyagerais', 'voyageais', 'voyage'], 1, 'si + imparfait → conditionnel.'),
    SQ('The most polite request:', ['Vous pouvez m’aider ?', 'Aidez-moi.', 'Pourriez-vous m’aider ?', 'Tu m’aides ?'], 2, 'Conditionnel + inversion.')]
});

FRT('fr-subj1', { name: 'Subjonctif présent: forms & main triggers', cat: 'frb1',
  blurb: `The subjunctive is a mood, not a tense: it appears after que when the main clause expresses will, necessity, emotion or doubt. It is required for NCLC 7+ writing, and examiners notice it.`,
  facts: [['Stem (je, tu, il, ils)', 'ils-form minus -ent'], ['Stem (nous, vous)', 'imparfait'], ['Endings', '-e -es -e -ions -iez -ent'], ['Key trigger', 'il faut que']],
  cheat: [['parler → que je parle', 'regular'], ['finir → que je finisse', 'from ils finissent'], ['prendre → que je prenne, que nous prenions', 'two stems'], ['être → que je sois, nous soyons', 'irregular'], ['avoir → que j’aie, nous ayons', 'irregular'], ['aller → que j’aille, nous allions', 'irregular'], ['faire → que je fasse', 'irregular'], ['pouvoir → que je puisse', 'irregular'], ['savoir → que je sache', 'irregular'], ['vouloir → que je veuille, nous voulions', 'irregular'], ['Il faut que / Je veux que / Je suis content que…', 'triggers']],
  sections: [
    ['Formation', PP(`Take the <b>ils</b> form of the present, remove -ent, add -e, -es, -e, -ent: ${FR('ils écrivent')} → ${FR('que j’écrive')}. For <b>nous</b> and <b>vous</b>, the form equals the imparfait: ${FR('que nous écrivions')}, ${FR('que vous écriviez')}. Check any verb in the Conjugation lab.`)],
    ['Triggers', TBL(['Category', 'Expressions', 'Example'], [['Necessity', 'il faut que, il est nécessaire / important / essentiel que', FR('Il faut que vous fournissiez une preuve de fonds.')], ['Will, wish, request', 'vouloir que, souhaiter que, exiger que, demander que, préférer que', FR('Mon patron veut que je finisse ce rapport.')], ['Emotion', 'être content / triste / surpris que, avoir peur que, regretter que', FR('Je suis heureux que tu sois là.')], ['Doubt (B2)', 'douter que, il est possible que, ne pas penser que', FR('Il est possible qu’il pleuve.')], ['Conjunctions (B2)', 'pour que, bien que, avant que, à moins que', FR('Je parle lentement pour que tout le monde comprenne.')]])],
    ['Subjunctive or infinitive?', PP(`When both clauses have the <b>same subject</b>, use an infinitive instead: ${FR('Je veux partir.')} (not “je veux que je parte”). Different subjects → que + subjunctive: ${FR('Je veux que tu partes.')} Same with emotions: ${FR('Je suis content d’être ici.')} vs ${FR('Je suis content que tu sois ici.')}`)],
    ['No subjunctive after…', PP(`<b>espérer que</b>, <b>penser que / croire que</b> (affirmative), <b>il est sûr / certain / probable que</b> and <b>après que</b> take the indicative: ${FR('J’espère que tu vas bien.')} ${FR('Je pense qu’il a raison.')}`)]
  ],
  edge: [`“Il faut que je vais” ✗ → ${FR('Il faut que j’aille')}.`, `“J’espère que tu sois” ✗ → ${FR('J’espère que tu es / seras')}.`, `“Je veux que je…” ✗ → ${FR('Je veux + infinitif')}.`, `Mixing aie (avoir) and ait: ${FR('que j’aie')}, ${FR('qu’il ait')}.`],
  ex: [[`Il faut que tu ___ ce formulaire. (remplir)`, `remplisses`, `You have to fill in this form.`, ''],
    [`Je veux que vous ___ à l’heure. (être)`, `soyez`, `I want you to be on time.`, ''],
    [`Il est important que nous ___ français. (parler)`, `parlions`, `It’s important that we speak French.`, ''],
    [`Ma mère est contente que je ___ un emploi. (avoir)`, `aie`, `My mother is happy that I have a job.`, ''],
    [`Il faut que j’___ à la banque. (aller)`, `aille`, `I have to go to the bank.`, ''],
    [`Le médecin veut que je ___ du sport. (faire)`, `fasse`, `The doctor wants me to do sports.`, ''],
    [`J’espère qu’il ___ beau demain. (faire, indicatif futur)`, `fera`, `I hope the weather will be nice tomorrow.`, 'espérer → indicative'],
    [`Je doute qu’il ___ venir. (pouvoir)`, `puisse`, `I doubt that he can come.`, 'doubt → subjunctive']],
  qs: [SQ('“It’s necessary that you take the bus.”', ['Il faut que tu prends le bus.', 'Il faut que tu prennes le bus.', 'Il faut que tu prendras le bus.', 'Il faut tu prennes le bus.'], 1, 'il faut que + subjunctive (prennes).'),
    SQ('Which takes the indicative?', ['Je veux que…', 'Il faut que…', 'Je pense que…', 'Je suis triste que…'], 2, 'penser que (affirmative) → indicative.')]
});

FRT('fr-relatives2', { name: 'Relative pronouns dont, lequel, ce qui, ce que', cat: 'frb1',
  blurb: `Advanced relatives make your writing fluent and precise: dont replaces de + noun, lequel/auquel/duquel follow prepositions, and ce qui / ce que mean “what” in the middle of a sentence. They are markers of B1–B2 writing.`,
  facts: [['dont', 'replaces de + …'], ['avec / pour / sur + lequel', 'after prepositions'], ['à + lequel', 'auquel, à laquelle, auxquels'], ['ce qui / ce que', 'what (subject / object)']],
  cheat: [['le livre dont je parle', 'parler de'], ['l’emploi dont j’ai besoin', 'avoir besoin de'], ['la ville dont il est originaire', 'être originaire de'], ['la personne avec qui je travaille', 'prep. + qui for people'], ['l’outil avec lequel je travaille', 'prep. + lequel for things'], ['le projet auquel je pense', 'penser à'], ['le parc près duquel j’habite', 'près de + lequel'], ['Ce qui m’intéresse, c’est…', 'what (subject)'], ['Ce que je veux, c’est…', 'what (object)'], ['Tout ce dont j’ai besoin', 'everything I need']],
  sections: [
    ['dont', PP(`Use <b>dont</b> when the verb or expression is followed by <b>de</b>: ${FR('C’est le collègue dont je t’ai parlé.')} (parler de), ${FR('Voici le document dont vous avez besoin.')} (avoir besoin de), ${FR('C’est une décision dont je suis fier.')} (être fier de). It also means “whose”: ${FR('une entreprise dont le siège est à Montréal')}.`)],
    ['Preposition + qui / lequel', TBL(['', 'masc.', 'fem.', 'masc. pl.', 'fem. pl.'], [['lequel', 'lequel', 'laquelle', 'lesquels', 'lesquelles'], ['à +', 'auquel', 'à laquelle', 'auxquels', 'auxquelles'], ['de + (after a phrase like près de)', 'duquel', 'de laquelle', 'desquels', 'desquelles']]) +
      PP(`For people you can use qui: ${FR('la collègue avec qui je déjeune')}. For things use lequel: ${FR('la raison pour laquelle je postule')} (the reason why I am applying), ${FR('les conditions dans lesquelles nous travaillons')}.`)],
    ['ce qui, ce que, ce dont', PP(`When there is no noun to refer to, add <b>ce</b>: ${FR('Ce qui est difficile, c’est l’hiver.')} ${FR('Je ne comprends pas ce que vous dites.')} ${FR('Dites-moi ce dont vous avez besoin.')} Useful to emphasize ideas in essays: ${FR('Ce que je trouve le plus important, c’est la sécurité.')}`)]
  ],
  edge: [`“Le livre que je parle” ✗ → ${FR('le livre dont je parle')}.`, `“La raison pour quoi” ✗ → ${FR('la raison pour laquelle')}.`, `“Je ne sais pas qu’est-ce que tu veux” ✗ → ${FR('ce que tu veux')}.`, `“À lequel” ✗ → ${FR('auquel')}.`],
  ex: [[`C’est le film ___ tout le monde parle.`, `dont`, `It’s the film everyone is talking about.`, 'parler de'],
    [`Voici l’outil ___ j’ai besoin.`, `dont`, `Here’s the tool I need.`, 'avoir besoin de'],
    [`C’est la raison pour ___ je suis ici.`, `laquelle`, `That’s the reason why I’m here.`, ''],
    [`Le projet ___ je travaille est passionnant.`, `auquel|sur lequel`, `The project I’m working on is exciting.`, 'travailler à / sur'],
    [`___ me plaît ici, c’est la nature.`, `ce qui`, `What I like here is nature.`, 'subject'],
    [`Je ne comprends pas ___ tu veux dire.`, `ce que`, `I don’t understand what you mean.`, 'object'],
    [`La personne avec ___ je partage mon bureau est sympa.`, `qui|laquelle`, `The person I share my office with is nice.`, ''],
    [`C’est une entreprise ___ les employés sont satisfaits.`, `dont`, `It’s a company whose employees are satisfied.`, 'dont = whose']],
  qs: [SQ('“the job I dream of” (rêver de)', ['l’emploi que je rêve', 'l’emploi dont je rêve', 'l’emploi duquel je rêve', 'l’emploi où je rêve'], 1, 'rêver de → dont.'),
    SQ('“the reason why” is…', ['la raison pourquoi', 'la raison pour laquelle', 'la raison que', 'la raison dont'], 1, 'pour + laquelle (raison is feminine).')]
});

FRT('fr-pron-order', { name: 'Double object pronouns', cat: 'frb1',
  blurb: `When two pronouns appear together (je le lui donne, il m’en parle), French follows a fixed order. Mastering it makes your answers natural and short.`,
  facts: [['Order', 'me/te/se/nous/vous → le/la/les → lui/leur → y → en'], ['Affirmative imperative', 'verb-le-moi'], ['Max', 'two pronouns'], ['Typical', 'je le lui ai dit']],
  cheat: [['Il me le donne.', 'He gives it to me.'], ['Je le lui envoie.', 'I send it to him/her.'], ['Nous les leur expliquons.', 'We explain them to them.'], ['Je vous en parle.', 'I talk to you about it.'], ['Il y en a.', 'There are some.'], ['Donne-le-moi !', 'Give it to me!'], ['Ne me le donne pas.', 'Don’t give it to me.'], ['Je vais te l’envoyer.', 'I’m going to send it to you.']],
  sections: [
    ['The order', TBL(['1', '2', '3', '4', '5'], [['me, te, se, nous, vous', 'le, la, les', 'lui, leur', 'y', 'en']]) +
      FXS([['Tu m’envoies le lien ? — Oui, je te l’envoie tout de suite.', 'Will you send me the link? — Yes, I’ll send it right away.'], ['Il a donné les clés au propriétaire ? — Oui, il les lui a données.', 'Did he give the keys to the landlord? — Yes, he gave them to him.'], ['Vous avez parlé du problème à vos collègues ? — Oui, je leur en ai parlé.', 'Did you tell your colleagues about the problem? — Yes, I told them about it.']])],
    ['Imperative', PP(`In the affirmative imperative, pronouns follow the verb with hyphens, direct before indirect, and me/te become moi/toi: ${FR('Envoyez-le-moi.')} ${FR('Donnez-leur-en.')} In the negative, the normal order returns: ${FR('Ne me l’envoyez pas.')}`)]
  ],
  edge: [`“Je lui le donne” ✗ → ${FR('Je le lui donne')}.`, `“Donne-moi-le” ✗ → ${FR('Donne-le-moi')}.`, `“Moi” in the negative: ${FR('Ne me le dis pas')}.`, `Agreement: ${FR('Les lettres ? Je les lui ai envoyées.')}`],
  ex: [[`Le livre ? Je ___ prête. (it, to you — two pronouns)`, `te le`, `I’m lending it to you.`, 'me/te before le'],
    [`La lettre ? Il ___ a envoyée. (it, to her — two pronouns)`, `la lui`, `He sent it to her.`, 'le/la before lui'],
    [`Des pommes ? Je vous ___ donne deux.`, `en`, `I’ll give you two.`, ''],
    [`Les résultats ? Je vais ___ expliquer. (them, to them — two pronouns)`, `les leur`, `I’m going to explain them to them.`, ''],
    [`Donne-___-moi ! (it, m.)`, `le`, `Give it to me!`, ''],
    [`Il y ___ a beaucoup.`, `en`, `There are a lot.`, 'y before en'],
    [`Ne ___ le dis pas ! (to me)`, `me`, `Don’t tell me!`, 'negative imperative'],
    [`Tu m’en parles ? Oui, je t’___ parle.`, `en`, `Yes, I’m talking to you about it.`, '']],
  qs: [SQ('“I give it (la photo) to him.”', ['Je lui la donne.', 'Je la lui donne.', 'Je la donne lui.', 'Je lui donne la.'], 1, 'la before lui.'),
    SQ('“Send it to me!” (vous)', ['Envoyez-moi-le !', 'Envoyez-le-moi !', 'Me l’envoyez !', 'Envoyez-le-me !'], 1, 'Direct before indirect, moi.')]
});

FRT('fr-gerondif', { name: 'Participe présent & gérondif', cat: 'frb1',
  blurb: `The gérondif (en + -ant) says how or when something happens and links ideas elegantly: en travaillant, j’ai appris. The present participle (-ant without en) is formal and common in written French and job postings.`,
  facts: [['Stem', 'nous-form minus -ons + -ant'], ['Gérondif', 'en + participe présent'], ['Irregular', 'étant, ayant, sachant'], ['Same subject', 'required for the gérondif']],
  cheat: [['parlant, finissant, prenant', 'from nous parlons, finissons, prenons'], ['étant, ayant, sachant', 'être, avoir, savoir'], ['en travaillant', 'while / by working'], ['tout en souriant', 'while smiling (contrast)'], ['C’est en forgeant qu’on devient forgeron.', 'Practice makes perfect.'], ['Les candidats possédant un diplôme…', 'participle = qui possèdent'], ['Ayant terminé mes études, j’ai…', 'Having finished my studies, I…']],
  sections: [
    ['The gérondif', TBL(['Meaning', 'Example'], [['simultaneity (while)', FR('J’écoute des balados en conduisant.')], ['manner / means (by)', FR('J’ai amélioré mon français en regardant la télé québécoise.')], ['condition (if)', FR('En partant maintenant, tu arriveras à temps.')], ['contrast (tout en)', FR('Il travaille à temps plein tout en étudiant le soir.')]]) +
      PP(`The subject of the gérondif must be the subject of the main verb: ${FR('En sortant du métro, j’ai vu mon ancien collègue.')} (I came out of the metro.)`)],
    ['The present participle', PP(`Without en, the -ant form replaces a relative clause or a cause, mostly in writing: ${FR('Nous recherchons une personne parlant couramment français et anglais.')} (= qui parle) ${FR('N’ayant pas reçu de réponse, je me permets de vous relancer.')} (= Comme je n’ai pas reçu… ) This is very useful in formal letters.`)]
  ],
  edge: [`Different subjects: “En entrant, la porte s’est fermée” ✗ (the door didn’t enter).`, `“En étant” is rarely needed: use ${FR('étant')} or a clause.`, `Agreement: the participle does not agree (${FR('des personnes parlant français')}); the verbal adjective does (${FR('des personnes intéressantes')}).`],
  ex: [[`J’ai appris le français ___ lisant des journaux.`, `en`, `I learned French by reading newspapers.`, ''],
    [`Il mange en ___ la télé. (regarder)`, `regardant`, `He eats while watching TV.`, ''],
    [`En ___ tôt, vous éviterez la foule. (partir)`, `partant`, `By leaving early, you’ll avoid the crowd.`, ''],
    [`___ malade, il n’est pas venu. (être)`, `étant`, `Being sick, he didn’t come.`, ''],
    [`___ terminé mon stage, je cherche un emploi. (avoir)`, `ayant`, `Having completed my internship, I’m looking for a job.`, ''],
    [`Nous cherchons un employé ___ l’anglais. (parler)`, `parlant`, `We’re looking for an employee who speaks English.`, ''],
    [`Elle travaille tout en ___ ses enfants. (élever)`, `élevant`, `She works while raising her children.`, ''],
    [`En ___ ce cours, j’ai pris confiance. (suivre)`, `suivant`, `By taking this course, I gained confidence.`, 'nous suivons → suivant']],
  qs: [SQ('“by working hard”', ['en travaillé dur', 'en travaillant dur', 'à travailler dur', 'par travaillant dur'], 1, 'en + -ant.'),
    SQ('Present participle of “savoir”:', ['savant', 'sachant', 'savoyant', 'sachent'], 1, 'Irregular: sachant.')]
});

FRT('fr-reported', { name: 'Reported speech (present)', cat: 'frb1',
  blurb: `Report what someone says or asks: il dit que…, elle demande si…, il veut savoir ce que… Pronouns and possessives change, questions lose their inversion, and orders become de + infinitive.`,
  facts: [['Statements', 'dire que'], ['Yes/no questions', 'demander si'], ['Wh-questions', 'demander où, quand, comment…'], ['Orders', 'dire de + infinitive']],
  cheat: [['« Je suis fatigué. » → Il dit qu’il est fatigué.', 'statement'], ['« Tu viens ? » → Elle demande si je viens.', 'yes/no question'], ['« Où habitez-vous ? » → Il demande où j’habite.', 'question word'], ['« Qu’est-ce que tu fais ? » → Il demande ce que je fais.', 'qu’est-ce que → ce que'], ['« Qu’est-ce qui se passe ? » → Il demande ce qui se passe.', 'qu’est-ce qui → ce qui'], ['« Remplissez ce formulaire. » → Il nous dit de remplir ce formulaire.', 'order'], ['Reporting verbs', 'expliquer, affirmer, ajouter, répondre, préciser, annoncer, se demander']],
  sections: [
    ['Changes', PP(`Pronouns and possessives change to fit the new speaker: « ${FR('Je cherche mon passeport')} » → ${FR('Elle dit qu’elle cherche son passeport.')} Questions drop inversion and est-ce que: « ${FR('Pouvez-vous m’aider ?')} » → ${FR('Il me demande si je peux l’aider.')} (si + il → s’il).`)],
    ['In a message or summary (useful for TCF task 3 and TEF listening)', FXS([['Le directeur annonce que l’entreprise va recruter vingt personnes.', 'The director announces that the company is going to hire twenty people.'], ['Les citoyens se demandent si les loyers vont continuer d’augmenter.', 'Residents wonder whether rents will keep rising.'], ['L’auteur explique pourquoi le télétravail améliore la qualité de vie.', 'The author explains why remote work improves quality of life.']])],
    ['When the reporting verb is in the past (B2)', PP(`If you say “il a dit que…”, the tenses shift (present → imparfait, passé composé → plus-que-parfait, futur → conditionnel). See the B2 unit on <b>concordance des temps</b>.`)]
  ],
  edge: [`Keeping est-ce que: “Il demande est-ce que tu viens” ✗ → ${FR('Il demande si tu viens')}.`, `“Si il” ✗ → ${FR('s’il')}.`, `“Il demande qu’est-ce que je veux” ✗ → ${FR('ce que je veux')}.`, `Orders with que: “Il dit que je remplis” for an order → ${FR('Il me dit de remplir')}.`],
  ex: [[`« Je pars demain. » → Il dit ___ il part demain.`, `qu’|qu'`, '', ''],
    [`« Tu as faim ? » → Elle me demande ___ j’ai faim.`, `si`, '', ''],
    [`« Où travaillez-vous ? » → Il me demande ___ je travaille.`, `où`, '', ''],
    [`« Qu’est-ce que vous voulez ? » → Il demande ___ nous voulons.`, `ce que`, '', ''],
    [`« Qu’est-ce qui est arrivé ? » → Elle demande ___ est arrivé.`, `ce qui`, '', ''],
    [`« Fermez la porte. » → Il nous dit ___ fermer la porte.`, `de`, '', 'order → de + infinitive'],
    [`« Il est malade ? » → Je me demande ___ est malade.`, `s’il|s'il`, '', 'si + il → s’il'],
    [`« J’aime ma ville. » → Elle dit qu’elle aime ___ ville.`, `sa`, '', 'possessive changes']],
  qs: [SQ('« Avez-vous un permis ? » → Il me demande…', ['si j’ai un permis.', 'est-ce que j’ai un permis.', 'que j’ai un permis.', 'si avez-vous un permis.'], 0, 'Yes/no question → si.'),
    SQ('« Attendez ici. » → Elle nous dit…', ['qu’on attend ici.', 'd’attendre ici.', 'attendre ici.', 'si on attend ici.'], 1, 'Order → de + infinitive.')]
});

FRT('fr-passive', { name: 'Passive voice & alternatives', cat: 'frb1',
  blurb: `The passive (être + participle) focuses on what was done rather than who did it, and is common in news, reports and official letters. French also prefers alternatives: on, se faire, and reflexive passives.`,
  facts: [['Form', 'être (any tense) + participle'], ['Agent', 'par (sometimes de)'], ['Agreement', 'participle agrees with subject'], ['Common alternative', 'on']],
  cheat: [['Le contrat est signé par le directeur.', 'present passive'], ['La maison a été vendue.', 'past passive'], ['Les résultats seront publiés lundi.', 'future passive'], ['Il est aimé de tous.', 'de with feelings/states'], ['On m’a volé mon vélo.', 'on = someone'], ['Je me suis fait voler mon vélo.', 'se faire + infinitive'], ['Le français se parle partout ici.', 'reflexive passive'], ['Ça se fait / ça ne se fait pas.', 'it is (not) done']],
  sections: [
    ['Forming the passive', PP(`The tense is carried by <b>être</b>: ${FR('Le poste est offert à Montréal.')} (present) → ${FR('Le poste a été offert à une autre candidate.')} (passé composé) → ${FR('Le poste sera affiché la semaine prochaine.')} (future). The participle agrees: ${FR('Les demandes ont été traitées.')}`)],
    ['When to use it', PP(`In formal writing and the news: ${FR('Trois personnes ont été blessées dans l’accident.')} ${FR('Votre demande a été reçue et sera traitée dans un délai de 90 jours.')} In everyday speech prefer active forms or <b>on</b>: ${FR('On a annulé la réunion.')}`)],
    ['Alternatives', TBL(['Structure', 'Example'], [['on + active verb', FR('On parle français ici.')], ['se faire + infinitive (something happens to you)', FR('Il s’est fait renvoyer.') + ' (He got fired.)'], ['reflexive passive (general truths)', FR('Ce vin se boit frais.') + ' ' + FR('Ça se voit !')]])]
  ],
  edge: [`Forgetting agreement: “Les lettres ont été envoyé” ✗ → ${FR('envoyées')}.`, `Indirect objects can’t become passive subjects: “Je suis été donné un livre” ✗ → ${FR('On m’a donné un livre')}.`, `Overusing the passive in conversation sounds stiff.`],
  ex: [[`Le rapport ___ écrit par Julie. (present)`, `est`, `The report is written by Julie.`, ''],
    [`La réunion a été ___ . (annuler)`, `annulée`, `The meeting was cancelled.`, 'agrees with réunion'],
    [`Les candidats ___ contactés demain. (future)`, `seront`, `Candidates will be contacted tomorrow.`, ''],
    [`Ce professeur est respecté ___ ses élèves.`, `de|par`, `This teacher is respected by his students.`, 'de with feelings'],
    [`___ m’a proposé un poste à Québec.`, `on`, `I was offered a job in Quebec City.`, ''],
    [`Il s’est ___ voler son portefeuille.`, `fait`, `He had his wallet stolen.`, 'se faire + infinitive'],
    [`Le français ___ parle dans plusieurs provinces.`, `se`, `French is spoken in several provinces.`, ''],
    [`Les maisons ont été ___ en 1950. (construire)`, `construites`, `The houses were built in 1950.`, '']],
  qs: [SQ('“The results were published.”', ['Les résultats ont publié.', 'Les résultats ont été publiés.', 'Les résultats sont été publiés.', 'Les résultats étaient publié.'], 1, 'avoir été + participle (agreement).'),
    SQ('Most natural in conversation: “English is spoken here.”', ['L’anglais est parlé ici.', 'On parle anglais ici.', 'L’anglais a été parlé ici.', 'Ici est parlé anglais.'], 1, 'Use on in everyday speech.')]
});

FRT('fr-connectors1', { name: 'Linking words: cause, consequence, purpose, contrast', cat: 'frb1',
  blurb: `Connectors (connecteurs logiques) are the single biggest difference between a CLB 5 and a CLB 7+ text. Learn which ones introduce a clause, which ones a noun, and which ones need the subjunctive.`,
  facts: [['Cause', 'parce que, car, puisque, grâce à, à cause de'], ['Consequence', 'donc, alors, c’est pourquoi, par conséquent'], ['Purpose', 'pour (que), afin de / afin que'], ['Contrast', 'mais, pourtant, cependant, par contre']],
  cheat: [['parce que + clause', 'because'], ['car + clause (written)', 'for, because'], ['puisque + clause', 'since (known cause)'], ['grâce à + noun', 'thanks to (positive)'], ['à cause de + noun', 'because of (negative)'], ['donc / alors', 'so'], ['c’est pourquoi / par conséquent', 'that’s why / consequently'], ['pour / afin de + infinitive', 'in order to'], ['pour que / afin que + subjunctive', 'so that'], ['mais / pourtant / cependant / toutefois', 'but / yet / however'], ['par contre / en revanche', 'on the other hand'], ['d’abord, ensuite, enfin', 'first, then, finally']],
  sections: [
    ['Cause and consequence', FXS([['Je prends le métro parce que c’est plus rapide.', 'I take the metro because it’s faster.'], ['Puisque tu es libre, viens avec nous.', 'Since you’re free, come with us.'], ['Grâce à mes collègues, je me suis vite intégré.', 'Thanks to my colleagues, I fit in quickly.'], ['Le vol a été annulé à cause de la tempête.', 'The flight was cancelled because of the storm.'], ['Les loyers augmentent ; par conséquent, beaucoup de familles quittent le centre-ville.', 'Rents are rising; consequently, many families are leaving downtown.']])],
    ['Purpose', PP(`Same subject → <b>pour / afin de + infinitive</b>: ${FR('J’étudie le soir pour obtenir le NCLC 7.')} Different subject → <b>pour que / afin que + subjunctive</b>: ${FR('Je parle lentement pour que mes clients me comprennent.')}`)],
    ['Contrast', PP(`${FR('Le salaire est bon ; cependant, les horaires sont difficiles.')} ${FR('Vivre en ville est pratique. En revanche, c’est plus cher.')} Stronger concession structures (bien que, malgré) are covered in B2.`)],
    ['A connector checklist for writing', OL([`Introduce: ${FR('Tout d’abord')}, ${FR('Pour commencer')}`, `Add: ${FR('De plus')}, ${FR('En outre')}, ${FR('Par ailleurs')}`, `Give an example: ${FR('Par exemple')}, ${FR('notamment')}, ${FR('comme')}`, `Contrast: ${FR('Cependant')}, ${FR('En revanche')}`, `Conclude: ${FR('En conclusion')}, ${FR('Pour conclure')}, ${FR('Bref')}`])]
  ],
  edge: [`“À cause de” for good things: use ${FR('grâce à')}.`, `“Parce que” at the start of a sentence answering nothing; for a known cause use ${FR('Comme')} or ${FR('Puisque')}.`, `“Pour que” + indicative ✗: always subjunctive.`, `“Car” cannot start a sentence after a period in careful writing.`],
  ex: [[`Il est resté chez lui ___ il était malade.`, `parce qu’|parce qu'|car`, `He stayed home because he was sick.`, ''],
    [`J’ai trouvé un emploi ___ à mon réseau.`, `grâce`, `I found a job thanks to my network.`, 'positive cause + noun'],
    [`Le magasin est fermé ___ de la grève.`, `à cause`, `The store is closed because of the strike.`, ''],
    [`Il pleut, ___ nous restons à la maison.`, `donc|alors`, `It’s raining, so we’re staying home.`, ''],
    [`J’économise ___ acheter une maison.`, `pour|afin d’|afin d'`, `I’m saving to buy a house.`, 'same subject → infinitive'],
    [`Je t’explique ___ tu comprennes.`, `pour que|afin que`, `I’m explaining so that you understand.`, 'different subject → subjunctive'],
    [`L’appartement est petit ; ___, il est bien situé.`, `cependant|pourtant|toutefois|par contre`, `The apartment is small; however, it’s well located.`, ''],
    [`___ tu es là, aide-moi !`, `puisque|comme`, `Since you’re here, help me!`, '']],
  qs: [SQ('“Thanks to the subway, I save time.”', ['À cause du métro…', 'Grâce au métro…', 'Parce que le métro…', 'Pour le métro…'], 1, 'Positive cause + noun → grâce à.'),
    SQ('“so that the children can sleep”', ['pour que les enfants peuvent dormir', 'pour que les enfants puissent dormir', 'pour les enfants dormir', 'afin de les enfants dorment'], 1, 'pour que + subjunctive.')]
});
