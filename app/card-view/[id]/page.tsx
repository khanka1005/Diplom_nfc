"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc} from "firebase/firestore";
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

    // Create the Fabric canvas
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
    selectable: false ,
    skipTargetFind:false
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
    // Wait for Fabric to finish applying styles
    requestAnimationFrame(() => {
      const upperCanvas = canvas.upperCanvasEl;
      if (upperCanvas) {
        upperCanvas.style.removeProperty("touch-action");
        upperCanvas.style.setProperty("touch-action", "manipulation", "important");
        upperCanvas.style.setProperty("-ms-touch-action", "manipulation", "important");
        upperCanvas.style.setProperty("WebkitTouchCallout", "none", "important");
      }
    });
    const handleTouch = (e: TouchEvent) => {
      if (!canvasRef.current || !canvasElRef.current) return;

      const canvas = canvasRef.current;
      const touch = e.touches[0];
      if (!touch) return;

      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent;

      const pointer = canvas.getPointer(simulatedEvent);
      const target = (canvas as any)._searchPossibleTargets(pointer, true);

      if (target && typeof target.fire === "function") {
        if (e.type === "touchstart") {
          target.fire("touchstart", { e });
        } else {
          target.fire("mousedown", { e });
        }
              // triggers touch-specific listeners
      }
      
    };
    // Attach listener
    canvasElRef.current.addEventListener("touchstart", handleTouch); 
    // Load from canvasData
    const loadCanvasState = async () => {
        try {
          const parsedData = JSON.parse(cardData.canvasData);
          canvas.loadFromJSON(parsedData, () => {        
            canvas.renderAll();
            setTimeout(() => {
              canvas.selection = false;
              
            
              canvas.discardActiveObject();
              canvas.forEachObject((obj) => {
                obj.selectable = false;
                obj.evented = true;
                obj.hoverCursor = obj.evented ? "pointer" : "default";
              
                const phone = (obj as any).phone;
                const email = (obj as any).email;
                const url = (obj as any).url;
              
                if (url) {
                  const openUrl = () => {
                    const a = document.createElement("a");
                    a.href = url.startsWith("http") ? url : `https://${url}`;
                    a.target = "_blank";
                    a.rel = "noopener noreferrer";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  };
                
                  obj.on("mousedown", openUrl);              // for mouse
                  obj.on("touchstart" as any, openUrl);      // for touch (iPhone)
                }
                
  
                if (phone) {
                  const openPhone = () => {
                    const a = document.createElement("a");
                    a.href = `tel:${phone}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  };
                  obj.on("mousedown", openPhone);
                  obj.on("touchstart" as any, openPhone);
                }
  
                if (email) {
                  const openEmail = () => {
                    const a = document.createElement("a");
                    a.href = `mailto:${email}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  };
                  obj.on("mousedown", openEmail);
                  obj.on("touchstart" as any, openEmail);
                }
  
                if (!obj.hoverCursor) {
                  obj.hoverCursor = "default";
                }
              });
              canvas.renderAll();
            }, 200); // Longer timeout to ensure complete loading
          });
        } catch (error) {
          console.error("Error parsing canvas JSON:", error);
          toast.error("Error loading card design");
        }
      };
      
      loadCanvasState();
  
    // Clean up
    return () => {
      canvas.dispose();
      if (canvasElRef.current) {
        canvasElRef.current.removeEventListener("touchstart", handleTouch);
      }
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
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
      <canvas ref={canvasElRef} className="w-full h-full" />
    </div>
  );
};

export default CardViewPage;