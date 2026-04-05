import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing } from '../../constants/theme';
import { useCurrency, CURRENCIES } from '../../contexts/CurrencyContext';

export function CurrencyScreen({ navigation }: any) {
  const { selectedCurrency, selectCurrency, ratesLastUpdated, refreshRates, isLoading } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelectCurrency = async (code: string) => {
    try {
      await selectCurrency(code);
      Alert.alert(
        'Currency Updated',
        `All amounts will now be displayed in ${CURRENCIES.find(c => c.code === code)?.name}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update currency');
    }
  };

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    await refreshRates();
    setIsRefreshing(false);
    Alert.alert('Success', 'Exchange rates updated!');
  };

  const formatLastUpdated = () => {
    if (!ratesLastUpdated) return 'Never';
    const date = new Date(ratesLastUpdated);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Currency</Text>
        <TouchableOpacity onPress={handleRefreshRates} style={styles.refreshButton}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.refreshText}>🔄</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💱 Select Your Currency</Text>
          <Text style={styles.infoText}>
            All amounts are stored in INR and converted to your selected currency using live exchange rates.
          </Text>
          <Text style={[styles.infoText, { marginTop: 8, fontSize: 12 }]}>
            Last updated: {formatLastUpdated()}
          </Text>
        </Card>

        {/* Currency List */}
        <Card style={styles.card}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading currencies...</Text>
            </View>
          ) : (
            CURRENCIES.map((currency, index) => (
              <View key={currency.code}>
                <TouchableOpacity
                  style={styles.currencyRow}
                  onPress={() => handleSelectCurrency(currency.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    <View style={styles.currencyText}>
                      <Text style={styles.currencyName}>
                        {currency.name}
                      </Text>
                      <Text style={styles.currencyCode}>
                        {currency.code}
                      </Text>
                    </View>
                  </View>
                  {selectedCurrency.code === currency.code && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {index < CURRENCIES.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))
          )}
        </Card>

        {/* Note Card */}
        <Card style={styles.noteCard}>
          <Text style={styles.noteTitle}>ℹ️ How It Works</Text>
          <Text style={styles.noteText}>
            • All amounts are stored in INR (base currency)
            • Converted to your selected currency for display
            • Exchange rates update automatically
            • Tap 🔄 to refresh rates manually
            • Works offline with cached rates
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
  refreshButton: {
    padding: Spacing.sm,
  },
  refreshText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoCard: {
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    marginBottom: Spacing.md,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 32,
    width: 50,
    textAlign: 'center',
  },
  currencyText: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  noteCard: {
    marginBottom: Spacing.xl,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 20,
  },
});
