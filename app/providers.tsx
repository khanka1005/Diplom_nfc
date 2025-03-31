"use client";

import { UserProvider } from "@/app/context/UserContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
