import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { TransactionDB } from '../../services/database';
import { generateId, getCurrentTime, isValidAmount } from '../../utils/helpers';
import { Transaction } from '../../types';

// Expense categories
const expenseCategories = Object.keys(CategoryConfig);

// Income categories
const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'];

export function AddTransactionScreen({ navigation }: any) {
  const { addTransaction, currentUserId } = useStore();
  const [type, setType] = useState<'sent' | 'received'>('sent');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Get categories based on transaction type
  const categories = type === 'sent' ? expenseCategories : incomeCategories;

  // Update category when type changes
  const handleTypeChange = (newType: 'sent' | 'received') => {
    setType(newType);
    // Set default category based on type
    setCategory(newType === 'sent' ? 'Food' : 'Salary');
  };

  const handleSave = async () => {
    if (!amount || !merchant) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isValidAmount(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    if (!currentUserId) {
      alert('Please login first');
      return;
    }

    try {
      setLoading(true);
      
      const transaction: Transaction = {
        id: generateId(),
        amount: parseFloat(amount),
        type,
        merchant,
        upiId: '',
        category,
        date: new Date().toISOString().split('T')[0],
        time: getCurrentTime(),
        status: 'completed',
        notes,
      };

      console.log('💾 Saving transaction for user:', currentUserId);
      console.log('💾 Transaction data:', JSON.stringify(transaction, null, 2));
      
      try {
        await TransactionDB.create({ ...transaction, userId: currentUserId });
        console.log('✅ Transaction saved to database');
      } catch (dbError) {
        console.error('❌ Database save error:', dbError);
        console.error('❌ Database error details:', JSON.stringify(dbError, null, 2));
        throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
      
      addTransaction(transaction);
      console.log('✅ Transaction added to store');
      console.log('✅ Transaction saved successfully!');
      
      // Auto-share transaction with family if user is in a family
      try {
        const { FamilyService } = await import('../../features/family/services/familyService');
        const family = await FamilyService.getFamilyByUserId(currentUserId);
        
        if (family) {
          console.log('👨‍👩‍👧‍👦 Sharing transaction with family:', family.name);
          await FamilyService.shareTransaction({
            transactionId: transaction.id,
            familyId: family.id,
            sharedByUserId: currentUserId,
          });
          console.log('✅ Transaction shared with family');
        }
      } catch (error) {
        console.log('⚠️ Failed to share transaction with family:', error);
      }
      
      // Auto-sync to cloud (non-blocking)
      if (!currentUserId.startsWith('guest_')) {
        const { SyncService } = await import('../../services/syncService');
        SyncService.performSync(currentUserId).catch(err => 
          console.log('⚠️ Auto-sync failed:', err)
        );
      }
      
      // Clear form
      setAmount('');
      setMerchant('');
      setNotes('');
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      alert('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Transaction</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Type Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'sent' && styles.typeButtonActive]}
              onPress={() => handleTypeChange('sent')}
            >
              <Text style={[styles.typeText, type === 'sent' && styles.typeTextActive]}>
                Expense (Sent)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'received' && styles.typeButtonActive]}
              onPress={() => handleTypeChange('received')}
            >
              <Text style={[styles.typeText, type === 'received' && styles.typeTextActive]}>
                Income (Received)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Merchant */}
        <View style={styles.section}>
          <Text style={styles.label}>Merchant/Person *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Swiggy, John Doe"
            placeholderTextColor={Colors.textTertiary}
            value={merchant}
            onChangeText={setMerchant}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => {
                const config = CategoryConfig[cat as keyof typeof CategoryConfig];
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { borderColor: config.color },
                      isSelected && { backgroundColor: config.color },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isSelected ? Colors.textInverse : config.color },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add any additional notes..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type:</Text>
            <Text style={styles.summaryValue}>{type === 'sent' ? 'Expense' : 'Income'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount:</Text>
            <Text style={[styles.summaryValue, { color: type === 'sent' ? Colors.error : Colors.success }]}>
              {amount ? `₹${amount}` : '₹0.00'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Merchant:</Text>
            <Text style={styles.summaryValue}>{merchant || 'Not set'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Category:</Text>
            <Text style={styles.summaryValue}>{category}</Text>
          </View>
        </Card>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Saving...' : 'Save Transaction'}
            onPress={handleSave}
            loading={loading}
            disabled={!amount || !merchant}
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
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.background,
  },
  backButton: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.textInverse,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  currencySymbol: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  notesInput: {
    minHeight: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    backgroundColor: Colors.background,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
