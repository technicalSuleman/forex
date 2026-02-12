import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const bgImage = require('../../assets/images/bg.jpg');
const logoImage = require('../../assets/images/logo.png');

const theme = {
  primary: '#2962FF',
  primaryDark: '#0039CB',
  accent: '#4ADE80',
  white: '#FFFFFF',
  textLight: '#E8EAED',
  textMuted: '#9BA1A6',
  surface: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.12)',
  overlay: 'rgba(0, 0, 0, 0.86)',
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={bgImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0, 0, 0, 0.86)',
            'rgba(0, 0, 0, 0.82)',
            'rgba(0, 0, 0, 0.82)',
            '#000000',
          ]}
          locations={[0, 0.35, 0.6, 0.85, 1]}
          style={styles.gradientOverlay}
        >
          <View style={styles.content}>
            {/* Logo & badge */}
            <View style={styles.heroSection}>
              <View style={styles.logoRing}>
      
                <View style={styles.logoBox}>
                  <Image source={logoImage} style={styles.logo} resizeMode="contain" />
                </View>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>AI TRADING V.2.0</Text>
              </View>
            </View>

            {/* Headline */}
            <View style={styles.headlineSection}>
              <Text style={styles.title}>
                FOREX <Text style={styles.titleAccent}>AI</Text>
              </Text>
              <Text style={styles.subtitle}>ASSISTANT BOT</Text>
              <Text style={styles.tagline}>
                Automate your trades with precision. The future of market analysis is here.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/login')}
                style={styles.primaryTouch}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryLabel}>LOGIN</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.secondaryLabel}>CREATE ACCOUNT</Text>
              </TouchableOpacity>

              <Text style={styles.footerTagline}>Trade Smart, Not Hard.</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: Platform.OS === 'ios' ? 42 : 36,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoRing: {
    position: 'relative',
    marginBottom: 16,
  },
  logoGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'transparent',
    borderWidth: 0,
    top: -10,
    left: -10,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 16,
  },
  logoBox: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  badge: {
    backgroundColor: theme.surface,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  badgeText: {
    color: theme.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
  },
  headlineSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    color: theme.white,
    fontSize: isSmallScreen ? 48 : 54,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  titleAccent: {
    color: theme.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.textLight,
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '400',
    letterSpacing: 5,
    marginTop: 6,
    marginBottom: 14,
    textTransform: 'uppercase',
    opacity: 0.95,
  },
  tagline: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: '88%',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  primaryTouch: {
    width: '100%',
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButton: {
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: theme.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  secondaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginBottom: 22,
  },
  secondaryLabel: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  footerTagline: {
    color: theme.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});
