import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import type { FeatherIconName } from '../types/icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Paywall } from '../components/Paywall';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Spacing } from '../design/theme';

type SortMode = 'recent' | 'alpha' | 'mostRead';
type TabMode = 'myTexts' | 'favorites' | 'words';

const SOURCE_ICONS: Record<string, FeatherIconName> = {
  paste: 'clipboard',
  file: 'file-text',
  url: 'globe',
  scan: 'camera',
};

export default function LibraryScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const {
    customTexts,
    removeCustomText,
    textCollections,
    addCollection,
    removeCollection,
    hapticFeedback,
    favoriteTexts,
    removeFavoriteText,
    savedWords,
    removeSavedWord,
    isPremium,
    showPaywall,
    setPaywallContext,
    paywallContext,
    getFreeTextExpiry,
    cleanupExpiredFreeTexts,
  } = useSettingsStore();

  const params = useLocalSearchParams<{ tab?: string }>();
  const resolvedTab = useMemo<TabMode>(() => {
    const tab = typeof params.tab === 'string' ? params.tab : undefined;
    if (tab === 'favorites') return 'favorites';
    if (tab === 'words') return 'words';
    return 'myTexts';
  }, [params.tab]);
  const [activeTab, setActiveTab] = useState<TabMode>(resolvedTab);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message?: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    setActiveTab(resolvedTab);
  }, [resolvedTab]);

  const filteredTexts = useMemo(() => {
    let texts = [...customTexts];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      texts = texts.filter((t) => t.title.toLowerCase().includes(q));
    }

    // Filter by collection
    if (selectedCollection === 'uncollected') {
      texts = texts.filter((t) => !t.collectionId);
    } else if (selectedCollection) {
      texts = texts.filter((t) => t.collectionId === selectedCollection);
    }

    // Sort
    switch (sortMode) {
      case 'recent':
        texts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'alpha':
        texts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'mostRead':
        texts.sort((a, b) => (b.timesRead ?? 0) - (a.timesRead ?? 0));
        break;
    }

    return texts;
  }, [customTexts, search, sortMode, selectedCollection]);

  const handleTextOptions = useCallback((id: string) => {
    const text = customTexts.find((t) => t.id === id);
    if (!text) return;

    Alert.alert(text.title, undefined, [
      {
        text: 'Edit',
        onPress: () => router.push({ pathname: '/paste', params: { editTextId: id } }),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setConfirmDialog({
            title: 'Delete Text?',
            message: `"${text.title}" will be permanently removed.`,
            confirmLabel: 'Delete',
            onConfirm: () => {
              removeCustomText(id);
              setConfirmDialog(null);
            },
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [customTexts, router, removeCustomText]);

  const handleAddCollection = useCallback(() => {
    setNewCollectionName('');
    setShowCreateCollection(true);
  }, []);

  const handleCreateCollection = useCallback(() => {
    const name = newCollectionName.trim();
    if (!name) return;
    addCollection({
      id: Date.now().toString(36),
      name,
      createdAt: new Date().toISOString(),
    });
    setShowCreateCollection(false);
    setNewCollectionName('');
  }, [addCollection, newCollectionName]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Get detailed info for favorite texts
  const favoriteTextDetails = useMemo(() => {
    return favoriteTexts
      .map((fav) => {
        const category = categories.find((c) => c.key === fav.categoryKey);
        const text = category?.texts.find((t) => t.id === fav.textId);
        if (!category || !text) return null;
        return {
          ...fav,
          category,
          text,
          title: text.title,
          author: text.author,
          wordCount: text.words.length,
        };
      })
      .filter(Boolean);
  }, [favoriteTexts]);

  const handleRemoveFavorite = useCallback((categoryKey: string, textId: string) => {
    setConfirmDialog({
      title: 'Remove from Library?',
      message: 'This text will be removed from your favorites.',
      confirmLabel: 'Remove',
      onConfirm: () => {
        removeFavoriteText(categoryKey, textId);
        setConfirmDialog(null);
      },
    });
  }, [removeFavoriteText]);

  const handleRemoveWord = useCallback((id: string, word: string) => {
    setConfirmDialog({
      title: 'Remove Word',
      message: `Remove "${word}" from your word bank?`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        removeSavedWord(id);
        setConfirmDialog(null);
      },
    });
  }, [removeSavedWord, hapticFeedback]);

  const handleReadMyWords = useCallback(() => {
    if (savedWords.length === 0) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const wordArray = savedWords.map((w) => w.word);
    router.push({
      pathname: '/reading',
      params: { wordBankWords: JSON.stringify(wordArray) },
    });
  }, [savedWords, hapticFeedback, router]);

  // Cleanup expired texts on mount (for free users)
  useEffect(() => {
    if (!isPremium) {
      cleanupExpiredFreeTexts();
    }
  }, [isPremium, cleanupExpiredFreeTexts]);

  // Pro-only gate for Words and Favorites tabs (Texts tab is accessible to free users)
  if (!isPremium && (resolvedTab === 'words' || resolvedTab === 'favorites')) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.lockedState}>
          <GlassCard>
            <View style={styles.lockedCard}>
              <Feather name="lock" size={32} color={colors.muted} />
              <Text style={[styles.lockedTitle, { color: colors.primary }]}>
                {resolvedTab === 'words' ? 'Word Bank is a Pro feature' : 'Favorites is a Pro feature'}
              </Text>
              <Text style={[styles.lockedSubtitle, { color: colors.muted }]}>
                {resolvedTab === 'words' ? 'Save words as you read. Build a vocabulary that grows with you.' :
                 'Save your favorites and pick up where you left off.'}
              </Text>
              <GlassButton
                title={resolvedTab === 'words' ? 'Start Saving Words' : 'Save Your Favorites'}
                onPress={() => setPaywallContext(
                  resolvedTab === 'words' ? 'locked_library_words' : 'locked_library_faves'
                )}
              />
            </View>
          </GlassCard>
        </View>
        <Paywall
          visible={showPaywall}
          onDismiss={() => setPaywallContext(null)}
          context={paywallContext}
        />
      </View>
    );
  }

  // Calculate expiry for free user's text
  const freeTextExpiry = !isPremium ? getFreeTextExpiry() : null;
  const expiryHours = freeTextExpiry ? Math.ceil(freeTextExpiry / (60 * 60 * 1000)) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tab selector */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.tabRow}>
          <Pressable
            onPress={() => {
              setActiveTab('myTexts');
              if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.tabButton,
              activeTab === 'myTexts' && styles.tabButtonActive,
              activeTab === 'myTexts' && { borderColor: colors.primary },
            ]}
          >
            <Feather name="edit-3" size={16} color={activeTab === 'myTexts' ? colors.primary : colors.muted} />
            <Text style={[styles.tabButtonText, { color: activeTab === 'myTexts' ? colors.primary : colors.muted }]}>
              My Texts
            </Text>
            {customTexts.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
                <Text style={[styles.tabBadgeText, { color: colors.muted }]}>{customTexts.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              setActiveTab('favorites');
              if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.tabButton,
              activeTab === 'favorites' && styles.tabButtonActive,
              activeTab === 'favorites' && { borderColor: colors.primary },
            ]}
          >
            <Feather name="heart" size={16} color={activeTab === 'favorites' ? colors.primary : colors.muted} />
            <Text style={[styles.tabButtonText, { color: activeTab === 'favorites' ? colors.primary : colors.muted }]}>
              Favorites
            </Text>
            {isPremium ? (
              favoriteTexts.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
                  <Text style={[styles.tabBadgeText, { color: colors.muted }]}>{favoriteTexts.length}</Text>
                </View>
              )
            ) : (
              <Feather name="lock" size={14} color={colors.muted} />
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              setActiveTab('words');
              if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.tabButton,
              activeTab === 'words' && styles.tabButtonActive,
              activeTab === 'words' && { borderColor: colors.primary },
            ]}
          >
            <Feather name="bookmark" size={16} color={activeTab === 'words' ? colors.primary : colors.muted} />
            <Text style={[styles.tabButtonText, { color: activeTab === 'words' ? colors.primary : colors.muted }]}>
              My Words
            </Text>
            {isPremium ? (
              savedWords.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
                  <Text style={[styles.tabBadgeText, { color: colors.muted }]}>{savedWords.length}</Text>
                </View>
              )
            ) : (
              <Feather name="lock" size={14} color={colors.muted} />
            )}
          </Pressable>
        </Animated.View>

        {/* Search bar */}
        {activeTab !== 'words' && (
          <Animated.View entering={FadeIn.delay(50).duration(300)}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: glass.fill,
                  borderColor: glass.border,
                },
              ]}
            >
              <Feather name="search" size={16} color={colors.muted} />
              <TextInput
                style={[styles.searchInput, { color: colors.primary }]}
                value={search}
                onChangeText={setSearch}
                placeholder={activeTab === 'myTexts' ? 'Search texts...' : 'Search favorites...'}
                placeholderTextColor={colors.muted}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <Feather name="x" size={16} color={colors.muted} />
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}

        {/* MY TEXTS TAB */}
        {activeTab === 'myTexts' && (
          <>
            {/* Sort control */}
            <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.sortRow}>
              {(['recent', 'alpha', 'mostRead'] as SortMode[]).map((mode) => {
                const labels: Record<SortMode, string> = {
                  recent: 'Recent',
                  alpha: 'A-Z',
                  mostRead: 'Most Read',
                };
                const isActive = sortMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      setSortMode(mode);
                      if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.sortPill,
                      {
                        backgroundColor: isActive
                          ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
                          : 'transparent',
                        borderColor: isActive ? glass.border : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortPillText,
                        { color: isActive ? colors.primary : colors.muted },
                      ]}
                    >
                      {labels[mode]}
                    </Text>
                  </Pressable>
                );
              })}
            </Animated.View>

            {/* Collection pills */}
            {textCollections.length > 0 && (
              <Animated.View entering={FadeIn.delay(150).duration(300)}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.collectionRow}
                >
                  <Pressable
                    onPress={() => setSelectedCollection(null)}
                    style={[
                      styles.collectionPill,
                      {
                        backgroundColor: !selectedCollection
                          ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
                          : glass.fill,
                        borderColor: glass.border,
                      },
                    ]}
                  >
                    <Text style={[styles.collectionPillText, { color: !selectedCollection ? colors.primary : colors.muted }]}>
                      All
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedCollection(selectedCollection === 'uncollected' ? null : 'uncollected')}
                    style={[
                      styles.collectionPill,
                      {
                        backgroundColor: selectedCollection === 'uncollected'
                          ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
                          : glass.fill,
                        borderColor: glass.border,
                      },
                    ]}
                  >
                    <Text style={[styles.collectionPillText, { color: selectedCollection === 'uncollected' ? colors.primary : colors.muted }]}>
                      Uncollected
                    </Text>
                  </Pressable>
                  {textCollections.map((col) => (
                    <Pressable
                      key={col.id}
                      onPress={() => setSelectedCollection(selectedCollection === col.id ? null : col.id)}
                      style={[
                        styles.collectionPill,
                        {
                          backgroundColor: selectedCollection === col.id
                            ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
                            : glass.fill,
                          borderColor: glass.border,
                        },
                      ]}
                    >
                      <Text style={[styles.collectionPillText, { color: selectedCollection === col.id ? colors.primary : colors.muted }]}>
                        {col.name}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={handleAddCollection} style={[styles.collectionPill, { borderColor: glass.border }]}>
                    <Feather name="plus" size={14} color={colors.muted} />
                  </Pressable>
                </ScrollView>
              </Animated.View>
            )}

            {/* Text cards */}
            {filteredTexts.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="edit-3" size={40} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.primary }]}>
                  {search ? 'No matches' : 'No texts yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  {search ? 'Try a different search' : 'Paste, scan, or import a text to get started'}
                </Text>
                {!search && (
                  <Pressable
                    onPress={() => router.push('/paste')}
                    style={[styles.emptyButton, { borderColor: colors.muted }]}
                  >
                    <Text style={[styles.emptyButtonText, { color: colors.primary }]}>Add Text</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.textList}>
                {filteredTexts.map((ct, i) => (
                  <Animated.View
                    key={ct.id}
                    entering={FadeIn.delay(i * 40).duration(250)}
                  >
                    <GlassCard
                      onPress={() => {
                        router.push({
                          pathname: '/reading',
                          params: { customTextId: ct.id },
                        });
                      }}
                    >
                      <View style={styles.textCard}>
                        <View style={styles.textCardContent}>
                          <Text
                            style={[styles.textCardTitle, { color: colors.primary }]}
                            numberOfLines={1}
                          >
                            {ct.title}
                          </Text>
                          {ct.preview && (
                            <Text
                              style={[styles.textCardPreview, { color: colors.muted }]}
                              numberOfLines={2}
                            >
                              {ct.preview}
                            </Text>
                          )}
                          <View style={styles.textCardMeta}>
                            <Feather
                              name={SOURCE_ICONS[ct.source ?? 'paste'] ?? 'clipboard'}
                              size={12}
                              color={colors.muted}
                            />
                            <Text style={[styles.textCardMetaText, { color: colors.muted }]}>
                              ~{ct.wordCount}w
                            </Text>
                            {(ct.timesRead ?? 0) > 0 && (
                              <Text style={[styles.textCardMetaText, { color: colors.muted }]}>
                                · {ct.timesRead}x read
                              </Text>
                            )}
                            {ct.lastReadAt && isPremium && (
                              <Text style={[styles.textCardMetaText, { color: colors.muted }]}>
                                · {formatDate(ct.lastReadAt)}
                              </Text>
                            )}
                            {!isPremium && expiryHours !== null && expiryHours > 0 && (
                              <View style={styles.expiryBadge}>
                                <Feather name="clock" size={11} color={colors.secondary} />
                                <Text style={[styles.expiryText, { color: colors.secondary }]}>
                                  {expiryHours}h left
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <Pressable
                          onPress={() => handleTextOptions(ct.id)}
                          hitSlop={8}
                          style={styles.textCardMore}
                        >
                          <Feather name="more-vertical" size={18} color={colors.muted} />
                        </Pressable>
                      </View>
                    </GlassCard>
                  </Animated.View>
                ))}
                {/* Upgrade prompt for free users */}
                {!isPremium && (
                  <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.upgradePrompt}>
                    <Text style={[styles.upgradePromptText, { color: colors.muted }]}>
                      Want unlimited texts that never expire?
                    </Text>
                    <Pressable
                      onPress={() => setPaywallContext('locked_library_texts')}
                      style={styles.upgradePromptLink}
                    >
                      <Text style={[styles.upgradePromptLinkText, { color: colors.primary }]}>
                        Upgrade to Pro
                      </Text>
                      <Feather name="arrow-right" size={14} color={colors.primary} />
                    </Pressable>
                  </Animated.View>
                )}
              </View>
            )}
          </>
        )}

        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <>
            {favoriteTextDetails.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="heart" size={40} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.primary }]}>
                  {search ? 'No matches' : 'No favorites yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  {search ? 'Try a different search' : 'Tap the heart on the complete screen to save texts here'}
                </Text>
                {!search && (
                  <Pressable
                    onPress={() => router.push('/')}
                    style={[styles.emptyButton, { borderColor: colors.muted }]}
                  >
                    <Text style={[styles.emptyButtonText, { color: colors.primary }]}>Start Reading</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.textList}>
                {favoriteTextDetails
                  .filter((fav) => {
                    if (!search.trim()) return true;
                    const q = search.toLowerCase();
                    return fav?.title.toLowerCase().includes(q) || fav?.author?.toLowerCase().includes(q);
                  })
                  .map((fav, i) => {
                    if (!fav) return null;
                    return (
                      <Animated.View
                        key={`${fav.categoryKey}-${fav.textId}`}
                        entering={FadeIn.delay(i * 40).duration(250)}
                      >
                        <GlassCard
                          onPress={() => {
                            router.push({
                              pathname: '/reading',
                              params: { categoryKey: fav.categoryKey, textId: fav.textId },
                            });
                          }}
                        >
                          <View style={styles.textCard}>
                            <View style={styles.textCardContent}>
                              <Text
                                style={[styles.textCardTitle, { color: colors.primary }]}
                                numberOfLines={1}
                              >
                                {fav.title}
                              </Text>
                              {fav.author && (
                                <Text
                                  style={[styles.textCardPreview, { color: colors.muted }]}
                                  numberOfLines={1}
                                >
                                  by {fav.author}
                                </Text>
                              )}
                              <View style={styles.textCardMeta}>
                                <Feather
                                  name={fav.category.icon}
                                  size={12}
                                  color={colors.muted}
                                />
                                <Text style={[styles.textCardMetaText, { color: colors.muted }]}>
                                  {fav.category.name}
                                </Text>
                                <Text style={[styles.textCardMetaText, { color: colors.muted }]}>
                                  · ~{fav.wordCount}w
                                </Text>
                              </View>
                            </View>
                            <Pressable
                              onPress={() => handleRemoveFavorite(fav.categoryKey, fav.textId)}
                              hitSlop={8}
                              style={styles.textCardMore}
                            >
                              <Feather name="heart" size={18} color={colors.primary} />
                            </Pressable>
                          </View>
                        </GlassCard>
                      </Animated.View>
                    );
                  })}
              </View>
            )}
          </>
        )}

        {/* WORDS TAB */}
        {activeTab === 'words' && (
          <>
            {!isPremium ? (
              <View style={styles.lockedState}>
                <GlassCard>
                  <View style={styles.lockedCard}>
                    <Feather name="lock" size={28} color={colors.muted} />
                    <Text style={[styles.lockedTitle, { color: colors.primary }]}>
                      Word Bank is a Pro feature
                    </Text>
                    <Text style={[styles.lockedSubtitle, { color: colors.muted }]}>
                      Save and review your favorite words with definitions.
                    </Text>
                    <GlassButton
                      title="Unlock Word Bank"
                      onPress={() => setPaywallContext('locked_word_bank')}
                    />
                  </View>
                </GlassCard>
              </View>
            ) : savedWords.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="bookmark" size={48} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.primary }]}>
                  No saved words yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  Tap the ? icon while reading to look up words,{'\n'}then tap the heart to save them here.
                </Text>
                <Pressable
                  onPress={() => router.push('/')}
                  style={[styles.emptyButton, { borderColor: colors.muted }]}
                >
                  <Text style={[styles.emptyButtonText, { color: colors.primary }]}>Start Reading</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Animated.View entering={FadeIn.duration(300)} style={styles.readButtonSection}>
                  <View style={styles.buttonRow}>
                    <View style={styles.buttonHalf}>
                      <GlassButton title="Read My Words" onPress={handleReadMyWords} />
                    </View>
                    <View style={styles.buttonHalf}>
                      <GlassButton
                        title="Review"
                        onPress={() => router.push('/word-bank')}
                        variant="outline"
                      />
                    </View>
                  </View>
                  <Text style={[styles.wordCount, { color: colors.muted }]}>
                    {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'} saved
                  </Text>
                </Animated.View>
                <View style={styles.wordList}>
                  {savedWords.map((sw, i) => (
                    <Animated.View key={sw.id} entering={FadeIn.delay(i * 60).duration(300)}>
                      <GlassCard>
                        <View style={styles.wordCardContent}>
                          <View style={styles.wordCardText}>
                            <Text style={[styles.wordTitle, { color: colors.primary }]}>
                              {sw.word}
                            </Text>
                            {(sw.syllables || sw.partOfSpeech) && (
                              <Text style={[styles.wordMeta, { color: colors.muted }]}>
                                {sw.syllables}{sw.syllables && sw.partOfSpeech ? ' · ' : ''}{sw.partOfSpeech}
                              </Text>
                            )}
                            {sw.definition && (
                              <Text style={[styles.wordDefinition, { color: colors.secondary }]} numberOfLines={2}>
                                {sw.definition}
                              </Text>
                            )}
                            {sw.sourceText && (
                              <Text style={[styles.wordSource, { color: colors.muted }]} numberOfLines={1}>
                                from {sw.sourceText}
                              </Text>
                            )}
                          </View>
                          <Pressable
                            onPress={() => handleRemoveWord(sw.id, sw.word)}
                            style={styles.removeButton}
                            hitSlop={8}
                            accessibilityLabel={`Remove ${sw.word}`}
                            accessibilityRole="button"
                          >
                            <Feather name="x" size={16} color={colors.muted} />
                          </Pressable>
                        </View>
                      </GlassCard>
                    </Animated.View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB (My Texts tab only) */}
      {activeTab === 'myTexts' && (
        <Pressable
          onPress={() => router.push('/paste')}
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Feather name="plus" size={24} color={isDark ? '#000' : '#fff'} />
        </Pressable>
      )}

      <Modal
        transparent
        visible={showCreateCollection}
        animationType="fade"
        onRequestClose={() => setShowCreateCollection(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowCreateCollection(false)}
          />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: glass.fill,
                borderColor: glass.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.primary }]}>
              New Collection
            </Text>
            <TextInput
              style={[styles.modalInput, { color: colors.primary, borderColor: glass.border }]}
              placeholder="Collection name"
              placeholderTextColor={colors.muted}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateCollection}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowCreateCollection(false)}
                style={styles.modalCancel}
              >
                <Text style={[styles.modalCancelText, { color: colors.muted }]}>
                  Cancel
                </Text>
              </Pressable>
              <GlassButton title="Create" onPress={handleCreateCollection} />
            </View>
          </View>
        </View>
      </Modal>

      <Paywall
        visible={showPaywall}
        onDismiss={() => setPaywallContext(null)}
        context={paywallContext}
      />

      <ConfirmationDialog
        visible={!!confirmDialog}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel ?? 'Remove'}
        onConfirm={confirmDialog?.onConfirm ?? (() => {})}
        onCancel={() => setConfirmDialog(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: 12,
  },
  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0,
  },
  tabButtonActive: {
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12, // Meets Apple HIG minimum (11pt)
    fontWeight: '600',
  },
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
  },
  // Sort
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  sortPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Collections
  collectionRow: {
    gap: 8,
    paddingVertical: 4,
  },
  collectionPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  collectionPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Text cards
  textList: {
    gap: 10,
  },
  textCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  textCardContent: {
    flex: 1,
    gap: 4,
  },
  textCardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  textCardPreview: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  textCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  textCardMetaText: {
    fontSize: 11,
    fontWeight: '400',
  },
  textCardMore: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 4,
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  upgradePrompt: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6,
  },
  upgradePromptText: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  upgradePromptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upgradePromptLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Word bank (inside Library)
  lockedState: {
    marginTop: Spacing.lg,
  },
  lockedCard: {
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  readButtonSection: {
    gap: 8,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  buttonHalf: {
    flex: 1,
  },
  wordCount: {
    fontSize: 13,
    fontWeight: '400',
  },
  wordList: {
    gap: 10,
  },
  wordCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  wordCardText: {
    flex: 1,
    gap: 3,
  },
  wordTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  wordMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  wordDefinition: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  wordSource: {
    fontSize: 11,
    fontWeight: '400',
  },
  removeButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
