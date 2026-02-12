import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  Image,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

// --- MOCK DATA ---
const CATEGORIES = ["All", "BTC/USDT", "EUR/USD", "XAU/USD", "GBP/JPY", "Indices"];

const POSTS = [
  {
    id: 1,
    user: "Usman Trader",
    pair: "EUR / USD",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "Buy from this point for long-term holding. Strong support at 1.0850.",
    sentiment: "bullish",
    time: "2m ago",
    likes: 24
  },
  {
    id: 2,
    user: "Crypto King",
    pair: "BTC / USDT",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    text: "Bitcoin facing heavy resistance at 44k. Expecting a short pullback before the next rally.",
    sentiment: "bearish",
    time: "15m ago",
    likes: 12
  },
  {
    id: 3,
    user: "Sarah Forex",
    pair: "USD / JPY",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "Market is consolidation mode. Wait for breakout above 148.50.",
    sentiment: "neutral",
    time: "1h ago",
    likes: 8
  },
  {
    id: 4,
    user: "Gold Hunter",
    pair: "XAU / USD",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    text: "Gold pumping! Easy 2050 target hit. Trailing stop loss now.",
    sentiment: "bullish",
    time: "2h ago",
    likes: 156
  }
];

export default function NewsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* --- HEADER (Profile Icon Removed) --- */}
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>MARKET SENTIMENT <Text style={styles.headerHighlight}>FEED</Text></Text>
            <Text style={styles.headerSubtitle}>Community Insights & Analysis</Text>
        </View>
      </View>

      {/* --- CATEGORY FILTERS --- */}
      <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 15}}>
              {CATEGORIES.map((cat, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.chip, activeCategory === cat && styles.activeChip]}
                    onPress={() => setActiveCategory(cat)}
                  >
                      <Text style={[styles.chipText, activeCategory === cat && styles.activeChipText]}>{cat}</Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
      </View>

      {/* --- FEED LIST --- */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {POSTS.map((post) => (
              <PostCard key={post.id} data={post} />
          ))}
      </ScrollView>

      {/* --- BOTTOM CREATE POST BAR --- */}
      <View style={styles.createPostContainer}>
          <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera-outline" size={24} color="#2962FF" />
          </TouchableOpacity>
          <TextInput 
            style={styles.input} 
            placeholder="Share your analysis..." 
            placeholderTextColor="#666" 
          />
          <TouchableOpacity style={styles.sendBtn}>
              <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
      </View>

      {/* --- BOTTOM NAVIGATION (Sticky) --- */}
      <BottomNavBar activeRoute="/news" />

    </View>
  );
}

// --- COMPONENTS ---

const PostCard = ({ data }) => {
    // Dynamic Glow Color based on Sentiment
    let glowColor = 'rgba(255, 255, 255, 0.05)'; // Neutral
    let borderColor = '#333';
    
    if (data.sentiment === 'bullish') {
        glowColor = 'rgba(0, 227, 150, 0.15)'; // Green Glow
        borderColor = 'rgba(0, 227, 150, 0.3)';
    } else if (data.sentiment === 'bearish') {
        glowColor = 'rgba(255, 69, 96, 0.15)'; // Red Glow
        borderColor = 'rgba(255, 69, 96, 0.3)';
    }

    return (
        <View style={[styles.card, { backgroundColor: '#1A1A1A', borderColor: borderColor }]}>
            {/* Background Glow Effect */}
            <LinearGradient 
                colors={[glowColor, 'transparent']} 
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                style={styles.cardGlow}
                pointerEvents="none"
            />

            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Image source={{uri: data.avatar}} style={styles.avatar} />
                    <View>
                        <Text style={styles.userName}>{data.user}</Text>
                        <Text style={styles.pairName}>{data.pair}</Text>
                    </View>
                </View>
                <Text style={styles.timeText}>{data.time}</Text>
            </View>

            <Text style={styles.postText}>{data.text}</Text>

            <View style={styles.cardFooter}>
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconAction}>
                        <Ionicons name="thumbs-up-outline" size={18} color="#888" />
                        <Text style={styles.actionText}>{data.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconAction}>
                        <Ionicons name="chatbubble-outline" size={18} color="#888" />
                        <Text style={styles.actionText}>Reply</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity>
                    <Ionicons name="share-social-outline" size={20} color="#888" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  
  // HEADER
  header: {
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingHorizontal: 20, paddingBottom: 15,
    justifyContent: 'center', // Center content vertically if needed, or default
    backgroundColor: '#0f0f0f'
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerHighlight: { color: '#2962FF' },
  headerSubtitle: { color: '#666', fontSize: 10, marginTop: 2 },

  // FILTERS
  filterContainer: { marginBottom: 10, height: 40 },
  chip: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#1E1E1E', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#333' },
  activeChip: { backgroundColor: '#2962FF', borderColor: '#2962FF' },
  chipText: { color: '#888', fontSize: 11, fontWeight: 'bold' },
  activeChipText: { color: '#fff' },

  // FEED LIST
  content: { paddingHorizontal: 15, paddingBottom: 160 },

  // POST CARD
  card: { borderRadius: 16, marginBottom: 15, padding: 15, overflow: 'hidden', borderWidth: 1 },
  cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  pairName: { color: '#888', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  timeText: { color: '#555', fontSize: 10 },
  postText: { color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
  actionRow: { flexDirection: 'row', gap: 20 },
  iconAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: '#888', fontSize: 11 },

  // CREATE POST BAR
  createPostContainer: { 
    position: 'absolute', bottom: 95, left: 15, right: 15, 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#1E1E1E', borderRadius: 25, padding: 5,
    borderWidth: 1, borderColor: '#333',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5
  },
  cameraBtn: { padding: 10 },
  input: { flex: 1, color: '#fff', fontSize: 13, height: 40 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center' },
});
