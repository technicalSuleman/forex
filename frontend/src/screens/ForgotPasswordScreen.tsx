import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
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
import StyledAlert from '../components/StyledAlert';
import { auth } from '../firebaseConfig';

const bgImage = require('../../assets/images/welcome background.png');
const logoImage = require('../../assets/images/logo.png');

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [styledAlert, setStyledAlert] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    buttons?: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  ) => {
    setStyledAlert({
      visible: true,
      type,
      title,
      message,
      buttons:
        buttons || [
          {
            text: 'OK',
            onPress: () => setStyledAlert((prev) => ({ ...prev, visible: false })),
          },
        ],
    });
  };

  const handleResetPassword = async () => {
    if (!email) {
      showAlert('warning', 'Email Required', 'Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);

      showAlert(
        'success',
        'Email Sent!',
        `A password reset link has been sent to ${email}. Please check your inbox and follow the instructions to reset your password.`,
        [
          {
            text: 'Back to Login',
            onPress: () => {
              setStyledAlert((prev) => ({ ...prev, visible: false }));
              router.replace('/login');
            },
          },
        ]
      );
    } catch (error: any) {
      setLoading(false);

      let title = 'Reset Failed';
      let message = 'An error occurred while sending the reset email.';

      if (error.code === 'auth/user-not-found') {
        title = 'User Not Found';
        message =
          'No account found with this email address. Please check and try again.';
      } else if (error.code === 'auth/invalid-email') {
        title = 'Invalid Email';
        message = 'The email address is not valid. Please enter a valid email.';
      } else if (error.code === 'auth/network-request-failed') {
        title = 'Network Error';
        message = 'Please check your internet connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        title = 'Too Many Requests';
        message = 'Too many reset attempts. Please try again later.';
      }

      showAlert('error', title, message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground source={bgImage} style={styles.backgroundImage} resizeMode="cover">
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', '#000']}
          style={styles.gradientOverlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              <View style={styles.headerSection}>
                <View style={styles.logoGlow}>
                  <View style={styles.logoWrapper}>
                    <Image source={logoImage} style={styles.logo} resizeMode="cover" />
                  </View>
                </View>
                <Text style={styles.welcomeText}>Forgot Password?</Text>
                <Text style={styles.subText}>
                  Enter your email to receive a password reset link
                </Text>
              </View>

              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#888"
                    style={styles.inputIcon}
                  />
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

                <TouchableOpacity
                  style={styles.shadowProp}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#2962FF', '#0039CB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>SEND RESET LINK</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#2962FF" />
                  <Text style={styles.infoText}>
                    You will receive an email with instructions to reset your password.
                    Please check your spam folder if you don't see it in your inbox.
                  </Text>
                </View>

                <View style={styles.footerSection}>
                  <Text style={styles.footerText}>Remember your password? </Text>
                  <TouchableOpacity onPress={() => router.replace('/login')}>
                    <Text style={styles.linkText}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <StyledAlert
            visible={styledAlert.visible}
            type={styledAlert.type}
            title={styledAlert.title}
            message={styledAlert.message}
            buttons={styledAlert.buttons}
            onClose={() => setStyledAlert((prev) => ({ ...prev, visible: false }))}
          />
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  headerSection: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
  logoGlow: {
    marginBottom: 20,
    shadowColor: '#4ADE80',
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: '90%', height: '90%' },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
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
    marginBottom: 20,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  shadowProp: { width: '100%', marginTop: 10 },
  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(41, 98, 255, 0.3)',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    color: '#ccc',
    fontSize: 12,
    marginLeft: 10,
    lineHeight: 18,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: { color: '#AAA', fontSize: 14 },
  linkText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
});
