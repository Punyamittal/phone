"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useDrEcho } from './dr-echo-context';

export function DrEchoButton() {
  const { openAssistant } = useDrEcho();
  
  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <button 
        onClick={openAssistant}
        className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg overflow-hidden focus:outline-none"
        aria-label="Open Dr. Echo AI Health Assistant"
      >
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-blue-500/80 backdrop-blur-sm"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 animate-gradient"></div>
        
        {/* Animated ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-300/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 0.4, 0.8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Second animated ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-white/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        ></motion.div>
        
        {/* Stethoscope Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative z-10">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
          <circle cx="20" cy="10" r="2" />
        </svg>
        
        {/* Particle effects */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ 
                x: "50%", 
                y: "50%", 
                opacity: 0 
              }}
              animate={{ 
                x: `${50 + (Math.random() * 120 - 60)}%`, 
                y: `${50 + (Math.random() * 120 - 60)}%`, 
                opacity: [0, 0.8, 0] 
              }}
              transition={{ 
                duration: 1.5 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </button>
      
      {/* Tooltip */}
      <motion.div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-sm rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <span>Dr. Echo</span>
        </div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900/80"></div>
      </motion.div>
    </motion.div>
  );
}

// Add some global styles for the animation
export function DrEchoStyles() {
  return (
    <style jsx global>{`
      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 5s ease infinite;
      }
    `}</style>
  );
} 