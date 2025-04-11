"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Mic, Send } from "lucide-react";

const demoMessages = [
  { role: "assistant", content: "Hello! I'm your EchoMed AI assistant. How can I help you today?" },
  { role: "user", content: "I've been experiencing chest pain after exercising." },
  { role: "assistant", content: "I'm sorry to hear that. Can you describe the pain? Is it sharp, dull, or pressure-like? Does it radiate to other areas?" },
  { role: "user", content: "It's a sharp pain that sometimes goes to my left arm." },
  { role: "assistant", content: "Thank you for sharing that. Sharp chest pain that radiates to the left arm could be concerning. I recommend recording your heart sounds using the EchoMed app for analysis, and please consider seeking immediate medical attention as these symptoms could indicate a serious condition." }
];

export function AIAssistantDemo() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (currentMessageIndex < demoMessages.length) {
      const message = demoMessages[currentMessageIndex];
      
      if (message.role === "assistant") {
        setIsTyping(true);
        setCurrentText("");
        setCharIndex(0);
        
        const typingInterval = setInterval(() => {
          setCurrentText(prev => {
            const nextChar = message.content[charIndex];
            if (charIndex < message.content.length) {
              setCharIndex(charIndex + 1);
              return prev + nextChar;
            } else {
              clearInterval(typingInterval);
              setTimeout(() => {
                setMessages(prev => [...prev, { role: "assistant", content: message.content }]);
                setIsTyping(false);
                setCurrentMessageIndex(currentMessageIndex + 1);
              }, 500);
              return prev;
            }
          });
        }, 30);
        
        return () => clearInterval(typingInterval);
      } else {
        // For user messages, just add them immediately
        setTimeout(() => {
          setMessages(prev => [...prev, message]);
          setCurrentMessageIndex(currentMessageIndex + 1);
        }, 1000);
      }
    }
  }, [currentMessageIndex, charIndex]);

  // Start the demo after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentMessageIndex(0);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">AI Health Assistant</h2>
          <p className="text-muted-foreground text-lg">
            Get personalized health guidance, symptom analysis, and medical recommendations from our advanced AI assistant.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Your Personal Health Companion</h3>
            <p className="text-muted-foreground">
              The EchoMed AI Assistant uses advanced natural language processing to understand your health concerns and provide personalized guidance.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Natural Conversations</h4>
                  <p className="text-sm text-muted-foreground">
                    Interact naturally with the AI using everyday language to describe your symptoms and concerns.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Voice Interaction</h4>
                  <p className="text-sm text-muted-foreground">
                    Speak directly to the assistant for hands-free interaction when you're not feeling well.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Actionable Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive clear guidance and next steps based on your symptoms and health history.
                  </p>
                </div>
              </div>
            </div>
            
            <Button className="mt-4">Try the AI Assistant</Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="border-none shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-primary p-4 text-primary-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <h3 className="font-medium">EchoMed AI Assistant</h3>
                  </div>
                </div>
                
                <div className="h-96 p-4 overflow-y-auto space-y-4 bg-card">
                  {messages.map((message, index) => (
                    <div
                      key={index}
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
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                        <p className="text-sm">{currentText}</p>
                        <span className="inline-block h-4 w-1 bg-primary animate-pulse ml-1"></span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm text-muted-foreground">
                      Type your health question...
                    </div>
                    <Button size="icon" variant="ghost">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}