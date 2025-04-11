"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedHeartProps {
  size?: number;
  color?: string;
  pulseColor?: string;
  className?: string;
  interactive?: boolean;
  initialScale?: number;
}

export function AnimatedHeart({
  size = 100,
  color = '#ff3366',
  pulseColor = '#ff6699',
  className = '',
  interactive = true,
  initialScale = 1
}: AnimatedHeartProps) {
  const [isBeating, setIsBeating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  const handleHeartClick = () => {
    if (interactive) {
      setIsBeating(true);
      setClickCount(prev => prev + 1);
      
      // Stop beating effect after 1 second
      setTimeout(() => {
        setIsBeating(false);
      }, 1000);
    }
  };
  
  // Generate dynamic animations based on click count
  const getAnimations = () => {
    // Base animations
    const animations = {
      scale: isBeating 
        ? [initialScale, initialScale * 1.2, initialScale] 
        : isHovered 
          ? [initialScale, initialScale * 1.1] 
          : initialScale,
      rotate: isBeating ? [0, -5, 5, -5, 0] : 0,
    };
    
    // Add more dynamic animations based on click count
    if (clickCount > 5) {
      return {
        ...animations,
        y: isBeating ? [0, -10, 0] : 0,
      };
    }
    
    if (clickCount > 10) {
      return {
        ...animations,
        y: isBeating ? [0, -20, 0] : 0,
        filter: isBeating ? ['brightness(100%)', 'brightness(150%)', 'brightness(100%)'] : 'brightness(100%)',
      };
    }
    
    return animations;
  };
  
  const animations = getAnimations();
  
  return (
    <div className={`heart-container relative inline-block ${className}`}>
      {/* Pulse effect on click */}
      {isBeating && (
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            backgroundImage: `radial-gradient(circle, ${pulseColor} 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />
      )}
      
      <motion.div
        className="relative cursor-pointer"
        animate={animations}
        transition={{ 
          duration: isBeating ? 0.4 : 0.3, 
          ease: isBeating ? "easeInOut" : "easeOut",
        }}
        whileHover={interactive ? { scale: initialScale * 1.1 } : {}}
        onClick={handleHeartClick}
        onHoverStart={() => interactive && setIsHovered(true)}
        onHoverEnd={() => interactive && setIsHovered(false)}
      >
        {/* SVG Heart */}
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill={color} 
          strokeWidth="0.5"
          stroke="rgba(0,0,0,0.1)"
        >
          <motion.path 
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            initial={{ pathLength: 1 }}
            animate={isBeating ? { 
              pathLength: [1, 0.97, 1],
              fill: [color, pulseColor, color] 
            } : {
              pathLength: 1,
              fill: isHovered ? pulseColor : color
            }}
            transition={{ duration: isBeating ? 0.4 : 0.3 }}
          />
        </svg>
        
        {/* Floating particles that appear when clicked multiple times */}
        {interactive && clickCount > 3 && isBeating && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                initial={{ 
                  x: size / 2, 
                  y: size / 2, 
                  opacity: 0.8,
                  scale: 0 
                }}
                animate={{ 
                  x: [size / 2, size / 2 + (Math.random() * 40 - 20)],
                  y: [size / 2, size / 2 - 40 - (i * 10)], 
                  opacity: [0.8, 0],
                  scale: [0, 1]
                }}
                transition={{ duration: 1 + (i * 0.1) }}
                style={{
                  width: 5 + i * 2,
                  height: 5 + i * 2,
                  backgroundColor: i % 2 === 0 ? color : pulseColor
                }}
              />
            ))}
          </>
        )}
      </motion.div>
      
      {/* Click counter for interactive hearts */}
      {interactive && clickCount > 0 && (
        <motion.div 
          className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          style={{ width: 20, height: 20 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={clickCount}
        >
          {clickCount}
        </motion.div>
      )}
    </div>
  );
} 