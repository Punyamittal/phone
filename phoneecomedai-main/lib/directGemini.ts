/**
 * Emergency direct implementation of Gemini API
 * This file provides a simplified approach to using the Gemini API
 * with minimal complexity and dependencies.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variables for security
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "";

// Basic debugging
if (!API_KEY) {
  console.error("No API key found for Gemini API");
}

export async function generateDirectResponse(prompt: string): Promise<string> {
  try {
    console.log("Testing Gemini API with model: gemini-pro");
    
    // Initialize with basic configuration
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get the model with explicit name
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Format the prompt as a content part
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Error in generateDirectResponse:", error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Stack trace:", error.stack);
    
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
}

export async function generateDirectStreamingResponse(
  prompt: string,
  onUpdate: (text: string) => void
): Promise<string> {
  try {
    console.log("Testing Gemini streaming API with model: gemini-pro");
    
    // Initialize with basic configuration
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get the model with explicit name
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Format the prompt as a content part
    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    let fullResponse = "";
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      onUpdate(fullResponse);
    }
    
    return fullResponse;
  } catch (error: any) {
    console.error("Error in generateDirectStreamingResponse:", error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Stack trace:", error.stack);
    
    const errorMessage = "I'm sorry, I encountered an error processing your request. Please try again later.";
    onUpdate(errorMessage);
    return errorMessage;
  }
} 