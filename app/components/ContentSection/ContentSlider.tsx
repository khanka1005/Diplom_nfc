"use client"; // Ensure it's a client component

import { useState } from "react";
import Section1 from "./Section1";
import Section2 from "./Section2";
import Section3 from "./Section3";
import Section4 from "./Section4";
import Section5 from "./Section5";

const sections = [Section4, Section5, Section3, Section2, Section1]; // Section4 is first

const ContentSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // Default to Section4

  // Handle next section
  const nextSection = () => {
    setCurrentIndex((prev) => (prev + 1) % sections.length);
  };

  // Handle previous section
  const prevSection = () => {
    setCurrentIndex((prev) => (prev - 1 + sections.length) % sections.length);
  };

  const CurrentSection = sections[currentIndex]; // Dynamically render the current section

  return (
    <div className="w-full max-w-xl ml-50 text-center p-4 relative min-h-screen">
      {/* Render the current section */}
      <div className="mt-6 pb-20"> {/* Add padding-bottom to prevent content overlap */}
        <CurrentSection />
      </div>

      {/* Fixed Pagination */}
      <nav
        aria-label="Page navigation example"
        className="fixed bottom-0 left-0 right-0 bg-white py-4 shadow-lg" // Fixed position at the bottom
      >
        <div className="flex justify-center">
          <ul className="inline-flex -space-x-px text-base h-10">
            {/* Previous Button */}
            <li>
              <button
                onClick={prevSection}
                className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Өмнөх
              </button>
            </li>

            {/* Page Numbers */}
            {sections.map((_, index) => (
              <li key={index}>
                <button
                  onClick={() => setCurrentIndex(index)}
                  className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 ${
                    index === currentIndex
                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            {/* Next Button */}
            <li>
              <button
                onClick={nextSection}
                className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Дараагийн
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default ContentSlider;