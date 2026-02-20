import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NewsImage } from '../../components/news/NewsImage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { newsService } from '../../services';
import { removeNewsItem, setNewsList } from '../../store/newsSlice';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 58,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f1f1f',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  list: { padding: 20, paddingBottom: 48 },
  card: {
    backgroundColor: '#141414',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#262626',
  },
  cardImage: { width: '100%', height: 120, backgroundColor: '#1a1a1a' },
  cardBody: { padding: 20 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 8, lineHeight: 22 },
  cardMeta: { fontSize: 12, color: '#6b7280', marginBottom: 16, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDanger: { backgroundColor: '#3f1d1d' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#161616', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#262626' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#e5e7eb', marginBottom: 8 },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#141414', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340, borderWidth: 1, borderColor: '#262626' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 10, letterSpacing: -0.3 },
  modalText: { fontSize: 15, color: '#9ca3af', lineHeight: 22, marginBottom: 28 },
  modalRow: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  modalBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  modalBtnCancel: { backgroundColor: '#262626' },
  modalBtnDelete: { backgroundColor: '#dc2626', borderWidth: 1, borderColor: '#ef4444' },
  modalBtnText: { fontSize: 15, fontWeight: '600' },
  modalBtnTextCancel: { color: '#e5e7eb' },
  modalBtnTextDanger: { color: '#fff' },
});

export default function MyPostsScreen({
  onBack,
  onEdit,
}: {
  onBack: () => void;
  onEdit: (item: any) => void;
}) {
  const dispatch = useDispatch();
  const user = useSelector((s: { user?: { userName: string } }) => s.user);
  const authorName = user?.userName ?? '';
  const allNews = useSelector((s: { news: { list: any[] } }) => s.news?.list ?? []);
  const list = allNews.filter((n: any) => (n.author || '').trim() === authorName.trim());

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await newsService.getNews();
      dispatch(setNewsList(Array.isArray(data) ? data : []));
    } catch (e: any) {
      dispatch(setNewsList([]));
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to load posts.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  const didLoad = useRef(false);
  React.useEffect(() => {
    if (allNews.length === 0 && !didLoad.current) {
      didLoad.current = true;
      load();
    }
  }, [allNews.length, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const confirmDelete = (item: any) => setDeleteModal({ id: item.id, title: item.title });
  const cancelDelete = () => setDeleteModal(null);

  const doDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await newsService.deleteNews(deleteModal.id);
      dispatch(removeNewsItem(deleteModal.id));
      Toast.show({ type: 'success', text1: 'Deleted', text2: 'Post removed.' });
      setDeleteModal(null);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to delete.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Posts</Text>
          <Text style={styles.headerSub}>Manage your articles</Text>
        </View>
      </View>

      {loading ? (
        <View style={[styles.list, { justifyContent: 'center', paddingTop: 60 }]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 48, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          showsVerticalScrollIndicator={false}
        >
          {list.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons name="file-document-outline" size={36} color="#6b7280" />
              </View>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Posts you create will appear here. Tap + on the News screen to add one.</Text>
            </View>
          ) : (
            list.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardImage}>
                  <NewsImage uri={item.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cardMeta}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)} activeOpacity={0.8}>
                      <Ionicons name="pencil" size={20} color="#60a5fa" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => confirmDelete(item)} activeOpacity={0.8}>
                      <Ionicons name="trash-outline" size={20} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={!!deleteModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={cancelDelete}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Delete this post?</Text>
              <Text style={styles.modalText} numberOfLines={2}>
                "{deleteModal?.title}" will be permanently removed. This cannot be undone.
              </Text>
              <View style={styles.modalRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={cancelDelete}>
                  <Text style={[styles.modalBtnText, styles.modalBtnTextCancel]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnDelete]}
                  onPress={doDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.modalBtnText, styles.modalBtnTextDanger]}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
