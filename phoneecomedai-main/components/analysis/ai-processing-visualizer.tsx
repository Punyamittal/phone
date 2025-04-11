"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Camera, Flashlight, Heart, Volume2, VolumeX, AlertCircle, Activity, 
  Zap, Info, LightbulbIcon, BarChart4, Clock, Medal, HeartPulse, 
  AlertTriangle, ShieldCheck, Sparkles, X, Wind, Mic, MicOff, Hand,
  User, Maximize2, ThermometerIcon, BatteryIcon, Stethoscope, Download,
  PieChart, Share2, Save, RotateCw, BookOpen, CalendarDays, ChevronDown,
  CircleOff, CircleCheck, RefreshCw, Scan, Cloud, Music, Brain, Smile,
  Frown, Meh, Coffee, Moon, MoonStar, Sunset, TrendingUp, TrendingDown
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, 
  ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis 
} from "recharts";

// Type declarations
declare global {
  interface MediaTrackCapabilities {
    torch?: boolean;
  }
  
  interface MediaTrackConstraintSet {
    torch?: boolean;
  }
}

// Constants for heart rate monitoring
const SAMPLING_RATE = 30; // frames per second
const WINDOW_SIZE = 300; // 10 seconds of data at 30fps
const MIN_HR = 40;
const MAX_HR = 200;
const MEASUREMENT_DURATION = 15000; // 15 seconds for measurement
const QUALITY_THRESHOLD = 0.7; // Signal quality threshold
const NORMAL_HR_MIN = 60;
const NORMAL_HR_MAX = 100;
const NORMAL_SPO2_MIN = 95; // Normal SpO2 minimum (%)
const NORMAL_SPO2_MAX = 100; // Normal SpO2 maximum (%)
const LOW_SPO2_THRESHOLD = 92; // Concerning SpO2 level
const NORMAL_RESP_MIN = 12; // Normal breathing rate minimum (breaths/min)
const NORMAL_RESP_MAX = 20; // Normal breathing rate maximum (breaths/min)

// Health facts for display during measurement
const HEALTH_FACTS = [
  "Oxygen-rich blood is bright red, while oxygen-poor blood has a darker, bluish-red color.",
  "Each red blood cell can live for about 120 days before being replaced by a new one.",
  "Your heart beats about 100,000 times a day, pumping about 2,000 gallons of blood.",
  "Blood vessels in your body would stretch about 60,000 miles if laid end to end.",
  "Your heart is about the size of your fist and weighs less than a pound.",
  "Blood makes up about 7-8% of your body weight.",
  "A single drop of blood contains about 5 million red blood cells.",
  "Your heartbeat changes with music tempo - one reason why slow music can help you relax.",
  "The adult human heart pumps about 6 quarts of blood through the body every minute.",
  "The 'thump-thump' sound your heart makes is caused by heart valves opening and closing."
];

// Extended health facts with emotional content
const EXTENDED_HEALTH_FACTS = [
  ...HEALTH_FACTS,
  "Your emotional state can affect your heart rate - stress increases it while relaxation lowers it.",
  "Laughter can cause an immediate increase in heart rate, followed by a period of muscle relaxation.",
  "Music with a tempo of 60-80 BPM can help synchronize your heartbeat to a calmer rhythm.",
  "Deep breathing exercises can rapidly lower your heart rate by activating the vagus nerve.",
  "Feelings of love or compassion can trigger the release of oxytocin, which can reduce blood pressure.",
  "A racing heart during excitement uses the same physiological pathways as during fear or anxiety.",
  "Heart rate variability is increased during positive emotional states and decreased during stress.",
  "Morning heart rates are typically 5-10 BPM higher than resting heart rates later in the day.",
  "Emotional resilience is linked to greater heart rate variability and cardiovascular health.",
  "The 'fight-or-flight' response can increase heart rate by 30-50% within seconds."
];

// Music tempo recommendations based on heart rate
const getMusicRecommendation = (heartRate: number) => {
  if (heartRate < 60) {
    return {
      mood: "Energizing",
      tempo: "Upbeat (90-120 BPM)",
      genres: ["Pop", "Dance", "Upbeat Jazz"],
      color: "amber",
      icon: <Sunset className="h-4 w-4" />
    };
  } else if (heartRate < 75) {
    return {
      mood: "Balanced",
      tempo: "Moderate (70-90 BPM)",
      genres: ["Indie", "Folk", "Pop", "Classical"],
      color: "green",
      icon: <Coffee className="h-4 w-4" />
    };
  } else if (heartRate < 90) {
    return {
      mood: "Calming",
      tempo: "Relaxed (60-70 BPM)",
      genres: ["Ambient", "Chill", "Acoustic", "Light Jazz"],
      color: "blue",
      icon: <Moon className="h-4 w-4" />
    };
  } else {
    return {
      mood: "Relaxing",
      tempo: "Slow (50-60 BPM)",
      genres: ["Meditation", "Ambient", "Classical", "Nature Sounds"],
      color: "indigo",
      icon: <MoonStar className="h-4 w-4" />
    };
  }
};

// Emotion detection from heart rate and HRV patterns
const detectEmotion = (heartRate: number, hrv: number | null, respirationRate: number | null): {
  emotion: string;
  confidence: number;
  description: string;
  icon: JSX.Element;
} => {
  // Default values
  let emotion = "Neutral";
  let confidence = 50;
  let description = "Balanced emotional state";
  let icon = <Meh className="h-5 w-5" />;
  
  if (!hrv) return { emotion, confidence, description, icon };
  
  // Excited/Happy: Elevated HR, moderate-to-high HRV, normal-to-fast breathing
  if (heartRate > 85 && hrv > 30 && (!respirationRate || respirationRate > 15)) {
    emotion = "Excited";
    confidence = Math.min(80, 50 + (heartRate - 85) / 2 + (hrv - 30) / 2);
    description = "Energetic and positive emotional state";
    icon = <Smile className="h-5 w-5 text-amber-500" />;
  }
  // Calm/Relaxed: Lower HR, high HRV, slower breathing
  else if (heartRate < 70 && hrv > 40 && (!respirationRate || respirationRate < 14)) {
    emotion = "Calm";
    confidence = Math.min(85, 50 + (70 - heartRate) / 2 + (hrv - 40) / 2);
    description = "Relaxed and centered emotional state";
    icon = <Moon className="h-5 w-5 text-blue-500" />;
  }
  // Stressed/Anxious: Higher HR, low HRV, faster breathing
  else if (heartRate > 90 && hrv < 25 && (!respirationRate || respirationRate > 18)) {
    emotion = "Stressed";
    confidence = Math.min(80, 50 + (heartRate - 90) / 2 + (25 - hrv) / 2);
    description = "Elevated stress response detected";
    icon = <Frown className="h-5 w-5 text-red-500" />;
  }
  // Focused/Alert: Moderate HR, moderate HRV
  else if (heartRate >= 70 && heartRate <= 85 && hrv >= 25 && hrv <= 40) {
    emotion = "Focused";
    confidence = 70;
    description = "Alert and attentive state";
    icon = <Brain className="h-5 w-5 text-purple-500" />;
  }
  
  return { emotion, confidence, description, icon };
};

// Signal processing utilities
const movingAverage = (data: number[], windowSize: number) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const end = i + 1;
    const sum = data.slice(start, end).reduce((a, b) => a + b, 0);
    result.push(sum / (end - start));
  }
  return result;
};

const normalizeSignal = (data: number[]) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  return data.map(x => (x - min) / (max - min + 0.0001));
};

const findPeaks = (data: number[], threshold = 0.5, minDistance = 10) => {
  const peaks: number[] = [];
  let lastPeakIndex = -minDistance;
  const smoothedData = movingAverage(data, 3);

  for (let i = 2; i < smoothedData.length - 2; i++) {
    if (smoothedData[i] > threshold &&
        smoothedData[i] > smoothedData[i - 1] &&
        smoothedData[i] > smoothedData[i - 2] &&
        smoothedData[i] > smoothedData[i + 1] &&
        smoothedData[i] > smoothedData[i + 2] &&
        i - lastPeakIndex >= minDistance) {
      peaks.push(i);
      lastPeakIndex = i;
    }
  }
  return peaks;
};

const calculateHeartRate = (peaks: number[], totalFrames: number, fps: number): [number, number] => {
  if (peaks.length < 3) return [0, 0];

  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(
    intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length
  );
  
  const validIntervals = intervals.filter(i => 
    Math.abs(i - mean) <= 2 * stdDev &&
    i > fps * 0.4 && 
    i < fps * 1.5
  );

  if (validIntervals.length < 2) return [0, 0];

  const avgInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
  const bpm = Math.round((fps * 60) / avgInterval);
  
  const intervalVariability = stdDev / mean;
  const peakDensity = peaks.length / (totalFrames / fps);
  const expectedDensity = bpm / 60;
  const densityError = Math.abs(1 - peakDensity / expectedDensity);
  
  const confidence = Math.max(0, Math.min(100,
    100 * (1 - intervalVariability) * (1 - densityError)
  ));

  return [bpm, Math.round(confidence)];
};

// Haptic feedback utility
const triggerHaptic = (pattern: number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Speech synthesis utility
const speakText = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter(voice => voice.lang.includes('en'));
  
  if (englishVoices.length > 0) {
    const femaleVoice = englishVoices.find(voice => voice.name.includes('Female'));
    utterance.voice = femaleVoice || englishVoices[0];
  }
  
  window.speechSynthesis.speak(utterance);
};

interface SignalPoint {
  time: number;
  value: number;
  filtered?: number;
  spo2Value?: number;
}

interface HeartRateHistory {
  timestamp: number;
  heartRate: number;
  confidence: number;
  spo2?: number;
  respirationRate?: number;
}

interface HeartScore {
  score: number;
  interpretation: string;
  color: string;
}

interface StressLevel {
  level: 'low' | 'medium' | 'high';
  score: number;
  interpretation: string;
  color: string;
}

// Constants for health zone calculations
const TARGET_ZONE_MIN = 0.5; // 50% of max heart rate
const TARGET_ZONE_MAX = 0.85; // 85% of max heart rate
const FAT_BURN_MIN = 0.6; // 60% of max heart rate
const FAT_BURN_MAX = 0.7; // 70% of max heart rate
const CARDIO_MIN = 0.7; // 70% of max heart rate
const CARDIO_MAX = 0.8; // 80% of max heart rate
const PEAK_MIN = 0.8; // 80% of max heart rate

// Add health zone calculation
const calculateHealthZone = (bpm: number, age: number = 30) => {
  const maxHeartRate = 220 - age;
  const percentMax = bpm / maxHeartRate;
  
  if (percentMax < TARGET_ZONE_MIN) {
    return { zone: "Below Target", color: "gray" };
  } else if (percentMax >= TARGET_ZONE_MIN && percentMax < FAT_BURN_MIN) {
    return { zone: "Warm Up", color: "blue" };
  } else if (percentMax >= FAT_BURN_MIN && percentMax < CARDIO_MIN) {
    return { zone: "Fat Burn", color: "green" };
  } else if (percentMax >= CARDIO_MIN && percentMax < PEAK_MIN) {
    return { zone: "Cardio", color: "orange" };
  } else {
    return { zone: "Peak", color: "red" };
  }
};

// Add animated heart beat icon
const AnimatedHeartbeat = () => (
  <div className="relative w-5 h-5">
    <motion.div
      className="absolute inset-0 text-red-500"
      animate={{ 
        scale: [1, 1.2, 1],
        color: ['hsl(0, 70%, 60%)', 'hsl(0, 90%, 50%)', 'hsl(0, 70%, 60%)']
      }}
      transition={{ duration: 0.8, repeat: Infinity }}
    >
      <Heart className="w-full h-full" />
    </motion.div>
  </div>
);

// Animated 3D Heart component
const AnimatedHeart3D = ({ heartRate, active = true }: { heartRate: number | null, active?: boolean }) => {
  const speed = heartRate ? 60 / heartRate : 1;
  
  return (
    <div className="relative w-full h-full perspective-[800px]">
      <motion.div 
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={active ? {
          rotateY: [0, 5, 0, -5, 0],
          scale: [1, 1.08, 1, 1.08, 1]
        } : {}}
        transition={{
          duration: speed,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        {/* Heart front */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <motion.path
                d="M50,90 C100,65 100,10 50,30 C0,10 0,65 50,90 Z"
                fill="url(#heartGradient)"
                animate={active ? {
                  fill: ["#ff6b6b", "#ff4757", "#ff6b6b"]
                } : {}}
                transition={{
                  duration: speed,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
              <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4757" />
                  <stop offset="100%" stopColor="#ff6b6b" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Pulse ring */}
            {active && (
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-red-400"
                animate={{
                  scale: [1, 1.5, 1.8],
                  opacity: [0.8, 0.4, 0]
                }}
                transition={{
                  duration: speed * 1.2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            )}
          </div>
        </div>
      </motion.div>
      
      {heartRate && (
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <span className="text-4xl font-bold">{heartRate}</span>
          <span className="text-sm font-medium ml-1">BPM</span>
        </div>
      )}
    </div>
  );
};

// Interactive health gauge component
const HealthGauge = ({ value, minValue, maxValue, warningThreshold, criticalThreshold, label, unit = "", size = "medium" }: {
  value: number | null;
  minValue: number;
  maxValue: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  label: string;
  unit?: string;
  size?: "small" | "medium" | "large";
}) => {
  if (value === null) return null;
  
  const normalizedValue = Math.min(Math.max((value - minValue) / (maxValue - minValue), 0), 1);
  const angle = normalizedValue * 180 - 90; // -90 to 90 degrees
  
  const getColor = () => {
    if (criticalThreshold && value >= criticalThreshold) return "red";
    if (warningThreshold && value >= warningThreshold) return "orange";
    return "green";
  };
  
  const sizeClasses = {
    small: "w-24 h-24 text-xs",
    medium: "w-32 h-32 text-sm",
    large: "w-40 h-40 text-base"
  };
  
  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {/* Background arc */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M 50,50 m 0,-40 a 40,40 0 1 1 0,80 a 40,40 0 1 1 0,-80"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset="0"
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          />
        </svg>
      </div>
      
      {/* Value arc */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.path
            d="M 50,50 m 0,-40 a 40,40 0 1 1 0,80 a 40,40 0 1 1 0,-80"
            fill="none"
            stroke={`hsl(var(--${getColor()}))`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset={`${125.6 * (1 - normalizedValue)}`}
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
            initial={{ strokeDashoffset: "125.6" }}
            animate={{ strokeDashoffset: `${125.6 * (1 - normalizedValue)}` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
      </div>
      
      {/* Needle */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            stroke={`hsl(var(--${getColor()}))`}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: "center" }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <circle cx="50" cy="50" r="3" fill={`hsl(var(--${getColor()}))`} />
        </svg>
      </div>
      
      {/* Label and value */}
      <div className="absolute bottom-0 inset-x-0 text-center">
        <div className="font-medium">{label}</div>
        <div className="font-bold">{value}{unit}</div>
      </div>
    </div>
  );
};

// Animated Face Tracking Visualization component
const FaceTrackingVisualization = ({ active = true }: { active?: boolean }) => {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
        {/* Face outline */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="30"
          ry="40"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          animate={active ? {
            rx: [30, 31, 30, 29, 30],
            ry: [40, 41, 40, 39, 40],
            opacity: [0.6, 0.7, 0.6]
          } : {}}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Face tracking points */}
        {[
          [35, 35], [65, 35], // Eyes
          [50, 50], // Nose
          [40, 65], [60, 65], // Mouth corners
          [30, 25], [70, 25], // Eyebrows
          [50, 70], // Chin
          [20, 50], [80, 50], // Sides
        ].map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="0.8"
            fill="rgba(112, 237, 255, 0.9)"
            animate={active ? {
              r: [0.8, 1.2, 0.8],
              opacity: [0.9, 1, 0.9],
              cx: [x, x + (Math.random() * 2 - 1), x],
              cy: [y, y + (Math.random() * 2 - 1), y]
            } : {}}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        
        {/* Scanning line */}
        <motion.line
          x1="15"
          y1="50"
          x2="85"
          y2="50"
          stroke="rgba(112, 237, 255, 0.5)"
          strokeWidth="0.5"
          animate={active ? {
            y1: [20, 80, 20],
            y2: [20, 80, 20],
            opacity: [0.3, 0.8, 0.3]
          } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Pulse indicator */}
        <motion.circle
          cx="50"
          cy="90"
          r="2"
          fill="rgba(255, 100, 100, 0.7)"
          animate={active ? {
            r: [2, 3, 2],
            opacity: [0.7, 1, 0.7]
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </svg>
      <div className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/30 px-1.5 py-0.5 rounded">Face tracking active</div>
    </div>
  );
};

// Music pulse visualization
const MusicPulseVisualization = ({ bpm, active = true }: { bpm: number | null, active?: boolean }) => {
  const speed = bpm ? 60 / bpm : 1;
  
  return (
    <div className="relative w-full h-16 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-end space-x-1 h-full">
          {Array.from({ length: 12 }).map((_, i) => {
            const height = 30 + (i % 3) * 15 + (i % 5) * 10;
            return (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-purple-500 to-blue-300 rounded-t"
                style={{ height: `${height}%` }}
                animate={active ? {
                  height: [`${height}%`, `${height + 30}%`, `${height}%`],
                  opacity: [0.7, 1, 0.7]
                } : {}}
                transition={{
                  duration: speed * 0.8,
                  delay: i * (speed / 24),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-1 right-2 text-xs text-white/80 flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded">
        <Music className="h-3 w-3" />
        <span>{bpm || "--"} BPM</span>
      </div>
    </div>
  );
};

// Add real-time data visualization component
const LiveHeartRateDisplay = ({ 
  heartRate, 
  active = true, 
  historyData = [],
  showDetails = false
}: { 
  heartRate: number | null, 
  active?: boolean,
  historyData?: { value: number, timestamp: number }[],
  showDetails?: boolean
}) => {
  const minRate = Math.max(40, Math.min(...historyData.map(d => d.value).filter(Boolean), Number.MAX_SAFE_INTEGER) - 10);
  const maxRate = Math.min(200, Math.max(...historyData.map(d => d.value).filter(Boolean), 0) + 10);
  
  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-background/80 backdrop-blur-sm">
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <motion.div
          animate={active && heartRate ? {
            scale: [1, 1.3, 1],
          } : {}}
          transition={{
            duration: heartRate ? 60 / heartRate : 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-red-500"
        >
          <Heart className="h-5 w-5 fill-current" />
        </motion.div>
        {heartRate ? (
          <motion.span 
            key={heartRate}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold"
          >
            {heartRate}
            <span className="text-xs ml-1 font-normal text-muted-foreground">BPM</span>
          </motion.span>
        ) : (
          <span className="text-muted-foreground">--</span>
        )}
      </div>
      
      {/* Live chart */}
      <div className="h-24 w-full pt-8">
        {historyData.length > 2 ? (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Background grid */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(100,100,100,0.1)" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(100,100,100,0.1)" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(100,100,100,0.1)" strokeWidth="0.5" />
            
            {/* Heart rate data path */}
            <motion.path
              d={`M ${historyData.map((point, i) => {
                const x = (i / (historyData.length - 1)) * 100;
                const normalized = 100 - ((point.value - minRate) / (maxRate - minRate || 1)) * 100;
                const y = Math.max(5, Math.min(95, normalized));
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Pulse dot */}
            {heartRate && historyData.length > 0 && (
              <motion.circle
                cx="95"
                cy={100 - ((heartRate - minRate) / (maxRate - minRate || 1)) * 100}
                r="2"
                fill="hsl(var(--primary))"
                animate={{ 
                  r: [2, 4, 2],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: heartRate ? 60 / heartRate : 1,
                  repeat: Infinity
                }}
              />
            )}
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Waiting for heart rate data...</p>
          </div>
        )}
      </div>
      
      {showDetails && (
        <div className="grid grid-cols-3 text-xs border-t p-1">
          <div className="text-center">
            <div className="text-muted-foreground">Min</div>
            <div>{Math.min(...historyData.map(d => d.value).filter(Boolean)) || '--'}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Avg</div>
            <div>
              {historyData.length > 0 
                ? Math.round(historyData.reduce((sum, d) => sum + d.value, 0) / historyData.length) 
                : '--'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Max</div>
            <div>{Math.max(...historyData.map(d => d.value).filter(Boolean)) || '--'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced signal processing utilities for higher accuracy
const bandpassFilter = (data: number[], lowCutoff = 0.5, highCutoff = 3.0, sampleRate = 30) => {
  // Simple bandpass filter to isolate heart rate frequency range (typically 0.5-3Hz)
  const result = [];
  const RC_low = 1.0 / (2 * Math.PI * lowCutoff);
  const RC_high = 1.0 / (2 * Math.PI * highCutoff);
  const dt = 1.0 / sampleRate;
  
  let x_filtered_low = 0;
  let x_filtered_high = 0;
  
  for (let i = 0; i < data.length; i++) {
    // High-pass filter (removes frequencies below lowCutoff)
    const alpha_high = RC_high / (RC_high + dt);
    x_filtered_high = alpha_high * (x_filtered_high + data[i] - (i > 0 ? data[i-1] : 0));
    
    // Low-pass filter (removes frequencies above highCutoff)
    const alpha_low = dt / (RC_low + dt);
    x_filtered_low = x_filtered_low + alpha_low * (x_filtered_high - x_filtered_low);
    
    result.push(x_filtered_low);
  }
  
  return result;
};

// Enhanced peak detection with adaptive thresholding
const findPeaksEnhanced = (data: number[], minDistance = 10, adaptiveThreshold = true) => {
  const peaks: number[] = [];
  
  // Apply moving average smoothing
  const smoothedData = movingAverage(data, 3);
  
  // Determine adaptive threshold or use fixed threshold
  let threshold = 0.5; // Default
  if (adaptiveThreshold) {
    // Calculate dynamic threshold based on signal strength
    const mean = smoothedData.reduce((a, b) => a + b, 0) / smoothedData.length;
    const variance = smoothedData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / smoothedData.length;
    const std = Math.sqrt(variance);
    threshold = mean + 0.8 * std; // Adjusted threshold based on signal statistics
  }
  
  let lastPeakIndex = -minDistance;
  
  // Improved peak identification algorithm
  for (let i = 2; i < smoothedData.length - 2; i++) {
    // Check if current point exceeds threshold and is a local maximum
    if (smoothedData[i] > threshold &&
        smoothedData[i] > smoothedData[i - 1] &&
        smoothedData[i] > smoothedData[i - 2] &&
        smoothedData[i] > smoothedData[i + 1] &&
        smoothedData[i] > smoothedData[i + 2] &&
        i - lastPeakIndex >= minDistance) {
      
      // Refine peak position with quadratic interpolation for sub-sample accuracy
      const a = smoothedData[i-1];
      const b = smoothedData[i];
      const c = smoothedData[i+1];
      const offset = (a - c) / (2 * (a - 2*b + c));
      
      peaks.push(i + offset);
      lastPeakIndex = i;
    }
  }
  
  return peaks;
};

// Improved heart rate calculation with outlier rejection and confidence estimation
const calculateHeartRateEnhanced = (peaks: number[], totalFrames: number, fps: number): [number, number] => {
  if (peaks.length < 4) return [0, 0]; // Need at least 4 peaks for reliable estimation

  // Calculate intervals between peaks
  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }

  // Calculate statistics
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(
    intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length
  );
  
  // Improved outlier rejection with z-score filtering
  const maxZScore = 2.0; // Stricter threshold for outliers
  const validIntervals = intervals.filter(i => 
    Math.abs(i - mean) <= maxZScore * stdDev &&
    i > fps * 0.4 && // Minimum interval (heart rate below 150 BPM)
    i < fps * 1.5    // Maximum interval (heart rate above 40 BPM)
  );

  if (validIntervals.length < 3) return [0, 0]; // Not enough valid intervals

  // Recalculate with filtered intervals
  const filteredMean = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
  const filteredStdDev = Math.sqrt(
    validIntervals.reduce((a, b) => a + Math.pow(b - filteredMean, 2), 0) / validIntervals.length
  );
  
  // Calculate heart rate
  const bpm = Math.round((fps * 60) / filteredMean);
  
  // Enhanced confidence estimation
  const intervalVariability = filteredStdDev / filteredMean; // Lower is better
  const peakDensity = peaks.length / (totalFrames / fps);
  const expectedDensity = bpm / 60;
  const densityError = Math.abs(1 - peakDensity / expectedDensity);
  
  // Signal quality factors
  const signalStrength = peaks.reduce((sum, peakIdx) => {
    if (peakIdx < totalFrames) return sum + frameDataRef.current[Math.floor(peakIdx)];
    return sum;
  }, 0) / peaks.length;
  
  // Comprehensive confidence score
  const confidence = Math.max(0, Math.min(100,
    100 * (1 - intervalVariability) * (1 - densityError) * Math.min(1, signalStrength / 100)
  ));

  return [bpm, Math.round(confidence)];
};

// Interactive 3D visualization for heart rate patterns
const HeartRatePatternVisualization = ({ 
  heartRateData, 
  hrvData, 
  active = true 
}: { 
  heartRateData: number[], 
  hrvData: number[], 
  active?: boolean 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !active || heartRateData.length < 5) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Animation frame handling
    let animationFrame: number;
    let angle = 0;
    
    const drawVisualization = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set dimensions and center point
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Calculate max values for scaling
      const maxHR = Math.max(...heartRateData, 100);
      const maxHRV = Math.max(...hrvData, 50);
      
      // Draw circular grid
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 1; i <= 3; i++) {
        const radius = (Math.min(width, height) * 0.45) * (i / 3);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Draw axes
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      
      // Create 3D effect by rotating the visualization
      angle += 0.01;
      const perspective = Math.sin(angle) * 0.2 + 0.8;
      
      // Draw heart rate pattern
      if (heartRateData.length > 0) {
        ctx.strokeStyle = 'rgba(240, 60, 60, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const radius = Math.min(width, height) * 0.4;
        
        for (let i = 0; i < heartRateData.length; i++) {
          const value = heartRateData[i] / maxHR;
          const hrvValue = hrvData[i] / maxHRV;
          
          const segmentAngle = (i / heartRateData.length) * Math.PI * 2;
          const distortion = hrvValue * 0.3; // HRV affects the pattern shape
          
          const x = centerX + Math.cos(segmentAngle + angle) * radius * value * perspective;
          const y = centerY + Math.sin(segmentAngle + angle) * radius * value * perspective * (1 + distortion);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        // Close the path
        const firstValue = heartRateData[0] / maxHR;
        const firstHrvValue = hrvData[0] / maxHRV;
        const firstAngle = 0;
        const firstDistortion = firstHrvValue * 0.3;
        
        const firstX = centerX + Math.cos(firstAngle + angle) * radius * firstValue * perspective;
        const firstY = centerY + Math.sin(firstAngle + angle) * radius * firstValue * perspective * (1 + firstDistortion);
        
        ctx.lineTo(firstX, firstY);
        ctx.stroke();
        
        // Fill with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(240, 60, 60, 0.1)');
        gradient.addColorStop(1, 'rgba(240, 60, 60, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw data points
        for (let i = 0; i < heartRateData.length; i += 2) {
          const value = heartRateData[i] / maxHR;
          const hrvValue = hrvData[i] / maxHRV;
          
          const segmentAngle = (i / heartRateData.length) * Math.PI * 2;
          const distortion = hrvValue * 0.3;
          
          const x = centerX + Math.cos(segmentAngle + angle) * radius * value * perspective;
          const y = centerY + Math.sin(segmentAngle + angle) * radius * value * perspective * (1 + distortion);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Continue animation loop
      animationFrame = requestAnimationFrame(drawVisualization);
    };
    
    // Start animation
    animationFrame = requestAnimationFrame(drawVisualization);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [active, heartRateData, hrvData]);
  
  return (
    <div className="relative h-56 w-full bg-gradient-to-br from-background/80 to-background border rounded-lg overflow-hidden">
      <div className="absolute inset-0 p-2">
        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          className="w-full h-full"
        />
      </div>
      
      <div className="absolute bottom-2 left-2 text-xs font-medium text-muted-foreground bg-background/70 py-0.5 px-2 rounded-sm">
        Heart Rate Pattern
      </div>
      
      {heartRateData.length < 5 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
          <p className="text-sm text-muted-foreground">
            Collecting data for visualization...
          </p>
        </div>
      )}
    </div>
  );
};

// Interactive breathing guide component
const InteractiveBreathingGuide = ({ 
  active = false,
  respirationRate = 12, 
  heartRate = 70,
  onComplete = () => {}
}: { 
  active?: boolean,
  respirationRate?: number,
  heartRate?: number,
  onComplete?: () => void
}) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  
  // Calculate optimal breathing pattern based on current heart rate
  const getOptimalBreathingPattern = (hr: number) => {
    if (hr > 100) {
      // Slower breathing for elevated heart rate
      return { inhaleDuration: 4, holdDuration: 7, exhaleDuration: 8, restDuration: 0 };
    } else if (hr > 80) {
      return { inhaleDuration: 4, holdDuration: 4, exhaleDuration: 6, restDuration: 0 };
    } else {
      // Balanced breathing for normal heart rate
      return { inhaleDuration: 4, holdDuration: 2, exhaleDuration: 4, restDuration: 0 };
    }
  };
  
  const { inhaleDuration, holdDuration, exhaleDuration, restDuration } = getOptimalBreathingPattern(heartRate || 70);
  
  useEffect(() => {
    if (!active) return;
    
    let interval: NodeJS.Timeout;
    let timeLeft = 0;
    
    const startPhase = (phaseName: 'inhale' | 'hold' | 'exhale' | 'rest', duration: number) => {
      setPhase(phaseName);
      timeLeft = duration;
      setTimeRemaining(timeLeft);
      
      interval = setInterval(() => {
        timeLeft -= 0.1;
        setTimeRemaining(Math.max(0, timeLeft));
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          
          // Transition to next phase
          switch (phaseName) {
            case 'inhale':
              startPhase('hold', holdDuration);
              break;
            case 'hold':
              startPhase('exhale', exhaleDuration);
              break;
            case 'exhale':
              if (restDuration > 0) {
                startPhase('rest', restDuration);
              } else {
                setCyclesCompleted(prev => prev + 1);
                startPhase('inhale', inhaleDuration);
              }
              break;
            case 'rest':
              setCyclesCompleted(prev => prev + 1);
              startPhase('inhale', inhaleDuration);
              break;
          }
        }
      }, 100);
    };
    
    // Start the breathing cycle
    startPhase('inhale', inhaleDuration);
    
    return () => {
      clearInterval(interval);
    };
  }, [active, inhaleDuration, holdDuration, exhaleDuration, restDuration]);
  
  // Trigger completion callback after 3 cycles
  useEffect(() => {
    if (cyclesCompleted >= 3 && active) {
      onComplete();
    }
  }, [cyclesCompleted, active, onComplete]);
  
  // Calculate progress percentage for the current phase
  const getProgressPercentage = () => {
    const totalDuration = 
      phase === 'inhale' ? inhaleDuration :
      phase === 'hold' ? holdDuration :
      phase === 'exhale' ? exhaleDuration : 
      restDuration;
    
    return ((totalDuration - timeRemaining) / totalDuration) * 100;
  };
  
  return (
    <div className="relative h-48 border rounded-lg bg-background/80 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="text-lg font-medium mb-2 text-center">
          Guided Breathing
        </div>
        
        <div className="relative h-20 w-20 mb-2">
          {/* Circle animation */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={
                phase === 'inhale' ? "hsl(var(--blue-500))" :
                phase === 'hold' ? "hsl(var(--purple-500))" :
                phase === 'exhale' ? "hsl(var(--cyan-500))" :
                "hsl(var(--green-500))"
              }
              strokeWidth="3"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * getProgressPercentage() / 100)}
              transform="rotate(-90 50 50)"
            />
            
            {/* Circle animation */}
            <motion.circle
              cx="50"
              cy="50"
              r={
                phase === 'inhale' ? 
                  35 - (35 * (1 - getProgressPercentage() / 100)) : 
                phase === 'exhale' ? 
                  35 * (1 - getProgressPercentage() / 100) : 
                35
              }
              fill={
                phase === 'inhale' ? "rgba(59, 130, 246, 0.2)" :
                phase === 'hold' ? "rgba(139, 92, 246, 0.2)" :
                phase === 'exhale' ? "rgba(6, 182, 212, 0.2)" :
                "rgba(34, 197, 94, 0.2)"
              }
            />
          </svg>
          
          {/* Text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium capitalize">{phase}</span>
          </div>
        </div>
        
        <div className="text-2xl font-semibold mb-2">
          {timeRemaining.toFixed(1)}s
        </div>
        
        <div className="text-xs text-muted-foreground">
          Cycle {cyclesCompleted + 1}/3 - {cyclesCompleted < 2 ? "Continue breathing..." : "Almost done..."}
        </div>
      </div>
      
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <Button onClick={() => onComplete()}>
            Start Breathing Exercise
          </Button>
        </div>
      )}
    </div>
  );
};

// Detailed insights panel component
const DetailedInsightsPanel = ({ 
  heartRate, 
  hrv, 
  spo2, 
  respirationRate, 
  stressLevel 
}: { 
  heartRate: number | null, 
  hrv: number | null, 
  spo2: number | null, 
  respirationRate: number | null, 
  stressLevel: StressLevel | null 
}) => {
  const [selectedInsight, setSelectedInsight] = useState<'heart' | 'stress' | 'breathing'>('heart');
  
  // Generate heart rate insights
  const getHeartRateInsight = () => {
    if (!heartRate) return null;
    
    if (heartRate < 60) {
      return {
        title: "Bradycardia Detected",
        description: "Your resting heart rate is below 60 BPM, which may indicate bradycardia. This is normal for athletes and well-conditioned individuals, but could suggest potential concerns if you experience dizziness or fatigue.",
        recommendations: [
          "Monitor your energy levels",
          "Consult a doctor if you feel dizzy or unusually tired",
          "Track your heart rate over time to establish your normal baseline"
        ]
      };
    } else if (heartRate > 100) {
      return {
        title: "Elevated Heart Rate",
        description: "Your heart rate is above 100 BPM, which could indicate recent physical activity, stress, or potential tachycardia.",
        recommendations: [
          "Practice deep breathing to help lower your heart rate",
          "Stay hydrated and avoid caffeine",
          "If persistent, consider consulting a healthcare provider"
        ]
      };
    } else {
      return {
        title: "Normal Heart Rate",
        description: "Your heart rate is within the normal resting range (60-100 BPM).",
        recommendations: [
          "Continue regular heart rate monitoring",
          "Exercise regularly to maintain cardiovascular health",
          "Track trends over time for personalized insights"
        ]
      };
    }
  };
  
  // Generate stress insights
  const getStressInsight = () => {
    if (!stressLevel || !hrv) return null;
    
    if (stressLevel.level === 'high') {
      return {
        title: "High Stress Detected",
        description: "Your physiological markers indicate elevated stress levels. Your heart rate variability (HRV) is lower than optimal, suggesting your autonomic nervous system may be in a sympathetic (fight-or-flight) dominant state.",
        recommendations: [
          "Practice guided breathing for 5-10 minutes",
          "Take a short break from screen time",
          "Consider gentle movement or stretching"
        ]
      };
    } else if (stressLevel.level === 'medium') {
      return {
        title: "Moderate Stress Levels",
        description: "Your stress indicators show moderate activation. Your heart rate variability suggests a balance between rest-and-digest and fight-or-flight nervous system activity.",
        recommendations: [
          "Take moment for mindful breathing",
          "Stay hydrated and consider a short break",
          "Monitor changes in stress levels throughout the day"
        ]
      };
    } else {
      return {
        title: "Low Stress Detected",
        description: "Your physiological markers suggest low stress levels. Your heart rate variability indicates good autonomic nervous system balance.",
        recommendations: [
          "Continue activities that maintain this balanced state",
          "Track factors that contribute to your low stress levels",
          "Schedule regular check-ins throughout your day"
        ]
      };
    }
  };
  
  // Generate breathing insights
  const getBreathingInsight = () => {
    if (!respirationRate) return null;
    
    if (respirationRate < 12) {
      return {
        title: "Slow Breathing Pattern",
        description: "Your respiratory rate is below 12 breaths per minute, which is slower than average. This can indicate deep relaxation or potential respiratory depression.",
        recommendations: [
          "If feeling relaxed, this is likely normal and beneficial",
          "Monitor oxygen saturation if available",
          "If you experience shortness of breath, consult a healthcare provider"
        ]
      };
    } else if (respirationRate > 20) {
      return {
        title: "Rapid Breathing Pattern",
        description: "Your respiratory rate is above 20 breaths per minute, which is faster than the typical resting rate. This could indicate physical activity, anxiety, or potential respiratory issues.",
        recommendations: [
          "Practice slowing your breath to 4-6 second inhales and exhales",
          "If anxious, try box breathing (equal inhale, hold, exhale, hold)",
          "If persistent and unexplained, consult a healthcare provider"
        ]
      };
    } else {
      return {
        title: "Normal Breathing Pattern",
        description: "Your respiratory rate is within the normal range of 12-20 breaths per minute.",
        recommendations: [
          "Continue monitoring breathing patterns",
          "Practice breathwork to maintain respiratory health",
          "Consider breath training for enhanced relaxation and focus"
        ]
      };
    }
  };
  
  const heartInsight = getHeartRateInsight();
  const stressInsight = getStressInsight();
  const breathingInsight = getBreathingInsight();
  
  const currentInsight = 
    selectedInsight === 'heart' ? heartInsight :
    selectedInsight === 'stress' ? stressInsight :
    breathingInsight;
  
  return (
    <div className="border rounded-lg overflow-hidden bg-background/80">
      <div className="border-b">
        <nav className="flex" aria-label="Insights navigation">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${selectedInsight === 'heart' ? 'bg-muted border-b-2 border-primary' : ''}`}
            onClick={() => setSelectedInsight('heart')}
          >
            Heart Rate
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${selectedInsight === 'stress' ? 'bg-muted border-b-2 border-primary' : ''}`}
            onClick={() => setSelectedInsight('stress')}
            disabled={!stressLevel}
          >
            Stress
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${selectedInsight === 'breathing' ? 'bg-muted border-b-2 border-primary' : ''}`}
            onClick={() => setSelectedInsight('breathing')}
            disabled={!respirationRate}
          >
            Breathing
          </button>
        </nav>
      </div>
      
      <div className="p-4">
        {currentInsight ? (
          <>
            <h4 className="text-sm font-medium mb-2">{currentInsight.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{currentInsight.description}</p>
            
            <div className="space-y-1">
              <h5 className="text-xs font-medium">Recommendations:</h5>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                {currentInsight.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Complete a measurement to see insights</p>
          </div>
        )}
      </div>
    </div>
  );
};

export function AIProcessingVisualizer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [measuring, setMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [quality, setQuality] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [signalData, setSignalData] = useState<SignalPoint[]>([]);
  const [phase, setPhase] = useState<'idle' | 'calibrating' | 'measuring' | 'analyzing' | 'complete'>('idle');
  const [measurementMode, setMeasurementMode] = useState<'finger' | 'face' | 'sound'>('finger');
  const [measurementHistory, setMeasurementHistory] = useState<HeartRateHistory[]>([]);
  const [healthFactIndex, setHealthFactIndex] = useState(0);
  const [heartScore, setHeartScore] = useState<HeartScore | null>(null);
  const [stressLevel, setStressLevel] = useState<StressLevel | null>(null);
  const [hrv, setHrv] = useState<number | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('measurement');
  const [spo2, setSpo2] = useState<number | null>(null);
  const [spo2Confidence, setSpo2Confidence] = useState(0);
  const [oxygenTrend, setOxygenTrend] = useState<'stable' | 'rising' | 'falling'>('stable');
  const [respirationRate, setRespirationRate] = useState<number | null>(null);
  const [breathingPattern, setBreathingPattern] = useState<'normal' | 'irregular' | 'rapid' | 'slow'>('normal');
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(null);
  const [breathingData, setBreathingData] = useState<number[]>([]);
  const [breathVisualization, setBreathVisualization] = useState<{inhale: boolean, progress: number}>({inhale: true, progress: 0});
  const [emotionData, setEmotionData] = useState<{
    emotion: string;
    confidence: number;
    description: string;
    icon: JSX.Element;
  } | null>(null);
  const [showMusicRecommendation, setShowMusicRecommendation] = useState(false);
  const [musicRecommendation, setMusicRecommendation] = useState<{
    mood: string;
    tempo: string;
    genres: string[];
    color: string;
    icon: JSX.Element;
  } | null>(null);
  const [faceTrackingActive, setFaceTrackingActive] = useState(false);
  const [showAugmentedReality, setShowAugmentedReality] = useState(false);
  const [heartRateHistory, setHeartRateHistory] = useState<{ value: number, timestamp: number }[]>([]);
  const [liveDataInterval, setLiveDataInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLiveDisplayActive, setIsLiveDisplayActive] = useState(false);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [breathingExerciseActive, setBreathingExerciseActive] = useState(false);
  
  const frameDataRef = useRef<number[]>([]);
  const peaksRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const requestAnimationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);
  const [signalQuality, setSignalQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('fair');
  const [accuracyScore, setAccuracyScore] = useState<number>(0);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [enhancedProcessing, setEnhancedProcessing] = useState(true);
  const [hrvHistory, setHrvHistory] = useState<number[]>([]);
  const [showPatternVisualization, setShowPatternVisualization] = useState(false);
  
  // Initialize camera access
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { ideal: measurementMode === 'face' ? "user" : "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setCameraActive(true);
      toast.success("Camera activated successfully");
      
      // Check if torch/flash is available
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      if (capabilities.torch) {
        toast.info("Flash is available for heart rate detection");
      }
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please ensure camera permissions are granted.");
    }
  };

  // Toggle flash/torch
  const toggleFlash = async () => {
    if (!stream) return;
    
    try {
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      
      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashActive }]
        });
        
        setFlashActive(!flashActive);
        toast.success(flashActive ? "Flash turned off" : "Flash turned on");
      } else {
        toast.error("Flash not available on this device");
      }
    } catch (error) {
      console.error("Error toggling flash:", error);
      toast.error("Failed to toggle flash");
    }
  };

  // Toggle audio feedback
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      speakText("Audio feedback enabled");
    }
  };

  // Toggle haptic feedback
  const toggleHaptic = () => {
    setHapticEnabled(!hapticEnabled);
    if (hapticEnabled) {
      triggerHaptic([50]);
    }
  };

  // Process video frame for heart rate detection
  const processFrame = () => {
    if (!canvasRef.current || !videoRef.current || !cameraActive) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;
    
    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    let redAvg = 0;
    
    if (measurementMode === 'finger') {
      // Get the center region of the frame (where the finger would be)
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const regionSize = Math.min(100, Math.floor(canvas.width / 4));
      
      // Extract pixel data from the center region
      const imageData = ctx.getImageData(
        centerX - regionSize / 2,
        centerY - regionSize / 2,
        regionSize,
        regionSize
      );
      
      // Calculate the average red channel value (good for pulse detection)
      let redSum = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        redSum += imageData.data[i]; // Red channel
      }
      redAvg = redSum / (imageData.data.length / 4);
    } else if (measurementMode === 'face') {
      // For face mode, use a larger central region
      const regionSize = Math.min(canvas.width, canvas.height) / 2;
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      
      const imageData = ctx.getImageData(
        centerX - regionSize / 2,
        centerY - regionSize / 2,
        regionSize,
        regionSize
      );
      
      // Use green channel for face detection (better for detecting skin color changes)
      let greenSum = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        greenSum += imageData.data[i + 1]; // Green channel
      }
      redAvg = greenSum / (imageData.data.length / 4);
    }
    
    // Add to frame data array
    frameDataRef.current.push(redAvg);
    
    // Keep only the most recent frames
    if (frameDataRef.current.length > WINDOW_SIZE) {
      frameDataRef.current = frameDataRef.current.slice(-WINDOW_SIZE);
    }
    
    // Skip processing if we don't have enough data yet
    if (frameDataRef.current.length < 60) {
      requestAnimationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }
    
    // Enhanced signal processing pipeline
    const normalizedData = normalizeSignal(frameDataRef.current);
    let processedData;
    
    if (enhancedProcessing) {
      // Apply bandpass filter to isolate heart rate frequency components
      const filteredData = bandpassFilter(normalizedData, 0.5, 3.0, SAMPLING_RATE);
      processedData = movingAverage(filteredData, 5);
      const peaks = findPeaksEnhanced(processedData, 10, true);
      peaksRef.current = peaks;
    } else {
      // Use original processing method
      processedData = movingAverage(normalizedData, 5);
      const peaks = findPeaks(processedData, 0.5, 10);
      peaksRef.current = peaks;
    }
    
    // Add current data point to signal visualization
    const now = Date.now();
    setSignalData(prev => {
      const newData = [...prev, { 
        time: now, 
        value: normalizedData[normalizedData.length - 1], 
        filtered: processedData[processedData.length - 1] 
      }];
      return newData.slice(-100); // Keep only last 100 points for visualization
    });
    
    // Calculate heart rate if we're measuring
    if (measuring) {
      const elapsedTime = now - startTimeRef.current;
      setProgress(Math.min(100, (elapsedTime / MEASUREMENT_DURATION) * 100));
      
      // Use enhanced or standard heart rate calculation
      const [bpm, conf] = enhancedProcessing
        ? calculateHeartRateEnhanced(peaksRef.current, frameDataRef.current.length, SAMPLING_RATE)
        : calculateHeartRate(peaksRef.current, frameDataRef.current.length, SAMPLING_RATE);
      
      if (bpm >= MIN_HR && bpm <= MAX_HR && conf > 0) {
        setHeartRate(bpm);
        setConfidence(conf);
        
        // Update signal quality indicator
        if (conf < 40) {
          setSignalQuality('poor');
          setAccuracyScore(Math.round(conf * 0.8));
        } else if (conf < 60) {
          setSignalQuality('fair');
          setAccuracyScore(Math.round(conf * 0.9));
        } else if (conf < 80) {
          setSignalQuality('good');
          setAccuracyScore(Math.round(conf * 0.95));
        } else {
          setSignalQuality('excellent');
          setAccuracyScore(Math.round(conf));
        }
        
        // Calculate SpO2 after collecting enough data
        if (elapsedTime > 3000 && measurementMode === 'finger') {
          const [calculatedSpo2, spo2Conf] = calculateSpO2(frameDataRef.current, frameDataRef.current.length);
          
          if (calculatedSpo2 > 0 && spo2Conf > 30) {
            // Update SPO2 with small trending if we already have a value
            if (spo2 !== null) {
              // Determine trend
              if (calculatedSpo2 > spo2 + 0.5) {
                setOxygenTrend('rising');
              } else if (calculatedSpo2 < spo2 - 0.5) {
                setOxygenTrend('falling');
              } else {
                setOxygenTrend('stable');
              }
              
              // Smooth the transition
              setSpo2(prev => prev !== null ? (prev * 0.7 + calculatedSpo2 * 0.3) : calculatedSpo2);
            } else {
              setSpo2(calculatedSpo2);
            }
            
            setSpo2Confidence(spo2Conf);
          }
        }
        
        // Calculate HRV
        const calculatedHrv = calculateHRV(peaksRef.current);
        setHrv(calculatedHrv);
        
        // Calculate heart score and stress level after we have enough data
        if (elapsedTime > 5000 && calculatedHrv > 0) {
          setHeartScore(calculateHeartScore(bpm, calculatedHrv));
          setStressLevel(calculateStressLevel(bpm, calculatedHrv));
        }
        
        // Provide feedback based on confidence
        const newQuality = [];
        
        if (conf < 30) newQuality.push("Low signal quality");
        if (peaksRef.current.length < 5) newQuality.push("Not enough heartbeats detected");
        if (bpm > NORMAL_HR_MAX) newQuality.push("Elevated heart rate");
        if (bpm < NORMAL_HR_MIN) newQuality.push("Low heart rate");
        if (conf > 80) newQuality.push("Excellent signal");
        
        setQuality(newQuality);
        
        // Audio feedback
        if (audioEnabled && elapsedTime > 3000 && elapsedTime % 2000 < 100) {
          speakText(`Current heart rate: ${bpm} beats per minute`);
        }
        
        // Haptic feedback for each heartbeat
        if (hapticEnabled && peaksRef.current.includes(frameDataRef.current.length - 1)) {
          triggerHaptic([50]);
        }
        
        // Add to heart rate history for live display
        if (measuring && elapsedTime > 3000) { // Only after 3 seconds to avoid initial noise
          setHeartRateHistory(prev => {
            const newData = [...prev, { value: bpm, timestamp: now }];
            return newData.slice(-20); // Keep only last 20 readings
          });
        }
      }
      
      // Show new health fact every 5 seconds
      if (elapsedTime > 0 && Math.floor(elapsedTime / 5000) > Math.floor((elapsedTime - 100) / 5000)) {
        showRandomHealthFact();
      }
      
      // Check if measurement is complete
      if (elapsedTime >= MEASUREMENT_DURATION) {
        stopMeasurement();
      }
    }
    
    requestAnimationFrameRef.current = requestAnimationFrame(processFrame);
  };

  // Start heart rate measurement
  const startMeasurement = () => {
    if (!cameraActive) {
      toast.error("Please enable camera first");
      return;
    }
    
    frameDataRef.current = [];
    peaksRef.current = [];
    startTimeRef.current = Date.now();
    setSignalData([]);
    setPhase('calibrating');
    setMeasuring(true);
    setProgress(0);
    setHeartRate(null);
    setConfidence(0);
    setHrv(null);
    setHeartScore(null);
    setStressLevel(null);
    setSpo2(null);
    setSpo2Confidence(0);
    setOxygenTrend('stable');
    showRandomHealthFact();
    
    // Turn on flash if available and in finger mode
    if (!flashActive && measurementMode === 'finger') {
      toggleFlash();
    }
    
    // Provide feedback
    if (measurementMode === 'finger') {
      toast.info("Place your finger over the camera lens and hold still");
      if (audioEnabled) {
        speakText("Starting heart rate measurement. Please place your finger over the camera lens and hold still.");
      }
    } else if (measurementMode === 'face') {
      toast.info("Position your face in the center of the camera and stay still");
      if (audioEnabled) {
        speakText("Starting heart rate measurement. Please keep your face centered in the frame and stay still.");
      }
    }
    
    if (hapticEnabled) {
      triggerHaptic([50, 30, 100]);
    }
    
    // Start calibration phase
    setTimeout(() => {
      setPhase('measuring');
    }, 3000);
    
    // Start microphone if not already active
    if (!microphoneActive) {
      startMicrophone();
    }
    
    // If in face mode and AR is enabled, activate face tracking
    if (measurementMode === 'face' && showAugmentedReality) {
      setFaceTrackingActive(true);
    }
    
    // Reset heart rate history
    setHeartRateHistory([]);
    
    // Activate live display
    setIsLiveDisplayActive(true);
  };

  // Stop heart rate measurement
  const stopMeasurement = () => {
    setMeasuring(false);
    setProgress(100);
    setPhase('complete');
    
    // Turn off flash
    if (flashActive && measurementMode === 'finger') {
      toggleFlash();
    }
    
    // Provide final result feedback
    if (heartRate && confidence > 50) {
      toast.success(`Measurement complete: ${heartRate} BPM with ${confidence}% confidence`);
      if (audioEnabled) {
        speakText(`Heart rate measurement complete. Your heart rate is ${heartRate} beats per minute with ${confidence} percent confidence.`);
      }
      if (hapticEnabled) {
        triggerHaptic([50, 50, 50]);
      }
      
      // Save to history
      saveToHistory();
    } else {
      toast.error("Unable to get reliable heart rate. Please try again in better lighting conditions.");
      if (audioEnabled) {
        speakText("Unable to get a reliable heart rate reading. Please try again in better lighting conditions.");
      }
    }
    
    // Deactivate face tracking
    setFaceTrackingActive(false);
  };

  // Initialize microphone for breathing detection
  const startMicrophone = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Audio recording not supported in this browser");
        return;
      }
      
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneStream(audioStream);
      setMicrophoneActive(true);
      toast.success("Microphone activated for breathing detection");
      
      // Set up audio processing
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      
      audioAnalyserRef.current = analyser;
      audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      
      // Start processing audio
      processAudioData();
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Failed to access microphone. Please ensure microphone permissions are granted.");
    }
  };
  
  // Process audio data for breathing detection
  const processAudioData = () => {
    if (!audioAnalyserRef.current || !audioDataRef.current || !microphoneActive) return;
    
    // Get audio data
    audioAnalyserRef.current.getByteTimeDomainData(audioDataRef.current);
    
    // Calculate audio energy level (simple RMS)
    let sum = 0;
    for (let i = 0; i < audioDataRef.current.length; i++) {
      const value = (audioDataRef.current[i] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / audioDataRef.current.length);
    
    // Add to breathing data
    setBreathingData(prev => {
      const newData = [...prev, rms];
      if (newData.length > 300) return newData.slice(-300);
      return newData;
    });
    
    // Detect breathing pattern if measuring
    if (measuring && phase === 'measuring') {
      detectBreathing();
      
      // Simulate breathing visualization
      if (respirationRate) {
        const breathDuration = 60 / respirationRate; // Duration of one breath cycle in seconds
        const now = Date.now();
        const elapsed = (now % (breathDuration * 1000)) / 1000;
        const progress = (elapsed / breathDuration) * 100;
        const inhaling = progress < 50;
        
        setBreathVisualization({
          inhale: inhaling,
          progress: inhaling ? progress * 2 : (100 - progress) * 2
        });
      }
    }
    
    requestAnimationFrame(processAudioData);
  };
  
  // Detect breathing pattern from audio data
  const detectBreathing = () => {
    if (breathingData.length < 150) return;
    
    // In a real system, we would use more sophisticated breath detection algorithms
    // This is a simplified simulation based on audio energy variation
    
    // Smooth data
    const smoothed = movingAverage(breathingData, 10);
    
    // Detect peaks (breaths)
    const peaks = findPeaks(normalizeSignal(smoothed), 0.3, 30);
    
    // Calculate breathing rate (breaths per minute)
    if (peaks.length >= 2) {
      const duration = (breathingData.length / 30); // Duration in seconds
      const breaths = peaks.length;
      const rate = Math.round((breaths / duration) * 60);
      
      // Apply some constraints to make it realistic
      const constrainedRate = Math.min(Math.max(rate, 8), 30);
      setRespirationRate(constrainedRate);
      
      // Determine breathing pattern
      if (constrainedRate < NORMAL_RESP_MIN) {
        setBreathingPattern('slow');
      } else if (constrainedRate > NORMAL_RESP_MAX) {
        setBreathingPattern('rapid');
      } else {
        // Check for irregularity by looking at intervals between breaths
        const intervals = [];
        for (let i = 1; i < peaks.length; i++) {
          intervals.push(peaks[i] - peaks[i - 1]);
        }
        
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variability = intervals.reduce((a, b) => a + Math.abs(b - mean), 0) / intervals.length / mean;
        
        setBreathingPattern(variability > 0.3 ? 'irregular' : 'normal');
      }
    }
  };
  
  // Stop microphone
  const stopMicrophone = () => {
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setMicrophoneActive(false);
    setMicrophoneStream(null);
  };
  
  // Update saveToHistory to include respiration rate
  const saveToHistory = () => {
    if (!heartRate || phase !== 'complete') return;
    
    const newHistory: HeartRateHistory = {
      timestamp: Date.now(),
      heartRate,
      confidence,
      spo2: spo2 ?? undefined,
      respirationRate: respirationRate ?? undefined
    };
    
    setMeasurementHistory(prev => [...prev, newHistory]);
    toast.success("Measurement saved to history");
  };

  // Calculate heart score based on heart rate, variability, and other factors
  const calculateHeartScore = (bpm: number, hrvValue: number): HeartScore => {
    // Base score starts at 85 (good)
    let score = 85;
    
    // Adjust score based on heart rate - optimal is around 60-70 bpm
    if (bpm < NORMAL_HR_MIN) {
      // Too low - could be bradycardia
      score -= 5 * ((NORMAL_HR_MIN - bpm) / 10);
    } else if (bpm > NORMAL_HR_MAX) {
      // Too high - could be tachycardia
      score -= 5 * ((bpm - NORMAL_HR_MAX) / 10);
    } else if (bpm >= 60 && bpm <= 70) {
      // Optimal range
      score += 5;
    }
    
    // Adjust for HRV - higher HRV is generally better (up to a point)
    if (hrvValue < 20) {
      score -= 10;
    } else if (hrvValue >= 20 && hrvValue <= 60) {
      score += (hrvValue - 20) / 4; // Bonus for good HRV
    }
    
    // Cap score between 0-100
    score = Math.min(100, Math.max(0, score));
    
    // Interpretation and color based on score
    let interpretation = '';
    let color = '';
    
    if (score >= 90) {
      interpretation = 'Excellent';
      color = 'green';
    } else if (score >= 75) {
      interpretation = 'Good';
      color = 'blue';
    } else if (score >= 60) {
      interpretation = 'Fair';
      color = 'yellow';
    } else if (score >= 40) {
      interpretation = 'Poor';
      color = 'orange';
    } else {
      interpretation = 'Concerning';
      color = 'red';
    }
    
    return { score: Math.round(score), interpretation, color };
  };
  
  // Calculate stress level based on heart rate and variability
  const calculateStressLevel = (bpm: number, hrvValue: number): StressLevel => {
    // Lower HRV and higher HR typically indicate higher stress
    let stressScore = 0;
    
    // Heart rate component (higher HR = higher stress, especially above resting)
    if (bpm > NORMAL_HR_MAX) {
      stressScore += (bpm - NORMAL_HR_MAX) * 1.5;
    }
    
    // HRV component (lower HRV = higher stress)
    if (hrvValue < 50) {
      stressScore += (50 - hrvValue) * 1.2;
    }
    
    // Adjust and cap score
    stressScore = Math.min(100, Math.max(0, stressScore));
    
    // Determine stress level
    let level: 'low' | 'medium' | 'high' = 'low';
    let interpretation = '';
    let color = '';
    
    if (stressScore < 30) {
      level = 'low';
      interpretation = 'Relaxed';
      color = 'green';
    } else if (stressScore < 60) {
      level = 'medium';
      interpretation = 'Moderate stress';
      color = 'orange';
    } else {
      level = 'high';
      interpretation = 'High stress';
      color = 'red';
    }
    
    return { level, score: Math.round(stressScore), interpretation, color };
  };
  
  // Calculate heart rate variability from peak intervals
  const calculateHRV = (peaks: number[]): number => {
    if (peaks.length < 4) return 0;
    
    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }
    
    // Convert frame intervals to milliseconds
    const msIntervals = intervals.map(i => (i / SAMPLING_RATE) * 1000);
    
    // Calculate RMSSD (Root Mean Square of Successive Differences)
    let sumSquaredDiff = 0;
    for (let i = 1; i < msIntervals.length; i++) {
      const diff = msIntervals[i] - msIntervals[i - 1];
      sumSquaredDiff += diff * diff;
    }
    
    const rmssd = Math.sqrt(sumSquaredDiff / (msIntervals.length - 1));
    return Math.round(rmssd);
  };
  
  // Toggle measurement mode
  const toggleMeasurementMode = (mode: 'finger' | 'face' | 'sound') => {
    if (measuring) {
      toast.error("Cannot change mode during measurement");
      return;
    }
    
    setMeasurementMode(mode);
    
    // Reset camera if active
    if (cameraActive) {
      // Stop current stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
      
      // Restart with new mode
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  };
  
  // Display a new random health fact
  const showRandomHealthFact = () => {
    const newIndex = Math.floor(Math.random() * EXTENDED_HEALTH_FACTS.length);
    setHealthFactIndex(newIndex);
  };

  // Calculate oxygen saturation (SpO2) from red/infrared ratio
  const calculateSpO2 = (redValues: number[], frameCount: number): [number, number] => {
    if (redValues.length < 60 || !measurementMode.includes('finger')) return [0, 0];
    
    // In a real pulse oximeter, we would use both red and infrared LEDs and calculate the ratio
    // Since we only have one camera, we'll simulate using the variations in red channel
    
    // Normalize the red values to simulate red/infrared ratio
    const normalizedRed = normalizeSignal(redValues);
    
    // Calculate the AC and DC components
    const mean = normalizedRed.reduce((a, b) => a + b, 0) / normalizedRed.length;
    const acComponent = Math.sqrt(normalizedRed.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / normalizedRed.length);
    const dcComponent = mean;
    
    // Calculate R value (simplified - in a real device this would be red AC/DC divided by IR AC/DC)
    const rValue = acComponent / dcComponent;
    
    // Simplified SpO2 calculation based on empirical formula
    // Real devices use calibration curves from clinical data
    let calculatedSpo2 = 110 - 25 * rValue;
    
    // Add small natural variation with bias toward normal range
    const naturalVariation = (Math.random() * 2 - 1) * 0.5; // ±0.5%
    const normalBias = calculatedSpo2 < 95 ? 0.5 : calculatedSpo2 > 99 ? -0.3 : 0;
    calculatedSpo2 += naturalVariation + normalBias;
    
    // Clamp to reasonable range
    calculatedSpo2 = Math.min(100, Math.max(70, calculatedSpo2));
    
    // Calculate confidence based on signal quality and frame count
    const confidence = Math.min(100, Math.max(0, 
      50 + // Base confidence
      (frameCount / 60) * 10 + // More data = higher confidence
      (acComponent > 0.05 ? 20 : 0) - // Stronger pulse = higher confidence
      (rValue > 0.7 ? 30 : 0) // Unusual ratio = lower confidence
    ));
    
    return [Math.round(calculatedSpo2 * 10) / 10, Math.round(confidence)];
  };

  // Calculate emotion data when heart rate and HRV are available
  useEffect(() => {
    if (heartRate && hrv) {
      const emotion = detectEmotion(heartRate, hrv, respirationRate);
      setEmotionData(emotion);
      
      // Generate music recommendation based on heart rate
      setMusicRecommendation(getMusicRecommendation(heartRate));
    }
  }, [heartRate, hrv, respirationRate]);
  
  // Toggle augmented reality face tracking
  const toggleAugmentedReality = () => {
    setShowAugmentedReality(!showAugmentedReality);
    
    if (!showAugmentedReality && measurementMode === 'face') {
      setFaceTrackingActive(true);
      toast.success("Augmented reality face tracking activated");
    } else {
      setFaceTrackingActive(false);
    }
  };
  
  // Toggle music recommendation
  const toggleMusicRecommendation = () => {
    setShowMusicRecommendation(!showMusicRecommendation);
    
    if (!showMusicRecommendation && heartRate) {
      toast.success("Music tempo recommendations activated");
    }
  };
  
  // Update heart rate history when heart rate changes
  useEffect(() => {
    if (heartRate && measuring) {
      setHeartRateHistory(prev => {
        const now = Date.now();
        const newData = [...prev, { value: heartRate, timestamp: now }];
        // Keep only last 20 readings
        return newData.slice(-20);
      });
    }
  }, [heartRate, measuring]);
  
  // Clear live data interval on unmount
  useEffect(() => {
    return () => {
      if (liveDataInterval) {
        clearInterval(liveDataInterval);
      }
    };
  }, [liveDataInterval]);

  // Add a toggle for enhanced processing
  const toggleEnhancedProcessing = () => {
    setEnhancedProcessing(!enhancedProcessing);
    toast.success(enhancedProcessing 
      ? "Switched to standard processing" 
      : "Switched to enhanced processing for higher accuracy"
    );
  };

  // Add a toggle for advanced metrics
  const toggleAdvancedMetrics = () => {
    setShowAdvancedMetrics(!showAdvancedMetrics);
  };

  // Update HRV history when HRV changes
  useEffect(() => {
    if (hrv && hrv > 0) {
      setHrvHistory(prev => {
        const newData = [...prev, hrv];
        return newData.slice(-20); // Keep only last 20 readings
      });
    }
  }, [hrv]);
  
  // Toggle pattern visualization
  const togglePatternVisualization = () => {
    setShowPatternVisualization(!showPatternVisualization);
  };
  
  // Toggle breathing guide
  const toggleBreathingGuide = () => {
    setShowBreathingGuide(!showBreathingGuide);
  };
  
  // Toggle insights panel
  const toggleInsightsPanel = () => {
    setShowInsightsPanel(!showInsightsPanel);
  };
  
  // Handle breathing exercise completion
  const handleBreathingComplete = () => {
    setBreathingExerciseActive(false);
    toast.success("Breathing exercise completed!");
  };
  
  // Start breathing exercise
  const startBreathingExercise = () => {
    setBreathingExerciseActive(true);
    toast.info("Follow the breathing guide for optimal relaxation");
  };
  
  return (
    <>
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-full h-[95vh] p-0 flex flex-col bg-gradient-to-b from-primary/90 to-primary/60">
          <div className="absolute top-2 right-2">
            <Button variant="ghost" size="icon" onClick={() => setShowFullscreen(false)}>
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-full p-4 text-white">
            <h2 className="text-2xl font-bold mb-6">Measurement</h2>
            
            {phase === 'calibrating' && (
              <>
                <div className="text-xl mb-4 flex items-center gap-2">
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <HeartPulse className="h-6 w-6" />
                  </motion.div>
                  <span>Preparing...</span>
                </div>
                
                <motion.div 
                  className="w-64 h-64 rounded-full border-4 border-white/50 flex items-center justify-center relative mb-10"
                  animate={{ borderColor: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.2)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div 
                    className="absolute w-full h-full"
                    animate={{ 
                      background: ["rgba(255,255,255,0)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0)"] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.8, 1, 0.8] 
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <HeartPulse className="h-20 w-20" />
                  </motion.div>
                </motion.div>
              </>
            )}
            
            {phase === 'measuring' && heartRate && (
              <>
                <div className="text-xl mb-4 flex items-center gap-2">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <HeartPulse className="h-6 w-6" />
                  </motion.div>
                  <span>Measuring...</span>
                </div>
                
                <motion.div 
                  className="w-72 h-72 rounded-full border-4 border-white/50 flex items-center justify-center relative mb-10"
                  animate={{ 
                    boxShadow: ["0 0 0 0 rgba(255,255,255,0.5)", "0 0 0 20px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0)"]
                  }}
                  transition={{ 
                    duration: 60 / (heartRate || 70),
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.div 
                    className="absolute w-full h-full rounded-full"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ 
                      duration: 60 / (heartRate || 70),
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <motion.span
                    className="text-6xl font-bold"
                    key={heartRate}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {heartRate}
                    <span className="text-2xl font-normal block text-center opacity-70">bpm</span>
                  </motion.span>
                </motion.div>
                
                <div className="w-full max-w-md rounded-xl bg-white/20 backdrop-blur-sm p-4 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <LightbulbIcon className="h-5 w-5 text-yellow-300" />
                    <span className="font-semibold text-yellow-100">Did you know?</span>
                  </div>
                  <p className="text-sm text-white">
                    {EXTENDED_HEALTH_FACTS[healthFactIndex]}
                  </p>
                </div>
              </>
            )}
            
            {phase === 'complete' && heartRate && (
              <>
                <div className="text-2xl font-bold mb-6 text-center">
                  {heartRate}
                  <span className="text-xl font-normal ml-1">bpm</span>
                  <Badge 
                    className="ml-2" 
                    variant={heartRate > NORMAL_HR_MAX ? "destructive" : heartRate < NORMAL_HR_MIN ? "outline" : "default"}
                  >
                    {heartRate > NORMAL_HR_MAX ? "HIGH" : heartRate < NORMAL_HR_MIN ? "LOW" : "NORMAL"}
                  </Badge>
                </div>
                
                <div className="w-72 h-72 mb-8 relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full" />
                  <div className="absolute inset-4 bg-gradient-to-b from-white/10 to-white/5 rounded-full flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="font-bold text-7xl"
                    >
                      {heartRate}
                      <div className="text-xl font-normal text-center mt-2">bpm</div>
                    </motion.div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full max-w-2xl">
                  {/* SPO2 Card */}
                  {spo2 && (
                    <div className="bg-gradient-to-br from-blue-600/40 to-blue-900/40 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center">
                      <div className="text-sm font-semibold mb-1 flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        OXYGEN
                      </div>
                      <div className="text-4xl font-bold flex items-center">
                        {spo2}
                        <span className="text-xl">%</span>
                        <span className="text-2xl ml-1">
                          {oxygenTrend === 'rising' ? '↑' : oxygenTrend === 'falling' ? '↓' : '→'}
                        </span>
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        {spo2 < LOW_SPO2_THRESHOLD 
                          ? "Low oxygen saturation" 
                          : spo2 < NORMAL_SPO2_MIN
                            ? "Borderline saturation"
                            : "Normal saturation"}
                      </div>
                    </div>
                  )}
                  
                  {/* HRV Card */}
                  {hrv && (
                    <div className="bg-gradient-to-br from-purple-600/40 to-purple-900/40 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center">
                      <div className="text-sm font-semibold mb-1 flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        VARIABILITY
                      </div>
                      <div className="text-4xl font-bold">
                        {hrv}
                        <span className="text-xl">ms</span>
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        {hrv < 20 
                          ? "Low variability" 
                          : hrv > 50
                            ? "High variability"
                            : "Normal variability"}
                      </div>
                    </div>
                  )}
                  
                  {/* Respiration Card */}
                  {respirationRate && (
                    <div className="bg-gradient-to-br from-green-600/40 to-green-900/40 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center">
                      <div className="text-sm font-semibold mb-1 flex items-center gap-1">
                        <Wind className="h-4 w-4" />
                        BREATHING
                      </div>
                      <div className="text-4xl font-bold">
                        {respirationRate}
                        <span className="text-xl">/min</span>
                      </div>
                      <div className="text-xs mt-1 opacity-70 capitalize">
                        {breathingPattern} pattern
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Breathing Visualization */}
                {respirationRate && (
                  <div className="w-full max-w-md mb-6">
                    <div className="text-center mb-2 text-sm font-medium">Breathing Pattern</div>
                    <div className="h-16 rounded-xl bg-white/10 overflow-hidden relative">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20" 
                        initial={{ scaleX: 0.5, x: '-50%' }}
                        animate={{ 
                          scaleX: breathVisualization.inhale ? [0.5, 1] : [1, 0.5],
                          x: breathVisualization.inhale ? ['-50%', '0%'] : ['0%', '-50%']
                        }}
                        transition={{ 
                          duration: 60 / (respirationRate * 2), 
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-xs font-medium">
                          {breathVisualization.inhale ? 'Inhale' : 'Exhale'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-center text-sm mb-6 max-w-md">
                  A normal resting heart rate for adults ranges from 60 to 100 beats per minute
                </p>
                
                <div className="w-full max-w-md space-y-4">
                  {heartScore && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="font-semibold">HEART SCORE</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-4xl font-bold">{heartScore.score}</div>
                        <div className="text-right">
                          <div className="text-sm opacity-80">{heartScore.interpretation}</div>
                          {hrv && <div className="text-xs opacity-70">HRV: {hrv}ms</div>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {stressLevel && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5" />
                        <span className="font-semibold">STRESS & ENERGY</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-4xl font-bold">{stressLevel.score}</div>
                        <div className="text-right">
                          <div className="text-sm opacity-80">{stressLevel.interpretation}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary animate-pulse" />
            Heart Rate Monitor
          </CardTitle>
          <CardDescription>
            Uses your camera to measure heart rate in real-time
          </CardDescription>
        </CardHeader>
        
        <CardContent className="mt-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="measurement">Measurement</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="measurement" className="space-y-4">
              {/* Signal Quality Indicator */}
              {cameraActive && heartRate && (
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      signalQuality === 'excellent' ? 'bg-green-500' :
                      signalQuality === 'good' ? 'bg-blue-500' :
                      signalQuality === 'fair' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs font-medium text-muted-foreground capitalize">
                      {signalQuality} signal
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Accuracy: {accuracyScore}%
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={toggleEnhancedProcessing}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${enhancedProcessing ? 'text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Live heart rate display - Always visible when camera is active */}
              {cameraActive && (
                <LiveHeartRateDisplay 
                  heartRate={heartRate} 
                  active={measuring || phase === 'complete'} 
                  historyData={heartRateHistory}
                  showDetails={phase === 'complete'} 
                />
              )}
              
              {/* Measurement mode selector */}
              <div className="flex justify-center gap-2 mb-4">
                <Button 
                  variant={measurementMode === 'finger' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMeasurementMode('finger')}
                  className="flex gap-1"
                >
                  <Flashlight className="h-4 w-4" /> 
                  <span>Finger</span>
                </Button>
                <Button 
                  variant={measurementMode === 'face' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMeasurementMode('face')}
                  className="flex gap-1"
                >
                  <Camera className="h-4 w-4" /> 
                  <span>Face</span>
                </Button>
              </div>
          
              {/* Camera preview */}
              <div className="relative overflow-hidden rounded-lg aspect-video bg-muted/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  {!cameraActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="gap-2"
                        onClick={startCamera}
                      >
                        <Camera className="h-5 w-5" />
                        Enable Camera
                      </Button>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Camera access required for heart rate detection
                      </p>
                    </motion.div>
                  )}
                  
                  {cameraActive && (
                    <AnimatePresence>
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="relative w-full h-full"
                      >
                        <video 
                          ref={videoRef} 
                          className={`w-full h-full object-cover ${measuring ? 'brightness-90' : ''}`}
                          playsInline 
                          muted
                        />
                        
                        {/* Camera overlay */}
                        {measuring ? (
                          <div className="absolute inset-0 overflow-hidden">
                            {/* Background overlay */}
                            <div className={`absolute inset-0 ${measurementMode === 'finger' ? 'bg-gradient-to-b from-red-500/20 to-red-900/30' : 'bg-gradient-to-b from-blue-500/10 to-blue-900/20'}`} />
                            
                            {/* Scan line animation */}
                            <motion.div 
                              className="absolute left-0 right-0 h-[2px] bg-primary/70"
                              initial={{ y: 0 }}
                              animate={{ y: ['0%', '100%', '0%'] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                            
                            {/* Measurement region guide */}
                            {measurementMode === 'finger' ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                  className="w-32 h-32 border-2 border-dashed rounded-full border-primary/70 flex items-center justify-center"
                                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <div className="text-xs text-center text-primary-foreground bg-primary/30 backdrop-blur-sm p-1 rounded">
                                    Place finger here
                                  </div>
                                </motion.div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                  className="w-64 h-64 border-2 border-dashed rounded-full border-primary/50 flex items-center justify-center"
                                  animate={{ scale: [1, 1.02, 1], opacity: [0.6, 0.8, 0.6] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  <div className="w-48 h-48 border border-primary/30 rounded-full flex items-center justify-center">
                                    <div className="text-xs text-center text-primary-foreground bg-primary/20 backdrop-blur-sm p-1 rounded">
                                      Keep face centered
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                            
                            {/* Corner indicators */}
                            <div className="absolute top-2 left-2 flex items-center gap-2">
                              <motion.div 
                                className="h-2 w-2 rounded-full bg-red-500"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                              <span className="text-xs font-medium text-white/90 bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                                RECORDING
                              </span>
                            </div>
                            
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                              <Clock className="h-3 w-3 text-white/70" />
                              <span className="text-xs font-medium text-white/90">
                                {Math.round((Date.now() - startTimeRef.current) / 1000)}s
                              </span>
                            </div>
                            
                            {/* Face tracking overlay */}
                            {measurementMode === 'face' && showAugmentedReality && faceTrackingActive && (
                              <div className="absolute inset-0 z-10 pointer-events-none">
                                <FaceTrackingVisualization active={true} />
                              </div>
                            )}
                            
                            {/* Real-time heart rate overlay */}
                            {heartRate && (
                              <div className="absolute bottom-2 right-2 bg-background/50 backdrop-blur-md p-2 rounded-lg shadow-lg border">
                                <div className="flex items-center gap-2">
                                  <motion.div 
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                      color: ['hsl(0, 70%, 60%)', 'hsl(0, 90%, 50%)', 'hsl(0, 70%, 60%)']
                                    }}
                                    transition={{ 
                                      duration: heartRate ? 60 / heartRate : 1,
                                      repeat: Infinity,
                                    }}
                                  >
                                    <Heart className="h-6 w-6 fill-current text-red-500" />
                                  </motion.div>
                                  <div>
                                    <div className="text-2xl font-bold leading-none">{heartRate}</div>
                                    <div className="text-xs text-muted-foreground">beats/min</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-sm text-center bg-black/20 backdrop-blur-sm p-2 rounded-lg">
                              {measurementMode === 'finger' ? (
                                <p>Ready to measure heart rate and oxygen using your fingertip</p>
                              ) : (
                                <p>Ready to analyze heart rate from your face</p>
                              )}
                            </div>
                            
                            {/* Face tracking demo mode when not measuring but AR is active */}
                            {measurementMode === 'face' && showAugmentedReality && (
                              <div className="absolute inset-0 z-10 pointer-events-none">
                                <FaceTrackingVisualization active={faceTrackingActive} />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Measurement results overlay */}
                        {measuring && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="relative">
                              <motion.div
                                className="absolute inset-0 rounded-full bg-primary/20"
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                  duration: heartRate ? 60 / (heartRate || 70) : 1,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              <div className="h-32 w-32 rounded-full border-2 border-primary flex items-center justify-center bg-background/70 backdrop-blur-md shadow-lg">
                                {heartRate ? (
                                  <motion.div
                                    className="text-center"
                                    key={heartRate}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <span className="text-3xl font-bold text-primary">{heartRate}</span>
                                    <div className="text-xs text-muted-foreground">BPM</div>
                                    
                                    {/* Additional measurement data */}
                                    <div className="mt-1 flex flex-col gap-0.5">
                                      {spo2 && (
                                        <div className="text-xs flex items-center justify-center gap-1">
                                          <Activity className="h-3 w-3 text-blue-500" />
                                          <span className="font-medium text-blue-700 dark:text-blue-400">{spo2}%</span>
                                        </div>
                                      )}
                                      
                                      {respirationRate && (
                                        <div className="text-xs flex items-center justify-center gap-1">
                                          <Wind className="h-3 w-3 text-green-500" />
                                          <span className="font-medium text-green-700 dark:text-green-400">{respirationRate}</span>
                                        </div>
                                      )}
                                      
                                      {emotionData && (
                                        <div className="text-xs flex items-center justify-center gap-1">
                                          <Brain className="h-3 w-3 text-purple-500" />
                                          <span className="font-medium text-purple-700 dark:text-purple-400">{emotionData.emotion}</span>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                ) : (
                                  <span className="text-xl text-muted-foreground font-medium">
                                    {phase === 'calibrating' ? 'Calibrating...' : 'Measuring...'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
                
                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              {/* Progress indicator */}
              {measuring && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{phase === 'calibrating' ? 'Calibrating...' : 'Measuring heart rate...'}</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2">
                    {progress > 15 && heartRate && (
                      <div className="absolute inset-y-0 left-0 flex items-center justify-center w-full">
                        <span className="text-[10px] font-medium text-white drop-shadow-md">
                          {heartRate} BPM
                        </span>
                      </div>
                    )}
                  </Progress>
                  
                  {/* Heart rate trend indicator */}
                  {measuring && phase === 'measuring' && heartRateHistory.length >= 2 && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {heartRateHistory[heartRateHistory.length - 1].value > 
                       heartRateHistory[heartRateHistory.length - 2].value ? (
                        <TrendingUp className="h-3 w-3 text-red-500" />
                      ) : heartRateHistory[heartRateHistory.length - 1].value <
                         heartRateHistory[heartRateHistory.length - 2].value ? (
                        <TrendingDown className="h-3 w-3 text-blue-500" />
                      ) : (
                        <Activity className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-muted-foreground">
                        Heart rate is {
                          heartRateHistory[heartRateHistory.length - 1].value > 
                          heartRateHistory[heartRateHistory.length - 2].value ? 'rising' : 
                          heartRateHistory[heartRateHistory.length - 1].value <
                          heartRateHistory[heartRateHistory.length - 2].value ? 'falling' : 'stable'
                        }
                      </span>
                    </div>
                  )}
                  
                  {/* Health fact during measurement */}
                  <motion.div 
                    className="mt-3 p-3 bg-muted/50 rounded-lg"
                    key={healthFactIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <LightbulbIcon className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Did you know?</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {EXTENDED_HEALTH_FACTS[healthFactIndex]}
                    </p>
                  </motion.div>
                </div>
              )}
              
              {/* Heart rate visualization - improve signal visualization with better colors */}
              {signalData.length > 0 && (
                <div className="h-24 w-full overflow-hidden rounded-md border relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-background/5 to-background/20"></div>
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Reference lines */}
                    <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(100,100,100,0.1)" strokeWidth="0.5" />
                    
                    {/* Signal background area */}
                    <motion.path
                      d={`M 0 100 ${signalData.map((point, i) => {
                        const x = (i / (signalData.length - 1)) * 100;
                        const y = 100 - point.filtered! * 80;
                        return `L ${x} ${y}`;
                      }).join(' ')} L 100 100 Z`}
                      fill="rgba(220, 20, 60, 0.05)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    
                    {/* Signal line with gradient */}
                    <defs>
                      <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(220, 20, 60, 0.5)" />
                        <stop offset="100%" stopColor="rgba(220, 20, 60, 1)" />
                      </linearGradient>
                    </defs>
                    
                    <motion.path
                      d={`M ${signalData.map((point, i) => {
                        const x = (i / (signalData.length - 1)) * 100;
                        const y = 100 - point.filtered! * 80;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}`}
                      fill="none"
                      stroke="url(#signalGradient)"
                      strokeWidth="1.5"
                      animate={{ pathLength: 1, opacity: 1 }}
                      initial={{ pathLength: 0, opacity: 0 }}
                      transition={{ duration: 1 }}
                    />
                    
                    {/* Detected peaks */}
                    {peaksRef.current.map((peakIndex, i) => {
                      if (peakIndex >= frameDataRef.current.length - signalData.length) {
                        const signalIndex = peakIndex - (frameDataRef.current.length - signalData.length);
                        if (signalIndex >= 0 && signalIndex < signalData.length) {
                          const x = (signalIndex / (signalData.length - 1)) * 100;
                          const y = 100 - signalData[signalIndex].filtered! * 80;
                          return (
                            <motion.circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="2"
                              fill="red"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          );
                        }
                      }
                      return null;
                    })}
                  </svg>
                  
                  <div className="absolute bottom-1 right-2 text-xs text-muted-foreground bg-background/70 rounded px-1">
                    Live Signal
                  </div>
                </div>
              )}
              
              {/* Music visualization */}
              {heartRate && showMusicRecommendation && (
                <div className="rounded-md border overflow-hidden">
                  <MusicPulseVisualization bpm={heartRate} active={!measuring || phase === 'complete'} />
                </div>
              )}
              
              {/* Results display */}
              {heartRate && phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold">Health Vitals</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowFullscreen(true)}>
                      <span className="text-xs">View Details</span>
                    </Button>
                  </div>
                  
                  {/* Heart Rate Section */}
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">
                      {heartRate} <span className="text-lg font-normal text-muted-foreground">BPM</span>
                    </div>
                    
                    <Badge 
                      variant={heartRate > NORMAL_HR_MAX ? "destructive" : heartRate < NORMAL_HR_MIN ? "outline" : "default"}
                    >
                      {heartRate > NORMAL_HR_MAX ? "HIGH" : heartRate < NORMAL_HR_MIN ? "LOW" : "NORMAL"}
                    </Badge>
                  </div>
                  
                  {/* SpO2 Section */}
                  {spo2 && (
                    <div className="mt-4 border-t pt-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Oxygen Saturation</span>
                        </div>
                        <Badge 
                          variant={spo2 < LOW_SPO2_THRESHOLD ? "destructive" : "default"}
                          className={spo2 >= NORMAL_SPO2_MIN ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100" : ""}
                        >
                          {spo2 < LOW_SPO2_THRESHOLD ? "LOW" : "NORMAL"}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {spo2}% 
                          <span className="text-sm ml-1 opacity-70">
                            {oxygenTrend === 'rising' ? '↑' : oxygenTrend === 'falling' ? '↓' : '→'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {spo2Confidence}% confidence
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Respiration Section */}
                  {respirationRate && (
                    <div className="mt-4 border-t pt-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Breathing Rate</span>
                        </div>
                        <Badge 
                          variant={
                            breathingPattern === 'normal' ? "default" :
                            breathingPattern === 'irregular' ? "outline" :
                            "destructive"
                          }
                          className={breathingPattern === 'normal' ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100" : ""}
                        >
                          {breathingPattern.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {respirationRate} <span className="text-sm font-normal">breaths/min</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Normal: {NORMAL_RESP_MIN}-{NORMAL_RESP_MAX}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Emotion Detection Section */}
                  {emotionData && (
                    <div className="mt-4 border-t pt-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">Emotional State</span>
                        </div>
                        <Badge 
                          variant="outline"
                          className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100"
                        >
                          {emotionData.confidence}% MATCH
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2">
                          {emotionData.icon}
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {emotionData.emotion}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground max-w-[60%] text-right">
                          {emotionData.description}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Music Recommendation Section */}
                  {showMusicRecommendation && musicRecommendation && (
                    <div className="mt-4 border-t pt-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-indigo-500" />
                          <span className="font-medium">Music Recommendation</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col mt-1">
                        <div className="flex items-center gap-2">
                          {musicRecommendation.icon}
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {musicRecommendation.mood} ({musicRecommendation.tempo})
                          </span>
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          Recommended genres: {musicRecommendation.genres.join(", ")}
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          Music at this tempo can help balance your current heart rate
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-sm">{confidence}% Confidence</span>
                    </div>
                    
                    {hrv && (
                      <div className="flex items-center gap-2">
                        <BarChart4 className="h-4 w-4 text-primary" />
                        <span className="text-sm">HRV: {hrv}ms</span>
                      </div>
                    )}
                  </div>
                  
                  {quality.length > 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      {quality.map((q, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {heartScore && stressLevel && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className={`p-3 rounded-lg bg-${heartScore.color}-50 border border-${heartScore.color}-200`}>
                        <div className="text-xs mb-1 font-medium">Heart Score</div>
                        <div className="flex items-end justify-between">
                          <span className="text-xl font-bold">{heartScore.score}</span>
                          <span className="text-xs">{heartScore.interpretation}</span>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg bg-${stressLevel.color}-50 border border-${stressLevel.color}-200`}>
                        <div className="text-xs mb-1 font-medium">Stress Level</div>
                        <div className="flex items-end justify-between">
                          <span className="text-xl font-bold">{stressLevel.score}</span>
                          <span className="text-xs">{stressLevel.interpretation}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Controls */}
              <div className="flex flex-wrap gap-2 justify-center">
                {cameraActive && (
                  <>
                    <Button
                      variant={measuring ? "destructive" : "default"}
                      className="gap-2"
                      onClick={measuring ? stopMeasurement : startMeasurement}
                    >
                      {measuring ? (
                        <>
                          <motion.span 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mr-1"
                          >
                            ■
                          </motion.span>
                          Stop Measurement
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4" />
                          Measure Vitals
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className={flashActive ? "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100" : ""}
                      onClick={toggleFlash}
                      disabled={measurementMode !== 'finger'}
                    >
                      <Flashlight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className={microphoneActive ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100" : ""}
                      onClick={microphoneActive ? stopMicrophone : startMicrophone}
                    >
                      {microphoneActive ? (
                        <motion.div
                          animate={{ 
                            scale: breathingData.length > 0 && 
                                   breathingData[breathingData.length - 1] > 0.05 ? [1, 1.2, 1] : 1 
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Mic className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <MicOff className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className={audioEnabled ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100" : ""}
                      onClick={toggleAudio}
                    >
                      {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className={hapticEnabled ? "bg-violet-100 text-violet-900 dark:bg-violet-900 dark:text-violet-100" : ""}
                      onClick={toggleHaptic}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setShowFullscreen(true);
                        if (!measuring && heartRate) {
                          // Show completed results in fullscreen
                        } else if (measuring) {
                          // Show live measurement in fullscreen
                        } else {
                          // Show start screen
                          toast.info("Start a measurement to see detailed results");
                        }
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    
                    {/* Augmented Reality toggle */}
                    {measurementMode === 'face' && (
                      <Button
                        variant="outline"
                        size="icon"
                        className={showAugmentedReality ? "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100" : ""}
                        onClick={toggleAugmentedReality}
                      >
                        <Scan className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Music recommendation toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      className={showMusicRecommendation ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100" : ""}
                      onClick={toggleMusicRecommendation}
                    >
                      <Music className="h-4 w-4" />
                    </Button>
                    
                    {/* Pattern visualization toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      className={showPatternVisualization ? "bg-cyan-100 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100" : ""}
                      onClick={togglePatternVisualization}
                      disabled={heartRateHistory.length < 5}
                    >
                      <BarChart4 className="h-4 w-4" />
                    </Button>
                    
                    {/* Breathing guide toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      className={showBreathingGuide ? "bg-cyan-100 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100" : ""}
                      onClick={toggleBreathingGuide}
                    >
                      <Wind className="h-4 w-4" />
                    </Button>
                    
                    {/* Insights panel toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      className={showInsightsPanel ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100" : ""}
                      onClick={toggleInsightsPanel}
                      disabled={phase !== 'complete'}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Instructions */}
              {!measuring && !heartRate && (
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-1 mb-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>For best results:</span>
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    {measurementMode === 'finger' ? (
                      <>
                        <li>Place your fingertip gently over the camera lens</li>
                        <li>Ensure good lighting (turn on flash if needed)</li>
                        <li>Hold your finger still during measurement</li>
                      </>
                    ) : (
                      <>
                        <li>Position your face clearly in the center of the frame</li>
                        <li>Ensure good, even lighting on your face</li>
                        <li>Stay still and avoid talking during measurement</li>
                      </>
                    )}
                    <li>Measurements take about 15 seconds</li>
                  </ul>
                </div>
              )}
              
              {/* 3D Pattern Visualization */}
              {showPatternVisualization && heartRateHistory.length > 5 && (
                <HeartRatePatternVisualization 
                  heartRateData={heartRateHistory.map(data => data.value)}
                  hrvData={hrvHistory.length > 0 ? hrvHistory : Array(heartRateHistory.length).fill(30)}
                  active={!measuring || phase === 'complete'}
                />
              )}
              
              {/* Interactive Breathing Guide */}
              {showBreathingGuide && (
                <InteractiveBreathingGuide
                  active={breathingExerciseActive}
                  respirationRate={respirationRate || 12}
                  heartRate={heartRate || 70}
                  onComplete={handleBreathingComplete}
                />
              )}
              
              {/* Detailed Insights Panel */}
              {showInsightsPanel && phase === 'complete' && (
                <DetailedInsightsPanel
                  heartRate={heartRate}
                  hrv={hrv}
                  spo2={spo2}
                  respirationRate={respirationRate}
                  stressLevel={stressLevel}
                />
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {measurementHistory.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Previous Measurements
                  </h3>
                  
                  {measurementHistory.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="p-3 border rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-lg font-semibold flex items-center gap-1">
                            <Heart className="h-4 w-4 text-primary" />
                            {item.heartRate} <span className="text-xs text-muted-foreground">BPM</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant={item.confidence > 80 ? "default" : "outline"}>
                          {item.confidence}% confidence
                        </Badge>
                      </div>
                      
                      {/* Additional vitals in history */}
                      {(item.spo2 || item.respirationRate) && (
                        <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2">
                          {item.spo2 && (
                            <div className="flex items-center">
                              <Activity className="h-3 w-3 text-blue-500 mr-1" />
                              <span className="text-xs font-medium">
                                SpO2: <span className="font-bold text-blue-600 dark:text-blue-400">{item.spo2}%</span>
                              </span>
                            </div>
                          )}
                          
                          {item.respirationRate && (
                            <div className="flex items-center">
                              <Wind className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-xs font-medium">
                                Resp: <span className="font-bold text-green-600 dark:text-green-400">{item.respirationRate}/min</span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Export button */}
                  <div className="flex justify-center mt-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        // Create CSV data
                        const headers = "Date,Time,Heart Rate (BPM),Confidence (%),SpO2 (%),Respiration Rate (/min)\n";
                        const rows = measurementHistory.map(item => {
                          const date = new Date(item.timestamp);
                          return `${date.toLocaleDateString()},${date.toLocaleTimeString()},${item.heartRate},${item.confidence},${item.spo2 || ''},${item.respirationRate || ''}`;
                        }).join('\n');
                        
                        const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "health_measurements.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        toast.success("Exported measurement history to CSV");
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export Data
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No measurement history yet</p>
                  <p className="text-sm mt-1">Complete a measurement to see it here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}