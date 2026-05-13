import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { useFamily } from '../hooks/useFamily';
import { InviteService } from '../services/inviteService';

export function JoinFamilyScreen({ navigation }: any) {
  const { joinFamily, isLoading } = useFamily();
  const [inviteCode, setInviteCode] = useState('');

  const handleJoinFamily = async () => {
    const cleanCode = InviteService.unformatInviteCode(inviteCode);
    
    if (cleanCode.length !== 8) {
      Alert.alert('Error', 'Please enter a valid 8-character invite code');
      return;
    }

    try {
      await joinFamily(cleanCode);
      Alert.alert('Success', 'You have joined the family!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to join family');
    }
  };

  const formatInviteCodeInput = (text: string) => {
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (cleaned.length <= 4) {
      setInviteCode(cleaned);
    } else {
      setInviteCode(`${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`);
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
            <Icon name="user-plus" size={64} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Join a Family</Text>
          <Text style={styles.description}>
            Enter the invite code shared by a family member to join their family group
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Invite Code</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX-XXXX"
              placeholderTextColor={Colors.textSecondary}
              value={inviteCode}
              onChangeText={formatInviteCodeInput}
              maxLength={9}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
            />
            <Text style={styles.hint}>
              Enter the 8-character code provided by the family admin
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Icon name="info" size={20} color={Colors.info} />
            <Text style={styles.infoText}>
              Once you join, you'll be able to share transactions and view family budgets and analytics.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Join Family"
            onPress={handleJoinFamily}
            variant="primary"
            disabled={isLoading || inviteCode.replace('-', '').length !== 8}
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
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    letterSpacing: 4,
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
