"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase, FeedbackItem, submitFeedback } from '@/lib/supabase';
import { IconX, IconSend, IconMessageCircle, IconBrandGithub, IconBrandX, IconBrandLinkedin, IconMail, IconUser, IconBrandInstagram } from '@tabler/icons-react';
import { GridBackground } from './ui/GridBackground';
import { Marquee } from './ui/marquee';

interface ContactProps {
  className?: string;
}

export default function ContactPage({ className }: ContactProps) {

  // State for feedback list and form
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch feedback from Supabase
  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
    } finally {
      setIsLoading(false);
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
    if (!formData.message.trim()) {
      setError('Please enter a message');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const feedbackData = {
        email: formData.email.trim() || null,
        message: formData.message.trim()
      };
      
      console.log('Submitting feedback:', feedbackData);
      
      // Directly use supabase client
      const { data, error } = await supabase
        .from('feedback')
        .insert([feedbackData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to submit feedback');
      }
      
      if (!data) {
        throw new Error('No data returned from server');
      }
      
      console.log('Feedback submitted successfully:', data);
      
      // Refresh the feedback list
      await fetchFeedback();
      
      // Reset form and show success message
      setFormData({ email: '', message: '' });
      setSubmitSuccess(true);
      
      // Close the modal after successful submission
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsFeedbackOpen(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? 
        err.message : 
        'An unknown error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set up real-time subscription to feedback changes
  useEffect(() => {
    fetchFeedback();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('feedback_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'feedback' 
        }, 
        (payload) => {
          // Refresh feedback when there are changes
          fetchFeedback();
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Function to handle feedback button click
  const handleFeedbackClick = () => {
    setIsFeedbackOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackOpen(false);
    setError(null);
    setSubmitSuccess(false);
  };

  return (
    <div className={cn("min-h-screen flex flex-col")}>
      <div className="flex-1">
        <GridBackground>
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            {/* Feedback Marquee */}
            <div className="w-full max-w-6xl h-64">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">What People Are Saying</h3>
                <button
                  onClick={handleFeedbackClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all whitespace-nowrap"
                >
                  <IconMessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Leave Feedback</span>
                </button>
              </div>
              <div className="h-48">
                <Marquee 
                  feedbackItems={feedbackList} 
                  pauseOnHover={true}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </GridBackground>
      </div>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-md bg-gray-900 rounded-xl border border-white/10 p-6 shadow-2xl">
            <button
              onClick={closeFeedbackModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close feedback form"
            >
              <IconX className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-semibold text-white mb-4">Share Your Feedback</h2>
            
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-500/20 text-green-300 rounded-md text-sm">
                Thank you for your feedback! It has been submitted successfully.
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Your Feedback <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your thoughts..."
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeFeedbackModal}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 hover:bg-white/5 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Media Links */}
      <div className="py-12 bg-gradient-to-b from-transparent to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Connect with me</h3>
            <div className="flex flex-nowrap justify-center items-center gap-3 sm:gap-4 overflow-x-auto w-full py-2 px-1 hide-scrollbar">
              <a 
                href="https://github.com/bhargav-patel-07" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="GitHub"
              >
                <IconBrandGithub className="w-8 h-8 sm:w-12 sm:h-12" />
              </a>
              <a 
                href="https://x.com/Bhargav_0710" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 text-blue-400 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <IconBrandX className="w-8 h-8 sm:w-12 sm:h-12" />
              </a>
              <a 
                href="https://bhargavpatel.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 text-purple-500 hover:text-purple-600 transition-colors"
                aria-label="Portfolio"
              >
                <IconUser className="w-8 h-8 sm:w-12 sm:h-12" />
              </a>
              <a 
                href="https://www.linkedin.com/in/bhargavpatel0710/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="LinkedIn"
              >
                <IconBrandLinkedin className="w-8 h-8 sm:w-12 sm:h-12" />
              </a>
              <a 
                href="mailto:bhargavpatel07100@gmail.com" 
                className="flex-shrink-0 text-red-500 hover:text-red-600 transition-colors"
                aria-label="Email"
              >
                <IconMail className="w-8 h-8 sm:w-12 sm:h-12" />
              </a>
              <a 
                href="https://www.instagram.com/_.bhargavv__/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 text-pink-500 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <IconBrandInstagram className="w-8 h-8 sm:w-12 sm:h-12" />
              </a>

            </div>
            <p className="mt-6 text-gray-600">
              Let's build something amazing together!
            </p>
          </div>
        </div>
      </div>

      {/* Feedback will be shown in the marquee */}
    </div>
  );
}
