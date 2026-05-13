import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { useStore } from '../../../store/useStore';
import { useFamily } from '../hooks/useFamily';
import { FamilyCard } from '../components/FamilyCard';
import { MemberList } from '../components/MemberList';
import { SharedTransactionRow } from '../components/SharedTransactionRow';
import { InviteModal } from '../components/InviteModal';

export function FamilyHomeScreen({ navigation }: any) {
  const { currentUserId } = useStore();
  const {
    currentFamily,
    sharedTransactions,
    isLoading,
    hasFamily,
    isAdmin,
    refreshFamily,
    leaveFamily,
    deleteFamily,
    removeMember,
  } = useFamily();

  const [refreshing, setRefreshing] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  console.log('🏠 FamilyHomeScreen render - hasFamily:', hasFamily, 'currentFamily:', currentFamily?.name, 'isLoading:', isLoading);

  useFocusEffect(
    useCallback(() => {
      // Always refresh family data when screen comes into focus
      // This ensures newly created families are displayed
      console.log('🔄 FamilyHomeScreen focused - refreshing family data');
      refreshFamily();
    }, [refreshFamily])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFamily();
    setRefreshing(false);
  };

  const handleLeaveFamily = () => {
    Alert.alert(
      'Leave Family',
      'Are you sure you want to leave this family? You will lose access to all shared data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveFamily();
              Alert.alert('Success', 'You have left the family');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to leave family');
            }
          },
        },
      ]
    );
  };

  const handleDeleteFamily = () => {
    Alert.alert(
      'Delete Family',
      'Are you sure you want to delete this family? This action cannot be undone and all shared data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFamily();
              Alert.alert('Success', 'Family has been deleted');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete family');
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember(userId);
      Alert.alert('Success', 'Member removed from family');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  if (!hasFamily) {
    return (
      <ScreenWrapper scroll={false}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="users" size={64} color={Colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No Family Yet</Text>
          <Text style={styles.emptyDescription}>
            Create a family to share expenses and budgets with your household members, or join an existing family with an invite code.
          </Text>
          <View style={styles.emptyActions}>
            <Button
              title="Create Family"
              onPress={() => navigation.navigate('CreateFamily')}
              variant="primary"
            />
            <Button
              title="Join Family"
              onPress={() => navigation.navigate('JoinFamily')}
              variant="secondary"
            />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (!currentFamily) {
    return (
      <ScreenWrapper scroll={false}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading family...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const totalSpending = sharedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const recentTransactions = sharedTransactions.slice(0, 5);

  return (
    <ScreenWrapper
      scroll
      horizontalPadding={false}
      scrollViewProps={{
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />,
      }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Family</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FamilyAnalytics')} style={styles.analyticsButton}>
          <Icon name="bar-chart" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FamilyCard
          family={currentFamily}
          totalSpending={totalSpending}
          onPress={() => setInviteModalVisible(true)}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {sharedTransactions.length > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <SharedTransactionRow
                key={transaction.id}
                transaction={transaction}
                showSharedBy
              />
            ))
          ) : (
            <View style={styles.emptyTransactions}>
              <Icon name="receipt" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTransactionsText}>No shared transactions yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <MemberList
            members={currentFamily.members}
            currentUserId={currentUserId || ''}
            isAdmin={isAdmin}
            onRemoveMember={handleRemoveMember}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.actionButtons}>
            <Button
              title="Invite Members"
              onPress={() => setInviteModalVisible(true)}
              variant="primary"
            />
            {isAdmin ? (
              <Button
                title="Delete Family"
                onPress={handleDeleteFamily}
                variant="secondary"
              />
            ) : (
              <Button
                title="Leave Family"
                onPress={handleLeaveFamily}
                variant="secondary"
              />
            )}
          </View>
        </View>
      </View>

      <InviteModal
        visible={inviteModalVisible}
        inviteCode={currentFamily.inviteCode}
        familyName={currentFamily.name}
        onClose={() => setInviteModalVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.text,
  },
  analyticsButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  emptyTransactionsText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  actionButtons: {
    gap: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  emptyActions: {
    width: '100%',
    gap: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
});
