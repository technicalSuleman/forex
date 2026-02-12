// Menu service - Firebase settings, KYC, audit log

import { ref, get, set, update, push } from 'firebase/database';
import { database } from '../firebaseConfig';

export const menuService = {
  async getUserSettings(userId) {
    try {
      const settingsRef = ref(database, `users/${userId}/settings`);
      const snapshot = await get(settingsRef);
      if (snapshot.exists()) return snapshot.val();
      return {
        biometric: false,
        twoFactor: false,
        notifications: true,
        currency: 'USD',
        language: 'English',
        theme: 'dark',
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  },

  async updateUserSettings(userId, settings) {
    try {
      const settingsRef = ref(database, `users/${userId}/settings`);
      await update(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  async getKYCStatus(userId) {
    try {
      const kycRef = ref(database, `users/${userId}/kyc`);
      const snapshot = await get(kycRef);
      if (snapshot.exists()) return snapshot.val();
      return {
        status: 'not_started',
        submittedAt: null,
        approvedAt: null,
        documents: {},
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      throw error;
    }
  },

  async submitKYC(userId, kycData) {
    try {
      const kycRef = ref(database, `users/${userId}/kyc`);
      await set(kycRef, {
        ...kycData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error submitting KYC:', error);
      throw error;
    }
  },

  async toggleBiometric(userId, enabled) {
    try {
      const settingsRef = ref(database, `users/${userId}/settings`);
      const snapshot = await get(settingsRef);
      const current = snapshot.exists() ? snapshot.val() : {};
      await update(settingsRef, {
        ...current,
        biometric: enabled,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error toggling biometric:', error);
      throw error;
    }
  },

  async toggleTwoFactor(userId, enabled) {
    try {
      const settingsRef = ref(database, `users/${userId}/settings`);
      const snapshot = await get(settingsRef);
      const current = snapshot.exists() ? snapshot.val() : {};
      await update(settingsRef, {
        ...current,
        twoFactor: enabled,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      throw error;
    }
  },

  async updateNotificationPreferences(userId, preferences) {
    try {
      const notifRef = ref(database, `users/${userId}/notificationPreferences`);
      await update(notifRef, {
        ...preferences,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  async getNotificationPreferences(userId) {
    try {
      const notifRef = ref(database, `users/${userId}/notificationPreferences`);
      const snapshot = await get(notifRef);
      if (snapshot.exists()) return snapshot.val();
      return {
        push: true,
        email: true,
        sms: false,
        tradeAlerts: true,
        priceAlerts: true,
        newsAlerts: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  },

  async addAuditLog(userId, action, details = {}) {
    try {
      const auditRef = ref(database, `users/${userId}/auditLog`);
      const newRef = push(auditRef);
      await set(newRef, {
        action,
        timestamp: new Date().toISOString(),
        ...details,
      });
      return true;
    } catch (error) {
      console.error('Error adding audit log:', error);
      throw error;
    }
  },

  async getAuditLog(userId, limit = 50) {
    try {
      const auditRef = ref(database, `users/${userId}/auditLog`);
      const snapshot = await get(auditRef);
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data)
        .map((key) => ({ id: key, ...data[key] }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting audit log:', error);
      return [];
    }
  },

  async updateCurrency(userId, currency) {
    try {
      const settingsRef = ref(database, `users/${userId}/settings`);
      await update(settingsRef, {
        currency,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    }
  },
};

export default menuService;
