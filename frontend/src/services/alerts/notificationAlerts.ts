import { AlertType } from '../../components/StyledAlert';

export interface NotificationAlertConfig {
  type: AlertType;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

// SBI Alert Generated Success
export const getSBIAlertSuccessAlert = (onClose: () => void): NotificationAlertConfig => ({
  type: 'success',
  title: 'SBI Alert Generated',
  message: 'SBI Alert has been generated successfully!',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// SBI Alert Generation Error
export const getSBIAlertErrorAlert = (onClose: () => void): NotificationAlertConfig => ({
  type: 'error',
  title: 'Generation Failed',
  message: 'Failed to generate SBI alert. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// ISMA Alert Generated Success
export const getISMAAlertSuccessAlert = (onClose: () => void): NotificationAlertConfig => ({
  type: 'success',
  title: 'ISMA Alert Generated',
  message: 'ISMA Alert has been generated successfully!',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// ISMA Alert Generation Error
export const getISMAAlertErrorAlert = (onClose: () => void): NotificationAlertConfig => ({
  type: 'error',
  title: 'Generation Failed',
  message: 'Failed to generate ISMA alert. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});

// Generic Notification Error
export const getGenericNotificationErrorAlert = (
  errorMessage: string,
  onClose: () => void
): NotificationAlertConfig => ({
  type: 'error',
  title: 'Error',
  message: errorMessage || 'An error occurred. Please try again.',
  buttons: [
    {
      text: 'OK',
      onPress: onClose,
    },
  ],
});
