/* ===== French A1: sounds, greetings, nouns, être/avoir, -er verbs, negation & questions, adjectives, possessives, numbers & time, aller ===== */
FRT('fr-sounds', { name: 'Sounds, spelling & the alphabet', cat: 'fra1',
  blurb: `French spelling looks hard until you learn about twenty sound rules. This lesson covers the vowels English doesn’t have, nasal vowels, silent final letters, accents, liaison and elision, so you can read any word aloud and understand what you hear.`,
  facts: [['Silent letters', 'most final consonants'], ['Nasal vowels', '4 (an, in, on, un)'], ['Accents', 'é è ê à ç ë'], ['Rhythm', 'stress on the last syllable']],
  cheat: [['é', 'ay, closed: été, café'], ['è / ê / ai', 'eh, open: mère, fête, mais'], ['u', 'say “ee” with rounded lips: tu, rue'], ['ou', 'oo: vous, rouge'], ['oi', 'wa: moi, trois'], ['au / eau', 'oh: chaud, beau'], ['eu / œu', 'like “uh” with rounded lips: deux, sœur'], ['an / en', 'nasal “ahn”: enfant, temps'], ['in / ain / un', 'nasal “ahn” (front): vin, pain, un'], ['on', 'nasal “ohn”: bon, nom'], ['ch', 'sh: chat'], ['gn', 'ny: montagne'], ['qu', 'k: qui, quatre'], ['h', 'always silent: hôtel']],
  sections: [
    ['Silent final letters', PP(`Most final consonants are silent: ${FR('petit')}, ${FR('grand')}, ${FR('vous')}, ${FR('les')}. The letters in <b>CaReFuL</b> (c, r, f, l) are usually pronounced: ${FR('avec')}, ${FR('bonjour')}, ${FR('neuf')}, ${FR('avril')}. Exception: <b>-er</b> at the end of verbs and many nouns sounds like é: ${FR('parler')}, ${FR('premier')}. A final <b>-e</b> without an accent is silent but makes the consonant before it heard: ${FR('petit')} vs ${FR('petite')}.`)],
    ['Accents change the sound', TBL(['Accent', 'Example', 'Effect'], [['aigu (é)', FR('été'), 'closed “ay”'], ['grave (è, à, ù)', FR('mère') + ', ' + FR('là'), 'open “eh” on e; on a/u only distinguishes words (a/à, ou/où)'], ['circonflexe (â ê î ô û)', FR('fête') + ', ' + FR('hôpital'), 'often marks a lost s (forest → forêt)'], ['cédille (ç)', FR('français'), 'c sounds like s before a, o, u'], ['tréma (ë ï)', FR('Noël') + ', ' + FR('naïf'), 'pronounce the two vowels separately']])],
    ['Liaison and elision', PP(`<b>Liaison:</b> a silent final consonant is pronounced when the next word starts with a vowel or silent h, inside a tight group: ${FR('les amis')} (lé-z-ami), ${FR('vous avez')}, ${FR('un enfant')}. Never after <i>et</i>: ${FR('un garçon et une fille')}.`) +
      PP(`<b>Elision:</b> short words drop their vowel before a vowel: je → j’, le/la → l’, ne → n’, de → d’, que → qu’, si → s’ (only before il/ils). ${FR('j’aime')}, ${FR('l’hôtel')}, ${FR('je n’ai pas')}, ${FR('s’il vous plaît')}.`)],
    ['Rhythm and Canadian pronunciation', PP(`French stresses the last syllable of a word group, and syllables are even: ${FR('Je voudrais un café, s’il vous plaît.')} In Canadian French you will hear <b>t</b> and <b>d</b> before i/u pronounced “ts/dz” (${FR('tu dis', 'tu dis')}), long vowels in stressed syllables, and “wè” for oi in some words (moé for moi, informally). The TEF Canada listening test includes Canadian voices, so practise with both settings of the voice switch.`)]
  ],
  edge: [`Pronouncing the final -s of plurals: ${FR('les livres')} sounds the same as ${FR('le livre')} except for the article.`, `Pronouncing the h: ${FR('l’hôpital')}, not “hôpital” with an English h.`, `Mixing u (tu) and ou (tout): they distinguish words: ${FR('dessus')} (on top) vs ${FR('dessous')} (underneath).`, `Saying -ent at the end of verbs: ${FR('ils parlent')} sounds like ${FR('il parle')}.`],
  ex: [[`Elision: ___ aime le café. (je)`, `j’|j'`, `I like coffee.`, `je becomes j’ before a vowel`],
    [`Elision: ___ hôtel est grand. (le)`, `l’|l'`, `The hotel is big.`, `h is silent, so le → l’`],
    [`Je ___ ai pas le temps. (ne)`, `n’|n'`, `I don’t have time.`, `ne → n’ before a vowel`],
    [`C’est ___ ami de Paul. (un/une)`, `un`, `He’s a friend of Paul’s. (liaison: un‿ami)`, `ami is masculine; liaison makes the n heard`],
    [`Il est ___ heures. (trois)`, `trois`, `It’s three o’clock (troi-z-heures).`, ''],
    [`Le garçon s’appelle Fran___ois. (c with cedilla)`, `ç`, `ç sounds like s before o`, ''],
    [`J’habite à ___ (Montreal in French)`, `Montréal`, `I live in Montreal.`, `é with an acute accent`],
    [`On dit « s’il vous ___ » pour être poli.`, `plaît`, `please`, `plaît keeps its circumflex`]],
  qs: [SQ('Which final letter is usually pronounced?', ['-s in “vous”', '-t in “petit”', '-c in “avec”', '-d in “grand”'], 2, 'Remember CaReFuL: c, r, f, l are usually pronounced at the end.'),
    SQ('How is “les amis” pronounced?', ['lé ami', 'lé-z-ami', 'lèss ami', 'le ami'], 1, 'Liaison: the s of les is pronounced as z before a vowel.')]
});

FRT('fr-greetings', { name: 'Greetings, introductions & politeness', cat: 'fra1',
  blurb: `Say hello and goodbye, introduce yourself, ask how someone is, and choose correctly between tu and vous. These are the first sentences of every speaking test and every real conversation in Canada.`,
  facts: [['Formal you', 'vous'], ['Informal you', 'tu'], ['Default with strangers', 'vous'], ['Quebec bonus', '“Bonjour-Hi”, “Bienvenue”']],
  cheat: [['Bonjour / Bonsoir', 'Hello / Good evening'], ['Salut', 'Hi / Bye (informal)'], ['Au revoir / À bientôt / À demain', 'Goodbye / See you soon / See you tomorrow'], ['Comment allez-vous ? / Ça va ?', 'How are you? (formal / informal)'], ['Je m’appelle…', 'My name is…'], ['Enchanté(e)', 'Nice to meet you'], ['Je viens de… / J’habite à…', 'I come from… / I live in…'], ['Merci / Je vous en prie / De rien', 'Thank you / You’re welcome (formal / informal)'], ['Bienvenue', 'You’re welcome (Québec) / Welcome'], ['Excusez-moi / Pardon', 'Excuse me / Sorry'], ['S’il vous plaît / S’il te plaît', 'Please (formal / informal)']],
  sections: [
    ['Tu or vous?', PP(`Use <b>vous</b> with strangers, customers, older people, officials, interviewers and anyone in a formal setting, and always when speaking to more than one person. Use <b>tu</b> with friends, family, children and colleagues who use tu with you. In Quebec, tu is more common than in France, even at work, but in the TEF/TCF speaking tests use <b>vous</b> with the examiner unless told otherwise.`)],
    ['Introducing yourself', FXS([['Bonjour, je m’appelle Priya. Je suis ingénieure.', 'Hello, my name is Priya. I’m an engineer.'], ['Je viens de l’Inde, mais j’habite à Toronto depuis deux ans.', 'I’m from India, but I’ve lived in Toronto for two years.'], ['Je parle anglais, hindi et un peu de français.', 'I speak English, Hindi and a little French.'], ['J’apprends le français pour immigrer au Québec.', 'I’m learning French to immigrate to Quebec.']])],
    ['Asking and answering', FXS([['Comment vous appelez-vous ?', 'What is your name? (formal)'], ['Tu t’appelles comment ?', 'What’s your name? (informal)'], ['Comment allez-vous ? — Très bien, merci. Et vous ?', 'How are you? — Very well, thanks. And you?'], ['Ça va ? — Ça va bien, et toi ?', 'How’s it going? — Fine, and you?'], ['Vous êtes d’où ? — Je suis de Lagos.', 'Where are you from? — I’m from Lagos.'], ['Qu’est-ce que vous faites dans la vie ?', 'What do you do for a living?']])]
  ],
  edge: [`Saying “Bonjour” in the evening: switch to ${FR('Bonsoir')} after about 6 p.m.`, `Using “Salut” with a stranger or an examiner: it is informal.`, `“Je suis 25 ans” is wrong: age uses avoir → ${FR('J’ai 25 ans.')}`, `“Enchanté” agrees: a woman writes ${FR('Enchantée')} (same pronunciation).`],
  ex: [[`Bonjour, je m’___ Ana. (s’appeler)`, `appelle`, `My name is Ana.`, ''],
    [`J’___ 30 ans.`, `ai`, `I am 30 years old.`, `age uses avoir`],
    [`Comment ___-vous ? (aller)`, `allez`, `How are you?`, ''],
    [`Je ___ de Manille. (venir)`, `viens`, `I come from Manila.`, ''],
    [`J’habite ___ Vancouver.`, `à`, `I live in Vancouver.`, `à + city`],
    [`Merci beaucoup ! — Je vous en ___.`, `prie`, `You’re welcome.`, ''],
    [`Excusez-___, où est la gare ?`, `moi`, `Excuse me, where is the station?`, ''],
    [`À ___ ! (see you tomorrow)`, `demain`, '', '']],
  qs: [SQ('You meet the immigration officer for the first time. You say:', ['Salut, ça va ?', 'Bonjour, comment allez-vous ?', 'Coucou !', 'Ça roule ?'], 1, 'Formal situation: bonjour and vous.'),
    SQ('How do you say your age?', ['Je suis 30 ans.', 'J’ai 30 ans.', 'Je fais 30 ans.', 'J’ai 30.'], 1, 'French uses avoir for age and keeps “ans”.')]
});

FRT('fr-nouns', { name: 'Gender, articles & plurals', cat: 'fra1',
  blurb: `Every French noun is masculine or feminine, and the article in front of it shows which. Learn nouns with their article, the endings that predict gender, the three kinds of articles, and how plurals work.`,
  facts: [['Genders', 'masculine, feminine'], ['Definite', 'le, la, l’, les'], ['Indefinite', 'un, une, des'], ['Plural', 'usually + s (silent)']],
  cheat: [['le / la / l’ / les', 'the'], ['un / une / des', 'a, an / some'], ['Masculine endings', '-age, -ment, -eau, -isme, -oir, -et: le fromage, le gouvernement'], ['Feminine endings', '-tion, -sion, -té, -ure, -ette, -ence/-ance: la nation, la liberté'], ['Plural -s', 'le livre → les livres'], ['-eau, -eu → -x', 'le bateau → les bateaux, le jeu → les jeux'], ['-al → -aux', 'le journal → les journaux'], ['Unchanged -s, -x, -z', 'le pays → les pays, le prix → les prix']],
  sections: [
    ['Definite and indefinite articles', TBL(['', 'Masculine', 'Feminine', 'Plural'], [['the', FR('le livre'), FR('la table'), FR('les livres, les tables')], ['before a vowel/h', FR('l’hôtel'), FR('l’école'), FR('les‿écoles')], ['a / some', FR('un livre'), FR('une table'), FR('des livres')]]) +
      PP(`Use the <b>definite</b> article for specific things and for general categories, especially after aimer, adorer, détester, préférer: ${FR('J’aime le café.')} (I like coffee in general). Use the <b>indefinite</b> article for one unspecified thing: ${FR('Je bois un café.')}`)],
    ['Predicting gender', PP(`Learn every noun with its article. Endings help a lot: <b>-tion</b>, <b>-té</b>, <b>-ure</b>, <b>-ence</b> are almost always feminine (${FR('la situation')}, ${FR('la société')}, ${FR('la voiture')}, ${FR('la différence')}); <b>-age</b>, <b>-ment</b>, <b>-eau</b>, <b>-isme</b> are almost always masculine (${FR('le voyage')}, ${FR('le logement')}, ${FR('le bureau')}, ${FR('le tourisme')}). Exceptions to know: ${FR('la page')}, ${FR('la plage')}, ${FR('l’image')} (f.), ${FR('l’eau')} (f.), ${FR('la peau')}.`)],
    ['People and professions', PP(`Many nouns for people have a feminine form: ${FR('un étudiant / une étudiante')}, ${FR('un infirmier / une infirmière')}, ${FR('un acteur / une actrice')}, ${FR('un ingénieur / une ingénieure')}. In Canada feminine job titles are standard (${FR('une ingénieure')}, ${FR('une professeure')}, ${FR('une auteure')}). After être, professions take no article: ${FR('Elle est médecin.')} but ${FR('C’est une bonne médecin.')}`)]
  ],
  edge: [`Using “la” before a vowel: ${FR('l’école')}, not “la école”.`, `Adding an article after être + profession: ${FR('Je suis comptable.')}`, `Forgetting that “des” becomes “de” before an adjective in careful style: ${FR('de grandes maisons')}.`, `Assuming gender follows meaning: ${FR('la personne')} is feminine even for a man.`],
  ex: [[`___ voiture de Marc est rouge. (the)`, `la`, `Marc’s car is red.`, `voiture ends in -ure: feminine`],
    [`J’ai ___ appartement à Ottawa. (a)`, `un`, `I have an apartment in Ottawa.`, `appartement ends in -ment: masculine`],
    [`___ école est fermée. (the)`, `l’|l'`, `The school is closed.`, `elision before a vowel`],
    [`J’adore ___ musique. (the)`, `la`, `I love music.`, `general category after adorer → definite article`],
    [`Il y a ___ enfants dans le parc. (some)`, `des`, `There are children in the park.`, ''],
    [`un journal → des ___`, `journaux`, '', `-al → -aux`],
    [`un gâteau → des ___`, `gâteaux`, '', `-eau → -eaux`],
    [`Elle est ___ . (nurse, feminine)`, `infirmière`, `She is a nurse.`, `no article after être + profession`]],
  qs: [SQ('Which noun is feminine?', ['logement', 'fromage', 'liberté', 'bureau'], 2, '-té is a feminine ending.'),
    SQ('“I like tea” in French:', ['J’aime du thé.', 'J’aime le thé.', 'J’aime un thé.', 'J’aime thé.'], 1, 'Likes and dislikes take the definite article.')]
});

FRT('fr-etre-avoir', { name: 'Être, avoir & c’est vs il est', cat: 'fra1',
  blurb: `The two most important verbs: être (to be) and avoir (to have). They are irregular, they build the compound tenses, and avoir appears in many expressions where English uses “to be”.`,
  facts: [['être', 'suis, es, est, sommes, êtes, sont'], ['avoir', 'ai, as, a, avons, avez, ont'], ['Il y a', 'there is / there are'], ['Age', 'avoir … ans']],
  cheat: [['je suis / j’ai', 'I am / I have'], ['tu es / tu as', 'you are / you have'], ['il, elle, on est / a', 'he, she, one is / has'], ['nous sommes / avons', 'we are / have'], ['vous êtes / avez', 'you are / have'], ['ils, elles sont / ont', 'they are / have'], ['avoir faim / soif / chaud / froid', 'to be hungry / thirsty / hot / cold'], ['avoir peur / raison / tort / besoin de', 'to be afraid / right / wrong / to need'], ['avoir envie de', 'to feel like'], ['il y a', 'there is / are; also “ago”: il y a deux ans']],
  sections: [
    ['Conjugations', TBL(['', 'être (to be)', 'avoir (to have)'], [['je', FR('je suis'), FR('j’ai')], ['tu', FR('tu es'), FR('tu as')], ['il / elle / on', FR('il est'), FR('il a')], ['nous', FR('nous sommes'), FR('nous avons')], ['vous', FR('vous êtes'), FR('vous avez')], ['ils / elles', FR('ils sont'), FR('ils ont')]]) +
      PP(`<b>On</b> means “one / people / we” and is extremely common in speech: ${FR('On est en retard !')} (We’re late!). It always takes the il/elle form.`)],
    ['Expressions with avoir', FXS([['J’ai faim, on mange ?', 'I’m hungry, shall we eat?'], ['Tu as raison.', 'You’re right.'], ['Nous avons besoin d’un permis de travail.', 'We need a work permit.'], ['Elle a peur des chiens.', 'She’s afraid of dogs.'], ['Il y a un problème.', 'There is a problem.'], ['Je suis arrivé il y a trois mois.', 'I arrived three months ago.']])],
    ['C’est or il est?', TBL(['Use', 'When', 'Example'], [['c’est + determiner + noun', 'identifying someone/something', FR('C’est un médecin.') + ' ' + FR('C’est ma sœur.')], ['il/elle est + adjective or profession', 'describing a known person', FR('Il est médecin.') + ' ' + FR('Elle est sympa.')], ['c’est + adjective', 'commenting on a situation', FR('C’est difficile.') + ' ' + FR('C’est génial !')], ['c’est + name / stressed pronoun', 'identifying', FR('C’est Marie.') + ' ' + FR('C’est moi.')]])]
  ],
  edge: [`“Je suis faim” ✗ → ${FR('J’ai faim.')}`, `“Il est un médecin” ✗ → ${FR('Il est médecin')} or ${FR('C’est un médecin')}.`, `Forgetting elision: ${FR('j’ai')}, never “je ai”.`, `“Il y a” for ago goes before the time: ${FR('il y a deux ans')}.`],
  ex: [[`Nous ___ canadiens. (être)`, `sommes`, `We are Canadian.`, ''],
    [`Vous ___ une voiture ? (avoir)`, `avez`, `Do you have a car?`, ''],
    [`Ils ___ en vacances. (être)`, `sont`, `They are on vacation.`, ''],
    [`Tu ___ soif ? (avoir)`, `as`, `Are you thirsty?`, `avoir soif`],
    [`Elle ___ 42 ans. (avoir)`, `a`, `She is 42.`, ''],
    [`___ un excellent restaurant. (it’s)`, `c’est|c'est`, `It’s an excellent restaurant.`, `c’est + determiner + noun`],
    [`Mon frère ? ___ informaticien. (he is)`, `il est`, `My brother? He’s a computer scientist.`, `il est + profession, no article`],
    [`Il ___ beaucoup de neige à Québec. (there is)`, `y a`, `There is a lot of snow in Quebec City.`, `il y a`]],
  qs: [SQ('“I’m cold” is…', ['Je suis froid.', 'J’ai froid.', 'Il fait froid.', 'Je fais froid.'], 1, 'Physical sensations use avoir. (Il fait froid = the weather is cold.)'),
    SQ('Choose the correct sentence.', ['Il est un avocat.', 'C’est avocat.', 'Il est avocat.', 'Il a avocat.'], 2, 'il est + profession without an article, or c’est un avocat.')]
});

FRT('fr-present-er', { name: 'Present tense: -er verbs', cat: 'fra1',
  blurb: `About 90% of French verbs end in -er and follow one pattern. Learn the endings, the pronunciation trick (four forms sound the same), and the small spelling changes in verbs like manger, commencer, acheter and appeler.`,
  facts: [['Share of verbs', '≈ 90%'], ['Endings', '-e -es -e -ons -ez -ent'], ['Same sound', 'je, tu, il, ils forms'], ['Meaning', 'I speak / I am speaking / I do speak']],
  cheat: [['je parle', 'I speak'], ['tu parles', 'you speak'], ['il/elle/on parle', 'he/she/one speaks'], ['nous parlons', 'we speak'], ['vous parlez', 'you speak'], ['ils/elles parlent', 'they speak (-ent is silent)'], ['manger → nous mangeons', 'keep the soft g'], ['commencer → nous commençons', 'keep the soft c'], ['acheter → j’achète', 'è in the je, tu, il, ils forms'], ['appeler → j’appelle', 'double l in the je, tu, il, ils forms'], ['depuis + present', 'J’habite ici depuis 2022 = I have lived here since 2022']],
  sections: [
    ['The pattern', PP(`Remove -er and add the endings: <b>-e, -es, -e, -ons, -ez, -ent</b>. ${FR('je travaille')}, ${FR('tu travailles')}, ${FR('elle travaille')}, ${FR('nous travaillons')}, ${FR('vous travaillez')}, ${FR('ils travaillent')}. The French present covers English “I work”, “I am working” and “I do work”; to stress “right now” use ${FR('être en train de')}: ${FR('Je suis en train de travailler.')}`)],
    ['Useful -er verbs', TBL(['Verb', 'Meaning', 'Example'], [[FR('habiter'), 'to live', FR('J’habite à Calgary.')], [FR('travailler'), 'to work', FR('Il travaille dans une banque.')], [FR('étudier'), 'to study', FR('Nous étudions le français.')], [FR('aimer'), 'to like, love', FR('Tu aimes le hockey ?')], [FR('chercher'), 'to look for', FR('Je cherche un logement.')], [FR('parler'), 'to speak', FR('Vous parlez anglais ?')], [FR('payer'), 'to pay', FR('Je paie le loyer le premier du mois.')], [FR('commencer'), 'to start', FR('Le cours commence à 9 h.')]])],
    ['Depuis + present', PP(`For an action that started in the past and continues now, French uses the <b>present</b> with depuis, where English uses the present perfect: ${FR('J’apprends le français depuis six mois.')} (I have been learning French for six months.) ${FR('Depuis quand habitez-vous au Canada ?')}`)],
    ['Practise the forms', PP(`Open the <b>Conjugation lab</b> in this unit’s Learn step to see any verb in any tense and drill the present.`)]
  ],
  edge: [`Pronouncing -ent: ${FR('ils parlent')} = “il parl”.`, `“Je suis habiter” ✗: no être before a verb → ${FR('J’habite')}.`, `Using the past with depuis: “J’ai habité ici depuis 2 ans” ✗ → ${FR('J’habite ici depuis deux ans.')}`, `Forgetting nous mangeons / commençons.`],
  ex: [[`Je ___ dans un hôpital. (travailler)`, `travaille`, `I work in a hospital.`, ''],
    [`Nous ___ le français. (étudier)`, `étudions`, `We study French.`, ''],
    [`Vous ___ à Montréal ? (habiter)`, `habitez`, `Do you live in Montreal?`, ''],
    [`Ils ___ un appartement. (chercher)`, `cherchent`, `They are looking for an apartment.`, `-ent is silent`],
    [`Nous ___ à 18 h. (manger)`, `mangeons`, `We eat at 6 p.m.`, `keep the e for the soft g`],
    [`Tu ___ des légumes au marché. (acheter)`, `achètes`, `You buy vegetables at the market.`, `è in the tu form`],
    [`Je m’___ Karim. (appeler)`, `appelle`, `My name is Karim.`, `double l`],
    [`J’habite ici ___ trois ans. (for/since)`, `depuis`, `I’ve lived here for three years.`, `depuis + present`]],
  qs: [SQ('Which forms of “parler” sound the same?', ['all six', 'je, tu, il, ils', 'nous and vous', 'only je and tu'], 1, 'parle, parles, parle, parlent are pronounced identically.'),
    SQ('“I have been working here for five years.”', ['J’ai travaillé ici pour cinq ans.', 'Je travaille ici depuis cinq ans.', 'Je suis travaillé ici cinq ans.', 'Je travaillais ici depuis cinq ans.'], 1, 'Ongoing action → present + depuis.')]
});

FRT('fr-negation-q', { name: 'Negation & asking questions', cat: 'fra1',
  blurb: `Make any sentence negative with ne…pas and its cousins, and ask questions three ways, from casual to formal, with all the question words you need for daily life and the TEF speaking test.`,
  facts: [['Basic negation', 'ne … pas'], ['Spoken French', 'often drops ne'], ['Question styles', 'intonation · est-ce que · inversion'], ['After negation', 'un/une/des → de']],
  cheat: [['ne … pas', 'not'], ['ne … jamais', 'never'], ['ne … plus', 'no longer, not anymore'], ['ne … rien', 'nothing'], ['ne … personne', 'nobody'], ['ne … pas encore', 'not yet'], ['ne … que', 'only (= seulement)'], ['Qui ? Quoi ? / Qu’est-ce que ?', 'Who? What?'], ['Où ? Quand ? Comment ?', 'Where? When? How?'], ['Pourquoi ? — Parce que…', 'Why? — Because…'], ['Combien (de) ?', 'How much / many?'], ['Quel(le)(s) ?', 'Which? What? (agrees with the noun)']],
  sections: [
    ['Negation', PP(`Put <b>ne</b> before the conjugated verb and <b>pas</b> after it: ${FR('Je ne parle pas espagnol.')} With a compound tense, the negation surrounds the auxiliary: ${FR('Je n’ai pas compris.')} With an infinitive, both words go before it: ${FR('Je préfère ne pas sortir.')} After a negation, <b>un, une, des, du, de la</b> become <b>de / d’</b>: ${FR('J’ai une voiture.')} → ${FR('Je n’ai pas de voiture.')} (but not after être: ${FR('Ce n’est pas un problème.')})`)],
    ['Three ways to ask', TBL(['Style', 'Example', 'Where'], [['Intonation (rising voice)', FR('Vous travaillez ici ?'), 'conversation'], ['Est-ce que', FR('Est-ce que vous travaillez ici ?'), 'everywhere, safe'], ['Inversion', FR('Travaillez-vous ici ?'), 'formal writing and speech']]) +
      PP(`With a question word: ${FR('Où est-ce que tu habites ?')} / ${FR('Où habites-tu ?')} / ${FR('Tu habites où ?')}. Inversion with il/elle adds -t- between vowels: ${FR('Parle-t-il français ?')}`)],
    ['Asking for information (speaking test, part A)', FXS([['Quels sont vos horaires d’ouverture ?', 'What are your opening hours?'], ['Combien coûte l’inscription ?', 'How much does registration cost?'], ['Est-ce qu’il faut réserver à l’avance ?', 'Do you need to book ahead?'], ['Qu’est-ce qui est compris dans le prix ?', 'What is included in the price?'], ['Pourriez-vous m’expliquer comment ça fonctionne ?', 'Could you explain how it works?']])]
  ],
  edge: [`Keeping “un” after pas: “Je n’ai pas une voiture” ✗ → ${FR('Je n’ai pas de voiture')}.`, `Placing pas after the participle: “Je n’ai compris pas” ✗ → ${FR('Je n’ai pas compris')}.`, `Using “que” at the end of a question: “Tu fais que ?” ✗ → ${FR('Tu fais quoi ?')}`, `Forgetting quel agrees: ${FR('Quelle heure est-il ?')}`],
  ex: [[`Je ne mange ___ de viande. (never)`, `jamais`, `I never eat meat.`, ''],
    [`Il n’y a ___ dans la salle. (nobody)`, `personne`, `There’s nobody in the room.`, ''],
    [`Je n’ai pas ___ voiture.`, `de`, `I don’t have a car.`, `un → de after negation`],
    [`Nous n’habitons ___ à Toronto. (no longer)`, `plus`, `We no longer live in Toronto.`, ''],
    [`___ est-ce que vous partez ? — Demain.`, `quand`, `When are you leaving?`, ''],
    [`___ coûte le billet ?`, `combien`, `How much is the ticket?`, ''],
    [`___ heure est-il ?`, `quelle`, `What time is it?`, `heure is feminine`],
    [`Parle-___-il anglais ?`, `t`, `Does he speak English?`, `-t- between two vowels in inversion`]],
  qs: [SQ('Make negative: “J’ai des enfants.”', ['Je n’ai pas des enfants.', 'Je n’ai pas d’enfants.', 'Je n’ai enfants pas.', 'Je ne pas ai d’enfants.'], 1, 'des → de (d’) after pas.'),
    SQ('The most formal question:', ['Tu viens ?', 'Est-ce que tu viens ?', 'Venez-vous ?', 'Tu viens, non ?'], 2, 'Inversion is the formal register.')]
});

FRT('fr-adjectives', { name: 'Adjectives: agreement & position', cat: 'fra1',
  blurb: `French adjectives agree with the noun in gender and number, and most of them come after the noun. Learn the regular and irregular feminine forms and the short list of adjectives that go before the noun (BAGS).`,
  facts: [['Agreement', 'gender + number'], ['Default position', 'after the noun'], ['Before the noun', 'BAGS adjectives'], ['Feminine', 'usually + e']],
  cheat: [['+ e', 'grand → grande, petit → petite'], ['-e stays', 'jeune → jeune'], ['-eux → -euse', 'heureux → heureuse'], ['-if → -ive', 'sportif → sportive'], ['-en/-on → -enne/-onne', 'canadien → canadienne, bon → bonne'], ['-er → -ère', 'cher → chère'], ['Irregular', 'beau/belle, nouveau/nouvelle, vieux/vieille, blanc/blanche, long/longue, gentil/gentille'], ['Before a vowel', 'un bel homme, un nouvel emploi, un vieil ami'], ['BAGS (before)', 'Beauty, Age, Goodness, Size: beau, jeune, vieux, nouveau, bon, mauvais, grand, petit, gros']],
  sections: [
    ['Agreement', TBL(['', 'Masculine', 'Feminine'], [['Singular', FR('un appartement moderne') + ', ' + FR('un quartier tranquille'), FR('une maison moderne') + ', ' + FR('une rue tranquille')], ['Plural', FR('des quartiers calmes'), FR('des rues calmes')], ['-eux / -euse', FR('un homme sérieux'), FR('une femme sérieuse')], ['-if / -ive', FR('un enfant actif'), FR('une fille active')]]) +
      PP(`A group with at least one masculine noun takes the masculine plural: ${FR('Paul et Julie sont contents.')}`)],
    ['Position', PP(`Most adjectives follow the noun, especially colours, nationalities and shapes: ${FR('une voiture rouge')}, ${FR('un étudiant mexicain')}. <b>BAGS</b> adjectives go before: ${FR('une belle ville')}, ${FR('un jeune homme')}, ${FR('une bonne idée')}, ${FR('un petit studio')}. Some change meaning with position: ${FR('mon ancien travail')} (my former job) vs ${FR('un bâtiment ancien')} (an old building); ${FR('un grand homme')} (a great man) vs ${FR('un homme grand')} (a tall man); ${FR('ma propre voiture')} (my own car) vs ${FR('une voiture propre')} (a clean car).`)],
    ['Describing people and places', FXS([['Mon collègue est très sympathique et un peu timide.', 'My colleague is very nice and a bit shy.'], ['Nous habitons dans un petit appartement lumineux.', 'We live in a small bright apartment.'], ['Montréal est une ville vivante et multiculturelle.', 'Montreal is a lively, multicultural city.'], ['C’est un nouvel emploi avec de bonnes conditions.', 'It’s a new job with good conditions.']])]
  ],
  edge: [`“Une voiture nouvelle” for a brand-new-to-me car: ${FR('une nouvelle voiture')}.`, `Forgetting bel/nouvel/vieil before a vowel: ${FR('un vieil ami')}.`, `Agreeing colours made from nouns: ${FR('des chaussures orange')} (orange, marron don’t agree).`, `Capitalising nationality adjectives: ${FR('un plat français')} but ${FR('un Français')} (a French person).`],
  ex: [[`une femme ___ (heureux)`, `heureuse`, `a happy woman`, '-eux → -euse'],
    [`des maisons ___ (blanc)`, `blanches`, `white houses`, 'blanc → blanche, + s'],
    [`une ___ idée (bon)`, `bonne`, `a good idea`, 'bon → bonne, before the noun'],
    [`un ___ appartement (beau)`, `bel`, `a beautiful apartment`, 'bel before a vowel'],
    [`Ma sœur est ___ . (sportif)`, `sportive`, `My sister is athletic.`, '-if → -ive'],
    [`des étudiantes ___ (canadien)`, `canadiennes`, `Canadian students (f.)`, '-en → -enne, + s'],
    [`une ___ amie (vieux)`, `vieille`, `an old friend (f.)`, ''],
    [`C’est mon ___ patron, il est à la retraite maintenant. (former)`, `ancien`, `He’s my former boss; he’s retired now.`, 'ancien before the noun = former']],
  qs: [SQ('“a small apartment” is…', ['un appartement petit', 'un petit appartement', 'une petite appartement', 'un petite appartement'], 1, 'petit is a BAGS adjective: before the noun, masculine.'),
    SQ('Feminine of “nouveau”:', ['nouveaue', 'nouvelle', 'nouvel', 'nouvelles'], 1, 'nouveau → nouvelle (nouvel is masculine before a vowel).')]
});

FRT('fr-possessive', { name: 'Possessives & demonstratives', cat: 'fra1',
  blurb: `Say “my, your, his, her” and “this, that, these” correctly. In French the possessive agrees with the thing owned, not with the owner, which is the most common beginner surprise.`,
  facts: [['Agrees with', 'the thing owned'], ['son / sa', 'his OR her'], ['Before a vowel', 'mon, ton, son (even feminine)'], ['this / that', 'ce, cet, cette, ces']],
  cheat: [['mon / ma / mes', 'my'], ['ton / ta / tes', 'your (tu)'], ['son / sa / ses', 'his, her, its'], ['notre / nos', 'our'], ['votre / vos', 'your (vous)'], ['leur / leurs', 'their'], ['ce / cet / cette / ces', 'this, that / these, those'], ['-ci / -là', 'ce livre-ci (this one) / ce livre-là (that one)'], ['à moi, à toi…', 'mine, yours: C’est à moi.']],
  sections: [
    ['Possessive adjectives', TBL(['Owner', 'masc. sing.', 'fem. sing.', 'plural'], [['je', FR('mon père'), FR('ma mère'), FR('mes parents')], ['tu', FR('ton travail'), FR('ta maison'), FR('tes amis')], ['il / elle', FR('son passeport'), FR('sa famille'), FR('ses enfants')], ['nous', FR('notre quartier'), FR('notre ville'), FR('nos voisins')], ['vous', FR('votre dossier'), FR('votre adresse'), FR('vos documents')], ['ils / elles', FR('leur fils'), FR('leur fille'), FR('leurs enfants')]]) +
      PP(`<b>sa</b> mère can mean his mother or her mother: it agrees with <i>mère</i>. Before a feminine word starting with a vowel use mon/ton/son: ${FR('mon amie')}, ${FR('son adresse')}, ${FR('ton école')}.`)],
    ['Demonstratives', PP(`${FR('ce quartier')} (m.), ${FR('cet hôpital')} / ${FR('cet emploi')} (m. before a vowel or h), ${FR('cette semaine')} (f.), ${FR('ces documents')} (plural). Add -ci or -là to contrast: ${FR('Je préfère cette robe-ci, pas celle-là.')}`)]
  ],
  edge: [`“Ma amie” ✗ → ${FR('mon amie')}.`, `Choosing son/sa by the owner’s gender: “Pierre et sa voiture”, “Marie et son vélo” are both correct.`, `“Ce homme” ✗ → ${FR('cet homme')}.`, `“Leurs” only when there are several things: ${FR('leur voiture')} (one car), ${FR('leurs voitures')}.`],
  ex: [[`J’ai perdu ___ passeport. (my)`, `mon`, `I lost my passport.`, ''],
    [`Elle habite avec ___ mère. (her)`, `sa`, `She lives with her mother.`, 'mère is feminine'],
    [`Il parle à ___ sœur. (his)`, `sa`, `He’s talking to his sister.`, 'agrees with sœur'],
    [`C’est ___ amie Sophie. (my)`, `mon`, `This is my friend Sophie.`, 'mon before a vowel'],
    [`Nos voisins et ___ enfants sont gentils. (their)`, `leurs`, `Our neighbours and their children are nice.`, ''],
    [`Avez-vous ___ documents ? (your, formal)`, `vos`, `Do you have your documents?`, ''],
    [`___ hôpital est très moderne. (this)`, `cet`, `This hospital is very modern.`, 'cet before a silent h'],
    [`Je travaille tard ___ semaine. (this)`, `cette`, `I’m working late this week.`, '']],
  qs: [SQ('“his car” (voiture, f.):', ['son voiture', 'sa voiture', 'ses voiture', 'leur voiture'], 1, 'Agrees with voiture (feminine).'),
    SQ('“this job” (emploi, m.):', ['ce emploi', 'cette emploi', 'cet emploi', 'ces emploi'], 2, 'cet before a masculine word starting with a vowel.')]
});

FRT('fr-numbers-time', { name: 'Numbers, dates & time', cat: 'fra1',
  blurb: `Numbers are everywhere in listening tests: prices, phone numbers, addresses, times and dates. Learn 0–1,000,000, the tricky 70–99, ordinal numbers, days, months, and how to tell time, including the 24-hour clock used in Canada.`,
  facts: [['70', 'soixante-dix'], ['80', 'quatre-vingts'], ['90', 'quatre-vingt-dix'], ['Times', '24-hour clock in writing']],
  cheat: [['1–10', 'un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix'], ['11–16', 'onze, douze, treize, quatorze, quinze, seize'], ['17–19', 'dix-sept, dix-huit, dix-neuf'], ['20–60', 'vingt, trente, quarante, cinquante, soixante'], ['21, 31…', 'vingt et un, trente et un'], ['70–79', 'soixante-dix, soixante et onze, soixante-douze…'], ['80–89', 'quatre-vingts, quatre-vingt-un…'], ['90–99', 'quatre-vingt-dix, quatre-vingt-onze…'], ['100 / 200', 'cent / deux cents (but deux cent cinq)'], ['1 000 / 1 000 000', 'mille / un million'], ['Dates', 'le 1er (premier) juillet, le 24 juin 2026'], ['Time', 'Il est 14 h 30 (quatorze heures trente)']],
  sections: [
    ['70 to 99', PP(`French counts in twenties after 60: ${FR('soixante-dix')} (60 + 10 = 70), ${FR('soixante-quinze')} (75), ${FR('quatre-vingts')} (4 × 20 = 80), ${FR('quatre-vingt-dix-neuf')} (99). Belgium and Switzerland say septante/nonante, but Canada uses the standard forms.`)],
    ['Writing numbers', PP(`French uses a space (or nothing) for thousands and a comma for decimals: <b>1 250,50 $</b>. Prices are said “douze dollars cinquante” for 12,50 $. Phone numbers are read in pairs in France (01 23 45…) but digit groups in Canada: ${FR('cinq, un, quatre — huit, cinq, deux — trois, quatre, cinq, six', '514 852 3456')}.`)],
    ['Dates', PP(`Days and months are lowercase: ${FR('lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche')}; ${FR('janvier, février, mars, avril, mai, juin, juillet, août, septembre, octobre, novembre, décembre')}. ${FR('Nous sommes le jeudi 3 octobre.')} Use <b>premier</b> for the first: ${FR('le premier juillet')} (Canada Day). Years: ${FR('en 2026')} (deux mille vingt-six). “On Monday” = ${FR('lundi')}; “on Mondays” = ${FR('le lundi')}.`)],
    ['Telling time', TBL(['Written', 'Said (formal / everyday)', 'English'], [['8 h', FR('huit heures'), '8:00'], ['8 h 15', FR('huit heures quinze') + ' / ' + FR('huit heures et quart'), '8:15'], ['8 h 30', FR('huit heures trente') + ' / ' + FR('huit heures et demie'), '8:30'], ['8 h 45', FR('huit heures quarante-cinq') + ' / ' + FR('neuf heures moins le quart'), '8:45'], ['12 h / 0 h', FR('midi') + ' / ' + FR('minuit'), 'noon / midnight'], ['17 h 20', FR('dix-sept heures vingt'), '5:20 p.m.']]) +
      PP(`Schedules, tickets and announcements use the 24-hour clock. ${FR('Le train part à 17 h 45.')} ${FR('Le bureau est ouvert de 9 h à 16 h 30.')}`)]
  ],
  edge: [`Writing “quatre-vingt” for 80: it takes an s when nothing follows → ${FR('quatre-vingts')}; ${FR('quatre-vingt-trois')} has none.`, `Forgetting “et” in 21, 31, 41, 51, 61, 71: ${FR('vingt et un')}, ${FR('soixante et onze')}.`, `Capitalising days and months.`, `“Le premier” but “le deux, le trois” (no -ième) for dates.`],
  ex: [[`75 = soixante-___`, `quinze`, '', ''],
    [`80 = quatre-___`, `vingts`, '', 'with an s'],
    [`92 = quatre-vingt-___`, `douze`, '', ''],
    [`71 = soixante ___ onze`, `et`, '', ''],
    [`Canada Day: le ___ juillet`, `premier|1er`, `July 1st`, ''],
    [`Il est 8 h 30 = huit heures et ___`, `demie`, '', ''],
    [`Le magasin ferme à 18 h = à dix-___ heures`, `huit`, '', '24-hour clock'],
    [`Je suis né en ___ (1990)`, `mille neuf cent quatre-vingt-dix|1990`, '', 'mille neuf cent quatre-vingt-dix']],
  qs: [SQ('How do you say 96?', ['quatre-vingt-seize', 'nonante-six', 'quatre-vingts-seize', 'soixante-trente-six'], 0, '4 × 20 + 16.'),
    SQ('“Le rendez-vous est à 15 h 45.” In English:', ['5:45 a.m.', '3:45 p.m.', '4:15 p.m.', '1:45 p.m.'], 1, '15 h = 3 p.m.')]
});

FRT('fr-aller-futur', { name: 'Aller, faire, near future & places', cat: 'fra1',
  blurb: `Aller (to go) and faire (to do, to make) are essential irregular verbs. Aller + infinitive gives the near future, and the prepositions à, au, en, aux tell you where. Faire is used for the weather, activities and chores.`,
  facts: [['aller', 'vais, vas, va, allons, allez, vont'], ['faire', 'fais, fais, fait, faisons, faites, font'], ['Near future', 'aller + infinitive'], ['Countries', 'en (f.), au (m.), aux (pl.)']],
  cheat: [['Je vais partir.', 'I’m going to leave.'], ['à + city', 'à Montréal, à Winnipeg'], ['en + feminine country / continent', 'en France, en Inde, en Ontario, en Colombie-Britannique'], ['au + masculine country / province', 'au Canada, au Québec, au Manitoba'], ['aux + plural', 'aux États-Unis, aux Philippines'], ['à + le = au, à + les = aux', 'Je vais au bureau, aux toilettes'], ['chez + person', 'chez le médecin, chez moi'], ['faire la cuisine / les courses / le ménage', 'to cook / shop for groceries / clean'], ['Il fait beau / froid / chaud / -20 °C', 'The weather is nice / cold / hot / -20 °C'], ['faire du sport / du ski / de la natation', 'to do sports / ski / swim']],
  sections: [
    ['Aller and the near future', PP(`${FR('Je vais au travail en métro.')} Add an infinitive for plans: ${FR('Nous allons déménager en juillet.')} ${FR('Il va pleuvoir ce soir.')} Negative: ${FR('Je ne vais pas rester ici.')}`)],
    ['Prepositions of place', TBL(['Place', 'Preposition', 'Example'], [['city', 'à', FR('Je vais à Halifax.')], ['feminine country/province (most ending in -e)', 'en', FR('Elle vit en Alberta.') + ' ' + FR('en Nouvelle-Écosse')], ['masculine country/province', 'au', FR('J’habite au Québec.') + ' ' + FR('au Nouveau-Brunswick')], ['plural country', 'aux', FR('aux États-Unis')], ['a person’s place / business', 'chez', FR('chez mon frère') + ' ' + FR('chez le dentiste')]]) +
      PP(`Coming <b>from</b>: de (city), de/d’ (feminine), du (masculine), des (plural): ${FR('Je viens du Mexique')}, ${FR('d’Algérie')}, ${FR('des Philippines')}.`)],
    ['Faire', FXS([['Qu’est-ce que tu fais ce week-end ?', 'What are you doing this weekend?'], ['Il fait très froid en janvier à Edmonton.', 'It’s very cold in January in Edmonton.'], ['Je fais les courses le samedi.', 'I do the grocery shopping on Saturdays.'], ['On fait du vélo le long du canal.', 'We cycle along the canal.']])]
  ],
  edge: [`“à le” and “à les” ✗: always ${FR('au')} and ${FR('aux')}.`, `“en Canada” ✗ → ${FR('au Canada')} (masculine).`, `“Il est froid” for weather ✗ → ${FR('Il fait froid')}.`, `“Je vais à la maison de Paul” is heavy: say ${FR('Je vais chez Paul')}.`],
  ex: [[`Je ___ voyager en été. (aller)`, `vais`, `I’m going to travel in summer.`, ''],
    [`Ils ___ au cinéma ce soir. (aller)`, `vont`, `They’re going to the movies tonight.`, ''],
    [`Nous habitons ___ Canada.`, `au`, `We live in Canada.`, 'masculine country'],
    [`Ma cousine travaille ___ France.`, `en`, `My cousin works in France.`, 'feminine country'],
    [`Il va ___ États-Unis.`, `aux`, `He’s going to the U.S.`, 'plural'],
    [`Je vais ___ le médecin. (at the doctor’s)`, `chez`, `I’m going to the doctor’s.`, ''],
    [`Il ___ beau aujourd’hui. (faire)`, `fait`, `The weather is nice today.`, ''],
    [`Vous ___ du sport ? (faire)`, `faites`, `Do you do sports?`, 'vous faites']],
  qs: [SQ('“I live in Quebec (province).”', ['J’habite en Québec.', 'J’habite au Québec.', 'J’habite à Québec.', 'J’habite aux Québec.'], 1, 'Le Québec is masculine → au. (À Québec = in Quebec City.)'),
    SQ('Near future of “we leave”:', ['nous allons partir', 'nous partirons demain allons', 'nous va partir', 'nous allons partons'], 0, 'aller conjugated + infinitive.')]
});
