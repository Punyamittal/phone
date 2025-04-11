"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Trash2, Download, Copy, Check, X, 
  Volume2, VolumeX, Mic, MicOff, Settings, 
  Heart
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDrEcho } from './dr-echo-context';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
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

// Dialog component to show the assistant chat
export function DrEchoDialog() {
  const { closeAssistant, messages, sendMessage, isTyping, clearMessages } = useDrEcho();
  const [userInput, setUserInput] = useState("");
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
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
  
  const toggleTextToSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    setTextToSpeechEnabled(!textToSpeechEnabled);
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
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success("Copied to clipboard");
      },
      () => {
        toast.error("Failed to copy");
      }
    );
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
                    {new Date(message.timestamp).toLocaleTimeString()}
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
                    onClick={textToSpeechEnabled ? handleStopSpeaking : toggleTextToSpeech}
                    className={`rounded-full p-2 ${
                      textToSpeechEnabled ? "text-blue-500" : "text-muted-foreground"
                    } hover:bg-accent transition-colors`}
                  >
                    {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
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