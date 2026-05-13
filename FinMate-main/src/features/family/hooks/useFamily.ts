import { useEffect } from 'react';
import { useFamilyStore } from '../store/familyStore';
import { useStore } from '../../../store/useStore';

export function useFamily() {
  const { currentUserId } = useStore();
  const {
    currentFamily,
    sharedTransactions,
    familyAnalytics,
    isLoading,
    error,
    loadFamily,
    createFamily,
    joinFamily,
    leaveFamily,
    shareTransaction,
    unshareTransaction,
    loadSharedTransactions,
    loadFamilyAnalytics,
    removeMember,
    deleteFamily,
    refreshFamily,
    clearFamily,
    setError,
  } = useFamilyStore();

  useEffect(() => {
    if (currentUserId) {
      loadFamily(currentUserId);
    }
  }, [currentUserId]);

  const handleCreateFamily = async (name: string) => {
    if (!currentUserId) {
      throw new Error('User not logged in');
    }
    return await createFamily(name, currentUserId);
  };

  const handleJoinFamily = async (inviteCode: string) => {
    if (!currentUserId) {
      throw new Error('User not logged in');
    }
    await joinFamily(inviteCode, currentUserId);
  };

  const handleLeaveFamily = async () => {
    if (!currentUserId) {
      throw new Error('User not logged in');
    }
    await leaveFamily(currentUserId);
  };

  const handleShareTransaction = async (transactionId: string) => {
    if (!currentUserId) {
      throw new Error('User not logged in');
    }
    await shareTransaction(transactionId, currentUserId);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentUserId) {
      throw new Error('User not logged in');
    }
    await removeMember(userId, currentUserId);
  };

  const handleDeleteFamily = async () => {
    if (!currentUserId) {
      throw new Error('User not logged in');
    }
    await deleteFamily(currentUserId);
  };

  const isAdmin = currentFamily?.members.find(
    m => m.userId === currentUserId && m.role === 'admin'
  ) !== undefined;

  const currentMember = currentFamily?.members.find(
    m => m.userId === currentUserId
  );

  return {
    // State
    currentFamily,
    sharedTransactions,
    familyAnalytics,
    isLoading,
    error,
    isAdmin,
    currentMember,
    hasFamily: currentFamily !== null,

    // Actions
    createFamily: handleCreateFamily,
    joinFamily: handleJoinFamily,
    leaveFamily: handleLeaveFamily,
    shareTransaction: handleShareTransaction,
    unshareTransaction,
    loadSharedTransactions,
    loadFamilyAnalytics,
    removeMember: handleRemoveMember,
    deleteFamily: handleDeleteFamily,
    refreshFamily,
    clearFamily,
    setError,
  };
}
