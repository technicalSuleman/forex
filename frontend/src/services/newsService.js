/**
 * News: stored in Firebase Realtime Database (no backend required).
 * Create post → saves to DB. News list → reads from same DB.
 */
import { newsFirebase } from './newsFirebase';

export const newsService = {
  async getNews() {
    try {
      const arr = await newsFirebase.getNews();
      if (__DEV__) console.log('[News] getNews count:', arr.length);
      return Array.isArray(arr) ? arr : [];
    } catch (err) {
      if (__DEV__) console.warn('[News] getNews failed:', err.message);
      throw new Error(err?.message || 'Failed to load news.');
    }
  },

  async getNewsById(id) {
    try {
      const data = await newsFirebase.getNewsById(id);
      if (__DEV__) console.log('[News] getNewsById', id, !!data);
      return data;
    } catch (err) {
      if (__DEV__) console.warn('[News] getNewsById failed:', id, err.message);
      throw new Error(err?.message || 'Could not load news.');
    }
  },

  async createNews(payload) {
    try {
      const data = await newsFirebase.createNews(payload);
      if (__DEV__) console.log('[News] createNews success', data?.id);
      return data;
    } catch (err) {
      if (__DEV__) console.warn('[News] createNews failed:', err.message);
      throw new Error(err?.message || 'Could not save post.');
    }
  },

  async updateNews(id, payload) {
    try {
      await newsFirebase.updateNews(id, payload);
    } catch (err) {
      throw new Error(err?.message || 'Failed to update.');
    }
  },

  async deleteNews(id) {
    try {
      await newsFirebase.deleteNews(id);
    } catch (err) {
      throw new Error(err?.message || 'Failed to delete.');
    }
  },

  async likeNews(id, userId) {
    try {
      return await newsFirebase.likeNews(id, userId);
    } catch (err) {
      throw new Error(err?.message || 'Could not update like.');
    }
  },

  async addComment(id, { author, text }) {
    try {
      return await newsFirebase.addComment(id, { author, text });
    } catch (err) {
      throw new Error(err?.message || 'Could not add comment.');
    }
  },
};
