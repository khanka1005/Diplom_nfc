"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsImages, BsClipboardCheck } from "react-icons/bs";
import * as fabric from "fabric";
import { AiOutlineAppstore, AiOutlineFontSize } from "react-icons/ai";
import TextToolbar from "./toolbar/TextToolbar";

interface ToolbarProps {
  canvasRef: React.RefObject<fabric.Canvas | null>;
  canvasRef2: React.RefObject<fabric.Canvas | null>;
  currentSection: "section4" | "section5";
  onTemplateApplied?: () => void;
}

interface DesignData {
  id: string;
  designData: string;
  section: "section4" | "section5";
  previewImage?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ canvasRef, canvasRef2, currentSection }) => {
  const [designs, setDesigns] = useState<DesignData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("gallery");
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const [isTextSelected, setIsTextSelected] = useState(false);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return; // Check for undefined or null
  
    const canvas = canvasRef.current;
  
    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      setIsTextSelected(activeObject?.type === "text");
    };
  
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setIsTextSelected(false));
  
    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", () => setIsTextSelected(false));
    };
  }, [canvasRef]);
  
  useEffect(() => {
    const fetchSavedDesigns = async () => {
      if (!auth.currentUser) return;

      setIsLoading(true);
      const user = auth.currentUser;

      try {
        let allDesigns: DesignData[] = [];

        if (selectedTool === "gallery") {
          // Fetch card_view designs (section4)
          const cardBaseSnapshot = await getDocs(collection(db, "users", user.uid, "card_view"));
          const cardViewDocs = cardBaseSnapshot.docs.map((doc) => ({
            id: doc.id,
            designData: doc.data().cardBase,
            section: "section4" as const,
            previewImage: doc.data().previewImage || "" // Directly use the preview image from Firestore
          }));
          allDesigns = [...allDesigns, ...cardViewDocs];
        } else if (selectedTool === "webview") {
          // Fetch card_web designs (section5)
          const canvasDataSnapshot = await getDocs(collection(db, "users", user.uid, "card_web"));
          const cardWebDocs = canvasDataSnapshot.docs.map((doc) => ({
            id: doc.id,
            designData: doc.data().canvasData,
            section: "section5" as const,
            previewImage: doc.data().previewImage || "" // Directly use the preview image from Firestore
          }));
          allDesigns = [...allDesigns, ...cardWebDocs];
        } else if (selectedTool === "templates") {
         
          const canvasDataSnapshot = await getDocs(collection(db, "templates"));
          const templateDocs = canvasDataSnapshot.docs.map((doc) => ({
            id: doc.id,
            designData: doc.data().cardBase, // Fix this
            section: "section4" as const, // Templates apply to section4
            previewImage: doc.data().previewImage || "",
          }));
          allDesigns = [...allDesigns, ...templateDocs];
        }
        


        setDesigns(allDesigns);
      } catch (error) {
        console.error("Error fetching saved designs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedDesigns();
  }, [auth.currentUser, selectedTool]);

  const handleDesignClick = (design: DesignData) => {
    
  
    if (design.section !== currentSection && !(selectedTool === "templates" && currentSection === "section4")) {
      console.log("Design section doesn't match current section. Not applying.");
      alert(
        `This design is for ${design.section === "section4" ? "Card View" : "Web View"} and cannot be applied to the current section.`
      );
      
      return;
    }
    
    const targetCanvas = design.section === "section5" ? canvasRef2.current : canvasRef.current;
  
    if (targetCanvas && design.designData) {
      try {
        const parsedData = JSON.parse(design.designData);
        
        if (!parsedData || !parsedData.objects) {
          console.error("Invalid design data format", parsedData);
          return;
        }
  
        // Preserve background before clearing canvas
        let backgroundRect = targetCanvas
          .getObjects()
          .find((obj) => obj instanceof fabric.Rect && obj.fill === "#a8a6a6");
        
     
      
        if (!backgroundRect) {
          backgroundRect = new fabric.Rect({
            width: 700, // Adjust as needed
            height: 500,
            fill: "#a8a6a6",
            selectable: false,
            evented: false,
          });
  
          const centerX = (targetCanvas.width || 0) / 2;
          const centerY = (targetCanvas.height || 0) / 2;
  
          backgroundRect.set({
            left: centerX - backgroundRect.width! / 2,
            top: centerY - backgroundRect.height! / 2,
          });
  
          targetCanvas.add(backgroundRect);
          targetCanvas.sendObjectToBack(backgroundRect);
        }
  
        
        targetCanvas.getObjects().forEach((obj) => {
          if (obj !== backgroundRect && obj.type !== "image") {
            targetCanvas.remove(obj);
          }
        });
  
        // ✅ Load design data onto the canvas
        targetCanvas.loadFromJSON(parsedData, () => {
          targetCanvas.renderAll();
         
         // Trigger delayed actions after timeout for Section 5
         if (design.section === "section5") {
            setTimeout(() => {
              console.log("Applying Section 5 Design Data after Timeout");
              targetCanvas.getObjects().forEach((obj) => {
                
                targetCanvas.bringObjectToFront(obj);
              
            });
            }, 100); // Timeout after 5 seconds
          }
        

          setTimeout(() => {
            
            if (design.section === "section4") {
              // 🎨 Section 4: Add the card base on top
              const cardBase = new fabric.Rect({
                width: 500,
                height: 300,
                fill: "white",
                rx: 20,
                ry: 20,
                shadow: new fabric.Shadow({
                  color: "#000000",
                  blur: 1,
                  offsetX: 0,
                  offsetY: 0,
                }),
                selectable: false,
                evented: false,
                isCardBase: true, 
              });
  
              const centerX = (targetCanvas.width || 0) / 2;
              const centerY = (targetCanvas.height || 0) / 2;
  
              cardBase.set({
                left: centerX - cardBase.width! / 2,
                top: centerY - cardBase.height! / 2,
              });
  
              targetCanvas.add(cardBase);
              
              // ✅ **Ensure images & cardBase are properly ordered**
              targetCanvas.sendObjectToBack(cardBase);
              targetCanvas.getObjects().forEach((obj) => {
                
                  targetCanvas.bringObjectToFront(obj);
                
              });
              
              targetCanvas.sendObjectToBack(backgroundRect);
              targetCanvas.renderAll(); // 🛠️ **Force re-render**
            }
          }, 100);
        });
      } catch (error) {
        console.error("Failed to load design data:", error);
      }
    }
  };
  

  return (
    <div
      className={`fixed right-0 bottom-0 shadow-md bg-gray-100 transition-all duration-300 h-[80vh] ${
        isExpanded ? "w-80" : "w-16"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-1/2 -left-6 bg-gray-300 p-2 rounded-full shadow-md z-10"
      >
        {isExpanded ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      <div className="flex h-full">
       {/* Sidebar Icons */}
<div className="w-16 h-full flex flex-col items-center pt-6 border-r">

{/* Card View */}
<div
  className={`flex flex-col items-center justify-center p-3 cursor-pointer mb-4 ${
    selectedTool === "gallery" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
  }`}
  onClick={() => setSelectedTool("gallery")}
>
  <BsImages size={24} className="mb-1" />
  <span className="text-xs text-center">Card View</span>
</div>

{/* Web View */}
<div
  className={`flex flex-col items-center justify-center p-3 cursor-pointer ${
    selectedTool === "webview" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
  }`}
  onClick={() => setSelectedTool("webview")}
>
  <BsClipboardCheck size={24} className="mb-1" />
  <span className="text-xs text-center">Web View</span>
</div>

{/* Templates */}
<div
  className={`flex flex-col items-center justify-center p-3 cursor-pointer ${
    selectedTool === "templates" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
  }`}
  onClick={() => setSelectedTool("templates")}
>
  <AiOutlineAppstore size={24} className="mb-1" />
  <span className="text-xs text-center">Templates</span>
</div>

{/* Text Toolbar (Always visible) */}
<div
  className={`flex flex-col items-center justify-center p-3 cursor-pointer mb-4 ${
    selectedTool === "text" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
  }`}
  onClick={() => setSelectedTool("text")}
>
  <AiOutlineFontSize size={24} className="mb-1" />
  <span className="text-xs text-center">Text</span>
</div>

</div>


       {/* Expanded View */}
{isExpanded && (
  <div className="flex-1 p-4 overflow-y-auto relative z-20">
    {selectedTool === "text" ? (
      <TextToolbar canvasRef={canvasRef} />
    ) : isLoading ? (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-500">Loading previews...</p>
      </div>
    ) : designs.length === 0 ? (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-500">No saved designs.</p>
      </div>
    ) : (
      <div className="space-y-3">
        {designs.map((design) => (
          <div
            key={design.id}
            className={`cursor-pointer border p-2 rounded-md transition-colors relative z-10 ${
              design.section === currentSection 
                ? "hover:bg-gray-200" 
                : "opacity-50 hover:bg-red-100"
            }`}
            onClick={() => handleDesignClick(design)}
          >
            <div className="relative w-full h-24">
              {design.previewImage ? (
                <img
                  src={design.previewImage}
                  alt="Design preview"
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                  No Preview
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-center truncate">
              Design {design.id.slice(0, 8)}
              <span className="block text-xs italic">
                {design.section === "section4" ? "(Card View)" : "(Web View)"}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
    </div>
  );
};

export default Toolbar;
