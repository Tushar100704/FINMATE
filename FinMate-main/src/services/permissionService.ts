import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SMSPermissionStatus } from '../types';

const SMS_PERMISSION_KEY = '@finmate_sms_permission';
const SMS_PERMISSION_ASKED_KEY = '@finmate_sms_permission_asked';

export class PermissionService {
  /**
   * Check current SMS permission status
   */
  static async checkSMSPermission(): Promise<SMSPermissionStatus> {
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_SMS
        );
        
        return {
          granted: permission,
          canAskAgain: true,
          status: permission ? 'granted' : 'undetermined'
        };
      } else {
        // iOS doesn't allow SMS reading, so we'll use a different approach
        const hasAskedBefore = await AsyncStorage.getItem(SMS_PERMISSION_ASKED_KEY);
        const isGranted = await this.getStoredSMSPermission();
        
        return {
          granted: isGranted,
          canAskAgain: !hasAskedBefore,
          status: isGranted ? 'granted' : 'undetermined'
        };
      }
    } catch (error) {
      console.error('Error checking SMS permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined'
      };
    }
  }

  /**
   * Request SMS permission from user
   */
  static async requestSMSPermission(): Promise<SMSPermissionStatus> {
    try {
      // Mark that we've asked for permission
      await AsyncStorage.setItem(SMS_PERMISSION_ASKED_KEY, 'true');

      if (Platform.OS === 'android') {
        // Request Android SMS permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Access Required',
            message: 'FinMate needs access to read your SMS messages to automatically detect UPI transactions and create expense entries. This helps you track spending without manual entry.\n\nYour SMS data stays on your device and is never shared.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        
        if (isGranted) {
          await AsyncStorage.setItem(SMS_PERMISSION_KEY, 'granted');
        }

        return {
          granted: isGranted,
          canAskAgain: granted !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
          status: isGranted ? 'granted' : 'denied'
        };
      } else {
        // iOS - Show explanation dialog
        return new Promise((resolve) => {
          Alert.alert(
            'SMS Access Required',
            'FinMate needs access to read your SMS messages to automatically detect UPI transactions and create expense entries. This helps you track spending without manual entry.\n\nYour SMS data stays on your device and is never shared.\n\nNote: On iOS, you\'ll need to manually import transactions or use the manual entry feature.',
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: () => {
                  resolve({
                    granted: false,
                    canAskAgain: true,
                    status: 'denied'
                  });
                }
              },
              {
                text: 'I Understand',
                onPress: async () => {
                  // Save permission granted status for iOS (manual mode)
                  await AsyncStorage.setItem(SMS_PERMISSION_KEY, 'granted');
                  resolve({
                    granted: true,
                    canAskAgain: true,
                    status: 'granted'
                  });
                }
              }
            ]
          );
        });
      }
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied'
      };
    }
  }

  /**
   * Get stored permission status
   */
  static async getStoredSMSPermission(): Promise<boolean> {
    try {
      const permission = await AsyncStorage.getItem(SMS_PERMISSION_KEY);
      return permission === 'granted';
    } catch (error) {
      console.error('Error getting stored SMS permission:', error);
      return false;
    }
  }

  /**
   * Open app settings for manual permission grant
   */
  static async openAppSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening app settings:', error);
      Alert.alert(
        'Settings Error',
        'Unable to open settings. Please manually enable SMS permissions in your device settings.'
      );
    }
  }

  /**
   * Show permission denied dialog with options
   */
  static showPermissionDeniedDialog(): Promise<'settings' | 'cancel'> {
    return new Promise((resolve) => {
      Alert.alert(
        'SMS Permission Required',
        'SMS access is required for automatic transaction detection. You can enable it in Settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve('cancel')
          },
          {
            text: 'Open Settings',
            onPress: () => resolve('settings')
          }
        ]
      );
    });
  }

  /**
   * Reset permission status (for testing)
   */
  static async resetPermissions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SMS_PERMISSION_KEY);
      await AsyncStorage.removeItem(SMS_PERMISSION_ASKED_KEY);
      console.log('SMS permissions reset');
    } catch (error) {
      console.error('Error resetting permissions:', error);
    }
  }
}
