import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, CategoryConfig } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';
import { Icon, IconName } from '../ui/Icon';

interface CategoryPieChartProps {
  data: { category: string; amount: number; percentage: number }[];
}

const { width } = Dimensions.get('window');
const CHART_SIZE = Math.min(width - 100, 250);

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expense data available</Text>
        <Text style={styles.emptySubtext}>Start adding transactions to see your spending breakdown</Text>
      </View>
    );
  }

  // Take top 5 categories, group rest as "Others"
  const topCategories = data.slice(0, 5);
  const othersAmount = data.slice(5).reduce((sum, item) => sum + item.amount, 0);
  
  const chartData = topCategories.map(item => ({
    x: item.category,
    y: item.amount,
    percentage: item.percentage,
  }));

  if (othersAmount > 0) {
    const othersPercentage = (othersAmount / data.reduce((sum, item) => sum + item.amount, 0)) * 100;
    chartData.push({
      x: 'Others',
      y: othersAmount,
      percentage: othersPercentage,
    });
  }

  const colorScale = chartData.map(item => {
    const config = CategoryConfig[item.x as keyof typeof CategoryConfig];
    return config?.color || Colors.textSecondary;
  });

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      {/* Total Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Spending</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {chartData.map((item, index) => {
          const config = CategoryConfig[item.x as keyof typeof CategoryConfig];
          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colorScale[index] }]} />
              <View style={styles.legendIconContainer}>
                <Icon 
                  name={(config?.iconName || 'help-circle') as IconName} 
                  size={20} 
                  color={colorScale[index]} 
                />
              </View>
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendCategory}>{item.x}</Text>
                <Text style={styles.legendAmount}>{formatCurrency(item.y)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  totalCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    fontSize: 32,
    color: Colors.primary,
    fontWeight: '700',
  },
  legend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  legendIconContainer: {
    marginRight: Spacing.sm,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendCategory: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: '600',
  },
  legendAmount: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
