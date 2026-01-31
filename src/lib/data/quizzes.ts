export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  categoryKey: string;
  textId: string;
}

export const quizQuestions: QuizQuestion[] = [
  // ─── Story: The Girl Who Loved to Read ─────────────────────
  { id: 'q-story-village-1', categoryKey: 'story', textId: 'story-village', question: 'Where did the girl live?', options: ['In a village by the sea', 'In a mountain cabin', 'In a busy city', 'On a farm'], correctIndex: 0 },
  { id: 'q-story-village-2', categoryKey: 'story', textId: 'story-village', question: 'Where did she sit to read?', options: ['By the river', 'Beneath the old oak tree', 'On the rooftop', 'In her bedroom'], correctIndex: 1 },
  { id: 'q-story-village-3', categoryKey: 'story', textId: 'story-village', question: 'What did the words carry her to?', options: ['Sleep', 'Places she had never been', 'The village square', 'Her childhood'], correctIndex: 1 },

  // ─── Story: Alice ──────────────────────────────────────────
  { id: 'q-story-alice-1', categoryKey: 'story', textId: 'story-alice', question: 'What was Alice tired of?', options: ['Running errands', 'Sitting by her sister on the bank', 'Doing homework', 'Walking in the garden'], correctIndex: 1 },
  { id: 'q-story-alice-2', categoryKey: 'story', textId: 'story-alice', question: "What did Alice's sister's book lack?", options: ['A cover', 'Pictures or conversations', 'Page numbers', 'An author name'], correctIndex: 1 },
  { id: 'q-story-alice-3', categoryKey: 'story', textId: 'story-alice', question: 'What animal ran close by Alice?', options: ['A fox', 'A White Rabbit', 'A cat', 'A deer'], correctIndex: 1 },

  // ─── Story: Jungle Book ────────────────────────────────────
  { id: 'q-story-jungle-1', categoryKey: 'story', textId: 'story-jungle', question: 'What time was it when Father Wolf woke up?', options: ['Five o\'clock', 'Six o\'clock', 'Seven o\'clock', 'Eight o\'clock'], correctIndex: 2 },
  { id: 'q-story-jungle-2', categoryKey: 'story', textId: 'story-jungle', question: 'How many cubs did Mother Wolf have?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 2 },
  { id: 'q-story-jungle-3', categoryKey: 'story', textId: 'story-jungle', question: 'What shone into the mouth of the cave?', options: ['The sun', 'The moon', 'A fire', 'Starlight'], correctIndex: 1 },

  // ─── Article: Self-Reliance ────────────────────────────────
  { id: 'q-article-sr-1', categoryKey: 'article', textId: 'article-self-reliance', question: 'According to Emerson, what is envy?', options: ['Power', 'Ignorance', 'Motivation', 'Wisdom'], correctIndex: 1 },
  { id: 'q-article-sr-2', categoryKey: 'article', textId: 'article-self-reliance', question: 'What does Emerson call imitation?', options: ['Flattery', 'Suicide', 'Growth', 'Education'], correctIndex: 1 },
  { id: 'q-article-sr-3', categoryKey: 'article', textId: 'article-self-reliance', question: 'What can nourishing corn only come through?', options: ['Luck', 'Community', 'His own toil', 'Nature'], correctIndex: 2 },

  // ─── Speech: Gettysburg Address ────────────────────────────
  { id: 'q-speech-getty-1', categoryKey: 'speech', textId: 'speech-gettysburg', question: 'How many years ago does Lincoln reference?', options: ['Fifty-seven', 'Sixty-seven', 'Seventy-seven', 'Eighty-seven'], correctIndex: 3 },
  { id: 'q-speech-getty-2', categoryKey: 'speech', textId: 'speech-gettysburg', question: 'What was the nation dedicated to?', options: ['Liberty and justice', 'The proposition that all men are created equal', 'Peace and prosperity', 'Independence from tyranny'], correctIndex: 1 },
  { id: 'q-speech-getty-3', categoryKey: 'speech', textId: 'speech-gettysburg', question: 'What was the nation engaged in?', options: ['A revolution', 'A great civil war', 'Building westward', 'A trade dispute'], correctIndex: 1 },

  // ─── Speech: FDR ───────────────────────────────────────────
  { id: 'q-speech-fdr-1', categoryKey: 'speech', textId: 'speech-fdr', question: 'What did FDR say is the only thing to fear?', options: ['War', 'Poverty', 'Fear itself', 'Failure'], correctIndex: 2 },
  { id: 'q-speech-fdr-2', categoryKey: 'speech', textId: 'speech-fdr', question: 'What does FDR say this great Nation will do?', options: ['Collapse', 'Endure, revive and prosper', 'Retreat', 'Surrender'], correctIndex: 1 },
  { id: 'q-speech-fdr-3', categoryKey: 'speech', textId: 'speech-fdr', question: 'What does FDR say is preeminently the time for?', options: ['Action', 'Silence', 'Speaking the truth', 'Prayer'], correctIndex: 2 },

  // ─── Philosophy: Meditations ───────────────────────────────
  { id: 'q-phil-med-1', categoryKey: 'philosophy', textId: 'philosophy-meditations', question: 'What should you think of when you arise in the morning?', options: ['Your tasks', 'The precious privilege of being alive', 'Yesterday\'s mistakes', 'The weather'], correctIndex: 1 },
  { id: 'q-phil-med-2', categoryKey: 'philosophy', textId: 'philosophy-meditations', question: 'What does the happiness of your life depend upon?', options: ['Your wealth', 'Your friends', 'The quality of your thoughts', 'Your health'], correctIndex: 2 },
  { id: 'q-phil-med-3', categoryKey: 'philosophy', textId: 'philosophy-meditations', question: 'What does Marcus Aurelius say is needed for a happy life?', options: ['Great wealth', 'Many friends', 'Very little', 'Political power'], correctIndex: 2 },

  // ─── Philosophy: Seneca ────────────────────────────────────
  { id: 'q-phil-sen-1', categoryKey: 'philosophy', textId: 'philosophy-seneca', question: 'What does Seneca say about the length of life?', options: ['It is too short', 'It is long enough', 'It is unpredictable', 'It is meaningless'], correctIndex: 1 },
  { id: 'q-phil-sen-2', categoryKey: 'philosophy', textId: 'philosophy-seneca', question: 'What does Seneca say we waste?', options: ['Money', 'A great deal of life', 'Our youth', 'Our talent'], correctIndex: 1 },
  { id: 'q-phil-sen-3', categoryKey: 'philosophy', textId: 'philosophy-seneca', question: "What forces us to realize life has passed?", options: ['Old age', 'Illness', "Death's final constraint", 'Regret'], correctIndex: 2 },

  // ─── Science: Origin of Species ────────────────────────────
  { id: 'q-sci-origin-1', categoryKey: 'science', textId: 'science-origin', question: 'What ship was Darwin on?', options: ['HMS Victory', 'HMS Beagle', 'HMS Endeavour', 'HMS Discovery'], correctIndex: 1 },
  { id: 'q-sci-origin-2', categoryKey: 'science', textId: 'science-origin', question: 'What continent struck Darwin with certain facts?', options: ['Africa', 'Asia', 'South America', 'Australia'], correctIndex: 2 },
  { id: 'q-sci-origin-3', categoryKey: 'science', textId: 'science-origin', question: 'What does Darwin call the origin of species?', options: ['A simple question', 'A mystery of mysteries', 'An obvious fact', 'A divine plan'], correctIndex: 1 },

  // ─── Literature: Moby Dick ─────────────────────────────────
  { id: 'q-lit-moby-1', categoryKey: 'literature', textId: 'literature-moby-dick', question: 'What is the famous opening line?', options: ['Call me Ahab', 'Call me Ishmael', 'Call me Captain', 'Call me a sailor'], correctIndex: 1 },
  { id: 'q-lit-moby-2', categoryKey: 'literature', textId: 'literature-moby-dick', question: 'What did the narrator have little of?', options: ['Time', 'Friends', 'Money', 'Patience'], correctIndex: 2 },
  { id: 'q-lit-moby-3', categoryKey: 'literature', textId: 'literature-moby-dick', question: 'What does he do to drive off the spleen?', options: ['Read books', 'Sail about', 'Visit friends', 'Take walks'], correctIndex: 1 },

  // ─── Literature: Great Gatsby ──────────────────────────────
  { id: 'q-lit-gatsby-1', categoryKey: 'literature', textId: 'literature-gatsby', question: 'Who gave the narrator advice?', options: ['His mother', 'His father', 'His teacher', 'A stranger'], correctIndex: 1 },
  { id: 'q-lit-gatsby-2', categoryKey: 'literature', textId: 'literature-gatsby', question: 'What should you remember when criticizing anyone?', options: ['Be kind', 'Not everyone has had your advantages', 'Walk in their shoes', 'Silence is golden'], correctIndex: 1 },

  // ─── Poetry: Sonnet 18 ─────────────────────────────────────
  { id: 'q-poetry-s18-1', categoryKey: 'poetry', textId: 'poetry-sonnet18', question: "What does Shakespeare compare the subject to?", options: ["A winter's night", "A summer's day", "A spring morning", "An autumn leaf"], correctIndex: 1 },
  { id: 'q-poetry-s18-2', categoryKey: 'poetry', textId: 'poetry-sonnet18', question: 'What do rough winds shake?', options: ['The autumn leaves', 'The darling buds of May', 'The winter branches', 'The summer flowers'], correctIndex: 1 },

  // ─── Poetry: Dickinson ─────────────────────────────────────
  { id: 'q-poetry-dick-1', categoryKey: 'poetry', textId: 'poetry-dickinson', question: 'What is hope compared to?', options: ['A ship', 'A flame', 'A thing with feathers', 'A star'], correctIndex: 2 },
  { id: 'q-poetry-dick-2', categoryKey: 'poetry', textId: 'poetry-dickinson', question: 'Where does hope perch?', options: ['In the sky', 'In the soul', 'On a branch', 'In the heart'], correctIndex: 1 },
  { id: 'q-poetry-dick-3', categoryKey: 'poetry', textId: 'poetry-dickinson', question: 'What has hope never asked?', options: ['For shelter', 'For company', 'A crumb', 'For peace'], correctIndex: 2 },

  // ─── History: Herodotus ────────────────────────────────────
  { id: 'q-hist-hero-1', categoryKey: 'history', textId: 'history-herodotus', question: 'Where was Herodotus from?', options: ['Athens', 'Sparta', 'Halicarnassus', 'Rome'], correctIndex: 2 },
  { id: 'q-hist-hero-2', categoryKey: 'history', textId: 'history-herodotus', question: 'What did Herodotus hope to preserve from decay?', options: ['Art', 'The remembrance of what men have done', 'Ancient temples', 'Language'], correctIndex: 1 },
  { id: 'q-hist-hero-3', categoryKey: 'history', textId: 'history-herodotus', question: 'Who began the quarrel, according to the Persians?', options: ['The Greeks', 'The Egyptians', 'The Phoenicians', 'The Romans'], correctIndex: 2 },

  // ─── Mindfulness: Tao Te Ching ─────────────────────────────
  { id: 'q-mind-tao-1', categoryKey: 'mindfulness', textId: 'mindfulness-tao', question: 'What is the nameless called?', options: ['The end of all things', 'The beginning of heaven and earth', 'The source of confusion', 'The path of wisdom'], correctIndex: 1 },
  { id: 'q-mind-tao-2', categoryKey: 'mindfulness', textId: 'mindfulness-tao', question: 'What can the desireless see?', options: ['The future', 'The mystery', 'The manifestations', 'Nothing'], correctIndex: 1 },
  { id: 'q-mind-tao-3', categoryKey: 'mindfulness', textId: 'mindfulness-tao', question: 'What is the gate to all mystery?', options: ['Light', 'Silence', 'Darkness within darkness', 'Time'], correctIndex: 2 },
];

export function getQuizForText(
  categoryKey: string,
  textId: string,
  count?: number,
): QuizQuestion[] {
  const matching = quizQuestions.filter(
    (q) => q.categoryKey === categoryKey && q.textId === textId,
  );
  if (count && count < matching.length) {
    const shuffled = [...matching].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  return matching;
}
