import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set, update } from 'firebase/database';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { menuService } from '../services';
import { auth, database } from '../firebaseConfig';

const bgImage = require('../../assets/images/bg.jpg');
const logoImage = require('../../assets/images/logo.png');

// Zod schemas
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export default function LoginScreen() { 
  const router = useRouter(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [lastLoggedInEmail, setLastLoggedInEmail] = useState('');
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmailError, setForgotEmailError] = useState('');
  useEffect(() => {
    checkBiometricAvailability();
    loadLastLoggedInUser();
  }, []);

  // Route protection: only redirect verified users to dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        router.replace('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const loadLastLoggedInUser = async () => {
    try {
      const email = await AsyncStorage.getItem('lastLoggedInEmail');
      const biometricOn = await AsyncStorage.getItem('biometricEnabled');
      if (email) setLastLoggedInEmail(email);
      if (biometricOn === 'true') setBiometricEnabled(true);
    } catch (error) {
      console.error('Error loading last user:', error);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) {
      Toast.show({ type: 'error', text1: 'Not Available', text2: 'Biometric authentication is not available on this device.' });
      return;
    }
    if (!lastLoggedInEmail) {
      Toast.show({ type: 'info', text1: 'No User Found', text2: 'Please login with email and password first to enable biometric login.' });
      return;
    }
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });
      if (result.success) {
        setEmail(lastLoggedInEmail);
        Toast.show({ type: 'success', text1: 'Authenticated', text2: 'Enter your password to complete login.' });
      } else {
        Toast.show({ type: 'error', text1: 'Authentication Failed', text2: 'Please try again or use password.' });
      }
    } catch (error) {
      console.error('Biometric error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred during biometric authentication.' });
    }
  };

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const firstError = result.error.flatten().fieldErrors;
      const message =
        firstError.email?.[0] || firstError.password?.[0] || 'Please check your input.';
      Toast.show({ type: 'error', text1: 'Validation Error', text2: message });
      return;
    }

    setLoading(true);

    try {
      // 3. Auth Logic
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Verify your email first',
          text2: 'Check your inbox for the verification link, then login again. You can resend from the link below the register form.',
        });
        return;
      }

      // Update last login in database and persist for biometric (non-blocking)
      if (user) {
        const updateDatabase = async () => {
          try {
            const userRef = ref(database, 'users/' + user.uid);
            await update(userRef, {
              lastLogin: new Date().toISOString(),
              email: user.email || email,
              uid: user.uid
            });
          } catch (dbError: unknown) {
            try {
              await set(ref(database, 'users/' + user.uid), {
                email: user.email || email,
                uid: user.uid,
                createdAt: new Date().toISOString(),
                accountType: 'free',
                emailVerified: true,
                lastLogin: new Date().toISOString(),
                profileComplete: false,
                notificationsEnabled: true
              });
            } catch {
              console.log('Database update failed, but login successful');
            }
          }
          try {
            await menuService.addAuditLog(user.uid, 'LOGIN');
            const settings = await menuService.getUserSettings(user.uid);
            await AsyncStorage.setItem('lastLoggedInEmail', email);
            await AsyncStorage.setItem('lastLoggedInUserId', user.uid);
            await AsyncStorage.setItem('biometricEnabled', settings?.biometric ? 'true' : 'false');
          } catch {
            await AsyncStorage.setItem('lastLoggedInEmail', email);
            await AsyncStorage.setItem('lastLoggedInUserId', user.uid);
            await AsyncStorage.setItem('biometricEnabled', 'false');
          }
        };
        updateDatabase();
      }

      setLoading(false);
      Toast.show({ type: 'success', text1: 'Login successful', text2: 'Redirecting to dashboard...' });
      setTimeout(() => router.replace('/dashboard'), 1500);
    } catch (err: unknown) {
      setLoading(false);
      const error = err as { code?: string; message?: string };
      let text1 = 'Login Failed';
      let text2 = 'An unknown error occurred.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        text2 = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        text2 = 'Wrong password. Use Forgot Password if needed.';
      } else if (error.code === 'auth/invalid-email') {
        text2 = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        text2 = 'Too many attempts. Try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        text2 = 'Check your internet connection and try again.';
      } else if (error?.message) {
        text2 = error.message;
      }
      Toast.show({ type: 'error', text1, text2 });
    }
  };

  const handleForgotPassword = () => {
    setForgotEmail(email);
    setForgotEmailError('');
    setForgotModalVisible(true);
  };

  const handleCloseForgotModal = () => {
    setForgotModalVisible(false);
    setForgotEmail('');
    setForgotEmailError('');
  };

  const handleSendResetEmail = async () => {
    setForgotEmailError('');
    const result = forgotPasswordSchema.safeParse({ email: forgotEmail.trim() });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors.email?.[0];
      setForgotEmailError(err || 'Invalid email');
      Toast.show({ type: 'error', text1: 'Validation Error', text2: err });
      return;
    }
    const validEmail = result.data.email;
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, validEmail);
      setForgotLoading(false);
      handleCloseForgotModal();
      Toast.show({
        type: 'success',
        text1: 'Email sent',
        text2: `Password reset link sent to ${validEmail}. Check your inbox.`,
      });
    } catch (err: unknown) {
      setForgotLoading(false);
      const error = err as { code?: string };
      let message = 'Failed to send reset email. Try again.';
      if (error?.code === 'auth/user-not-found') message = 'No account found with this email.';
      else if (error?.code === 'auth/invalid-email') message = 'Please enter a valid email.';
      else if (error?.code === 'auth/network-request-failed') message = 'Check your internet connection.';
      else if (error?.code === 'auth/too-many-requests') message = 'Too many attempts. Try again later.';
      Toast.show({ type: 'error', text1: 'Reset failed', text2: message });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground source={bgImage} style={styles.backgroundImage} resizeMode="cover">
        <LinearGradient colors={['rgba(0, 0, 0, 0.73)', 'rgba(0,0,0,0.8)', '#000']} style={styles.gradientOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <View style={styles.headerSection}>
                <View style={styles.logoGlow}><View style={styles.logoWrapper}><Image source={logoImage} style={styles.logo} resizeMode="cover" /></View></View>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.subText}>Login to start trading</Text>
              </View>

              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPass} onPress={handleForgotPassword}>
                    <Text style={styles.forgotPassText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shadowProp} onPress={handleLogin} disabled={loading}>
                  <LinearGradient colors={['#2962FF', '#0039CB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryButtonText}>LOGIN</Text>}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Biometric Login Button */}
                {biometricAvailable && biometricEnabled && (
                  <>
                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                      <Text style={styles.dividerText}>OR</Text>
                      <View style={styles.divider} />
                    </View>

                    <TouchableOpacity 
                      style={styles.biometricButton} 
                      onPress={handleBiometricLogin}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons 
                        name={Platform.OS === 'ios' ? 'face-recognition' : 'fingerprint'} 
                        size={24} 
                        color="#2962FF" 
                      />
                      <Text style={styles.biometricButtonText}>
                        Login with {Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                <View style={styles.footerSection}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.linkText}>Register</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Forgot Password Modal */}
          <Modal
            visible={forgotModalVisible}
            transparent
            animationType="fade"
            onRequestClose={handleCloseForgotModal}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalOverlay}
              onPress={handleCloseForgotModal}
            >
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.modalCard}>
                <Text style={styles.modalTitle}>Forgot Password?</Text>
                <Text style={styles.modalSubtitle}>Enter your email to receive a reset link</Text>
                <View style={[styles.inputContainer, forgotEmailError ? styles.inputError : null]}>
                  <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#666"
                    value={forgotEmail}
                    onChangeText={(t) => { setForgotEmail(t); setForgotEmailError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!forgotLoading}
                  />
                </View>
                {forgotEmailError ? <Text style={styles.modalErrorText}>{forgotEmailError}</Text> : null}
                <TouchableOpacity
                  style={styles.shadowProp}
                  onPress={handleSendResetEmail}
                  disabled={forgotLoading}
                >
                  <LinearGradient
                    colors={['#2962FF', '#0039CB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>SEND RESET LINK</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelButton} onPress={handleCloseForgotModal}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  gradientOverlay: { flex: 1, paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  headerSection: { alignItems: 'center', marginBottom: 30 },
  logoGlow: { marginBottom: 20, shadowColor: '#4ADE80', shadowOpacity: 0.6, shadowRadius: 25, elevation: 15 },
  logoWrapper: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',marginBottom: -20 },
  logo: { width: '100%', height: '100%' },
  welcomeText: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  subText: { color: '#888', fontSize: 14 },
  formSection: { width: '100%', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 16, paddingHorizontal: 15, height: 58, marginBottom: 18 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  eyeIcon: { padding: 5 },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPassText: { color: '#2962FF', fontSize: 14, fontWeight: '600' },
  shadowProp: { width: '100%', marginTop: 10 },
  primaryButton: { width: '100%', height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
  footerSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  footerText: { color: '#AAA', fontSize: 14 },
  linkText: { color: '#4ADE80', fontSize: 14, fontWeight: 'bold', marginLeft: 5, textDecorationLine: 'underline' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  dividerText: { color: '#666', fontSize: 12, marginHorizontal: 15, fontWeight: '600' },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(41, 98, 255, 0.3)',
    borderRadius: 16,
    paddingVertical: 15,
    marginBottom: 10,
  },
  biometricButtonText: { color: '#2962FF', fontSize: 15, fontWeight: '600', marginLeft: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  modalSubtitle: { color: '#9BA1A6', fontSize: 14, marginBottom: 20 },
  modalErrorText: { color: '#FF1744', fontSize: 12, marginTop: -10, marginBottom: 10 },
  inputError: { borderColor: '#FF1744' },
  modalCancelButton: { alignSelf: 'center', marginTop: 16, paddingVertical: 8, paddingHorizontal: 16 },
  modalCancelText: { color: '#9BA1A6', fontSize: 15, fontWeight: '600' },
});