// firebaseConfig.ts or .js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize app once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🛡️ Safely initialize Firestore (only once)
let firestoreInstance = null;
export const getFirestoreClient = () => {
  if (typeof window === "undefined") {
    console.warn("⚠️ getFirestoreClient called on server — returning null");
    return null;
  }

  if (!firestoreInstance) {
    firestoreInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  }

  return firestoreInstance;
};

// Auth (browser only)
export const getAuthClient = () => {
  if (typeof window === "undefined") throw new Error("Must be used in browser");
  return getAuth(app);
};

export const getAnalyticsClient = () => {
  if (typeof window === "undefined") return null;
  return getAnalytics(app);
};

export const getGoogleProvider = () => new GoogleAuthProvider();

export { app };
