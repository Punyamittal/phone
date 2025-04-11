"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { healthcareSystemPrompt } from "@/lib/gemini";
import { generateDirectStreamingResponse } from "@/lib/directGemini";
import { generateFallbackStreamingResponse } from "@/lib/fallbackResponses";
import { generateFitnessResponse } from "@/lib/fitnessRecommendations";
import { generateMentalWellnessResponse } from "@/lib/mentalWellnessRecommendations";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import { 
  speakText, 
  speakLongText, 
  stopSpeaking, 
  initSpeechSynthesis, 
  isSpeechSynthesisActive,
  setSpeechRate,
  setSpeechPitch,
  setSpeechVolume
} from "@/lib/speechService";
import { Volume2, VolumeX, PlayCircle, StopCircle, Settings, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Trash, Mic, MicOff, Copy, Download, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from 'sonner';

// Component types
type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};

type GeminiAssistantContextType = {
  isOpen: boolean;
  messages: Message[];
  openAssistant: () => void;
  closeAssistant: () => void;
  sendMessage: (message: string) => void;
  isTyping: boolean;
  clearMessages: () => void;
  currentResponse: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  setTranscript: (text: string) => void;
  copyToClipboard: (text: string) => void;
  downloadChatAsPDF: () => void;
  isCopied: boolean;
  // Text-to-speech properties
  isSpeaking: boolean;
  textToSpeechEnabled: boolean;
  toggleTextToSpeech: () => void;
  speakMessage: (text: string) => void;
  stopSpeaking: () => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speechPitch: number;
  setSpeechPitch: (pitch: number) => void;
  speechVolume: number;
  setSpeechVolume: (volume: number) => void;
};

const GeminiAssistantContext = createContext<GeminiAssistantContextType | undefined>(undefined);

export function GeminiAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      role: "system",
      content: healthcareSystemPrompt,
      timestamp: new Date(),
    },
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [speechRate, setSpeechRateState] = useState(1.0);
  const [speechPitch, setSpeechPitchState] = useState(1.0);
  const [speechVolume, setSpeechVolumeState] = useState(1.0);
  
  // Use a more generic type that covers our use cases without requiring specific SpeechRecognition interface
  const recognitionRef = useRef<any>(null);

  // Test the API connection when the component mounts
  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log("Testing direct Gemini API connection...");
        const testPrompt = "Hello, this is a test. Please respond with a short greeting.";
        
        try {
          // Try the direct API first
          const directResponse = await generateDirectStreamingResponse(
            testPrompt, 
            () => {} // Empty callback since we don't need to update UI
          );
          console.log("API test successful with direct response:", directResponse.substring(0, 50) + "...");
        } catch (apiError) {
          console.error("Direct API test failed:", apiError);
          
          // Test fallback system
          console.log("Testing fallback response system...");
          const fallbackResponse = await generateFallbackStreamingResponse(
            "hi", 
            () => {}
          );
          console.log("Fallback system test successful:", fallbackResponse.substring(0, 50) + "...");
          
          // Add a note to the chat that we're using fallback responses
          setMessages(prev => [
            ...prev,
            {
              id: uuidv4(),
              role: "assistant",
              content: "Note: The AI service connection is currently unavailable. I'll be using a limited set of pre-programmed responses until the connection is restored.",
              timestamp: new Date(),
            }
          ]);
        }
      } catch (error) {
        console.error("All API tests failed:", error);
      }
    };
    
    testAPI();
  }, []);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("geminiMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Ensure the system prompt is always present
        if (!parsedMessages.some((msg: Message) => msg.role === "system")) {
          parsedMessages.unshift({
            id: "system-1",
            role: "system",
            content: healthcareSystemPrompt,
            timestamp: new Date(),
          });
        }
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    // Don't save if we only have the system message and welcome message
    if (messages.length > 2) {
      localStorage.setItem("geminiMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // Add type assertions to handle the TypeScript error
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(prev => prev + finalTranscript + interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = (event: any) => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialize speech synthesis when component mounts
  useEffect(() => {
    const initSpeech = async () => {
      await initSpeechSynthesis();
    };
    
    initSpeech();
  }, []);
  
  // Check speaking status periodically to update the UI
  useEffect(() => {
    const checkSpeakingInterval = setInterval(() => {
      setIsSpeaking(isSpeechSynthesisActive());
    }, 200);
    
    return () => clearInterval(checkSpeakingInterval);
  }, []);

  const startListening = () => {
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      console.error('Speech recognition not supported');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);

  const clearMessages = () => {
    setMessages([
      {
        id: "system-1",
        role: "system",
        content: healthcareSystemPrompt,
        timestamp: new Date(),
      },
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?",
        timestamp: new Date(),
      },
    ]);
    localStorage.removeItem("geminiMessages");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const downloadChatAsPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("EchoMed AI Health Assistant Chat", 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    // Add messages
    doc.setFontSize(10);
    let yPosition = 40;
    
    // Filter out system messages
    const chatMessages = messages.filter(msg => msg.role !== "system");
    
    chatMessages.forEach((message, index) => {
      const role = message.role === "assistant" ? "Dr. Echo" : "You";
      const timestamp = new Date(message.timestamp).toLocaleString();
      
      // Add role and timestamp
      doc.setFont("helvetica", "bold");
      doc.text(`${role} (${timestamp})`, 20, yPosition);
      yPosition += 5;
      
      // Add message content with word wrapping
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(message.content, 170);
      doc.text(splitText, 20, yPosition);
      
      // Update y position for next message
      yPosition += splitText.length * 5 + 10;
      
      // Add new page if needed
      if (yPosition > 280 && index < chatMessages.length - 1) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    // Save the PDF
    doc.save("echomed-chat.pdf");
  };

  // Toggle text-to-speech setting
  const toggleTextToSpeech = () => {
    if (textToSpeechEnabled) {
      stopSpeaking();
    }
    setTextToSpeechEnabled(!textToSpeechEnabled);
  };
  
  // Speak text and manage state
  const speakMessage = (text: string) => {
    if (!textToSpeechEnabled) return;
    
    stopSpeaking();
    setIsSpeaking(true);
    speakLongText(text);
    
    // Safety fallback - check if speaking ended
    setTimeout(() => {
      setIsSpeaking(isSpeechSynthesisActive());
    }, 1000);
  };
  
  // Update speech settings
  const handleSetSpeechRate = (rate: number) => {
    setSpeechRateState(rate);
    setSpeechRate(rate);
  };
  
  const handleSetSpeechPitch = (pitch: number) => {
    setSpeechPitchState(pitch);
    setSpeechPitch(pitch);
  };
  
  const handleSetSpeechVolume = (volume: number) => {
    setSpeechVolumeState(volume);
    setSpeechVolume(volume);
  };
  
  // Stop speaking
  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const sendMessage = async (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setCurrentResponse("");
    
    try {
      // Check if this is a fitness data query
      if (message.includes("fitness data") && message.includes("goal")) {
        console.log("Detected fitness data query, using specialized fitness response generator");
        const fitnessResponse = generateFitnessResponse(message);
        
        // Simulate streaming for better UX
        let currentText = "";
        const words = fitnessResponse.split(" ");
        
        for (let i = 0; i < words.length; i++) {
          currentText += (i === 0 ? "" : " ") + words[i];
          setCurrentResponse(currentText);
          await new Promise(resolve => setTimeout(resolve, 10)); // Small delay for streaming effect
        }
        
        // Add the final message
        const aiMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: fitnessResponse,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        
        // Speak the response if text-to-speech is enabled
        if (textToSpeechEnabled) {
          speakMessage(fitnessResponse);
        }
        
        return;
      }
      
      // Check if this is a mental wellness query
      if (message.includes("mental wellness advice") && message.includes("current state")) {
        console.log("Detected mental wellness query, using specialized mental wellness response generator");
        const wellnessResponse = generateMentalWellnessResponse(message);
        
        // Simulate streaming for better UX
        let currentText = "";
        const words = wellnessResponse.split(" ");
        
        for (let i = 0; i < words.length; i++) {
          currentText += (i === 0 ? "" : " ") + words[i];
          setCurrentResponse(currentText);
          await new Promise(resolve => setTimeout(resolve, 10)); // Small delay for streaming effect
        }
        
        // Add the final message
        const aiMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: wellnessResponse,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        
        // Speak the response if text-to-speech is enabled
        if (textToSpeechEnabled) {
          speakMessage(wellnessResponse);
        }
        
        return;
      }
      
      console.log("Attempting to use direct API implementation...");
      
      // Check if API key is available
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_api_key_here') {
        console.warn("No valid Gemini API key found. Using fallback response system.");
        
        // Use fallback response system
        const fallbackResponse = await generateFallbackStreamingResponse(
          message,
          (text) => {
            setCurrentResponse(text);
          }
        );
        
        const aiMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: fallbackResponse + "\n\nNote: I'm currently running in limited mode because the API key is not configured. Please set up the Gemini API key for full functionality.",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        if (textToSpeechEnabled) {
          speakMessage(fallbackResponse);
        }
        
        setIsTyping(false);
        return;
      }
      
      // Format a simple prompt with the system message and user's message
      const systemPrompt = "You are Dr. Echo, an EchoMed AI health assistant. Answer the following health question helpfully and accurately.";
      const fullPrompt = `${systemPrompt}\n\nUser's question: ${message}`;
      
      let apiSucceeded = false;
      let finalResponse = "";
      
      try {
        // Try the direct API implementation first
        finalResponse = await generateDirectStreamingResponse(
          fullPrompt,
          (text) => {
            setCurrentResponse(text);
          }
        );
        apiSucceeded = true;
        console.log("Direct API response successful");
      } catch (apiError) {
        console.error("Direct API failed, falling back to local responses:", apiError);
        
        // Fall back to local responses if the API fails
        finalResponse = await generateFallbackStreamingResponse(
          message,
          (text) => {
            setCurrentResponse(text);
          }
        );
        
        // Add a note to the response explaining fallback
        finalResponse += "\n\nNote: I'm currently using a limited response system because the AI service connection experienced an issue.";
        console.log("Using fallback response system");
      }
      
      // When streaming is complete, add the final message
      const aiMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: finalResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Speak the response if text-to-speech is enabled
      if (textToSpeechEnabled) {
        speakMessage(finalResponse);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      
      // Add an error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, there was an error processing your request. Please try again later.\n\nIf this persists, please check that the Gemini API key is properly configured.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      // Speak the error message if text-to-speech is enabled
      if (textToSpeechEnabled) {
        speakMessage(errorMessage.content);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const contextValue: GeminiAssistantContextType = {
    isOpen,
    messages,
    openAssistant,
    closeAssistant,
    sendMessage,
    isTyping,
    clearMessages,
    currentResponse,
    isListening,
    startListening,
    stopListening,
    transcript,
    setTranscript,
    copyToClipboard,
    downloadChatAsPDF,
    isCopied,
    // Text-to-speech functionality
    isSpeaking,
    textToSpeechEnabled,
    toggleTextToSpeech,
    speakMessage,
    stopSpeaking: handleStopSpeaking,
    speechRate,
    setSpeechRate: handleSetSpeechRate,
    speechPitch,
    setSpeechPitch: handleSetSpeechPitch,
    speechVolume,
    setSpeechVolume: handleSetSpeechVolume
  };

  return (
    <GeminiAssistantContext.Provider
      value={contextValue}
    >
      {children}
    </GeminiAssistantContext.Provider>
  );
}

function AnimatedDialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20"
    >
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl w-full">
          {children}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export function GeminiAssistantDialogWrapper() {
  const {
    isOpen,
    closeAssistant,
    messages,
    sendMessage,
    isTyping,
    clearMessages,
    currentResponse,
    isListening,
    startListening,
    stopListening,
    transcript,
    setTranscript,
    copyToClipboard,
    downloadChatAsPDF,
    isCopied,
    isSpeaking,
    textToSpeechEnabled,
    toggleTextToSpeech,
    speakMessage,
    stopSpeaking,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    speechVolume,
    setSpeechVolume,
  } = useGeminiAssistant();

  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      sendMessage(userInput);
      setUserInput("");
      setTranscript("");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <AnimatedDialog onClose={closeAssistant}>
        <DialogHeader>
          <DialogTitle>Dr. Echo - AI Health Assistant</DialogTitle>
          <DialogDescription>
            Your personal AI health assistant powered by advanced medical knowledge.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {messages.slice(2).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {message.role === "assistant" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4"
                                onClick={() =>
                                  textToSpeechEnabled
                                    ? isSpeaking
                                      ? stopSpeaking()
                                      : speakMessage(message.content)
                                    : null
                                }
                                disabled={!textToSpeechEnabled}
                              >
                                {isSpeaking ? (
                                  <StopCircle className="h-3 w-3" />
                                ) : (
                                  <PlayCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {textToSpeechEnabled
                                  ? isSpeaking
                                    ? "Stop speaking"
                                    : "Speak message"
                                  : "Text-to-speech disabled"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">
                      {currentResponse || (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Thinking...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTextToSpeech}
                    className="shrink-0"
                  >
                    {textToSpeechEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle text-to-speech</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {textToSpeechEnabled && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rate</span>
                        <span className="text-sm text-muted-foreground">
                          {speechRate.toFixed(1)}x
                        </span>
                      </div>
                      <Slider
                        value={[speechRate]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={([value]) => setSpeechRate(value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pitch</span>
                        <span className="text-sm text-muted-foreground">
                          {speechPitch.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={[speechPitch]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={([value]) => setSpeechPitch(value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Volume</span>
                        <span className="text-sm text-muted-foreground">
                          {(speechVolume * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={[speechVolume]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) => setSpeechVolume(value)}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={isListening ? transcript : userInput}
                  onChange={(e) =>
                    isListening
                      ? setTranscript(e.target.value)
                      : setUserInput(e.target.value)
                  }
                  placeholder="Type your message..."
                  className="pr-10"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={isListening ? stopListening : startListening}
                      >
                        {isListening ? (
                          <MicOff className="h-4 w-4 text-destructive" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isListening ? "Stop listening" : "Start listening"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button type="submit" disabled={!userInput.trim() && !transcript.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your conversation history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearMessages}>
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={downloadChatAsPDF}
                    className="shrink-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </AnimatedDialog>
    </AnimatePresence>
  );
}

export function useGeminiAssistant() {
  const context = useContext(GeminiAssistantContext);
  if (context === undefined) {
    throw new Error("useGeminiAssistant must be used within a GeminiAssistantProvider");
  }
  return context;
}