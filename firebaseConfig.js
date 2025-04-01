import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// ✅ Firebase config from env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ✅ Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Firestore: Delayed + Persistent + Error-aware initialization
let firestoreInstance;

export const getFirestoreClient = () => {
  if (typeof window === "undefined") return null;

  if (!firestoreInstance) {
    try {
      firestoreInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });

      // Log online/offline status
      window.addEventListener("online", () => console.info("📡 Back online"));
      window.addEventListener("offline", () => console.warn("📴 Offline mode"));

      // Optional emulator support in dev
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === "true") {
        connectFirestoreEmulator(firestoreInstance, "localhost", 8080);
        console.info("🧪 Connected to Firestore Emulator");
      }
    } catch (err) {
      console.error("🔥 Firestore init error:", err.message || err);
    }
  }

  return firestoreInstance;
};

// ✅ Auth guard for client-side use
export const getAuthClient = () => {
  if (typeof window === "undefined") throw new Error("Must be used in browser");
  return getAuth(app);
};

// ✅ Analytics (optional)
export const getAnalyticsClient = () => {
  if (typeof window === "undefined") return null;
  return getAnalytics(app);
};

// ✅ Google auth
export const getGoogleProvider = () => new GoogleAuthProvider();

export { app };
