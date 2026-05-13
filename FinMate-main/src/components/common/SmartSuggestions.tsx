import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface SmartSuggestionsProps {
  totalSpent: number;
  monthlyBudget: number;
  categorySpending: { category: string; amount: number; percentage: number }[];
}

export function SmartSuggestions({ totalSpent, monthlyBudget, categorySpending }: SmartSuggestionsProps) {
  const budgetUsed = (totalSpent / monthlyBudget) * 100;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = daysInMonth - currentDay;
  const expectedSpending = (currentDay / daysInMonth) * monthlyBudget;
  
  // Determine suggestion based on spending patterns
  const getSuggestion = () => {
    // Case 1: Under budget and on track
    if (totalSpent < expectedSpending && budgetUsed < 80) {
      const saved = expectedSpending - totalSpent;
      return {
        emoji: '🎉',
        title: 'Great job!',
        message: `You're ₹${saved.toFixed(0)} under expected spending. Keep it up!`,
        type: 'success',
      };
    }

    // Case 2: Over budget
    if (budgetUsed > 100) {
      const overspent = totalSpent - monthlyBudget;
      return {
        emoji: '⚠️',
        title: 'Budget exceeded',
        message: `You've overspent by ₹${overspent.toFixed(0)}. Consider reducing expenses.`,
        type: 'error',
      };
    }

    // Case 3: Approaching budget limit
    if (budgetUsed > 80 && budgetUsed <= 100) {
      const remaining = monthlyBudget - totalSpent;
      const dailyLimit = remaining / daysRemaining;
      return {
        emoji: '⚡',
        title: 'Watch your spending',
        message: `${budgetUsed.toFixed(0)}% budget used. Limit to ₹${dailyLimit.toFixed(0)}/day for remaining ${daysRemaining} days.`,
        type: 'warning',
      };
    }

    // Case 4: Spending faster than expected
    if (totalSpent > expectedSpending && budgetUsed < 80) {
      return {
        emoji: '💡',
        title: 'Spending ahead of pace',
        message: `You're spending faster than expected. Try to slow down to stay within budget.`,
        type: 'info',
      };
    }

    // Case 5: Top category suggestion
    if (categorySpending.length > 0) {
      const topCategory = categorySpending[0];
      if (topCategory.percentage > 40) {
        return {
          emoji: '📊',
          title: 'Category insight',
          message: `${topCategory.category} is ${topCategory.percentage.toFixed(0)}% of your spending. Consider setting a budget for it.`,
          type: 'info',
        };
      }
    }

    // Default: Positive reinforcement
    return {
      emoji: '✨',
      title: 'On track',
      message: `You're managing your budget well. ${budgetUsed.toFixed(0)}% used with ${daysRemaining} days remaining.`,
      type: 'success',
    };
  };

  const suggestion = getSuggestion();

  const getCardColor = () => {
    switch (suggestion.type) {
      case 'success':
        return Colors.success + '15';
      case 'error':
        return Colors.error + '15';
      case 'warning':
        return Colors.warning + '15';
      case 'info':
        return Colors.info + '15';
      default:
        return Colors.primary + '10';
    }
  };

  const getTextColor = () => {
    switch (suggestion.type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'info':
        return Colors.info;
      default:
        return Colors.primary;
    }
  };

  return (
    <Card style={[styles.container, { backgroundColor: getCardColor() }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{suggestion.emoji}</Text>
        <Text style={[styles.title, { color: getTextColor() }]}>{suggestion.title}</Text>
      </View>
      <Text style={styles.message}>{suggestion.message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    lineHeight: 22,
  },
});
