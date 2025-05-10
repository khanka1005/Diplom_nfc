"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Dynamically import ContentSlider with SSR disabled
const ContentSlider = dynamic(() => import("../components/ContentSection/ContentSlider"), {
  ssr: false,
});

const Ordering = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ✨ Added state for section switching
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = Section4, 1 = Section5

  useEffect(() => {
    const auth = getAuthClient();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("🔥 Auth user ready:", currentUser);
        setUser(currentUser);

        // ✅ Optional: Force Firestore online (you had a placeholder here)
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
   
      {/* ✨ Pass section state to ContentSlider */}
      <ContentSlider  />
    </div>
  );
};

export default Ordering;