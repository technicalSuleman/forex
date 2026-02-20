import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
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
import { auth, database } from '../firebaseConfig';

const bgImage = require('../../assets/images/bg.jpg');
const logoImage = require('../../assets/images/logo.png');

// Zod schema – same rules as before (min 8, uppercase, lowercase, number)
const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    const result = registerSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const message =
        flat.email?.[0] || flat.password?.[0] || flat.confirmPassword?.[0] || 'Please check your input.';
      Toast.show({ type: 'error', text1: 'Validation Error', text2: message });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let verificationSent = false;
      try {
        await sendEmailVerification(user);
        verificationSent = true;
      } catch (verifyErr: unknown) {
        const ve = verifyErr as { code?: string; message?: string };
        console.warn('Send verification email failed:', ve?.code, ve?.message);
        if (ve?.code === 'auth/too-many-requests') {
          Toast.show({
            type: 'info',
            text1: 'Verification email limit',
            text2: 'Try resending from Profile after login.',
          });
        }
      }

      try {
        await set(ref(database, 'users/' + user.uid), {
          email: user.email,
          uid: user.uid,
          createdAt: new Date().toISOString(),
          accountType: 'free',
          emailVerified: false,
          lastLogin: null,
          profileComplete: false,
          notificationsEnabled: true,
          settings: {
            biometric: false,
            notifications: true,
            currency: 'USD',
            language: 'English',
            theme: 'dark',
          },
        });
      } catch (dbError: unknown) {
        console.error('Database save error:', dbError);
      }

      setLoading(false);
      if (verificationSent) {
        Toast.show({
          type: 'success',
          text1: 'Account created',
          text2: 'Verification email sent. Check your inbox, then log in.',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Account created',
          text2: 'You can resend the verification email from Profile after login.',
        });
      }
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err: unknown) {
      setLoading(false);
      const error = err as { code?: string; message?: string };
      let text1 = 'Registration Failed';
      let text2 = 'An unknown error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        text2 = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        text2 = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        text2 = 'Password is too weak. Use 8+ characters, 1 uppercase, 1 number.';
      } else if (error.code === 'auth/network-request-failed') {
        text2 = 'Check your internet connection and try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        text2 = 'Registration is not allowed at the moment.';
      } else if (error?.message) {
        text2 = error.message;
      }
      Toast.show({ type: 'error', text1, text2 });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground source={bgImage} style={styles.backgroundImage} resizeMode="cover">
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.73)', 'rgba(0,0,0,0.8)', '#000']}
          style={styles.gradientOverlay}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerSection}>
                <View style={styles.logoGlow}>
                  <View style={styles.logoWrapper}>
                    <Image source={logoImage} style={styles.logo} resizeMode="cover" />
                  </View>
                </View>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.subText}>Sign up to start trading</Text>
              </View>

              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password (8+ chars, 1 upper, 1 number)"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.shadowProp} onPress={handleRegister} disabled={loading}>
                  <LinearGradient
                    colors={['#2962FF', '#0039CB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>REGISTER</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footerSection}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.replace('/login')}>
                    <Text style={styles.linkText}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

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
  logoWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: -20,
  },
  logo: { width: '100%', height: '100%' },
  welcomeText: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  subText: { color: '#888', fontSize: 14 },
  formSection: { width: '100%', marginBottom: 30 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 58,
    marginBottom: 18,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  eyeIcon: { padding: 5 },
  shadowProp: { width: '100%', marginTop: 10 },
  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
  footerSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  footerText: { color: '#AAA', fontSize: 14 },
  linkText: { color: '#4ADE80', fontSize: 14, fontWeight: 'bold', marginLeft: 5, textDecorationLine: 'underline' },
});
