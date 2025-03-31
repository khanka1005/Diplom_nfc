import Sidebar from "./components/SideBar";
import "@/app/globals.css";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
       
            <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <Sidebar />
  
        {/* Right Content (Dynamic) */}
        <div className="flex-1 p-6">{children}</div>
      </div>
           
      
    );
  }