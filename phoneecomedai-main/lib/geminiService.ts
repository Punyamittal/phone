/**
 * Gemini Service
 * Provides Gemini 1.5 Pro AI functionality for image and video processing
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini API
let geminiApi: GoogleGenerativeAI | null = null;

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Initialize the Gemini API with the provided API key
 */
export const initGeminiApi = (apiKey: string): boolean => {
  try {
    geminiApi = new GoogleGenerativeAI(apiKey);
    return true;
  } catch (error) {
    console.error('Error initializing Gemini API:', error);
    return false;
  }
};

/**
 * Convert image from video element to base64 data URL
 */
export const captureImageFromVideo = (videoElement: HTMLVideoElement): string | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error capturing image from video:', error);
    return null;
  }
};

/**
 * Process an image through Gemini 1.5 Pro and get AI analysis
 */
export const processImageWithGemini = async (
  imageData: string, 
  prompt: string,
  medicalContext?: string
): Promise<string> => {
  if (!geminiApi) {
    return "Gemini API is not initialized. Please initialize with your API key first.";
  }
  
  try {
    // Extract base64 data from the data URL
    const base64Image = imageData.split(',')[1];
    
    // Create a Gemini model instance (use 1.5 Pro for advanced vision capabilities)
    const model = geminiApi.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings
    });
    
    // Prepare the content parts including image and prompt
    const promptPrefix = medicalContext 
      ? `As a virtual doctor, analyze this patient. ${medicalContext}` 
      : "As a virtual doctor, analyze this patient's appearance and provide medical insights.";
    
    const fullPrompt = `${promptPrefix} ${prompt}`;
    
    // Process with Gemini's vision capabilities
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: fullPrompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 800,
      }
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Error processing image with Gemini:', error);
    return "I'm sorry, I encountered an error analyzing the image. Please try again later.";
  }
};

/**
 * Process text input through Gemini 1.5 Pro and get AI analysis
 */
export const processTextWithGemini = async (
  userText: string,
  conversationHistory: Array<{ role: 'user' | 'model', content: string }> = [],
  medicalContext?: string
): Promise<string> => {
  if (!geminiApi) {
    return "Gemini API is not initialized. Please initialize with your API key first.";
  }
  
  try {
    // Create a Gemini model instance
    const model = geminiApi.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings
    });
    
    // Create a chat session
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 800,
      }
    });
    
    // Prepare the prompt with medical context if provided
    const promptPrefix = medicalContext 
      ? `As a virtual doctor with this context: ${medicalContext}.` 
      : "As a virtual doctor, respond with medical expertise.";
    
    // Send the message
    const result = await chat.sendMessage(`${promptPrefix} ${userText}`);
    
    return result.response.text();
  } catch (error) {
    console.error('Error processing text with Gemini:', error);
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
};

/**
 * Process continuous video frames for real-time analysis
 */
export const startContinuousVideoAnalysis = (
  videoElement: HTMLVideoElement,
  onResult: (analysis: string) => void,
  interval: number = 5000, // Default interval of 5 seconds between captures
  prompt: string = "Analyze this patient's posture, apparent mood, and any visible signs of discomfort or health issues."
): { stop: () => void } => {
  if (!geminiApi) {
    onResult("Gemini API is not initialized. Please initialize with your API key first.");
    return { stop: () => {} };
  }
  
  let intervalId: NodeJS.Timeout;
  let isAnalyzing = false;
  
  const analyzeFrame = async () => {
    // Skip if already analyzing or video is paused/ended
    if (isAnalyzing || videoElement.paused || videoElement.ended) return;
    
    isAnalyzing = true;
    
    try {
      const imageData = captureImageFromVideo(videoElement);
      if (imageData) {
        const analysis = await processImageWithGemini(
          imageData, 
          prompt,
          "Focus on posture analysis, signs of fatigue, stress indicators, and general wellbeing assessment."
        );
        onResult(analysis);
      }
    } catch (error) {
      console.error('Error in continuous video analysis:', error);
    } finally {
      isAnalyzing = false;
    }
  };
  
  // Start the interval
  intervalId = setInterval(analyzeFrame, interval);
  
  // Return a function to stop the analysis
  return {
    stop: () => {
      clearInterval(intervalId);
    }
  };
};

/**
 * Store conversation history for context maintenance
 */
export class GeminiConversationManager {
  private history: Array<{ role: 'user' | 'model', content: string }> = [];
  private maxHistoryLength: number;
  
  constructor(maxHistoryLength: number = 10) {
    this.maxHistoryLength = maxHistoryLength;
  }
  
  addUserMessage(message: string): void {
    this.history.push({ role: 'user', content: message });
    this.trimHistory();
  }
  
  addModelResponse(message: string): void {
    this.history.push({ role: 'model', content: message });
    this.trimHistory();
  }
  
  getHistory(): Array<{ role: 'user' | 'model', content: string }> {
    return [...this.history];
  }
  
  clearHistory(): void {
    this.history = [];
  }
  
  private trimHistory(): void {
    if (this.history.length > this.maxHistoryLength) {
      // Remove oldest messages but keep pairs (question/answer)
      const excessPairs = Math.floor((this.history.length - this.maxHistoryLength) / 2);
      if (excessPairs > 0) {
        this.history = this.history.slice(excessPairs * 2);
      }
    }
  }
} 