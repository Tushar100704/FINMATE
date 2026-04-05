import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store/useStore';
import { TransactionDB, BudgetDB } from '../../services/database';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { useSMSListener } from '../../hooks/useSMSListener';
import { getCurrentMonthRange } from '../../utils/helpers';
import { SMSService } from '../../services/smsService';
import { CategoryConfig } from '../../constants/theme';
import { Transaction } from '../../types';

export function HomeScreenSimple({ navigation }: any) {
  const { transactions, setTransactions, budgets, setBudgets, currentUserId } = useStore();
  const { formatCurrency } = useCurrencyFormat();
  const { processSMSManually, isPermissionGranted } = useSMSListener();
  
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [smsProcessing, setSMSProcessing] = useState(false);

  const monthlyBudget = budgets.reduce((sum, b) => sum + b.amount, 0) || 50000;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentUserId])
  );

  const loadData = async () => {
    if (!currentUserId) {
      console.log('⚠️ No user logged in');
      return;
    }

    try {
      console.log('📊 Loading home screen data for user:', currentUserId);
      const allTransactions = await TransactionDB.getAll(currentUserId);
      console.log(`✅ Loaded ${allTransactions.length} transactions from database`);
      
      setTransactions(allTransactions);
      console.log('✅ Store updated with transactions');

      const allBudgets = await BudgetDB.getAll(currentUserId);
      console.log(`✅ Loaded ${allBudgets.length} budgets`);
      setBudgets(allBudgets);
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const { start, end } = getCurrentMonthRange();
    const spent = transactions
      .filter(t => t.type === 'sent' && new Date(t.date) >= new Date(start) && new Date(t.date) <= new Date(end))
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalSpent(spent);

    const received = transactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalReceived(received);
  }, [transactions]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const budgetLeft = monthlyBudget - totalSpent;
  const budgetProgress = (totalSpent / monthlyBudget) * 100;
  const recentTransactions = transactions.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderTransactionCard = (transaction: Transaction, index: number) => {
    const isDebit = transaction.type === 'sent';
    const categoryInfo = CategoryConfig[transaction.category as keyof typeof CategoryConfig] || CategoryConfig.Others;

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionCard}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: categoryInfo.color + '15' }]}>
          <Text style={[styles.iconText, { color: categoryInfo.color }]}>
            {transaction.category.charAt(0)}
          </Text>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.merchant} numberOfLines={1}>
            {transaction.merchant}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{transaction.time}</Text>
            {transaction.isAutoDetected && (
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>AUTO</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: isDebit ? '#FF1919' : '#00C369' }]}>
            {isDebit ? '-' : '+'}{formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.status}>{transaction.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A9BFF', '#0077CC', '#F5F5F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
            <Text style={styles.subtitle}>Here's your financial overview</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <LinearGradient
          colors={['#1A9BFF', '#0077CC', '#005999']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>This Month Spent</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalSpent)}</Text>
          <View style={styles.budgetInfo}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(budgetProgress, 100)}%` }]} />
            </View>
            <Text style={styles.budgetText}>
              {budgetProgress.toFixed(0)}% of {formatCurrency(monthlyBudget)} budget
            </Text>
          </View>
          {budgetLeft < 0 && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>
                ⚠️ Over budget by {formatCurrency(Math.abs(budgetLeft))}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={['#FFFFFF', '#FFF5F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📤</Text>
            </View>
            <Text style={styles.statTitle}>TOTAL SENT</Text>
            <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#F0FFF4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📥</Text>
            </View>
            <Text style={styles.statTitle}>TOTAL RECEIVED</Text>
            <Text style={styles.statValue}>{formatCurrency(totalReceived)}</Text>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('AddTransaction')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1A9BFF', '#0077CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Add Expense</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => navigation.navigate('Feed')}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SMS Actions */}
        {isPermissionGranted && (
          <View style={styles.smsSection}>
            <TouchableOpacity
              style={[styles.smsButton, smsProcessing && styles.buttonDisabled]}
              onPress={async () => {
                if (smsProcessing) return;
                setSMSProcessing(true);
                try {
                  const result = await processSMSManually();
                  if (result.success && 'created' in result && result.created > 0) {
                    loadData();
                  }
                } catch (error) {
                  console.error('❌ SMS processing error:', error);
                } finally {
                  setSMSProcessing(false);
                }
              }}
              disabled={smsProcessing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00C369', '#009C54']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.smsButtonText}>
                  {smsProcessing ? '🔄 Checking SMS...' : '📱 Check SMS for Transactions'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.clearButton, smsProcessing && styles.buttonDisabled]}
              onPress={async () => {
                setSMSProcessing(true);
                try {
                  if (currentUserId) {
                    await SMSService.clearProcessedRecords(currentUserId);
                  }
                  const result = await processSMSManually();
                  if (result.success && 'created' in result && result.created > 0) {
                    loadData();
                  }
                } catch (error) {
                  console.error('❌ Error:', error);
                } finally {
                  setSMSProcessing(false);
                }
              }}
              disabled={smsProcessing}
              activeOpacity={0.8}
            >
              <Text style={styles.clearButtonText}>Clear & Re-scan ALL SMS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((transaction, index) => renderTransactionCard(transaction, index))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -1,
  },
  budgetInfo: {
    width: '100%',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  warningBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 25, 25, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(26, 155, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C8CA5',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C21',
    letterSpacing: -0.5,
  },
  quickActions: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C21',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#1A9BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1A9BFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: '#1A9BFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  smsSection: {
    marginTop: 24,
    gap: 12,
  },
  smsButton: {
    borderRadius: 16,
    shadowColor: '#00C369',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  smsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  recentSection: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A9BFF',
  },
  transactionCard: {
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
  transactionDetails: {
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
