import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Icon } from '../../../components/ui/Icon';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { FamilyMember } from '../types/family.types';

interface MemberListProps {
  members: FamilyMember[];
  currentUserId: string;
  isAdmin: boolean;
  onRemoveMember?: (userId: string) => void;
}

export function MemberList({ members, currentUserId, isAdmin, onRemoveMember }: MemberListProps) {
  const handleRemoveMember = (member: FamilyMember) => {
    if (member.userId === currentUserId) {
      Alert.alert('Cannot Remove', 'You cannot remove yourself. Use "Leave Family" instead.');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.userName || 'this member'} from the family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemoveMember?.(member.userId),
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: FamilyMember }) => {
    const isCurrentUser = item.userId === currentUserId;
    const canRemove = isAdmin && !isCurrentUser && onRemoveMember;

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberAvatar}>
          <Icon name="user" size={20} color={Colors.primary} />
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>
              {item.userName || 'Unknown User'}
              {isCurrentUser && <Text style={styles.youLabel}> (You)</Text>}
            </Text>
            {item.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Icon name="shield-check" size={12} color={Colors.primary} />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          {item.userEmail && (
            <Text style={styles.memberEmail}>{item.userEmail}</Text>
          )}
          <Text style={styles.memberJoinDate}>
            Joined {new Date(item.joinedAt).toLocaleDateString()}
          </Text>
        </View>
        {canRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveMember(item)}
          >
            <Icon name="x-circle" size={18} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <Text style={styles.count}>{members.length}</Text>
      </View>
      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  count: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
  },
  youLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  memberEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  memberJoinDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
  },
  adminBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
});
