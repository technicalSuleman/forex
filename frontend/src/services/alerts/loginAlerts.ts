import { AlertType } from '../../components/StyledAlert';

export interface LoginAlertConfig {
  type: AlertType;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

// Login Success Alert
export const getLoginSuccessAlert = (onClose: () => void, onNavigate: () => void): LoginAlertConfig => ({
  type: 'success',
  title: 'Login Successful',
  message: 'Welcome back! Redirecting to dashboard...',
  buttons: [
    {
      text: 'OK',
      onPress: () => {
        onClose();
        setTimeout(onNavigate, 500);
      },
    },
  ],
});

// Wrong Password Alert
export const getWrongPasswordAlert = (onClose: () => void): LoginAlertConfig => ({
  type: 'error',
  title: 'Login Failed',
  message: 'Incorrect password. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// User Not Found Alert
export const getUserNotFoundAlert = (onClose: () => void): LoginAlertConfig => ({
  type: 'error',
  title: 'User Not Found',
  message: 'No account found with this email. Please register first.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Invalid Email Alert
export const getInvalidEmailAlert = (onClose: () => void): LoginAlertConfig => ({
  type: 'warning',
  title: 'Invalid Email',
  message: 'Please enter a valid email address.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Network Error Alert
export const getNetworkErrorAlert = (onClose: () => void): LoginAlertConfig => ({
  type: 'error',
  title: 'Connection Error',
  message: 'Unable to connect. Please check your internet connection.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Too Many Requests Alert
export const getTooManyRequestsAlert = (onClose: () => void): LoginAlertConfig => ({
  type: 'warning',
  title: 'Too Many Attempts',
  message: 'Too many failed login attempts. Please try again later.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Generic Login Error Alert
export const getGenericLoginErrorAlert = (errorMessage: string, onClose: () => void): LoginAlertConfig => ({
  type: 'error',
  title: 'Login Error',
  message: errorMessage || 'An error occurred during login. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});
