import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedColors } from '../../hooks/useThemedColors';

export function DarkModeScreen({ navigation }: any) {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = useThemedColors();

  return (
    <ScreenWrapper horizontalPadding={false} backgroundColor={colors.background}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Appearance</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Theme Toggle Card */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {isDark ? 'Dark theme is enabled' : 'Light theme is enabled'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        {/* Preview Card */}
        <Card style={[styles.previewCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
          <View style={[styles.previewBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.previewText, { color: colors.text }]}>
              This is how your app looks in {isDark ? 'dark' : 'light'} mode
            </Text>
            <View style={styles.previewElements}>
              <View style={[styles.previewElement, { backgroundColor: colors.primary }]}>
                <Text style={[styles.previewElementText, { color: colors.textInverse }]}>Primary</Text>
              </View>
              <View style={[styles.previewElement, { backgroundColor: colors.success }]}>
                <Text style={[styles.previewElementText, { color: colors.textInverse }]}>Success</Text>
              </View>
              <View style={[styles.previewElement, { backgroundColor: colors.error }]}>
                <Text style={[styles.previewElementText, { color: colors.textInverse }]}>Error</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Info Card */}
        <Card style={[styles.infoCard, { backgroundColor: colors.infoLight }]}>
          <Text style={[styles.infoTitle, { color: colors.info }]}>ℹ️ About Dark Mode</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Dark mode reduces eye strain in low light{'\n'}
            • Saves battery on OLED screens{'\n'}
            • Your preference is saved automatically{'\n'}
            • All screens adapt to your chosen theme
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  previewCard: {
    marginBottom: Spacing.md,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  previewBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  previewText: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  previewElements: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  previewElement: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  previewElementText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 20,
  },
});
