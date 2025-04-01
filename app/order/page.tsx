"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { getAuthClient } from "@/firebaseConfig";


// Dynamically import ContentSlider with SSR disabled
const ContentSlider = dynamic(() => import("../components/ContentSection/ContentSlider"), {
  ssr: false,
});

const Ordering = () => {
  useEffect(() => {
    const auth = getAuthClient();
    const user = auth.currentUser;
    console.log("🔥 Deployed auth user:", user);
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ContentSlider />
    </div>
  );
};

export default Ordering;
