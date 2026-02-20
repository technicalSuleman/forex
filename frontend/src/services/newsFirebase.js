/**
 * News stored in Firebase Realtime Database (no backend needed).
 * Path: ref('news'). In Firebase Console → Realtime Database → Rules, allow "news":
 *   "news": { ".read": true, ".write": true }
 */
import { ref, get, set, push, update, remove } from 'firebase/database';
import { database } from '../firebaseConfig';

const NEWS_PATH = 'news';

function newsRef(path = '') {
  return path ? ref(database, `${NEWS_PATH}/${path}`) : ref(database, NEWS_PATH);
}

export const newsFirebase = {
  async getNews() {
    const snapshot = await get(newsRef());
    const list = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const val = child.val() || {};
        const comments = val.comments || [];
        list.push({
          id: child.key,
          ...val,
          likesCount: typeof val.likesCount === 'number' ? val.likesCount : 0,
          commentsCount: Array.isArray(comments) ? comments.length : 0,
        });
      });
    }
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  },

  async getNewsById(id) {
    const snapshot = await get(newsRef(id));
    if (!snapshot.exists()) return null;
    const val = snapshot.val() || {};
    const comments = val.comments || [];
    return {
      id: snapshot.key,
      ...val,
      likesCount: typeof val.likesCount === 'number' ? val.likesCount : 0,
      commentsCount: Array.isArray(comments) ? comments.length : 0,
      comments: Array.isArray(comments) ? comments : [],
    };
  },

  async createNews(payload) {
    const newRef = push(newsRef());
    const now = new Date().toISOString();
    const data = {
      title: payload.title,
      content: payload.content,
      author: payload.author || 'User',
      category: payload.category || 'General',
      imageUrl: payload.imageUrl || '',
      createdAt: now,
      updatedAt: now,
      likesCount: 0,
      likedBy: {},
      comments: [],
    };
    await set(newRef, data);
    return { id: newRef.key, ...data };
  },

  async updateNews(id, payload) {
    const r = newsRef(id);
    const snapshot = await get(r);
    if (!snapshot.exists()) throw new Error('News not found');
    await update(r, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteNews(id) {
    const r = newsRef(id);
    const snapshot = await get(r);
    if (!snapshot.exists()) throw new Error('News not found');
    await remove(r);
  },

  async likeNews(id, userId) {
    const r = newsRef(id);
    const snapshot = await get(r);
    if (!snapshot.exists()) throw new Error('News not found');
    const val = snapshot.val() || {};
    const likedBy = { ...(val.likedBy || {}) };
    const key = userId || 'anonymous';
    if (likedBy[key]) delete likedBy[key];
    else likedBy[key] = true;
    const likesCount = Object.keys(likedBy).length;
    await update(r, { likedBy, likesCount, updatedAt: new Date().toISOString() });
    return { id, ...val, likedBy, likesCount };
  },

  async addComment(id, { author, text }) {
    const r = newsRef(id);
    const snapshot = await get(r);
    if (!snapshot.exists()) throw new Error('News not found');
    const val = snapshot.val() || {};
    const comments = Array.isArray(val.comments) ? [...val.comments] : [];
    comments.push({
      author: String(author).trim(),
      text: String(text).trim(),
      createdAt: new Date().toISOString(),
    });
    await update(r, { comments, updatedAt: new Date().toISOString() });
    return { id, ...val, comments };
  },
};
