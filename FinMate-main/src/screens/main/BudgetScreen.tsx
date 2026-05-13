import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { BudgetDB, TransactionDB } from '../../services/database';
import { getCurrentMonthRange, getCategorySpending } from '../../utils/helpers';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { BudgetRecommendations } from '../../components/common/BudgetRecommendations';

export function BudgetScreen({ navigation }: any) {
  const { budgets, setBudgets, transactions, currentUserId } = useStore();
  const { formatCurrency } = useCurrencyFormat();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [])
  );

  // Reload when transactions change (e.g., after SMS import)
  useEffect(() => {
    if (currentUserId && transactions.length > 0) {
      console.log('📊 Transactions updated, recalculating budget spending...');
      loadBudgets();
    }
  }, [transactions.length, currentUserId]);

  const loadBudgets = async () => {
    if (!currentUserId) {
      console.log('⚠️ No user logged in');
      return;
    }

    try {
      console.log('📊 Loading budgets for user:', currentUserId);
      setLoading(true);
      
      const allBudgets = await BudgetDB.getAll(currentUserId);
      console.log(`✅ Loaded ${allBudgets.length} budgets`);
      
      // Update spent amounts from transactions
      if (allBudgets.length > 0) {
        const { start, end } = getCurrentMonthRange();
        for (const budget of allBudgets) {
          try {
            const spent = await TransactionDB.getCategorySpending(budget.category, start, end);
            budget.spent = spent;
          } catch (err) {
            console.warn(`Could not load spending for ${budget.category}:`, err);
            budget.spent = 0;
          }
        }
      }
      
      setBudgets(allBudgets);
      setRefreshing(false);
    } catch (error) {
      console.error('❌ Error loading budgets:', error);
      // Set empty budgets array on error
      setBudgets([]);
      setRefreshing(false);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBudgets();
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <ScreenWrapper
      scroll
      horizontalPadding={false}
      scrollViewProps={{
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <Text style={styles.subtitle}>Track your spending limits</Text>
      </View>

      <View style={styles.content}>
        {/* Overall Summary */}
        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalBudget)}</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Spent</Text>
              <Text style={[styles.summaryItemValue, { color: Colors.error }]}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Remaining</Text>
              <Text style={[styles.summaryItemValue, { color: totalRemaining >= 0 ? Colors.success : Colors.error }]}>
                {formatCurrency(totalRemaining)}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(overallProgress, 100)}%`,
                    backgroundColor: overallProgress > 100 ? Colors.error : Colors.primary
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{overallProgress.toFixed(0)}%</Text>
          </View>
        </Card>

        {/* Category Budgets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category Budgets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddBudget')}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {budgets.length > 0 ? (
            budgets.map((budget) => {
              const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const remaining = budget.amount - budget.spent;
              const isOverBudget = progress > 100;
              const categoryInfo = CategoryConfig[budget.category as keyof typeof CategoryConfig] || CategoryConfig.Others;

              return (
                <TouchableOpacity 
                  key={budget.id}
                  onLongPress={() => {
                    Alert.alert(
                      'Delete Budget',
                      `Delete ${budget.category} budget?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            await BudgetDB.delete(budget.id);
                            loadBudgets();
                          },
                        },
                      ]
                    );
                  }}
                >
                <Card style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetInfo}>
                      <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '20' }]}>
                        <Text style={[styles.categoryIconText, { color: categoryInfo.color }]}>
                          {budget.category.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.budgetDetails}>
                        <Text style={styles.budgetCategory}>{budget.category}</Text>
                        <Text style={styles.budgetPeriod}>Monthly</Text>
                      </View>
                    </View>
                    <View style={styles.budgetAmounts}>
                      <Text style={styles.budgetAmount}>{formatCurrency(budget.amount)}</Text>
                      <Text style={[styles.budgetRemaining, { color: remaining >= 0 ? Colors.success : Colors.error }]}>
                        {remaining >= 0 ? formatCurrency(remaining) : formatCurrency(Math.abs(remaining)) + ' over'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.budgetProgress}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: isOverBudget ? Colors.error : categoryInfo.color
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.budgetProgressText}>
                      {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)} ({progress.toFixed(0)}%)
                    </Text>
                  </View>

                  {isOverBudget && (
                    <View style={styles.warningBadge}>
                      <Text style={styles.warningText}>⚠️ Over budget</Text>
                    </View>
                  )}
                </Card>
                </TouchableOpacity>
              );
            })
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No budgets set</Text>
              <Text style={styles.emptySubtext}>Create your first budget to track spending</Text>
              <Button
                title="Create Budget"
                onPress={() => navigation.navigate('AddBudget')}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>

        {/* Budget Recommendations */}
        <BudgetRecommendations
          categorySpending={getCategorySpending(transactions).map(c => ({
            category: c.category,
            amount: c.amount,
          }))}
          totalIncome={transactions
            .filter(t => t.type === 'received')
            .reduce((sum, t) => sum + t.amount, 0) || 50000}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.lg,
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  summaryItemValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.textInverse,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
    minWidth: 40,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  addButton: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  budgetCard: {
    marginBottom: Spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  categoryIconText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  budgetPeriod: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  budgetAmounts: {
    alignItems: 'flex-end',
  },
  budgetAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  budgetRemaining: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  budgetProgress: {
    marginBottom: Spacing.sm,
  },
  budgetProgressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  warningBadge: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  warningText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 150,
  },
  tipsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tipsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
