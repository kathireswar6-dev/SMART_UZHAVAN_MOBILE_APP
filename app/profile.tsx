import { auth, db } from '@/app/firebaseConfig';
import CompactLanguageSelector from '@/components/CompactLanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut, updateProfile, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What was the name of your mother?',
  'What is your favorite sports team?',
  'In what city did your mother and father meet?',
  'What was the name of your favorite childhood friend?',
  'What was the model of your first car?',
  'What year was your father born?',
  'What is the name of the street you grew up on?',
  'What is your favorite movie?',
];

export default function Profile() {
  const router = useRouter();
  const { translate, language } = useLanguage();
  const [ui, setUi] = useState({
    profile: 'Profile',
    fullName: 'Full Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
    location: 'Location',
    accountStatus: 'Account Status',
    memberSince: 'Member Since',
    notSet: 'Not set',
    verified: 'Verified',
    notVerified: 'Not Verified',
    logout: 'Logout',
    editProfile: 'Edit Profile',
    editName: 'Edit Name',
    editPhone: 'Edit Phone',
    editLocation: 'Edit Location',
    emailAddress: 'Email Address',
    emailCannotBeChanged: 'Email cannot be changed',
    enterFullName: 'Enter your full name',
    enterPhone: '+1 (555) 123-4567',
    enterLocation: 'City, State/Province',
    saveChanges: 'Save Changes',
    nameRequired: 'Name is required',
    profilePictureUpdated: 'Profile picture updated!',
    failedPickImage: 'Failed to pick image',
    profileUpdatedSuccessfully: 'Profile updated successfully!',
    failedUpdateProfile: 'Failed to update profile',
    permissionDenied: 'Permission Denied',
    enableLocationPermissions: 'Please enable location permissions to use this feature',
    failedGetLocation: 'Failed to get current location',
    areYouSureLogout: 'Are you sure you want to log out?',
    cancel: 'Cancel',
    success: 'Success',
    error: 'Error',
    unknown: 'Unknown',
    securityQuestion: 'Security Question',
    selectSecurityQuestion: 'Select a security question',
    enterAnswer: 'Enter your answer',
    answerRequired: 'Answer is required',
    questionRequired: 'Please select a security question',
    securityQuestionUpdated: 'Security question updated successfully!',
    failedUpdateSecurityQuestion: 'Failed to update security question',
    setSecurityQuestion: 'Set Security Question',
  });
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [securityQModalOpen, setSecurityQModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [savingSecurityQ, setSavingSecurityQ] = useState(false);

  // Security question state
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');

  // Form state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    location: '',
  });

  useEffect(() => {
    (async () => {
      setUi({
        profile: await translate('Profile'),
        fullName: await translate('Full Name'),
        email: await translate('Email'),
        phoneNumber: await translate('Phone Number'),
        location: await translate('Location'),
        accountStatus: await translate('Account Status'),
        memberSince: await translate('Member Since'),
        notSet: await translate('Not set'),
        verified: await translate('Verified'),
        notVerified: await translate('Not Verified'),
        logout: await translate('Logout'),
        editProfile: await translate('Edit Profile'),
        editName: await translate('Edit Name'),
        editPhone: await translate('Edit Phone'),
        editLocation: await translate('Edit Location'),
        emailAddress: await translate('Email Address'),
        emailCannotBeChanged: await translate('Email cannot be changed'),
        enterFullName: await translate('Enter your full name'),
        enterPhone: '+1 (555) 123-4567',
        enterLocation: await translate('City, State/Province'),
        saveChanges: await translate('Save Changes'),
        nameRequired: await translate('Name is required'),
        profilePictureUpdated: await translate('Profile picture updated!'),
        failedPickImage: await translate('Failed to pick image'),
        profileUpdatedSuccessfully: await translate('Profile updated successfully!'),
        failedUpdateProfile: await translate('Failed to update profile'),
        permissionDenied: await translate('Permission Denied'),
        enableLocationPermissions: await translate('Please enable location permissions to use this feature'),
        failedGetLocation: await translate('Failed to get current location'),
        areYouSureLogout: await translate('Are you sure you want to log out?'),
        cancel: await translate('Cancel'),
        success: await translate('Success'),
        error: await translate('Error'),
        unknown: await translate('Unknown'),
        securityQuestion: await translate('Security Question'),
        selectSecurityQuestion: await translate('Select a security question'),
        enterAnswer: await translate('Enter your answer'),
        answerRequired: await translate('Answer is required'),
        questionRequired: await translate('Please select a security question'),
        securityQuestionUpdated: await translate('Security question updated successfully!'),
        failedUpdateSecurityQuestion: await translate('Failed to update security question'),
        setSecurityQuestion: await translate('Set Security Question'),
      });
    })();
  }, [translate]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth as any, (u) => {
      setUser(u);
      if (u) {
        setFormData({
          displayName: u.displayName || '',
          email: u.email || '',
          phoneNumber: u.phoneNumber || '',
          location: '',
        });
        // Load security question from Firestore
        loadSecurityQuestion(u.uid);
      }
    });
    return unsub;
  }, []);

  const loadSecurityQuestion = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data?.securityQuestion) {
          setCurrentQuestion(data.securityQuestion);
        }
      }
    } catch (error) {
      console.error('Failed to load security question:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && user) {
        setUploadingImage(true);
        const uri = result.assets[0].uri;
        
        // In a real app, upload to Firebase Storage
        // For now, we'll just update the display name as a placeholder
        await updateProfile(user, {
          photoURL: uri,
        });
        
        setUser({ ...user, photoURL: uri } as User);
        Alert.alert(ui.success, ui.profilePictureUpdated);
        setUploadingImage(false);
      }
    } catch {
      Alert.alert(ui.error, ui.failedPickImage);
      setUploadingImage(false);
    }
  };

  const handleEditProfile = async () => {
    if (!user) return;
    
    if (!formData.displayName.trim()) {
      Alert.alert(ui.error, ui.nameRequired);
      return;
    }

    try {
      setLoading(true);
      await updateProfile(user, {
        displayName: formData.displayName,
      });

      setUser({ ...user, displayName: formData.displayName } as User);
      setEditMode(false);
      Alert.alert(ui.success, ui.profileUpdatedSuccessfully);
    } catch (error: any) {
      Alert.alert(ui.error, error?.message ? await translate(error.message) : ui.failedUpdateProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(ui.permissionDenied, ui.enableLocationPermissions);
        setFetchingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      // Reverse geocoding to get readable address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const locationText = [
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
        
        setFormData({ ...formData, location: locationText });
      }
    } catch (error: any) {
      Alert.alert(ui.error, ui.failedGetLocation);
      console.error(error);
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(ui.logout, ui.areYouSureLogout, [
      { text: ui.cancel, style: 'cancel' },
      {
        text: ui.logout,
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth as any);
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('userEmail');
            router.replace('/login');
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const handleSaveSecurityQuestion = async () => {
    if (!selectedQuestion.trim()) {
      Alert.alert(ui.error, ui.questionRequired);
      return;
    }

    if (!securityAnswer.trim()) {
      Alert.alert(ui.error, ui.answerRequired);
      return;
    }

    if (!user) return;

    try {
      setSavingSecurityQ(true);
      // Save to Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: (user.email || '').toLowerCase().trim(),
          securityQuestion: selectedQuestion,
          securityAnswer: securityAnswer.toLowerCase().trim(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setCurrentQuestion(selectedQuestion);
      setSelectedQuestion('');
      setSecurityAnswer('');
      setSecurityQModalOpen(false);
      Alert.alert(ui.success, ui.securityQuestionUpdated);
    } catch (error: any) {
      const errorMsg = error?.message ? await translate(error.message) : ui.failedUpdateSecurityQuestion;
      Alert.alert(ui.error, errorMsg);
    } finally {
      setSavingSecurityQ(false);
    }
  };

  function colorFrom(text?: string) {
    if (!text) return '#81c784';
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h << 5) - h + text.charCodeAt(i);
    const hue = Math.abs(h) % 360;
    return `hsl(${hue} 70% 60%)`;
  }

  function initialsFrom(text?: string) {
    if (!text) return '';
    const parts = text.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  const memberSinceLocale = (() => {
    switch (language) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ml': return 'ml-IN';
      case 'kn': return 'kn-IN';
      default: return 'en-US';
    }
  })();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ui.profile}</Text>
        <View style={styles.headerActions}>
          <CompactLanguageSelector />
          <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
            <Ionicons name="create" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.initialsWrap,
                  { backgroundColor: colorFrom(user?.displayName ?? user?.email ?? '') },
                ]}
              >
                <Text style={styles.initialsText}>
                  {initialsFrom(user?.displayName || user?.email || '')}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Details Cards */}
        <View style={styles.detailsSection}>
          {/* Name Card */}
          <View style={styles.detailCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="person" size={20} color="#1b5e20" />
                <Text style={styles.cardLabel}>{ui.fullName}</Text>
              </View>
              <TouchableOpacity
                style={styles.cardEditBtn}
                onPress={() => {
                  setEditingField('displayName');
                  setEditMode(true);
                }}
              >
                <Ionicons name="pencil" size={18} color="#43a047" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardValue}>{user?.displayName || ui.notSet}</Text>
          </View>

          {/* Email Card */}
          <View style={styles.detailCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="mail" size={20} color="#1b5e20" />
                <Text style={styles.cardLabel}>{ui.email}</Text>
              </View>
              <View style={styles.disabledEditBtn}>
                <Ionicons name="lock-closed" size={18} color="#ccc" />
              </View>
            </View>
            <Text style={styles.cardValue}>{user?.email || ui.notSet}</Text>
          </View>

          {/* Phone Number Card */}
          <View style={styles.detailCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="call" size={20} color="#1b5e20" />
                <Text style={styles.cardLabel}>{ui.phoneNumber}</Text>
              </View>
              <TouchableOpacity
                style={styles.cardEditBtn}
                onPress={() => {
                  setEditingField('phoneNumber');
                  setEditMode(true);
                }}
              >
                <Ionicons name="pencil" size={18} color="#43a047" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardValue}>{formData.phoneNumber || ui.notSet}</Text>
          </View>

          {/* Location Card */}
          <View style={styles.detailCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="location" size={20} color="#1b5e20" />
                <Text style={styles.cardLabel}>{ui.location}</Text>
              </View>
              <TouchableOpacity
                style={styles.cardEditBtn}
                onPress={() => {
                  setEditingField('location');
                  setEditMode(true);
                }}
              >
                <Ionicons name="pencil" size={18} color="#43a047" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardValue}>{formData.location || ui.notSet}</Text>
          </View>

          {/* Account Info */}
          <View style={styles.detailCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="shield-checkmark" size={20} color="#1b5e20" />
                <Text style={styles.cardLabel}>{ui.accountStatus}</Text>
              </View>
              <View style={styles.disabledEditBtn}>
                <Ionicons name="checkmark-circle" size={18} color={user?.emailVerified ? '#43a047' : '#ccc'} />
              </View>
            </View>
            <Text style={styles.cardValue}>
              {user?.emailVerified ? `✓ ${ui.verified}` : `⚠ ${ui.notVerified}`}
            </Text>
          </View>

          {/* Member Since */}
          <View style={styles.detailCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="calendar" size={20} color="#1b5e20" />
                <Text style={styles.cardLabel}>{ui.memberSince}</Text>
              </View>
              <View style={styles.disabledEditBtn}>
                <Ionicons name="calendar" size={18} color="#ccc" />
              </View>
            </View>
            <Text style={styles.cardValue}>
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString(memberSinceLocale)
                : ui.unknown}
            </Text>
          </View>

          {/* Security Question Card */}
          <View style={styles.detailCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="key" size={20} color="#1b5e20" />
                <Text style={styles.cardLabel}>{ui.securityQuestion}</Text>
              </View>
              <TouchableOpacity
                style={styles.cardEditBtn}
                onPress={() => setSecurityQModalOpen(true)}
              >
                <Ionicons name="pencil" size={18} color="#43a047" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardValue} numberOfLines={1}>
              {currentQuestion || ui.notSet}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>{ui.logout}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Security Question Modal */}
      <Modal visible={securityQModalOpen} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setSecurityQModalOpen(false);
              setSelectedQuestion('');
              setSecurityAnswer('');
            }}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{ui.setSecurityQuestion}</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Question Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{ui.selectSecurityQuestion}</Text>
              <View style={styles.pickerContainer}>
                {SECURITY_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.questionOption,
                      selectedQuestion === q && styles.questionOptionSelected,
                    ]}
                    onPress={() => setSelectedQuestion(q)}
                  >
                    <View style={styles.radioButton}>
                      {selectedQuestion === q && <View style={styles.radioButtonSelected} />}
                    </View>
                    <Text
                      style={[
                        styles.questionOptionText,
                        selectedQuestion === q && styles.questionOptionTextSelected,
                      ]}
                    >
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Answer Field */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{ui.enterAnswer}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={ui.enterAnswer}
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
                placeholderTextColor="#999"
                autoCapitalize="sentences"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, savingSecurityQ && { opacity: 0.6 }]}
              onPress={handleSaveSecurityQuestion}
              disabled={savingSecurityQ}
            >
              {savingSecurityQ ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>{ui.saveChanges}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={editMode} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setEditMode(false);
              setEditingField(null);
            }}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingField 
                ? (editingField === 'displayName' ? ui.editName : editingField === 'phoneNumber' ? ui.editPhone : ui.editLocation)
                : ui.editProfile}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Name Field */}
            {(!editingField || editingField === 'displayName') && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{ui.fullName}</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={ui.enterFullName}
                  value={formData.displayName}
                  onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                  placeholderTextColor="#999"
                  autoFocus={editingField === 'displayName'}
                />
              </View>
            )}

            {/* Email Field */}
            {(!editingField || editingField === 'email') && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{ui.emailAddress}</Text>
                <TextInput
                  style={[styles.formInput, styles.disabledInput]}
                  value={formData.email}
                  editable={false}
                  placeholderTextColor="#999"
                />
                <Text style={styles.helperText}>{ui.emailCannotBeChanged}</Text>
              </View>
            )}

            {/* Phone Field */}
            {(!editingField || editingField === 'phoneNumber') && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{ui.phoneNumber}</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={ui.enterPhone}
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                  autoFocus={editingField === 'phoneNumber'}
                />
              </View>
            )}

            {/* Location Field */}
            {(!editingField || editingField === 'location') && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{ui.location}</Text>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    style={styles.locationInput}
                    placeholder={ui.enterLocation}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholderTextColor="#999"
                    autoFocus={editingField === 'location'}
                  />
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleGetCurrentLocation}
                    disabled={fetchingLocation}
                  >
                    {fetchingLocation ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="locate" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleEditProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>{ui.saveChanges}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  editButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  initialsWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  initialsText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#43a047',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#43a047',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardEditBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f8e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledEditBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#81c784',
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b5e20',
    marginLeft: 34,
    marginTop: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#d32f2f',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#d32f2f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    paddingTop: 16,
  },
  modalHeader: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#81c784',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1b5e20',
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#81c784',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1b5e20',
    fontWeight: '500',
  },
  locationButton: {
    backgroundColor: '#43a047',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#43a047',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#43a047',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    shadowColor: '#43a047',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#81c784',
    overflow: 'hidden',
  },
  questionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionOptionSelected: {
    backgroundColor: '#f1f8e9',
  },
  questionOptionText: {
    fontSize: 14,
    color: '#1b5e20',
    fontWeight: '500',
    flex: 1,
  },
  questionOptionTextSelected: {
    fontWeight: '700',
    color: '#2e7d32',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#81c784',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#43a047',
  },
});
