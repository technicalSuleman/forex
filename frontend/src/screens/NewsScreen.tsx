import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import BottomNavBar from '../components/BottomNavBar';
import { newsService } from '../services';

const CATEGORIES = ['All', 'BTC/USDT', 'EUR/USD', 'XAU/USD', 'GBP/JPY', 'Indices'];

function formatTimeAgo(isoDate: string) {
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  if (diffM < 60) return `${diffM}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

export default function NewsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [posts, setPosts] = useState<Array<{
    id: string;
    user: string;
    pair?: string;
    text: string;
    sentiment?: string;
    createdAt: string;
    likes?: number;
    avatar?: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postText, setPostText] = useState('');
  const [postPair, setPostPair] = useState('');

  const loadNews = useCallback(async () => {
    try {
      const data = await newsService.getNews(activeCategory === 'All' ? undefined : activeCategory);
      setPosts(data);
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Failed to load feed' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    setLoading(true);
    loadNews();
  }, [loadNews]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

  const handleSendPost = async () => {
    const text = postText.trim();
    if (!text) return;
    try {
      setPosting(true);
      await newsService.addPost({
        pair: postPair.trim() || 'General',
        text,
        sentiment: 'neutral',
      });
      setPostText('');
      setPostPair('');
      Toast.show({ type: 'success', text1: 'Posted' });
      loadNews();
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Failed to post' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            MARKET SENTIMENT <Text style={styles.headerHighlight}>FEED</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Community Insights & Analysis</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeCategory === cat && styles.activeChip]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2962FF" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2962FF" />}
        >
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={64} color="#444" />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Share your first analysis above</Text>
            </View>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                data={{
                  ...post,
                  time: formatTimeAgo(post.createdAt),
                  likes: post.likes ?? 0,
                  avatar: post.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
                }}
              />
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.createPostContainer}>
        <TextInput
          style={styles.pairInput}
          placeholder="Pair (e.g. EUR/USD)"
          placeholderTextColor="#666"
          value={postPair}
          onChangeText={setPostPair}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Share your analysis..."
            placeholderTextColor="#666"
            value={postText}
            onChangeText={setPostText}
          />
          <TouchableOpacity
            style={[styles.sendBtn, posting && styles.sendBtnDisabled]}
            onPress={handleSendPost}
            disabled={posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <BottomNavBar activeRoute="/news" />
    </View>
  );
}

const PostCard = ({
  data,
}: {
  data: {
    user: string;
    pair?: string;
    avatar: string;
    text: string;
    sentiment?: string;
    time: string;
    likes: number;
  };
}) => {
  let glowColor = 'rgba(255, 255, 255, 0.05)';
  let borderColor = '#333';
  if (data.sentiment === 'bullish') {
    glowColor = 'rgba(0, 227, 150, 0.15)';
    borderColor = 'rgba(0, 227, 150, 0.3)';
  } else if (data.sentiment === 'bearish') {
    glowColor = 'rgba(255, 69, 96, 0.15)';
    borderColor = 'rgba(255, 69, 96, 0.3)';
  }

  return (
    <View style={[styles.card, { backgroundColor: '#1A1A1A', borderColor }]}>
      <LinearGradient
        colors={[glowColor, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGlow}
        pointerEvents="none"
      />
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: data.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{data.user}</Text>
            <Text style={styles.pairName}>{data.pair || 'General'}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: {
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerHighlight: { color: '#2962FF' },
  headerSubtitle: { color: '#666', fontSize: 10, marginTop: 2 },
  filterContainer: { marginBottom: 10, height: 40 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeChip: { backgroundColor: '#2962FF', borderColor: '#2962FF' },
  chipText: { color: '#888', fontSize: 11, fontWeight: 'bold' },
  activeChipText: { color: '#fff' },
  content: { paddingHorizontal: 15, paddingBottom: 160 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#888', fontSize: 16, marginTop: 12 },
  emptySubtext: { color: '#555', fontSize: 12, marginTop: 4 },
  card: { borderRadius: 16, marginBottom: 15, padding: 15, overflow: 'hidden', borderWidth: 1 },
  cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  pairName: { color: '#888', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  timeText: { color: '#555', fontSize: 10 },
  postText: { color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 15 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },
  actionRow: { flexDirection: 'row', gap: 20 },
  iconAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: '#888', fontSize: 11 },
  createPostContainer: {
    position: 'absolute',
    bottom: 95,
    left: 15,
    right: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 25,
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pairInput: {
    color: '#fff',
    fontSize: 11,
    height: 28,
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, color: '#fff', fontSize: 13, height: 40, paddingHorizontal: 12 },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2962FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.6 },
});
