import { auth, db } from '@/app/firebaseConfig';
import CompactLanguageSelector from '@/components/CompactLanguageSelector';
import { Button, Input } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { translate, language, setLanguage } = useLanguage();
  const params = useLocalSearchParams<{ lang?: string }>();
  const [form, setForm] = useState({ email: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [languageReady, setLanguageReady] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<'email' | 'security'>('email');
  const [securityQModalOpen, setSecurityQModalOpen] = useState(false);
  const [securityQForm, setSecurityQForm] = useState({
    email: '',
    securityAnswer: '',
  });
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [ui, setUi] = useState({
    login: 'Login',
    email: 'Email or phone number',
    password: 'Password',
    forgot: 'Forgot password?',
    createAccount: 'Create new account',
    title: 'Smart Uzhavan',
    subtitle: 'AI-Based Crop Disease Prediction and Management System',
    welcomeBack: 'Welcome back',
    noAccount: "Don't have an account?",
    success: 'Success',
    loginSuccessful: 'Login successful!',
    loginFailedTitle: 'Error',
    loginFailed: 'Login failed',
    enterEmailForReset: 'Enter your email to reset password.',
    resetEmailSent: 'Password reset email sent. Please check your inbox.',
    resetFailed: 'Failed to send reset email.',
    securityQuestionRecovery: 'Reset with Security Question',
    emailRecovery: 'Reset with Email',
    lookupSecurityQuestion: 'Look Up Security Question',
    verifyAndSendLink: 'Verify and Send Reset Link',
    enterSecurityEmail: 'Enter your email to verify with security question',
    userNotFound: 'User not found',
    noSecurityQuestion: 'No security question set. Please use email reset.',
    securityAnswerIncorrect: 'Security answer is incorrect',
    enterSecurityAnswer: 'Enter the security answer',
    securityAnswerPlaceholder: 'Your answer',
    securityVerifiedResetSent: 'Security answer verified. Password reset email sent. Please check your inbox.',
    failedResetPassword: 'Failed to reset password',
    enterEmailPrompt: 'Please enter your email',
    enterValidEmail: 'Please enter a valid email address',
    recoveryHelpEmail: 'Use your account email to receive a reset link instantly.',
    recoveryHelpSecurity: 'Verify your security answer to receive a password reset link.',
  });

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const requestedLanguage = typeof params.lang === 'string' ? params.lang : undefined;
        const storedLanguage = await AsyncStorage.getItem('preferredLanguage');
        const nextLanguage = requestedLanguage || storedLanguage;

        if (nextLanguage && nextLanguage !== language) {
          await setLanguage(nextLanguage);
        }
      } catch (err) {
        console.warn('Failed to initialize login language', err);
      } finally {
        if (isMounted) setLanguageReady(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language, params.lang, setLanguage]);

  React.useEffect(() => {
    if (!languageReady) return;

    let isMounted = true;

    (async () => {
      const localizedUi = {
        login: await translate('Login'),
        email: await translate('Email or phone number'),
        password: await translate('Password'),
        forgot: await translate('Forgot password?'),
        createAccount: await translate('Create new account'),
        title: await translate('Smart Uzhavan'),
        subtitle: await translate('AI-Based Crop Disease Prediction and Management System'),
        welcomeBack: await translate('Welcome back'),
        noAccount: await translate("Don't have an account?"),
        success: await translate('Success'),
        loginSuccessful: await translate('Login successful!'),
        loginFailedTitle: await translate('Error'),
        loginFailed: await translate('Login failed'),
        enterEmailForReset: await translate('Enter your email to reset password.'),
        resetEmailSent: await translate('Password reset email sent. Please check your inbox.'),
        resetFailed: await translate('Failed to send reset email.'),
        securityQuestionRecovery: await translate('Reset with Security Question'),
        emailRecovery: await translate('Reset with Email'),
        lookupSecurityQuestion: await translate('Look Up Security Question'),
        verifyAndSendLink: await translate('Verify and Send Reset Link'),
        enterSecurityEmail: await translate('Enter your email to verify with security question'),
        userNotFound: await translate('User not found'),
        noSecurityQuestion: await translate('No security question set. Please use email reset.'),
        securityAnswerIncorrect: await translate('Security answer is incorrect'),
        enterSecurityAnswer: await translate('Enter the security answer'),
        securityAnswerPlaceholder: await translate('Your answer'),
        securityVerifiedResetSent: await translate('Security answer verified. Password reset email sent. Please check your inbox.'),
        failedResetPassword: await translate('Failed to reset password'),
        enterEmailPrompt: await translate('Please enter your email'),
        enterValidEmail: await translate('Please enter a valid email address'),
        recoveryHelpEmail: await translate('Use your account email to receive a reset link instantly.'),
        recoveryHelpSecurity: await translate('Verify your security answer to receive a password reset link.'),
      };

      if (isMounted) setUi(localizedUi);
    })();

    return () => {
      isMounted = false;
    };
  }, [translate, languageReady]);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleLogin = async () => {
    setError('');
    const email = form.email.trim().toLowerCase();

    if (!email) {
      Alert.alert(ui.loginFailedTitle, ui.enterEmailForReset);
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(ui.loginFailedTitle, ui.enterValidEmail);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth as any, email, form.password);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userEmail', email);
      Alert.alert(ui.success, ui.loginSuccessful);
      router.replace('/home' as any);
    } catch (err: any) {
      const translatedError = err?.message ? await translate(err.message) : ui.loginFailed;
      setError(translatedError || ui.loginFailed);
      Alert.alert(ui.loginFailedTitle, translatedError || ui.loginFailed);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.email.trim().toLowerCase();

    if (!email) {
      Alert.alert(ui.loginFailedTitle, ui.enterEmailForReset);
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(ui.loginFailedTitle, ui.enterValidEmail);
      return;
    }

    try {
      await sendPasswordResetEmail(auth as any, email);
      Alert.alert(ui.success, ui.resetEmailSent);
    } catch (err: any) {
      const translatedError = err?.message ? await translate(err.message) : ui.resetFailed;
      Alert.alert(ui.loginFailedTitle, translatedError || ui.resetFailed);
    }
  };

  const handleSecurityQuestionRecovery = async () => {
    const email = securityQForm.email.trim();

    if (!email) {
      Alert.alert(ui.loginFailedTitle, ui.enterEmailPrompt);
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(ui.loginFailedTitle, ui.enterValidEmail);
      return;
    }

    try {
      setRecoveryBusy(true);
      const normalizedEmail = email.toLowerCase();
      setSecurityQuestion('');
      setSecurityQForm((prev) => ({ ...prev, securityAnswer: '' }));
      let userData: any = null;

      // Primary lookup by stored email field.
      const usersRef = collection(db, 'users');
      const byEmail = await getDocs(query(usersRef, where('email', '==', normalizedEmail)));
      if (!byEmail.empty) {
        userData = byEmail.docs[0].data();
      } else {
        // Fallback for legacy docs keyed by email.
        const legacyDoc = await getDoc(doc(db, 'users', normalizedEmail));
        if (legacyDoc.exists()) {
          userData = legacyDoc.data();
        }
      }

      if (!userData) {
        Alert.alert(ui.loginFailedTitle, ui.userNotFound);
        return;
      }

      if (!userData?.securityQuestion) {
        Alert.alert(ui.loginFailedTitle, ui.noSecurityQuestion);
        return;
      }

      setSecurityQuestion(userData.securityQuestion);
    } catch (error: any) {
      Alert.alert(ui.loginFailedTitle, ui.userNotFound);
    } finally {
      setRecoveryBusy(false);
    }
  };

  const handleVerifySecurityAnswer = async () => {
    const email = securityQForm.email.trim().toLowerCase();

    if (!email) {
      Alert.alert(ui.loginFailedTitle, ui.enterEmailPrompt);
      return;
    }

    if (!securityQForm.securityAnswer.trim()) {
      Alert.alert(ui.loginFailedTitle, ui.enterSecurityAnswer);
      return;
    }

    try {
      setRecoveryBusy(true);
      let userData: any = null;

      const usersRef = collection(db, 'users');
      const byEmail = await getDocs(query(usersRef, where('email', '==', email)));
      if (!byEmail.empty) {
        userData = byEmail.docs[0].data();
      } else {
        const legacyDoc = await getDoc(doc(db, 'users', email));
        if (legacyDoc.exists()) {
          userData = legacyDoc.data();
        }
      }

      if (!userData) {
        Alert.alert(ui.loginFailedTitle, ui.userNotFound);
        return;
      }

      if ((userData?.securityAnswer || '') !== securityQForm.securityAnswer.toLowerCase().trim()) {
        Alert.alert(ui.loginFailedTitle, ui.securityAnswerIncorrect);
        return;
      }

      await sendPasswordResetEmail(auth as any, email);
      Alert.alert(ui.success, ui.securityVerifiedResetSent);

      setSecurityQModalOpen(false);
      setSecurityQuestion('');
      setRecoveryMode('email');
      setSecurityQForm({ email: '', securityAnswer: '' });
    } catch (e: any) {
      const translatedError = e?.message ? await translate(e.message) : ui.failedResetPassword;
      Alert.alert(ui.loginFailedTitle, translatedError || ui.failedResetPassword);
    } finally {
      setRecoveryBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.decorativeBlobLarge} />
        <View style={styles.decorativeBlobSmall} />

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.root}>
            <View style={styles.languageSelectorRow}>
              <CompactLanguageSelector />
            </View>

            <View style={styles.hero}>
              <Text style={styles.kicker}>{ui.welcomeBack}</Text>
              <Text style={styles.title}>{ui.title}</Text>
              <Text style={styles.subtitle}>{ui.subtitle}</Text>
            </View>

            <View style={styles.container}>
              <View style={styles.card}>
                <Text style={styles.heading}>{ui.login}</Text>

                <Input
                  icon="mail-outline"
                  placeholder={ui.email}
                  value={form.email}
                  onChangeText={(t) => setForm({ ...form, email: t })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <View style={styles.passwordRow}>
                  <Input
                    icon="lock-closed-outline"
                    placeholder={ui.password}
                    value={form.password}
                    onChangeText={(t) => setForm({ ...form, password: t })}
                    secureTextEntry={!passwordVisible}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)} style={styles.eyeBtn}>
                    <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={18} color="#6B9E4A" />
                  </TouchableOpacity>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.forgotRow}
                  onPress={() => setSecurityQModalOpen(true)}
                >
                  <Text style={styles.forgotLink}>{ui.forgot}</Text>
                </TouchableOpacity>

                <Button title={ui.login} onPress={handleLogin} style={{ marginTop: 12 }} />

                <View style={styles.bottomRow}>
                  <Text style={styles.smallText}>{ui.noAccount}</Text>
                  <TouchableOpacity onPress={() => router.push('/register' as any)}>
                    <Text style={styles.loginLink}>{ui.createAccount}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Password Recovery Modal */}
        <Modal visible={securityQModalOpen} animationType="slide" transparent={true}>
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setSecurityQModalOpen(false);
                  setRecoveryMode('email');
                  setSecurityQuestion('');
                  setSecurityQForm({ email: '', securityAnswer: '' });
                }}
              >
                <Ionicons name="close" size={28} color="#6B9E4A" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{ui.forgot}</Text>
              <Text style={styles.modalHelpText}>
                {recoveryMode === 'email' ? ui.recoveryHelpEmail : ui.recoveryHelpSecurity}
              </Text>

              {/* Recovery Mode Selector */}
              <View style={styles.recoveryModeContainer}>
                <TouchableOpacity
                  style={[styles.modeButton, recoveryMode === 'email' && styles.modeButtonActive]}
                  onPress={() => {
                    setRecoveryMode('email');
                    setSecurityQuestion('');
                    setSecurityQForm({ email: '', securityAnswer: '' });
                  }}
                >
                  <Ionicons name="mail" size={20} color={recoveryMode === 'email' ? '#fff' : '#6B9E4A'} />
                  <Text style={[styles.modeButtonText, recoveryMode === 'email' && styles.modeButtonTextActive]}>
                    {ui.emailRecovery}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeButton, recoveryMode === 'security' && styles.modeButtonActive]}
                  onPress={() => {
                    setRecoveryMode('security');
                    setSecurityQuestion('');
                    setSecurityQForm({ email: '', securityAnswer: '' });
                  }}
                >
                  <Ionicons name="key" size={20} color={recoveryMode === 'security' ? '#fff' : '#6B9E4A'} />
                  <Text style={[styles.modeButtonText, recoveryMode === 'security' && styles.modeButtonTextActive]}>
                    {ui.securityQuestionRecovery}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Email Recovery */}
              {recoveryMode === 'email' && (
                <View>
                  <Text style={styles.sectionLabel}>{ui.enterEmailForReset}</Text>
                  <Input
                    icon="mail-outline"
                    placeholder={ui.email}
                    value={form.email}
                    onChangeText={(t) => setForm({ ...form, email: t })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <Button
                    title={ui.forgot}
                    onPress={handleForgotPassword}
                    style={{ marginTop: 20 }}
                    disabled={recoveryBusy}
                  />
                </View>
              )}

              {/* Security Question Recovery */}
              {recoveryMode === 'security' && (
                <View>
                  <Text style={styles.sectionLabel}>{ui.enterSecurityEmail}</Text>
                  <Input
                    icon="mail-outline"
                    placeholder={ui.email}
                    value={securityQForm.email}
                    onChangeText={(text) => setSecurityQForm({ ...securityQForm, email: text })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <Button
                    title={ui.lookupSecurityQuestion}
                    onPress={handleSecurityQuestionRecovery}
                    style={{ marginTop: 20 }}
                    disabled={recoveryBusy}
                  />

                  {securityQuestion ? (
                    <View style={{ marginTop: 20 }}>
                      <Text style={styles.securityQuestion}>{securityQuestion}</Text>
                      <TextInput
                        style={styles.securityAnswerInput}
                        placeholder={ui.securityAnswerPlaceholder}
                        value={securityQForm.securityAnswer}
                        onChangeText={(text) => setSecurityQForm({ ...securityQForm, securityAnswer: text })}
                        placeholderTextColor="#999"
                      />
                      <Button
                        title={ui.verifyAndSendLink}
                        onPress={handleVerifySecurityAnswer}
                        style={{ marginTop: 12 }}
                        disabled={recoveryBusy}
                      />
                    </View>
                  ) : null}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  root: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 40, paddingHorizontal: 24 },
  languageSelectorRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  decorativeBlobLarge: {
    position: 'absolute',
    top: -120,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 180,
    backgroundColor: '#E8F5E9',
    opacity: 0.6,
  },
  decorativeBlobSmall: {
    position: 'absolute',
    top: 60,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 140,
    backgroundColor: '#F1F8F5',
    opacity: 0.8,
  },
  hero: { width: '100%', marginBottom: 24, alignItems: 'flex-start' },
  kicker: { color: '#6B9E4A', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  title: { fontSize: 32, fontWeight: '700', color: '#4A6B3A', marginTop: 8, lineHeight: 40 },
  subtitle: { fontSize: 15, color: '#546E7A', marginTop: 8, lineHeight: 24, fontWeight: '400' },
  container: { width: '100%', alignItems: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 480,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  heading: { color: '#263238', fontWeight: '700', marginBottom: 24, fontSize: 24 },
  passwordRow: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eyeBtn: {
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  forgotLink: {
    color: '#6B9E4A',
    fontWeight: '700',
    fontSize: 13,
  },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24, alignItems: 'center' },
  smallText: { color: '#607D8B', marginRight: 4, fontSize: 14, fontWeight: '400' },
  loginLink: { color: '#6B9E4A', fontWeight: '700', fontSize: 14 },
  errorText: { color: '#D32F2F', fontSize: 13, marginBottom: 8, textAlign: 'center', fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: '#F8FAFB' },
  modalContent: { paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 100 },
  modalCloseBtn: { alignSelf: 'flex-start', padding: 8, marginBottom: 16 },
  modalTitle: { fontSize: 28, fontWeight: '800', color: '#2e7d32', marginBottom: 24 },
  modalHelpText: { fontSize: 14, color: '#607D8B', lineHeight: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 14, color: '#546E7A', marginBottom: 12, fontWeight: '600' },
  recoveryModeContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B9E4A',
    backgroundColor: '#fff',
  },
  modeButtonActive: { backgroundColor: '#6B9E4A' },
  modeButtonText: { fontSize: 13, fontWeight: '700', color: '#6B9E4A' },
  modeButtonTextActive: { color: '#fff' },
  securityQuestion: { fontSize: 18, fontWeight: '700', color: '#2e7d32', marginBottom: 20, padding: 16, backgroundColor: '#f1f8e9', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#6B9E4A' },
  securityAnswerInput: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#81c784', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1b5e20', marginBottom: 20, fontWeight: '500' },
});
