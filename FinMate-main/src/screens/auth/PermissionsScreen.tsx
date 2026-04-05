import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PermissionService } from '../../services/permissionService';
import { useSMSListener } from '../../hooks/useSMSListener';

export function PermissionsScreen({ navigation }: any) {
  const [permissions, setPermissions] = useState({
    sms: false,
    notifications: false,
    storage: false,
  });
  const [loading, setLoading] = useState(false);
  const { requestSMSPermission } = useSMSListener();

  // Check existing permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const smsStatus = await PermissionService.checkSMSPermission();
        if (smsStatus.granted) {
          setPermissions(prev => ({ ...prev, sms: true }));
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    };
    checkPermissions();
  }, []);

  const permissionItems = [
    {
      key: 'sms',
      icon: '📱',
      title: 'SMS Access',
      description: 'Read transaction messages from your bank',
      required: true,
    },
    {
      key: 'notifications',
      icon: '🔔',
      title: 'Notifications',
      description: 'Get alerts for budgets and spending',
      required: false,
    },
    {
      key: 'storage',
      icon: '💾',
      title: 'Storage',
      description: 'Save receipts and export data',
      required: false,
    },
  ];

  const handlePermissionToggle = async (key: string) => {
    if (key === 'sms') {
      if (!permissions.sms) {
        // Request actual SMS permission
        setLoading(true);
        try {
          console.log('📱 Requesting SMS permission...');
          const granted = await Promise.race([
            requestSMSPermission(),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 10000)) // 10 second timeout
          ]);
          
          console.log('📱 SMS permission result:', granted);
          setPermissions(prev => ({ ...prev, sms: granted }));
          
          if (granted) {
            Alert.alert(
              'SMS Permission Granted',
              'FinMate can now automatically detect transactions from your SMS messages.',
              [{ text: 'Great!', style: 'default' }]
            );
          } else {
            Alert.alert(
              'Permission Not Granted',
              'SMS permission was not granted. You can enable it later in Settings to use automatic transaction detection.',
              [{ text: 'OK', style: 'default' }]
            );
          }
        } catch (error) {
          console.error('❌ Error requesting SMS permission:', error);
          Alert.alert(
            'Permission Error',
            'Failed to request SMS permission. You can try again later in Settings.'
          );
        } finally {
          setLoading(false);
        }
      } else {
        // Toggle off
        setPermissions(prev => ({ ...prev, sms: false }));
      }
    } else {
      // Handle other permissions (placeholder for now)
      setPermissions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    }
  };

  const handleContinue = () => {
    if (!permissions.sms) {
      Alert.alert(
        'SMS Permission Recommended',
        'SMS access enables automatic transaction tracking. You can grant this permission later in Settings if you prefer.',
        [
          { text: 'Continue Without', onPress: () => navigation.replace('Login') },
          { text: 'Grant Access', onPress: () => handlePermissionToggle('sms') },
        ]
      );
      return;
    }

    // Navigate to login/signup
    navigation.replace('Login');
  };

  return (
    <ScreenWrapper scroll horizontalPadding={false}>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Grant Permissions</Text>
        <Text style={styles.subtitle}>
          To provide the best experience, FinMate needs access to:
        </Text>
      </View>

      {/* Permission Cards */}
      <View style={styles.content}>
        {permissionItems.map((item) => (
          <Card key={item.key} style={styles.permissionCard}>
            <TouchableOpacity
              style={styles.permissionContent}
              onPress={() => handlePermissionToggle(item.key)}
            >
              <View style={styles.permissionLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <View style={styles.permissionInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.permissionTitle}>{item.title}</Text>
                    {item.required && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.permissionDescription}>{item.description}</Text>
                </View>
              </View>
              <View style={[
                styles.toggle,
                permissions[item.key as keyof typeof permissions] && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleThumb,
                  permissions[item.key as keyof typeof permissions] && styles.toggleThumbActive
                ]} />
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title={loading ? "Requesting Permission..." : "Continue"}
          onPress={handleContinue}
          loading={loading}
          disabled={loading}
        />
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <Text style={styles.footer}>
        💡 You can change these permissions anytime in Settings
      </Text>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl * 2,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  permissionCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  permissionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  permissionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  requiredBadge: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  requiredText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    fontWeight: '600',
  },
  permissionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  skipButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  skipButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});
