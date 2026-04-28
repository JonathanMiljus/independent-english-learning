/****************************************************************************
 * INDEPENDENT ENGLISH LEARNING — v2 ONE-CLICK BUILD (SELF-GRADING EDITION)
 *
 * This script builds your entire Google Classroom in one click:
 *   - 4 self-grading Google Form QUIZZES (multiple-choice with per-answer
 *     feedback). You don't grade. The forms do.
 *   - 5 Classroom topics with materials, mini-lessons, and assignments.
 *   - Every item links to the live student website where appropriate.
 *   - All bilingual EN + ES.
 *
 * The four forms:
 *   Form 1 — Module 1 Knowledge Check (10 MC questions)
 *   Form 2 — Module 2 Knowledge Check (12 MC questions)
 *   Form 3 — Module 3 Knowledge Check (10 MC questions)
 *   Form 4 — Final 90-Day Self-Coaching Recap Quiz (15 MC questions)
 *
 * Every wrong answer gets feedback that explains WHY it's wrong and points
 * the student back to the correct section of the live website. Every right
 * answer gets feedback that reinforces the concept.
 *
 * PASTE-AND-RUN:
 *   1) Drag your course docs into Google Drive (any folder). The script
 *      will find them by filename. The list is in CONFIG.DOCS below.
 *   2) Open script.google.com → New project → paste this whole file
 *      into Code.gs.
 *   3) Click "Services" (+) on the left sidebar → add "Google Classroom API".
 *   4) Click Run, choose function `run`, approve OAuth.
 *   5) When the log shows "DONE", open your Classroom — everything is built.
 *
 * Safe to re-run: skips topics, materials, and assignments that already
 * exist by title. If you previously ran the v1 script, this version creates
 * NEW topics with slightly different names — go to Classwork and delete the
 * old empty topics first if you want a clean look.
 *
 * Material by Jonathan Michael Miljus
 ****************************************************************************/

const CONFIG = {
  CLASSROOM_NAME: 'Independent English Learning',
  SITE_URL: 'https://jonathanmiljus.github.io/independent-english-learning/',
  REPO_URL: 'https://github.com/JonathanMiljus/independent-english-learning',

  // Section anchors on the live site — used for "study the answer" feedback
  SITE: {
    home:        'https://jonathanmiljus.github.io/independent-english-learning/',
    strategies:  'https://jonathanmiljus.github.io/independent-english-learning/#strategies',
    spacedRep:   'https://jonathanmiljus.github.io/independent-english-learning/#spaced-repetition',
    ankiMaster:  'https://jonathanmiljus.github.io/independent-english-learning/#anki-master',
    module1:     'https://jonathanmiljus.github.io/independent-english-learning/#module-1',
    module2:     'https://jonathanmiljus.github.io/independent-english-learning/#module-2',
    module3:     'https://jonathanmiljus.github.io/independent-english-learning/#module-3',
    listen:      'https://jonathanmiljus.github.io/independent-english-learning/#listen',
    downloads:   'https://jonathanmiljus.github.io/independent-english-learning/#downloads',
    resources:   'https://jonathanmiljus.github.io/independent-english-learning/#resources',
  },

  // Files the script looks up by name in your Drive.
  DOCS: {
    syllabus:           'Course_Syllabus_Independent_English_Learning.docx',
    quickStart:         'Student_Quick_Start_Bilingual.docx',
    method:             'The_Method_Science_Backed_DIY_Guide.docx',
    module1Handout:     'Module1_Set_Your_Goal_and_Routine.docx',
    module2Handout:     'Module2_Learn_and_Remember_Useful_English.docx',
    module3Handout:     'Module3_Use_English_in_Real_Life.docx',
    captureAndBuild:    'Capture_and_Build_Low_Tech_Guide.docx',
    ankiMastery:        'Anki_Mastery_Beginner_to_Advanced.docx',
    ankiQuickStart:     'Anki_Quick_Start_Guide.docx',
    aiPhoneFirst:       'AI_Phone_First_Toolkit.docx',
    aiPromptLibrary:    'AI_Prompt_Library_for_Language_Learning.docx',
    spanishPodcasts:    'Spanish_Podcast_Scripts.docx',
    assignment1Pkt:     'Assignment1_Goal_and_7Day_Plan_PACKET.docx',
    assignment2Pkt:     'Assignment2_Vocabulary_and_Sentence_Frames_PACKET.docx',
    assignment3Pkt:     'Assignment3_30Sec_Recording_and_90Day_Plan_PACKET.docx',
    researchPaper:      'CURR7003_Signature_Piece_Submission_Miljus.docx',
    classroomMaster:    'Google_Classroom_Master_Pack_v2.docx',
  },
};

// ============================================================================
//  ENTRY POINT
// ============================================================================
function run() {
  Logger.log('=== Independent English Learning v2 — Build Starting ===');

  Logger.log('Phase 1/2 — Building 4 self-grading quizzes...');
  const f1 = buildForm1_();
  Logger.log('  Form 1 (Module 1 Knowledge Check): ' + f1.publishedUrl);
  const f2 = buildForm2_();
  Logger.log('  Form 2 (Module 2 Knowledge Check): ' + f2.publishedUrl);
  const f3 = buildForm3_();
  Logger.log('  Form 3 (Module 3 Knowledge Check): ' + f3.publishedUrl);
  const f4 = buildForm4_();
  Logger.log('  Form 4 (90-Day Recap Quiz):       ' + f4.publishedUrl);

  Logger.log('Phase 2/2 — Populating Google Classroom...');
  const result = populateClassroom_({form1: f1, form2: f2, form3: f3, form4: f4});

  Logger.log('=== DONE ===');
  Logger.log('Class URL:               ' + result.classUrl);
  Logger.log('Module 1 quiz (live):    ' + f1.publishedUrl);
  Logger.log('Module 1 quiz (edit):    ' + f1.editUrl);
  Logger.log('Module 2 quiz (live):    ' + f2.publishedUrl);
  Logger.log('Module 2 quiz (edit):    ' + f2.editUrl);
  Logger.log('Module 3 quiz (live):    ' + f3.publishedUrl);
  Logger.log('Module 3 quiz (edit):    ' + f3.editUrl);
  Logger.log('Recap quiz (live):       ' + f4.publishedUrl);
  Logger.log('Recap quiz (edit):       ' + f4.editUrl);
}

// ============================================================================
//  FORM HELPERS
// ============================================================================
function fb_(text) {
  return FormApp.createFeedback().setText(text).build();
}

function formMeta_(form) {
  return {
    id: form.getId(),
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    driveId: form.getId(),
  };
}

function configureQuiz_(form, title, description) {
  form.setTitle(title);
  form.setDescription(description);
  form.setIsQuiz(true);
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage(
    'Thanks! Your quiz is auto-graded. You\'ll see your score and per-question ' +
    'feedback right after you submit.\n\n' +
    'Gracias. Tu cuestionario se califica automáticamente. Verás tu puntaje y ' +
    'la retroalimentación de cada pregunta justo después de enviarlo.'
  );
}

/**
 * Adds a multiple-choice question with auto-grading and per-answer feedback.
 * @param {Form} form
 * @param {Object} q  { title, points, choices: [{text, isCorrect}],
 *                      correctFeedback, wrongFeedback }
 */
function addMC_(form, q) {
  const item = form.addMultipleChoiceItem();
  item.setTitle(q.title);
  if (q.helpText) item.setHelpText(q.helpText);
  item.setRequired(true);
  item.setPoints(q.points || 10);

  const choices = q.choices.map(c =>
    item.createChoice(c.text, c.isCorrect));
  item.setChoices(choices);
  item.setFeedbackForCorrect(fb_(q.correctFeedback));
  item.setFeedbackForIncorrect(fb_(q.wrongFeedback));
  return item;
}

// ============================================================================
//  FORM 1 — MODULE 1 KNOWLEDGE CHECK
// ============================================================================
function buildForm1_() {
  const form = FormApp.create('Module 1 — Knowledge Check (Self-Grading)');
  configureQuiz_(form,
    'Module 1 — Knowledge Check',
    'Self-grading quiz · 10 questions · ~5 minutes\n\n' +
    'Auto-graded with feedback after every question. Read the Module 1 deep-dive on ' +
    'the live website first: ' + CONFIG.SITE.module1 + '\n\n' +
    'Cuestionario auto-calificado · 10 preguntas · ~5 minutos. Lee primero el ' +
    'Módulo 1 en el sitio web: ' + CONFIG.SITE.module1
  );

  // Q1 — Why specific goals beat vague goals
  addMC_(form, {
    title: '1.  Which of these is the BEST 90-day goal for an adult beginner?',
    points: 10,
    choices: [
      { text: 'I want to learn English.', isCorrect: false },
      { text: 'I want to be fluent.', isCorrect: false },
      { text: 'I want to talk to my child\'s teacher at the parent meeting in English.', isCorrect: true },
      { text: 'I want to study English every day.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. A specific goal names a real-life situation. It tells you exactly what to study ' +
      'and when you\'ve succeeded. (Zimmerman, 2002)\n\n' +
      'Correcto. Una meta específica nombra una situación real. Te dice exactamente qué estudiar ' +
      'y cuándo lo lograste.',
    wrongFeedback:
      'Not quite. "Learn English" and "be fluent" are wishes, not goals — they don\'t tell you ' +
      'what to study or how to know when you\'re done. The right answer names a real-life moment ' +
      '(parent meeting). Re-read Module 1, step 1: ' + CONFIG.SITE.module1 + '\n\n' +
      'Casi. "Aprender inglés" y "ser fluido" son deseos, no metas. La respuesta correcta nombra un ' +
      'momento real (la reunión de padres).',
  });

  // Q2 — Why 15 minutes daily
  addMC_(form, {
    title: '2.  Why does this course recommend 15 minutes a day instead of 2 hours on Sunday?',
    points: 10,
    choices: [
      { text: 'Because the brain can\'t learn for more than 15 minutes.', isCorrect: false },
      { text: 'Because 15 minutes is small enough that you\'ll actually do it on a bad day, and bad days are when learning gets won or lost.', isCorrect: true },
      { text: 'Because the website only has 15 minutes of audio.', isCorrect: false },
      { text: 'Because Anki refuses to show more cards than that.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Frequency beats duration. Distributed practice produces stronger long-term ' +
      'retention than the same total time crammed into one session (Cepeda et al., 2006; Kim & ' +
      'Webb, 2022).\n\n' +
      'Correcto. La frecuencia le gana a la duración. La práctica distribuida produce mejor ' +
      'retención a largo plazo que el mismo tiempo total en una sola sesión.',
    wrongFeedback:
      'No — the brain can study far longer than 15 minutes. The real reason is that 15 minutes is ' +
      'small enough you\'ll do it on bad days, and bad days are where learning gets won or lost. ' +
      'See: ' + CONFIG.SITE.strategies,
  });

  // Q3 — Habit anchoring
  addMC_(form, {
    title: '3.  What is "habit anchoring" in this course?',
    points: 10,
    choices: [
      { text: 'Tying your 15 minutes of practice to a habit you already have (like morning coffee).', isCorrect: true },
      { text: 'Setting a phone alarm for 6 a.m.', isCorrect: false },
      { text: 'Promising your spouse you\'ll study every day.', isCorrect: false },
      { text: 'Buying a new notebook before you start.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Anchoring your new habit to an old one means you don\'t need motivation — you ' +
      'rely on the existing habit. After morning coffee. During the commute. While brushing teeth.\n\n' +
      'Correcto. Anclar el nuevo hábito a uno viejo significa que no dependes de la motivación — ' +
      'dependes del hábito que ya tienes.',
    wrongFeedback:
      'Not quite. Alarms get snoozed. Promises break. Anchoring means tying your 15 minutes to ' +
      'something you ALREADY do every single day — that\'s what survives bad weeks. ' +
      CONFIG.SITE.module1,
  });

  // Q4 — The bad-day plan
  addMC_(form, {
    title: '4.  What\'s the rule for bad days in this course?',
    points: 10,
    choices: [
      { text: 'Skip the day and double up tomorrow.', isCorrect: false },
      { text: 'Go from 15 minutes down to 5 minutes — never to zero.', isCorrect: true },
      { text: 'Quit and try again next month.', isCorrect: false },
      { text: 'Push through the full 15 minutes no matter what.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Five minutes preserves the habit; zero minutes breaks it. Learners who quit ' +
      'aren\'t lazy — they\'re the ones who tried for 15 on a bad week, missed three days, and ' +
      'felt too guilty to come back.\n\n' +
      'Correcto. Cinco minutos preservan el hábito; cero minutos lo rompen.',
    wrongFeedback:
      'No. "Doubling up" doesn\'t work — your brain forgets at the speed of days. "Push through" ' +
      'leads to burnout. The rule is: drop to 5 minutes, never to zero. ' + CONFIG.SITE.strategies,
  });

  // Q5 — Why most adults quit
  addMC_(form, {
    title: '5.  According to this course, the #1 reason adults quit learning English is:',
    points: 10,
    choices: [
      { text: 'English is too hard.', isCorrect: false },
      { text: 'They\'re not smart enough.', isCorrect: false },
      { text: 'Their goal was too vague to survive a bad week.', isCorrect: true },
      { text: 'They didn\'t have a teacher.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Vague goals don\'t survive bad weeks. Specific goals attached to your real life ' +
      'do. (Zimmerman, 2002)\n\n' +
      'Correcto. Las metas vagas no sobreviven semanas malas. Las metas específicas atadas a tu ' +
      'vida real, sí.',
    wrongFeedback:
      'It\'s not that English is too hard or that adults aren\'t smart enough — those ideas don\'t ' +
      'match the research. The real culprit is vague goals. Read Module 1: ' + CONFIG.SITE.module1,
  });

  // Q6 — How much of English you actually need
  addMC_(form, {
    title: '6.  Approximately what percentage of everyday English speech is covered by the most common 1,000 words?',
    points: 10,
    choices: [
      { text: 'About 20%.', isCorrect: false },
      { text: 'About 50%.', isCorrect: false },
      { text: 'About 80%.', isCorrect: true },
      { text: 'About 100%.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Word-frequency studies consistently find that the top 1,000 words cover ~80% of ' +
      'everyday speech. The top 2,000 cover ~90%. You don\'t need 20,000 — you need the right 1,000.\n\n' +
      'Correcto. Las 1,000 palabras más comunes cubren ~80% del habla diaria. Las 2,000 cubren ~90%.',
    wrongFeedback:
      'Closer than you think. Word-frequency research shows the top 1,000 words cover roughly 80% ' +
      'of everyday speech. That\'s why this course focuses on the 10% of English that fits your ' +
      'real life.',
  });

  // Q7 — What's the FIRST thing in Module 1
  addMC_(form, {
    title: '7.  What\'s the FIRST step you do in Module 1?',
    points: 10,
    choices: [
      { text: 'Buy an Anki subscription.', isCorrect: false },
      { text: 'Finish the sentence: "In 90 days, I want to be able to ____________."', isCorrect: true },
      { text: 'Memorize 100 vocabulary words.', isCorrect: false },
      { text: 'Take a placement test.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Plan first, practice second. The whole course depends on a clear specific goal in ' +
      'one sentence.\n\n' +
      'Correcto. Primero planeas, después practicas.',
    wrongFeedback:
      'Not yet. The first step in Module 1 is to write your specific 90-day goal — one sentence. ' +
      'No app, no test, no vocab list comes before that. ' + CONFIG.SITE.module1,
  });

  // Q8 — Site usage
  addMC_(form, {
    title: '8.  Where do you find every audio drill, every download, and the interactive flashcards for this course?',
    points: 10,
    choices: [
      { text: 'On a CD that came with the course.', isCorrect: false },
      { text: 'In a paid app you have to install.', isCorrect: false },
      { text: 'On the live website (' + CONFIG.SITE_URL + '), free, accessible from any phone.', isCorrect: true },
      { text: 'Only inside Google Classroom — nowhere else.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Bookmark the website on your phone — that\'s the home base for the whole course. ' +
      'Everything else (this Classroom, the docs, the audio) is duplicated there.\n\n' +
      'Correcto. Guarda el sitio en favoritos en tu celular — es la base del curso completo.',
    wrongFeedback:
      'Open the live website right now: ' + CONFIG.SITE_URL + ' — that\'s where every audio drill, ' +
      'download, and interactive widget lives, free. Bookmark it on your phone.',
  });

  // Q9 — Three things on paper
  addMC_(form, {
    title: '9.  By the end of Module 1, what three things should be on paper?',
    points: 10,
    choices: [
      { text: 'A textbook order, a class schedule, and a tutor\'s phone number.', isCorrect: false },
      { text: 'A 90-day goal naming a real situation, a 15-minute slot anchored to a habit, and a one-sentence bad-day plan.', isCorrect: true },
      { text: 'A list of 100 vocabulary words.', isCorrect: false },
      { text: 'A grammar worksheet, a writing sample, and a recording.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Three lines on paper. No textbook, no app to install. That\'s the whole foundation ' +
      'of Module 1.\n\n' +
      'Correcto. Tres líneas en papel. Esa es toda la base del Módulo 1.',
    wrongFeedback:
      'Module 1 is intentionally minimal: a specific 90-day goal, a 15-minute slot anchored to an ' +
      'existing habit, and a one-sentence bad-day plan. Three lines. ' + CONFIG.SITE.module1,
  });

  // Q10 — Self-regulation research
  addMC_(form, {
    title: '10.  According to Zimmerman (2002), what predicts learning success more than IQ?',
    points: 10,
    choices: [
      { text: 'Self-regulation — setting specific goals and pre-planning your practice.', isCorrect: true },
      { text: 'Native language proficiency.', isCorrect: false },
      { text: 'How many hours you study per day.', isCorrect: false },
      { text: 'Whether you have a private tutor.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Self-regulation predicts learning outcomes more strongly than initial ability. ' +
      'Adults who set clear goals and pre-plan their practice consistently outperform peers, no ' +
      'matter their starting level.\n\n' +
      'Correcto. La auto-regulación predice el éxito de aprendizaje mejor que la habilidad inicial.',
    wrongFeedback:
      'It\'s self-regulation. Goal-setting and pre-planning predict learning outcomes more strongly ' +
      'than IQ, hours studied, or having a tutor. (Zimmerman, 2002)',
  });

  return formMeta_(form);
}

// ============================================================================
//  FORM 2 — MODULE 2 KNOWLEDGE CHECK
// ============================================================================
function buildForm2_() {
  const form = FormApp.create('Module 2 — Knowledge Check (Self-Grading)');
  configureQuiz_(form,
    'Module 2 — Knowledge Check',
    'Self-grading quiz · 12 questions · ~7 minutes\n\n' +
    'Read the Module 2 deep-dive on the website first, plus the Spaced Repetition section ' +
    'and the Anki Cards section: ' + CONFIG.SITE.module2 + '\n\n' +
    'Cuestionario auto-calificado · 12 preguntas · ~7 minutos. Lee el Módulo 2, la sección de ' +
    'Repetición Espaciada y la de Tarjetas Anki: ' + CONFIG.SITE.module2
  );

  // Q1 — The 3 sounds
  addMC_(form, {
    title: '1.  Which three English sounds do Spanish speakers most often miss?',
    points: 8,
    choices: [
      { text: 'r, l, n', isCorrect: false },
      { text: 'th, v, sh', isCorrect: true },
      { text: 'p, t, k', isCorrect: false },
      { text: 'a, e, i', isCorrect: false },
    ],
    correctFeedback:
      'Correct. /θ/ as in think (tongue between teeth), /v/ as in very (top teeth on bottom lip — ' +
      'NOT a Spanish "b"), and /ʃ/ as in she (round the lips, "shhhh"). Spanish doesn\'t have ' +
      'these as distinct sounds.\n\n' +
      'Correcto. /θ/ de think, /v/ de very, y /ʃ/ de she. El español no tiene estos sonidos.',
    wrongFeedback:
      'It\'s "th," "v," and "sh." Watch the pronunciation cards on the website (Module 2 deep-dive) ' +
      'with mouth-position diagrams. ' + CONFIG.SITE.module2,
  });

  // Q2 — Cognates
  addMC_(form, {
    title: '2.  What is a "cognate"?',
    points: 8,
    choices: [
      { text: 'A grammar rule unique to English.', isCorrect: false },
      { text: 'A word that\'s spelled and means almost the same in English and Spanish (hospital, restaurant, doctor).', isCorrect: true },
      { text: 'An advanced verb tense.', isCorrect: false },
      { text: 'A type of flashcard.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Cognates are free vocabulary. There are roughly 1,000 of them between Spanish and ' +
      'English. You already know them.\n\n' +
      'Correcto. Los cognados son vocabulario gratis. Hay alrededor de 1,000 entre español e inglés.',
    wrongFeedback:
      'Cognates = words that look and mean almost the same in both languages (hospital, restaurant, ' +
      'doctor, family, problem). Roughly 1,000 of them are essentially free vocabulary.',
  });

  // Q3 — The forgetting curve
  addMC_(form, {
    title: '3.  Without review, about how much new vocabulary do you lose within 24 hours?',
    points: 8,
    choices: [
      { text: 'About 10%', isCorrect: false },
      { text: 'About 30%', isCorrect: false },
      { text: 'About 60%', isCorrect: true },
      { text: 'Almost none', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Ebbinghaus\'s forgetting curve: ~60% of new vocabulary is lost within 24 hours, ' +
      '~80% within a week, without review. With three timed reviews at the right gaps, retention ' +
      'stays near 90%.\n\n' +
      'Correcto. Sin repasar, pierdes ~60% en 24 horas y ~80% en una semana. Con tres repasos en ' +
      'los intervalos correctos, la retención se queda cerca del 90%.',
    wrongFeedback:
      'It\'s about 60% — the Ebbinghaus forgetting curve. That\'s why spaced reviews matter. See ' +
      'the visualization: ' + CONFIG.SITE.spacedRep,
  });

  // Q4 — Three tiers
  addMC_(form, {
    title: '4.  This course offers THREE ways to do spaced repetition. Which order goes from BASIC to ADVANCED?',
    points: 8,
    choices: [
      { text: 'Anki → paper Leitner Box → Phone Notes', isCorrect: false },
      { text: 'Paper Leitner Box → Phone Notes Loop → Anki', isCorrect: true },
      { text: 'Phone Notes Loop → Anki → paper Leitner Box', isCorrect: false },
      { text: 'They\'re all the same difficulty.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Paper is basic (no app, no battery), Notes is intermediate (uses your existing ' +
      'app), Anki is advanced (algorithm picks the timing). Pick the level you\'ll actually use ' +
      'today.\n\n' +
      'Correcto. Papel es básico, Notas es intermedio, Anki es avanzado. Escoge el nivel que vas ' +
      'a usar HOY.',
    wrongFeedback:
      'Paper Leitner Box (basic) → Phone Notes Loop (intermediate) → Anki (advanced). The flow ' +
      'matters more than the tool — start where you\'ll actually do the work today. ' + CONFIG.SITE.spacedRep,
  });

  // Q5 — Why pick the level you'll actually do
  addMC_(form, {
    title: '5.  Why does this course tell adults NOT to jump straight to Anki?',
    points: 8,
    choices: [
      { text: 'Anki costs money on every platform.', isCorrect: false },
      { text: 'Anki is illegal in some countries.', isCorrect: false },
      { text: 'Adults who skip the basics tend to abandon the app within two weeks.', isCorrect: true },
      { text: 'Anki only works for children.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. The system you actually use beats the system that\'s "best on paper." Build the ' +
      'capture habit first (paper or Notes), then upgrade only when the current level feels too ' +
      'small for your life.\n\n' +
      'Correcto. El sistema que de verdad usas le gana al sistema que es "el mejor en teoría."',
    wrongFeedback:
      'Anki is free on most platforms and is excellent. The problem is that adults who jump in ' +
      'without first building a capture habit on paper or in Notes abandon the app within two ' +
      'weeks. Build the habit first. ' + CONFIG.SITE.spacedRep,
  });

  // Q6 — Capture flow step 1
  addMC_(form, {
    title: '6.  In the 5-step capture flow, what do you do FIRST when you hear a new English word?',
    points: 8,
    choices: [
      { text: 'Look it up in a dictionary right away.', isCorrect: false },
      { text: 'Notice — give it 3 seconds of attention.', isCorrect: true },
      { text: 'Add it to your Anki deck immediately.', isCorrect: false },
      { text: 'Ignore it; you\'ll see it again.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Step 1 is just to NOTICE — three seconds of attention is enough to make it stick ' +
      'later. Then capture in 5 seconds. Then look up tonight. Then move into your system on ' +
      'Sunday. Then say it out loud.\n\n' +
      'Correcto. El paso 1 es solo NOTAR — tres segundos de atención bastan.',
    wrongFeedback:
      'The full 5 steps are: Notice → Capture in 5 seconds → Look up tonight → Move into your ' +
      'system on Sunday → Speak it out loud. Step 1 is just to NOTICE. ' + CONFIG.SITE.spacedRep,
  });

  // Q7 — Anki core idea
  addMC_(form, {
    title: '7.  What\'s the core idea for Anki cards in this course?',
    points: 9,
    choices: [
      { text: 'Memorize translations.', isCorrect: false },
      { text: 'Memorize situations.', isCorrect: true },
      { text: 'Memorize as many words as possible per day.', isCorrect: false },
      { text: 'Memorize grammar rules.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. "Don\'t memorize translations. Memorize situations." A card is built from a real ' +
      'sentence, a vivid mental image, and a real-life situation — not from "word = translation."\n\n' +
      'Correcto. "No memorices traducciones. Memoriza situaciones."',
    wrongFeedback:
      'The core idea is: don\'t memorize translations — memorize situations. A card needs a ' +
      'sentence, an image, and a real-life context. ' + CONFIG.SITE.ankiMaster,
  });

  // Q8 — Weak vs strong card
  addMC_(form, {
    title: '8.  Which is the STRONGER Anki card?',
    points: 9,
    choices: [
      { text: 'Front: "to run." Back: "correr."', isCorrect: false },
      { text: 'Front: "I have to run to class." Image: a student running late, books flying. Back: "Tengo que correr a clase. correr = to run."', isCorrect: true },
      { text: 'Front: a list of 10 verbs. Back: their translations.', isCorrect: false },
      { text: 'Front: a grammar rule. Back: an exception list.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Sentence + image + real situation = three retrieval paths into one memory. The ' +
      'slight stress of running late makes it emotionally salient. You\'ll remember it.\n\n' +
      'Correcto. Oración + imagen + situación real = tres caminos de recuperación a una memoria.',
    wrongFeedback:
      'A card with just "to run = correr" has no image, no sentence, no situation. You\'ll forget ' +
      'it within a week. The strong card pairs a real sentence with a vivid image. See the ' +
      'side-by-side example: ' + CONFIG.SITE.ankiMaster,
  });

  // Q9 — Sentence frames
  addMC_(form, {
    title: '9.  Approximately what percentage of everyday speech does this course\'s set of 10 sentence frames cover?',
    points: 8,
    choices: [
      { text: 'About 20%', isCorrect: false },
      { text: 'About 50%', isCorrect: false },
      { text: 'About 80%', isCorrect: true },
      { text: 'About 100%', isCorrect: false },
    ],
    correctFeedback:
      'Correct. The 10 frames (I am · I have · I need · I want · I like · I can · Can you help me with · Where is · How much is · I do not understand) ' +
      'cover ~80% of what an adult beginner has to say. Memorize the frame, swap the word.\n\n' +
      'Correcto. Las 10 plantillas cubren ~80% de lo que un adulto principiante tiene que decir.',
    wrongFeedback:
      'It\'s about 80%. Memorize the frame once, swap any new word from your vocabulary bank, and ' +
      'you have a complete grammatical sentence. See the 30 example variations: ' + CONFIG.SITE.module2,
  });

  // Q10 — Sentence frame I have
  addMC_(form, {
    title: '10.  Pick the BEST natural use of the "I have ___" frame at a doctor\'s office:',
    points: 9,
    choices: [
      { text: 'I have very tired today.', isCorrect: false },
      { text: 'I have an appointment at three.', isCorrect: true },
      { text: 'I have to go pain.', isCorrect: false },
      { text: 'I have so good.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. "I have an appointment at three" is exactly the kind of natural fill-in adults ' +
      'use at the front desk every day. "I have a question," "I have two children," "I have an ' +
      'allergy" — same frame, different word.\n\n' +
      'Correcto. "I have an appointment at three" es justo el tipo de oración natural que se usa ' +
      'a diario en la recepción.',
    wrongFeedback:
      '"I have very tired" should be "I am tired." "I have to go pain" doesn\'t parse — that\'d ' +
      'be "I have pain." Use the frame as it is: I have + a noun (an appointment, a question, two ' +
      'children, a problem). ' + CONFIG.SITE.module2,
  });

  // Q11 — Why dual coding
  addMC_(form, {
    title: '11.  According to dual-coding theory (Paivio, 1971), why does pairing a word with an image help memory?',
    points: 9,
    choices: [
      { text: 'It saves time.', isCorrect: false },
      { text: 'It encodes the word through both verbal and visual channels, so you have two retrieval paths to the same memory.', isCorrect: true },
      { text: 'It makes the word easier to type.', isCorrect: false },
      { text: 'It eliminates the need to review.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Two channels = two retrieval paths to the same memory. That\'s why every Anki ' +
      'card in this course pairs a sentence with an image idea. (Paivio, 1971)\n\n' +
      'Correcto. Dos canales = dos caminos de recuperación a la misma memoria.',
    wrongFeedback:
      'Dual coding works because the brain encodes verbal and visual information through separate ' +
      'channels. Pairing a word with an image creates two retrieval paths — both can lead you back ' +
      'to the same memory. (Paivio, 1971)',
  });

  // Q12 — AI prompt
  addMC_(form, {
    title: '12.  This course\'s rule about chatting with AI for language learning is:',
    points: 8,
    choices: [
      { text: 'Have a long conversation every day.', isCorrect: false },
      { text: 'Generate cards or vocab, then close the chat. Don\'t turn it into a tutor.', isCorrect: true },
      { text: 'Never use AI — it cheats.', isCorrect: false },
      { text: 'Only use the paid version.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. AI is your card factory, not your tutor. Long chats let you stay passive — ' +
      'recognition without production. Generate, then close the chat, then put the words in your ' +
      'mouth.\n\n' +
      'Correcto. La IA es tu fábrica de tarjetas, no tu tutor. Genera, cierra el chat, y pon las ' +
      'palabras en tu boca.',
    wrongFeedback:
      'AI is fine — but as a card factory, not a tutor. Chatting passively burns time without ' +
      'building production. Generate, close, speak. ' + CONFIG.SITE.ankiMaster,
  });

  return formMeta_(form);
}

// ============================================================================
//  FORM 3 — MODULE 3 KNOWLEDGE CHECK
// ============================================================================
function buildForm3_() {
  const form = FormApp.create('Module 3 — Knowledge Check (Self-Grading)');
  configureQuiz_(form,
    'Module 3 — Knowledge Check',
    'Self-grading quiz · 10 questions · ~5 minutes\n\n' +
    'Read the Module 3 deep-dive (especially the doctor\'s office vocabulary): ' + CONFIG.SITE.module3 + '\n\n' +
    'Cuestionario auto-calificado · 10 preguntas · ~5 minutos. Lee el Módulo 3 (especialmente el ' +
    'vocabulario del consultorio): ' + CONFIG.SITE.module3
  );

  // Q1 — Output (Swain)
  addMC_(form, {
    title: '1.  What does "output" mean in language learning, and why does it matter (Swain, 1985)?',
    points: 10,
    choices: [
      { text: 'Speaking and writing — it forces your brain to convert vague recognition into precise expression.', isCorrect: true },
      { text: 'Listening to podcasts.', isCorrect: false },
      { text: 'Reading textbooks.', isCorrect: false },
      { text: 'Watching TV.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Listening builds comprehension. Speaking turns comprehension into fluency. That\'s ' +
      'why this course asks you to record yourself for 30 seconds — output is what makes it real.\n\n' +
      'Correcto. Escuchar construye comprensión. Hablar la convierte en fluidez.',
    wrongFeedback:
      'Output = speaking and writing. Listening and reading are INPUT. The output hypothesis ' +
      '(Swain, 1985) says producing language is what consolidates learning. ' + CONFIG.SITE.module3,
  });

  // Q2 — Doctor vocabulary: prescription
  addMC_(form, {
    title: '2.  What does "prescription" mean at a doctor\'s office?',
    points: 10,
    choices: [
      { text: 'A surgery you need.', isCorrect: false },
      { text: 'An order from a doctor for medicine — a "receta."', isCorrect: true },
      { text: 'Your insurance card.', isCorrect: false },
      { text: 'A type of appointment.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Prescription = receta. The doctor writes one and you take it to the pharmacy.\n\n' +
      'Correcto. Prescription = receta. El doctor la escribe y tú la llevas a la farmacia.',
    wrongFeedback:
      'A prescription is a written order from a doctor for medicine — "una receta" in Spanish. ' +
      'See the Module 3 vocabulary table: ' + CONFIG.SITE.module3,
  });

  // Q3 — Allergy
  addMC_(form, {
    title: '3.  Which sentence correctly tells the doctor about an allergy?',
    points: 10,
    choices: [
      { text: 'I have an allergic.', isCorrect: false },
      { text: 'I am allergic to penicillin.', isCorrect: true },
      { text: 'I am penicillin.', isCorrect: false },
      { text: 'I have penicillin allergic.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. The pattern is "I am allergic to ___." It\'s one of the most useful medical ' +
      'sentences you can memorize.\n\n' +
      'Correcto. El patrón es "I am allergic to ___." Es una de las oraciones médicas más útiles.',
    wrongFeedback:
      'The correct pattern is "I am allergic to ___." (e.g., "I am allergic to peanuts.") Memorize ' +
      'this sentence — it could matter someday. ' + CONFIG.SITE.module3,
  });

  // Q4 — Refill
  addMC_(form, {
    title: '4.  At the pharmacy, "I need a refill of my medicine" means:',
    points: 10,
    choices: [
      { text: 'I need to pay for my medicine.', isCorrect: false },
      { text: 'I need more of the same medicine I already take.', isCorrect: true },
      { text: 'I need a new prescription for a different medicine.', isCorrect: false },
      { text: 'I need to throw my medicine away.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. A "refill" (resurtir) means more of the medicine you\'re already taking — usually ' +
      'when the bottle is almost empty.\n\n' +
      'Correcto. Refill = resurtir. Más de la medicina que ya tomas.',
    wrongFeedback:
      'A refill = more of the same medicine you\'re already taking. (Spanish: resurtir.) ' +
      CONFIG.SITE.module3,
  });

  // Q5 — Mini check-in script
  addMC_(form, {
    title: '5.  What\'s the FIRST thing to say at the front desk when you arrive for an appointment?',
    points: 10,
    choices: [
      { text: '"Where is the bathroom?"', isCorrect: false },
      { text: '"Hello. I have an appointment at [time] with Doctor [name]. My name is [your name]."', isCorrect: true },
      { text: 'Nothing — just sit and wait.', isCorrect: false },
      { text: '"I am sick."', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Memorize this opener and you\'ll never freeze at check-in. Then add: "Here is my ' +
      'insurance card. I do not understand fast English — can you speak slowly, please?"\n\n' +
      'Correcto. Memoriza esta frase y nunca te bloquearás al registrarte.',
    wrongFeedback:
      'The check-in opener is: "Hello. I have an appointment at [time] with Doctor [name]. My ' +
      'name is [your name]. Here is my insurance card." Memorize it once, use it forever. ' + CONFIG.SITE.module3,
  });

  // Q6 — Free input sources
  addMC_(form, {
    title: '6.  Which of these is a FREE input source recommended in this course for US-based learners?',
    points: 10,
    choices: [
      { text: 'Rosetta Stone Premium', isCorrect: false },
      { text: 'VOA Learning English (Voice of America)', isCorrect: true },
      { text: 'Babbel Pro', isCorrect: false },
      { text: 'Duolingo Plus', isCorrect: false },
    ],
    correctFeedback:
      'Correct. VOA Learning English is free, slow, and uses the most common 1,500 words. Also: ' +
      'ESL Pod, Rachel\'s English (YouTube), USA Learns. All free.\n\n' +
      'Correcto. VOA Learning English es gratis, lento, y usa las 1,500 palabras más comunes.',
    wrongFeedback:
      'The free recommended sources are VOA Learning English, ESL Pod, Rachel\'s English on ' +
      'YouTube, and USA Learns. All free, all used by serious adult learners. ' + CONFIG.SITE.resources,
  });

  // Q7 — 30-second recording
  addMC_(form, {
    title: '7.  Why does this course ask you to record yourself for 30 seconds in week 1?',
    points: 10,
    choices: [
      { text: 'To embarrass yourself.', isCorrect: false },
      { text: 'To create a baseline so you can compare it to a recording in week 12 — your evidence of progress.', isCorrect: true },
      { text: 'To send to the teacher for grading.', isCorrect: false },
      { text: 'It\'s not required.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. Subjective progress lags real progress by weeks. Recordings give you objective ' +
      'evidence — you\'ll be shocked at the difference.\n\n' +
      'Correcto. La sensación de progreso va atrasada al progreso real. Las grabaciones te dan ' +
      'evidencia objetiva.',
    wrongFeedback:
      'It\'s your baseline. At week 12 you\'ll record again, and the difference between recording ' +
      '1 and recording 12 is your real evidence. The feeling lags the data by weeks.',
  });

  // Q8 — Krashen
  addMC_(form, {
    title: '8.  What is "comprehensible input" (Krashen, 1985)?',
    points: 10,
    choices: [
      { text: 'Language at your exact level — every word familiar.', isCorrect: false },
      { text: 'Language slightly above your current level — you understand most of it, and the gaps are where you grow.', isCorrect: true },
      { text: 'Language far above your level so you stretch.', isCorrect: false },
      { text: 'Reading textbooks only.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. The "i+1" idea: input you mostly understand, with just enough new material to ' +
      'stretch. That\'s why "slow news" sources like VOA work so well.\n\n' +
      'Correcto. La idea "i+1": input que entiendes en su mayoría, con suficiente material nuevo ' +
      'para crecer.',
    wrongFeedback:
      'Comprehensible input = language SLIGHTLY above your level. You understand most of it; the ' +
      'gaps are where learning happens. Too easy = no growth. Too hard = no comprehension. ' +
      'Krashen called this "i+1."',
  });

  // Q9 — Sleep
  addMC_(form, {
    title: '9.  When does memory consolidation primarily happen (Walker & Stickgold, 2004)?',
    points: 10,
    choices: [
      { text: 'During waking review.', isCorrect: false },
      { text: 'During sleep — especially slow-wave and REM stages.', isCorrect: true },
      { text: 'Only during testing.', isCorrect: false },
      { text: 'It happens randomly.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. That\'s why a 5-minute Anki review right before lights-out measurably improves ' +
      'next-day recall. Treat it like brushing your teeth.\n\n' +
      'Correcto. Por eso un repaso de Anki de 5 minutos justo antes de dormir mejora la memoria ' +
      'del día siguiente.',
    wrongFeedback:
      'Memory consolidation happens primarily during sleep, especially slow-wave and REM phases. ' +
      'Studying right before bed gives the sleeping brain something to work on. ' + CONFIG.SITE.strategies,
  });

  // Q10 — Self-coaching
  addMC_(form, {
    title: '10.  By the end of Module 3, the meta-skill the course aims to teach you is:',
    points: 10,
    choices: [
      { text: 'How to score perfectly on a grammar test.', isCorrect: false },
      { text: 'How to coach yourself for the next 90 days — set goals, pick materials, give feedback, detect plateaus, rescue motivation.', isCorrect: true },
      { text: 'How to memorize 5,000 words.', isCorrect: false },
      { text: 'How to write a perfect essay.', isCorrect: false },
    ],
    correctFeedback:
      'Correct. A coach sets goals, picks materials, gives feedback, notices plateaus, and keeps ' +
      'the athlete showing up. After this course, that coach is YOU.\n\n' +
      'Correcto. Un coach pone metas, elige materiales, da retroalimentación, detecta mesetas, y ' +
      'mantiene al atleta presente. Después de este curso, ese coach eres TÚ.',
    wrongFeedback:
      'The course is about teaching you to coach YOURSELF — set goals, pick materials, self-' +
      'feedback, plateau-detection, motivation rescue. Tests, word lists, and essays are not the ' +
      'point. ' + CONFIG.SITE.module3,
  });

  return formMeta_(form);
}

// ============================================================================
//  FORM 4 — FINAL 90-DAY RECAP QUIZ
// ============================================================================
function buildForm4_() {
  const form = FormApp.create('Final — 90-Day Self-Coaching Recap (Self-Grading)');
  configureQuiz_(form,
    '90-Day Self-Coaching Recap',
    'Self-grading final quiz · 15 questions · ~10 minutes\n\n' +
    'This is your final knowledge check. It pulls from all 3 modules plus the deeper guides ' +
    '(Spaced Repetition, Anki Cards, AI Phone-First, Capture & Build). Take this at week 12 to ' +
    'confirm everything stuck.\n\n' +
    'Cuestionario final · 15 preguntas · ~10 minutos. Toma esto en la semana 12 para confirmar ' +
    'que todo se quedó.'
  );

  const Q = [
    {
      title: '1.  The single most important habit in this course is:',
      points: 7,
      choices: [
        { text: '15 minutes daily, anchored to an existing habit, never zero on bad days.', isCorrect: true },
        { text: '2 hours every Saturday.', isCorrect: false },
        { text: '30 minutes when you feel motivated.', isCorrect: false },
        { text: 'A weekend immersion class once a quarter.', isCorrect: false },
      ],
      correct: 'Correct. Frequency beats duration. Anchored beats willpower-driven. Five minutes beats zero.',
      wrong: 'It\'s 15 minutes daily, anchored to an existing habit. Re-read Module 1: ' + CONFIG.SITE.module1,
    },
    {
      title: '2.  When you don\'t know what a new word means, this course tells you to:',
      points: 7,
      choices: [
        { text: 'Skip it and hope you see it again.', isCorrect: false },
        { text: 'Notice it, capture it in 5 seconds (phone Notes), look it up tonight, move into your system Sunday, speak it out loud.', isCorrect: true },
        { text: 'Translate the whole sentence into Spanish.', isCorrect: false },
        { text: 'Open Google Translate every time.', isCorrect: false },
      ],
      correct: 'Correct. The 5-step capture flow. Capture → Look up → Move into system → Speak.',
      wrong: 'It\'s the 5-step capture flow: Notice → Capture → Look up tonight → Move into system → Speak. ' + CONFIG.SITE.spacedRep,
    },
    {
      title: '3.  Which AI prompt has the HIGHEST ROI for adult language learners?',
      points: 6,
      choices: [
        { text: 'Translate this for me.', isCorrect: false },
        { text: 'Connect this English word to MY life as [your job/situation] and create a sentence I could actually say at work.', isCorrect: true },
        { text: 'Make me fluent in 5 days.', isCorrect: false },
        { text: 'Pretend you\'re my best friend.', isCorrect: false },
      ],
      correct: 'Correct. Personalization is the highest-ROI prompt. A word connected to YOUR work, YOUR home, YOUR life sticks far better than an abstract example.',
      wrong: 'The personalization prompt wins every time. Connect each new word to your real life — your job, your kids, your day — and the card sticks. ' + CONFIG.SITE.ankiMaster,
    },
    {
      title: '4.  In a strong Anki card, what are the THREE non-negotiables?',
      points: 7,
      choices: [
        { text: 'A word, a translation, and a grammar rule.', isCorrect: false },
        { text: 'A sentence, an image idea, and a real-life situation.', isCorrect: true },
        { text: 'A word, two synonyms, and an antonym.', isCorrect: false },
        { text: 'A definition, a part of speech, and a pronunciation guide.', isCorrect: false },
      ],
      correct: 'Correct. Sentence + image + situation = three retrieval paths to the same memory. Without all three, the card is weak.',
      wrong: 'Sentence, image, real-life situation. Without those three, even a "perfect" definition won\'t stick. ' + CONFIG.SITE.ankiMaster,
    },
    {
      title: '5.  At week 4 you feel like you\'re not improving. What does the course say to do?',
      points: 7,
      choices: [
        { text: 'Quit — it\'s probably not working.', isCorrect: false },
        { text: 'Trust the process — subjective progress lags real progress by weeks. Look at objective evidence (recordings, Anki retention).', isCorrect: true },
        { text: 'Switch to a totally different method.', isCorrect: false },
        { text: 'Hire a private tutor.', isCorrect: false },
      ],
      correct: 'Correct. The week-4 dip is universal. Listen to your week-1 recording vs today\'s — that\'s your evidence.',
      wrong: 'Almost everyone feels this at week 4. Don\'t trust the feeling. Compare your week-1 recording to today\'s — that\'s the evidence. ' + CONFIG.SITE.strategies,
    },
    {
      title: '6.  When motivation drops, the rule is:',
      points: 7,
      choices: [
        { text: 'Push through, force yourself.', isCorrect: false },
        { text: 'Lower the bar — drop from 15 to 5 minutes. Never to zero.', isCorrect: true },
        { text: 'Take a long break.', isCorrect: false },
        { text: 'Quit gracefully.', isCorrect: false },
      ],
      correct: 'Correct. 5 preserves the habit; 0 breaks it. Pre-decide your bad-day plan and you survive the bad weeks.',
      wrong: 'Drop from 15 to 5. Never to zero. Pre-decided bad-day plans are how learners survive bad weeks. ' + CONFIG.SITE.strategies,
    },
    {
      title: '7.  The Leitner Box (paper flashcards) is:',
      points: 6,
      choices: [
        { text: 'An obsolete method nobody uses.', isCorrect: false },
        { text: 'The original spaced-repetition system — same math as Anki, no app required.', isCorrect: true },
        { text: 'Only for children.', isCorrect: false },
        { text: 'Only for advanced learners.', isCorrect: false },
      ],
      correct: 'Correct. The Leitner Box (1972) IS spaced repetition. If you write each card by hand, you\'ve already started memorizing it.',
      wrong: 'The Leitner Box is the ORIGINAL spaced-repetition system. Anki uses the same math. Paper works just as well — and writing each card by hand is itself a memory aid. ' + CONFIG.SITE.spacedRep,
    },
    {
      title: '8.  Which 10 sentence frames cover ~80% of what an adult beginner has to say?',
      points: 6,
      choices: [
        { text: 'I am, I have, I need, I want, I like, I can, Can you help me with, Where is, How much is, I do not understand.', isCorrect: true },
        { text: 'Conditional perfect, subjunctive, present perfect, past perfect, future perfect…', isCorrect: false },
        { text: 'How are you, Goodbye, Yes, No, Please, Thank you, Sorry, Hello, OK, Maybe.', isCorrect: false },
        { text: 'It depends on the textbook.', isCorrect: false },
      ],
      correct: 'Correct. Memorize the frame, swap any new word from your vocabulary bank, and you have a complete grammatical sentence.',
      wrong: 'The 10 frames are: I am, I have, I need, I want, I like, I can, Can you help me with, Where is, How much is, I do not understand. See 30 example variations on the website: ' + CONFIG.SITE.module2,
    },
    {
      title: '9.  At a doctor\'s office, the BEST way to say you\'re allergic is:',
      points: 6,
      choices: [
        { text: 'I have an allergic.', isCorrect: false },
        { text: 'I am allergic to penicillin.', isCorrect: true },
        { text: 'I am penicillin.', isCorrect: false },
        { text: 'Allergic me of penicillin.', isCorrect: false },
      ],
      correct: 'Correct. The pattern is "I am allergic to ___." Memorize this — it can matter someday.',
      wrong: 'The pattern is "I am allergic to ___." Memorize that exact form. ' + CONFIG.SITE.module3,
    },
    {
      title: '10.  In this course, "input" means:',
      points: 6,
      choices: [
        { text: 'Listening and reading — the language coming INTO your brain.', isCorrect: true },
        { text: 'Speaking and writing.', isCorrect: false },
        { text: 'Typing on a keyboard.', isCorrect: false },
        { text: 'Anki cards only.', isCorrect: false },
      ],
      correct: 'Correct. Input = listening and reading. Output = speaking and writing. You need both.',
      wrong: 'Input = listening and reading (language coming INTO your brain). Output = speaking and writing (going OUT). You need both. (Krashen, 1985 / Swain, 1985)',
    },
    {
      title: '11.  Which is the BEST description of "comprehensible input"?',
      points: 6,
      choices: [
        { text: 'Language way below your level.', isCorrect: false },
        { text: 'Language way above your level.', isCorrect: false },
        { text: 'Language slightly above your level — you understand most of it, and the small gaps are where you grow.', isCorrect: true },
        { text: 'Whatever feels easy.', isCorrect: false },
      ],
      correct: 'Correct. The "i+1" rule. Understand most of it; the small unknown is where growth happens.',
      wrong: 'Comprehensible input = "i+1" — slightly above your current level. Most of it makes sense; the small new bits are where you grow.',
    },
    {
      title: '12.  When should you do a 5-minute Anki review for the BEST recall the next day?',
      points: 6,
      choices: [
        { text: 'First thing in the morning.', isCorrect: false },
        { text: 'Right before bed — the sleeping brain consolidates it.', isCorrect: true },
        { text: 'During exercise.', isCorrect: false },
        { text: 'During work meetings.', isCorrect: false },
      ],
      correct: 'Correct. Memory consolidation happens primarily during slow-wave and REM sleep (Walker & Stickgold, 2004). Studying right before bed measurably improves next-day recall.',
      wrong: 'Right before bed. Sleep is when consolidation happens — the bedtime review gives the sleeping brain something to work on. ' + CONFIG.SITE.strategies,
    },
    {
      title: '13.  Your goal is to talk to your child\'s teacher in English. Which course path fits BEST?',
      points: 6,
      choices: [
        { text: 'Memorize 1,000 grammar rules first, then practice.', isCorrect: false },
        { text: 'Build 20 vocabulary cards specific to school + memorize the 10 sentence frames + record yourself rehearsing the meeting once a week.', isCorrect: true },
        { text: 'Take a Cambridge exam.', isCorrect: false },
        { text: 'Hire a teacher to come with you.', isCorrect: false },
      ],
      correct: 'Correct. Specific goal → specific vocabulary + specific frames + rehearsed output. That\'s the whole self-coaching method.',
      wrong: 'Specific goal → specific vocabulary + frames + rehearsal. Match every learning hour to the real-life moment. Module 1 sets the goal, Module 2 builds the words, Module 3 makes you do it out loud.',
    },
    {
      title: '14.  Past month two, why does Anki scale better than the paper Leitner Box or the Phone Notes Loop?',
      points: 6,
      choices: [
        { text: 'It costs less.', isCorrect: false },
        { text: 'It scales to thousands of cards without you doing the bookkeeping. Paper and Notes cap out around 200 active cards.', isCorrect: true },
        { text: 'It\'s prettier.', isCorrect: false },
        { text: 'It supports more languages.', isCorrect: false },
      ],
      correct: 'Correct. Paper and Notes work — but they get unwieldy past ~200 cards. Anki scales to thousands without manual bookkeeping. Upgrade only when the current level feels too small.',
      wrong: 'Anki\'s real advantage is at scale. Past ~200 active cards, paper and Notes get unwieldy. Anki scales to thousands without you tracking the schedule. Until then, paper or Notes work fine. ' + CONFIG.SITE.spacedRep,
    },
    {
      title: '15.  At the end of 90 days, the course considers you successful if:',
      points: 7,
      choices: [
        { text: 'You scored 95% on every Anki card.', isCorrect: false },
        { text: 'You can do, in real life, the specific thing you wrote in your week-1 goal.', isCorrect: true },
        { text: 'You learned 5,000 vocabulary words.', isCorrect: false },
        { text: 'You can recite all 10 sentence frames perfectly.', isCorrect: false },
      ],
      correct: 'Correct. The whole course is judged by ONE thing: did you do the real-life moment you named in week 1? Everything else is in service of that.',
      wrong: 'Success = doing the real-life moment you named in week 1. Anki retention, vocab count, and frame recital are all in service of that one goal. ' + CONFIG.SITE.module1,
    },
  ];

  Q.forEach(q => {
    addMC_(form, {
      title: q.title,
      points: q.points,
      choices: q.choices,
      correctFeedback: q.correct,
      wrongFeedback: q.wrong,
    });
  });

  return formMeta_(form);
}

// ============================================================================
//  CLASSROOM HELPERS
// ============================================================================
function findCourseByName_(name) {
  const list = Classroom.Courses.list({}).courses || [];
  const match = list.find(c => c.name === name);
  if (!match) {
    throw new Error('No Google Classroom called "' + name + '" was found. ' +
      'Create it (or check the name in CONFIG) and re-run.');
  }
  return match;
}

function findOrCreateTopic_(courseId, topicName) {
  const resp = Classroom.Courses.Topics.list(courseId);
  const topics = resp.topic || resp.topics || [];
  const existing = topics.find(t => t.name === topicName);
  if (existing) {
    Logger.log('  Topic exists: ' + topicName);
    return existing.topicId;
  }
  const created = Classroom.Courses.Topics.create({name: topicName}, courseId);
  Logger.log('  Topic created: ' + topicName);
  return created.topicId;
}

function findDriveFile_(name) {
  const it = DriveApp.getFilesByName(name);
  if (!it.hasNext()) {
    Logger.log('  WARNING: file not found in Drive — "' + name +
               '". Drag it into your Drive and re-run if you want it attached.');
    return null;
  }
  return it.next();
}

function materialAlreadyExists_(courseId, title) {
  const resp = Classroom.Courses.CourseWorkMaterials.list(courseId);
  const list = resp.courseWorkMaterial || resp.courseWorkMaterials || [];
  return list.some(m => m.title === title);
}

function courseWorkAlreadyExists_(courseId, title) {
  const resp = Classroom.Courses.CourseWork.list(courseId);
  const list = resp.courseWork || resp.courseWorks || [];
  return list.some(cw => cw.title === title);
}

function buildDriveFileMaterial_(driveId, shareMode) {
  return {
    driveFile: {
      driveFile: { id: driveId },
      shareMode: shareMode || 'VIEW',
    },
  };
}

function buildLinkMaterial_(url) {
  return { link: { url: url } };
}

function createMaterial_(courseId, topicId, title, description, materials) {
  if (materialAlreadyExists_(courseId, title)) {
    Logger.log('  Material exists, skipping: ' + title);
    return;
  }
  Classroom.Courses.CourseWorkMaterials.create({
    title: title,
    description: description,
    materials: materials,
    state: 'PUBLISHED',
    topicId: topicId,
  }, courseId);
  Logger.log('  + Material: ' + title);
}

function createAssignment_(courseId, topicId, title, description, points, materials) {
  if (courseWorkAlreadyExists_(courseId, title)) {
    Logger.log('  Assignment exists, skipping: ' + title);
    return;
  }
  Classroom.Courses.CourseWork.create({
    title: title,
    description: description,
    workType: 'ASSIGNMENT',
    state: 'PUBLISHED',
    maxPoints: points,
    materials: materials,
    topicId: topicId,
  }, courseId);
  Logger.log('  + Assignment: ' + title);
}

function attachIfPresent_(materialsArr, fileName, shareMode) {
  const f = findDriveFile_(fileName);
  if (f) materialsArr.push(buildDriveFileMaterial_(f.getId(), shareMode || 'VIEW'));
}

// ============================================================================
//  CLASSROOM POPULATION
// ============================================================================
function populateClassroom_(forms) {
  const course = findCourseByName_(CONFIG.CLASSROOM_NAME);
  Logger.log('  Found course: ' + course.name + ' (' + course.id + ')');

  // Five topics in Classwork order:
  const topicStart    = findOrCreateTopic_(course.id, '0 · Start Here — Welcome');
  const topicM1       = findOrCreateTopic_(course.id, '1 · Module 1 — Set Your Goal');
  const topicM2       = findOrCreateTopic_(course.id, '2 · Module 2 — Learn & Remember');
  const topicM3       = findOrCreateTopic_(course.id, '3 · Module 3 — Use English in Real Life');
  const topicResources= findOrCreateTopic_(course.id, '4 · Resources & Downloads');

  // ============================================================
  //  START HERE
  // ============================================================
  createMaterial_(course.id, topicStart,
    'Welcome — Bienvenido(a) — Open me first',
    'This course is built for adults who have tried apps, classes, and YouTube and still feel ' +
    'stuck. We\'re going to do it differently — slow, science-based, and built around your real ' +
    'life.\n\n' +
    'ES · Este curso es para adultos que han probado apps, clases y YouTube y todavía se sienten ' +
    'atascados. Vamos a hacerlo diferente — despacio, basado en la ciencia, y diseñado para tu ' +
    'vida real.\n\n' +
    'THREE THINGS TO DO RIGHT NOW:\n\n' +
    '1) Open the live student website. Bookmark it on your phone.\n' +
    '   ' + CONFIG.SITE_URL + '\n\n' +
    '2) Read the Welcome packet (attached).\n\n' +
    '3) Open Module 1 and start.\n\n' +
    'Material by Jonathan Michael Miljus',
    [buildLinkMaterial_(CONFIG.SITE_URL)]);

  // Live website link as its own material (extra discoverable)
  createMaterial_(course.id, topicStart,
    '🌐 Live website (the home base)',
    'Bookmark this on your phone — that\'s your first homework.\n\n' +
    'On the website you can:\n' +
    '   • Listen to all 30 audio drills\n' +
    '   • Switch the whole site between English, Spanish, and French\n' +
    '   • Open the interactive widgets (set your goal, track your streak, run flashcards)\n' +
    '   • Download every handout in this course\n\n' +
    'ES · Guarda esta dirección en favoritos en tu celular — esa es la primera tarea.',
    [buildLinkMaterial_(CONFIG.SITE_URL)]);

  // Quick start packet
  const quickStartFile = findDriveFile_(CONFIG.DOCS.quickStart);
  if (quickStartFile) {
    createMaterial_(course.id, topicStart,
      'Welcome packet (1 page · bilingual · printable)',
      'A 1-page bilingual welcome packet. Print it or read it on your phone. Inside: how the ' +
      'course works, what you\'ll be able to do in 90 days, and where to find help.\n\n' +
      'ES · Un paquete bilingüe de bienvenida de 1 página. Adentro: cómo funciona el curso, lo ' +
      'que vas a poder hacer en 90 días, y dónde pedir ayuda.',
      [buildDriveFileMaterial_(quickStartFile.getId())]);
  }

  // Syllabus
  const syllabusFile = findDriveFile_(CONFIG.DOCS.syllabus);
  if (syllabusFile) {
    createMaterial_(course.id, topicStart,
      'Course syllabus',
      'Two-page syllabus. The whole course at a glance — modules, assignments, grading, where ' +
      'to ask for help.\n\n' +
      'ES · Programa del curso de dos páginas. Todo el curso de un vistazo.',
      [buildDriveFileMaterial_(syllabusFile.getId())]);
  }

  // ============================================================
  //  MODULE 1
  // ============================================================
  const m1HandoutFile = findDriveFile_(CONFIG.DOCS.module1Handout);
  const m1Materials = [];
  if (m1HandoutFile) m1Materials.push(buildDriveFileMaterial_(m1HandoutFile.getId()));
  m1Materials.push(buildLinkMaterial_(CONFIG.SITE.module1));

  createMaterial_(course.id, topicM1,
    'Module 1 mini-lesson — Set your 90-day goal',
    'The whole module on one printable page (front and back). 8 minutes to read, then read the ' +
    'full transcript on the website.\n\n' +
    'WHAT\'S INSIDE:\n' +
    '   • Why specific goals beat vague goals (Zimmerman, 2002)\n' +
    '   • How to anchor 15 minutes to something you already do every day\n' +
    '   • Your bad-day backup plan — the floor that\'s never zero\n' +
    '   • Three small wins for week 1\n\n' +
    'READ THIS FIRST, then take the Module 1 quiz.\n\n' +
    'ES · Todo el módulo en una página. Adentro: por qué las metas específicas le ganan a las ' +
    'vagas, cómo asegurar 15 minutos al día, tu plan B para los días malos, y tres victorias ' +
    'pequeñas para la semana 1.\n\n' +
    'Live website transcript: ' + CONFIG.SITE.module1,
    m1Materials);

  // Listen for Module 1
  createMaterial_(course.id, topicM1,
    '🎧 Listen — Module 1 audio (pronunciation drills)',
    'Six audio drills built specifically for Module 1. Click the link, scroll to the orange ' +
    '"Pronunciation" section, tap play. Each drill is under 90 seconds.\n\n' +
    'TIP: do these while you cook dinner or wait for the bus. The point is exposure — not ' +
    'concentration.\n\n' +
    'ES · Seis grabaciones cortas para el Módulo 1. Cada una dura menos de 90 segundos. Hazlas ' +
    'mientras cocinas o esperas el autobús — la idea es exposición, no concentración.',
    [buildLinkMaterial_(CONFIG.SITE.listen)]);

  // Module 1 SELF-GRADING QUIZ
  const m1QuizMaterials = [
    buildDriveFileMaterial_(forms.form1.driveId, 'VIEW'),
  ];
  attachIfPresent_(m1QuizMaterials, CONFIG.DOCS.assignment1Pkt, 'STUDENT_COPY');

  createAssignment_(course.id, topicM1,
    'Module 1 — Knowledge Check (auto-graded · 100 pts)',
    'Self-grading multiple-choice quiz. 10 questions · ~5 minutes. The Form auto-grades and ' +
    'gives you per-question feedback the moment you submit.\n\n' +
    'Read the Module 1 transcript on the website FIRST: ' + CONFIG.SITE.module1 + '\n\n' +
    'You will see your score and detailed feedback for every answer (right or wrong) immediately ' +
    'after submission. There is no manual grading — the form does it for you.\n\n' +
    'ES · Cuestionario auto-calificado de opción múltiple. 10 preguntas · ~5 minutos. La forma se ' +
    'califica sola y te da retroalimentación de cada pregunta al instante.\n\n' +
    'Bonus (optional): the printable Assignment 1 packet is also attached if you\'d like to fill ' +
    'in your goal, schedule, and bad-day plan on paper as a personal record.',
    100, m1QuizMaterials);

  // ============================================================
  //  MODULE 2
  // ============================================================
  const m2HandoutFile = findDriveFile_(CONFIG.DOCS.module2Handout);
  const m2Materials = [];
  if (m2HandoutFile) m2Materials.push(buildDriveFileMaterial_(m2HandoutFile.getId()));
  m2Materials.push(buildLinkMaterial_(CONFIG.SITE.module2));

  createMaterial_(course.id, topicM2,
    'Module 2 mini-lesson — Learn & remember useful English',
    'The Module 2 handout. 10 minutes to read.\n\n' +
    'WHAT\'S INSIDE:\n' +
    '   • The 3 English sounds Spanish speakers most often miss (with mouth-position diagrams)\n' +
    '   • Free cognates — 1,000 English words you already know\n' +
    '   • Your personal vocabulary bank\n' +
    '   • The 10 sentence frames with 3 example variations each (30 sentences)\n\n' +
    'ES · El folleto del Módulo 2. 10 minutos de lectura. Adentro: los 3 sonidos del inglés que ' +
    'los hispanohablantes pierden, los cognados gratis, tu banco personal de vocabulario, y las ' +
    '10 plantillas con 3 variaciones cada una (30 oraciones).\n\n' +
    'Live website with the full table + 30 example sentences: ' + CONFIG.SITE.module2,
    m2Materials);

  // The System link
  createMaterial_(course.id, topicM2,
    '🧠 The System — basic, intermediate, advanced (read before the quiz)',
    'Open this link before you take the Module 2 quiz.\n\n' +
    'On this page you\'ll see:\n' +
    '   • The forgetting curve (an animated chart of why we lose words)\n' +
    '   • Three ways to do spaced repetition: paper Leitner Box, Phone Notes loop, or Anki\n' +
    '   • Five steps for what to do when you meet a new word — the capture flow\n' +
    '   • Six free copy-paste AI prompts for when you don\'t know what a word means\n\n' +
    'Don\'t pick the most advanced option. Pick the one you\'ll actually do today.\n\n' +
    'ES · Abre este enlace antes de tomar el cuestionario del Módulo 2. Encontrarás la curva del ' +
    'olvido, tres maneras de hacer repetición espaciada (papel, celular, computadora), cinco ' +
    'pasos para capturar palabras nuevas, y seis prompts de IA listos para copiar.',
    [buildLinkMaterial_(CONFIG.SITE.spacedRep)]);

  // Anki Master link
  createMaterial_(course.id, topicM2,
    '🚀 Master Anki Cards — how to build cards that actually stick',
    'Optional but recommended. The full method for building Anki cards that work — core idea, ' +
    'six paste-ready AI prompts, the non-negotiable checklist, the weak-vs-strong card ' +
    'comparison, and the 5-step student workflow. Watch the linked Anki Masterclass video too ' +
    '(12 minutes).\n\n' +
    'ES · Opcional pero recomendado. El método completo para hacer tarjetas de Anki que funcionan.',
    [buildLinkMaterial_(CONFIG.SITE.ankiMaster)]);

  // Listen for Module 2
  createMaterial_(course.id, topicM2,
    '🎧 Listen — Module 2 audio (vocabulary + sentence frames)',
    'Twelve audio drills for Module 2 — vocabulary by topic and the 10 sentence frames.\n\n' +
    'Listen to one section per day this week. By Sunday you\'ll have heard each piece three ' +
    'times — that\'s the spacing.\n\n' +
    'ES · Doce grabaciones para el Módulo 2. Una sección por día. Para el domingo habrás oído ' +
    'cada parte tres veces — esa es la repetición espaciada.',
    [buildLinkMaterial_(CONFIG.SITE.listen)]);

  // Module 2 SELF-GRADING QUIZ
  const m2QuizMaterials = [
    buildDriveFileMaterial_(forms.form2.driveId, 'VIEW'),
  ];
  attachIfPresent_(m2QuizMaterials, CONFIG.DOCS.assignment2Pkt, 'STUDENT_COPY');

  createAssignment_(course.id, topicM2,
    'Module 2 — Knowledge Check (auto-graded · 100 pts)',
    'Self-grading multiple-choice quiz. 12 questions · ~7 minutes. The Form auto-grades and ' +
    'gives you per-question feedback the moment you submit.\n\n' +
    'Before you take it, read these three sections of the website:\n' +
    '   • ' + CONFIG.SITE.module2 + '\n' +
    '   • ' + CONFIG.SITE.spacedRep + '\n' +
    '   • ' + CONFIG.SITE.ankiMaster + '\n\n' +
    'You will see your score and detailed feedback for every answer immediately after submission.\n\n' +
    'ES · Cuestionario auto-calificado. 12 preguntas · ~7 minutos. Lee primero las tres secciones ' +
    'del sitio web: Módulo 2, El Sistema (Repetición Espaciada), y Tarjetas Anki.\n\n' +
    'Bonus: the printable Assignment 2 packet is attached if you\'d like to capture 30 vocabulary ' +
    'words from your real life as a personal record.',
    100, m2QuizMaterials);

  // ============================================================
  //  MODULE 3
  // ============================================================
  const m3HandoutFile = findDriveFile_(CONFIG.DOCS.module3Handout);
  const m3Materials = [];
  if (m3HandoutFile) m3Materials.push(buildDriveFileMaterial_(m3HandoutFile.getId()));
  m3Materials.push(buildLinkMaterial_(CONFIG.SITE.module3));

  createMaterial_(course.id, topicM3,
    'Module 3 mini-lesson — Use English in real life',
    'Module 3. The shortest of the three. ~8 minutes to read, plus the doctor\'s office ' +
    'vocabulary table on the website.\n\n' +
    'WHAT\'S INSIDE:\n' +
    '   • Why output (speaking) is what turns recognition into fluency (Swain, 1985)\n' +
    '   • Three free input sources for US-based learners (VOA Learning English, ESL Pod, Rachel\'s English)\n' +
    '   • The 30-second self-recording practice that gives you measurable progress\n' +
    '   • Doctor\'s office vocabulary (14 essential medical terms with example sentences)\n' +
    '   • The mini check-in script — the first 30 seconds at any front desk\n\n' +
    'ES · Módulo 3. El más corto. ~8 minutos de lectura. Adentro: por qué hablar es lo que ' +
    'convierte el reconocimiento en fluidez, tres fuentes gratis de inglés americano, cómo ' +
    'grabarte 30 segundos cada semana, vocabulario del consultorio, y el mini guion de registro.\n\n' +
    'Live website transcript with full vocabulary table: ' + CONFIG.SITE.module3,
    m3Materials);

  // Free resources
  createMaterial_(course.id, topicM3,
    '🇺🇸 Free American-English resources',
    'All free. All used by professional language learners. Pick one and stick with it for 30 days.\n\n' +
    '   • VOA Learning English — slow news, 1,500 essential words\n' +
    '   • ESL Pod — natural conversations with explanations\n' +
    '   • Rachel\'s English — pronunciation YouTube channel for adults\n' +
    '   • USA Learns — self-paced government-funded course\n\n' +
    'ES · Todo es gratis. Todo lo usan estudiantes serios. Escoge uno y apégate a él por 30 días.',
    [buildLinkMaterial_(CONFIG.SITE.resources)]);

  // Listen
  createMaterial_(course.id, topicM3,
    '🎧 Listen — Module 3 dialogues',
    'Real-life dialogues — at the grocery store, at the doctor, at work.\n\n' +
    'Listen once with the script, once without. The second listen is where the learning happens.\n\n' +
    'ES · Diálogos de la vida real. Escucha una vez con el guion, otra sin él. La segunda es ' +
    'donde pasa el aprendizaje.',
    [buildLinkMaterial_(CONFIG.SITE.listen)]);

  // Module 3 SELF-GRADING QUIZ
  const m3QuizMaterials = [
    buildDriveFileMaterial_(forms.form3.driveId, 'VIEW'),
  ];
  attachIfPresent_(m3QuizMaterials, CONFIG.DOCS.assignment3Pkt, 'STUDENT_COPY');

  createAssignment_(course.id, topicM3,
    'Module 3 — Knowledge Check (auto-graded · 100 pts)',
    'Self-grading multiple-choice quiz. 10 questions · ~5 minutes. Includes doctor\'s office ' +
    'vocabulary, output theory, and free input sources.\n\n' +
    'Read first: ' + CONFIG.SITE.module3 + '\n\n' +
    'ES · Cuestionario auto-calificado. 10 preguntas · ~5 minutos. Incluye vocabulario del ' +
    'consultorio, teoría del output, y fuentes gratis.\n\n' +
    'Bonus: the printable Assignment 3 packet (with the 30-second recording instructions and ' +
    'the 90-day plan template) is attached.',
    100, m3QuizMaterials);

  // FINAL Recap quiz at the end of Module 3
  createAssignment_(course.id, topicM3,
    '★ FINAL — 90-Day Self-Coaching Recap (auto-graded · 100 pts)',
    'Your final quiz. 15 multiple-choice questions covering all 3 modules plus the deeper guides ' +
    '(Spaced Repetition, Anki Cards, Capture & Build, AI Phone-First Toolkit).\n\n' +
    'Take this at week 12, after you\'ve done all three Module Knowledge Checks.\n\n' +
    'Auto-graded with feedback after every question. The form does the grading — you do the ' +
    'learning.\n\n' +
    'ES · Tu cuestionario final. 15 preguntas de opción múltiple sobre los 3 módulos y las ' +
    'guías profundas. Hazlo en la semana 12. Auto-calificado con retroalimentación.',
    100, [buildDriveFileMaterial_(forms.form4.driveId, 'VIEW')]);

  // ============================================================
  //  RESOURCES & DOWNLOADS
  // ============================================================
  attachAndPostResource_(course.id, topicResources,
    'The Method — the science behind the course',
    CONFIG.DOCS.method,
    '10 chapters. The full science behind every choice in this course. Every claim is sourced.\n\n' +
    'ES · 10 capítulos. La ciencia detrás de cada decisión del curso. Cada afirmación está ' +
    'respaldada por una fuente.');

  attachAndPostResource_(course.id, topicResources,
    'Capture & Build — save every word you hear (low-tech)',
    CONFIG.DOCS.captureAndBuild,
    'For students who can\'t or won\'t use Anki. Notebook + phone Notes + voice memos + the ' +
    'optional paper Leitner Box.\n\n' +
    'ES · Para estudiantes que no pueden o no quieren usar Anki. Cuaderno + Notas + memos de ' +
    'voz + la Caja de Leitner en papel (opcional).');

  attachAndPostResource_(course.id, topicResources,
    'Anki Mastery — beginner to advanced',
    CONFIG.DOCS.ankiMastery,
    'The full science of spaced repetition + three skill tiers + phone-only workflow + paper ' +
    'alternative.\n\n' +
    'ES · La ciencia completa de la repetición espaciada, tres niveles, flujo solo con celular, ' +
    'y alternativa en papel.');

  attachAndPostResource_(course.id, topicResources,
    'Anki Quick Start (10 minutes)',
    CONFIG.DOCS.ankiQuickStart,
    'If the longer Anki Mastery guide is too much, start here. 10-minute setup.\n\n' +
    'ES · Si la guía larga es demasiado, empieza aquí. Configuración de 10 minutos.');

  attachAndPostResource_(course.id, topicResources,
    'AI on your phone — for adults who don\'t trust tech',
    CONFIG.DOCS.aiPhoneFirst,
    '5 simple things to do with ChatGPT on your phone. Copy-paste prompts. What NOT to do.\n\n' +
    'ES · Las 5 cosas simples que hacer con ChatGPT en tu celular. Prompts listos para copiar. ' +
    'Qué NO hacer.');

  attachAndPostResource_(course.id, topicResources,
    'AI Prompt Library (advanced reference)',
    CONFIG.DOCS.aiPromptLibrary,
    '10 copy-paste prompts that turn ChatGPT into an Anki deck factory. Advanced reference for ' +
    'students comfortable with computers.\n\n' +
    'ES · 10 prompts para copiar que convierten ChatGPT en una fábrica de mazos de Anki. ' +
    'Referencia avanzada.');

  attachAndPostResource_(course.id, topicResources,
    'Spanish Podcast Scripts (4 episodes)',
    CONFIG.DOCS.spanishPodcasts,
    '4 fully-written Spanish podcast scripts (~1,000 words each). For students who prefer to ' +
    'listen rather than read. Run through NotebookLM or ElevenLabs to generate the audio.\n\n' +
    'ES · 4 guiones completos de podcast en español (~1,000 palabras cada uno).');

  attachAndPostResource_(course.id, topicResources,
    'The research paper behind this course (CURR 7003)',
    CONFIG.DOCS.researchPaper,
    'The full CURR 7003 signature piece — APA 7, 16 peer-reviewed citations. The academic ' +
    'backing for every choice.\n\n' +
    'ES · El trabajo completo de CURR 7003 — APA 7, 16 citas revisadas por pares.');

  // Live website link, last item
  createMaterial_(course.id, topicResources,
    '🌐 Live website (everything is here too)',
    'The website has everything in this Classroom — plus 30 audio drills, interactive widgets, ' +
    'and the trilingual EN/ES/FR toggle. Open from any phone.\n\n' +
    'ES · El sitio web tiene todo lo que está en este Classroom — más 30 audios, widgets ' +
    'interactivos, y el cambio EN/ES/FR.',
    [buildLinkMaterial_(CONFIG.SITE_URL)]);

  return {
    classUrl: course.alternateLink,
    courseId: course.id,
  };
}

function attachAndPostResource_(courseId, topicId, title, fileName, description) {
  const f = findDriveFile_(fileName);
  if (!f) {
    Logger.log('  Skipping resource (file missing in Drive): ' + fileName);
    return;
  }
  createMaterial_(courseId, topicId, title, description, [buildDriveFileMaterial_(f.getId())]);
}
