import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { FamilyWithMembers } from '../types/family.types';
import { useCurrencyFormat } from '../../../hooks/useCurrencyFormat';

interface FamilyCardProps {
  family: FamilyWithMembers;
  totalSpending: number;
  onPress?: () => void;
}

export function FamilyCard({ family, totalSpending, onPress }: FamilyCardProps) {
  const { formatCurrency } = useCurrencyFormat();

  return (
    <Card style={styles.card} variant="elevated">
      <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="users" size={24} color={Colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.familyName}>{family.name}</Text>
            <Text style={styles.memberCount}>
              {family.memberCount} {family.memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
          {onPress && (
            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Spending</Text>
            <Text style={styles.statValue}>{formatCurrency(totalSpending)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Invite Code</Text>
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCode}>
                {family.inviteCode.substring(0, 4)}-{family.inviteCode.substring(4)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  familyName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  inviteCodeContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  inviteCode: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 1,
  },
});
