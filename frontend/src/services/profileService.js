// Profile service - Firebase profile operations

import { ref, get, set, update } from 'firebase/database';
import { database, auth } from '../firebaseConfig';

export const profileService = {
  async getUserProfile(userId) {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) return snapshot.val();
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  async getCurrentUserProfile() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      return await this.getUserProfile(user.uid);
    } catch (error) {
      console.error('Error getting current user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async updateCurrentUserProfile(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      return await this.updateUserProfile(user.uid, profileData);
    } catch (error) {
      console.error('Error updating current user profile:', error);
      throw error;
    }
  },

  async updateUserAvatar(userId, avatarUrl) {
    return await this.updateUserProfile(userId, { avatar: avatarUrl });
  },

  async getUserStats(userId) {
    try {
      const statsRef = ref(database, `users/${userId}/stats`);
      const snapshot = await get(statsRef);
      if (snapshot.exists()) return snapshot.val();
      return {
        balance: 0,
        profit: 0,
        winRate: 0,
        totalTrades: 0,
        winningTrades: 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  },

  async getUserTradingHistory(userId, limit = 50) {
    try {
      const historyRef = ref(database, `users/${userId}/tradingHistory`);
      const snapshot = await get(historyRef);
      if (!snapshot.exists()) return [];
      const history = snapshot.val();
      return Object.keys(history)
        .map((key) => ({ id: key, ...history[key] }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting trading history:', error);
      throw error;
    }
  },

  async createUserProfile(userId, userData) {
    try {
      const userRef = ref(database, `users/${userId}`);
      const profileData = {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          balance: 0,
          profit: 0,
          winRate: 0,
          totalTrades: 0,
          winningTrades: 0,
        },
      };
      await set(userRef, profileData);
      return profileData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },
};

export default profileService;
