import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { BankAccountDB } from '../../services/database';
import { generateId } from '../../utils/helpers';

interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  status: 'active' | 'removed' | 'closed';
  createdAt?: string;
}

export function BankAccountsScreen({ navigation }: any) {
  const { currentUserId } = useStore();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
    }, [currentUserId])
  );

  const loadAccounts = async () => {
    if (!currentUserId) return;

    try {
      const allAccounts = await BankAccountDB.getAllByUser(currentUserId);
      setAccounts(allAccounts);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    Alert.alert(
      'Add Bank Account',
      'This feature will allow you to link your bank accounts for automatic transaction tracking.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Sample',
          onPress: async () => {
            if (!currentUserId) return;
            
            try {
              const newAccount: BankAccount = {
                id: generateId(),
                userId: currentUserId,
                bankName: 'HDFC Bank',
                accountNumber: '****1234',
                accountHolderName: 'User Name',
                status: 'active',
              };
              
              await BankAccountDB.create(newAccount);
              loadAccounts();
              Alert.alert('Success', 'Sample account added!');
            } catch (error) {
              Alert.alert('Error', 'Failed to add account');
            }
          },
        },
      ]
    );
  };

  const handleAccountAction = (account: BankAccount) => {
    Alert.alert(
      account.bankName,
      `Account: ${account.accountNumber}\nStatus: ${account.status}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: account.status === 'active' ? 'Deactivate' : 'Activate',
          onPress: async () => {
            try {
              await BankAccountDB.update(account.id, {
                status: account.status === 'active' ? 'removed' : 'active',
              });
              loadAccounts();
            } catch (error) {
              Alert.alert('Error', 'Failed to update account');
            }
          },
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await BankAccountDB.delete(account.id);
              loadAccounts();
              Alert.alert('Success', 'Account removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove account');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'removed':
        return Colors.warning;
      case 'closed':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '✓';
      case 'removed':
        return '⊘';
      case 'closed':
        return '✕';
      default:
        return '?';
    }
  };

  const renderAccount = ({ item }: { item: BankAccount }) => (
    <TouchableOpacity onPress={() => handleAccountAction(item)}>
      <Card style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.bankIcon}>
            <Text style={styles.bankIconText}>🏦</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.bankName}>{item.bankName}</Text>
            <Text style={styles.accountNumber}>{item.accountNumber}</Text>
            <Text style={styles.accountHolder}>{item.accountHolderName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusIcon(item.status)} {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Accounts</Text>
        <TouchableOpacity onPress={handleAddAccount} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>🏦 Linked Bank Accounts</Text>
          <Text style={styles.infoText}>
            Manage your linked bank accounts here. You can add, activate, or remove accounts.
          </Text>
        </Card>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🏦</Text>
            <Text style={styles.emptyTitle}>No Bank Accounts</Text>
            <Text style={styles.emptyText}>
              You haven't linked any bank accounts yet.{'\n'}
              Tap the "+ Add" button to get started.
            </Text>
            <Button
              title="Add Bank Account"
              onPress={handleAddAccount}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          <FlatList
            data={accounts}
            renderItem={renderAccount}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        {/* Features Card */}
        <Card style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ Coming Soon</Text>
          <Text style={styles.featuresText}>
            • Automatic transaction sync from bank SMS{'\n'}
            • Real-time balance updates{'\n'}
            • Multi-bank support{'\n'}
            • Secure bank linking with OAuth
          </Text>
        </Card>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
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
  },
  addButton: {
    padding: Spacing.sm,
  },
  addButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  infoCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary + '10',
  },
  infoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    color: Colors.primary,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  accountCard: {
    marginBottom: Spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  bankIconText: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  accountHolder: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
  featuresCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.info + '10',
  },
  featuresTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    color: Colors.info,
  },
  featuresText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
