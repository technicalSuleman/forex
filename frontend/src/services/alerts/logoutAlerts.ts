import { AlertType } from '../../components/StyledAlert';

export interface LogoutAlertConfig {
  type: AlertType;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

// Logout Confirmation Alert
export const getLogoutConfirmationAlert = (
  onCancel: () => void,
  onConfirm: () => void
): LogoutAlertConfig => ({
  type: 'warning',
  title: 'Logout',
  message: 'Do you want to logout?',
  buttons: [
    {
      text: 'Cancel',
      onPress: onCancel,
      style: 'cancel',
    },
    {
      text: 'Yes, Logout',
      onPress: onConfirm,
      style: 'destructive',
    },
  ],
});

// Logout Success Alert
export const getLogoutSuccessAlert = (onClose: () => void): LogoutAlertConfig => ({
  type: 'success',
  title: 'Logged Out',
  message: 'You have been successfully logged out.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Logout Error Alert
export const getLogoutErrorAlert = (onClose: () => void): LogoutAlertConfig => ({
  type: 'error',
  title: 'Logout Error',
  message: 'An error occurred during logout. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});
