/**
 * Enhanced AI Assistant Service
 * A modern, robust implementation for the Dr. Echo chatbot
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Type definitions
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

// System prompts
export const DR_ECHO_SYSTEM_PROMPT = `
You are Dr. Echo, an advanced AI healthcare assistant developed by EchoMed. Your primary goal is to provide helpful, accurate, and compassionate healthcare guidance to users.

When responding to questions about diseases or health conditions:
1. Provide a clear, concise description of the condition
2. List the most common symptoms with their prevalence if available
3. Mention standard diagnostic approaches
4. Outline typical treatment options (both medical and lifestyle-based)
5. Include important warning signs that would require immediate medical attention
6. Add prevention measures when applicable
7. Cite authoritative sources like WHO, CDC, or major medical associations
8. Be informative without causing unnecessary alarm
9. Structure your responses in clearly labeled sections for readability

Guidelines:
1. Be empathetic and supportive while maintaining professional tone
2. Provide evidence-based information from reliable medical sources
3. Acknowledge uncertainty when appropriate
4. Encourage users to seek professional medical advice for serious concerns
5. Avoid making definitive diagnoses
6. Be concise yet comprehensive
7. Use plain language and explain medical terms
8. Consider physical, mental, and emotional aspects of health
9. Respect user privacy and maintain confidentiality

For likely disease queries, examine them thoroughly:
* Differentiate between similar conditions with overlapping symptoms
* Include typical timeline and progression information when relevant
* Mention factors that might affect severity or presentation
* Address common misconceptions about the condition
* Include information about management and coping strategies

Remember: You are not a replacement for professional medical care, but a supportive resource for health information and guidance.
`;

// Main AI Service Class
export class AIAssistantService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;
  private model: string;
  private initialized: boolean = false;
  private initializationError: Error | null = null;
  private fallbackMode: boolean = false;

  constructor(apiKey?: string, model: string = "gemini-1.5-pro") {
    // Get API key from parameter or environment variable
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    this.model = model;
    
    // Log API key status (without revealing the actual key)
    if (this.apiKey) {
      console.log("API key found, initializing AI Assistant...");
      console.log("API key length:", this.apiKey.length);
      console.log("API key first 4 chars:", this.apiKey.substring(0, 4));
    } else {
      console.warn("No API key provided for AI Assistant");
    }
    
    this.initialize();
  }

  /**
   * Initialize the AI service
   */
  private async initialize(): Promise<void> {
    try {
      if (!this.apiKey) {
        throw new Error("No API key provided");
      }

      // Create the Google Generative AI instance
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      
      // Test the API with a simple request to verify it's working
      const model = this.genAI.getGenerativeModel({ 
        model: this.model,
        // Add safety settings appropriate for medical content
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Hello, this is a test." }] }],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more factual responses
          maxOutputTokens: 1024, 
        }
      });
      
      // If we get here, the API is working
      this.initialized = true;
      this.fallbackMode = false;
      console.log("AI Assistant service initialized successfully");
    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error("Unknown initialization error");
      this.fallbackMode = true;
      console.error("AI Assistant initialization failed:", this.initializationError.message);
      
      // Log more detailed error information
      if (error instanceof Error) {
        console.error("Error details:", error.stack);
      }
    }
  }

  /**
   * Get the initialization status
   */
  public getStatus(): { initialized: boolean; error: Error | null; fallbackMode: boolean } {
    return {
      initialized: this.initialized,
      error: this.initializationError,
      fallbackMode: this.fallbackMode
    };
  }

  /**
   * Generate a response based on the provided messages
   */
  public async generateResponse(messages: Message[]): Promise<string> {
    try {
      if (this.fallbackMode || !this.initialized || !this.genAI) {
        console.warn("AI Assistant is in fallback mode or not initialized. Using fallback responses.");
        return this.generateFallbackResponse(messages);
      }

      const model = this.genAI.getGenerativeModel({ 
        model: this.model,
        // Add safety settings appropriate for medical content
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      });

      // Prepare conversation history in the correct format for Gemini
      const contents = this.prepareConversationHistory(messages);
      
      // Check if the last message is related to a disease or health condition
      const lastUserMessage = messages.filter(m => m.role === "user").pop();
      const isHealthQuery = lastUserMessage ? this.detectHealthQuery(lastUserMessage.content) : false;
      
      // Generate content with proper error handling
      console.log("Sending request to Gemini API...");
      const result = await model.generateContent({
        contents,
        generationConfig: {
          temperature: isHealthQuery ? 0.2 : 0.7, // Lower temperature for health queries for factual accuracy
          topK: 40,
          topP: 0.8,
          maxOutputTokens: isHealthQuery ? 2048 : 1024, // Allow longer responses for health questions
        }
      });

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating response:", error);
      return this.generateFallbackResponse(messages);
    }
  }

  /**
   * Generate a streaming response based on the provided messages
   */
  public async generateStreamingResponse(
    messages: Message[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      if (this.fallbackMode || !this.initialized || !this.genAI) {
        console.warn("AI Assistant is in fallback mode or not initialized. Using fallback responses.");
        await this.generateFallbackStreamingResponse(messages, callbacks);
        return;
      }

      // Start callback
      if (callbacks.onStart) {
        callbacks.onStart();
      }

      const model = this.genAI.getGenerativeModel({ 
        model: this.model,
        // Add safety settings appropriate for medical content
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      });

      // Prepare conversation history in the correct format for Gemini
      const contents = this.prepareConversationHistory(messages);
      
      // Check if the last message is related to a disease or health condition
      const lastUserMessage = messages.filter(m => m.role === "user").pop();
      const isHealthQuery = lastUserMessage ? this.detectHealthQuery(lastUserMessage.content) : false;

      // Generate streaming content with proper error handling
      console.log("Sending request to Gemini API...");
      const result = await model.generateContentStream({
        contents,
        generationConfig: {
          temperature: isHealthQuery ? 0.2 : 0.7, // Lower temperature for health queries for factual accuracy
          topK: 40,
          topP: 0.8,
          maxOutputTokens: isHealthQuery ? 2048 : 1024, // Allow longer responses for health questions
        }
      });

      console.log("Received streaming response from Gemini API");
      let fullResponse = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        // Send the token to the callback
        if (callbacks.onToken) {
          callbacks.onToken(chunkText);
        }
      }

      // Complete callback
      if (callbacks.onComplete) {
        callbacks.onComplete(fullResponse);
      }
    } catch (error) {
      console.error("Error generating streaming response:", error);
      const errorObj = error instanceof Error ? error : new Error("Unknown error during streaming response generation");
      
      if (callbacks.onError) {
        callbacks.onError(errorObj);
      }
      
      await this.generateFallbackStreamingResponse(messages, callbacks);
    }
  }

  /**
   * Helper function to detect if a query is likely health or disease related
   */
  private detectHealthQuery(query: string): boolean {
    const healthKeywords = [
      // Conditions and diseases
      'disease', 'condition', 'disorder', 'syndrome', 'infection', 'cancer',
      'diabetes', 'asthma', 'arthritis', 'heart', 'blood pressure', 'hypertension',
      'covid', 'flu', 'virus', 'bacterial', 'chronic', 'acute',
      
      // Symptoms
      'symptom', 'pain', 'ache', 'fever', 'cough', 'headache', 'migraine',
      'nausea', 'vomiting', 'diarrhea', 'constipation', 'fatigue', 'tired',
      'dizzy', 'dizziness', 'rash', 'allergy', 'itchy', 'sore', 'swelling',
      
      // Body parts
      'stomach', 'head', 'chest', 'throat', 'lung', 'liver', 'kidney',
      'joint', 'muscle', 'bone', 'skin', 'blood', 'heart',
      
      // Medical actions
      'treatment', 'cure', 'medication', 'medicine', 'drug', 'therapy',
      'doctor', 'hospital', 'diagnosis', 'diagnosed', 'surgery',
      
      // Health conditions
      'health', 'unwell', 'sick', 'ill', 'suffering'
    ];
    
    // Normalize the query
    const normalizedQuery = query.toLowerCase();
    
    // Check if any health keywords are present
    return healthKeywords.some(keyword => normalizedQuery.includes(keyword));
  }

  /**
   * Prepare the conversation history for the API
   */
  private prepareConversationHistory(messages: Message[]) {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Generate a fallback response when the API is unavailable
   */
  private async generateFallbackResponse(messages: Message[]): Promise<string> {
    const lastMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
    
    // Simple keyword-based fallbacks
    if (lastMessage.toLowerCase().includes("hello") || lastMessage.toLowerCase().includes("hi")) {
      return "Hello! I'm Dr. Echo, your EchoMed AI health assistant. I'm currently operating in offline mode with limited capabilities, but I'll do my best to help you.";
    }
    
    if (lastMessage.toLowerCase().includes("headache")) {
      return "Headaches can be caused by various factors including stress, dehydration, lack of sleep, or eye strain. For occasional headaches, rest, staying hydrated, and over-the-counter pain relievers may help. If your headaches are severe or persistent, please consult a healthcare professional.\n\nNote: I'm currently operating in offline mode with limited capabilities.";
    }

    if (lastMessage.toLowerCase().includes("fitness") || lastMessage.toLowerCase().includes("exercise")) {
      return "Regular physical activity is important for maintaining good health. Adults should aim for at least 150 minutes of moderate-intensity activity or 75 minutes of vigorous activity each week, along with muscle-strengthening activities twice weekly. Always start gradually and listen to your body.\n\nNote: I'm currently operating in offline mode with limited capabilities.";
    }

    if (lastMessage.toLowerCase().includes("diet") || lastMessage.toLowerCase().includes("nutrition")) {
      return "A balanced diet typically includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. It's best to limit processed foods, added sugars, and excessive sodium. Staying hydrated is also important for overall health.\n\nNote: I'm currently operating in offline mode with limited capabilities.";
    }
    
    if (lastMessage.toLowerCase().includes("apple")) {
      return "Apples are nutritious fruits that are high in fiber, vitamin C, and various antioxidants. They're associated with numerous health benefits, including improved heart health and potential reduced risk of certain cancers. The saying 'an apple a day keeps the doctor away' reflects their reputation as a healthy food choice.\n\nNote: I'm currently operating in offline mode with limited capabilities.";
    }

    // Default response for any other queries
    return "I'm Dr. Echo, your health assistant. I'm currently operating in offline mode with limited capabilities. In this mode, I can only provide very general health information. For more specific guidance, please try again when my connection to the AI service is restored.\n\nFor medical concerns, please consult with a healthcare professional.\n\nTechnical note: The AI service connection is experiencing issues. This could be due to API key configuration, network connectivity, or service availability. Please check the console for more detailed error information.";
  }

  /**
   * Generate a streaming fallback response
   */
  private async generateFallbackStreamingResponse(
    messages: Message[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      const response = await this.generateFallbackResponse(messages);
      let currentText = "";
      const words = response.split(" ");
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing delay
        currentText += (i === 0 ? "" : " ") + words[i];
        callbacks.onToken?.(currentText);
      }
      
      callbacks.onComplete?.(response);
    } catch (error) {
      const errorMessage = "I'm sorry, I encountered an error. Please try again.";
      callbacks.onError?.(error instanceof Error ? error : new Error(errorMessage));
      callbacks.onComplete?.(errorMessage);
    }
  }
}

// Singleton instance for use throughout the app
let aiAssistantInstance: AIAssistantService | null = null;

export function getAIAssistant(): AIAssistantService {
  if (!aiAssistantInstance) {
    aiAssistantInstance = new AIAssistantService();
  }
  return aiAssistantInstance;
} 