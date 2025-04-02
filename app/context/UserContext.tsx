"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, enableNetwork } from "firebase/firestore";
import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";

interface UserContextType {
  user: any;
  userName: string | null;
  setUserName: (name: string | null) => void;
  authLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userName: null,
  setUserName: () => {},
  authLoading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const auth = getAuthClient();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const db = getFirestoreClient();

      if (currentUser) {
        setUser(currentUser);
        setUserName("Loading...");

        // ✅ Try to force Firestore online mode
        try {
         
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.warn("⚠️ Failed to enable Firestore network:", err.message);
          } else {
            console.warn("⚠️ Unknown network error:", err);
          }
        }

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          setUserName(userSnap.exists() ? userSnap.data().name : "User");
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error("❌ Failed to fetch user name:", err.message);
          } else {
            console.error("❌ Unknown error fetching user name:", err);
          }
          setUserName("User");
        }
      } else {
        setUser(null);
        setUserName(null);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, userName, setUserName, authLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
