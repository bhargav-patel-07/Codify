"use client";
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useState } from 'react';
import { User as IconUser } from "lucide-react";
import { 
  IconBrandGithub, 
  IconBrandX, 
  IconBrandInstagram,
  IconBrandLinkedin,
  IconMessage,
  IconX,
  IconSend
} from "@tabler/icons-react";

export function FloatingDockDemo() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowFeedback(false);
        setIsSubmitted(false);
        setFormData({ email: '', message: '' });
      }, 3000);
    }, 1000);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const links = [
   
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/bhargav-patel-07",
    },
    {
      title: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.linkedin.com/in/bhargavpatel0710/#",
    },
    {
      title: "Portfolio",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://bhargavpatel.vercel.app/",
    }, 
    {
      title: "Twitter",
      icon: (
        <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://x.com/Bhargav_0710",
    },
    {
      title: "Instagram",
      icon: (
        <IconBrandInstagram className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.instagram.com/_.bhargavv__/",
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Main content area - flex-grow to push the dock to bottom */}
      <div className="flex-grow container mx-auto px-4 py-20">
        {/* Your page content will go here */}
      </div>

      {/* Feedback Button and Popup - Desktop */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        {/* Feedback Popup */}
        <div 
          className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${showFeedback ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setShowFeedback(false)}
        ></div>
        
        <div 
          className={`fixed right-8 bottom-24 transition-all duration-300 transform ${showFeedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          style={{ zIndex: 50 }}
        >
          {showFeedback && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-[360px] border border-border" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send us your feedback</h3>
                <button 
                  onClick={() => setShowFeedback(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Close feedback form"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>
              
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Thank You!</h4>
                  <p className="text-gray-600 dark:text-gray-300">Your feedback has been submitted.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Your feedback..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
        
        {/* Desktop Feedback Button */}
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          aria-label={showFeedback ? 'Close feedback form' : 'Open feedback form'}
        >
          <IconMessage className="h-5 w-5" />
          <span>Feedback</span>
        </button>
      </div>
      
      {/* Mobile Feedback Button - Fixed at bottom */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          aria-label={showFeedback ? 'Close feedback form' : 'Open feedback form'}
        >
          <IconMessage className="h-6 w-6" />
        </button>
      </div>
      
      {/* Mobile Popup - Full Screen */}
      {showFeedback && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setShowFeedback(false)}>
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Send us your feedback</h3>
                <button 
                  onClick={() => setShowFeedback(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Close feedback form"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Thank You!</h4>
                  <p className="text-gray-600 dark:text-gray-300">Your feedback has been submitted.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="mobile-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="mobile-email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobile-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      id="mobile-message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base"
                      placeholder="Your feedback..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <IconSend className="mr-2 h-5 w-5" />
                        Send Feedback
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Dock */}
      <div className="fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
        <div className="flex justify-center">
          <div className="pointer-events-auto">
            <FloatingDock 
              items={links}
              desktopClassName="mx-auto"
              mobileClassName="mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the component as default
export default FloatingDockDemo;
