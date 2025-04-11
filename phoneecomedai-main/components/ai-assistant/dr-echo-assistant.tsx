"use client";

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Trash2, Download, Copy, Check, X, 
  Volume2, VolumeX, Mic, MicOff, Settings, 
  Heart
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AIAssistantService, Message, getAIAssistant, DR_ECHO_SYSTEM_PROMPT } from '@/lib/ai-assistant';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

// Speech synthesis for text-to-speech
const initSpeechSynthesis = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  return true;
};

const speakText = (text: string, rate = 1, pitch = 1, volume = 1) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // If already speaking, stop it
  stopSpeaking();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find a good English voice, prefer female voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter(voice => voice.lang.includes('en'));
  
  if (englishVoices.length > 0) {
    // Prefer a female voice if available
    const femaleVoice = englishVoices.find(voice => voice.name.includes('Female'));
    utterance.voice = femaleVoice || englishVoices[0];
  }
  
  // Set properties
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  
  // Speak
  window.speechSynthesis.speak(utterance);
};

const stopSpeaking = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  window.speechSynthesis.cancel();
};

// Initial messages for the chat
const initialMessages: Message[] = [
  {
    id: 'system-1',
    role: 'system',
    content: DR_ECHO_SYSTEM_PROMPT,
    timestamp: new Date()
  },
  {
    id: 'welcome',
    role: 'assistant',
    content: "Hello! I'm Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?",
    timestamp: new Date()
  }
];

// Create a context to share the assistant functionality
interface DrEchoContextType {
  isOpen: boolean;
  messages: Message[];
  openAssistant: () => void;
  closeAssistant: () => void;
  sendMessage: (message: string) => Promise<void>;
  isTyping: boolean;
  clearMessages: () => void;
  textToSpeechEnabled: boolean;
  setTextToSpeechEnabled: (enabled: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speechPitch: number;
  setSpeechPitch: (pitch: number) => void;
  speechVolume: number;
  setSpeechVolume: (volume: number) => void;
  handleSpeakMessage: (text: string) => void;
  handleStopSpeaking: () => void;
}

const DrEchoContext = React.createContext<DrEchoContextType | null>(null);

// Hook to use the assistant
export function useDrEcho() {
  const context = React.useContext(DrEchoContext);
  if (!context) {
    throw new Error("useDrEcho must be used within a DrEchoProvider");
  }
  return context;
}

// Provider component
export function DrEchoProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  
  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("drEchoMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        
        // Ensure the system prompt is always present
        if (!parsedMessages.some(msg => msg.role === 'system')) {
          parsedMessages.unshift({
            id: 'system-1',
            role: 'system',
            content: DR_ECHO_SYSTEM_PROMPT,
            timestamp: new Date()
          });
        }
        
        // Fix timestamp strings (convert back to Date objects)
        const messagesWithDates = parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(messagesWithDates);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
      }
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 2) {
      localStorage.setItem("drEchoMessages", JSON.stringify(messages));
    }
  }, [messages]);
  
  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);
  
  const clearMessages = () => {
    setMessages([
      {
        id: 'system-1',
        role: 'system',
        content: DR_ECHO_SYSTEM_PROMPT,
        timestamp: new Date()
      },
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?",
        timestamp: new Date()
      }
    ]);
    localStorage.removeItem("drEchoMessages");
  };
  
  const sendMessage = async (message: string) => {
    // Don't send empty messages
    if (!message.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Get AI assistant service
    const aiAssistant = getAIAssistant();
    
    try {
      // Process the message stream
      const currentMessages = [...messages, userMessage];
      
      // Track the response text as it streams in
      let responseText = "";
      
      await aiAssistant.generateStreamingResponse(
        currentMessages,
        {
          onStart: () => {
            setIsTyping(true);
          },
          onToken: (text) => {
            responseText = text;
          },
          onComplete: (fullResponse) => {
            // Add assistant message to chat
            const assistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
            
            // Automatically speak the assistant's response if text-to-speech is enabled
            if (textToSpeechEnabled) {
              handleSpeakMessage(fullResponse);
            }
          },
          onError: (error) => {
            console.error("Error from AI service:", error);
            // Add error message
            const errorMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: "I'm sorry, I encountered an error processing your request. Please try again.",
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
          }
        }
      );
    } catch (error) {
      console.error("Error in sendMessage:", error);
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm sorry, there was an error processing your request. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };
  
  const handleSpeakMessage = (text: string) => {
    if (!textToSpeechEnabled) return;
    
    setIsSpeaking(true);
    speakText(text, speechRate, speechPitch, speechVolume);
    
    // Check every 100ms if speech synthesis is still active
    const checkSpeechInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
        clearInterval(checkSpeechInterval);
      }
    }, 100);
  };
  
  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };
  
  const value = {
    isOpen,
    messages,
    openAssistant,
    closeAssistant,
    sendMessage,
    isTyping,
    clearMessages,
    textToSpeechEnabled,
    setTextToSpeechEnabled,
    isSpeaking,
    setIsSpeaking,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    speechVolume,
    setSpeechVolume,
    handleSpeakMessage,
    handleStopSpeaking
  };
  
  return (
    <DrEchoContext.Provider value={value}>
      {children}
      {isOpen && <DrEchoDialog />}
    </DrEchoContext.Provider>
  );
}

// Button component to open the assistant
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
        className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg overflow-hidden"
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
              initial={{ x: "50%", y: "50%", opacity: 0 }}
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

// Dialog component to show the assistant chat
function DrEchoDialog() {
  const { 
    closeAssistant, 
    messages, 
    sendMessage, 
    isTyping, 
    clearMessages,
    textToSpeechEnabled,
    setTextToSpeechEnabled,
    isSpeaking,
    setIsSpeaking,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    speechVolume,
    setSpeechVolume,
    handleSpeakMessage,
    handleStopSpeaking
  } = useDrEcho();
  const [userInput, setUserInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Focus input when dialog opens
  useEffect(() => {
    inputRef.current?.focus();
    
    // Speak welcome message if this is first time opening
    const { handleSpeakMessage, textToSpeechEnabled, messages } = useDrEcho();
    if (textToSpeechEnabled && messages.length > 0) {
      // Find the welcome message (second message after system prompt)
      const welcomeMessage = messages.find(m => m.id === 'welcome');
      if (welcomeMessage) {
        handleSpeakMessage(welcomeMessage.content);
      }
    }
  }, []);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
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
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Initialize speech synthesis
  useEffect(() => {
    initSpeechSynthesis();
  }, []);
  
  const handleStartListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };
  
  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript) {
        setUserInput(transcript);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      sendMessage(userInput);
      setUserInput("");
      setTranscript("");
    }
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true);
        
        // Reset the copy state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };
  
  // Toggle text-to-speech functionality
  const toggleTextToSpeech = () => {
    const { setTextToSpeechEnabled, textToSpeechEnabled, handleStopSpeaking, isSpeaking } = useDrEcho();
    if (isSpeaking) {
      handleStopSpeaking();
    }
    setTextToSpeechEnabled(!textToSpeechEnabled);
  };
  
  const handleDownloadChat = () => {
    try {
      // Create PDF
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Dr. Echo Chat History", 20, 20);
      
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 30);
      
      doc.setFontSize(12);
      let yPosition = 40;
      
      messages.slice(1).forEach((msg) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont("helvetica", msg.role === "assistant" ? "normal" : "bold");
        doc.text(`${msg.role === "user" ? "You" : "Dr. Echo"} - ${msg.timestamp.toLocaleTimeString()}`, 20, yPosition);
        yPosition += 5;
        
        // Handle multi-line message content with word wrapping
        const contentLines = doc.splitTextToSize(msg.content, 170);
        doc.setFont("helvetica", "normal");
        
        contentLines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(line, 20, yPosition);
          yPosition += 5;
        });
        
        yPosition += 5;
      });
      
      // Save the PDF
      doc.save("dr-echo-chat.pdf");
      toast.success("Chat history downloaded");
    } catch (error) {
      console.error("Error downloading chat:", error);
      toast.error("Failed to download chat history");
    }
  };
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative flex flex-col w-full max-w-3xl h-[80vh] bg-background rounded-xl shadow-2xl overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 rounded-full items-center justify-center bg-blue-600 text-white">
              <Heart size={20} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Dr. Echo - AI Health Assistant</h2>
              <p className="text-sm text-muted-foreground">Your personal AI health assistant powered by advanced medical knowledge.</p>
            </div>
          </div>
          <button 
            onClick={closeAssistant}
            className="rounded-full p-1 hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.slice(1).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`relative max-w-[80%] px-4 py-3 rounded-lg ${
                    message.role === "assistant"
                      ? "bg-accent text-accent-foreground rounded-tl-none"
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  <div className="flex items-center justify-end gap-1 mt-1 -mb-1 opacity-50 text-[10px]">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  
                  {message.role === "assistant" && (
                    <div className="absolute -bottom-4 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleSpeakMessage(message.content)}
                              className="rounded-full p-1 bg-background text-foreground shadow-sm hover:bg-accent transition-colors"
                            >
                              <Volume2 size={12} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Speak message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleCopyToClipboard(message.content)}
                              className="rounded-full p-1 bg-background text-foreground shadow-sm hover:bg-accent transition-colors"
                            >
                              {isCopied ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-accent text-accent-foreground px-4 py-3 rounded-lg rounded-tl-none">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-current"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-current"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-current"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input area */}
        <div className="p-4 border-t">
          {isListening && (
            <div className="mb-2 px-4 py-2 bg-accent/50 rounded-lg text-accent-foreground">
              <p className="font-medium text-sm">Listening...</p>
              <p className="text-sm opacity-80">{transcript}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleTextToSpeech}
                    className={`rounded-full p-2 ${
                      textToSpeechEnabled ? "text-blue-500" : "text-muted-foreground"
                    } hover:bg-accent transition-colors`}
                  >
                    {isSpeaking ? (
                      <VolumeX size={18} className="animate-pulse" />
                    ) : (
                      <Volume2 size={18} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{textToSpeechEnabled ? "Disable" : "Enable"} text-to-speech</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="rounded-full p-2 text-muted-foreground hover:bg-accent transition-colors"
                      >
                        <Settings size={18} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h3 className="font-medium">Text-to-speech settings</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Speech rate</span>
                            <span className="text-sm text-muted-foreground">{speechRate.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[speechRate]}
                            min={0.5}
                            max={2}
                            step={0.1}
                            onValueChange={(value) => setSpeechRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Pitch</span>
                            <span className="text-sm text-muted-foreground">{speechPitch.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[speechPitch]}
                            min={0.5}
                            max={2}
                            step={0.1}
                            onValueChange={(value) => setSpeechPitch(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Volume</span>
                            <span className="text-sm text-muted-foreground">{speechVolume.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[speechVolume]}
                            min={0}
                            max={1}
                            step={0.1}
                            onValueChange={(value) => setSpeechVolume(value[0])}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className={`rounded-full p-2 ${
                      isListening ? "text-red-500" : "text-muted-foreground"
                    } hover:bg-accent transition-colors`}
                    disabled={!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListening ? "Stop" : "Start"} voice input</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your health question..."
              className="flex-1 bg-background border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="submit"
                    disabled={isTyping || !userInput.trim()}
                    className="rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </form>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 border-t flex items-center justify-between text-xs text-muted-foreground">
          <p>Dr. Echo provides general information and is not a substitute for professional medical advice.</p>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDownloadChat}
                    className="rounded-full p-1 hover:bg-accent transition-colors"
                  >
                    <Download size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download chat history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={clearMessages}
                    className="rounded-full p-1 hover:bg-accent transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear chat history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Wrapper component to add animations when component mounts/unmounts
export function DrEchoAssistant() {
  return (
    <AnimatePresence>
      <DrEchoButton />
    </AnimatePresence>
  );
} 