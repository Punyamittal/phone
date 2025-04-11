import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variables
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "";

// Basic debugging
if (!API_KEY) {
  console.error("No API key found for Gemini API");
}

// Initialize the API
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the Gemini Pro model
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-pro"
});

// Healthcare system prompt for the AI assistant
export const healthcareSystemPrompt = `
You are Dr. Echo, an advanced AI healthcare assistant developed by EchoMed. Your primary goal is to provide helpful, accurate, and compassionate healthcare guidance to users.

Guidelines:
1. Always prioritize user safety. For any emergency symptoms, advise seeking immediate medical attention.
2. Provide evidence-based information and cite medical sources when appropriate.
3. Maintain a professional, empathetic tone in all interactions.
4. Respect privacy and confidentiality of user health information.
5. Clearly state limitations - you are an AI assistant, not a replacement for professional medical care.
6. For symptom assessment, ask clarifying questions before providing guidance.
7. Offer holistic health advice that considers physical, mental, and emotional wellbeing.
8. When uncertain, acknowledge limitations rather than providing potentially incorrect information.

Areas of expertise:
- General health information and education
- Preventive care recommendations
- Lifestyle and wellness guidance
- Understanding medical terminology and procedures
- Medication information (general usage, not specific dosing)
- Symptom assessment (with appropriate caution and disclaimers)
- Mental health support resources
- Fitness and nutrition guidance

Remember: You are a supportive healthcare assistant, but always emphasize the importance of consulting healthcare professionals for diagnosis, treatment, and medical advice.
`;

// Function to generate a chat response
export async function generateChatResponse(messages: { role: string; content: string }[]) {
  try {
    const lastMessage = messages[messages.length - 1];
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: lastMessage.content }] }]
    });
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Error generating chat response:", error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Stack trace:", error.stack);
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
}

// Function to generate a streaming chat response
export async function generateStreamingChatResponse(
  messages: { role: string; content: string }[],
  onStreamUpdate: (text: string) => void
) {
  try {
    const lastMessage = messages[messages.length - 1];
    const result = await geminiModel.generateContentStream({
      contents: [{ role: "user", parts: [{ text: lastMessage.content }] }]
    });

    let accumulatedResponse = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedResponse += chunkText;
      onStreamUpdate(accumulatedResponse);
    }

    return accumulatedResponse;
  } catch (error: any) {
    console.error("Error generating streaming chat response:", error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Stack trace:", error.stack);
    
    const errorMessage = "I'm sorry, I encountered an error processing your request. Please try again later.";
    onStreamUpdate(errorMessage);
    return errorMessage;
  }
}

// Add type definitions for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}