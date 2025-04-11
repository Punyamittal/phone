"use client";

import React, { useState, useEffect } from 'react';

// Super simple, client-side only responses that don't depend on any external API
const EMERGENCY_RESPONSES: Record<string, string> = {
  "default": "I'm Dr. Echo, your health assistant. I'm currently operating in emergency mode with limited responses. I can answer basic health questions, but please consult a healthcare professional for medical advice.",
  "hello": "Hello! I'm Dr. Echo, your EchoMed AI health assistant. I'm currently in emergency mode, but I'll do my best to help you.",
  "hi": "Hi there! I'm Dr. Echo. I'm currently using a limited response system, but I'll try to assist you.",
  "headache": "Headaches can be caused by stress, dehydration, lack of sleep, or eyestrain. For occasional headaches, rest, hydration, and over-the-counter pain relievers may help. If you experience severe or recurring headaches, please consult a healthcare professional.",
  "cold": "Common cold symptoms include runny nose, sore throat, cough, and mild fever. Rest, staying hydrated, and over-the-counter medications can help manage symptoms. If symptoms persist for more than 10 days or become severe, consult a healthcare professional.",
  "fever": "Fever is often a sign that your body is fighting an infection. Rest, staying hydrated, and taking over-the-counter fever reducers can help. If your fever is high (above 103°F/39.4°C), persists for more than three days, or is accompanied by severe symptoms, seek medical attention.",
  "sleep": "Good sleep hygiene includes maintaining a regular sleep schedule, creating a comfortable sleep environment, limiting screen time before bed, and avoiding caffeine and large meals close to bedtime. Adults typically need 7-9 hours of sleep per night.",
  "diet": "A balanced diet typically includes a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. It's important to limit processed foods, added sugars, and excessive salt. Staying hydrated by drinking plenty of water is also essential for good health.",
  "exercise": "Regular physical activity is important for maintaining good health. Adults should aim for at least 150 minutes of moderate-intensity aerobic activity or 75 minutes of vigorous activity per week, along with muscle-strengthening activities twice a week.",
  "stress": "Stress management techniques include deep breathing exercises, meditation, physical activity, adequate sleep, and maintaining social connections. If stress is significantly impacting your daily life, consider speaking with a healthcare professional.",
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type EmergencyChatProps = {
  onClose?: () => void;
};

export default function EmergencyChat({ onClose }: EmergencyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m Dr. Echo, your EchoMed AI health assistant. I\'m currently operating in emergency mode with limited responses, but I\'ll do my best to help you with your health questions.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    const chatContainer = document.getElementById('emergency-chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for exact matches
    if (EMERGENCY_RESPONSES[lowerMessage]) {
      return EMERGENCY_RESPONSES[lowerMessage];
    }
    
    // Check for keyword matches
    for (const [keyword, response] of Object.entries(EMERGENCY_RESPONSES)) {
      if (keyword !== 'default' && lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    // Return default response
    return EMERGENCY_RESPONSES['default'];
  };

  const simulateTyping = (text: string, callback: (text: string) => void) => {
    return new Promise<void>((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        callback(text.substring(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, 30); // Speed of typing simulation
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Get response
    const responseText = getResponse(inputValue);
    
    // Create temporary message for typing effect
    const tempId = 'typing-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);
    
    // Simulate typing
    let currentText = '';
    await simulateTyping(responseText, (text) => {
      currentText = text;
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === tempId ? { ...msg, content: text } : msg
        )
      );
    });
    
    // Update with final message
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === tempId ? { ...msg, id: 'response-' + Date.now() } : msg
      )
    );
    
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-auto sm:max-w-md md:max-w-lg lg:max-w-xl z-50">
      <div className="relative h-[500px] max-h-[80vh] w-full sm:w-[400px] lg:w-[500px] rounded-t-lg overflow-hidden flex flex-col bg-gray-900 border border-gray-800 shadow-xl">
        {/* Header */}
        <div className="bg-blue-500 flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-full p-2 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <div>
              <div className="font-medium text-white text-lg flex items-center gap-2">
                Dr. Echo
                <span className="bg-green-500 rounded-full w-3 h-3"></span>
              </div>
              <div className="text-white text-xs opacity-80">EchoMed AI Health Assistant</div>
            </div>
          </div>
          <button 
            className="text-white hover:bg-blue-600 p-2 rounded-full"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Messages */}
        <div id="emergency-chat-messages" className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-800 text-white'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3 text-white">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2">
            Ask me about your health, symptoms, or wellness recommendations
          </div>
          <div className="flex items-center relative">
            <textarea
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white resize-none h-10 max-h-32 outline-none"
              placeholder="Type your health question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ overflowY: 'auto' }}
              rows={1}
            />
            <button
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 