
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let firestoreInstance = null;
export const getFirestoreClient = () => {
  if (typeof window === "undefined") {
    console.warn("⚠️ Firestore called on server — returning null");
    return null;
  }

  if (!firestoreInstance) {
    try {
      firestoreInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("initializeFirestore() has already been called")
      ) {
        firestoreInstance = getFirestore(app);
      } else {
        throw err;
      }
    }
  }

  return firestoreInstance;
};

export const getAuthClient = () => {
  if (typeof window === "undefined") throw new Error("Must be used in the browser");
  return getAuth(app);
};

export const getAnalyticsClient = () => {
  if (typeof window === "undefined") return null;
  return getAnalytics(app);
};

export const getGoogleProvider = () => new GoogleAuthProvider();

export { app };
