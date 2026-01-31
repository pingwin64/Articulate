export interface TextEntry {
  id: string;
  title: string;
  author?: string;
  words: string[];
}

export interface Category {
  key: string;
  name: string;
  icon: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  texts: TextEntry[];
}

function w(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

// ─── Story ────────────────────────────────────────────────────

const storyTexts: TextEntry[] = [
  {
    id: 'story-village',
    title: 'The Girl Who Loved to Read',
    words: w(`Once upon a time, in a village by the sea, there lived a girl who loved to read. Every morning she would sit beneath the old oak tree and lose herself in stories. The words carried her to places she had never been, and she felt free.`),
  },
  {
    id: 'story-alice',
    title: 'Down the Rabbit-Hole',
    author: 'Lewis Carroll',
    words: w(`Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice, "without pictures or conversations?" So she was considering in her own mind, as well as she could, for the hot day made her feel very sleepy and stupid, whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.`),
  },
  {
    id: 'story-jungle',
    title: 'The Jungle Book Opening',
    author: 'Rudyard Kipling',
    words: w(`It was seven o'clock of a very warm evening in the Seeonee hills when Father Wolf woke up from his day's rest, scratched himself, yawned, and spread out his paws one after the other to get rid of the sleepy feeling in their tips. Mother Wolf lay with her big gray nose dropped across her four tumbling, squealing cubs, and the moon shone into the mouth of the cave where they all lived.`),
  },
];

// ─── Article ──────────────────────────────────────────────────

const articleTexts: TextEntry[] = [
  {
    id: 'article-reading',
    title: 'The Science of Reading Aloud',
    words: w(`Reading aloud strengthens the connection between the eye and the brain. Studies show that speaking words activates deeper memory pathways. When we articulate each word, we process meaning more carefully. This simple practice can improve focus, vocabulary, and comprehension over time.`),
  },
  {
    id: 'article-self-reliance',
    title: 'Self-Reliance',
    author: 'Ralph Waldo Emerson',
    words: w(`There is a time in every man's education when he arrives at the conviction that envy is ignorance; that imitation is suicide; that he must take himself for better, for worse, as his portion; that though the wide universe is full of good, no kernel of nourishing corn can come to him but through his toil bestowed on that plot of ground which is given to him to till. The power which resides in him is new in nature, and none but he knows what that is which he can do, nor does he know until he has tried.`),
  },
  {
    id: 'article-civil-disobedience',
    title: 'On the Duty of Civil Disobedience',
    author: 'Henry David Thoreau',
    words: w(`I heartily accept the motto, "That government is best which governs least;" and I should like to see it acted up to more rapidly and systematically. Carried out, it finally amounts to this, which also I believe, — "That government is best which governs not at all;" and when men are prepared for it, that will be the kind of government which they will have. Government is at best but an expedient; but most governments are usually, and all governments are sometimes, inexpedient.`),
  },
];

// ─── Speech ───────────────────────────────────────────────────

const speechTexts: TextEntry[] = [
  {
    id: 'speech-declaration',
    title: 'Declaration of Independence',
    author: 'Thomas Jefferson',
    words: w(`We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.`),
  },
  {
    id: 'speech-gettysburg',
    title: 'Gettysburg Address',
    author: 'Abraham Lincoln',
    words: w(`Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.`),
  },
  {
    id: 'speech-fdr',
    title: 'First Inaugural Address',
    author: 'Franklin D. Roosevelt',
    words: w(`This is preeminently the time to speak the truth, the whole truth, frankly and boldly. Nor need we shrink from honestly facing conditions in our country today. This great Nation will endure as it has endured, will revive and will prosper. So, first of all, let me assert my firm belief that the only thing we have to fear is fear itself — nameless, unreasoning, unjustified terror which paralyzes needed efforts to convert retreat into advance.`),
  },
  {
    id: 'speech-liberty',
    title: 'Give Me Liberty, or Give Me Death!',
    author: 'Patrick Henry',
    words: w(`Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? Forbid it, Almighty God! I know not what course others may take; but as for me, give me liberty, or give me death!`),
  },
];

// ─── Philosophy ───────────────────────────────────────────────

const philosophyTexts: TextEntry[] = [
  {
    id: 'philosophy-wisdom',
    title: 'Ancient Wisdom',
    words: w(`The unexamined life is not worth living. We are what we repeatedly do. Excellence, then, is not an act, but a habit. The only true wisdom is in knowing you know nothing. Happiness depends upon ourselves. It is the mark of an educated mind to be able to entertain a thought without accepting it.`),
  },
  {
    id: 'philosophy-meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    words: w(`When you arise in the morning, think of what a precious privilege it is to be alive — to breathe, to think, to enjoy, to love. Dwell on the beauty of life. Watch the stars, and see yourself running with them. Very little is needed to make a happy life; it is all within yourself, in your way of thinking. The happiness of your life depends upon the quality of your thoughts: therefore, guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature.`),
  },
  {
    id: 'philosophy-seneca',
    title: 'On the Shortness of Life',
    author: 'Seneca',
    words: w(`It is not that we have a short time to live, but that we waste a great deal of it. Life is long enough, and a sufficiently generous amount has been given to us for the highest achievements if it were all well invested. But when it is wasted in heedless luxury and spent on no good activity, we are forced at last by death's final constraint to realize that it has passed away before we knew it was passing.`),
  },
];

// ─── Science ──────────────────────────────────────────────────

const scienceTexts: TextEntry[] = [
  {
    id: 'science-curie',
    title: 'On Curiosity and Discovery',
    words: w(`Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less. A scientist in a laboratory is not a mere technician: they are a child placed before natural phenomena which impress them like a fairy tale. We must believe that we are gifted for something, and that this thing, at whatever cost, must be attained.`),
  },
  {
    id: 'science-origin',
    title: 'On the Origin of Species',
    author: 'Charles Darwin',
    words: w(`When on board H.M.S. Beagle, as naturalist, I was much struck with certain facts in the distribution of the inhabitants of South America, and in the geological relations of the present to the past inhabitants of that continent. These facts seemed to me to throw some light on the origin of species — that mystery of mysteries, as it has been called by one of our greatest philosophers. There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one.`),
  },
  {
    id: 'science-eureka',
    title: 'Eureka: A Prose Poem',
    author: 'Edgar Allan Poe',
    words: w(`I design to speak of the Physical, Metaphysical and Mathematical — of the Material and Spiritual Universe: of its Essence, its Origin, its Creation, its Present Condition and its Destiny. In the Original Unity of the First Thing lies the Secondary Cause of All Things, with the Germ of their Inevitable Annihilation. The Universe is a plot of God.`),
  },
];

// ─── Literature ───────────────────────────────────────────────

const literatureTexts: TextEntry[] = [
  {
    id: 'literature-classics',
    title: 'Classic Opening Lines',
    words: w(`It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. All happy families are alike; each unhappy family is unhappy in its own way. It was the best of times, it was the worst of times.`),
  },
  {
    id: 'literature-moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    words: w(`Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; then, I account it high time to get to sea as soon as I can.`),
  },
  {
    id: 'literature-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    words: w(`In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had." He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.`),
  },
  {
    id: 'literature-romeo-juliet',
    title: 'Romeo and Juliet Prologue',
    author: 'William Shakespeare',
    words: w(`Two households, both alike in dignity, in fair Verona, where we lay our scene, from ancient grudge break to new mutiny, where civil blood makes civil hands unclean. From forth the fatal loins of these two foes a pair of star-crossed lovers take their life; whose misadventured piteous overthrows do with their death bury their parents' strife.`),
  },
];

// ─── Poetry ───────────────────────────────────────────────────

const poetryTexts: TextEntry[] = [
  {
    id: 'poetry-road',
    title: 'The Road Not Taken',
    author: 'Robert Frost',
    words: w(`Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth. I shall be telling this with a sigh somewhere ages and ages hence.`),
  },
  {
    id: 'poetry-sonnet18',
    title: 'Sonnet 18',
    author: 'William Shakespeare',
    words: w(`Shall I compare thee to a summer's day? Thou art more lovely and more temperate. Rough winds do shake the darling buds of May, and summer's lease hath all too short a date. Sometime too hot the eye of heaven shines, and often is his gold complexion dimmed; and every fair from fair sometime declines, by chance, or nature's changing course, untrimmed.`),
  },
  {
    id: 'poetry-whitman',
    title: 'I Hear America Singing',
    author: 'Walt Whitman',
    words: w(`I hear America singing, the varied carols I hear, those of mechanics, each one singing his as it should be blithe and strong, the carpenter singing his as he measures his plank or beam, the mason singing his as he makes ready for work, or leaves off work, the boatman singing what belongs to him in his boat, the deckhand singing on the steamboat deck.`),
  },
  {
    id: 'poetry-dickinson',
    title: 'Hope is the thing with feathers',
    author: 'Emily Dickinson',
    words: w(`Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all, and sweetest in the gale is heard; and sore must be the storm that could abash the little bird that kept so many warm. I've heard it in the chillest land, and on the strangest sea; yet, never, in extremity, it asked a crumb of me.`),
  },
];

// ─── History ──────────────────────────────────────────────────

const historyTexts: TextEntry[] = [
  {
    id: 'history-civilization',
    title: 'The Story of Civilization',
    words: w(`In the beginning, there was nothing. Then there was everything. The story of civilization is the story of people who refused to accept the world as it was. History is not the past. It is the present. We carry our history with us. We are our history.`),
  },
  {
    id: 'history-herodotus',
    title: 'The Histories',
    author: 'Herodotus',
    words: w(`These are the researches of Herodotus of Halicarnassus, which he publishes, in the hope of thereby preserving from decay the remembrance of what men have done, and of preventing the great and wonderful actions of the Greeks and the Barbarians from losing their due meed of glory; and withal to put on record what were their grounds of feud. According to the Persians best informed in history, the Phoenicians began the quarrel.`),
  },
  {
    id: 'history-declaration-full',
    title: 'Declaration of Independence — Full Preamble',
    author: 'Thomas Jefferson',
    words: w(`When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation. We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.`),
  },
];

// ─── Mindfulness ──────────────────────────────────────────────

const mindfulnessTexts: TextEntry[] = [
  {
    id: 'mindfulness-presence',
    title: 'On Presence',
    words: w(`Breathe. Be here. Be now. The present moment is filled with joy and happiness. If you are attentive, you will see it. Peace comes from within. Do not seek it without. The mind is everything. What you think, you become. In the middle of difficulty lies opportunity.`),
  },
  {
    id: 'mindfulness-tao',
    title: 'Tao Te Ching',
    author: 'Lao Tzu',
    words: w(`The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name. The nameless is the beginning of heaven and earth. The named is the mother of ten thousand things. Ever desireless, one can see the mystery. Ever desiring, one can see the manifestations. These two spring from the same source but differ in name; this appears as darkness. Darkness within darkness. The gate to all mystery.`),
  },
  {
    id: 'mindfulness-meditations-calm',
    title: 'On Calm and Presence',
    author: 'Marcus Aurelius',
    words: w(`You have power over your mind — not outside events. Realize this, and you will find strength. The soul becomes dyed with the color of its thoughts. Think only on those things that are in line with your principles and can bear the full light of day. The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane. Waste no more time arguing about what a good person should be. Be one.`),
  },
];

// ─── Export ───────────────────────────────────────────────────

export const categories: Category[] = [
  {
    key: 'story',
    name: 'Story',
    icon: 'book-open',
    level: 'beginner',
    texts: storyTexts,
  },
  {
    key: 'article',
    name: 'Article',
    icon: 'file-text',
    level: 'intermediate',
    texts: articleTexts,
  },
  {
    key: 'speech',
    name: 'Speech',
    icon: 'mic',
    level: 'intermediate',
    texts: speechTexts,
  },
  {
    key: 'philosophy',
    name: 'Philosophy',
    icon: 'compass',
    level: 'advanced',
    texts: philosophyTexts,
  },
  {
    key: 'science',
    name: 'Science',
    icon: 'zap',
    level: 'intermediate',
    texts: scienceTexts,
  },
  {
    key: 'literature',
    name: 'Literature',
    icon: 'bookmark',
    level: 'intermediate',
    texts: literatureTexts,
  },
  {
    key: 'poetry',
    name: 'Poetry',
    icon: 'feather',
    level: 'beginner',
    texts: poetryTexts,
  },
  {
    key: 'history',
    name: 'History',
    icon: 'clock',
    level: 'intermediate',
    texts: historyTexts,
  },
  {
    key: 'mindfulness',
    name: 'Mindfulness',
    icon: 'wind',
    level: 'beginner',
    texts: mindfulnessTexts,
  },
];
