import { useLanguage } from '@/context/LanguageContext';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
// Lottie is no longer used
// let LottieView: any = null;

type LoaderContextValue = {
  show: () => void;
  hide: () => void;
  visible: boolean;
};

const LoaderContext = createContext<LoaderContextValue | undefined>(undefined);

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error('useLoader must be used within LoaderProvider');
  return ctx;
};

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { translate } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      setLoadingText(await translate('Loading...'));
    })();
  }, [translate]);

  const show = useCallback(() => {
    setVisible(true);
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [opacity]);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setVisible(false);
    });
  }, [opacity]);

  // pulse animation for center content
  useEffect(() => {
    let running = false;
    if (visible) {
      running = true;
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 650, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.96, duration: 650, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
    return () => {
      if (running) pulse.stopAnimation();
    };
  }, [visible, pulse]);

  const value = useMemo(() => ({ show, hide, visible }), [show, hide, visible]);

  return (
    <LoaderContext.Provider value={value}>
      {children}

      {visible ? (
        <Animated.View pointerEvents="box-none" style={[styles.overlay, { opacity }]}>
          <Animated.View style={[styles.center, { transform: [{ scale: pulse }] }]}> 
            <View style={styles.lottieFallback}>
              <ActivityIndicator size="large" color="#3aa227" />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}
    </LoaderContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    minWidth: 160,
  },
  lottieFallback: { alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#333' },
});

export default LoaderProvider;
