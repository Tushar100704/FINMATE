import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, IconName } from '../../../components/ui/Icon';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../../constants/theme';
import { Transaction } from '../../../types';
import { useCurrencyFormat } from '../../../hooks/useCurrencyFormat';

interface SharedTransactionRowProps {
  transaction: Transaction & { sharedByUserName?: string };
  onPress?: () => void;
  showSharedBy?: boolean;
}

export function SharedTransactionRow({ transaction, onPress, showSharedBy = true }: SharedTransactionRowProps) {
  const { formatCurrency } = useCurrencyFormat();
  const categoryInfo = CategoryConfig[transaction.category as IconName] || CategoryConfig.Others;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryInfo.color + '20' }]}>
        <Icon
          name={(categoryInfo.iconName || 'help') as IconName}
          size={20}
          color={categoryInfo.color}
          strokeWidth={2.5}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{transaction.category}</Text>
          {showSharedBy && transaction.sharedByUserName && (
            <>
              <View style={styles.dot} />
              <Text style={styles.sharedBy}>by {transaction.sharedByUserName}</Text>
            </>
          )}
        </View>
        <Text style={styles.date}>
          {new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, transaction.type === 'received' && styles.incomeAmount]}>
          {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <View style={styles.shareIndicator}>
          <Icon name="share" size={12} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  merchant: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  category: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: Spacing.xs,
  },
  sharedBy: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  date: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: 4,
  },
  incomeAmount: {
    color: Colors.success,
  },
  shareIndicator: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
