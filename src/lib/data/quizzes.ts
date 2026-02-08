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
  { id: 'q-article-sr-1', categoryKey: 'essay', textId: 'article-self-reliance', question: 'According to Emerson, what is envy?', options: ['Power', 'Ignorance', 'Motivation', 'Wisdom'], correctIndex: 1 },
  { id: 'q-article-sr-2', categoryKey: 'essay', textId: 'article-self-reliance', question: 'What does Emerson call imitation?', options: ['Flattery', 'Suicide', 'Growth', 'Education'], correctIndex: 1 },
  { id: 'q-article-sr-3', categoryKey: 'essay', textId: 'article-self-reliance', question: 'What can nourishing corn only come through?', options: ['Luck', 'Community', 'His own toil', 'Nature'], correctIndex: 2 },

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
  { id: 'q-lit-moby-1', categoryKey: 'fiction', textId: 'literature-moby-dick', question: 'What is the famous opening line?', options: ['Call me Ahab', 'Call me Ishmael', 'Call me Captain', 'Call me a sailor'], correctIndex: 1 },
  { id: 'q-lit-moby-2', categoryKey: 'fiction', textId: 'literature-moby-dick', question: 'What did the narrator have little of?', options: ['Time', 'Friends', 'Money', 'Patience'], correctIndex: 2 },
  { id: 'q-lit-moby-3', categoryKey: 'fiction', textId: 'literature-moby-dick', question: 'What does he do to drive off the spleen?', options: ['Read books', 'Sail about', 'Visit friends', 'Take walks'], correctIndex: 1 },

  // ─── Literature: Great Gatsby ──────────────────────────────
  { id: 'q-lit-gatsby-1', categoryKey: 'fiction', textId: 'literature-gatsby', question: 'Who gave the narrator advice?', options: ['His mother', 'His father', 'His teacher', 'A stranger'], correctIndex: 1 },
  { id: 'q-lit-gatsby-2', categoryKey: 'fiction', textId: 'literature-gatsby', question: 'What should you remember when criticizing anyone?', options: ['Be kind', 'Not everyone has had your advantages', 'Walk in their shoes', 'Silence is golden'], correctIndex: 1 },

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
  { id: 'q-mind-tao-1', categoryKey: 'wisdom', textId: 'mindfulness-tao', question: 'What is the nameless called?', options: ['The end of all things', 'The beginning of heaven and earth', 'The source of confusion', 'The path of wisdom'], correctIndex: 1 },
  { id: 'q-mind-tao-2', categoryKey: 'wisdom', textId: 'mindfulness-tao', question: 'What can the desireless see?', options: ['The future', 'The mystery', 'The manifestations', 'Nothing'], correctIndex: 1 },
  { id: 'q-mind-tao-3', categoryKey: 'wisdom', textId: 'mindfulness-tao', question: 'What is the gate to all mystery?', options: ['Light', 'Silence', 'Darkness within darkness', 'Time'], correctIndex: 2 },

  // ─── Article: The Science of Reading Aloud ──────────────────
  { id: 'q-article-reading-1', categoryKey: 'essay', textId: 'article-reading', question: 'What does reading aloud strengthen?', options: ['Vocal cords', 'The connection between eye and brain', 'Memory alone', 'Physical endurance'], correctIndex: 1 },
  { id: 'q-article-reading-2', categoryKey: 'essay', textId: 'article-reading', question: 'What does speaking words activate?', options: ['Shallow memory', 'Deeper memory pathways', 'Only short-term recall', 'Visual processing'], correctIndex: 1 },
  { id: 'q-article-reading-3', categoryKey: 'essay', textId: 'article-reading', question: 'What can this practice improve over time?', options: ['Only speed', 'Focus, vocabulary, and comprehension', 'Just pronunciation', 'Writing skills only'], correctIndex: 1 },

  // ─── Article: Civil Disobedience ────────────────────────────
  { id: 'q-article-civil-1', categoryKey: 'essay', textId: 'article-civil-disobedience', question: 'What motto does Thoreau accept?', options: ['Power to the people', 'That government is best which governs least', 'Liberty or death', 'United we stand'], correctIndex: 1 },
  { id: 'q-article-civil-2', categoryKey: 'essay', textId: 'article-civil-disobedience', question: 'What does Thoreau call government at best?', options: ['A necessity', 'An expedient', 'A blessing', 'A burden'], correctIndex: 1 },
  { id: 'q-article-civil-3', categoryKey: 'essay', textId: 'article-civil-disobedience', question: 'What does Thoreau believe about most governments?', options: ['They are perfect', 'They are usually inexpedient', 'They are always just', 'They are divine'], correctIndex: 1 },

  // ─── Speech: Declaration of Independence ────────────────────
  { id: 'q-speech-decl-1', categoryKey: 'speech', textId: 'speech-declaration', question: 'What do we hold to be self-evident?', options: ['That kings rule by divine right', 'That all men are created equal', 'That government is supreme', 'That freedom is earned'], correctIndex: 1 },
  { id: 'q-speech-decl-2', categoryKey: 'speech', textId: 'speech-declaration', question: 'Who endows men with unalienable rights?', options: ['The government', 'Their Creator', 'The king', 'Themselves'], correctIndex: 1 },
  { id: 'q-speech-decl-3', categoryKey: 'speech', textId: 'speech-declaration', question: 'What are among the unalienable rights?', options: ['Wealth and power', 'Life, Liberty and the pursuit of Happiness', 'Land and property', 'Fame and fortune'], correctIndex: 1 },

  // ─── Speech: Give Me Liberty ────────────────────────────────
  { id: 'q-speech-liberty-1', categoryKey: 'speech', textId: 'speech-liberty', question: 'What does Patrick Henry ask if life is so dear to be purchased at?', options: ['Any cost', 'The price of chains and slavery', 'Gold and silver', 'Honor'], correctIndex: 1 },
  { id: 'q-speech-liberty-2', categoryKey: 'speech', textId: 'speech-liberty', question: 'What does Henry demand?', options: ['Peace at any cost', 'Liberty or death', 'Negotiation', 'Patience'], correctIndex: 1 },
  { id: 'q-speech-liberty-3', categoryKey: 'speech', textId: 'speech-liberty', question: 'Who does Henry ask to forbid slavery?', options: ['The king', 'Congress', 'Almighty God', 'The people'], correctIndex: 2 },

  // ─── Philosophy: Ancient Wisdom ─────────────────────────────
  { id: 'q-phil-wisdom-1', categoryKey: 'philosophy', textId: 'philosophy-wisdom', question: 'What is not worth living according to ancient wisdom?', options: ['A poor life', 'The unexamined life', 'A short life', 'A lonely life'], correctIndex: 1 },
  { id: 'q-phil-wisdom-2', categoryKey: 'philosophy', textId: 'philosophy-wisdom', question: 'What is excellence according to this text?', options: ['A single act', 'A gift', 'A habit', 'A reward'], correctIndex: 2 },
  { id: 'q-phil-wisdom-3', categoryKey: 'philosophy', textId: 'philosophy-wisdom', question: 'What does happiness depend upon?', options: ['Wealth', 'Others', 'Ourselves', 'Luck'], correctIndex: 2 },

  // ─── Science: On Curiosity and Discovery ────────────────────
  { id: 'q-sci-curie-1', categoryKey: 'science', textId: 'science-curie', question: 'What should we do with things we fear?', options: ['Avoid them', 'Understand them', 'Ignore them', 'Fight them'], correctIndex: 1 },
  { id: 'q-sci-curie-2', categoryKey: 'science', textId: 'science-curie', question: 'How is a scientist in a laboratory described?', options: ['A mere technician', 'A child before natural phenomena', 'A boring worker', 'An artist'], correctIndex: 1 },
  { id: 'q-sci-curie-3', categoryKey: 'science', textId: 'science-curie', question: 'What must we believe we are gifted for?', options: ['Nothing', 'Everything', 'Something specific', 'Only science'], correctIndex: 2 },

  // ─── Science: Eureka ────────────────────────────────────────
  { id: 'q-sci-eureka-1', categoryKey: 'science', textId: 'science-eureka', question: 'What does Poe design to speak of?', options: ['Poetry only', 'The Material and Spiritual Universe', 'Mathematics only', 'History'], correctIndex: 1 },
  { id: 'q-sci-eureka-2', categoryKey: 'science', textId: 'science-eureka', question: 'Where does the Secondary Cause of All Things lie?', options: ['In the future', 'In the Original Unity', 'In chaos', 'In humanity'], correctIndex: 1 },
  { id: 'q-sci-eureka-3', categoryKey: 'science', textId: 'science-eureka', question: 'What does Poe call the Universe?', options: ['A mistake', 'A plot of God', 'An accident', 'A mystery'], correctIndex: 1 },

  // ─── Literature: Romeo and Juliet ───────────────────────────
  { id: 'q-lit-romeo-1', categoryKey: 'fiction', textId: 'literature-romeo-juliet', question: 'Where is the play set?', options: ['Rome', 'Venice', 'Fair Verona', 'Florence'], correctIndex: 2 },
  { id: 'q-lit-romeo-2', categoryKey: 'fiction', textId: 'literature-romeo-juliet', question: 'How many households are mentioned?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 1 },
  { id: 'q-lit-romeo-3', categoryKey: 'fiction', textId: 'literature-romeo-juliet', question: 'What kind of lovers are Romeo and Juliet called?', options: ['Lucky', 'Star-crossed', 'Happy', 'Wealthy'], correctIndex: 1 },

  // ─── Poetry: The Road Not Taken ─────────────────────────────
  { id: 'q-poetry-road-1', categoryKey: 'poetry', textId: 'poetry-road', question: 'Where did the two roads diverge?', options: ['In a dark forest', 'In a yellow wood', 'By the sea', 'In the mountains'], correctIndex: 1 },
  { id: 'q-poetry-road-2', categoryKey: 'poetry', textId: 'poetry-road', question: 'Why was the speaker sorry?', options: ['The road was long', 'He could not travel both', 'It was raining', 'He was lost'], correctIndex: 1 },
  { id: 'q-poetry-road-3', categoryKey: 'poetry', textId: 'poetry-road', question: 'When will the speaker tell this story?', options: ['Tomorrow', 'Never', 'Ages and ages hence', 'Today'], correctIndex: 2 },

  // ─── Poetry: I Hear America Singing ─────────────────────────
  { id: 'q-poetry-whitman-1', categoryKey: 'poetry', textId: 'poetry-whitman', question: 'What does Whitman hear America doing?', options: ['Crying', 'Singing', 'Sleeping', 'Fighting'], correctIndex: 1 },
  { id: 'q-poetry-whitman-2', categoryKey: 'poetry', textId: 'poetry-whitman', question: 'How do the mechanics sing?', options: ['Softly', 'Blithe and strong', 'Sadly', 'Quietly'], correctIndex: 1 },
  { id: 'q-poetry-whitman-3', categoryKey: 'poetry', textId: 'poetry-whitman', question: 'What does the carpenter measure?', options: ['His time', 'His plank or beam', 'His wealth', 'His steps'], correctIndex: 1 },

  // ─── History: The Story of Civilization ─────────────────────
  { id: 'q-hist-civ-1', categoryKey: 'history', textId: 'history-civilization', question: 'What was there in the beginning?', options: ['Everything', 'Nothing', 'Light', 'People'], correctIndex: 1 },
  { id: 'q-hist-civ-2', categoryKey: 'history', textId: 'history-civilization', question: 'What is history according to this text?', options: ['The past only', 'The present', 'Forgotten', 'Unimportant'], correctIndex: 1 },
  { id: 'q-hist-civ-3', categoryKey: 'history', textId: 'history-civilization', question: 'What do we carry with us?', options: ['Nothing', 'Our history', 'Only hope', 'Only regret'], correctIndex: 1 },

  // ─── History: Declaration Full Preamble ─────────────────────
  { id: 'q-hist-decl-1', categoryKey: 'history', textId: 'history-declaration-full', question: 'What becomes necessary in the course of human events?', options: ['War', 'To dissolve political bands', 'Celebration', 'Trade'], correctIndex: 1 },
  { id: 'q-hist-decl-2', categoryKey: 'history', textId: 'history-declaration-full', question: 'What requires a decent respect to the opinions of mankind?', options: ['Silence', 'Declaring the causes for separation', 'Obedience', 'Patience'], correctIndex: 1 },
  { id: 'q-hist-decl-3', categoryKey: 'history', textId: 'history-declaration-full', question: 'What entitles people to a separate and equal station?', options: ['Military power', 'The Laws of Nature', 'Wealth', 'Popular vote'], correctIndex: 1 },

  // ─── Mindfulness: On Presence ───────────────────────────────
  { id: 'q-mind-presence-1', categoryKey: 'wisdom', textId: 'mindfulness-presence', question: 'What is the first instruction?', options: ['Think', 'Breathe', 'Run', 'Speak'], correctIndex: 1 },
  { id: 'q-mind-presence-2', categoryKey: 'wisdom', textId: 'mindfulness-presence', question: 'Where does peace come from?', options: ['Outside', 'Within', 'Others', 'Possessions'], correctIndex: 1 },
  { id: 'q-mind-presence-3', categoryKey: 'wisdom', textId: 'mindfulness-presence', question: 'What do you become according to this text?', options: ['What you eat', 'What you think', 'What you own', 'What you see'], correctIndex: 1 },

  // ─── Mindfulness: On Calm and Presence ──────────────────────
  { id: 'q-mind-calm-1', categoryKey: 'wisdom', textId: 'mindfulness-meditations-calm', question: 'What do you have power over?', options: ['Outside events', 'Your mind', 'Other people', 'The weather'], correctIndex: 1 },
  { id: 'q-mind-calm-2', categoryKey: 'wisdom', textId: 'mindfulness-meditations-calm', question: 'What does the soul become dyed with?', options: ['Experience', 'The color of its thoughts', 'Time', 'Actions'], correctIndex: 1 },
  { id: 'q-mind-calm-3', categoryKey: 'wisdom', textId: 'mindfulness-meditations-calm', question: 'What should you waste no more time on?', options: ['Sleep', 'Arguing what a good person should be', 'Work', 'Reading'], correctIndex: 1 },

  // ═══════════════════════════════════════════════════════════════
  // NEW CONTENT QUIZZES
  // ═══════════════════════════════════════════════════════════════

  // ─── Story: The Fox and the Grapes ────────────────────────────
  { id: 'q-story-fox-1', categoryKey: 'story', textId: 'story-fox-grapes', question: 'What did the Fox see hanging from the tree?', options: ['Apples', 'Ripe grapes', 'Pears', 'Cherries'], correctIndex: 1 },
  { id: 'q-story-fox-2', categoryKey: 'story', textId: 'story-fox-grapes', question: 'What did the Fox do to try to reach them?', options: ['Climbed the tree', 'Jumped for them', 'Asked for help', 'Shook the tree'], correctIndex: 1 },
  { id: 'q-story-fox-3', categoryKey: 'story', textId: 'story-fox-grapes', question: 'What did the Fox say when he gave up?', options: ['"Too high"', '"I am sure they are sour"', '"Maybe tomorrow"', '"Not worth it"'], correctIndex: 1 },

  // ─── Story: The Ant and the Grasshopper ───────────────────────
  { id: 'q-story-ant-1', categoryKey: 'story', textId: 'story-ant-grasshopper', question: 'What was the Grasshopper doing in summer?', options: ['Working', 'Sleeping', 'Chirping and singing', 'Eating'], correctIndex: 2 },
  { id: 'q-story-ant-2', categoryKey: 'story', textId: 'story-ant-grasshopper', question: 'What was the Ant carrying?', options: ['Water', 'An ear of corn', 'A leaf', 'Wood'], correctIndex: 1 },
  { id: 'q-story-ant-3', categoryKey: 'story', textId: 'story-ant-grasshopper', question: 'What happened to the Grasshopper in winter?', options: ['He thrived', 'He found food', 'He was dying of hunger', 'He moved south'], correctIndex: 2 },

  // ─── Story: The Lion and the Mouse ────────────────────────────
  { id: 'q-story-lion-1', categoryKey: 'story', textId: 'story-lion-mouse', question: 'What woke the Lion?', options: ['A loud noise', 'A Mouse running on him', 'Thunder', 'Another animal'], correctIndex: 1 },
  { id: 'q-story-lion-2', categoryKey: 'story', textId: 'story-lion-mouse', question: 'Why did the Lion let the Mouse go?', options: ['He was full', 'The Mouse\'s promise amused him', 'He felt sorry', 'The Mouse escaped'], correctIndex: 1 },
  { id: 'q-story-lion-3', categoryKey: 'story', textId: 'story-lion-mouse', question: 'How did the Mouse help the Lion?', options: ['Brought food', 'Gnawed the rope to free him', 'Called for help', 'Scared the hunters'], correctIndex: 1 },

  // ─── Story: The Wizard of Oz ──────────────────────────────────
  { id: 'q-story-oz-1', categoryKey: 'story', textId: 'story-wizard-oz', question: 'Where did Dorothy live?', options: ['California', 'Kansas prairies', 'New York', 'Texas'], correctIndex: 1 },
  { id: 'q-story-oz-2', categoryKey: 'story', textId: 'story-wizard-oz', question: 'Who did Dorothy live with?', options: ['Her parents', 'Uncle Henry and Aunt Em', 'Grandparents', 'Alone'], correctIndex: 1 },
  { id: 'q-story-oz-3', categoryKey: 'story', textId: 'story-wizard-oz', question: 'What was their house like?', options: ['Large mansion', 'Small, one room', 'Farm cottage', 'City apartment'], correctIndex: 1 },

  // ─── Story: A Christmas Carol ─────────────────────────────────
  { id: 'q-story-xmas-1', categoryKey: 'story', textId: 'story-christmas-carol', question: 'What is stated first about Marley?', options: ['He was rich', 'He was dead', 'He was kind', 'He was young'], correctIndex: 1 },
  { id: 'q-story-xmas-2', categoryKey: 'story', textId: 'story-christmas-carol', question: 'What was Marley compared to?', options: ['A ghost', 'A door-nail', 'A shadow', 'A statue'], correctIndex: 1 },
  { id: 'q-story-xmas-3', categoryKey: 'story', textId: 'story-christmas-carol', question: 'What was the relationship between Scrooge and Marley?', options: ['Brothers', 'Partners', 'Enemies', 'Strangers'], correctIndex: 1 },

  // ─── Story: Sherlock Holmes ───────────────────────────────────
  { id: 'q-story-sherlock-1', categoryKey: 'story', textId: 'story-sherlock', question: 'What degree did the narrator take in 1878?', options: ['Law', 'Doctor of Medicine', 'Engineering', 'Philosophy'], correctIndex: 1 },
  { id: 'q-story-sherlock-2', categoryKey: 'story', textId: 'story-sherlock', question: 'What regiment was the narrator attached to?', options: ['Royal Guards', 'Fifth Northumberland Fusiliers', 'London Brigade', 'Scottish Highlanders'], correctIndex: 1 },
  { id: 'q-story-sherlock-3', categoryKey: 'story', textId: 'story-sherlock', question: 'What war had broken out?', options: ['The Boer War', 'The second Afghan war', 'The Crimean War', 'World War I'], correctIndex: 1 },

  // ─── Story: Treasure Island ───────────────────────────────────
  { id: 'q-story-treasure-1', categoryKey: 'story', textId: 'story-treasure-island', question: 'What inn did the narrator\'s father keep?', options: ['The Sailor\'s Rest', 'The Admiral Benbow', 'The Golden Anchor', 'The Sea Dog'], correctIndex: 1 },
  { id: 'q-story-treasure-2', categoryKey: 'story', textId: 'story-treasure-island', question: 'What did the old seaman have on his face?', options: ['A scar', 'A sabre cut', 'A tattoo', 'A beard'], correctIndex: 1 },
  { id: 'q-story-treasure-3', categoryKey: 'story', textId: 'story-treasure-island', question: 'Why is the island\'s location kept secret?', options: ['It\'s dangerous', 'Treasure not yet lifted', 'Pirates guard it', 'Legal reasons'], correctIndex: 1 },

  // ─── Story: Cinderella ────────────────────────────────────────
  { id: 'q-story-cinder-1', categoryKey: 'story', textId: 'story-grimm-cinderella', question: 'What did the mother tell her daughter to be?', options: ['Beautiful', 'Good and pious', 'Strong', 'Wealthy'], correctIndex: 1 },
  { id: 'q-story-cinder-2', categoryKey: 'story', textId: 'story-grimm-cinderella', question: 'Where did the maiden go every day?', options: ['To the market', 'To her mother\'s grave', 'To church', 'To the forest'], correctIndex: 1 },
  { id: 'q-story-cinder-3', categoryKey: 'story', textId: 'story-grimm-cinderella', question: 'How did the maiden remain?', options: ['Sad and bitter', 'Pious and good', 'Angry', 'Forgotten'], correctIndex: 1 },

  // ─── Story: The Ugly Duckling ─────────────────────────────────
  { id: 'q-story-duckling-1', categoryKey: 'story', textId: 'story-ugly-duckling', question: 'What season was it?', options: ['Spring', 'Summer', 'Autumn', 'Winter'], correctIndex: 1 },
  { id: 'q-story-duckling-2', categoryKey: 'story', textId: 'story-ugly-duckling', question: 'What bird was walking on long red legs?', options: ['Flamingo', 'Crane', 'Stork', 'Heron'], correctIndex: 2 },
  { id: 'q-story-duckling-3', categoryKey: 'story', textId: 'story-ugly-duckling', question: 'What language did the stork speak?', options: ['Bird language', 'Egyptian', 'Greek', 'Danish'], correctIndex: 1 },

  // ─── Story: Rip Van Winkle ────────────────────────────────────
  { id: 'q-story-rip-1', categoryKey: 'story', textId: 'story-rip-van-winkle', question: 'What river must one voyage up?', options: ['The Mississippi', 'The Hudson', 'The Delaware', 'The Potomac'], correctIndex: 1 },
  { id: 'q-story-rip-2', categoryKey: 'story', textId: 'story-rip-van-winkle', question: 'What mountains are mentioned?', options: ['The Rockies', 'The Adirondacks', 'The Kaatskill', 'The Green Mountains'], correctIndex: 2 },
  { id: 'q-story-rip-3', categoryKey: 'story', textId: 'story-rip-van-winkle', question: 'What changes the mountains\' appearance?', options: ['Only storms', 'Season, weather, time of day', 'Nothing', 'Human activity'], correctIndex: 1 },

  // ─── Story: Sleepy Hollow ─────────────────────────────────────
  { id: 'q-story-sleepy-1', categoryKey: 'story', textId: 'story-legend-sleepy', question: 'What did Dutch navigators call the river expansion?', options: ['The Wide Water', 'The Tappan Zee', 'The Great Bay', 'The Dutch Harbor'], correctIndex: 1 },
  { id: 'q-story-sleepy-2', categoryKey: 'story', textId: 'story-legend-sleepy', question: 'What is the little valley described as?', options: ['Noisy', 'One of the quietest places', 'Dangerous', 'Crowded'], correctIndex: 1 },
  { id: 'q-story-sleepy-3', categoryKey: 'story', textId: 'story-legend-sleepy', question: 'How far is the valley from Tarry Town?', options: ['One mile', 'About two miles', 'Five miles', 'Ten miles'], correctIndex: 1 },

  // ─── Article: Walden ──────────────────────────────────────────
  { id: 'q-article-walden-1', categoryKey: 'essay', textId: 'article-walden', question: 'Why did Thoreau go to the woods?', options: ['To hide', 'To live deliberately', 'To hunt', 'To write'], correctIndex: 1 },
  { id: 'q-article-walden-2', categoryKey: 'essay', textId: 'article-walden', question: 'What did Thoreau want to avoid discovering when he died?', options: ['Poverty', 'That he had not lived', 'Loneliness', 'Failure'], correctIndex: 1 },
  { id: 'q-article-walden-3', categoryKey: 'essay', textId: 'article-walden', question: 'What did Thoreau want from life?', options: ['Wealth', 'The marrow of life', 'Fame', 'Comfort'], correctIndex: 1 },

  // ─── Article: Nature ──────────────────────────────────────────
  { id: 'q-article-nature-1', categoryKey: 'essay', textId: 'article-nature', question: 'What should a man look at to be truly alone?', options: ['The ground', 'The stars', 'The ocean', 'A mountain'], correctIndex: 1 },
  { id: 'q-article-nature-2', categoryKey: 'essay', textId: 'article-nature', question: 'What gives man the perpetual presence of the sublime?', options: ['Art', 'The heavenly bodies', 'Music', 'Books'], correctIndex: 1 },
  { id: 'q-article-nature-3', categoryKey: 'essay', textId: 'article-nature', question: 'What does solitude require retiring from?', options: ['Work only', 'Both chamber and society', 'People only', 'Nature'], correctIndex: 1 },

  // ─── Article: Franklin Virtue ─────────────────────────────────
  { id: 'q-article-franklin-1', categoryKey: 'essay', textId: 'article-franklin-virtue', question: 'What taxes us twice as much as government taxes?', options: ['Food', 'Our idleness', 'Our friends', 'Weather'], correctIndex: 1 },
  { id: 'q-article-franklin-2', categoryKey: 'essay', textId: 'article-franklin-virtue', question: 'What taxes us four times as much?', options: ['Pride', 'Envy', 'Our folly', 'Greed'], correctIndex: 2 },
  { id: 'q-article-franklin-3', categoryKey: 'essay', textId: 'article-franklin-virtue', question: 'Who cannot ease us from these self-imposed taxes?', options: ['Friends', 'Family', 'The commissioners', 'Banks'], correctIndex: 2 },

  // ─── Article: Twain Advice ────────────────────────────────────
  { id: 'q-article-twain-1', categoryKey: 'essay', textId: 'article-twain-advice', question: 'What kind of talk was Twain asked to give?', options: ['Funny', 'Something suitable to youth', 'Political', 'Historical'], correctIndex: 1 },
  { id: 'q-article-twain-2', categoryKey: 'essay', textId: 'article-twain-advice', question: 'What had Twain longed to do?', options: ['Travel', 'Say things for instruction of the young', 'Write more', 'Retire'], correctIndex: 1 },
  { id: 'q-article-twain-3', categoryKey: 'essay', textId: 'article-twain-advice', question: 'When do such things take root best?', options: ['In old age', 'In tender early years', 'In middle age', 'Never'], correctIndex: 1 },

  // ─── Article: Experience ──────────────────────────────────────
  { id: 'q-article-exp-1', categoryKey: 'essay', textId: 'article-experience', question: 'Where do we find ourselves according to Emerson?', options: ['In a garden', 'On a stair', 'In a room', 'On a path'], correctIndex: 1 },
  { id: 'q-article-exp-2', categoryKey: 'essay', textId: 'article-experience', question: 'What lingers about our eyes all our lifetime?', options: ['Dust', 'Sleep', 'Light', 'Tears'], correctIndex: 1 },
  { id: 'q-article-exp-3', categoryKey: 'essay', textId: 'article-experience', question: 'What do we not know about the series of stairs?', options: ['Their color', 'The extremes', 'Their width', 'Their material'], correctIndex: 1 },

  // ─── Article: Compensation ────────────────────────────────────
  { id: 'q-article-comp-1', categoryKey: 'essay', textId: 'article-compensation', question: 'Since when had Emerson wished to write on Compensation?', options: ['Recently', 'Since he was a boy', 'Since college', 'Since retirement'], correctIndex: 1 },
  { id: 'q-article-comp-2', categoryKey: 'essay', textId: 'article-compensation', question: 'Who knew more than the preachers taught?', options: ['Scholars', 'The people', 'Children', 'Artists'], correctIndex: 1 },
  { id: 'q-article-comp-3', categoryKey: 'essay', textId: 'article-compensation', question: 'What charmed his fancy?', options: ['Nature', 'The endless variety of documents', 'Music', 'Art'], correctIndex: 1 },

  // ─── Article: Friendship ──────────────────────────────────────
  { id: 'q-article-friend-1', categoryKey: 'essay', textId: 'article-friendship', question: 'What do we have more of than is ever spoken?', options: ['Money', 'Time', 'Kindness', 'Ideas'], correctIndex: 2 },
  { id: 'q-article-friend-2', categoryKey: 'essay', textId: 'article-friendship', question: 'What is the human family bathed with?', options: ['Light', 'An element of love', 'Music', 'Knowledge'], correctIndex: 1 },
  { id: 'q-article-friend-3', categoryKey: 'essay', textId: 'article-friendship', question: 'What chills the world like east winds?', options: ['Fear', 'Selfishness', 'Ignorance', 'Pride'], correctIndex: 1 },

  // ─── Article: Essay on Man ────────────────────────────────────
  { id: 'q-article-man-1', categoryKey: 'essay', textId: 'article-essay-man', question: 'What is the proper study of mankind?', options: ['God', 'Nature', 'Man', 'Stars'], correctIndex: 2 },
  { id: 'q-article-man-2', categoryKey: 'essay', textId: 'article-essay-man', question: 'Where is man placed?', options: ['At the top', 'On an isthmus of a middle state', 'At the bottom', 'In isolation'], correctIndex: 1 },
  { id: 'q-article-man-3', categoryKey: 'essay', textId: 'article-essay-man', question: 'What is man in doubt about?', options: ['His wealth', 'Whether to deem himself God or Beast', 'His friends', 'His home'], correctIndex: 1 },

  // ─── Article: Rights of Man ───────────────────────────────────
  { id: 'q-article-rights-1', categoryKey: 'essay', textId: 'article-rights-man', question: 'When can a country boast of its constitution?', options: ['When wealthy', 'When the poor are happy', 'When powerful', 'When large'], correctIndex: 1 },
  { id: 'q-article-rights-2', categoryKey: 'essay', textId: 'article-rights-man', question: 'What should be empty of prisoners?', options: ['Courts', 'Jails', 'Ships', 'Cities'], correctIndex: 1 },
  { id: 'q-article-rights-3', categoryKey: 'essay', textId: 'article-rights-man', question: 'What should the taxes not be?', options: ['Collected', 'Oppressive', 'Voluntary', 'Low'], correctIndex: 1 },

  // ─── Article: Common Sense ────────────────────────────────────
  { id: 'q-article-common-1', categoryKey: 'essay', textId: 'article-common-sense', question: 'What is society in every state?', options: ['A curse', 'A blessing', 'A burden', 'A mystery'], correctIndex: 1 },
  { id: 'q-article-common-2', categoryKey: 'essay', textId: 'article-common-sense', question: 'What is government in its best state?', options: ['Perfect', 'A necessary evil', 'Divine', 'Optional'], correctIndex: 1 },
  { id: 'q-article-common-3', categoryKey: 'essay', textId: 'article-common-sense', question: 'What heightens our calamity?', options: ['Nature', 'Reflecting we furnish the means of suffering', 'Weather', 'Enemies'], correctIndex: 1 },

  // ─── Article: Education ───────────────────────────────────────
  { id: 'q-article-edu-1', categoryKey: 'essay', textId: 'article-education', question: 'What is the duty and concern of parents?', options: ['Wealth', 'Well educating children', 'Fame', 'Property'], correctIndex: 1 },
  { id: 'q-article-edu-2', categoryKey: 'essay', textId: 'article-education', question: 'What depends on proper education?', options: ['Individual success only', 'The welfare and prosperity of the nation', 'Nothing much', 'Family honor'], correctIndex: 1 },
  { id: 'q-article-edu-3', categoryKey: 'essay', textId: 'article-education', question: 'What should everyone do according to Locke?', options: ['Ignore education', 'Lay it seriously to heart', 'Leave it to schools', 'Avoid thinking about it'], correctIndex: 1 },

  // ─── Article: Poor Richard ────────────────────────────────────
  { id: 'q-article-poor-1', categoryKey: 'essay', textId: 'article-poor-richard', question: 'What makes a man healthy, wealthy and wise?', options: ['Working hard', 'Early to bed and early to rise', 'Reading', 'Prayer'], correctIndex: 1 },
  { id: 'q-article-poor-2', categoryKey: 'essay', textId: 'article-poor-richard', question: 'What pays the best interest?', options: ['Gold', 'An investment in knowledge', 'Real estate', 'Savings'], correctIndex: 1 },
  { id: 'q-article-poor-3', categoryKey: 'essay', textId: 'article-poor-richard', question: 'What stinks after three days?', options: ['Milk', 'Fish and visitors', 'Bread', 'Flowers'], correctIndex: 1 },

  // ─── Article: Leisure ─────────────────────────────────────────
  { id: 'q-article-leisure-1', categoryKey: 'essay', textId: 'article-leisure', question: 'What saying was Russell brought up on?', options: ['Work hard', 'Satan finds mischief for idle hands', 'Early to bed', 'Knowledge is power'], correctIndex: 1 },
  { id: 'q-article-leisure-2', categoryKey: 'essay', textId: 'article-leisure', question: 'What revolution did Russell\'s opinions undergo?', options: ['Political', 'About work being excessive', 'Religious', 'Scientific'], correctIndex: 1 },
  { id: 'q-article-leisure-3', categoryKey: 'essay', textId: 'article-leisure', question: 'What does Russell think there is too much of?', options: ['Money', 'Work done in the world', 'Leisure', 'Food'], correctIndex: 1 },

  // ─── Article: Simplicity ──────────────────────────────────────
  { id: 'q-article-simple-1', categoryKey: 'essay', textId: 'article-simplicity', question: 'What are we apt to love but not deserve?', options: ['Money', 'Praise', 'Power', 'Friends'], correctIndex: 1 },
  { id: 'q-article-simple-2', categoryKey: 'essay', textId: 'article-simplicity', question: 'What is an able yet humble man compared to?', options: ['A star', 'A jewel worth a kingdom', 'A tree', 'A river'], correctIndex: 1 },
  { id: 'q-article-simple-3', categoryKey: 'essay', textId: 'article-simplicity', question: 'Who has a right to censure?', options: ['Everyone', 'Those who have a heart to help', 'No one', 'Only judges'], correctIndex: 1 },

  // ─── Speech: MLK Dream ────────────────────────────────────────
  { id: 'q-speech-mlk-1', categoryKey: 'speech', textId: 'speech-mlk-dream', question: 'What is the dream rooted in?', options: ['History', 'The American dream', 'Religion', 'Politics'], correctIndex: 1 },
  { id: 'q-speech-mlk-2', categoryKey: 'speech', textId: 'speech-mlk-dream', question: 'How does MLK want his children judged?', options: ['By their education', 'By the content of their character', 'By their wealth', 'By their status'], correctIndex: 1 },
  { id: 'q-speech-mlk-3', categoryKey: 'speech', textId: 'speech-mlk-dream', question: 'How many children does MLK mention?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 2 },

  // ─── Speech: Churchill Fight ──────────────────────────────────
  { id: 'q-speech-church-1', categoryKey: 'speech', textId: 'speech-churchill-fight', question: 'Where shall they fight?', options: ['Only in cities', 'On the beaches', 'Only at sea', 'Only in the air'], correctIndex: 1 },
  { id: 'q-speech-church-2', categoryKey: 'speech', textId: 'speech-churchill-fight', question: 'What shall they never do?', options: ['Rest', 'Surrender', 'Retreat', 'Sleep'], correctIndex: 1 },
  { id: 'q-speech-church-3', categoryKey: 'speech', textId: 'speech-churchill-fight', question: 'With what will they fight in the air?', options: ['Fear', 'Growing confidence and strength', 'Hesitation', 'Caution'], correctIndex: 1 },

  // ─── Speech: JFK Moon ─────────────────────────────────────────
  { id: 'q-speech-moon-1', categoryKey: 'speech', textId: 'speech-jfk-moon', question: 'When do we choose to go to the moon?', options: ['Next year', 'In this decade', 'Someday', 'Never'], correctIndex: 1 },
  { id: 'q-speech-moon-2', categoryKey: 'speech', textId: 'speech-jfk-moon', question: 'Why do we do these things?', options: ['Because they are easy', 'Because they are hard', 'Because we must', 'Because others did'], correctIndex: 1 },
  { id: 'q-speech-moon-3', categoryKey: 'speech', textId: 'speech-jfk-moon', question: 'What will the goal serve to do?', options: ['Make money', 'Organize and measure our best', 'Defeat enemies', 'Explore space'], correctIndex: 1 },

  // ─── Speech: JFK Inaugural ────────────────────────────────────
  { id: 'q-speech-jfk-1', categoryKey: 'speech', textId: 'speech-jfk-inaugural', question: 'What should Americans NOT ask?', options: ['For help', 'What country can do for them', 'Questions', 'For freedom'], correctIndex: 1 },
  { id: 'q-speech-jfk-2', categoryKey: 'speech', textId: 'speech-jfk-inaugural', question: 'What should citizens of the world ask?', options: ['For peace', 'What together we can do for freedom', 'For aid', 'For trade'], correctIndex: 1 },
  { id: 'q-speech-jfk-3', categoryKey: 'speech', textId: 'speech-jfk-inaugural', question: 'What standards does JFK ask of others?', options: ['Low', 'The same high standards he asks of us', 'Different', 'No standards'], correctIndex: 1 },

  // ─── Speech: Churchill Finest ─────────────────────────────────
  { id: 'q-speech-finest-1', categoryKey: 'speech', textId: 'speech-churchill-finest', question: 'What is about to begin?', options: ['Peace talks', 'The Battle of Britain', 'Negotiations', 'A treaty'], correctIndex: 1 },
  { id: 'q-speech-finest-2', categoryKey: 'speech', textId: 'speech-churchill-finest', question: 'What depends on this battle?', options: ['Trade', 'The survival of Christian civilization', 'Colonies', 'Reputation'], correctIndex: 1 },
  { id: 'q-speech-finest-3', categoryKey: 'speech', textId: 'speech-churchill-finest', question: 'What must Hitler do?', options: ['Negotiate', 'Break them in the Island', 'Retreat', 'Make peace'], correctIndex: 1 },

  // ─── Speech: Lincoln Second ───────────────────────────────────
  { id: 'q-speech-lincoln2-1', categoryKey: 'speech', textId: 'speech-lincoln-second', question: 'With what attitude toward all?', options: ['Anger', 'Malice toward none, charity for all', 'Suspicion', 'Indifference'], correctIndex: 1 },
  { id: 'q-speech-lincoln2-2', categoryKey: 'speech', textId: 'speech-lincoln-second', question: 'Whose wounds should be bound up?', options: ['Enemies\'', 'The nation\'s', 'Allies\'', 'Only soldiers\''], correctIndex: 1 },
  { id: 'q-speech-lincoln2-3', categoryKey: 'speech', textId: 'speech-lincoln-second', question: 'Who should be cared for?', options: ['Only the wounded', 'The widow and orphan', 'Only soldiers', 'Politicians'], correctIndex: 1 },

  // ─── Speech: Reagan Challenger ────────────────────────────────
  { id: 'q-speech-reagan-1', categoryKey: 'speech', textId: 'speech-reagan-challenger', question: 'How did the crew honor us?', options: ['By their words', 'By the manner they lived their lives', 'By their wealth', 'By their fame'], correctIndex: 1 },
  { id: 'q-speech-reagan-2', categoryKey: 'speech', textId: 'speech-reagan-challenger', question: 'What did they slip?', options: ['Away quietly', 'The surly bonds of earth', 'Into history', 'From memory'], correctIndex: 1 },
  { id: 'q-speech-reagan-3', categoryKey: 'speech', textId: 'speech-reagan-challenger', question: 'What did they touch?', options: ['The stars', 'The face of God', 'The moon', 'Space'], correctIndex: 1 },

  // ─── Speech: Mandela ──────────────────────────────────────────
  { id: 'q-speech-mandela-1', categoryKey: 'speech', textId: 'speech-mandela-inauguration', question: 'What have they achieved?', options: ['Wealth', 'Political emancipation', 'Victory in war', 'Economic power'], correctIndex: 1 },
  { id: 'q-speech-mandela-2', categoryKey: 'speech', textId: 'speech-mandela-inauguration', question: 'What shall never happen again?', options: ['Elections', 'Oppression of one by another', 'Change', 'Progress'], correctIndex: 1 },
  { id: 'q-speech-mandela-3', categoryKey: 'speech', textId: 'speech-mandela-inauguration', question: 'What should reign?', options: ['Power', 'Freedom', 'Money', 'Tradition'], correctIndex: 1 },

  // ─── Speech: Teddy Arena ──────────────────────────────────────
  { id: 'q-speech-arena-1', categoryKey: 'speech', textId: 'speech-teddy-arena', question: 'Who does NOT count?', options: ['The doer', 'The critic', 'The strong man', 'The worker'], correctIndex: 1 },
  { id: 'q-speech-arena-2', categoryKey: 'speech', textId: 'speech-teddy-arena', question: 'Where is the man who deserves credit?', options: ['At home', 'Actually in the arena', 'In the stands', 'Writing books'], correctIndex: 1 },
  { id: 'q-speech-arena-3', categoryKey: 'speech', textId: 'speech-teddy-arena', question: 'What mars the man\'s face?', options: ['Age', 'Dust and sweat and blood', 'Makeup', 'Scars'], correctIndex: 1 },

  // ─── Speech: Washington Farewell ──────────────────────────────
  { id: 'q-speech-wash-1', categoryKey: 'speech', textId: 'speech-washington-farewell', question: 'What is dear to you?', options: ['Money', 'The unity of government', 'Power', 'Fame'], correctIndex: 1 },
  { id: 'q-speech-wash-2', categoryKey: 'speech', textId: 'speech-washington-farewell', question: 'What is it a main pillar of?', options: ['Economy', 'Your real independence', 'Military', 'Religion'], correctIndex: 1 },
  { id: 'q-speech-wash-3', categoryKey: 'speech', textId: 'speech-washington-farewell', question: 'What does unity support?', options: ['Only peace', 'Tranquility, peace, safety, prosperity, liberty', 'Only prosperity', 'Only safety'], correctIndex: 1 },

  // ─── Speech: Pericles ─────────────────────────────────────────
  { id: 'q-speech-peri-1', categoryKey: 'speech', textId: 'speech-pericles', question: 'What does their constitution NOT do?', options: ['Exist', 'Copy neighboring states\' laws', 'Function', 'Govern'], correctIndex: 1 },
  { id: 'q-speech-peri-2', categoryKey: 'speech', textId: 'speech-pericles', question: 'Why is it called a democracy?', options: ['It favors the few', 'It favors the many', 'It has no ruler', 'It\'s ancient'], correctIndex: 1 },
  { id: 'q-speech-peri-3', categoryKey: 'speech', textId: 'speech-pericles', question: 'What do the laws afford?', options: ['Privilege to some', 'Equal justice to all', 'Power to rulers', 'Wealth to citizens'], correctIndex: 1 },

  // ─── Speech: Cicero ───────────────────────────────────────────
  { id: 'q-speech-cicero-1', categoryKey: 'speech', textId: 'speech-cicero', question: 'Who is Cicero addressing?', options: ['The Senate', 'Catiline', 'The people', 'The army'], correctIndex: 1 },
  { id: 'q-speech-cicero-2', categoryKey: 'speech', textId: 'speech-cicero', question: 'What is abusing their patience?', options: ['Delay', 'Catiline\'s madness', 'The weather', 'The law'], correctIndex: 1 },
  { id: 'q-speech-cicero-3', categoryKey: 'speech', textId: 'speech-cicero', question: 'What guards are on the Palatine Hill?', options: ['Day guards', 'Nightly guards', 'No guards', 'Foreign guards'], correctIndex: 1 },

  // ─── Speech: Demosthenes ──────────────────────────────────────
  { id: 'q-speech-demo-1', categoryKey: 'speech', textId: 'speech-demosthenes', question: 'Who is Demosthenes addressing?', options: ['The Spartans', 'The Athenians', 'The Persians', 'The Macedonians'], correctIndex: 1 },
  { id: 'q-speech-demo-2', categoryKey: 'speech', textId: 'speech-demosthenes', question: 'What should the wealthy do?', options: ['Rest', 'Contribute', 'Leave', 'Complain'], correctIndex: 1 },
  { id: 'q-speech-demo-3', categoryKey: 'speech', textId: 'speech-demosthenes', question: 'What should the able-bodied do?', options: ['Stay home', 'Enlist', 'Flee', 'Protest'], correctIndex: 1 },

  // ─── Philosophy: Epictetus ────────────────────────────────────
  { id: 'q-phil-epic-1', categoryKey: 'philosophy', textId: 'philosophy-epictetus', question: 'What is in our control?', options: ['Body and property', 'Opinion and desire', 'Reputation', 'Weather'], correctIndex: 1 },
  { id: 'q-phil-epic-2', categoryKey: 'philosophy', textId: 'philosophy-epictetus', question: 'What is NOT in our control?', options: ['Our thoughts', 'Body, property, reputation', 'Our beliefs', 'Our actions'], correctIndex: 1 },
  { id: 'q-phil-epic-3', categoryKey: 'philosophy', textId: 'philosophy-epictetus', question: 'What should we do with what\'s in our power?', options: ['Ignore it', 'Make the best use of it', 'Fear it', 'Avoid it'], correctIndex: 1 },

  // ─── Philosophy: Seneca Letters ───────────────────────────────
  { id: 'q-phil-sen2-1', categoryKey: 'philosophy', textId: 'philosophy-seneca-letters', question: 'What is true happiness?', options: ['Future hope', 'Enjoying the present', 'Past memories', 'Wealth'], correctIndex: 1 },
  { id: 'q-phil-sen2-2', categoryKey: 'philosophy', textId: 'philosophy-seneca-letters', question: 'What does a wise man want?', options: ['More', 'Nothing more than he has', 'Everything', 'Power'], correctIndex: 1 },
  { id: 'q-phil-sen2-3', categoryKey: 'philosophy', textId: 'philosophy-seneca-letters', question: 'Where are the greatest blessings?', options: ['Far away', 'Within us and our reach', 'In heaven', 'In nature'], correctIndex: 1 },

  // ─── Philosophy: Plato Allegory ───────────────────────────────
  { id: 'q-phil-plato-1', categoryKey: 'philosophy', textId: 'philosophy-plato-allegory', question: 'Where are mankind dwelling?', options: ['In a palace', 'In an underground cave', 'On a mountain', 'In a forest'], correctIndex: 1 },
  { id: 'q-phil-plato-2', categoryKey: 'philosophy', textId: 'philosophy-plato-allegory', question: 'What can the prisoners see?', options: ['The fire', 'Only shadows on the wall', 'The outside', 'Each other'], correctIndex: 1 },
  { id: 'q-phil-plato-3', categoryKey: 'philosophy', textId: 'philosophy-plato-allegory', question: 'What happens when a prisoner is freed?', options: ['He rejoices', 'He is dazzled and distressed', 'He runs away', 'He stays'], correctIndex: 1 },

  // ─── Philosophy: Aristotle ────────────────────────────────────
  { id: 'q-phil-arist-1', categoryKey: 'philosophy', textId: 'philosophy-aristotle', question: 'What do all things aim at?', options: ['Money', 'Some good', 'Fame', 'Power'], correctIndex: 1 },
  { id: 'q-phil-arist-2', categoryKey: 'philosophy', textId: 'philosophy-aristotle', question: 'What is the chief good?', options: ['Pleasure', 'Something desired for its own sake', 'Wealth', 'Honor'], correctIndex: 1 },
  { id: 'q-phil-arist-3', categoryKey: 'philosophy', textId: 'philosophy-aristotle', question: 'What influence will knowing the good have?', options: ['None', 'A great influence on life', 'Minor', 'Uncertain'], correctIndex: 1 },

  // ─── Philosophy: Descartes ────────────────────────────────────
  { id: 'q-phil-desc-1', categoryKey: 'philosophy', textId: 'philosophy-descartes', question: 'What is most equally distributed among men?', options: ['Wealth', 'Good sense', 'Strength', 'Beauty'], correctIndex: 1 },
  { id: 'q-phil-desc-2', categoryKey: 'philosophy', textId: 'philosophy-descartes', question: 'What is Descartes\' famous statement?', options: ['I feel, therefore I am', 'I think, therefore I am', 'I see, therefore I am', 'I speak, therefore I am'], correctIndex: 1 },
  { id: 'q-phil-desc-3', categoryKey: 'philosophy', textId: 'philosophy-descartes', question: 'What could not shake Descartes\' certainty?', options: ['Arguments', 'The skeptics\' suppositions', 'Evidence', 'Logic'], correctIndex: 1 },

  // ─── Philosophy: Kant ─────────────────────────────────────────
  { id: 'q-phil-kant-1', categoryKey: 'philosophy', textId: 'philosophy-kant', question: 'What two things fill the mind with awe?', options: ['Nature and art', 'Starry heavens and moral law within', 'Books and music', 'Love and fear'], correctIndex: 1 },
  { id: 'q-phil-kant-2', categoryKey: 'philosophy', textId: 'philosophy-kant', question: 'Where is the moral law?', options: ['In books', 'Within me', 'In nature', 'In society'], correctIndex: 1 },
  { id: 'q-phil-kant-3', categoryKey: 'philosophy', textId: 'philosophy-kant', question: 'What does Kant connect these to?', options: ['Memory', 'Consciousness of existence', 'Dreams', 'History'], correctIndex: 1 },

  // ─── Philosophy: Nietzsche ────────────────────────────────────
  { id: 'q-phil-nietz-1', categoryKey: 'philosophy', textId: 'philosophy-nietzsche', question: 'What does Nietzsche teach?', options: ['Despair', 'The overman', 'Religion', 'Politics'], correctIndex: 1 },
  { id: 'q-phil-nietz-2', categoryKey: 'philosophy', textId: 'philosophy-nietzsche', question: 'What shall man be to the overman?', options: ['Equal', 'A laughingstock', 'A teacher', 'A friend'], correctIndex: 1 },
  { id: 'q-phil-nietz-3', categoryKey: 'philosophy', textId: 'philosophy-nietzsche', question: 'What have all beings created?', options: ['Nothing', 'Something beyond themselves', 'Only art', 'Only tools'], correctIndex: 1 },

  // ─── Philosophy: Schopenhauer ─────────────────────────────────
  { id: 'q-phil-schop-1', categoryKey: 'philosophy', textId: 'philosophy-schopenhauer', question: 'What is Schopenhauer\'s first statement?', options: ['Life is suffering', 'The world is my idea', 'Knowledge is power', 'Truth is beauty'], correctIndex: 1 },
  { id: 'q-phil-schop-2', categoryKey: 'philosophy', textId: 'philosophy-schopenhauer', question: 'Who can bring this to conscious awareness?', options: ['Animals', 'Man alone', 'Gods', 'Children'], correctIndex: 1 },
  { id: 'q-phil-schop-3', categoryKey: 'philosophy', textId: 'philosophy-schopenhauer', question: 'What do we know directly?', options: ['The sun', 'Only an eye that sees', 'Truth', 'Reality'], correctIndex: 1 },

  // ─── Philosophy: Kierkegaard ──────────────────────────────────
  { id: 'q-phil-kierk-1', categoryKey: 'philosophy', textId: 'philosophy-kierkegaard', question: 'What is a poet?', options: ['A happy person', 'An unhappy person', 'A wise person', 'A rich person'], correctIndex: 1 },
  { id: 'q-phil-kierk-2', categoryKey: 'philosophy', textId: 'philosophy-kierkegaard', question: 'How can life be understood?', options: ['Forwards', 'Backwards', 'Sideways', 'Not at all'], correctIndex: 1 },
  { id: 'q-phil-kierk-3', categoryKey: 'philosophy', textId: 'philosophy-kierkegaard', question: 'What is anxiety?', options: ['A disease', 'The dizziness of freedom', 'A weakness', 'A blessing'], correctIndex: 1 },

  // ─── Philosophy: Spinoza ──────────────────────────────────────
  { id: 'q-phil-spin-1', categoryKey: 'philosophy', textId: 'philosophy-spinoza', question: 'How will Spinoza consider human actions?', options: ['Emotionally', 'Like lines and solids', 'Mystically', 'Randomly'], correctIndex: 1 },
  { id: 'q-phil-spin-2', categoryKey: 'philosophy', textId: 'philosophy-spinoza', question: 'What is the highest human activity?', options: ['Power', 'Learning for understanding', 'Wealth', 'Fame'], correctIndex: 1 },
  { id: 'q-phil-spin-3', categoryKey: 'philosophy', textId: 'philosophy-spinoza', question: 'What is peace according to Spinoza?', options: ['Absence of war', 'A virtue, a state of mind', 'Impossible', 'A treaty'], correctIndex: 1 },

  // ─── Philosophy: Confucius ────────────────────────────────────
  { id: 'q-phil-conf-1', categoryKey: 'philosophy', textId: 'philosophy-confucius', question: 'What does not matter as long as you don\'t stop?', options: ['Direction', 'How slowly you go', 'Method', 'Companions'], correctIndex: 1 },
  { id: 'q-phil-conf-2', categoryKey: 'philosophy', textId: 'philosophy-confucius', question: 'How does one move a mountain?', options: ['With machines', 'By carrying away small stones', 'With help', 'Impossible'], correctIndex: 1 },
  { id: 'q-phil-conf-3', categoryKey: 'philosophy', textId: 'philosophy-confucius', question: 'What is our greatest glory?', options: ['Never falling', 'Rising every time we fall', 'Winning', 'Being perfect'], correctIndex: 1 },

  // ─── Philosophy: Pascal ───────────────────────────────────────
  { id: 'q-phil-pascal-1', categoryKey: 'philosophy', textId: 'philosophy-pascal', question: 'What is man compared to?', options: ['A mountain', 'A reed', 'A tree', 'A rock'], correctIndex: 1 },
  { id: 'q-phil-pascal-2', categoryKey: 'philosophy', textId: 'philosophy-pascal', question: 'What makes man noble?', options: ['Strength', 'He knows that he dies', 'Wealth', 'Power'], correctIndex: 1 },
  { id: 'q-phil-pascal-3', categoryKey: 'philosophy', textId: 'philosophy-pascal', question: 'What does the universe know?', options: ['Everything', 'Nothing of this', 'Only physics', 'Only time'], correctIndex: 1 },

  // ─── Philosophy: Hegel ────────────────────────────────────────
  { id: 'q-phil-hegel-1', categoryKey: 'philosophy', textId: 'philosophy-hegel', question: 'What is the True?', options: ['A part', 'The whole', 'An idea', 'A mystery'], correctIndex: 1 },
  { id: 'q-phil-hegel-2', categoryKey: 'philosophy', textId: 'philosophy-hegel', question: 'When is the Absolute what it truly is?', options: ['Always', 'Only in the end', 'Never', 'In the beginning'], correctIndex: 1 },
  { id: 'q-phil-hegel-3', categoryKey: 'philosophy', textId: 'philosophy-hegel', question: 'What is the Absolute essentially?', options: ['A beginning', 'A result', 'A mystery', 'An accident'], correctIndex: 1 },

  // ─── Philosophy: Wittgenstein ─────────────────────────────────
  { id: 'q-phil-witt-1', categoryKey: 'philosophy', textId: 'philosophy-wittgenstein', question: 'What is the world?', options: ['An idea', 'All that is the case', 'A dream', 'Nothing'], correctIndex: 1 },
  { id: 'q-phil-witt-2', categoryKey: 'philosophy', textId: 'philosophy-wittgenstein', question: 'What must we pass over in silence?', options: ['What we know', 'What we cannot speak about', 'Nothing', 'Everything'], correctIndex: 1 },
  { id: 'q-phil-witt-3', categoryKey: 'philosophy', textId: 'philosophy-wittgenstein', question: 'What do the limits of language mean?', options: ['Nothing', 'The limits of my world', 'Confusion', 'Freedom'], correctIndex: 1 },

  // ─── Science: Feynman ─────────────────────────────────────────
  { id: 'q-sci-feyn-1', categoryKey: 'science', textId: 'science-feynman', question: 'What is the first principle?', options: ['Work hard', 'You must not fool yourself', 'Trust experts', 'Believe everything'], correctIndex: 1 },
  { id: 'q-sci-feyn-2', categoryKey: 'science', textId: 'science-feynman', question: 'Who is the easiest person to fool?', options: ['Others', 'Yourself', 'Experts', 'Children'], correctIndex: 1 },
  { id: 'q-sci-feyn-3', categoryKey: 'science', textId: 'science-feynman', question: 'What are the highest forms of understanding?', options: ['Math and physics', 'Laughter and human compassion', 'Logic and reason', 'Science and art'], correctIndex: 1 },

  // ─── Science: Sagan Pale Blue Dot ─────────────────────────────
  { id: 'q-sci-sagan-1', categoryKey: 'science', textId: 'science-sagan-pale', question: 'What is "that dot"?', options: ['A star', 'Earth - our home', 'The sun', 'Mars'], correctIndex: 1 },
  { id: 'q-sci-sagan-2', categoryKey: 'science', textId: 'science-sagan-pale', question: 'Who lived out their lives on it?', options: ['Only humans', 'Everyone you know and love', 'Only scientists', 'Only leaders'], correctIndex: 1 },
  { id: 'q-sci-sagan-3', categoryKey: 'science', textId: 'science-sagan-pale', question: 'What is on this dot?', options: ['Only nature', 'All of humanity\'s joy and suffering', 'Nothing', 'Only water'], correctIndex: 1 },

  // ─── Science: Einstein ────────────────────────────────────────
  { id: 'q-sci-ein-1', categoryKey: 'science', textId: 'science-einstein', question: 'What is the most beautiful thing we can experience?', options: ['Love', 'The mysterious', 'Nature', 'Art'], correctIndex: 1 },
  { id: 'q-sci-ein-2', categoryKey: 'science', textId: 'science-einstein', question: 'What is more important than knowledge?', options: ['Power', 'Imagination', 'Wealth', 'Fame'], correctIndex: 1 },
  { id: 'q-sci-ein-3', categoryKey: 'science', textId: 'science-einstein', question: 'What is limited?', options: ['Imagination', 'Knowledge', 'The universe', 'Time'], correctIndex: 1 },

  // ─── Science: Hawking ─────────────────────────────────────────
  { id: 'q-sci-hawk-1', categoryKey: 'science', textId: 'science-hawking', question: 'In what kind of world do we find ourselves?', options: ['Simple', 'Bewildering', 'Perfect', 'Small'], correctIndex: 1 },
  { id: 'q-sci-hawk-2', categoryKey: 'science', textId: 'science-hawking', question: 'What is intelligence according to Hawking?', options: ['Knowledge', 'The ability to adapt to change', 'Memory', 'Speed'], correctIndex: 1 },
  { id: 'q-sci-hawk-3', categoryKey: 'science', textId: 'science-hawking', question: 'What doesn\'t the universe allow?', options: ['Change', 'Perfection', 'Life', 'Growth'], correctIndex: 1 },

  // ─── Science: Darwin Voyage ───────────────────────────────────
  { id: 'q-sci-voyage-1', categoryKey: 'science', textId: 'science-darwin-voyage', question: 'What frequently crosses Darwin\'s eyes?', options: ['Mountains', 'The plains of Patagonia', 'The sea', 'Forests'], correctIndex: 1 },
  { id: 'q-sci-voyage-2', categoryKey: 'science', textId: 'science-darwin-voyage', question: 'How are these plains described by all?', options: ['Beautiful', 'Wretched and useless', 'Fertile', 'Green'], correctIndex: 1 },
  { id: 'q-sci-voyage-3', categoryKey: 'science', textId: 'science-darwin-voyage', question: 'What do the plains support?', options: ['Forests', 'Only dwarf plants', 'Rivers', 'Animals'], correctIndex: 1 },

  // ─── Science: Galileo ─────────────────────────────────────────
  { id: 'q-sci-gal-1', categoryKey: 'science', textId: 'science-galileo', question: 'Where is philosophy written?', options: ['In books alone', 'In the grand book of the universe', 'In minds', 'In nature only'], correctIndex: 1 },
  { id: 'q-sci-gal-2', categoryKey: 'science', textId: 'science-galileo', question: 'What language is it written in?', options: ['Latin', 'Mathematics', 'Greek', 'Italian'], correctIndex: 1 },
  { id: 'q-sci-gal-3', categoryKey: 'science', textId: 'science-galileo', question: 'What are its characters?', options: ['Letters', 'Triangles and circles', 'Numbers only', 'Words'], correctIndex: 1 },

  // ─── Science: Faraday ─────────────────────────────────────────
  { id: 'q-sci-far-1', categoryKey: 'science', textId: 'science-faraday', question: 'What is the best door to natural philosophy?', options: ['Books', 'A candle', 'Mathematics', 'Stars'], correctIndex: 1 },
  { id: 'q-sci-far-2', categoryKey: 'science', textId: 'science-faraday', question: 'What will Faraday bring before you first?', options: ['Experiments', 'The general character of a candle', 'Theories', 'History'], correctIndex: 1 },
  { id: 'q-sci-far-3', categoryKey: 'science', textId: 'science-faraday', question: 'What will be pursued in every direction?', options: ['Light', 'The phenomena of the candle', 'Heat', 'Sound'], correctIndex: 1 },

  // ─── Science: Newton ──────────────────────────────────────────
  { id: 'q-sci-newton-1', categoryKey: 'science', textId: 'science-principia', question: 'What does Newton compare himself to?', options: ['A giant', 'A boy on the sea-shore', 'A star', 'A mountain'], correctIndex: 1 },
  { id: 'q-sci-newton-2', categoryKey: 'science', textId: 'science-principia', question: 'What lay undiscovered before Newton?', options: ['America', 'The great ocean of truth', 'Gravity', 'Calculus'], correctIndex: 1 },
  { id: 'q-sci-newton-3', categoryKey: 'science', textId: 'science-principia', question: 'How did Newton see further?', options: ['Alone', 'By standing on shoulders of giants', 'With telescopes', 'By luck'], correctIndex: 1 },

  // ─── Science: Copernicus ──────────────────────────────────────
  { id: 'q-sci-cop-1', categoryKey: 'science', textId: 'science-copernicus', question: 'Where is the sun according to Copernicus?', options: ['Orbiting Earth', 'At rest in the middle', 'At the edge', 'Moving randomly'], correctIndex: 1 },
  { id: 'q-sci-cop-2', categoryKey: 'science', textId: 'science-copernicus', question: 'What is the sun compared to?', options: ['A god', 'The lantern of the universe', 'A star only', 'A fire'], correctIndex: 1 },
  { id: 'q-sci-cop-3', categoryKey: 'science', textId: 'science-copernicus', question: 'What is this called?', options: ['A random place', 'This most beautiful temple', 'A dark spot', 'An ordinary position'], correctIndex: 1 },

  // ─── Science: Huxley ──────────────────────────────────────────
  { id: 'q-sci-hux-1', categoryKey: 'science', textId: 'science-huxley', question: 'What is written in the chalk?', options: ['Nothing', 'A great chapter of world history', 'Poetry', 'Secrets'], correctIndex: 1 },
  { id: 'q-sci-hux-2', categoryKey: 'science', textId: 'science-huxley', question: 'What supports the truth of this history?', options: ['Faith', 'Overwhelming evidence', 'Tradition', 'Guessing'], correctIndex: 1 },
  { id: 'q-sci-hux-3', categoryKey: 'science', textId: 'science-huxley', question: 'What will you be able to read tonight?', options: ['A book', 'The history of the globe', 'Poetry', 'Nothing'], correctIndex: 1 },

  // ─── Science: Kepler ──────────────────────────────────────────
  { id: 'q-sci-kep-1', categoryKey: 'science', textId: 'science-kepler', question: 'What are geometry\'s two great treasures?', options: ['Points and lines', 'Pythagoras theorem and golden ratio', 'Circles and squares', 'Addition and subtraction'], correctIndex: 1 },
  { id: 'q-sci-kep-2', categoryKey: 'science', textId: 'science-kepler', question: 'Why is nature so diverse?', options: ['By accident', 'So the mind never lacks nourishment', 'Randomly', 'For no reason'], correctIndex: 1 },
  { id: 'q-sci-kep-3', categoryKey: 'science', textId: 'science-kepler', question: 'What is the golden ratio compared to?', options: ['Gold', 'A precious jewel', 'Money', 'A star'], correctIndex: 1 },

  // ─── Science: Bacon ───────────────────────────────────────────
  { id: 'q-sci-bacon-1', categoryKey: 'science', textId: 'science-bacon', question: 'What is knowledge according to Bacon?', options: ['Virtue', 'Power', 'Wealth', 'Mystery'], correctIndex: 1 },
  { id: 'q-sci-bacon-2', categoryKey: 'science', textId: 'science-bacon', question: 'What is man the servant and interpreter of?', options: ['Kings', 'Nature', 'God', 'Society'], correctIndex: 1 },
  { id: 'q-sci-bacon-3', categoryKey: 'science', textId: 'science-bacon', question: 'What is greater than the subtlety of the senses?', options: ['Nothing', 'The subtlety of nature', 'Human will', 'Time'], correctIndex: 1 },

  // ─── Science: Lyell ───────────────────────────────────────────
  { id: 'q-sci-lyell-1', categoryKey: 'science', textId: 'science-lyell', question: 'What should never be underrated?', options: ['Speed', 'The force of gradual movement', 'Power', 'Luck'], correctIndex: 1 },
  { id: 'q-sci-lyell-2', categoryKey: 'science', textId: 'science-lyell', question: 'How are waters in the lake described?', options: ['Rapid', 'Deep and calm', 'Shallow', 'Turbulent'], correctIndex: 1 },
  { id: 'q-sci-lyell-3', categoryKey: 'science', textId: 'science-lyell', question: 'What is the key to the past?', options: ['History', 'The present', 'Memory', 'Tradition'], correctIndex: 1 },

  // ─── Science: Bohr ────────────────────────────────────────────
  { id: 'q-sci-bohr-1', categoryKey: 'science', textId: 'science-bohr', question: 'What may another profound truth be?', options: ['Identical', 'The opposite of a profound truth', 'Similar', 'Unrelated'], correctIndex: 1 },
  { id: 'q-sci-bohr-2', categoryKey: 'science', textId: 'science-bohr', question: 'What does every deep difficulty bear?', options: ['No solution', 'Its own solution', 'More problems', 'Mystery'], correctIndex: 1 },
  { id: 'q-sci-bohr-3', categoryKey: 'science', textId: 'science-bohr', question: 'What is very difficult according to Bohr?', options: ['Math', 'Prediction, especially about the future', 'Physics', 'Understanding'], correctIndex: 1 },

  // ─── Literature: Pride and Prejudice ──────────────────────────
  { id: 'q-lit-pride-1', categoryKey: 'fiction', textId: 'literature-pride', question: 'What must a single man with fortune be in want of?', options: ['Money', 'A wife', 'Friends', 'Adventure'], correctIndex: 1 },
  { id: 'q-lit-pride-2', categoryKey: 'fiction', textId: 'literature-pride', question: 'What is fixed in the minds of surrounding families?', options: ['His wealth', 'This truth about marriage', 'His reputation', 'His plans'], correctIndex: 1 },
  { id: 'q-lit-pride-3', categoryKey: 'fiction', textId: 'literature-pride', question: 'He is considered rightful property of whom?', options: ['The state', 'One of their daughters', 'The church', 'No one'], correctIndex: 1 },

  // ─── Literature: Tale of Two Cities ───────────────────────────
  { id: 'q-lit-tale-1', categoryKey: 'fiction', textId: 'literature-tale-two', question: 'What kind of times was it?', options: ['Normal', 'Best and worst of times', 'Peaceful', 'Forgotten'], correctIndex: 1 },
  { id: 'q-lit-tale-2', categoryKey: 'fiction', textId: 'literature-tale-two', question: 'What age was it?', options: ['Bronze', 'Wisdom and foolishness', 'Iron', 'Golden'], correctIndex: 1 },
  { id: 'q-lit-tale-3', categoryKey: 'fiction', textId: 'literature-tale-two', question: 'What season of hope and despair?', options: ['Summer and winter', 'Spring and winter', 'Fall and winter', 'Spring and fall'], correctIndex: 1 },

  // ─── Literature: Anna Karenina ────────────────────────────────
  { id: 'q-lit-anna-1', categoryKey: 'fiction', textId: 'literature-anna', question: 'How are happy families?', options: ['Different', 'All alike', 'Rare', 'Wealthy'], correctIndex: 1 },
  { id: 'q-lit-anna-2', categoryKey: 'fiction', textId: 'literature-anna', question: 'What was in confusion?', options: ['The city', 'The Oblonskys\' house', 'The country', 'The government'], correctIndex: 1 },
  { id: 'q-lit-anna-3', categoryKey: 'fiction', textId: 'literature-anna', question: 'Who was the French girl?', options: ['A maid', 'A governess', 'A friend', 'A stranger'], correctIndex: 1 },

  // ─── Literature: 1984 ─────────────────────────────────────────
  { id: 'q-lit-1984-1', categoryKey: 'fiction', textId: 'literature-1984', question: 'What time were the clocks striking?', options: ['Twelve', 'Thirteen', 'Fourteen', 'Fifteen'], correctIndex: 1 },
  { id: 'q-lit-1984-2', categoryKey: 'fiction', textId: 'literature-1984', question: 'What kind of day was it?', options: ['Warm', 'Bright cold day in April', 'Rainy', 'Hot'], correctIndex: 1 },
  { id: 'q-lit-1984-3', categoryKey: 'fiction', textId: 'literature-1984', question: 'What did the hallway smell of?', options: ['Flowers', 'Boiled cabbage and old rag mats', 'Fresh bread', 'Nothing'], correctIndex: 1 },

  // ─── Literature: Catcher in the Rye ───────────────────────────
  { id: 'q-lit-catch-1', categoryKey: 'fiction', textId: 'literature-catcher', question: 'What does the narrator call his childhood?', options: ['Happy', 'Lousy', 'Perfect', 'Normal'], correctIndex: 1 },
  { id: 'q-lit-catch-2', categoryKey: 'fiction', textId: 'literature-catcher', question: 'What does he not feel like going into?', options: ['Details', 'David Copperfield kind of crap', 'School', 'Work'], correctIndex: 1 },
  { id: 'q-lit-catch-3', categoryKey: 'fiction', textId: 'literature-catcher', question: 'What does he say at the end?', options: ['I\'m sorry', 'If you want to know the truth', 'I don\'t care', 'That\'s all'], correctIndex: 1 },

  // ─── Literature: Don Quixote ──────────────────────────────────
  { id: 'q-lit-quix-1', categoryKey: 'fiction', textId: 'literature-don-quixote', question: 'Where did the gentleman live?', options: ['Madrid', 'A village of La Mancha', 'Barcelona', 'Seville'], correctIndex: 1 },
  { id: 'q-lit-quix-2', categoryKey: 'fiction', textId: 'literature-don-quixote', question: 'What did he keep in the lance-rack?', options: ['Swords', 'A lance', 'Books', 'Armor'], correctIndex: 1 },
  { id: 'q-lit-quix-3', categoryKey: 'fiction', textId: 'literature-don-quixote', question: 'What animal did he have for coursing?', options: ['Horse', 'Greyhound', 'Falcon', 'Cat'], correctIndex: 1 },

  // ─── Literature: Frankenstein ─────────────────────────────────
  { id: 'q-lit-frank-1', categoryKey: 'fiction', textId: 'literature-frankenstein', question: 'What has not accompanied the enterprise?', options: ['Success', 'Disaster', 'Money', 'Friends'], correctIndex: 1 },
  { id: 'q-lit-frank-2', categoryKey: 'fiction', textId: 'literature-frankenstein', question: 'Where has the narrator arrived?', options: ['London', 'Far north of London', 'Paris', 'Rome'], correctIndex: 1 },
  { id: 'q-lit-frank-3', categoryKey: 'fiction', textId: 'literature-frankenstein', question: 'What plays upon his cheeks?', options: ['Warmth', 'A cold northern breeze', 'Sunshine', 'Rain'], correctIndex: 1 },

  // ─── Literature: Wuthering Heights ────────────────────────────
  { id: 'q-lit-wuth-1', categoryKey: 'fiction', textId: 'literature-wuthering', question: 'What has the narrator just returned from?', options: ['A journey', 'A visit to the landlord', 'War', 'School'], correctIndex: 1 },
  { id: 'q-lit-wuth-2', categoryKey: 'fiction', textId: 'literature-wuthering', question: 'What kind of neighbour will he have?', options: ['Friendly', 'Solitary', 'Rich', 'Famous'], correctIndex: 1 },
  { id: 'q-lit-wuth-3', categoryKey: 'fiction', textId: 'literature-wuthering', question: 'What is this situation perfect for?', options: ['Farming', 'A misanthropist\'s Heaven', 'Business', 'Family'], correctIndex: 1 },

  // ─── Literature: Jane Eyre ────────────────────────────────────
  { id: 'q-lit-jane-1', categoryKey: 'fiction', textId: 'literature-jane-eyre', question: 'What was impossible that day?', options: ['Reading', 'Taking a walk', 'Eating', 'Sleeping'], correctIndex: 1 },
  { id: 'q-lit-jane-2', categoryKey: 'fiction', textId: 'literature-jane-eyre', question: 'What had the wind brought?', options: ['Warmth', 'Clouds and penetrating rain', 'Snow', 'Dust'], correctIndex: 1 },
  { id: 'q-lit-jane-3', categoryKey: 'fiction', textId: 'literature-jane-eyre', question: 'What did the narrator never like?', options: ['Books', 'Long walks', 'Company', 'Music'], correctIndex: 1 },

  // ─── Literature: Crime and Punishment ─────────────────────────
  { id: 'q-lit-crime-1', categoryKey: 'fiction', textId: 'literature-crime', question: 'What kind of evening was it?', options: ['Cold', 'Exceptionally hot', 'Rainy', 'Windy'], correctIndex: 1 },
  { id: 'q-lit-crime-2', categoryKey: 'fiction', textId: 'literature-crime', question: 'What was the young man\'s garret like?', options: ['Spacious', 'More like a cupboard', 'Comfortable', 'Bright'], correctIndex: 1 },
  { id: 'q-lit-crime-3', categoryKey: 'fiction', textId: 'literature-crime', question: 'How did he walk?', options: ['Quickly', 'Slowly, as though in hesitation', 'Running', 'Normally'], correctIndex: 1 },

  // ─── Literature: Brothers Karamazov ───────────────────────────
  { id: 'q-lit-bros-1', categoryKey: 'fiction', textId: 'literature-brothers', question: 'Which son was Alexey?', options: ['First', 'Second', 'Third', 'Fourth'], correctIndex: 2 },
  { id: 'q-lit-bros-2', categoryKey: 'fiction', textId: 'literature-brothers', question: 'How did the father die?', options: ['Peacefully', 'In a gloomy and tragic way', 'Happily', 'Unknown'], correctIndex: 1 },
  { id: 'q-lit-bros-3', categoryKey: 'fiction', textId: 'literature-brothers', question: 'How many years ago did this happen?', options: ['Three', 'Seven', 'Thirteen', 'Twenty'], correctIndex: 2 },

  // ─── Literature: Odyssey ──────────────────────────────────────
  { id: 'q-lit-ody-1', categoryKey: 'fiction', textId: 'literature-odyssey', question: 'Who is asked to tell the story?', options: ['Zeus', 'O muse', 'Homer', 'The hero'], correctIndex: 1 },
  { id: 'q-lit-ody-2', categoryKey: 'fiction', textId: 'literature-odyssey', question: 'What famous town had the hero sacked?', options: ['Athens', 'Troy', 'Sparta', 'Rome'], correctIndex: 1 },
  { id: 'q-lit-ody-3', categoryKey: 'fiction', textId: 'literature-odyssey', question: 'What was the hero trying to do?', options: ['Conquer more', 'Bring his men safely home', 'Find treasure', 'Become king'], correctIndex: 1 },

  // ─── Literature: Iliad ────────────────────────────────────────
  { id: 'q-lit-iliad-1', categoryKey: 'fiction', textId: 'literature-iliad', question: 'What is the goddess asked to sing of?', options: ['Love', 'The anger of Achilles', 'Peace', 'Victory'], correctIndex: 1 },
  { id: 'q-lit-iliad-2', categoryKey: 'fiction', textId: 'literature-iliad', question: 'Where were many souls sent?', options: ['Heaven', 'Hades', 'Home', 'Nowhere'], correctIndex: 1 },
  { id: 'q-lit-iliad-3', categoryKey: 'fiction', textId: 'literature-iliad', question: 'Who first fell out with Achilles?', options: ['Hector', 'The son of Atreus', 'Paris', 'Zeus'], correctIndex: 1 },

  // ─── Poetry: The Raven ────────────────────────────────────────
  { id: 'q-poetry-raven-1', categoryKey: 'poetry', textId: 'poetry-raven', question: 'What kind of midnight was it?', options: ['Bright', 'Dreary', 'Peaceful', 'Warm'], correctIndex: 1 },
  { id: 'q-poetry-raven-2', categoryKey: 'poetry', textId: 'poetry-raven', question: 'What was the narrator pondering?', options: ['Nature', 'Quaint and curious volumes of forgotten lore', 'Love', 'Travel'], correctIndex: 1 },
  { id: 'q-poetry-raven-3', categoryKey: 'poetry', textId: 'poetry-raven', question: 'What came tapping?', options: ['Wind', 'Some visitor', 'Rain', 'A branch'], correctIndex: 1 },

  // ─── Poetry: Invictus ─────────────────────────────────────────
  { id: 'q-poetry-inv-1', categoryKey: 'poetry', textId: 'poetry-invictus', question: 'What covers the speaker?', options: ['Light', 'The night', 'A blanket', 'Clouds'], correctIndex: 1 },
  { id: 'q-poetry-inv-2', categoryKey: 'poetry', textId: 'poetry-invictus', question: 'What is unconquerable?', options: ['The body', 'My soul', 'The world', 'Time'], correctIndex: 1 },
  { id: 'q-poetry-inv-3', categoryKey: 'poetry', textId: 'poetry-invictus', question: 'What is the speaker master of?', options: ['Nothing', 'My fate', 'Others', 'The world'], correctIndex: 1 },

  // ─── Poetry: Ozymandias ───────────────────────────────────────
  { id: 'q-poetry-ozy-1', categoryKey: 'poetry', textId: 'poetry-ozymandias', question: 'What stands in the desert?', options: ['A temple', 'Two vast trunkless legs of stone', 'A palace', 'An oasis'], correctIndex: 1 },
  { id: 'q-poetry-ozy-2', categoryKey: 'poetry', textId: 'poetry-ozymandias', question: 'Who was Ozymandias?', options: ['A poet', 'King of kings', 'A soldier', 'A priest'], correctIndex: 1 },
  { id: 'q-poetry-ozy-3', categoryKey: 'poetry', textId: 'poetry-ozymandias', question: 'What remains beside the wreck?', options: ['A city', 'Nothing', 'People', 'Trees'], correctIndex: 1 },

  // ─── Poetry: Tyger ────────────────────────────────────────────
  { id: 'q-poetry-tyger-1', categoryKey: 'poetry', textId: 'poetry-tyger', question: 'Where is the Tyger burning?', options: ['In the day', 'In the forests of the night', 'In a cage', 'In hell'], correctIndex: 1 },
  { id: 'q-poetry-tyger-2', categoryKey: 'poetry', textId: 'poetry-tyger', question: 'What could frame the Tyger\'s fearful symmetry?', options: ['Mortal hands', 'Immortal hand or eye', 'Nature', 'Chance'], correctIndex: 1 },
  { id: 'q-poetry-tyger-3', categoryKey: 'poetry', textId: 'poetry-tyger', question: 'What burnt in distant deeps or skies?', options: ['Stars', 'The fire of its eyes', 'The sun', 'Lightning'], correctIndex: 1 },

  // ─── Poetry: Daffodils ────────────────────────────────────────
  { id: 'q-poetry-daff-1', categoryKey: 'poetry', textId: 'poetry-daffodils', question: 'What did the poet wander lonely as?', options: ['A bird', 'A cloud', 'A ship', 'A leaf'], correctIndex: 1 },
  { id: 'q-poetry-daff-2', categoryKey: 'poetry', textId: 'poetry-daffodils', question: 'What did he suddenly see?', options: ['Mountains', 'A host of golden daffodils', 'A river', 'The sea'], correctIndex: 1 },
  { id: 'q-poetry-daff-3', categoryKey: 'poetry', textId: 'poetry-daffodils', question: 'What were the daffodils doing?', options: ['Wilting', 'Fluttering and dancing', 'Standing still', 'Growing'], correctIndex: 1 },

  // ─── Poetry: Still I Rise ─────────────────────────────────────
  { id: 'q-poetry-rise-1', categoryKey: 'poetry', textId: 'poetry-still-rise', question: 'What may you write the speaker down in?', options: ['Stone', 'History', 'Books', 'Memory'], correctIndex: 1 },
  { id: 'q-poetry-rise-2', categoryKey: 'poetry', textId: 'poetry-still-rise', question: 'What will the speaker do like dust?', options: ['Fade', 'Rise', 'Fall', 'Scatter'], correctIndex: 1 },
  { id: 'q-poetry-rise-3', categoryKey: 'poetry', textId: 'poetry-still-rise', question: 'What does the speaker walk like she has?', options: ['Nothing', 'Oil wells', 'Wings', 'Secrets'], correctIndex: 1 },

  // ─── Poetry: If ───────────────────────────────────────────────
  { id: 'q-poetry-if-1', categoryKey: 'poetry', textId: 'poetry-if', question: 'What should you keep when all about you are losing theirs?', options: ['Money', 'Your head', 'Friends', 'Hope'], correctIndex: 1 },
  { id: 'q-poetry-if-2', categoryKey: 'poetry', textId: 'poetry-if', question: 'What should you trust when all men doubt you?', options: ['Others', 'Yourself', 'Luck', 'Time'], correctIndex: 1 },
  { id: 'q-poetry-if-3', categoryKey: 'poetry', textId: 'poetry-if', question: 'If being lied about, what should you not deal in?', options: ['Money', 'Lies', 'Trade', 'Secrets'], correctIndex: 1 },

  // ─── Poetry: Stopping by Woods ────────────────────────────────
  { id: 'q-poetry-stop-1', categoryKey: 'poetry', textId: 'poetry-stopping-woods', question: 'What does the speaker think he knows?', options: ['The way home', 'Whose woods these are', 'The time', 'The weather'], correctIndex: 1 },
  { id: 'q-poetry-stop-2', categoryKey: 'poetry', textId: 'poetry-stopping-woods', question: 'What is filling up with snow?', options: ['The road', 'The woods', 'The house', 'The lake'], correctIndex: 1 },
  { id: 'q-poetry-stop-3', categoryKey: 'poetry', textId: 'poetry-stopping-woods', question: 'What does the speaker have before sleep?', options: ['Fears', 'Miles to go and promises to keep', 'Nothing', 'Regrets'], correctIndex: 1 },

  // ─── Poetry: Ode to Nightingale ───────────────────────────────
  { id: 'q-poetry-night-1', categoryKey: 'poetry', textId: 'poetry-ode-nightingale', question: 'What aches?', options: ['The feet', 'My heart', 'The head', 'The soul'], correctIndex: 1 },
  { id: 'q-poetry-night-2', categoryKey: 'poetry', textId: 'poetry-ode-nightingale', question: 'What has the speaker seemingly drunk?', options: ['Wine', 'Hemlock', 'Water', 'Tea'], correctIndex: 1 },
  { id: 'q-poetry-night-3', categoryKey: 'poetry', textId: 'poetry-ode-nightingale', question: 'Where does the nightingale sing?', options: ['A cage', 'A melodious plot of beechen green', 'A palace', 'A tower'], correctIndex: 1 },

  // ─── Poetry: Do Not Go Gentle ─────────────────────────────────
  { id: 'q-poetry-dng-1', categoryKey: 'poetry', textId: 'poetry-do-not-go', question: 'Into what should one not go gentle?', options: ['Sleep', 'That good night', 'The forest', 'The sea'], correctIndex: 1 },
  { id: 'q-poetry-dng-2', categoryKey: 'poetry', textId: 'poetry-do-not-go', question: 'What should old age do?', options: ['Rest', 'Burn and rave', 'Surrender', 'Forget'], correctIndex: 1 },
  { id: 'q-poetry-dng-3', categoryKey: 'poetry', textId: 'poetry-do-not-go', question: 'What should one rage against?', options: ['Life', 'The dying of the light', 'Time', 'Change'], correctIndex: 1 },

  // ─── Poetry: Annabel Lee ──────────────────────────────────────
  { id: 'q-poetry-ann-1', categoryKey: 'poetry', textId: 'poetry-annabel-lee', question: 'Where was this kingdom?', options: ['In the mountains', 'By the sea', 'In the desert', 'In the sky'], correctIndex: 1 },
  { id: 'q-poetry-ann-2', categoryKey: 'poetry', textId: 'poetry-annabel-lee', question: 'How old were they?', options: ['Old', 'Children', 'Adults', 'Unknown'], correctIndex: 1 },
  { id: 'q-poetry-ann-3', categoryKey: 'poetry', textId: 'poetry-annabel-lee', question: 'How did they love?', options: ['Lightly', 'With a love more than love', 'Secretly', 'Sadly'], correctIndex: 1 },

  // ─── Poetry: Song of Myself ───────────────────────────────────
  { id: 'q-poetry-song-1', categoryKey: 'poetry', textId: 'poetry-song-myself', question: 'What does the poet celebrate?', options: ['Nature', 'Myself', 'America', 'Love'], correctIndex: 1 },
  { id: 'q-poetry-song-2', categoryKey: 'poetry', textId: 'poetry-song-myself', question: 'What does the poet observe while loafing?', options: ['Stars', 'A spear of summer grass', 'Clouds', 'Birds'], correctIndex: 1 },
  { id: 'q-poetry-song-3', categoryKey: 'poetry', textId: 'poetry-song-myself', question: 'What belongs to you as it belongs to the poet?', options: ['Nothing', 'Every atom', 'Only some things', 'The world'], correctIndex: 1 },

  // ─── Poetry: Paradise Lost ────────────────────────────────────
  { id: 'q-poetry-par-1', categoryKey: 'poetry', textId: 'poetry-paradise-lost', question: 'What is the poem about?', options: ['Love', 'Man\'s first disobedience', 'War', 'Nature'], correctIndex: 1 },
  { id: 'q-poetry-par-2', categoryKey: 'poetry', textId: 'poetry-paradise-lost', question: 'What did the mortal taste bring?', options: ['Joy', 'Death into the World', 'Knowledge', 'Wisdom'], correctIndex: 1 },
  { id: 'q-poetry-par-3', categoryKey: 'poetry', textId: 'poetry-paradise-lost', question: 'What can the mind make of Heaven and Hell?', options: ['Nothing', 'Either into the other', 'Only Heaven', 'Only Hell'], correctIndex: 1 },

  // ─── History: Thucydides ──────────────────────────────────────
  { id: 'q-hist-thuc-1', categoryKey: 'history', textId: 'history-thucydides', question: 'Who wrote this history?', options: ['Herodotus', 'Thucydides, an Athenian', 'Homer', 'Plato'], correctIndex: 1 },
  { id: 'q-hist-thuc-2', categoryKey: 'history', textId: 'history-thucydides', question: 'What does the absence of romance do?', options: ['Help', 'Detract from interest', 'Add excitement', 'Nothing'], correctIndex: 1 },
  { id: 'q-hist-thuc-3', categoryKey: 'history', textId: 'history-thucydides', question: 'Who would find this useful?', options: ['Poets', 'Those who desire exact knowledge of the past', 'Children', 'Artists'], correctIndex: 1 },

  // ─── History: Caesar ──────────────────────────────────────────
  { id: 'q-hist-caesar-1', categoryKey: 'history', textId: 'history-caesar', question: 'Into how many parts is Gaul divided?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 1 },
  { id: 'q-hist-caesar-2', categoryKey: 'history', textId: 'history-caesar', question: 'What separates the Gauls from the Aquitani?', options: ['Mountains', 'The Garonne river', 'Walls', 'Forests'], correctIndex: 1 },
  { id: 'q-hist-caesar-3', categoryKey: 'history', textId: 'history-caesar', question: 'In what do these peoples differ?', options: ['Nothing', 'Language, customs and laws', 'Only religion', 'Only dress'], correctIndex: 1 },

  // ─── History: Gibbon ──────────────────────────────────────────
  { id: 'q-hist-gib-1', categoryKey: 'history', textId: 'history-gibbon', question: 'When did Rome\'s empire comprehend the fairest part of earth?', options: ['First century', 'Second century', 'Third century', 'Fourth century'], correctIndex: 1 },
  { id: 'q-hist-gib-2', categoryKey: 'history', textId: 'history-gibbon', question: 'What guarded the frontiers?', options: ['Walls', 'Ancient renown and disciplined valour', 'Rivers', 'Mountains'], correctIndex: 1 },
  { id: 'q-hist-gib-3', categoryKey: 'history', textId: 'history-gibbon', question: 'What cemented the union of provinces?', options: ['Force', 'The influence of laws and manners', 'Fear', 'Religion'], correctIndex: 1 },

  // ─── History: Magna Carta ─────────────────────────────────────
  { id: 'q-hist-magna-1', categoryKey: 'history', textId: 'history-magna-carta', question: 'For whose health of soul was this granted?', options: ['The poor', 'The king and ancestors', 'The church', 'The army'], correctIndex: 1 },
  { id: 'q-hist-magna-2', categoryKey: 'history', textId: 'history-magna-carta', question: 'What shall the English Church be?', options: ['Taxed', 'Free', 'Closed', 'Reformed'], correctIndex: 1 },
  { id: 'q-hist-magna-3', categoryKey: 'history', textId: 'history-magna-carta', question: 'What shall the Church\'s liberties be?', options: ['Limited', 'Unimpaired', 'Changed', 'Forgotten'], correctIndex: 1 },

  // ─── History: Tacitus ─────────────────────────────────────────
  { id: 'q-hist-tac-1', categoryKey: 'history', textId: 'history-tacitus', question: 'Who ruled Rome at the beginning?', options: ['Consuls', 'Kings', 'Senators', 'Generals'], correctIndex: 1 },
  { id: 'q-hist-tac-2', categoryKey: 'history', textId: 'history-tacitus', question: 'Who established freedom and the consulship?', options: ['Caesar', 'Lucius Brutus', 'Augustus', 'Cicero'], correctIndex: 1 },
  { id: 'q-hist-tac-3', categoryKey: 'history', textId: 'history-tacitus', question: 'What were held for a temporary crisis?', options: ['Elections', 'Dictatorships', 'Festivals', 'Trials'], correctIndex: 1 },

  // ─── History: Constitution ────────────────────────────────────
  { id: 'q-hist-const-1', categoryKey: 'history', textId: 'history-constitution', question: 'Who ordains and establishes the Constitution?', options: ['The King', 'We the People', 'The Congress', 'The States'], correctIndex: 1 },
  { id: 'q-hist-const-2', categoryKey: 'history', textId: 'history-constitution', question: 'What kind of Union does it form?', options: ['Simple', 'A more perfect Union', 'Temporary', 'Military'], correctIndex: 1 },
  { id: 'q-hist-const-3', categoryKey: 'history', textId: 'history-constitution', question: 'What Blessings are secured?', options: ['Wealth', 'Liberty', 'Power', 'Land'], correctIndex: 1 },

  // ─── History: Plutarch ────────────────────────────────────────
  { id: 'q-hist-plut-1', categoryKey: 'history', textId: 'history-plutarch', question: 'Why did Plutarch first write biographies?', options: ['For money', 'For the sake of others', 'For fame', 'For fun'], correctIndex: 1 },
  { id: 'q-hist-plut-2', categoryKey: 'history', textId: 'history-plutarch', question: 'What do great men\'s virtues serve as?', options: ['Entertainment', 'A looking-glass', 'Inspiration only', 'History'], correctIndex: 1 },
  { id: 'q-hist-plut-3', categoryKey: 'history', textId: 'history-plutarch', question: 'What does Plutarch seek to know?', options: ['Dates', 'What manner of men the leaders were', 'Battles', 'Treaties'], correctIndex: 1 },

  // ─── History: Livy ────────────────────────────────────────────
  { id: 'q-hist-livy-1', categoryKey: 'history', textId: 'history-livy', question: 'What will Livy record?', options: ['His life', 'Achievements of the Roman people', 'Greek history', 'Myths'], correctIndex: 1 },
  { id: 'q-hist-livy-2', categoryKey: 'history', textId: 'history-livy', question: 'What does Livy perceive about the theme?', options: ['It\'s new', 'It\'s old and hackneyed', 'It\'s unknown', 'It\'s secret'], correctIndex: 1 },
  { id: 'q-hist-livy-3', categoryKey: 'history', textId: 'history-livy', question: 'What do new writers believe?', options: ['Nothing', 'They\'ll surpass the ancients', 'They\'ll fail', 'They\'ll equal'], correctIndex: 1 },

  // ─── History: Churchill WW2 ───────────────────────────────────
  { id: 'q-hist-chur-1', categoryKey: 'history', textId: 'history-churchill-ww2', question: 'What did Churchill suggest calling the war?', options: ['The Great War', 'The Unnecessary War', 'The World War', 'The Last War'], correctIndex: 1 },
  { id: 'q-hist-chur-2', categoryKey: 'history', textId: 'history-churchill-ww2', question: 'What was never more easy to stop?', options: ['Peace', 'This war', 'Progress', 'History'], correctIndex: 1 },
  { id: 'q-hist-chur-3', categoryKey: 'history', textId: 'history-churchill-ww2', question: 'What reaches its climax in human tragedy?', options: ['Victory', 'The fact that sacrifices were wasted', 'Death', 'Battle'], correctIndex: 1 },

  // ─── History: Federalist ──────────────────────────────────────
  { id: 'q-hist-fed-1', categoryKey: 'history', textId: 'history-federalist', question: 'What experience have they had with federal government?', options: ['Success', 'Inefficiency', 'Perfection', 'None'], correctIndex: 1 },
  { id: 'q-hist-fed-2', categoryKey: 'history', textId: 'history-federalist', question: 'What are they called upon to deliberate on?', options: ['War', 'A new Constitution', 'Trade', 'Territory'], correctIndex: 1 },
  { id: 'q-hist-fed-3', categoryKey: 'history', textId: 'history-federalist', question: 'What does this comprehend?', options: ['Little', 'Nothing less than the Union\'s existence', 'Only trade', 'Military matters'], correctIndex: 1 },

  // ─── History: Marco Polo ──────────────────────────────────────
  { id: 'q-hist-polo-1', categoryKey: 'history', textId: 'history-marco-polo', question: 'Who should read through this book?', options: ['Only scholars', 'Emperors, kings, and all people', 'Only travelers', 'Only children'], correctIndex: 1 },
  { id: 'q-hist-polo-2', categoryKey: 'history', textId: 'history-marco-polo', question: 'What will you find in it?', options: ['Nothing', 'The greatest characteristics of peoples', 'Only maps', 'Only stories'], correctIndex: 1 },
  { id: 'q-hist-polo-3', categoryKey: 'history', textId: 'history-marco-polo', question: 'What regions are especially described?', options: ['Europe', 'Armenia, Persia, India, Tartary', 'Africa', 'America'], correctIndex: 1 },

  // ─── History: Bede ────────────────────────────────────────────
  { id: 'q-hist-bede-1', categoryKey: 'history', textId: 'history-bede', question: 'What was Britain formerly called?', options: ['England', 'Albion', 'Britannia', 'Alba'], correctIndex: 1 },
  { id: 'q-hist-bede-2', categoryKey: 'history', textId: 'history-bede', question: 'How long does Britain extend?', options: ['400 miles', '800 miles', '1000 miles', '500 miles'], correctIndex: 1 },
  { id: 'q-hist-bede-3', categoryKey: 'history', textId: 'history-bede', question: 'What coasts does it face?', options: ['African', 'Germany, France, and Spain', 'American', 'Asian'], correctIndex: 1 },

  // ─── History: Machiavelli ─────────────────────────────────────
  { id: 'q-hist-mach-1', categoryKey: 'history', textId: 'history-machiavelli', question: 'What are all states either?', options: ['Good or bad', 'Republics or principalities', 'Large or small', 'Old or new'], correctIndex: 1 },
  { id: 'q-hist-mach-2', categoryKey: 'history', textId: 'history-machiavelli', question: 'What are the two types of principalities?', options: ['Rich and poor', 'Hereditary and new', 'Large and small', 'Strong and weak'], correctIndex: 1 },
  { id: 'q-hist-mach-3', categoryKey: 'history', textId: 'history-machiavelli', question: 'In hereditary principalities, what has long been established?', options: ['Laws', 'The family', 'Religion', 'Trade'], correctIndex: 1 },

  // ─── History: Augustine ───────────────────────────────────────
  { id: 'q-hist-aug-1', categoryKey: 'history', textId: 'history-augustine', question: 'What is great and greatly to be praised?', options: ['Man', 'Thou, O Lord', 'Nature', 'Kings'], correctIndex: 1 },
  { id: 'q-hist-aug-2', categoryKey: 'history', textId: 'history-augustine', question: 'What is man?', options: ['Great', 'A particle of creation', 'Nothing', 'Everything'], correctIndex: 1 },
  { id: 'q-hist-aug-3', categoryKey: 'history', textId: 'history-augustine', question: 'What does God resist?', options: ['The weak', 'The proud', 'The poor', 'The humble'], correctIndex: 1 },

  // ─── Mindfulness: Thich Nhat Hanh ─────────────────────────────
  { id: 'q-mind-thich-1', categoryKey: 'wisdom', textId: 'mindfulness-thich', question: 'How should you drink your tea?', options: ['Quickly', 'Slowly and reverently', 'While working', 'While talking'], correctIndex: 1 },
  { id: 'q-mind-thich-2', categoryKey: 'wisdom', textId: 'mindfulness-thich', question: 'What is the only moment that is life?', options: ['The past', 'This moment', 'The future', 'Memory'], correctIndex: 1 },
  { id: 'q-mind-thich-3', categoryKey: 'wisdom', textId: 'mindfulness-thich', question: 'How should you walk?', options: ['Quickly', 'As if kissing the Earth with your feet', 'Looking down', 'Alone'], correctIndex: 1 },

  // ─── Mindfulness: Zen Mind ────────────────────────────────────
  { id: 'q-mind-zen-1', categoryKey: 'wisdom', textId: 'mindfulness-zen-mind', question: 'What has many possibilities?', options: ['Expert\'s mind', 'Beginner\'s mind', 'Child\'s mind', 'Old mind'], correctIndex: 1 },
  { id: 'q-mind-zen-2', categoryKey: 'wisdom', textId: 'mindfulness-zen-mind', question: 'What is the empty mind ready for?', options: ['Nothing', 'Anything', 'Only meditation', 'Sleep'], correctIndex: 1 },
  { id: 'q-mind-zen-3', categoryKey: 'wisdom', textId: 'mindfulness-zen-mind', question: 'What limits our vast mind?', options: ['Nothing', 'Self-centered thoughts', 'Others', 'The world'], correctIndex: 1 },

  // ─── Mindfulness: Rumi ────────────────────────────────────────
  { id: 'q-mind-rumi-1', categoryKey: 'wisdom', textId: 'mindfulness-rumi', question: 'What is this being human compared to?', options: ['A journey', 'A guest house', 'A prison', 'A garden'], correctIndex: 1 },
  { id: 'q-mind-rumi-2', categoryKey: 'wisdom', textId: 'mindfulness-rumi', question: 'What comes every morning?', options: ['Sunrise', 'A new arrival', 'Work', 'Worry'], correctIndex: 1 },
  { id: 'q-mind-rumi-3', categoryKey: 'wisdom', textId: 'mindfulness-rumi', question: 'How should you treat each guest?', options: ['With suspicion', 'Honorably', 'Quickly', 'Carefully'], correctIndex: 1 },

  // ─── Mindfulness: Kahlil ──────────────────────────────────────
  { id: 'q-mind-kah-1', categoryKey: 'wisdom', textId: 'mindfulness-kahlil', question: 'What is pain the breaking of?', options: ['The heart', 'The shell that encloses understanding', 'The body', 'The spirit'], correctIndex: 1 },
  { id: 'q-mind-kah-2', categoryKey: 'wisdom', textId: 'mindfulness-kahlil', question: 'What must the stone of the fruit do?', options: ['Stay hard', 'Break', 'Grow', 'Decay'], correctIndex: 1 },
  { id: 'q-mind-kah-3', categoryKey: 'wisdom', textId: 'mindfulness-kahlil', question: 'If you keep wonder, what would pain seem?', options: ['Worse', 'Not less wondrous than joy', 'Gone', 'Meaningless'], correctIndex: 1 },

  // ─── Mindfulness: Dhammapada ───────────────────────────────────
  { id: 'q-mind-dham-1', categoryKey: 'wisdom', textId: 'mindfulness-dhammapada', question: 'What is all that we are the result of?', options: ['Actions', 'What we have thought', 'Luck', 'Others'], correctIndex: 1 },
  { id: 'q-mind-dham-2', categoryKey: 'wisdom', textId: 'mindfulness-dhammapada', question: 'What follows an evil thought?', options: ['Happiness', 'Pain', 'Nothing', 'Wisdom'], correctIndex: 1 },
  { id: 'q-mind-dham-3', categoryKey: 'wisdom', textId: 'mindfulness-dhammapada', question: 'What follows a pure thought?', options: ['Pain', 'Happiness', 'Confusion', 'Nothing'], correctIndex: 1 },

  // ─── Mindfulness: Eckhart ─────────────────────────────────────
  { id: 'q-mind-eck-1', categoryKey: 'wisdom', textId: 'mindfulness-eckhart', question: 'What is all you have?', options: ['The past', 'The present moment', 'The future', 'Possessions'], correctIndex: 1 },
  { id: 'q-mind-eck-2', categoryKey: 'wisdom', textId: 'mindfulness-eckhart', question: 'Why isn\'t time precious?', options: ['It\'s infinite', 'It is an illusion', 'It\'s free', 'It\'s fast'], correctIndex: 1 },
  { id: 'q-mind-eck-3', categoryKey: 'wisdom', textId: 'mindfulness-eckhart', question: 'What makes you miss the Now?', options: ['Sleep', 'Being focused on past and future', 'Work', 'Friends'], correctIndex: 1 },

  // ─── Mindfulness: Chuang Tzu ──────────────────────────────────
  { id: 'q-mind-chuang-1', categoryKey: 'wisdom', textId: 'mindfulness-chuang', question: 'Why does the fish trap exist?', options: ['For fun', 'Because of the fish', 'To float', 'For decoration'], correctIndex: 1 },
  { id: 'q-mind-chuang-2', categoryKey: 'wisdom', textId: 'mindfulness-chuang', question: 'What can you forget once you have the fish?', options: ['Nothing', 'The trap', 'The water', 'The fishing'], correctIndex: 1 },
  { id: 'q-mind-chuang-3', categoryKey: 'wisdom', textId: 'mindfulness-chuang', question: 'What should you flow with?', options: ['Nothing', 'Whatever may happen', 'Only good things', 'Only plans'], correctIndex: 1 },

  // ─── Mindfulness: Thoreau Simplify ────────────────────────────
  { id: 'q-mind-simp-1', categoryKey: 'wisdom', textId: 'mindfulness-thoreau-simplify', question: 'What does Thoreau repeat?', options: ['Work, work', 'Simplify, simplify', 'Think, think', 'Live, live'], correctIndex: 1 },
  { id: 'q-mind-simp-2', categoryKey: 'wisdom', textId: 'mindfulness-thoreau-simplify', question: 'How is our life frittered away?', options: ['By wealth', 'By detail', 'By travel', 'By friends'], correctIndex: 1 },
  { id: 'q-mind-simp-3', categoryKey: 'wisdom', textId: 'mindfulness-thoreau-simplify', question: 'How many affairs should you have?', options: ['A hundred', 'Two or three', 'None', 'Unlimited'], correctIndex: 1 },

  // ─── Mindfulness: Hafiz ───────────────────────────────────────
  { id: 'q-mind-haf-1', categoryKey: 'wisdom', textId: 'mindfulness-hafiz', question: 'What never says "you owe me" to the earth?', options: ['The moon', 'The sun', 'Stars', 'Clouds'], correctIndex: 1 },
  { id: 'q-mind-haf-2', categoryKey: 'wisdom', textId: 'mindfulness-hafiz', question: 'What is the cheapest room in the house?', options: ['Love', 'Fear', 'Hope', 'Joy'], correctIndex: 1 },
  { id: 'q-mind-haf-3', categoryKey: 'wisdom', textId: 'mindfulness-hafiz', question: 'What becomes the house we live in?', options: ['Actions', 'What we speak', 'Dreams', 'Possessions'], correctIndex: 1 },

  // ─── Mindfulness: Pema ────────────────────────────────────────
  { id: 'q-mind-pema-1', categoryKey: 'wisdom', textId: 'mindfulness-pema', question: 'Do things really get solved?', options: ['Yes, always', 'No, they come together and fall apart', 'Sometimes', 'Never'], correctIndex: 1 },
  { id: 'q-mind-pema-2', categoryKey: 'wisdom', textId: 'mindfulness-pema', question: 'Where does healing come from?', options: ['Avoiding pain', 'Letting there be room for all of this', 'Forgetting', 'Fighting'], correctIndex: 1 },
  { id: 'q-mind-pema-3', categoryKey: 'wisdom', textId: 'mindfulness-pema', question: 'What should there be room for?', options: ['Only joy', 'Grief, relief, misery, joy', 'Only relief', 'Nothing'], correctIndex: 1 },

  // ─── Mindfulness: Kabat-Zinn ──────────────────────────────────
  { id: 'q-mind-kab-1', categoryKey: 'wisdom', textId: 'mindfulness-kabat-zinn', question: 'What is mindfulness?', options: ['Thinking hard', 'Paying attention on purpose', 'Forgetting', 'Planning'], correctIndex: 1 },
  { id: 'q-mind-kab-2', categoryKey: 'wisdom', textId: 'mindfulness-kabat-zinn', question: 'What aren\'t little?', options: ['The big things', 'The little things and moments', 'Nothing', 'Problems'], correctIndex: 1 },
  { id: 'q-mind-kab-3', categoryKey: 'wisdom', textId: 'mindfulness-kabat-zinn', question: 'What can you learn to do with waves?', options: ['Stop them', 'Surf', 'Ignore them', 'Fear them'], correctIndex: 1 },

  // ─── Mindfulness: Osho ────────────────────────────────────────
  { id: 'q-mind-osho-1', categoryKey: 'wisdom', textId: 'mindfulness-osho', question: 'What should you plan for?', options: ['Failure', 'A miracle', 'Nothing', 'Safety'], correctIndex: 1 },
  { id: 'q-mind-osho-2', categoryKey: 'wisdom', textId: 'mindfulness-osho', question: 'What is the greatest rebellion in existence?', options: ['War', 'Creativity', 'Politics', 'Wealth'], correctIndex: 1 },
  { id: 'q-mind-osho-3', categoryKey: 'wisdom', textId: 'mindfulness-osho', question: 'How should you experience life?', options: ['Safely', 'In all possible ways', 'Carefully', 'Slowly'], correctIndex: 1 },

  // ─── Mindfulness: Krishnamurti ─────────────────────────────────
  { id: 'q-mind-krish-1', categoryKey: 'wisdom', textId: 'mindfulness-krishnamurti', question: 'What must you understand?', options: ['Part of life', 'The whole of life', 'Only work', 'Only love'], correctIndex: 1 },
  { id: 'q-mind-krish-2', categoryKey: 'wisdom', textId: 'mindfulness-krishnamurti', question: 'What should you do according to Krishnamurti?', options: ['Only read', 'Read, look at skies, sing, dance, write poems, suffer', 'Only meditate', 'Only work'], correctIndex: 1 },
  { id: 'q-mind-krish-3', categoryKey: 'wisdom', textId: 'mindfulness-krishnamurti', question: 'What happens when the mind is secure?', options: ['Growth', 'It is in decay', 'Peace', 'Wisdom'], correctIndex: 1 },

  // ─── Mindfulness: Alan Watts ──────────────────────────────────
  { id: 'q-mind-watts-1', categoryKey: 'wisdom', textId: 'mindfulness-watts', question: 'How do you make sense of change?', options: ['Fight it', 'Plunge into it and join the dance', 'Avoid it', 'Ignore it'], correctIndex: 1 },
  { id: 'q-mind-watts-2', categoryKey: 'wisdom', textId: 'mindfulness-watts', question: 'What are our private thoughts not?', options: ['Important', 'Actually our own', 'Meaningful', 'Real'], correctIndex: 1 },
  { id: 'q-mind-watts-3', categoryKey: 'wisdom', textId: 'mindfulness-watts', question: 'How is muddy water best cleared?', options: ['By stirring', 'By leaving it alone', 'By filtering', 'By heating'], correctIndex: 1 },

  // ─── Story: The Tortoise and the Hare ─────────────────────────
  { id: 'q-story-tortoise-1', categoryKey: 'story', textId: 'story-tortoise', question: 'Who challenged the Hare to a race?', options: ['The Fox', 'The Tortoise', 'The Owl', 'The Rabbit'], correctIndex: 1 },
  { id: 'q-story-tortoise-2', categoryKey: 'story', textId: 'story-tortoise', question: 'What did the Hare do during the race?', options: ['Ran the whole time', 'Took a nap', 'Got lost', 'Quit halfway'], correctIndex: 1 },
  { id: 'q-story-tortoise-3', categoryKey: 'story', textId: 'story-tortoise', question: 'What is the moral of the story?', options: ['Speed is everything', 'Slow and steady wins the race', 'Never race anyone', 'Always take shortcuts'], correctIndex: 1 },

  // ─── Story: The Gift of the Magi ──────────────────────────────
  { id: 'q-story-magi-1', categoryKey: 'story', textId: 'story-gift-magi', question: 'How much money did Della have?', options: ['Three dollars', 'One dollar and eighty-seven cents', 'Five dollars', 'Ten cents'], correctIndex: 1 },
  { id: 'q-story-magi-2', categoryKey: 'story', textId: 'story-gift-magi', question: 'What holiday was approaching?', options: ['Thanksgiving', 'Easter', 'Christmas', 'New Year'], correctIndex: 2 },
  { id: 'q-story-magi-3', categoryKey: 'story', textId: 'story-gift-magi', question: 'How were the pennies saved?', options: ['From a piggy bank', 'One and two at a time by bargaining', 'By skipping meals', 'From a savings account'], correctIndex: 1 },

  // ─── Story: The Tell-Tale Heart ───────────────────────────────
  { id: 'q-story-tell-1', categoryKey: 'story', textId: 'story-tell-tale', question: 'What sense does the narrator claim was sharpened?', options: ['Sight', 'Taste', 'Hearing', 'Touch'], correctIndex: 2 },
  { id: 'q-story-tell-2', categoryKey: 'story', textId: 'story-tell-tale', question: 'How does the narrator describe himself?', options: ['Calm and happy', 'Very dreadfully nervous', 'Bold and confident', 'Sleepy and tired'], correctIndex: 1 },
  { id: 'q-story-tell-3', categoryKey: 'story', textId: 'story-tell-tale', question: 'What does the narrator insist he is not?', options: ['A criminal', 'Mad', 'Nervous', 'A storyteller'], correctIndex: 1 },
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
