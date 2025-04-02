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
  const [loading, setLoading] = useState(true); // 👈 New loading state
  const db = getFirestoreClient();

  const fetchOrders = async (nextPage = false) => {
    setLoading(true); // 👈 Start loading
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

    const fetchedOrders: OrderItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<OrderItem, "id">),
    }));

    setOrders(fetchedOrders);
    setTimeout(() => setLoading(false), 100); // 👈 Small delay to let DOM paint
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Orders</h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading orders...</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={order.cardViewPreview || "/placeholder.jpg"}
                  alt="Card Preview"
                  width={100}
                  height={60}
                  className="rounded object-contain"
                  loading="lazy" // 👈 Lazy loading
                />
                <Image
                  src={order.cardWebPreview || "/placeholder.jpg"}
                  alt="Web Preview"
                  width={100}
                  height={60}
                  className="rounded object-contain"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href={order.iphone_url}
                  target="_blank"
                  className="bg-blue-500 text-white px-3 py-1 rounded-md"
                >
                  Open URL
                </Link>

                <select
                  value={order.order_status ? "completed" : "pending"}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value === "completed")
                  }
                  className="border p-2 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => {
            if (page > 1) {
              setPage((prev) => Math.max(prev - 1, 1));
              fetchOrders();
            }
          }}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Previous
        </button>
        <span className="text-lg">Page {page}</span>
        <button
          onClick={() => {
            setPage((prev) => prev + 1);
            fetchOrders(true);
          }}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminOrderPage;
