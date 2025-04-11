"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SymptomsTracker from "./components/SymptomsTracker";
import CycleVisualizer from "./components/CycleVisualizer";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Calendar as CalendarIcon, Award, TrendingUp, AlertCircle, BookOpen, MessageCircle, PlusCircle, Heart, Sparkles, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CycleDay {
  date: Date;
  flow: "light" | "medium" | "heavy";
  symptoms: string[];
  painLevel: number;
  mood: string;
  notes?: string;
}

interface Insight {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function MenstruationTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [flow, setFlow] = useState<"light" | "medium" | "heavy">("medium");
  const [mood, setMood] = useState<string>("normal");
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [lastPeriodStart, setLastPeriodStart] = useState<Date | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentCycleDay, setCurrentCycleDay] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(false);

  useEffect(() => {
    if (lastPeriodStart) {
      const today = new Date();
      const daysSinceStart = Math.floor(
        (today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const currentDay = (daysSinceStart % cycleLength) + 1;
      setCurrentCycleDay(currentDay);
    }
  }, [lastPeriodStart, cycleLength]);

  const calculateFertilityWindow = () => {
    if (!lastPeriodStart) return null;
    
    const ovulationDay = new Date(lastPeriodStart);
    ovulationDay.setDate(lastPeriodStart.getDate() + Math.floor(cycleLength / 2) - 14);
    
    const fertilityStart = new Date(ovulationDay);
    fertilityStart.setDate(ovulationDay.getDate() - 5);
    
    const fertilityEnd = new Date(ovulationDay);
    fertilityEnd.setDate(ovulationDay.getDate() + 1);
    
    return {
      ovulationDay,
      fertilityStart,
      fertilityEnd,
    };
  };

  // Generate random insights based on the data (for demonstration)
  const generateInsights = (): Insight[] => {
    if (cycleDays.length < 3) {
      return [
        {
          title: "Keep Tracking",
          description: "Add at least 3 cycle days to get personalized insights",
          icon: <TrendingUp />,
          color: "bg-blue-500"
        }
      ];
    }

    const painLevels = cycleDays.map(day => day.painLevel);
    const avgPain = painLevels.reduce((a, b) => a + b, 0) / painLevels.length;
    
    const hasCramps = cycleDays.some(day => day.symptoms.includes("Cramps"));
    const hasHeadaches = cycleDays.some(day => day.symptoms.includes("Headache"));
    
    const insights: Insight[] = [];
    
    if (avgPain > 5) {
      insights.push({
        title: "Pain Management",
        description: "Your pain levels are higher than average. Consider consulting with a healthcare provider.",
        icon: <AlertCircle />,
        color: "bg-red-500"
      });
    }
    
    if (hasCramps) {
      insights.push({
        title: "Cramp Relief",
        description: "Try heat therapy and gentle stretching to reduce menstrual cramps.",
        icon: <Zap />,
        color: "bg-orange-500"
      });
    }
    
    if (hasHeadaches) {
      insights.push({
        title: "Headache Tip",
        description: "Stay hydrated and consider magnesium supplements to reduce hormonal headaches.",
        icon: <Droplet />,
        color: "bg-purple-500"
      });
    }
    
    insights.push({
      title: "Cycle Regularity",
      description: "Your cycle length appears to be consistent. Great job tracking!",
      icon: <Award />,
      color: "bg-green-500"
    });
    
    return insights;
  };

  const addCycleDay = () => {
    const newDay: CycleDay = {
      date: selectedDate,
      flow,
      symptoms: selectedSymptoms,
      painLevel,
      mood,
      notes: notes.trim() || undefined,
    };

    setCycleDays([...cycleDays, newDay]);
    if (!lastPeriodStart && flow !== "light") {
      setLastPeriodStart(selectedDate);
    }

    // Reset form
    setPainLevel(0);
    setFlow("medium");
    setMood("normal");
    setSelectedSymptoms([]);
    setNotes("");
    
    // Show insights after logging
    setShowInsights(true);
    setTimeout(() => setShowInsights(false), 5000);
  };

  const getDateHighlight = (date: Date) => {
    const cycleDay = cycleDays.find(
      (day) => day.date.toDateString() === date.toDateString()
    );
    
    if (cycleDay) {
      return {
        flow: cycleDay.flow,
        painLevel: cycleDay.painLevel,
        mood: cycleDay.mood,
      };
    }
    
    const fertility = calculateFertilityWindow();
    if (fertility) {
      const dateStr = date.toDateString();
      if (dateStr === fertility.ovulationDay.toDateString()) {
        return { type: "ovulation" };
      }
      if (
        date >= fertility.fertilityStart &&
        date <= fertility.fertilityEnd
      ) {
        return { type: "fertile" };
      }
    }
    
    return null;
  };

  // Get color for calendar day
  const getDayColor = (date: Date) => {
    const highlight = getDateHighlight(date);
    if (!highlight) return "";
    
    if ("type" in highlight) {
      if (highlight.type === "ovulation") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      if (highlight.type === "fertile") return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100";
    }
    
    if ("flow" in highlight) {
      if (highlight.flow === "heavy") return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100";
      if (highlight.flow === "medium") return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100";
      if (highlight.flow === "light") return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
    }
    
    return "";
  };

  // Quick symptom tips based on the current cycle phase
  const getQuickTips = () => {
    if (!currentPhase) return [];
    
    const phase = currentPhase;
    
    if (phase === "menstrual") {
      return [
        "Stay hydrated to reduce bloating",
        "Gentle exercise can help with cramps",
        "Warm compress for lower back pain",
        "Iron-rich foods can help with energy levels"
      ];
    }
    
    if (phase === "follicular") {
      return [
        "Great time for high-intensity workouts",
        "Plan social activities when energy is higher",
        "Focus on creative projects during this phase",
        "Higher protein intake supports muscle recovery"
      ];
    }
    
    if (phase === "ovulation") {
      return [
        "Track fertility signs if planning/preventing pregnancy",
        "Stay active to maximize energy levels",
        "Good time for important meetings or presentations",
        "Stay extra hydrated during this phase"
      ];
    }
    
    if (phase === "luteal") {
      return [
        "Increase magnesium intake to manage PMS",
        "Focus on stress management techniques",
        "Reduce caffeine and sugar to minimize mood swings",
        "Extra self-care during this time is important"
      ];
    }
    
    return [];
  };

  // Determine current cycle phase
  const getCurrentPhase = (): "menstrual" | "follicular" | "ovulation" | "luteal" | null => {
    if (!currentCycleDay) return null;
    
    if (currentCycleDay <= 5) return "menstrual";
    if (currentCycleDay <= 13) return "follicular";
    if (currentCycleDay <= 16) return "ovulation";
    return "luteal";
  };
  
  const currentPhase = getCurrentPhase();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="relative">
        <motion.div 
          className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 opacity-20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400 to-red-600 opacity-20 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        
        <div className="relative backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
              Menstruation Cycle Tracker
            </h1>
            
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full"
                      onClick={() => setShowTips(!showTips)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Cycle Tips
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get quick tips for your current cycle phase</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                variant="default"
                size="sm"
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share with Doctor
              </Button>
            </div>
          </div>
          
          {/* Tips panel */}
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <Card className="border-pink-200 dark:border-pink-900 bg-gradient-to-r from-pink-50 to-violet-50 dark:from-pink-950/50 dark:to-violet-950/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center text-pink-700 dark:text-pink-300">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Tips for {currentPhase ? currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1) : "Your"} Phase
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                      {getQuickTips().map((tip, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="rounded-full p-1 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300">
                            <Heart className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-pink-700 dark:text-pink-300">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Tabs defaultValue="daily-log" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-pink-100 dark:bg-pink-950 rounded-lg">
          <TabsTrigger value="daily-log" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Daily Log
          </TabsTrigger>
          <TabsTrigger value="cycle-view" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            <TrendingUp className="h-4 w-4 mr-2" />
            Cycle View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-log" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-pink-200 dark:border-pink-900">
              <CardHeader className="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-pink-600 dark:text-pink-300" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  modifiers={{
                    highlighted: (date) => getDateHighlight(date) !== null,
                  }}
                  modifiersStyles={{
                    highlighted: {
                      fontWeight: "bold",
                    }
                  }}
                  className="mx-auto"
                  styles={{
                    day_highlighted: (date) => getDayColor(date),
                  }}
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-pink-200 dark:border-pink-900">
                <CardHeader className="bg-gradient-to-r from-fuchsia-100 to-purple-100 dark:from-fuchsia-950 dark:to-purple-950">
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-pink-600 dark:text-pink-300" />
                    Daily Log
                  </CardTitle>
                  <CardDescription>
                    {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                      Flow Intensity
                    </label>
                    <Select value={flow} onValueChange={(value: any) => setFlow(value)}>
                      <SelectTrigger className="border-pink-200 dark:border-pink-800">
                        <SelectValue placeholder="Select flow intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                      Pain Level (0-10)
                    </label>
                    <Slider
                      value={[painLevel]}
                      onValueChange={(value) => setPainLevel(value[0])}
                      max={10}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>No Pain</span>
                      <span className="font-medium text-sm text-pink-600 dark:text-pink-400">{painLevel}</span>
                      <span>Severe</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                      Mood
                    </label>
                    <Select value={mood} onValueChange={(value) => setMood(value)}>
                      <SelectTrigger className="border-pink-200 dark:border-pink-800">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happy">Happy 😊</SelectItem>
                        <SelectItem value="normal">Normal 😐</SelectItem>
                        <SelectItem value="sad">Sad 😢</SelectItem>
                        <SelectItem value="irritated">Irritated 😠</SelectItem>
                        <SelectItem value="anxious">Anxious 😰</SelectItem>
                        <SelectItem value="energetic">Energetic ⚡</SelectItem>
                        <SelectItem value="tired">Tired 😴</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                      Notes
                    </label>
                    <Input
                      placeholder="Add notes about your day..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="border-pink-200 dark:border-pink-800"
                    />
                  </div>

                  <Button 
                    onClick={addCycleDay} 
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Log Day
                  </Button>
                </CardContent>
              </Card>

              <SymptomsTracker
                selectedSymptoms={selectedSymptoms}
                onSymptomsChange={setSelectedSymptoms}
              />
            </div>

            <Card className="md:col-span-2 border-pink-200 dark:border-pink-900">
              <CardHeader className="bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                  Cycle Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/50 dark:to-transparent border border-pink-100 dark:border-pink-900">
                    <h3 className="font-medium text-pink-700 dark:text-pink-300 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Cycle Length
                    </h3>
                    <div className="mt-2 flex items-center space-x-2">
                      <Progress value={(cycleLength / 35) * 100} className="bg-pink-100 dark:bg-pink-900" indicatorClassName="bg-gradient-to-r from-pink-500 to-purple-500" />
                      <span className="text-pink-700 dark:text-pink-300 font-medium">{cycleLength} days</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/50 dark:to-transparent border border-purple-100 dark:border-purple-900">
                    <h3 className="font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Fertility Window
                    </h3>
                    {calculateFertilityWindow() ? (
                      <Badge className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                        {calculateFertilityWindow()?.fertilityStart.toLocaleDateString()} - {calculateFertilityWindow()?.fertilityEnd.toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 border-dashed">
                        Log your period to see predictions
                      </Badge>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-transparent border border-blue-100 dark:border-blue-900">
                    <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Next Period
                    </h3>
                    {lastPeriodStart ? (
                      <Badge className="mt-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
                        {new Date(
                          lastPeriodStart.getTime() + cycleLength * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 border-dashed">
                        Log your period to see prediction
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Insights panel that appears after logging */}
            <AnimatePresence>
              {showInsights && (
                <motion.div 
                  className="md:col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-pink-200 dark:border-pink-900 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-pink-700 dark:text-pink-300">
                        <Sparkles className="inline-block h-5 w-5 mr-2" />
                        Personalized Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {generateInsights().map((insight, index) => (
                          <div 
                            key={index} 
                            className="flex gap-3 p-3 rounded-lg bg-white/80 dark:bg-black/20 shadow-sm"
                          >
                            <div className={`${insight.color} text-white p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0`}>
                              {insight.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground">{insight.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="cycle-view">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <CycleVisualizer
                cycleLength={cycleLength}
                currentDay={currentCycleDay}
                lastPeriodStart={lastPeriodStart}
              />
            </div>

            <div className="space-y-6">
              <Card className="border-pink-200 dark:border-pink-900">
                <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-950 dark:to-purple-950">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-pink-600 dark:text-pink-300" />
                    Cycle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                      Cycle Length (days)
                    </label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[cycleLength]}
                        onValueChange={(value) => setCycleLength(value[0])}
                        min={21}
                        max={35}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-8 text-center font-medium text-pink-600 dark:text-pink-400">{cycleLength}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50">
                    <h3 className="font-medium text-pink-700 dark:text-pink-300 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Current Cycle Day
                    </h3>
                    <div className="mt-1 font-medium text-2xl text-pink-600 dark:text-pink-300">
                      Day {currentCycleDay}
                    </div>
                    <div className="mt-1 text-sm text-pink-600/80 dark:text-pink-300/80">
                      {currentPhase && `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase`}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50">
                    <h3 className="font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <Droplet className="h-4 w-4" />
                      Last Period Start
                    </h3>
                    {lastPeriodStart ? (
                      <div className="mt-1 text-purple-600 dark:text-purple-300">
                        {lastPeriodStart.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                      </div>
                    ) : (
                      <div className="mt-1 text-sm italic text-muted-foreground">
                        Not yet recorded
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                    <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Next Period
                    </h3>
                    {lastPeriodStart ? (
                      <div className="mt-1 flex items-center">
                        <span className="text-blue-600 dark:text-blue-300">
                          {new Date(
                            lastPeriodStart.getTime() + cycleLength * 24 * 60 * 60 * 1000
                          ).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                        </span>
                        <Badge className="ml-2 py-0 px-1.5 h-5 bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                          {Math.max(0, Math.floor((new Date(
                            lastPeriodStart.getTime() + cycleLength * 24 * 60 * 60 * 1000
                          ).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days left
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline" className="mt-2 border-dashed">
                        Log your period to see prediction
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-pink-200 dark:border-pink-900">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {lastPeriodStart ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center text-pink-600 dark:text-pink-300">
                          <Droplet className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Next Period</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              lastPeriodStart.getTime() + cycleLength * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Ovulation Day</div>
                          <div className="text-xs text-muted-foreground">
                            {calculateFertilityWindow()?.ovulationDay.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Cycle Complete</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              lastPeriodStart.getTime() + (cycleLength - 1) * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-muted-foreground text-sm">
                        Log your period to see upcoming events
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}