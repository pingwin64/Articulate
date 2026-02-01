import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { Feather } from '@expo/vector-icons';
import { Spacing } from '../design/theme';

export default function TextSelectScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryKey: string }>();
  const selectedCategoryKey = useSettingsStore((s) => s.selectedCategoryKey);
  const setSelectedCategoryKey = useSettingsStore((s) => s.setSelectedCategoryKey);

  // FormSheet workaround: params may be empty, fall back to store
  const categoryKey = params.categoryKey || selectedCategoryKey || undefined;

  const category = categories.find((c) => c.key === categoryKey);

  // Clear store fallback on unmount (e.g. swipe dismiss)
  React.useEffect(() => {
    return () => { setSelectedCategoryKey(null); };
  }, [setSelectedCategoryKey]);

  const handleTextSelect = (textId: string) => {
    if (category) {
      // Clear the store value after use
      setSelectedCategoryKey(null);
      router.dismiss();
      // Use setTimeout to ensure the dismiss completes before pushing
      setTimeout(() => {
        router.push(`/reading?categoryKey=${encodeURIComponent(category.key)}&textId=${encodeURIComponent(textId)}`);
      }, 0);
    }
  };

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Category not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.primary }]}>
          {category.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Choose a text to read
        </Text>
        <View style={styles.list}>
          {category.texts.map((entry, i) => (
            <Animated.View
              key={entry.id}
              entering={FadeIn.delay(i * 60).duration(300)}
            >
              <GlassCard onPress={() => handleTextSelect(entry.id)}>
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.primary }]}>
                      {entry.title}
                    </Text>
                    {entry.author && (
                      <Text style={[styles.author, { color: colors.secondary }]}>
                        {entry.author}
                      </Text>
                    )}
                    <Text style={[styles.words, { color: colors.muted }]}>
                      ~{entry.words.length} words
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.muted} />
                </View>
              </GlassCard>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: Spacing.lg,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  author: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  words: {
    fontSize: 12,
    fontWeight: '400',
  },
});
