import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon, IconName } from '../../components/ui/Icon';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';
import { Budget } from '../../types';
import { formatCurrency, generateId, getCurrentMonthRange } from '../../utils/helpers';
import { BudgetDB } from '../../services/database';
import { useStore } from '../../store/useStore';

const CATEGORIES = Object.keys(CategoryConfig);

const PERIODS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Yearly', value: 'yearly' },
];

interface AddBudgetScreenProps {
  navigation: any;
}

export function AddBudgetScreen({ navigation }: any) {
  const { addBudget, currentUserId } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      setLoading(true);

      // Calculate date range based on period
      const { start, end } = getCurrentMonthRange();
      
      const budget: Budget = {
        id: generateId(),
        category: selectedCategory,
        amount: parseFloat(amount),
        spent: 0,
        period,
        startDate: start,
        endDate: end,
      };

      console.log('💾 Saving budget for user:', currentUserId);
      await BudgetDB.create({ ...budget, userId: currentUserId });
      addBudget(budget);
      
      console.log('✅ Budget created successfully!');
      
      // Auto-sync to cloud (non-blocking)
      if (!currentUserId.startsWith('guest_')) {
        const { SyncService } = await import('../../services/syncService');
        SyncService.performSync(currentUserId).catch(err => 
          console.log('⚠️ Auto-sync failed:', err)
        );
      }
      Alert.alert('Success', 'Budget created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('❌ Error creating budget:', error);
      Alert.alert('Error', 'Failed to create budget. This category might already have a budget.');
    } finally {
      setLoading(false);
    }
  };

  const categoryInfo = selectedCategory ? CategoryConfig[selectedCategory as keyof typeof CategoryConfig] : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Budget</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount Input */}
        <Card style={styles.amountCard} variant="elevated">
          <Text style={styles.label}>Budget Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          {amount && parseFloat(amount) > 0 && (
            <Text style={styles.amountPreview}>
              {formatCurrency(parseFloat(amount))} per {period}
            </Text>
          )}
        </Card>

        {/* Period Selector */}
        <Card style={styles.periodCard}>
          <Text style={styles.sectionTitle}>Budget Period</Text>
          <View style={styles.periodContainer}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.periodButton,
                  period === p.value && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod(p.value as 'monthly' | 'weekly' | 'yearly')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === p.value && styles.periodButtonTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Category Selection */}
        <Card style={styles.categoryCard}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => {
              const info = CategoryConfig[category as keyof typeof CategoryConfig];
              const isSelected = selectedCategory === category;
              
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                    { borderColor: info.color },
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: info.color + '20' }]}>
                    <Icon 
                      name={(info.iconName || 'help-circle') as IconName} 
                      size={24} 
                      color={info.color} 
                    />
                  </View>
                  <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                    {category}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Summary */}
        {selectedCategory && amount && parseFloat(amount) > 0 && (
          <Card style={styles.summaryCard} variant="elevated">
            <Text style={styles.summaryTitle}>Budget Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Category</Text>
              <View style={styles.summaryCategory}>
                <Icon 
                  name={(categoryInfo?.iconName || 'help-circle') as IconName} 
                  size={20} 
                  color={categoryInfo?.color || Colors.textSecondary} 
                />
                <Text style={styles.summaryValue}>{selectedCategory}</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryValue}>{formatCurrency(parseFloat(amount))}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Period</Text>
              <Text style={styles.summaryValue}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
            </View>
            <View style={styles.summaryNote}>
              <Text style={styles.summaryNoteText}>
                💡 You'll be notified when you reach 80% of this budget
              </Text>
            </View>
          </Card>
        )}

        {/* Save Button */}
        <View style={styles.actions}>
          <Button
            title={loading ? 'Creating Budget...' : 'Create Budget'}
            onPress={handleSave}
            disabled={!selectedCategory || !amount || parseFloat(amount) <= 0 || loading}
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
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 60,
  },
  amountCard: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    marginRight: Spacing.xs,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    minWidth: 100,
    textAlign: 'center',
  },
  amountPreview: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  periodCard: {
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
  periodContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  periodButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  periodButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: Colors.primary,
  },
  categoryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  categoryItemSelected: {
    borderWidth: 3,
    backgroundColor: Colors.primary + '05',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: Colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: '700',
  },
  summaryCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  summaryCategoryIcon: {
    fontSize: Typography.fontSize.lg,
  },
  summaryNote: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
  },
  summaryNoteText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    textAlign: 'center',
  },
  actions: {
    margin: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
