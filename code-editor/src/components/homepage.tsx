"use client";

import Switch from "./ui/Switch";
import Input from "./ui/input";
import NavbarWrapper from "./ui/navbar";

const Homepage = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <NavbarWrapper />
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Create & Test Your Code
              <span className="text-indigo-600 block mt-1 sm:mt-2">Absolutely Free</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2 sm:px-0">
              Accelerate your development workflow with our intelligent code generation and live preview features.
              <span className="block sm:inline"> Focus on what matters most - building great products.</span>
            </p>
            
            <div className="pt-4 sm:pt-6 w-full flex justify-center">
              <div className="w-full max-w-md px-2 sm:px-0">
                <div className="flex justify-center">
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="sticky bottom-0 left-0 right-0  px-2 sm:px-4 py-3 z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="w-full max-w-4xl mx-auto">
            <Input />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
