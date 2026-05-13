import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';
import { useWeeklySpending, useMonthlySpending, useYearlySpending } from '../../store/selectors';

interface SpendingChartProps {
  timeframe: 'week' | 'month' | 'year';
}

export function SpendingChart({ timeframe }: SpendingChartProps) {
  const weeklyData = useWeeklySpending();
  const monthlyData = useMonthlySpending();
  const yearlyData = useYearlySpending();

  const data = timeframe === 'week' 
    ? weeklyData
    : timeframe === 'month'
    ? monthlyData.map(d => ({ day: d.week, amount: d.amount }))
    : yearlyData.map(d => ({ day: d.month, amount: d.amount }));

  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (maxAmount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No spending data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'This Year'}
        </Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const heightPercentage = (item.amount / maxAmount) * 100;
          const barHeight = Math.max(heightPercentage, 5); // Minimum 5% height for visibility

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                {item.amount > 0 && (
                  <Text style={styles.amountLabel}>
                    ₹{item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}k` : item.amount.toFixed(0)}
                  </Text>
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${barHeight}%`,
                      backgroundColor: item.amount > 0 ? Colors.primary : Colors.border,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel} numberOfLines={1}>
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  total: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: Spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barWrapper: {
    width: '100%',
    height: '85%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 10,
  },
  amountLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  dayLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
