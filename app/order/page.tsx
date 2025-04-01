"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAuthClient } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Dynamically import ContentSlider with SSR disabled
const ContentSlider = dynamic(() => import("../components/ContentSection/ContentSlider"), {
  ssr: false,
});

const Ordering = () => {
  const [loading, setLoading] = useState(true); // 🕒 track loading
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuthClient();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("🔥 Auth user ready:", currentUser);
        setUser(currentUser);
      } else {
        console.log("❌ No authenticated user.");
      }
      setLoading(false); // ✅ Mark auth as resolved
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // 🔁 Or show a spinner if you prefer

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ContentSlider />
    </div>
  );
};

export default Ordering;
