"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react"; // Importing home icon

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 h-[600px] bg-white shadow-md text-gray-900 p-5 flex flex-col justify-between">
      {/* Admin Panel Title with Horizontal Line */}
      <div>
        <Link href="/dashboard">
          <h1 className="text-xl font-bold mb-3">Admin Panel</h1>
        </Link>
        <hr className="border-t-2 border-[#6C9DFF] mb-4" />
        
        {/* Navigation Links */}
        <nav className="flex flex-col gap-4">
          <Link 
            href="/dashboard/history" 
            className={`p-3 rounded ${pathname === "/dashboard/history" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            📜 History
          </Link>
          <Link 
            href="/dashboard/pending" 
            className={`p-3 rounded ${pathname === "/dashboard/pending" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            ⏳ Pending Cards
          </Link>
        </nav>
      </div>

      {/* Return Home Link with Icon */}
      <Link 
        href="/" 
        className="flex items-center gap-2 p-3 rounded hover:bg-gray-100"
      >
        <Home size={20} className="text-gray-700" />
        <span className="text-gray-700">Return Home</span>
      </Link>
    </div>
  );
};

export default Sidebar;
