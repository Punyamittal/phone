"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Wand2, Database, Shield } from "lucide-react";

export function AIExplanationSection() {
  const [activeTab, setActiveTab] = useState("how-it-works");
  
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Understanding Our AI Technology</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Learn how EchoMed's artificial intelligence transforms your smartphone into a powerful diagnostic tool
        </p>
      </div>
      
      <Tabs defaultValue="how-it-works" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
            <TabsTrigger value="training">AI Training</TabsTrigger>
            <TabsTrigger value="data">Data Science</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Ethics</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="how-it-works">
          <motion.div
            key="how-it-works"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">How EchoMed's AI Works</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p>
                        EchoMed uses advanced deep learning neural networks to analyze acoustic patterns in heart and lung sounds. 
                        The process works in several stages:
                      </p>
                      
                      <ol className="space-y-2 list-decimal list-inside">
                        <li className="text-sm">
                          <span className="font-medium">Sound Capture:</span> Your smartphone's microphone records heart or lung sounds.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Noise Filtering:</span> AI algorithms filter out background noise and enhance the relevant sounds.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Feature Extraction:</span> The system identifies key acoustic features and patterns.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Pattern Analysis:</span> Neural networks compare these patterns to thousands of known conditions.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Diagnostic Assessment:</span> The AI generates results with confidence scores and recommendations.
                        </li>
                      </ol>
                      
                      <p className="text-sm text-muted-foreground">
                        This entire process happens in seconds, providing you with clinical-grade analysis without specialized equipment.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full h-full">
                        {/* Input layer */}
                        <div className="absolute left-[10%] top-0 bottom-0 flex flex-col justify-around">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <motion.div
                              key={`input-${i}`}
                              className="h-4 w-4 rounded-full bg-primary"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Hidden layer 1 */}
                        <div className="absolute left-[30%] top-0 bottom-0 flex flex-col justify-around">
                          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                            <motion.div
                              key={`hidden1-${i}`}
                              className="h-3 w-3 rounded-full bg-chart-2"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Hidden layer 2 */}
                        <div className="absolute left-[50%] top-0 bottom-0 flex flex-col justify-around">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <motion.div
                              key={`hidden2-${i}`}
                              className="h-2 w-2 rounded-full bg-chart-3"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Hidden layer 3 */}
                        <div className="absolute left-[70%] top-0 bottom-0 flex flex-col justify-around">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                              key={`hidden3-${i}`}
                              className="h-3 w-3 rounded-full bg-chart-4"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Output layer */}
                        <div className="absolute left-[90%] top-0 bottom-0 flex flex-col justify-around">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={`output-${i}`}
                              className="h-4 w-4 rounded-full bg-chart-5"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Connection lines would be added here in a real implementation */}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="training">
          <motion.div
            key="training"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                        <Wand2 className="h-4 w-4 text-chart-2" />
                      </div>
                      <h3 className="text-xl font-semibold">How Our AI Is Trained</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p>
                        EchoMed's AI models are trained on one of the world's largest datasets of heart and lung sounds, 
                        ensuring accuracy across diverse populations and conditions:
                      </p>
                      
                      <ul className="space-y-2 list-disc list-inside">
                        <li className="text-sm">
                          <span className="font-medium">Diverse Dataset:</span> Over 2 million annotated recordings from patients of all ages, genders, and ethnicities.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Clinical Validation:</span> All training data is verified by board-certified cardiologists and pulmonologists.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Continuous Learning:</span> Our models improve over time as they analyze more data, with regular updates.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Adversarial Training:</span> Models are tested against challenging cases to improve robustness.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Multi-condition Recognition:</span> Trained to identify over 40 different heart and lung conditions.
                        </li>
                      </ul>
                      
                      <p className="text-sm text-muted-foreground">
                        This extensive training process ensures that EchoMed can provide reliable analysis across a wide range of health conditions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-64 bg-muted rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1581093458791-9f3c3ae93234?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="data">
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                        <Database className="h-4 w-4 text-chart-3" />
                      </div>
                      <h3 className="text-xl font-semibold">Data Science Behind EchoMed</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p>
                        The data science powering EchoMed involves sophisticated algorithms and statistical methods:
                      </p>
                      
                      <ul className="space-y-2 list-disc list-inside">
                        <li className="text-sm">
                          <span className="font-medium">Signal Processing:</span> Advanced techniques to clean and enhance acoustic signals.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Feature Engineering:</span> Extraction of over 200 acoustic biomarkers from each recording.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Deep Learning:</span> Convolutional and recurrent neural networks for pattern recognition.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Bayesian Inference:</span> Probabilistic modeling to provide confidence intervals for diagnoses.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Ensemble Methods:</span> Multiple models working together to improve accuracy and reduce bias.
                        </li>
                      </ul>
                      
                      <p className="text-sm text-muted-foreground">
                        Our team of data scientists and medical experts continuously refine these algorithms to ensure the highest possible accuracy.
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-64 bg-muted rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="privacy">
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-full bg-chart-4/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-chart-4" />
                      </div>
                      <h3 className="text-xl font-semibold">Privacy & Ethical AI</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p>
                        At EchoMed, we prioritize privacy and ethical considerations in our AI development:
                      </p>
                      
                      <ul className="space-y-2 list-disc list-inside">
                        <li className="text-sm">
                          <span className="font-medium">Data Encryption:</span> All health data is encrypted end-to-end using military-grade encryption.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Local Processing:</span> Most analysis happens directly on your device, minimizing data transmission.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Consent-Based Learning:</span> Our AI only learns from data that users explicitly consent to share.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Bias Mitigation:</span> Regular audits to identify and eliminate potential biases in our algorithms.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Transparency:</span> Clear explanations of how AI reaches its conclusions and confidence levels.
                        </li>
                      </ul>
                      
                      <p className="text-sm text-muted-foreground">
                        We adhere to HIPAA, GDPR, and other global privacy regulations, and our ethical AI framework is reviewed by independent experts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-64 bg-muted rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1633265486064-086b219458ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </section>
  );
}