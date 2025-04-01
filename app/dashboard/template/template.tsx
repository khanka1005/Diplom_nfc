"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {  collection, addDoc,getDoc, doc } from "firebase/firestore";

import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import Toolbar from "@/app/components/ContentSection/Toolbar";

type Section4Props = {
    canvasState?: string; // Base64 image or JSON string of canvas state
    onCanvasUpdate?: (state: string) => void; // Callback to send updates to parent
  };
const Template = ({ canvasState, onCanvasUpdate }: Section4Props) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const brandTextRef = useRef<fabric.Text | null>(null);
  const cardBaseRef = useRef<fabric.Rect | null>(null);
  const backgroundRef = useRef<fabric.Rect | null>(null);

  const [saving, setSaving] = useState(false);
  const auth = getAuthClient();
  const db = getFirestoreClient();
  
  useEffect(() => {
    if (!canvasElementRef.current) return;

    const canvas = new fabric.Canvas(canvasElementRef.current, {
      backgroundColor: "transparent",
      selection: true, // Enable selection
    });

    canvasRef.current = canvas;

    // Create the gray background (slightly larger than card base)
  const backgroundRect = new fabric.Rect({
    width: 700, // Slightly larger than the card base
    height: 500, // Slightly larger than the card base
    fill: "#a8a6a6",
   
    selectable: false,
    evented: false,
  });

    // Create the rounded card base
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
    const centerX = (canvas.width || 0) / 2;
  const centerY = (canvas.height || 0) / 2;

  backgroundRect.set({
    left: centerX - backgroundRect.width! / 2,
    top: centerY - backgroundRect.height! / 2,
  });

  cardBase.set({
    left: centerX - cardBase.width! / 2,
    top: centerY - cardBase.height! / 2,
  });
    canvas.add(backgroundRect);
    canvas.add(cardBase);
    cardBaseRef.current = cardBase;
    backgroundRef.current = backgroundRect;
    canvas.sendObjectToBack(backgroundRect);

    // Brand text always visible
    const brandText = new fabric.Text("My Brand", {
      left: 130,
      top: 120,
      fontSize: 26,
      fontWeight: "bold",
      fill: "black",
      selectable: true,
      
    });

    const loadCanvasState = async () => {
        if (canvasState) {
          try {
            const jsonState = JSON.parse(canvasState); // Try to parse as JSON
            canvas.loadFromJSON(jsonState, () => {
              canvas.renderAll();
            });
          } catch {
            console.warn("Canvas state is not JSON, treating as Base64 image.");
  
            // Clear existing canvas
            canvas.clear();
  
            try {
              const img = await fabric.Image.fromURL(canvasState);
              img.scaleToWidth(canvas.width || 300);
              img.scaleToHeight(canvas.height || 300);
              canvas.add(img);
              canvas.renderAll();
            } catch (error) {
              console.error("Failed to load image:", error);
            }
          }
        }
      };
  
      loadCanvasState(); // Call async function inside useEffect
  
      canvas.on("object:modified", () => {
        if (onCanvasUpdate) {
          onCanvasUpdate(JSON.stringify(canvas.toJSON()));
        }
      });

   

    canvas.add(brandText);
    brandTextRef.current = brandText;

    // Attach global event listener for clicks outside the canvas
   

    return () => {
      // Clean up event listener and canvas
     canvas.discardActiveObject();
      canvas.dispose();
    };
  }, );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const canvas = canvasRef.current;
    const cardBase = cardBaseRef.current;
    
    const backgroundRect = canvas?.getObjects().find(obj => obj instanceof fabric.Rect && obj.fill === "gray");

    if (!canvas || !cardBase) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result || !canvasRef.current) return;

      try {
        const img = await fabric.Image.fromURL(e.target.result as string, { crossOrigin: "anonymous" });

        const centerX = (canvas.width || 0) / 2;
        const centerY = (canvas.height || 0) / 2;

        img.scaleToWidth(cardBase.width! * 0.8);
        img.scaleToHeight(cardBase.height! * 0.8);
        img.set({
          left: cardBase.left,
          top: cardBase.top,
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

        // Ensure correct layering order
        canvas.add(img);
        canvas.setActiveObject(img);

        // Send background to back
        if (backgroundRect) {
          canvas.sendObjectToBack(backgroundRect);
        }

        // Keep card base above background
        if (cardBaseRef.current) {
          canvas.bringObjectToFront(cardBaseRef.current);
        }

        // Keep image above the card base
        canvas.bringObjectToFront(img);

        // Keep brand text at the very front
        if (brandTextRef.current) {
          canvas.bringObjectToFront(brandTextRef.current);
        }

        // Force full re-render
        canvas.renderAll();
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    };

    reader.readAsDataURL(file);
};


const handleSaveToFirestore = async () => {
    if (!canvasRef.current || !auth.currentUser) return;
  
    setSaving(true);
    const canvas = canvasRef.current;
    const user = auth.currentUser;
  
    // Get the objects from the canvas and exclude the cardBase (fixed background)
    const filteredObjects = canvas.getObjects().filter((obj) => {
      return obj !== cardBaseRef.current && obj !== backgroundRef.current;
    });
  
    // Create a new JSON object for saving that does not include the cardBase
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
      // Generate a unique card ID
      const cardId = uuidv4();
  
      // Check if the user is an admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isAdmin = userDoc.exists() && userDoc.data().isAdmin;
  
      // Choose collection based on user role
      const collectionPath = isAdmin
        ? "templates" // Admin templates
        : `users/${user.uid}/card_view`; // User-specific cards
  
      await addDoc(collection(db, collectionPath), {
        id: cardId,
        cardBase: filteredJsonState,
        previewImage,
        createdAt: new Date().toISOString(),
      });
  
      alert("Card saved successfully!");
    } catch (error) {
      console.error("Error saving card:", error);
      alert("Failed to save card.");
    } finally {
      setSaving(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-xl font-bold pt-40-">NFC картын загвараа хийнэ үү!</h2>
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

      
      <Toolbar canvasRef={canvasRef} canvasRef2={canvasRef} currentSection="section4" />
    </div>
  );
};

export default Template;