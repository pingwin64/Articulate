export interface Category {
  key: string;
  name: string;
  wordCount: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  words: string[];
}

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
    key: 'philosophy',
    name: 'Philosophy',
    wordCount: philosophyWords.length,
    level: 'advanced',
    words: philosophyWords,
  },
  {
    key: 'science',
    name: 'Science',
    wordCount: scienceWords.length,
    level: 'intermediate',
    words: scienceWords,
  },
  {
    key: 'literature',
    name: 'Literature',
    wordCount: literatureWords.length,
    level: 'intermediate',
    words: literatureWords,
  },
  {
    key: 'poetry',
    name: 'Poetry',
    wordCount: poetryWords.length,
    level: 'beginner',
    words: poetryWords,
  },
  {
    key: 'history',
    name: 'History',
    wordCount: historyWords.length,
    level: 'intermediate',
    words: historyWords,
  },
  {
    key: 'mindfulness',
    name: 'Mindfulness',
    wordCount: mindfulnessWords.length,
    level: 'beginner',
    words: mindfulnessWords,
  },
];
