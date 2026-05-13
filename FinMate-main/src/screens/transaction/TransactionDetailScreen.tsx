import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { TransactionDB } from '../../services/database';
import { useStore } from '../../store/useStore';

interface TransactionDetailScreenProps {
  route: {
    params: {
      transaction: Transaction;
    };
  };
  navigation: any;
}

const FEEDBACK_EMOJIS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😞', label: 'Sad', value: 'sad' },
  { emoji: '😡', label: 'Angry', value: 'angry' },
];

export function TransactionDetailScreen({ route, navigation }: TransactionDetailScreenProps) {
  const { transaction } = route.params;
  const { deleteTransaction } = useStore();
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  const categoryInfo = CategoryConfig[transaction.category as keyof typeof CategoryConfig];
  const isExpense = transaction.type === 'sent';

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TransactionDB.delete(transaction.id);
              deleteTransaction(transaction.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleUploadReceipt = () => {
    // TODO: Implement image picker
    Alert.alert('Coming Soon', 'Receipt upload feature will be available soon!');
    setReceiptUploaded(true);
  };

  const handleFeedback = (value: string) => {
    setSelectedFeedback(value);
    // TODO: Save feedback to database
  };

  const getDayOfWeek = (dateStr: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <Card style={styles.amountCard} variant="elevated">
          <View style={[styles.categoryIcon, { backgroundColor: categoryInfo?.color + '20' }]}>
            <Text style={styles.categoryEmoji}>{categoryInfo?.icon || '💰'}</Text>
          </View>
          <Text style={[styles.amount, isExpense ? styles.expenseAmount : styles.incomeAmount]}>
            {isExpense ? '-' : '+'} {formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.merchant}>{transaction.merchant}</Text>
          <View style={[styles.statusBadge, transaction.status === 'completed' && styles.statusSuccess]}>
            <Text style={styles.statusText}>
              {transaction.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
            </Text>
          </View>
        </Card>

        {/* Transaction Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>
              {transaction.type === 'sent' ? '📤 Expense' : '📥 Income'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{transaction.category}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Day</Text>
            <Text style={styles.detailValue}>{getDayOfWeek(transaction.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{transaction.time}</Text>
          </View>

          {transaction.upiId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>UPI ID</Text>
              <Text style={[styles.detailValue, styles.upiId]}>{transaction.upiId}</Text>
            </View>
          )}

          {transaction.upiRef && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference ID</Text>
              <Text style={[styles.detailValue, styles.refId]}>{transaction.upiRef}</Text>
            </View>
          )}

          {transaction.bankAccount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank Account</Text>
              <Text style={styles.detailValue}>{transaction.bankAccount}</Text>
            </View>
          )}

          {transaction.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{transaction.notes}</Text>
            </View>
          )}
        </Card>

        {/* Receipt Upload */}
        <Card style={styles.receiptCard}>
          <Text style={styles.sectionTitle}>Receipt</Text>
          {receiptUploaded ? (
            <View style={styles.receiptUploaded}>
              <Text style={styles.receiptUploadedText}>✓ Receipt uploaded</Text>
              <TouchableOpacity onPress={() => setReceiptUploaded(false)}>
                <Text style={styles.removeReceipt}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadReceipt}>
              <Text style={styles.uploadIcon}>📎</Text>
              <Text style={styles.uploadText}>Upload Receipt</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Feedback */}
        <Card style={styles.feedbackCard}>
          <Text style={styles.sectionTitle}>How do you feel about this transaction?</Text>
          <View style={styles.emojiContainer}>
            {FEEDBACK_EMOJIS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.emojiButton,
                  selectedFeedback === item.value && styles.emojiButtonSelected,
                ]}
                onPress={() => handleFeedback(item.value)}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.emojiLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit Transaction"
            onPress={() => {
              Alert.alert('Coming Soon', 'Edit feature will be available soon!');
            }}
            variant="outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  deleteButton: {
    fontSize: Typography.fontSize.xl,
    padding: Spacing.sm,
  },
  amountCard: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  categoryEmoji: {
    fontSize: 40,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  expenseAmount: {
    color: Colors.error,
  },
  incomeAmount: {
    color: Colors.success,
  },
  merchant: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.textSecondary + '20',
  },
  statusSuccess: {
    backgroundColor: Colors.success + '20',
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    fontWeight: '600',
  },
  detailsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  categoryBadgeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  upiId: {
    fontFamily: 'monospace',
    fontSize: Typography.fontSize.sm,
  },
  refId: {
    fontFamily: 'monospace',
    fontSize: Typography.fontSize.sm,
  },
  receiptCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  uploadIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.sm,
  },
  uploadText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  receiptUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.success + '10',
    borderRadius: BorderRadius.md,
  },
  receiptUploadedText: {
    fontSize: Typography.fontSize.base,
    color: Colors.success,
    fontWeight: '600',
  },
  removeReceipt: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    fontWeight: '600',
  },
  feedbackCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  emojiButton: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  emojiButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  emoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  emojiLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actions: {
    margin: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
