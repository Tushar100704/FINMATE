import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SMSMessage, ProcessedSMSRecord } from '../types';
import { PermissionService } from './permissionService';
import { NativeSMSReader } from './nativeSMSReader';
import { ProcessedSMSDB } from './database';

const LAST_SMS_CHECK_KEY = '@finmate_last_sms_check';

// Bank and UPI service senders to filter SMS
const UPI_SENDERS = [
  'KOTAK', 'SBI', 'SBIUPI', 'HDFC', 'AXIS', 'ICICI', 'PAYTM', 'PHONEPE', 
  'GOOGLEPAY', 'AMAZONPAY', 'BHARATPE', 'RAZORPAY', 'IPPB',
  'YESBANK', 'INDUSIND', 'FEDERAL', 'CANARA', 'BOB', 'PNB',
  'UNION', 'INDIAN', 'CENTRAL', 'SYNDICATE', 'ALLAHABAD',
  'UPI', 'IMPS', 'NEFT', 'RTGS',
  // Specific sender IDs seen in logs
  'JX-SBIUPI', 'VA-SBIUPI', 'VM-SBIUPI', 'AD-SBIPSG', 'BM-SBIINB'
];

export class SMSService {
  /**
   * Check if SMS reading is available on this platform
   */
  static isAvailable(): boolean {
    return Platform.OS === 'android';
  }

  /**
   * Read SMS messages from device
   * Note: This requires a native module for actual SMS reading
   * For now, we'll simulate the interface
   */
  static async readSMS(options: {
    maxCount?: number;
    fromDate?: Date;
    senders?: string[];
    onProgress?: (current: number, total: number) => void;
  } = {}): Promise<SMSMessage[]> {
    try {
      // Check permission first
      const permission = await PermissionService.checkSMSPermission();
      if (!permission.granted) {
        console.warn('SMS permission not granted');
        return [];
      }

      if (!this.isAvailable()) {
        console.warn('SMS reading not available on this platform');
        return [];
      }

      const {
        maxCount = 1000, // Increased to 1000 to fetch all messages
        fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days lookback
        senders = UPI_SENDERS,
        onProgress
      } = options;

      console.log('📱 Reading SMS messages...', {
        maxCount,
        fromDate: fromDate.toISOString(),
        senders: senders.length
      });

      // Read all SMS at once (react-native-get-sms-android handles this efficiently)
      const messages = await NativeSMSReader.readSMS({
        maxCount,
        fromDate,
        senders
      });

      if (onProgress) {
        onProgress(messages.length, messages.length);
      }

      console.log(`📱 Found ${messages.length} SMS messages in total`);
      return messages;
    } catch (error) {
      console.error('Error reading SMS:', error);
      return [];
    }
  }

  /**
   * Get new SMS messages since last check
   */
  static async getNewSMS(userId: string, onProgress?: (current: number, total: number) => void): Promise<SMSMessage[]> {
    try {
      const lastCheckTime = await this.getLastCheckTime();
      const fromDate = lastCheckTime ? new Date(lastCheckTime) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      console.log('📱 Checking for new SMS since:', fromDate.toISOString());

      const allMessages = await this.readSMS({
        maxCount: 1000, // Increased to 1000 to get all messages
        fromDate,
        senders: UPI_SENDERS,
        onProgress
      });

      // Filter out already processed messages using database
      const newMessages: SMSMessage[] = [];
      for (const msg of allMessages) {
        const hash = this.generateSMSHash(msg);
        const exists = await ProcessedSMSDB.exists(hash);
        if (!exists) {
          newMessages.push(msg);
        }
      }

      // Update last check time
      await this.updateLastCheckTime();

      console.log(`📱 Found ${newMessages.length} new SMS messages`);
      return newMessages;
    } catch (error) {
      console.error('Error getting new SMS:', error);
      return [];
    }
  }

  /**
   * Filter SMS messages for UPI transactions
   */
  static filterUPISMS(messages: SMSMessage[]): SMSMessage[] {
    const upiKeywords = [
      'upi', 'sent rs', 'received rs', 'debited', 'credited',
      'transaction', 'payment', 'transfer', 'ref no', 'ref:'
    ];

    return messages.filter(msg => {
      const body = msg.body.toLowerCase();
      const sender = msg.address.toLowerCase();

      // Check if sender is from known UPI services
      const isUPISender = UPI_SENDERS.some(s => 
        sender.includes(s.toLowerCase()) || body.includes(s.toLowerCase())
      );

      // Check if message contains UPI keywords
      const hasUPIKeywords = upiKeywords.some(keyword => 
        body.includes(keyword)
      );

      return isUPISender || hasUPIKeywords;
    });
  }

  /**
   * Generate unique hash for SMS message
   */
  static generateSMSHash(message: SMSMessage): string {
    const content = `${message.address}_${message.body}_${message.date}`;
    // Simple hash function (in production, use a proper hash library)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Mark SMS as processed
   */
  static async markSMSAsProcessed(
    message: SMSMessage,
    userId: string,
    transactionId?: string
  ): Promise<void> {
    try {
      const hash = this.generateSMSHash(message);

      await ProcessedSMSDB.create({
        smsId: message.id,
        hash,
        body: message.body,
        address: message.address,
        date: message.date,
        transactionId,
        userId
      });

      console.log('📱 Marked SMS as processed:', message.id);
    } catch (error) {
      console.error('Error marking SMS as processed:', error);
    }
  }

  /**
   * Get processed SMS records
   */
  static async getProcessedSMSRecords(userId: string): Promise<any[]> {
    try {
      return await ProcessedSMSDB.getAllByUser(userId);
    } catch (error) {
      console.error('Error getting processed SMS records:', error);
      return [];
    }
  }

  /**
   * Get last SMS check time
   */
  private static async getLastCheckTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_SMS_CHECK_KEY);
    } catch (error) {
      console.error('Error getting last check time:', error);
      return null;
    }
  }

  /**
   * Update last SMS check time
   */
  private static async updateLastCheckTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        LAST_SMS_CHECK_KEY, 
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error updating last check time:', error);
    }
  }

  /**
   * Clear processed SMS records (for testing)
   */
  static async clearProcessedRecords(userId: string): Promise<void> {
    try {
      await ProcessedSMSDB.clear(userId);
      await AsyncStorage.removeItem(LAST_SMS_CHECK_KEY);
      console.log('📱 Cleared processed SMS records');
    } catch (error) {
      console.error('Error clearing processed records:', error);
    }
  }

  /**
   * Get SMS processing statistics
   */
  static async getProcessingStats(userId: string): Promise<{
    totalProcessed: number;
    lastProcessedAt: string | null;
    lastCheckAt: string | null;
    withTransactions: number;
    withoutTransactions: number;
  }> {
    try {
      const stats = await ProcessedSMSDB.getStats(userId);
      const lastCheckTime = await this.getLastCheckTime();

      return {
        ...stats,
        lastCheckAt: lastCheckTime
      };
    } catch (error) {
      console.error('Error getting processing stats:', error);
      return {
        totalProcessed: 0,
        lastProcessedAt: null,
        lastCheckAt: null,
        withTransactions: 0,
        withoutTransactions: 0
      };
    }
  }
}
