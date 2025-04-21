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

  // Find save button in canvas
  const saveContactObj = canvas.getObjects().find(
    (obj) =>
      obj instanceof fabric.Rect &&
      obj.width === 160 &&
      obj.height === 40 &&
      obj.fill === backgroundColor
  );

  if (saveContactObj && profileImageBase64) {
    const imageMatch = profileImageBase64.match(
      /^data:(image\/[a-zA-Z]+);base64,(.*)$/
    );
    const mimeType = imageMatch?.[1] || "image/jpeg";
    const imageData = imageMatch?.[2];

    const wrapVcardBase64 = (str: string) =>
      str?.match(/.{1,75}/g)?.join("\r\n ") ?? "";

    const vcardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${userInfo.name}`,
      `N:${userInfo.name};;;;`,
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
        `PHOTO;ENCODING=b;TYPE=${mimeType.toUpperCase()}:${wrapVcardBase64(
          imageData
        )}`
      );
    }

    vcardLines.push("END:VCARD");

    const vcard = vcardLines.join("\r\n");

    // Attach vCard to canvas object
    (saveContactObj as any).vcard = vcard;
  }

  // Clean canvas JSON
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

  // Save to Firestore after auth state is ready
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
        socialLinks: socialLinks.map(({ platform, url }) => ({ platform, url })),
        canvasData: JSON.stringify(sanitizedJson),
        previewImage,
        backgroundColorHex: backgroundColor,
        accentColorHex: accentColor ?? "#4da6bc",
        profileImage: profileImageBase64,
      };

      // Save to personal collection
      await addDoc(collection(userRef, "card_web"), payload);

      // Save to public view
      const publicRef = await addDoc(collection(db, "card_public"), payload);

      const shareUrl = `${window.location.origin}/card-view/${publicRef.id}`;
      toast.success(`Card saved! NFC link ready:\n${shareUrl}`);
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      toast.error("Failed to save data.");
    }
  });
};