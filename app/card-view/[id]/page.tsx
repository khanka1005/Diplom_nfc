"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as fabric from "fabric";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type UserInfo = {
  name: string;
  profession: string;
  phone: string;
  email: string;
};

type CardData = {
  userId: string;
  timestamp: any;
  userInfo: UserInfo;
  canvasData: string;
  previewImage: string;
  backgroundColorHex?: string;
};

const CardViewPage = () => {
  const params = useParams();
  const cardId = params.id as string;

  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();
  const isProcessingClick = useRef(false);

  useEffect(() => {
    const fetchCardData = async () => {
      if (!cardId) {
        setError("No card ID provided");
        setLoading(false);
        return;
      }

      try {
        const cardRef = doc(db, "card_public", cardId);
        const cardSnapshot = await getDoc(cardRef);

        if (!cardSnapshot.exists()) {
          setError("Card not found");
          setLoading(false);
          return;
        }

        const data = cardSnapshot.data() as CardData;
        setCardData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching card data:", err);
        setError("Failed to load card data");
        setLoading(false);
      }
    };

    fetchCardData();
  }, [cardId, db]);

  useEffect(() => {
    if (!canvasElRef.current || !cardData) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      selectable: false,
      skipTargetFind: false,
    });

    fabric.Object.prototype.toObject = (function (toObject) {
      return function (this: fabric.Object, ...args: any[]) {
        const result = toObject.call(this, ...args);
        return {
          ...result,
          url: (this as any).url,
          phone: (this as any).phone,
          email: (this as any).email,
          vcard: (this as any).vcard,
        };
      };
    })(fabric.Object.prototype.toObject);

    canvasRef.current = canvas;

    // Disable zoom/pinch for better mobile handling
    requestAnimationFrame(() => {
      const upperCanvas = canvas.upperCanvasEl;
      if (upperCanvas) {
        upperCanvas.style.removeProperty("touch-action");
        upperCanvas.style.setProperty("touch-action", "manipulation", "important");
        upperCanvas.style.setProperty("-ms-touch-action", "manipulation", "important");
        (upperCanvas.style as any)["WebkitTouchCallout"] = "none";
        
        // Add additional styles to improve iOS Safari interaction
        (upperCanvas.style as any).cursor = "pointer";
        (upperCanvas.style as any)["-webkit-tap-highlight-color"] = "transparent";
      }
    });

    const loadCanvasState = async () => {
      try {
        // Set parent div background color first (this will show even if canvas is loading)
        if (cardData.backgroundColorHex && canvasElRef.current && canvasElRef.current.parentElement) {
          canvasElRef.current.parentElement.style.backgroundColor = cardData.backgroundColorHex;
        }
        
        const parsedData = JSON.parse(cardData.canvasData);
        const originalWidth = 250;
        const originalHeight = 600;
        const screenWidth = window.innerWidth;
        
        const scale = (screenWidth / originalWidth) * 0.7;
    
        // Set dimensions first
        canvas.setWidth(screenWidth);
        canvas.setHeight(originalHeight * scale);
        
        // Create a modified version of the JSON that preserves our background color
        const modifiedData = parsedData;
        
        // Load the modified JSON
        canvas.loadFromJSON(modifiedData, () => {
          // Apply zoom transformation to the entire canvas
          canvas.setZoom(scale);
          
          // Center horizontally from the top
          const horizontalOffset = (screenWidth - (originalWidth * scale)) / 2;
          canvas.viewportTransform[4] = horizontalOffset;
          canvas.viewportTransform[5] = 0; // Keep at top (y=0)
          
          // Force background color as an overlay background rectangle
          if (cardData.backgroundColorHex) {
            // First apply to canvas background
            canvas.backgroundColor = cardData.backgroundColorHex;
            
            // Then create a full-canvas background rectangle that's always behind everything
            const bgRect = new fabric.Rect({
              left: -horizontalOffset / scale,
              top: 0,
              width: screenWidth / scale,
              height: canvas.getHeight() / scale,
              fill: cardData.backgroundColorHex,
              selectable: false,
              evented: false,
              excludeFromExport: true,
            });
            
            // Add a special property to identify this as our background
            (bgRect as any).isBackground = true;
            
            // Add and send to back
            canvas.add(bgRect);
            canvas.sendObjectToBack(bgRect);
            
            // Also set canvas CSS background as fallback
            const canvasContainer = canvas.wrapperEl;
            if (canvasContainer) {
              canvasContainer.style.backgroundColor = cardData.backgroundColorHex;
            }
          }
          
          canvas.renderAll();
          const objectsWithVcard = canvas.getObjects().filter((obj) => (obj as any).vcard);
          if (objectsWithVcard.length > 0) {
            console.log("🧾 Found vCard object(s):", objectsWithVcard);
          } else {
            console.warn("❌ No vCard field found in any object.");
          }
          const parsed = JSON.parse(cardData.canvasData);

          // Check if any object contains the vcard field
          const hasVcard = parsed.objects.some((obj: any) => obj.vcard);
          
          console.log("vCard exists in canvasData:", hasVcard); // true or false
          
          if (hasVcard) {
            const vcardObject = parsed.objects.find((obj: any) => obj.vcard);
            console.log("📇 vCard content:", vcardObject.vcard);
          }

          setTimeout(() => {
            canvas.selection = false;
            canvas.discardActiveObject();
    
            // ... rest of your interaction logic remains unchanged
    

            type ActionType = "url" | "phone" | "email";
            const handleAction = (type: ActionType, value: string) => {
              // Prevent multiple rapid clicks
              if (isProcessingClick.current) return;
              isProcessingClick.current = true;
              
              // For iOS Safari compatibility
              try {
                if (type === "url") {
                  const finalUrl = value.startsWith("http") ? value : `https://${value}`;
                  // Safari-compatible way to open URLs
                  window.location.href = finalUrl;
                } else if (type === "phone") {
                  window.location.href = `tel:${value}`;
                } else if (type === "email") {
                  window.location.href = `mailto:${value}`;
                }
              } catch (e) {
                console.error("Navigation error:", e);
                toast.error("Failed to open link");
              }
              
              // Reset click processing state after a delay
              setTimeout(() => {
                isProcessingClick.current = false;
              }, 300);
            };
            
            // Remove any existing event listeners first
            canvas.off('mouse:down');
            
            // Add a tap/click event listener
            canvas.on('mouse:down', function(options) {
              if (!options.target) return;
              
              const obj = options.target;
              const phone = (obj as any).phone;
              const email = (obj as any).email;
              const url = (obj as any).url;
              const vcard = (obj as any).vcard;
              if (vcard) {
                // ✅ Download vCard (.vcf)
                const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "contact.vcf";
                a.click();
                URL.revokeObjectURL(url);
                return;
              }
              
              if (url) {
                handleAction("url", url);
              } else if (phone) {
                handleAction("phone", phone);
              } else if (email) {
                handleAction("email", email);
              }
            });

            // Make objects interactive but not selectable
            canvas.forEachObject((obj) => {
              obj.selectable = false;
              obj.evented = true;
              obj.hoverCursor = "pointer";
            });

            canvas.renderAll();
          }, 300);
        });
      } catch (err) {
        console.error("Error loading canvas JSON:", err);
        toast.error("Failed to render card design");
      }
    };

    loadCanvasState();

    // Handle resize for mobile responsiveness
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const scale = window.innerWidth / 250; // Original width
        
        canvas.setWidth(window.innerWidth);
        canvas.setHeight(600 * scale); // Original height * scale
        canvas.setZoom(scale);
        
        // Re-apply background color on resize
        if (cardData && cardData.backgroundColorHex) {
          canvas.backgroundColor = cardData.backgroundColorHex;
          
          // Find and update the background rectangle if it exists
          const bgRect = canvas.getObjects().find(obj => (obj as any).isBackground);
          if (bgRect) {
            bgRect.set({
              width: canvas.getWidth() / scale,
              height: canvas.getHeight() / scale
            });
          }
        }
        
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [cardData]);

  if (loading) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <p className="text-xl">Loading card...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen justify-center items-center overflow-hidden">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <canvas ref={canvasElRef} className="w-full h-full" />
      
    </div>
  );
};

export default CardViewPage;