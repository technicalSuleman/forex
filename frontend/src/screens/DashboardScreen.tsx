import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { profileService } from '../services';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');
const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/75.jpg';

export default function DashboardScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [avatarUri, setAvatarUri] = useState(DEFAULT_AVATAR);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserName('');
        setAvatarUri(DEFAULT_AVATAR);
        setProfileLoading(false);
        return;
      }
      if (!user.emailVerified) {
        await signOut(auth);
        router.replace('/login');
        return;
      }
      setProfileLoading(true);
      try {
        const profile = await profileService.getUserProfile(user.uid);
          if (profile) {
            setUserName(profile.name || profile.displayName || user.email?.split('@')[0] || 'User');
            setAvatarUri(profile.avatar || DEFAULT_AVATAR);
          } else {
            setUserName(user.email?.split('@')[0] || 'User');
            setAvatarUri(DEFAULT_AVATAR);
          }
        } catch {
          setUserName(user.email?.split('@')[0] || 'User');
          setAvatarUri(DEFAULT_AVATAR);
        } finally {
          setProfileLoading(false);
        }
    });
    return () => unsubscribe();
  }, [router]);

  // --- CHART STATE ---
  const [completedCandles, setCompletedCandles] = useState([
    { type: 'green', h: 40, t: 60, open: 80, close: 40 }, 
    { type: 'green', h: 50, t: 50, open: 70, close: 20 },
    { type: 'green', h: 60, t: 30, open: 60, close: 0 }, 
    { type: 'red', h: 40, t: 50, open: 30, close: 70 },
    { type: 'red', h: 50, t: 60, open: 50, close: 100 },   
    { type: 'red', h: 30, t: 80, open: 70, close: 100 },
    { type: 'green', h: 40, t: 70, open: 90, close: 50 },
  ]);

  const [liveCandle, setLiveCandle] = useState({ type: 'green', h: 5, t: 70, open: 70, close: 70 });
  const [currentPrice, setCurrentPrice] = useState(43353.00);
  const timerRef = useRef(0); 
  const trendRef = useRef('up');

  // Chart Logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) trendRef.current = trendRef.current === 'up' ? 'down' : 'up';
      const isUptrend = trendRef.current === 'up';
      const move = isUptrend ? (Math.random() * 2) : -(Math.random() * 2);
      setCurrentPrice(prev => prev + (move * 5));
      setLiveCandle(prev => {
        let newClose = prev.close - move;
        let newHeight = Math.abs(prev.open - newClose);
        let newTop = newClose < prev.open ? newClose : prev.open; 
        if (newHeight < 2) newHeight = 2;
        if (newHeight > 100) newHeight = 100;
        if (newTop < 10) newTop = 10;
        if (newTop > 130) newTop = 130;
        return { ...prev, type: newClose < prev.open ? 'green' : 'red', h: newHeight, t: newTop, close: newClose };
      });
      timerRef.current += 1;
      if (timerRef.current > 20) { 
        setCompletedCandles(prev => {
           const newHistory = [...prev, liveCandle];
           return newHistory.length > 8 ? newHistory.slice(1) : newHistory;
        });
        setLiveCandle(prev => {
           const midPoint = prev.t + (prev.h / 2);
           return { type: prev.type, h: 2, t: midPoint, open: midPoint, close: midPoint };
        });
        timerRef.current = 0;
      }
    }, 100); 
    return () => clearInterval(interval);
  }, [liveCandle]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* --- UPDATED HEADER (All Info Left, Notif Right) --- */}
      <View style={styles.header}>
        
        {/* LEFT: Profile + Name + Status */}
        <TouchableOpacity 
            style={styles.headerLeft} 
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
        >
            {profileLoading ? (
              <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                <ActivityIndicator size="small" color="#2962FF" />
              </View>
            ) : (
              <Image 
                source={{ uri: avatarUri || DEFAULT_AVATAR }} 
                style={styles.headerAvatar} 
              />
            )}
            <View style={{ marginLeft: 10 }}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.userName}>{userName || 'Loading...'}</Text>
                
                <View style={styles.statusBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.statusText}>System Active</Text>
                </View>
            </View>
        </TouchableOpacity>

        {/* RIGHT: Notification Only */}
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={26} color="#fff" />
            <View style={styles.notifDot} />
        </TouchableOpacity>

      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- APP TITLE --- */}
        <View style={{ marginBottom: 20 }}>
            <Text style={styles.appName}>AI TRADER <Text style={styles.proBadge}>BOT</Text></Text>
        </View>

        {/* --- STATS --- */}
        <View style={styles.statsGrid}>
          <StatCard label="Total Trades" value="254" colors={['#2962FF', '#0039CB']} icon="briefcase" />
          <StatCard label="Win Trades" value="180" colors={['#00E396', '#008F5D']} icon="trending-up" />
          <StatCard label="Loss Trades" value="74" colors={['#FF4560', '#B91C1C']} icon="trending-down" />
          <StatCard label="Accuracy" value="82%" colors={['#775DD0', '#5B21B6']} icon="target" />
        </View>

        {/* --- AUTO SIGNALS --- */}
        <View style={styles.middleSection}>
          <View style={styles.signalsContainer}>
            <View style={styles.sectionHeader}>
               <Ionicons name="flash" size={16} color="#FFD700" />
               <Text style={styles.sectionTitle}>AUTO SIGNALS</Text>
            </View>
            <SignalRow pair="BTC/USDT" type="BUY" time="Live" entry="42,500" sl="41,800" />
            <SignalRow pair="ETH/USDT" type="SELL" time="4m ago" entry="2,250" sl="2,300" />
            <SignalRow pair="SOL/USDT" type="BUY" time="12m ago" entry="98.50" sl="95.00" />
          </View>

          <View style={styles.donutContainer}>
            <Text style={styles.sectionTitle}>PROFIT</Text>
            <View style={styles.donutWrapper}>
              <View style={styles.donutOuter}>
                <View style={styles.donutInner}>
                  <Text style={styles.donutPercent}>+4.2k</Text>
                  <Text style={styles.donutLabel}>USD</Text>
                </View>
              </View>
            </View>
            <View style={styles.sentimentButtons}>
               <View style={[styles.sBtn, {backgroundColor: '#00E396'}]}>
                  <Text style={styles.sBtnText}>Bullish</Text>
                  <Text style={styles.sBtnValue}>65%</Text>
               </View>
               <View style={[styles.sBtn, {backgroundColor: '#FF4560'}]}>
                  <Text style={styles.sBtnText}>Bearish</Text>
                  <Text style={styles.sBtnValue}>35%</Text>
               </View>
            </View>
          </View>
        </View>

        {/* --- LIVE GRAPH --- */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
               <MaterialCommunityIcons name="chart-timeline-variant" size={20} color="#2962FF" />
               <Text style={styles.sectionTitle}>LIVE MARKET (1M)</Text>
            </View>
            <Text style={[styles.livePrice, { color: '#00E396' }]}>
              ${currentPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </Text>
          </View>
          <View style={styles.headerSeparator} />
          <View style={styles.chartBox}>
             <View style={styles.gridContainer}>
                <View style={styles.gridLine} /><View style={styles.gridLine} />
                <View style={styles.gridLine} /><View style={styles.gridLine} />
             </View>
             <View style={styles.candleRow}>
               {completedCandles.map((c, i) => (
                 <View key={i} style={styles.candleWrapper}>
                    <View style={[styles.wick, { 
                      height: c.h + 15, marginTop: c.t - 7.5,
                      backgroundColor: c.type === 'green' ? '#00E396' : '#FF4560' 
                    }]} />
                    <View style={[styles.body, { 
                      height: c.h, marginTop: c.t,
                      backgroundColor: c.type === 'green' ? '#00E396' : '#FF4560'
                    }]} />
                 </View>
               ))}
               <View style={styles.candleWrapper}>
                  <View style={[styles.wick, { 
                    height: liveCandle.h + 15, marginTop: liveCandle.t - 7.5,
                    backgroundColor: liveCandle.type === 'green' ? '#00E396' : '#FF4560',
                    opacity: 0.8 
                  }]} />
                  <View style={[styles.body, { 
                    height: liveCandle.h, marginTop: liveCandle.t,
                    backgroundColor: liveCandle.type === 'green' ? '#00E396' : '#FF4560',
                    borderWidth: 1, borderColor: '#fff'
                  }]} />
               </View>
             </View>
          </View>
        </View>

      </ScrollView>

      {/* --- BOTTOM NAV --- */}
      <BottomNavBar activeRoute="/dashboard" />

    </View>
  );
}

const StatCard = ({ label, value, colors, icon }) => (
  <TouchableOpacity style={styles.statCardContainer} activeOpacity={0.9}>
    <LinearGradient colors={colors} style={styles.statCard} start={{x:0, y:0}} end={{x:1, y:1}}>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color="rgba(255,255,255,0.8)" />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const SignalRow = ({ pair, type, time, entry, sl }) => (
  <View style={styles.signalRow}>
    <View style={{flex: 1}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:2}}>
         <Text style={styles.pairText}>{pair}</Text>
         <Text style={[styles.typeText, { color: type === 'BUY' ? '#00E396' : '#FF4560' }]}>{type}</Text>
      </View>
      <View style={{flexDirection:'row', gap: 10}}>
         <Text style={styles.dataLabel}>Entry: <Text style={styles.dataValue}>{entry}</Text></Text>
         <Text style={styles.dataLabel}>SL: <Text style={styles.dataValue}>{sl}</Text></Text>
      </View>
    </View>
  </View>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scrollContent: { padding: 15, paddingBottom: 110 },
  
  // HEADER
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 45 : 55, paddingBottom: 10
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#2962FF' },
  avatarPlaceholder: { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  welcomeText: { color: '#888', fontSize: 10 },
  userName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  // STATUS BADGE (Moved under Name)
  statusBadge: { 
    flexDirection:'row', alignItems:'center', 
    backgroundColor:'rgba(0, 227, 150, 0.1)', 
    paddingHorizontal: 6, paddingVertical: 2, 
    borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' 
  },
  activeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#00E396', marginRight: 4 },
  statusText: { color: '#00E396', fontSize: 9, fontWeight: 'bold' },

  // NOTIFICATION
  iconBtn: { position: 'relative', padding: 4 },
  notifDot: { position: 'absolute', top: 4, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4560' },
  
  appName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing:1 },
  proBadge: { color: '#2962FF' },

  // STATS
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCardContainer: { width: '48%', marginBottom: 15, borderRadius: 16, elevation: 5, shadowColor:'#000', shadowOpacity:0.3, shadowRadius:5 },
  statCard: { padding: 15, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 100 },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4, textTransform: 'uppercase', fontWeight:'bold' },
  iconBox: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  
  middleSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  signalsContainer: { width: '58%', backgroundColor: '#1E1E1E', borderRadius: 16, padding: 12 },
  sectionHeader: { flexDirection:'row', alignItems:'center', gap:6, marginBottom: 15 },
  sectionTitle: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  signalRow: { marginBottom: 10, paddingBottom: 10, borderBottomWidth:1, borderBottomColor:'#333' },
  pairText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  typeText: { fontSize: 11, fontWeight: 'bold' },
  dataLabel: { color: '#666', fontSize: 9 },
  dataValue: { color: '#bbb', fontWeight:'bold' },
  
  donutContainer: { width: '38%', backgroundColor: '#1E1E1E', borderRadius: 16, padding: 10, alignItems: 'center', justifyContent:'space-between' },
  donutWrapper: { position: 'relative', width: 90, height: 90, alignItems:'center', justifyContent:'center', marginVertical: 10 },
  donutOuter: { width: '100%', height: '100%', borderRadius: 45, borderWidth: 8, borderColor: '#00E396', borderLeftColor: '#FF4560', borderBottomColor: '#00E396', transform: [{rotate: '45deg'}] },
  donutInner: { position:'absolute', top:0, left:0, right:0, bottom:0, alignItems:'center', justifyContent:'center', transform: [{rotate: '-45deg'}] },
  donutPercent: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  donutLabel: { color: '#888', fontSize: 9 },
  
  sentimentButtons: { width: '100%', gap: 6 },
  sBtn: { flexDirection:'row', justifyContent:'space-between', paddingHorizontal:6, paddingVertical:6, borderRadius:4, width:'100%' },
  sBtnText: { color:'#000', fontSize:9, fontWeight:'bold' },
  sBtnValue: { color:'#000', fontSize:9, fontWeight:'bold' },
  
  chartSection: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 15, marginBottom: 20 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }, 
  headerSeparator: { height: 1, backgroundColor: '#333', marginBottom: 15 }, 
  livePrice: { fontSize: 16, fontWeight: 'bold' },
  chartBox: { height: 180, justifyContent: 'center', position: 'relative' },
  gridContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', paddingVertical: 10 },
  gridLine: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }, 
  candleRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', height: '100%', paddingHorizontal: 10, zIndex: 10 }, 
  candleWrapper: { width: 15, height: '100%', alignItems: 'center' },
  wick: { width: 2, position: 'absolute', borderRadius: 2 },
  body: { width: 12, borderRadius: 2 },
});