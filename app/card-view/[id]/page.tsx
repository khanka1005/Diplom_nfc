"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc} from "firebase/firestore";
import * as fabric from "fabric";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
type SocialLink = {
  platform: string;
  url: string;
};

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
  socialLinks: SocialLink[];
  canvasData: string;
  previewImage: string;
};

const CardViewPage = () => {
  const params = useParams();
  const cardId = params.id as string;
  
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const profileFrameRef = useRef<fabric.Circle | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const db = getFirestore();

  // Social media icons mapping
  

  // Fetch card data from Firestore
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

  // Initialize canvas and load data once we have it
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
      
    // Add a background color
    const bgRect = new fabric.Rect({
      width: canvas.width!,
      height: canvas.height!,
      fill: "#2d1212",
      selectable: false,
      evented: false,
    });
    canvas.add(bgRect);


    canvasRef.current = canvas;

    // After initializing the canvas
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
        target.fire("mousedown", { e });
      }
    };
    // Attach listener
    canvasElRef.current.addEventListener("touchstart", handleTouch); 

    // Load from canvasData
    const loadCanvasState = async () => {
        try {
          const parsedData = JSON.parse(cardData.canvasData);
          canvas.loadFromJSON(parsedData, () => {
           
            addInteractiveElements(canvas);
            
            canvas.renderAll();
           
            setTimeout(() => {
             
              canvas.selection = false;
              
            
              canvas.discardActiveObject();
              canvas.forEachObject((obj) => {
                obj.selectable = false;
                obj.evented = true;
              
                // Maintain pointer cursor for interactive elements
                obj.hoverCursor = obj.evented ? "pointer" : "default";
              
                const phone = (obj as any).phone;
                const email = (obj as any).email;
                const url = (obj as any).url;
              
                if (url) {
                  const openUrl = () => {
                    const normalized = url.startsWith("http") ? url : `https://${url}`;
                    window.open(normalized, "_blank", "noopener,noreferrer");
                  };
                  obj.on("mousedown", openUrl);
                  obj.on("touchstart" as any, openUrl);
                }
              
                if (phone) {
                  const openPhone = () => {
                    window.location.href = `tel:${phone}`;
                  };
                  obj.on("mousedown", openPhone);
                  obj.on("touchstart" as any, openPhone);
                }
              
                if (email) {
                  const openEmail = () => {
                    window.location.href = `mailto:${email}`;
                  };
                  obj.on("mousedown", openEmail);
                  obj.on("touchstart" as any, openEmail);
                }
              
                if (!obj.hoverCursor) {
                  obj.hoverCursor = "default";
                }
              });
              
              
              
              // Final render
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

  
  // Ensure the canvas is responsive
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      
      // Resize background rectangle
      const bgRect = canvas.getObjects().find(obj => obj.type === 'rect' && obj.fill === '#2d1212');
      if (bgRect) {
        bgRect.set({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
      
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add interactive elements (call, email, social links)
  const addInteractiveElements = (canvas: fabric.Canvas) => {
    if (!cardData) return;
    
    const { userInfo, socialLinks } = cardData;

    // Position constants
    const centerX = canvas.width! / 2;
    const startY = 350;

    // Profile frame circle
    const profileFrame = new fabric.Circle({
      radius: 60,
      fill: "#000000",
      stroke: "#ffffff",
      strokeWidth: 4,
      left: centerX,
      top: 80,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });
    canvas.add(profileFrame);
    profileFrameRef.current = profileFrame;

    // Name text
    const nameText = new fabric.Text(userInfo.name, {
      left: centerX,
      top: 160,
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      originX: "center",
      fill: "#ffffff",
      selectable: false,
    });
    canvas.add(nameText);

    // Profession text
    const professionText = new fabric.Text(userInfo.profession, {
      left: centerX,
      top: 190,
      fontSize: 16,
      textAlign: "center",
      originX: "center",
      fill: "#ffffff",
      selectable: false,
    });
    canvas.add(professionText);

    // Call button
    const callButton = new fabric.Rect({
      width: 100,
      height: 40,
      fill: "#4CAF50",
      rx: 10,
      ry: 10,
      left: centerX - 55,
      top: 230,
      selectable: false,
      evented: true,
    });
    const callText = new fabric.Text("Call", {
      left: centerX - 55 + 50,
      top: 245,
      fontSize: 16,
      fill: "#fff",
      originX: "center",
      selectable: false,
      evented: false,
    });

    // Email button
    const emailButton = new fabric.Rect({
      width: 100,
      height: 40,
      fill: "#007bff",
      rx: 10,
      ry: 10,
      left: centerX + 55,
      top: 230,
      selectable: false,
      evented: true,
    });
    const emailText = new fabric.Text("Email", {
      left: centerX + 55 + 50,
      top: 245,
      fontSize: 16,
      fill: "#fff",
      originX: "center",
      selectable: false,
      evented: false,
    });

    // On-click for call & email
    const handleCall = () => {
      if (userInfo.phone) window.open(`tel:${userInfo.phone}`);
    };
    callButton.on("mousedown", handleCall);
    callButton.on("touchstart" as any, handleCall);
    
    const handleEmail = () => {
      if (userInfo.email) window.open(`mailto:${userInfo.email}`);
    };
    emailButton.on("mousedown", handleEmail);
    emailButton.on("touchstart" as any, handleEmail);
    

    // "Save Contact" button
    const saveContactButton = new fabric.Rect({
      width: 160,
      height: 40,
      fill: "#6c757d",
      rx: 10,
      ry: 10,
      left: centerX,
      top: startY + 60,
      originX: "center",
      selectable: false,
      evented: true,
    });
    const saveContactText = new fabric.Text("Save Contact", {
      left: centerX,
      top: startY + 75,
      fontSize: 16,
      fill: "#fff",
      originX: "center",
      selectable: false,
      evented: false,
    });

    saveContactButton.on("mousedown", () => {
      generateVCard(userInfo);
    });

    // Add buttons and text to canvas
    canvas.add(
      callButton,
      callText,
      emailButton,
      emailText,
      saveContactButton,
      saveContactText
    );
    
    canvas.renderAll();
  };

  // Generate and download vCard
  const generateVCard = (userInfo: UserInfo) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${userInfo.name}
TITLE:${userInfo.profession}
TEL:${userInfo.phone}
EMAIL:${userInfo.email}
END:VCARD`;

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${userInfo.name}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

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