import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NewsImage } from '../../components/news/NewsImage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { newsService } from '../../services';
import { updateNewsItem } from '../../store/newsSlice';

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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', flex: 1, letterSpacing: -0.3 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  image: { width: '100%', height: 240, backgroundColor: '#141414' },
  body: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 14, lineHeight: 30, letterSpacing: -0.4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  author: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  date: { fontSize: 13, color: '#6b7280' },
  content: { fontSize: 16, color: '#d1d5db', lineHeight: 26 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 28, marginTop: 28, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#262626' },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  likeText: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  commentsSection: { marginTop: 28, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#262626' },
  commentsTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 16, letterSpacing: -0.3 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#262626', marginRight: 14 },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: 13, color: '#9ca3af', marginBottom: 4, fontWeight: '600' },
  commentText: { fontSize: 15, color: '#d1d5db', lineHeight: 22 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#262626', backgroundColor: '#0a0a0a' },
  input: { flex: 1, backgroundColor: '#141414', borderRadius: 22, paddingHorizontal: 20, paddingVertical: 14, color: '#fff', fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: '#262626' },
  sendBtn: { marginLeft: 12, width: 48, height: 48, borderRadius: 24, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3b82f6' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

type CommentItem = { author: string; text: string; createdAt?: string };

export default function NewsDetailScreen({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const dispatch = useDispatch();
  const user = useSelector((s: { user?: { userId?: string; userName?: string } }) => s.user);
  const userId = user?.userId || 'anonymous';
  const userName = user?.userName || 'You';

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await newsService.getNewsById(id);
      setItem(data);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Could not load news.' });
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const likedBy = item?.likedBy && typeof item.likedBy === 'object' ? item.likedBy : {};
  const liked = !!likedBy[userId];
  const likeCount = typeof item?.likesCount === 'number' ? item.likesCount : 0;
  const comments: CommentItem[] = Array.isArray(item?.comments) ? item.comments : [];

  const onLike = useCallback(async () => {
    if (!id || likeLoading) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLikeLoading(true);
    try {
      const updated = await newsService.likeNews(id, userId);
      setItem((prev: any) => (prev ? { ...prev, ...updated } : null));
      if (updated?.likesCount != null) dispatch(updateNewsItem({ id, likesCount: updated.likesCount }));
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Could not update like.' });
    } finally {
      setLikeLoading(false);
    }
  }, [id, userId, likeLoading]);

  const onSendComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text || !id || commentLoading) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCommentLoading(true);
    setCommentText('');
    try {
      const updated = await newsService.addComment(id, { author: userName, text });
      if (updated) {
        setItem(updated);
        const commentsCount = Array.isArray(updated.comments) ? updated.comments.length : 0;
        dispatch(updateNewsItem({ id, commentsCount }));
      }
      Toast.show({ type: 'success', text1: 'Comment added' });
    } catch (e: any) {
      setCommentText(text);
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Could not add comment.' });
    } finally {
      setCommentLoading(false);
    }
  }, [id, userName, commentText, commentLoading, load]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article</Text>
        </View>
        <View style={styles.loadingWrap}>
          <Text style={{ color: '#6b7280', fontSize: 15 }}>Not found.</Text>
        </View>
      </View>
    );
  }

  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.image}>
          <NewsImage uri={item.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.author}>By {item.author || 'Unknown'}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          <Text style={styles.content}>{item.content || ''}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.likeBtn} onPress={onLike} activeOpacity={0.7} disabled={likeLoading}>
              {likeLoading ? (
                <ActivityIndicator size="small" color="#9ca3af" />
              ) : (
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#ef4444' : '#9ca3af'} />
              )}
              <Text style={styles.likeText}>{likeCount}</Text>
            </TouchableOpacity>
            <View style={styles.likeBtn}>
              <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
              <Text style={styles.likeText}>{comments.length}</Text>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            {comments.map((c, i) => (
              <View key={`${c.createdAt || i}-${i}`} style={styles.commentRow}>
                <View style={styles.commentAvatar} />
                <View style={styles.commentBody}>
                  <Text style={styles.commentAuthor}>{c.author}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Add a comment..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
          blurOnSubmit={false}
          editable={!commentLoading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, commentLoading && { opacity: 0.6 }]}
          onPress={onSendComment}
          activeOpacity={0.8}
          disabled={commentLoading || !commentText.trim()}
        >
          {commentLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-up" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
