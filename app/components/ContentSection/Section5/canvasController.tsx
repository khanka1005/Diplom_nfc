"use client";
import { FabricImage } from "fabric";
import { toast } from "react-toastify";
import * as fabric from "fabric";

type CanvasControllerOptions = {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasElRef: React.RefObject<HTMLCanvasElement | null>;
  userInfo: {
    name: string;
    profession: string;
    phone: string;
    email: string;
    address?: string;
    website?: string;
    companyName?: string;
  };
  socialLinks: {
    platform: string;
    url: string;
    handle?: string;
  }[];
  backgroundColor: string;
  accentColor?: string;
  profileImageBase64Ref: React.MutableRefObject<string | null>;
  profileImageRef: React.MutableRefObject<fabric.Image | null>;
  onCanvasUpdate?: (json: string) => void;
};

export const useCanvasController = ({
  canvasRef,
  canvasElRef,
  userInfo,
  socialLinks,
  backgroundColor,
  accentColor = "#b1f7f7",
  profileImageBase64Ref,
  profileImageRef,
  onCanvasUpdate,
}: CanvasControllerOptions) => {

  const CARD_WIDTH = 250;
  const CARD_HEIGHT = 600;
  const PROFILE_RADIUS = 50;

  const initCanvas = async() => {
    const canvasEl = canvasElRef.current;
    if (!canvasEl) return;
  
    // Prevent duplicate initialization
    if ((canvasEl as any).fabric) {
      ((canvasEl as any).fabric as fabric.Canvas).dispose();
    }
  
    const canvas = new fabric.Canvas(canvasEl, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      preserveObjectStacking: true,
    });
  
    (canvasEl as any).fabric = canvas;
    canvasRef.current = canvas;
  
    // Extend fabric.Object to save custom properties
    fabric.Object.prototype.toObject = (function (toObject) {
      return function (this: fabric.Object, ...args: any[]) {
        return {
          ...toObject.call(this, ...args),
          url: (this as any).url,
          phone: (this as any).phone,
          email: (this as any).email,
          address: (this as any).address,
          website: (this as any).website,
          vcard: (this as any).vcard,
        };
      };
    })(fabric.Object.prototype.toObject);
    
    // Create the card background
    createCardBackground(canvas);
    
    // Create header section with profile circle
    createProfileSection(canvas);
    
    // Add name, profession and company info
    addPersonalInfo(canvas);
    
    // Add contact info
    addContactInfo(canvas);
    
    // Add social icons
    addSocialIcons(canvas);
    
    // Add website and social handle
    addWebsiteInfo(canvas);
    
    // Add save contact button
    addSaveContactButton(canvas);
    
   addContactInfo(canvas);
    
    canvas.on("object:modified", () => {
      onCanvasUpdate?.(JSON.stringify(canvas.toJSON()));
    });
    
    canvas.renderAll();
  };

  const createCardBackground = (canvas: fabric.Canvas) => {
    // Main background
    const bg = new fabric.Rect({
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      fill: "#ffffff",
      selectable: false,
      evented: false,
    });
    (bg as any).isBackground = true;
    canvas.add(bg);
    
    // Header section (top 1/3 of card)
    const headerHeight = 200;
    const headerBg = new fabric.Rect({
      width: CARD_WIDTH,
      height: headerHeight,
      fill: "#ffffff",
      selectable: false,
      evented: false,
    });
    canvas.add(headerBg);
    
  
  };

  const createProfileSection = (canvas: fabric.Canvas) => {
    const dipHeight = 150; // ← Manually adjust this until it hugs the profile
  
    const dipShape = new fabric.Ellipse({
      rx: CARD_WIDTH,
      ry: dipHeight,
      left: CARD_WIDTH / 2,
      top: -dipHeight-40, // ← Manually shift down; adjust as needed
      originX: "center",
      originY: "top",
      fill: backgroundColor,
      selectable: false,
      evented: false,
    });
  
    const profileFrame = new fabric.Circle({
      radius: PROFILE_RADIUS + 3,
      fill: "#ffffff",
      stroke: "#000000",           // 🟠 Black border
      strokeWidth: 1,              // 🟠 Thin line
      left: CARD_WIDTH / 2,
      top: PROFILE_RADIUS + 50,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });
  
    canvas.add(dipShape, profileFrame);
  };
  const addPersonalInfo = (canvas: fabric.Canvas) => {
    // Name
    
    const name = new fabric.Textbox(userInfo.name.toUpperCase(), {
      left: CARD_WIDTH / 2,
      top: 200,
      width: 200,
      fontSize: 18,
      fontFamily: 'Times New Roman',
      fontWeight: "bold", 
      textAlign: "center",
      originX: "center",
      fill: "#333333",
      selectable: true,
      evented: true,
    });
    
    // Profession
    const profession = new fabric.Textbox(userInfo.profession.toUpperCase(), {
      left: CARD_WIDTH / 2,
      top: name.top + 25,
      width: 200,
      fontSize: 14,
      fontFamily: 'Arial',
      textAlign: "center",
      originX: "center",
      fill: "#333333",
      selectable: true,
      evented: true,
    });
    
    // Company name (with horizontal line above and below)
    if (userInfo.companyName) {
      const lineY = profession.top! + 40;
    
      // Company name text
      const companyName = new fabric.Text(userInfo.companyName, {
        fontSize: 14,
        fontFamily: 'Arial',
        fill: "#333333",
        originX: "center",
        originY: "center",
        left: CARD_WIDTH / 2,
        top: lineY,
        selectable: false,
        evented: false,
      });
    
      // Line: left segment
      const lineLeft = new fabric.Line(
        [20, lineY, CARD_WIDTH / 2 - 60, lineY],
        {
          stroke: accentColor,
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }
      );
    
      // Line: right segment
      const lineRight = new fabric.Line(
        [CARD_WIDTH / 2 + 60, lineY, CARD_WIDTH - 20, lineY],
        {
          stroke: accentColor,
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }
      );
    
      canvas.add(lineLeft, companyName, lineRight);
    }
    
    canvas.add(name, profession);
  };

  const addContactInfo = async (canvas: fabric.Canvas) => {
    const startY = userInfo.companyName ? 280 : 250;
    const iconSize = 20;
    const textLeft = 20 + iconSize + 10;
    const spacing = 32;
    const loadAndAddPNG = async (
      canvas: fabric.Canvas,
      url: string,
      left: number,
      top: number,
      size: number = 20
    ): Promise<fabric.Image> => {
      try {
        const img = await fabric.Image.fromURL(url, { crossOrigin: "anonymous" });
    
        img.scaleToWidth(size);
        img.scaleToHeight(size);
        img.set({
          left,
          top,
          selectable: false,
          evented: false,
        });
    
        canvas.add(img);
        return img;
      } catch (error) {
        console.error("Failed to load PNG:", url, error);
        throw error;
      }
    };
    // 📞 Phone icon + text
    await loadAndAddPNG(canvas, "https://img.icons8.com/?size=100&id=9659&format=png&color=000000", 20, startY+20);
    const phoneText = new fabric.Text(userInfo.phone, {
      left: textLeft,
      top: startY+20,
      fontSize: 17,
      fontFamily: "Arial",
      fill: "#000000",
      selectable: false,
      evented: true,
    });
    phoneText.set({ phone: userInfo.phone });
    phoneText.on("mousedown", () => {
      if (userInfo.phone) window.open(`tel:${userInfo.phone}`);
    });
    canvas.add(phoneText);
  
    // 📧 Email icon + text
    await loadAndAddPNG(canvas, "https://cdn-icons-png.flaticon.com/512/561/561127.png", 20, startY+50);
    const emailText = new fabric.Text(userInfo.email, {
      left: textLeft,
      top: startY + spacing+20,
      fontSize: 17,
      fontFamily: "Arial",
      fill: "#000000",
      selectable: false,
      evented: true,
    });
    emailText.set({ email: userInfo.email });
    emailText.on("mousedown", () => {
      if (userInfo.email) window.open(`mailto:${userInfo.email}`);
    });
    canvas.add(emailText);
  
    // 📍 Address icon + text (only if exists)
    if (userInfo.address) {
      await loadAndAddPNG(canvas, "https://img.icons8.com/?size=100&id=53383&format=png&color=000000", 20, startY + spacing * 2+20);
      const addressText = new fabric.Text(userInfo.address, {
        left: textLeft,
        top: startY + spacing * 2+20,
        fontSize: 17,
        fontFamily: "Arial",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      canvas.add(addressText);
    }
  };

  const addSocialIcons = (canvas: fabric.Canvas) => {
    const startY = 400;
    const iconSize = 30;
    const spacing = 30; // 👈 space *between* icons
    const totalWidth = socialLinks.length * (iconSize + spacing) - spacing;
    const startX = (CARD_WIDTH - totalWidth) / 2;
  
    const socialIconMap: { [key: string]: string } = {
      Facebook: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
      Instagram: "https://img.icons8.com/?size=100&id=32292&format=png&color=000000",
      Twitter: "https://img.icons8.com/?size=100&id=6Fsj3rv2DCmG&format=png&color=000000",
      LinkedIn: "https://cdn-icons-png.flaticon.com/512/3536/3536505.png",
      YouTube: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
      Pinterest: "https://cdn-icons-png.flaticon.com/512/145/145808.png",
    };
  
    socialLinks.forEach((link, index) => {
      const iconUrl = socialIconMap[link.platform] || "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/facebook.svg";
      const iconLeft = startX + index * (iconSize + spacing)+17; // 👈 proper spacing
  
      fabric.Image.fromURL(iconUrl, { crossOrigin: "anonymous" }).then((icon) => {
        icon.scaleToWidth(iconSize);
        icon.scaleToHeight(iconSize);
        icon.set({
          left: iconLeft,
          top: startY + 20,
          selectable: false,
          evented: true,
          url: link.url,
          originX: "center",
          originY: "center",
        });
  
        const circle = new fabric.Circle({
          radius: iconSize / 2 + 5,
          fill: accentColor,
          left: iconLeft,
          top: startY + 20,
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
        });
  
        icon.on("mousedown", () => {
          const normalized = link.url.startsWith("http") ? link.url : `https://${link.url}`;
          window.open(normalized, "_blank");
        });
  
        canvas.add(circle, icon);
      });
    });
  };

  const addWebsiteInfo = (canvas: fabric.Canvas) => {
    if (userInfo.website) {
      const websiteText = new fabric.Text(userInfo.website, {
        left: CARD_WIDTH / 2,
        top: 450,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: "#000000",
        textAlign: "center",
        originX: "center",
        selectable: false,
        evented: true,
        url: userInfo.website,
      });
      
      websiteText.on("mousedown", () => {
        const normalized = userInfo.website?.startsWith("http") 
          ? userInfo.website 
          : `https://${userInfo.website}`;
        window.open(normalized, "_blank");
      });
      
      canvas.add(websiteText);
    }
    
    // Social handle if available
    const socialHandle = socialLinks.find(link => link.handle)?.handle;
    if (socialHandle) {
      const handleText = new fabric.Text(`@${socialHandle}`, {
        left: CARD_WIDTH / 2,
        top: 450,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: "#dddddd",
        textAlign: "center",
        originX: "center",
        selectable: false,
        evented: false,
      });
      
      canvas.add(handleText);
    }
  };

  const addSaveContactButton = (canvas: fabric.Canvas) => {
    const saveBtn = new fabric.Rect({
      width: 160,
      height: 40,
      fill: backgroundColor,
      rx: 20,
      ry: 20,
      left: CARD_WIDTH / 2,
      top: 490,
      originX: "center",
      selectable: false,
      evented: true,
    });
  
    const saveText = new fabric.Text("Контакт хадгалах", {
      left: CARD_WIDTH / 2,
      top: 510,
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "bold",
      fill: "#000000",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });
  
    saveBtn.on("mousedown", () => {
      const imageMatch = profileImageBase64Ref.current?.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
      const mimeType = imageMatch?.[1] || "image/jpeg";
      const imageData = imageMatch?.[2];
  
      const wrapVcardBase64 = (str: string) =>
        str?.match(/.{1,75}/g)?.join("\r\n ") ?? "";
  
      const fullName = userInfo.name.trim();
      let firstName = "";
      let lastName = "";
  
      if (fullName.includes(" ")) {
        const parts = fullName.split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      } else {
        firstName = fullName;
      }
  
      const vcardLines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${fullName}`,
        `N:${lastName};${firstName};;;`, // proper structured name
        `TITLE:${userInfo.profession}`,
      ];
  
      if (userInfo.companyName) {
        vcardLines.push(`ORG:${userInfo.companyName}`);
      }
  
      vcardLines.push(`TEL:${userInfo.phone}`);
      vcardLines.push(`EMAIL:${userInfo.email}`);
  
      if (userInfo.address) {
        vcardLines.push(`ADR:;;${userInfo.address};;;`);
      }
  
      if (userInfo.website) {
        vcardLines.push(`URL:${userInfo.website}`);
      }
  
      socialLinks.forEach(link => {
        vcardLines.push(`X-SOCIALPROFILE;TYPE=${link.platform}:${link.url}`);
      });
  
      if (imageData && imageData.length > 100) {
        vcardLines.push(`PHOTO;ENCODING=b;TYPE=${mimeType.toUpperCase()}:${wrapVcardBase64(imageData)}`);
      }
  
      vcardLines.push("END:VCARD");
      const vcard = vcardLines.join("\r\n");
  
      // Save vCard to the button and text (for cardViewPage usage)
      (saveBtn as any).vcard = vcard;
      (saveText as any).vcard = vcard;
  
      const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fullName}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
  
      toast.success("Contact saved to your device");
    });
  
    canvas.add(saveBtn, saveText);
  };

  const loadImage = (base64: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Make sure to save the base64 for vCard generation
    profileImageBase64Ref.current = base64;

    fabric.Image.fromURL(base64, { crossOrigin: "anonymous" }).then((img) => {
      // Scale and position the image
      img.scaleToWidth(PROFILE_RADIUS * 2);
      img.scaleToHeight(PROFILE_RADIUS * 2);
      img.set({
        left: CARD_WIDTH / 2,
        top: 100,
        originX: "center",
        originY: "center",
        clipPath: new fabric.Circle({
          left: CARD_WIDTH / 2,
          top: 100,
          radius: PROFILE_RADIUS,
          originX: "center",
          originY: "center",
          absolutePositioned: true,
        }),
        hasControls: true,
        hasBorders: false,
        selectable: true,
      });

      // Add delete control
      img.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: -10,
        offsetX: 10,
        cursorStyle: "pointer",
        mouseUpHandler: (_, transform) => {
          canvas.remove(transform.target);
          profileImageBase64Ref.current = null;
          profileImageRef.current = null;
          canvas.requestRenderAll();
          return true;
        },
        render: (ctx, left, top) => {
          const size = 16;
          ctx.save();
          ctx.translate(left, top);
          ctx.fillStyle = "#ff4d4d";
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("✕", 0, 1);
          ctx.restore();
        },
      });

      // Store reference to profile image
      profileImageRef.current = img;
      
      // If there's an existing profile image, remove it
      const existingObjects = canvas.getObjects();
      for (const obj of existingObjects) {
        if (obj === profileImageRef.current && obj !== img) {
          canvas.remove(obj);
          break;
        }
      }
      
      canvas.add(img);
      canvas.bringObjectToFront(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      toast.success("Profile image uploaded");
    }).catch(error => {
      console.error("Error loading image:", error);
      toast.error("Failed to load image");
    });
  };

  return {
    initCanvas,
    loadImage,
  };
};