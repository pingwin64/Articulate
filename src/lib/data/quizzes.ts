export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  categoryKey: string;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  {
    categoryKey: 'story',
    questions: [
      {
        question: 'Where did the girl live?',
        options: ['In a city', 'In a village by the sea', 'In the mountains', 'In a forest'],
        correctIndex: 1,
      },
      {
        question: 'Where did she sit to read?',
        options: ['By the window', 'On the beach', 'Beneath the old oak tree', 'In her room'],
        correctIndex: 2,
      },
      {
        question: 'What did the words do for her?',
        options: [
          'Made her sleepy',
          'Carried her to places she had never been',
          'Taught her to write',
          'Made her sad',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    categoryKey: 'article',
    questions: [
      {
        question: 'What does reading aloud strengthen?',
        options: [
          'Muscles',
          'The connection between the eye and the brain',
          'Social skills',
          'Breathing',
        ],
        correctIndex: 1,
      },
      {
        question: 'What happens when we articulate each word?',
        options: [
          'We read faster',
          'We process meaning more carefully',
          'We forget faster',
          'We lose focus',
        ],
        correctIndex: 1,
      },
      {
        question: 'What can this practice improve over time?',
        options: [
          'Only speed',
          'Focus, vocabulary, and comprehension',
          'Only memory',
          'Writing skills',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    categoryKey: 'speech',
    questions: [
      {
        question: 'What is the speaker\'s dream?',
        options: [
          'To become president',
          'That the nation will live out its creed',
          'To travel the world',
          'To write a book',
        ],
        correctIndex: 1,
      },
      {
        question: 'What truth is described as self-evident?',
        options: [
          'Freedom is expensive',
          'All people are created equal',
          'Education is important',
          'Change is inevitable',
        ],
        correctIndex: 1,
      },
      {
        question: 'Where should freedom ring from?',
        options: [
          'Every city',
          'The capitol',
          'Every mountainside',
          'The White House',
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    categoryKey: 'poetry',
    questions: [
      {
        question: 'Where did the two roads diverge?',
        options: ['In a dark forest', 'In a yellow wood', 'At a crossroads', 'By a river'],
        correctIndex: 1,
      },
      {
        question: 'How did the traveler feel about not taking both roads?',
        options: ['Happy', 'Indifferent', 'Sorry', 'Excited'],
        correctIndex: 2,
      },
      {
        question: 'How will the traveler tell this story in the future?',
        options: ['With joy', 'With a sigh', 'With anger', 'With laughter'],
        correctIndex: 1,
      },
    ],
  },
  {
    categoryKey: 'history',
    questions: [
      {
        question: 'What is the story of civilization about?',
        options: [
          'Wars and battles',
          'People who refused to accept the world as it was',
          'Kings and queens',
          'Technology and science',
        ],
        correctIndex: 1,
      },
      {
        question: 'According to the text, what is history?',
        options: ['The past', 'The present', 'The future', 'A textbook'],
        correctIndex: 1,
      },
      {
        question: 'What do we carry with us?',
        options: ['Our dreams', 'Our history', 'Our fears', 'Our books'],
        correctIndex: 1,
      },
    ],
  },
  {
    categoryKey: 'mindfulness',
    questions: [
      {
        question: 'What is the present moment filled with?',
        options: ['Stress', 'Joy and happiness', 'Uncertainty', 'Silence'],
        correctIndex: 1,
      },
      {
        question: 'Where does peace come from?',
        options: ['Others', 'Nature', 'Within', 'Meditation apps'],
        correctIndex: 2,
      },
      {
        question: 'What does the text say about the mind?',
        options: [
          'It is weak',
          'It is everything',
          'It needs rest',
          'It is complex',
        ],
        correctIndex: 1,
      },
    ],
  },
];

export function getQuizForCategory(categoryKey: string): Quiz | null {
  return quizzes.find((q) => q.categoryKey === categoryKey) ?? null;
}
