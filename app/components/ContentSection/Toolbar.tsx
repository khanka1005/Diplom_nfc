"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { FaChevronLeft, FaChevronRight, FaTrash } from "react-icons/fa";
import { BsImages, BsClipboardCheck } from "react-icons/bs";
import * as fabric from "fabric";
import { AiOutlineAppstore, AiOutlineFontSize } from "react-icons/ai";
import TextToolbar from "./toolbar/TextToolbar";
import IphoneBackground from "./toolbar/IphoneBackground";

interface ToolbarProps {
  canvasRef: React.RefObject<fabric.Canvas | null>;
  canvasRef2: React.RefObject<fabric.Canvas | null>;
  currentSection: "section4" | "section5";
  onTemplateApplied?: () => void;
  onBackgroundColorChange?: (color: string) => void;
  navigateToSection?: (sectionName: string) => void;
}

interface DesignData {
  id: string;
  designData: string;
  section: "section4" | "section5";
  previewImage?: string;
  backgroundColorHex?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  canvasRef, 
  canvasRef2, 
  currentSection, 
  onBackgroundColorChange,
  navigateToSection 
}) => {
  const [designs, setDesigns] = useState<DesignData[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [, setIsTextSelected] = useState(false);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedTool") || "gallery";
    }
    return "gallery";
  });
  
  useEffect(() => {
    localStorage.setItem("selectedTool", selectedTool);
  }, [selectedTool]);
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return; // Check for undefined or null
  
    const canvas = canvasRef.current;
    
    const handleSelection = () => {
      const active = canvas.getActiveObject();
      const activeObject = canvas.getActiveObject();
      setIsTextSelected(activeObject?.type === "text");
      setActiveObject(active || null); 
    };
    
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => 
    {setIsTextSelected(false);
      setActiveObject(null);
    });
  
    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", () => {
        setIsTextSelected(false);
        setActiveObject(null);
      });
    };
  }, [canvasRef]);
  
  const fetchSavedDesigns = async (userId: string) => {
    try {
      setIsLoading(true);
      const db = getFirestoreClient();
      let allDesigns: DesignData[] = [];
      
      if (selectedTool === "gallery") {
        const cardBaseSnapshot = await getDocs(collection(db, "users", userId, "card_view"));
        const cardViewDocs = cardBaseSnapshot.docs.map((doc) => ({
          id: doc.id,
          designData: doc.data().cardBase,
          section: "section4" as const,
          previewImage: doc.data().previewImage || "",
        }));
        allDesigns = [...allDesigns, ...cardViewDocs];
      } else if (selectedTool === "webview") {
        const canvasDataSnapshot = await getDocs(collection(db, "users", userId, "card_web"));
        const cardWebDocs = canvasDataSnapshot.docs.map((doc) => ({
          id: doc.id,
          designData: doc.data().canvasData,
          section: "section5" as const,
          previewImage: doc.data().previewImage || "",
          backgroundColorHex: doc.data().backgroundColorHex || "#fefdfd",
        }));
        allDesigns = [...allDesigns, ...cardWebDocs];
      } else if (selectedTool === "templates") {
        const canvasDataSnapshot = await getDocs(collection(db, "templates"));
        const templateDocs = canvasDataSnapshot.docs.map((doc) => ({
          id: doc.id,
          designData: doc.data().cardBase,
          section: "section4" as const,
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

  useEffect(() => {
    const auth = getAuthClient();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchSavedDesigns(user.uid);
      }
    });

    return () => unsubscribe();
  }, [selectedTool]);

  const handleDesignClick = (design: DesignData) => {
    // If design section doesn't match current section, navigate to the matching section
    if (design.section !== currentSection) {
      if (navigateToSection) {
        // First navigate to the correct section
        navigateToSection(design.section);
        
        // Store the design data in sessionStorage to apply after navigation
        sessionStorage.setItem('pendingDesign', JSON.stringify(design));
        
        return;
      } else {
        console.log("Design section doesn't match current section and navigation isn't available");
        alert(
          `This design is for ${design.section === "section4" ? "Card View" : "Web View"} and cannot be applied to the current section.`
        );
        return;
      }
    }
    
    // Apply design if we're already on the right section
    applyDesignToCanvas(design);
  };
  
  // Function to apply design to canvas
  const applyDesignToCanvas = (design: DesignData) => {
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
  
        // Load design data onto the canvas
        targetCanvas.loadFromJSON(parsedData, () => {
          targetCanvas.renderAll();
         
          // Trigger delayed actions after timeout for Section 5
          if (design.section === "section5" && design.backgroundColorHex && onBackgroundColorChange) {
            onBackgroundColorChange(design.backgroundColorHex);
            
            setTimeout(() => {
              const bg = targetCanvas.getObjects().find(obj => (obj as any).isBackground);
              if (bg) {
                targetCanvas.sendObjectToBack(bg); // ensure it's behind everything
                targetCanvas.renderAll();
              }
            }, 200);
          }
        
          setTimeout(() => {
            if (design.section === "section4") {
              // Section 4: Add the card base on top
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
              
              // Ensure images & cardBase are properly ordered
              targetCanvas.sendObjectToBack(cardBase);
              targetCanvas.getObjects().forEach((obj) => {
                targetCanvas.bringObjectToFront(obj);
              });
              
              targetCanvas.sendObjectToBack(backgroundRect);
              targetCanvas.renderAll();
            }
          }, 100);
        });
      } catch (error) {
        console.error("Failed to load design data:", error);
      }
    }
  };
  
  // Check for pending design on component mount or section change
  useEffect(() => {
    const pendingDesignStr = sessionStorage.getItem('pendingDesign');
    if (pendingDesignStr) {
      try {
        const pendingDesign = JSON.parse(pendingDesignStr);
        // Only apply if we're on the right section now
        if (pendingDesign.section === currentSection) {
          // Apply the design
          applyDesignToCanvas(pendingDesign);
          // Clear the pending design
          sessionStorage.removeItem('pendingDesign');
        }
      } catch (error) {
        console.error("Error applying pending design:", error);
        sessionStorage.removeItem('pendingDesign');
      }
    }
  }, [currentSection]);

  const handleToolChange = (tool: string) => {
    setSelectedTool(tool);
    sessionStorage.setItem("selectedTool", tool);
  };

  // New function to handle design deletion
  const handleDeleteDesign = async (designId: string, section: "section4" | "section5", e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    setShowDeleteConfirm(designId);
  };

  const confirmDelete = async (designId: string, section: "section4" | "section5") => {
    try {
      setIsDeleting(true);
      const auth = getAuthClient();
      const db = getFirestoreClient();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Determine which collection to delete from based on section
      const collectionName = section === "section4" ? "card_view" : "card_web";
      
      // Delete the document
      await deleteDoc(doc(db, "users", user.uid, collectionName, designId));
      
      // Update the local state to remove the deleted design
      setDesigns(prevDesigns => prevDesigns.filter(design => design.id !== designId));
      
      // Close the confirmation dialog
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting design:", error);
      alert("Failed to delete design. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div
      className={`fixed right-0 top-23 shadow-md bg-gray-100 transition-all duration-300 h-[calc(100vh-5.75rem)] ${
        isExpanded ? "w-70" : "w-16"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-1/2 -left-6 bg-gray-300 p-2 rounded-full shadow-md z-10"
      >
        {isExpanded ? <FaChevronRight /> : <FaChevronLeft />}
      </button>
  
      <div className="flex h-full">
        {/* Sidebar Icons - Fixed */}
        <div className="w-16 h-full flex flex-col items-center pt-6 border-r">
          <div
            className={`flex flex-col items-center justify-center p-3 cursor-pointer mb-4 ${
              selectedTool === "gallery" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
            }`}
            onClick={() => handleToolChange("gallery")}
          >
            <BsImages size={24} className="mb-1" />
            <span className="text-xs text-center">Карт</span>
          </div>
  
          <div
            className={`flex flex-col items-center justify-center p-3 cursor-pointer ${
              selectedTool === "webview" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
            }`}
            onClick={() => handleToolChange("webview")}
          >
            <BsClipboardCheck size={24} className="mb-1" />
            <span className="text-xs text-center">Нэрийн хуудас</span>
          </div>
  
          <div
            className={`flex flex-col items-center justify-center p-3 cursor-pointer ${
              selectedTool === "templates" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
            }`}
            onClick={() => handleToolChange("templates")}
          >
            <AiOutlineAppstore size={24} className="mb-1" />
            <span className="text-xs text-center">Жишээ загвар</span>
          </div>
  
          <div
            className={`flex flex-col items-center justify-center p-3 cursor-pointer mb-4 ${
              selectedTool === "text" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
            }`}
            onClick={() => handleToolChange("text")}
          >
            <AiOutlineFontSize size={24} className="mb-1" />
            <span className="text-xs text-center">Текст</span>
          </div>
  
          <div
            className={`flex flex-col items-center justify-center p-3 cursor-pointer mb-4 ${
              selectedTool === "object" ? "text-orange-500" : "text-gray-700 hover:text-gray-900"
            }`}
            onClick={() => handleToolChange("object")}
          >
            <div className="w-6 h-6 rounded-full bg-red-400 text-white flex items-center justify-center mb-1">
              ✕
            </div>
            <span className="text-xs text-center">Устгах</span>
          </div>
        </div>
  
        {/* Expanded Panel - Scrollable Content */}
        {isExpanded && (
          <div className="flex-1 h-full overflow-hidden">
            <div className="p-4 overflow-y-auto h-full">
              {selectedTool === "object" ? (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-sm font-medium">Объект сонгох</p>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={() => {
                      const canvas = canvasRef.current;
                      const active = canvas?.getActiveObject();
                      if (canvas && active) {
                        canvas.remove(active);
                        canvas.discardActiveObject();
                        canvas.requestRenderAll();
                      }
                    }}
                  >
                    Сонгогдсон элементийг устгах
                  </button>
                </div>
              ) : selectedTool === "text" ? (
                <TextToolbar canvasRef={canvasRef} />
              ) : selectedTool === "background" && currentSection === "section5" ? (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Pick Background Color</label>
                  <IphoneBackground onColorChange={(color) => onBackgroundColorChange?.(color)} />
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500">Loading previews...</p>
                </div>
              ) : designs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500">No saved designs.</p>
                </div>
              ) : (
                <div className="space-y-3 pb-4"> {/* Added padding bottom for scrolling space */}
                  {designs.map((design) => (
                    <div
                      key={design.id}
                      className={`cursor-pointer border p-2 rounded-md transition-colors relative z-10 ${
                        design.section === currentSection
                          ? "hover:bg-gray-200"
                          : "hover:bg-blue-100"
                      }`}
                      onClick={() => handleDesignClick(design)}
                    >
                      {/* Design preview with delete button */}
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
                        
                        {/* Delete button - only show for user saved designs, not templates */}
                        {selectedTool !== "templates" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDesign(design.id, design.section, e);
                            }}
                            className="absolute top-[-8] right-[-8] flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors duration-200 shadow-md"
                            title="Delete item"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-center truncate">
                        Design {design.id.slice(0, 8)}
                        <span className="block text-xs italic">
                          {design.section === "section4" ? "(Card View)" : "(Web View)"}
                        </span>
                      </div>
                      
                      {/* Delete confirmation dialog */}
                      {showDeleteConfirm === design.id && (
                        <div 
                          className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-2 z-20 rounded-md"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <p className="text-sm font-medium text-center mb-2">Уствал бүр мөсөн устана, та итгэлтэй байна уу?</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(design.id, design.section);
                              }}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelDelete();
                              }}
                              className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
                              disabled={isDeleting}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;