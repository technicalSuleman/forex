import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { newsService } from '../../services';
import { updateNewsItem } from '../../store/newsSlice';
import { uploadNewsImage } from '../../services/firebaseStorageUpload';

const PREVIEW_HEIGHT = 180;

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
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  section: { marginBottom: 28 },
  label: { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginBottom: 10, letterSpacing: 0.3 },
  input: {
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  inputMulti: { minHeight: 140, textAlignVertical: 'top', paddingTop: 16 },
  imageSection: { marginBottom: 28 },
  preview: { width: '100%', height: PREVIEW_HEIGHT, borderRadius: 16, backgroundColor: '#1a1a1a', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  changeImageBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
  },
  changeImageText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  submitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default function EditNewsScreen({
  item,
  onBack,
  onSuccess,
}: {
  item: { id: string; title: string; content: string; imageUrl?: string };
  onBack: () => void;
  onSuccess: () => void;
}) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(item?.title ?? '');
  const [content, setContent] = useState(item?.content ?? '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission needed', text2: 'Allow photo library access.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setUploadingImage(true);
      try {
        const url = await uploadNewsImage(result.assets[0].uri);
        setImageUrl(url);
        Toast.show({ type: 'success', text1: 'Image updated' });
      } catch (e: any) {
        Toast.show({ type: 'error', text1: 'Upload failed', text2: e?.message });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const onSubmit = async () => {
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Title and content are required.' });
      return;
    }
    setSubmitting(true);
    try {
      await newsService.updateNews(item.id, {
        title: t,
        content: c,
        imageUrl: imageUrl.trim() || undefined,
      });
      dispatch(updateNewsItem({
        id: item.id,
        title: t,
        content: c,
        imageUrl: imageUrl.trim() || undefined,
        updatedAt: new Date().toISOString(),
      }));
      Toast.show({ type: 'success', text1: 'Updated', text2: 'Post updated.' });
      onSuccess();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to update.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Edit Post</Text>
          <Text style={styles.headerSub}>Update your article</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>TITLE</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Headline" placeholderTextColor="#6b7280" maxLength={200} />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>CONTENT</Text>
          <TextInput style={[styles.input, styles.inputMulti]} value={content} onChangeText={setContent} placeholder="Article content..." placeholderTextColor="#6b7280" multiline maxLength={5000} />
        </View>
        <View style={styles.imageSection}>
          <Text style={styles.label}>COVER IMAGE (optional)</Text>
          {(imageUrl || item?.imageUrl) ? (
            <>
              <View style={styles.preview}>
                <Image source={{ uri: imageUrl || item?.imageUrl }} style={styles.previewImage} resizeMode="cover" />
              </View>
              <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage} disabled={uploadingImage} activeOpacity={0.8}>
                {uploadingImage ? <ActivityIndicator size="small" color="#9ca3af" /> : <MaterialCommunityIcons name="image-edit-outline" size={20} color="#9ca3af" />}
                <Text style={styles.changeImageText}>{uploadingImage ? 'Uploading...' : 'Change cover image'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.preview, { borderWidth: 2, borderStyle: 'dashed', borderColor: '#262626', justifyContent: 'center', alignItems: 'center' }]} onPress={pickImage} disabled={uploadingImage}>
              {uploadingImage ? <ActivityIndicator size="small" color="#6b7280" /> : <MaterialCommunityIcons name="image-plus" size={36} color="#4b5563" />}
              <Text style={[styles.changeImageText, { marginTop: 8 }]}>Add cover image</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={submitting} activeOpacity={0.85}>
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
