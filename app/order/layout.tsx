import NavBar from "@/app/components/nav/NavBar";
import React from "react";
import "@/app/globals.css";

import { Providers } from "../providers";
import Toolbar from "../components/ContentSection/Toolbar";
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <NavBar />
        <Toolbar />
        <main className="flex-grow">{children}</main>
        </div>
  );
}
