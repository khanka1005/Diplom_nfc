import NavBar from "@/app/components/nav/NavBar";
import React from "react";
import "@/app/globals.css";

import { Providers } from "../providers";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
    
     
        <NavBar />
        <main className="flex-grow">{children}</main>
        </div>
 
  );
}
