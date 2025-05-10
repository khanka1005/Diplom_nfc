"use client";

import { useState } from "react";

import Section4 from "./Section4";
import Section5 from "./Section5";
import Section3 from "./Section3";
type SectionName = "section4" | "section5" | "section3";
interface SectionProps {
  navigateToSection: (section: string) => void;
  currentSection: SectionName;
}

const sectionComponents: Record<SectionName, React.ComponentType<any>> = {
  "section4": Section4,
  "section5": Section5,
  "section3": Section3,
};

const ContentSlider = () => {
  const [currentSection, setCurrentSection] = useState<SectionName>("section4");
  const sections: SectionName[] = ["section4", "section5", "section3"];
  const currentIndex = sections.indexOf(currentSection);
  const sectionNames = ["Картны загвар", "Цахим нэрийн хуудас", "Захиалга өгөх"];

  // Navigate to a specific section by name
  const navigateToSection = (sectionName: string) => {
    if (sectionName in sectionComponents) {
      setCurrentSection(sectionName as SectionName);
    }
  };

  // Handle next section
  const nextSection = () => {
    const nextIndex = (currentIndex + 1) % sections.length;
    setCurrentSection(sections[nextIndex]);
  };

  // Handle previous section
  const prevSection = () => {
    const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
    setCurrentSection(sections[prevIndex]);
  };

  // Get current section component
  const CurrentSection = sectionComponents[currentSection];

  return (
    <div className="w-full max-w-xl ml-50 text-center p-4 relative min-h-screen">
      
      {/* Current section content */}
      <div className="mt-10 pb-20"> {/* Add padding to prevent overlap with pagination */}
        <CurrentSection 
          navigateToSection={navigateToSection} 
          currentSection={currentSection}
        />
      </div>

      {/* Fixed Pagination */}
      <nav
        aria-label="Page navigation"
        className="fixed bottom-0 left-0 right-0 bg-white py-6 shadow-lg"
      >
        <div className="flex justify-between items-center px-8 max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={prevSection}
            className="flex items-center text-gray-500 hover:text-gray-700 text-lg font-medium py-3 px-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Өмнөх
          </button>

          {/* Progress Steps */}
          <div className="hidden md:flex items-center justify-center flex-grow">
            {sections.map((section, index) => {
              const isActive = section === currentSection;
              const isPast = sections.indexOf(currentSection) > index;
              
              return (
                <div key={section} className="flex items-center">
                  
                  {index > 0 && (
                    <div className={`w-16 h-1 ${isPast ? "bg-[#527ac9]" : "bg-gray-300"}`}></div>
                  )}
                  
                  
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                      ${isActive ? "border-[#527ac9] text-blue-500" : 
                        isPast ? "border-[#527ac9] bg-blue-500 text-white" : 
                        "border-gray-300 text-gray-500"}`}
                    >
                      {isPast ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`ml-2 text-sm-5 font-medium ${isActive ? "text-blue-500" : "text-gray-500"}`}>
                      {sectionNames[index]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSection}
            className="flex items-center bg-orange-400 hover:bg-orange-500 text-white font-medium py-3 px-8 rounded text-xl"
          >
            Дараагийн
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ContentSlider;