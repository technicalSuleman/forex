import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  green: '#089981',
  greenDark: '#006B5B',
  red: '#F23645',
  redDark: '#C62828',
  card: '#131722',
  grid: '#2A2E39',
  bg: '#0f0f0f',
};

export interface TradingModalProps {
  visible: boolean;
  onClose: () => void;
  onBuy: () => void | Promise<void>;
  onSell: () => void | Promise<void>;
  lotSize: string;
  onLotSizeChange: (value: string) => void;
  processing: boolean;
  processingType: 'buy' | 'sell' | null;
  currentPrice: number;
}

export default function TradingModal({
  visible,
  onClose,
  onBuy,
  onSell,
  lotSize,
  onLotSizeChange,
  processing,
  processingType,
  currentPrice,
}: TradingModalProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderRelease: (_, g) => {
        if (g.vy > 0.3 || g.dy > 80) {
          Keyboard.dismiss();
          onClose();
        }
      },
    })
  ).current;

  const handleBuy = () => {
    if (processing) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBuy();
  };

  const handleSell = () => {
    if (processing) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSell();
  };

  const sheetBottom = Platform.OS === 'android' && keyboardHeight > 0 ? keyboardHeight + 8 : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.sheet,
            { bottom: sheetBottom },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>LOT SIZE</Text>
            <TextInput
              style={styles.input}
              value={lotSize}
              onChangeText={onLotSizeChange}
              placeholder="0.01"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              maxLength={8}
              editable={!processing}
            />

            <View style={styles.actions}>
              <Pressable
                onPress={handleSell}
                disabled={processing}
                style={({ pressed }) => [
                  styles.btn,
                  styles.sellBtn,
                  processing && styles.btnDisabled,
                  pressed && !processing && styles.btnPressed,
                ]}
              >
                <LinearGradient
                  colors={[COLORS.red, COLORS.redDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnGradient}
                >
                  {processing && processingType === 'sell' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="trending-down" size={22} color="#fff" />
                      <Text style={styles.btnText}>SELL</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={handleBuy}
                disabled={processing}
                style={({ pressed }) => [
                  styles.btn,
                  styles.buyBtn,
                  processing && styles.btnDisabled,
                  pressed && !processing && styles.btnPressed,
                ]}
              >
                <LinearGradient
                  colors={[COLORS.green, COLORS.greenDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnGradient}
                >
                  {processing && processingType === 'buy' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="trending-up" size={22} color="#fff" />
                      <Text style={styles.btnText}>BUY</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.grid,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
    }),
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.grid,
  },
  content: {},
  label: {
    color: '#787B86',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(42, 46, 57, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grid,
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
  },
  btn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sellBtn: {},
  buyBtn: {},
  btnDisabled: {
    opacity: 0.7,
  },
  btnPressed: {
    opacity: 0.88,
  },
});
