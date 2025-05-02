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

  // Track element positions for dynamic positioning
  const elementPositions = {
    nameBottom: 0,
    professionBottom: 0,
    companyBottom: 0,
    contactInfoBottom: 0,
    socialIconsBottom: 0,
    websiteInfoBottom: 0
  };

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
    await addPersonalInfo(canvas);
    
    // Add contact info - now with dynamic positioning based on previous elements
    await addContactInfo(canvas);
    
    // Add social icons - dynamically positioned
    await addSocialIcons(canvas);
    
    // Add website and social handle - dynamically positioned
    addWebsiteInfo(canvas);
    
    // Add save contact button - dynamically positioned
    addSaveContactButton(canvas);
    
    canvas.on("object:modified", (e) => {
      // Check if the modified object is a text object
      if (e.target && (e.target.type === 'text' || e.target.type === 'textbox')) {
        // Recalculate positions based on the modified element
        repositionElements(canvas);
      }
      
      onCanvasUpdate?.(JSON.stringify(canvas.toJSON()));
    });
    // Re-add profile image if it exists
    if (profileImageBase64Ref.current) {
      loadImage(profileImageBase64Ref.current, false); // don't show toast during redraw
    }
    canvas.renderAll();
  };

  // Function to reposition elements after text changes
  const repositionElements = (canvas: fabric.Canvas) => {
    const objects = canvas.getObjects();
    
    // Find text objects by their properties
    const nameObj = objects.find((obj: any) => obj.text && obj.text.includes(userInfo.name));
    const professionObj = objects.find((obj: any) => obj.text && obj.text.includes(userInfo.profession));
    
    if (nameObj) {
      // Update name bottom position
      elementPositions.nameBottom = nameObj.top! + (nameObj.height! || 25);
      
      // If profession exists, update its position
      if (professionObj) {
        professionObj.set({ top: elementPositions.nameBottom + 10 });
        elementPositions.professionBottom = professionObj.top! + (professionObj.height! || 20);
      }
      
      // Update company info position if it exists
      updateCompanyPosition(canvas);
      
      // Update contact info positions
      updateContactInfoPosition(canvas);
      
      // Update social icons position
      updateSocialIconsPosition(canvas);
      
      // Update website info position
      updateWebsiteInfoPosition(canvas);
      
      // Update save button position
      updateSaveButtonPosition(canvas);
     
      canvas.renderAll();
    }
  };

  const updateCompanyPosition = (canvas: fabric.Canvas) => {
    if (!userInfo.companyName) return;
    
    const objects = canvas.getObjects();
    const companyNameObj = objects.find((obj: any) => obj.text && obj.text === userInfo.companyName);
    const lineLeft = objects.find((obj: any) => obj.type === 'line' && obj.left! < CARD_WIDTH / 2);
    const lineRight = objects.find((obj: any) => obj.type === 'line' && obj.left! > CARD_WIDTH / 2);
    
    if (companyNameObj && lineLeft && lineRight) {
      const newY = elementPositions.professionBottom + 20;
      companyNameObj.set({ top: newY });
      lineLeft.set({ y1: newY, y2: newY });
      lineRight.set({ y1: newY, y2: newY });
      
      elementPositions.companyBottom = newY + 20;
    }
  };

  const updateContactInfoPosition = (canvas: fabric.Canvas) => {
    const objects = canvas.getObjects();
  
    const startY = elementPositions.companyBottom || elementPositions.professionBottom || 250;
    let currentY = startY + 20;
  
    const contactItems = [
      {
        icon: objects.find((obj: any) => obj.type === "image" && obj.top! >= startY && obj.top! < startY + 60),
        text: objects.find((obj: any) => obj.phone === userInfo.phone),
      },
      {
        icon: objects.find((obj: any) => obj.type === "image" && obj.top! >= startY + 50 && obj.top! < startY + 100),
        text: objects.find((obj: any) => obj.email === userInfo.email),
      },
      userInfo.address
        ? {
            icon: objects.find((obj: any) => obj.type === "image" && obj.top! >= startY + 100 && obj.top! < startY + 150),
            text: objects.find((obj: any) => obj.text === userInfo.address),
          }
        : null,
    ].filter(Boolean);
  
    for (const pair of contactItems) {
      const icon = pair!.icon;
      const text = pair!.text;
  
      const textHeight = text?.getScaledHeight?.() || text?.height || 20;
      const iconHeight = icon?.getScaledHeight?.() || icon?.height || 20;
  
      // Align both icon and text vertically
      const alignedTop = currentY;
  
      if (icon) icon.set({ top: alignedTop });
      if (text) text.set({ top: alignedTop });
  
      currentY += Math.max(textHeight, iconHeight) + 10;
    }
  
    elementPositions.contactInfoBottom = currentY;
  };

  const updateSocialIconsPosition = (canvas: fabric.Canvas) => {
    const objects = canvas.getObjects();
    const socialObjects = objects.filter((obj: any) => 
      (obj.type === 'image' && obj.url && obj.top! > 350) || 
      (obj.type === 'circle' && obj.fill === accentColor && obj.top! > 350)
    );
    
    if (socialObjects.length === 0) return;
    
    const newTop = elementPositions.contactInfoBottom + 20;
    
    socialObjects.forEach(obj => {
      obj.set({ top: newTop });
    });
    
    elementPositions.socialIconsBottom = newTop + 35;
  };

  const updateWebsiteInfoPosition = (canvas: fabric.Canvas) => {
    const objects = canvas.getObjects();
    const websiteText = objects.find((obj: any) => obj.text === userInfo.website);
    const socialHandleObj = objects.find((obj: any) => obj.text && obj.text.startsWith('@'));
    
    if (websiteText || socialHandleObj) {
      const newTop = elementPositions.socialIconsBottom + 20;
      
      if (websiteText) websiteText.set({ top: newTop });
      if (socialHandleObj) socialHandleObj.set({ top: newTop + (websiteText ? 25 : 0) });
      
      elementPositions.websiteInfoBottom = newTop + (websiteText && socialHandleObj ? 50 : 25);
    }
  };

  const updateSaveButtonPosition = (canvas: fabric.Canvas) => {
    const objects = canvas.getObjects();
    const saveBtn = objects.find((obj: any) => obj.type === 'rect' && obj.rx === 20);
    const saveText = objects.find((obj: any) => obj.text === "Контакт хадгалах");
    
    if (saveBtn && saveText) {
      const newTop = elementPositions.websiteInfoBottom + 30;
      saveBtn.set({ top: newTop });
      saveText.set({ top: newTop + 20 });
    }
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

  const addPersonalInfo = async (canvas: fabric.Canvas) => {
    // Name
    const name = new fabric.Textbox(userInfo.name.toUpperCase(), {
      left: CARD_WIDTH / 2,
      top: 200,
      width: 200,
      splitByGrapheme: true,
      fontSize: 18,
      fontFamily: 'Times New Roman',
      fontWeight: "bold", 
      textAlign: "center",
      originX: "center",
      fill: "#333333",
      selectable: true,
      evented: true,
    });
  
    // Calculate the rendered height of the name
    const nameHeight = name.calcTextHeight();
    elementPositions.nameBottom = name.top! + nameHeight + 5;
    
    // Profession - positioned based on name
    const profession = new fabric.Textbox(userInfo.profession.toUpperCase(), {
      left: CARD_WIDTH / 2,
      top: elementPositions.nameBottom + 5,
      width: 200,
      splitByGrapheme: true,
      fontSize: 14,
      fontFamily: 'Arial',
      textAlign: "center",
      originX: "center",
      fill: "#333333",
      selectable: true,
      evented: true,
    });
   
    // Calculate the rendered height of the profession
    const professionHeight = profession.calcTextHeight();
    elementPositions.professionBottom = profession.top! + professionHeight + 5;
    
    // Company name (with horizontal line above and below)
    if (userInfo.companyName) {
      const lineY = elementPositions.professionBottom + 10;
    
      // Draw a centered horizontal line (with padding on sides)
      const horizontalLine = new fabric.Line(
        [30, lineY, CARD_WIDTH - 30, lineY], // 👈 30px padding on both sides
        {
          stroke: accentColor,
          strokeWidth: 2,
          selectable: false,
          evented: false,
        }
      );
    
      // Company name text below the line
      const companyTextY = lineY + 8;
      const companyName = new fabric.Textbox(userInfo.companyName, {
        fontSize: 14,
        fontFamily: 'Arial',
        width: 200,
        splitByGrapheme: true,
        fill: "#333333",
        originX: "center",
        originY: "top",
        left: CARD_WIDTH / 2,
        top: companyTextY,
        selectable: false,
        evented: false,
      });
    
      const textHeight = companyName.getScaledHeight();
    
      canvas.add(horizontalLine, companyName);
      elementPositions.companyBottom = companyTextY + textHeight + 5;
    }
    
    canvas.add(name, profession);
  };

  const addContactInfo = async (canvas: fabric.Canvas) => {
    const startY = elementPositions.companyBottom || elementPositions.professionBottom || 250;
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
      
    let currentY = startY + 20;
    
    // 📞 Phone icon + text
    const phoneIcon = await loadAndAddPNG(canvas, "https://img.icons8.com/?size=100&id=9659&format=png&color=000000", 20, currentY);
    const phoneText = new fabric.Textbox(userInfo.phone, {
      left: textLeft,
      top: currentY,
      width: 200,
      splitByGrapheme: true,
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
  
    const phoneHeight = Math.max(phoneIcon.getScaledHeight(), phoneText.getScaledHeight());
    const phoneIconOffset = (phoneHeight - phoneIcon.getScaledHeight()) / 2;
    const phoneTextOffset = (phoneHeight - phoneText.getScaledHeight()) / 2;
    phoneIcon.set({ top: currentY + phoneIconOffset });
    phoneText.set({ top: currentY + phoneTextOffset });
    currentY += phoneHeight + 10;
  
    // 📧 Email icon + text
    const emailIcon = await loadAndAddPNG(canvas, "https://cdn-icons-png.flaticon.com/512/561/561127.png", 20, currentY);
    const emailText = new fabric.Textbox(userInfo.email, {
      left: textLeft,
      top: currentY,
      width: 200,
      splitByGrapheme: true,
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
  
    const emailHeight = Math.max(emailIcon.getScaledHeight(), emailText.getScaledHeight());
    const emailIconOffset = (emailHeight - emailIcon.getScaledHeight()) / 2;
    const emailTextOffset = (emailHeight - emailText.getScaledHeight()) / 2;
    emailIcon.set({ top: currentY + emailIconOffset });
    emailText.set({ top: currentY + emailTextOffset });
    currentY += emailHeight + 10;
  
    // 📍 Address icon + text (optional)
    if (userInfo.address) {
      const addressIcon = await loadAndAddPNG(canvas, "https://img.icons8.com/?size=100&id=53383&format=png&color=000000", 20, currentY);
      const addressText = new fabric.Textbox(userInfo.address, {
        left: textLeft,
        top: currentY,
        width: 200,
        splitByGrapheme: true,
        fontSize: 17,
        fontFamily: "Arial",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      canvas.add(addressText);
  
      const addressHeight = Math.max(addressIcon.getScaledHeight(), addressText.getScaledHeight());
      const addressIconOffset = (addressHeight - addressIcon.getScaledHeight()) / 2;
      const addressTextOffset = (addressHeight - addressText.getScaledHeight()) / 2;
      addressIcon.set({ top: currentY + addressIconOffset });
      addressText.set({ top: currentY + addressTextOffset });
      currentY += addressHeight + 10;
    }
  
    elementPositions.contactInfoBottom = currentY;
  };

  const addSocialIcons = async (canvas: fabric.Canvas) => {
    // Calculate starting Y position based on contact info
    const startY = elementPositions.contactInfoBottom + 20;
    const iconSize = 30;
    const spacing = 30; // 👈 space *between* icons
    const totalWidth = socialLinks.length * (iconSize + spacing) - spacing;
    const startX = (CARD_WIDTH - totalWidth) / 2;
  
    const socialIconMap: { [key: string]: string } = {
      Facebook: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
      Instagram: "https://img.icons8.com/?size=100&id=32292&format=png&color=000000",
      Twitter: "https://img.icons8.com/?size=100&id=6Fsj3rv2DCmG&format=png&color=000000",
    };
  
    const iconPromises = socialLinks.map((link, index) => {
      const iconUrl = socialIconMap[link.platform] || "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/facebook.svg";
      const iconLeft = startX + index * (iconSize + spacing) + 17; // 👈 proper spacing
  
      return new Promise<void>((resolve) => {
        fabric.Image.fromURL(iconUrl, { crossOrigin: "anonymous" }).then((icon) => {
          icon.scaleToWidth(iconSize);
          icon.scaleToHeight(iconSize);
          icon.set({
            left: iconLeft,
            top: startY,
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
            top: startY,
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
          resolve();
        });
      });
    });
    
    // Wait for all icons to be added
    await Promise.all(iconPromises);
    
    // Store the bottom position of social icons section
    elementPositions.socialIconsBottom = startY + iconSize;
  };

  const addWebsiteInfo = (canvas: fabric.Canvas) => {
    // Calculate starting Y position based on social icons
    const startY = elementPositions.socialIconsBottom + 20;
    
    if (userInfo.website) {
      const websiteText = new fabric.Textbox(userInfo.website, {
        left: CARD_WIDTH / 2,
        top: startY,
        width: 200,
        splitByGrapheme: true,
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
      
      // Update Y position for social handle if it exists
      elementPositions.websiteInfoBottom = startY + 20;
    }
    
    // Social handle if available - positioned below website if exists
    const socialHandle = socialLinks.find(link => link.handle)?.handle;
    if (socialHandle) {
      const handleText = new fabric.Textbox(`@${socialHandle}`, {
        left: CARD_WIDTH / 2,
        top: userInfo.website ? elementPositions.websiteInfoBottom + 5 : startY,
        width: 200,
        splitByGrapheme: true,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: "#dddddd",
        textAlign: "center",
        originX: "center",
        selectable: false,
        evented: false,
      });
      
      canvas.add(handleText);
      
      // Update website info bottom position
      elementPositions.websiteInfoBottom = handleText.top! + 20;
    } else if (!userInfo.website) {
      // If neither website nor social handle exists
      elementPositions.websiteInfoBottom = startY;
    }
  };

  const addSaveContactButton = (canvas: fabric.Canvas) => {
    // Calculate starting Y position based on website info
    const startY = elementPositions.websiteInfoBottom + 30;
    
    const saveBtn = new fabric.Rect({
      width: 160,
      height: 40,
      fill: backgroundColor,
      rx: 20,
      ry: 20,
      left: CARD_WIDTH / 2,
      top: startY,
      originX: "center",
      selectable: false,
      evented: true,
    });
  
    const saveText = new fabric.Text("Контакт хадгалах", {
      left: CARD_WIDTH / 2,
      top: startY + 20,
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "bold",
      fill: "#000000",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false, // 👈 not clickable in editor
    });
  
    canvas.add(saveBtn, saveText);
  };

  const loadImage = (base64: string,showToast = true) => {
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
      if (showToast) {
        toast.success("Profile image uploaded");
      }
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