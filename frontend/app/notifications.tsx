import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import StyledAlert from '../src/components/StyledAlert';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, off, push, set } from 'firebase/database';
import { auth, database } from '../src/firebaseConfig';
import {
  getSBIAlertSuccessAlert,
  getSBIAlertErrorAlert,
  getISMAAlertSuccessAlert,
  getISMAAlertErrorAlert,
} from '../src/services/alerts';

const { width } = Dimensions.get('window');

const CATEGORIES = ["All", "SBI Alerts", "ISMA Alerts", "System", "Trade", "Security"];

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [notificationAlert, setNotificationAlert] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>,
  });

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch notifications from Firebase
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const notificationsRef = ref(database, `notifications/${userId}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA;
        });
        setNotifications(notificationsList);
      } else {
        // If no notifications, add default SBI alerts
        initializeDefaultSBIAlerts(userId);
        setNotifications([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => {
      off(notificationsRef);
    };
  }, [userId]);

  // Initialize default SBI and ISMA alerts
  const initializeDefaultSBIAlerts = async (uid: string) => {
    const defaultSBIAlerts = [
      {
        type: 'sbi',
        title: 'SBI Alert: BTC/USDT',
        desc: 'Smart Buy Indicator detected strong bullish signal. Entry: $43,500 | Target: $45,000 | Stop Loss: $42,800',
        timestamp: new Date().toISOString(),
        read: false,
        icon: 'trending-up',
        color: '#00E396',
        pair: 'BTC/USDT',
        entry: '43,500',
        target: '45,000',
        stopLoss: '42,800',
        signal: 'BUY'
      },
      {
        type: 'sbi',
        title: 'SBI Alert: ETH/USDT',
        desc: 'Smart Buy Indicator shows potential reversal. Entry: $2,250 | Target: $2,400 | Stop Loss: $2,180',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        icon: 'trending-up',
        color: '#2962FF',
        pair: 'ETH/USDT',
        entry: '2,250',
        target: '2,400',
        stopLoss: '2,180',
        signal: 'BUY'
      }
    ];

    const defaultISMAAlerts = [
      {
        type: 'isma',
        title: 'ISMA Alert: BTC/USDT',
        desc: 'Ichimoku Smart Moving Average crossover detected. Entry: $43,200 | Target: $44,800 | Stop Loss: $42,500',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false,
        icon: 'chart-line',
        color: '#775DD0',
        pair: 'BTC/USDT',
        entry: '43,200',
        target: '44,800',
        stopLoss: '42,500',
        signal: 'BUY',
        cloudStatus: 'Above Cloud'
      },
      {
        type: 'isma',
        title: 'ISMA Alert: SOL/USDT',
        desc: 'Ichimoku indicator shows bullish momentum. Entry: $98.50 | Target: $105.00 | Stop Loss: $95.00',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        icon: 'chart-line',
        color: '#FFD700',
        pair: 'SOL/USDT',
        entry: '98.50',
        target: '105.00',
        stopLoss: '95.00',
        signal: 'BUY',
        cloudStatus: 'In Cloud'
      }
    ];

    try {
      for (const alert of [...defaultSBIAlerts, ...defaultISMAAlerts]) {
        await push(ref(database, `notifications/${uid}`), alert);
      }
    } catch (error) {
      console.error('Error initializing alerts:', error);
    }
  };

  // Generate SBI Alert
  const generateSBIAlert = async () => {
    if (!userId) return;

    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];
    const signals = ['BUY', 'SELL'];
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    const randomSignal = signals[Math.floor(Math.random() * signals.length)];
    
    const basePrice = Math.floor(Math.random() * 50000) + 20000;
    const entry = basePrice.toLocaleString();
    const target = randomSignal === 'BUY' 
      ? (basePrice * 1.05).toLocaleString() 
      : (basePrice * 0.95).toLocaleString();
    const stopLoss = randomSignal === 'BUY'
      ? (basePrice * 0.98).toLocaleString()
      : (basePrice * 1.02).toLocaleString();

    const newAlert = {
      type: 'sbi',
      title: `SBI Alert: ${randomPair}`,
      desc: `Smart Buy Indicator detected ${randomSignal === 'BUY' ? 'strong bullish' : 'bearish'} signal. Entry: $${entry} | Target: $${target} | Stop Loss: $${stopLoss}`,
      timestamp: new Date().toISOString(),
      read: false,
      icon: randomSignal === 'BUY' ? 'trending-up' : 'trending-down',
      color: randomSignal === 'BUY' ? '#00E396' : '#FF4560',
      pair: randomPair,
      entry: entry,
      target: target,
      stopLoss: stopLoss,
      signal: randomSignal
    };

    try {
      await push(ref(database, `notifications/${userId}`), newAlert);
      const successAlert = getSBIAlertSuccessAlert(() => setNotificationAlert(prev => ({ ...prev, visible: false })));
      setNotificationAlert({
        visible: true,
        ...successAlert,
      });
    } catch (error) {
      console.error('Error generating SBI alert:', error);
      const errorAlert = getSBIAlertErrorAlert(() => setNotificationAlert(prev => ({ ...prev, visible: false })));
      setNotificationAlert({
        visible: true,
        ...errorAlert,
      });
    }
  };

  // Generate ISMA Alert
  const generateISMAAlert = async () => {
    if (!userId) return;

    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT'];
    const signals = ['BUY', 'SELL'];
    const cloudStatuses = ['Above Cloud', 'In Cloud', 'Below Cloud'];
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    const randomSignal = signals[Math.floor(Math.random() * signals.length)];
    const randomCloud = cloudStatuses[Math.floor(Math.random() * cloudStatuses.length)];
    
    const basePrice = Math.floor(Math.random() * 50000) + 20000;
    const entry = basePrice.toLocaleString();
    const target = randomSignal === 'BUY' 
      ? (basePrice * 1.06).toLocaleString() 
      : (basePrice * 0.94).toLocaleString();
    const stopLoss = randomSignal === 'BUY'
      ? (basePrice * 0.97).toLocaleString()
      : (basePrice * 1.03).toLocaleString();

    const newAlert = {
      type: 'isma',
      title: `ISMA Alert: ${randomPair}`,
      desc: `Ichimoku Smart Moving Average ${randomSignal === 'BUY' ? 'bullish' : 'bearish'} crossover detected. ${randomCloud}. Entry: $${entry} | Target: $${target} | Stop Loss: $${stopLoss}`,
      timestamp: new Date().toISOString(),
      read: false,
      icon: 'chart-line',
      color: randomSignal === 'BUY' ? '#775DD0' : '#FF6B6B',
      pair: randomPair,
      entry: entry,
      target: target,
      stopLoss: stopLoss,
      signal: randomSignal,
      cloudStatus: randomCloud
    };

    try {
      await push(ref(database, `notifications/${userId}`), newAlert);
      const successAlert = getISMAAlertSuccessAlert(() => setNotificationAlert(prev => ({ ...prev, visible: false })));
      setNotificationAlert({
        visible: true,
        ...successAlert,
      });
    } catch (error) {
      console.error('Error generating ISMA alert:', error);
      const errorAlert = getISMAAlertErrorAlert(() => setNotificationAlert(prev => ({ ...prev, visible: false })));
      setNotificationAlert({
        visible: true,
        ...errorAlert,
      });
    }
  };

  // Generate random alert (SBI or ISMA)
  const generateRandomAlert = async () => {
    const alertTypes = ['sbi', 'isma'];
    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    if (randomType === 'sbi') {
      await generateSBIAlert();
    } else {
      await generateISMAAlert();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic is handled by the onValue listener
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === "All" 
    ? notifications 
    : activeTab === "SBI Alerts"
    ? notifications.filter(n => n.type === 'sbi')
    : activeTab === "ISMA Alerts"
    ? notifications.filter(n => n.type === 'isma')
    : notifications.filter(n => n.type === activeTab.toLowerCase());

  // Format time
  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={generateSBIAlert}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#00E396" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={generateISMAAlert}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#775DD0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- FILTER TABS --- */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
            {CATEGORIES.map((cat, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={[styles.tab, activeTab === cat && styles.activeTab]}
                    onPress={() => setActiveTab(cat)}
                >
                    <Text style={[styles.tabText, activeTab === cat && styles.activeTabText]}>{cat}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* --- NOTIFICATION LIST --- */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2962FF" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2962FF" />
          }
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell-off-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>No notifications found</Text>
              <Text style={styles.emptySubText}>Tap icons to generate SBI or ISMA alerts</Text>
            </View>
          ) : (
            filteredNotifications.map((item) => (
              <NotificationCard key={item.id} data={item} formatTime={formatTime} />
            ))
          )}
          <View style={{height: 100}} /> 
        </ScrollView>
      )}

      {/* Notification Alert */}
      <StyledAlert
        visible={notificationAlert.visible}
        type={notificationAlert.type}
        title={notificationAlert.title}
        message={notificationAlert.message}
        buttons={notificationAlert.buttons}
        onClose={() => setNotificationAlert(prev => ({ ...prev, visible: false }))}
      />

    </View>
  );
}

// --- CARD COMPONENT ---
const NotificationCard = ({ data, formatTime }) => {
  const isSBI = data.type === 'sbi';
  const isISMA = data.type === 'isma';
  
  return (
    <TouchableOpacity style={[styles.card, !data.read && styles.unreadCard]} activeOpacity={0.8}>
        <View style={[styles.iconBox, {backgroundColor: `${data.color || '#2962FF'}20`}]}> 
            <MaterialCommunityIcons name={data.icon || 'bell-outline'} size={24} color={data.color || '#2962FF'} />
        </View>
        
        <View style={styles.cardContent}>
            <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{data.title}</Text>
                <Text style={styles.timeText}>{formatTime ? formatTime(data.timestamp) : data.time || 'Just now'}</Text>
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>{data.desc}</Text>
            
            {/* SBI Alert Details */}
            {isSBI && data.signal && (
              <View style={styles.sbiDetails}>
                <View style={[styles.sbiBadge, { backgroundColor: data.signal === 'BUY' ? '#00E39620' : '#FF456020' }]}>
                  <Text style={[styles.sbiSignal, { color: data.signal === 'BUY' ? '#00E396' : '#FF4560' }]}>
                    {data.signal}
                  </Text>
                </View>
                {data.entry && (
                  <View style={styles.sbiInfo}>
                    <Text style={styles.sbiLabel}>Entry: <Text style={styles.sbiValue}>${data.entry}</Text></Text>
                    {data.target && <Text style={styles.sbiLabel}>Target: <Text style={styles.sbiValue}>${data.target}</Text></Text>}
                    {data.stopLoss && <Text style={styles.sbiLabel}>SL: <Text style={styles.sbiValue}>${data.stopLoss}</Text></Text>}
                  </View>
                )}
              </View>
            )}

            {/* ISMA Alert Details */}
            {isISMA && data.signal && (
              <View style={styles.sbiDetails}>
                <View style={[styles.sbiBadge, { backgroundColor: data.signal === 'BUY' ? '#775DD020' : '#FF6B6B20' }]}>
                  <Text style={[styles.sbiSignal, { color: data.signal === 'BUY' ? '#775DD0' : '#FF6B6B' }]}>
                    {data.signal} - ISMA
                  </Text>
                </View>
                {data.cloudStatus && (
                  <Text style={[styles.sbiLabel, { marginBottom: 6 }]}>
                    Cloud: <Text style={[styles.sbiValue, { color: '#775DD0' }]}>{data.cloudStatus}</Text>
                  </Text>
                )}
                {data.entry && (
                  <View style={styles.sbiInfo}>
                    <Text style={styles.sbiLabel}>Entry: <Text style={styles.sbiValue}>${data.entry}</Text></Text>
                    {data.target && <Text style={styles.sbiLabel}>Target: <Text style={styles.sbiValue}>${data.target}</Text></Text>}
                    {data.stopLoss && <Text style={styles.sbiLabel}>SL: <Text style={styles.sbiValue}>${data.stopLoss}</Text></Text>}
                  </View>
                )}
              </View>
            )}
        </View>

        {!data.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  
  // HEADER
  header: {
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingHorizontal: 20, paddingBottom: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1, borderBottomColor: '#1A1A1A'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  iconBtn: { padding: 5 },

  // TABS
  tabContainer: { marginVertical: 15 },
  tab: { 
    paddingHorizontal: 20, paddingVertical: 8, 
    borderRadius: 20, marginRight: 10, 
    backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333' 
  },
  activeTab: { backgroundColor: '#2962FF', borderColor: '#2962FF' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#fff' },

  // LIST
  content: { paddingHorizontal: 20 },

  // CARD
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#1A1A1A', borderRadius: 12,
    padding: 15, marginBottom: 12,
    borderWidth: 1, borderColor: '#252525'
  },
  unreadCard: { backgroundColor: '#1E1E24', borderColor: '#333' }, // Slightly lighter for unread
  
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 10 },
  timeText: { color: '#666', fontSize: 10, marginTop: 2 },
  cardDesc: { color: '#aaa', fontSize: 12, lineHeight: 18 },

  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2962FF', marginTop: 5, marginLeft: 5 },
  
  // SBI Alert Styles
  sbiDetails: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#333' },
  sbiBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  sbiSignal: { fontSize: 11, fontWeight: 'bold' },
  sbiInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sbiLabel: { color: '#666', fontSize: 10 },
  sbiValue: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  
  // Loading & Empty States
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 15 },
  emptySubText: { color: '#666', fontSize: 12, marginTop: 5 }
});