"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Home, User, Settings, Coffee, TestTubeIcon, Code } from "lucide-react";
import Image from 'next/image';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';


export const CodifyLogo = () => (
  <img 
    src="/codify.png" 
    alt="Codify Logo" 
    className="h-10 w-auto" 
    width={100} 
    height={100}
  />
);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return isMobile;
};

// New hook for medium screens
const useIsMedium = () => {
  const [isMedium, setIsMedium] = useState(false);

  useEffect(() => {
    const checkIfMedium = () => {
      setIsMedium(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkIfMedium();
    window.addEventListener("resize", checkIfMedium);
    return () => window.removeEventListener("resize", checkIfMedium);
  }, []);

  return isMedium;
};

export function MobileNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMedium = useIsMedium();

  const menuItems = [
    { name: "Home", href: "#", icon: <Home size={20} /> },
    { name: "Features", href: "#features", icon: <Settings size={20} /> },
    { name: "Contact", href: "#contact", icon: <User size={20} /> },
    { name: "Generate Code", href: "#contact", icon: <Code size={20} /> },
    { name: "Test Code", href: "#contact", icon: <TestTubeIcon size={20} /> }
  ];

  return (
    <nav className="block lg:hidden fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200">
      <div className={`flex items-center justify-between ${isMedium ? 'px-4' : 'px-3'} h-14`}>
        <div className="flex items-center gap-2">
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-md focus:outline-none text-gray-900"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <CodifyLogo />
            
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isMedium && (
            <button
              onClick={async () => {
                try {
                  const { handleBuyCoffee } = await import('@/lib/razorpay');
                  handleBuyCoffee();
                } catch (error) {
                  console.error('Error loading Razorpay:', error);
                  alert('Failed to load payment service. Please try again.');
                }
              }}
              className="hidden md:flex items-center gap-1 bg-yellow-100 text-yellow-900 px-3 py-1.5 text-sm rounded-md font-medium hover:bg-yellow-200 transition"
            >
              <Coffee size={16} className="text-yellow-700" />
              <span>Buy Me Coffee</span>
            </button>
          )}
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="text-sm px-3 py-1.5 rounded-md hover:bg-gray-100 transition">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-100 text-blue-700 px-4 py-2 text-sm rounded-md font-medium hover:bg-blue-200 transition whitespace-nowrap">
                  {isMedium ? 'Get Started' : 'Sign up'}
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-2 py-2 text-gray-800 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              {item.name}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button 
                  className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-center font-medium hover:bg-blue-200 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button 
                  className="w-full bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-md text-center font-medium hover:bg-gray-50 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create account
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <button
              onClick={async () => {
                try {
                  const { handleBuyCoffee } = await import('@/lib/razorpay');
                  handleBuyCoffee();
                  setIsMenuOpen(false);
                } catch (error) {
                  console.error('Error loading Razorpay:', error);
                  alert('Failed to load payment service. Please try again.');
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-yellow-100 text-yellow-900 px-4 py-2.5 rounded-md hover:bg-yellow-200 transition font-medium"
            >
              <Coffee size={18} className="text-yellow-700" />
              Buy Me A Coffee (₹500)
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export function DesktopNavbar() {
  return (
    <div className="w-full relative bg-[url('/grid-bg.svg')] bg-repeat px-4 py-3 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <CodifyLogo />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/80 rounded-full px-3 py-1.5 border border-gray-200">
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full hover:bg-gray-100 transition whitespace-nowrap"
          >
            <Home size={16} />
            <span>Home</span>
          </a>
          <a
            href="#features"
            className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full hover:bg-gray-100 transition whitespace-nowrap"
          >
            <Settings size={16} />
            <span>Features</span>
          </a>
          <a
            href="#contact"
            className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full hover:bg-gray-100 transition whitespace-nowrap"
          >
            <User size={16} />
            <span>Contact</span>
          </a>
        </div>

        {/* Right Side Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm px-3 py-1.5 rounded-md hover:bg-gray-100 transition">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-100 text-blue-700 px-4 py-2 text-sm rounded-md font-medium hover:bg-blue-200 transition">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            onClick={() => {
              import('@/lib/razorpay').then(module => {
                module.handleBuyCoffee();
              });
            }}
            className="hidden sm:flex items-center gap-1.5 bg-yellow-100 text-yellow-900 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-200 transition whitespace-nowrap"
          >
            <Coffee size={16} />
            <span>Buy Me Coffee</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function NavbarWrapper() {
  const isMobile = useIsMobile();
  return <>{isMobile ? <MobileNavbar /> : <DesktopNavbar />}</>;
}

export default NavbarWrapper;
