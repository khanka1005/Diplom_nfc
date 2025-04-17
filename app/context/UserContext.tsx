"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, enableNetwork } from "firebase/firestore";
import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";

interface UserContextType {
  user: any;
  userName: string | null;
  isAdmin: boolean;
  setUserName: (name: string | null) => void;
  authLoading: boolean;
  
}

const UserContext = createContext<UserContextType>({
  user: null,
  userName: null,
  setUserName: () => {},
  authLoading: true,
  isAdmin:true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const auth = getAuthClient();
  
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const db = getFirestoreClient();
  
      if (currentUser) {
        setUser(currentUser);
        setUserName("Loading...");
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserName(data.name || "User");
            setIsAdmin(data.isAdmin === true); 
          } else {
            setUserName("User");
            setIsAdmin(false);
          }
        } catch (err) {
          console.error(" Error fetching user info:", err);
          setUserName("User");
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setUserName(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, userName,isAdmin, setUserName, authLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
