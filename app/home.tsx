import { auth } from "@/app/firebaseConfig";
import CompactLanguageSelector from "@/components/CompactLanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const { translate } = useLanguage();
  const [ui, setUi] = useState<any>({
    welcome: "Welcome to Smart Uzhavan",
    welcomeBack: "Welcome back",
    cropUpload: "Crop Upload",
    cropSuggestion: "Crop Suggestion",
    farmingResources: "Farming Resources",
    learnFarming: "Farming AI Assistant",
    govtSchemes: "Government Schemes",
    diseases: "Diseases and Diagnosis",
    predictionHistory: "Prediction History",
    weather: "Weather",
    profile: "Profile",
    quickActions: "Quick Actions",
    yourLocation: "Your Location",
    loading: "Loading...",
    locationPermissionRequired: "Location permission required",
    unableToGetLocation: "Unable to get location. Try refreshing or check location settings.",
    logoutTitle: "Logout",
    logoutConfirm: "Are you sure you want to log out?",
    cancel: "Cancel",
    logout: "Logout",
    diagnoseCropDiseases: "Diagnose crop diseases",
    getCropSuggestions: "Get crop suggestions",
    aiFarmingTips: "AI farming tips",
    diseaseDiagnosis: "Disease diagnosis",
    chatWithAI: "Chat with farming AI",
    userLabel: "User",
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const [weather, setWeather] = useState<any>(null);
  const [weatherError, setWeatherError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeather = async () => {
    setRefreshing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setWeatherError(ui.locationPermissionRequired);
        setRefreshing(false);
        return;
      }
      
      // Force new location request with high accuracy and timeout
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude, longitude } = pos.coords as any;

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await res.json();

      // reverse-geocode to get district/village
      let locationLabel = '';
      try {
        const rc = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'User-Agent': 'SmartUzhavan/1.0' } }
        );
        const rd = await rc.json();
        const addr = rd?.address || {};
        // Get the most accurate location: district > town > village > city
        locationLabel = addr.district || addr.county || addr.town || addr.village || addr.hamlet || addr.city || addr.state || '';
      } catch {
        // fallback if reverse geocoding fails
      }

      if (data && data.current_weather) {
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          icon: data.current_weather.weathercode || 0,
          location: locationLabel || 'Location',
          lat: latitude,
          lon: longitude,
        });
        setWeatherError("");
      }
    } catch {
      setWeatherError(ui.unableToGetLocation);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    async function fetchTranslations() {
      setUi({
        welcome: await translate("Welcome to Smart Uzhavan"),
        welcomeBack: await translate("Welcome back"),
        cropUpload: await translate("Crop Upload"),
        cropSuggestion: await translate("Crop Suggestion"),
        farmingResources: await translate("Farming Resources"),
        learnFarming: await translate("Farming AI Assistant"),
        govtSchemes: await translate("Government Schemes"),
        diseases: await translate("Diseases and Diagnosis"),
        predictionHistory: await translate("Prediction History"),
        weather: await translate("Weather"),
        profile: await translate("Profile"),
        quickActions: await translate("Quick Actions"),
        yourLocation: await translate("Your Location"),
        loading: await translate("Loading..."),
        locationPermissionRequired: await translate("Location permission required"),
        unableToGetLocation: await translate("Unable to get location. Try refreshing or check location settings."),
        logoutTitle: await translate("Logout"),
        logoutConfirm: await translate("Are you sure you want to log out?"),
        cancel: await translate("Cancel"),
        logout: await translate("Logout"),
        diagnoseCropDiseases: await translate("Diagnose crop diseases"),
        getCropSuggestions: await translate("Get crop suggestions"),
        aiFarmingTips: await translate("AI farming tips"),
        diseaseDiagnosis: await translate("Disease diagnosis"),
        chatWithAI: await translate("Chat with farming AI"),
        userLabel: await translate("User"),
      });
    }
    fetchTranslations();
  }, [translate]);

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth as any, (u) => setUser(u));
    return unsub;
  }, []);

  function handleLogout() {
    Alert.alert(ui.logoutTitle, ui.logoutConfirm, [
      { text: ui.cancel, style: "cancel" },
      {
        text: ui.logout,
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth as any);
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('userEmail');
            router.replace("/login");
          } catch {
            // Optionally show error
          }
        },
      },
    ]);
  }

  const displayName = user?.displayName || "";
  const emailFallback = user?.email || "";

  const scale = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, [scale, user?.photoURL]);

  function initialsFrom(text?: string) {
    if (!text) return "";
    const parts = text.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function colorFrom(text?: string) {
    if (!text) return "#9ccf9c";
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h << 5) - h + text.charCodeAt(i);
    const hue = Math.abs(h) % 360;
    return `hsl(${hue} 55% 60%)`;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#e8f5e9' }}>
      <View style={styles.heroSection} />
      <View style={styles.decorativeBlobLarge} />
      <View style={styles.decorativeBlobSmall} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileLeftSection}>
            <Animated.View style={[styles.avatarWrap, { transform: [{ scale }] }]}> 
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <Animated.View style={[styles.initialsWrap, { backgroundColor: colorFrom(displayName || emailFallback) }]}>
                  <Text style={styles.initialsText}>{initialsFrom(displayName || emailFallback)}</Text>
                </Animated.View>
              )}
            </Animated.View>

            <View style={styles.profileNameCol}>
              <Text style={styles.profileWelcomeText}>{ui.welcomeBack}</Text>
              {displayName ? (
                <Text style={styles.profileNameText}>{displayName}</Text>
              ) : (
                <Text style={styles.profileEmailText}>{emailFallback}</Text>
              )}
            </View>
          </View>

          {/* Menu Button */}
          <TouchableOpacity
            style={styles.profileMenuBtn}
            onPress={() => setMenuOpen(true)}
          >
            <Ionicons name="menu" size={24} color="#1b5e20" />
          </TouchableOpacity>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherContent}>
            <View style={styles.weatherLeft}>
              <View style={styles.weatherIconBg}>
                <WeatherIcon code={weather?.icon} size={42} />
              </View>
              <View style={styles.weatherTextSection}>
                <Text style={styles.weatherTemp}>
                  {weather ? `${weather.temp}°C` : '-'}
                </Text>
                <Text style={styles.weatherLocation}>
                  {weather ? (weather.location && weather.location.length > 0 ? weather.location : ui.yourLocation) : ui.loading}
                </Text>
                {weatherError ? (
                  <Text style={[styles.weatherLocation, { color: '#c62828' }]}>{weatherError}</Text>
                ) : null}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.weatherRefreshBtn}
              onPress={fetchWeather}
              disabled={refreshing}
            >
              <Ionicons 
                name="refresh" 
                size={22} 
                color="#43a047" 
                style={{ opacity: refreshing ? 0.5 : 1 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Drawer Modal */}
        <Modal
          visible={menuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Pressable
            style={styles.drawerOverlay}
            onPress={() => setMenuOpen(false)}
          >
            <Animated.View
              style={[styles.drawer]}
            >
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <View style={styles.drawerUserInfo}>
                  {user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.drawerAvatar} />
                  ) : (
                    <View style={[styles.drawerAvatarInitials, { backgroundColor: colorFrom(displayName || emailFallback) }]}>
                      <Text style={styles.drawerAvatarText}>{initialsFrom(displayName || emailFallback)}</Text>
                    </View>
                  )}
                  <View style={styles.drawerUserText}>
                    <Text style={styles.drawerUserName}>{displayName || ui.userLabel}</Text>
                    <Text style={styles.drawerUserEmail}>{emailFallback}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setMenuOpen(false)}
                  style={styles.drawerCloseBtn}
                >
                  <Ionicons name="close" size={24} color="#1b5e20" />
                </TouchableOpacity>
              </View>

              <View style={styles.drawerLanguageRow}>
                <CompactLanguageSelector compact={false} />
              </View>

              <ScrollView style={styles.drawerContent}>
                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#43a047" />
                  <Text style={styles.drawerMenuItemText}>{ui.profile}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bdbdbd" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    router.push("/farming-resource");
                  }}
                >
                  <Ionicons name="book-outline" size={20} color="#43a047" />
                  <Text style={styles.drawerMenuItemText}>{ui.farmingResources}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bdbdbd" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    router.push("/govt-schemes");
                  }}
                >
                  <Ionicons name="business-outline" size={20} color="#43a047" />
                  <Text style={styles.drawerMenuItemText}>{ui.govtSchemes}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bdbdbd" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    router.push("/history");
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#43a047" />
                  <Text style={styles.drawerMenuItemText}>{ui.predictionHistory}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bdbdbd" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    router.push("/chatbot" as any);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#43a047" />
                  <Text style={styles.drawerMenuItemText}>{ui.chatWithAI}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bdbdbd" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <View style={styles.drawerDivider} />

                <TouchableOpacity
                  style={[styles.drawerMenuItem, styles.drawerMenuItemLogout]}
                  onPress={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
                  <Text style={[styles.drawerMenuItemText, styles.drawerMenuItemLogoutText]}>{ui.logout}</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Modal>



        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{ui.quickActions}</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* Cards Grid */}
        <View style={styles.cardContainer}>
          <View style={styles.grid}>
            <SectionCard
              icon={<Text style={{ fontSize: 28 }}>🌱</Text>}
              title={ui.cropUpload}
              extra={ui.diagnoseCropDiseases}
              onPress={() => router.push("/crop-upload")}
            />

            <SectionCard
              icon={<Text style={{ fontSize: 28 }}>🌾</Text>}
              title={ui.cropSuggestion}
              extra={ui.getCropSuggestions}
              onPress={() => router.push("/crop-suggestion")}
            />

            <SectionCard
              icon={<Text style={{ fontSize: 28 }}>🦠</Text>}
              title={ui.diseases}
              extra={ui.diseaseDiagnosis}
              onPress={() => router.push("/diseases-diagnosis")}
            />

            <SectionCard
              icon={<Text style={{ fontSize: 28 }}>💬</Text>}
              title={ui.learnFarming}
              extra={ui.chatWithAI}
              onPress={() => router.push("/chatbot" as any)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionCard({ icon, title, extra, onPress, size = "normal" }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const isLarge = size === "large";
  
  return (
    <Animated.View style={[isLarge ? styles.cardWrapperLarge : styles.cardWrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 5 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start()}
        onPress={onPress}
        style={isLarge ? styles.sectionBoxPressableLarge : styles.sectionBoxPressable}
      >
        <View style={styles.sectionContent}>
          <View style={isLarge ? styles.iconWrapLarge : styles.iconWrap}>{icon}</View>
          <View style={styles.sectionTextWrap}>
            <Text style={isLarge ? styles.cardTitleLarge : styles.cardTitle}>{title}</Text>
            {extra ? <Text style={styles.cardSub}>{extra}</Text> : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function WeatherIcon({ code, size = 24 }: { code?: number; size?: number }) {
  if (!code || [1, 2, 3].includes(code)) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="4" fill="#FFC857" />
        <Line x1="12" y1="1" x2="12" y2="4" stroke="#FFC857" strokeWidth="1.5" />
        <Line x1="12" y1="20" x2="12" y2="23" stroke="#FFC857" strokeWidth="1.5" />
        <Line x1="1" y1="12" x2="4" y2="12" stroke="#FFC857" strokeWidth="1.5" />
        <Line x1="20" y1="12" x2="23" y2="12" stroke="#FFC857" strokeWidth="1.5" />
      </Svg>
    );
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M5 15a4 4 0 010-8 5 5 0 019.9 1.1A4.5 4.5 0 0119 13H6" fill="#E6EEF0" stroke="#9FBFC1" strokeWidth="0.8" />
        <Line x1="8" y1="17" x2="8" y2="20" stroke="#4DA0B0" strokeWidth="1.6" strokeLinecap="round" />
        <Line x1="12" y1="17" x2="12" y2="20" stroke="#4DA0B0" strokeWidth="1.6" strokeLinecap="round" />
        <Line x1="16" y1="17" x2="16" y2="20" stroke="#4DA0B0" strokeWidth="1.6" strokeLinecap="round" />
      </Svg>
    );
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M6 15a4 4 0 010-8 5 5 0 019.9 1.1A4.5 4.5 0 0119 13H6" fill="#F0F6FB" stroke="#A9C0D6" strokeWidth="0.8" />
        <Circle cx="8" cy="18" r="1" fill="#A9C0D6" />
        <Circle cx="12" cy="18" r="1" fill="#A9C0D6" />
        <Circle cx="16" cy="18" r="1" fill="#A9C0D6" />
      </Svg>
    );
  }
  if ([95, 96, 99].includes(code)) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M6 15a4 4 0 010-8 5 5 0 019.9 1.1A4.5 4.5 0 0119 13H6" fill="#EDE9F6" stroke="#9B8FE6" strokeWidth="0.8" />
        <Path d="M13 13l-2 4h3l-2 4" fill="#F6D06B" stroke="#D1A23A" strokeWidth="0.8" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 15a4 4 0 010-8 5 5 0 019.9 1.1A4.5 4.5 0 0119 13H6" fill="#E6EEF0" stroke="#9FBFC1" strokeWidth="0.8" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#e8f5e9',
  },
  heroSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "#43a047",
    zIndex: -1,
  },
  decorativeBlobLarge: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(102, 187, 106, 0.2)',
    opacity: 0.8,
    zIndex: -2,
  },
  decorativeBlobSmall: {
    position: 'absolute',
    top: 60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(46, 125, 50, 0.15)',
    opacity: 0.8,
    zIndex: -2,
  },
  // New separate card styles
  profileHeaderCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#66bb6a',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#e8f5e9',
  },
  profileLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  profileNameCol: {
    flex: 1,
    justifyContent: 'center',
  },
  profileWelcomeText: {
    color: "#81c784",
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  profileNameText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1b5e20",
    marginTop: 3,
    lineHeight: 20,
  },
  profileEmailText: {
    fontSize: 12,
    color: "#558b2f",
    fontWeight: '600',
    marginTop: 3,
  },
  profileMenuBtn: {
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#f1f8e9',
  },
  weatherCard: {
    width: "100%",
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 28,
    shadowColor: '#66bb6a',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#e8f5e9',
  },
  weatherContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drawerLanguageRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  weatherIconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f1f8e9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#66bb6a',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  weatherTextSection: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 20,
    color: '#1b5e20',
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  weatherLocation: {
    fontSize: 12,
    color: '#558b2f',
    fontWeight: '600',
    marginTop: 4,
  },
  weatherRefreshBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f1f8e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mergedHeaderCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 32,
    shadowColor: '#66bb6a',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#e8f5e9',
  },
  mergedLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  mergedNameCol: { 
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  mergedWelcomeText: { 
    color: "#81c784", 
    fontSize: 11, 
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  mergedNameText: { 
    fontSize: 17, 
    fontWeight: "900", 
    color: "#1b5e20", 
    marginTop: 4,
    lineHeight: 22,
  },
  mergedEmailText: { 
    fontSize: 12.5, 
    color: "#558b2f", 
    fontWeight: '600', 
    marginTop: 4,
  },
  mergedDivider: {
    width: 1.5,
    height: 72,
    backgroundColor: '#e8f5e9',
    marginHorizontal: 16,
  },
  mergedRightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mergedWeatherIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#f1f8e9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#66bb6a',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  mergedWeatherInfo: {
    marginRight: 2,
  },
  mergedWeatherTemp: {
    fontSize: 18,
    color: '#1b5e20',
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  mergedWeatherLocation: {
    fontSize: 10.5,
    color: '#558b2f',
    fontWeight: '600',
    marginTop: 2,
  },
  mergedWeatherRefreshBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f1f8e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mergedProfileMenuBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { 
    width: 68, 
    height: 68, 
    borderRadius: 34, 
    overflow: "hidden",
    borderWidth: 3,
    borderColor: '#43a047',
    shadowColor: '#43a047',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  avatar: { width: 68, height: 68 },
  profileMenu: {
    position: "absolute",
    top: 54,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    minWidth: 190,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    zIndex: 50,
  },
  menuItemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: "#424242",
    fontWeight: "600",
    fontSize: 14,
  },
  menuItemTextLogout: {
    color: "#D32F2F",
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 6,
    marginHorizontal: 12,
  },

  /* Drawer Styles */
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: -3, height: 0 },
    shadowRadius: 16,
    elevation: 12,
  },
  drawerHeader: {
    backgroundColor: '#43a047',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  drawerUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 12,
  },
  drawerAvatarInitials: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  drawerUserText: {
    flex: 1,
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  drawerUserEmail: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  drawerCloseBtn: {
    padding: 4,
    zIndex: 10,
  },
  drawerContent: {
    flex: 1,
    paddingVertical: 8,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  drawerMenuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
    marginLeft: 16,
    flex: 1,
  },
  drawerMenuItemLogout: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  drawerMenuItemLogoutText: {
    color: '#D32F2F',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 8,
  },
  sectionHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    color: '#1b5e20',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sectionLine: {
    width: 32,
    height: 4,
    backgroundColor: '#43a047',
    borderRadius: 2,
    marginLeft: 8,
  },
  cardContainer: {
    width: "100%",
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardWrapper: {
    width: '48%',
  },
  cardWrapperLarge: {
    width: '48%',
  },
  sectionBoxPressable: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 160,
    justifyContent: 'center',
    shadowColor: '#43a047',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  sectionBoxPressableLarge: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    minHeight: 200,
    justifyContent: 'center',
    shadowColor: '#43a047',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  sectionContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  iconWrap: { 
    width: 68, 
    height: 68, 
    alignItems: "center", 
    justifyContent: "center", 
    borderRadius: 20, 
    backgroundColor: '#f1f8e9',
    marginBottom: 14,
  },
  iconWrapLarge: { 
    width: 80, 
    height: 80, 
    alignItems: "center", 
    justifyContent: "center", 
    borderRadius: 24, 
    backgroundColor: '#f1f8e9',
    marginBottom: 16,
  },
  sectionTextWrap: { alignItems: 'center' },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#1b5e20", 
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  cardTitleLarge: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#1b5e20", 
    textAlign: 'center',
    lineHeight: 26,
  },
  cardSub: { 
    fontSize: 12, 
    color: "#558b2f", 
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  initialsWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
  },
  initialsText: { color: "#ffffff", fontSize: 24, fontWeight: "700" },
});
