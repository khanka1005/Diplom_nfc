"use client";

import { HiArrowRight } from "react-icons/hi";
import { useUser } from "@/app/context/UserContext"; // Import user context
import { useRouter } from "next/navigation"; // For navigation

const HomePage1 = () => {
  const { user } = useUser(); // Get user state
  const router = useRouter();

  const handleRedirect = () => {
    if (user) {
      router.push("/order"); // Redirect to /order if logged in
    } else {
      router.push("/login"); // Redirect to /login if not logged in
    }
  };

  return (
    <div className="h-screen w-full flex">
      {/* Left Section: Image */}
      <div className="w-1/2 flex items-center justify-center">
        <img
          src="/zurag1.png"
          alt="Card Preview"
          className="w-3/4 h-auto object-cover"
        />
      </div>

      {/* Right Section: Texts + Button */}
      <div className="w-1/2 flex flex-col items-center justify-center text-center p-6">
        {/* NFC Card Title with Custom Color */}
        <h1 className="text-9xl font-extrabold text-[#20387A] mb-4">NFC Карт</h1>

        <p className="text-2xl text-gray-700 mb-6">
          NFC карт захиалгын үйлчилгээ
        </p>

        {/* Dynamic Redirect Button */}
        <button
          onClick={handleRedirect} 
          className="flex items-center gap-3 px-36 py-8 bg-blue-500 text-white text-3xl rounded-full shadow-md hover:bg-blue-600 transition"
        >
          Захиалах <HiArrowRight className="text-3xl" />
        </button>
      </div>
    </div>
  );
};

export default HomePage1;
