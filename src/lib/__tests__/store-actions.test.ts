import { useSettingsStore } from '../store/settings';
import type { SavedWord } from '../store/settings';

// Helper to reset store to defaults before each test
function resetStore() {
  useSettingsStore.getState().resetAll();
}

function makeWord(overrides: Partial<SavedWord> = {}): SavedWord {
  return {
    id: `word-${Date.now()}-${Math.random()}`,
    word: 'test',
    savedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  resetStore();
});

describe('addSavedWord', () => {
  it('adds a word to the word bank', () => {
    const word = makeWord({ word: 'hello' });
    useSettingsStore.getState().addSavedWord(word);
    expect(useSettingsStore.getState().savedWords).toHaveLength(1);
    expect(useSettingsStore.getState().savedWords[0].word).toBe('hello');
  });

  it('prevents duplicate words', () => {
    const word1 = makeWord({ id: 'a', word: 'hello' });
    const word2 = makeWord({ id: 'b', word: 'hello' });
    useSettingsStore.getState().addSavedWord(word1);
    useSettingsStore.getState().addSavedWord(word2);
    expect(useSettingsStore.getState().savedWords).toHaveLength(1);
  });

  it('respects free user 10-word limit', () => {
    // Free user (isPremium = false by default after reset)
    for (let i = 0; i < 12; i++) {
      useSettingsStore.getState().addSavedWord(makeWord({ word: `word${i}` }));
    }
    expect(useSettingsStore.getState().savedWords).toHaveLength(10);
  });

  it('allows premium users to exceed 10-word limit', () => {
    useSettingsStore.setState({ isPremium: true });
    for (let i = 0; i < 12; i++) {
      useSettingsStore.getState().addSavedWord(makeWord({ word: `word${i}` }));
    }
    expect(useSettingsStore.getState().savedWords).toHaveLength(12);
  });
});

describe('enrichSavedWord', () => {
  it('adds definition data to a word without one', () => {
    const word = makeWord({ word: 'ephemeral' });
    useSettingsStore.getState().addSavedWord(word);
    useSettingsStore.getState().enrichSavedWord('ephemeral', {
      definition: 'lasting for a very short time',
      syllables: 'e·phem·er·al',
      partOfSpeech: 'adjective',
    });
    const updated = useSettingsStore.getState().savedWords[0];
    expect(updated.definition).toBe('lasting for a very short time');
    expect(updated.syllables).toBe('e·phem·er·al');
  });

  it('does not overwrite existing definition', () => {
    const word = makeWord({
      word: 'ephemeral',
      definition: 'original definition',
    });
    useSettingsStore.getState().addSavedWord(word);
    useSettingsStore.getState().enrichSavedWord('ephemeral', {
      definition: 'new definition',
    });
    expect(useSettingsStore.getState().savedWords[0].definition).toBe('original definition');
  });

  it('no-ops for missing word', () => {
    useSettingsStore.getState().enrichSavedWord('nonexistent', {
      definition: 'test',
    });
    expect(useSettingsStore.getState().savedWords).toHaveLength(0);
  });
});

describe('canUseFreeQuiz / canUseFreeDefinition / canUseFreePronunciation', () => {
  it('free quiz: allows first use, blocks second same day', () => {
    expect(useSettingsStore.getState().canUseFreeQuiz()).toBe(true);
    useSettingsStore.getState().useFreeQuiz();
    expect(useSettingsStore.getState().canUseFreeQuiz()).toBe(false);
  });

  it('free definition: allows 2 per day, blocks third', () => {
    expect(useSettingsStore.getState().canUseFreeDefinition()).toBe(true);
    useSettingsStore.getState().useFreeDefinition();
    expect(useSettingsStore.getState().canUseFreeDefinition()).toBe(true);
    useSettingsStore.getState().useFreeDefinition();
    expect(useSettingsStore.getState().canUseFreeDefinition()).toBe(false);
  });

  it('free pronunciation: allows 3 per day, blocks fourth', () => {
    expect(useSettingsStore.getState().canUseFreePronunciation()).toBe(true);
    useSettingsStore.getState().useFreePronunciation();
    useSettingsStore.getState().useFreePronunciation();
    useSettingsStore.getState().useFreePronunciation();
    expect(useSettingsStore.getState().canUseFreePronunciation()).toBe(false);
  });

  it('premium users always can use definitions', () => {
    useSettingsStore.setState({ isPremium: true });
    expect(useSettingsStore.getState().canUseFreeDefinition()).toBe(true);
    useSettingsStore.getState().useFreeDefinition();
    useSettingsStore.getState().useFreeDefinition();
    useSettingsStore.getState().useFreeDefinition();
    // Premium still returns true
    expect(useSettingsStore.getState().canUseFreeDefinition()).toBe(true);
  });
});

describe('canShowPaywall', () => {
  it('returns true when no paywall has been shown', () => {
    expect(useSettingsStore.getState().canShowPaywall()).toBe(true);
  });

  it('returns false within 2-hour cooldown', () => {
    // Simulate a recent paywall show
    useSettingsStore.setState({
      lastPaywallShown: new Date().toISOString(),
      paywallDismissCount: 0,
    });
    expect(useSettingsStore.getState().canShowPaywall()).toBe(false);
  });

  it('returns true after 2-hour cooldown passes', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000 - 1000).toISOString();
    useSettingsStore.setState({
      lastPaywallShown: twoHoursAgo,
      paywallDismissCount: 0,
    });
    expect(useSettingsStore.getState().canShowPaywall()).toBe(true);
  });

  it('uses 24-hour cooldown after 3 dismissals', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    useSettingsStore.setState({
      lastPaywallShown: threeHoursAgo,
      paywallDismissCount: 3,
    });
    // 3h > 2h but < 24h — should be blocked because dismiss count >= 3
    expect(useSettingsStore.getState().canShowPaywall()).toBe(false);
  });
});

describe('updateStreak', () => {
  it('starts a streak on first reading', () => {
    useSettingsStore.getState().updateStreak();
    expect(useSettingsStore.getState().currentStreak).toBe(1);
    expect(useSettingsStore.getState().lastReadDate).not.toBeNull();
  });

  it('does not increment within same 24h window', () => {
    useSettingsStore.getState().updateStreak();
    expect(useSettingsStore.getState().currentStreak).toBe(1);
    // Call again immediately — should stay at 1
    useSettingsStore.getState().updateStreak();
    expect(useSettingsStore.getState().currentStreak).toBe(1);
  });

  it('increments streak for consecutive day read (at exactly 24h boundary)', () => {
    // Consecutive-day window in the store is 24h < elapsed <= 48h.
    // Use exactly 24h to verify the lower boundary increments.
    const exactly24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    useSettingsStore.setState({
      currentStreak: 5,
      lastReadDate: exactly24h,
    });
    useSettingsStore.getState().updateStreak();
    // At exactly 24h, elapsed === HOURS_24 so first check (< 24h) is false,
    // second check (<= HOURS_48) is true -> increment
    expect(useSettingsStore.getState().currentStreak).toBe(6);
  });

  it('sets pending restore on 48h+ gap (streak broken)', () => {
    // Set lastReadDate to 3 days ago
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    useSettingsStore.setState({
      currentStreak: 10,
      lastReadDate: threeDaysAgo,
    });
    useSettingsStore.getState().updateStreak();
    // Should have pending restore, not reset streak yet
    const state = useSettingsStore.getState();
    expect(state.pendingStreakRestore).not.toBeNull();
    expect(state.pendingStreakRestore?.previousStreak).toBe(10);
  });
});

describe('useStreakRestore', () => {
  it('does not restore when no restores are available', () => {
    useSettingsStore.setState({
      streakRestores: 0,
      currentStreak: 1,
      pendingStreakRestore: {
        previousStreak: 12,
        breakDate: new Date().toISOString(),
      },
    });

    useSettingsStore.getState().useStreakRestore();

    const state = useSettingsStore.getState();
    expect(state.currentStreak).toBe(1);
    expect(state.streakRestores).toBe(0);
    expect(state.pendingStreakRestore).not.toBeNull();
  });

  it('restores streak and consumes one allowance when available', () => {
    useSettingsStore.setState({
      streakRestores: 2,
      currentStreak: 1,
      pendingStreakRestore: {
        previousStreak: 9,
        breakDate: new Date().toISOString(),
      },
    });

    useSettingsStore.getState().useStreakRestore();

    const state = useSettingsStore.getState();
    expect(state.currentStreak).toBe(9);
    expect(state.streakRestores).toBe(1);
    expect(state.pendingStreakRestore).toBeNull();
  });
});
