// app/dashboard/template/page.tsx
'use client'
import dynamic from 'next/dynamic';


// Dynamically import the Template component with SSR disabled
const Template = dynamic(() => import('./template'), 
  { ssr: false }
);

const Page = () => {
  return <Template />;
};

export default Page;