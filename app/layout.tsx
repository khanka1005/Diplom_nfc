// app/layout.tsx
import { Providers } from "@/app/providers"; // ✅ Import your Providers
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers> {/* ✅ Now the user state persists across all pages */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
