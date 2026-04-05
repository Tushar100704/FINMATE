import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Colors, Typography, Spacing, CategoryConfig } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';

interface BudgetRecommendationsProps {
  categorySpending: { category: string; amount: number }[];
  totalIncome: number;
}

export function BudgetRecommendations({ categorySpending, totalIncome }: BudgetRecommendationsProps) {
  // 50/30/20 Rule: 50% Needs, 30% Wants, 20% Savings
  const recommendedNeeds = totalIncome * 0.5;
  const recommendedWants = totalIncome * 0.3;
  const recommendedSavings = totalIncome * 0.2;

  // Categorize expenses
  const needsCategories = ['Food', 'Groceries', 'Recharge/Bills', 'Bills', 'Health'];
  const wantsCategories = ['Entertainment', 'Shopping', 'Travel'];

  const currentNeeds = categorySpending
    .filter(c => needsCategories.includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  const currentWants = categorySpending
    .filter(c => wantsCategories.includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  // Generate recommendations for top 3 spending categories
  const topCategories = categorySpending.slice(0, 3);

  const getRecommendedBudget = (category: string, currentAmount: number) => {
    // Recommend 10-15% reduction if overspending
    const recommended = currentAmount * 0.85;
    return Math.round(recommended / 100) * 100; // Round to nearest 100
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>💡 Budget Recommendations</Text>
        <Text style={styles.subtitle}>Based on 50/30/20 budgeting rule</Text>

        {/* 50/30/20 Breakdown */}
        <View style={styles.ruleContainer}>
          <View style={styles.ruleItem}>
            <View style={[styles.ruleBar, { backgroundColor: Colors.primary, flex: 5 }]} />
            <Text style={styles.ruleLabel}>50% Needs</Text>
            <Text style={styles.ruleAmount}>{formatCurrency(recommendedNeeds)}</Text>
          </View>
          <View style={styles.ruleItem}>
            <View style={[styles.ruleBar, { backgroundColor: Colors.warning, flex: 3 }]} />
            <Text style={styles.ruleLabel}>30% Wants</Text>
            <Text style={styles.ruleAmount}>{formatCurrency(recommendedWants)}</Text>
          </View>
          <View style={styles.ruleItem}>
            <View style={[styles.ruleBar, { backgroundColor: Colors.success, flex: 2 }]} />
            <Text style={styles.ruleLabel}>20% Savings</Text>
            <Text style={styles.ruleAmount}>{formatCurrency(recommendedSavings)}</Text>
          </View>
        </View>

        {/* Current vs Recommended */}
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Your Needs Spending</Text>
            <Text style={[styles.comparisonValue, currentNeeds > recommendedNeeds && styles.overBudget]}>
              {formatCurrency(currentNeeds)}
            </Text>
            {currentNeeds > recommendedNeeds && (
              <Text style={styles.warningText}>
                ⚠️ {formatCurrency(currentNeeds - recommendedNeeds)} over
              </Text>
            )}
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Your Wants Spending</Text>
            <Text style={[styles.comparisonValue, currentWants > recommendedWants && styles.overBudget]}>
              {formatCurrency(currentWants)}
            </Text>
            {currentWants > recommendedWants && (
              <Text style={styles.warningText}>
                ⚠️ {formatCurrency(currentWants - recommendedWants)} over
              </Text>
            )}
          </View>
        </View>

        {/* Category Recommendations */}
        {topCategories.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Suggested Category Budgets</Text>
            {topCategories.map((cat, index) => {
              const recommended = getRecommendedBudget(cat.category, cat.amount);
              const config = CategoryConfig[cat.category as keyof typeof CategoryConfig];
              
              return (
                <View key={index} style={styles.recommendationItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{config?.icon || '📌'}</Text>
                    <View>
                      <Text style={styles.categoryName}>{cat.category}</Text>
                      <Text style={styles.currentSpending}>
                        Current: {formatCurrency(cat.amount)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recommendedBudget}>
                    <Text style={styles.recommendedLabel}>Suggested</Text>
                    <Text style={styles.recommendedAmount}>{formatCurrency(recommended)}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💰 Budget Tips</Text>
          <Text style={styles.tipText}>• Track every expense to understand spending patterns</Text>
          <Text style={styles.tipText}>• Review and adjust budgets monthly</Text>
          <Text style={styles.tipText}>• Set aside savings before spending</Text>
          <Text style={styles.tipText}>• Use the 24-hour rule for impulse purchases</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  ruleContainer: {
    marginBottom: Spacing.lg,
  },
  ruleItem: {
    marginBottom: Spacing.md,
  },
  ruleBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  ruleLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  ruleAmount: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    fontWeight: '700',
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  comparisonItem: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  comparisonLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  comparisonValue: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    fontWeight: '700',
  },
  overBudget: {
    color: Colors.error,
  },
  warningText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: '600',
  },
  currentSpending: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  recommendedBudget: {
    alignItems: 'flex-end',
  },
  recommendedLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  recommendedAmount: {
    fontSize: Typography.fontSize.base,
    color: Colors.success,
    fontWeight: '700',
  },
  tipsContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.info + '10',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.info,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
});
