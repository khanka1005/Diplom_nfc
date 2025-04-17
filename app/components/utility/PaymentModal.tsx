"use client";

import { useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: { method: string; quantity: number; total: number }) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState("Bank");
  const [quantity, setQuantity] = useState(1);
  const pricePerUnit = 65000;
  const total = quantity * pricePerUnit;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold text-center mb-4">Төлбөрийн мэдээлэл</h2>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Төлбөрийн хэлбэр</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Bank">Банк</option>
            <option value="QPay">QPay</option>
          </select>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Тоо ширхэг</label>
          <input
            type="number"
            min={1}
            className="w-full p-2 border border-gray-300 rounded"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Total */}
        <div className="mb-4">
          <p className="text-sm">
            Нийт дүн: <span className="font-bold text-indigo-600">{total.toLocaleString()}₮</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Цуцлах
          </button>
          <button
            onClick={() => onConfirm({ method: paymentMethod, quantity, total })}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Төлбөр батлах
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;