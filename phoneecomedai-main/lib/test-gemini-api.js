// Simple test script to verify the Gemini API key works
// Run this with: node lib/test-gemini-api.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// The API key to test
const API_KEY = 'AIzaSyCYqDftrAIuVJXkMnwpD55CfdSmGN7eAW0';

async function testGeminiAPI() {
  console.log('Testing Gemini API...');
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` : 'Missing');
  
  try {
    // Initialize the API
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('GoogleGenerativeAI initialized');
    
    // Get the model - using the correct model name for the current API version
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    console.log('Model retrieved: gemini-1.5-pro');
    
    // Generate content
    console.log('Sending test request...');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello, this is a test. Please respond with a short greeting.' }] }]
    });
    
    // Get the response
    const response = result.response;
    const text = response.text();
    
    console.log('API Test Successful!');
    console.log('Response:', text);
    return true;
  } catch (error) {
    console.error('API Test Failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test
testGeminiAPI()
  .then(success => {
    console.log('Test completed:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 