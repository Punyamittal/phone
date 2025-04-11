import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain } from 'lucide-react';

interface AnimatedLoaderProps {
  message?: string;
  className?: string;
}

export default function AnimatedLoader({ 
  message = "AI processing...", 
  className 
}: AnimatedLoaderProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6",
      className
    )}>
      <div className="relative w-16 h-16 mb-4">
        {/* Pulsing circle background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-500/20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Secondary pulsing circle (delayed) */}
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-500/10"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            delay: 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-cyan-500 border-r-cyan-500 border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Rotating ring (opposite direction) */}
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-t-transparent border-r-transparent border-b-cyan-400 border-l-cyan-400"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Brain icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain className="w-8 h-8 text-cyan-500" />
          </motion.div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <p className="text-cyan-200 font-medium">{message}</p>
        <div className="mt-2 flex justify-center space-x-1">
          {[1, 2, 3, 4].map(dot => (
            <motion.div
              key={dot}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{
                opacity: [0.4, 1, 0.4],
                y: [0, -4, 0]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: dot * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 