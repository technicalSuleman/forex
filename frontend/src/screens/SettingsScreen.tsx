import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Switch,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import BottomNavBar from '../components/BottomNavBar';
import StyledAlert from '../components/StyledAlert';
import { getLogoutConfirmationAlert } from '../services/alerts';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  
  // Toggles State
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pushNotifEnabled, setPushNotifEnabled] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* --- NEW STYLISH HEADER & PROFILE --- */}
        <View style={styles.topSection}>
            <Text style={styles.bigPageTitle}>Settings</Text>
            
            {/* Profile Summary Card (CLICKABLE NOW) */}
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => router.push('/profile')} // 👈 Yeh Link Add Hua Hai
            >
                <LinearGradient
                    colors={['#1A1A1A', '#151515']}
                    style={styles.profileCard}
                >
                    <Image 
                        source={{uri: 'https://randomuser.me/api/portraits/men/75.jpg'}} 
                        style={styles.avatar}
                    />
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.profileName}>Alex Trader</Text>
                        <Text style={styles.profileEmail}>alex.pro@trading.com</Text>
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


        {/* --- SECTION 1: ACCOUNT & SECURITY --- */}
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionHeader}>ACCOUNT</Text>
            <View style={styles.sectionGroup}>
                <SettingItem icon="shield-check" label="Security Center" type="link" value="High" iconSet="MCI" />
                <SettingItem icon="card-account-details-outline" label="Verification (KYC)" type="status" status="Verified" statusColor="#00E396" iconSet="MCI" />
                <SettingItem 
                    icon="fingerprint" 
                    label="Biometric Login" 
                    type="toggle" 
                    isChecked={biometricEnabled}
                    onToggle={setBiometricEnabled}
                    iconSet="MI"
                    isLast
                />
            </View>
        </View>

        {/* --- SECTION 2: APP PREFERENCES --- */}
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionHeader}>PREFERENCES</Text>
            <View style={styles.sectionGroup}>
                 <SettingItem 
                    icon="bell-ring-outline" 
                    label="Notifications" 
                    type="toggle" 
                    isChecked={pushNotifEnabled}
                    onToggle={setPushNotifEnabled}
                    iconSet="MCI"
                />
                <SettingItem icon="currency-usd" label="Default Currency" type="value" value="USD" iconSet="MCI" />
                <SettingItem icon="translate" label="Language" type="value" value="English" iconSet="MCI" isLast />
            </View>
        </View>

        {/* --- SECTION 3: SUPPORT & ABOUT --- */}
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionHeader}>SUPPORT</Text>
            <View style={styles.sectionGroup}>
                <SettingItem icon="headset" label="Help & Support" type="link" iconSet="MCI" />
                <SettingItem icon="file-document-outline" label="Terms & Privacy" type="link" iconSet="MCI" />
                <SettingItem icon="information-variant" label="About App" type="value" value="v2.5.0" iconSet="MCI" isLast />
            </View>
        </View>

        {/* --- STYLISH LOGOUT BUTTON --- */}
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

        {/* Logout Confirmation Alert */}
        <StyledAlert
          visible={showLogoutAlert}
          {...getLogoutConfirmationAlert(
            () => setShowLogoutAlert(false),
            async () => {
              try {
                await signOut(auth);
                setShowLogoutAlert(false);
                router.replace('/');
              } catch (error) {
                console.error('Logout error:', error);
                setShowLogoutAlert(false);
                router.replace('/');
              }
            }
          )}
          onClose={() => setShowLogoutAlert(false)}
        />

      </ScrollView>

      {/* --- BOTTOM NAVIGATION --- */}
      <BottomNavBar activeRoute="/settings" />

    </View>
  );
}

// --- REUSABLE COMPONENTS ---

const SettingItem = ({ icon, label, type, value, status, statusColor, isChecked, onToggle, iconSet, isLast }) => {
    let IconComp = Ionicons;
    if (iconSet === 'MCI') IconComp = MaterialCommunityIcons;
    if (iconSet === 'MI') IconComp = MaterialIcons;

    return (
        <TouchableOpacity 
            style={[styles.settingRow, isLast && styles.noBorder]} 
            activeOpacity={type === 'toggle' ? 1 : 0.7}
            onPress={type === 'toggle' ? () => onToggle(!isChecked) : undefined}
        >
            <View style={styles.rowLeft}>
                <View style={styles.iconContainer}>
                    <IconComp name={icon} size={20} color="#2962FF" />
                </View>
                <Text style={styles.rowLabel}>{label}</Text>
            </View>
            
            <View style={styles.rowRight}>
                {type === 'link' && <Ionicons name="chevron-forward" size={18} color="#555" />}
                
                {type === 'value' && (
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={styles.valueText}>{value}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#555" style={{marginLeft:4}} />
                    </View>
                )}

                {type === 'status' && (
                     <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={[styles.statusText, {color: statusColor}]}>{status}</Text>
                         <Ionicons name="chevron-forward" size={18} color="#555" style={{marginLeft:4}} />
                    </View>
                )}

                {type === 'toggle' && (
                    <Switch
                        trackColor={{ false: "#252525", true: "rgba(41, 98, 255, 0.5)" }}
                        thumbColor={isChecked ? "#2962FF" : "#888"}
                        ios_backgroundColor="#252525"
                        onValueChange={onToggle}
                        value={isChecked}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  
  content: { paddingVertical: 20, paddingBottom: 110 },

  // NEW TOP SECTION
  topSection: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 30 : 40, marginBottom: 30 },
  bigPageTitle: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 20, letterSpacing: 0.5 },
  
  // PROFILE CARD
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

  // SECTION STYLES (Rounded & Floating)
  sectionWrapper: { marginBottom: 25, paddingHorizontal: 20 },
  sectionHeader: { color: '#666', fontSize: 11, fontWeight:'bold', marginBottom: 10, letterSpacing:1 },
  sectionGroup: { backgroundColor: '#1A1A1A', borderRadius: 16, overflow:'hidden', borderWidth: 1, borderColor: '#252525' },

  // SETTING ROW STYLES
  settingRow: {
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
  valueText: { color: '#888', fontSize: 13 },
  statusText: { fontSize: 13, fontWeight:'bold' },

  // LOGOUT BUTTON
  logoutBtn: {
    marginHorizontal: 20, marginTop: 10, marginBottom: 30,
    borderRadius: 16, overflow:'hidden', borderWidth: 1, borderColor: 'rgba(255, 69, 96, 0.3)'
  },
  logoutGradient: { flexDirection:'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
  logoutText: { color: '#FF4560', fontSize: 16, fontWeight: 'bold' },
});
