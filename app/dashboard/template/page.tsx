// app/dashboard/template/page.tsx
"use client";

import dynamic from "next/dynamic";

// ✅ Dynamically import the component with SSR disabled
const Template = dynamic(() => import("./TemplateClient"), {
  ssr: false,
});

export default function Page() {
  return <Template />;
}
