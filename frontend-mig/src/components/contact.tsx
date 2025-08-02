"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase, FeedbackItem } from '@/lib/supabase';
import { IconX, IconSend, IconMessageCircle, IconBrandGithub, IconBrandX, IconBrandLinkedin, IconMail, IconUser, IconBrandInstagram } from '@tabler/icons-react';
import { GridBackground } from './ui/GridBackground';
import { Marquee } from './ui/marquee';

interface ContactProps {
  className?: string;
}

export default function ContactPage({ className }: ContactProps) {

  // State for feedback list
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className={cn("min-h-screen flex flex-col")}>
      <div className="flex-1">
        <GridBackground>
          <div className="w-full h-full flex items-center justify-center">
            <Marquee 
              feedbackItems={feedbackList} 
              pauseOnHover={true}
              className="w-full h-full"
            />
          </div>
        </GridBackground>
      </div>

      {/* Social Media Links */}
      <div className="py-12 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Connect with me</h3>
            <div className="flex flex-nowrap justify-center items-center gap-3 sm:gap-4 overflow-x-auto w-full py-2 px-1 hide-scrollbar">
              <a 
                href="https://github.com/bhargav-patel-07" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
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
                className="flex-shrink-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
              <button 
                onClick={() => {
                  const feedbackSection = document.getElementById('feedback-section');
                  feedbackSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all whitespace-nowrap transform hover:scale-105"
              >
                <IconMessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Feedback</span>
              </button>
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400">
              Let's build something amazing together!
            </p>
          </div>
        </div>
      </div>

      {/* Feedback will be shown in the marquee */}
    </div>
  );
}
