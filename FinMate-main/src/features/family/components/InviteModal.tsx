import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, Share as RNShare } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { InviteService } from '../services/inviteService';

interface InviteModalProps {
  visible: boolean;
  inviteCode: string;
  familyName: string;
  onClose: () => void;
}

export function InviteModal({ visible, inviteCode, familyName, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const formattedCode = InviteService.formatInviteCode(inviteCode);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      const message = `Join my family "${familyName}" on FinMate!\n\nInvite Code: ${formattedCode}\n\nDownload FinMate and enter this code to join.`;
      
      await RNShare.share({
        message,
        title: `Join ${familyName} on FinMate`,
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Invite Members</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="user-plus" size={48} color={Colors.primary} />
            </View>

            <Text style={styles.description}>
              Share this invite code with family members to let them join "{familyName}"
            </Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Invite Code</Text>
              <View style={styles.codeBox}>
                <Text style={styles.code}>{formattedCode}</Text>
                <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                  <Icon name={copied ? 'check' : 'copy'} size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              {copied && <Text style={styles.copiedText}>Copied to clipboard!</Text>}
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to join:</Text>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>Download FinMate app</Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>Go to Family tab</Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>Tap "Join Family" and enter code</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Share Invite"
              onPress={handleShare}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  codeContainer: {
    marginBottom: Spacing.lg,
  },
  codeLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  code: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 2,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  instructionsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  stepNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  instructionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    flex: 1,
  },
  actions: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
