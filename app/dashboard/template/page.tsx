// app/dashboard/template/page.tsx
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the Template component with SSR disabled
const Template = dynamic(() => import('./template'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Page = () => {
  return <Template />;
};

export default Page;