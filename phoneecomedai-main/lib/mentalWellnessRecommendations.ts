/**
 * Mental Wellness Recommendations Module
 * Provides specialized mental wellness advice based on user data
 */

/**
 * Generate a personalized mental wellness response based on the user's data
 */
export function generateMentalWellnessResponse(message: string): string {
  // Parse the message to extract mental wellness data
  const moodMatch = message.match(/Mood: (\d+)\/10 \(([^)]+)\)/i);
  const anxietyMatch = message.match(/Anxiety Level: (\d+)\/10 \(([^)]+)\)/i);
  const sleepMatch = message.match(/Sleep Quality: (\d+)\/10 \(([^)]+)\)/i);
  const energyMatch = message.match(/Energy Level: (\d+)\/10 \(([^)]+)\)/i);
  const focusMatch = message.match(/Focus Level: (\d+)\/10 \(([^)]+)\)/i);
  const journalMatch = message.match(/Journal Entry: (.+?)(\n|$)/i);
  
  // Extract values for analysis
  const moodScore = moodMatch ? parseInt(moodMatch[1]) : null;
  const moodLabel = moodMatch ? moodMatch[2] : null;
  const anxietyScore = anxietyMatch ? parseInt(anxietyMatch[1]) : null;
  const anxietyLabel = anxietyMatch ? anxietyMatch[2] : null;
  const sleepScore = sleepMatch ? parseInt(sleepMatch[1]) : null;
  const sleepLabel = sleepMatch ? sleepMatch[2] : null;
  const energyScore = energyMatch ? parseInt(energyMatch[1]) : null;
  const energyLabel = energyMatch ? energyMatch[2] : null;
  const focusScore = focusMatch ? parseInt(focusMatch[1]) : null;
  const focusLabel = focusMatch ? focusMatch[2] : null;
  const journalEntry = journalMatch ? journalMatch[1].trim() : null;
  
  // Build personalized response using plain formatting that works in chat
  let response = "PERSONALIZED MENTAL WELLNESS RECOMMENDATIONS\n\n";
  
  // Overall wellness assessment
  response += "WELLNESS ASSESSMENT\n";
  
  let overallRating = "moderate";
  let areaOfFocus = "overall balance";
  let overallScore = 0;
  let validScores = 0;
  
  // Calculate average score and determine area that needs most attention
  if (moodScore !== null) {
    overallScore += moodScore;
    validScores++;
  }
  if (anxietyScore !== null) {
    // Note: A high anxiety score is actually worse, so we invert it
    overallScore += (10 - anxietyScore);
    validScores++;
    if (anxietyScore > 5) {
      areaOfFocus = "anxiety management";
    }
  }
  if (sleepScore !== null) {
    overallScore += sleepScore;
    validScores++;
    if (sleepScore < 5 && (areaOfFocus === "overall balance" || anxietyScore === null || anxietyScore <= 5)) {
      areaOfFocus = "sleep quality";
    }
  }
  if (energyScore !== null) {
    overallScore += energyScore;
    validScores++;
    if (energyScore < 5 && areaOfFocus === "overall balance") {
      areaOfFocus = "energy level";
    }
  }
  if (focusScore !== null) {
    overallScore += focusScore;
    validScores++;
    if (focusScore < 5 && areaOfFocus === "overall balance") {
      areaOfFocus = "focus and concentration";
    }
  }
  
  // Calculate average and determine overall rating
  const averageScore = validScores > 0 ? overallScore / validScores : 5;
  
  if (averageScore >= 7.5) {
    overallRating = "good";
  } else if (averageScore >= 5) {
    overallRating = "moderate";
  } else {
    overallRating = "needs attention";
  }
  
  // Add overall assessment
  response += `Based on your self-assessment, your overall mental wellness appears to be ${overallRating}. `;
  
  if (overallRating === "good") {
    response += "You're doing well in maintaining your mental health. The following recommendations will help you maintain and further enhance your wellbeing.\n\n";
  } else if (overallRating === "moderate") {
    response += "There are some areas where you could benefit from targeted strategies. The following recommendations are focused on helping you improve your overall mental wellness.\n\n";
  } else {
    response += "It seems you're facing some challenges right now. The following recommendations are designed to provide immediate support and strategies for improving your mental wellbeing.\n\n";
  }
  
  // Mood recommendations
  if (moodScore !== null) {
    response += "MOOD ENHANCEMENT\n";
    if (moodScore >= 7) {
      response += "Your mood is quite positive. To maintain this state:\n";
      response += "• Continue engaging in activities that bring you joy\n";
      response += "• Practice gratitude by noting three positive things each day\n";
      response += "• Share your positive energy with others through kind actions\n";
      response += "• Document what works well for you to reference during lower mood periods\n\n";
    } else if (moodScore >= 4) {
      response += "Your mood is moderate. To enhance your emotional state:\n";
      response += "• Incorporate 15-30 minutes of physical activity daily - even a short walk helps\n";
      response += "• Try mood-boosting foods rich in omega-3s and vitamin D\n";
      response += "• Schedule at least one enjoyable activity each day\n";
      response += "• Consider light therapy, especially during darker months\n\n";
    } else {
      response += "You're experiencing a lower mood. These strategies may help lift your spirits:\n";
      response += "• Reach out to a trusted friend, family member, or professional for support\n";
      response += "• Break tasks into smaller, more manageable steps\n";
      response += "• Practice self-compassion and avoid self-criticism\n";
      response += "• Limit exposure to negative news and social media\n";
      response += "• Consider speaking with a healthcare provider if your low mood persists\n\n";
    }
  }
  
  // Anxiety recommendations
  if (anxietyScore !== null) {
    response += "ANXIETY MANAGEMENT\n";
    if (anxietyScore <= 3) {
      response += "Your anxiety levels are low, which is excellent. To maintain this state:\n";
      response += "• Continue any mindfulness or meditation practices you've established\n";
      response += "• Maintain healthy boundaries in work and personal relationships\n";
      response += "• Stay aware of early signs of stress so you can address them proactively\n\n";
    } else if (anxietyScore <= 6) {
      response += "You're experiencing moderate anxiety. These strategies may help reduce your anxiety:\n";
      response += "• Practice deep breathing: inhale for 4 counts, hold for 4, exhale for 6\n";
      response += "• Try the 5-4-3-2-1 grounding technique when feeling anxious\n";
      response += "• Limit caffeine and alcohol which can amplify anxiety\n";
      response += "• Schedule 'worry time' - a specific 15-minute period to address concerns\n\n";
    } else {
      response += "You're experiencing higher levels of anxiety. These approaches may help provide relief:\n";
      response += "• Try progressive muscle relaxation to release physical tension\n";
      response += "• Use a thought record to identify and challenge anxious thoughts\n";
      response += "• Prioritize activities that soothe your nervous system\n";
      response += "• Consider seeking support from a mental health professional\n";
      response += "• If available to you, explore anxiety-reducing apps like Calm or Headspace\n\n";
    }
  }
  
  // Sleep recommendations
  if (sleepScore !== null) {
    response += "SLEEP OPTIMIZATION\n";
    if (sleepScore >= 7) {
      response += "Your sleep quality is good. To maintain healthy sleep:\n";
      response += "• Continue with your existing sleep routine\n";
      response += "• Maintain a consistent sleep-wake schedule, even on weekends\n";
      response += "• Limit blue light exposure from devices in the evening\n\n";
    } else if (sleepScore >= 4) {
      response += "Your sleep quality is moderate. To improve your rest:\n";
      response += "• Establish a calming pre-sleep routine (e.g., reading, gentle stretching)\n";
      response += "• Keep your bedroom cool, dark, and quiet\n";
      response += "• Avoid large meals, caffeine, and alcohol before bedtime\n";
      response += "• Try a sleep meditation or white noise if you have trouble falling asleep\n\n";
    } else {
      response += "You're experiencing poor sleep quality. These strategies may help improve your sleep:\n";
      response += "• Prioritize sleep hygiene - consistent bedtime, comfortable environment\n";
      response += "• Avoid screen time for at least 1 hour before bed\n";
      response += "• Try relaxation techniques like progressive muscle relaxation or guided imagery\n";
      response += "• Consider speaking with a healthcare provider if sleep issues persist\n";
      response += "• Limit daytime naps to 20-30 minutes before 3pm\n\n";
    }
  }
  
  // Energy recommendations
  if (energyScore !== null) {
    response += "ENERGY ENHANCEMENT\n";
    if (energyScore >= 7) {
      response += "Your energy levels are good. To maintain this vitality:\n";
      response += "• Continue balancing activity with adequate rest periods\n";
      response += "• Stay hydrated and maintain nutritious eating habits\n";
      response += "• Protect your energy by setting appropriate boundaries\n\n";
    } else if (energyScore >= 4) {
      response += "You have moderate energy levels. To boost your vitality:\n";
      response += "• Incorporate brief movement breaks throughout your day\n";
      response += "• Stay hydrated - aim for at least 8 glasses of water daily\n";
      response += "• Consider foods with sustained energy release like whole grains and proteins\n";
      response += "• Try stress-reduction techniques to minimize energy depletion\n\n";
    } else {
      response += "You're experiencing lower energy levels. These approaches may help restore your vitality:\n";
      response += "• Check basic foundations: sleep quality, nutrition, hydration\n";
      response += "• Consider a B-vitamin complex, after consulting a healthcare provider\n";
      response += "• Practice energy management by prioritizing essential tasks\n";
      response += "• Include light to moderate exercise, which paradoxically increases energy\n";
      response += "• Consider speaking with a healthcare provider to rule out medical causes\n\n";
    }
  }
  
  // Focus recommendations
  if (focusScore !== null) {
    response += "FOCUS IMPROVEMENT\n";
    if (focusScore >= 7) {
      response += "Your focus and concentration levels are good. To maintain this clarity:\n";
      response += "• Continue prioritizing tasks and using any focus techniques that work for you\n";
      response += "• Take regular breaks to prevent mental fatigue (e.g., Pomodoro technique)\n";
      response += "• Protect focused work time by minimizing distractions\n\n";
    } else if (focusScore >= 4) {
      response += "You have moderate focus levels. To enhance your concentration:\n";
      response += "• Try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break\n";
      response += "• Minimize digital distractions by using app blockers or do-not-disturb mode\n";
      response += "• Practice single-tasking rather than multitasking\n";
      response += "• Use external aids like lists, reminders, and planners\n\n";
    } else {
      response += "You're experiencing difficulty with focus. These strategies may help improve concentration:\n";
      response += "• Break tasks into smaller, more manageable parts\n";
      response += "• Use external organization tools like lists and planners\n";
      response += "• Try attention training exercises like meditation or brain training apps\n";
      response += "• Ensure you're taking care of basic needs (sleep, nutrition, movement)\n";
      response += "• Consider a workspace audit to minimize distractions\n\n";
    }
  }
  
  // Meditation recommendation
  response += "MEDITATION PRACTICE\n";
  response += "Based on your current state, here's a recommended meditation practice:\n";
  
  if (anxietyScore !== null && anxietyScore > 6) {
    response += "• Type: Grounding meditation\n";
    response += "• Duration: 5-10 minutes\n";
    response += "• Focus: Body scan with emphasis on feeling your connection to the ground/chair\n";
    response += "• Frequency: 2-3 times daily when feeling anxious\n\n";
  } else if (moodScore !== null && moodScore < 4) {
    response += "• Type: Loving-kindness meditation\n";
    response += "• Duration: 10-15 minutes\n";
    response += "• Focus: Generating feelings of kindness toward yourself and others\n";
    response += "• Frequency: Daily, preferably in the morning\n\n";
  } else if (sleepScore !== null && sleepScore < 5) {
    response += "• Type: Bedtime wind-down meditation\n";
    response += "• Duration: 15-20 minutes\n";
    response += "• Focus: Progressive relaxation and breath awareness\n";
    response += "• Frequency: Every night before sleep\n\n";
  } else if (focusScore !== null && focusScore < 5) {
    response += "• Type: Focused attention meditation\n";
    response += "• Duration: 10 minutes\n";
    response += "• Focus: Concentration on breath or a visual point\n";
    response += "• Frequency: Before beginning tasks requiring concentration\n\n";
  } else {
    response += "• Type: Mindfulness meditation\n";
    response += "• Duration: 15-20 minutes\n";
    response += "• Focus: Open awareness of thoughts, feelings, and sensations\n";
    response += "• Frequency: Daily, at a consistent time\n\n";
  }
  
  // Journaling prompts
  response += "JOURNALING PROMPTS\n";
  response += "Consider exploring these journaling prompts to enhance self-awareness:\n";
  response += "• What brought me joy or a sense of accomplishment today?\n";
  response += "• What is one small step I can take tomorrow to improve my wellbeing?\n";
  response += "• What am I grateful for in this present moment?\n";
  response += "• What emotions am I experiencing, and what might they be telling me?\n\n";
  
  // Final note
  response += "DAILY PRACTICE\n";
  response += "Remember that mental wellness is built through consistent small actions. ";
  response += "Try to incorporate at least one recommendation from each category into your daily routine. ";
  response += "Track what works best for you and adjust as needed. Be patient and compassionate with yourself as you implement these changes.";
  
  return response;
} 