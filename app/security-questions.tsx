import { auth, db } from '@/app/firebaseConfig';
import { Button, Input } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function SecurityQuestions() {
  const router = useRouter();
  const { translate } = useLanguage();
  
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const [ui, setUi] = useState({
    title: 'Security Questions',
    subtitle: 'Reset your password with security questions',
    email: 'Email Address',
    enterEmail: 'Enter your email address',
    verifyEmail: 'Verify Email',
    userNotFound: 'User not found',
    noSecurityQuestion: 'No security question set for this account',
    securityQuestion: 'Security Question',
    answer: 'Answer',
    enterAnswer: 'Enter your answer',
    answerIncorrect: 'Answer is incorrect',
    resetLinkSent: 'Password reset email sent. Please check your inbox.',
    error: 'Error',
    success: 'Success',
    backToLogin: 'Back to Login',
    verifyEmailStep: 'Step 1: Verify Email',
    answerSecurityStep: 'Step 2: Answer Security Question',
    verifyAnswer: 'Verify Answer',
    enterValidEmail: 'Please enter a valid email address',
    processing: 'Processing...',
  });

  React.useEffect(() => {
    (async () => {
      setUi({
        title: await translate('Security Questions'),
        subtitle: await translate('Reset your password with security questions'),
        email: await translate('Email Address'),
        enterEmail: await translate('Enter your email address'),
        verifyEmail: await translate('Verify Email'),
        userNotFound: await translate('User not found'),
        noSecurityQuestion: await translate('No security question set for this account'),
        securityQuestion: await translate('Security Question'),
        answer: await translate('Answer'),
        enterAnswer: await translate('Enter your answer'),
        answerIncorrect: await translate('Answer is incorrect'),
        resetLinkSent: await translate('Password reset email sent. Please check your inbox.'),
        error: await translate('Error'),
        success: await translate('Success'),
        backToLogin: await translate('Back to Login'),
        verifyEmailStep: await translate('Step 1: Verify Email'),
        answerSecurityStep: await translate('Step 2: Answer Security Question'),
        verifyAnswer: await translate('Verify Answer'),
        enterValidEmail: await translate('Please enter a valid email address'),
        processing: await translate('Processing...'),
      });
    })();
  }, [translate]);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const loadUserByEmail = async (rawEmail: string) => {
    const normalizedEmail = rawEmail.toLowerCase().trim();

    const usersRef = collection(db, 'users');
    const byEmail = await getDocs(query(usersRef, where('email', '==', normalizedEmail)));
    if (!byEmail.empty) {
      return byEmail.docs[0].data();
    }

    const legacyDoc = await getDoc(doc(db, 'users', normalizedEmail));
    if (legacyDoc.exists()) {
      return legacyDoc.data();
    }

    return null;
  };

  const handleVerifyEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert(ui.error, 'Please enter your email');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(ui.error, ui.enterValidEmail);
      return;
    }

    try {
      setLoading(true);
      const userData = await loadUserByEmail(normalizedEmail);

      if (!userData) {
        Alert.alert(ui.error, ui.userNotFound);
        setLoading(false);
        return;
      }

      if (!userData?.securityQuestion) {
        Alert.alert(ui.error, ui.noSecurityQuestion);
        setLoading(false);
        return;
      }

      setSecurityQuestion(userData.securityQuestion);
      setStep('verify');
    } catch (error) {
      Alert.alert(ui.error, ui.userNotFound);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async () => {
    if (!securityAnswer.trim()) {
      Alert.alert(ui.error, 'Please enter your security answer');
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const userData = await loadUserByEmail(normalizedEmail);

      if (!userData) {
        Alert.alert(ui.error, ui.userNotFound);
        setLoading(false);
        return;
      }

      if (userData?.securityAnswer !== securityAnswer.toLowerCase().trim()) {
        Alert.alert(ui.error, ui.answerIncorrect);
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth as any, normalizedEmail);
      Alert.alert(ui.success, ui.resetLinkSent);
      setEmail('');
      setSecurityAnswer('');
      setSecurityQuestion('');
      setStep('email');
      router.back();
    } catch (error) {
      Alert.alert(ui.error, 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{ui.title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.subtitle}>{ui.subtitle}</Text>

            {step === 'email' && (
              <View style={styles.formSection}>
                <Text style={styles.stepLabel}>{ui.verifyEmailStep}</Text>
                <Input
                  icon="mail-outline"
                  placeholder={ui.enterEmail}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
                <Button
                  title={loading ? ui.processing : ui.verifyEmail}
                  onPress={handleVerifyEmail}
                  disabled={loading}
                  style={{ marginTop: 24 }}
                />
              </View>
            )}

            {step === 'verify' && (
              <View style={styles.formSection}>
                <Text style={styles.stepLabel}>{ui.answerSecurityStep}</Text>
                <View style={styles.questionBox}>
                  <Text style={styles.questionText}>{securityQuestion}</Text>
                </View>
                <TextInput
                  style={styles.answerInput}
                  placeholder={ui.enterAnswer}
                  value={securityAnswer}
                  onChangeText={setSecurityAnswer}
                  placeholderTextColor="#999"
                  autoCapitalize="sentences"
                  editable={!loading}
                />
                <Button
                  title={loading ? ui.processing : ui.verifyAnswer}
                  onPress={handleVerifyAnswer}
                  disabled={loading}
                  style={{ marginTop: 24 }}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 24,
    lineHeight: 24,
  },
  formSection: {
    marginTop: 12,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionBox: {
    backgroundColor: '#f1f8e9',
    borderLeftWidth: 4,
    borderLeftColor: '#6B9E4A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    lineHeight: 24,
  },
  answerInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#81c784',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1b5e20',
    fontWeight: '500',
    marginBottom: 20,
  },
});
