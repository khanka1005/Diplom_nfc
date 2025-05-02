"use client";

import React, { useState, useRef } from "react";
import {
  BsChevronDown,
  BsPersonVcard,
  BsPlus,
} from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Section5FormProps } from "./section5Types";

const Section5Form: React.FC<Section5FormProps> = ({
  userInfo,
  socialLinks,
  otherSocialOptions,
  dropdownOpen,
  backgroundColor,
  accentColor,
  onUserInfoChange,
  onSocialLinkChange,
  onAddSocialLink,
  onRemoveSocialLink,
  onImageUpload,
  onToggleDropdown,
  onSaveClick,
  onBackgroundColorChange,
  onAccentColorChange,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image validation and upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError("");
    
    if (!file) return;

    // Create an image object to check dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // Check if image dimensions are within limits
      if (img.width > 1000 || img.height > 1000) {
        setImageError("Image must be less than 1000x1000 pixels");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        URL.revokeObjectURL(img.src);
        return;
      }
      
      // Image is valid, proceed with upload
      URL.revokeObjectURL(img.src);
      onImageUpload(e);
    };
  };

  // Handle save with loading state
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate save delay
      await onSaveClick();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full md:w-[400px] flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Цахим нэрийн хуудас</h2>

      {/* 🎴 Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">Нүүр зураг</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full border p-2 rounded-md cursor-pointer"
        />
        {imageError && (
          <p className="text-red-500 text-sm mt-1">{imageError}</p>
        )}
      </div>

      {/* 🧑‍💼 User Info */}
      {["name", "profession", "companyName", "phone", "email", "address", "website"].map((field) => {
  const label =
    field === "companyName" ? "Байгууллага" :
    field === "profession" ? "Албан тушаал" :
    field === "name" ? "Нэр" :
    field === "phone" ? "Утасны дугаар" :
    field === "email" ? "Емайл хаяг" :
    field === "address" ? "Хаяг" :
    field === "website" ? "Веб хуудас" : field;

  const placeholder =
    field === "companyName" ? " ABC ХХК" :
    field === "profession" ? "Програм хангамж" :
    field === "name" ? " Бат-Эрдэнэ" :
    field === "phone" ? " 99119911" :
    field === "email" ? " name@example.com" :
    field === "address" ? " СБД, 1-р хороо, УБ хот" :
    field === "website" ? " www.example.mn" : "";

  return (
    <div key={field}>
      <label className="block text-sm font-medium mb-1 capitalize">{label}</label>
      <input
        type="text"
        value={(userInfo as any)[field]}
        onChange={(e) => onUserInfoChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border p-2 rounded-md"
      />
    </div>
  );
})}

      {/* 🎨 Color Pickers */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm mb-1">Background Color</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-full h-10 border rounded-md"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Accent Color</label>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => onAccentColorChange(e.target.value)}
            className="w-full h-10 border rounded-md"
          />
        </div>
      </div>

      {/* 🔗 Social Links */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Сошиал линк</h3>
          <div className="relative">
            <button
              onClick={onToggleDropdown}
              className="flex items-center gap-1 bg-blue-500 text-white py-1 px-2 rounded-md text-sm"
            >
              <BsPlus size={16} /> Нэмэх <BsChevronDown size={12} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-lg z-10 w-40">
                {otherSocialOptions.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => onAddSocialLink(platform)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {platform}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🌐 Social Inputs */}
        {socialLinks.map((link, index) => (
  <div key={index} className="mb-2">
    <div className="flex items-center gap-2 mb-1">
      <div className="bg-gray-100 p-2 rounded-full">
        {React.createElement(link.icon, { size: 20 })}
      </div>
      <input
        type="text"
        placeholder="URL"
        value={link.url}
        onChange={(e) => onSocialLinkChange(index, "url", e.target.value)}
        className="flex-1 border p-2 rounded-md"
      />
      {index >= 3 && (
        <button
          onClick={() => onRemoveSocialLink(index)}
          className="text-red-500 font-bold px-2"
        >
          ✕
        </button>
      )}
    </div>
  </div>
))}
      </div>

      {/* 💾 Save */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-gray-800 text-white py-3 px-4 rounded-md mt-4 w-full flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <AiOutlineLoading3Quarters size={16} className="animate-spin" /> 
            Хадгалж байна...
          </>
        ) : (
          <>
            <BsPersonVcard size={16} /> Загвар хадгалах
          </>
        )}
      </button>
    </div>
  );
};

export default Section5Form;