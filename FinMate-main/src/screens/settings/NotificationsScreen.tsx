import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useThemedColors } from '../../hooks/useThemedColors';

export function NotificationsScreen({ navigation }: any) {
  const colors = useThemedColors();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Channels */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Channels</Text>
          
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔔</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Get instant alerts on your device
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📧</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Email Notifications</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Receive updates via email
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💬</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>SMS Notifications</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Get text messages for important alerts
              </Text>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        {/* Alert Types */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alert Types</Text>
          
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💳</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Transaction Alerts</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Notify when transactions are detected
              </Text>
            </View>
            <Switch
              value={transactionAlerts}
              onValueChange={setTransactionAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎯</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Budget Alerts</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Alert when approaching budget limits
              </Text>
            </View>
            <Switch
              value={budgetAlerts}
              onValueChange={setBudgetAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📊</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Weekly Report</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Get weekly spending summary
              </Text>
            </View>
            <Switch
              value={weeklyReport}
              onValueChange={setWeeklyReport}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        {/* Info Card */}
        <Card style={[styles.infoCard, { backgroundColor: colors.infoLight }]}>
          <Text style={[styles.infoTitle, { color: colors.info }]}>ℹ️ About Notifications</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Notifications help you stay on top of your finances{'\n'}
            • You can customize which alerts you receive{'\n'}
            • All notifications respect your device settings{'\n'}
            • SMS alerts may incur carrier charges
          </Text>
        </Card>
      </ScrollView>
    </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  infoCard: {
    marginBottom: Spacing.xl,
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
