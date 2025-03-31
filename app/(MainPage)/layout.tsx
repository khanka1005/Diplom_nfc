import NavBar from "@/app/components/nav/NavBar";
import Footer from "@/app/components/footer/Footer";
import "@/app/globals.css";
import { Providers } from "../providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   
   
      <div>
        <NavBar />
        <main className="flex-grow">{children}</main>
        <Footer />
        </div>

  );
}
