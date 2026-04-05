import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { useFamily } from '../hooks/useFamily';

export function CreateFamilyScreen({ navigation }: any) {
  const { createFamily, isLoading } = useFamily();
  const [familyName, setFamilyName] = useState('');

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }

    try {
      const family = await createFamily(familyName.trim());
      console.log('✅ Family created:', family);
      
      // Auto-sync family data to Supabase (non-blocking)
      const { SyncService } = await import('../../../services/syncService');
      const { useStore } = await import('../../../store/useStore');
      const currentUserId = useStore.getState().currentUserId;
      
      if (currentUserId && !currentUserId.startsWith('guest_')) {
        SyncService.performSync(currentUserId).catch(err => 
          console.log('⚠️ Auto-sync failed:', err)
        );
      }
      
      // Navigate back immediately to show the family details
      navigation.goBack();
      
      // Show success message after navigation with invite code
      setTimeout(() => {
        Alert.alert(
          'Success! 🎉', 
          `Family created successfully!\n\nInvite Code: ${family.inviteCode}\n\nShare this code with family members to join.`,
          [{ text: 'OK' }]
        );
      }, 300);
    } catch (error) {
      console.error('❌ Error creating family:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create family';
      console.error('❌ Full error details:', JSON.stringify(error, null, 2));
      
      Alert.alert(
        'Error Creating Family', 
        errorMessage + '\n\nPlease check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScreenWrapper scroll={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="users" size={64} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Create Your Family</Text>
          <Text style={styles.description}>
            Start sharing expenses and budgets with your household members
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Family Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Smith Family, Home Budget"
              placeholderTextColor={Colors.textSecondary}
              value={familyName}
              onChangeText={setFamilyName}
              maxLength={50}
              autoFocus
            />
            <Text style={styles.hint}>
              Choose a name that all members will recognize
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Icon name="info" size={20} color={Colors.info} />
            <Text style={styles.infoText}>
              You will be the admin of this family and can invite members using a unique invite code.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Create Family"
            onPress={handleCreateFamily}
            variant="primary"
            disabled={isLoading || !familyName.trim()}
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    fontSize: Typography.fontSize.base,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
  actions: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
});
