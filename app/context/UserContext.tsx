"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
  const [authLoading, setAuthLoading] = useState(true); // ✅

  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const auth = getAuthClient();
  
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const db = getFirestoreClient(); // ✅ Moved inside callback
  
      if (currentUser) {
        setUser(currentUser);
        setUserName("Loading...");
  
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          setUserName(userSnap.exists() ? userSnap.data().name : "User");
        } catch (err: any) {
          console.error("❌ Failed to fetch user name:", err);
          setUserName("User");
        }
      } else {
        setUser(null);
        setUserName(null);
      }
  
      setAuthLoading(false); // ✅ after all is done
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
