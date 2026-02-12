import { AlertType } from '../../components/StyledAlert';

export interface ForgotPasswordAlertConfig {
  type: AlertType;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

// Password Reset Email Sent Alert
export const getPasswordResetSentAlert = (onClose: () => void): ForgotPasswordAlertConfig => ({
  type: 'success',
  title: 'Reset Link Sent',
  message: 'Password reset link has been sent to your email. Please check your inbox.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Invalid Email Alert
export const getForgotPasswordInvalidEmailAlert = (onClose: () => void): ForgotPasswordAlertConfig => ({
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

// User Not Found Alert
export const getForgotPasswordUserNotFoundAlert = (onClose: () => void): ForgotPasswordAlertConfig => ({
  type: 'error',
  title: 'Email Not Found',
  message: 'No account found with this email address.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Network Error Alert
export const getForgotPasswordNetworkErrorAlert = (onClose: () => void): ForgotPasswordAlertConfig => ({
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
export const getForgotPasswordTooManyRequestsAlert = (onClose: () => void): ForgotPasswordAlertConfig => ({
  type: 'warning',
  title: 'Too Many Requests',
  message: 'Too many password reset requests. Please try again later.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Generic Forgot Password Error Alert
export const getGenericForgotPasswordErrorAlert = (
  errorMessage: string,
  onClose: () => void
): ForgotPasswordAlertConfig => ({
  type: 'error',
  title: 'Reset Error',
  message: errorMessage || 'An error occurred. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});
