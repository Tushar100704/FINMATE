import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { useFamily } from '../hooks/useFamily';
import { useCurrencyFormat } from '../../../hooks/useCurrencyFormat';

type TimeFilter = 'week' | 'month' | 'year';

export function FamilyAnalyticsScreen({ navigation }: any) {
  const { currentFamily, familyAnalytics, loadFamilyAnalytics, isLoading } = useFamily();
  const { formatCurrency } = useCurrencyFormat();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  useEffect(() => {
    if (currentFamily) {
      const now = new Date();
      let startDate: string;
      
      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        startDate = monthAgo.toISOString().split('T')[0];
      } else {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        startDate = yearAgo.toISOString().split('T')[0];
      }
      
      const endDate = now.toISOString().split('T')[0];
      loadFamilyAnalytics(startDate, endDate);
    }
  }, [currentFamily, timeFilter, loadFamilyAnalytics]);

  if (!currentFamily) {
    return (
      <ScreenWrapper scroll={false}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No family data available</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll horizontalPadding={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-right" size={24} color={Colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.title}>Family Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'week' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('week')}
          >
            <Text style={[styles.filterText, timeFilter === 'week' && styles.filterTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'month' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('month')}
          >
            <Text style={[styles.filterText, timeFilter === 'month' && styles.filterTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'year' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('year')}
          >
            <Text style={[styles.filterText, timeFilter === 'year' && styles.filterTextActive]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.totalCard} variant="elevated">
          <Text style={styles.totalLabel}>Total Family Spending</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(familyAnalytics?.totalSpending || 0)}
          </Text>
          <Text style={styles.totalPeriod}>
            Last {timeFilter === 'week' ? '7 days' : timeFilter === 'month' ? '30 days' : '12 months'}
          </Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {familyAnalytics?.categoryBreakdown && familyAnalytics.categoryBreakdown.length > 0 ? (
            familyAnalytics.categoryBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownInfo}>
                  <Text style={styles.breakdownCategory}>{item.category}</Text>
                  <Text style={styles.breakdownAmount}>{formatCurrency(item.amount)}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${item.percentage}%` }]}
                  />
                </View>
                <Text style={styles.breakdownPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Icon name="pie-chart" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptySectionText}>No category data yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member Contributions</Text>
          {familyAnalytics?.memberContributions && familyAnalytics.memberContributions.length > 0 ? (
            familyAnalytics.memberContributions.map((member, index) => (
              <View key={index} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Icon name="user" size={20} color={Colors.primary} />
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.userName}</Text>
                  <View style={styles.memberStats}>
                    <Text style={styles.memberAmount}>{formatCurrency(member.amount)}</Text>
                    <Text style={styles.memberPercentage}>({member.percentage.toFixed(1)}%)</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Icon name="users" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptySectionText}>No member data yet</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    padding: Spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  totalCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  totalLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  totalPeriod: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  breakdownItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  breakdownInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  breakdownCategory: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
  },
  breakdownAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  breakdownPercentage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  memberPercentage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  emptySectionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
});
