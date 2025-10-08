'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Homepage from "@/components/homepage";
import Features from "@/components/features";
import ContactPage from '@/components/contact';

function HomeContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange, false);
    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, [pathname, searchParams]);

  return (
    <main className="flex-1">
      <div id="home" className="min-h-screen scroll-mt-20">
        <Homepage />
      </div>
      
      <div id="features" className="w-full py-12 scroll-mt-24">
        <Features />
      </div>
      
      <div id="contact" className="w-full scroll-mt-20">
        <ContactPage />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
