"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as fabric from "fabric";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
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
    // Set full viewport background color as soon as data is available
    if (cardData?.backgroundColorHex && containerRef.current) {
      document.body.style.backgroundColor = cardData.backgroundColorHex;
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";
      document.documentElement.style.backgroundColor = cardData.backgroundColorHex;
      
      containerRef.current.style.backgroundColor = cardData.backgroundColorHex;
    }
  }, [cardData]);

  useEffect(() => {
    if (!canvasElRef.current || !cardData || !containerRef.current) return;

    // Ensure full viewport coverage with no gaps
    const fullWidth = window.innerWidth;
    const fullHeight = window.innerHeight;
    
    // Detect iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Setup canvas with proper dimensions
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: fullWidth,
      height: fullHeight,
      selectable: false,
      skipTargetFind: false,
    });

    canvasRef.current = canvas;

    // Extend fabric objects to include our custom properties
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

    // Improve touch handling on mobile
    requestAnimationFrame(() => {
      const upperCanvas = canvas.upperCanvasEl;
      if (upperCanvas) {
        upperCanvas.style.removeProperty("touch-action");
        upperCanvas.style.setProperty("touch-action", "manipulation", "important");
        upperCanvas.style.setProperty("-ms-touch-action", "manipulation", "important");
        (upperCanvas.style as any)["WebkitTouchCallout"] = "none";
        (upperCanvas.style as any).cursor = "pointer";
        (upperCanvas.style as any)["-webkit-tap-highlight-color"] = "transparent";
        
        // Apply iOS-specific fixes
        if (isIOS) {
          upperCanvas.style.position = "fixed";
          upperCanvas.style.top = "0";
          upperCanvas.style.left = "0";
        }
      }
      
      // Also style the canvas wrappers for iOS
      if (canvas.wrapperEl) {
        canvas.wrapperEl.style.position = "fixed";
        canvas.wrapperEl.style.top = "0";
        canvas.wrapperEl.style.left = "0";
        canvas.wrapperEl.style.width = "100%";
        canvas.wrapperEl.style.height = "100%";
        canvas.wrapperEl.style.margin = "0";
        canvas.wrapperEl.style.padding = "0";
      }
    });

    const loadCanvasState = async () => {
      try {
        // Apply background color to the entire viewport
       // Apply background color to the entire viewport
if (cardData.backgroundColorHex) {
  canvas.backgroundColor = cardData.backgroundColorHex;
  if (containerRef.current) {
    containerRef.current.style.backgroundColor = cardData.backgroundColorHex;
  }
  document.body.style.backgroundColor = cardData.backgroundColorHex;
}
        
        const parsedData = JSON.parse(cardData.canvasData);
        const originalWidth = 250;
        const originalHeight = 600;
        
        // Calculate scale to fit the entire device viewport
        const scaleWidth = fullWidth / originalWidth;
        const scaleHeight = fullHeight / originalHeight;
        const scale = Math.max(scaleWidth, scaleHeight) * 0.7; // Use the larger scale to ensure full coverage
        
        // Set dimensions to cover the entire viewport
        canvas.setWidth(fullWidth);
        canvas.setHeight(fullHeight);
        
        // Load the JSON data
        canvas.loadFromJSON(parsedData, () => {
          // Apply zoom transformation
          canvas.setZoom(scale);
          
          // Center horizontally
          const horizontalOffset = (fullWidth - (originalWidth * scale)) / 2;
          
          // For iOS: apply extra vertical offset to account for status bar and safe areas
          let verticalOffset = 0;
          if (isIOS) {
            verticalOffset = -20; // This negative value pushes content up to eliminate the gap
          }
          
          canvas.viewportTransform[4] = horizontalOffset;
          canvas.viewportTransform[5] = verticalOffset;
          
          // Create a full-viewport background rectangle
          const bgRect = new fabric.Rect({
            left: -horizontalOffset / scale,
            top: -verticalOffset / scale, // Compensate for the vertical offset
            width: fullWidth / scale + 100, // Add extra width for safe measure
            height: fullHeight / scale + 100, // Add extra height for safe measure
            fill: cardData.backgroundColorHex || "#ffffff",
            selectable: false,
            evented: false,
            excludeFromExport: true,
          });
          
          // Add a special property to identify this as our background
          (bgRect as any).isBackground = true;
          
          // Add and send to back
          canvas.add(bgRect);
          canvas.sendObjectToBack(bgRect);
          
          canvas.renderAll();
          
          // Check for vCard objects
          const objectsWithVcard = canvas.getObjects().filter((obj) => (obj as any).vcard);
          if (objectsWithVcard.length > 0) {
            console.log("🧾 Found vCard object(s):", objectsWithVcard);
          } else {
            console.warn("❌ No vCard field found in any object.");
          }
          
          const parsed = JSON.parse(cardData.canvasData);
          const hasVcard = parsed.objects.some((obj: any) => obj.vcard);
          
          console.log("vCard exists in canvasData:", hasVcard);
          
          if (hasVcard) {
            const vcardObject = parsed.objects.find((obj: any) => obj.vcard);
            console.log("📇 vCard content:", vcardObject.vcard);
          }

          setTimeout(() => {
            canvas.selection = false;
            canvas.discardActiveObject();
    
            type ActionType = "url" | "phone" | "email";
            const handleAction = (type: ActionType, value: string) => {
              // Prevent multiple rapid clicks
              if (isProcessingClick.current) return;
              isProcessingClick.current = true;
              
              try {
                if (type === "url") {
                  const finalUrl = value.startsWith("http") ? value : `https://${value}`;
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
              
              setTimeout(() => {
                isProcessingClick.current = false;
              }, 300);
            };
            
            // Remove any existing event listeners
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
                // Download vCard (.vcf)
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
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      // Original dimensions
      const originalWidth = 250;
      const originalHeight = 600;
      
      // Calculate new scale to fill the screen
      const scaleWidth = newWidth / originalWidth;
      const scaleHeight = newHeight / originalHeight;
      const scale = Math.max(scaleWidth, scaleHeight) * 0.7;
      
      // Update canvas dimensions
      canvas.setWidth(newWidth);
      canvas.setHeight(newHeight);
      canvas.setZoom(scale);
      
      // Recenter horizontally
      const horizontalOffset = (newWidth - (originalWidth * scale)) / 2;
      
      // Determine if iOS and apply vertical offset
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      let verticalOffset = 0;
      if (isIOS) {
        verticalOffset = -25; // Negative value to push up (eliminate gap)
      }
      
      canvas.viewportTransform[4] = horizontalOffset;
      canvas.viewportTransform[5] = verticalOffset;
      
      // Update background rectangle if it exists
      const bgRect = canvas.getObjects().find(obj => (obj as any).isBackground);
      if (bgRect) {
        bgRect.set({
          left: -horizontalOffset / scale,
          top: -verticalOffset / scale,
          width: newWidth / scale + 100,
          height: newHeight / scale + 100
        });
      }
      
      canvas.renderAll();
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
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div 
        ref={containerRef}
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{ backgroundColor: cardData?.backgroundColorHex || '#ffffff' }}
      >
        <ToastContainer position="bottom-right" autoClose={3000} />
        <canvas 
          ref={canvasElRef} 
          className="w-full h-full touch-manipulation" 
        />
      </div>
    </>
  );
};

export default CardViewPage;