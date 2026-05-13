import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';

export const CATEGORIES = [
  { id: 'all', label: 'All', color: Colors.primary },
  { id: 'Food', label: 'Food', color: CategoryConfig.Food?.color || '#FF6B6B' },
  { id: 'Groceries', label: 'Groceries', color: CategoryConfig.Groceries?.color || '#4ECDC4' },
  { id: 'Recharge/Bills', label: 'Bills', color: CategoryConfig['Recharge/Bills']?.color || '#FFD93D' },
  { id: 'P2P', label: 'P2P', color: CategoryConfig.P2P?.color || '#95E1D3' },
  { id: 'Travel', label: 'Travel', color: CategoryConfig.Travel?.color || '#A8E6CF' },
  { id: 'Shopping', label: 'Shopping', color: CategoryConfig.Shopping?.color || '#FFB6B9' },
  { id: 'Entertainment', label: 'Entertainment', color: CategoryConfig.Entertainment?.color || '#C7CEEA' },
  { id: 'Others', label: 'Others', color: Colors.textSecondary },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
  counts?: Map<string, number>;
}

export function CategoryFilter({ selected, onSelect, counts }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const count = counts?.get(category.id) || 0;
        const isSelected = selected === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.chip,
              { borderColor: category.color },
              isSelected && { backgroundColor: category.color },
            ]}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? Colors.surface : category.color },
              ]}
            >
              {category.label}
            </Text>
            {count > 0 && (
              <Text style={[styles.count, isSelected && styles.countSelected]}>
                {count}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 4,
    height: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    opacity: 0.8,
  },
  countSelected: {
    opacity: 1,
    color: Colors.surface,
  },
});
