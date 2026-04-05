import { Platform, PermissionsAndroid } from 'react-native';
import { SMSMessage } from '../types';

// Import the SMS reading package
let SmsAndroid: any = null;
try {
  if (Platform.OS === 'android') {
    SmsAndroid = require('react-native-get-sms-android');
    console.log('✅ SMS reading package loaded successfully');
  }
} catch (error) {
  console.warn('⚠️ SMS reading package not available:', error);
}

/**
 * Native SMS Reader for Android
 * Reads real SMS messages from the device
 */
export class NativeSMSReader {
  /**
   * Check if native SMS reading is available
   */
  static isAvailable(): boolean {
    return Platform.OS === 'android' && SmsAndroid !== null;
  }

  /**
   * Read SMS messages from device using ContentResolver
   */
  static async readSMS(options: {
    maxCount?: number;
    fromDate?: Date;
    senders?: string[];
    offset?: number;
  }): Promise<SMSMessage[]> {
    if (!this.isAvailable()) {
      console.warn('SMS reading not available on this platform');
      return [];
    }

    try {
      const {
        maxCount = 1000, // Increased to 1000 to fetch all messages
        fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days lookback
        senders = []
      } = options;

      console.log('📱 Reading real SMS messages from device...', {
        maxCount,
        fromDate: fromDate.toISOString(),
        sendersCount: senders.length
      });

      // Use the native module to read SMS
      const messages = await this.readSMSFromContentResolver(maxCount, fromDate.getTime());
      
      console.log(`📱 Found ${messages.length} SMS messages from device`);

      // Log first few SMS for debugging
      if (messages.length > 0) {
        console.log('📱 Sample SMS (first 3):');
        messages.slice(0, 3).forEach((msg, idx) => {
          console.log(`  ${idx + 1}. From: ${msg.address}, Body: ${msg.body.substring(0, 80)}...`);
        });
      }

      // Filter by senders if specified
      if (senders.length > 0) {
        const filtered = messages.filter(msg => {
          const address = msg.address?.toUpperCase() || '';
          const matchesSender = senders.some(sender => address.includes(sender.toUpperCase()));
          if (matchesSender) {
            console.log(`✅ SMS from ${msg.address} matches filter`);
          }
          return matchesSender;
        });
        console.log(`📱 Filtered to ${filtered.length} messages from specified senders`);
        return filtered;
      }

      return messages;
    } catch (error) {
      console.error('❌ Error reading SMS:', error);
      return [];
    }
  }

  /**
   * Read SMS from Android ContentResolver
   * This uses react-native-get-sms-android to access SMS database
   */
  private static async readSMSFromContentResolver(
    maxCount: number,
    fromTimestamp: number
  ): Promise<SMSMessage[]> {
    return new Promise((resolve) => {
      try {
        // Check if we have the SMS module
        if (!SmsAndroid) {
          console.log('⚠️ Native SMS module not available, using fallback');
          resolve(this.readSMSFallback(maxCount, fromTimestamp));
          return;
        }

        console.log('📱 Using react-native-get-sms-android to read SMS');

        const filter = {
          box: 'inbox', // 'inbox', 'sent', 'draft', 'outbox', 'failed', 'queued'
          maxCount,
          minDate: fromTimestamp,
        };

        // Use the SMS Android package
        SmsAndroid.list(
          JSON.stringify(filter),
          (fail: any) => {
            console.error('❌ Failed to read SMS:', fail);
            resolve(this.readSMSFallback(maxCount, fromTimestamp));
          },
          (count: number, smsList: string) => {
            try {
              console.log(`✅ Successfully read ${count} SMS messages`);
              const messages = JSON.parse(smsList);
              const formattedMessages: SMSMessage[] = messages.map((msg: any) => ({
                id: msg._id?.toString() || `sms_${Date.now()}_${Math.random()}`,
                body: msg.body || '',
                address: msg.address || '',
                date: parseInt(msg.date) || Date.now(),
                read: msg.read === 1 || msg.read === '1'
              }));
              resolve(formattedMessages);
            } catch (error) {
              console.error('❌ Error parsing SMS list:', error);
              resolve([]);
            }
          }
        );
      } catch (error) {
        console.error('❌ Error in readSMSFromContentResolver:', error);
        resolve(this.readSMSFallback(maxCount, fromTimestamp));
      }
    });
  }

  /**
   * Fallback method when native module is not available
   * Creates a native module on-the-fly using NativeModules
   */
  private static async readSMSFallback(
    maxCount: number,
    fromTimestamp: number
  ): Promise<SMSMessage[]> {
    console.log('📱 Using SMS fallback method - reading from inbox');
    
    // In Expo Go, we can't read real SMS without a development build
    // Return empty array and log instructions
    console.warn(`
⚠️ REAL SMS READING REQUIRES DEVELOPMENT BUILD ⚠️

To read real SMS messages, you need to:
1. Create a development build: npx expo run:android
2. Or use EAS Build: eas build --profile development --platform android

Expo Go doesn't support native SMS reading due to security restrictions.

For now, the app will work with manual transaction entry.
    `);
    
    return [];
  }

  /**
   * Request SMS permission
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'FinMate needs access to your SMS messages to automatically detect transactions',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      console.log('📱 SMS permission result:', isGranted ? 'GRANTED' : 'DENIED');
      
      return isGranted;
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
      return false;
    }
  }

  /**
   * Check if SMS permission is granted
   */
  static async checkPermission(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );
      return hasPermission;
    } catch (error) {
      console.error('Error checking SMS permission:', error);
      return false;
    }
  }
}
