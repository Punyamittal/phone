"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getStreamingAIResponse } from '@/lib/geminiDirect';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, Mic, MicOff, Send, Image, File, X, Plus, Trash2, Heart, ThumbsUp, ThumbsDown, Bookmark, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, Paperclip, ChevronDown, Volume2, VolumeX, PlayCircle, StopCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { 
  speakText, 
  speakLongText, 
  stopSpeaking, 
  initSpeechSynthesis, 
  isSpeechSynthesisActive,
  setSpeechRate as setTTSRate,
  setSpeechPitch as setTTSPitch,
  setSpeechVolume as setTTSVolume
} from '@/lib/speechService';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  bookmarked?: boolean;
  rating?: 'like' | 'dislike';
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
};

type DirectGeminiChatProps = {
  onClose?: () => void;
};

// Speech recognition type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function DirectGeminiChat({ onClose }: DirectGeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [attachments, setAttachments] = useState<Array<{type: 'image' | 'file', file: File, preview: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<any>(null);
  const [theme, setTheme] = useState<'blue' | 'teal' | 'purple'>('blue');
  
  // Add text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [activeSpeakingMessageId, setActiveSpeakingMessageId] = useState<string | null>(null);
  
  // Add disease-related suggestions for common health queries
  const healthSuggestions = [
    "What are the symptoms of diabetes?", 
    "Can you explain how COVID-19 is transmitted?",
    "What treatments are available for migraine headaches?",
    "What causes high blood pressure?",
    "How can I manage my anxiety symptoms?",
    "What are the early signs of heart disease?",
    "How are seasonal allergies treated?"
  ];
  
  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = 'en-US';
        
        // Set a longer timeout for speech detection
        recognition.current.speechRecognitionTimeout = 10000; // 10 seconds
        
        recognition.current.onstart = () => {
          setIsListening(true);
          setInterimTranscript('');
          setTranscript('');
          toast.success("Voice input started - Please start speaking");
        };
        
        recognition.current.onresult = (event: any) => {
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
          
          // Update state with transcriptions
          setInterimTranscript(interimTranscript);
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript + ' ');
            setInputValue(prev => prev + finalTranscript + ' ');
          }
        };
        
        recognition.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          if (event.error === 'no-speech') {
            toast.warning("No speech detected. Please try again.");
          } else {
            toast.error(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
        };
        
        recognition.current.onend = () => {
          // Only automatically submit if we have a meaningful transcript
          const finalTranscriptToUse = transcript.trim();
          if (finalTranscriptToUse && finalTranscriptToUse.length > 3 && isListening) {
            setInputValue(finalTranscriptToUse);
            // Small delay to ensure the input value is set before sending
            setTimeout(() => {
              handleSendVoiceMessage(finalTranscriptToUse);
            }, 300);
          }
          setIsListening(false);
        };
      }
      
      // Initialize speech synthesis
      initSpeechSynthesis();
    }
    
    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (err) {
          console.error('Error stopping recognition on cleanup:', err);
        }
      }
      stopSpeaking();
    };
  }, []);
  
  // Check speaking status periodically to update the UI
  useEffect(() => {
    const checkSpeakingInterval = setInterval(() => {
      const currentlySpeaking = isSpeechSynthesisActive();
      setIsSpeaking(currentlySpeaking);
      
      // If speech has stopped, clear the active message
      if (!currentlySpeaking && isSpeaking) {
        setActiveSpeakingMessageId(null);
      }
    }, 200);
    
    return () => clearInterval(checkSpeakingInterval);
  }, [isSpeaking]);
  
  // Toggle text-to-speech setting
  const toggleTextToSpeech = () => {
    if (textToSpeechEnabled) {
      stopSpeaking();
      setActiveSpeakingMessageId(null);
    }
    setTextToSpeechEnabled(!textToSpeechEnabled);
    toast.success(textToSpeechEnabled ? "Voice output disabled" : "Voice output enabled");
  };
  
  // Speak text and manage state
  const speakMessage = (text: string, messageId: string) => {
    if (!textToSpeechEnabled) return;
    
    // If we're already speaking this message, stop it
    if (activeSpeakingMessageId === messageId) {
      stopSpeaking();
      setActiveSpeakingMessageId(null);
      return;
    }
    
    // Otherwise, stop any current speech and start speaking this message
    stopSpeaking();
    setIsSpeaking(true);
    setActiveSpeakingMessageId(messageId);
    speakLongText(text);
  };
  
  // Update speech settings with feedback
  const handleSetSpeechRate = (rate: number) => {
    setSpeechRate(rate);
    setTTSRate(rate);
  };
  
  const handleSetSpeechPitch = (pitch: number) => {
    setSpeechPitch(pitch);
    setTTSPitch(pitch);
  };
  
  const handleSetSpeechVolume = (volume: number) => {
    setSpeechVolume(volume);
    setTTSVolume(volume);
  };
  
  // Stop speaking
  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setActiveSpeakingMessageId(null);
  };
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognition.current) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isListening) {
      // Stop listening and process the final transcript
      try {
        recognition.current.stop();
        // Note: The onend handler will handle sending the message if there's content
      } catch (err) {
        console.error('Error stopping recognition:', err);
        setIsListening(false);
      }
    } else {
      // Clear any previous transcript and start listening
      setTranscript('');
      setInterimTranscript('');
      try {
        recognition.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        toast.error("Could not start voice recognition. Please try again.");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachments: attachments.map(attachment => ({
        type: attachment.type,
        url: attachment.preview,
        name: attachment.file.name
      }))
    };
    
    // Add message to history
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and attachments
    setInputValue('');
    setAttachments([]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Set up a variable to collect the response
      let fullResponse = '';
      
      // Custom handler for medical queries to ensure accurate information
      const isHealthQuery = detectHealthQuery(inputValue);
      
      // Start the streaming response
      await getStreamingAIResponse(
        // For health queries, add specialized prompt to ensure high quality response
        isHealthQuery 
          ? `I need medically accurate information about: ${inputValue}. 
             Please structure your response with clearly labeled sections (Description, Symptoms, Diagnosis, Treatment, etc).
             Cite reliable sources when possible.`
          : inputValue,
        (text) => {
          fullResponse = text;
          // Update UI with current text as it streams in
          const tempMessage: Message = {
            id: 'temp-response',
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date()
          };
          setMessages(prev => {
            // Remove any previous temporary message
            const filtered = prev.filter(m => m.id !== 'temp-response');
            return [...filtered, tempMessage];
          });
        }
      );
      
      // Hide typing indicator when done
      setIsTyping(false);
      
      // Replace temporary message with final one
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'temp-response');
        const finalMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date()
        };
        return [...filtered, finalMessage];
      });
      
      // Optionally read message aloud if text-to-speech is enabled
      if (textToSpeechEnabled && fullResponse) {
        // For health-related responses, only speak a summarized version to avoid overwhelming
        if (isHealthQuery && fullResponse.length > 500) {
          const summaryForSpeech = `Here's a summary about ${inputValue}: ${fullResponse.split('.').slice(0, 3).join('.')}. Would you like me to elaborate on any specific aspect?`;
          speakMessage(summaryForSpeech, 'summary');
        } else {
          speakMessage(fullResponse, 'response');
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
      setMessages(prev => {
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: "I'm sorry, I encountered a problem processing your request. Please try again or rephrase your question.",
          timestamp: new Date()
        };
        return [...prev, errorMessage];
      });
      toast.error("Error connecting to AI service. Please try again.");
    }
  };

  // Add a dedicated function for handling voice messages
  const handleSendVoiceMessage = async (voiceInput: string) => {
    if (!voiceInput.trim()) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: voiceInput,
      timestamp: new Date(),
    };
    
    // Add message to history
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and reset transcript
    setInputValue('');
    setTranscript('');
    setInterimTranscript('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Set up a variable to collect the response
      let fullResponse = '';
      
      // Custom handler for medical queries to ensure accurate information
      const isHealthQuery = detectHealthQuery(voiceInput);
      
      // Start the streaming response
      await getStreamingAIResponse(
        // For health queries, add specialized prompt to ensure high quality response
        isHealthQuery 
          ? `I need medically accurate information about: ${voiceInput}. 
             Please structure your response with clearly labeled sections (Description, Symptoms, Diagnosis, Treatment, etc).
             Cite reliable sources when possible.`
          : voiceInput,
        (text) => {
          fullResponse = text;
          // Update UI with current text as it streams in
          const tempMessage: Message = {
            id: 'temp-response',
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date()
          };
          setMessages(prev => {
            // Remove any previous temporary message
            const filtered = prev.filter(m => m.id !== 'temp-response');
            return [...filtered, tempMessage];
          });
        }
      );
      
      // Hide typing indicator when done
      setIsTyping(false);
      
      // Replace temporary message with final one
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'temp-response');
        const finalMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date()
        };
        return [...filtered, finalMessage];
      });
      
      // Optionally read message aloud if text-to-speech is enabled
      if (textToSpeechEnabled && fullResponse) {
        // For health-related responses, only speak a summarized version to avoid overwhelming
        if (isHealthQuery && fullResponse.length > 500) {
          const summaryForSpeech = `Here's a summary about ${voiceInput}: ${fullResponse.split('.').slice(0, 3).join('.')}. Would you like me to elaborate on any specific aspect?`;
          speakMessage(summaryForSpeech, 'summary');
        } else {
          speakMessage(fullResponse, 'response');
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
      setMessages(prev => {
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: "I'm sorry, I encountered a problem processing your request. Please try again or rephrase your question.",
          timestamp: new Date()
        };
        return [...prev, errorMessage];
      });
      toast.error("Error connecting to AI service. Please try again.");
    }
  };

  // Helper function to detect health-related queries
  const detectHealthQuery = (query: string): boolean => {
    const healthKeywords = [
      'disease', 'condition', 'disorder', 'syndrome', 'infection', 'cancer',
      'diabetes', 'asthma', 'arthritis', 'heart', 'blood pressure', 'hypertension',
      'covid', 'flu', 'virus', 'bacterial', 'chronic', 'acute',
      'symptom', 'pain', 'ache', 'fever', 'cough', 'headache', 'migraine',
      'nausea', 'vomiting', 'diarrhea', 'constipation', 'fatigue', 'tired',
      'dizzy', 'dizziness', 'rash', 'allergy', 'itchy', 'sore', 'swelling',
      'stomach', 'head', 'chest', 'throat', 'lung', 'liver', 'kidney',
      'joint', 'muscle', 'bone', 'skin', 'blood', 'heart',
      'treatment', 'cure', 'medication', 'medicine', 'drug', 'therapy',
      'doctor', 'hospital', 'diagnosis', 'diagnosed', 'surgery',
      'health', 'unwell', 'sick', 'ill', 'suffering'
    ];
    
    const normalizedQuery = query.toLowerCase();
    return healthKeywords.some(keyword => normalizedQuery.includes(keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAttachments(prev => [...prev, {
        type: type === 'image' ? 'image' : 'file',
        file: file,
        preview: result
      }]);
    };
    
    if (type === 'image') {
      reader.readAsDataURL(file);
    } else {
      // For non-image files, we'll just use the file name and icon
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  const handleFileClick = (type: 'file' | 'image') => {
    if (type === 'file') {
      fileInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const bookmarkMessage = (id: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, bookmarked: !msg.bookmarked } : msg
      )
    );
    toast.success("Message bookmarked for later reference");
  };
  
  const rateMessage = (id: string, rating: 'like' | 'dislike') => {
    setMessages(prev => 
      prev.map(msg => {
        // If this message already has this rating, remove it
        if (msg.id === id && msg.rating === rating) {
          return { ...msg, rating: undefined };
        }
        // Otherwise set the new rating
        return msg.id === id ? { ...msg, rating } : msg;
      })
    );
    
    if (rating === 'like') {
      toast.success("Thanks for the positive feedback!");
    } else {
      toast.success("Thanks for your feedback. We'll work to improve.");
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?',
        timestamp: new Date(),
      }]);
      toast.success("Chat history cleared");
    }
  };
  
  const downloadChat = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255);
    doc.text("Dr. Echo Chat History", 20, 20);
    doc.setTextColor(0, 0, 0);
    
    // Add timestamp
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    let yPosition = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add each message
    messages.forEach((msg) => {
      // Add sender
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 255);
      doc.text(`${msg.role === 'user' ? 'You' : 'Dr. Echo'} - ${msg.timestamp.toLocaleTimeString()}`, 20, yPosition);
      yPosition += 10;
      
      // Add message content with word wrap
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      const textLines = doc.splitTextToSize(msg.content, pageWidth - 40);
      
      // Check if we need a new page
      if (yPosition + textLines.length * 7 > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(textLines, 20, yPosition);
      yPosition += textLines.length * 7 + 10;
    });
    
    // Save the PDF
    doc.save("dr-echo-chat.pdf");
    toast.success("Chat history downloaded as PDF");
  };

  const getThemeColors = () => {
    switch(theme) {
      case 'teal':
        return {
          headerFrom: 'from-teal-600',
          headerTo: 'to-teal-500',
          accent: 'bg-teal-700', 
          highlight: 'text-teal-400',
          hover: 'hover:bg-teal-600',
          button: 'bg-teal-500 hover:bg-teal-600',
          userMessageFrom: 'from-teal-500',
          userMessageTo: 'to-teal-600'
        };
      case 'purple':
        return {
          headerFrom: 'from-purple-600',
          headerTo: 'to-purple-500',
          accent: 'bg-purple-700',
          highlight: 'text-purple-400',
          hover: 'hover:bg-purple-600',
          button: 'bg-purple-500 hover:bg-purple-600',
          userMessageFrom: 'from-purple-500',
          userMessageTo: 'to-purple-600'
        };
      default: // blue
        return {
          headerFrom: 'from-blue-600',
          headerTo: 'to-blue-500',
          accent: 'bg-blue-700',
          highlight: 'text-blue-400',
          hover: 'hover:bg-blue-600',
          button: 'bg-blue-500 hover:bg-blue-600',
          userMessageFrom: 'from-blue-500',
          userMessageTo: 'to-blue-600'
        };
    }
  };

  const themeColors = getThemeColors();

  const changeTheme = (newTheme: 'blue' | 'teal' | 'purple') => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  return (
    <motion.div 
      className="fixed bottom-0 right-0 w-full sm:w-auto sm:max-w-md md:max-w-lg lg:max-w-xl z-50 p-4 sm:p-0 sm:mb-20 sm:mr-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-[600px] max-h-[80vh] w-full sm:w-[400px] lg:w-[500px] rounded-xl overflow-hidden flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 shadow-2xl">
        {/* Header */}
        <motion.div 
          className={`bg-gradient-to-r ${themeColors.headerFrom} ${themeColors.headerTo} flex items-center justify-between px-4 py-3`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center">
            <div className={`${themeColors.accent} rounded-full p-2 mr-2 shadow-lg`}>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "mirror", 
                  duration: 2,
                  repeatDelay: 5
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                  <circle cx="20" cy="10" r="2" />
                </svg>
              </motion.div>
            </div>
            <div>
              <div className="font-semibold text-white text-lg flex items-center gap-2">
                Dr. Echo
                <motion.span 
                  className="bg-green-500 rounded-full w-3 h-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                ></motion.span>
              </div>
              <div className="text-white text-xs opacity-80">EchoMed AI Health Assistant</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative group">
              <button
                className="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-all"
                title="Change theme"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-1 hidden group-hover:flex bg-gray-800 rounded-lg shadow-xl overflow-hidden z-10 flex-col w-28">
                <button onClick={() => changeTheme('blue')} className="px-3 py-2 hover:bg-blue-800 text-left text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-white">Blue</span>
                </button>
                <button onClick={() => changeTheme('teal')} className="px-3 py-2 hover:bg-teal-800 text-left text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <span className="text-white">Teal</span>
                </button>
                <button onClick={() => changeTheme('purple')} className="px-3 py-2 hover:bg-purple-800 text-left text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-white">Purple</span>
                </button>
              </div>
            </div>
            
            <button
              className="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-all"
              onClick={clearChat}
              title="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            
            <button
              className="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-all"
              onClick={downloadChat}
              title="Download chat history"
            >
              <Download className="h-5 w-5" />
            </button>
            
            <button 
              className="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-all"
              onClick={onClose}
              title="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl shadow-md ${
                    message.role === 'user' 
                      ? `bg-gradient-to-br ${themeColors.userMessageFrom} ${themeColors.userMessageTo} text-white` 
                      : 'bg-gradient-to-br from-gray-800 to-gray-700 text-white'
                  }`}
                >
                  {/* Message attachments if any */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="p-2 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="rounded-lg overflow-hidden border border-gray-700">
                          {attachment.type === 'image' ? (
                            <img 
                              src={attachment.url} 
                              alt="Attached image" 
                              className="max-w-full h-auto max-h-60 object-contain"
                            />
                          ) : (
                            <div className="bg-gray-900 p-2 flex items-center gap-2">
                              <File className="h-5 w-5 text-gray-300" />
                              <span className="text-sm text-gray-300 truncate">{attachment.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div className="p-4">
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2 flex justify-between items-center">
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {/* Only show actions for assistant messages */}
                      {message.role === 'assistant' && message.id !== 'welcome' && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-gray-600 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          
                          <button 
                            onClick={() => bookmarkMessage(message.id)}
                            className={`p-1 hover:bg-gray-600 rounded transition-colors ${message.bookmarked ? themeColors.highlight : ''}`}
                            title={message.bookmarked ? "Remove bookmark" : "Bookmark"}
                          >
                            <Bookmark className="h-3 w-3" fill={message.bookmarked ? "currentColor" : "none"} />
                          </button>
                          
                          <div className="flex gap-1">
                            <button 
                              onClick={() => rateMessage(message.id, 'like')}
                              className={`p-1 hover:bg-gray-600 rounded transition-colors ${message.rating === 'like' ? 'text-green-400' : 'text-gray-400'}`}
                              title="Helpful response"
                            >
                              <ThumbsUp className="h-3 w-3" fill={message.rating === 'like' ? "currentColor" : "none"} />
                            </button>
                            <button 
                              onClick={() => rateMessage(message.id, 'dislike')}
                              className={`p-1 hover:bg-gray-600 rounded transition-colors ${message.rating === 'dislike' ? 'text-red-400' : 'text-gray-400'}`}
                              title="Not helpful response"
                            >
                              <ThumbsDown className="h-3 w-3" fill={message.rating === 'dislike' ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="p-2 border-t border-gray-800 overflow-x-auto">
            <div className="flex gap-2">
              {attachments.map((att, index) => (
                <div key={index} className="relative flex-shrink-0 w-16 h-16 rounded border border-gray-700 overflow-hidden bg-gray-900">
                  {att.type === 'image' ? (
                    <img src={att.preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <File className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <button 
                    className="absolute top-0 right-0 bg-red-500 w-5 h-5 flex items-center justify-center rounded-bl-md"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-blue-300 mb-2 flex justify-between items-center">
            <span>Ask Dr. Echo about your health concerns</span>
            {isTyping && (
              <motion.span 
                className="text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Dr. Echo is thinking...
              </motion.span>
            )}
          </div>
          
          <div className="relative">
            <div className="flex-1 rounded-md p-1 border bg-background border-input overflow-y-auto max-h-[150px]">
              <Textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a health question..."
                className="h-full min-h-[60px] resize-none border-0 p-2 focus-visible:ring-0 focus-visible:ring-transparent"
              />
            </div>
            
            {/* Speech recognition visual indicator */}
            {isListening && (
              <div className={`absolute left-1/2 transform -translate-x-1/2 ${interimTranscript ? 'top-16' : 'top-1/2 -translate-y-1/2'} py-2 px-4 bg-primary/10 rounded-md shadow-md z-10 max-w-[80%] text-center`}>
                <div className="flex items-center justify-center mb-1 gap-2">
                  <div className="relative h-3 w-3">
                    <div className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping"></div>
                    <div className="relative rounded-full h-3 w-3 bg-primary"></div>
                  </div>
                  <span className="text-xs font-medium">Listening...</span>
                </div>
                {interimTranscript && (
                  <div className="text-sm font-medium">{interimTranscript}</div>
                )}
                {transcript && !interimTranscript && (
                  <div className="text-sm italic text-muted-foreground">
                    {transcript}
                  </div>
                )}
              </div>
            )}
            
            {/* Health suggestions */}
            {inputValue === '' && !isListening && (
              <div className="p-2 mb-2">
                <p className="text-xs text-muted-foreground mb-2">Try asking about:</p>
                <div className="flex flex-wrap gap-1">
                  {healthSuggestions.slice(0, 4).map((suggestion, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs py-1 px-2 h-auto rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-950/50 dark:hover:to-indigo-950/50 border-purple-200"
                      onClick={() => setInputValue(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Attachments section */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border-t">
                {attachments.map((attachment, index) => (
                  <div key={index} className="relative group">
                    <div className="relative bg-muted rounded overflow-hidden h-16 w-16 border border-border">
                      {attachment.type === 'image' ? (
                        <img 
                          src={attachment.preview} 
                          alt="attachment" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <File className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <button 
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-2 p-1">
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={toggleListening}
                  className={cn(
                    isListening && "text-red-500 animate-pulse bg-red-100 dark:bg-red-900/30"
                  )}
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <MicOff className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" size="icon" variant="ghost">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleFileClick('file')} 
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <File className="h-4 w-4" />
                        <span>File</span>
                      </Button>
                      <Button 
                        onClick={() => handleFileClick('image')} 
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Image className="h-4 w-4" />
                        <span>Image</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                type="submit" 
                size="icon"
                disabled={isTyping}
                className={cn(
                  "ml-auto",
                  getThemeColors().button,
                  !inputValue.trim() && attachments.length === 0 && "opacity-50"
                )}
                onClick={handleSendMessage}
              >
                {isTyping ? (
                  <span className="animate-spin">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Medical disclaimer */}
          <div className="p-2 mt-2 text-xs text-muted-foreground bg-background rounded-md border border-muted">
            <p className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <strong>Medical Disclaimer:</strong> This AI provides general health information only. It's not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers with questions about your health.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 