"use client";

import Link from "next/link";
import { useUser } from "@/app/context/UserContext";
import { signOut } from "firebase/auth";
import { getAuthClient } from "@/firebaseConfig";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

const NavBar = () => {
  const { user, userName, setUserName, authLoading } = useUser(); // ✅ All hooks first
  const router = useRouter();

  if (authLoading) return null;

  const handleLogout = async () => {
    try {
      const auth = getAuthClient();
      await signOut(auth);
      setUserName(null);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="text-black pt-10 py-4 px-8 shadow-md">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold hover:text-gray-400 transition">
          NFC_Card
        </Link>

        <div className="flex gap-6 items-center">
          <Link href="/dashboard" className="hover:text-gray-400">Dashboard</Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold text-blue-600">
                {userName || "Loading..."}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 border border-red-500 px-4 py-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                <FiLogOut /> Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="border border-blue-500 px-6 py-2 rounded-lg text-blue-500 hover:bg-blue-500 hover:text-white transition"
              >
                Нэвтрэх
              </Link>
              <Link
                href="/register"
                className="border border-blue-500 px-6 py-2 rounded-lg text-blue-500 hover:bg-blue-500 hover:text-white transition"
              >
                Бүртгүүлэх
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
