"use client";
import { useState } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Section3 = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleOrder = () => {
    setShowPaymentModal(true);
  };

  const handleVerify = () => {
    setShowPaymentModal(false);
    toast.success("Order placed successfully!");
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
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="border p-2 rounded-md w-full"
          />
          <input
            type="text"
            placeholder="Additional Phone"
            className="border p-2 rounded-md w-full"
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-2 rounded-md w-full"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="border p-2 rounded-md w-full"
          />
          <textarea
            placeholder="Additional Notes"
            className="border p-2 rounded-md w-full col-span-2"
            rows={3}
          />
        </div>
        <button
          onClick={handleOrder}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 w-full"
        >
          Place Order
        </button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>

            {/* Payment Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg shadow-md text-center cursor-pointer">
                <Image src="/khan_bank.png" alt="Bank" width={50} height={50} />
                <p>Bank</p>
              </div>
              <div className="p-4 border rounded-lg shadow-md text-center cursor-pointer">
                <Image src="/qpay.png" alt="QPay" width={50} height={50} />
                <p>QPay</p>
              </div>
              <div className="p-4 border rounded-lg shadow-md text-center cursor-pointer">
                <Image src="/other.png" alt="Other" width={50} height={50} />
                <p>Other</p>
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 w-full"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Section3;
