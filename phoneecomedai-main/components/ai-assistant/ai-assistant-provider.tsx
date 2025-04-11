"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type AIAssistantContextType = {
  isOpen: boolean;
  messages: Message[];
  openAssistant: () => void;
  closeAssistant: () => void;
  sendMessage: (message: string) => void;
  isTyping: boolean;
};

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your EchoMed AI assistant. How can I help you with your health today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);

  const sendMessage = (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const responses = [
        "I've analyzed your symptoms and they suggest a mild respiratory condition. Would you like me to provide more information?",
        "Based on your heart rate patterns, everything appears to be within normal ranges. Keep up the good work!",
        "I've scheduled a reminder for your medication at 8:00 PM. Would you like me to set up daily reminders?",
        "Your latest readings show improvement compared to last week. Your treatment plan appears to be effective.",
        "I've detected a slight irregularity in your readings. It's likely nothing to worry about, but I recommend discussing it with your doctor at your next appointment."
      ];
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        messages,
        openAssistant,
        closeAssistant,
        sendMessage,
        isTyping,
      }}
    >
      {children}
      {isOpen && <AIAssistantDialog />}
    </AIAssistantContext.Provider>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

function AIAssistantDialog() {
  const { closeAssistant, messages, sendMessage, isTyping } = useAIAssistant();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50 w-full max-w-md rounded-lg shadow-lg overflow-hidden glass-effect"
      >
        <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-medium">EchoMed AI Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={closeAssistant} className="text-primary-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-80 p-4 bg-background">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "600ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isTyping}>
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider");
  }
  return context;
}