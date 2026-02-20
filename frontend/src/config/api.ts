import { Platform } from 'react-native';

const DEFAULT_PORT = '4000';

/**
 * Base URL for backend API.
 * - Android emulator: use 10.0.2.2 (emulator's alias for host localhost)
 * - iOS simulator / web: use localhost
 * - Physical device: set EXPO_PUBLIC_API_URL to your machine IP (e.g. http://192.168.1.5:4000)
 */
function getDefaultBase(): string {
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }
  return `http://localhost:${DEFAULT_PORT}`;
}

const envUrl = process.env.EXPO_PUBLIC_API_URL;
const isLocalhost = !envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1');

export const API_BASE =
  envUrl && !isLocalhost ? envUrl.replace(/\/$/, '') : getDefaultBase();

export const getApiBase = (): string => API_BASE;
