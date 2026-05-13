import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SMSService } from './smsService';
import { TransactionProcessor } from './transactionProcessor';
import { PermissionService } from './permissionService';
import { AuthService } from './auth';

// Conditional imports for background tasks (only on Android with packages installed)
let TaskManager: any = null;
let BackgroundFetch: any = null;

try {
  if (Platform.OS === 'android') {
    TaskManager = require('expo-task-manager');
    BackgroundFetch = require('expo-background-fetch');
  }
} catch (error) {
  console.warn('Background task packages not installed. Background processing disabled.');
}

const SMS_PROCESSING_TASK = 'SMS_PROCESSING_TASK';
const LAST_BACKGROUND_RUN_KEY = '@finmate_last_background_run';

// Define the background task (only if TaskManager is available)
if (TaskManager) {
  TaskManager.defineTask(SMS_PROCESSING_TASK, async () => {
  try {
    console.log('🔄 Background SMS processing started');

    // Check if user is logged in
    const session = await AuthService.getSession();
    if (!session?.isLoggedIn || !session.userId) {
      console.log('⚠️ No active session, skipping SMS processing');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Check SMS permissions
    const permission = await PermissionService.checkSMSPermission();
    if (!permission.granted) {
      console.log('⚠️ SMS permission not granted, skipping processing');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Get new SMS messages
    const newMessages = await SMSService.getNewSMS();
    if (newMessages.length === 0) {
      console.log('📱 No new SMS messages found');
      await updateLastBackgroundRun();
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Filter for UPI messages
    const upiMessages = SMSService.filterUPISMS(newMessages);
    if (upiMessages.length === 0) {
      console.log('📱 No UPI messages found in new SMS');
      await updateLastBackgroundRun();
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Process UPI messages
    const result = await TransactionProcessor.processSMSBatch(upiMessages, session.userId);
    
    console.log('✅ Background SMS processing completed:', {
      processed: result.processed,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors
    });

    await updateLastBackgroundRun();

    // Return appropriate result
    if (result.created > 0) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    } catch (error) {
      console.error('❌ Background SMS processing error:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

async function updateLastBackgroundRun(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_BACKGROUND_RUN_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error updating last background run:', error);
  }
}

export class BackgroundTaskService {
  /**
   * Register background task for SMS processing
   */
  static async registerBackgroundTask(): Promise<boolean> {
    try {
      if (!TaskManager || !BackgroundFetch) {
        console.log('⚠️ Background task packages not installed');
        return false;
      }

      if (Platform.OS !== 'android') {
        console.log('⚠️ Background SMS processing only available on Android');
        return false;
      }

      // Check if task is already registered
      const isRegistered = await TaskManager.isTaskRegisteredAsync(SMS_PROCESSING_TASK);
      if (isRegistered) {
        console.log('📱 SMS processing task already registered');
        return true;
      }

      // Check if BackgroundFetch has the required methods
      if (!BackgroundFetch || typeof BackgroundFetch.registerTaskAsync !== 'function') {
        console.warn('⚠️ BackgroundFetch not available in this environment (emulator limitation)');
        return false;
      }

      // Request permissions if available
      if (typeof BackgroundFetch.requestPermissionsAsync === 'function') {
        await BackgroundFetch.requestPermissionsAsync();
      }

      // Register background fetch
      await BackgroundFetch.registerTaskAsync(SMS_PROCESSING_TASK, {
        minimumInterval: 5 * 60, // 5 minutes in seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('✅ Background SMS processing task registered');
      return true;
    } catch (error) {
      console.error('❌ Error registering background task:', error);
      return false;
    }
  }

  /**
   * Unregister background task
   */
  static async unregisterBackgroundTask(): Promise<void> {
    try {
      if (!TaskManager) {
        return;
      }
      const isRegistered = await TaskManager.isTaskRegisteredAsync(SMS_PROCESSING_TASK);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(SMS_PROCESSING_TASK);
        console.log('✅ Background SMS processing task unregistered');
      }
    } catch (error) {
      console.error('❌ Error unregistering background task:', error);
    }
  }

  /**
   * Check background task status
   */
  static async getBackgroundTaskStatus(): Promise<{
    isRegistered: boolean;
    isAvailable: boolean;
    lastRun: string | null;
    status?: any;
  }> {
    try {
      if (!TaskManager || !BackgroundFetch) {
        return {
          isRegistered: false,
          isAvailable: false,
          lastRun: null
        };
      }

      const isRegistered = await TaskManager.isTaskRegisteredAsync(SMS_PROCESSING_TASK);
      const isAvailable = Platform.OS === 'android';
      const lastRun = await AsyncStorage.getItem(LAST_BACKGROUND_RUN_KEY);
      
      let status = null;
      if (isRegistered) {
        status = await BackgroundFetch.getStatusAsync();
      }

      return {
        isRegistered,
        isAvailable,
        lastRun,
        status
      };
    } catch (error) {
      console.error('Error getting background task status:', error);
      return {
        isRegistered: false,
        isAvailable: false,
        lastRun: null
      };
    }
  }

  /**
   * Manually trigger SMS processing (for testing)
   */
  static async manualSMSProcessing(): Promise<{
    success: boolean;
    processed: number;
    created: number;
    error?: string;
  }> {
    try {
      console.log('🔄 Manual SMS processing triggered');

      // Check if user is logged in
      const session = await AuthService.getSession();
      if (!session?.isLoggedIn || !session.userId) {
        return {
          success: false,
          processed: 0,
          created: 0,
          error: 'No active session'
        };
      }

      // Check SMS permissions
      const permission = await PermissionService.checkSMSPermission();
      if (!permission.granted) {
        return {
          success: false,
          processed: 0,
          created: 0,
          error: 'SMS permission not granted'
        };
      }

      // Get new SMS messages
      const newMessages = await SMSService.getNewSMS();
      const upiMessages = SMSService.filterUPISMS(newMessages);

      if (upiMessages.length === 0) {
        return {
          success: true,
          processed: 0,
          created: 0
        };
      }

      // Process messages
      const result = await TransactionProcessor.processSMSBatch(upiMessages, session.userId);

      return {
        success: true,
        processed: result.processed,
        created: result.created
      };
    } catch (error) {
      console.error('❌ Manual SMS processing error:', error);
      return {
        success: false,
        processed: 0,
        created: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Start background processing (call after login)
   */
  static async startBackgroundProcessing(): Promise<boolean> {
    try {
      // Check permissions first
      const smsPermission = await PermissionService.checkSMSPermission();
      if (!smsPermission.granted) {
        console.log('⚠️ SMS permission required for background processing');
        return false;
      }

      // Register background task
      const registered = await this.registerBackgroundTask();
      if (registered) {
        console.log('✅ Background SMS processing started');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error starting background processing:', error);
      return false;
    }
  }

  /**
   * Stop background processing (call on logout)
   */
  static async stopBackgroundProcessing(): Promise<void> {
    try {
      await this.unregisterBackgroundTask();
      console.log('✅ Background SMS processing stopped');
    } catch (error) {
      console.error('❌ Error stopping background processing:', error);
    }
  }

  /**
   * Get processing statistics
   */
  static async getProcessingStats(): Promise<{
    backgroundTaskStatus: any;
    smsStats: any;
    lastRun: string | null;
  }> {
    try {
      const taskStatus = await this.getBackgroundTaskStatus();
      const smsStats = await SMSService.getProcessingStats();
      
      return {
        backgroundTaskStatus: taskStatus,
        smsStats,
        lastRun: taskStatus.lastRun
      };
    } catch (error) {
      console.error('Error getting processing stats:', error);
      return {
        backgroundTaskStatus: null,
        smsStats: null,
        lastRun: null
      };
    }
  }
}
