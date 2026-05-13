import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Transaction } from '../../types';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { CategoryConfig } from '../../constants/theme';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
  index: number;
}

export function TransactionCard({ transaction, onPress, index }: TransactionCardProps) {
  const { formatCurrency } = useCurrencyFormat();
  const [pressed, setPressed] = React.useState(false);
  const isDebit = transaction.type === 'sent';
  const categoryInfo = CategoryConfig[transaction.category as keyof typeof CategoryConfig] || CategoryConfig.Others;

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: 'timing',
        duration: 400,
        delay: index * 50,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={1}
      >
        <MotiView
          animate={{
            scale: pressed ? 0.98 : 1,
          }}
          transition={{
            type: 'timing',
            duration: 100,
          }}
          style={styles.container}
        >
          {/* Category Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: categoryInfo.color + '15' },
            ]}
          >
            <Text style={[styles.iconText, { color: categoryInfo.color }]}>
              {transaction.category.charAt(0)}
            </Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.details}>
            <Text style={styles.merchant} numberOfLines={1}>
              {transaction.merchant}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta} numberOfLines={1}>
                {transaction.time}
              </Text>
              {transaction.isAutoDetected && (
                <View style={styles.autoBadge}>
                  <Text style={styles.autoBadgeText}>AUTO</Text>
                </View>
              )}
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text
              style={[
                styles.amount,
                { color: isDebit ? '#FF1919' : '#00C369' },
              ]}
            >
              {isDebit ? '-' : '+'}{formatCurrency(transaction.amount)}
            </Text>
            <Text style={styles.status}>{transaction.status}</Text>
          </View>
        </MotiView>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  details: {
    flex: 1,
    marginRight: 12,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C21',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8C8CA5',
  },
  autoBadge: {
    backgroundColor: '#E8F5FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A9BFF',
    letterSpacing: 0.5,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A3A3B7',
    textTransform: 'capitalize',
  },
});
