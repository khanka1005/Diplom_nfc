"use client";

import { useEffect, useState } from "react";
import { getFirestoreClient } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

const ITEMS_PER_PAGE = 7;

interface OrderItem {
  id: string;
  cardViewPreview: string;
  cardWebPreview: string;
  iphone_url: string;
  order_status: boolean;
  fullName: string;
  phone: string;
  additionalPhone?: string;
  address: string;
  email: string;
  notes?: string;
  createdAt: string;
}

const AdminOrderPage = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const db = getFirestoreClient();

  const fetchOrders = async (nextPage = false) => {
    setLoading(true);
    let q = query(
      collection(db, "order"),
      orderBy("createdAt", "desc"),
      limit(ITEMS_PER_PAGE)
    );

    if (nextPage && lastVisible) {
      q = query(
        collection(db, "order"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(ITEMS_PER_PAGE)
      );
    }

    const snapshot = await getDocs(q);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    setLastVisible(lastDoc);
    setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

    const fetchedOrders: OrderItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<OrderItem, "id">),
    }));

    setOrders(fetchedOrders);
    setTimeout(() => setLoading(false), 100);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: boolean) => {
    const orderRef = doc(db, "order", orderId);
    await updateDoc(orderRef, { order_status: newStatus });

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, order_status: newStatus } : order
      )
    );
  };

  const openModal = (imageUrl: string) => {
    setModalImage(imageUrl);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalImage(null);
    document.body.style.overflow = "auto";
  };

  const previousPage = () => {
    if (page > 1) {
      setPage((prev) => Math.max(prev - 1, 1));
      fetchOrders();
    }
  };

  const nextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
      fetchOrders(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Orders Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage and track all customer orders</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div 
                      className="relative w-20 h-20 rounded bg-gray-100 cursor-pointer overflow-hidden"
                      onClick={() => openModal(order.cardViewPreview)}
                    >
                      <Image
                        src={order.cardViewPreview || "/placeholder.jpg"}
                        alt="Card Preview"
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-200"
                        sizes="80px"
                        loading="lazy"
                      />
                    </div>
                    <div 
                      className="relative w-20 h-20 rounded bg-gray-100 cursor-pointer overflow-hidden"
                      onClick={() => openModal(order.cardWebPreview)}
                    >
                      <Image
                        src={order.cardWebPreview || "/placeholder.jpg"}
                        alt="Web Preview"
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-200"
                        sizes="80px"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{order.fullName}</h3>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0">
                        <Link
                          href={order.iphone_url}
                          target="_blank"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors inline-flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View URL
                        </Link>
                        
                        <select
                          value={order.order_status ? "completed" : "pending"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value === "completed")}
                          className={`border text-sm font-medium rounded px-3 py-2 appearance-none cursor-pointer ${
                            order.order_status 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <p className="text-gray-600"><span className="font-medium">Email:</span> {order.email}</p>
                      <p className="text-gray-600"><span className="font-medium">Phone:</span> {order.phone}</p>
                      {order.additionalPhone && (
                        <p className="text-gray-600"><span className="font-medium">Additional Phone:</span> {order.additionalPhone}</p>
                      )}
                      <p className="text-gray-600"><span className="font-medium">Address:</span> {order.address}</p>
                    </div>
                    
                    {order.notes && (
                      <div className="mt-3 text-sm">
                        <p className="text-gray-600"><span className="font-medium">Notes:</span> {order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={previousPage}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md font-medium text-sm flex items-center ${
              page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <span className="text-sm font-medium text-gray-600">Page {page}</span>
          
          <button
            onClick={nextPage}
            disabled={!hasMore}
            className={`px-4 py-2 rounded-md font-medium text-sm flex items-center ${
              !hasMore
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
            }`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white p-1 rounded-lg shadow-2xl">
              <Image
                src={modalImage}
                alt="Preview"
                width={800}
                height={600}
                className="object-contain max-h-[80vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderPage;