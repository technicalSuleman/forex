import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NewsItem {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  author?: string;
  category?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  likesCount?: number;
  commentsCount?: number;
}

interface NewsState {
  list: NewsItem[];
  loading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  list: [],
  loading: false,
  error: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsList: (state, action: PayloadAction<NewsItem[]>) => {
      state.list = action.payload;
      state.error = null;
    },
    setNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setNewsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addNewsItem: (state, action: PayloadAction<NewsItem>) => {
      const item = action.payload;
      if (!state.list.find((n) => n.id === item.id)) {
        state.list = [item, ...state.list];
      }
      state.error = null;
    },
    updateNewsItem: (state, action: PayloadAction<NewsItem>) => {
      const idx = state.list.findIndex((n) => n.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = { ...state.list[idx], ...action.payload };
      }
      state.error = null;
    },
    removeNewsItem: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((n) => n.id !== action.payload);
      state.error = null;
    },
  },
});

export const {
  setNewsList,
  setNewsLoading,
  setNewsError,
  addNewsItem,
  updateNewsItem,
  removeNewsItem,
} = newsSlice.actions;
export default newsSlice.reducer;
