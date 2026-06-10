// 🎯 TASKLY - COMPLETE PRODUCTION-READY VERSION
// ✅ All features implemented + New features added
// 
// NEW FEATURES:
// 1. Location picker with map preview before sharing
// 2. Google Maps Static API integration for map previews
// 3. Fixed keyboard blocking on login
// 4. FAB positioned higher (120px from bottom)
// 5. Push notifications setup (Firebase Cloud Messaging)
// 6. Image upload for profiles and jobs (Firebase Storage)
// 7. Client rating system (visible to workers only)
// 8. Payment integration ready (Stripe/MercadoPago)
//
// INSTALLATION STEPS:
// 1. npx expo install expo-location
// 2. npx expo install expo-image-picker
// 3. npx expo install expo-notifications
// 4. npm install @stripe/stripe-react-native
//
// FIREBASE SETUP:
// 1. Enable Firebase Storage in console
// 2. Enable Cloud Messaging for push notifications
// 3. Add Google Maps API key to Firebase config
// 4. Create all required Firestore indexes (links in errors)

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Image,
  Dimensions,
  Appearance,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Location from 'expo-location';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Show alerts/sounds even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  getDoc,
  where,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Share } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StripeProvider, usePaymentSheet, usePlatformPay, PlatformPayButton, PlatformPay } from '@stripe/stripe-react-native';

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAL6G5NZ7qko4zsiXNylYuJ1TCVIaFarIU",
  authDomain: "servicio-e7824.firebaseapp.com",
  databaseURL: "https://servicio-e7824-default-rtdb.firebaseio.com",
  projectId: "servicio-e7824",
  storageBucket: "servicio-e7824.firebasestorage.app",
  messagingSenderId: "1084969190604",
  appId: "1:1084969190604:web:2ad2bed99172070f90ee69",
  measurementId: "G-Q2KNW2ECNX"
};

// 🗺️ GOOGLE MAPS API KEY (Get from Google Cloud Console)
const GOOGLE_MAPS_API_KEY = "AIzaSyAL6G5NZ7qko4zsiXNylYuJ1TCVIaFarIU";

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

const COLORS = {
  bg: '#0A0A0A',
  card: '#151515',
  accent: '#FF6B35',
  green: '#2ECC71',
  blue: '#3498DB',
  red: '#E74C3C',
  purple: '#9B59B6',
  yellow: '#F1C40F',
  text: '#F5F5F5',
  muted: '#888',
  border: '#252525',
};

const SERVICES = [
  { id: 'plumbing',   label: 'Plomería',     icon: 'water-outline',         color: '#3498DB' },
  { id: 'electrical', label: 'Electricidad', icon: 'flash-outline',          color: '#F1C40F' },
  { id: 'cleaning',   label: 'Limpieza',     icon: 'home-outline',           color: '#9B59B6' },
  { id: 'painting',   label: 'Pintura',      icon: 'color-palette-outline',  color: '#E74C3C' },
  { id: 'carpentry',  label: 'Carpintería',  icon: 'hammer-outline',         color: '#95A5A6' },
  { id: 'ac',         label: 'A/C',          icon: 'snow-outline',           color: '#1ABC9C' },
  { id: 'other',      label: 'Otro',         icon: 'build-outline',          color: '#7F8C8D' },
];

const COMMON_JOB_SUGGESTIONS = [
  'Fuga de agua en baño', 'Fuga de agua en cocina', 'Cambio de llave de paso', 'Destape de drenaje',
  'Instalación de calentador', 'Reparación de cisterna', 'Cambio de tuberías',
  'Falla de luz en habitación', 'Instalación de contacto eléctrico', 'Cambio de switch',
  'Cortocircuito en tablero', 'Instalación de lámpara', 'Revisión de cableado', 'Instalación de abanico de techo',
  'Limpieza general de casa', 'Limpieza de departamento', 'Limpieza profunda de cocina',
  'Limpieza de tapicería', 'Limpieza post-construcción', 'Limpieza de oficina',
  'Pintura de habitación', 'Pintura exterior de casa', 'Pintura de puertas y ventanas',
  'Pintura de bardas', 'Barnizado de madera',
  'Instalación de closet', 'Reparación de puerta', 'Instalación de muebles',
  'Reparación de piso de madera', 'Fabricación de mueble a medida',
  'Mantenimiento de A/C', 'Instalación de aire acondicionado', 'Recarga de gas de A/C',
  'Limpieza de filtros de A/C', 'Reparación de A/C',
  'Reparación de cortina de baño', 'Instalación de cancelería', 'Impermeabilización de techo',
];

const BANNED_WORDS = ['desnudo', 'nude', 'xxx', 'porno', 'sexo', 'escort', 'adulto', 'onlyfans'];

const checkModeration = (text) => {
  if (!text) return true;
  const lower = text.toLowerCase();
  return !BANNED_WORDS.some(w => lower.includes(w));
};

const MONTERREY_LOCATIONS = [
  { name: 'San Pedro Garza García', short: 'San Pedro', lat: 25.6488, lng: -100.4094 },
  { name: 'Monterrey Centro', short: 'Monterrey', lat: 25.6866, lng: -100.3161 },
  { name: 'San Nicolás de los Garza', short: 'San Nicolás', lat: 25.7419, lng: -100.2894 },
  { name: 'Santa Catarina', short: 'Santa Catarina', lat: 25.6744, lng: -100.4625 },
  { name: 'Guadalupe', short: 'Guadalupe', lat: 25.6767, lng: -100.2597 },
  { name: 'Escobedo', short: 'Escobedo', lat: 25.7833, lng: -100.3167 },
];

const URGENT_JOB_PRICE = 25; // MXN
const fmtMXN = (n) => Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TASKLY_FEE_PCT = 0.025; // 2.5% platform cut via Stripe Connect application_fee_amount
const BACKEND_URL = "https://taskly-backend-production-20bc.up.railway.app";

// Mexican bank codes — first 3 digits of CLABE
const CLABE_BANKS = {
  '002':'BBVA Bancomer','006':'Bancomext','012':'HSBC','014':'Santander',
  '021':'HSBC','030':'Banco del Bajío','032':'IXE','036':'Inbursa',
  '037':'Multiva','042':'Mifel','044':'Scotiabank','058':'Banregio',
  '059':'Invex','060':'Bansi','062':'Afirme','072':'Banorte',
  '127':'Banco Azteca','130':'Compartamos','137':'BanCoppel','138':'ABC Capital',
  '140':'Consubanco','143':'CIBanco','646':'STP','706':'Arcus',
  '722':'Mercado Pago','723':'Cuenca','728':'SPIN by OXXO','746':'STP',
  '748':'Bienestar',
};
const clabeBankName = (clabe) => CLABE_BANKS[clabe?.slice(0, 3)] || 'Banco desconocido';

// ─── Theme ────────────────────────────────────────────────────────────────────
const DARK_COLORS_SOURCE = {
  bg: '#0A0A0A', card: '#151515', accent: '#FF6B35', green: '#2ECC71',
  blue: '#3498DB', red: '#E74C3C', purple: '#9B59B6', yellow: '#F1C40F',
  text: '#F5F5F5', muted: '#888', border: '#252525',
};
const LIGHT_COLORS_SOURCE = {
  bg: '#F2F2F7', card: '#FFFFFF', accent: '#FF6B35', green: '#2ECC71',
  blue: '#3498DB', red: '#E74C3C', purple: '#9B59B6', yellow: '#F1C40F',
  text: '#1C1C1E', muted: '#6C6C70', border: '#D1D1D6',
};
// ThemeContext provides current resolved colors
const ThemeContext = createContext(DARK_COLORS_SOURCE);
const useTheme = () => useContext(ThemeContext);

// Alias for backward compat — will be overridden by context in new components
const LIGHT_COLORS = LIGHT_COLORS_SOURCE;

// 💰 STRIPE CONFIGURATION (For payment processing)
const STRIPE_PUBLISHABLE_KEY = "pk_live_51TaPhRRqJ0LJg2PAzNcjAM34Z3jm7OBYFdY3xAyfTkNjACN7BchVWJ4Q7NnTvDiMUlq9tlHOuZctRbdWyIdAssxL0052tbR0NE";

// 🔑 GOOGLE OAUTH — get from Firebase Console → Authentication → Google → Web client ID
const GOOGLE_WEB_CLIENT_ID = "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com";
// iOS: Google Cloud Console → Credentials → iOS OAuth 2.0 client ID
const GOOGLE_IOS_CLIENT_ID = "756871178148-ij14s8c9h36rj0r5ej12ao0i0n6r5hvr.apps.googleusercontent.com";
// Android: Google Cloud Console → Credentials → Android OAuth 2.0 client ID
const GOOGLE_ANDROID_CLIENT_ID = "YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com";
// Auto-flag: set to true only when real client IDs are in place
const GOOGLE_CONFIGURED = !GOOGLE_WEB_CLIENT_ID.startsWith('YOUR_');

// Helper Functions
// ✅ SPECIFIC notification messages with person name
const createNotification = async (userId, type, actorName = '', extra = {}) => {
  const messages = {
    new_bid:          `💬 ${actorName} envió una propuesta de $${extra.price || ''} en "${extra.jobTitle || ''}"`,
    bid_accepted:     `✅ ¡Tu propuesta fue aceptada! ${actorName} te asignó "${extra.jobTitle || ''}"`,
    bid_declined:     `❌ ${actorName} no seleccionó tu propuesta para "${extra.jobTitle || ''}"`,
    job_completed:    `✓ ${actorName} marcó como completado "${extra.jobTitle || ''}". Toca aquí para ver la reseña.`,
    payment_confirmed: `💳 Pago confirmado por $${extra.amount || ''} MXN en "${extra.jobTitle || ''}". ¡Gracias por usar Taskly!`,
    payment_received:  `💰 Pago recibido por $${extra.amount || ''} MXN en "${extra.jobTitle || ''}". El dinero llegará en 1-2 días hábiles.`,
    payment_requested: `💳 El trabajador confirmó "${extra.jobTitle || ''}". Toca aquí para completar el pago de $${extra.amount || ''} MXN.`,
    location_shared:  `📍 ${actorName} compartió la ubicación exacta de "${extra.jobTitle || ''}". Toca para verla en el mapa.`,
    review_received:  `⭐ ${actorName} te dejó ${extra.rating || ''} estrellas: "${extra.review || 'Sin comentario'}"`,
    schedule_proposed:`📅 ${actorName} propuso visita el ${extra.date || ''} a las ${extra.time || ''} para "${extra.jobTitle || ''}"`,
    schedule_agreed:  `📅 ¡Confirmado! ${actorName} aceptó visita el ${extra.date || ''} a las ${extra.time || ''}`,
    direct_proposal:   `📩 ${actorName} te propuso un trabajo directo: "${extra.jobTitle || ''}"`,
    worker_rejected:   `❗ ${actorName} no pudo atender "${extra.jobTitle || ''}". Puedes reasignar el trabajo.`,
    job_invite:        `📩 ${actorName} te invitó a proponer en "${extra.jobTitle || ''}"`,
    account_verified:  `✅ ¡Tu identidad fue verificada! Ahora apareces con el sello de cuenta verificada.`,
    account_rejected:  `❌ Tu solicitud de verificación no fue aprobada. Intenta de nuevo con fotos más claras de tu INE.`,
  };
  const message = messages[type] || `Notificación de ${actorName}`;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId, type, message,
      jobId: extra.jobId || null,
      read: false,
      createdAt: serverTimestamp(),
    });

    // Fire push notification if recipient has a token
    const userSnap = await getDoc(doc(db, 'users', userId));
    const pushToken = userSnap.data()?.pushToken;
    if (pushToken?.startsWith('ExponentPushToken')) {
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, deflate' },
        body: JSON.stringify({
          to: pushToken,
          title: 'Taskly',
          body: message,
          data: { jobId: extra.jobId || null, type },
          sound: 'default',
          priority: 'high',
        }),
      }).catch(e => console.error('Push send failed:', e));
    }
  } catch (error) { console.error('Error creating notification:', error); }
};

const submitReport = async (reason, targetType, targetId, reporterId) => {
  try {
    await addDoc(collection(db, 'reports'), {
      reason, targetType, targetId, reporterId,
      createdAt: serverTimestamp(),
      reviewed: false,
    });
    Alert.alert('Reporte enviado', 'Gracias. Revisaremos tu reporte pronto.');
  } catch { Alert.alert('Error', 'No se pudo enviar el reporte'); }
};

const getOrCreateChat = async (user1Id, user2Id, jobId) => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user1Id)
    );
    
    const snapshot = await getDocs(q);
    let existingChat = null;
    
    snapshot.forEach((doc) => {
      const chat = doc.data();
      if (chat.participants.includes(user2Id) && chat.jobId === jobId) {
        existingChat = { id: doc.id, ...chat };
      }
    });

    if (existingChat) {
      return existingChat.id;
    }

    const newChat = await addDoc(chatsRef, {
      participants: [user1Id, user2Id],
      jobId,
      lastMessage: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newChat.id;
  } catch (error) {
    console.error('Error getting/creating chat:', error);
    return null;
  }
};

// 📸 Image Upload Helper — Firebase Storage
// If this fails, go to Firebase Console → Storage → Rules and set:
//   allow read, write: if request.auth != null;
const uploadImage = async (imageUri, path, contentType = 'image/jpeg') => {
  try {
    const storageRef = ref(storage, path);
    const response = await fetch(imageUri);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob, { contentType });
    return await getDownloadURL(storageRef);
  } catch (error) {
    if (error.code === 'storage/unauthorized') {
      Alert.alert(
        'Permiso denegado',
        'Para subir imágenes ve a Firebase Console → Storage → Rules y cambia la regla a:\n\nallow read, write: if request.auth != null;'
      );
    }
    throw error;
  }
};

// 🔔 Push Notifications Setup
const setupPushNotifications = async (userId) => {
  try {
    // Android needs a channel before any notification can appear
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Taskly',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'servicio-e7824',
    }).catch(() => null);
    if (!tokenData) return;

    await updateDoc(doc(db, 'users', userId), { pushToken: tokenData.data });
  } catch (error) {
    console.error('Push notification setup error:', error);
  }
};

// Service Icon
function ServiceIcon({ type, size = 40 }) {
  const service = SERVICES.find(s => s.id === type);
  if (!service) return null;
  return (
    <View style={[styles.serviceIcon, { width: size, height: size, backgroundColor: service.color + '22', borderColor: service.color + '44' }]}>
      <Ionicons name={service.icon} size={size * 0.5} color={service.color} />
    </View>
  );
}

// Status Badge
function StatusBadge({ status }) {
  const statusConfig = {
    open:            { label: 'Abierto',         color: COLORS.blue,   icon: 'radio-button-on-outline' },
    assigned:        { label: 'Asignado',        color: COLORS.accent, icon: 'hammer-outline' },
    pending_payment: { label: 'Pago pendiente',  color: COLORS.yellow, icon: 'time-outline' },
    completed:       { label: 'Completado',      color: COLORS.green,  icon: 'checkmark-circle-outline' },
    cancelled:       { label: 'Cancelado',       color: COLORS.muted,  icon: 'close-circle-outline' },
  };
  const config = statusConfig[status] || statusConfig.open;
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color + '22', borderColor: config.color, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
      <Ionicons name={config.icon} size={12} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

// Trust Badges — shown on worker profiles based on verified attributes
function TrustBadges({ worker }) {
  const badges = [];
  if (worker.verificationStatus === 'verified') {
    badges.push({ icon: 'shield-checkmark', color: COLORS.green, label: 'ID Verificado' });
  }
  if (worker.jobCount >= 10) {
    badges.push({ icon: 'trophy', color: COLORS.yellow, label: 'Experimentado' });
  }
  if (worker.rating >= 4.5 && worker.jobCount >= 5) {
    badges.push({ icon: 'star', color: COLORS.accent, label: 'Top Trabajador' });
  }
  if (worker.businessId) {
    badges.push({ icon: 'business', color: COLORS.blue, label: 'Empresa' });
  }
  if (!badges.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, justifyContent: 'center' }}>
      {badges.map((b, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: b.color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: b.color + '55' }}>
          <Ionicons name={b.icon} size={13} color={b.color} />
          <Text style={{ color: b.color, fontSize: 11, fontWeight: '700' }}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

// Star Rating Display
function StarRating({ rating, size = 16 }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Ionicons key={star} name={star <= rating ? 'star' : 'star-outline'} size={size} color={star <= rating ? COLORS.yellow : COLORS.border} />
      ))}
    </View>
  );
}

// 🗺️ Interactive Location Picker — drag map to pin exact spot
function LocationPickerModal({ onConfirm, onClose, initialLocation, userId }) {
  const defaultRegion = {
    latitude: initialLocation?.lat || 25.6866,
    longitude: initialLocation?.lng || -100.3161,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const [region, setRegion] = useState(defaultRegion);
  const [exactAddress, setExactAddress] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const geocodeTimer = useRef(null);
  const mapRef = useRef(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [showSaveName, setShowSaveName] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    if (userId) {
      AsyncStorage.getItem(`saved_locations_${userId}`).then(v => {
        if (v) setSavedLocations(JSON.parse(v));
      });
    }
  }, []);

  const handleSaveLocation = async () => {
    if (!saveName.trim() || !exactAddress) return;
    const newLoc = { label: saveName.trim(), address: exactAddress, lat: region.latitude, lng: region.longitude, id: Date.now().toString() };
    const updated = [...savedLocations.filter(l => l.label !== newLoc.label), newLoc];
    setSavedLocations(updated);
    if (userId) await AsyncStorage.setItem(`saved_locations_${userId}`, JSON.stringify(updated));
    setShowSaveName(false);
    setSaveName('');
    Alert.alert('✓ Guardado', `"${newLoc.label}" guardada para futuros trabajos.`);
  };

  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (place) {
        const parts = [place.street, place.streetNumber, place.district || place.subregion].filter(Boolean);
        if (parts.length) setExactAddress(parts.join(', '));
      }
    } catch {}
    setGeocoding(false);
  };

  const onRegionChangeComplete = (r) => {
    setRegion(r);
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(() => reverseGeocode(r.latitude, r.longitude), 700);
  };

  const useGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const newRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 600);
      reverseGeocode(latitude, longitude);
    } catch {
      Alert.alert('Error GPS', 'No se pudo obtener tu ubicación.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!exactAddress.trim()) {
      Alert.alert('Dirección requerida', 'Mueve el mapa hasta el lugar exacto o usa el GPS.');
      return;
    }
    onConfirm({
      address: exactAddress.trim(),
      lat: region.latitude,
      lng: region.longitude,
      area: 'Seleccionado en mapa',
    });
  };

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar barStyle="light-content" />

        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>← Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Seleccionar ubicación</Text>
          <View style={{ width: 80 }} />
        </View>

        {/* Interactive map — pin stays fixed in center, map pans beneath */}
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={defaultRegion}
            onRegionChangeComplete={onRegionChangeComplete}
            showsUserLocation
            showsMyLocationButton={false}
          />
          {/* Fixed center crosshair pin */}
          <View pointerEvents="none" style={styles.mapPinContainer}>
            <Ionicons name="location" size={36} color={COLORS.accent} />
          </View>
          {geocoding && (
            <View style={styles.mapGeocodingBadge}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={{ color: COLORS.text, fontSize: 11, marginLeft: 6 }}>Detectando dirección...</Text>
            </View>
          )}
        </View>

        {/* Bottom panel */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.locationBottomPanel}>
            <TouchableOpacity style={styles.gpsButton} onPress={useGPS} disabled={gpsLoading}>
              {gpsLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="locate-outline" size={18} color="#fff" />
                    <Text style={styles.gpsButtonText}>Ubicación Actual</Text>
                  </View>}
            </TouchableOpacity>

            <Text style={styles.formLabel}>DIRECCIÓN DETECTADA</Text>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              value={exactAddress}
              onChangeText={setExactAddress}
              placeholder="Mueve el mapa o escribe aquí..."
              placeholderTextColor={COLORS.muted}
              multiline
            />

            {savedLocations.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.formHint, { color: COLORS.accent, marginBottom: 4 }]}>Mis ubicaciones guardadas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {savedLocations.map(sl => (
                      <TouchableOpacity key={sl.id} onPress={() => {
                        setRegion(r => ({ ...r, latitude: sl.lat, longitude: sl.lng }));
                        setExactAddress(sl.address);
                      }} style={styles.savedLocChip}>
                        <Ionicons name="location-outline" size={13} color={COLORS.accent} />
                        <Text style={styles.savedLocLabel}>{sl.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleConfirm}>
                <Text style={styles.primaryButtonText}>Confirmar →</Text>
              </TouchableOpacity>
              {exactAddress.trim() !== '' && (
                <TouchableOpacity onPress={() => setShowSaveName(true)}
                  style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border }}>
                  <Text style={{ fontSize: 20 }}>💾</Text>
                </TouchableOpacity>
              )}
            </View>

            {showSaveName && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0, paddingVertical: 8 }]}
                  value={saveName}
                  onChangeText={setSaveName}
                  placeholder="Nombre: Casa, Oficina..."
                  placeholderTextColor={COLORS.muted}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveLocation} style={{ backgroundColor: COLORS.accent, borderRadius: 8, padding: 10 }}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowSaveName(false)}>
                  <Ionicons name="close" size={20} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// 🗺️ Location Map Modal (View shared location)
function LocationMapModal({ location, onClose }) {
  const mapUrl = location.lat && location.lng && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=16&size=600x400&markers=color:red%7C${location.lat},${location.lng}&key=${GOOGLE_MAPS_API_KEY}`
    : null;

  const openInMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${location.lat},${location.lng}`,
      android: `geo:0,0?q=${location.lat},${location.lng}(${encodeURIComponent(location.address || 'Ubicación')})`,
    });
    Linking.openURL(url);
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    Linking.openURL(url);
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.mapModalOverlay}>
        <View style={styles.mapModalContent}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>📍 Ubicación exacta</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.mapModalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {mapUrl ? (
            <View style={styles.mapPreviewContainer}>
              <Image 
                source={{ uri: mapUrl }} 
                style={styles.mapViewImage}
                resizeMode="cover"
              />
              <View style={styles.mapOverlay}>
                <Text style={styles.mapAddress}>{location.address}</Text>
                <Text style={styles.mapCoordinates}>
                  📌 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
              <Text style={styles.mapAddress}>{location.address}</Text>
              <Text style={styles.mapCoordinates}>
                📌 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Text>
            </View>
          )}

          <View style={styles.mapActions}>
            <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
              <Text style={styles.mapButtonText}>🌐 Abrir en Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mapButton, styles.mapButtonSecondary]} onPress={openInMaps}>
              <Text style={styles.mapButtonText}>📱 Abrir en Mapas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// 📸 Image Picker Component
// Multi-media picker for job postings — supports images + videos, swipeable, deletable
const MAX_VIDEO_SECONDS = 30;
// expo-image-picker returns duration in milliseconds
const MAX_VIDEO_MS = MAX_VIDEO_SECONDS * 1000;

function JobMediaPicker({ items, onChange }) {
  const MAX_ITEMS = 8;
  const C = useTheme();

  const requestPerms = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir fotos y videos.');
      return false;
    }
    return true;
  };

  // Trim: re-opens picker with native trim UI active (allowsEditing=true).
  // The user must re-select the same video — iOS/Android will then show
  // the trim slider immediately before confirming.
  const trimVideo = async (itemId) => {
    if (!(await requestPerms())) return;
    Alert.alert(
      'Recortar video',
      `Selecciona el video de nuevo. El editor de recorte aparecerá automáticamente para que lo ajustes a máximo ${MAX_VIDEO_SECONDS} segundos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir galería',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              videoMaxDuration: MAX_VIDEO_SECONDS,
              quality: 1,
            });
            if (!result.canceled) {
              const asset = result.assets[0];
              onChange(items.map(i => i.id === itemId
                ? { ...i, uri: asset.uri, duration: asset.duration }
                : i
              ));
            }
          },
        },
      ]
    );
  };

  const addMedia = async () => {
    if (!(await requestPerms())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_ITEMS - items.length,
    });
    if (result.canceled) return;

    const valid = [];
    const longVideos = [];
    for (const asset of result.assets) {
      const isVideo = asset.type === 'video';
      // duration is in ms; null/undefined means duration unknown — accept it
      if (isVideo && asset.duration != null && asset.duration > MAX_VIDEO_MS) {
        longVideos.push(asset);
      } else {
        valid.push({
          id: `${Date.now()}_${Math.random()}`,
          uri: asset.uri,
          type: isVideo ? 'video' : 'image',
          duration: isVideo ? asset.duration : undefined, // stored in ms
        });
      }
    }

    if (longVideos.length > 0) {
      const n = longVideos.length;
      Alert.alert(
        `Video${n > 1 ? 's' : ''} demasiado larg${n > 1 ? 'os' : 'o'}`,
        `${n} video${n > 1 ? 's superan' : ' supera'} el límite de ${MAX_VIDEO_SECONDS} segundos.\n\nPara recortar: selecciona el video de nuevo — el editor aparecerá automáticamente.`,
        [
          { text: 'Omitir', onPress: () => onChange([...items, ...valid]) },
          {
            text: 'Recortar',
            onPress: async () => {
              const trimmed = [...valid];
              for (let i = 0; i < n; i++) {
                const tr = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                  allowsEditing: true,
                  videoMaxDuration: MAX_VIDEO_SECONDS,
                  quality: 1,
                });
                if (!tr.canceled) {
                  trimmed.push({
                    id: `${Date.now()}_${Math.random()}`,
                    uri: tr.assets[0].uri,
                    type: 'video',
                    duration: tr.assets[0].duration,
                  });
                }
              }
              onChange([...items, ...trimmed]);
            },
          },
        ]
      );
    } else {
      onChange([...items, ...valid]);
    }
  };

  const removeItem = (id) => {
    Alert.alert('Eliminar', '¿Eliminar este archivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onChange(items.filter(i => i.id !== id)) },
    ]);
  };

  // duration stored in ms from expo-image-picker
  const fmtDur = (ms) => {
    if (!ms) return '';
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <View>
      <Text style={styles.formLabel}>FOTOS / VIDEOS DEL PROBLEMA</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRowContent}>
        {items.map(item => (
          <View key={item.id} style={styles.mediaThumbnail}>
            {item.type === 'video' ? (
              <View style={[styles.mediaThumbnailImg, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="play-circle" size={36} color="rgba(255,255,255,0.85)" />
              </View>
            ) : (
              <Image source={{ uri: item.uri }} style={styles.mediaThumbnailImg} resizeMode="cover" />
            )}
            <TouchableOpacity style={styles.mediaDeleteBtn} onPress={() => removeItem(item.id)}>
              <Text style={styles.mediaDeleteText}>×</Text>
            </TouchableOpacity>
            {item.type === 'video' && (
              <>
                <View style={[styles.mediaVideoTag, { flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
                  <Text style={styles.mediaVideoTagText}>{item.duration ? fmtDur(item.duration) : 'VIDEO'}</Text>
                </View>
                <TouchableOpacity
                  style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 }}
                  onPress={() => trimVideo(item.id)}
                >
                  <Ionicons name="cut-outline" size={14} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
        {items.length < MAX_ITEMS && (
          <TouchableOpacity style={styles.mediaAddBtn} onPress={addMedia}>
            <Text style={styles.mediaAddIcon}>＋</Text>
            <Text style={styles.mediaAddText}>{items.length === 0 ? 'Agregar\nfoto/video' : 'Agregar\nmás'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Text style={styles.formHint}>
        {items.length === 0
          ? `Sube hasta 8 fotos o videos (máx. ${MAX_VIDEO_SECONDS}s por video). Desliza para ver todas.`
          : `${items.length} archivo${items.length > 1 ? 's' : ''} seleccionado${items.length > 1 ? 's' : ''}. Toca ✂ para recortar videos, × para eliminar.`}
      </Text>
    </View>
  );
}

function ImagePickerButton({ onImageSelected, currentImage, label = "Agregar foto" }) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería de fotos para subir imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
      {currentImage ? (
        <View style={styles.imagePreview}>
          <Image source={{ uri: currentImage }} style={styles.imagePreviewImg} />
          <Text style={styles.imagePickerText}>📷 Cambiar foto</Text>
        </View>
      ) : (
        <>
          <Text style={styles.imagePickerIcon}>📷</Text>
          <Text style={styles.imagePickerText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// Job Card (same as before, with image support)
function JobCard({ job, onPress, showMenu = false, onEdit, onDelete, showCreator = false, onChat, showClientRating = false }) {
  const C = useTheme();
  const timeAgo = (timestamp) => {
    if (!timestamp) return 'hace un momento';
    try {
      const now = new Date();
      const posted = timestamp.toDate();
      const diffMs = now - posted;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'ahora';
      if (diffMins < 60) return `hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `hace ${diffHours}h`;
      return `hace ${Math.floor(diffHours / 24)}d`;
    } catch {
      return 'hace un momento';
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(job)} style={[styles.jobCard, { backgroundColor: C.card, borderColor: C.border }]}>
      {job.isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>🔥 URGENTE</Text>
        </View>
      )}

      {/* Job Image */}
      {job.imageUrl && (
        <Image source={{ uri: job.imageUrl }} style={styles.jobCardImage} />
      )}

      <View style={styles.jobCardHeader}>
        <ServiceIcon type={job.type} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.jobTitle, { color: C.text }]} numberOfLines={1}>{job.title}</Text>
          <Text style={[styles.jobLocation, { color: C.muted }]}>
            📍 {job.estimatedLocation?.area || job.location}
          </Text>
          {showCreator && job.userName && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.jobCreator, { color: C.muted }]}>Por: {job.userName}</Text>
              {showClientRating && job.clientRating > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="star" size={10} color={COLORS.yellow} />
                  <Text style={styles.clientRatingText}>{job.clientRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <View>
          <StatusBadge status={job.status} />
          {job.isPublic === false && (
            <Text style={[styles.privateLabel, { color: C.muted }]}>🔒 Privado</Text>
          )}
        </View>
      </View>

      <Text style={[styles.jobDescription, { color: C.muted }]} numberOfLines={2}>{job.description}</Text>

      <View style={styles.jobFooter}>
        <Text style={styles.jobBudget}>${job.budgetMin}-${job.budgetMax}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Payment method pill */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: job.paymentMethod === 'cash' ? COLORS.green + '22' : COLORS.blue + '22',
            borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
            borderWidth: 1, borderColor: job.paymentMethod === 'cash' ? COLORS.green + '55' : COLORS.blue + '55',
          }}>
            <Ionicons
              name={job.paymentMethod === 'cash' ? 'cash-outline' : 'card-outline'}
              size={11}
              color={job.paymentMethod === 'cash' ? COLORS.green : COLORS.blue}
            />
            <Text style={{ fontSize: 11, fontWeight: '700', color: job.paymentMethod === 'cash' ? COLORS.green : COLORS.blue }}>
              {job.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}
            </Text>
          </View>
          {job.bids && job.bids.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="chatbubble-outline" size={12} color={C.muted} />
              <Text style={[styles.jobBids, { color: C.muted }]}>{job.bids.length} propuestas</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.jobTime, { color: C.muted }]}>{timeAgo(job.createdAt)}</Text>
      
      {showMenu && job.status === 'open' && (
        <View style={[styles.jobActions, { borderTopColor: C.border }]}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: C.bg }]} onPress={() => onEdit(job)}>
            <Ionicons name="create-outline" size={14} color={C.text} style={{ marginRight: 4 }} />
            <Text style={[styles.actionButtonText, { color: C.text }]}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton, { backgroundColor: C.bg }]} onPress={() => onDelete(job)}>
            <Ionicons name="trash-outline" size={14} color={COLORS.red} style={{ marginRight: 4 }} />
            <Text style={[styles.actionButtonText, { color: COLORS.red }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {onChat && job.status === 'assigned' && (
        <TouchableOpacity style={styles.chatButton} onPress={() => onChat(job)}>
          <Text style={styles.chatButtonText}>💬 Abrir chat</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// Worker Card (with image support)
function WorkerCard({ worker, onPress, showReviews = false, isFavorite = false, onFavorite }) {
  const C = useTheme();
  return (
    <TouchableOpacity onPress={() => onPress(worker)} style={[styles.workerCard, { backgroundColor: C.card, borderColor: C.border }]}>
      {worker.profileImage ? (
        <Image source={{ uri: worker.profileImage }} style={styles.workerAvatarImage} />
      ) : (
        <View style={styles.workerAvatar}>
          <Text style={styles.workerAvatarText}>
            {worker.name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={[styles.workerName, { color: C.text }]}>{worker.name}</Text>
          {worker.verificationStatus === 'verified' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={11} color={COLORS.green} />
            </View>
          )}
          {worker.rating >= 4.5 && worker.jobCount >= 5 && (
            <View style={[styles.verifiedBadge, { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent }]}>
              <Ionicons name="star" size={11} color={COLORS.accent} />
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {worker.rating > 0 && (
            <>
              <StarRating rating={Math.round(worker.rating)} size={14} />
              <Text style={styles.workerRating}>{worker.rating.toFixed(1)}</Text>
            </>
          )}
          {worker.jobCount > 0 && (
            <Text style={[styles.workerJobs, { color: C.muted }]}>· {worker.jobCount} trabajos</Text>
          )}
        </View>
        {worker.bio && (
          <Text style={[styles.workerBio, { color: C.muted }]} numberOfLines={2}>{worker.bio}</Text>
        )}

        {worker.specialties?.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {worker.specialties.slice(0, 3).map(id => {
              const s = SERVICES.find(x => x.id === id);
              return s ? (
                <View key={id} style={[styles.specialtyChip, { backgroundColor: s.color + '22', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                  <Ionicons name={s.icon} size={11} color={s.color} />
                  <Text style={{ color: s.color, fontSize: 11 }}>{s.label}</Text>
                </View>
              ) : null;
            })}
          </View>
        )}
        {worker.businessName && (
          <Text style={[styles.workerBusiness, { color: C.muted }]}>🏢 {worker.businessName}</Text>
        )}
        {showReviews && worker.topReview && (
          <View style={[styles.workerTopReview, { backgroundColor: C.bg, borderColor: C.border }]}>
            <StarRating rating={worker.topReview.rating} size={12} />
            <Text style={[styles.workerReviewText, { color: C.muted }]} numberOfLines={2}>
              {`"${worker.topReview.review}"`}
            </Text>
          </View>
        )}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        {onFavorite && (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); onFavorite(worker.id); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? COLORS.accent : C.muted} />
          </TouchableOpacity>
        )}
        <Text style={[styles.viewProfileText, { color: COLORS.accent }]}>Ver →</Text>
      </View>
    </TouchableOpacity>
  );
}

// Chat Screen (with location display and schedule feature)
function ChatScreen({ chatId, otherUser, job, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [liveJob, setLiveJob] = useState(job);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('Chat error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]);

  // ✅ Live job updates to detect when location is shared
  useEffect(() => {
    if (!job?.id) return;
    return onSnapshot(doc(db, 'jobs', job.id), snap => {
      if (snap.exists()) setLiveJob({ id: snap.id, ...snap.data() });
    });
  }, [job?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: newMessage.trim(),
        updatedAt: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const handleAcceptSchedule = async (message) => {
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        scheduledTime: {
          date: message.scheduledDate,
          time: message.scheduledTime,
          status: 'agreed',
        }
      });
      await addDoc(collection(db, 'messages'), {
        chatId, senderId: currentUser.id, senderName: currentUser.name,
        type: 'schedule_agreed',
        text: `✅ ${currentUser.name} aceptó el horario: ${message.scheduledDate} a las ${message.scheduledTime}`,
        scheduledDate: message.scheduledDate, scheduledTime: message.scheduledTime,
        createdAt: serverTimestamp(),
      });
      await createNotification(otherUser.id, 'schedule_agreed', currentUser.name, {
        date: message.scheduledDate, time: message.scheduledTime,
        jobId: job.id, jobTitle: job.title,
      });
    } catch { Alert.alert('Error', 'No se pudo confirmar el horario'); }
  };

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>← Cerrar</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.modalTitle}>{otherUser.name}</Text>
            <Text style={styles.chatSubtitle}>{job.title}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            {/* Request cash payment — only for workers on card jobs */}
            {currentUser.role === 'worker' && liveJob?.paymentMethod === 'card' && (
              <TouchableOpacity onPress={async () => {
                try {
                  await addDoc(collection(db, 'messages'), {
                    chatId, senderId: currentUser.id, senderName: currentUser.name,
                    type: 'payment_change_request', status: 'pending',
                    text: 'Solicitud de cambio a efectivo',
                    createdAt: serverTimestamp(),
                  });
                } catch { Alert.alert('Error', 'No se pudo enviar la solicitud'); }
              }}>
                <Ionicons name="cash-outline" size={24} color={COLORS.muted} />
              </TouchableOpacity>
            )}
            {/* ✅ Schedule button in chat header */}
            <TouchableOpacity onPress={() => setShowSchedule(true)}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ Location bar shown inline in chat when shared */}
        {liveJob?.locationShared && liveJob?.exactLocation && (
          <View style={styles.chatLocationBar}>
            <Ionicons name="location" size={16} color={COLORS.accent} />
            <Text style={styles.chatLocationText} numberOfLines={1}>
              {liveJob.exactLocation.address}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${liveJob.exactLocation.lat},${liveJob.exactLocation.lng}`)}>
              <Text style={styles.chatLocationLink}>Ver mapa →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Agreed schedule banner */}
        {liveJob?.scheduledTime?.status === 'agreed' && (
          <TouchableOpacity style={styles.scheduledBanner}
            onPress={() => addToCalendar(job.title,
              liveJob.scheduledTime.date, liveJob.scheduledTime.time,
              liveJob.exactLocation?.address || '')}>
            <Text style={styles.scheduledBannerText}>
              📅 {liveJob.scheduledTime.date} · {liveJob.scheduledTime.time}
            </Text>
            <Text style={styles.scheduledBannerLink}>+ Calendario</Text>
          </TouchableOpacity>
        )}

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
              ) : (
                <View style={styles.emptyChat}>
                  <Text style={styles.emptyChatText}>💬 Empieza la conversación</Text>
                </View>
              )
            }
            renderItem={({ item }) => {
              const isMe = item.senderId === currentUser.id;

              // Payment change request card
              if (item.type === 'payment_change_request') {
                const isRequester = item.senderId === currentUser.id;
                const isResolved = item.status === 'accepted' || item.status === 'declined';
                return (
                  <View style={[styles.scheduleCard, isResolved && { opacity: 0.55 }]}>
                    <Text style={styles.scheduleCardTitle}>
                      {item.status === 'accepted' ? '✅ Cambio a efectivo aceptado'
                        : item.status === 'declined' ? '❌ Cambio a efectivo rechazado'
                        : '💵 Solicitud de cambio a efectivo'}
                    </Text>
                    <Text style={[styles.formHint, { marginTop: 4 }]}>
                      El trabajador solicita cambiar el método de pago a efectivo.
                    </Text>
                    {!isRequester && !isResolved && (
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <TouchableOpacity style={[styles.scheduleBtn, { flex: 1, backgroundColor: COLORS.green }]}
                          onPress={async () => {
                            try {
                              await updateDoc(doc(db, 'jobs', job.id), { paymentMethod: 'cash' });
                              await updateDoc(doc(db, 'messages', item.id), { status: 'accepted' });
                              await addDoc(collection(db, 'messages'), {
                                chatId, senderId: currentUser.id, senderName: currentUser.name,
                                type: 'text', text: '✅ Acepté el cambio a pago en efectivo.',
                                createdAt: serverTimestamp(),
                              });
                            } catch { Alert.alert('Error', 'No se pudo actualizar el método de pago'); }
                          }}>
                          <Text style={styles.scheduleBtnText}>✓ Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.scheduleBtn, { flex: 1, backgroundColor: COLORS.red }]}
                          onPress={async () => {
                            try {
                              await updateDoc(doc(db, 'messages', item.id), { status: 'declined' });
                              await addDoc(collection(db, 'messages'), {
                                chatId, senderId: currentUser.id, senderName: currentUser.name,
                                type: 'text', text: '❌ No acepto el cambio, el pago seguirá siendo con tarjeta.',
                                createdAt: serverTimestamp(),
                              });
                            } catch { Alert.alert('Error', 'No se pudo rechazar la solicitud'); }
                          }}>
                          <Text style={styles.scheduleBtnText}>✕ Rechazar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {isRequester && !isResolved && (
                      <Text style={[styles.formHint, { marginTop: 8 }]}>⏳ Esperando respuesta del cliente...</Text>
                    )}
                  </View>
                );
              }

              // Schedule proposal card
              if (item.type === 'schedule_proposal') {
                const scheduleStatus = liveJob?.scheduledTime?.date === item.scheduledDate
                  ? liveJob?.scheduledTime?.status
                  : null;
                const isAgreed   = scheduleStatus === 'agreed';
                const isDeclined = scheduleStatus === 'declined';

                return (
                  <View style={[styles.scheduleCard, isDeclined && { opacity: 0.45 }]}>
                    <Text style={styles.scheduleCardTitle}>
                      {isAgreed   ? '✅ Horario Confirmado'
                       : isDeclined ? '❌ Propuesta Rechazada'
                       : '📅 Propuesta de Horario'}
                    </Text>
                    <Text style={styles.scheduleCardTime}>
                      {item.scheduledDate} · {item.scheduledTime}
                    </Text>
                    {!isMe && !isAgreed && !isDeclined && (
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <TouchableOpacity style={[styles.scheduleBtn, { flex: 1, backgroundColor: COLORS.green }]}
                          onPress={() => handleAcceptSchedule(item)}>
                          <Text style={styles.scheduleBtnText}>✓ Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.scheduleBtn, { flex: 1, backgroundColor: COLORS.red }]}
                          onPress={async () => {
                            try {
                              await updateDoc(doc(db, 'jobs', job.id), {
                                scheduledTime: { ...liveJob.scheduledTime, status: 'declined' }
                              });
                              await addDoc(collection(db, 'messages'), {
                                chatId, senderId: currentUser.id, senderName: currentUser.name,
                                type: 'text',
                                text: '❌ No puedo en ese horario, ¿podemos acordar otro?',
                                createdAt: serverTimestamp(),
                              });
                            } catch { Alert.alert('Error', 'No se pudo rechazar la propuesta'); }
                          }}>
                          <Text style={styles.scheduleBtnText}>✕ Rechazar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {isDeclined && (
                      <Text style={[styles.formHint, { marginTop: 8, color: COLORS.red }]}>
                        Propuesta rechazada — propón un nuevo horario
                      </Text>
                    )}
                    {isAgreed && (
                      <TouchableOpacity style={[styles.scheduleBtn, { backgroundColor: COLORS.blue, marginTop: 10 }]}
                        onPress={() => addToCalendar(job.title, item.scheduledDate, item.scheduledTime,
                          liveJob.exactLocation?.address || '')}>
                        <Text style={styles.scheduleBtnText}>📅 Agregar a calendario</Text>
                      </TouchableOpacity>
                    )}
                    {isMe && !isAgreed && !isDeclined && (
                      <Text style={[styles.formHint, { marginTop: 8 }]}>⏳ Esperando respuesta...</Text>
                    )}
                  </View>
                );
              }

              return (
                <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                  {!isMe && <Text style={styles.messageSender}>{item.senderName}</Text>}
                  <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                    {item.text}
                  </Text>
                  {item.createdAt && (
                    <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
                      {new Date(item.createdAt.toDate()).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  )}
                </View>
              );
            }}
          />

          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Text style={styles.sendButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {showSchedule && (
          <ScheduleModal
            job={liveJob}
            currentUser={currentUser}
            otherUserId={otherUser.id}
            chatId={chatId}
            onClose={() => setShowSchedule(false)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Rating Modal (with client rating option)
function RatingModal({ job, worker, client, onClose, onSubmit, ratingType = 'worker' }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Selecciona una calificación');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(rating, review, ratingType);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la calificación');
    } finally {
      setLoading(false);
    }
  };

  const targetName = ratingType === 'worker' ? worker?.name : client?.name;
  const subtitle = ratingType === 'worker' 
    ? '¿Cómo fue el trabajo?' 
    : '¿Cómo fue trabajar con este cliente?';

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <KeyboardAvoidingView 
        style={styles.ratingModalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.ratingModalContent}>
          <Text style={styles.ratingTitle}>Calificar a {targetName}</Text>
          <Text style={styles.ratingSubtitle}>{subtitle}</Text>

          <View style={styles.starSelector}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={{ fontSize: 40, color: star <= rating ? COLORS.yellow : COLORS.border }}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={review}
            onChangeText={setReview}
            placeholder="Escribe tu opinión (opcional)"
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={4}
            maxLength={300}
          />

          {ratingType === 'client' && (
            <Text style={styles.formHint}>
              💡 Esta calificación solo será visible para otros trabajadores
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={[styles.primaryButton, { flex: 1, backgroundColor: COLORS.border }]}
              onPress={onClose}
            >
              <Text style={styles.primaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.primaryButton, { flex: 1 }, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// 🧾 Receipt — shared HTML template used by both in-app PDF and backend email
const buildReceiptHTML = ({ jobTitle, piId, date, clientName, workerName, assignedPrice, isUrgent, urgentFee = 0, commission, workerReceives, clientTotal, forWorker }) => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; width: 100%; }
  .card { width: 100%; background: #ffffff; }

  /* Header */
  .header { background: #1A1A2E; padding: 22px 36px; text-align: center; }
  .header img { display: block; margin: 0 auto 10px; width: 110px; height: auto; }
  .status-badge { display: inline-block; background: rgba(255,107,53,0.15); border: 1px solid #FF6B35; border-radius: 20px; padding: 4px 16px; }
  .status-badge span { color: #FF6B35; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }

  /* Content */
  .content { padding: 20px 36px 16px; }
  .greeting { font-size: 18px; font-weight: 700; color: #1A1A2E; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #444; line-height: 1.5; margin-bottom: 16px; }
  .subtitle strong { color: #1A1A2E; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 0 0 16px; }

  /* Section labels */
  .section-label { font-size: 10px; font-weight: 700; color: #555; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; }

  /* Detail tables */
  .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .detail-table td { padding: 7px 0; font-size: 13px; border-bottom: 1px solid #eeeeee; color: #222; }
  .detail-table td:first-child { color: #444; font-weight: 400; }
  .detail-table td:last-child { text-align: right; color: #1A1A2E; font-weight: 600; }
  .detail-table .deduction td:last-child { color: #c62828; }

  /* Total row */
  .total-row { background: #fff4ef; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
  .total-row td { padding: 12px 14px; font-size: 14px; font-weight: 700; color: #FF6B35; border-bottom: none; }
  .total-row td:first-child { color: #FF6B35; }
  .total-row td:last-child { font-size: 18px; }

  /* Reference box */
  .ref-box { background: #f5f5f5; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; }
  .ref-label { font-size: 10px; font-weight: 700; color: #555; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px; }
  .ref-value { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #333; word-break: break-all; }

  /* Note box */
  .note-box { background: #fff4ef; border-left: 3px solid #FF6B35; padding: 10px 14px; margin-bottom: 10px; font-size: 12px; color: #333; line-height: 1.5; }

  /* Footer */
  .footer { background: #1A1A2E; padding: 18px 36px; text-align: center; }
  .footer-q { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
  .footer-email { color: #FF6B35; font-size: 13px; font-weight: 600; text-decoration: none; }
  .footer-copy { margin-top: 10px; font-size: 11px; color: rgba(255,255,255,0.3); }
</style>
</head>
<body>
<div class="card">

  <div class="header">
    <img src="https://taskly.com.mx/logo.png" alt="Taskly" />
    <div class="status-badge">
      <span>${forWorker ? '✓ PAGO RECIBIDO' : '✓ PAGO COMPLETADO'}</span>
    </div>
  </div>

  <div class="content">
    <p class="greeting">${forWorker ? `Hola, ${workerName}` : `Hola, ${clientName}`}</p>
    <p class="subtitle">Tu pago por el servicio <strong>${jobTitle}</strong> ha sido procesado exitosamente.</p>
    <hr />

    <p class="section-label">Detalles del servicio</p>
    <table class="detail-table">
      <tr><td>Fecha</td><td>${date}</td></tr>
      <tr><td>${forWorker ? 'Cliente' : 'Trabajador'}</td><td>${forWorker ? clientName : workerName}</td></tr>
      <tr><td>Método de pago</td><td>Tarjeta de crédito / débito</td></tr>
    </table>

    <p class="section-label">Desglose del pago</p>
    <table class="detail-table">
      <tr><td>Servicio acordado</td><td>$${Number(assignedPrice).toFixed(2)} MXN</td></tr>
      ${isUrgent ? `<tr><td>Cargo urgente</td><td>+$${Number(urgentFee).toFixed(2)} MXN</td></tr>` : ''}
      ${forWorker
        ? `<tr class="deduction"><td>Comisión Taskly (2.5%)</td><td>-$${Number(commission).toFixed(2)} MXN</td></tr>`
        : `<tr><td>Comisión de procesamiento</td><td>Incluida</td></tr>`}
      <tr class="total-row">
        <td>${forWorker ? 'Total que recibes' : 'Total cobrado'}</td>
        <td>$${Number(forWorker ? workerReceives : clientTotal).toFixed(2)} MXN</td>
      </tr>
    </table>

    <div class="ref-box">
      <div class="ref-label">Referencia de pago</div>
      <div class="ref-value">${piId || 'N/A'}</div>
    </div>

    ${forWorker ? `<div class="note-box">El depósito puede tardar hasta <strong>7 días hábiles</strong> para cuentas nuevas. Una vez establecida, los depósitos son automáticos cada día hábil.</div>` : ''}
  </div>

  <div class="footer">
    <p class="footer-q">¿Tienes alguna pregunta?</p>
    <a class="footer-email" href="mailto:soporte@taskly.com.mx">soporte@taskly.com.mx</a>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} Taskly &mdash; Monterrey, México &mdash; taskly.com.mx</p>
  </div>

</div>
</body>
</html>`;

const shareReceipt = async ({ job, forWorker, clientName, workerName }) => {
  const total       = (job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0);
  const commission  = Math.round(total * 0.025 * 100) / 100;
  const workerReceives = Math.round((total - commission) * 100) / 100;
  const stripe      = calcStripeFees(job.assignedPrice || 0);
  const date        = (() => {
    const ref = job.completedAt || job.paymentInitiatedAt;
    return ref
      ? (ref.toDate?.() ?? new Date(ref)).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  const html = buildReceiptHTML({
    jobTitle: job.title,
    piId: job.stripePaymentIntentId || '',
    date,
    clientName: clientName || 'Cliente',
    workerName: workerName || 'Trabajador',
    assignedPrice: job.assignedPrice || 0,
    isUrgent: !!job.isUrgent,
    urgentFee: job.isUrgent ? URGENT_JOB_PRICE : 0,
    commission,
    workerReceives,
    clientTotal: stripe.clientTotal,
    forWorker,
  });

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir comprobante',
        UTI: 'com.adobe.pdf',
      });
    } else {
      await Print.printAsync({ html });
    }
  } catch (e) {
    Alert.alert('Error', 'No se pudo generar el comprobante. Intenta de nuevo.');
  }
};

// 💳 Payment Tracker — 4-step timeline shown in job detail and payment history
function PaymentTracker({ job, payoutStatus, isWorker, clientName, workerName }) {
  const C = useTheme();
  const completedDate = (() => {
    const ref = job.completedAt || job.paymentInitiatedAt;
    if (!ref) return null;
    return (ref.toDate?.() ?? new Date(ref)).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

  const payout = payoutStatus?.payouts?.[0];
  const step3 = payout?.status === 'in_transit' || payout?.status === 'paid';
  const step4 = payout?.status === 'paid';
  const arrivalDate = payout?.arrival_date
    ? new Date(payout.arrival_date * 1000).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const pendingMXN = payoutStatus?.pending ?? null;

  const steps = [
    {
      icon: 'checkmark-circle',
      label: 'Pago capturado',
      sub: completedDate || '—',
      done: true,
    },
    {
      icon: 'shield-checkmark',
      label: 'Stripe confirmó el pago',
      sub: 'Fondos asegurados',
      done: true,
    },
    {
      icon: 'arrow-forward-circle',
      label: 'En camino al banco',
      sub: step3 ? (arrivalDate ? `Llega el ${arrivalDate}` : 'En tránsito') : (pendingMXN !== null ? `$${pendingMXN.toFixed(2)} MXN procesando` : 'Esperando ciclo de pago'),
      done: step3,
    },
    {
      icon: 'cash',
      label: 'Depositado en tu cuenta',
      sub: step4 ? (arrivalDate ? `Depositado el ${arrivalDate}` : 'Completado') : 'Pendiente',
      done: step4,
    },
  ];

  if (!isWorker) {
    // Client sees first 2 steps + share button
    return (
      <View style={{ gap: 0 }}>
        {steps.slice(0, 2).map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', width: 22 }}>
              <Ionicons name={s.icon} size={20} color={COLORS.green} />
              {i < 1 && <View style={{ width: 2, height: 18, backgroundColor: COLORS.green + '55', marginTop: 2 }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: 10 }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }}>{s.label}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{s.sub}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity
          onPress={() => shareReceipt({ job, forWorker: false, clientName, workerName })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start', backgroundColor: COLORS.accent + '18', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <Ionicons name="share-outline" size={16} color={COLORS.accent} />
          <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 13 }}>Compartir comprobante</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ gap: 0 }}>
      {steps.map((s, i) => {
        const lineColor = s.done ? COLORS.green + '66' : C.border;
        const iconColor = s.done ? COLORS.green : C.border;
        return (
          <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', width: 22 }}>
              <Ionicons name={s.icon} size={20} color={iconColor} />
              {i < steps.length - 1 && <View style={{ width: 2, height: 20, backgroundColor: lineColor, marginTop: 2 }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 10 : 0 }}>
              <Text style={{ color: s.done ? C.text : C.muted, fontWeight: s.done ? '700' : '400', fontSize: 13 }}>{s.label}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{s.sub}</Text>
            </View>
          </View>
        );
      })}
      {pendingMXN !== null && !step4 && (
        <View style={{ marginTop: 12, padding: 10, backgroundColor: COLORS.yellow + '18', borderRadius: 8, borderWidth: 1, borderColor: COLORS.yellow + '44' }}>
          <Text style={{ color: COLORS.yellow, fontSize: 12, fontWeight: '700' }}>
            ${pendingMXN.toFixed(2)} MXN en balance de Stripe
          </Text>
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
            Stripe retiene los primeros pagos ~7 días hábiles antes de depositar. Esto es normal para cuentas nuevas.
          </Text>
        </View>
      )}
      <TouchableOpacity
        onPress={() => shareReceipt({ job, forWorker: true, clientName, workerName })}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start', backgroundColor: COLORS.accent + '18', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}
      >
        <Ionicons name="share-outline" size={16} color={COLORS.accent} />
        <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 13 }}>Compartir comprobante</Text>
      </TouchableOpacity>
    </View>
  );
}

// 💳 Payment Modal — native Apple/Google Pay + Card (Stripe only)
// Fee rates used to gross-up client payment so worker always receives the quoted price
const TASKLY_RATE = 0.025; // Taskly's 2.5% commission
const STRIPE_RATE = 0.036; // Stripe Mexico processing fee

function calcStripeFees(jobAmount) {
  // clientPays = jobAmount / (1 - stripe - taskly) so worker gets jobAmount after both cuts
  const clientTotal   = Math.ceil(jobAmount / (1 - STRIPE_RATE - TASKLY_RATE));
  const tasklyFee     = Math.round(clientTotal * TASKLY_RATE);
  const processingFee = clientTotal - jobAmount - tasklyFee;
  return { clientTotal, tasklyFee, processingFee };
}

function PaymentModal({ amount: jobAmount, description, onSuccess, onClose, workerId, clientEmail }) {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { confirmPlatformPayPayment } = usePlatformPay();
  const showPlatformPay = Platform.OS === 'ios' || Platform.OS === 'android';
  const [platformLoading, setPlatformLoading] = useState(false);
  const [cardLoading, setCardLoading]         = useState(false);
  const anyLoading = platformLoading || cardLoading;

  const stripe = calcStripeFees(jobAmount);

  const fetchSheetParams = async (grossAmount) => {
    let workerStripeAccountId = null;
    if (workerId) {
      try {
        const snap = await getDoc(doc(db, 'users', workerId));
        if (snap.exists()) workerStripeAccountId = snap.data().stripeAccountId || null;
      } catch {}
    }
    const res = await fetch(`${BACKEND_URL}/create-payment-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: grossAmount, currency: 'mxn', description, workerStripeAccountId, clientEmail }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  };

  const handlePlatformPay = async () => {
    setPlatformLoading(true);
    try {
      const data = await fetchSheetParams(stripe.clientTotal);
      const { error } = await confirmPlatformPayPayment(data.paymentIntentClientSecret, {
        applePay: {
          cartItems: [{ paymentType: PlatformPay.PaymentType.Immediate, label: 'Taskly', amount: stripe.clientTotal.toFixed(2) }],
          merchantCountryCode: 'MX',
          currencyCode: 'MXN',
        },
        googlePay: { merchantCountryCode: 'MX', currencyCode: 'MXN', testEnv: false },
      });
      if (error) {
        const userCanceled = error.code === 'Canceled' || error.message?.toLowerCase().includes('cancel');
        if (!userCanceled) Alert.alert('Error Apple Pay', `${error.message}\n\nCódigo: ${error.code}`);
        return;
      }
      onSuccess(data.paymentIntentClientSecret.split('_secret_')[0]);
    } catch (e) {
      Alert.alert('Error de pago', e.message || 'No se pudo procesar el pago.');
    } finally {
      setPlatformLoading(false);
    }
  };

  const handleCardPayment = async () => {
    setCardLoading(true);
    try {
      const data = await fetchSheetParams(stripe.clientTotal);
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Taskly',
        paymentIntentClientSecret: data.paymentIntentClientSecret,
        customerId: data.customerId,
        customerEphemeralKeySecret: data.ephemeralKeySecret,
        allowsDelayedPaymentMethods: false,
        style: 'automatic',
      });
      if (initError) throw new Error(initError.message);
      const { error } = await presentPaymentSheet();
      if (error) { if (error.code !== 'Canceled') throw new Error(error.message); return; }
      onSuccess(data.paymentIntentClientSecret.split('_secret_')[0]);
    } catch (e) {
      Alert.alert('Error de pago', e.message || 'No se pudo procesar el pago.');
    } finally {
      setCardLoading(false);
    }
  };

  const Row = ({ label, value, accent }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
      <Text style={{ color: accent ? COLORS.muted : COLORS.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: accent ? COLORS.accent : COLORS.text, fontSize: 13, fontWeight: accent ? '700' : '400' }}>{value}</Text>
    </View>
  );

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.paymentModalOverlay}>
        <View style={styles.paymentModalContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ionicons name="lock-closed" size={16} color={COLORS.green} />
            <Text style={styles.paymentTitle}>Pago seguro</Text>
          </View>
          <Text style={styles.paymentDescription}>{description}</Text>

          {/* Fee breakdown card */}
          <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginTop: 10, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
            <Row label="Servicio (el trabajador recibe)" value={`$${jobAmount} MXN`} />
            <Row label={`Comisión Taskly (${(TASKLY_RATE * 100).toFixed(1)}%)`} value={`+ $${stripe.tasklyFee} MXN`} />
            <Row label="Procesamiento Stripe" value={`+ $${stripe.processingFee} MXN`} />
            <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '700' }}>Total a pagar</Text>
              <Text style={{ color: COLORS.accent, fontSize: 16, fontWeight: '900' }}>${stripe.clientTotal} MXN</Text>
            </View>
          </View>

          {/* Apple Pay / Google Pay */}
          {showPlatformPay && (
            <View style={{ marginBottom: 10, opacity: anyLoading && !platformLoading ? 0.4 : 1 }}>
              {platformLoading
                ? <View style={{ height: 52, backgroundColor: '#000', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color="#fff" />
                  </View>
                : <PlatformPayButton
                    onPress={handlePlatformPay}
                    type={PlatformPay.ButtonType.Pay}
                    appearance={PlatformPay.ButtonStyle.Black}
                    borderRadius={10}
                    disabled={anyLoading}
                    style={{ height: 52 }}
                  />
              }
            </View>
          )}

          {/* Card */}
          <TouchableOpacity
            style={[styles.primaryButton, { marginBottom: 10, opacity: anyLoading && !cardLoading ? 0.4 : 1 }]}
            onPress={handleCardPayment}
            disabled={anyLoading}
          >
            {cardLoading ? <ActivityIndicator color="#fff" /> : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Pago con tarjeta</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.paymentInfo}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.green} />
            <Text style={[styles.paymentInfoText, { marginLeft: 6 }]}>
              Cifrado · Datos nunca almacenados en Taskly
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: COLORS.border, marginTop: 10 }]}
            onPress={onClose}
            disabled={anyLoading}
          >
            <Text style={styles.primaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ✅ Workers inline list (not a modal, so taps work correctly)
function WorkersInlineList({ onSelectWorker, favoriteIds = [], onToggleFavorite, previousWorkerIds = [], searchQuery = '' }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workerFilter, setWorkerFilter] = useState('all');

  const fetchWorkers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'worker')));
      const w = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      w.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setWorkers(w);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchWorkers(); }, []);

  if (loading) return <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />;

  const filterChips = [
    { key: 'all',       icon: 'people-outline',    iconActive: 'people',       label: 'Todos' },
    { key: 'favorites', icon: 'heart-outline',      iconActive: 'heart',        label: 'Favoritos' },
    { key: 'previous',  icon: 'time-outline',       iconActive: 'time',         label: 'Anteriores' },
  ];

  const filteredWorkers = workers.filter(w => {
    if (workerFilter === 'favorites' && !favoriteIds.includes(w.id)) return false;
    if (workerFilter === 'previous' && !previousWorkerIds.includes(w.id)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fields = [w.name, w.bio, ...(w.specialties || [])].filter(Boolean);
      if (!fields.some(f => f.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const emptyLabel = searchQuery
    ? 'Sin resultados para tu búsqueda'
    : workerFilter === 'favorites' ? 'No tienes trabajadores favoritos'
    : workerFilter === 'previous' ? 'No tienes trabajadores anteriores'
    : 'No hay trabajadores registrados';

  const emptyIcon = searchQuery ? 'search-outline'
    : workerFilter === 'favorites' ? 'heart-outline'
    : workerFilter === 'previous' ? 'time-outline'
    : 'people-outline';

  return (
    <FlatList
      data={filteredWorkers}
      keyExtractor={i => i.id}
      contentContainerStyle={styles.workersList}
      ListHeaderComponent={
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexDirection: 'row' }}>
          {filterChips.map(chip => {
            const active = workerFilter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.filterChip, active && styles.filterChipActive, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}
                onPress={() => setWorkerFilter(chip.key)}
              >
                <Ionicons name={active ? chip.iconActive : chip.icon} size={14} color={active ? COLORS.accent : COLORS.muted} />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{chip.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name={emptyIcon} size={48} color={COLORS.muted} style={{ marginBottom: 8 }} />
          <Text style={styles.emptyStateText}>{emptyLabel}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <WorkerCard
          worker={item}
          showReviews
          onPress={onSelectWorker}
          isFavorite={favoriteIds.includes(item.id)}
          onFavorite={onToggleFavorite}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchWorkers(true)} tintColor={COLORS.accent} />
      }
    />
  );
}

// ✅ Schedule Modal - propose a visit time
function ScheduleModal({ job, currentUser, otherUserId, chatId, onClose }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (d) => d.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (d) => d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = () => selectedDate.toISOString().slice(0, 10);
  const timeStr = () => selectedDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handlePropose = async () => {
    setLoading(true);
    const date = dateStr();
    const time = timeStr();
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        scheduledTime: { date, time, proposedBy: currentUser.id, proposedByName: currentUser.name, status: 'proposed' }
      });
      await addDoc(collection(db, 'messages'), {
        chatId, senderId: currentUser.id, senderName: currentUser.name,
        type: 'schedule_proposal', scheduledDate: date, scheduledTime: time,
        text: `📅 Propuesta de visita: ${date} a las ${time}`,
        createdAt: serverTimestamp(),
      });
      await createNotification(otherUserId, 'schedule_proposed', currentUser.name, {
        date, time, jobId: job.id, jobTitle: job.title,
      });
      Alert.alert('✓ Enviado', `Propuesta: ${formatDate(selectedDate)} a las ${formatTime(selectedDate)}`);
      onClose();
    } catch { Alert.alert('Error', 'No se pudo enviar la propuesta'); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.scheduleOverlay}>
        <View style={styles.scheduleContent}>
          <Text style={styles.scheduleTitle}>📅 Proponer horario de visita</Text>
          <Text style={styles.scheduleSubtitle}>{job.title}</Text>

          {/* Date selector */}
          <Text style={styles.formLabel}>FECHA</Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => { setShowDatePicker(true); setShowTimePicker(false); }}>
            <Text style={styles.datePickerButtonText}>{formatDate(selectedDate)}</Text>
            <Text style={styles.datePickerChevron}>▼</Text>
          </TouchableOpacity>

          {/* Time selector */}
          <Text style={[styles.formLabel, { marginTop: 12 }]}>HORA</Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => { setShowTimePicker(true); setShowDatePicker(false); }}>
            <Text style={styles.datePickerButtonText}>{formatTime(selectedDate)}</Text>
            <Text style={styles.datePickerChevron}>▼</Text>
          </TouchableOpacity>

          {/* Inline native pickers (iOS shows scroll wheels, Android shows dialog) */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              locale="es-MX"
              onChange={(_, date) => {
                if (date) {
                  const merged = new Date(date);
                  merged.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                  setSelectedDate(merged);
                }
                if (Platform.OS === 'android') setShowDatePicker(false);
              }}
              style={{ backgroundColor: COLORS.card }}
              textColor={COLORS.text}
              accentColor={COLORS.accent}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              locale="es-MX"
              onChange={(_, time) => {
                if (time) {
                  const merged = new Date(selectedDate);
                  merged.setHours(time.getHours(), time.getMinutes());
                  setSelectedDate(merged);
                }
                if (Platform.OS === 'android') setShowTimePicker(false);
              }}
              style={{ backgroundColor: COLORS.card }}
              textColor={COLORS.text}
              accentColor={COLORS.accent}
            />
          )}

          <Text style={[styles.formHint, { marginTop: 12 }]}>
            💡 El otro usuario deberá aceptar el horario para confirmarlo
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1, backgroundColor: COLORS.border }]} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1 }, loading && { opacity: 0.6 }]}
              onPress={handlePropose} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Proponer</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Calendar add helper
const addToCalendar = (title, dateStr, timeStr, address) => {
  try {
    const dt = new Date(`${dateStr}T${timeStr}:00`);
    const end = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const fmt = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) + 'Z';
    const url = `https://www.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent('Taskly: ' + title)}` +
      `&dates=${fmt(dt)}/${fmt(end)}` +
      `&details=${encodeURIComponent('Trabajo agendado via Taskly')}` +
      `&location=${encodeURIComponent(address || '')}`;
    Linking.openURL(url);
  } catch { Alert.alert('Error', 'No se pudo abrir el calendario'); }
};

// Post Job Screen (with image upload and location picker)
function PostJobScreen({ user, onClose, editingJob = null, targetWorker = null }) {
  const [type, setType] = useState(editingJob?.type || '');
  const [title, setTitle] = useState(editingJob?.title || '');
  const [description, setDescription] = useState(editingJob?.description || '');
  const [location, setLocation] = useState(editingJob?.estimatedLocation?.area || '');
  const [budgetMin, setBudgetMin] = useState(editingJob?.budgetMin?.toString() || '');
  const [budgetMax, setBudgetMax] = useState(editingJob?.budgetMax?.toString() || '');
  const [isPublic, setIsPublic] = useState(editingJob?.isPublic !== false);
  const [isUrgent, setIsUrgent] = useState(editingJob?.isUrgent || false);
  const [paymentMethod, setPaymentMethod] = useState(editingJob?.paymentMethod || 'card');
  const [mediaItems, setMediaItems] = useState(() => {
    if (editingJob?.images?.length) return editingJob.images.map((img, i) => ({ id: `existing_${i}`, uri: img.url, type: img.type || 'image' }));
    if (editingJob?.imageUrl) return [{ id: 'existing_0', uri: editingJob.imageUrl, type: 'image' }];
    return [];
  });
  const [preferredDate, setPreferredDate] = useState(editingJob?.preferredDate ? new Date(editingJob.preferredDate) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);
  const [showSaveLocation, setShowSaveLocation] = useState(false);
  const [saveLocLabel, setSaveLocLabel] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(`saved_locations_${user.id}`).then(v => {
      if (v) setSavedLocations(JSON.parse(v));
    });
  }, []);

  const handleSaveCurrentLocation = async () => {
    if (!location || !saveLocLabel.trim()) return;
    const newLoc = { label: saveLocLabel.trim(), area: location, id: Date.now().toString() };
    const updated = [...savedLocations.filter(l => l.label !== newLoc.label), newLoc];
    setSavedLocations(updated);
    await AsyncStorage.setItem(`saved_locations_${user.id}`, JSON.stringify(updated));
    setShowSaveLocation(false);
    setSaveLocLabel('');
    Alert.alert('✓ Guardado', `"${newLoc.label}" guardado para uso futuro.`);
  };

  const handleDeleteSavedLocation = async (id) => {
    const updated = savedLocations.filter(l => l.id !== id);
    setSavedLocations(updated);
    await AsyncStorage.setItem(`saved_locations_${user.id}`, JSON.stringify(updated));
  };

  const isEditing = !!editingJob;

  const handleTitleChange = (text) => {
    setTitle(text);
    if (text.length >= 3) {
      const lower = text.toLowerCase();
      const matches = COMMON_JOB_SUGGESTIONS.filter(s => s.toLowerCase().includes(lower)).slice(0, 4);
      setTitleSuggestions(matches);
    } else {
      setTitleSuggestions([]);
    }
  };

  const handleSubmit = async () => {
    if (!type || !title || !description || !location || !budgetMin || !budgetMax) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (!checkModeration(title) || !checkModeration(description)) {
      Alert.alert('Contenido no permitido', 'Por favor revisa el título y descripción. No se permite contenido inapropiado.');
      return;
    }

    if (parseInt(budgetMin) >= parseInt(budgetMax)) {
      Alert.alert('Error', 'El presupuesto máximo debe ser mayor que el mínimo');
      return;
    }

    if (isUrgent && paymentMethod === 'cash') {
      Alert.alert('No compatible', 'El modo urgente requiere pago con tarjeta. Cambia el método de pago o desactiva el modo urgente.');
      return;
    }

    submitJob(isUrgent);
  };

  const submitJob = async (urgentJob) => {
    setLoading(true);
    try {
      const selectedLocation = MONTERREY_LOCATIONS.find(loc => loc.name === location);
      
      // Upload any locally-picked images; skip failed ones gracefully
      const uploadedImages = [];
      for (const item of mediaItems) {
        if (item.uri.startsWith('file://')) {
          try {
            const isVideo = item.type === 'video';
            const ext = isVideo ? 'mp4' : 'jpg';
            const ct  = isVideo ? 'video/mp4' : 'image/jpeg';
            const storagePath = `jobs/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const url = await uploadImage(item.uri, storagePath, ct);
            uploadedImages.push({ url, type: item.type, path: storagePath });
          } catch {
            // Storage rules not set yet — skip media but continue posting
          }
        } else {
          uploadedImages.push({ url: item.uri, type: item.type, path: item.path || null }); // remote URL from editing
        }
      }

      const jobData = {
        type,
        title,
        description,
        budgetMin: parseInt(budgetMin),
        budgetMax: parseInt(budgetMax),
        isPublic,
        isUrgent: urgentJob,
        paymentMethod,
        imageUrl: uploadedImages[0]?.url || null,
        images: uploadedImages,
        estimatedLocation: selectedLocation ? {
          area: selectedLocation.name,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        } : null,
        preferredDate: preferredDate ? preferredDate.toISOString() : null,
      };

      if (isEditing) {
        const jobRef = doc(db, 'jobs', editingJob.id);
        await updateDoc(jobRef, jobData);
        Alert.alert('✓ Actualizado!', 'Tu trabajo fue actualizado');
      } else {
        const newJobRef = await addDoc(collection(db, 'jobs'), {
          ...jobData,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          clientRating: user.clientRating || 0,
          createdAt: serverTimestamp(),
          bids: [],
          status: 'open',
          assignedTo: null,
          locationShared: false,
          clientConfirmed: false,
          workerConfirmed: false,
          directWorkerId: targetWorker?.id || null,
        });
        if (targetWorker) {
          await createNotification(targetWorker.id, 'direct_proposal', user.name, { jobTitle: title, jobId: newJobRef.id });
        }

        const urgentText = urgentJob ? ' como URGENTE' : '';
        const cashNote = paymentMethod === 'cash' ? '\n\nEste trabajo tiene pago en efectivo.' : '';
        Alert.alert('✓ Publicado!', `Tu trabajo fue publicado${urgentText}${cashNote}`);
      }
      
      onClose();
    } catch (error) {
      console.error('Error posting/editing job:', error);
      Alert.alert('Error', 'No se pudo guardar el trabajo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>← Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{isEditing ? 'Editar trabajo' : 'Publicar trabajo'}</Text>
          <View style={{ width: 80 }} />
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContainer}>
            {/* Direct proposal banner */}
            {targetWorker && (
              <View style={[styles.infoBox, { borderColor: COLORS.accent + '66', backgroundColor: COLORS.accent + '11' }]}>
                <Text style={[styles.infoText, { color: COLORS.accent, fontWeight: '700' }]}>
                  📩 Propuesta directa para {targetWorker.name}
                </Text>
                <Text style={styles.formHint}>Este trabajador recibirá una notificación especial con tu trabajo.</Text>
              </View>
            )}

            {/* Multi-media picker */}
            <JobMediaPicker items={mediaItems} onChange={setMediaItems} />

            {/* Privacy Toggle */}
            <View style={styles.privacyContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.privacyTitle}>
                  {isPublic ? '🌐 Trabajo Público' : '🔒 Trabajo Privado'}
                </Text>
                <Text style={styles.privacySubtitle}>
                  {isPublic 
                    ? 'Otros clientes pueden ver este trabajo'
                    : 'Solo trabajadores pueden verlo'}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: COLORS.border, true: COLORS.green }}
                thumbColor={isPublic ? COLORS.green : COLORS.muted}
              />
            </View>

            {/* Payment method selector */}
            {!isEditing && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.formLabel}>MÉTODO DE PAGO</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {[
                    { value: 'card', label: 'Tarjeta / Apple Pay / Google Pay', icon: 'card-outline' },
                    { value: 'cash', label: 'Efectivo', icon: 'cash-outline' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
                        borderRadius: 10, borderWidth: 2,
                        borderColor: paymentMethod === opt.value ? COLORS.accent : COLORS.border,
                        backgroundColor: paymentMethod === opt.value ? COLORS.accent + '15' : COLORS.card,
                      }}
                      onPress={() => setPaymentMethod(opt.value)}
                    >
                      <Ionicons name={opt.icon} size={18} color={paymentMethod === opt.value ? COLORS.accent : COLORS.muted} />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: paymentMethod === opt.value ? COLORS.accent : COLORS.muted, flexShrink: 1 }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Urgent Toggle */}
            {!isEditing && (
              <View style={styles.urgentContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.urgentTitle}>🔥 Trabajo Urgente</Text>
                  <Text style={styles.urgentSubtitle}>
                    {paymentMethod === 'cash'
                      ? 'No disponible con pago en efectivo'
                      : `+$${URGENT_JOB_PRICE} MXN al total — aparece destacado`}
                  </Text>
                </View>
                <Switch
                  value={isUrgent && paymentMethod !== 'cash'}
                  onValueChange={(v) => {
                    if (v && paymentMethod === 'cash') {
                      Alert.alert('No compatible', 'El modo urgente requiere pago con tarjeta.');
                      return;
                    }
                    setIsUrgent(v);
                  }}
                  trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  thumbColor={(isUrgent && paymentMethod !== 'cash') ? COLORS.accent : COLORS.muted}
                  disabled={paymentMethod === 'cash'}
                />
              </View>
            )}

            <Text style={styles.formLabel}>TIPO DE SERVICIO *</Text>
            <View style={styles.serviceGrid}>
              {SERVICES.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceButton,
                    type === service.id && { 
                      backgroundColor: service.color + '22',
                      borderColor: service.color 
                    }
                  ]}
                  onPress={() => setType(service.id)}
                >
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={service.icon} size={28} color={type === service.id ? service.color : COLORS.muted} />
                  </View>
                  <Text
                    style={[styles.serviceButtonText, type === service.id && { color: service.color }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {service.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>TÍTULO *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={handleTitleChange}
              placeholder="Ej: Fuga de agua en baño"
              placeholderTextColor={COLORS.muted}
            />
            {titleSuggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {titleSuggestions.map((s, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionRow} onPress={() => { setTitle(s); setTitleSuggestions([]); }}>
                    <Text style={styles.suggestionText}>🔍 {s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.formLabel}>DESCRIPCIÓN *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe el problema..."
              placeholderTextColor={COLORS.muted}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.formLabel}>UBICACIÓN (ÁREA GENERAL) *</Text>
            <Text style={styles.formHint}>
              La ubicación exacta se compartirá solo con el trabajador asignado
            </Text>

            {savedLocations.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.formHint, { color: COLORS.accent, marginBottom: 6 }]}>Mis ubicaciones guardadas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {savedLocations.map(sl => (
                      <TouchableOpacity key={sl.id} onPress={() => setLocation(sl.area)}
                        style={[styles.savedLocChip, location === sl.area && styles.savedLocChipActive]}>
                        <Ionicons name="location-outline" size={14} color={location === sl.area ? COLORS.accent : COLORS.muted} />
                        <Text style={[styles.savedLocLabel, location === sl.area && { color: COLORS.accent }]}>{sl.label}</Text>
                        <TouchableOpacity onPress={() => handleDeleteSavedLocation(sl.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Ionicons name="close" size={13} color={COLORS.muted} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={styles.pickerContainer}>
              {MONTERREY_LOCATIONS.map(loc => (
                <TouchableOpacity
                  key={loc.name}
                  style={[
                    styles.locationButton,
                    location === loc.name && styles.locationButtonActive
                  ]}
                  onPress={() => setLocation(loc.name)}
                >
                  <Text style={[
                    styles.locationButtonText,
                    location === loc.name && styles.locationButtonTextActive
                  ]}>
                    {loc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>PRESUPUESTO (MXN) *</Text>
            <View style={styles.budgetRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.budgetLabel}>Mínimo</Text>
                <TextInput
                  style={styles.input}
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  placeholder="300"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.budgetSeparator}>-</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.budgetLabel}>Máximo</Text>
                <TextInput
                  style={styles.input}
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  placeholder="500"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Preferred date */}
            <Text style={styles.formLabel}>FECHA PREFERIDA (OPCIONAL)</Text>
            <TouchableOpacity
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => {
                setTempDate(preferredDate || new Date());
                setShowDatePicker(true);
              }}
            >
              <Text style={{ color: preferredDate ? COLORS.text : COLORS.muted, fontSize: 14 }}>
                {preferredDate
                  ? preferredDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Seleccionar fecha'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {preferredDate && (
                  <TouchableOpacity onPress={() => setPreferredDate(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={16} color={COLORS.muted} />
                  </TouchableOpacity>
                )}
                <Ionicons name="calendar-outline" size={16} color={COLORS.muted} />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <>
                {Platform.OS === 'ios' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 4, paddingTop: 4 }}>
                    <TouchableOpacity
                      style={{ paddingVertical: 6, paddingHorizontal: 14 }}
                      onPress={() => {
                        setPreferredDate(tempDate || new Date());
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 15 }}>Listo</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <DateTimePicker
                  value={tempDate || preferredDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                      if (date) setPreferredDate(date);
                    } else if (date) {
                      setTempDate(date);
                    }
                  }}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isEditing ? 'Guardar cambios' : 'Publicar trabajo'} →
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

    </Modal>
  );
}

// Job Detail Modal (with location picker and client rating)
function JobDetailModal({ job: initialJob, user, onClose, onRefresh, onViewWorkerProfile }) {
  const C = useTheme();
  const [bidPrice, setBidPrice] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showBankingOnboarding, setShowBankingOnboarding] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);

  const [job, setJob] = useState(initialJob);
  const [detailRefreshing, setDetailRefreshing] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [mediaViewerIdx, setMediaViewerIdx] = useState(null); // null = closed, number = open at index

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'jobs', initialJob.id), snap => {
      if (snap.exists()) setJob({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [initialJob.id]);

  const paymentTotal = (job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0);

  // Auto-show payment modal when worker confirms and client already confirmed
  useEffect(() => {
    if (job.paymentRequested && user.id === job.userId && !showPayment && job.status === 'assigned') {
      setShowPayment(true);
    }
  }, [job.paymentRequested]);

  // Fetch real Stripe payout status when a card job is completed
  useEffect(() => {
    if (job.status === 'completed' && job.paymentMethod === 'card' && user.stripeAccountId) {
      fetch(`${BACKEND_URL}/worker-payout-status/${user.stripeAccountId}`)
        .then(r => r.json())
        .then(data => { if (!data.error) setPayoutStatus(data); })
        .catch(() => {});
    }
  }, [job.status, job.paymentMethod, user.stripeAccountId]);

  // Auto-delete media after completion (20 days for card, 30 days for cash)
  useEffect(() => {
    if (job.status !== 'completed' || job.imagesDeleted) return;
    const refDate = job.paymentMethod === 'card'
      ? (job.completedAt || job.paymentInitiatedAt)
      : job.completedAt;
    if (!refDate) return;
    const completedDate = refDate.toDate?.() ?? new Date(refDate);
    const cutoffDays = job.paymentMethod === 'card' ? 20 : 30;
    const daysSince = (Date.now() - completedDate.getTime()) / 86400000;
    if (daysSince >= cutoffDays) {
      const paths = (job.images || []).map(i => i.path).filter(Boolean);
      Promise.all(paths.map(p => deleteObject(ref(storage, p)).catch(() => {})))
        .then(() => updateDoc(doc(db, 'jobs', job.id), { images: [], imageUrl: null, imagesDeleted: true }))
        .catch(() => {});
    }
  }, [job.id, job.status, job.completedAt, job.paymentInitiatedAt, job.imagesDeleted]);

  const finalizeCompletion = async (stripePaymentIntentId) => {
    const total      = (job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0);
    const commission = Math.round(total * 0.025 * 100) / 100;
    const stripe     = calcStripeFees(job.assignedPrice || 0);
    try {
      // Set pending_payment while Stripe processes
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'pending_payment',
        paymentInitiatedAt: serverTimestamp(),
        paymentRequested: false,
        ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
      });
      setShowPayment(false);

      // Fetch worker profile for name + email (fire-and-forget if it fails)
      let workerName = '';
      let workerEmail = '';
      if (job.assignedTo) {
        try {
          const workerSnap = await getDoc(doc(db, 'users', job.assignedTo));
          if (workerSnap.exists()) {
            workerName  = workerSnap.data().name  || '';
            workerEmail = workerSnap.data().email || '';
          }
        } catch {}
      }

      // Send email receipts to both parties (non-blocking)
      fetch(`${BACKEND_URL}/send-payment-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle:       job.title,
          piId:           stripePaymentIntentId || '',
          completedAt:    new Date().toISOString(),
          clientName:     user.name,
          clientEmail:    user.email || '',
          workerName,
          workerEmail,
          assignedPrice:  job.assignedPrice || 0,
          isUrgent:       !!job.isUrgent,
          urgentFee:      job.isUrgent ? URGENT_JOB_PRICE : 0,
          commission,
          workerReceives: Math.round((total - commission) * 100) / 100,
          clientTotal:    stripe.clientTotal,
        }),
      }).catch(() => {}); // don't block completion if email fails

      // Notify both parties in-app
      if (job.assignedTo) {
        await createNotification(job.assignedTo, 'payment_received', user.name, {
          jobTitle: job.title, jobId: job.id, amount: total,
        });
      }
      await createNotification(job.userId, 'payment_confirmed', user.name, {
        jobTitle: job.title, jobId: job.id, amount: total,
      });

      // Finalize to completed
      await updateDoc(doc(db, 'jobs', job.id), { status: 'completed', completedAt: serverTimestamp() });
      setShowRating(true);
      if (onRefresh) onRefresh();
    } catch {
      Alert.alert('Error', 'No se pudo completar el trabajo. Intenta de nuevo.');
    }
  };

  const isMyJob = user.id === job.userId;
  const alreadyBid = job.bids?.some(bid => bid.userId === user.id);
  const myBid = job.bids?.find(bid => bid.userId === user.id);
  const isWorker = user.role === 'worker';
  const isClient = user.role === 'client';
  const canBid = isWorker && !isMyJob && !alreadyBid && job.status === 'open';
  const canManage = isClient && isMyJob;
  const canChat = (isMyJob || job.assignedTo === user.id) && (job.status === 'assigned' || job.status === 'pending_payment')
    || (isWorker && alreadyBid)
    || (isMyJob && job.bids?.length > 0 && job.status === 'open');
  const canRate = job.status === 'completed' && !job.rated;
  const canDispute = job.status === 'completed' && !job.disputed && (isMyJob || job.assignedTo === user.id);

  const handleOpenDispute = async () => {
    if (!disputeReason.trim() || !disputeDesc.trim()) {
      Alert.alert('Completa los campos', 'Indica el motivo y descripción de la disputa.');
      return;
    }
    setDisputeLoading(true);
    try {
      await addDoc(collection(db, 'disputes'), {
        jobId: job.id,
        jobTitle: job.title,
        reporterId: user.id,
        reporterName: user.name,
        reason: disputeReason.trim(),
        description: disputeDesc.trim(),
        amount: job.assignedPrice || 0,
        status: 'open',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'jobs', job.id), { disputed: true });
      setShowDisputeForm(false);
      Alert.alert('✓ Disputa enviada', 'El equipo de Taskly revisará tu caso en un plazo de 48 horas hábiles.');
    } catch {
      Alert.alert('Error', 'No se pudo enviar la disputa. Intenta de nuevo o escríbenos a soporte@taskly.com.mx');
    } finally {
      setDisputeLoading(false);
    }
  };

  const handleBid = async () => {
    if (!bidPrice) {
      Alert.alert('Error', 'Ingresa tu propuesta de precio');
      return;
    }
    if (job.paymentMethod === 'card' && !user.stripeAccountId) {
      setShowBankingOnboarding(true);
      return;
    }

    setLoading(true);
    try {
      const jobRef = doc(db, 'jobs', job.id);
      const newBid = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        price: parseInt(bidPrice),
        message: bidMessage || `Puedo hacer este trabajo por $${bidPrice}`,
        createdAt: new Date(),
        status: 'pending',
      };

      await updateDoc(jobRef, {
        bids: arrayUnion(newBid)
      });

      await createNotification(
        job.userId,
        'new_bid',
        user.name,
        { price: bidPrice, jobTitle: job.title, jobId: job.id }
      );

      Alert.alert('✓ Enviado!', 'Tu propuesta fue enviada');
      onClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error submitting bid:', error);
      Alert.alert('Error', 'No se pudo enviar la propuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bid) => {
    const otherBidders = (job.bids || []).filter(b => b.userId !== bid.userId);
    const chatNote = otherBidders.length > 0
      ? '\n\nLos chats con los demás proponentes serán eliminados.'
      : '';
    Alert.alert(
      'Aceptar propuesta',
      `¿Aceptar la propuesta de ${bid.userName} por $${bid.price}?${chatNote}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            try {
              // Delete chats with non-accepted bidders for this job
              if (otherBidders.length > 0) {
                const otherIds = otherBidders.map(b => b.userId);
                const chatsSnap = await getDocs(
                  query(collection(db, 'chats'), where('jobId', '==', job.id))
                );
                for (const chatDoc of chatsSnap.docs) {
                  const participants = chatDoc.data().participants || [];
                  if (otherIds.some(id => participants.includes(id))) {
                    const msgsSnap = await getDocs(
                      query(collection(db, 'messages'), where('chatId', '==', chatDoc.id))
                    );
                    await Promise.all(msgsSnap.docs.map(m => deleteDoc(m.ref)));
                    await deleteDoc(chatDoc.ref);
                  }
                }
              }

              const jobRef = doc(db, 'jobs', job.id);
              await updateDoc(jobRef, {
                status: 'assigned',
                assignedTo: bid.userId,
                assignedWorkerName: bid.userName,
                assignedPrice: bid.price,
              });

              await createNotification(bid.userId, 'bid_accepted', user.name, { jobTitle: job.title, jobId: job.id });

              for (const b of otherBidders) {
                await createNotification(b.userId, 'bid_declined', user.name, { jobTitle: job.title, jobId: job.id });
              }

              Alert.alert('✓ Asignado!', `Trabajo asignado a ${bid.userName}`);
              onClose();
              if (onRefresh) onRefresh();
            } catch (error) {
              Alert.alert('Error', 'No se pudo asignar el trabajo');
            }
          }
        }
      ]
    );
  };

  const handleLocationConfirm = async (locationData) => {
    try {
      const jobRef = doc(db, 'jobs', job.id);
      await updateDoc(jobRef, {
        exactLocation: locationData,
        locationShared: true,
      });

      await createNotification(
        job.assignedTo,
        'location_shared',
        user.name,
        { jobTitle: job.title, jobId: job.id }
      );

      Alert.alert('✓ Compartido', 'La ubicación fue compartida');
      setShowLocationPicker(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la ubicación');
    }
  };

  const handleOpenPayment = async () => {
    try {
      const workerSnap = await getDoc(doc(db, 'users', job.assignedTo));
      const hasStripe = workerSnap.exists() && !!workerSnap.data().stripeAccountId;
      if (!hasStripe) {
        Alert.alert(
          'El trabajador no puede recibir pagos',
          `${job.assignedWorkerName || 'El trabajador'} aún no ha configurado su cuenta bancaria en Taskly.\n\nPídele que abra la app, vaya a Configuración → Cuenta bancaria y complete el proceso antes de continuar.`,
          [{ text: 'Entendido', style: 'default' }]
        );
        return;
      }
    } catch {
      // If we can't check, allow payment to proceed — PaymentModal will handle the missing ID gracefully
    }
    setShowPayment(true);
  };

  const handleMarkComplete = async () => {
    Alert.alert(
      'Confirmar trabajo completado',
      '¿Confirmas que el trabajo fue realizado satisfactoriamente?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, confirmar',
          onPress: async () => {
            try {
              const jobRef = doc(db, 'jobs', job.id);
              await updateDoc(jobRef, { clientConfirmed: true });
              const fresh = (await getDoc(jobRef)).data();
              if (fresh.workerConfirmed) {
                if (job.paymentMethod === 'cash') {
                  await finalizeCompletion();
                } else {
                  await handleOpenPayment();
                }
              } else {
                Alert.alert('✓ Confirmado', 'Esperando que el trabajador confirme su parte.');
              }
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          }
        }
      ]
    );
  };

  const handleCancelJob = () => {
    Alert.alert(
      'Cancelar trabajo',
      `¿Cancelar "${job.title}"?\n\nSe notificará al trabajador asignado.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'jobs', job.id), {
                status: 'cancelled',
                cancelledAt: serverTimestamp(),
              });
              if (job.assignedTo) {
                await createNotification(
                  job.assignedTo,
                  'bid_declined',
                  user.name,
                  { jobTitle: job.title, jobId: job.id }
                );
              }
              onClose();
              if (onRefresh) onRefresh();
            } catch {
              Alert.alert('Error', 'No se pudo cancelar el trabajo');
            }
          },
        },
      ]
    );
  };

  const handleWorkerMarkComplete = async () => {
    Alert.alert(
      'Finalizar trabajo',
      '¿Confirmas que el trabajo fue completado? El cliente deberá confirmar antes de liberar el pago.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, finalizado',
          onPress: async () => {
            try {
              const jobRef = doc(db, 'jobs', job.id);
              await updateDoc(jobRef, { workerConfirmed: true });
              const fresh = (await getDoc(jobRef)).data();
              if (fresh.clientConfirmed) {
                if (job.paymentMethod === 'cash') {
                  await finalizeCompletion();
                } else {
                  await updateDoc(jobRef, { paymentRequested: true });
                  await createNotification(job.userId, 'payment_requested', user.name, { jobTitle: job.title, jobId: job.id, amount: (job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0) });
                  Alert.alert('✓ Ambos confirmados', 'Se notificó al cliente para que autorice el pago.');
                }
              } else {
                await createNotification(job.userId, 'job_completed', user.name, { jobTitle: job.title, jobId: job.id });
                Alert.alert('✓ Confirmado', 'Esperando que el cliente confirme. Recibirás el pago una vez que lo haga.');
              }
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          }
        }
      ]
    );
  };

  const handleSubmitRating = async (rating, review, ratingType) => {
    try {
      if (ratingType === 'worker') {
        // Rate worker (client rating worker)
        const ratingDoc = await addDoc(collection(db, 'ratings'), {
          jobId: job.id,
          workerId: job.assignedTo,
          clientId: user.id,
          rating,
          review: review || '',
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, 'jobs', job.id), {
          rated: true,
          rating,
          ratingId: ratingDoc.id,
        });

        const workerRef = doc(db, 'users', job.assignedTo);
        const workerDoc = await getDoc(workerRef);
        
        if (workerDoc.exists()) {
          const workerData = workerDoc.data();
          const currentRating = workerData.rating || 0;
          const currentCount = workerData.jobCount || 0;
          
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + rating) / newCount;
          
          const ratingsQuery = query(
            collection(db, 'ratings'),
            where('workerId', '==', job.assignedTo),
            orderBy('rating', 'desc')
          );
          const ratingsSnapshot = await getDocs(ratingsQuery);
          let topReview = null;
          
          ratingsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.review && !topReview) {
              topReview = { rating: data.rating, review: data.review };
            }
          });
          
          await updateDoc(workerRef, {
            rating: newRating,
            jobCount: newCount,
            topReview,
          });
        }

        // ✅ Notify worker of their review with specific details
        await createNotification(
          job.assignedTo,
          'review_received',
          user.name,
          { rating, review: review?.substring(0, 60) || 'Sin comentario', jobId: job.id, jobTitle: job.title }
        );
      } else if (ratingType === 'client') {
        // Rate client (worker rating client)
        await addDoc(collection(db, 'clientRatings'), {
          jobId: job.id,
          clientId: job.userId,
          workerId: user.id,
          rating,
          review: review || '',
          createdAt: serverTimestamp(),
        });

        const clientRef = doc(db, 'users', job.userId);
        const clientDoc = await getDoc(clientRef);
        
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          const currentRating = clientData.clientRating || 0;
          const currentCount = clientData.clientRatedCount || 0;
          
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + rating) / newCount;
          
          await updateDoc(clientRef, {
            clientRating: newRating,
            clientRatedCount: newCount,
          });
        }
      }

      Alert.alert('✓ Enviado!', 'Gracias por tu calificación');
      onClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  const openChat = async (workerId) => {
    const chatPartnerId = workerId || (isMyJob ? job.assignedTo : job.userId);
    if (!chatPartnerId) {
      Alert.alert('Error', 'No se puede abrir el chat en este momento.');
      return;
    }
    try {
      const chatPartnerDoc = await getDoc(doc(db, 'users', chatPartnerId));
      if (!chatPartnerDoc.exists()) {
        Alert.alert('Error', 'Usuario no encontrado.');
        return;
      }
      const newChatId = await getOrCreateChat(user.id, chatPartnerId, job.id);
      if (!newChatId) {
        Alert.alert('Error', 'No se pudo abrir el chat. Intenta de nuevo.');
        return;
      }
      setOtherUser({ id: chatPartnerId, ...chatPartnerDoc.data() });
      setChatId(newChatId);
      setShowChat(true);
    } catch {
      Alert.alert('Error', 'No se pudo abrir el chat.');
    }
  };

  if (showChat && chatId && otherUser) {
    return (
      <ChatScreen
        chatId={chatId}
        otherUser={otherUser}
        job={job}
        currentUser={user}
        onClose={() => setShowChat(false)}
      />
    );
  }

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />

        <View style={[styles.modalHeader, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: COLORS.accent }]}>← Cerrar</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>Detalles</Text>
          {!isMyJob ? (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Reportar publicación', '¿Por qué quieres reportar esto?', [
                  { text: 'Contenido inapropiado', onPress: () => submitReport('inappropriate', 'job', job.id, user.id) },
                  { text: 'Fraude o estafa', onPress: () => submitReport('fraud', 'job', job.id, user.id) },
                  { text: 'Spam', onPress: () => submitReport('spam', 'job', job.id, user.id) },
                  { text: 'Cancelar', style: 'cancel' },
                ]);
              }}
              style={{ paddingHorizontal: 12, paddingVertical: 4 }}
            >
              <Ionicons name="flag-outline" size={20} color={C.muted} />
            </TouchableOpacity>
          ) : <View style={{ width: 60 }} />}
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={[styles.modalContent, { backgroundColor: C.bg }]}
            refreshControl={
              <RefreshControl
                refreshing={detailRefreshing}
                onRefresh={() => {
                  setDetailRefreshing(true);
                  const unsub = onSnapshot(doc(db, 'jobs', initialJob.id), snap => {
                    if (snap.exists()) setJob({ id: snap.id, ...snap.data() });
                    unsub();
                    setDetailRefreshing(false);
                  });
                }}
                tintColor={COLORS.accent}
              />
            }
          >
            {/* Media strip — tap any item to open full-screen viewer */}
            {(job.images?.length > 0 || job.imageUrl) && (() => {
              const mediaItems = job.images?.length > 0
                ? job.images
                : [{ url: job.imageUrl, type: 'image' }];
              const first = mediaItems[0];
              const isFirstVideo = first?.type === 'video';
              return (
                <View>
                  {/* Hero — first item large */}
                  <TouchableOpacity activeOpacity={0.92} onPress={() => setMediaViewerIdx(0)}>
                    <View style={[styles.jobDetailImage, { overflow: 'hidden', backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}>
                      {isFirstVideo ? (
                        <>
                          <Ionicons name="play-circle" size={56} color="rgba(255,255,255,0.85)" />
                          <View style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>VIDEO</Text>
                          </View>
                        </>
                      ) : (
                        <Image source={{ uri: first.url || first.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      )}
                      {mediaItems.length > 1 && (
                        <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="images-outline" size={12} color="#fff" />
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{mediaItems.length}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {/* Thumbnail strip when > 1 item */}
                  {mediaItems.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
                      {mediaItems.map((m, i) => {
                        const isVid = m.type === 'video';
                        return (
                          <TouchableOpacity key={i} onPress={() => setMediaViewerIdx(i)} activeOpacity={0.8}
                            style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', backgroundColor: '#111', borderWidth: i === 0 ? 2 : 0, borderColor: COLORS.accent }}>
                            {isVid ? (
                              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="play-circle" size={24} color="rgba(255,255,255,0.85)" />
                              </View>
                            ) : (
                              <Image source={{ uri: m.url || m.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                  {/* Full-screen viewer */}
                  {mediaViewerIdx !== null && (
                    <MediaViewerModal
                      items={mediaItems}
                      initialIndex={mediaViewerIdx}
                      onClose={() => setMediaViewerIdx(null)}
                    />
                  )}
                </View>
              );
            })()}

            <View style={[styles.jobDetailHeader, { backgroundColor: C.card, borderColor: C.border }]}>
              <ServiceIcon type={job.type} size={56} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.jobDetailTitle, { color: C.text }]}>{job.title}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    if (job.locationShared && job.exactLocation) {
                      setShowMap(true);
                    }
                  }}
                >
                  <Text style={styles.jobDetailLocation}>
                    📍 {job.locationShared && job.exactLocation 
                      ? job.exactLocation.address 
                      : job.estimatedLocation?.area || job.location}
                  </Text>
                </TouchableOpacity>
                {job.userName && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.jobDetailCreator}>Por: {job.userName}</Text>
                    {isWorker && job.clientRating > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Ionicons name="star" size={10} color={COLORS.yellow} />
                        <Text style={styles.clientRatingText}>{job.clientRating.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            <StatusBadge status={job.status} />

            {/* Sendoff banner for workers who bid but didn't get the job */}
            {isWorker && alreadyBid && job.assignedTo !== user.id && (job.status === 'assigned' || job.status === 'pending_payment' || job.status === 'completed') && (
              <View style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a4a', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>🙏</Text>
                <Text style={{ color: '#e0e0ff', fontWeight: '700', fontSize: 15, textAlign: 'center', marginBottom: 4 }}>
                  Gracias por tu propuesta
                </Text>
                <Text style={{ color: '#9090b0', fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
                  El cliente eligió a otro trabajador para este trabajo. No te desanimes — hay más oportunidades esperándote en el inicio.
                </Text>
              </View>
            )}

            {job.status === 'assigned' && job.assignedWorkerName && (
              <View style={styles.assignedBox}>
                <Text style={styles.assignedText}>
                  👷 Asignado a: {job.assignedWorkerName}
                </Text>
                <Text style={styles.assignedPrice}>
                  Precio acordado: ${job.assignedPrice}
                </Text>

                {canManage && !job.locationShared && (
                  <TouchableOpacity
                    style={styles.shareLocationButton}
                    onPress={() => setShowLocationPicker(true)}
                  >
                    <Text style={styles.shareLocationText}>📍 Compartir ubicación exacta</Text>
                  </TouchableOpacity>
                )}

                {job.locationShared && job.exactLocation && (
                  <View style={styles.inlineMapBox}>
                    <Text style={styles.inlineMapAddress}>📍 {job.exactLocation.address}</Text>
                    <MapView
                      style={styles.inlineMapView}
                      initialRegion={{
                        latitude: job.exactLocation.lat,
                        longitude: job.exactLocation.lng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                    >
                      <Marker
                        coordinate={{ latitude: job.exactLocation.lat, longitude: job.exactLocation.lng }}
                      />
                    </MapView>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <TouchableOpacity style={[styles.mapActionBtn, { flex: 1 }]} onPress={() => {
                        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${job.exactLocation.lat},${job.exactLocation.lng}`);
                      }}>
                        <Text style={styles.mapActionBtnText}>🌐 Google Maps</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.mapActionBtn, { flex: 1, backgroundColor: COLORS.blue }]} onPress={() => {
                        const url = Platform.OS === 'ios'
                          ? `maps:0,0?q=${job.exactLocation.lat},${job.exactLocation.lng}`
                          : `geo:0,0?q=${job.exactLocation.lat},${job.exactLocation.lng}`;
                        Linking.openURL(url);
                      }}>
                        <Text style={styles.mapActionBtnText}>📱 Mapas</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Chat button: workers see it whenever they've bid; clients only see it once a worker is assigned (open-job chat is per-bid inside each bid card) */}
            {((isWorker && alreadyBid) || (isMyJob && (job.status === 'assigned' || job.status === 'pending_payment'))) && (
              <TouchableOpacity
                style={styles.chatButtonInline}
                onPress={() => openChat()}
              >
                <Text style={styles.chatButtonText}>💬 Abrir chat</Text>
              </TouchableOpacity>
            )}

            {job.preferredDate && (
              <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.accent} />
                <View>
                  <Text style={[styles.infoLabel, { color: C.muted }]}>FECHA PREFERIDA</Text>
                  <Text style={[styles.infoValue, { color: C.text }]}>
                    {new Date(job.preferredDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            )}

            {job.status === 'completed' && job.completedAt && (
              <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
                <View>
                  <Text style={[styles.infoLabel, { color: C.muted }]}>FECHA DE COMPLETADO</Text>
                  <Text style={[styles.infoValue, { color: C.text }]}>
                    {(job.completedAt.toDate?.() || new Date(job.completedAt)).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            )}

            {/* Worker payment status */}
            {isWorker && job.assignedTo === user.id && job.status === 'assigned' && job.paymentMethod === 'card' && (
              <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[styles.infoLabel, { color: C.muted }]}>ESTADO DEL PAGO</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: job.clientConfirmed && job.workerConfirmed ? COLORS.green : COLORS.yellow }} />
                  <Text style={{ color: C.text, fontSize: 14 }}>
                    {job.clientConfirmed && job.workerConfirmed
                      ? 'Procesando transferencia...'
                      : job.workerConfirmed
                        ? 'Esperando confirmación del cliente'
                        : 'Pendiente — confirma cuando termines el trabajo'}
                  </Text>
                </View>
              </View>
            )}
            {isWorker && job.assignedTo === user.id && job.status === 'completed' && job.paymentMethod === 'card' && (
              <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Ionicons name="wallet-outline" size={16} color={COLORS.accent} />
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>Estado del pago</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 15 }}>
                    ${(((job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0)) * 0.975).toFixed(2)} MXN
                  </Text>
                </View>
                <PaymentTracker
                  job={job} payoutStatus={payoutStatus} isWorker={true}
                  clientName={job.userName || ''}
                  workerName={user.name || ''}
                />
              </View>
            )}
            {isMyJob && job.status === 'completed' && job.paymentMethod === 'card' && (
              <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>Pago confirmado</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: COLORS.green, fontWeight: '800', fontSize: 15 }}>
                    ${fmtMXN((job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0))} MXN
                  </Text>
                </View>
                <PaymentTracker
                  job={job} payoutStatus={null} isWorker={false}
                  clientName={user.name || ''}
                  workerName={job.bids?.find(b => b.userId === job.assignedTo)?.userName || ''}
                />
              </View>
            )}

            <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Descripción</Text>
              <Text style={[styles.descriptionText, { color: C.muted }]}>{job.description}</Text>
            </View>

            <View style={[styles.infoGrid]}>
              <View style={[styles.infoItem, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[styles.infoLabel, { color: C.muted }]}>PRESUPUESTO</Text>
                <Text style={[styles.infoValue, { color: C.text }]}>${job.budgetMin}-${job.budgetMax}</Text>
              </View>
              <View style={[styles.infoItem, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[styles.infoLabel, { color: C.muted }]}>PROPUESTAS</Text>
                <Text style={[styles.infoValue, { color: C.text }]}>{job.bids?.length || 0}</Text>
              </View>
            </View>

            {job.bids && job.bids.length > 0 && canManage && (
              <View style={[styles.bidsSection, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[styles.sectionTitle, { color: C.text }]}>Propuestas recibidas</Text>
                {job.bids.map((bid, index) => {
                  const isAccepted = job.status !== 'open' && bid.userId === job.assignedTo;
                  const isRejected = job.status !== 'open' && bid.userId !== job.assignedTo;
                  return (
                    <View key={index} style={[styles.bidCard, { backgroundColor: C.bg, borderColor: isAccepted ? COLORS.green + '55' : C.border, opacity: isRejected ? 0.45 : 1 }]}>
                      <View style={styles.bidHeader}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.bidUserName, { color: C.text, textDecorationLine: isRejected ? 'line-through' : 'none' }]}>{bid.userName}</Text>
                            {isAccepted && <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.green, backgroundColor: COLORS.green + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>ELEGIDO</Text>}
                          </View>
                          <TouchableOpacity onPress={() => onViewWorkerProfile?.(bid.userId)}>
                            <Text style={styles.bidViewProfile}>Ver perfil del trabajador →</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.bidPrice, { textDecorationLine: isRejected ? 'line-through' : 'none', color: isRejected ? C.muted : COLORS.accent }]}>${bid.price}</Text>
                      </View>
                      <Text style={[styles.bidMessage, { color: C.muted }]}>{bid.message}</Text>

                      {job.status === 'open' && (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                          <TouchableOpacity
                            style={[styles.chatButtonInline, { flex: 1 }]}
                            onPress={() => openChat(bid.userId)}
                          >
                            <Text style={styles.chatButtonText}>💬 Chatear</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.acceptButton, { flex: 1, marginTop: 0 }]}
                            onPress={() => handleAcceptBid(bid)}
                          >
                            <Text style={styles.acceptButtonText}>✓ Aceptar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {canBid && job.paymentMethod !== 'cash' && !user.stripeAccountId && (
              <TouchableOpacity
                style={{ backgroundColor: COLORS.yellow + '22', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.yellow + '55' }}
                onPress={() => setShowBankingOnboarding(true)}
              >
                <Ionicons name="alert-circle" size={20} color={COLORS.yellow} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.yellow, fontWeight: '700', fontSize: 13 }}>Cuenta de pagos no configurada</Text>
                  <Text style={{ color: COLORS.yellow, fontSize: 12, opacity: 0.85 }}>Necesitas conectar tu cuenta bancaria para cobrar este trabajo. Toca aquí para configurarla →</Text>
                </View>
              </TouchableOpacity>
            )}

            {canBid && (
              <View style={[styles.bidFormSection, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[styles.sectionTitle, { color: C.text }]}>Hacer una propuesta</Text>

                <Text style={[styles.formLabel, { color: C.muted }]}>TU PRECIO (MXN)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={bidPrice}
                  onChangeText={setBidPrice}
                  placeholder={`Entre $${job.budgetMin} y $${job.budgetMax}`}
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                />

                <Text style={[styles.formLabel, { color: C.muted }]}>MENSAJE (OPCIONAL)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={bidMessage}
                  onChangeText={setBidMessage}
                  placeholder="Explica por qué eres la mejor opción..."
                  placeholderTextColor={C.muted}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity 
                  style={[styles.primaryButton, loading && { opacity: 0.6 }]}
                  onPress={handleBid}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Enviar propuesta →</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {canManage && job.status === 'assigned' && (
              <>
                {job.paymentMethod === 'card' && job.assignedPrice && (
                  <View style={{ padding: 12, backgroundColor: COLORS.accent + '15', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.accent + '40' }}>
                    <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 13, textAlign: 'center' }}>
                      Total al completar: ${paymentTotal} MXN
                      {job.isUrgent ? ` (incluye $${URGENT_JOB_PRICE} urgente)` : ''}
                    </Text>
                  </View>
                )}
                {job.paymentRequested ? (
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: COLORS.green, borderColor: COLORS.green }]}
                    onPress={handleOpenPayment}
                  >
                    <Text style={[styles.completeButtonText, { color: '#fff' }]}>💳 Pagar ahora — ${paymentTotal} MXN</Text>
                  </TouchableOpacity>
                ) : job.clientConfirmed ? (
                  <View style={[styles.completeButton, { backgroundColor: COLORS.green + '15', borderColor: COLORS.green }]}>
                    <Text style={[styles.completeButtonText, { color: COLORS.green }]}>✓ Confirmado — esperando al trabajador</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.completeButton} onPress={handleMarkComplete}>
                    <Text style={styles.completeButtonText}>✓ Confirmar trabajo completado</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {canManage && (job.status === 'open' || job.status === 'assigned') && (
              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: COLORS.red + '15', borderColor: COLORS.red + '60', marginTop: 8 }]}
                onPress={handleCancelJob}
              >
                <Text style={[styles.completeButtonText, { color: COLORS.red }]}>✕ Cancelar trabajo</Text>
              </TouchableOpacity>
            )}

            {alreadyBid && !canManage && (
              <View style={styles.alreadyBidBox}>
                <Text style={styles.alreadyBidText}>
                  ✓ Ya hiciste una propuesta de ${myBid?.price}
                </Text>
              </View>
            )}

            {isWorker && job.assignedTo === user.id && job.status === 'assigned' && (
              <>
                {job.workerConfirmed ? (
                  <View style={[styles.completeButton, { backgroundColor: COLORS.green + '15', borderColor: COLORS.green }]}>
                    <Text style={[styles.completeButtonText, { color: COLORS.green }]}>✓ Finalizado — esperando confirmación del cliente</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: COLORS.green + '22', borderColor: COLORS.green }]}
                    onPress={handleWorkerMarkComplete}
                  >
                    <Text style={[styles.completeButtonText, { color: COLORS.green }]}>✓ Finalizar trabajo</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.completeButton, { backgroundColor: COLORS.red + '15', borderColor: COLORS.red + '60', marginTop: 8 }]}
                  onPress={() => {
                    Alert.alert('¿Qué deseas hacer?', '', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: '📅 Proponer nuevo horario', onPress: async () => {
                        try {
                          const chatPartnerId = job.userId;
                          const newChatId = await getOrCreateChat(user.id, chatPartnerId, job.id);
                          const partnerDoc = await getDoc(doc(db, 'users', chatPartnerId));
                          setOtherUser({ id: chatPartnerId, ...partnerDoc.data() });
                          setChatId(newChatId);
                          setShowChat(true);
                        } catch { Alert.alert('Error', 'No se pudo abrir el chat'); }
                      }},
                      { text: '✕ No puedo atender (rechazar)', style: 'destructive', onPress: async () => {
                        try {
                          await updateDoc(doc(db, 'jobs', job.id), { status: 'open', assignedTo: null, assignedWorkerName: null, assignedPrice: null });
                          await createNotification(job.userId, 'worker_rejected', user.name, { jobTitle: job.title, jobId: job.id });
                          const workerRef = doc(db, 'users', user.id);
                          const workerSnap = await getDoc(workerRef);
                          const cancels = (workerSnap.data()?.cancellationCount || 0) + 1;
                          await updateDoc(workerRef, { cancellationCount: cancels });
                          Alert.alert('Trabajo rechazado', 'El cliente ha sido notificado.');
                          onClose();
                        } catch { Alert.alert('Error', 'No se pudo rechazar el trabajo'); }
                      }},
                    ]);
                  }}
                >
                  <Text style={[styles.completeButtonText, { color: COLORS.red }]}>✕ No puedo atender este trabajo</Text>
                </TouchableOpacity>
              </>
            )}

            {canManage && job.status === 'assigned' && (
              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: COLORS.purple + '15', borderColor: COLORS.purple + '60', marginTop: 8 }]}
                onPress={() => {
                  Alert.alert('Cambiar trabajador', '¿Deseas cancelar la asignación actual y re-abrir el trabajo para recibir nuevas propuestas?', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Re-abrir', onPress: async () => {
                      try {
                        const prevWorker = job.assignedTo;
                        await updateDoc(doc(db, 'jobs', job.id), { status: 'open', assignedTo: null, assignedWorkerName: null, assignedPrice: null });
                        if (prevWorker) await createNotification(prevWorker, 'bid_declined', user.name, { jobTitle: job.title, jobId: job.id });
                        Alert.alert('✓ Re-abierto', 'El trabajo está abierto a nuevas propuestas.');
                        onClose();
                      } catch { Alert.alert('Error', 'No se pudo re-abrir el trabajo'); }
                    }},
                  ]);
                }}
              >
                <Text style={[styles.completeButtonText, { color: COLORS.purple }]}>↺ Cambiar trabajador</Text>
              </TouchableOpacity>
            )}

            {/* Dispute section — shown 48h after completion if not yet disputed */}
            {canDispute && !showDisputeForm && (
              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: COLORS.red + '10', borderColor: COLORS.red + '40', marginTop: 8 }]}
                onPress={() => setShowDisputeForm(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.red} />
                  <Text style={[styles.completeButtonText, { color: COLORS.red }]}>Abrir disputa</Text>
                </View>
              </TouchableOpacity>
            )}

            {showDisputeForm && (
              <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: COLORS.red + '55', marginTop: 8 }]}>
                <Text style={[styles.sectionTitle, { color: COLORS.red, marginBottom: 8 }]}>Abrir disputa</Text>
                <Text style={[styles.formLabel, { color: C.muted }]}>MOTIVO</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={disputeReason}
                  onChangeText={setDisputeReason}
                  placeholder="Ej: Trabajo no completado, cobro excesivo..."
                  placeholderTextColor={C.muted}
                />
                <Text style={[styles.formLabel, { color: C.muted, marginTop: 8 }]}>DESCRIPCIÓN</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={disputeDesc}
                  onChangeText={setDisputeDesc}
                  placeholder="Describe detalladamente el problema..."
                  placeholderTextColor={C.muted}
                  multiline
                  numberOfLines={3}
                />
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 4, marginBottom: 8 }}>
                  El equipo de Taskly revisará tu caso en 48 horas hábiles.
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[styles.completeButton, { flex: 1, backgroundColor: C.bg, borderColor: C.border }]} onPress={() => setShowDisputeForm(false)}>
                    <Text style={[styles.completeButtonText, { color: C.muted }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.completeButton, { flex: 1, backgroundColor: COLORS.red + '22', borderColor: COLORS.red }]} onPress={handleOpenDispute} disabled={disputeLoading}>
                    {disputeLoading ? <ActivityIndicator size="small" color={COLORS.red} /> : <Text style={[styles.completeButtonText, { color: COLORS.red }]}>Enviar</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {job.disputed && (
              <View style={[styles.infoBox, { backgroundColor: COLORS.red + '10', borderColor: COLORS.red + '30', marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Ionicons name="alert-circle" size={16} color={COLORS.red} />
                <Text style={{ color: COLORS.red, fontSize: 13 }}>Disputa abierta — en revisión por Taskly</Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {showRating && job.assignedTo && (
          <RatingModal
            job={job}
            worker={isMyJob ? { id: job.assignedTo, name: job.assignedWorkerName } : null}
            client={!isMyJob ? { id: job.userId, name: job.userName } : null}
            onClose={() => {
              setShowRating(false);
              onClose();
              if (onRefresh) onRefresh();
            }}
            onSubmit={handleSubmitRating}
            ratingType={isMyJob ? 'worker' : 'client'}
          />
        )}

        {showPayment && (
          <PaymentModal
            amount={paymentTotal}
            description={`${job.title}${job.isUrgent ? ' + Urgente' : ''}`}
            workerId={job.assignedTo}
            clientEmail={user.email || null}
            onSuccess={finalizeCompletion}
            onClose={() => setShowPayment(false)}
          />
        )}

        {showLocationPicker && (
          <LocationPickerModal
            initialLocation={job.estimatedLocation}
            onConfirm={handleLocationConfirm}
            onClose={() => setShowLocationPicker(false)}
            userId={user.id}
          />
        )}

        {showBankingOnboarding && (
          <BankingOnboardingModal
            userId={user.id}
            userName={user.name}
            onDone={() => setShowBankingOnboarding(false)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Worker Profile Modal (with rating hide/show toggle)
function ProposeExistingJobModal({ worker, client, onClose }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  useEffect(() => {
    getDocs(query(collection(db, 'jobs'), where('userId', '==', client.id), where('status', '==', 'open')))
      .then(snap => {
        setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const handleInvite = async (job) => {
    setSending(job.id);
    try {
      await createNotification(worker.id, 'job_invite', client.name, { jobTitle: job.title, jobId: job.id });
      Alert.alert('✓ Invitación enviada', `${worker.name} fue invitado a proponer en "${job.title}"`);
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo enviar la invitación.');
    }
    setSending(null);
  };

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={[styles.container]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>← Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Proponer trabajo existente</Text>
          <View style={{ width: 80 }} />
        </View>
        <Text style={{ color: COLORS.muted, fontSize: 13, paddingHorizontal: 20, paddingVertical: 10 }}>
          Selecciona uno de tus trabajos abiertos para invitar a {worker.name} a proponer.
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color={COLORS.muted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyStateText}>No tienes trabajos abiertos</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={j => j.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => (
              <View style={[styles.bidCard, { flexDirection: 'row', alignItems: 'center' }]}>
                <ServiceIcon type={item.type} size={44} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.bidUserName}>{item.title}</Text>
                  <Text style={styles.jobLocation}>💰 ${item.budgetMin}–${item.budgetMax}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.acceptButton, { paddingHorizontal: 14 }, sending === item.id && { opacity: 0.5 }]}
                  onPress={() => handleInvite(item)}
                  disabled={!!sending}
                >
                  {sending === item.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.acceptButtonText}>Invitar</Text>}
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

function DirectProposalButton({ worker, client }) {
  const [showPost, setShowPost] = useState(false);
  const [showExisting, setShowExisting] = useState(false);
  return (
    <>
      <TouchableOpacity style={[styles.primaryButton, { marginTop: 16 }]} onPress={() => setShowPost(true)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="paper-plane-outline" size={16} color="#fff" />
          <Text style={styles.primaryButtonText}>Proponer trabajo directo</Text>
        </View>
      </TouchableOpacity>
      {client.role === 'client' && (
        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 8, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]}
          onPress={() => setShowExisting(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="briefcase-outline" size={16} color={COLORS.accent} />
            <Text style={[styles.primaryButtonText, { color: COLORS.accent }]}>Proponer trabajo existente</Text>
          </View>
        </TouchableOpacity>
      )}
      {showPost && <PostJobScreen user={client} targetWorker={worker} onClose={() => setShowPost(false)} />}
      {showExisting && <ProposeExistingJobModal worker={worker} client={client} onClose={() => setShowExisting(false)} />}
    </>
  );
}

function WorkerAreaPreview({ worker }) {
  const [expanded, setExpanded] = useState(false);
  const center = MONTERREY_LOCATIONS.find(l => l.name === worker.serviceCenterZone) || MONTERREY_LOCATIONS[1];
  const radius = worker.serviceRadius || 20;
  const radiusLabel = radius === 999 ? 'Sin límite' : `${radius} km`;
  const additionalAreas = (worker.serviceAreas || []).filter(a => a !== worker.serviceCenterZone);
  const radiusMeters = radius === 999 ? 50000 : radius * 1000;
  // 1 degree lat ≈ 111 km — pad slightly so circle fits in view
  const delta = (radiusMeters / 111000) * 2.4;

  return (
    <View style={{ marginTop: 12, width: '100%' }}>
      <Text style={[styles.formLabel, { textAlign: 'center' }]}>ÁREA DE SERVICIO</Text>
      <TouchableOpacity onPress={() => setExpanded(e => !e)}
        style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="location-outline" size={18} color={COLORS.accent} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 13 }}>{worker.serviceCenterZone || 'Monterrey'}</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>Radio: {radiusLabel}{worker.workOutsideArea ? ' · Acepta trabajo fuera' : ''}</Text>
        </View>
        <Text style={{ color: COLORS.muted, fontSize: 13 }}>{expanded ? '▲' : '▼ Ver área'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden' }}>
          <MapView
            style={{ width: '100%', height: 160 }}
            initialRegion={{
              latitude: center.lat,
              longitude: center.lng,
              latitudeDelta: delta,
              longitudeDelta: delta,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Circle
              center={{ latitude: center.lat, longitude: center.lng }}
              radius={radiusMeters}
              strokeColor={COLORS.accent}
              strokeWidth={2}
              fillColor={COLORS.accent + '30'}
            />
            <Marker coordinate={{ latitude: center.lat, longitude: center.lng }} pinColor={COLORS.accent} />
          </MapView>
          {additionalAreas.length > 0 && (
            <View style={{ backgroundColor: COLORS.card, padding: 10 }}>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>También trabaja en: {additionalAreas.join(' · ')}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function WorkerProfileModal({ worker, currentUser, onClose, favoriteIds = [], onToggleFavorite }) {
  const [ratings, setRatings] = useState([]);
  const [hiddenIds, setHiddenIds] = useState(new Set(worker.hiddenRatings || []));
  const [loading, setLoading] = useState(true);
  const isOwnProfile = currentUser.id === worker.id;

  useEffect(() => { loadRatings(); }, []);

  const loadRatings = async () => {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('workerId', '==', worker.id),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setRatings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ✅ Toggle hide/show per rating
  const toggleRatingVisibility = async (ratingId) => {
    const next = new Set(hiddenIds);
    if (next.has(ratingId)) next.delete(ratingId);
    else next.add(ratingId);
    setHiddenIds(next);
    try {
      await updateDoc(doc(db, 'users', worker.id), { hiddenRatings: [...next] });
    } catch { Alert.alert('Error', 'No se pudo actualizar la visibilidad'); }
  };

  const publicRatings = ratings.filter(r => !hiddenIds.has(r.id));
  const hiddenRatings = ratings.filter(r => hiddenIds.has(r.id));
  const isFav = favoriteIds.includes(worker.id);

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>← Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{isOwnProfile ? 'Mi Perfil' : 'Perfil'}</Text>
          {!isOwnProfile ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {onToggleFavorite && (
                <TouchableOpacity onPress={() => onToggleFavorite(worker.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? COLORS.accent : COLORS.muted} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Reportar trabajador', '¿Por qué quieres reportar este perfil?', [
                    { text: 'Información falsa', onPress: () => submitReport('fake_profile', 'user', worker.id, currentUser.id) },
                    { text: 'Comportamiento inapropiado', onPress: () => submitReport('inappropriate', 'user', worker.id, currentUser.id) },
                    { text: 'Fraude', onPress: () => submitReport('fraud', 'user', worker.id, currentUser.id) },
                    { text: 'Cancelar', style: 'cancel' },
                  ]);
                }}
                style={{ paddingHorizontal: 4, paddingVertical: 4 }}
              >
                <Ionicons name="flag-outline" size={20} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
          ) : <View style={{ width: 60 }} />}
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.workerProfileHeader}>
            {worker.profileImage
              ? <Image source={{ uri: worker.profileImage }} style={styles.workerProfileImage} />
              : <View style={styles.workerProfileAvatar}>
                  <Text style={styles.workerProfileAvatarText}>{worker.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
            }
            <Text style={styles.workerProfileName}>{worker.name}</Text>
            {worker.rating > 0 && (
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <StarRating rating={Math.round(worker.rating)} size={24} />
                <Text style={styles.workerProfileRating}>
                  {worker.rating.toFixed(1)} · {worker.jobCount || 0} trabajos
                </Text>
              </View>
            )}
            {worker.bio && <Text style={styles.workerProfileBio}>{worker.bio}</Text>}

            <TrustBadges worker={worker} />

            {/* Cancellation warning — only shown to the worker themselves */}
            {isOwnProfile && (worker.cancellationCount || 0) >= 2 && (
              <View style={{ marginTop: 10, backgroundColor: COLORS.red + '15', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.red + '44', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="warning-outline" size={16} color={COLORS.red} />
                <Text style={{ color: COLORS.red, fontSize: 12 }}>
                  Has rechazado {worker.cancellationCount} trabajos asignados. Demasiados rechazos pueden afectar tu visibilidad.
                </Text>
              </View>
            )}

            {/* Specialties */}
            {worker.specialties?.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, justifyContent: 'center' }}>
                {worker.specialties.map(id => {
                  const s = SERVICES.find(x => x.id === id);
                  return s ? (
                    <View key={id} style={[styles.specialtyChip, { backgroundColor: s.color + '22', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <Ionicons name={s.icon} size={12} color={s.color} />
                      <Text style={{ color: s.color, fontSize: 12 }}>{s.label}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            )}

            {/* Service area — always shown if center zone exists */}
            {(worker.serviceCenterZone || worker.serviceAreas?.length > 0) && (
              <WorkerAreaPreview worker={worker} />
            )}

            {/* Availability */}
            {worker.availability?.days?.length > 0 && (
              <View style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={styles.formLabel}>DISPONIBILIDAD</Text>
                <Text style={{ color: COLORS.muted, fontSize: 13 }}>
                  {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].filter((_, i) => worker.availability.days.includes(i)).join(', ')}
                  {worker.availability.startTime ? ` · ${worker.availability.startTime} – ${worker.availability.endTime}` : ''}
                </Text>
              </View>
            )}

            {/* Business badge */}
            {worker.businessName && (
              <View style={{ marginTop: 12, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Ionicons name="business-outline" size={18} color={COLORS.muted} />
                <Text style={{ color: COLORS.text, fontWeight: '700' }}>{worker.businessName}</Text>
              </View>
            )}

            {/* Direct proposal button (clients only, viewing another worker) */}
            {currentUser.role === 'client' && !isOwnProfile && (
              <DirectProposalButton worker={worker} client={currentUser} />
            )}
          </View>

          {/* ✅ Hidden ratings section (only visible to the worker) */}
          {isOwnProfile && hiddenRatings.length > 0 && (
            <View style={styles.hiddenRatingsSection}>
              <Text style={styles.sectionTitle}>🙈 Ocultas del perfil público ({hiddenRatings.length})</Text>
              {hiddenRatings.map(r => (
                <View key={r.id} style={[styles.ratingCard, { opacity: 0.65 }]}>
                  <View style={styles.ratingHeader}>
                    <StarRating rating={r.rating} size={14} />
                    <Text style={styles.ratingDate}>{r.createdAt?.toDate().toLocaleDateString()}</Text>
                  </View>
                  {r.review ? <Text style={styles.ratingReview}>"{r.review}"</Text> : null}
                  <TouchableOpacity style={styles.showRatingBtn} onPress={() => toggleRatingVisibility(r.id)}>
                    <Text style={styles.showRatingText}>👁 Hacer visible al público</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>
              ⭐ Reseñas públicas ({publicRatings.length})
              {isOwnProfile && <Text style={{ fontSize: 11, color: COLORS.muted }}> · Toca para ocultar</Text>}
            </Text>
            {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 12 }} />}
            {!loading && publicRatings.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>⭐</Text>
                <Text style={styles.emptyStateText}>Sin reseñas públicas aún</Text>
              </View>
            )}
            {publicRatings.map(r => (
              <View key={r.id} style={styles.ratingCard}>
                <View style={styles.ratingHeader}>
                  <StarRating rating={r.rating} size={16} />
                  <Text style={styles.ratingDate}>{r.createdAt?.toDate().toLocaleDateString()}</Text>
                </View>
                {r.review ? <Text style={styles.ratingReview}>"{r.review}"</Text> : null}
                {/* ✅ Hide button only visible to the worker */}
                {isOwnProfile && (
                  <TouchableOpacity style={styles.hideRatingBtn} onPress={() => toggleRatingVisibility(r.id)}>
                    <Text style={styles.hideRatingText}>🙈 Ocultar del perfil público</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
// Workers Directory Screen
function WorkersDirectoryScreen({ onClose, onSelectWorker }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'worker')
      );
      
      const snapshot = await getDocs(q);
      const workersData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        workersData.push({
          id: doc.id,
          ...data,
          rating: data.rating || 0,
          jobCount: data.jobCount || 0,
          topReview: data.topReview || null,
        });
      });
      
      workersData.sort((a, b) => b.rating - a.rating);
      
      setWorkers(workersData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading workers:', error);
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>← Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Trabajadores</Text>
          <View style={{ width: 80 }} />
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
          <FlatList
            data={workers}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.workersList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>👷</Text>
                <Text style={styles.emptyStateText}>No hay trabajadores registrados</Text>
              </View>
            }
            renderItem={({ item }) => (
              <WorkerCard worker={item} onPress={onSelectWorker} showReviews={true} />
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Profile Screen (with image upload)
// Settings helpers
function SettingsRow({ icon, title, subtitle, rightElement, onPress, destructive = false, disabled = false }) {
  const C = useTheme();
  const inner = (
    <View style={[styles.settingsRow, disabled && { opacity: 0.45 }]}>
      <View style={[styles.settingsRowIcon, { backgroundColor: C.bg }]}>
        <Ionicons name={icon} size={18} color={destructive ? COLORS.red : C.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingsRowTitle, { color: C.text }, destructive && { color: COLORS.red }]}>{title}</Text>
        {subtitle ? <Text style={[styles.settingsRowSubtitle, { color: C.muted }]}>{subtitle}</Text> : null}
      </View>
      {rightElement ? rightElement : (onPress && !disabled ? <Text style={[styles.settingsRowChevron, { color: C.muted }]}>›</Text> : null)}
    </View>
  );
  if (onPress && !disabled) return <TouchableOpacity onPress={onPress}>{inner}</TouchableOpacity>;
  return inner;
}

function SettingsScreen({ user, userProfile, onClose, onEditProfile, onShowOnboarding, themeMode, onThemeChange }) {
  const C = useTheme();
  const [notifPush, setNotifPush] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifJobs, setNotifJobs] = useState(true);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const [showJoinBusiness, setShowJoinBusiness] = useState(false);
  const [businessCode, setBusinessCode] = useState('');
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState({ upcoming: [], inProcess: [], completed: [] });
  const [phLoading, setPhLoading] = useState(false);
  const [phDateFilter, setPhDateFilter] = useState('all');
  const [phPayoutStatus, setPhPayoutStatus] = useState(null);

  const loadPaymentHistory = async () => {
    setPhLoading(true);
    try {
      const field = user.role === 'worker' ? 'assignedTo' : 'userId';
      const byDate = (a, b) => {
        const ts = j => j.completedAt?.toMillis?.() ?? j.paymentInitiatedAt?.toMillis?.() ?? j.createdAt?.toMillis?.() ?? 0;
        return ts(b) - ts(a);
      };
      // Single-field query, then client-side filter by status — avoids needing composite indexes
      const snap = await getDocs(query(collection(db, 'jobs'), where(field, '==', user.id)));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPaymentHistory({
        upcoming:  all.filter(j => j.status === 'assigned').sort(byDate),
        inProcess: all.filter(j => j.status === 'pending_payment').sort(byDate),
        completed: all.filter(j => j.status === 'completed').sort(byDate),
      });
      // Fetch real Stripe payout data for workers
      if (user.role === 'worker' && userProfile?.stripeAccountId) {
        fetch(`${BACKEND_URL}/worker-payout-status/${userProfile.stripeAccountId}`)
          .then(r => r.json())
          .then(data => { if (!data.error) setPhPayoutStatus(data); })
          .catch(() => {});
      }
    } catch (e) {
      console.error('loadPaymentHistory error:', e.message);
    }
    setPhLoading(false);
  };

  useEffect(() => {
    AsyncStorage.getItem('notif_push').then(v => v !== null && setNotifPush(v === 'true'));
    AsyncStorage.getItem('notif_chat').then(v => v !== null && setNotifChat(v === 'true'));
    AsyncStorage.getItem('notif_jobs').then(v => v !== null && setNotifJobs(v === 'true'));
  }, []);

  const saveNotif = async (key, setter, value) => {
    setter(value);
    await AsyncStorage.setItem(key, String(value));
  };

  const handleSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut(auth) },
    ]);

  const handleDeleteAccount = () =>
    Alert.alert('Eliminar cuenta', 'Esta acción es irreversible. Todos tus datos serán eliminados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar mi cuenta',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', user.id));
            await auth.currentUser.delete();
          } catch {
            Alert.alert('Error', 'Cierra sesión, vuelve a iniciar y luego intenta eliminar la cuenta.');
          }
        },
      },
    ]);

  const handlePasswordReset = () => {
    if (!user.email) {
      Alert.alert('Sin email', 'Tu cuenta no tiene email asociado.');
      return;
    }
    Alert.alert('Restablecer contraseña', `Se enviará un correo a ${user.email} con instrucciones para cambiar tu contraseña.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar correo',
        onPress: async () => {
          try {
            await sendPasswordResetEmail(auth, user.email);
            Alert.alert('✓ Correo enviado', 'Revisa tu bandeja de entrada y sigue las instrucciones.');
          } catch (e) {
            Alert.alert('Error', 'No se pudo enviar el correo. Intenta más tarde.');
          }
        },
      },
    ]);
  };

  const handleResetOnboarding = () =>
    Alert.alert('Ver tutorial', '¿Ver el tutorial de nuevo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Ver tutorial',
        onPress: async () => {
          await AsyncStorage.removeItem('taskly_onboarded');
          onClose();
          onShowOnboarding?.();
        },
      },
    ]);

  const clearCache = () =>
    Alert.alert('Limpiar caché', '¿Borrar preferencias y datos temporales?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpiar',
        onPress: async () => {
          await AsyncStorage.multiRemove(['notif_push', 'notif_chat', 'notif_jobs']);
          setNotifPush(true); setNotifChat(true); setNotifJobs(true);
          Alert.alert('✓ Caché limpiado');
        },
      },
    ]);

  const handleCreateBusiness = async (name, description) => {
    if (!name.trim()) return;
    try {
      const ref = await addDoc(collection(db, 'businesses'), {
        name: name.trim(),
        description: description.trim(),
        ownerId: user.id,
        ownerName: user.name,
        memberIds: [user.id],
        services: [],
        verificationStatus: 'pending',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', user.id), { businessId: ref.id, businessRole: 'owner' });
      setShowCreateBusiness(false);
      Alert.alert('✓ Empresa registrada', 'Tu empresa fue registrada y está en revisión. La publicaremos una vez verificada.');
    } catch {
      Alert.alert('Error', 'No se pudo crear la empresa. Intenta de nuevo.');
    }
  };

  const handleJoinBusiness = async () => {
    if (!businessCode.trim()) return;
    const snap = await getDocs(query(collection(db, 'businesses'), where('joinCode', '==', businessCode.trim())));
    if (snap.empty) {
      Alert.alert('Código inválido', 'No encontramos una empresa con ese código.');
      return;
    }
    const bizDoc = snap.docs[0];
    await createNotification(bizDoc.data().ownerId, 'direct_proposal', user.name, { jobTitle: `Solicitud de unión a ${bizDoc.data().name}`, jobId: bizDoc.id });
    setShowJoinBusiness(false);
    Alert.alert('✓ Solicitud enviada', 'El dueño de la empresa recibirá tu solicitud para unirse.');
  };

  const verifyLabel = { unverified: '❌ Sin verificar', pending: '⏳ En revisión', verified: '✓ Verificado' };
  const verifyStatus = verifyLabel[userProfile?.verificationStatus] || '❌ Sin verificar';

  const switchProps = (value, setter, key) => ({
    rightElement: (
      <Switch
        value={value}
        onValueChange={v => saveNotif(key, setter, v)}
        trackColor={{ false: COLORS.border, true: COLORS.accent }}
        thumbColor="#fff"
      />
    ),
  });

  const themeOptions = [
    { key: 'dark', label: 'Oscuro', icon: 'moon-outline' },
    { key: 'light', label: 'Claro', icon: 'sunny-outline' },
    { key: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
  ];

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />
        <View style={[styles.modalHeader, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: COLORS.accent }]}>← Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>Configuración</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.settingsScroll, { backgroundColor: C.bg }]}>

          {/* CUENTA */}
          <Text style={[styles.settingsSectionLabel, { color: C.muted }]}>CUENTA</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <SettingsRow icon="person-outline" title="Editar perfil" subtitle="Nombre, foto, descripción" onPress={onEditProfile} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="mail-outline" title={user.email || user.phone || 'Sin contacto registrado'} disabled />
            {user.email && <>
              <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
              <SettingsRow icon="key-outline" title="Restablecer contraseña" subtitle="Enviar correo de cambio" onPress={handlePasswordReset} />
            </>}
            {user.role === 'worker' && <>
              <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
              <SettingsRow icon="card-outline" title="Verificación de identidad" subtitle={verifyStatus} onPress={onEditProfile} />
            </>}
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="log-out-outline" title="Cerrar sesión" onPress={handleSignOut} destructive />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="trash-outline" title="Eliminar cuenta" subtitle="Acción irreversible" onPress={handleDeleteAccount} destructive />
          </View>

          {/* EMPRESA (workers only) */}
          {user.role === 'worker' && (
            <>
              <Text style={[styles.settingsSectionLabel, { color: C.muted }]}>EMPRESA</Text>
              <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
                {!userProfile?.businessId ? (
                  <>
                    <SettingsRow icon="business-outline" title="Registrar empresa" subtitle="Añade tu empresa o negocio" onPress={() => setShowCreateBusiness(true)} />
                    <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
                    <SettingsRow icon="people-outline" title="Unirme a una empresa" subtitle="Ingresa el código de invitación" onPress={() => setShowJoinBusiness(true)} />
                  </>
                ) : (
                  <SettingsRow
                    icon="business-outline"
                    title="Empresa vinculada"
                    subtitle={userProfile.businessRole === 'owner' ? 'Eres el dueño' : 'Eres miembro'}
                    disabled
                  />
                )}
              </View>
            </>
          )}

          {/* APARIENCIA */}
          <Text style={[styles.settingsSectionLabel, { color: C.muted }]}>APARIENCIA</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={{ padding: 16 }}>
              <Text style={[styles.settingsRowTitle, { color: C.text, marginBottom: 12 }]}>Tema de la aplicación</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {themeOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => onThemeChange?.(opt.key)}
                    style={[styles.themeChip, { backgroundColor: C.bg, borderColor: C.border }, themeMode === opt.key && styles.themeChipActive]}
                  >
                    <Ionicons name={opt.icon} size={18} color={themeMode === opt.key ? COLORS.accent : C.muted} />
                    <Text style={[styles.themeChipText, { color: C.muted }, themeMode === opt.key && styles.themeChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* NOTIFICACIONES */}
          <Text style={[styles.settingsSectionLabel, { color: C.muted }]}>NOTIFICACIONES</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <SettingsRow icon="notifications-outline" title="Notificaciones push" {...switchProps(notifPush, setNotifPush, 'notif_push')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="chatbubble-outline" title="Mensajes de chat" {...switchProps(notifChat, setNotifChat, 'notif_chat')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow
              icon="briefcase-outline"
              title={user.role === 'client' ? 'Propuestas recibidas' : 'Actualizaciones de trabajos'}
              {...switchProps(notifJobs, setNotifJobs, 'notif_jobs')}
            />
          </View>

          {/* PRIVACIDAD Y SEGURIDAD */}
          <Text style={[styles.settingsSectionLabel, { color: C.muted }]}>PRIVACIDAD Y SEGURIDAD</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <SettingsRow icon="location-outline" title="Permiso de ubicación" subtitle="Gestionar en Ajustes del sistema" onPress={() => Linking.openSettings()} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="camera-outline" title="Permiso de cámara y galería" subtitle="Gestionar en Ajustes del sistema" onPress={() => Linking.openSettings()} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow
              icon="finger-print-outline"
              title="Face ID / Touch ID"
              subtitle="Próximamente disponible"
              disabled
              rightElement={<Switch value={false} disabled trackColor={{ false: C.border }} thumbColor="#fff" />}
            />
          </View>

          {/* PAGOS */}
          <Text style={[styles.settingsSectionLabel, { color: C.muted }]}>PAGOS</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <SettingsRow icon="card-outline" title="Historial de pagos" subtitle="Ver trabajos completados y montos" onPress={() => { loadPaymentHistory(); setShowPaymentHistory(true); }} />
          </View>

          {/* AYUDA Y SOPORTE */}
          <Text style={[styles.settingsSectionLabel, { color: C.muted }]}>AYUDA Y SOPORTE</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <SettingsRow
              icon="help-circle-outline"
              title="Preguntas frecuentes"
              onPress={() => Alert.alert('Preguntas frecuentes',
                '¿Cómo publico un trabajo?\nToca el botón "+" y llena el formulario.\n\n¿Cómo contacto a un trabajador?\nDesde el detalle del trabajo, abre el chat.\n\n¿Qué es un trabajo urgente?\nDestaca tu trabajo por $25 MXN para que aparezca al inicio.\n\n¿Cómo califico a un trabajador?\nUna vez completado el trabajo se solicita una reseña.\n\n¿Cómo verifico mi cuenta?\nVe a Perfil → Verificación de identidad y sube tu INE.'
              )}
            />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="call-outline" title="Contactar soporte" subtitle="soporte@taskly.com.mx" onPress={() => Linking.openURL('mailto:soporte@taskly.com.mx?subject=Soporte Taskly')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="flag-outline" title="Reportar un problema" onPress={() => Linking.openURL('mailto:soporte@taskly.com.mx?subject=Reporte de problema')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="document-text-outline" title="Términos de servicio" onPress={() => Alert.alert('Términos de servicio', 'Disponibles próximamente en taskly.mx/terminos')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="shield-checkmark-outline" title="Política de privacidad" onPress={() => Alert.alert('Política de privacidad', 'Disponible próximamente en taskly.mx/privacidad')} />
          </View>

          {/* ACERCA DE */}
          <Text style={[styles.settingsSectionLabel, { color: C.muted }]}>ACERCA DE</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <SettingsRow icon="information-circle-outline" title="Taskly" subtitle="Versión 1.0.0 · Monterrey, México" disabled />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="school-outline" title="Ver tutorial nuevamente" subtitle="Vuelve a ver la introducción" onPress={handleResetOnboarding} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="trash-outline" title="Limpiar caché" subtitle="Borra preferencias y datos temporales" onPress={clearCache} />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Create Business Modal */}
      {showCreateBusiness && (
        <CreateBusinessInlineModal
          onConfirm={handleCreateBusiness}
          onClose={() => setShowCreateBusiness(false)}
        />
      )}

      {/* Join Business Modal */}
      {showJoinBusiness && (
        <Modal visible animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.actionSheet}>
              <Text style={[styles.sectionHeader, { marginBottom: 4 }]}>Unirse a empresa</Text>
              <Text style={{ color: COLORS.muted, marginBottom: 16, fontSize: 13 }}>Pide el código de invitación al dueño de la empresa.</Text>
              <TextInput
                style={styles.input}
                value={businessCode}
                onChangeText={setBusinessCode}
                placeholder="Código de empresa"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="none"
              />
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 12 }]} onPress={handleJoinBusiness}>
                <Text style={styles.primaryButtonText}>Enviar solicitud</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowJoinBusiness(false)} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: COLORS.muted }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Payment history modal */}
      {showPaymentHistory && (() => {
        const isWorkerView = user.role === 'worker';
        const now = new Date();
        const dateFilterFn = (item) => {
          const ref = item.completedAt || item.paymentInitiatedAt || item.createdAt;
          if (!ref || phDateFilter === 'all') return true;
          const d = ref.toDate?.() ?? new Date(ref);
          if (phDateFilter === 'month') return d >= new Date(now.getFullYear(), now.getMonth(), 1);
          if (phDateFilter === '3months') { const t = new Date(now); t.setMonth(t.getMonth() - 3); return d >= t; }
          if (phDateFilter === 'year') return d.getFullYear() === now.getFullYear();
          return true;
        };
        const upcoming  = paymentHistory.upcoming.filter(dateFilterFn);
        const inProcess = paymentHistory.inProcess.filter(dateFilterFn);
        const completed = paymentHistory.completed.filter(dateFilterFn);
        const totalCompleted = completed.reduce((s, i) => {
          const t = (i.assignedPrice || 0) + (i.isUrgent ? URGENT_JOB_PRICE : 0);
          return s + (isWorkerView ? Math.round(t * 0.975 * 100) / 100 : t);
        }, 0);
        const allEmpty = upcoming.length === 0 && inProcess.length === 0 && completed.length === 0;

        const PhCard = ({ item, colorAccent, statusLabel, statusIcon }) => {
          const total = (item.assignedPrice || 0) + (item.isUrgent ? URGENT_JOB_PRICE : 0);
          const commission = Math.round(total * 0.025 * 100) / 100;
          const workerReceives = Math.round((total - commission) * 100) / 100;
          const amount = isWorkerView ? workerReceives : total;
          const dateRef = item.completedAt || item.paymentInitiatedAt || item.createdAt;
          const dateLabel = dateRef?.toDate?.().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) || '—';
          return (
            <View style={{ backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: colorAccent + '55', overflow: 'hidden', marginBottom: 10 }}>
              <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>{item.title}</Text>
                    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{dateLabel}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colorAccent, fontWeight: '800', fontSize: 17 }}>${fmtMXN(amount)} MXN</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name={item.paymentMethod === 'cash' ? 'cash-outline' : 'card-outline'} size={12} color={C.muted} />
                      <Text style={{ color: C.muted, fontSize: 11 }}>{item.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colorAccent + '12', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={statusIcon} size={14} color={colorAccent} />
                <Text style={{ color: colorAccent, fontSize: 12, fontWeight: '700', flex: 1 }}>{statusLabel}</Text>
              </View>
              {item.paymentMethod === 'card' && item.status !== 'assigned' && (
                <View style={{ padding: 14, gap: 5 }}>
                  <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 2 }}>DESGLOSE</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: C.muted, fontSize: 13 }}>Precio acordado</Text>
                    <Text style={{ color: C.text, fontSize: 13 }}>${fmtMXN(item.assignedPrice)} MXN</Text>
                  </View>
                  {item.isUrgent && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: C.muted, fontSize: 13 }}>Cargo urgente</Text>
                      <Text style={{ color: C.text, fontSize: 13 }}>+${fmtMXN(URGENT_JOB_PRICE)} MXN</Text>
                    </View>
                  )}
                  {isWorkerView && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: C.muted, fontSize: 13 }}>Comisión Taskly (2.5%)</Text>
                      <Text style={{ color: COLORS.red, fontSize: 13 }}>-${fmtMXN(commission)} MXN</Text>
                    </View>
                  )}
                  <View style={{ height: 1, backgroundColor: C.border, marginVertical: 4 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>{isWorkerView ? 'Recibes' : 'Total'}</Text>
                    <Text style={{ color: colorAccent, fontWeight: '800', fontSize: 14 }}>${fmtMXN(amount)} MXN</Text>
                  </View>
                  {item.status === 'completed' && (
                    <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border }}>
                      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 }}>ESTADO DEL DEPÓSITO</Text>
                      <PaymentTracker
                        job={item}
                        payoutStatus={isWorkerView ? phPayoutStatus : null}
                        isWorker={isWorkerView}
                        clientName={isWorkerView ? (item.userName || '') : (user.name || '')}
                        workerName={isWorkerView ? (user.name || '') : (item.bids?.find(b => b.userId === item.assignedTo)?.userName || '')}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        };

        return (
          <Modal visible animationType="slide">
            <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
              <View style={[styles.modalHeader, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
                <TouchableOpacity onPress={() => setShowPaymentHistory(false)}>
                  <Text style={[styles.closeButton, { color: COLORS.accent }]}>← Cerrar</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: C.text }]}>Historial de pagos</Text>
                <TouchableOpacity onPress={loadPaymentHistory} style={{ padding: 8 }}>
                  <Ionicons name="refresh-outline" size={22} color={COLORS.accent} />
                </TouchableOpacity>
              </View>

              {/* Date filter bar */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 52 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: 'row', alignItems: 'center' }}>
                {[['all','Todo'],['month','Este mes'],['3months','3 meses'],['year','Este año']].map(([k, label]) => {
                  const active = phDateFilter === k;
                  return (
                    <TouchableOpacity key={k} onPress={() => setPhDateFilter(k)}
                      style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: active ? COLORS.accent : C.border, backgroundColor: active ? COLORS.accent + '22' : C.card }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: active ? COLORS.accent : C.muted }}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {phLoading ? (
                <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
              ) : allEmpty ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>💳</Text>
                  <Text style={[styles.emptyStateText, { color: C.muted }]}>No hay pagos en este período</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={phLoading} onRefresh={loadPaymentHistory} tintColor={COLORS.accent} />}>
                  {/* Summary banner */}
                  {completed.length > 0 && (
                    <View style={{ backgroundColor: COLORS.green + '18', borderRadius: 12, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: COLORS.green + '44', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Ionicons name="trending-up-outline" size={28} color={COLORS.green} />
                      <View>
                        <Text style={{ color: C.muted, fontSize: 12 }}>{isWorkerView ? 'Total recibido' : 'Total pagado'} ({phDateFilter === 'all' ? 'histórico' : phDateFilter === 'month' ? 'este mes' : phDateFilter === '3months' ? 'últimos 3 meses' : 'este año'})</Text>
                        <Text style={{ color: COLORS.green, fontWeight: '800', fontSize: 22 }}>${fmtMXN(totalCompleted)} MXN</Text>
                      </View>
                    </View>
                  )}

                  {/* Upcoming / assigned */}
                  {upcoming.length > 0 && (
                    <>
                      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 }}>PRÓXIMOS ({upcoming.length})</Text>
                      {upcoming.map(item => (
                        <PhCard key={item.id} item={item} colorAccent={COLORS.blue} statusLabel={isWorkerView ? 'Trabajo en curso — cobrarás al finalizar' : 'Trabajo en curso — pago pendiente'} statusIcon="hammer-outline" />
                      ))}
                    </>
                  )}

                  {/* In process */}
                  {inProcess.length > 0 && (
                    <>
                      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: upcoming.length > 0 ? 12 : 0 }}>EN PROCESO ({inProcess.length})</Text>
                      {inProcess.map(item => (
                        <PhCard key={item.id} item={item} colorAccent={COLORS.yellow} statusLabel={isWorkerView ? 'Pago en camino — llega en 1-2 días hábiles' : 'Pago procesándose'} statusIcon="time-outline" />
                      ))}
                    </>
                  )}

                  {/* Completed */}
                  {completed.length > 0 && (
                    <>
                      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: (upcoming.length > 0 || inProcess.length > 0) ? 12 : 0 }}>COMPLETADOS ({completed.length})</Text>
                      {completed.map(item => (
                        <PhCard key={item.id} item={item} colorAccent={COLORS.green} statusLabel={isWorkerView ? 'Pago recibido' : 'Pago completado'} statusIcon="checkmark-circle-outline" />
                      ))}
                    </>
                  )}
                </ScrollView>
              )}
            </SafeAreaView>
          </Modal>
        );
      })()}
    </Modal>
  );
}

function CreateBusinessInlineModal({ onConfirm, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButton}>← Cancelar</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Registrar empresa</Text>
          <View style={{ width: 80 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={[styles.infoBox, { borderColor: COLORS.yellow + '66', backgroundColor: COLORS.yellow + '11' }]}>
            <Text style={[styles.infoText, { color: COLORS.yellow }]}>Tu empresa será revisada antes de aparecer públicamente en el directorio.</Text>
          </View>
          <Text style={styles.formLabel}>NOMBRE DE LA EMPRESA *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej: Servicios Martínez" placeholderTextColor={COLORS.muted} />
          <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="¿Qué servicios ofrece tu empresa?" placeholderTextColor={COLORS.muted} multiline numberOfLines={3} />
          <TouchableOpacity style={styles.primaryButton} onPress={() => onConfirm(name, description)}>
            <Text style={styles.primaryButtonText}>Registrar empresa</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Worker identity verification — INE upload + status display
function IneVerificationSection({ userId, userProfile, onRefresh }) {
  const status = userProfile?.verificationStatus || 'unverified';
  const [ineImages, setIneImages] = useState({ front: null, back: null });
  const [uploading, setUploading] = useState(false);

  const pickIne = async (side) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setIneImages(prev => ({ ...prev, [side]: result.assets[0].uri }));
    }
  };

  const submitVerification = async () => {
    if (!ineImages.front || !ineImages.back) {
      Alert.alert('Faltan imágenes', 'Sube el frente y reverso de tu INE.');
      return;
    }
    setUploading(true);
    try {
      const frontUrl = await uploadImage(ineImages.front, `verification/${userId}/ine_front.jpg`);
      const backUrl = await uploadImage(ineImages.back, `verification/${userId}/ine_back.jpg`);
      await updateDoc(doc(db, 'users', userId), {
        verificationStatus: 'pending',
        ineImages: { front: frontUrl, back: backUrl },
        verificationRequestedAt: serverTimestamp(),
      });
      Alert.alert('✓ Enviado', 'Tu solicitud está en revisión. Te notificaremos cuando sea aprobada.');
      onRefresh();
    } catch {
      Alert.alert('Error', 'No se pudieron subir las imágenes. Verifica las reglas de Firebase Storage.');
    } finally {
      setUploading(false);
    }
  };

  const statusConfig = {
    unverified: { icon: 'document-outline',        label: 'Sin verificar', color: COLORS.muted,   desc: 'Verifica tu identidad con tu INE para obtener el sello de cuenta verificada y generar más confianza con los clientes.' },
    pending:    { icon: 'time-outline',             label: 'En revisión',   color: COLORS.yellow, desc: 'Tus documentos están siendo revisados. El proceso toma 1-2 días hábiles.' },
    verified:   { icon: 'checkmark-circle-outline', label: 'Verificado',    color: COLORS.green,  desc: 'Tu cuenta está verificada. Apareces con sello de verificación en el directorio.' },
  };
  const cfg = statusConfig[status] || statusConfig.unverified;

  return (
    <View style={styles.ineSection}>
      <Text style={styles.formLabel}>VERIFICACIÓN DE IDENTIDAD</Text>

      <View style={[styles.ineStatusBox, { borderColor: cfg.color + '66' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name={cfg.icon} size={22} color={cfg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.ineStatusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={styles.ineStatusDesc}>{cfg.desc}</Text>
          </View>
        </View>
      </View>

      {status === 'unverified' && (
        <>
          <Text style={[styles.formLabel, { marginTop: 12 }]}>SUBE TU INE</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.ineImageBox, ineImages.front && styles.ineImageBoxDone]} onPress={() => pickIne('front')}>
              {ineImages.front
                ? <Image source={{ uri: ineImages.front }} style={styles.ineThumb} />
                : <Text style={styles.ineImageLabel}>📷{'\n'}Frente</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ineImageBox, ineImages.back && styles.ineImageBoxDone]} onPress={() => pickIne('back')}>
              {ineImages.back
                ? <Image source={{ uri: ineImages.back }} style={styles.ineThumb} />
                : <Text style={styles.ineImageLabel}>📷{'\n'}Reverso</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 12 }, (!ineImages.front || !ineImages.back || uploading) && { opacity: 0.5 }]}
            onPress={submitVerification}
            disabled={!ineImages.front || !ineImages.back || uploading}
          >
            {uploading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryButtonText}>Enviar para verificación →</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function WorkerBankSection({ userId, userName, userProfile, onRefresh }) {
  const C = useTheme();
  const [loading, setLoading] = useState(false);
  const isSetup = !!userProfile?.stripeAccountId;

  const handleOpenOnboarding = async () => {
    setLoading(true);
    try {
      const res1 = await fetch(`${BACKEND_URL}/create-connect-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: userName }),
      });
      const { accountId, error: err1 } = await res1.json();
      if (err1) throw new Error(err1);

      await updateDoc(doc(db, 'users', userId), { stripeAccountId: accountId });

      const res2 = await fetch(`${BACKEND_URL}/create-account-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, userId }),
      });
      const { url, error: err2 } = await res2.json();
      if (err2) throw new Error(err2);

      await WebBrowser.openAuthSessionAsync(url, 'taskly://banking-complete');
      onRefresh();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo iniciar la configuración bancaria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginTop: 20, padding: 16, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Ionicons name="business-outline" size={18} color={COLORS.accent} />
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>Cuenta para pagos</Text>
      </View>

      {isSetup ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.green} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }}>Cuenta bancaria conectada</Text>
              <Text style={{ color: C.muted, fontSize: 13 }}>Recibirás pagos automáticamente al completar trabajos.</Text>
            </View>
          </View>
          <TouchableOpacity
            style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: 'center' }}
            onPress={handleOpenOnboarding}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.accent} /> : <Text style={{ color: C.muted, fontSize: 13 }}>Actualizar información bancaria</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>
            Conecta tu cuenta bancaria para recibir pagos automáticos cuando completes trabajos con tarjeta.
          </Text>
          <TouchableOpacity
            style={[{ backgroundColor: COLORS.accent, borderRadius: 10, padding: 14, alignItems: 'center' }, loading && { opacity: 0.6 }]}
            onPress={handleOpenOnboarding}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Conectar cuenta bancaria</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function AdminPanelModal({ visible, onClose }) {
  const C = useTheme();
  const [tab, setTab] = useState('pending');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const fetchVerifications = async () => {
      try {
        const [pendingSnap, verifiedSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('verificationStatus', '==', 'pending'))),
          getDocs(query(collection(db, 'users'), where('verificationStatus', '==', 'verified'))),
        ]);
        setPendingUsers(pendingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setVerifiedUsers(verifiedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        Alert.alert('Error', 'No se pudieron cargar las verificaciones.');
      } finally {
        setLoading(false);
      }
    };
    fetchVerifications();
  }, [visible]);

  const handleVerdict = async (userId, userName, verdict) => {
    setProcessing(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        verificationStatus: verdict,
        verificationReviewedAt: serverTimestamp(),
      });
      await createNotification(userId, verdict === 'verified' ? 'account_verified' : 'account_rejected', 'Taskly', {
        jobTitle: verdict === 'verified' ? 'Tu cuenta ha sido verificada' : 'Tu solicitud de verificación fue rechazada',
        jobId: '',
      });
      const approved = verdict === 'verified';
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      if (approved) {
        setVerifiedUsers(prev => [...prev, { id: userId, name: userName, verificationStatus: 'verified' }]);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar la verificación.');
    } finally {
      setProcessing(null);
    }
  };

  const UserCard = ({ u }) => (
    <View style={{ backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Ionicons name="person-circle-outline" size={32} color={C.muted} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>{u.name}</Text>
          <Text style={{ color: C.muted, fontSize: 12 }}>{u.email}</Text>
        </View>
        {u.verificationStatus === 'verified' && (
          <View style={{ backgroundColor: COLORS.green + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: COLORS.green, fontSize: 11, fontWeight: '700' }}>Verificado</Text>
          </View>
        )}
      </View>
      {u.ineImages && (
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          {u.ineImages.front ? (
            <Image source={{ uri: u.ineImages.front }} style={{ flex: 1, height: 100, borderRadius: 8, backgroundColor: C.border }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, height: 100, borderRadius: 8, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: C.muted, fontSize: 11 }}>Sin frente</Text>
            </View>
          )}
          {u.ineImages.back ? (
            <Image source={{ uri: u.ineImages.back }} style={{ flex: 1, height: 100, borderRadius: 8, backgroundColor: C.border }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, height: 100, borderRadius: 8, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: C.muted, fontSize: 11 }}>Sin reverso</Text>
            </View>
          )}
        </View>
      )}
      {u.verificationStatus === 'pending' && (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: COLORS.green, borderRadius: 8, padding: 10, alignItems: 'center' }}
            onPress={() => handleVerdict(u.id, u.name, 'verified')}
            disabled={processing === u.id}
          >
            {processing === u.id
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ color: '#fff', fontWeight: '700' }}>Aprobar</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: COLORS.red + 'dd', borderRadius: 8, padding: 10, alignItems: 'center' }}
            onPress={() => Alert.alert('Rechazar verificación', `¿Rechazar la solicitud de ${u.name}?`, [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Rechazar', style: 'destructive', onPress: () => handleVerdict(u.id, u.name, 'unverified') },
            ])}
            disabled={processing === u.id}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: C.border }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color={C.text} />
            </TouchableOpacity>
            <Text style={{ color: C.text, fontSize: 17, fontWeight: '700', flex: 1 }}>Panel de Administrador</Text>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4a4a8a" />
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
            {[
              { key: 'pending',  label: `Pendientes (${pendingUsers.length})` },
              { key: 'verified', label: `Verificados (${verifiedUsers.length})` },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: tab === t.key ? '#1a1a2e' : C.card, borderWidth: 1, borderColor: tab === t.key ? '#4a4a8a' : C.border }}
                onPress={() => setTab(t.key)}
              >
                <Text style={{ color: tab === t.key ? '#a0a0ff' : C.muted, fontWeight: '700', fontSize: 13 }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : (
            <FlatList
              data={tab === 'pending' ? pendingUsers : verifiedUsers}
              keyExtractor={u => u.id}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 60 }}>
                  <Ionicons name={tab === 'pending' ? 'checkmark-done-circle-outline' : 'people-outline'} size={48} color={C.muted} />
                  <Text style={{ color: C.muted, marginTop: 12, fontSize: 15 }}>
                    {tab === 'pending' ? 'No hay verificaciones pendientes' : 'No hay trabajadores verificados'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => <UserCard u={item} />}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function ProfileScreen({ user, onClose, themeMode, onThemeChange, onShowOnboarding }) {
  const C = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWorkArea, setShowWorkArea] = useState(false);
  const [showBusiness, setShowBusiness] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [availability, setAvailability] = useState({ days: [], startTime: '08:00', endTime: '18:00' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileDoc = await getDoc(doc(db, 'users', user.id));
      if (profileDoc.exists()) {
        const profile = profileDoc.data();
        setUserProfile(profile);
        setName(profile.name || '');
        setBio(profile.bio || '');
        setProfileImage(profile.profileImage || null);
        setSpecialties(profile.specialties || []);
        setAvailability(profile.availability || { days: [], startTime: '08:00', endTime: '18:00' });
        if (profile.businessId) {
          const bSnap = await getDoc(doc(db, 'businesses', profile.businessId));
          if (bSnap.exists()) setBusinessData({ id: bSnap.id, ...bSnap.data() });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      // Try uploading new image separately; if it fails, keep existing image and still save profile text
      let imageUrl = profileImage?.startsWith('file://') ? null : (profileImage ?? null);
      if (profileImage && profileImage.startsWith('file://')) {
        try {
          imageUrl = await uploadImage(profileImage, `profiles/${user.id}/profile.jpg`);
        } catch {
          // uploadImage already showed the Firebase Storage rules alert
          // fall through and save profile without the new photo
          imageUrl = null;
        }
      }

      const update = {
        name: name.trim(),
        bio: bio.trim(),
        specialties,
        availability,
        updatedAt: serverTimestamp(),
      };
      if (imageUrl !== null) update.profileImage = imageUrl;

      await updateDoc(doc(db, 'users', user.id), update);

      Alert.alert('✓ Guardado', 'Tu perfil fue actualizado');
      setEditing(false);
      loadProfile();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />

        <View style={[styles.modalHeader, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: COLORS.accent }]}>← Cerrar</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>Mi Perfil</Text>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={[styles.closeButton, { color: COLORS.accent }]}>{editing ? 'Cancelar' : 'Editar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSettings(true)}>
              <Ionicons name="settings-outline" size={22} color={C.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {showSettings && (
          <SettingsScreen
            user={user}
            userProfile={userProfile}
            onClose={() => setShowSettings(false)}
            onEditProfile={() => { setShowSettings(false); setEditing(true); }}
            onShowOnboarding={onShowOnboarding}
            themeMode={themeMode}
            onThemeChange={onThemeChange}
          />
        )}

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={[styles.modalContent, { backgroundColor: C.bg }]}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => { setRefreshing(true); loadProfile().finally(() => setRefreshing(false)); }}
                  tintColor={COLORS.accent}
                />
              }
            >
              <View style={[styles.profileHeader, { backgroundColor: C.bg }]}>
                {editing ? (
                  <ImagePickerButton
                    currentImage={profileImage}
                    onImageSelected={setProfileImage}
                    label="Cambiar foto de perfil"
                  />
                ) : (
                  profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileAvatarImage} />
                  ) : (
                    <View style={styles.profileAvatar}>
                      <Text style={styles.profileAvatarText}>
                        {(name || user.email)?.[0]?.toUpperCase()}
                      </Text>
                    </View>
                  )
                )}
                <Text style={[styles.profileRole, { color: C.text }]}>
                  {user.role === 'client' ? '👤 Cliente' : '👷 Trabajador'}
                </Text>
                
                {user.role === 'worker' && userProfile?.rating > 0 && (
                  <View style={{ alignItems: 'center', marginTop: 12 }}>
                    <StarRating rating={Math.round(userProfile.rating)} size={20} />
                    <Text style={styles.profileStats}>
                      {userProfile.rating.toFixed(1)} · {userProfile.jobCount || 0} trabajos
                    </Text>
                  </View>
                )}

                {user.role === 'client' && userProfile?.clientRating > 0 && (
                  <View style={{ alignItems: 'center', marginTop: 12 }}>
                    <StarRating rating={Math.round(userProfile.clientRating)} size={20} />
                    <Text style={styles.profileStats}>
                      {userProfile.clientRating.toFixed(1)} como cliente
                    </Text>
                    <Text style={styles.formHint}>
                      (Solo visible para trabajadores)
                    </Text>
                  </View>
                )}
              </View>

              {editing ? (
                <View style={styles.formContainer}>
                  <Text style={[styles.formLabel, { color: C.muted }]}>NOMBRE *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Tu nombre"
                    placeholderTextColor={C.muted}
                  />

                  <Text style={[styles.formLabel, { color: C.muted }]}>
                    {user.role === 'worker' ? 'DESCRIPCIÓN (visible en tu tarjeta)' : 'BIO / DESCRIPCIÓN'}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder={user.role === 'worker'
                      ? 'Describe tus habilidades y experiencia...'
                      : 'Cuéntanos sobre ti...'}
                    placeholderTextColor={C.muted}
                    multiline
                    numberOfLines={4}
                  />

                  {user.role === 'worker' && (
                    <>
                      {/* Specialties */}
                      <Text style={styles.formLabel}>MIS ESPECIALIDADES</Text>
                      <View style={styles.serviceGrid}>
                        {SERVICES.map(s => (
                          <TouchableOpacity key={s.id} onPress={() => setSpecialties(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                            style={[styles.serviceButton, specialties.includes(s.id) && { backgroundColor: s.color + '22', borderColor: s.color }]}>
                            <Ionicons name={s.icon} size={24} color={specialties.includes(s.id) ? s.color : COLORS.muted} />
                            <Text style={[styles.serviceButtonText, specialties.includes(s.id) && { color: s.color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{s.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Availability */}
                      <Text style={styles.formLabel}>DÍAS DISPONIBLES</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((day, i) => (
                          <TouchableOpacity key={i} onPress={() => setAvailability(a => ({ ...a, days: a.days.includes(i) ? a.days.filter(d => d !== i) : [...a.days, i] }))}
                            style={[styles.filterChip, availability.days.includes(i) && styles.filterChipActive]}>
                            <Text style={[styles.filterChipText, availability.days.includes(i) && styles.filterChipTextActive]}>{day}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.formLabel}>HORA INICIO</Text>
                          <TextInput style={styles.input} value={availability.startTime} onChangeText={t => setAvailability(a => ({ ...a, startTime: t }))} placeholder="08:00" placeholderTextColor={COLORS.muted} keyboardType="numbers-and-punctuation" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.formLabel}>HORA FIN</Text>
                          <TextInput style={styles.input} value={availability.endTime} onChangeText={t => setAvailability(a => ({ ...a, endTime: t }))} placeholder="18:00" placeholderTextColor={COLORS.muted} keyboardType="numbers-and-punctuation" />
                        </View>
                      </View>

                      {/* Work area */}
                      {userProfile?.serviceCenterZone ? (
                        <View>
                          <WorkerAreaPreview worker={userProfile} />
                          <TouchableOpacity onPress={() => setShowWorkArea(true)} style={{ marginTop: 6, alignItems: 'center' }}>
                            <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Editar área de servicio</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]} onPress={() => setShowWorkArea(true)}>
                          <Text style={[styles.primaryButtonText, { color: COLORS.text }]}>📍 Configurar área de servicio</Text>
                        </TouchableOpacity>
                      )}

                      {/* Business */}
                      {businessData ? (
                        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]} onPress={() => setShowBusiness(true)}>
                          <Text style={[styles.primaryButtonText, { color: COLORS.text }]}>🏢 {businessData.name}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]} onPress={() => setShowCreateBusiness(true)}>
                          <Text style={[styles.primaryButtonText, { color: COLORS.text }]}>🏢 Crear empresa o unirme a una</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {/* Invite */}
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]}
                    onPress={() => Share.share({ message: `Únete a Taskly — la app de servicios del hogar en Monterrey 🔧\nhttps://taskly.mx` })}>
                    <Text style={[styles.primaryButtonText, { color: COLORS.text }]}>🔗 Invitar a un amigo</Text>
                  </TouchableOpacity>

                  {user.role === 'worker' && (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>VISTA PREVIA</Text>
                      <Text style={styles.formHint}>
                        Así te verán los clientes en el directorio de trabajadores:
                      </Text>
                      <WorkerCard 
                        worker={{
                          name: name || 'Tu nombre',
                          bio: bio || 'Tu descripción...',
                          rating: userProfile?.rating || 0,
                          jobCount: userProfile?.jobCount || 0,
                          profileImage: profileImage,
                        }}
                        onPress={() => {}}
                      />
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.profileInfo}>
                  <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border }]}>
                    <Text style={[styles.infoLabel, { color: C.muted }]}>NOMBRE</Text>
                    <Text style={[styles.infoText, { color: C.text }]}>{name || 'Sin nombre'}</Text>
                  </View>

                  <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border }]}>
                    <Text style={[styles.infoLabel, { color: C.muted }]}>EMAIL</Text>
                    <Text style={[styles.infoText, { color: C.text }]}>{user.email}</Text>
                  </View>

                  {bio && (
                    <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border }]}>
                      <Text style={[styles.infoLabel, { color: C.muted }]}>BIO</Text>
                      <Text style={[styles.infoText, { color: C.text }]}>{bio}</Text>
                    </View>
                  )}

                  <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.border }]}>
                    <Text style={[styles.infoLabel, { color: C.muted }]}>MIEMBRO DESDE</Text>
                    <Text style={[styles.infoText, { color: C.text }]}>
                      {userProfile?.createdAt?.toDate().toLocaleDateString() || 'Recientemente'}
                    </Text>
                  </View>
                </View>
              )}

              {/* INE Verification — workers only */}
              {user.role === 'worker' && (
                <IneVerificationSection userId={user.id} userProfile={userProfile} onRefresh={loadProfile} />
              )}

              {/* Bank account (CLABE) — workers only */}
              {user.role === 'worker' && (
                <WorkerBankSection userId={user.id} userName={user.name} userProfile={userProfile} onRefresh={loadProfile} />
              )}

              {/* Admin panel — only visible to admin account */}
              {user.email === 'vidalgarza1@hotmail.com' && (
                <>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#4a4a8a', marginTop: 8 }]}
                    onPress={() => setShowAdminPanel(true)}
                  >
                    <Text style={[styles.primaryButtonText, { color: '#a0a0ff' }]}>🛡️ Panel de Administrador</Text>
                  </TouchableOpacity>
                  <AdminPanelModal visible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
                </>
              )}

        {showWorkArea && (
          <WorkAreaPickerModal
            currentAreas={userProfile?.serviceAreas}
            currentRadius={userProfile?.serviceRadius}
            currentCenter={userProfile?.serviceCenterZone}
            currentOutside={userProfile?.workOutsideArea}
            onClose={() => setShowWorkArea(false)}
            onConfirm={async (data) => {
              await updateDoc(doc(db, 'users', user.id), data);
              setShowWorkArea(false);
              loadProfile();
            }}
          />
        )}
        {showBusiness && businessData && (
          <BusinessProfileModal business={businessData} currentUser={user} onClose={() => setShowBusiness(false)} />
        )}
        {showCreateBusiness && (
          <CreateBusinessScreen currentUser={user} onClose={() => setShowCreateBusiness(false)} onSaved={() => { setShowCreateBusiness(false); loadProfile(); }} />
        )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Notifications Screen - WITH JOB DETAIL NAVIGATION
// Swipeable notification row
function SwipeableNotification({ item, onRead, onDelete, onPress }) {
  const C = useTheme();
  const PEEK = 88;
  const FULL = 260;

  const translateX = useRef(new Animated.Value(0)).current;
  const restPos = useRef(0);

  // Refs keep callbacks fresh inside the stale-closure PanResponder
  const cbRead = useRef(onRead);     cbRead.current = onRead;
  const cbDelete = useRef(onDelete); cbDelete.current = onDelete;
  const isRead = useRef(item.read);  isRead.current = item.read;

  // snapToRef updated every render so PanResponder always calls current version
  const snapToRef = useRef(null);
  snapToRef.current = (toValue, done) => {
    restPos.current = toValue;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 5,
      speed: 16,
    }).start(done);
  };

  const panResponder = useRef(
    PanResponder.create({
      // Don't claim on tap-start; only claim on horizontal move
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderGrant: () => {
        // Additive tracking from current resting position
        translateX.setOffset(restPos.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        translateX.flattenOffset();
        const pos = restPos.current + g.dx;
        const vel = g.vx;

        if (pos > FULL || (pos > PEEK && vel > 0.8)) {
          // Full right swipe → mark as read, spring back
          snapToRef.current(0, () => { if (!isRead.current) cbRead.current(); });
        } else if (pos < -FULL || (pos < -PEEK && vel < -0.8)) {
          // Full left swipe → fly off screen, then delete
          snapToRef.current(-500, () => cbDelete.current());
        } else if (pos > PEEK * 0.35) {
          // Partial right → snap open to show green button
          snapToRef.current(PEEK);
        } else if (pos < -PEEK * 0.35) {
          // Partial left → snap open to show red button
          snapToRef.current(-PEEK);
        } else {
          snapToRef.current(0);
        }
      },
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        snapToRef.current(0);
      },
    })
  ).current;

  const getNotifIcon = (type) => {
    const map = {
      new_bid:          { name: 'chatbubble-outline',       color: COLORS.blue },
      bid_accepted:     { name: 'checkmark-circle-outline', color: COLORS.green },
      bid_declined:     { name: 'close-circle-outline',     color: COLORS.red },
      job_completed:     { name: 'checkmark-done-outline',   color: COLORS.green },
      payment_confirmed: { name: 'card-outline',              color: COLORS.green },
      payment_received:  { name: 'cash-outline',              color: COLORS.green },
      payment_requested: { name: 'card-outline',              color: COLORS.accent },
      location_shared:  { name: 'location-outline',         color: COLORS.accent },
      review_received:  { name: 'star-outline',             color: COLORS.yellow },
      direct_proposal:  { name: 'paper-plane-outline',      color: COLORS.purple },
      schedule_proposed:{ name: 'calendar-outline',         color: COLORS.blue },
      schedule_agreed:  { name: 'calendar-outline',         color: COLORS.green },
      account_verified: { name: 'shield-checkmark-outline', color: COLORS.green },
      account_rejected: { name: 'shield-outline',           color: COLORS.red },
    };
    return map[type] || { name: 'notifications-outline', color: COLORS.muted };
  };

  const handlePress = () => {
    if (restPos.current !== 0) {
      snapToRef.current(0);
    } else {
      onPress();
    }
  };

  const notifIcon = getNotifIcon(item.type);

  return (
    // Container clips everything to the same rounded shape — action buttons
    // are fully hidden at rest and only revealed as the card slides
    <View style={{ marginBottom: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: C.card }}>
      {/* Left action — green, revealed when card slides right */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => { snapToRef.current(0, () => { if (!isRead.current) cbRead.current(); }); }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: PEEK,
          backgroundColor: COLORS.green, justifyContent: 'center', alignItems: 'center',
        }}
      >
        <Ionicons name="checkmark-outline" size={22} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 2 }}>Leída</Text>
      </TouchableOpacity>

      {/* Right action — red, revealed when card slides left */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => { snapToRef.current(-500, () => cbDelete.current()); }}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: PEEK,
          backgroundColor: COLORS.red, justifyContent: 'center', alignItems: 'center',
        }}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 2 }}>Eliminar</Text>
      </TouchableOpacity>

      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={[styles.notificationCard, !item.read && styles.notificationUnread, { marginBottom: 0, backgroundColor: C.card }]}
        >
          <View style={[styles.notificationIconWrap, { backgroundColor: notifIcon.color + '22' }]}>
            <Ionicons name={notifIcon.name} size={20} color={notifIcon.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.notificationMessage, { color: C.text }]}>{item.message}</Text>
            {item.createdAt && (
              <Text style={[styles.notificationTime, { color: C.muted }]}>
                {new Date(item.createdAt.toDate()).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function NotificationsScreen({ user, onClose, onOpenJob }) {
  const C = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.id), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try { await updateDoc(doc(db, 'notifications', notification.id), { read: true }); } catch {}
    if (notification.jobId && onOpenJob) {
      onClose();
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', notification.jobId));
        if (jobDoc.exists()) onOpenJob({ id: jobDoc.id, ...jobDoc.data() });
      } catch {}
    }
  };

  const handleMarkRead = async (id) => {
    try { await updateDoc(doc(db, 'notifications', id), { read: true }); } catch {}
  };

  const handleDelete = async (id) => {
    try { await deleteDoc(doc(db, 'notifications', id)); } catch {}
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (!unread.length) return;
    await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {})));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />
        <View style={[styles.modalHeader, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: COLORS.accent }]}>← Cerrar</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>Notificaciones</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={[styles.closeButton, { color: COLORS.accent, fontSize: 13 }]}>Leer todas</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 80 }} />}
        </View>

        {unreadCount > 0 && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Text style={{ color: C.muted, fontSize: 12 }}>← Desliza a la derecha para marcar como leída · Izquierda para eliminar →</Text>
          </View>
        )}

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.notificationsList, { backgroundColor: C.bg }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }} tintColor={COLORS.accent} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="notifications-outline" size={48} color={C.muted} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyStateText, { color: C.muted }]}>No tienes notificaciones</Text>
              </View>
            }
            renderItem={({ item }) => (
              <SwipeableNotification
                key={item.id}
                item={item}
                onRead={() => handleMarkRead(item.id)}
                onDelete={() => handleDelete(item.id)}
                onPress={() => handleNotificationClick(item)}
              />
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Onboarding ──────────────────────────────────────────────────────────────
function BankingOnboardingModal({ userId, userName, onDone }) {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const slides = [
    { icon: '💳', title: 'Cobra sin complicaciones', desc: 'Cuando el cliente pague con tarjeta, el dinero llega directo a tu cuenta bancaria. Sin intermediarios, sin esperas.' },
    { icon: '🔒', title: 'Proceso 100% seguro', desc: 'Stripe, la plataforma de pagos más confiable del mundo, maneja toda tu información bancaria. Taskly nunca ve tus datos.' },
    { icon: '⚡', title: 'Listo en 5 minutos', desc: 'Solo necesitas tu CLABE interbancaria. Configura tu cuenta una vez y cobra automáticamente en cada trabajo.' },
  ];

  const handleStart = async () => {
    setLoading(true);
    try {
      const res1 = await fetch(`${BACKEND_URL}/create-connect-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: userName }),
      });
      const { accountId, error: err1 } = await res1.json();
      if (err1) throw new Error(err1);

      await updateDoc(doc(db, 'users', userId), { stripeAccountId: accountId });

      const res2 = await fetch(`${BACKEND_URL}/create-account-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, userId }),
      });
      const { url, error: err2 } = await res2.json();
      if (err2) throw new Error(err2);

      await WebBrowser.openAuthSessionAsync(url, 'taskly://banking-complete');
      onDone();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo iniciar la configuración. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <SafeAreaView style={styles.onboardingContainer}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity onPress={onDone} style={{ alignSelf: 'flex-end', padding: 20, paddingBottom: 0 }}>
          <Text style={{ color: COLORS.muted, fontSize: 15 }}>Más tarde</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={styles.onboardingIcon}>{slides[page].icon}</Text>
          <Text style={styles.onboardingTitle}>{slides[page].title}</Text>
          <Text style={styles.onboardingDesc}>{slides[page].desc}</Text>
        </View>
        <View style={styles.onboardingDots}>
          {slides.map((_, i) => <View key={i} style={[styles.onboardingDot, i === page && styles.onboardingDotActive]} />)}
        </View>
        <View style={styles.onboardingActions}>
          {page < slides.length - 1 ? (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setPage(p => p + 1)}>
              <Text style={styles.primaryButtonText}>Siguiente →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={handleStart} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Conectar cuenta bancaria →</Text>}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function OnboardingScreen({ role, onDone }) {
  const [page, setPage] = useState(0);
  const slides = role === 'client' ? [
    { icon: '📋', title: 'Publica tu trabajo', desc: 'Describe el problema, agrega fotos y fija tu presupuesto. Recibirás propuestas de trabajadores calificados en minutos.' },
    { icon: '👷', title: 'Compara y elige', desc: 'Revisa perfiles verificados, calificaciones reales y propuestas. Chatea con los trabajadores antes de contratar.' },
    { icon: '✅', title: 'Trabajo garantizado', desc: 'Coordina el horario, confirma la cita y califica al trabajador al terminar.' },
  ] : [
    { icon: '🔍', title: 'Encuentra trabajos', desc: 'Explora solicitudes en Monterrey. Filtra por tu especialidad y área de servicio.' },
    { icon: '💬', title: 'Propón tu precio', desc: 'Envía tu mejor oferta y chatea con el cliente. Muestra tu experiencia.' },
    { icon: '⭐', title: 'Crece tu reputación', desc: 'Cada trabajo completado suma calificaciones. Un perfil verificado con buenas calificaciones atrae más clientes.' },
  ];
  const handleDone = async () => { await AsyncStorage.setItem('taskly_onboarded', 'true'); onDone(); };
  return (
    <SafeAreaView style={styles.onboardingContainer}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={styles.onboardingIcon}>{slides[page].icon}</Text>
        <Text style={styles.onboardingTitle}>{slides[page].title}</Text>
        <Text style={styles.onboardingDesc}>{slides[page].desc}</Text>
      </View>
      <View style={styles.onboardingDots}>
        {slides.map((_, i) => <View key={i} style={[styles.onboardingDot, i === page && styles.onboardingDotActive]} />)}
      </View>
      <View style={styles.onboardingActions}>
        {page < slides.length - 1 ? (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.onboardingSkipBtn} onPress={handleDone}>
              <Text style={styles.onboardingSkipText}>Omitir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => setPage(p => p + 1)}>
              <Text style={styles.primaryButtonText}>Siguiente →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
            <Text style={styles.primaryButtonText}>¡Comenzar ahora!</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Image Gallery (full-screen swipeable) ────────────────────────────────────
// Single-item viewer — image with pinch-to-zoom via ScrollView, or video with native controls
function MediaViewerItem({ item, width, height }) {
  const uri = item.url || item.uri;
  const isVideo = item.type === 'video';
  const player = useVideoPlayer(isVideo ? uri : null, p => {
    if (p) { p.loop = false; }
  });

  if (isVideo) {
    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <VideoView
          player={player}
          style={{ width, height }}
          contentFit="contain"
          nativeControls
          allowsFullscreen
          allowsPictureInPicture={false}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ width, height }}
      contentContainerStyle={{ width, height, justifyContent: 'center', alignItems: 'center' }}
      maximumZoomScale={5}
      minimumZoomScale={1}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      centerContent
      scrollEnabled
    >
      <Image source={{ uri }} style={{ width, height }} resizeMode="contain" />
    </ScrollView>
  );
}

function MediaViewerModal({ items, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex);
  const { width, height } = Dimensions.get('window');
  const flatRef = useRef(null);

  useEffect(() => {
    if (initialIndex > 0) {
      setTimeout(() => flatRef.current?.scrollToIndex({ index: initialIndex, animated: false }), 50);
    }
  }, []);

  if (!items?.length) return null;

  const current = items[idx];
  const isVideo = current?.type === 'video';

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Close */}
        <TouchableOpacity style={styles.galleryCloseBtn} onPress={onClose}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Counter + type badge */}
        <View style={{ position: 'absolute', top: 55, left: 0, right: 0, alignItems: 'center', zIndex: 5, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <Text style={styles.galleryCounter}>{idx + 1} / {items.length}</Text>
          {isVideo && (
            <View style={{ backgroundColor: 'rgba(255,107,53,0.8)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>VIDEO</Text>
            </View>
          )}
        </View>

        {/* Hint for images */}
        {!isVideo && (
          <View style={{ position: 'absolute', bottom: 70, left: 0, right: 0, alignItems: 'center', zIndex: 5 }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Pellizca para hacer zoom</Text>
          </View>
        )}

        <FlatList
          ref={flatRef}
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={e => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <MediaViewerItem item={item} width={width} height={height} />
          )}
        />

        {/* Dots */}
        {items.length > 1 && (
          <View style={styles.galleryDots}>
            {items.map((it, i) => (
              <View key={i} style={[
                styles.galleryDot,
                i === idx && styles.galleryDotActive,
                it.type === 'video' && { backgroundColor: i === idx ? COLORS.accent : 'rgba(255,107,53,0.4)' },
              ]} />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}
// Backwards-compat alias (used nowhere else but keeps any future refs working)
const ImageGalleryModal = MediaViewerModal;

// ─── Work Area Picker ─────────────────────────────────────────────────────────
function WorkAreaPickerModal({ currentRadius, currentCenter, currentOutside, onConfirm, onClose }) {
  const initCenter = MONTERREY_LOCATIONS.find(l => l.name === currentCenter) || MONTERREY_LOCATIONS[1];
  const initDelta = currentRadius && currentRadius !== 999 ? (currentRadius / 111) * 2 : 0.45;

  const [noLimit, setNoLimit] = useState(currentRadius === 999);
  const [workOutside, setWorkOutside] = useState(currentOutside || false);
  const [centerZone, setCenterZone] = useState(currentCenter || MONTERREY_LOCATIONS[1].name);
  const [radiusKm, setRadiusKm] = useState(currentRadius && currentRadius !== 999 ? currentRadius : 20);
  const [mapRegion, setMapRegion] = useState({
    latitude: initCenter.lat,
    longitude: initCenter.lng,
    latitudeDelta: initDelta,
    longitudeDelta: initDelta,
  });

  const onZoneSelect = (loc) => {
    setCenterZone(loc.name);
    setMapRegion(r => ({ ...r, latitude: loc.lat, longitude: loc.lng }));
  };

  const onRegionChangeComplete = (r) => {
    setMapRegion(r);
    const km = Math.max(1, Math.round(r.latitudeDelta * 111 / 2));
    setRadiusKm(km);
  };

  const handleSave = () => onConfirm({
    serviceRadius: noLimit ? 999 : radiusKm,
    serviceCenterZone: centerZone,
    serviceAreas: [],
    workOutsideArea: workOutside,
  });

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={[styles.container, { flex: 1 }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButton}>← Cancelar</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Área de servicio</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.closeButton, { color: COLORS.green }]}>Guardar</Text>
          </TouchableOpacity>
        </View>

        {/* Zone selector strip */}
        <View style={{ paddingVertical: 10, paddingHorizontal: 16 }}>
          <Text style={[styles.formHint, { marginBottom: 8 }]}>Centro de trabajo — toca para reposicionar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {MONTERREY_LOCATIONS.map(loc => (
                <TouchableOpacity key={loc.name} onPress={() => onZoneSelect(loc)}
                  style={[styles.filterChip, centerZone === loc.name && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, centerZone === loc.name && styles.filterChipTextActive]}>
                    {centerZone === loc.name ? '📍 ' : ''}{loc.short}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Full-height interactive map */}
        <View style={{ flex: 1, marginHorizontal: 16, marginBottom: 0, borderRadius: 16, overflow: 'hidden' }}>
          <MapView
            style={{ flex: 1 }}
            region={mapRegion}
            onRegionChangeComplete={onRegionChangeComplete}
            showsUserLocation={false}
            showsMyLocationButton={false}
            zoomEnabled={!noLimit}
            scrollEnabled={!noLimit}
          >
            <Marker
              coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={{ backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{MONTERREY_LOCATIONS.find(l => l.name === centerZone)?.short || centerZone}</Text>
                </View>
                <Ionicons name="location" size={36} color={COLORS.accent} />
              </View>
            </Marker>
          </MapView>

          {/* Radius badge */}
          {!noLimit && (
            <View style={{ position: 'absolute', top: 14, left: 0, right: 0, alignItems: 'center', pointerEvents: 'none' }}>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>~{radiusKm} km</Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>· zoom para ajustar</Text>
              </View>
            </View>
          )}

          {noLimit && (
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: COLORS.accent + '18', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: COLORS.accent, borderRadius: 28, paddingHorizontal: 24, paddingVertical: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>🌎 Sin límite</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom controls */}
        <View style={{ padding: 16, gap: 10 }}>
          <TouchableOpacity
            onPress={() => setNoLimit(l => !l)}
            style={[styles.primaryButton, !noLimit && { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]}
          >
            <Text style={[styles.primaryButtonText, !noLimit && { color: COLORS.text }]}>
              {noLimit ? '✓ Sin límite activado' : '🌎 Sin límite de distancia'}
            </Text>
          </TouchableOpacity>

          <View style={styles.privacyContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>Acepto trabajos fuera de mi zona</Text>
              <Text style={styles.privacySubtitle}>Disponible para solicitudes más lejos de mi área</Text>
            </View>
            <Switch value={workOutside} onValueChange={setWorkOutside} trackColor={{ false: COLORS.border, true: COLORS.accent }} thumbColor="#fff" />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Business Pages ───────────────────────────────────────────────────────────
function BusinessCard({ business, onPress }) {
  const serviceLabels = (business.services || []).slice(0, 3).map(id => SERVICES.find(s => s.id === id)).filter(Boolean);
  return (
    <TouchableOpacity style={styles.businessCard} onPress={() => onPress(business)}>
      {business.logo
        ? <Image source={{ uri: business.logo }} style={styles.businessLogo} />
        : <View style={[styles.businessLogo, { backgroundColor: COLORS.accent + '22', justifyContent: 'center', alignItems: 'center' }]}><Ionicons name="business-outline" size={28} color={COLORS.accent} /></View>}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.businessName}>{business.name}</Text>
          <View style={styles.verifiedBadge}><Text style={styles.verifiedBadgeText}>✓</Text></View>
        </View>
        <Text style={styles.businessMeta}>{(business.memberIds?.length || 1)} trabajador{(business.memberIds?.length || 1) !== 1 ? 'es' : ''}</Text>
        {serviceLabels.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {serviceLabels.map(s => (
              <View key={s.id} style={[styles.specialtyChip, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <Ionicons name={s.icon} size={11} color={COLORS.muted} />
                <Text style={{ color: COLORS.muted, fontSize: 11 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}
        {business.description ? <Text style={styles.businessDesc} numberOfLines={2}>{business.description}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function BusinessProfileModal({ business: initialBusiness, currentUser, onClose }) {
  const [business, setBusiness] = useState(initialBusiness);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = currentUser.id === business.ownerId;

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const ids = [business.ownerId, ...(business.memberIds || []).filter(id => id !== business.ownerId)];
        const docs = await Promise.all(ids.map(id => getDoc(doc(db, 'users', id))));
        setMembers(docs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })));
      } catch {}
      setLoading(false);
    };
    loadMembers();
  }, []);

  const handleJoin = async () => {
    if ((business.memberIds || []).includes(currentUser.id)) {
      Alert.alert('Ya eres miembro', 'Ya estás asociado a esta empresa.');
      return;
    }
    try {
      const bRef = doc(db, 'businesses', business.id);
      await updateDoc(bRef, { memberIds: arrayUnion(currentUser.id) });
      await updateDoc(doc(db, 'users', currentUser.id), { businessId: business.id, businessRole: 'member' });
      setBusiness(b => ({ ...b, memberIds: [...(b.memberIds || []), currentUser.id] }));
      Alert.alert('✓ Unido', `Ahora eres miembro de ${business.name}`);
    } catch { Alert.alert('Error', 'No se pudo unir a la empresa'); }
  };

  const handleLeave = async () => {
    Alert.alert('Salir de la empresa', '¿Deseas desvincularte?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => {
        try {
          await updateDoc(doc(db, 'businesses', business.id), { memberIds: arrayRemove(currentUser.id) });
          await updateDoc(doc(db, 'users', currentUser.id), { businessId: null, businessRole: null });
          onClose();
        } catch { Alert.alert('Error', 'No se pudo salir de la empresa'); }
      }},
    ]);
  };

  const isMember = (business.memberIds || []).includes(currentUser.id) || business.ownerId === currentUser.id;

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButton}>← Cerrar</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Empresa</Text>
          <View style={{ width: 80 }} />
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            {business.logo
              ? <Image source={{ uri: business.logo }} style={{ width: 90, height: 90, borderRadius: 20 }} />
              : <View style={{ width: 90, height: 90, borderRadius: 20, backgroundColor: COLORS.accent + '22', justifyContent: 'center', alignItems: 'center' }}><Ionicons name="business-outline" size={44} color={COLORS.accent} /></View>}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text }}>{business.name}</Text>
              <View style={styles.verifiedBadge}><Text style={styles.verifiedBadgeText}>✓</Text></View>
            </View>
            {business.description ? <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>{business.description}</Text> : null}
            {(business.services || []).length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, justifyContent: 'center' }}>
                {business.services.map(id => {
                  const s = SERVICES.find(x => x.id === id);
                  return s ? (
                    <View key={id} style={[styles.specialtyChip, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <Ionicons name={s.icon} size={11} color={COLORS.muted} />
                      <Text style={{ color: COLORS.muted, fontSize: 11 }}>{s.label}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            )}
          </View>

          <Text style={[styles.formLabel, { marginHorizontal: 20 }]}>EQUIPO ({members.length})</Text>
          {loading ? <ActivityIndicator color={COLORS.accent} style={{ margin: 20 }} /> : members.map(m => (
            <View key={m.id} style={[styles.workerCard, { marginHorizontal: 16, marginBottom: 10 }]}>
              {m.profileImage ? <Image source={{ uri: m.profileImage }} style={styles.workerAvatarImage} /> :
                <View style={styles.workerAvatar}><Text style={styles.workerAvatarText}>{m.name?.[0]?.toUpperCase() || '?'}</Text></View>}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.workerName}>{m.name}</Text>
                  {m.id === business.ownerId && <Text style={[styles.specialtyChip, { backgroundColor: COLORS.accent + '22', color: COLORS.accent }]}>Admin</Text>}
                </View>
                {m.rating > 0 && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><StarRating rating={Math.round(m.rating)} size={12} /><Text style={styles.workerRating}>{m.rating.toFixed(1)}</Text></View>}
              </View>
            </View>
          ))}

          <View style={{ padding: 20 }}>
            {currentUser.role === 'worker' && !isOwner && (
              isMember
                ? <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.border }]} onPress={handleLeave}><Text style={styles.primaryButtonText}>Salir de la empresa</Text></TouchableOpacity>
                : <TouchableOpacity style={styles.primaryButton} onPress={handleJoin}><Text style={styles.primaryButtonText}>Unirme a esta empresa →</Text></TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function CreateBusinessScreen({ currentUser, existingBusiness, onClose, onSaved }) {
  const [name, setName] = useState(existingBusiness?.name || '');
  const [description, setDescription] = useState(existingBusiness?.description || '');
  const [selectedServices, setSelectedServices] = useState(existingBusiness?.services || []);
  const [loading, setLoading] = useState(false);
  const toggleService = (id) => setSelectedServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'El nombre de la empresa es requerido'); return; }
    setLoading(true);
    try {
      if (existingBusiness) {
        await updateDoc(doc(db, 'businesses', existingBusiness.id), { name: name.trim(), description: description.trim(), services: selectedServices });
      } else {
        const ref = await addDoc(collection(db, 'businesses'), {
          name: name.trim(), description: description.trim(), services: selectedServices,
          ownerId: currentUser.id, memberIds: [], logo: null, createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'users', currentUser.id), { businessId: ref.id, businessRole: 'owner' });
      }
      Alert.alert('✓ Guardado', existingBusiness ? 'Empresa actualizada' : '¡Empresa creada!');
      onSaved();
    } catch { Alert.alert('Error', 'No se pudo guardar la empresa'); }
    setLoading(false);
  };

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButton}>← Cancelar</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>{existingBusiness ? 'Editar empresa' : 'Crear empresa'}</Text>
          <View style={{ width: 80 }} />
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.formLabel}>NOMBRE DE LA EMPRESA *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej: Plomería Garza" placeholderTextColor={COLORS.muted} />
            <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe los servicios que ofrece tu empresa..." placeholderTextColor={COLORS.muted} multiline />
            <Text style={styles.formLabel}>SERVICIOS QUE OFRECE</Text>
            <View style={styles.serviceGrid}>
              {SERVICES.map(s => (
                <TouchableOpacity key={s.id} onPress={() => toggleService(s.id)}
                  style={[styles.serviceButton, selectedServices.includes(s.id) && { backgroundColor: s.color + '22', borderColor: s.color }]}>
                  <Ionicons name={s.icon} size={26} color={selectedServices.includes(s.id) ? s.color : COLORS.muted} />
                  <Text style={[styles.serviceButtonText, selectedServices.includes(s.id) && { color: s.color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{existingBusiness ? 'Guardar cambios' : 'Crear empresa →'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// Login screens (with keyboard fix)
function RoleSelectionScreen({ onRoleSelected }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Text style={{ fontSize: 48, fontWeight: '900', color: COLORS.text, letterSpacing: -1, marginBottom: 2 }}>
            Task<Text style={{ color: COLORS.accent }}>ly</Text>
          </Text>
          <Image source={require('./assets/splash-icon.png')} style={{ width: 120, height: 120, resizeMode: 'contain', marginBottom: 8 }} />
          <Text style={styles.subtitle}>MONTERREY</Text>
        </View>

        <View style={styles.roleContainer}>
          <Text style={styles.roleTitle}>¿Cómo quieres usar Taskly?</Text>
          <Text style={styles.roleSubtitle}>Elige el tipo de cuenta</Text>

          <TouchableOpacity 
            style={[styles.roleCard, { borderColor: COLORS.blue }]}
            onPress={() => onRoleSelected('client')}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: COLORS.blue + '22' }]}>
              <Ionicons name="person-outline" size={40} color={COLORS.blue} />
            </View>
            <Text style={styles.roleCardTitle}>Soy Cliente</Text>
            <Text style={styles.roleCardDescription}>
              Necesito contratar servicios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleCard, { borderColor: COLORS.accent }]}
            onPress={() => onRoleSelected('worker')}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: COLORS.accent + '22' }]}>
              <Ionicons name="hammer-outline" size={40} color={COLORS.accent} />
            </View>
            <Text style={styles.roleCardTitle}>Soy Trabajador</Text>
            <Text style={styles.roleCardDescription}>
              Ofrezco servicios profesionales
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Shared helper: ensure a Firestore user doc exists after any auth method
async function ensureUserDoc(firebaseUser, role, displayName = null) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const name = displayName
      || firebaseUser.displayName
      || firebaseUser.email?.split('@')[0]
      || `Usuario ${firebaseUser.phoneNumber?.slice(-4) || ''}`;
    await setDoc(userRef, {
      email: firebaseUser.email || '',
      phone: firebaseUser.phoneNumber || '',
      role,
      name,
      rating: 0, jobCount: 0,
      clientRating: 0, clientRatedCount: 0,
      verificationStatus: role === 'worker' ? 'unverified' : null,
      createdAt: serverTimestamp(),
    });
  }
}

// SMS / Phone auth modal
function PhoneAuthModal({ role, onClose }) {
  const [phone, setPhone] = useState('+52 ');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) { Alert.alert('Error', 'Ingresa un número válido con código de país (+52...)'); return; }
    setLoading(true);
    try {
      const conf = await signInWithPhoneNumber(auth, cleaned);
      setConfirmation(conf);
    } catch (e) {
      Alert.alert('Error SMS', e.message || 'No se pudo enviar el código. Verifica el número e intenta de nuevo.');
    } finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length < 4) return;
    setLoading(true);
    try {
      const result = await confirmation.confirm(otp);
      await ensureUserDoc(result.user, role);
      onClose();
    } catch {
      Alert.alert('Código incorrecto', 'Revisa el SMS e intenta de nuevo.');
    } finally { setLoading(false); }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <KeyboardAvoidingView style={styles.phoneAuthOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.phoneAuthContent}>
          <Text style={styles.phoneAuthTitle}>📱 Iniciar sesión con SMS</Text>

          {!confirmation ? (
            <>
              <Text style={styles.formLabel}>NÚMERO DE TELÉFONO</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+52 81 1234 5678"
                placeholderTextColor={COLORS.muted}
                keyboardType="phone-pad"
                autoFocus
              />
              <Text style={styles.formHint}>Incluye el código de país (+52 para México)</Text>
              <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={sendOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Enviar código →</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.formLabel}>CÓDIGO DE VERIFICACIÓN</Text>
              <TextInput
                style={[styles.input, { letterSpacing: 8, fontSize: 24, textAlign: 'center' }]}
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
              <Text style={styles.formHint}>Revisa tu SMS en {phone}</Text>
              <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={verifyOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Verificar →</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmation(null)} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: COLORS.accent, fontSize: 13 }}>← Cambiar número</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={onClose} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Isolated so the hook only mounts when Google is properly configured — prevents crash when IDs are placeholder
function GoogleSignInButton({ role, disabled }) {
  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(r => ensureUserDoc(r.user, role))
        .catch(() => Alert.alert('Error', 'No se pudo iniciar sesión con Google'));
    }
  }, [googleResponse]);

  return (
    <TouchableOpacity style={styles.googleButton} onPress={() => promptGoogleAsync()} disabled={disabled} activeOpacity={0.85}>
      <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 2 }}>
        {/* Google "G" rendered with brand colors */}
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#4285F4', letterSpacing: -1 }}>G</Text>
      </View>
      <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
    </TouchableOpacity>
  );
}

function LoginScreen({ role, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const roleName = role === 'client' ? 'Cliente' : 'Trabajador';
  const roleIcon = role === 'client' ? '👤' : '👷';

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const nonce = Math.random().toString(36).substring(2, 12);
      const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
      const apple = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashed,
      });
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({ idToken: apple.identityToken, rawNonce: nonce });
      const result = await signInWithCredential(auth, credential);
      const name = apple.fullName
        ? `${apple.fullName.givenName || ''} ${apple.fullName.familyName || ''}`.trim()
        : null;
      await ensureUserDoc(result.user, role, name);
    } catch (e) {
      if (e.code !== 'ERR_REQUEST_CANCELED') Alert.alert('Error', 'No se pudo iniciar sesión con Apple');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Recuperar contraseña', 'Ingresa tu email en el campo de arriba y luego toca este botón.');
      return;
    }
    Alert.alert(
      'Recuperar contraseña',
      `Se enviará un enlace de recuperación a:\n\n${email}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar enlace',
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, email.trim());
              Alert.alert('✓ Correo enviado', `Revisa tu bandeja de entrada en ${email}.\n\nEl enlace expira en 1 hora.`);
            } catch (e) {
              if (e.code === 'auth/user-not-found') {
                Alert.alert('No encontrado', 'No existe una cuenta con ese email. Verifica que esté escrito correctamente.');
              } else {
                Alert.alert('Error', 'No se pudo enviar el correo. Intenta más tarde.');
              }
            }
          },
        },
      ]
    );
  };

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Campos requeridos', 'Ingresa tu email y contraseña para continuar.'); return; }
    if (password.length < 6) { Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.'); return; }
    if (!tosAccepted) { Alert.alert('Términos de Servicio', 'Debes aceptar los Términos de Servicio para continuar.'); return; }
    setLoading(true);
    try {
      const uc = await signInWithEmailAndPassword(auth, email.trim(), password);
      await ensureUserDoc(uc.user, role);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // New user — create account
        try {
          const uc = await createUserWithEmailAndPassword(auth, email.trim(), password);
          await ensureUserDoc(uc.user, role);
          sendEmailVerification(uc.user).catch(() => {});
          Alert.alert('✓ Cuenta creada', `¡Bienvenido como ${roleName}!\n\nTe enviamos un email de verificación a ${email}.`);
        } catch (createErr) {
          if (createErr.code === 'auth/email-already-in-use') {
            Alert.alert('Contraseña incorrecta', 'Esta cuenta ya existe. Verifica tu contraseña o usa "Olvidé mi contraseña" si no la recuerdas.');
          } else if (createErr.code === 'auth/invalid-email') {
            Alert.alert('Email inválido', 'El formato del email no es válido. Revísalo e intenta de nuevo.');
          } else {
            Alert.alert('No se pudo crear la cuenta', createErr.message || 'Intenta de nuevo más tarde.');
          }
        }
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        Alert.alert('Contraseña incorrecta', '¿Olvidaste tu contraseña? Toca "Olvidé mi contraseña" para recuperarla.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Email inválido', 'El formato del email no es válido. Revísalo e intenta de nuevo.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Demasiados intentos', 'Tu cuenta fue bloqueada temporalmente por seguridad. Intenta más tarde o restablece tu contraseña.');
      } else if (error.code === 'auth/network-request-failed') {
        Alert.alert('Sin conexión', 'Verifica tu conexión a internet e intenta de nuevo.');
      } else {
        Alert.alert('Error al iniciar sesión', error.message || 'Ocurrió un error. Intenta de nuevo.');
      }
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.loginContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Cambiar tipo de cuenta</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image source={require('./assets/splash-icon.png')} style={{ width: 90, height: 90, resizeMode: 'contain', marginBottom: 4 }} />
            <Text style={styles.roleIconLarge}>{roleIcon}</Text>
            <Text style={styles.logoText}>{roleName}</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Social auth buttons */}
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            )}

            {GOOGLE_CONFIGURED
              ? <GoogleSignInButton role={role} disabled={loading} />
              : (
                <TouchableOpacity style={[styles.googleButton, { opacity: 0.4 }]} disabled>
                  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 2 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#4285F4', letterSpacing: -1 }}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity
              style={styles.smsButton}
              onPress={() => setShowPhoneAuth(true)}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons name="phone-portrait-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.smsButtonText}>Iniciar sesión con teléfono</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.authDivider}>
              <View style={styles.authDividerLine} />
              <Text style={styles.authDividerText}>o con email</Text>
              <View style={styles.authDividerLine} />
            </View>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña (min. 6 caracteres)"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
            />

            {/* ToS acceptance */}
            <TouchableOpacity
              onPress={() => setTosAccepted(v => !v)}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16, marginTop: 4 }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                borderColor: tosAccepted ? COLORS.accent : COLORS.muted,
                backgroundColor: tosAccepted ? COLORS.accent + '22' : 'transparent',
                alignItems: 'center', justifyContent: 'center', marginTop: 1,
              }}>
                {tosAccepted && <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '800' }}>✓</Text>}
              </View>
              <Text style={{ color: COLORS.muted, fontSize: 13, flex: 1, lineHeight: 19 }}>
                Acepto los{' '}
                <Text style={{ color: COLORS.accent }} onPress={() => WebBrowser.openBrowserAsync(`${BACKEND_URL}/terms`)}>
                  Términos de Servicio
                </Text>
                {' '}y la{' '}
                <Text style={{ color: COLORS.accent }} onPress={() => WebBrowser.openBrowserAsync(`${BACKEND_URL}/privacy`)}>
                  Política de Privacidad
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, (loading || !tosAccepted) && { opacity: 0.5 }]}
              onPress={handleLogin}
              disabled={loading || !tosAccepted}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Continuar →</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} style={{ alignItems: 'center', marginTop: 10, marginBottom: 4 }}>
              <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Olvidé mi contraseña</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Primera vez: se creará tu cuenta automáticamente{'\n'}
                Ya tienes cuenta: inicia sesión con tu contraseña
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showPhoneAuth && (
        <PhoneAuthModal role={role} onClose={() => setShowPhoneAuth(false)} />
      )}
    </SafeAreaView>
  );
}

// ─── Email Verification Screen ────────────────────────────────────────────────
function VerifyEmailScreen({ email, onCheckVerification, onResend, onGoBack, loading }) {
  return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
      <StatusBar barStyle="light-content" />
      <Ionicons name="mail-outline" size={64} color={COLORS.accent} />
      <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 20, textAlign: 'center' }}>
        Verifica tu correo
      </Text>
      <Text style={{ fontSize: 14, color: COLORS.muted, marginTop: 12, textAlign: 'center', lineHeight: 20 }}>
        Enviamos un enlace de verificación a:{'\n'}
        <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{email}</Text>
      </Text>
      <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 12, textAlign: 'center', lineHeight: 18 }}>
        Toca el enlace en el correo y luego presiona el botón de abajo.
      </Text>
      <TouchableOpacity
        style={[styles.primaryButton, { marginTop: 32, width: '100%' }, loading && { opacity: 0.5 }]}
        onPress={onCheckVerification}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryButtonText}>Ya verifiqué →</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={onResend} style={{ marginTop: 16 }}>
        <Text style={{ color: COLORS.accent, fontSize: 13 }}>Reenviar correo de verificación</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onGoBack}
        style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        <Ionicons name="arrow-back-outline" size={15} color={COLORS.muted} />
        <Text style={{ color: COLORS.muted, fontSize: 13 }}>Correo incorrecto — regresar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    addDoc(collection(db, 'crashReports'), {
      message: error?.message || String(error),
      stack: error?.stack || '',
      componentStack: info?.componentStack || '',
      createdAt: serverTimestamp(),
    }).catch(() => {});
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
          <Ionicons name="warning-outline" size={64} color={COLORS.red} />
          <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 20, textAlign: 'center' }}>
            Algo salió mal
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 12, textAlign: 'center', lineHeight: 18 }}>
            {this.state.error?.message || 'Error inesperado'}
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 32, width: '100%' }]}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.primaryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

// Main App (with all features integrated)
export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [myJobFilter, setMyJobFilter] = useState('all');
  const [myBids, setMyBids] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showWorkers, setShowWorkers] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [exploreSection, setExploreSection] = useState('listings');
  const [bidFilter, setBidFilter] = useState('all');
  const [bidSort, setBidSort] = useState('date');
  const [refreshing, setRefreshing] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');
  const bidsListRef = useRef(null);
  const feedListRef = useRef(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBankingSetupFromFeed, setShowBankingSetupFromFeed] = useState(false);
  const [businessDirectory, setBusinessDirectory] = useState([]);
  const [systemColorScheme, setSystemColorScheme] = useState(Appearance.getColorScheme() || 'dark');
  const [themeMode, setThemeMode] = useState('system');

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || 'dark');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('taskly_theme').then(v => {
    // 'dark' was the old implicit default — treat it as 'system' unless user explicitly chose it
    if (v && v !== 'dark') setThemeMode(v);
  });
  }, []);

  const handleThemeChange = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('taskly_theme', mode);
  };

  const resolvedScheme = themeMode === 'system' ? (systemColorScheme || 'dark') : themeMode;
  const activeColors = resolvedScheme === 'light' ? LIGHT_COLORS : COLORS;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const toggleFavorite = async (workerId) => {
    const current = user?.favoriteWorkers || [];
    const isFav = current.includes(workerId);
    const updated = isFav ? current.filter(id => id !== workerId) : [...current, workerId];
    setUser(prev => ({ ...prev, favoriteWorkers: updated }));
    try {
      await updateDoc(doc(db, 'users', user.id), {
        favoriteWorkers: isFav ? arrayRemove(workerId) : arrayUnion(workerId),
      });
    } catch {
      setUser(prev => ({ ...prev, favoriteWorkers: current }));
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const TEST_EMAILS = ['cliente@cliente.com', 'trabajador@trabajador.com', 'trabajador2@trabajador.com'];
        const isPasswordProvider = firebaseUser.providerData?.some(p => p.providerId === 'password');
        if (isPasswordProvider && !firebaseUser.emailVerified && !TEST_EMAILS.includes(firebaseUser.email)) {
          setNeedsEmailVerification(true);
          setVerificationEmail(firebaseUser.email || '');
          if (initializing) setInitializing(false);
          return;
        }
        setNeedsEmailVerification(false);
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            ...userDoc.data()
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.email?.split('@')[0] || 'Usuario',
            role: 'client',
            rating: 0,
            jobCount: 0,
            clientRating: 0,
            clientRatedCount: 0,
          });
        }
        setupPushNotifications(firebaseUser.uid);
      } else {
        setUser(null);
        setNeedsEmailVerification(false);
      }
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Check onboarding on first load
  useEffect(() => {
    if (user) {
      AsyncStorage.getItem('taskly_onboarded').then(done => {
        if (!done) setShowOnboarding(true);
      });
    }
  }, [user?.id]);

  // Open job on cold-start tap (app was killed when notification arrived)
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then(async (response) => {
      if (!response) return;
      const jobId = response.notification.request.content.data?.jobId;
      if (jobId) {
        try {
          const d = await getDoc(doc(db, 'jobs', jobId));
          if (d.exists()) setSelectedJob({ id: d.id, ...d.data() });
        } catch {}
      }
    });
  }, []);

  // Open job when user taps a notification while app is running
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const jobId = response.notification.request.content.data?.jobId;
      if (jobId) {
        try {
          const d = await getDoc(doc(db, 'jobs', jobId));
          if (d.exists()) setSelectedJob({ id: d.id, ...d.data() });
        } catch {}
      } else {
        setShowNotifications(true);
      }
    });
    return () => Notifications.removeNotificationSubscription(sub);
  }, []);

  // Load business directory
  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'businesses')).then(snap => {
      setBusinessDirectory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).catch(() => {});
  }, [user?.id]);

  // Jobs listeners
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = [];
      snapshot.forEach((doc) => {
        const job = { id: doc.id, ...doc.data() };
        
        if (user.role === 'worker') {
          if (job.status !== 'completed') {
            jobsData.push(job);
          }
        } else if (user.role === 'client') {
          if (job.isPublic !== false && job.userId !== user.id && job.status !== 'completed') {
            jobsData.push(job);
          }
        }
      });
      
      jobsData.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return 0;
      });
      
      setJobs(jobsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // My Jobs listener
  useEffect(() => {
    if (!user || user.role !== 'client') return;

    const q = query(
      collection(db, 'jobs'), 
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeJobs = [];
      const doneJobs = [];
      
      snapshot.forEach((doc) => {
        const job = { id: doc.id, ...doc.data() };
        if (job.status === 'completed') {
          doneJobs.push(job);
        } else {
          activeJobs.push(job);
        }
      });

      doneJobs.sort((a, b) => {
        const ta = a.completedAt?.toDate?.().getTime() || 0;
        const tb = b.completedAt?.toDate?.().getTime() || 0;
        return tb - ta;
      });
      setMyJobs(activeJobs);
      setCompletedJobs(doneJobs);
    });

    return unsubscribe;
  }, [user]);

  // My Bids listener
  useEffect(() => {
    if (!user || user.role !== 'worker') return;

    const unsubscribe = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const bidsData = [];
      snapshot.forEach((doc) => {
        const job = { id: doc.id, ...doc.data() };
        if (job.bids) {
          job.bids.forEach(bid => {
            if (bid.userId === user.id) {
              bidsData.push({ ...job, myBid: bid });
            }
          });
        }
      });
      setMyBids(bidsData);
    });

    return unsubscribe;
  }, [user]);

  // Notifications listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      let unread = 0;
      snapshot.forEach((doc) => {
        const notif = { id: doc.id, ...doc.data() };
        notifs.push(notif);
        if (!notif.read) unread++;
      });
      setNotifications(notifs);
      setUnreadCount(unread);
    });

    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedRole(null);
      setActiveTab('browse');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  const handleDeleteJob = async (job) => {
    Alert.alert(
      'Eliminar trabajo',
      '¿Estás seguro de eliminar este trabajo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'jobs', job.id));
              Alert.alert('✓ Eliminado', 'El trabajo fue eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el trabajo');
            }
          }
        }
      ]
    );
  };

  const handleCheckEmailVerified = async () => {
    setVerifyLoading(true);
    try {
      await auth.currentUser?.reload();
      const updatedUser = auth.currentUser;
      if (updatedUser?.emailVerified) {
        setNeedsEmailVerification(false);
        const userDoc = await getDoc(doc(db, 'users', updatedUser.uid));
        if (userDoc.exists()) {
          setUser({ id: updatedUser.uid, email: updatedUser.email, ...userDoc.data() });
        } else {
          setUser({ id: updatedUser.uid, email: updatedUser.email, role: 'client', rating: 0, jobCount: 0, clientRating: 0, clientRatedCount: 0 });
        }
        setupPushNotifications(updatedUser.uid);
      } else {
        Alert.alert('Correo no verificado', 'Aún no detectamos la verificación. Abre el correo y toca el enlace primero.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo verificar. Intenta de nuevo.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        Alert.alert('Enviado', `Reenviamos el correo de verificación a ${verificationEmail}`);
      }
    } catch {
      Alert.alert('Error', 'No se pudo reenviar. Intenta en un momento.');
    }
  };

  const handleGoBackFromVerification = async () => {
    try {
      await auth.signOut();
    } catch {}
    setNeedsEmailVerification(false);
    setVerificationEmail('');
  };

  if (initializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (needsEmailVerification) {
    return (
      <VerifyEmailScreen
        email={verificationEmail}
        onCheckVerification={handleCheckEmailVerified}
        onResend={handleResendVerification}
        onGoBack={handleGoBackFromVerification}
        loading={verifyLoading}
      />
    );
  }

  if (!user) {
    if (!selectedRole) {
      return <RoleSelectionScreen onRoleSelected={setSelectedRole} />;
    }
    return <LoginScreen role={selectedRole} onBack={() => setSelectedRole(null)} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen role={user.role} onDone={() => setShowOnboarding(false)} />;
  }

  const isClient = user.role === 'client';
  const roleColor = isClient ? COLORS.blue : COLORS.accent;
  const roleIcon = isClient ? '👤' : '👷';
  const roleName = isClient ? 'Cliente' : 'Trabajador';

  const renderContent = () => {
    if (activeTab === 'browse') {
      if (isClient) {
        return (
          <>
            <View style={[styles.exploreTabs, { backgroundColor: activeColors.bg, borderBottomColor: activeColors.border }]}>
              <TouchableOpacity style={[styles.exploreTab, { borderColor: activeColors.border, backgroundColor: activeColors.card }, exploreSection === 'listings' && styles.exploreTabActive]} onPress={() => { setExploreSection('listings'); setJobSearch(''); }}>
                <Ionicons name={exploreSection === 'listings' ? 'briefcase' : 'briefcase-outline'} size={15} color={exploreSection === 'listings' ? COLORS.accent : activeColors.muted} />
                <Text style={[styles.exploreTabText, { color: activeColors.muted }, exploreSection === 'listings' && styles.exploreTabTextActive]}>Trabajos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.exploreTab, { borderColor: activeColors.border, backgroundColor: activeColors.card }, exploreSection === 'workers' && styles.exploreTabActive]} onPress={() => { setExploreSection('workers'); setJobSearch(''); }}>
                <Ionicons name={exploreSection === 'workers' ? 'people' : 'people-outline'} size={15} color={exploreSection === 'workers' ? COLORS.accent : activeColors.muted} />
                <Text style={[styles.exploreTabText, { color: activeColors.muted }, exploreSection === 'workers' && styles.exploreTabTextActive]}>Trabajadores</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.exploreTab, { borderColor: activeColors.border, backgroundColor: activeColors.card }, exploreSection === 'businesses' && styles.exploreTabActive]} onPress={() => { setExploreSection('businesses'); setJobSearch(''); }}>
                <Ionicons name={exploreSection === 'businesses' ? 'business' : 'business-outline'} size={15} color={exploreSection === 'businesses' ? COLORS.accent : activeColors.muted} />
                <Text style={[styles.exploreTabText, { color: activeColors.muted }, exploreSection === 'businesses' && styles.exploreTabTextActive]}>Empresas</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBarWrap, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <Ionicons name="search-outline" size={16} color={activeColors.muted} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.searchBarInput, { color: activeColors.text }]}
                value={jobSearch}
                onChangeText={setJobSearch}
                placeholder={exploreSection === 'listings' ? 'Buscar trabajos...' : exploreSection === 'workers' ? 'Buscar trabajadores...' : 'Buscar empresas...'}
                placeholderTextColor={activeColors.muted}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {jobSearch.length > 0 && (
                <TouchableOpacity onPress={() => setJobSearch('')}>
                  <Ionicons name="close-circle" size={16} color={activeColors.muted} />
                </TouchableOpacity>
              )}
            </View>

            {exploreSection === 'businesses' ? (
              <FlatList
                data={businessDirectory.filter(b => !jobSearch || [b.name, b.description, b.category].filter(Boolean).some(f => f.toLowerCase().includes(jobSearch.toLowerCase())))}
                keyExtractor={b => b.id}
                contentContainerStyle={styles.jobList}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="business-outline" size={48} color={COLORS.muted} style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyStateText}>{jobSearch ? 'Sin resultados para tu búsqueda' : 'No hay empresas registradas'}</Text>
                  </View>
                }
                renderItem={({ item }) => <BusinessCard business={item} onPress={b => setSelectedWorker({ isBusiness: true, ...b })} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />}
              />
            ) : exploreSection === 'listings' ? (
              <FlatList
                data={jobs.filter(j => !jobSearch || [j.title, j.description, j.location].filter(Boolean).some(f => f.toLowerCase().includes(jobSearch.toLowerCase())))}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.jobList}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>📋</Text>
                    <Text style={styles.emptyStateText}>{jobSearch ? 'Sin resultados para tu búsqueda' : 'No hay trabajos disponibles'}</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <JobCard
                    job={item}
                    onPress={setSelectedJob}
                    showCreator={true}
                  />
                )}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />
                }
              />
            ) : (
              <WorkersInlineList
                onSelectWorker={(worker) => setSelectedWorker(worker)}
                currentUser={user}
                favoriteIds={user?.favoriteWorkers || []}
                onToggleFavorite={toggleFavorite}
                previousWorkerIds={completedJobs.map(j => j.assignedTo).filter(Boolean)}
                searchQuery={jobSearch}
              />
            )}
          </>
        );
      }

      // Worker feed with search + filter chips
      const filteredJobs = (feedFilter === 'all' ? jobs : jobs.filter(j => j.type === feedFilter))
        .filter(j => !jobSearch || [j.title, j.description, j.location].filter(Boolean).some(f => f.toLowerCase().includes(jobSearch.toLowerCase())));
      const bankingSetup = !!user?.stripeAccountId;
      return (
        <>
          <View style={[styles.searchBarWrap, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <Ionicons name="search-outline" size={16} color={activeColors.muted} style={{ marginRight: 6 }} />
            <TextInput
              style={[styles.searchBarInput, { color: activeColors.text }]}
              value={jobSearch}
              onChangeText={setJobSearch}
              placeholder="Buscar trabajos..."
              placeholderTextColor={activeColors.muted}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {jobSearch.length > 0 && (
              <TouchableOpacity onPress={() => setJobSearch('')}>
                <Ionicons name="close-circle" size={16} color={activeColors.muted} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 62 }} contentContainerStyle={styles.feedFilterBar}>
            <TouchableOpacity style={[styles.filterChip, { backgroundColor: activeColors.card, borderColor: activeColors.border }, feedFilter === 'all' && styles.filterChipActive]} onPress={() => { feedListRef.current?.scrollTo({ y: 0, animated: false }); setFeedFilter('all'); }}>
              <Text style={[styles.filterChipText, { color: activeColors.muted }, feedFilter === 'all' && styles.filterChipTextActive]}>Todos</Text>
            </TouchableOpacity>
            {SERVICES.map(s => {
              const active = feedFilter === s.id;
              return (
                <TouchableOpacity key={s.id} style={[styles.filterChip, { backgroundColor: activeColors.card, borderColor: activeColors.border }, active && styles.filterChipActive, { flexDirection: 'row', alignItems: 'center', gap: 5 }]} onPress={() => { feedListRef.current?.scrollTo({ y: 0, animated: false }); setFeedFilter(s.id); }}>
                  <Ionicons name={s.icon} size={14} color={active ? COLORS.accent : activeColors.muted} />
                  <Text style={[styles.filterChipText, { color: active ? COLORS.accent : activeColors.muted }, active && styles.filterChipTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <ScrollView
            ref={feedListRef}
            style={{ flex: 1, backgroundColor: activeColors.bg }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }}
          >
            {!bankingSetup && (
              <TouchableOpacity
                onPress={() => setShowBankingSetupFromFeed(true)}
                style={{ backgroundColor: COLORS.yellow + '22', borderRadius: 12, borderWidth: 1, borderColor: COLORS.yellow + '55', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}
              >
                <Ionicons name="alert-circle" size={20} color={COLORS.yellow} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.yellow, fontWeight: '700', fontSize: 13 }}>Cuenta de pagos no configurada</Text>
                  <Text style={{ color: COLORS.yellow, fontSize: 12, opacity: 0.85 }}>Configura tu cuenta bancaria para cobrar trabajos con tarjeta. Toca aquí →</Text>
                </View>
              </TouchableOpacity>
            )}
            {filteredJobs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={[styles.emptyStateText, { color: activeColors.muted }]}>{feedFilter === 'all' ? 'No hay trabajos disponibles' : 'No hay trabajos de este tipo'}</Text>
              </View>
            ) : filteredJobs.map(item => (
              <JobCard key={item.id} job={item} onPress={setSelectedJob} showClientRating={true} />
            ))}
          </ScrollView>
        </>
      );
    }

    if (activeTab === 'my-jobs' && isClient) {
      const allJobs = [...myJobs, ...completedJobs];
      const activeClientJobs = allJobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled');
      const doneClientJobs   = allJobs.filter(j => j.status === 'completed');

      const listData = myJobFilter === 'all'
        ? activeClientJobs
        : myJobFilter === 'active'
          ? activeClientJobs
          : myJobFilter === 'completed'
            ? doneClientJobs
            : allJobs.filter(j => j.status === myJobFilter);

      const showDoneSection = myJobFilter === 'all' && doneClientJobs.length > 0;

      return (
        <View style={{ flex: 1 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ height: 62 }} contentContainerStyle={styles.filterBar}>
            {[
              ['all',             'list-outline',            'list',             'Todos'],
              ['open',            'radio-button-on-outline', 'radio-button-on',  'Abiertos'],
              ['active',          'hammer-outline',          'hammer',           'En progreso'],
              ['pending_payment', 'time-outline',            'time',             'Por pagar'],
              ['completed',       'checkmark-circle-outline','checkmark-circle', 'Completados'],
            ].map(([k, iconOff, iconOn, label]) => {
              const active = myJobFilter === k;
              return (
                <TouchableOpacity key={k}
                  style={[styles.filterChip, { backgroundColor: activeColors.card, borderColor: activeColors.border }, active && styles.filterChipActive, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}
                  onPress={() => setMyJobFilter(k)}>
                  <Ionicons name={active ? iconOn : iconOff} size={14} color={active ? COLORS.accent : activeColors.muted} />
                  <Text style={[styles.filterChipText, { color: activeColors.muted }, active && styles.filterChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <FlatList
            data={listData}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.jobList}
            ListHeaderComponent={listData.length > 0 && myJobFilter === 'all'
              ? <Text style={[styles.sectionHeader, { color: activeColors.text, marginBottom: 10 }]}>En progreso ({activeClientJobs.length})</Text>
              : null}
            ListEmptyComponent={!showDoneSection
              ? <View style={styles.emptyState}>
                  <Ionicons name="briefcase-outline" size={48} color={activeColors.muted} style={{ marginBottom: 8 }} />
                  <Text style={[styles.emptyStateText, { color: activeColors.muted }]}>
                    {myJobFilter === 'all' ? 'No has publicado trabajos' : 'No hay trabajos en esta categoría'}
                  </Text>
                  {myJobFilter === 'all' && (
                    <TouchableOpacity style={styles.emptyButton} onPress={() => setShowPostJob(true)}>
                      <Text style={styles.emptyButtonText}>+ Publicar primero</Text>
                    </TouchableOpacity>
                  )}
                </View>
              : null}
            ListFooterComponent={showDoneSection ? (
              <>
                <Text style={[styles.sectionHeader, { color: activeColors.text, marginTop: 20, marginBottom: 10 }]}>
                  Completados ({doneClientJobs.length})
                </Text>
                {doneClientJobs.map(item => (
                  <JobCard
                    key={item.id}
                    job={item}
                    onPress={setSelectedJob}
                    showMenu={false}
                    onEdit={() => {}}
                    onDelete={handleDeleteJob}
                  />
                ))}
              </>
            ) : null}
            renderItem={({ item }) => (
              <JobCard
                job={item}
                onPress={setSelectedJob}
                showMenu={item.status !== 'completed'}
                onEdit={(job) => { setEditingJob(job); setShowPostJob(true); }}
                onDelete={handleDeleteJob}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />
            }
          />
        </View>
      );
    }

    if (activeTab === 'my-bids' && !isClient) {
      const sortJobs = (arr) => {
        const sorted = [...arr];
        if (bidSort === 'date') {
          sorted.sort((a, b) => {
            const ts = (bid) => bid?.toMillis?.() ?? bid?.getTime?.() ?? 0;
            return ts(b.myBid?.createdAt) - ts(a.myBid?.createdAt);
          });
        } else if (bidSort === 'price') {
          sorted.sort((a, b) => (b.myBid?.price ?? 0) - (a.myBid?.price ?? 0));
        } else if (bidSort === 'status') {
          const order = { assigned: 0, open: 1, pending_payment: 2, completed: 3 };
          sorted.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
        }
        return sorted;
      };

      const activeBids = myBids.filter(j => j.status !== 'completed');
      const doneBids   = myBids.filter(j => j.status === 'completed');
      const filteredActive = sortJobs(bidFilter === 'all' ? activeBids : activeBids.filter(j => j.status === bidFilter));
      const filteredDone   = sortJobs(bidFilter === 'all' || bidFilter === 'completed' ? doneBids : []);

      const sortOptions = [
        { key: 'date',   label: 'Fecha',  icon: 'calendar-outline' },
        { key: 'price',  label: 'Precio', icon: 'pricetag-outline' },
        { key: 'status', label: 'Estado', icon: 'layers-outline' },
      ];

      return (
        <View style={{ flex: 1 }}>
          {/* Filter + sort bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ height: 62 }} contentContainerStyle={styles.filterBar}>
            {[
              ['all',       'list-outline',             'list',              'Todos'],
              ['open',      'radio-button-on-outline',  'radio-button-on',   'Abiertos'],
              ['assigned',  'hammer-outline',            'hammer',            'Asignados'],
              ['completed', 'checkmark-circle-outline',  'checkmark-circle',  'Completados'],
            ].map(([k, iconOff, iconOn, label]) => {
              const active = bidFilter === k;
              return (
                <TouchableOpacity key={k}
                  style={[styles.filterChip, { backgroundColor: activeColors.card, borderColor: activeColors.border }, active && styles.filterChipActive, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}
                  onPress={() => { bidsListRef.current?.scrollTo({ y: 0, animated: false }); setBidFilter(k); }}>
                  <Ionicons name={active ? iconOn : iconOff} size={14} color={active ? COLORS.accent : activeColors.muted} />
                  <Text style={[styles.filterChipText, { color: activeColors.muted }, active && styles.filterChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
            {/* Divider */}
            <View style={{ width: 1, height: 24, backgroundColor: activeColors.border, marginHorizontal: 6, alignSelf: 'center' }} />
            {sortOptions.map(({ key, label, icon }) => {
              const active = bidSort === key;
              return (
                <TouchableOpacity key={key}
                  style={[styles.filterChip, { backgroundColor: activeColors.card, borderColor: activeColors.border }, active && { borderColor: COLORS.green, backgroundColor: COLORS.green + '22' }, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}
                  onPress={() => setBidSort(key)}>
                  <Ionicons name={icon} size={14} color={active ? COLORS.green : activeColors.muted} />
                  <Text style={[styles.filterChipText, { color: active ? COLORS.green : activeColors.muted }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            ref={bidsListRef}
            style={{ flex: 1, backgroundColor: activeColors.bg }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }}
          >
            {filteredActive.length === 0 && filteredDone.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color={activeColors.muted} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyStateText, { color: activeColors.muted }]}>No hay propuestas aquí</Text>
              </View>
            ) : (
              <>
                {filteredActive.length > 0 && (
                  <Text style={[styles.sectionHeader, { color: activeColors.text }]}>En progreso ({filteredActive.length})</Text>
                )}
                {filteredActive.map(item => (
                  <TouchableOpacity key={item.id} onPress={() => setSelectedJob(item)} style={[styles.bidJobCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                    <View style={styles.jobCardHeader}>
                      <ServiceIcon type={item.type} size={48} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.jobTitle, { color: activeColors.text }]}>{item.title}</Text>
                        <Text style={[styles.jobLocation, { color: activeColors.muted }]}>📍 {item.estimatedLocation?.area || item.location}</Text>
                        {item.clientRating > 0 && (
                          <Text style={{ fontSize: 10, color: COLORS.yellow, marginTop: 2 }}>
                            Cliente: {item.clientRating.toFixed(1)}
                          </Text>
                        )}
                      </View>
                      <StatusBadge status={item.status} />
                    </View>
                    <View style={styles.myBidInfo}>
                      <Text style={[styles.myBidLabel, { color: activeColors.muted }]}>Tu propuesta:</Text>
                      <Text style={styles.myBidPrice}>${item.myBid?.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {filteredDone.length > 0 && (
                  <>
                    <Text style={[styles.sectionHeader, { marginTop: 20, color: activeColors.text }]}>
                      Completados ({filteredDone.length})
                    </Text>
                    {filteredDone.map(item => (
                      <TouchableOpacity key={item.id} onPress={() => setSelectedJob(item)} style={[styles.bidJobCard, { opacity: 0.8, backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                        <View style={styles.jobCardHeader}>
                          <ServiceIcon type={item.type} size={48} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.jobTitle, { color: activeColors.text }]}>{item.title}</Text>
                            <Text style={[styles.jobLocation, { color: activeColors.muted }]}>📍 {item.estimatedLocation?.area || item.location}</Text>
                          </View>
                          <StatusBadge status={item.status} />
                        </View>
                        <View style={styles.myBidInfo}>
                          <Text style={[styles.myBidLabel, { color: activeColors.muted }]}>Tu propuesta:</Text>
                          <Text style={styles.myBidPrice}>${item.myBid?.price}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </View>
      );
    }
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.taskly.app">
    <ErrorBoundary>
    <ThemeContext.Provider value={activeColors}>
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.bg }]}>
      <StatusBar barStyle={resolvedScheme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={activeColors.bg} />

      <View style={[styles.header, { borderBottomColor: activeColors.border, backgroundColor: activeColors.bg }]}>
        <Text style={[styles.logo, { color: activeColors.text }]}>
          Task<Text style={{ color: COLORS.accent }}>ly</Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => setShowNotifications(true)}>
            <View>
              <Ionicons name={unreadCount > 0 ? 'notifications' : 'notifications-outline'} size={24} color={activeColors.text} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.successBanner, { backgroundColor: roleColor + '22', borderBottomColor: roleColor + '44' }]}>
        <Text style={[styles.successText, { color: roleColor }]}>
          {roleIcon} {roleName}
        </Text>
        <Text style={[styles.successSubtext, { color: roleColor }]}>
          {user.email}
        </Text>
      </View>

      {renderContent()}

      {/* FAB positioned HIGHER to clear profile button */}
      {isClient && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            setEditingJob(null);
            setShowPostJob(true);
          }}
        >
          <Text style={styles.fabText}>+ Publicar</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.bottomNav, { backgroundColor: activeColors.bg, borderTopColor: activeColors.border }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('browse')}
        >
          <Ionicons name={activeTab === 'browse' ? 'search' : 'search-outline'} size={24} color={activeTab === 'browse' ? COLORS.accent : activeColors.muted} />
          <Text style={[styles.navText, { color: activeColors.muted }, activeTab === 'browse' && styles.navTextActive]}>Explorar</Text>
        </TouchableOpacity>

        {isClient ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setActiveTab('my-jobs')}
          >
            <Ionicons name={activeTab === 'my-jobs' ? 'briefcase' : 'briefcase-outline'} size={24} color={activeTab === 'my-jobs' ? COLORS.accent : activeColors.muted} />
            <Text style={[styles.navText, { color: activeColors.muted }, activeTab === 'my-jobs' && styles.navTextActive]}>Mis trabajos</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setActiveTab('my-bids')}
          >
            <Ionicons name={activeTab === 'my-bids' ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={activeTab === 'my-bids' ? COLORS.accent : activeColors.muted} />
            <Text style={[styles.navText, { color: activeColors.muted }, activeTab === 'my-bids' && styles.navTextActive]}>Mis propuestas</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setShowProfile(true)}
        >
          <Ionicons name="person-outline" size={24} color={activeColors.muted} />
          <Text style={[styles.navText, { color: activeColors.muted }]}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          user={user}
          onClose={() => setSelectedJob(null)}
          onRefresh={() => setLoading(true)}
          onViewWorkerProfile={(workerId) => {
            const savedJob = selectedJob;
            setSelectedJob(null);
            getDoc(doc(db, 'users', workerId)).then(d => {
              if (d.exists()) setSelectedWorker({ id: d.id, ...d.data(), _parentJob: savedJob });
            });
          }}
        />
      )}

      {showPostJob && (
        <PostJobScreen
          user={user}
          onClose={() => {
            setShowPostJob(false);
            setEditingJob(null);
          }}
          editingJob={editingJob}
        />
      )}

      {showProfile && (
        <ProfileScreen
          user={user}
          onClose={() => setShowProfile(false)}
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
          onShowOnboarding={() => setShowOnboarding(true)}
        />
      )}

      {selectedWorker && (selectedWorker.isBusiness
        ? <BusinessProfileModal business={selectedWorker} currentUser={user} onClose={() => setSelectedWorker(null)} />
        : <WorkerProfileModal
            worker={selectedWorker}
            currentUser={user}
            onClose={() => {
              const parentJob = selectedWorker?._parentJob;
              setSelectedWorker(null);
              if (parentJob) setSelectedJob(parentJob);
            }}
            favoriteIds={user?.favoriteWorkers || []}
            onToggleFavorite={user?.role === 'client' ? toggleFavorite : undefined}
          />
      )}

      {showNotifications && (
        <NotificationsScreen
          user={user}
          onClose={() => setShowNotifications(false)}
          onOpenJob={(job) => {
            setShowNotifications(false);
            setSelectedJob(job);
          }}
        />
      )}

      {showBankingSetupFromFeed && (
        <BankingOnboardingModal
          userId={user.id}
          userName={user.name}
          onDone={() => setShowBankingSetupFromFeed(false)}
        />
      )}
    </SafeAreaView>
    </ThemeContext.Provider>
    </ErrorBoundary>
    </StripeProvider>
  );
}

// COMPLETE STYLESHEET WITH NEW FEATURES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  logoutText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  successBanner: { padding: 12, alignItems: 'center', borderBottomWidth: 1 },
  successText: { fontSize: 13, fontWeight: '700' },
  successSubtext: { fontSize: 11, marginTop: 2 },
  
  exploreTabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  exploreTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
  },
  exploreTabActive: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
  },
  exploreTabText: { fontSize: 14, fontWeight: '700', color: COLORS.muted },
  exploreTabTextActive: { color: COLORS.accent },
  
  myJobsTabs: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  
  jobList: { padding: 16, paddingBottom: 140 }, // Extra padding for FAB
  jobCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  jobCardImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  urgentBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  urgentText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  bidJobCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  jobCardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  serviceIcon: {
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  jobLocation: { fontSize: 12, color: COLORS.muted },
  jobCreator: { fontSize: 11, color: COLORS.accent, marginTop: 2 },
  clientRatingText: { fontSize: 10, color: COLORS.yellow, fontWeight: '600' },
  jobDescription: { fontSize: 13, color: COLORS.text, lineHeight: 18, marginBottom: 12 },
  jobFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  jobBudget: { fontSize: 16, fontWeight: '800', color: COLORS.green },
  jobBids: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  jobTime: { fontSize: 11, color: COLORS.muted },
  privateLabel: { fontSize: 9, color: COLORS.muted, marginTop: 4 },
  jobActions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionButton: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  deleteButton: { borderColor: COLORS.red + '44' },
  actionButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  chatButton: {
    backgroundColor: COLORS.blue + '22',
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  chatButtonText: { color: COLORS.blue, fontSize: 13, fontWeight: '700' },
  
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    gap: 12,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  workerAvatarText: { fontSize: 24, fontWeight: '900', color: '#fff' },
  workerName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  workerRating: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  workerJobs: { fontSize: 11, color: COLORS.muted },
  workerBio: { fontSize: 12, color: COLORS.text, marginTop: 4, lineHeight: 16 },
  workerTopReview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  workerReviewText: {
    fontSize: 11,
    color: COLORS.text,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 14,
  },
  viewProfileText: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },
  myBidInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myBidLabel: { fontSize: 12, color: COLORS.muted },
  myBidPrice: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  
  assignedBox: {
    backgroundColor: COLORS.accent + '22',
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
  },
  assignedText: { fontSize: 14, fontWeight: '700', color: COLORS.accent, marginBottom: 4 },
  assignedPrice: { fontSize: 13, color: COLORS.accent },
  shareLocationButton: {
    backgroundColor: COLORS.green + '22',
    borderWidth: 1,
    borderColor: COLORS.green,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  shareLocationText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  viewMapButton: {
    backgroundColor: COLORS.blue + '22',
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  viewMapText: { color: COLORS.blue, fontSize: 13, fontWeight: '700' },
  chatButtonInline: {
    backgroundColor: COLORS.blue + '22',
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  
  changeLocationButton: {
    backgroundColor: COLORS.blue + '22',
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  changeLocationText: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '700',
  },
  gpsButton: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  gpsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  mapPinContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPinEmoji: {
    fontSize: 40,
    marginBottom: 36,
  },
  mapGeocodingBadge: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationBottomPanel: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    paddingBottom: 24,
  },
  
  // Location Picker Modal Styles
  locationPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  locationPickerContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  locationPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationPickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  locationPickerClose: {
    fontSize: 24,
    color: COLORS.muted,
    fontWeight: '700',
  },
  locationPickerScroll: {
    marginBottom: 16,
  },
  locationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  locationChipActive: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
  },
  locationChipText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  locationChipTextActive: {
    color: COLORS.accent,
  },
  
  // Map Preview Styles
  mapPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  mapViewImage: {
    width: '100%',
    height: 300,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  mapPreviewHint: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  mapPlaceholder: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  mapPlaceholderIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 8,
  },
  mapHint: {
    fontSize: 11,
    color: COLORS.muted,
    fontStyle: 'italic',
  },
  
  // Map Modal Styles
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mapModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  mapModalClose: {
    fontSize: 24,
    color: COLORS.muted,
    fontWeight: '700',
  },
  mapCoordinates: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  mapAddress: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  mapActions: {
    gap: 12,
    marginTop: 16,
  },
  mapButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  mapButtonSecondary: {
    backgroundColor: COLORS.blue,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Image Picker Styles
  imagePickerButton: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  imagePreview: {
    alignItems: 'center',
  },
  imagePreviewImg: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  
  // Payment Modal Styles
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  paymentDescription: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 24,
  },
  paymentInfo: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  paymentInfoText: {
    fontSize: 13,
    color: COLORS.green,
    textAlign: 'center',
    marginBottom: 4,
  },
  paymentHint: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  acceptButton: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  acceptButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  completeButton: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  completeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  
  // FAB positioned HIGHER (120px from bottom instead of 90px)
  fab: {
    position: 'absolute',
    bottom: 120, // MOVED HIGHER to clear profile button
    right: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: COLORS.bg,
  },
  navButton: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navIcon: { fontSize: 24, marginBottom: 4 },
  navText: { fontSize: 10, fontWeight: '700', color: COLORS.muted },
  navTextActive: { color: COLORS.accent },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateIcon: { fontSize: 64, marginBottom: 16 },
  emptyStateText: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: { color: COLORS.accent, fontSize: 16, fontWeight: '700' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  chatSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  formScroll: { flex: 1 },
  formContainer: { padding: 20, gap: 16 },
  formLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '700', marginBottom: 8 },
  formHint: { fontSize: 11, color: COLORS.muted, marginBottom: 8, lineHeight: 14 },
  
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    marginBottom: 8,
  },
  privacyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  privacySubtitle: { fontSize: 12, color: COLORS.muted, lineHeight: 16 },
  
  urgentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '11',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
    gap: 12,
    marginBottom: 8,
  },
  urgentTitle: { fontSize: 16, fontWeight: '700', color: COLORS.accent, marginBottom: 4 },
  urgentSubtitle: { fontSize: 12, color: COLORS.accent, lineHeight: 16 },
  
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8, justifyContent: 'space-between' },
  serviceButton: {
    width: '30%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  serviceButtonText: { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    color: COLORS.text,
    fontSize: 14,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  pickerContainer: { gap: 8, marginBottom: 8 },
  locationButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
  },
  locationButtonActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  locationButtonText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  locationButtonTextActive: { color: COLORS.accent },
  
  budgetRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
  budgetLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '700', marginBottom: 8 },
  budgetSeparator: { color: COLORS.muted, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  
  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  
  modalContent: { flex: 1, padding: 20 },
  jobDetailImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  jobDetailHeader: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  jobDetailTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  jobDetailLocation: { fontSize: 13, color: COLORS.muted },
  jobDetailCreator: { fontSize: 12, color: COLORS.accent, marginTop: 2 },
  
  infoBox: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  descriptionText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  infoItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '700', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  infoText: { fontSize: 12, color: COLORS.text, lineHeight: 18 },
  infoBox: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  
  bidsSection: { marginBottom: 20 },
  bidCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  bidHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  bidUserName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  bidUserEmail: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  bidPrice: { fontSize: 18, fontWeight: '800', color: COLORS.accent },
  bidMessage: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  bidFormSection: { marginBottom: 40 },
  
  alreadyBidBox: {
    backgroundColor: COLORS.green + '22',
    borderWidth: 1,
    borderColor: COLORS.green + '44',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  alreadyBidText: { color: COLORS.green, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  
  messagesList: { padding: 16 },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyChatText: { fontSize: 16, color: COLORS.muted },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageSender: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#fff',
    opacity: 0.7,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  
  ratingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ratingModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 24,
    textAlign: 'center',
  },
  starSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  
  workerProfileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  workerProfileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  workerProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  workerProfileAvatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
  },
  workerProfileName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  workerProfileRating: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
  },
  workerProfileBio: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  
  ratingsSection: {
    marginBottom: 20,
  },
  ratingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingDate: {
    fontSize: 11,
    color: COLORS.muted,
  },
  ratingReview: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  removeReviewButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.red + '22',
    borderWidth: 1,
    borderColor: COLORS.red + '44',
    alignItems: 'center',
  },
  removeReviewText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '700',
  },
  
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileAvatarText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  profileRole: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  profileStats: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  profileInfo: { gap: 16 },
  
  workersList: { padding: 16, paddingBottom: 120 },
  
  notificationsList: { padding: 16 },
  notificationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationUnread: { borderColor: COLORS.accent },
  notificationIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginRight: 4,
  },
  notificationMessage: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  notificationTime: { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  notificationArrow: { fontSize: 18, color: COLORS.muted, marginLeft: 8 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  
  loginContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logoIcon: { fontSize: 64, marginBottom: 12 },
  roleIconLarge: { fontSize: 64, marginBottom: 12 },
  logoText: { fontSize: 42, fontWeight: '900', color: COLORS.text },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 6, fontWeight: '600', letterSpacing: 2 },
  welcomeText: { fontSize: 28, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 24 },
  
  roleContainer: { gap: 20 },
  roleTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  roleSubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 24 },
  roleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: { fontSize: 40 },
  roleCardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  roleCardDescription: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  backButtonText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },

  // ✅ NEW STYLES - Maps inline display
  inlineMapBox: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.blue + '44',
  },
  inlineMapAddress: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  inlineMapCoords: { fontSize: 11, color: COLORS.muted, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  inlineMapView: { width: '100%', height: 180, borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  mapActionBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  mapActionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // ✅ Filter bar
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  filterChipActive: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
  },
  filterChipText: { fontSize: 13, fontWeight: '700', color: COLORS.muted, textAlign: 'center', lineHeight: 16 },
  filterChipTextActive: { color: COLORS.accent },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  actionSheet: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },

  savedLocChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  savedLocChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '11',
  },
  savedLocLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },

  themeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  themeChipActive: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
  },
  themeChipIcon: { fontSize: 20 },
  themeChipText: { fontSize: 12, fontWeight: '700', color: COLORS.muted },
  themeChipTextActive: { color: COLORS.accent },

  suggestionsBox: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: { fontSize: 13, color: COLORS.text },

  // ✅ Schedule styles
  scheduleOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  scheduleContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  scheduleTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  scheduleSubtitle: { fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
  },
  datePickerButtonText: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  datePickerChevron: { fontSize: 11, color: COLORS.muted },
  scheduleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    margin: 8,
    borderWidth: 2,
    borderColor: COLORS.accent + '66',
  },
  scheduleCardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.accent, marginBottom: 6 },
  scheduleCardTime: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  scheduleBtn: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  scheduleBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scheduledBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.green + '22',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.green + '44',
  },
  scheduledBannerText: { color: COLORS.green, fontSize: 13, fontWeight: '600' },
  scheduledBannerLink: { color: COLORS.green, fontSize: 12, fontWeight: '800' },

  // ✅ Location in chat
  chatLocationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue + '22',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.blue + '44',
    gap: 8,
  },
  chatLocationIcon: { fontSize: 16 },
  chatLocationText: { flex: 1, fontSize: 12, color: COLORS.text, fontWeight: '600' },
  chatLocationLink: { color: COLORS.blue, fontSize: 12, fontWeight: '800' },

  // ✅ Rating hide/show buttons
  hideRatingBtn: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    alignItems: 'center',
  },
  hideRatingText: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  showRatingBtn: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.green + '22',
    borderWidth: 1,
    borderColor: COLORS.green,
    alignItems: 'center',
  },
  showRatingText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  hiddenRatingsSection: {
    backgroundColor: COLORS.border + '66',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  // ✅ Bid view worker profile link
  bidViewProfile: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: '700',
    marginTop: 4,
  },

  // ✅ Onboarding
  onboardingContainer: { flex: 1, backgroundColor: COLORS.bg },
  onboardingIcon: { fontSize: 80, textAlign: 'center', marginBottom: 24 },
  onboardingTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 16 },
  onboardingDesc: { fontSize: 16, color: COLORS.muted, textAlign: 'center', lineHeight: 24 },
  onboardingDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  onboardingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  onboardingDotActive: { backgroundColor: COLORS.accent, width: 24 },
  onboardingActions: { paddingHorizontal: 24, paddingBottom: 40 },
  onboardingSkipBtn: { paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center' },
  onboardingSkipText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },

  // ✅ Image gallery
  galleryCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  galleryCloseTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  galleryCounter: { position: 'absolute', top: 55, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 13, fontWeight: '600', zIndex: 5 },
  galleryDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  galleryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  galleryDotActive: { backgroundColor: '#fff', width: 16 },

  // ✅ Worker specialties & business
  specialtyChip: { fontSize: 11, fontWeight: '700', color: COLORS.muted, backgroundColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  workerBusiness: { fontSize: 11, color: COLORS.accent, fontWeight: '600', marginTop: 4 },

  // ✅ Business cards
  businessCard: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  businessLogo: { width: 60, height: 60, borderRadius: 14 },
  businessName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  businessMeta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  businessDesc: { fontSize: 12, color: COLORS.muted, marginTop: 6, lineHeight: 16 },

  // ✅ Feed filter bar
  feedFilterBar: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchBarInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    padding: 0,
  },

  // ✅ Verified badge on worker cards
  verifiedBadge: {
    backgroundColor: COLORS.blue,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  // ✅ INE verification section in ProfileScreen
  ineSection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
  },
  ineStatusBox: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  ineStatusLabel: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  ineStatusDesc: { fontSize: 12, color: COLORS.muted, lineHeight: 16 },
  ineImageBox: {
    flex: 1,
    aspectRatio: 1.6,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ineImageBoxDone: { borderColor: COLORS.green, borderStyle: 'solid' },
  ineThumb: { width: '100%', height: '100%', borderRadius: 10 },
  ineImageLabel: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // sectionHeader already defined above

  // ✅ Multi-media picker
  mediaRowContent: { flexDirection: 'row', gap: 10, paddingBottom: 8 },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbnailImg: { width: '100%', height: '100%', borderRadius: 12 },
  mediaDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaDeleteText: { color: '#fff', fontSize: 16, fontWeight: '900', lineHeight: 20 },
  mediaVideoTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mediaVideoTagText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  mediaAddBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent + '66',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    gap: 4,
  },
  mediaAddIcon: { fontSize: 28, color: COLORS.accent },
  mediaAddText: { fontSize: 11, color: COLORS.accent, fontWeight: '700', textAlign: 'center' },

  // ✅ Settings screen
  settingsScroll: { paddingHorizontal: 16, paddingTop: 8 },
  settingsSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    minHeight: 56,
  },
  settingsRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsRowTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  settingsRowSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  settingsRowChevron: { fontSize: 22, color: COLORS.muted, fontWeight: '300' },
  settingsDivider: { height: 1, backgroundColor: COLORS.border, marginLeft: 62 },

  // ✅ Social auth buttons
  appleButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    marginBottom: 4,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#dadce0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: { color: '#3c4043', fontWeight: '600', fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium' },
  smsButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    marginBottom: 4,
  },
  smsButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  // ✅ Divider between social and email login
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  authDividerText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
  },

  // ✅ Phone auth modal
  phoneAuthOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  phoneAuthContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
    paddingBottom: 40,
  },
  phoneAuthTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },

  // ✅ Apple/Google Pay buttons
  nativePayButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nativePayButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  nativePayDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  nativePayDividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  nativePayDividerText: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginHorizontal: 12 },
  nativePayNote: {
    backgroundColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  nativePayNoteText: { color: COLORS.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});