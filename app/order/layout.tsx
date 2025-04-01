import NavBar from "@/app/components/nav/NavBar";
import React from "react";
import "@/app/globals.css";
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <NavBar />
        
        <main className="flex-grow">{children}</main>
        </div>
  );
}
