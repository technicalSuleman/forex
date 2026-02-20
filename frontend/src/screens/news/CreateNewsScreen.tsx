import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { newsService } from '../../services';
import { uploadNewsImage } from '../../services/firebaseStorageUpload';
import { addNewsItem } from '../../store/newsSlice';

const PREVIEW_ASPECT = 16 / 9;
const PREVIEW_HEIGHT = 200;

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
  uploadBtn: {
    height: PREVIEW_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#141414',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: { fontSize: 15, fontWeight: '600', color: '#6b7280', marginTop: 10 },
  uploadBtnSub: { fontSize: 12, color: '#4b5563', marginTop: 4 },
  preview: {
    width: '100%',
    height: PREVIEW_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#262626',
  },
  progressBar: { height: '100%', backgroundColor: '#2563eb', borderRadius: 2 },
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
  submitBtnDisabled: { backgroundColor: '#1e3a5f', borderColor: '#262626', opacity: 0.8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default function CreateNewsScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const dispatch = useDispatch();
  const user = useSelector((s: { user?: { userName: string } }) => s.user);
  const author = user?.userName ?? 'User';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const canPublish =
    title.trim().length > 0 && content.trim().length > 0 && selectedImageUri != null;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission needed',
        text2: 'Allow photo library access to add an image.',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => setSelectedImageUri(null);

  const onSubmit = async () => {
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Title and content are required.' });
      return;
    }
    if (!selectedImageUri) {
      Toast.show({ type: 'error', text1: 'Image required', text2: 'Please select an image from your gallery.' });
      return;
    }
    setSubmitting(true);
    setUploadProgress(0);
    try {
      const imageUrl = await uploadNewsImage(selectedImageUri, (percent) => {
        setUploadProgress(percent);
      });
      const created = await newsService.createNews({
        title: t,
        content: c,
        author,
        imageUrl,
      });
      if (created?.id) dispatch(addNewsItem(created));
      Toast.show({ type: 'success', text1: 'Published', text2: 'Your post is live.' });
      onSuccess();
    } catch (e: any) {
      const msg = e?.message || 'Could not publish. Check your connection and try again.';
      Toast.show({ type: 'error', text1: 'Publish failed', text2: msg });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>New Post</Text>
          <Text style={styles.headerSub}>Share news or analysis</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>TITLE</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a clear headline"
            placeholderTextColor="#6b7280"
            maxLength={200}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>CONTENT</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={content}
            onChangeText={setContent}
            placeholder="Write your article or analysis..."
            placeholderTextColor="#6b7280"
            multiline
            maxLength={5000}
          />
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.label}>COVER IMAGE (required)</Text>
          {selectedImageUri ? (
            <View style={styles.preview}>
              <Image source={{ uri: selectedImageUri }} style={styles.previewImage} resizeMode="cover" />
              {!submitting && (
                <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage} activeOpacity={0.8}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              {submitting && uploadProgress > 0 && (
                <View style={styles.progressWrap}>
                  <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} activeOpacity={0.85}>
              <MaterialCommunityIcons name="image-plus" size={40} color="#4b5563" />
              <Text style={styles.uploadBtnText}>Upload Image</Text>
              <Text style={styles.uploadBtnSub}>Tap to choose from gallery</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !canPublish && styles.submitBtnDisabled]}
          onPress={onSubmit}
          disabled={submitting || !canPublish}
          activeOpacity={0.85}
        >
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitText}>
                {uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Publishing...'}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitText}>Publish</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
