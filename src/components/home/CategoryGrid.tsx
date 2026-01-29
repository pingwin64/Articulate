import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { categories } from '../../lib/data/categories';
import { CategoryCard } from '../CategoryCard';

const FREE_CATEGORIES = ['story', 'article', 'speech'];

interface CategoryGridProps {
  isPremium: boolean;
  onCategoryPress: (categoryKey: string) => void;
}

export function CategoryGrid({ isPremium, onCategoryPress }: CategoryGridProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.categoriesSection}>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        What would you like to read?
      </Text>
      <View style={styles.categoryList}>
        {categories.map((cat) => {
          const isLocked = !isPremium && !FREE_CATEGORIES.includes(cat.key);
          return (
            <CategoryCard
              key={cat.key}
              category={cat}
              onPress={() => onCategoryPress(cat.key)}
              locked={isLocked}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesSection: {
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  categoryList: {
    gap: 16,
  },
});
