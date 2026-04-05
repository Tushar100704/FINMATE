import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, ScrollView } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

export function ExportDataScreen({ navigation }: any) {
  const { transactions, budgets } = useStore();
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    
    try {
      // Create CSV header
      let csv = 'Date,Type,Amount,Merchant,Category,Status,Notes\n';
      
      // Add transaction rows
      transactions.forEach(t => {
        csv += `${t.date},${t.type},${t.amount},${t.merchant},${t.category},${t.status},"${t.notes || ''}"\n`;
      });
      
      // For now, just show the data (file system access requires additional setup)
      Alert.alert(
        'Export Ready',
        `${transactions.length} transactions ready to export.\n\nCSV Preview:\n${csv.substring(0, 200)}...`,
        [
          { text: 'OK' },
          {
            text: 'Share',
            onPress: () => {
              Share.share({
                message: csv,
                title: 'FinMate Transactions Export',
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    setExporting(true);
    
    try {
      const data = {
        exportDate: new Date().toISOString(),
        transactions,
        budgets,
        summary: {
          totalTransactions: transactions.length,
          totalBudgets: budgets.length,
          totalSpent: transactions
            .filter(t => t.type === 'sent')
            .reduce((sum, t) => sum + t.amount, 0),
          totalReceived: transactions
            .filter(t => t.type === 'received')
            .reduce((sum, t) => sum + t.amount, 0),
        },
      };
      
      const json = JSON.stringify(data, null, 2);
      
      Alert.alert(
        'Export Ready',
        `Complete data export ready.\n\nSize: ${(json.length / 1024).toFixed(2)} KB`,
        [
          { text: 'OK' },
          {
            text: 'Share',
            onPress: () => {
              Share.share({
                message: json,
                title: 'FinMate Complete Export',
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const totalSpent = transactions
    .filter(t => t.type === 'sent')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalReceived = transactions
    .filter(t => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Data Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Transactions</Text>
            <Text style={styles.summaryValue}>{transactions.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Budgets</Text>
            <Text style={styles.summaryValue}>{budgets.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={[styles.summaryValue, { color: Colors.error }]}>
              {formatCurrency(totalSpent)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Received</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {formatCurrency(totalReceived)}
            </Text>
          </View>
        </Card>

        {/* Export Options */}
        <Card style={styles.optionsCard}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          
          <TouchableOpacity
            style={styles.optionButton}
            onPress={exportToCSV}
            disabled={exporting}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>📄</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>CSV (Spreadsheet)</Text>
              <Text style={styles.optionDescription}>
                Export transactions as CSV for Excel, Google Sheets
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={exportToJSON}
            disabled={exporting}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>📦</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>JSON (Complete Backup)</Text>
              <Text style={styles.optionDescription}>
                Export all data including budgets and settings
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Export Tips</Text>
          <Text style={styles.infoText}>
            • CSV format is best for analyzing data in spreadsheets{'\n'}
            • JSON format includes all your data for complete backup{'\n'}
            • You can share exported data via email, messaging apps{'\n'}
            • Keep backups safe and secure
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.text,
  },
  optionsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  arrow: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textSecondary,
  },
  infoCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.info + '10',
  },
  infoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.info,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
