"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase, FeedbackItem } from '@/lib/supabase';
import Dock from './ui/dock';
import './ui/Dock.css';
import { Mail, Github, Linkedin, Twitter, Instagram, User, MessageCircle, X } from 'lucide-react';
import { GridBackground } from './ui/GridBackground';
import { Marquee } from './ui/marquee';

interface ContactProps {
  className?: string;
}

export default function ContactPage({ className }: ContactProps) {
  // Dock items configuration
  const dockItems = [
    {
      icon: <Mail className="w-6 h-6 text-white" />,
      onClick: () => window.location.href = 'mailto:bhargavpatel0710@gmail.com'
    },
    {
      icon: <Github className="w-6 h-6 text-white" />,
      onClick: () => window.open('https://github.com/bhargav-patel-07', '_blank')
    },
    {
      icon: <User className="w-6 h-6 text-white" />,
      onClick: () => window.open('https://bhargavpatel.vercel.app', '_blank')
    },
    {
      icon: <Linkedin className="w-6 h-6 text-white" />,
      
      onClick: () => window.open('https://linkedin.com/in/bhargavpatel0710', '_blank')
    },
    {
      icon: <Twitter className="w-6 h-6 text-white" />,
      onClick: () => window.open('https://x.com/Bhargav_0710', '_blank')
    },
    {
      icon: <Instagram className="w-6 h-6 text-white" />,
      onClick: () => window.open('https://instagram.com/yourusername', '_blank')
    }
  ];

  // State for feedback popup and form
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });

  // Toggle popup and reset form
  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
    if (!isPopupOpen) {
      setFormData({ email: '', message: '' });
      setError(null);
      setSuccessMessage(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.message) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Submitting feedback:', formData);
      
      // Get a fresh client instance to avoid any potential connection issues
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          { 
            email: formData.email.trim() || null, // Store null if email is empty
            message: formData.message.trim()
            // created_at will be automatically set by the database
          }
        ])
        .select('*')
        .single(); // We expect a single record in response

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Failed to submit feedback');
      }
      
      if (!data) {
        throw new Error('No data returned from server');
      }
      
      // Update the feedback list with the new feedback
      setFeedbackList(prev => [{
        ...data,
        created_at: new Date().toISOString() // Ensure consistent date format
      }, ...prev]);
      
      setSuccessMessage('Thank you for your feedback! We appreciate it!');
      setFormData({ email: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isPopupOpen && !target.closest('.feedback-popup')) {
        setIsPopupOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPopupOpen) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPopupOpen]);
  
  // Disable body scroll when popup is open
  useEffect(() => {
    if (isPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isPopupOpen]);

  // Fetch feedback on component mount
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setFeedbackList(data);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className={cn("min-h-screen flex flex-col text-gray-900 dark:text-gray-100 overflow-hidden relative", className)}>
      {/* Feedback Form Popup */}
      <AnimatePresence>
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md feedback-popup"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Share Your Feedback
                  </h3>
                  <button
                    onClick={togglePopup}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    aria-label="Close feedback form"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share your thoughts..."
                      rows={4}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="text-green-600 dark:text-green-400 text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                      {successMessage}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={togglePopup}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.message.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Feedback'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-y-auto">
        <GridBackground className="h-full">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Contact Me
            </h1>
            
            {/* Direct Marquee Rendering */}
            <div className="py-8">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : feedbackList.length > 0 ? (
                <Marquee 
                  feedbackItems={feedbackList} 
                  pauseOnHover={true}
                  className="py-2"
                />
              ) : (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No feedback yet. Be the first to leave a message!
                </p>
              )}
            </div>
          </div>
        </GridBackground>
      </div>

      {/* Dock and Feedback Button - Fixed at bottom */}
      <div className="w-full border-t border-gray-200/10 dark:border-gray-800/50 py-">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex-1 overflow-x-auto pb-2 pr-5">
              <Dock
                items={dockItems}
                className="bg-transparent"
                panelHeight={60}
                baseItemSize={42}
                magnification={60}
              />
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                togglePopup();
              }}
              className="flex-shrink-0 px-4 py-4 text-sm opacity-50 hover:opacity-100 text-white rounded-full font-medium bg-gray-800 hover:bg-gray-600 transition-all duration-200 shadow-md whitespace-nowrap flex items-center justify-center relative z-10"
              style={{ pointerEvents: 'auto' }}
            >
              <span className="hidden sm:inline">Feedback</span>
              <MessageCircle className="w-4 h-4 sm:hidden" />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Popup */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 left-4 sm:right-8 sm:left-auto w-auto max-w-md  border-1 rounded-xl z-50 feedback-popup"
          >
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Leave Your Feedback
                </h3>
                <button 
                  onClick={togglePopup}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Feedback Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your feedback..."
                    required
                  />
                </div>
                {error && (
                  <div className="mb-4 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 text-green-500 text-sm">
                    {successMessage}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
