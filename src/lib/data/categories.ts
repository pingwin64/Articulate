export interface Category {
  key: string;
  name: string;
  icon: string;
  wordCount: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  words: string[];
}

const storyWords = [
  'Once', 'upon', 'a', 'time,', 'in', 'a', 'village', 'by', 'the', 'sea,',
  'there', 'lived', 'a', 'girl', 'who', 'loved', 'to', 'read.',
  'Every', 'morning', 'she', 'would', 'sit', 'beneath', 'the', 'old', 'oak', 'tree',
  'and', 'lose', 'herself', 'in', 'stories.', 'The', 'words', 'carried', 'her',
  'to', 'places', 'she', 'had', 'never', 'been,', 'and', 'she', 'felt', 'free.',
];

const articleWords = [
  'Reading', 'aloud', 'strengthens', 'the', 'connection', 'between', 'the', 'eye',
  'and', 'the', 'brain.', 'Studies', 'show', 'that', 'speaking', 'words',
  'activates', 'deeper', 'memory', 'pathways.', 'When', 'we', 'articulate',
  'each', 'word,', 'we', 'process', 'meaning', 'more', 'carefully.',
  'This', 'simple', 'practice', 'can', 'improve', 'focus,', 'vocabulary,',
  'and', 'comprehension', 'over', 'time.',
];

const speechWords = [
  'I', 'have', 'a', 'dream', 'that', 'one', 'day', 'this', 'nation',
  'will', 'rise', 'up', 'and', 'live', 'out', 'the', 'true', 'meaning',
  'of', 'its', 'creed.', 'We', 'hold', 'these', 'truths', 'to', 'be',
  'self-evident,', 'that', 'all', 'people', 'are', 'created', 'equal.',
  'Let', 'freedom', 'ring', 'from', 'every', 'mountainside.',
];

const philosophyWords = [
  'The', 'unexamined', 'life', 'is', 'not', 'worth', 'living.',
  'We', 'are', 'what', 'we', 'repeatedly', 'do.',
  'Excellence,', 'then,', 'is', 'not', 'an', 'act,', 'but', 'a', 'habit.',
  'The', 'only', 'true', 'wisdom', 'is', 'in', 'knowing', 'you', 'know', 'nothing.',
  'Happiness', 'depends', 'upon', 'ourselves.',
  'It', 'is', 'the', 'mark', 'of', 'an', 'educated', 'mind', 'to', 'be', 'able',
  'to', 'entertain', 'a', 'thought', 'without', 'accepting', 'it.',
];

const scienceWords = [
  'The', 'cosmos', 'is', 'within', 'us.', 'We', 'are', 'made', 'of', 'star-stuff.',
  'We', 'are', 'a', 'way', 'for', 'the', 'universe', 'to', 'know', 'itself.',
  'Somewhere,', 'something', 'incredible', 'is', 'waiting', 'to', 'be', 'known.',
  'The', 'good', 'thing', 'about', 'science', 'is', 'that',
  'it\'s', 'true', 'whether', 'or', 'not', 'you', 'believe', 'in', 'it.',
  'Nothing', 'in', 'life', 'is', 'to', 'be', 'feared,',
  'it', 'is', 'only', 'to', 'be', 'understood.',
];

const literatureWords = [
  'It', 'is', 'a', 'truth', 'universally', 'acknowledged,', 'that', 'a', 'single',
  'man', 'in', 'possession', 'of', 'a', 'good', 'fortune,', 'must', 'be', 'in',
  'want', 'of', 'a', 'wife.',
  'All', 'happy', 'families', 'are', 'alike;', 'each', 'unhappy', 'family',
  'is', 'unhappy', 'in', 'its', 'own', 'way.',
  'It', 'was', 'the', 'best', 'of', 'times,', 'it', 'was', 'the', 'worst', 'of', 'times.',
];

const poetryWords = [
  'Two', 'roads', 'diverged', 'in', 'a', 'yellow', 'wood,',
  'and', 'sorry', 'I', 'could', 'not', 'travel', 'both',
  'and', 'be', 'one', 'traveler,', 'long', 'I', 'stood',
  'and', 'looked', 'down', 'one', 'as', 'far', 'as', 'I', 'could',
  'to', 'where', 'it', 'bent', 'in', 'the', 'undergrowth.',
  'I', 'shall', 'be', 'telling', 'this', 'with', 'a', 'sigh',
  'somewhere', 'ages', 'and', 'ages', 'hence.',
];

const historyWords = [
  'In', 'the', 'beginning,', 'there', 'was', 'nothing.', 'Then', 'there', 'was',
  'everything.', 'The', 'story', 'of', 'civilization', 'is', 'the', 'story', 'of',
  'people', 'who', 'refused', 'to', 'accept', 'the', 'world', 'as', 'it', 'was.',
  'History', 'is', 'not', 'the', 'past.', 'It', 'is', 'the', 'present.',
  'We', 'carry', 'our', 'history', 'with', 'us.', 'We', 'are', 'our', 'history.',
];

const mindfulnessWords = [
  'Breathe.', 'Be', 'here.', 'Be', 'now.',
  'The', 'present', 'moment', 'is', 'filled', 'with', 'joy', 'and', 'happiness.',
  'If', 'you', 'are', 'attentive,', 'you', 'will', 'see', 'it.',
  'Peace', 'comes', 'from', 'within.', 'Do', 'not', 'seek', 'it', 'without.',
  'The', 'mind', 'is', 'everything.', 'What', 'you', 'think,', 'you', 'become.',
  'In', 'the', 'middle', 'of', 'difficulty', 'lies', 'opportunity.',
];

export const categories: Category[] = [
  {
    key: 'story',
    name: 'Story',
    icon: 'book-open',
    wordCount: storyWords.length,
    level: 'beginner',
    words: storyWords,
  },
  {
    key: 'article',
    name: 'Article',
    icon: 'file-text',
    wordCount: articleWords.length,
    level: 'intermediate',
    words: articleWords,
  },
  {
    key: 'speech',
    name: 'Speech',
    icon: 'mic',
    wordCount: speechWords.length,
    level: 'intermediate',
    words: speechWords,
  },
  {
    key: 'philosophy',
    name: 'Philosophy',
    icon: 'compass',
    wordCount: philosophyWords.length,
    level: 'advanced',
    words: philosophyWords,
  },
  {
    key: 'science',
    name: 'Science',
    icon: 'zap',
    wordCount: scienceWords.length,
    level: 'intermediate',
    words: scienceWords,
  },
  {
    key: 'literature',
    name: 'Literature',
    icon: 'bookmark',
    wordCount: literatureWords.length,
    level: 'intermediate',
    words: literatureWords,
  },
  {
    key: 'poetry',
    name: 'Poetry',
    icon: 'feather',
    wordCount: poetryWords.length,
    level: 'beginner',
    words: poetryWords,
  },
  {
    key: 'history',
    name: 'History',
    icon: 'clock',
    wordCount: historyWords.length,
    level: 'intermediate',
    words: historyWords,
  },
  {
    key: 'mindfulness',
    name: 'Mindfulness',
    icon: 'wind',
    wordCount: mindfulnessWords.length,
    level: 'beginner',
    words: mindfulnessWords,
  },
];
