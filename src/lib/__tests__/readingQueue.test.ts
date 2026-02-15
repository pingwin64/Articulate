import { getReadingQueue } from '../readingQueue';
import { categories, FREE_CATEGORY_KEYS } from '../data/categories';
import { useSettingsStore } from '../store/settings';

beforeEach(() => {
  useSettingsStore.getState().resetAll();
});

describe('getReadingQueue', () => {
  it('uses the most recent read category for continue suggestions', () => {
    const story = categories.find((c) => c.key === 'story');
    const poetry = categories.find((c) => c.key === 'poetry');
    expect(story).toBeDefined();
    expect(poetry).toBeDefined();

    const storyRead = story!.texts[0];
    const olderPoetryRead = poetry!.texts[0];

    // readingHistory is newest-first: [latest, older]
    useSettingsStore.setState({
      readingHistory: [
        {
          id: 'history-latest',
          categoryKey: story!.key,
          textId: storyRead.id,
          title: storyRead.title,
          wordsRead: storyRead.words.length,
          completedAt: new Date().toISOString(),
          wpm: 220,
        },
        {
          id: 'history-older',
          categoryKey: poetry!.key,
          textId: olderPoetryRead.id,
          title: olderPoetryRead.title,
          wordsRead: olderPoetryRead.words.length,
          completedAt: new Date().toISOString(),
          wpm: 210,
        },
      ],
    });

    const queue = getReadingQueue(1);
    expect(queue).toHaveLength(1);
    expect(queue[0].reason).toBe('continue');
    expect(queue[0].category.key).toBe('story');
    expect(queue[0].text.id).not.toBe(storyRead.id);
  });

  it('keeps free users inside free categories', () => {
    useSettingsStore.setState({ isPremium: false });
    const queue = getReadingQueue(20);

    expect(queue.length).toBeGreaterThan(0);
    for (const item of queue) {
      expect((FREE_CATEGORY_KEYS as readonly string[]).includes(item.category.key)).toBe(true);
    }
  });

  it('surfaces newly unlocked texts before explore fillers', () => {
    useSettingsStore.setState({
      isPremium: false,
      categoryReadCounts: { story: 2 },
      readingHistory: [],
    });

    const queue = getReadingQueue(1);
    expect(queue).toHaveLength(1);
    expect(queue[0].reason).toBe('new_unlock');
  });
});
