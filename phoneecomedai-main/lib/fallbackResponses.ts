/**
 * Fallback response system for when the Gemini API is not working
 * This provides static responses to ensure the chatbot works even if the API fails
 */

// Simple responses to common health questions
const FALLBACK_RESPONSES: Record<string, string> = {
  "default": "I'm Dr. Echo, your health assistant. I can help answer general health questions, but please consult a healthcare professional for medical advice.",
  "hello": "Hello! I'm Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?",
  "hi": "Hi there! I'm Dr. Echo. How can I assist you with your health concerns today?",
  "how are you": "I'm functioning well and ready to assist you with health information. How can I help you today?",
  "headache": "Headaches can be caused by many factors including stress, dehydration, lack of sleep, or eyestrain. For occasional headaches, rest, hydration, and over-the-counter pain relievers may help. If you experience severe or recurring headaches, please consult a healthcare professional.",
  "cold": "Common cold symptoms include runny nose, sore throat, cough, and mild fever. Rest, staying hydrated, and over-the-counter medications can help manage symptoms. If symptoms persist for more than 10 days or become severe, consult a healthcare professional.",
  "fever": "Fever is often a sign that your body is fighting an infection. Rest, staying hydrated, and taking over-the-counter fever reducers can help. If your fever is high (above 103°F/39.4°C), persists for more than three days, or is accompanied by severe symptoms, seek medical attention.",
  "sleep": "Good sleep hygiene includes maintaining a regular sleep schedule, creating a comfortable sleep environment, limiting screen time before bed, and avoiding caffeine and large meals close to bedtime. Adults typically need 7-9 hours of sleep per night.",
  "diet": "A balanced diet typically includes a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. It's important to limit processed foods, added sugars, and excessive salt. Staying hydrated by drinking plenty of water is also essential for good health.",
  "exercise": "Regular physical activity is important for maintaining good health. Adults should aim for at least 150 minutes of moderate-intensity aerobic activity or 75 minutes of vigorous activity per week, along with muscle-strengthening activities twice a week.",
  "stress": "Stress management techniques include deep breathing exercises, meditation, physical activity, adequate sleep, and maintaining social connections. If stress is significantly impacting your daily life, consider speaking with a healthcare professional.",
  "fitness": "Based on your fitness data, here are personalized recommendations: Focus on strength training 2-3 times per week along with cardio sessions 3-4 times per week. For weight management, maintain a small caloric deficit while ensuring adequate protein intake (0.8-1g per pound of body weight). Stay consistent with your step count goals and ensure proper hydration throughout the day.",
  "nutrition": "For optimal health, focus on a balanced diet with plenty of vegetables, lean proteins, and complex carbohydrates. Try to minimize processed foods and added sugars. Aim for a moderate caloric deficit if weight loss is your goal, and consider tracking your macronutrients to ensure balanced nutrition.",
  "weight management": "For healthy and sustainable weight management, focus on creating a moderate caloric deficit through a combination of reduced calorie intake and increased physical activity. Prioritize protein-rich foods to preserve muscle mass, and incorporate both strength training and cardio into your routine. Stay consistent and track your progress regularly."
};

/**
 * Generate a fallback response based on the user's message
 * This will match keywords in the user's message to provide relevant responses
 */
export function generateFallbackResponse(message: string): string {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Special handling for fitness tracker data
  if (lowerMessage.includes("fitness data") && lowerMessage.includes("goal")) {
    return generateFitnessResponse(message);
  }
  
  // Check for exact matches first
  if (FALLBACK_RESPONSES[lowerMessage]) {
    return FALLBACK_RESPONSES[lowerMessage];
  }
  
  // Check for keyword matches
  for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (keyword !== "default" && lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  // If no matches, return default response
  return FALLBACK_RESPONSES["default"] + "\n\nI notice that the AI system is currently not connecting properly to provide a more specific answer to your question. This is a temporary backup response.";
}

/**
 * Generate a personalized fitness response based on the user's fitness data
 */
function generateFitnessResponse(message: string): string {
  // Parse the message to extract weight, goals, steps, etc.
  const weightMatch = message.match(/current weight: (\d+\.?\d*) lbs \(goal: (\d+\.?\d*) lbs\)/i);
  const stepsMatch = message.match(/daily steps: (\d+) \(goal: (\d+)\)/i);
  const activeMinutesMatch = message.match(/active minutes: (\d+) \(goal: (\d+)\)/i);
  const sleepMatch = message.match(/sleep: (\d+\.?\d*) hours \(goal: (\d+\.?\d*) hours\)/i);
  const caloriesConsumedMatch = message.match(/calories consumed today: (\d+) \(goal: (\d+)\)/i);
  const caloriesBurnedMatch = message.match(/calories burned today: (\d+)/i);
  
  // Current weight and goal
  const currentWeight = weightMatch ? parseFloat(weightMatch[1]) : null;
  const weightGoal = weightMatch ? parseFloat(weightMatch[2]) : null;
  
  // Build personalized response
  let response = "# Personalized Fitness Recommendations\n\n";
  
  // Weight management section
  if (currentWeight && weightGoal) {
    const weightDiff = currentWeight - weightGoal;
    if (weightDiff > 0) {
      response += "## Weight Management\n";
      response += `You're currently ${weightDiff.toFixed(1)} lbs from your goal weight. `;
      response += "To achieve sustainable weight loss:\n";
      response += "- Aim for a moderate caloric deficit of 300-500 calories per day\n";
      response += "- Focus on lean proteins, vegetables, and whole foods\n";
      response += "- Consider tracking your macronutrients (40% carbs, 30% protein, 30% fat)\n";
      response += "- Drink plenty of water before meals to help with satiety\n\n";
    } else if (weightDiff < 0) {
      response += "## Weight Management\n";
      response += `You're currently ${Math.abs(weightDiff).toFixed(1)} lbs under your goal weight. `;
      response += "To healthily gain weight:\n";
      response += "- Increase your caloric intake by 300-500 calories per day\n";
      response += "- Focus on nutrient-dense foods and protein sources\n";
      response += "- Incorporate strength training to build muscle mass\n\n";
    } else {
      response += "## Weight Management\n";
      response += "You're at your goal weight! To maintain:\n";
      response += "- Focus on balanced nutrition and portion control\n";
      response += "- Continue your current exercise routine\n";
      response += "- Monitor your weight weekly to catch any changes early\n\n";
    }
  }
  
  // Activity recommendations
  if (stepsMatch) {
    const currentSteps = parseInt(stepsMatch[1]);
    const stepGoal = parseInt(stepsMatch[2]);
    
    response += "## Activity Plan\n";
    if (currentSteps < stepGoal) {
      response += `You're ${stepGoal - currentSteps} steps away from your daily goal. `;
      response += "Try these strategies to increase your daily movement:\n";
      response += "- Take short walking breaks every hour\n";
      response += "- Park further from entrances\n";
      response += "- Take the stairs instead of elevators\n";
      response += "- Consider an evening walk after dinner\n\n";
    } else {
      response += "Great job meeting your step goal! To continue challenging yourself:\n";
      response += "- Gradually increase your daily goal by 500-1000 steps\n";
      response += "- Add short bursts of higher intensity walking\n";
      response += "- Consider adding variety with hiking or jogging\n\n";
    }
  }
  
  // Workout recommendations
  response += "## Recommended Workout Plan\n";
  response += "Based on your current metrics, here's a balanced weekly workout plan:\n\n";
  response += "- **Monday**: Strength training (full body) - 45 minutes\n";
  response += "- **Tuesday**: Cardio (moderate intensity) - 30 minutes\n";
  response += "- **Wednesday**: Rest or light activity (walking/yoga)\n";
  response += "- **Thursday**: Strength training (upper body focus) - 45 minutes\n";
  response += "- **Friday**: Cardio (interval training) - 25 minutes\n";
  response += "- **Saturday**: Strength training (lower body focus) - 45 minutes\n";
  response += "- **Sunday**: Active recovery (stretching, walking)\n\n";
  
  // Nutrition recommendations
  response += "## Nutrition Tips\n";
  if (caloriesConsumedMatch && caloriesBurnedMatch) {
    const consumed = parseInt(caloriesConsumedMatch[1]);
    const burned = parseInt(caloriesBurnedMatch[1]);
    const calorieBalance = consumed - burned;
    
    response += `Your current calorie balance is ${calorieBalance} calories. `;
    if (weightMatch && parseFloat(weightMatch[1]) > parseFloat(weightMatch[2])) {
      response += "For weight loss, aim for a moderate deficit of 300-500 calories.\n\n";
    } else {
      response += "For maintenance, try to keep your calorie balance near zero.\n\n";
    }
  }
  
  response += "Focus on these nutrition strategies:\n";
  response += "- Prioritize protein (0.7-1g per pound of body weight)\n";
  response += "- Eat plenty of vegetables and fruits (aim for half your plate)\n";
  response += "- Choose complex carbs (whole grains, beans, starchy vegetables)\n";
  response += "- Include healthy fats from sources like avocados, nuts, and olive oil\n";
  response += "- Stay hydrated with at least 64oz of water daily\n\n";
  
  // Sleep recommendations
  if (sleepMatch) {
    const currentSleep = parseFloat(sleepMatch[1]);
    const sleepGoal = parseFloat(sleepMatch[2]);
    
    response += "## Sleep Optimization\n";
    if (currentSleep < sleepGoal) {
      response += `You're getting ${currentSleep} hours of sleep, which is below your goal of ${sleepGoal} hours. `;
      response += "To improve sleep quality:\n";
      response += "- Maintain a consistent sleep schedule\n";
      response += "- Create a relaxing bedtime routine\n";
      response += "- Limit screen time 1 hour before bed\n";
      response += "- Keep your bedroom cool, dark, and quiet\n";
    } else {
      response += "You're meeting your sleep goal, which is excellent for recovery and overall health!\n";
    }
  }
  
  // Final note
  response += "\n## Progress Tracking\n";
  response += "Track your progress weekly rather than daily to account for normal fluctuations. ";
  response += "Adjust your plan as needed based on your results and how you feel.\n\n";
  response += "Remember that consistency is more important than perfection. ";
  response += "Small, sustainable changes will lead to long-term success.";
  
  return response;
}

/**
 * Simulate a streaming response by breaking the message into chunks
 * and delivering them with slight delays to mimic API streaming
 */
export async function generateFallbackStreamingResponse(
  message: string,
  onUpdate: (text: string) => void
): Promise<string> {
  return new Promise((resolve) => {
    const fullResponse = generateFallbackResponse(message);
    let currentResponse = "";
    const words = fullResponse.split(" ");
    
    // Function to add words with a delay
    const addWord = (index: number) => {
      if (index < words.length) {
        // Add the next word
        currentResponse += (index === 0 ? "" : " ") + words[index];
        onUpdate(currentResponse);
        
        // Schedule the next word
        setTimeout(() => addWord(index + 1), 50);
      } else {
        // All words added, resolve the promise
        resolve(fullResponse);
      }
    };
    
    // Start adding words
    addWord(0);
  });
} 