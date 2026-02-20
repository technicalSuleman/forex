// News/feed service - Firebase Realtime Database
// Backend also exposes GET /api/news (reads same path)

import { ref, get, push, set } from 'firebase/database';
import { database, auth } from '../firebaseConfig';

const NEWS_PATH = 'news';

export const newsService = {
  /**
   * Fetch news/feed items (same data as backend GET /api/news)
   * @param {string} [category] - optional filter e.g. 'BTC/USDT', 'EUR/USD', 'All'
   * @param {number} [limit=50]
   * @returns {Promise<Array<{ id: string, user: string, pair: string, text: string, sentiment: string, createdAt: string, likes: number, avatar?: string }>>}
   */
  async getNews(category, limit = 50) {
    try {
      const newsRef = ref(database, NEWS_PATH);
      const snapshot = await get(newsRef);
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      let items = Object.keys(data)
        .map((key) => ({ id: key, ...data[key] }))
        .filter((item) => item.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
      if (category && category !== 'All') {
        items = items.filter((item) => (item.pair || '').replace(/\s/g, '') === category.replace(/\s/g, ''));
      }
      return items;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  /**
   * Add a post to the feed (authenticated user). Matches backend/Firebase shape.
   */
  async addPost({ pair, text, sentiment = 'neutral' }) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in to post');
      const newsRef = ref(database, NEWS_PATH);
      const newRef = push(newsRef);
      const displayName = user.displayName || user.email?.split('@')[0] || 'Trader';
      const avatar = user.photoURL || null;
      await set(newRef, {
        userId: user.uid,
        user: displayName,
        pair: pair || 'General',
        text,
        sentiment,
        likes: 0,
        avatar,
        createdAt: new Date().toISOString(),
      });
      return newRef.key;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  },
};

export default newsService;
