import Toast from 'react-native-toast-message';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import ProfileLoader from '../src/components/ProfileLoader';

// Dark content background prevents white flash when switching screens
const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#000000' },
  animation: 'fade' as const,
  animationDuration: 200,
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ProfileLoader />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" />
      </Stack>
      <Toast />
    </Provider>
  );
}