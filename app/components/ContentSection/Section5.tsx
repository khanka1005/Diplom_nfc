
"use client";

import React, { useRef, useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Toolbar from "./Toolbar";
import {
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
} from "react-icons/bs";

import { useCanvasController } from "./Section5/canvasController";
import { saveCardToFirestore } from "./Section5/section5Firebase";
import Section5Form from "./Section5/Section5Form";
import * as fabric from "fabric";
import { SocialLink, UserInfo } from "./Section5/section5Types";

const socialIcons = {
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
type Section5Props = {
  navigateToSection: (sectionName: string) => void; // Add this prop
  currentSection: string; // Add this prop
};
const Section5 = ({ navigateToSection, currentSection }: Section5Props) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const profileImageBase64Ref = useRef<string | null>(null);
  const profileImageRef = useRef<fabric.Image | null>(null);

  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#49c088");
  const [accentColor, setAccentColor] = useState("#b1f7f7");

  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    profession: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    companyName: "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "Facebook", url: "", icon: BsFacebook, handle: "" },
    { platform: "Instagram", url: "", icon: BsInstagram, handle: "" },
    { platform: "Twitter", url: "", icon: BsTwitter, handle: "" },
  ]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const otherSocialOptions = Object.keys(socialIcons).filter(
    (key) => !["Facebook", "Instagram", "Twitter"].includes(key)
  );

  const { initCanvas, loadImage } = useCanvasController({
    canvasRef,
    canvasElRef: canvasElementRef,
    userInfo,
    socialLinks,
    backgroundColor,
    accentColor,
    profileImageBase64Ref,
    profileImageRef,
    onCanvasUpdate: (json) => console.log("Canvas updated"),
  });

  useEffect(() => {
    initCanvas();
  }, [backgroundColor, accentColor, userInfo, socialLinks]);

  const handleUserInfoChange = (field: string, value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...socialLinks];
    if (field === "platform") {
      updated[index].platform = value;
      updated[index].icon = socialIcons[value as keyof typeof socialIcons];
    } else if (field === "url") {
      updated[index].url = value;
    } else if (field === "handle") {
      updated[index].handle = value;
    }
    setSocialLinks(updated);
  };

  const handleAddSocialLink = (platform: string) => {
    if (socialLinks.length < 6) {
      setSocialLinks([
        ...socialLinks,
        { 
          platform, 
          url: "", 
          icon: socialIcons[platform as keyof typeof socialIcons],
          handle: "" 
        }
      ]);
      setDropdownOpen(false);
    }
  };

  const handleRemoveSocialLink = (index: number) => {
    if (index < 3) return;
    const updated = [...socialLinks];
    updated.splice(index, 1);
    setSocialLinks(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      profileImageBase64Ref.current = base64;
      setProfileImageBase64(base64);
      loadImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSyncToWeb = async () => {
    if (!canvasRef.current) return;
    await saveCardToFirestore({
      canvas: canvasRef.current,
      userInfo,
      socialLinks,
      profileImageBase64,
      backgroundColor,
      accentColor,
    });
  };

  return (
    <div className="flex w-[80vw] min-h-screen  gap-100 md:flex-row flex-col items-start my-8 px-4 overflow-y-auto">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
      {/* iPhone Canvas View */}
      <div
        className="fixed w-[300px] h-[650px] rounded-[40px] overflow-hidden"
        style={{
          backgroundImage: `url(https://diplom-nfc.vercel.app/iphoneBase.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex justify-center items-center p-6">
          <div className="w-[290px] h-[550px] overflow-y-auto rounded-[30px] shadow-inner relative z-0">
            <canvas ref={canvasElementRef} width={250} height={800} />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <Section5Form
        userInfo={userInfo}
        socialLinks={socialLinks}
        otherSocialOptions={otherSocialOptions}
        dropdownOpen={dropdownOpen}
        backgroundColor={backgroundColor}
        accentColor={accentColor}
        onUserInfoChange={handleUserInfoChange}
        onSocialLinkChange={handleSocialLinkChange}
        onAddSocialLink={handleAddSocialLink}
        onRemoveSocialLink={handleRemoveSocialLink}
        onImageUpload={handleImageUpload}
        onToggleDropdown={() => setDropdownOpen(!dropdownOpen)}
        onSaveClick={handleSyncToWeb}
        onBackgroundColorChange={(color) => setBackgroundColor(color)}
        onAccentColorChange={(color) => setAccentColor(color)}
      />

      <Toolbar
        canvasRef={canvasRef}
        canvasRef2={canvasRef}
        currentSection={currentSection as "section5" | "section4"} 
        navigateToSection={navigateToSection}
        onBackgroundColorChange={(color) => {
          setBackgroundColor(color);
          setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const bg = canvas.getObjects().find((o) => (o as any).isBackground);
            if (!bg) {
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
            } else {
              (bg as fabric.Rect).set("fill", color);
              canvas.sendObjectToBack(bg);
            }
            canvas.renderAll();
          }, 200);
        }}
      />
    </div>
  );
};

export default Section5;