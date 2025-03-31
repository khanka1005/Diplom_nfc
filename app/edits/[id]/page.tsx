"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import * as fabric from "fabric";

export default function EditPageSection5() {
  const [canvasState, setCanvasState] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
  const params = useParams();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (!params?.id) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid, "card_web", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.canvasData) {
            setCanvasState(data.canvasData);
          } else {
            setError("Invalid card data format");
          }
        } else {
          setError("Design not found");
          setTimeout(() => router.push("/"), 3000);
        }
      } catch (error) {
        console.error("Error loading design:", error);
        setError("Failed to load design");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [params?.id, router]);

  useEffect(() => {
    if (!canvasElementRef.current || !canvasState) return;

    const canvas = new fabric.Canvas(canvasElementRef.current, {
      backgroundColor: "transparent",
      selection: false,
    });

    (async () => {
      try {
        // Load the base64 image
        const img = await fabric.Image.fromURL(canvasState, {});
        
        // Calculate scaling to fit the canvas better
        // Using 80% of canvas width or height while maintaining aspect ratio
        const canvasWidth = canvas.width || 800;
        const canvasHeight = canvas.height || 1000;
        
        const scaleFactor = Math.min(
          (canvasWidth * 0.8) / img.width,
          (canvasHeight * 0.8) / img.height
        );
        
        img.scale(scaleFactor);
        
        // Center the image on the canvas
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center'
        });
        
        canvas.add(img);
        canvas.renderAll();
      } catch (error) {
        console.error("Failed to load card image:", error);
      }
    })();

    return () => {
      canvas.dispose();
    };
  }, [canvasState]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
        {error === "Design not found" && <p>Redirecting to home page...</p>}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <canvas ref={canvasElementRef} width={800} height={1000} />
    </div>
  );
}