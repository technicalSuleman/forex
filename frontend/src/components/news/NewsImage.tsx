import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';

type NewsImageProps = {
  uri: string | null | undefined;
  style?: ViewStyle;
  contentFit?: 'cover' | 'contain';
};

/**
 * Caching-friendly news image with skeleton placeholder and smooth transition.
 * Uses expo-image for memory and disk cache.
 */
export function NewsImage({ uri, style, contentFit = 'cover' }: NewsImageProps) {
  if (!uri) {
    return <View style={[styles.placeholder, style]} />;
  }
  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      contentFit={contentFit}
      transition={220}
    />
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  placeholder: { width: '100%', height: '100%', backgroundColor: '#1a1a1a' },
});
