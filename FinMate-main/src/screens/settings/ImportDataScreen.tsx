import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { TransactionDB } from '../../services/database';
import { generateId } from '../../utils/helpers';

export function ImportDataScreen({ navigation }: any) {
  const { addTransaction, setTransactions, currentUserId } = useStore();
  const [importing, setImporting] = useState(false);
  const [csvData, setCsvData] = useState('');

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }

    const transactions = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles quoted fields)
      const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
      const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());

      if (cleanValues.length >= 6) {
        transactions.push({
          id: generateId(),
          date: cleanValues[0] || new Date().toISOString().split('T')[0],
          type: (cleanValues[1] === 'received' ? 'received' : 'sent') as 'sent' | 'received',
          amount: parseFloat(cleanValues[2]) || 0,
          merchant: cleanValues[3] || 'Unknown',
          category: cleanValues[4] || 'Others',
          status: (cleanValues[5] || 'completed') as 'completed' | 'pending' | 'failed',
          notes: cleanValues[6] || '',
          time: '12:00 PM',
          upiId: '',
        });
      }
    }

    return transactions;
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      Alert.alert('Error', 'Please paste CSV data first');
      return;
    }

    setImporting(true);

    try {
      const transactions = parseCSV(csvData);
      
      if (transactions.length === 0) {
        Alert.alert('Error', 'No valid transactions found in CSV');
        return;
      }

      // Import to database
      for (const transaction of transactions) {
        const newTransaction = { ...transaction, userId: currentUserId! };
        await TransactionDB.create(newTransaction);
        addTransaction(newTransaction);
      }

      Alert.alert(
        'Success!',
        `${transactions.length} transactions imported successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Import Failed', error.message || 'Invalid CSV format');
    } finally {
      setImporting(false);
    }
  };

  const sampleCSV = `Date,Type,Amount,Merchant,Category,Status,Notes
2024-11-01,sent,500,Starbucks,Food,completed,Coffee
2024-11-02,received,50000,Company,Salary,completed,Monthly salary
2024-11-03,sent,1200,Uber,Travel,completed,Cab fare`;

  return (
    <ScreenWrapper scroll horizontalPadding={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Transactions</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions Card */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>📥 How to Import</Text>
          <Text style={styles.instructionText}>
            1. Prepare your CSV file with the following columns:{'\n'}
            {'\n'}
            <Text style={styles.codeText}>Date, Type, Amount, Merchant, Category, Status, Notes</Text>
            {'\n\n'}
            2. Copy the CSV content{'\n'}
            3. Paste it in the text area below{'\n'}
            4. Tap "Import Transactions"
          </Text>
        </Card>

        {/* Sample CSV */}
        <Card style={styles.sampleCard}>
          <Text style={styles.sampleTitle}>📄 Sample CSV Format</Text>
          <View style={styles.sampleBox}>
            <Text style={styles.sampleText}>{sampleCSV}</Text>
          </View>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => {
              setCsvData(sampleCSV);
              Alert.alert('Copied!', 'Sample CSV loaded. You can now import it.');
            }}
          >
            <Text style={styles.copyButtonText}>Use Sample Data</Text>
          </TouchableOpacity>
        </Card>

        {/* CSV Input */}
        <Card style={styles.inputCard}>
          <Text style={styles.sectionTitle}>Paste CSV Data</Text>
          <TextInput
            style={styles.textInput}
            value={csvData}
            onChangeText={setCsvData}
            placeholder="Paste your CSV data here..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </Card>

        {/* Import Button */}
        <Button
          title={importing ? 'Importing...' : 'Import Transactions'}
          onPress={handleImport}
          disabled={importing || !csvData.trim()}
        />

        {/* Warning */}
        <Card style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            • Imported transactions will be added to existing data{'\n'}
            • Duplicate transactions may be created if you import the same data twice{'\n'}
            • Make sure your CSV format matches the sample above
          </Text>
        </Card>
    </ScreenWrapper>
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
  instructionsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  instructionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 22,
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: Colors.background,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    fontSize: Typography.fontSize.xs,
  },
  sampleCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sampleTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sampleBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  sampleText: {
    fontFamily: 'monospace',
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    lineHeight: 18,
  },
  copyButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  copyButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  inputCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    minHeight: 150,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  warningCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.warning + '10',
    marginTop: Spacing.lg,
  },
  warningTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: Spacing.sm,
  },
  warningText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
