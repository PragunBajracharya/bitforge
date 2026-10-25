/* ===== French C1 (NCLC 9+): advanced subjunctive, literary tenses, emphasis & inversion, registers, advanced hypothesis ===== */
FRT('fr-subj3', { name: 'Advanced subjunctive & mood choice', cat: 'frc1',
  blurb: `At C1 the subjunctive becomes a tool for nuance: after superlatives and “le seul / le premier”, in relative clauses expressing a wish or requirement, in concessive structures (quel que soit, où que, qui que), and in the passé. You should also recognize the imparfait du subjonctif in literature.`,
  facts: [['Superlative + qui/que', 'subjonctif (opinion)'], ['Relative of requirement', 'Je cherche quelqu’un qui sache…'], ['quel que soit', 'whatever'], ['Literary', 'qu’il fût, qu’il eût']],
  cheat: [['C’est le meilleur film que j’aie vu.', 'superlative'], ['C’est la seule personne qui puisse m’aider.', 'le seul / l’unique'], ['Je cherche un appartement qui soit proche du métro.', 'requirement (not yet found)'], ['Quelle que soit votre décision…', 'whatever your decision'], ['Où que tu ailles…', 'wherever you go'], ['Qui que vous soyez…', 'whoever you are'], ['Quoi qu’il arrive…', 'whatever happens'], ['si … que + subj.', 'Si difficile que ce soit… = however difficult'], ['Que + subj. (wish / order)', 'Qu’il entre ! / Vive le Québec !'], ['qu’il fût / qu’il eût fait', 'imparfait / PQP du subjonctif (recognize only)']],
  sections: [
    ['Relative clauses with the subjunctive', TBL(['Indicative (fact)', 'Subjunctive (requirement, doubt, subjective superlative)'], [[FR('J’ai trouvé un médecin qui parle espagnol.'), FR('Je cherche un médecin qui sache parler espagnol.') + ' (any doctor, not yet found)'], [FR('C’est la ville où j’ai vécu le plus longtemps.') + ' (fact)', FR('C’est la plus belle ville que je connaisse.') + ' (opinion)'], [FR('Il y a quelqu’un qui peut vous aider.'), FR('Y a-t-il quelqu’un qui puisse m’aider ?')]])],
    ['Concessive indefinites', FXS([['Quelles que soient les difficultés, nous réussirons.', 'Whatever the difficulties, we will succeed.'], ['Où que vous habitiez au Canada, vous avez droit aux soins de santé.', 'Wherever you live in Canada, you are entitled to health care.'], ['Si compétent qu’il soit, il ne peut pas tout faire seul.', 'However competent he may be, he can’t do everything alone.'], ['Quoi que vous fassiez, faites-le bien.', 'Whatever you do, do it well.']]) +
      PP(`Note: <b>quel que</b> (two words, agrees with the noun) vs <b>quelque</b> (some); <b>quoi que</b> (whatever) vs <b>quoique</b> (although).`)],
    ['Literary forms to recognize', PP(`Classic literature and formal texts use the imparfait and plus-que-parfait du subjonctif where modern French uses the présent and passé: ${FR('Il fallait qu’il partît.')} (= qu’il parte), ${FR('Bien qu’il eût terminé…')} (= qu’il ait terminé). You never need to produce them in the TEF or TCF, but you may meet them in reading texts.`)]
  ],
  edge: [`“Quelque soit” ✗ → ${FR('quel que soit')}.`, `Confusing ${FR('quoique')} (although) and ${FR('quoi que')} (whatever).`, `Using the subjunctive for a factual superlative where the indicative is expected: ${FR('C’est le plus grand pont qui existe au Canada')} is also acceptable; both moods occur.`],
  ex: [[`C’est le meilleur livre que j’___ lu. (avoir)`, `aie`, `It’s the best book I’ve ever read.`, 'superlative + subjonctif passé'],
    [`Je cherche un logement qui ___ abordable. (être)`, `soit`, `I’m looking for housing that is affordable.`, 'requirement'],
    [`___ que soit le résultat, je serai fier de toi.`, `quel`, `Whatever the result, I’ll be proud of you.`, 'quel agrees with résultat (m.)'],
    [`___ que soient vos raisons, vous devez prévenir.`, `quelles`, `Whatever your reasons, you must notify us.`, 'raisons (f. pl.)'],
    [`Où que tu ___ , appelle-moi. (aller)`, `ailles`, `Wherever you go, call me.`, ''],
    [`Quoi qu’il ___ , ne paniquez pas. (arriver)`, `arrive`, `Whatever happens, don’t panic.`, ''],
    [`C’est la seule personne qui ___ m’aider. (pouvoir)`, `puisse`, `It’s the only person who can help me.`, ''],
    [`Si difficile que ce ___ , je continuerai. (être)`, `soit`, `However difficult it is, I’ll continue.`, '']],
  qs: [SQ('“whatever the weather”', ['quelque soit le temps', 'quel que soit le temps', 'quoi que soit le temps', 'quelle que soit le temps'], 1, 'quel que + être, agreeing with temps (m.).'),
    SQ('“I need an assistant who knows Excel.” (none found yet)', ['…un assistant qui sait Excel.', '…un assistant qui sache utiliser Excel.', '…un assistant qui savait Excel.', '…un assistant que sache Excel.'], 1, 'A requirement → subjunctive.')]
});

FRT('fr-passe-simple', { name: 'Passé simple & literary narration', cat: 'frc1',
  blurb: `The passé simple replaces the passé composé in literature, history books and some journalism. You don’t need to use it in the TEF or TCF, but you must recognize it immediately when reading.`,
  facts: [['Used in', 'literature, history, formal narration'], ['-er endings', '-ai -as -a -âmes -âtes -èrent'], ['-ir/-re', '-is -is -it -îmes -îtes -irent'], ['Irregular', 'il fut, il eut, il fit, il vint']],
  cheat: [['il parla / ils parlèrent', 'parler'], ['il finit / ils finirent', 'finir'], ['il vendit / ils vendirent', 'vendre'], ['il fut / ils furent', 'être'], ['il eut / ils eurent', 'avoir'], ['il fit / ils firent', 'faire'], ['il alla / ils allèrent', 'aller'], ['il vint / ils vinrent', 'venir'], ['il prit / ils prirent', 'prendre'], ['il dut / il put / il sut / il voulut', 'devoir / pouvoir / savoir / vouloir'], ['il naquit / il mourut', 'naître / mourir']],
  sections: [
    ['Recognition', PP(`Most third-person forms look like the past participle plus -t or with -a: ${FR('Il prit son manteau et sortit.')} (He took his coat and went out.) ${FR('Champlain fonda Québec en 1608.')} ${FR('Ils arrivèrent à l’aube.')} Combined with the imparfait for background: ${FR('Il faisait nuit quand le train s’arrêta.')}`)],
    ['Passé antérieur', PP(`In literary narration, an action just before a passé simple uses the passé antérieur (passé simple of avoir/être + participle): ${FR('Dès qu’il eut fini, il partit.')} Recognize it; in your own writing use ${FR('Dès qu’il a eu fini')} or simply ${FR('Après avoir fini, il est parti.')}`)]
  ],
  edge: [`Confusing ${FR('il fit')} (faire) with ${FR('il fut')} (être).`, `Confusing ${FR('il finit')} (passé simple) with the present (same spelling for -ir verbs; context decides).`, `Using the passé simple in a letter or a speaking test: it sounds old-fashioned.`],
  ex: [[`Champlain ___ Québec en 1608. (fonder, passé simple)`, `fonda`, `Champlain founded Quebec City in 1608.`, ''],
    [`Ils ___ à l’aube. (arriver, passé simple)`, `arrivèrent`, `They arrived at dawn.`, ''],
    [`« Il fut très surpris. » → passé composé : il ___ très surpris.`, `a été`, '', ''],
    [`« Elle prit le train. » → passé composé : elle ___ le train.`, `a pris`, '', ''],
    [`« Ils firent la guerre. » → infinitive: ___`, `faire`, '', ''],
    [`« Elle naquit à Gaspé. » → infinitive: ___`, `naître`, '', ''],
    [`« Ils vinrent nous voir. » → infinitive: ___`, `venir`, '', ''],
    [`« Il eut peur. » → passé composé : il ___ peur.`, `a eu`, '', '']],
  qs: [SQ('“il fit” comes from…', ['être', 'faire', 'finir', 'falloir'], 1, 'faire → il fit.'),
    SQ('Where will you most often meet the passé simple?', ['Text messages', 'Novels and history texts', 'Job interviews', 'Phone calls'], 1, 'It is a written narrative tense.')]
});

FRT('fr-emphasis', { name: 'Emphasis, inversion & sentence style', cat: 'frc1',
  blurb: `C1 speakers control focus and rhythm: c’est … qui / que to highlight, ce qui … c’est to frame an idea, dislocation in speech, stylistic inversion after certain adverbs, and the ne explétif in formal writing.`,
  facts: [['Highlight', 'c’est … qui / que'], ['Frame', 'ce qui / ce que …, c’est …'], ['Inversion', 'peut-être, aussi, sans doute + verb-subject'], ['ne explétif', 'avant qu’il ne parte']],
  cheat: [['C’est Marie qui a trouvé la solution.', 'highlight the subject'], ['C’est à Québec que nous nous sommes rencontrés.', 'highlight a place'], ['Ce qui m’inquiète, c’est le coût.', 'frame (subject)'], ['Ce que je retiens, c’est que…', 'frame (object)'], ['Le français, je l’adore.', 'dislocation (speech)'], ['Peut-être viendra-t-il.', 'inversion after peut-être'], ['Aussi avons-nous décidé de…', 'aussi = therefore (+ inversion)'], ['Sans doute a-t-il raison.', 'inversion'], ['Je crains qu’il ne soit trop tard.', 'ne explétif'], ['Il est plus compétent que je ne le pensais.', 'ne explétif after comparison']],
  sections: [
    ['Highlighting', FXS([['C’est grâce à mon employeur que j’ai pu immigrer.', 'It’s thanks to my employer that I was able to immigrate.'], ['Ce qui fait la force de cette ville, c’est sa diversité.', 'What makes this city strong is its diversity.'], ['Ce dont nous avons besoin, c’est d’un plan clair.', 'What we need is a clear plan.'], ['Le problème, c’est le manque de logements.', 'The problem is the lack of housing.']])],
    ['Stylistic inversion', PP(`After <b>peut-être, sans doute, aussi (= therefore), ainsi, à peine, du moins, encore</b> at the start of a sentence, formal French inverts subject and verb: ${FR('Ainsi le gouvernement a-t-il annoncé de nouvelles mesures.')} In speech you can avoid it: ${FR('Peut-être qu’il viendra.')}`)],
    ['Ne explétif', PP(`A “ne” without negative meaning after <b>avant que, à moins que, de peur que, craindre que, empêcher que</b> and comparisons of inequality: ${FR('Partez avant qu’il ne soit trop tard.')} ${FR('C’est plus facile que je ne le croyais.')} It is optional, formal, and never adds “pas”.`)]
  ],
  edge: [`“C’est moi qui a raison” ✗ → ${FR('C’est moi qui ai raison')} (agree with moi).`, `Inversion after “aussi” meaning “also” ✗: only when aussi = therefore at the start.`, `Reading ne explétif as negation.`],
  ex: [[`C’est moi qui ___ raison. (avoir)`, `ai`, `I’m the one who’s right.`, 'agrees with moi'],
    [`C’est ___ Montréal que je travaille.`, `à`, `It’s in Montreal that I work.`, ''],
    [`___ m’intéresse, c’est l’histoire du Québec.`, `ce qui`, `What interests me is Quebec history.`, ''],
    [`___ je retiens, c’est votre motivation.`, `ce que`, `What I remember is your motivation.`, ''],
    [`Peut-être ___ -il en retard. (être, future)`, `sera`, `Perhaps he’ll be late.`, 'inversion'],
    [`Sans doute ___-elle raison.`, `a-t|a t`, `She’s probably right.`, 'a-t-elle'],
    [`Je crains qu’il ___ soit trop tard.`, `ne`, `I fear it may be too late.`, 'ne explétif'],
    [`C’est plus difficile que je ___ le pensais.`, `ne`, `It’s harder than I thought.`, 'ne explétif after comparison']],
  qs: [SQ('Which sentence highlights the place?', ['Nous nous sommes rencontrés à Ottawa.', 'C’est à Ottawa que nous nous sommes rencontrés.', 'Ottawa, nous nous sommes rencontrés.', 'À Ottawa nous rencontrés.'], 1, 'c’est … que.'),
    SQ('“Je crains qu’il ne pleuve” means…', ['I’m afraid it won’t rain.', 'I’m afraid it will rain.', 'I don’t fear rain.', 'It never rains.'], 1, 'ne explétif is not negative.')]
});

FRT('fr-register', { name: 'Registers, nuance & idiomatic French', cat: 'frc1',
  blurb: `NCLC 9 requires adapting your language to the situation: familier with friends, courant at work, soutenu in formal writing. Learn register equivalents, precise verbs that replace vague ones, hedging, and idioms that sound natural without being slang.`,
  facts: [['Familier', 'friends, texts'], ['Courant', 'work, most situations'], ['Soutenu', 'formal writing, speeches'], ['Exam target', 'courant to soutenu']],
  cheat: [['bosser → travailler → exercer une activité', 'work'], ['bouffer → manger → se restaurer', 'eat'], ['un truc → une chose → un élément', 'thing'], ['c’est sympa → c’est agréable → c’est appréciable', 'nice'], ['ça marche pas → cela ne fonctionne pas', 'it doesn’t work'], ['faire → effectuer, réaliser, mener', 'do / carry out'], ['dire → affirmer, souligner, préciser, déclarer', 'say'], ['avoir → disposer de, bénéficier de, posséder', 'have'], ['montrer → démontrer, révéler, illustrer', 'show'], ['Hedging', 'il semblerait que, dans une certaine mesure, a priori, à première vue']],
  sections: [
    ['Register in practice', TBL(['Familier', 'Courant', 'Soutenu'], [[FR('J’ai pas le temps.'), FR('Je n’ai pas le temps.'), FR('Je ne dispose pas du temps nécessaire.')], [FR('T’inquiète !'), FR('Ne t’inquiète pas.'), FR('Soyez sans crainte.')], [FR('C’est galère.'), FR('C’est compliqué.'), FR('Cela s’avère complexe.')], [FR('On y va ?'), FR('Nous y allons ?'), FR('Pouvons-nous nous mettre en route ?')]])],
    ['Precise vocabulary (score booster)', FXS([['Cette mesure a permis de réduire considérablement le chômage.', 'This measure significantly reduced unemployment.'], ['Les chiffres révèlent une hausse marquée des loyers.', 'The figures reveal a marked rise in rents.'], ['Il convient de souligner que…', 'It should be stressed that…'], ['Cette question suscite de vifs débats.', 'This issue sparks heated debate.'], ['Il s’agit d’un enjeu majeur pour les nouveaux arrivants.', 'It is a major issue for newcomers.']])],
    ['Idioms that are safe in any register', TBL(['Expression', 'Meaning'], [[FR('avoir du pain sur la planche'), 'to have a lot of work ahead'], [FR('mettre la main à la pâte'), 'to pitch in'], [FR('tomber à pic'), 'to come at just the right time'], [FR('poser un lapin à quelqu’un'), 'to stand someone up'], [FR('prendre son courage à deux mains'), 'to summon one’s courage'], [FR('ce n’est pas la mer à boire'), 'it’s not that hard'], [FR('jouer un rôle clé'), 'to play a key role'], [FR('à long terme / à court terme'), 'in the long / short term'], [FR('faire d’une pierre deux coups'), 'to kill two birds with one stone'], [FR('il faut battre le fer tant qu’il est chaud'), 'strike while the iron is hot']])]
  ],
  edge: [`Mixing registers in one text (a soutenu letter with “super” or “truc”).`, `Overusing idioms: one or two per text is enough.`, `“Ça” in formal writing → ${FR('cela')}.`, `Dropping “ne” in writing.`],
  ex: [[`Familier → courant : « J’ai pas compris. » → Je ___ ai pas compris.`, `n’|n'`, '', ''],
    [`Plus précis : faire une enquête → ___ une enquête`, `mener|réaliser|effectuer`, '', ''],
    [`Plus précis : dire que… → ___ que… (stress)`, `souligner`, '', ''],
    [`Plus précis : avoir des avantages → ___ d’avantages`, `bénéficier`, '', ''],
    [`Écrit soutenu : « ça » → ___`, `cela`, '', ''],
    [`J’ai du pain sur la ___ cette semaine.`, `planche`, `I have a lot of work this week.`, ''],
    [`Ton appel tombe à ___ !`, `pic`, `Your call comes at just the right time!`, ''],
    [`Il ___ de souligner l’importance de ce projet. (it is appropriate)`, `convient`, '', 'il convient de']],
  qs: [SQ('Most formal equivalent of “C’est galère”:', ['C’est nul.', 'C’est compliqué.', 'Cela s’avère complexe.', 'C’est pas facile.'], 2, 'soutenu register.'),
    SQ('A precise verb for “faire des recherches”:', ['bosser', 'mener des recherches', 'avoir des recherches', 'donner des recherches'], 1, 'mener / effectuer des recherches.')]
});

FRT('fr-hypothesis', { name: 'Advanced hypothesis & condition', cat: 'frc1',
  blurb: `Beyond si: au cas où, à condition que, pourvu que, à supposer que, pour peu que, quand bien même, faute de, sans. These let you build precise, nuanced conditions in essays and debates.`,
  facts: [['+ conditionnel', 'au cas où, quand bien même'], ['+ subjonctif', 'à condition que, pourvu que, à supposer que, pour peu que'], ['+ infinitif', 'à condition de, à moins de'], ['+ nom', 'en cas de, faute de, sans, avec']],
  cheat: [['au cas où + conditionnel', 'in case: au cas où il pleuvrait'], ['en cas de + nom', 'in case of: en cas d’urgence'], ['à condition que + subj. / de + inf.', 'provided that'], ['pourvu que + subj.', 'provided that / let’s hope that'], ['à supposer que / en admettant que + subj.', 'assuming that'], ['pour peu que + subj.', 'if only, as long as'], ['quand bien même + conditionnel', 'even if'], ['à moins que + subj. / à moins de + inf.', 'unless'], ['faute de + nom', 'for lack of'], ['sans + nom', 'without (= if there had not been)'], ['Avec un peu de chance, …', 'With a bit of luck, …']],
  sections: [
    ['Examples', FXS([['Prenez un parapluie au cas où il pleuvrait.', 'Take an umbrella in case it rains.'], ['En cas de retard, prévenez la réception.', 'In case of delay, notify reception.'], ['J’accepterai le poste à condition que le télétravail soit possible.', 'I’ll accept the job provided remote work is possible.'], ['À supposer que les prix baissent, achèterez-vous une maison ?', 'Assuming prices fall, will you buy a house?'], ['Quand bien même il me le demanderait, je refuserais.', 'Even if he asked me, I would refuse.'], ['Faute de temps, nous avons reporté la réunion.', 'For lack of time, we postponed the meeting.'], ['Sans votre aide, je n’aurais jamais réussi.', 'Without your help, I would never have succeeded.']])],
    ['Choosing the right structure', PP(`Same subject → use the infinitive form when it exists: ${FR('Vous pouvez partir à condition de finir votre travail.')} Different subject → subjunctive: ${FR('Vous pouvez partir à condition que tout soit terminé.')}`)]
  ],
  edge: [`“Au cas où + subjonctif” ✗ → conditionnel.`, `“Quand bien même + indicatif” ✗ → conditionnel.`, `“Faute d’avoir du temps” is heavy: ${FR('faute de temps')}.`],
  ex: [[`Prends ta carte au cas où tu en ___ besoin. (avoir)`, `aurais`, `Take your card in case you need it.`, 'au cas où + conditionnel'],
    [`Je viendrai à condition que tu ___ là. (être)`, `sois`, `I’ll come provided you are there.`, ''],
    [`___ d’urgence, composez le 911.`, `en cas`, `In case of emergency, dial 911.`, ''],
    [`Quand bien même il ___ , je ne changerais pas d’avis. (insister)`, `insisterait`, `Even if he insisted, I wouldn’t change my mind.`, ''],
    [`___ de moyens, le projet a été abandonné.`, `faute`, `For lack of means, the project was abandoned.`, ''],
    [`Nous partirons demain, à moins qu’il ne ___ . (neiger)`, `neige`, `We’ll leave tomorrow unless it snows.`, ''],
    [`Pourvu qu’il ___ beau samedi ! (faire)`, `fasse`, `Let’s hope the weather is nice on Saturday!`, ''],
    [`À supposer que vous ___ raison, que proposez-vous ? (avoir)`, `ayez`, `Assuming you are right, what do you propose?`, '']],
  qs: [SQ('“in case he calls”', ['au cas où il appelle', 'au cas où il appellerait', 'au cas où il appelât', 'en cas il appelle'], 1, 'au cas où + conditionnel.'),
    SQ('“provided that you finish” (same subject)', ['à condition que tu finisses', 'à condition de finir', 'à condition finir', 'pourvu de finir'], 1, 'Same subject → à condition de + infinitive.')]
});
