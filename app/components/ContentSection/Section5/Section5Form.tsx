"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import {
  BsChevronDown,
  BsPersonVcard,
  BsPlus,
} from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Section5FormProps } from "./section5Types";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

 // Predefined color schemes similar to the reference image
 const colorSchemes = [
  { primary: "#527ac9", secondary: "#ffffff" },
  { primary: "#393E46", secondary: "#DFD0B8" },
  { primary: "#2A4759", secondary: "#F79B72" },
  { primary: "#e0ebff", secondary: "#4169e1" },
  { primary: "#b19cd9", secondary: "#ffffff" },
  { primary: "#FBF3C1", secondary: "#64E2B7" },
  { primary: "#27548A", secondary: "#F3F3E0" },
];

// Handle image validation and upload
const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
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

  img.onerror = () => {
    setImageError("Invalid image file");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    URL.revokeObjectURL(img.src);
  };
};

// Handle save with loading state
const handleSave = async () => {
  setIsSaving(true);
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate save delay
    await onSaveClick();
    toast.success('Амжилттай хадгалагдлаа', {
      position: 'top-center',
      autoClose: 3000, // Toast will auto-close after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } finally {
    setIsSaving(false);
  }
};

// Choose color scheme
const selectColorScheme = (primary: string, secondary: string) => {
  onBackgroundColorChange(primary);
  onAccentColorChange(secondary);
};
const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);

return (
  <div className="w-full md:w-[600px] flex flex-col gap-6 bg-gray-100 p-6 rounded-lg">
    <h2 className="text-2xl font-bold mb-2">Цахим нэрийн хуудас</h2>

    {/* COLOR CUSTOMIZATION SECTION */}
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">Дизайн хийх</h3>
          <p className="text-gray-600">Өнгөө сонгоно уу!</p>
        </div>
        <button className="text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        {/* COLOR SCHEME SELECTION */}
        <div className="flex flex-wrap gap-3 mb-6">
          {colorSchemes.map((scheme, index) => (
            <button 
              key={index}
              className={`flex flex-col border-2 rounded-lg overflow-hidden ${backgroundColor === scheme.primary && accentColor === scheme.secondary ? 'border-blue-500' : 'border-gray-200'}`}
              onClick={() => selectColorScheme(scheme.primary, scheme.secondary)}
            >
              <div style={{ backgroundColor: scheme.primary }} className="w-16 h-10"></div>
              <div style={{ backgroundColor: scheme.secondary }} className="w-16 h-10"></div>
            </button>
          ))}
        </div>
<div className="flex gap-6 mb-4">
  <div className="flex-1">
    <label className="block text-gray-700 mb-2">Үндсэн өнгө</label>
    <div className="relative">
      <input
        type="text"
        value={backgroundColor}
        onChange={(e) => onBackgroundColorChange(e.target.value)}
        className="w-full border border-gray-300 p-3 rounded-lg pr-12"
        placeholder="#FFFFFF"
      />
      <div className="absolute right-3 top-3 flex items-center">
        <label className="cursor-pointer">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer opacity-0 absolute"
          />
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: backgroundColor }}
          ></div>
        </label>
      </div>
    </div>
  </div>
  <div className="flex-1">
    <label className="block text-gray-700 mb-2">Хамаарах өнгө</label>
    <div className="relative">
      <input
        type="text"
        value={accentColor}
        onChange={(e) => onAccentColorChange(e.target.value)}
        className="w-full border border-gray-300 p-3 rounded-lg pr-12"
        placeholder="#000000"
      />
      <div className="absolute right-3 top-3 flex items-center">
        <label className="cursor-pointer">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => onAccentColorChange(e.target.value)}
            className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer opacity-0 absolute"
          />
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: accentColor }}
          ></div>
        </label>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>

    {/* PERSONAL INFORMATION SECTION */}
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">Цахим нэрийн хуудасны мэдээлэл</h3>
          <p className="text-gray-600">Цахим нэрийн хуудсанд байрлах мэдээллээ оруулна уу!</p>
        </div>
        <button className="text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-bold text-lg mb-4">Хувийн мэдээлэл</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
          <label className="block text-gray-700 mb-2 normal-case">Нэр</label>
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) => onUserInfoChange("name", e.target.value)}
              placeholder="e.g. Бат-Эрдэнэ"
              className="w-full border border-gray-300 p-3 rounded-lg"
            />
          </div>
          
          <div className="row-span-2">
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center h-40 relative">
  <label className="flex flex-col items-center cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-gray-500 text-center text-sm">Зураг оруулах(jpg, png, svg)</p>
    <p className="text-gray-400 text-center text-xs">1MB</p>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
  </label>
</div>
            {imageError && (
              <p className="text-red-500 text-sm mt-1">{imageError}</p>
            )}
          </div>
          
        
        </div>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Утасны дугаар</label>
              <input
                type="text"
                value={userInfo.phone}
                onChange={(e) => onUserInfoChange("phone", e.target.value)}
                placeholder="e.g. +18099999999"
                className="w-full border border-gray-300 p-3 rounded-lg"
              />
            </div>
            
           
       
            <div>
              <label className="block text-gray-700 mb-2">Цахим шуудан</label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => onUserInfoChange("email", e.target.value)}
                placeholder="e.g. name@email.com"
                className="w-full border border-gray-300 p-3 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Вэбсайт</label>
              <input
                type="text"
                value={userInfo.website}
                onChange={(e) => onUserInfoChange("website", e.target.value)}
                placeholder="e.g. https://pauljones.com"
                className="w-full border border-gray-300 p-3 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Ажилладаг газар</label>
              <input
                type="text"
                value={userInfo.companyName}
                onChange={(e) => onUserInfoChange("companyName", e.target.value)}
                placeholder="e.g. ABC ХХК"
                className="w-full border border-gray-300 p-3 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Мэргэжил</label>
              <input
                type="text"
                value={userInfo.profession}
                onChange={(e) => onUserInfoChange("profession", e.target.value)}
                placeholder="e.g. Програм хангамж"
                className="w-full border border-gray-300 p-3 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Хаяг</label>
              <input
                type="text"
                value={userInfo.address}
                onChange={(e) => onUserInfoChange("address", e.target.value)}
                placeholder="e.g. СБД, 1-р хороо, УБ хот"
                className="w-full border border-gray-300 p-3 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* SOCIAL LINKS SECTION */}
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-bold mb-4">Сошиал линк</h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">Add your social media links</p>
          <div className="relative">
            <button
              onClick={onToggleDropdown}
              className="flex items-center gap-1 bg-[#527ac9] text-white py-2 px-3 rounded-md text-sm"
            >
              <BsPlus size={16} />Нэмэх <BsChevronDown size={12} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-lg z-10 w-48">
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

        {/* Social Links */}
        {socialLinks.map((link, index) => (
          <div key={index} className="mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-full">
                {React.createElement(link.icon, { size: 20 })}
              </div>
              <input
                type="text"
                placeholder="URL"
                value={link.url}
                onChange={(e) => onSocialLinkChange(index, "url", e.target.value)}
                className="flex-1 border border-gray-300 p-3 rounded-lg"
              />
              {index >= 3 && (
                <button
                  onClick={() => onRemoveSocialLink(index)}
                  className="text-red-500 p-2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* SAVE BUTTON */}
    <button
  onClick={handleSave}
  disabled={isSaving}
  className="bg-[#527ac9] text-white py-3 px-4 rounded-md w-full flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
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