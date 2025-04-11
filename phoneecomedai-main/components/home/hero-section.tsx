"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeartPulse, Stethoscope, Smartphone, Brain } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                AI-Powered Healthcare
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              Transform Your Phone Into a{" "}
              <span className="text-primary">Medical Device</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-lg"
            >
              EchoMed uses advanced AI to turn your smartphone into a powerful diagnostic tool, 
              providing real-time analysis of heart and lung sounds with clinical-grade accuracy.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/learning-center">
                  Learn More
                </Link>
              </Button>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="pt-4 flex items-center space-x-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center">
                <HeartPulse className="mr-1 h-4 w-4 text-primary" />
                <span>99.2% Accuracy</span>
              </div>
              <div className="flex items-center">
                <Smartphone className="mr-1 h-4 w-4 text-primary" />
                <span>Works on Any Phone</span>
              </div>
              <div className="flex items-center">
                <Brain className="mr-1 h-4 w-4 text-primary" />
                <span>AI-Powered</span>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto w-full max-w-md">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[hsl(142,70%,45%)] to-[hsl(142,70%,45%)]/60 p-2 shadow-2xl">
                <div className="h-full w-full rounded-xl bg-[hsl(142,50%,8%)]/95 p-4 backdrop-blur">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="h-6 w-6 text-[hsl(142,70%,45%)]" />
                      <span className="font-semibold text-[hsl(142,70%,45%)]">Heart Analysis</span>
                    </div>
                    <span className="text-xs bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)] px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-16 w-full rounded-lg bg-[hsl(142,50%,8%)] relative overflow-hidden">
                      <svg 
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="none"
                        viewBox="0 0 1000 100"
                      >
                        <defs>
                          <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(142,70%,45%)" />
                            <stop offset="100%" stopColor="hsl(142,70%,35%)" />
                          </linearGradient>
                        </defs>
                        <path
                          className="ecg-line"
                          d="M 1000,50 
                             L 920,50 
                             L 900,45
                             L 880,55
                             L 860,50
                             L 840,50
                             L 820,50
                             L 800,45
                             L 780,55
                             L 760,50
                             L 740,50
                             L 720,50
                             L 700,45
                             L 680,55
                             L 660,50
                             L 640,20
                             L 620,80
                             L 600,50
                             L 580,45
                             L 560,50
                             L 540,50
                             L 520,50
                             L 500,45
                             L 480,55
                             L 460,50
                             L 440,50
                             L 420,50
                             L 400,45
                             L 380,55
                             L 360,50
                             L 340,20
                             L 320,80
                             L 300,50
                             L 280,45
                             L 260,50
                             L 240,50
                             L 220,50
                             L 200,45
                             L 180,55
                             L 160,50
                             L 140,50
                             L 120,50
                             L 100,45
                             L 80,55
                             L 60,50
                             L 40,20
                             L 20,80
                             L 0,50"
                          stroke="url(#line-gradient)"
                          strokeWidth="1.5"
                          fill="none"
                        >
                          <animate
                            attributeName="d"
                            dur="4s"
                            repeatCount="indefinite"
                            values="
                              M 1000,50 L 920,50 L 900,45 L 880,55 L 860,50 L 840,50 L 820,50 L 800,45 L 780,55 L 760,50 L 740,50 L 720,50 L 700,45 L 680,55 L 660,50 L 640,20 L 620,80 L 600,50 L 580,45 L 560,50 L 540,50 L 520,50 L 500,45 L 480,55 L 460,50 L 440,50 L 420,50 L 400,45 L 380,55 L 360,50 L 340,20 L 320,80 L 300,50 L 280,45 L 260,50 L 240,50 L 220,50 L 200,45 L 180,55 L 160,50 L 140,50 L 120,50 L 100,45 L 80,55 L 60,50 L 40,20 L 20,80 L 0,50;
                              M 1000,45 L 980,55 L 960,50 L 940,50 L 920,50 L 900,45 L 880,55 L 860,50 L 840,50 L 820,50 L 800,45 L 780,55 L 760,50 L 740,20 L 720,80 L 700,50 L 680,45 L 660,50 L 640,50 L 620,50 L 600,45 L 580,55 L 560,50 L 540,50 L 520,50 L 500,45 L 480,55 L 460,50 L 440,20 L 420,80 L 400,50 L 380,45 L 360,50 L 340,50 L 320,50 L 300,45 L 280,55 L 260,50 L 240,50 L 220,50 L 200,45 L 180,55 L 160,50 L 140,20 L 120,80 L 100,50 L 80,45 L 60,50 L 40,50 L 20,50 L 0,45;
                              M 1000,55 L 980,50 L 960,50 L 940,50 L 920,45 L 900,55 L 880,50 L 860,20 L 840,80 L 820,50 L 800,45 L 780,50 L 760,50 L 740,50 L 720,45 L 700,55 L 680,50 L 660,50 L 640,50 L 620,45 L 600,55 L 580,50 L 560,20 L 540,80 L 520,50 L 500,45 L 480,50 L 460,50 L 440,50 L 420,45 L 400,55 L 380,50 L 360,50 L 340,50 L 320,45 L 300,55 L 280,50 L 260,20 L 240,80 L 220,50 L 200,45 L 180,50 L 160,50 L 140,50 L 120,45 L 100,55 L 80,50 L 60,50 L 40,50 L 20,45 L 0,55"
                          />
                        </path>
                        <path
                          className="ecg-glow"
                          d="M 1000,50 L 950,50"
                          stroke="hsl(142,70%,45%)"
                          strokeWidth="2"
                          filter="blur(3px)"
                          opacity="0.6"
                        >
                          <animate
                            attributeName="d"
                            dur="4s"
                            repeatCount="indefinite"
                            values="
                              M 1000,50 L 960,50;
                              M 960,50 L 920,50;
                              M 920,50 L 880,50;
                              M 880,50 L 840,50;
                              M 840,50 L 800,50"
                          />
                        </path>
                      </svg>
                    </div>

                    <style jsx>{`
                      .ecg-line {
                        stroke-linecap: round;
                        stroke-linejoin: round;
                        filter: drop-shadow(0 0 2px hsl(142,70%,45%));
                      }
                      
                      .ecg-grid {
                        background-size: 20px 20px;
                        background-image: 
                          linear-gradient(to right, hsla(142,70%,45%,0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, hsla(142,70%,45%,0.1) 1px, transparent 1px);
                      }
                    `}</style>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-[hsl(142,45%,10%)] p-3">
                        <div className="text-xs text-[hsl(142,70%,45%)]/70 mb-1">Heart Rate</div>
                        <div className="text-xl font-semibold text-[hsl(142,70%,45%)]">72 BPM</div>
                      </div>
                      <div className="rounded-lg bg-[hsl(142,45%,10%)] p-3">
                        <div className="text-xs text-[hsl(142,70%,45%)]/70 mb-1">Confidence</div>
                        <div className="text-xl font-semibold text-[hsl(142,70%,45%)]">98.7%</div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-[hsl(142,45%,10%)] p-3">
                      <div className="text-xs text-[hsl(142,70%,45%)]/70 mb-1">AI Assessment</div>
                      <div className="text-sm font-medium text-[hsl(142,70%,45%)]">Normal sinus rhythm detected</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-[hsl(142,70%,45%)]/20 backdrop-blur-md" />
              <div className="absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-[hsl(142,70%,45%)]/20 backdrop-blur-md" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}