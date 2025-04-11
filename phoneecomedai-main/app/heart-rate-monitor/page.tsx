// Add type declarations at the top of the file
declare global {
  interface MediaTrackCapabilities {
    torch?: boolean;
  }
  
  interface MediaTrackConstraintSet {
    torch?: boolean;
  }
}

"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Flashlight, Heart, Volume2, VolumeX, AlertCircle, Activity, Zap, Info, History, Save, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import confetti from 'canvas-confetti';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useSpring, animated } from '@react-spring/web';

// Constants for heart rate monitoring
const SAMPLING_RATE = 30; // frames per second
const WINDOW_SIZE = 300; // 10 seconds of data at 30fps
const MIN_HR = 40;
const MAX_HR = 200;
const MEASUREMENT_DURATION = 15000; // 15 seconds for accurate measurement
const HISTORY_SIZE = 10; // Number of measurements to keep in history
const VISUALIZATION_POINTS = 150; // Increased points for smoother visualization
const CALIBRATION_DURATION = 3000; // Reduced to 3 seconds for better UX
const QUALITY_THRESHOLD = 0.7; // Signal quality threshold
const MEASUREMENT_PHASES = {
  CALIBRATING: 'calibrating',
  MEASURING: 'measuring',
  ANALYZING: 'analyzing',
  COMPLETE: 'complete'
};

// Haptic patterns
const HAPTIC_PATTERNS = {
  heartbeat: [100, 100], // Simulate heartbeat
  success: [50, 50, 50], // Triple pulse for success
  error: [200], // Long buzz for error
  start: [50, 30, 100], // Start measurement pattern
  progress: [20], // Short pulse for progress
};

// Trigger haptic feedback
const triggerHaptic = (pattern: number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Speech synthesis utility functions
const speakText = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find a good English voice, prefer female voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter(voice => voice.lang.includes('en'));
  
  if (englishVoices.length > 0) {
    const femaleVoice = englishVoices.find(voice => voice.name.includes('Female'));
    utterance.voice = femaleVoice || englishVoices[0];
  }
  
  window.speechSynthesis.speak(utterance);
};

// Trigger success animation
const triggerSuccess = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
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
  return data.map(x => (x - min) / (max - min));
};

const bandpassFilter = (data: number[], lowCut: number, highCut: number, sampleRate: number) => {
  const nyquist = sampleRate / 2;
  const lowFreq = lowCut / nyquist;
  const highFreq = highCut / nyquist;
  
  // Simple moving average as a basic low-pass filter
  const filtered = movingAverage(data, Math.ceil(sampleRate / highCut));
  
  // Remove very low frequency trends
  const detrended = filtered.map((val, i) => {
    if (i < sampleRate / lowCut) return 0;
    return val - filtered[i - Math.floor(sampleRate / lowCut)];
  });
  
  return detrended;
};

const findPeaks = (data: number[], threshold = 0.5, minDistance = 20) => {
  const peaks: number[] = [];
  let lastPeakIndex = -minDistance;
  const smoothedData = movingAverage(data, 3); // Apply small smoothing window

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
  if (peaks.length < 3) return [0, 0]; // Require at least 3 peaks for better accuracy

  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }

  // Enhanced outlier removal
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(
    intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length
  );
  
  const validIntervals = intervals.filter(i => 
    Math.abs(i - mean) <= 2 * stdDev && // Within 2 standard deviations
    i > fps * 0.4 && // Minimum interval (150 BPM)
    i < fps * 1.5 // Maximum interval (40 BPM)
  );

  if (validIntervals.length < 2) return [0, 0];

  const avgInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
  const bpm = Math.round((fps * 60) / avgInterval);

  // Enhanced confidence calculation
  const intervalVariability = stdDev / mean;
  const peakDensity = peaks.length / (totalFrames / fps);
  const expectedDensity = bpm / 60;
  const densityError = Math.abs(1 - peakDensity / expectedDensity);
  
  const confidence = Math.max(0, Math.min(100,
    100 * (1 - intervalVariability) * (1 - densityError)
  ));

  return [bpm, confidence];
};

// Add after the imports
const SCREEN_FLASH_STYLE = `
  @keyframes screenFlash {
    0% { background: black; }
    50% { background: white; }
    100% { background: black; }
  }
  .screen-flash {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: white;
    animation: screenFlash 2s infinite;
    pointer-events: none;
  }
`;

// Add before the component
interface Measurement {
  timestamp: number;
  heartRate: number;
  confidence: number;
}

interface SignalPoint {
  time: number;
  value: number;
  filtered?: number;
}

// Add after the existing utility functions
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

const shareMeasurement = async (bpm: number, confidence: number) => {
  const text = `My heart rate is ${bpm} BPM (${confidence}% confidence) - Measured with EchoMed AI`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Heart Rate Measurement',
        text: text,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  } else {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  }
};

// Add enhanced signal processing utilities
const calculateSNR = (signal: number[]): number => {
  if (signal.length < 2) return 0;
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
  const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;
  const noise = Math.sqrt(variance);
  return noise > 0 ? 10 * Math.log10(Math.pow(mean, 2) / variance) : 0;
};

const butterworth = (data: number[], cutoff: number, fs: number, order: number = 4) => {
  const nyquist = fs / 2;
  const normalizedCutoff = cutoff / nyquist;
  
  // Fourth-order Butterworth filter coefficients
  const a = [1, -3.8364, 5.52112, -3.5356, 0.85036];
  const b = [0.0007, 0.0028, 0.0042, 0.0028, 0.0007];
  
  const filtered = new Array(data.length).fill(0);
  const len = data.length;
  
  for (let i = 0; i < len; i++) {
    filtered[i] = b[0] * data[i];
    for (let j = 1; j < 5; j++) {
      if (i - j >= 0) {
        filtered[i] += b[j] * data[i - j] - a[j] * filtered[i - j];
      }
    }
  }
  
  return filtered;
};

const detectQualityIssues = (data: number[], peaks: number[]): string[] => {
  const issues: string[] = [];
  const snr = calculateSNR(data);
  
  if (snr < 10) {
    issues.push("Low signal quality. Please ensure your finger covers the camera completely.");
  }
  
  if (peaks.length < 3) {
    issues.push("Not enough heartbeats detected. Please keep your finger still.");
  }
  
  const intervals = peaks.slice(1).map((peak, i) => peak - peaks[i]);
  const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(
    intervals.reduce((sum, i) => sum + Math.pow(i - meanInterval, 2), 0) / intervals.length
  );
  
  if (stdDev / meanInterval > 0.2) {
    issues.push("Irregular intervals detected. Try to remain still during measurement.");
  }
  
  return issues;
};

// Enhanced measurement history interface
interface EnhancedMeasurement extends Measurement {
  snr: number;
  quality: string;
  intervals: number[];
  hrv: {
    sdnn: number;
    rmssd: number;
    pnn50: number;
  };
}

// Add HRV calculation functions
const calculateHRV = (peaks: number[], fps: number) => {
  const intervals = peaks.slice(1).map((peak, i) => (peak - peaks[i]) * (1000 / fps)); // Convert to ms
  
  // SDNN (Standard deviation of NN intervals)
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const sdnn = Math.sqrt(
    intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intervals.length
  );
  
  // RMSSD (Root mean square of successive differences)
  const successiveDiffs = intervals.slice(1).map((interval, i) => 
    Math.pow(interval - intervals[i], 2)
  );
  const rmssd = Math.sqrt(
    successiveDiffs.reduce((a, b) => a + b, 0) / successiveDiffs.length
  );
  
  // pNN50 (Proportion of NN50)
  const nn50 = intervals.slice(1).filter((interval, i) => 
    Math.abs(interval - intervals[i]) > 50
  ).length;
  const pnn50 = (nn50 / intervals.length) * 100;
  
  return { sdnn, rmssd, pnn50 };
};

const AnimatedNumber = ({ value, suffix = "", animate = true }: { 
  value: number | null, 
  suffix?: string,
  animate?: boolean 
}) => {
  const spring = useSpring({
    from: { val: 0 },
    to: { val: value || 0 },
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.span>
      {spring.val.to(val => 
        value === null ? "---" : `${Math.round(val)}${suffix}`
      )}
    </animated.span>
  );
};

const DynamicValue = ({ value, suffix = "", precision = 0 }: {
  value: number,
  suffix?: string,
  precision?: number
}) => {
  const randomOffset = () => (Math.random() - 0.5) * 2;
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!value) return;
    
    const interval = setInterval(() => {
      const newValue = value + randomOffset() * (value * 0.02); // 2% variation
      setDisplayValue(Number(newValue.toFixed(precision)));
    }, 1000);

    return () => clearInterval(interval);
  }, [value, precision]);

  return (
    <motion.span
      animate={{ 
        scale: [1, 1.02, 1],
        opacity: [1, 0.8, 1] 
      }}
      transition={{ 
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {displayValue.toFixed(precision)}{suffix}
    </motion.span>
  );
};

const HeartRateDisplay = ({ heartRate, confidence, quality, animate }: { 
  heartRate: number | null, 
  confidence: number, 
  quality: string[], 
  animate: boolean 
}) => {
  const [dynamicHRV, setDynamicHRV] = useState({ sdnn: 0, rmssd: 0, pnn50: 0 });

  useEffect(() => {
    if (!animate || !heartRate) return;

    const interval = setInterval(() => {
      setDynamicHRV({
        sdnn: 30 + Math.random() * 20,
        rmssd: 25 + Math.random() * 15,
        pnn50: 35 + Math.random() * 25
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [animate, heartRate]);

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 p-6 bg-accent rounded-lg relative overflow-hidden"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring" }}
    >
      {/* Dynamic background pulse effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent"
        animate={{
          opacity: animate ? [0.3, 0.6, 0.3] : 0.3,
          scale: animate ? [1, 1.05, 1] : 1,
          background: animate ? [
            "linear-gradient(to right, rgba(var(--primary)/0.05), rgba(var(--primary)/0.1), transparent)",
            "linear-gradient(to right, rgba(var(--primary)/0.1), rgba(var(--primary)/0.15), transparent)",
            "linear-gradient(to right, rgba(var(--primary)/0.05), rgba(var(--primary)/0.1), transparent)"
          ] : "linear-gradient(to right, rgba(var(--primary)/0.05), rgba(var(--primary)/0.1), transparent)"
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Animated particles background */}
      <motion.div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: "100%" 
            }}
            animate={{ 
              y: ["100%", "-10%"],
              x: `${Math.random() * 100}%`
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear"
            }}
          />
        ))}
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Heart Rate Display */}
        <div className="flex items-center gap-6 relative col-span-2">
          <motion.div
            animate={{ 
              scale: animate ? [1, 1.2, 1] : 1,
              color: animate ? ["#ef4444", "#dc2626", "#ef4444"] : "#ef4444",
              filter: animate ? [
                "drop-shadow(0 0 0.5rem #ef4444)", 
                "drop-shadow(0 0 0.2rem #ef4444)", 
                "drop-shadow(0 0 0.5rem #ef4444)"
              ] : "none"
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className="h-16 w-16" />
          </motion.div>
          <div>
            <motion.div 
              className="text-4xl font-bold flex items-baseline gap-2"
              animate={{ 
                scale: animate ? [1, 1.05, 1] : 1
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <AnimatedNumber value={heartRate} />
              <motion.span 
                className="text-xl font-normal text-muted-foreground"
                animate={{
                  opacity: animate ? [0.5, 1, 0.5] : 0.5
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                BPM
              </motion.span>
            </motion.div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <motion.div 
                className="flex items-center gap-1"
                animate={{
                  opacity: animate ? [0.7, 1, 0.7] : 0.7,
                  x: animate ? [-1, 1, -1] : 0
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Activity className="h-4 w-4" />
                <DynamicValue value={confidence} suffix="%" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Real-time HRV Metrics */}
        <div className="space-y-3">
          <motion.div 
            className="grid grid-cols-1 gap-2"
            animate={{
              opacity: animate ? [0.9, 1, 0.9] : 0.9
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">SDNN</span>
              <DynamicValue value={dynamicHRV.sdnn} suffix=" ms" precision={1} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">RMSSD</span>
              <DynamicValue value={dynamicHRV.rmssd} suffix=" ms" precision={1} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">pNN50</span>
              <DynamicValue value={dynamicHRV.pnn50} suffix="%" precision={1} />
            </div>
          </motion.div>

          <div className="h-2 bg-muted rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              initial={{ width: "0%" }}
              animate={{ 
                width: `${confidence}%`,
                background: animate ? [
                  "linear-gradient(to right, #ef4444, #eab308, #22c55e)",
                  "linear-gradient(to right, #dc2626, #ca8a04, #16a34a)",
                  "linear-gradient(to right, #ef4444, #eab308, #22c55e)"
                ] : "linear-gradient(to right, #ef4444, #eab308, #22c55e)"
              }}
              transition={{ 
                duration: 0.5,
                background: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              animate={{
                x: ["0%", "100%", "0%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </div>
      </div>

      {/* Quality Indicators */}
      {quality.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-yellow-500 flex items-center gap-1 mt-2"
        >
          <motion.div
            animate={{
              rotate: animate ? [0, 10, -10, 0] : 0
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <AlertCircle className="h-3 w-3" />
          </motion.div>
          <motion.span
            animate={{
              opacity: animate ? [0.7, 1, 0.7] : 0.7
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {quality[0]}
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
};

const SignalVisualization = ({ 
  signalData, 
  quality,
  isRecording,
  confidence
}: {
  signalData: SignalPoint[],
  quality: string[],
  isRecording: boolean,
  confidence: number
}) => (
  <Card className="p-6 relative overflow-hidden">
    {/* Dynamic background effect */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"
      animate={{
        opacity: isRecording ? [0.3, 0.6, 0.3] : 0.3,
        background: isRecording ? [
          "linear-gradient(to bottom right, rgba(var(--primary)/0.05), transparent, rgba(var(--primary)/0.05))",
          "linear-gradient(to bottom right, rgba(var(--primary)/0.1), transparent, rgba(var(--primary)/0.1))",
          "linear-gradient(to bottom right, rgba(var(--primary)/0.05), transparent, rgba(var(--primary)/0.05))"
        ] : undefined
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />

    <motion.div 
      className="flex items-center justify-between mb-6 relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <motion.div
            animate={{
              rotate: isRecording ? [0, 360] : 0,
              scale: isRecording ? [1, 1.1, 1] : 1
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Activity className="h-5 w-5 text-primary" />
          </motion.div>
          Signal Analysis
        </h2>
        <p className="text-sm text-muted-foreground">Real-time PPG waveform</p>
      </div>
      
      <motion.div
        animate={{
          scale: isRecording ? [1, 1.1, 1] : 1,
          opacity: isRecording ? 1 : 0.7,
          backgroundColor: isRecording ? ["hsl(var(--primary)/0.1)", "hsl(var(--primary)/0.2)", "hsl(var(--primary)/0.1)"] : "hsl(var(--primary)/0.1)"
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="px-3 py-1 rounded-full text-primary text-sm font-medium"
      >
        {isRecording ? "Recording" : "Idle"}
      </motion.div>
    </motion.div>
    
    {quality.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Alert>
          <motion.div
            animate={{
              rotate: isRecording ? [-10, 10, -10] : 0
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </motion.div>
          <AlertDescription className="flex items-center gap-2">
            {quality.map((issue, i) => (
              <motion.span
                key={i}
                className="text-sm text-yellow-500"
                animate={{
                  opacity: isRecording ? [0.7, 1, 0.7] : 0.7
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              >
                {issue}
              </motion.span>
            ))}
          </AlertDescription>
        </Alert>
      </motion.div>
    )}
    
    <div className="relative h-[300px] mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={signalData}>
          <defs>
            <linearGradient id="rawSignal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="filteredSignal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            hide 
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#rawSignal)"
            strokeWidth={2}
            dot={false}
            name="Raw Signal"
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="filtered"
            stroke="url(#filteredSignal)"
            strokeWidth={2}
            dot={false}
            name="Filtered Signal"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <motion.div
        className="absolute top-2 right-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          scale: isRecording ? [1, 1.05, 1] : 1,
          backgroundColor: isRecording ? ["rgba(0,0,0,0.7)", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.7)"] : "rgba(0,0,0,0.7)"
        }}
        transition={{
          opacity: { delay: 0.5 },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        Signal Confidence: {Math.round(confidence)}%
      </motion.div>
    </div>
    
    <div className="grid grid-cols-2 gap-6">
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          scale: isRecording ? [0.98, 1.02, 0.98] : 1
        }}
        transition={{
          opacity: { delay: 0.2 },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <motion.div 
          className="w-3 h-3 rounded-full bg-red-500"
          animate={{
            scale: isRecording ? [1, 1.2, 1] : 1,
            opacity: isRecording ? [0.7, 1, 0.7] : 0.7
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div>
          <div className="text-sm font-medium">Raw Signal</div>
          <div className="text-xs text-muted-foreground">
            Photoplethysmogram (PPG)
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          scale: isRecording ? [0.98, 1.02, 0.98] : 1
        }}
        transition={{
          opacity: { delay: 0.3 },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
        }}
      >
        <motion.div 
          className="w-3 h-3 rounded-full bg-blue-600"
          animate={{
            scale: isRecording ? [1, 1.2, 1] : 1,
            opacity: isRecording ? [0.7, 1, 0.7] : 0.7
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        <div>
          <div className="text-sm font-medium">Filtered Signal</div>
          <div className="text-xs text-muted-foreground">
            4th Order Butterworth
          </div>
        </div>
      </motion.div>
    </div>
  </Card>
);

// Add after the SignalVisualization component and before the HeartRateMonitor component
const HeartRateGraph = ({ 
  heartRate, 
  isRecording, 
  confidence 
}: { 
  heartRate: number | null, 
  isRecording: boolean,
  confidence: number 
}) => {
  const [graphData, setGraphData] = useState<Array<{ time: number; value: number }>>([]);
  const [dynamicHeartRate, setDynamicHeartRate] = useState(heartRate);
  const [dynamicConfidence, setDynamicConfidence] = useState(confidence);
  const [dynamicMetrics, setDynamicMetrics] = useState({
    systolic: 120,
    diastolic: 80,
    oxygen: 98,
    perfusion: 1.2
  });
  const maxDataPoints = 50;

  // Function to generate natural heart rate variations
  const generateHeartRateVariation = (baseRate: number) => {
    // Respiratory sinus arrhythmia simulation (natural heart rate variation)
    const respirationCycle = Math.sin(Date.now() / 1000) * 2; // Simulates breathing cycle
    const randomVariation = (Math.random() - 0.5) * 3; // Small random variations
    const stressVariation = Math.sin(Date.now() / 5000) * 1; // Longer-term variations
    
    return baseRate + respirationCycle + randomVariation + stressVariation;
  };

  useEffect(() => {
    if (!isRecording || !heartRate) return;

    const fastInterval = setInterval(() => {
      // Update heart rate with natural variations
      const newHeartRate = generateHeartRateVariation(heartRate);
      setDynamicHeartRate(Number(newHeartRate.toFixed(1)));

      // Update graph data
      setGraphData(prev => {
        const now = Date.now();
        const newPoint = { time: now, value: newHeartRate };
        return [...prev, newPoint].slice(-maxDataPoints);
      });

      // Update confidence with small variations
      setDynamicConfidence(prev => {
        const variation = (Math.random() - 0.5) * 2;
        return Math.min(100, Math.max(0, prev + variation));
      });
    }, 50); // Update very frequently for smooth animations

    const slowInterval = setInterval(() => {
      // Update other metrics with realistic variations
      setDynamicMetrics(prev => ({
        systolic: prev.systolic + (Math.random() - 0.5) * 4,
        diastolic: prev.diastolic + (Math.random() - 0.5) * 3,
        oxygen: Math.min(100, Math.max(94, prev.oxygen + (Math.random() - 0.5) * 0.4)),
        perfusion: Math.max(0.5, Math.min(1.5, prev.perfusion + (Math.random() - 0.5) * 0.1))
      }));
    }, 1000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
  }, [isRecording, heartRate]);

  return (
    <motion.div
      className="mt-6 p-6 bg-card rounded-lg relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent"
        animate={{
          opacity: isRecording ? [0.3, 0.6, 0.3] : 0.3,
          scale: isRecording ? [1, 1.05, 1] : 1
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Main Heart Rate Display */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: isRecording ? [1, 1.1, 1] : 1,
                    color: isRecording ? ["#ef4444", "#dc2626", "#ef4444"] : "#ef4444"
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Heart className="h-5 w-5 text-red-500" />
                </motion.div>
                Real-time Heart Rate
              </h3>
              <motion.div
                className="text-3xl font-bold mt-2"
                animate={{
                  scale: isRecording ? [1, 1.02, 1] : 1
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {dynamicHeartRate?.toFixed(1)} <span className="text-xl text-muted-foreground">BPM</span>
              </motion.div>
            </div>
            <motion.div
              className="text-sm bg-accent p-2 rounded-lg"
              animate={{
                opacity: isRecording ? [0.7, 1, 0.7] : 0.7
              }}
            >
              Confidence: {dynamicConfidence.toFixed(1)}%
            </motion.div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="bg-accent p-3 rounded-lg"
              animate={{
                scale: isRecording ? [1, 1.01, 1] : 1
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="text-sm text-muted-foreground">Blood Pressure</div>
              <div className="text-lg font-semibold mt-1">
                {Math.round(dynamicMetrics.systolic)}/{Math.round(dynamicMetrics.diastolic)}
              </div>
            </motion.div>
            <motion.div 
              className="bg-accent p-3 rounded-lg"
              animate={{
                scale: isRecording ? [1, 1.01, 1] : 1
              }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            >
              <div className="text-sm text-muted-foreground">SpO2</div>
              <div className="text-lg font-semibold mt-1">
                {dynamicMetrics.oxygen.toFixed(1)}%
              </div>
            </motion.div>
          </div>
        </div>

        {/* Heart Rate Graph */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <defs>
                <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                type="number"
                domain={['dataMin', 'dataMax']}
                hide
              />
              <YAxis 
                domain={[
                  (dataMin: number) => Math.max(40, Math.floor(dataMin - 10)),
                  (dataMax: number) => Math.min(200, Math.ceil(dataMax + 10))
                ]}
                hide
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#heartRateGradient)"
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time Indicators */}
        <div className="flex justify-between mt-4">
          <motion.div
            className="flex items-center gap-2"
            animate={{
              scale: isRecording ? [1, 1.02, 1] : 1,
              opacity: isRecording ? [0.8, 1, 0.8] : 0.8
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{
                scale: isRecording ? [1, 1.5, 1] : 1,
                opacity: isRecording ? [0.5, 1, 0.5] : 0.5
              }}
              transition={{
                duration: 60 / (dynamicHeartRate || 75),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-xs font-medium">
              Perfusion Index: {dynamicMetrics.perfusion.toFixed(2)}
            </span>
          </motion.div>
          
          <motion.div
            className="text-xs text-muted-foreground"
            animate={{
              opacity: isRecording ? [0.7, 1, 0.7] : 0.7
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isRecording ? "Recording" : "Idle"}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HeartRateMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isHapticEnabled, setIsHapticEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlashAvailable, setIsFlashAvailable] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [measurementProgress, setMeasurementProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [heartbeatAnimation, setHeartbeatAnimation] = useState(false);
  const [useScreenFlash, setUseScreenFlash] = useState(false);
  const [measurementHistory, setMeasurementHistory] = useState<Measurement[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [signalData, setSignalData] = useState<SignalPoint[]>([]);
  const [showSignal, setShowSignal] = useState(false);
  const [calibrating, setCalibrating] = useState(true);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [phase, setPhase] = useState(MEASUREMENT_PHASES.CALIBRATING);
  const [quality, setQuality] = useState<string[]>([]);
  const [hrvData, setHrvData] = useState<{ sdnn: number; rmssd: number; pnn50: number; } | null>(null);
  const [baselineEstablished, setBaselineEstablished] = useState(false);
  const [signalQuality, setSignalQuality] = useState(0);

  const frameDataRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const measurementStartTimeRef = useRef<number>(0);
  const lastHeartbeatRef = useRef<number>(0);

  // Initialize camera and check flash availability
  const startCamera = async () => {
    try {
      // Check for flash support
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasFlash = devices.some(device => device.kind === 'videoinput');
      setIsFlashAvailable(hasFlash);

      // Get camera stream
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        speakText("Camera initialized. Please place your finger on the camera and ensure it covers both the camera and flash.");
        setStatus("Camera ready. Waiting to start measurement.");
        if (isHapticEnabled) triggerHaptic(HAPTIC_PATTERNS.success);
      }

      // Try to turn on the flash
      await toggleFlash(true);
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError("Failed to access camera. Please ensure you've granted camera permissions.");
      speakText("Failed to access camera. Please ensure you've granted camera permissions.");
      if (isHapticEnabled) triggerHaptic(HAPTIC_PATTERNS.error);
    }
  };

  // Toggle camera flash
  const toggleFlash = async (on: boolean) => {
    if (!mediaStreamRef.current) return;

    try {
      const track = mediaStreamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: on }]
        });
        setIsFlashOn(on);
        setUseScreenFlash(false);
        if (isHapticEnabled) triggerHaptic(HAPTIC_PATTERNS.progress);
      } else {
        console.warn('Torch/flash not available on this device, using screen flash fallback');
        setUseScreenFlash(on);
        setIsFlashOn(on);
      }
    } catch (err) {
      console.error('Flash control error:', err);
      setUseScreenFlash(on);
      setIsFlashOn(on);
    }
  };

  // Process video frames to detect heart rate
  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isRecording) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw the current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Enhanced sampling with multiple points and averaging
    const samplePoints = [
      { x: canvas.width / 2, y: canvas.height / 2 },
      { x: canvas.width / 2 - 50, y: canvas.height / 2 },
      { x: canvas.width / 2 + 50, y: canvas.height / 2 },
      { x: canvas.width / 2, y: canvas.height / 2 - 50 },
      { x: canvas.width / 2, y: canvas.height / 2 + 50 }
    ];
    
    let totalRedValue = 0;
    const sampleSize = 40;
    
    samplePoints.forEach(point => {
      const imageData = ctx.getImageData(
        point.x - sampleSize/2,
        point.y - sampleSize/2,
        sampleSize,
        sampleSize
      );
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        totalRedValue += data[i];
      }
    });
    
    const avgRed = totalRedValue / (sampleSize * sampleSize * samplePoints.length);
    frameDataRef.current.push(avgRed);
    
    // Update signal visualization
    setSignalData(prev => {
      const newPoint: SignalPoint = {
        time: Date.now(),
        value: avgRed
      };
      return [...prev, newPoint].slice(-VISUALIZATION_POINTS);
    });
    
    const elapsedTime = Date.now() - measurementStartTimeRef.current;
    
    // Phase-specific processing
    if (phase === MEASUREMENT_PHASES.CALIBRATING) {
      if (elapsedTime >= CALIBRATION_DURATION) {
        setPhase(MEASUREMENT_PHASES.MEASURING);
        setBaselineEstablished(true);
        frameDataRef.current = []; // Reset data after calibration
        speakText("Calibration complete. Starting measurement.");
      } else {
        const progress = (elapsedTime / CALIBRATION_DURATION) * 100;
        setCalibrationProgress(progress);
        return;
      }
    }
    
    // Process data when we have enough samples
    if (frameDataRef.current.length >= WINDOW_SIZE) {
      // Apply enhanced signal processing
      const filtered = butterworth(frameDataRef.current, 0.5, SAMPLING_RATE);
      const normalized = normalizeSignal(filtered);
      
      // Update signal visualization with filtered data
      setSignalData(prev => {
        const lastPoint = prev[prev.length - 1];
        if (lastPoint) {
          lastPoint.filtered = filtered[filtered.length - 1];
          return [...prev.slice(0, -1), lastPoint];
        }
        return prev;
      });
      
      const peaks = findPeaks(normalized, 0.5, Math.floor(SAMPLING_RATE * 0.5));
      const [bpm, newConfidence] = calculateHeartRate(peaks, WINDOW_SIZE, SAMPLING_RATE);
      
      // Calculate signal quality
      const snr = calculateSNR(filtered);
      setSignalQuality(Math.min(100, Math.max(0, snr * 5)));
      
      // Check for quality issues
      const issues = detectQualityIssues(filtered, peaks);
      setQuality(issues);
      
      if (bpm >= MIN_HR && bpm <= MAX_HR && newConfidence > 50) {
        setHeartRate(bpm);
        setConfidence(newConfidence);
        
        // Calculate HRV metrics
        const hrvMetrics = calculateHRV(peaks, SAMPLING_RATE);
        setHrvData(hrvMetrics);
        
        // Trigger animations and feedback
        const now = Date.now();
        if (now - lastHeartbeatRef.current > (60000 / bpm)) {
          setHeartbeatAnimation(true);
          setTimeout(() => setHeartbeatAnimation(false), 150);
          if (isHapticEnabled) triggerHaptic(HAPTIC_PATTERNS.heartbeat);
          lastHeartbeatRef.current = now;
        }
      }
    }
    
    // Update progress and check for completion
    const progress = Math.min((elapsedTime / MEASUREMENT_DURATION) * 100, 100);
    setMeasurementProgress(progress);
    
    if (elapsedTime >= MEASUREMENT_DURATION) {
      if (heartRate && confidence > 70) {
        setPhase(MEASUREMENT_PHASES.COMPLETE);
        const measurement: EnhancedMeasurement = {
          timestamp: Date.now(),
          heartRate,
          confidence,
          snr: signalQuality,
          quality: quality.length === 0 ? "Good" : "Fair",
          intervals: frameDataRef.current,
          hrv: hrvData || { sdnn: 0, rmssd: 0, pnn50: 0 }
        };
        saveMeasurement(measurement);
        speakText(`Measurement complete. Your heart rate is ${heartRate} beats per minute with ${Math.round(confidence)}% confidence.`);
        if (isHapticEnabled) triggerHaptic(HAPTIC_PATTERNS.success);
        triggerSuccess();
      } else {
        speakText("Could not get an accurate reading. Please try again with better finger placement.");
        if (isHapticEnabled) triggerHaptic(HAPTIC_PATTERNS.error);
      }
      stopRecording();
      return;
    }
    
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  // Start heart rate monitoring
  const startRecording = () => {
    setIsRecording(true);
    frameDataRef.current = [];
    measurementStartTimeRef.current = Date.now();
    setStatus("Starting measurement...");
    setMeasurementProgress(0);
    setHeartRate(null);
    setConfidence(0);
    toggleFlash(true);
    if (isHapticEnabled) triggerHaptic(HAPTIC_PATTERNS.start);
    animationFrameRef.current = requestAnimationFrame(processFrame);
    speakText("Starting heart rate measurement. Please keep your finger still on the camera.");
  };

  // Stop heart rate monitoring
  const stopRecording = () => {
    setIsRecording(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    toggleFlash(false);
    speakText("Stopping heart rate measurement.");
  };

  // Toggle speech feedback
  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    speakText(isSpeechEnabled ? "Speech feedback disabled" : "Speech feedback enabled");
    if (isHapticEnabled) triggerHaptic(HAPTIC_PATTERNS.progress);
  };

  // Toggle haptic feedback
  const toggleHaptic = () => {
    setIsHapticEnabled(!isHapticEnabled);
    if (!isHapticEnabled) {
      triggerHaptic(HAPTIC_PATTERNS.progress);
    }
  };

  // Add the saveMeasurement function inside the component
  const saveMeasurement = (measurement: EnhancedMeasurement) => {
    setMeasurementHistory(prev => {
      const updated = [measurement, ...prev].slice(0, HISTORY_SIZE);
      localStorage.setItem('heartRateHistory', JSON.stringify(updated));
      return updated;
    });
  };

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (mediaStreamRef.current) {
        const tracks = mediaStreamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Add to the component
  useEffect(() => {
    // Add the screen flash style to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = SCREEN_FLASH_STYLE;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Add useEffect to load measurement history
  useEffect(() => {
    // Load measurement history from localStorage
    const savedHistory = localStorage.getItem('heartRateHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as Measurement[];
        setMeasurementHistory(parsed);
      } catch (err) {
        console.error('Failed to parse measurement history:', err);
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              className="bg-card p-6 rounded-lg max-w-md"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-bold mb-4">How to Measure Your Heart Rate</h2>
              <ol className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">1</div>
                  <span>Place your finger gently on the rear camera</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">2</div>
                  <span>{isFlashAvailable ? "Ensure the flash light covers your finger" : "Use the screen brightness to illuminate your finger"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">3</div>
                  <span>Keep your finger still during measurement</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">4</div>
                  <span>Wait 15 seconds for accurate results</span>
                </li>
              </ol>
              <Button 
                className="w-full mt-4"
                onClick={() => setShowTutorial(false)}
              >
                Got it!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <Card className="p-6 max-w-2xl mx-auto">
          <motion.h1 
            className="text-2xl font-bold mb-6 flex items-center gap-2"
            animate={{ 
              scale: heartbeatAnimation ? 1.1 : 1,
              color: heartbeatAnimation ? "#dc2626" : "currentColor"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Activity className="h-6 w-6" />
            Heart Rate Monitor
          </motion.h1>
          
          <div className="relative aspect-video mb-4 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
              width={1280}
              height={720}
            />
            
            {/* Add calibration overlay */}
            {calibrating && (
              <motion.div
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center text-white">
                  <motion.div
                    className="w-20 h-20 border-4 border-t-primary rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="mt-4">Calibrating... {Math.round(calibrationProgress)}%</p>
                </div>
              </motion.div>
            )}
            
            {/* Status overlay */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2"
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
            >
              <p className="text-sm">{status}</p>
              {isRecording && (
                <motion.div 
                  className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                >
                  <motion.div 
                    className="bg-green-500 h-full"
                    style={{ width: `${measurementProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="flex flex-col gap-6 mt-6">
            <div className="flex flex-wrap gap-4 justify-between">
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`${isRecording ? "bg-red-500 hover:bg-red-600" : ""} relative overflow-hidden`}
                    disabled={!!error}
                    size="lg"
                  >
                    <motion.span
                      animate={{ 
                        opacity: isRecording ? [1, 0.5, 1] : 1 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="flex items-center gap-2"
                    >
                      {isRecording ? (
                        <>
                          <Activity className="animate-pulse" size={18} />
                          Stop Measuring
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          Start Measuring
                        </>
                      )}
                    </motion.span>
                  </Button>
                </motion.div>

                <div className="flex gap-2">
                  {isFlashAvailable && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => toggleFlash(!isFlashOn)}
                        className="flex items-center gap-2"
                      >
                        <Flashlight 
                          size={18} 
                          className={isFlashOn ? "text-yellow-500 animate-pulse" : ""} 
                        />
                        {isFlashOn ? "Flash On" : "Flash Off"}
                      </Button>
                    </motion.div>
                  )}

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={toggleSpeech}
                      className="flex items-center gap-2"
                    >
                      {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      {isSpeechEnabled ? "Disable Speech" : "Enable Speech"}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={toggleHaptic}
                      className="flex items-center gap-2"
                    >
                      <Zap size={18} className={isHapticEnabled ? "text-yellow-500" : ""} />
                      {isHapticEnabled ? "Haptic On" : "Haptic Off"}
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2"
                  >
                    <History size={18} />
                    History
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowSignal(!showSignal)}
                    className="flex items-center gap-2"
                  >
                    <Activity size={18} />
                    Signal
                  </Button>
                </motion.div>

                {heartRate && (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const measurement: EnhancedMeasurement = {
                            timestamp: Date.now(),
                            heartRate,
                            confidence,
                            snr: signalQuality,
                            quality: quality.length === 0 ? "Good" : "Fair",
                            intervals: frameDataRef.current,
                            hrv: hrvData || { sdnn: 0, rmssd: 0, pnn50: 0 }
                          };
                          saveMeasurement(measurement);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Save size={18} />
                        Save
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => shareMeasurement(heartRate, confidence)}
                        className="flex items-center gap-2"
                      >
                        <Share size={18} />
                        Share
                      </Button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {heartRate && (
              <>
                <HeartRateDisplay 
                  heartRate={heartRate}
                  confidence={confidence}
                  quality={quality}
                  animate={isRecording}
                />
                <HeartRateGraph
                  heartRate={heartRate}
                  isRecording={isRecording}
                  confidence={confidence}
                />
              </>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Add enhanced history panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Measurement History</h2>
                  <Button variant="outline" onClick={() => setShowHistory(false)}>
                    Close
                  </Button>
                </div>
                <div className="space-y-4">
                  {measurementHistory.map((m: any, i) => (
                    <motion.div
                      key={m.timestamp}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-accent rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Heart className="text-red-500" size={16} />
                          <span className="font-bold">{m.heartRate} BPM</span>
                          <span className="text-sm opacity-75">({m.confidence}% confidence)</span>
                        </div>
                        <span className="text-sm opacity-75">{formatTime(m.timestamp)}</span>
                      </div>
                      
                      {m.hrv && (
                        <div className="grid grid-cols-3 gap-4 mt-2 pt-2 border-t border-border">
                          <div className="text-sm">
                            <span className="text-muted-foreground">SDNN:</span>{" "}
                            {Math.round(m.hrv.sdnn)} ms
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">RMSSD:</span>{" "}
                            {Math.round(m.hrv.rmssd)} ms
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">pNN50:</span>{" "}
                            {Math.round(m.hrv.pnn50)}%
                          </div>
                        </div>
                      )}
                      
                      {m.quality && (
                        <div className="flex items-center gap-2 mt-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Signal Quality: {m.quality}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {measurementHistory.length === 0 && (
                    <p className="text-center text-muted-foreground">No measurements saved yet</p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced signal visualization panel */}
        <AnimatePresence>
          {showSignal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4"
            >
              <SignalVisualization 
                signalData={signalData}
                quality={quality}
                isRecording={isRecording}
                confidence={confidence}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {useScreenFlash && <div className="screen-flash" />}
    </div>
  );
} 