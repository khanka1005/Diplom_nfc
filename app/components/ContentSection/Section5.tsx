"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {  collection, addDoc, doc, enableNetwork } from "firebase/firestore";

import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toolbar from "./Toolbar";
import {
  BsPersonVcard,
  BsPlus,
  BsFacebook,
  BsInstagram,
  BsTwitter,
  BsLinkedin,
  BsYoutube,
  BsTiktok,
  BsPinterest,
  BsSnapchat,
  BsGithub,
  BsWhatsapp,
  BsChevronDown,
} from "react-icons/bs";
import { FabricImage } from "fabric";
import { onAuthStateChanged } from "firebase/auth";

type Section5Props = {
  canvasState?: string;
  onCanvasUpdate?: (state: string) => void;
};

type SocialLink = {
  platform: string;
  url: string;
  icon: React.ElementType;
};

const Section5 = ({ canvasState, onCanvasUpdate }: Section5Props) => {
  const canvasRef2 = useRef<fabric.Canvas | null>(null);
  const iphoneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const profileFrameRef = useRef<fabric.Circle | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const profileImageBase64Ref = useRef<string | null>(null);
  const profileImageRef = useRef<fabric.Image | null>(null);


const [backgroundColor, setBackgroundColor] = useState("#fefdfd");

  const [userInfo, setUserInfo] = useState({
    name: "Your Name",
    profession: "Your Profession",
    phone: "",
    email: "",
  });

  // Social media icons mapping (for UI display in the form)
  const socialIcons: { [key: string]: React.ElementType } = {
    Facebook: BsFacebook,
    Instagram: BsInstagram,
    Twitter: BsTwitter,
    LinkedIn: BsLinkedin,
    YouTube: BsYoutube,
    TikTok: BsTiktok,
    Pinterest: BsPinterest,
    Snapchat: BsSnapchat,
    GitHub: BsGithub,
    WhatsApp: BsWhatsapp,
  };

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "Facebook", url: "", icon: BsFacebook },
    { platform: "Instagram", url: "", icon: BsInstagram },
    { platform: "Twitter", url: "", icon: BsTwitter },
  ]);

  const [otherSocialOptions] = useState([
    "LinkedIn",
    "YouTube",
    "TikTok",
    "Pinterest",
    "Snapchat",
    "GitHub",
    "WhatsApp",
  ]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
    // Call this from Toolbar when user picks a new background color
    const updateBackgroundColor = (color: string) => {
      setBackgroundColor(color);
      const canvas = canvasRef2.current;
      if (!canvas) return;
      const bg = canvas.getObjects().find(obj => (obj as any).isBackground);
      if (bg) {
        (bg as fabric.Rect).set("fill", color);
        canvas.renderAll();
      }
    };
 

  // Load canvas state if provided
  useEffect(() => {
    if (!iphoneCanvasRef.current) return;

    // Create the Fabric canvas
    const iphoneCanvas = new fabric.Canvas(iphoneCanvasRef.current, {
      width: 250,
      height: 600,
    });
// Extend fabric.Object to include custom properties when saving to JSON
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


    // Background rectangle
   // Add background rectangle with dynamic color
const bgRect = new fabric.Rect({
  width: iphoneCanvas.width!,
  height: iphoneCanvas.height!,
  fill: backgroundColor,
  selectable: false,
  evented: false,
});
(bgRect as any).isBackground = true;
iphoneCanvas.add(bgRect);
(bgRect as any).excludeFromExport = true; // Not saved to JSON
iphoneCanvas.sendObjectToBack(bgRect);

    
    

    canvasRef2.current = iphoneCanvas;
    fabricCanvasRef.current = iphoneCanvas;


    // Profile frame circle
    const profileFrame = new fabric.Circle({
      radius: 60,
      fill: "#000000",
      stroke: "#ffffff",
      strokeWidth: 4,
      left: 125,
      top: 80,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });
    iphoneCanvas.add(profileFrame);
    profileFrameRef.current = profileFrame;

    // Name text
    const nameText = new fabric.Textbox(userInfo.name, {
      left: 125,
      top: 160,
      width: 200,
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      originX: "center",
      editable: true,
    });
    iphoneCanvas.add(nameText);

    // Profession text
    const professionText = new fabric.Textbox(userInfo.profession, {
      left: 125,
      top: 190,
      width: 200,
      fontSize: 16,
      textAlign: "center",
      originX: "center",
      editable: true,
    });
    iphoneCanvas.add(professionText);

    // Call button
    const callButton = new fabric.Rect({
      width: 100,
      height: 40,
      fill: "#4CAF50",
      rx: 10,
      ry: 10,
      left: 10,
      top: 230,
      selectable: false,
      evented: false,
      phone: userInfo.phone,
    });
    callButton.set({ phone: userInfo.phone });
    const callText = new fabric.Text("Call", {
      left: 60,
      top: 245,
      fontSize: 16,
      fill: "#fff",
      originX: "center",
      selectable: false,
      evented: true,
    });

    // Email button
    const emailButton = new fabric.Rect({
      width: 100,
      height: 40,
      fill: "#007bff",
      rx: 10,
      ry: 10,
      left: 140,
      top: 230,
      selectable: false,
      evented: false,
      email: userInfo.email, 
    });
    emailButton.set({ email: userInfo.email });
    const emailText = new fabric.Text("Email", {
      left: 190,
      top: 245,
      fontSize: 16,
      fill: "#fff",
      originX: "center",
      selectable: false,
      evented: true,
    });
    // Add delete icon (small red "X" on top right)
    

    // On-click for call & email
    callButton.on("mousedown", () => {
      const phone = callButton.get("phone");
      if (phone) window.open(`tel:${phone}`);
    });
    emailButton.on("mousedown", () => {
      const email = emailButton.get("email");
      if (email) window.open(`mailto:${email}`);
    });
    
    ;


    // Load PNG for Facebook
    async function loadFacebookIcon(canvas: fabric.Canvas) {
      try {
        // Pass an options object (even empty), which returns a Promise<FabricImage>
        const fbImg = await FabricImage.fromURL("https://diplom-nfc.vercel.app/facebook.png", {
          crossOrigin: "anonymous",
        });
        fbImg.scaleToWidth(40);
        fbImg.scaleToHeight(40);
        fbImg.set({
          left: 40,
          top: 300,
          selectable: false,
          evented: true,  


          url: socialLinks.find((l) => l.platform === "Facebook")?.url || "",


        });
        iphoneCanvas.add(fbImg);

        fbImg.on("mousedown", () => {
          const link = socialLinks.find(
            (l) => l.platform === "Facebook"
          )?.url;
          if (link) {
            const normalized = link.startsWith("http")
              ? link
              : `https://${link}`;
            window.open(normalized, "_blank");
          }
        });
      }catch (err) {
        console.error("Error loading /fb.png", err);
      }
    }
    loadFacebookIcon(iphoneCanvas);

    // Load PNG for Instagram
     async function loadInstagramIcon(canvas: fabric.Canvas) {
      try {
        // Pass an options object (even empty), which returns a Promise<FabricImage>
        const igImg = await FabricImage.fromURL("https://diplom-nfc.vercel.app/instagram.png", {
          crossOrigin: "anonymous",
        });
        igImg.scaleToWidth(40);
        igImg.scaleToHeight(40);
        igImg.set({
          left: 100,
          top: 300,
          selectable: false,
          evented: true,
          url: socialLinks.find((l) => l.platform === "Instagram")?.url || "",
        });
        iphoneCanvas.add(igImg);

        igImg.on("mousedown", () => {
          const link = socialLinks.find(
            (l) => l.platform === "Instagram"
          )?.url;
          if (link) {
            const normalized = link.startsWith("http")
              ? link
              : `https://${link}`;
            window.open(normalized, "_blank");
          }
        });
      }catch (err) {
        console.error("Error loading /ig.png", err);
      }
    }
    loadInstagramIcon(iphoneCanvas);

    // Load PNG for Twitter
    async function loadTwitterIcon(canvas: fabric.Canvas) {
      try {
        // Pass an options object (even empty), which returns a Promise<FabricImage>
        const twitterImg = await FabricImage.fromURL("https://diplom-nfc.vercel.app/twitter.png", {
          crossOrigin: "anonymous",
        });
        twitterImg.scaleToWidth(40);
        twitterImg.scaleToHeight(40);
        twitterImg.set({
          left: 160,
          top: 300,
          selectable: false,
          evented: true,
          url: socialLinks.find((l) => l.platform === "Twitter")?.url || "",
        });
        iphoneCanvas.add(twitterImg);

        twitterImg.on("mousedown", () => {
          const link = socialLinks.find(
            (l) => l.platform === "Twitter"
          )?.url;
          if (link) {
            const normalized = link.startsWith("http")
              ? link
              : `https://${link}`;
            window.open(normalized, "_blank");
          }
        });
      }catch (err) {
        console.error("Error loading /fb.png", err);
      }
    }
    loadTwitterIcon(iphoneCanvas);

    // "Save Contact" button
    const saveContactButton = new fabric.Rect({
      width: 160,
      height: 40,
      fill: "#6c757d",
      rx: 10,
      ry: 10,
      left: 125,
      top: 360,
      originX: "center",
      selectable: false,
      evented: true,
    });
    const saveContactText = new fabric.Text("Save Contact", {
      left: 125,
      top: 375,
      fontSize: 16,
      fill: "#fff",
      originX: "center",
      selectable: false,
      evented: false,
    });
  
    saveContactButton.on("mousedown", () => {
      const imageMatch = profileImageBase64Ref.current?.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
      const mimeType = imageMatch?.[1] || "image/jpeg";
      const imageData = imageMatch?.[2];
    
      const wrapVcardBase64 = (str: string) =>
        str?.match(/.{1,75}/g)?.join("\r\n ") ?? "";
    
      const vcardLines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${userInfo.name}`,
        `TITLE:${userInfo.profession}`,
        `TEL:${userInfo.phone}`,
        `EMAIL:${userInfo.email}`,
      ];
    
      if (imageData && imageData.length > 100) {
        vcardLines.push(`PHOTO;ENCODING=b;TYPE=${mimeType.toUpperCase()}:${wrapVcardBase64(imageData)}`);
      }
    
      vcardLines.push("END:VCARD");
      const vcard = vcardLines.join("\r\n");
    
      const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
      const url = URL.createObjectURL(blob);
    
      const a = document.createElement("a");
      a.href = url;
      a.download = `${userInfo.name}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    });
    
    // Add call/email/save objects to canvas
    iphoneCanvas.add(
      callButton,
      callText,
      emailButton,
      emailText,
      saveContactButton,
      saveContactText
    );
    

    // Load from canvasState if provided
    const loadCanvasState = async () => {
      if (canvasState) {
        try {
          const parsedData = JSON.parse(canvasState);
          iphoneCanvas.loadFromJSON(parsedData, () => {
            console.log("🖼️ Canvas loaded from JSON, rerendering...");
            iphoneCanvas.renderAll();
    
            // ❗ Re-add background after loading
            const bg = new fabric.Rect({
              width: iphoneCanvas.width!,
              height: iphoneCanvas.height!,
              fill: backgroundColor,
              selectable: false,
              evented: false,
            });
            (bg as any).isBackground = true;
            (bg as any).excludeFromExport = true;
    
            iphoneCanvas.add(bg);
            iphoneCanvas.sendObjectToBack(bg);
            iphoneCanvas.renderAll();
          });
        } catch (error) {
          console.error("Error parsing canvas JSON:", error);
        }
      }
    };
    

    
    loadCanvasState();

    // When object is modified, update parent
    iphoneCanvas.on("object:modified", () => {
      if (onCanvasUpdate) {
        onCanvasUpdate(JSON.stringify(iphoneCanvas.toJSON()));
      }
    });

    // Bring objects to front after a short delay
    setTimeout(() => {
      iphoneCanvas.getObjects().forEach((obj) => {
        iphoneCanvas.bringObjectToFront(obj);
      });
      iphoneCanvas.sendObjectToBack(bgRect);
      iphoneCanvas.renderAll();
    }, 100);

    // Cleanup
    return () => {
      iphoneCanvas.dispose();
    };
  }, [canvasState, socialLinks, userInfo, onCanvasUpdate]);
  
  

  // Handle user info changes & update canvas text
  const handleUserInfoChange = (field: string, value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reflect changes on canvas textboxes
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const objects = canvas.getObjects();
      if (field === "name") {
        const nameText = objects.find(
          (obj) =>
            obj.type === "textbox" && (obj as fabric.Textbox).text === userInfo.name
        ) as fabric.Textbox | undefined;
        if (nameText) {
          nameText.set({ text: value });
        }
      } else if (field === "profession") {
        const professionText = objects.find(
          (obj) =>
            obj.type === "textbox" &&
            (obj as fabric.Textbox).text === userInfo.profession
        ) as fabric.Textbox | undefined;
        if (professionText) {
          professionText.set({ text: value });
        }
      }
      canvas.renderAll();
    }
  };

  // Handle social link changes
  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const newLinks = [...socialLinks];
    if (field === "platform") {
      newLinks[index].platform = value;
      newLinks[index].icon = socialIcons[value];
    } else {
      newLinks[index].url = value;
    }
    setSocialLinks(newLinks);
  };

  // Add new social link
  const handleAddSocialLink = (platform: string) => {
    if (socialLinks.length < 6) {
      setSocialLinks([
        ...socialLinks,
        {
          platform,
          url: "",
          icon: socialIcons[platform],
        },
      ]);
      setDropdownOpen(false);
    } else {
      toast.warning("Maximum 6 social links allowed");
    }
  };

  // Remove social link
  const handleRemoveSocialLink = (index: number) => {
    // Disallow removing the first 3 (the main ones)
    if (index < 3) {
      toast.warning("Cannot remove primary social links");
      return;
    }
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    setSocialLinks(newLinks);
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
      
      const base64 = e.target.result as string;
      profileImageBase64Ref.current = base64;
setProfileImageBase64(base64); // ✅ update state (for Firestore later)
if (profileImageRef.current) {
  canvas.remove(profileImageRef.current); // Remove old image
}
      fabric.Image.fromURL(base64, { crossOrigin: "anonymous" }).then((img) => {
        img.scaleToWidth(120);
        img.scaleToHeight(120);
        img.set({
          left: profileFrameRef.current!.left,
          top: profileFrameRef.current!.top,
          originX: "center",
          originY: "center",
          clipPath: new fabric.Circle({
            left: profileFrameRef.current!.left,
            top: profileFrameRef.current!.top,
            radius: 60,
            originX: "center",
            originY: "center",
            absolutePositioned: true,
          }),
          hasControls: true,
          hasBorders: false,
          selectable: true,
        });
  
        // 🧠 Custom delete control (unchanged)
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
        profileImageRef.current = img;
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
  
        toast.success("Profile image uploaded successfully!");
      });
    };
  
    reader.readAsDataURL(file);
  };
  
  
  

  // Save to Firestore
  const handleSyncToWeb = async () => {
    const auth = getAuthClient();
    const db = getFirestoreClient();
  
    if (!canvasRef2.current) return;
    const canvas = canvasRef2.current;
    const saveContactObj = canvas.getObjects().find(
      (obj) => obj instanceof fabric.Rect && obj.width === 160 && obj.height === 40 && obj.fill === "#6c757d"
    );
    
    if (saveContactObj) {
      const imageMatch = profileImageBase64Ref.current?.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
      const mimeType = imageMatch?.[1] || "image/jpeg";
      const imageData = imageMatch?.[2];
    
      const wrapVcardBase64 = (str: string) =>
        str?.match(/.{1,75}/g)?.join("\r\n ") ?? "";
    
      const vcardLines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${userInfo.name}`,
        `TITLE:${userInfo.profession}`,
        `TEL:${userInfo.phone}`,
        `EMAIL:${userInfo.email}`,
      ];
    
      if (imageData && imageData.length > 100) {
        vcardLines.push(
          `PHOTO;ENCODING=b;TYPE=${mimeType.toUpperCase()}:${wrapVcardBase64(imageData)}`
        );
      }
    
      vcardLines.push("END:VCARD");
      const vcard = vcardLines.join("\r\n");
    
      (saveContactObj as any).vcard = vcard; // ✅ embed into canvas object
    }
    
    const json = canvas.toJSON();
    const hasVcard = json.objects.some((obj: any) => obj.vcard);
console.log("✅ vCard present in canvas JSON:", hasVcard);

  
    if (!json) {
      toast.error("Failed to generate canvas JSON");
      return;
    }
  
    const sanitizedJson = {
      version: json.version,
      objects: json.objects.filter((obj: any) => !obj.excludeFromExport),
    };
    console.log("🧾 Final JSON before Firestore:", sanitizedJson);

    const previewImage = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });
  
    if (onCanvasUpdate) {
      onCanvasUpdate(JSON.stringify(sanitizedJson));
    }
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }
  
      try {
        // ✅ Force Firestore to go online
     
  
        const userRef = doc(db, "users", user.uid);
  
        const payload = {
          userId: user.uid,
          timestamp: new Date(),
          userInfo,
          socialLinks: socialLinks.map(({ platform, url }) => ({ platform, url })),
          canvasData: JSON.stringify(sanitizedJson),
          previewImage,
          backgroundColorHex: backgroundColor,
          profileImage: profileImageBase64,
          
        };
  
        await addDoc(collection(userRef, "card_web"), payload);
        const publicRef = await addDoc(collection(db, "card_public"), payload);
  
        const shareUrl = `${window.location.origin}/card-view/${publicRef.id}`;
  
        toast.success(`Card saved! Ready to write to NFC:\n${shareUrl}`);
        console.log("NFC Link:", shareUrl);
      } catch (error) {
        console.error("Error saving to Firestore:", error);
        toast.error("Failed to save data.");
      }
    });
  };
  
  return (
    <div className="flex w-[80vw] min-h-screen justify-center items-center gap-6 md:flex-row flex-col items-start my-8 px-4 overflow-y-auto">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />

      {/* iPhone preview */}
      <div
        className="relative w-[300px] h-[650px] rounded-[40px] overflow-hidden"
        style={{
          backgroundImage: `url(https://diplom-nfc.vercel.app/iphoneBase.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex justify-center items-center p-6">
          <div className="w-[290px] h-[550px] overflow-y-auto rounded-[30px] shadow-inner relative z-0">
            <canvas ref={iphoneCanvasRef} width={250} height={800} />
          </div>
        </div>
      </div>

      {/* Form controls */}
      <div className="w-full md:w-[400px] flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Customize Your Business Card</h2>

        {/* Profile image upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border p-2 rounded-md cursor-pointer"
          />
        </div>

        {/* Basic info */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={userInfo.name}
            onChange={(e) => handleUserInfoChange("name", e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Your Name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Profession</label>
          <input
            type="text"
            value={userInfo.profession}
            onChange={(e) => handleUserInfoChange("profession", e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Your Profession"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={userInfo.phone}
            onChange={(e) => handleUserInfoChange("phone", e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Your Phone Number"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={userInfo.email}
            onChange={(e) => handleUserInfoChange("email", e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Your Email"
          />
        </div>

        {/* Social links */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Social Links</h3>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 bg-blue-500 text-white py-1 px-2 rounded-md text-sm"
              >
                <BsPlus size={16} /> Add Social <BsChevronDown size={12} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-lg z-10 w-40">
                  {otherSocialOptions.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handleAddSocialLink(platform)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* The first 3 are mandatory (Facebook, Instagram, Twitter) */}
          <div className="flex gap-2 mb-4">
            {socialLinks.slice(0, 3).map((link, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="bg-gray-100 p-3 rounded-full mb-1">
                  {React.createElement(link.icon, { size: 24 })}
                </div>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                  className="border p-2 rounded-md w-full text-sm"
                  placeholder={`${link.platform} URL`}
                />
              </div>
            ))}
          </div>

          {/* Additional social links (index >= 3) */}
          {socialLinks.slice(3).map((link, index) => (
            <div key={index + 3} className="flex gap-2 mb-2 items-center">
              <div className="bg-gray-100 p-2 rounded-full">
                {React.createElement(link.icon, { size: 16 })}
              </div>
              <input
                type="text"
                value={link.url}
                onChange={(e) => handleSocialLinkChange(index + 3, "url", e.target.value)}
                className="border p-2 rounded-md flex-1"
                placeholder={`${link.platform} URL`}
              />
              <button
                onClick={() => handleRemoveSocialLink(index + 3)}
                className="bg-red-500 text-white py-1 px-2 rounded-md"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={handleSyncToWeb}
          className="bg-gray-800 text-white py-3 px-4 rounded-md mt-2 w-full flex items-center justify-center gap-2"
        >
          <BsPersonVcard size={16} /> Загвар хадгалах
        </button>
      </div>

      {/* Reuse your existing Toolbar if needed */}
      <Toolbar canvasRef={canvasRef2} canvasRef2={canvasRef2} currentSection="section5" onBackgroundColorChange={(color) => {
    updateBackgroundColor(color); // sets state
    setTimeout(() => {
      const canvas = canvasRef2.current;
      if (!canvas) return;

      const bg = canvas.getObjects().find((o) => (o as any).isBackground);
      if (!bg) {
        // Re-add background if missing
        const newBg = new fabric.Rect({
          width: canvas.width!,
          height: canvas.height!,
          fill: color,
          selectable: false,
          evented: false,
        });
        (newBg as any).isBackground = true;
        (newBg as any).excludeFromExport = true;
        canvas.add(newBg);
        canvas.sendObjectToBack(newBg);
        canvas.renderAll();
      } else {
        (bg as fabric.Rect).set("fill", color);
        canvas.sendObjectToBack(bg);
        canvas.renderAll();
      }
    }, 200);
  }} />
    </div>
  );
};

export default Section5;
