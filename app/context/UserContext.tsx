"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { browserLocalPersistence, setPersistence } from "firebase/auth";

// Define User Context Type
interface UserContextType {
  user: any;
  userName: string | null;
  setUserName: (name: string | null) => void;
}

// Create Context
const UserContext = createContext<UserContextType>({
  user: null,
  userName: null,
  setUserName: () => {},
});

// Create Provider
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuthClient();
    const db = getFirestoreClient();
    
    setPersistence(auth, browserLocalPersistence).then(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        console.log("[🔐 AUTH STATE] User is:", currentUser);
  
        if (currentUser) {
          setUser(currentUser);
          setUserName("Loading...");
  
          try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            setUserName(userSnap.exists() ? userSnap.data().name : "User");
          } catch (err) {
            console.error("Failed to fetch user name:", err);
          }
        } else {
          setUser(null);
          setUserName(null);
        }
      });
  
      return () => unsubscribe();
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook
export const useUser = () => useContext(UserContext);
