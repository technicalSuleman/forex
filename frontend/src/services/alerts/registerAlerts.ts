import { AlertType } from '../../components/StyledAlert';

export interface RegisterAlertConfig {
  type: AlertType;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

// Registration Success Alert
export const getRegisterSuccessAlert = (onClose: () => void, onNavigate: () => void): RegisterAlertConfig => ({
  type: 'success',
  title: 'Registration Successful',
  message: 'Your account has been created successfully! Redirecting to login...',
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

// Email Already Exists Alert
export const getEmailExistsAlert = (onClose: () => void): RegisterAlertConfig => ({
  type: 'error',
  title: 'Email Already Registered',
  message: 'An account with this email already exists. Please login instead.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Weak Password Alert (for WeakPasswordAlert component)
export const getWeakPasswordMessage = (): string => {
  return 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, numbers, and special characters.';
};

// Invalid Email Format Alert
export const getInvalidEmailFormatAlert = (onClose: () => void): RegisterAlertConfig => ({
  type: 'warning',
  title: 'Invalid Email Format',
  message: 'Please enter a valid email address.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Password Mismatch Alert
export const getPasswordMismatchAlert = (onClose: () => void): RegisterAlertConfig => ({
  type: 'warning',
  title: 'Password Mismatch',
  message: 'Passwords do not match. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Operation Not Allowed Alert
export const getOperationNotAllowedAlert = (onClose: () => void): RegisterAlertConfig => ({
  type: 'error',
  title: 'Registration Disabled',
  message: 'Email/Password authentication is not enabled. Please contact support.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Network Error Alert
export const getRegisterNetworkErrorAlert = (onClose: () => void): RegisterAlertConfig => ({
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

// Generic Registration Error Alert
export const getGenericRegisterErrorAlert = (errorMessage: string, onClose: () => void): RegisterAlertConfig => ({
  type: 'error',
  title: 'Registration Error',
  message: errorMessage || 'An error occurred during registration. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});
