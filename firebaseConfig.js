import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// 🔐 Firebase Config
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

// ✅ Firestore with Delayed Initialization (Only in Browser)
let firestoreInstance;

export const getFirestoreClient = () => {
  if (!firestoreInstance && typeof window !== "undefined") {
    firestoreInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  }
  return firestoreInstance;
};

// ✅ Auth (Browser Only)
export const getAuthClient = () => {
  if (typeof window === "undefined") throw new Error("Must be used in browser");
  return getAuth(app);
};

// ✅ Analytics (Optional)
export const getAnalyticsClient = () => {
  if (typeof window === "undefined") return null;
  return getAnalytics(app);
};

export const getGoogleProvider = () => new GoogleAuthProvider();

export { app };
