'use client';

import Homepage from "@/components/homepage";
import Features from "@/components/features";
import ContactPage from '@/components/contact';

export default function Home() {
  return (
      <main className="flex-1">
        <div id="home-section" className="min-h-screen">
          <Homepage />
        </div>
        
        <div id="features-section" className="w-full py-12">
          <Features />
        </div>
        
        <div id="contact-section" className="w-full">
          <ContactPage />
        </div>
      </main>
    
  );
}
