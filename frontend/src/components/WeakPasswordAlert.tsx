import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WeakPasswordAlertProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export default function WeakPasswordAlert({ visible, message, onClose }: WeakPasswordAlertProps) {
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const glitchAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Glow pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glitch effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glitchAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(glitchAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ])
      ).start();

      // Scale and fade in
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnimation.setValue(0.8);
      opacityAnimation.setValue(0);
      glowAnimation.setValue(0);
      glitchAnimation.setValue(0);
    }
  }, [visible]);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glitchTranslateX = glitchAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -3, 3],
  });

  const glitchOpacity = glitchAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Dark charcoal background with red candlestick charts */}
        <View style={styles.backgroundPattern}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={[styles.candlestick, { left: `${i * 12.5}%` }]}>
              <View style={[styles.wick, { height: 20 + Math.random() * 30 }]} />
              <View style={[styles.body, { height: 15 + Math.random() * 20 }]} />
            </View>
          ))}
        </View>

        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [
                { scale: scaleAnimation },
                { translateX: glitchTranslateX },
              ],
              opacity: opacityAnimation,
            },
          ]}
        >
          {/* Neon red glowing outline */}
          <Animated.View
            style={[
              styles.glowOutline,
              {
                opacity: glowOpacity,
                shadowOpacity: glowOpacity,
              },
            ]}
          />

          {/* Main alert box */}
          <View style={styles.alertBox}>
            {/* Warning triangle with glitch effect */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: glitchOpacity,
                  transform: [{ translateX: glitchTranslateX }],
                },
              ]}
            >
              <Ionicons name="warning" size={45} color="#FF1744" />
              {/* Glitch overlay effect */}
              <Animated.View
                style={[
                  styles.glitchOverlay,
                  {
                    opacity: glitchAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.3, 0],
                    }),
                    transform: [{ translateX: glitchTranslateX }],
                  },
                ]}
              >
                <Ionicons name="warning" size={45} color="#FF6B6B" />
              </Animated.View>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>WEAK PASSWORD</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Security requirements */}
            <View style={styles.requirementsContainer}>
              <View style={styles.requirementItem}>
                <View style={styles.requirementDot} />
                <Text style={styles.requirementText}>Minimum 8 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <View style={styles.requirementDot} />
                <Text style={styles.requirementText}>At least 1 uppercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <View style={styles.requirementDot} />
                <Text style={styles.requirementText}>At least 1 lowercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <View style={styles.requirementDot} />
                <Text style={styles.requirementText}>At least 1 number</Text>
              </View>
            </View>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF1744', '#C51162']}
                style={styles.closeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.closeButtonText}>UNDERSTOOD</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  candlestick: {
    position: 'absolute',
    bottom: 0,
    width: '10%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  wick: {
    width: 2,
    backgroundColor: '#FF1744',
    marginBottom: 2,
  },
  body: {
    width: 8,
    backgroundColor: '#FF1744',
    borderRadius: 2,
  },
  alertContainer: {
    width: width * 0.8,
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOutline: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FF1744',
    shadowColor: '#FF1744',
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  alertBox: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF1744',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  iconContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  glitchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF1744',
    letterSpacing: 1,
    marginBottom: 10,
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  message: {
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  requirementsContainer: {
    width: '100%',
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 23, 68, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.2)',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF1744',
    marginRight: 10,
    shadowColor: '#FF1744',
    shadowRadius: 4,
    shadowOpacity: 0.7,
    elevation: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#B0B0B0',
    letterSpacing: 0.2,
    flex: 1,
  },
  closeButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  closeButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
