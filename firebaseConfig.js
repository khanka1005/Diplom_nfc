// firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  enableIndexedDbPersistence,
  initializeFirestore,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// 🔐 Your config stays the same
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ✅ Initialize app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Auth guard for client
export const getAuthClient = () => {
  if (typeof window === "undefined") throw new Error("Must be used in browser");
  return getAuth(app);
};

// ✅ Analytics guard
export const getAnalyticsClient = () => {
  if (typeof window === "undefined") return null;
  return getAnalytics(app);
};

// ✅ Firestore with Offline Persistence
let firestoreInstance;

export const getFirestoreClient = () => {
  if (!firestoreInstance) {
    const db = getFirestore(app);

    if (typeof window !== "undefined") {
      enableIndexedDbPersistence(db).catch((err) => {
        console.warn("⚠️ Offline persistence error:", err.code);
      });
    }

    firestoreInstance = db;
  }

  return firestoreInstance;
};

export const getGoogleProvider = () => new GoogleAuthProvider();
export { app };
