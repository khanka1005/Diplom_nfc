"use client";

import dynamic from "next/dynamic";

// Dynamically import ContentSlider with SSR disabled
const ContentSlider = dynamic(() => import("../components/ContentSection/ContentSlider"), {
  ssr: false,
});

const Ordering = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ContentSlider />
    </div>
  );
};

export default Ordering;
