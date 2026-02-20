import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/75.jpg';

export interface UserStats {
  balance: number;
  profit: number;
  winRate: number;
}

export interface UserProfileState {
  userId: string;
  userName: string;
  userEmail: string;
  avatarUri: string;
  userCreatedAt: string;
  userStats: UserStats;
  profileLoaded: boolean;
}

const initialState: UserProfileState = {
  userId: '',
  userName: '',
  userEmail: '',
  avatarUri: DEFAULT_AVATAR,
  userCreatedAt: '',
  userStats: { balance: 0, profit: 0, winRate: 0 },
  profileLoaded: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Partial<UserProfileState>>) => {
      Object.assign(state, action.payload);
      state.profileLoaded = true;
    },
    setAvatar: (state, action: PayloadAction<string>) => {
      state.avatarUri = action.payload || DEFAULT_AVATAR;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setUserStats: (state, action: PayloadAction<UserStats>) => {
      state.userStats = action.payload;
    },
    clearProfile: (state) => {
      state.userId = '';
      state.userName = '';
      state.userEmail = '';
      state.avatarUri = DEFAULT_AVATAR;
      state.userCreatedAt = '';
      state.userStats = { balance: 0, profit: 0, winRate: 0 };
      state.profileLoaded = false;
    },
  },
});

export const { setProfile, setAvatar, setUserName, setUserStats, clearProfile } = userSlice.actions;
export default userSlice.reducer;
