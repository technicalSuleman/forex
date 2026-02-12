import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { uploadImageToCloudinary } from '../../services/cloudinaryUpload';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
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

const DEFAULT_AVATAR = require('../../../assets/images/user.png');

interface EditProfileScreenProps {
  userName: string;
  userEmail?: string;
  
  avatarUri: string;
  onSave: (name: string, avatar: string) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
}

export default function EditProfileScreen({
  userName,
  userEmail = '',
  avatarUri,
  onSave,
  onClose,
  saving = false,
}: EditProfileScreenProps) {
  const [tempName, setTempName] = useState(userName);
  const [currentAvatar, setCurrentAvatar] = useState<string | number>(avatarUri || DEFAULT_AVATAR);
  const [validationError, setValidationError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setTempName(userName);
    setCurrentAvatar(avatarUri || DEFAULT_AVATAR);
  }, [userName, avatarUri]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });
      return () => backHandler.remove();
    }
  }, [onClose]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos to change profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setValidationError('');
      try {
        setUploading(true);
        setUploadProgress(0);
        const cloudinaryUrl = await uploadImageToCloudinary(
          localUri,
          'avatar.jpg',
          (percent) => setUploadProgress(percent)
        );
        setCurrentAvatar(cloudinaryUrl);
      } catch (err) {
        console.error('Upload failed:', err);
        Alert.alert(
          'Upload Failed',
          err instanceof Error ? err.message : 'Could not upload image. Please try again.'
        );
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleSave = async () => {
    setValidationError('');
    const trimmedName = tempName.trim();

    if (!trimmedName) {
      setValidationError('Please enter your name');
      return;
    }
    if (trimmedName.length < 2) {
      setValidationError('Name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 50) {
      setValidationError('Name must be less than 50 characters');
      return;
    }

    const avatarToSave = typeof currentAvatar === 'string' ? currentAvatar : avatarUri || '';
    await onSave(trimmedName, avatarToSave);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit Profile</Text>

        <TouchableOpacity
          onPress={pickImage}
          style={styles.avatarContainer}
          disabled={uploading}
        >
          <Image
            source={typeof currentAvatar === 'string' ? { uri: currentAvatar } : DEFAULT_AVATAR}
            style={styles.avatar}
          />
          {uploading && (
            <View style={styles.uploadOverlay}>
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.progressText}>{uploadProgress}%</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                </View>
              </View>
            </View>
          )}
          <View style={[styles.cameraIcon, uploading && styles.cameraIconDisabled]}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to change photo</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>DISPLAY NAME</Text>
          <TextInput
            style={[styles.input, validationError ? styles.inputError : null]}
            value={tempName}
            onChangeText={(t) => {
              setTempName(t);
              setValidationError('');
            }}
            placeholder="Enter your name"
            placeholderTextColor="#666"
            autoCapitalize="words"
            maxLength={50}
          />
          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : null}
        </View>

        {userEmail ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL (read-only)</Text>
            <View style={styles.emailRow}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#666" />
              <Text style={styles.emailText}>{userEmail}</Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveBtn, (saving || uploading) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || uploading}
        >
          {saving || uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="content-save" size={20} color="#fff" style={styles.saveIcon} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving || uploading}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#333',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2962FF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#0f0f0f',
  },
  cameraIconDisabled: {
    opacity: 0.5,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  progressBarBg: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2962FF',
    borderRadius: 2,
  },
  avatarHint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#888',
    marginBottom: 8,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#181818',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF4560',
  },
  errorText: {
    color: '#FF4560',
    fontSize: 12,
    marginTop: 6,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252525',
    gap: 10,
  },
  emailText: {
    color: '#888',
    fontSize: 15,
    flex: 1,
  },
  saveBtn: {
    backgroundColor: '#2962FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 15,
  },
});
