'use client';

import { useEffect, useState } from 'react';
import NavbarWrapper from '@/components/ui/navbar';
import Homepage from "@/components/homepage";
import Features from "@/components/features";
import ContactPage from '@/components/contact';

export default function Home() {

  return (
    <main className="flex flex-col">
      <div className="min-h-screen">
        <Homepage />
      </div>
      
      <div id="features-section" className="w-full py-12">
        <Features />
      </div>
      
      <div id="contact-section" className="w-full py-12 ">
        <ContactPage />
      </div>
    </main>
  );
}
