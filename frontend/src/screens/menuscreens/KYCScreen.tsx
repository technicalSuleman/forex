import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { auth } from '../../firebaseConfig';
import { menuService } from '../../services';
import { uploadImageToCloudinary } from '../../services/cloudinaryUpload';

export default function KYCScreen() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  
  // KYC Form Data
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [frontIdImage, setFrontIdImage] = useState(null);
  const [backIdImage, setBackIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const status = await menuService.getKYCStatus(user.uid);
        setKycStatus(status);
      }
    } catch (error) {
      console.error('Error loading KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: 'front' | 'back' | 'selfie') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'selfie' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === 'front') setFrontIdImage(uri);
      else if (type === 'back') setBackIdImage(uri);
      else setSelfieImage(uri);
    }
  };

  const handleSubmitKYC = async () => {
    if (!fullName || !idNumber || !address || !frontIdImage || !backIdImage || !selfieImage) {
      Alert.alert('Incomplete Form', 'Please fill all fields and upload all documents');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Toast.show({ type: 'error', text1: 'You must be logged in' });
      return;
    }

    try {
      setSubmitting(true);
      Toast.show({ type: 'info', text1: 'Uploading documents...' });

      const [frontUrl, backUrl, selfieUrl] = await Promise.all([
        uploadImageToCloudinary(frontIdImage, `kyc-front-${user.uid}.jpg`, undefined, { folder: 'kyc' }),
        uploadImageToCloudinary(backIdImage, `kyc-back-${user.uid}.jpg`, undefined, { folder: 'kyc' }),
        uploadImageToCloudinary(selfieImage, `kyc-selfie-${user.uid}.jpg`, undefined, { folder: 'kyc' }),
      ]);

      const kycData = {
        fullName,
        idNumber,
        address,
        documents: {
          frontId: frontUrl,
          backId: backUrl,
          selfie: selfieUrl,
        },
      };

      await menuService.submitKYC(user.uid, kycData);
      Toast.show({ type: 'success', text1: 'KYC submitted', text2: 'We will review and get back to you.' });
      await loadKYCStatus();
    } catch (error: unknown) {
      console.error('Error submitting KYC:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit KYC documents.';
      Toast.show({ type: 'error', text1: 'Submission failed', text2: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2962FF" />
        </View>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#00E396';
      case 'pending': return '#FFA726';
      case 'rejected': return '#FF4560';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Verified';
      case 'pending': return 'Under Review';
      case 'rejected': return 'Rejected';
      default: return 'Not Submitted';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>KYC Verification</Text>
      <Text style={styles.subtitle}>Verify your identity to unlock all features</Text>

      {/* Status Card */}
      <View style={[styles.statusCard, { borderColor: getStatusColor(kycStatus?.status) }]}>
        <LinearGradient
          colors={[getStatusColor(kycStatus?.status) + '20', getStatusColor(kycStatus?.status) + '10']}
          style={styles.statusGradient}
        >
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons 
              name={kycStatus?.status === 'approved' ? 'check-decagram' : 'clock-outline'} 
              size={24} 
              color={getStatusColor(kycStatus?.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(kycStatus?.status) }]}>
              {getStatusText(kycStatus?.status)}
            </Text>
          </View>
          {kycStatus?.submittedAt && (
            <Text style={styles.statusDate}>
              Submitted: {new Date(kycStatus.submittedAt).toLocaleDateString()}
            </Text>
          )}
        </LinearGradient>
      </View>

      {kycStatus?.status === 'approved' ? (
        <View style={styles.approvedContainer}>
          <MaterialCommunityIcons name="check-circle" size={64} color="#00E396" />
          <Text style={styles.approvedText}>Your account is verified!</Text>
          <Text style={styles.approvedSubtext}>You have full access to all features</Text>
        </View>
      ) : kycStatus?.status === 'pending' ? (
        <View style={styles.pendingContainer}>
          <MaterialCommunityIcons name="clock-outline" size={64} color="#FFA726" />
          <Text style={styles.pendingText}>Under Review</Text>
          <Text style={styles.pendingSubtext}>We're reviewing your documents. This usually takes 1-2 business days.</Text>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Number</Text>
            <TextInput
              style={styles.input}
              value={idNumber}
              onChangeText={setIdNumber}
              placeholder="Enter your ID/Passport number"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your full address"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>

          <Text style={styles.sectionTitle}>Upload Documents</Text>

          <DocumentUpload
            label="ID Card (Front)"
            image={frontIdImage}
            onPress={() => pickImage('front')}
          />

          <DocumentUpload
            label="ID Card (Back)"
            image={backIdImage}
            onPress={() => pickImage('back')}
          />

          <DocumentUpload
            label="Selfie with ID"
            image={selfieImage}
            onPress={() => pickImage('selfie')}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmitKYC}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit for Verification</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const DocumentUpload = ({ label, image, onPress }) => (
  <TouchableOpacity style={styles.uploadCard} onPress={onPress}>
    {image ? (
      <Image source={{ uri: image }} style={styles.uploadedImage} />
    ) : (
      <View style={styles.uploadPlaceholder}>
        <MaterialCommunityIcons name="camera-plus" size={32} color="#666" />
        <Text style={styles.uploadText}>{label}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
  },
  statusCard: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  statusGradient: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusDate: {
    color: '#888',
    fontSize: 12,
    marginLeft: 34,
  },
  approvedContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  approvedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  approvedSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  pendingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  pendingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  pendingSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  uploadText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  submitBtn: {
    backgroundColor: '#2962FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
