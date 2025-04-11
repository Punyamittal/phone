"use client";

import { useState, useEffect } from 'react';
import { AIAssistantService } from '@/lib/ai-assistant';
import { v4 as uuidv4 } from 'uuid';

export default function TestAIPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  useEffect(() => {
    // Initialize the AI assistant
    const aiAssistant = new AIAssistantService();
    
    // Get the status
    const assistantStatus = aiAssistant.getStatus();
    setStatus(assistantStatus);
    
    // Add a system message
    setMessages([
      {
        id: uuidv4(),
        role: 'system',
        content: 'You are Dr. Echo, an AI health assistant.',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Create a new instance of the AI assistant
      const aiAssistant = new AIAssistantService();
      
      // Generate a response
      let fullResponse = '';
      
      await aiAssistant.generateStreamingResponse(
        [...messages, userMessage],
        {
          onStart: () => {
            setResponse('');
          },
          onToken: (token) => {
            fullResponse = token;
            setResponse(token);
          },
          onComplete: (completeResponse) => {
            // Add assistant message
            const assistantMessage = {
              id: uuidv4(),
              role: 'assistant',
              content: completeResponse,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
          },
          onError: (error) => {
            console.error('Error generating response:', error);
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Test AI Assistant</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Status:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(status, null, 2)}
        </pre>
      </div>
      
      <div className="border rounded-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.filter(m => m.role !== 'system').map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <div className="font-semibold mb-1">
              {message.role === 'user' ? 'You' : 'Dr. Echo'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-gray-100 rounded-lg p-3 mr-auto max-w-[80%]">
            <div className="font-semibold mb-1">Dr. Echo</div>
            <div className="whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-l-lg"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg disabled:bg-blue-300"
        >
          Send
        </button>
      </div>
    </div>
  );
} 