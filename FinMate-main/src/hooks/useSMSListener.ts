import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useStore } from '../store/useStore';
import { PermissionService } from '../services/permissionService';
import { SMSService } from '../services/smsService';
import { TransactionProcessor } from '../services/transactionProcessor';
import { BackgroundTaskService } from '../services/backgroundTaskService';

export function useSMSListener() {
  const {
    currentUserId,
    smsPermissionStatus,
    setSMSPermissionStatus,
    smsProcessingEnabled,
    setSMSProcessingEnabled,
    setLastSMSProcessingTime,
    addTransaction,
    setAutoDetectedTransactionCount,
    autoDetectedTransactionCount
  } = useStore();

  /**
   * Initialize SMS processing
   */
  const initializeSMSProcessing = useCallback(async () => {
    if (!currentUserId) return;

    try {
      console.log('🔄 Initializing SMS processing...');

      // Check SMS permissions
      const permission = await PermissionService.checkSMSPermission();
      setSMSPermissionStatus(permission);

      if (permission.granted) {
        // Start background processing
        const started = await BackgroundTaskService.startBackgroundProcessing();
        setSMSProcessingEnabled(started);

        if (started) {
          console.log('✅ SMS processing initialized successfully');
        }
      } else {
        console.log('⚠️ SMS permission not granted');
        setSMSProcessingEnabled(false);
      }
    } catch (error) {
      console.error('❌ Error initializing SMS processing:', error);
      setSMSProcessingEnabled(false);
    }
  }, [currentUserId, setSMSPermissionStatus, setSMSProcessingEnabled]);

  /**
   * Request SMS permissions
   */
  const requestSMSPermission = useCallback(async () => {
    try {
      const permission = await PermissionService.requestSMSPermission();
      setSMSPermissionStatus(permission);

      if (permission.granted) {
        // Start background processing after permission granted
        const started = await BackgroundTaskService.startBackgroundProcessing();
        setSMSProcessingEnabled(started);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error requesting SMS permission:', error);
      return false;
    }
  }, [setSMSPermissionStatus, setSMSProcessingEnabled]);

  /**
   * Manual SMS processing trigger
   */
  const processSMSManually = useCallback(async () => {
    if (!currentUserId || !smsPermissionStatus?.granted) {
      console.log('⚠️ Cannot process SMS: no user or permission');
      return { success: false, error: 'No permission or user' };
    }

    try {
      console.log('🔄 Manual SMS processing started...');
      
      const result = await BackgroundTaskService.manualSMSProcessing();
      
      if (result.success && result.created > 0) {
        // Update last processing time
        setLastSMSProcessingTime(new Date().toISOString());
        
        // Update auto-detected count
        setAutoDetectedTransactionCount(autoDetectedTransactionCount + result.created);
        
        console.log(`✅ Manual SMS processing completed: ${result.created} transactions created`);
      }

      return result;
    } catch (error) {
      console.error('❌ Manual SMS processing error:', error);
      return { 
        success: false, 
        processed: 0, 
        created: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [
    currentUserId, 
    smsPermissionStatus, 
    setLastSMSProcessingTime, 
    setAutoDetectedTransactionCount, 
    autoDetectedTransactionCount
  ]);

  /**
   * Stop SMS processing
   */
  const stopSMSProcessing = useCallback(async () => {
    try {
      await BackgroundTaskService.stopBackgroundProcessing();
      setSMSProcessingEnabled(false);
      console.log('✅ SMS processing stopped');
    } catch (error) {
      console.error('❌ Error stopping SMS processing:', error);
    }
  }, [setSMSProcessingEnabled]);

  /**
   * Handle app state changes
   */
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && smsProcessingEnabled && currentUserId) {
      // App came to foreground, check for new transactions
      console.log('📱 App became active, checking for new SMS...');
      processSMSManually();
    }
  }, [smsProcessingEnabled, currentUserId, processSMSManually]);

  /**
   * Get SMS processing statistics
   */
  const getSMSStats = useCallback(async () => {
    try {
      const stats = await BackgroundTaskService.getProcessingStats();
      return stats;
    } catch (error) {
      console.error('❌ Error getting SMS stats:', error);
      return null;
    }
  }, []);

  // Initialize SMS processing when user logs in
  useEffect(() => {
    if (currentUserId) {
      initializeSMSProcessing();
    } else {
      // User logged out, stop processing
      stopSMSProcessing();
    }
  }, [currentUserId, initializeSMSProcessing, stopSMSProcessing]);

  // Listen to app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [handleAppStateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (smsProcessingEnabled) {
        BackgroundTaskService.stopBackgroundProcessing();
      }
    };
  }, [smsProcessingEnabled]);

  return {
    // State
    smsPermissionStatus,
    smsProcessingEnabled,
    
    // Actions
    requestSMSPermission,
    processSMSManually,
    stopSMSProcessing,
    getSMSStats,
    
    // Utilities
    isPermissionGranted: smsPermissionStatus?.granted || false,
    canRequestPermission: smsPermissionStatus?.canAskAgain || true,
  };
}
