import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { collection, addDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import * as fabric from "fabric";
import { SocialLink, UserInfo } from "./section5Types";

export const saveCardToFirestore = async ({
  canvas,
  userInfo,
  socialLinks,
  profileImageBase64,
  backgroundColor,
  accentColor,
  onCanvasUpdate,
}: {
  canvas: fabric.Canvas;
  userInfo: UserInfo;
  socialLinks: SocialLink[];
  profileImageBase64: string | null;
  backgroundColor: string;
  accentColor?: string;
  onCanvasUpdate?: (state: string) => void;
}) => {
  const auth = getAuthClient();
  const db = getFirestoreClient();

  // Find the save button
  const saveBtn = canvas.getObjects().find(
    (obj) =>
      obj instanceof fabric.Rect &&
      obj.width === 160 &&
      obj.height === 40 &&
      obj.top === 490
  );

  if (saveBtn && profileImageBase64) {
    const imageMatch = profileImageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
    const mimeType = imageMatch?.[1] || "image/jpeg";
    const imageData = imageMatch?.[2];

    const wrapVcardBase64 = (str: string) =>
      str?.match(/.{1,75}/g)?.join("\r\n ") ?? "";

    // Split full name into first and last (optional but more structured)
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

    // Build the vCard
    const vcardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${userInfo.name}`,
      `N:${lastName};${firstName};;;`,
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

    socialLinks.forEach((link) => {
      if (link.url) {
        vcardLines.push(`X-SOCIALPROFILE;TYPE=${link.platform}:${link.url}`);
      }
    });

    if (imageData && imageData.length > 100) {
      vcardLines.push(
        `PHOTO;ENCODING=b;TYPE=${mimeType.toUpperCase()}:${wrapVcardBase64(imageData)}`
      );
    }

    vcardLines.push("END:VCARD");
    const vcard = vcardLines.join("\r\n");

    // Assign vCard to canvas object (detected later in CardViewPage)
    (saveBtn as any).vcard = vcard;

    // You may optionally assign it to text as well
    const saveText = canvas.getObjects().find(
      (obj) => obj.type === "text" && (obj as any).text?.includes("Контакт")
    );
    if (saveText) {
      (saveText as any).vcard = vcard;
    }
  }

  // Convert canvas to JSON excluding export-excluded objects
  const json = canvas.toJSON();
  const sanitizedJson = {
    version: json.version,
    objects: json.objects.filter((obj: any) => !obj.excludeFromExport),
  };

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
      const userRef = doc(db, "users", user.uid);
      const payload = {
        userId: user.uid,
        timestamp: new Date(),
        userInfo,
        socialLinks: socialLinks.map(({ platform, url }) => ({
          platform,
          url,
        })),
        canvasData: JSON.stringify(sanitizedJson),
        previewImage,
        backgroundColorHex: backgroundColor,
        accentColorHex: accentColor ?? "#4da6bc",
        profileImage: profileImageBase64,
      };

      await addDoc(collection(userRef, "card_web"), payload);
      const publicRef = await addDoc(collection(db, "card_public"), payload);

      const shareUrl = `${window.location.origin}/card-view/${publicRef.id}`;
      toast.success(`Карт хадгалагдлаа. NFC-д бичихэд бэлэн:\n${shareUrl}`);
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      toast.error("Failed to save data.");
    }
  });
};