"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getFirestoreClient, getAuthClient } from "@/firebaseConfig";
import { collection, doc, getDocs, getDoc, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import PaymentModal from "../utility/PaymentModal";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [userData, setUserData] = useState({
    fullName: "",
    phone: "",
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
          docId: doc.id,
          ...(doc.data() as Omit<DesignItem, "docId">),
        })) as DesignItem[];
        
        const cardWebItems = cardWebSnap.docs.map((doc) => ({
          docId: doc.id,
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

  const filteredCardViewList = cardViewList.filter(item => 
    item.docId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCardWebList = cardWebList.filter(item => 
    item.docId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!userData.fullName || !userData.phone || !userData.email || !userData.address) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setShowDesignModal(true);
    }
  };

  const handleBack = () => {
    setShowDesignModal(false);
  };

  const handleConfirmDesign = async () => {
    if (!selectedCardView || !selectedCardWeb) {
      toast.error("Please select both Card View and Web View designs.");
      return;
    }
  
    const auth = getAuthClient();
    const user = auth.currentUser;
    const db = getFirestoreClient();
    setShowPaymentModal(true);
    if (!user) {
      toast.error("You must be logged in to place an order.");
      return;
    }
  
    try {
      setIsSubmitting(true);
      const cardViewDoc = await getDoc(doc(db, "users", user.uid, "card_view", selectedCardView));
      const cardWebDoc = await getDoc(doc(db, "users", user.uid, "card_web", selectedCardWeb));
  
      if (!cardViewDoc.exists() || !cardWebDoc.exists()) {
        toast.error("Selected designs could not be found.");
        setIsSubmitting(false);
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
        order_status: false,
        createdAt: new Date().toISOString(),
      });
  
      toast.success("Order placed successfully!");
      setShowDesignModal(false);
      setSelectedCardView("");
      setSelectedCardWeb("");
      setIsSubmitting(false);
    } catch (err) {
      console.error("❌ Order submission failed:", err);
      toast.error("Failed to place order.");
      setIsSubmitting(false);
    }
  };

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };
  
  const closePreview = () => {
    setPreviewImage(null);
  };
  const handleConfirmPayment = async ({ method, quantity, total }: { method: string; quantity: number; total: number }) => {
    setShowPaymentModal(false); // Close modal
  
    const auth = getAuthClient();
    const db = getFirestoreClient();
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      setIsSubmitting(true);
      const cardViewDoc = await getDoc(doc(db, "users", user.uid, "card_view", selectedCardView));
      const cardWebDoc = await getDoc(doc(db, "users", user.uid, "card_web", selectedCardWeb));
  
      const publicRef = await addDoc(collection(db, "card_public"), cardWebDoc.data());
      const iphoneUrl = `${window.location.origin}/card-view/${publicRef.id}`;
  
      const orderRef = await addDoc(collection(db, "order"), {
        userId: user.uid,
        ...userData,
        cardViewData: cardViewDoc.data()?.cardBase,
        cardViewPreview: cardViewDoc.data()?.previewImage || "",
        cardWebData: cardWebDoc.data()?.canvasData,
        cardWebPreview: cardWebDoc.data()?.previewImage || "",
        iphone_url: iphoneUrl,
        order_status: false,
        createdAt: new Date().toISOString(),
      });
      console.log("Order ID:", orderRef.id);
      // Save payment info
      const paymentRef = collection(db, "order", orderRef.id, "payment");
      await addDoc(paymentRef, {
        method,
        quantity,
        total,
        status: "pending",
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
  
      toast.success("Захиалга амжилттай илгээгдлээ!");
      setShowDesignModal(false);
      setSelectedCardView("");
      setSelectedCardWeb("");
    } catch (err) {
      toast.error("Алдаа гарлаа.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 py-5 w-300 min-h-screen">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-1">
          <h1 className="text-4xl font-bold text-indigo-800 mb-3">Захиалгын хэсэг</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${showDesignModal ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>1</div>
            <div className="h-1 w-16 bg-gray-300 mx-2"></div>
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${showDesignModal ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
          </div>
        </div>

        {/* Order Form */}
        {!showDesignModal && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Мэдээллээ оруулна уу!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Овог нэр <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Хан-Эрдэнэ"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={userData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Утасны дугаар <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="+976 99 999 999"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={userData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Емайл хаяг <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="youremail@example.com"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={userData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Хүргээлэх хаяг <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="БЗД, 13-р хороолол"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={userData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Нэмэлт тэмдэглэл</label>
                <textarea
                  placeholder="Орцны дугаар"
                  className="border border-gray-300 p-3 rounded-lg w-full h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                  value={userData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleContinue}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
              >
                Үргэлжлүүлэх
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Design Selection Modal */}
        {showDesignModal && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Загвараа сонгоно уу!</h2>
              <button
                onClick={handleBack}
                className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
              >
                <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Details
              </button>
            </div>

            {/* Search bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search designs by ID..."
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Картны загвар</h3>
              {filteredCardViewList.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No card base designs found.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-72 overflow-y-auto p-2">
                  {filteredCardViewList.map((item) => (
                    <div
                      key={item.docId}
                      className={`group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-200
                        ${selectedCardView === item.docId ? "ring-2 ring-indigo-600" : "ring-1 ring-gray-200"}`}
                      onClick={() => setSelectedCardView(item.docId)}
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-gray-50">
                        <Image
                          src={item.previewImage}
                          alt={`Card ${item.docId}`}
                          width={300}
                          height={180}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between">
                        <div className="p-2 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreview(item.previewImage);
                            }}
                            className="bg-white/90 hover:bg-white rounded-full p-2 text-gray-800 transition-all"
                            aria-label="View larger preview"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-white truncate">{item.docId}</p>
                        </div>
                      </div>
                      {selectedCardView === item.docId && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-indigo-600 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Утасны загвар</h3>
              {filteredCardWebList.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No web layout designs found.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-72 overflow-y-auto p-2">
                  {filteredCardWebList.map((item) => (
                    <div
                      key={item.docId}
                      className={`group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-200
                        ${selectedCardWeb === item.docId ? "ring-2 ring-indigo-600" : "ring-1 ring-gray-200"}`}
                      onClick={() => setSelectedCardWeb(item.docId)}
                    >
                      <div className="aspect-w-4 aspect-h-3 bg-gray-50">
                        <Image
                          src={item.previewImage}
                          alt={`Web ${item.docId}`}
                          width={200}
                          height={80}
                          className="w-full h-full object-contain max-h-50"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between">
                        <div className="p-2 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreview(item.previewImage);
                            }}
                            className="bg-white/90 hover:bg-white rounded-full p-2 text-gray-800 transition-all"
                            aria-label="View larger preview"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-white truncate">{item.docId}</p>
                        </div>
                      </div>
                      {selectedCardWeb === item.docId && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-indigo-600 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Таны сонголт</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Карт:</p>
                  <p className="font-medium text-gray-800">{selectedCardView ? selectedCardView : "Not selected"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Утас:</p>
                  <p className="font-medium text-gray-800">{selectedCardWeb ? selectedCardWeb : "Not selected"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleConfirmDesign}
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
                } text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Order
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                   
                  </>
                )}
              </button>
              <PaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  onConfirm={handleConfirmPayment}
/>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div 
            className="relative bg-white rounded-lg overflow-hidden max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2 absolute top-0 right-0 z-10">
              <button
                onClick={closePreview}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Close preview"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={previewImage}
                  alt="Design Preview"
                  width={500}
                  height={200}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <div className="flex justify-center space-x-4">
                <button 
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                  onClick={closePreview}
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Section3;