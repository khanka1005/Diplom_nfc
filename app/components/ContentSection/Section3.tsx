"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getFirestoreClient,
  getAuthClient,
} from "@/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface DesignItem {
  docId: string;
  id: string;
  previewImage: string;
  cardBase?: string;
  canvasData?: string;
}

const Section3 = () => {
  const [cardViewList, setCardViewList] = useState<DesignItem[]>([]);
  const [cardWebList, setCardWebList] = useState<DesignItem[]>([]);

  const [selectedCardView, setSelectedCardView] = useState<string>("");
  const [selectedCardWeb, setSelectedCardWeb] = useState<string>("");

  const [showDesignModal, setShowDesignModal] = useState(false);

  const [userData, setUserData] = useState({
    fullName: "",
    phone: "",
    additionalPhone: "",
    address: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    const auth = getAuthClient();
    const db = getFirestoreClient();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const cardViewSnap = await getDocs(
          collection(db, "users", user.uid, "card_view")
        );
        const cardWebSnap = await getDocs(
          collection(db, "users", user.uid, "card_web")
        );

        const cardViewItems = cardViewSnap.docs.map((doc) => ({
          docId: doc.id,         // <-- Firestore doc ID
          ...(doc.data() as Omit<DesignItem, "docId">),
        })) as DesignItem[];
        
        const cardWebItems = cardWebSnap.docs.map((doc) => ({
          docId: doc.id,         // <-- Firestore doc ID
          ...(doc.data() as Omit<DesignItem, "docId">),
        })) as DesignItem[];
        

        setCardViewList(cardViewItems);
        setCardWebList(cardWebItems);
      } catch (err) {
        console.error("❌ Failed to fetch card designs:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrder = () => {
    if (
      !userData.fullName ||
      !userData.phone ||
      !userData.email ||
      !userData.address
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setShowDesignModal(true);
  };

  const handleConfirmDesign = async () => {
    if (!selectedCardView || !selectedCardWeb) {
      toast.error("Please select both Card View and Web View designs.");
      return;
    }
  
    const auth = getAuthClient();
    const user = auth.currentUser;
    const db = getFirestoreClient();
  
    if (!user) {
      toast.error("You must be logged in to place an order.");
      return;
    }
  
    try {
      const cardViewDoc = await getDoc(doc(db, "users", user.uid, "card_view", selectedCardView));
      const cardWebDoc = await getDoc(doc(db, "users", user.uid, "card_web", selectedCardWeb));
  
      if (!cardViewDoc.exists() || !cardWebDoc.exists()) {
        toast.error("Selected designs could not be found.");
        return;
      }
  
      const cardViewData = cardViewDoc.data();
      const cardWebData = cardWebDoc.data();
  
      const publicRef = await addDoc(collection(db, "card_public"), cardWebData);
      const iphoneUrl = `${window.location.origin}/card-view/${publicRef.id}`;
  
      await addDoc(collection(db, "order"), {
        userId: user.uid,
        ...userData,
        cardViewData: cardViewData.cardBase,
        cardViewPreview: cardViewData.previewImage || "",
        cardWebData: cardWebData.canvasData,
        cardWebPreview: cardWebData.previewImage || "",
        iphone_url: iphoneUrl,
        order_status: false, // ✅ New status field
        createdAt: new Date().toISOString(),
      });
  
      toast.success("Order placed successfully!");
      setShowDesignModal(false);
      setSelectedCardView("");
      setSelectedCardWeb("");
    } catch (err) {
      console.error("❌ Order submission failed:", err);
      toast.error("Failed to place order.");
    }
  };
  
  
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 py-10 w-full">
      <h1 className="text-3xl font-bold py-4">Validate Your Order</h1>

      {/* Order Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            className="border p-2 rounded-md w-full"
            onChange={(e) => handleInputChange("fullName", e.target.value)}
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="border p-2 rounded-md w-full"
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
          <input
            type="text"
            placeholder="Additional Phone"
            className="border p-2 rounded-md w-full"
            onChange={(e) =>
              handleInputChange("additionalPhone", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-2 rounded-md w-full"
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
          <input
            type="email"
            placeholder="Email Address"
            className="border p-2 rounded-md w-full"
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          <textarea
            placeholder="Additional Notes"
            className="border p-2 rounded-md w-full col-span-2"
            rows={3}
            onChange={(e) => handleInputChange("notes", e.target.value)}
          />
        </div>
        <button
          onClick={handleOrder}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 w-full"
        >
          Place Order
        </button>
      </div>

      {/* Design Modal */}
      {showDesignModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-center">Choose Your Designs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Base Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Card Base (card_view)</h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {cardViewList.map((item) => (
              <div
              key={item.docId}

                className={`border rounded-md p-2 cursor-pointer transition ${
                  selectedCardView === item.docId
                    ? "ring-2 ring-blue-500"
                    : "hover:ring-2 hover:ring-gray-400"
                }`}
                onClick={() => setSelectedCardView(item.docId)}
              >
                <Image
                  src={item.previewImage}
                  alt={`Card ${item.docId}`}
                  width={300}
                  height={180}
                  className="rounded-md w-full h-auto object-contain"
                />
                <p className="text-xs text-center mt-1">{item.docId?.slice(0, 8) ?? "No ID"}</p>

              </div>
            ))}
          </div>
        </div>

        {/* Web Layout Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Web Layout (card_web)</h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {cardWebList.map((item) => (
              <div
              key={item.docId}

                className={`border rounded-md p-2 cursor-pointer transition ${
                  selectedCardWeb === item.id
                    ? "ring-2 ring-blue-500"
                    : "hover:ring-2 hover:ring-gray-400"
                }`}
                onClick={() => setSelectedCardWeb(item.docId)}
              >
                <Image
                  src={item.previewImage}
                  alt={`Web ${item.docId}`}
                  width={300}
                  height={180}
                  className="rounded-md w-full h-auto object-contain"
                />
               <p className="text-xs text-center mt-1">{item.docId?.slice(0, 8) ?? "No ID"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirmDesign}
        className="bg-green-600 text-white px-4 py-2 rounded-md mt-6 w-full"
      >
        Confirm and Submit Order
      </button>
    </div>
  </div>
)}


      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Section3;
