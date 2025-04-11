"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Shield, 
  Database, 
  Users, 
  ExternalLink,
  ChevronRight
} from "lucide-react";

export function TransparencySection() {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Transparency & Trust</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          We believe in complete transparency about how our AI works, how we use your data, and the limitations of our technology
        </p>
      </div>
      
      <Tabs defaultValue="model">
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="model">AI Model</TabsTrigger>
            <TabsTrigger value="data">Data Usage</TabsTrigger>
            <TabsTrigger value="limitations">Limitations</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="model">
          <Card>
            <CardHeader>
              <CardTitle>Our AI Model Architecture</CardTitle>
              <CardDescription>
                Understanding how EchoMed's neural networks process and analyze health sounds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Model Architecture</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    EchoMed uses a specialized convolutional neural network (CNN) architecture optimized for acoustic signal processing. 
                    Our model consists of:
                  </p>
                  
                  <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                    <li>Input layer for raw audio waveforms</li>
                    <li>Multiple convolutional layers for feature extraction</li>
                    <li>Attention mechanisms to focus on relevant sound patterns</li>
                    <li>Recurrent layers to capture temporal dependencies</li>
                    <li>Classification layers for condition identification</li>
                    <li>Confidence scoring mechanisms</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Training Methodology</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our models are trained using a combination of supervised learning on clinically validated datasets 
                    and transfer learning from larger acoustic models. Key aspects include:
                  </p>
                  
                  <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                    <li>Multi-stage training process with clinical validation</li>
                    <li>Diverse training data across demographics and conditions</li>
                    <li>Rigorous testing against gold-standard medical devices</li>
                    <li>Regular retraining with new validated data</li>
                    <li>Adversarial testing to improve robustness</li>
                  </ul>
                </div>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Technical Documentation</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      For researchers and technical users, we provide detailed documentation on our model architecture, 
                      training methodology, and performance metrics.
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      View Technical Papers
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Usage & Privacy</CardTitle>
              <CardDescription>
                How we collect, store, and use your health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Data Collection</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We collect the following types of data when you use EchoMed:
                  </p>
                  
                  <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                    <li>Audio recordings of heart and lung sounds</li>
                    <li>Basic health information you provide</li>
                    <li>App usage patterns to improve user experience</li>
                    <li>Device information for optimization</li>
                  </ul>
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    All data collection is opt-in, and you can review or delete your data at any time.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Data Protection</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We implement industry-leading security measures to protect your health data:
                  </p>
                  
                  <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                    <li>End-to-end encryption for all data transmission</li>
                    <li>On-device processing when possible</li>
                    <li>Anonymization of data used for research</li>
                    <li>Regular security audits by third parties</li>
                    <li>HIPAA and GDPR compliance</li>
                  </ul>
                </div>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Privacy Policy</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      Our comprehensive privacy policy details exactly how we collect, process, store, and protect your data.
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      Read Privacy Policy
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="limitations">
          <Card>
            <CardHeader>
              <CardTitle>Technology Limitations</CardTitle>
              <CardDescription>
                Understanding the current capabilities and limitations of EchoMed's AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">What EchoMed Can Do</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span>Detect common heart and lung sound patterns with high accuracy</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span>Identify potential abnormalities that warrant medical attention</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span>Monitor changes in heart and lung sounds over time</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span>Provide educational insights about your health data</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span>Generate reports to share with healthcare providers</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">What EchoMed Cannot Do</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                      <span>Replace professional medical diagnosis or treatment</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                      <span>Detect all possible heart or lung conditions with 100% accuracy</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                      <span>Provide emergency medical advice or crisis intervention</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                      <span>Function optimally in extremely noisy environments</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                      <span>Prescribe medications or specific treatments</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium">Important Notice</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      EchoMed is designed to be a supplementary tool to help monitor your health and facilitate 
                      conversations with healthcare providers. It is not intended to diagnose, treat, cure, or prevent 
                      any disease. Always consult with qualified healthcare professionals for medical advice.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="research">
          <Card>
            <CardHeader>
              <CardTitle>Research & Validation</CardTitle>
              <CardDescription>
                Scientific research and clinical validation behind EchoMed's technology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Clinical Studies</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    EchoMed's technology has been validated through multiple clinical studies:
                  </p>
                  
                  <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                    <li>Multi-center study across 12 hospitals (2023-2024)</li>
                    <li>Comparative analysis with traditional stethoscopes</li>
                    <li>Longitudinal monitoring study in chronic conditions</li>
                    <li>Validation across diverse patient populations</li>
                    <li>Real-world accuracy assessment in clinical settings</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Peer-Reviewed Research</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our technology is backed by peer-reviewed publications in leading medical and AI journals:
                  </p>
                  
                  <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                    <li>"Smartphone-based cardiac auscultation: a machine learning approach" (2023)</li>
                    <li>"Deep learning for respiratory sound classification in resource-limited settings" (2023)</li>
                    <li>"Comparative analysis of mobile health diagnostic tools for cardiac monitoring" (2024)</li>
                    <li>"AI-assisted auscultation: clinical validation and implementation" (2024)</li>
                  </ul>
                </div>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Research Repository</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      Access our complete research repository, including published papers, preprints, and technical reports.
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      View Research Papers
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}