import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { useStore } from '../../store/useStore';
import { TransactionDB, BudgetDB, UserDB } from '../../services/database';
import { AuthService } from '../../services/auth';
import { Icon, IconName } from '../../components/ui/Icon';
import { useFamilyStore } from '../../features/family/store/familyStore';

export function ProfileScreen({ navigation }: any) {
  const { transactions, budgets, setTransactions, setBudgets, setCurrentUserId, currentUserId, user: storeUser } = useStore();
  const { clearFamily } = useFamilyStore();
  const { formatCurrency, selectedCurrency } = useCurrencyFormat();
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
  });
  
  // Load user data on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('👤 ProfileScreen - currentUserId:', currentUserId);
      console.log('👤 ProfileScreen - storeUser:', storeUser);
      loadUserData();
    }, [currentUserId, storeUser])
  );
  
  const loadUserData = async () => {
    console.log('👤 Loading user data for ID:', currentUserId);
    if (!currentUserId) {
      console.log('⚠️ No currentUserId set');
      return;
    }
    
    try {
      // First check if we have user data in the store (set during login)
      if (storeUser && storeUser.id === currentUserId) {
        console.log('✅ Using store user data:', storeUser.name, storeUser.email);
        setUser({
          name: storeUser.name || 'User',
          email: storeUser.email || 'user@example.com',
        });
        return;
      }
      
      // Fall back to loading from local database
      console.log('💾 Loading from UserDB...');
      const userData = await UserDB.getById(currentUserId);
      console.log('💾 UserDB result:', userData);
      
      if (userData) {
        console.log('✅ Setting user from UserDB:', userData.name, userData.email);
        setUser({
          name: userData.name || 'User',
          email: userData.email || 'user@example.com',
        });
      } else {
        console.log('⚠️ No user data found in UserDB for ID:', currentUserId);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  };
  
  // Calculate dynamic stats
  const totalTransactions = transactions.length;
  const totalBudgets = budgets.length;
  const totalCategories = new Set(transactions.map(t => t.category)).size;

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions, budgets, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await TransactionDB.deleteAll();
              await BudgetDB.deleteAll();
              setTransactions([]);
              setBudgets([]);
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'user-circle', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
        { icon: 'target', label: 'Monthly Budget', value: formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0)), onPress: () => navigation.navigate('MainTabs', { screen: 'Budgets' }) },
        { icon: 'building', label: 'Bank Accounts', onPress: () => navigation.navigate('BankAccounts') },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { icon: 'settings', label: 'Settings', onPress: () => navigation.navigate('Settings') },
        { icon: 'bell', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
        { icon: 'filter', label: 'Categories', onPress: () => Alert.alert('Coming Soon', 'Category management will be available soon!') },
        { icon: 'rupee', label: 'Currency', value: `${selectedCurrency.code} (${selectedCurrency.symbol})`, onPress: () => navigation.navigate('Currency') },
      ],
    },
    {
      section: 'Data',
      items: [
        { icon: 'download', label: 'Export Data', onPress: () => navigation.navigate('ExportData') },
        { icon: 'upload', label: 'Import Transactions', onPress: () => navigation.navigate('ImportData') },
        { icon: 'trash', label: 'Clear All Data', onPress: handleClearData, danger: true },
      ],
    },
    {
      section: 'About',
      items: [
        { icon: 'info', label: 'About FinMate', value: 'v1.0.0', onPress: () => Alert.alert('FinMate', 'Version 1.0.0\n\nYour personal finance manager') },
        { icon: 'lock', label: 'Privacy Policy', onPress: () => Alert.alert('Privacy Policy', 'Your data is stored locally on your device and is never shared.') },
        { icon: 'mail', label: 'Contact Support', onPress: () => Alert.alert('Contact Support', 'Email: support@finmate.app') },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              // Clear user data from store
              setCurrentUserId(null);
              setTransactions([]);
              setBudgets([]);
              // Clear family data
              clearFamily();
              console.log('👋 Logged out successfully');
              navigation.replace('Landing');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper scroll horizontalPadding={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalTransactions}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalBudgets}</Text>
            <Text style={styles.statLabel}>Budgets</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalCategories}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </Card>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <Card variant="outlined">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Icon 
                        name={item.icon as IconName} 
                        size={20} 
                        color={item.danger ? Colors.error : Colors.textSecondary}
                        strokeWidth={2}
                      />
                    </View>
                    <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                      {item.label}
                    </Text>
                  </View>
                  {item.value && (
                    <Text style={styles.menuValue}>{item.value}</Text>
                  )}
                  <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made for smart budgeting</Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  content: {
    padding: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  menuLabelDanger: {
    color: Colors.error,
  },
  menuValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  menuArrow: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textTertiary,
  },
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
});
