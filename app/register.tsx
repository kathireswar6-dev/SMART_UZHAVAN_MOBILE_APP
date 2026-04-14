import { auth, db } from '@/app/firebaseConfig';
import { Button, Input } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
  const router = useRouter();
  const { translate } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
  });

  const [ui, setUi] = useState({
    title: 'Create Account',
    subtitle: 'Create your account to continue',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    securityQuestion: 'Security Question',
    securityAnswer: 'Security Answer',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    login: 'Login',
    validationTitle: 'Validation',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    emailInvalid: 'Please enter a valid email address',
    confirmPasswordRequired: 'Please confirm your password',
    securityQuestionRequired: 'Security question is required',
    securityAnswerRequired: 'Security answer is required',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    success: 'Success',
    accountCreated: 'Account created successfully!',
    registerFailed: 'Failed to create account',
    securityQuestionHint: 'Example: What was the name of your first pet?',
    passwordStrength: 'Password strength',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  });

  useEffect(() => {
    (async () => {
      setUi({
        title: await translate('Create Account'),
        subtitle: await translate('Create your account to continue'),
        fullName: await translate('Full Name'),
        email: await translate('Email'),
        password: await translate('Password'),
        confirmPassword: await translate('Confirm Password'),
        securityQuestion: await translate('Security Question'),
        securityAnswer: await translate('Security Answer'),
        createAccount: await translate('Create Account'),
        alreadyHaveAccount: await translate('Already have an account?'),
        login: await translate('Login'),
        validationTitle: await translate('Validation'),
        nameRequired: await translate('Name is required'),
        emailRequired: await translate('Email is required'),
        passwordRequired: await translate('Password is required'),
        emailInvalid: await translate('Please enter a valid email address'),
        confirmPasswordRequired: await translate('Please confirm your password'),
        securityQuestionRequired: await translate('Security question is required'),
        securityAnswerRequired: await translate('Security answer is required'),
        passwordTooShort: await translate('Password must be at least 6 characters'),
        passwordMismatch: await translate('Passwords do not match'),
        success: await translate('Success'),
        accountCreated: await translate('Account created successfully!'),
        registerFailed: await translate('Failed to create account'),
        securityQuestionHint: await translate('Example: What was the name of your first pet?'),
        passwordStrength: await translate('Password strength'),
        weak: await translate('Weak'),
        medium: await translate('Medium'),
        strong: await translate('Strong'),
      });
    })();
  }, [translate]);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const getPasswordStrength = (value: string) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) return ui.weak;
    if (score <= 3) return ui.medium;
    return ui.strong;
  };

  const handleRegister = async () => {
    setError('');
    setInlineError('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirmPassword = form.confirmPassword;
    const securityQuestion = form.securityQuestion.trim();
    const securityAnswer = form.securityAnswer.trim();

    if (!name) {
      Alert.alert(ui.validationTitle, ui.nameRequired);
      return;
    }

    if (!email) {
      Alert.alert(ui.validationTitle, ui.emailRequired);
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(ui.validationTitle, ui.emailInvalid);
      return;
    }

    if (!password) {
      Alert.alert(ui.validationTitle, ui.passwordRequired);
      return;
    }

    if (password.length < 6) {
      Alert.alert(ui.validationTitle, ui.passwordTooShort);
      return;
    }

    if (!confirmPassword) {
      Alert.alert(ui.validationTitle, ui.confirmPasswordRequired);
      return;
    }

    if (!securityQuestion) {
      Alert.alert(ui.validationTitle, ui.securityQuestionRequired);
      return;
    }

    if (!securityAnswer) {
      Alert.alert(ui.validationTitle, ui.securityAnswerRequired);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(ui.validationTitle, ui.passwordMismatch);
      return;
    }

    try {
      setLoading(true);

      const credential = await createUserWithEmailAndPassword(auth as any, email, password);

      await updateProfile(credential.user, {
        displayName: name,
      });

      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          email,
          name,
          securityQuestion,
          securityAnswer: securityAnswer.toLowerCase(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userEmail', email);

      Alert.alert(ui.success, ui.accountCreated);
      router.replace('/home' as any);
    } catch (err: any) {
      const translatedError = err?.message ? await translate(err.message) : ui.registerFailed;
      setError(translatedError || ui.registerFailed);
      setInlineError(translatedError || ui.registerFailed);
      Alert.alert(ui.validationTitle, translatedError || ui.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.root}>
            <View style={styles.container}>
              <View style={styles.card}>
                <Text style={styles.title}>{ui.title}</Text>
                <Text style={styles.subtitle}>{ui.subtitle}</Text>

                <Input
                  icon="person-outline"
                  placeholder={ui.fullName}
                  value={form.name}
                  onChangeText={(t) => setForm({ ...form, name: t })}
                />

                <Input
                  icon="mail-outline"
                  placeholder={ui.email}
                  value={form.email}
                  onChangeText={(t) => {
                    setForm({ ...form, email: t });
                    if (inlineError) setInlineError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                {!!form.email && !isValidEmail(form.email.trim()) && (
                  <Text style={styles.inlineHintError}>{ui.emailInvalid}</Text>
                )}

                <View style={styles.passwordRow}>
                  <Input
                    icon="lock-closed-outline"
                    placeholder={ui.password}
                    value={form.password}
                    onChangeText={(t) => {
                      setForm({ ...form, password: t });
                      if (inlineError) setInlineError('');
                    }}
                    secureTextEntry={!passwordVisible}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)} style={styles.eyeBtn}>
                    <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={18} color="#6B9E4A" />
                  </TouchableOpacity>
                </View>

                {!!form.password && (
                  <Text style={styles.inlineHint}>
                    {ui.passwordStrength}: {getPasswordStrength(form.password)}
                  </Text>
                )}

                <View style={styles.passwordRow}>
                  <Input
                    icon="lock-closed-outline"
                    placeholder={ui.confirmPassword}
                    value={form.confirmPassword}
                    onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
                    secureTextEntry={!confirmPasswordVisible}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <TouchableOpacity onPress={() => setConfirmPasswordVisible((v) => !v)} style={styles.eyeBtn}>
                    <Ionicons name={confirmPasswordVisible ? 'eye-off' : 'eye'} size={18} color="#6B9E4A" />
                  </TouchableOpacity>
                </View>

                <Input
                  icon="help-circle-outline"
                  placeholder={ui.securityQuestion}
                  value={form.securityQuestion}
                  onChangeText={(t) => setForm({ ...form, securityQuestion: t })}
                />
                <Text style={styles.inlineHint}>{ui.securityQuestionHint}</Text>

                <Input
                  icon="key-outline"
                  placeholder={ui.securityAnswer}
                  value={form.securityAnswer}
                  onChangeText={(t) => setForm({ ...form, securityAnswer: t })}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {inlineError ? <Text style={styles.errorText}>{inlineError}</Text> : null}

                <Button
                  title={ui.createAccount}
                  onPress={handleRegister}
                  loading={loading}
                  style={{ marginTop: 12 }}
                />

                <View style={styles.bottomRow}>
                  <Text style={styles.smallText}>{ui.alreadyHaveAccount}</Text>
                  <TouchableOpacity onPress={() => router.replace('/login' as any)}>
                    <Text style={styles.linkText}>{ui.login}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24, paddingHorizontal: 24 },
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
  title: { color: '#263238', fontWeight: '700', marginBottom: 8, fontSize: 24 },
  subtitle: { color: '#546E7A', fontSize: 14, marginBottom: 20 },
  passwordRow: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eyeBtn: {
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24, alignItems: 'center' },
  smallText: { color: '#607D8B', marginRight: 4, fontSize: 14, fontWeight: '400' },
  linkText: { color: '#6B9E4A', fontWeight: '700', fontSize: 14 },
  errorText: { color: '#D32F2F', fontSize: 13, marginBottom: 8, textAlign: 'center', fontWeight: '500' },
  inlineHint: { color: '#607D8B', fontSize: 12, marginTop: -8, marginBottom: 12 },
  inlineHintError: { color: '#D32F2F', fontSize: 12, marginTop: -8, marginBottom: 12 },
});
