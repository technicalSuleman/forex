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

const { width } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface StyledAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onClose?: () => void;
}

export default function StyledAlert({
  visible,
  type,
  title,
  message,
  buttons = [{ text: 'OK', onPress: () => {} }],
  onClose,
}: StyledAlertProps) {
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  const colors = {
    success: { primary: '#4ADE80', secondary: '#00E396', glow: '#4ADE80' },
    error: { primary: '#FF1744', secondary: '#C51162', glow: '#FF1744' },
    warning: { primary: '#FFA726', secondary: '#FF6F00', glow: '#FFA726' },
    info: { primary: '#2962FF', secondary: '#0039CB', glow: '#2962FF' },
  };

  const icons = {
    success: 'checkmark-circle',
    error: 'close-circle',
    warning: 'warning',
    info: 'information-circle',
  };

  const currentColors = colors[type];
  const currentIcon = icons[type];

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
    }
  }, [visible]);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const handleButtonPress = (buttonOnPress: () => void) => {
    buttonOnPress();
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose || (() => {})}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnimation }],
              opacity: opacityAnimation,
            },
          ]}
        >
          {/* Glowing outline */}
          <Animated.View
            style={[
              styles.glowOutline,
              {
                borderColor: currentColors.primary,
                shadowColor: currentColors.glow,
                opacity: glowOpacity,
                shadowOpacity: glowOpacity,
              },
            ]}
          />

          {/* Main alert box */}
          <View style={[styles.alertBox, { borderColor: currentColors.primary }]}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${currentColors.primary}15` }]}>
              <Ionicons name={currentIcon} size={40} color={currentColors.primary} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: currentColors.primary }]}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => {
                if (button.style === 'cancel' || button.style === 'destructive') {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => handleButtonPress(button.onPress)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelButtonText}>{button.text}</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.button}
                    onPress={() => handleButtonPress(button.onPress)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[currentColors.primary, currentColors.secondary]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buttonText}>{button.text}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  message: {
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
});
