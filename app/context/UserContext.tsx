"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Define User Context Type
interface UserContextType {
  user: any;
  userName: string | null;
  setUserName: (name: string | null) => void; // Function to update name instantly
}

// Create Context
const UserContext = createContext<UserContextType>({
  user: null,
  userName: null,
  setUserName: () => {}, // Placeholder function
});

// Create Provider
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserName("Loading..."); // Set temporary name to avoid delay
        
        // Fetch user name from Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserName(userSnap.data().name);
        } else {
          setUserName("User");
        }
      } else {
        setUser(null);
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to Use Context
export const useUser = () => useContext(UserContext);
