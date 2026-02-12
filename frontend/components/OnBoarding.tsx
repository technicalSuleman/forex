import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { onboardingSlides } from '../constants/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dark trading theme
const theme = {
  background: '#000000',
  surface: '#0a0a0a',
  border: '#1a1a1a',
  text: '#ECEDEE',
  textMuted: '#9BA1A6',
  accent: '#2962FF',
  accentGreen: '#4ADE80',
};

export default function OnBoarding() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLastSlide = currentIndex === onboardingSlides.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const onNext = () => {
    if (isLastSlide) {
      router.replace('/welcome' as import('expo-router').Href);
      return;
    }
    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  };

  const onSkip = () => {
    router.replace('/welcome' as import('expo-router').Href);
  };

  const renderSlide = ({ item }: { item: (typeof onboardingSlides)[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image
          source={typeof item.image === 'number' ? item.image : { uri: item.image }}
          style={styles.slideImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      {/* Next / Get Started - top right */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={onNext}
        activeOpacity={0.8}
      >
        <Text style={styles.nextText}>
          {isLastSlide ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Bottom: Skip (hidden on last slide) + Pagination dots */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          {!isLastSlide ? (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              activeOpacity={0.8}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
          <View style={styles.pagination}>
            {onboardingSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.skipPlaceholder} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  nextButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  nextText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: theme.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  skipPlaceholder: {
    width: 60,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 100,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  slideImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  textContainer: {
    paddingHorizontal: 4,
  },
  title: {
    color: theme.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.accent,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
