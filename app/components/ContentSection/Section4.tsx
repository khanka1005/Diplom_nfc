"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { collection, addDoc, enableNetwork } from "firebase/firestore";

import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import Toolbar from "./Toolbar";
import { onAuthStateChanged } from "firebase/auth";

// Preserve custom properties like `isCardBase` during serialization
(fabric.Object.prototype as any).toObject = (function (toObject) {
  return function (this: fabric.Object, ...args: any[]) {
    return {
      ...toObject.apply(this, args),
      isCardBase: (this as any).isCardBase || undefined,
    };
  };
})((fabric.Object.prototype as any).toObject);

(fabric.Object.prototype as any).initialize = (function (initialize) {
  return function (this: fabric.Object, options: any, ...args: any[]) {
    initialize.apply(this, [options, ...args]);
    if (options?.isCardBase !== undefined) {
      (this as any).isCardBase = options.isCardBase;
    }
  };
})((fabric.Object.prototype as any).initialize);

type Section4Props = {
  canvasState?: string; // Base64 image or JSON string of canvas state
  onCanvasUpdate?: (state: string) => void; // Callback to send updates to parent
  navigateToSection: (sectionName: string) => void; // Add this prop
  currentSection: string; // Add this prop
};

const Section4 = ({ canvasState, onCanvasUpdate, navigateToSection, currentSection }: Section4Props) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const brandTextRef = useRef<fabric.Textbox | null>(null);
  const cardBaseRef = useRef<fabric.Rect | null>(null);
  const backgroundRef = useRef<fabric.Rect | null>(null);

  const [saving, setSaving] = useState(false);

  // First useEffect: Initialize canvas
  useEffect(() => {
    if (!canvasElementRef.current) return;

    const canvas = new fabric.Canvas(canvasElementRef.current, {
      backgroundColor: "transparent",
      selection: true,
    });

    canvasRef.current = canvas;

    const backgroundRect = new fabric.Rect({
      width: 700,
      height: 500,
      fill: "#a8a6a6",
      selectable: false,
      evented: false,
    });

    const cardBase = new fabric.Rect({
      width: 500,
      height: 300,
      fill: "white",
      rx: 20,
      ry: 20,
      shadow: new fabric.Shadow({ color: "#000", blur: 1, offsetX: 0, offsetY: 0 }),
      selectable: false,
      evented: false,
      isCardBase: true,
    });

    const centerX = (canvas.width || 0) / 2;
    const centerY = (canvas.height || 0) / 2;

    backgroundRect.set({ left: centerX - 350, top: centerY - 250 });
    cardBase.set({ left: centerX - 250, top: centerY - 150 });

    canvas.add(backgroundRect, cardBase);
    canvas.sendObjectToBack(backgroundRect);
    backgroundRef.current = backgroundRect;
    cardBaseRef.current = cardBase;

    const brandText = new fabric.Textbox("My Brand", {
      left: 130,
      top: 120,
      fontSize: 26,
      fontWeight: "bold",
      fill: "black",
      editable: true,
    });
    canvas.add(brandText);
    brandTextRef.current = brandText;

    canvas.on("object:modified", () => {
      if (onCanvasUpdate) onCanvasUpdate(JSON.stringify(canvas.toJSON()));
    });

    // Add event listeners for selection to ensure controls are displayed
    canvas.on("selection:created", () => {
      console.log("Selection created");
      canvas.requestRenderAll();
    });
    
    canvas.on("selection:updated", () => {
      console.log("Selection updated");
      canvas.requestRenderAll();
    });

    return () => {
      canvas.dispose();
    };
  }, []); // ✅ Runs once to initialize canvas

  // Second useEffect: Handle loading canvas state
  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (!canvas || !canvasState) {
      console.log("Waiting for canvas and canvas state to be ready...");
      return;
    }
    
    console.log("🔄 Loading canvas state...");
    
    const loadCanvasState = async () => {
      try {
        const json = JSON.parse(canvasState);
        console.log("🧠 Parsed canvas JSON state");
        
        // Clear any existing content first
        canvas.clear();
        
        // Restore background and card base first
        if (backgroundRef.current) canvas.add(backgroundRef.current);
        if (cardBaseRef.current) canvas.add(cardBaseRef.current);
        
        // Load JSON state
        canvas.loadFromJSON(json, () => {
          console.log("✅ Canvas loaded from JSON");
          
          // Ensure background is at the back
          if (backgroundRef.current) canvas.sendObjectToBack(backgroundRef.current);
          
          // Process all objects, focusing on images
          canvas.getObjects().forEach(obj => {
            if (obj.type === "image") {
              const img = obj as fabric.Image;
              
              console.log("🖼️ Processing image object");
              
              // Configure image properties
              img.set({
                hasControls: true,
                hasBorders: false,
                selectable: true,
              });
              
              // Create or update delete control
              if (!img.controls) img.controls = {};
              
              img.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: -10,
                offsetX: 10,
                cursorStyle: 'pointer',
                mouseUpHandler: (_, transform) => {
                  console.log("🗑️ Delete clicked on image");
                  canvas.remove(transform.target);
                  canvas.requestRenderAll();
                  return true;
                },
                render: (ctx, left, top) => {
                  ctx.save();
                  ctx.translate(left, top);
                  ctx.fillStyle = "#ff4d4d";
                  ctx.beginPath();
                  ctx.arc(0, 0, 8, 0, 2 * Math.PI);
                  ctx.fill();
                  ctx.fillStyle = "white";
                  ctx.font = "12px sans-serif";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillText("✕", 0, 1);
                  ctx.restore();
                },
              });
              
              // Update coordinates
              img.setCoords();
            }
          });
          
          // Bring brand text to front if it exists
          if (brandTextRef.current && canvas.contains(brandTextRef.current)) {
            canvas.bringObjectToFront(brandTextRef.current);
          }
          
          // Select first image to show controls
          const firstImage = canvas.getObjects().find(o => o.type === "image");
          if (firstImage) {
            console.log("🎯 Selecting first image to show controls");
            canvas.setActiveObject(firstImage);
          } else {
            console.log("⚠️ No images found to select");
          }
          
          // Force render
          canvas.requestRenderAll();
        });
      } catch (err) {
        console.warn("⚠️ canvasState is not JSON, trying as base64", err);
        try {
          canvas.clear();
          
          // Restore background and card base
          if (backgroundRef.current) canvas.add(backgroundRef.current);
          if (cardBaseRef.current) canvas.add(cardBaseRef.current);
          
          // Load the base64 image
          const img = await fabric.Image.fromURL(canvasState);
          img.scaleToWidth(canvas.width || 300);
          img.scaleToHeight(canvas.height || 300);
          
          // Set up delete control for this image
          img.controls = {
            ...fabric.Object.prototype.controls,
            deleteControl: new fabric.Control({
              x: 0.5,
              y: -0.5,
              offsetY: -10,
              offsetX: 10,
              cursorStyle: 'pointer',
              mouseUpHandler: (_, transform) => {
                canvas.remove(transform.target);
                canvas.requestRenderAll();
                return true;
              },
              render: (ctx, left, top) => {
                ctx.save();
                ctx.translate(left, top);
                ctx.fillStyle = "#ff4d4d";
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = "white";
                ctx.font = "12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("✕", 0, 1);
                ctx.restore();
              },
            }),
          };
          
          canvas.add(img);
          
          // Send image to back if it's a background
          if (backgroundRef.current) canvas.sendObjectToBack(backgroundRef.current);
          
          // Bring brand text to front if it exists
          if (brandTextRef.current) canvas.bringObjectToFront(brandTextRef.current);
          
          canvas.requestRenderAll();
        } catch (error) {
          console.error("❌ Failed to load image:", error);
        }
      }
    };
    
    loadCanvasState();
  }, [canvasState]); // Only run when canvasState changes

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
  
    const canvas = canvasRef.current;
    const cardBase = cardBaseRef.current;
    if (!canvas || !cardBase) return;
  
    const centerX = (canvas.width || 0) / 2;
    const centerY = (canvas.height || 0) / 2;
  
    for (const file of files) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) resolve(e.target.result as string);
          else reject("Failed to read image");
        };
        reader.readAsDataURL(file);
      });
  
      const img = await fabric.Image.fromURL(base64, { crossOrigin: "anonymous" });
  
      img.scaleToWidth(cardBase.width! * 0.8);
      img.scaleToHeight(cardBase.height! * 0.8);
      img.set({
        left: cardBase.left,
        top: cardBase.top,
        hasControls: true,
          hasBorders: false,
          selectable: true,
        clipPath: new fabric.Rect({
          width: cardBase.width!,
          height: cardBase.height!,
          left: centerX - cardBase.width! / 2,
          top: centerY - cardBase.height! / 2,
          rx: 20,
          ry: 20,
          absolutePositioned: true,
        }),
      });
      img.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: -10,
        offsetX: 10,
        cursorStyle: 'pointer',
        mouseUpHandler: (eventData, transform) => {
          canvas.remove(transform.target);
          canvas.requestRenderAll();
          return true;
        },
        render: (ctx, left, top) => {
          const size = 16;
          ctx.save();
          ctx.translate(left, top);
          ctx.fillStyle = '#ff4d4d';
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✕', 0, 1);
          ctx.restore();
        },
      });
  
      canvas.add(img);           // Add to canvas
      canvas.bringObjectToFront(img);  // Put on top of previous image
  
      if (brandTextRef.current) {
        canvas.bringObjectToFront(brandTextRef.current); // Keep brand always on top
      }
    }
  
    canvas.renderAll();
  };

  const handleSaveToFirestore = async () => {
    const auth = getAuthClient();
    const db = getFirestoreClient();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !canvasRef.current) {
        setSaving(false);
        return;
      }

      setSaving(true);

      try {
        // ✅ Force Firestore online (in case it's in offline mode)
      
      } catch (err) {
        console.warn("⚠️ Firestore enableNetwork failed:", err);
      }

      const canvas = canvasRef.current;

      const filteredObjects = canvas.getObjects().filter((obj) => {
        return !(obj as any).isCardBase && obj !== backgroundRef.current;
      });

      const filteredJsonState = JSON.stringify({
        ...canvas.toJSON(),
        objects: filteredObjects,
      });

      const previewImage = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      });

      try {
        const cardId = uuidv4();

        await addDoc(collection(db, "users", user.uid, "card_view"), {
          id: cardId,
          cardBase: filteredJsonState,
          previewImage: previewImage,
          createdAt: new Date().toISOString(),
        });

        alert("Card saved successfully!");
      } catch (error) {
        console.error("Error saving card:", error);
        alert("Failed to save card.");
      } finally {
        setSaving(false);
        unsubscribe();
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-xl font-bold pt-4">NFC картын загвараа хийнэ үү!</h2>
      <canvas ref={canvasElementRef} width={745} height={545} />

      {/* Updated file upload section */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-125 h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG</p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
        </label>
      </div>

      <button
        onClick={handleSaveToFirestore}
        disabled={saving}
        className="px-4 py-2 bg-gray-800 text-white w-125 rounded-md hover:bg-blue-600"
      >
        {saving ? "Загвар хадгалж байна..." : "Загвар хадгалах"}
      </button>

      {/* Pass canvasRef and navigateToSection to Toolbar */}
      <Toolbar 
        canvasRef={canvasRef} 
        canvasRef2={canvasRef} 
        currentSection={currentSection as "section4" | "section5"} 
        navigateToSection={navigateToSection}
      />
    </div>
  );
};

export default Section4;