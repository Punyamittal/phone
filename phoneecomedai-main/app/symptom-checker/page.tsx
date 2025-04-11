"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ArrowRight, Brain, CheckCircle, ChevronLeft, ChevronRight, Heart, Settings as Lungs, Pill, Stethoscope } from "lucide-react";
import { useDrEcho } from "@/components/ai-assistant/dr-echo-context";

export default function SymptomCheckerPage() {
  const { openAssistant, sendMessage } = useDrEcho();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomDuration, setSymptomDuration] = useState<string | null>(null);
  const [symptomSeverity, setSymptomSeverity] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  const bodyParts = [
    { id: "head", name: "Head & Face", icon: Brain },
    { id: "chest", name: "Chest & Heart", icon: Heart },
    { id: "abdomen", name: "Abdomen", icon: Stethoscope },
    { id: "respiratory", name: "Respiratory", icon: Lungs },
    { id: "general", name: "General", icon: Pill },
  ];
  
  const symptomsByBodyPart: Record<string, string[]> = {
    head: ["Headache", "Dizziness", "Blurred vision", "Facial pain", "Ear pain", "Sore throat"],
    chest: ["Chest pain", "Heart palpitations", "Shortness of breath", "Rapid heartbeat", "Chest pressure"],
    abdomen: ["Abdominal pain", "Nausea", "Vomiting", "Diarrhea", "Constipation", "Bloating"],
    respiratory: ["Cough", "Wheezing", "Difficulty breathing", "Congestion", "Sore throat"],
    general: ["Fever", "Fatigue", "Body aches", "Chills", "Weakness", "Loss of appetite"]
  };
  
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setProgress((currentStep + 1) * 20);
    } else {
      setShowResults(true);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setProgress(currentStep * 20 - 20);
    }
  };
  
  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };
  
  const handleConsultAI = () => {
    // Prepare the message for the AI assistant
    const message = `
I'm experiencing the following symptoms:
${selectedSymptoms.join(', ')}

Location: ${selectedBodyPart ? bodyParts.find(bp => bp.id === selectedBodyPart)?.name : 'Not specified'}
Duration: ${symptomDuration || 'Not specified'}
Severity: ${symptomSeverity || 'Not specified'}

Additional information: ${additionalInfo || 'None provided'}

Based on these symptoms, what might be the possible causes, and what should I do next?
`;
    
    // Open the assistant first
    openAssistant();
    
    // Then send the message directly using the provider's sendMessage function
    // This bypasses the DOM manipulation which could be causing issues
    setTimeout(() => {
      sendMessage(message);
    }, 300);
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Where are you experiencing symptoms?</h2>
            <p className="text-muted-foreground">Select the primary area of your body where you're experiencing symptoms.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bodyParts.map((part) => (
                <Card 
                  key={part.id}
                  className={`cursor-pointer transition-all ${selectedBodyPart === part.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedBodyPart(part.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <part.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{part.name}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">What symptoms are you experiencing?</h2>
            <p className="text-muted-foreground">Select all symptoms that apply to you.</p>
            
            {selectedBodyPart && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {symptomsByBodyPart[selectedBodyPart].map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`symptom-${symptom}`} 
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => handleSymptomToggle(symptom)}
                    />
                    <Label htmlFor={`symptom-${symptom}`}>{symptom}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">How long have you been experiencing these symptoms?</h2>
            <p className="text-muted-foreground">Select the duration that best describes your symptoms.</p>
            
            <RadioGroup value={symptomDuration || ""} onValueChange={setSymptomDuration}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="less-than-day" id="less-than-day" />
                  <Label htmlFor="less-than-day">Less than a day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-3-days" id="1-3-days" />
                  <Label htmlFor="1-3-days">1-3 days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4-7-days" id="4-7-days" />
                  <Label htmlFor="4-7-days">4-7 days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-2-weeks" id="1-2-weeks" />
                  <Label htmlFor="1-2-weeks">1-2 weeks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2-4-weeks" id="2-4-weeks" />
                  <Label htmlFor="2-4-weeks">2-4 weeks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="more-than-month" id="more-than-month" />
                  <Label htmlFor="more-than-month">More than a month</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">How severe are your symptoms?</h2>
            <p className="text-muted-foreground">Select the option that best describes the severity of your symptoms.</p>
            
            <RadioGroup value={symptomSeverity || ""} onValueChange={setSymptomSeverity}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mild" id="mild" />
                  <Label htmlFor="mild">Mild - Noticeable but not interfering with daily activities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate - Somewhat interfering with daily activities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severe" id="severe" />
                  <Label htmlFor="severe">Severe - Significantly interfering with daily activities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-severe" id="very-severe" />
                  <Label htmlFor="very-severe">Very Severe - Unable to perform daily activities</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Additional Information</h2>
            <p className="text-muted-foreground">Please provide any additional details that might be relevant to your symptoms.</p>
            
            <Textarea 
              placeholder="Describe any other symptoms, relevant medical history, medications you're taking, or recent changes in your lifestyle..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const renderResults = () => {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Symptom Assessment Complete</h2>
          <p className="text-muted-foreground">
            Based on the information you've provided, here's a summary of your symptoms.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Symptom Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
              <p>{selectedBodyPart ? bodyParts.find(bp => bp.id === selectedBodyPart)?.name : 'Not specified'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Symptoms</h3>
              <ul className="list-disc pl-5">
                {selectedSymptoms.map((symptom) => (
                  <li key={symptom}>{symptom}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
              <p>{symptomDuration || 'Not specified'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Severity</h3>
              <p>{symptomSeverity || 'Not specified'}</p>
            </div>
            
            {additionalInfo && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
                <p>{additionalInfo}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Consult with AI Health Assistant</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get AI-powered insights about your symptoms and possible causes.
                  </p>
                  <Button onClick={handleConsultAI} className="mt-2">
                    Consult AI Assistant
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Schedule a Doctor Appointment</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect with a healthcare professional for a thorough evaluation.
                  </p>
                  <Button variant="outline" className="mt-2">
                    Find a Doctor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Important Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium">Medical Disclaimer</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This symptom checker is for informational purposes only and is not a qualified medical opinion. 
                    Always consult with a healthcare professional for proper diagnosis and treatment.
                  </p>
                  <p className="text-sm font-medium text-red-500 mt-2">
                    If you're experiencing severe symptoms or a medical emergency, please call emergency services immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
            setProgress(20);
            setSelectedBodyPart(null);
            setSelectedSymptoms([]);
            setSymptomDuration(null);
            setSymptomSeverity(null);
            setAdditionalInfo("");
          }}>
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">AI Symptom Checker</h1>
        <p className="text-muted-foreground mb-8">
          Answer a few questions about your symptoms for personalized health insights
        </p>
      </motion.div>
      
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          {!showResults ? (
            <>
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span>Step {currentStep} of 5</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {renderStepContent()}
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && !selectedBodyPart) ||
                    (currentStep === 2 && selectedSymptoms.length === 0) ||
                    (currentStep === 3 && !symptomDuration) ||
                    (currentStep === 4 && !symptomSeverity)
                  }
                >
                  {currentStep === 5 ? (
                    <>
                      Complete
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            renderResults()
          )}
        </CardContent>
      </Card>
    </div>
  );
}