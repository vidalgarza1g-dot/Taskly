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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import Constants from 'expo-constants';
// expo-notifications: remote push was removed from Expo Go on Android (SDK 53+), and
// merely importing the module there logs a startup console error. Skip it in that
// case — every call site checks `Notifications` for null. Dev/production builds and
// iOS Expo Go load it normally.
const isExpoGo = Constants.appOwnership === 'expo';
const Notifications = isExpoGo && Platform.OS === 'android' ? null : require('expo-notifications');
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaProvider, SafeAreaView as SafeAreaViewSA, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import * as LocalAuthentication from 'expo-local-authentication';
import * as StoreReview from 'expo-store-review';
import * as Sentry from '@sentry/react-native';

// 🔥 Crash reporting — create a free project at sentry.io, then paste the DSN here
// (Project Settings → Client Keys). Leave empty to disable.
const SENTRY_DSN = '';
if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN, sendDefaultPii: false });
}

WebBrowser.maybeCompleteAuthSession();

// Show alerts/sounds even when app is foregrounded
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

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
const fmtInt = (n) => Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 });
// Worker estimate: "$1,000" for a single number, "$800–$1,500" for a range (commas, no decimals).
const fmtEstimate = (estMin, estMax) => {
  const lo = Number(estMin || 0);
  const hi = estMax != null && estMax !== '' ? Number(estMax) : null;
  if (hi != null && hi !== lo) return `$${fmtInt(lo)}–$${fmtInt(hi)}`;
  return `$${fmtInt(lo)}`;
};
// A card job where both sides confirmed completion (or payment was requested) but the
// client hasn't paid yet — i.e. the client still owes a payment.
const isPaymentPending = (job) =>
  job?.status === 'assigned' && job?.paymentMethod === 'card' &&
  ((job.clientConfirmed && job.workerConfirmed) || job.paymentRequested);

// Short price label for a job card / detail when there is no client budget anymore.
const jobPriceLabel = (job) => {
  if (job?.assignedPrice) return `$${fmtMXN(job.assignedPrice)}`;
  if (job?.budgetMin != null && job?.budgetMax != null) return `$${fmtInt(job.budgetMin)}-$${fmtInt(job.budgetMax)}`; // legacy
  return 'Por cotizar';
};
// Renders a MXN price ($1,000.00) with the cents in a slightly smaller font for cleaner display.
const PriceText = ({ value, style }) => {
  const [intPart, decPart] = fmtMXN(value).split('.');
  const baseSize = (StyleSheet.flatten(style) || {}).fontSize || 15;
  return (
    <Text style={style}>${intPart}<Text style={{ fontSize: Math.round(baseSize * 0.72) }}>.{decPart}</Text></Text>
  );
};

// ─── Notifications ────────────────────────────────────────────────────────────
// Compact relative timestamp for notification rows (e.g. "ahora", "5 min", "3 h", "2 d", "9 jun").
const relTime = (timestamp) => {
  if (!timestamp?.toDate) return '';
  try {
    const posted = timestamp.toDate();
    const diffMin = Math.floor((Date.now() - posted) / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD} d`;
    return posted.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  } catch { return ''; }
};

// Per-type icon, accent color and short bold title (iOS Mail-style heading).
const NOTIF_META = {
  new_bid:           { icon: 'chatbubble-ellipses-outline', color: COLORS.blue,   title: 'Nuevo estimado' },
  quote_received:    { icon: 'pricetag-outline',           color: COLORS.accent, title: 'Cotización recibida' },
  quote_accepted:    { icon: 'checkmark-circle-outline',    color: COLORS.green,  title: 'Cotización aceptada' },
  price_change_accepted: { icon: 'cash-outline',           color: COLORS.green,  title: 'Nuevo precio acordado' },
  bid_accepted:      { icon: 'checkmark-circle-outline',    color: COLORS.green,  title: 'Propuesta aceptada' },
  bid_declined:      { icon: 'close-circle-outline',        color: COLORS.muted,  title: 'Propuesta no elegida' },
  job_completed:     { icon: 'checkmark-done-outline',      color: COLORS.green,  title: 'Trabajo completado' },
  payment_confirmed: { icon: 'card-outline',               color: COLORS.green,  title: 'Pago confirmado' },
  payment_received:  { icon: 'cash-outline',               color: COLORS.green,  title: 'Pago recibido' },
  payment_requested: { icon: 'card-outline',               color: COLORS.accent, title: 'Pago pendiente' },
  location_shared:   { icon: 'location-outline',           color: COLORS.accent, title: 'Ubicación compartida' },
  review_received:   { icon: 'star-outline',               color: COLORS.yellow, title: 'Nueva reseña' },
  schedule_proposed: { icon: 'calendar-outline',           color: COLORS.blue,   title: 'Visita propuesta' },
  schedule_agreed:   { icon: 'calendar-outline',           color: COLORS.green,  title: 'Visita confirmada' },
  direct_proposal:   { icon: 'paper-plane-outline',        color: COLORS.purple, title: 'Trabajo directo' },
  worker_rejected:   { icon: 'alert-circle-outline',       color: COLORS.red,    title: 'Trabajo liberado' },
  job_invite:        { icon: 'paper-plane-outline',        color: COLORS.purple, title: 'Invitación' },
  account_verified:  { icon: 'shield-checkmark-outline',   color: COLORS.green,  title: 'Cuenta verificada' },
  account_rejected:  { icon: 'shield-outline',             color: COLORS.red,    title: 'Verificación rechazada' },
  business_approved: { icon: 'business-outline',           color: COLORS.green,  title: 'Empresa aprobada' },
  business_rejected: { icon: 'business-outline',           color: COLORS.red,    title: 'Empresa rechazada' },
  worker_on_way:     { icon: 'car-outline',                color: COLORS.blue,   title: 'En camino' },
  worker_arrived:    { icon: 'location-outline',           color: COLORS.accent, title: 'Trabajador llegó' },
  recurring_created: { icon: 'repeat-outline',             color: COLORS.blue,   title: 'Servicio programado' },
  payout_failed:     { icon: 'alert-circle-outline',       color: COLORS.red,    title: 'Depósito no completado' },
};
const getNotifMeta = (type) => NOTIF_META[type] || { icon: 'notifications-outline', color: COLORS.muted, title: 'Notificación' };

// Preview line shown under the title — concise, no leading emoji (the icon conveys the category).
const notifBody = (type, a, e = {}) => {
  const job = e.jobTitle || '';
  const amt = e.amount ? fmtMXN(e.amount) : '';
  switch (type) {
    case 'new_bid':           return `${a} estimó ${e.estimate || ''} en "${job}"`;
    case 'quote_received':    return `${a} te envió una cotización de $${amt} MXN en "${job}". Toca para revisarla.`;
    case 'quote_accepted':    return `${a} aceptó tu cotización de $${amt} MXN en "${job}".`;
    case 'price_change_accepted': return `Nuevo precio acordado en "${job}": $${amt} MXN.`;
    case 'bid_accepted':      return `${a} te asignó "${job}"`;
    case 'bid_declined':      return `${a} eligió a otro trabajador para "${job}"`;
    case 'job_completed':     return `${a} marcó "${job}" como completado. Toca para ver la reseña.`;
    case 'payment_confirmed': return `Pagaste $${amt} MXN en "${job}". ¡Gracias por usar Taskly!`;
    case 'payment_received':  return `Recibiste $${amt} MXN en "${job}". Llega en 1-2 días hábiles.`;
    case 'payment_requested': return `${a || 'El trabajador'} confirmó "${job}". Toca para pagar $${amt} MXN.`;
    case 'location_shared':   return `${a} compartió la ubicación de "${job}". Toca para ver el mapa.`;
    case 'review_received':   return `${a} te dejó ${e.rating || ''} estrellas: "${e.review || 'Sin comentario'}"`;
    case 'schedule_proposed': return `${a} propuso visita el ${e.date || ''} a las ${e.time || ''} en "${job}"`;
    case 'schedule_agreed':   return `${a} aceptó la visita el ${e.date || ''} a las ${e.time || ''}`;
    case 'direct_proposal':   return `${a} te propuso un trabajo directo: "${job}"`;
    case 'worker_rejected':   return `${a} no pudo atender "${job}". Puedes reasignarlo.`;
    case 'job_invite':        return `${a} te invitó a proponer en "${job}"`;
    case 'account_verified':  return 'Ahora apareces con el sello de cuenta verificada.';
    case 'account_rejected':  return 'No fue aprobada. Intenta con fotos más claras de tu INE.';
    case 'business_approved': return `"${job}" ya aparece en el directorio de empresas.`;
    case 'business_rejected': return `"${job}" no fue aprobada. Revisa que el comprobante sea legible.`;
    case 'worker_on_way':     return `${a} va en camino a "${job}".`;
    case 'worker_arrived':    return `${a} llegó al domicilio de "${job}".`;
    case 'recurring_created': return `Tu siguiente "${job}" se programó para el ${e.date || ''}. Toca para verlo.`;
    default:                  return `Tienes una nueva notificación de ${a}`;
  }
};

// Legacy rows stored only a single `message` with a leading emoji — strip it for the preview.
const stripLeadingEmoji = (s = '') => s.replace(/^[💬✅❌✓✔️💳💰📍⭐📅📩❗🏢🚗🔁]️?\s*/u, '');
const TASKLY_FEE_PCT = 0.025; // 2.5% platform cut via Stripe Connect application_fee_amount
const BACKEND_URL = "https://taskly-backend-production-20bc.up.railway.app";

// Every backend call goes through this so it carries the caller's Firebase ID token.
// The backend verifies the token (admin.auth().verifyIdToken) before acting on protected routes.
const authedFetch = async (url, options = {}) => {
  let token = null;
  try { token = await auth.currentUser?.getIdToken(); } catch {}
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

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
const GOOGLE_WEB_CLIENT_ID = "1084969190604-4u7e37vopmkdmur02lpf0upheids4kg0.apps.googleusercontent.com";
// iOS: Google Cloud Console → Credentials → iOS OAuth 2.0 client ID
const GOOGLE_IOS_CLIENT_ID = "1084969190604-78ng2ab7iqvj7iipltghhi94htqibpsh.apps.googleusercontent.com";
// Android: Google Cloud Console → Credentials → Android OAuth 2.0 client ID
const GOOGLE_ANDROID_CLIENT_ID = "YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com";
// Auto-flag: set to true only when real client IDs are in place
const GOOGLE_CONFIGURED = !GOOGLE_WEB_CLIENT_ID.startsWith('YOUR_');

// Helper Functions
// ✅ SPECIFIC notification messages with person name
const createNotification = async (userId, type, actorName = '', extra = {}) => {
  const title = getNotifMeta(type).title;
  const body = notifBody(type, actorName, extra);
  try {
    await addDoc(collection(db, 'notifications'), {
      userId, type, title, body,
      message: body, // kept for backward compatibility with older readers
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
          title: `Taskly · ${title}`,
          body,
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

// 🧹 30 days after a job is completed (payment sent) or cancelled, the job listing,
// its chats and all media (job photos + photos/videos shared in chat) are auto-deleted.
const JOB_DELETE_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

// Called at completion/cancellation: schedule the job + its chats for deletion in 30 days
// (kept until then so both parties can still reference the conversation and media).
const cleanupCompletedJobMedia = async (job) => {
  try {
    const when = Date.now() + JOB_DELETE_GRACE_MS;
    await updateDoc(doc(db, 'jobs', job.id), { deleteAtMs: when }).catch(() => {});
    const chatsSnap = await getDocs(query(collection(db, 'chats'), where('jobId', '==', job.id)));
    await Promise.all(chatsSnap.docs.map(c =>
      updateDoc(c.ref, { deleteAtMs: when }).catch(() => {})
    ));
  } catch (e) {
    console.warn('Job deletion scheduling failed:', e);
  }
};

// Deletes a chat, its messages, and any media those messages hold in Storage
const purgeChat = async (chatId) => {
  try {
    const msgsSnap = await getDocs(query(collection(db, 'messages'), where('chatId', '==', chatId)));
    // Remove media shared in the chat first
    await Promise.all(msgsSnap.docs.map(m => {
      const p = m.data().mediaPath;
      return p ? deleteObject(ref(storage, p)).catch(() => {}) : Promise.resolve();
    }));
    await Promise.all(msgsSnap.docs.map(m => deleteDoc(m.ref).catch(() => {})));
    await deleteDoc(doc(db, 'chats', chatId)).catch(() => {});
  } catch {}
};

// Deletes a job once its 30-day timer passes: job media, its chats (+ chat media), then the doc.
// Only the job owner (or admin) can delete the job per Firestore rules, so this is called
// from the client's own job listener.
const purgeJob = async (job) => {
  try {
    const urls = [
      ...(job.images || []).map(m => m.url).filter(Boolean),
      ...(job.imageUrl ? [job.imageUrl] : []),
    ];
    await Promise.all(urls.map(u => deleteObject(ref(storage, u)).catch(() => {})));
    const chatsSnap = await getDocs(query(collection(db, 'chats'), where('jobId', '==', job.id)));
    await Promise.all(chatsSnap.docs.map(c => purgeChat(c.id)));
    await deleteDoc(doc(db, 'jobs', job.id)).catch(() => {});
  } catch {}
};

// 🔔 Push Notifications Setup
const setupPushNotifications = async (userId) => {
  if (!Notifications) return; // Expo Go on Android — push unavailable
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
          <TouchableOpacity style={[styles.mediaAddBtn, { backgroundColor: C.card, borderColor: COLORS.accent + '66' }]} onPress={addMedia}>
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
function JobCard({ job, onPress, showMenu = false, onEdit, onDelete, showCreator = false, onChat, showClientRating = false, onLongPress }) {
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
    <TouchableOpacity
      onPress={() => onPress(job)}
      onLongPress={onLongPress ? () => onLongPress(job) : undefined}
      delayLongPress={300}
      style={[styles.jobCard, { backgroundColor: C.card, borderColor: C.border }]}
    >
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
        {job.assignedPrice
          ? <PriceText value={job.assignedPrice} style={styles.jobBudget} />
          : <Text style={styles.jobBudget}>{jobPriceLabel(job)}</Text>}
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
// Chats tab — list of all conversations for the current user
function ChatsTab({ user, onOpenChat }) {
  const C = useTheme();
  const [chats, setChats] = useState(null); // null = loading
  const [chatSearch, setChatSearch] = useState('');
  const [chatFilter, setChatFilter] = useState('all'); // all | active | completed
  const [collapsed, setCollapsed] = useState({}); // jobId -> true when folder is collapsed

  useEffect(() => {
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.id));
    return onSnapshot(q, async (snap) => {
      // Purge chats whose deletion timer expired
      const now = Date.now();
      const expired = snap.docs.filter(d => d.data().deleteAtMs && d.data().deleteAtMs <= now);
      expired.forEach(d => purgeChat(d.id));
      const liveDocs = snap.docs.filter(d => !d.data().deleteAtMs || d.data().deleteAtMs > now);

      const rows = await Promise.all(liveDocs.map(async (d) => {
        const c = { id: d.id, ...d.data() };
        const otherId = (c.participants || []).find(p => p !== user.id);
        let otherUser = null;
        let job = null;
        try {
          const [uSnap, jSnap] = await Promise.all([
            otherId ? getDoc(doc(db, 'users', otherId)) : Promise.resolve(null),
            c.jobId ? getDoc(doc(db, 'jobs', c.jobId)) : Promise.resolve(null),
          ]);
          if (uSnap?.exists()) otherUser = { id: uSnap.id, ...uSnap.data() };
          if (jSnap?.exists()) job = { id: jSnap.id, ...jSnap.data() };
        } catch {}
        return { ...c, otherId, otherUser, otherName: otherUser?.name || 'Usuario', job };
      }));
      const ts = c => c.updatedAt?.toMillis?.() ?? c.createdAt?.toMillis?.() ?? 0;
      setChats(rows.filter(r => r.job && r.otherUser).sort((a, b) => ts(b) - ts(a)));
    }, () => setChats([]));
  }, [user.id]);

  if (chats === null) {
    return <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 60 }} />;
  }

  const filtered = chats
    .filter(c => chatFilter === 'all'
      || (chatFilter === 'active' && c.job.status !== 'completed' && c.job.status !== 'cancelled')
      || (chatFilter === 'completed' && (c.job.status === 'completed' || c.job.status === 'cancelled')))
    .filter(c => !chatSearch
      || c.otherName.toLowerCase().includes(chatSearch.toLowerCase())
      || (c.job.title || '').toLowerCase().includes(chatSearch.toLowerCase()));

  // VS Code-explorer style: group chats by job. A chat is a "past proposal" when the
  // job was assigned to a different worker — it stays for reference but is read-only.
  const workerOf = (c) => (c.participants || []).find(p => p !== c.job.userId);
  const isPastChat = (c) => !!c.job.assignedTo && workerOf(c) !== c.job.assignedTo;
  const recentTs = (c) => c.updatedAt?.toMillis?.() ?? c.createdAt?.toMillis?.() ?? 0;

  const groupsMap = {};
  for (const c of filtered) {
    const jid = c.job.id;
    if (!groupsMap[jid]) groupsMap[jid] = { job: c.job, chats: [], ts: 0 };
    groupsMap[jid].chats.push(c);
    groupsMap[jid].ts = Math.max(groupsMap[jid].ts, recentTs(c));
  }
  const groups = Object.values(groupsMap).sort((a, b) => b.ts - a.ts);

  const renderChatRow = (item, past) => {
    const when = item.updatedAt?.toDate?.() ?? item.createdAt?.toDate?.();
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onOpenChat(item)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 8, marginLeft: 14, opacity: past ? 0.55 : 1 }}
      >
        {item.otherUser.profileImage
          ? <Image source={{ uri: item.otherUser.profileImage }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          : <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent + '22', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 16 }}>{item.otherName[0]?.toUpperCase() || '?'}</Text>
            </View>}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{item.otherName}</Text>
            {when && <Text style={{ color: C.muted, fontSize: 10 }}>{when.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</Text>}
          </View>
          {past ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Ionicons name="lock-closed-outline" size={11} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 12 }} numberOfLines={1}>Propuesta no seleccionada</Text>
            </View>
          ) : (
            <Text style={{ color: item.lastMessage ? C.muted : COLORS.accent, fontSize: 12, marginTop: 3 }} numberOfLines={1}>
              {item.lastMessage || 'Empieza la conversación →'}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.muted} />
      </TouchableOpacity>
    );
  };

  // Workers always have a single client per job, so they get a flat list (no folders).
  const isWorkerView = user.role === 'worker';
  const renderWorkerRow = (item) => {
    const past = isPastChat(item);
    const when = item.updatedAt?.toDate?.() ?? item.createdAt?.toDate?.();
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onOpenChat(item)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 10, opacity: past ? 0.6 : 1 }}
      >
        {item.otherUser.profileImage
          ? <Image source={{ uri: item.otherUser.profileImage }} style={{ width: 46, height: 46, borderRadius: 23 }} />
          : <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.accent + '22', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 18 }}>{item.otherName[0]?.toUpperCase() || '?'}</Text>
            </View>}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{item.otherName}</Text>
            {when && <Text style={{ color: C.muted, fontSize: 10 }}>{when.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</Text>}
          </View>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 1 }} numberOfLines={1}>{item.job.title}</Text>
          {past ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Ionicons name="lock-closed-outline" size={11} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 12 }} numberOfLines={1}>Propuesta no seleccionada</Text>
            </View>
          ) : (
            <Text style={{ color: item.lastMessage ? C.muted : COLORS.accent, fontSize: 12, marginTop: 3 }} numberOfLines={1}>
              {item.lastMessage || 'Empieza la conversación →'}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={[styles.searchBarWrap, { backgroundColor: C.card, borderColor: C.border }]}>
        <Ionicons name="search-outline" size={16} color={C.muted} style={{ marginRight: 6 }} />
        <TextInput
          style={[styles.searchBarInput, { color: C.text }]}
          value={chatSearch}
          onChangeText={setChatSearch}
          placeholder="Buscar por nombre o trabajo..."
          placeholderTextColor={C.muted}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {chatSearch.length > 0 && (
          <TouchableOpacity onPress={() => setChatSearch('')}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
        {[
          ['all', 'Todos'],
          ['active', 'En curso'],
          ['completed', 'Completados'],
        ].map(([k, label]) => (
          <TouchableOpacity
            key={k}
            style={[styles.filterChip, { backgroundColor: C.card, borderColor: C.border }, chatFilter === k && styles.filterChipActive]}
            onPress={() => setChatFilter(k)}
          >
            <Text style={[styles.filterChipText, { color: C.muted }, chatFilter === k && styles.filterChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={isWorkerView ? filtered : groups}
        keyExtractor={isWorkerView ? (c => c.id) : (g => g.job.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={C.muted} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyStateText, { color: C.muted }]}>
              {chats.length === 0 ? 'Aún no tienes conversaciones' : 'Sin resultados con este filtro'}
            </Text>
            {chats.length === 0 && (
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                {user.role === 'worker' ? 'Envía una propuesta para empezar a chatear.' : 'Los chats aparecen cuando un trabajador propone en tu trabajo.'}
              </Text>
            )}
          </View>
        }
        renderItem={isWorkerView ? ({ item }) => renderWorkerRow(item) : ({ item: group }) => {
          const active = group.chats.filter(c => !isPastChat(c)).sort((a, b) => recentTs(b) - recentTs(a));
          const past = group.chats.filter(c => isPastChat(c)).sort((a, b) => recentTs(b) - recentTs(a));
          const isCollapsed = !!collapsed[group.job.id];
          return (
            <View style={{ marginBottom: 14 }}>
              {/* Folder header — tap to expand/collapse */}
              <TouchableOpacity
                onPress={() => setCollapsed(prev => ({ ...prev, [group.job.id]: !prev[group.job.id] }))}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 4 }}
              >
                <Ionicons name={isCollapsed ? 'chevron-forward' : 'chevron-down'} size={16} color={C.muted} />
                <ServiceIcon type={group.job.type} size={28} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: '800', fontSize: 14 }} numberOfLines={1}>{group.job.title}</Text>
                  <Text style={{ color: C.muted, fontSize: 11 }}>
                    {active.length} {active.length === 1 ? 'activo' : 'activos'}{past.length > 0 ? ` · ${past.length} anterior${past.length === 1 ? '' : 'es'}` : ''}
                  </Text>
                </View>
                <StatusBadge status={group.job.status} />
              </TouchableOpacity>

              {!isCollapsed && (
                <View style={{ marginTop: 6 }}>
                  {active.length === 0 && past.length > 0 && (
                    <Text style={{ color: C.muted, fontSize: 12, marginLeft: 14, marginBottom: 8, fontStyle: 'italic' }}>Sin conversaciones activas</Text>
                  )}
                  {active.map(c => renderChatRow(c, false))}
                  {past.length > 0 && (
                    <>
                      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginLeft: 14, marginTop: 4, marginBottom: 6 }}>
                        Propuestas anteriores
                      </Text>
                      {past.map(c => renderChatRow(c, true))}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    </>
  );
}

// One-line preview of a message, used in reply quotes and the reply bar
const messagePreview = (m) => {
  if (!m) return '';
  if (m.type === 'image') return '📷 Foto';
  if (m.type === 'video') return '🎥 Video';
  if (m.type === 'quote_proposal') return '📋 Cotización';
  if (m.type === 'schedule_proposal') return '📅 Propuesta de horario';
  return m.text || '';
};

// Swipe a message bubble toward the center to reply (WhatsApp-style). Sent bubbles swipe
// right→left, received bubbles swipe left→right. Calls onReply past the threshold.
function SwipeableMessage({ children, onReply, fromMe }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);
  const onReplyRef = useRef(onReply); onReplyRef.current = onReply;
  const dir = fromMe ? -1 : 1; // -1 = swipe left (sent), +1 = swipe right (received)

  const pan = useRef(
    PanResponder.create({
      // Claim on any horizontal-dominant drag (proven thresholds from the notification swipe),
      // capturing it so it works on text, media, and either sender's bubbles.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => { triggered.current = false; },
      onPanResponderMove: (_, g) => {
        const mag = Math.max(0, Math.min(90, g.dx * dir)); // distance in the reply direction
        translateX.setValue(mag * dir);
        if (!triggered.current && mag >= 55) {
          triggered.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx * dir >= 55) onReplyRef.current?.();
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 6, speed: 18 }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const iconOpacity = translateX.interpolate(
    fromMe ? { inputRange: [-60, -20, 0], outputRange: [1, 0.25, 0], extrapolate: 'clamp' }
           : { inputRange: [0, 20, 60], outputRange: [0, 0.25, 1], extrapolate: 'clamp' }
  );
  const iconScale = translateX.interpolate(
    fromMe ? { inputRange: [-60, -30, 0], outputRange: [1, 0.7, 0.4], extrapolate: 'clamp' }
           : { inputRange: [0, 30, 60], outputRange: [0.4, 0.7, 1], extrapolate: 'clamp' }
  );

  return (
    <View>
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', [fromMe ? 'right' : 'left']: 14, top: 0, bottom: 0, justifyContent: 'center', opacity: iconOpacity, transform: [{ scale: iconScale }] }}
      >
        <Ionicons name="arrow-undo" size={20} color={COLORS.accent} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX }] }} {...pan.panHandlers}>
        {/* A touchable wrapper grabs the touch so the swipe negotiation works on every
            bubble (plain text included), exactly like a bubble that already has one. */}
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Help sheet explaining the chat actions to workers
function ChatHelpModal({ C, onClose }) {
  const rows = [
    { icon: 'pricetag-outline', color: COLORS.accent, title: 'Enviar cotización', desc: 'Envía tu precio final. El cliente lo acepta para contratarte (puedes ajustarlo después si es necesario).' },
    { icon: 'cash-outline', color: COLORS.green, title: 'Cambiar a efectivo', desc: 'Pide al cliente cobrar en efectivo en lugar de tarjeta. El cliente debe aceptarlo.' },
    { icon: 'calendar-outline', color: COLORS.blue, title: 'Proponer horario', desc: 'Agenda la fecha y hora de la visita. El cliente confirma.' },
    { icon: 'image-outline', color: COLORS.accent, title: 'Enviar foto o video', desc: 'Comparte imágenes o un video corto (máx. 30s) del trabajo. Se agregan al mensaje antes de enviar.' },
    { icon: 'car-outline', color: COLORS.blue, title: '🚗 En camino / 📍 He llegado', desc: 'Avisa tu estado al cliente el día del trabajo (aparece cuando estás asignado).' },
    { icon: 'arrow-undo', color: COLORS.purple, title: 'Responder un mensaje', desc: 'Desliza un mensaje hacia el centro para responderlo directamente.' },
  ];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.scheduleOverlay}>
        <View style={[styles.scheduleContent, { backgroundColor: C.card, maxHeight: '85%' }]}>
          <Text style={[styles.scheduleTitle, { color: C.text }]}>❓ Guía del chat</Text>
          <Text style={[styles.scheduleSubtitle, { color: C.muted }]}>Qué hace cada botón</Text>
          <ScrollView style={{ marginTop: 4 }}>
            {rows.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: C.border }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: r.color + '22', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name={r.icon} size={20} color={r.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>{r.title}</Text>
                  <Text style={{ color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 1 }}>{r.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.primaryButton, { marginTop: 12 }]} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ChatScreen({ chatId, otherUser, job, currentUser, onClose }) {
  const C = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [liveJob, setLiveJob] = useState(job);
  const [otherProfile, setOtherProfile] = useState(null);
  const [showOtherProfile, setShowOtherProfile] = useState(false);
  const [chatMeta, setChatMeta] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [viewerItem, setViewerItem] = useState(null); // media opened fullscreen
  const [replyingTo, setReplyingTo] = useState(null); // message being replied to
  const [showChatHelp, setShowChatHelp] = useState(false);
  const [pendingMedia, setPendingMedia] = useState(null); // { uri, type } staged before sending
  const [exactLoc, setExactLoc] = useState(null); // exact address from the private subcollection

  // Mark this chat read for the current user on open + when new messages arrive while viewing
  useEffect(() => {
    if (!chatId) return;
    updateDoc(doc(db, 'chats', chatId), { [`lastReadBy.${currentUser.id}`]: serverTimestamp() }).catch(() => {});
  }, [chatId, messages.length]);

  // Exact address lives in a private subcollection readable only by owner + assigned worker
  useEffect(() => {
    const canSee = liveJob?.locationShared && (liveJob.userId === currentUser.id || liveJob.assignedTo === currentUser.id);
    if (!canSee || !liveJob?.id) { setExactLoc(null); return; }
    return onSnapshot(
      doc(db, 'jobs', liveJob.id, 'private', 'location'),
      snap => setExactLoc(snap.exists() ? snap.data() : (liveJob.exactLocation || null)),
      () => setExactLoc(liveJob.exactLocation || null)
    );
  }, [liveJob?.id, liveJob?.locationShared, liveJob?.userId, liveJob?.assignedTo]);

  // Full profile of the other participant (for header avatar + profile view)
  useEffect(() => {
    if (!otherUser?.id) return;
    getDoc(doc(db, 'users', otherUser.id))
      .then(s => s.exists() && setOtherProfile({ id: s.id, ...s.data() }))
      .catch(() => {});
  }, [otherUser?.id]);

  // Chat doc (for the auto-deletion timer)
  useEffect(() => {
    if (!chatId) return;
    return onSnapshot(doc(db, 'chats', chatId), snap => {
      if (snap.exists()) setChatMeta(snap.data());
    });
  }, [chatId]);

  // Auto-show the chat guide the first time a worker opens the chat for each job listing
  useEffect(() => {
    if (currentUser.role !== 'worker' || !job?.id) return;
    const key = `chat_help_${job.id}`;
    AsyncStorage.getItem(key).then(v => {
      if (!v) { setShowChatHelp(true); AsyncStorage.setItem(key, '1').catch(() => {}); }
    }).catch(() => {});
  }, [job?.id]);

  const sendQuickStatus = async (kind) => {
    const text = kind === 'on_way' ? '🚗 Voy en camino a tu domicilio.' : '📍 He llegado al domicilio.';
    try {
      await addDoc(collection(db, 'messages'), {
        chatId, senderId: currentUser.id, senderName: currentUser.name,
        type: 'text', text, createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'chats', chatId), { lastMessage: text, updatedAt: serverTimestamp() });
      await createNotification(liveJob.userId, kind === 'on_way' ? 'worker_on_way' : 'worker_arrived', currentUser.name, {
        jobTitle: liveJob.title, jobId: liveJob.id,
      });
    } catch {}
  };

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
    const text = newMessage.trim();
    if (!text && !pendingMedia) return;
    const replyData = replyingTo
      ? { id: replyingTo.id, senderName: replyingTo.senderName, preview: messagePreview(replyingTo) }
      : null;

    setUploadingMedia(!!pendingMedia);
    try {
      if (pendingMedia) {
        // Upload the staged photo/video, then send it (optionally with a caption)
        const isVideo = pendingMedia.type === 'video';
        const ext = isVideo ? 'mp4' : 'jpg';
        const ct = isVideo ? 'video/mp4' : 'image/jpeg';
        const path = `jobs/${chatId}/chatmedia_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const url = await uploadImage(pendingMedia.uri, path, ct);
        await addDoc(collection(db, 'messages'), {
          chatId, senderId: currentUser.id, senderName: currentUser.name,
          type: isVideo ? 'video' : 'image', mediaUrl: url, mediaPath: path,
          ...(text ? { text } : {}),
          ...(replyData ? { replyTo: replyData } : {}),
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'chats', chatId), { lastMessage: isVideo ? '🎥 Video' : '📷 Foto', updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'messages'), {
          chatId, senderId: currentUser.id, senderName: currentUser.name,
          text,
          ...(replyData ? { replyTo: replyData } : {}),
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'chats', chatId), { lastMessage: text, updatedAt: serverTimestamp() });
      }
      setNewMessage('');
      setReplyingTo(null);
      setPendingMedia(null);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Pick a photo or short video (≤30s). Images are compressed; the result is staged in the
  // input (with an optional caption) instead of sending immediately.
  const pickAndSendMedia = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permiso requerido', 'Permite el acceso a tu galería para compartir fotos o videos.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.7,
        videoMaxDuration: MAX_VIDEO_SECONDS,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const isVideo = asset.type === 'video' || asset.mimeType?.startsWith('video');
      if (isVideo && asset.duration && asset.duration > MAX_VIDEO_MS) {
        Alert.alert('Video muy largo', `El video debe durar máximo ${MAX_VIDEO_SECONDS} segundos. Recórtalo e intenta de nuevo.`);
        return;
      }
      if (isVideo) {
        setPendingMedia({ uri: asset.uri, type: 'video' });
        return;
      }
      // Compress images: downscale wide photos to 1280px and re-encode at 60% JPEG
      let uri = asset.uri;
      try {
        const actions = asset.width && asset.width > 1280 ? [{ resize: { width: 1280 } }] : [];
        const out = await ImageManipulator.manipulateAsync(
          asset.uri,
          actions,
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        uri = out.uri;
      } catch {/* fall back to the original if manipulation fails */}
      setPendingMedia({ uri, type: 'image' });
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir la galería.');
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

  // Client accepts a worker's quote (the quote state lives on the message) → assigns the
  // worker the first time, or just updates the agreed price for a re-quote.
  const handleAcceptQuote = async (message) => {
    if (!message || message.status === 'accepted') return;
    const workerId = message.workerId || message.senderId;
    const workerName = message.workerName || message.senderName;
    const amount = message.amount;
    const wasOpen = liveJob.status === 'open';
    try {
      // Card jobs: the worker must be able to receive card payments
      if (liveJob.paymentMethod === 'card') {
        const wSnap = await getDoc(doc(db, 'users', workerId));
        if (!wSnap.exists() || !wSnap.data().stripeAccountId) {
          Alert.alert('Trabajador sin cuenta bancaria', `${workerName} aún no ha vinculado su CLABE en Taskly, por lo que no puede recibir pagos con tarjeta.\n\nPídele que configure su cuenta o acuerden pago en efectivo.`);
          return;
        }
      }
      // Mark the quote message accepted (participant may update a message's status)
      await updateDoc(doc(db, 'messages', message.id), { status: 'accepted' });

      const jobRef = doc(db, 'jobs', liveJob.id);
      if (wasOpen) {
        await updateDoc(jobRef, {
          status: 'assigned', assignedTo: workerId, assignedWorkerName: workerName,
          assignedPrice: amount,
        });
        // Notify the other estimators. Their chats are kept (read-only) as "past proposals".
        const otherBidders = (liveJob.bids || []).filter(b => b.userId !== workerId);
        for (const b of otherBidders) {
          await createNotification(b.userId, 'bid_declined', currentUser.name, { jobTitle: liveJob.title, jobId: liveJob.id });
        }
      } else {
        await updateDoc(jobRef, { assignedPrice: amount });
      }
      await addDoc(collection(db, 'messages'), {
        chatId, senderId: currentUser.id, senderName: currentUser.name,
        type: 'quote_accepted',
        text: `✅ ${currentUser.name} aceptó la cotización de $${fmtMXN(amount)} MXN`,
        createdAt: serverTimestamp(),
      });
      await createNotification(workerId, wasOpen ? 'quote_accepted' : 'price_change_accepted', currentUser.name, { amount, jobId: liveJob.id, jobTitle: liveJob.title });
    } catch { Alert.alert('Error', 'No se pudo aceptar la cotización'); }
  };

  const handleRejectQuote = async (message) => {
    if (!message || message.status !== 'pending') return;
    try {
      await updateDoc(doc(db, 'messages', message.id), { status: 'rejected' });
      await addDoc(collection(db, 'messages'), {
        chatId, senderId: currentUser.id, senderName: currentUser.name,
        type: 'text', text: '❌ No acepto esa cotización, ¿podemos ajustarla?',
        createdAt: serverTimestamp(),
      });
    } catch { Alert.alert('Error', 'No se pudo rechazar la cotización'); }
  };

  // A "past proposal": the job was assigned to a different worker, so this chat is read-only.
  const chatWorkerId = currentUser.id === liveJob?.userId ? otherUser?.id : currentUser.id;
  const isPastProposal = !!liveJob?.assignedTo && !!chatWorkerId && chatWorkerId !== liveJob.assignedTo;

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />

        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>← Cerrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            onPress={() => otherProfile && setShowOtherProfile(true)}
          >
            {otherProfile?.profileImage
              ? <Image source={{ uri: otherProfile.profileImage }} style={{ width: 34, height: 34, borderRadius: 17 }} />
              : <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accent + '22', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 14 }}>{otherUser.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>}
            <View style={{ alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.modalTitle, { color: C.text }]} numberOfLines={1}>{otherUser.name}</Text>
                <Ionicons name="chevron-forward" size={13} color={C.muted} />
              </View>
              <Text style={[styles.chatSubtitle, { color: C.muted }]} numberOfLines={1}>{job.title}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            {/* Request cash payment — only for workers on card jobs */}
            {currentUser.role === 'worker' && liveJob?.paymentMethod === 'card' && !isPastProposal && (
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Cambiar a pago en efectivo',
                  '¿Solicitar al cliente cambiar el método de pago a efectivo? Recibirás el pago en mano y no se procesará por tarjeta.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Solicitar', onPress: async () => {
                      try {
                        await addDoc(collection(db, 'messages'), {
                          chatId, senderId: currentUser.id, senderName: currentUser.name,
                          type: 'payment_change_request', status: 'pending',
                          text: 'Solicitud de cambio a efectivo',
                          createdAt: serverTimestamp(),
                        });
                      } catch { Alert.alert('Error', 'No se pudo enviar la solicitud'); }
                    }},
                  ]
                );
              }}>
                <Ionicons name="cash-outline" size={24} color={COLORS.muted} />
              </TouchableOpacity>
            )}
            {/* 📋 Send quotation — workers, before the job is paid/completed */}
            {currentUser.role === 'worker' && liveJob?.status !== 'completed' && !liveJob?.paymentRequested
              && (liveJob?.status === 'open' || liveJob?.assignedTo === currentUser.id) && (
              <TouchableOpacity onPress={() => setShowQuote(true)}>
                <Ionicons name="pricetag-outline" size={24} color={COLORS.muted} />
              </TouchableOpacity>
            )}
            {/* ✅ Schedule button in chat header (hidden on read-only past proposals) */}
            {!isPastProposal && (
              <TouchableOpacity onPress={() => setShowSchedule(true)}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ✅ Location bar shown inline in chat when shared */}
        {liveJob?.locationShared && exactLoc && (
          <View style={styles.chatLocationBar}>
            <Ionicons name="location" size={16} color={COLORS.accent} />
            <Text style={[styles.chatLocationText, { color: C.text }]} numberOfLines={1}>
              {exactLoc.address}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${exactLoc.lat},${exactLoc.lng}`)}>
              <Text style={styles.chatLocationLink}>Ver mapa →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 🗑 Auto-deletion countdown once the job is paid & completed */}
        {chatMeta?.deleteAtMs && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.red + '15', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.red + '33' }}>
            <Ionicons name="trash-outline" size={14} color={COLORS.red} />
            <Text style={{ color: COLORS.red, fontSize: 12, flex: 1 }}>
              Trabajo completado — este chat se eliminará automáticamente en {Math.max(1, Math.ceil((chatMeta.deleteAtMs - Date.now()) / 3600000))} horas.
            </Text>
          </View>
        )}

        {/* ✅ Agreed schedule banner */}
        {liveJob?.scheduledTime?.status === 'agreed' && (
          <TouchableOpacity style={styles.scheduledBanner}
            onPress={() => addToCalendar(job.title,
              liveJob.scheduledTime.date, liveJob.scheduledTime.time,
              exactLoc?.address || '')}>
            <Text style={styles.scheduledBannerText}>
              📅 {liveJob.scheduledTime.date} · {liveJob.scheduledTime.time}
            </Text>
            <Text style={styles.scheduledBannerLink}>+ Calendario</Text>
          </TouchableOpacity>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={messages}
            style={{ flex: 1 }}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.messagesList, { flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 10, marginBottom: 12 }}>
                <Ionicons name="time-outline" size={14} color={C.muted} />
                <Text style={{ color: C.muted, fontSize: 11, lineHeight: 15, flex: 1 }}>
                  Por privacidad, este chat, el trabajo y los archivos compartidos se eliminan automáticamente 30 días después de completarse el pago o de cancelarse el trabajo.
                </Text>
              </View>
            }
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
                  <View style={[styles.scheduleCard, { backgroundColor: C.card, borderColor: C.border }, isResolved && { opacity: 0.55 }]}>
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

              // Quotation card (worker → client). Accepting assigns the worker / updates the agreed price.
              if (item.type === 'quote_proposal') {
                const status = item.status || 'pending';
                const qWorkerId = item.workerId || item.senderId;
                const isAgreed = status === 'accepted';
                const isRejected = status === 'rejected';
                // Pending quote but the job already went to a different worker → no longer actionable
                const isStale = status === 'pending' && !!liveJob?.assignedTo && liveJob.assignedTo !== qWorkerId;
                const isRequote = liveJob?.status === 'assigned' && liveJob?.assignedTo === qWorkerId && !isAgreed;
                const canAct = !isMe && status === 'pending' && !isStale;
                return (
                  <View style={[styles.scheduleCard, { backgroundColor: C.card, borderColor: C.border }, (isRejected || isStale) && { opacity: 0.5 }]}>
                    <Text style={styles.scheduleCardTitle}>
                      {isAgreed ? '✅ Cotización aceptada'
                       : isRejected ? '❌ Cotización rechazada'
                       : isStale ? '📋 Cotización anterior'
                       : isRequote ? '📋 Nuevo precio propuesto'
                       : '📋 Cotización final'}
                    </Text>
                    <PriceText value={item.amount} style={[styles.scheduleCardTime, { color: C.text }]} />
                    {canAct && (
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <TouchableOpacity style={[styles.scheduleBtn, { flex: 1, backgroundColor: COLORS.green }]}
                          onPress={() => handleAcceptQuote(item)}>
                          <Text style={styles.scheduleBtnText}>✓ {isRequote ? 'Aceptar precio' : 'Aceptar y contratar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.scheduleBtn, { flex: 1, backgroundColor: COLORS.red }]}
                          onPress={() => handleRejectQuote(item)}>
                          <Text style={styles.scheduleBtnText}>✕ Rechazar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {isMe && status === 'pending' && !isStale && (
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
                  <View style={[styles.scheduleCard, { backgroundColor: C.card, borderColor: C.border }, isDeclined && { opacity: 0.45 }]}>
                    <Text style={styles.scheduleCardTitle}>
                      {isAgreed   ? '✅ Horario Confirmado'
                       : isDeclined ? '❌ Propuesta Rechazada'
                       : '📅 Propuesta de Horario'}
                    </Text>
                    <Text style={[styles.scheduleCardTime, { color: C.text }]}>
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
                          exactLoc?.address || '')}>
                        <Text style={styles.scheduleBtnText}>📅 Agregar a calendario</Text>
                      </TouchableOpacity>
                    )}
                    {isMe && !isAgreed && !isDeclined && (
                      <Text style={[styles.formHint, { marginTop: 8 }]}>⏳ Esperando respuesta...</Text>
                    )}
                  </View>
                );
              }

              // Photo / video message
              if ((item.type === 'image' || item.type === 'video') && item.mediaUrl) {
                return (
                  <SwipeableMessage fromMe={isMe} onReply={() => setReplyingTo(item)}>
                    <View style={[styles.messageBubble, isMe ? styles.myMessage : [styles.theirMessage, { backgroundColor: C.card, borderColor: C.border }], { padding: 4 }]}>
                      {!isMe && <Text style={[styles.messageSender, { color: C.muted, marginLeft: 4, marginTop: 2 }]}>{item.senderName}</Text>}
                      {item.replyTo && (
                        <View style={{ borderLeftWidth: 3, borderLeftColor: isMe ? 'rgba(255,255,255,0.7)' : COLORS.accent, paddingLeft: 8, paddingVertical: 2, marginHorizontal: 4, marginBottom: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: isMe ? 'rgba(255,255,255,0.95)' : COLORS.accent }} numberOfLines={1}>{item.replyTo.senderName}</Text>
                          <Text style={{ fontSize: 12, color: isMe ? 'rgba(255,255,255,0.85)' : C.muted }} numberOfLines={1}>{item.replyTo.preview}</Text>
                        </View>
                      )}
                      <TouchableOpacity activeOpacity={0.9} onPress={() => setViewerItem({ url: item.mediaUrl, type: item.type })}>
                        {item.type === 'image' ? (
                          <Image source={{ uri: item.mediaUrl }} style={{ width: 200, height: 200, borderRadius: 10 }} />
                        ) : (
                          <View style={{ width: 200, height: 200, borderRadius: 10, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="play-circle" size={52} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 11, marginTop: 4, fontWeight: '600' }}>Video</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      {!!item.text && (
                        <Text style={[styles.messageText, { color: C.text, marginLeft: 4, marginTop: 5 }, isMe && styles.myMessageText]}>{item.text}</Text>
                      )}
                      {item.createdAt && (
                        <Text style={[styles.messageTime, isMe && styles.myMessageTime, { marginLeft: 4 }]}>
                          {new Date(item.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                  </SwipeableMessage>
                );
              }

              return (
                <SwipeableMessage fromMe={isMe} onReply={() => setReplyingTo(item)}>
                  <View style={[styles.messageBubble, isMe ? styles.myMessage : [styles.theirMessage, { backgroundColor: C.card, borderColor: C.border }]]}>
                    {!isMe && <Text style={[styles.messageSender, { color: C.muted }]}>{item.senderName}</Text>}
                    {item.replyTo && (
                      <View style={{ borderLeftWidth: 3, borderLeftColor: isMe ? 'rgba(255,255,255,0.7)' : COLORS.accent, paddingLeft: 8, paddingVertical: 2, marginBottom: 5 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: isMe ? 'rgba(255,255,255,0.95)' : COLORS.accent }} numberOfLines={1}>{item.replyTo.senderName}</Text>
                        <Text style={{ fontSize: 12, color: isMe ? 'rgba(255,255,255,0.85)' : C.muted }} numberOfLines={1}>{item.replyTo.preview}</Text>
                      </View>
                    )}
                    <Text style={[styles.messageText, { color: C.text }, isMe && styles.myMessageText]}>
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
                </SwipeableMessage>
              );
            }}
          />

          {/* Quick status buttons — assigned worker on job day */}
          {currentUser.role === 'worker' && liveJob?.assignedTo === currentUser.id && liveJob?.status === 'assigned' && (
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg }}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 9, borderRadius: 10, backgroundColor: COLORS.blue + '22', borderWidth: 1, borderColor: COLORS.blue }}
                onPress={() => sendQuickStatus('on_way')}
              >
                <Text style={{ color: COLORS.blue, fontWeight: '700', fontSize: 13 }}>🚗 En camino</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 9, borderRadius: 10, backgroundColor: COLORS.green + '22', borderWidth: 1, borderColor: COLORS.green }}
                onPress={() => sendQuickStatus('arrived')}
              >
                <Text style={{ color: COLORS.green, fontWeight: '700', fontSize: 13 }}>📍 He llegado</Text>
              </TouchableOpacity>
            </View>
          )}

          {isPastProposal ? (
            <View style={[styles.messageInputContainer, { backgroundColor: C.bg, borderTopColor: C.border, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="lock-closed-outline" size={15} color={C.muted} style={{ marginRight: 6 }} />
              <Text style={{ color: C.muted, fontSize: 12, flexShrink: 1, textAlign: 'center' }}>
                Esta propuesta ya no está activa — el trabajo fue asignado a otro trabajador.
              </Text>
            </View>
          ) : (
            <>
            {replyingTo && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 12, marginTop: 8, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border }}>
                <Ionicons name="arrow-undo" size={16} color={COLORS.accent} />
                <View style={{ width: 3, alignSelf: 'stretch', backgroundColor: COLORS.accent, borderRadius: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 12, marginBottom: 1 }} numberOfLines={1}>Respondiendo a {replyingTo.senderName}</Text>
                  <Text style={{ color: C.muted, fontSize: 13 }} numberOfLines={1}>{messagePreview(replyingTo)}</Text>
                </View>
                <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={20} color={C.muted} />
                </TouchableOpacity>
              </View>
            )}
            {pendingMedia && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 12, marginTop: 8, marginBottom: 4, padding: 8, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border }}>
                {pendingMedia.type === 'image'
                  ? <Image source={{ uri: pendingMedia.uri }} style={{ width: 48, height: 48, borderRadius: 8 }} />
                  : <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Ionicons name="play" size={20} color="#fff" /></View>}
                <Text style={{ flex: 1, color: C.muted, fontSize: 13 }}>{pendingMedia.type === 'image' ? '📷 Foto lista — añade un comentario (opcional)' : '🎥 Video listo — añade un comentario (opcional)'}</Text>
                <TouchableOpacity onPress={() => setPendingMedia(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={22} color={C.muted} />
                </TouchableOpacity>
              </View>
            )}
            <View style={[styles.messageInputContainer, { backgroundColor: C.bg, borderTopColor: C.border }]}>
              <TouchableOpacity
                style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}
                onPress={pickAndSendMedia}
                disabled={uploadingMedia || !!pendingMedia}
              >
                <Ionicons name="image-outline" size={20} color={pendingMedia ? C.border : COLORS.accent} />
              </TouchableOpacity>
              <TextInput
                style={[styles.messageInput, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder={pendingMedia ? 'Añade un comentario...' : 'Escribe un mensaje...'}
                placeholderTextColor={C.muted}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!newMessage.trim() && !pendingMedia) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={(!newMessage.trim() && !pendingMedia) || uploadingMedia}
              >
                {uploadingMedia ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendButtonText}>→</Text>}
              </TouchableOpacity>
            </View>
            </>
          )}
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

        {showQuote && (
          <QuoteModal
            job={liveJob}
            currentUser={currentUser}
            otherUserId={otherUser.id}
            chatId={chatId}
            onClose={() => setShowQuote(false)}
          />
        )}

        {viewerItem && (
          <MediaViewerModal items={[viewerItem]} onClose={() => setViewerItem(null)} />
        )}

        {showChatHelp && <ChatHelpModal C={C} onClose={() => setShowChatHelp(false)} />}

        {/* Profile of the other participant, opened from the chat header */}
        {showOtherProfile && otherProfile && (
          otherProfile.role === 'worker'
            ? <WorkerProfileModal worker={otherProfile} currentUser={currentUser} onClose={() => setShowOtherProfile(false)} />
            : <ClientProfileModal client={otherProfile} onClose={() => setShowOtherProfile(false)} />
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
      // Happy moment → ask for an App Store / Play Store review (OS decides if/when to show it)
      if (rating === 5) {
        try {
          if (await StoreReview.isAvailableAsync()) await StoreReview.requestReview();
        } catch {}
      }
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
        : `<tr><td>Procesamiento Stripe (3.6% + $3 MXN)</td><td>Incluida</td></tr>`}
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
  const stripe      = calcStripeFees(total);
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
function PaymentTracker({ job, payoutStatus, isWorker, workerAccountId, clientName, workerName }) {
  const C = useTheme();
  const completedDate = (() => {
    const ref = job.completedAt || job.paymentInitiatedAt;
    if (!ref) return null;
    return (ref.toDate?.() ?? new Date(ref)).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

  // Per-job deposit status, traced through Stripe for THIS job's payment (real dates).
  const [jobPayout, setJobPayout] = useState(null);
  const perJobApplies = isWorker && job.paymentMethod === 'card' && !!workerAccountId && !!job.stripePaymentIntentId;
  useEffect(() => {
    if (!perJobApplies) return;
    let active = true;
    authedFetch(`${BACKEND_URL}/job-payout-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeAccountId: workerAccountId, paymentIntentId: job.stripePaymentIntentId, transferId: job.transferId || undefined }),
    })
      .then(r => r.json())
      .then(d => { if (active) setJobPayout(d && !d.error ? d : {}); })
      .catch(() => { if (active) setJobPayout({}); });
    return () => { active = false; };
  }, [job.id, workerAccountId, job.stripePaymentIntentId]);

  // Use ONLY this job's payout — never the account-level latest payout, which belongs to
  // a different job and produced the wrong dates (e.g. a jun-17 job showing a jun-14 deposit).
  const payout = jobPayout?.payout || null;
  const transferred = !!jobPayout?.transferred;        // money reached the worker's Stripe account
  const loadingPerJob = perJobApplies && jobPayout === null;
  const step3 = payout?.status === 'in_transit' || payout?.status === 'paid';  // payout en route to bank
  const step4 = payout?.status === 'paid';                                     // landed in the bank
  const arrivalDate = payout?.arrival_date
    ? new Date(payout.arrival_date * 1000).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const pendingMXN = payoutStatus?.pending ?? null;
  // Range from when funds become available (~7 days) to a couple business days later at the bank
  const availRange = (() => {
    if (!payoutStatus?.nextAvailableOn) return null;
    const start = new Date(payoutStatus.nextAvailableOn * 1000);
    const end = new Date((payoutStatus.nextAvailableOn + 3 * 86400) * 1000);
    const mS = start.toLocaleDateString('es-MX', { month: 'short' });
    const mE = end.toLocaleDateString('es-MX', { month: 'short' });
    return mS === mE ? `${start.getDate()}–${end.getDate()} ${mS}` : `${start.getDate()} ${mS} – ${end.getDate()} ${mE}`;
  })();

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
      sub: arrivalDate ? `Llega el ${arrivalDate}`
        : availRange ? `Llega aprox. ${availRange}`
        : loadingPerJob ? 'Verificando con Stripe…'
        : transferred ? 'Procesando — Stripe deposita en días hábiles'
        : 'Esperando ciclo de pago de Stripe',
      done: step3,
    },
    {
      icon: 'cash',
      label: 'Depositado en tu cuenta',
      sub: step4 ? (arrivalDate ? `Depositado el ${arrivalDate}` : 'Completado')
        : loadingPerJob ? 'Verificando…'
        : 'Pendiente',
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
        // Completed → green check; pending → a clearly-gray hollow circle
        const iconColor = s.done ? COLORS.green : C.muted;
        const iconName = s.done ? s.icon : 'ellipse-outline';
        return (
          <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', width: 22 }}>
              <Ionicons name={iconName} size={20} color={iconColor} />
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
            {availRange
              ? `Llega a tu banco aprox. ${availRange}.`
              : 'Stripe libera los fondos ~7 días hábiles después de cada pago (plazo estándar en México) y luego los deposita a tu banco.'}
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
const TASKLY_RATE        = 0.025; // Taskly's 2.5% commission (deducted from the worker)
const STRIPE_RATE        = 0.036; // Stripe Mexico: 3.6% of charge
const STRIPE_FIXED_FEE   = 3;     // Stripe Mexico: +$3 MXN flat per transaction
const STRIPE_IVA         = 0.16;  // Mexico adds 16% IVA on top of Stripe's processing fee

function calcStripeFees(jobAmount, tip = 0) {
  // Fee model (worker absorbs Taskly's cut; client covers only Stripe's processing):
  //   • Worker receives  = jobAmount − 2.5% (Taskly)  + 100% of any tip
  //   • Taskly keeps     = 2.5% of jobAmount  (out of the worker's payout)
  //   • Client pays      = jobAmount + tip + Stripe's processing fee (incl. 16% IVA)
  // Gross-up so the charge covers Stripe's % + fixed fee + IVA:
  const rateEff  = STRIPE_RATE * (1 + STRIPE_IVA);       // effective % incl. IVA
  const fixedEff = STRIPE_FIXED_FEE * (1 + STRIPE_IVA);  // effective fixed incl. IVA
  const base = jobAmount + tip;
  const clientTotal    = Math.ceil((base + fixedEff) / (1 - rateEff));
  const tasklyFee      = Math.round(jobAmount * TASKLY_RATE * 100) / 100;
  const workerReceives = Math.round((jobAmount - tasklyFee + tip) * 100) / 100;
  const processingFee  = Math.round((clientTotal - base) * 100) / 100; // what the client pays Stripe
  return { clientTotal, workerReceives, tasklyFee, processingFee };
}

function PaymentModal({ amount: jobAmount, description, onSuccess, onClose, workerId, clientEmail, jobId }) {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { confirmPlatformPayPayment } = usePlatformPay();
  const showPlatformPay = Platform.OS === 'ios' || Platform.OS === 'android';
  const [platformLoading, setPlatformLoading] = useState(false);
  const [cardLoading, setCardLoading]         = useState(false);
  const [tip, setTip] = useState(0);
  const anyLoading = platformLoading || cardLoading;
  const C = useTheme();

  // Tip is grossed-up with the job amount so the worker receives 100% of it
  const stripe = calcStripeFees(jobAmount, tip);

  const fetchSheetParams = async (grossAmount) => {
    let workerStripeAccountId = null;
    if (workerId) {
      try {
        const snap = await getDoc(doc(db, 'users', workerId));
        if (snap.exists()) workerStripeAccountId = snap.data().stripeAccountId || null;
      } catch {}
    }
    const res = await authedFetch(`${BACKEND_URL}/create-payment-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: grossAmount, workerAmount: stripe.workerReceives, currency: 'mxn', description, workerStripeAccountId, clientEmail, jobId }),
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
      onSuccess(data.paymentIntentClientSecret.split('_secret_')[0], tip);
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
        // Pre-fill the billing country as Mexico (was defaulting to the US)
        defaultBillingDetails: { address: { country: 'MX' } },
      });
      if (initError) throw new Error(initError.message);
      const { error } = await presentPaymentSheet();
      if (error) { if (error.code !== 'Canceled') throw new Error(error.message); return; }
      onSuccess(data.paymentIntentClientSecret.split('_secret_')[0], tip);
    } catch (e) {
      Alert.alert('Error de pago', e.message || 'No se pudo procesar el pago.');
    } finally {
      setCardLoading(false);
    }
  };

  const Row = ({ label, value, accent }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
      <Text style={{ color: C.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: accent ? COLORS.accent : C.text, fontSize: 13, fontWeight: accent ? '700' : '400' }}>{value}</Text>
    </View>
  );

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.paymentModalOverlay}>
        <View style={[styles.paymentModalContent, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ionicons name="lock-closed" size={16} color={COLORS.green} />
            <Text style={[styles.paymentTitle, { color: C.text }]}>Pago seguro</Text>
          </View>
          <Text style={[styles.paymentDescription, { color: C.muted }]}>{description}</Text>

          {/* Tip selector — 100% goes to the worker */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>PROPINA (100% para el trabajador)</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[0, 20, 50, 100].map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTip(t)}
                  disabled={anyLoading}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: tip === t ? COLORS.green : C.border, backgroundColor: tip === t ? COLORS.green + '22' : C.bg }}
                >
                  <Text style={{ color: tip === t ? COLORS.green : C.muted, fontWeight: '700', fontSize: 13 }}>
                    {t === 0 ? 'Sin propina' : `$${t}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fee breakdown card */}
          <View style={{ backgroundColor: C.bg, borderRadius: 12, padding: 14, marginTop: 10, marginBottom: 16, borderWidth: 1, borderColor: C.border }}>
            <Row label="Precio acordado" value={`$${jobAmount} MXN`} />
            {tip > 0 && <Row label="Propina (directa al trabajador)" value={`+ $${tip} MXN`} accent />}
            <Row label="Comisión de procesamiento (tarjeta)" value={`+ $${stripe.processingFee} MXN`} />
            <Text style={{ color: C.muted, fontSize: 11, marginTop: 4, lineHeight: 15 }}>
              Esta comisión la cobra Stripe (procesador de pagos) por los pagos con tarjeta. Taskly no te cobra comisión a ti.
            </Text>
            <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: '700' }}>Total a pagar</Text>
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

          <View style={[styles.paymentInfo, { backgroundColor: C.bg }]}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.green} />
            <Text style={[styles.paymentInfoText, { marginLeft: 6 }]}>
              Cifrado · Datos nunca almacenados en Taskly
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: C.border, marginTop: 10 }]}
            onPress={onClose}
            disabled={anyLoading}
          >
            <Text style={[styles.primaryButtonText, { color: C.text }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ✅ Workers inline list (not a modal, so taps work correctly)
function WorkersInlineList({ onSelectWorker, favoriteIds = [], onToggleFavorite, previousWorkerIds = [], searchQuery = '' }) {
  const C = useTheme();
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
                style={[styles.filterChip, { backgroundColor: C.card, borderColor: C.border }, active && styles.filterChipActive, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}
                onPress={() => setWorkerFilter(chip.key)}
              >
                <Ionicons name={active ? chip.iconActive : chip.icon} size={14} color={active ? COLORS.accent : C.muted} />
                <Text style={[styles.filterChipText, { color: C.muted }, active && styles.filterChipTextActive]}>{chip.label}</Text>
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

// 📋 Quote Modal — worker sends a final quotation (or a new price) the client must accept
function QuoteModal({ job, currentUser, otherUserId, chatId, onClose }) {
  const C = useTheme();
  const isRequote = job?.status === 'assigned';
  const [amount, setAmount] = useState(isRequote && job?.assignedPrice ? String(job.assignedPrice) : '');
  const [loading, setLoading] = useState(false);
  // Hint the worker with their own estimate, but they can quote any amount.
  const myBid = job?.bids?.find(b => b.userId === currentUser.id);
  const estimateHint = myBid ? `Tu estimado: ${fmtEstimate(myBid.estMin ?? myBid.price, myBid.estMax)}` : 'Ej. 1,200';

  const handleSend = async () => {
    const value = parseInt(amount);
    if (!value || value <= 0) { Alert.alert('Error', 'Ingresa un monto válido'); return; }
    setLoading(true);
    const label = `$${fmtMXN(value)} MXN`;
    try {
      // The quote lives entirely on the chat message (workers can create messages but
      // not write arbitrary job fields). Its status is tracked on the message itself.
      await addDoc(collection(db, 'messages'), {
        chatId, senderId: currentUser.id, senderName: currentUser.name,
        type: 'quote_proposal', amount: value,
        workerId: currentUser.id, workerName: currentUser.name,
        status: 'pending',
        text: `📋 Cotización: ${label}`,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'chats', chatId), { lastMessage: `📋 Cotización: ${label}`, updatedAt: serverTimestamp() });
      await createNotification(otherUserId, 'quote_received', currentUser.name, { amount: value, jobId: job.id, jobTitle: job.title });
      Alert.alert('✓ Enviada', 'Tu cotización fue enviada. El cliente debe aceptarla.');
      onClose();
    } catch { Alert.alert('Error', 'No se pudo enviar la cotización'); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Tap the dimmed backdrop to dismiss the keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.scheduleOverlay}>
            {/* Stop taps on the sheet itself from dismissing */}
            <TouchableWithoutFeedback onPress={() => {}} accessible={false}>
              <View style={[styles.scheduleContent, { backgroundColor: C.card }]}>
                <Text style={[styles.scheduleTitle, { color: C.text }]}>📋 {isRequote ? 'Actualizar precio' : 'Enviar cotización final'}</Text>
                <Text style={[styles.scheduleSubtitle, { color: C.muted }]}>{job.title}</Text>

                <Text style={[styles.formLabel, { marginTop: 8 }]}>MONTO (MXN)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={estimateHint}
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  autoFocus
                />

                <Text style={[styles.formHint, { marginTop: 4 }]}>
                  💡 El cliente debe aceptar este precio. {isRequote ? 'Podrás ajustarlo de nuevo si es necesario.' : 'Al aceptar, quedarás contratado para este trabajo.'}
                </Text>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  <TouchableOpacity style={[styles.primaryButton, { flex: 1, backgroundColor: COLORS.border }]} onPress={() => { Keyboard.dismiss(); onClose(); }}>
                    <Text style={styles.primaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryButton, { flex: 1 }, loading && { opacity: 0.6 }]}
                    onPress={handleSend} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{isRequote ? 'Enviar' : 'Cotizar'}</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Long-press quick actions for a job listing — actions adapt to status & ownership
function JobActionSheet({ job, user, onClose, onOpenDetails, onChat, onEdit, onDelete }) {
  const C = useTheme();
  // Short, subtle vibration as the menu appears
  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);
  if (!job) return null;
  const isOwner = job.userId === user.id;
  const isCompleted = job.status === 'completed';
  const isOpen = job.status === 'open';
  const canChat = job.status === 'assigned'
    || (isOwner && (job.bids?.length > 0))
    || (!isOwner && job.status !== 'completed');

  const actions = [{ icon: 'open-outline', label: 'Ver detalles', onPress: onOpenDetails }];
  if (!isCompleted && canChat && onChat) actions.push({ icon: 'chatbubbles-outline', label: 'Abrir chat', onPress: onChat });
  if (isOwner && isOpen && onEdit) actions.push({ icon: 'create-outline', label: 'Editar', onPress: onEdit });
  if (isOwner && onDelete) actions.push({ icon: 'trash-outline', label: isCompleted ? 'Eliminar registro' : 'Eliminar', danger: true, onPress: onDelete });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.actionSheetOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.actionSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[styles.actionSheetHandle, { backgroundColor: C.border }]} />
              <Text style={[styles.actionSheetTitle, { color: C.text }]} numberOfLines={1}>{job.title}</Text>
              <Text style={[styles.actionSheetSubtitle, { color: C.muted }]}>{jobPriceLabel(job)}</Text>
              {actions.map((a, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.actionSheetRow, { borderTopColor: C.border }]}
                  // Close first, then run the action so a follow-up modal opens cleanly
                  onPress={() => { onClose(); setTimeout(() => a.onPress(job), 130); }}
                >
                  <Ionicons name={a.icon} size={20} color={a.danger ? COLORS.red : C.text} />
                  <Text style={[styles.actionSheetRowText, { color: a.danger ? COLORS.red : C.text }]}>{a.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.actionSheetCancel, { borderColor: C.border }]} onPress={onClose}>
                <Text style={[styles.actionSheetCancelText, { color: C.muted }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  const C = useTheme();
  const [type, setType] = useState(editingJob?.type || '');
  const [title, setTitle] = useState(editingJob?.title || '');
  const [description, setDescription] = useState(editingJob?.description || '');
  const [location, setLocation] = useState(editingJob?.estimatedLocation?.area || '');
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
    if (!type || !title || !description || !location) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (!checkModeration(title) || !checkModeration(description)) {
      Alert.alert('Contenido no permitido', 'Por favor revisa el título y descripción. No se permite contenido inapropiado.');
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
        isPublic: true, // jobs are always visible to workers; worker drives the price
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
        Alert.alert('✓ Actualizado!', 'Tu problema fue actualizado');
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
        Alert.alert('✓ Publicado!', `Tu problema fue publicado${urgentText}${cashNote}`);
      }
      
      onClose();
    } catch (error) {
      console.error('Error posting/editing job:', error);
      Alert.alert('Error', 'No se pudo guardar el problema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />

        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>← Cancelar</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>{isEditing ? 'Editar problema' : 'Publicar problema'}</Text>
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

            {/* Title */}
            <Text style={styles.formLabel}>TÍTULO *</Text>
            <TextInput
              style={[styles.input, { borderColor: C.border, color: C.text }]}
              value={title}
              onChangeText={handleTitleChange}
              placeholder="Ej: Fuga de agua en baño"
              placeholderTextColor={C.muted}
            />
            {titleSuggestions.length > 0 && (
              <View style={[styles.suggestionsBox, { backgroundColor: C.card, borderColor: C.border }]}>
                {titleSuggestions.map((s, i) => (
                  <TouchableOpacity key={i} style={[styles.suggestionRow, { borderBottomColor: C.border }]} onPress={() => { setTitle(s); setTitleSuggestions([]); }}>
                    <Text style={[styles.suggestionText, { color: C.text }]}>🔍 {s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Description */}
            <Text style={styles.formLabel}>DESCRIPCIÓN *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { borderColor: C.border, color: C.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe el problema..."
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={4}
            />

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
                        borderColor: paymentMethod === opt.value ? COLORS.accent : C.border,
                        backgroundColor: paymentMethod === opt.value ? COLORS.accent + '15' : C.card,
                      }}
                      onPress={() => setPaymentMethod(opt.value)}
                    >
                      <Ionicons name={opt.icon} size={18} color={paymentMethod === opt.value ? COLORS.accent : C.muted} />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: paymentMethod === opt.value ? COLORS.accent : C.muted, flexShrink: 1 }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Stripe fee notice for card jobs */}
            {paymentMethod === 'card' && (
              <View style={{ backgroundColor: COLORS.accent + '12', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.accent + '30' }}>
                <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: '700', marginBottom: 2 }}>💳 Nota sobre pagos con tarjeta</Text>
                <Text style={{ color: C.muted, fontSize: 12, lineHeight: 17 }}>
                  Stripe cobra {(STRIPE_RATE * 100).toFixed(1)}% + ${STRIPE_FIXED_FEE} MXN fijos por transacción al cliente. Taskly cobra {(TASKLY_RATE * 100).toFixed(1)}% al trabajador. Ambos ven el desglose exacto antes de confirmar.
                </Text>
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
                    { backgroundColor: C.card, borderColor: C.border },
                    type === service.id && {
                      backgroundColor: service.color + '22',
                      borderColor: service.color
                    }
                  ]}
                  onPress={() => setType(service.id)}
                >
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={service.icon} size={28} color={type === service.id ? service.color : C.muted} />
                  </View>
                  <Text
                    style={[styles.serviceButtonText, { color: C.text }, type === service.id && { color: service.color }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {service.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
                        style={[styles.savedLocChip, { backgroundColor: C.card, borderColor: C.border }, location === sl.area && styles.savedLocChipActive]}>
                        <Ionicons name="location-outline" size={14} color={location === sl.area ? COLORS.accent : C.muted} />
                        <Text style={[styles.savedLocLabel, { color: C.text }, location === sl.area && { color: COLORS.accent }]}>{sl.label}</Text>
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
                    { backgroundColor: C.card, borderColor: C.border },
                    location === loc.name && styles.locationButtonActive
                  ]}
                  onPress={() => setLocation(loc.name)}
                >
                  <Text style={[
                    styles.locationButtonText,
                    { color: C.muted },
                    location === loc.name && styles.locationButtonTextActive
                  ]}>
                    {loc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Estimate notice — price is set by the worker, then finalized in chat */}
            <View style={[styles.infoBox, { borderColor: COLORS.accent + '44', backgroundColor: COLORS.accent + '0E' }]}>
              <Text style={[styles.infoText, { color: C.text }]}>
                💬 No necesitas fijar un precio. Los trabajadores te darán un estimado y podrás acordar la cotización final por chat.
              </Text>
            </View>

            {/* Preferred date */}
            <Text style={styles.formLabel}>FECHA PREFERIDA (OPCIONAL)</Text>
            <TouchableOpacity
              style={[styles.input, { borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => {
                setTempDate(preferredDate || new Date());
                setShowDatePicker(true);
              }}
            >
              <Text style={{ color: preferredDate ? C.text : C.muted, fontSize: 14 }}>
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
                  {isEditing ? 'Guardar cambios' : 'Publicar problema'} →
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
function JobDetailModal({ job: initialJob, user, onClose, onRefresh, onViewWorkerProfile, onViewClientProfile }) {
  const C = useTheme();
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [assignedProfile, setAssignedProfile] = useState(null);
  const [estMin, setEstMin] = useState('');
  const [estMax, setEstMax] = useState('');
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
  const [editingBidPrice, setEditingBidPrice] = useState(false);
  const [newBidPrice, setNewBidPrice] = useState(''); // estimate min
  const [newBidMax, setNewBidMax] = useState('');     // estimate max (optional)
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);

  const [job, setJob] = useState(initialJob);
  const [showRebook, setShowRebook] = useState(false);
  const [detailRefreshing, setDetailRefreshing] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [mediaViewerIdx, setMediaViewerIdx] = useState(null); // null = closed, number = open at index
  const [exactLoc, setExactLoc] = useState(null); // exact address from the private subcollection

  // Only the owner and the assigned worker may read the exact address (private subcollection)
  useEffect(() => {
    const canSee = job?.locationShared && (job.userId === user.id || job.assignedTo === user.id);
    if (!canSee || !job?.id) { setExactLoc(null); return; }
    return onSnapshot(
      doc(db, 'jobs', job.id, 'private', 'location'),
      snap => setExactLoc(snap.exists() ? snap.data() : (job.exactLocation || null)), // fallback for legacy jobs
      () => setExactLoc(job.exactLocation || null)
    );
  }, [job?.id, job?.locationShared, job?.userId, job?.assignedTo]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'jobs', initialJob.id), snap => {
      if (snap.exists()) setJob({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [initialJob.id]);

  // Profile photos for the client (creator) and assigned worker
  useEffect(() => {
    if (job.userId) {
      getDoc(doc(db, 'users', job.userId)).then(s => s.exists() && setCreatorProfile({ id: s.id, ...s.data() })).catch(() => {});
    }
  }, [job.userId]);
  useEffect(() => {
    if (job.assignedTo) {
      getDoc(doc(db, 'users', job.assignedTo)).then(s => s.exists() && setAssignedProfile({ id: s.id, ...s.data() })).catch(() => {});
    } else {
      setAssignedProfile(null);
    }
  }, [job.assignedTo]);

  const paymentTotal = (job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0);

  // Auto-show the payment sheet to the client whenever payment is pending — on every open
  // of the job (fresh mount) and the moment it becomes due. Cancelling won't re-pop it
  // within the same view, but reopening the job will.
  const paymentDue = isPaymentPending(job) && user.id === job.userId;
  useEffect(() => {
    if (paymentDue && !showPayment) setShowPayment(true);
  }, [paymentDue]);

  // Fetch real Stripe payout status when a card job is completed
  useEffect(() => {
    if (job.status === 'completed' && job.paymentMethod === 'card' && user.stripeAccountId) {
      authedFetch(`${BACKEND_URL}/worker-payout-status/${user.stripeAccountId}`)
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
    const cutoffDays = 30;
    const daysSince = (Date.now() - completedDate.getTime()) / 86400000;
    if (daysSince >= cutoffDays) {
      const paths = (job.images || []).map(i => i.path).filter(Boolean);
      Promise.all(paths.map(p => deleteObject(ref(storage, p)).catch(() => {})))
        .then(() => updateDoc(doc(db, 'jobs', job.id), { images: [], imageUrl: null, imagesDeleted: true }))
        .catch(() => {});
    }
  }, [job.id, job.status, job.completedAt, job.paymentInitiatedAt, job.imagesDeleted]);

  const finalizeCompletion = async (stripePaymentIntentId, tipAmount = 0) => {
    const tip        = tipAmount || 0;
    const total      = (job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0) + tip;
    // Commission applies to the job amount only — the worker keeps 100% of the tip
    const commission = Math.round((total - tip) * 0.025 * 100) / 100;
    const stripe     = calcStripeFees((job.assignedPrice || 0) + (job.isUrgent ? URGENT_JOB_PRICE : 0), tip);
    try {
      // Set pending_payment while Stripe processes
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'pending_payment',
        paymentInitiatedAt: serverTimestamp(),
        paymentRequested: false,
        ...(tip > 0 ? { tipAmount: tip } : {}),
        ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
      });
      setShowPayment(false);

      // Fetch worker profile for name + email + stripe status
      let workerName = '';
      let workerEmail = '';
      let workerHasStripe = false;
      if (job.assignedTo) {
        try {
          const workerSnap = await getDoc(doc(db, 'users', job.assignedTo));
          if (workerSnap.exists()) {
            workerName      = workerSnap.data().name  || '';
            workerEmail     = workerSnap.data().email || '';
            workerHasStripe = !!workerSnap.data().stripeAccountId;
          }
        } catch {}
      }

      // If worker has no Stripe account, flag the job for deferred transfer
      if (stripePaymentIntentId && !workerHasStripe) {
        await updateDoc(doc(db, 'jobs', job.id), {
          pendingTransfer: true,
          workerPortion: Math.round((total - commission) * 100) / 100,
        });
      }

      // Send email receipts to both parties (non-blocking)
      authedFetch(`${BACKEND_URL}/send-payment-emails`, {
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
      // Paid & completed → free server space (media + chat), non-blocking
      cleanupCompletedJobMedia(job);
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
    const min = parseInt(estMin);
    const max = estMax ? parseInt(estMax) : null;
    if (!min || min <= 0) {
      Alert.alert('Error', 'Ingresa un estimado (mínimo). El máximo es opcional.');
      return;
    }
    if (max != null && max < min) {
      Alert.alert('Error', 'El máximo debe ser mayor o igual que el mínimo.');
      return;
    }
    const estimateLabel = fmtEstimate(min, max);
    setLoading(true);
    try {
      const jobRef = doc(db, 'jobs', job.id);
      const newBid = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        estMin: min,
        estMax: max,
        price: min, // legacy fallback for older readers
        message: bidMessage || `Mi estimado para este trabajo es ${estimateLabel} MXN`,
        createdAt: new Date(),
        status: 'pending',
        hasStripeAccount: !!user.stripeAccountId,
      };

      await updateDoc(jobRef, {
        bids: arrayUnion(newBid)
      });

      await createNotification(
        job.userId,
        'new_bid',
        user.name,
        { estimate: `${estimateLabel} MXN`, jobTitle: job.title, jobId: job.id }
      );

      Alert.alert('✓ Enviado!', 'Tu estimado fue enviado. Puedes acordar la cotización final por chat.');
      onClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error submitting estimate:', error);
      Alert.alert('Error', 'No se pudo enviar el estimado');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationConfirm = async (locationData) => {
    try {
      const jobRef = doc(db, 'jobs', job.id);
      // Exact address goes in a private subcollection readable only by the owner + assigned
      // worker; the main job doc only carries the (non-sensitive) locationShared flag.
      await setDoc(doc(db, 'jobs', job.id, 'private', 'location'), locationData);
      await updateDoc(jobRef, { locationShared: true });

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
      '¿Confirmas que el trabajo fue realizado satisfactoriamente?\n\n💡 Por tu seguridad, confirma y realiza el pago con el trabajador presente, en el sitio del trabajo.',
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
                  // Mark payment as due so the button shows "Pagar ahora" and the payment
                  // sheet re-opens every time the client returns (until it's paid).
                  await updateDoc(jobRef, { paymentRequested: true });
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
                deleteAtMs: Date.now() + JOB_DELETE_GRACE_MS,
              });
              // Schedule chats for the same 30-day deletion
              try {
                const chatsSnap = await getDocs(query(collection(db, 'chats'), where('jobId', '==', job.id)));
                await Promise.all(chatsSnap.docs.map(c => updateDoc(c.ref, { deleteAtMs: Date.now() + JOB_DELETE_GRACE_MS }).catch(() => {})));
              } catch {}
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
      '¿Confirmas que el trabajo fue completado? El cliente deberá confirmar antes de liberar el pago.\n\n💡 Por tu seguridad, pide que el pago se realice en el sitio, con el cliente presente, antes de retirarte.',
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
                    const canSeeExact = isMyJob || job.assignedTo === user.id;
                    if (canSeeExact && job.locationShared && exactLoc) {
                      setShowMap(true);
                    }
                  }}
                >
                  <Text style={styles.jobDetailLocation}>
                    {(() => {
                      const canSeeExact = isMyJob || job.assignedTo === user.id;
                      return '📍 ' + (canSeeExact && job.locationShared && exactLoc
                        ? exactLoc.address
                        : job.estimatedLocation?.area || job.location);
                    })()}
                  </Text>
                </TouchableOpacity>
                {job.userName && (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}
                    onPress={() => creatorProfile && onViewClientProfile?.(creatorProfile)}
                  >
                    {creatorProfile?.profileImage
                      ? <Image source={{ uri: creatorProfile.profileImage }} style={{ width: 20, height: 20, borderRadius: 10 }} />
                      : <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.accent + '22', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 10 }}>{job.userName[0]?.toUpperCase()}</Text>
                        </View>}
                    <Text style={styles.jobDetailCreator}>Por: {job.userName}</Text>
                    {isWorker && job.clientRating > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Ionicons name="star" size={10} color={COLORS.yellow} />
                        <Text style={styles.clientRatingText}>{job.clientRating.toFixed(1)}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={{ marginBottom: 14 }}>
              <StatusBadge status={job.status} />
            </View>

            {/* 🛡 Garantía Taskly — shown to the client while money is in play */}
            {isMyJob && job.paymentMethod !== 'cash' && (job.status === 'assigned' || job.status === 'pending_payment') && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.green + '12', borderWidth: 1, borderColor: COLORS.green + '44', borderRadius: 12, padding: 12, marginBottom: 14 }}>
                <Ionicons name="shield-checkmark" size={22} color={COLORS.green} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.green, fontWeight: '800', fontSize: 13 }}>Garantía Taskly</Text>
                  <Text style={{ color: C.muted, fontSize: 11, lineHeight: 15 }}>
                    Tu pago queda protegido en la plataforma. Si algo sale mal, abre una disputa dentro de las 72 horas y te ayudamos a resolverlo.
                  </Text>
                </View>
              </View>
            )}

            {/* 🔄 Volver a contratar — rebook the same worker in one tap */}
            {isMyJob && job.status === 'completed' && assignedProfile && (
              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent + '18', borderWidth: 1, borderColor: COLORS.accent, borderRadius: 12, padding: 12, marginBottom: 14 }}
                onPress={() => setShowRebook(true)}
              >
                {assignedProfile.profileImage
                  ? <Image source={{ uri: assignedProfile.profileImage }} style={{ width: 22, height: 22, borderRadius: 11 }} />
                  : <Ionicons name="refresh-circle" size={22} color={COLORS.accent} />}
                <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 14 }}>
                  Volver a contratar a {job.assignedWorkerName}
                </Text>
              </TouchableOpacity>
            )}

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
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}
                  onPress={() => onViewWorkerProfile?.(job.assignedTo)}
                >
                  {assignedProfile?.profileImage
                    ? <Image source={{ uri: assignedProfile.profileImage }} style={{ width: 26, height: 26, borderRadius: 13 }} />
                    : <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.accent + '33', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 12 }}>{job.assignedWorkerName[0]?.toUpperCase()}</Text>
                      </View>}
                  <Text style={[styles.assignedText, { marginBottom: 0, textDecorationLine: 'underline' }]}>
                    Asignado a: {job.assignedWorkerName}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.assignedPrice}>
                  Precio acordado: <PriceText value={job.assignedPrice} style={styles.assignedPrice} />
                </Text>

                {canManage && !job.locationShared && (
                  <TouchableOpacity
                    style={styles.shareLocationButton}
                    onPress={() => setShowLocationPicker(true)}
                  >
                    <Text style={styles.shareLocationText}>📍 Compartir ubicación exacta</Text>
                  </TouchableOpacity>
                )}

                {(isMyJob || job.assignedTo === user.id) && job.locationShared && exactLoc && (
                  <View style={[styles.inlineMapBox, { backgroundColor: C.bg }]}>
                    <Text style={[styles.inlineMapAddress, { color: C.text }]}>📍 {exactLoc.address}</Text>
                    <MapView
                      style={styles.inlineMapView}
                      initialRegion={{
                        latitude: exactLoc.lat,
                        longitude: exactLoc.lng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                    >
                      <Marker
                        coordinate={{ latitude: exactLoc.lat, longitude: exactLoc.lng }}
                      />
                    </MapView>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <TouchableOpacity style={[styles.mapActionBtn, { flex: 1 }]} onPress={() => {
                        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${exactLoc.lat},${exactLoc.lng}`);
                      }}>
                        <Text style={styles.mapActionBtnText}>🌐 Google Maps</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.mapActionBtn, { flex: 1, backgroundColor: COLORS.blue }]} onPress={() => {
                        const url = Platform.OS === 'ios'
                          ? `maps:0,0?q=${exactLoc.lat},${exactLoc.lng}`
                          : `geo:0,0?q=${exactLoc.lat},${exactLoc.lng}`;
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
                  workerAccountId={user.stripeAccountId}
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
                <Text style={[styles.infoLabel, { color: C.muted }]}>PRECIO</Text>
                {job.assignedPrice
                  ? <PriceText value={job.assignedPrice} style={[styles.infoValue, { color: C.text }]} />
                  : <Text style={[styles.infoValue, { color: C.text }]}>{jobPriceLabel(job)}</Text>}
              </View>
              <View style={[styles.infoItem, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[styles.infoLabel, { color: C.muted }]}>ESTIMADOS</Text>
                <Text style={[styles.infoValue, { color: C.text }]}>{job.bids?.length || 0}</Text>
              </View>
            </View>

            {job.bids && job.bids.length > 0 && canManage && (
              <View style={[styles.bidsSection, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[styles.sectionTitle, { color: C.text }]}>Estimados recibidos</Text>
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
                        <Text style={[styles.bidPrice, { textDecorationLine: isRejected ? 'line-through' : 'none', color: isRejected ? C.muted : COLORS.accent }]}>
                          {fmtEstimate(bid.estMin ?? bid.price, bid.estMax)}
                        </Text>
                      </View>
                      <Text style={[styles.bidMessage, { color: C.muted }]}>{bid.message}</Text>

                      {job.status === 'open' && (
                        <View style={{ marginTop: 8 }}>
                          <TouchableOpacity
                            style={[styles.chatButtonInline]}
                            onPress={() => openChat(bid.userId)}
                          >
                            <Text style={styles.chatButtonText}>💬 Chatear para acordar cotización</Text>
                          </TouchableOpacity>
                          {job.paymentMethod === 'card' && !bid.hasStripeAccount && (
                            <Text style={{ color: C.muted, fontSize: 11, marginTop: 6, textAlign: 'center' }}>
                              ⚠️ Este trabajador aún no tiene cuenta bancaria para cobros con tarjeta.
                            </Text>
                          )}
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
                <Text style={[styles.sectionTitle, { color: C.text }]}>Dar un estimado</Text>
                <Text style={[styles.formHint, { marginTop: -4 }]}>
                  Da un estimado aproximado. La cotización final la acuerdas con el cliente por chat.
                </Text>

                <Text style={[styles.formLabel, { color: C.muted }]}>ESTIMADO (MXN)</Text>
                <View style={styles.budgetRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.budgetLabel}>Mínimo *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                      value={estMin}
                      onChangeText={setEstMin}
                      placeholder="800"
                      placeholderTextColor={C.muted}
                      keyboardType="numeric"
                    />
                  </View>
                  <Text style={styles.budgetSeparator}>-</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.budgetLabel}>Máximo (opcional)</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                      value={estMax}
                      onChangeText={setEstMax}
                      placeholder="1,500"
                      placeholderTextColor={C.muted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

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
                    <Text style={styles.primaryButtonText}>Enviar estimado →</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {canManage && job.status === 'assigned' && (
              <>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: COLORS.yellow + '14', borderWidth: 1, borderColor: COLORS.yellow + '40', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.yellow} style={{ marginTop: 1 }} />
                  <Text style={{ color: C.muted, fontSize: 11, lineHeight: 15, flex: 1 }}>
                    Por seguridad, confirma y realiza el pago <Text style={{ fontWeight: '800', color: C.text }}>en el sitio, con el trabajador presente</Text>. Evita confirmar a distancia.
                  </Text>
                </View>
                {job.paymentMethod === 'card' && job.assignedPrice && (
                  <View style={{ padding: 12, backgroundColor: COLORS.accent + '15', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.accent + '40' }}>
                    <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 13, textAlign: 'center' }}>
                      Total al completar: ${paymentTotal} MXN
                      {job.isUrgent ? ` (incluye $${URGENT_JOB_PRICE} urgente)` : ''}
                    </Text>
                  </View>
                )}
                {isPaymentPending(job) ? (
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: COLORS.green, borderColor: COLORS.green }]}
                    onPress={handleOpenPayment}
                  >
                    <Text style={[styles.completeButtonText, { color: '#fff' }]}>💳 Pagar ahora</Text>
                  </TouchableOpacity>
                ) : job.clientConfirmed ? (
                  <View style={[styles.completeButton, { backgroundColor: COLORS.green + '15', borderColor: COLORS.green }]}>
                    <Text style={[styles.completeButtonText, { color: COLORS.green }]}>✓ Confirmado — esperando al trabajador</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.completeButton, job.workerConfirmed && { backgroundColor: COLORS.green, borderColor: COLORS.green }]} onPress={handleMarkComplete}>
                    {job.workerConfirmed && <Text style={{ color: '#fff', fontSize: 11, textAlign: 'center', marginBottom: 2, opacity: 0.85 }}>El trabajador ya confirmó su parte</Text>}
                    <Text style={[styles.completeButtonText, job.workerConfirmed && { color: '#fff' }]}>
                      {job.workerConfirmed ? '✓ Confirmar y proceder al pago' : '✓ Confirmar trabajo completado'}
                    </Text>
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
              <View style={[styles.alreadyBidBox, { padding: 14 }]}>
                {editingBidPrice ? (
                  <View style={{ gap: 8 }}>
                    <Text style={[styles.alreadyBidText, { marginBottom: 4 }]}>Actualizar estimado</Text>
                    <View style={styles.budgetRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.budgetLabel}>Mínimo *</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border, marginBottom: 0 }]}
                          value={newBidPrice}
                          onChangeText={setNewBidPrice}
                          placeholder="800"
                          placeholderTextColor={C.muted}
                          keyboardType="numeric"
                          autoFocus
                        />
                      </View>
                      <Text style={styles.budgetSeparator}>-</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.budgetLabel}>Máximo (opcional)</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border, marginBottom: 0 }]}
                          value={newBidMax}
                          onChangeText={setNewBidMax}
                          placeholder="1,500"
                          placeholderTextColor={C.muted}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: C.border, borderRadius: 8, padding: 10, alignItems: 'center' }}
                        onPress={() => { setEditingBidPrice(false); setNewBidPrice(''); setNewBidMax(''); }}
                      >
                        <Text style={{ color: C.muted, fontWeight: '600', fontSize: 13 }}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 2, backgroundColor: COLORS.accent, borderRadius: 8, padding: 10, alignItems: 'center' }}
                        onPress={async () => {
                          const min = parseInt(newBidPrice);
                          const max = newBidMax ? parseInt(newBidMax) : null;
                          if (!min || min <= 0) { Alert.alert('Error', 'Ingresa un estimado válido'); return; }
                          if (max != null && max < min) { Alert.alert('Error', 'El máximo debe ser mayor o igual que el mínimo'); return; }
                          const label = fmtEstimate(min, max);
                          try {
                            const jobRef = doc(db, 'jobs', job.id);
                            const snap = await getDoc(jobRef);
                            const updatedBids = (snap.data().bids || []).map(b =>
                              b.userId === user.id ? { ...b, estMin: min, estMax: max, price: min } : b
                            );
                            await updateDoc(jobRef, { bids: updatedBids });
                            // Send estimate-update system message to chat with job owner
                            const chatIdForMsg = await getOrCreateChat(user.id, job.userId, job.id);
                            await addDoc(collection(db, 'messages'), {
                              chatId: chatIdForMsg,
                              senderId: 'system',
                              senderName: 'Sistema',
                              text: `💰 ${user.name} actualizó su estimado a ${label} MXN`,
                              type: 'price_update',
                              createdAt: serverTimestamp(),
                            });
                            setEditingBidPrice(false);
                            setNewBidPrice('');
                            setNewBidMax('');
                          } catch { Alert.alert('Error', 'No se pudo actualizar el estimado'); }
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Confirmar estimado</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.alreadyBidText}>✓ Tu estimado: {fmtEstimate(myBid?.estMin ?? myBid?.price, myBid?.estMax)} MXN</Text>
                    {job.status === 'open' && (
                      <TouchableOpacity
                        onPress={() => { setEditingBidPrice(true); setNewBidPrice(String(myBid?.estMin ?? myBid?.price ?? '')); setNewBidMax(myBid?.estMax != null ? String(myBid.estMax) : ''); }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.accent + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                      >
                        <Ionicons name="pencil-outline" size={13} color={COLORS.accent} />
                        <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: '700' }}>Editar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}

            {isWorker && job.assignedTo === user.id && job.status === 'assigned' && (
              <>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: COLORS.yellow + '14', borderWidth: 1, borderColor: COLORS.yellow + '40', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.yellow} style={{ marginTop: 1 }} />
                  <Text style={{ color: C.muted, fontSize: 11, lineHeight: 15, flex: 1 }}>
                    Por seguridad, pide que el pago se realice <Text style={{ fontWeight: '800', color: C.text }}>en el sitio, con el cliente presente</Text>, antes de retirarte.
                  </Text>
                </View>
                {job.workerConfirmed ? (
                  <View style={[styles.completeButton, { backgroundColor: COLORS.green + '15', borderColor: COLORS.green }]}>
                    <Text style={[styles.completeButtonText, { color: COLORS.green }]}>✓ Finalizado — esperando confirmación del cliente</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: job.clientConfirmed ? COLORS.green : COLORS.green + '22', borderColor: COLORS.green }]}
                    onPress={handleWorkerMarkComplete}
                  >
                    {job.clientConfirmed && <Text style={{ color: '#fff', fontSize: 11, textAlign: 'center', marginBottom: 2, opacity: 0.85 }}>El cliente ya confirmó su parte</Text>}
                    <Text style={[styles.completeButtonText, { color: job.clientConfirmed ? '#fff' : COLORS.green }]}>
                      {job.clientConfirmed ? '✓ Confirmar — eres el último paso' : '✓ Finalizar trabajo'}
                    </Text>
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

        {showRebook && (
          <PostJobScreen
            user={user}
            targetWorker={assignedProfile}
            onClose={() => setShowRebook(false)}
          />
        )}

        {showPayment && (
          <PaymentModal
            amount={paymentTotal}
            description={`${job.title}${job.isUrgent ? ' + Urgente' : ''}`}
            workerId={job.assignedTo}
            clientEmail={user.email || null}
            jobId={job.id}
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
                  <Text style={styles.jobLocation}>💰 {jobPriceLabel(item)}</Text>
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

// Lightweight public profile for clients (workers check who they're working with)
function ClientProfileModal({ client, onClose }) {
  const C = useTheme();
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    getDocs(query(collection(db, 'clientRatings'), where('clientId', '==', client.id)))
      .then(s => {
        const rows = s.docs.map(d => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setReviews(rows);
      })
      .catch(() => setReviews([]));
  }, [client.id]);

  const avg = reviews?.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : (client.clientRating || 0);

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />
        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButton}>← Cerrar</Text></TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>Perfil de cliente</Text>
          <View style={{ width: 80 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            {client.profileImage
              ? <Image source={{ uri: client.profileImage }} style={{ width: 90, height: 90, borderRadius: 45 }} />
              : <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.accent + '22', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 34 }}>{client.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>}
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '800', marginTop: 12 }}>{client.name}</Text>
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Cliente</Text>
            {avg > 0 && (
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <StarRating rating={Math.round(avg)} size={22} />
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
                  {avg.toFixed(1)} · {reviews?.length || client.clientRatedCount || 0} reseña{(reviews?.length || 0) !== 1 ? 's' : ''} de trabajadores
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.formLabel}>RESEÑAS DE TRABAJADORES</Text>
          {reviews === null ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
          ) : reviews.length === 0 ? (
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>Este cliente aún no tiene reseñas.</Text>
          ) : reviews.map(r => (
            <View key={r.id} style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <StarRating rating={r.rating || 0} size={14} />
                <Text style={{ color: C.muted, fontSize: 11 }}>
                  {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('es-MX') : ''}
                </Text>
              </View>
              {r.review ? <Text style={{ color: C.text, fontSize: 13 }}>{r.review}</Text> : <Text style={{ color: C.muted, fontSize: 12 }}>Sin comentario</Text>}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function WorkerProfileModal({ worker, currentUser, onClose, favoriteIds = [], onToggleFavorite }) {
  const [ratings, setRatings] = useState([]);
  const [hiddenIds, setHiddenIds] = useState(new Set(worker.hiddenRatings || []));
  const [loading, setLoading] = useState(true);
  const [workerBusiness, setWorkerBusiness] = useState(null);
  const isOwnProfile = currentUser.id === worker.id;

  useEffect(() => { loadRatings(); }, []);

  // Load the registered company this worker belongs to (if any)
  useEffect(() => {
    if (!worker.businessId) return;
    getDoc(doc(db, 'businesses', worker.businessId)).then(snap => {
      if (snap.exists()) setWorkerBusiness({ id: snap.id, ...snap.data() });
    }).catch(() => {});
  }, [worker.businessId]);

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

            {/* Registered company indicator */}
            {workerBusiness && workerBusiness.verificationStatus === 'verified' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: COLORS.blue + '15', borderWidth: 1, borderColor: COLORS.blue + '44', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 }}>
                {workerBusiness.logo
                  ? <Image source={{ uri: workerBusiness.logo }} style={{ width: 20, height: 20, borderRadius: 5 }} />
                  : <Ionicons name="business" size={15} color={COLORS.blue} />}
                <Text style={{ color: COLORS.blue, fontSize: 12, fontWeight: '700' }}>
                  {worker.businessRole === 'owner' ? 'Dueño de' : 'Trabaja con'} {workerBusiness.name}
                </Text>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.blue} />
              </View>
            )}

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

// ─── Help Center ──────────────────────────────────────────────────────────────
const HELP_ARTICLES = [
  { cat: '📋 Publicar y contratar', items: [
    { q: '¿Cómo publico un trabajo?', a: 'Toca el botón "+ Publicar", elige el tipo de servicio, describe el problema con fotos, indica tu zona y presupuesto. Recibirás propuestas de trabajadores verificados.' },
    { q: '¿Qué es un trabajo urgente?', a: `Por $${URGENT_JOB_PRICE} MXN extra tu trabajo aparece destacado al inicio del feed para recibir propuestas más rápido. Requiere pago con tarjeta.` },
    { q: '¿Cómo elijo al trabajador?', a: 'Compara las propuestas: precio, calificaciones, reseñas y perfil. Puedes chatear con cada trabajador antes de aceptar. Al aceptar una propuesta, el trabajo queda asignado.' },
    { q: '¿Puedo volver a contratar al mismo trabajador?', a: 'Sí. En el detalle de un trabajo completado verás el botón "Volver a contratar", que crea una propuesta directa para ese trabajador.' },
  ]},
  { cat: '💳 Pagos, comisiones y propinas', items: [
    { q: '¿Cuánto cuesta usar Taskly?', a: 'Publicar es gratis. Pagando con tarjeta se agrega una comisión de servicio del 2.5% más el procesamiento del pago (3.6% + $3 MXN), desglosados antes de confirmar. En efectivo no hay comisión.' },
    { q: '¿Cómo se protege mi pago?', a: 'Tu pago queda protegido en la plataforma y se libera al trabajador cuando ambas partes confirman que el trabajo fue completado. Esto es la Garantía Taskly.' },
    { q: '¿Puedo dejar propina?', a: 'Sí. Al momento de pagar puedes agregar una propina de $20, $50 o $100 MXN. El 100% de la propina va al trabajador.' },
    { q: '¿Cuándo recibe su dinero el trabajador?', a: 'Al confirmarse el trabajo, Stripe libera los fondos ~7 días hábiles después del pago (plazo estándar de Stripe en México) y luego los deposita a la cuenta bancaria del trabajador en 1-2 días hábiles. La app muestra la fecha exacta de disponibilidad en el estado del pago.' },
  ]},
  { cat: '🛡️ Garantía y disputas', items: [
    { q: '¿Qué es la Garantía Taskly?', a: 'Si pagas con tarjeta, tu dinero queda protegido en la plataforma hasta que confirmes que el trabajo se completó. Si algo sale mal, abre una disputa y te ayudamos a resolverlo.' },
    { q: '¿Cómo abro una disputa?', a: 'En el detalle del trabajo completado, toca "Reportar un problema" dentro de las 72 horas siguientes. El equipo de Taskly revisa cada caso y resuelve en máximo 5 días hábiles.' },
  ]},
  { cat: '✅ Verificación y seguridad', items: [
    { q: '¿Cómo verifican a los trabajadores?', a: 'Cada trabajador sube su INE (frente y reverso) y el equipo de Taskly la revisa antes de otorgar el sello de Verificado.' },
    { q: '¿Cómo verifico mi cuenta?', a: 'Ve a Perfil → Verificación de identidad, sube el frente y reverso de tu INE y toma una selfie en vivo (la cámara se abre en el momento). La selfie debe coincidir con la foto de tu INE. La revisión toma 1-2 días hábiles.' },
    { q: '¿Puedo bloquear la app con Face ID?', a: 'Sí. Ve a Configuración → Privacidad y Seguridad → Face ID / Touch ID y activa el bloqueo.' },
    { q: '¿Qué pasa con mis chats al completar un trabajo?', a: 'Para proteger tu privacidad y ahorrar espacio, las fotos del trabajo se eliminan al completarse el pago y el chat se elimina automáticamente 24 horas después.' },
  ]},
  { cat: '🏢 Empresas', items: [
    { q: '¿Cómo registro mi empresa?', a: 'Ve a Configuración → Empresa → Registrar empresa. Necesitas un comprobante del negocio (recibo de luz o agua). El equipo de Taskly revisa y aprueba tu empresa para el directorio.' },
    { q: '¿Cómo me uno a una empresa?', a: 'Pide el código de invitación al dueño de la empresa y ve a Configuración → Empresa → Unirme a una empresa.' },
  ]},
  { cat: '👤 Cuenta', items: [
    { q: '¿Cómo cambio mi contraseña?', a: 'Ve a Configuración → Cuenta → Restablecer contraseña. Te enviaremos un correo para crear una nueva.' },
    { q: '¿Cómo elimino mi cuenta?', a: 'Ve a Configuración → Cuenta → Eliminar cuenta. Esta acción es irreversible y borra todos tus datos.' },
  ]},
];

function HelpCenterModal({ onClose }) {
  const C = useTheme();
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);

  const sections = HELP_ARTICLES.map(s => ({
    ...s,
    items: s.items.filter(i => !search
      || i.q.toLowerCase().includes(search.toLowerCase())
      || i.a.toLowerCase().includes(search.toLowerCase())),
  })).filter(s => s.items.length > 0);

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />
        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButton}>← Volver</Text></TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>Centro de ayuda</Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={[styles.searchBarWrap, { backgroundColor: C.card, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={16} color={C.muted} style={{ marginRight: 6 }} />
          <TextInput
            style={[styles.searchBarInput, { color: C.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Busca tu duda..."
            placeholderTextColor={C.muted}
            clearButtonMode="while-editing"
          />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {sections.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="help-circle-outline" size={48} color={C.muted} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyStateText, { color: C.muted }]}>Sin resultados para tu búsqueda</Text>
            </View>
          )}
          {sections.map(section => (
            <View key={section.cat} style={{ marginBottom: 18 }}>
              <Text style={{ color: C.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 }}>{section.cat}</Text>
              {section.items.map(item => {
                const id = section.cat + item.q;
                const open = openId === id;
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => setOpenId(open ? null : id)}
                    style={{ backgroundColor: C.card, borderWidth: 1, borderColor: open ? COLORS.accent + '66' : C.border, borderRadius: 12, padding: 14, marginBottom: 8 }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <Text style={{ color: C.text, fontWeight: '700', fontSize: 13, flex: 1 }}>{item.q}</Text>
                      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color={C.muted} />
                    </View>
                    {open && <Text style={{ color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 8 }}>{item.a}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 8 }]}
            onPress={() => Linking.openURL('mailto:soporte@taskly.com.mx?subject=Soporte Taskly')}
          >
            <Text style={styles.primaryButtonText}>✉️ Contactar soporte</Text>
          </TouchableOpacity>
          <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 10 }}>
            Respondemos en menos de 24 horas hábiles
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Phone (SMS) verification ─────────────────────────────────────────────────
// Requires two backend endpoints on Railway: /send-sms-code and /verify-sms-code
function PhoneVerifyModal({ userId, onClose }) {
  const C = useTheme();
  const [step, setStep] = useState('phone'); // phone | code | done
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const fullPhone = `+52${phone.replace(/\D/g, '')}`;

  const sendCode = async () => {
    if (phone.replace(/\D/g, '').length !== 10) {
      Alert.alert('Número inválido', 'Ingresa tu número de 10 dígitos (sin +52).');
      return;
    }
    setLoading(true);
    try {
      const res = await authedFetch(`${BACKEND_URL}/send-sms-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone: fullPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || 'send failed');
      setStep('code');
    } catch {
      Alert.alert('No disponible', 'El servicio de verificación por SMS no está disponible en este momento. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code.trim().length < 4) return;
    setLoading(true);
    try {
      const res = await authedFetch(`${BACKEND_URL}/verify-sms-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone: fullPhone, code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error || !data.verified) throw new Error(data.error || 'invalid');
      await updateDoc(doc(db, 'users', userId), { phone: fullPhone, phoneVerified: true });
      setStep('done');
    } catch {
      Alert.alert('Código incorrecto', 'Revisa el código e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.actionSheet, { backgroundColor: C.card }]}>
          {step === 'phone' && (
            <>
              <Text style={[styles.sectionHeader, { color: C.text, marginBottom: 4 }]}>📱 Verificar teléfono</Text>
              <Text style={{ color: C.muted, marginBottom: 16, fontSize: 13 }}>Te enviaremos un código por SMS para confirmar tu número. Esto genera más confianza con otros usuarios.</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>🇲🇽 +52</Text>
                <TextInput
                  style={[styles.input, { flex: 1, borderColor: C.border, color: C.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="81 1234 5678"
                  placeholderTextColor={C.muted}
                  keyboardType="phone-pad"
                  maxLength={14}
                />
              </View>
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 14 }, loading && { opacity: 0.6 }]} onPress={sendCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Enviar código</Text>}
              </TouchableOpacity>
            </>
          )}
          {step === 'code' && (
            <>
              <Text style={[styles.sectionHeader, { color: C.text, marginBottom: 4 }]}>Ingresa el código</Text>
              <Text style={{ color: C.muted, marginBottom: 16, fontSize: 13 }}>Enviamos un código por SMS al {fullPhone}.</Text>
              <TextInput
                style={[styles.input, { borderColor: C.border, color: C.text, textAlign: 'center', fontSize: 22, letterSpacing: 6 }]}
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                placeholderTextColor={C.muted}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 14 }, (loading || code.trim().length < 4) && { opacity: 0.6 }]} onPress={verifyCode} disabled={loading || code.trim().length < 4}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Verificar</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('phone')} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: C.muted, fontSize: 13 }}>Cambiar número</Text>
              </TouchableOpacity>
            </>
          )}
          {step === 'done' && (
            <>
              <Text style={{ fontSize: 44, textAlign: 'center', marginBottom: 8 }}>✅</Text>
              <Text style={[styles.sectionHeader, { color: C.text, textAlign: 'center', marginBottom: 4 }]}>¡Teléfono verificado!</Text>
              <Text style={{ color: C.muted, marginBottom: 16, fontSize: 13, textAlign: 'center' }}>Tu número quedó confirmado en tu cuenta.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
                <Text style={styles.primaryButtonText}>Listo</Text>
              </TouchableOpacity>
            </>
          )}
          {step !== 'done' && (
            <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: C.muted }}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SettingsScreen({ user, userProfile, onClose, onEditProfile, onShowOnboarding, themeMode, onThemeChange }) {
  const C = useTheme();
  const [notifPush, setNotifPush] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifJobs, setNotifJobs] = useState(true);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const [showJoinBusiness, setShowJoinBusiness] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('taskly_biometric').then(v => setBiometricEnabled(v === 'true'));
  }, []);

  const toggleBiometric = async (value) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert('No disponible', 'Tu dispositivo no tiene Face ID, Touch ID o huella configurada. Actívala primero en los ajustes del sistema.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirma tu identidad', cancelLabel: 'Cancelar' });
      if (!result.success) return;
    }
    setBiometricEnabled(value);
    await AsyncStorage.setItem('taskly_biometric', value ? 'true' : 'false');
  };
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
        authedFetch(`${BACKEND_URL}/worker-payout-status/${userProfile.stripeAccountId}`)
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
            // Backend cascades all of the user's data + deletes the Auth user (admin
            // delete bypasses the "requires recent login" error the client hits directly).
            const res = await authedFetch(`${BACKEND_URL}/delete-account`, { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'fail');
            await signOut(auth).catch(() => {});
            Alert.alert('Cuenta eliminada', 'Tu cuenta y tus datos se han eliminado.');
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la cuenta. Verifica tu conexión e intenta de nuevo.');
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

  const handleCreateBusiness = async (name, description, logoUri, proofUri) => {
    if (!name.trim() || !proofUri) return;
    try {
      const stamp = Date.now();
      const proofUrl = await uploadImage(proofUri, `businesses/${user.id}/proof_${stamp}.jpg`);
      const logoUrl = logoUri ? await uploadImage(logoUri, `businesses/${user.id}/logo_${stamp}.jpg`) : null;
      const ref = await addDoc(collection(db, 'businesses'), {
        name: name.trim(),
        description: description.trim(),
        ownerId: user.id,
        ownerName: user.name,
        memberIds: [user.id],
        services: [],
        logo: logoUrl,
        proofUrl,
        verificationStatus: 'pending',
        joinCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', user.id), { businessId: ref.id, businessRole: 'owner' });
      setShowCreateBusiness(false);
      Alert.alert('✓ Empresa registrada', 'Tu empresa y comprobante están en revisión. La publicaremos una vez verificada.');
    } catch {
      Alert.alert('Error', 'No se pudo crear la empresa. Intenta de nuevo.');
    }
  };

  const handleJoinBusiness = async (code) => {
    if (!code?.trim()) return;
    const snap = await getDocs(query(collection(db, 'businesses'), where('joinCode', '==', code.trim())));
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
            <SettingsRow
              icon="chatbox-ellipses-outline"
              title="Verificar teléfono"
              subtitle={userProfile?.phoneVerified ? `✓ Verificado: ${userProfile.phone}` : 'Confirma tu número por SMS'}
              onPress={() => userProfile?.phoneVerified
                ? Alert.alert('Teléfono verificado', `Tu número ${userProfile.phone} ya está verificado.`)
                : setShowPhoneVerify(true)}
            />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="location-outline" title="Permiso de ubicación" subtitle="Gestionar en Ajustes del sistema" onPress={() => Linking.openSettings()} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="camera-outline" title="Permiso de cámara y galería" subtitle="Gestionar en Ajustes del sistema" onPress={() => Linking.openSettings()} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow
              icon="finger-print-outline"
              title="Face ID / Touch ID"
              subtitle="Pide desbloquear la app al abrirla"
              rightElement={<Switch value={biometricEnabled} onValueChange={toggleBiometric} trackColor={{ false: C.border, true: COLORS.accent }} thumbColor="#fff" />}
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
              title="Centro de ayuda"
              subtitle="Preguntas frecuentes y guías"
              onPress={() => setShowHelpCenter(true)}
            />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="call-outline" title="Contactar soporte" subtitle="soporte@taskly.com.mx" onPress={() => Linking.openURL('mailto:soporte@taskly.com.mx?subject=Soporte Taskly')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="flag-outline" title="Reportar un problema" onPress={() => Linking.openURL('mailto:soporte@taskly.com.mx?subject=Reporte de problema')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="document-text-outline" title="Términos y condiciones" subtitle="taskly.com.mx/terminos" onPress={() => Linking.openURL('https://taskly.com.mx/terminos')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="shield-checkmark-outline" title="Aviso de privacidad" subtitle="taskly.com.mx/privacidad" onPress={() => Linking.openURL('https://taskly.com.mx/privacidad')} />
            <View style={[styles.settingsDivider, { backgroundColor: C.border }]} />
            <SettingsRow icon="globe-outline" title="Sitio web" subtitle="taskly.com.mx" onPress={() => Linking.openURL('https://taskly.com.mx')} />
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
        <JoinBusinessInlineModal
          onConfirm={handleJoinBusiness}
          onClose={() => setShowJoinBusiness(false)}
        />
      )}

      {/* Help Center */}
      {showHelpCenter && <HelpCenterModal onClose={() => setShowHelpCenter(false)} />}

      {/* Phone (SMS) verification */}
      {showPhoneVerify && (
        <PhoneVerifyModal
          userId={user.id}
          onClose={() => setShowPhoneVerify(false)}
        />
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
          return s + (isWorkerView ? Math.round(t * 0.975 * 100) / 100 : calcStripeFees(t).clientTotal);
        }, 0);
        const totalPending = inProcess.reduce((s, i) => {
          const t = (i.assignedPrice || 0) + (i.isUrgent ? URGENT_JOB_PRICE : 0);
          return s + (isWorkerView ? Math.round(t * 0.975 * 100) / 100 : calcStripeFees(t).clientTotal);
        }, 0);
        const totalUpcoming = upcoming.reduce((s, i) => {
          const t = (i.assignedPrice || 0) + (i.isUrgent ? URGENT_JOB_PRICE : 0);
          return s + (isWorkerView ? Math.round(t * 0.975 * 100) / 100 : t);
        }, 0);
        const allEmpty = upcoming.length === 0 && inProcess.length === 0 && completed.length === 0;

        const PhCard = ({ item, colorAccent, statusLabel, statusIcon }) => {
          const total = (item.assignedPrice || 0) + (item.isUrgent ? URGENT_JOB_PRICE : 0);
          const commission = Math.round(total * 0.025 * 100) / 100;
          const workerReceives = Math.round((total - commission) * 100) / 100;
          const stripeTotal = calcStripeFees(total).clientTotal;
          const amount = isWorkerView ? workerReceives : (item.paymentMethod === 'card' && item.status !== 'assigned' ? stripeTotal : total);
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
                    <Text style={{ color: colorAccent, fontWeight: '800', fontSize: 17 }}><PriceText value={amount} style={{ color: colorAccent, fontWeight: '800', fontSize: 17 }} /> MXN</Text>
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
                    <Text style={{ color: C.text, fontSize: 13 }}><PriceText value={item.assignedPrice} style={{ color: C.text, fontSize: 13 }} /> MXN</Text>
                  </View>
                  {item.isUrgent && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: C.muted, fontSize: 13 }}>Cargo urgente</Text>
                      <Text style={{ color: C.text, fontSize: 13 }}>+<PriceText value={URGENT_JOB_PRICE} style={{ color: C.text, fontSize: 13 }} /> MXN</Text>
                    </View>
                  )}
                  {isWorkerView && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: C.muted, fontSize: 13 }}>Comisión Taskly (2.5%)</Text>
                      <Text style={{ color: COLORS.red, fontSize: 13 }}>-<PriceText value={commission} style={{ color: COLORS.red, fontSize: 13 }} /> MXN</Text>
                    </View>
                  )}
                  {!isWorkerView && (
                    <>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: C.muted, fontSize: 13 }}>Comisión de procesamiento (tarjeta)</Text>
                        <Text style={{ color: C.text, fontSize: 13 }}>+<PriceText value={Math.round((stripeTotal - total) * 100) / 100} style={{ color: C.text, fontSize: 13 }} /> MXN</Text>
                      </View>
                      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 15 }}>
                        Cobrada por Stripe (procesador de pagos) por el pago con tarjeta — no es comisión de Taskly.
                      </Text>
                    </>
                  )}
                  <View style={{ height: 1, backgroundColor: C.border, marginVertical: 4 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>{isWorkerView ? 'Recibes' : 'Total'}</Text>
                    <Text style={{ color: colorAccent, fontWeight: '800', fontSize: 14 }}><PriceText value={amount} style={{ color: colorAccent, fontWeight: '800', fontSize: 14 }} /> MXN</Text>
                  </View>
                  {item.status === 'completed' && (
                    <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border }}>
                      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 }}>ESTADO DEL DEPÓSITO</Text>
                      <PaymentTracker
                        job={item}
                        payoutStatus={isWorkerView ? phPayoutStatus : null}
                        isWorker={isWorkerView}
                        workerAccountId={isWorkerView ? user.stripeAccountId : null}
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 52, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: 'row', alignItems: 'center' }}>
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
                  {/* 3 global summary cards */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
                    <View style={{ flex: 1, backgroundColor: COLORS.green + '18', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.green + '44', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.green} />
                      <Text style={{ color: C.muted, fontSize: 10, marginTop: 4, textAlign: 'center' }}>{isWorkerView ? 'Confirmado' : 'Pagado'}</Text>
                      <Text style={{ color: COLORS.green, fontWeight: '800', fontSize: 15, marginTop: 2 }}><PriceText value={totalCompleted} style={{ color: COLORS.green, fontWeight: '800', fontSize: 15 }} /></Text>
                      <Text style={{ color: C.muted, fontSize: 9 }}>MXN</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: COLORS.yellow + '18', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.yellow + '44', alignItems: 'center' }}>
                      <Ionicons name="time-outline" size={20} color={COLORS.yellow} />
                      <Text style={{ color: C.muted, fontSize: 10, marginTop: 4, textAlign: 'center' }}>En camino</Text>
                      <Text style={{ color: COLORS.yellow, fontWeight: '800', fontSize: 15, marginTop: 2 }}>
                        <PriceText value={isWorkerView && phPayoutStatus?.pending != null ? phPayoutStatus.pending : totalPending} style={{ color: COLORS.yellow, fontWeight: '800', fontSize: 15 }} />
                      </Text>
                      <Text style={{ color: C.muted, fontSize: 9 }}>MXN</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: COLORS.blue + '18', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.blue + '44', alignItems: 'center' }}>
                      <Ionicons name="hammer-outline" size={20} color={COLORS.blue} />
                      <Text style={{ color: C.muted, fontSize: 10, marginTop: 4, textAlign: 'center' }}>{isWorkerView ? 'Por cobrar' : 'Por pagar'}</Text>
                      <Text style={{ color: COLORS.blue, fontWeight: '800', fontSize: 15, marginTop: 2 }}><PriceText value={totalUpcoming} style={{ color: COLORS.blue, fontWeight: '800', fontSize: 15 }} /></Text>
                      <Text style={{ color: C.muted, fontSize: 9 }}>MXN</Text>
                    </View>
                  </View>

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
  const C = useTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [proofUri, setProofUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const slides = [
    { icon: '🏢', title: 'Tu empresa en Taskly', desc: 'Registra tu negocio para aparecer en el directorio de empresas y que los clientes te encuentren más fácil.' },
    { icon: '👥', title: 'Trabaja en equipo', desc: 'Comparte tu código de invitación con tus trabajadores. Los trabajos y reseñas del equipo construyen la reputación de tu empresa.' },
    { icon: '📄', title: 'Comprueba que es tuya', desc: 'Para proteger a los clientes te pediremos un comprobante del negocio: un recibo de luz o agua a nombre del negocio o del dueño.' },
    { icon: '✅', title: 'Revisión rápida', desc: 'El equipo de Taskly revisa cada empresa antes de publicarla en el directorio. Te notificamos en cuanto esté aprobada.' },
  ];
  const inForm = step >= slides.length;

  const pickImage = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) setter(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !proofUri || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(name, description, logoUri, proofUri);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />
        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButton}>← Cancelar</Text></TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>Registrar empresa</Text>
          <View style={{ width: 80 }} />
        </View>
        {!inForm ? (
          <>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
              <Text style={styles.onboardingIcon}>{slides[step].icon}</Text>
              <Text style={[styles.onboardingTitle, { color: C.text }]}>{slides[step].title}</Text>
              <Text style={[styles.onboardingDesc, { color: C.muted }]}>{slides[step].desc}</Text>
            </View>
            <View style={styles.onboardingDots}>
              {slides.map((_, i) => <View key={i} style={[styles.onboardingDot, { backgroundColor: C.border }, i === step && styles.onboardingDotActive]} />)}
            </View>
            <View style={styles.onboardingActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(s => s + 1)}>
                <Text style={styles.primaryButtonText}>{step < slides.length - 1 ? 'Siguiente →' : 'Comenzar registro →'}</Text>
              </TouchableOpacity>
              {step < slides.length - 1 && (
                <TouchableOpacity onPress={() => setStep(slides.length)} style={{ marginTop: 14, padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: C.muted, fontSize: 14 }}>Saltar introducción</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <View style={[styles.infoBox, { borderColor: COLORS.yellow + '66', backgroundColor: COLORS.yellow + '11' }]}>
              <Text style={[styles.infoText, { color: COLORS.yellow }]}>Tu empresa será revisada antes de aparecer públicamente en el directorio.</Text>
            </View>
            <Text style={styles.formLabel}>NOMBRE DE LA EMPRESA *</Text>
            <TextInput style={[styles.input, { borderColor: C.border, color: C.text }]} value={name} onChangeText={setName} placeholder="Ej: Servicios Martínez" placeholderTextColor={C.muted} />
            <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
            <TextInput style={[styles.input, styles.textArea, { borderColor: C.border, color: C.text }]} value={description} onChangeText={setDescription} placeholder="¿Qué servicios ofrece tu empresa?" placeholderTextColor={C.muted} multiline numberOfLines={3} />

            <Text style={styles.formLabel}>LOGO (OPCIONAL)</Text>
            <TouchableOpacity
              onPress={() => pickImage(setLogoUri)}
              style={{ width: 90, height: 90, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: logoUri ? COLORS.green : C.border, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
            >
              {logoUri
                ? <Image source={{ uri: logoUri }} style={{ width: '100%', height: '100%' }} />
                : <Ionicons name="image-outline" size={28} color={C.muted} />}
            </TouchableOpacity>

            <Text style={styles.formLabel}>COMPROBANTE DEL NEGOCIO *</Text>
            <Text style={[styles.formHint, { marginTop: -8 }]}>Recibo de luz o agua a nombre del negocio o del dueño. Solo lo ve el equipo de Taskly para verificar la propiedad.</Text>
            <TouchableOpacity
              onPress={() => pickImage(setProofUri)}
              style={{ height: 110, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: proofUri ? COLORS.green : C.border, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
            >
              {proofUri
                ? <Image source={{ uri: proofUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                : <Text style={[styles.ineImageLabel, { color: C.muted }]}>📄{'\n'}Subir comprobante</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, (!name.trim() || !proofUri || submitting) && { opacity: 0.5 }]}
              disabled={!name.trim() || !proofUri || submitting}
              onPress={handleSubmit}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Registrar empresa</Text>}
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function JoinBusinessInlineModal({ onConfirm, onClose }) {
  const C = useTheme();
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const slides = [
    { icon: '🤝', title: 'Únete a una empresa', desc: 'Si trabajas con un negocio registrado en Taskly, puedes vincular tu cuenta para formar parte de su equipo.' },
    { icon: '🔑', title: 'Pide el código', desc: 'El dueño de la empresa tiene un código de invitación único. Pídeselo e ingrésalo aquí — él aprobará tu solicitud.' },
  ];
  const inForm = step >= slides.length;
  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={C.bg === '#0A0A0A' ? 'light-content' : 'dark-content'} />
        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButton}>← Cancelar</Text></TouchableOpacity>
          <Text style={[styles.modalTitle, { color: C.text }]}>Unirse a empresa</Text>
          <View style={{ width: 80 }} />
        </View>
        {!inForm ? (
          <>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
              <Text style={styles.onboardingIcon}>{slides[step].icon}</Text>
              <Text style={[styles.onboardingTitle, { color: C.text }]}>{slides[step].title}</Text>
              <Text style={[styles.onboardingDesc, { color: C.muted }]}>{slides[step].desc}</Text>
            </View>
            <View style={styles.onboardingDots}>
              {slides.map((_, i) => <View key={i} style={[styles.onboardingDot, { backgroundColor: C.border }, i === step && styles.onboardingDotActive]} />)}
            </View>
            <View style={styles.onboardingActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(s => s + 1)}>
                <Text style={styles.primaryButtonText}>{step < slides.length - 1 ? 'Siguiente →' : 'Ingresar código →'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <Text style={styles.formLabel}>CÓDIGO DE INVITACIÓN</Text>
            <TextInput
              style={[styles.input, { borderColor: C.border, color: C.text }]}
              value={code}
              onChangeText={setCode}
              placeholder="Código de empresa"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.primaryButton, !code.trim() && { opacity: 0.5 }]} disabled={!code.trim()} onPress={() => onConfirm(code)}>
              <Text style={styles.primaryButtonText}>Enviar solicitud</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Worker identity verification — INE upload + status display
function IneVerificationSection({ userId, userProfile, onRefresh }) {
  const C = useTheme();
  const status = userProfile?.verificationStatus || 'unverified';
  const [ineImages, setIneImages] = useState({ front: null, back: null });
  const [selfie, setSelfie] = useState(null);
  const [legalName, setLegalName] = useState(userProfile?.name || '');
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

  // Live selfie: front camera only, gallery not allowed — so the face is captured in
  // the moment and can be compared against the INE photo. (Manual review for now;
  // an automated face-match/liveness provider will replace this later.)
  const takeSelfie = async () => {
    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus !== 'granted') {
      Alert.alert('Permiso de cámara', 'Necesitamos tu cámara para tomar una selfie en vivo y verificar tu identidad.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: false,
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]) {
      setSelfie(result.assets[0].uri);
    }
  };

  const submitVerification = async () => {
    if (legalName.trim().length < 4) {
      Alert.alert('Falta tu nombre', 'Escribe tu nombre completo tal como aparece en tu INE.');
      return;
    }
    if (!ineImages.front || !ineImages.back) {
      Alert.alert('Faltan imágenes', 'Sube el frente y reverso de tu INE.');
      return;
    }
    if (!selfie) {
      Alert.alert('Falta tu selfie', 'Toma una selfie en vivo para confirmar que eres la persona de la INE.');
      return;
    }
    setUploading(true);
    try {
      const frontUrl = await uploadImage(ineImages.front, `verification/${userId}/ine_front.jpg`);
      const backUrl = await uploadImage(ineImages.back, `verification/${userId}/ine_back.jpg`);
      const selfieUrl = await uploadImage(selfie, `verification/${userId}/selfie.jpg`);
      await updateDoc(doc(db, 'users', userId), {
        verificationStatus: 'pending',
        legalName: legalName.trim(),
        ineImages: { front: frontUrl, back: backUrl, selfie: selfieUrl },
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

      <View style={[styles.ineStatusBox, { backgroundColor: C.card, borderColor: cfg.color + '66' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name={cfg.icon} size={22} color={cfg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.ineStatusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={[styles.ineStatusDesc, { color: C.muted }]}>{cfg.desc}</Text>
          </View>
        </View>
      </View>

      {status === 'unverified' && (
        <>
          <Text style={[styles.formLabel, { marginTop: 12 }]}>NOMBRE COMPLETO (como aparece en tu INE)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
            placeholder="Ej: Juan Carlos Pérez López"
            placeholderTextColor={C.muted}
            value={legalName}
            onChangeText={setLegalName}
            autoCapitalize="words"
          />
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 4 }}>
            Debe coincidir exactamente con tu INE. Al aprobarse tu verificación, este será el nombre que se muestre en tu cuenta.
          </Text>

          <Text style={[styles.formLabel, { marginTop: 16 }]}>SUBE TU INE</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.ineImageBox, { backgroundColor: C.card, borderColor: C.border }, ineImages.front && styles.ineImageBoxDone]} onPress={() => pickIne('front')}>
              {ineImages.front
                ? <Image source={{ uri: ineImages.front }} style={styles.ineThumb} />
                : <Text style={[styles.ineImageLabel, { color: C.muted }]}>📷{'\n'}Frente</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ineImageBox, { backgroundColor: C.card, borderColor: C.border }, ineImages.back && styles.ineImageBoxDone]} onPress={() => pickIne('back')}>
              {ineImages.back
                ? <Image source={{ uri: ineImages.back }} style={styles.ineThumb} />
                : <Text style={[styles.ineImageLabel, { color: C.muted }]}>📷{'\n'}Reverso</Text>}
            </TouchableOpacity>
          </View>

          <Text style={[styles.formLabel, { marginTop: 16 }]}>SELFIE EN VIVO</Text>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 17, marginBottom: 8 }}>
            Toma una foto de tu rostro en este momento. Debe coincidir con la foto de tu INE. La cámara frontal se abre directamente — no se permite elegir de la galería.
          </Text>
          <TouchableOpacity
            style={[{ backgroundColor: C.card, borderColor: selfie ? COLORS.green : C.border, borderWidth: 1, borderRadius: 12, height: 150, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }]}
            onPress={takeSelfie}
          >
            {selfie
              ? <Image source={{ uri: selfie }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <Text style={[styles.ineImageLabel, { color: C.muted }]}>🤳{'\n'}Tomar selfie en vivo</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 12 }, (!ineImages.front || !ineImages.back || !selfie || uploading) && { opacity: 0.5 }]}
            onPress={submitVerification}
            disabled={!ineImages.front || !ineImages.back || !selfie || uploading}
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
  const [bankInfo, setBankInfo] = useState(null);
  const isSetup = !!userProfile?.stripeAccountId;

  useEffect(() => {
    if (!userProfile?.stripeAccountId) return;
    let alive = true;
    authedFetch(`${BACKEND_URL}/connect-account-info/${userProfile.stripeAccountId}`)
      .then(r => r.json())
      .then(d => { if (alive && !d.error) setBankInfo(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [userProfile?.stripeAccountId]);

  const handleOpenOnboarding = async () => {
    setLoading(true);
    try {
      // Reuse the existing Connect account when updating — creating a new one would
      // orphan the old account (and its balance) and reset the worker's setup.
      let accountId = userProfile?.stripeAccountId || null;
      if (!accountId) {
        const res1 = await authedFetch(`${BACKEND_URL}/create-connect-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, name: userName }),
        });
        const { accountId: newId, error: err1 } = await res1.json();
        if (err1) throw new Error(err1);
        accountId = newId;
        await updateDoc(doc(db, 'users', userId), { stripeAccountId: accountId });
      }

      const res2 = await authedFetch(`${BACKEND_URL}/create-account-link`, {
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
              {bankInfo?.bank?.last4 ? (
                <Text style={{ color: C.muted, fontSize: 13 }}>
                  {bankInfo.bank.bankName ? `${bankInfo.bank.bankName} ` : 'Cuenta '}terminada en ••{bankInfo.bank.last4}
                </Text>
              ) : (
                <Text style={{ color: C.muted, fontSize: 13 }}>Recibirás pagos automáticamente al completar trabajos.</Text>
              )}
            </View>
          </View>
          {bankInfo?.lastPayoutFailed && (
            <View style={{ backgroundColor: COLORS.red + '18', borderRadius: 8, borderWidth: 1, borderColor: COLORS.red + '55', padding: 10, marginBottom: 12 }}>
              <Text style={{ color: COLORS.red, fontSize: 12, fontWeight: '700' }}>⚠️ Tu último depósito falló</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                Tu dinero sigue seguro en tu saldo de Taskly. Actualiza tu información bancaria y Stripe reintentará el depósito automáticamente.
                {bankInfo.lastPayoutFailureMessage ? `\n\nMotivo: ${bankInfo.lastPayoutFailureMessage}` : ''}
              </Text>
            </View>
          )}
          {bankInfo && !bankInfo.lastPayoutFailed && (bankInfo.needsAttention || !bankInfo.payoutsEnabled) && (
            <View style={{ backgroundColor: COLORS.yellow + '18', borderRadius: 8, borderWidth: 1, borderColor: COLORS.yellow + '44', padding: 10, marginBottom: 12 }}>
              <Text style={{ color: COLORS.yellow, fontSize: 12, fontWeight: '700' }}>Falta completar tu información</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Stripe necesita más datos antes de poder depositarte. Toca "Actualizar información bancaria".</Text>
            </View>
          )}
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
  const [tab, setTab] = useState('stats');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const fetchAll = async () => {
      try {
        const [pendingSnap, verifiedSnap, bizSnap, usersSnap, jobsSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('verificationStatus', '==', 'pending'))),
          getDocs(query(collection(db, 'users'), where('verificationStatus', '==', 'verified'))),
          getDocs(query(collection(db, 'businesses'), where('verificationStatus', '==', 'pending'))),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'jobs')),
        ]);
        setPendingUsers(pendingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setVerifiedUsers(verifiedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPendingBusinesses(bizSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const allUsers = usersSnap.docs.map(d => d.data());
        const allJobs = jobsSnap.docs.map(d => d.data());
        const completed = allJobs.filter(j => j.status === 'completed');
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        setStats({
          totalUsers: allUsers.length,
          workers: allUsers.filter(u => u.role === 'worker').length,
          clients: allUsers.filter(u => u.role === 'client').length,
          totalJobs: allJobs.length,
          openJobs: allJobs.filter(j => j.status === 'open').length,
          activeJobs: allJobs.filter(j => j.status === 'assigned' || j.status === 'pending_payment').length,
          completedJobs: completed.length,
          jobsThisWeek: allJobs.filter(j => (j.createdAt?.toMillis?.() ?? 0) >= weekAgo).length,
          gmv: completed.reduce((sum, j) => sum + (j.assignedPrice || 0), 0),
          tasklyRevenue: completed.filter(j => j.paymentMethod !== 'cash').reduce((sum, j) => sum + (j.assignedPrice || 0) * 0.025, 0),
        });
      } catch (e) {
        Alert.alert('Error', 'No se pudieron cargar los datos del panel.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [visible]);

  const handleBusinessVerdict = async (biz, verdict) => {
    setProcessing(biz.id);
    try {
      await updateDoc(doc(db, 'businesses', biz.id), {
        verificationStatus: verdict,
        verificationReviewedAt: serverTimestamp(),
      });
      await createNotification(biz.ownerId, verdict === 'verified' ? 'business_approved' : 'business_rejected', 'Taskly', {
        jobTitle: biz.name,
        jobId: '',
      });
      setPendingBusinesses(prev => prev.filter(b => b.id !== biz.id));
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar la empresa.');
    } finally {
      setProcessing(null);
    }
  };

  const handleVerdict = async (u, verdict) => {
    const userId = u.id;
    setProcessing(userId);
    try {
      const update = { verificationStatus: verdict, verificationReviewedAt: serverTimestamp() };
      // On approval, force the display name to the legal name they declared (matches the INE)
      const approvedName = (u.legalName || '').trim();
      if (verdict === 'verified' && approvedName) update.name = approvedName;
      await updateDoc(doc(db, 'users', userId), update);
      await createNotification(userId, verdict === 'verified' ? 'account_verified' : 'account_rejected', 'Taskly', {
        jobTitle: verdict === 'verified' ? 'Tu cuenta ha sido verificada' : 'Tu solicitud de verificación fue rechazada',
        jobId: '',
      });
      const approved = verdict === 'verified';
      setPendingUsers(prev => prev.filter(x => x.id !== userId));
      if (approved) {
        setVerifiedUsers(prev => [...prev, { id: userId, name: update.name || u.name, verificationStatus: 'verified' }]);
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
      {u.verificationStatus === 'pending' && (
        <View style={{ backgroundColor: COLORS.accent + '15', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>NOMBRE DECLARADO — debe coincidir con la INE</Text>
          <Text style={{ color: C.text, fontSize: 17, fontWeight: '800', marginTop: 2 }}>{u.legalName || '⚠️ No declaró nombre'}</Text>
          {u.name && u.legalName && u.name !== u.legalName && (
            <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>Al aprobar, el nombre en la app cambiará de "{u.name}" a "{u.legalName}".</Text>
          )}
        </View>
      )}
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
          {u.ineImages.selfie ? (
            <Image source={{ uri: u.ineImages.selfie }} style={{ flex: 1, height: 100, borderRadius: 8, backgroundColor: C.border }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, height: 100, borderRadius: 8, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: C.muted, fontSize: 11 }}>Sin selfie</Text>
            </View>
          )}
        </View>
      )}
      {u.verificationStatus === 'pending' && (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: COLORS.green, borderRadius: 8, padding: 10, alignItems: 'center' }}
            onPress={() => handleVerdict(u, 'verified')}
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
              { text: 'Rechazar', style: 'destructive', onPress: () => handleVerdict(u, 'unverified') },
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
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 }}>
            {[
              { key: 'stats',    label: 'Resumen' },
              { key: 'pending',  label: `INE (${pendingUsers.length})` },
              { key: 'business', label: `Empresas (${pendingBusinesses.length})` },
              { key: 'verified', label: 'Verificados' },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: tab === t.key ? '#1a1a2e' : C.card, borderWidth: 1, borderColor: tab === t.key ? '#4a4a8a' : C.border }}
                onPress={() => setTab(t.key)}
              >
                <Text style={{ color: tab === t.key ? '#a0a0ff' : C.muted, fontWeight: '700', fontSize: 11 }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : tab === 'stats' ? (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {stats && (
                <>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {[
                      ['Usuarios', stats.totalUsers, 'people-outline', COLORS.accent],
                      ['Trabajadores', stats.workers, 'construct-outline', COLORS.blue],
                      ['Clientes', stats.clients, 'person-outline', COLORS.green],
                      ['Trabajos totales', stats.totalJobs, 'briefcase-outline', COLORS.accent],
                      ['Abiertos', stats.openJobs, 'radio-button-on-outline', COLORS.blue],
                      ['En curso', stats.activeJobs, 'hammer-outline', COLORS.yellow],
                      ['Completados', stats.completedJobs, 'checkmark-circle-outline', COLORS.green],
                      ['Esta semana', stats.jobsThisWeek, 'trending-up-outline', COLORS.accent],
                    ].map(([label, value, icon, color]) => (
                      <View key={label} style={{ width: '48%', backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14 }}>
                        <Ionicons name={icon} size={18} color={color} />
                        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginTop: 6 }}>{value}</Text>
                        <Text style={{ color: C.muted, fontSize: 11 }}>{label}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: '#4a4a8a', padding: 16, marginTop: 12 }}>
                    <Text style={{ color: '#a0a0ff', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>💰 DINERO</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: C.muted, fontSize: 13 }}>Valor de trabajos completados</Text>
                      <Text style={{ color: C.text, fontWeight: '800', fontSize: 13 }}>${stats.gmv.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: C.muted, fontSize: 13 }}>Comisión Taskly estimada (2.5%)</Text>
                      <Text style={{ color: COLORS.green, fontWeight: '800', fontSize: 13 }}>${stats.tasklyRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          ) : tab === 'business' ? (
            <FlatList
              data={pendingBusinesses}
              keyExtractor={b => b.id}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 60 }}>
                  <Ionicons name="business-outline" size={48} color={C.muted} />
                  <Text style={{ color: C.muted, marginTop: 12, fontSize: 15 }}>No hay empresas pendientes</Text>
                </View>
              }
              renderItem={({ item: b }) => (
                <View style={{ backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    {b.logo
                      ? <Image source={{ uri: b.logo }} style={{ width: 40, height: 40, borderRadius: 10 }} />
                      : <Ionicons name="business-outline" size={32} color={C.muted} />}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>{b.name}</Text>
                      <Text style={{ color: C.muted, fontSize: 12 }}>Dueño: {b.ownerName}</Text>
                    </View>
                  </View>
                  {b.description ? <Text style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>{b.description}</Text> : null}
                  <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>COMPROBANTE DEL NEGOCIO</Text>
                  {b.proofUrl ? (
                    <Image source={{ uri: b.proofUrl }} style={{ width: '100%', height: 160, borderRadius: 8, backgroundColor: C.border, marginBottom: 12 }} resizeMode="contain" />
                  ) : (
                    <Text style={{ color: COLORS.red, fontSize: 12, marginBottom: 12 }}>⚠️ Sin comprobante (registro anterior)</Text>
                  )}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: COLORS.green, borderRadius: 8, padding: 10, alignItems: 'center' }}
                      onPress={() => handleBusinessVerdict(b, 'verified')}
                      disabled={processing === b.id}
                    >
                      {processing === b.id
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={{ color: '#fff', fontWeight: '700' }}>Aprobar</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: COLORS.red + 'dd', borderRadius: 8, padding: 10, alignItems: 'center' }}
                      onPress={() => Alert.alert('Rechazar empresa', `¿Rechazar "${b.name}"?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Rechazar', style: 'destructive', onPress: () => handleBusinessVerdict(b, 'rejected') },
                      ])}
                      disabled={processing === b.id}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
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

    // Warn BEFORE saving if changing the name will cost them their verification
    const nameChanged = name.trim() !== (userProfile?.name || '');
    const wasVerifying = userProfile?.verificationStatus === 'verified' || userProfile?.verificationStatus === 'pending';
    if (nameChanged && wasVerifying) {
      Alert.alert(
        'Cambiar tu nombre',
        userProfile?.verificationStatus === 'verified'
          ? 'Tu cuenta está verificada. Si cambias tu nombre dejará de coincidir con tu INE y perderás el sello de cuenta verificada. Tendrás que verificar tu identidad de nuevo.'
          : 'Tienes una verificación en revisión. Si cambias tu nombre, la solicitud se cancelará y tendrás que enviarla otra vez.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cambiar de todas formas', style: 'destructive', onPress: doSave },
        ]
      );
      return;
    }
    doSave();
  };

  const doSave = async () => {
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

      // A verified/pending name no longer matches the INE once changed — drop verification
      // so the worker must re-verify with the new name (also enforced in Firestore rules).
      const nameChanged = name.trim() !== (userProfile?.name || '');
      const wasVerifying = userProfile?.verificationStatus === 'verified' || userProfile?.verificationStatus === 'pending';
      const resetVerification = nameChanged && wasVerifying;
      if (resetVerification) update.verificationStatus = 'unverified';

      await updateDoc(doc(db, 'users', user.id), update);

      Alert.alert('✓ Guardado', resetVerification
        ? 'Tu perfil fue actualizado. Como cambiaste tu nombre, deberás verificar tu identidad de nuevo para recuperar el sello verificado.'
        : 'Tu perfil fue actualizado');
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
      // JS driver so the action background color can interpolate with the drag
      useNativeDriver: false,
      toValue,
      bounciness: 5,
      speed: 16,
    }).start(done);
  };

  const panResponder = useRef(
    PanResponder.create({
      // Don't claim on tap-start; only claim once the drag is mostly horizontal.
      // A forgiving cone (dx just needs to beat dy) lets diagonal swipes through
      // so a little vertical drift no longer kills the gesture.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      // Once we own a horizontal swipe, don't let the FlatList / pull-to-refresh
      // steal it when the finger wanders vertically.
      onPanResponderTerminationRequest: () => false,
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

  const handlePress = () => {
    if (restPos.current !== 0) {
      snapToRef.current(0);
    } else {
      onPress();
    }
  };

  const meta = getNotifMeta(item.type);
  const title = item.title || meta.title;
  const body = item.body || stripLeadingEmoji(item.message || '');

  // Gradual color reveal, iOS Mail style: the action fades in with the drag,
  // intensifies toward the full color, then deepens past the trigger threshold.
  const leftColor = translateX.interpolate({
    inputRange: [0, PEEK, FULL],
    outputRange: ['rgba(46,204,113,0.45)', 'rgba(46,204,113,1)', 'rgba(39,174,96,1)'],
    extrapolate: 'clamp',
  });
  const leftOpacity = translateX.interpolate({
    inputRange: [0, 12], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const leftIconScale = translateX.interpolate({
    inputRange: [PEEK, FULL], outputRange: [1, 1.18], extrapolate: 'clamp',
  });
  const rightColor = translateX.interpolate({
    inputRange: [-FULL, -PEEK, 0],
    outputRange: ['rgba(192,57,43,1)', 'rgba(231,76,60,1)', 'rgba(231,76,60,0.45)'],
    extrapolate: 'clamp',
  });
  const rightOpacity = translateX.interpolate({
    inputRange: [-12, 0], outputRange: [1, 0], extrapolate: 'clamp',
  });
  const rightIconScale = translateX.interpolate({
    inputRange: [-FULL, -PEEK], outputRange: [1.18, 1], extrapolate: 'clamp',
  });

  return (
    // Container clips everything to the same rounded shape — the action layers
    // sit full-bleed behind the card and are revealed as it slides
    <View style={{ marginBottom: 10, borderRadius: 14, overflow: 'hidden', backgroundColor: C.card }}>
      {/* Left action — green, color deepens as you pull right */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
          backgroundColor: leftColor, opacity: leftOpacity,
          justifyContent: 'center', alignItems: 'flex-start',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => { snapToRef.current(0, () => { if (!isRead.current) cbRead.current(); }); }}
          style={{ width: PEEK, height: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Animated.View style={{ alignItems: 'center', transform: [{ scale: leftIconScale }] }}>
            <Ionicons name="checkmark-outline" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 2 }}>Leída</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Right action — red, color deepens as you pull left */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
          backgroundColor: rightColor, opacity: rightOpacity,
          justifyContent: 'center', alignItems: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => { snapToRef.current(-500, () => cbDelete.current()); }}
          style={{ width: PEEK, height: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Animated.View style={{ alignItems: 'center', transform: [{ scale: rightIconScale }] }}>
            <Ionicons name="trash-outline" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 2 }}>Eliminar</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={[styles.notificationCard, { marginBottom: 0, backgroundColor: C.card, borderColor: C.border }]}
        >
          <View style={[styles.notificationIconWrap, { backgroundColor: meta.color + '22' }]}>
            <Ionicons name={meta.icon} size={19} color={meta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.notificationTitleRow}>
              {!item.read && <View style={styles.unreadDot} />}
              <Text numberOfLines={1} style={[styles.notificationTitle, { color: C.text, fontWeight: item.read ? '600' : '700', flex: 1 }]}>
                {title}
              </Text>
              <Text style={[styles.notificationTime, { color: C.muted }]}>{relTime(item.createdAt)}</Text>
            </View>
            <Text numberOfLines={2} style={[styles.notificationBody, { color: C.muted }]}>{body}</Text>
          </View>
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
          <View style={{ paddingHorizontal: 20, paddingTop: 2, paddingBottom: 10 }}>
            <Text style={{ color: C.muted, fontSize: 13, fontWeight: '500' }}>
              {unreadCount} sin leer
            </Text>
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
      const res1 = await authedFetch(`${BACKEND_URL}/create-connect-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: userName }),
      });
      const { accountId, error: err1 } = await res1.json();
      if (err1) throw new Error(err1);

      await updateDoc(doc(db, 'users', userId), { stripeAccountId: accountId });

      const res2 = await authedFetch(`${BACKEND_URL}/create-account-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, userId }),
      });
      const { url, error: err2 } = await res2.json();
      if (err2) throw new Error(err2);

      await WebBrowser.openAuthSessionAsync(url, 'taskly://banking-complete');

      // Release any payments that landed while this worker had no Stripe account
      try {
        const pendingQ = query(
          collection(db, 'jobs'),
          where('assignedTo', '==', userId),
          where('pendingTransfer', '==', true)
        );
        const pendingSnap = await getDocs(pendingQ);
        for (const jobDoc of pendingSnap.docs) {
          const jd = jobDoc.data();
          if (!jd.stripePaymentIntentId || !jd.workerPortion) continue;
          try {
            const r = await authedFetch(`${BACKEND_URL}/release-transfer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                stripeAccountId: accountId,
                stripePaymentIntentId: jd.stripePaymentIntentId,
                workerPortionCentavos: Math.round(jd.workerPortion * 100),
                jobTitle: jd.title || '',
              }),
            });
            const { transferId } = await r.json();
            if (transferId) {
              await updateDoc(doc(db, 'jobs', jobDoc.id), { pendingTransfer: false, transferId });
            }
          } catch {}
        }
      } catch {}

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
          <TouchableOpacity onPress={onDone} style={{ marginTop: 14, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>Completar después</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function OnboardingScreen({ role, onDone }) {
  const [page, setPage] = useState(0);
  const slides = role === 'client' ? [
    { icon: '📋', title: 'Publica tu problema', desc: 'Describe el problema y agrega fotos. Recibes cotizaciones de trabajadores calificados en minutos.' },
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

// Official multi-color Google "G" mark (per Google branding guidelines)
function GoogleGLogo({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
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
        .then(async (r) => {
          // Sign-in already succeeded here — don't surface an error alert for a
          // profile-doc hiccup. Pass the Google display name through so it carries over.
          try { await ensureUserDoc(r.user, role, r.user.displayName); }
          catch (e) { console.warn('ensureUserDoc (Google):', e?.message); }
        })
        .catch(() => Alert.alert('Error', 'No se pudo iniciar sesión con Google'));
    }
  }, [googleResponse]);

  return (
    <TouchableOpacity style={styles.googleButton} onPress={() => promptGoogleAsync()} disabled={disabled} activeOpacity={0.85}>
      <View style={{ marginRight: 12 }}><GoogleGLogo size={18} /></View>
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
                  <View style={{ marginRight: 12 }}><GoogleGLogo size={18} /></View>
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
  const [biometricLocked, setBiometricLocked] = useState(false);
  const [activeChatInfo, setActiveChatInfo] = useState(null); // { chatId, otherUser, job } from Chats tab
  const [selectedClientProfile, setSelectedClientProfile] = useState(null);

  const promptBiometricUnlock = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Desbloquea Taskly', cancelLabel: 'Cancelar' });
      if (result.success) setBiometricLocked(false);
    } catch {}
  };

  // App lock: if the user enabled Face ID / Touch ID, require it on launch
  useEffect(() => {
    if (!user) { setBiometricLocked(false); return; }
    AsyncStorage.getItem('taskly_biometric').then(async (v) => {
      if (v !== 'true') return;
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        setBiometricLocked(true);
        promptBiometricUnlock();
      }
    });
  }, [user?.id]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [myJobFilter, setMyJobFilter] = useState('all');
  const [myBids, setMyBids] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionSheetJob, setActionSheetJob] = useState(null); // long-press quick actions
  const [showPostJob, setShowPostJob] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showWorkers, setShowWorkers] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [exploreSection, setExploreSection] = useState('workers');
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
        // Test accounts skip email verification ONLY in development builds. In production
        // (__DEV__ === false) every password account must verify — the bypass is disabled.
        const TEST_EMAILS = ['cliente@cliente.com', 'trabajador@trabajador.com', 'trabajador2@trabajador.com', 'trabajador3@trabajador.com'];
        // Apple App Review demo logins — a fixed allowlist that skips email verification
        // even in production, so reviewers can sign in without a real inbox. They still
        // need the correct password, so no one else can use these.
        const REVIEW_EMAILS = ['apple@client.view.com', 'apple@worker.view.com'];
        const fbEmail = (firebaseUser.email || '').toLowerCase();
        const isTestBypass = (__DEV__ && TEST_EMAILS.includes(firebaseUser.email)) || REVIEW_EMAILS.includes(fbEmail);
        const isPasswordProvider = firebaseUser.providerData?.some(p => p.providerId === 'password');
        if (isPasswordProvider && !firebaseUser.emailVerified && !isTestBypass) {
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
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
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
    if (!Notifications) return;
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
    if (!Notifications) return;
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
      const now = Date.now();

      snapshot.forEach((doc) => {
        const job = { id: doc.id, ...doc.data() };
        // 30 days after completion/cancellation, auto-delete the job, its chats and media
        if (job.deleteAtMs && job.deleteAtMs <= now) { purgeJob(job); return; }
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

  // Unread-chats count for the Chats tab badge: a chat is unread when it was updated after
  // the current user last read it (their own sends mark it read, so they don't self-count).
  useEffect(() => {
    if (!user?.id) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.id));
    return onSnapshot(q, (snap) => {
      let n = 0;
      const now = Date.now();
      snap.forEach((d) => {
        const c = d.data();
        if (c.deleteAtMs && c.deleteAtMs <= now) return;
        const upd = c.updatedAt?.toMillis?.() ?? 0;
        const read = c.lastReadBy?.[user.id]?.toMillis?.() ?? 0;
        if (upd > 0 && upd > read) n++;
      });
      setUnreadChatCount(n);
    }, () => {});
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedRole(null);
      setActiveTab('browse');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  // Open the chat for a job directly (assigned worker ↔ client); falls back to job details
  const openJobChat = async (job) => {
    const partnerId = job.userId === user.id ? job.assignedTo : job.userId;
    if (!partnerId) { setSelectedJob(job); return; }
    try {
      const partnerDoc = await getDoc(doc(db, 'users', partnerId));
      const newChatId = await getOrCreateChat(user.id, partnerId, job.id);
      if (newChatId && partnerDoc.exists()) {
        setActiveChatInfo({ chatId: newChatId, otherUser: { id: partnerId, ...partnerDoc.data() }, job });
      } else {
        setSelectedJob(job);
      }
    } catch { setSelectedJob(job); }
  };

  // A job can't be deleted while money is in play: the client still owes a payment,
  // or a card payment was made but the worker's deposit hasn't settled yet (~7 días).
  const PAYOUT_SETTLE_DAYS = 7;
  const blockDeleteReason = (job) => {
    if (job.paymentRequested && job.status === 'assigned') {
      return 'Este trabajo tiene un pago pendiente. Realiza el pago antes de eliminarlo.';
    }
    if (job.paymentMethod === 'card' && job.status === 'completed') {
      const ref = job.completedAt?.toDate?.() ?? (job.completedAt ? new Date(job.completedAt) : null);
      if (ref && (Date.now() - ref.getTime()) < PAYOUT_SETTLE_DAYS * 86400000) {
        return 'No puedes eliminar este trabajo hasta que el pago se deposite al trabajador. Esto puede tardar unos días hábiles.';
      }
    }
    return null;
  };

  const handleDeleteJob = async (job) => {
    const blocked = blockDeleteReason(job);
    if (blocked) { Alert.alert('No se puede eliminar', blocked); return; }
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
  const homePending = isClient ? myJobs.filter(isPaymentPending) : [];

  const renderContent = () => {
    if (activeTab === 'browse') {
      if (isClient) {
        return (
          <>
            <View style={[styles.exploreTabs, { backgroundColor: activeColors.bg, borderBottomColor: activeColors.border }]}>
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
                placeholder={exploreSection === 'workers' ? 'Buscar trabajadores...' : 'Buscar empresas...'}
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
        .filter(j => j.status === 'open') // hide completed/cancelled/assigned from worker explore
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 62, flexGrow: 0 }} contentContainerStyle={styles.feedFilterBar}>
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
            {(() => {
              // Profile completeness nudge — hidden once everything is done
              const checklist = [
                { key: 'photo', done: !!user?.profileImage, label: 'Agrega tu foto de perfil', doneLabel: 'Foto de perfil', icon: 'camera-outline', onPress: () => setShowProfile(true) },
                { key: 'bio', done: !!user?.bio, label: 'Describe tus servicios', doneLabel: 'Descripción de servicios', icon: 'document-text-outline', onPress: () => setShowProfile(true) },
                { key: 'ine', done: user?.verificationStatus === 'verified' || user?.verificationStatus === 'pending', label: 'Verifica tu identidad (INE)', doneLabel: user?.verificationStatus === 'pending' ? 'INE en revisión' : 'Identidad verificada', icon: 'card-outline', onPress: () => setShowProfile(true) },
                { key: 'bank', done: bankingSetup, label: 'Configura tu cuenta para cobrar', doneLabel: 'Cuenta de pagos lista', icon: 'cash-outline', onPress: () => setShowBankingSetupFromFeed(true) },
              ];
              const doneCount = checklist.filter(i => i.done).length;
              if (doneCount === checklist.length) return null;
              return (
                <View style={{ backgroundColor: activeColors.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.accent + '44', padding: 14, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: activeColors.text, fontWeight: '800', fontSize: 14 }}>Completa tu perfil</Text>
                    <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 13 }}>{doneCount}/{checklist.length}</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: activeColors.border, marginBottom: 12, overflow: 'hidden' }}>
                    <View style={{ width: `${(doneCount / checklist.length) * 100}%`, height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 }} />
                  </View>
                  <Text style={{ color: activeColors.muted, fontSize: 11, marginBottom: 10 }}>Los perfiles completos reciben más trabajos y generan más confianza.</Text>
                  {checklist.map(item => (
                    <TouchableOpacity
                      key={item.key}
                      onPress={item.done ? undefined : item.onPress}
                      disabled={item.done}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 }}
                    >
                      <Ionicons
                        name={item.done ? 'checkmark-circle' : item.icon}
                        size={20}
                        color={item.done ? COLORS.green : COLORS.accent}
                      />
                      <Text style={{ flex: 1, fontSize: 13, color: item.done ? activeColors.muted : activeColors.text, textDecorationLine: item.done ? 'line-through' : 'none' }}>
                        {item.done ? item.doneLabel : item.label}
                      </Text>
                      {!item.done && <Ionicons name="chevron-forward" size={14} color={activeColors.muted} />}
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })()}
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
      const pendingPaymentJobs = activeClientJobs.filter(isPaymentPending);

      const listData =
        myJobFilter === 'completed' ? doneClientJobs :
        myJobFilter === 'pending_payment' ? pendingPaymentJobs :
        myJobFilter === 'open' ? activeClientJobs.filter(j => j.status === 'open') :
        activeClientJobs; // 'all' / 'active'

      const showDoneSection = myJobFilter === 'all' && doneClientJobs.length > 0;

      return (
        <View style={{ flex: 1 }}>
          {/* Pending-payment alert — money the client still owes a worker */}
          {pendingPaymentJobs.length > 0 && (
            <TouchableOpacity
              onPress={() => setMyJobFilter('pending_payment')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: COLORS.accent + '18', borderWidth: 1, borderColor: COLORS.accent + '55' }}
            >
              <Ionicons name="alert-circle" size={20} color={COLORS.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 13 }}>
                  {pendingPaymentJobs.length === 1 ? 'Tienes 1 pago pendiente' : `Tienes ${pendingPaymentJobs.length} pagos pendientes`}
                </Text>
                <Text style={{ color: activeColors.muted, fontSize: 11, marginTop: 1 }}>Toca para ver y completar el pago al trabajador.</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
            </TouchableOpacity>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ height: 62, flexGrow: 0 }} contentContainerStyle={styles.filterBar}>
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
                    {myJobFilter === 'all' ? 'Aún no has publicado ningún problema' : 'No hay problemas en esta categoría'}
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
                    onLongPress={setActionSheetJob}
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
                onLongPress={setActionSheetJob}
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

    if (activeTab === 'chats') {
      return (
        <ChatsTab
          user={user}
          onOpenChat={(c) => setActiveChatInfo({ chatId: c.id, otherUser: { id: c.otherId, name: c.otherName }, job: c.job })}
        />
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
            style={{ height: 62, flexGrow: 0 }} contentContainerStyle={styles.filterBar}>
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
                  <TouchableOpacity key={item.id} onPress={() => setSelectedJob(item)} onLongPress={() => setActionSheetJob(item)} delayLongPress={300} style={[styles.bidJobCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
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
                      <Text style={[styles.myBidLabel, { color: activeColors.muted }]}>{item.assignedPrice ? 'Precio acordado:' : 'Tu estimado:'}</Text>
                      {item.assignedPrice
                        ? <PriceText value={item.assignedPrice} style={styles.myBidPrice} />
                        : <Text style={styles.myBidPrice}>{fmtEstimate(item.myBid?.estMin ?? item.myBid?.price, item.myBid?.estMax)}</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
                {filteredDone.length > 0 && (
                  <>
                    <Text style={[styles.sectionHeader, { marginTop: 20, color: activeColors.text }]}>
                      Completados ({filteredDone.length})
                    </Text>
                    {filteredDone.map(item => (
                      <TouchableOpacity key={item.id} onPress={() => setSelectedJob(item)} onLongPress={() => setActionSheetJob(item)} delayLongPress={300} style={[styles.bidJobCard, { opacity: 0.8, backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                        <View style={styles.jobCardHeader}>
                          <ServiceIcon type={item.type} size={48} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.jobTitle, { color: activeColors.text }]}>{item.title}</Text>
                            <Text style={[styles.jobLocation, { color: activeColors.muted }]}>📍 {item.estimatedLocation?.area || item.location}</Text>
                          </View>
                          <StatusBadge status={item.status} />
                        </View>
                        <View style={styles.myBidInfo}>
                          <Text style={[styles.myBidLabel, { color: activeColors.muted }]}>Precio final:</Text>
                          <PriceText value={item.assignedPrice ?? item.myBid?.price} style={styles.myBidPrice} />
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
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.taskly.mx">
    <SafeAreaProvider>
    <ErrorBoundary>
    <ThemeContext.Provider value={activeColors}>
    <SafeAreaViewSA edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: activeColors.bg }]}>
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

      {/* Permanent pending-payment banner — stays until the client pays */}
      {homePending.length > 0 && (
        <TouchableOpacity
          onPress={() => setSelectedJob(homePending[0])}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.accent + '1A', borderBottomWidth: 1, borderBottomColor: COLORS.accent + '44' }}
        >
          <Ionicons name="alert-circle" size={20} color={COLORS.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 13 }}>
              {homePending.length === 1 ? 'Tienes un pago pendiente' : `Tienes ${homePending.length} pagos pendientes`}
            </Text>
            <Text style={{ color: activeColors.muted, fontSize: 11 }} numberOfLines={1}>
              {homePending.length === 1 ? `"${homePending[0].title}" — toca para pagar al trabajador` : 'Toca para completar el pago al trabajador'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
        </TouchableOpacity>
      )}

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

      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
      <View style={[styles.bottomNav, { backgroundColor: activeColors.bg, borderTopColor: activeColors.border, paddingBottom: (insets?.bottom || 0) + 8 }]}>
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
            <Text style={[styles.navText, { color: activeColors.muted }, activeTab === 'my-jobs' && styles.navTextActive]}>Mis solicitudes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setActiveTab('my-bids')}
          >
            <Ionicons name={activeTab === 'my-bids' ? 'reader' : 'reader-outline'} size={24} color={activeTab === 'my-bids' ? COLORS.accent : activeColors.muted} />
            <Text style={[styles.navText, { color: activeColors.muted }, activeTab === 'my-bids' && styles.navTextActive]}>Mis propuestas</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('chats')}
        >
          <View>
            <Ionicons name={activeTab === 'chats' ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={activeTab === 'chats' ? COLORS.accent : activeColors.muted} />
            {unreadChatCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadChatCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navText, { color: activeColors.muted }, activeTab === 'chats' && styles.navTextActive]}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setShowProfile(true)}
        >
          <Ionicons name="person-outline" size={24} color={activeColors.muted} />
          <Text style={[styles.navText, { color: activeColors.muted }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
        )}
      </SafeAreaInsetsContext.Consumer>

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
          onViewClientProfile={(clientProfile) => setSelectedClientProfile(clientProfile)}
        />
      )}

      {actionSheetJob && (
        <JobActionSheet
          job={actionSheetJob}
          user={user}
          onClose={() => setActionSheetJob(null)}
          onOpenDetails={(job) => setSelectedJob(job)}
          onChat={(job) => openJobChat(job)}
          onEdit={(job) => { setEditingJob(job); setShowPostJob(true); }}
          onDelete={(job) => handleDeleteJob(job)}
        />
      )}

      {selectedClientProfile && (
        <ClientProfileModal
          client={selectedClientProfile}
          onClose={() => setSelectedClientProfile(null)}
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

      {/* Chat opened from the Chats tab */}
      {activeChatInfo && (
        <ChatScreen
          chatId={activeChatInfo.chatId}
          otherUser={activeChatInfo.otherUser}
          job={activeChatInfo.job}
          currentUser={user}
          onClose={() => setActiveChatInfo(null)}
        />
      )}

      {/* Biometric app lock — covers everything until unlocked */}
      {biometricLocked && (
        <Modal visible animationType="fade" statusBarTranslucent>
          <SafeAreaView style={{ flex: 1, backgroundColor: activeColors.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Ionicons name="lock-closed" size={64} color={COLORS.accent} />
            <Text style={{ color: activeColors.text, fontSize: 22, fontWeight: '800', marginTop: 24 }}>Taskly está bloqueado</Text>
            <Text style={{ color: activeColors.muted, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 32 }}>
              Usa Face ID, Touch ID o tu huella para continuar.
            </Text>
            <TouchableOpacity style={[styles.primaryButton, { paddingHorizontal: 40 }]} onPress={promptBiometricUnlock}>
              <Text style={styles.primaryButtonText}>Desbloquear</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaViewSA>
    </ThemeContext.Provider>
    </ErrorBoundary>
    </SafeAreaProvider>
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
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    marginBottom: 14,
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
  jobDetailHeader: { flexDirection: 'row', gap: 14, marginBottom: 20, borderRadius: 14, borderWidth: 1, padding: 14 },
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
  
  bidsSection: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
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
  bidFormSection: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 40 },
  
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
  
  notificationsList: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },
  notificationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  notificationTitle: { fontSize: 15, letterSpacing: -0.2 },
  notificationBody: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  notificationTime: { fontSize: 12, color: COLORS.muted, marginLeft: 8 },
  notificationArrow: { fontSize: 18, color: COLORS.muted, marginLeft: 8 },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  actionSheet: {
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 8,
  },
  actionSheetHandle: {
    width: 40, height: 5, borderRadius: 3,
    alignSelf: 'center', marginTop: 4, marginBottom: 10, opacity: 0.6,
  },
  actionSheetTitle: { fontSize: 16, fontWeight: '800', paddingHorizontal: 18 },
  actionSheetSubtitle: { fontSize: 13, fontWeight: '600', paddingHorizontal: 18, marginTop: 2, marginBottom: 6 },
  actionSheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 15, paddingHorizontal: 18, borderTopWidth: 1,
  },
  actionSheetRowText: { fontSize: 15, fontWeight: '600' },
  actionSheetCancel: {
    marginTop: 8, marginHorizontal: 12, paddingVertical: 13,
    borderRadius: 14, borderWidth: 1, alignItems: 'center',
  },
  actionSheetCancelText: { fontSize: 15, fontWeight: '700' },
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