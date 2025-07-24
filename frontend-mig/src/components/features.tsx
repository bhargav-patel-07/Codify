"use client";

import { GridSmallBackgroundDemo } from "./ui/background";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import React from "react";

const features = [
  {
    title: "Code Generation",
    description: "Generate clean, efficient, and well-documented code with AI assistance.",
    icon: "🧠"
  },
  {
    title: "Live Preview",
    description: "See your code in action with our integrated live preview functionality.",
    icon: "👁️"
  },
  {
    title: "Smart Suggestions",
    description: "Get intelligent code completions and suggestions as you type.",
    icon: "💡"
  },
  {
    title: "Version Control",
    description: "Easily manage and track changes to your code with built-in version control.",
    icon: "🔄"
  }
];

const Features = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to boost your productivity and build amazing applications
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300 h-full">
              <CardHeader className="flex flex-col items-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-center">{feature.title}</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  {feature.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
