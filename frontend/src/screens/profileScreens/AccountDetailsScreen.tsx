import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

type KYCStatus = 'not_started' | 'pending' | 'approved' | 'rejected';
interface KYCStatusData {
  status?: KYCStatus;
  submittedAt?: string;
  approvedAt?: string;
}
interface AccountDetailsScreenProps {
  userEmail: string;
  userId: string;
  userName: string;
  createdAt?: string;
  kycVerified?: boolean;
  kycStatus?: KYCStatusData | null;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  onResendVerificationEmail?: () => Promise<void>;
  onOpenSecurity?: () => void;
}

const VERIFICATION_STEPS = [
  { id: 1, label: 'Account Created', key: 'account' },
  { id: 2, label: 'KYC Documents Submitted', key: 'submitted' },
  { id: 3, label: 'Admin Review', key: 'review' },
  { id: 4, label: 'Verified', key: 'verified' },
] as const;

function getVerificationProgress(kycStatus?: KYCStatusData | null): { currentStep: number; percent: number } {
  const status = kycStatus?.status || 'not_started';
  switch (status) {
    case 'approved': return { currentStep: 4, percent: 100 };
    case 'pending': return { currentStep: 3, percent: 75 };
    case 'rejected': return { currentStep: 2, percent: 50 };
    default: return { currentStep: 1, percent: 25 };
  }
}

export default function AccountDetailsScreen({
  userEmail,
  userId,
  userName,
  createdAt,
  kycVerified = false,
  kycStatus,
  twoFactorEnabled = false,
  emailVerified = true,
  onResendVerificationEmail,
  onOpenSecurity,
}: AccountDetailsScreenProps) {
  const [resendLoading, setResendLoading] = useState(false);
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const { currentStep, percent } = getVerificationProgress(kycStatus);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', `${label} copied to clipboard`);
    } catch {
      Alert.alert('Copied', `${label} copied`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Account Details</Text>

      {/* Account Status Card - Only "Verified" when KYC complete */}
      <View style={[styles.statusCard, kycVerified ? styles.statusVerified : styles.statusPending]}>
        <LinearGradient
          colors={
            kycVerified
              ? ['rgba(0, 227, 150, 0.15)', 'rgba(0, 227, 150, 0.05)']
              : ['rgba(255, 165, 0, 0.15)', 'rgba(255, 165, 0, 0.05)']
          }
          style={styles.statusGradient}
        >
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons
              name={kycVerified ? 'check-decagram' : 'clock-outline'}
              size={24}
              color={kycVerified ? '#00E396' : '#FFA726'}
            />
            <Text style={[styles.statusText, { color: kycVerified ? '#00E396' : '#FFA726' }]}>
              {kycVerified ? 'Account Verified' : 'Verification Pending'}
            </Text>
          </View>
          <Text style={styles.statusSubtext}>
            {kycVerified
              ? 'Your account is fully verified and secure (KYC complete)'
              : 'Complete KYC verification from Menu to get verified status'}
          </Text>

          {/* Verification Progress Bar */}
          {!kycVerified && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.progressText}>{percent}% Complete</Text>
              <View style={styles.stepsContainer}>
                {VERIFICATION_STEPS.map((step) => (
                  <View key={step.id} style={styles.stepRow}>
                    <View style={[
                      styles.stepIcon,
                      currentStep >= step.id && styles.stepIconDone,
                      currentStep === step.id && !kycVerified && styles.stepIconCurrent,
                    ]}>
                      <MaterialCommunityIcons
                        name={currentStep > step.id ? 'check' : 'circle-outline'}
                        size={16}
                        color={currentStep >= step.id ? '#00E396' : '#666'}
                      />
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      currentStep >= step.id && styles.stepLabelDone,
                      currentStep === step.id && styles.stepLabelCurrent,
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Information Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <InfoCard
          icon="account"
          label="Full Name"
          value={userName || 'N/A'}
          onCopy={() => copyToClipboard(userName, 'Name')}
        />

        <InfoCard
          icon="email"
          label="Email Address"
          value={userEmail || 'N/A'}
          onCopy={() => copyToClipboard(userEmail, 'Email')}
          isEmail
        />
        {!emailVerified && onResendVerificationEmail && (
          <View style={styles.emailVerifyRow}>
            <Ionicons name="warning-outline" size={18} color="#FFA726" />
            <Text style={styles.emailVerifyText}>Email not verified</Text>
            <TouchableOpacity
              style={styles.resendVerifyBtn}
              onPress={async () => {
                setResendLoading(true);
                try {
                  await onResendVerificationEmail();
                  Toast.show({ type: 'success', text1: 'Email sent', text2: 'Check your inbox and spam.' });
                } catch (e) {
                  Toast.show({ type: 'error', text1: 'Could not send', text2: 'Try again later.' });
                } finally {
                  setResendLoading(false);
                }
              }}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color="#2962FF" />
              ) : (
                <Text style={styles.resendVerifyBtnText}>Resend verification email</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <InfoCard
          icon="identifier"
          label="User ID"
          value={userId || 'N/A'}
          onCopy={() => copyToClipboard(userId, 'User ID')}
          isCode
        />

        <InfoCard
          icon="calendar"
          label="Member Since"
          value={formatDate(createdAt)}
          showCopy={false}
        />
      </View>

      {/* Security Info - 2FA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <View style={styles.securityCard}>
          <View style={styles.securityItem}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={twoFactorEnabled ? '#00E396' : '#666'}
            />
            <Text style={styles.securityText}>Two-Factor Authentication</Text>
            <Text style={[styles.securityStatus, twoFactorEnabled && styles.securityStatusOn]}>
              {twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.enableBtn, twoFactorEnabled && styles.enableBtnDisabled]}
            onPress={onOpenSecurity}
          >
            <Text style={styles.enableBtnText}>
              {twoFactorEnabled ? 'Manage' : 'Enable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
  onCopy?: () => void;
  showCopy?: boolean;
  isEmail?: boolean;
  isCode?: boolean;
}

const InfoCard = ({
  icon,
  label,
  value,
  onCopy,
  showCopy = true,
  isCode = false,
}: InfoCardProps) => (
  <View style={styles.infoCard}>
    <View style={styles.infoLeft}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as never} size={20} color="#2962FF" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, isCode && styles.codeValue]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
    {showCopy && onCopy && (
      <TouchableOpacity onPress={onCopy} style={styles.copyBtn}>
        <Ionicons name="copy-outline" size={18} color="#666" />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  statusCard: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  statusVerified: {
    borderColor: 'rgba(0, 227, 150, 0.3)',
  },
  statusPending: {
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  statusGradient: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusSubtext: {
    color: '#888',
    fontSize: 12,
    marginLeft: 34,
  },
  progressSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2962FF',
    borderRadius: 3,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  stepsContainer: {
    marginTop: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    width: 24,
    alignItems: 'center',
  },
  stepIconDone: {},
  stepIconCurrent: {},
  stepLabel: {
    color: '#666',
    fontSize: 13,
  },
  stepLabelDone: {
    color: '#888',
  },
  stepLabelCurrent: {
    color: '#fff',
    fontWeight: '600',
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
  emailVerifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 167, 38, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 167, 38, 0.25)',
  },
  emailVerifyText: {
    color: '#FFA726',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  resendVerifyBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(41, 98, 255, 0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  resendVerifyBtnText: {
    color: '#2962FF',
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
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
  infoLeft: {
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
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#888',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  codeValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
  },
  copyBtn: {
    padding: 8,
  },
  securityCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#252525',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  securityStatus: {
    color: '#888',
    fontSize: 12,
  },
  securityStatusOn: {
    color: '#00E396',
    fontWeight: '600',
  },
  enableBtn: {
    backgroundColor: '#2962FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  enableBtnDisabled: {
    backgroundColor: '#333',
  },
  enableBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
