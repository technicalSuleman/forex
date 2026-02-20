import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import Toast from 'react-native-toast-message';
import StyledAlert from '../components/StyledAlert';
import { auth } from '../firebaseConfig';
import { getLogoutConfirmationAlert } from '../services/alerts';
import { profileService, menuService } from '../services';
import EditProfileScreen from './profileScreens/EditProfileScreen';
import AccountDetailsScreen from './profileScreens/AccountDetailsScreen';
import TradingHistoryScreen from './profileScreens/TradingHistoryScreen';
import SecurityScreen from './profileScreens/SecurityScreen';
import HelpScreen from './profileScreens/HelpScreen';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile Data States
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState('https://randomuser.me/api/portraits/men/75.jpg');
  const [userId, setUserId] = useState('');
  const [userCreatedAt, setUserCreatedAt] = useState('');
  const [userStats, setUserStats] = useState({
    balance: 0,
    profit: 0,
    winRate: 0,
  });
  
  // Navigation/Modal State
  const [activeScreen, setActiveScreen] = useState(null);
  const [tradingHistory, setTradingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  // --- FUNCTIONS ---

  // Load user profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/');
        return;
      }
      if (!user.emailVerified) {
        await signOut(auth);
        Toast.show({ type: 'error', text1: 'Verify your email', text2: 'Please verify your email before using the app.' });
        router.replace('/login');
        return;
      }
      setUserId(user.uid);
      setUserEmail(user.email || '');
      await loadUserProfile(user.uid, user);
    });

    return () => unsubscribe();
  }, [router]);

  // Handle Android back button for modals
  useEffect(() => {
    if (Platform.OS === 'android' && activeScreen !== null) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        setActiveScreen(null);
        return true;
      });
      return () => backHandler.remove();
    }
  }, [activeScreen]);

  const loadUserProfile = async (uid, authUser?: { emailVerified?: boolean; metadata?: { creationTime?: string } }) => {
    try {
      setLoading(true);
      if (authUser?.emailVerified !== undefined) setEmailVerified(authUser.emailVerified);
      const profile = await profileService.getUserProfile(uid);
      const stats = await profileService.getUserStats(uid);
      
      if (profile) {
        setUserName(profile.name || profile.displayName || userEmail?.split('@')[0] || 'User');
        setAvatarUri(profile.avatar || avatarUri);
        setUserCreatedAt(profile.createdAt || authUser?.metadata?.creationTime || '');
      } else {
        // Create profile if doesn't exist
        const newProfile = await profileService.createUserProfile(uid, {
          name: userEmail?.split('@')[0] || 'User',
          email: userEmail,
          avatar: avatarUri,
        });
        setUserName(newProfile.name);
        setUserCreatedAt(newProfile.createdAt || authUser?.metadata?.creationTime || '');
      }
      
      setUserStats({
        balance: stats.balance || 0,
        profit: stats.profit || 0,
        winRate: stats.winRate || 0,
      });

      const kycStatus = await menuService.getKYCStatus(uid);
      setKycVerified(kycStatus?.status === 'approved');
      setKycStatus(kycStatus);

      const settings = await menuService.getUserSettings(uid);
      setTwoFactorEnabled(settings?.twoFactor || false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setUserName(userEmail?.split('@')[0] || 'User');
    } finally {
      setLoading(false);
    }
  };

  // Load trading history
  const loadTradingHistory = async () => {
    try {
      setHistoryLoading(true);
      if (!userId) return;
      const history = await profileService.getUserTradingHistory(userId);
      setTradingHistory(history);
    } catch (error) {
      console.error('Error loading trading history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (name: string, avatar: string) => {
    if (!userId || !name.trim()) {
      alert('Please enter a valid name');
      return;
    }

    try {
      setSaving(true);
      await profileService.updateCurrentUserProfile({
        name: name.trim(),
        avatar: avatar,
      });
      setUserName(name.trim());
      setAvatarUri(avatar);
      setActiveScreen(null);
      Toast.show({ type: 'success', text1: 'Profile updated', text2: 'Your changes have been saved.' });
    } catch (error) {
      console.error('Error saving profile:', error);
      Toast.show({ type: 'error', text1: 'Update failed', text2: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Open trading history screen
  const openTradingHistory = async () => {
    setActiveScreen('tradingHistory');
    await loadTradingHistory();
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      if (userId) {
        try {
          await menuService.addAuditLog(userId, 'LOGOUT');
        } catch {}
      }
      await signOut(auth);
      setShowLogoutAlert(false);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutAlert(false);
      router.replace('/');
    }
  };

  // Render active screen content
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'editProfile':
        return (
          <EditProfileScreen
            userName={userName}
            userEmail={userEmail}
            avatarUri={avatarUri}
            onSave={handleSaveProfile}
            onClose={() => setActiveScreen(null)}
            saving={saving}
          />
        );
      case 'accountDetails':
        return (
          <AccountDetailsScreen
            userEmail={userEmail}
            userId={userId}
            userName={userName}
            createdAt={userCreatedAt}
            kycVerified={kycVerified}
            kycStatus={kycStatus}
            twoFactorEnabled={twoFactorEnabled}
            emailVerified={emailVerified}
            onResendVerificationEmail={async () => {
              const user = auth.currentUser;
              if (!user) return;
              const { sendEmailVerification } = await import('firebase/auth');
              await sendEmailVerification(user);
            }}
            onOpenSecurity={() => setActiveScreen('security')}
          />
        );
      case 'tradingHistory':
        return (
          <TradingHistoryScreen
            trades={tradingHistory}
            loading={historyLoading}
          />
        );
      case 'security':
        return <SecurityScreen userId={userId} />;
      case 'help':
        return <HelpScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* --- MAIN HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setActiveScreen('editProfile')} style={styles.iconBtn}>
          <MaterialCommunityIcons name="account-edit-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* --- MAIN PROFILE SECTION --- */}
        <View style={styles.profileHero}>
          <TouchableOpacity 
            onPress={() => setActiveScreen('editProfile')} 
            activeOpacity={0.8} 
            style={styles.avatarContainer}
          >
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#00E396" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{userName || 'Loading...'}</Text>
          <View style={styles.idContainer}>
            <Text style={styles.userId}>UID: {userId ? userId.substring(0, 8) : 'Loading...'}</Text>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="copy-outline" size={12} color="#666" style={{marginLeft:6}}/>
            </TouchableOpacity>
          </View>

          {/* VIP Label */}
          <View style={styles.vipTag}>
            <MaterialCommunityIcons name="crown" size={14} color="#FFD700" />
            <Text style={styles.vipText}>VIP Level 3</Text>
          </View>
        </View>

        {/* --- QUICK STATS ROW --- */}
        {loading ? (
          <View style={styles.statsRow}>
            <ActivityIndicator size="small" color="#2962FF" />
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Balance</Text>
              <Text style={styles.statValue}>${userStats.balance.toLocaleString()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Profit</Text>
              <Text style={[styles.statValue, {color: userStats.profit >= 0 ? '#00E396' : '#FF4560'}]}>
                {userStats.profit >= 0 ? '+' : ''}${userStats.profit.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Win Rate</Text>
              <Text style={[styles.statValue, {color: '#2962FF'}]}>{userStats.winRate}%</Text>
            </View>
          </View>
        )}

        {/* --- MENU ACTIONS --- */}
        <View style={styles.menuContainer}>
          <MenuRow 
            icon="card-account-details-outline" 
            label="Account Details" 
            onPress={() => setActiveScreen('accountDetails')} 
          />
          <MenuRow 
            icon="history" 
            label="Trading History" 
            onPress={openTradingHistory} 
          />
          <MenuRow 
            icon="shield-check-outline" 
            label="Security" 
            onPress={() => setActiveScreen('security')} 
          />
          <MenuRow 
            icon="help-circle-outline" 
            label="Help & Support" 
            isLast 
            onPress={() => setActiveScreen('help')} 
          />
        </View>

        {/* --- LOGOUT --- */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => setShowLogoutAlert(true)}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Logout Confirmation Alert */}
        <StyledAlert
          visible={showLogoutAlert}
          {...getLogoutConfirmationAlert(
            () => setShowLogoutAlert(false),
            handleLogout
          )}
          onClose={() => setShowLogoutAlert(false)}
        />
      </ScrollView>

      {/* --- SUB-SCREENS (FULL SCREEN MODAL) --- */}
      <Modal 
        visible={activeScreen !== null} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveScreen(null)}
      >
        <View style={styles.modalContainer}>
          {renderActiveScreen()}
        </View>
      </Modal>
    </View>
  );
}

// --- SUB-COMPONENTS ---
const MenuRow = ({ icon, label, isLast, onPress }) => (
  <TouchableOpacity 
    style={[styles.menuRow, isLast && styles.noBorder]} 
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={{flexDirection:'row', alignItems:'center'}}>
      <MaterialCommunityIcons name={icon} size={22} color="#888" style={{marginRight: 15}} />
      <Text style={styles.menuText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#444" />
  </TouchableOpacity>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  
  // Header
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 45 : 55, 
    paddingHorizontal: 20, 
    paddingBottom: 10
  },
  headerSpacer: { width: 40 }, // Spacer for center alignment
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1, textAlign: 'center' },
  iconBtn: { padding: 5 },

  content: { paddingHorizontal: 20, paddingBottom: 50 },

  // Profile Hero
  profileHero: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#1E1E1E' },
  verifiedBadge: { 
    position: 'absolute', bottom: 5, right: 5, 
    backgroundColor: '#0f0f0f', borderRadius: 10, padding: 2 
  },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  idContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userId: { color: '#666', fontSize: 12, letterSpacing: 1 },
  vipTag: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255, 215, 0, 0.1)', 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 
  },
  vipText: { color: '#FFD700', fontSize: 11, fontWeight: 'bold' },

  // Stats Row
  statsRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#181818', borderRadius: 16, paddingVertical: 20, marginBottom: 30,
    borderWidth: 1, borderColor: '#222'
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '60%', backgroundColor: '#333' },
  statLabel: { color: '#666', fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Menu List
  menuContainer: { 
    backgroundColor: '#181818', borderRadius: 16, 
    overflow: 'hidden', borderWidth: 1, borderColor: '#222', marginBottom: 30 
  },
  menuRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 18, borderBottomWidth: 1, borderBottomColor: '#222' 
  },
  noBorder: { borderBottomWidth: 0 },
  menuText: { color: '#fff', fontSize: 14, fontWeight: '500' },

  // Logout
  logoutBtn: { 
    alignItems: 'center', paddingVertical: 15, 
    borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A' 
  },
  logoutText: { color: '#FF4560', fontWeight: 'bold', fontSize: 14 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#0f0f0f' },
});
