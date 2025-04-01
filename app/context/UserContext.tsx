"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";

interface UserContextType {
  user: any;
  userName: string | null;
  setUserName: (name: string | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userName: null,
  setUserName: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    // ✅ Ensure auth is only accessed in browser
    if (typeof window !== "undefined") {
      const auth = getAuthClient();
      const db = getFirestoreClient();

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setUserName("Loading...");

          try {
            const userDoc = doc(db, "users", currentUser.uid);
            const snap = await getDoc(userDoc);
            setUserName(snap.exists() ? snap.data().name : "User");
          } catch (err) {
            console.error("Failed to fetch user name:", err);
            setUserName("User");
          }
        } else {
          setUser(null);
          setUserName(null);
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
