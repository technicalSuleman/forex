import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { menuService } from '../../services';
import { auth } from '../../firebaseConfig';

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/75.jpg';

interface SecurityScreenProps {
  userId: string;
  onClose?: () => void;
}

export default function SecurityScreen({ userId, onClose }: SecurityScreenProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [auditLog, setAuditLog] = useState<{ id: string; action: string; timestamp: string }[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [show2FAInfo, setShow2FAInfo] = useState(false);

  useEffect(() => {
    loadSettings();
    checkBiometric();
    loadAuditLog();
  }, [userId]);

  const loadAuditLog = async () => {
    try {
      setAuditLoading(true);
      const log = await menuService.getAuditLog(userId, 20);
      setAuditLog(log);
    } catch {
      setAuditLog([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await menuService.getUserSettings(userId);
      setTwoFactorEnabled(settings.twoFactor || false);
      setBiometricEnabled(settings.biometric || false);
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch {
      setBiometricAvailable(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      await menuService.toggleTwoFactor(userId, enabled);
      await menuService.addAuditLog(userId, enabled ? '2FA_ENABLED' : '2FA_DISABLED');
      setTwoFactorEnabled(enabled);
      loadAuditLog();
      Toast.show({
        type: 'success',
        text1: enabled ? '2FA enabled' : '2FA disabled',
        text2: enabled ? 'Two-Factor Authentication is now on.' : 'Two-Factor Authentication is now off.',
      });
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update 2FA setting.' });
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (enabled && !biometricAvailable) {
      Toast.show({
        type: 'error',
        text1: 'Not Available',
        text2: 'Biometric authentication is not available on this device.',
      });
      return;
    }
    if (enabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify identity to enable biometric login',
          fallbackLabel: 'Use Password',
        });
        if (!result.success) {
          Toast.show({ type: 'error', text1: 'Authentication Failed', text2: 'Could not enable biometric login.' });
          return;
        }
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Biometric verification failed.' });
        return;
      }
    }
    try {
      await menuService.toggleBiometric(userId, enabled);
      await menuService.addAuditLog(userId, enabled ? 'BIOMETRIC_ENABLED' : 'BIOMETRIC_DISABLED');
      setBiometricEnabled(enabled);
      loadAuditLog();
      Toast.show({
        type: 'success',
        text1: enabled ? 'Biometric enabled' : 'Biometric disabled',
        text2: enabled ? 'Biometric login is now on.' : 'Biometric login is now off.',
      });
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update biometric setting.' });
    }
  };

  const getAuditActionLabel = (action: string) => {
    switch (action) {
      case 'PASSWORD_CHANGED': return 'Password changed';
      case '2FA_ENABLED': return 'Two-factor enabled';
      case '2FA_DISABLED': return 'Two-factor disabled';
      case 'BIOMETRIC_ENABLED': return 'Biometric login enabled';
      case 'BIOMETRIC_DISABLED': return 'Biometric login disabled';
      case 'LOGIN': return 'Login';
      case 'LOGOUT': return 'Logout';
      default: return action;
    }
  };

  const formatAuditTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please fill all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Mismatch', text2: 'New password and confirm password do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Password must be at least 8 characters.' });
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'You must be logged in to change password.' });
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      await menuService.addAuditLog(userId, 'PASSWORD_CHANGED');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadAuditLog();
      Toast.show({ type: 'success', text1: 'Password changed', text2: 'Your password has been updated successfully.' });
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        Toast.show({ type: 'error', text1: 'Wrong Password', text2: 'Current password is incorrect.' });
      } else if (error.code === 'auth/weak-password') {
        Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Please choose a stronger password (min 8 characters).' });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to change password.' });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2962FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Security Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>

        <SecurityItem
          icon="lock-reset"
          label="Change Password"
          description="Update your account password"
          onPress={() => setShowPasswordModal(true)}
        />

        <SecurityItem
          icon="shield-check"
          label="Two-Factor Authentication"
          description="Add an extra layer of security"
          hasToggle
          toggleValue={twoFactorEnabled}
          onToggle={handleToggle2FA}
        />

        <SecurityItem
          icon="fingerprint"
          label="Biometric Login"
          description={Platform.OS === 'ios' ? 'Use Face ID or Touch ID' : 'Use fingerprint'}
          hasToggle
          toggleValue={biometricEnabled}
          onToggle={handleToggleBiometric}
          disabled={!biometricAvailable}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audit Log</Text>
        <View style={styles.auditCard}>
          {auditLoading ? (
            <ActivityIndicator size="small" color="#2962FF" style={{ marginVertical: 20 }} />
          ) : auditLog.length === 0 ? (
            <Text style={styles.auditEmpty}>No security events yet</Text>
          ) : (
            auditLog.map((entry, index) => (
              <View key={entry.id} style={[styles.auditRow, index === auditLog.length - 1 && styles.auditRowLast]}>
                <MaterialCommunityIcons
                  name={
                    entry.action.startsWith('PASSWORD') ? 'lock-reset' :
                    entry.action.includes('2FA') ? 'shield-check' :
                    entry.action.includes('BIOMETRIC') ? 'fingerprint' :
                    entry.action === 'LOGIN' ? 'login' :
                    entry.action === 'LOGOUT' ? 'logout' : 'shield-key'
                  }
                  size={18}
                  color="#666"
                />
                <Text style={styles.auditAction}>{getAuditActionLabel(entry.action)}</Text>
                <Text style={styles.auditTime}>{formatAuditTime(entry.timestamp)}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.infoHeader}
          onPress={() => setShow2FAInfo(!show2FAInfo)}
        >
          <MaterialCommunityIcons name="information-outline" size={20} color="#2962FF" />
          <Text style={styles.infoHeaderText}>How to implement real Two-Factor Authentication</Text>
          <Ionicons name={show2FAInfo ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
        </TouchableOpacity>
        {show2FAInfo && (
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              The toggle above saves a preference only. To enforce 2FA at login:
            </Text>
            <Text style={styles.infoStep}>1. Enroll: Use multiFactor(auth.currentUser).getSession(), then multiFactorUser.enroll() with PhoneAuthProvider (SMS) or TotpMultiFactorGenerator (authenticator app).</Text>
            <Text style={styles.infoStep}>2. At login: Catch auth/multi-factor-auth-required error, use getMultiFactorResolver(auth, error), show OTP input, call resolver.resolveSignIn(multiFactorAssertion).</Text>
            <Text style={styles.infoStep}>3. SMS: Requires Firebase Phone Auth + reCAPTCHA. TOTP: Use a package like otplib to generate codes from the shared secret.</Text>
            <Text style={styles.infoStep}>4. Enable MFA in Firebase Console: Authentication → Sign-in method → Multi-factor authentication.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>

        <SecurityItem
          icon="eye-off"
          label="Hide Balance"
          description="Hide balance from screenshots"
          hasToggle
          toggleValue={false}
          onToggle={() => {}}
        />
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Current Password</Text>
              <TextInput
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.modalLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min 8 characters"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.modalLabel}>Confirm New Password</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputLast]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={changingPassword}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirmBtn, changingPassword && styles.modalBtnDisabled]}
                  onPress={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Change Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

interface SecurityItemProps {
  icon: string;
  label: string;
  description: string;
  onPress?: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
}

const SecurityItem = ({
  icon,
  label,
  description,
  onPress,
  hasToggle = false,
  toggleValue = false,
  onToggle,
  disabled = false,
}: SecurityItemProps) => (
  <TouchableOpacity
    style={[styles.securityItem, disabled && styles.securityItemDisabled]}
    onPress={onPress}
    disabled={hasToggle || disabled}
    activeOpacity={hasToggle ? 1 : 0.7}
  >
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as never} size={20} color="#2962FF" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
    </View>
    {hasToggle && onToggle ? (
      <Switch
        trackColor={{ false: '#252525', true: 'rgba(41, 98, 255, 0.5)' }}
        thumbColor={toggleValue ? '#2962FF' : '#888'}
        ios_backgroundColor="#252525"
        onValueChange={onToggle}
        value={toggleValue}
        disabled={disabled}
      />
    ) : (
      <Ionicons name="chevron-forward" size={18} color="#444" />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  securityItem: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  securityItemDisabled: {
    opacity: 0.6,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
    minHeight: Dimensions.get('window').height - 80,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalInputLast: {
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    marginRight: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    marginLeft: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2962FF',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalBtnDisabled: {
    opacity: 0.6,
  },
  auditCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  auditEmpty: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  auditRowLast: {
    borderBottomWidth: 0,
  },
  auditAction: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
  },
  auditTime: {
    color: '#666',
    fontSize: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },
  infoHeaderText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoContent: {
    backgroundColor: '#181818',
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },
  infoText: {
    color: '#888',
    fontSize: 13,
    marginBottom: 12,
  },
  infoStep: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
});
