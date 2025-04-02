"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { enableNetwork } from "firebase/firestore";

// Dynamically import ContentSlider with SSR disabled
const ContentSlider = dynamic(() => import("../components/ContentSection/ContentSlider"), {
  ssr: false,
});

const Ordering = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuthClient();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("🔥 Auth user ready:", currentUser);
        setUser(currentUser);

        // ✅ Force Firestore online
        try {
          const db = getFirestoreClient();
         
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.warn("⚠️ Failed to enable Firestore network:", err.message);
          } else {
            console.warn("⚠️ Unknown Firestore network error:", err);
          }
        }
      } else {
        console.log("❌ No authenticated user.");
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ContentSlider />
    </div>
  );
};

export default Ordering;
