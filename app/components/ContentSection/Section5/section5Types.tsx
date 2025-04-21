import { Canvas } from "fabric";
import { ElementType, RefObject } from "react";

// 📌 User information
export type UserInfo = {
  name: string;
  profession: string;
  phone: string;
  email: string;
  address?: string;
  website?: string;
  companyName?: string;
};

// 📌 Social link structure
export type SocialLink = {
  platform: string;
  url: string;
  icon: ElementType;
  handle?: string;
};

// 📌 Props for the Section5Form
export type Section5FormProps = {
  userInfo: UserInfo;
  socialLinks: SocialLink[];
  otherSocialOptions: string[];
  dropdownOpen: boolean;
  backgroundColor: string;
  accentColor: string;
  onUserInfoChange: (field: string, value: string) => void;
  onSocialLinkChange: (index: number, field: string, value: string) => void;
  onAddSocialLink: (platform: string) => void;
  onRemoveSocialLink: (index: number) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleDropdown: () => void;
  onSaveClick: () => void;
  onBackgroundColorChange: (color: string) => void;
  onAccentColorChange: (color: string) => void;
};

// 📌 Props for the canvas controller logic
export type CanvasControllerProps = {
  canvasRef: RefObject<Canvas | null>;
  canvasElementRef: RefObject<HTMLCanvasElement | null>;
  userInfo: UserInfo;
  socialLinks: SocialLink[];
  profileImageBase64: string | null;
  setProfileImageBase64: (base64: string | null) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  accentColor?: string;
  onCanvasUpdate?: (state: string) => void;
};