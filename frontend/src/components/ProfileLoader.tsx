import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { profileService } from '../services';
import { setProfile, clearProfile } from '../store/userSlice';

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/75.jpg';

export default function ProfileLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(clearProfile());
        return;
      }

      try {
        const [profile, stats] = await Promise.all([
          profileService.getUserProfile(user.uid),
          profileService.getUserStats(user.uid),
        ]);

        const email = user.email || '';

        if (profile) {
          dispatch(setProfile({
            userId: user.uid,
            userName: profile.name || profile.displayName || email.split('@')[0] || 'User',
            userEmail: email,
            avatarUri: profile.avatar || DEFAULT_AVATAR,
            userCreatedAt: profile.createdAt || user.metadata?.creationTime || '',
            userStats: {
              balance: stats?.balance ?? 0,
              profit: stats?.profit ?? 0,
              winRate: stats?.winRate ?? 0,
            },
            profileLoaded: true,
          }));
        } else {
          const newProfile = await profileService.createUserProfile(user.uid, {
            name: email.split('@')[0] || 'User',
            email,
            avatar: DEFAULT_AVATAR,
          });
          dispatch(setProfile({
            userId: user.uid,
            userName: newProfile.name || email.split('@')[0] || 'User',
            userEmail: email,
            avatarUri: DEFAULT_AVATAR,
            userCreatedAt: newProfile.createdAt || '',
            userStats: { balance: 0, profit: 0, winRate: 0 },
            profileLoaded: true,
          }));
        }
      } catch (error) {
        console.error('ProfileLoader error:', error);
        dispatch(setProfile({
          userId: user.uid,
          userName: user.email?.split('@')[0] || 'User',
          userEmail: user.email || '',
          avatarUri: DEFAULT_AVATAR,
          userStats: { balance: 0, profit: 0, winRate: 0 },
          profileLoaded: true,
        }));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}
