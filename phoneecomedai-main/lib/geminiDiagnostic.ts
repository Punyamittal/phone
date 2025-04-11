/**
 * Gemini API Diagnostic Tool
 * Identifies specific issues with the Gemini API connection
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Define error types
export enum DiagnosticErrorType {
  NONE = "NONE",
  API_KEY_ERROR = "API_KEY_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  PERMISSION_ERROR = "PERMISSION_ERROR",
  QUOTA_ERROR = "QUOTA_ERROR",
  CONTENT_FILTER_ERROR = "CONTENT_FILTER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

interface DiagnosticResult {
  success: boolean;
  errorType: DiagnosticErrorType;
  errorMessage: string;
  timestamp: string;
  apiKeyValid: boolean;
  modelResponse?: string;
  rawError?: any;
  requestDetails?: {
    apiKey: string; // Will be partially masked
    model: string;
    prompt: string;
  }
}

// Helper function to mask the API key
const maskApiKey = (apiKey: string): string => {
  if (!apiKey) return "[EMPTY]";
  if (apiKey.length <= 8) return "****";
  
  return apiKey.substring(0, 4) + "*".repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
};

// Run the diagnostic test
export async function runDiagnostic(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    success: false,
    errorType: DiagnosticErrorType.NONE,
    errorMessage: "",
    timestamp: new Date().toISOString(),
    apiKeyValid: false,
    requestDetails: {
      apiKey: "",
      model: "",
      prompt: ""
    }
  };

  try {
    console.log("🧪 Starting Gemini API diagnostic test");
    
    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log("❌ API key not found");
      result.errorType = DiagnosticErrorType.API_KEY_ERROR;
      result.errorMessage = "API key is missing. Please check your environment variables.";
      result.apiKeyValid = false;
      return result;
    }
    
    // Mask API key for logging
    const maskedApiKey = maskApiKey(apiKey);
    result.requestDetails!.apiKey = maskedApiKey;
    console.log(`🔑 Using API key: ${maskedApiKey}`);
    
    // Initialize the API client
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("✅ API client initialized");
    
    // Try different model names
    const modelNames = ["gemini-1.5-pro", "gemini-pro"];
    let modelError = null;
    
    // Try each model name until one works
    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Attempting to use model: ${modelName}`);
        
        // Get the model
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          safetySettings: [
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
          ]
        });
        
        result.requestDetails!.model = modelName;
        console.log(`✅ Model instance created: ${modelName}`);
        
        // Prepare test prompt
        const prompt = "Hello, please respond with a brief message confirming you received this message. This is a diagnostic test.";
        result.requestDetails!.prompt = prompt;
        console.log(`📝 Using test prompt: "${prompt}"`);
        
        // Generate content
        console.log("🔄 Generating content...");
        const generationResult = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        const response = generationResult.response;
        const text = response.text();
        
        console.log(`✅ Response received: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        
        // Test successful
        result.success = true;
        result.apiKeyValid = true;
        result.modelResponse = text;
        console.log(`🎉 Diagnostic test completed successfully with model: ${modelName}`);
        
        return result;
      } catch (error: any) {
        console.error(`❌ Error with model ${modelName}:`, error.message);
        modelError = error;
        // Continue to try the next model
      }
    }
    
    // If we get here, all models failed
    throw modelError || new Error("All models failed to generate content");
    
  } catch (error: any) {
    console.error("❌ Diagnostic test failed:", error);
    
    result.rawError = error;
    result.success = false;
    
    // Determine error type
    if (!process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY) {
      result.errorType = DiagnosticErrorType.API_KEY_ERROR;
      result.errorMessage = "API key is missing. Please check your environment variables.";
      
    } else if (error.message?.includes("API key")) {
      result.errorType = DiagnosticErrorType.API_KEY_ERROR;
      result.errorMessage = "Invalid API key. Please check your API key.";
      
    } else if (error.message?.includes("network") || error.name === "NetworkError" || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      result.errorType = DiagnosticErrorType.NETWORK_ERROR;
      result.errorMessage = "Network error. Please check your internet connection.";
      
    } else if (error.message?.includes("permission") || error.message?.includes("access") || error.message?.includes("authorization")) {
      result.errorType = DiagnosticErrorType.PERMISSION_ERROR;
      result.errorMessage = "Permission error. Your API key may not have access to this model.";
      
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      result.errorType = DiagnosticErrorType.QUOTA_ERROR;
      result.errorMessage = "Quota exceeded. You may have reached your API usage limit.";
      
    } else if (error.message?.includes("content filter") || error.message?.includes("blocked") || error.message?.includes("safety")) {
      result.errorType = DiagnosticErrorType.CONTENT_FILTER_ERROR;
      result.errorMessage = "Content filtered. The request was blocked by content safety filters.";
      
    } else {
      result.errorType = DiagnosticErrorType.UNKNOWN_ERROR;
      
      // Enhanced error message for model not found
      if (error.message?.includes("not found") || error.message?.includes("404")) {
        result.errorMessage = "Model not found. This API key may not have access to the Gemini models or they may need to be enabled in your Google Cloud project.";
      } else {
        result.errorMessage = `Unknown error: ${error.message || "No error message provided"}`;
      }
    }
    
    return result;
  }
}

// Generate a user-friendly report
export async function getDiagnosticReport(): Promise<string> {
  const result = await runDiagnostic();
  
  let report = `=== Gemini API Diagnostic Report ===\n`;
  report += `Timestamp: ${new Date(result.timestamp).toLocaleString()}\n\n`;
  
  if (result.success) {
    report += `✅ Success! The Gemini API is working correctly.\n\n`;
    report += `Model: ${result.requestDetails?.model}\n\n`;
    report += `Model Response:\n"${result.modelResponse}"\n\n`;
  } else {
    report += `❌ Error: ${result.errorMessage}\n\n`;
    report += `Error Type: ${result.errorType}\n\n`;
    
    // Add suggestions based on error type
    report += `Suggested Action:\n`;
    
    switch (result.errorType) {
      case DiagnosticErrorType.API_KEY_ERROR:
        report += `- Verify your API key in the .env.local file\n`;
        report += `- Make sure the key name is NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY\n`;
        report += `- Generate a new API key at https://makersuite.google.com/app/apikey\n`;
        break;
        
      case DiagnosticErrorType.NETWORK_ERROR:
        report += `- Check your internet connection\n`;
        report += `- Verify if any firewall or proxy is blocking the connection\n`;
        report += `- Try again in a few minutes\n`;
        break;
        
      case DiagnosticErrorType.PERMISSION_ERROR:
        report += `- Ensure your Google Cloud account has access to the Gemini API\n`;
        report += `- Check if your API key has the necessary permissions\n`;
        report += `- Verify if you've enabled the Gemini API in your Google Cloud console\n`;
        break;
        
      case DiagnosticErrorType.QUOTA_ERROR:
        report += `- You may have exceeded your API usage quota\n`;
        report += `- Wait until your quota resets or upgrade your plan\n`;
        report += `- Consider implementing rate limiting in your application\n`;
        break;
        
      case DiagnosticErrorType.CONTENT_FILTER_ERROR:
        report += `- Your prompt may have triggered content safety filters\n`;
        report += `- Try modifying your prompts to avoid sensitive topics\n`;
        report += `- Check the safety settings in your Gemini model configuration\n`;
        break;
        
      default:
        report += `- Visit https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com and enable the API\n`;
        report += `- Make sure you've set up billing for your Google Cloud project\n`;
        report += `- Try using a different API key or generating a new one\n`;
        report += `- Verify the model name is correct (gemini-pro or gemini-1.5-pro)\n`;
    }
  }
  
  // Technical details section
  report += `\n=== Technical Details ===\n`;
  report += `API Key: ${result.requestDetails?.apiKey || "[NOT PROVIDED]"}\n`;
  report += `Model: ${result.requestDetails?.model || "[NOT SPECIFIED]"}\n`;
  report += `Test Prompt: "${result.requestDetails?.prompt || "[NOT SPECIFIED]"}"\n\n`;
  
  if (result.rawError) {
    report += `Raw Error:\n${JSON.stringify(result.rawError, null, 2)}\n`;
  }
  
  return report;
} 