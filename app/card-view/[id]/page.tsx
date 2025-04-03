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
        const parsedData = JSON.parse(cardData.canvasData);
        const originalWidth = 250;
        const originalHeight = 600;
        const screenWidth = window.innerWidth;
    
        const scale = screenWidth / originalWidth;
        const scaledHeight = originalHeight * scale;
    
        canvas.setWidth(screenWidth);
        canvas.setHeight(scaledHeight);
    
        canvas.loadFromJSON(parsedData, () => {
          // Scale all objects after loading
          canvas.getObjects().forEach((obj) => {
            obj.scaleX = (obj.scaleX || 1) * scale;
            obj.scaleY = (obj.scaleY || 1) * scale;
            obj.left = (obj.left || 0) * scale;
            obj.top = (obj.top || 0) * scale;
            obj.setCoords();
          });
    
          canvas.renderAll();
    
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
        canvasRef.current.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
        canvasRef.current.renderAll();
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