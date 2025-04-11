"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Brain, 
  Calendar, 
  Clock, 
  Download, 
  Heart, 
  LineChart, 
  Moon, 
  Play, 
  PauseCircle,
  RefreshCw, 
  Save, 
  Sun, 
  Volume2,
  Waves,
  Activity,
  Briefcase,
  Check,
  Dumbbell,
  Footprints,
  Trophy,
  Music,
  FlowerIcon,
  Bike,
  Mountain,
  Pencil,
  HeartHandshake as HandHeart,
  Wind,
  BookOpen,
  Flower as Flower2,
  Coffee,
  Users,
  Home,
  UserPlus,
  PartyPopper as PartyIcon,
  CalendarClock,
  Phone,
  Dog as Paw,
  HandHelping as Helping,
  Laptop,
  GraduationCap,
  Palette,
  Utensils,
  Sparkles,
  ShoppingBag,
  Gamepad as Gamepad2,
  Smartphone,
  Plus,
  PenLine,
  Smile,
  CircleOff,
  Gauge,
  CloudRain,
  Zap,
  BedIcon,
  AlertTriangle,
  HelpCircle,
  Tag,
  ArrowRight,
  CalendarDays,
  BarChart,
  HeartPulse,
  XCircle,
  SunMoon,
  Bell,
  Pause,
  Monitor,
  ListChecks,
  Sliders,
  Trees,
  Volume,
  Headphones
} from "lucide-react";
import { useDrEcho } from "@/components/ai-assistant/dr-echo-context";
import { generateMentalWellnessResponse } from "@/lib/mentalWellnessRecommendations";
import { AnimatedHeart } from '@/components/ui/animated-heart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Function to render the floating heart icon
function FloatingHeartIcon() {
  return (
    <motion.div
      className="absolute right-8 top-24 z-10 hidden md:block"
      initial={{ y: 0 }}
      animate={{ y: [0, -15, 0] }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <AnimatedHeart 
        size={60} 
        color="rgba(255, 51, 102, 0.8)" 
        pulseColor="rgba(255, 102, 153, 0.8)"
      />
    </motion.div>
  );
}

export default function MentalWellnessPage() {
  const { openAssistant, sendMessage } = useDrEcho();
  const [activeTab, setActiveTab] = useState("assessment");
  const [moodScore, setMoodScore] = useState<number>(7);
  const [anxietyLevel, setAnxietyLevel] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(8);
  const [energyLevel, setEnergyLevel] = useState<number>(6);
  const [focusLevel, setFocusLevel] = useState<number>(7);
  const [journalEntry, setJournalEntry] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [meditationTime, setMeditationTime] = useState(300); // 5 minutes in seconds
  const [remainingTime, setRemainingTime] = useState(300);
  const [selectedSound, setSelectedSound] = useState("rain");
  const [journalMoodScore, setJournalMoodScore] = useState(7);
  const [journalEnergyLevel, setJournalEnergyLevel] = useState(6);
  
  const moodLabels = {
    1: "Very Low",
    3: "Low",
    5: "Neutral",
    7: "Good",
    9: "Excellent"
  };
  
  const anxietyLabels = {
    1: "None",
    3: "Mild",
    5: "Moderate",
    7: "High",
    9: "Severe"
  };
  
  const sleepLabels = {
    1: "Poor",
    3: "Fair",
    5: "Average",
    7: "Good",
    9: "Excellent"
  };
  
  const energyLabels = {
    1: "Exhausted",
    3: "Tired",
    5: "Neutral",
    7: "Energetic",
    9: "Very Energetic"
  };
  
  const focusLabels = {
    1: "Distracted",
    3: "Somewhat Focused",
    5: "Moderately Focused",
    7: "Focused",
    9: "Highly Focused"
  };
  
  const getWellnessScore = () => {
    // Calculate overall wellness score (0-100)
    const moodWeight = 0.25;
    const anxietyWeight = 0.25;
    const sleepWeight = 0.2;
    const energyWeight = 0.15;
    const focusWeight = 0.15;
    
    // Normalize anxiety (lower is better)
    const normalizedAnxiety = 10 - anxietyLevel;
    
    const score = (
      (moodScore * moodWeight) +
      (normalizedAnxiety * anxietyWeight) +
      (sleepQuality * sleepWeight) +
      (energyLevel * energyWeight) +
      (focusLevel * focusWeight)
    ) * 10;
    
    return Math.round(score);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const toggleMeditation = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      
      // Simulate countdown
      const interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return meditationTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  const resetMeditation = () => {
    setIsPlaying(false);
    setRemainingTime(meditationTime);
  };
  
  const setMeditationDuration = (minutes: number) => {
    const seconds = minutes * 60;
    setMeditationTime(seconds);
    setRemainingTime(seconds);
  };
  
  const handleConsultAI = () => {
    // Prepare the message for the AI assistant
    const message = `
I'd like some mental wellness advice based on my current state:

Mood: ${moodScore}/10 (${Object.entries(moodLabels).find(([key]) => Number(key) === moodScore)?.[1] || 'N/A'})
Anxiety Level: ${anxietyLevel}/10 (${Object.entries(anxietyLabels).find(([key]) => Number(key) === anxietyLevel)?.[1] || 'N/A'})
Sleep Quality: ${sleepQuality}/10 (${Object.entries(sleepLabels).find(([key]) => Number(key) === sleepQuality)?.[1] || 'N/A'})
Energy Level: ${energyLevel}/10 (${Object.entries(energyLabels).find(([key]) => Number(key) === energyLevel)?.[1] || 'N/A'})
Focus Level: ${focusLevel}/10 (${Object.entries(focusLabels).find(([key]) => Number(key) === focusLevel)?.[1] || 'N/A'}

Journal Entry: ${journalEntry || 'No journal entry provided'}

Based on this information, could you provide some personalized mental wellness recommendations?
`;
    
    // Open the assistant first
    openAssistant();
    
    // Then send the message directly using the provider's sendMessage function
    // This bypasses the DOM manipulation which could be causing issues
    setTimeout(() => {
      sendMessage(message);
    }, 300);
  };
  
  const wellnessScore = getWellnessScore();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">Mental Wellness</h1>
        <p className="text-muted-foreground mb-8">
          Track, assess, and improve your mental wellbeing
        </p>
      </motion.div>
      
      <FloatingHeartIcon />
      
      <Tabs defaultValue="assessment" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="assessment" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-1">
            <LineChart className="h-4 w-4" />
            Mood Journal
          </TabsTrigger>
          <TabsTrigger value="meditation" className="flex items-center gap-1">
            <Waves className="h-4 w-4" />
            Meditation
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessment">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        repeatType: "reverse"
                      }}
                    >
                      <Heart className="h-6 w-6 text-rose-500" />
                    </motion.div>
                    Daily Wellness Check-in
                  </CardTitle>
                  <CardDescription className="text-base">
                    Rate how you're feeling today to track your mental wellbeing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Mood Slider */}
                  <motion.div 
                    className="mood-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <Sun className="h-5 w-5 text-yellow-500" />
                        Mood
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-blue-200 dark:bg-blue-800"
                        animate={{ 
                          backgroundColor: moodScore > 7 ? ["#bfdbfe", "#93c5fd", "#bfdbfe"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(moodLabels).find(([key]) => Number(key) === moodScore)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="mood-slider-container">
                      <div className="mood-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`mood-segment ${value <= moodScore ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= moodScore ? (0.4 + (value / moodScore) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(59, 130, 246, ${value <= moodScore ? 0.7 : 0.2}), rgba(96, 165, 250, ${value <= moodScore ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setMoodScore(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom" 
                        style={{ left: `calc(${(moodScore - 1) * 10}% + ${moodScore * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={moodScore}
                        onChange={(e) => setMoodScore(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Anxiety Slider */}
                  <motion.div 
                    className="anxiety-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-500" />
                        Anxiety Level
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-orange-200 dark:bg-orange-800"
                        animate={{ 
                          backgroundColor: anxietyLevel < 3 ? ["#fed7aa", "#fdba74", "#fed7aa"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(anxietyLabels).find(([key]) => Number(key) === anxietyLevel)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="anxiety-slider-container">
                      <div className="anxiety-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`anxiety-segment ${value <= anxietyLevel ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= anxietyLevel ? (0.4 + (value / anxietyLevel) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(249, 115, 22, ${value <= anxietyLevel ? 0.7 : 0.2}), rgba(251, 146, 60, ${value <= anxietyLevel ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setAnxietyLevel(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom anxiety-thumb" 
                        style={{ left: `calc(${(anxietyLevel - 1) * 10}% + ${anxietyLevel * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={anxietyLevel}
                        onChange={(e) => setAnxietyLevel(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Sleep Quality Slider */}
                  <motion.div 
                    className="sleep-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <Moon className="h-5 w-5 text-purple-500" />
                        Sleep Quality
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-800"
                        animate={{ 
                          backgroundColor: sleepQuality > 7 ? ["#e9d5ff", "#d8b4fe", "#e9d5ff"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(sleepLabels).find(([key]) => Number(key) === sleepQuality)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="sleep-slider-container">
                      <div className="sleep-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`sleep-segment ${value <= sleepQuality ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= sleepQuality ? (0.4 + (value / sleepQuality) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(139, 92, 246, ${value <= sleepQuality ? 0.7 : 0.2}), rgba(167, 139, 250, ${value <= sleepQuality ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setSleepQuality(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom sleep-thumb" 
                        style={{ left: `calc(${(sleepQuality - 1) * 10}% + ${sleepQuality * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={sleepQuality}
                        onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Energy Level Slider */}
                  <motion.div 
                    className="energy-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-950/30 dark:to-amber-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-yellow-500" />
                        Energy Level
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-yellow-200 dark:bg-yellow-800"
                        animate={{ 
                          backgroundColor: energyLevel > 7 ? ["#fef08a", "#fde047", "#fef08a"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(energyLabels).find(([key]) => Number(key) === energyLevel)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="energy-slider-container">
                      <div className="energy-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`energy-segment ${value <= energyLevel ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= energyLevel ? (0.4 + (value / energyLevel) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(234, 179, 8, ${value <= energyLevel ? 0.7 : 0.2}), rgba(250, 204, 21, ${value <= energyLevel ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setEnergyLevel(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom energy-thumb" 
                        style={{ left: `calc(${(energyLevel - 1) * 10}% + ${energyLevel * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Focus Level Slider */}
                  <motion.div 
                    className="focus-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <Brain className="h-5 w-5 text-green-500" />
                        Focus Level
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-green-200 dark:bg-green-800"
                        animate={{ 
                          backgroundColor: focusLevel > 7 ? ["#bbf7d0", "#86efac", "#bbf7d0"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(focusLabels).find(([key]) => Number(key) === focusLevel)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="focus-slider-container">
                      <div className="focus-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`focus-segment ${value <= focusLevel ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= focusLevel ? (0.4 + (value / focusLevel) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(34, 197, 94, ${value <= focusLevel ? 0.7 : 0.2}), rgba(74, 222, 128, ${value <= focusLevel ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setFocusLevel(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom focus-thumb" 
                        style={{ left: `calc(${(focusLevel - 1) * 10}% + ${focusLevel * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={focusLevel}
                        onChange={(e) => setFocusLevel(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="wellness-activity-tracker mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-950/40 dark:to-indigo-950/20 shadow-md border border-blue-100/50 dark:border-indigo-900/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                      <Calendar className="h-5 w-5 text-indigo-500" />
                      Activities That Influenced Your Mood Today
                    </h3>

                    <div className="activity-categories space-y-6">
                      {/* Physical Section */}
                      <div className="activity-category">
                        <h4 className="text-sm font-medium mb-2 text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                          <Activity className="h-4 w-4" />
                          Physical
                        </h4>
                        <div className="activities-grid grid grid-cols-2 gap-2 md:grid-cols-4">
                          {[
                            { name: "Exercise", icon: <Dumbbell className="h-3.5 w-3.5" /> },
                            { name: "Walking", icon: <Footprints className="h-3.5 w-3.5" /> },
                            { name: "Sports", icon: <Trophy className="h-3.5 w-3.5" /> },
                            { name: "Dancing", icon: <Music className="h-3.5 w-3.5" /> },
                            { name: "Yoga", icon: <FlowerIcon className="h-3.5 w-3.5" /> },
                            { name: "Cycling", icon: <Bike className="h-3.5 w-3.5" /> },
                            { name: "Hiking", icon: <Mountain className="h-3.5 w-3.5" /> },
                            { name: "Swimming", icon: <Waves className="h-3.5 w-3.5" /> }
                          ].map((activity) => (
                            <div key={activity.name} className="activity-item">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-sm border border-transparent hover:border-blue-100 dark:hover:border-indigo-900/30">
                                <div className="activity-checkbox">
                                  <input type="checkbox" className="peer hidden" />
                                  <div className="checkbox-display w-5 h-5 rounded-md border-2 border-blue-400/60 dark:border-indigo-500/60 flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-blue-400 peer-checked:to-indigo-500 transition-all duration-200 peer-checked:border-0">
                                    <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>
                                <div className="activity-info flex items-center gap-1.5">
                                  <div className="icon-circle w-5 h-5 rounded-full bg-blue-100 dark:bg-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-indigo-300">
                                    {activity.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{activity.name}</span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mental & Wellness Section */}
                      <div className="activity-category">
                        <h4 className="text-sm font-medium mb-2 text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                          <Brain className="h-4 w-4" />
                          Mental & Wellness
                        </h4>
                        <div className="activities-grid grid grid-cols-2 gap-2 md:grid-cols-4">
                          {[
                            { name: "Meditation", icon: <FlowerIcon className="h-3.5 w-3.5" /> },
                            { name: "Good Sleep", icon: <Moon className="h-3.5 w-3.5" /> },
                            { name: "Journaling", icon: <Pencil className="h-3.5 w-3.5" /> },
                            { name: "Therapy", icon: <HandHeart className="h-3.5 w-3.5" /> },
                            { name: "Deep Breathing", icon: <Wind className="h-3.5 w-3.5" /> },
                            { name: "Reading", icon: <BookOpen className="h-3.5 w-3.5" /> },
                            { name: "Nature Time", icon: <Flower2 className="h-3.5 w-3.5" /> },
                            { name: "Relaxation", icon: <Coffee className="h-3.5 w-3.5" /> }
                          ].map((activity) => (
                            <div key={activity.name} className="activity-item">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-sm border border-transparent hover:border-purple-100 dark:hover:border-indigo-900/30">
                                <div className="activity-checkbox">
                                  <input type="checkbox" className="peer hidden" />
                                  <div className="checkbox-display w-5 h-5 rounded-md border-2 border-purple-400/60 dark:border-indigo-500/60 flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-purple-400 peer-checked:to-indigo-500 transition-all duration-200 peer-checked:border-0">
                                    <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>
                                <div className="activity-info flex items-center gap-1.5">
                                  <div className="icon-circle w-5 h-5 rounded-full bg-purple-100 dark:bg-indigo-900/40 flex items-center justify-center text-purple-600 dark:text-indigo-300">
                                    {activity.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{activity.name}</span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Social Section */}
                      <div className="activity-category">
                        <h4 className="text-sm font-medium mb-2 text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          Social
                        </h4>
                        <div className="activities-grid grid grid-cols-2 gap-2 md:grid-cols-4">
                          {[
                            { name: "Family Time", icon: <Home className="h-3.5 w-3.5" /> },
                            { name: "Friends", icon: <UserPlus className="h-3.5 w-3.5" /> },
                            { name: "Date Night", icon: <Heart className="h-3.5 w-3.5" /> },
                            { name: "Party", icon: <PartyIcon className="h-3.5 w-3.5" /> },
                            { name: "Social Event", icon: <CalendarClock className="h-3.5 w-3.5" /> },
                            { name: "Phone Call", icon: <Phone className="h-3.5 w-3.5" /> },
                            { name: "Pet Time", icon: <Paw className="h-3.5 w-3.5" /> },
                            { name: "Volunteer", icon: <Helping className="h-3.5 w-3.5" /> }
                          ].map((activity) => (
                            <div key={activity.name} className="activity-item">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-sm border border-transparent hover:border-pink-100 dark:hover:border-indigo-900/30">
                                <div className="activity-checkbox">
                                  <input type="checkbox" className="peer hidden" />
                                  <div className="checkbox-display w-5 h-5 rounded-md border-2 border-pink-400/60 dark:border-indigo-500/60 flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-pink-400 peer-checked:to-rose-500 transition-all duration-200 peer-checked:border-0">
                                    <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>
                                <div className="activity-info flex items-center gap-1.5">
                                  <div className="icon-circle w-5 h-5 rounded-full bg-pink-100 dark:bg-indigo-900/40 flex items-center justify-center text-pink-600 dark:text-indigo-300">
                                    {activity.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{activity.name}</span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Work & Life Section */}
                      <div className="activity-category">
                        <h4 className="text-sm font-medium mb-2 text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          Work & Life
                        </h4>
                        <div className="activities-grid grid grid-cols-2 gap-2 md:grid-cols-4">
                          {[
                            { name: "Work", icon: <Laptop className="h-3.5 w-3.5" /> },
                            { name: "Study", icon: <GraduationCap className="h-3.5 w-3.5" /> },
                            { name: "Hobbies", icon: <Palette className="h-3.5 w-3.5" /> },
                            { name: "Cooking", icon: <Utensils className="h-3.5 w-3.5" /> },
                            { name: "Cleaning", icon: <Sparkles className="h-3.5 w-3.5" /> },
                            { name: "Shopping", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
                            { name: "Gaming", icon: <Gamepad2 className="h-3.5 w-3.5" /> },
                            { name: "Screen Time", icon: <Smartphone className="h-3.5 w-3.5" /> }
                          ].map((activity) => (
                            <div key={activity.name} className="activity-item">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-sm border border-transparent hover:border-green-100 dark:hover:border-indigo-900/30">
                                <div className="activity-checkbox">
                                  <input type="checkbox" className="peer hidden" />
                                  <div className="checkbox-display w-5 h-5 rounded-md border-2 border-green-400/60 dark:border-indigo-500/60 flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-green-400 peer-checked:to-emerald-500 transition-all duration-200 peer-checked:border-0">
                                    <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>
                                <div className="activity-info flex items-center gap-1.5">
                                  <div className="icon-circle w-5 h-5 rounded-full bg-green-100 dark:bg-indigo-900/40 flex items-center justify-center text-green-600 dark:text-indigo-300">
                                    {activity.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{activity.name}</span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="custom-activity mt-6 flex flex-col md:flex-row gap-3">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          placeholder="Add a custom activity..." 
                          className="w-full px-4 py-2.5 rounded-lg border border-blue-200 dark:border-indigo-900/30 bg-white/70 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 dark:focus:ring-indigo-500/50 focus:border-transparent placeholder-gray-400/70"
                        />
                        <PenLine className="absolute right-3.5 top-3 h-4 w-4 text-indigo-400/70" />
                      </div>
                      <button className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition-all">
                        <Plus className="h-4 w-4" />
                        <span>Add Activity</span>
                      </button>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-end space-x-2"
                    whileInView={{ opacity: [0, 1], y: [20, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setMoodScore(7);
                        setAnxietyLevel(3);
                        setSleepQuality(8);
                        setEnergyLevel(6);
                        setFocusLevel(7);
                      }}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Check-in
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="wellness-score-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-900/20 border-b border-indigo-100 dark:border-indigo-800/20">
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="relative"
                    >
                      <Heart className="h-5 w-5 text-pink-500" />
                    </motion.div>
                    Wellness Score
                  </CardTitle>
                  <CardDescription>
                    Your overall mental wellness rating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative h-44 w-44">
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <motion.div 
                          className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [0.8, 1.1, 1] }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                        >
                          {wellnessScore}
                        </motion.div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">out of 100</div>
                      </div>
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        {/* Gradient background for the ring */}
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={wellnessScore >= 80 ? "#4ade80" : wellnessScore >= 60 ? "#60a5fa" : wellnessScore >= 40 ? "#facc15" : "#f87171"} />
                            <stop offset="100%" stopColor={wellnessScore >= 80 ? "#22c55e" : wellnessScore >= 60 ? "#3b82f6" : wellnessScore >= 40 ? "#eab308" : "#ef4444"} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Background ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(203, 213, 225, 0.3)"
                          strokeWidth="10"
                          className="dark:opacity-30"
                        />
                        
                        {/* Score ring with gradient and animation */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#scoreGradient)"
                          strokeWidth="10"
                          strokeDasharray={`${(wellnessScore / 100) * 283} 283`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                          filter="url(#glow)"
                          initial={{ strokeDasharray: "0 283" }}
                          animate={{ strokeDasharray: `${(wellnessScore / 100) * 283} 283` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                    </div>
                    <motion.div 
                      className="wellness-rating-badge mt-2 px-4 py-1 rounded-full text-white font-medium text-sm"
                      style={{ 
                        background: `linear-gradient(to right, ${
                          wellnessScore >= 80 ? "#4ade80, #22c55e" : 
                          wellnessScore >= 60 ? "#60a5fa, #3b82f6" : 
                          wellnessScore >= 40 ? "#facc15, #eab308" : 
                          "#f87171, #ef4444"
                        })`
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      {wellnessScore >= 80 ? "Excellent" : 
                       wellnessScore >= 60 ? "Good" : 
                       wellnessScore >= 40 ? "Fair" : 
                       "Needs Attention"}
                    </motion.div>
                  </motion.div>
                  
                  <div className="space-y-3 wellness-stats mt-4">
                    <motion.div 
                      className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(219, 234, 254, 0.8)" }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Last check-in</span>
                      </div>
                      <span className="font-medium text-sm">Today, 9:41 AM</span>
                    </motion.div>
                    <motion.div 
                      className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(209, 250, 229, 0.8)" }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-green-500" />
                        <span className="text-sm">7-day trend</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.div 
                          initial={{ y: 0 }}
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3L20 13H4L12 3Z" fill="#22c55e" />
                          </svg>
                        </motion.div>
                        <span className="font-medium text-sm text-green-600 dark:text-green-400">+5 points</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="wellness-recommendation mt-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Based on your patterns:</p>
                    <div className="p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/10 border border-purple-100 dark:border-purple-900/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Tip:</span> Your mood is typically highest in the morning. Consider scheduling important activities during this time.
                      </p>
                    </div>
                  </motion.div>
                  
                  <Button 
                    onClick={handleConsultAI} 
                    className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md"
                  >
                    <motion.div
                      className="mr-2 h-5 w-5"
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="h-5 w-5" />
                    </motion.div>
                    Get AI Recommendations
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("meditation")}>
                    <Waves className="mr-2 h-4 w-4" />
                    Start Meditation
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("journal")}>
                    <LineChart className="mr-2 h-4 w-4" />
                    Write in Journal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Therapy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="journal">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="journal-card overflow-hidden border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-900/20 border-b border-rose-100 dark:border-purple-800/20">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                        >
                          <BookOpen className="h-5 w-5 text-rose-500" />
                        </motion.div>
                        Mood Journal
                      </CardTitle>
                      <CardDescription className="text-base">
                        Express your thoughts and feelings to track your emotional wellbeing
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6 relative">
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br from-purple-100/30 to-blue-100/20 dark:from-purple-900/10 dark:to-blue-900/5 blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-gradient-to-tr from-rose-100/20 to-amber-100/10 dark:from-rose-900/10 dark:to-amber-900/5 blur-3xl -z-10"></div>
                    
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <Label className="text-lg font-medium text-gray-800 dark:text-gray-200">How are you feeling today?</Label>
                      <div className="flex justify-between mb-2 bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg shadow-sm backdrop-blur-sm">
                        <div className="flex items-center">
                          <motion.div
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, repeatType: "loop" }}
                          >
                            <Sun className="h-5 w-5 text-amber-500 mr-2" />
                          </motion.div>
                          <Select defaultValue="morning">
                            <SelectTrigger className="w-[130px] border-0 bg-transparent">
                              <SelectValue placeholder="Time of day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="afternoon">Afternoon</SelectItem>
                              <SelectItem value="evening">Evening</SelectItem>
                              <SelectItem value="night">Night</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <motion.span 
                          className="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </motion.span>
                      </div>
                      <Textarea 
                        placeholder="Write about your thoughts, feelings, and experiences..." 
                        className="min-h-[200px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-100 dark:border-purple-800/30 focus:ring-2 focus:ring-purple-400/50 dark:focus:ring-purple-500/50 focus:border-transparent shadow-sm transition-all resize-y"
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                      />
                      
                      {/* Word count and emotion detection */}
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{journalEntry.length > 0 ? `${journalEntry.split(/\s+/).filter(Boolean).length} words` : "0 words"}</span>
                        <span className="flex items-center gap-1">
                          <HeartPulse className="h-3 w-3 text-rose-500" />
                          {journalEntry.length > 20 ? "Detected emotions: Thoughtful, Reflective" : "Write more to detect emotions"}
                        </span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-medium flex items-center gap-1">
                          <Tag className="h-4 w-4 text-indigo-500" />
                          Mood Tags
                        </Label>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Custom Tag
                        </Button>
                      </div>
                      <div className="mood-tags-container bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg backdrop-blur-sm">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: "Happy", color: "bg-gradient-to-r from-yellow-400 to-amber-500", icon: <Smile className="h-3 w-3" /> },
                            { name: "Calm", color: "bg-gradient-to-r from-blue-400 to-cyan-500", icon: <CircleOff className="h-3 w-3" /> },
                            { name: "Anxious", color: "bg-gradient-to-r from-orange-400 to-amber-500", icon: <Gauge className="h-3 w-3" /> },
                            { name: "Sad", color: "bg-gradient-to-r from-blue-400 to-indigo-500", icon: <CloudRain className="h-3 w-3" /> },
                            { name: "Energetic", color: "bg-gradient-to-r from-green-400 to-emerald-500", icon: <Zap className="h-3 w-3" /> },
                            { name: "Tired", color: "bg-gradient-to-r from-slate-400 to-gray-500", icon: <BedIcon className="h-3 w-3" /> },
                            { name: "Stressed", color: "bg-gradient-to-r from-red-400 to-rose-500", icon: <AlertTriangle className="h-3 w-3" /> },
                            { name: "Grateful", color: "bg-gradient-to-r from-purple-400 to-violet-500", icon: <Heart className="h-3 w-3" /> },
                            { name: "Frustrated", color: "bg-gradient-to-r from-rose-400 to-red-500", icon: <XCircle className="h-3 w-3" /> },
                            { name: "Hopeful", color: "bg-gradient-to-r from-emerald-400 to-green-500", icon: <SunMoon className="h-3 w-3" /> },
                            { name: "Excited", color: "bg-gradient-to-r from-pink-400 to-rose-500", icon: <Sparkles className="h-3 w-3" /> },
                            { name: "Confused", color: "bg-gradient-to-r from-violet-400 to-purple-500", icon: <HelpCircle className="h-3 w-3" /> }
                          ].map((tag) => (
                            <motion.div 
                              key={tag.name} 
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`rounded-full text-white shadow-sm px-3 py-1 h-auto ${tag.color} border-0 hover:shadow-md transition-all`}
                              >
                                <span className="flex items-center gap-1">
                                  {tag.icon}
                                  {tag.name}
                                </span>
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      className="space-y-4" 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                      <Label className="text-base font-medium flex items-center gap-1">
                        <Activity className="h-4 w-4 text-indigo-500" />
                        Rate Your Day (1-10)
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium flex items-center gap-1">
                              <Sun className="h-3.5 w-3.5 text-amber-500" />
                              Overall Mood
                            </span>
                            <span className="text-sm font-bold">{journalMoodScore}/10</span>
                          </div>
                          <Slider 
                            min={1} 
                            max={10} 
                            step={1} 
                            value={[journalMoodScore]} 
                            onValueChange={(value) => setJournalMoodScore(value[0])}
                            className="mood-slider"
                          />
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5 text-yellow-500" />
                              Energy Level
                            </span>
                            <span className="text-sm font-bold">{journalEnergyLevel}/10</span>
                          </div>
                          <Slider 
                            min={1} 
                            max={10} 
                            step={1} 
                            value={[journalEnergyLevel]} 
                            onValueChange={(value) => setJournalEnergyLevel(value[0])}
                            className="energy-slider"
                          />
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-end space-x-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <Button 
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </Button>
                      <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md transition-all">
                        <Download className="mr-2 h-4 w-4" />
                        Save Entry
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="shadow-md border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 border-b border-indigo-100 dark:border-indigo-800/20">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-indigo-500" />
                      Journal Insights
                    </CardTitle>
                    <CardDescription>
                      Track your mood patterns over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="h-48 w-full bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 journal-chart-placeholder relative overflow-hidden">
                      <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-indigo-500" />
                        Emotion Patterns
                      </h4>
                      
                      <div className="relative h-32">
                        {/* Placeholder chart with gradient bars */}
                        <div className="flex h-full items-end justify-between px-1">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                            <div key={day} className="flex flex-col items-center">
                              <div 
                                className="w-7 rounded-t-md bg-gradient-to-t transition-all" 
                                style={{
                                  height: `${[60, 45, 75, 35, 80, 65, 50][i]}%`,
                                  background: `linear-gradient(to top, 
                                    ${[
                                      "from-blue-400 to-indigo-500", 
                                      "from-amber-400 to-orange-500", 
                                      "from-green-400 to-emerald-500", 
                                      "from-orange-400 to-red-500", 
                                      "from-yellow-400 to-amber-500", 
                                      "from-indigo-400 to-purple-500", 
                                      "from-green-400 to-teal-500"
                                    ][i]})`,
                                  animationDelay: `${i * 0.1}s`
                                }}
                                className={`w-7 rounded-t-md animate-[height] bg-gradient-to-t transition-all`}
                              />
                              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">{day}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Legend */}
                        <div className="absolute top-1 right-1">
                          <div className="flex items-center justify-end space-x-3">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mr-1"></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Happy</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mr-1"></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Calm</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 mr-1"></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Stress</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Overlay for empty state */}
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-[1px]"
                          initial={{ opacity: 1 }}
                          whileHover={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="text-center text-sm text-muted-foreground p-3">
                            <p>Your mood trends will appear here as you add more journal entries</p>
                            <p className="text-xs mt-1 text-indigo-500">Hover to preview</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Journal History</h4>
                      <div className="space-y-4">
                        {[
                          { 
                            date: "Yesterday", 
                            time: "9:30 PM", 
                            mood: "Calm", 
                            score: 7,
                            preview: "Today was a productive day at work. I managed to finish the project ahead of schedule." 
                          },
                          { 
                            date: "May 10, 2025", 
                            time: "8:15 AM", 
                            mood: "Anxious", 
                            score: 4,
                            preview: "Feeling a bit nervous about the presentation today. Hope it goes well." 
                          },
                          { 
                            date: "May 8, 2025", 
                            time: "10:45 PM", 
                            mood: "Happy", 
                            score: 9,
                            preview: "Had a wonderful dinner with friends. We talked about our plans for the summer." 
                          },
                        ].map((entry, index) => (
                          <motion.div 
                            key={index} 
                            className="border-b pb-4 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-900/20 p-2 rounded-lg transition-colors cursor-pointer"
                            whileHover={{ x: 3 }}
                          >
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{entry.date}</span>
                              <span className="text-xs text-muted-foreground">{entry.time}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              <div className={`h-2 w-2 rounded-full mr-2 ${
                                entry.score >= 8 ? "bg-green-500" : 
                                entry.score >= 5 ? "bg-blue-500" : 
                                "bg-orange-500"
                              }`} />
                              <span className="text-xs font-medium">{entry.mood}</span>
                              <div className="ml-auto flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div 
                                    key={i}
                                    className={`h-1 w-1 rounded-full mx-0.5 ${
                                      i < Math.ceil(entry.score / 2) ? 
                                      "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{entry.preview}</p>
                          </motion.div>
                        ))}
                      </div>
                      
                      <Button variant="outline" className="w-full group">
                        <span className="flex items-center">
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="mr-2 opacity-70 group-hover:opacity-100"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.div>
                          View All Entries
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="meditation">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-900/20 border-b border-green-100 dark:border-teal-800/20">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                        >
                          <Waves className="h-5 w-5 text-teal-500" />
                        </motion.div>
                        Guided Meditation
                      </CardTitle>
                      <CardDescription className="text-base">
                        Take a moment to relax and focus on your breathing
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6 relative">
                    <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-gradient-to-br from-teal-100/30 to-green-100/20 dark:from-teal-900/10 dark:to-green-900/5 blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-gradient-to-tr from-emerald-100/20 to-blue-100/10 dark:from-emerald-900/10 dark:to-blue-900/5 blur-3xl -z-10"></div>
                    
                    <motion.div 
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative h-64 w-64">
                        {/* Meditation theme selector */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                          <Select defaultValue="breathing">
                            <SelectTrigger className="w-[180px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-teal-200 dark:border-green-900/30 focus:ring-2 focus:ring-green-400/50">
                              <SelectValue placeholder="Meditation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="breathing">Deep Breathing</SelectItem>
                              <SelectItem value="body-scan">Body Scan</SelectItem>
                              <SelectItem value="mindfulness">Mindfulness</SelectItem>
                              <SelectItem value="gratitude">Gratitude</SelectItem>
                              <SelectItem value="visualization">Visualization</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Timer display */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <motion.div 
                            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-green-500"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.1, 1] }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                          >
                            {formatTime(remainingTime)}
                          </motion.div>
                        </div>
                        
                        {/* Circular progress */}
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id="meditationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#4ade80" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                            <filter id="meditation-glow">
                              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          
                          {/* Background ring */}
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(203, 213, 225, 0.3)"
                            strokeWidth="10"
                            className="dark:opacity-30"
                          />
                          
                          {/* Progress ring with gradient and animation */}
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#meditationGradient)"
                            strokeWidth="10"
                            strokeDasharray="283"
                            strokeDashoffset={`${(1 - remainingTime / meditationTime) * 283}`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                            filter="url(#meditation-glow)"
                            animate={isPlaying ? { strokeDashoffset: (1 - 0 / meditationTime) * 283 } : {}}
                            transition={{ duration: meditationTime, ease: "linear" }}
                            className="meditation-timer-ring"
                          />
                        </svg>
                        
                        {/* Breathing animation */}
                        {isPlaying && (
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.3, 0.7] }}
                            transition={{ 
                              duration: 4, 
                              repeat: Infinity, 
                              repeatType: "reverse",
                              ease: "easeInOut" 
                            }}
                          >
                            <div className="h-36 w-36 rounded-full bg-gradient-to-r from-teal-400/20 to-green-400/10 backdrop-blur-sm meditation-breath-circle" />
                          </motion.div>
                        )}
                        
                        {/* Prompt text for breathing */}
                        {isPlaying && (
                          <motion.div 
                            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center w-full"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
                              {Math.floor(remainingTime) % 8 < 4 ? "Breathe in..." : "Breathe out..."}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-center space-x-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={resetMeditation}
                        className="rounded-full h-12 w-12 border-green-200 dark:border-green-900/30 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <RefreshCw className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </Button>
                      
                      <Button 
                        size="lg" 
                        onClick={toggleMeditation}
                        className="rounded-full px-6 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 min-w-[140px]"
                      >
                        {isPlaying ? (
                          <>
                            <motion.div
                              animate={{ scale: [1, 0.85, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <PauseCircle className="mr-2 h-5 w-5" />
                            </motion.div>
                            Pause
                          </>
                        ) : (
                          <>
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Play className="mr-2 h-5 w-5" />
                            </motion.div>
                            Start
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-5 pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          Duration
                        </Label>
                        <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80 meditation-badge">
                          {meditationTime / 60} minutes
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-6 gap-3">
                        {[1, 3, 5, 10, 15, 20].map((minutes) => (
                          <motion.div 
                            key={minutes} 
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              variant={meditationTime === minutes * 60 ? "default" : "outline"}
                              onClick={() => setMeditationDuration(minutes)}
                              className={`w-full ${
                                meditationTime === minutes * 60 
                                  ? "bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-md border-0" 
                                  : "border-teal-200 dark:border-teal-900/20 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/10"
                              }`}
                            >
                              {minutes} min
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="pt-2 space-y-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.0 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-medium flex items-center gap-1">
                          <Volume2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          Ambient Sound
                        </Label>
                        <Button variant="ghost" size="sm">
                          <Volume className="h-3.5 w-3.5 mr-1" />
                          Preview
                        </Button>
                      </div>
                      
                      <RadioGroup value={selectedSound} onValueChange={setSelectedSound} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { value: "rain", label: "Rain", icon: <CloudRain className="mb-2 h-5 w-5 text-blue-500" /> },
                          { value: "forest", label: "Forest", icon: <Trees className="mb-2 h-5 w-5 text-green-500" /> },
                          { value: "ocean", label: "Ocean", icon: <Waves className="mb-2 h-5 w-5 text-cyan-500" /> },
                          { value: "white-noise", label: "White Noise", icon: <Volume2 className="mb-2 h-5 w-5 text-gray-500" /> }
                        ].map((sound) => (
                          <div key={sound.value}>
                            <RadioGroupItem value={sound.value} id={sound.value} className="peer sr-only" />
                            <Label
                              htmlFor={sound.value}
                              className={`flex flex-col items-center justify-between rounded-xl border-2 border-teal-200/50 dark:border-teal-900/30 bg-white/80 dark:bg-slate-800/80 p-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-400/50 dark:hover:border-teal-700/50 peer-data-[state=checked]:border-teal-500 dark:peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50 dark:peer-data-[state=checked]:bg-teal-900/20 [&:has([data-state=checked])]:border-teal-500 transition-all cursor-pointer ambient-sound-card ${selectedSound === sound.value ? 'selected' : ''}`}
                            >
                              {sound.icon}
                              {sound.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </motion.div>
                    
                    <motion.div 
                      className="pt-2 space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.2 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-medium flex items-center gap-1">
                          <Sliders className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          Settings
                        </Label>
                      </div>
                      
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg">
                          <span className="text-sm flex items-center gap-2">
                            <Bell className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Bell sound at end
                          </span>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg">
                          <span className="text-sm flex items-center gap-2">
                            <Pause className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Interval bells
                          </span>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg">
                          <span className="text-sm flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Keep screen on
                          </span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="shadow-md border-0 overflow-hidden meditation-stats-card">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-900/20 border-b border-teal-100 dark:border-emerald-800/20">
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-teal-500" />
                      Meditation Stats
                    </CardTitle>
                    <CardDescription>
                      Your meditation journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        className="bg-gradient-to-br from-teal-500/10 to-green-500/5 dark:from-teal-900/30 dark:to-green-900/20 shadow-sm rounded-xl p-4 text-center flex flex-col justify-center"
                        whileHover={{ y: -3, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm text-teal-700 dark:text-teal-300 mb-1 font-medium">Total Sessions</p>
                        <motion.p 
                          className="text-3xl font-bold text-teal-900 dark:text-teal-50"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          24
                        </motion.p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/30 dark:to-teal-900/20 shadow-sm rounded-xl p-4 text-center flex flex-col justify-center"
                        whileHover={{ y: -3, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1 font-medium">Total Minutes</p>
                        <motion.p 
                          className="text-3xl font-bold text-emerald-900 dark:text-emerald-50"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                        >
                          187
                        </motion.p>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-teal-500" />
                          Current streak
                        </h4>
                        <Badge className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white border-0">3 days</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-muted-foreground">Last session</span>
                          <span className="text-sm font-medium">Today, 9:30 AM</span>
                        </div>
                        <div className="flex flex-col space-y-1 items-end">
                          <span className="text-xs text-muted-foreground">Longest streak</span>
                          <span className="text-sm font-medium">5 days</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Weekly goal: 5 sessions</span>
                        <span className="text-xs font-medium">3/5</span>
                      </div>
                      
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-teal-500 to-green-500 h-full rounded-full"
                          style={{ width: '60%' }}
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 1, delay: 1 }}
                        />
                      </div>
                    </motion.div>
                    
                    <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-teal-500" />
                          Weekly Activity
                        </h4>
                      </div>
                      
                      <div className="px-4 py-3 flex justify-between">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <div key={day} className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-2">{day}</span>
                            <motion.div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                [0, 2, 4].includes(i) 
                                  ? 'bg-gradient-to-br from-teal-500 to-green-500 text-white' 
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5, delay: 0.9 + (i * 0.05) }}
                            >
                              {[0, 2, 4].includes(i) && <Check className="h-3 w-3" />}
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <motion.div
                      className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <LineChart className="h-4 w-4 text-teal-500" />
                          Monthly Progress
                        </h4>
                        <Badge variant="outline" className="text-xs">May 2025</Badge>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {Array.from({ length: 31 }).map((_, i) => {
                          // Define meditation intensity: 0 = none, 1 = short, 2 = medium, 3 = long
                          const intensity = [1, 3, 5, 7, 10, 12, 15, 18, 20, 22, 25, 28].includes(i) 
                            ? Math.floor(Math.random() * 3) + 1 
                            : 0;
                          
                          return (
                            <motion.div
                              key={i}
                              className={`w-full aspect-square rounded-sm ${
                                intensity === 0 
                                  ? 'bg-gray-200 dark:bg-gray-700' 
                                  : intensity === 1
                                    ? 'bg-teal-300/30 dark:bg-teal-700/30'
                                    : intensity === 2
                                      ? 'bg-teal-400/60 dark:bg-teal-600/60'
                                      : 'bg-teal-500 dark:bg-teal-500'
                              }`}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 1.2 + (i * 0.01) }}
                              whileHover={{ scale: 1.2 }}
                              title={`Day ${i+1}: ${
                                intensity === 0 
                                  ? 'No meditation' 
                                  : intensity === 1
                                    ? '5 min meditation'
                                    : intensity === 2
                                      ? '10 min meditation'
                                      : '15+ min meditation'
                              }`}
                            />
                          );
                        })}
                      </div>
                      
                      <div className="flex items-center justify-end mt-3 gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
                          <span className="text-xs text-muted-foreground">None</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-teal-300/30 dark:bg-teal-700/30"></div>
                          <span className="text-xs text-muted-foreground">5 min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-teal-400/60 dark:bg-teal-600/60"></div>
                          <span className="text-xs text-muted-foreground">10 min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-teal-500"></div>
                          <span className="text-xs text-muted-foreground">15+ min</span>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="shadow-md border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-900/20 border-b border-cyan-100 dark:border-blue-800/20">
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-cyan-500" />
                      Recommended Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-1">
                    {[
                      { 
                        title: "Stress Relief", 
                        description: "Calm your mind and release tension",
                        duration: "10 min", 
                        type: "Guided",
                        level: "Beginner",
                        color: "from-blue-500 to-cyan-500"
                      },
                      { 
                        title: "Better Sleep", 
                        description: "Relax your body and prepare for rest",
                        duration: "15 min", 
                        type: "Guided",
                        level: "All Levels",
                        color: "from-indigo-500 to-purple-500"
                      },
                      { 
                        title: "Focus & Concentration", 
                        description: "Enhance mental clarity and attention",
                        duration: "5 min", 
                        type: "Unguided",
                        level: "Intermediate",
                        color: "from-amber-500 to-orange-500"
                      },
                    ].map((session, index) => (
                      <motion.div 
                        key={index}
                        className="mb-4 overflow-hidden rounded-xl bg-white/60 dark:bg-slate-800/60 shadow-sm hover:shadow-md transition-all cursor-pointer session-card"
                        whileHover={{ y: -3, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 + (index * 0.2) }}
                      >
                        <div className="relative">
                          <div className={`h-1.5 w-full bg-gradient-to-r ${session.color}`}></div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-sm">{session.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{session.description}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 dark:bg-slate-700/80 rounded-full shadow-sm -mt-1 -mr-1">
                                <Play className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-teal-500" />
                                  {session.duration}
                                </span>
                                <span className="flex items-center">
                                  <Headphones className="h-3 w-3 mr-1 text-teal-500" />
                                  {session.type}
                                </span>
                              </div>
                              <Badge variant="outline" className="h-5 text-xs font-normal">
                                {session.level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    <Button variant="ghost" className="w-full mt-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 group">
                      <span className="flex items-center">
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="mr-2 opacity-70 group-hover:opacity-100"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                        Explore More Sessions
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wellness Trends</CardTitle>
                  <CardDescription>
                    Your mental wellness patterns over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Wellness trend chart will appear here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Mood Patterns</CardTitle>
                  <CardDescription>
                    Insights into your emotional patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Weekly Mood Distribution</h3>
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Mood distribution chart will appear here</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Time of Day Analysis</h3>
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Time of day chart will appear here</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Key Insights</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Sun className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-sm">Your mood tends to be highest in the morning and gradually decreases throughout the day.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Moon className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-sm">Sleep quality has a strong correlation with your anxiety levels the following day.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Calendar className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-sm">Wednesdays tend to be your most stressful day of the week based on your check-in data.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wellness Summary</CardTitle>
                  <CardDescription>
                    Your mental wellness at a glance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Overall Wellness</Label>
                      <span className="text-sm font-medium">{wellnessScore}%</span>
                    </div>
                    <Progress value={wellnessScore} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <Label>Mood Stability</Label>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <Label>Stress Management</Label>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <Label>Sleep Quality</Label>
                      <span className="text-sm font-medium">{sleepQuality * 10}%</span>
                    </div>
                    <Progress value={sleepQuality * 10} className="h-2" />
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Waves className="h-3 w-3 text-primary" />
                        </div>
                        <span>Try a 10-minute meditation before bed to improve sleep quality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Sun className="h-3 w-3 text-primary" />
                        </div>
                        <span>Morning walks can help maintain your positive morning mood throughout the day</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <LineChart className="h-3 w-3 text-primary" />
                        </div>
                        <span>Journal more consistently to better track mood patterns</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Managing Workplace Stress", type: "Article", time: "5 min read" },
                    { title: "Sleep Hygiene Basics", type: "Video", time: "8 min" },
                    { title: "Mindfulness for Beginners", type: "Guide", time: "10 min read" },
                  ].map((resource, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{resource.type}</span>
                          <span className="mx-2">•</span>
                          <span>{resource.time}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">Browse All Resources</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Brain, 
  Calendar, 
  Clock, 
  Download, 
  Heart, 
  LineChart, 
  Moon, 
  Play, 
  PauseCircle,
  RefreshCw, 
  Save, 
  Sun, 
  Volume2,
  Waves,
  Activity,
  Briefcase,
  Check,
  Dumbbell,
  Footprints,
  Trophy,
  Music,
  FlowerIcon,
  Bike,
  Mountain,
  Pencil,
  HeartHandshake as HandHeart,
  Wind,
  BookOpen,
  Flower as Flower2,
  Coffee,
  Users,
  Home,
  UserPlus,
  PartyPopper as PartyIcon,
  CalendarClock,
  Phone,
  Dog as Paw,
  HandHelping as Helping,
  Laptop,
  GraduationCap,
  Palette,
  Utensils,
  Sparkles,
  ShoppingBag,
  Gamepad as Gamepad2,
  Smartphone,
  Plus,
  PenLine,
  Smile,
  CircleOff,
  Gauge,
  CloudRain,
  Zap,
  BedIcon,
  AlertTriangle,
  HelpCircle,
  Tag,
  ArrowRight,
  CalendarDays,
  BarChart,
  HeartPulse,
  XCircle,
  SunMoon,
  Bell,
  Pause,
  Monitor,
  ListChecks,
  Sliders,
  Trees
} from "lucide-react";
import { useDrEcho } from "@/components/ai-assistant/dr-echo-context";
import { generateMentalWellnessResponse } from "@/lib/mentalWellnessRecommendations";
import { AnimatedHeart } from '@/components/ui/animated-heart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Function to render the floating heart icon
function FloatingHeartIcon() {
  return (
    <motion.div
      className="absolute right-8 top-24 z-10 hidden md:block"
      initial={{ y: 0 }}
      animate={{ y: [0, -15, 0] }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <AnimatedHeart 
        size={60} 
        color="rgba(255, 51, 102, 0.8)" 
        pulseColor="rgba(255, 102, 153, 0.8)"
      />
    </motion.div>
  );
}

export default function MentalWellnessPage() {
  const { openAssistant, sendMessage } = useDrEcho();
  const [activeTab, setActiveTab] = useState("assessment");
  const [moodScore, setMoodScore] = useState<number>(7);
  const [anxietyLevel, setAnxietyLevel] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(8);
  const [energyLevel, setEnergyLevel] = useState<number>(6);
  const [focusLevel, setFocusLevel] = useState<number>(7);
  const [journalEntry, setJournalEntry] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [meditationTime, setMeditationTime] = useState(300); // 5 minutes in seconds
  const [remainingTime, setRemainingTime] = useState(300);
  const [selectedSound, setSelectedSound] = useState("rain");
  const [journalMoodScore, setJournalMoodScore] = useState(7);
  const [journalEnergyLevel, setJournalEnergyLevel] = useState(6);
  
  const moodLabels = {
    1: "Very Low",
    3: "Low",
    5: "Neutral",
    7: "Good",
    9: "Excellent"
  };
  
  const anxietyLabels = {
    1: "None",
    3: "Mild",
    5: "Moderate",
    7: "High",
    9: "Severe"
  };
  
  const sleepLabels = {
    1: "Poor",
    3: "Fair",
    5: "Average",
    7: "Good",
    9: "Excellent"
  };
  
  const energyLabels = {
    1: "Exhausted",
    3: "Tired",
    5: "Neutral",
    7: "Energetic",
    9: "Very Energetic"
  };
  
  const focusLabels = {
    1: "Distracted",
    3: "Somewhat Focused",
    5: "Moderately Focused",
    7: "Focused",
    9: "Highly Focused"
  };
  
  const getWellnessScore = () => {
    // Calculate overall wellness score (0-100)
    const moodWeight = 0.25;
    const anxietyWeight = 0.25;
    const sleepWeight = 0.2;
    const energyWeight = 0.15;
    const focusWeight = 0.15;
    
    // Normalize anxiety (lower is better)
    const normalizedAnxiety = 10 - anxietyLevel;
    
    const score = (
      (moodScore * moodWeight) +
      (normalizedAnxiety * anxietyWeight) +
      (sleepQuality * sleepWeight) +
      (energyLevel * energyWeight) +
      (focusLevel * focusWeight)
    ) * 10;
    
    return Math.round(score);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const toggleMeditation = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      
      // Simulate countdown
      const interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return meditationTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  const resetMeditation = () => {
    setIsPlaying(false);
    setRemainingTime(meditationTime);
  };
  
  const setMeditationDuration = (minutes: number) => {
    const seconds = minutes * 60;
    setMeditationTime(seconds);
    setRemainingTime(seconds);
  };
  
  const handleConsultAI = () => {
    // Prepare the message for the AI assistant
    const message = `
I'd like some mental wellness advice based on my current state:

Mood: ${moodScore}/10 (${Object.entries(moodLabels).find(([key]) => Number(key) === moodScore)?.[1] || 'N/A'})
Anxiety Level: ${anxietyLevel}/10 (${Object.entries(anxietyLabels).find(([key]) => Number(key) === anxietyLevel)?.[1] || 'N/A'})
Sleep Quality: ${sleepQuality}/10 (${Object.entries(sleepLabels).find(([key]) => Number(key) === sleepQuality)?.[1] || 'N/A'})
Energy Level: ${energyLevel}/10 (${Object.entries(energyLabels).find(([key]) => Number(key) === energyLevel)?.[1] || 'N/A'})
Focus Level: ${focusLevel}/10 (${Object.entries(focusLabels).find(([key]) => Number(key) === focusLevel)?.[1] || 'N/A'}

Journal Entry: ${journalEntry || 'No journal entry provided'}

Based on this information, could you provide some personalized mental wellness recommendations?
`;
    
    // Open the assistant first
    openAssistant();
    
    // Then send the message directly using the provider's sendMessage function
    // This bypasses the DOM manipulation which could be causing issues
    setTimeout(() => {
      sendMessage(message);
    }, 300);
  };
  
  const wellnessScore = getWellnessScore();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">Mental Wellness</h1>
        <p className="text-muted-foreground mb-8">
          Track, assess, and improve your mental wellbeing
        </p>
      </motion.div>
      
      <FloatingHeartIcon />
      
      <Tabs defaultValue="assessment" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="assessment" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-1">
            <LineChart className="h-4 w-4" />
            Mood Journal
          </TabsTrigger>
          <TabsTrigger value="meditation" className="flex items-center gap-1">
            <Waves className="h-4 w-4" />
            Meditation
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessment">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        repeatType: "reverse"
                      }}
                    >
                      <Heart className="h-6 w-6 text-rose-500" />
                    </motion.div>
                    Daily Wellness Check-in
                  </CardTitle>
                  <CardDescription className="text-base">
                    Rate how you're feeling today to track your mental wellbeing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Mood Slider */}
                  <motion.div 
                    className="mood-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <Sun className="h-5 w-5 text-yellow-500" />
                        Mood
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-blue-200 dark:bg-blue-800"
                        animate={{ 
                          backgroundColor: moodScore > 7 ? ["#bfdbfe", "#93c5fd", "#bfdbfe"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(moodLabels).find(([key]) => Number(key) === moodScore)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="mood-slider-container">
                      <div className="mood-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`mood-segment ${value <= moodScore ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= moodScore ? (0.4 + (value / moodScore) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(59, 130, 246, ${value <= moodScore ? 0.7 : 0.2}), rgba(96, 165, 250, ${value <= moodScore ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setMoodScore(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom" 
                        style={{ left: `calc(${(moodScore - 1) * 10}% + ${moodScore * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={moodScore}
                        onChange={(e) => setMoodScore(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Anxiety Slider */}
                  <motion.div 
                    className="anxiety-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-500" />
                        Anxiety Level
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-orange-200 dark:bg-orange-800"
                        animate={{ 
                          backgroundColor: anxietyLevel < 3 ? ["#fed7aa", "#fdba74", "#fed7aa"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(anxietyLabels).find(([key]) => Number(key) === anxietyLevel)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="anxiety-slider-container">
                      <div className="anxiety-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`anxiety-segment ${value <= anxietyLevel ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= anxietyLevel ? (0.4 + (value / anxietyLevel) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(249, 115, 22, ${value <= anxietyLevel ? 0.7 : 0.2}), rgba(251, 146, 60, ${value <= anxietyLevel ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setAnxietyLevel(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom anxiety-thumb" 
                        style={{ left: `calc(${(anxietyLevel - 1) * 10}% + ${anxietyLevel * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={anxietyLevel}
                        onChange={(e) => setAnxietyLevel(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Sleep Quality Slider */}
                  <motion.div 
                    className="sleep-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <Moon className="h-5 w-5 text-purple-500" />
                        Sleep Quality
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-800"
                        animate={{ 
                          backgroundColor: sleepQuality > 7 ? ["#e9d5ff", "#d8b4fe", "#e9d5ff"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(sleepLabels).find(([key]) => Number(key) === sleepQuality)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="sleep-slider-container">
                      <div className="sleep-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`sleep-segment ${value <= sleepQuality ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= sleepQuality ? (0.4 + (value / sleepQuality) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(139, 92, 246, ${value <= sleepQuality ? 0.7 : 0.2}), rgba(167, 139, 250, ${value <= sleepQuality ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setSleepQuality(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom sleep-thumb" 
                        style={{ left: `calc(${(sleepQuality - 1) * 10}% + ${sleepQuality * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={sleepQuality}
                        onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Energy Level Slider */}
                  <motion.div 
                    className="energy-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-950/30 dark:to-amber-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-yellow-500" />
                        Energy Level
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-yellow-200 dark:bg-yellow-800"
                        animate={{ 
                          backgroundColor: energyLevel > 7 ? ["#fef08a", "#fde047", "#fef08a"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(energyLabels).find(([key]) => Number(key) === energyLevel)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="energy-slider-container">
                      <div className="energy-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`energy-segment ${value <= energyLevel ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= energyLevel ? (0.4 + (value / energyLevel) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(234, 179, 8, ${value <= energyLevel ? 0.7 : 0.2}), rgba(250, 204, 21, ${value <= energyLevel ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setEnergyLevel(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom energy-thumb" 
                        style={{ left: `calc(${(energyLevel - 1) * 10}% + ${energyLevel * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  {/* Focus Level Slider */}
                  <motion.div 
                    className="focus-metric-container relative space-y-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base flex items-center gap-2">
                        <Brain className="h-5 w-5 text-green-500" />
                        Focus Level
                      </Label>
                      <motion.span 
                        className="text-sm font-medium px-3 py-1 rounded-full bg-green-200 dark:bg-green-800"
                        animate={{ 
                          backgroundColor: focusLevel > 7 ? ["#bbf7d0", "#86efac", "#bbf7d0"] : undefined 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Object.entries(focusLabels).find(([key]) => Number(key) === focusLevel)?.[1] || 'N/A'}
                      </motion.span>
                    </div>
                    <div className="focus-slider-container">
                      <div className="focus-indicator-segments">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                          <div 
                            key={value} 
                            className={`focus-segment ${value <= focusLevel ? 'active' : ''}`}
                            style={{ 
                              opacity: value <= focusLevel ? (0.4 + (value / focusLevel) * 0.6) : 0.2,
                              background: `linear-gradient(to right, rgba(34, 197, 94, ${value <= focusLevel ? 0.7 : 0.2}), rgba(74, 222, 128, ${value <= focusLevel ? 0.7 : 0.2}))`
                            }}
                            onClick={() => setFocusLevel(value)}
                          />
                        ))}
                      </div>
                      <div 
                        className="slider-thumb-custom focus-thumb" 
                        style={{ left: `calc(${(focusLevel - 1) * 10}% + ${focusLevel * 0.5 - 0.5}%)` }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={focusLevel}
                        onChange={(e) => setFocusLevel(parseInt(e.target.value))}
                        className="hidden-range-input"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="wellness-activity-tracker mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-950/40 dark:to-indigo-950/20 shadow-md border border-blue-100/50 dark:border-indigo-900/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                      <Calendar className="h-5 w-5 text-indigo-500" />
                      Activities That Influenced Your Mood Today
                    </h3>

                    <div className="activity-categories space-y-6">
                      {/* Physical Section */}
                      <div className="activity-category">
                        <h4 className="text-sm font-medium mb-2 text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                          <Activity className="h-4 w-4" />
                          Physical
                        </h4>
                        <div className="activities-grid grid grid-cols-2 gap-2 md:grid-cols-4">
                          {[
                            { name: "Exercise", icon: <Dumbbell className="h-3.5 w-3.5" /> },
                            { name: "Walking", icon: <Footprints className="h-3.5 w-3.5" /> },
                            { name: "Sports", icon: <Trophy className="h-3.5 w-3.5" /> },
                            { name: "Dancing", icon: <Music className="h-3.5 w-3.5" /> },
                            { name: "Yoga", icon: <FlowerIcon className="h-3.5 w-3.5" /> },
                            { name: "Cycling", icon: <Bike className="h-3.5 w-3.5" /> },
                            { name: "Hiking", icon: <Mountain className="h-3.5 w-3.5" /> },
                            { name: "Swimming", icon: <Waves className="h-3.5 w-3.5" /> }
                          ].map((activity) => (
                            <div key={activity.name} className="activity-item">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-sm border border-transparent hover:border-blue-100 dark:hover:border-indigo-900/30">
                                <div className="activity-checkbox">
                                  <input type="checkbox" className="peer hidden" />
                                  <div className="checkbox-display w-5 h-5 rounded-md border-2 border-blue-400/60 dark:border-indigo-500/60 flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-blue-400 peer-checked:to-indigo-500 transition-all duration-200 peer-checked:border-0">
                                    <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>
                                <div className="activity-info flex items-center gap-1.5">
                                  <div className="icon-circle w-5 h-5 rounded-full bg-blue-100 dark:bg-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-indigo-300">
                                    {activity.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{activity.name}</span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mental & Wellness Section */}
                      <div className="activity-category">
                        <h4 className="text-sm font-medium mb-2 text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                          <Brain className="h-4 w-4" />
                          Mental & Wellness
                        </h4>
                        <div className="activities-grid grid grid-cols-2 gap-2 md:grid-cols-4">
                          {[
                            { name: "Meditation", icon: <FlowerIcon className="h-3.5 w-3.5" /> },
                            { name: "Good Sleep", icon: <Moon className="h-3.5 w-3.5" /> },
                            { name: "Journaling", icon: <Pencil className="h-3.5 w-3.5" /> },
                            { name: "Therapy", icon: <HandHeart className="h-3.5 w-3.5" /> },
                            { name: "Deep Breathing", icon: <Wind className="h-3.5 w-3.5" /> },
                            { name: "Reading", icon: <BookOpen className="h-3.5 w-3.5" /> },
                            { name: "Nature Time", icon: <Flower2 className="h-3.5 w-3.5" /> },
                            { name: "Relaxation", icon: <Coffee className="h-3.5 w-3.5" /> }
                          ].map((activity) => (
                            <div key={activity.name} className="activity-item">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-sm border border-transparent hover:border-purple-100 dark:hover:border-indigo-900/30">
                                <div className="activity-checkbox">
                                  <input type="checkbox" className="peer hidden" />
                                  <div className="checkbox-display w-5 h-5 rounded-md border-2 border-purple-400/60 dark:border-indigo-500/60 flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-purple-400 peer-checked:to-indigo-500 transition-all duration-200 peer-checked:border-0">
                                    <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>
                                <div className="activity-info flex items-center gap-1.5">
                                  <div className="icon-circle w-5 h-5 rounded-full bg-purple-100 dark:bg-indigo-900/40 flex items-center justify-center text-purple-600 dark:text-indigo-300">
                                    {activity.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{activity.name}</span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Social Section */}
                      <div className="activity-category">
                        <h4 className="text-sm font-medium mb-2 text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          Social
                        </h4>
                        <div className="activities-grid grid grid-cols-2 gap-2 md:grid-cols-4">
                          {[
                            { name: "Family Time", icon: <Home className="h-3.5 w-3.5" /> },
                            { name: "Friends", icon: <UserPlus className="h-3.5 w-3.5" /> },
                            { name: "Date Night", icon: <Heart className="h-3.5 w-3.5" /> },
                            { name: "Party", icon: <PartyIcon className="h-3.5 w-3.5" /> },
                            { name: "Social Event", icon: <CalendarClock className="h-3.5 w-3.5" /> },
                            { name: "Phone Call", icon: <Phone className="h-3.5 w-3.5" /> },
                            { name: "Pet Time", icon: <Paw className="h-3.5 w-3.5" /> },
                            { name: "Volunteer", icon: <Helping className="h-3.5 w-3.5" /> }
                          ].map((activity) => (
                            <div key={activity.name} className="activity-item">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-sm border border-transparent hover:border-pink-100 dark:hover:border-indigo-900/30">
                                <div className="activity-checkbox">
                                  <input type="checkbox" className="peer hidden" />
                                  <div className="checkbox-display w-5 h-5 rounded-md border-2 border-pink-400/60 dark:border-indigo-500/60 flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-pink-400 peer-checked:to-rose-500 transition-all duration-200 peer-checked:border-0">
                                    <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>
                                <div className="activity-info flex items-center gap-1.5">
                                  <div className="icon-circle w-5 h-5 rounded-full bg-pink-100 dark:bg-indigo-900/40 flex items-center justify-center text-pink-600 dark:text-indigo-300">
                                    {activity.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{activity.name}</span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Work & Life Section */}
                      <div className="activity-category">
                        <h4 className="text-sm font-medium mb-2 text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          Work & Life
                        </h4>
                        <div className="activities-grid grid grid-cols-2 gap-2 md:grid-cols-4">
                          {[
                            { name: "Work", icon: <Laptop className="h-3.5 w-3.5" /> },
                            { name: "Study", icon: <GraduationCap className="h-3.5 w-3.5" /> },
                            { name: "Hobbies", icon: <Palette className="h-3.5 w-3.5" /> },
                            { name: "Cooking", icon: <Utensils className="h-3.5 w-3.5" /> },
                            { name: "Cleaning", icon: <Sparkles className="h-3.5 w-3.5" /> },
                            { name: "Shopping", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
                            { name: "Gaming", icon: <Gamepad2 className="h-3.5 w-3.5" /> },
                            { name: "Screen Time", icon: <Smartphone className="h-3.5 w-3.5" /> }
                          ].map((activity) => (
                            <div key={activity.name} className="activity-item">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-sm border border-transparent hover:border-green-100 dark:hover:border-indigo-900/30">
                                <div className="activity-checkbox">
                                  <input type="checkbox" className="peer hidden" />
                                  <div className="checkbox-display w-5 h-5 rounded-md border-2 border-green-400/60 dark:border-indigo-500/60 flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-green-400 peer-checked:to-emerald-500 transition-all duration-200 peer-checked:border-0">
                                    <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>
                                <div className="activity-info flex items-center gap-1.5">
                                  <div className="icon-circle w-5 h-5 rounded-full bg-green-100 dark:bg-indigo-900/40 flex items-center justify-center text-green-600 dark:text-indigo-300">
                                    {activity.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{activity.name}</span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="custom-activity mt-6 flex flex-col md:flex-row gap-3">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          placeholder="Add a custom activity..." 
                          className="w-full px-4 py-2.5 rounded-lg border border-blue-200 dark:border-indigo-900/30 bg-white/70 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 dark:focus:ring-indigo-500/50 focus:border-transparent placeholder-gray-400/70"
                        />
                        <PenLine className="absolute right-3.5 top-3 h-4 w-4 text-indigo-400/70" />
                      </div>
                      <button className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition-all">
                        <Plus className="h-4 w-4" />
                        <span>Add Activity</span>
                      </button>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-end space-x-2"
                    whileInView={{ opacity: [0, 1], y: [20, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setMoodScore(7);
                        setAnxietyLevel(3);
                        setSleepQuality(8);
                        setEnergyLevel(6);
                        setFocusLevel(7);
                      }}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Check-in
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="wellness-score-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-900/20 border-b border-indigo-100 dark:border-indigo-800/20">
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="relative"
                    >
                      <Heart className="h-5 w-5 text-pink-500" />
                    </motion.div>
                    Wellness Score
                  </CardTitle>
                  <CardDescription>
                    Your overall mental wellness rating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative h-44 w-44">
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <motion.div 
                          className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [0.8, 1.1, 1] }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                        >
                          {wellnessScore}
                        </motion.div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">out of 100</div>
                      </div>
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        {/* Gradient background for the ring */}
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={wellnessScore >= 80 ? "#4ade80" : wellnessScore >= 60 ? "#60a5fa" : wellnessScore >= 40 ? "#facc15" : "#f87171"} />
                            <stop offset="100%" stopColor={wellnessScore >= 80 ? "#22c55e" : wellnessScore >= 60 ? "#3b82f6" : wellnessScore >= 40 ? "#eab308" : "#ef4444"} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Background ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(203, 213, 225, 0.3)"
                          strokeWidth="10"
                          className="dark:opacity-30"
                        />
                        
                        {/* Score ring with gradient and animation */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#scoreGradient)"
                          strokeWidth="10"
                          strokeDasharray={`${(wellnessScore / 100) * 283} 283`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                          filter="url(#glow)"
                          initial={{ strokeDasharray: "0 283" }}
                          animate={{ strokeDasharray: `${(wellnessScore / 100) * 283} 283` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                    </div>
                    <motion.div 
                      className="wellness-rating-badge mt-2 px-4 py-1 rounded-full text-white font-medium text-sm"
                      style={{ 
                        background: `linear-gradient(to right, ${
                          wellnessScore >= 80 ? "#4ade80, #22c55e" : 
                          wellnessScore >= 60 ? "#60a5fa, #3b82f6" : 
                          wellnessScore >= 40 ? "#facc15, #eab308" : 
                          "#f87171, #ef4444"
                        })`
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      {wellnessScore >= 80 ? "Excellent" : 
                       wellnessScore >= 60 ? "Good" : 
                       wellnessScore >= 40 ? "Fair" : 
                       "Needs Attention"}
                    </motion.div>
                  </motion.div>
                  
                  <div className="space-y-3 wellness-stats mt-4">
                    <motion.div 
                      className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(219, 234, 254, 0.8)" }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Last check-in</span>
                      </div>
                      <span className="font-medium text-sm">Today, 9:41 AM</span>
                    </motion.div>
                    <motion.div 
                      className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(209, 250, 229, 0.8)" }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-green-500" />
                        <span className="text-sm">7-day trend</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.div 
                          initial={{ y: 0 }}
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3L20 13H4L12 3Z" fill="#22c55e" />
                          </svg>
                        </motion.div>
                        <span className="font-medium text-sm text-green-600 dark:text-green-400">+5 points</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="wellness-recommendation mt-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Based on your patterns:</p>
                    <div className="p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/10 border border-purple-100 dark:border-purple-900/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Tip:</span> Your mood is typically highest in the morning. Consider scheduling important activities during this time.
                      </p>
                    </div>
                  </motion.div>
                  
                  <Button 
                    onClick={handleConsultAI} 
                    className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md"
                  >
                    <motion.div
                      className="mr-2 h-5 w-5"
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="h-5 w-5" />
                    </motion.div>
                    Get AI Recommendations
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("meditation")}>
                    <Waves className="mr-2 h-4 w-4" />
                    Start Meditation
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("journal")}>
                    <LineChart className="mr-2 h-4 w-4" />
                    Write in Journal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Therapy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="journal">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="journal-card overflow-hidden border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-900/20 border-b border-rose-100 dark:border-purple-800/20">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                        >
                          <BookOpen className="h-5 w-5 text-rose-500" />
                        </motion.div>
                        Mood Journal
                      </CardTitle>
                      <CardDescription className="text-base">
                        Express your thoughts and feelings to track your emotional wellbeing
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6 relative">
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br from-purple-100/30 to-blue-100/20 dark:from-purple-900/10 dark:to-blue-900/5 blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-gradient-to-tr from-rose-100/20 to-amber-100/10 dark:from-rose-900/10 dark:to-amber-900/5 blur-3xl -z-10"></div>
                    
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <Label className="text-lg font-medium text-gray-800 dark:text-gray-200">How are you feeling today?</Label>
                      <div className="flex justify-between mb-2 bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg shadow-sm backdrop-blur-sm">
                        <div className="flex items-center">
                          <motion.div
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, repeatType: "loop" }}
                          >
                            <Sun className="h-5 w-5 text-amber-500 mr-2" />
                          </motion.div>
                          <Select defaultValue="morning">
                            <SelectTrigger className="w-[130px] border-0 bg-transparent">
                              <SelectValue placeholder="Time of day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="afternoon">Afternoon</SelectItem>
                              <SelectItem value="evening">Evening</SelectItem>
                              <SelectItem value="night">Night</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <motion.span 
                          className="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </motion.span>
                      </div>
                      <Textarea 
                        placeholder="Write about your thoughts, feelings, and experiences..." 
                        className="min-h-[200px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-100 dark:border-purple-800/30 focus:ring-2 focus:ring-purple-400/50 dark:focus:ring-purple-500/50 focus:border-transparent shadow-sm transition-all resize-y"
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                      />
                      
                      {/* Word count and emotion detection */}
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{journalEntry.length > 0 ? `${journalEntry.split(/\s+/).filter(Boolean).length} words` : "0 words"}</span>
                        <span className="flex items-center gap-1">
                          <HeartPulse className="h-3 w-3 text-rose-500" />
                          {journalEntry.length > 20 ? "Detected emotions: Thoughtful, Reflective" : "Write more to detect emotions"}
                        </span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-medium flex items-center gap-1">
                          <Tag className="h-4 w-4 text-indigo-500" />
                          Mood Tags
                        </Label>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Custom Tag
                        </Button>
                      </div>
                      <div className="mood-tags-container bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg backdrop-blur-sm">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: "Happy", color: "bg-gradient-to-r from-yellow-400 to-amber-500", icon: <Smile className="h-3 w-3" /> },
                            { name: "Calm", color: "bg-gradient-to-r from-blue-400 to-cyan-500", icon: <CircleOff className="h-3 w-3" /> },
                            { name: "Anxious", color: "bg-gradient-to-r from-orange-400 to-amber-500", icon: <Gauge className="h-3 w-3" /> },
                            { name: "Sad", color: "bg-gradient-to-r from-blue-400 to-indigo-500", icon: <CloudRain className="h-3 w-3" /> },
                            { name: "Energetic", color: "bg-gradient-to-r from-green-400 to-emerald-500", icon: <Zap className="h-3 w-3" /> },
                            { name: "Tired", color: "bg-gradient-to-r from-slate-400 to-gray-500", icon: <BedIcon className="h-3 w-3" /> },
                            { name: "Stressed", color: "bg-gradient-to-r from-red-400 to-rose-500", icon: <AlertTriangle className="h-3 w-3" /> },
                            { name: "Grateful", color: "bg-gradient-to-r from-purple-400 to-violet-500", icon: <Heart className="h-3 w-3" /> },
                            { name: "Frustrated", color: "bg-gradient-to-r from-rose-400 to-red-500", icon: <XCircle className="h-3 w-3" /> },
                            { name: "Hopeful", color: "bg-gradient-to-r from-emerald-400 to-green-500", icon: <SunMoon className="h-3 w-3" /> },
                            { name: "Excited", color: "bg-gradient-to-r from-pink-400 to-rose-500", icon: <Sparkles className="h-3 w-3" /> },
                            { name: "Confused", color: "bg-gradient-to-r from-violet-400 to-purple-500", icon: <HelpCircle className="h-3 w-3" /> }
                          ].map((tag) => (
                            <motion.div 
                              key={tag.name} 
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`rounded-full text-white shadow-sm px-3 py-1 h-auto ${tag.color} border-0 hover:shadow-md transition-all`}
                              >
                                <span className="flex items-center gap-1">
                                  {tag.icon}
                                  {tag.name}
                                </span>
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      className="space-y-4" 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                      <Label className="text-base font-medium flex items-center gap-1">
                        <Activity className="h-4 w-4 text-indigo-500" />
                        Rate Your Day (1-10)
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium flex items-center gap-1">
                              <Sun className="h-3.5 w-3.5 text-amber-500" />
                              Overall Mood
                            </span>
                            <span className="text-sm font-bold">{journalMoodScore}/10</span>
                          </div>
                          <Slider 
                            min={1} 
                            max={10} 
                            step={1} 
                            value={[journalMoodScore]} 
                            onValueChange={(value) => setJournalMoodScore(value[0])}
                            className="mood-slider"
                          />
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5 text-yellow-500" />
                              Energy Level
                            </span>
                            <span className="text-sm font-bold">{journalEnergyLevel}/10</span>
                          </div>
                          <Slider 
                            min={1} 
                            max={10} 
                            step={1} 
                            value={[journalEnergyLevel]} 
                            onValueChange={(value) => setJournalEnergyLevel(value[0])}
                            className="energy-slider"
                          />
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-end space-x-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <Button 
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </Button>
                      <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md transition-all">
                        <Download className="mr-2 h-4 w-4" />
                        Save Entry
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="shadow-md border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 border-b border-indigo-100 dark:border-indigo-800/20">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-indigo-500" />
                      Journal Insights
                    </CardTitle>
                    <CardDescription>
                      Track your mood patterns over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="h-48 w-full bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 journal-chart-placeholder relative overflow-hidden">
                      <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-indigo-500" />
                        Emotion Patterns
                      </h4>
                      
                      <div className="relative h-32">
                        {/* Placeholder chart with gradient bars */}
                        <div className="flex h-full items-end justify-between px-1">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                            <div key={day} className="flex flex-col items-center">
                              <div 
                                className="w-7 rounded-t-md bg-gradient-to-t transition-all" 
                                style={{
                                  height: `${[60, 45, 75, 35, 80, 65, 50][i]}%`,
                                  background: `linear-gradient(to top, 
                                    ${[
                                      "from-blue-400 to-indigo-500", 
                                      "from-amber-400 to-orange-500", 
                                      "from-green-400 to-emerald-500", 
                                      "from-orange-400 to-red-500", 
                                      "from-yellow-400 to-amber-500", 
                                      "from-indigo-400 to-purple-500", 
                                      "from-green-400 to-teal-500"
                                    ][i]})`,
                                  animationDelay: `${i * 0.1}s`
                                }}
                                className={`w-7 rounded-t-md animate-[height] bg-gradient-to-t transition-all`}
                              />
                              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">{day}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Legend */}
                        <div className="absolute top-1 right-1">
                          <div className="flex items-center justify-end space-x-3">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mr-1"></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Happy</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mr-1"></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Calm</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 mr-1"></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Stress</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Overlay for empty state */}
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-[1px]"
                          initial={{ opacity: 1 }}
                          whileHover={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="text-center text-sm text-muted-foreground p-3">
                            <p>Your mood trends will appear here as you add more journal entries</p>
                            <p className="text-xs mt-1 text-indigo-500">Hover to preview</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Journal History</h4>
                      <div className="space-y-4">
                        {[
                          { 
                            date: "Yesterday", 
                            time: "9:30 PM", 
                            mood: "Calm", 
                            score: 7,
                            preview: "Today was a productive day at work. I managed to finish the project ahead of schedule." 
                          },
                          { 
                            date: "May 10, 2025", 
                            time: "8:15 AM", 
                            mood: "Anxious", 
                            score: 4,
                            preview: "Feeling a bit nervous about the presentation today. Hope it goes well." 
                          },
                          { 
                            date: "May 8, 2025", 
                            time: "10:45 PM", 
                            mood: "Happy", 
                            score: 9,
                            preview: "Had a wonderful dinner with friends. We talked about our plans for the summer." 
                          },
                        ].map((entry, index) => (
                          <motion.div 
                            key={index} 
                            className="border-b pb-4 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-900/20 p-2 rounded-lg transition-colors cursor-pointer"
                            whileHover={{ x: 3 }}
                          >
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{entry.date}</span>
                              <span className="text-xs text-muted-foreground">{entry.time}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              <div className={`h-2 w-2 rounded-full mr-2 ${
                                entry.score >= 8 ? "bg-green-500" : 
                                entry.score >= 5 ? "bg-blue-500" : 
                                "bg-orange-500"
                              }`} />
                              <span className="text-xs font-medium">{entry.mood}</span>
                              <div className="ml-auto flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div 
                                    key={i}
                                    className={`h-1 w-1 rounded-full mx-0.5 ${
                                      i < Math.ceil(entry.score / 2) ? 
                                      "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{entry.preview}</p>
                          </motion.div>
                        ))}
                      </div>
                      
                      <Button variant="outline" className="w-full group">
                        <span className="flex items-center">
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="mr-2 opacity-70 group-hover:opacity-100"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.div>
                          View All Entries
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="meditation">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-900/20 border-b border-green-100 dark:border-teal-800/20">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                        >
                          <Waves className="h-5 w-5 text-teal-500" />
                        </motion.div>
                        Guided Meditation
                      </CardTitle>
                      <CardDescription className="text-base">
                        Take a moment to relax and focus on your breathing
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6 relative">
                    <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-gradient-to-br from-teal-100/30 to-green-100/20 dark:from-teal-900/10 dark:to-green-900/5 blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-gradient-to-tr from-emerald-100/20 to-blue-100/10 dark:from-emerald-900/10 dark:to-blue-900/5 blur-3xl -z-10"></div>
                    
                    <motion.div 
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative h-64 w-64">
                        {/* Meditation theme selector */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                          <Select defaultValue="breathing">
                            <SelectTrigger className="w-[180px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-teal-200 dark:border-green-900/30 focus:ring-2 focus:ring-green-400/50">
                              <SelectValue placeholder="Meditation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="breathing">Deep Breathing</SelectItem>
                              <SelectItem value="body-scan">Body Scan</SelectItem>
                              <SelectItem value="mindfulness">Mindfulness</SelectItem>
                              <SelectItem value="gratitude">Gratitude</SelectItem>
                              <SelectItem value="visualization">Visualization</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Timer display */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <motion.div 
                            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-green-500"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.1, 1] }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                          >
                            {formatTime(remainingTime)}
                          </motion.div>
                        </div>
                        
                        {/* Circular progress */}
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id="meditationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#4ade80" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                            <filter id="meditation-glow">
                              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          
                          {/* Background ring */}
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(203, 213, 225, 0.3)"
                            strokeWidth="10"
                            className="dark:opacity-30"
                          />
                          
                          {/* Progress ring with gradient and animation */}
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#meditationGradient)"
                            strokeWidth="10"
                            strokeDasharray="283"
                            strokeDashoffset={`${(1 - remainingTime / meditationTime) * 283}`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                            filter="url(#meditation-glow)"
                            animate={isPlaying ? { strokeDashoffset: (1 - 0 / meditationTime) * 283 } : {}}
                            transition={{ duration: meditationTime, ease: "linear" }}
                            className="meditation-timer-ring"
                          />
                        </svg>
                        
                        {/* Breathing animation */}
                        {isPlaying && (
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.3, 0.7] }}
                            transition={{ 
                              duration: 4, 
                              repeat: Infinity, 
                              repeatType: "reverse",
                              ease: "easeInOut" 
                            }}
                          >
                            <div className="h-36 w-36 rounded-full bg-gradient-to-r from-teal-400/20 to-green-400/10 backdrop-blur-sm meditation-breath-circle" />
                          </motion.div>
                        )}
                        
                        {/* Prompt text for breathing */}
                        {isPlaying && (
                          <motion.div 
                            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center w-full"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
                              {Math.floor(remainingTime) % 8 < 4 ? "Breathe in..." : "Breathe out..."}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-center space-x-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={resetMeditation}
                        className="rounded-full h-12 w-12 border-green-200 dark:border-green-900/30 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <RefreshCw className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </Button>
                      
                      <Button 
                        size="lg" 
                        onClick={toggleMeditation}
                        className="rounded-full px-6 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 min-w-[140px]"
                      >
                        {isPlaying ? (
                          <>
                            <motion.div
                              animate={{ scale: [1, 0.85, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <PauseCircle className="mr-2 h-5 w-5" />
                            </motion.div>
                            Pause
                          </>
                        ) : (
                          <>
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Play className="mr-2 h-5 w-5" />
                            </motion.div>
                            Start
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-5 pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          Duration
                        </Label>
                        <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80 meditation-badge">
                          {meditationTime / 60} minutes
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-6 gap-3">
                        {[1, 3, 5, 10, 15, 20].map((minutes) => (
                          <motion.div 
                            key={minutes} 
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              variant={meditationTime === minutes * 60 ? "default" : "outline"}
                              onClick={() => setMeditationDuration(minutes)}
                              className={`w-full ${
                                meditationTime === minutes * 60 
                                  ? "bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-md border-0" 
                                  : "border-teal-200 dark:border-teal-900/20 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/10"
                              }`}
                            >
                              {minutes} min
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="pt-2 space-y-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.0 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-medium flex items-center gap-1">
                          <Volume2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          Ambient Sound
                        </Label>
                        <Button variant="ghost" size="sm">
                          <Volume className="h-3.5 w-3.5 mr-1" />
                          Preview
                        </Button>
                      </div>
                      
                      <RadioGroup value={selectedSound} onValueChange={setSelectedSound} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { value: "rain", label: "Rain", icon: <CloudRain className="mb-2 h-5 w-5 text-blue-500" /> },
                          { value: "forest", label: "Forest", icon: <Trees className="mb-2 h-5 w-5 text-green-500" /> },
                          { value: "ocean", label: "Ocean", icon: <Waves className="mb-2 h-5 w-5 text-cyan-500" /> },
                          { value: "white-noise", label: "White Noise", icon: <Volume2 className="mb-2 h-5 w-5 text-gray-500" /> }
                        ].map((sound) => (
                          <div key={sound.value}>
                            <RadioGroupItem value={sound.value} id={sound.value} className="peer sr-only" />
                            <Label
                              htmlFor={sound.value}
                              className={`flex flex-col items-center justify-between rounded-xl border-2 border-teal-200/50 dark:border-teal-900/30 bg-white/80 dark:bg-slate-800/80 p-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-400/50 dark:hover:border-teal-700/50 peer-data-[state=checked]:border-teal-500 dark:peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50 dark:peer-data-[state=checked]:bg-teal-900/20 [&:has([data-state=checked])]:border-teal-500 transition-all cursor-pointer ambient-sound-card ${selectedSound === sound.value ? 'selected' : ''}`}
                            >
                              {sound.icon}
                              {sound.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </motion.div>
                    
                    <motion.div 
                      className="pt-2 space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.2 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-medium flex items-center gap-1">
                          <Sliders className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          Settings
                        </Label>
                      </div>
                      
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg">
                          <span className="text-sm flex items-center gap-2">
                            <Bell className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Bell sound at end
                          </span>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg">
                          <span className="text-sm flex items-center gap-2">
                            <Pause className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Interval bells
                          </span>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg">
                          <span className="text-sm flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Keep screen on
                          </span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="shadow-md border-0 overflow-hidden meditation-stats-card">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-900/20 border-b border-teal-100 dark:border-emerald-800/20">
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-teal-500" />
                      Meditation Stats
                    </CardTitle>
                    <CardDescription>
                      Your meditation journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        className="bg-gradient-to-br from-teal-500/10 to-green-500/5 dark:from-teal-900/30 dark:to-green-900/20 shadow-sm rounded-xl p-4 text-center flex flex-col justify-center"
                        whileHover={{ y: -3, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm text-teal-700 dark:text-teal-300 mb-1 font-medium">Total Sessions</p>
                        <motion.p 
                          className="text-3xl font-bold text-teal-900 dark:text-teal-50"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          24
                        </motion.p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/30 dark:to-teal-900/20 shadow-sm rounded-xl p-4 text-center flex flex-col justify-center"
                        whileHover={{ y: -3, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1 font-medium">Total Minutes</p>
                        <motion.p 
                          className="text-3xl font-bold text-emerald-900 dark:text-emerald-50"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                        >
                          187
                        </motion.p>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-teal-500" />
                          Current streak
                        </h4>
                        <Badge className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white border-0">3 days</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-muted-foreground">Last session</span>
                          <span className="text-sm font-medium">Today, 9:30 AM</span>
                        </div>
                        <div className="flex flex-col space-y-1 items-end">
                          <span className="text-xs text-muted-foreground">Longest streak</span>
                          <span className="text-sm font-medium">5 days</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Weekly goal: 5 sessions</span>
                        <span className="text-xs font-medium">3/5</span>
                      </div>
                      
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-teal-500 to-green-500 h-full rounded-full"
                          style={{ width: '60%' }}
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 1, delay: 1 }}
                        />
                      </div>
                    </motion.div>
                    
                    <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-teal-500" />
                          Weekly Activity
                        </h4>
                      </div>
                      
                      <div className="px-4 py-3 flex justify-between">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <div key={day} className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-2">{day}</span>
                            <motion.div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                [0, 2, 4].includes(i) 
                                  ? 'bg-gradient-to-br from-teal-500 to-green-500 text-white' 
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5, delay: 0.9 + (i * 0.05) }}
                            >
                              {[0, 2, 4].includes(i) && <Check className="h-3 w-3" />}
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <motion.div
                      className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <LineChart className="h-4 w-4 text-teal-500" />
                          Monthly Progress
                        </h4>
                        <Badge variant="outline" className="text-xs">May 2025</Badge>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {Array.from({ length: 31 }).map((_, i) => {
                          // Define meditation intensity: 0 = none, 1 = short, 2 = medium, 3 = long
                          const intensity = [1, 3, 5, 7, 10, 12, 15, 18, 20, 22, 25, 28].includes(i) 
                            ? Math.floor(Math.random() * 3) + 1 
                            : 0;
                          
                          return (
                            <motion.div
                              key={i}
                              className={`w-full aspect-square rounded-sm ${
                                intensity === 0 
                                  ? 'bg-gray-200 dark:bg-gray-700' 
                                  : intensity === 1
                                    ? 'bg-teal-300/30 dark:bg-teal-700/30'
                                    : intensity === 2
                                      ? 'bg-teal-400/60 dark:bg-teal-600/60'
                                      : 'bg-teal-500 dark:bg-teal-500'
                              }`}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 1.2 + (i * 0.01) }}
                              whileHover={{ scale: 1.2 }}
                              title={`Day ${i+1}: ${
                                intensity === 0 
                                  ? 'No meditation' 
                                  : intensity === 1
                                    ? '5 min meditation'
                                    : intensity === 2
                                      ? '10 min meditation'
                                      : '15+ min meditation'
                              }`}
                            />
                          );
                        })}
                      </div>
                      
                      <div className="flex items-center justify-end mt-3 gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
                          <span className="text-xs text-muted-foreground">None</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-teal-300/30 dark:bg-teal-700/30"></div>
                          <span className="text-xs text-muted-foreground">5 min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-teal-400/60 dark:bg-teal-600/60"></div>
                          <span className="text-xs text-muted-foreground">10 min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-teal-500"></div>
                          <span className="text-xs text-muted-foreground">15+ min</span>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="shadow-md border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-900/20 border-b border-cyan-100 dark:border-blue-800/20">
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-cyan-500" />
                      Recommended Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-1">
                    {[
                      { 
                        title: "Stress Relief", 
                        description: "Calm your mind and release tension",
                        duration: "10 min", 
                        type: "Guided",
                        level: "Beginner",
                        color: "from-blue-500 to-cyan-500"
                      },
                      { 
                        title: "Better Sleep", 
                        description: "Relax your body and prepare for rest",
                        duration: "15 min", 
                        type: "Guided",
                        level: "All Levels",
                        color: "from-indigo-500 to-purple-500"
                      },
                      { 
                        title: "Focus & Concentration", 
                        description: "Enhance mental clarity and attention",
                        duration: "5 min", 
                        type: "Unguided",
                        level: "Intermediate",
                        color: "from-amber-500 to-orange-500"
                      },
                    ].map((session, index) => (
                      <motion.div 
                        key={index}
                        className="mb-4 overflow-hidden rounded-xl bg-white/60 dark:bg-slate-800/60 shadow-sm hover:shadow-md transition-all cursor-pointer session-card"
                        whileHover={{ y: -3, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 + (index * 0.2) }}
                      >
                        <div className="relative">
                          <div className={`h-1.5 w-full bg-gradient-to-r ${session.color}`}></div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-sm">{session.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{session.description}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 dark:bg-slate-700/80 rounded-full shadow-sm -mt-1 -mr-1">
                                <Play className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-teal-500" />
                                  {session.duration}
                                </span>
                                <span className="flex items-center">
                                  <Headphones className="h-3 w-3 mr-1 text-teal-500" />
                                  {session.type}
                                </span>
                              </div>
                              <Badge variant="outline" className="h-5 text-xs font-normal">
                                {session.level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    <Button variant="ghost" className="w-full mt-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 group">
                      <span className="flex items-center">
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="mr-2 opacity-70 group-hover:opacity-100"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                        Explore More Sessions
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wellness Trends</CardTitle>
                  <CardDescription>
                    Your mental wellness patterns over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Wellness trend chart will appear here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Mood Patterns</CardTitle>
                  <CardDescription>
                    Insights into your emotional patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Weekly Mood Distribution</h3>
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Mood distribution chart will appear here</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Time of Day Analysis</h3>
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Time of day chart will appear here</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Key Insights</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Sun className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-sm">Your mood tends to be highest in the morning and gradually decreases throughout the day.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Moon className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-sm">Sleep quality has a strong correlation with your anxiety levels the following day.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Calendar className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-sm">Wednesdays tend to be your most stressful day of the week based on your check-in data.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wellness Summary</CardTitle>
                  <CardDescription>
                    Your mental wellness at a glance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Overall Wellness</Label>
                      <span className="text-sm font-medium">{wellnessScore}%</span>
                    </div>
                    <Progress value={wellnessScore} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <Label>Mood Stability</Label>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <Label>Stress Management</Label>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <Label>Sleep Quality</Label>
                      <span className="text-sm font-medium">{sleepQuality * 10}%</span>
                    </div>
                    <Progress value={sleepQuality * 10} className="h-2" />
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Waves className="h-3 w-3 text-primary" />
                        </div>
                        <span>Try a 10-minute meditation before bed to improve sleep quality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Sun className="h-3 w-3 text-primary" />
                        </div>
                        <span>Morning walks can help maintain your positive morning mood throughout the day</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <LineChart className="h-3 w-3 text-primary" />
                        </div>
                        <span>Journal more consistently to better track mood patterns</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Managing Workplace Stress", type: "Article", time: "5 min read" },
                    { title: "Sleep Hygiene Basics", type: "Video", time: "8 min" },
                    { title: "Mindfulness for Beginners", type: "Guide", time: "10 min read" },
                  ].map((resource, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{resource.type}</span>
                          <span className="mx-2">•</span>
                          <span>{resource.time}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">Browse All Resources</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}