"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, Heart, Settings as Lungs, Volume2, ArrowRight, CheckCircle2 } from "lucide-react";

export function InteractiveTutorials() {
  const [activeTab, setActiveTab] = useState("heart");
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const resetTutorial = () => {
    setCurrentStep(1);
    setIsPlaying(false);
  };
  
  const startTutorial = () => {
    setIsPlaying(true);
    
    // Simulate tutorial progression
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 5) {
          clearInterval(interval);
          setIsPlaying(false);
          return 5;
        }
        return prev + 1;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  };
  
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Interactive Tutorials</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Learn how to use EchoMed effectively with these step-by-step interactive guides
        </p>
      </div>
      
      <Tabs defaultValue="heart" value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        resetTutorial();
      }}>
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="heart" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Heart Recording
            </TabsTrigger>
            <TabsTrigger value="lung" className="flex items-center gap-1">
              <Lungs className="h-4 w-4" />
              Lung Recording
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              Sound Analysis
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="heart">
          <Card>
            <CardHeader>
              <CardTitle>How to Record Heart Sounds</CardTitle>
              <CardDescription>
                Learn the proper technique for capturing clear heart sounds with your smartphone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                {/* Tutorial visualization area */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {!isPlaying && currentStep === 1 && (
                    <div className="text-center">
                      <Button size="lg" onClick={startTutorial} className="gap-2">
                        <Play className="h-4 w-4" />
                        Start Tutorial
                      </Button>
                    </div>
                  )}
                  
                  {(isPlaying || currentStep > 1) && (
                    <div className="w-full h-full p-6">
                      {currentStep === 1 && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-full"
                        >
                          <div className="text-center">
                            <h3 className="text-lg font-medium mb-2">Prepare Your Environment</h3>
                            <p className="text-sm text-muted-foreground">
                              Find a quiet room with minimal background noise for optimal recording quality.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      
                      {currentStep === 2 && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-full"
                        >
                          <div className="text-center">
                            <h3 className="text-lg font-medium mb-2">Position Your Phone</h3>
                            <p className="text-sm text-muted-foreground">
                              Place your phone's microphone directly against your chest, slightly to the left of your sternum.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      
                      {currentStep === 3 && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-full"
                        >
                          <div className="text-center">
                            <h3 className="text-lg font-medium mb-2">Remain Still</h3>
                            <p className="text-sm text-muted-foreground">
                              Hold your position steady and breathe normally. Avoid talking during the recording.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      
                      {currentStep === 4 && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-full"
                        >
                          <div className="text-center">
                            <h3 className="text-lg font-medium mb-2">Record for 30 Seconds</h3>
                            <p className="text-sm text-muted-foreground">
                              A 30-second recording provides enough data for accurate AI analysis.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      
                      {currentStep === 5 && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-full"
                        >
                          <div className="text-center">
                            <h3 className="text-lg font-medium mb-2">Tutorial Complete!</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              You're now ready to record heart sounds with EchoMed.
                            </p>
                            <Button onClick={resetTutorial}>Restart Tutorial</Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-4">Progress:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div 
                        key={step}
                        className={`h-2 w-8 rounded-full ${
                          step <= currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={resetTutorial}
                    disabled={currentStep === 1 && !isPlaying}
                  >
                    Reset
                  </Button>
                  
                  {currentStep < 5 && !isPlaying && (
                    <Button onClick={startTutorial}>
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lung">
          <Card>
            <CardHeader>
              <CardTitle>How to Record Lung Sounds</CardTitle>
              <CardDescription>
                Learn the proper technique for capturing clear lung sounds with your smartphone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Select the tutorial to begin</p>
                  <Button onClick={() => startTutorial()} className="gap-2">
                    <Play className="h-4 w-4" />
                    Start Tutorial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Sound Analysis</CardTitle>
              <CardDescription>
                Learn how to interpret the results of EchoMed's AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Select the tutorial to begin</p>
                  <Button onClick={() => startTutorial()} className="gap-2">
                    <Play className="h-4 w-4" />
                    Start Tutorial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Watch detailed video guides on using EchoMed effectively
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto flex items-center">
                  View Videos
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">User Guides</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Download comprehensive PDF guides for offline reference
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto flex items-center">
                  Download Guides
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Live Webinars</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Join interactive sessions with EchoMed experts
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto flex items-center">
                  Register Now
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}