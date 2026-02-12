import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { auth } from '../../firebaseConfig';
import { menuService } from '../../services';

export default function NotificationSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    push: true,
    email: true,
    sms: false,
    tradeAlerts: true,
    priceAlerts: true,
    newsAlerts: true,
    marketAnalysis: true,
    systemUpdates: true,
  });

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const prefs = await menuService.getNotificationPreferences(user.uid);
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key, value) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      
      const user = auth.currentUser;
      if (user) {
        await menuService.updateNotificationPreferences(user.uid, newPreferences);
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
      // Revert on error
      setPreferences(preferences);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Notification Settings</Text>
      <Text style={styles.subtitle}>Manage your notification preferences</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Channels</Text>
        
        <NotificationItem
          icon="bell"
          label="Push Notifications"
          description="Receive notifications on your device"
          value={preferences.push}
          onValueChange={(value) => handleToggle('push', value)}
        />

        <NotificationItem
          icon="email"
          label="Email Notifications"
          description="Receive notifications via email"
          value={preferences.email}
          onValueChange={(value) => handleToggle('email', value)}
        />

        <NotificationItem
          icon="message"
          label="SMS Notifications"
          description="Receive notifications via SMS"
          value={preferences.sms}
          onValueChange={(value) => handleToggle('sms', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trading Alerts</Text>
        
        <NotificationItem
          icon="finance"
          label="Trade Alerts"
          description="Get notified about your trades"
          value={preferences.tradeAlerts}
          onValueChange={(value) => handleToggle('tradeAlerts', value)}
        />

        <NotificationItem
          icon="chart-line"
          label="Price Alerts"
          description="Receive price movement notifications"
          value={preferences.priceAlerts}
          onValueChange={(value) => handleToggle('priceAlerts', value)}
        />

        <NotificationItem
          icon="newspaper"
          label="News Alerts"
          description="Stay updated with market news"
          value={preferences.newsAlerts}
          onValueChange={(value) => handleToggle('newsAlerts', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Updates</Text>
        
        <NotificationItem
          icon="chart-bar"
          label="Market Analysis"
          description="Receive AI-powered market analysis"
          value={preferences.marketAnalysis}
          onValueChange={(value) => handleToggle('marketAnalysis', value)}
        />

        <NotificationItem
          icon="update"
          label="System Updates"
          description="Get notified about app updates"
          value={preferences.systemUpdates}
          onValueChange={(value) => handleToggle('systemUpdates', value)}
        />
      </View>
    </ScrollView>
  );
}

const NotificationItem = ({ icon, label, description, value, onValueChange }) => (
  <View style={styles.notificationItem}>
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={20} color="#2962FF" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
    </View>
    <Switch
      trackColor={{ false: "#252525", true: "rgba(41, 98, 255, 0.5)" }}
      thumbColor={value ? "#2962FF" : "#888"}
      ios_backgroundColor="#252525"
      onValueChange={onValueChange}
      value={value}
    />
  </View>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  notificationItem: {
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#888',
    fontSize: 12,
  },
});
