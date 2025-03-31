"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { getFirestore, collection, addDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toolbar from "./Toolbar";

type Section5Props = {
  canvasState?: string; // Prop to receive canvas state (JSON or Base64)
  onCanvasUpdate?: (state: string) => void; // Callback to send canvas updates to parent
};

const Section5 = ({ canvasState, onCanvasUpdate }: Section5Props) => {
  const canvasRef2 = useRef<fabric.Canvas | null>(null);
  const iphoneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const profileFrameRef = useRef<fabric.Circle | null>(null);
  const socialLinksRef = useRef<fabric.Text[]>([]);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null); 
  const [socialLinks, setSocialLinks] = useState({
    Instagram: "",
    Facebook: "",
    Twitter: "",
  });

  const [tempLinks, setTempLinks] = useState(socialLinks);
  const db = getFirestore();
  const auth = getAuth();
  const bgRectRef = useRef<fabric.Rect | null>(null);

  

  // Load canvas state if provided via prop
  useEffect(() => {
    if (!iphoneCanvasRef.current) return;

    const iphoneCanvas = new fabric.Canvas(iphoneCanvasRef.current, {
      width: 300,
        height: 800,
    });
    const bgRect = new fabric.Rect({
      width: iphoneCanvas.width!,
      height: iphoneCanvas.height!,
      fill: '#832626',
      selectable: false,
      evented: false,
    });
    (bgRect as any).excludeFromExport = true;

    iphoneCanvas.add(bgRect);
    
    canvasRef2.current = iphoneCanvas;
    fabricCanvasRef.current = iphoneCanvas;

    const profileFrame = new fabric.Circle({
      radius: 60,
      fill: "#433b3bf",
      left: 75,
      top: 20,
      selectable: false,
      evented: false,
    });
    iphoneCanvas.add(profileFrame);
    profileFrameRef.current = profileFrame;

    const introText = new fabric.Textbox("Your Introduction Here", {
      left: 40,
      top: 180,
      width: 200,
      fontSize: 16,
      textAlign: "center",
      editable: true,
    });
    iphoneCanvas.add(introText);

    addSocialLinks(iphoneCanvas);

    // Load from canvasState prop if available
    const loadCanvasState = async () => {
      if (canvasState) {
        try {
          const parsedData = JSON.parse(canvasState); // Try parsing as JSON
          iphoneCanvas.loadFromJSON(parsedData, () => {
            iphoneCanvas.renderAll();
          });
        } catch (error) {
          console.error("Error parsing canvas JSON:", error);
        }
      }
    };
    loadCanvasState();

    iphoneCanvas.on("object:modified", () => {
      if (onCanvasUpdate) {
        onCanvasUpdate(JSON.stringify(iphoneCanvas.toJSON()));
      }
    });
    setTimeout(() => {
      iphoneCanvas.getObjects().forEach((obj) => {
        iphoneCanvas.bringObjectToFront(obj); // Bring all objects to the front
      });
      iphoneCanvas.sendObjectToBack(bgRect); // Send background to the back
      iphoneCanvas.renderAll();
    }, 100);
    return () => {
      iphoneCanvas.dispose();
    };
  }, [canvasState]);

  // Add social links to the canvas
  const addSocialLinks = (canvas: fabric.Canvas) => {
    socialLinksRef.current.forEach((link) => canvas.remove(link));
    socialLinksRef.current = [];

    Object.entries(socialLinks).forEach(([name, url], index) => {
      const linkText = new fabric.Text(name, {
        left: 80,
        top: 250 + index * 30,
        fontSize: 16,
        fill: "#000",
        fontWeight: "bold",
        selectable: false,
        evented: true,
      });

      linkText.on("mouseup", () => {
        if (url) {
          const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
          window.open(formattedUrl, "_blank");
          toast.info(`Opening ${name} link...`);
        } else {
          toast.warning(`No URL provided for ${name}`);
        }
      });

      canvas.add(linkText);
      socialLinksRef.current.push(linkText);
    });

    canvas.renderAll();
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas || !profileFrameRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;

      fabric.Image.fromURL(e.target.result as string, {
        crossOrigin: "anonymous",
      }).then((img) => {
        img.scaleToWidth(140);
        img.scaleToHeight(140);
        img.set({
          left: profileFrameRef.current!.left,
          top: profileFrameRef.current!.top,
          clipPath: new fabric.Circle({
            radius: 60,
            left: 75,
            top: 20,
            absolutePositioned: true,
          }),
        });

        canvas.add(img);
        canvas.renderAll();
        toast.success("Profile image uploaded successfully!");
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle social links save
  const handleSaveLinks = () => {
    setSocialLinks(tempLinks);
    if (fabricCanvasRef.current) {
      addSocialLinks(fabricCanvasRef.current);
      toast.success("Links saved successfully!");
    }
  };

  // Sync canvas to web (Firestore)
  const handleSyncToWeb = async () => {
    if (!canvasRef2.current) return;
    const canvas=canvasRef2.current;
    // Generate the JSON representation of the canvas
    const json = canvasRef2.current.toJSON();
    if (!json) {
      toast.error("Failed to generate canvas JSON");
      return;
    }
  
    // Log the JSON object for debugging
    console.log("Canvas JSON:", json);
  
    // Ensure the JSON object is valid and does not contain undefined values
    const sanitizedJson = {
      version: json.version,
      objects: json.objects.filter((obj: any) => !obj.excludeFromExport),
    };
 // Remove undefined values
  
    // Log the sanitized JSON object for debugging
    console.log("Sanitized Canvas JSON:", sanitizedJson);
  
    // Validate socialLinks
    const sanitizedSocialLinks = { ...socialLinks };
    Object.keys(sanitizedSocialLinks).forEach((key) => {
      if (sanitizedSocialLinks[key as keyof typeof socialLinks] === undefined) {
        sanitizedSocialLinks[key as keyof typeof socialLinks] = ""; // Replace undefined with an empty string
      }
    });
  
    // Log the sanitized socialLinks for debugging
    console.log("Sanitized Social Links:", sanitizedSocialLinks);


    const previewImage = canvas.toDataURL({
      format: "png", // specify the format as "png"
      quality: 1,
      multiplier: 1,
    });

    
    // Call the onCanvasUpdate callback if provided
    if (onCanvasUpdate) {
      const updatedState = JSON.stringify(sanitizedJson);
      onCanvasUpdate(updatedState);
    }
  
    // Save to Firestore under user ID
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not authenticated");
        return;
      }
  
      const userRef = doc(db, "users", user.uid);
      await addDoc(collection(userRef, "card_web"), {
        userId: user.uid,
        timestamp: new Date(),
        socialLinks: sanitizedSocialLinks, // Use sanitized socialLinks
        canvasData: JSON.stringify(sanitizedJson), // Ensure canvasData is a string
        previewImage: previewImage,
      });
  
      toast.success("Canvas and links saved under user ID in Firestore!");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      toast.error("Failed to save data.");
    }
  };

  return (
    <div className="flex w-[80vw] h-[500px] justify-center items-center gap-6 mb-30 mt-30">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />

      <div
        className="relative w-[300px] h-[650px] rounded-[40px] overflow-hidden"
        style={{
          backgroundImage: `url(/iphoneBase.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex justify-center items-center p-6">
        <div className="w-[290px] h-[550px] overflow-y-auto rounded-[30px] shadow-inner bg-white relative z-0">
    <canvas ref={iphoneCanvasRef} width={300} height={800} />
</div>

        </div>
      </div>

      <div className="w-[25%] flex flex-col items-center p-6 border-l-2 border-gray-300">
        <h2 className="text-lg font-semibold mb-4">Upload & Links</h2>

        <input type="file" accept="image/*" onChange={handleImageUpload} className="border p-2 rounded-md cursor-pointer mb-4 w-full" />

        {Object.keys(socialLinks).map((key) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm font-medium">{key} URL</label>
            <input
              type="text"
              value={tempLinks[key as keyof typeof socialLinks]}
              onChange={(e) => setTempLinks({ ...tempLinks, [key]: e.target.value })}
              className="border p-2 rounded-md w-full"
            />
          </div>
        ))}
        <button onClick={handleSaveLinks} className="bg-gray-800 text-white px-4 py-2 rounded-md mt-2 w-80">Линк хадгалах</button>
        <button onClick={handleSyncToWeb} className="bg-gray-800 text-white px-4 py-2 rounded-md mt-2 w-80">Загвар хадгалах</button>
      </div>
      <Toolbar canvasRef={canvasRef2} canvasRef2={canvasRef2} currentSection="section5" />
    </div>
  );
};

export default Section5;