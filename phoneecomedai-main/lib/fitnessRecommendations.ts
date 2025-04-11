/**
 * Fitness Recommendations Module
 * Provides specialized fitness and nutrition recommendations based on user data
 */

/**
 * Generate a personalized fitness response based on the user's fitness data
 */
export function generateFitnessResponse(message: string): string {
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
  
  // Build personalized response - using plain formatting that works in chat
  let response = "PERSONALIZED FITNESS RECOMMENDATIONS\n\n";
  
  // Weight management section
  if (currentWeight && weightGoal) {
    const weightDiff = currentWeight - weightGoal;
    if (weightDiff > 0) {
      response += "WEIGHT MANAGEMENT\n";
      response += `You're currently ${weightDiff.toFixed(1)} lbs from your goal weight. `;
      response += "To achieve sustainable weight loss:\n";
      response += "• Aim for a moderate caloric deficit of 300-500 calories per day\n";
      response += "• Focus on lean proteins, vegetables, and whole foods\n";
      response += "• Consider tracking your macronutrients (40% carbs, 30% protein, 30% fat)\n";
      response += "• Drink plenty of water before meals to help with satiety\n\n";
    } else if (weightDiff < 0) {
      response += "WEIGHT MANAGEMENT\n";
      response += `You're currently ${Math.abs(weightDiff).toFixed(1)} lbs under your goal weight. `;
      response += "To healthily gain weight:\n";
      response += "• Increase your caloric intake by 300-500 calories per day\n";
      response += "• Focus on nutrient-dense foods and protein sources\n";
      response += "• Incorporate strength training to build muscle mass\n\n";
    } else {
      response += "WEIGHT MANAGEMENT\n";
      response += "You're at your goal weight! To maintain:\n";
      response += "• Focus on balanced nutrition and portion control\n";
      response += "• Continue your current exercise routine\n";
      response += "• Monitor your weight weekly to catch any changes early\n\n";
    }
  }
  
  // Activity recommendations
  if (stepsMatch) {
    const currentSteps = parseInt(stepsMatch[1]);
    const stepGoal = parseInt(stepsMatch[2]);
    
    response += "ACTIVITY PLAN\n";
    if (currentSteps < stepGoal) {
      response += `You're ${stepGoal - currentSteps} steps away from your daily goal. `;
      response += "Try these strategies to increase your daily movement:\n";
      response += "• Take short walking breaks every hour\n";
      response += "• Park further from entrances\n";
      response += "• Take the stairs instead of elevators\n";
      response += "• Consider an evening walk after dinner\n\n";
    } else {
      response += "Great job meeting your step goal! To continue challenging yourself:\n";
      response += "• Gradually increase your daily goal by 500-1000 steps\n";
      response += "• Add short bursts of higher intensity walking\n";
      response += "• Consider adding variety with hiking or jogging\n\n";
    }
  }
  
  // Workout recommendations
  response += "RECOMMENDED WORKOUT PLAN\n";
  response += "Based on your current metrics, here's a balanced weekly workout plan:\n\n";
  response += "• Monday: Strength training (full body) - 45 minutes\n";
  response += "• Tuesday: Cardio (moderate intensity) - 30 minutes\n";
  response += "• Wednesday: Rest or light activity (walking/yoga)\n";
  response += "• Thursday: Strength training (upper body focus) - 45 minutes\n";
  response += "• Friday: Cardio (interval training) - 25 minutes\n";
  response += "• Saturday: Strength training (lower body focus) - 45 minutes\n";
  response += "• Sunday: Active recovery (stretching, walking)\n\n";
  
  // Nutrition recommendations
  response += "NUTRITION TIPS\n";
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
  response += "• Prioritize protein (0.7-1g per pound of body weight)\n";
  response += "• Eat plenty of vegetables and fruits (aim for half your plate)\n";
  response += "• Choose complex carbs (whole grains, beans, starchy vegetables)\n";
  response += "• Include healthy fats from sources like avocados, nuts, and olive oil\n";
  response += "• Stay hydrated with at least 64oz of water daily\n\n";
  
  // Sleep recommendations
  if (sleepMatch) {
    const currentSleep = parseFloat(sleepMatch[1]);
    const sleepGoal = parseFloat(sleepMatch[2]);
    
    response += "SLEEP OPTIMIZATION\n";
    if (currentSleep < sleepGoal) {
      response += `You're getting ${currentSleep} hours of sleep, which is below your goal of ${sleepGoal} hours. `;
      response += "To improve sleep quality:\n";
      response += "• Maintain a consistent sleep schedule\n";
      response += "• Create a relaxing bedtime routine\n";
      response += "• Limit screen time 1 hour before bed\n";
      response += "• Keep your bedroom cool, dark, and quiet\n";
    } else {
      response += "You're meeting your sleep goal, which is excellent for recovery and overall health!\n";
    }
  }
  
  // Final note
  response += "\nPROGRESS TRACKING\n";
  response += "Track your progress weekly rather than daily to account for normal fluctuations. ";
  response += "Adjust your plan as needed based on your results and how you feel.\n\n";
  response += "Remember that consistency is more important than perfection. ";
  response += "Small, sustainable changes will lead to long-term success.";
  
  return response;
} 