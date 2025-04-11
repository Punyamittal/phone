/**
 * Direct Gemini API Integration
 * Enhanced implementation for accurate health and disease information
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateFallbackResponse } from "./fallbackResponses";

// Get API key from environment variables
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "";

// Basic debugging
if (!API_KEY) {
  console.error("No API key found for Gemini API");
}

// Enhanced healthcare system prompt with specialized disease guidance
const SYSTEM_PROMPT = `
You are a sophisticated medical AI assistant. Your goal is to provide accurate, evidence-based information about health conditions and diseases while being compassionate and helpful.

When responding to questions about diseases or health conditions:
1. Provide a clear, concise description of the condition
2. List the most common symptoms with their prevalence if available
3. Mention standard diagnostic approaches
4. Outline typical treatment options (both medical and lifestyle-based)
5. Include important warning signs that would require immediate medical attention
6. Add prevention measures when applicable
7. Cite authoritative sources like WHO, CDC, or major medical associations
8. Be informative without causing unnecessary alarm
9. Acknowledge the limitations of AI diagnosis and encourage professional consultation

Always structure your responses systematically for clarity, and consider the emotional impact of your information. 
Balance accuracy with empathy, especially for serious conditions. Never make definitive personal diagnoses.

Remember: You provide information to help users understand health conditions better, but you do not replace professional medical care.
`;

/**
 * Enhanced function to generate a response using Gemini API
 * Specialized for health and disease related queries
 */
export async function getAIResponse(userMessage: string): Promise<string> {
  try {
    // Determine if the query is likely health-related for specialized handling
    const isHealthQuery = detectHealthQuery(userMessage);
    let fullPrompt = '';
    
    if (isHealthQuery) {
      // Add specialized context for disease/health queries
      fullPrompt = `${SYSTEM_PROMPT}\n\n`;
      
      // For likely disease queries, add additional context
      if (userMessage.toLowerCase().includes("symptoms") || 
          userMessage.toLowerCase().includes("do i have") ||
          userMessage.toLowerCase().includes("suffering from")) {
        fullPrompt += `The user appears to be asking about a health condition or symptoms. Remember to:
- Be thorough but balanced in your information
- Include reliable information about symptoms, causes, and treatments
- Emphasize the importance of professional medical diagnosis
- Avoid making definitive statements about the user's specific condition\n\n`;
      }
      
      fullPrompt += `User query: ${userMessage}\n\nYour helpful, accurate, and structured response:`;
    } else {
      // Standard prompt for non-health queries
      fullPrompt = `${SYSTEM_PROMPT}\n\nUser query: ${userMessage}\n\nYour response:`;
    }
    
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get the generative model - use gemini-1.5-pro for better medical knowledge
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
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
    
    // Generate content with error handling - proper format
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more factual responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048, // Allow longer responses for thorough explanations
      }
    });
    
    // Process the response
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Error in getAIResponse:", error);
    console.error("Error details:", error.message);
    
    // Return a fallback response when the API fails
    return generateFallbackResponse(userMessage);
  }
}

/**
 * Enhanced streaming version of the API call
 * Updates the UI as chunks of the response arrive
 */
export async function getStreamingAIResponse(
  userMessage: string,
  onUpdate: (text: string) => void
): Promise<string> {
  try {
    // Determine if the query is likely health-related for specialized handling
    const isHealthQuery = detectHealthQuery(userMessage);
    let fullPrompt = '';
    
    if (isHealthQuery) {
      // Add specialized context for disease/health queries
      fullPrompt = `${SYSTEM_PROMPT}\n\n`;
      
      // For likely disease queries, add additional context
      if (userMessage.toLowerCase().includes("symptoms") || 
          userMessage.toLowerCase().includes("do i have") ||
          userMessage.toLowerCase().includes("suffering from")) {
        fullPrompt += `The user appears to be asking about a health condition or symptoms. Remember to:
- Be thorough but balanced in your information
- Include reliable information about symptoms, causes, and treatments
- Emphasize the importance of professional medical diagnosis
- Avoid making definitive statements about the user's specific condition\n\n`;
      }
      
      fullPrompt += `User query: ${userMessage}\n\nYour helpful, accurate, and structured response:`;
    } else {
      // Standard prompt for non-health queries
      fullPrompt = `${SYSTEM_PROMPT}\n\nUser query: ${userMessage}\n\nYour response:`;
    }
    
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get the generative model - use gemini-1.5-pro for better medical knowledge
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
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
    
    // Generate streaming content with error handling - proper format
    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more factual responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048, // Allow longer responses for thorough explanations
      }
    });
    
    // Process the streaming response
    let fullResponse = "";
    
    for await (const chunk of result.stream) {
      const partialResponse = chunk.text();
      fullResponse += partialResponse;
      onUpdate(fullResponse);
    }
    
    return fullResponse;
  } catch (error: any) {
    console.error("Error in getStreamingAIResponse:", error);
    console.error("Error details:", error.message);
    
    // Return a fallback response when the API fails
    const fallbackResponse = generateFallbackResponse(userMessage);
    onUpdate(fallbackResponse);
    return fallbackResponse;
  }
}

/**
 * Helper function to detect if a query is likely health or disease related
 */
function detectHealthQuery(query: string): boolean {
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