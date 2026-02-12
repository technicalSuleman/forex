import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { auth } from '../../firebaseConfig';
import { menuService } from '../../services';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
];

export default function CurrencyScreen() {
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    loadCurrencyPreference();
  }, []);

  const loadCurrencyPreference = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const settings = await menuService.getUserSettings(user.uid);
        setSelectedCurrency(settings.currency || 'USD');
      }
    } catch (error) {
      console.error('Error loading currency preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCurrency = async (currencyCode) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await menuService.updateCurrency(user.uid, currencyCode);
        setSelectedCurrency(currencyCode);
        Alert.alert('Success', `Currency changed to ${currencyCode}`);
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert('Error', 'Failed to update currency. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Default Currency</Text>
      <Text style={styles.subtitle}>Select your preferred currency for the app</Text>

      <View style={styles.currencyList}>
        {CURRENCIES.map((currency) => (
          <CurrencyItem
            key={currency.code}
            currency={currency}
            selected={selectedCurrency === currency.code}
            onSelect={() => handleSelectCurrency(currency.code)}
          />
        ))}
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color="#2962FF" />
        <Text style={styles.infoText}>
          Changing currency will update all prices and amounts displayed in the app. Exchange rates are updated in real-time.
        </Text>
      </View>
    </ScrollView>
  );
}

const CurrencyItem = ({ currency, selected, onSelect }) => (
  <TouchableOpacity
    style={[styles.currencyItem, selected && styles.currencyItemSelected]}
    onPress={onSelect}
  >
    <View style={styles.currencyLeft}>
      <Text style={styles.currencyFlag}>{currency.flag}</Text>
      <View style={styles.currencyInfo}>
        <Text style={styles.currencyCode}>{currency.code}</Text>
        <Text style={styles.currencyName}>{currency.name}</Text>
      </View>
    </View>
    <View style={styles.currencyRight}>
      <Text style={styles.currencySymbol}>{currency.symbol}</Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={24} color="#00E396" />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f0f0f',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 30,
  },
  currencyList: {
    marginBottom: 30,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181818',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252525',
  },
  currencyItemSelected: {
    borderColor: '#00E396',
    backgroundColor: 'rgba(0, 227, 150, 0.1)',
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyFlag: {
    fontSize: 32,
    marginRight: 15,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  currencyName: {
    color: '#888',
    fontSize: 12,
  },
  currencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencySymbol: {
    color: '#2962FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(41, 98, 255, 0.3)',
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    color: '#ccc',
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 12,
  },
});
