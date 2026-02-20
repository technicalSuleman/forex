import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Modal,
  BackHandler,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { useSelector } from 'react-redux';
import { auth } from '../firebaseConfig';
import BottomNavBar from '../components/BottomNavBar';
import StyledAlert from '../components/StyledAlert';
import { getLogoutConfirmationAlert } from '../services/alerts';
import KYCScreen from './menuscreens/KYCScreen';
import BiometricScreen from './menuscreens/BiometricScreen';
import NotificationSettingsScreen from './menuscreens/NotificationSettingsScreen';
import CurrencyScreen from './menuscreens/CurrencyScreen';

export default function MenuScreen() {
  const router = useRouter();
  const user = useSelector((s: { user?: { userName: string; userEmail: string; avatarUri: string } }) => s.user);
  const userName = user?.userName ?? '';
  const userEmail = user?.userEmail ?? '';
  const avatarUri = user?.avatarUri ?? 'https://randomuser.me/api/portraits/men/75.jpg';

  // State
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [activeScreen, setActiveScreen] = useState(null);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutAlert(false);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutAlert(false);
      router.replace('/');
    }
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'kyc':
        return <KYCScreen />;
      case 'biometric':
        return <BiometricScreen />;
      case 'notifications':
        return <NotificationSettingsScreen />;
      case 'currency':
        return <CurrencyScreen />;
      case 'security':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Security Center</Text>
            <Text style={styles.modalText}>Security features coming soon...</Text>
          </View>
        );
      case 'help':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <Text style={styles.modalText}>
              For help and support, please contact us at support@forexai.com
            </Text>
          </View>
        );
      case 'terms':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Terms & Privacy</Text>
            <Text style={styles.modalText}>Terms and privacy policy coming soon...</Text>
          </View>
        );
      case 'about':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>About App</Text>
            <Text style={styles.modalText}>Forex AI Assistant v2.5.0</Text>
            <Text style={[styles.modalText, {marginTop: 10}]}>© 2024 Forex AI. All rights reserved.</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header & Profile */}
        <View style={styles.topSection}>
          <Text style={styles.bigPageTitle}>Menu</Text>
          
          {/* Profile Card */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => router.push('/profile')}
          >
            <LinearGradient
              colors={['#1A1A1A', '#151515']}
              style={styles.profileCard}
            >
              <Image 
                source={{uri: avatarUri}} 
                style={styles.avatar}
              />
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileEmail}>{userEmail}</Text>
                <View style={styles.vipBadge}>
                  <MaterialCommunityIcons name="crown" size={12} color="#FFD700" />
                  <Text style={styles.vipText}>VIP Lv. 3</Text>
                </View>
              </View>
              <View style={styles.editProfileBtn}>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Account & Security Section */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeader}>ACCOUNT & SECURITY</Text>
          <View style={styles.sectionGroup}>
            <MenuItem 
              icon="shield-check" 
              label="Security Center" 
              onPress={() => setActiveScreen('security')}
            />
            <MenuItem 
              icon="card-account-details-outline" 
              label="KYC Verification" 
              onPress={() => setActiveScreen('kyc')}
            />
            <MenuItem 
              icon="fingerprint" 
              label="Biometric Login" 
              onPress={() => setActiveScreen('biometric')}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.sectionGroup}>
            <MenuItem 
              icon="bell-ring-outline" 
              label="Notifications" 
              onPress={() => setActiveScreen('notifications')}
            />
            <MenuItem 
              icon="currency-usd" 
              label="Default Currency" 
              onPress={() => setActiveScreen('currency')}
            />
            <MenuItem 
              icon="translate" 
              label="Language" 
              badge="English"
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeader}>SUPPORT & ABOUT</Text>
          <View style={styles.sectionGroup}>
            <MenuItem 
              icon="headset" 
              label="Help & Support" 
              onPress={() => setActiveScreen('help')}
            />
            <MenuItem 
              icon="file-document-outline" 
              label="Terms & Privacy" 
              onPress={() => setActiveScreen('terms')}
            />
            <MenuItem 
              icon="information-variant" 
              label="About App" 
              badge="v2.5.0"
              isLast
              onPress={() => setActiveScreen('about')}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => setShowLogoutAlert(true)}
        >
          <LinearGradient
            colors={['rgba(255, 69, 96, 0.1)', 'rgba(255, 69, 96, 0.05)']}
            style={styles.logoutGradient}
          >
            <MaterialCommunityIcons name="logout-variant" size={20} color="#FF4560" style={{marginRight:8}} />
            <Text style={styles.logoutText}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <StyledAlert
          visible={showLogoutAlert}
          {...getLogoutConfirmationAlert(
            () => setShowLogoutAlert(false),
            handleLogout
          )}
          onClose={() => setShowLogoutAlert(false)}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeRoute="/settings" />

      {/* Modals for Menu Screens */}
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

const MenuItem = ({ icon, label, badge, isLast, onPress }) => (
  <TouchableOpacity 
    style={[styles.menuRow, isLast && styles.noBorder]} 
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={styles.rowLeft}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={20} color="#2962FF" />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <View style={styles.rowRight}>
      {badge && <Text style={styles.badgeText}>{badge}</Text>}
      <Ionicons name="chevron-forward" size={18} color="#555" style={{marginLeft:4}} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  
  content: { paddingVertical: 20, paddingBottom: 110 },

  topSection: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 30 : 40, marginBottom: 30 },
  bigPageTitle: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 20, letterSpacing: 0.5 },
  
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 15, borderRadius: 16,
    borderWidth: 1, borderColor: '#252525'
  },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth:2, borderColor:'#2962FF' },
  profileTextContainer: { flex: 1, marginLeft: 15 },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  profileEmail: { fontSize: 12, color: '#888', marginBottom: 4 },
  vipBadge: { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255, 215, 0, 0.1)', alignSelf:'flex-start', paddingHorizontal:6, paddingVertical:2, borderRadius:8 },
  vipText: { color: '#FFD700', fontSize: 9, fontWeight:'bold', marginLeft:4 },
  editProfileBtn: { padding: 10 },

  sectionWrapper: { marginBottom: 25, paddingHorizontal: 20 },
  sectionHeader: { color: '#666', fontSize: 11, fontWeight:'bold', marginBottom: 10, letterSpacing:1 },
  sectionGroup: { backgroundColor: '#1A1A1A', borderRadius: 16, overflow:'hidden', borderWidth: 1, borderColor: '#252525' },

  menuRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 15,
    borderBottomWidth: 1, borderBottomColor: '#252525',
    backgroundColor: '#1A1A1A'
  },
  noBorder: { borderBottomWidth: 0 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width:32, height:32, borderRadius:10, backgroundColor:'rgba(41, 98, 255, 0.1)', alignItems:'center', justifyContent:'center', marginRight: 12 },
  rowLabel: { fontSize: 14, color: '#fff', fontWeight: '500' },
  rowRight: { flexDirection:'row', alignItems:'center' },
  badgeText: { color: '#888', fontSize: 13 },

  logoutBtn: {
    marginHorizontal: 20, marginTop: 10, marginBottom: 30,
    borderRadius: 16, overflow:'hidden', borderWidth: 1, borderColor: 'rgba(255, 69, 96, 0.3)'
  },
  logoutGradient: { flexDirection:'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
  logoutText: { color: '#FF4560', fontSize: 16, fontWeight: 'bold' },

  modalContainer: { flex: 1, backgroundColor: '#0f0f0f' },
  modalContent: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  modalText: { fontSize: 14, color: '#888', textAlign: 'center' },
});
