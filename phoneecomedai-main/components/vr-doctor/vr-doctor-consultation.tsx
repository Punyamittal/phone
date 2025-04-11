import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import {
  Stethoscope,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
  XCircle,
  Activity,
  ThumbsUp,
  Heart,
  Thermometer,
  Zap,
  Brain,
  Sparkles,
  Scan
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as SpeechService from '@/lib/speechService';
import * as GeminiService from '@/lib/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import GeminiApiSetup from './gemini-api-setup';
import AnimatedLoader from './animated-loader';

export default function VRDoctorConsultation() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognition = useRef<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [doctorResponse, setDoctorResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: '72',
    temperature: '98.6',
    bloodPressure: '120/80',
    oxygenLevel: '98',
    stressLevel: 'Normal',
    posture: 'Good',
  });
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [postureFeedback, setPostureFeedback] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Gemini API related states
  const [isGeminiApiConfigured, setIsGeminiApiConfigured] = useState(false);
  const [isGeminiProcessing, setIsGeminiProcessing] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [videoAnalysisActive, setVideoAnalysisActive] = useState(false);
  const [lastImageAnalysis, setLastImageAnalysis] = useState<string | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);
  const videoAnalysisController = useRef<{ stop: () => void } | null>(null);
  const conversationManager = useRef<GeminiService.GeminiConversationManager>(
    new GeminiService.GeminiConversationManager(10)
  );

  // Initialize Camera and Speech Recognition
  useEffect(() => {
    initSpeechRecognition();
    initTextToSpeech();

    // Check if Gemini API key is stored in localStorage
    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      const isValid = GeminiService.initGeminiApi(apiKey);
      setIsGeminiApiConfigured(isValid);
    }

    // Timer for session
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
      SpeechService.stopSpeaking();
      
      // Stop video analysis if active
      if (videoAnalysisController.current) {
        videoAnalysisController.current.stop();
      }
    };
  }, []);

  // Format session time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize Speech Recognition
  const initSpeechRecognition = () => {
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
          toast.success("Voice input started - Please describe how you're feeling");
        };
        
        recognition.current.onend = () => {
          // If we're still marked as listening when onend fires, 
          // it means it ended unexpectedly, so try to restart
          if (isListening) {
            try {
              recognition.current?.start();
            } catch (err) {
              console.error('Error restarting recognition:', err);
              setIsListening(false);
            }
          } else {
            setIsListening(false);
          }
        };
        
        recognition.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Handle specific error cases
          switch (event.error) {
            case 'no-speech':
              // Show a gentle reminder instead of an error
              toast.info("I didn't catch that. Please try speaking again or type your message.");
              
              // Don't stop listening, just restart after a short delay
              setTimeout(() => {
                try {
                  if (isListening) {
                    recognition.current?.start();
                  }
                } catch (err) {
                  console.error('Error restarting recognition:', err);
                }
              }, 100);
              return;
              
            case 'audio-capture':
              toast.error("No microphone detected. Please check your microphone connection.");
              break;
            case 'not-allowed':
              toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
              break;
            default:
              toast.error("Voice input error: " + event.error);
          }
          
          setIsListening(false);
        };
        
        recognition.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update input value with both final and interim results
          setUserInput(prevValue => {
            const newValue = finalTranscript || interimTranscript;
            return newValue || prevValue;
          });
        };
      }
    }
  };

  // Initialize Text to Speech
  const initTextToSpeech = async () => {
    try {
      const initialized = await SpeechService.initSpeechSynthesis();
      if (initialized) {
        SpeechService.selectDefaultVoice('female');
        SpeechService.setSpeechRate(1.0);
        SpeechService.setSpeechPitch(1.0);
        SpeechService.setSpeechVolume(1.0);
      } else {
        toast.error("Text-to-speech initialization failed");
        setTextToSpeechEnabled(false);
      }
    } catch (error) {
      console.error("Text-to-speech error:", error);
      setTextToSpeechEnabled(false);
    }
  };

  // Toggle listening for voice input
  const toggleListening = () => {
    if (isListening) {
      try {
        recognition.current?.stop();
        setIsListening(false);
        
        // If there's input, process it
        if (userInput.trim()) {
          processUserInput(userInput);
        }
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
        toast.error("Error stopping voice input");
      }
    } else {
      try {
        setUserInput(''); // Clear previous input
        recognition.current?.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Couldn't access microphone. Please check your browser permissions.");
        setIsListening(false);
      }
    }
  };

  // Toggle Text-to-Speech
  const toggleTextToSpeech = () => {
    if (isSpeaking) {
      SpeechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setTextToSpeechEnabled(!textToSpeechEnabled);
      toast.success(textToSpeechEnabled ? "Voice response disabled" : "Voice response enabled");
    }
  };

  // Process user's voice input with Gemini AI
  const processUserInput = async (input: string) => {
    if (!input.trim()) return;
    
    setIsTyping(true);
    setUserInput('');
    
    // Add user message to conversation history
    conversationManager.current.addUserMessage(input);
    
    // Check if Gemini API is configured
    if (isGeminiApiConfigured) {
      setIsGeminiProcessing(true);
      try {
        // Capture image if camera is active
        let imageContext = "";
        if (videoRef.current && cameraActive) {
          const imageData = GeminiService.captureImageFromVideo(videoRef.current);
          if (imageData && Date.now() - lastAnalysisTime > 10000) { // Only do image analysis if more than 10 seconds passed
            setLastAnalysisTime(Date.now());
            // Process image in parallel but don't wait for it
            processUserImageInBackground(imageData);
          }
          
          // Use the last image analysis as additional context if available
          if (lastImageAnalysis) {
            imageContext = `Based on my visual analysis: ${lastImageAnalysis}. `;
          }
        }
        
        // Get medical context from health metrics
        const medicalContext = `Patient's current vital signs: Heart rate: ${healthMetrics.heartRate} BPM, Temperature: ${healthMetrics.temperature}°F, Blood pressure: ${healthMetrics.bloodPressure}, Oxygen level: ${healthMetrics.oxygenLevel}%. Stress level appears to be ${healthMetrics.stressLevel.toLowerCase()} and posture is ${healthMetrics.posture.toLowerCase()}.`;
        
        // Process text input with Gemini
        const response = await GeminiService.processTextWithGemini(
          input,
          conversationManager.current.getHistory(),
          `${imageContext}${medicalContext} Respond as Dr. AI, a virtual doctor in a VR consultation.`
        );
        
        setDoctorResponse(response);
        conversationManager.current.addModelResponse(response);
        
        // Update metrics based on conversation context
        updateMetricsBasedOnConversation(input, response);
        
      } catch (error) {
        console.error("Error processing with Gemini:", error);
        setDoctorResponse("I'm sorry, I encountered an issue processing your request. Please try again.");
      } finally {
        setIsGeminiProcessing(false);
      }
    } else {
      // Fallback to simple response generation if Gemini API is not configured
      fallbackProcessUserInput(input);
    }
    
    setIsTyping(false);
    
    // Speak the response if text-to-speech is enabled
    if (textToSpeechEnabled && doctorResponse) {
      setIsSpeaking(true);
      SpeechService.speakLongText(doctorResponse);
      
      // Setup a check to detect when speech has finished
      const checkSpeakingStatus = setInterval(() => {
        if (!SpeechService.isSpeechSynthesisActive()) {
          setIsSpeaking(false);
          clearInterval(checkSpeakingStatus);
        }
      }, 500); // Check every half second
    }
    
    // Randomize some health metrics to simulate real-time monitoring
    simulateVitalSigns();
  };
  
  // Process user's image in background for additional context
  const processUserImageInBackground = async (imageData: string) => {
    try {
      const analysis = await GeminiService.processImageWithGemini(
        imageData,
        "Analyze this patient's appearance, posture, and visible signs that might indicate health issues. Keep it brief and medical.",
        "Focus on facial expressions, visible symptoms, and posture issues. Don't mention clothing or background details."
      );
      
      setLastImageAnalysis(analysis);
      
      // Extract posture feedback if present
      if (analysis.toLowerCase().includes("posture")) {
        const postureSentence = analysis.split('.').find(sentence => 
          sentence.toLowerCase().includes("posture") || 
          sentence.toLowerCase().includes("sitting") || 
          sentence.toLowerCase().includes("slouching")
        );
        
        if (postureSentence) {
          setPostureFeedback(postureSentence.trim());
          
          // Update posture metric based on analysis
          if (postureSentence.toLowerCase().includes("good") || postureSentence.toLowerCase().includes("excellent")) {
            updateHealthMetric('posture', 'Good');
          } else if (postureSentence.toLowerCase().includes("poor") || postureSentence.toLowerCase().includes("bad")) {
            updateHealthMetric('posture', 'Poor');
          } else {
            updateHealthMetric('posture', 'Needs Improvement');
          }
        }
      }
      
      // Update stress level based on analysis
      if (analysis.toLowerCase().includes("stress") || analysis.toLowerCase().includes("anxious") || analysis.toLowerCase().includes("tension")) {
        if (analysis.toLowerCase().includes("high stress") || analysis.toLowerCase().includes("severe anxiety")) {
          updateHealthMetric('stressLevel', 'High');
        } else if (analysis.toLowerCase().includes("mild stress") || analysis.toLowerCase().includes("slight anxiety")) {
          updateHealthMetric('stressLevel', 'Elevated');
        } else {
          updateHealthMetric('stressLevel', 'Normal');
        }
      }
    } catch (error) {
      console.error("Error processing image with Gemini:", error);
    }
  };
  
  // Fallback response generation (used when Gemini API is not available)
  const fallbackProcessUserInput = (input: string) => {
    // Simple keyword matching for demo purposes
    let response = '';
    
    if (input.toLowerCase().includes('headache')) {
      response = "I notice you're experiencing headaches. How long have you been feeling this way? Is it accompanied by any other symptoms like nausea or sensitivity to light? Based on your posture, I can see some tension in your neck which could be contributing to this.";
      setPostureFeedback("I notice some tension in your neck and shoulders. Try relaxing your shoulders and sitting more upright.");
      updateHealthMetric('stressLevel', 'Elevated');
    } else if (input.toLowerCase().includes('back pain') || input.toLowerCase().includes('backache')) {
      response = "I see you're experiencing back pain. Your posture suggests some misalignment. Try sitting with your back straight, shoulders relaxed, and feet flat on the floor. Can you tell me when the pain started and if any particular movements make it worse?";
      setPostureFeedback("Your current posture is putting strain on your lower back. Try sitting more upright with your shoulders back.");
      updateHealthMetric('posture', 'Poor');
    } else if (input.toLowerCase().includes('tired') || input.toLowerCase().includes('fatigue')) {
      response = "Fatigue can be caused by many factors including stress, poor sleep, or underlying health conditions. I notice from your appearance that you may not be getting enough rest. Are you having trouble sleeping? How are your energy levels throughout the day?";
      updateHealthMetric('stressLevel', 'High');
    } else if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
      response = "Hello there! I'm your virtual doctor. How are you feeling today? I'm here to help assess your health concerns. Feel free to tell me about any symptoms you're experiencing, and I'll do my best to provide guidance.";
    } else {
      response = "Thank you for sharing that information. Based on what you've told me and what I can observe, I'd like to ask a few more questions to better understand your condition. Could you elaborate on when these symptoms started and if anything makes them better or worse?";
    }
    
    setDoctorResponse(response);
  };

  // Update metrics based on conversation context
  const updateMetricsBasedOnConversation = (userInput: string, aiResponse: string) => {
    const combinedText = (userInput + " " + aiResponse).toLowerCase();
    
    // Check for stress indications
    if (combinedText.includes("anxious") || combinedText.includes("stressed") || 
        combinedText.includes("anxiety") || combinedText.includes("panic")) {
      updateHealthMetric('stressLevel', 'High');
    } else if (combinedText.includes("worried") || combinedText.includes("nervous") || 
               combinedText.includes("tension") || combinedText.includes("pressure")) {
      updateHealthMetric('stressLevel', 'Elevated');
    }
    
    // Check for pain indications that might affect heart rate
    if (combinedText.includes("severe pain") || combinedText.includes("intense pain") || 
        combinedText.includes("extreme pain")) {
      const currentHeartRate = parseInt(healthMetrics.heartRate);
      updateHealthMetric('heartRate', (currentHeartRate + 10).toString());
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setConnectionStatus('connecting');
        
        // Simulate connection process
        setTimeout(() => {
          setConnectionStatus('connected');
          toast.success("Virtual doctor connected");
          
          // Check if Gemini API is configured
          if (!isGeminiApiConfigured) {
            setShowApiSetup(true);
            toast.info("Configure Gemini API for enhanced AI capabilities");
          } else {
            // Start initial greeting after connection
            startInitialGreeting();
            
            // Start continuous video analysis if Gemini API is configured
            startContinuousVideoAnalysis();
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Couldn't access camera. Please check your browser permissions.");
    }
  };
  
  // Start initial greeting
  const startInitialGreeting = () => {
    const greeting = isGeminiApiConfigured 
      ? "Hello, I'm Dr. AI powered by Gemini 1.5 Pro. I'll be your virtual doctor today. I can analyze your appearance and speech to provide personalized health insights. How are you feeling today?"
      : "Hello, I'm Dr. AI. I'll be your virtual doctor today. I can see and hear you now. How are you feeling today?";
    
    setDoctorResponse(greeting);
    
    if (textToSpeechEnabled) {
      setIsSpeaking(true);
      SpeechService.speakLongText(greeting);
      
      // Setup a check to detect when speech has finished
      const checkSpeakingStatus = setInterval(() => {
        if (!SpeechService.isSpeechSynthesisActive()) {
          setIsSpeaking(false);
          clearInterval(checkSpeakingStatus);
        }
      }, 500); // Check every half second
    }
    
    // Start posture analysis
    startPostureAnalysis();
  };
  
  // Start continuous video analysis with Gemini
  const startContinuousVideoAnalysis = () => {
    if (!isGeminiApiConfigured || !videoRef.current || videoAnalysisActive) return;
    
    setVideoAnalysisActive(true);
    
    videoAnalysisController.current = GeminiService.startContinuousVideoAnalysis(
      videoRef.current,
      (analysis) => {
        // Only update if there's significant new information
        if (analysis && analysis.length > 20) {
          setLastImageAnalysis(analysis);
          
          // Extract posture feedback
          if (analysis.toLowerCase().includes("posture")) {
            const postureSentence = analysis.split('.').find(sentence => 
              sentence.toLowerCase().includes("posture")
            );
            
            if (postureSentence) {
              setPostureFeedback(postureSentence.trim());
            }
          }
        }
      },
      30000 // Every 30 seconds to avoid excessive API calls
    );
    
    toast.success("Advanced visual analysis activated");
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        track.stop();
      });
      
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setConnectionStatus('disconnected');
      
      // Stop video analysis if active
      if (videoAnalysisController.current) {
        videoAnalysisController.current.stop();
        setVideoAnalysisActive(false);
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  // Update a health metric
  const updateHealthMetric = (metric: keyof typeof healthMetrics, value: string) => {
    setHealthMetrics(prev => ({
      ...prev,
      [metric]: value
    }));
  };

  // Simulate changes in vital signs
  const simulateVitalSigns = () => {
    // Generate slightly varying vital signs to simulate real monitoring
    const heartRate = 65 + Math.floor(Math.random() * 20);
    const temperature = 98.2 + (Math.random() * 0.8).toFixed(1);
    const systolic = 115 + Math.floor(Math.random() * 15);
    const diastolic = 75 + Math.floor(Math.random() * 15);
    const oxygenLevel = 95 + Math.floor(Math.random() * 5);
    
    setHealthMetrics(prev => ({
      ...prev,
      heartRate: heartRate.toString(),
      temperature: temperature.toString(),
      bloodPressure: `${systolic}/${diastolic}`,
      oxygenLevel: oxygenLevel.toString()
    }));
  };

  // Posture analysis (enhanced with Gemini when available)
  const startPostureAnalysis = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // If Gemini API is configured, continuous video analysis handles this
    if (isGeminiApiConfigured) return;
    
    // Simple interval to simulate posture analysis when Gemini is not available
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Simulate posture detection with random feedback occasionally
        if (Math.random() > 0.7) {
          const feedbacks = [
            "Your posture looks good, keep it up!",
            "Try sitting more upright to reduce strain on your back.",
            "I notice you're leaning to one side, try to center your weight.",
            "Your neck is slightly forward. Try bringing your head back aligned with your spine.",
            null // Sometimes no feedback
          ];
          
          const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
          setPostureFeedback(feedback);
          
          if (feedback && feedback.includes("good")) {
            updateHealthMetric('posture', 'Good');
          } else if (feedback) {
            updateHealthMetric('posture', 'Needs Improvement');
          }
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  };

  // Handle Gemini API setup completion
  const handleApiKeySet = (isValid: boolean) => {
    setIsGeminiApiConfigured(isValid);
    setShowApiSetup(false);
    
    if (isValid) {
      toast.success("Gemini AI activated for enhanced consultation");
      startInitialGreeting();
      startContinuousVideoAnalysis();
    }
  };

  // Exit consultation
  const exitConsultation = () => {
    stopCamera();
    if (recognition.current) {
      try {
        recognition.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    SpeechService.stopSpeaking();
    router.push('/'); // Navigate back to home using the App Router
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-screen bg-black overflow-hidden flex flex-col",
        fullscreen ? "fixed top-0 left-0 z-50" : ""
      )}
    >
      {/* Doctor video feed (main display) */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* User camera feed */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full opacity-0" 
            width={1280} 
            height={720}
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        {/* VR Interface Elements */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Top status bar */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-cyan-400" />
              <span className="font-bold text-white">EcoMed VR Doctor</span>
              {isGeminiApiConfigured && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-cyan-900/80 text-cyan-300 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" /> Gemini 1.5 Pro
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">Session: {formatTime(sessionTime)}</span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-950"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-950"
                  onClick={exitConsultation}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex">
            {/* Left panel - Health metrics */}
            <div className="w-72 bg-black/60 backdrop-blur-md p-4 text-white flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">Health Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-400 mr-2" />
                      <span>Heart Rate</span>
                    </div>
                    <span className="text-red-400">{healthMetrics.heartRate} BPM</span>
                  </div>
                  <Progress value={parseInt(healthMetrics.heartRate) / 2} className="h-1 bg-gray-800">
                    <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" />
                  </Progress>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 text-orange-400 mr-2" />
                      <span>Temperature</span>
                    </div>
                    <span className="text-orange-400">{healthMetrics.temperature}°F</span>
                  </div>
                  <Progress 
                    value={(parseFloat(healthMetrics.temperature) - 97) / 5 * 100} 
                    className="h-1 bg-gray-800"
                  >
                    <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
                  </Progress>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-blue-400 mr-2" />
                      <span>Blood Pressure</span>
                    </div>
                    <span className="text-blue-400">{healthMetrics.bloodPressure}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Progress 
                      value={parseInt(healthMetrics.bloodPressure.split('/')[0]) / 2} 
                      className="h-1 bg-gray-800 w-1/2"
                    >
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
                    </Progress>
                    <Progress 
                      value={parseInt(healthMetrics.bloodPressure.split('/')[1]) / 1.5} 
                      className="h-1 bg-gray-800 w-1/2"
                    >
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full" />
                    </Progress>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-purple-400 mr-2" />
                      <span>Oxygen Level</span>
                    </div>
                    <span className="text-purple-400">{healthMetrics.oxygenLevel}%</span>
                  </div>
                  <Progress 
                    value={parseInt(healthMetrics.oxygenLevel)} 
                    className="h-1 bg-gray-800"
                  >
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
                  </Progress>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Stress Level:</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      healthMetrics.stressLevel === 'Normal' ? "bg-green-900 text-green-300" :
                      healthMetrics.stressLevel === 'Elevated' ? "bg-yellow-900 text-yellow-300" :
                      "bg-red-900 text-red-300"
                    )}>
                      {healthMetrics.stressLevel}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Posture:</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      healthMetrics.posture === 'Good' ? "bg-green-900 text-green-300" :
                      healthMetrics.posture === 'Needs Improvement' ? "bg-yellow-900 text-yellow-300" :
                      "bg-red-900 text-red-300"
                    )}>
                      {healthMetrics.posture}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* AI Analysis Status */}
              {isGeminiApiConfigured && videoAnalysisActive && (
                <div className="mt-4 p-2 bg-cyan-900/30 rounded border border-cyan-800/50">
                  <div className="flex items-center text-xs text-cyan-300 mb-1">
                    <Brain className="h-3 w-3 mr-1" />
                    <span>AI Analysis</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-1.5 animate-pulse" />
                    <span className="text-xs text-cyan-200">Continuous monitoring active</span>
                  </div>
                </div>
              )}
              
              {/* Connection status */}
              <div className="mt-auto">
                <div className="flex items-center">
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    connectionStatus === 'connected' ? "bg-green-500" :
                    connectionStatus === 'connecting' ? "bg-yellow-500" :
                    "bg-red-500"
                  )} />
                  <span className="text-sm">
                    {connectionStatus === 'connected' ? "Connected" :
                     connectionStatus === 'connecting' ? "Connecting..." :
                     "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Center content - Doctor interaction area */}
            <div className="flex-1 relative flex flex-col">
              {/* Doctor response area */}
              <div className="flex-1 flex items-center justify-center p-8">
                {!cameraActive ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center space-y-6"
                    >
                      <div className="w-24 h-24 rounded-full bg-cyan-900/50 flex items-center justify-center mx-auto">
                        <Camera className="h-12 w-12 text-cyan-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Virtual Doctor Consultation</h2>
                      <p className="text-gray-300 max-w-md">
                        Start your virtual doctor appointment for personalized health analysis 
                        and recommendations. Your camera will be used to analyze your posture 
                        and physical appearance.
                      </p>
                      <Button 
                        onClick={startCamera}
                        size="lg"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        Start Consultation
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                ) : showApiSetup ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <GeminiApiSetup onApiKeySet={handleApiKeySet} />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <AnimatePresence>
                    {isGeminiProcessing ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <AnimatedLoader message="Dr. AI is analyzing your information..." />
                      </motion.div>
                    ) : (doctorResponse || isTyping) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-2xl"
                      >
                        <Card className="bg-cyan-950/70 backdrop-blur-md border-cyan-800 p-6 shadow-xl rounded-2xl">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="h-5 w-5 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="font-semibold text-cyan-300">Dr. AI</h3>
                                {isSpeaking && (
                                  <div className="ml-2 flex space-x-0.5">
                                    {[1, 2, 3].map(i => (
                                      <motion.div
                                        key={i}
                                        className="w-0.5 h-2 bg-cyan-400"
                                        animate={{
                                          height: [2, 4, 6, 4, 2],
                                        }}
                                        transition={{
                                          repeat: Infinity,
                                          duration: 1,
                                          delay: i * 0.1,
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {isTyping ? (
                                <div className="mt-2 flex space-x-1">
                                  {[1, 2, 3].map(i => (
                                    <motion.div
                                      key={i}
                                      className="w-2 h-2 rounded-full bg-cyan-400"
                                      animate={{
                                        opacity: [0.4, 1, 0.4],
                                      }}
                                      transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        delay: i * 0.2,
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <p className="text-white mt-2">{doctorResponse}</p>
                              )}
                              
                              {postureFeedback && !isTyping && (
                                <div className="mt-3 text-sm bg-cyan-900/50 p-2 rounded border-l-2 border-cyan-400">
                                  <p className="text-cyan-200">{postureFeedback}</p>
                                </div>
                              )}
                              
                              {isGeminiApiConfigured && lastImageAnalysis && !isTyping && (
                                <div className="mt-4 flex items-center text-xs text-cyan-300">
                                  <Scan className="h-3 w-3 mr-1" />
                                  <span>Visual analysis active</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
              
              {/* User input area */}
              {cameraActive && !showApiSetup && (
                <div className="bg-black/70 backdrop-blur-md p-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={toggleListening}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "rounded-full border-2 transition-colors duration-200",
                        isListening 
                          ? "border-red-500 bg-red-500/20 text-red-500 animate-pulse"
                          : "border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500/20"
                      )}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Type your symptoms or questions..."}
                        className="w-full bg-gray-900/60 border-0 focus:ring-1 focus:ring-cyan-500 rounded-xl text-white py-3 px-4"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && userInput.trim()) {
                            processUserInput(userInput);
                          }
                        }}
                      />
                      
                      {isListening && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-0.5">
                          {[1, 2, 3, 4].map(i => (
                            <motion.div
                              key={i}
                              className="w-0.5 h-4 bg-cyan-400"
                              animate={{
                                height: [4, 8, 12, 8, 4],
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={toggleTextToSpeech}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "rounded-full border-2 transition-colors duration-200",
                        textToSpeechEnabled
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-500"
                          : "border-gray-500 bg-transparent text-gray-500 hover:bg-gray-500/20"
                      )}
                    >
                      {textToSpeechEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (userInput.trim()) {
                          processUserInput(userInput);
                        }
                      }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      disabled={isGeminiProcessing}
                    >
                      {isGeminiProcessing ? "Processing..." : "Send"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 