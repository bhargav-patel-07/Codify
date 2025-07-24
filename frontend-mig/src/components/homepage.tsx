"use client";

import { GridSmallBackgroundDemo } from "./ui/background";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Homepage = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GridSmallBackgroundDemo />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Build Amazing Apps with
              <span className="text-indigo-600 dark:text-indigo-400 block mt-2">AI-Powered Development</span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
              Accelerate your development workflow with our intelligent code generation and live preview features.
              Focus on what matters most - building great products.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/generate" passHref>
                <Button 
                  size="lg" 
                  color="primary" 
                  className="px-8 py-6 text-lg font-semibold"
                >
                  Generate Code Now
                </Button>
              </Link>
              <Link href="#features" passHref>
                <Button 
                  size="lg" 
                  variant="flat" 
                  className="px-8 py-6 text-lg font-semibold"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-16 md:mt-24"
          >
            <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-1 ring-1 ring-black/5 dark:ring-white/10">
              <div className="p-4 md:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="font-mono text-sm md:text-base overflow-x-auto">
                  <pre className="text-left">
                    <code className="text-gray-800 dark:text-gray-200">
                      {`// Generate React components with AI
const MyComponent = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to AI-Powered Development
      </h1>
      <p>
        Start building amazing applications faster than ever before.
      </p>
    </div>
  );
};`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Homepage;
