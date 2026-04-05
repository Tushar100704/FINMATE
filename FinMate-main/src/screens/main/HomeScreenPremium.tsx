import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useStore } from '../../store/useStore';
import { TransactionDB, BudgetDB } from '../../services/database';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { useSMSListener } from '../../hooks/useSMSListener';
import { getCurrentMonthRange } from '../../utils/helpers';
import { SMSService } from '../../services/smsService';
import { GradientCard } from '../../components/premium/GradientCard';
import { StatCard } from '../../components/premium/StatCard';
import { AnimatedButton } from '../../components/premium/AnimatedButton';
import { TransactionCard } from '../../components/premium/TransactionCard';

export function HomeScreenPremium({ navigation }: any) {
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

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
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
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
            <Text style={styles.subtitle}>Here's your financial overview</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </MotiView>

        {/* Main Balance Card */}
        <GradientCard colors={['#1A9BFF', '#0077CC', '#005999']} delay={100}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>This Month Spent</Text>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 300 }}
            >
              <Text style={styles.balanceAmount}>{formatCurrency(totalSpent)}</Text>
            </MotiView>
            <View style={styles.budgetInfo}>
              <View style={styles.progressBarContainer}>
                <MotiView
                  from={{ width: '0%' }}
                  animate={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  transition={{ type: 'timing', duration: 1000, delay: 400 }}
                  style={styles.progressBar}
                />
              </View>
              <Text style={styles.budgetText}>
                {budgetProgress.toFixed(0)}% of {formatCurrency(monthlyBudget)} budget
              </Text>
            </View>
            {budgetLeft < 0 && (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: 500 }}
                style={styles.warningBadge}
              >
                <Text style={styles.warningText}>
                  ⚠️ Over budget by {formatCurrency(Math.abs(budgetLeft))}
                </Text>
              </MotiView>
            )}
          </View>
        </GradientCard>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Total Sent"
            value={formatCurrency(totalSpent)}
            icon="📤"
            colors={['#FFFFFF', '#FFF5F5']}
            delay={200}
          />
          <StatCard
            title="Total Received"
            value={formatCurrency(totalReceived)}
            icon="📥"
            colors={['#FFFFFF', '#F0FFF4']}
            delay={300}
          />
        </View>

        {/* Quick Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 400 }}
          style={styles.quickActions}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <AnimatedButton
              title="Add Expense"
              onPress={() => navigation.navigate('AddTransaction')}
              variant="primary"
              size="md"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="View All"
              onPress={() => navigation.navigate('Feed')}
              variant="outline"
              size="md"
              style={styles.actionButton}
            />
          </View>
        </MotiView>

        {/* SMS Actions */}
        {isPermissionGranted && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 500 }}
            style={styles.smsSection}
          >
            <AnimatedButton
              title={smsProcessing ? 'Checking SMS...' : 'Check SMS for Transactions'}
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
              variant="secondary"
              size="lg"
              disabled={smsProcessing}
              style={styles.smsButton}
            />
            <AnimatedButton
              title="Clear & Re-scan ALL SMS"
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
              variant="outline"
              size="md"
              disabled={smsProcessing}
              style={styles.clearButton}
            />
          </MotiView>
        )}

        {/* Recent Transactions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 600 }}
          style={styles.recentSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((transaction, index) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              index={index}
              onPress={() => console.log('Transaction pressed:', transaction.id)}
            />
          ))}
        </MotiView>
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
    alignItems: 'center',
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
  actionButton: {
    flex: 1,
  },
  smsSection: {
    marginTop: 24,
    gap: 12,
  },
  smsButton: {
    width: '100%',
  },
  clearButton: {
    width: '100%',
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
});
