import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Colors, Typography, Spacing, Layout, BorderRadius } from '../../constants/theme';

export function LandingScreen({ navigation }: any) {
  return (
    <ScreenWrapper edges={['top', 'bottom']} horizontalPadding={false}>
      <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.appName}>FinMate</Text>
        <Text style={styles.tagline}>Your Personal Finance Manager</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureText}>Track Expenses</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>💳</Text>
          <Text style={styles.featureText}>Manage Budgets</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📈</Text>
          <Text style={styles.featureText}>Smart Insights</Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace('Permissions')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        By continuing, you agree to our Terms & Privacy Policy
      </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingVertical: Layout.sectionSpacing,
  },
  hero: {
    alignItems: 'center',
    marginTop: Spacing.xl * 2,
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  footer: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
