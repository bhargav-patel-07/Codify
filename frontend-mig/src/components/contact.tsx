"use client";
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Marquee } from "@/components/ui/marquee";
import { useState, useEffect } from 'react';
import { User as IconUser } from "lucide-react";
import { supabase, FeedbackItem } from "@/lib/supabase";
import { 
  IconBrandGithub, 
  IconBrandX, 
  IconBrandInstagram,
  IconBrandLinkedin,
  IconMessage,
  IconX,
  IconSend
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface FloatingDockDemoProps {
  className?: string;
}

export function FloatingDockDemo({ className }: FloatingDockDemoProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;
    
    console.log('Submitting feedback:', { email: formData.email, message: formData.message });
    setIsSubmitting(true);
    
    try {
      console.log('Sending to Supabase...');
      const { data, error, status, statusText } = await supabase
        .from('feedback')
        .insert([{ 
          email: formData.email.trim() || null, 
          message: formData.message.trim() 
        }])
        .select();

      console.log('Supabase response:', { data, error, status, statusText });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from Supabase after insert');
      }

      console.log('Feedback submitted successfully:', data[0]);
      setIsSubmitted(true);
      setFormData({ email: '', message: '' });
      
      // Refresh feedback list
      console.log('Refreshing feedback list...');
      const { data: newData, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error refreshing feedback list:', fetchError);
      } else {
        console.log('Fetched feedback items after submit:', newData?.length || 0);
        setFeedbackList(newData || []);
      }
      
      setTimeout(() => {
        setShowFeedback(false);
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      const error = err as Error & { details?: string; hint?: string; code?: string };
      console.error('Error in handleSubmit:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        stack: error.stack
      });
      setError(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fetch feedback from Supabase
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        console.log('Fetching feedback from Supabase...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...');
        
        const { data, error, status } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20); // Limit to 20 most recent feedbacks

        console.log('Supabase response:', { status, error, data });

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        if (!data) {
          console.warn('No data returned from Supabase');
          setFeedbackList([]);
          return;
        }

        console.log('Fetched feedback items:', data.length);
        setFeedbackList(data);
        setError(null);
      } catch (error) {
        const err = error as Error & { status?: number; code?: string };
        console.error('Error in fetchFeedback:', {
          message: err.message,
          name: err.name,
          stack: err.stack,
          status: err.status,
          code: err.code
        });
        setError(`Failed to load feedback: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

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
    <div className="min-h-screen w-full">
      {/* Main content area */}
      <div className="container mx-auto px-4 py-10">
        {/* Feedback Marquee Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            What People Are Saying
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading feedback...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : feedbackList.length > 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
              <Marquee 
                feedbackItems={feedbackList}
                pauseOnHover={true}
                className="py-6"
              />
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No feedback yet. Be the first to share your thoughts!
            </p>
          )}
        </section>
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

      {/* Floating Dock - Responsive positioning */}
      <div className={cn("fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4", className)}>
        <div className="pointer-events-auto">
          {/* Desktop View - Only show on md screens and up */}
          <div className="hidden md:block">
            <FloatingDock 
              items={links}
              position="fixed"
              desktopClassName="mx-auto"
              mobileClassName="hidden"
            />
          </div>
          {/* Mobile View - Only show on screens smaller than md */}
          <div className="md:hidden">
            <FloatingDock 
              items={links}
              position="fixed"
              desktopClassName="hidden"
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
