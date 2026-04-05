import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { TransactionRow } from '../../components/common/TransactionRow';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CategoryConfig } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { TransactionDB } from '../../services/database';
import { groupByDate } from '../../utils/helpers';
import { Icon, IconName } from '../../components/ui/Icon';

export function TransactionFeedScreen({ navigation }: any) {
  const { transactions, setTransactions, currentUserId } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  // Popular categories for filter chips
  const categoryFilters = ['All', 'Food', 'Groceries', 'Recharge', 'P2P', 'Shopping', 'Bills', 'Travel'];

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    if (!currentUserId) {
      console.log('⚠️ No user logged in');
      return;
    }

    try {
      console.log('📊 Loading transactions for user:', currentUserId);
      const allTransactions = await TransactionDB.getAll(currentUserId);
      setTransactions(allTransactions);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  // Filter transactions - memoized for performance
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = 
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.upiId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        selectedFilter === 'all' || t.type === selectedFilter;
      
      const matchesCategory = 
        selectedCategory === 'All' || t.category === selectedCategory;
      
      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [transactions, searchQuery, selectedFilter, selectedCategory]);

  // Group by date - memoized for performance
  const groupedTransactions = React.useMemo(() => groupByDate(filteredTransactions), [filteredTransactions]);
  const dates = React.useMemo(() => Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)), [groupedTransactions]);

  return (
    <ScreenWrapper scroll={false} horizontalPadding={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>{transactions.length} total</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Type Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'sent' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('sent')}
        >
          <Text style={[styles.filterText, selectedFilter === 'sent' && styles.filterTextActive]}>
            Sent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'received' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('received')}
        >
          <Text style={[styles.filterText, selectedFilter === 'received' && styles.filterTextActive]}>
            Received
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
        contentContainerStyle={styles.categoryContainer}
      >
        {categoryFilters.map((category) => {
          const isSelected = selectedCategory === category;
          const categoryInfo = category !== 'All' ? CategoryConfig[category as keyof typeof CategoryConfig] : null;
          
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              {categoryInfo && (
                <Icon 
                  name={(categoryInfo.iconName || 'help') as IconName} 
                  size={18} 
                  color={isSelected ? Colors.textInverse : categoryInfo.color}
                  strokeWidth={2.5}
                />
              )}
              <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Transaction List */}
      <ScrollView 
        style={styles.list} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {dates.length > 0 ? (
          dates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              <View style={styles.transactionGroup}>
                {groupedTransactions[date].map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onPress={() => navigation.navigate('TransactionDetail', { transaction })}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Add your first transaction to get started'}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: 4,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  categoryScrollView: {
    marginBottom: 0,
  },
  categoryContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    lineHeight: 16,
  },
  categoryChipTextActive: {
    color: Colors.textInverse,
  },
  list: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: Spacing.lg,
  },
  dateHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  transactionGroup: {
    backgroundColor: Colors.card,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
