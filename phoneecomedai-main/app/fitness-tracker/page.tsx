"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  BarChart, 
  Calendar, 
  Camera, 
  Clock, 
  Dumbbell, 
  Flame, 
  Heart, 
  LineChart, 
  Plus, 
  RefreshCw, 
  Utensils, 
  Zap,
  ArrowRight,
  ChevronRight,
  MoreHorizontal,
  Play,
  Timer,
  Settings,
  Pause,
  RotateCcw,
  Bell,
  Award
} from "lucide-react";
import { useDrEcho } from "@/components/ai-assistant/dr-echo-context";
import { 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { generateFitnessResponse } from "@/lib/fitnessRecommendations";

export default function FitnessTrackerPage() {
  const { openAssistant, sendMessage } = useDrEcho();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [calorieGoal, setCalorieGoal] = useState(2200);
  const [caloriesBurned, setCaloriesBurned] = useState(1450);
  const [caloriesConsumed, setCaloriesConsumed] = useState(1850);
  const [waterIntake, setWaterIntake] = useState(5);
  const [waterGoal, setWaterGoal] = useState(8);
  const [stepCount, setStepCount] = useState(8742);
  const [stepGoal, setStepGoal] = useState(10000);
  const [activeMinutes, setActiveMinutes] = useState(42);
  const [activeMinutesGoal, setActiveMinutesGoal] = useState(60);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [weight, setWeight] = useState(165.5);
  const [weightGoal, setWeightGoal] = useState(160);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  
  // Add new state variables for Exercise Library
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [viewAllExercises, setViewAllExercises] = useState(false);
  
  // Add new state variables for enhanced timer
  const [timerMode, setTimerMode] = useState<"stopwatch" | "countdown" | "interval">("stopwatch");
  const [countdownTime, setCountdownTime] = useState(300); // 5 minutes in seconds
  const [intervalWork, setIntervalWork] = useState(30); // 30 seconds work
  const [intervalRest, setIntervalRest] = useState(10); // 10 seconds rest
  const [intervalRounds, setIntervalRounds] = useState(8); // 8 rounds
  const [currentRound, setCurrentRound] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [calorieRate, setCalorieRate] = useState(8); // calories burned per minute
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Sample data for charts
  const activityData = [
    { day: "Mon", steps: 9245, calories: 420, activeMinutes: 45 },
    { day: "Tue", steps: 7890, calories: 380, activeMinutes: 38 },
    { day: "Wed", steps: 10120, calories: 510, activeMinutes: 55 },
    { day: "Thu", steps: 8670, calories: 430, activeMinutes: 47 },
    { day: "Fri", steps: 7650, calories: 350, activeMinutes: 35 },
    { day: "Sat", steps: 11240, calories: 580, activeMinutes: 62 },
    { day: "Sun", steps: 8742, calories: 450, activeMinutes: 42 },
  ];
  
  const weightData = [
    { date: "Apr 1", weight: 172.5 },
    { date: "Apr 8", weight: 171.2 },
    { date: "Apr 15", weight: 169.8 },
    { date: "Apr 22", weight: 168.3 },
    { date: "Apr 29", weight: 167.1 },
    { date: "May 6", weight: 166.2 },
    { date: "May 13", weight: 165.5 },
  ];
  
  const workouts = [
    { id: 1, name: "Morning Run", type: "Cardio", duration: "30 min", calories: 320, date: "Today, 7:30 AM" },
    { id: 2, name: "Upper Body Strength", type: "Strength", duration: "45 min", calories: 280, date: "Yesterday, 6:15 PM" },
    { id: 3, name: "Yoga Flow", type: "Flexibility", duration: "60 min", calories: 220, date: "May 12, 8:00 AM" },
    { id: 4, name: "HIIT Session", type: "Cardio", duration: "25 min", calories: 310, date: "May 10, 5:30 PM" },
  ];
  
  const meals = [
    { id: 1, name: "Breakfast", time: "7:30 AM", calories: 450, protein: 25, carbs: 55, fat: 15 },
    { id: 2, name: "Lunch", time: "12:15 PM", calories: 680, protein: 35, carbs: 65, fat: 22 },
    { id: 3, name: "Snack", time: "3:30 PM", calories: 220, protein: 10, carbs: 25, fat: 8 },
    { id: 4, name: "Dinner", time: "7:00 PM", calories: 580, protein: 40, carbs: 45, fat: 18 },
  ];
  
  const exerciseLibrary = [
    { id: 1, name: "Push-ups", type: "Strength", muscle: "Chest", equipment: "None", difficulty: "Beginner", description: "A classic bodyweight exercise that strengthens the chest, shoulders, and triceps." },
    { id: 2, name: "Squats", type: "Strength", muscle: "Legs", equipment: "None", difficulty: "Beginner", description: "A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes." },
    { id: 3, name: "Plank", type: "Core", muscle: "Abs", equipment: "None", difficulty: "Beginner", description: "An isometric core exercise that strengthens the abdominals, back, and shoulders." },
    { id: 4, name: "Lunges", type: "Strength", muscle: "Legs", equipment: "None", difficulty: "Beginner", description: "A unilateral exercise that works the quadriceps, hamstrings, and glutes while improving balance." },
    { id: 5, name: "Bench Press", type: "Strength", muscle: "Chest", equipment: "Barbell", difficulty: "Intermediate", description: "A compound upper body exercise that targets the chest, shoulders, and triceps." },
    { id: 6, name: "Deadlift", type: "Strength", muscle: "Back", equipment: "Barbell", difficulty: "Advanced", description: "A compound exercise that works the entire posterior chain, including the back, glutes, and hamstrings." },
    { id: 7, name: "Pull-ups", type: "Strength", muscle: "Back", equipment: "Pull-up Bar", difficulty: "Intermediate", description: "An upper body exercise that strengthens the back, biceps, and shoulders." },
    { id: 8, name: "Shoulder Press", type: "Strength", muscle: "Shoulders", equipment: "Dumbbells", difficulty: "Intermediate", description: "An overhead pressing movement that targets the deltoids and triceps." },
    { id: 9, name: "Bicep Curls", type: "Strength", muscle: "Arms", equipment: "Dumbbells", difficulty: "Beginner", description: "An isolation exercise that targets the biceps muscles." },
    { id: 10, name: "Tricep Dips", type: "Strength", muscle: "Arms", equipment: "Parallel Bars", difficulty: "Intermediate", description: "An exercise that targets the triceps, chest, and shoulders." },
    { id: 11, name: "Running", type: "Cardio", muscle: "Full Body", equipment: "None", difficulty: "Beginner", description: "A cardiovascular exercise that improves endurance and burns calories." },
    { id: 12, name: "Cycling", type: "Cardio", muscle: "Legs", equipment: "Bicycle", difficulty: "Beginner", description: "A low-impact cardio exercise that targets the lower body." },
    { id: 13, name: "Jump Rope", type: "Cardio", muscle: "Full Body", equipment: "Jump Rope", difficulty: "Beginner", description: "A high-intensity cardio exercise that improves coordination and burns calories." },
    { id: 14, name: "Burpees", type: "HIIT", muscle: "Full Body", equipment: "None", difficulty: "Intermediate", description: "A full-body exercise that combines a squat, push-up, and jump." },
    { id: 15, name: "Mountain Climbers", type: "HIIT", muscle: "Full Body", equipment: "None", difficulty: "Intermediate", description: "A dynamic exercise that works the core, shoulders, and legs while elevating heart rate." },
    { id: 16, name: "Yoga", type: "Flexibility", muscle: "Full Body", equipment: "Yoga Mat", difficulty: "Beginner", description: "A practice that combines physical postures, breathing techniques, and meditation." },
    { id: 17, name: "Pilates", type: "Core", muscle: "Abs", equipment: "Mat", difficulty: "Beginner", description: "A low-impact exercise method that focuses on core strength, posture, and flexibility." },
    { id: 18, name: "Russian Twists", type: "Core", muscle: "Abs", equipment: "Dumbbell", difficulty: "Beginner", description: "A rotational exercise that targets the obliques and abdominal muscles." },
    { id: 19, name: "Leg Raises", type: "Core", muscle: "Abs", equipment: "None", difficulty: "Beginner", description: "A lower abdominal exercise performed by raising the legs while lying on the back." },
    { id: 20, name: "Box Jumps", type: "HIIT", muscle: "Legs", equipment: "Box", difficulty: "Intermediate", description: "A plyometric exercise that develops explosive power in the lower body." }
  ];

  // Initialize filtered exercises after exerciseLibrary is defined
  const [filteredExercises, setFilteredExercises] = useState<typeof exerciseLibrary>(exerciseLibrary);

  const handleAIRecommendations = () => {
    // Prepare the message for the AI assistant
    const fitnessMessage = `
Based on my fitness data:
- Current weight: ${weight} lbs (goal: ${weightGoal} lbs)
- Daily steps: ${stepCount} (goal: ${stepGoal})
- Active minutes: ${activeMinutes} (goal: ${activeMinutesGoal})
- Sleep: ${sleepHours} hours (goal: ${sleepGoal} hours)
- Calories consumed today: ${caloriesConsumed} (goal: ${calorieGoal})
- Calories burned today: ${caloriesBurned}

Could you provide personalized fitness and nutrition recommendations to help me reach my goals?
`;
    
    // Open the assistant first
    openAssistant();
    
    // Then send the message directly using the provider's sendMessage function
    // This bypasses the DOM manipulation which could be causing issues
    setTimeout(() => {
      sendMessage(fitnessMessage);
    }, 300);
  };

  // Calculate calories burned during exercise
  const caloriesBurnedDuringExercise = Math.round((exerciseTime / 60) * calorieRate);

  // Enhanced useEffect for timer with different modes
  useEffect(() => {
    let intervalId = 0;
    
    if (isExerciseActive) {
      if (timerMode === "stopwatch") {
        // Simple stopwatch mode
        intervalId = window.setInterval(() => {
          setExerciseTime(prevTime => prevTime + 1);
        }, 1000);
      } 
      else if (timerMode === "countdown") {
        // Countdown timer mode
        intervalId = window.setInterval(() => {
          setExerciseTime(prevTime => {
            if (prevTime <= 1) {
              // Timer completed
              window.clearInterval(intervalId);
              setIsExerciseActive(false);
              setTimerCompleted(true);
              playSound();
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
      else if (timerMode === "interval") {
        // Interval training mode
        intervalId = window.setInterval(() => {
          setExerciseTime(prevTime => {
            // If in work period
            if (!isResting) {
              if (prevTime <= 1) {
                // Work period completed, switch to rest
                setIsResting(true);
                playSound();
                return intervalRest;
              }
              return prevTime - 1;
            } 
            // If in rest period
            else {
              if (prevTime <= 1) {
                // Rest period completed
                if (currentRound >= intervalRounds) {
                  // All rounds completed
                  window.clearInterval(intervalId);
                  setIsExerciseActive(false);
                  setTimerCompleted(true);
                  playSound();
                  return 0;
                }
                // Move to next round
                setCurrentRound(prev => prev + 1);
                setIsResting(false);
                playSound();
                return intervalWork;
              }
              return prevTime - 1;
            }
          });
        }, 1000);
      }
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isExerciseActive, timerMode, isResting, currentRound, intervalRounds, intervalWork, intervalRest]);
  
  // Play sound effect
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };
  
  // Start timer with selected mode
  const startTimer = () => {
    if (timerMode === "stopwatch") {
      // Stopwatch continues from current time
      setIsExerciseActive(true);
    } 
    else if (timerMode === "countdown") {
      // Countdown starts from the set time
      if (!isExerciseActive && exerciseTime === 0) {
        setExerciseTime(countdownTime);
      }
      setIsExerciseActive(true);
    }
    else if (timerMode === "interval") {
      // Interval training starts with work period
      if (!isExerciseActive && exerciseTime === 0) {
        setExerciseTime(intervalWork);
        setCurrentRound(1);
        setIsResting(false);
      }
      setIsExerciseActive(true);
    }
    setTimerCompleted(false);
  };
  
  // Reset timer based on mode
  const resetTimer = () => {
    setIsExerciseActive(false);
    setExerciseTime(0);
    setCurrentRound(1);
    setIsResting(false);
    setTimerCompleted(false);
  };
  
  // Save completed workout
  const saveWorkout = () => {
    const newWorkout = {
      id: workouts.length + 1,
      name: timerMode === "interval" ? "Interval Training" : "Timed Workout",
      type: "Cardio",
      duration: formatTime(timerMode === "stopwatch" ? exerciseTime : 
                          timerMode === "countdown" ? countdownTime - exerciseTime : 
                          intervalRounds * (intervalWork + intervalRest) - exerciseTime),
      calories: caloriesBurnedDuringExercise,
      date: "Today, " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    };
    
    // Show achievement
    setTimerCompleted(true);
  };
  
  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fix the formatter function with proper typing
  const valueFormatter = (value: number): string[] => {
    return [`${value} lbs`];
  };

  // Handle exercise category selection
  const handleCategorySelect = (category: string) => {
    // If clicking the same category again, toggle it off
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setFilteredExercises(exerciseLibrary);
    } else {
      setSelectedCategory(category);
      let filtered: typeof exerciseLibrary = [];
      
      if (category === "Strength") {
        filtered = exerciseLibrary.filter(ex => ex.type === "Strength");
      } else if (category === "Cardio") {
        filtered = exerciseLibrary.filter(ex => ex.type === "Cardio");
      } else if (category === "Flexibility") {
        filtered = exerciseLibrary.filter(ex => 
          ex.type === "Flexibility" || ex.type === "Core"
        );
      } else if (category === "HIIT") {
        filtered = exerciseLibrary.filter(ex => 
          ex.type === "HIIT" || (ex.type === "Cardio" && ex.difficulty !== "Beginner")
        );
      }
      
      setFilteredExercises(filtered);
    }
    
    setViewAllExercises(true);
    setSelectedExercise(null);
    setShowExerciseDetails(false);
  };

  // Handle exercise selection for detailed view
  const handleExerciseSelect = (exercise: any) => {
    setSelectedExercise(exercise);
    setShowExerciseDetails(true);
  };

  // Close exercise details view
  const closeExerciseDetails = () => {
    setShowExerciseDetails(false);
  };

  // Toggle view all exercises
  const toggleViewAllExercises = () => {
    if (!viewAllExercises) {
      // If we're going to view all, show filtered by category or all exercises
      if (selectedCategory) {
        // We already have filtered exercises based on category
      } else {
        setFilteredExercises(exerciseLibrary);
      }
    } else {
      // Going back to popular view
      setSelectedCategory(null);
    }
    setViewAllExercises(!viewAllExercises);
    setSelectedExercise(null);
    setShowExerciseDetails(false);
  };

  // Add exercise to workout
  const addExerciseToWorkout = (exercise: any) => {
    // This would typically add the exercise to a workout plan
    // For now, we'll just show a notification
    const message = `Added ${exercise.name} to your workout plan!`;
    
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg z-50 flex items-center';
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      ${message}
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Fitness Tracker</h1>
            <p className="text-muted-foreground mt-1">Monitor your health and fitness progress</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Data
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Log Activity
            </Button>
          </div>
        </div>
      </motion.div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            Workouts
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-1">
            <Utensils className="h-4 w-4" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1">
            <LineChart className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Today's Activity</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-1">
                      This Week <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Steps</p>
                              <p className="text-xl font-bold">{stepCount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Goal</p>
                            <p className="text-sm font-medium">{stepGoal.toLocaleString()}</p>
                          </div>
                        </div>
                        <Progress value={(stepCount / stepGoal) * 100} className="h-2 mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                              <Flame className="h-4 w-4 text-chart-2" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Calories</p>
                              <p className="text-xl font-bold">{caloriesBurned}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Consumed</p>
                            <p className="text-sm font-medium">{caloriesConsumed}</p>
                          </div>
                        </div>
                        <Progress 
                          value={(caloriesBurned / calorieGoal) * 100} 
                          className="h-2 mt-2" 
                          indicatorClassName="bg-chart-2" 
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-chart-3" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Active Time</p>
                              <p className="text-xl font-bold">{activeMinutes} min</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Goal</p>
                            <p className="text-sm font-medium">{activeMinutesGoal} min</p>
                          </div>
                        </div>
                        <Progress value={(activeMinutes / activeMinutesGoal) * 100} className="h-2 mt-2" indicatorClassName="bg-chart-3" />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={activityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <RechartsTooltip 
                          content={(props) => {
                            const { active, payload } = props;
                            if (active && payload && payload.length > 0 && payload[0]?.payload?.day) {
                              const day = payload[0].payload.day;
                              const steps = payload[0].value;
                              const calories = payload[1]?.value || 0;
                              const activeMinutes = payload[2]?.value || 0;
                              
                              return (
                                <div className="bg-background border border-border p-2 rounded-md shadow-md">
                                  <p className="font-medium">{day}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Steps: {typeof steps === 'number' ? steps.toLocaleString() : steps}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Calories: {calories}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Active Minutes: {activeMinutes}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="steps" name="Steps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="calories" name="Calories Burned" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="activeMinutes" name="Active Minutes" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Workouts</CardTitle>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setActiveTab("workouts")}>
                        View All <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workouts.slice(0, 3).map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              workout.type === "Cardio" ? "bg-primary/10" : 
                              workout.type === "Strength" ? "bg-chart-2/10" : 
                              "bg-chart-3/10"
                            }`}>
                              {workout.type === "Cardio" ? (
                                <Heart className="h-5 w-5 text-primary" />
                              ) : workout.type === "Strength" ? (
                                <Dumbbell className="h-5 w-5 text-chart-2" />
                              ) : (
                                <Activity className="h-5 w-5 text-chart-3" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{workout.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{workout.duration}</span>
                                <span className="mx-1">•</span>
                                <Flame className="h-3 w-3 mr-1" />
                                <span>{workout.calories} cal</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{workout.date}</p>
                        </div>
                      ))}
                      
                      <Button className="w-full" onClick={() => setActiveTab("workouts")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Log Workout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Nutrition Today</CardTitle>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setActiveTab("nutrition")}>
                        View All <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Utensils className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Calories</p>
                            <p className="text-xl font-bold">{caloriesConsumed} / {calorieGoal}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Remaining</p>
                          <p className="text-sm font-medium">{calorieGoal - caloriesConsumed}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted rounded-lg p-2 text-center">
                          <p className="text-xs text-muted-foreground">Protein</p>
                          <p className="text-sm font-medium">110g</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2 text-center">
                          <p className="text-xs text-muted-foreground">Carbs</p>
                          <p className="text-sm font-medium">190g</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2 text-center">
                          <p className="text-xs text-muted-foreground">Fat</p>
                          <p className="text-sm font-medium">63g</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                            <div className="text-xs font-medium text-chart-2">H₂O</div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Water</p>
                            <p className="text-xl font-bold">{waterIntake} / {waterGoal} cups</p>
                          </div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: waterGoal }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-6 w-6 ${i < waterIntake ? "text-chart-2" : "text-muted"}`}
                              onClick={() => setWaterIntake(i + 1)}
                            >
                              💧
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button className="w-full" onClick={() => setActiveTab("nutrition")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Log Meal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Fitness Coach</CardTitle>
                  <CardDescription>
                    Get personalized recommendations based on your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Personalized Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered recommendations based on your activity and goals
                      </p>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={handleAIRecommendations}>
                    Get AI Recommendations
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Weight Tracker</CardTitle>
                  <CardDescription>
                    Monitor your weight progress over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold">{weight} lbs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Goal</p>
                      <p className="text-xl font-medium">{weightGoal} lbs</p>
                    </div>
                  </div>
                  
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={weightData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis domain={[155, 175]} stroke="hsl(var(--muted-foreground))" />
                        <RechartsTooltip 
                          content={(props) => {
                            const { active, payload } = props;
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background border border-border p-2 rounded-md shadow-md">
                                  <p className="font-medium">{payload[0].payload.date}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Weight: {payload[0].value} lbs
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={weight} 
                      onChange={(e) => setWeight(parseFloat(e.target.value))} 
                      step="0.1"
                      className="w-24"
                    />
                    <span>lbs</span>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sleep Tracker</CardTitle>
                  <CardDescription>
                    Monitor your sleep quality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Last Night</p>
                      <p className="text-2xl font-bold">{sleepHours} hrs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Goal</p>
                      <p className="text-xl font-medium">{sleepGoal} hrs</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sleep Quality</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Bedtime</p>
                      <p className="text-sm font-medium">11:30 PM</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Wake Up</p>
                      <p className="text-sm font-medium">7:00 AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="workouts">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Log Workout</CardTitle>
                  <CardDescription>
                    Record your workout details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workout-type">Workout Type</Label>
                      <Select defaultValue="cardio">
                        <SelectTrigger id="workout-type">
                          <SelectValue placeholder="Select workout type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="strength">Strength Training</SelectItem>
                          <SelectItem value="flexibility">Flexibility</SelectItem>
                          <SelectItem value="hiit">HIIT</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workout-name">Workout Name</Label>
                      <Input id="workout-name" placeholder="e.g., Morning Run" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workout-duration">Duration (minutes)</Label>
                      <Input id="workout-duration" type="number" min="1" defaultValue="30" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workout-calories">Calories Burned (estimated)</Label>
                      <Input id="workout-calories" type="number" min="0" defaultValue="250" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Intensity Level</Label>
                    <div className="flex items-center space-x-2">
                      <Slider defaultValue={[65]} max={100} step={5} className="flex-1" />
                      <span className="w-12 text-center font-medium">65%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <textarea 
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Add notes about your workout..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Workout</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-primary" />
                        Exercise Timer
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        Track your workout time
                        {timerMode === "interval" && (
                          <Badge variant="outline" className="ml-2">
                            Round {currentRound}/{intervalRounds} • {isResting ? "Rest" : "Work"}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setShowTimerSettings(true)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Timer Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="relative h-48 w-48">
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div 
                          className="text-4xl font-bold"
                          key={exerciseTime} // Re-animate when time changes
                          initial={{ scale: 0.9, opacity: 0.7 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {formatTime(exerciseTime)}
                        </motion.div>
                        
                        {timerMode !== "stopwatch" && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {timerMode === "countdown" 
                              ? `${Math.floor((exerciseTime / countdownTime) * 100)}% remaining` 
                              : isResting 
                                ? `Rest: ${formatTime(exerciseTime)}` 
                                : `Work: ${formatTime(exerciseTime)}`
                            }
                          </div>
                        )}
                        
                        {timerMode === "stopwatch" && (
                          <div className="text-sm text-muted-foreground mt-1">
                            ~{caloriesBurnedDuringExercise} calories
                          </div>
                        )}
                      </div>
                      
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="8"
                        />
                        
                        {/* Progress circle for stopwatch */}
                        {timerMode === "stopwatch" && isExerciseActive && (
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="8"
                            strokeDasharray="283"
                            initial={{ strokeDashoffset: 283 }}
                            animate={{ 
                              strokeDashoffset: 283 - ((exerciseTime % 60) / 60) * 283 
                            }}
                            transition={{ duration: 0.5 }}
                            strokeLinecap="round"
                          />
                        )}
                        
                        {/* Progress circle for countdown */}
                        {timerMode === "countdown" && (
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="8"
                            strokeDasharray="283"
                            initial={{ strokeDashoffset: 0 }}
                            animate={{ 
                              strokeDashoffset: 283 - ((exerciseTime / countdownTime) * 283) 
                            }}
                            transition={{ duration: 0.5 }}
                            strokeLinecap="round"
                          />
                        )}
                        
                        {/* Progress circle for interval training */}
                        {timerMode === "interval" && (
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={isResting ? "hsl(var(--chart-3))" : "hsl(var(--chart-2))"}
                            strokeWidth="8"
                            strokeDasharray="283"
                            initial={{ strokeDashoffset: 0 }}
                            animate={{ 
                              strokeDashoffset: 283 - ((exerciseTime / (isResting ? intervalRest : intervalWork)) * 283) 
                            }}
                            transition={{ duration: 0.5 }}
                            strokeLinecap="round"
                          />
                        )}
                        
                        {/* Pulsing effect when timer is active */}
                        {isExerciseActive && (
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="48"
                            fill="none"
                            stroke="hsl(var(--primary)/30)"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0.8, 1.1, 0.8],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "loop"
                            }}
                          />
                        )}
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-center space-x-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-12 w-12 rounded-full"
                              onClick={resetTimer}
                              disabled={isExerciseActive && timerMode !== "stopwatch"}
                            >
                              <RotateCcw className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reset Timer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Button 
                        size="icon"
                        className={`h-14 w-14 rounded-full ${isExerciseActive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                        onClick={isExerciseActive ? () => setIsExerciseActive(false) : startTimer}
                      >
                        <motion.div
                          animate={{ scale: isExerciseActive ? [1, 1.1, 1] : 1 }}
                          transition={{ duration: 1, repeat: isExerciseActive ? Infinity : 0 }}
                        >
                          {isExerciseActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                        </motion.div>
                      </Button>
                    </div>
                    
                    <div className="flex justify-center space-x-2">
                      <Button 
                        variant={timerMode === "stopwatch" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => {
                          setTimerMode("stopwatch");
                          resetTimer();
                        }}
                        className="flex-1"
                      >
                        Stopwatch
                      </Button>
                      <Button 
                        variant={timerMode === "countdown" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => {
                          setTimerMode("countdown");
                          resetTimer();
                        }}
                        className="flex-1"
                      >
                        Countdown
                      </Button>
                      <Button 
                        variant={timerMode === "interval" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => {
                          setTimerMode("interval");
                          resetTimer();
                        }}
                        className="flex-1"
                      >
                        Intervals
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workout History</CardTitle>
                  <CardDescription>
                    Your recent workouts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          workout.type === "Cardio" ? "bg-primary/10" : 
                          workout.type === "Strength" ? "bg-chart-2/10" : 
                          "bg-chart-3/10"
                        }`}>
                          {workout.type === "Cardio" ? (
                            <Heart className="h-5 w-5 text-primary" />
                          ) : workout.type === "Strength" ? (
                            <Dumbbell className="h-5 w-5 text-chart-2" />
                          ) : (
                            <Activity className="h-5 w-5 text-chart-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{workout.duration}</span>
                            <span className="mx-1">•</span>
                            <Flame className="h-3 w-3 mr-1" />
                            <span>{workout.calories} cal</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{workout.date}</p>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    View All History
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Library</CardTitle>
                  <CardDescription>
                    Browse exercises by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant={selectedCategory === "Strength" ? "default" : "outline"} 
                        className="justify-start w-full"
                        onClick={() => handleCategorySelect("Strength")}
                      >
                        <Dumbbell className="mr-2 h-4 w-4" />
                        Strength
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant={selectedCategory === "Cardio" ? "default" : "outline"} 
                        className="justify-start w-full"
                        onClick={() => handleCategorySelect("Cardio")}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Cardio
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant={selectedCategory === "Flexibility" ? "default" : "outline"} 
                        className="justify-start w-full"
                        onClick={() => handleCategorySelect("Flexibility")}
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        Flexibility
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant={selectedCategory === "HIIT" ? "default" : "outline"} 
                        className="justify-start w-full"
                        onClick={() => handleCategorySelect("HIIT")}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        HIIT
                      </Button>
                    </motion.div>
                  </div>
                  
                  {!viewAllExercises && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Popular Exercises</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1"
                          onClick={toggleViewAllExercises}
                        >
                          View All <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {exerciseLibrary.slice(0, 4).map((exercise) => (
                          <motion.div 
                            key={exercise.id} 
                            className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                            whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--accent))" }}
                            onClick={() => handleExerciseSelect(exercise)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: exercise.id * 0.05 }}
                          >
                            <div>
                              <p className="font-medium">{exercise.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{exercise.type}</span>
                                <span className="mx-1">•</span>
                                <span>{exercise.muscle}</span>
                              </div>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addExerciseToWorkout(exercise);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add to workout</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {viewAllExercises && (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">
                            {selectedCategory ? `${selectedCategory} Exercises` : "All Exercises"}
                          </h3>
                          <Badge variant="outline" className="bg-primary/10">
                            {filteredExercises.length} exercises
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={toggleViewAllExercises}
                        >
                          Back
                        </Button>
                      </div>
                      
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                        {filteredExercises.map((exercise) => (
                          <motion.div 
                            key={exercise.id} 
                            className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                            whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--accent))" }}
                            onClick={() => handleExerciseSelect(exercise)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: exercise.id * 0.02 }}
                          >
                            <div>
                              <p className="font-medium">{exercise.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{exercise.type}</span>
                                <span className="mx-1">•</span>
                                <span>{exercise.muscle}</span>
                                <span className="mx-1">•</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    exercise.difficulty === "Beginner" ? "bg-green-500/10 text-green-500" : 
                                    exercise.difficulty === "Intermediate" ? "bg-yellow-500/10 text-yellow-500" : 
                                    "bg-red-500/10 text-red-500"
                                  }`}
                                >
                                  {exercise.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addExerciseToWorkout(exercise);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add to workout</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
              
              {/* Exercise Details Dialog */}
              <Dialog open={showExerciseDetails} onOpenChange={setShowExerciseDetails}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{selectedExercise?.name}</DialogTitle>
                    <DialogDescription>
                      Detailed information about this exercise
                    </DialogDescription>
                  </DialogHeader>
                  
                  {selectedExercise && (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Type</p>
                          <Badge variant="outline" className="bg-primary/10">{selectedExercise.type}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Muscle Group</p>
                          <Badge variant="outline" className="bg-primary/10">{selectedExercise.muscle}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Equipment</p>
                          <Badge variant="outline" className="bg-primary/10">{selectedExercise.equipment}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Difficulty</p>
                          <Badge 
                            variant="outline" 
                            className={`${
                              selectedExercise.difficulty === "Beginner" ? "bg-green-500/10 text-green-500" : 
                              selectedExercise.difficulty === "Intermediate" ? "bg-yellow-500/10 text-yellow-500" : 
                              "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {selectedExercise.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedExercise.description || `${selectedExercise.name} is a ${selectedExercise.difficulty.toLowerCase()} level ${selectedExercise.type.toLowerCase()} exercise that targets the ${selectedExercise.muscle.toLowerCase()} muscles.
                          ${selectedExercise.equipment !== "None" ? ` This exercise requires ${selectedExercise.equipment.toLowerCase()}.` : ''}`}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommended</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-primary/10">
                            {selectedExercise.difficulty === "Beginner" ? "3 sets" : 
                             selectedExercise.difficulty === "Intermediate" ? "4 sets" : "5 sets"}
                          </Badge>
                          <Badge className="bg-primary/10">
                            {selectedExercise.difficulty === "Beginner" ? "10-12 reps" : 
                             selectedExercise.difficulty === "Intermediate" ? "8-10 reps" : "6-8 reps"}
                          </Badge>
                          <Badge className="bg-primary/10">
                            {selectedExercise.difficulty === "Beginner" ? "60 sec rest" : 
                             selectedExercise.difficulty === "Intermediate" ? "90 sec rest" : "120 sec rest"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Tips</p>
                        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          <li>Maintain proper form throughout the exercise</li>
                          <li>Focus on controlled movements rather than speed</li>
                          <li>Breathe properly during each repetition</li>
                          {selectedExercise.type === "Strength" && <li>Increase weight gradually as you get stronger</li>}
                          {selectedExercise.type === "Cardio" && <li>Start with a warm-up and end with a cool-down</li>}
                          {selectedExercise.type === "Flexibility" && <li>Hold each stretch for 15-30 seconds</li>}
                          {selectedExercise.type === "HIIT" && <li>Push yourself during work intervals, recover during rest</li>}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                  
                  <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={closeExerciseDetails}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      addExerciseToWorkout(selectedExercise);
                      closeExerciseDetails();
                    }}>
                      Add to Workout
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Summary</CardTitle>
                  <CardDescription>
                    Your daily nutrition overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <Flame className="h-6 w-6 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">Calories</p>
                          <p className="text-xl font-bold">{caloriesConsumed}</p>
                          <p className="text-xs text-muted-foreground">of {calorieGoal} goal</p>
                          <Progress value={(caloriesConsumed / calorieGoal) * 100} className="h-2 mt-2 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center mb-2">
                            <div className="text-sm font-bold text-chart-2">P</div>
                          </div>
                          <p className="text-sm text-muted-foreground">Protein</p>
                          <p className="text-xl font-bold">110g</p>
                          <p className="text-xs text-muted-foreground">of 120g goal</p>
                          <Progress value={(110 / 120) * 100} className="h-2 mt-2 w-full" indicatorClassName="bg-chart-2" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center mb-2">
                            <div className="text-sm font-bold text-chart-3">C</div>
                          </div>
                          <p className="text-sm text-muted-foreground">Carbs</p>
                          <p className="text-xl font-bold">190g</p>
                          <p className="text-xs text-muted-foreground">of 220g goal</p>
                          <Progress value={(190 / 220) * 100} className="h-2 mt-2 w-full" indicatorClassName="bg-chart-3" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-full bg-chart-4/10 flex items-center justify-center mb-2">
                            <div className="text-sm font-bold text-chart-4">F</div>
                          </div>
                          <p className="text-sm text-muted-foreground">Fat</p>
                          <p className="text-xl font-bold">63g</p>
                          <p className="text-xs text-muted-foreground">of 70g goal</p>
                          <Progress value={(63 / 70) * 100} className="h-2 mt-2 w-full" indicatorClassName="bg-chart-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[
                          { name: "Breakfast", calories: 450, protein: 25, carbs: 55, fat: 15 },
                          { name: "Lunch", calories: 680, protein: 35, carbs: 65, fat: 22 },
                          { name: "Snack", calories: 220, protein: 10, carbs: 25, fat: 8 },
                          { name: "Dinner", calories: 580, protein: 40, carbs: 45, fat: 18 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="calories" name="Calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="protein" name="Protein (g)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="carbs" name="Carbs (g)" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="fat" name="Fat (g)" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Log Meal</CardTitle>
                  <CardDescription>
                    Record your food intake
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meal-type">Meal Type</Label>
                      <Select defaultValue="breakfast">
                        <SelectTrigger id="meal-type">
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="food-name">Food Name</Label>
                      <Input id="food-name" placeholder="e.g., Grilled Chicken Salad" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="food-calories">Calories</Label>
                      <Input id="food-calories" type="number" min="0" defaultValue="350" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="food-protein">Protein (g)</Label>
                      <Input id="food-protein" type="number" min="0" defaultValue="25" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="food-carbs">Carbs (g)</Label>
                      <Input id="food-carbs" type="number" min="0" defaultValue="30" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="food-fat">Fat (g)</Label>
                      <Input id="food-fat" type="number" min="0" defaultValue="15" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="favorite-food" />
                    <Label htmlFor="favorite-food">Save to favorites for quick logging</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Meal</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Meals</CardTitle>
                  <CardDescription>
                    Your food intake for today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meals.map((meal) => (
                    <div key={meal.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{meal.name}</h3>
                        <p className="text-xs text-muted-foreground">{meal.time}</p>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Flame className="h-3 w-3 mr-1" />
                        <span>{meal.calories} cal</span>
                        <span className="mx-1">•</span>
                        <span>P: {meal.protein}g</span>
                        <span className="mx-1">•</span>
                        <span>C: {meal.carbs}g</span>
                        <span className="mx-1">•</span>
                        <span>F: {meal.fat}g</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          Duplicate
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meal
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Water Intake</CardTitle>
                  <CardDescription>
                    Track your hydration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold">{waterIntake} cups</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Goal</p>
                      <p className="text-xl font-medium">{waterGoal} cups</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: waterGoal }).map((_, i) => (
                      <button
                        key={i}
                        className={`h-10 flex items-center justify-center rounded-md ${
                          i < waterIntake ? "bg-chart-2/20 text-chart-2" : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => setWaterIntake(i + 1)}
                      >
                        💧
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}>
                      -1 Cup
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setWaterIntake(Math.min(waterGoal, waterIntake + 1))}>
                      +1 Cup
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Utensils className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Protein Timing</h4>
                        <p className="text-sm text-muted-foreground">
                          Consume protein within 30 minutes after your workout to maximize muscle recovery.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                        <Utensils className="h-4 w-4 text-chart-2" />
                      </div>
                      <div>
                        <h4 className="font-medium">Hydration</h4>
                        <p className="text-sm text-muted-foreground">
                          Drink water consistently throughout the day rather than large amounts at once.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                        <Utensils className="h-4 w-4 text-chart-3" />
                      </div>
                      <div>
                        <h4 className="font-medium">Pre-Workout Nutrition</h4>
                        <p className="text-sm text-muted-foreground">
                          Eat a balanced meal with carbs and protein 2-3 hours before exercise for optimal energy.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full" onClick={handleAIRecommendations}>
                    Get Personalized Tips
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="progress">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Progress Overview</CardTitle>
                    <Select defaultValue="month">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">3 Months</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={[
                          { date: "Week 1", weight: 172.5, steps: 8200, calories: 2100 },
                          { date: "Week 2", weight: 171.2, steps: 8500, calories: 2050 },
                          { date: "Week 3", weight: 169.8, steps: 9100, calories: 2000 },
                          { date: "Week 4", weight: 168.3, steps: 9300, calories: 1950 },
                          { date: "Week 5", weight: 167.1, steps: 9500, calories: 1900 },
                          { date: "Week 6", weight: 166.2, steps: 9800, calories: 1850 },
                          { date: "Week 7", weight: 165.5, steps: 10000, calories: 1800 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="weight" 
                          name="Weight (lbs)"
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="steps" 
                          name="Avg. Daily Steps"
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Body Measurements</CardTitle>
                    <CardDescription>
                      Track your body composition
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <div className="flex items-center">
                          <Input value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="mr-2" />
                          <span>lbs</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Body Fat %</Label>
                        <div className="flex items-center">
                          <Input defaultValue="18.5" className="mr-2" />
                          <span>%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Chest</Label>
                        <div className="flex items-center">
                          <Input defaultValue="42" className="mr-2" />
                          <span>in</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Waist</Label>
                        <div className="flex items-center">
                          <Input defaultValue="34" className="mr-2" />
                          <span>in</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Hips</Label>
                        <div className="flex items-center">
                          <Input defaultValue="38" className="mr-2" />
                          <span>in</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Thighs</Label>
                        <div className="flex items-center">
                          <Input defaultValue="22" className="mr-2" />
                          <span>in</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      Save Measurements
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Photos</CardTitle>
                    <CardDescription>
                      Visually track your transformation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Front</span>
                      <span className="text-muted-foreground">Side</span>
                      <span className="text-muted-foreground">Back</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" />
                    </div>
                    
                    <Button className="w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      Add New Photos
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Goal Progress</CardTitle>
                  <CardDescription>
                    Track your fitness goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Weight Goal</Label>
                        <span className="text-sm font-medium">{weight} / {weightGoal} lbs</span>
                      </div>
                      <Progress value={((weight - 175) / (weightGoal - 175)) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {(weight - weightGoal).toFixed(1)} lbs to go
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Daily Steps</Label>
                        <span className="text-sm font-medium">{stepCount} / {stepGoal}</span>
                      </div>
                      <Progress value={(stepCount / stepGoal) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {stepGoal - stepCount} steps to go today
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Weekly Workouts</Label>
                        <span className="text-sm font-medium">3 / 5</span>
                      </div>
                      <Progress value={60} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        2 more workouts this week
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Body Fat %</Label>
                        <span className="text-sm font-medium">18.5% / 15%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        3.5% to go
                      </p>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Goal
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>
                    Your fitness milestones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">7-Day Streak</h4>
                        <p className="text-xs text-muted-foreground">
                          Logged your activity for 7 consecutive days
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-5 w-5 text-chart-2" />
                      </div>
                      <div>
                        <h4 className="font-medium">10K Steps</h4>
                        <p className="text-xs text-muted-foreground">
                          Reached 10,000 steps in a single day
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <h4 className="font-medium">First Workout</h4>
                        <p className="text-xs text-muted-foreground">
                          Completed and logged your first workout
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                        <LineChart className="h-5 w-5 text-chart-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">Weight Loss</h4>
                        <p className="text-xs text-muted-foreground">
                          Lost your first 5 pounds
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View All Achievements
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Timer settings dialog */}
      <Dialog open={showTimerSettings} onOpenChange={setShowTimerSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
            <DialogDescription>
              Customize your workout timer settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {timerMode === "countdown" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="countdown" className="col-span-2">
                  Countdown Time (minutes)
                </Label>
                <Input
                  id="countdown"
                  type="number"
                  value={Math.floor(countdownTime / 60)}
                  onChange={(e) => setCountdownTime(parseInt(e.target.value) * 60)}
                  min={1}
                  max={60}
                  className="col-span-2"
                />
              </div>
            )}
            
            {timerMode === "interval" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="work" className="col-span-2">
                    Work Period (seconds)
                  </Label>
                  <Input
                    id="work"
                    type="number"
                    value={intervalWork}
                    onChange={(e) => setIntervalWork(parseInt(e.target.value))}
                    min={5}
                    max={300}
                    className="col-span-2"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rest" className="col-span-2">
                    Rest Period (seconds)
                  </Label>
                  <Input
                    id="rest"
                    type="number"
                    value={intervalRest}
                    onChange={(e) => setIntervalRest(parseInt(e.target.value))}
                    min={5}
                    max={300}
                    className="col-span-2"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rounds" className="col-span-2">
                    Number of Rounds
                  </Label>
                  <Input
                    id="rounds"
                    type="number"
                    value={intervalRounds}
                    onChange={(e) => setIntervalRounds(parseInt(e.target.value))}
                    min={1}
                    max={20}
                    className="col-span-2"
                  />
                </div>
              </>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="col-span-2">
                Calorie Burn Rate (cal/min)
              </Label>
              <Input
                id="calories"
                type="number"
                value={calorieRate}
                onChange={(e) => setCalorieRate(parseInt(e.target.value))}
                min={1}
                max={20}
                className="col-span-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowTimerSettings(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Timer completed dialog */}
      <Dialog open={timerCompleted} onOpenChange={setTimerCompleted}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Workout Complete!
            </DialogTitle>
            <DialogDescription>
              Great job on completing your workout
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-medium">
                    {timerMode === "stopwatch" ? formatTime(exerciseTime) : 
                     timerMode === "countdown" ? formatTime(countdownTime) : 
                     formatTime(intervalRounds * (intervalWork + intervalRest))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calories Burned</p>
                  <p className="text-lg font-medium">{caloriesBurnedDuringExercise}</p>
                </div>
                {timerMode === "interval" && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Rounds Completed</p>
                      <p className="text-lg font-medium">{intervalRounds}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Workout Type</p>
                      <p className="text-lg font-medium">HIIT</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimerCompleted(false)}>
              Close
            </Button>
            <Button onClick={saveWorkout}>
              Save to History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden audio element for timer sounds */}
      <audio ref={audioRef} src="/sounds/timer-beep.mp3" />
    </div>
  );
}