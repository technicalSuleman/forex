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
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { auth } from '../../firebaseConfig';
import { menuService } from '../../services';

export default function BiometricScreen() {
  const [loading, setLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadSettings();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsAvailable(compatible && enrolled);

      if (compatible && enrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setBiometricType(types[0]);
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const settings = await menuService.getUserSettings(user.uid);
        setBiometricEnabled(settings.biometric || false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBiometric = async (enabled) => {
    if (enabled && isAvailable) {
      // Verify biometric before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        await saveBiometricSetting(enabled);
      } else {
        Alert.alert('Authentication Failed', 'Please try again');
      }
    } else if (!enabled) {
      await saveBiometricSetting(enabled);
    } else {
      Alert.alert(
        'Biometric Not Available',
        'Please set up biometric authentication in your device settings first'
      );
    }
  };

  const saveBiometricSetting = async (enabled) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await menuService.toggleBiometric(user.uid, enabled);
        setBiometricEnabled(enabled);
        Alert.alert('Success', `Biometric login ${enabled ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      console.error('Error saving biometric setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const getBiometricIcon = () => {
    if (Platform.OS === 'ios') {
      return biometricType === 2 ? 'face-recognition' : 'fingerprint';
    }
    return 'fingerprint';
  };

  const getBiometricName = () => {
    if (Platform.OS === 'ios') {
      return biometricType === 2 ? 'Face ID' : 'Touch ID';
    }
    return 'Fingerprint';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Biometric Login</Text>
      <Text style={styles.subtitle}>Secure your account with biometric authentication</Text>

      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={getBiometricIcon()} 
            size={64} 
            color={isAvailable ? '#2962FF' : '#666'} 
          />
        </View>

        <Text style={styles.cardTitle}>{getBiometricName()}</Text>
        
        {isAvailable ? (
          <>
            <Text style={styles.cardDescription}>
              Use {getBiometricName()} to quickly and securely access your account
            </Text>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Enable {getBiometricName()}</Text>
              <Switch
                trackColor={{ false: "#252525", true: "rgba(41, 98, 255, 0.5)" }}
                thumbColor={biometricEnabled ? "#2962FF" : "#888"}
                ios_backgroundColor="#252525"
                onValueChange={handleToggleBiometric}
                value={biometricEnabled}
              />
            </View>
          </>
        ) : (
          <View style={styles.unavailableContainer}>
            <Text style={styles.unavailableText}>Biometric authentication is not available on this device</Text>
            <Text style={styles.unavailableSubtext}>
              Please set up {getBiometricName()} in your device settings first
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How it works</Text>
        <InfoItem
          icon="shield-check"
          text="Your biometric data never leaves your device"
        />
        <InfoItem
          icon="lock"
          text="Encrypted and stored securely"
        />
        <InfoItem
          icon="speed"
          text="Faster and more secure than passwords"
        />
      </View>
    </ScrollView>
  );
}

const InfoItem = ({ icon, text }) => (
  <View style={styles.infoItem}>
    <MaterialCommunityIcons name={icon} size={20} color="#2962FF" />
    <Text style={styles.infoText}>{text}</Text>
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
  card: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  unavailableContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  unavailableText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  unavailableSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252525',
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 15,
    flex: 1,
  },
});
