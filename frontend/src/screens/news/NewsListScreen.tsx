import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { NewsImage } from '../../components/news/NewsImage';
import { newsService } from '../../services';
import { setNewsList, setNewsLoading, setNewsError } from '../../store/newsSlice';

const { width } = Dimensions.get('window');
const CARD_IMAGE_HEIGHT = 160;
const SKELETON_COUNT = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 58,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f1f1f',
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  headerSubtitle: { color: '#6b7280', fontSize: 13, marginTop: 4, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  headerBtnPrimary: { backgroundColor: '#1e3a5f', borderColor: '#2563eb' },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#141414',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#262626',
    ...Platform.select({ android: { elevation: 2 }, ios: {} }),
  },
  cardImage: { width: '100%', height: CARD_IMAGE_HEIGHT, backgroundColor: '#1a1a1a' },
  cardBody: { padding: 20 },
  cardCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1e3a5f',
    marginBottom: 12,
  },
  cardCategoryText: { fontSize: 11, fontWeight: '600', color: '#60a5fa' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 10, lineHeight: 24, letterSpacing: -0.3 },
  cardSummary: { fontSize: 14, color: '#9ca3af', lineHeight: 21, marginBottom: 16 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardAuthorDate: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  skeletonCard: {
    backgroundColor: '#141414',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#262626',
  },
  skeletonImage: { width: '100%', height: CARD_IMAGE_HEIGHT, backgroundColor: '#1a1a1a' },
  skeletonLine: { height: 16, backgroundColor: '#262626', borderRadius: 6, marginBottom: 10 },
  skeletonLineShort: { width: '55%', height: 14, backgroundColor: '#262626', borderRadius: 6, marginTop: 14 },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#9ca3af', textAlign: 'center', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  retryBtn: { backgroundColor: '#2563eb', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  retryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 48, fontSize: 15 },
});

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={[styles.cardBody, { padding: 20 }]}>
        <View style={[styles.skeletonLine, { width: '100%' }]} />
        <View style={[styles.skeletonLine, { width: '88%' }]} />
        <View style={[styles.skeletonLine, { width: '72%' }]} />
        <View style={styles.skeletonLineShort} />
      </View>
    </View>
  );
}

function NewsCard({
  item,
  onPress,
}: {
  item: { id: string; title: string; content?: string; summary?: string; imageUrl?: string; createdAt?: string; author?: string; category?: string; likesCount?: number; commentsCount?: number };
  onPress: () => void;
}) {
  const summary = item.summary || (item.content || '').slice(0, 120) + (item.content && item.content.length > 120 ? '...' : '');
  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const author = item.author || 'Author';
  const likes = item.likesCount ?? 0;
  const comments = item.commentsCount ?? 0;
  const category = item.category || 'General';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.cardImage}>
        <NewsImage uri={item.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardCategory}>
          <Text style={styles.cardCategoryText}>{category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSummary} numberOfLines={2}>{summary}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardAuthorDate}>{author} · {date}</Text>
          <View style={styles.cardStats}>
            <View style={styles.stat}>
              <Ionicons name="heart-outline" size={16} color="#6b7280" />
              <Text style={styles.statText}>{likes}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubble-outline" size={15} color="#6b7280" />
              <Text style={styles.statText}>{comments}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NewsListScreen({
  onSelect,
  onMyPosts,
  onCreate,
}: {
  onSelect: (id: string) => void;
  onMyPosts: () => void;
  onCreate: () => void;
}) {
  const dispatch = useDispatch();
  const list = useSelector((s: { news: { list: any[] } }) => s.news?.list ?? []);
  const loading = useSelector((s: { news: { loading: boolean } }) => s.news?.loading ?? false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) dispatch(setNewsLoading(true));
    else setRefreshing(true);
    dispatch(setNewsError(null));
    try {
      const data = await newsService.getNews();
      dispatch(setNewsList(Array.isArray(data) ? data : []));
    } catch (e: any) {
      const msg = e?.message || 'Failed to load news';
      dispatch(setNewsError(msg));
      dispatch(setNewsList([]));
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally {
      dispatch(setNewsLoading(false));
      setRefreshing(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(() => load(true), [load]);
  const error = useSelector((s: { news: { error: string | null } }) => s.news?.error ?? null);
  const didInitialLoad = useRef(false);

  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    if (list.length > 0) load(true);
    else load();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>News</Text>
          <Text style={styles.headerSubtitle}>Market & analysis</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={onMyPosts} activeOpacity={0.8}>
            <MaterialCommunityIcons name="file-document-multiple-outline" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, styles.headerBtnPrimary]} onPress={onCreate} activeOpacity={0.8}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && list.length === 0 ? (
        <FlatList
          data={Array(SKELETON_COUNT).fill(0)}
          keyExtractor={(_, i) => String(i)}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : error && list.length === 0 ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => load()} style={styles.retryBtn} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard item={item} onPress={() => onSelect(item.id)} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={<Text style={styles.emptyText}>No posts yet.</Text>}
        />
      )}
    </View>
  );
}
