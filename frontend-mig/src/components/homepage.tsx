"use client";

import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Input from "./ui/input";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Homepage = () => {
  return (
    <section className="relative">
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
              Create & Test Your Code
              <span className="text-indigo-600 dark:text-indigo-400 block mt-2">Absolutely Free</span>
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
            className="fixed bottom-0 left-0 right-0 flex justify-center p-6"
          >
            <div className="w-full max-w-4xl">
              <div className="p-4 rounded-t-xl shadow-lg">
                <Input />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Homepage;
