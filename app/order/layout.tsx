
import React from "react";
import "@/app/globals.css";
import OrderNavBar from "@/app/components/nav/OrderNavbar";
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <OrderNavBar />
        
        <main className="flex-grow">{children}</main>
        </div>
  );
}
