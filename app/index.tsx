import { useLanguage } from '@/context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();
  const { translate } = useLanguage();
  const hasRedirected = useRef(false);
  const [loadingText, setLoadingText] = useState('Loading Smart Uzhavan...');

  useEffect(() => {
    (async () => {
      setLoadingText(await translate('Loading...'));
    })();
  }, [translate]);

  useEffect(() => {
    let isMounted = true;
    
    const performRedirect = async () => {
      try {
        console.log('🚀 Starting redirect...');
        
        // Wait a bit for router to be fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        
        const [isLoggedIn, hasSeenOnboarding, preferredLanguage] = await Promise.all([
          AsyncStorage.getItem('isLoggedIn'),
          AsyncStorage.getItem('hasSeenOnboarding'),
          AsyncStorage.getItem('preferredLanguage'),
        ]);
        console.log('✅ Redirect state:', {
          isLoggedIn,
          hasSeenOnboarding,
          preferredLanguage,
        });
        
        if (!isMounted) return;
        
        // Navigate based on auth + language onboarding status
        if (isLoggedIn === 'true') {
          console.log('📍 Navigating to /home');
          router.replace('/home');
        } else if (hasSeenOnboarding === 'true' || !!preferredLanguage) {
          console.log('📍 Navigating to /login');
          router.replace('/login');
        } else {
          console.log('📍 Navigating to /language-select');
          router.replace('/language-select');
        }
        
        hasRedirected.current = true;
      } catch (error) {
        console.error('❌ Redirect error:', error);
        // Always fallback to language select
        if (isMounted) {
          router.replace('/language-select');
          hasRedirected.current = true;
        }
      }
    };
    
    // Start redirect immediately
    performRedirect();
    
    // Absolute failsafe - force navigation after 3 seconds
    const failsafe = setTimeout(() => {
      if (!hasRedirected.current && isMounted) {
        console.warn('⚠️ Failsafe: Forcing navigation');
        router.replace('/language-select');
        hasRedirected.current = true;
      }
    }, 3000);
    
    return () => {
      isMounted = false;
      clearTimeout(failsafe);
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6B9E4A" />
      <Text style={styles.text}>{loadingText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#F8FAFB' 
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B9E4A',
    fontWeight: '500',
  },
});
